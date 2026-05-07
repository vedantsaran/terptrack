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
  const cs = document.getElementById('mb-college');
  if (cs) cs.value = existing ? (existing.college || '') : '';
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

/* ----------------------------------------------------------
   Universal major importer
   ----------------------------------------------------------
   Many UMD majors publish slightly different four-year plan pages,
   PDFs, or advisor worksheets. This parser lets students paste the
   text (or a fetchable URL) and turns any recognized course codes into
   a custom major template, so Terp Track can support majors beyond the
   built-in curated list without waiting for a code release.
*/
const PLAN_IMPORT_SUPPORT_DEPTS = new Set([
  'AASP','AMST','ANTH','ARTH','ASTR','BSCI','CHEM','COMM','ECON','ENGL','GEOG','GEOL','HIST','JOUR',
  'MATH','PHIL','PHYS','PSYC','SOCY','STAT','THET','WGSS','WOMS','UNIV'
]);
const PLAN_IMPORT_SKIP_TOKENS = new Set([
  'AP','IB','CLEP','CORE','DSSP','DSHS','DSHU','DSNL','DSNS','DVCC','DVUP','FSAR','FSAW','FSMA','FSOC','FSPW','I','II','III','IV'
]);

function extractCourseCodesFromText(text) {
  const source = (text || '').toUpperCase().replace(/[\u2010-\u2015]/g, '-');
  const out = [];
  const seen = new Set();
  const re = /\b([A-Z]{2,4})\s*-?\s*(\d{3}[A-Z]?)(?:\s*(?:[-–—/&,]|AND)\s*(\d{3}[A-Z]?))?\b/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    const dept = m[1].toUpperCase();
    if (PLAN_IMPORT_SKIP_TOKENS.has(dept)) continue;
    const nums = [m[2], m[3]].filter(Boolean);
    nums.forEach(num => {
      const code = `${dept}${num.toUpperCase()}`;
      if (!seen.has(code)) {
        seen.add(code);
        out.push(code);
      }
    });
  }
  return out;
}

function inferMajorDeptFromCodes(codes) {
  const allCounts = {};
  const majorishCounts = {};
  (codes || []).forEach(code => {
    const dept = (code.match(/^([A-Z]{2,4})/) || [])[1];
    if (!dept) return;
    allCounts[dept] = (allCounts[dept] || 0) + 1;
    if (!PLAN_IMPORT_SUPPORT_DEPTS.has(dept)) {
      majorishCounts[dept] = (majorishCounts[dept] || 0) + 1;
    }
  });
  const rankedMajorish = Object.entries(majorishCounts).sort((a, b) => b[1] - a[1]);
  if (rankedMajorish.length) return rankedMajorish[0][0];
  return Object.entries(allCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
}

function categorizePlanImportCodes(codes, majorDept) {
  const buckets = { core: [], support: [], upper: [] };
  (codes || []).forEach(code => {
    const dept = (code.match(/^([A-Z]{2,4})/) || [])[1] || '';
    const level = parseInt((code.match(/\d{3}/) || ['0'])[0], 10);
    if (dept === majorDept && level >= 300) buckets.upper.push(code);
    else if (dept === majorDept) buckets.core.push(code);
    else if (PLAN_IMPORT_SUPPORT_DEPTS.has(dept) || level < 300) buckets.support.push(code);
    else buckets.core.push(code);
  });
  return buckets;
}

function fillMajorBuilderFromPlanText(text, sourceLabel) {
  const codes = extractCourseCodesFromText(text);
  const status = document.getElementById('mb-status');
  if (!codes.length) {
    if (status) {
      status.style.color = 'var(--red)';
      status.textContent = 'No course codes found. Paste text such as "CMSC131, MATH140, ENGL101".';
    }
    toastError('No course codes found in that plan text.');
    return false;
  }

  const majorDept = inferMajorDeptFromCodes(codes);
  const buckets = categorizePlanImportCodes(codes, majorDept);
  const existingName = document.getElementById('mb-name').value.trim();
  const inferredName = existingName || (majorDept ? `${majorDept} Major` : 'Imported Major');
  document.getElementById('mb-name').value = inferredName;
  document.getElementById('mb-program').value = document.getElementById('mb-program').value.trim() || inferredName;
  document.getElementById('mb-core').value = buckets.core.join('\n');
  document.getElementById('mb-support').value = buckets.support.join('\n');
  document.getElementById('mb-upper').value = buckets.upper.join('\n');
  document.getElementById('mb-goals').value = buckets.upper.slice(-3).join(', ');
  document.getElementById('mb-notes').value = document.getElementById('mb-notes').value.trim()
    || `Imported from ${sourceLabel || 'pasted four-year plan text'}. Review with an advisor before registration.`;

  if (status) {
    status.style.color = 'var(--green)';
    status.textContent = `Extracted ${codes.length} unique courses${majorDept ? ` · inferred ${majorDept} as the major department` : ''}. Review, then Save Major.`;
  }
  toastSuccess(`Imported ${codes.length} courses into the major builder.`);
  return true;
}

async function openPlanTextImport() {
  if (!document.getElementById('mb-modal').classList.contains('open')) openMajorBuilder();
  const choice = prompt(
    'Import a four-year plan for any major.\n\nPaste a URL to a plan page, or paste raw plan text with course codes:',
    ''
  );
  if (!choice) return;
  const trimmed = choice.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    const status = document.getElementById('mb-status');
    if (status) {
      status.style.color = 'var(--slate)';
      status.textContent = 'Fetching plan URL…';
    }
    try {
      const resp = await fetch(trimmed);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const text = await resp.text();
      if (fillMajorBuilderFromPlanText(text, trimmed)) return;
    } catch (e) {
      if (status) {
        status.style.color = 'var(--amber)';
        status.textContent = `Browser could not read that URL (${e.message}). Paste the copied plan text instead.`;
      }
    }
    const pasted = prompt('Could not read the URL directly. Copy the plan text from the page/PDF and paste it here:', '');
    if (pasted) fillMajorBuilderFromPlanText(pasted, trimmed);
    return;
  }
  fillMajorBuilderFromPlanText(trimmed, 'pasted text');
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
  const college = (document.getElementById('mb-college') || {}).value || '';

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
    college: college || undefined,
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
