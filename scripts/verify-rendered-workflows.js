#!/usr/bin/env node
'use strict';

const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const { createRequire } = require('module');

const ROOT = path.resolve(__dirname, '..');
const MOBILE_VIEWPORT = { width: 390, height: 844 };

const MIME = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function parseArgs(argv) {
  const opts = {
    headed: false,
    keepOpen: false,
    timeoutMs: Number(process.env.TERPTRACK_RENDER_TIMEOUT_MS || 60000),
  };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--headed') {
      opts.headed = true;
    } else if (arg === '--keep-open') {
      opts.keepOpen = true;
    } else if (arg === '--timeout-ms') {
      opts.timeoutMs = Number(argv[++i] || opts.timeoutMs);
    } else if (arg.startsWith('--timeout-ms=')) {
      opts.timeoutMs = Number(arg.slice('--timeout-ms='.length) || opts.timeoutMs);
    } else {
      fail(`Unknown argument: ${arg}`);
    }
  }
  opts.timeoutMs = Number.isFinite(opts.timeoutMs) && opts.timeoutMs > 0 ? opts.timeoutMs : 60000;
  return opts;
}

function loadPlaywright() {
  try {
    return require('playwright');
  } catch {}

  const candidates = [
    process.env.TERPTRACK_NODE_MODULES,
    process.env.NODE_REPL_NODE_MODULE_DIRS,
    path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'),
  ].filter(Boolean).flatMap(value => String(value).split(path.delimiter).filter(Boolean));

  for (const dir of candidates) {
    const pkg = path.join(dir, 'playwright', 'package.json');
    if (!fs.existsSync(pkg)) continue;
    return createRequire(path.join(dir, 'terptrack-workflow-verifier.js'))('playwright');
  }

  fail('Playwright is required. Install it locally, set NODE_PATH, or set TERPTRACK_NODE_MODULES to a node_modules directory that contains playwright.');
}

function safeJoin(root, requestPath) {
  const decoded = decodeURIComponent((requestPath || '/').split('?')[0]);
  const rel = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '');
  const resolved = path.resolve(root, rel);
  if (!resolved.startsWith(root + path.sep) && resolved !== root) return null;
  return resolved;
}

function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      if (req.url === '/api/config') {
        res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
        res.end(JSON.stringify({ supabaseUrl: '', supabaseAnonKey: '' }));
        return;
      }
      if (req.url && req.url.startsWith('/api/umd')) {
        res.writeHead(200, {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store',
          'x-terptrack-proxy': 'umd-io',
          'x-terptrack-upstream-status': 'workflow-fixture',
        });
        res.end('[]');
        return;
      }
      const file = safeJoin(ROOT, req.url);
      if (!file) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }
      fs.readFile(file, (error, body) => {
        if (error) {
          res.writeHead(error.code === 'ENOENT' ? 404 : 500);
          res.end(error.code === 'ENOENT' ? 'Not found' : 'Server error');
          return;
        }
        res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
        res.end(body);
      });
    });
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      resolve({ server, url: `http://127.0.0.1:${address.port}/` });
    });
  });
}

function snapshotScript() {
  return `(() => {
    const modal = document.querySelector('#onboard-modal.open .modal, #settings-modal.open .modal, .modal-backdrop.open .modal');
    const browse = document.querySelector('#view-browse');
    const preview = document.querySelector('#ob-plan-preview');
    const grid = document.querySelector('#br-grid');
    return {
      scripts: Array.from(document.scripts).map(script => script.getAttribute('src')).filter(Boolean),
      styles: Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(link => link.getAttribute('href')),
      onboardText: preview ? preview.textContent.replace(/\\s+/g, ' ').trim() : '',
      browseText: grid ? grid.textContent.replace(/\\s+/g, ' ').trim() : '',
      overflow: {
        document: document.documentElement.scrollWidth > window.innerWidth + 1,
        body: document.body.scrollWidth > window.innerWidth + 1,
        modal: modal ? modal.scrollWidth > modal.clientWidth + 1 : false,
        preview: preview && !preview.hidden ? preview.scrollWidth > preview.clientWidth + 1 : false,
        browse: browse ? browse.scrollWidth > browse.clientWidth + 1 : false,
        grid: grid ? grid.scrollWidth > grid.clientWidth + 1 : false,
      },
    };
  })()`;
}

function assertNoOverflow(label, snapshot) {
  Object.entries(snapshot.overflow || {}).forEach(([key, value]) => {
    assert(!value, `${label}: ${key} has horizontal overflow`);
  });
}

async function openFreshApp(page, url, opts, suffix) {
  await page.goto(`${url}?workflow-verifier=${suffix}`, { waitUntil: 'domcontentloaded', timeout: opts.timeoutMs });
  await page.waitForFunction(() => typeof startOnboarding === 'function' && typeof renderBrowse === 'function', null, { timeout: opts.timeoutMs });
  const snapshot = await page.evaluate(snapshotScript());
  assert(snapshot.styles.includes('styles.css?v=75'), 'workflow app did not load styles.css?v=75');
  assert(snapshot.scripts.includes('js/onboarding.js?v=15'), 'workflow app did not load js/onboarding.js?v=15');
  assert(snapshot.scripts.includes('js/browse.js?v=12'), 'workflow app did not load js/browse.js?v=12');
  return snapshot;
}

