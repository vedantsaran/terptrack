'use strict';
/* ============================================================
   RECOMMENDATIONS PANEL
   ============================================================ */

function renderRecommendations() {
  const root = document.getElementById('reco-container');
  if (!root) return;

  const tpl = state.majorId ? getMajorTemplate(state.majorId) : null;
  const planned = new Set(flatCourses().map(c => normalizeCode(c.code)));
  const passed  = new Set(flatCourses()
    .filter(c => { const s = getCourseState(c.code); return s.status === 'passed' || s.status === 'transfer'; })
    .map(c => normalizeCode(c.code)));

  // 1. Missing required courses (from major template)
  const missing = [];
  if (tpl && !tpl.useDefaultSchedule) {
    majorAllCodes(tpl).forEach(item => {
      if (!planned.has(normalizeCode(item.code))) missing.push(item.code);
    });
  }

  // 2. Available now (prereqs met, not yet started, sorted by GPA)
  const available = flatCourses()
    .filter(c => {
      const s = getCourseState(c.code);
      return s.status === 'not-started' && prereqsMet(c).met;
    })
    .map(c => ({ ...c, _gpa: ptCacheGet(c.code)?.average_gpa || null }))
    .sort((a, b) => (b._gpa || 0) - (a._gpa || 0))
    .slice(0, 5);

  // 3. Gen-ed coverage (from cached umd.io gen_ed tags on planned courses)
  const GENED_CATEGORIES = ['FSAW','FSPW','FSOC','FSMA','FSAR','DSHS','DSHU','DSNS','DSNL','DSSP','DVUP','DVCC','SCIS'];
  const covered = new Set();
  flatCourses().forEach(c => {
    const cached = ptCacheGet(c.code) || {};
    // Use cached umd.io entry too if we stored it
    const umd = umdioCacheGet('course:' + normalizeCode(c.code));
    const tags = (umd && umd.gen_ed) || [];
    tags.flat().forEach(t => covered.add(t));
  });
  const missingGenEds = GENED_CATEGORIES.filter(g => !covered.has(g));

  // Build HTML
  const sections = [];

  if (missing.length) {
    sections.push(`
      <div class="reco-section">
        <h4>Required (not yet planned)</h4>
        <p class="reco-sub">${missing.length} course(s) from your major aren't on the schedule.</p>
        <div class="reco-list">
          ${missing.slice(0, 8).map(code => `
            <div class="reco-item">
              <strong>${displayCode(code)}</strong>
              <button class="btn small" onclick="recoAddCourse('${code}')">Add</button>
            </div>
          `).join('')}
          ${missing.length > 8 ? `<div class="reco-more">+ ${missing.length - 8} more</div>` : ''}
        </div>
      </div>
    `);
  }

  if (available.length) {
    sections.push(`
      <div class="reco-section">
        <h4>Take Next (prereqs met)</h4>
        <p class="reco-sub">Sorted by avg GPA where available.</p>
        <div class="reco-list">
          ${available.map(c => `
            <div class="reco-item">
              <strong>${c.code}</strong>
              <span class="reco-title">${c.title}</span>
              ${c._gpa ? `<span class="reco-gpa">GPA ${c._gpa.toFixed(2)}</span>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `);
  }

  if (missingGenEds.length && missingGenEds.length < GENED_CATEGORIES.length) {
    sections.push(`
      <div class="reco-section">
        <h4>Gen-Eds Still Needed</h4>
        <p class="reco-sub">Categories not yet covered in your plan:</p>
        <div class="reco-tags">
          ${missingGenEds.map(g => `<span class="reco-tag">${g}</span>`).join('')}
        </div>
      </div>
    `);
  }

  if (!sections.length) {
    root.innerHTML = '<p class="reco-empty">Apply a major template (Settings → Major) to see personalized recommendations, or import courses to start.</p>';
    return;
  }

  root.innerHTML = sections.join('');
}

async function recoAddCourse(code) {
  const norm = normalizeCode(code);
  const status = document.createElement('div');
  const f = await fetchCourseFull(norm);
  if (!f) { alert(`Couldn't fetch ${code}.`); return; }

  const semesters = mutableSchedule();
  const cap = 18;
  let target = -1;
  for (let i = 0; i < semesters.length; i++) {
    const cur = (semesters[i].courses || []).reduce((a, x) => a + (x.cr || 0), 0);
    if (cur + f.cr <= cap) { target = i; break; }
  }
  if (target === -1) target = semesters.length - 1;
  semesters[target].courses.push({
    code: f.code, title: f.title, cr: f.cr,
    prereqs: f.prereqs, coreqs: f.coreqs,
    kind: 'core', category: 'major-core',
  });
  saveState();
  render();
}
