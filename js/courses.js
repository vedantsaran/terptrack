'use strict';
/* ============================================================
   ADD CUSTOM COURSE
   ============================================================ */
let addCourseSemId = null;

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
  document.getElementById('add-course-modal').classList.add('open');
  setTimeout(() => document.getElementById('ac-code').focus(), 50);
}
function closeAddCourse() {
  document.getElementById('add-course-modal').classList.remove('open');
}

async function lookupCourseFromPlanetTerp() {
  const codeRaw = document.getElementById('ac-code').value.trim();
  const status = document.getElementById('ac-lookup-status');
  if (!codeRaw) { status.textContent = 'Type a course code first (e.g., CMSC131).'; return; }
  status.style.color = 'var(--slate)';
  status.textContent = 'Looking up on PlanetTerp…';
  try {
    const data = await planetTerpFetchCourse(codeRaw);
    if (data.title)   document.getElementById('ac-title').value   = data.title;
    if (data.credits) document.getElementById('ac-credits').value = data.credits;
    const dept = (data.department || '').toUpperCase();
    const num  = data.course_number || '';
    if (dept && num) document.getElementById('ac-code').value = `${dept} ${num}`;
    const gpa = (typeof data.average_gpa === 'number') ? `· avg GPA ${data.average_gpa.toFixed(2)}` : '';
    status.style.color = 'var(--green)';
    status.textContent = `✓ Found: ${data.name || codeRaw} ${gpa}`;
  } catch (err) {
    status.style.color = 'var(--red)';
    status.textContent = `Couldn't find that course (${err.message}). You can still fill it in manually.`;
  }
}

function saveCustomCourse() {
  const code = document.getElementById('ac-code').value.trim();
  const title = document.getElementById('ac-title').value.trim();
  const cr = parseFloat(document.getElementById('ac-credits').value) || 3;
  const note = document.getElementById('ac-note').value.trim();
  const semId = document.getElementById('ac-semester').value || addCourseSemId;
  const category = document.getElementById('ac-category').value || 'tech-f';
  const isGoal = document.getElementById('ac-goal').checked;
  const prereqs = document.getElementById('ac-prereqs').value
    .split(',').map(s => s.trim()).filter(Boolean);

  if (!code || !title) { alert('Code and title are required'); return; }
  if (findCourse(code)) { alert('A course with that code already exists'); return; }

  let kind = 'tech';
  if (category === 'ce-core') kind = 'core';
  else if (category && category.startsWith('gened')) kind = 'gened';
  else if (category === 'elective') kind = 'tech';

  state.customCourses.push({
    code, title, cr,
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
}

