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
    scheduleOutputOptions: { preferences: true, warnings: true, unscheduled: true, recentChanges: true },
    roadmapPrefs: { filter: 'all', query: '', selectedCode: '' },
    recentChanges: [],
    majorId: null,
    accountPrefs: defaultAccountPrefs(),
    profilePrefs: defaultProfilePrefs(),
    onboardingComplete: false,
    settings: { ...DEFAULT_SETTINGS },
    welcomeDismissed: false,
    theme: "dark",
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...fallback,
        ...parsed,
        settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
        customSemesters: parsed.customSemesters || [],
        selectedSections: parsed.selectedSections || {},
        schedulePrefs: parsed.schedulePrefs || {},
        scheduleAdvisorFilter: ['all', 'remaining', 'gened', 'blockers'].includes(parsed.scheduleAdvisorFilter) ? parsed.scheduleAdvisorFilter : 'all',
        scheduleOutputPreset: ['personal', 'advisor', 'registrar', 'custom'].includes(parsed.scheduleOutputPreset) ? parsed.scheduleOutputPreset : 'personal',
        scheduleOutputOptions: { ...fallback.scheduleOutputOptions, ...(parsed.scheduleOutputOptions || {}) },
        roadmapPrefs: { filter: 'all', query: '', selectedCode: '', ...(parsed.roadmapPrefs || {}) },
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

function getSettings() { return state.settings || DEFAULT_SETTINGS; }
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

function recordPlanChange(change, opts = {}) {
  const highlights = (Array.isArray(change.highlights) ? change.highlights : [])
    .map(item => String(item || '').trim().slice(0, 180))
    .filter(Boolean)
    .slice(0, 6);
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

function getCourseState(code) {
  return state.courses[code] || { status: "not-started", grade: "" };
}
function setCourseState(code, patch) {
  state.courses[code] = { ...getCourseState(code), ...patch };
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
  return flatCourses().find(c => c.code === code);
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
