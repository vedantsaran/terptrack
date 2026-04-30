'use strict';
/* ============================================================
   ADD / EDIT COURSE
   ============================================================ */
let addCourseSemId = null;
let editingCourseCode = null; // null = add mode, else editing this code

function populateAcSemesterSelect() {
  const sel = document.getElementById('ac-semester');
  if (!sel) return;
  sel.innerHTML = '';
  getAllSemesters().forEach(sem => {
    const opt = document.createElement('option');
    opt.value = sem.id;
    opt.textContent = sem.name;
    sel.appendChild(opt);
  });
}

function openAddCourse(semId) {
  editingCourseCode = null;
  addCourseSemId = semId;
  populateAcSemesterSelect();
  document.getElementById('ac-code').value = '';
  document.getElementById('ac-title').value = '';
  document.getElementById('ac-credits').value = '3';
  document.getElementById('ac-note').value = '';
  document.getElementById('ac-prereqs').value = '';
  document.getElementById('ac-goal').checked = false;
  document.getElementById('ac-category').value = 'tech-f';
  document.getElementById('ac-semester').value = semId || (getAllSemesters()[0]?.id || '');
  document.getElementById('ac-lookup-status').textContent = '';
  const title = document.getElementById('add-course-title');
  if (title) title.textContent = 'Add Custom Course';
  const code = document.getElementById('ac-code');
  code.disabled = false;
  // Hide auto-add-prereqs toggle in edit mode (rendered below)
  const apr = document.getElementById('ac-auto-prereqs-row');
  if (apr) apr.style.display = '';
  document.getElementById('add-course-modal').classList.add('open');
  setTimeout(() => code.focus(), 50);
}

function openEditCourse(courseCode) {
  const c = findCourse(courseCode);
  if (!c) { toastError(`Course ${courseCode} not found.`); return; }
  editingCourseCode = courseCode;
  populateAcSemesterSelect();
  document.getElementById('ac-code').value = c.code;
  document.getElementById('ac-title').value = c.title || '';
  document.getElementById('ac-credits').value = c.cr || 3;
  document.getElementById('ac-note').value = c.note || '';
  document.getElementById('ac-prereqs').value = (c.prereqs || []).join(', ');
  document.getElementById('ac-goal').checked = !!c.isGoal;
  document.getElementById('ac-category').value = c.category || 'tech-f';
  document.getElementById('ac-semester').value = c.semId || addCourseSemId || '';
  document.getElementById('ac-lookup-status').textContent = '';
  const title = document.getElementById('add-course-title');
  if (title) title.textContent = 'Edit Course';
  document.getElementById('ac-code').disabled = true; // changing code would orphan progress
  const apr = document.getElementById('ac-auto-prereqs-row');
  if (apr) apr.style.display = 'none';
  document.getElementById('add-course-modal').classList.add('open');
}

function closeAddCourse() {
  document.getElementById('add-course-modal').classList.remove('open');
  editingCourseCode = null;
}

async function lookupCourseFromPlanetTerp() {
  const codeRaw = document.getElementById('ac-code').value.trim();
  const status = document.getElementById('ac-lookup-status');
  if (!codeRaw) { status.textContent = 'Type a course code first (e.g., CMSC131).'; return; }
  status.style.color = 'var(--slate)';
  status.textContent = 'Looking up on umd.io + PlanetTerp…';
  try {
    const f = await fetchCourseFull(codeRaw);
    if (!f) throw new Error('not found in either API');
    document.getElementById('ac-code').value = f.code;
    document.getElementById('ac-title').value = f.title || '';
    document.getElementById('ac-credits').value = f.cr || 3;
    if (f.prereqs && f.prereqs.length) {
      document.getElementById('ac-prereqs').value = f.prereqs.join(', ');
    }
    if (f.category && f.category.startsWith('gened')) {
      // Best-effort category guess
      const sel = document.getElementById('ac-category');
      if ([...sel.options].some(o => o.value === f.category)) sel.value = f.category;
    }
    const gpa = f.avg_gpa ? `· avg GPA ${f.avg_gpa.toFixed(2)}` : '';
    status.style.color = 'var(--green)';
    status.textContent = `✓ Found: ${f.code} ${gpa}`;
  } catch (err) {
    status.style.color = 'var(--red)';
    status.textContent = `Couldn't find that course (${err.message}). You can still fill it in manually.`;
  }
}

async function saveCustomCourse() {
  const codeInput = document.getElementById('ac-code').value.trim();
  const title = document.getElementById('ac-title').value.trim();
  const cr = parseFloat(document.getElementById('ac-credits').value) || 3;
  const note = document.getElementById('ac-note').value.trim();
  const semId = document.getElementById('ac-semester').value || addCourseSemId;
  const category = document.getElementById('ac-category').value || 'tech-f';
  const isGoal = document.getElementById('ac-goal').checked;
  const prereqs = document.getElementById('ac-prereqs').value
    .split(',').map(s => s.trim()).filter(Boolean);
  const autoPrereqs = (document.getElementById('ac-auto-prereqs') || {}).checked;

  if (!codeInput || !title) { toastError('Code and title are required.'); return; }

  let kind = 'tech';
  if (category === 'ce-core' || category === 'major-core') kind = 'core';
  else if (category && category.startsWith('gened')) kind = 'gened';
  else if (category === 'elective') kind = 'tech';

  if (editingCourseCode) {
    // EDIT path: find course in customCourses or activeSchedule, mutate in place
    const cust = (state.customCourses || []).find(c => c.code === editingCourseCode);
    if (cust) {
      Object.assign(cust, { title, cr, prereqs, kind, category, semId, isGoal, note });
    } else {
      // Find in active schedule and mutate
      const sched = mutableSchedule();
      let found = false;
      for (const sem of [...sched, ...(state.customSemesters || [])]) {
        const c = (sem.courses || []).find(x => x.code === editingCourseCode);
        if (c) {
          Object.assign(c, { title, cr, prereqs, kind, category, isGoal, note });
          // Move semesters if changed
          if (semId && sem.id !== semId) {
            sem.courses = sem.courses.filter(x => x.code !== editingCourseCode);
            const target = [...sched, ...(state.customSemesters || [])].find(s => s.id === semId);
            if (target) { target.courses = target.courses || []; target.courses.push(c); }
          }
          found = true;
          break;
        }
      }
      if (!found) { toastError('Could not locate course to edit.'); return; }
    }
    saveState();
    closeAddCourse();
    render();
    toastSuccess(`Updated ${editingCourseCode}.`);
    return;
  }

  // ADD path
  if (findCourse(codeInput)) { toastError('A course with that code already exists.'); return; }

  state.customCourses.push({
    code: codeInput, title, cr,
    prereqs, coreqs: [],
    kind, category,
    semId,
    isGoal,
    note: note || '',
    isCustom: true,
  });
  saveState();
  closeAddCourse();
  render();
  toastSuccess(`Added ${codeInput}.`);

  // Optionally pull in prereqs after the add
  if (autoPrereqs && prereqs.length) {
    setTimeout(() => resolveAndAddCourse(codeInput), 250);
  }
}
