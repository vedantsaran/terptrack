'use strict';

/* ============================================================
   INIT
   ============================================================ */
applyTheme();
applySettings();
render();
initTableEvents();
if (typeof initBrowse === 'function') initBrowse();

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

// Background-prefetch PlanetTerp data for any UMD-style course codes so GPA badges populate.
(function prefetchPlanetTerp() {
  const codes = flatCourses().map(c => c.code).filter(code => /^[A-Z]{3,4}\s*\d{3}[A-Z]?$/i.test(code));
  let i = 0;
  function next() {
    if (i >= codes.length) { render(); return; }
    const code = codes[i++];
    if (ptCacheGet(code)) { next(); return; }
    planetTerpFetchCourse(code).catch(() => {}).finally(() => setTimeout(next, 120));
  }
  next();
})();
