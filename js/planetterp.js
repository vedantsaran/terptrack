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

async function planetTerpFetchWithTimeout(url, timeoutMs = 6500) {
  if (typeof AbortController === 'undefined') {
    let timer = null;
    try {
      return await Promise.race([
        fetch(url),
        new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error('PlanetTerp request timed out')), timeoutMs);
        }),
      ]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } catch (error) {
    if (error && error.name === 'AbortError') throw new Error('PlanetTerp request timed out');
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function planetTerpJsonWithTimeout(resp, timeoutMs = 6500) {
  let timer = null;
  try {
    return await Promise.race([
      resp.json(),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('PlanetTerp response timed out')), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function planetTerpFetchCourse(code, options = {}) {
  const key = normalizeCode(code);
  const cached = ptCacheGet(key);
  if (cached) return cached;
  const url = `https://planetterp.com/api/v1/course?name=${encodeURIComponent(key)}`;
  const attempts = Math.max(1, Math.floor(Number(options.attempts) || 3));
  const timeoutMs = Number(options.timeoutMs) || 6500;
  let lastError = null;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const resp = await planetTerpFetchWithTimeout(url, timeoutMs);
      if (!resp.ok) {
        let msg = `HTTP ${resp.status}`;
        try { const body = await planetTerpJsonWithTimeout(resp, timeoutMs); if (body && body.error) msg = body.error; } catch {}
        lastError = new Error(msg);
        if (resp.status < 500) break;
        if (attempt === attempts) throw lastError;
      } else {
        const data = await planetTerpJsonWithTimeout(resp, timeoutMs);
        ptCachePut(key, data);
        return data;
      }
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;
    }
    await new Promise(resolve => setTimeout(resolve, 250 * attempt));
  }
  throw lastError || new Error('PlanetTerp request failed');
}
