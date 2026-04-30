'use strict';
/* ============================================================
   BULK MARK courses by semester
   ============================================================ */

let _bulkMenu = null;

function showBulkMenu(anchor, semId) {
  hideBulkMenu();
  const sem = getAllSemesters().find(s => s.id === semId);
  if (!sem) return;
  const courseCodes = [
    ...(sem.courses || []).map(c => c.code),
    ...(state.customCourses || []).filter(c => c.semId === semId).map(c => c.code),
  ];

  const menu = document.createElement('div');
  menu.className = 'bulk-menu';
  menu.innerHTML = `
    <button data-act="passed">✓ Mark all passed</button>
    <button data-act="transfer">↺ Mark all transfer credit</button>
    <button data-act="in-progress">◐ Mark all in progress</button>
    <button data-act="reset">○ Reset all</button>
  `;
  document.body.appendChild(menu);
  const r = anchor.getBoundingClientRect();
  menu.style.position = 'fixed';
  menu.style.top = (r.bottom + 4) + 'px';
  menu.style.left = Math.max(8, r.right - 200) + 'px';
  menu.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      const act = btn.dataset.act;
      bulkApply(courseCodes, act);
      hideBulkMenu();
    });
  });
  _bulkMenu = menu;
  setTimeout(() => document.addEventListener('click', hideBulkMenu, { once: true }), 0);
}

function hideBulkMenu() {
  if (_bulkMenu) { _bulkMenu.remove(); _bulkMenu = null; }
}

function bulkApply(codes, action) {
  codes.forEach(code => {
    if (action === 'reset') {
      delete state.courses[code];
    } else {
      const cur = state.courses[code] || {};
      state.courses[code] = { ...cur, status: action };
    }
  });
  saveState();
  render();
}
