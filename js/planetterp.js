'use strict';
/* ============================================================
   PLANETTERP API
   ============================================================ */
function ptCacheLoad() {
  try { return JSON.parse(localStorage.getItem(PT_CACHE_KEY) || '{}'); }
  catch { return {}; }
}
function ptCacheSave(cache) {
  try { localStorage.setItem(PT_CACHE_KEY, JSON.stringify(cache)); } catch {}
}
function ptCacheGet(code) {
  const cache = ptCacheLoad();
  const key = normalizeCode(code);
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() - entry.t > PT_CACHE_TTL_MS) return null;
  return entry.v;
}
function ptCachePut(code, value) {
  const cache = ptCacheLoad();
  cache[normalizeCode(code)] = { t: Date.now(), v: value };
  ptCacheSave(cache);
}

async function planetTerpFetchCourse(code) {
  const key = normalizeCode(code);
  const cached = ptCacheGet(key);
  if (cached) return cached;
  const url = `https://planetterp.com/api/v1/course?name=${encodeURIComponent(key)}`;
  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const resp = await fetch(url);
      if (!resp.ok) {
        let msg = `HTTP ${resp.status}`;
        try { const body = await resp.json(); if (body && body.error) msg = body.error; } catch {}
        lastError = new Error(msg);
        if (resp.status < 500) break;
        if (attempt === 3) throw lastError;
      } else {
        const data = await resp.json();
        ptCachePut(key, data);
        return data;
      }
    } catch (error) {
      lastError = error;
      if (attempt === 3) break;
    }
    await new Promise(resolve => setTimeout(resolve, 250 * attempt));
  }
  throw lastError || new Error('PlanetTerp request failed');
}
