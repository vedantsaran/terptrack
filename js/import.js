'use strict';
/* ============================================================
   SMART IMPORT + AUTO-SCHEDULE GENERATOR
   ============================================================ */

// Generate semester labels: "Fall 2026", "Spring 2027", "Fall 2027", ...
function generateSemesterLabels(startTerm, startYear, count) {
  const out = [];
  let term = startTerm; // "Fall" or "Spring"
  let year = startYear;
  for (let i = 0; i < count; i++) {
    const id = (term === 'Fall' ? 'F' : 'S') + String(year).slice(-2);
    out.push({
      id, name: `${term} ${year}`,
      year: `Year ${Math.floor(i / 2) + 1}`,
    });
    if (term === 'Fall') term = 'Spring', year = year + 1;
    else term = 'Fall';
  }
  return out;
}

const AUTO_PLAN_GENED_REQUIREMENTS = [
  { id: 'FSAW', label: 'Academic Writing', need: 1, preferred: 0 },
  { id: 'FSOC', label: 'Oral Communication', need: 1, preferred: 0 },
  { id: 'FSMA', label: 'Mathematics', need: 1, preferred: 0 },
  { id: 'FSAR', label: 'Analytic Reasoning', need: 1, preferred: 1 },
  { id: 'DSHS', label: 'History/Social Sciences', need: 2, preferred: 1 },
  { id: 'DSHU', label: 'Humanities', need: 2, preferred: 1 },
  { id: 'DSNS', label: 'Natural Sciences', need: 1, preferred: 2 },
  { id: 'DSNL', label: 'Natural Sciences with Lab', need: 1, preferred: 3, credits: 4 },
  { id: 'DSSP', label: 'Scholarship in Practice', need: 2, preferred: 4 },
  { id: 'DVUP', label: 'Understanding Plural Societies', need: 1, preferred: 4 },
  { id: 'DVCC', label: 'Cultural Competence', need: 1, preferred: 5 },
  { id: 'SCIS', label: 'I-Series Signature Course', need: 1, preferred: 2 },
  { id: 'FSPW', label: 'Professional Writing', need: 1, preferred: 4 },
];

const AUTO_PLAN_KNOWN_GENED_BY_CODE = {
  ENGL101: ['FSAW'],
  ENGL393: ['FSPW'],
  COMM107: ['FSOC'],
  COMM200: ['FSOC'],
  MATH113: ['FSMA'],
  MATH120: ['FSMA'],
  MATH130: ['FSMA'],
  MATH136: ['FSMA'],
  MATH140: ['FSMA'],
  MATH220: ['FSMA'],
  CMSC250: ['FSAR'],
  MATH240: ['FSAR'],
  STAT100: ['FSAR'],
  STAT400: ['FSAR'],
  BSCI105: ['DSNS'],
  BSCI106: ['DSNL'],
  BIOL106: ['DSNL'],
  CHEM131: ['DSNS'],
  CHEM132: ['DSNL'],
  PHYS121: ['DSNS'],
  PHYS122: ['DSNL'],
  PHYS161: ['DSNS'],
  PHYS260: ['DSNL'],
  PHYS261: ['DSNL'],
};

function autoPlanCredits(course) {
  const cr = Number(course && course.cr);
  return Number.isFinite(cr) && cr > 0 ? cr : 3;
}

function autoPlanTotalCredits(semesters) {
  return (semesters || []).reduce((sum, sem) => (
    sum + (sem.courses || []).reduce((s, c) => s + autoPlanCredits(c), 0)
  ), 0);
}

function autoPlanCourseTags(course) {
  const tags = new Set();
  if (!course) return tags;
  if (Array.isArray(course.gen_ed)) {
    course.gen_ed.flat().filter(Boolean).forEach(t => tags.add(String(t).toUpperCase()));
  }
  if (Array.isArray(course.categories)) {
    course.categories
      .filter(cat => cat && String(cat).startsWith('gened-'))
      .forEach(cat => tags.add(String(cat).replace('gened-', '').toUpperCase()));
  }
  if (course.category && String(course.category).startsWith('gened-')) {
    tags.add(String(course.category).replace('gened-', '').toUpperCase());
  }
  const known = AUTO_PLAN_KNOWN_GENED_BY_CODE[normalizeCode(course.code)] || [];
  known.forEach(tag => tags.add(tag));
  const hay = [course.code, course.title, course.note].join(' ').toUpperCase();
  AUTO_PLAN_GENED_REQUIREMENTS.forEach(req => {
    if (hay.includes(req.id)) tags.add(req.id);
  });
  return tags;
}

