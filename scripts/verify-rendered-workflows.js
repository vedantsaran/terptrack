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
    const accountModal = document.querySelector('#account-modal.open .modal');
    const browse = document.querySelector('#view-browse');
    const preview = document.querySelector('#ob-plan-preview');
    const grid = document.querySelector('#br-grid');
    const schedule = document.querySelector('#view-schedule');
    const scheduleOutput = document.querySelector('#schedule-output');
    const advisorPacket = document.querySelector('#schedule-advisor-packet');
    const recommendations = document.querySelector('#reco-container');
    return {
      scripts: Array.from(document.scripts).map(script => script.getAttribute('src')).filter(Boolean),
      styles: Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(link => link.getAttribute('href')),
      onboardText: preview ? preview.textContent.replace(/\\s+/g, ' ').trim() : '',
      accountText: accountModal ? accountModal.textContent.replace(/\\s+/g, ' ').trim() : '',
      browseText: grid ? grid.textContent.replace(/\\s+/g, ' ').trim() : '',
      scheduleText: scheduleOutput ? scheduleOutput.textContent.replace(/\\s+/g, ' ').trim() : '',
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
        advisorPacket: advisorPacket ? advisorPacket.scrollWidth > advisorPacket.clientWidth + 1 : false,
        recommendations: recommendations ? recommendations.scrollWidth > recommendations.clientWidth + 1 : false,
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
  assert(snapshot.styles.includes('styles.css?v=78'), 'workflow app did not load styles.css?v=78');
  assert(snapshot.scripts.includes('js/onboarding.js?v=16'), 'workflow app did not load js/onboarding.js?v=16');
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
    return text.includes('Auto Plan Review')
      && text.includes('Statistics')
      && text.includes('Catalog year')
      && text.includes('2024-2025')
      && text.includes('Catalog target 2024-2025')
      && text.includes('linked source 2026-2027')
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

async function verifyRecommendationsMoveMobile(page, url, opts) {
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
      && text.includes('Move here')
      && text.includes('Schedule');
  }, null, { timeout: opts.timeoutMs });
  await page.locator('#reco-container .reco-pick:has-text("CMSC 132") button:has-text("Move here")').click({ timeout: opts.timeoutMs });
  await page.waitForFunction(() => {
    const text = document.querySelector('#reco-container')?.textContent?.replace(/\s+/g, ' ') || '';
    return text.includes('CMSC 132') && text.includes('In this term');
  }, null, { timeout: opts.timeoutMs });
  const result = await page.evaluate(() => ({
    fallCodes: state.activeSchedule[0].courses.map(course => course.code),
    springCodes: state.activeSchedule[1].courses.map(course => course.code),
    change: state.recentChanges[0] || null,
  }));
  assert(result.fallCodes.includes('CMSC 132'), 'recommendations: moved course should be in current term');
  assert(!result.springCodes.includes('CMSC 132'), 'recommendations: moved course should leave future term');
  assert(result.change?.type === 'recommendation-move', 'recommendations: move should record a recent change');
  const snapshot = await page.evaluate(snapshotScript());
  assert(snapshot.recoText.includes('In this term'), 'recommendations: rendered panel should show moved current-term state');
  assertNoOverflow('recommendations move mobile', snapshot);
  console.log('Recommendations [mobile]: rendered Smart next pick move action, moved a ready course, and no overflow.');
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

  const snapshot = await page.evaluate(snapshotScript());
  const prefs = await page.evaluate(() => getAccountPrefs());
  assert(prefs.displayName === 'Pass 98 Student', 'account setup: profile display name should persist locally');
  assert((prefs.friendInvites || []).some(invite => invite.email === 'roommate@umd.edu'), 'account setup: friend invite should persist locally');
  assert(snapshot.accountText.includes('Local only'), 'account setup: modal should identify local-only config');
  assert(snapshot.accountText.includes('Friend invite saved locally.'), 'account setup: modal should preserve local invite status');
  assert(snapshot.accountText.includes('No loaded friend plans'), 'account setup: modal should show empty friend-plan state');
  assertNoOverflow('account setup mobile', snapshot);
  console.log('Account setup [mobile]: rendered local-first cloud checklist, profile save, friend invite, and no overflow.');
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
    };
    const mathSection = {
      section_id: 'MATH140-0201',
      semester: '202608',
      number: '0201',
      instructors: ['Katherine Johnson'],
      meetings: [{ days: 'TuTh', start_time: '11:00am', end_time: '12:15pm', building: 'CSI', room: '2110' }],
      open_seats: '8',
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
        { code: 'CMSC 131', title: 'Object-Oriented Programming I', cr: 4, kind: 'core', category: 'major-core' },
        { code: 'MATH 140', title: 'Calculus I', cr: 4, kind: 'core', category: 'gened-fsma' },
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
    scheduleSectionsCache['PASS98F:202608:MATH140'] = [mathSection];
    scheduleSectionsCache['PASS98F:202608:ENGL101'] = [englSection];
    schedulePostedTerms = ['202608'];
    scheduleCurrentSemId = 'PASS98F';
    currentTab = 'schedule';
    document.querySelectorAll('.view').forEach(view => view.classList.toggle('active', view.id === 'view-schedule'));
    document.querySelectorAll('.tab').forEach(tab => tab.classList.toggle('active', tab.dataset.tab === 'schedule'));
    await renderSchedule();
  });
  await page.waitForFunction(() => {
    const text = document.querySelector('#schedule-output')?.textContent?.replace(/\s+/g, ' ') || '';
    return text.includes('Schedule Output')
      && text.includes('Advisor Packet')
      && text.includes('Download advisor packet')
      && text.includes('Confirm 2024-2025 catalog requirements')
      && text.includes('ENGL 101 needs a section choice')
      && text.includes('Picked CMSC 131 0101');
  }, null, { timeout: opts.timeoutMs });
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
    lastAction: document.querySelector('#schedule-output')?.dataset.lastAction || '',
  }));
  assert(result.advisorFilter === 'blockers', 'advisor packet: blocker filter should persist after click');
  assert(result.lastAction === 'advisor-download', 'advisor packet: download action should be recorded');
  assert(/^terp-track-advisor-.*\.html$/i.test(result.advisorFilename), 'advisor packet: export filename should be an HTML advisor packet');
  assert(/schedule-advisor-catalog-warning/.test(result.advisorDocument), 'advisor packet: exported HTML should include catalog warning markup');
  assert(/Registration Blockers/.test(result.advisorDocument), 'advisor packet: exported HTML should include blocker view heading');
  assert(/Catalog-year verification/.test(result.advisorText), 'advisor packet: exported text should include catalog-year verification');
  assert(/ENGL 101 needs a section choice/.test(result.outputText), 'advisor packet: rendered packet should include unscheduled follow-up');
  const snapshot = await page.evaluate(snapshotScript());
  assert(snapshot.scheduleText.includes('Advisor view'), 'advisor packet: rendered output should include advisor controls');
  assert(snapshot.scheduleText.includes('Registration Blockers'), 'advisor packet: rendered output should show blocker view');
  assertNoOverflow('advisor packet mobile', snapshot);
  console.log('Advisor packet [mobile]: rendered blocker view, catalog warning, export action, and no overflow.');
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
    await verifyRecommendationsMoveMobile(page, url, opts);
    await verifyAccountSetupMobile(page, url, opts);
    await verifyAdvisorPacketMobile(page, url, opts);
    assert(!pageErrors.length, `Workflow page errors: ${pageErrors.slice(0, 5).join(' | ')}`);
    assert(!consoleErrors.length, `Workflow console errors: ${consoleErrors.slice(0, 5).join(' | ')}`);
    console.log('Verified rendered mobile onboarding, Browse replacement, Recommendations move, Account setup, and advisor packet workflows.');
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
