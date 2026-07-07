#!/usr/bin/env node
'use strict';

const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const { createRequire } = require('module');

const ROOT = path.resolve(__dirname, '..');
const MOBILE_VIEWPORT = { width: 390, height: 844 };
const DARK_MODE_TABS = [
  { id: 'plan', label: 'Plan' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'audit', label: 'Degree Audit' },
  { id: 'table', label: 'All Courses' },
  { id: 'timeline', label: 'Action Timeline' },
  { id: 'roadmap', label: 'Prereq Roadmap' },
  { id: 'browse', label: 'Browse Courses' },
  { id: 'gened', label: 'Gen-Eds' },
];

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
    const accountModal = document.querySelector('#account-modal.open .modal');
    const browse = document.querySelector('#view-browse');
    const preview = document.querySelector('#ob-plan-preview');
    const grid = document.querySelector('#br-grid');
    const schedule = document.querySelector('#view-schedule');
    const scheduleOutput = document.querySelector('#schedule-output');
    const scheduleMap = document.querySelector('#schedule-readiness-map');
    const advisorPacket = document.querySelector('#schedule-advisor-packet');
    const recommendations = document.querySelector('#reco-container');
    const semesters = document.querySelector('#semesters-container');
    return {
      scripts: Array.from(document.scripts).map(script => script.getAttribute('src')).filter(Boolean),
      styles: Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(link => link.getAttribute('href')),
      onboardText: preview ? preview.textContent.replace(/\\s+/g, ' ').trim() : '',
      planText: semesters ? semesters.textContent.replace(/\\s+/g, ' ').trim() : '',
      accountText: accountModal ? accountModal.textContent.replace(/\\s+/g, ' ').trim() : '',
      browseText: grid ? grid.textContent.replace(/\\s+/g, ' ').trim() : '',
      scheduleText: scheduleOutput ? scheduleOutput.textContent.replace(/\\s+/g, ' ').trim() : '',
      scheduleViewText: schedule ? schedule.textContent.replace(/\\s+/g, ' ').trim() : '',
      scheduleMapText: scheduleMap ? scheduleMap.textContent.replace(/\\s+/g, ' ').trim() : '',
      recoText: recommendations ? recommendations.textContent.replace(/\\s+/g, ' ').trim() : '',
      overflow: {
        document: document.documentElement.scrollWidth > window.innerWidth + 1,
        body: document.body.scrollWidth > window.innerWidth + 1,
        modal: modal ? modal.scrollWidth > modal.clientWidth + 1 : false,
        accountModal: accountModal ? accountModal.scrollWidth > accountModal.clientWidth + 1 : false,
        preview: preview && !preview.hidden ? preview.scrollWidth > preview.clientWidth + 1 : false,
        browse: browse ? browse.scrollWidth > browse.clientWidth + 1 : false,
        grid: grid ? grid.scrollWidth > grid.clientWidth + 1 : false,
        schedule: schedule ? schedule.scrollWidth > schedule.clientWidth + 1 : false,
        scheduleOutput: scheduleOutput ? scheduleOutput.scrollWidth > scheduleOutput.clientWidth + 1 : false,
        scheduleMap: scheduleMap ? scheduleMap.scrollWidth > scheduleMap.clientWidth + 1 : false,
        advisorPacket: advisorPacket ? advisorPacket.scrollWidth > advisorPacket.clientWidth + 1 : false,
        recommendations: recommendations ? recommendations.scrollWidth > recommendations.clientWidth + 1 : false,
        semesters: semesters ? semesters.scrollWidth > semesters.clientWidth + 1 : false,
      },
    };
  })()`;
}

function assertNoOverflow(label, snapshot) {
  Object.entries(snapshot.overflow || {}).forEach(([key, value]) => {
    assert(!value, `${label}: ${key} has horizontal overflow`);
  });
}

function contrastAuditScript(rootSelector = 'body') {
  return `((rootSelector) => {
    function parseColor(value) {
      const match = String(value || '').match(/rgba?\\(([^)]+)\\)/);
      if (!match) return null;
      const parts = match[1].split(',').map(part => Number(part.trim()));
      if (parts.length < 3) return null;
      return { r: parts[0], g: parts[1], b: parts[2], a: parts.length >= 4 ? parts[3] : 1 };
    }
    function blend(top, bottom) {
      const a = top.a == null ? 1 : top.a;
      return {
        r: Math.round(top.r * a + bottom.r * (1 - a)),
        g: Math.round(top.g * a + bottom.g * (1 - a)),
        b: Math.round(top.b * a + bottom.b * (1 - a)),
        a: 1,
      };
    }
    function luminance(color) {
      const vals = [color.r, color.g, color.b].map(value => {
        const s = value / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * vals[0] + 0.7152 * vals[1] + 0.0722 * vals[2];
    }
    function contrast(fg, bg) {
      const l1 = luminance(fg);
      const l2 = luminance(bg);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    }
    function effectiveBackground(element) {
      let bg = parseColor(getComputedStyle(document.body).backgroundColor) || { r: 26, g: 22, b: 18, a: 1 };
      const chain = [];
      let node = element;
      while (node && node.nodeType === 1) {
        chain.push(node);
        node = node.parentElement;
      }
      chain.reverse().forEach(item => {
        const color = parseColor(getComputedStyle(item).backgroundColor);
        if (!color || color.a === 0) return;
        bg = color.a < 1 ? blend(color, bg) : color;
      });
      return bg;
    }
    const root = document.querySelector(rootSelector);
    if (!root) return [{ selector: rootSelector, text: 'missing root', ratio: 0 }];
    return Array.from(root.querySelectorAll('*')).map(element => {
      const rect = element.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2 || rect.bottom < 0 || rect.top > window.innerHeight || rect.right < 0 || rect.left > window.innerWidth) return null;
      const text = (element.innerText || element.textContent || '').replace(/\\s+/g, ' ').trim();
      if (!text || text.length > 160) return null;
      const style = getComputedStyle(element);
      if (style.visibility === 'hidden' || style.display === 'none' || Number(style.opacity) === 0) return null;
      const rawFg = parseColor(style.color);
      const bg = effectiveBackground(element);
      if (!rawFg || !bg) return null;
      const fg = rawFg.a < 1 ? blend(rawFg, bg) : rawFg;
      const ratio = contrast(fg, bg);
      if (ratio >= 4.5) return null;
      return {
        ratio: Number(ratio.toFixed(2)),
        tag: element.tagName.toLowerCase(),
        id: element.id || '',
        className: element.className ? String(element.className).slice(0, 120) : '',
        text: text.slice(0, 90),
        color: style.color,
        background: style.backgroundColor,
      };
    }).filter(Boolean).sort((a, b) => a.ratio - b.ratio).slice(0, 16);
  })(${JSON.stringify(rootSelector)})`;
}

function contrastFailureKey(failure) {
  return [
    failure.tag || '',
    failure.id || '',
    failure.className || '',
    failure.text || '',
    failure.color || '',
    failure.background || '',
  ].join('|');
}

async function collectDarkContrastFailures(page, rootSelector = 'body') {
  const viewport = page.viewportSize() || MOBILE_VIEWPORT;
  const scanMeta = await page.evaluate(() => ({
    scrollHeight: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight, window.innerHeight),
    innerHeight: window.innerHeight,
  }));
  const viewportHeight = Math.max(1, scanMeta.innerHeight || viewport.height || MOBILE_VIEWPORT.height);
  const maxY = Math.max(0, scanMeta.scrollHeight - viewportHeight);
  const step = Math.max(240, Math.floor(viewportHeight * 0.65));
  const positions = [0];
  for (let y = step; y < maxY; y += step) positions.push(y);
  if (!positions.includes(maxY)) positions.push(maxY);

  const failuresByKey = new Map();
  for (const y of positions) {
    await page.evaluate(scrollY => window.scrollTo(0, scrollY), y);
    await page.waitForTimeout(50);
    const failures = await page.evaluate(contrastAuditScript(rootSelector));
    failures.forEach(failure => {
      if (!failuresByKey.has(contrastFailureKey(failure))) {
        failuresByKey.set(contrastFailureKey(failure), { ...failure, scrollY: y });
      }
    });
    if (failuresByKey.size >= 24) break;
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  return Array.from(failuresByKey.values())
    .sort((a, b) => a.ratio - b.ratio)
    .slice(0, 24);
}

async function assertDarkContrast(page, label, rootSelector = 'body', opts = {}) {
  const failures = opts.scroll ? await collectDarkContrastFailures(page, rootSelector) : await page.evaluate(contrastAuditScript(rootSelector));
  assert(!failures.length, `${label}: dark-mode contrast failures ${JSON.stringify(failures)}`);
}

async function activateDarkModeTab(page, tabId, opts) {
  await page.evaluate(async tab => {
    currentTab = tab;
    document.querySelectorAll('.tab').forEach(item => {
      item.classList.toggle('active', item.dataset.tab === tab);
    });
    document.querySelectorAll('.view').forEach(view => {
      view.classList.toggle('active', view.id === `view-${tab}`);
    });
    if (tab === 'plan') render();
    if (tab === 'audit') renderAudit();
    if (tab === 'timeline') renderTimeline();
    if (tab === 'roadmap') renderRoadmap();
    if (tab === 'table') renderTable();
    if (tab === 'schedule' && typeof renderSchedule === 'function') await Promise.resolve(renderSchedule());
    if (tab === 'browse' && typeof renderBrowse === 'function') await Promise.resolve(renderBrowse());
    if (tab === 'gened' && typeof renderGenEdMatrix === 'function') renderGenEdMatrix();
  }, tabId);
  await page.locator(`#view-${tabId}.active`).waitFor({ state: 'visible', timeout: opts.timeoutMs });
  await page.waitForTimeout(100);
  await page.evaluate(() => window.scrollTo(0, 0));
}

async function assertDarkModeTabSweep(page, opts) {
  const scanned = [];
  for (const tab of DARK_MODE_TABS) {
    await activateDarkModeTab(page, tab.id, opts);
    await assertDarkContrast(page, `dark ${tab.label} tab mobile`, 'body', { scroll: true });
    scanned.push(tab.label);
  }
  return scanned;
}

async function openFreshApp(page, url, opts, suffix) {
  await page.goto(`${url}?workflow-verifier=${suffix}`, { waitUntil: 'domcontentloaded', timeout: opts.timeoutMs });
  await page.waitForFunction(() => typeof startOnboarding === 'function' && typeof renderBrowse === 'function', null, { timeout: opts.timeoutMs });
  const snapshot = await page.evaluate(snapshotScript());
  assert(snapshot.styles.includes('styles.css?v=122'), 'workflow app did not load styles.css?v=122');
  assert(snapshot.scripts.includes('js/schedule.js?v=73'), 'workflow app did not load js/schedule.js?v=73');
  assert(snapshot.scheduleViewText.includes('Solver breadth'), 'workflow app did not render the schedule solver breadth preference');
  assert(snapshot.scripts.includes('js/timeline.js?v=27'), 'workflow app did not load js/timeline.js?v=27');
  assert(snapshot.scripts.includes('js/io.js?v=13'), 'workflow app did not load js/io.js?v=13');
  assert(snapshot.scripts.includes('js/recommendations.js?v=18'), 'workflow app did not load js/recommendations.js?v=18');
  assert(snapshot.scripts.includes('js/courses.js?v=5'), 'workflow app did not load js/courses.js?v=5');
  assert(snapshot.scripts.includes('js/onboarding.js?v=19'), 'workflow app did not load js/onboarding.js?v=19');
  assert(snapshot.scripts.includes('js/browse.js?v=19'), 'workflow app did not load js/browse.js?v=19');
  assert(snapshot.scripts.includes('js/dnd.js?v=2'), 'workflow app did not load js/dnd.js?v=2');
  assert(snapshot.scripts.includes('js/state.js?v=24'), 'workflow app did not load js/state.js?v=24');
  assert(snapshot.scripts.includes('js/render.js?v=3'), 'workflow app did not load js/render.js?v=3');
  assert(snapshot.scripts.includes('js/share.js?v=17'), 'workflow app did not load js/share.js?v=17');
  assert(snapshot.scripts.includes('js/prereq-resolver.js?v=1'), 'workflow app did not load js/prereq-resolver.js?v=1');
  assert(snapshot.scripts.includes('js/bulk.js?v=1'), 'workflow app did not load js/bulk.js?v=1');
  assert(snapshot.scripts.includes('js/placeholder-search.js?v=12'), 'workflow app did not load js/placeholder-search.js?v=12');
  assert(snapshot.scripts.includes('js/snapshots.js?v=12'), 'workflow app did not load js/snapshots.js?v=12');
  assert(snapshot.scripts.includes('js/account.js?v=17'), 'workflow app did not load js/account.js?v=17');
  return snapshot;
}

