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
  // Don't intercept while a modal is open (Escape still allowed below)
  const modalOpen = document.querySelector('.modal-backdrop.open');
  if (modalOpen && e.key !== 'Escape') return;
  if (e.key === '/') {
    e.preventDefault();
    searchInput.focus();
  } else if (e.key.toLowerCase() === 'p') switchTab('plan');
  else if (e.key.toLowerCase() === 's') switchTab('schedule');
  else if (e.key.toLowerCase() === 'a') switchTab('audit');
  else if (e.key.toLowerCase() === 'x') switchTab('table');
  else if (e.key.toLowerCase() === 't') switchTab('timeline');
  else if (e.key.toLowerCase() === 'r') switchTab('roadmap');
  else if (e.key.toLowerCase() === 'b') switchTab('browse');
  else if (e.key.toLowerCase() === 'g') switchTab('gened');
  else if (e.key === 'Escape') {
    closeAddCourse();
    closeSettings();
    closeAddSemester();
    closeImportCourses();
    if (typeof closeMajorBuilder === 'function') closeMajorBuilder();
    if (typeof closeResolver === 'function') closeResolver();
    if (typeof closeGpaSim === 'function') closeGpaSim();
    if (typeof closeSnapshots === 'function') closeSnapshots();
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
document.getElementById('import-chip').addEventListener('click', openImportCourses);
document.getElementById('import-modal').addEventListener('click', (e) => {
  if (e.target.id === 'import-modal') closeImportCourses();
});
const _rsModal = document.getElementById('resolver-modal');
if (_rsModal) _rsModal.addEventListener('click', (e) => {
  if (e.target.id === 'resolver-modal') closeResolver();
});
const _gpaModal = document.getElementById('gpa-modal');
if (_gpaModal) _gpaModal.addEventListener('click', (e) => {
  if (e.target.id === 'gpa-modal') closeGpaSim();
});
const _snapModal = document.getElementById('snapshots-modal');
if (_snapModal) _snapModal.addEventListener('click', (e) => {
  if (e.target.id === 'snapshots-modal') closeSnapshots();
});
const _mbModal = document.getElementById('mb-modal');
if (_mbModal) _mbModal.addEventListener('click', (e) => {
  if (e.target.id === 'mb-modal') closeMajorBuilder();
});
document.addEventListener('change', (e) => {
  if (e.target && e.target.id === 'set-major') {
    const note = document.getElementById('set-major-note');
    const tpl = getMajorTemplate(e.target.value);
    if (note && tpl) note.textContent = tpl.notes || '';
  }
});
// Allow Enter on the code field to trigger lookup
document.getElementById('ac-code').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); lookupCourseFromPlanetTerp(); }
});
