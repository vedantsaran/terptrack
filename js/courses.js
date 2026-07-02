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
  // Placeholders (Free Elective, "CMSC 4xx", etc.) and untouched rows
  // can have their code freely replaced. Real courses with progress
  // marks lock the code so the user doesn't orphan their state.courses entry.
  const isPlaceholder = !/^[A-Z]{3,4}\s*\d{3}[A-Z]?(\s+#\d+)?$/i.test(c.code);
  const cs = getCourseState(c.code);
  const hasProgress = cs.status !== 'not-started' || !!cs.grade;
  const lockCode = hasProgress && !isPlaceholder;
  if (title) title.textContent = isPlaceholder ? 'Replace Placeholder Course' : 'Edit Course';
  document.getElementById('ac-code').disabled = lockCode;
  const apr = document.getElementById('ac-auto-prereqs-row');
  if (apr) apr.style.display = isPlaceholder ? '' : 'none';
  document.getElementById('add-course-modal').classList.add('open');
}

function closeAddCourse() {
  document.getElementById('add-course-modal').classList.remove('open');
  // Reset state so the next open() doesn't inherit the previous mode
  document.getElementById('ac-code').disabled = false;
  editingCourseCode = null;
}

function findCourseCodeCollision(code, excludeCode = '') {
  const target = normalizeCode(code);
  if (!target) return null;
  const excludeExact = String(excludeCode || '').trim();
  let skippedExcluded = false;
  return flatCourses().find(course => {
    const existing = String(course?.code || '').trim();
    if (!existing || normalizeCode(existing) !== target) return false;
    if (excludeExact && existing === excludeExact && !skippedExcluded) {
      skippedExcluded = true;
      return false;
    }
    return true;
  }) || null;
}

function courseCodeCollisionMessage(inputCode, collision) {
  const existing = String(collision?.code || '').trim();
  if (existing && existing !== inputCode) {
    return `A course matching "${inputCode}" already exists as "${existing}".`;
  }
  return `A course with code "${inputCode}" already exists.`;
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
    const codeChanged = codeInput !== editingCourseCode;
    const normalizedCodeChanged = normalizeCode(codeInput) !== normalizeCode(editingCourseCode);
    const movedSelectionSemIds = [];
    // Block code collisions with another course in the plan
    const collision = codeChanged ? findCourseCodeCollision(codeInput, editingCourseCode) : null;
    if (collision) {
      toastError(courseCodeCollisionMessage(codeInput, collision));
      return;
    }
    // EDIT path: find course in customCourses or activeSchedule, mutate in place
    const cust = (state.customCourses || []).find(c => c.code === editingCourseCode);
    if (cust) {
      const sourceSemId = cust.semId || '';
      Object.assign(cust, { code: codeInput, title, cr, prereqs, kind, category, semId, isGoal, note });
      if (sourceSemId && semId && sourceSemId !== semId) movedSelectionSemIds.push(sourceSemId, semId);
    } else {
      // Find in active schedule and mutate
      const sched = mutableSchedule();
      let found = false;
      for (const sem of [...sched, ...(state.customSemesters || [])]) {
        const c = (sem.courses || []).find(x => x.code === editingCourseCode);
        if (c) {
          Object.assign(c, { code: codeInput, title, cr, prereqs, kind, category, isGoal, note });
          // Move semesters if changed
          if (semId && sem.id !== semId) {
            sem.courses = sem.courses.filter(x => x.code !== codeInput);
            const target = [...sched, ...(state.customSemesters || [])].find(s => s.id === semId);
            if (target) { target.courses = target.courses || []; target.courses.push(c); }
            movedSelectionSemIds.push(sem.id, semId);
          }
          found = true;
          break;
        }
      }
      if (!found) { toastError('Could not locate course to edit.'); return; }
    }
    // Migrate any progress entry to the new code
    if (codeChanged && state.courses[editingCourseCode]) {
      state.courses[codeInput] = state.courses[editingCourseCode];
      delete state.courses[editingCourseCode];
    }
    if (normalizedCodeChanged && typeof clearSelectedSectionsForCourse === 'function') {
      clearSelectedSectionsForCourse(editingCourseCode);
    }
    if (movedSelectionSemIds.length && typeof clearSelectedSectionsForCourse === 'function') {
      clearSelectedSectionsForCourse(codeInput, movedSelectionSemIds);
    }
    saveState();
    closeAddCourse();
    render();
    toastSuccess(codeChanged ? `Replaced ${editingCourseCode} → ${codeInput}.` : `Updated ${codeInput}.`);
    // Optionally pull in prereqs after a placeholder replacement
    if (autoPrereqs && codeChanged && /^[A-Z]{3,4}\s*\d{3}[A-Z]?$/i.test(codeInput)) {
      setTimeout(() => resolveAndAddCourse(codeInput), 250);
    }
    return;
  }

  // ADD path
  const collision = findCourseCodeCollision(codeInput);
  if (collision) { toastError(courseCodeCollisionMessage(codeInput, collision)); return; }

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
