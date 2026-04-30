'use strict';
/* ============================================================
   DRAG AND DROP — move and reorder courses
   ============================================================ */

let dndDragData = null; // { code, fromSemId, isCustom }

function _findInsertIndex(container, y) {
  const rows = [...container.querySelectorAll('.course:not(.dragging)')];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i].getBoundingClientRect();
    if (y < r.top + r.height / 2) return i;
  }
  return rows.length;
}

function attachDndHandlers() {
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
      document.querySelectorAll('.course.drop-above, .course.drop-below').forEach(c => c.classList.remove('drop-above', 'drop-below'));
      dndDragData = null;
    });
  });

  document.querySelectorAll('.semester[data-sem-id]').forEach(sem => {
    const list = sem.querySelector('.courses');
    sem.addEventListener('dragover', (e) => {
      if (!dndDragData) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      sem.classList.add('drop-target');
      // Reorder: highlight position
      if (list) {
        list.querySelectorAll('.course').forEach(c => c.classList.remove('drop-above', 'drop-below'));
        const idx = _findInsertIndex(list, e.clientY);
        const rows = [...list.querySelectorAll('.course:not(.dragging)')];
        if (rows.length === 0) {
          // empty semester
        } else if (idx >= rows.length) {
          rows[rows.length - 1].classList.add('drop-below');
        } else {
          rows[idx].classList.add('drop-above');
        }
      }
    });
    sem.addEventListener('dragleave', (e) => {
      // Only clear if we're actually leaving the semester element (not entering a child)
      if (e.relatedTarget && sem.contains(e.relatedTarget)) return;
      sem.classList.remove('drop-target');
    });
    sem.addEventListener('drop', (e) => {
      e.preventDefault();
      sem.classList.remove('drop-target');
      if (!dndDragData) return;
      const toSemId = sem.dataset.semId;
      const insertAt = list ? _findInsertIndex(list, e.clientY) : -1;
      const { code, fromSemId, isCustom } = dndDragData;
      moveCourseToSemester(code, fromSemId, toSemId, isCustom, insertAt);
    });
  });
}

function moveCourseToSemester(code, fromSemId, toSemId, isCustom, insertAt) {
  const sched = mutableSchedule();
  const allSems = [...sched, ...(state.customSemesters || [])];
  const targetSem = allSems.find(s => s.id === toSemId);
  if (!targetSem) return;

  if (isCustom) {
    const c = (state.customCourses || []).find(x => x.code === code);
    if (!c) return;
    // Reorder inside customCourses pool — no inherent position; just move semId
    if (c.semId !== toSemId) c.semId = toSemId;
  } else {
    let courseObj = null;
    let sourceSem = null;
    for (const sem of allSems) {
      const idx = (sem.courses || []).findIndex(c => c.code === code);
      if (idx >= 0) {
        sourceSem = sem;
        courseObj = sem.courses.splice(idx, 1)[0];
        break;
      }
    }
    if (!courseObj) return;
    targetSem.courses = targetSem.courses || [];
    if (typeof insertAt === 'number' && insertAt >= 0 && insertAt < targetSem.courses.length) {
      targetSem.courses.splice(insertAt, 0, courseObj);
    } else {
      targetSem.courses.push(courseObj);
    }
  }
  saveState();
  render();
}
