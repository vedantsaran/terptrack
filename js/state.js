'use strict';
/* ============================================================
   STATE
   ============================================================ */

const PROFILE_INTEREST_DEFS = [
  {
    id: 'ai-data',
    label: 'AI + data',
    depts: ['CMSC', 'STAT', 'INST', 'INFO', 'MATH'],
    keywords: ['artificial intelligence', 'machine learning', 'data', 'analytics', 'statistics', 'programming', 'algorithm'],
  },
  {
    id: 'health-life',
    label: 'Health + life science',
    depts: ['BSCI', 'BIOL', 'HLTH', 'HESP', 'KNES', 'PSYC', 'BCHM'],
    keywords: ['health', 'biology', 'neuroscience', 'medicine', 'clinical', 'public health', 'physiology'],
  },
  {
    id: 'business',
    label: 'Business + startups',
    depts: ['BMGT', 'ECON', 'AREC', 'COMM', 'INST'],
    keywords: ['business', 'finance', 'marketing', 'entrepreneur', 'management', 'strategy', 'accounting'],
  },
  {
    id: 'policy-society',
    label: 'Policy + society',
    depts: ['GVPT', 'CCJS', 'SOCY', 'AASP', 'WMST', 'HIST', 'AMST'],
    keywords: ['policy', 'justice', 'law', 'government', 'society', 'community', 'equity', 'culture'],
  },
  {
    id: 'design-media',
    label: 'Design + media',
    depts: ['ARTT', 'CINE', 'COMM', 'JOUR', 'THET', 'MUSC', 'ARCH'],
    keywords: ['design', 'media', 'film', 'journalism', 'creative', 'studio', 'visual', 'performance'],
  },
  {
    id: 'sustainability',
    label: 'Climate + sustainability',
    depts: ['ENST', 'GEOG', 'GEOL', 'AOSC', 'PLSC', 'ANSC', 'AREC'],
    keywords: ['climate', 'environment', 'sustainability', 'earth', 'agriculture', 'energy', 'conservation'],
  },
  {
    id: 'education-community',
    label: 'Education + community',
    depts: ['EDUC', 'EDHD', 'EDCI', 'FMSC', 'COMM', 'HLTH'],
    keywords: ['education', 'teaching', 'learning', 'family', 'community', 'development', 'youth'],
  },
  {
    id: 'engineering-build',
    label: 'Engineering + building',
    depts: ['ENAE', 'ENME', 'ENCE', 'ENEE', 'ENCH', 'ENMA', 'ENFP'],
    keywords: ['engineering', 'design', 'systems', 'manufacturing', 'materials', 'aerospace', 'robotics'],
  },
];

const PROFILE_KNOWN_DEPTS = new Set([
  ...PROFILE_INTEREST_DEFS.flatMap(def => def.depts || []),
  'ENGL', 'COMM', 'HIST', 'GVPT', 'PSYC', 'SOCY', 'ANTH', 'PHIL', 'ARTH', 'THET',
  'MUSC', 'RELS', 'WMST', 'AASP', 'AMST', 'GEOG', 'ECON', 'JOUR', 'CINE', 'FMSC',
  'NUTR', 'NFSC', 'BSCI', 'CHEM', 'PHYS', 'PLCY',
]);

function defaultProfilePrefs() {
  return { interests: [], careerGoal: '', genEdDepts: [] };
}

function currentCatalogYear() {
  return String(
    (typeof UMD_CATALOG_YEAR !== 'undefined' && UMD_CATALOG_YEAR)
    || DEFAULT_SETTINGS.catalogYear
    || '2026-2027'
  );
}

function normalizeCatalogYear(value, fallback = currentCatalogYear()) {
  const source = String(value || '').replace(/[–—]/g, '-').trim();
  const firstMatch = source.match(/\b(20\d{2})\b/);
  const first = firstMatch ? Number(firstMatch[1]) : NaN;
  if (!Number.isFinite(first) || first < 2010 || first > 2040) return currentCatalogYear();
  const secondMatch = source.slice(firstMatch.index + firstMatch[0].length).match(/\b(20\d{2})\b|\b(\d{2})\b/);
  const second = secondMatch
    ? Number(secondMatch[1] || `20${secondMatch[2]}`)
    : first + 1;
  if (second !== first + 1) return normalizeCatalogYear(fallback || currentCatalogYear());
  return `${first}-${second}`;
}

