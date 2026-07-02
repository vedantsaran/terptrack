'use strict';
/* ============================================================
   WEEKLY SCHEDULE BUILDER
   ============================================================ */

const SCHEDULE_DAY_DEFS = [
  { key: 'M', label: 'Mon' },
  { key: 'Tu', label: 'Tue' },
  { key: 'W', label: 'Wed' },
  { key: 'Th', label: 'Thu' },
  { key: 'F', label: 'Fri' },
];
const DEFAULT_SCHEDULE_PREFS = {
  earliest: '',
  latest: '',
  minBreak: 15,
  mode: 'balanced',
  avoidDays: [],
  blockedTimes: [],
  campusZone: '',
  commuteStart: '',
  commuteEnd: '',
  locationWeight: 'normal',
  calendarStart: '',
  calendarEnd: '',
  registrationDate: '',
  registrationTime: '',
};
const SCHEDULE_SECTION_ELIGIBILITY_FIELDS = [
  'restriction',
  'restrictions',
  'course_restrictions',
  'section_restrictions',
  'registration_restrictions',
  'enrollment_restrictions',
  'eligibility',
  'permissions',
  'permission',
  'section_info',
  'section_notes',
  'registration_notes',
  'enrollment_notes',
  'notes',
  'note',
  'special_notes',
  'additional_info',
  'additional_information',
];
const SCHEDULE_SECTION_ELIGIBILITY_KEYWORD = /\b(restrict|permission|consent|approval|major|majors|college|program|department|school|honors|scholars|freshman|sophomore|junior|senior|graduate|undergraduate|student|students|admitted|admission|enrolled|reserved|reserve|requires?|must|only)\b/i;
const SCHEDULE_SECTION_ELIGIBILITY_IGNORE = /\b(no|none|not)\s+(section\s+)?(restriction|restrictions|permission|permissions|required|requirements?)\b/i;
const BUILDING_COORDS = {
  IRB: [0, 0],
  CSI: [1, 0],
  AVW: [1.4, .1],
  AJC: [1.7, .1],
  EGR: [2.1, .2],
  JMP: [2.4, .4],
  TWS: [2.7, .8],
  PHY: [2.1, 1.2],
  CHE: [2.6, 1.5],
  CHM: [2.6, 1.5],
  HJP: [3.8, 1.0],
  ESJ: [4.1, 1.1],
  KEY: [4.6, 1.3],
  TLF: [4.9, 1.6],
  EDU: [5.3, 1.9],
  SKN: [5.6, 2.4],
  JMZ: [4.8, 2.0],
  ARM: [4.4, 2.3],
  HBK: [3.3, 2.8],
  SQH: [3.8, 2.6],
  TYD: [4.2, 2.7],
  VMH: [5.0, 3.2],
};
const CAMPUS_ZONE_DEFS = [
  { id: '', label: 'Any campus area' },
  { id: 'north', label: 'North campus/STEM', coord: [0.9, 0.2], buildings: ['IRB', 'CSI', 'AVW', 'AJC'] },
  { id: 'science', label: 'Engineering + sciences', coord: [2.4, 0.9], buildings: ['EGR', 'JMP', 'TWS', 'PHY', 'CHE', 'CHM'] },
  { id: 'central', label: 'Central mall', coord: [4.3, 1.45], buildings: ['HJP', 'ESJ', 'KEY', 'TLF'] },
  { id: 'library', label: 'McKeldin/Library', coord: [3.75, 2.65], buildings: ['HBK', 'SQH', 'TYD'] },
  { id: 'south', label: 'South campus/arts', coord: [5.15, 2.55], buildings: ['EDU', 'SKN', 'JMZ', 'ARM', 'VMH'] },
];
const CAMPUS_ANCHOR_DEFS = [
  { id: '', label: 'No anchor' },
  { id: 'north-dorms', label: 'North residence halls', coord: [0.25, 0.45] },
  { id: 'south-dorms', label: 'South residence halls', coord: [5.35, 3.1] },
  { id: 'stamp', label: 'Stamp transit center', coord: [3.55, 1.75] },
  { id: 'mowatt', label: 'Mowatt/Regents garages', coord: [4.8, 2.45] },
  { id: 'metro', label: 'College Park Metro shuttle', coord: [3.15, 2.85] },
];
const LOCATION_WEIGHT_MULTIPLIERS = {
  light: .65,
  normal: 1,
  strong: 1.55,
};
const SCHEDULE_ADVISOR_FILTERS = [
  { id: 'all', label: 'All', heading: 'Full Semester Plan', description: 'Every planned course across every term.' },
  { id: 'remaining', label: 'Remaining', heading: 'Remaining Plan', description: 'Courses not yet passed or transferred.' },
  { id: 'gened', label: 'Gen-Eds', heading: 'GenEd Plan', description: 'Only courses counting toward General Education coverage.' },
  { id: 'blockers', label: 'Blockers', heading: 'Registration Blockers', description: 'Locked courses, unscheduled current-term courses, conflicts, warnings, and repeats.' },
];
const DEFAULT_SCHEDULE_OUTPUT_OPTIONS = {
  preferences: true,
  warnings: true,
  unscheduled: true,
  recentChanges: true,
  auditIssues: true,
};
const SCHEDULE_OUTPUT_OPTION_DEFS = [
  { id: 'preferences', label: 'Preferences' },
  { id: 'warnings', label: 'Warnings' },
  { id: 'unscheduled', label: 'Unscheduled' },
  { id: 'recentChanges', label: 'Recent changes' },
  { id: 'auditIssues', label: 'Audit issues' },
];
const SCHEDULE_OUTPUT_PRESET_DEFS = [
  {
    id: 'personal',
    label: 'Personal',
    advisorFilter: 'all',
    description: 'Full schedule, full plan, preferences, warnings, unscheduled work, and recent changes.',
    options: { preferences: true, warnings: true, unscheduled: true, recentChanges: true, auditIssues: true },
  },
  {
    id: 'advisor',
    label: 'Advisor',
    advisorFilter: 'blockers',
    description: 'Blocker-focused advisor packet with warnings, follow-up items, preferences, and recent changes.',
    options: { preferences: true, warnings: true, unscheduled: true, recentChanges: true, auditIssues: true },
  },
  {
    id: 'registrar',
    label: 'Registrar',
    advisorFilter: 'remaining',
    description: 'Registration-ready facts without personal preference notes or edit history.',
    options: { preferences: false, warnings: true, unscheduled: true, recentChanges: false, auditIssues: true },
  },
];

let scheduleCurrentSemId = '';
let schedulePostedTerms = null;
let scheduleTermLoadStarted = false;
let scheduleRenderSeq = 0;
let scheduleAlternatives = [];
let scheduleOutputCache = null;
let scheduleUndoAction = null;
let scheduleReadinessMapLoading = false;
let scheduleReadinessMapPicking = false;
const scheduleSectionsCache = {};
const scheduleSectionsMeta = {};
const SCHEDULE_SEAT_WARN_MS = 15 * 60 * 1000;
const SCHEDULE_SEAT_STALE_MS = 60 * 60 * 1000;

function scheduleEscape(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

function scheduleCloneSection(section) {
  if (!section) return null;
  try {
    return JSON.parse(JSON.stringify(section));
  } catch {
    return { ...section };
  }
}

function scheduleSectionShortLabel(section) {
  if (!section) return 'no section';
  return section.number || section.section_id || 'section';
}

function scheduleNoteFieldLabel(key) {
  return String(key || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, ch => ch.toUpperCase());
}

function scheduleFlattenNoteValue(value, prefix = '', depth = 0) {
  if (value == null || depth > 4) return [];
  if (typeof value === 'boolean') {
    return value ? [prefix ? `${prefix}: yes` : 'Yes'] : [];
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const text = String(value).replace(/\s+/g, ' ').trim();
    if (!text) return [];
    return [prefix ? `${prefix}: ${text}` : text];
  }
  if (Array.isArray(value)) {
    return value.flatMap(item => scheduleFlattenNoteValue(item, prefix, depth + 1));
  }
  if (typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) => {
      const label = scheduleNoteFieldLabel(key);
      if (child == null || child === '') return [];
      if (typeof child === 'string' || typeof child === 'number' || typeof child === 'boolean') {
        return scheduleFlattenNoteValue(child, label || prefix, depth + 1);
      }
      return scheduleFlattenNoteValue(child, label || prefix, depth + 1);
    });
  }
  return [];
}

function sectionEligibilityTexts(section) {
  if (!section || typeof section !== 'object') return [];
  const texts = [];
  Object.entries(section).forEach(([key, value]) => {
    const normalizedKey = String(key || '').toLowerCase();
    const isEligibilityField = SCHEDULE_SECTION_ELIGIBILITY_FIELDS.includes(normalizedKey)
      || /(?:restrict|permission|eligib|enrollment|registration).*?(?:note|info|require|restrict|permission)?/.test(normalizedKey);
    if (!isEligibilityField) return;
    const fieldRequiresKeyword = !/(restrict|permission|eligib)/.test(normalizedKey);
    scheduleFlattenNoteValue(value).forEach(text => {
      const clean = text.replace(/\s+/g, ' ').trim();
      if (!clean || SCHEDULE_SECTION_ELIGIBILITY_IGNORE.test(clean)) return;
      if (fieldRequiresKeyword && !SCHEDULE_SECTION_ELIGIBILITY_KEYWORD.test(clean)) return;
      texts.push(clean);
    });
  });
  return Array.from(new Set(texts)).slice(0, 5);
}

function sectionEligibilityStatus(section) {
  const notes = sectionEligibilityTexts(section);
  if (!notes.length) {
    return {
      level: 'ok',
      label: 'No posted restriction',
      detail: 'No section restrictions posted in available UMD data.',
      notes,
    };
  }
  const danger = notes.some(note => /\b(restricted|permission|consent|approval|department|major|majors|college|program|honors|reserved|reserve|requires?|must|only)\b/i.test(note));
  return {
    level: danger ? 'danger' : 'warn',
    label: danger ? 'Check eligibility' : 'Review eligibility',
    detail: notes.slice(0, 2).join(' · '),
    notes,
  };
}

function renderSectionEligibilityRow(section) {
  const eligibility = sectionEligibilityStatus(section);
  if (!eligibility.notes.length) return '';
  return `
    <div class="section-eligibility-row ${scheduleEscape(eligibility.level)}">
      <span class="section-eligibility-badge">${scheduleEscape(eligibility.label)}</span>
      <span>${scheduleEscape(eligibility.detail)}</span>
    </div>
  `;
}

function parseClockValue(value) {
  const raw = String(value || '').trim();
  const m = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

function scheduleDefById(defs, id) {
  return defs.find(def => def.id === id) || defs[0];
}

function normalizeScheduleAdvisorFilter(value) {
  const raw = String(value || 'all');
  return SCHEDULE_ADVISOR_FILTERS.some(filter => filter.id === raw) ? raw : 'all';
}

function scheduleAdvisorFilterDef(value) {
  const id = normalizeScheduleAdvisorFilter(value);
  return SCHEDULE_ADVISOR_FILTERS.find(filter => filter.id === id) || SCHEDULE_ADVISOR_FILTERS[0];
}

function getScheduleAdvisorFilter() {
  const next = normalizeScheduleAdvisorFilter(state.scheduleAdvisorFilter);
  if (state.scheduleAdvisorFilter !== next) state.scheduleAdvisorFilter = next;
  return next;
}

function setScheduleAdvisorFilter(value) {
  const next = normalizeScheduleAdvisorFilter(value);
  if (getScheduleAdvisorFilter() === next) return;
  state.scheduleAdvisorFilter = next;
  state.scheduleOutputPreset = scheduleInferOutputPreset(getScheduleOutputOptions(), next);
  saveState();
  renderSchedule();
}

function normalizeScheduleOutputOptions(value) {
  const saved = value && typeof value === 'object' ? value : {};
  return Object.fromEntries(SCHEDULE_OUTPUT_OPTION_DEFS.map(def => [
    def.id,
    saved[def.id] === undefined ? DEFAULT_SCHEDULE_OUTPUT_OPTIONS[def.id] : saved[def.id] !== false,
  ]));
}

function getScheduleOutputOptions() {
  const next = normalizeScheduleOutputOptions(state.scheduleOutputOptions);
  const changed = !state.scheduleOutputOptions
    || SCHEDULE_OUTPUT_OPTION_DEFS.some(def => state.scheduleOutputOptions[def.id] !== next[def.id]);
  if (changed) state.scheduleOutputOptions = next;
  return next;
}

function setScheduleOutputOption(id, checked) {
  if (!SCHEDULE_OUTPUT_OPTION_DEFS.some(def => def.id === id)) return;
  state.scheduleOutputOptions = { ...getScheduleOutputOptions(), [id]: Boolean(checked) };
  state.scheduleOutputPreset = scheduleInferOutputPreset(state.scheduleOutputOptions, getScheduleAdvisorFilter());
  saveState();
  renderSchedule();
}

function schedulePresetDef(value) {
  const id = String(value || '');
  return SCHEDULE_OUTPUT_PRESET_DEFS.find(def => def.id === id) || null;
}

function scheduleOutputPresetMatches(def, options = getScheduleOutputOptions(), advisorFilter = getScheduleAdvisorFilter()) {
  if (!def) return false;
  const normalized = normalizeScheduleOutputOptions(options);
  return normalizeScheduleAdvisorFilter(advisorFilter) === def.advisorFilter
    && SCHEDULE_OUTPUT_OPTION_DEFS.every(option => normalized[option.id] === def.options[option.id]);
}

function scheduleInferOutputPreset(options = getScheduleOutputOptions(), advisorFilter = getScheduleAdvisorFilter()) {
  const match = SCHEDULE_OUTPUT_PRESET_DEFS.find(def => scheduleOutputPresetMatches(def, options, advisorFilter));
  return match ? match.id : 'custom';
}

function getScheduleOutputPreset(options = getScheduleOutputOptions(), advisorFilter = getScheduleAdvisorFilter()) {
  const next = scheduleInferOutputPreset(options, advisorFilter);
  if (state.scheduleOutputPreset !== next) state.scheduleOutputPreset = next;
  return next;
}

function setScheduleOutputPreset(value) {
  const def = schedulePresetDef(value);
  if (!def) return;
  state.scheduleOutputPreset = def.id;
  state.scheduleAdvisorFilter = def.advisorFilter;
  state.scheduleOutputOptions = normalizeScheduleOutputOptions(def.options);
  saveState();
  renderSchedule();
}

function normalizeScheduleChoice(defs, value) {
  const raw = String(value || '');
  return defs.some(def => def.id === raw) ? raw : '';
}

function normalizeScheduleDate(value) {
  const raw = String(value || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return '';
  const date = new Date(`${raw}T12:00:00Z`);
  return Number.isNaN(date.getTime()) ? '' : raw;
}

function normalizeScheduleTime(value) {
  const raw = String(value || '').trim();
  return parseClockValue(raw) === null ? '' : raw;
}

function getSchedulePrefs(semId) {
  const saved = (state.schedulePrefs || {})[semId] || {};
  const calendarStart = normalizeScheduleDate(saved.calendarStart);
  const calendarEnd = normalizeScheduleDate(saved.calendarEnd);
  return {
    ...DEFAULT_SCHEDULE_PREFS,
    ...saved,
    avoidDays: Array.isArray(saved.avoidDays) ? saved.avoidDays : [],
    blockedTimes: Array.isArray(saved.blockedTimes)
      ? saved.blockedTimes
        .filter(block => block && block.day && block.start && block.end)
        .map(block => ({
          id: block.id || `block-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          day: block.day,
          start: block.start,
          end: block.end,
          label: block.label || 'Unavailable',
        }))
      : [],
    minBreak: Number.isFinite(Number(saved.minBreak)) ? Number(saved.minBreak) : DEFAULT_SCHEDULE_PREFS.minBreak,
    campusZone: normalizeScheduleChoice(CAMPUS_ZONE_DEFS, saved.campusZone),
    commuteStart: normalizeScheduleChoice(CAMPUS_ANCHOR_DEFS, saved.commuteStart),
    commuteEnd: normalizeScheduleChoice(CAMPUS_ANCHOR_DEFS, saved.commuteEnd),
    locationWeight: LOCATION_WEIGHT_MULTIPLIERS[saved.locationWeight] ? saved.locationWeight : DEFAULT_SCHEDULE_PREFS.locationWeight,
    calendarStart,
    calendarEnd: calendarStart && calendarEnd && calendarEnd < calendarStart ? '' : calendarEnd,
    registrationDate: normalizeScheduleDate(saved.registrationDate),
    registrationTime: normalizeScheduleTime(saved.registrationTime),
  };
}

function setSchedulePrefs(semId, patch) {
  state.schedulePrefs = state.schedulePrefs || {};
  state.schedulePrefs[semId] = { ...getSchedulePrefs(semId), ...patch };
}

function scheduleCoursesForSemester(semId, includeCompleted = false) {
  const sem = getAllSemesters().find(s => s.id === semId);
  if (!sem) return [];
  const courses = [
    ...(sem.courses || []),
    ...(state.customCourses || []).filter(c => c.semId === sem.id),
  ];
  return courses.filter(c => {
    if (!/^[A-Z]{3,4}\s*\d{3}[A-Z]?$/i.test(c.code)) return false;
    if (includeCompleted) return true;
    const s = getCourseState(c.code);
    return s.status !== 'passed' && s.status !== 'transfer';
  });
}

function scheduleDefaultSemesterId() {
  const sems = getAllSemesters();
  const firstActive = sems.find(sem => scheduleCoursesForSemester(sem.id).length);
  return firstActive ? firstActive.id : (sems[0] && sems[0].id) || '';
}

function scheduleInferTermCode(sem) {
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

function scheduleSectionCacheKey(semId, term, code) {
  return `${semId}:${term}:${normalizeCode(code)}`;
}

function scheduleTermLabel(term) {
  const s = String(term || '');
  const year = s.slice(0, 4);
  const suffix = s.slice(4);
  const names = { '01': 'Spring', '05': 'Summer', '08': 'Fall', '12': 'Winter' };
  return `${names[suffix] || 'Term'} ${year}`;
}

function scheduleLoadPostedTerms() {
  if (scheduleTermLoadStarted) return;
  scheduleTermLoadStarted = true;
  umdioFetchSemesters().then(terms => {
    schedulePostedTerms = (terms || []).map(String).sort();
    if (currentTab === 'schedule') renderSchedule();
  });
}

function schedulePopulateSemesterSelect() {
  const sel = document.getElementById('schedule-semester');
  if (!sel) return '';
  const sems = getAllSemesters();
  if (!scheduleCurrentSemId || !sems.some(s => s.id === scheduleCurrentSemId)) {
    scheduleCurrentSemId = scheduleDefaultSemesterId();
  }
  sel.innerHTML = sems.map(sem => {
    const cr = [
      ...(sem.courses || []),
      ...(state.customCourses || []).filter(c => c.semId === sem.id),
    ].reduce((sum, c) => sum + (Number(c.cr) || 0), 0);
    return `<option value="${scheduleEscape(sem.id)}">${scheduleEscape(sem.name)} · ${cr} cr</option>`;
  }).join('');
  sel.value = scheduleCurrentSemId;
  return scheduleCurrentSemId;
}

function schedulePopulateTermSelect(semId) {
  const sel = document.getElementById('schedule-term');
  const sem = getAllSemesters().find(s => s.id === semId);
  if (!sel || !sem) return '';
  const inferred = scheduleInferTermCode(sem);
  const saved = state.schedulePrefs && state.schedulePrefs[semId] && state.schedulePrefs[semId].term;
  const terms = new Set([saved || inferred, inferred]);
  (schedulePostedTerms || []).forEach(t => terms.add(t));
  const sorted = Array.from(terms).filter(Boolean).sort((a, b) => Number(b) - Number(a));
  sel.innerHTML = sorted.map(term => {
    const posted = schedulePostedTerms ? schedulePostedTerms.includes(term) : false;
    const inferredTag = term === inferred ? ' · plan term' : '';
    const postedTag = posted ? '' : ' · not posted';
    return `<option value="${scheduleEscape(term)}">${scheduleEscape(scheduleTermLabel(term))}${inferredTag}${postedTag}</option>`;
  }).join('');
  sel.value = saved || inferred;
  return sel.value;
}

function schedulePopulatePreferenceControls(semId) {
  const prefs = getSchedulePrefs(semId);
  const earliest = document.getElementById('schedule-pref-earliest');
  const latest = document.getElementById('schedule-pref-latest');
  const minBreak = document.getElementById('schedule-pref-break');
  const mode = document.getElementById('schedule-pref-mode');
  const calendarStart = document.getElementById('schedule-calendar-start');
  const calendarEnd = document.getElementById('schedule-calendar-end');
  const registrationDate = document.getElementById('schedule-registration-date');
  const registrationTime = document.getElementById('schedule-registration-time');
  if (earliest) earliest.value = prefs.earliest || '';
  if (latest) latest.value = prefs.latest || '';
  if (minBreak) minBreak.value = String(prefs.minBreak ?? DEFAULT_SCHEDULE_PREFS.minBreak);
  if (mode) mode.value = prefs.mode || DEFAULT_SCHEDULE_PREFS.mode;
  if (calendarStart) calendarStart.value = prefs.calendarStart || '';
  if (calendarEnd) calendarEnd.value = prefs.calendarEnd || '';
  if (registrationDate) registrationDate.value = prefs.registrationDate || '';
  if (registrationTime) registrationTime.value = prefs.registrationTime || '';
  const campusZone = document.getElementById('schedule-pref-campus-zone');
  const commuteStart = document.getElementById('schedule-pref-commute-start');
  const commuteEnd = document.getElementById('schedule-pref-commute-end');
  const locationWeight = document.getElementById('schedule-pref-location-weight');
  if (campusZone) campusZone.value = prefs.campusZone || '';
  if (commuteStart) commuteStart.value = prefs.commuteStart || '';
  if (commuteEnd) commuteEnd.value = prefs.commuteEnd || '';
  if (locationWeight) locationWeight.value = prefs.locationWeight || DEFAULT_SCHEDULE_PREFS.locationWeight;
  document.querySelectorAll('.schedule-day-prefs input[type="checkbox"]').forEach(input => {
    input.checked = prefs.avoidDays.includes(input.value);
  });
  renderScheduleBlockedTimeControls(semId);
}

function scheduleSelectionBucket(semId) {
  state.selectedSections = state.selectedSections || {};
  state.selectedSections[semId] = state.selectedSections[semId] || {};
  return state.selectedSections[semId];
}

function getSelectedSection(semId, code) {
  const bucket = (state.selectedSections || {})[semId] || {};
  return bucket[normalizeCode(code)] || null;
}

function setSelectedSection(semId, code, section) {
  const bucket = scheduleSelectionBucket(semId);
  const key = normalizeCode(code);
  if (!section) delete bucket[key];
  else {
    const existing = bucket[key] || {};
    bucket[key] = {
      course: section.course || key,
      section_id: section.section_id,
      semester: String(section.semester || ''),
      number: section.number || '',
      instructors: section.instructors || [],
      meetings: section.meetings || [],
      open_seats: section.open_seats || '',
      waitlist: section.waitlist || '',
      seats: section.seats || '',
      pinned: !!existing.pinned,
      updatedAt: new Date().toISOString(),
    };
    SCHEDULE_SECTION_ELIGIBILITY_FIELDS.forEach(field => {
      if (section[field] !== undefined) bucket[key][field] = scheduleCloneSection(section[field]);
    });
  }
}

function isSelectedSectionPinned(semId, code) {
  return !!getSelectedSection(semId, code)?.pinned;
}

function setSelectedSectionPinned(semId, code, pinned) {
  const section = getSelectedSection(semId, code);
  if (!section) return false;
  section.pinned = !!pinned;
  section.updatedAt = new Date().toISOString();
  return true;
}

function restoreSelectedSection(semId, code, section, pinned = false) {
  setSelectedSection(semId, code, section);
  const restored = getSelectedSection(semId, code);
  if (restored) {
    restored.pinned = !!pinned;
    restored.updatedAt = new Date().toISOString();
  }
}

function scheduleSelectionKey(section) {
  if (!section) return '';
  return `${String(section.semester || '')}:${String(section.section_id || '')}`;
}

function scheduleSectionUndoChange(semId, code, previous, next) {
  if (scheduleSelectionKey(previous) === scheduleSelectionKey(next)) return null;
  return {
    semId,
    code,
    previousSection: scheduleCloneSection(previous),
    previousPinned: !!previous?.pinned,
    nextSection: scheduleCloneSection(next),
  };
}

function clearScheduleUndo() {
  scheduleUndoAction = null;
  renderScheduleUndo();
}

function registerScheduleUndo(action) {
  scheduleUndoAction = {
    id: `section-swap-${Date.now()}`,
    createdAt: Date.now(),
    ...action,
  };
  renderScheduleUndo();
}

function renderScheduleUndo() {
  const root = document.getElementById('schedule-undo');
  if (!root) return;
  const currentSemId = scheduleCurrentSemId || scheduleDefaultSemesterId();
  const isBatch = Array.isArray(scheduleUndoAction?.changes);
  const isReadinessMapBatch = isBatch && scheduleUndoAction?.type === 'readiness-map-auto-pick';
  const isCurrentBatch = isBatch && (
    scheduleUndoAction?.semId === currentSemId
    || (scheduleUndoAction?.changes || []).some(change => change?.semId === currentSemId)
  );
  if (
    !scheduleUndoAction
    || (!isBatch && scheduleUndoAction.semId !== currentSemId)
    || (isBatch && !isReadinessMapBatch && !isCurrentBatch)
  ) {
    root.innerHTML = '';
    return;
  }
  if (isBatch) {
    root.innerHTML = `
      <div class="schedule-undo-banner">
        <div>
          <strong>${scheduleEscape(scheduleUndoAction.title || 'Readiness Map sections applied')}</strong>
          <span>${scheduleEscape(scheduleUndoAction.detail || 'You can restore the previous section picks across affected terms.')}</span>
        </div>
        <div class="schedule-undo-actions">
          <button class="btn small" type="button" data-schedule-undo="${scheduleEscape(scheduleUndoAction.id)}">Undo</button>
          <button class="schedule-undo-dismiss" type="button" data-schedule-undo-dismiss="${scheduleEscape(scheduleUndoAction.id)}" aria-label="Dismiss undo">×</button>
        </div>
      </div>
    `;
    return;
  }
  const prevLabel = scheduleSectionShortLabel(scheduleUndoAction.previousSection);
  const nextLabel = scheduleSectionShortLabel(scheduleUndoAction.nextSection);
  root.innerHTML = `
    <div class="schedule-undo-banner">
      <div>
        <strong>${scheduleEscape(scheduleUndoAction.code)} changed to ${scheduleEscape(nextLabel)}</strong>
        <span>Previous pick ${scheduleEscape(prevLabel)} is ready to restore.</span>
      </div>
      <div class="schedule-undo-actions">
        <button class="btn small" type="button" data-schedule-undo="${scheduleEscape(scheduleUndoAction.id)}">Undo</button>
        <button class="schedule-undo-dismiss" type="button" data-schedule-undo-dismiss="${scheduleEscape(scheduleUndoAction.id)}" aria-label="Dismiss undo">×</button>
      </div>
    </div>
  `;
}

function undoScheduleSectionChange() {
  if (!scheduleUndoAction) return;
  const action = scheduleUndoAction;
  if (Array.isArray(action.changes)) {
    const termCount = action.termCount || 1;
    action.changes.forEach(change => {
      restoreSelectedSection(change.semId, change.code, change.previousSection, change.previousPinned);
    });
    scheduleUndoAction = null;
    const isReadinessMapUndo = action.type === 'readiness-map-auto-pick';
    recordPlanChange({
      type: 'auto-pick',
      source: 'Schedule',
      title: action.undoTitle || (isReadinessMapUndo ? 'Undid Readiness Map auto-pick' : 'Undid section auto-fill'),
      detail: action.undoDetail || `Restored previous section choices for ${action.changes.length} course${action.changes.length === 1 ? '' : 's'} across ${termCount} term${termCount === 1 ? '' : 's'}.`,
      meta: action.undoMeta || (isReadinessMapUndo ? 'Undo readiness map' : 'Undo section auto-fill'),
    }, { save: false });
    saveState();
    renderSchedule();
    renderSemesters();
    toastInfo(action.undoToast || (isReadinessMapUndo
      ? `Restored ${action.changes.length} Readiness Map section pick${action.changes.length === 1 ? '' : 's'}.`
      : `Restored ${action.changes.length} section pick${action.changes.length === 1 ? '' : 's'}.`));
    return;
  }
  restoreSelectedSection(action.semId, action.code, action.previousSection, action.previousPinned);
  scheduleUndoAction = null;
  recordPlanChange({
    type: 'section-swap',
    source: 'Schedule',
    title: `Restored ${action.code}`,
    detail: `${action.code} restored to ${scheduleSectionShortLabel(action.previousSection)} after applying ${scheduleSectionShortLabel(action.nextSection)}.`,
    meta: 'Undo section swap',
  }, { save: false });
  saveState();
  renderSchedule();
  renderSemesters();
  toastInfo(`Restored ${action.code} to ${scheduleSectionShortLabel(action.previousSection)}.`);
}

function parseMeetingTime(value) {
  const raw = String(value || '').trim().toLowerCase();
  const m = raw.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (m[3] === 'pm' && h !== 12) h += 12;
  if (m[3] === 'am' && h === 12) h = 0;
  return h * 60 + min;
}

function formatMeetingTime(mins) {
  if (typeof mins !== 'number') return '';
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;
  const suffix = h24 >= 12 ? 'pm' : 'am';
  const h = ((h24 + 11) % 12) + 1;
  return `${h}:${String(m).padStart(2, '0')}${suffix}`;
}

function parseMeetingDays(days) {
  const raw = String(days || '').replace(/\s+/g, '');
  const out = [];
  for (let i = 0; i < raw.length;) {
    const two = raw.slice(i, i + 2);
    if (two === 'Tu' || two === 'Th' || two === 'Sa' || two === 'Su') {
      out.push(two);
      i += 2;
    } else {
      const one = raw[i];
      if (one === 'M') out.push('M');
      else if (one === 'T') out.push('Tu');
      else if (one === 'W') out.push('W');
      else if (one === 'F') out.push('F');
      i += 1;
    }
  }
  return out;
}

function sectionBlocks(section, course) {
  const blocks = [];
  (section && section.meetings || []).forEach(meeting => {
    const start = parseMeetingTime(meeting.start_time);
    const end = parseMeetingTime(meeting.end_time);
    if (start === null || end === null || end <= start) return;
    parseMeetingDays(meeting.days).forEach(day => {
      blocks.push({
        day,
        start,
        end,
        code: course ? course.code : displayCode(section.course || ''),
        title: course ? course.title : '',
        section_id: section.section_id,
        number: section.number || '',
        type: meeting.classtype || 'Lecture',
        room: [meeting.building, meeting.room].filter(Boolean).join(' '),
        building: String(meeting.building || '').trim().toUpperCase(),
      });
    });
  });
  return blocks;
}

function scheduleBlockedBlocks(prefs) {
  return (prefs.blockedTimes || []).map(block => {
    const start = parseClockValue(block.start);
    const end = parseClockValue(block.end);
    if (start === null || end === null || end <= start) return null;
    return {
      day: block.day,
      start,
      end,
      code: block.label || 'Unavailable',
      title: 'Unavailable time',
      section_id: block.id,
      number: '',
      type: 'Blocked',
      room: '',
      blocked: true,
    };
  }).filter(Boolean);
}

function sectionBlockedOverlaps(section, prefs, course = null) {
  const blocks = sectionBlocks(section, course);
  const blocked = scheduleBlockedBlocks(prefs);
  const overlaps = [];
  blocks.forEach(block => {
    blocked.forEach(unavailable => {
      if (blocksConflict(block, unavailable)) overlaps.push({ block, unavailable });
    });
  });
  return overlaps;
}

function sectionHasTimedMeetings(section) {
  return sectionBlocks(section, null).length > 0;
}

function blocksConflict(a, b) {
  return a.day === b.day && a.start < b.end && b.start < a.end;
}

function detectScheduleConflicts(selected) {
  const blocks = [];
  selected.forEach(item => {
    sectionBlocks(item.section, item.course).forEach(block => blocks.push({ ...block, norm: normalizeCode(item.course.code) }));
  });
  const conflictKeys = new Set();
  const conflicts = [];
  for (let i = 0; i < blocks.length; i++) {
    for (let j = i + 1; j < blocks.length; j++) {
      if (blocks[i].norm === blocks[j].norm) continue;
      if (!blocksConflict(blocks[i], blocks[j])) continue;
      conflictKeys.add(`${i}`);
      conflictKeys.add(`${j}`);
      conflicts.push({ a: blocks[i], b: blocks[j] });
    }
  }
  blocks.forEach((b, idx) => { b.conflict = conflictKeys.has(`${idx}`); });
  return { blocks, conflicts };
}

function sectionSummary(section) {
  if (!section) return '';
  const timed = (section.meetings || []).filter(m => m.start_time && m.end_time && m.days);
  if (!timed.length) return `${section.number || 'Section'} · time TBA`;
  const pieces = timed.slice(0, 2).map(m => {
    const where = [m.building, m.room].filter(Boolean).join(' ');
    return `${m.days} ${m.start_time}-${m.end_time}${where ? ` · ${where}` : ''}`;
  });
  const extra = timed.length > 2 ? ` +${timed.length - 2} more` : '';
  return `${section.number || 'Section'} · ${pieces.join(' / ')}${extra}`;
}

function sectionSeatNumber(value) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

function pluralizeSeat(count, word = 'seat') {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

function sectionSeatRisk(section) {
  const open = sectionSeatNumber(section && section.open_seats);
  const wait = sectionSeatNumber(section && section.waitlist);
  const capacity = sectionSeatNumber(section && section.seats);
  const waitText = wait && wait > 0 ? ` · ${wait} waitlisted` : '';
  if (open === null && wait === null) {
    return {
      level: 'unknown',
      label: 'Seats TBA',
      detail: 'Seat data not posted yet',
      open,
      wait,
      capacity,
      score: -20,
    };
  }
  if (open !== null && open <= 0) {
    return wait && wait > 0
      ? { level: 'closed', label: `${wait} waitlisted`, detail: `0 open${waitText}`, open, wait, capacity, score: -320 }
      : { level: 'closed', label: 'Closed', detail: '0 open seats', open, wait, capacity, score: -360 };
  }
  if (open <= 3) {
    return { level: 'risk', label: `${open} left`, detail: `${pluralizeSeat(open)} open${waitText}`, open, wait, capacity, score: -130 };
  }
  if (open <= 10 || (wait && wait > 0)) {
    return { level: 'watch', label: `${open} open`, detail: `${pluralizeSeat(open)} open${waitText}`, open, wait, capacity, score: -45 };
  }
  return { level: 'ok', label: `${open} open`, detail: `${pluralizeSeat(open)} open${waitText}`, open, wait, capacity, score: Math.min(70, open * 2) };
}

function renderSeatRiskBadge(section) {
  const risk = sectionSeatRisk(section);
  return `<span class="seat-risk seat-risk-${risk.level}" title="${scheduleEscape(risk.detail)}">${scheduleEscape(risk.label)}</span>`;
}

function sectionSeatOverview(sections) {
  const risks = (sections || []).map(sectionSeatRisk);
  if (!risks.length) return null;
  const bestOpen = risks.reduce((max, risk) => risk.open !== null ? Math.max(max, risk.open) : max, 0);
  return {
    bestOpen,
    openCount: risks.filter(risk => risk.open !== null && risk.open > 0).length,
    watchCount: risks.filter(risk => risk.level === 'watch' || risk.level === 'risk').length,
    closedCount: risks.filter(risk => risk.level === 'closed').length,
    waitlistedCount: risks.filter(risk => risk.wait && risk.wait > 0).length,
  };
}

function renderSectionSeatOverview(sections, picked) {
  if (picked) return `<div class="section-seat-row">${renderSeatRiskBadge(picked)}<span>${scheduleEscape(sectionSeatRisk(picked).detail)}</span></div>`;
  const overview = sectionSeatOverview(sections);
  if (!overview) return '';
  const parts = [`best ${overview.bestOpen} open`];
  if (overview.openCount) parts.push(`${overview.openCount} open section${overview.openCount === 1 ? '' : 's'}`);
  if (overview.watchCount) parts.push(`${overview.watchCount} filling`);
  if (overview.waitlistedCount) parts.push(`${overview.waitlistedCount} with waitlist`);
  if (overview.closedCount) parts.push(`${overview.closedCount} closed`);
  const level = overview.bestOpen <= 0 ? 'closed' : overview.bestOpen <= 3 ? 'risk' : overview.bestOpen <= 10 ? 'watch' : 'ok';
  return `<div class="section-seat-row"><span class="seat-risk seat-risk-${level}">${scheduleEscape(parts[0])}</span><span>${scheduleEscape(parts.slice(1).join(' · ') || 'Seats available')}</span></div>`;
}

function scheduleCourseSummary(semId, code) {
  const section = getSelectedSection(semId, code);
  if (!section) return '';
  const summary = sectionSummary(section);
  const risk = typeof sectionSeatRisk === 'function' ? sectionSeatRisk(section) : null;
  const eligibility = sectionEligibilityStatus(section);
  const title = [summary, risk?.detail, eligibility.notes.length ? `Eligibility: ${eligibility.detail}` : ''].filter(Boolean).join(' · ');
  const riskClass = risk ? ` seat-risk-${risk.level}` : '';
  const eligibilityClass = eligibility.notes.length ? ` eligibility-${eligibility.level}` : '';
  return `<span class="schedule-chip${riskClass}${eligibilityClass}" title="${scheduleEscape(title)}"><span>${scheduleEscape(summary)}</span>${risk ? `<b>${scheduleEscape(risk.label)}</b>` : ''}</span>`;
}

function renderScheduleBlockedTimeControls(semId) {
  const list = document.getElementById('schedule-block-list');
  if (!list) return;
  const prefs = getSchedulePrefs(semId);
  if (!prefs.blockedTimes.length) {
    list.innerHTML = '<span class="schedule-block-empty">No unavailable windows added.</span>';
    return;
  }
  list.innerHTML = prefs.blockedTimes.map(block => {
    const day = SCHEDULE_DAY_DEFS.find(d => d.key === block.day)?.label || block.day;
    const start = parseClockValue(block.start);
    const end = parseClockValue(block.end);
    const label = `${day} ${start !== null ? formatMeetingTime(start) : block.start}-${end !== null ? formatMeetingTime(end) : block.end}`;
    return `
      <span class="schedule-block-chip">
        <strong>${scheduleEscape(block.label || 'Unavailable')}</strong>
        <span>${scheduleEscape(label)}</span>
        <button type="button" data-remove-block="${scheduleEscape(block.id)}" aria-label="Remove ${scheduleEscape(block.label || 'blocked time')}">×</button>
      </span>
    `;
  }).join('');
}

function addScheduleBlockedTime() {
  const semId = scheduleCurrentSemId || scheduleDefaultSemesterId();
  if (!semId) return;
  const day = document.getElementById('schedule-block-day')?.value || 'M';
  const start = document.getElementById('schedule-block-start')?.value || '';
  const end = document.getElementById('schedule-block-end')?.value || '';
  const label = (document.getElementById('schedule-block-label')?.value || '').trim() || 'Unavailable';
  const startMin = parseClockValue(start);
  const endMin = parseClockValue(end);
  if (startMin === null || endMin === null || endMin <= startMin) {
    toastError('Blocked time needs a valid start and end.');
    return;
  }
  const prefs = getSchedulePrefs(semId);
  setSchedulePrefs(semId, {
    blockedTimes: [
      ...prefs.blockedTimes,
      { id: `block-${Date.now()}`, day, start, end, label },
    ],
  });
  const labelInput = document.getElementById('schedule-block-label');
  if (labelInput) labelInput.value = '';
  saveState();
  renderSchedule();
}

function removeScheduleBlockedTime(blockId) {
  const semId = scheduleCurrentSemId || scheduleDefaultSemesterId();
  if (!semId || !blockId) return;
  const prefs = getSchedulePrefs(semId);
  setSchedulePrefs(semId, { blockedTimes: prefs.blockedTimes.filter(block => block.id !== blockId) });
  saveState();
  renderSchedule();
}

function sectionPreferenceNotes(section, prefs, course = null) {
  const notes = [];
  const blocks = sectionBlocks(section, course);
  if (!blocks.length) {
    notes.push({ type: 'warn', text: 'Time TBA' });
    return notes;
  }
  const earliest = parseClockValue(prefs.earliest);
  const latest = parseClockValue(prefs.latest);
  if (earliest !== null && blocks.some(b => b.start < earliest)) {
    notes.push({ type: 'warn', text: `Starts before ${formatMeetingTime(earliest)}` });
  }
  if (latest !== null && blocks.some(b => b.end > latest)) {
    notes.push({ type: 'warn', text: `Ends after ${formatMeetingTime(latest)}` });
  }
  const avoided = Array.from(new Set(blocks.map(b => b.day).filter(d => prefs.avoidDays.includes(d))));
  if (avoided.length) {
    notes.push({ type: 'warn', text: `Uses avoided day${avoided.length === 1 ? '' : 's'}: ${avoided.join(', ')}` });
  }
  const blocked = sectionBlockedOverlaps(section, prefs, course);
  if (blocked.length) {
    const labels = Array.from(new Set(blocked.map(hit => hit.unavailable.code)));
    notes.push({ type: 'warn', text: `Overlaps unavailable time: ${labels.join(', ')}` });
  }
  sectionLocationAssessment(section, prefs, course).notes.forEach(note => notes.push(note));
  return notes;
}

function sectionPreferencePenalty(section, prefs, course = null) {
  const blocks = sectionBlocks(section, course);
  if (!blocks.length) return 120;
  const earliest = parseClockValue(prefs.earliest);
  const latest = parseClockValue(prefs.latest);
  let penalty = 0;
  blocks.forEach(block => {
    if (earliest !== null && block.start < earliest) penalty += Math.ceil((earliest - block.start) / 15) * 35;
    if (latest !== null && block.end > latest) penalty += Math.ceil((block.end - latest) / 15) * 35;
    if (prefs.avoidDays.includes(block.day)) penalty += 260;
  });
  penalty += sectionBlockedOverlaps(section, prefs, course).length * 900;
  penalty += sectionLocationAssessment(section, prefs, course).penalty;
  return penalty;
}

function buildingFromRoom(room) {
  return String(room || '').trim().split(/\s+/)[0] || '';
}

function scheduleLocationPrefsActive(prefs) {
  return !!(prefs.campusZone || prefs.commuteStart || prefs.commuteEnd);
}

function scheduleLocationWeight(prefs) {
  return LOCATION_WEIGHT_MULTIPLIERS[prefs.locationWeight] || LOCATION_WEIGHT_MULTIPLIERS.normal;
}

function distanceBetweenCoords(a, b) {
  if (!a || !b) return null;
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function estimateWalkMinutesBetweenCoords(a, b) {
  const dist = distanceBetweenCoords(a, b);
  if (dist === null) return null;
  return Math.max(3, Math.ceil(3 + dist * 3.2));
}

function estimateWalkMinutes(fromBuilding, toBuilding) {
  const from = String(fromBuilding || '').toUpperCase();
  const to = String(toBuilding || '').toUpperCase();
  if (!from || !to || from === to) return 0;
  if (from === 'ONLINE' || to === 'ONLINE' || from === 'TBA' || to === 'TBA') return 0;
  const a = BUILDING_COORDS[from];
  const b = BUILDING_COORDS[to];
  if (!a || !b) return null;
  return estimateWalkMinutesBetweenCoords(a, b);
}

function campusZoneForBuilding(building) {
  const code = String(building || '').trim().toUpperCase();
  if (!code) return null;
  const explicit = CAMPUS_ZONE_DEFS.find(zone => (zone.buildings || []).includes(code));
  if (explicit) return explicit;
  const coord = BUILDING_COORDS[code];
  if (!coord) return null;
  return CAMPUS_ZONE_DEFS
    .filter(zone => zone.id && zone.coord)
    .map(zone => ({ zone, dist: distanceBetweenCoords(coord, zone.coord) }))
    .sort((a, b) => a.dist - b.dist)[0]?.zone || null;
}

function sectionLocationBuildings(section, course = null) {
  const seen = new Set();
  const buildings = [];
  sectionBlocks(section, course).forEach(block => {
    const code = String(block.building || buildingFromRoom(block.room)).trim().toUpperCase();
    if (!code || code === 'ONLINE' || code === 'TBA' || seen.has(code)) return;
    seen.add(code);
    buildings.push(code);
  });
  return buildings;
}

function sectionLocationAssessment(section, prefs, course = null) {
  const active = scheduleLocationPrefsActive(prefs);
  const buildings = sectionLocationBuildings(section, course);
  const known = buildings.filter(code => BUILDING_COORDS[code]);
  const zones = Array.from(new Set(known.map(code => campusZoneForBuilding(code)?.label).filter(Boolean)));
  const preferred = scheduleDefById(CAMPUS_ZONE_DEFS, prefs.campusZone);
  const weight = scheduleLocationWeight(prefs);
  let penalty = 0;
  const notes = [];
  const label = buildings.length
    ? `${buildings.join(', ')}${zones.length ? ` · ${zones.join(' / ')}` : ''}`
    : 'Campus location TBA';

  if (!active) return { penalty, notes, label, buildings, zones, alertCount: 0 };

  if (preferred.id) {
    if (!known.length) {
      penalty += Math.round(50 * weight);
      notes.push({ type: 'warn', text: 'Campus location TBA' });
    } else {
      const matches = known.filter(code => campusZoneForBuilding(code)?.id === preferred.id);
      const distances = known
        .map(code => distanceBetweenCoords(BUILDING_COORDS[code], preferred.coord))
        .filter(dist => Number.isFinite(dist));
      const avgDist = distances.length ? distances.reduce((sum, dist) => sum + dist, 0) / distances.length : 0;
      if (!matches.length) {
        penalty += Math.round((95 + avgDist * 34) * weight);
        const actual = zones.length ? zones.join(' / ') : buildings.join(', ');
        notes.push({ type: 'warn', text: `Outside preferred ${preferred.label}${actual ? ` (${actual})` : ''}` });
      } else if (matches.length < known.length) {
        penalty += Math.round(45 * weight);
        notes.push({ type: 'warn', text: `Splits time outside preferred ${preferred.label}` });
      } else {
        penalty -= Math.round(45 * weight);
      }
    }
  }

  return { penalty, notes, label, buildings, zones, alertCount: notes.length };
}

function estimateAnchorWalkMinutes(anchorId, building) {
  const anchor = scheduleDefById(CAMPUS_ANCHOR_DEFS, anchorId);
  const code = String(building || '').trim().toUpperCase();
  if (!anchor.id || !anchor.coord || !BUILDING_COORDS[code]) return null;
  return estimateWalkMinutesBetweenCoords(anchor.coord, BUILDING_COORDS[code]);
}

function scheduleCandidateLocationReport(items, prefs) {
  if (!scheduleLocationPrefsActive(prefs)) return { warnings: [], alertCount: 0, penalty: 0 };
  const weight = scheduleLocationWeight(prefs);
  const warnings = [];
  let penalty = 0;
  let alertCount = items.reduce((sum, item) => sum + sectionLocationAssessment(item.section, prefs, item.course).alertCount, 0);
  const blocks = items.flatMap(item => sectionBlocks(item.section, item.course));
  const threshold = prefs.locationWeight === 'strong' ? 10 : 13;

  SCHEDULE_DAY_DEFS.forEach(day => {
    const dayBlocks = blocks
      .filter(block => block.day === day.key)
      .sort((a, b) => a.start - b.start);
    if (!dayBlocks.length) return;
    const first = dayBlocks[0];
    const last = dayBlocks[dayBlocks.length - 1];
    const firstBuilding = first.building || buildingFromRoom(first.room);
    const lastBuilding = last.building || buildingFromRoom(last.room);

    if (prefs.commuteStart) {
      const anchor = scheduleDefById(CAMPUS_ANCHOR_DEFS, prefs.commuteStart);
      const walk = estimateAnchorWalkMinutes(prefs.commuteStart, firstBuilding);
      if (walk !== null) {
        if (walk > threshold) {
          warnings.push(`${day.label}: first class ${first.code} is about ${walk} min from ${anchor.label}.`);
          alertCount += 1;
        }
        penalty += Math.max(0, walk - 9) * 8 * weight;
      }
    }

    if (prefs.commuteEnd) {
      const anchor = scheduleDefById(CAMPUS_ANCHOR_DEFS, prefs.commuteEnd);
      const walk = estimateAnchorWalkMinutes(prefs.commuteEnd, lastBuilding);
      if (walk !== null) {
        if (walk > threshold) {
          warnings.push(`${day.label}: last class ${last.code} is about ${walk} min from ${anchor.label}.`);
          alertCount += 1;
        }
        penalty += Math.max(0, walk - 9) * 8 * weight;
      }
    }
  });

  return { warnings, alertCount, penalty: Math.round(penalty) };
}

function renderSectionLocationFit(section, prefs, course) {
  if (!scheduleLocationPrefsActive(prefs)) return '';
  const assessment = sectionLocationAssessment(section, prefs, course);
  const text = assessment.notes.length
    ? assessment.notes.map(note => note.text).join(' · ')
    : `Campus fit: ${assessment.label}`;
  return `<div class="section-location-row ${assessment.notes.length ? 'warn' : 'ok'}">${scheduleEscape(text)}</div>`;
}

function sectionDecisionReasons(section, prefs, course) {
  const reasons = [];
  const risk = sectionSeatRisk(section);
  const riskLevel = risk.level === 'closed' || risk.level === 'risk' ? 'bad' : risk.level === 'watch' || risk.level === 'unknown' ? 'warn' : 'good';
  reasons.push({ level: riskLevel, text: risk.detail });

  const prefNotes = sectionPreferenceNotes(section, prefs, course).filter(note => note.type === 'warn');
  if (prefNotes.length) {
    prefNotes.slice(0, 2).forEach(note => reasons.push({ level: 'warn', text: note.text }));
  } else {
    reasons.push({ level: 'good', text: 'Fits time preferences' });
  }

  if ((prefs.blockedTimes || []).length) {
    const blockHits = sectionBlockedOverlaps(section, prefs, course).length;
    reasons.push(blockHits ? { level: 'bad', text: `${blockHits} unavailable-time conflict${blockHits === 1 ? '' : 's'}` } : { level: 'good', text: 'Blocks clear' });
  }

  if (scheduleLocationPrefsActive(prefs)) {
    const location = sectionLocationAssessment(section, prefs, course);
    reasons.push(location.alertCount ? { level: 'warn', text: 'Campus fit warning' } : { level: 'good', text: 'Campus fit' });
  }

  return reasons;
}

function sectionRankInfo(sections, picked, prefs, course) {
  const ranked = (sections || [])
    .slice()
    .sort((a, b) => sectionScore(b, prefs, course) - sectionScore(a, prefs, course));
  const index = ranked.findIndex(section => section.section_id === picked.section_id);
  return {
    rank: index >= 0 ? index + 1 : null,
    total: ranked.length,
    best: ranked[0] || null,
  };
}

function sectionSwapSafety(section, course, selectedItems, prefs) {
  const candidateBlocks = sectionBlocks(section, course);
  const otherItems = (selectedItems || []).filter(item => normalizeCode(item.course.code) !== normalizeCode(course.code));
  const otherBlocks = otherItems.flatMap(item => sectionBlocks(item.section, item.course));
  const conflicts = [];
  candidateBlocks.forEach(block => {
    otherBlocks.forEach(other => {
      if (blocksConflict(block, other)) conflicts.push({ block, other });
    });
  });
  const blocked = sectionBlockedOverlaps(section, prefs, course);
  const reasons = [];
  if (conflicts.length) {
    const labels = Array.from(new Set(conflicts.map(hit => hit.other.code))).slice(0, 2).join(', ');
    reasons.push(`conflicts with ${labels}`);
  }
  if (blocked.length) {
    reasons.push('overlaps unavailable time');
  }
  return { ok: !conflicts.length && !blocked.length, reasons };
}

function sectionBackupCandidate(sections, picked, prefs, course, selectedItems = []) {
  if (!picked || !(sections || []).length) return null;
  const pickedRisk = sectionSeatRisk(picked);
  if (!sectionSeatBackupAction(pickedRisk)) return null;
  return (sections || [])
    .filter(section => section.section_id && section.section_id !== picked.section_id)
    .map(section => ({
      section,
      risk: sectionSeatRisk(section),
      safety: sectionSwapSafety(section, course, selectedItems, prefs),
      score: sectionScore(section, prefs, course, selectedItems),
    }))
    .filter(item => item.safety.ok && ['ok', 'watch'].includes(item.risk.level))
    .sort((a, b) => {
      const riskRank = { ok: 2, watch: 1 };
      return (riskRank[b.risk.level] || 0) - (riskRank[a.risk.level] || 0)
        || b.score - a.score;
    })[0] || null;
}

function renderSectionDecision(sections, picked, prefs, course, selectedItems = []) {
  if (!picked || !(sections || []).length) return '';
  const info = sectionRankInfo(sections, picked, prefs, course);
  const best = info.best && info.best.section_id !== picked.section_id ? info.best : null;
  const bestSafety = best ? sectionSwapSafety(best, course, selectedItems, prefs) : null;
  const backup = sectionBackupCandidate(sections, picked, prefs, course, selectedItems);
  const showTopAction = best && (!backup || backup.section.section_id !== best.section_id);
  const rankText = info.rank ? `Ranked ${info.rank}/${info.total} by current preferences` : 'Saved section is not in the latest posted list';
  const bestText = best
    ? `Top match: ${sectionSummary(best)} · ${sectionSeatRisk(best).detail}`
    : 'Top match for current preferences';
  return `
    <div class="section-decision">
      <div class="section-decision-head">
        <strong>${scheduleEscape(rankText)}</strong>
        <span class="${best ? 'warn' : 'good'}">${scheduleEscape(bestText)}</span>
      </div>
      <div class="section-decision-reasons">
        ${sectionDecisionReasons(picked, prefs, course).map(reason => `<span class="${scheduleEscape(reason.level)}">${scheduleEscape(reason.text)}</span>`).join('')}
      </div>
      ${backup ? `<div class="section-decision-action backup">
        <span><strong>Backup option:</strong> ${scheduleEscape(sectionSummary(backup.section))} · ${scheduleEscape(backup.risk.detail)}</span>
        <button class="btn small primary" type="button" data-apply-best-section="${scheduleEscape(backup.section.section_id)}" data-section-action="backup" data-code="${scheduleEscape(course.code)}">Apply backup</button>
      </div>` : ''}
      ${showTopAction ? `<div class="section-decision-action">
        ${bestSafety.ok
          ? `<button class="btn small" type="button" data-apply-best-section="${scheduleEscape(best.section_id)}" data-code="${scheduleEscape(course.code)}">Apply top section</button>`
          : `<span>Top section not auto-applied: ${scheduleEscape(bestSafety.reasons.join(' · ') || 'not conflict-safe')}</span>`}
      </div>` : ''}
    </div>
  `;
}

function sectionSeatBackupAction(risk) {
  if (!risk) return '';
  if (risk.level === 'closed') return 'Pick a backup section or alternate course before registration.';
  if (risk.level === 'risk') return 'Pick a backup section now before it fills.';
  if (risk.level === 'watch') return 'Keep a backup section ready and watch seats.';
  return '';
}

function selectedSeatRiskWarnings(selectedItems) {
  return (selectedItems || [])
    .map(item => {
      const risk = sectionSeatRisk(item.section);
      const action = sectionSeatBackupAction(risk);
      if (!action) return null;
      const code = item.course?.code || displayCode(item.section?.course || '');
      const section = scheduleSectionShortLabel(item.section);
      return `${code} ${section}: ${risk.detail}. ${action}`;
    })
    .filter(Boolean);
}

function selectedSectionEligibilityRows(selectedItems) {
  return (selectedItems || [])
    .map(item => {
      const eligibility = sectionEligibilityStatus(item.section);
      if (!eligibility.notes.length) return null;
      const code = item.course?.code || displayCode(item.section?.course || '');
      const section = scheduleSectionShortLabel(item.section);
      return {
        item,
        eligibility,
        code,
        section,
        label: `${code} ${section}`.trim(),
      };
    })
    .filter(Boolean);
}

function selectedSectionEligibilityWarnings(selectedItems) {
  return selectedSectionEligibilityRows(selectedItems)
    .map(row => `${row.label}: ${row.eligibility.detail}. Confirm eligibility in Testudo before registration.`);
}

function selectedScheduleWarnings(selectedItems, prefs) {
  const warnings = [];
  selectedSeatRiskWarnings(selectedItems).forEach(warning => warnings.push(warning));
  selectedSectionEligibilityWarnings(selectedItems).forEach(warning => warnings.push(warning));
  selectedItems.forEach(item => {
    sectionPreferenceNotes(item.section, prefs, item.course).forEach(note => {
      if (note.type === 'warn') warnings.push(`${item.course.code}: ${note.text}.`);
    });
  });
  const blocks = selectedItems.flatMap(item => sectionBlocks(item.section, item.course));
  SCHEDULE_DAY_DEFS.forEach(day => {
    const dayBlocks = blocks
      .filter(b => b.day === day.key)
      .sort((a, b) => a.start - b.start);
    for (let i = 0; i < dayBlocks.length - 1; i++) {
      const a = dayBlocks[i];
      const b = dayBlocks[i + 1];
      if (normalizeCode(a.code) === normalizeCode(b.code)) continue;
      const gap = b.start - a.end;
      if (gap < 0) continue;
      const minBreak = Number(prefs.minBreak) || 0;
      const aBuilding = a.building || buildingFromRoom(a.room);
      const bBuilding = b.building || buildingFromRoom(b.room);
      const walk = estimateWalkMinutes(aBuilding, bBuilding);
      if (walk !== null && walk > 0 && gap < walk) {
        warnings.push(`${day.label}: ${gap} min from ${aBuilding} to ${bBuilding} after ${a.code}; estimate ${walk} min walk.`);
      } else if (minBreak && gap < minBreak) {
        warnings.push(`${day.label}: only ${gap} min between ${a.code} and ${b.code}.`);
      } else if (walk === null && gap <= 10 && aBuilding && bBuilding && aBuilding !== bBuilding) {
        warnings.push(`${day.label}: ${gap} min building change from ${aBuilding} to ${bBuilding}.`);
      } else if (gap >= 150) {
        warnings.push(`${day.label}: ${Math.round(gap / 60)} hr idle gap between ${a.code} and ${b.code}.`);
      }
    }
  });
  scheduleCandidateLocationReport(selectedItems, prefs).warnings.forEach(warning => warnings.push(warning));
  return warnings;
}

function scheduleDurationLabel(minutes) {
  const mins = Math.max(0, Math.round(Number(minutes) || 0));
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const rest = mins % 60;
  return rest ? `${hours} hr ${rest} min` : `${hours} hr`;
}

function scheduleTimingDayReports(items) {
  const blocks = (items || [])
    .flatMap(item => sectionBlocks(item.section, item.course))
    .filter(block => !block.blocked)
    .sort((a, b) => a.day.localeCompare(b.day) || a.start - b.start);
  const untimedCount = (items || []).filter(item => !sectionBlocks(item.section, item.course).length).length;
  return SCHEDULE_DAY_DEFS.map(day => {
    const dayBlocks = blocks.filter(block => block.day === day.key).sort((a, b) => a.start - b.start);
    const transitions = [];
    for (let i = 0; i < dayBlocks.length - 1; i++) {
      const a = dayBlocks[i];
      const b = dayBlocks[i + 1];
      if (normalizeCode(a.code) === normalizeCode(b.code)) continue;
      const gap = Math.max(0, b.start - a.end);
      const walk = estimateWalkMinutes(a.building || buildingFromRoom(a.room), b.building || buildingFromRoom(b.room));
      transitions.push({ a, b, gap, walk });
    }
    const start = dayBlocks.length ? dayBlocks[0].start : null;
    const end = dayBlocks.length ? dayBlocks[dayBlocks.length - 1].end : null;
    const inClass = dayBlocks.reduce((sum, block) => sum + Math.max(0, block.end - block.start), 0);
    const span = start !== null && end !== null ? Math.max(0, end - start) : 0;
    const idle = transitions.reduce((sum, transition) => sum + transition.gap, 0);
    return {
      day,
      blocks: dayBlocks,
      transitions,
      start,
      end,
      span,
      inClass,
      idle,
      maxGap: transitions.length ? Math.max(...transitions.map(transition => transition.gap)) : 0,
      shortestGap: transitions.length ? Math.min(...transitions.map(transition => transition.gap)) : null,
    };
  }).filter(report => report.blocks.length).map(report => ({ ...report, untimedCount }));
}

function scheduleTimingFit(items, prefs = DEFAULT_SCHEDULE_PREFS, conflicts = []) {
  const reports = scheduleTimingDayReports(items);
  const untimedCount = (items || []).filter(item => !sectionBlocks(item.section, item.course).length).length;
  if (!(items || []).length) {
    return {
      score: 0,
      label: 'No schedule yet',
      tone: 'warn',
      reports,
      insights: ['Pick or auto-pick sections to see timing quality.'],
      metrics: { activeDays: 0, totalIdle: 0, longestDay: 0, shortestBreak: null, tightTransitions: 0, untimedCount },
      scoreAdjustment: -500,
    };
  }

  const minBreak = Number(prefs.minBreak) || 0;
  const transitions = reports.flatMap(report => report.transitions.map(transition => ({ ...transition, day: report.day })));
  const tightTransitions = transitions.filter(transition => {
    if (transition.walk !== null && transition.walk > 0) return transition.gap < transition.walk;
    return minBreak && transition.gap < minBreak;
  });
  const longIdle = transitions.filter(transition => transition.gap >= 120);
  const totalIdle = reports.reduce((sum, report) => sum + report.idle, 0);
  const longestDay = reports.length ? Math.max(...reports.map(report => report.span)) : 0;
  const shortestBreak = transitions.length ? Math.min(...transitions.map(transition => transition.gap)) : null;
  const activeDays = reports.length;
  let score = 100;
  score -= (conflicts || []).length * 28;
  score -= Math.min(42, tightTransitions.length * 12);
  score -= Math.min(22, totalIdle / (prefs.mode === 'compact' ? 18 : 28));
  score -= Math.min(18, reports.filter(report => report.span >= 8 * 60).length * 8);
  score -= Math.min(18, longIdle.length * 5);
  score -= untimedCount * 6;
  if (prefs.mode === 'compact') {
    score -= Math.max(0, activeDays - 3) * 7;
    if (activeDays <= 3 && totalIdle <= 75) score += 7;
  }
  if (prefs.mode === 'balanced') {
    score -= Math.max(0, activeDays - 4) * 3;
  }
  score = Math.max(0, Math.min(100, Math.round(score)));

  const insights = [];
  if ((conflicts || []).length) {
    insights.push(`${conflicts.length} time conflict${conflicts.length === 1 ? '' : 's'} must be resolved before registration.`);
  }
  if (tightTransitions.length) {
    const tight = tightTransitions.slice().sort((a, b) => a.gap - b.gap)[0];
    const walkText = tight.walk !== null ? `; estimated walk ${scheduleDurationLabel(tight.walk)}` : '';
    insights.push(`${tight.day.label}: ${scheduleDurationLabel(tight.gap)} between ${tight.a.code} and ${tight.b.code}${walkText}.`);
  }
  if (longIdle.length) {
    const idle = longIdle.slice().sort((a, b) => b.gap - a.gap)[0];
    insights.push(`${idle.day.label}: ${scheduleDurationLabel(idle.gap)} idle gap between ${idle.a.code} and ${idle.b.code}.`);
  } else if (totalIdle > 0) {
    insights.push(`${scheduleDurationLabel(totalIdle)} total idle time across ${activeDays} active day${activeDays === 1 ? '' : 's'}.`);
  }
  const longest = reports.slice().sort((a, b) => b.span - a.span)[0];
  if (longest && longest.span >= 7 * 60) {
    insights.push(`${longest.day.label}: longest day runs ${formatMeetingTime(longest.start)}-${formatMeetingTime(longest.end)}.`);
  }
  if (untimedCount) {
    insights.push(`${untimedCount} picked section${untimedCount === 1 ? '' : 's'} still has time TBA.`);
  }
  if (prefs.mode === 'compact') {
    insights.push(`Compact target: ${activeDays} active day${activeDays === 1 ? '' : 's'}, ${scheduleDurationLabel(totalIdle)} idle.`);
  }
  if (!insights.length) {
    insights.push('No overlaps, tight walks, long idle gaps, or TBA meeting times detected.');
  }

  const label = score >= 90 ? 'Excellent timing'
    : score >= 76 ? 'Strong timing'
      : score >= 61 ? 'Workable timing'
        : 'Needs timing review';
  const tone = score >= 76 ? 'ok' : score >= 61 ? 'warn' : 'danger';
  return {
    score,
    label,
    tone,
    reports,
    insights: insights.slice(0, 5),
    metrics: { activeDays, totalIdle, longestDay, shortestBreak, tightTransitions: tightTransitions.length, untimedCount },
    scoreAdjustment: Math.round((score - 70) * 16),
  };
}

function scheduleCourseCredits(course) {
  return Number(course && course.cr) || 0;
}

function scheduleTermCreditPolicy(prefs = DEFAULT_SCHEDULE_PREFS) {
  const term = String(prefs?.term || '');
  const suffix = term.slice(4);
  const termLabel = scheduleTermLabel(term);
  if (suffix === '12') {
    return {
      kind: 'winter',
      termLabel,
      fullTimeMin: null,
      preClassMax: 4,
      maxCredits: 4,
      source: 'UMD winter-session max is 4 credits without Advising College approval.',
    };
  }
  if (suffix === '05') {
    return {
      kind: 'summer',
      termLabel,
      fullTimeMin: null,
      preClassMax: 8,
      maxCredits: 8,
      source: 'UMD summer sessions are capped at 8 credits per session without Advising College approval.',
    };
  }
  return {
    kind: suffix === '08' ? 'fall' : 'spring',
    termLabel,
    fullTimeMin: 12,
    preClassMax: 16,
    maxCredits: 20,
    source: 'UMD fall/spring undergraduate full-time is 12+ credits; 17+ before classes and 21+ overall need Advising College approval.',
  };
}

function scheduleCreditLoadStatus(courses = [], selectedItems = [], prefs = DEFAULT_SCHEDULE_PREFS) {
  const courseList = Array.isArray(courses) ? courses : [];
  const selectedList = Array.isArray(selectedItems) ? selectedItems : [];
  const selectedCodes = new Set(selectedList.map(item => normalizeCode(item.course?.code || item.section?.course || '')));
  const totalCredits = courseList.reduce((sum, course) => sum + scheduleCourseCredits(course), 0);
  const pickedCredits = selectedList.reduce((sum, item) => sum + scheduleCourseCredits(item.course), 0);
  const missingCredits = courseList
    .filter(course => !selectedCodes.has(normalizeCode(course.code || '')))
    .reduce((sum, course) => sum + scheduleCourseCredits(course), 0);
  const policy = scheduleTermCreditPolicy(prefs);
  const window = scheduleCalendarTermWindow(prefs?.term || '', prefs);
  const registrationDate = scheduleDateInputToUtc(prefs?.registrationDate);
  const beforeFirstDay = registrationDate && window?.start ? registrationDate < window.start : null;
  const value = courseList.length ? `${pickedCredits}/${totalCredits} cr` : 'n/a';
  const notes = [];
  const fixes = [];
  let level = 'ok';
  let label = 'Credit load ready';

  const raise = next => {
    if (next === 'danger' || (next === 'warn' && level !== 'danger')) level = next;
  };

  if (!courseList.length) {
    return {
      level: 'ok',
      label: 'No credit load',
      value,
      detail: 'No current-term registration credits need review.',
      fix: 'No credit-load fix is needed for this term.',
      totalCredits,
      pickedCredits,
      missingCredits,
      policy,
    };
  }

  if (missingCredits) notes.push(`${missingCredits} planned credit${missingCredits === 1 ? '' : 's'} still need exact section picks.`);

  if (policy.fullTimeMin && totalCredits < policy.fullTimeMin) {
    raise('warn');
    label = 'Below full time';
    notes.push(`${totalCredits} planned credits is below UMD's ${policy.fullTimeMin}-credit fall/spring full-time threshold.`);
    fixes.push('Add enough credits for full-time status or confirm reduced-load, financial-aid, housing, athletics, and visa implications with the right office.');
  }

  if (policy.kind === 'fall' || policy.kind === 'spring') {
    if (totalCredits > policy.maxCredits) {
      raise('danger');
      label = 'Credit overload';
      notes.push(`${totalCredits} credits exceeds UMD's ${policy.maxCredits}-credit fall/spring cap without Advising College approval.`);
      fixes.push('Reduce the term below the credit cap or get Advising College approval before registration.');
    } else if (totalCredits > policy.preClassMax) {
      if (beforeFirstDay === true) {
        raise('danger');
        label = 'Approval needed';
        notes.push(`${totalCredits} credits exceeds the ${policy.preClassMax}-credit pre-class registration limit for ${policy.termLabel}.`);
        fixes.push('Move a course, wait until schedule adjustment if appropriate, or request Advising College approval for the overload.');
      } else {
        raise('warn');
        label = 'Overload review';
        notes.push(`${totalCredits} credits is above the ${policy.preClassMax}-credit pre-class registration threshold; confirm whether approval is needed for this timing.`);
        fixes.push('Confirm credit-overload approval rules with your Advising College before submitting in Testudo.');
      }
    }
  } else if (totalCredits > policy.maxCredits) {
    raise(policy.kind === 'summer' && totalCredits <= policy.maxCredits * 2 ? 'warn' : 'danger');
    label = policy.kind === 'summer' ? 'Session review' : 'Credit overload';
    notes.push(`${totalCredits} credits exceeds the posted ${policy.termLabel} per-session credit limit of ${policy.maxCredits}.`);
    fixes.push('Split summer credits by session or request Advising College approval before registration.');
  }

  if (level === 'ok') {
    label = 'Credit load ready';
    notes.push(`${totalCredits} planned credits fit the current UMD ${policy.termLabel} credit-load checks.`);
  }

  const detail = `${pickedCredits}/${totalCredits} credits have exact section picks. ${notes.slice(0, 3).join(' ')} ${policy.source}`.trim();
  return {
    level,
    label,
    value,
    detail,
    fix: fixes[0] || 'No credit-load fix is needed after normal advisor review.',
    totalCredits,
    pickedCredits,
    missingCredits,
    policy,
    beforeFirstDay,
  };
}

function scheduleWorkloadBalance(courses = [], selectedItems = [], prefs = DEFAULT_SCHEDULE_PREFS, timing = null) {
  const courseList = Array.isArray(courses) ? courses : [];
  const selectedList = Array.isArray(selectedItems) ? selectedItems : [];
  const selectedCodes = new Set(selectedList.map(item => normalizeCode(item.course?.code || item.section?.course || '')));
  const totalCredits = courseList.reduce((sum, course) => sum + scheduleCourseCredits(course), 0);
  const pickedCredits = selectedList.reduce((sum, item) => sum + scheduleCourseCredits(item.course), 0);
  const missing = courseList.filter(course => !selectedCodes.has(normalizeCode(course.code)));
  const fit = timing || scheduleTimingFit(selectedList, prefs, []);
  const blocks = selectedList.flatMap(item => sectionBlocks(item.section, item.course));
  const weeklyMinutes = blocks.reduce((sum, block) => sum + Math.max(0, block.end - block.start), 0);
  const tbaPicks = selectedList.filter(item => !sectionBlocks(item.section, item.course).length);
  const dayRows = SCHEDULE_DAY_DEFS.map(day => {
    const dayBlocks = blocks.filter(block => block.day === day.key);
    const codes = Array.from(new Set(dayBlocks.map(block => normalizeCode(block.code)).filter(Boolean)));
    const credits = selectedList
      .filter(item => codes.includes(normalizeCode(item.course?.code || '')))
      .reduce((sum, item) => sum + scheduleCourseCredits(item.course), 0);
    const minutes = dayBlocks.reduce((sum, block) => sum + Math.max(0, block.end - block.start), 0);
    return {
      day,
      minutes,
      courseCount: codes.length,
      credits,
      label: day.label,
      detail: codes.length
        ? `${codes.map(displayCode).join(', ')} · ${scheduleDurationLabel(minutes)} in class`
        : 'No picked classes',
    };
  });
  const activeRows = dayRows.filter(row => row.minutes > 0);
  const busiest = activeRows.slice().sort((a, b) => b.minutes - a.minutes || b.courseCount - a.courseCount)[0] || null;
  const activeDays = activeRows.length;
  const creditsPerActiveDay = activeDays ? pickedCredits / activeDays : 0;
  const heavyDayCount = activeRows.filter(row => row.minutes >= 4 * 60 || row.courseCount >= 3).length;
  const flags = [];
  if (!courseList.length) flags.push('No unsatisfied UMD-coded courses are in this semester.');
  if (missing.length) flags.push(`${missing.length} course${missing.length === 1 ? '' : 's'} still ${missing.length === 1 ? 'needs' : 'need'} picked sections before the workload picture is complete.`);
  if (tbaPicks.length) flags.push(`${tbaPicks.length} picked section${tbaPicks.length === 1 ? '' : 's'} still has time TBA.`);
  if (pickedCredits >= 18) flags.push(`${pickedCredits} picked credits is a heavy registration load.`);
  else if (totalCredits >= 16) flags.push(`${totalCredits} planned credits is a full-time load; confirm work, commute, and study time fit.`);
  if (weeklyMinutes >= 15 * 60) flags.push(`${scheduleDurationLabel(weeklyMinutes)} of weekly in-class time is high for a single term.`);
  if (heavyDayCount) flags.push(`${heavyDayCount} active day${heavyDayCount === 1 ? '' : 's'} carry at least 4 hours in class or 3 courses.`);
  if (creditsPerActiveDay >= 5.5 && activeDays) flags.push(`${creditsPerActiveDay.toFixed(1)} credits per active day means this schedule is very compressed.`);
  if (busiest) flags.push(`${busiest.label} is busiest: ${scheduleDurationLabel(busiest.minutes)} across ${busiest.courseCount} course${busiest.courseCount === 1 ? '' : 's'}.`);
  if (!flags.length) flags.push('Workload looks balanced after normal section and advisor review.');

  const danger = pickedCredits >= 18 || weeklyMinutes >= 18 * 60 || heavyDayCount >= 3 || creditsPerActiveDay >= 7;
  const warn = !danger && (!!missing.length || !!tbaPicks.length || totalCredits >= 16 || weeklyMinutes >= 12 * 60 || heavyDayCount > 0 || fit.score < 76);
  const level = !courseList.length ? 'ok' : !selectedList.length ? 'warn' : danger ? 'danger' : warn ? 'warn' : 'ok';
  const label = !courseList.length ? 'No workload'
    : !selectedList.length ? 'Pick sections'
      : danger ? 'Heavy week'
        : warn ? 'Review workload'
          : 'Balanced workload';
  const detail = !courseList.length
    ? 'This term has no open schedule-ready courses.'
    : !selectedList.length
      ? `${totalCredits} planned credits need section picks before weekly workload can be trusted.`
      : `${pickedCredits}/${totalCredits} credits scheduled with ${scheduleDurationLabel(weeklyMinutes)} weekly in-class time across ${activeDays || 0} active day${activeDays === 1 ? '' : 's'}.`;

  return {
    level,
    label,
    detail,
    totalCredits,
    pickedCredits,
    missingCount: missing.length,
    tbaCount: tbaPicks.length,
    weeklyMinutes,
    weeklyHours: Math.round((weeklyMinutes / 60) * 10) / 10,
    activeDays,
    creditsPerActiveDay,
    heavyDayCount,
    busiest,
    dayRows,
    flags: Array.from(new Set(flags)).slice(0, 5),
  };
}

function renderScheduleWorkloadHtml(workload, heading = 'Workload Balance') {
  if (!workload) return '';
  const metrics = [
    { label: 'Credits', value: `${workload.pickedCredits}/${workload.totalCredits}` },
    { label: 'Weekly class time', value: scheduleDurationLabel(workload.weeklyMinutes) },
    { label: 'Active days', value: String(workload.activeDays || 0) },
    { label: 'TBA picks', value: String(workload.tbaCount || 0) },
  ];
  const dayRows = (workload.dayRows || []).filter(row => row.minutes > 0);
  return `
    <section class="schedule-workload-card ${scheduleEscape(workload.level)}">
      <div class="schedule-workload-head">
        <div>
          <h4>${scheduleEscape(heading)}</h4>
          <span>${scheduleEscape(workload.detail)}</span>
        </div>
        <strong>${scheduleEscape(workload.label)}</strong>
      </div>
      <div class="schedule-workload-metrics">
        ${metrics.map(row => `<span><strong>${scheduleEscape(row.value)}</strong><em>${scheduleEscape(row.label)}</em></span>`).join('')}
      </div>
      ${dayRows.length ? `<div class="schedule-workload-days">
        ${dayRows.map(row => `
          <span>
            <strong>${scheduleEscape(row.label)}</strong>
            <em>${scheduleEscape(`${scheduleDurationLabel(row.minutes)} · ${row.courseCount} course${row.courseCount === 1 ? '' : 's'}`)}</em>
          </span>
        `).join('')}
      </div>` : ''}
      <div class="schedule-workload-flags">
        ${(workload.flags || []).map(flag => `<span>${scheduleEscape(flag)}</span>`).join('')}
      </div>
    </section>
  `;
}

function scheduleWorkloadText(workload) {
  if (!workload) return [];
  const lines = [
    '',
    'Workload balance:',
    `- Overall: ${workload.label}. ${workload.detail}`,
    `- Metrics: ${workload.pickedCredits}/${workload.totalCredits} credits; ${scheduleDurationLabel(workload.weeklyMinutes)} weekly class time; ${workload.activeDays || 0} active day${workload.activeDays === 1 ? '' : 's'}; ${workload.tbaCount || 0} TBA pick${workload.tbaCount === 1 ? '' : 's'}.`,
  ];
  (workload.dayRows || [])
    .filter(row => row.minutes > 0)
    .forEach(row => lines.push(`- ${row.label}: ${scheduleDurationLabel(row.minutes)} across ${row.courseCount} course${row.courseCount === 1 ? '' : 's'}.`));
  (workload.flags || []).forEach(flag => lines.push(`- Note: ${flag}`));
  return lines;
}

function sectionScore(section, prefs = DEFAULT_SCHEDULE_PREFS, course = null, chosen = []) {
  const open = parseInt(section.open_seats, 10);
  const wait = parseInt(section.waitlist, 10);
  const seatRisk = sectionSeatRisk(section);
  const blocks = sectionBlocks(section, course);
  const midpoint = blocks.length
    ? blocks.reduce((sum, b) => sum + ((b.start + b.end) / 2), 0) / blocks.length
    : 13 * 60;
  let score = (Number.isFinite(open) ? open : 0) * (prefs.mode === 'open-seats' ? 34 : 20)
    - (Number.isFinite(wait) ? wait : 0) * 30
    + (sectionHasTimedMeetings(section) ? 80 : 0)
    + seatRisk.score
    - sectionPreferencePenalty(section, prefs, course);
  if (prefs.mode === 'mornings') score -= Math.max(0, midpoint - 11 * 60) / 3;
  if (prefs.mode === 'afternoons') score -= Math.max(0, 13 * 60 - midpoint) / 3;
  if (prefs.mode === 'compact' && chosen.length) {
    const existing = chosen.flatMap(item => sectionBlocks(item.section, item.course));
    blocks.forEach(block => {
      const sameDay = existing.filter(b => b.day === block.day);
      if (!sameDay.length) { score -= 55; return; }
      const nearestGap = Math.min(...sameDay.map(b => {
        if (block.end <= b.start) return b.start - block.end;
        if (b.end <= block.start) return block.start - b.end;
        return 0;
      }));
      score -= Math.min(90, nearestGap / 4);
    });
  }
  return score;
}

function scheduleSelectedItemsFor(semId, term, courses, sectionsByCode) {
  const selectedItems = [];
  courses.forEach(course => {
    const norm = normalizeCode(course.code);
    const selected = getSelectedSection(semId, course.code);
    if (!selected || String(selected.semester || '') !== String(term)) return;
    const fresh = (sectionsByCode[norm] || []).find(s => s.section_id === selected.section_id);
    selectedItems.push({ course, section: { ...(fresh || selected), pinned: !!selected.pinned } });
  });
  return selectedItems;
}

function scheduleCandidateSignature(items) {
  return items
    .map(item => `${normalizeCode(item.course.code)}:${item.section.section_id}`)
    .sort()
    .join('|');
}

function evaluateScheduleCandidate(items, prefs) {
  const { conflicts } = detectScheduleConflicts(items);
  const warnings = selectedScheduleWarnings(items, prefs);
  const locationReport = scheduleCandidateLocationReport(items, prefs);
  const timing = scheduleTimingFit(items, prefs, conflicts);
  const openSeats = items.reduce((sum, item) => {
    const open = parseInt(item.section.open_seats, 10);
    return sum + (Number.isFinite(open) ? open : 0);
  }, 0);
  const score = items.reduce((sum, item) => sum + sectionScore(item.section, prefs, item.course, items), 0)
    + (items.length * 500)
    + openSeats
    + timing.scoreAdjustment
    - (conflicts.length * 10000)
    - (warnings.length * 130)
    - locationReport.penalty;
  return { conflicts, warnings, openSeats, score, locationIssues: locationReport.alertCount, timing };
}

function buildScheduleCandidate(courses, sectionsByCode, prefs, variant = 0, currentItems = []) {
  const chosen = currentItems
    .filter(item => item.section && item.section.pinned)
    .map(item => ({ course: item.course, section: item.section }));
  const pinnedCodes = new Set(chosen.map(item => normalizeCode(item.course.code)));
  const skipped = [];
  const sortedCourses = courses
    .filter(course => !pinnedCodes.has(normalizeCode(course.code)))
    .sort((a, b) => {
      const sa = (sectionsByCode[normalizeCode(a.code)] || []).length;
      const sb = (sectionsByCode[normalizeCode(b.code)] || []).length;
      return sa - sb || a.code.localeCompare(b.code);
    });

  sortedCourses.forEach((course, courseIdx) => {
    const sections = (sectionsByCode[normalizeCode(course.code)] || [])
      .slice()
      .sort((a, b) => sectionScore(b, prefs, course, chosen) - sectionScore(a, prefs, course, chosen));
    if (!sections.length) { skipped.push(course.code); return; }
    const viable = sections.filter(section => {
      const candidateBlocks = sectionBlocks(section, course);
      const existingBlocks = chosen.flatMap(item => sectionBlocks(item.section, item.course));
      const blockedOverlap = sectionBlockedOverlaps(section, prefs, course).length > 0;
      return !blockedOverlap && !candidateBlocks.some(a => existingBlocks.some(b => blocksConflict(a, b)));
    });
    const pool = viable.length ? viable : sections;
    const windowSize = Math.min(pool.length, 4);
    const pickIdx = windowSize ? ((variant + courseIdx) % windowSize) : 0;
    chosen.push({ course, section: pool[pickIdx] });
  });

  const evaluation = evaluateScheduleCandidate(chosen, prefs);
  return {
    items: chosen,
    skipped,
    signature: scheduleCandidateSignature(chosen),
    ...evaluation,
  };
}

async function scheduleFetchSectionsFor(semId, term, courses, force = false) {
  const out = {};
  await Promise.all(courses.map(async course => {
    const key = scheduleSectionCacheKey(semId, term, course.code);
    if (!force && scheduleSectionsCache[key]) {
      out[normalizeCode(course.code)] = scheduleSectionsCache[key];
      return;
    }
    const sections = await umdioFetchSections(course.code, term);
    scheduleSectionsCache[key] = sections;
    scheduleSectionsMeta[key] = {
      fetchedAt: new Date().toISOString(),
      source: force ? 'manual refresh' : 'live fetch',
      count: Array.isArray(sections) ? sections.length : 0,
    };
    out[normalizeCode(course.code)] = sections;
  }));
  return out;
}

function renderScheduleSummary(courses, selectedItems, conflicts, warnings, term) {
  const root = document.getElementById('schedule-summary');
  if (!root) return;
  const picked = selectedItems.length;
  const totalOpenSeats = selectedItems.reduce((sum, item) => {
    const open = parseInt(item.section.open_seats, 10);
    return sum + (Number.isFinite(open) ? open : 0);
  }, 0);
  root.innerHTML = `
    <div class="schedule-stat"><strong>${picked}/${courses.length}</strong><span>sections picked</span></div>
    <div class="schedule-stat ${conflicts.length ? 'danger' : 'ok'}"><strong>${conflicts.length}</strong><span>time conflicts</span></div>
    <div class="schedule-stat ${warnings.length ? 'warn' : 'ok'}"><strong>${warnings.length}</strong><span>schedule warnings</span></div>
    <div class="schedule-stat"><strong>${totalOpenSeats}</strong><span>open seats in picks</span></div>
  `;
}

function scheduleReadinessMapSectionsFor(semId, term, courses, currentSectionsByCode = {}, currentSemId = '') {
  const out = {};
  (courses || []).forEach(course => {
    const norm = normalizeCode(course.code);
    const key = scheduleSectionCacheKey(semId, term, course.code);
    out[norm] = semId === currentSemId
      ? (currentSectionsByCode[norm] || [])
      : (scheduleSectionsCache[key] || []);
  });
  return out;
}

function scheduleReadinessMapLoadedCount(semId, term, courses, sectionsByCode, activeSemId = '') {
  return (courses || []).filter(course => {
    const key = scheduleSectionCacheKey(semId, term, course.code);
    return semId === activeSemId || !!scheduleSectionsMeta[key] || Array.isArray(scheduleSectionsCache[key]);
  }).length;
}

function scheduleReadinessMapStatus(row) {
  if (!row.courses.length) return { label: 'Clear', detail: 'No open UMD-coded courses in this term.' };
  if (row.readiness.unscheduled.length) {
    return {
      label: 'Needs sections',
      detail: `Pick sections for ${row.readiness.unscheduled.slice(0, 3).map(course => course.code).join(', ')}${row.readiness.unscheduled.length > 3 ? ` +${row.readiness.unscheduled.length - 3}` : ''}.`,
    };
  }
  if (row.conflicts.length) return { label: 'Conflicts', detail: `${row.conflicts.length} time overlap${row.conflicts.length === 1 ? '' : 's'} to resolve.` };
  const risky = row.selectedItems.filter(item => ['closed', 'risk'].includes(sectionSeatRisk(item.section).level));
  if (risky.length) return { label: 'Seat risk', detail: `${risky.length} picked section${risky.length === 1 ? '' : 's'} with low or closed seats.` };
  const dangerGate = (row.readiness.gates || []).find(gate => gate.level === 'danger');
  if (dangerGate) return { label: dangerGate.label, detail: dangerGate.detail };
  if (row.readiness.warnCount) return { label: 'Review', detail: row.readiness.fixes[0] || row.readiness.detail };
  return { label: 'Ready', detail: 'Picked sections clear core registration checks.' };
}

function scheduleReadinessMapRows(activeSemId, activeTerm, activeCourses, activeSelectedItems, activeConflicts, activeWarnings, activeSectionsByCode) {
  return getAllSemesters().map(sem => {
    const isActive = sem.id === activeSemId;
    const term = isActive
      ? activeTerm
      : ((state.schedulePrefs || {})[sem.id]?.term || scheduleInferTermCode(sem));
    const courses = isActive ? activeCourses : scheduleCoursesForSemester(sem.id);
    const prefs = getSchedulePrefs(sem.id);
    const sectionsByCode = scheduleReadinessMapSectionsFor(sem.id, term, courses, activeSectionsByCode, activeSemId);
    const selectedItems = isActive
      ? activeSelectedItems
      : scheduleSelectedItemsFor(sem.id, term, courses, sectionsByCode);
    const conflicts = isActive ? activeConflicts : detectScheduleConflicts(selectedItems).conflicts;
    const warnings = isActive ? activeWarnings : selectedScheduleWarnings(selectedItems, prefs);
    const readiness = scheduleRegistrationReadiness(courses, selectedItems, conflicts, warnings, prefs, null, sem.id);
    const loadedCount = scheduleReadinessMapLoadedCount(sem.id, term, courses, sectionsByCode, activeSemId);
    const postedCount = Object.values(sectionsByCode).reduce((sum, sections) => sum + ((sections || []).length), 0);
    const row = {
      sem,
      term,
      courses,
      selectedItems,
      conflicts,
      warnings,
      readiness,
      loadedCount,
      postedCount,
      isActive,
    };
    row.status = scheduleReadinessMapStatus(row);
    return row;
  });
}

function scheduleReadinessMapLoadTargets(activeSemId = scheduleCurrentSemId || scheduleDefaultSemesterId()) {
  return getAllSemesters()
    .map(sem => {
      const courses = scheduleCoursesForSemester(sem.id);
      const term = ((state.schedulePrefs || {})[sem.id]?.term || scheduleInferTermCode(sem));
      const loadedCount = scheduleReadinessMapLoadedCount(sem.id, term, courses, {}, activeSemId);
      return { sem, term, courses, loadedCount };
    })
    .filter(row => row.courses.length && row.loadedCount < row.courses.length);
}

async function loadScheduleReadinessMapData() {
  if (scheduleReadinessMapLoading) return;
  const activeSemId = scheduleCurrentSemId || scheduleDefaultSemesterId();
  const targets = scheduleReadinessMapLoadTargets(activeSemId);
  if (!targets.length) {
    if (typeof toastInfo === 'function') toastInfo('Readiness map already has loaded section evidence.');
    return;
  }
  scheduleReadinessMapLoading = true;
  const root = document.getElementById('schedule-readiness-map');
  const btn = root?.querySelector('[data-schedule-map-load]');
  const status = document.getElementById('schedule-status');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Loading...';
  }
  try {
    for (const row of targets) {
      if (status) status.textContent = `Loading ${row.sem.name || row.sem.id} section evidence...`;
      await scheduleFetchSectionsFor(row.sem.id, row.term, row.courses, false);
    }
    await renderSchedule();
    if (status) status.textContent = `Loaded readiness map data for ${targets.length} term${targets.length === 1 ? '' : 's'}.`;
    if (typeof toastSuccess === 'function') toastSuccess(`Loaded readiness map data for ${targets.length} term${targets.length === 1 ? '' : 's'}.`);
  } catch (error) {
    if (status) status.textContent = 'Could not load readiness map section data.';
    if (typeof toastError === 'function') toastError('Could not load readiness map data. Try again in a moment.');
  } finally {
    scheduleReadinessMapLoading = false;
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Load map data';
    }
  }
}

function scheduleReadinessMapPickTargets(activeSemId = scheduleCurrentSemId || scheduleDefaultSemesterId()) {
  return getAllSemesters()
    .filter(sem => sem.id !== activeSemId)
    .map(sem => {
      const courses = scheduleCoursesForSemester(sem.id);
      const term = ((state.schedulePrefs || {})[sem.id]?.term || scheduleInferTermCode(sem));
      const sectionsByCode = scheduleReadinessMapSectionsFor(sem.id, term, courses, {}, '');
      const selectedItems = scheduleSelectedItemsFor(sem.id, term, courses, sectionsByCode);
      const postedCount = Object.values(sectionsByCode).reduce((sum, sections) => sum + ((sections || []).length), 0);
      return { sem, term, courses, sectionsByCode, selectedItems, postedCount };
    })
    .filter(row => row.courses.length && row.selectedItems.length < row.courses.length && row.postedCount > 0);
}

async function autoPickScheduleReadinessMap() {
  if (scheduleReadinessMapPicking) return;
  const activeSemId = scheduleCurrentSemId || scheduleDefaultSemesterId();
  const targets = scheduleReadinessMapPickTargets(activeSemId);
  if (!targets.length) {
    if (typeof toastInfo === 'function') toastInfo('Load map data before auto-picking other terms.');
    return;
  }
  scheduleReadinessMapPicking = true;
  const root = document.getElementById('schedule-readiness-map');
  const btn = root?.querySelector('[data-schedule-map-pick]');
  const status = document.getElementById('schedule-status');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Picking...';
  }
  let filled = 0;
  let terms = 0;
  const highlights = [];
  const undoChanges = [];
  try {
    targets.forEach(row => {
      const prefs = getSchedulePrefs(row.sem.id);
      const selectedCodes = new Set(row.selectedItems.map(item => normalizeCode(item.course.code)));
      const preserved = row.selectedItems.map(item => ({ course: item.course, section: { ...item.section, pinned: true } }));
      const candidate = buildScheduleCandidate(row.courses, row.sectionsByCode, prefs, 0, preserved);
      const newItems = candidate.items.filter(item => !selectedCodes.has(normalizeCode(item.course.code)));
      if (!newItems.length) return;
      candidate.items.forEach(item => {
        const previous = getSelectedSection(row.sem.id, item.course.code);
        setSelectedSection(row.sem.id, item.course.code, item.section);
        if (!selectedCodes.has(normalizeCode(item.course.code))) {
          undoChanges.push({
            semId: row.sem.id,
            semName: row.sem.name || row.sem.id,
            code: item.course.code,
            previousSection: scheduleCloneSection(previous),
            previousPinned: !!previous?.pinned,
            nextSection: scheduleCloneSection(item.section),
          });
        }
      });
      filled += newItems.length;
      terms += 1;
      highlights.push(`${row.sem.name || row.sem.id}: ${newItems.map(item => `${item.course.code} ${scheduleSectionShortLabel(item.section)}`).join(', ')}`);
    });
    if (filled) {
      registerScheduleUndo({
        type: 'readiness-map-auto-pick',
        title: `Auto-picked ${filled} Readiness Map section${filled === 1 ? '' : 's'}`,
        detail: `Undo restores previous picks across ${terms} loaded term${terms === 1 ? '' : 's'}.`,
        termCount: terms,
        changes: undoChanges,
      });
      recordPlanChange({
        type: 'auto-pick',
        source: 'Schedule',
        title: `Auto-picked ${filled} map section${filled === 1 ? '' : 's'}`,
        detail: `Filled missing section picks across ${terms} loaded term${terms === 1 ? '' : 's'} without changing the active term.`,
        meta: 'Readiness Map',
        highlights: highlights.slice(0, 6),
      }, { save: false });
      saveState();
      await renderSchedule();
      renderSemesters();
      if (status) status.textContent = `Auto-picked ${filled} section${filled === 1 ? '' : 's'} across ${terms} loaded term${terms === 1 ? '' : 's'}.`;
      if (typeof toastSuccess === 'function') toastSuccess(`Auto-picked ${filled} map section${filled === 1 ? '' : 's'}.`);
    } else if (typeof toastInfo === 'function') {
      toastInfo('No loaded map terms had pickable sections.');
    }
  } finally {
    scheduleReadinessMapPicking = false;
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Auto-pick loaded';
    }
  }
}

function renderScheduleReadinessMap(activeSemId, activeTerm, activeCourses, activeSelectedItems, activeConflicts, activeWarnings, activeSectionsByCode) {
  const root = document.getElementById('schedule-readiness-map');
  if (!root) return;
  const rows = scheduleReadinessMapRows(activeSemId, activeTerm, activeCourses, activeSelectedItems, activeConflicts, activeWarnings, activeSectionsByCode);
  const activeRows = rows.filter(row => row.courses.length);
  const readyRows = activeRows.filter(row => row.readiness.level === 'ok').length;
  const dangerRows = activeRows.filter(row => row.readiness.level === 'danger').length;
  const warnRows = activeRows.filter(row => row.readiness.level === 'warn').length;
  const loadTargetCount = activeRows.filter(row => row.loadedCount < row.courses.length).length;
  const pickTargetCount = scheduleReadinessMapPickTargets(activeSemId).length;
  root.innerHTML = `
    <section class="schedule-readiness-map-panel">
      <div class="schedule-readiness-map-head">
        <div>
          <h3>Readiness Map</h3>
          <span>${scheduleEscape(activeRows.length ? `${readyRows}/${activeRows.length} active terms registration-ready` : 'No open schedule-ready terms')}</span>
        </div>
        <div class="schedule-readiness-map-actions">
          <strong>${dangerRows ? `${dangerRows} fix` : warnRows ? `${warnRows} review` : 'Ready'}</strong>
          <button class="btn small" type="button" data-schedule-map-load ${loadTargetCount ? '' : 'disabled'} title="${scheduleEscape(loadTargetCount ? `Load section evidence for ${loadTargetCount} term${loadTargetCount === 1 ? '' : 's'}.` : 'All map terms have loaded evidence.')}">Load map data</button>
          <button class="btn small" type="button" data-schedule-map-pick ${pickTargetCount ? '' : 'disabled'} title="${scheduleEscape(pickTargetCount ? `Auto-pick missing sections for ${pickTargetCount} loaded non-active term${pickTargetCount === 1 ? '' : 's'}.` : 'Load non-active term section evidence before auto-picking.')}">Auto-pick loaded</button>
        </div>
      </div>
      <div class="schedule-readiness-term-grid">
        ${rows.map(row => `
          <button class="schedule-readiness-term ${scheduleEscape(row.readiness.level)}${row.isActive ? ' active' : ''}" type="button" data-schedule-jump-sem="${scheduleEscape(row.sem.id)}">
            <span class="schedule-readiness-term-head">
              <strong>${scheduleEscape(row.sem.name || row.sem.id)}</strong>
              <em>${scheduleEscape(scheduleTermLabel(row.term))} · ${row.courses.length} course${row.courses.length === 1 ? '' : 's'}</em>
            </span>
            <span class="schedule-readiness-term-metrics">
              <span><b>${row.selectedItems.length}/${row.courses.length}</b><small>picked</small></span>
              <span><b>${row.loadedCount}/${row.courses.length}</b><small>loaded</small></span>
              <span><b>${row.postedCount}</b><small>sections</small></span>
            </span>
            <span class="schedule-readiness-term-status">
              <b>${scheduleEscape(row.status.label)}</b>
              <small>${scheduleEscape(row.status.detail)}</small>
            </span>
          </button>
        `).join('')}
      </div>
    </section>
  `;
}

function scheduleAdvisorReadinessMapSummary(rows) {
  const activeRows = (rows || []).filter(row => row && row.courses && row.courses.length);
  const ready = activeRows.filter(row => row.readiness.level === 'ok').length;
  const danger = activeRows.filter(row => row.readiness.level === 'danger').length;
  const warn = activeRows.filter(row => row.readiness.level === 'warn').length;
  const label = danger ? `${danger} fix` : warn ? `${warn} review` : 'Ready';
  return { rows: activeRows, ready, danger, warn, label };
}

function scheduleAdvisorReadinessMapHtml(rows) {
  const summary = scheduleAdvisorReadinessMapSummary(rows);
  if (!summary.rows.length) return '';
  return `
    <section class="schedule-advisor-readiness-map">
      <div class="schedule-advisor-readiness-map-head">
        <div>
          <h4>Plan Readiness Map</h4>
          <span>${scheduleEscape(`${summary.ready}/${summary.rows.length} terms registration-ready across the plan.`)}</span>
        </div>
        <strong>${scheduleEscape(summary.label)}</strong>
      </div>
      <div class="schedule-advisor-readiness-map-list">
        ${summary.rows.map(row => `
          <div class="schedule-advisor-readiness-row ${scheduleEscape(row.readiness.level)}">
            <div>
              <strong>${scheduleEscape(row.sem.name || row.sem.id)}</strong>
              <span>${scheduleEscape(scheduleTermLabel(row.term))}</span>
            </div>
            <div>
              <b>${scheduleEscape(row.status.label)}</b>
              <span>${scheduleEscape(row.status.detail)}</span>
            </div>
            <em>${row.selectedItems.length}/${row.courses.length} picked · ${row.loadedCount}/${row.courses.length} loaded · ${row.postedCount} posted sections</em>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function scheduleAdvisorReadinessMapText(rows) {
  const summary = scheduleAdvisorReadinessMapSummary(rows);
  if (!summary.rows.length) return [];
  const lines = [
    '',
    'Plan readiness map:',
    `- Summary: ${summary.ready}/${summary.rows.length} terms registration-ready; ${summary.danger} fix; ${summary.warn} review.`,
  ];
  summary.rows.forEach(row => {
    lines.push(`- ${row.sem.name || row.sem.id} (${scheduleTermLabel(row.term)}): ${row.status.label}; ${row.selectedItems.length}/${row.courses.length} picked; ${row.loadedCount}/${row.courses.length} loaded; ${row.postedCount} posted sections.`);
    lines.push(`  ${row.status.detail}`);
  });
  return lines;
}

function renderScheduleWarnings(warnings) {
  const root = document.getElementById('schedule-warnings');
  if (!root) return;
  if (!warnings.length) {
    root.innerHTML = '<div class="schedule-warning ok">Schedule quality looks clean for the current preferences.</div>';
    return;
  }
  root.innerHTML = warnings.slice(0, 6)
    .map(w => `<div class="schedule-warning">${scheduleEscape(w)}</div>`)
    .join('');
}

function renderScheduleFitPanel(selectedItems, prefs, conflicts) {
  const root = document.getElementById('schedule-fit');
  if (!root) return;
  const fit = scheduleTimingFit(selectedItems, prefs, conflicts);
  const metrics = fit.metrics;
  const shortest = metrics.shortestBreak === null ? 'n/a' : scheduleDurationLabel(metrics.shortestBreak);
  root.innerHTML = `
    <div class="schedule-fit-panel ${scheduleEscape(fit.tone)}">
      <div class="schedule-fit-head">
        <div>
          <h3>Timing Fit</h3>
          <span>${scheduleEscape(fit.label)}</span>
        </div>
        <strong>${fit.score}/100</strong>
      </div>
      <div class="schedule-fit-metrics">
        <div><strong>${metrics.activeDays}</strong><span>active days</span></div>
        <div><strong>${scheduleEscape(scheduleDurationLabel(metrics.totalIdle))}</strong><span>idle time</span></div>
        <div><strong>${scheduleEscape(shortest)}</strong><span>shortest break</span></div>
        <div><strong>${scheduleEscape(scheduleDurationLabel(metrics.longestDay))}</strong><span>longest day</span></div>
      </div>
      <div class="schedule-fit-insights">
        ${fit.insights.map(insight => `<span>${scheduleEscape(insight)}</span>`).join('')}
      </div>
    </div>
  `;
}

function renderScheduleWorkloadPanel(courses, selectedItems, prefs, timing = null) {
  const root = document.getElementById('schedule-workload');
  if (!root) return;
  const workload = scheduleWorkloadBalance(courses, selectedItems, prefs, timing);
  root.innerHTML = renderScheduleWorkloadHtml(workload);
}

function scheduleTimingDiagnostics(timing) {
  const fit = timing || scheduleTimingFit([], DEFAULT_SCHEDULE_PREFS, []);
  const metrics = fit.metrics || {};
  const shortestBreak = metrics.shortestBreak === null || metrics.shortestBreak === undefined
    ? 'n/a'
    : scheduleDurationLabel(metrics.shortestBreak);
  const metricRows = [
    { label: 'Active days', value: String(metrics.activeDays || 0) },
    { label: 'Idle time', value: scheduleDurationLabel(metrics.totalIdle || 0) },
    { label: 'Shortest break', value: shortestBreak },
    { label: 'Longest day', value: scheduleDurationLabel(metrics.longestDay || 0) },
    { label: 'Tight moves', value: String(metrics.tightTransitions || 0) },
    { label: 'TBA picks', value: String(metrics.untimedCount || 0) },
  ];
  const insights = Array.isArray(fit.insights) && fit.insights.length
    ? fit.insights.slice(0, 5)
    : ['No timing notes available.'];
  const followups = [];
  if (fit.score < 61) followups.push('Review alternate sections before registration.');
  else if (fit.score < 76) followups.push('Consider whether another section would better match the listed timing notes.');
  if ((metrics.tightTransitions || 0) > 0) followups.push('Confirm back-to-back building changes are realistic.');
  if ((metrics.totalIdle || 0) >= 150) followups.push('Ask whether a tighter lecture, discussion, or lab combination exists.');
  if ((metrics.longestDay || 0) >= 7 * 60) followups.push('Confirm the longest day works with commuting, meals, and work commitments.');
  if ((metrics.untimedCount || 0) > 0) followups.push('Recheck TBA meeting times before locking the term.');
  if (!followups.length) followups.push('No timing-specific advisor follow-up needed after normal section review.');
  return {
    metricRows,
    insights,
    followups: Array.from(new Set(followups)).slice(0, 4),
  };
}

function scheduleAdvisorTimingDiagnosticsHtml(timing) {
  const diagnostics = scheduleTimingDiagnostics(timing);
  return `
    <section class="schedule-advisor-diagnostics">
      <div class="schedule-advisor-diagnostics-head">
        <div>
          <h4>Timing Diagnostics</h4>
          <span>${scheduleEscape(timing.label)} · ${timing.score}/100 fit</span>
        </div>
        <strong>${scheduleEscape(timing.tone === 'ok' ? 'Ready' : timing.tone === 'warn' ? 'Review' : 'Fix first')}</strong>
      </div>
      <div class="schedule-advisor-diagnostic-metrics">
        ${diagnostics.metricRows.map(row => `<span><strong>${scheduleEscape(row.value)}</strong><em>${scheduleEscape(row.label)}</em></span>`).join('')}
      </div>
      <div class="schedule-advisor-diagnostic-notes">
        <div class="schedule-advisor-diagnostic-list">
          <strong>What to check</strong>
          ${diagnostics.insights.map(insight => `<span>${scheduleEscape(insight)}</span>`).join('')}
        </div>
        <div class="schedule-advisor-diagnostic-list">
          <strong>Advisor follow-up</strong>
          ${diagnostics.followups.map(followup => `<span>${scheduleEscape(followup)}</span>`).join('')}
        </div>
      </div>
    </section>
  `;
}

function scheduleAdvisorTimingDiagnosticsText(timing) {
  const diagnostics = scheduleTimingDiagnostics(timing);
  return [
    'Timing diagnostics:',
    `- Timing fit: ${timing.score}/100 - ${timing.label}`,
    `- Metrics: ${diagnostics.metricRows.map(row => `${row.label} ${row.value}`).join(' / ')}`,
    ...diagnostics.insights.map(insight => `- Check: ${insight}`),
    ...diagnostics.followups.map(followup => `- Follow-up: ${followup}`),
  ];
}

function scheduleRegistrationGate(id, label, level, value, detail) {
  return { id, label, level, value, detail };
}

function scheduleSemesterIndex(semId = '') {
  if (!semId) return -1;
  return getAllSemesters().findIndex(sem => sem.id === semId);
}

function schedulePlannedCourseIndex(code) {
  const target = normalizeCode(code);
  if (!target) return -1;
  const sems = getAllSemesters();
  for (let idx = 0; idx < sems.length; idx++) {
    const courses = [
      ...(sems[idx].courses || []),
      ...(state.customCourses || []).filter(course => course.semId === sems[idx].id),
    ];
    if (courses.some(course => normalizeCode(course.code || '') === target)) return idx;
  }
  return -1;
}

function schedulePrereqPendingStatus(code, semId = '') {
  const display = displayCode(code || '');
  const status = getCourseState(display);
  if (status.status === 'passed' || status.status === 'transfer') return { met: true, label: 'complete' };
  if (status.status === 'failed') return { met: false, pending: false, label: 'failed' };
  if (status.status === 'in-progress') return { met: false, pending: true, label: 'in progress' };
  const currentIdx = scheduleSemesterIndex(semId);
  const plannedIdx = schedulePlannedCourseIndex(display);
  if (currentIdx >= 0 && plannedIdx >= 0 && plannedIdx < currentIdx) {
    return { met: false, pending: true, label: 'planned earlier' };
  }
  return { met: false, pending: false, label: plannedIdx >= 0 ? 'planned later or same term' : 'not in completed record' };
}

function scheduleCoursePrereqStatus(course, semId = '') {
  const status = prereqsMet(course || {});
  if (status.met) {
    return {
      level: 'ok',
      label: 'Prereqs ready',
      missing: '',
      detail: 'Prerequisites are marked passed or transferred.',
      options: [],
    };
  }
  const options = (Array.isArray(status.missingGroup) && status.missingGroup.length
    ? status.missingGroup
    : [status.missing || 'prereq needed'])
    .map(displayCode)
    .filter(Boolean);
  const optionText = options.join(' or ') || 'prereq needed';
  const pending = options
    .map(code => ({ code, ...schedulePrereqPendingStatus(code, semId) }))
    .filter(row => row.pending);
  if (pending.length) {
    const pendingText = pending.map(row => `${row.code} ${row.label}`).join(' or ');
    return {
      level: 'warn',
      label: 'Prereq pending',
      missing: optionText,
      detail: `${course?.code || 'Course'}: ${pendingText}; confirm completion before Testudo allows registration.`,
      options,
      pending,
    };
  }
  return {
    level: 'danger',
    label: 'Prereq blocked',
    missing: optionText,
    detail: `${course?.code || 'Course'}: missing ${optionText}. Mark it passed/transfer or move this course after the prerequisite.`,
    options,
    pending,
  };
}

function schedulePrereqRows(courses = [], semId = '') {
  return (courses || [])
    .map(course => {
      const prereq = scheduleCoursePrereqStatus(course, semId);
      if (prereq.level === 'ok') return null;
      return {
        course,
        code: course?.code || '',
        label: course?.code || 'Course',
        prereq,
        level: prereq.level,
        detail: prereq.detail,
      };
    })
    .filter(Boolean);
}

function scheduleCoreqRequirementStatus(code, courses = [], selectedItems = [], semId = '') {
  const display = displayCode(code || '');
  const normalized = normalizeCode(display);
  const currentCodes = new Set((courses || []).map(course => normalizeCode(course.code || '')));
  const selectedCodes = new Set((selectedItems || []).map(item => normalizeCode(item.course?.code || item.section?.course || '')));
  const status = getCourseState(display);
  if (status.status === 'passed' || status.status === 'transfer') {
    return { code: display, level: 'ok', label: 'complete', detail: `${display} complete` };
  }
  if (selectedCodes.has(normalized)) {
    return { code: display, level: 'ok', label: 'picked concurrently', detail: `${display} picked concurrently` };
  }
  if (currentCodes.has(normalized)) {
    return {
      code: display,
      level: 'danger',
      label: 'needs section',
      detail: `${display} is planned this term but still needs a picked section`,
    };
  }
  if (status.status === 'in-progress') {
    return {
      code: display,
      level: 'warn',
      label: 'in progress',
      detail: `${display} in progress; confirm completion or add a same-term section`,
    };
  }
  if (status.status === 'failed') {
    return {
      code: display,
      level: 'danger',
      label: 'failed',
      detail: `${display} failed; retake it or add a same-term section`,
    };
  }
  const currentIdx = scheduleSemesterIndex(semId);
  const plannedIdx = schedulePlannedCourseIndex(display);
  if (currentIdx >= 0 && plannedIdx >= 0 && plannedIdx < currentIdx) {
    return {
      code: display,
      level: 'warn',
      label: 'planned earlier',
      detail: `${display} planned earlier; confirm completion before registration`,
    };
  }
  return {
    code: display,
    level: 'danger',
    label: plannedIdx >= 0 ? 'not concurrent' : 'missing',
    detail: plannedIdx >= 0
      ? `${display} is planned later, not concurrent with this course`
      : `${display} is not completed or picked in this term`,
  };
}

function scheduleCourseCoreqStatus(course, courses = [], selectedItems = [], semId = '') {
  const courseCode = course?.code || 'Course';
  const courseKey = normalizeCode(courseCode);
  const required = (Array.isArray(course?.coreqs) ? course.coreqs : [])
    .map(displayCode)
    .filter(Boolean)
    .filter(code => normalizeCode(code) !== courseKey);
  if (!required.length) {
    return {
      level: 'ok',
      label: 'Coreqs ready',
      missing: '',
      detail: 'No corequisites are required.',
      requirements: [],
    };
  }
  const requirements = required.map(code => scheduleCoreqRequirementStatus(code, courses, selectedItems, semId));
  const blocked = requirements.filter(row => row.level === 'danger');
  const pending = requirements.filter(row => row.level === 'warn');
  if (blocked.length) {
    return {
      level: 'danger',
      label: 'Coreq blocked',
      missing: blocked.map(row => row.code).join(', '),
      detail: `${courseCode}: ${blocked.map(row => row.detail).join('; ')}. Add/pick the corequisite or confirm prior credit before registering.`,
      requirements,
      blocked,
      pending,
    };
  }
  if (pending.length) {
    return {
      level: 'warn',
      label: 'Coreq review',
      missing: pending.map(row => row.code).join(', '),
      detail: `${courseCode}: ${pending.map(row => row.detail).join('; ')}.`,
      requirements,
      blocked,
      pending,
    };
  }
  return {
    level: 'ok',
    label: 'Coreqs ready',
    missing: '',
    detail: 'Corequisites are complete or picked concurrently.',
    requirements,
  };
}

function scheduleCoreqRows(courses = [], selectedItems = [], semId = '') {
  return (courses || [])
    .map(course => {
      const coreq = scheduleCourseCoreqStatus(course, courses, selectedItems, semId);
      if (coreq.level === 'ok') return null;
      return {
        course,
        code: course?.code || '',
        label: course?.code || 'Course',
        coreq,
        level: coreq.level,
        detail: coreq.detail,
      };
    })
    .filter(Boolean);
}

function scheduleRegistrationFixList(gates, courseList, unscheduled, urgentSeats, watchSeats, timing, nonSeatWarnings, eligibilityRows = [], prereqRows = [], coreqRows = [], creditLoad = null) {
  if (!courseList.length) return ['No registration fixes are needed for this semester.'];
  const fixes = [];
  const gateById = Object.fromEntries((gates || []).map(gate => [gate.id, gate]));
  if (gateById.sections?.level === 'danger') {
    const names = (unscheduled || []).slice(0, 4).map(course => course.code).join(', ');
    fixes.push(`Pick sections for ${names || 'all remaining courses'}; use Auto-pick first, then choose manually for courses without posted sections.`);
  }
  if (gateById.credits?.level === 'danger' || gateById.credits?.level === 'warn') {
    fixes.push(creditLoad?.fix || 'Review current-term credits against UMD full-time and overload rules before submitting in Testudo.');
  }
  if (gateById.prereqs?.level === 'danger') {
    const names = (prereqRows || []).filter(row => row.level === 'danger').slice(0, 3).map(row => row.label).join(', ');
    fixes.push(`Resolve missing prerequisites for ${names || 'locked courses'} by marking completed credit or moving the course after its prerequisite.`);
  } else if (gateById.prereqs?.level === 'warn') {
    const names = (prereqRows || []).slice(0, 3).map(row => row.label).join(', ');
    fixes.push(`Confirm pending prerequisite completion for ${names || 'courses with in-progress prerequisites'} before submitting in Testudo.`);
  }
  if (gateById.coreqs?.level === 'danger') {
    const names = (coreqRows || []).filter(row => row.level === 'danger').slice(0, 3).map(row => row.label).join(', ');
    fixes.push(`Add or pick required corequisites for ${names || 'courses with co-requisites'} before registration, or mark already-completed credit.`);
  } else if (gateById.coreqs?.level === 'warn') {
    const names = (coreqRows || []).slice(0, 3).map(row => row.label).join(', ');
    fixes.push(`Confirm pending corequisite completion or same-term sections for ${names || 'courses with co-requisites'} before submitting in Testudo.`);
  }
  if (gateById.conflicts?.level === 'danger') {
    fixes.push('Generate alternatives or switch one overlapping section until the weekly grid has 0 conflicts.');
  }
  if (gateById.seats?.level === 'danger') {
    const names = (urgentSeats || []).slice(0, 3).map(row => row.label).join(', ');
    fixes.push(`Apply a backup section or choose a higher-seat section for ${names || 'risky seat picks'} before registration.`);
  } else if (gateById.seats?.level === 'warn') {
    const names = (watchSeats || []).slice(0, 3).map(row => row.label).join(', ');
    fixes.push(`Keep a backup ready for ${names || 'watched sections'} and recheck seats before your registration time.`);
  }
  if (gateById.eligibility?.level === 'danger') {
    const names = (eligibilityRows || []).slice(0, 3).map(row => row.label).join(', ');
    fixes.push(`Confirm Testudo eligibility, permission, or a less restricted section for ${names || 'restricted picks'} before registration.`);
  } else if (gateById.eligibility?.level === 'warn') {
    const names = (eligibilityRows || []).slice(0, 3).map(row => row.label).join(', ');
    fixes.push(`Review posted section eligibility notes for ${names || 'picked sections'} before submitting in Testudo.`);
  }
  if (gateById.timing?.level === 'danger') {
    fixes.push('Generate alternatives around saved timing preferences before registering.');
  } else if (gateById.timing?.level === 'warn') {
    const tba = timing?.metrics?.untimedCount || 0;
    fixes.push(tba ? 'Recheck TBA meeting times and rerun readiness once UMD posts them.' : 'Review timing notes and compare alternatives if the weekly pattern looks hard to sustain.');
  }
  if (gateById.preferences?.level === 'warn') {
    fixes.push((nonSeatWarnings || []).length
      ? 'Swap sections or adjust saved preferences for blocked time, avoided days, campus fit, or tight walks.'
      : 'Review saved schedule preferences before registration.');
  }
  if (!fixes.length) fixes.push('No readiness fixes needed after normal advisor and Testudo review.');
  return Array.from(new Set(fixes)).slice(0, 7);
}

function scheduleRegistrationFixActions(gates, courseList, unscheduled, urgentSeats, watchSeats, timing, nonSeatWarnings, eligibilityRows = [], prereqRows = [], coreqRows = [], creditLoad = null) {
  if (!courseList.length) return [];
  const gateById = Object.fromEntries((gates || []).map(gate => [gate.id, gate]));
  const actions = [];
  const addAction = action => {
    if (actions.some(existing => existing.id === action.id)) return;
    actions.push(action);
  };

  if (gateById.sections?.level === 'danger') {
    const names = (unscheduled || []).slice(0, 3).map(course => course.code).join(', ');
    addAction({
      id: 'auto-pick',
      label: 'Auto-pick sections',
      detail: names
        ? `Try the best posted sections for ${names}.`
        : 'Try the best posted sections for this semester.',
      kind: 'primary',
    });
    addAction({
      id: 'review-sections',
      label: 'Review section picks',
      detail: 'Open the section list to choose missing sections or apply backups.',
      kind: 'secondary',
    });
  }

  if (gateById.credits?.level === 'danger' || gateById.credits?.level === 'warn') {
    addAction({
      id: 'review-sections',
      label: 'Review section picks',
      detail: creditLoad?.level === 'danger'
        ? 'Adjust the term load or confirm credit-overload approval before registration.'
        : 'Review this term load and add or move courses if full-time status matters.',
      kind: actions.length ? 'secondary' : 'primary',
    });
  }

  if (gateById.prereqs?.level === 'danger' || gateById.prereqs?.level === 'warn') {
    const names = (prereqRows || []).slice(0, 2).map(row => row.label).join(', ');
    addAction({
      id: 'review-sections',
      label: 'Review section picks',
      detail: names
        ? `Review ${names} with advisor context before registering.`
        : 'Review courses with prerequisite blockers before registering.',
      kind: actions.length ? 'secondary' : 'primary',
    });
  }

  if (gateById.coreqs?.level === 'danger' || gateById.coreqs?.level === 'warn') {
    const names = (coreqRows || []).slice(0, 2).map(row => row.label).join(', ');
    addAction({
      id: 'review-sections',
      label: 'Review section picks',
      detail: names
        ? `Add or confirm same-term corequisite sections for ${names}.`
        : 'Review courses with corequisite blockers before registering.',
      kind: actions.length ? 'secondary' : 'primary',
    });
  }

  if (gateById.conflicts?.level === 'danger') {
    addAction({
      id: 'alternatives',
      label: 'Generate alternatives',
      detail: 'Compare posted section combinations with fewer overlaps.',
      kind: actions.length ? 'secondary' : 'primary',
    });
  }

  if (gateById.seats?.level === 'danger' || gateById.seats?.level === 'warn') {
    const risky = [...(urgentSeats || []), ...(watchSeats || [])]
      .slice(0, 2)
      .map(row => row.label)
      .join(', ');
    addAction({
      id: 'review-sections',
      label: 'Review section picks',
      detail: risky ? `Open backup options for ${risky}.` : 'Open backup options for risky sections.',
      kind: actions.length ? 'secondary' : 'primary',
    });
    addAction({
      id: 'alternatives',
      label: 'Generate alternatives',
      detail: risky ? `Compare schedules with safer sections for ${risky}.` : 'Compare schedules with safer seat choices.',
      kind: actions.length ? 'secondary' : 'primary',
    });
  }

  if (gateById.eligibility?.level === 'danger' || gateById.eligibility?.level === 'warn') {
    const names = (eligibilityRows || []).slice(0, 2).map(row => row.label).join(', ');
    addAction({
      id: 'review-sections',
      label: 'Review section picks',
      detail: names
        ? `Open section details and choose unrestricted alternates for ${names} if needed.`
        : 'Open section details and review posted eligibility notes.',
      kind: actions.length ? 'secondary' : 'primary',
    });
  }

  if (gateById.timing?.level === 'danger' || gateById.timing?.level === 'warn' || gateById.preferences?.level === 'warn') {
    const untimed = timing?.metrics?.untimedCount || 0;
    addAction({
      id: 'alternatives',
      label: 'Generate alternatives',
      detail: untimed
        ? 'Compare schedules while tracking TBA meeting-time risk.'
        : (nonSeatWarnings || []).length
          ? 'Compare schedules against saved time, day, block, and campus preferences.'
          : 'Compare schedules against saved timing preferences.',
      kind: actions.length ? 'secondary' : 'primary',
    });
  }

  return actions.slice(0, 3);
}

function scheduleRegistrationReadiness(courses = [], selectedItems = [], conflicts = [], warnings = [], prefs = DEFAULT_SCHEDULE_PREFS, unscheduledOverride = null, semId = '') {
  const courseList = Array.isArray(courses) ? courses : [];
  const selectedList = Array.isArray(selectedItems) ? selectedItems : [];
  const selectedCodes = new Set(selectedList.map(item => normalizeCode(item.course?.code || item.section?.course || '')));
  const unscheduled = Array.isArray(unscheduledOverride)
    ? unscheduledOverride
    : courseList.filter(course => !selectedCodes.has(normalizeCode(course.code)));
  const conflictList = Array.isArray(conflicts) ? conflicts : [];
  const warningList = Array.isArray(warnings) ? warnings : selectedScheduleWarnings(selectedList, prefs);
  const seatWarningSet = new Set(selectedSeatRiskWarnings(selectedList));
  const eligibilityRows = selectedSectionEligibilityRows(selectedList);
  const eligibilityWarningSet = new Set(selectedSectionEligibilityWarnings(selectedList));
  const nonSeatWarnings = warningList.filter(warning => !seatWarningSet.has(warning) && !eligibilityWarningSet.has(warning));
  const timing = scheduleTimingFit(selectedList, prefs, conflictList);
  const creditLoad = scheduleCreditLoadStatus(courseList, selectedList, prefs);
  const seatRows = selectedList.map(item => ({
    item,
    risk: sectionSeatRisk(item.section),
    label: `${item.course?.code || displayCode(item.section?.course || '')} ${scheduleSectionShortLabel(item.section)}`.trim(),
  }));
  const urgentSeats = seatRows.filter(row => row.risk.level === 'closed' || row.risk.level === 'risk');
  const watchSeats = seatRows.filter(row => row.risk.level === 'watch' || row.risk.level === 'unknown');
  const prereqRows = schedulePrereqRows(courseList, semId);
  const coreqRows = scheduleCoreqRows(courseList, selectedList, semId);
  const urgentPrereqs = prereqRows.filter(row => row.level === 'danger');
  const watchPrereqs = prereqRows.filter(row => row.level === 'warn');
  const urgentCoreqs = coreqRows.filter(row => row.level === 'danger');
  const watchCoreqs = coreqRows.filter(row => row.level === 'warn');
  const urgentEligibility = eligibilityRows.filter(row => row.eligibility.level === 'danger');
  const watchEligibility = eligibilityRows.filter(row => row.eligibility.level === 'warn');
  const untimedCount = timing.metrics?.untimedCount || 0;
  const gates = [];

  gates.push(scheduleRegistrationGate(
    'sections',
    'Sections',
    unscheduled.length ? 'danger' : 'ok',
    `${selectedList.length}/${courseList.length}`,
    !courseList.length
      ? 'No unsatisfied UMD-coded courses are in this semester.'
      : unscheduled.length
        ? `Pick sections for ${unscheduled.slice(0, 4).map(course => course.code).join(', ')}${unscheduled.length > 4 ? ` and ${unscheduled.length - 4} more` : ''}.`
        : 'Every current-term course has a picked section.'
  ));

  gates.push(scheduleRegistrationGate(
    'credits',
    'Credits',
    creditLoad.level,
    creditLoad.value,
    creditLoad.detail
  ));

  gates.push(scheduleRegistrationGate(
    'prereqs',
    'Prereqs',
    !courseList.length ? 'ok' : urgentPrereqs.length ? 'danger' : watchPrereqs.length ? 'warn' : 'ok',
    courseList.length ? `${courseList.length - prereqRows.length}/${courseList.length}` : 'n/a',
    !courseList.length
      ? 'No prerequisites need review for this semester.'
      : urgentPrereqs.length
        ? `Prereq blocker: ${urgentPrereqs.slice(0, 3).map(row => row.detail).join(' · ')}${urgentPrereqs.length > 3 ? ` · +${urgentPrereqs.length - 3} more` : ''}`
        : watchPrereqs.length
          ? `Prereq review: ${watchPrereqs.slice(0, 3).map(row => row.detail).join(' · ')}${watchPrereqs.length > 3 ? ` · +${watchPrereqs.length - 3} more` : ''}`
          : 'Prerequisites are marked passed, transferred, or not required.'
  ));

  gates.push(scheduleRegistrationGate(
    'coreqs',
    'Coreqs',
    !courseList.length ? 'ok' : urgentCoreqs.length ? 'danger' : watchCoreqs.length ? 'warn' : 'ok',
    courseList.length ? `${courseList.length - coreqRows.length}/${courseList.length}` : 'n/a',
    !courseList.length
      ? 'No corequisites need review for this semester.'
      : urgentCoreqs.length
        ? `Coreq blocker: ${urgentCoreqs.slice(0, 3).map(row => row.detail).join(' · ')}${urgentCoreqs.length > 3 ? ` · +${urgentCoreqs.length - 3} more` : ''}`
        : watchCoreqs.length
          ? `Coreq review: ${watchCoreqs.slice(0, 3).map(row => row.detail).join(' · ')}${watchCoreqs.length > 3 ? ` · +${watchCoreqs.length - 3} more` : ''}`
          : 'Corequisites are complete, picked concurrently, or not required.'
  ));

  gates.push(scheduleRegistrationGate(
    'conflicts',
    'Conflicts',
    conflictList.length ? 'danger' : 'ok',
    String(conflictList.length),
    conflictList.length
      ? `${conflictList.length} overlap${conflictList.length === 1 ? '' : 's'} must be resolved before registration.`
      : 'No picked-section time overlaps.'
  ));

  gates.push(scheduleRegistrationGate(
    'seats',
    'Seats',
    !courseList.length ? 'ok' : urgentSeats.length ? 'danger' : watchSeats.length ? 'warn' : 'ok',
    selectedList.length ? `${selectedList.length - urgentSeats.length}/${selectedList.length}` : 'n/a',
    !courseList.length
      ? 'No seats need review for this semester.'
      : !selectedList.length
      ? 'Pick sections to check seat availability.'
      : urgentSeats.length
        ? `Seat risk: ${urgentSeats.slice(0, 3).map(row => `${row.label}: ${row.risk.detail}`).join(' · ')}${urgentSeats.length > 3 ? ` · +${urgentSeats.length - 3} more` : ''}.`
        : watchSeats.length
          ? `Watch seats: ${watchSeats.slice(0, 3).map(row => `${row.label}: ${row.risk.detail}`).join(' · ')}${watchSeats.length > 3 ? ` · +${watchSeats.length - 3} more` : ''}.`
          : 'Picked sections have posted open seats.'
  ));

  gates.push(scheduleRegistrationGate(
    'eligibility',
    'Eligibility',
    !courseList.length ? 'ok' : !selectedList.length ? 'ok' : urgentEligibility.length ? 'danger' : watchEligibility.length ? 'warn' : 'ok',
    selectedList.length ? `${selectedList.length - eligibilityRows.length}/${selectedList.length}` : 'n/a',
    !courseList.length
      ? 'No section eligibility needs review for this semester.'
      : !selectedList.length
      ? 'Pick sections to check posted restrictions and permission notes.'
      : urgentEligibility.length
        ? `Eligibility review: ${urgentEligibility.slice(0, 3).map(row => `${row.label}: ${row.eligibility.detail}`).join(' · ')}${urgentEligibility.length > 3 ? ` · +${urgentEligibility.length - 3} more` : ''}.`
        : watchEligibility.length
          ? `Review eligibility notes: ${watchEligibility.slice(0, 3).map(row => `${row.label}: ${row.eligibility.detail}`).join(' · ')}${watchEligibility.length > 3 ? ` · +${watchEligibility.length - 3} more` : ''}.`
          : 'No section restrictions posted in available UMD data.'
  ));

  gates.push(scheduleRegistrationGate(
    'timing',
    'Timing',
    !courseList.length ? 'ok' : !selectedList.length ? 'warn' : timing.score < 61 ? 'danger' : timing.score < 76 || untimedCount ? 'warn' : 'ok',
    `${timing.score}/100`,
    !courseList.length
      ? 'No weekly schedule needs timing review.'
      : !selectedList.length
      ? 'Pick sections to score weekly timing.'
      : untimedCount
        ? `${untimedCount} picked section${untimedCount === 1 ? '' : 's'} still has time TBA.`
        : timing.insights[0] || timing.label
  ));

  gates.push(scheduleRegistrationGate(
    'preferences',
    'Preferences',
    nonSeatWarnings.length ? 'warn' : 'ok',
    String(nonSeatWarnings.length),
    nonSeatWarnings.length
      ? nonSeatWarnings.slice(0, 3).join(' ')
      : 'Picked sections fit saved time, block, and campus preferences.'
  ));

  const dangerCount = gates.filter(gate => gate.level === 'danger').length;
  const warnCount = gates.filter(gate => gate.level === 'warn').length;
  const level = dangerCount ? 'danger' : warnCount ? 'warn' : 'ok';
  const label = !courseList.length ? 'No registration courses'
    : level === 'danger' ? 'Fix before registration'
      : level === 'warn' ? 'Review before registration'
        : 'Registration ready';
  const detail = !courseList.length ? 'This term has no schedule-ready UMD-coded courses.'
    : dangerCount ? `${dangerCount} blocker${dangerCount === 1 ? '' : 's'} need action before registration.`
      : warnCount ? `${warnCount} item${warnCount === 1 ? '' : 's'} should be reviewed before registering.`
        : 'All picked sections clear core registration checks.';
  const fixes = scheduleRegistrationFixList(gates, courseList, unscheduled, urgentSeats, watchSeats, timing, nonSeatWarnings, eligibilityRows, prereqRows, coreqRows, creditLoad);
  const actions = scheduleRegistrationFixActions(gates, courseList, unscheduled, urgentSeats, watchSeats, timing, nonSeatWarnings, eligibilityRows, prereqRows, coreqRows, creditLoad);

  return {
    level,
    label,
    detail,
    gates,
    fixes,
    actions,
    unscheduled,
    timing,
    creditLoad,
    prereqRows,
    coreqRows,
    eligibilityRows,
    warningCount: warningList.length,
    dangerCount,
    warnCount,
  };
}

function scheduleRegistrationReadinessHtml(readiness, heading = 'Registration Readiness') {
  if (!readiness) return '';
  return `
    <section class="schedule-readiness ${scheduleEscape(readiness.level)}">
      <div class="schedule-readiness-head">
        <div>
          <h4>${scheduleEscape(heading)}</h4>
          <span>${scheduleEscape(readiness.detail)}</span>
        </div>
        <strong>${scheduleEscape(readiness.label)}</strong>
      </div>
      <div class="schedule-readiness-grid">
        ${(readiness.gates || []).map(gate => `
          <div class="schedule-readiness-gate ${scheduleEscape(gate.level)}">
            <b>${scheduleEscape(gate.label)}</b>
            <strong>${scheduleEscape(gate.value)}</strong>
            <span>${scheduleEscape(gate.detail)}</span>
          </div>
        `).join('')}
      </div>
      <div class="schedule-readiness-fixes">
        <strong>Recommended fixes</strong>
        ${(readiness.fixes || []).map(fix => `<span>${scheduleEscape(fix)}</span>`).join('')}
      </div>
      ${(readiness.actions || []).length ? `
        <div class="schedule-readiness-actions">
          <strong>Quick actions</strong>
          <div>
            ${(readiness.actions || []).map(action => `
              <button class="btn small ${action.kind === 'primary' ? 'primary' : ''}" type="button" data-readiness-action="${scheduleEscape(action.id)}" title="${scheduleEscape(action.detail || action.label)}">${scheduleEscape(action.label)}</button>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </section>
  `;
}

function scheduleRegistrationReadinessText(readiness) {
  if (!readiness) return [];
  return [
    '',
    'Registration readiness:',
    `- Overall: ${readiness.label}. ${readiness.detail}`,
    ...(readiness.gates || []).map(gate => `- ${gate.label}: ${gate.value} - ${gate.detail}`),
    ...(readiness.fixes || []).map(fix => `- Fix: ${fix}`),
  ];
}

function scheduleFutureUnlockCount(course, semId = '') {
  const target = normalizeCode(course?.code || '');
  if (!target) return 0;
  const semesters = getAllSemesters();
  const startIdx = semId ? semesters.findIndex(sem => sem.id === semId) : -1;
  const unlocked = new Set();
  semesters.forEach((sem, idx) => {
    if (startIdx >= 0 && idx <= startIdx) return;
    const courses = [
      ...(sem.courses || []),
      ...(state.customCourses || []).filter(item => item.semId === sem.id),
    ];
    courses.forEach(nextCourse => {
      const nextCode = normalizeCode(nextCourse.code || '');
      if (!nextCode || nextCode === target) return;
      const prereqs = Array.isArray(nextCourse.prereqs) ? nextCourse.prereqs : [];
      if (prereqs.some(req => normalizeCode(req) === target)) unlocked.add(nextCode);
    });
  });
  return unlocked.size;
}

function scheduleRegistrationCoursePriority(course, unlockCount = 0) {
  const kind = String(course?.kind || '').toLowerCase();
  const category = String(course?.category || '').toLowerCase();
  const labels = [];
  let score = 0;
  if (kind === 'critical') {
    score += 95;
    labels.push('critical path');
  }
  if (course?.isGoal || kind === 'goal') {
    score += 85;
    labels.push('goal course');
  }
  if (kind === 'core' || category.includes('core')) {
    score += 75;
    labels.push('major/core requirement');
  }
  if (category.includes('gened') || kind === 'gened') {
    score += 35;
    labels.push('GenEd requirement');
  }
  if (unlockCount) {
    score += Math.min(160, unlockCount * 45);
    labels.push(`unlocks ${unlockCount} later course${unlockCount === 1 ? '' : 's'}`);
  }
  return {
    score,
    label: labels.length ? labels.join(' · ') : 'planned course',
  };
}

function scheduleRegistrationConflictCount(item, conflicts = []) {
  const code = normalizeCode(item?.course?.code || item?.section?.course || '');
  if (!code) return 0;
  return (conflicts || []).filter(conflict => (
    normalizeCode(conflict?.a?.code || '') === code
    || normalizeCode(conflict?.b?.code || '') === code
  )).length;
}

function scheduleRegistrationOrder(semId, selectedItems = [], conflicts = [], courses = []) {
  const riskScores = { closed: 1200, risk: 930, watch: 620, unknown: 430, ok: 190 };
  const courseList = Array.isArray(courses) && courses.length
    ? courses
    : (selectedItems || []).map(item => item.course).filter(Boolean);
  return (selectedItems || [])
    .map((item, index) => {
      const risk = sectionSeatRisk(item.section);
      const eligibility = sectionEligibilityStatus(item.section);
      const prereq = scheduleCoursePrereqStatus(item.course, semId);
      const coreq = scheduleCourseCoreqStatus(item.course, courseList, selectedItems, semId);
      const conflictCount = scheduleRegistrationConflictCount(item, conflicts);
      const unlockCount = scheduleFutureUnlockCount(item.course, semId);
      const priority = scheduleRegistrationCoursePriority(item.course, unlockCount);
      const sectionLabel = scheduleSectionShortLabel(item.section);
      const reasons = [];
      if (conflictCount) reasons.push(`${conflictCount} conflict${conflictCount === 1 ? '' : 's'} to resolve`);
      if (risk.level === 'closed') reasons.push(risk.wait ? `${risk.wait} waitlisted` : 'closed section');
      else if (risk.level === 'risk') reasons.push(risk.detail);
      else if (risk.level === 'watch' || risk.level === 'unknown') reasons.push(risk.detail);
      if (prereq.level !== 'ok') reasons.push(prereq.detail);
      if (coreq.level !== 'ok') reasons.push(coreq.detail);
      if (eligibility.notes.length) reasons.push(eligibility.detail);
      if (priority.label) reasons.push(priority.label);
      if (!sectionHasTimedMeetings(item.section)) reasons.push('time TBA');
      const openBonus = risk.open === null ? 0 : Math.max(0, 42 - risk.open);
      const score = (riskScores[risk.level] || 0)
        + openBonus
        + priority.score
        + (conflictCount * 260)
        + (prereq.level === 'danger' ? 980 : prereq.level === 'warn' ? 360 : 0)
        + (coreq.level === 'danger' ? 920 : coreq.level === 'warn' ? 340 : 0)
        + (eligibility.level === 'danger' ? 700 : eligibility.level === 'warn' ? 260 : 0)
        + (item.section?.pinned ? 25 : 0);
      const label = conflictCount ? 'Resolve first'
        : risk.level === 'closed' ? 'Backup/waitlist first'
          : prereq.level === 'danger' ? 'Prereq first'
            : coreq.level === 'danger' ? 'Coreq first'
              : risk.level === 'risk' ? 'Enroll first'
                : risk.level === 'watch' || risk.level === 'unknown' ? 'Enroll early'
                  : prereq.level === 'warn' ? 'Confirm prereq'
                    : coreq.level === 'warn' ? 'Confirm coreq'
                      : eligibility.level === 'danger' ? 'Eligibility first'
                        : eligibility.level === 'warn' ? 'Review eligibility'
                          : unlockCount || priority.score >= 70 ? 'High priority'
                            : 'Normal priority';
      return {
        index,
        score,
        label,
        courseCode: item.course?.code || displayCode(item.section?.course || ''),
        title: item.course?.title || '',
        sectionLabel,
        sectionId: item.section?.section_id || '',
        seatDetail: risk.detail,
        riskLevel: risk.level,
        prereqLevel: prereq.level,
        prereqDetail: prereq.level === 'ok' ? '' : prereq.detail,
        prereqMissing: prereq.missing || '',
        coreqLevel: coreq.level,
        coreqDetail: coreq.level === 'ok' ? '' : coreq.detail,
        coreqMissing: coreq.missing || '',
        eligibilityLevel: eligibility.level,
        eligibilityDetail: eligibility.notes.length ? eligibility.detail : '',
        eligibilityNotes: eligibility.notes,
        conflictCount,
        unlockCount,
        reasons: Array.from(new Set(reasons)).slice(0, 4),
      };
    })
    .sort((a, b) => b.score - a.score || a.courseCode.localeCompare(b.courseCode) || a.index - b.index)
    .map((row, idx) => ({ ...row, order: idx + 1 }));
}

function renderScheduleRegistrationOrderHtml(rows, heading = 'Enrollment Order') {
  const ordered = Array.isArray(rows) ? rows : [];
  return `
    <section class="schedule-registration-order">
      <div class="schedule-registration-order-head">
        <div>
          <h4>${scheduleEscape(heading)}</h4>
          <span>Use after fixing blockers. Submit tight seats, eligibility checks, waitlists, prerequisite anchors, and corequisite pairs first.</span>
        </div>
        <strong>${ordered.length ? `${ordered.length} picked` : 'No picks'}</strong>
      </div>
      ${ordered.length ? `
        <ol class="schedule-registration-order-list">
          ${ordered.slice(0, 8).map(row => `
            <li class="${scheduleEscape(row.riskLevel)}">
              <b>${row.order}</b>
              <div>
                <strong>${scheduleEscape(row.courseCode)} ${scheduleEscape(row.sectionLabel)}</strong>
                <span>${scheduleEscape(row.label)} · ${scheduleEscape(row.seatDetail)}</span>
                ${row.prereqDetail ? `<span>Prereqs: ${scheduleEscape(row.prereqDetail)}</span>` : ''}
                ${row.coreqDetail ? `<span>Coreqs: ${scheduleEscape(row.coreqDetail)}</span>` : ''}
                ${row.eligibilityDetail ? `<span>Eligibility: ${scheduleEscape(row.eligibilityDetail)}</span>` : ''}
                <em>${scheduleEscape(row.reasons.join(' · ') || 'Confirm in Testudo before submitting.')}</em>
              </div>
            </li>
          `).join('')}
        </ol>
      ` : '<p>Pick real sections to generate an enrollment order.</p>'}
    </section>
  `;
}

function scheduleRegistrationOrderText(rows) {
  const ordered = Array.isArray(rows) ? rows : [];
  const lines = ['', 'Suggested enrollment order:'];
  if (!ordered.length) {
    lines.push('- Pick real sections to generate an enrollment order.');
    return lines;
  }
  ordered.forEach(row => {
    lines.push(`${row.order}. ${row.courseCode} ${row.sectionLabel} - ${row.label}; ${row.seatDetail}${row.sectionId ? `; Section ID ${row.sectionId}` : ''}.`);
    if (row.prereqDetail) lines.push(`   Prereqs: ${row.prereqDetail}`);
    if (row.coreqDetail) lines.push(`   Coreqs: ${row.coreqDetail}`);
    if (row.eligibilityDetail) lines.push(`   Eligibility: ${row.eligibilityDetail}`);
    if (row.reasons.length) lines.push(`   Why: ${row.reasons.join(' / ')}`);
  });
  return lines;
}

function scheduleRegistrationHandoff(orderRows = [], backupRows = []) {
  const backupsByCourse = new Map();
  (backupRows || []).forEach(row => backupsByCourse.set(normalizeCode(row.courseCode || ''), row));
  return (orderRows || []).map(row => {
    const backup = backupsByCourse.get(normalizeCode(row.courseCode || '')) || null;
    const missingId = !row.sectionId;
    const status = missingId ? 'missing'
      : row.conflictCount || row.riskLevel === 'closed' || row.prereqLevel === 'danger' || row.coreqLevel === 'danger' || row.eligibilityLevel === 'danger' ? 'blocked'
        : row.riskLevel === 'risk' || row.riskLevel === 'watch' || row.riskLevel === 'unknown' ? 'review'
          : row.prereqLevel === 'warn' ? 'review'
          : row.coreqLevel === 'warn' ? 'review'
          : row.eligibilityLevel === 'warn' ? 'review'
          : 'ready';
    const action = missingId ? 'Find exact section ID before registration'
      : row.conflictCount ? 'Resolve conflict before entering'
        : row.riskLevel === 'closed' ? 'Use backup, waitlist, or alternate'
          : row.prereqLevel === 'danger' ? 'Resolve prerequisites before entering'
            : row.coreqLevel === 'danger' ? 'Add corequisite before entering'
              : row.riskLevel === 'risk' ? 'Enter early and keep backup ready'
                : row.riskLevel === 'watch' || row.riskLevel === 'unknown' ? 'Confirm seats shortly before submitting'
                  : row.prereqLevel === 'warn' ? 'Confirm prerequisite completion before submitting'
                    : row.coreqLevel === 'warn' ? 'Confirm corequisite completion before submitting'
                    : row.eligibilityLevel === 'danger' ? 'Confirm eligibility or permission before entering'
                      : row.eligibilityLevel === 'warn' ? 'Review posted eligibility before submitting'
                        : 'Ready to enter in Testudo';
    return {
      order: row.order,
      status,
      action,
      courseCode: row.courseCode,
      title: row.title || '',
      sectionLabel: row.sectionLabel,
      sectionId: row.sectionId || '',
      seatDetail: row.seatDetail,
      prereqLevel: row.prereqLevel || 'ok',
      prereqDetail: row.prereqDetail || '',
      prereqMissing: row.prereqMissing || '',
      coreqLevel: row.coreqLevel || 'ok',
      coreqDetail: row.coreqDetail || '',
      coreqMissing: row.coreqMissing || '',
      eligibilityLevel: row.eligibilityLevel || 'ok',
      eligibilityDetail: row.eligibilityDetail || '',
      label: row.label,
      conflictCount: row.conflictCount || 0,
      backupId: backup?.backupId || '',
      backupLabel: backup?.backupLabel || '',
      backupSeatDetail: backup?.backupSeatDetail || '',
      backupStatus: backup?.status || '',
    };
  });
}

function renderScheduleRegistrationHandoffHtml(rows, heading = 'Testudo Entry Queue') {
  const handoff = Array.isArray(rows) ? rows : [];
  const readyCount = handoff.filter(row => row.status === 'ready' || row.status === 'review').length;
  return `
    <section class="schedule-registration-handoff">
      <div class="schedule-registration-handoff-head">
        <div>
          <h4>${scheduleEscape(heading)}</h4>
          <span>Enter these exact section IDs in Testudo after fixing blockers, corequisite pairs, eligibility notes, and seat freshness.</span>
        </div>
        <strong>${handoff.length ? `${readyCount}/${handoff.length} entry-ready` : 'No entries'}</strong>
      </div>
      ${handoff.length ? `
        <ol class="schedule-registration-handoff-list">
          ${handoff.slice(0, 10).map(row => `
            <li class="${scheduleEscape(row.status)}">
              <b>${scheduleEscape(row.order)}</b>
              <div>
                <strong>${scheduleEscape(row.courseCode)} ${scheduleEscape(row.sectionLabel)}</strong>
                <code>${row.sectionId ? `Section ID ${scheduleEscape(row.sectionId)}` : 'Section ID missing'}</code>
                <span>${scheduleEscape(row.action)} · ${scheduleEscape(row.seatDetail)}</span>
                ${row.prereqDetail ? `<em>Prereqs: ${scheduleEscape(row.prereqDetail)}</em>` : ''}
                ${row.coreqDetail ? `<em>Coreqs: ${scheduleEscape(row.coreqDetail)}</em>` : ''}
                ${row.eligibilityDetail ? `<em>Eligibility: ${scheduleEscape(row.eligibilityDetail)}</em>` : ''}
                ${row.backupId ? `<em>Backup ID ${scheduleEscape(row.backupId)} (${scheduleEscape(row.backupLabel)} · ${scheduleEscape(row.backupSeatDetail)})</em>` : ''}
              </div>
            </li>
          `).join('')}
        </ol>
      ` : '<p>Pick real sections to build a Testudo entry queue.</p>'}
    </section>
  `;
}

function scheduleRegistrationHandoffText(rows) {
  const handoff = Array.isArray(rows) ? rows : [];
  const lines = ['', 'Testudo entry queue:'];
  if (!handoff.length) {
    lines.push('- Pick real sections to build a Testudo entry queue.');
    return lines;
  }
  handoff.forEach(row => {
    lines.push(`${row.order}. ${row.courseCode} ${row.sectionLabel} | Section ID: ${row.sectionId || 'missing'} | ${row.action}; ${row.seatDetail}.`);
    if (row.prereqDetail) lines.push(`   Prereqs: ${row.prereqDetail}`);
    if (row.coreqDetail) lines.push(`   Coreqs: ${row.coreqDetail}`);
    if (row.eligibilityDetail) lines.push(`   Eligibility: ${row.eligibilityDetail}`);
    if (row.backupId) lines.push(`   Backup ID: ${row.backupId}; ${row.backupLabel}; ${row.backupSeatDetail}.`);
  });
  return lines;
}

function scheduleRegistrationBackupPlan(selectedItems = [], sectionsByCode = {}, prefs = DEFAULT_SCHEDULE_PREFS, conflicts = []) {
  const riskScores = { closed: 4, risk: 3, watch: 2, unknown: 1, ok: 0 };
  return (selectedItems || [])
    .map(item => {
      const risk = sectionSeatRisk(item.section);
      const action = sectionSeatBackupAction(risk);
      if (!action) return null;
      const sections = sectionsByCode[normalizeCode(item.course?.code || '')] || [];
      const backup = sectionBackupCandidate(sections, item.section, prefs, item.course, selectedItems);
      const conflictCount = scheduleRegistrationConflictCount(item, conflicts);
      const backupSection = backup?.section || null;
      const backupRisk = backupSection ? sectionSeatRisk(backupSection) : null;
      return {
        courseCode: item.course?.code || displayCode(item.section?.course || ''),
        title: item.course?.title || '',
        primaryLabel: scheduleSectionShortLabel(item.section),
        primaryId: item.section?.section_id || '',
        primarySeatDetail: risk.detail,
        riskLevel: risk.level,
        action,
        conflictCount,
        backupLabel: backupSection ? scheduleSectionShortLabel(backupSection) : '',
        backupId: backupSection?.section_id || '',
        backupSeatDetail: backupRisk?.detail || '',
        backupMeetings: backupSection ? scheduleSectionMeetingLines(backupSection).join('; ') : '',
        backupInstructor: backupSection ? scheduleInstructorLine(backupSection) : '',
        status: backupSection ? 'ready' : 'missing',
        note: backupSection
          ? 'Keep this alternate section ready in case seats change before your registration time.'
          : 'No conflict-safe open backup was found in posted sections; choose another section manually or ask for an alternate course.',
        score: (riskScores[risk.level] || 0) * 100 + (conflictCount * 25),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.courseCode.localeCompare(b.courseCode));
}

function renderScheduleRegistrationBackupsHtml(rows, heading = 'Backup Plan') {
  const backups = Array.isArray(rows) ? rows : [];
  const readyCount = backups.filter(row => row.status === 'ready').length;
  return `
    <section class="schedule-registration-backups">
      <div class="schedule-registration-backups-head">
        <div>
          <h4>${scheduleEscape(heading)}</h4>
          <span>Keep alternates ready for low-seat, waitlisted, TBA, or closed picks.</span>
        </div>
        <strong>${backups.length ? `${readyCount}/${backups.length} ready` : 'No risks'}</strong>
      </div>
      ${readyCount ? `
        <div class="schedule-registration-backup-actions">
          <button class="btn small primary" type="button" data-backup-action="apply-ready">Apply ready backups</button>
          <span>Switch low-seat picks to the conflict-safe backup sections listed below.</span>
        </div>
      ` : ''}
      ${backups.length ? `
        <div class="schedule-registration-backup-list">
          ${backups.slice(0, 6).map(row => `
            <div class="schedule-registration-backup ${scheduleEscape(row.status)} ${scheduleEscape(row.riskLevel)}">
              <div>
                <strong>${scheduleEscape(row.courseCode)} primary ${scheduleEscape(row.primaryLabel)}</strong>
                <span>${scheduleEscape(row.primarySeatDetail)} · ${scheduleEscape(row.action)}</span>
              </div>
              <div>
                ${row.backupId
                  ? `<b>Backup ${scheduleEscape(row.backupLabel)}</b><span>${scheduleEscape(row.backupSeatDetail)} · ${scheduleEscape(row.backupMeetings)} · ${scheduleEscape(row.backupInstructor)}</span>`
                  : '<b>No ready backup found</b>'}
                <em>${scheduleEscape(row.note)}</em>
              </div>
            </div>
          `).join('')}
        </div>
      ` : '<p>No backup sections needed for the current picked sections.</p>'}
    </section>
  `;
}

function scheduleRegistrationBackupText(rows) {
  const backups = Array.isArray(rows) ? rows : [];
  const lines = ['', 'Backup sections:'];
  if (!backups.length) {
    lines.push('- No backup sections needed for the current picked sections.');
    return lines;
  }
  backups.forEach(row => {
    lines.push(`- ${row.courseCode} primary ${row.primaryLabel}: ${row.primarySeatDetail}. ${row.action}`);
    if (row.backupId) {
      lines.push(`  Backup: ${row.backupLabel}; Section ID ${row.backupId}; ${row.backupSeatDetail}; ${row.backupMeetings}; ${row.backupInstructor}.`);
    } else {
      lines.push(`  Backup: none found. ${row.note}`);
    }
  });
  return lines;
}

function scheduleWaitlistStrategy(selectedItems = [], backupRows = []) {
  const backupsByCourse = new Map();
  (backupRows || []).forEach(row => backupsByCourse.set(normalizeCode(row.courseCode || ''), row));
  const rows = (selectedItems || [])
    .map(item => {
      const risk = sectionSeatRisk(item.section);
      const open = risk.open;
      const wait = risk.wait;
      if (risk.level !== 'closed' && !(wait && wait > 0)) return null;
      const courseCode = item.course?.code || displayCode(item.section?.course || '');
      const backup = backupsByCourse.get(normalizeCode(courseCode)) || null;
      const hasOpenSeat = open !== null && open > 0;
      const hasWaitlist = wait !== null && wait > 0;
      const level = !hasOpenSeat && !backup?.backupId ? 'danger' : 'warn';
      const label = !hasOpenSeat
        ? hasWaitlist ? 'Waitlist only' : 'Closed'
        : 'Waitlist pressure';
      const action = !hasOpenSeat
        ? backup?.backupId
          ? `Keep or apply backup ${backup.backupLabel || backup.backupId} before relying on the waitlist.`
          : 'Find an open section or advisor-approved alternate before relying on this waitlist.'
        : backup?.backupId
          ? `Enter early and keep backup ${backup.backupLabel || backup.backupId} ready if this section closes.`
          : 'Enter early, refresh seats, and choose an alternate if the waitlist grows or seats close.';
      return {
        courseCode,
        title: item.course?.title || '',
        sectionLabel: scheduleSectionShortLabel(item.section),
        sectionId: item.section?.section_id || '',
        openSeats: open,
        waitlistCount: wait,
        capacity: risk.capacity,
        seatDetail: risk.detail,
        level,
        label,
        action,
        status: level === 'danger' ? 'blocked' : 'review',
        backupId: backup?.backupId || '',
        backupLabel: backup?.backupLabel || '',
        backupSeatDetail: backup?.backupSeatDetail || '',
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const rank = { danger: 2, warn: 1, ok: 0 };
      return (rank[b.level] || 0) - (rank[a.level] || 0)
        || (b.waitlistCount || 0) - (a.waitlistCount || 0)
        || a.courseCode.localeCompare(b.courseCode);
    });
  const dangerCount = rows.filter(row => row.level === 'danger').length;
  const backupReady = rows.filter(row => row.backupId).length;
  const closedCount = rows.filter(row => row.openSeats !== null && row.openSeats <= 0).length;
  const waitlistedCount = rows.filter(row => row.waitlistCount && row.waitlistCount > 0).length;
  const level = !rows.length ? 'ok' : dangerCount ? 'danger' : 'warn';
  const label = !rows.length ? 'No waitlist risk'
    : dangerCount ? 'Find alternates'
      : closedCount ? 'Backup waitlists'
        : 'Watch waitlists';
  const detail = !rows.length
    ? 'Picked sections have no posted waitlist or closed-seat pressure.'
    : dangerCount
      ? `${dangerCount} waitlist or closed-seat pick${dangerCount === 1 ? '' : 's'} need an open backup or alternate before Testudo.`
      : `${rows.length} picked section${rows.length === 1 ? '' : 's'} need waitlist strategy; ${backupReady}/${rows.length} have ready backup${rows.length === 1 ? '' : 's'}.`;
  return {
    level,
    label,
    detail,
    rows,
    dangerCount,
    backupReady,
    closedCount,
    waitlistedCount,
  };
}

function renderScheduleWaitlistStrategyHtml(strategy, heading = 'Waitlist Strategy') {
  if (!strategy) return '';
  const rows = Array.isArray(strategy.rows) ? strategy.rows : [];
  return `
    <section class="schedule-waitlist-strategy ${scheduleEscape(strategy.level)}">
      <div class="schedule-waitlist-head">
        <div>
          <h4>${scheduleEscape(heading)}</h4>
          <span>${scheduleEscape(strategy.detail)}</span>
        </div>
        <strong>${scheduleEscape(strategy.label)}</strong>
      </div>
      ${rows.length ? `
        <div class="schedule-waitlist-list">
          ${rows.slice(0, 8).map(row => `
            <div class="schedule-waitlist-row ${scheduleEscape(row.level)}">
              <strong>${scheduleEscape(row.courseCode)} ${scheduleEscape(row.sectionLabel)}</strong>
              <span>${scheduleEscape(row.seatDetail)}${row.backupId ? ` · Backup ${scheduleEscape(row.backupLabel)} (${scheduleEscape(row.backupSeatDetail)})` : ''}</span>
              <em>${scheduleEscape(row.action)}</em>
            </div>
          `).join('')}
        </div>
      ` : '<p>No waitlist-specific action needed for picked sections.</p>'}
    </section>
  `;
}

function scheduleWaitlistStrategyText(strategy) {
  if (!strategy) return [];
  const lines = [
    '',
    'Waitlist strategy:',
    `- Overall: ${strategy.label}. ${strategy.detail}`,
  ];
  (strategy.rows || []).forEach(row => {
    lines.push(`- ${row.courseCode} ${row.sectionLabel}: ${row.seatDetail}; ${row.action}${row.backupId ? ` Backup ID ${row.backupId}.` : ''}`);
  });
  return lines;
}

function scheduleRegistrationAppointmentDate(prefs = DEFAULT_SCHEDULE_PREFS) {
  const date = normalizeScheduleDate(prefs.registrationDate);
  if (!date) return { date: null, hasTime: false, label: 'Not set' };
  const time = normalizeScheduleTime(prefs.registrationTime);
  const [year, month, day] = date.split('-').map(Number);
  const mins = parseClockValue(time) ?? (9 * 60);
  const dt = new Date(year, month - 1, day, Math.floor(mins / 60), mins % 60, 0, 0);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const label = `${months[month - 1]} ${day}, ${year}${time ? ` at ${formatMeetingTime(mins)}` : ''}`;
  return { date: dt, hasTime: !!time, label, dateValue: date, timeValue: time };
}

function scheduleRegistrationAppointment(prefs = DEFAULT_SCHEDULE_PREFS, readiness = null, backupRows = [], now = new Date()) {
  const appt = scheduleRegistrationAppointmentDate(prefs);
  if (!appt.date) {
    return {
      level: 'warn',
      label: 'Add registration appointment',
      when: 'Not set',
      detail: 'Enter your assigned Testudo registration date and time for this term.',
      items: ['Set the date and time from Testudo or your registration email.', 'Refresh sections again before registration.'],
    };
  }
  const diffMs = appt.date.getTime() - now.getTime();
  const absMs = Math.abs(diffMs);
  const days = Math.floor(absMs / 86400000);
  const hours = Math.floor((absMs % 86400000) / 3600000);
  const timeLeft = diffMs >= 0
    ? (days ? `${days} day${days === 1 ? '' : 's'}${hours ? ` ${hours} hr` : ''} left` : `${Math.max(0, hours)} hr left`)
    : (days ? `${days} day${days === 1 ? '' : 's'} ago` : `${hours} hr ago`);
  const backupCount = (backupRows || []).length;
  const items = [];
  if (readiness?.level === 'danger') items.push('Resolve readiness blockers before the appointment.');
  else if (readiness?.level === 'warn') items.push('Review warnings before the appointment.');
  else items.push('Keep the picked sections and exports ready.');
  if (backupCount) items.push(`Have ${backupCount} backup section${backupCount === 1 ? '' : 's'} ready in Testudo.`);
  items.push('Refresh sections and seats shortly before the appointment.');
  items.push('Use the registration list to submit exact section IDs.');
  if (!appt.hasTime) items.unshift('Add the exact appointment time once Testudo shows it.');

  const level = diffMs < 0 ? 'warn'
    : diffMs <= 6 * 3600000 ? 'danger'
      : diffMs <= 48 * 3600000 ? 'danger'
        : diffMs <= 7 * 86400000 ? 'warn'
          : 'ok';
  const label = diffMs < 0 ? 'Appointment passed'
    : !appt.hasTime ? 'Date set, time missing'
      : diffMs <= 6 * 3600000 ? 'Register now'
        : diffMs <= 48 * 3600000 ? 'Final check'
          : diffMs <= 7 * 86400000 ? 'Final week'
            : 'Scheduled';
  const detail = diffMs < 0
    ? 'This saved appointment has passed; refresh sections and update the plan if registration changed.'
    : `${timeLeft}. Complete the checklist before opening Testudo.`;
  return {
    level,
    label,
    when: appt.label,
    detail,
    items: Array.from(new Set(items)).slice(0, 5),
  };
}

function renderScheduleRegistrationAppointmentHtml(appointment, heading = 'Registration Appointment') {
  if (!appointment) return '';
  return `
    <section class="schedule-registration-appointment ${scheduleEscape(appointment.level)}">
      <div class="schedule-registration-appointment-head">
        <div>
          <h4>${scheduleEscape(heading)}</h4>
          <span>${scheduleEscape(appointment.when)}</span>
        </div>
        <strong>${scheduleEscape(appointment.label)}</strong>
      </div>
      <p>${scheduleEscape(appointment.detail)}</p>
      <div class="schedule-registration-appointment-list">
        ${(appointment.items || []).map(item => `<span>${scheduleEscape(item)}</span>`).join('')}
      </div>
    </section>
  `;
}

function scheduleRegistrationAppointmentText(appointment) {
  if (!appointment) return [];
  return [
    '',
    'Registration appointment:',
    `- ${appointment.label}: ${appointment.when}. ${appointment.detail}`,
    ...(appointment.items || []).map(item => `- Check: ${item}`),
  ];
}

function scheduleFinalRegistrationChecklist(readiness, appointment, freshness, backupRows = [], handoffRows = [], calendarSummary = null, waitlistStrategy = null) {
  const backups = Array.isArray(backupRows) ? backupRows : [];
  const handoff = Array.isArray(handoffRows) ? handoffRows : [];
  const backupReady = backups.filter(row => row.status === 'ready').length;
  const backupMissing = backups.filter(row => row.status !== 'ready').length;
  const handoffBlocked = handoff.filter(row => row.status === 'blocked' || row.status === 'missing').length;
  const handoffReview = handoff.filter(row => row.status === 'review').length;
  const handoffReady = handoff.filter(row => row.status === 'ready' || row.status === 'review').length;
  const noRegistrationCourses = readiness?.label === 'No registration courses' || /no schedule-ready/i.test(readiness?.detail || '');
  const creditLoad = readiness?.creditLoad || null;
  const items = [
    {
      id: 'readiness',
      label: 'Registration readiness',
      level: readiness?.level || 'warn',
      detail: readiness?.detail || 'Run Schedule readiness checks before registration.',
    },
    {
      id: 'credits',
      label: 'Credit load',
      level: noRegistrationCourses ? 'ok' : creditLoad?.level || 'warn',
      detail: noRegistrationCourses
        ? 'No registration credits need review for this term.'
        : creditLoad?.detail || 'Review current-term credits against UMD full-time and overload rules.',
    },
    {
      id: 'testudo',
      label: 'Testudo entry queue',
      level: !handoff.length ? (noRegistrationCourses ? 'ok' : 'danger') : handoffBlocked ? 'danger' : handoffReview ? 'warn' : 'ok',
      detail: !handoff.length
        ? noRegistrationCourses
          ? 'No Testudo entries are needed for this term.'
          : 'Pick real sections to generate exact Testudo section IDs.'
        : handoffBlocked
          ? `${handoffBlocked} queued section${handoffBlocked === 1 ? '' : 's'} must be fixed before entering Testudo.`
          : handoffReview
            ? `${handoffReady}/${handoff.length} entries have section IDs; review seats before submitting.`
            : `${handoffReady}/${handoff.length} entries are ready to enter in Testudo.`,
    },
    {
      id: 'freshness',
      label: 'Seat freshness',
      level: freshness?.level || 'warn',
      detail: freshness?.detail || 'Refresh sections before relying on seats.',
    },
	    {
	      id: 'backups',
	      label: 'Backup sections',
	      level: backupMissing ? 'danger' : backupReady ? 'warn' : 'ok',
	      detail: !backups.length
	        ? 'No backup sections are needed for the current picked sections.'
	        : backupMissing
	          ? `${backupMissing}/${backups.length} risky pick${backups.length === 1 ? '' : 's'} still need a ready backup.`
	          : `${backupReady}/${backups.length} ready backup section${backupReady === 1 ? '' : 's'} can be applied or kept ready.`,
	    },
	    {
	      id: 'waitlist',
	      label: 'Waitlist strategy',
	      level: noRegistrationCourses ? 'ok' : waitlistStrategy?.level || 'ok',
	      detail: noRegistrationCourses
	        ? 'No waitlist strategy is needed for this term.'
	        : waitlistStrategy?.detail || 'Picked sections have no posted waitlist or closed-seat pressure.',
	    },
	    {
	      id: 'calendar',
	      label: 'Calendar export',
	      level: calendarSummary?.level || 'warn',
	      detail: calendarSummary?.detail || 'Build a calendar export after picking timed sections.',
    },
    {
      id: 'appointment',
      label: 'Registration appointment',
      level: appointment?.level || 'warn',
      detail: appointment ? `${appointment.when}. ${appointment.detail}` : 'Add your assigned Testudo registration appointment.',
    },
  ];
  const dangerCount = items.filter(item => item.level === 'danger').length;
  const warnCount = items.filter(item => item.level === 'warn').length;
  const readyCount = items.filter(item => item.level === 'ok').length;
  const level = dangerCount ? 'danger' : warnCount ? 'warn' : 'ok';
  const label = dangerCount ? 'Fix before Testudo'
    : warnCount ? 'Final review'
      : 'Ready for Testudo';
  const detail = dangerCount
    ? `${dangerCount} launch check${dangerCount === 1 ? '' : 's'} must be fixed before registration.`
    : warnCount
      ? `${warnCount} launch check${warnCount === 1 ? '' : 's'} should be reviewed before submitting.`
      : 'All final registration checks are ready after normal Testudo confirmation.';
  return { level, label, detail, readyCount, total: items.length, items };
}

function renderScheduleFinalChecklistHtml(checklist, heading = 'Final Registration Checklist') {
  if (!checklist) return '';
  return `
    <section class="schedule-final-checklist ${scheduleEscape(checklist.level)}">
      <div class="schedule-final-checklist-head">
        <div>
          <h4>${scheduleEscape(heading)}</h4>
          <span>${scheduleEscape(checklist.detail)}</span>
        </div>
        <strong>${scheduleEscape(checklist.label)}</strong>
      </div>
      <div class="schedule-final-checklist-score">
        <strong>${Number(checklist.readyCount) || 0}/${Number(checklist.total) || 0}</strong>
        <span>launch checks ready</span>
      </div>
      <div class="schedule-final-checklist-grid">
        ${(checklist.items || []).map(item => `
          <div class="schedule-final-check ${scheduleEscape(item.level)}">
            <b>${scheduleEscape(item.label)}</b>
            <span>${scheduleEscape(item.detail)}</span>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function scheduleFinalChecklistText(checklist) {
  if (!checklist) return [];
  return [
    '',
    'Final registration checklist:',
    `- Overall: ${checklist.label}. ${checklist.readyCount}/${checklist.total} launch checks ready. ${checklist.detail}`,
    ...(checklist.items || []).map(item => `- ${item.label}: ${item.level.toUpperCase()} - ${item.detail}`),
  ];
}

function scheduleSeatFreshnessAgeLabel(ageMs) {
  const safeAge = Math.max(0, Number(ageMs) || 0);
  const mins = Math.floor(safeAge / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  return `${hours} hr${hours === 1 ? '' : 's'}${rem ? ` ${rem} min` : ''} ago`;
}

function scheduleSeatFreshness(semId, term, courses = [], sectionsByCode = {}, now = new Date()) {
  const nowMs = now instanceof Date ? now.getTime() : new Date(now).getTime();
  const rows = (courses || []).map(course => {
    const code = course?.code || '';
    const normalized = normalizeCode(code);
    const key = scheduleSectionCacheKey(semId, term, code);
    const meta = scheduleSectionsMeta[key] || null;
    const fetchedAt = meta?.fetchedAt ? new Date(meta.fetchedAt) : null;
    const sections = sectionsByCode[normalized] || scheduleSectionsCache[key] || [];
    const count = Array.isArray(sections) ? sections.length : Number(meta?.count) || 0;
    if (!fetchedAt || Number.isNaN(fetchedAt.getTime()) || !Number.isFinite(nowMs)) {
      return {
        code,
        count,
        level: 'warn',
        label: 'Refresh unknown',
        detail: 'Refresh posted sections before relying on seats.',
        fetchedAt: '',
        ageMs: null,
        source: meta?.source || 'unknown',
      };
    }
    const ageMs = Math.max(0, nowMs - fetchedAt.getTime());
    const level = ageMs >= SCHEDULE_SEAT_STALE_MS ? 'danger'
      : ageMs >= SCHEDULE_SEAT_WARN_MS ? 'warn'
        : 'ok';
    const label = level === 'danger' ? 'Stale'
      : level === 'warn' ? 'Review'
        : 'Fresh';
    return {
      code,
      count,
      level,
      label,
      detail: `${scheduleSeatFreshnessAgeLabel(ageMs)} · ${count} posted section${count === 1 ? '' : 's'}`,
      fetchedAt: meta.fetchedAt,
      ageMs,
      source: meta.source || 'live fetch',
    };
  });
  const dangerCount = rows.filter(row => row.level === 'danger').length;
  const warnCount = rows.filter(row => row.level === 'warn').length;
  const level = dangerCount ? 'danger' : warnCount ? 'warn' : 'ok';
  const label = !rows.length ? 'No section data'
    : dangerCount ? 'Refresh seats'
      : warnCount ? 'Review freshness'
        : 'Fresh seats';
  const detail = !rows.length ? 'No schedule-ready courses need posted sections.'
    : dangerCount ? `${dangerCount} course${dangerCount === 1 ? '' : 's'} have stale section data. Refresh before registration.`
      : warnCount ? `${warnCount} course${warnCount === 1 ? '' : 's'} need a seat-data freshness check.`
        : 'All loaded section data was refreshed recently.';
  return {
    level,
    label,
    detail,
    rows,
    dangerCount,
    warnCount,
    refreshedCount: rows.filter(row => row.level === 'ok').length,
  };
}

function renderScheduleSeatFreshnessHtml(freshness, heading = 'Seat Data Freshness') {
  if (!freshness) return '';
  const rows = Array.isArray(freshness.rows) ? freshness.rows : [];
  return `
    <section class="schedule-seat-freshness ${scheduleEscape(freshness.level)}">
      <div class="schedule-seat-freshness-head">
        <div>
          <h4>${scheduleEscape(heading)}</h4>
          <span>${scheduleEscape(freshness.detail)}</span>
        </div>
        <strong>${scheduleEscape(freshness.label)}</strong>
      </div>
      ${rows.length ? `
        <div class="schedule-seat-freshness-list">
          ${rows.slice(0, 8).map(row => `
            <div class="schedule-seat-freshness-row ${scheduleEscape(row.level)}">
              <strong>${scheduleEscape(row.code)}</strong>
              <span>${scheduleEscape(row.detail)}</span>
              <em>${scheduleEscape(row.label)}${row.source ? ` · ${scheduleEscape(row.source)}` : ''}</em>
            </div>
          `).join('')}
        </div>
      ` : '<p>No section data loaded yet.</p>'}
      ${rows.length ? `
        <div class="schedule-seat-freshness-actions">
          <strong>Before Testudo</strong>
          <button class="btn small ${freshness.level === 'ok' ? '' : 'primary'}" type="button" data-seat-freshness-action="refresh">Refresh sections now</button>
        </div>
      ` : ''}
    </section>
  `;
}

function scheduleSeatFreshnessText(freshness) {
  if (!freshness) return [];
  const lines = [
    '',
    'Seat data freshness:',
    `- Overall: ${freshness.label}. ${freshness.detail}`,
  ];
  (freshness.rows || []).forEach(row => {
    lines.push(`- ${row.code}: ${row.detail}. ${row.label}.`);
  });
  if ((freshness.rows || []).length) lines.push('- Action: Refresh sections in Terp Track shortly before opening Testudo.');
  return lines;
}

function scheduleSectionMeetingLines(section) {
  const timed = (section && section.meetings || []).filter(m => m.days && m.start_time && m.end_time);
  if (!timed.length) return ['Time TBA'];
  return timed.map(m => {
    const where = [m.building, m.room].filter(Boolean).join(' ');
    return `${m.days} ${m.start_time}-${m.end_time}${where ? ` · ${where}` : ''}`;
  });
}

function scheduleInstructorLine(section) {
  const instructors = section && Array.isArray(section.instructors) ? section.instructors.filter(Boolean) : [];
  return instructors.length ? instructors.join(', ') : 'Instructor TBA';
}

function schedulePreferenceSummary(prefs) {
  const parts = [];
  const earliest = parseClockValue(prefs.earliest);
  const latest = parseClockValue(prefs.latest);
  if (earliest !== null) parts.push(`after ${formatMeetingTime(earliest)}`);
  if (latest !== null) parts.push(`before ${formatMeetingTime(latest)}`);
  if (Number(prefs.minBreak) > 0) parts.push(`${Number(prefs.minBreak)} min breaks`);
  if (prefs.avoidDays.length) parts.push(`avoid ${prefs.avoidDays.join('/')}`);
  const zone = scheduleDefById(CAMPUS_ZONE_DEFS, prefs.campusZone);
  const start = scheduleDefById(CAMPUS_ANCHOR_DEFS, prefs.commuteStart);
  const end = scheduleDefById(CAMPUS_ANCHOR_DEFS, prefs.commuteEnd);
  if (zone.id) parts.push(zone.label);
  if (start.id) parts.push(`from ${start.label}`);
  if (end.id) parts.push(`to ${end.label}`);
  return parts.length ? parts.join(' · ') : 'No active schedule preferences';
}

function scheduleOutputFilename(term) {
  const label = scheduleTermLabel(term).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `terp-track-schedule-${label || 'term'}.txt`;
}

function scheduleCleanFilenamePart(value) {
  return String(value || 'terp-track')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 42) || 'terp-track';
}

function scheduleAdvisorFilename(term) {
  const program = scheduleCleanFilenamePart(getSettings().programName || 'umd-degree-plan');
  const label = scheduleTermLabel(term).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const date = new Date().toISOString().slice(0, 10);
  return `terp-track-advisor-${program}-${label || 'term'}-${date}.html`;
}

function scheduleCalendarFilename(term) {
  const program = scheduleCleanFilenamePart(getSettings().programName || 'umd-degree-plan');
  const label = scheduleTermLabel(term).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `terp-track-calendar-${program}-${label || 'term'}.ics`;
}

function scheduleRegistrationFilename(term) {
  const program = scheduleCleanFilenamePart(getSettings().programName || 'umd-degree-plan');
  const label = scheduleTermLabel(term).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `terp-track-registration-${program}-${label || 'term'}.txt`;
}

function scheduleUtcDate(year, monthIndex, day) {
  return new Date(Date.UTC(year, monthIndex, day, 12, 0, 0));
}

function scheduleDateOnOrAfter(year, monthIndex, day, targetDow) {
  const date = scheduleUtcDate(year, monthIndex, day);
  const delta = (targetDow - date.getUTCDay() + 7) % 7;
  date.setUTCDate(date.getUTCDate() + delta);
  return date;
}

function scheduleDateInputToUtc(value) {
  const normalized = normalizeScheduleDate(value);
  if (!normalized) return null;
  const [year, month, day] = normalized.split('-').map(Number);
  return scheduleUtcDate(year, month - 1, day);
}

function scheduleCalendarTermWindow(term, prefs = DEFAULT_SCHEDULE_PREFS) {
  const customStart = scheduleDateInputToUtc(prefs.calendarStart);
  const customEnd = scheduleDateInputToUtc(prefs.calendarEnd);
  if (customStart && customEnd && customEnd >= customStart) {
    return {
      start: customStart,
      end: customEnd,
      note: `Calendar range set in Terp Track: ${prefs.calendarStart} to ${prefs.calendarEnd}. Confirm exact academic-calendar dates with UMD.`,
      custom: true,
    };
  }
  const raw = String(term || '');
  const year = /^\d{4}/.test(raw) ? parseInt(raw.slice(0, 4), 10) : new Date().getFullYear();
  const suffix = raw.slice(4);
  if (suffix === '08') {
    return {
      start: scheduleDateOnOrAfter(year, 7, 29, 1),
      end: scheduleDateOnOrAfter(year, 11, 8, 6),
      note: 'Fall class weeks are inferred from late August through the December exam window; confirm exact academic-calendar dates with UMD.',
    };
  }
  if (suffix === '05') {
    return {
      start: scheduleDateOnOrAfter(year, 5, 1, 1),
      end: scheduleDateOnOrAfter(year, 7, 1, 6),
      note: 'Summer class weeks vary by session; confirm exact session dates with UMD before relying on recurring events.',
    };
  }
  if (suffix === '12') {
    return {
      start: scheduleDateOnOrAfter(year, 0, 2, 1),
      end: scheduleDateOnOrAfter(year, 0, 20, 6),
      note: 'Winter class weeks vary by session; confirm exact session dates with UMD before relying on recurring events.',
    };
  }
  return {
    start: scheduleDateOnOrAfter(year, 0, 24, 1),
    end: scheduleDateOnOrAfter(year, 4, 8, 6),
    note: 'Spring class weeks are inferred from late January through the May exam window; confirm exact academic-calendar dates with UMD.',
  };
}

function scheduleCalendarDayCode(day) {
  return { M: 'MO', Tu: 'TU', W: 'WE', Th: 'TH', F: 'FR', Sa: 'SA', Su: 'SU' }[day] || 'MO';
}

function scheduleCalendarDayIndex(day) {
  return { Su: 0, M: 1, Tu: 2, W: 3, Th: 4, F: 5, Sa: 6 }[day] ?? 1;
}

function scheduleCalendarFirstMeetingDate(windowStart, day) {
  const date = new Date(windowStart.getTime());
  const target = scheduleCalendarDayIndex(day);
  const delta = (target - date.getUTCDay() + 7) % 7;
  date.setUTCDate(date.getUTCDate() + delta);
  return date;
}

function scheduleCalendarDateTime(date, minutes) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  const h = String(Math.floor(minutes / 60)).padStart(2, '0');
  const min = String(minutes % 60).padStart(2, '0');
  return `${y}${m}${d}T${h}${min}00`;
}

function scheduleCalendarTimestamp(date = new Date()) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function scheduleIcsEscape(value) {
  return String(value == null ? '' : value)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

function scheduleIcsFoldLine(line) {
  const text = String(line || '');
  if (text.length <= 73) return [text];
  const lines = [];
  for (let i = 0; i < text.length; i += 73) {
    lines.push(`${i ? ' ' : ''}${text.slice(i, i + 73)}`);
  }
  return lines;
}

function buildScheduleCalendarIcs(sem, term, selectedItems = [], prefs = DEFAULT_SCHEDULE_PREFS) {
  const termWindow = scheduleCalendarTermWindow(term, prefs);
  const stamp = scheduleCalendarTimestamp();
  const header = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Terp Track//Schedule Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Terp Track - ' + scheduleIcsEscape(`${sem?.name || 'Schedule'} ${scheduleTermLabel(term)}`),
    'X-WR-TIMEZONE:America/New_York',
  ];
  const events = [];
  (selectedItems || []).forEach(item => {
    const blocks = sectionBlocks(item.section, item.course);
    blocks.forEach((block, index) => {
      const first = scheduleCalendarFirstMeetingDate(termWindow.start, block.day);
      const sectionLabel = scheduleSectionShortLabel(item.section);
      const code = item.course?.code || block.code || displayCode(item.section?.course || '');
      const summary = `${code} ${sectionLabel}`.trim();
      const detailParts = [
        item.course?.title || block.title || '',
        block.type || '',
        scheduleInstructorLine(item.section),
        sectionSeatRisk(item.section).detail,
        termWindow.note,
      ].filter(Boolean);
      events.push(
        'BEGIN:VEVENT',
        `UID:terp-track-${scheduleCleanFilenamePart(term)}-${scheduleCleanFilenamePart(code)}-${scheduleCleanFilenamePart(sectionLabel)}-${scheduleCalendarDayCode(block.day)}-${index}@terptrack.local`,
        `DTSTAMP:${stamp}`,
        `SUMMARY:${scheduleIcsEscape(summary)}`,
        `DTSTART;TZID=America/New_York:${scheduleCalendarDateTime(first, block.start)}`,
        `DTEND;TZID=America/New_York:${scheduleCalendarDateTime(first, block.end)}`,
        `RRULE:FREQ=WEEKLY;BYDAY=${scheduleCalendarDayCode(block.day)};UNTIL=${scheduleCalendarDateTime(termWindow.end, 23 * 60 + 59)}`,
        block.room ? `LOCATION:${scheduleIcsEscape(block.room)}` : '',
        `DESCRIPTION:${scheduleIcsEscape(detailParts.join('\n'))}`,
        'END:VEVENT'
      );
    });
  });
  return [...header, ...events.filter(Boolean), 'END:VCALENDAR']
    .flatMap(scheduleIcsFoldLine)
    .join('\r\n');
}

function scheduleCalendarEventCount(ics) {
  return (String(ics || '').match(/BEGIN:VEVENT/g) || []).length;
}

function scheduleCalendarDateLabel(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return 'date unavailable';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

function scheduleCalendarExportSummary(sem, term, courses = [], selectedItems = [], prefs = DEFAULT_SCHEDULE_PREFS, ics = '') {
  const courseList = Array.isArray(courses) ? courses : [];
  const picked = Array.isArray(selectedItems) ? selectedItems : [];
  const termWindow = scheduleCalendarTermWindow(term, prefs);
  const pickedCodes = new Set(picked.map(item => normalizeCode(item.course?.code || item.section?.course || '')));
  const pickedRows = picked.map(item => {
    const blocks = sectionBlocks(item.section, item.course);
    return {
      courseCode: item.course?.code || displayCode(item.section?.course || ''),
      title: item.course?.title || '',
      sectionLabel: scheduleSectionShortLabel(item.section),
      eventCount: blocks.length,
      meetings: scheduleSectionMeetingLines(item.section),
      missing: false,
    };
  });
  const missingRows = courseList
    .filter(course => !pickedCodes.has(normalizeCode(course.code || '')))
    .map(course => ({
      courseCode: course.code || 'Course',
      title: course.title || '',
      sectionLabel: 'Missing section',
      eventCount: 0,
      meetings: ['No section picked'],
      missing: true,
    }));
  const rows = [...pickedRows, ...missingRows];
  const eventCount = ics ? scheduleCalendarEventCount(ics) : pickedRows.reduce((sum, row) => sum + row.eventCount, 0);
  const timedCourseCount = pickedRows.filter(row => row.eventCount > 0).length;
  const tbaRows = pickedRows.filter(row => row.eventCount === 0);
  const courseCount = courseList.length || picked.length;
  const omittedCount = missingRows.length + tbaRows.length;
  const windowLabel = `${scheduleCalendarDateLabel(termWindow.start)} to ${scheduleCalendarDateLabel(termWindow.end)}`;
  const level = !courseCount ? 'ok'
    : !picked.length ? 'danger'
    : !eventCount ? 'danger'
      : missingRows.length || tbaRows.length ? 'warn'
        : 'ok';
  const label = !courseCount ? 'No calendar courses'
    : !picked.length ? 'No calendar events'
    : !eventCount ? 'No timed events'
      : missingRows.length ? 'Calendar incomplete'
      : tbaRows.length ? 'Review TBA meetings'
        : 'Calendar ready';
  const detail = !courseCount
    ? 'No schedule-ready courses need calendar events.'
    : !eventCount
      ? `${courseCount - timedCourseCount}/${courseCount} planned course${courseCount === 1 ? '' : 's'} will be omitted until sections with posted times are picked.`
      : missingRows.length
        ? `${eventCount} weekly event${eventCount === 1 ? '' : 's'} across ${timedCourseCount}/${courseCount} planned course${courseCount === 1 ? '' : 's'}; ${missingRows.length} course${missingRows.length === 1 ? '' : 's'} still need${missingRows.length === 1 ? 's' : ''} a section.`
        : tbaRows.length
          ? `${eventCount} weekly event${eventCount === 1 ? '' : 's'} across ${timedCourseCount}/${courseCount} planned course${courseCount === 1 ? '' : 's'}; ${tbaRows.length} picked section${tbaRows.length === 1 ? '' : 's'} have no posted meeting time.`
          : `${eventCount} weekly event${eventCount === 1 ? '' : 's'} across ${timedCourseCount}/${courseCount} planned course${courseCount === 1 ? '' : 's'}.`;
  return {
    level,
    label,
    detail,
    termLabel: scheduleTermLabel(term),
    semesterLabel: sem?.name || 'Selected semester',
    windowLabel,
    windowNote: termWindow.note,
    customRange: !!termWindow.custom,
    eventCount,
    courseCount,
    pickedCount: picked.length,
    timedCourseCount,
    tbaCount: tbaRows.length,
    missingCount: missingRows.length,
    omittedCount,
    rows,
    tbaRows,
    missingRows,
  };
}

function renderScheduleCalendarExportHtml(summary, heading = 'Calendar Export') {
  if (!summary) return '';
  const rows = Array.isArray(summary.rows) ? summary.rows : [];
  return `
    <section class="schedule-calendar-export ${scheduleEscape(summary.level)}">
      <div class="schedule-calendar-export-head">
        <div>
          <h4>${scheduleEscape(heading)}</h4>
          <span>${scheduleEscape(summary.windowLabel)} · ${scheduleEscape(summary.termLabel)}</span>
        </div>
        <strong>${scheduleEscape(summary.label)}</strong>
      </div>
      <p>${scheduleEscape(summary.detail)} ${scheduleEscape(summary.windowNote)}</p>
      <div class="schedule-calendar-export-metrics">
        <span><strong>${summary.eventCount}</strong><em>calendar events</em></span>
        <span><strong>${summary.timedCourseCount}/${summary.courseCount || summary.pickedCount}</strong><em>timed courses</em></span>
        <span><strong>${summary.omittedCount || 0}</strong><em>omitted courses</em></span>
      </div>
      ${rows.length ? `
        <div class="schedule-calendar-export-list">
          ${rows.slice(0, 8).map(row => `
            <div class="schedule-calendar-export-row ${row.missing ? 'danger' : row.eventCount ? 'ok' : 'warn'}">
              <strong>${scheduleEscape(row.courseCode)} ${scheduleEscape(row.sectionLabel)}</strong>
              <span>${row.missing ? 'Omitted from calendar until a section is picked' : row.eventCount ? `${row.eventCount} calendar event${row.eventCount === 1 ? '' : 's'}` : 'No timed calendar event'}</span>
              <em>${scheduleEscape(row.meetings.join(' / '))}</em>
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${(summary.omittedCount || 0) > 0 ? `
        <div class="schedule-calendar-export-actions">
          <strong>Before download</strong>
          <div>
            <button class="btn small primary" type="button" data-calendar-export-action="auto-fill-omissions">Auto-fill timed sections</button>
            <button class="btn small" type="button" data-calendar-export-action="review-omissions">Review omitted courses</button>
          </div>
        </div>
      ` : ''}
    </section>
  `;
}

function scheduleCalendarExportText(summary) {
  if (!summary) return [];
  const lines = [
    '',
    'Calendar export:',
    `- ${summary.label}: ${summary.detail}`,
    `- Range: ${summary.windowLabel} (${summary.termLabel}).`,
    `- Note: ${summary.windowNote}`,
  ];
  (summary.rows || []).forEach(row => {
    if (row.missing) lines.push(`- ${row.courseCode} ${row.sectionLabel}: omitted from calendar until a section is picked; ${row.meetings.join('; ')}.`);
    else lines.push(`- ${row.courseCode} ${row.sectionLabel}: ${row.eventCount} calendar event${row.eventCount === 1 ? '' : 's'}; ${row.meetings.join('; ')}.`);
  });
  if (summary.omittedCount) {
    const omitted = [...(summary.tbaRows || []), ...(summary.missingRows || [])]
      .map(row => `${row.courseCode} ${row.sectionLabel}`);
    lines.push(`- Omitted courses: ${omitted.join(', ')}.`);
    lines.push('- Action: Pick sections or replace TBA meetings for omitted courses before relying on the calendar export.');
  }
  return lines;
}

function scheduleRecentChanges(limit = 5) {
  return typeof recentPlanChanges === 'function' ? recentPlanChanges().slice(0, limit) : [];
}

function scheduleChangeIcon(type) {
  if (type === 'term-move') return 'Move';
  if (type === 'term-move-undo') return 'Undo';
  if (type === 'section-swap') return 'Swap';
  if (type === 'auto-pick') return 'Auto';
  if (type === 'section-pick') return 'Pick';
  if (type === 'section-pick-undo') return 'Undo';
  if (type === 'clear') return 'Clear';
  return 'Edit';
}

function scheduleChangeTime(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function scheduleChangeHighlights(change) {
  return (Array.isArray(change?.highlights) ? change.highlights : [])
    .map(item => String(item || '').trim())
    .filter(Boolean)
    .slice(0, 6);
}

function scheduleChangeDigestHtml(changes, sourceLabel = 'Plan') {
  if (!changes.length) return '';
  return `
    <div class="schedule-change-digest">
      <div class="schedule-change-head">
        <strong>Recent Changes</strong>
        <span>${scheduleEscape(sourceLabel)} · last ${changes.length} saved edit${changes.length === 1 ? '' : 's'}</span>
      </div>
      <div class="schedule-change-list">
        ${changes.map(change => `
          <div class="schedule-change-row">
            <b>${scheduleEscape(scheduleChangeIcon(change.type))}</b>
            <div>
              <strong>${scheduleEscape(change.title)}</strong>
              ${change.detail ? `<p>${scheduleEscape(change.detail)}</p>` : ''}
              ${scheduleChangeHighlights(change).length ? `<ul class="schedule-change-highlights">${scheduleChangeHighlights(change).map(item => `<li>${scheduleEscape(item)}</li>`).join('')}</ul>` : ''}
              <span>${scheduleEscape([change.meta, scheduleChangeTime(change.at)].filter(Boolean).join(' · '))}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function scheduleRecentChangesText(changes) {
  if (!changes.length) return [];
  const lines = ['', 'Recent plan changes:'];
  changes.forEach(change => {
    const meta = [change.meta, scheduleChangeTime(change.at)].filter(Boolean).join(' · ');
    lines.push(`- ${scheduleChangeIcon(change.type)}: ${change.title}${meta ? ` (${meta})` : ''}`);
    if (change.detail) lines.push(`  ${change.detail}`);
    scheduleChangeHighlights(change).forEach(item => lines.push(`  - ${item}`));
  });
  return lines;
}

function scheduleAdvisorAuditIssues(limit = 6) {
  if (typeof auditDegreeIssues !== 'function') return [];
  try {
    const issues = auditDegreeIssues()
      .map(issue => {
        const browse = issue.browse || {};
        const clean = {
          key: issue.key,
          type: issue.type || 'audit',
          level: issue.level || 'info',
          title: issue.title || 'Degree audit item',
          status: issue.status || '',
          summary: issue.summary || '',
          satisfies: issue.satisfies || '',
          actionLabel: issue.actionLabel || '',
          actionType: issue.actionType || 'browse',
          courseCode: issue.courseCode || '',
          semId: issue.semId || '',
          browse: {
            dept: browse.dept || '',
            genEd: browse.genEd || '',
            search: browse.search || '',
            label: browse.label || '',
          },
          tags: Array.isArray(issue.tags) ? issue.tags.slice(0, 4) : [],
        };
        clean.actionSummary = scheduleAuditIssueActionSummary(clean);
        clean.browseTarget = scheduleAuditIssueBrowseTarget(clean);
        return clean;
      });
    const shown = issues.slice(0, limit);
    shown.totalOpen = issues.length;
    shown.totalCounts = issues.reduce((acc, issue) => {
      acc.total += 1;
      acc[issue.type] = (acc[issue.type] || 0) + 1;
      acc[issue.level] = (acc[issue.level] || 0) + 1;
      return acc;
    }, { total: 0, placeholder: 0, gened: 0, danger: 0, warn: 0, info: 0 });
    return shown;
  } catch {
    return [];
  }
}

function scheduleAuditIssueCounts(issues) {
  if (issues?.totalCounts) return { total: issues.totalOpen || issues.totalCounts.total || 0, ...issues.totalCounts };
  return (issues || []).reduce((acc, issue) => {
    acc.total += 1;
    acc[issue.type] = (acc[issue.type] || 0) + 1;
    acc[issue.level] = (acc[issue.level] || 0) + 1;
    return acc;
  }, { total: 0, placeholder: 0, gened: 0, 'prior-credit': 0, danger: 0, warn: 0, info: 0 });
}

function scheduleAuditIssueLevelLabel(issue) {
  if (issue.level === 'danger') return 'Critical';
  if (issue.level === 'warn') return 'Review';
  return 'Plan';
}

function scheduleAuditIssueSemesterName(semId) {
  const sem = (typeof getAllSemesters === 'function' ? getAllSemesters() : []).find(item => item.id === semId);
  return sem?.name || semId || '';
}

function scheduleAuditBrowseDeptLabel(dept) {
  if (!dept) return '';
  if (typeof BROWSE_PROFILE_DEPTS_VALUE !== 'undefined' && dept === BROWSE_PROFILE_DEPTS_VALUE) return 'Profile departments';
  if (typeof BROWSE_ALL_DEPTS_VALUE !== 'undefined' && dept === BROWSE_ALL_DEPTS_VALUE) return 'All departments';
  return dept;
}

function scheduleAuditBrowseGenEdLabel(genEd) {
  if (!genEd) return '';
  if (typeof BROWSE_ALL_GENEDS_VALUE !== 'undefined' && genEd === BROWSE_ALL_GENEDS_VALUE) return 'All GenEds';
  return genEd;
}

function scheduleAuditIssueBrowseTarget(issue) {
  if (issue?.actionType === 'prior-credit') return 'Settings · AP / IB / Transfer Credit';
  const browse = issue?.browse || {};
  const parts = [
    scheduleAuditBrowseDeptLabel(browse.dept),
    scheduleAuditBrowseGenEdLabel(browse.genEd),
    browse.search,
  ].filter(Boolean);
  if (parts.length) return parts.join(' · ');
  if (issue?.actionType === 'placeholder') return 'Replacement drawer, then Browse if needed';
  return 'Browse course catalog';
}

function scheduleAuditIssueActionSummary(issue) {
  if (issue?.actionType === 'prior-credit') return 'Review prior-credit conflicts in Settings';
  if (issue?.actionType === 'placeholder') {
    const semName = scheduleAuditIssueSemesterName(issue.semId);
    return `Replace ${issue.courseCode || issue.title || 'placeholder'}${semName ? ` in ${semName}` : ''}`;
  }
  return `${issue?.actionLabel || 'Find courses'} in Browse`;
}

function scheduleAdvisorDeepLinkHash(action, key) {
  const cleanAction = action === 'browse' ? 'browse' : 'primary';
  const cleanKey = String(key || '').trim();
  if (!cleanKey) return '';
  return `#advisor-action=${encodeURIComponent(cleanAction)}&issue=${encodeURIComponent(cleanKey)}`;
}

function scheduleAdvisorLiveBaseUrl() {
  try {
    if (typeof location !== 'undefined' && location.origin && location.origin !== 'null') {
      return `${location.origin}${location.pathname || '/'}`;
    }
  } catch {}
  return '';
}

function scheduleAdvisorDeepLink(action, key) {
  const hash = scheduleAdvisorDeepLinkHash(action, key);
  if (!hash) return '#';
  const base = scheduleAdvisorLiveBaseUrl();
  return base ? `${base}${hash}` : hash;
}

function scheduleUtf8Bytes(value) {
  const text = String(value || '');
  if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(text);
  const encoded = encodeURIComponent(text);
  const bytes = [];
  for (let i = 0; i < encoded.length; i += 1) {
    if (encoded[i] === '%' && i + 2 < encoded.length) {
      bytes.push(parseInt(encoded.slice(i + 1, i + 3), 16));
      i += 2;
    } else {
      bytes.push(encoded.charCodeAt(i));
    }
  }
  return bytes;
}

function scheduleBytesToB64Url(bytes) {
  if (typeof _bytesToB64Url === 'function') {
    try {
      return _bytesToB64Url(bytes);
    } catch {}
  }
  if (typeof btoa === 'function') {
    let s = '';
    for (let i = 0; i < bytes.length; i += 1) s += String.fromCharCode(bytes[i]);
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const c = i + 2 < bytes.length ? bytes[i + 2] : 0;
    const triple = (a << 16) | (b << 8) | c;
    out += alphabet[(triple >> 18) & 63];
    out += alphabet[(triple >> 12) & 63];
    out += i + 1 < bytes.length ? alphabet[(triple >> 6) & 63] : '=';
    out += i + 2 < bytes.length ? alphabet[triple & 63] : '=';
  }
  return out.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function scheduleAdvisorPlanSharePayload() {
  if (typeof _planSharePayload === 'function') return _planSharePayload();
  const appState = typeof state !== 'undefined' ? state : {};
  return {
    v: 1,
    courses: appState.courses || {},
    customCourses: appState.customCourses || [],
    customSemesters: appState.customSemesters || [],
    customMajors: appState.customMajors || [],
    activeSchedule: appState.activeSchedule || null,
    selectedSections: appState.selectedSections || {},
    schedulePrefs: appState.schedulePrefs || {},
    scheduleAdvisorFilter: appState.scheduleAdvisorFilter,
    scheduleOutputPreset: appState.scheduleOutputPreset,
    scheduleOutputOptions: appState.scheduleOutputOptions,
    roadmapPrefs: appState.roadmapPrefs,
    browseSavedSearches: appState.browseSavedSearches || [],
    recentChanges: appState.recentChanges || [],
    majorId: appState.majorId || null,
    profilePrefs: appState.profilePrefs || {},
    settings: appState.settings || {},
  };
}

function scheduleAdvisorPlanImportHash() {
  try {
    const json = JSON.stringify(scheduleAdvisorPlanSharePayload());
    const encoded = scheduleBytesToB64Url(scheduleUtf8Bytes(json));
    return encoded ? `#plan=${encoded}` : '';
  } catch {
    return '';
  }
}

function scheduleAdvisorPlanImportUrl() {
  const hash = scheduleAdvisorPlanImportHash();
  if (!hash) return '';
  const base = scheduleAdvisorLiveBaseUrl();
  return base ? `${base}${hash}` : hash;
}

function scheduleAdvisorLiveLinkNoticeHtml(importUrl = scheduleAdvisorPlanImportUrl()) {
  return `
    <div class="schedule-advisor-live-note">
      <strong>Live TerpTrack links</strong>
      <p>Action links reopen this exact plan in the TerpTrack app and depend on the same browser profile/local plan state. If this packet is opened on another device or profile, open/import the matching plan there first, or use the Next action and Browse target text manually.</p>
      ${importUrl ? `<a class="schedule-advisor-import-link" href="${scheduleEscape(importUrl)}">Open/import matching plan</a>` : ''}
    </div>
  `;
}

function scheduleAdvisorLiveLinkNoticeText(importUrl = scheduleAdvisorPlanImportUrl()) {
  const lines = [
    '',
    'Live TerpTrack links:',
    '- Action links reopen this exact plan in the TerpTrack app and depend on the same browser profile/local plan state.',
    '- If this packet is opened on another device or profile, open/import the matching plan there first, or use the Next action and Browse target text manually.',
  ];
  if (importUrl) lines.push(`- Open/import matching plan: ${importUrl}`);
  return lines;
}

function scheduleAdvisorActionFromHash(hashValue) {
  const raw = String(hashValue || (typeof location !== 'undefined' ? location.hash : '') || '').replace(/^#/, '');
  if (!raw || raw.startsWith('plan=')) return null;
  const parsed = raw.split('&').reduce((acc, part) => {
    const [key, ...rest] = part.split('=');
    if (!key) return acc;
    const value = rest.join('=');
    try {
      acc[decodeURIComponent(key)] = decodeURIComponent(value || '');
    } catch {
      acc[key] = value || '';
    }
    return acc;
  }, {});
  if (parsed['advisor-action'] !== 'primary' && parsed['advisor-action'] !== 'browse') return null;
  if (!parsed.issue) return null;
  return { action: parsed['advisor-action'], key: parsed.issue };
}

function scheduleClearAdvisorActionHash() {
  try {
    if (typeof history !== 'undefined' && typeof location !== 'undefined' && history.replaceState) {
      history.replaceState(null, '', `${location.pathname || '/'}${location.search || ''}`);
    }
  } catch {}
}

function scheduleHandleAdvisorActionHash(hashValue, opts = {}) {
  const parsed = scheduleAdvisorActionFromHash(hashValue);
  if (!parsed) return false;
  const issue = typeof auditFindIssue === 'function' ? auditFindIssue(parsed.key) : null;
  if (!issue) return false;
  if (parsed.action === 'browse') scheduleOpenAdvisorAuditBrowse(parsed.key);
  else scheduleOpenAdvisorAuditPrimary(parsed.key);
  if (opts.clear !== false) scheduleClearAdvisorActionHash();
  return true;
}

function scheduleAuditIssueActionHtml(issue) {
  if (!issue?.key) return '';
  const primaryHref = scheduleAdvisorDeepLink('primary', issue.key);
  const browseHref = scheduleAdvisorDeepLink('browse', issue.key);
  const browseLabel = issue.actionType === 'prior-credit' ? 'Open Settings' : 'Open Browse';
  return `
    <div class="schedule-advisor-audit-next">
      <span><strong>Next action</strong>${scheduleEscape(issue.actionSummary || 'Review in Terp Track')}</span>
      <span><strong>Browse target</strong>${scheduleEscape(issue.browseTarget || 'Browse course catalog')}</span>
    </div>
    <div class="schedule-advisor-audit-actions">
      <a class="schedule-advisor-audit-link primary" href="${scheduleEscape(primaryHref)}" data-schedule-audit-primary="${scheduleEscape(issue.key)}">${scheduleEscape(issue.actionLabel || 'Open')}</a>
      <a class="schedule-advisor-audit-link" href="${scheduleEscape(browseHref)}" data-schedule-audit-browse="${scheduleEscape(issue.key)}">${scheduleEscape(browseLabel)}</a>
    </div>
  `;
}

function scheduleAdvisorAuditSummaryHtml(issues) {
  const list = Array.isArray(issues) ? issues : [];
  const counts = scheduleAuditIssueCounts(list);
  const shownNote = counts.total > list.length ? ` · showing top ${list.length}` : '';
  if (!list.length) {
    return `
      <section class="schedule-advisor-audit">
        <div class="schedule-advisor-diagnostics-head">
          <div>
            <h4>Degree Audit Snapshot</h4>
            <span>No open placeholders, GenEd gaps, or prior-credit conflicts detected in the current plan.</span>
          </div>
          <strong>Clear</strong>
        </div>
      </section>
    `;
  }
  return `
    <section class="schedule-advisor-audit">
      <div class="schedule-advisor-diagnostics-head">
        <div>
          <h4>Degree Audit Snapshot</h4>
          <span>${counts.total} open item${counts.total === 1 ? '' : 's'} · ${counts['prior-credit'] || 0} prior-credit review${counts['prior-credit'] === 1 ? '' : 's'} · ${counts.placeholder || 0} placeholder${counts.placeholder === 1 ? '' : 's'} · ${counts.gened || 0} GenEd gap${counts.gened === 1 ? '' : 's'}${shownNote}</span>
        </div>
        <strong>${counts.danger ? 'Fix first' : 'Review'}</strong>
      </div>
      <div class="schedule-advisor-audit-list">
        ${list.map(issue => `
          <div class="schedule-advisor-audit-row ${scheduleEscape(issue.level)}">
            <b>${scheduleEscape(scheduleAuditIssueLevelLabel(issue))}</b>
            <div>
              <strong>${scheduleEscape(issue.title)}</strong>
              <p>${scheduleEscape(issue.summary)}</p>
              <span>${scheduleEscape([issue.status, issue.satisfies].filter(Boolean).join(' · '))}</span>
              ${scheduleAuditIssueActionHtml(issue)}
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function scheduleAdvisorAuditSummaryText(issues) {
  const list = Array.isArray(issues) ? issues : [];
  if (!list.length) return ['', 'Degree audit snapshot:', '- No open placeholders, GenEd gaps, or prior-credit conflicts detected.'];
  const counts = scheduleAuditIssueCounts(list);
  const shownNote = counts.total > list.length ? `; top ${list.length} shown` : '';
  const lines = [
    '',
    'Degree audit snapshot:',
    `- ${counts.total} open item${counts.total === 1 ? '' : 's'} (${counts['prior-credit'] || 0} prior-credit reviews / ${counts.placeholder || 0} placeholders / ${counts.gened || 0} GenEd gaps${shownNote})`,
  ];
  list.forEach(issue => {
    lines.push(`- ${scheduleAuditIssueLevelLabel(issue)}: ${issue.title}${issue.status ? ` (${issue.status})` : ''}`);
    if (issue.summary) lines.push(`  ${issue.summary}`);
    if (issue.satisfies) lines.push(`  Satisfies: ${issue.satisfies}`);
    if (issue.actionSummary) lines.push(`  Next action: ${issue.actionSummary}`);
    if (issue.browseTarget) lines.push(`  Browse target: ${issue.browseTarget}`);
  });
  return lines;
}

function scheduleOpenAdvisorAuditPrimary(key) {
  if (typeof auditOpenIssuePrimary !== 'function') {
    if (typeof toastError === 'function') toastError('Degree audit actions are still loading.');
    return;
  }
  auditOpenIssuePrimary(key);
}

function scheduleOpenAdvisorAuditBrowse(key) {
  if (typeof auditOpenIssueBrowse !== 'function') {
    if (typeof toastError === 'function') toastError('Degree audit Browse actions are still loading.');
    return;
  }
  auditOpenIssueBrowse(key);
}

if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('hashchange', () => {
    scheduleHandleAdvisorActionHash();
  });
}

function scheduleCourseIsGenEd(course) {
  const category = String(course?.category || '').toLowerCase();
  return course?.kind === 'gened'
    || category.startsWith('gened-')
    || (Array.isArray(course?.categories) && course.categories.some(cat => String(cat).toLowerCase().startsWith('gened-')));
}

function scheduleAdvisorCourseType(course) {
  if (isGoalCourse(course)) return 'Goal';
  if (scheduleCourseIsGenEd(course)) return 'GenEd';
  if (course?.kind === 'critical') return 'Critical';
  if (course?.kind === 'tech') return 'Tech elective';
  if (course?.kind === 'core' || String(course?.category || '').includes('core')) return 'Major/core';
  return 'Planned';
}

function scheduleAdvisorCourseStatus(course) {
  const s = getCourseState(course.code);
  if (s.status === 'passed') return s.grade ? `Passed ${s.grade}` : 'Passed';
  if (s.status === 'transfer') return 'Transfer';
  if (s.status === 'in-progress') return 'In progress';
  if (s.status === 'failed') return 'Failed';
  const pre = prereqsMet(course);
  return pre.met ? 'Planned' : `Locked: ${pre.missing || 'prereq needed'}`;
}

function scheduleAdvisorCourseIsRemaining(course) {
  const status = getCourseState(course.code).status;
  return status !== 'passed' && status !== 'transfer';
}

function scheduleAdvisorWarningCodes(warnings) {
  const codes = new Set();
  (warnings || []).forEach(warning => {
    const match = String(warning || '').match(/^([A-Z]{2,4})\s*([0-9]{3}[A-Z]?)/);
    if (match) codes.add(normalizeCode(`${match[1]} ${match[2]}`));
  });
  return codes;
}

function scheduleAdvisorStats() {
  const courses = flatCourses();
  const totalRequired = Number(getSettings().totalCredits) || courses.reduce((sum, course) => sum + (Number(course.cr) || 0), 0);
  const goalCodes = new Set(getGoalCodes().map(normalizeCode));
  let plannedCredits = 0;
  let earnedCredits = 0;
  let inProgressCredits = 0;
  let remainingCredits = 0;
  let transferCredits = 0;
  let genEdCredits = 0;
  let goalDone = 0;
  let gpaPoints = 0;
  let gpaCredits = 0;

  courses.forEach(course => {
    const cr = Number(course.cr) || 0;
    const status = getCourseState(course.code);
    plannedCredits += cr;
    if (scheduleCourseIsGenEd(course)) genEdCredits += cr;
    if (status.status === 'passed' || status.status === 'transfer') {
      earnedCredits += cr;
      if (status.status === 'transfer') transferCredits += cr;
      if (goalCodes.has(normalizeCode(course.code))) goalDone += 1;
      if (status.status === 'passed' && status.grade && GRADE_POINTS[status.grade] !== undefined) {
        gpaPoints += GRADE_POINTS[status.grade] * cr;
        gpaCredits += cr;
      }
    } else if (status.status === 'in-progress') {
      inProgressCredits += cr;
    } else {
      remainingCredits += cr;
    }
  });

  return {
    totalRequired,
    plannedCredits,
    earnedCredits,
    inProgressCredits,
    remainingCredits,
    transferCredits,
    genEdCredits,
    majorCredits: Math.max(0, plannedCredits - genEdCredits),
    goalDone,
    goalTotal: goalCodes.size,
    gpa: gpaCredits ? (gpaPoints / gpaCredits).toFixed(2) : 'not calculated',
  };
}

function scheduleAdvisorReviewLabel(courses, selectedItems, conflicts, warnings) {
  if (conflicts.length) return 'Needs conflict review';
  if (selectedItems.length < courses.length) return 'Needs section choices';
  if (warnings.length) return 'Ready with warnings';
  return 'Ready for advisor review';
}

function scheduleCatalogYearWarning() {
  return typeof catalogYearAdvisingWarning === 'function' ? catalogYearAdvisingWarning() : null;
}

function scheduleAdvisorCatalogYearHtml() {
  const warning = scheduleCatalogYearWarning();
  if (!warning) return '';
  return `
    <section class="schedule-advisor-catalog-warning">
      <strong>${scheduleEscape(warning.title)}</strong>
      <p>${scheduleEscape(warning.body)}</p>
      <span>${scheduleEscape(warning.meta)}</span>
    </section>
  `;
}

function scheduleAdvisorCatalogYearText() {
  const warning = scheduleCatalogYearWarning();
  if (!warning) return [];
  return [
    '',
    'Catalog-year verification:',
    `- ${warning.title}`,
    `  ${warning.body}`,
    `  ${warning.meta}`,
  ];
}

function scheduleAdvisorSelectedSectionMap(semId, selectedItems) {
  const map = {};
  selectedItems.forEach(item => { map[`${semId}:${normalizeCode(item.course.code)}`] = item.section; });
  return map;
}

function scheduleAdvisorFilterContext(currentSemId, selectedItems, conflicts, warnings, unscheduled, filter) {
  const conflictCodes = new Set();
  (conflicts || []).forEach(conflict => {
    if (conflict.a?.code) conflictCodes.add(normalizeCode(conflict.a.code));
    if (conflict.b?.code) conflictCodes.add(normalizeCode(conflict.b.code));
  });
  return {
    filter: normalizeScheduleAdvisorFilter(filter),
    currentSemId,
    currentSemName: getAllSemesters().find(sem => sem.id === currentSemId)?.name || '',
    selectedMap: scheduleAdvisorSelectedSectionMap(currentSemId, selectedItems || []),
    conflictCodes,
    warningCodes: scheduleAdvisorWarningCodes(warnings),
    unscheduledCodes: new Set((unscheduled || []).map(course => normalizeCode(course.code))),
  };
}

function scheduleAdvisorCourseFilter(course, semId, context) {
  const filter = normalizeScheduleAdvisorFilter(context?.filter);
  const key = normalizeCode(course.code);
  const status = getCourseState(course.code).status;
  const pre = prereqsMet(course);
  const remaining = scheduleAdvisorCourseIsRemaining(course);
  const reasons = [];
  if (semId === context.currentSemId && context.unscheduledCodes.has(key)) {
    reasons.push(`Needs ${context.currentSemName || 'current term'} section`);
  }
  if (context.conflictCodes.has(key)) reasons.push('Time conflict');
  if (context.warningCodes.has(key)) reasons.push('Schedule warning');
  if (remaining && !pre.met) reasons.push(`Missing ${pre.missing || 'prereq needed'}`);
  if (status === 'failed') reasons.push('Needs repeat');

  if (filter === 'remaining') return { include: remaining, reasons };
  if (filter === 'gened') return { include: scheduleCourseIsGenEd(course), reasons };
  if (filter === 'blockers') return { include: reasons.length > 0, reasons };
  return { include: true, reasons };
}

function scheduleAdvisorPlanHtml(currentSemId, selectedItems, context) {
  const selectedMap = scheduleAdvisorSelectedSectionMap(currentSemId, selectedItems);
  const ctx = {
    ...scheduleAdvisorFilterContext(currentSemId, selectedItems, [], [], [], 'all'),
    ...(context || {}),
    selectedMap,
    filter: normalizeScheduleAdvisorFilter(context?.filter),
  };
  let totalCourses = 0;
  let shownCourses = 0;
  let totalCredits = 0;
  let shownCredits = 0;
  const semesterHtml = getAllSemesters().map(sem => {
    const courses = [
      ...(sem.courses || []),
      ...(state.customCourses || []).filter(course => course.semId === sem.id),
    ];
    const credits = courses.reduce((sum, course) => sum + (Number(course.cr) || 0), 0);
    totalCourses += courses.length;
    totalCredits += credits;
    let visibleCredits = 0;
    const rows = courses.map(course => {
      const filterResult = scheduleAdvisorCourseFilter(course, sem.id, ctx);
      if (!filterResult.include) return '';
      const cr = Number(course.cr) || 0;
      visibleCredits += cr;
      shownCourses += 1;
      shownCredits += cr;
      const key = `${sem.id}:${normalizeCode(course.code)}`;
      const section = selectedMap[key] || getSelectedSection(sem.id, course.code);
      const sectionLine = section ? `<span>${scheduleEscape(section.number || section.section_id || 'Section')} - ${scheduleEscape(scheduleSectionMeetingLines(section).join(' / '))}</span>` : '';
      const eligibility = section ? sectionEligibilityStatus(section) : null;
      const eligibilityLine = eligibility?.notes?.length ? `<em>Eligibility: ${scheduleEscape(eligibility.detail)}</em>` : '';
      const note = course.note ? `<em>${scheduleEscape(course.note)}</em>` : '';
      const reasonLine = filterResult.reasons.length ? `<em>${scheduleEscape(filterResult.reasons.join(' · '))}</em>` : '';
      return `
        <li class="schedule-advisor-course">
          <div>
            <strong>${scheduleEscape(course.code)}</strong>
            <span>${scheduleEscape(course.title || '')}</span>
            ${sectionLine}
            ${eligibilityLine}
            ${note}
            ${reasonLine}
          </div>
          <div>
            <span>${cr} cr</span>
            <span>${scheduleEscape(scheduleAdvisorCourseType(course))}</span>
            <span>${scheduleEscape(scheduleAdvisorCourseStatus(course))}</span>
          </div>
        </li>
      `;
    }).join('');
    if (ctx.filter !== 'all' && !rows.trim()) return '';
    const creditLine = ctx.filter === 'all' ? `${credits} cr` : `${visibleCredits} of ${credits} cr`;
    return `
      <section class="schedule-advisor-semester">
        <div class="schedule-advisor-semester-head">
          <strong>${scheduleEscape(sem.name)}</strong>
          <span>${scheduleEscape(creditLine)}</span>
        </div>
        <ul>${rows || '<li class="schedule-advisor-course"><div><span>No courses planned.</span></div></li>'}</ul>
      </section>
    `;
  }).join('');
  const filterDef = scheduleAdvisorFilterDef(ctx.filter);
  const html = semesterHtml.trim() || `<div class="schedule-output-empty">No courses match the ${scheduleEscape(filterDef.label)} advisor view.</div>`;
  return { html, totalCourses, shownCourses, totalCredits, shownCredits };
}

function scheduleAdvisorText(sem, term, courses, selectedItems, conflicts, warnings, prefs, scheduleText, advisorFilter = getScheduleAdvisorFilter(), unscheduled = [], options = getScheduleOutputOptions(), backupRows = [], appointment = null, freshness = null, readinessRows = [], calendarSummary = null, finalChecklist = null, workloadBalance = null, waitlistStrategy = null) {
  const stats = scheduleAdvisorStats();
  const filter = normalizeScheduleAdvisorFilter(advisorFilter);
  const filterDef = scheduleAdvisorFilterDef(filter);
  const outputOptions = normalizeScheduleOutputOptions(options);
  const auditIssues = outputOptions.auditIssues ? scheduleAdvisorAuditIssues(6) : [];
  const timing = scheduleTimingFit(selectedItems, prefs, conflicts);
  const readiness = scheduleRegistrationReadiness(courses, selectedItems, conflicts, warnings, prefs, unscheduled, sem?.id || '');
  const registrationOrder = scheduleRegistrationOrder(sem?.id || '', selectedItems, conflicts, courses);
  const registrationHandoff = scheduleRegistrationHandoff(registrationOrder, backupRows);
  const waitlists = waitlistStrategy || scheduleWaitlistStrategy(selectedItems, backupRows);
  const checklist = finalChecklist || scheduleFinalRegistrationChecklist(readiness, appointment || scheduleRegistrationAppointment(prefs, readiness, backupRows), freshness, backupRows, registrationHandoff, calendarSummary, waitlists);
  const workload = workloadBalance || scheduleWorkloadBalance(courses, selectedItems, prefs, timing);
  const context = scheduleAdvisorFilterContext(
    sem?.id || '',
    selectedItems,
    conflicts,
    outputOptions.warnings ? warnings : [],
    outputOptions.unscheduled ? unscheduled : [],
    filter
  );
  const lines = [
    scheduleText,
    '',
    'Advisor packet',
    `Program: ${getSettings().programName || 'UMD degree plan'}`,
    `Catalog year: ${getSettings().catalogYear || 'Not set'}`,
    `Plan term: ${sem?.name || 'Selected semester'} / ${scheduleTermLabel(term)}`,
    `Advisor view: ${filterDef.label} - ${filterDef.description}`,
    `Review status: ${scheduleAdvisorReviewLabel(courses, selectedItems, conflicts, warnings)}`,
    `Credits: ${stats.earnedCredits} earned / ${stats.plannedCredits} planned / ${stats.totalRequired} required`,
    `GPA: ${stats.gpa}`,
    `Goal courses: ${stats.goalDone}/${stats.goalTotal}`,
  ];
  if (outputOptions.preferences) lines.push(`Preferences: ${schedulePreferenceSummary(prefs)}`);
  lines.push('', ...scheduleAdvisorTimingDiagnosticsText(timing));
  lines.push(...scheduleWorkloadText(workload));
  lines.push(...scheduleRegistrationReadinessText(readiness));
  lines.push(...scheduleFinalChecklistText(checklist));
  lines.push(...scheduleRegistrationAppointmentText(appointment || scheduleRegistrationAppointment(prefs, readiness, backupRows)));
  lines.push(...scheduleSeatFreshnessText(freshness));
  lines.push(...scheduleWaitlistStrategyText(waitlists));
  lines.push(...scheduleCalendarExportText(calendarSummary));
  lines.push(...scheduleRegistrationHandoffText(registrationHandoff));
  lines.push(...scheduleRegistrationOrderText(registrationOrder));
  lines.push(...scheduleRegistrationBackupText(backupRows));
  lines.push(...scheduleAdvisorReadinessMapText(readinessRows));
  lines.push(...scheduleAdvisorCatalogYearText());
  if (outputOptions.auditIssues) lines.push(...scheduleAdvisorAuditSummaryText(auditIssues));
  if (outputOptions.auditIssues && auditIssues.length) lines.push(...scheduleAdvisorLiveLinkNoticeText());
  lines.push('', `${filterDef.heading}:`);

  getAllSemesters().forEach(planSem => {
    const semCourses = [
      ...(planSem.courses || []),
      ...(state.customCourses || []).filter(course => course.semId === planSem.id),
    ];
    const credits = semCourses.reduce((sum, course) => sum + (Number(course.cr) || 0), 0);
    const courseLines = [];
    lines.push(`${planSem.name} (${credits} cr)`);
    if (!semCourses.length) lines.push('- No courses planned.');
    semCourses.forEach(course => {
      const filterResult = scheduleAdvisorCourseFilter(course, planSem.id, context);
      if (!filterResult.include) return;
      const status = scheduleAdvisorCourseStatus(course);
      const section = planSem.id === sem?.id
        ? selectedItems.find(item => normalizeCode(item.course.code) === normalizeCode(course.code))?.section
        : getSelectedSection(planSem.id, course.code);
      const sectionText = section ? `; section ${section.number || section.section_id || 'TBA'}; ${scheduleSectionMeetingLines(section).join(' / ')}` : '';
      const eligibility = section ? sectionEligibilityStatus(section) : null;
      const eligibilityText = eligibility?.notes?.length ? `; eligibility: ${eligibility.detail}` : '';
      const reasonText = filterResult.reasons.length ? `; review: ${filterResult.reasons.join(' / ')}` : '';
      courseLines.push(`- ${course.code} ${course.title || ''} (${Number(course.cr) || 0} cr; ${scheduleAdvisorCourseType(course)}; ${status}${sectionText}${eligibilityText}${reasonText})`);
    });
    if (filter !== 'all' && semCourses.length && !courseLines.length) {
      lines.pop();
      return;
    }
    lines.push(...courseLines);
  });

  return lines.join('\n');
}

function scheduleStandaloneAdvisorCss() {
  return `
    body{font-family:Inter,Arial,sans-serif;margin:0;padding:28px;color:#241f1f;background:#fff}
    h1,h2,h3{font-family:Georgia,serif;margin:0}
    .schedule-output-panel{max-width:1100px;margin:0 auto}
    .schedule-print-sheet,.schedule-advisor-packet{border:1px solid #d8cec0;border-radius:10px;padding:18px;margin:0 0 18px;background:#fbf7ef}
    .schedule-print-head,.schedule-advisor-head,.schedule-advisor-semester-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}
    .schedule-print-meta,.schedule-advisor-metrics,.schedule-advisor-flags{display:flex;flex-wrap:wrap;gap:6px}
    .schedule-print-meta span,.schedule-advisor-metrics span,.schedule-advisor-flags span{border:1px solid #d8cec0;border-radius:999px;background:#fff;padding:3px 8px;font-size:12px}
    .schedule-print-prefs,.schedule-advisor-note{color:#5d5962;font-size:13px}
    .schedule-advisor-view-note,.schedule-advisor-catalog-warning,.schedule-advisor-readiness-map{border:1px solid #d8cec0;border-radius:8px;background:#fff;padding:9px 10px;color:#5d5962;font-size:12px;margin:10px 0}
    .schedule-advisor-catalog-warning{border-color:#f1c45c;background:#fff7dc;color:#241f1f}
    .schedule-advisor-catalog-warning strong{display:block;color:#8b0000}
    .schedule-advisor-catalog-warning p{margin:4px 0;color:#5d5962;line-height:1.4}
    .schedule-advisor-catalog-warning span{display:block;color:#5d5962;font-size:11px}
    .schedule-advisor-live-note{border:1px solid #9fb4c8;border-radius:8px;background:#eef4fa;padding:9px 10px;color:#241f1f;font-size:12px;margin:10px 0}
    .schedule-advisor-live-note strong{display:block;color:#2e5c8b;font-size:10px;letter-spacing:.06em;text-transform:uppercase}
    .schedule-advisor-live-note p{margin:3px 0 0;color:#5d5962;line-height:1.4}
    .schedule-advisor-import-link{display:inline-flex;margin-top:7px;border:1px solid #2e5c8b;border-radius:999px;background:#2e5c8b;color:#fff;font-size:11px;font-weight:700;padding:5px 9px;text-decoration:none}
    .schedule-advisor-readiness-map-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
    .schedule-advisor-readiness-map-head h4{margin:0;color:#241f1f}
    .schedule-advisor-readiness-map-head span{display:block;color:#5d5962;font-size:12px}
    .schedule-advisor-readiness-map-head strong{font-size:12px;text-transform:uppercase;color:#8b0000}
    .schedule-advisor-readiness-map-list{display:grid;grid-template-columns:repeat(2,1fr);gap:7px;border-top:1px solid #eee4d8;margin-top:8px;padding-top:8px}
    .schedule-advisor-readiness-row{border:1px solid #d8cec0;border-left:4px solid #7b8b55;border-radius:8px;background:#fbf7ef;padding:7px}
    .schedule-advisor-readiness-row.warn{border-left-color:#c99700;background:#fffaf0}
    .schedule-advisor-readiness-row.danger{border-left-color:#8b0000;background:#fff5f3}
    .schedule-advisor-readiness-row strong,.schedule-advisor-readiness-row b,.schedule-advisor-readiness-row span,.schedule-advisor-readiness-row em{display:block}
    .schedule-advisor-readiness-row strong,.schedule-advisor-readiness-row b{color:#241f1f}
    .schedule-advisor-readiness-row span,.schedule-advisor-readiness-row em{color:#5d5962;font-size:12px;font-style:normal;line-height:1.35}
    .schedule-advisor-diagnostics,.schedule-advisor-audit{border:1px solid #d8cec0;border-radius:8px;background:#fff;padding:10px;margin:10px 0}
    .schedule-advisor-diagnostics-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
    .schedule-advisor-diagnostics-head h4{margin:0}
    .schedule-advisor-diagnostics-head span,.schedule-advisor-diagnostic-list span,.schedule-advisor-diagnostic-metrics em{display:block;color:#5d5962;font-size:12px;font-style:normal}
    .schedule-advisor-diagnostics-head strong{font-size:12px;text-transform:uppercase}
    .schedule-advisor-diagnostic-metrics{display:grid;grid-template-columns:repeat(6,1fr);gap:6px;margin-top:8px}
    .schedule-advisor-diagnostic-metrics span{border:1px solid #d8cec0;border-radius:8px;background:#fbf7ef;padding:7px}
    .schedule-advisor-diagnostic-metrics strong{display:block;font-size:14px}
    .schedule-advisor-diagnostic-notes{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:8px}
    .schedule-advisor-diagnostic-list{border-top:1px solid #eee4d8;padding-top:7px;font-size:12px}
    .schedule-advisor-diagnostic-list strong{display:block;margin-bottom:4px}
    .schedule-workload-card{border:1px solid #d8cec0;border-left:4px solid #7b8b55;border-radius:8px;background:#fff;padding:10px;margin:10px 0}
    .schedule-workload-card.warn{border-left-color:#c99700;background:#fffaf0}
    .schedule-workload-card.danger{border-left-color:#8b0000;background:#fff5f3}
    .schedule-workload-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
    .schedule-workload-head h4{margin:0}
    .schedule-workload-head span,.schedule-workload-flags span,.schedule-workload-metrics em,.schedule-workload-days em{display:block;color:#5d5962;font-size:12px;line-height:1.35;font-style:normal}
    .schedule-workload-head strong{font-size:12px;text-transform:uppercase;white-space:nowrap}
    .schedule-workload-metrics,.schedule-workload-days{display:grid;gap:6px;margin-top:8px}
    .schedule-workload-metrics{grid-template-columns:repeat(4,1fr)}
    .schedule-workload-days{grid-template-columns:repeat(5,1fr)}
    .schedule-workload-metrics span,.schedule-workload-days span{border:1px solid #d8cec0;border-radius:7px;background:#fbf7ef;padding:7px}
    .schedule-workload-metrics strong,.schedule-workload-days strong{display:block;color:#241f1f;font-size:12px}
    .schedule-workload-flags{display:grid;gap:4px;border-top:1px solid #eee4d8;margin-top:8px;padding-top:8px}
    .schedule-advisor-audit-list{display:grid;gap:6px;margin-top:8px}
    .schedule-advisor-audit-row{display:grid;grid-template-columns:52px minmax(0,1fr);gap:8px;border-top:1px solid #eee4d8;padding-top:6px;font-size:12px}
    .schedule-advisor-audit-row:first-child{border-top:none;padding-top:0}
    .schedule-advisor-audit-row b{font-size:10px;text-transform:uppercase;color:#8b0000}
    .schedule-advisor-audit-row p{margin:2px 0;color:#5d5962}
    .schedule-advisor-audit-row span{display:block;color:#5d5962;font-size:11px}
    .schedule-advisor-audit-next{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-top:7px}
    .schedule-advisor-audit-next span{border:1px solid #d8cec0;border-radius:7px;background:#fbf7ef;padding:6px 7px}
    .schedule-advisor-audit-next strong{display:block;color:#8b0000;font-size:9px;text-transform:uppercase}
    .schedule-advisor-audit-actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:7px}
    .schedule-advisor-audit-link{display:inline-flex;align-items:center;border:1px solid #9fb4c8;border-radius:999px;background:#eef4fa;color:#2e5c8b;font-size:11px;font-weight:700;padding:4px 8px;text-decoration:none}
    .schedule-advisor-audit-link.primary{border-color:#2e5c8b;background:#2e5c8b;color:#fff}
    .schedule-readiness{border:1px solid #d8cec0;border-left:4px solid #7b8b55;border-radius:8px;background:#fff;padding:10px;margin:10px 0}
    .schedule-readiness.warn{border-left-color:#c99700;background:#fffaf0}
    .schedule-readiness.danger{border-left-color:#8b0000;background:#fff5f3}
    .schedule-readiness-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
    .schedule-readiness-head h4{margin:0}
    .schedule-readiness-head span,.schedule-readiness-gate span{display:block;color:#5d5962;font-size:12px;line-height:1.35}
    .schedule-readiness-head strong{font-size:12px;text-transform:uppercase;white-space:nowrap}
    .schedule-readiness-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:8px}
    .schedule-readiness-gate{border:1px solid #d8cec0;border-radius:8px;background:#fbf7ef;padding:7px}
    .schedule-readiness-gate b{display:block;color:#5d5962;font-size:10px;text-transform:uppercase}
    .schedule-readiness-gate strong{display:block;font-size:14px;margin:2px 0}
    .schedule-readiness-gate.ok strong{color:#2f6f4e}
    .schedule-readiness-gate.warn strong{color:#8a6300}
    .schedule-readiness-gate.danger strong{color:#8b0000}
    .schedule-readiness-fixes{display:grid;gap:4px;border-top:1px solid #eee4d8;margin-top:8px;padding-top:8px;font-size:12px}
    .schedule-readiness-fixes strong{font-size:10px;text-transform:uppercase;color:#8b0000}
    .schedule-readiness-fixes span{display:block;color:#5d5962;line-height:1.35}
    .schedule-readiness-actions{display:flex;justify-content:space-between;align-items:center;gap:8px;border-top:1px solid #eee4d8;margin-top:8px;padding-top:8px}
    .schedule-readiness-actions strong{font-size:10px;text-transform:uppercase;color:#8b0000}
    .schedule-readiness-actions div{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:6px}
    .schedule-readiness-actions .btn{border:1px solid #d8cec0;border-radius:999px;background:#fff;color:#2e5c8b;font-size:11px;font-weight:700;padding:5px 8px}
    .schedule-readiness-actions .btn.primary{border-color:#8b0000;background:#8b0000;color:#fff}
    .schedule-registration-appointment{border:1px solid #d8cec0;border-left:4px solid #7b8b55;border-radius:8px;background:#fff;padding:10px;margin:10px 0}
    .schedule-registration-appointment.warn{border-left-color:#c99700;background:#fffaf0}
    .schedule-registration-appointment.danger{border-left-color:#8b0000;background:#fff5f3}
    .schedule-registration-appointment-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
    .schedule-registration-appointment-head h4{margin:0}
    .schedule-registration-appointment-head span,.schedule-registration-appointment p,.schedule-registration-appointment-list span{display:block;color:#5d5962;font-size:12px;line-height:1.35;margin:2px 0 0}
    .schedule-registration-appointment-head strong{font-size:12px;text-transform:uppercase;white-space:nowrap}
    .schedule-registration-appointment-list{display:grid;gap:4px;border-top:1px solid #eee4d8;margin-top:8px;padding-top:8px}
    .schedule-final-checklist{border:1px solid #d8cec0;border-left:4px solid #7b8b55;border-radius:8px;background:#fff;padding:10px;margin:10px 0}
    .schedule-final-checklist.warn{border-left-color:#c99700;background:#fffaf0}
    .schedule-final-checklist.danger{border-left-color:#8b0000;background:#fff5f3}
    .schedule-final-checklist-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
    .schedule-final-checklist-head h4{margin:0}
    .schedule-final-checklist-head span,.schedule-final-check span{display:block;color:#5d5962;font-size:12px;line-height:1.35}
    .schedule-final-checklist-head strong{font-size:12px;text-transform:uppercase;white-space:nowrap}
    .schedule-final-checklist-score{display:flex;align-items:baseline;gap:6px;border-top:1px solid #eee4d8;margin-top:8px;padding-top:8px}
    .schedule-final-checklist-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-top:8px}
    .schedule-final-check{border:1px solid #d8cec0;border-radius:7px;background:#fbf7ef;padding:7px}
    .schedule-final-check.ok{border-left:4px solid #7b8b55}
    .schedule-final-check.warn{border-left:4px solid #c99700}
    .schedule-final-check.danger{border-left:4px solid #8b0000}
    .schedule-final-check b{display:block;color:#241f1f;font-size:12px;margin-bottom:3px}
    .schedule-seat-freshness{border:1px solid #d8cec0;border-left:4px solid #7b8b55;border-radius:8px;background:#fff;padding:10px;margin:10px 0}
    .schedule-seat-freshness.warn{border-left-color:#c99700;background:#fffaf0}
    .schedule-seat-freshness.danger{border-left-color:#8b0000;background:#fff5f3}
    .schedule-seat-freshness-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
    .schedule-seat-freshness-head h4{margin:0}
    .schedule-seat-freshness-head span,.schedule-seat-freshness p{display:block;color:#5d5962;font-size:12px;line-height:1.35;margin:2px 0 0}
    .schedule-seat-freshness-head strong{font-size:12px;text-transform:uppercase;white-space:nowrap}
    .schedule-seat-freshness-list{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;border-top:1px solid #eee4d8;margin-top:8px;padding-top:8px}
    .schedule-seat-freshness-row{border:1px solid #d8cec0;border-radius:7px;background:#fbf7ef;padding:7px}
    .schedule-seat-freshness-row.danger{border-color:#f0b4a9;background:#fff5f3}
    .schedule-seat-freshness-row.warn{border-color:#f1c45c;background:#fffaf0}
    .schedule-seat-freshness-row strong,.schedule-seat-freshness-row span,.schedule-seat-freshness-row em{display:block}
    .schedule-seat-freshness-row span,.schedule-seat-freshness-row em{color:#5d5962;font-size:12px;font-style:normal;line-height:1.35}
    .schedule-seat-freshness-actions{display:flex;justify-content:space-between;align-items:center;gap:8px;border-top:1px solid #eee4d8;margin-top:8px;padding-top:8px}
    .schedule-seat-freshness-actions strong{font-size:10px;text-transform:uppercase;color:#8b0000}
    .schedule-seat-freshness-actions .btn{border:1px solid #d8cec0;border-radius:999px;background:#fff;color:#2e5c8b;font-size:11px;font-weight:700;padding:5px 8px}
    .schedule-seat-freshness-actions .btn.primary{border-color:#8b0000;background:#8b0000;color:#fff}
    .schedule-waitlist-strategy{border:1px solid #d8cec0;border-left:4px solid #7b8b55;border-radius:8px;background:#fff;padding:10px;margin:10px 0}
    .schedule-waitlist-strategy.warn{border-left-color:#c99700;background:#fffaf0}
    .schedule-waitlist-strategy.danger{border-left-color:#8b0000;background:#fff5f3}
    .schedule-waitlist-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
    .schedule-waitlist-head h4{margin:0}
    .schedule-waitlist-head span,.schedule-waitlist-strategy p{display:block;color:#5d5962;font-size:12px;line-height:1.35;margin:2px 0 0}
    .schedule-waitlist-head strong{font-size:12px;text-transform:uppercase;white-space:nowrap}
    .schedule-waitlist-list{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;border-top:1px solid #eee4d8;margin-top:8px;padding-top:8px}
    .schedule-waitlist-row{border:1px solid #d8cec0;border-radius:7px;background:#fbf7ef;padding:7px}
    .schedule-waitlist-row.danger{border-color:#f0b4a9;background:#fff5f3}
    .schedule-waitlist-row.warn{border-color:#f1c45c;background:#fffaf0}
    .schedule-waitlist-row strong,.schedule-waitlist-row span,.schedule-waitlist-row em{display:block}
    .schedule-waitlist-row span,.schedule-waitlist-row em{color:#5d5962;font-size:12px;font-style:normal;line-height:1.35}
    .schedule-calendar-export{border:1px solid #d8cec0;border-left:4px solid #7b8b55;border-radius:8px;background:#fff;padding:10px;margin:10px 0}
    .schedule-calendar-export.warn{border-left-color:#c99700;background:#fffaf0}
    .schedule-calendar-export.danger{border-left-color:#8b0000;background:#fff5f3}
    .schedule-calendar-export-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
    .schedule-calendar-export-head h4{margin:0}
    .schedule-calendar-export-head span,.schedule-calendar-export p,.schedule-calendar-export-row span,.schedule-calendar-export-row em,.schedule-calendar-export-metrics em{display:block;color:#5d5962;font-size:12px;line-height:1.35;margin:2px 0 0}
    .schedule-calendar-export-head strong{font-size:12px;text-transform:uppercase;white-space:nowrap}
    .schedule-calendar-export-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:8px}
    .schedule-calendar-export-metrics span{border:1px solid #d8cec0;border-radius:8px;background:#fbf7ef;padding:7px}
    .schedule-calendar-export-metrics strong{display:block;font-size:14px}
    .schedule-calendar-export-list{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;border-top:1px solid #eee4d8;margin-top:8px;padding-top:8px}
    .schedule-calendar-export-row{border:1px solid #d8cec0;border-radius:7px;background:#fbf7ef;padding:7px}
    .schedule-calendar-export-row.warn{border-color:#f1c45c;background:#fffaf0}
    .schedule-calendar-export-row.danger{border-color:#f0b4a9;background:#fff5f3}
    .schedule-calendar-export-row strong{display:block;color:#241f1f}
    .schedule-calendar-export-actions{display:flex;justify-content:space-between;align-items:center;gap:8px;border-top:1px solid #eee4d8;margin-top:8px;padding-top:8px}
    .schedule-calendar-export-actions strong{font-size:10px;text-transform:uppercase;color:#8b0000}
    .schedule-calendar-export-actions div{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:6px}
    .schedule-calendar-export-actions .btn{border:1px solid #d8cec0;border-radius:999px;background:#fff;color:#2e5c8b;font-size:11px;font-weight:700;padding:5px 8px}
    .schedule-calendar-export-actions .btn.primary{border-color:#8b0000;background:#8b0000;color:#fff}
    .schedule-registration-handoff{border:1px solid #d8cec0;border-radius:8px;background:#fff;padding:10px;margin:10px 0}
    .schedule-registration-handoff-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
    .schedule-registration-handoff-head h4{margin:0}
    .schedule-registration-handoff-head span,.schedule-registration-handoff p{display:block;color:#5d5962;font-size:12px;line-height:1.35;margin:2px 0 0}
    .schedule-registration-handoff-head strong{font-size:12px;text-transform:uppercase;white-space:nowrap}
    .schedule-registration-handoff-list{display:grid;gap:6px;margin:8px 0 0;padding:0;list-style:none}
    .schedule-registration-handoff-list li{display:grid;grid-template-columns:28px minmax(0,1fr);gap:8px;border-top:1px solid #eee4d8;padding-top:6px}
    .schedule-registration-handoff-list li:first-child{border-top:none;padding-top:0}
    .schedule-registration-handoff-list b{display:grid;place-items:center;width:24px;height:24px;border-radius:999px;background:#2e5c8b;color:#fff;font-size:12px}
    .schedule-registration-handoff-list li.blocked b{background:#8b0000}
    .schedule-registration-handoff-list li.review b{background:#c99700;color:#241f1f}
    .schedule-registration-handoff-list strong,.schedule-registration-handoff-list code,.schedule-registration-handoff-list span,.schedule-registration-handoff-list em{display:block}
    .schedule-registration-handoff-list code{font-family:Menlo,Consolas,monospace;color:#241f1f;font-size:12px;overflow-wrap:anywhere}
    .schedule-registration-handoff-list span,.schedule-registration-handoff-list em{color:#5d5962;font-size:12px;font-style:normal;line-height:1.35}
    .schedule-registration-order{border:1px solid #d8cec0;border-radius:8px;background:#fff;padding:10px;margin:10px 0}
    .schedule-registration-order-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
    .schedule-registration-order-head h4{margin:0}
    .schedule-registration-order-head span,.schedule-registration-order p{display:block;color:#5d5962;font-size:12px;line-height:1.35;margin:2px 0 0}
    .schedule-registration-order-head strong{font-size:12px;text-transform:uppercase;white-space:nowrap}
    .schedule-registration-order-list{display:grid;gap:6px;margin:8px 0 0;padding:0;list-style:none}
    .schedule-registration-order-list li{display:grid;grid-template-columns:28px minmax(0,1fr);gap:8px;border-top:1px solid #eee4d8;padding-top:6px}
    .schedule-registration-order-list li:first-child{border-top:none;padding-top:0}
    .schedule-registration-order-list b{display:grid;place-items:center;width:24px;height:24px;border-radius:999px;background:#8b0000;color:#fff;font-size:12px}
    .schedule-registration-order-list strong,.schedule-registration-order-list span,.schedule-registration-order-list em{display:block}
    .schedule-registration-order-list span,.schedule-registration-order-list em{color:#5d5962;font-size:12px;font-style:normal;line-height:1.35}
    .schedule-registration-backups{border:1px solid #d8cec0;border-radius:8px;background:#fff;padding:10px;margin:10px 0}
    .schedule-registration-backups-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
    .schedule-registration-backups-head h4{margin:0}
    .schedule-registration-backups-head span,.schedule-registration-backups p{display:block;color:#5d5962;font-size:12px;line-height:1.35;margin:2px 0 0}
    .schedule-registration-backups-head strong{font-size:12px;text-transform:uppercase;white-space:nowrap}
    .schedule-registration-backup-actions{display:flex;flex-wrap:wrap;align-items:center;gap:8px;border-top:1px solid #eee4d8;margin-top:8px;padding-top:8px}
    .schedule-registration-backup-actions span{color:#5d5962;font-size:12px;line-height:1.35}
    .schedule-registration-backup-actions .btn{border:1px solid #8b0000;border-radius:999px;background:#8b0000;color:#fff;font-size:11px;font-weight:700;padding:5px 8px}
    .schedule-registration-backup-list{display:grid;gap:6px;margin-top:8px}
    .schedule-registration-backup{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr);gap:8px;border-top:1px solid #eee4d8;padding-top:6px;font-size:12px}
    .schedule-registration-backup:first-child{border-top:none;padding-top:0}
    .schedule-registration-backup strong,.schedule-registration-backup b,.schedule-registration-backup span,.schedule-registration-backup em{display:block}
    .schedule-registration-backup span,.schedule-registration-backup em{color:#5d5962;font-style:normal;line-height:1.35}
    .schedule-output-week{display:grid;grid-template-columns:repeat(5,1fr);gap:7px;margin:12px 0}
    .schedule-output-day-grid{position:relative;min-height:132px;border:1px solid #d8cec0;border-radius:8px;background:#fff;overflow:hidden}
    .schedule-output-block{position:absolute;left:5px;right:5px;border-radius:6px;border:1px solid rgba(0,0,0,.16);padding:3px 5px;overflow:hidden;color:#1f1f1f;background:#f4c65d;font-size:11px}
    .schedule-output-block.blocked{background:#d7e2ed;color:#2e5c8b}
    .schedule-change-digest{border-top:1px solid #d8cec0;margin-top:12px;padding-top:10px}
    .schedule-change-head{display:flex;justify-content:space-between;gap:10px;align-items:baseline}
    .schedule-change-head span{color:#5d5962;font-size:12px}
    .schedule-change-list{display:grid;gap:6px;margin-top:8px}
    .schedule-change-row{display:grid;grid-template-columns:44px minmax(0,1fr);gap:8px;border-top:1px solid #eee4d8;padding-top:6px;font-size:12px}
    .schedule-change-row:first-child{border-top:none;padding-top:0}
    .schedule-change-row b{font-size:10px;text-transform:uppercase;color:#8b0000}
    .schedule-change-row p{margin:2px 0;color:#5d5962}
    .schedule-change-highlights{display:grid;gap:2px;margin:4px 0;padding-left:17px;color:#5d5962;line-height:1.35}
    .schedule-change-row span{color:#5d5962;font-size:11px}
    table{width:100%;border-collapse:collapse;font-size:13px}
    th,td{border-top:1px solid #d8cec0;padding:8px 6px;text-align:left;vertical-align:top}
    th{font-size:11px;text-transform:uppercase;color:#5d5962}
    .schedule-advisor-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin:14px 0}
    .schedule-advisor-stat{border:1px solid #d8cec0;border-radius:8px;background:#fff;padding:10px}
    .schedule-advisor-stat strong{display:block;font-size:18px}
    .schedule-advisor-section-title{display:flex;justify-content:space-between;gap:12px;align-items:baseline;margin:13px 0 8px}
    .schedule-advisor-section-title h4{margin:0}
    .schedule-advisor-section-title span{color:#5d5962;font-size:12px}
    .schedule-advisor-semesters{display:grid;gap:10px;margin-top:12px}
    .schedule-advisor-semester{border:1px solid #d8cec0;border-radius:8px;background:#fff;padding:10px;break-inside:avoid}
    .schedule-advisor-semester ul{list-style:none;margin:8px 0 0;padding:0;display:grid;gap:6px}
    .schedule-advisor-course{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;border-top:1px solid #eee4d8;padding-top:6px;font-size:12px}
    .schedule-advisor-course span,.schedule-advisor-course em{display:block;color:#5d5962;font-style:normal}
    .schedule-output-list{border-top:1px solid #d8cec0;margin-top:10px;padding-top:8px;display:grid;gap:4px;font-size:12px}
    @media (max-width:720px){.schedule-advisor-grid,.schedule-advisor-diagnostic-metrics,.schedule-readiness-grid,.schedule-calendar-export-metrics,.schedule-workload-metrics{grid-template-columns:repeat(2,1fr)}.schedule-advisor-readiness-map-list,.schedule-seat-freshness-list,.schedule-waitlist-list,.schedule-calendar-export-list,.schedule-final-checklist-grid,.schedule-workload-days{grid-template-columns:1fr}.schedule-readiness-actions,.schedule-seat-freshness-actions{align-items:flex-start;flex-direction:column}.schedule-readiness-actions div{justify-content:flex-start}.schedule-registration-appointment-head,.schedule-final-checklist-head,.schedule-workload-head,.schedule-seat-freshness-head,.schedule-waitlist-head,.schedule-calendar-export-head,.schedule-registration-handoff-head,.schedule-registration-order-head,.schedule-registration-backups-head,.schedule-advisor-readiness-map-head{flex-direction:column}.schedule-registration-handoff-list li,.schedule-registration-backup{grid-template-columns:1fr}.schedule-advisor-diagnostic-notes{grid-template-columns:1fr}.schedule-advisor-audit-row{grid-template-columns:1fr;gap:3px}}
    @media print{body{padding:0}.schedule-output-panel{max-width:none}.schedule-print-sheet,.schedule-advisor-packet{border:none;padding:0}.schedule-print-sheet{break-after:page}.schedule-readiness-actions,.schedule-calendar-export-actions{display:none}}
  `;
}

function scheduleAdvisorPacketHtml(sem, term, courses, selectedItems, conflicts, warnings, prefs, unscheduled, totalOpenSeats, advisorFilter = getScheduleAdvisorFilter(), changes = scheduleRecentChanges(), options = getScheduleOutputOptions(), backupRows = [], appointment = null, freshness = null, readinessRows = [], calendarSummary = null, finalChecklist = null, workloadBalance = null, waitlistStrategy = null) {
  const stats = scheduleAdvisorStats();
  const label = scheduleAdvisorReviewLabel(courses, selectedItems, conflicts, warnings);
  const filter = normalizeScheduleAdvisorFilter(advisorFilter);
  const filterDef = scheduleAdvisorFilterDef(filter);
  const outputOptions = normalizeScheduleOutputOptions(options);
  const visibleWarnings = outputOptions.warnings ? warnings : [];
  const visibleUnscheduled = outputOptions.unscheduled ? unscheduled : [];
  const visibleChanges = outputOptions.recentChanges ? changes : [];
  const auditIssues = outputOptions.auditIssues ? scheduleAdvisorAuditIssues(6) : [];
  const auditCounts = scheduleAuditIssueCounts(auditIssues);
  const filterContext = scheduleAdvisorFilterContext(sem?.id || '', selectedItems, conflicts, visibleWarnings, visibleUnscheduled, filter);
  const plan = scheduleAdvisorPlanHtml(sem?.id || '', selectedItems, filterContext);
  const generated = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  const timing = scheduleTimingFit(selectedItems, prefs, conflicts);
  const readiness = scheduleRegistrationReadiness(courses, selectedItems, conflicts, warnings, prefs, unscheduled, sem?.id || '');
  const registrationOrder = scheduleRegistrationOrder(sem?.id || '', selectedItems, conflicts, courses);
  const registrationAppointment = appointment || scheduleRegistrationAppointment(prefs, readiness, backupRows);
  const registrationHandoff = scheduleRegistrationHandoff(registrationOrder, backupRows);
  const waitlists = waitlistStrategy || scheduleWaitlistStrategy(selectedItems, backupRows);
  const checklist = finalChecklist || scheduleFinalRegistrationChecklist(readiness, registrationAppointment, freshness, backupRows, registrationHandoff, calendarSummary, waitlists);
  const workload = workloadBalance || scheduleWorkloadBalance(courses, selectedItems, prefs, timing);
  return `
    <article class="schedule-advisor-packet" id="schedule-advisor-packet">
      <div class="schedule-advisor-head">
        <div>
          <h3>Advisor Packet</h3>
          <span>${scheduleEscape(getSettings().programName || 'UMD degree plan')} - generated ${scheduleEscape(generated)}</span>
        </div>
        <div class="schedule-advisor-flags">
          <span>${scheduleEscape(label)}</span>
          <span>${scheduleEscape(readiness.label)}</span>
          <span>${scheduleEscape(`Catalog ${getSettings().catalogYear || 'not set'}`)}</span>
          <span>${scheduleEscape(sem?.name || 'Selected semester')}</span>
          <span>${scheduleEscape(scheduleTermLabel(term))}</span>
          <span>${scheduleEscape(filterDef.label)} view</span>
        </div>
      </div>
      <div class="schedule-advisor-grid">
        <div class="schedule-advisor-stat"><span>Credits</span><strong>${stats.earnedCredits}/${stats.totalRequired}</strong><em>${stats.plannedCredits} planned</em></div>
        <div class="schedule-advisor-stat"><span>Current term</span><strong>${selectedItems.length}/${courses.length}</strong><em>sections picked</em></div>
        <div class="schedule-advisor-stat"><span>Conflicts</span><strong>${conflicts.length}</strong><em>${warnings.length} warning${warnings.length === 1 ? '' : 's'}</em></div>
        <div class="schedule-advisor-stat"><span>Timing fit</span><strong>${timing.score}/100</strong><em>${scheduleEscape(timing.label)}</em></div>
        <div class="schedule-advisor-stat"><span>Audit issues</span><strong>${outputOptions.auditIssues ? auditCounts.total : 'off'}</strong><em>${outputOptions.auditIssues ? `${auditCounts.placeholder || 0} slots · ${auditCounts.gened || 0} GenEd` : 'hidden'}</em></div>
      </div>
      ${outputOptions.preferences ? `<p class="schedule-advisor-note">${scheduleEscape(schedulePreferenceSummary(prefs))}</p>` : ''}
      <div class="schedule-advisor-metrics">
        <span>${stats.inProgressCredits} in-progress credits</span>
        <span>Catalog ${scheduleEscape(getSettings().catalogYear || 'not set')}</span>
        <span>${stats.remainingCredits} remaining planned credits</span>
        <span>${stats.genEdCredits} GenEd credits in plan</span>
        <span>${stats.goalDone}/${stats.goalTotal} goal courses complete</span>
        <span>GPA ${scheduleEscape(stats.gpa)}</span>
        <span>${totalOpenSeats} open seats in picked sections</span>
        <span>${plan.shownCourses}/${plan.totalCourses} courses shown</span>
        <span>${plan.shownCredits}/${plan.totalCredits} credits shown</span>
        ${outputOptions.unscheduled ? (unscheduled.length ? `<span>${unscheduled.length} unscheduled course${unscheduled.length === 1 ? '' : 's'}</span>` : '<span>All current-term courses scheduled</span>') : ''}
      </div>
      ${scheduleRegistrationReadinessHtml(readiness)}
      ${renderScheduleFinalChecklistHtml(checklist)}
      ${renderScheduleWorkloadHtml(workload)}
      ${scheduleAdvisorReadinessMapHtml(readinessRows)}
      ${renderScheduleRegistrationAppointmentHtml(registrationAppointment)}
      ${renderScheduleSeatFreshnessHtml(freshness)}
      ${renderScheduleWaitlistStrategyHtml(waitlists)}
      ${renderScheduleCalendarExportHtml(calendarSummary)}
      ${renderScheduleRegistrationHandoffHtml(registrationHandoff)}
      ${renderScheduleRegistrationOrderHtml(registrationOrder)}
      ${renderScheduleRegistrationBackupsHtml(backupRows)}
      ${scheduleAdvisorCatalogYearHtml()}
      ${outputOptions.unscheduled && unscheduled.length ? `<div class="schedule-output-list warn"><strong>Advisor follow-up</strong>${unscheduled.map(course => `<span>${scheduleEscape(course.code)} needs a section choice for ${scheduleEscape(sem?.name || 'this term')}.</span>`).join('')}</div>` : ''}
      ${outputOptions.warnings && warnings.length ? `<div class="schedule-output-list warn"><strong>Schedule warnings</strong>${warnings.slice(0, 12).map(warning => `<span>${scheduleEscape(warning)}</span>`).join('')}</div>` : ''}
      ${scheduleAdvisorTimingDiagnosticsHtml(timing)}
      ${outputOptions.auditIssues ? scheduleAdvisorAuditSummaryHtml(auditIssues) : ''}
      ${outputOptions.auditIssues && auditIssues.length ? scheduleAdvisorLiveLinkNoticeHtml() : ''}
      ${scheduleChangeDigestHtml(visibleChanges, 'Advisor context')}
      <p class="schedule-advisor-view-note"><strong>${scheduleEscape(filterDef.label)} view:</strong> ${scheduleEscape(filterDef.description)}</p>
      <div class="schedule-advisor-section-title">
        <h4>${scheduleEscape(filterDef.heading)}</h4>
        <span>${plan.shownCredits}/${plan.totalCredits} planned credits shown across ${getAllSemesters().length} terms</span>
      </div>
      <div class="schedule-advisor-semesters">
        ${plan.html}
      </div>
    </article>
  `;
}

function buildScheduleAdvisorDocument(title, scheduleHtml, advisorHtml) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${scheduleEscape(title)}</title>
<style>${scheduleStandaloneAdvisorCss()}</style>
</head>
<body>
<main class="schedule-output-panel">
${scheduleHtml}
${advisorHtml}
</main>
</body>
</html>`;
}

function buildScheduleOutputText(sem, term, courses, selectedItems, conflicts, warnings, prefs, changes = scheduleRecentChanges(), options = getScheduleOutputOptions(), backupRows = [], appointment = null, freshness = null, readinessRows = [], calendarSummary = null, finalChecklist = null, workloadBalance = null, waitlistStrategy = null) {
  const outputOptions = normalizeScheduleOutputOptions(options);
  const selectedCodes = new Set(selectedItems.map(item => normalizeCode(item.course.code)));
  const unscheduled = courses.filter(course => !selectedCodes.has(normalizeCode(course.code)));
  const timing = scheduleTimingFit(selectedItems, prefs, conflicts);
  const readiness = scheduleRegistrationReadiness(courses, selectedItems, conflicts, warnings, prefs, unscheduled, sem?.id || '');
  const registrationOrder = scheduleRegistrationOrder(sem?.id || '', selectedItems, conflicts, courses);
  const registrationAppointment = appointment || scheduleRegistrationAppointment(prefs, readiness, backupRows);
  const registrationHandoff = scheduleRegistrationHandoff(registrationOrder, backupRows);
  const waitlists = waitlistStrategy || scheduleWaitlistStrategy(selectedItems, backupRows);
  const checklist = finalChecklist || scheduleFinalRegistrationChecklist(readiness, registrationAppointment, freshness, backupRows, registrationHandoff, calendarSummary, waitlists);
  const workload = workloadBalance || scheduleWorkloadBalance(courses, selectedItems, prefs, timing);
  const lines = [
    `Terp Track Schedule`,
    `Plan semester: ${sem?.name || 'Selected semester'}`,
    `Posted UMD term: ${scheduleTermLabel(term)}`,
    `Sections picked: ${selectedItems.length}/${courses.length}`,
    `Conflicts: ${conflicts.length}`,
    `Warnings: ${warnings.length}`,
  ];
  if (outputOptions.preferences) lines.push(`Preferences: ${schedulePreferenceSummary(prefs)}`);
  lines.push(`Timing fit: ${timing.score}/100 - ${timing.label}`);
  timing.insights.slice(0, 3).forEach(insight => lines.push(`Timing note: ${insight}`));
  lines.push(...scheduleWorkloadText(workload));
  lines.push(...scheduleRegistrationReadinessText(readiness));
  lines.push(...scheduleFinalChecklistText(checklist));
  lines.push(...scheduleAdvisorReadinessMapText(readinessRows));
  lines.push(...scheduleRegistrationAppointmentText(registrationAppointment));
  lines.push(...scheduleSeatFreshnessText(freshness));
  lines.push(...scheduleWaitlistStrategyText(waitlists));
  lines.push(...scheduleCalendarExportText(calendarSummary));
  lines.push(...scheduleRegistrationHandoffText(registrationHandoff));
  lines.push(...scheduleRegistrationOrderText(registrationOrder));
  lines.push(...scheduleRegistrationBackupText(backupRows));
  lines.push('', 'Picked sections:');

  if (!selectedItems.length) lines.push('- No picked sections yet.');
  selectedItems
    .slice()
    .sort((a, b) => a.course.code.localeCompare(b.course.code))
    .forEach(item => {
      const risk = sectionSeatRisk(item.section);
      const prereq = scheduleCoursePrereqStatus(item.course, sem?.id || '');
      const coreq = scheduleCourseCoreqStatus(item.course, courses, selectedItems, sem?.id || '');
      const eligibility = sectionEligibilityStatus(item.section);
      lines.push(`- ${item.course.code} ${item.course.title || ''}`);
      lines.push(`  Section: ${item.section.number || item.section.section_id || 'TBA'}`);
      lines.push(`  Instructors: ${scheduleInstructorLine(item.section)}`);
      lines.push(`  Meetings: ${scheduleSectionMeetingLines(item.section).join('; ')}`);
      lines.push(`  Seats: ${risk.detail}`);
      if (prereq.level !== 'ok') lines.push(`  Prereqs: ${prereq.detail}`);
      if (coreq.level !== 'ok') lines.push(`  Coreqs: ${coreq.detail}`);
      if (eligibility.notes.length) lines.push(`  Eligibility: ${eligibility.detail}`);
    });

  if (outputOptions.unscheduled && unscheduled.length) {
    lines.push('', 'Unscheduled courses:');
    unscheduled.forEach(course => lines.push(`- ${course.code} ${course.title || ''}`));
  }

  if (outputOptions.warnings && warnings.length) {
    lines.push('', 'Schedule warnings:');
    warnings.slice(0, 12).forEach(warning => lines.push(`- ${warning}`));
    if (warnings.length > 12) lines.push(`- ${warnings.length - 12} more warning(s) in Terp Track.`);
  }

  if (outputOptions.recentChanges) lines.push(...scheduleRecentChangesText(changes));

  return lines.join('\n');
}

function buildScheduleRegistrationText(sem, term, courses, selectedItems, conflicts, warnings, prefs, unscheduledOverride = null, backupRows = [], appointment = null, freshness = null, readinessRows = [], calendarSummary = null, finalChecklist = null, workloadBalance = null, waitlistStrategy = null) {
  const courseList = Array.isArray(courses) ? courses : [];
  const selectedList = Array.isArray(selectedItems) ? selectedItems : [];
  const selectedCodes = new Set(selectedList.map(item => normalizeCode(item.course.code)));
  const unscheduled = Array.isArray(unscheduledOverride)
    ? unscheduledOverride
    : courseList.filter(course => !selectedCodes.has(normalizeCode(course.code)));
  const readiness = scheduleRegistrationReadiness(courseList, selectedList, conflicts, warnings, prefs, unscheduled, sem?.id || '');
  const registrationOrder = scheduleRegistrationOrder(sem?.id || '', selectedList, conflicts, courseList);
  const registrationAppointment = appointment || scheduleRegistrationAppointment(prefs, readiness, backupRows);
  const registrationHandoff = scheduleRegistrationHandoff(registrationOrder, backupRows);
  const waitlists = waitlistStrategy || scheduleWaitlistStrategy(selectedList, backupRows);
  const checklist = finalChecklist || scheduleFinalRegistrationChecklist(readiness, registrationAppointment, freshness, backupRows, registrationHandoff, calendarSummary, waitlists);
  const workload = workloadBalance || scheduleWorkloadBalance(courseList, selectedList, prefs, readiness.timing);
  const lines = [
    'Terp Track Registration List',
    'Use this as a Testudo checklist. Confirm every section, seat, restriction, prerequisite, and corequisite in Testudo before enrolling.',
    `Plan semester: ${sem?.name || 'Selected semester'}`,
    `Posted UMD term: ${scheduleTermLabel(term)} (${term || 'term code missing'})`,
    `Registration readiness: ${readiness.label} - ${readiness.detail}`,
    `Registration appointment: ${registrationAppointment.label} - ${registrationAppointment.when}`,
    '',
    'Picked sections:',
  ];

  if (!selectedList.length) lines.push('- No picked sections yet.');
  selectedList
    .slice()
    .sort((a, b) => a.course.code.localeCompare(b.course.code))
    .forEach(item => {
      const sectionLabel = item.section.number || item.section.section_id || 'TBA';
      const risk = sectionSeatRisk(item.section);
      const prereq = scheduleCoursePrereqStatus(item.course, sem?.id || '');
      const coreq = scheduleCourseCoreqStatus(item.course, courseList, selectedList, sem?.id || '');
      const eligibility = sectionEligibilityStatus(item.section);
      lines.push(`- ${item.course.code} | Section ${sectionLabel} | Section ID ${item.section.section_id || 'not posted'} | ${Number(item.course.cr) || 0} cr`);
      if (item.course.title) lines.push(`  Title: ${item.course.title}`);
      lines.push(`  Meetings: ${scheduleSectionMeetingLines(item.section).join('; ')}`);
      lines.push(`  Instructor: ${scheduleInstructorLine(item.section)}`);
      lines.push(`  Seats: ${risk.detail}`);
      if (prereq.level !== 'ok') lines.push(`  Prereqs: ${prereq.detail}`);
      if (coreq.level !== 'ok') lines.push(`  Coreqs: ${coreq.detail}`);
      if (eligibility.notes.length) lines.push(`  Eligibility: ${eligibility.detail}`);
    });

  lines.push(...scheduleRegistrationOrderText(registrationOrder));
  lines.push(...scheduleFinalChecklistText(checklist));
  lines.push(...scheduleWorkloadText(workload));
  lines.push(...scheduleRegistrationBackupText(backupRows));
  lines.push(...scheduleWaitlistStrategyText(waitlists));
  lines.push(...scheduleAdvisorReadinessMapText(readinessRows));
  lines.push(...scheduleRegistrationAppointmentText(registrationAppointment));
  lines.push(...scheduleSeatFreshnessText(freshness));
  lines.push(...scheduleCalendarExportText(calendarSummary));
  lines.push(...scheduleRegistrationHandoffText(registrationHandoff));

  if (unscheduled.length) {
    lines.push('', 'Missing section picks:');
    unscheduled.forEach(course => lines.push(`- ${course.code} ${course.title || ''}`.trim()));
  }

  if ((conflicts || []).length) {
    lines.push('', 'Conflicts to resolve before registration:');
    conflicts.slice(0, 12).forEach(conflict => {
      const start = Math.max(conflict.a.start, conflict.b.start);
      const end = Math.min(conflict.a.end, conflict.b.end);
      lines.push(`- ${conflict.a.code} overlaps ${conflict.b.code} on ${conflict.a.day} ${formatMeetingTime(start)}-${formatMeetingTime(end)}.`);
    });
  }

  if ((warnings || []).length) {
    lines.push('', 'Warnings to review:');
    warnings.slice(0, 12).forEach(warning => lines.push(`- ${warning}`));
    if (warnings.length > 12) lines.push(`- ${warnings.length - 12} more warning(s) in Terp Track.`);
  }

  lines.push('', 'Recommended fixes:');
  (readiness.fixes || []).forEach(fix => lines.push(`- ${fix}`));
  lines.push('', 'Before submitting in Testudo:');
  lines.push('- Confirm the posted term and every section number still match.');
  lines.push('- Confirm credit load, open seats, waitlist status, permissions, prerequisites, corequisites, and restrictions.');
  lines.push('- Resolve every conflict and missing section pick flagged above.');

  return lines.join('\n');
}

function renderScheduleOutputWeek(blocks) {
  if (!blocks.length) return '<div class="schedule-output-empty">No posted meeting times.</div>';
  const minStart = Math.min(8 * 60, ...blocks.map(b => b.start));
  const maxEnd = Math.max(18 * 60, ...blocks.map(b => b.end));
  const start = Math.floor(minStart / 60) * 60;
  const end = Math.ceil(maxEnd / 60) * 60;
  const span = Math.max(60, end - start);
  const colorByCode = {};
  let colorIdx = 0;
  blocks.forEach(block => {
    if (block.blocked) return;
    const key = normalizeCode(block.code);
    if (colorByCode[key] === undefined) colorByCode[key] = colorIdx++ % 8;
  });

  return `
    <div class="schedule-output-week">
      ${SCHEDULE_DAY_DEFS.map(day => {
        const dayBlocks = blocks.filter(block => block.day === day.key);
        return `<div class="schedule-output-day">
          <strong>${day.label}</strong>
          <div class="schedule-output-day-grid">
            ${dayBlocks.map(block => {
              const top = Math.max(0, ((block.start - start) / span) * 100);
              const height = Math.max(9, ((block.end - block.start) / span) * 100);
              const cls = block.blocked ? 'schedule-output-block blocked' : `schedule-output-block schedule-color-${colorByCode[normalizeCode(block.code)]}`;
              return `<div class="${cls}" style="top:${top}%;height:${height}%">
                <b>${scheduleEscape(block.code)}</b>
                <span>${scheduleEscape(formatMeetingTime(block.start))}-${scheduleEscape(formatMeetingTime(block.end))}</span>
              </div>`;
            }).join('')}
          </div>
        </div>`;
      }).join('')}
    </div>
  `;
}

function buildScheduleOutput(semId, term, courses, selectedItems, conflicts, warnings, prefs, sectionsByCode = {}) {
  const sem = getAllSemesters().find(s => s.id === semId);
  const selectedCodes = new Set(selectedItems.map(item => normalizeCode(item.course.code)));
  const unscheduled = courses.filter(course => !selectedCodes.has(normalizeCode(course.code)));
  const advisorFilter = getScheduleAdvisorFilter();
  const outputOptions = getScheduleOutputOptions();
  const outputPreset = getScheduleOutputPreset(outputOptions, advisorFilter);
  const totalOpenSeats = selectedItems.reduce((sum, item) => {
    const open = parseInt(item.section.open_seats, 10);
    return sum + (Number.isFinite(open) ? open : 0);
  }, 0);
  const blocks = [
    ...scheduleBlockedBlocks(prefs),
    ...selectedItems.flatMap(item => sectionBlocks(item.section, item.course)),
  ];
  const timing = scheduleTimingFit(selectedItems, prefs, conflicts);
  const readiness = scheduleRegistrationReadiness(courses, selectedItems, conflicts, warnings, prefs, unscheduled, sem?.id || semId);
  const registrationOrder = scheduleRegistrationOrder(sem?.id || semId, selectedItems, conflicts, courses);
  const registrationBackupPlan = scheduleRegistrationBackupPlan(selectedItems, sectionsByCode, prefs, conflicts);
  const registrationAppointment = scheduleRegistrationAppointment(prefs, readiness, registrationBackupPlan);
  const registrationHandoff = scheduleRegistrationHandoff(registrationOrder, registrationBackupPlan);
  const seatFreshness = scheduleSeatFreshness(semId, term, courses, sectionsByCode);
  const waitlistStrategy = scheduleWaitlistStrategy(selectedItems, registrationBackupPlan);
  const changes = outputOptions.recentChanges ? scheduleRecentChanges() : [];
  const readinessRows = scheduleReadinessMapRows(semId, term, courses, selectedItems, conflicts, warnings, sectionsByCode);
  const calendar = buildScheduleCalendarIcs(sem, term, selectedItems, prefs);
  const calendarSummary = scheduleCalendarExportSummary(sem, term, courses, selectedItems, prefs, calendar);
  const finalChecklist = scheduleFinalRegistrationChecklist(readiness, registrationAppointment, seatFreshness, registrationBackupPlan, registrationHandoff, calendarSummary, waitlistStrategy);
  const workloadBalance = scheduleWorkloadBalance(courses, selectedItems, prefs, timing);
  const text = buildScheduleOutputText(sem, term, courses, selectedItems, conflicts, warnings, prefs, changes, outputOptions, registrationBackupPlan, registrationAppointment, seatFreshness, readinessRows, calendarSummary, finalChecklist, workloadBalance, waitlistStrategy);
  const registrationText = buildScheduleRegistrationText(sem, term, courses, selectedItems, conflicts, warnings, prefs, unscheduled, registrationBackupPlan, registrationAppointment, seatFreshness, readinessRows, calendarSummary, finalChecklist, workloadBalance, waitlistStrategy);
  const courseRows = selectedItems
    .slice()
    .sort((a, b) => a.course.code.localeCompare(b.course.code))
    .map(item => {
      const risk = sectionSeatRisk(item.section);
      const prereq = scheduleCoursePrereqStatus(item.course, sem?.id || semId);
      const coreq = scheduleCourseCoreqStatus(item.course, courses, selectedItems, sem?.id || semId);
      const eligibility = sectionEligibilityStatus(item.section);
      return `
        <tr>
          <td><strong>${scheduleEscape(item.course.code)}</strong><span>${scheduleEscape(item.course.title || '')}</span></td>
          <td>${scheduleEscape(item.section.number || item.section.section_id || 'TBA')}</td>
          <td>${scheduleEscape(scheduleSectionMeetingLines(item.section).join(' / '))}</td>
          <td>${scheduleEscape(scheduleInstructorLine(item.section))}</td>
          <td>${scheduleEscape(risk.detail)}</td>
          <td>${prereq.level === 'ok' ? '<span>Ready</span>' : scheduleEscape(prereq.detail)}</td>
          <td>${coreq.level === 'ok' ? '<span>Ready</span>' : scheduleEscape(coreq.detail)}</td>
          <td>${eligibility.notes.length ? scheduleEscape(eligibility.detail) : '<span>No posted restriction</span>'}</td>
        </tr>
      `;
    }).join('');
  const scheduleHtml = `
    <article class="schedule-print-sheet" id="schedule-print-sheet">
      <div class="schedule-print-head">
        <div>
          <h3>${scheduleEscape(sem?.name || 'Schedule')}</h3>
          <span>${scheduleEscape(scheduleTermLabel(term))}</span>
        </div>
        <div class="schedule-print-meta">
          <span>${selectedItems.length}/${courses.length} picked</span>
          <span>${conflicts.length} conflicts</span>
          <span>${warnings.length} warnings</span>
          <span>${timing.score}/100 timing</span>
          <span>${totalOpenSeats} open seats</span>
        </div>
      </div>
      ${outputOptions.preferences ? `<p class="schedule-print-prefs">${scheduleEscape(schedulePreferenceSummary(prefs))}</p>` : ''}
      ${scheduleRegistrationReadinessHtml(readiness)}
      ${renderScheduleFinalChecklistHtml(finalChecklist)}
      ${renderScheduleWorkloadHtml(workloadBalance)}
      ${renderScheduleRegistrationAppointmentHtml(registrationAppointment)}
      ${renderScheduleSeatFreshnessHtml(seatFreshness)}
      ${renderScheduleWaitlistStrategyHtml(waitlistStrategy)}
      ${renderScheduleCalendarExportHtml(calendarSummary)}
      ${renderScheduleRegistrationHandoffHtml(registrationHandoff)}
      ${renderScheduleRegistrationOrderHtml(registrationOrder)}
      ${renderScheduleRegistrationBackupsHtml(registrationBackupPlan)}
      ${renderScheduleOutputWeek(blocks)}
      <table class="schedule-output-table">
        <thead><tr><th>Course</th><th>Section</th><th>Meetings</th><th>Instructor</th><th>Seats</th><th>Prereqs</th><th>Coreqs</th><th>Eligibility</th></tr></thead>
        <tbody>${courseRows || '<tr><td colspan="8">No picked sections yet.</td></tr>'}</tbody>
      </table>
      ${outputOptions.unscheduled && unscheduled.length ? `<div class="schedule-output-list"><strong>Unscheduled</strong>${unscheduled.map(course => `<span>${scheduleEscape(course.code)} ${scheduleEscape(course.title || '')}</span>`).join('')}</div>` : ''}
      ${outputOptions.warnings && warnings.length ? `<div class="schedule-output-list warn"><strong>Warnings</strong>${warnings.slice(0, 8).map(warning => `<span>${scheduleEscape(warning)}</span>`).join('')}</div>` : ''}
      ${scheduleChangeDigestHtml(changes, 'Schedule summary')}
    </article>
  `;
  const advisorHtml = scheduleAdvisorPacketHtml(sem, term, courses, selectedItems, conflicts, warnings, prefs, unscheduled, totalOpenSeats, advisorFilter, changes, outputOptions, registrationBackupPlan, registrationAppointment, seatFreshness, readinessRows, calendarSummary, finalChecklist, workloadBalance, waitlistStrategy);
  const advisorTitle = `Terp Track Advisor Packet - ${getSettings().programName || 'UMD degree plan'}`;
  const advisorText = scheduleAdvisorText(sem, term, courses, selectedItems, conflicts, warnings, prefs, text, advisorFilter, unscheduled, outputOptions, registrationBackupPlan, registrationAppointment, seatFreshness, readinessRows, calendarSummary, finalChecklist, workloadBalance, waitlistStrategy);

  return {
    text,
    filename: scheduleOutputFilename(term),
    registrationAppointment,
    seatFreshness,
    registrationHandoff,
    registrationOrder,
	    registrationBackupPlan,
	    waitlistStrategy,
	    finalChecklist,
    workloadBalance,
    registrationText,
    registrationFilename: scheduleRegistrationFilename(term),
    html: scheduleHtml,
    calendar,
    calendarFilename: scheduleCalendarFilename(term),
    calendarEventCount: calendarSummary.eventCount,
    calendarSummary,
    advisorHtml,
    advisorText,
    readinessRows,
    advisorFilter,
    outputPreset,
    outputOptions,
    advisorFilename: scheduleAdvisorFilename(term),
    advisorDocument: buildScheduleAdvisorDocument(advisorTitle, scheduleHtml, advisorHtml),
  };
}

function renderScheduleAdvisorFilterControls(activeFilter) {
  const active = normalizeScheduleAdvisorFilter(activeFilter);
  return `
    <div class="schedule-advisor-filter-controls" aria-label="Advisor packet view">
      <span>Advisor view</span>
      <div class="schedule-advisor-filter-group" role="group" aria-label="Filter advisor packet">
        ${SCHEDULE_ADVISOR_FILTERS.map(filter => `
          <button class="schedule-advisor-filter ${filter.id === active ? 'active' : ''}" type="button" data-advisor-filter="${scheduleEscape(filter.id)}" aria-pressed="${filter.id === active ? 'true' : 'false'}" title="${scheduleEscape(filter.description)}">${scheduleEscape(filter.label)}</button>
        `).join('')}
      </div>
    </div>
  `;
}

function renderScheduleOutputPresets(activePreset = getScheduleOutputPreset()) {
  const isCustom = activePreset === 'custom';
  return `
    <div class="schedule-output-presets" aria-label="Schedule output preset">
      <span>Preset</span>
      <div class="schedule-output-preset-group">
        ${SCHEDULE_OUTPUT_PRESET_DEFS.map(def => `
          <button class="schedule-output-preset ${activePreset === def.id ? 'active' : ''}" type="button" data-schedule-output-preset="${scheduleEscape(def.id)}" aria-pressed="${activePreset === def.id ? 'true' : 'false'}" title="${scheduleEscape(def.description)}">${scheduleEscape(def.label)}</button>
        `).join('')}
        ${isCustom ? '<span class="schedule-output-preset custom">Custom</span>' : ''}
      </div>
    </div>
  `;
}

function renderScheduleOutputOptions(options = getScheduleOutputOptions()) {
  const normalized = normalizeScheduleOutputOptions(options);
  return `
    <div class="schedule-output-options" aria-label="Schedule output included sections">
      <span>Include</span>
      <div class="schedule-output-option-group">
        ${SCHEDULE_OUTPUT_OPTION_DEFS.map(def => `
          <label class="schedule-output-option">
            <input type="checkbox" data-schedule-output-option="${scheduleEscape(def.id)}"${normalized[def.id] ? ' checked' : ''}>
            <span>${scheduleEscape(def.label)}</span>
          </label>
        `).join('')}
      </div>
    </div>
  `;
}

function renderScheduleOutputPanel(semId, term, courses, selectedItems, conflicts, warnings, prefs, sectionsByCode = {}) {
  const root = document.getElementById('schedule-output');
  if (!root) return;
  scheduleOutputCache = buildScheduleOutput(semId, term, courses, selectedItems, conflicts, warnings, prefs, sectionsByCode);
  root.innerHTML = `
    <div class="schedule-output-panel">
      <div class="schedule-output-head">
        <div>
          <h3>Schedule Output</h3>
          <span>${selectedItems.length}/${courses.length} picked · ${scheduleEscape(scheduleTermLabel(term))}</span>
        </div>
        <div class="schedule-output-actions">
          <button class="btn small" type="button" data-schedule-output="copy">Select summary</button>
          <button class="btn small" type="button" data-schedule-output="download">Download .txt</button>
          <button class="btn small" type="button" data-schedule-output="registration-download">Download registration list</button>
          <button class="btn small" type="button" data-schedule-output="calendar-download">Download calendar</button>
          <button class="btn small" type="button" data-schedule-output="advisor-download">Download advisor packet</button>
          <button class="btn small" type="button" data-schedule-output="print">Print schedule</button>
          <button class="btn small primary" type="button" data-schedule-output="advisor-print">Print advisor PDF</button>
        </div>
      </div>
      ${renderScheduleOutputPresets(scheduleOutputCache.outputPreset)}
      ${renderScheduleOutputOptions(scheduleOutputCache.outputOptions)}
      ${scheduleOutputCache.html}
      ${renderScheduleAdvisorFilterControls(scheduleOutputCache.advisorFilter)}
      ${scheduleOutputCache.advisorHtml}
      <textarea id="schedule-output-text" class="schedule-output-text" readonly hidden>${scheduleEscape(scheduleOutputCache.text)}</textarea>
    </div>
  `;
  root.querySelectorAll('[data-schedule-output]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const action = btn.dataset.scheduleOutput;
      root.dataset.lastAction = action;
      if (action === 'copy') copyScheduleOutputSummary();
      if (action === 'download') downloadScheduleOutputSummary();
      if (action === 'registration-download') downloadScheduleRegistrationList();
      if (action === 'calendar-download') downloadScheduleCalendar();
      if (action === 'print') printScheduleOutputSummary();
      if (action === 'advisor-download') downloadScheduleAdvisorPacket();
      if (action === 'advisor-print') printScheduleAdvisorPacket();
    });
  });
  root.querySelectorAll('[data-schedule-output-preset]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      setScheduleOutputPreset(btn.dataset.scheduleOutputPreset);
    });
  });
  root.querySelectorAll('[data-schedule-output-option]').forEach(input => {
    input.addEventListener('change', () => {
      setScheduleOutputOption(input.dataset.scheduleOutputOption, input.checked);
    });
  });
  root.querySelectorAll('[data-advisor-filter]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      setScheduleAdvisorFilter(btn.dataset.advisorFilter);
    });
  });
  root.querySelectorAll('[data-readiness-action]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      handleScheduleReadinessAction(btn.dataset.readinessAction);
    });
  });
  root.querySelectorAll('[data-seat-freshness-action]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      handleScheduleSeatFreshnessAction(btn.dataset.seatFreshnessAction);
    });
  });
  root.querySelectorAll('[data-backup-action]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      handleScheduleBackupAction(btn.dataset.backupAction);
    });
  });
  root.querySelectorAll('[data-calendar-export-action]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      handleScheduleCalendarExportAction(btn.dataset.calendarExportAction);
    });
  });
  root.querySelectorAll('[data-schedule-audit-primary]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      root.dataset.lastAuditAction = 'primary';
      scheduleOpenAdvisorAuditPrimary(btn.dataset.scheduleAuditPrimary);
    });
  });
  root.querySelectorAll('[data-schedule-audit-browse]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      root.dataset.lastAuditAction = 'browse';
      scheduleOpenAdvisorAuditBrowse(btn.dataset.scheduleAuditBrowse);
    });
  });
}

async function copyScheduleOutputSummary() {
  if (!scheduleOutputCache) return;
  const textArea = document.getElementById('schedule-output-text');
  if (textArea) {
    textArea.hidden = false;
    textArea.focus();
    textArea.select();
    toastInfo('Schedule summary selected.');
  }
}

function downloadScheduleOutputSummary() {
  if (!scheduleOutputCache) return;
  const blob = new Blob([scheduleOutputCache.text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = scheduleOutputCache.filename;
  a.click();
  URL.revokeObjectURL(url);
  toastSuccess('Schedule summary downloaded.');
}

function downloadScheduleRegistrationList() {
  if (!scheduleOutputCache) return;
  const blob = new Blob([scheduleOutputCache.registrationText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = scheduleOutputCache.registrationFilename;
  a.click();
  URL.revokeObjectURL(url);
  toastSuccess('Registration list downloaded.');
}

function downloadScheduleCalendar() {
  if (!scheduleOutputCache) return;
  if (!scheduleOutputCache.calendarEventCount) {
    toastInfo('Pick timed sections before downloading a calendar.');
    return;
  }
  const blob = new Blob([scheduleOutputCache.calendar], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = scheduleOutputCache.calendarFilename;
  a.click();
  URL.revokeObjectURL(url);
  const omitted = Number(scheduleOutputCache.calendarSummary?.omittedCount) || 0;
  if (omitted) {
    toastInfo(`Calendar downloaded with ${scheduleOutputCache.calendarEventCount} event${scheduleOutputCache.calendarEventCount === 1 ? '' : 's'}; ${omitted} planned course${omitted === 1 ? ' is' : 's are'} omitted.`);
  } else {
    toastSuccess(`Calendar downloaded with ${scheduleOutputCache.calendarEventCount} class event${scheduleOutputCache.calendarEventCount === 1 ? '' : 's'}.`);
  }
}

function downloadScheduleAdvisorPacket() {
  if (!scheduleOutputCache) return;
  const blob = new Blob([scheduleOutputCache.advisorDocument], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = scheduleOutputCache.advisorFilename;
  a.click();
  URL.revokeObjectURL(url);
  toastSuccess('Advisor packet downloaded.');
}

function printScheduleOutputSummary() {
  if (!scheduleOutputCache) return;
  document.body.classList.remove('print-advisor-packet');
  document.body.classList.add('print-schedule');
  window.print();
  setTimeout(() => document.body.classList.remove('print-schedule'), 400);
}

function printScheduleAdvisorPacket() {
  if (!scheduleOutputCache) return;
  document.body.classList.remove('print-schedule');
  document.body.classList.add('print-advisor-packet');
  window.print();
  setTimeout(() => document.body.classList.remove('print-advisor-packet'), 400);
}

async function handleScheduleReadinessAction(action) {
  const root = document.getElementById('schedule-output');
  if (root) root.dataset.lastReadinessAction = action || '';
  if (action === 'auto-pick') {
    await autoPickScheduleSections();
    return;
  }
  if (action === 'alternatives') {
    await generateScheduleAlternatives();
    const alternatives = document.getElementById('schedule-alternatives');
    if (alternatives) alternatives.scrollIntoView({ block: 'start', behavior: 'smooth' });
    return;
  }
  if (action === 'review-sections') {
    const list = document.getElementById('schedule-section-list');
    if (list) {
      const panel = list.closest('.schedule-sections') || list;
      panel.classList.add('readiness-focus');
      list.scrollIntoView({ block: 'start', behavior: 'smooth' });
      setTimeout(() => panel.classList.remove('readiness-focus'), 1800);
    }
    toastInfo('Review section picks and backup options below.');
  }
}

async function autoFillScheduleCalendarOmissions() {
  const semId = scheduleCurrentSemId || scheduleDefaultSemesterId();
  const sem = getAllSemesters().find(s => s.id === semId);
  if (!sem) return;
  const term = (state.schedulePrefs && state.schedulePrefs[semId] && state.schedulePrefs[semId].term) || scheduleInferTermCode(sem);
  const prefs = getSchedulePrefs(semId);
  const courses = scheduleCoursesForSemester(semId);
  const sectionsByCode = await scheduleFetchSectionsFor(semId, term, courses);
  const currentItems = scheduleSelectedItemsFor(semId, term, courses, sectionsByCode);
  const targetCodes = new Set();
  currentItems.forEach(item => {
    if (!sectionHasTimedMeetings(item.section)) targetCodes.add(normalizeCode(item.course.code));
  });
  courses.forEach(course => {
    if (!getSelectedSection(semId, course.code)) targetCodes.add(normalizeCode(course.code));
  });
  if (!targetCodes.size) {
    toastInfo('Calendar export already has timed sections for every picked course.');
    return;
  }
  const chosen = currentItems
    .filter(item => !targetCodes.has(normalizeCode(item.course.code)))
    .map(item => ({ course: item.course, section: item.section }));
  const targetCourses = courses
    .filter(course => targetCodes.has(normalizeCode(course.code)))
    .sort((a, b) => {
      const sa = (sectionsByCode[normalizeCode(a.code)] || []).filter(sectionHasTimedMeetings).length;
      const sb = (sectionsByCode[normalizeCode(b.code)] || []).filter(sectionHasTimedMeetings).length;
      return sa - sb || a.code.localeCompare(b.code);
    });
  const changes = [];
  const skipped = [];
  targetCourses.forEach(course => {
    const norm = normalizeCode(course.code);
    const sections = (sectionsByCode[norm] || [])
      .filter(sectionHasTimedMeetings)
      .sort((a, b) => sectionScore(b, prefs, course, chosen) - sectionScore(a, prefs, course, chosen));
    const viable = sections.filter(section => {
      const candidateBlocks = sectionBlocks(section, course);
      const existingBlocks = chosen.flatMap(item => sectionBlocks(item.section, item.course));
      const blockedOverlap = sectionBlockedOverlaps(section, prefs, course).length > 0;
      return !blockedOverlap && !candidateBlocks.some(a => existingBlocks.some(b => blocksConflict(a, b)));
    });
    const pick = viable[0] || null;
    if (!pick) {
      skipped.push(course.code);
      return;
    }
    const previous = getSelectedSection(semId, course.code);
    chosen.push({ course, section: pick });
    changes.push({
      semId,
      code: course.code,
      previousSection: scheduleCloneSection(previous),
      previousPinned: !!previous?.pinned,
      nextSection: scheduleCloneSection(pick),
    });
  });
  if (!changes.length) {
    toastInfo(skipped.length ? `No conflict-free timed sections found for ${skipped.join(', ')}.` : 'No calendar omissions could be auto-filled.');
    return;
  }
  changes.forEach(change => setSelectedSection(change.semId, change.code, change.nextSection));
  registerScheduleUndo({
    type: 'calendar-omission-auto-fill',
    semId,
    changes,
    termCount: 1,
    title: `Auto-filled ${changes.length} calendar section${changes.length === 1 ? '' : 's'}`,
    detail: 'Undo restores the previous picks for calendar omitted courses.',
    undoTitle: 'Undid calendar auto-fill',
    undoDetail: `Restored previous section choices for ${changes.length} calendar omitted course${changes.length === 1 ? '' : 's'}.`,
    undoMeta: 'Undo calendar auto-fill',
    undoToast: `Restored ${changes.length} calendar auto-fill pick${changes.length === 1 ? '' : 's'}.`,
  });
  recordPlanChange({
    type: 'auto-pick',
    source: 'Schedule',
    title: `Auto-filled ${changes.length} calendar omitted section${changes.length === 1 ? '' : 's'}`,
    detail: changes.map(change => `${change.code} ${scheduleSectionShortLabel(change.nextSection)}`).join(' · '),
    meta: `${scheduleTermLabel(term)}${skipped.length ? ` · skipped ${skipped.join(', ')}` : ''}`,
  }, { save: false });
  saveState();
  renderSchedule();
  renderSemesters();
  if (skipped.length) toastInfo(`Filled ${changes.length}; no conflict-free timed sections found for ${skipped.join(', ')}.`);
  else toastSuccess(`Filled ${changes.length} omitted calendar section${changes.length === 1 ? '' : 's'}.`);
}

async function handleScheduleCalendarExportAction(action) {
  const root = document.getElementById('schedule-output');
  if (root) root.dataset.lastCalendarAction = action || '';
  if (action === 'auto-fill-omissions') {
    await autoFillScheduleCalendarOmissions();
    const nextRoot = document.getElementById('schedule-output');
    if (nextRoot) nextRoot.dataset.lastCalendarAction = action;
    return;
  }
  if (action !== 'review-omissions') return;
  const summary = scheduleOutputCache?.calendarSummary || {};
  const rows = [...(summary.missingRows || []), ...(summary.tbaRows || [])];
  const firstCode = normalizeCode(rows[0]?.courseCode || '');
  const list = document.getElementById('schedule-section-list');
  if (!list) return;
  const panel = list.closest('.schedule-sections') || list;
  const picks = [...list.querySelectorAll('.section-pick')];
  const target = firstCode
    ? picks.find(pick => normalizeCode(pick.dataset.code || '') === firstCode)
    : null;
  panel.classList.add('readiness-focus');
  if (target) target.classList.add('calendar-omission-focus');
  (target || list).scrollIntoView({ block: 'start', behavior: 'smooth' });
  setTimeout(() => {
    panel.classList.remove('readiness-focus');
    if (target) target.classList.remove('calendar-omission-focus');
  }, 1800);
  toastInfo(rows.length ? 'Review omitted courses before relying on the calendar export.' : 'Calendar export includes every picked timed course.');
}

async function applyScheduleReadyBackups() {
  const semId = scheduleCurrentSemId || scheduleDefaultSemesterId();
  const sem = getAllSemesters().find(s => s.id === semId);
  if (!sem) return;
  const term = (state.schedulePrefs && state.schedulePrefs[semId] && state.schedulePrefs[semId].term) || scheduleInferTermCode(sem);
  const prefs = getSchedulePrefs(semId);
  const courses = scheduleCoursesForSemester(semId);
  const sectionsByCode = await scheduleFetchSectionsFor(semId, term, courses);
  const changes = [];
  const applied = [];
  const considered = new Set();
  for (let i = 0; i < courses.length; i += 1) {
    const selectedItems = scheduleSelectedItemsFor(semId, term, courses, sectionsByCode);
    const { conflicts } = detectScheduleConflicts(selectedItems);
    const plan = scheduleRegistrationBackupPlan(selectedItems, sectionsByCode, prefs, conflicts);
    const row = plan.find(item => item.status === 'ready' && item.backupId && !considered.has(normalizeCode(item.courseCode)));
    if (!row) break;
    const norm = normalizeCode(row.courseCode);
    considered.add(norm);
    const course = courses.find(item => normalizeCode(item.code) === norm);
    const section = (sectionsByCode[norm] || []).find(item => item.section_id === row.backupId);
    if (!course || !section) continue;
    const previous = getSelectedSection(semId, course.code);
    const change = scheduleSectionUndoChange(semId, course.code, previous, section);
    if (!change) continue;
    setSelectedSection(semId, course.code, section);
    changes.push(change);
    applied.push(`${course.code} ${scheduleSectionShortLabel(section)}`);
  }
  if (!changes.length) {
    if (typeof toastInfo === 'function') toastInfo('No ready backup sections can be applied for this term.');
    return;
  }
  registerScheduleUndo({
    type: 'ready-backup-apply',
    semId,
    changes,
    termCount: 1,
    title: `Applied ${changes.length} ready backup${changes.length === 1 ? '' : 's'}`,
    detail: `Undo restores the previous low-seat section pick${changes.length === 1 ? '' : 's'} for ${sem.name || semId}.`,
    undoTitle: 'Undid ready backup apply',
    undoDetail: `Restored previous section choices for ${changes.length} backup-swapped course${changes.length === 1 ? '' : 's'}.`,
    undoMeta: 'Undo ready backups',
    undoToast: `Restored ${changes.length} ready backup swap${changes.length === 1 ? '' : 's'}.`,
  });
  recordPlanChange({
    type: 'section-swap',
    source: 'Schedule',
    title: `Applied ${changes.length} ready backup section${changes.length === 1 ? '' : 's'}`,
    detail: applied.join(' · '),
    meta: scheduleTermLabel(term),
  }, { save: false });
  saveState();
  renderSchedule();
  renderSemesters();
  if (typeof toastSuccess === 'function') toastSuccess(`Applied ${changes.length} ready backup section${changes.length === 1 ? '' : 's'}.`);
}

async function handleScheduleBackupAction(action) {
  const root = document.getElementById('schedule-output');
  if (root) root.dataset.lastBackupAction = action || '';
  if (action !== 'apply-ready') return;
  await applyScheduleReadyBackups();
  const nextRoot = document.getElementById('schedule-output');
  if (nextRoot) nextRoot.dataset.lastBackupAction = action;
}

async function handleScheduleSeatFreshnessAction(action) {
  const root = document.getElementById('schedule-output');
  if (root) root.dataset.lastSeatFreshnessAction = action || '';
  if (action !== 'refresh') return;
  toastInfo('Refreshing posted sections and seats...');
  await renderSchedule({ force: true });
  const nextRoot = document.getElementById('schedule-output');
  if (nextRoot) nextRoot.dataset.lastSeatFreshnessAction = 'refresh';
}

if (typeof window !== 'undefined') {
  window.copyScheduleOutputSummary = copyScheduleOutputSummary;
  window.downloadScheduleOutputSummary = downloadScheduleOutputSummary;
  window.downloadScheduleRegistrationList = downloadScheduleRegistrationList;
  window.downloadScheduleCalendar = downloadScheduleCalendar;
  window.downloadScheduleAdvisorPacket = downloadScheduleAdvisorPacket;
  window.printScheduleOutputSummary = printScheduleOutputSummary;
  window.printScheduleAdvisorPacket = printScheduleAdvisorPacket;
  window.handleScheduleReadinessAction = handleScheduleReadinessAction;
  window.handleScheduleCalendarExportAction = handleScheduleCalendarExportAction;
  window.autoFillScheduleCalendarOmissions = autoFillScheduleCalendarOmissions;
  window.handleScheduleBackupAction = handleScheduleBackupAction;
  window.applyScheduleReadyBackups = applyScheduleReadyBackups;
  window.handleScheduleSeatFreshnessAction = handleScheduleSeatFreshnessAction;
}

function renderMiniSchedulePreview(items, unavailableBlocks = []) {
  const blocks = [...unavailableBlocks, ...items.flatMap(item => sectionBlocks(item.section, item.course))];
  if (!blocks.length) return '<div class="alt-mini-empty">No posted times</div>';
  const start = 8 * 60;
  const end = 18 * 60;
  const span = end - start;
  const colorByCode = {};
  let colorIdx = 0;
  blocks.forEach(block => {
    const n = normalizeCode(block.code);
    if (colorByCode[n] === undefined) colorByCode[n] = colorIdx++ % 8;
  });
  return `
    <div class="alt-mini-week" aria-hidden="true">
      ${SCHEDULE_DAY_DEFS.map(day => {
        const dayBlocks = blocks.filter(b => b.day === day.key);
        return `<div class="alt-mini-day">
          <span class="alt-mini-label">${day.label.slice(0, 1)}</span>
          ${dayBlocks.map(block => {
            const top = Math.max(0, Math.min(100, ((block.start - start) / span) * 100));
            const height = Math.max(8, Math.min(100 - top, ((block.end - block.start) / span) * 100));
            const color = colorByCode[normalizeCode(block.code)];
            const cls = block.blocked ? 'alt-mini-block blocked' : `alt-mini-block schedule-color-${color}`;
            return `<span class="${cls}" style="top:${top}%;height:${height}%" title="${scheduleEscape(block.code)} ${scheduleEscape(formatMeetingTime(block.start))}-${scheduleEscape(formatMeetingTime(block.end))}"></span>`;
          }).join('')}
        </div>`;
      }).join('')}
    </div>
  `;
}

function scheduleDeltaLabel(value, unit = '') {
  const n = Math.round(Number(value) || 0);
  if (!n) return '';
  return `${n > 0 ? '+' : ''}${n}${unit}`;
}

function scheduleAlternativeComparison(alt, current, prefs) {
  const baseline = current || { items: [], conflicts: [], warnings: [], openSeats: 0, timing: null, locationIssues: 0 };
  const altTiming = alt.timing || scheduleTimingFit(alt.items, prefs, alt.conflicts);
  const currentTiming = baseline.timing || scheduleTimingFit(baseline.items || [], prefs, baseline.conflicts || []);
  const lines = [];
  const timingDelta = altTiming.score - currentTiming.score;
  const conflictDelta = (alt.conflicts || []).length - (baseline.conflicts || []).length;
  const warningDelta = (alt.warnings || []).length - (baseline.warnings || []).length;
  const idleDelta = (altTiming.metrics.totalIdle || 0) - (currentTiming.metrics.totalIdle || 0);
  const activeDayDelta = (altTiming.metrics.activeDays || 0) - (currentTiming.metrics.activeDays || 0);
  const openSeatDelta = (alt.openSeats || 0) - (baseline.openSeats || 0);
  const locationDelta = (Number(alt.locationIssues) || 0) - (Number(baseline.locationIssues) || 0);

  if (timingDelta) {
    lines.push(`${timingDelta > 0 ? 'Improves' : 'Lowers'} timing fit by ${Math.abs(timingDelta)} points (${altTiming.score}/100).`);
  } else {
    lines.push(`Keeps the same ${altTiming.score}/100 timing fit.`);
  }
  if (conflictDelta) {
    lines.push(`${conflictDelta < 0 ? 'Removes' : 'Adds'} ${Math.abs(conflictDelta)} conflict${Math.abs(conflictDelta) === 1 ? '' : 's'}.`);
  }
  if (warningDelta) {
    lines.push(`${warningDelta < 0 ? 'Reduces' : 'Adds'} ${Math.abs(warningDelta)} warning${Math.abs(warningDelta) === 1 ? '' : 's'}.`);
  }
  if (idleDelta) {
    lines.push(`${idleDelta < 0 ? 'Saves' : 'Adds'} ${scheduleDurationLabel(Math.abs(idleDelta))} idle time.`);
  }
  if (activeDayDelta && prefs.mode === 'compact') {
    lines.push(`${activeDayDelta < 0 ? 'Uses' : 'Requires'} ${Math.abs(activeDayDelta)} ${activeDayDelta < 0 ? 'fewer' : 'more'} active day${Math.abs(activeDayDelta) === 1 ? '' : 's'}.`);
  }
  if (openSeatDelta) {
    lines.push(`${scheduleDeltaLabel(openSeatDelta)} open seats versus current picks.`);
  }
  if (locationDelta && scheduleLocationPrefsActive(prefs)) {
    lines.push(`${locationDelta < 0 ? 'Removes' : 'Adds'} ${Math.abs(locationDelta)} campus-fit alert${Math.abs(locationDelta) === 1 ? '' : 's'}.`);
  }
  return {
    timingDelta,
    conflictDelta,
    warningDelta,
    idleDelta,
    activeDayDelta,
    openSeatDelta,
    locationDelta,
    lines: lines.slice(0, 4),
  };
}

function renderScheduleAlternatives(alternatives) {
  const root = document.getElementById('schedule-alternatives');
  if (!root) return;
  scheduleAlternatives = alternatives || [];
  if (!scheduleAlternatives.length) {
    root.innerHTML = '';
    return;
  }
  const currentSemId = scheduleCurrentSemId || scheduleDefaultSemesterId();
  const currentPrefs = getSchedulePrefs(currentSemId);
  const blocked = scheduleBlockedBlocks(currentPrefs);
  root.innerHTML = `
    <div class="alternatives-head">
      <h3>Alternate schedules</h3>
      <span>${scheduleAlternatives.length} generated from posted sections and current preferences</span>
    </div>
    <div class="alternatives-grid">
      ${scheduleAlternatives.map((alt, idx) => {
        const pinned = alt.items.filter(item => item.section.pinned).length;
        const seatRisks = alt.items.map(item => sectionSeatRisk(item.section));
        const urgentSeats = seatRisks.filter(risk => risk.level === 'closed' || risk.level === 'risk').length;
        const blockConflicts = alt.items.reduce((sum, item) => sum + sectionBlockedOverlaps(item.section, currentPrefs, item.course).length, 0);
        const locationIssues = Number.isFinite(alt.locationIssues)
          ? alt.locationIssues
          : scheduleCandidateLocationReport(alt.items, currentPrefs).alertCount;
        const timing = alt.timing || scheduleTimingFit(alt.items, currentPrefs, alt.conflicts);
        const comparison = scheduleAlternativeComparison(alt, alt.compareTo, currentPrefs);
        const courseLine = alt.items
          .map(item => `${item.course.code} ${item.section.number || ''}`.trim())
          .join(' · ');
        return `
          <div class="alt-card">
            <div class="alt-title">
              <strong>Option ${idx + 1}</strong>
              <button class="btn small alt-apply" type="button" data-alt-index="${idx}">Apply</button>
            </div>
            <div class="alt-metrics">
              <span>${alt.items.length} picked</span>
              <span class="${alt.conflicts.length ? 'bad' : 'good'}">${alt.conflicts.length} conflicts</span>
              <span class="${alt.warnings.length ? 'warn' : 'good'}">${alt.warnings.length} warnings</span>
              <span class="${timing.tone === 'ok' ? 'good' : timing.tone === 'warn' ? 'warn' : 'bad'}">${timing.score}/100 timing</span>
              <span>${alt.openSeats} open seats</span>
              ${urgentSeats ? `<span class="bad">${urgentSeats} seat risk${urgentSeats === 1 ? '' : 's'}</span>` : '<span class="good">seat-safe</span>'}
              ${blockConflicts ? `<span class="bad">${blockConflicts} block conflict${blockConflicts === 1 ? '' : 's'}</span>` : (blocked.length ? '<span class="good">blocks clear</span>' : '')}
              ${scheduleLocationPrefsActive(currentPrefs) ? (locationIssues ? `<span class="warn">${locationIssues} location alert${locationIssues === 1 ? '' : 's'}</span>` : '<span class="good">campus-fit</span>') : ''}
              ${pinned ? `<span>${pinned} pinned</span>` : ''}
            </div>
            <div class="alt-why">
              <strong>Why this option</strong>
              ${comparison.lines.map(line => `<span>${scheduleEscape(line)}</span>`).join('')}
            </div>
            ${renderMiniSchedulePreview(alt.items, blocked)}
            <p>${scheduleEscape(courseLine)}</p>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

async function generateScheduleAlternatives() {
  const semId = scheduleCurrentSemId || scheduleDefaultSemesterId();
  const sem = getAllSemesters().find(s => s.id === semId);
  if (!sem) return;
  const term = (state.schedulePrefs && state.schedulePrefs[semId] && state.schedulePrefs[semId].term) || scheduleInferTermCode(sem);
  const prefs = getSchedulePrefs(semId);
  const courses = scheduleCoursesForSemester(semId);
  const status = document.getElementById('schedule-status');
  if (status) status.textContent = 'Generating alternate schedules from posted sections...';
  const sectionsByCode = await scheduleFetchSectionsFor(semId, term, courses);
  const currentItems = scheduleSelectedItemsFor(semId, term, courses, sectionsByCode);
  const currentEvaluation = evaluateScheduleCandidate(currentItems, prefs);
  const currentBaseline = {
    items: currentItems,
    conflicts: currentEvaluation.conflicts,
    warnings: currentEvaluation.warnings,
    openSeats: currentEvaluation.openSeats,
    timing: currentEvaluation.timing,
    locationIssues: currentEvaluation.locationIssues,
  };
  const seen = new Set();
  const alternatives = [];
  for (let variant = 0; variant < 12; variant++) {
    const candidate = buildScheduleCandidate(courses, sectionsByCode, prefs, variant, currentItems);
    if (!candidate.items.length || seen.has(candidate.signature)) continue;
    seen.add(candidate.signature);
    candidate.compareTo = currentBaseline;
    alternatives.push(candidate);
  }
  alternatives.sort((a, b) => {
    if (a.conflicts.length !== b.conflicts.length) return a.conflicts.length - b.conflicts.length;
    if (a.warnings.length !== b.warnings.length) return a.warnings.length - b.warnings.length;
    if (b.score !== a.score) return b.score - a.score;
    return b.openSeats - a.openSeats;
  });
  renderScheduleAlternatives(alternatives.slice(0, 4));
  if (status) status.textContent = `${Object.values(sectionsByCode).reduce((sum, list) => sum + (list || []).length, 0)} sections loaded.`;
  if (alternatives.length) toastSuccess(`Generated ${Math.min(4, alternatives.length)} alternate schedule${alternatives.length === 1 ? '' : 's'}.`);
  else toastInfo('No alternate schedules could be generated from the posted sections.');
}

function applyScheduleAlternative(index) {
  const alt = scheduleAlternatives[index];
  if (!alt) return;
  const semId = scheduleCurrentSemId || scheduleDefaultSemesterId();
  const sem = getAllSemesters().find(s => s.id === semId);
  const courses = scheduleCoursesForSemester(semId);
  const prefs = getSchedulePrefs(semId);
  const altCodes = new Set(alt.items.map(item => normalizeCode(item.course.code)));
  const bucket = scheduleSelectionBucket(semId);
  const timing = alt.timing || scheduleTimingFit(alt.items, prefs, alt.conflicts);
  const comparison = scheduleAlternativeComparison(alt, alt.compareTo, prefs);
  const courseLine = alt.items
    .map(item => `${item.course.code} ${item.section.number || ''}`.trim())
    .join(' · ');
  const undoChanges = [];
  clearScheduleUndo();
  courses.forEach(course => {
    const key = normalizeCode(course.code);
    if (!altCodes.has(key) && !bucket[key]?.pinned) {
      const change = scheduleSectionUndoChange(semId, course.code, bucket[key], null);
      if (change) undoChanges.push(change);
      delete bucket[key];
    }
  });
  alt.items.forEach(item => {
    const previous = getSelectedSection(semId, item.course.code);
    const change = scheduleSectionUndoChange(semId, item.course.code, previous, item.section);
    if (change) undoChanges.push(change);
    setSelectedSection(semId, item.course.code, item.section);
  });
  if (undoChanges.length) {
    registerScheduleUndo({
      type: 'alternate-schedule-apply',
      semId,
      changes: undoChanges,
      termCount: 1,
      title: `Applied alternate schedule ${index + 1}`,
      detail: `Undo restores ${undoChanges.length} previous pick${undoChanges.length === 1 ? '' : 's'} for ${sem?.name || semId}.`,
      undoTitle: `Undid alternate schedule ${index + 1}`,
      undoDetail: `Restored previous section choices for ${undoChanges.length} alternate schedule course${undoChanges.length === 1 ? '' : 's'}.`,
      undoMeta: 'Undo alternate schedule',
      undoToast: `Restored ${undoChanges.length} alternate schedule pick${undoChanges.length === 1 ? '' : 's'}.`,
    });
  }
  recordPlanChange({
    type: 'auto-pick',
    source: 'Schedule',
    title: `Applied alternate schedule ${index + 1}`,
    detail: `${alt.items.length} sections applied with ${alt.conflicts.length} conflicts, ${alt.warnings.length} warnings, and ${timing.score}/100 timing fit.`,
    meta: `${alt.openSeats} open seats across picked sections`,
    highlights: [
      ...comparison.lines,
      courseLine ? `Sections: ${courseLine}` : '',
    ],
  }, { save: false });
  saveState();
  renderSchedule();
  renderSemesters();
  toastSuccess(`Applied alternate schedule ${index + 1}.`);
}

function renderWeekGrid(blocks, conflicts) {
  const root = document.getElementById('schedule-week');
  if (!root) return;
  if (!blocks.length) {
    root.innerHTML = '<div class="schedule-empty">Pick sections to build a weekly calendar. Courses with no posted times stay in the section list until UMD releases them.</div>';
    return;
  }
  const minStart = Math.min(8 * 60, ...blocks.map(b => b.start));
  const maxEnd = Math.max(18 * 60, ...blocks.map(b => b.end));
  const startHour = Math.floor(minStart / 60);
  const endHour = Math.ceil(maxEnd / 60);
  const start = startHour * 60;
  const end = endHour * 60;
  const span = end - start;
  const hours = [];
  for (let h = startHour; h <= endHour; h++) hours.push(h);
  const colorByCode = {};
  let colorIdx = 0;
  blocks.forEach(b => {
    if (b.blocked) return;
    const n = normalizeCode(b.code);
    if (colorByCode[n] === undefined) colorByCode[n] = colorIdx++ % 8;
  });
  root.innerHTML = `
    <div class="week-grid">
      <div class="week-corner"></div>
      ${SCHEDULE_DAY_DEFS.map(d => `<div class="week-day-head">${d.label}</div>`).join('')}
      <div class="time-rail" style="height:${hours.length * 54}px">
        ${hours.map(h => `<div style="top:${((h * 60 - start) / span) * 100}%">${formatMeetingTime(h * 60)}</div>`).join('')}
      </div>
      ${SCHEDULE_DAY_DEFS.map(day => {
        const dayBlocks = blocks.filter(b => b.day === day.key);
        return `<div class="week-day-col" style="height:${hours.length * 54}px">
          ${hours.map(h => `<span class="hour-line" style="top:${((h * 60 - start) / span) * 100}%"></span>`).join('')}
          ${dayBlocks.map(b => {
            const top = ((b.start - start) / span) * 100;
            const height = Math.max(4, ((b.end - b.start) / span) * 100);
            const cls = b.blocked
              ? 'schedule-block schedule-blocked'
              : `schedule-block schedule-color-${colorByCode[normalizeCode(b.code)]}${b.conflict ? ' conflict' : ''}`;
            return `<div class="${cls}" style="top:${top}%;height:${height}%">
              <strong>${scheduleEscape(b.code)}</strong>
              <span>${scheduleEscape(formatMeetingTime(b.start))}-${scheduleEscape(formatMeetingTime(b.end))}</span>
              <em>${scheduleEscape(b.type)}${b.room ? ` · ${scheduleEscape(b.room)}` : ''}</em>
            </div>`;
          }).join('')}
        </div>`;
      }).join('')}
    </div>
    ${conflicts.length ? `<div class="schedule-conflicts">${conflicts.map(c => `<div><strong>${scheduleEscape(c.a.code)}</strong> overlaps <strong>${scheduleEscape(c.b.code)}</strong> on ${scheduleEscape(c.a.day)}.</div>`).join('')}</div>` : ''}
  `;
}

function renderSectionList(semId, term, courses, sectionsByCode, selectedItems, prefs) {
  const root = document.getElementById('schedule-section-list');
  if (!root) return;
  if (!courses.length) {
    root.innerHTML = '<p class="reco-empty">This semester has no unsatisfied UMD-coded courses to schedule.</p>';
    return;
  }
  const selectedMap = {};
  selectedItems.forEach(item => { selectedMap[normalizeCode(item.course.code)] = item.section; });
  root.innerHTML = courses.map(course => {
    const norm = normalizeCode(course.code);
    const sections = sectionsByCode[norm] || [];
    const saved = getSelectedSection(semId, course.code);
    const picked = selectedMap[norm] || (saved && String(saved.semester || '') === String(term) ? saved : null);
    const posted = sections.length > 0;
    const options = [
      `<option value="">Pick a section…</option>`,
      ...sections
        .slice()
        .sort((a, b) => sectionScore(b, prefs, course) - sectionScore(a, prefs, course))
        .map(section => {
          const open = section.open_seats !== undefined && section.open_seats !== '' ? ` · ${section.open_seats} open` : '';
          const wait = section.waitlist && section.waitlist !== '0' ? ` · ${section.waitlist} wait` : '';
          return `<option value="${scheduleEscape(section.section_id)}" ${picked && picked.section_id === section.section_id ? 'selected' : ''}>${scheduleEscape(sectionSummary(section))}${open}${wait}</option>`;
        })
    ].join('');
    const instructors = picked && picked.instructors && picked.instructors.length
      ? picked.instructors.join(', ')
      : 'Instructor TBA';
    const notes = picked ? sectionPreferenceNotes(picked, prefs, course) : [];
    const prefText = picked
      ? (notes.length ? notes.map(n => n.text).join(' · ') : 'Fits current preferences')
      : 'Pick one or auto-build.';
    const pinned = picked && isSelectedSectionPinned(semId, course.code);
    const pickedRisk = picked ? sectionSeatRisk(picked) : null;
    return `
      <div class="section-pick ${picked ? 'picked' : ''}${pinned ? ' pinned' : ''}${pickedRisk ? ` seat-level-${pickedRisk.level}` : ''}" data-code="${scheduleEscape(course.code)}">
        <div class="section-pick-head">
          <div>
            <strong>${scheduleEscape(course.code)}</strong>
            <span>${scheduleEscape(course.title)}</span>
          </div>
          <div class="section-head-actions">
            ${picked ? `<button class="section-pin-btn ${pinned ? 'active' : ''}" type="button" data-pin-code="${scheduleEscape(course.code)}" title="${pinned ? 'Unpin this section' : 'Pin this section'}">${pinned ? 'Pinned' : 'Pin'}</button>` : ''}
            ${picked ? renderSeatRiskBadge(picked) : ''}
            <span class="section-cr">${Number(course.cr) || 0} cr</span>
          </div>
        </div>
        <select class="section-select" data-code="${scheduleEscape(course.code)}">${options}</select>
        ${posted ? renderSectionSeatOverview(sections, picked) : ''}
        ${picked ? renderSectionEligibilityRow(picked) : ''}
        ${picked ? renderSectionLocationFit(picked, prefs, course) : ''}
        ${picked ? renderSectionDecision(sections, picked, prefs, course, selectedItems) : ''}
        <div class="section-note">
          ${posted
            ? `${sections.length} section${sections.length === 1 ? '' : 's'} posted for ${scheduleEscape(scheduleTermLabel(term))}. ${scheduleEscape(picked ? instructors : prefText)}`
            : `No sections posted for ${scheduleEscape(scheduleTermLabel(term))} yet. Keep the course in the plan and refresh when UMD releases seats.`}
        </div>
        ${picked ? `<div class="section-pref-note ${notes.length ? 'warn' : 'ok'}">${scheduleEscape(prefText)}</div>` : ''}
      </div>
    `;
  }).join('');
}

async function renderSchedule(opts = {}) {
  scheduleLoadPostedTerms();
  const semId = schedulePopulateSemesterSelect();
  if (!semId) return;
  const term = schedulePopulateTermSelect(semId);
  schedulePopulatePreferenceControls(semId);
  const prefs = getSchedulePrefs(semId);
  const courses = scheduleCoursesForSemester(semId);
  const status = document.getElementById('schedule-status');
  const seq = ++scheduleRenderSeq;
  if (status) status.textContent = courses.length
    ? `Loading live section data for ${courses.length} course${courses.length === 1 ? '' : 's'}…`
    : 'No schedule-ready courses in this semester.';
  const sectionsByCode = await scheduleFetchSectionsFor(semId, term, courses, !!opts.force);
  if (seq !== scheduleRenderSeq) return;

  const selectedItems = scheduleSelectedItemsFor(semId, term, courses, sectionsByCode);
  const { blocks, conflicts } = detectScheduleConflicts(selectedItems);
  const unavailableBlocks = scheduleBlockedBlocks(prefs);
  const warnings = selectedScheduleWarnings(selectedItems, prefs);
  const postedCount = Object.values(sectionsByCode).reduce((sum, list) => sum + (list || []).length, 0);
  const seatFreshness = scheduleSeatFreshness(semId, term, courses, sectionsByCode);
  if (status) {
    const termPosted = schedulePostedTerms ? schedulePostedTerms.includes(String(term)) : false;
    status.innerHTML = `${postedCount} section${postedCount === 1 ? '' : 's'} loaded · ${scheduleEscape(seatFreshness.label).toLowerCase()}${termPosted ? '' : ' · selected term is not in the latest posted UMD term list'}.`;
  }
  renderScheduleSummary(courses, selectedItems, conflicts, warnings, term);
  renderScheduleReadinessMap(semId, term, courses, selectedItems, conflicts, warnings, sectionsByCode);
  renderScheduleWarnings(warnings);
  const timing = scheduleTimingFit(selectedItems, prefs, conflicts);
  renderScheduleFitPanel(selectedItems, prefs, conflicts);
  renderScheduleWorkloadPanel(courses, selectedItems, prefs, timing);
  renderScheduleOutputPanel(semId, term, courses, selectedItems, conflicts, warnings, prefs, sectionsByCode);
  renderScheduleUndo();
  renderScheduleAlternatives([]);
  renderWeekGrid([...unavailableBlocks, ...blocks], conflicts);
  renderSectionList(semId, term, courses, sectionsByCode, selectedItems, prefs);
}

async function autoPickScheduleSections() {
  const semId = scheduleCurrentSemId || scheduleDefaultSemesterId();
  const sem = getAllSemesters().find(s => s.id === semId);
  if (!sem) return;
  const term = (state.schedulePrefs && state.schedulePrefs[semId] && state.schedulePrefs[semId].term) || scheduleInferTermCode(sem);
  const prefs = getSchedulePrefs(semId);
  const courses = scheduleCoursesForSemester(semId);
  const sectionsByCode = await scheduleFetchSectionsFor(semId, term, courses);
  const currentItems = scheduleSelectedItemsFor(semId, term, courses, sectionsByCode);
  const candidate = buildScheduleCandidate(courses, sectionsByCode, prefs, 0, currentItems);
  const undoChanges = [];
  clearScheduleUndo();
  candidate.items.forEach(item => {
    const previous = getSelectedSection(semId, item.course.code);
    const change = scheduleSectionUndoChange(semId, item.course.code, previous, item.section);
    if (change) undoChanges.push(change);
    setSelectedSection(semId, item.course.code, item.section);
  });
  if (undoChanges.length) {
    registerScheduleUndo({
      type: 'schedule-auto-pick',
      semId,
      changes: undoChanges,
      termCount: 1,
      title: `Auto-picked ${undoChanges.length} section${undoChanges.length === 1 ? '' : 's'}`,
      detail: `Undo restores ${undoChanges.length} previous pick${undoChanges.length === 1 ? '' : 's'} for ${sem.name || semId}.`,
      undoTitle: 'Undid section auto-pick',
      undoDetail: `Restored previous section choices for ${undoChanges.length} auto-picked course${undoChanges.length === 1 ? '' : 's'}.`,
      undoMeta: 'Undo section auto-pick',
      undoToast: `Restored ${undoChanges.length} auto-picked section pick${undoChanges.length === 1 ? '' : 's'}.`,
    });
  }
  if (candidate.items.length) {
    recordPlanChange({
      type: 'auto-pick',
      source: 'Schedule',
      title: `Auto-picked ${candidate.items.length} sections`,
      detail: candidate.items.map(item => `${item.course.code} ${scheduleSectionShortLabel(item.section)}`).slice(0, 6).join(' · '),
      meta: `${scheduleTermLabel(term)}${candidate.skipped.length ? ` · ${candidate.skipped.length} unscheduled` : ''}`,
    }, { save: false });
  }
  saveState();
  renderSchedule();
  renderSemesters();
  const pinnedCount = candidate.items.filter(item => item.section.pinned).length;
  if (candidate.skipped.length) toastInfo(`Auto-picked ${candidate.items.length}; no posted sections yet for ${candidate.skipped.join(', ')}.`);
  else toastSuccess(`Auto-picked ${candidate.items.length} section${candidate.items.length === 1 ? '' : 's'}${pinnedCount ? ` while preserving ${pinnedCount} pinned` : ''}.`);
}

function clearScheduleSelections() {
  const semId = scheduleCurrentSemId || scheduleDefaultSemesterId();
  if (!semId) return;
  const sem = getAllSemesters().find(item => item.id === semId);
  const bucket = (state.selectedSections || {})[semId] || {};
  const undoChanges = Object.entries(bucket)
    .map(([key, section]) => scheduleSectionUndoChange(semId, section?.course || key, section, null))
    .filter(Boolean);
  if (!undoChanges.length) {
    if (typeof toastInfo === 'function') toastInfo('No section picks to clear.');
    return;
  }
  clearScheduleUndo();
  if ((state.selectedSections || {})[semId]) delete state.selectedSections[semId];
  registerScheduleUndo({
    type: 'clear-section-picks',
    semId,
    changes: undoChanges,
    termCount: 1,
    title: `Cleared ${undoChanges.length} section pick${undoChanges.length === 1 ? '' : 's'}`,
    detail: `Undo restores the cleared picks for ${sem?.name || semId}.`,
    undoTitle: 'Undid clear section picks',
    undoDetail: `Restored ${undoChanges.length} cleared section pick${undoChanges.length === 1 ? '' : 's'}.`,
    undoMeta: 'Undo clear picks',
    undoToast: `Restored ${undoChanges.length} cleared section pick${undoChanges.length === 1 ? '' : 's'}.`,
  });
  recordPlanChange({
    type: 'clear',
    source: 'Schedule',
    title: 'Cleared section picks',
    detail: `Removed ${undoChanges.length} saved section choice${undoChanges.length === 1 ? '' : 's'} for ${sem?.name || semId}.`,
    meta: 'Schedule builder',
  }, { save: false });
  saveState();
  renderSchedule();
  renderSemesters();
}

function applyBestSectionFromDecision(code, sectionId, action = 'top') {
  const semId = scheduleCurrentSemId || scheduleDefaultSemesterId();
  const term = (document.getElementById('schedule-term') || {}).value || '';
  if (!semId || !term || !code || !sectionId) return;
  const key = `${semId}:${term}:${normalizeCode(code)}`;
  const section = (scheduleSectionsCache[key] || []).find(s => s.section_id === sectionId);
  if (!section) {
    toastError('Could not find that posted section. Refresh sections and try again.');
    return;
  }
  const previous = getSelectedSection(semId, code);
  const previousSection = scheduleCloneSection(previous);
  const previousPinned = !!previous?.pinned;
  setSelectedSection(semId, code, section);
  registerScheduleUndo({
    type: 'best-section',
    semId,
    term,
    code,
    previousSection,
    previousPinned,
    nextSection: scheduleCloneSection(section),
  });
  const isBackup = action === 'backup';
  recordPlanChange({
    type: 'section-swap',
    source: 'Schedule',
    title: `Applied ${isBackup ? 'backup' : 'top'} section for ${code}`,
    detail: `${scheduleSectionShortLabel(previousSection)} changed to ${scheduleSectionShortLabel(section)}.`,
    meta: scheduleTermLabel(term),
  }, { save: false });
  saveState();
  renderSchedule();
  renderSemesters();
  toastSuccess(`Applied ${isBackup ? 'backup' : 'top'} section for ${code}. Use Undo to restore ${scheduleSectionShortLabel(previousSection)}.`);
}

function initScheduleEvents() {
  const semSel = document.getElementById('schedule-semester');
  const termSel = document.getElementById('schedule-term');
  const autoBtn = document.getElementById('schedule-auto');
  const altBtn = document.getElementById('schedule-alternatives-btn');
  const refreshBtn = document.getElementById('schedule-refresh');
  const clearBtn = document.getElementById('schedule-clear');
  const list = document.getElementById('schedule-section-list');
  const undoRoot = document.getElementById('schedule-undo');
  const alternativesRoot = document.getElementById('schedule-alternatives');
  const readinessMap = document.getElementById('schedule-readiness-map');
  const blockAddBtn = document.getElementById('schedule-block-add');
  const blockList = document.getElementById('schedule-block-list');

  if (semSel) semSel.addEventListener('change', () => {
    scheduleCurrentSemId = semSel.value;
    renderSchedule();
  });
  if (termSel) termSel.addEventListener('change', () => {
    const semId = scheduleCurrentSemId || scheduleDefaultSemesterId();
    clearScheduleUndo();
    setSchedulePrefs(semId, { term: termSel.value });
    if ((state.selectedSections || {})[semId]) delete state.selectedSections[semId];
    saveState();
    renderSchedule();
  });
  [
    'schedule-pref-earliest',
    'schedule-pref-latest',
    'schedule-pref-break',
    'schedule-pref-mode',
    'schedule-calendar-start',
    'schedule-calendar-end',
    'schedule-registration-date',
    'schedule-registration-time',
    'schedule-pref-campus-zone',
    'schedule-pref-commute-start',
    'schedule-pref-commute-end',
    'schedule-pref-location-weight',
  ].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('change', () => {
      const semId = scheduleCurrentSemId || scheduleDefaultSemesterId();
      const patch = {};
      if (id === 'schedule-pref-earliest') patch.earliest = el.value;
      if (id === 'schedule-pref-latest') patch.latest = el.value;
      if (id === 'schedule-pref-break') patch.minBreak = Number(el.value) || 0;
      if (id === 'schedule-pref-mode') patch.mode = el.value;
      if (id === 'schedule-calendar-start') patch.calendarStart = normalizeScheduleDate(el.value);
      if (id === 'schedule-calendar-end') patch.calendarEnd = normalizeScheduleDate(el.value);
      if (id === 'schedule-registration-date') patch.registrationDate = normalizeScheduleDate(el.value);
      if (id === 'schedule-registration-time') patch.registrationTime = normalizeScheduleTime(el.value);
      if (id === 'schedule-pref-campus-zone') patch.campusZone = el.value;
      if (id === 'schedule-pref-commute-start') patch.commuteStart = el.value;
      if (id === 'schedule-pref-commute-end') patch.commuteEnd = el.value;
      if (id === 'schedule-pref-location-weight') patch.locationWeight = el.value;
      setSchedulePrefs(semId, patch);
      saveState();
      renderSchedule();
    });
  });
  document.querySelectorAll('.schedule-day-prefs input[type="checkbox"]').forEach(input => {
    input.addEventListener('change', () => {
      const semId = scheduleCurrentSemId || scheduleDefaultSemesterId();
      const avoidDays = [...document.querySelectorAll('.schedule-day-prefs input[type="checkbox"]:checked')]
        .map(el => el.value);
      setSchedulePrefs(semId, { avoidDays });
      saveState();
      renderSchedule();
    });
  });
  if (autoBtn) autoBtn.addEventListener('click', autoPickScheduleSections);
  if (altBtn) altBtn.addEventListener('click', generateScheduleAlternatives);
  if (refreshBtn) refreshBtn.addEventListener('click', () => renderSchedule({ force: true }));
  if (clearBtn) clearBtn.addEventListener('click', clearScheduleSelections);
  if (blockAddBtn) blockAddBtn.addEventListener('click', addScheduleBlockedTime);
  if (blockList) blockList.addEventListener('click', e => {
    const btn = e.target.closest('[data-remove-block]');
    if (!btn) return;
    removeScheduleBlockedTime(btn.dataset.removeBlock);
  });
  if (undoRoot) undoRoot.addEventListener('click', e => {
    const undoBtn = e.target.closest('[data-schedule-undo]');
    if (undoBtn) {
      undoScheduleSectionChange();
      return;
    }
    const dismissUndo = e.target.closest('[data-schedule-undo-dismiss]');
    if (dismissUndo) clearScheduleUndo();
  });
  if (alternativesRoot) alternativesRoot.addEventListener('click', e => {
    const btn = e.target.closest('[data-alt-index]');
    if (!btn) return;
    applyScheduleAlternative(Number(btn.dataset.altIndex));
  });
  if (readinessMap) readinessMap.addEventListener('click', e => {
    const loadBtn = e.target.closest('[data-schedule-map-load]');
    if (loadBtn) {
      loadScheduleReadinessMapData();
      return;
    }
    const pickBtn = e.target.closest('[data-schedule-map-pick]');
    if (pickBtn) {
      autoPickScheduleReadinessMap();
      return;
    }
    const btn = e.target.closest('[data-schedule-jump-sem]');
    if (!btn) return;
    const semId = btn.dataset.scheduleJumpSem;
    if (!semId || semId === scheduleCurrentSemId) return;
    scheduleCurrentSemId = semId;
    renderSchedule();
    const sem = getAllSemesters().find(item => item.id === semId);
    if (typeof toastInfo === 'function') toastInfo(`Opened ${sem?.name || semId} in Schedule.`);
  });
  if (list) list.addEventListener('change', e => {
    if (!e.target.classList.contains('section-select')) return;
    const semId = scheduleCurrentSemId || scheduleDefaultSemesterId();
    const term = (document.getElementById('schedule-term') || {}).value || '';
    const code = e.target.dataset.code;
    const key = `${semId}:${term}:${normalizeCode(code)}`;
    const section = (scheduleSectionsCache[key] || []).find(s => s.section_id === e.target.value);
    const previous = getSelectedSection(semId, code);
    const undoChange = scheduleSectionUndoChange(semId, code, previous, section || null);
    clearScheduleUndo();
    setSelectedSection(semId, code, section || null);
    if (undoChange) {
      registerScheduleUndo({
        type: 'section-pick',
        semId,
        term,
        code,
        previousSection: undoChange.previousSection,
        previousPinned: undoChange.previousPinned,
        nextSection: undoChange.nextSection,
      });
    }
    recordPlanChange({
      type: 'section-pick',
      source: 'Schedule',
      title: section ? `Picked ${code} ${scheduleSectionShortLabel(section)}` : `Cleared ${code} section`,
      detail: section
        ? `${code} changed from ${scheduleSectionShortLabel(previous)} to ${scheduleSectionShortLabel(section)}.`
        : `${code} changed from ${scheduleSectionShortLabel(previous)} to no section.`,
      meta: scheduleTermLabel(term),
    }, { save: false });
    saveState();
    renderSchedule();
    renderSemesters();
  });
  if (list) list.addEventListener('click', e => {
    const bestBtn = e.target.closest('[data-apply-best-section]');
    if (bestBtn) {
      applyBestSectionFromDecision(bestBtn.dataset.code, bestBtn.dataset.applyBestSection, bestBtn.dataset.sectionAction || 'top');
      return;
    }
    const pinBtn = e.target.closest('[data-pin-code]');
    if (!pinBtn) return;
    const semId = scheduleCurrentSemId || scheduleDefaultSemesterId();
    const code = pinBtn.dataset.pinCode;
    const next = !isSelectedSectionPinned(semId, code);
    if (!setSelectedSectionPinned(semId, code, next)) return;
    recordPlanChange({
      type: 'section-pick',
      source: 'Schedule',
      title: `${next ? 'Pinned' : 'Unpinned'} ${code}`,
      detail: `${code} ${next ? 'will be preserved' : 'can be replaced'} by auto-pick.`,
      meta: 'Schedule builder',
    }, { save: false });
    saveState();
    renderSchedule();
    renderSemesters();
    toastInfo(next ? `${code} pinned for auto-pick.` : `${code} unpinned.`);
  });
}