function autoPlanRequirementCounts(semesters) {
  const counts = {};
  AUTO_PLAN_GENED_REQUIREMENTS.forEach(req => { counts[req.id] = 0; });
  (semesters || []).forEach(sem => (sem.courses || []).forEach(course => {
    autoPlanCourseTags(course).forEach(tag => {
      if (counts[tag] !== undefined) counts[tag]++;
    });
  }));
  return counts;
}

function autoPlanPlaceholderCode(prefix, index) {
  return index > 1 ? `${prefix} #${index}` : prefix;
}

function makeAutoPlanGenEdPlaceholder(req, index) {
  const category = `gened-${req.id.toLowerCase()}`;
  const suffix = req.need > 1 ? ` #${index}` : '';
  return {
    code: autoPlanPlaceholderCode(`GenEd ${req.id}`, index),
    title: `${req.label}${suffix}`,
    cr: req.credits || 3,
    prereqs: [],
    coreqs: [],
    kind: 'gened',
    category,
    categories: [category],
    note: `Auto-generated ${req.id} placeholder. Click to search and replace with a real UMD course.`,
  };
}

function makeAutoPlanFreeElective(index) {
  return {
    code: `Free Elective #${index}`,
    title: `Free Elective ${index}`,
    cr: 3,
    prereqs: [],
    coreqs: [],
    kind: 'tech',
    category: 'elective',
    note: 'Auto-generated credit placeholder. Replace with a minor, certificate, interest, or open elective course.',
  };
}

function autoPlanHardCreditCap(creditCap) {
  return Math.max(18, creditCap || 17);
}

function placeAutoPlanCourse(semesters, course, preferredIndex, creditCap, hardCreditCap) {
  const start = Math.min(Math.max(preferredIndex || 0, 0), Math.max(semesters.length - 1, 0));
  const credits = autoPlanCredits(course);
  const hardCap = hardCreditCap || autoPlanHardCreditCap(creditCap);
  let target = -1;
  let bestLoad = Infinity;
  for (let i = start; i < semesters.length; i++) {
    if (semesters[i]._credits + credits <= creditCap && semesters[i]._credits < bestLoad) {
      target = i;
      bestLoad = semesters[i]._credits;
    }
  }
  if (target === -1) {
    for (let i = 0; i < semesters.length; i++) {
      if (semesters[i]._credits + credits <= creditCap && semesters[i]._credits < bestLoad) {
        target = i;
        bestLoad = semesters[i]._credits;
      }
    }
  }
  if (target === -1) {
    for (let i = start; i < semesters.length; i++) {
      if (semesters[i]._credits + credits <= hardCap && semesters[i]._credits < bestLoad) {
        target = i;
        bestLoad = semesters[i]._credits;
      }
    }
  }
  if (target === -1) {
    for (let i = 0; i < semesters.length; i++) {
      if (semesters[i]._credits + credits <= hardCap && semesters[i]._credits < bestLoad) {
        target = i;
        bestLoad = semesters[i]._credits;
      }
    }
  }
  if (target === -1) {
    target = semesters.reduce((best, sem, i) => sem._credits < semesters[best]._credits ? i : best, 0);
  }
  semesters[target].courses.push(course);
  semesters[target]._credits += credits;
  return target;
}

function completeAutoGeneratedPlan(semesters, opts) {
  const creditCap = opts.creditCap || 17;
  const hardCreditCap = autoPlanHardCreditCap(creditCap);
  const targetCredits = opts.targetCredits || 120;
  const counts = autoPlanRequirementCounts(semesters);

  AUTO_PLAN_GENED_REQUIREMENTS.forEach(req => {
    const have = counts[req.id] || 0;
    for (let i = have + 1; i <= req.need; i++) {
      const placeholder = makeAutoPlanGenEdPlaceholder(req, i);
      placeAutoPlanCourse(semesters, placeholder, req.preferred, creditCap, hardCreditCap);
      counts[req.id] = (counts[req.id] || 0) + 1;
    }
  });

  let total = autoPlanTotalCredits(semesters);
  let freeIndex = 1;
  while (total < targetCredits) {
    const course = makeAutoPlanFreeElective(freeIndex++);
    placeAutoPlanCourse(semesters, course, 0, creditCap, hardCreditCap);
    total += autoPlanCredits(course);
  }
  return semesters;
}

