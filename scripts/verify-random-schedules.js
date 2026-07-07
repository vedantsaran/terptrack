#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const OFFICIAL_CATALOG_COURSE_BASE = 'https://academiccatalog.umd.edu/undergraduate/approved-courses';
const TESTUDO_SOC_BASE = 'https://app.testudo.umd.edu/soc';
const DEFAULT_TESTUDO_TITLE_TERMS = ['202608'];

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function parseArgs(argv) {
  const opts = {
    seed: process.env.TERPTRACK_RANDOM_SEED || 'terptrack-random-schedule-v1',
    count: Number(process.env.TERPTRACK_RANDOM_COUNT || 6),
    all: false,
    catalogSweep: false,
    catalogLimit: null,
    skipOfficialTitleCheck: false,
    skipTestudoTitleCheck: false,
    testudoTerms: DEFAULT_TESTUDO_TITLE_TERMS.slice(),
    writeSettingsSnapshot: false,
    bumpSettingsAsset: true,
    snapshotDate: '',
    keepGoing: false,
    majors: [],
  };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--all') {
      opts.all = true;
    } else if (arg === '--catalog-sweep') {
      opts.catalogSweep = true;
    } else if (arg === '--catalog-limit') {
      opts.catalogLimit = Number(argv[++i] || 0);
    } else if (arg.startsWith('--catalog-limit=')) {
      opts.catalogLimit = Number(arg.slice('--catalog-limit='.length) || 0);
    } else if (arg === '--skip-official-title-check') {
      opts.skipOfficialTitleCheck = true;
    } else if (arg === '--skip-testudo-title-check') {
      opts.skipTestudoTitleCheck = true;
    } else if (arg === '--testudo-terms') {
      opts.testudoTerms = String(argv[++i] || '').split(',');
    } else if (arg.startsWith('--testudo-terms=')) {
      opts.testudoTerms = arg.slice('--testudo-terms='.length).split(',');
    } else if (arg === '--write-settings-snapshot') {
      opts.writeSettingsSnapshot = true;
    } else if (arg === '--no-bump-settings-asset') {
      opts.bumpSettingsAsset = false;
    } else if (arg === '--snapshot-date') {
      opts.snapshotDate = argv[++i] || '';
    } else if (arg.startsWith('--snapshot-date=')) {
      opts.snapshotDate = arg.slice('--snapshot-date='.length);
    } else if (arg === '--keep-going') {
      opts.keepGoing = true;
    } else if (arg === '--major') {
      const value = argv[++i] || '';
      if (value) opts.majors.push(...value.split(','));
    } else if (arg.startsWith('--major=')) {
      opts.majors.push(...arg.slice('--major='.length).split(','));
    } else if (arg === '--majors') {
      const value = argv[++i] || '';
      if (value) opts.majors.push(...value.split(','));
    } else if (arg.startsWith('--majors=')) {
      opts.majors.push(...arg.slice('--majors='.length).split(','));
    } else if (arg === '--seed') {
      opts.seed = argv[++i] || opts.seed;
    } else if (arg.startsWith('--seed=')) {
      opts.seed = arg.slice('--seed='.length) || opts.seed;
    } else if (arg === '--count') {
      opts.count = Number(argv[++i] || opts.count);
    } else if (arg.startsWith('--count=')) {
      opts.count = Number(arg.slice('--count='.length) || opts.count);
    } else {
      fail(`Unknown argument: ${arg}`);
    }
  }
  opts.count = Number.isFinite(opts.count) && opts.count > 0 ? Math.floor(opts.count) : 6;
  opts.catalogLimit = Number.isFinite(opts.catalogLimit) && opts.catalogLimit > 0 ? Math.floor(opts.catalogLimit) : null;
  opts.majors = Array.from(new Set(opts.majors.map(item => String(item || '').trim().toUpperCase()).filter(Boolean)));
  opts.testudoTerms = Array.from(new Set(opts.testudoTerms.map(item => String(item || '').trim()).filter(Boolean)));
  if (!opts.testudoTerms.length) opts.testudoTerms = DEFAULT_TESTUDO_TITLE_TERMS.slice();
  opts.snapshotDate = String(opts.snapshotDate || '').trim();
  return opts;
}