function catalogYearOptions(extraYear = '') {
  const current = normalizeCatalogYear(currentCatalogYear());
  const latest = Number(current.slice(0, 4));
  const years = [];
  for (let year = latest; year >= latest - 8; year -= 1) {
    years.push(`${year}-${year + 1}`);
  }
  const extra = normalizeCatalogYear(extraYear || current);
  if (!years.includes(extra)) years.push(extra);
  return Array.from(new Set(years)).sort((a, b) => Number(b.slice(0, 4)) - Number(a.slice(0, 4)));
}

function catalogYearIsCurrent(year) {
  return normalizeCatalogYear(year) === normalizeCatalogYear(currentCatalogYear());
}

function catalogYearAdvisingWarning(settings = null) {
  const rawSettings = settings || (typeof getSettings === 'function' ? getSettings() : DEFAULT_SETTINGS);
  const targetYear = normalizeCatalogYear(rawSettings?.catalogYear);
  const sourceYear = currentCatalogYear();
  if (targetYear === sourceYear) return null;
  return {
    level: 'warn',
    targetYear,
    sourceYear,
    title: `Confirm ${targetYear} catalog requirements`,
    body: `This plan targets the ${targetYear} catalog, while TerpTrack's built-in requirement links were checked against ${sourceYear}. Bring the official UMD audit or advisor worksheet before treating requirement coverage as final.`,
    meta: `Target ${targetYear} · linked source ${sourceYear}`,
  };
}

function normalizeSettings(value) {
  const merged = { ...DEFAULT_SETTINGS, ...(value || {}) };
  return {
    ...merged,
    programName: String(merged.programName || DEFAULT_SETTINGS.programName).trim() || DEFAULT_SETTINGS.programName,
    eyebrow: String(merged.eyebrow || '').trim() || DEFAULT_SETTINGS.eyebrow,
    catalogYear: normalizeCatalogYear(merged.catalogYear),
    totalCredits: Number(merged.totalCredits) || DEFAULT_SETTINGS.totalCredits,
    goalCourses: Array.isArray(merged.goalCourses) ? merged.goalCourses.map(item => String(item || '').trim()).filter(Boolean) : [],
    footerNote: String(merged.footerNote || '').trim(),
  };
}

function normalizeProfilePrefs(value) {
  const validInterests = new Set(PROFILE_INTEREST_DEFS.map(def => def.id));
  const interests = Array.from(new Set(Array.isArray(value?.interests) ? value.interests : []))
    .map(id => String(id || '').trim())
    .filter(id => validInterests.has(id));
  const careerGoal = String(value?.careerGoal || '').trim().slice(0, 160);
  const genEdDepts = Array.from(new Set(String(Array.isArray(value?.genEdDepts) ? value.genEdDepts.join(',') : value?.genEdDepts || '')
    .split(/[\s,;]+/)
    .map(s => s.trim().toUpperCase())
    .filter(s => /^[A-Z]{3,4}$/.test(s) && PROFILE_KNOWN_DEPTS.has(s))))
    .slice(0, 8);
  return { interests, careerGoal, genEdDepts };
}

function getProfilePrefs() {
  state.profilePrefs = normalizeProfilePrefs({ ...defaultProfilePrefs(), ...(state.profilePrefs || {}) });
  return state.profilePrefs;
}

function profileSelectedInterestDefs(prefs = getProfilePrefs()) {
  const selected = new Set(prefs.interests || []);
  return PROFILE_INTEREST_DEFS.filter(def => selected.has(def.id));
}

function profilePrimaryInterest(prefs = getProfilePrefs()) {
  return profileSelectedInterestDefs(prefs)[0] || null;
}

