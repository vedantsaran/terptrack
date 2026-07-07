#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const {
  extractOfficialCatalogCourse,
  officialCreditsCompatible,
  titlesCompatible,
} = require('./verify-random-schedules.js');

const ROOT = path.resolve(__dirname, '..');
const OFFICIAL_CATALOG_COURSE_BASE = 'https://academiccatalog.umd.edu/undergraduate/approved-courses';
const PLANETTERP_COURSE_BASE = 'https://planetterp.com/api/v1/course';
const CURRENT_PREFIX_BY_LEGACY_PREFIX = Object.freeze({
  AASP: 'AAAS',
  WMST: 'WGSS',
});

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function normalizeCode(code) {
  return String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function displayCode(code) {
  const id = normalizeCode(code);
  const match = id.match(/^([A-Z]{2,5})(\d{3}[A-Z]?)$/);
  return match ? `${match[1]} ${match[2]}` : String(code || '');
}

function codeParts(code) {
  const match = normalizeCode(code).match(/^([A-Z]{2,5})(\d{3})([A-Z]?)$/);
  return match ? { dept: match[1], number: match[2], suffix: match[3] || '' } : null;
}

function baseTopicCode(code) {
  const parts = codeParts(code);
  if (!parts || !parts.suffix) return normalizeCode(code);
  return `${parts.dept}${parts.number}`;
}

function currentPrefixCode(code) {
  const parts = codeParts(code);
  if (!parts) return normalizeCode(code);
  const current = CURRENT_PREFIX_BY_LEGACY_PREFIX[parts.dept];
  return current ? `${current}${parts.number}${parts.suffix}` : normalizeCode(code);
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
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

function parseArgs(argv) {
  const opts = {
    seed: process.env.TERPTRACK_CURATED_CATALOG_SEED || 'curated-catalog-sweep',
    limit: null,
    majors: [],
    json: false,
    strictTitles: false,
    warningLimit: 40,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--seed') {
      opts.seed = argv[++i] || opts.seed;
    } else if (arg.startsWith('--seed=')) {
      opts.seed = arg.slice('--seed='.length) || opts.seed;
    } else if (arg === '--limit') {
      opts.limit = Number(argv[++i] || 0);
    } else if (arg.startsWith('--limit=')) {
      opts.limit = Number(arg.slice('--limit='.length) || 0);
    } else if (arg === '--major' || arg === '--majors') {
      opts.majors.push(...String(argv[++i] || '').split(','));
    } else if (arg.startsWith('--major=')) {
      opts.majors.push(...arg.slice('--major='.length).split(','));
    } else if (arg.startsWith('--majors=')) {
      opts.majors.push(...arg.slice('--majors='.length).split(','));
    } else if (arg === '--json') {
      opts.json = true;
    } else if (arg === '--strict-titles') {
      opts.strictTitles = true;
    } else if (arg === '--warning-limit') {
      opts.warningLimit = argv[++i] || opts.warningLimit;
    } else if (arg.startsWith('--warning-limit=')) {
      opts.warningLimit = arg.slice('--warning-limit='.length) || opts.warningLimit;
    } else {
      fail(`Unknown argument: ${arg}`);
    }
  }
  opts.limit = Number.isFinite(opts.limit) && opts.limit > 0 ? Math.floor(opts.limit) : null;
  opts.majors = unique(opts.majors.map(item => String(item || '').trim().toUpperCase()));
  if (/^(all|full)$/i.test(String(opts.warningLimit || ''))) {
    opts.warningLimit = Number.MAX_SAFE_INTEGER;
  } else {
    opts.warningLimit = Number(opts.warningLimit);
    opts.warningLimit = Number.isFinite(opts.warningLimit) && opts.warningLimit >= 0 ? Math.floor(opts.warningLimit) : 40;
  }
  return opts;
}

function buildContext() {
  const storage = new Map();
  const context = {
    console,
    setTimeout,
    clearTimeout,
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
  return context;
}

function collectCuratedCourses(context, opts) {
  const rows = vm.runInContext(`(() => {
    const realCode = code => /^[A-Z]{2,5}\\s?\\d{3}[A-Z]?$/i.test(String(code || '').trim());
    const clone = value => JSON.parse(JSON.stringify(value));
    const scheduleFor = major => major.useDefaultSchedule ? SCHEDULE : major.fixedSchedule;
    const wanted = new Set(${JSON.stringify(opts.majors)});
    const rows = [];
    Object.values(MAJOR_TEMPLATES)
      .filter(isMajorFullyBaked)
      .filter(major => !wanted.size || wanted.has(major.id))
      .sort((a, b) => a.id.localeCompare(b.id))
      .forEach(major => {
        clone(scheduleFor(major)).forEach(term => {
          (term.courses || []).forEach(course => {
            if (!realCode(course.code)) return;
            rows.push({
              majorId: major.id,
              majorName: major.name,
              termId: term.id,
              termName: term.name,
              code: course.code,
              title: course.title,
              cr: course.cr,
            });
          });
        });
      });
    return rows;
  })()`, context);
  const byCode = new Map();
  rows.forEach(row => {
    const id = normalizeCode(row.code);
    if (!byCode.has(id)) {
      byCode.set(id, {
        code: id,
        titles: new Set(),
        credits: new Set(),
        majors: new Set(),
        rows: [],
      });
    }
    const entry = byCode.get(id);
    entry.titles.add(row.title || '');
    entry.credits.add(String(row.cr || ''));
    entry.majors.add(row.majorId);
    entry.rows.push(row);
  });
  return Array.from(byCode.values())
    .map(entry => ({
      code: entry.code,
      titles: Array.from(entry.titles).sort(),
      credits: Array.from(entry.credits).sort(),
      majors: Array.from(entry.majors).sort(),
      rowCount: entry.rows.length,
      rows: entry.rows,
    }))
    .sort((a, b) => a.code.localeCompare(b.code));
}

const officialDeptCache = new Map();
const planetTerpCache = new Map();

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetries(url, options = {}, attempts = 3) {
  let lastError = null;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, options);
      if (response.ok || response.status < 500 || attempt === attempts) return response;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
      if (attempt === attempts) throw error;
    }
    await wait(250 * attempt);
  }
  throw lastError || new Error(`Failed to fetch ${url}`);
}

