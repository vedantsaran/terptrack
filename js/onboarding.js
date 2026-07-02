'use strict';
/* ============================================================
   FIRST-RUN ONBOARDING WIZARD
   ============================================================ */

let onboardStep = 0;
let onboardPreviewSeq = 0;
const ONBOARD_STEPS = ['major', 'profile', 'year', 'schedule', 'transfer', 'finish'];
const ONBOARD_CLOCK_OPTIONS = ['', '08:00', '09:00', '10:00', '11:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
const ONBOARD_MODE_OPTIONS = ['balanced', 'compact', 'open-seats', 'mornings', 'afternoons'];
const ONBOARD_DAY_OPTIONS = ['M', 'Tu', 'W', 'Th', 'F'];
const PRIOR_CREDIT_SOURCE_CHECKED = 'June 30, 2026';
const PRIOR_CREDIT_SOURCE_LINKS = [
  { label: 'UMD Prior Learning Credit', url: 'https://registrar.umd.edu/transfer-credit/prior-learning-credit' },
  { label: 'AP Chart 2023-2026', url: 'https://registrar.umd.edu/sites/default/files/2024-08/AP%20Chart%202023-2026.pdf' },
  { label: 'IB Chart 2023-2026', url: 'https://registrar.umd.edu/sites/default/files/2024-08/IB%20Chart%202023-2026.pdf' },
  { label: 'Transfer Course Database', url: 'https://registrar.umd.edu/transfer-credit/transfer-course-database' },
  { label: 'Search transfer equivalencies', url: 'https://app.transfercredit.umd.edu/' },
];
const PRIOR_CREDIT_SOURCE_META = {
  AP: {
    label: 'AP chart 2023-2026',
    note: 'verify by exam year',
  },
  IB: {
    label: 'IB chart 2023-2026',
    note: 'verify by exam date',
  },
};
const PRIOR_CREDIT_CATEGORY_LABELS = {
  'gened-fsaw': 'FSAW',
  'gened-fspw': 'FSPW',
  'gened-fsma': 'FSMA',
  'gened-fsar': 'FSAR',
  'gened-fsoc': 'FSOC',
  'gened-dshs': 'DSHS',
  'gened-dshu': 'DSHU',
  'gened-dsns': 'DSNS',
  'gened-dsnl': 'DSNL',
  'gened-dssp': 'DSSP',
  'major-support': 'Major support',
};
const ONBOARD_PRIOR_CREDIT_PRESETS = [
  {
    id: 'ap-calc-ab-4',
    source: 'AP',
    label: 'AP Calc AB 4+',
    detail: 'MATH 140',
    courses: [
      { code: 'MATH 140', title: 'Calculus I', cr: 4, category: 'gened-fsma', categories: ['gened-fsma'], kind: 'core' },
    ],
  },
  {
    id: 'ap-calc-bc-4',
    source: 'AP',
    label: 'AP Calc BC 4+',
    detail: 'MATH 140 + 141',
    courses: [
      { code: 'MATH 140', title: 'Calculus I', cr: 4, category: 'gened-fsma', categories: ['gened-fsma'], kind: 'core' },
      { code: 'MATH 141', title: 'Calculus II', cr: 4, category: 'major-support', kind: 'core' },
    ],
  },
  {
    id: 'ap-stat-4',
    source: 'AP',
    label: 'AP Statistics 4+',
    detail: 'STAT 100',
    courses: [
      { code: 'STAT 100', title: 'Elementary Statistics and Probability', cr: 3, category: 'gened-fsma', categories: ['gened-fsma', 'gened-fsar'], kind: 'gened' },
    ],
  },
  {
    id: 'ap-csa-5',
    source: 'AP',
    label: 'AP Computer Science A 5',
    detail: 'CMSC 131',
    courses: [
      { code: 'CMSC 131', title: 'Object-Oriented Programming I', cr: 4, category: 'major-support', kind: 'core' },
    ],
  },
  {
    id: 'ap-english-lang-4',
    source: 'AP',
    label: 'AP English Lang 4+',
    detail: 'FSAW credit',
    courses: [
      { code: 'AP FSAW Credit', title: 'Academic Writing prior-learning credit', cr: 3, category: 'gened-fsaw', categories: ['gened-fsaw'], kind: 'gened' },
    ],
  },
  {
    id: 'ap-biology-4',
    source: 'AP',
    label: 'AP Biology 4+',
    detail: 'BSCI 160/161/170/171',
    courses: [
      { code: 'BSCI 160', title: 'Principles of Ecology and Evolution', cr: 3, category: 'gened-dsnl', categories: ['gened-dsnl'], kind: 'gened' },
      { code: 'BSCI 161', title: 'Principles of Ecology and Evolution Lab', cr: 1, category: 'gened-dsnl', categories: ['gened-dsnl'], kind: 'gened' },
      { code: 'BSCI 170', title: 'Principles of Molecular and Cellular Biology', cr: 3, category: 'major-support', kind: 'core' },
      { code: 'BSCI 171', title: 'Principles of Molecular and Cellular Biology Lab', cr: 1, category: 'major-support', kind: 'core' },
    ],
  },
  {
    id: 'ap-chemistry-4',
    source: 'AP',
    label: 'AP Chemistry 4',
    detail: 'CHEM 131 + 132',
    courses: [
      { code: 'CHEM 131', title: 'Chemistry I - Fundamentals of General Chemistry', cr: 3, category: 'gened-dsnl', categories: ['gened-dsnl'], kind: 'gened' },
      { code: 'CHEM 132', title: 'Chemistry I Laboratory', cr: 1, category: 'gened-dsnl', categories: ['gened-dsnl'], kind: 'gened' },
    ],
  },
  {
    id: 'ap-chemistry-5',
    source: 'AP',
    label: 'AP Chemistry 5',
    detail: 'CHEM 131/132/271',
    courses: [
      { code: 'CHEM 131', title: 'Chemistry I - Fundamentals of General Chemistry', cr: 3, category: 'gened-dsnl', categories: ['gened-dsnl'], kind: 'gened' },
      { code: 'CHEM 132', title: 'Chemistry I Laboratory', cr: 1, category: 'gened-dsnl', categories: ['gened-dsnl'], kind: 'gened' },
      { code: 'CHEM 271', title: 'General Chemistry and Energetics', cr: 3, category: 'major-support', kind: 'core' },
    ],
  },
  {
    id: 'ap-physics-c-mech-4',
    source: 'AP',
    label: 'AP Physics C Mech 4+',
    detail: 'PHYS 161 + 261',
    courses: [
      { code: 'PHYS 161', title: 'General Physics: Mechanics and Particle Dynamics', cr: 3, category: 'gened-dsns', categories: ['gened-dsns'], kind: 'gened' },
      { code: 'PHYS 261', title: 'General Physics: Mechanics Laboratory', cr: 1, category: 'gened-dsnl', categories: ['gened-dsnl'], kind: 'gened' },
    ],
  },
  {
    id: 'ap-micro-4',
    source: 'AP',
    label: 'AP Microeconomics 4+',
    detail: 'ECON 200',
    courses: [
      { code: 'ECON 200', title: 'Principles of Microeconomics', cr: 3, category: 'gened-dshs', categories: ['gened-dshs'], kind: 'gened' },
    ],
  },
  {
    id: 'ap-macro-4',
    source: 'AP',
    label: 'AP Macroeconomics 4+',
    detail: 'ECON 201',
    courses: [
      { code: 'ECON 201', title: 'Principles of Macroeconomics', cr: 3, category: 'gened-dshs', categories: ['gened-dshs'], kind: 'gened' },
    ],
  },
  {
    id: 'ap-us-gov-4',
    source: 'AP',
    label: 'AP U.S. Gov 4+',
    detail: 'GVPT 170',
    courses: [
      { code: 'GVPT 170', title: 'American Government', cr: 3, category: 'gened-dshs', categories: ['gened-dshs'], kind: 'gened' },
    ],
  },
  {
    id: 'ap-psych-4',
    source: 'AP',
    label: 'AP Psychology 4+',
    detail: 'PSYC 100',
    courses: [
      { code: 'PSYC 100', title: 'Introduction to Psychology', cr: 3, category: 'gened-dshs', categories: ['gened-dshs'], kind: 'gened' },
    ],
  },
  {
    id: 'ib-math-hl-5',
    source: 'IB',
    label: 'IB Math HL 5+',
    detail: 'MATH 140 + STAT 100',
    courses: [
      { code: 'MATH 140', title: 'Calculus I', cr: 4, category: 'gened-fsma', categories: ['gened-fsma'], kind: 'core' },
      { code: 'STAT 100', title: 'Elementary Statistics and Probability', cr: 3, category: 'gened-fsma', categories: ['gened-fsma', 'gened-fsar'], kind: 'gened' },
    ],
  },
  {
    id: 'ib-econ-hl-5',
    source: 'IB',
    label: 'IB Economics HL 5+',
    detail: 'ECON 200 + 201',
    courses: [
      { code: 'ECON 200', title: 'Principles of Microeconomics', cr: 3, category: 'gened-dshs', categories: ['gened-dshs'], kind: 'gened' },
      { code: 'ECON 201', title: 'Principles of Macroeconomics', cr: 3, category: 'gened-dshs', categories: ['gened-dshs'], kind: 'gened' },
    ],
  },
  {
    id: 'ib-biology-hl-6',
    source: 'IB',
    label: 'IB Biology HL 6+',
    detail: 'BSCI 160/161/170/171',
    courses: [
      { code: 'BSCI 160', title: 'Principles of Ecology and Evolution', cr: 3, category: 'gened-dsnl', categories: ['gened-dsnl'], kind: 'gened' },
      { code: 'BSCI 161', title: 'Principles of Ecology and Evolution Lab', cr: 1, category: 'gened-dsnl', categories: ['gened-dsnl'], kind: 'gened' },
      { code: 'BSCI 170', title: 'Principles of Molecular and Cellular Biology', cr: 3, category: 'major-support', kind: 'core' },
      { code: 'BSCI 171', title: 'Principles of Molecular and Cellular Biology Lab', cr: 1, category: 'major-support', kind: 'core' },
    ],
  },
  {
    id: 'ib-chemistry-hl-5',
    source: 'IB',
    label: 'IB Chemistry HL 5',
    detail: 'CHEM 131 + 132',
    courses: [
      { code: 'CHEM 131', title: 'Chemistry I - Fundamentals of General Chemistry', cr: 3, category: 'gened-dsnl', categories: ['gened-dsnl'], kind: 'gened' },
      { code: 'CHEM 132', title: 'Chemistry I Laboratory', cr: 1, category: 'gened-dsnl', categories: ['gened-dsnl'], kind: 'gened' },
    ],
  },
  {
    id: 'ib-physics-hl-5',
    source: 'IB',
    label: 'IB Physics HL 5+',
    detail: 'PHYS 121 + 122',
    courses: [
      { code: 'PHYS 121', title: 'Fundamentals of Physics I', cr: 4, category: 'gened-dsnl', categories: ['gened-dsnl'], kind: 'gened' },
      { code: 'PHYS 122', title: 'Fundamentals of Physics II', cr: 4, category: 'major-support', kind: 'core' },
    ],
  },
  {
    id: 'ib-psych-6',
    source: 'IB',
    label: 'IB Psychology 6+',
    detail: 'PSYC 100',
    courses: [
      { code: 'PSYC 100', title: 'Introduction to Psychology', cr: 3, category: 'gened-dshs', categories: ['gened-dshs'], kind: 'gened' },
    ],
  },
  {
    id: 'ib-philosophy-5',
    source: 'IB',
    label: 'IB Philosophy 5+',
    detail: 'PHIL 100',
    courses: [
      { code: 'PHIL 100', title: 'Introduction to Philosophy', cr: 3, category: 'gened-dshu', categories: ['gened-dshu'], kind: 'gened' },
    ],
  },
];

function onboardEscape(value) {
  if (typeof settingsHtml === 'function') return settingsHtml(value);
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[ch]));
}