function hashSeed(seed) {
  let h = 2166136261;
  String(seed || '').split('').forEach(ch => {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  });
  return h >>> 0;
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return function rand() {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(list, rand) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function currentDateLabel() {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());
}

function jsStringLiteral(value) {
  return `'${String(value ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function catalogSweepCommand(summary) {
  const args = [
    'node scripts/verify-random-schedules.js',
    '--catalog-sweep',
    `--seed=${summary.seed}`,
  ];
  if (summary.testudoTerms) args.push(`--testudo-terms=${summary.testudoTerms}`);
  return args.join(' ');
}

function formatCatalogSweepSettingsBlock(summary) {
  const normalized = {
    checkedAt: summary.checkedAt,
    seed: summary.seed,
    source: summary.source || 'app live metadata + PlanetTerp',
    uniqueCourses: Number(summary.uniqueCourses) || 0,
    generatedMajors: Number(summary.generatedMajors) || 0,
    requirementRows: Number(summary.requirementRows) || 0,
    matchedCourses: Number(summary.matchedCourses) || 0,
    missingCourses: Number(summary.missingCourses) || 0,
    creditMismatches: Number(summary.creditMismatches) || 0,
    titleDrifts: Number(summary.titleDrifts) || 0,
    officialTitleChecks: Number(summary.officialTitleChecks) || 0,
    officialTitleMismatches: Number(summary.officialTitleMismatches) || 0,
    testudoTermTitleCandidates: Number(summary.testudoTermTitleCandidates) || 0,
    testudoTermTitleChecks: Number(summary.testudoTermTitleChecks) || 0,
    testudoTermTitleMismatches: Number(summary.testudoTermTitleMismatches) || 0,
    testudoTerms: summary.testudoTerms || '',
    command: summary.command || catalogSweepCommand(summary),
  };
  return [
    'const GENERATED_CATALOG_SWEEP = Object.freeze({',
    `  checkedAt: ${jsStringLiteral(normalized.checkedAt)},`,
    `  seed: ${jsStringLiteral(normalized.seed)},`,
    `  source: ${jsStringLiteral(normalized.source)},`,
    `  uniqueCourses: ${normalized.uniqueCourses},`,
    `  generatedMajors: ${normalized.generatedMajors},`,
    `  requirementRows: ${normalized.requirementRows},`,
    `  matchedCourses: ${normalized.matchedCourses},`,
    `  missingCourses: ${normalized.missingCourses},`,
    `  creditMismatches: ${normalized.creditMismatches},`,
    `  titleDrifts: ${normalized.titleDrifts},`,
    `  officialTitleChecks: ${normalized.officialTitleChecks},`,
    `  officialTitleMismatches: ${normalized.officialTitleMismatches},`,
    `  testudoTermTitleCandidates: ${normalized.testudoTermTitleCandidates},`,
    `  testudoTermTitleChecks: ${normalized.testudoTermTitleChecks},`,
    `  testudoTermTitleMismatches: ${normalized.testudoTermTitleMismatches},`,
    `  testudoTerms: ${jsStringLiteral(normalized.testudoTerms)},`,
    `  command: ${jsStringLiteral(normalized.command)},`,
    '});',
  ].join('\n');
}

function replaceCatalogSweepSettingsBlock(source, summary) {
  const nextBlock = formatCatalogSweepSettingsBlock(summary);
  const pattern = /const GENERATED_CATALOG_SWEEP = Object\.freeze\(\{\n[\s\S]*?\n\}\);/;
  if (!pattern.test(source)) fail('Could not find GENERATED_CATALOG_SWEEP block in js/settings.js.');
  return source.replace(pattern, nextBlock);
}

function bumpSettingsAssetVersion() {
  const indexPath = path.join(ROOT, 'index.html');
  const verifierPath = path.join(ROOT, 'scripts/verify-rendered-generated-plans.js');
  const indexSource = fs.readFileSync(indexPath, 'utf8');
  const match = indexSource.match(/js\/settings\.js\?v=(\d+)/);
  if (!match) fail('Could not find js/settings.js asset version in index.html.');
  const current = Number(match[1]);
  const next = current + 1;
  const replaceVersion = source => source.replace(
    new RegExp(`js/settings\\.js\\?v=${current}`, 'g'),
    `js/settings.js?v=${next}`,
  );
  fs.writeFileSync(indexPath, replaceVersion(indexSource));
  fs.writeFileSync(verifierPath, replaceVersion(fs.readFileSync(verifierPath, 'utf8')));
  return { current, next };
}

function writeCatalogSweepSettingsSnapshot(summary, opts) {
  if (opts.catalogLimit) fail('Refusing to write Settings snapshot from a limited catalog sweep. Run without --catalog-limit.');
  const settingsPath = path.join(ROOT, 'js/settings.js');
  const before = fs.readFileSync(settingsPath, 'utf8');
  const after = replaceCatalogSweepSettingsBlock(before, summary);
  const changed = before !== after;
  if (changed) fs.writeFileSync(settingsPath, after);
  const asset = opts.bumpSettingsAsset ? bumpSettingsAssetVersion() : null;
  return { changed, asset };
}

function buildContext() {
  const storage = new Map();
  const context = {
    console,
    fetch,
    setTimeout,
    clearTimeout,
    URLSearchParams,
    TextEncoder,
    TextDecoder,
    btoa: value => Buffer.from(String(value), 'binary').toString('base64'),
    atob: value => Buffer.from(String(value), 'base64').toString('binary'),
    localStorage: {
      getItem: key => (storage.has(key) ? storage.get(key) : null),
      setItem: (key, value) => storage.set(key, String(value)),
      removeItem: key => storage.delete(key),
    },
    document: {
      getElementById: () => null,
      addEventListener() {},
    },
    confirm: () => true,
    applyTheme() {},
    applySettings() {},
    render() {},
    toastError(message) { throw new Error(message); },
    toastSuccess() {},
    window: {},
  };
  vm.createContext(context);
  [
    'js/data.js',
    'js/major-schedules.js',
    'js/majors.js',
    'js/state.js',
    'js/planetterp.js',
    'js/api.js',
    'js/import.js',
    'js/settings.js',
    'js/share.js',
    'js/account.js',
    'js/schedule.js',
    'js/timeline.js',
    'js/browse.js',
    'js/gened.js',
    'js/placeholder-search.js',
    'js/audit.js',
    'js/onboarding.js',
  ].forEach(file => vm.runInContext(read(file), context, { filename: file }));
  vm.runInContext('state = loadState();', context);
  return context;
}

function displayCode(code) {
  const id = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const match = id.match(/^([A-Z]{3,4})(\d{3}[A-Z]?)$/);
  return match ? `${match[1]} ${match[2]}` : String(code || '');
}

function normalizeCode(code) {
  return String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function normalizeTitle(title) {
  return String(title || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function titlesCompatible(appTitle, planetTerpTitle) {
  const app = normalizeTitle(appTitle);
  const live = normalizeTitle(planetTerpTitle);
  if (!app || !live) return true;
  return app === live || app.includes(live) || live.includes(app);
}

function titleNeedsTermSpecificCheck(appTitle, officialTitle) {
  const app = normalizeTitle(appTitle);
  const official = normalizeTitle(officialTitle);
  if (!app || !official || app === official) return false;
  return app.includes(official) || official.includes(app);
}

function creditValue(value) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function decodeHtmlEntities(text) {
  const named = {
    amp: '&',
    gt: '>',
    lt: '<',
    nbsp: ' ',
    quot: '"',
    apos: "'",
  };
  return String(text || '').replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity) => {
    const key = String(entity || '').toLowerCase();
    if (key.startsWith('#x')) {
      const value = Number.parseInt(key.slice(2), 16);
      return Number.isFinite(value) ? String.fromCodePoint(value) : match;
    }
    if (key.startsWith('#')) {
      const value = Number.parseInt(key.slice(1), 10);
      return Number.isFinite(value) ? String.fromCodePoint(value) : match;
    }
    return Object.prototype.hasOwnProperty.call(named, key) ? named[key] : match;
  });
}

function htmlToText(html) {
  return decodeHtmlEntities(String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim());
}

function parseOfficialCreditText(text) {
  const raw = String(text || '').replace(/\s+/g, ' ').trim();
  const nums = Array.from(raw.matchAll(/\d+(?:\.\d+)?/g)).map(match => Number(match[0])).filter(Number.isFinite);
  if (!nums.length) return null;
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  return {
    raw,
    min,
    max,
    exact: min === max ? min : null,
  };
}

function officialCreditsCompatible(officialCredits, value) {
  const credits = creditValue(value);
  if (!officialCredits || !credits) return true;
  if (officialCredits.exact !== null) return credits === officialCredits.exact;
  return credits >= officialCredits.min && credits <= officialCredits.max;
}

function extractOfficialCatalogCourse(html, code) {
  const id = normalizeCode(code);
  const titleRe = /<p[^>]*class=["'][^"']*courseblocktitle[^"']*["'][^>]*>([\s\S]*?)<\/p>/gi;
  let match;
  while ((match = titleRe.exec(String(html || ''))) !== null) {
    const text = htmlToText(match[1]);
    const parsed = text.match(/^([A-Z]{3,4})\s*(\d{3}[A-Z]?)\s+(.+?)\s*\(([^)]*Credits?)\)$/i);
    if (!parsed) continue;
    const found = normalizeCode(`${parsed[1]}${parsed[2]}`);
    if (found !== id) continue;
    return {
      code: found,
      title: parsed[3].replace(/\s+/g, ' ').trim(),
      credits: parseOfficialCreditText(parsed[4]),
    };
  }
  return null;
}

function extractTestudoCourse(html, code) {
  const id = normalizeCode(code);
  const titleMatch = String(html || '').match(/<span[^>]*class=["'][^"']*course-title[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
  if (!titleMatch) return null;
  const title = htmlToText(titleMatch[1]);
  if (!title) return null;
  const text = htmlToText(html);
  const creditMatch = text.match(/\bCredits:\s*([0-9]+(?:\s*-\s*[0-9]+)?)/i);
  return {
    code: id,
    title,
    credits: creditMatch ? parseOfficialCreditText(`${creditMatch[1]} Credits`) : null,
  };
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function mapLimit(list, limit, fn) {
  const out = new Array(list.length);
  let idx = 0;
  async function worker() {
    while (idx < list.length) {
      const current = idx++;
      out[current] = await fn(list[current], current);
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, Math.min(limit, list.length)) }, worker));
  return out;
}

function isPlaceholderCourse(course) {
  const code = String(course?.code || '');
  const hay = [course?.code, course?.title, course?.note, course?.category, course?.kind].join(' ').toUpperCase();
  return /^GENED\s/i.test(code)
    || /^FREE ELECTIVE/i.test(code)
    || hay.includes('PLACEHOLDER')
    || hay.includes('AUTO-GENERATED CREDIT');
}

function flatCourses(semesters) {
  const out = [];
  (semesters || []).forEach((sem, semIndex) => {
    (sem.courses || []).forEach(course => out.push({ ...course, semIndex, semName: sem.name }));
  });
  return out;
}

function profileFromRoll(rand) {
  const profiles = [
    { interests: ['ai-data'], careerGoal: 'machine learning for public policy', genEdDepts: 'INST, GVPT, PSYC' },
    { interests: ['health-life'], careerGoal: 'clinical research and public health', genEdDepts: 'HLTH, BSCI, PSYC' },
    { interests: ['business'], careerGoal: 'product strategy and finance', genEdDepts: 'BMGT, ECON, COMM' },
    { interests: ['sustainability'], careerGoal: 'climate policy and data', genEdDepts: 'GEOG, ENST, AOSC' },
    { interests: ['design-media'], careerGoal: 'human-centered product design', genEdDepts: 'ARTT, COMM, CINE' },
  ];
  return profiles[Math.floor(rand() * profiles.length)] || profiles[0];
}

const planetTerpVerifyCache = new Map();
const officialCatalogDeptCache = new Map();
const testudoCourseCache = new Map();

async function fetchPlanetTerpCourse(code) {
  const id = normalizeCode(code);
  if (planetTerpVerifyCache.has(id)) return planetTerpVerifyCache.get(id);
  const url = `https://planetterp.com/api/v1/course?name=${encodeURIComponent(id)}`;
  let lastResult = null;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    let resp;
    try {
      resp = await fetch(url, { headers: { accept: 'application/json' } });
    } catch (error) {
      lastResult = { ok: false, code: id, detail: error?.message || String(error) };
      if (attempt < 3) await wait(250 * attempt);
      continue;
    }
    if (!resp.ok) {
      let detail = `HTTP ${resp.status}`;
      try {
        const body = await resp.json();
        if (body?.error) detail = body.error;
      } catch {}
      lastResult = { ok: false, code: id, detail };
      if (resp.status >= 500 && attempt < 3) {
        await wait(250 * attempt);
        continue;
      }
      planetTerpVerifyCache.set(id, lastResult);
      return lastResult;
    }
    const data = await resp.json();
    const result = {
      ok: normalizeCode(data?.name || '') === id,
      code: id,
      title: data?.title || '',
      credits: data?.credits,
      isRecent: data?.is_recent,
      detail: normalizeCode(data?.name || '') === id ? '' : `PlanetTerp returned ${data?.name || 'unknown course'}`,
    };
    planetTerpVerifyCache.set(id, result);
    return result;
  }
  planetTerpVerifyCache.set(id, lastResult);
  return lastResult;
}

