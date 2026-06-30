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
let browseRenderSeq = 0;
let browseAvailabilityCache = {};
let browseWhyCode = '';
let browseWhyKey = '';
let browseSlotKey = '';
let browseImpactKey = '';

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

function browsePlannedCourseMap() {
  const planned = new Map();
  const semById = new Map((typeof getAllSemesters === 'function' ? getAllSemesters() : []).map(sem => [sem.id, sem]));
  (typeof flatCourses === 'function' ? flatCourses() : []).forEach(course => {
    const key = normalizeCode(course.code);
    if (!key) return;
    const sem = semById.get(course.semId) || null;
    planned.set(key, { course, sem, semName: sem?.name || course.semName || '' });
  });
  return planned;
}

function browseNextTermContext() {
  if (typeof recoSemesterContext === 'function') {
    const ctx = recoSemesterContext();
    return {
      semId: ctx.semId || '',
      semName: ctx.sem?.name || '',
      term: ctx.term || '',
      termLabel: ctx.termLabel || ctx.term || '',
    };
  }
  const sems = typeof getAllSemesters === 'function' ? getAllSemesters() : [];
  const sem = sems.find(item => {
    if (typeof scheduleCoursesForSemester !== 'function') return false;
    return scheduleCoursesForSemester(item.id).length;
  }) || sems[0] || null;
  const semId = sem?.id || '';
  const term = sem
    ? ((state.schedulePrefs || {})[sem.id]?.term || (typeof scheduleInferTermCode === 'function' ? scheduleInferTermCode(sem) : ''))
    : '';
  return {
    semId,
    semName: sem?.name || '',
    term,
    termLabel: term && typeof scheduleTermLabel === 'function' ? scheduleTermLabel(term) : term,
  };
}

function browseAvailabilityKey(term, code) {
  return `${String(term || '')}:${normalizeCode(code)}`;
}

function browseAvailabilityFor(code, term) {
  return browseAvailabilityCache[browseAvailabilityKey(term, code)] || null;
}

function browseDecorateRows(rows, opts = {}) {
  const profilePrefs = opts.profilePrefs !== undefined
    ? opts.profilePrefs
    : (typeof getProfilePrefs === 'function' ? getProfilePrefs() : null);
  const profileActive = opts.profileActive !== undefined
    ? opts.profileActive
    : !!(profilePrefs && ((profilePrefs.interests || []).length || profilePrefs.careerGoal || (profilePrefs.genEdDepts || []).length));
  const genEdGapTags = opts.genEdGapTags || browseGenEdGapTags();
  const planned = opts.plannedMap || browsePlannedCourseMap();
  const nextTerm = opts.nextTerm || browseNextTermContext();
  const availability = opts.availability || browseAvailabilityCache;

  return (rows || []).map(row => {
    const code = row.course_id || row.code || '';
    const norm = normalizeCode(code);
    const ge = browseCourseGenEdTags(row);
    const gapHits = ge.filter(tag => genEdGapTags.has(tag));
    const cached = typeof ptCacheGet === 'function' ? (ptCacheGet(code) || {}) : {};
    const gpa = (typeof row.average_gpa === 'number') ? row.average_gpa
      : (typeof cached.average_gpa === 'number') ? cached.average_gpa
        : null;
    const profileMatch = typeof profileCourseMatch === 'function'
      ? profileCourseMatch({ code, title: row.name, description: row.description, gen_ed: row.gen_ed }, profilePrefs || undefined)
      : { score: 0, labels: [] };
    const inPlan = planned.has(norm);
    const available = availability[browseAvailabilityKey(nextTerm.term, code)] || null;
    const sectionCount = Number(available?.sectionCount) || 0;
    const openSeats = Number(available?.openSeats) || 0;
    const score = (inPlan ? -420 : 40)
      + gapHits.length * 175
      + (profileActive ? (profileMatch.score || 0) : 0)
      + (sectionCount ? 90 + Math.min(140, sectionCount * 12 + openSeats * 3) : 0)
      + (gpa ? Math.round(gpa * 10) : 0);
    return {
      row,
      code,
      norm,
      genEdTags: ge,
      gapHits,
      profileMatch,
      profileActive,
      inPlan,
      plannedInfo: planned.get(norm) || null,
      gpa,
      availability: available,
      score,
    };
  });
}

function browseCompareRows(a, b) {
  if (a.score !== b.score) return b.score - a.score;
  if (a.gapHits.length !== b.gapHits.length) return b.gapHits.length - a.gapHits.length;
  const aProfile = a.profileMatch?.score || 0;
  const bProfile = b.profileMatch?.score || 0;
  if (aProfile !== bProfile) return bProfile - aProfile;
  return String(a.code || '').localeCompare(String(b.code || ''));
}

function browseUniqueHighlights(items, limit = 4) {
  const seen = new Set();
  const out = [];
  (items || []).forEach(item => {
    if (!item || seen.has(item.norm)) return;
    seen.add(item.norm);
    out.push(item);
  });
  return out.slice(0, limit);
}