function onboardPriorSourceNoticeHtml() {
  const links = PRIOR_CREDIT_SOURCE_LINKS.map(link => `
    <a href="${onboardEscape(link.url)}" target="_blank" rel="noopener noreferrer">${onboardEscape(link.label)}</a>
  `).join('');
  return `
    <div class="prior-source-notice">
      <strong>Official source check</strong>
      <p>Presets are planning shortcuts, not a transcript decision. UMD says AP, IB, and other prior-learning credit is based on the exam year, departmental approval, official score reports, duplicate-credit rules, and current Registrar charts. Last checked ${onboardEscape(PRIOR_CREDIT_SOURCE_CHECKED)}.</p>
      <div class="prior-source-links">${links}</div>
    </div>
  `;
}

function onboardPriorPresetSourceNote(preset) {
  const source = String(preset?.source || 'Credit').toUpperCase();
  const meta = PRIOR_CREDIT_SOURCE_META[source] || { label: `${source} source`, note: 'verify official equivalency' };
  const courseCount = (preset?.courses || []).length;
  const courseText = `${courseCount || 1} UMD course${courseCount === 1 ? '' : 's'}`;
  return `${meta.label} · ${courseText} · ${meta.note}`;
}

function onboardPriorPresetLinks(preset) {
  const source = String(preset?.source || '').toUpperCase();
  return PRIOR_CREDIT_SOURCE_LINKS.filter(link => {
    if (/AP Chart/.test(link.label)) return source === 'AP';
    if (/IB Chart/.test(link.label)) return source === 'IB';
    return /Prior Learning|Transfer Course Database|Search transfer/.test(link.label);
  });
}