// Topo-distribute courses into N semesters with a credit cap.
// Input: array of course objects with .code, .cr, .prereqs (codes already display-formatted)
// Returns: array of { id, name, year, courses: [...] }
function autoSchedule(courses, opts) {
  opts = opts || {};
  const numSemesters = opts.numSemesters || 8;
  const creditCap    = opts.creditCap    || 17;
  const startTerm    = opts.startTerm    || 'Fall';
  const startYear    = opts.startYear    || 2026;
  const targetCredits = opts.targetCredits || 120;

  const labels = generateSemesterLabels(startTerm, startYear, numSemesters);
  const codeSet = new Set(courses.map(c => normalizeCode(c.code)));

  // Build prereq map (only counting prereqs that are also in the input set)
  const prereqMap = {};
  courses.forEach(c => {
    const norm = normalizeCode(c.code);
    prereqMap[norm] = (c.prereqs || [])
      .map(normalizeCode)
      .filter(p => codeSet.has(p) && p !== norm);
  });

  // Compute depth (longest prereq chain) for each course
  const depth = {};
  function computeDepth(code, visiting) {
    if (depth[code] !== undefined) return depth[code];
    if (visiting.has(code)) return 0; // cycle guard
    visiting.add(code);
    const preds = prereqMap[code] || [];
    let d = 0;
    preds.forEach(p => { d = Math.max(d, 1 + computeDepth(p, visiting)); });
    visiting.delete(code);
    depth[code] = d;
    return d;
  }
  courses.forEach(c => computeDepth(normalizeCode(c.code), new Set()));

  // Sort courses by depth ascending, then by code
  const sorted = [...courses].sort((a, b) => {
    const da = depth[normalizeCode(a.code)] || 0;
    const db = depth[normalizeCode(b.code)] || 0;
    if (da !== db) return da - db;
    return a.code.localeCompare(b.code);
  });

  // Greedy place: walk semesters, place a course if all its prereqs are in
  // earlier semesters AND the credit cap isn't exceeded.
  const placed = {};   // code -> semester index
  const semesters = labels.map(l => ({ ...l, courses: [], _credits: 0 }));
  const unplaced = [];

  for (const c of sorted) {
    const norm = normalizeCode(c.code);
    const preds = prereqMap[norm] || [];
    const earliest = preds.reduce((max, p) => {
      const idx = placed[p];
      return idx === undefined ? max : Math.max(max, idx + 1);
    }, 0);
    let target = -1;
    for (let i = earliest; i < numSemesters; i++) {
      if (semesters[i]._credits + autoPlanCredits(c) <= creditCap) { target = i; break; }
    }
    if (target === -1) { unplaced.push(c); continue; }
    semesters[target].courses.push({
      ...c,
      prereqs: c.prereqs || [],
      coreqs: c.coreqs || [],
    });
    semesters[target]._credits += autoPlanCredits(c);
    placed[norm] = target;
  }

  // Append unplaced as overflow in last semester (rare)
  if (unplaced.length) {
    semesters[numSemesters - 1].courses.push(...unplaced);
    semesters[numSemesters - 1]._credits += unplaced.reduce((sum, c) => sum + autoPlanCredits(c), 0);
  }

  completeAutoGeneratedPlan(semesters, { creditCap, targetCredits });

  return semesters.map(s => {
    const { _credits, ...rest } = s;
    return rest;
  });
}

/* ----------------------------------------------------------
   Apply a major template — fetches metadata, builds schedule,
   replaces state.activeSchedule.
   ---------------------------------------------------------- */
