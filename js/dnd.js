'use strict';
/* ============================================================
   DRAG AND DROP — move courses between semesters
   ============================================================ */

let dndDragData = null; // { code, fromSemId, isCustom }

function attachDndHandlers() {
  // Course rows
  document.querySelectorAll('.course[data-code]').forEach(el => {
    el.draggable = true;
    el.addEventListener('dragstart', (e) => {
      const code = el.dataset.code;
      const fromSemId = el.dataset.semId || '';
      const isCustom = el.dataset.custom === '1';
      dndDragData = { code, fromSemId, isCustom };
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', code); } catch {}
      el.classList.add('dragging');
    });
    el.addEventListener('dragend', () => {
      el.classList.remove('dragging');
      document.querySelectorAll('.semester.drop-target').forEach(s => s.classList.remove('drop-target'));
      dndDragData = null;
    });
  });

  // Semester drop zones
  document.querySelectorAll('.semester[data-sem-id]').forEach(sem => {
    sem.addEventListener('dragover', (e) => {
      if (!dndDragData) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      sem.classList.add('drop-target');
    });
    sem.addEventListener('dragleave', () => sem.classList.remove('drop-target'));
    sem.addEventListener('drop', (e) => {
      e.preventDefault();
      sem.classList.remove('drop-target');
      if (!dndDragData) return;
      const toSemId = sem.dataset.semId;
      const { code, fromSemId, isCustom } = dndDragData;
      if (toSemId === fromSemId) return;
      moveCourseToSemester(code, fromSemId, toSemId, isCustom);
    });
  });
}

function moveCourseToSemester(code, fromSemId, toSemId, isCustom) {
  if (isCustom) {
    const c = (state.customCourses || []).find(x => x.code === code);
    if (c) c.semId = toSemId;
  } else {
    const sched = mutableSchedule();
    let courseObj = null;
    for (const sem of sched) {
      const idx = (sem.courses || []).findIndex(c => c.code === code);
      if (idx >= 0) { courseObj = sem.courses.splice(idx, 1)[0]; break; }
    }
    if (!courseObj) return;
    // Also check customSemesters
    const target = sched.find(s => s.id === toSemId)
      || (state.customSemesters || []).find(s => s.id === toSemId);
    if (target) {
      target.courses = target.courses || [];
      target.courses.push(courseObj);
    }
  }
  saveState();
  render();
}