function onboardPriorCourseCategoryLabel(course) {
  const categories = Array.from(new Set([
    ...(Array.isArray(course?.categories) ? course.categories : []),
    course?.category,
  ].filter(Boolean)));
  if (!categories.length) return 'Elective credit';
  return categories
    .map(category => PRIOR_CREDIT_CATEGORY_LABELS[category] || String(category).replace(/^gened-/, '').toUpperCase())
    .join(' + ');
}

function onboardPriorDetailHtml(preset) {
  if (!preset) return '';
  const source = String(preset.source || 'Credit').toUpperCase();
  const meta = PRIOR_CREDIT_SOURCE_META[source] || { label: `${source} source`, note: 'verify official equivalency' };
  const courses = preset.courses || [];
  const totalCredits = courses.reduce((sum, course) => sum + (Number(course.cr) || 0), 0);
  const courseRows = courses.map(course => `
    <li>
      <strong>${onboardEscape(onboardPriorDisplayCode(course.code))}</strong>
      <span>${onboardEscape(course.title || onboardPriorDisplayCode(course.code))}</span>
      <small>${Number(course.cr) || 0} cr · ${onboardEscape(onboardPriorCourseCategoryLabel(course))}</small>
    </li>
  `).join('');
  const links = onboardPriorPresetLinks(preset).map(link => `
    <a href="${onboardEscape(link.url)}" target="_blank" rel="noopener noreferrer">${onboardEscape(link.label)}</a>
  `).join('');
  return `
    <div class="prior-detail-drawer" data-prior-detail-active="${onboardEscape(preset.id)}">
      <div class="prior-detail-head">
        <span>Verification drawer</span>
        <button class="btn small" type="button" data-prior-detail-close>Close</button>
      </div>
      <h4>${onboardEscape(preset.label)}</h4>
      <p>${onboardEscape(preset.detail)} · ${onboardEscape(meta.label)} · last checked ${onboardEscape(PRIOR_CREDIT_SOURCE_CHECKED)}.</p>
      <div class="prior-detail-stats">
        <span><strong>${courses.length || 1}</strong>UMD course${courses.length === 1 ? '' : 's'}</span>
        <span><strong>${totalCredits}</strong>planned credit${totalCredits === 1 ? '' : 's'}</span>
        <span><strong>${onboardEscape(source || 'Credit')}</strong>${onboardEscape(meta.note)}</span>
      </div>
      <ul class="prior-detail-courses">${courseRows}</ul>
      <div class="prior-detail-check">
        <strong>Before relying on it</strong>
        <p>Match the chart to the student's exam year or exam date, confirm duplicate-credit rules, and use official score reports or transfer records for the final transcript decision.</p>
      </div>
      <div class="prior-source-links">${links}</div>
    </div>
  `;
}

function onboardPriorChipHtml(preset, options = {}) {
  const checked = !!options.checked;
  const extraClass = options.extraClass || '';
  return `
    <label class="onboard-prior-chip ${extraClass} ${checked ? 'selected' : ''}">
      <input type="checkbox" data-prior-id="${onboardEscape(preset.id)}" ${checked ? 'checked' : ''}>
      <span>
        <strong>${onboardEscape(preset.label)}</strong>
        <small>${onboardEscape(preset.detail)}</small>
        <small class="prior-chip-source">${onboardEscape(onboardPriorPresetSourceNote(preset))}</small>
      </span>
      <button class="prior-chip-detail" type="button" data-prior-detail="${onboardEscape(preset.id)}" aria-label="Show verification details for ${onboardEscape(preset.label)}">Details</button>
    </label>
  `;
}

function onboardRenderPriorSourceNotice(id) {
  const root = document.getElementById(id);
  if (root) root.innerHTML = onboardPriorSourceNoticeHtml();
}

function onboardShowPriorPresetDetail(id, rootId = 'ob-prior-detail') {
  const root = document.getElementById(rootId);
  const preset = onboardPriorPresetById(id);
  if (!root || !preset) return false;
  root.innerHTML = onboardPriorDetailHtml(preset);
  root.hidden = false;
  root.dataset.activePriorDetail = preset.id;
  if (typeof root.scrollIntoView === 'function') root.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  return true;
}

function onboardHidePriorPresetDetail(rootId = 'ob-prior-detail') {
  const root = document.getElementById(rootId);
  if (!root) return false;
  root.hidden = true;
  root.innerHTML = '';
  delete root.dataset.activePriorDetail;
  return true;
}

function onboardBindPriorDetailControls(grid, rootId) {
  if (!grid) return;
  grid.querySelectorAll('[data-prior-detail]').forEach(button => {
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      onboardShowPriorPresetDetail(button.dataset.priorDetail, rootId);
    });
  });
  const detail = document.getElementById(rootId);
  if (detail && !detail.dataset.priorDetailBound) {
    detail.dataset.priorDetailBound = '1';
    detail.addEventListener('click', event => {
      if (event.target.closest('[data-prior-detail-close]')) {
        event.preventDefault();
        onboardHidePriorPresetDetail(rootId);
      }
    });
  }
}

