'use strict';
/* ============================================================
   SETTINGS
   ============================================================ */
function populateMajorSelect() {
  const sel = document.getElementById('set-major');
  if (!sel) return;
  sel.innerHTML = '';
  listMajors().forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = m.name + (m.useDefaultSchedule ? ' (curated default)' : '');
    sel.appendChild(opt);
  });
  sel.value = state.majorId || 'CE';
  const note = document.getElementById('set-major-note');
  const tpl = getMajorTemplate(sel.value);
  if (note && tpl) note.textContent = tpl.notes || '';
}

function openSettings() {
  const s = getSettings();
  populateMajorSelect();
  document.getElementById('set-program').value = s.programName || '';
  document.getElementById('set-eyebrow').value = s.eyebrow || '';
  document.getElementById('set-total-credits').value = s.totalCredits || 125;
  document.getElementById('set-goals').value = (s.goalCourses || []).join(', ');
  document.getElementById('set-footer').value = s.footerNote || '';
  const status = document.getElementById('set-major-status');
  if (status) status.textContent = '';
  document.getElementById('settings-modal').classList.add('open');
}

async function applyMajorFromSettings() {
  const sel = document.getElementById('set-major');
  const status = document.getElementById('set-major-status');
  const id = sel.value;
  const tpl = getMajorTemplate(id);
  if (!tpl) return;
  if (!confirm(`Apply ${tpl.name}? This will replace your current schedule structure (course progress is kept).`)) return;
  status.style.color = 'var(--slate)';
  status.textContent = 'Generating schedule…';
  try {
    await applyMajorTemplate(id, {});
    status.style.color = 'var(--green)';
    status.textContent = `Applied ${tpl.name}.`;
    // Refresh the visible settings inputs to reflect new program metadata
    const s = getSettings();
    document.getElementById('set-program').value = s.programName || '';
    document.getElementById('set-eyebrow').value = s.eyebrow || '';
    document.getElementById('set-total-credits').value = s.totalCredits || 125;
    document.getElementById('set-goals').value = (s.goalCourses || []).join(', ');
  } catch (e) {
    status.style.color = 'var(--red)';
    status.textContent = 'Error: ' + e.message;
  }
}
function closeSettings() {
  document.getElementById('settings-modal').classList.remove('open');
}
function saveSettings() {
  const programName = document.getElementById('set-program').value.trim() || 'Computer Engineering';
  const eyebrow     = document.getElementById('set-eyebrow').value.trim() || `UMD · ${programName}`;
  const totalCredits = parseInt(document.getElementById('set-total-credits').value) || 125;
  const goalCourses = document.getElementById('set-goals').value
    .split(',').map(s => s.trim()).filter(Boolean);
  const footerNote = document.getElementById('set-footer').value.trim();
  state.settings = { ...DEFAULT_SETTINGS, ...state.settings, programName, eyebrow, totalCredits, goalCourses, footerNote };
  saveState();
  applySettings();
  closeSettings();
  render();
}
function resetAllData() {
  if (!confirm('This will erase all course progress, custom courses, custom semesters, and settings. Continue?')) return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(PT_CACHE_KEY);
  state = loadState();
  applyTheme();
  applySettings();
  closeSettings();
  render();
}
function applySettings() {
  const s = getSettings();
  const eyebrow = document.getElementById('hero-eyebrow');
  if (eyebrow) eyebrow.textContent = s.eyebrow || `UMD · ${s.programName}`;
  const footer = document.getElementById('footer-text');
  if (footer) {
    const note = s.footerNote ? ` · ${s.footerNote}` : '';
    footer.innerHTML = `<em>Terp Track</em> · ${s.programName || 'Degree'} planner${note} · Saves locally to your browser`;
  }
  // Populate semester filter dropdown in table view
  const semSel = document.getElementById('table-filter-sem');
  if (semSel) {
    const cur = semSel.value;
    semSel.innerHTML = '<option value="">All Semesters</option>';
    getAllSemesters().forEach(sem => {
      const opt = document.createElement('option');
      opt.value = sem.id;
      opt.textContent = sem.name;
      semSel.appendChild(opt);
    });
    semSel.value = cur;
  }
}