function profilePreferredDepartments(prefs = getProfilePrefs()) {
  const ordered = [];
  const add = dept => {
    if (dept && !ordered.includes(dept)) ordered.push(dept);
  };
  (prefs.genEdDepts || []).forEach(add);
  profileSelectedInterestDefs(prefs).forEach(def => (def.depts || []).forEach(add));
  return ordered.slice(0, 10);
}

function profileCourseMatch(course, prefs = getProfilePrefs()) {
  const selected = profileSelectedInterestDefs(prefs);
  if (!selected.length && !prefs.careerGoal && !(prefs.genEdDepts || []).length) {
    return { score: 0, labels: [] };
  }
  const norm = normalizeCode(course?.code || '');
  const dept = (norm.match(/^[A-Z]{3,4}/) || [''])[0];
  const hay = [
    course?.code,
    course?.title,
    course?.description,
    course?.note,
    course?.category,
    ...(Array.isArray(course?.categories) ? course.categories : []),
  ].join(' ').toLowerCase();
  let score = 0;
  const labels = [];
  selected.forEach(def => {
    let matched = false;
    if ((def.depts || []).includes(dept)) {
      score += 85;
      matched = true;
    }
    const hits = (def.keywords || []).filter(keyword => hay.includes(keyword));
    if (hits.length) {
      score += Math.min(95, hits.length * 35);
      matched = true;
    }
    if (matched) labels.push(def.label);
  });
  if ((prefs.genEdDepts || []).includes(dept)) {
    score += 60;
    labels.push(`${dept} GenEd preference`);
  }
  const goalWords = String(prefs.careerGoal || '').toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length >= 4);
  const goalHits = goalWords.filter(w => hay.includes(w)).slice(0, 3);
  if (goalHits.length) {
    score += goalHits.length * 28;
    labels.push('career fit');
  }
  return { score, labels: Array.from(new Set(labels)).slice(0, 3) };
}

function profileElectiveLabel(index, prefs = getProfilePrefs()) {
  const primary = profilePrimaryInterest(prefs);
  return primary ? `${primary.label} Elective ${index}` : `Free Elective ${index}`;
}

function profileElectiveNote(index, prefs = getProfilePrefs()) {
  const depts = profilePreferredDepartments(prefs).slice(0, 5);
  if (!depts.length && !prefs.careerGoal) {
    return 'Auto-generated credit placeholder. Replace with a minor, certificate, interest, or open elective course.';
  }
  const parts = [];
  if (depts.length) parts.push(`Start with ${depts.join(', ')}`);
  if (prefs.careerGoal) parts.push(`Goal: ${prefs.careerGoal}`);
  return `Personalized elective placeholder #${index}. ${parts.join(' · ')}.`;
}

function normalizeAccountEmail(value) {
  const email = String(value || '').trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
}

function defaultAccountPrefs() {
  return {
    planName: 'Primary TerpTrack plan',
    displayName: '',
    friendInviteEmail: '',
    friendInviteNote: '',
    friendInvites: [],
    lastCloudSaveAt: '',
    lastCloudLoadAt: '',
    lastFriendSyncAt: '',
    lastFriendPlanPublishAt: '',
    lastFriendPlanLoadAt: '',
  };
}

function normalizeAccountFriendInvite(invite, index = 0) {
  const email = normalizeAccountEmail(invite?.email || invite?.recipientEmail || invite?.recipient_email);
  if (!email) return null;
  const rawStatus = String(invite?.status || 'pending').toLowerCase();
  const status = ['pending', 'accepted', 'declined', 'blocked'].includes(rawStatus) ? rawStatus : 'pending';
  const rawDirection = String(invite?.direction || 'sent').toLowerCase();
  const direction = ['sent', 'received'].includes(rawDirection) ? rawDirection : 'sent';
  const rawSource = String(invite?.source || 'local').toLowerCase();
  const source = rawSource === 'cloud' ? 'cloud' : 'local';
  const rawId = String(invite?.id || '').trim();
  const cloudId = String(invite?.cloudId || invite?.cloud_id || (source === 'cloud' ? rawId : '')).trim();
  return {
    id: rawId || cloudId || `friend-${index + 1}`,
    cloudId,
    userId: String(invite?.userId || invite?.user_id || invite?.friendUserId || invite?.requester_id || invite?.recipient_id || '').trim(),
    email,
    note: String(invite?.note || '').trim().slice(0, 180),
    status,
    direction,
    source,
    createdAt: String(invite?.createdAt || invite?.created_at || ''),
    updatedAt: String(invite?.updatedAt || invite?.updated_at || ''),
  };
}