async function fetchOfficialCatalogDept(dept) {
  const id = String(dept || '').trim().toLowerCase();
  if (!id) return { ok: false, detail: 'missing department' };
  if (officialCatalogDeptCache.has(id)) return officialCatalogDeptCache.get(id);
  const url = `${OFFICIAL_CATALOG_COURSE_BASE}/${encodeURIComponent(id)}/`;
  let lastResult = null;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    let resp;
    try {
      resp = await fetch(url, {
        headers: {
          accept: 'text/html,application/xhtml+xml',
          'user-agent': 'TerpTrack/catalog-title-verifier',
        },
      });
    } catch (error) {
      lastResult = { ok: false, url, detail: error?.message || String(error) };
      if (attempt < 3) await wait(250 * attempt);
      continue;
    }
    if (!resp.ok) {
      lastResult = { ok: false, url, detail: `HTTP ${resp.status}` };
      if (resp.status >= 500 && attempt < 3) {
        await wait(250 * attempt);
        continue;
      }
      officialCatalogDeptCache.set(id, lastResult);
      return lastResult;
    }
    const html = await resp.text();
    const result = { ok: true, url, html };
    officialCatalogDeptCache.set(id, result);
    return result;
  }
  officialCatalogDeptCache.set(id, lastResult);
  return lastResult;
}

