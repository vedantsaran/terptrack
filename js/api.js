'use strict';
/* ============================================================
   API LAYER — umd.io + PlanetTerp
   ============================================================ */

const UMDIO_BASE = 'https://api.umd.io/v1';
const UMDIO_CACHE_KEY = 'terp-track-umdio-cache-v1';
const UMDIO_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function umdioCacheLoad() {
  try { return JSON.parse(localStorage.getItem(UMDIO_CACHE_KEY) || '{}'); }
  catch { return {}; }
}
function umdioCacheSave(c) {
  try { localStorage.setItem(UMDIO_CACHE_KEY, JSON.stringify(c)); } catch {}
}
function umdioCacheGet(key) {
  const cache = umdioCacheLoad();
  const e = cache[key];
  if (!e) return null;
  if (Date.now() - e.t > UMDIO_CACHE_TTL_MS) return null;
  return e.v;
}
function umdioCachePut(key, value) {
  const cache = umdioCacheLoad();
  cache[key] = { t: Date.now(), v: value };
  umdioCacheSave(cache);
}

async function umdioFetchCourse(code) {
  const id = normalizeCode(code);
  const cacheKey = 'course:' + id;
  const cached = umdioCacheGet(cacheKey);
  if (cached !== null) return cached;
  const url = `${UMDIO_BASE}/courses/${encodeURIComponent(id)}`;
  let resp;
  try { resp = await fetch(url); }
  catch (e) { return null; }
  if (!resp.ok) {
    if (resp.status === 404) { umdioCachePut(cacheKey, null); return null; }
    return null;
  }
  const data = await resp.json();
  // umd.io returns either a single course object or an array depending on endpoint variant
  const course = Array.isArray(data) ? data[0] : data;
  umdioCachePut(cacheKey, course || null);
  return course || null;
}

async function umdioListCoursesByDept(dept, semester) {
  const key = `dept:${dept}:${semester || 'any'}`;
  const cached = umdioCacheGet(key);
  if (cached) return cached;
  const params = new URLSearchParams({ dept_id: dept.toUpperCase(), per_page: '100' });
  if (semester) params.set('semester', semester);
  let resp;
  try { resp = await fetch(`${UMDIO_BASE}/courses?${params}`); }
  catch (e) { return []; }
  if (!resp.ok) return [];
  const data = await resp.json();
  umdioCachePut(key, data);
  return data;
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

// Map umd.io gen_ed array (e.g. [["FSAW"], ["DSHS","DVUP"]]) to our category strings
function genEdToCategory(genEdArray) {
  if (!Array.isArray(genEdArray)) return null;
  const flat = genEdArray.flat().filter(Boolean);
  if (!flat.length) return null;
  const tag = flat[0].toLowerCase();
  return `gened-${tag}`;
}

// Combined fetch: umd.io for canonical metadata + structured prereqs + gen_ed,
// PlanetTerp (in parallel) for avg_gpa.
async function fetchCourseFull(code) {
  const id = normalizeCode(code);
  const [umd, pt] = await Promise.all([
    umdioFetchCourse(id),
    planetTerpFetchCourse(id).catch(() => null),
  ]);
  if (!umd && !pt) return null;
  const display = displayCode(id);
  const credits = parseInt((umd && umd.credits) || (pt && pt.credits) || '3', 10) || 3;
  const title = (umd && umd.name) || (pt && pt.title) || display;
  const prereqText = umd && umd.relationships ? umd.relationships.prereqs : (pt && pt.prerequisites);
  const prereqCodes = extractCourseCodes(prereqText).map(displayCode);
  const coreqCodes = extractCourseCodes(umd && umd.relationships ? umd.relationships.coreqs : '').map(displayCode);
  const genEd = umd && umd.gen_ed ? umd.gen_ed : null;
  const category = genEdToCategory(genEd) || 'major-core';
  const kind = category.startsWith('gened') ? 'gened' : 'core';
  return {
    code: display,
    title,
    cr: credits,
    prereqs: prereqCodes,
    coreqs: coreqCodes,
    kind,
    category,
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