async function applyMajorTemplate(majorId, opts) {
  const tpl = getMajorTemplate(majorId);
  if (!tpl) throw new Error('Unknown major: ' + majorId);
  if (tpl.useDefaultSchedule) {
    state.activeSchedule = null;
    state.selectedSections = {};
    state.schedulePrefs = {};
    state.majorId = majorId;
    state.settings = { ...state.settings,
      programName: tpl.programName, eyebrow: tpl.eyebrow,
      totalCredits: tpl.totalCredits, goalCourses: tpl.goals || state.settings.goalCourses,
    };
    saveState(); applySettings(); render();
    return { ok: true, schedule: SCHEDULE };
  }

  // Templates with a hand-curated 4-year layout skip auto-gen.
  // Course metadata (gpa, gen-eds) refines via the background prefetch.
  if (Array.isArray(tpl.fixedSchedule) && tpl.fixedSchedule.length) {
    const cloned = JSON.parse(JSON.stringify(tpl.fixedSchedule));
    // Uniquify duplicate placeholder codes (e.g. "Free Elective" appears
    // 5x in a schedule). Without this, marking one passed marks them all
    // because state.courses is keyed by code.
    const seen = {};
    const goalsFromSchedule = [];
    cloned.forEach(sem => (sem.courses || []).forEach(c => {
      if (seen[c.code]) {
        seen[c.code]++;
        c.code = `${c.code} #${seen[c.code]}`;
      } else {
        seen[c.code] = 1;
      }
      if (c.isGoal) goalsFromSchedule.push(c.code);
    }));
    state.activeSchedule = cloned;
    state.selectedSections = {};
    state.schedulePrefs = {};
    state.majorId = majorId;
    // Union template goals with isGoal-flagged rows in the schedule
    const goalSet = new Set([...(tpl.goals || []), ...goalsFromSchedule]);
    state.settings = { ...state.settings,
      programName: tpl.programName, eyebrow: tpl.eyebrow,
      totalCredits: tpl.totalCredits, goalCourses: Array.from(goalSet),
    };
    saveState();
    applySettings();
    render();
    return { ok: true, schedule: state.activeSchedule };
  }

  const codes = majorAllCodes(tpl).map(c => c.code);
  // Try multiple status elements so callers (Smart Import, settings, onboarding)
  // all get visible feedback. opts.statusId can override.
  const statusIds = [opts && opts.statusId, 'import-status', 'set-major-status', 'ob-finish-status'].filter(Boolean);
  const statusEls = statusIds.map(id => document.getElementById(id)).filter(Boolean);
  const setStatus = (text, color) => statusEls.forEach(el => {
    el.textContent = text;
    if (color) el.style.color = color;
  });
  setStatus(`Fetching ${codes.length} courses…`, 'var(--slate)');

  const fetched = await fetchCoursesBatch(codes, (done, total) => {
    setStatus(`Fetching ${done}/${total}…`);
  });

  // Build course objects, falling back to template-only data on miss
  const tplCatalog = majorAllCodes(tpl);
  const courseObjs = tplCatalog.map(item => {
    const norm = normalizeCode(item.code);
    const f = fetched[norm];
    if (f) {
      return {
        code: f.code,
        title: f.title,
        cr: f.cr,
        prereqs: f.prereqs,
        prereqGroups: f.prereqGroups,
        coreqs: f.coreqs,
        kind: item.kind,
        category: item.category, // keep template's role bucket; gen-ed override only for non-major courses
        categories: Array.isArray(f.categories) ? f.categories : [],
        gen_ed: f.gen_ed,
        avg_gpa: f.avg_gpa,
      };
    }
    return {
      code: displayCode(item.code),
      title: item.code, cr: 3,
      prereqs: [], coreqs: [],
      kind: item.kind, category: item.category,
    };
  });

  const schedule = autoSchedule(courseObjs, {
    numSemesters: opts && opts.numSemesters || 8,
    creditCap:    opts && opts.creditCap    || 17,
    targetCredits: tpl.totalCredits || 120,
    startTerm:    opts && opts.startTerm    || 'Fall',
    startYear:    opts && opts.startYear    || 2026,
  });

  state.activeSchedule = schedule;
  state.selectedSections = {};
  state.schedulePrefs = {};
  state.majorId = majorId;
  state.settings = { ...state.settings,
    programName: tpl.programName, eyebrow: tpl.eyebrow,
    totalCredits: tpl.totalCredits, goalCourses: tpl.goals || [],
  };
  saveState();
  applySettings();
  render();
  setStatus(`Applied ${tpl.name} (${courseObjs.length} requirements; ${autoPlanTotalCredits(schedule)} planned credits across ${schedule.length} semesters).`, 'var(--green)');
  return { ok: true, schedule };
}