async function fetchOfficialCatalogCourse(code) {
  const id = normalizeCode(code);
  const match = id.match(/^([A-Z]{3,4})(\d{3}[A-Z]?)$/);
  if (!match) return { ok: false, code: id, detail: 'invalid course code' };
  const dept = match[1];
  const deptPage = await fetchOfficialCatalogDept(dept);
  if (!deptPage?.ok) {
    return {
      ok: false,
      code: id,
      url: deptPage?.url || `${OFFICIAL_CATALOG_COURSE_BASE}/${dept.toLowerCase()}/`,
      detail: deptPage?.detail || 'department page unavailable',
    };
  }
  const course = extractOfficialCatalogCourse(deptPage.html, id);
  if (!course) {
    return {
      ok: false,
      code: id,
      url: deptPage.url,
      detail: 'course not found on UMD catalog department page',
    };
  }
  return {
    ok: true,
    code: id,
    title: course.title,
    credits: course.credits,
    url: deptPage.url,
  };
}

async function fetchTestudoCourse(code, term) {
  const id = normalizeCode(code);
  const cleanTerm = String(term || '').trim();
  const match = id.match(/^([A-Z]{3,4})(\d{3}[A-Z]?)$/);
  if (!match || !cleanTerm) return { ok: false, code: id, term: cleanTerm, detail: 'invalid course code or term' };
  const cacheKey = `${cleanTerm}:${id}`;
  if (testudoCourseCache.has(cacheKey)) return testudoCourseCache.get(cacheKey);
  const dept = match[1];
  const url = `${TESTUDO_SOC_BASE}/${encodeURIComponent(cleanTerm)}/${encodeURIComponent(dept)}/${encodeURIComponent(id)}`;
  let lastResult = null;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    let resp;
    try {
      resp = await fetch(url, {
        headers: {
          accept: 'text/html,application/xhtml+xml',
          'user-agent': 'TerpTrack/testudo-title-verifier',
        },
      });
    } catch (error) {
      lastResult = { ok: false, code: id, term: cleanTerm, url, detail: error?.message || String(error) };
      if (attempt < 3) await wait(250 * attempt);
      continue;
    }
    if (!resp.ok) {
      lastResult = { ok: false, code: id, term: cleanTerm, url, detail: `HTTP ${resp.status}` };
      if (resp.status >= 500 && attempt < 3) {
        await wait(250 * attempt);
        continue;
      }
      testudoCourseCache.set(cacheKey, lastResult);
      return lastResult;
    }
    const html = await resp.text();
    const course = extractTestudoCourse(html, id);
    const result = course
      ? { ok: true, code: id, term: cleanTerm, url, title: course.title, credits: course.credits }
      : { ok: false, code: id, term: cleanTerm, url, detail: 'course title not posted in Testudo term page' };
    testudoCourseCache.set(cacheKey, result);
    return result;
  }
  testudoCourseCache.set(cacheKey, lastResult);
  return lastResult;
}

async function fetchTestudoCourseAcrossTerms(code, terms) {
  const rows = await mapLimit(terms || [], 2, term => fetchTestudoCourse(code, term));
  return rows.filter(Boolean);
}

