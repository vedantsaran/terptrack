'use strict';
/* ============================================================
   BROWSE COURSES (umd.io)
   ============================================================ */

// Common UMD departments — used as fallback if /departments is unreachable
const COMMON_DEPTS = [
  'AAST','AASP','AGNR','AMSC','AMST','ANTH','ARAB','ARCH','ARTH','ARTT',
  'ASTR','BCHM','BIOE','BIOL','BIOM','BIPH','BISI','BMGT','BSCI','BSOS',
  'BSST','BUFN','BUSI','CCJS','CHBE','CHEM','CHIN','CINE','CLAS','CMLT',
  'CMNS','CMSC','COMM','CPSF','CPSP','CPSS','DANC','EALL','ECON','EDCI',
  'EDHD','EDHI','EDMS','EDSP','EDUC','ENAE','ENCE','ENCH','ENEE','ENES',
  'ENGL','ENMA','ENME','ENPM','ENRE','ENSE','ENSP','ENST','ENTM','EPIB',
  'FILM','FMSC','FREN','GEMS','GEOG','GEOL','GERS','GREK','GVPT','HACS',
  'HBUS','HDCC','HEBR','HESI','HHUM','HISP','HIST','HLSA','HLTH','HONR',
  'INAG','INST','ISRL','ITAL','JAPN','JOUR','JWST','KNES','LACS','LARC',
  'LASC','LATN','LBSC','LGBT','LING','MATH','MEES','MIEH','MITH','MLAW',
  'MSML','MUED','MUSC','NACS','NEUR','NFSC','PERS','PHIL','PHSC','PHYS',
  'PLCY','PLSC','PORT','PSYC','RDEV','RELS','RUSS','SLAA','SOCY','SPAN',
  'SPHL','STAT','SURV','THET','TLPL','UMEI','URSP','USLT','WMST',
];

let browseDept = '';
let browseSearch = '';
let browseGenEd = '';
let browseCache = []; // current dept results

function ensureBrowseTab() {
  // No-op; the tab + view are in HTML. This just renders.
}

async function renderBrowse() {
  const view = document.getElementById('view-browse');
  if (!view) return;
  // Ensure department dropdown is populated once
  const sel = document.getElementById('br-dept');
  if (sel && sel.options.length <= 1) {
    sel.innerHTML = '<option value="">Pick a department…</option>';
    COMMON_DEPTS.forEach(d => {
      const o = document.createElement('option');
      o.value = d; o.textContent = d;
      sel.appendChild(o);
    });
  }

  const grid = document.getElementById('br-grid');
  if (!browseDept) {
    grid.innerHTML = '<p class="reco-empty">Pick a department to browse courses. Tip: type a code in the search to jump.</p>';
    return;
  }

  if (!browseCache.length) {
    grid.innerHTML = '<p class="reco-empty">Loading…</p>';
    browseCache = await umdioListCoursesByDept(browseDept).catch(() => []);
  }

  let rows = browseCache;
  if (browseSearch) {
    const q = browseSearch.toLowerCase();
    rows = rows.filter(r => (r.course_id || '').toLowerCase().includes(q) || (r.name || '').toLowerCase().includes(q));
  }
  if (browseGenEd) {
    rows = rows.filter(r => Array.isArray(r.gen_ed) && r.gen_ed.flat().includes(browseGenEd));
  }

  if (!rows.length) {
    grid.innerHTML = '<p class="reco-empty">No courses found. Try a different filter.</p>';
    return;
  }

  const planned = new Set(flatCourses().map(c => normalizeCode(c.code)));
  grid.innerHTML = rows.slice(0, 200).map(r => {
    const code = r.course_id || '';
    const inPlan = planned.has(normalizeCode(code));
    const ge = (r.gen_ed && r.gen_ed.flat().filter(Boolean)) || [];
    const cached = ptCacheGet(code) || {};
    const gpa = (typeof cached.average_gpa === 'number') ? cached.average_gpa.toFixed(2) : '';
    return `
      <div class="br-card ${inPlan ? 'in-plan' : ''}">
        <div class="br-head">
          <strong>${displayCode(code)}</strong>
          <span class="br-credits">${r.credits || '?'} cr</span>
        </div>
        <div class="br-title">${r.name || ''}</div>
        <div class="br-meta">
          ${ge.length ? ge.map(g => `<span class="reco-tag">${g}</span>`).join('') : ''}
          ${gpa ? `<span class="br-gpa">GPA ${gpa}</span>` : ''}
        </div>
        ${r.description ? `<div class="br-desc">${(r.description || '').slice(0, 200)}${r.description.length > 200 ? '…' : ''}</div>` : ''}
        <div class="br-actions">
          ${inPlan
            ? '<span class="br-pill">In your plan</span>'
            : `<button class="btn small" onclick="browseAddCourse('${code}')">Add to plan</button>`}
        </div>
      </div>
    `;
  }).join('');
}

async function browseAddCourse(code) {
  await resolveAndAddCourse(code);
  renderBrowse();
}

function initBrowse() {
  const dept = document.getElementById('br-dept');
  if (dept) dept.addEventListener('change', (e) => {
    browseDept = e.target.value;
    browseCache = [];
    renderBrowse();
  });
  const search = document.getElementById('br-search');
  if (search) search.addEventListener('input', (e) => {
    browseSearch = e.target.value;
    renderBrowse();
  });
  const ge = document.getElementById('br-gened');
  if (ge) ge.addEventListener('change', (e) => {
    browseGenEd = e.target.value;
    renderBrowse();
  });
}
