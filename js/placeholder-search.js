'use strict';
/* ============================================================
   PLACEHOLDER COURSE SEARCH / GEN-ED FITTER
   ============================================================ */

let placeholderSearchTarget = null;
let placeholderSearchResults = [];
let placeholderSearchSelectedTags = [];
let placeholderSearchMode = 'all';
let placeholderSearchRequestSeq = 0;
let placeholderSectionPreviewKey = '';
let placeholderSectionPreviewCache = {};

const PLACEHOLDER_ALL_DEPTS_VALUE = '__ALL_GENED_DEPTS__';
const PLACEHOLDER_PROFILE_DEPTS_VALUE = '__PROFILE_GENED_DEPTS__';
const PLACEHOLDER_DEFAULT_DEPTS = ['ENGL','COMM','HIST','GVPT','PSYC','SOCY','ANTH','PHIL','ARTH','THET','MUSC','RELS','WMST','AASP','AMST','GEOG','ECON'];
const PLACEHOLDER_GENED_TAGS = ['FSAW','FSPW','FSOC','FSMA','FSAR','DSHS','DSHU','DSNS','DSNL','DSSP','DVUP','DVCC','SCIS'];
const PLACEHOLDER_CORE_REQUIREMENTS = ['FSAW','FSPW','FSOC','FSMA','FSAR','DSHS','DSHU','DSNS','DSNL','DSSP','SCIS'];

function placeholderEscape(value) {
  return String(value ?? '').replace(/[&<>\"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '\"': '&quot;',
    "'": '&#39;',
  }[ch]));
}

function genEdLabel(tag) {
  const def = (typeof GENED_DEFS !== 'undefined' ? GENED_DEFS : []).find(d => d.id === tag);
  return def ? `${def.id} · ${def.name}` : tag;
}

function getGenEdNeed(tag) {
  const def = (typeof GENED_DEFS !== 'undefined' ? GENED_DEFS : []).find(d => d.id === tag);
  return def ? def.need : 1;
}

function courseGenEdTags(course) {
  const tags = new Set();
  if (!course) return [];
  if (Array.isArray(course.gen_ed)) course.gen_ed.flat().filter(Boolean).forEach(t => tags.add(String(t).toUpperCase()));
  if (Array.isArray(course.categories)) {
    course.categories
      .filter(cat => cat && String(cat).startsWith('gened-'))
      .forEach(cat => tags.add(String(cat).replace('gened-', '').toUpperCase()));
  }
  if (course.category && String(course.category).startsWith('gened-')) {
    tags.add(String(course.category).replace('gened-', '').toUpperCase());
  }
  const cached = (typeof umdioCacheGet === 'function') ? umdioCacheGet('course:' + normalizeCode(course.code)) : null;
  if (cached && Array.isArray(cached.gen_ed)) cached.gen_ed.flat().filter(Boolean).forEach(t => tags.add(String(t).toUpperCase()));
  return Array.from(tags).filter(t => PLACEHOLDER_GENED_TAGS.includes(t));
}

function inferPlaceholderTags(course) {
  const tags = new Set(courseGenEdTags(course));
  const hay = [course.code, course.title, course.note, course.category].join(' ').toUpperCase();
  PLACEHOLDER_GENED_TAGS.forEach(tag => { if (hay.includes(tag)) tags.add(tag); });
  if (hay.includes('HISTORY') || hay.includes('SOCIAL') || /\bHS\b/.test(hay)) tags.add('DSHS');
  if (hay.includes('HUMANITIES') || /\bHU\b/.test(hay)) tags.add('DSHU');
  if (hay.includes('SCHOLARSHIP') || hay.includes('SP-') || /\bSP\b/.test(hay)) tags.add('DSSP');
  if (hay.includes('I-SERIES') || hay.includes('I SERIES')) tags.add('SCIS');
  if (hay.includes('CULTURAL COMPETENCE')) tags.add('DVCC');
  if (hay.includes('PLURAL')) tags.add('DVUP');
  // UMD's second diversity course can be DVUP or DVCC. Treat generic
  // "Diversity" / "UP/CC" placeholders as an either/or search, not both.
  if ((hay.includes('UP/CC') || hay.includes('DIVERSITY')) && !tags.has('DVUP') && !tags.has('DVCC')) {
    tags.add('DVUP');
    tags.add('DVCC');
  }
  return Array.from(tags).filter(t => PLACEHOLDER_GENED_TAGS.includes(t));
}

function countPlannedGenEds(replacement) {
  const planned = {};
  PLACEHOLDER_GENED_TAGS.forEach(tag => { planned[tag] = []; });
  flatCourses().forEach(c => {
    if (placeholderSearchTarget && c.code === placeholderSearchTarget.code && c.semId === placeholderSearchTarget.semId) return;
    courseGenEdTags(c).forEach(tag => { if (planned[tag]) planned[tag].push(c); });
  });
  if (replacement) {
    courseGenEdTags(replacement).forEach(tag => { if (planned[tag]) planned[tag].push(replacement); });
  }
  return planned;
}

function getGenEdRequirementStatus(replacement) {
  const planned = countPlannedGenEds(replacement);
  const missing = [];
  PLACEHOLDER_CORE_REQUIREMENTS.forEach(tag => {
    const need = getGenEdNeed(tag);
    const have = (planned[tag] || []).length;
    if (have < need) missing.push({ id: tag, need, have, label: genEdLabel(tag) });
  });

  // Diversity is composite: at least 1 DVUP, and 2 total diversity courses
  // across DVUP/DVCC. This avoids falsely requiring a DVCC if the second
  // diversity course is also DVUP.
  const dvup = (planned.DVUP || []).length;
  const dvcc = (planned.DVCC || []).length;
  if (dvup < 1) missing.push({ id: 'DVUP', need: 1, have: dvup, label: genEdLabel('DVUP') });
  if (dvup + dvcc < 2) missing.push({ id: 'DIVERSITY-2', need: 2, have: dvup + dvcc, label: 'Second Diversity (DVUP or DVCC)' });

  return { planned, missing, complete: missing.length === 0 };
}