function normalizeAccountPrefs(value) {
  const base = defaultAccountPrefs();
  const merged = { ...base, ...(value || {}) };
  const invites = (Array.isArray(merged.friendInvites) ? merged.friendInvites : [])
    .map((invite, index) => normalizeAccountFriendInvite(invite, index))
    .filter(Boolean)
    .slice(0, 30);
  return {
    ...base,
    ...merged,
    planName: String(merged.planName || base.planName).trim().slice(0, 90) || base.planName,
    displayName: String(merged.displayName || '').trim().slice(0, 80),
    friendInviteEmail: normalizeAccountEmail(merged.friendInviteEmail),
    friendInviteNote: String(merged.friendInviteNote || '').trim().slice(0, 180),
    friendInvites: invites,
    lastCloudSaveAt: String(merged.lastCloudSaveAt || ''),
    lastCloudLoadAt: String(merged.lastCloudLoadAt || ''),
    lastFriendSyncAt: String(merged.lastFriendSyncAt || ''),
    lastFriendPlanPublishAt: String(merged.lastFriendPlanPublishAt || ''),
    lastFriendPlanLoadAt: String(merged.lastFriendPlanLoadAt || ''),
  };
}

function normalizeBrowseSavedSearch(search, index = 0) {
  const dept = String(search?.dept || '').trim().toUpperCase();
  const genEd = String(search?.genEd || '').trim().toUpperCase();
  const query = String(search?.search || search?.query || '').trim().slice(0, 80);
  const safeDept = dept === '__PROFILE_DEPTS__' || dept === '__ALL_DEPTS__' || /^[A-Z]{3,4}$/.test(dept) ? dept : '';
  const safeGenEd = genEd === '__ALL_GENEDS__' || /^[A-Z0-9-]{4,16}$/.test(genEd) ? genEd : '';
  if (!safeDept && !safeGenEd && !query) return null;
  const deptLabel = safeDept === '__PROFILE_DEPTS__' ? 'Profile departments'
    : safeDept === '__ALL_DEPTS__' ? 'All departments'
      : safeDept;
  const fallbackLabel = [deptLabel, safeGenEd, query].filter(Boolean).join(' · ') || `Saved search ${index + 1}`;
  const fallbackId = `browse-search-${index + 1}`;
  const id = String(search?.id || fallbackId).trim().slice(0, 60) || fallbackId;
  return {
    id,
    label: String(search?.label || fallbackLabel).trim().slice(0, 90) || fallbackLabel,
    dept: safeDept,
    genEd: safeGenEd,
    search: query,
    createdAt: String(search?.createdAt || search?.created_at || ''),
  };
}

function normalizeBrowseSavedSearches(value) {
  return (Array.isArray(value) ? value : [])
    .map((search, index) => normalizeBrowseSavedSearch(search, index))
    .filter(Boolean)
    .slice(0, 12);
}

function statePlanSemesters(planState = {}) {
  const active = Array.isArray(planState.activeSchedule) && planState.activeSchedule.length
    ? planState.activeSchedule
    : (typeof SCHEDULE !== 'undefined' && Array.isArray(SCHEDULE) ? SCHEDULE : []);
  return [
    ...active,
    ...(Array.isArray(planState.customSemesters) ? planState.customSemesters : []),
  ].filter(sem => sem && sem.id && Array.isArray(sem.courses));
}