async function verifyDarkModeContrastMobile(page, url, opts) {
  await openFreshApp(page, url, opts, 'dark-contrast');
  await page.evaluate(() => {
    state.theme = 'dark';
    state.onboardingComplete = false;
    saveState();
    applyTheme();
    startOnboarding();
  });
  await page.locator('#onboard-modal.open').waitFor({ state: 'visible', timeout: opts.timeoutMs });
  await assertDarkContrast(page, 'dark onboarding mobile', '#onboard-modal');
  await page.locator('#ob-skip').click({ timeout: opts.timeoutMs });
  await page.locator('#onboard-modal.open').waitFor({ state: 'hidden', timeout: opts.timeoutMs });
  await assertDarkContrast(page, 'dark main mobile');
  await page.locator('#settings-btn').click({ timeout: opts.timeoutMs });
  await page.locator('#settings-modal.open').waitFor({ state: 'visible', timeout: opts.timeoutMs });
  await assertDarkContrast(page, 'dark settings mobile', '#settings-modal');
  const snapshot = await page.evaluate(snapshotScript());
  assertNoOverflow('dark settings mobile', snapshot);
  await page.evaluate(() => {
    closeSettings();
    state.theme = 'dark';
    state.onboardingComplete = true;
    saveState();
    applyTheme();
    render();
  });
  const scannedTabs = await assertDarkModeTabSweep(page, opts);
  console.log(`Dark mode [mobile]: onboarding, Settings, and ${scannedTabs.join(', ')} passed scroll-aware visible text contrast with no overflow.`);
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
  await page.selectOption('#ob-major', 'AOSC');
  await page.fill('#ob-start-year', '2027');
  await page.selectOption('#ob-catalog-year', '2024-2025');
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
    return (text.includes('Auto Plan Review') || text.includes('Curated plan ready'))
      && text.includes('Atmospheric')
      && text.includes('Catalog year')
      && text.includes('2024-2025')
      && text.includes('Catalog target 2024-2025')
      && text.includes('linked source 2026-2027')
      && text.includes('Schedule defaults');
  }, null, { timeout: opts.timeoutMs });
  const snapshot = await page.evaluate(snapshotScript());
  assert(snapshot.onboardText.includes('after 10:00'), 'onboarding: preview missing schedule preference summary');
  assert(snapshot.onboardText.includes('MATH 140'), 'onboarding: preview missing prior-credit summary');
  assert(snapshot.onboardText.includes('GenEd / I-Series Coverage') && snapshot.onboardText.includes('DSSP 2/2'), 'onboarding: preview missing GenEd coverage');
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
    state.activeSchedule = [{
      id: 'F28',
      name: 'Fall 2028',
      year: 'Year 3',
      courses: [{
        code: 'GenEd HS-1',
        title: 'History/Social Sciences #1',
        cr: 3,
        semId: 'F28',
        category: 'gened-dshs',
        categories: ['gened-dshs'],
        note: 'DSHS #1',
      }, {
        code: 'Free Elective #1',
        title: 'Free Elective 1',
        cr: 3,
        kind: 'tech',
        category: 'elective',
        note: 'Profile elective placeholder',
      }],
    }];
    state.customCourses = [];
    if (document.querySelector('#onboard-modal.open')) document.querySelector('#onboard-modal.open').classList.remove('open');
    browseHydrateAvailability = async () => {};
    umdioListCoursesByDept = async dept => {
      if (dept === 'INST') {
        return [{
          course_id: 'INST201',
          name: 'Finding Information',
          credits: '3',
          description: 'Profile-aligned information studies elective.',
          gen_ed: [],
          department: 'INST',
        }];
      }
      return [];
    };
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
      && text.includes('Replacement queue')
      && text.includes('GVPT 200')
      && text.includes('GenEd HS-1')
      && text.includes('Fill 1 slot')
      && text.includes('Replace GenEd HS-1')
      && text.includes('Preview')
      && text.includes('Why');
  }, null, { timeout: opts.timeoutMs });
  const snapshot = await page.evaluate(snapshotScript());
  assert(snapshot.browseText.includes('Full results'), 'browse: missing full results section');
  assert(snapshot.browseText.includes('Fills gap'), 'browse: missing GenEd gap evidence');
  assert(snapshot.browseText.includes('Replacement queue'), 'browse: missing replacement queue');
  assertNoOverflow('browse replacement mobile', snapshot);
  await page.locator('button:has-text("Fill 1 slot")').click({ timeout: opts.timeoutMs });
  await page.waitForFunction(() => {
    const codes = state.activeSchedule?.[0]?.courses?.map(course => course.code) || [];
    const change = state.recentChanges?.[0] || {};
    return codes.includes('GVPT 200')
      && !codes.includes('GenEd HS-1')
      && change.source === 'Browse replacement queue';
  }, null, { timeout: opts.timeoutMs });
  const fillResult = await page.evaluate(() => ({
    codes: state.activeSchedule[0].courses.map(course => course.code),
    change: state.recentChanges[0] || null,
  }));
  assert(fillResult.codes.includes('GVPT 200') && fillResult.codes.includes('Free Elective #1'), 'browse queue fill: should replace the matched GenEd slot and leave unmatched free elective unresolved');
  assert(fillResult.change?.type === 'placeholder-replacement' && fillResult.change?.source === 'Browse replacement queue', 'browse queue fill: should record a queue-sourced placeholder replacement');
  await page.waitForFunction(() => {
    const text = document.querySelector('#br-grid')?.textContent?.replace(/\s+/g, ' ') || '';
    return text.includes('Free Elective #1') && text.includes('Find + fill');
  }, null, { timeout: opts.timeoutMs });
  await page.locator('button:has-text("Find + fill")').click({ timeout: opts.timeoutMs });
  await page.waitForFunction(() => {
    const codes = state.activeSchedule?.[0]?.courses?.map(course => course.code) || [];
    const change = state.recentChanges?.[0] || {};
    return codes.includes('INST 201')
      && !codes.includes('Free Elective #1')
      && change.source === 'Browse auto-resolver';
  }, null, { timeout: opts.timeoutMs });
  const autoResult = await page.evaluate(() => ({
    codes: state.activeSchedule[0].courses.map(course => course.code),
    change: state.recentChanges[0] || null,
  }));
  assert(autoResult.codes.includes('GVPT 200') && autoResult.codes.includes('INST 201'), 'browse auto resolver: should preserve prior queue fill and resolve the remaining profile elective');
  assert(autoResult.change?.type === 'placeholder-replacement' && autoResult.change?.source === 'Browse auto-resolver', 'browse auto resolver: should record an automatic resolver replacement');

  await page.evaluate(async () => {
    window.__browseAllDeptCalls = [];
    umdioListCoursesByGenEd = async (tag, opts = {}) => {
      window.__browseAllDeptCalls.push(`gened:${tag}:${opts.dept || ''}`);
      return [{
        course_id: 'HIST210',
        name: 'Global Humanities',
        credits: '3',
        description: 'Humanities course available outside profile departments.',
        gen_ed: [[tag]],
        department: 'HIST',
      }];
    };
    state.profilePrefs = normalizeProfilePrefs({});
    browseDept = BROWSE_ALL_DEPTS_VALUE;
    browseGenEd = 'DSHU';
    browseSearch = '';
    browseCache = [];
    browseCacheKey = '';
    await renderBrowse();
  });
  await page.waitForFunction(() => {
    const text = document.querySelector('#br-grid')?.textContent?.replace(/\s+/g, ' ') || '';
    return text.includes('HIST 210') && text.includes('Global Humanities');
  }, null, { timeout: opts.timeoutMs });
  const allDeptResult = await page.evaluate(() => ({
    hasOption: Array.from(document.querySelectorAll('#br-dept option'))
      .some(option => option.value === BROWSE_ALL_DEPTS_VALUE && /All departments/.test(option.textContent || '')),
    selected: document.querySelector('#br-dept')?.value || '',
    hintText: document.querySelector('#br-profile-hints')?.textContent?.replace(/\s+/g, ' ').trim() || '',
    calls: window.__browseAllDeptCalls || [],
    text: document.querySelector('#br-grid')?.textContent?.replace(/\s+/g, ' ').trim() || '',
  }));
  assert(allDeptResult.hasOption, 'browse all departments: department selector should include All departments');
  assert(allDeptResult.selected === '__ALL_DEPTS__', 'browse all departments: selector should preserve the broad scope');
  assert(/GenEd search scope/.test(allDeptResult.hintText) && /All departments/.test(allDeptResult.hintText), 'browse all departments: scope toggle should stay visible for GenEd search');
  assert(/Search every department/.test(allDeptResult.hintText), 'browse all departments: scope toggle should explain broad GenEd search without a profile');
  assert(allDeptResult.calls.includes('gened:DSHU:'), 'browse all departments: should call GenEd search without a department');
  assert(!allDeptResult.calls.includes('gened:DSHU:GVPT'), 'browse all departments: should not stay limited to profile departments');
  assert(allDeptResult.text.includes('HIST 210'), 'browse all departments: broad GenEd search should render global results');
  const allDeptSnapshot = await page.evaluate(snapshotScript());
  assertNoOverflow('browse all departments mobile', allDeptSnapshot);
  console.log('Browse replacement [mobile]: rendered replacement banner, replacement queue, queue fill, auto-resolver fill, result card, all-department GenEd search, actions, and no overflow.');
}

