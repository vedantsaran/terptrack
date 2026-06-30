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
const BROWSE_PROFILE_DEPTS_VALUE = '__PROFILE_DEPTS__';
const BROWSE_GENED_TAGS = ['FSAW','FSPW','FSOC','FSMA','FSAR','DSHS','DSHU','DSNS','DSNL','DSSP','DVUP','DVCC','SCIS'];
const BROWSE_SAVED_LIMIT = 12;

let browseDept = '';
let browseSearch = '';
let browseGenEd = '';
let browseCache = []; // current dept/gen-ed result set
let browseCacheKey = '';
let browseProfileDefaultsApplied = false;

function ensureBrowseTab() {
  // No-op; the tab + view are in HTML. This just renders.
}

function browseEscape(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[ch]));
}

function browseAllSearchDepts() {
  return (typeof COMMON_DEPTS !== 'undefined' && Array.isArray(COMMON_DEPTS)) ? COMMON_DEPTS : [];
}

function browseProfileDepartments() {
  const depts = typeof profilePreferredDepartments === 'function' ? profilePreferredDepartments() : [];
  const allowed = new Set(browseAllSearchDepts());
  return depts.filter(dept => allowed.has(dept)).slice(0, 8);
}

function browseIsProfileDeptMode() {
  return browseDept === BROWSE_PROFILE_DEPTS_VALUE;
}

function browseDepartmentScope() {
  if (browseIsProfileDeptMode()) {
    const depts = browseProfileDepartments();
    return { depts, label: depts.length ? `profile departments (${depts.slice(0, 5).join(', ')}${depts.length > 5 ? '…' : ''})` : 'profile departments' };
  }
  return { depts: browseDept ? [browseDept] : [], label: browseDept ? `${browseDept} courses` : '' };
}

function browseProfileSummaryText(depts) {
  const prefs = typeof getProfilePrefs === 'function' ? getProfilePrefs() : null;
  const interestLabels = typeof profileSelectedInterestDefs === 'function'
    ? profileSelectedInterestDefs(prefs || undefined).map(def => def.label)
    : [];
  if (!depts.length && !interestLabels.length && !(prefs && prefs.careerGoal)) return '';
  const parts = [];
  if (interestLabels.length) parts.push(interestLabels.slice(0, 2).join(', '));
  if (depts.length) parts.push(`departments: ${depts.slice(0, 5).join(', ')}`);
  if (prefs && prefs.careerGoal) parts.push(`goal: ${prefs.careerGoal}`);
  return parts.join(' · ');
}

function syncBrowseControls() {
  const dept = document.getElementById('br-dept');
  if (dept && dept.value !== browseDept) dept.value = browseDept || '';
  const ge = document.getElementById('br-gened');
  if (ge && ge.value !== browseGenEd) ge.value = browseGenEd || '';
  const search = document.getElementById('br-search');
  if (search && search.value !== browseSearch) search.value = browseSearch || '';
}

function applyBrowseProfileDefaults() {
  if (browseProfileDefaultsApplied || browseDept || browseGenEd || browseSearch) return;
  const depts = browseProfileDepartments();
  if (!depts.length) return;
  browseDept = BROWSE_PROFILE_DEPTS_VALUE;
  browseCache = [];
  browseCacheKey = '';
  browseProfileDefaultsApplied = true;
  syncBrowseControls();
}

function renderBrowseProfileHints() {
  const root = document.getElementById('br-profile-hints');
  if (!root) return;
  const depts = browseProfileDepartments();
  const summary = browseProfileSummaryText(depts);
  if (!summary) {
    root.hidden = true;
    root.innerHTML = '';
    return;
  }
  root.hidden = false;
  const deptButtons = [
    `<button type="button" class="browse-profile-chip ${browseIsProfileDeptMode() ? 'active' : ''}" data-br-profile-dept="${BROWSE_PROFILE_DEPTS_VALUE}">All profile departments</button>`,
    ...depts.map(dept => `
      <button type="button" class="browse-profile-chip ${browseDept === dept ? 'active' : ''}" data-br-profile-dept="${browseEscape(dept)}">${browseEscape(dept)}</button>
    `),
  ].join('');
  root.innerHTML = `
    <span>Profile search</span>
    <strong>${browseEscape(summary)}</strong>
    <div>${deptButtons}</div>
  `;
  root.querySelectorAll('[data-br-profile-dept]').forEach(btn => {
    btn.addEventListener('click', () => {
      browseDept = btn.dataset.brProfileDept || '';
      browseCache = [];
      browseCacheKey = '';
      syncBrowseControls();
      renderBrowse();
    });
  });
}