function stateDisplayCode(code) {
  const id = normalizeCode(code);
  const match = id.match(/^([A-Z]{3,4})(\d{3}[A-Z]?)$/);
  return match ? `${match[1]} ${match[2]}` : String(code || '').trim();
}

function stateSelectedSectionLike(value) {
  return typeof value === 'string'
    || !!(value && typeof value === 'object' && (
      value.section_id
      || value.number
      || value.course
      || Array.isArray(value.meetings)
    ));
}

function stateCloneValue(value) {
  if (!value || typeof value !== 'object') return value;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return { ...value };
  }
}

function stateNormalizeSectionValue(rawSection, code) {
  const norm = normalizeCode(code);
  const course = stateDisplayCode(code || norm);
  if (typeof rawSection === 'string') {
    const number = rawSection.trim();
    return {
      course,
      section_id: number && !number.includes('-') ? `${norm}-${number}` : number,
      number,
      meetings: [],
    };
  }
  const section = stateCloneValue(rawSection) || {};
  const number = String(section.number || section.section || section.section_number || '').trim();
  return {
    ...section,
    course: stateDisplayCode(section.course || course || norm),
    section_id: section.section_id || (number ? `${norm}-${number}` : ''),
    number: section.number || number,
    meetings: Array.isArray(section.meetings) ? section.meetings : [],
  };
}

function stateInferSemesterTerm(sem) {
  const name = `${sem && sem.name || ''} ${sem && sem.id || ''}`;
  const yearMatch = name.match(/\b(20\d{2})\b/);
  const shortYear = (sem && sem.id || '').match(/(\d{2})$/);
  const year = yearMatch ? parseInt(yearMatch[1], 10)
    : shortYear ? 2000 + parseInt(shortYear[1], 10)
      : new Date().getFullYear();
  if (/summer|sum/i.test(name)) return `${year}05`;
  if (/fall|\bF\d{2}\b/i.test(name)) return `${year}08`;
  if (/winter/i.test(name)) return `${year}12`;
  return `${year}01`;
}

function stateSemesterTerm(sem, planState = {}) {
  return String(
    (planState.schedulePrefs || {})[sem.id]?.term
    || sem.term
    || sem.semester
    || stateInferSemesterTerm(sem)
    || ''
  ).trim();
}

function stateSemIdForSelectedCourse(code, section, planState = {}) {
  const norm = normalizeCode(code || section?.course || '');
  if (!norm) return '';
  const matches = statePlanSemesters(planState)
    .filter(sem => (sem.courses || []).some(course => normalizeCode(course.code) === norm));
  if (!matches.length) return '';
  const sectionTerm = String(section?.semester || '').trim();
  if (sectionTerm) {
    const termMatch = matches.find(sem => stateSemesterTerm(sem, planState) === sectionTerm);
    if (termMatch) return termMatch.id;
  }
  return matches[0].id;
}

function stateSectionBelongsInSem(semId, code, section, planState = {}) {
  const norm = normalizeCode(code || section?.course || '');
  if (!semId || !norm) return false;
  const sem = statePlanSemesters(planState).find(item => String(item.id) === String(semId));
  if (!sem || !(sem.courses || []).some(course => normalizeCode(course.code) === norm)) return false;
  const sectionTerm = String(section?.semester || '').trim();
  const semTerm = stateSemesterTerm(sem, planState);
  return !sectionTerm || !semTerm || sectionTerm === semTerm;
}

function stateSemIdForBucketedSection(semId, code, section, planState = {}) {
  if (stateSectionBelongsInSem(semId, code, section, planState)) return semId;
  return stateSemIdForSelectedCourse(code, section, planState);
}

function stateAddSelectedSection(bucket, semId, code, section) {
  const norm = normalizeCode(code || section?.course || '');
  if (!semId || !norm || !section) return false;
  bucket[semId] = bucket[semId] || {};
  bucket[semId][norm] = stateNormalizeSectionValue(section, code || section.course || norm);
  return true;
}

