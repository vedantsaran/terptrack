'use strict';
/* ============================================================
   IMPORT / EXPORT
   ============================================================ */
function exportData() {
  const data = JSON.stringify(state, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const date = new Date().toISOString().slice(0, 10);
  a.download = `terp-track-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
function openImport() {
  document.getElementById('import-file').click();
}
document.getElementById('import-file').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result);
      if (!data.courses) throw new Error('Invalid file');
      if (confirm('This will replace your current data. Continue?')) {
        state = {
          ...state,
          ...data,
          settings: { ...DEFAULT_SETTINGS, ...(data.settings || state.settings || {}) },
          customSemesters: data.customSemesters || state.customSemesters || [],
        };
        saveState();
        applyTheme();
        applySettings();
        render();
      }
    } catch (err) {
      alert('Could not import: ' + err.message);
    }
  };
  reader.readAsText(file);
  e.target.value = '';
});

function dismissWelcome() {
  state.welcomeDismissed = true;
  saveState();
  render();
}