function browseSavedSearches() {
  state.browseSavedSearches = typeof normalizeBrowseSavedSearches === 'function'
    ? normalizeBrowseSavedSearches(state.browseSavedSearches)
    : (Array.isArray(state.browseSavedSearches) ? state.browseSavedSearches : []);
  return state.browseSavedSearches;
}

function browseCurrentSearch() {
  return {
    dept: browseDept || '',
    genEd: browseGenEd || '',
    search: String(browseSearch || '').trim(),
  };
}

function browseSearchLabel(search = browseCurrentSearch()) {
  const deptLabel = search.dept === BROWSE_PROFILE_DEPTS_VALUE ? 'Profile departments' : search.dept;
  const genEdLabel = search.genEd === BROWSE_ALL_GENEDS_VALUE ? 'All Gen-Eds' : search.genEd;
  return [deptLabel, genEdLabel, search.search].filter(Boolean).join(' · ') || 'Browse search';
}

function browseSaveCurrentSearch() {
  const current = browseCurrentSearch();
  if (!current.dept && !current.genEd && !current.search) {
    toastError('Pick a department, GenEd, or keyword before saving.');
    return;
  }
  const saved = browseUpsertSavedSearch(current);
  if (saved) toastSuccess(`Saved "${saved.label}".`);
}

function browseUpsertSavedSearch(search, options = {}) {
  const current = {
    dept: String(search?.dept || '').trim(),
    genEd: String(search?.genEd || '').trim(),
    search: String(search?.search || '').trim(),
  };
  if (!current.dept && !current.genEd && !current.search) return null;
  const label = String(options.label || browseSearchLabel(current)).trim().slice(0, 90) || browseSearchLabel(current);
  const saved = browseSavedSearches();
  const duplicate = saved.find(search => (
    search.dept === current.dept
    && search.genEd === current.genEd
    && search.search === current.search
  ));
  const next = {
    id: duplicate?.id || `browse-${Date.now()}`,
    label,
    ...current,
    createdAt: duplicate?.createdAt || new Date().toISOString(),
  };
  state.browseSavedSearches = [
    next,
    ...saved.filter(search => search.id !== next.id),
  ].slice(0, BROWSE_SAVED_LIMIT);
  saveState();
  renderBrowseSavedSearches();
  return next;
}

function browseOpenSearch(config = {}) {
  const next = {
    dept: String(config.dept || '').trim(),
    genEd: String(config.genEd || '').trim(),
    search: String(config.search || '').trim(),
  };
  browseProfileDefaultsApplied = true;
  browseDept = next.dept;
  browseGenEd = next.genEd;
  browseSearch = next.search;
  browseCache = [];
  browseCacheKey = '';
  if (config.save) browseUpsertSavedSearch(next, { label: config.label || browseSearchLabel(next) });
  syncBrowseControls();
  if (typeof switchTab === 'function') {
    switchTab('browse');
  } else {
    renderBrowse();
  }
}

function browseApplySavedSearch(id) {
  const saved = browseSavedSearches().find(search => search.id === id);
  if (!saved) return;
  browseProfileDefaultsApplied = true;
  browseDept = saved.dept || '';
  browseGenEd = saved.genEd || '';
  browseSearch = saved.search || '';
  browseCache = [];
  browseCacheKey = '';
  syncBrowseControls();
  renderBrowse();
}

function browseDeleteSavedSearch(id) {
  state.browseSavedSearches = browseSavedSearches().filter(search => search.id !== id);
  saveState();
  renderBrowseSavedSearches();
}

