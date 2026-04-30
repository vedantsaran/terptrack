'use strict';
/* ============================================================
   TIMELINE VIEW
   ============================================================ */
function renderTimeline() {
  const rail = document.getElementById('timeline-rail');
  rail.innerHTML = '';
  DEFAULT_TIMELINE_EVENTS.forEach(ev => {
    const el = document.createElement('div');
    el.className = 'timeline-event ' + (ev.phase || '');
    el.innerHTML = `
      <div class="timeline-card">
        <div class="timeline-date">${ev.date}</div>
        <div class="timeline-title">${ev.title}</div>
        <div class="timeline-desc">${ev.desc}</div>
      </div>
    `;
    rail.appendChild(el);
  });
}