async function verifyMajor(context, major, rand) {
  const profile = profileFromRoll(rand);
  const startTerm = rand() > 0.5 ? 'Fall' : 'Spring';
  const startYear = 2026 + Math.floor(rand() * 2);
  const creditCap = rand() > 0.2 ? 17 : 18;
  const result = clone(await vm.runInContext(`
    (async () => {
      const tpl = getMajorTemplate(${JSON.stringify(major.id)});
      const profilePrefs = normalizeProfilePrefs(${JSON.stringify(profile)});
      const required = majorAllCodes(tpl).map(item => item.code);
      const review = await buildAutoPlanPreview(${JSON.stringify(major.id)}, {
        force: true,
        profilePrefs,
        startTerm: ${JSON.stringify(startTerm)},
        startYear: ${JSON.stringify(startYear)},
        creditCap: ${creditCap}
      });
      const live = await fetchCoursesBatch(required);
      const liveMetadata = {};
      required.forEach(code => {
        const course = live[normalizeCode(code)];
        if (!course) return;
        liveMetadata[normalizeCode(code)] = {
          code: course.code,
          title: course.title,
          cr: course.cr,
        };
      });
      return { required, review, liveMetadata };
    })()
  `, context));
  const review = result.review;
  const courses = flatCourses(review.semesters);
  const nonPlaceholder = courses.filter(course => !isPlaceholderCourse(course));
  const seen = new Set();
  const duplicates = [];
  const scheduledByCode = new Map();
  nonPlaceholder.forEach(course => {
    const key = normalizeCode(course.code);
    if (!key) duplicates.push('(blank)');
    if (seen.has(key)) duplicates.push(displayCode(key));
    seen.add(key);
    if (key) scheduledByCode.set(key, course);
  });
  const termLoads = review.termLoads || [];
  const maxTermLoad = Math.max(...termLoads.map(term => term.credits));
  const overTarget = review.totalCredits - review.targetCredits;

  assert(review.kind === 'generated', `${major.id}: expected generated review`);
  assert(termLoads.length === 8, `${major.id}: expected 8 terms, saw ${termLoads.length}`);
  assert(review.totalCredits >= review.targetCredits, `${major.id}: generated ${review.totalCredits}/${review.targetCredits} credits`);
  assert(overTarget <= 4, `${major.id}: generated ${overTarget} credits over target`);
  assert(maxTermLoad <= 18, `${major.id}: term load exceeds 18 credits (${maxTermLoad})`);
  assert((review.genEdSummary || []).every(req => req.complete), `${major.id}: incomplete generated GenEd coverage`);
  assert((review.requirementGroupSummary || []).length >= 2, `${major.id}: missing generated requirement group summary`);
  assert(
    (review.requirementGroupSummary || []).every(group => group.complete),
    `${major.id}: incomplete generated requirement groups ${(review.requirementGroupSummary || []).filter(group => !group.complete).map(group => `${group.label} ${group.scheduled}/${group.total}`).join(', ')}`,
  );
  assert(
    (review.requirementGroupSummary || []).reduce((sum, group) => sum + group.total, 0) === (result.required || []).length,
    `${major.id}: requirement groups do not match required course count`,
  );
  assert(review.levelProgression?.hasEarlyIntro, `${major.id}: generated schedule missing early 100/200-level real requirements`);
  assert(review.levelProgression?.hasLateAdvanced, `${major.id}: generated schedule missing later 300/400-level real requirements`);
  assert(review.levelProgression?.hasUpper400, `${major.id}: generated schedule missing 400-level senior options`);
  assert(!duplicates.length, `${major.id}: duplicate generated real course codes: ${duplicates.join(', ')}`);
  assert(review.metadataCoverage?.found === review.metadataCoverage?.total, `${major.id}: live metadata coverage ${review.metadataCoverage?.found}/${review.metadataCoverage?.total}; missing ${(review.metadataCoverage?.missingCodes || []).join(', ')}`);
  const missingScheduled = (result.required || []).filter(code => !scheduledByCode.has(normalizeCode(code)));
  assert(!missingScheduled.length, `${major.id}: required courses missing from generated schedule: ${missingScheduled.map(displayCode).join(', ')}`);

  const checks = await Promise.all((result.required || []).map(fetchPlanetTerpCourse));
  const missing = checks.filter(check => !check.ok);
  assert(!missing.length, `${major.id}: PlanetTerp missing required courses: ${missing.map(item => `${displayCode(item.code)} (${item.detail})`).join(', ')}`);
  const checksByCode = new Map(checks.map(check => [normalizeCode(check.code), check]));
  const missingLiveMetadata = (result.required || []).filter(code => !result.liveMetadata?.[normalizeCode(code)]);
  assert(!missingLiveMetadata.length, `${major.id}: live app metadata missing for required courses: ${missingLiveMetadata.map(displayCode).join(', ')}`);
  const metadataMismatches = [];
  (result.required || []).forEach(code => {
    const id = normalizeCode(code);
    const course = scheduledByCode.get(id);
    const check = checksByCode.get(id);
    const live = result.liveMetadata?.[id];
    if (!course || !check?.ok || !live) return;
    const generatedCredits = creditValue(course.cr);
    const liveCredits = creditValue(live.cr);
    if (generatedCredits && liveCredits && generatedCredits !== liveCredits) {
      metadataMismatches.push(`${displayCode(id)} credits ${generatedCredits} != live metadata ${liveCredits}`);
    }
    const planetCredits = creditValue(check.credits);
    if (generatedCredits && planetCredits && generatedCredits !== planetCredits) {
      metadataMismatches.push(`${displayCode(id)} credits ${generatedCredits} != PlanetTerp ${planetCredits}`);
    }
    if (!titlesCompatible(course.title, live.title)) {
      metadataMismatches.push(`${displayCode(id)} title "${course.title}" != live metadata "${live.title}"`);
    }
  });
  assert(!metadataMismatches.length, `${major.id}: generated course metadata does not match live sources: ${metadataMismatches.slice(0, 8).join('; ')}${metadataMismatches.length > 8 ? `; +${metadataMismatches.length - 8} more` : ''}`);

  return {
    id: major.id,
    name: major.name,
    start: `${startTerm} ${startYear}`,
    profile: profile.interests.join('+') || 'neutral',
    required: result.required.length,
    planetTerpChecked: checks.length,
    courses: courses.length,
    placeholders: courses.length - nonPlaceholder.length,
    credits: review.totalCredits,
    maxTermLoad,
    requirementGroups: (review.requirementGroupSummary || []).map(group => `${group.label} ${group.scheduled}/${group.total}`).join('; '),
    levelPath: `${review.levelProgression.earlyIntroCount} early lower/${review.levelProgression.lateAdvancedCount} later upper/${review.levelProgression.upper400Count} 400-level`,
    titleCreditChecked: checks.length,
  };
}