async function fetchOfficialDept(dept) {
  const id = String(dept || '').trim().toLowerCase();
  if (officialDeptCache.has(id)) return officialDeptCache.get(id);
  const url = `${OFFICIAL_CATALOG_COURSE_BASE}/${encodeURIComponent(id)}/`;
  let result;
  try {
    const response = await fetchWithRetries(url, {
      headers: {
        accept: 'text/html,application/xhtml+xml',
        'user-agent': 'TerpTrack/curated-catalog-sweep',
      },
    });
    result = response.ok
      ? { ok: true, url, html: await response.text() }
      : { ok: false, url, detail: `HTTP ${response.status}` };
  } catch (error) {
    result = { ok: false, url, detail: error?.message || String(error) };
  }
  officialDeptCache.set(id, result);
  return result;
}

function officialCandidates(code) {
  const id = normalizeCode(code);
  const current = currentPrefixCode(id);
  return unique([
    id,
    baseTopicCode(id),
    current,
    baseTopicCode(current),
  ]).map(candidate => ({
    code: candidate,
    mode: candidate === id
      ? 'exact'
      : (candidate === baseTopicCode(id) ? 'base-topic' : (candidate === current ? 'current-prefix' : 'current-prefix-base-topic')),
  }));
}

async function fetchOfficialResolution(code) {
  const candidates = officialCandidates(code);
  const depts = unique(candidates.map(candidate => {
    const parts = codeParts(candidate.code);
    return parts ? parts.dept : '';
  }));
  const pages = await Promise.all(depts.map(fetchOfficialDept));
  const pageByDept = new Map(depts.map((dept, index) => [dept, pages[index]]));
  const details = [];
  for (const candidate of candidates) {
    const parts = codeParts(candidate.code);
    if (!parts) continue;
    const page = pageByDept.get(parts.dept);
    if (!page?.ok) {
      details.push(`${parts.dept}: ${page?.detail || 'unavailable'}`);
      continue;
    }
    const official = extractOfficialCatalogCourse(page.html, candidate.code);
    if (!official) continue;
    return {
      ok: true,
      requestedCode: normalizeCode(code),
      matchedCode: official.code,
      mode: candidate.mode,
      title: official.title,
      credits: official.credits,
      url: page.url,
    };
  }
  return {
    ok: false,
    requestedCode: normalizeCode(code),
    detail: details.join('; ') || 'course not found on official UMD catalog pages',
  };
}

