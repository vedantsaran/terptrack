'use strict';
/* ============================================================
   STATE
   ============================================================ */
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
    roadmapPrefs: { filter: 'all', query: '', selectedCode: '' },
    recentChanges: [],
    majorId: null,
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
        roadmapPrefs: { filter: 'all', query: '', selectedCode: '', ...(parsed.roadmapPrefs || {}) },
        recentChanges: Array.isArray(parsed.recentChanges) ? parsed.recentChanges.slice(0, 12) : [],
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
  const clean = {
    id: `change-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
    at: new Date().toISOString(),
    type: change.type || 'plan',
    source: change.source || '',
    title: String(change.title || 'Plan changed').slice(0, 120),
    detail: String(change.detail || '').slice(0, 220),
    meta: String(change.meta || '').slice(0, 140),
  };
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