function browseTopAvailabilityCandidates(items, limit = 12) {
  return browseUniqueHighlights(
    (items || []).filter(item => !item.inPlan && /^[A-Z]{3,4}\d{3}[A-Z]?$/.test(item.norm)),
    limit,
  );
}

function browseBuildResultSections(items, nextTerm = browseNextTermContext()) {
  const available = browseUniqueHighlights(
    items.filter(item => !item.inPlan && (item.availability?.sectionCount || 0) > 0)
      .sort((a, b) => (b.availability.openSeats || 0) - (a.availability.openSeats || 0) || browseCompareRows(a, b)),
  );
  const gapFillers = browseUniqueHighlights(items.filter(item => !item.inPlan && item.gapHits.length));
  const best = browseUniqueHighlights(items.filter(item => !item.inPlan && (
    item.gapHits.length || (item.profileMatch?.score || 0) || (item.availability?.sectionCount || 0)
  )));
  const fallbackBest = best.length ? best : browseUniqueHighlights(items.filter(item => !item.inPlan));
  const availabilityCandidates = nextTerm.term ? browseTopAvailabilityCandidates(items, 12) : [];
  const pendingAvailability = nextTerm.term && !available.length && availabilityCandidates.some(item => !item.availability)
    ? availabilityCandidates.filter(item => !item.availability).slice(0, 3)
    : [];
  const checkedAvailability = nextTerm.term && !available.length && availabilityCandidates.length && availabilityCandidates.every(item => item.availability);
  return [
    fallbackBest.length ? {
      id: 'best',
      title: 'Best for your plan',
      detail: 'Ranked by profile fit, GenEd gaps, GPA signals, and current plan status.',
      items: fallbackBest,
    } : null,
    gapFillers.length ? {
      id: 'gaps',
      title: 'Fills missing GenEds',
      detail: 'Courses that cover tracked GenEd requirements still missing from your plan.',
      items: gapFillers,
    } : null,
    available.length ? {
      id: 'available',
      title: `Available in ${nextTerm.termLabel || 'next term'}`,
      detail: 'Posted sections found for the schedule term TerpTrack would use next.',
      items: available,
    } : pendingAvailability.length ? {
      id: 'available',
      title: `Checking ${nextTerm.termLabel || 'next term'} sections`,
      detail: 'TerpTrack is checking posted UMD sections for top matches.',
      items: pendingAvailability,
      pending: true,
    } : checkedAvailability ? {
      id: 'available',
      title: `No posted ${nextTerm.termLabel || 'next term'} sections yet`,
      detail: 'Top matches are still useful for planning, but UMD has no posted sections for them in this term.',
      items: availabilityCandidates.slice(0, 3),
    } : null,
  ].filter(Boolean);
}

function browseScoreBreakdown(item) {
  const pieces = [];
  if (item.inPlan) {
    pieces.push('already planned (-420)');
  } else {
    pieces.push('catalog match (+40)');
  }
  if ((item.gapHits || []).length) pieces.push(`${item.gapHits.length} GenEd gap${item.gapHits.length === 1 ? '' : 's'} (+${item.gapHits.length * 175})`);
  const profileScore = Number(item.profileMatch?.score) || 0;
  if (item.profileActive && profileScore) pieces.push(`profile fit (+${Math.round(profileScore)})`);
  const sectionCount = Number(item.availability?.sectionCount) || 0;
  if (sectionCount) {
    const openSeats = Number(item.availability?.openSeats) || 0;
    pieces.push(`posted sections (+${90 + Math.min(140, sectionCount * 12 + openSeats * 3)})`);
  }
  if (typeof item.gpa === 'number') pieces.push(`GPA signal (+${Math.round(item.gpa * 10)})`);
  return pieces.join(' · ');
}

function browsePrereqText(row) {
  const rel = row?.relationships || {};
  const candidates = [
    rel.prereqs,
    rel.prerequisites,
    row?.prereqs,
    row?.prereqGroups,
    row?.prerequisites,
    row?.prereq,
  ];
  const value = candidates.find(item => {
    if (!item) return false;
    return Array.isArray(item) ? item.flat(2).filter(Boolean).length : String(item).trim();
  });
  if (!value) return '';
  if (Array.isArray(value)) return value.flat(2).filter(Boolean).join('; ');
  return String(value).trim();
}

function browsePrereqCodes(text) {
  const raw = typeof extractCourseCodes === 'function'
    ? extractCourseCodes(text)
    : Array.from(String(text || '').matchAll(/\b([A-Z]{3,4})\s*(\d{3}[A-Z]?)\b/g)).map(match => `${match[1]}${match[2]}`);
  return Array.from(new Set(raw.map(code => displayCode(code)))).slice(0, 5);
}