/* ----------------------------------------------------------
   Smart Import modal — paste codes, recursively pull prereqs,
   add to active schedule (auto-distributed).
   ---------------------------------------------------------- */
function openImportCourses() {
  document.getElementById('import-codes').value = '';
  const status = document.getElementById('import-status');
  if (status) status.textContent = '';
  const preview = document.getElementById('import-preview');
  if (preview) preview.innerHTML = '';
  document.getElementById('import-recurse').checked = true;
  document.getElementById('import-modal').classList.add('open');
  setTimeout(() => document.getElementById('import-codes').focus(), 50);
}
function closeImportCourses() {
  document.getElementById('import-modal').classList.remove('open');
}

async function previewImport() {
  const raw = document.getElementById('import-codes').value;
  const recurse = document.getElementById('import-recurse').checked;
  const status = document.getElementById('import-status');
  const preview = document.getElementById('import-preview');
  preview.innerHTML = '';
  const initial = raw.split(/[\s,;\n]+/).map(s => s.trim()).filter(Boolean);
  if (!initial.length) { status.textContent = 'Paste some course codes first.'; status.style.color = 'var(--red)'; return; }

  status.style.color = 'var(--slate)';
  status.textContent = `Fetching ${initial.length} course(s)…`;

  const visited = new Set();
  const queue = initial.map(normalizeCode);
  const results = [];
  const maxDepth = recurse ? 3 : 1;
  let depth = 0;
  while (queue.length && depth < maxDepth) {
    const layer = queue.splice(0, queue.length);
    const fetched = await fetchCoursesBatch(layer.filter(c => !visited.has(c)), (d, t) => {
      status.textContent = `Layer ${depth + 1}: fetched ${d}/${t}…`;
    });
    layer.forEach(c => visited.add(c));
    for (const code of Object.keys(fetched)) {
      const f = fetched[code];
      if (!f) continue;
      results.push(f);
      if (recurse) {
        f.prereqs.forEach(p => { const n = normalizeCode(p); if (!visited.has(n)) queue.push(n); });
      }
    }
    depth++;
  }

  // De-dup
  const uniq = {};
  results.forEach(r => { uniq[normalizeCode(r.code)] = r; });
  const list = Object.values(uniq);
  window._importPreviewList = list;

  status.style.color = 'var(--green)';
  status.textContent = `Ready to import ${list.length} course(s).`;

  preview.innerHTML = list.map(c => `
    <div class="import-row">
      <strong>${c.code}</strong>
      <span>${c.title}</span>
      <span class="muted">${c.cr} cr${c.avg_gpa ? ` · GPA ${c.avg_gpa.toFixed(2)}` : ''}</span>
      ${c.prereqs.length ? `<span class="muted">prereqs: ${c.prereqs.join(', ')}</span>` : ''}
    </div>
  `).join('');
}

function commitImport() {
  const list = window._importPreviewList || [];
  if (!list.length) { toastInfo('Click Preview first.'); return; }

  // Ensure an active schedule exists (lazily copies SCHEDULE the first time)
  const semesters = mutableSchedule();

  // Dedup against existing courses
  const existingCodes = new Set();
  semesters.forEach(s => (s.courses || []).forEach(c => existingCodes.add(normalizeCode(c.code))));
  (state.customCourses || []).forEach(c => existingCodes.add(normalizeCode(c.code)));
  const toAdd = list.filter(c => !existingCodes.has(normalizeCode(c.code)));

  // Greedy slot: place each into the first semester whose credit total + course doesn't blow past 18.
  const cap = 18;
  for (const c of toAdd) {
    let target = -1;
    for (let i = 0; i < semesters.length; i++) {
      const cur = (semesters[i].courses || []).reduce((a, x) => a + (x.cr || 0), 0);
      if (cur + c.cr <= cap) { target = i; break; }
    }
    if (target === -1) target = semesters.length - 1;
    semesters[target].courses.push({
      code: c.code, title: c.title, cr: c.cr,
      prereqs: c.prereqs, prereqGroups: c.prereqGroups, coreqs: c.coreqs,
      kind: c.kind, category: c.category,
    });
  }

  saveState();
  applySettings();
  render();
  closeImportCourses();
}
