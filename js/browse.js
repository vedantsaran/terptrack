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

const BROWSE_ALL_GENEDS_VALUE = '__ALL_GENEDS__';
const BROWSE_GENED_TAGS = ['FSAW','FSPW','FSOC','FSMA','FSAR','DSHS','DSHU','DSNS','DSNL','DSSP','DVUP','DVCC','SCIS'];

let browseDept = '';
let browseSearch = '';
let browseGenEd = '';
let browseCache = []; // current dept/gen-ed result set
let browseCacheKey = '';

function ensureBrowseTab() {
  // No-op; the tab + view are in HTML. This just renders.
}

function browseAllSearchDepts() {
  return (typeof COMMON_DEPTS !== 'undefined' && Array.isArray(COMMON_DEPTS)) ? COMMON_DEPTS : [];
}

async function browseListCoursesByGenEdWithFallback(tag, dept = '') {
  const cleanTag = String(tag || '').trim().toUpperCase();
  const cleanDept = String(dept || '').trim().toUpperCase();
  if (!cleanTag) return [];
  const apiRows = await umdioListCoursesByGenEd(cleanTag, { dept: cleanDept }).catch(() => []);
  if (apiRows.length || cleanDept) return apiRows;

  // Same client-side fallback used by the working Gen-Ed browser: if the
  // API's global gen_ed filter is empty/unavailable, scan departments and
  // keep rows whose returned metadata carries the selected Gen-Ed tag.
  const rows = [];
  let idx = 0;
  const depts = browseAllSearchDepts();
  const concurrency = Math.min(4, depts.length);
  async function worker() {
    while (idx < depts.length) {
      const d = depts[idx++];
      const deptRows = await umdioListCoursesByDept(d).catch(() => []);
      deptRows.forEach(r => rows.push(r));
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  return rows.filter(r => Array.isArray(r.gen_ed) && r.gen_ed.flat().map(t => String(t).toUpperCase()).includes(cleanTag));
}

async function browseListCoursesByGenEdTags(tags, opts = {}) {
  const cleanTags = Array.from(new Set((tags || []).map(t => String(t || '').trim().toUpperCase()).filter(Boolean)));
  const cleanDept = opts.dept ? String(opts.dept).trim().toUpperCase() : '';
  if (!cleanTags.length) return [];
  const lists = await Promise.all(cleanTags.map(tag => browseListCoursesByGenEdWithFallback(tag, cleanDept).catch(() => [])));
  const byCode = new Map();
  lists.flat().forEach(r => {
    const key = normalizeCode(r.course_id || '');
    if (!key) return;
    const existing = byCode.get(key) || {};
    byCode.set(key, { ...existing, ...r, _sourceGenEd: r._sourceGenEd || cleanTags.find(tag => ((r.gen_ed && r.gen_ed.flat()) || []).map(t => String(t).toUpperCase()).includes(tag)) || '' });
  });
  return Array.from(byCode.values());
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
  if (!browseDept && !browseGenEd) {
    grid.innerHTML = '<p class="reco-empty">Pick a department, choose a Gen-Ed tag, or choose “All Gen-Ed categories” to browse Gen-Eds across every department.</p>';
    return;
  }

  const desiredCacheKey = `${browseDept || 'ALL'}:${browseGenEd || 'ANY'}`;
  if (browseCacheKey !== desiredCacheKey) {
    browseCache = [];
    browseCacheKey = desiredCacheKey;
  }
  if (!browseCache.length) {
    const allGenEds = browseGenEd === BROWSE_ALL_GENEDS_VALUE;
    const scopeLabel = allGenEds && !browseDept
      ? 'all Gen-Ed courses'
      : browseGenEd && !browseDept ? `all ${browseGenEd} courses` : `${browseDept} courses`;
    grid.innerHTML = `<p class="reco-empty">Loading ${scopeLabel}…</p>`;
    if (allGenEds && !browseDept) {
      browseCache = await browseListCoursesByGenEdTags(BROWSE_GENED_TAGS).catch(() => []);
    } else {
      browseCache = browseGenEd && !allGenEds
        ? await browseListCoursesByGenEdWithFallback(browseGenEd, browseDept || '').catch(() => [])
        : await umdioListCoursesByDept(browseDept).catch(() => []);
    }
  }

  let rows = browseCache;
  if (browseSearch) {
    const q = browseSearch.toLowerCase();
    rows = rows.filter(r => (r.course_id || '').toLowerCase().includes(q) || (r.name || '').toLowerCase().includes(q));
  }
  if (browseGenEd && browseGenEd !== BROWSE_ALL_GENEDS_VALUE) {
    rows = rows.filter(r => Array.isArray(r.gen_ed) && r.gen_ed.flat().includes(browseGenEd));
  } else if (browseGenEd === BROWSE_ALL_GENEDS_VALUE) {
    rows = rows.filter(r => Array.isArray(r.gen_ed) && r.gen_ed.flat().filter(Boolean).length);
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
    browseCacheKey = '';
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
    browseCache = [];
    browseCacheKey = '';
    renderBrowse();
  });
}