async function verifyRecommendationsSectionMobile(page, url, opts) {
  await openFreshApp(page, url, opts, 'recommendations');
  await page.evaluate(() => {
    document.querySelector('#onboard-modal')?.classList.remove('open');
    state.onboardingComplete = true;
    state.activeSchedule = [{
      id: 'PASS100F',
      name: 'Pass 100 Fall',
      year: 'Year 1',
      courses: [{
        code: 'CMSC 131',
        title: 'Object-Oriented Programming I',
        cr: 4,
        prereqs: [],
        kind: 'core',
        category: 'major-core',
      }, {
        code: 'ENGL 101',
        title: 'Academic Writing',
        cr: 3,
        prereqs: [],
        kind: 'gened',
        category: 'gened-fspw',
      }],
    }, {
      id: 'PASS100S',
      name: 'Pass 100 Spring',
      year: 'Year 1',
      courses: [{
        code: 'CMSC 132',
        title: 'Object-Oriented Programming II',
        cr: 4,
        prereqs: ['CMSC 131'],
        kind: 'core',
        category: 'major-core',
      }, {
        code: 'MATH 140',
        title: 'Calculus I',
        cr: 4,
        prereqs: [],
        kind: 'core',
        category: 'gened-fsma',
      }],
    }];
    state.customSemesters = [];
    state.customCourses = [];
    state.courses = { 'CMSC 131': { status: 'passed', grade: 'A' } };
    state.schedulePrefs = { PASS100F: { term: '202608' } };
    state.recentChanges = [];
    scheduleSectionsCache['PASS100F:202608:CMSC132'] = [{
      section_id: 'CMSC132-0101',
      semester: '202608',
      number: '0101',
      instructors: ['Grace Hopper'],
      meetings: [{ days: 'MW', start_time: '10:30am', end_time: '11:45am', building: 'IRB', room: '1201' }],
      open_seats: '9',
      seats: '30',
      waitlist: '0',
    }];
    scheduleSectionsCache['PASS100F:202608:MATH140'] = [];
    currentTab = 'plan';
    document.querySelectorAll('.view').forEach(view => view.classList.toggle('active', view.id === 'view-plan'));
    document.querySelectorAll('.tab').forEach(tab => tab.classList.toggle('active', tab.dataset.tab === 'plan'));
    render();
  });
  await page.waitForFunction(() => {
    const text = document.querySelector('#reco-container')?.textContent?.replace(/\s+/g, ' ') || '';
    return text.includes('Smart next picks')
      && text.includes('CMSC 132')
      && text.includes('Pick best')
      && text.includes('Term impact')
      && text.includes('Fix before registration')
      && text.includes('Schedule');
  }, null, { timeout: opts.timeoutMs });
  await page.locator('#reco-container .reco-pick:has-text("CMSC 132") button:has-text("Pick best")').click({ timeout: opts.timeoutMs });
  await page.waitForFunction(() => {
    const text = document.querySelector('#reco-container')?.textContent?.replace(/\s+/g, ' ') || '';
    const selected = state.selectedSections?.PASS100F?.CMSC132;
    return text.includes('CMSC 132') && text.includes('Pick best') && selected?.section_id === 'CMSC132-0101';
  }, null, { timeout: opts.timeoutMs });
  const result = await page.evaluate(() => ({
    fallCodes: state.activeSchedule[0].courses.map(course => course.code),
    springCodes: state.activeSchedule[1].courses.map(course => course.code),
    selected: state.selectedSections?.PASS100F?.CMSC132 || null,
    change: state.recentChanges[0] || null,
  }));
  assert(result.fallCodes.includes('CMSC 132'), 'recommendations: moved course should be in current term');
  assert(!result.springCodes.includes('CMSC 132'), 'recommendations: moved course should leave future term');
  assert(result.selected?.section_id === 'CMSC132-0101', 'recommendations: best section should be saved for the current term');
  assert(result.change?.type === 'section-pick' && result.change?.source === 'Smart next picks', 'recommendations: section pick should record a Smart next picks change');
  const snapshot = await page.evaluate(snapshotScript());
  assert(snapshot.recoText.includes('Pick best'), 'recommendations: rendered panel should keep direct section action visible');
  assert(snapshot.recoText.includes('Term impact') && snapshot.recoText.includes('Fix before registration'), 'recommendations: rendered panel should show section-pick readiness impact');
  assert(snapshot.planText.includes('CMSC 132') && snapshot.planText.includes('0101') && snapshot.planText.includes('9 open'), 'recommendations: Plan row should show picked section and seat status');
  assertNoOverflow('recommendations section mobile', snapshot);
  console.log('Recommendations [mobile]: rendered Smart next pick section action with term readiness impact, moved a ready course, saved a posted section, and no overflow.');
}

async function verifyAccountSetupMobile(page, url, opts) {
  await openFreshApp(page, url, opts, 'account');
  await page.evaluate(() => {
    localStorage.removeItem(ACCOUNT_CONFIG_STORAGE);
    accountResetConfigCache();
    state.onboardingComplete = true;
    state.accountPrefs = normalizeAccountPrefs({
      ...defaultAccountPrefs(),
      displayName: '',
      friendInviteEmail: '',
      friendInviteNote: '',
      friendInvites: [],
    });
    document.querySelector('#onboard-modal')?.classList.remove('open');
    saveState();
    accountRenderTopbar();
  });
  await page.locator('#account-btn').click({ timeout: opts.timeoutMs });
  await page.waitForFunction(() => {
    const text = document.querySelector('#account-modal.open')?.textContent?.replace(/\s+/g, ' ') || '';
    return text.includes('Cloud config')
      && text.includes('Cloud setup')
      && text.includes('SUPABASE_URL')
      && text.includes('Schema objects')
      && text.includes('2026-07-02-grants-v1')
      && text.includes('Migration note')
      && text.includes('Data API grants')
      && text.includes('friend_requests')
      && text.includes('shared_plans')
      && text.includes('Copy schema SQL')
      && text.includes('Student profile')
      && text.includes('Friends & shared plans')
      && text.includes('Needs config');
  }, null, { timeout: opts.timeoutMs });
  const emailDisabled = await page.locator('#account-email').evaluate(input => input.disabled);
  const syncDisabled = await page.locator('button:has-text("Sync requests")').evaluate(button => button.disabled);
  assert(emailDisabled, 'account setup: sign-in email should be disabled without cloud config');
  assert(syncDisabled, 'account setup: cloud friend sync should be disabled without sign-in');

  await page.fill('#account-display-name', 'Pass 98 Student');
  await page.locator('button:has-text("Save profile")').click({ timeout: opts.timeoutMs });
  await page.waitForFunction(() => document.querySelector('#account-status')?.textContent?.includes('Profile saved locally.'), null, { timeout: opts.timeoutMs });
  await page.fill('#account-friend-email', 'roommate@umd.edu');
  await page.fill('#account-friend-note', 'review cmsc plan');
  await page.locator('button:has-text("Add invite")').click({ timeout: opts.timeoutMs });
  await page.waitForFunction(() => {
    const modalText = document.querySelector('#account-modal.open')?.textContent?.replace(/\s+/g, ' ') || '';
    const status = document.querySelector('#account-status')?.textContent || '';
    return status.includes('Friend invite saved locally.')
      && modalText.includes('Friend invite')
      && modalText.includes('roommate@umd.edu')
      && modalText.includes('review cmsc plan');
  }, null, { timeout: opts.timeoutMs });
  await page.evaluate(() => {
    state.activeSchedule = [{
      id: 'F26',
      name: 'Fall 2026',
      courses: [
        { code: 'MATH 140', title: 'Calculus I', cr: 4 },
        { code: 'CMSC 131', title: 'Object-Oriented Programming I', cr: 4 },
      ],
    }];
    state.selectedSections = {
      F26: {
        MATH140: {
          course: 'MATH 140',
          section_id: 'MATH140-0101',
          number: '0101',
          semester: '202608',
          meetings: [{ days: 'M', start_time: '10:00am', end_time: '10:50am', building: 'IRB', room: '1101' }],
        },
      },
    };
    accountFriendProfiles = {
      'friend-pal': { user_id: 'friend-pal', display_name: 'Pal', major_name: 'Mathematics' },
    };
    accountFriendPlans = [{
      id: 'pal-plan',
      owner_id: 'friend-pal',
      name: 'Pal STEM plan',
      updated_at: '2026-07-01T12:00:00.000Z',
      payload: {
        state: {
          v: 1,
          activeSchedule: [{
            id: 'F26',
            name: 'Fall 2026',
            courses: [
              { code: 'MATH 140', title: 'Calculus I', cr: 4 },
              { code: 'ENGL 101', title: 'Academic Writing', cr: 3 },
            ],
          }, {
            id: 'S27',
            name: 'Spring 2027',
            courses: [
              { code: 'HIST 201', title: 'History of Modern Science', cr: 3 },
            ],
          }],
          customCourses: [],
          customSemesters: [],
          selectedSections: {
            F26: {
              MATH140: {
                course: 'MATH 140',
                section_id: 'MATH140-0201',
                number: '0201',
                semester: '202608',
                meetings: [{ days: 'M', start_time: '10:30am', end_time: '11:20am', building: 'IRB', room: '1201' }],
              },
              ENGL101: {
                course: 'ENGL 101',
                section_id: 'ENGL101-0101',
                number: '0101',
                semester: '202608',
                meetings: [{ days: 'Tu', start_time: '9:30am', end_time: '10:45am', building: 'TWS', room: '0201' }],
              },
            },
            S27: {
              HIST201: {
                course: 'HIST 201',
                section_id: 'HIST201-0101',
                number: '0101',
                semester: '202701',
                meetings: [
                  { days: 'M', start_time: '10:10am', end_time: '10:40am', building: 'TWS', room: '1101' },
                  { days: 'M', start_time: '12:00pm', end_time: '1:15pm', building: 'TWS', room: '1101' },
                ],
              },
            },
          },
          settings: { ...DEFAULT_SETTINGS, programName: 'Mathematics' },
          profilePrefs: defaultProfilePrefs(),
        },
      },
    }];
    window.__accountDeletedFriendRow = '';
    accountSession = { user: { id: 'recipient-1', email: 'recipient@umd.edu' } };
    accountEnsureClient = async () => ({
      from(table) {
        return {
          delete() {
            return {
              eq(field, value) {
                window.__accountDeletedFriendRow = `${table}:${field}:${value}`;
                return { error: null };
              },
            };
          },
        };
      },
    });
    state.accountPrefs = normalizeAccountPrefs({
      ...getAccountPrefs(),
      friendInvites: [
        ...(getAccountPrefs().friendInvites || []),
        {
          id: 'local-accepted',
          cloudId: 'cloud-accepted',
          email: 'requester@umd.edu',
          userId: 'friend-pal',
          note: 'shared schedule',
          status: 'accepted',
          direction: 'received',
          source: 'cloud',
          createdAt: '2026-07-02T12:00:00.000Z',
          updatedAt: '2026-07-02T12:30:00.000Z',
        },
      ],
    });
    saveState();
    renderAccountModal();
  });
  await page.waitForFunction(() => {
    const modalText = document.querySelector('#account-modal.open')?.textContent?.replace(/\s+/g, ' ') || '';
    return modalText.includes('Pal STEM plan')
      && modalText.includes('3 courses')
      && modalText.includes('3 picked sections')
      && modalText.includes('1 shared courses')
      && modalText.includes('Fall 2026 meeting term')
      && modalText.includes('1 meeting overlaps')
      && modalText.includes('MATH 140 with your MATH 140 M 10:30am-10:50am')
      && modalText.includes('Shared free windows')
      && modalText.includes('Mon 8:00am-10:00am')
      && modalText.includes('Meeting planner')
      && modalText.includes('Mon 12:00pm-1:15pm')
      && modalText.includes('Copy meeting note')
      && modalText.includes('Remove friend');
  }, null, { timeout: opts.timeoutMs });
  await page.locator('button:has-text("Remove friend")').click({ timeout: opts.timeoutMs });
  await page.waitForFunction(() => {
    const modalText = document.querySelector('#account-modal.open')?.textContent?.replace(/\s+/g, ' ') || '';
    const status = document.querySelector('#account-status')?.textContent || '';
    return window.__accountDeletedFriendRow === 'friend_requests:id:cloud-accepted'
      && status.includes('Friend removed')
      && status.includes('revoked')
      && !modalText.includes('requester@umd.edu');
  }, null, { timeout: opts.timeoutMs });
  await page.locator('button:has-text("Copy meeting note")').click({ timeout: opts.timeoutMs });
  await page.waitForFunction(() => {
    const status = document.querySelector('#account-status')?.textContent || '';
    return status.includes('Meeting note');
  }, null, { timeout: opts.timeoutMs });

  const snapshot = await page.evaluate(snapshotScript());
  const prefs = await page.evaluate(() => getAccountPrefs());
  const deletedFriendRow = await page.evaluate(() => window.__accountDeletedFriendRow || '');
  assert(prefs.displayName === 'Pass 98 Student', 'account setup: profile display name should persist locally');
  assert((prefs.friendInvites || []).some(invite => invite.email === 'roommate@umd.edu'), 'account setup: friend invite should persist locally');
  assert(!(prefs.friendInvites || []).some(invite => invite.cloudId === 'cloud-accepted'), 'account setup: accepted cloud friend should be removed after revocation');
  assert(deletedFriendRow === 'friend_requests:id:cloud-accepted', 'account setup: accepted friend removal should delete the cloud friend request row');
  assert(snapshot.accountText.includes('Local only'), 'account setup: modal should identify local-only config');
  assert(snapshot.accountText.includes('Schema objects') && snapshot.accountText.includes('2026-07-02-grants-v1') && snapshot.accountText.includes('Data API grants') && snapshot.accountText.includes('RLS policies'), 'account setup: modal should show versioned schema checklist');
  assert(snapshot.accountText.includes('Friend invite') && snapshot.accountText.includes('roommate@umd.edu'), 'account setup: modal should preserve local invite row');
  assert(snapshot.accountText.includes('Pal STEM plan') && snapshot.accountText.includes('meeting overlaps'), 'account setup: modal should show friend-plan comparison');
  assert(snapshot.accountText.includes('Fall 2026 meeting term') && !snapshot.accountText.includes('HIST 201 with your'), 'account setup: friend meeting planner should stay scoped to the shared UMD term');
  assert(snapshot.accountText.includes('Shared free windows') && snapshot.accountText.includes('Mon 8:00am-10:00am'), 'account setup: modal should show shared free windows');
  assert(snapshot.accountText.includes('Meeting planner') && snapshot.accountText.includes('Mon 12:00pm-1:15pm'), 'account setup: modal should show meeting planner recommendation');
  assert(snapshot.accountText.includes('Meeting note'), 'account setup: modal should expose copied meeting note status');
  assertNoOverflow('account setup mobile', snapshot);
  console.log('Account setup [mobile]: rendered local-first cloud checklist, profile save, friend invite, accepted-friend revocation, friend-plan meeting planner, and no overflow.');
}

