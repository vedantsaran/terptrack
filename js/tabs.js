'use strict';
/* ============================================================
   TABS
   ============================================================ */
function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });
  document.querySelectorAll('.view').forEach(v => {
    v.classList.toggle('active', v.id === 'view-' + tab);
  });
  if (tab === 'audit') renderAudit();
  if (tab === 'timeline') renderTimeline();
  if (tab === 'roadmap') renderRoadmap();
  if (tab === 'table') renderTable();
  if (tab === 'browse' && typeof renderBrowse === 'function') renderBrowse();
}
document.querySelectorAll('.tab').forEach(t => {
  t.addEventListener('click', () => switchTab(t.dataset.tab));
});
