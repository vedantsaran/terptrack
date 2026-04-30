'use strict';
/* ============================================================
   FIRST-RUN ONBOARDING WIZARD
   ============================================================ */

let onboardStep = 0;
const ONBOARD_STEPS = ['major', 'year', 'transfer', 'finish'];

function shouldShowOnboarding() {
  if (state.onboardingComplete) return false;
  // Skip if user already has progress
  if (Object.keys(state.courses || {}).length > 0) return false;
  return true;
}

function startOnboarding() {
  onboardStep = 0;
  // Pre-populate major options
  const sel = document.getElementById('ob-major');
  sel.innerHTML = '';
  listMajors().forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = m.name;
    sel.appendChild(opt);
  });
  const customOpt = document.createElement('option');
  customOpt.value = '__custom__';
  customOpt.textContent = '+ My major isn\'t listed (build custom)';
  sel.appendChild(customOpt);
  sel.value = 'CE';

  // Default year start
  const now = new Date();
  document.getElementById('ob-start-year').value = now.getMonth() < 6 ? now.getFullYear() : now.getFullYear() + 1;
  document.getElementById('ob-current-year').value = '1';
  document.getElementById('ob-transfer-codes').value = '';

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
  const majorId = document.getElementById('ob-major').value;
  const startYear = parseInt(document.getElementById('ob-start-year').value) || new Date().getFullYear();
  const currentYear = parseInt(document.getElementById('ob-current-year').value) || 1;
  const transferRaw = document.getElementById('ob-transfer-codes').value;

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
    await applyMajorTemplate(majorId, { startTerm: 'Fall', startYear: startYear });
  } catch (e) {
    console.error('Major template apply failed:', e);
  }

  // Mark earlier years as transfer-passed (empty grade) so the user can fill in details later
  if (currentYear > 1) {
    const sems = getAllSemesters();
    const semsToMark = sems.slice(0, (currentYear - 1) * 2);
    semsToMark.forEach(sem => {
      (sem.courses || []).forEach(c => {
        if (!state.courses[c.code]) state.courses[c.code] = { status: 'passed', grade: '' };
      });
    });
  }

  // Bulk-import transfer credits
  const transferCodes = transferRaw.split(/[\s,;\n]+/).map(s => s.trim()).filter(Boolean);
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