function generatedMajors(context) {
  return clone(vm.runInContext(`
    listMajors()
      .filter(major => !isMajorFullyBaked(major) && majorAllCodes(major).length)
      .map(major => ({ id: major.id, name: major.name, college: major.college }))
      .sort((a, b) => a.id.localeCompare(b.id))
  `, context));
}

function generatedRequirementRows(context) {
  return clone(vm.runInContext(`
    (() => {
      const rows = [];
      listMajors()
        .filter(major => !isMajorFullyBaked(major) && majorAllCodes(major).length)
        .sort((a, b) => a.id.localeCompare(b.id))
        .forEach(major => {
          majorAllCodes(major).forEach(item => {
            rows.push({
              majorId: major.id,
              majorName: major.name,
              code: item.code,
              category: item.category || '',
              kind: item.kind || ''
            });
          });
        });
      return rows;
    })()
  `, context));
}

async function fetchAppLiveMetadata(context, codes) {
  return clone(await vm.runInContext(`
    (async () => {
      const codes = ${JSON.stringify(codes)};
      const live = await fetchCoursesBatch(codes);
      const out = {};
      codes.forEach(code => {
        const id = normalizeCode(code);
        const course = live[id];
        out[id] = course ? {
          code: course.code,
          title: course.title,
          cr: course.cr,
          categories: course.categories || [],
          genEd: course.gen_ed || null
        } : null;
      });
      return out;
    })()
  `, context));
}

