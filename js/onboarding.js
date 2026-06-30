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
  const creditCap = Math.max(15, Math.min(18, onboardNumber('ob-credit-cap', 17)));
  return {
    majorId: document.getElementById('ob-major')?.value || 'CE',
    startYear,
    currentYear: Math.max(1, Math.min(4, onboardNumber('ob-current-year', 1))),
    gradTerm,
    gradYear,
    numSemesters: onboardTargetSemesterCount(startYear, gradTerm, gradYear),
    creditCap,
    transferRaw: document.getElementById('ob-transfer-codes')?.value || '',
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
  return `
    <div class="onboard-preview-summary">
      <span><strong>Timeline</strong>${onboardEscape(`Fall ${setup.startYear} to ${setup.gradTerm} ${setup.gradYear} · ${setup.numSemesters} terms · ${setup.creditCap} credit cap`)}</span>
      <span><strong>Schedule defaults</strong>${onboardEscape(onboardScheduleSummary(setup.schedulePrefs))}</span>
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

  // Bulk-import transfer credits
  const transferCodes = setup.transferRaw.split(/[\s,;\n]+/).map(s => s.trim()).filter(Boolean);
  if (transferCodes.length) {
    for (const code of transferCodes) {
      const display = displayCode(code);
      // If course already in plan, mark transfer; otherwise add as custom + mark
      if (!findCourse(display)) {
        const f = await fetchCourseFull(code).catch(() => null);
        const obj = f
          ? { code: f.code, title: f.title, cr: f.cr, prereqs: [], coreqs: [], kind: 'core', category: 'major-support', semId: '', isCustom: true }
          : { code: display, title: display, cr: 3, prereqs: [], coreqs: [], kind: 'core', category: 'major-support', semId: '', isCustom: true };
        state.customCourses.push(obj);
      }
      state.courses[display] = { status: 'transfer', grade: '' };
    }
  }

  state.onboardingComplete = true;
  saveState();
  applySettings();
  render();
  document.getElementById('onboard-modal').classList.remove('open');
}