function normalizeSelectedSectionsForPlan(selectedSections, planState = {}) {
  const source = selectedSections && typeof selectedSections === 'object' ? selectedSections : {};
  const normalized = {};
  const unplaced = {};
  Object.entries(source).forEach(([semOrCode, value]) => {
    if (!value) return;
    if (stateSelectedSectionLike(value)) {
      const section = stateNormalizeSectionValue(value, semOrCode);
      const semId = stateSemIdForSelectedCourse(semOrCode, section, planState);
      if (!stateAddSelectedSection(normalized, semId, semOrCode, section)) unplaced[semOrCode] = value;
      return;
    }
    Object.entries(value || {}).forEach(([code, rawSection]) => {
      if (!rawSection) return;
      const section = stateNormalizeSectionValue(rawSection, code);
      const semId = stateSemIdForBucketedSection(semOrCode, code, section, planState);
      if (!stateAddSelectedSection(normalized, semId, code, section)) {
        stateAddSelectedSection(normalized, semOrCode, code, section);
      }
    });
  });
  return Object.keys(unplaced).length ? { ...normalized, ...unplaced } : normalized;
}

function clearSelectedSectionForCourse(semId, code) {
  const key = normalizeCode(code);
  const bucket = state.selectedSections && state.selectedSections[semId];
  if (!key || !bucket || !bucket[key]) return false;
  delete bucket[key];
  if (!Object.keys(bucket).length) delete state.selectedSections[semId];
  return true;
}

function clearSelectedSectionsForCourse(code, semIds = null) {
  const key = normalizeCode(code);
  if (!key || !state.selectedSections) return 0;
  const targetSemIds = Array.isArray(semIds) && semIds.length
    ? Array.from(new Set(semIds.filter(Boolean)))
    : Object.keys(state.selectedSections || {});
  let removed = targetSemIds.reduce((count, semId) => count + (clearSelectedSectionForCourse(semId, key) ? 1 : 0), 0);
  Object.entries(state.selectedSections || {}).forEach(([semOrCode, value]) => {
    if (normalizeCode(semOrCode) === key && stateSelectedSectionLike(value)) {
      delete state.selectedSections[semOrCode];
      removed += 1;
    }
  });
  return removed;
}

function clearSemesterPlanningState(semId) {
  let changed = false;
  if (state.schedulePrefs && state.schedulePrefs[semId]) {
    delete state.schedulePrefs[semId];
    changed = true;
  }
  if (state.selectedSections && state.selectedSections[semId]) {
    delete state.selectedSections[semId];
    changed = true;
  }
  return changed;
}

function removeCustomCourseFromPlan(code) {
  const key = normalizeCode(code);
  if (!key) return { removed: 0, clearedSections: 0 };
  const removedCourses = (state.customCourses || []).filter(course => normalizeCode(course.code) === key);
  if (!removedCourses.length) return { removed: 0, clearedSections: 0 };
  state.customCourses = (state.customCourses || []).filter(course => normalizeCode(course.code) !== key);
  let clearedSections = 0;
  removedCourses.forEach(course => {
    deleteCourseState(course.code);
    clearedSections += clearSelectedSectionsForCourse(course.code);
  });
  return { removed: removedCourses.length, clearedSections };
}

function removeCustomSemesterFromPlan(semId) {
  const removedSemester = (state.customSemesters || []).some(sem => sem.id === semId);
  const removedCourses = (state.customCourses || []).filter(course => course.semId === semId);
  state.customSemesters = (state.customSemesters || []).filter(sem => sem.id !== semId);
  state.customCourses = (state.customCourses || []).filter(course => course.semId !== semId);
  const clearedSemesterState = clearSemesterPlanningState(semId);
  let clearedSections = clearedSemesterState ? 1 : 0;
  removedCourses.forEach(course => {
    deleteCourseState(course.code);
    clearedSections += clearSelectedSectionsForCourse(course.code);
  });
  return {
    removedSemester,
    removedCourses: removedCourses.length,
    clearedSections,
  };
}