async function verifyCatalogSweep(context, opts) {
  const rows = generatedRequirementRows(context);
  const byCode = new Map();
  rows.forEach(row => {
    const id = normalizeCode(row.code);
    if (!id) return;
    if (!byCode.has(id)) byCode.set(id, { code: id, majors: [], categories: new Set(), kinds: new Set() });
    const bucket = byCode.get(id);
    bucket.majors.push(row.majorId);
    if (row.category) bucket.categories.add(row.category);
    if (row.kind) bucket.kinds.add(row.kind);
  });
  const rand = mulberry32(hashSeed(opts.seed));
  let entries = Array.from(byCode.values())
    .sort((a, b) => a.code.localeCompare(b.code))
    .map(row => ({
      code: row.code,
      majors: Array.from(new Set(row.majors)).sort(),
      categories: Array.from(row.categories).sort(),
      kinds: Array.from(row.kinds).sort(),
    }));
  const totalEntries = entries.length;
  if (opts.catalogLimit && opts.catalogLimit < entries.length) {
    entries = shuffle(entries, rand).slice(0, opts.catalogLimit).sort((a, b) => a.code.localeCompare(b.code));
  }
  const codes = entries.map(row => row.code);
  const majors = generatedMajors(context);
  console.log(`Catalog sweep verifier seed=${opts.seed} courses=${codes.length}/${totalEntries} majors=${majors.length} requirementRows=${rows.length}`);
  const appLive = await fetchAppLiveMetadata(context, codes);
  const planetRows = await mapLimit(codes, 6, fetchPlanetTerpCourse);
  const planetByCode = new Map(planetRows.map(row => [normalizeCode(row.code), row]));
  const entryByCode = new Map(entries.map(entry => [entry.code, entry]));
  const appMissing = [];
  const planetMissing = [];
  const mismatches = [];
  const titleDrifts = [];
  const coverageRows = [];
  codes.forEach(code => {
    const app = appLive[code];
    const planet = planetByCode.get(code);
    const entry = entryByCode.get(code) || { majors: [] };
    if (!app) appMissing.push(`${displayCode(code)} (${entry.majors.slice(0, 5).join(',')})`);
    if (!planet?.ok) planetMissing.push(`${displayCode(code)} (${planet?.detail || 'missing'})`);
    if (!app || !planet?.ok) return;
    const appCredits = creditValue(app.cr);
    const planetCredits = creditValue(planet.credits);
    if (appCredits && planetCredits && appCredits !== planetCredits) {
      mismatches.push(`${displayCode(code)} credits ${appCredits} != PlanetTerp ${planetCredits}`);
    }
    if (!titlesCompatible(app.title, planet.title)) {
      titleDrifts.push({
        code,
        appTitle: app.title,
        planetTitle: planet.title,
        appCredits,
        planetCredits,
      });
    }
    coverageRows.push({
      code,
      credits: appCredits || planetCredits || 0,
      title: app.title || planet.title || '',
      majors: entry.majors.length,
    });
  });

  assert(!appMissing.length, `Catalog sweep app live metadata missing ${appMissing.length}/${codes.length}: ${appMissing.slice(0, 20).join('; ')}${appMissing.length > 20 ? `; +${appMissing.length - 20} more` : ''}`);
  assert(!planetMissing.length, `Catalog sweep PlanetTerp missing ${planetMissing.length}/${codes.length}: ${planetMissing.slice(0, 20).join('; ')}${planetMissing.length > 20 ? `; +${planetMissing.length - 20} more` : ''}`);
  assert(!mismatches.length, `Catalog sweep credit mismatches ${mismatches.length}/${codes.length}: ${mismatches.slice(0, 20).join('; ')}${mismatches.length > 20 ? `; +${mismatches.length - 20} more` : ''}`);

  const officialResolved = [];
  const officialUnverified = [];
  const officialMismatches = [];
  const testudoCandidates = [];
  if (titleDrifts.length && !opts.skipOfficialTitleCheck) {
    const officialRows = await mapLimit(titleDrifts, 3, async drift => ({
      drift,
      official: await fetchOfficialCatalogCourse(drift.code),
    }));
    officialRows.forEach(({ drift, official }) => {
      if (!official?.ok) {
        officialUnverified.push(`${displayCode(drift.code)} (${official?.detail || 'official catalog unavailable'})`);
        return;
      }
      const appTitleOk = titlesCompatible(drift.appTitle, official.title);
      const appCreditsOk = officialCreditsCompatible(official.credits, drift.appCredits);
      if (!appTitleOk || !appCreditsOk) {
        const creditText = official.credits?.raw ? `, official credits ${official.credits.raw}` : '';
        officialMismatches.push(`${displayCode(drift.code)} app "${drift.appTitle}" (${drift.appCredits || '?'}) != official UMD "${official.title}"${creditText}`);
        return;
      }
      officialResolved.push(`${displayCode(drift.code)} official "${official.title}" vs PlanetTerp "${drift.planetTitle}"`);
      if (titleNeedsTermSpecificCheck(drift.appTitle, official.title)) {
        testudoCandidates.push({ ...drift, officialTitle: official.title });
      }
    });
  }
  assert(
    !officialMismatches.length,
    `Catalog sweep official UMD title/credit mismatches ${officialMismatches.length}/${titleDrifts.length}: ${officialMismatches.slice(0, 20).join('; ')}${officialMismatches.length > 20 ? `; +${officialMismatches.length - 20} more` : ''}`,
  );
  const testudoResolved = [];
  const testudoUnavailable = [];
  const testudoMismatches = [];
  if (testudoCandidates.length && !opts.skipTestudoTitleCheck) {
    const testudoRows = await mapLimit(testudoCandidates, 2, async candidate => ({
      candidate,
      rows: await fetchTestudoCourseAcrossTerms(candidate.code, opts.testudoTerms),
    }));
    testudoRows.forEach(({ candidate, rows }) => {
      const posted = (rows || []).filter(row => row?.ok);
      if (!posted.length) {
        const details = (rows || []).map(row => `${row.term || 'term'} ${row?.detail || 'unavailable'}`).join(', ');
        testudoUnavailable.push(`${displayCode(candidate.code)} (${details || 'no configured Testudo terms posted a title'})`);
        return;
      }
      const compatible = posted.filter(row => titlesCompatible(candidate.appTitle, row.title));
      if (!compatible.length) {
        testudoMismatches.push(`${displayCode(candidate.code)} app "${candidate.appTitle}" != Testudo ${posted.map(row => `${row.term} "${row.title}"`).join(', ')}`);
        return;
      }
      testudoResolved.push(`${displayCode(candidate.code)} ${compatible.map(row => `${row.term} "${row.title}"`).join(', ')}`);
    });
  }
  assert(
    !testudoMismatches.length,
    `Catalog sweep Testudo term-title mismatches ${testudoMismatches.length}/${testudoCandidates.length}: ${testudoMismatches.slice(0, 20).join('; ')}${testudoMismatches.length > 20 ? `; +${testudoMismatches.length - 20} more` : ''}`,
  );

  const reused = coverageRows
    .slice()
    .sort((a, b) => b.majors - a.majors || a.code.localeCompare(b.code))
    .slice(0, 8)
    .map(row => `${displayCode(row.code)}:${row.majors}`)
    .join(', ');
  console.log(`Catalog sweep matched ${coverageRows.length}/${codes.length} unique generated required courses against app live metadata and PlanetTerp.`);
  if (titleDrifts.length && opts.skipOfficialTitleCheck) {
    const notes = titleDrifts.map(drift => `${displayCode(drift.code)} app "${drift.appTitle}" vs PlanetTerp "${drift.planetTitle}"`);
    console.log(`Catalog sweep noted ${notes.length} PlanetTerp title drift${notes.length === 1 ? '' : 's'} where app/UMD metadata may be newer: ${notes.slice(0, 10).join('; ')}${notes.length > 10 ? `; +${notes.length - 10} more` : ''}.`);
  } else if (titleDrifts.length) {
    console.log(`Official UMD catalog confirmed app-compatible titles for ${officialResolved.length}/${titleDrifts.length} PlanetTerp title drift${titleDrifts.length === 1 ? '' : 's'}: ${officialResolved.slice(0, 10).join('; ')}${officialResolved.length > 10 ? `; +${officialResolved.length - 10} more` : ''}.`);
    if (officialUnverified.length) {
      console.log(`Official UMD catalog title check could not verify ${officialUnverified.length}/${titleDrifts.length} drift${officialUnverified.length === 1 ? '' : 's'}: ${officialUnverified.slice(0, 10).join('; ')}${officialUnverified.length > 10 ? `; +${officialUnverified.length - 10} more` : ''}.`);
    }
  } else {
    console.log('Catalog sweep found no PlanetTerp title drifts.');
  }
  if (testudoCandidates.length && opts.skipTestudoTitleCheck) {
    console.log(`Testudo term-title check skipped for ${testudoCandidates.length} official base-title drift${testudoCandidates.length === 1 ? '' : 's'} across ${opts.testudoTerms.join(', ')}.`);
  } else if (testudoCandidates.length) {
    console.log(`Testudo confirmed term-specific app titles for ${testudoResolved.length}/${testudoCandidates.length} official base-title drift${testudoCandidates.length === 1 ? '' : 's'} across ${opts.testudoTerms.join(', ')}: ${testudoResolved.slice(0, 10).join('; ')}${testudoResolved.length > 10 ? `; +${testudoResolved.length - 10} more` : ''}.`);
    if (testudoUnavailable.length) {
      console.log(`Testudo term-title check could not verify ${testudoUnavailable.length}/${testudoCandidates.length} base-title drift${testudoUnavailable.length === 1 ? '' : 's'} in configured terms: ${testudoUnavailable.slice(0, 10).join('; ')}${testudoUnavailable.length > 10 ? `; +${testudoUnavailable.length - 10} more` : ''}.`);
    }
  } else if (titleDrifts.length && !opts.skipOfficialTitleCheck) {
    console.log('Testudo term-title check found no official base-title drifts requiring term-specific confirmation.');
  }
  console.log(`Most reused generated requirements: ${reused || 'none'}.`);
  const summary = {
    checkedAt: opts.snapshotDate || currentDateLabel(),
    seed: opts.seed,
    source: 'app live metadata + PlanetTerp',
    uniqueCourses: totalEntries,
    generatedMajors: majors.length,
    requirementRows: rows.length,
    matchedCourses: coverageRows.length,
    missingCourses: appMissing.length + planetMissing.length,
    creditMismatches: mismatches.length,
    titleDrifts: titleDrifts.length,
    officialTitleChecks: officialResolved.length,
    officialTitleMismatches: officialMismatches.length,
    testudoTermTitleCandidates: testudoCandidates.length,
    testudoTermTitleChecks: testudoResolved.length,
    testudoTermTitleMismatches: testudoMismatches.length,
    testudoTerms: opts.testudoTerms.join(','),
  };
  summary.command = catalogSweepCommand(summary);
  return summary;
}