async function verifyScheduleAlternativesMobile(page, url, opts) {
  await openFreshApp(page, url, opts, 'schedule-alternatives');
  await page.evaluate(async () => {
    const cmsc0101 = {
      course: 'CMSC 131',
      section_id: 'CMSC131-0101',
      semester: '202608',
      number: '0101',
      instructors: ['Ada Lovelace'],
      meetings: [{ days: 'MWF', start_time: '9:00am', end_time: '9:50am', building: 'IRB', room: '1101' }],
      open_seats: '8',
      seats: '24',
      waitlist: '0',
    };
    const cmsc0201 = {
      course: 'CMSC 131',
      section_id: 'CMSC131-0201',
      semester: '202608',
      number: '0201',
      instructors: ['Grace Hopper'],
      meetings: [{ days: 'TuTh', start_time: '11:00am', end_time: '12:15pm', building: 'IRB', room: '1201' }],
      open_seats: '20',
      seats: '32',
      waitlist: '0',
    };
    const math0101 = {
      course: 'MATH 140',
      section_id: 'MATH140-0101',
      semester: '202608',
      number: '0101',
      instructors: ['Katherine Johnson'],
      meetings: [{ days: 'MWF', start_time: '9:30am', end_time: '10:20am', building: 'MTH', room: '0101' }],
      open_seats: '4',
      seats: '30',
      waitlist: '0',
    };
    const math0201 = {
      course: 'MATH 140',
      section_id: 'MATH140-0201',
      semester: '202608',
      number: '0201',
      instructors: ['Sofya Kovalevskaya'],
      meetings: [{ days: 'TuTh', start_time: '9:30am', end_time: '10:45am', building: 'MTH', room: '0201' }],
      open_seats: '18',
      seats: '30',
      waitlist: '0',
    };
    const engl0101 = {
      course: 'ENGL 101',
      section_id: 'ENGL101-0101',
      semester: '202608',
      number: '0101',
      instructors: ['Juan Felipe'],
      meetings: [{ days: 'MWF', start_time: '10:00am', end_time: '10:50am', building: 'TWS', room: '0201' }],
      open_seats: '6',
      seats: '20',
      waitlist: '0',
    };
    const engl0201 = {
      course: 'ENGL 101',
      section_id: 'ENGL101-0201',
      semester: '202608',
      number: '0201',
      instructors: ['Pauli Murray'],
      meetings: [{ days: 'MWF', start_time: '12:00pm', end_time: '12:50pm', building: 'TWS', room: '1200' }],
      open_seats: '14',
      seats: '20',
      waitlist: '0',
    };
    document.querySelector('#onboard-modal')?.classList.remove('open');
    state.onboardingComplete = true;
    state.majorId = 'CMSC';
    state.settings = normalizeSettings({
      ...DEFAULT_SETTINGS,
      programName: 'Schedule Alternatives Fixture',
      totalCredits: 120,
    });
    state.activeSchedule = [{
      id: 'ALTF',
      name: 'Fall 2026',
      year: 'Year 1',
      courses: [
        { code: 'CMSC 131', title: 'Object-Oriented Programming I', cr: 4, kind: 'core', category: 'major-core' },
        { code: 'MATH 140', title: 'Calculus I', cr: 4, kind: 'core', category: 'gened-fsma' },
        { code: 'ENGL 101', title: 'Academic Writing', cr: 3, kind: 'gened', category: 'gened-fspw' },
      ],
    }];
    state.customSemesters = [];
    state.customCourses = [];
    state.courses = {};
    state.selectedSections = {
      ALTF: {
        CMSC131: cmsc0101,
        MATH140: math0101,
        ENGL101: engl0101,
      },
    };
    state.schedulePrefs = {
      ALTF: {
        ...DEFAULT_SCHEDULE_PREFS,
        term: '202608',
        earliest: '08:00',
        latest: '17:00',
        minBreak: 15,
        mode: 'balanced',
        solverBreadth: 'standard',
        calendarStart: '2026-09-02',
        calendarEnd: '2026-12-14',
      },
    };
    state.recentChanges = [];
    state.scheduleOutputOptions = { preferences: true, warnings: true, unscheduled: true, recentChanges: true, auditIssues: true };
    schedulePostedTerms = ['202608'];
    scheduleCurrentSemId = 'ALTF';
    scheduleSectionsCache[scheduleSectionCacheKey('ALTF', '202608', 'CMSC 131')] = [cmsc0101, cmsc0201];
    scheduleSectionsCache[scheduleSectionCacheKey('ALTF', '202608', 'MATH 140')] = [math0101, math0201];
    scheduleSectionsCache[scheduleSectionCacheKey('ALTF', '202608', 'ENGL 101')] = [engl0101, engl0201];
    const fetchedAt = new Date(Date.now() - (2 * 60 * 1000)).toISOString();
    scheduleSectionsMeta[scheduleSectionCacheKey('ALTF', '202608', 'CMSC 131')] = { fetchedAt, source: 'fixture', count: 2 };
    scheduleSectionsMeta[scheduleSectionCacheKey('ALTF', '202608', 'MATH 140')] = { fetchedAt, source: 'fixture', count: 2 };
    scheduleSectionsMeta[scheduleSectionCacheKey('ALTF', '202608', 'ENGL 101')] = { fetchedAt, source: 'fixture', count: 2 };
    currentTab = 'schedule';
    document.querySelectorAll('.view').forEach(view => view.classList.toggle('active', view.id === 'view-schedule'));
    document.querySelectorAll('.tab').forEach(tab => tab.classList.toggle('active', tab.dataset.tab === 'schedule'));
    await renderSchedule();
  });
  await page.waitForFunction(() => {
    const text = document.querySelector('#schedule-output')?.textContent?.replace(/\s+/g, ' ') || '';
    const listText = document.querySelector('#schedule-section-list')?.textContent?.replace(/\s+/g, ' ') || '';
    return text.includes('Schedule Output')
      && text.includes('Registration Readiness')
      && text.includes('Generate alternatives')
      && text.includes('3/3 picked')
      && text.includes('conflict')
      && listText.includes('CMSC 131')
      && listText.includes('MATH 140')
      && listText.includes('ENGL 101');
  }, null, { timeout: opts.timeoutMs });
  await page.locator('#schedule-alternatives-btn').click({ timeout: opts.timeoutMs });
  await page.waitForFunction(() => {
    const text = document.querySelector('#schedule-alternatives')?.textContent?.replace(/\s+/g, ' ') || '';
    const status = document.querySelector('#schedule-status')?.textContent?.replace(/\s+/g, ' ') || '';
    return document.querySelectorAll('.alt-card').length >= 2
      && text.includes('Alternate schedules')
      && text.includes('Option 1')
      && text.includes('Rank #1')
      && text.includes('Why this option')
      && text.includes('Solver trace')
      && text.includes('Standard breadth')
      && text.includes('section option')
      && text.includes('96-schedule beam cap')
      && status.includes('6 sections loaded')
      && status.includes('Standard breadth');
  }, null, { timeout: opts.timeoutMs });
  const generated = await page.evaluate(() => ({
    cardCount: document.querySelectorAll('.alt-card').length,
    text: document.querySelector('#schedule-alternatives')?.textContent?.replace(/\s+/g, ' ').trim() || '',
    status: document.querySelector('#schedule-status')?.textContent?.replace(/\s+/g, ' ').trim() || '',
    firstMeta: scheduleAlternatives?.[0]?.solverMeta || null,
    firstSignature: scheduleAlternatives?.[0]?.signature || '',
  }));
  assert(generated.cardCount >= 2, 'schedule alternatives: should render multiple ranked option cards');
  assert(generated.firstMeta?.rank === 1 && generated.firstMeta?.breadthLabel === 'Standard', 'schedule alternatives: first candidate should expose rank and Standard breadth metadata');
  assert(generated.firstMeta?.consideredSectionTotal === 6 && generated.firstMeta?.beamWidth === 96, 'schedule alternatives: solver metadata should expose section count and beam cap');
  assert(/Ranked #1/.test(generated.text) && /Searched 3 courses across 6 section options/.test(generated.text), 'schedule alternatives: visible card should explain ranked solver search breadth');
  assert(/Examined/.test(generated.text) && /96-schedule beam cap/.test(generated.text), 'schedule alternatives: visible card should explain placement count and beam cap');
  assert(generated.status.includes('6 section options checked'), 'schedule alternatives: status line should summarize solver trace');
  const generatedSnapshot = await page.evaluate(snapshotScript());
  assertNoOverflow('schedule alternatives mobile', generatedSnapshot);

  await page.locator('.alt-card').first().locator('.alt-apply').click({ timeout: opts.timeoutMs });
  await page.waitForFunction(() => {
    const picked = [
      getSelectedSection('ALTF', 'CMSC 131')?.section_id || '',
      getSelectedSection('ALTF', 'MATH 140')?.section_id || '',
      getSelectedSection('ALTF', 'ENGL 101')?.section_id || '',
    ];
    const change = (state.recentChanges || [])[0] || {};
    const undo = document.querySelector('#schedule-undo')?.textContent?.replace(/\s+/g, ' ') || '';
    return picked.every(Boolean)
      && picked.join('|') !== 'CMSC131-0101|MATH140-0101|ENGL101-0101'
      && /Applied alternate schedule 1/.test(change.title || '')
      && undo.includes('Applied alternate schedule 1')
      && undo.includes('Undo restores');
  }, null, { timeout: opts.timeoutMs });
  const applied = await page.evaluate(() => ({
    picked: [
      getSelectedSection('ALTF', 'CMSC 131')?.section_id || '',
      getSelectedSection('ALTF', 'MATH 140')?.section_id || '',
      getSelectedSection('ALTF', 'ENGL 101')?.section_id || '',
    ],
    change: (state.recentChanges || [])[0] || null,
    undo: document.querySelector('#schedule-undo')?.textContent?.replace(/\s+/g, ' ').trim() || '',
    outputText: document.querySelector('#schedule-output')?.textContent?.replace(/\s+/g, ' ').trim() || '',
  }));
  assert(applied.picked.length === 3 && applied.picked.every(Boolean), 'schedule alternatives: applying an option should save all three section picks');
  assert(applied.change?.type === 'auto-pick' && applied.change?.source === 'Schedule', 'schedule alternatives: applying an option should record a Schedule change');
  assert(/Applied alternate schedule 1/.test(applied.undo), 'schedule alternatives: applying an option should expose undo controls');
  assert(/Sections:/.test((applied.change?.highlights || []).join(' ')), 'schedule alternatives: recorded change should include applied section IDs');
  assert(/Registration Readiness/.test(applied.outputText), 'schedule alternatives: rendered output should refresh after applying an option');

  await page.locator('[data-schedule-undo]').click({ timeout: opts.timeoutMs });
  await page.waitForFunction(() => {
    const picked = [
      getSelectedSection('ALTF', 'CMSC 131')?.section_id || '',
      getSelectedSection('ALTF', 'MATH 140')?.section_id || '',
      getSelectedSection('ALTF', 'ENGL 101')?.section_id || '',
    ];
    const change = (state.recentChanges || [])[0] || {};
    return picked.join('|') === 'CMSC131-0101|MATH140-0101|ENGL101-0101'
      && /Undid alternate schedule 1/.test(change.title || '');
  }, null, { timeout: opts.timeoutMs });
  const undoSnapshot = await page.evaluate(snapshotScript());
  assertNoOverflow('schedule alternatives undo mobile', undoSnapshot);
  console.log('Schedule alternatives [mobile]: rendered ranked solver trace cards, applied a generated option, restored prior picks with undo, and no overflow.');
}

async function verifyAdvisorPacketMobile(page, url, opts) {
  await openFreshApp(page, url, opts, 'advisor-packet');
  await page.evaluate(async () => {
    const cmscSection = {
      section_id: 'CMSC131-0101',
      semester: '202608',
      number: '0101',
      instructors: ['Ada Lovelace'],
      meetings: [{ days: 'MW', start_time: '9:00am', end_time: '10:15am', building: 'IRB', room: '1101' }],
      open_seats: '12',
      seats: '24',
      waitlist: '0',
      restrictions: ['Restricted to Computer Science majors or permission of department.'],
    };
    const mathSection = {
	      section_id: 'MATH140-0201',
	      semester: '202608',
	      number: '0201',
	      instructors: ['Katherine Johnson'],
	      meetings: [{ days: 'TuTh', start_time: '11:00am', end_time: '12:15pm', building: 'CSI', room: '2110' }],
	      open_seats: '0',
	      seats: '30',
	      waitlist: '4',
    };
    const mathBackup = {
      section_id: 'MATH140-0301',
      semester: '202608',
      number: '0301',
      instructors: ['Sofya Kovalevskaya'],
      meetings: [{ days: 'TuTh', start_time: '1:00pm', end_time: '2:15pm', building: 'CSI', room: '2110' }],
      open_seats: '18',
      seats: '30',
      waitlist: '0',
    };
    const englSection = {
      section_id: 'ENGL101-0301',
      semester: '202608',
      number: '0301',
      instructors: ['Juan Felipe'],
      meetings: [{ days: 'MWF', start_time: '1:00pm', end_time: '1:50pm', building: 'TWS', room: '1200' }],
      open_seats: '4',
      seats: '19',
      waitlist: '0',
    };
    const cmsc132Section = {
      section_id: 'CMSC132-0101',
      semester: '202701',
      number: '0101',
      instructors: ['Grace Hopper'],
      meetings: [{ days: 'TuTh', start_time: '10:00am', end_time: '11:15am', building: 'IRB', room: '1207' }],
      open_seats: '16',
      seats: '32',
      waitlist: '0',
    };
    const commSection = {
      section_id: 'COMM107-0201',
      semester: '202701',
      number: '0201',
      instructors: ['Pauli Murray'],
      meetings: [{ days: 'MWF', start_time: '12:00pm', end_time: '12:50pm', building: 'KEY', room: '0103' }],
      open_seats: '12',
      seats: '24',
      waitlist: '0',
    };
    state.onboardingComplete = true;
    document.querySelector('#onboard-modal')?.classList.remove('open');
    state.majorId = 'CMSC';
    state.settings = normalizeSettings({
      ...DEFAULT_SETTINGS,
      programName: 'Pass 98 Computer Science',
      catalogYear: '2024-2025',
      totalCredits: 120,
    });
    state.activeSchedule = [{
      id: 'PASS98F',
      name: 'Fall 2026',
	      year: 'Year 1',
	      courses: [
	        { code: 'CMSC 131', title: 'Object-Oriented Programming I', cr: 4, kind: 'core', category: 'major-core', coreqs: ['CMSC 100'] },
	        { code: 'MATH 140', title: 'Calculus I', cr: 4, kind: 'core', category: 'gened-fsma', prereqs: ['MATH 115'] },
	        { code: 'ENGL 101', title: 'Academic Writing', cr: 3, kind: 'gened', category: 'gened-fspw' },
        { code: 'GenEd DSHU', title: 'Humanities placeholder', cr: 3, kind: 'gened', category: 'gened-dshu', categories: ['gened-dshu'], note: 'Auto-generated DSHU placeholder' },
      ],
    }, {
      id: 'PASS98S',
      name: 'Spring 2027',
      year: 'Year 1',
      courses: [
        { code: 'CMSC 132', title: 'Object-Oriented Programming II', cr: 4, kind: 'core', category: 'major-core', prereqs: ['CMSC 131'] },
        { code: 'COMM 107', title: 'Oral Communication', cr: 3, kind: 'gened', category: 'gened-fsoc' },
      ],
    }];
    state.customCourses = [];
    state.courses = {};
    state.selectedSections = {
      PASS98F: {
        CMSC131: cmscSection,
        MATH140: mathSection,
      },
    };
    state.schedulePrefs = {
      PASS98F: {
        ...DEFAULT_SCHEDULE_PREFS,
        term: '202608',
        earliest: '09:00',
        latest: '17:00',
        minBreak: 15,
        mode: 'compact',
        campusZone: 'north',
        calendarStart: '2026-09-02',
        calendarEnd: '2026-12-14',
        registrationDate: '2099-08-25',
        registrationTime: '09:30',
        blocked: [{ id: 'pass98-work', day: 'F', start: '12:00', end: '13:00', label: 'Work' }],
      },
    };
    state.scheduleOutputOptions = { preferences: true, warnings: true, unscheduled: true, recentChanges: true, auditIssues: true };
    state.scheduleAdvisorFilter = 'all';
    state.scheduleOutputPreset = 'personal';
    state.recentChanges = [{
      id: 'pass98-section-pick',
      type: 'section-pick',
      source: 'Schedule',
      title: 'Picked CMSC 131 0101',
      detail: 'CMSC 131 added to Fall 2026.',
      meta: 'Fall 2026',
      at: '2026-07-01T12:00:00.000Z',
    }];
    scheduleSectionsCache['PASS98F:202608:CMSC131'] = [cmscSection];
    scheduleSectionsCache['PASS98F:202608:MATH140'] = [mathSection, mathBackup];
    scheduleSectionsCache['PASS98F:202608:ENGL101'] = [englSection];
    const sectionMetaNow = Date.now();
    scheduleSectionsMeta[scheduleSectionCacheKey('PASS98F', '202608', 'CMSC 131')] = { fetchedAt: new Date(sectionMetaNow - (3 * 60 * 1000)).toISOString(), source: 'fixture', count: 1 };
    scheduleSectionsMeta[scheduleSectionCacheKey('PASS98F', '202608', 'MATH 140')] = { fetchedAt: new Date(sectionMetaNow - (90 * 60 * 1000)).toISOString(), source: 'fixture', count: 2 };
    scheduleSectionsMeta[scheduleSectionCacheKey('PASS98F', '202608', 'ENGL 101')] = { fetchedAt: new Date(sectionMetaNow - (3 * 60 * 1000)).toISOString(), source: 'fixture', count: 1 };
    const originalUmdioFetchSections = umdioFetchSections;
    umdioFetchSections = async (code, term) => {
      const norm = normalizeCode(code);
      if (String(term) === '202701' && norm === 'CMSC132') return [cmsc132Section];
      if (String(term) === '202701' && norm === 'COMM107') return [commSection];
      return originalUmdioFetchSections(code, term);
    };
    schedulePostedTerms = ['202608', '202701'];
    scheduleCurrentSemId = 'PASS98F';
    currentTab = 'schedule';
    document.querySelectorAll('.view').forEach(view => view.classList.toggle('active', view.id === 'view-schedule'));
    document.querySelectorAll('.tab').forEach(tab => tab.classList.toggle('active', tab.dataset.tab === 'schedule'));
    await renderSchedule();
  });
  await page.waitForFunction(() => {
    const text = document.querySelector('#schedule-output')?.textContent?.replace(/\s+/g, ' ') || '';
    const sectionText = document.querySelector('#schedule-section-list')?.textContent?.replace(/\s+/g, ' ') || '';
    const mapText = document.querySelector('#schedule-readiness-map')?.textContent?.replace(/\s+/g, ' ') || '';
    return text.includes('Schedule Output')
      && mapText.includes('Readiness Map')
      && mapText.includes('0/2 active terms registration-ready')
      && mapText.includes('Fall 2026')
      && mapText.includes('Spring 2027')
      && mapText.includes('2/3')
      && mapText.includes('3/3')
      && mapText.includes('Needs sections')
      && mapText.includes('Load map data')
      && text.includes('Advisor Packet')
      && text.includes('Download registration list')
      && text.includes('Download calendar')
      && text.includes('Download advisor packet')
	      && text.includes('Registration Readiness')
	      && text.includes('Credits')
	      && text.includes('12-credit')
	      && text.includes('Prereqs')
	      && text.includes('MATH 115')
	      && text.includes('Coreqs')
	      && text.includes('CMSC 100')
	      && text.includes('Eligibility')
	      && text.includes('Computer Science majors')
      && text.includes('Plan Readiness Map')
      && text.includes('0/2 terms registration-ready')
      && text.includes('Registration Appointment')
      && text.includes('Aug 25, 2099 at 9:30am')
	      && text.includes('Seat Data Freshness')
	      && text.includes('Refresh seats')
	      && text.includes('Refresh sections now')
	      && text.includes('Waitlist Strategy')
	      && text.includes('4 waitlisted')
	      && text.includes('Calendar Export')
	      && text.includes('Calendar incomplete')
	      && text.includes('calendar events')
	      && text.includes('omitted courses')
	      && text.includes('Auto-fill timed sections')
	      && text.includes('Review omitted courses')
	      && text.includes('Sep 2, 2026 to Dec 14, 2026')
	      && text.includes('Final Registration Checklist')
	      && text.includes('Fix before Testudo')
	      && text.includes('launch checks ready')
	      && text.includes('Workload Balance')
	      && text.includes('Review workload')
	      && text.includes('weekly in-class time')
	      && text.includes('Testudo Entry Queue')
      && text.includes('Section ID MATH140-0201')
      && text.includes('Enrollment Order')
	      && text.includes('Use backup, waitlist, or alternate')
      && text.includes('Backup Plan')
      && text.includes('Backup 0301')
      && text.includes('Fix before registration')
      && text.includes('Recommended fixes')
      && text.includes('Pick sections for ENGL 101')
      && text.includes('Quick actions')
      && text.includes('Auto-pick sections')
      && text.includes('Generate alternatives')
      && text.includes('Review section picks')
      && text.includes('Confirm 2024-2025 catalog requirements')
      && text.includes('ENGL 101 needs a section choice')
	      && text.includes('MATH 140 0201: 0 open')
	      && text.includes('4 waitlisted')
	      && text.includes('Pick a backup section or alternate course before registration')
      && sectionText.includes('Backup option')
      && sectionText.includes('Check eligibility')
      && sectionText.includes('0301')
      && sectionText.includes('Apply backup')
      && text.includes('Apply ready backups')
      && text.includes('Picked CMSC 131 0101');
  }, null, { timeout: opts.timeoutMs });
  await page.locator('[data-schedule-map-load]').click({ timeout: opts.timeoutMs });
  await page.waitForFunction(() => {
    const spring = document.querySelector('[data-schedule-jump-sem="PASS98S"]')?.textContent?.replace(/\s+/g, ' ') || '';
    const loadBtn = document.querySelector('[data-schedule-map-load]');
    const pickBtn = document.querySelector('[data-schedule-map-pick]');
    return loadBtn?.disabled
      && !pickBtn?.disabled
      && spring.includes('Spring 2027')
      && spring.includes('0/2')
      && spring.includes('2/2');
  }, null, { timeout: opts.timeoutMs });
  await page.locator('[data-schedule-map-pick]').click({ timeout: opts.timeoutMs });
  await page.waitForFunction(() => {
    const spring = document.querySelector('[data-schedule-jump-sem="PASS98S"]')?.textContent?.replace(/\s+/g, ' ') || '';
    const undo = document.querySelector('#schedule-undo')?.textContent?.replace(/\s+/g, ' ') || '';
    const pickedCmsc = getSelectedSection('PASS98S', 'CMSC 132')?.section_id || '';
    const pickedComm = getSelectedSection('PASS98S', 'COMM 107')?.section_id || '';
    const change = (state.recentChanges || [])[0] || {};
    return pickedCmsc === 'CMSC132-0101'
      && pickedComm === 'COMM107-0201'
      && /Auto-picked 2 map sections/.test(change.title || '')
      && undo.includes('Auto-picked 2 Readiness Map sections')
      && undo.includes('Undo restores previous picks')
      && spring.includes('2/2')
      && spring.includes('Review');
  }, null, { timeout: opts.timeoutMs });
  await page.locator('[data-schedule-jump-sem="PASS98S"]').click({ timeout: opts.timeoutMs });
  await page.waitForFunction(() => {
    const sem = document.querySelector('#schedule-semester')?.value || '';
    const mapText = document.querySelector('#schedule-readiness-map')?.textContent?.replace(/\s+/g, ' ') || '';
    return sem === 'PASS98S'
      && scheduleCurrentSemId === 'PASS98S'
      && mapText.includes('Spring 2027')
      && mapText.includes('2/2')
      && mapText.includes('Review');
  }, null, { timeout: opts.timeoutMs });
  await page.locator('[data-schedule-undo]').click({ timeout: opts.timeoutMs });
  await page.waitForFunction(() => {
    const mapText = document.querySelector('#schedule-readiness-map')?.textContent?.replace(/\s+/g, ' ') || '';
    const pickedCmsc = getSelectedSection('PASS98S', 'CMSC 132');
    const pickedComm = getSelectedSection('PASS98S', 'COMM 107');
    const change = (state.recentChanges || [])[0] || {};
    return !pickedCmsc
      && !pickedComm
      && /Undid Readiness Map auto-pick/.test(change.title || '')
      && mapText.includes('Spring 2027')
      && mapText.includes('0/2')
      && mapText.includes('Needs sections');
  }, null, { timeout: opts.timeoutMs });
  await page.locator('[data-schedule-jump-sem="PASS98F"]').click({ timeout: opts.timeoutMs });
  await page.waitForFunction(() => document.querySelector('#schedule-semester')?.value === 'PASS98F' && scheduleCurrentSemId === 'PASS98F', null, { timeout: opts.timeoutMs });
  await page.locator('[data-calendar-export-action="auto-fill-omissions"]').first().click({ timeout: opts.timeoutMs });
  await page.waitForFunction(() => {
    const output = document.querySelector('#schedule-output');
    const text = output?.textContent?.replace(/\s+/g, ' ') || '';
    const picked = getSelectedSection('PASS98F', 'ENGL 101')?.section_id || '';
    const undo = document.querySelector('#schedule-undo')?.textContent?.replace(/\s+/g, ' ') || '';
    const change = (state.recentChanges || [])[0] || {};
    return output?.dataset.lastCalendarAction === 'auto-fill-omissions'
      && picked === 'ENGL101-0301'
      && text.includes('Calendar ready')
      && text.includes('3/3')
      && undo.includes('Auto-filled 1 calendar section')
      && /Auto-filled 1 calendar omitted section/.test(change.title || '');
  }, null, { timeout: opts.timeoutMs });
  await page.locator('[data-schedule-undo]').click({ timeout: opts.timeoutMs });
  await page.waitForFunction(() => {
    const output = document.querySelector('#schedule-output');
    const text = output?.textContent?.replace(/\s+/g, ' ') || '';
    const picked = getSelectedSection('PASS98F', 'ENGL 101');
    const change = (state.recentChanges || [])[0] || {};
    return !picked
      && text.includes('Calendar incomplete')
      && text.includes('1 course still needs a section')
      && /Undid calendar auto-fill/.test(change.title || '');
  }, null, { timeout: opts.timeoutMs });
  await page.locator('#schedule-clear').click({ timeout: opts.timeoutMs });
  await page.waitForFunction(() => {
    const output = document.querySelector('#schedule-output');
    const text = output?.textContent?.replace(/\s+/g, ' ') || '';
    const undo = document.querySelector('#schedule-undo')?.textContent?.replace(/\s+/g, ' ') || '';
    const pickedCmsc = getSelectedSection('PASS98F', 'CMSC 131');
    const pickedMath = getSelectedSection('PASS98F', 'MATH 140');
    const change = (state.recentChanges || [])[0] || {};
    return !pickedCmsc
      && !pickedMath
      && text.includes('0/3 picked')
      && undo.includes('Cleared 2 section picks')
      && /Cleared section picks/.test(change.title || '');
  }, null, { timeout: opts.timeoutMs });
  await page.locator('[data-schedule-undo]').click({ timeout: opts.timeoutMs });
  await page.waitForFunction(() => {
    const output = document.querySelector('#schedule-output');
    const text = output?.textContent?.replace(/\s+/g, ' ') || '';
    const pickedCmsc = getSelectedSection('PASS98F', 'CMSC 131')?.section_id || '';
    const pickedMath = getSelectedSection('PASS98F', 'MATH 140')?.section_id || '';
    const change = (state.recentChanges || [])[0] || {};
    return pickedCmsc === 'CMSC131-0101'
      && pickedMath === 'MATH140-0201'
      && text.includes('1 course still needs a section')
      && /Undid clear section picks/.test(change.title || '');
  }, null, { timeout: opts.timeoutMs });
  await page.locator('[data-calendar-export-action="review-omissions"]').first().click({ timeout: opts.timeoutMs });
  await page.waitForFunction(() => {
    const output = document.querySelector('#schedule-output');
    const panel = document.querySelector('.schedule-sections');
    const omitted = [...document.querySelectorAll('.section-pick')]
      .find(pick => (pick.dataset.code || '') === 'ENGL 101');
    return output?.dataset.lastCalendarAction === 'review-omissions'
      && panel?.classList.contains('readiness-focus')
      && omitted?.classList.contains('calendar-omission-focus');
  }, null, { timeout: opts.timeoutMs });
  await page.locator('[data-readiness-action="review-sections"]').first().click({ timeout: opts.timeoutMs });
  await page.waitForFunction(() => {
    const output = document.querySelector('#schedule-output');
    const panel = document.querySelector('.schedule-sections');
    return output?.dataset.lastReadinessAction === 'review-sections'
      && panel?.classList.contains('readiness-focus');
  }, null, { timeout: opts.timeoutMs });
  await page.locator('[data-schedule-output="registration-download"]').click({ timeout: opts.timeoutMs });
  await page.waitForFunction(() => document.querySelector('#schedule-output')?.dataset.lastAction === 'registration-download', null, { timeout: opts.timeoutMs });
  await page.locator('[data-schedule-output="calendar-download"]').click({ timeout: opts.timeoutMs });
  await page.waitForFunction(() => document.querySelector('#schedule-output')?.dataset.lastAction === 'calendar-download', null, { timeout: opts.timeoutMs });
  await page.waitForFunction(() => [...document.querySelectorAll('.toast')]
    .some(toast => /planned course is omitted/.test(toast.textContent || '')), null, { timeout: opts.timeoutMs });
  await page.locator('[data-advisor-filter="blockers"]').click({ timeout: opts.timeoutMs });
  await page.waitForFunction(() => {
    const active = document.querySelector('[data-advisor-filter="blockers"]');
    const text = document.querySelector('#schedule-output')?.textContent?.replace(/\s+/g, ' ') || '';
    return active?.classList.contains('active')
      && active.getAttribute('aria-pressed') === 'true'
      && text.includes('Registration Blockers')
      && text.includes('Locked courses, unscheduled current-term courses');
  }, null, { timeout: opts.timeoutMs });
  await page.locator('[data-schedule-output="advisor-download"]').click({ timeout: opts.timeoutMs });
  await page.waitForFunction(() => document.querySelector('#schedule-output')?.dataset.lastAction === 'advisor-download', null, { timeout: opts.timeoutMs });

  const result = await page.evaluate(() => ({
    outputText: document.querySelector('#schedule-output')?.textContent?.replace(/\s+/g, ' ').trim() || '',
    advisorFilter: scheduleOutputCache?.advisorFilter || '',
    advisorFilename: scheduleOutputCache?.advisorFilename || '',
    advisorDocument: scheduleOutputCache?.advisorDocument || '',
    advisorText: scheduleOutputCache?.advisorText || '',
	    registrationAppointment: scheduleOutputCache?.registrationAppointment || null,
		    seatFreshness: scheduleOutputCache?.seatFreshness || null,
		    waitlistStrategy: scheduleOutputCache?.waitlistStrategy || null,
		    registrationHandoff: scheduleOutputCache?.registrationHandoff || [],
	    registrationBackupPlan: scheduleOutputCache?.registrationBackupPlan || [],
	    finalChecklist: scheduleOutputCache?.finalChecklist || null,
	    workloadBalance: scheduleOutputCache?.workloadBalance || null,
	    registrationFilename: scheduleOutputCache?.registrationFilename || '',
    registrationText: scheduleOutputCache?.registrationText || '',
    calendarFilename: scheduleOutputCache?.calendarFilename || '',
    calendarEventCount: scheduleOutputCache?.calendarEventCount || 0,
    calendarSummary: scheduleOutputCache?.calendarSummary || null,
    calendarText: scheduleOutputCache?.calendar || '',
    calendarStartInput: document.querySelector('#schedule-calendar-start')?.value || '',
    calendarEndInput: document.querySelector('#schedule-calendar-end')?.value || '',
    registrationDateInput: document.querySelector('#schedule-registration-date')?.value || '',
    registrationTimeInput: document.querySelector('#schedule-registration-time')?.value || '',
    lastAction: document.querySelector('#schedule-output')?.dataset.lastAction || '',
    lastCalendarAction: document.querySelector('#schedule-output')?.dataset.lastCalendarAction || '',
    toastText: [...document.querySelectorAll('.toast')].map(toast => toast.textContent || '').join(' | '),
  }));
  assert(result.advisorFilter === 'blockers', 'advisor packet: blocker filter should persist after click');
  assert(result.lastAction === 'advisor-download', 'advisor packet: download action should be recorded');
  assert(result.lastCalendarAction === 'review-omissions', 'advisor packet: calendar omission action should be recorded');
  assert(/^terp-track-advisor-.*\.html$/i.test(result.advisorFilename), 'advisor packet: export filename should be an HTML advisor packet');
  assert(/^terp-track-registration-.*fall-2026\.txt$/i.test(result.registrationFilename), 'advisor packet: registration export should have a term-specific .txt filename');
  assert(/Terp Track Registration List/.test(result.registrationText) && /Testudo checklist/.test(result.registrationText), 'advisor packet: registration export should identify Testudo checklist');
  assert(/CMSC 131 \| Section 0101 \| Section ID CMSC131-0101/.test(result.registrationText), 'advisor packet: registration export should include picked section IDs');
  assert(/Suggested enrollment order:[\s\S]*1\. MATH 140 0201/.test(result.registrationText), 'advisor packet: registration export should include ranked enrollment order');
	  assert(result.registrationAppointment?.label === 'Scheduled' && /Aug 25, 2099 at 9:30am/.test(result.registrationAppointment.when), 'advisor packet: output cache should include registration appointment');
	  assert(result.seatFreshness?.level === 'danger' && result.seatFreshness.rows.some(row => row.code === 'MATH 140' && row.level === 'danger'), 'advisor packet: output cache should include stale seat freshness');
		  assert(result.finalChecklist?.label === 'Fix before Testudo' && result.finalChecklist?.readyCount === 1 && result.finalChecklist?.total === 8, 'advisor packet: output cache should include final checklist status');
			  assert(result.finalChecklist?.items?.some(item => item.id === 'credits' && item.level === 'warn' && /12-credit/.test(item.detail)), 'advisor packet: output cache should include credit-load warning');
		  assert(result.finalChecklist?.items?.some(item => item.id === 'waitlist' && item.level === 'warn' && /waitlist strategy/i.test(item.detail)), 'advisor packet: output cache should include waitlist strategy warning');
		  assert(result.workloadBalance?.label === 'Review workload' && result.workloadBalance?.pickedCredits === 8 && result.workloadBalance?.totalCredits === 11 && result.workloadBalance?.missingCount === 1, 'advisor packet: output cache should include workload balance');
		  assert(result.waitlistStrategy?.level === 'warn' && result.waitlistStrategy.rows.some(row => row.courseCode === 'MATH 140' && row.waitlistCount === 4 && row.backupId === 'MATH140-0301'), 'advisor packet: output cache should include waitlist backup strategy');
	  assert(result.registrationHandoff[0]?.courseCode === 'MATH 140' && result.registrationHandoff[0]?.sectionId === 'MATH140-0201', 'advisor packet: output cache should include ordered Testudo queue section ID');
  assert(result.registrationDateInput === '2099-08-25' && result.registrationTimeInput === '09:30', 'advisor packet: registration appointment inputs should render saved values');
  assert(/Registration appointment: Scheduled - Aug 25, 2099 at 9:30am/.test(result.registrationText), 'advisor packet: registration export should include appointment summary');
	  assert(/Seat data freshness:[\s\S]*MATH 140: 1 hr 30 min ago/.test(result.registrationText), 'advisor packet: registration export should include seat freshness');
	  assert(/Waitlist strategy:[\s\S]*MATH 140 0201: 0 open.*4 waitlisted[\s\S]*Backup ID MATH140-0301/.test(result.registrationText), 'advisor packet: registration export should include waitlist strategy');
	  assert(/Workload balance:[\s\S]*8\/11 credits/.test(result.registrationText), 'advisor packet: registration export should include workload balance');
	  assert(/Prereqs: MATH 140: missing MATH 115/.test(result.registrationText), 'advisor packet: registration export should include missing prerequisite notes');
	  assert(/Coreqs: CMSC 131:[^\n]*CMSC 100/.test(result.registrationText), 'advisor packet: registration export should include missing corequisite notes');
	  assert(/Eligibility: Restricted to Computer Science majors/.test(result.registrationText), 'advisor packet: registration export should include section eligibility notes');
  assert(/Action: Refresh sections in Terp Track shortly before opening Testudo/.test(result.registrationText), 'advisor packet: registration export should include seat-refresh action guidance');
  assert(/Plan readiness map:[\s\S]*Fall 2026 \(Fall 2026\): Needs sections[\s\S]*Spring 2027 \(Spring 2027\): Needs sections/.test(result.registrationText), 'advisor packet: registration export should include plan-wide readiness rows');
  assert(/Testudo entry queue:[\s\S]*1\. MATH 140 0201 \| Section ID: MATH140-0201/.test(result.registrationText), 'advisor packet: registration export should include Testudo queue');
	  assert(result.registrationBackupPlan[0]?.backupId === 'MATH140-0301', 'advisor packet: output cache should include backup section ID');
	  assert(/MATH 115/.test(result.registrationHandoff[0]?.prereqDetail || ''), 'advisor packet: output cache should include missing prerequisite detail');
	  assert(result.registrationHandoff.some(row => row.courseCode === 'CMSC 131' && /CMSC 100/.test(row.coreqDetail || '')), 'advisor packet: output cache should include missing corequisite detail');
	  assert(result.registrationHandoff.some(row => row.courseCode === 'CMSC 131' && row.status === 'blocked' && /Computer Science majors/.test(row.eligibilityDetail || '')), 'advisor packet: output cache should block restricted sections until eligibility is confirmed');
  assert(/Backup ID: MATH140-0301/.test(result.registrationText), 'advisor packet: registration export should include backup ID in Testudo queue');
  assert(/Backup sections:[\s\S]*MATH 140 primary 0201:[\s\S]*Backup: 0301; Section ID MATH140-0301/.test(result.registrationText), 'advisor packet: registration export should include backup section handoff');
  assert(/Missing section picks:[\s\S]*ENGL 101/.test(result.registrationText), 'advisor packet: registration export should include missing picks');
  assert(/^terp-track-calendar-.*fall-2026\.ics$/i.test(result.calendarFilename), 'advisor packet: calendar export should have an .ics filename');
  assert(result.calendarEventCount === 4, 'advisor packet: calendar export should include four timed class events');
  assert(result.calendarSummary?.label === 'Calendar incomplete' && result.calendarSummary?.eventCount === 4, 'advisor packet: output cache should include calendar omission summary');
  assert(result.calendarSummary?.windowLabel === 'Sep 2, 2026 to Dec 14, 2026' && result.calendarSummary?.timedCourseCount === 2 && result.calendarSummary?.courseCount === 3 && result.calendarSummary?.missingCount === 1, 'advisor packet: calendar readiness should expose range and omitted planned-course coverage');
  assert(/BEGIN:VCALENDAR/.test(result.calendarText) && /SUMMARY:CMSC 131 0101/.test(result.calendarText), 'advisor packet: calendar export should include picked section events');
  assert(result.calendarStartInput === '2026-09-02' && result.calendarEndInput === '2026-12-14', 'advisor packet: calendar date inputs should render saved custom range');
  assert(/DTSTART;TZID=America\/New_York:20260902T090000/.test(result.calendarText), 'advisor packet: calendar export should include configured Fall 2026 class dates');
  assert(/Calendar range set in Terp Track: 2026-09-02 to 2026-12-14/.test(result.calendarText), 'advisor packet: calendar export should include custom date-range note');
  assert(/schedule-advisor-catalog-warning/.test(result.advisorDocument), 'advisor packet: exported HTML should include catalog warning markup');
  assert(/schedule-advisor-readiness-map/.test(result.advisorDocument) && /Plan Readiness Map/.test(result.advisorDocument), 'advisor packet: exported HTML should include plan-wide readiness map');
  assert(/Registration Blockers/.test(result.advisorDocument), 'advisor packet: exported HTML should include blocker view heading');
	  assert(/Registration Readiness/.test(result.advisorDocument) && /Fix before registration/.test(result.advisorDocument), 'advisor packet: exported HTML should include registration readiness gates');
	  assert(/Prereqs:[\s\S]*MATH 115/.test(result.advisorDocument), 'advisor packet: exported HTML should include prerequisite notes');
	  assert(/Coreqs:[\s\S]*CMSC 100/.test(result.advisorDocument), 'advisor packet: exported HTML should include corequisite notes');
	  assert(/Eligibility:[\s\S]*Computer Science majors/.test(result.advisorDocument), 'advisor packet: exported HTML should include section eligibility notes');
	  assert(/Final Registration Checklist/.test(result.advisorDocument) && /schedule-final-checklist/.test(result.advisorDocument), 'advisor packet: exported HTML should include final checklist');
	  assert(/Workload Balance/.test(result.advisorDocument) && /schedule-workload-card/.test(result.advisorDocument), 'advisor packet: exported HTML should include workload balance');
	  assert(/Registration Appointment/.test(result.advisorDocument) && /Aug 25, 2099 at 9:30am/.test(result.advisorDocument), 'advisor packet: exported HTML should include appointment');
	  assert(/Seat Data Freshness/.test(result.advisorDocument) && /Refresh seats/.test(result.advisorDocument), 'advisor packet: exported HTML should include seat freshness');
	  assert(/Waitlist Strategy/.test(result.advisorDocument) && /schedule-waitlist-strategy/.test(result.advisorDocument) && /4 waitlisted/.test(result.advisorDocument), 'advisor packet: exported HTML should include waitlist strategy');
  assert(/schedule-calendar-export/.test(result.advisorDocument) && /Calendar Export/.test(result.advisorDocument) && /calendar events/.test(result.advisorDocument) && /data-calendar-export-action="auto-fill-omissions"/.test(result.advisorDocument) && /data-calendar-export-action="review-omissions"/.test(result.advisorDocument), 'advisor packet: exported HTML should include calendar omission actions');
  assert(/data-seat-freshness-action="refresh"/.test(result.advisorDocument), 'advisor packet: exported HTML should include seat refresh action');
  assert(/Testudo Entry Queue/.test(result.advisorDocument) && /Section ID MATH140-0201/.test(result.advisorDocument), 'advisor packet: exported HTML should include Testudo queue');
  assert(/Enrollment Order/.test(result.advisorDocument) && /MATH 140 0201/.test(result.advisorDocument), 'advisor packet: exported HTML should include enrollment order');
  assert(/Backup Plan/.test(result.advisorDocument) && /Backup 0301/.test(result.advisorDocument), 'advisor packet: exported HTML should include backup plan');
  assert(/Recommended fixes/.test(result.advisorDocument) && /Pick sections for ENGL 101/.test(result.advisorDocument), 'advisor packet: exported HTML should include readiness fix guidance');
  assert(/Quick actions/.test(result.advisorDocument) && /data-readiness-action="auto-pick"/.test(result.advisorDocument), 'advisor packet: exported HTML should include readiness quick actions');
	  assert(/MATH 140 0201: 0 open[\s\S]*4 waitlisted/.test(result.advisorDocument) && /backup section|backup 0301/i.test(result.advisorDocument), 'advisor packet: exported HTML should include waitlist backup warning');
  assert(/Catalog-year verification/.test(result.advisorText), 'advisor packet: exported text should include catalog-year verification');
  assert(/Plan readiness map:[\s\S]*Summary: 0\/2 terms registration-ready/.test(result.advisorText), 'advisor packet: exported text should include plan-wide readiness summary');
	  assert(/Registration readiness/.test(result.advisorText) && /Sections: 2\/3/.test(result.advisorText), 'advisor packet: exported text should include registration readiness gates');
	  assert(/Prereqs: 2\/3[\s\S]*MATH 115/.test(result.advisorText), 'advisor packet: exported text should include prerequisite gate');
	  assert(/Coreqs: 2\/3[\s\S]*CMSC 100/.test(result.advisorText), 'advisor packet: exported text should include corequisite gate');
	  assert(/Eligibility: 1\/2[\s\S]*Computer Science majors/.test(result.advisorText), 'advisor packet: exported text should include section eligibility gate');
			  assert(/Final registration checklist:[\s\S]*Credit load: WARN[\s\S]*Seat freshness: DANGER[\s\S]*Waitlist strategy: WARN/.test(result.advisorText), 'advisor packet: exported text should include final checklist');
	  assert(/Workload balance:[\s\S]*8\/11 credits/.test(result.advisorText), 'advisor packet: exported text should include workload balance');
	  assert(/Registration appointment:[\s\S]*Use the registration list to submit exact section IDs/.test(result.advisorText), 'advisor packet: exported text should include appointment checklist');
	  assert(/Seat data freshness:[\s\S]*MATH 140: 1 hr 30 min ago/.test(result.advisorText), 'advisor packet: exported text should include seat freshness');
	  assert(/Waitlist strategy:[\s\S]*MATH 140 0201: 0 open.*4 waitlisted[\s\S]*Backup ID MATH140-0301/.test(result.advisorText), 'advisor packet: exported text should include waitlist strategy');
  assert(/Calendar export:[\s\S]*Calendar incomplete: 4 weekly events across 2\/3 planned courses; 1 course still needs a section/.test(result.advisorText), 'advisor packet: exported text should include calendar omission summary');
  assert(/Calendar export:[\s\S]*ENGL 101 Missing section: omitted from calendar until a section is picked/.test(result.advisorText), 'advisor packet: exported text should include omitted missing-section course');
  assert(/Action: Refresh sections in Terp Track shortly before opening Testudo/.test(result.advisorText), 'advisor packet: exported text should include seat-refresh action guidance');
  assert(/Testudo entry queue:[\s\S]*Section ID: MATH140-0201/.test(result.advisorText), 'advisor packet: exported text should include Testudo queue');
  assert(/Suggested enrollment order:[\s\S]*1\. MATH 140 0201/.test(result.advisorText), 'advisor packet: exported text should include enrollment order');
  assert(/Backup sections:[\s\S]*MATH 140 primary 0201:[\s\S]*Backup: 0301/.test(result.advisorText), 'advisor packet: exported text should include backup plan');
  assert(/Fix: Pick sections for ENGL 101/.test(result.advisorText), 'advisor packet: exported text should include readiness fix guidance');
	  assert(/MATH 140 0201: 0 open.*4 waitlisted/.test(result.advisorText) && /backup section|Backup ID MATH140-0301/i.test(result.advisorText), 'advisor packet: exported text should include waitlist backup warning');
	  assert(/Registration Readiness/.test(result.outputText) && /Fix before registration/.test(result.outputText), 'advisor packet: rendered packet should include registration readiness gates');
	  assert(/Prereqs[\s\S]*MATH 115/.test(result.outputText), 'advisor packet: rendered packet should include prerequisite gate');
	  assert(/Coreqs[\s\S]*CMSC 100/.test(result.outputText), 'advisor packet: rendered packet should include corequisite gate');
	  assert(/Eligibility[\s\S]*Computer Science majors/.test(result.outputText), 'advisor packet: rendered packet should include section eligibility notes');
	  assert(/Final Registration Checklist/.test(result.outputText) && /Credit load/.test(result.outputText) && /launch checks ready/.test(result.outputText), 'advisor packet: rendered packet should include final checklist');
	  assert(/Workload Balance/.test(result.outputText) && /weekly in-class time/.test(result.outputText), 'advisor packet: rendered packet should include workload balance');
	  assert(/Registration Appointment/.test(result.outputText) && /Aug 25, 2099 at 9:30am/.test(result.outputText), 'advisor packet: rendered packet should include appointment');
	  assert(/Seat Data Freshness/.test(result.outputText) && /Refresh seats/.test(result.outputText), 'advisor packet: rendered packet should include seat freshness');
	  assert(/Waitlist Strategy/.test(result.outputText) && /4 waitlisted/.test(result.outputText), 'advisor packet: rendered packet should include waitlist strategy');
  assert(/Calendar Export/.test(result.outputText) && /Calendar incomplete/.test(result.outputText), 'advisor packet: rendered packet should include calendar omission readiness');
  assert(/Testudo Entry Queue/.test(result.outputText) && /Section ID MATH140-0201/.test(result.outputText), 'advisor packet: rendered packet should include Testudo queue');
  assert(/Enrollment Order/.test(result.outputText) && /MATH 140 0201/.test(result.outputText), 'advisor packet: rendered packet should include enrollment order');
  assert(/Backup Plan/.test(result.outputText) && /Backup 0301/.test(result.outputText), 'advisor packet: rendered packet should include backup plan');
  assert(/Recommended fixes/.test(result.outputText) && /Pick sections for ENGL 101/.test(result.outputText), 'advisor packet: rendered packet should include readiness fix guidance');
  assert(/Quick actions/.test(result.outputText) && /Review section picks/.test(result.outputText), 'advisor packet: rendered packet should include readiness quick actions');
  assert(/ENGL 101 needs a section choice/.test(result.outputText), 'advisor packet: rendered packet should include unscheduled follow-up');
	  assert(/MATH 140 0201: 0 open[\s\S]*4 waitlisted/.test(result.outputText) && /backup section|Backup 0301/i.test(result.outputText), 'advisor packet: rendered packet should include waitlist backup warning');
  const snapshot = await page.evaluate(snapshotScript());
  assert(snapshot.scheduleMapText.includes('Readiness Map'), 'advisor packet: mobile snapshot should include readiness map');
  assert(snapshot.scheduleMapText.includes('Fall 2026') && snapshot.scheduleMapText.includes('Spring 2027'), 'advisor packet: readiness map should include all plan terms');
  assert(snapshot.scheduleMapText.includes('Needs sections'), 'advisor packet: readiness map should expose missing section work');
  assert(snapshot.scheduleText.includes('Advisor view'), 'advisor packet: rendered output should include advisor controls');
	  assert(snapshot.scheduleText.includes('Registration Readiness'), 'advisor packet: mobile snapshot should include readiness panel');
	  assert(snapshot.scheduleText.includes('Final Registration Checklist'), 'advisor packet: mobile snapshot should include final checklist');
	  assert(snapshot.scheduleText.includes('Workload Balance'), 'advisor packet: mobile snapshot should include workload balance');
	  assert(snapshot.scheduleText.includes('Registration Appointment'), 'advisor packet: mobile snapshot should include registration appointment');
	  assert(snapshot.scheduleText.includes('Seat Data Freshness'), 'advisor packet: mobile snapshot should include seat freshness');
	  assert(snapshot.scheduleText.includes('Waitlist Strategy'), 'advisor packet: mobile snapshot should include waitlist strategy');
  assert(snapshot.scheduleText.includes('Testudo Entry Queue'), 'advisor packet: mobile snapshot should include Testudo queue');
  assert(snapshot.scheduleText.includes('Enrollment Order'), 'advisor packet: mobile snapshot should include enrollment order');
  assert(snapshot.scheduleText.includes('Backup Plan') && snapshot.scheduleText.includes('Apply ready backups'), 'advisor packet: mobile snapshot should include backup plan action');
  assert(snapshot.scheduleText.includes('Recommended fixes'), 'advisor packet: mobile snapshot should include readiness fixes');
  assert(snapshot.scheduleText.includes('Quick actions'), 'advisor packet: mobile snapshot should include readiness quick actions');
  assert(snapshot.scheduleText.includes('Registration Blockers'), 'advisor packet: rendered output should show blocker view');
	  assert(snapshot.scheduleText.includes('MATH 140 0201') && snapshot.scheduleText.includes('4 waitlisted'), 'advisor packet: mobile snapshot should include waitlist backup warning');
  assertNoOverflow('advisor packet mobile', snapshot);

  await page.locator('[data-backup-action="apply-ready"]').first().click({ timeout: opts.timeoutMs });
  await page.waitForFunction(() => {
    const output = document.querySelector('#schedule-output');
    const picked = getSelectedSection('PASS98F', 'MATH 140');
    const change = (state.recentChanges || [])[0] || {};
    const text = document.querySelector('#schedule-section-list')?.textContent?.replace(/\s+/g, ' ') || '';
    const undo = document.querySelector('#schedule-undo')?.textContent?.replace(/\s+/g, ' ') || '';
    return output?.dataset.lastBackupAction === 'apply-ready'
      && picked?.section_id === 'MATH140-0301'
      && /Applied 1 ready backup section/.test(change.title || '')
      && undo.includes('Applied 1 ready backup')
      && text.includes('18 seats open');
  }, null, { timeout: opts.timeoutMs });
  const backupResult = await page.evaluate(() => ({
    selected: getSelectedSection('PASS98F', 'MATH 140')?.section_id || '',
    changeTitle: (state.recentChanges || [])[0]?.title || '',
    outputText: document.querySelector('#schedule-output')?.textContent?.replace(/\s+/g, ' ').trim() || '',
  }));
  assert(backupResult.selected === 'MATH140-0301', 'advisor packet: Apply ready backups should save the safer section');
  assert(/Applied 1 ready backup section/.test(backupResult.changeTitle), 'advisor packet: Apply ready backups should record a bulk backup change');
  assert(!/MATH 140 0201: 0 open[\s\S]*4 waitlisted/.test(backupResult.outputText), 'advisor packet: ready backup apply should clear the prior waitlist warning');
  const backupSnapshot = await page.evaluate(snapshotScript());
  assertNoOverflow('advisor packet backup apply mobile', backupSnapshot);
  await page.locator('[data-seat-freshness-action="refresh"]').first().click({ timeout: opts.timeoutMs });
  await page.waitForFunction(() => {
    const output = document.querySelector('#schedule-output');
    const status = document.querySelector('#schedule-status')?.textContent || '';
    return output?.dataset.lastSeatFreshnessAction === 'refresh'
      && /fresh seats/i.test(status)
      && scheduleOutputCache?.seatFreshness?.level === 'ok';
  }, null, { timeout: opts.timeoutMs });
  const refreshSnapshot = await page.evaluate(snapshotScript());
  assertNoOverflow('advisor packet seat refresh mobile', refreshSnapshot);
	  console.log('Advisor packet [mobile]: rendered readiness map, blocker view, registration readiness, credit-load gate, prerequisite gate, corequisite gate, eligibility gate, final registration checklist, workload balance, registration appointment, seat freshness, waitlist strategy, calendar readiness, calendar omission auto-fill, clear-picks undo, calendar omission action, Testudo queue, enrollment order, backup plan, registration export, calendar export, catalog warning, waitlist backup warning, ready backup apply action, seat refresh action, export action, and no overflow.');
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
    await verifyDarkModeContrastMobile(page, url, opts);
    await verifyOnboardingMobile(page, url, opts);
    await verifyBrowseReplacementMobile(page, url, opts);
    await verifyRecommendationsSectionMobile(page, url, opts);
    await verifyAccountSetupMobile(page, url, opts);
    await verifyScheduleAlternativesMobile(page, url, opts);
    await verifyAdvisorPacketMobile(page, url, opts);
    assert(!pageErrors.length, `Workflow page errors: ${pageErrors.slice(0, 5).join(' | ')}`);
    assert(!consoleErrors.length, `Workflow console errors: ${consoleErrors.slice(0, 5).join(' | ')}`);
    console.log('Verified rendered mobile dark mode, onboarding, Browse replacement, Recommendations section pick, Account setup, Schedule alternatives, and advisor packet workflows.');
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