function candidateMatchesSelectedTags(tags) {
  if (!placeholderSearchSelectedTags.length) return tags.length > 0;
  const selected = new Set(placeholderSearchSelectedTags);
  const hasDvup = selected.has('DVUP');
  const hasDvcc = selected.has('DVCC');
  const required = Array.from(selected).filter(tag => !(hasDvup && hasDvcc && (tag === 'DVUP' || tag === 'DVCC')));
  const requiredMatch = required.every(tag => tags.includes(tag));
  const diversityMatch = !(hasDvup && hasDvcc) || tags.includes('DVUP') || tags.includes('DVCC');
  return requiredMatch && diversityMatch;
}

function closePlaceholderSearch() {
  placeholderSearchRequestSeq++;
  const modal = document.getElementById('placeholder-search-modal');
  if (modal) modal.classList.remove('open');
  placeholderSearchTarget = null;
  placeholderSearchResults = [];
  placeholderSectionPreviewKey = '';
}

function placeholderBrowseConfig(target = placeholderSearchTarget) {
  if (!target) return null;
  const tags = placeholderSearchSelectedTags.length ? placeholderSearchSelectedTags : inferPlaceholderTags(target);
  const suggestedDept = suggestedDeptForPlaceholder(target);
  let dept = '';
  if (suggestedDept === PLACEHOLDER_PROFILE_DEPTS_VALUE && typeof BROWSE_PROFILE_DEPTS_VALUE !== 'undefined') {
    dept = BROWSE_PROFILE_DEPTS_VALUE;
  } else if (suggestedDept && suggestedDept !== PLACEHOLDER_ALL_DEPTS_VALUE) {
    dept = suggestedDept;
  } else if (typeof browseProfileDepartments === 'function' && browseProfileDepartments().length && typeof BROWSE_PROFILE_DEPTS_VALUE !== 'undefined') {
    dept = BROWSE_PROFILE_DEPTS_VALUE;
  }
  let genEd = '';
  if (tags.length === 1) {
    genEd = tags[0];
  } else if (tags.length > 1 && typeof BROWSE_ALL_GENEDS_VALUE !== 'undefined') {
    genEd = BROWSE_ALL_GENEDS_VALUE;
  }
  return {
    dept,
    genEd,
    search: '',
    label: `Replace ${target.code || 'placeholder'}${tags.length ? ` · ${tags.join(' + ')}` : ''}`,
  };
}

function openPlaceholderBrowseSearch() {
  if (!placeholderSearchTarget) {
    toastError('Pick a placeholder first.');
    return;
  }
  if (typeof browseOpenSearch !== 'function') {
    toastError('Browse is still loading. Try again in a moment.');
    return;
  }
  const config = placeholderBrowseConfig(placeholderSearchTarget);
  placeholderSearchRequestSeq++;
  const modal = document.getElementById('placeholder-search-modal');
  if (modal) modal.classList.remove('open');
  placeholderSearchResults = [];
  browseOpenSearch({ ...config, save: true });
  toastSuccess(`Opened Browse to replace ${placeholderSearchTarget.code}.`);
}

function openPlaceholderSearch(courseCode, semId = '') {
  const course = flatCourses().find(c => c.code === courseCode && (!semId || c.semId === semId)) || findCourse(courseCode);
  if (!course) { toastError(`Course ${courseCode} not found.`); return; }
  placeholderSearchTarget = { ...course };
  placeholderSearchSelectedTags = inferPlaceholderTags(course);
  placeholderSearchResults = [];
  placeholderSearchMode = placeholderSearchSelectedTags.length ? 'all' : 'any';
  placeholderSectionPreviewKey = '';
  placeholderSearchRequestSeq++;

  const title = document.getElementById('ps-title');
  if (title) title.textContent = `Replace ${course.code}`;
  const subtitle = document.getElementById('ps-subtitle');
  if (subtitle) subtitle.textContent = `${course.title || 'Placeholder'} · Pick a real UMD course for this exact semester slot.`;
  const q = document.getElementById('ps-search');
  if (q) q.value = '';
  const mode = document.getElementById('ps-mode');
  if (mode) mode.value = placeholderSearchMode;
  const dept = document.getElementById('ps-dept');
  if (dept) {
    populatePlaceholderDeptSelect(true);
    dept.value = suggestedDeptForPlaceholder(course);
  }
  const sem = document.getElementById('ps-semester');
  if (sem) sem.textContent = `Semester: ${course.semId || 'current slot'}`;
  const modal = document.getElementById('placeholder-search-modal');
  if (modal) modal.classList.add('open');
  renderPlaceholderTagPicker();
  renderPlaceholderVerification();
  searchPlaceholderCourses();
  setTimeout(() => q && q.focus(), 50);
}

function populatePlaceholderDeptSelect(force = false) {
  const sel = document.getElementById('ps-dept');
  if (!sel || (sel.options.length && !force)) return;
  const current = sel.value;
  sel.innerHTML = '';
  const allOpt = document.createElement('option');
  allOpt.value = PLACEHOLDER_ALL_DEPTS_VALUE;
  allOpt.textContent = 'All common Gen-Ed depts';
  sel.appendChild(allOpt);
  const profileDepts = placeholderProfileDepartments();
  if (profileDepts.length) {
    const profileOpt = document.createElement('option');
    profileOpt.value = PLACEHOLDER_PROFILE_DEPTS_VALUE;
    profileOpt.textContent = `Profile departments (${profileDepts.slice(0, 4).join(', ')})`;
    sel.appendChild(profileOpt);
  }
  const depts = Array.from(new Set([...profileDepts, ...PLACEHOLDER_DEFAULT_DEPTS]));
  depts.forEach(dept => {
    const opt = document.createElement('option');
    opt.value = dept;
    opt.textContent = profileDepts.includes(dept) ? `${dept} · profile` : dept;
    sel.appendChild(opt);
  });
  if ([...sel.options].some(opt => opt.value === current)) sel.value = current;
}

