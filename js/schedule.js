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
};
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
const scheduleSectionsCache = {};

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

function getSchedulePrefs(semId) {
  const saved = (state.schedulePrefs || {})[semId] || {};
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
  if (earliest) earliest.value = prefs.earliest || '';
  if (latest) latest.value = prefs.latest || '';
  if (minBreak) minBreak.value = String(prefs.minBreak ?? DEFAULT_SCHEDULE_PREFS.minBreak);
  if (mode) mode.value = prefs.mode || DEFAULT_SCHEDULE_PREFS.mode;
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
  if (!scheduleUndoAction || scheduleUndoAction.semId !== currentSemId) {
    root.innerHTML = '';
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
  return section ? `<span class="schedule-chip">${scheduleEscape(sectionSummary(section))}</span>` : '';
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

function renderSectionDecision(sections, picked, prefs, course, selectedItems = []) {
  if (!picked || !(sections || []).length) return '';
  const info = sectionRankInfo(sections, picked, prefs, course);
  const best = info.best && info.best.section_id !== picked.section_id ? info.best : null;
  const bestSafety = best ? sectionSwapSafety(best, course, selectedItems, prefs) : null;
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
      ${best ? `<div class="section-decision-action">
        ${bestSafety.ok
          ? `<button class="btn small" type="button" data-apply-best-section="${scheduleEscape(best.section_id)}" data-code="${scheduleEscape(course.code)}">Apply top section</button>`
          : `<span>Top section not auto-applied: ${scheduleEscape(bestSafety.reasons.join(' · ') || 'not conflict-safe')}</span>`}
      </div>` : ''}
    </div>
  `;
}

function selectedScheduleWarnings(selectedItems, prefs) {
  const warnings = [];
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
    const key = `${semId}:${term}:${normalizeCode(course.code)}`;
    if (!force && scheduleSectionsCache[key]) {
      out[normalizeCode(course.code)] = scheduleSectionsCache[key];
      return;
    }
    const sections = await umdioFetchSections(course.code, term);
    scheduleSectionsCache[key] = sections;
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

function scheduleRecentChanges(limit = 5) {
  return typeof recentPlanChanges === 'function' ? recentPlanChanges().slice(0, limit) : [];
}

function scheduleChangeIcon(type) {
  if (type === 'term-move') return 'Move';
  if (type === 'section-swap') return 'Swap';
  if (type === 'auto-pick') return 'Auto';
  if (type === 'section-pick') return 'Pick';
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

function scheduleAdvisorLiveLinkNoticeHtml() {
  return `
    <div class="schedule-advisor-live-note">
      <strong>Live TerpTrack links</strong>
      <p>Action links reopen this exact plan in the TerpTrack app and depend on the same browser profile/local plan state. If this packet is opened on another device or profile, open/import the matching plan there first, or use the Next action and Browse target text manually.</p>
    </div>
  `;
}

function scheduleAdvisorLiveLinkNoticeText() {
  return [
    '',
    'Live TerpTrack links:',
    '- Action links reopen this exact plan in the TerpTrack app and depend on the same browser profile/local plan state.',
    '- If this packet is opened on another device or profile, open/import the matching plan there first, or use the Next action and Browse target text manually.',
  ];
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
      const note = course.note ? `<em>${scheduleEscape(course.note)}</em>` : '';
      const reasonLine = filterResult.reasons.length ? `<em>${scheduleEscape(filterResult.reasons.join(' · '))}</em>` : '';
      return `
        <li class="schedule-advisor-course">
          <div>
            <strong>${scheduleEscape(course.code)}</strong>
            <span>${scheduleEscape(course.title || '')}</span>
            ${sectionLine}
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

function scheduleAdvisorText(sem, term, courses, selectedItems, conflicts, warnings, prefs, scheduleText, advisorFilter = getScheduleAdvisorFilter(), unscheduled = [], options = getScheduleOutputOptions()) {
  const stats = scheduleAdvisorStats();
  const filter = normalizeScheduleAdvisorFilter(advisorFilter);
  const filterDef = scheduleAdvisorFilterDef(filter);
  const outputOptions = normalizeScheduleOutputOptions(options);
  const auditIssues = outputOptions.auditIssues ? scheduleAdvisorAuditIssues(6) : [];
  const timing = scheduleTimingFit(selectedItems, prefs, conflicts);
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
    `Plan term: ${sem?.name || 'Selected semester'} / ${scheduleTermLabel(term)}`,
    `Advisor view: ${filterDef.label} - ${filterDef.description}`,
    `Review status: ${scheduleAdvisorReviewLabel(courses, selectedItems, conflicts, warnings)}`,
    `Credits: ${stats.earnedCredits} earned / ${stats.plannedCredits} planned / ${stats.totalRequired} required`,
    `GPA: ${stats.gpa}`,
    `Goal courses: ${stats.goalDone}/${stats.goalTotal}`,
  ];
  if (outputOptions.preferences) lines.push(`Preferences: ${schedulePreferenceSummary(prefs)}`);
  lines.push('', ...scheduleAdvisorTimingDiagnosticsText(timing));
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
      const reasonText = filterResult.reasons.length ? `; review: ${filterResult.reasons.join(' / ')}` : '';
      courseLines.push(`- ${course.code} ${course.title || ''} (${Number(course.cr) || 0} cr; ${scheduleAdvisorCourseType(course)}; ${status}${sectionText}${reasonText})`);
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
    .schedule-advisor-view-note{border:1px solid #d8cec0;border-radius:8px;background:#fff;padding:9px 10px;color:#5d5962;font-size:12px;margin:10px 0}
    .schedule-advisor-live-note{border:1px solid #9fb4c8;border-radius:8px;background:#eef4fa;padding:9px 10px;color:#241f1f;font-size:12px;margin:10px 0}
    .schedule-advisor-live-note strong{display:block;color:#2e5c8b;font-size:10px;letter-spacing:.06em;text-transform:uppercase}
    .schedule-advisor-live-note p{margin:3px 0 0;color:#5d5962;line-height:1.4}
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
    @media (max-width:720px){.schedule-advisor-grid,.schedule-advisor-diagnostic-metrics{grid-template-columns:repeat(2,1fr)}.schedule-advisor-diagnostic-notes{grid-template-columns:1fr}.schedule-advisor-audit-row{grid-template-columns:1fr;gap:3px}}
    @media print{body{padding:0}.schedule-output-panel{max-width:none}.schedule-print-sheet,.schedule-advisor-packet{border:none;padding:0}.schedule-print-sheet{break-after:page}}
  `;
}

function scheduleAdvisorPacketHtml(sem, term, courses, selectedItems, conflicts, warnings, prefs, unscheduled, totalOpenSeats, advisorFilter = getScheduleAdvisorFilter(), changes = scheduleRecentChanges(), options = getScheduleOutputOptions()) {
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
  return `
    <article class="schedule-advisor-packet" id="schedule-advisor-packet">
      <div class="schedule-advisor-head">
        <div>
          <h3>Advisor Packet</h3>
          <span>${scheduleEscape(getSettings().programName || 'UMD degree plan')} - generated ${scheduleEscape(generated)}</span>
        </div>
        <div class="schedule-advisor-flags">
          <span>${scheduleEscape(label)}</span>
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
        <span>${stats.remainingCredits} remaining planned credits</span>
        <span>${stats.genEdCredits} GenEd credits in plan</span>
        <span>${stats.goalDone}/${stats.goalTotal} goal courses complete</span>
        <span>GPA ${scheduleEscape(stats.gpa)}</span>
        <span>${totalOpenSeats} open seats in picked sections</span>
        <span>${plan.shownCourses}/${plan.totalCourses} courses shown</span>
        <span>${plan.shownCredits}/${plan.totalCredits} credits shown</span>
        ${outputOptions.unscheduled ? (unscheduled.length ? `<span>${unscheduled.length} unscheduled course${unscheduled.length === 1 ? '' : 's'}</span>` : '<span>All current-term courses scheduled</span>') : ''}
      </div>
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

function buildScheduleOutputText(sem, term, courses, selectedItems, conflicts, warnings, prefs, changes = scheduleRecentChanges(), options = getScheduleOutputOptions()) {
  const outputOptions = normalizeScheduleOutputOptions(options);
  const selectedCodes = new Set(selectedItems.map(item => normalizeCode(item.course.code)));
  const unscheduled = courses.filter(course => !selectedCodes.has(normalizeCode(course.code)));
  const timing = scheduleTimingFit(selectedItems, prefs, conflicts);
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
  lines.push('', 'Picked sections:');

  if (!selectedItems.length) lines.push('- No picked sections yet.');
  selectedItems
    .slice()
    .sort((a, b) => a.course.code.localeCompare(b.course.code))
    .forEach(item => {
      const risk = sectionSeatRisk(item.section);
      lines.push(`- ${item.course.code} ${item.course.title || ''}`);
      lines.push(`  Section: ${item.section.number || item.section.section_id || 'TBA'}`);
      lines.push(`  Instructors: ${scheduleInstructorLine(item.section)}`);
      lines.push(`  Meetings: ${scheduleSectionMeetingLines(item.section).join('; ')}`);
      lines.push(`  Seats: ${risk.detail}`);
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

function buildScheduleOutput(semId, term, courses, selectedItems, conflicts, warnings, prefs) {
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
  const changes = outputOptions.recentChanges ? scheduleRecentChanges() : [];
  const text = buildScheduleOutputText(sem, term, courses, selectedItems, conflicts, warnings, prefs, changes, outputOptions);
  const courseRows = selectedItems
    .slice()
    .sort((a, b) => a.course.code.localeCompare(b.course.code))
    .map(item => {
      const risk = sectionSeatRisk(item.section);
      return `
        <tr>
          <td><strong>${scheduleEscape(item.course.code)}</strong><span>${scheduleEscape(item.course.title || '')}</span></td>
          <td>${scheduleEscape(item.section.number || item.section.section_id || 'TBA')}</td>
          <td>${scheduleEscape(scheduleSectionMeetingLines(item.section).join(' / '))}</td>
          <td>${scheduleEscape(scheduleInstructorLine(item.section))}</td>
          <td>${scheduleEscape(risk.detail)}</td>
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
      ${renderScheduleOutputWeek(blocks)}
      <table class="schedule-output-table">
        <thead><tr><th>Course</th><th>Section</th><th>Meetings</th><th>Instructor</th><th>Seats</th></tr></thead>
        <tbody>${courseRows || '<tr><td colspan="5">No picked sections yet.</td></tr>'}</tbody>
      </table>
      ${outputOptions.unscheduled && unscheduled.length ? `<div class="schedule-output-list"><strong>Unscheduled</strong>${unscheduled.map(course => `<span>${scheduleEscape(course.code)} ${scheduleEscape(course.title || '')}</span>`).join('')}</div>` : ''}
      ${outputOptions.warnings && warnings.length ? `<div class="schedule-output-list warn"><strong>Warnings</strong>${warnings.slice(0, 8).map(warning => `<span>${scheduleEscape(warning)}</span>`).join('')}</div>` : ''}
      ${scheduleChangeDigestHtml(changes, 'Schedule summary')}
    </article>
  `;
  const advisorHtml = scheduleAdvisorPacketHtml(sem, term, courses, selectedItems, conflicts, warnings, prefs, unscheduled, totalOpenSeats, advisorFilter, changes, outputOptions);
  const advisorTitle = `Terp Track Advisor Packet - ${getSettings().programName || 'UMD degree plan'}`;
  const advisorText = scheduleAdvisorText(sem, term, courses, selectedItems, conflicts, warnings, prefs, text, advisorFilter, unscheduled, outputOptions);

  return {
    text,
    filename: scheduleOutputFilename(term),
    html: scheduleHtml,
    advisorHtml,
    advisorText,
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

function renderScheduleOutputPanel(semId, term, courses, selectedItems, conflicts, warnings, prefs) {
  const root = document.getElementById('schedule-output');
  if (!root) return;
  scheduleOutputCache = buildScheduleOutput(semId, term, courses, selectedItems, conflicts, warnings, prefs);
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

if (typeof window !== 'undefined') {
  window.copyScheduleOutputSummary = copyScheduleOutputSummary;
  window.downloadScheduleOutputSummary = downloadScheduleOutputSummary;
  window.downloadScheduleAdvisorPacket = downloadScheduleAdvisorPacket;
  window.printScheduleOutputSummary = printScheduleOutputSummary;
  window.printScheduleAdvisorPacket = printScheduleAdvisorPacket;
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
  const courses = scheduleCoursesForSemester(semId);
  const prefs = getSchedulePrefs(semId);
  const altCodes = new Set(alt.items.map(item => normalizeCode(item.course.code)));
  const bucket = scheduleSelectionBucket(semId);
  const timing = alt.timing || scheduleTimingFit(alt.items, prefs, alt.conflicts);
  const comparison = scheduleAlternativeComparison(alt, alt.compareTo, prefs);
  const courseLine = alt.items
    .map(item => `${item.course.code} ${item.section.number || ''}`.trim())
    .join(' · ');
  clearScheduleUndo();
  courses.forEach(course => {
    const key = normalizeCode(course.code);
    if (!altCodes.has(key) && !bucket[key]?.pinned) delete bucket[key];
  });
  alt.items.forEach(item => setSelectedSection(semId, item.course.code, item.section));
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
  if (status) {
    const termPosted = schedulePostedTerms ? schedulePostedTerms.includes(String(term)) : false;
    status.innerHTML = `${postedCount} section${postedCount === 1 ? '' : 's'} loaded${termPosted ? '' : ' · selected term is not in the latest posted UMD term list'}.`;
  }
  renderScheduleSummary(courses, selectedItems, conflicts, warnings, term);
  renderScheduleWarnings(warnings);
  renderScheduleFitPanel(selectedItems, prefs, conflicts);
  renderScheduleOutputPanel(semId, term, courses, selectedItems, conflicts, warnings, prefs);
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
  clearScheduleUndo();
  candidate.items.forEach(item => setSelectedSection(semId, item.course.code, item.section));
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
  clearScheduleUndo();
  if ((state.selectedSections || {})[semId]) delete state.selectedSections[semId];
  recordPlanChange({
    type: 'clear',
    source: 'Schedule',
    title: 'Cleared section picks',
    detail: `Removed saved section choices for ${getAllSemesters().find(sem => sem.id === semId)?.name || semId}.`,
    meta: 'Schedule builder',
  }, { save: false });
  saveState();
  renderSchedule();
  renderSemesters();
}

function applyBestSectionFromDecision(code, sectionId) {
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
  recordPlanChange({
    type: 'section-swap',
    source: 'Schedule',
    title: `Applied top section for ${code}`,
    detail: `${scheduleSectionShortLabel(previousSection)} changed to ${scheduleSectionShortLabel(section)}.`,
    meta: scheduleTermLabel(term),
  }, { save: false });
  saveState();
  renderSchedule();
  renderSemesters();
  toastSuccess(`Applied top section for ${code}. Use Undo to restore ${scheduleSectionShortLabel(previousSection)}.`);
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
  if (list) list.addEventListener('change', e => {
    if (!e.target.classList.contains('section-select')) return;
    const semId = scheduleCurrentSemId || scheduleDefaultSemesterId();
    const term = (document.getElementById('schedule-term') || {}).value || '';
    const code = e.target.dataset.code;
    const key = `${semId}:${term}:${normalizeCode(code)}`;
    const section = (scheduleSectionsCache[key] || []).find(s => s.section_id === e.target.value);
    const previous = getSelectedSection(semId, code);
    clearScheduleUndo();
    setSelectedSection(semId, code, section || null);
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
      applyBestSectionFromDecision(bestBtn.dataset.code, bestBtn.dataset.applyBestSection);
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