function browseExplanationItems(item, nextTerm = browseNextTermContext()) {
  const row = item.row || item;
  const ge = item.genEdTags || browseCourseGenEdTags(row);
  const gapHits = item.gapHits || [];
  const profileScore = Number(item.profileMatch?.score) || 0;
  const profileLabels = item.profileMatch?.labels || [];
  const available = item.availability || null;
  const sectionCount = Number(available?.sectionCount) || 0;
  const openSeats = Number(available?.openSeats) || 0;
  const prereqText = browsePrereqText(row);
  const prereqCodes = browsePrereqCodes(prereqText);
  const items = [{
    title: 'Ranking',
    detail: browseScoreBreakdown(item),
  }];

  if (item.inPlan) {
    items.push({
      title: 'Plan status',
      detail: `Already in your plan${item.plannedInfo?.semName ? ` for ${item.plannedInfo.semName}` : ''}, so Browse keeps it below new options.`,
    });
  }
  if (gapHits.length) {
    items.push({
      title: 'GenEd gap',
      detail: `Covers ${gapHits.join(', ')} still missing from the tracked GenEd requirements in your plan.`,
    });
  } else if (ge.length) {
    items.push({
      title: 'GenEd coverage',
      detail: `Carries ${ge.join(', ')} tags, but none are currently marked as missing gaps.`,
    });
  }
  if (item.profileActive && profileScore) {
    items.push({
      title: 'Profile fit',
      detail: `Matches ${profileLabels.length ? profileLabels.join(', ') : 'your saved interests and career goal'}.`,
    });
  } else if (item.profileActive) {
    items.push({
      title: 'Profile fit',
      detail: 'No strong profile keyword, department, or career-goal match was found for this card.',
    });
  } else {
    items.push({
      title: 'Profile fit',
      detail: 'No active profile preferences are set, so profile fit is neutral for this card.',
    });
  }
  if (available) {
    items.push({
      title: 'Sections',
      detail: sectionCount
        ? `${sectionCount} posted section${sectionCount === 1 ? '' : 's'}${openSeats ? ` with ${openSeats} open seat${openSeats === 1 ? '' : 's'}` : ''} for ${available.termLabel || nextTerm.termLabel || 'the checked term'}.`
        : `Checked ${available.termLabel || nextTerm.termLabel || 'the selected term'}; no posted sections were found yet.`,
    });
  } else if (nextTerm.term) {
    items.push({
      title: 'Sections',
      detail: `Section availability has not been checked yet for ${nextTerm.termLabel || nextTerm.term}; top matches are checked automatically.`,
    });
  }
  items.push({
    title: 'Prereqs',
    detail: prereqText
      ? `Catalog prerequisite text mentions ${prereqCodes.length ? prereqCodes.join(', ') : 'requirements to review'}; adding the course fetches full metadata before scheduling.`
      : 'This catalog result did not include prerequisite text; adding the course fetches full metadata before scheduling.',
  });
  if (typeof item.gpa === 'number') {
    items.push({
      title: 'GPA signal',
      detail: `Average GPA ${item.gpa.toFixed(2)} is used as a light planning signal, not a requirement.`,
    });
  }
  return items;
}