function suggestedDeptForPlaceholder(course) {
  const hay = [course.code, course.title, course.note].join(' ').toUpperCase();
  if (hay.includes('COMM') || hay.includes('ORAL')) return 'COMM';
  if (hay.includes('ENGL') || hay.includes('WRITING')) return 'ENGL';
  if (placeholderProfileDepartments().length) return PLACEHOLDER_PROFILE_DEPTS_VALUE;
  if (hay.includes('HIST')) return 'HIST';
  // For generic HS/HU/Diversity placeholders, start broad so users don't
  // have to guess which department happens to carry the right Gen-Ed tag.
  return PLACEHOLDER_ALL_DEPTS_VALUE;
}

function getMissingPlaceholderFilterTags() {
  const status = getGenEdRequirementStatus();
  const tags = [];
  status.missing.forEach(item => {
    if (item.id === 'DIVERSITY-2') tags.push('DVUP', 'DVCC');
    else if (PLACEHOLDER_GENED_TAGS.includes(item.id)) tags.push(item.id);
  });
  return Array.from(new Set(tags));
}

function clearPlaceholderFilters() {
  placeholderSearchSelectedTags = [];
  placeholderSearchMode = 'any';
  const mode = document.getElementById('ps-mode');
  if (mode) mode.value = placeholderSearchMode;
  renderPlaceholderTagPicker();
  renderPlaceholderVerification();
  searchPlaceholderCourses();
}

function applyMissingPlaceholderFilters() {
  const missingTags = getMissingPlaceholderFilterTags();
  if (!missingTags.length) {
    toastSuccess('Your planned courses already cover the Gen-Ed checklist.');
    return;
  }
  placeholderSearchSelectedTags = missingTags;
  placeholderSearchMode = 'any';
  const mode = document.getElementById('ps-mode');
  if (mode) mode.value = placeholderSearchMode;
  renderPlaceholderTagPicker();
  renderPlaceholderVerification();
  searchPlaceholderCourses();
}

function renderPlaceholderTagPicker() {
  const root = document.getElementById('ps-tags');
  if (!root) return;
  root.innerHTML = PLACEHOLDER_GENED_TAGS.map(tag => `
    <button type="button" class="ps-tag ${placeholderSearchSelectedTags.includes(tag) ? 'active' : ''}" data-ps-tag="${tag}" title="${placeholderEscape(genEdLabel(tag))}">${tag}</button>
  `).join('');
  root.querySelectorAll('[data-ps-tag]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.dataset.psTag;
      placeholderSearchSelectedTags = placeholderSearchSelectedTags.includes(tag)
        ? placeholderSearchSelectedTags.filter(t => t !== tag)
        : [...placeholderSearchSelectedTags, tag];
      renderPlaceholderTagPicker();
      renderPlaceholderVerification();
      searchPlaceholderCourses();
    });
  });
}

function toPlaceholderResultFromFull(full) {
  if (!full) return null;
  return {
    course_id: normalizeCode(full.code),
    name: full.title,
    credits: full.cr,
    gen_ed: full.gen_ed || courseGenEdTags(full).map(t => [t]),
    description: full.description || '',
    _full: full,
  };
}

async function lookupPlaceholderTypedCourse() {
  const requestId = ++placeholderSearchRequestSeq;
  const status = document.getElementById('ps-status');
  const raw = (document.getElementById('ps-search')?.value || '').trim();
  if (!raw) { if (status) status.textContent = 'Type a course code like HIST200 first.'; return; }
  if (!/^[A-Z]{3,4}\s*\d{3}[A-Z]?$/i.test(raw)) {
    if (status) status.textContent = 'Direct lookup expects a course code, e.g. HIST200 or ENGL 292.';
    return;
  }
  if (status) status.textContent = `Looking up ${displayCode(raw)}…`;
  const full = await fetchCourseFull(raw);
  if (requestId !== placeholderSearchRequestSeq) return;
  const row = toPlaceholderResultFromFull(full);
  if (!row) { if (status) status.textContent = `No course metadata found for ${displayCode(raw)}.`; return; }
  placeholderSearchResults = [row, ...placeholderSearchResults.filter(r => normalizeCode(r.course_id) !== normalizeCode(row.course_id))];
  if (status) status.textContent = `Found ${displayCode(row.course_id)}. Review its Gen-Ed fit below.`;
  renderPlaceholderResults();
}


function placeholderAllSearchDepts() {
  return (typeof COMMON_DEPTS !== 'undefined' && Array.isArray(COMMON_DEPTS))
    ? COMMON_DEPTS
    : PLACEHOLDER_DEFAULT_DEPTS;
}

function placeholderProfileDepartments() {
  const allowed = new Set(placeholderAllSearchDepts());
  const depts = typeof profilePreferredDepartments === 'function' ? profilePreferredDepartments() : [];
  return depts.filter(dept => allowed.has(dept)).slice(0, 8);
}

function placeholderDeptScope(value) {
  const raw = value || PLACEHOLDER_ALL_DEPTS_VALUE;
  if (raw === PLACEHOLDER_PROFILE_DEPTS_VALUE) {
    const depts = placeholderProfileDepartments();
    return {
      value: raw,
      label: depts.length ? `profile departments (${depts.slice(0, 5).join(', ')})` : 'profile departments',
      depts,
      apiDept: '',
      profile: true,
      all: false,
    };
  }
  if (raw === PLACEHOLDER_ALL_DEPTS_VALUE) {
    return {
      value: raw,
      label: 'all departments',
      depts: [],
      apiDept: '',
      profile: false,
      all: true,
    };
  }
  const clean = String(raw).trim().toUpperCase();
  return {
    value: clean,
    label: clean,
    depts: clean ? [clean] : [],
    apiDept: clean,
    profile: false,
    all: false,
  };
}