async function verifyOnboardingMobile(page, url, opts) {
  await openFreshApp(page, url, opts, 'onboarding');
  await page.evaluate(() => {
    state.onboardingComplete = false;
    state.courses = {};
    state.customCourses = [];
    startOnboarding();
  });
  await page.locator('#onboard-modal.open').waitFor({ state: 'visible', timeout: opts.timeoutMs });
  await page.selectOption('#ob-major', 'STAT');
  await page.fill('#ob-start-year', '2027');
  await page.locator('#ob-next').click({ timeout: opts.timeoutMs });
  await page.fill('#ob-career-goal', 'machine learning for public policy');
  await page.fill('#ob-gened-depts', 'INST, PSYC, GVPT');
  await page.locator('#ob-next').click({ timeout: opts.timeoutMs });
  await page.selectOption('#ob-current-year', '2');
  await page.fill('#ob-grad-year', '2030');
  await page.selectOption('#ob-credit-cap', '16');
  await page.locator('#ob-next').click({ timeout: opts.timeoutMs });
  await page.selectOption('#ob-pref-earliest', '10:00');
  await page.selectOption('#ob-pref-latest', '17:00');
  await page.selectOption('#ob-pref-mode', 'compact');
  await page.locator('.onboard-day-prefs input[value="F"]').check({ timeout: opts.timeoutMs });
  await page.locator('#ob-next').click({ timeout: opts.timeoutMs });
  await page.fill('#ob-transfer-codes', 'MATH140');
  await page.locator('#ob-next').click({ timeout: opts.timeoutMs });
  await page.waitForFunction(() => {
    const text = document.querySelector('#ob-plan-preview')?.textContent?.replace(/\s+/g, ' ') || '';
    return text.includes('Auto Plan Review')
      && text.includes('Statistics')
      && text.includes('Catalog year 2026-2027')
      && text.includes('Schedule defaults');
  }, null, { timeout: opts.timeoutMs });
  const snapshot = await page.evaluate(snapshotScript());
  assert(snapshot.onboardText.includes('after 10:00'), 'onboarding: preview missing schedule preference summary');
  assert(snapshot.onboardText.includes('MATH 140'), 'onboarding: preview missing prior-credit summary');
  assert(snapshot.onboardText.includes('13/13'), 'onboarding: preview missing GenEd coverage');
  assertNoOverflow('onboarding mobile', snapshot);
  console.log('Onboarding [mobile]: rendered personalized finish preview with source metadata and no overflow.');
}

async function verifyBrowseReplacementMobile(page, url, opts) {
  await openFreshApp(page, url, opts, 'browse');
  await page.evaluate(async () => {
    state.onboardingComplete = true;
    state.profilePrefs = {
      interests: ['ai-data'],
      careerGoal: 'public policy analytics',
      genEdDepts: ['GVPT', 'INST'],
    };
    if (document.querySelector('#onboard-modal.open')) document.querySelector('#onboard-modal.open').classList.remove('open');
    browseHydrateAvailability = async () => {};
    placeholderSearchTarget = {
      code: 'GenEd HS-1',
      title: 'History/Social Sciences #1',
      cr: 3,
      semId: 'F28',
      category: 'gened-dshs',
      note: 'DSHS #1',
    };
    placeholderSearchSelectedTags = ['DSHS'];
    placeholderSearchMode = 'all';
    browseDept = 'GVPT';
    browseGenEd = 'DSHS';
    browseSearch = 'GVPT200';
    browseCacheKey = 'GVPT:DSHS:';
    browseCache = [{
      course_id: 'GVPT200',
      name: 'International Political Relations',
      credits: '3',
      description: 'Introduction to international politics, conflict, cooperation, and institutions.',
      gen_ed: [['DSHS']],
      department: 'GVPT',
      average_gpa: 3.18,
    }];
    currentTab = 'browse';
    document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
    document.querySelector('#view-browse')?.classList.add('active');
    document.querySelectorAll('.tab').forEach(tab => tab.classList.toggle('active', tab.dataset.tab === 'browse'));
    await renderBrowse();
  });
  await page.waitForFunction(() => {
    const text = document.querySelector('#br-grid')?.textContent?.replace(/\s+/g, ' ') || '';
    return text.includes('Replacing GenEd HS-1')
      && text.includes('GVPT 200')
      && text.includes('Replace GenEd HS-1')
      && text.includes('Preview')
      && text.includes('Why');
  }, null, { timeout: opts.timeoutMs });
  const snapshot = await page.evaluate(snapshotScript());
  assert(snapshot.browseText.includes('Full results'), 'browse: missing full results section');
  assert(snapshot.browseText.includes('Fills gap'), 'browse: missing GenEd gap evidence');
  assertNoOverflow('browse replacement mobile', snapshot);
  console.log('Browse replacement [mobile]: rendered replacement banner, result card, actions, and no overflow.');
}

async function main() {
  const opts = parseArgs(process.argv);
  const { chromium } = loadPlaywright();
  const { server, url } = await startServer();
  const browser = await chromium.launch({ headless: !opts.headed });
  const consoleErrors = [];
  const pageErrors = [];
  try {
    const context = await browser.newContext({
      viewport: MOBILE_VIEWPORT,
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', error => pageErrors.push(error.message));
    await verifyOnboardingMobile(page, url, opts);
    await verifyBrowseReplacementMobile(page, url, opts);
    assert(!pageErrors.length, `Workflow page errors: ${pageErrors.slice(0, 5).join(' | ')}`);
    assert(!consoleErrors.length, `Workflow console errors: ${consoleErrors.slice(0, 5).join(' | ')}`);
    console.log('Verified rendered mobile onboarding and Browse replacement workflows.');
    if (opts.keepOpen) await page.waitForTimeout(60_000);
  } finally {
    await browser.close().catch(() => {});
    server.close();
  }
}

main().catch(error => {
  console.error(error.stack || error.message || String(error));
  process.exit(1);
});