function loadState() {
  const fallback = {
    courses: {},
    customCourses: [],
    customSemesters: [],
    customMajors: [],
    snapshots: [],
    activeSchedule: null,
    selectedSections: {},
    schedulePrefs: {},
    scheduleAdvisorFilter: 'all',
    scheduleOutputPreset: 'personal',
    scheduleOutputOptions: { preferences: true, warnings: true, unscheduled: true, recentChanges: true, auditIssues: true },
    roadmapPrefs: { filter: 'all', query: '', selectedCode: '' },
    browseSavedSearches: [],
    recentChanges: [],
    majorId: null,
    accountPrefs: defaultAccountPrefs(),
    profilePrefs: defaultProfilePrefs(),
    onboardingComplete: false,
    settings: normalizeSettings(DEFAULT_SETTINGS),
    welcomeDismissed: false,
    theme: "dark",
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const mergedState = {
        ...fallback,
        ...parsed,
        customSemesters: parsed.customSemesters || [],
        schedulePrefs: parsed.schedulePrefs || {},
      };
      return {
        ...mergedState,
        settings: normalizeSettings({ ...DEFAULT_SETTINGS, ...(parsed.settings || {}) }),
        customSemesters: parsed.customSemesters || [],
        selectedSections: normalizeSelectedSectionsForPlan(parsed.selectedSections || {}, mergedState),
        schedulePrefs: parsed.schedulePrefs || {},
        scheduleAdvisorFilter: ['all', 'remaining', 'gened', 'blockers'].includes(parsed.scheduleAdvisorFilter) ? parsed.scheduleAdvisorFilter : 'all',
        scheduleOutputPreset: ['personal', 'advisor', 'registrar', 'custom'].includes(parsed.scheduleOutputPreset) ? parsed.scheduleOutputPreset : 'personal',
        scheduleOutputOptions: { ...fallback.scheduleOutputOptions, ...(parsed.scheduleOutputOptions || {}) },
        roadmapPrefs: { filter: 'all', query: '', selectedCode: '', ...(parsed.roadmapPrefs || {}) },
        browseSavedSearches: normalizeBrowseSavedSearches(parsed.browseSavedSearches),
        recentChanges: Array.isArray(parsed.recentChanges) ? parsed.recentChanges.slice(0, 12) : [],
        accountPrefs: normalizeAccountPrefs({ ...fallback.accountPrefs, ...(parsed.accountPrefs || {}) }),
        profilePrefs: normalizeProfilePrefs({ ...fallback.profilePrefs, ...(parsed.profilePrefs || {}) }),
      };
    }
  } catch {}
  // migrate from v1 if present
  try {
    const oldRaw = localStorage.getItem("terp-track-v1");
    if (oldRaw) {
      const old = JSON.parse(oldRaw);
      return { ...fallback, courses: old };
    }
  } catch {}
  return fallback;
}

function getSettings() {
  state.settings = normalizeSettings({ ...DEFAULT_SETTINGS, ...(state.settings || {}) });
  return state.settings;
}
function getGoalCodes() {
  const fromSettings = (getSettings().goalCourses || []).map(s => s.trim()).filter(Boolean);
  // Always include any course flagged isGoal in the data (legacy + custom)
  const fromData = flatCourses().filter(c => c.isGoal).map(c => c.code);
  return Array.from(new Set([...fromSettings, ...fromData]));
}
function isGoalCourse(course) {
  if (course.isGoal) return true;
  return (getSettings().goalCourses || []).map(s => s.trim()).includes(course.code);
}
function getAllSemesters() {
  const base = (state.activeSchedule && state.activeSchedule.length)
    ? state.activeSchedule
    : SCHEDULE;
  return [...base, ...(state.customSemesters || [])];
}

let state = loadState();
let currentTab = "plan";
let currentFilter = "all";
let searchQuery = "";

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const ind = document.getElementById('save-indicator');
  ind.classList.add('show');
  clearTimeout(saveState._t);
  saveState._t = setTimeout(() => ind.classList.remove('show'), 1100);
}

