'use strict';
/* ============================================================
   TABLE VIEW
   ============================================================ */
let tableSortCol = 'sem';
let tableSortDir = 1; // 1=asc, -1=desc
function semOrderMap() {
  const m = {};
  getAllSemesters().forEach((s, i) => { m[s.id] = i + 1; });
  return m;
}
const CAT_LABELS = {
  'ce-core':'CE Core', 'tech-a':'Cat A','tech-b':'Cat B','tech-c':'Cat C',
  'tech-d':'Cat D','tech-e':'Cat E','tech-f':'Cat F',
  'gened-fsaw':'GenEd','gened-fspw':'GenEd','gened-fsoc':'GenEd','gened-fsma':'GenEd',
  'gened-fsar':'GenEd','gened-dshs':'GenEd','gened-dshu':'GenEd','gened-dssp':'GenEd',
};
const CAT_BADGE_CLASS = {
  'ce-core':'core','tech-a':'tech-a','tech-b':'tech-b','tech-c':'tech-c',
  'tech-d':'tech-d','tech-e':'tech-e','tech-f':'tech-f',
};
function getBadgeClass(cat) {
  return CAT_BADGE_CLASS[cat] || 'gened';
}
function getSemLabel(semId) {
  const s = getAllSemesters().find(x => x.id === semId);
  return s ? s.name : (semId || '—');
}