async function fetchPlanetTerpCourse(code) {
  const id = normalizeCode(code);
  if (planetTerpCache.has(id)) return planetTerpCache.get(id);
  const url = `${PLANETTERP_COURSE_BASE}?name=${encodeURIComponent(id)}`;
  let result;
  try {
    const response = await fetchWithRetries(url, { headers: { accept: 'application/json' } });
    if (!response.ok) {
      let detail = `HTTP ${response.status}`;
      try {
        const body = await response.json();
        if (body?.error) detail = body.error;
      } catch {}
      result = { ok: false, code: id, detail };
    } else {
      const data = await response.json();
      result = {
        ok: normalizeCode(data?.name || '') === id,
        code: id,
        title: data?.title || '',
        credits: data?.credits,
        detail: normalizeCode(data?.name || '') === id ? '' : `PlanetTerp returned ${data?.name || 'unknown course'}`,
      };
    }
  } catch (error) {
    result = { ok: false, code: id, detail: error?.message || String(error) };
  }
  planetTerpCache.set(id, result);
  return result;
}

async function fetchPlanetTerpResolution(code, official) {
  const candidates = unique([
    normalizeCode(code),
    currentPrefixCode(code),
    official?.matchedCode || '',
  ]);
  const rows = await Promise.all(candidates.map(fetchPlanetTerpCourse));
  return rows.find(row => row?.ok) || rows[0] || { ok: false, code: normalizeCode(code), detail: 'no PlanetTerp candidate' };
}

function creditsCompatible(credits, value) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n <= 0) return true;
  return officialCreditsCompatible(credits, n);
}

function planetCreditsCompatible(planetCredits, value) {
  const app = Number.parseInt(value, 10);
  const planet = Number.parseInt(planetCredits, 10);
  if (!Number.isFinite(app) || !Number.isFinite(planet) || app <= 0 || planet <= 0) return true;
  return app === planet;
}

function compatibilityRows(entry, official, planet) {
  const failures = [];
  const warnings = [];
  const creditWarnings = [];
  const titleWarnings = [];
  entry.credits.forEach(value => {
    const officialOk = official?.ok && creditsCompatible(official.credits, value);
    const planetOk = planet?.ok && planetCreditsCompatible(planet.credits, value);
    if (official?.ok && !officialOk) {
      failures.push(`${displayCode(entry.code)} curated credits ${value} != official ${official.credits?.raw || '?'}`);
    } else if (!official?.ok && planet?.ok && !planetOk) {
      failures.push(`${displayCode(entry.code)} curated credits ${value} != PlanetTerp ${planet.credits || '?'}`);
    } else if (officialOk && planet?.ok && !planetOk) {
      const warning = `${displayCode(entry.code)} PlanetTerp credits ${planet.credits || '?'} differ from official-compatible curated credits ${value}`;
      warnings.push(warning);
      creditWarnings.push(warning);
    }
  });
  entry.titles.forEach(title => {
    const officialOk = official?.ok && titlesCompatible(title, official.title);
    const planetOk = planet?.ok && titlesCompatible(title, planet.title);
    if ((official?.ok || planet?.ok) && !officialOk && !planetOk) {
      const sources = [
        official?.ok ? `official "${official.title}"` : '',
        planet?.ok ? `PlanetTerp "${planet.title}"` : '',
      ].filter(Boolean).join(' / ');
      const warning = `${displayCode(entry.code)} title "${title}" differs from ${sources}`;
      warnings.push(warning);
      titleWarnings.push(warning);
    }
  });
  return { failures, warnings, creditWarnings, titleWarnings };
}

async function mapLimit(list, limit, fn) {
  const out = new Array(list.length);
  let index = 0;
  async function worker() {
    while (index < list.length) {
      const current = index++;
      out[current] = await fn(list[current], current);
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, Math.min(limit, list.length)) }, worker));
  return out;
}

