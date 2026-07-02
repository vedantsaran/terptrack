'use strict';
/* ============================================================
   SNAPSHOTS — save and switch between named plans
   ============================================================ */

function _snapshotPayload() {
  return {
    courses: JSON.parse(JSON.stringify(state.courses || {})),
    customCourses: JSON.parse(JSON.stringify(state.customCourses || [])),
    customSemesters: JSON.parse(JSON.stringify(state.customSemesters || [])),
    activeSchedule: state.activeSchedule ? JSON.parse(JSON.stringify(state.activeSchedule)) : null,
    selectedSections: JSON.parse(JSON.stringify(state.selectedSections || {})),
    schedulePrefs: JSON.parse(JSON.stringify(state.schedulePrefs || {})),
    scheduleAdvisorFilter: state.scheduleAdvisorFilter || 'all',
    scheduleOutputPreset: state.scheduleOutputPreset || 'personal',
    scheduleOutputOptions: JSON.parse(JSON.stringify(state.scheduleOutputOptions || { preferences: true, warnings: true, unscheduled: true, recentChanges: true, auditIssues: true })),
    roadmapPrefs: JSON.parse(JSON.stringify(state.roadmapPrefs || { filter: 'all', query: '', selectedCode: '' })),
    browseSavedSearches: JSON.parse(JSON.stringify(state.browseSavedSearches || [])),
    recentChanges: JSON.parse(JSON.stringify(state.recentChanges || [])),
    majorId: state.majorId,
    profilePrefs: JSON.parse(JSON.stringify(state.profilePrefs || defaultProfilePrefs())),
    settings: JSON.parse(JSON.stringify(state.settings || {})),
  };
}

function listSnapshots() {
  return state.snapshots || [];
}

function saveSnapshot(name) {
  const snap = {
    id: 'snap-' + Date.now(),
    name: (name || `Snapshot ${(state.snapshots || []).length + 1}`).trim(),
    createdAt: new Date().toISOString(),
    payload: _snapshotPayload(),
  };
  state.snapshots = state.snapshots || [];
  state.snapshots.push(snap);
  saveState();
  return snap;
}

function loadSnapshot(id) {
  const snap = (state.snapshots || []).find(s => s.id === id);
  if (!snap) { toastError('Snapshot not found.'); return; }
  const nextState = { ...state, ...(snap.payload || {}) };
  Object.assign(state, {
    courses: snap.payload.courses,
    customCourses: snap.payload.customCourses,
    customSemesters: snap.payload.customSemesters,
    activeSchedule: snap.payload.activeSchedule,
    schedulePrefs: snap.payload.schedulePrefs || {},
    selectedSections: typeof normalizeRestoredSelectedSections === 'function'
      ? normalizeRestoredSelectedSections(snap.payload.selectedSections || {}, nextState)
      : (snap.payload.selectedSections || {}),
    scheduleAdvisorFilter: ['all', 'remaining', 'gened', 'blockers'].includes(snap.payload.scheduleAdvisorFilter) ? snap.payload.scheduleAdvisorFilter : 'all',
    scheduleOutputPreset: ['personal', 'advisor', 'registrar', 'custom'].includes(snap.payload.scheduleOutputPreset) ? snap.payload.scheduleOutputPreset : 'personal',
    scheduleOutputOptions: { preferences: true, warnings: true, unscheduled: true, recentChanges: true, auditIssues: true, ...(snap.payload.scheduleOutputOptions || {}) },
    roadmapPrefs: { filter: 'all', query: '', selectedCode: '', ...(snap.payload.roadmapPrefs || {}) },
    browseSavedSearches: typeof normalizeBrowseSavedSearches === 'function' ? normalizeBrowseSavedSearches(snap.payload.browseSavedSearches) : (snap.payload.browseSavedSearches || []),
    recentChanges: Array.isArray(snap.payload.recentChanges) ? snap.payload.recentChanges.slice(0, 12) : [],
    majorId: snap.payload.majorId,
    profilePrefs: normalizeProfilePrefs(snap.payload.profilePrefs || {}),
    settings: typeof normalizeSettings === 'function' ? normalizeSettings({ ...DEFAULT_SETTINGS, ...(snap.payload.settings || {}) }) : { ...DEFAULT_SETTINGS, ...(snap.payload.settings || {}) },
  });
  saveState();
  applyTheme();
  applySettings();
  render();
  toastSuccess(`Loaded "${snap.name}".`);
}

function deleteSnapshot(id) {
  state.snapshots = (state.snapshots || []).filter(s => s.id !== id);
  saveState();
  renderSnapshotList();
}

function renameSnapshot(id, newName) {
  const s = (state.snapshots || []).find(x => x.id === id);
  if (!s) return;
  s.name = newName.trim() || s.name;
  saveState();
  renderSnapshotList();
}

function openSnapshots() {
  document.getElementById('snap-name').value = '';
  renderSnapshotList();
  document.getElementById('snapshots-modal').classList.add('open');
  setTimeout(() => document.getElementById('snap-name').focus(), 50);
}

function closeSnapshots() {
  document.getElementById('snapshots-modal').classList.remove('open');
}

function commitSnapshotSave() {
  const name = document.getElementById('snap-name').value.trim();
  saveSnapshot(name);
  document.getElementById('snap-name').value = '';
  renderSnapshotList();
  toastSuccess(`Saved snapshot "${name || 'Untitled'}".`);
}

function renderSnapshotList() {
  const list = document.getElementById('snap-list');
  if (!list) return;
  const snaps = listSnapshots();
  if (!snaps.length) {
    list.innerHTML = '<p class="reco-empty">No saved snapshots yet. Save one to compare scenarios (e.g. "with minor in stats", "fast-track 3-year plan").</p>';
    return;
  }
  list.innerHTML = snaps.map(s => {
    const date = new Date(s.createdAt);
    const when = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const numCourses = (s.payload.activeSchedule || []).reduce((a, sem) => a + (sem.courses || []).length, 0)
      + (s.payload.customCourses || []).length;
    return `
      <div class="snap-row">
        <div class="snap-info">
          <strong>${s.name}</strong>
          <span class="snap-meta">${numCourses} courses · ${when}</span>
        </div>
        <div class="snap-actions">
          <button class="btn small" onclick="loadSnapshot('${s.id}')">Load</button>
          <button class="btn small" onclick="snapshotRenamePrompt('${s.id}')">Rename</button>
          <button class="btn small" onclick="snapshotDeleteConfirm('${s.id}')" style="color:var(--red)">Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

function snapshotRenamePrompt(id) {
  const s = (state.snapshots || []).find(x => x.id === id);
  if (!s) return;
  const v = prompt('Rename snapshot:', s.name);
  if (v !== null) renameSnapshot(id, v);
}

function snapshotDeleteConfirm(id) {
  const s = (state.snapshots || []).find(x => x.id === id);
  if (!s) return;
  if (confirm(`Delete snapshot "${s.name}"? This can't be undone.`)) {
    deleteSnapshot(id);
    toastInfo('Snapshot deleted.');
  }
}