function renderTable() {
  const searchVal = (document.getElementById('table-search')?.value || '').toLowerCase();
  const filterSem = document.getElementById('table-filter-sem')?.value || '';
  const filterCat = document.getElementById('table-filter-cat')?.value || '';
  const filterStatus = document.getElementById('table-filter-status')?.value || '';

  let rows = flatCourses().map(c => {
    const s = getCourseState(c.code);
    return { ...c, _status: s.status, _grade: s.grade || '' };
  });

  // Filter
  if (searchVal) {
    rows = rows.filter(r => {
      const hay = [r.code, r.title, r.note||'', CAT_LABELS[r.category]||'', r.semId||''].join(' ').toLowerCase();
      return hay.includes(searchVal);
    });
  }
  if (filterSem) rows = rows.filter(r => r.semId === filterSem);
  if (filterCat) rows = rows.filter(r => r.category === filterCat);
  if (filterStatus) rows = rows.filter(r => r._status === filterStatus);

  // Sort
  const order = semOrderMap();
  rows.sort((a, b) => {
    let av, bv;
    if (tableSortCol === 'code')   { av = a.code; bv = b.code; }
    else if (tableSortCol === 'title') { av = a.title; bv = b.title; }
    else if (tableSortCol === 'cr')    { av = a.cr; bv = b.cr; }
    else if (tableSortCol === 'sem')   { av = order[a.semId]||99; bv = order[b.semId]||99; }
    else if (tableSortCol === 'cat')   { av = a.category||''; bv = b.category||''; }
    else if (tableSortCol === 'status'){ av = a._status; bv = b._status; }
    else if (tableSortCol === 'grade') { av = a._grade; bv = b._grade; }
    else { av = 0; bv = 0; }
    if (av < bv) return -tableSortDir;
    if (av > bv) return tableSortDir;
    return (order[a.semId]||99) - (order[b.semId]||99);
  });

  // Update sort arrows
  document.querySelectorAll('.course-table th').forEach(th => {
    th.classList.toggle('sorted', th.dataset.col === tableSortCol);
    const arrow = th.querySelector('.sort-arrow');
    if (arrow) arrow.textContent = (th.dataset.col === tableSortCol) ? (tableSortDir === 1 ? '↑' : '↓') : '↕';
  });

  // Summary
  const allRows = flatCourses().map(c => ({ ...c, _s: getCourseState(c.code) }));
  const earnedCr = allRows.filter(r => r._s.status === 'passed' || r._s.status === 'transfer').reduce((a,c)=>a+c.cr,0);
  const plannedCr = allRows.reduce((a,c)=>a+c.cr,0);
  const techRows = allRows.filter(r => r.category && r.category.startsWith('tech-'));
  const techEarned = techRows.filter(r => r._s.status === 'passed' || r._s.status === 'transfer').reduce((a,c)=>a+c.cr,0);
  const techPlanned = techRows.reduce((a,c)=>a+c.cr,0);
  document.getElementById('table-summary').innerHTML = `
    <span>Showing <strong>${rows.length}</strong> of ${allRows.length} courses</span>
    <span>Credits earned: <strong>${earnedCr}</strong>/${plannedCr} planned</span>
    <span>Tech electives: <strong>${techEarned}</strong>/${techPlanned} cr planned (need 26)</span>
    <span>Click a column header to sort</span>
  `;

  // Render rows
  const tbody = document.getElementById('course-table-body');
  tbody.innerHTML = '';
  const empty = document.getElementById('table-empty');

  if (rows.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  rows.forEach(r => {
    const tr = document.createElement('tr');
    const statusClass = r._status === 'not-started' ? '' : `row-${r._status}`;
    tr.className = statusClass;

    const catLabel = CAT_LABELS[r.category] || r.category || '—';
    const catBadgeCls = getBadgeClass(r.category);

    const statusIcons = { 'not-started':'○','in-progress':'⋯','passed':'✓','transfer':'T','failed':'✗' };
    const statusLabels = { 'not-started':'Not Started','in-progress':'In Progress','passed':'Passed','transfer':'Transfer','failed':'Failed' };

    // Tech category label formatting
    let catDisplay = catLabel;
    if (r.category === 'tech-a') catDisplay = 'Cat A · Math/Sci';
    else if (r.category === 'tech-b') catDisplay = 'Cat B · CS Theory';
    else if (r.category === 'tech-c') catDisplay = 'Cat C · EE Theory';
    else if (r.category === 'tech-d') catDisplay = 'Cat D · Adv. Lab';
    else if (r.category === 'tech-e') catDisplay = 'Cat E · Capstone';
    else if (r.category === 'tech-f') catDisplay = 'Cat F · Gen. Tech';
    else if (r.category === 'ce-core') catDisplay = 'CE Core';
    else if (r.category && r.category.startsWith('gened')) catDisplay = 'GenEd';

    const goalStar = isGoalCourse(r) ? ' ★' : '';
    const ptSlug = normalizeCode(r.code);
    const ptUrl = `https://planetterp.com/course/${ptSlug}`;
    const hasPt = /^[A-Z]{3,4}\d{3}[A-Z]?$/.test(ptSlug);

    tr.innerHTML = `
      <td class="td-code">${r.code}${goalStar}${hasPt ? ` <a class="pt-link" href="${ptUrl}" target="_blank" rel="noopener">PT</a>` : ''}</td>
      <td>${r.title}</td>
      <td class="td-cr">${r.cr}</td>
      <td class="td-sem">${getSemLabel(r.semId)}</td>
      <td class="td-cat"><span class="cat-badge ${catBadgeCls}">${catDisplay}</span></td>
      <td><span class="status-pill ${r._status}">${statusIcons[r._status]||'○'} ${statusLabels[r._status]||r._status}</span></td>
      <td style="font-family:'JetBrains Mono',monospace;font-size:.82rem;color:var(--ink-soft)">${r._grade || '—'}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Table sort/filter event wiring (runs once after DOM ready)
function initTableEvents() {
  document.querySelectorAll('.course-table th[data-col]').forEach(th => {
    th.addEventListener('click', () => {
      if (tableSortCol === th.dataset.col) tableSortDir *= -1;
      else { tableSortCol = th.dataset.col; tableSortDir = 1; }
      renderTable();
    });
  });
  ['table-search','table-filter-sem','table-filter-cat','table-filter-status'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', renderTable);
    if (el) el.addEventListener('change', renderTable);
  });
}
