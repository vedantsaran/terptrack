'use strict';
/* ============================================================
   GEN-ED COVERAGE MATRIX
   ============================================================ */

const GENED_DEFS = [
  { id: 'FSAW', name: 'Academic Writing',          group: 'Fundamental Studies', need: 1 },
  { id: 'FSPW', name: 'Professional Writing',      group: 'Fundamental Studies', need: 1 },
  { id: 'FSOC', name: 'Oral Communication',        group: 'Fundamental Studies', need: 1 },
  { id: 'FSMA', name: 'Mathematics',               group: 'Fundamental Studies', need: 1 },
  { id: 'FSAR', name: 'Analytic Reasoning',        group: 'Fundamental Studies', need: 1 },
  { id: 'DSHS', name: 'History & Social Sciences', group: 'Distributive Studies', need: 2 },
  { id: 'DSHU', name: 'Humanities',                group: 'Distributive Studies', need: 2 },
  { id: 'DSNS', name: 'Natural Sciences',          group: 'Distributive Studies', need: 1 },
  { id: 'DSNL', name: 'Natural Sciences w/ Lab',   group: 'Distributive Studies', need: 1 },
  { id: 'DSSP', name: 'Scholarship in Practice',   group: 'Distributive Studies', need: 2 },
  { id: 'DVUP', name: 'Understanding Plural Societies', group: 'Diversity', need: 1 },
  { id: 'DVCC', name: 'Cultural Competence',       group: 'Diversity', need: 1 },
  { id: 'SCIS', name: 'Signature Course (I-Series)', group: 'Other', need: 1 },
];

// Returns { covered: { TAG: [course, ...] }, planned: { TAG: [...] } }
function computeGenEdCoverage() {
  const covered = {};
  const planned = {};
  GENED_DEFS.forEach(d => { covered[d.id] = []; planned[d.id] = []; });

  flatCourses().forEach(c => {
    const tags = (typeof courseGenEdTags === 'function')
      ? courseGenEdTags(c)
      : (c.category && c.category.startsWith('gened-') ? [c.category.replace('gened-', '').toUpperCase()] : []);
    if (!tags.length) return;
    const cs = getCourseState(c.code);
    const isComplete = cs.status === 'passed' || cs.status === 'transfer';
    tags.forEach(tag => {
      if (!planned[tag]) return; // unknown tag
      planned[tag].push(c);
      if (isComplete) covered[tag].push(c);
    });
  });

  return { covered, planned };
}

function renderGenEdMatrix() {
  const view = document.getElementById('view-gened');
  if (!view) return;
  const root = document.getElementById('gened-matrix');
  if (!root) return;
  const { covered, planned } = computeGenEdCoverage();

  const groups = {};
  GENED_DEFS.forEach(d => {
    groups[d.group] = groups[d.group] || [];
    groups[d.group].push(d);
  });

  const html = Object.entries(groups).map(([groupName, defs]) => `
    <div class="ge-group">
      <h3>${groupName}</h3>
      <div class="ge-rows">
        ${defs.map(d => {
          const done = covered[d.id].length;
          const pln = planned[d.id].length;
          const status = done >= d.need ? 'done' : pln >= d.need ? 'planned' : 'missing';
          const label = status === 'done' ? '✓ Covered'
                      : status === 'planned' ? '◐ Planned'
                      : '○ Missing';
          const items = planned[d.id].map(c => {
            const cs = getCourseState(c.code);
            const cls = cs.status === 'passed' || cs.status === 'transfer' ? 'ge-pill done' : 'ge-pill planned';
            return `<span class="${cls}" title="${c.title}">${c.code}</span>`;
          }).join('');
          return `
            <div class="ge-row ge-${status}">
              <div class="ge-tag">${d.id}</div>
              <div class="ge-name">${d.name}</div>
              <div class="ge-courses">${items || '<span class="ge-empty">No courses planned</span>'}</div>
              <div class="ge-status">${label}</div>
              <button class="btn small" onclick="genEdJumpToBrowse('${d.id}')">Find</button>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `).join('');

  // Summary
  const totals = GENED_DEFS.reduce((acc, d) => {
    if (covered[d.id].length >= d.need) acc.done++;
    else if (planned[d.id].length >= d.need) acc.planned++;
    else acc.missing++;
    return acc;
  }, { done: 0, planned: 0, missing: 0 });

  const summary = `
    <div class="ge-summary">
      <div class="ge-stat ge-done"><strong>${totals.done}</strong> covered</div>
      <div class="ge-stat ge-planned"><strong>${totals.planned}</strong> planned</div>
      <div class="ge-stat ge-missing"><strong>${totals.missing}</strong> missing</div>
    </div>
  `;

  root.innerHTML = summary + html;
}

function genEdJumpToBrowse(tag) {
  const sel = document.getElementById('br-gened');
  if (sel) sel.value = tag;
  browseGenEd = tag;
  switchTab('browse');
  renderBrowse();
}