function browseExplanationHtml(item, nextTerm = browseNextTermContext(), panelId = '') {
  const id = panelId || `browse-why-${item.norm || normalizeCode(item.code || '')}`;
  const score = Math.round(Number(item.score) || 0);
  const items = browseExplanationItems(item, nextTerm);
  return `
    <div class="browse-why-panel" id="${browseEscape(id)}" role="region" aria-label="Why ${browseEscape(displayCode(item.code || 'this course'))}">
      <div class="browse-why-head">
        <strong>Why this course</strong>
        <span>Rank score ${browseEscape(score)}</span>
      </div>
      <div class="browse-why-list">
        ${items.map(reason => `
          <div class="browse-why-item">
            <strong>${browseEscape(reason.title)}</strong>
            <span>${browseEscape(reason.detail)}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function browseToggleWhy(code, key = '') {
  const norm = normalizeCode(code);
  if (!norm) return;
  const scopedKey = String(key || '');
  if (scopedKey) {
    const isOpen = browseWhyKey === scopedKey;
    browseWhyCode = isOpen ? '' : norm;
    browseWhyKey = isOpen ? '' : scopedKey;
  } else {
    const isOpen = !browseWhyKey && browseWhyCode === norm;
    browseWhyCode = isOpen ? '' : norm;
    browseWhyKey = '';
  }
  if (browseWhyCode) browseSlotKey = '';
  if (browseWhyCode) browseImpactKey = '';
  if (typeof renderBrowse === 'function') renderBrowse();
}

function browseAvailabilityTag(item) {
  const available = item.availability;
  if (!available) return '';
  if ((available.sectionCount || 0) > 0) {
    const seats = available.openSeats ? ` · ${available.openSeats} open` : '';
    return `<span class="reco-tag live">${browseEscape(available.sectionCount)} posted${browseEscape(seats)}</span>`;
  }
  return '';
}

function browseReplacementTarget() {
  return (typeof placeholderSearchTarget !== 'undefined' && placeholderSearchTarget) ? placeholderSearchTarget : null;
}

function browseReplacementTargetLabel(target = browseReplacementTarget()) {
  return target ? String(target.code || 'placeholder') : '';
}

function browseReplacementBannerHtml() {
  const target = browseReplacementTarget();
  if (!target) return '';
  const tags = typeof inferPlaceholderTags === 'function' ? inferPlaceholderTags(target) : [];
  return `
    <div class="browse-replace-banner">
      <div>
        <strong>Replacing ${browseEscape(browseReplacementTargetLabel(target))}</strong>
        <span>${browseEscape([target.title || 'Placeholder slot', target.semId ? `Semester ${target.semId}` : '', tags.length ? tags.join(' + ') : ''].filter(Boolean).join(' · '))}</span>
      </div>
      <button class="btn small" type="button" onclick="browseClearReplacementTarget()">Clear target</button>
    </div>
  `;
}

function browseClearReplacementTarget() {
  if (typeof placeholderSearchTarget !== 'undefined') placeholderSearchTarget = null;
  if (typeof renderBrowse === 'function') renderBrowse();
  if (typeof toastInfo === 'function') toastInfo('Browse replacement target cleared.');
}

function browseIsCatalogCourseCode(code) {
  return /^[A-Z]{3,4}\s*\d{3}[A-Z]?$/i.test(String(code || '').trim());
}

function browseIsSlotPlaceholder(course) {
  if (!course || browseIsCatalogCourseCode(course.code)) return false;
  const categories = Array.isArray(course.categories) ? course.categories : [];
  const hay = [course.code, course.title, course.note, course.category, ...categories].join(' ').toUpperCase();
  return /^GENED\s/i.test(course.code || '')
    || /^FREE ELECTIVE/i.test(course.code || '')
    || hay.includes('PLACEHOLDER')
    || hay.includes('AUTO-GENERATED')
    || String(course.category || '').startsWith('gened-');
}

function browseSlotPlaceholderTags(course) {
  if (typeof inferPlaceholderTags === 'function') return inferPlaceholderTags(course);
  const tags = new Set();
  if (String(course?.category || '').startsWith('gened-')) tags.add(String(course.category).replace('gened-', '').toUpperCase());
  (Array.isArray(course?.categories) ? course.categories : [])
    .filter(cat => String(cat || '').startsWith('gened-'))
    .forEach(cat => tags.add(String(cat).replace('gened-', '').toUpperCase()));
  const hay = [course?.code, course?.title, course?.note].join(' ').toUpperCase();
  BROWSE_GENED_TAGS.forEach(tag => { if (hay.includes(tag)) tags.add(tag); });
  return Array.from(tags).filter(tag => BROWSE_GENED_TAGS.includes(tag));
}

function browseSlotStableKey(semId, index, code, custom = false) {
  const raw = `${custom ? 'custom' : 'sem'}-${semId || 'none'}-${index}-${normalizeCode(code)}`;
  return raw.replace(/[^A-Za-z0-9_-]/g, '-');
}

function browsePlaceholderSlots() {
  const slots = [];
  const sems = typeof getAllSemesters === 'function' ? getAllSemesters() : [];
  sems.forEach((sem, semIndex) => {
    (sem.courses || []).forEach((course, courseIndex) => {
      if (!browseIsSlotPlaceholder(course)) return;
      const semId = sem.id || `sem-${semIndex}`;
      slots.push({
        key: browseSlotStableKey(semId, courseIndex, course.code),
        course: { ...course, semId, _browseSlotIndex: courseIndex },
        semId,
        semName: sem.name || semId,
        index: courseIndex,
        tags: browseSlotPlaceholderTags(course),
        custom: false,
      });
    });
  });
  (state.customCourses || []).forEach((course, index) => {
    if (!browseIsSlotPlaceholder(course)) return;
    slots.push({
      key: browseSlotStableKey(course.semId || 'custom', index, course.code, true),
      course: { ...course, _browseCustomSlotIndex: index },
      semId: course.semId || '',
      semName: course.semName || 'Custom courses',
      index,
      tags: browseSlotPlaceholderTags(course),
      custom: true,
    });
  });
  return slots;
}

function browseSlotMatchDetail(item, slot) {
  const courseTags = item.genEdTags || browseCourseGenEdTags(item.row || item);
  const courseTagSet = new Set(courseTags);
  const slotTags = slot.tags || [];
  if (slotTags.length) {
    const hits = slotTags.filter(tag => courseTagSet.has(tag));
    if (!hits.length) return null;
    return {
      score: 300 + hits.length * 40,
      label: `${hits.join(' + ')} match`,
      matchedTags: hits,
    };
  }
  if (/^FREE ELECTIVE/i.test(slot.course.code || '') || String(slot.course.category || '') === 'elective') {
    return {
      score: 60,
      label: 'Open elective slot',
      matchedTags: [],
    };
  }
  return null;
}

function browseSlotCandidatesFor(item, limit = 5) {
  if (!item || item.inPlan || browseReplacementTarget() || typeof replacePlaceholderWithCourse !== 'function') return [];
  const duplicate = (typeof flatCourses === 'function' ? flatCourses() : [])
    .some(course => normalizeCode(course.code) === item.norm && browseIsCatalogCourseCode(course.code));
  if (duplicate) return [];
  return browsePlaceholderSlots()
    .map(slot => {
      const match = browseSlotMatchDetail(item, slot);
      return match ? { ...slot, ...match } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || String(a.semName).localeCompare(String(b.semName)) || a.index - b.index)
    .slice(0, limit);
}

function browseToggleSlotPicker(code, key = '') {
  const norm = normalizeCode(code);
  if (!norm) return;
  const scopedKey = String(key || norm);
  browseSlotKey = browseSlotKey === scopedKey ? '' : scopedKey;
  if (browseSlotKey) {
    browseWhyCode = '';
    browseWhyKey = '';
    browseImpactKey = '';
  }
  if (typeof renderBrowse === 'function') renderBrowse();
}

function browseSlotPickerHtml(item, slots, panelId) {
  if (!slots.length) return '';
  const code = item.code || item.row?.course_id || '';
  return `
    <div class="browse-slot-panel" id="${browseEscape(panelId)}" role="region" aria-label="Choose placeholder slot for ${browseEscape(displayCode(code))}">
      <div class="browse-slot-head">
        <strong>Choose a slot</strong>
        <span>Replace a planned placeholder with ${browseEscape(displayCode(code))}</span>
      </div>
      <div class="browse-slot-list">
        ${slots.map(slot => `
          <button class="browse-slot-option" type="button" onclick="browseReplaceIntoSlot('${browseEscape(normalizeCode(code))}', '${browseEscape(slot.key)}')">
            <strong>${browseEscape(slot.course.code || 'Placeholder')}</strong>
            <span>${browseEscape([slot.semName, slot.label, slot.course.title || ''].filter(Boolean).join(' · '))}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

async function browseReplaceIntoSlot(code, slotKey) {
  if (typeof placeholderSearchTarget === 'undefined' || typeof replacePlaceholderWithCourse !== 'function') {
    toastError('Placeholder replacement is still loading.');
    return;
  }
  const slot = browsePlaceholderSlots().find(item => item.key === slotKey);
  if (!slot) {
    toastError('That placeholder slot is no longer available.');
    browseSlotKey = '';
    if (typeof renderBrowse === 'function') renderBrowse();
    return;
  }
  placeholderSearchTarget = { ...slot.course, semId: slot.semId };
  placeholderSearchSelectedTags = slot.tags.slice();
  placeholderSearchMode = slot.tags.length ? 'all' : 'any';
  browseSlotKey = '';
  await browseReplacePlaceholder(code);
}

function browseToggleImpact(code, key = '') {
  const norm = normalizeCode(code);
  if (!norm) return;
  const scopedKey = String(key || norm);
  browseImpactKey = browseImpactKey === scopedKey ? '' : scopedKey;
  if (browseImpactKey) {
    browseWhyCode = '';
    browseWhyKey = '';
    browseSlotKey = '';
  }
  if (typeof renderBrowse === 'function') renderBrowse();
}

function browseRowToReplacementCourse(row) {
  if (!row) return null;
  if (row._full) return row._full;
  if (typeof candidateToCourse === 'function') return candidateToCourse(row);
  const tags = browseCourseGenEdTags(row);
  const category = tags.length ? `gened-${tags[0].toLowerCase()}` : 'major-core';
  return {
    code: displayCode(row.course_id || ''),
    title: row.name || displayCode(row.course_id || ''),
    cr: parseInt(row.credits || '3', 10) || 3,
    kind: category.startsWith('gened') ? 'gened' : 'core',
    category,
    categories: tags.map(tag => `gened-${tag.toLowerCase()}`),
    gen_ed: row.gen_ed || tags.map(tag => [tag]),
    prereqs: [],
    coreqs: [],
    description: row.description || '',
  };
}

function browseCourseFromItem(item) {
  const row = item.row || item;
  return browseRowToReplacementCourse(row) || {
    code: displayCode(item.code || row.course_id || ''),
    title: row.name || '',
    cr: parseInt(row.credits || '3', 10) || 3,
    gen_ed: row.gen_ed || [],
    categories: (item.genEdTags || browseCourseGenEdTags(row)).map(tag => `gened-${tag.toLowerCase()}`),
  };
}

function browseSemesterCreditLoad(semId) {
  const sem = (typeof getAllSemesters === 'function' ? getAllSemesters() : []).find(item => item.id === semId);
  if (!sem) return 0;
  return [
    ...(sem.courses || []),
    ...(state.customCourses || []).filter(course => course.semId === sem.id),
  ].reduce((sum, course) => sum + (Number(course.cr) || 0), 0);
}

function browseImpactSemesterContext(item, opts = {}) {
  const course = browseCourseFromItem(item);
  const replacement = browseReplacementTarget();
  const slots = opts.slotCandidates || browseSlotCandidatesFor(item, 1);
  const slot = replacement ? null : slots[0] || null;
  const nextTerm = opts.nextTerm || browseNextTermContext();
  const sems = typeof getAllSemesters === 'function' ? getAllSemesters() : [];
  const semId = replacement?.semId || slot?.semId || nextTerm.semId || (typeof scheduleDefaultSemesterId === 'function' ? scheduleDefaultSemesterId() : '');
  const sem = sems.find(item => item.id === semId) || sems[0] || null;
  const target = replacement || slot?.course || null;
  const currentCredits = sem ? browseSemesterCreditLoad(sem.id) : 0;
  const courseCredits = Number(course.cr) || 0;
  const removedCredits = target ? (Number(target.cr) || 0) : 0;
  const afterCredits = Math.max(0, currentCredits - removedCredits + courseCredits);
  const term = sem
    ? ((state.schedulePrefs || {})[sem.id]?.term || (typeof scheduleInferTermCode === 'function' ? scheduleInferTermCode(sem) : ''))
    : nextTerm.term;
  const termLabel = term && typeof scheduleTermLabel === 'function' ? scheduleTermLabel(term) : (nextTerm.termLabel || term || '');
  return {
    mode: replacement ? 'active-replacement' : slot ? 'slot' : 'add',
    course,
    sem,
    semId: sem?.id || '',
    semName: sem?.name || nextTerm.semName || 'next planned term',
    term,
    termLabel,
    target,
    slot,
    currentCredits,
    courseCredits,
    removedCredits,
    afterCredits,
  };
}

function browseCodeIsPassedForImpact(code) {
  if (typeof getCourseState !== 'function') return false;
  const display = displayCode(code);
  const norm = normalizeCode(code);
  const states = [getCourseState(display), getCourseState(norm), getCourseState(code)];
  return states.some(state => state.status === 'passed' || state.status === 'transfer');
}

function browsePrereqImpactDetail(row) {
  const prereqText = browsePrereqText(row);
  if (!prereqText) return {
    level: 'info',
    detail: 'Full prerequisite metadata is checked when you add the course.',
  };
  const groups = typeof parsePrereqGroups === 'function' ? parsePrereqGroups(prereqText) : [];
  if (!groups.length) {
    const codes = browsePrereqCodes(prereqText);
    return {
      level: codes.length ? 'warn' : 'info',
      detail: codes.length
        ? `Catalog text mentions ${codes.join(', ')}; review before registration.`
        : 'Catalog prerequisite text is available; review details before registration.',
    };
  }
  const missing = groups.filter(group => !group.some(browseCodeIsPassedForImpact));
  if (!missing.length) return {
    level: 'ok',
    detail: 'Known prerequisite groups appear satisfied by passed or transfer coursework.',
  };
  return {
    level: 'warn',
    detail: `Potentially missing ${missing.map(group => group.join(' or ')).join('; ')}.`,
  };
}

function browseImpactItems(item, opts = {}) {
  const row = item.row || item;
  const context = browseImpactSemesterContext(item, opts);
  const ge = item.genEdTags || browseCourseGenEdTags(row);
  const gapHits = item.gapHits || [];
  const duplicate = (typeof flatCourses === 'function' ? flatCourses() : [])
    .some(course => normalizeCode(course.code) === item.norm && browseIsCatalogCourseCode(course.code));
  const loadLevel = context.afterCredits > 18 ? 'warn' : context.afterCredits >= 15 ? 'info' : 'ok';
  const targetText = context.target
    ? `Replacing ${context.target.code || 'placeholder'} in ${context.semName}`
    : `Adding to ${context.semName}`;
  const loadDetail = context.target
    ? `${targetText}: ${context.currentCredits} -> ${context.afterCredits} credits.`
    : `${targetText}: ${context.currentCredits} -> ${context.afterCredits} credits.`;
  const availability = item.availability || null;
  const prereq = browsePrereqImpactDetail(row);
  const items = [{
    title: 'Term load',
    level: loadLevel,
    detail: `${loadDetail}${context.termLabel ? ` Planned UMD term: ${context.termLabel}.` : ''}`,
  }, {
    title: 'Duplicate check',
    level: duplicate ? 'warn' : 'ok',
    detail: duplicate ? `${displayCode(item.code)} is already in your plan.` : 'No existing planned copy found.',
  }];
  if (gapHits.length) {
    items.push({
      title: 'GenEd impact',
      level: 'ok',
      detail: `Covers current gap${gapHits.length === 1 ? '' : 's'}: ${gapHits.join(' + ')}.`,
    });
  } else if (ge.length) {
    items.push({
      title: 'GenEd impact',
      level: 'info',
      detail: `Adds ${ge.join(' + ')} coverage; not currently one of the highest-priority gaps.`,
    });
  } else {
    items.push({
      title: 'GenEd impact',
      level: 'info',
      detail: 'No GenEd tags are attached to this catalog result.',
    });
  }
  items.push({
    title: 'Prereqs',
    level: prereq.level,
    detail: prereq.detail,
  });
  if (availability) {
    const count = Number(availability.sectionCount) || 0;
    const open = Number(availability.openSeats) || 0;
    items.push({
      title: 'Sections',
      level: count ? 'ok' : 'warn',
      detail: count
        ? `${count} posted section${count === 1 ? '' : 's'}${open ? ` with ${open} open seat${open === 1 ? '' : 's'}` : ''} for ${availability.termLabel || context.termLabel || 'the checked term'}.`
        : `No posted sections found yet for ${availability.termLabel || context.termLabel || 'the checked term'}.`,
    });
  } else {
    items.push({
      title: 'Sections',
      level: context.term ? 'info' : 'warn',
      detail: context.term
        ? `Section availability has not been checked yet for ${context.termLabel || context.term}.`
        : 'No schedule term is available for live section checking yet.',
    });
  }
  return { context, items };
}

function browseImpactHtml(item, opts = {}, panelId = '') {
  const { context, items } = browseImpactItems(item, opts);
  const id = panelId || `browse-impact-${item.norm || normalizeCode(item.code || '')}`;
  const modeText = context.mode === 'add' ? 'Add preview' : context.mode === 'slot' ? 'Best slot preview' : 'Replacement preview';
  return `
    <div class="browse-impact-panel" id="${browseEscape(id)}" role="region" aria-label="Schedule impact for ${browseEscape(displayCode(item.code || 'this course'))}">
      <div class="browse-impact-head">
        <strong>Schedule impact</strong>
        <span>${browseEscape(modeText)}</span>
      </div>
      <div class="browse-impact-list">
        ${items.map(impact => `
          <div class="browse-impact-item ${browseEscape(impact.level || 'info')}">
            <strong>${browseEscape(impact.title)}</strong>
            <span>${browseEscape(impact.detail)}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function browseFindCachedRow(code) {
  const norm = normalizeCode(code);
  return (browseCache || []).find(row => normalizeCode(row?.course_id || row?.code || '') === norm) || null;
}

async function browseReplacePlaceholder(code) {
  const target = browseReplacementTarget();
  if (!target || typeof replacePlaceholderWithCourse !== 'function') {
    toastError('Open a placeholder first, then choose a Browse result.');
    return;
  }
  const row = browseFindCachedRow(code);
  const prefetched = browseRowToReplacementCourse(row);
  await replacePlaceholderWithCourse(code, prefetched);
  browseCache = [];
  browseCacheKey = '';
  if (currentTab === 'browse') renderBrowse();
}

function browseCourseCardHtml(item, opts = {}) {
  const r = item.row || item;
  const code = item.code || r.course_id || '';
  const actionCode = normalizeCode(code);
  const inPlan = !!item.inPlan;
  const replacementTarget = browseReplacementTarget();
  const canReplace = !!replacementTarget && !inPlan && typeof replacePlaceholderWithCourse === 'function';
  const ge = item.genEdTags || browseCourseGenEdTags(r);
  const gapHits = item.gapHits || [];
  const gpa = typeof item.gpa === 'number' ? item.gpa.toFixed(2) : '';
  const profileTags = item.profileActive && item.profileMatch && item.profileMatch.score
    ? `<span class="reco-tag profile">Profile fit</span>${(item.profileMatch.labels || []).map(label => `<span class="reco-tag">${browseEscape(label)}</span>`).join('')}`
    : '';
  const gapTags = gapHits.length
    ? `<span class="reco-tag gap">Fills gap</span>${gapHits.map(tag => `<span class="reco-tag">${browseEscape(tag)}</span>`).join('')}`
    : '';
  const availabilityTag = browseAvailabilityTag(item);
  const desc = r.description ? `${r.description.slice(0, opts.compact ? 130 : 200)}${r.description.length > (opts.compact ? 130 : 200) ? '...' : ''}` : '';
  const whyScope = String(opts.whyScope || 'browse').replace(/[^A-Za-z0-9_-]/g, '-');
  const whyKey = `${whyScope}:${item.norm || actionCode}`;
  const whyId = `browse-why-${whyKey.replace(/[^A-Za-z0-9_-]/g, '-')}`;
  const whyOpen = browseWhyKey ? browseWhyKey === whyKey : browseWhyCode === item.norm;
  const slotScopeKey = `${whyScope}:slot:${item.norm || actionCode}`;
  const slotId = `browse-slot-${slotScopeKey.replace(/[^A-Za-z0-9_-]/g, '-')}`;
  const slotCandidates = canReplace ? [] : browseSlotCandidatesFor(item);
  const slotOpen = browseSlotKey === slotScopeKey;
  const impactScopeKey = `${whyScope}:impact:${item.norm || actionCode}`;
  const impactId = `browse-impact-${impactScopeKey.replace(/[^A-Za-z0-9_-]/g, '-')}`;
  const canPreview = !inPlan;
  const impactOpen = browseImpactKey === impactScopeKey;
  return `
    <div class="br-card ${inPlan ? 'in-plan' : ''}${opts.compact ? ' compact' : ''}">
      <div class="br-head">
        <strong>${browseEscape(displayCode(code))}</strong>
        <span class="br-credits">${browseEscape(r.credits || '?')} cr</span>
      </div>
      <div class="br-title">${browseEscape(r.name || '')}</div>
      <div class="br-meta">
        ${ge.length ? ge.map(g => `<span class="reco-tag">${browseEscape(g)}</span>`).join('') : ''}
        ${gapTags}
        ${profileTags}
        ${availabilityTag}
        ${gpa ? `<span class="br-gpa">GPA ${browseEscape(gpa)}</span>` : ''}
      </div>
      ${desc ? `<div class="br-desc">${browseEscape(desc)}</div>` : ''}
      <div class="br-actions">
        ${inPlan
          ? `<span class="br-pill">In your plan${item.plannedInfo?.semName ? ` · ${browseEscape(item.plannedInfo.semName)}` : ''}</span>`
          : canReplace
            ? `<button class="btn small primary" onclick="browseReplacePlaceholder('${browseEscape(actionCode)}')">Replace ${browseEscape(browseReplacementTargetLabel(replacementTarget))}</button><button class="btn small" onclick="browseAddCourse('${browseEscape(actionCode)}')">Add separately</button>`
            : `<button class="btn small" onclick="browseAddCourse('${browseEscape(actionCode)}')">Add to plan</button>`}
        ${slotCandidates.length ? `<button class="btn small" type="button" aria-expanded="${slotOpen ? 'true' : 'false'}" aria-controls="${browseEscape(slotId)}" onclick="browseToggleSlotPicker('${browseEscape(actionCode)}', '${browseEscape(slotScopeKey)}')">${slotOpen ? 'Hide slots' : 'Choose slot'}</button>` : ''}
        ${canPreview ? `<button class="btn small" type="button" aria-expanded="${impactOpen ? 'true' : 'false'}" aria-controls="${browseEscape(impactId)}" onclick="browseToggleImpact('${browseEscape(actionCode)}', '${browseEscape(impactScopeKey)}')">${impactOpen ? 'Hide preview' : 'Preview'}</button>` : ''}
        <button class="btn small" type="button" aria-expanded="${whyOpen ? 'true' : 'false'}" aria-controls="${browseEscape(whyId)}" onclick="browseToggleWhy('${browseEscape(actionCode)}', '${browseEscape(whyKey)}')">${whyOpen ? 'Hide why' : 'Why'}</button>
      </div>
      ${slotOpen ? browseSlotPickerHtml(item, slotCandidates, slotId) : ''}
      ${impactOpen ? browseImpactHtml(item, { nextTerm: opts.nextTerm || browseNextTermContext(), slotCandidates }, impactId) : ''}
      ${whyOpen ? browseExplanationHtml(item, opts.nextTerm || browseNextTermContext(), whyId) : ''}
    </div>
  `;
}

function browseHighlightsHtml(sections, nextTerm = browseNextTermContext()) {
  if (!sections.length) return '';
  return `
    <div class="browse-highlights">
      <div class="browse-highlights-head">
        <strong>Browse highlights</strong>
        <span>Personalized from your plan, profile, GenEd gaps, and posted sections.</span>
      </div>
      <div class="browse-highlight-grid">
        ${sections.map(section => `
          <section class="browse-highlight-section ${section.pending ? 'pending' : ''}">
            <div class="browse-highlight-title">
              <strong>${browseEscape(section.title)}</strong>
              <span>${browseEscape(section.detail)}</span>
            </div>
            <div class="browse-highlight-cards">
              ${section.items.map(item => browseCourseCardHtml(item, { compact: true, nextTerm, whyScope: `highlight-${section.id}` })).join('')}
            </div>
          </section>
        `).join('')}
      </div>
    </div>
  `;
}

async function browseHydrateAvailability(items, nextTerm, seq) {
  if (!nextTerm.term || typeof umdioFetchSections !== 'function') return;
  const candidates = browseTopAvailabilityCandidates(items, 12)
    .filter(item => !browseAvailabilityFor(item.code, nextTerm.term));
  if (!candidates.length) return;
  const loaded = await Promise.all(candidates.map(async item => {
    const sections = await umdioFetchSections(item.code, nextTerm.term).catch(() => []);
    const openSeats = (sections || []).reduce((sum, section) => {
      const open = parseInt(section.open_seats, 10);
      return sum + (Number.isFinite(open) && open > 0 ? open : 0);
    }, 0);
    return {
      code: item.code,
      value: {
        term: nextTerm.term,
        termLabel: nextTerm.termLabel,
        sectionCount: sections.length,
        openSeats,
      },
    };
  }));
  loaded.forEach(item => {
    browseAvailabilityCache[browseAvailabilityKey(nextTerm.term, item.code)] = item.value;
  });
  if (seq === browseRenderSeq) renderBrowse();
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
  const seq = ++browseRenderSeq;
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
    if (seq !== browseRenderSeq) return;
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
  const nextTerm = browseNextTermContext();
  const decoratedRows = browseDecorateRows(rows, {
    profilePrefs,
    profileActive,
    nextTerm,
  }).sort(browseCompareRows);

  if (!decoratedRows.length) {
    grid.innerHTML = '<p class="reco-empty">No courses found. Try a different filter.</p>';
    return;
  }

  const sections = browseBuildResultSections(decoratedRows, nextTerm);
  grid.innerHTML = `
    ${browseReplacementBannerHtml()}
    ${browseHighlightsHtml(sections, nextTerm)}
    <div class="browse-results-head">
      <strong>Full results</strong>
      <span>${browseEscape(decoratedRows.length)} match${decoratedRows.length === 1 ? '' : 'es'} shown by plan fit</span>
    </div>
    ${decoratedRows.slice(0, 200).map(item => browseCourseCardHtml(item, { nextTerm, whyScope: 'full' })).join('')}
  `;
  browseHydrateAvailability(decoratedRows, nextTerm, seq);
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
