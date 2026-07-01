#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

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
    keepGoing: false,
    majors: [],
  };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--all') {
      opts.all = true;
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
  opts.majors = Array.from(new Set(opts.majors.map(item => String(item || '').trim().toUpperCase()).filter(Boolean)));
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

function creditValue(value) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
    titleCreditChecked: checks.length,
  };
}

async function main() {
  const opts = parseArgs(process.argv);
  const rand = mulberry32(hashSeed(opts.seed));
  const context = buildContext();
  const majors = clone(vm.runInContext(`
    listMajors()
      .filter(major => !isMajorFullyBaked(major) && majorAllCodes(major).length)
      .map(major => ({ id: major.id, name: major.name, college: major.college }))
      .sort((a, b) => a.id.localeCompare(b.id))
  `, context));
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
      console.log(`${row.id}: ${row.credits} credits, ${row.required} required courses verified in PlanetTerp, ${row.titleCreditChecked} live title/credit pairs matched, ${row.placeholders} placeholders, max ${row.maxTermLoad} cr (${row.profile}, ${row.start})`);
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

main().catch(error => {
  console.error(error.stack || error.message || String(error));
  process.exit(1);
});
