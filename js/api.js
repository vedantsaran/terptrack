'use strict';
/* ============================================================
   API LAYER — umd.io + PlanetTerp
   ============================================================ */

const UMDIO_BASE = 'https://api.umd.io/v1';
const UMDIO_CACHE_KEY = 'terp-track-umdio-cache-v2';
const UMDIO_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const UMDIO_SECTION_CACHE_TTL_MS = 1000 * 60 * 15; // 15 minutes; seats change quickly
const UMDIO_FETCH_TIMEOUT_MS = 6500;

function umdioNormalizePath(pathAndQuery) {
  const raw = String(pathAndQuery || '').trim();
  return raw.startsWith('/') ? raw : `/${raw}`;
}

function umdioProxyUrl(pathAndQuery) {
  const clean = umdioNormalizePath(pathAndQuery);
  if (!/^\/courses(?:[/?]|$)/.test(clean)) return '';
  const loc = typeof window !== 'undefined' ? window.location : null;
  if (!loc || !/^https?:$/.test(loc.protocol || '')) return '';
  return `/api/umd?path=${encodeURIComponent(clean)}`;
}

async function fetchWithTimeout(url, opts = {}, timeoutMs = UMDIO_FETCH_TIMEOUT_MS) {
  let timer = null;
  try {
    return await Promise.race([
      fetch(url, opts),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('request timed out')), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function umdioFetchPath(pathAndQuery, opts = {}, timeoutMs = UMDIO_FETCH_TIMEOUT_MS) {
  const clean = umdioNormalizePath(pathAndQuery);
  const proxy = umdioProxyUrl(clean);
  const urls = proxy ? [proxy, `${UMDIO_BASE}${clean}`] : [`${UMDIO_BASE}${clean}`];
  let lastError = null;
  for (const url of urls) {
    try {
      const resp = await fetchWithTimeout(url, opts, timeoutMs);
      if (url === proxy) {
        const marker = resp.headers && resp.headers.get ? resp.headers.get('x-terptrack-proxy') : '';
        if (resp.ok || marker === 'umd-io') return resp;
        lastError = new Error(`umd.io proxy returned HTTP ${resp.status}`);
        continue;
      }
      return resp;
    } catch (error) {
      lastError = error;
      if (url === proxy) break;
    }
  }
  throw lastError || new Error('umd.io request failed');
}

function umdioCacheLoad() {
  try { return JSON.parse(localStorage.getItem(UMDIO_CACHE_KEY) || '{}'); }
  catch { return {}; }
}
function umdioCacheSave(c) {
  try { localStorage.setItem(UMDIO_CACHE_KEY, JSON.stringify(c)); } catch {}
}
// Returns the cached value (which may be null for known-404s) or undefined
// if there's no fresh entry. Lets callers distinguish "cache hit, no such
// course" from "cache miss".
function umdioCacheGet(key, ttlMs) {
  const cache = umdioCacheLoad();
  const e = cache[key];
  if (!e) return undefined;
  if (Date.now() - e.t > (ttlMs || UMDIO_CACHE_TTL_MS)) return undefined;
  return e.v;
}
function umdioCachePut(key, value) {
  const cache = umdioCacheLoad();
  cache[key] = { t: Date.now(), v: value };
  umdioCacheSave(cache);
}

const _umdioInflight = {};
async function umdioFetchCourse(code) {
  const id = normalizeCode(code);
  const cacheKey = 'course:' + id;
  const cached = umdioCacheGet(cacheKey);
  if (cached !== undefined) return cached; // cache hit (may be null for 404)
  if (_umdioInflight[id]) return _umdioInflight[id];
  _umdioInflight[id] = (async () => {
    let resp;
    try { resp = await umdioFetchPath(`/courses/${encodeURIComponent(id)}`); }
    catch (e) { return null; }
    if (!resp.ok) {
      if (resp.status === 404) { umdioCachePut(cacheKey, null); return null; }
      return null; // transient — don't poison cache
    }
    const data = await resp.json();
    const course = Array.isArray(data) ? data[0] : data;
    if (course) umdioCachePut(cacheKey, course);
    return course || null;
  })();
  try { return await _umdioInflight[id]; }
  finally { delete _umdioInflight[id]; }
}

async function umdioFetchPagedCourses(params, cacheKey, maxPages = 12) {
  const cached = umdioCacheGet(cacheKey);
  if (cached) return cached;
  const all = [];
  for (let page = 1; page <= maxPages; page++) {
    const pageParams = new URLSearchParams(params);
    pageParams.set('per_page', '100');
    pageParams.set('page', String(page));
    let resp;
    try { resp = await umdioFetchPath(`/courses?${pageParams}`); }
    catch (e) { return all; }
    if (!resp.ok) return all;
    const data = await resp.json();
    if (!Array.isArray(data) || !data.length) break;
    all.push(...data);
    if (data.length < 100) break;
  }
  umdioCachePut(cacheKey, all);
  return all;
}

async function umdioListCoursesByDept(dept, semester) {
  const cleanDept = String(dept || '').trim().toUpperCase();
  if (!cleanDept) return [];
  const params = new URLSearchParams({ dept_id: cleanDept });
  if (semester) params.set('semester', semester);
  return umdioFetchPagedCourses(params, `dept:${cleanDept}:${semester || 'any'}:paged`);
}

async function umdioListCoursesByGenEd(tag, opts = {}) {
  const cleanTag = String(tag || '').trim().toUpperCase();
  if (!cleanTag) return [];
  const cleanDept = opts.dept ? String(opts.dept).trim().toUpperCase() : '';
  const params = new URLSearchParams({ gen_ed: cleanTag });
  if (cleanDept) params.set('dept_id', cleanDept);
  if (opts.semester) params.set('semester', opts.semester);
  const key = `gened:${cleanTag}:${cleanDept || 'all'}:${opts.semester || 'any'}:paged`;
  return umdioFetchPagedCourses(params, key);
}

async function umdioFetchSemesters() {
  const key = 'semesters';
  const cached = umdioCacheGet(key, UMDIO_CACHE_TTL_MS);
  if (cached !== undefined) return cached;
  let resp;
  try { resp = await umdioFetchPath('/courses/semesters'); }
  catch (e) { return []; }
  if (!resp.ok) return [];
  const data = await resp.json();
  const semesters = Array.isArray(data) ? data.map(String) : [];
  umdioCachePut(key, semesters);
  return semesters;
}

async function umdioFetchSections(courseCode, semester) {
  const id = normalizeCode(courseCode);
  const term = String(semester || '').trim();
  if (!id || !term || !/^[A-Z]{3,4}\d{3}[A-Z]?$/.test(id)) return [];
  const cacheKey = `sections:${term}:${id}`;
  const cached = umdioCacheGet(cacheKey, UMDIO_SECTION_CACHE_TTL_MS);
  if (cached !== undefined) return cached || [];
  let resp;
  try {
    resp = await umdioFetchPath(`/courses/${encodeURIComponent(id)}/sections?semester=${encodeURIComponent(term)}`, {}, 5000);
  } catch (e) {
    return [];
  }
  if (!resp.ok) {
    if (resp.status === 404) umdioCachePut(cacheKey, []);
    return [];
  }
  const data = await resp.json();
  const sections = Array.isArray(data) ? data : [];
  umdioCachePut(cacheKey, sections);
  return sections;
}

// Display form: "CMSC 131" — UMD-style with space before number
function displayCode(code) {
  const id = normalizeCode(code);
  const m = id.match(/^([A-Z]{3,4})(\d{3}[A-Z]?)$/);
  return m ? `${m[1]} ${m[2]}` : code;
}

// Pull every course code referenced in a free-text prereq blurb.
// e.g. "Minimum grade of C- in CMSC131; or permission of department"
//   -> ["CMSC131"]
function extractCourseCodes(text) {
  if (!text) return [];
  const re = /\b([A-Z]{3,4})\s*(\d{3}[A-Z]?)\b/g;
  const out = new Set();
  let m;
  while ((m = re.exec(text)) !== null) out.add(`${m[1]}${m[2]}`);
  return Array.from(out);
}

// Parse a free-text prereq blurb into AND-of-OR groups.
// Returns [[code, code, ...], [code, ...]]:
//   outer array = AND, inner array = OR alternatives.
// Heuristics:
//   - split on ';' or ' and ' (top-level conjunctions)
//   - within each chunk, split on ' or '/'either ... or'
//   - extract codes from each piece
// Imperfect on nested parens but covers the vast majority of UMD descriptions.
function parsePrereqGroups(text) {
  if (!text) return [];
  // Normalize whitespace but preserve paren depth so we can split only at top-level.
  const cleaned = text.replace(/\s+/g, ' ').trim();

  function splitTopLevel(input, isBoundary) {
    const parts = [];
    let depth = 0;
    let start = 0;
    for (let i = 0; i < input.length; i++) {
      const ch = input[i];
      if (ch === '(') { depth++; continue; }
      if (ch === ')') { depth = Math.max(0, depth - 1); continue; }
      if (depth !== 0) continue;
      const m = isBoundary(input, i);
      if (!m) continue;
      const left = input.slice(start, i).trim();
      if (left) parts.push(left);
      i += m.length - 1;
      start = i + 1;
    }
    const tail = input.slice(start).trim();
    if (tail) parts.push(tail);
    return parts;
  }

  function andBoundary(input, idx) {
    if (input[idx] === ';') return ';';
    const rest = input.slice(idx);
    const andWord = rest.match(/^\s+,?\s*and\s+/i);
    return andWord ? andWord[0] : null;
  }

  function orBoundary(input, idx) {
    const rest = input.slice(idx);
    const orWord = rest.match(/^\s+or\s+/i);
    if (orWord) return orWord[0];
    const slash = rest.match(/^\s*\/\s*/);
    return slash ? slash[0] : null;
  }

  const andChunks = splitTopLevel(cleaned, andBoundary);
  const groups = [];
  for (const chunk of andChunks) {
    if (!chunk.trim()) continue;
    // Drop optional leading "either" then split OR at top-level only.
    const normalizedChunk = chunk.replace(/^\s*either\s+/i, '');
    const orParts = splitTopLevel(normalizedChunk, orBoundary);
    const orCodes = new Set();
    for (const part of orParts) {
      extractCourseCodes(part).forEach(c => orCodes.add(c));
    }
    if (orCodes.size) groups.push(Array.from(orCodes).map(displayCode));
  }
  return groups;
}

// Map umd.io gen_ed array (e.g. [["FSAW"], ["DSHS","DVUP"]]) to our category strings
function genEdToCategory(genEdArray) {
  if (!Array.isArray(genEdArray)) return null;
  const flat = genEdArray.flat().filter(Boolean);
  if (!flat.length) return null;
  // Prefer stable ordering so multi-tag courses map consistently.
  const tag = flat.map(t => String(t).toLowerCase()).sort()[0];
  return `gened-${tag}`;
}

function genEdTags(genEdArray) {
  if (!Array.isArray(genEdArray)) return [];
  return Array.from(new Set(genEdArray.flat().filter(Boolean).map(t => String(t).toLowerCase())));
}

// Combined fetch: PlanetTerp for credits/GPA, umd.io for structured prereqs
// and GenEd metadata.
async function fetchCourseFull(code) {
  const id = normalizeCode(code);
  const [umd, pt] = await Promise.all([
    umdioFetchCourse(id),
    planetTerpFetchCourse(id).catch(() => null),
  ]);
  if (!umd && !pt) return null;
  const display = displayCode(id);
  const credits = parseInt((pt && pt.credits) || (umd && umd.credits) || '3', 10) || 3;
  const title = (umd && umd.name) || (pt && pt.title) || display;
  const prereqText = umd && umd.relationships ? umd.relationships.prereqs : (pt && pt.prerequisites);
  const prereqGroups = parsePrereqGroups(prereqText);
  const prereqCodes = prereqGroups.length
    ? prereqGroups.map(g => (g && g.length ? g[0] : null)).filter(Boolean)
    : extractCourseCodes(prereqText).map(displayCode);
  const allPrereqCodes = extractCourseCodes(prereqText).map(displayCode);
  const coreqCodes = extractCourseCodes(umd && umd.relationships ? umd.relationships.coreqs : '').map(displayCode);
  const genEd = umd && umd.gen_ed ? umd.gen_ed : null;
  const category = genEdToCategory(genEd) || 'major-core';
  const genEdCategories = genEdTags(genEd).map(t => `gened-${t}`);
  const kind = category.startsWith('gened') ? 'gened' : 'core';
  return {
    code: display,
    title,
    cr: credits,
    prereqs: prereqCodes,
    prereqGroups,
    allPrereqs: allPrereqCodes,
    coreqs: coreqCodes,
    kind,
    category,
    categories: genEdCategories.length ? genEdCategories : [category],
    avg_gpa: (pt && typeof pt.average_gpa === 'number') ? pt.average_gpa : null,
    gen_ed: genEd,
    description: (umd && umd.description) || (pt && pt.description) || '',
    prereqText: prereqText || '',
  };
}

// Best-effort batch: fetches in parallel but with light throttling to be polite.
async function fetchCoursesBatch(codes, onProgress) {
  const results = {};
  const list = Array.from(new Set(codes.map(normalizeCode)));
  const concurrency = 4;
  let idx = 0;
  let done = 0;
  async function worker() {
    while (idx < list.length) {
      const i = idx++;
      const code = list[i];
      try { results[code] = await fetchCourseFull(code); }
      catch { results[code] = null; }
      done++;
      if (onProgress) onProgress(done, list.length);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}