function onboardNumber(id, fallback) {
  const value = Number(document.getElementById(id)?.value);
  return Number.isFinite(value) ? value : fallback;
}

function onboardTargetSemesterCount(startYear, gradTerm, gradYear) {
  const start = Number.isFinite(Number(startYear)) ? Number(startYear) : new Date().getFullYear();
  const grad = Number.isFinite(Number(gradYear)) ? Number(gradYear) : start + 4;
  const term = gradTerm === 'Fall' ? 'Fall' : 'Spring';
  const finalIndex = term === 'Fall'
    ? (grad - start) * 2
    : (grad - start) * 2 - 1;
  const count = Number.isFinite(finalIndex) ? finalIndex + 1 : 8;
  return Math.max(2, Math.min(12, count));
}

function onboardNormalizeSchedulePrefs(value = {}) {
  const earliest = ONBOARD_CLOCK_OPTIONS.includes(value.earliest) ? value.earliest : '';
  const latest = ONBOARD_CLOCK_OPTIONS.includes(value.latest) ? value.latest : '';
  const minBreak = Math.max(0, Math.min(60, Number(value.minBreak) || 0));
  const mode = ONBOARD_MODE_OPTIONS.includes(value.mode) ? value.mode : 'balanced';
  const avoidDays = Array.from(new Set(Array.isArray(value.avoidDays) ? value.avoidDays : []))
    .filter(day => ONBOARD_DAY_OPTIONS.includes(day));
  return { earliest, latest, minBreak, mode, avoidDays };
}

function onboardPriorPresetById(id) {
  return ONBOARD_PRIOR_CREDIT_PRESETS.find(preset => preset.id === id) || null;
}

function onboardPriorDisplayCode(code) {
  const raw = String(code || '').trim();
  if (/^[A-Z]{3,4}\s*\d{3}[A-Z]?$/i.test(raw) || /^[A-Z]{3,4}\d{3}[A-Z]?$/i.test(raw)) {
    return displayCode(raw);
  }
  return raw.replace(/\s+/g, ' ');
}

function onboardPriorKey(code) {
  const display = onboardPriorDisplayCode(code);
  return /^[A-Z]{3,4}\s*\d{3}[A-Z]?$/i.test(display) ? normalizeCode(display) : display.toUpperCase();
}

function onboardNormalizePriorCourse(course, sourceLabel = 'Prior credit') {
  const code = onboardPriorDisplayCode(course?.code || '');
  const categories = Array.from(new Set(Array.isArray(course?.categories) ? course.categories : []))
    .filter(cat => String(cat || '').startsWith('gened-'));
  const category = String(course?.category || categories[0] || 'major-support');
  return {
    code,
    title: String(course?.title || code),
    cr: Number(course?.cr) || 3,
    prereqs: [],
    coreqs: [],
    kind: course?.kind || (category.startsWith('gened-') ? 'gened' : 'core'),
    category,
    categories: categories.length ? categories : (category.startsWith('gened-') ? [category] : []),
    note: String(course?.note || `${sourceLabel}. Verify official UMD prior-learning credit before registration.`),
    semId: '',
    isCustom: true,
    isPriorCredit: true,
    _needsLookup: !!(course && course._needsLookup),
  };
}

function onboardSelectedPriorIds() {
  return [...document.querySelectorAll('#ob-prior-grid input[type="checkbox"]:checked')]
    .map(input => input.dataset.priorId)
    .filter(Boolean);
}

function onboardResolvePriorCredits(rawCodes = '', presetIds = []) {
  const byKey = new Map();
  const selectedPresets = Array.from(new Set(presetIds || []))
    .map(onboardPriorPresetById)
    .filter(Boolean);
  const addCourse = (course, sourceLabel) => {
    const normalized = onboardNormalizePriorCourse(course, sourceLabel);
    if (!normalized.code) return;
    const key = onboardPriorKey(normalized.code);
    const existing = byKey.get(key);
    if (existing) {
      existing.sources = Array.from(new Set([...(existing.sources || []), sourceLabel]));
      existing.note = `${existing.sources.join(' + ')}. Verify official UMD prior-learning credit before registration.`;
      const mergedCategories = Array.from(new Set([...(existing.categories || []), ...(normalized.categories || [])]));
      existing.categories = mergedCategories;
      if (!existing.category.startsWith('gened-') && normalized.category.startsWith('gened-')) existing.category = normalized.category;
      return;
    }
    byKey.set(key, { ...normalized, sources: [sourceLabel] });
  };
  selectedPresets.forEach(preset => {
    (preset.courses || []).forEach(course => addCourse(course, preset.label));
  });
  String(rawCodes || '')
    .split(/[\s,;\n]+/)
    .map(s => s.trim())
    .filter(Boolean)
    .forEach(code => addCourse({
      code,
      title: onboardPriorDisplayCode(code),
      cr: 3,
      category: 'major-support',
      kind: 'core',
      _needsLookup: true,
      note: 'Manual prior credit entry. Verify official UMD transfer equivalency before registration.',
    }, 'Manual entry'));
  const overlaps = Array.from(byKey.values())
    .filter(course => (course.sources || []).length > 1)
    .map(course => ({
      code: course.code,
      sources: (course.sources || []).slice(),
    }));
  const courses = Array.from(byKey.values()).map(course => {
    const clean = { ...course };
    delete clean.sources;
    return clean;
  });
  const totalCredits = courses.reduce((sum, course) => sum + (Number(course.cr) || 0), 0);
  return {
    presets: selectedPresets,
    courses,
    totalCredits,
    overlaps,
  };
}

function onboardPriorSummaryText(resolved) {
  const count = (resolved?.courses || []).length;
  if (!count) return 'No prior credits selected.';
  const credits = Number(resolved.totalCredits) || 0;
  const codes = resolved.courses.map(course => course.code).slice(0, 6).join(', ');
  const extra = count > 6 ? ` +${count - 6} more` : '';
  return `${count} course${count === 1 ? '' : 's'} · ${credits} credit${credits === 1 ? '' : 's'} · ${codes}${extra}`;
}