async function listPlaceholderCoursesByDepts(depts) {
  const out = [];
  let idx = 0;
  const concurrency = Math.min(4, depts.length);
  async function worker() {
    while (idx < depts.length) {
      const dept = depts[idx++];
      const rows = await umdioListCoursesByDept(dept).catch(() => []);
      rows.forEach(r => out.push({ ...r, _dept: r.dept_id || dept }));
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  return out;
}

function placeholderSearchTagsForApi() {
  if (placeholderSearchSelectedTags.length) return placeholderSearchSelectedTags;
  return PLACEHOLDER_GENED_TAGS;
}

async function listPlaceholderCoursesByGenEdTags(tags, dept) {
  const uniqueTags = Array.from(new Set((tags || []).map(t => String(t || '').trim().toUpperCase()).filter(Boolean)));
  const scope = placeholderDeptScope(dept);
  if (!uniqueTags.length) return [];

  if (scope.profile) {
    if (!scope.depts.length) return listPlaceholderCoursesByGenEdTags(uniqueTags, PLACEHOLDER_ALL_DEPTS_VALUE);
    const lists = await Promise.all(scope.depts.map(profileDept => listPlaceholderCoursesByGenEdTags(uniqueTags, profileDept).catch(() => [])));
    const byCode = new Map();
    lists.flat().forEach(r => {
      const key = normalizeCode(r.course_id || '');
      if (!key) return;
      const existing = byCode.get(key) || {};
      byCode.set(key, { ...existing, ...r, _dept: r.dept_id || r._dept || existing._dept || '' });
    });
    return Array.from(byCode.values());
  }

  // Reuse the same Gen-Ed query path as the Browse Courses tab so clicking a
  // schedule Gen-Ed placeholder and using the generic Gen-Ed browser return
  // the same candidate set. That helper also owns the global-gen-ed fallback.
  if (typeof browseListCoursesByGenEdTags === 'function') {
    return (await browseListCoursesByGenEdTags(uniqueTags, { dept: scope.apiDept })).map(r => ({
      ...r,
      _dept: r.dept_id || scope.apiDept || r._dept || '',
    }));
  }

  const out = [];
  let idx = 0;
  const concurrency = Math.min(4, uniqueTags.length);
  async function worker() {
    while (idx < uniqueTags.length) {
      const tag = uniqueTags[idx++];
      const rows = await umdioListCoursesByGenEd(tag, { dept: scope.apiDept }).catch(() => []);
      rows.forEach(r => out.push({ ...r, _dept: r.dept_id || scope.apiDept || '', _sourceGenEd: tag }));
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));

  if (!out.length) {
    const fallbackDepts = scope.apiDept ? [scope.apiDept] : placeholderAllSearchDepts();
    const deptRows = await listPlaceholderCoursesByDepts(fallbackDepts);
    const selected = new Set(uniqueTags);
    return deptRows.filter(r => ((r.gen_ed && r.gen_ed.flat().filter(Boolean)) || [])
      .some(t => selected.has(String(t).toUpperCase())));
  }
  return out;
}

async function searchPlaceholderCourses() {
  const requestId = ++placeholderSearchRequestSeq;
  const grid = document.getElementById('ps-results');
  const status = document.getElementById('ps-status');
  const dept = document.getElementById('ps-dept')?.value || PLACEHOLDER_ALL_DEPTS_VALUE;
  const deptScope = placeholderDeptScope(dept);
  const query = (document.getElementById('ps-search')?.value || '').trim().toLowerCase();
  const useGenEdApi = placeholderSearchSelectedTags.length || deptScope.all || deptScope.profile;
  const apiTags = placeholderSearchTagsForApi();
  if (status) {
    status.textContent = useGenEdApi
      ? `Searching ${apiTags.length === PLACEHOLDER_GENED_TAGS.length ? 'all Gen-Ed tags' : apiTags.join(' + ')} across ${deptScope.label}…`
      : `Searching ${deptScope.label} courses…`;
  }
  if (grid) grid.innerHTML = '<p class="reco-empty">Loading candidate courses…</p>';
  const rows = useGenEdApi
    ? await listPlaceholderCoursesByGenEdTags(apiTags, dept)
    : await listPlaceholderCoursesByDepts(deptScope.depts);
  if (requestId !== placeholderSearchRequestSeq) return;
  const byCode = new Map();
  rows.forEach(r => {
    const key = normalizeCode(r.course_id || '');
    if (!key) return;
    const existing = byCode.get(key) || {};
    byCode.set(key, { ...existing, ...r, _dept: r.dept_id || r._dept || existing._dept || '' });
  });
  const withTags = Array.from(byCode.values()).map(r => ({
    ...r,
    _tags: ((r.gen_ed && r.gen_ed.flat().filter(Boolean)) || []).map(t => String(t).toUpperCase()),
  }));
  placeholderSearchResults = withTags.filter(r => {
    if (placeholderSearchMode === 'all' && !candidateMatchesSelectedTags(r._tags)) return false;
    if (placeholderSearchMode === 'any' && placeholderSearchSelectedTags.length && !r._tags.some(t => placeholderSearchSelectedTags.includes(t))) return false;
    if (!query) return r._tags.length > 0;
    const hay = [r.course_id, r.name, r.description, r._dept, r.department].join(' ').toLowerCase();
    return hay.includes(query);
  });
  if (status) {
    status.textContent = placeholderSearchResults.length
      ? `${placeholderSearchResults.length} matching course${placeholderSearchResults.length === 1 ? '' : 's'} found across ${deptScope.label}. Best Gen-Ed and profile fits appear first.`
      : 'No matches yet. Try “Match any selected tag,” clear filters, or use Lookup Code for a course you already know.';
  }
  renderPlaceholderResults();
}

function getCandidateTags(row) {
  return (row._tags || (row.gen_ed && row.gen_ed.flat().filter(Boolean)) || []).map(t => String(t).toUpperCase());
}

function candidateToCourse(row) {
  if (row._full) return row._full;
  const tags = getCandidateTags(row);
  const category = tags[0] ? `gened-${tags[0].toLowerCase()}` : 'elective';
  return {
    code: displayCode(row.course_id || ''),
    title: row.name || displayCode(row.course_id || ''),
    cr: parseInt(row.credits || '3', 10) || 3,
    kind: category.startsWith('gened') ? 'gened' : 'tech',
    category,
    categories: tags.map(t => `gened-${t.toLowerCase()}`),
    gen_ed: row.gen_ed || tags.map(t => [t]),
    prereqs: [],
    coreqs: [],
  };
}

function placeholderPreviewNorm(courseId) {
  return normalizeCode(courseId || '');
}

function placeholderScheduleContext(row = null) {
  const sems = typeof getAllSemesters === 'function' ? getAllSemesters() : [];
  const semId = placeholderSearchTarget?.semId
    || (typeof scheduleDefaultSemesterId === 'function' ? scheduleDefaultSemesterId() : '')
    || sems[0]?.id
    || '';
  const sem = sems.find(item => item.id === semId) || sems[0] || null;
  const term = sem
    ? ((state.schedulePrefs || {})[sem.id]?.term || (typeof scheduleInferTermCode === 'function' ? scheduleInferTermCode(sem) : ''))
    : '';
  const termLabel = term && typeof scheduleTermLabel === 'function' ? scheduleTermLabel(term) : term;
  const currentCredits = typeof browseSemesterCreditLoad === 'function'
    ? browseSemesterCreditLoad(semId)
    : [
        ...(sem?.courses || []),
        ...(state.customCourses || []).filter(course => course.semId === semId),
      ].reduce((sum, course) => sum + (Number(course.cr) || 0), 0);
  const replacement = row ? candidateToCourse(row) : null;
  const removedCredits = Number(placeholderSearchTarget?.cr) || 0;
  const courseCredits = replacement ? Number(replacement.cr) || 0 : 0;
  return {
    sem,
    semId,
    semName: sem?.name || semId || 'selected semester',
    term,
    termLabel,
    prefs: typeof getSchedulePrefs === 'function' ? getSchedulePrefs(semId) : (typeof DEFAULT_SCHEDULE_PREFS !== 'undefined' ? DEFAULT_SCHEDULE_PREFS : {}),
    currentCredits,
    removedCredits,
    courseCredits,
    afterCredits: Math.max(0, currentCredits - removedCredits + courseCredits),
  };
}

function placeholderCoursesForSemester(semId) {
  const sem = (typeof getAllSemesters === 'function' ? getAllSemesters() : []).find(item => item.id === semId);
  return [
    ...(sem?.courses || []),
    ...(state.customCourses || []).filter(course => course.semId === semId),
  ];
}

function placeholderSelectedItemsForPreview(context, replacementNorm = '') {
  const bucket = (state.selectedSections || {})[context.semId] || {};
  const courses = placeholderCoursesForSemester(context.semId);
  const targetNorm = placeholderSearchTarget ? normalizeCode(placeholderSearchTarget.code) : '';
  return Object.entries(bucket).map(([norm, section]) => {
    if (!section) return null;
    const cleanNorm = normalizeCode(norm);
    if (cleanNorm === targetNorm || cleanNorm === replacementNorm) return null;
    if (section.semester && context.term && String(section.semester) !== String(context.term)) return null;
    const course = courses.find(item => normalizeCode(item.code) === cleanNorm) || {
      code: displayCode(cleanNorm),
      title: displayCode(cleanNorm),
      cr: 0,
    };
    return { course, section };
  }).filter(Boolean);
}

function placeholderSectionConflictCodes(section, course, currentItems) {
  if (typeof sectionBlocks !== 'function' || typeof blocksConflict !== 'function') return [];
  const candidateBlocks = sectionBlocks(section, course);
  const conflicts = new Set();
  currentItems.forEach(item => {
    const blocks = sectionBlocks(item.section, item.course);
    candidateBlocks.forEach(a => {
      blocks.forEach(b => {
        if (blocksConflict(a, b)) conflicts.add(item.course.code || displayCode(item.section.course || ''));
      });
    });
  });
  return Array.from(conflicts);
}

function placeholderBuildSectionPreview(row, sections, context = placeholderScheduleContext(row)) {
  const course = candidateToCourse(row);
  const currentItems = placeholderSelectedItemsForPreview(context, normalizeCode(course.code));
  const prefs = context.prefs || (typeof DEFAULT_SCHEDULE_PREFS !== 'undefined' ? DEFAULT_SCHEDULE_PREFS : {});
  const samples = (sections || []).map(section => {
    const item = { course, section };
    const items = [...currentItems, item];
    const conflictCodes = placeholderSectionConflictCodes(section, course, currentItems);
    const blocked = typeof sectionBlockedOverlaps === 'function' ? sectionBlockedOverlaps(section, prefs, course) : [];
    const evaluation = typeof evaluateScheduleCandidate === 'function'
      ? evaluateScheduleCandidate(items, prefs)
      : {
          timing: typeof scheduleTimingFit === 'function' ? scheduleTimingFit(items, prefs, []) : null,
          score: 0,
          openSeats: 0,
          warnings: [],
        };
    const openSeats = typeof sectionSeatNumber === 'function'
      ? sectionSeatNumber(section.open_seats)
      : (Number.isFinite(parseInt(section.open_seats, 10)) ? parseInt(section.open_seats, 10) : null);
    const waitlist = typeof sectionSeatNumber === 'function'
      ? sectionSeatNumber(section.waitlist)
      : (Number.isFinite(parseInt(section.waitlist, 10)) ? parseInt(section.waitlist, 10) : null);
    const timed = typeof sectionHasTimedMeetings === 'function' ? sectionHasTimedMeetings(section) : !!((section.meetings || []).some(m => m.days && m.start_time && m.end_time));
    const summary = typeof sectionSummary === 'function'
      ? sectionSummary(section)
      : `${section.number || 'Section'} · ${timed ? 'posted time' : 'time TBA'}`;
    const level = conflictCodes.length || blocked.length ? 'warn' : (timed ? 'ok' : 'info');
    return {
      section,
      summary,
      openSeats,
      waitlist,
      conflictCodes,
      blockedCount: blocked.length,
      timingLabel: evaluation.timing?.label || '',
      timingScore: evaluation.timing?.score || 0,
      warningCount: evaluation.warnings?.length || 0,
      score: evaluation.score || 0,
      timed,
      level,
    };
  }).sort((a, b) => (
    a.conflictCodes.length - b.conflictCodes.length
    || a.blockedCount - b.blockedCount
    || (b.openSeats ?? -1) - (a.openSeats ?? -1)
    || b.timingScore - a.timingScore
    || b.score - a.score
  ));
  return {
    course,
    context,
    currentItems,
    sections: sections || [],
    samples,
  };
}

function placeholderSectionPreviewCacheKey(courseId, context = placeholderScheduleContext()) {
  return `${context.term || 'no-term'}:${placeholderPreviewNorm(courseId)}`;
}

function placeholderSectionPreviewState(row) {
  const context = placeholderScheduleContext(row);
  const key = placeholderSectionPreviewCacheKey(row.course_id || row.code, context);
  return placeholderSectionPreviewCache[key] || { status: context.term ? 'idle' : 'no-term', context };
}

function placeholderSectionPreviewHtml(row, overrideState = null) {
  const state = overrideState || placeholderSectionPreviewState(row);
  const context = state.context || placeholderScheduleContext(row);
  const code = displayCode(row.course_id || row.code || '');
  if (state.status === 'loading') {
    return `
      <div class="ps-section-preview loading">
        <div class="ps-section-preview-head"><strong>Meeting preview</strong><span>Loading posted sections for ${placeholderEscape(context.termLabel || context.term || 'selected term')}...</span></div>
      </div>
    `;
  }
  if (state.status === 'no-term') {
    return `
      <div class="ps-section-preview warn">
        <div class="ps-section-preview-head"><strong>Meeting preview</strong><span>No UMD term is tied to this placeholder semester yet.</span></div>
      </div>
    `;
  }
  if (state.status === 'error') {
    return `
      <div class="ps-section-preview warn">
        <div class="ps-section-preview-head"><strong>Meeting preview</strong><span>Section lookup failed. Open Browse or Schedule and retry after UMD data loads.</span></div>
      </div>
    `;
  }
  const preview = placeholderBuildSectionPreview(row, state.sections || [], context);
  const loadText = `${preview.context.currentCredits} -> ${preview.context.afterCredits} credits`;
  if (!preview.sections.length) {
    return `
      <div class="ps-section-preview warn">
        <div class="ps-section-preview-head">
          <strong>Meeting preview</strong>
          <span>${placeholderEscape(preview.context.semName)} · ${placeholderEscape(preview.context.termLabel || preview.context.term || 'selected term')} · ${placeholderEscape(loadText)}</span>
        </div>
        <p>No posted sections found for ${placeholderEscape(code)} in this term yet.</p>
      </div>
    `;
  }
  return `
    <div class="ps-section-preview">
      <div class="ps-section-preview-head">
        <strong>Meeting preview</strong>
        <span>${placeholderEscape(preview.context.semName)} · ${placeholderEscape(preview.context.termLabel || preview.context.term || 'selected term')} · ${placeholderEscape(loadText)}</span>
      </div>
      <div class="ps-section-list">
        ${preview.samples.slice(0, 4).map(item => {
          const seats = item.openSeats === null ? 'seats TBA' : `${item.openSeats} open`;
          const wait = item.waitlist ? ` · ${item.waitlist} waitlisted` : '';
          const conflict = item.conflictCodes.length
            ? `Conflicts with ${item.conflictCodes.join(', ')}`
            : item.blockedCount
              ? `${item.blockedCount} blocked-time overlap${item.blockedCount === 1 ? '' : 's'}`
              : 'No conflicts with picked sections';
          return `
            <div class="ps-section-option ${placeholderEscape(item.level)}">
              <strong>${placeholderEscape(item.summary)}</strong>
              <span>${placeholderEscape([seats + wait, item.timingLabel ? `${item.timingLabel} (${item.timingScore}/100)` : '', conflict].filter(Boolean).join(' · '))}</span>
            </div>
          `;
        }).join('')}
      </div>
      <p>${placeholderEscape(preview.sections.length)} posted section${preview.sections.length === 1 ? '' : 's'} checked before replacing ${placeholderEscape(placeholderSearchTarget?.code || 'the placeholder')}.</p>
    </div>
  `;
}

async function togglePlaceholderSectionPreview(courseId) {
  const norm = placeholderPreviewNorm(courseId);
  if (!norm) return;
  if (placeholderSectionPreviewKey === norm) {
    placeholderSectionPreviewKey = '';
    renderPlaceholderResults();
    return;
  }
  placeholderSectionPreviewKey = norm;
  const row = placeholderSearchResults.find(item => placeholderPreviewNorm(item.course_id || item.code) === norm) || { course_id: courseId };
  const context = placeholderScheduleContext(row);
  const cacheKey = placeholderSectionPreviewCacheKey(courseId, context);
  if (!context.term || typeof umdioFetchSections !== 'function') {
    placeholderSectionPreviewCache[cacheKey] = { status: context.term ? 'error' : 'no-term', context, sections: [] };
    renderPlaceholderResults();
    return;
  }
  if (placeholderSectionPreviewCache[cacheKey]?.status === 'ready') {
    renderPlaceholderResults();
    return;
  }
  placeholderSectionPreviewCache[cacheKey] = { status: 'loading', context, sections: [] };
  renderPlaceholderResults();
  const requestId = placeholderSearchRequestSeq;
  try {
    const sections = await umdioFetchSections(courseId, context.term);
    placeholderSectionPreviewCache[cacheKey] = { status: 'ready', context, sections: sections || [] };
  } catch {
    placeholderSectionPreviewCache[cacheKey] = { status: 'error', context, sections: [] };
  }
  if (requestId === placeholderSearchRequestSeq && placeholderSectionPreviewKey === norm) renderPlaceholderResults();
}

function scorePlaceholderCandidate(row) {
  const before = getGenEdRequirementStatus();
  const after = getGenEdRequirementStatus(candidateToCourse(row));
  const improvement = before.missing.length - after.missing.length;
  const tags = getCandidateTags(row);
  const selectedHits = tags.filter(t => placeholderSearchSelectedTags.includes(t)).length;
  const missingHits = tags.filter(t => getMissingPlaceholderFilterTags().includes(t)).length;
  const profileMatch = typeof profileCourseMatch === 'function'
    ? profileCourseMatch({ code: row.course_id, title: row.name, description: row.description, gen_ed: row.gen_ed })
    : { score: 0 };
  return (after.complete ? 10000 : 0) + (improvement * 500) + (profileMatch.score * 4) + (missingHits * 50) + (selectedHits * 10) - after.missing.length;
}

function renderPlaceholderResults() {
  const grid = document.getElementById('ps-results');
  if (!grid) return;
  const selected = new Set(placeholderSearchSelectedTags);
  let rows = placeholderSearchResults;
  if (placeholderSearchMode === 'all') rows = rows.filter(r => candidateMatchesSelectedTags(getCandidateTags(r)));
  if (placeholderSearchMode === 'any' && selected.size) rows = rows.filter(r => getCandidateTags(r).some(t => selected.has(t)));
  if (!rows.length) {
    grid.innerHTML = '<p class="reco-empty">No candidates match the current Gen-Ed filters yet. Try “Any selected tag” or direct course-code lookup.</p>';
    return;
  }
  grid.innerHTML = '';
  rows = rows.slice().sort((a, b) => scorePlaceholderCandidate(b) - scorePlaceholderCandidate(a));
  if (placeholderSectionPreviewKey && !rows.some(r => placeholderPreviewNorm(r.course_id || r.code) === placeholderSectionPreviewKey)) {
    placeholderSectionPreviewKey = '';
  }
  rows.slice(0, 80).forEach(r => {
    const code = displayCode(r.course_id || '');
    const norm = placeholderPreviewNorm(r.course_id || code);
    const tags = getCandidateTags(r);
    const previewCourse = candidateToCourse(r);
    const preview = getGenEdRequirementStatus(previewCourse);
    const newlyHelps = tags.filter(t => (preview.planned[t] || []).some(c => normalizeCode(c.code) === normalizeCode(previewCourse.code)));
    const gapText = preview.complete
      ? 'Completes planned Gen-Ed coverage'
      : `${preview.missing.length} gap${preview.missing.length === 1 ? '' : 's'} remain`;
    const safeCode = placeholderEscape(code);
    const safeCredits = placeholderEscape(r.credits || '?');
    const safeName = placeholderEscape(r.name || '');
    const safeDept = placeholderEscape(r._dept || '');
    const profileMatch = typeof profileCourseMatch === 'function'
      ? profileCourseMatch({ code: r.course_id, title: r.name, description: r.description, gen_ed: r.gen_ed })
      : { score: 0, labels: [] };
    const safeProfileTags = profileMatch.score
      ? `<span class="reco-tag profile">Profile fit</span>${(profileMatch.labels || []).map(label => `<span class="reco-tag">${placeholderEscape(label)}</span>`).join('')}`
      : '';
    const safeGapText = placeholderEscape(gapText);
    const safeImpact = placeholderEscape(newlyHelps.length ? `Counts as ${newlyHelps.join(' + ')}` : 'No Gen-Ed tags found for this course');
    const safeDesc = placeholderEscape(r.description ? `${r.description.slice(0, 180)}${r.description.length > 180 ? '…' : ''}` : '');
    const previewOpen = placeholderSectionPreviewKey === norm;
    const card = document.createElement('div');
    card.className = `ps-result ${preview.complete ? 'complete' : ''}`;
    card.innerHTML = `
      <div class="ps-result-head">
        <strong>${safeCode}</strong>
        <span class="br-credits">${safeCredits} cr</span>
      </div>
      <div class="br-title">${safeName}</div>
      <div class="br-meta">${safeDept ? `<span class="reco-tag dept">${safeDept}</span>` : ''}${tags.map(t => `<span class="reco-tag ${selected.has(t) ? 'selected' : ''}">${placeholderEscape(t)}</span>`).join('')}${safeProfileTags}</div>
      <div class="ps-impact ${preview.complete ? 'complete' : ''}">
        <strong>${safeGapText}</strong>
        <span>${safeImpact}</span>
      </div>
      ${safeDesc ? `<div class="br-desc">${safeDesc}</div>` : ''}
      <div class="br-actions">
        <button class="btn small" type="button" data-ps-preview="${placeholderEscape(norm)}" aria-expanded="${previewOpen ? 'true' : 'false'}">${previewOpen ? 'Hide times' : 'Preview times'}</button>
        <button class="btn small primary" type="button" data-ps-use="${placeholderEscape(norm)}">Use this course</button>
      </div>
      ${previewOpen ? placeholderSectionPreviewHtml(r) : ''}
    `;
    const previewBtn = card.querySelector('[data-ps-preview]');
    if (previewBtn) previewBtn.addEventListener('click', () => togglePlaceholderSectionPreview(r.course_id));
    const useBtn = card.querySelector('[data-ps-use]');
    if (useBtn) useBtn.addEventListener('click', () => replacePlaceholderWithCourse(r.course_id, r._full || null));
    grid.appendChild(card);
  });
}

function renderPlaceholderVerification(candidate) {
  const root = document.getElementById('ps-verification');
  if (!root) return;
  const status = getGenEdRequirementStatus(candidate);
  const selectedText = placeholderSearchSelectedTags.length
    ? `Filter: ${placeholderSearchSelectedTags.join(' + ')}${placeholderSearchSelectedTags.includes('DVUP') && placeholderSearchSelectedTags.includes('DVCC') ? ' (DVUP or DVCC accepted)' : ''}`
    : 'Select Gen-Ed tags to filter candidates, or type an exact course code.';
  const missingText = status.complete
    ? 'All Gen-Ed requirements are planned with this schedule.'
    : `Current plan still needs: ${status.missing.map(d => `${d.id} (${d.have}/${d.need})`).join(', ')}`;
  root.className = `ps-verify ${status.complete ? 'complete' : ''}`;
  root.innerHTML = `<strong>${placeholderEscape(selectedText)}</strong><span>${placeholderEscape(missingText)}</span>`;
}

async function replacePlaceholderWithCourse(courseId, prefetched = null) {
  if (!placeholderSearchTarget) return;
  const status = document.getElementById('ps-status');
  if (status) status.textContent = `Fetching ${displayCode(courseId)} details…`;
  const full = prefetched || await fetchCourseFull(courseId);
  if (!full) { toastError(`Could not fetch ${courseId}.`); return; }
  const tags = courseGenEdTags(full);
  const matchingTag = placeholderSearchSelectedTags.find(t => tags.includes(t));
  const category = matchingTag
    ? `gened-${matchingTag.toLowerCase()}`
    : (full.category && full.category.startsWith('gened') ? full.category : placeholderSearchTarget.category);
  const duplicate = flatCourses().find(c =>
    normalizeCode(c.code) === normalizeCode(full.code) &&
    !(c.code === placeholderSearchTarget.code && c.semId === placeholderSearchTarget.semId)
  );
  if (duplicate) {
    toastError(`${full.code} is already in your plan.`);
    return;
  }

  const { _browseSlotIndex, _browseCustomSlotIndex, ...targetForUpdate } = placeholderSearchTarget;
  const updated = {
    ...targetForUpdate,
    ...full,
    kind: category && category.startsWith('gened') ? 'gened' : (placeholderSearchTarget.kind || full.kind),
    category,
    categories: full.categories && full.categories.length ? full.categories : tags.map(t => `gened-${t.toLowerCase()}`),
    note: `Replaced ${placeholderSearchTarget.code}${tags.length ? ` · ${tags.join(' + ')}` : ''}`,
  };
  const sched = mutableSchedule();
  const targetSlotIndex = Number.isInteger(placeholderSearchTarget._browseSlotIndex) ? placeholderSearchTarget._browseSlotIndex : null;
  const targetCustomSlotIndex = Number.isInteger(placeholderSearchTarget._browseCustomSlotIndex) ? placeholderSearchTarget._browseCustomSlotIndex : null;
  let replaced = false;
  for (const sem of [...sched, ...(state.customSemesters || [])]) {
    const idx = (sem.courses || []).findIndex((c, courseIndex) =>
      c.code === placeholderSearchTarget.code
      && (!placeholderSearchTarget.semId || sem.id === placeholderSearchTarget.semId)
      && (targetSlotIndex === null || courseIndex === targetSlotIndex)
    );
    if (idx >= 0) {
      sem.courses[idx] = updated;
      replaced = true;
      break;
    }
  }
  if (!replaced) {
    const idx = (state.customCourses || []).findIndex((c, courseIndex) =>
      c.code === placeholderSearchTarget.code
      && (!placeholderSearchTarget.semId || c.semId === placeholderSearchTarget.semId)
      && (targetCustomSlotIndex === null || courseIndex === targetCustomSlotIndex)
    );
    if (idx >= 0) {
      state.customCourses[idx] = { ...updated, isCustom: true, semId: placeholderSearchTarget.semId };
      replaced = true;
    }
  }
  if (!replaced) { toastError('Could not locate placeholder to replace.'); return; }
  if (state.courses[placeholderSearchTarget.code]) {
    state.courses[updated.code] = state.courses[placeholderSearchTarget.code];
    delete state.courses[placeholderSearchTarget.code];
  }
  saveState();
  const verification = getGenEdRequirementStatus(updated);
  const oldCode = placeholderSearchTarget.code;
  closePlaceholderSearch();
  render();
  toastSuccess(`${oldCode} → ${updated.code}. ${verification.complete ? 'Gen-Ed plan is complete.' : `${verification.missing.length} Gen-Ed requirement gap(s) still need courses.`}`);
}

function initPlaceholderSearch() {
  populatePlaceholderDeptSelect();
  const dept = document.getElementById('ps-dept');
  if (dept) dept.addEventListener('change', searchPlaceholderCourses);
  const mode = document.getElementById('ps-mode');
  if (mode) mode.addEventListener('change', (e) => {
    placeholderSearchMode = e.target.value;
    searchPlaceholderCourses();
  });
  const lookup = document.getElementById('ps-lookup');
  if (lookup) lookup.addEventListener('click', lookupPlaceholderTypedCourse);
  const clear = document.getElementById('ps-clear');
  if (clear) clear.addEventListener('click', clearPlaceholderFilters);
  const browse = document.getElementById('ps-browse');
  if (browse) browse.addEventListener('click', openPlaceholderBrowseSearch);
  const missing = document.getElementById('ps-missing');
  if (missing) missing.addEventListener('click', applyMissingPlaceholderFilters);
  const search = document.getElementById('ps-search');
  if (search) {
    search.addEventListener('input', () => {
      clearTimeout(initPlaceholderSearch._t);
      initPlaceholderSearch._t = setTimeout(searchPlaceholderCourses, 250);
    });
    search.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      const raw = search.value.trim();
      if (/^[A-Z]{3,4}\s*\d{3}[A-Z]?$/i.test(raw)) lookupPlaceholderTypedCourse();
      else searchPlaceholderCourses();
    });
  }
}
