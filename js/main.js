'use strict';

/* ============================================================
   INIT
   ============================================================ */
applyTheme();
applySettings();
render();
initTableEvents();
if (typeof initScheduleEvents === 'function') initScheduleEvents();
if (typeof initBrowse === 'function') initBrowse();
if (typeof initPlaceholderSearch === 'function') initPlaceholderSearch();

// If the page was opened with a #plan=... share link, offer to load it.
(async function maybeLoadSharedPlan() {
  if (location.hash.startsWith('#plan=')) {
    await loadSharedPlanFromHash();
  }
  // First-run onboarding (skipped if user already has progress or shared plan loaded)
  if (typeof shouldShowOnboarding === 'function' && shouldShowOnboarding()) {
    startOnboarding();
  }
})();

// Background-prefetch course metadata so GPA badges and gen-ed tags populate
// on first load without requiring users to open Browse / Smart Import.
(function prefetchCourseMetadata() {
  const codes = flatCourses().map(c => c.code).filter(code => /^[A-Z]{3,4}\s*\d{3}[A-Z]?$/i.test(code));
  let i = 0;
  let didRender = false;
  function next() {
    if (i >= codes.length) {
      if (!didRender) { didRender = true; render(); }
      return;
    }
    const code = codes[i++];
    const ptHit = ptCacheGet(code);
    const umdCached = (typeof umdioCacheGet === 'function')
      ? umdioCacheGet('course:' + normalizeCode(code))
      : undefined;
    // umdCached === undefined: real miss; null: cached 404 (don't re-fetch)
    const tasks = [];
    if (!ptHit) tasks.push(planetTerpFetchCourse(code).catch(() => {}));
    if (umdCached === undefined && typeof umdioFetchCourse === 'function') {
      tasks.push(umdioFetchCourse(code).catch(() => {}));
    }
    if (!tasks.length) { next(); return; }
    Promise.all(tasks).finally(() => setTimeout(next, 120));
  }
  next();
})();