function onboardInferPlanStartYear(fallback = new Date().getFullYear()) {
  const appState = typeof state !== 'undefined' ? state : {};
  const settings = typeof getSettings === 'function' ? getSettings() : {};
  const candidates = [
    appState?.activeSchedule?.[0]?.name,
    appState?.activeSchedule?.[0]?.year,
    settings?.eyebrow,
  ];
  for (const value of candidates) {
    const match = String(value || '').match(/\b(20\d{2})\b/);
    if (match) return Number(match[1]);
  }
  return Number(fallback) || new Date().getFullYear();
}

function onboardPriorSourceNames(resolved) {
  return Array.from(new Set((resolved?.presets || [])
    .map(preset => String(preset.source || '').toUpperCase())
    .filter(Boolean)));
}

function onboardPriorManualCount(resolved) {
  return (resolved?.courses || []).filter(course => course?._needsLookup).length;
}

function onboardPriorCourseGenEdTags(course) {
  return Array.from(new Set([
    ...(Array.isArray(course?.categories) ? course.categories : []),
    course?.category,
  ].filter(Boolean)))
    .filter(category => String(category).startsWith('gened-'))
    .map(category => onboardPriorCourseCategoryLabel({ category }));
}

function onboardPriorPlanMatches(resolved) {
  const courses = resolved?.courses || [];
  if (typeof findCourse !== 'function') return { planned: [], outside: courses.slice() };
  const planned = [];
  const outside = [];
  courses.forEach(course => {
    if (findCourse(course.code)) planned.push(course);
    else outside.push(course);
  });
  return { planned, outside };
}

function onboardPriorFormatList(values = [], limit = 4) {
  const clean = values.map(value => String(value || '').trim()).filter(Boolean);
  if (!clean.length) return '';
  return clean.slice(0, limit).join(', ') + (clean.length > limit ? ` +${clean.length - limit} more` : '');
}

function onboardPriorOverlapSummaries(resolved) {
  return (resolved?.overlaps || [])
    .map(overlap => {
      const sources = onboardPriorFormatList(overlap.sources || [], 3);
      return sources ? `${overlap.code} via ${sources}` : overlap.code;
    })
    .filter(Boolean);
}

function onboardPriorExistingAttemptConflicts(resolved) {
  const courses = resolved?.courses || [];
  if (typeof getCourseState !== 'function') return [];
  const conflictStatuses = new Set(['passed', 'in-progress', 'failed']);
  return courses.map(course => {
    const planCourse = typeof findCourse === 'function' ? findCourse(course.code) : null;
    const code = planCourse?.code || course.code;
    const courseState = getCourseState(code);
    const status = String(courseState?.status || '');
    if (!conflictStatuses.has(status)) return null;
    return {
      code,
      status,
      grade: courseState?.grade || '',
    };
  }).filter(Boolean);
}

function onboardPriorCreditReviewEvidence(resolved) {
  return {
    overlaps: (resolved?.overlaps || []).map(overlap => ({
      code: onboardPriorDisplayCode(overlap.code || ''),
      sources: Array.from(new Set(overlap.sources || [])).filter(Boolean),
    })).filter(overlap => overlap.code && overlap.sources.length),
    existingAttempts: onboardPriorExistingAttemptConflicts(resolved).map(item => ({
      code: onboardPriorDisplayCode(item.code || ''),
      status: item.status || '',
      grade: item.grade || '',
    })).filter(item => item.code && item.status),
  };
}

function onboardPriorReviewItems(resolved, opts = {}) {
  const courses = resolved?.courses || [];
  if (!courses.length) return [];
  const startYear = Number(opts.startYear) || onboardInferPlanStartYear();
  const sources = onboardPriorSourceNames(resolved);
  const manualCount = onboardPriorManualCount(resolved);
  const { planned, outside } = onboardPriorPlanMatches(resolved);
  const genEdTags = Array.from(new Set(courses.flatMap(onboardPriorCourseGenEdTags))).sort();
  const overlapSummaries = onboardPriorOverlapSummaries(resolved);
  const existingAttempts = onboardPriorExistingAttemptConflicts(resolved);
  const items = [];

  const sourceLabels = sources.length ? sources.join(' + ') : (manualCount ? 'transfer database' : 'prior-credit');
  const chartOutsideRange = startYear < 2023 || startYear > 2026;
  items.push({
    level: chartOutsideRange ? 'warn' : 'info',
    title: 'Chart year check',
    body: chartOutsideRange
      ? `Your plan starts in Fall ${startYear}. These presets cite the 2023-2026 ${sourceLabels} chart window, so verify the current Registrar chart before relying on them.`
      : `Your plan starts in Fall ${startYear}. Match each AP exam year or IB exam date against the 2023-2026 ${sourceLabels} chart before applying credits.`,
  });

  if (sources.includes('AP') || sources.includes('IB')) {
    const parts = [];
    if (sources.includes('AP')) parts.push('AP score report');
    if (sources.includes('IB')) parts.push('IB transcript or score report');
    items.push({
      level: 'warn',
      title: 'Official score report',
      body: `Confirm ${parts.join(' and ')} delivery to UMD before treating these courses as transcript credit.`,
    });
  }

  if (manualCount) {
    items.push({
      level: 'warn',
      title: 'Manual course lookup',
      body: `${manualCount} typed course${manualCount === 1 ? '' : 's'} should be checked in the Transfer Course Database for exact UMD equivalency and credit amount.`,
    });
  }

  if (overlapSummaries.length) {
    items.push({
      level: 'warn',
      title: 'Selected-credit overlap',
      body: `${onboardPriorFormatList(overlapSummaries, 3)} ${overlapSummaries.length === 1 ? 'maps' : 'map'} to the same UMD course more than once. Keep one official source per UMD course unless the Registrar or advisor confirms duplicate credit is allowed.`,
    });
  }

  if (existingAttempts.length) {
    const summaries = existingAttempts.map(item => `${onboardPriorDisplayCode(item.code)} is already marked ${item.status}${item.grade ? ` (${item.grade})` : ''}`);
    items.push({
      level: 'warn',
      title: 'Existing attempt conflict',
      body: `${onboardPriorFormatList(summaries, 3)}. Applying prior credit will replace that course status with transfer credit, so confirm the UMD attempt and prior-credit source should not both count.`,
    });
  }

  const plannedSentence = planned.length === 1
    ? '1 selected credit already matches a planned course and will be marked transfer.'
    : `${planned.length} selected credits already match planned courses and will be marked transfer.`;
  const outsideSentence = outside.length === 1
    ? '1 outside-plan credit will be added to Transfer / Outside Plan.'
    : `${outside.length} outside-plan credits will be added to Transfer / Outside Plan.`;
  items.push({
    level: outside.length ? 'info' : 'ok',
    title: 'Plan placement',
    body: `${plannedSentence} ${outsideSentence}`,
  });

  if (genEdTags.length) {
    items.push({
      level: 'info',
      title: 'Requirement coverage',
      body: `Potential GenEd coverage: ${genEdTags.slice(0, 8).join(', ')}${genEdTags.length > 8 ? ` +${genEdTags.length - 8} more` : ''}. Degree Audit will still verify the full rule set after applying.`,
    });
  }

  items.push({
    level: 'warn',
    title: 'Duplicate-credit review',
    body: 'Check duplicate-credit restrictions with an advisor before replacing a planned UMD course or counting both exam and transfer credit for the same content.',
  });

  return items;
}

