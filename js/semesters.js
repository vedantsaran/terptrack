'use strict';
/* ============================================================
   ADD SEMESTER
   ============================================================ */
function openAddSemester() {
  document.getElementById('as-id').value = '';
  document.getElementById('as-name').value = '';
  document.getElementById('as-year').value = '';
  document.getElementById('add-semester-modal').classList.add('open');
  setTimeout(() => document.getElementById('as-id').focus(), 50);
}
function closeAddSemester() {
  document.getElementById('add-semester-modal').classList.remove('open');
}
function saveAddSemester() {
  const id = document.getElementById('as-id').value.trim().toUpperCase();
  const name = document.getElementById('as-name').value.trim();
  const year = document.getElementById('as-year').value.trim();
  if (!id || !name) { alert('Short ID and Display Name are required'); return; }
  if (getAllSemesters().some(s => s.id === id)) { alert('A semester with that ID already exists'); return; }
  state.customSemesters = state.customSemesters || [];
  state.customSemesters.push({ id, name, year, courses: [] });
  saveState();
  closeAddSemester();
  applySettings();
  render();
}

