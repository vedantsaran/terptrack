'use strict';
/* ============================================================
   CUSTOM MAJOR BUILDER + IMPORT/EXPORT
   ============================================================ */

function openMajorBuilder(existingId) {
  const existing = existingId ? (state.customMajors || []).find(m => m.id === existingId) : null;
  document.getElementById('mb-id').value = existing ? existing.id : '';
  document.getElementById('mb-name').value = existing ? existing.name : '';
  document.getElementById('mb-program').value = existing ? existing.programName : '';
  document.getElementById('mb-credits').value = existing ? existing.totalCredits : 120;
  document.getElementById('mb-core').value = existing ? (existing.coreCodes || []).join('\n') : '';
  document.getElementById('mb-support').value = existing ? (existing.supportCodes || []).join('\n') : '';
  document.getElementById('mb-upper').value = existing ? (existing.upperElectiveCodes || []).join('\n') : '';
  document.getElementById('mb-goals').value = existing ? (existing.goals || []).join(', ') : '';
  document.getElementById('mb-notes').value = existing ? (existing.notes || '') : '';
  document.getElementById('mb-status').textContent = '';
  document.getElementById('mb-modal').classList.add('open');
  setTimeout(() => document.getElementById('mb-name').focus(), 50);
}

function closeMajorBuilder() {
  document.getElementById('mb-modal').classList.remove('open');
}

function _splitCodeList(text) {
  return (text || '').split(/[\s,;\n]+/).map(s => s.trim()).filter(Boolean);
}

function saveCustomMajor() {
  const name = document.getElementById('mb-name').value.trim();
  if (!name) { toastError('Major name is required.'); return; }
  const id = (document.getElementById('mb-id').value.trim() || ('custom-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-'))).toLowerCase();
  const programName = document.getElementById('mb-program').value.trim() || name;
  const totalCredits = parseInt(document.getElementById('mb-credits').value) || 120;
  const core = _splitCodeList(document.getElementById('mb-core').value);
  const support = _splitCodeList(document.getElementById('mb-support').value);
  const upper = _splitCodeList(document.getElementById('mb-upper').value);
  const goals = _splitCodeList(document.getElementById('mb-goals').value);
  const notes = document.getElementById('mb-notes').value.trim();

  if (!core.length && !support.length && !upper.length) {
    toastError('Add at least one course code.'); return;
  }

  const tpl = {
    id, name, programName,
    eyebrow: `UMD · ${programName}`,
    totalCredits,
    coreCodes: core,
    supportCodes: support,
    upperElectiveCodes: upper,
    goals,
    notes,
    isCustom: true,
  };

  state.customMajors = state.customMajors || [];
  const existing = state.customMajors.findIndex(m => m.id === id);
  if (existing >= 0) state.customMajors[existing] = tpl;
  else state.customMajors.push(tpl);

  saveState();
  closeMajorBuilder();
  // Re-populate major select if settings is open
  const settingsOpen = document.getElementById('settings-modal').classList.contains('open');
  if (settingsOpen) {
    populateMajorSelect();
    document.getElementById('set-major').value = id;
  }
  toastSuccess(settingsOpen
    ? `Saved "${name}". Click Apply to use it.`
    : `Saved "${name}". Open Settings → Apply Major to use it.`);
}

function deleteCustomMajor(id) {
  if (!confirm('Delete this custom major template?')) return;
  state.customMajors = (state.customMajors || []).filter(m => m.id !== id);
  saveState();
  populateMajorSelect();
}

function exportMajorTemplate(id) {
  const tpl = getMajorTemplate(id);
  if (!tpl) { toastError('Template not found.'); return; }
  const json = JSON.stringify(tpl, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `terp-track-major-${tpl.id}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importMajorFromJSON(text) {
  let tpl;
  try { tpl = JSON.parse(text); }
  catch (e) { toastError('Invalid JSON: ' + e.message); return; }
  if (!tpl || !tpl.id || !tpl.name) {
    toastError('Major template must have at least id and name fields.'); return;
  }
  tpl.isCustom = true;
  state.customMajors = state.customMajors || [];
  const existing = state.customMajors.findIndex(m => m.id === tpl.id);
  if (existing >= 0) {
    if (!confirm(`A custom major with id "${tpl.id}" exists. Overwrite?`)) return;
    state.customMajors[existing] = tpl;
  } else {
    state.customMajors.push(tpl);
  }
  saveState();
  if (document.getElementById('settings-modal').classList.contains('open')) {
    populateMajorSelect();
    document.getElementById('set-major').value = tpl.id;
  }
  toastSuccess(`Imported "${tpl.name}". Open Settings → Apply Major to use it.`);
}

function openImportMajor() {
  const choice = prompt(
    'Import a major template:\n\n  • Type "url" to paste a URL pointing to a JSON file\n  • Type "paste" to paste JSON directly\n  • Click OK to pick a file from disk',
    ''
  );
  if (choice === null) return;
  if (choice.trim().toLowerCase() === 'url') {
    importMajorFromURL();
  } else if (choice.trim().toLowerCase() === 'paste') {
    importMajorFromPaste();
  } else {
    importMajorFromFile();
  }
}

function importMajorFromFile() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => importMajorFromJSON(ev.target.result);
    reader.readAsText(file);
  });
  input.click();
}

async function importMajorFromURL() {
  const url = prompt('Paste a URL pointing to a JSON major template:');
  if (!url) return;
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const text = await resp.text();
    importMajorFromJSON(text);
  } catch (e) {
    toastError('Could not fetch URL: ' + e.message);
  }
}

function importMajorFromPaste() {
  const text = prompt('Paste the JSON major template:');
  if (!text) return;
  importMajorFromJSON(text);
}