function cleanPlanChangeUndo(value) {
  if (!value || typeof value !== 'object' || !value.kind) return null;
  try {
    const json = JSON.stringify(value);
    if (!json || json.length > 12000) return null;
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function recordPlanChange(change, opts = {}) {
  const highlights = (Array.isArray(change.highlights) ? change.highlights : [])
    .map(item => String(item || '').trim().slice(0, 180))
    .filter(Boolean)
    .slice(0, 6);
  const undo = cleanPlanChangeUndo(change.undo);
  const clean = {
    id: `change-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
    at: new Date().toISOString(),
    type: change.type || 'plan',
    source: change.source || '',
    title: String(change.title || 'Plan changed').slice(0, 120),
    detail: String(change.detail || '').slice(0, 220),
    meta: String(change.meta || '').slice(0, 140),
  };
  if (highlights.length) clean.highlights = highlights;
  if (undo) clean.undo = undo;
  state.recentChanges = [clean, ...(state.recentChanges || [])].slice(0, 12);
  if (opts.save !== false) saveState();
  return clean;
}

function recentPlanChanges() {
  return Array.isArray(state.recentChanges) ? state.recentChanges : [];
}

function clearPlanChanges() {
  state.recentChanges = [];
  saveState();
  if (currentTab === 'timeline' && typeof renderPlanChangeHistory === 'function') renderPlanChangeHistory();
}

function courseStateKey(code) {
  const raw = String(code || '').trim();
  if (!raw) return '';
  state.courses = state.courses || {};
  if (Object.prototype.hasOwnProperty.call(state.courses, raw)) return raw;
  const norm = normalizeCode(raw);
  const existing = Object.keys(state.courses).find(key => normalizeCode(key) === norm);
  if (existing) return existing;
  const planned = flatCourses().find(course => normalizeCode(course.code) === norm);
  return planned?.code || raw;
}
function getCourseState(code) {
  const key = courseStateKey(code);
  return key && state.courses[key] || { status: "not-started", grade: "" };
}
function deleteCourseState(code) {
  const key = courseStateKey(code);
  if (!key || !Object.prototype.hasOwnProperty.call(state.courses, key)) return false;
  delete state.courses[key];
  return true;
}
function setCourseState(code, patch) {
  const key = courseStateKey(code);
  if (!key) return;
  state.courses[key] = { ...getCourseState(key), ...patch };
  saveState();
  render();
}

function flatCourses() {
  const all = [];
  getAllSemesters().forEach(s => (s.courses || []).forEach(c => all.push({ ...c, semId: s.id })));
  (state.customCourses || []).forEach(c => all.push(c));
  return all;
}
function normalizeCode(code) {
  return (code || '').toUpperCase().replace(/\s+/g, '');
}
function findCourse(code) {
  const courses = flatCourses();
  const exact = courses.find(c => c.code === code);
  if (exact) return exact;
  const norm = normalizeCode(code);
  return norm ? courses.find(c => normalizeCode(c.code) === norm) : null;
}

function _isPassed(code) {
  const s = getCourseState(code);
  return s.status === "passed" || s.status === "transfer";
}

// AND-of-OR semantics: every group must have at least one passed alternative.
// Falls back to flat AND list when prereqGroups is absent (legacy data).
function prereqsMet(course) {
  if (Array.isArray(course.prereqGroups) && course.prereqGroups.length) {
    for (const group of course.prereqGroups) {
      if (!group.length) continue;
      const groupMet = group.some(_isPassed);
      if (!groupMet) return { met: false, missing: group.join(' or '), missingGroup: group };
    }
    return { met: true };
  }
  for (const pre of (course.prereqs || [])) {
    if (!_isPassed(pre)) return { met: false, missing: pre };
  }
  return { met: true };
}

// Lazily copy SCHEDULE into state.activeSchedule so semester structure
// is mutable (needed for drag-drop, bulk-mark, etc).
function mutableSchedule() {
  if (!state.activeSchedule || !state.activeSchedule.length) {
    state.activeSchedule = JSON.parse(JSON.stringify(SCHEDULE));
  }
  return state.activeSchedule;
}
