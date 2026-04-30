'use strict';
/* ============================================================
   GPA SIMULATOR — what-if grade projection
   ============================================================ */

const _simHypoGrades = {}; // code -> hypothetical grade letter

function _qualityPoints(grade) {
  return GRADE_POINTS[grade];
}

function _computeProjectedGpa() {
  let qp = 0;
  let cr = 0;
  flatCourses().forEach(c => {
    const cs = getCourseState(c.code);
    let g = '';
    // Real grades for passed/failed only
    if ((cs.status === 'passed' || cs.status === 'failed') && cs.grade) g = cs.grade;
    // Hypothetical override always wins if set
    if (_simHypoGrades[c.code]) g = _simHypoGrades[c.code];
    if (!g) return;
    const points = _qualityPoints(g);
    if (typeof points !== 'number') return;
    qp += points * c.cr;
    cr += c.cr;
  });
  return cr ? { gpa: qp / cr, credits: cr } : { gpa: 0, credits: 0 };
}

function openGpaSim() {
  Object.keys(_simHypoGrades).forEach(k => delete _simHypoGrades[k]);
  renderGpaSim();
  document.getElementById('gpa-modal').classList.add('open');
}

function closeGpaSim() {
  document.getElementById('gpa-modal').classList.remove('open');
}

function renderGpaSim() {
  const list = document.getElementById('gpa-list');
  if (!list) return;
  const courses = flatCourses().filter(c => {
    const cs = getCourseState(c.code);
    return cs.status !== 'transfer' && cs.status !== 'passed' && cs.status !== 'failed';
  });

  list.innerHTML = courses.length
    ? courses.map(c => {
        const opts = GRADE_OPTIONS.map(g => `<option value="${g}" ${(_simHypoGrades[c.code] || '') === g ? 'selected' : ''}>${g || '—'}</option>`).join('');
        return `
          <div class="gpa-row">
            <span class="gpa-code">${c.code}</span>
            <span class="gpa-title">${c.title}</span>
            <span class="gpa-cr">${c.cr} cr</span>
            <select class="gpa-select" data-code="${c.code}">${opts}</select>
          </div>
        `;
      }).join('')
    : '<p class="reco-empty">No incomplete courses to project.</p>';

  list.querySelectorAll('.gpa-select').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const code = e.target.dataset.code;
      if (e.target.value) _simHypoGrades[code] = e.target.value;
      else delete _simHypoGrades[code];
      _renderGpaSummary();
    });
  });

  _renderGpaSummary();
}

function _renderGpaSummary() {
  // Current GPA: only real grades on passed/failed
  let realQp = 0, realCr = 0;
  flatCourses().forEach(c => {
    const cs = getCourseState(c.code);
    if ((cs.status === 'passed' || cs.status === 'failed') && cs.grade) {
      const p = _qualityPoints(cs.grade);
      if (typeof p === 'number') { realQp += p * c.cr; realCr += c.cr; }
    }
  });
  const cur = realCr ? (realQp / realCr) : 0;
  const proj = _computeProjectedGpa();

  const root = document.getElementById('gpa-summary');
  if (!root) return;
  root.innerHTML = `
    <div class="gpa-stat">
      <div class="gpa-label">Current GPA</div>
      <div class="gpa-value">${realCr ? cur.toFixed(3) : '—'}</div>
      <div class="gpa-detail">${realCr} cr graded</div>
    </div>
    <div class="gpa-arrow">→</div>
    <div class="gpa-stat ${proj.gpa >= cur ? 'gpa-up' : 'gpa-down'}">
      <div class="gpa-label">Projected GPA</div>
      <div class="gpa-value">${proj.credits ? proj.gpa.toFixed(3) : '—'}</div>
      <div class="gpa-detail">${proj.credits} cr after projections</div>
    </div>
  `;
}