async function main() {
  const opts = parseArgs(process.argv);
  const rand = mulberry32(hashSeed(opts.seed));
  const context = buildContext();
  if (opts.catalogSweep) {
    const summary = await verifyCatalogSweep(context, opts);
    if (opts.writeSettingsSnapshot) {
      const write = writeCatalogSweepSettingsSnapshot(summary, opts);
      console.log(`Settings catalog sweep snapshot ${write.changed ? 'updated' : 'already current'} in js/settings.js.`);
      if (write.asset) console.log(`Bumped js/settings.js asset version from v${write.asset.current} to v${write.asset.next}.`);
    }
    return;
  }
  const majors = generatedMajors(context);
  if (!majors.length && !opts.majors.length) {
    console.log(`Random schedule verifier seed=${opts.seed} count=0/0`);
    console.log('No generated majors remain; every built-in major currently uses a curated fixed schedule.');
    console.log('Verified 0 generated schedules against PlanetTerp.');
    return;
  }
  const sample = opts.majors.length
    ? opts.majors.map(id => majors.find(major => major.id === id) || fail(`Unknown generated major for verification: ${id}`))
    : (opts.all ? majors : shuffle(majors, rand).slice(0, Math.min(opts.count, majors.length)));
  assert(sample.length, 'No generated majors available for random schedule verification.');
  console.log(`Random schedule verifier seed=${opts.seed} count=${sample.length}/${majors.length}`);
  const rows = [];
  const failures = [];
  for (const major of sample) {
    try {
      const row = await verifyMajor(context, major, rand);
      rows.push(row);
      console.log(`${row.id}: ${row.credits} credits, ${row.required} required courses verified in PlanetTerp, ${row.titleCreditChecked} live title/credit pairs matched, ${row.placeholders} placeholders, ${row.requirementGroups}, ${row.levelPath}, max ${row.maxTermLoad} cr (${row.profile}, ${row.start})`);
    } catch (error) {
      if (!opts.keepGoing) throw error;
      const message = error?.message || String(error);
      failures.push({ id: major.id, message });
      console.error(`${major.id}: FAIL ${message}`);
    }
  }
  if (failures.length) {
    fail(`${failures.length} generated schedule${failures.length === 1 ? '' : 's'} failed verification: ${failures.map(item => item.id).join(', ')}`);
  }
  console.log(`Verified ${rows.length} generated schedules against PlanetTerp.`);
}

if (require.main === module) {
  main().catch(error => {
    console.error(error.stack || error.message || String(error));
    process.exit(1);
  });
} else {
  module.exports = {
    decodeHtmlEntities,
    extractOfficialCatalogCourse,
    extractTestudoCourse,
    formatCatalogSweepSettingsBlock,
    htmlToText,
    officialCreditsCompatible,
    parseOfficialCreditText,
    replaceCatalogSweepSettingsBlock,
    titleNeedsTermSpecificCheck,
    titlesCompatible,
  };
}