function onboardPriorReviewChecklistHtml(resolved, opts = {}) {
  const items = onboardPriorReviewItems(resolved, opts);
  if (!items.length) return '';
  return `
    <div class="prior-review-checklist">
      <div class="prior-review-head">
        <strong>Prior Credit Review</strong>
        <span>${items.length} checks before applying</span>
      </div>
      <div class="prior-review-grid">
        ${items.map(item => `
          <div class="prior-review-item ${onboardEscape(item.level)}">
            <b>${onboardEscape(item.level === 'ok' ? 'Ready' : item.level === 'warn' ? 'Verify' : 'Review')}</b>
            <div>
              <strong>${onboardEscape(item.title)}</strong>
              <p>${onboardEscape(item.body)}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function onboardRenderPriorReview(id, resolved, opts = {}) {
  const root = document.getElementById(id);
  if (!root) return;
  const html = onboardPriorReviewChecklistHtml(resolved, opts);
  root.innerHTML = html;
  root.hidden = !html;
}

function onboardClonePlain(value) {
  if (value == null) return value;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return Array.isArray(value) ? value.slice() : { ...value };
  }
}

function onboardCourseStateSnapshot(code) {
  const key = typeof courseStateKey === 'function' ? courseStateKey(code) : String(code || '');
  const courses = state.courses || {};
  const had = Object.prototype.hasOwnProperty.call(courses, key);
  return { key, had, value: had ? onboardClonePlain(courses[key]) : null };
}

function onboardRefreshPriorCreditSummary() {
  const summary = document.getElementById('ob-prior-summary');
  if (!summary) return;
  const resolved = onboardResolvePriorCredits(
    document.getElementById('ob-transfer-codes')?.value || '',
    onboardSelectedPriorIds(),
  );
  summary.textContent = onboardPriorSummaryText(resolved);
  onboardRenderPriorReview('ob-prior-review', resolved, {
    startYear: onboardNumber('ob-start-year', onboardInferPlanStartYear()),
    context: 'onboarding',
  });
  document.querySelectorAll('.onboard-prior-chip').forEach(chip => {
    const input = chip.querySelector('input[type="checkbox"]');
    chip.classList.toggle('selected', !!input?.checked);
  });
}

function onboardBindPriorReviewTimelineControls() {
  ['ob-start-year', 'ob-grad-year', 'ob-grad-term', 'ob-current-year'].forEach(id => {
    const input = document.getElementById(id);
    if (input && !input.dataset.priorReviewBound) {
      input.dataset.priorReviewBound = '1';
      input.addEventListener('input', onboardRefreshPriorCreditSummary);
      input.addEventListener('change', onboardRefreshPriorCreditSummary);
    }
  });
}

function onboardRenderPriorCreditControls() {
  const root = document.getElementById('ob-prior-grid');
  if (!root) return;
  root.innerHTML = ONBOARD_PRIOR_CREDIT_PRESETS.map(preset => onboardPriorChipHtml(preset)).join('');
  root.querySelectorAll('input[type="checkbox"]').forEach(input => {
    input.addEventListener('change', onboardRefreshPriorCreditSummary);
  });
  onboardBindPriorDetailControls(root, 'ob-prior-detail');
  const raw = document.getElementById('ob-transfer-codes');
  if (raw && !raw.dataset.priorBound) {
    raw.dataset.priorBound = 'true';
    raw.addEventListener('input', onboardRefreshPriorCreditSummary);
  }
  onboardRenderPriorSourceNotice('ob-prior-source-note');
  onboardRefreshPriorCreditSummary();
}

async function onboardApplyPriorCredits(setup) {
  const resolved = onboardResolvePriorCredits(setup.transferRaw, setup.priorCreditIds);
  const priorCreditReview = onboardPriorCreditReviewEvidence(resolved);
  const applied = [];
  const added = [];
  const undoEntries = [];
  state.customCourses = state.customCourses || [];
  for (const course of resolved.courses) {
    let finalCourse = { ...course };
    if (finalCourse._needsLookup && /^[A-Z]{3,4}\s*\d{3}[A-Z]?$/i.test(finalCourse.code)) {
      const fetched = await fetchCourseFull(finalCourse.code).catch(() => null);
      if (fetched) {
        finalCourse = {
          ...finalCourse,
          ...fetched,
          code: fetched.code,
          semId: '',
          isCustom: true,
          isPriorCredit: true,
          note: finalCourse.note,
        };
      }
    }
    delete finalCourse._needsLookup;
    const code = onboardPriorDisplayCode(finalCourse.code);
    finalCourse.code = code;
    const previousState = onboardCourseStateSnapshot(code);
    const existing = findCourse(code);
    let addedCourse = null;
    if (!existing) {
      state.customCourses.push(finalCourse);
      added.push(code);
      addedCourse = onboardClonePlain(finalCourse);
    }
    const stateKey = previousState.key || code;
    state.courses[stateKey] = { status: 'transfer', grade: '' };
    const appliedState = onboardCourseStateSnapshot(code);
    applied.push(code);
    undoEntries.push({
      code,
      hadCourseState: previousState.had,
      courseState: previousState.value,
      appliedCourseState: appliedState.value,
      addedCustomCourse: !!addedCourse,
      customCourse: addedCourse,
    });
  }
  if (applied.length && typeof recordPlanChange === 'function') {
    recordPlanChange({
      type: 'prior-credit',
      source: setup.source || 'onboarding',
      title: `Applied ${applied.length} prior-credit course${applied.length === 1 ? '' : 's'}`,
      detail: applied.slice(0, 8).join(', ') + (applied.length > 8 ? ` +${applied.length - 8} more` : ''),
      meta: added.length ? `${added.length} added outside plan` : 'All matched existing plan courses',
      undo: {
        kind: 'prior-credit',
        source: setup.source || 'onboarding',
        entries: undoEntries,
        review: priorCreditReview,
      },
    }, { save: false });
  }
  return { ...resolved, applied, added };
}