async function verifyCuratedCatalogSweep(context, opts) {
  const allEntries = collectCuratedCourses(context, opts);
  let entries = allEntries;
  if (opts.limit && opts.limit < entries.length) {
    entries = shuffle(entries, mulberry32(hashSeed(opts.seed))).slice(0, opts.limit).sort((a, b) => a.code.localeCompare(b.code));
  }
  assert(entries.length, 'No curated real course rows available for catalog sweep.');
  const rows = await mapLimit(entries, 5, async entry => {
    const official = await fetchOfficialResolution(entry.code);
    const planet = await fetchPlanetTerpResolution(entry.code, official);
    const compatibility = compatibilityRows(entry, official, planet);
    return { entry, official, planet, ...compatibility };
  });
  const missing = [];
  const failures = [];
  const warnings = [];
  const creditWarnings = [];
  const titleWarnings = [];
  rows.forEach(row => {
    if (!row.official?.ok && !row.planet?.ok) {
      missing.push(`${displayCode(row.entry.code)} (${row.entry.majors.join(',')}; official: ${row.official?.detail || 'missing'}; PlanetTerp: ${row.planet?.detail || 'missing'})`);
    }
    failures.push(...row.failures);
    warnings.push(...row.warnings);
    creditWarnings.push(...row.creditWarnings);
    titleWarnings.push(...row.titleWarnings);
  });
  assert(!missing.length, `Curated catalog sweep could not verify ${missing.length}/${entries.length} courses in either official catalog or PlanetTerp: ${missing.slice(0, 25).join('; ')}${missing.length > 25 ? `; +${missing.length - 25} more` : ''}`);
  assert(!failures.length, `Curated catalog sweep found ${failures.length} credit mismatch${failures.length === 1 ? '' : 'es'}: ${failures.slice(0, 25).join('; ')}${failures.length > 25 ? `; +${failures.length - 25} more` : ''}`);
  assert(!opts.strictTitles || !titleWarnings.length, `Curated catalog sweep found ${titleWarnings.length} title drift warning${titleWarnings.length === 1 ? '' : 's'}: ${titleWarnings.slice(0, 25).join('; ')}${titleWarnings.length > 25 ? `; +${titleWarnings.length - 25} more` : ''}`);
  const officialMatches = rows.filter(row => row.official?.ok).length;
  const planetMatches = rows.filter(row => row.planet?.ok).length;
  const bothMatches = rows.filter(row => row.official?.ok && row.planet?.ok).length;
  const baseTopicMatches = rows.filter(row => /base-topic/.test(row.official?.mode || '')).length;
  const currentPrefixMatches = rows.filter(row => /current-prefix/.test(row.official?.mode || '')).length;
  const summary = {
    seed: opts.seed,
    checkedCourses: entries.length,
    totalCourses: allEntries.length,
    curatedRows: allEntries.reduce((sum, entry) => sum + entry.rowCount, 0),
    officialMatches,
    planetMatches,
    bothMatches,
    baseTopicMatches,
    currentPrefixMatches,
    warningCount: warnings.length,
    creditWarningCount: creditWarnings.length,
    titleWarningCount: titleWarnings.length,
    warnings: warnings.slice(0, opts.warningLimit),
    creditWarnings: creditWarnings.slice(0, opts.warningLimit),
    titleWarnings: titleWarnings.slice(0, opts.warningLimit),
  };
  if (opts.json) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    console.log(`Curated catalog sweep verified ${entries.length}/${allEntries.length} unique real curated courses across ${summary.curatedRows} schedule rows.`);
    console.log(`Sources: official UMD catalog ${officialMatches}, PlanetTerp ${planetMatches}, both ${bothMatches}; base-topic matches ${baseTopicMatches}; legacy-prefix matches ${currentPrefixMatches}.`);
    if (warnings.length) {
      console.log(`Warnings ${warnings.length} (${titleWarnings.length} title, ${creditWarnings.length} credit-source): ${warnings.slice(0, 12).join('; ')}${warnings.length > 12 ? `; +${warnings.length - 12} more` : ''}.`);
    } else {
      console.log('No title or credit-source warnings.');
    }
  }
  return summary;
}

async function main() {
  const opts = parseArgs(process.argv);
  const context = buildContext();
  await verifyCuratedCatalogSweep(context, opts);
}

if (require.main === module) {
  main().catch(error => {
    console.error(error.stack || error.message || String(error));
    process.exit(1);
  });
} else {
  module.exports = {
    collectCuratedCourses,
    parseArgs,
    verifyCuratedCatalogSweep,
  };
}
