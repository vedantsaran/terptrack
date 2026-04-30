'use strict';
/* ============================================================
   SEARCH + FILTER + KEYBOARD
   ============================================================ */
const searchInput = document.getElementById('search-input');
searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  renderSemesters();
});
document.querySelectorAll('.filter-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    currentFilter = chip.dataset.filter;
    renderSemesters();
  });
});

document.addEventListener('keydown', (e) => {
  // Don't intercept while typing
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
    if (e.key === 'Escape') { e.target.blur(); }
    return;
  }
  if (e.key === '/') {
    e.preventDefault();
    searchInput.focus();
  } else if (e.key.toLowerCase() === 'p') switchTab('plan');
  else if (e.key.toLowerCase() === 'a') switchTab('audit');
  else if (e.key.toLowerCase() === 'x') switchTab('table');
  else if (e.key.toLowerCase() === 't') switchTab('timeline');
  else if (e.key.toLowerCase() === 'r') switchTab('roadmap');
  else if (e.key === 'Escape') {
    closeAddCourse();
    closeSettings();
    closeAddSemester();
  }
});

document.getElementById('add-course-modal').addEventListener('click', (e) => {
  if (e.target.id === 'add-course-modal') closeAddCourse();
});
document.getElementById('settings-modal').addEventListener('click', (e) => {
  if (e.target.id === 'settings-modal') closeSettings();
});
document.getElementById('add-semester-modal').addEventListener('click', (e) => {
  if (e.target.id === 'add-semester-modal') closeAddSemester();
});
document.getElementById('settings-btn').addEventListener('click', openSettings);
document.getElementById('ac-lookup-btn').addEventListener('click', lookupCourseFromPlanetTerp);
document.getElementById('add-semester-chip').addEventListener('click', openAddSemester);
// Allow Enter on the code field to trigger lookup
document.getElementById('ac-code').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); lookupCourseFromPlanetTerp(); }
});
