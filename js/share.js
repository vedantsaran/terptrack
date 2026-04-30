'use strict';
/* ============================================================
   SHAREABLE PLAN URLS
   Encodes a minimal subset of state into the URL hash so
   advisors / friends can open someone else's plan read-only.
   ============================================================ */

function _planSharePayload() {
  return {
    v: 1,
    courses: state.courses,
    customCourses: state.customCourses,
    customSemesters: state.customSemesters,
    customMajors: state.customMajors,
    activeSchedule: state.activeSchedule,
    majorId: state.majorId,
    settings: state.settings,
  };
}

async function _gzipBase64(str) {
  if (typeof CompressionStream !== 'undefined') {
    const stream = new Blob([str]).stream().pipeThrough(new CompressionStream('gzip'));
    const buf = await new Response(stream).arrayBuffer();
    return _bytesToB64Url(new Uint8Array(buf));
  }
  // Fallback: plain base64 (larger but works everywhere)
  return _bytesToB64Url(new TextEncoder().encode(str));
}

async function _gunzipBase64(b64) {
  const bytes = _b64UrlToBytes(b64);
  if (typeof DecompressionStream !== 'undefined') {
    try {
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
      return await new Response(stream).text();
    } catch {
      // Probably not gzipped (fallback path)
    }
  }
  return new TextDecoder().decode(bytes);
}

function _bytesToB64Url(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function _b64UrlToBytes(b64) {
  const s = atob(b64.replace(/-/g, '+').replace(/_/g, '/'));
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

async function generateShareUrl() {
  const json = JSON.stringify(_planSharePayload());
  const encoded = await _gzipBase64(json);
  const url = `${location.origin}${location.pathname}#plan=${encoded}`;
  return url;
}

async function copyShareUrl() {
  try {
    const url = await generateShareUrl();
    await navigator.clipboard.writeText(url);
    const ind = document.getElementById('save-indicator');
    if (ind) {
      ind.textContent = 'Share link copied!';
      ind.classList.add('show');
      setTimeout(() => { ind.classList.remove('show'); ind.textContent = 'Saved'; }, 2000);
    }
  } catch (e) {
    prompt('Copy this link:', await generateShareUrl());
  }
}

async function loadSharedPlanFromHash() {
  const m = location.hash.match(/^#plan=([A-Za-z0-9_\-]+)$/);
  if (!m) return false;
  try {
    const json = await _gunzipBase64(m[1]);
    const data = JSON.parse(json);
    if (!data || !data.v) throw new Error('Bad payload');
    const hasExisting = Object.keys(state.courses || {}).length > 0
      || (state.customCourses || []).length > 0
      || state.activeSchedule;
    const msg = hasExisting
      ? 'Open this shared plan? It will replace your current plan (your local data will be overwritten).'
      : 'Open this shared plan?';
    if (!confirm(msg)) return false;
    state = {
      ...state,
      ...data,
      settings: { ...DEFAULT_SETTINGS, ...(data.settings || {}) },
      onboardingComplete: true,
    };
    saveState();
    history.replaceState(null, '', location.pathname);
    applyTheme();
    applySettings();
    render();
    return true;
  } catch (e) {
    toastError('Could not load shared plan: ' + e.message);
    return false;
  }
}