function renderBrowseSavedSearches() {
  const root = document.getElementById('br-saved-searches');
  if (!root) return;
  const saved = browseSavedSearches();
  if (!saved.length) {
    root.hidden = true;
    root.innerHTML = '';
    return;
  }
  const current = browseCurrentSearch();
  root.hidden = false;
  root.innerHTML = `
    <span>Saved searches</span>
    <div>
      ${saved.map(search => {
        const active = current.dept === search.dept && current.genEd === search.genEd && current.search === search.search;
        const detail = [search.dept === BROWSE_PROFILE_DEPTS_VALUE ? 'Profile departments' : search.dept, search.genEd === BROWSE_ALL_GENEDS_VALUE ? 'All Gen-Eds' : search.genEd, search.search].filter(Boolean).join(' · ');
        return `
          <span class="browse-saved-item">
            <button type="button" class="browse-saved-chip ${active ? 'active' : ''}" data-br-saved="${browseEscape(search.id)}">
              <strong>${browseEscape(search.label)}</strong>
              ${detail && detail !== search.label ? `<small>${browseEscape(detail)}</small>` : ''}
            </button>
            <button type="button" class="browse-saved-remove" data-br-remove-saved="${browseEscape(search.id)}" title="Remove saved search" aria-label="Remove ${browseEscape(search.label)}">x</button>
          </span>
        `;
      }).join('')}
    </div>
  `;
  root.querySelectorAll('[data-br-saved]').forEach(btn => {
    btn.addEventListener('click', () => browseApplySavedSearch(btn.dataset.brSaved || ''));
  });
  root.querySelectorAll('[data-br-remove-saved]').forEach(btn => {
    btn.addEventListener('click', (event) => {
      event.stopPropagation();
      browseDeleteSavedSearch(btn.dataset.brRemoveSaved || '');
    });
  });
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

function browseMergeCourseRows(lists) {
  const byCode = new Map();
  (lists || []).flat().forEach(row => {
    const key = normalizeCode(row?.course_id || '');
    if (!key) return;
    const existing = byCode.get(key) || {};
    byCode.set(key, { ...existing, ...row });
  });
  return Array.from(byCode.values());
}

function browseGenEdGapTags() {
  if (typeof recoGenEdGaps !== 'function') return new Set();
  const tags = [];
  (recoGenEdGaps() || []).forEach(gap => {
    if (gap.id === 'DIVERSITY-2') {
      tags.push('DVUP', 'DVCC');
    } else if (gap.id) {
      tags.push(String(gap.id).toUpperCase());
    }
  });
  return new Set(tags);
}

function browseCourseGenEdTags(row) {
  return ((row?.gen_ed && row.gen_ed.flat()) || [])
    .map(tag => String(tag || '').toUpperCase())
    .filter(Boolean);
}

async function browseListCoursesForCurrentScope() {
  const allGenEds = browseGenEd === BROWSE_ALL_GENEDS_VALUE;
  const scope = browseDepartmentScope();
  if (browseIsProfileDeptMode()) {
    if (!scope.depts.length) return [];
    if (allGenEds) {
      const lists = await Promise.all(scope.depts.map(dept => browseListCoursesByGenEdTags(BROWSE_GENED_TAGS, { dept }).catch(() => [])));
      return browseMergeCourseRows(lists);
    }
    if (browseGenEd) {
      const lists = await Promise.all(scope.depts.map(dept => browseListCoursesByGenEdWithFallback(browseGenEd, dept).catch(() => [])));
      return browseMergeCourseRows(lists);
    }
    const lists = await Promise.all(scope.depts.map(dept => umdioListCoursesByDept(dept).catch(() => [])));
    return browseMergeCourseRows(lists);
  }
  if (allGenEds && !browseDept) return browseListCoursesByGenEdTags(BROWSE_GENED_TAGS).catch(() => []);
  return browseGenEd && !allGenEds
    ? browseListCoursesByGenEdWithFallback(browseGenEd, browseDept || '').catch(() => [])
    : umdioListCoursesByDept(browseDept).catch(() => []);
}

async function renderBrowse() {
  const view = document.getElementById('view-browse');
  if (!view) return;
  // Ensure department dropdown is populated once
  const sel = document.getElementById('br-dept');
  if (sel && sel.options.length <= 1) {
    sel.innerHTML = '<option value="">Pick a department…</option>';
    const profileOption = document.createElement('option');
    profileOption.value = BROWSE_PROFILE_DEPTS_VALUE;
    profileOption.textContent = 'Profile departments';
    sel.appendChild(profileOption);
    COMMON_DEPTS.forEach(d => {
      const o = document.createElement('option');
      o.value = d; o.textContent = d;
      sel.appendChild(o);
    });
  }
  applyBrowseProfileDefaults();
  syncBrowseControls();
  renderBrowseProfileHints();
  renderBrowseSavedSearches();

  const grid = document.getElementById('br-grid');
  if (!browseDept && !browseGenEd) {
    grid.innerHTML = '<p class="reco-empty">Pick a department, choose a Gen-Ed tag, or set interests in Settings so TerpTrack can start with your profile departments.</p>';
    return;
  }
  const scope = browseDepartmentScope();
  if (browseIsProfileDeptMode() && !scope.depts.length) {
    grid.innerHTML = '<p class="reco-empty">Set interests or preferred Gen-Ed departments in Settings to use profile department search.</p>';
    return;
  }

  const desiredCacheKey = `${browseDept || 'ALL'}:${browseGenEd || 'ANY'}:${browseIsProfileDeptMode() ? scope.depts.join(',') : ''}`;
  if (browseCacheKey !== desiredCacheKey) {
    browseCache = [];
    browseCacheKey = desiredCacheKey;
  }
  if (!browseCache.length) {
    const allGenEds = browseGenEd === BROWSE_ALL_GENEDS_VALUE;
    const scopeLabel = browseIsProfileDeptMode()
      ? scope.label
      : allGenEds && !browseDept
      ? 'all Gen-Ed courses'
      : browseGenEd && !browseDept ? `all ${browseGenEd} courses` : `${browseDept} courses`;
    grid.innerHTML = `<p class="reco-empty">Loading ${scopeLabel}…</p>`;
    browseCache = await browseListCoursesForCurrentScope();
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
  const profilePrefs = typeof getProfilePrefs === 'function' ? getProfilePrefs() : null;
  const profileActive = !!(profilePrefs && ((profilePrefs.interests || []).length || profilePrefs.careerGoal || (profilePrefs.genEdDepts || []).length));
  const genEdGapTags = browseGenEdGapTags();
  rows = rows.slice().sort((a, b) => {
    const aGapHits = browseCourseGenEdTags(a).filter(tag => genEdGapTags.has(tag)).length;
    const bGapHits = browseCourseGenEdTags(b).filter(tag => genEdGapTags.has(tag)).length;
    if (aGapHits !== bGapHits) return bGapHits - aGapHits;
    const aMatch = typeof profileCourseMatch === 'function' ? profileCourseMatch({ code: a.course_id, title: a.name, description: a.description }, profilePrefs || undefined).score : 0;
    const bMatch = typeof profileCourseMatch === 'function' ? profileCourseMatch({ code: b.course_id, title: b.name, description: b.description }, profilePrefs || undefined).score : 0;
    if (aMatch !== bMatch) return bMatch - aMatch;
    return String(a.course_id || '').localeCompare(String(b.course_id || ''));
  });

  if (!rows.length) {
    grid.innerHTML = '<p class="reco-empty">No courses found. Try a different filter.</p>';
    return;
  }

  const planned = new Set(flatCourses().map(c => normalizeCode(c.code)));
  grid.innerHTML = rows.slice(0, 200).map(r => {
    const code = r.course_id || '';
    const inPlan = planned.has(normalizeCode(code));
    const ge = browseCourseGenEdTags(r);
    const gapHits = ge.filter(tag => genEdGapTags.has(tag));
    const cached = ptCacheGet(code) || {};
    const gpa = (typeof cached.average_gpa === 'number') ? cached.average_gpa.toFixed(2) : '';
    const profileMatch = typeof profileCourseMatch === 'function'
      ? profileCourseMatch({ code, title: r.name, description: r.description, gen_ed: r.gen_ed }, profilePrefs || undefined)
      : { score: 0, labels: [] };
    const profileTags = profileActive && profileMatch.score
      ? `<span class="reco-tag profile">Profile fit</span>${(profileMatch.labels || []).map(label => `<span class="reco-tag">${browseEscape(label)}</span>`).join('')}`
      : '';
    const gapTags = gapHits.length
      ? `<span class="reco-tag gap">Fills gap</span>${gapHits.map(tag => `<span class="reco-tag">${browseEscape(tag)}</span>`).join('')}`
      : '';
    const desc = r.description ? `${r.description.slice(0, 200)}${r.description.length > 200 ? '…' : ''}` : '';
    return `
      <div class="br-card ${inPlan ? 'in-plan' : ''}">
        <div class="br-head">
          <strong>${browseEscape(displayCode(code))}</strong>
          <span class="br-credits">${browseEscape(r.credits || '?')} cr</span>
        </div>
        <div class="br-title">${browseEscape(r.name || '')}</div>
        <div class="br-meta">
          ${ge.length ? ge.map(g => `<span class="reco-tag">${browseEscape(g)}</span>`).join('') : ''}
          ${gapTags}
          ${profileTags}
          ${gpa ? `<span class="br-gpa">GPA ${browseEscape(gpa)}</span>` : ''}
        </div>
        ${desc ? `<div class="br-desc">${browseEscape(desc)}</div>` : ''}
        <div class="br-actions">
          ${inPlan
            ? '<span class="br-pill">In your plan</span>'
            : `<button class="btn small" onclick="browseAddCourse('${browseEscape(code)}')">Add to plan</button>`}
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
    browseProfileDefaultsApplied = true;
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
    browseProfileDefaultsApplied = true;
    browseGenEd = e.target.value;
    browseCache = [];
    browseCacheKey = '';
    renderBrowse();
  });
  const save = document.getElementById('br-save-search');
  if (save) save.addEventListener('click', browseSaveCurrentSearch);
}
