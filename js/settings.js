'use strict';
/* ============================================================
   SETTINGS
   ============================================================ */
function populateMajorSelect() {
  const sel = document.getElementById('set-major');
  if (!sel) return;
  sel.innerHTML = '';
  groupedMajors().forEach(g => {
    const og = document.createElement('optgroup');
    og.label = g.label;
    g.majors.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = majorDisplayLabel(m);
      og.appendChild(opt);
    });
    sel.appendChild(og);
  });
  sel.value = state.majorId || 'CE';
  sel.onchange = () => renderMajorSelectNote(sel.value);
  renderMajorSelectNote(sel.value);
}

function renderMajorSelectNote(majorId) {
  const note = document.getElementById('set-major-note');
  const tpl = getMajorTemplate(majorId);
  if (!note) return;
  if (!tpl) {
    note.textContent = '';
    return;
  }
  const baked = isMajorFullyBaked(tpl);
  const badge = baked
    ? '<span style="color:var(--green);font-weight:600">★ Curated 4-year schedule</span>'
    : '<span style="color:var(--amber);font-weight:600">✱ Auto-generated full 4-year draft</span>';
  note.innerHTML = `${badge} · ${tpl.notes || ''}`;
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
  // Skip confirmation when applying CE default (no destructive change vs default)
  // or when user has no progress / customizations yet.
  const hasProgress = Object.keys(state.courses || {}).length > 0
    || (state.customCourses || []).length > 0
    || (state.customSemesters || []).length > 0;
  if (hasProgress && !confirm(`Apply ${tpl.name}? Your current schedule structure will be replaced. Course progress (passed/transfer marks) is preserved.`)) return;

  status.style.color = 'var(--slate)';
  status.textContent = isMajorFullyBaked(tpl) ? 'Applying curated schedule…' : 'Generating schedule from API…';
  try {
    await applyMajorTemplate(id, {});
    const courseCount = (state.activeSchedule || []).reduce((a, sem) => a + (sem.courses || []).length, 0);
    const baked = isMajorFullyBaked(tpl);
    status.style.color = 'var(--green)';
    status.textContent = `Applied ${tpl.name} · ${courseCount} courses across ${(state.activeSchedule || []).length || 8} semesters.`;
    toastSuccess(`${baked ? '★' : '✱'} ${tpl.name} applied (${courseCount} courses).${baked ? '' : ' Auto-generated full draft with editable placeholders.'}`);
    // Refresh the visible settings inputs to reflect new program metadata
    const s = getSettings();
    document.getElementById('set-program').value = s.programName || '';
    document.getElementById('set-eyebrow').value = s.eyebrow || '';
    document.getElementById('set-total-credits').value = s.totalCredits || 125;
    document.getElementById('set-goals').value = (s.goalCourses || []).join(', ');
  } catch (e) {
    status.style.color = 'var(--red)';
    status.textContent = 'Error: ' + e.message;
    toastError('Could not apply major: ' + e.message);
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
  if (!confirm('This will erase all course progress, custom courses, custom semesters, snapshots, custom majors, and settings. Continue?')) return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(PT_CACHE_KEY);
  if (typeof UMDIO_CACHE_KEY !== 'undefined') localStorage.removeItem(UMDIO_CACHE_KEY);
  state = loadState();
  applyTheme();
  applySettings();
  closeSettings();
  render();
  // Re-trigger onboarding for a clean start
  if (typeof startOnboarding === 'function') startOnboarding();
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