function onboardReadSchedulePrefs() {
  return onboardNormalizeSchedulePrefs({
    earliest: document.getElementById('ob-pref-earliest')?.value || '',
    latest: document.getElementById('ob-pref-latest')?.value || '',
    minBreak: document.getElementById('ob-pref-break')?.value || 15,
    mode: document.getElementById('ob-pref-mode')?.value || 'balanced',
    avoidDays: [...document.querySelectorAll('.onboard-day-prefs input[type="checkbox"]:checked')]
      .map(input => input.value),
  });
}

function onboardReadSetup() {
  const startYear = onboardNumber('ob-start-year', new Date().getFullYear());
  const gradTerm = document.getElementById('ob-grad-term')?.value === 'Fall' ? 'Fall' : 'Spring';
  const gradYear = onboardNumber('ob-grad-year', startYear + 4);
  const catalogYear = typeof normalizeCatalogYear === 'function'
    ? normalizeCatalogYear(document.getElementById('ob-catalog-year')?.value || getSettings().catalogYear)
    : (document.getElementById('ob-catalog-year')?.value || getSettings().catalogYear || '2026-2027');
  const creditCap = Math.max(15, Math.min(18, onboardNumber('ob-credit-cap', 17)));
  return {
    majorId: document.getElementById('ob-major')?.value || 'CE',
    startYear,
    catalogYear,
    currentYear: Math.max(1, Math.min(4, onboardNumber('ob-current-year', 1))),
    gradTerm,
    gradYear,
    numSemesters: onboardTargetSemesterCount(startYear, gradTerm, gradYear),
    creditCap,
    transferRaw: document.getElementById('ob-transfer-codes')?.value || '',
    priorCreditIds: typeof document.querySelectorAll === 'function' ? onboardSelectedPriorIds() : [],
    profilePrefs: typeof readProfileForm === 'function' ? readProfileForm('ob') : getProfilePrefs(),
    schedulePrefs: onboardReadSchedulePrefs(),
  };
}

function onboardScheduleSummary(prefs) {
  const parts = [];
  if (prefs.earliest) parts.push(`after ${prefs.earliest}`);
  if (prefs.latest) parts.push(`before ${prefs.latest}`);
  if (Number(prefs.minBreak) > 0) parts.push(`${prefs.minBreak} min breaks`);
  if (prefs.avoidDays.length) parts.push(`avoid ${prefs.avoidDays.join('/')}`);
  parts.push((prefs.mode || 'balanced').replace('-', ' '));
  return parts.join(' · ');
}

function onboardPreviewSummaryHtml(setup) {
  const prior = onboardResolvePriorCredits(setup.transferRaw, setup.priorCreditIds);
  return `
    <div class="onboard-preview-summary">
      <span><strong>Timeline</strong>${onboardEscape(`Fall ${setup.startYear} to ${setup.gradTerm} ${setup.gradYear} · ${setup.numSemesters} terms · ${setup.creditCap} credit cap`)}</span>
      <span><strong>Catalog year</strong>${onboardEscape(setup.catalogYear || getSettings().catalogYear)}</span>
      <span><strong>Schedule defaults</strong>${onboardEscape(onboardScheduleSummary(setup.schedulePrefs))}</span>
      <span><strong>Prior credit</strong>${onboardEscape(onboardPriorSummaryText(prior))}</span>
    </div>
  `;
}

function onboardApplySchedulePrefs(prefs) {
  const clean = onboardNormalizeSchedulePrefs(prefs);
  const sems = typeof getAllSemesters === 'function' ? getAllSemesters() : [];
  state.schedulePrefs = state.schedulePrefs || {};
  sems.forEach(sem => {
    const existing = state.schedulePrefs[sem.id] || {};
    const inferredTerm = typeof scheduleInferTermCode === 'function' ? scheduleInferTermCode(sem) : existing.term;
    state.schedulePrefs[sem.id] = {
      ...existing,
      ...clean,
      term: existing.term || inferredTerm || '',
    };
  });
}

async function renderOnboardingPreview() {
  const root = document.getElementById('ob-plan-preview');
  if (!root) return;
  const setup = onboardReadSetup();
  const tpl = getMajorTemplate(setup.majorId);
  root.hidden = false;
  const seq = ++onboardPreviewSeq;
  root.className = 'auto-plan-review onboard-plan-preview loading';
  if (setup.majorId === '__custom__' || !tpl) {
    root.innerHTML = `
      <div class="auto-plan-review-head">
        <div>
          <strong>Custom major setup</strong>
          <span>Finish will open the major builder so you can paste or import your requirements.</span>
        </div>
      </div>
      ${onboardPreviewSummaryHtml(setup)}
    `;
    return;
  }
  root.innerHTML = `
    <div class="auto-plan-review-head">
      <div>
        <strong>Building setup preview</strong>
        <span>Using your major, interests, timeline, and schedule preferences.</span>
      </div>
    </div>
    ${onboardPreviewSummaryHtml(setup)}
  `;
  if (typeof buildAutoPlanPreview !== 'function' || typeof autoPlanReviewHtml !== 'function') return;
  try {
    const review = await buildAutoPlanPreview(setup.majorId, {
      profilePrefs: setup.profilePrefs,
      startTerm: 'Fall',
      startYear: setup.startYear,
      catalogYear: setup.catalogYear,
      numSemesters: setup.numSemesters,
      creditCap: setup.creditCap,
      noFetch: true,
      force: true,
    });
    if (seq !== onboardPreviewSeq) return;
    root.className = `auto-plan-review onboard-plan-preview ${review.kind === 'curated' ? 'curated' : 'generated'}`;
    root.innerHTML = onboardPreviewSummaryHtml(setup) + autoPlanReviewHtml(review, { actions: false });
  } catch (error) {
    if (seq !== onboardPreviewSeq) return;
    root.className = 'auto-plan-review onboard-plan-preview';
    root.innerHTML = `
      <div class="auto-plan-warning">Could not build setup preview: ${onboardEscape(error.message || error)}</div>
      ${onboardPreviewSummaryHtml(setup)}
    `;
  }
}

function shouldShowOnboarding() {
  if (state.onboardingComplete) return false;
  // Skip if user already has progress
  if (Object.keys(state.courses || {}).length > 0) return false;
  return true;
}

function startOnboarding() {
  onboardStep = 0;
  // Pre-populate major options grouped by college
  const sel = document.getElementById('ob-major');
  sel.innerHTML = '';
  groupedMajors().forEach(g => {
    const og = document.createElement('optgroup');
    og.label = g.label;
    g.majors.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = majorDisplayLabel(m);
      og.appendChild(opt);
    });
    sel.appendChild(og);
  });
  const customOg = document.createElement('optgroup');
  customOg.label = 'Other';
  const customOpt = document.createElement('option');
  customOpt.value = '__custom__';
  customOpt.textContent = '+ My major isn\'t listed (build custom)';
  customOg.appendChild(customOpt);
  sel.appendChild(customOg);
  sel.value = 'CE';

  // Default year start
  const now = new Date();
  const startYear = now.getMonth() < 6 ? now.getFullYear() : now.getFullYear() + 1;
  document.getElementById('ob-start-year').value = startYear;
  if (typeof populateCatalogYearSelect === 'function') populateCatalogYearSelect('ob-catalog-year', getSettings().catalogYear);
  document.getElementById('ob-grad-term').value = 'Spring';
  document.getElementById('ob-grad-year').value = startYear + 4;
  document.getElementById('ob-current-year').value = '1';
  document.getElementById('ob-credit-cap').value = '17';
  document.getElementById('ob-pref-earliest').value = '';
  document.getElementById('ob-pref-latest').value = '';
  document.getElementById('ob-pref-break').value = '15';
  document.getElementById('ob-pref-mode').value = 'balanced';
  document.querySelectorAll('.onboard-day-prefs input[type="checkbox"]').forEach(input => { input.checked = false; });
  document.getElementById('ob-transfer-codes').value = '';
  onboardRenderPriorCreditControls();
  onboardBindPriorReviewTimelineControls();
  if (typeof writeProfileForm === 'function') writeProfileForm('ob', getProfilePrefs());

  document.getElementById('onboard-modal').classList.add('open');
  showOnboardStep(0);
}

function showOnboardStep(i) {
  onboardStep = i;
  ONBOARD_STEPS.forEach((s, idx) => {
    const el = document.getElementById('ob-step-' + s);
    if (el) el.style.display = idx === i ? 'block' : 'none';
  });
  // Progress dots
  const dots = document.getElementById('ob-dots');
  if (dots) dots.innerHTML = ONBOARD_STEPS.map((_, idx) =>
    `<span class="ob-dot ${idx <= i ? 'active' : ''}"></span>`
  ).join('');
  // Buttons
  document.getElementById('ob-back').style.visibility = i === 0 ? 'hidden' : 'visible';
  document.getElementById('ob-next').textContent = i === ONBOARD_STEPS.length - 1 ? 'Finish' : 'Next →';
  if (ONBOARD_STEPS[i] === 'transfer') onboardRefreshPriorCreditSummary();
  if (ONBOARD_STEPS[i] === 'finish') renderOnboardingPreview();
}

function onboardNext() {
  if (onboardStep < ONBOARD_STEPS.length - 1) {
    showOnboardStep(onboardStep + 1);
  } else {
    finishOnboarding();
  }
}
function onboardBack() {
  if (onboardStep > 0) showOnboardStep(onboardStep - 1);
}
function skipOnboarding() {
  state.onboardingComplete = true;
  saveState();
  document.getElementById('onboard-modal').classList.remove('open');
}

async function finishOnboarding() {
  const setup = onboardReadSetup();
  const majorId = setup.majorId;
  state.profilePrefs = setup.profilePrefs;

  document.getElementById('ob-finish-status').textContent = 'Setting up your plan…';

  if (majorId === '__custom__') {
    // Close onboarding, open builder; user finishes setup there
    state.onboardingComplete = true;
    saveState();
    document.getElementById('onboard-modal').classList.remove('open');
    openMajorBuilder();
    return;
  }

  try {
    await applyMajorTemplate(majorId, {
      startTerm: 'Fall',
      startYear: setup.startYear,
      catalogYear: setup.catalogYear,
      numSemesters: setup.numSemesters,
      creditCap: setup.creditCap,
      statusId: 'ob-finish-status',
    });
    onboardApplySchedulePrefs(setup.schedulePrefs);
  } catch (e) {
    console.error('Major template apply failed:', e);
    const status = document.getElementById('ob-finish-status');
    if (status) {
      status.style.color = 'var(--red)';
      status.textContent = 'Could not set up plan: ' + (e.message || e);
    }
    if (typeof toastError === 'function') toastError('Could not set up plan: ' + (e.message || e));
    return;
  }

  // Mark earlier years as transfer-passed (empty grade) so the user can fill in details later
  if (setup.currentYear > 1) {
    const sems = getAllSemesters();
    const semsToMark = sems.slice(0, (setup.currentYear - 1) * 2);
    semsToMark.forEach(sem => {
      (sem.courses || []).forEach(c => {
        if (!state.courses[c.code]) state.courses[c.code] = { status: 'passed', grade: '' };
      });
    });
  }

  await onboardApplyPriorCredits(setup);

  state.onboardingComplete = true;
  saveState();
  applySettings();
  render();
  document.getElementById('onboard-modal').classList.remove('open');
}
