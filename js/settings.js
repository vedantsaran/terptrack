'use strict';
/* ============================================================
   SETTINGS
   ============================================================ */
function populateMajorSelect() {
  const sel = document.getElementById('set-major');
  if (!sel) return;
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
  sel.value = state.majorId || 'CE';
  sel.onchange = () => {
    renderMajorSelectNote(sel.value);
    renderAutoPlanReview(sel.value);
  };
  renderMajorSelectNote(sel.value);
}

function renderMajorSelectNote(majorId) {
  const note = document.getElementById('set-major-note');
  const tpl = getMajorTemplate(majorId);
  if (!note) return;
  if (!tpl) {
    note.textContent = '';
    return;
  }
  const baked = isMajorFullyBaked(tpl);
  const badge = baked
    ? '<span style="color:var(--green);font-weight:600">★ Curated 4-year schedule</span>'
    : '<span style="color:var(--amber);font-weight:600">✱ Auto-generated full 4-year draft</span>';
  note.innerHTML = `${badge} · ${settingsHtml(tpl.notes || '')}`;
}

let autoPlanReviewSeq = 0;
let autoPlanReviewTimer = null;
const GENERATED_TEMPLATE_AUDIT = Object.freeze({
  checkedAt: 'June 30, 2026',
  seed: 'pass85-all-final',
  source: 'PlanetTerp',
  verifiedSchedules: 50,
  failedSchedules: 0,
  command: 'node scripts/verify-random-schedules.js --all --keep-going --seed pass85-all-final',
});

function settingsHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[ch]));
}

function autoPlanReviewStat(label, value, detail) {
  return `
    <div class="auto-plan-stat">
      <strong>${settingsHtml(value)}</strong>
      <span>${settingsHtml(label)}</span>
      ${detail ? `<small>${settingsHtml(detail)}</small>` : ''}
    </div>
  `;
}

function generatedTemplateFreshnessSummary(review) {
  const majors = typeof listMajors === 'function'
    ? listMajors().filter(major => (
        major
        && !major.isCustom
        && typeof isMajorFullyBaked === 'function'
        && typeof majorAllCodes === 'function'
        && !isMajorFullyBaked(major)
        && majorAllCodes(major).length
      ))
    : [];
  const requirementRows = majors.reduce((sum, major) => sum + majorAllCodes(major).length, 0);
  const metadata = review && review.metadataCoverage;
  const selectedValue = metadata
    ? `${metadata.found}/${metadata.total}`
    : (review?.kind === 'curated' ? 'Curated' : 'Pending');
  const selectedDetail = metadata
    ? (metadata.missing
        ? `${metadata.missing} template fallback${metadata.missing === 1 ? '' : 's'}`
        : `${metadata.coveragePct}% live course records`)
    : (review?.kind === 'curated' ? 'hand-built local schedule' : 'live preview pending');
  const generatedCount = majors.length || GENERATED_TEMPLATE_AUDIT.verifiedSchedules;
  return {
    generatedCount,
    requirementRows,
    selectedValue,
    selectedDetail,
    allVerified: GENERATED_TEMPLATE_AUDIT.failedSchedules === 0
      && GENERATED_TEMPLATE_AUDIT.verifiedSchedules >= generatedCount,
  };
}

function autoPlanFreshnessStat(label, value, detail) {
  return `
    <div class="auto-plan-freshness-stat">
      <strong>${settingsHtml(value)}</strong>
      <span>${settingsHtml(label)}</span>
      ${detail ? `<small>${settingsHtml(detail)}</small>` : ''}
    </div>
  `;
}

function generatedTemplateFreshnessHtml(review) {
  const summary = generatedTemplateFreshnessSummary(review);
  const audit = GENERATED_TEMPLATE_AUDIT;
  const auditDetail = audit.failedSchedules
    ? `${audit.failedSchedules} live audit issue${audit.failedSchedules === 1 ? '' : 's'}`
    : 'zero live audit failures';
  return `
    <div class="auto-plan-freshness" title="${settingsHtml(audit.command)}">
      <div class="auto-plan-freshness-head">
        <div>
          <span class="auto-plan-review-label">Generated Catalog Freshness</span>
          <strong>${summary.allVerified ? 'Every generated template passed live verification' : 'Generated template audit needs review'}</strong>
        </div>
        <span class="auto-plan-freshness-source">${settingsHtml(audit.source)}</span>
      </div>
      <div class="auto-plan-freshness-grid">
        ${autoPlanFreshnessStat('generated templates', `${audit.verifiedSchedules}/${summary.generatedCount}`, auditDetail)}
        ${autoPlanFreshnessStat('requirement rows', summary.requirementRows || 'ready', 'built-in generated catalog')}
        ${autoPlanFreshnessStat('last live audit', audit.checkedAt, audit.seed)}
        ${autoPlanFreshnessStat('selected preview', summary.selectedValue, summary.selectedDetail)}
      </div>
    </div>
  `;
}

function autoPlanTermList(terms) {
  return (terms || []).map(term => `
    <span class="auto-plan-load ${term.heavy ? 'heavy' : term.full ? 'full' : ''}" title="${settingsHtml(term.courseCount)} courses">
      <span>${settingsHtml(term.name)}</span>
      <strong>${settingsHtml(term.credits)}</strong>
    </span>
  `).join('');
}

function autoPlanGenEdList(summary) {
  return (summary || []).map(req => `
    <span class="auto-plan-gened-chip ${req.complete ? 'complete' : 'missing'}">
      <strong>${settingsHtml(req.id)}</strong>
      <span>${settingsHtml(req.have)}/${settingsHtml(req.need)}</span>
    </span>
  `).join('');
}

function autoPlanDiagnostic(level, title, body, meta = '') {
  return { level: level || 'info', title, body, meta };
}

function autoPlanDiagnostics(review) {
  if (!review) return [];
  if (review.kind === 'curated') {
    return [
      autoPlanDiagnostic('ok', 'Curated source', 'This plan uses a hand-built four-year layout for the selected major.', 'Local schedule'),
      autoPlanDiagnostic('ok', 'Editable after apply', 'Courses, terms, sections, and statuses can still be customized after applying.', `${review.courseCount || 0} courses`),
    ];
  }

  const diagnostics = [];
  const metadata = review.metadataCoverage || null;
  if (metadata) {
    if (metadata.total && metadata.missing === 0) {
      diagnostics.push(autoPlanDiagnostic(
        'ok',
        'Live metadata complete',
        'Every major requirement preview used live course metadata before scheduling.',
        `${metadata.coveragePct}% live`,
      ));
    } else if (metadata.found > 0) {
      diagnostics.push(autoPlanDiagnostic(
        'warn',
        'Mixed metadata sources',
        `${metadata.found}/${metadata.total} requirements used live metadata; ${metadata.missing} used template fallback credits and titles.`,
        `${metadata.coveragePct}% live`,
      ));
    } else {
      diagnostics.push(autoPlanDiagnostic(
        'warn',
        'Template-only preview',
        'The preview used local requirement data and 3-credit fallback rows because live metadata was unavailable.',
        `${metadata.total || 0} requirements`,
      ));
    }
  }

  const heavyTerms = review.heavyTerms || [];
  const fullTerms = review.fullTerms || [];
  if (heavyTerms.length) {
    diagnostics.push(autoPlanDiagnostic(
      'warn',
      'Heavy term load',
      `${heavyTerms.map(term => term.name).join(', ')} reach 18 credits. Move placeholders after applying if needed.`,
      `${heavyTerms.length} heavy term${heavyTerms.length === 1 ? '' : 's'}`,
    ));
  } else {
    diagnostics.push(autoPlanDiagnostic(
      'ok',
      'Load balance',
      'No generated term exceeds the 18-credit hard cap.',
      `${fullTerms.length} full term${fullTerms.length === 1 ? '' : 's'}`,
    ));
  }

  const missingGenEds = (review.genEdSummary || []).filter(req => !req.complete);
  if (missingGenEds.length) {
    diagnostics.push(autoPlanDiagnostic(
      'danger',
      'GenEd gaps remain',
      `Missing ${missingGenEds.map(req => req.id).join(', ')} after generation.`,
      `${review.genEdCompleteCount}/${review.genEdRequirementCount} covered`,
    ));
  } else {
    diagnostics.push(autoPlanDiagnostic(
      'ok',
      'GenEd placeholders covered',
      'The generated plan reserves slots for every tracked GenEd and I-Series bucket.',
      `${review.genEdPlaceholders || 0} GenEd placeholders`,
    ));
  }

  const placeholderCredits = review.placeholderCredits || 0;
  if (placeholderCredits > 0) {
    diagnostics.push(autoPlanDiagnostic(
      'info',
      'Replacement work',
      `${placeholderCredits} credits are placeholders for GenEds, electives, minors, certificates, or interests.`,
      `${(review.placeholderSamples || []).length} examples shown`,
    ));
  }

  const profile = review.profile || {};
  diagnostics.push(profile.active
    ? autoPlanDiagnostic(
      'ok',
      'Personalized electives',
      'Free-elective placeholders are labeled from your interests, preferred departments, and career goal.',
      (profile.preferredDepartments || []).slice(0, 4).join(', ') || 'Profile active',
    )
    : autoPlanDiagnostic(
      'info',
      'Neutral electives',
      'Add interests and preferred departments below to make free-elective placeholders more useful.',
      'Optional',
    ));

  return diagnostics.slice(0, 6);
}

function autoPlanDiagnosticsHtml(review) {
  const diagnostics = autoPlanDiagnostics(review);
  if (!diagnostics.length) return '';
  return `
    <div class="auto-plan-diagnostics">
      <span class="auto-plan-review-label">Diagnostics</span>
      <div class="auto-plan-diagnostic-grid">
        ${diagnostics.map(item => `
          <div class="auto-plan-diagnostic ${settingsHtml(item.level)}">
            <strong>${settingsHtml(item.title)}</strong>
            <p>${settingsHtml(item.body)}</p>
            ${item.meta ? `<span>${settingsHtml(item.meta)}</span>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function autoPlanPlaceholderTagsForBrowse(course) {
  if (typeof inferPlaceholderTags === 'function') return inferPlaceholderTags(course);
  const hay = [course?.code, course?.title, course?.note, course?.category].join(' ').toUpperCase();
  const tags = [];
  const known = ['FSAW','FSPW','FSOC','FSMA','FSAR','DSHS','DSHU','DSNS','DSNL','DSSP','DVUP','DVCC','SCIS'];
  known.forEach(tag => { if (hay.includes(tag)) tags.push(tag); });
  if (hay.includes('HUMANITIES') || /\bHU\b/.test(hay)) tags.push('DSHU');
  if (hay.includes('HISTORY') || hay.includes('SOCIAL') || /\bHS\b/.test(hay)) tags.push('DSHS');
  if (hay.includes('SCHOLARSHIP') || /\bSP\b/.test(hay)) tags.push('DSSP');
  if (hay.includes('I-SERIES') || hay.includes('I SERIES')) tags.push('SCIS');
  if (hay.includes('CULTURAL COMPETENCE')) tags.push('DVCC');
  if (hay.includes('PLURAL')) tags.push('DVUP');
  if (hay.includes('DIVERSITY') && !tags.includes('DVUP') && !tags.includes('DVCC')) tags.push('DVUP', 'DVCC');
  return Array.from(new Set(tags));
}

function autoPlanPlaceholderBrowseConfig(course, review) {
  if (!course) return null;
  const profile = review?.profile || {};
  const profileActive = !!profile.active;
  const tags = autoPlanPlaceholderTagsForBrowse(course);
  const primaryTag = tags[0] || '';
  const isFreeElective = /^Free Elective/i.test(course.code || '');
  const dept = profileActive ? '__PROFILE_DEPTS__' : '';
  const genEd = primaryTag || (!isFreeElective ? '__ALL_GENEDS__' : (profileActive ? '' : '__ALL_GENEDS__'));
  const search = '';
  if (!dept && !genEd && !search) return null;
  const reason = primaryTag
    ? `${primaryTag} replacement`
    : profileActive
      ? 'profile departments'
      : 'GenEd catalog';
  return {
    dept,
    genEd,
    search,
    label: `Replace ${course.code || 'placeholder'} · ${reason}`,
    button: primaryTag ? `Find ${primaryTag}` : profileActive ? 'Find profile fits' : 'Browse GenEds',
  };
}

function autoPlanPlaceholderBrowseActionHtml(course, review) {
  const config = autoPlanPlaceholderBrowseConfig(course, review);
  if (!config) return '';
  return `
    <button
      class="btn small auto-plan-source-action"
      type="button"
      data-auto-plan-browse-placeholder="1"
      data-browse-dept="${settingsHtml(config.dept)}"
      data-browse-gened="${settingsHtml(config.genEd)}"
      data-browse-search="${settingsHtml(config.search)}"
      data-browse-label="${settingsHtml(config.label)}"
    >${settingsHtml(config.button)}</button>
  `;
}

function autoPlanOpenBrowseReplacement(button) {
  if (!button || typeof browseOpenSearch !== 'function') {
    toastError('Browse is still loading. Try again in a moment.');
    return;
  }
  const settingsModal = document.getElementById('settings-modal');
  if (settingsModal) settingsModal.classList.remove('open');
  browseOpenSearch({
    dept: button.dataset.browseDept || '',
    genEd: button.dataset.browseGened || '',
    search: button.dataset.browseSearch || '',
    label: button.dataset.browseLabel || '',
    save: true,
  });
  toastSuccess('Opened Browse with a saved replacement search.');
}

document.addEventListener('click', (event) => {
  const button = event.target && event.target.closest ? event.target.closest('[data-auto-plan-browse-placeholder]') : null;
  if (!button) return;
  event.preventDefault();
  autoPlanOpenBrowseReplacement(button);
});

function autoPlanSourceSamplesHtml(review, opts = {}) {
  const metadata = review && review.metadataCoverage;
  if (!metadata) return '';
  const live = metadata.liveCodes || [];
  const missing = metadata.missingCodes || [];
  const placeholderSamples = review.placeholderSamples || [];
  const placeholderTotal = (review.genEdPlaceholders || 0) + (review.freeElectives || 0);
  const actions = opts.actions !== false;
  if (!live.length && !missing.length && !placeholderSamples.length) return '';
  return `
    <div class="auto-plan-source-samples">
      ${live.length ? `<span><strong>Live metadata</strong>${settingsHtml(live.join(', '))}</span>` : ''}
      ${missing.length ? `<span><strong>Template fallback</strong>${settingsHtml(missing.join(', '))}${metadata.missing > missing.length ? ` +${settingsHtml(metadata.missing - missing.length)} more` : ''}</span>` : ''}
      ${placeholderSamples.length ? `
        <span class="auto-plan-source-row">
          <strong>Placeholders to replace</strong>
          <em>${settingsHtml(placeholderSamples.map(course => course.code).join(', '))}${placeholderTotal > placeholderSamples.length ? ` +${settingsHtml(placeholderTotal - placeholderSamples.length)} more` : ''}</em>
          ${actions ? `<span class="auto-plan-source-actions">${placeholderSamples.slice(0, 4).map(course => autoPlanPlaceholderBrowseActionHtml(course, review)).join('')}</span>` : ''}
        </span>
      ` : ''}
    </div>
  `;
}

function autoPlanReviewHtml(review, opts = {}) {
  const planned = review.totalCredits || 0;
  const target = review.targetCredits || 120;
  const creditDetail = planned >= target
    ? `${planned - target} over target`
    : `${target - planned} short`;
  const heavyNames = (review.heavyTerms || []).map(term => term.name).join(', ');
  const metadata = review.metadataCoverage;
  const metadataDetail = metadata
    ? `${metadata.found}/${metadata.total} live course records`
    : 'curated local schedule';
  const profile = review.profile || {};
  const profileBits = [];
  if ((profile.interests || []).length) profileBits.push(profile.interests.join(', '));
  if ((profile.preferredDepartments || []).length) profileBits.push(`depts: ${profile.preferredDepartments.slice(0, 6).join(', ')}`);
  if (profile.careerGoal) profileBits.push(`goal: ${profile.careerGoal}`);
  const profileText = profile.active
    ? profileBits.join(' · ')
    : 'Neutral profile. Add interests below to personalize generated elective placeholders.';
  const sampleElectives = (review.freeElectiveSamples || []).map(course => `
    <li>
      <strong>${settingsHtml(course.title || course.code)}</strong>
      ${course.note ? `<span>${settingsHtml(course.note)}</span>` : ''}
    </li>
  `).join('');

  if (review.kind === 'curated') {
    return `
      <div class="auto-plan-review-head">
        <div>
          <strong>Curated plan ready</strong>
          <span>${settingsHtml(review.majorName)} uses a hand-built four-year schedule.</span>
        </div>
        <span class="auto-plan-review-badge good">Curated</span>
      </div>
      <div class="auto-plan-review-stats">
        ${autoPlanReviewStat('planned credits', planned || target, metadataDetail)}
        ${autoPlanReviewStat('terms', (review.termLoads || []).length || 8, 'editable after applying')}
        ${autoPlanReviewStat('courses', review.courseCount || 'ready', 'progress is preserved')}
      </div>
      ${review.termLoads ? `<div class="auto-plan-loads">${autoPlanTermList(review.termLoads)}</div>` : ''}
      ${autoPlanDiagnosticsHtml(review)}
      ${generatedTemplateFreshnessHtml(review)}
    `;
  }

  const warnings = [];
  if ((review.heavyTerms || []).length) {
    warnings.push(`${heavyNames} reach 18 credits. After applying, move a placeholder if that load is too high.`);
  }
  if (metadata && metadata.missing) {
    warnings.push(`${metadata.missing} requirement${metadata.missing === 1 ? '' : 's'} used template-only 3-credit fallback data.`);
  }

  return `
    <div class="auto-plan-review-head">
      <div>
        <strong>Auto Plan Review</strong>
        <span>${settingsHtml(review.majorName)} will generate a full editable draft before live replacement.</span>
      </div>
      <span class="auto-plan-review-badge">Generated</span>
    </div>
    <div class="auto-plan-review-stats">
      ${autoPlanReviewStat('planned credits', `${planned}/${target}`, creditDetail)}
      ${autoPlanReviewStat('GenEd coverage', `${review.genEdCompleteCount}/${review.genEdRequirementCount}`, `${review.genEdPlaceholders} placeholders`)}
      ${autoPlanReviewStat('major requirements', review.requirementCourseCount, metadataDetail)}
      ${autoPlanReviewStat('heavy terms', (review.heavyTerms || []).length, '18-credit terms')}
    </div>
    <div class="auto-plan-review-block">
      <span class="auto-plan-review-label">Term Loads</span>
      <div class="auto-plan-loads">${autoPlanTermList(review.termLoads)}</div>
    </div>
    <div class="auto-plan-review-block">
      <span class="auto-plan-review-label">GenEd / I-Series Coverage</span>
      <div class="auto-plan-geneds">${autoPlanGenEdList(review.genEdSummary)}</div>
    </div>
    ${autoPlanDiagnosticsHtml(review)}
    ${generatedTemplateFreshnessHtml(review)}
    ${autoPlanSourceSamplesHtml(review, opts)}
    <div class="auto-plan-profile">
      <strong>Profile fit</strong>
      <span>${settingsHtml(profileText)}</span>
    </div>
    ${sampleElectives ? `<ul class="auto-plan-electives">${sampleElectives}</ul>` : ''}
    ${warnings.length ? `<div class="auto-plan-warning">${warnings.map(settingsHtml).join(' ')}</div>` : ''}
  `;
}

async function renderAutoPlanReview(majorId) {
  const root = document.getElementById('set-auto-plan-review');
  if (!root) return;
  const tpl = getMajorTemplate(majorId);
  if (!tpl) {
    root.hidden = true;
    root.innerHTML = '';
    return;
  }
  root.hidden = false;
  const seq = ++autoPlanReviewSeq;
  root.className = 'auto-plan-review loading';
  root.innerHTML = `
    <div class="auto-plan-review-head">
      <div>
        <strong>Reviewing ${settingsHtml(tpl.name)}</strong>
        <span>${isMajorFullyBaked(tpl) ? 'Reading curated schedule…' : 'Fetching course metadata without changing your plan…'}</span>
      </div>
    </div>
  `;
  if (typeof buildAutoPlanPreview !== 'function') {
    root.innerHTML = '<div class="auto-plan-warning">Auto plan preview is still loading. Reopen Settings in a moment.</div>';
    return;
  }
  try {
    const profilePrefs = readProfileForm('set');
    const review = await buildAutoPlanPreview(majorId, {
      profilePrefs,
      onProgress(done, total) {
        if (seq !== autoPlanReviewSeq) return;
        const line = root.querySelector('.auto-plan-review-head span');
        if (line) line.textContent = `Fetching course metadata ${done}/${total}…`;
      },
    });
    if (seq !== autoPlanReviewSeq) return;
    root.className = `auto-plan-review ${review.kind === 'curated' ? 'curated' : 'generated'}`;
    root.innerHTML = autoPlanReviewHtml(review);
  } catch (e) {
    if (seq !== autoPlanReviewSeq) return;
    root.className = 'auto-plan-review';
    root.innerHTML = `<div class="auto-plan-warning">Could not build preview: ${settingsHtml(e.message || e)}</div>`;
  }
}

function queueAutoPlanReview() {
  clearTimeout(autoPlanReviewTimer);
  autoPlanReviewTimer = setTimeout(() => {
    const sel = document.getElementById('set-major');
    if (sel) renderAutoPlanReview(sel.value);
  }, 250);
}

function bindProfileReviewUpdates() {
  const modal = document.getElementById('settings-modal');
  if (!modal) return;
  modal.querySelectorAll('#set-interest-grid input, #set-career-goal, #set-gened-depts').forEach(el => {
    if (el.dataset.reviewBound) return;
    el.dataset.reviewBound = '1';
    el.addEventListener(el.tagName === 'INPUT' && el.type === 'text' ? 'input' : 'change', queueAutoPlanReview);
  });
}

function profileInterestGridHtml(selectedIds = [], name = 'profile-interest') {
  const selected = new Set(selectedIds || []);
  return PROFILE_INTEREST_DEFS.map(def => `
    <label class="profile-interest-chip ${selected.has(def.id) ? 'selected' : ''}">
      <input type="checkbox" name="${name}" value="${def.id}" ${selected.has(def.id) ? 'checked' : ''}>
      <span>${def.label}</span>
    </label>
  `).join('');
}

function renderProfileInterestGrid(containerId, selectedIds, name) {
  const root = document.getElementById(containerId);
  if (!root) return;
  root.innerHTML = profileInterestGridHtml(selectedIds, name);
  root.querySelectorAll('input[type="checkbox"]').forEach(input => {
    input.addEventListener('change', () => {
      input.closest('.profile-interest-chip')?.classList.toggle('selected', input.checked);
    });
  });
}

function readProfileForm(prefix) {
  const interests = [...document.querySelectorAll(`input[name="${prefix}-interest"]:checked`)].map(input => input.value);
  const careerGoal = document.getElementById(`${prefix}-career-goal`)?.value || '';
  const genEdDepts = document.getElementById(`${prefix}-gened-depts`)?.value || '';
  return normalizeProfilePrefs({ interests, careerGoal, genEdDepts });
}

function writeProfileForm(prefix, prefs = getProfilePrefs()) {
  renderProfileInterestGrid(`${prefix}-interest-grid`, prefs.interests, `${prefix}-interest`);
  const careerGoal = document.getElementById(`${prefix}-career-goal`);
  if (careerGoal) careerGoal.value = prefs.careerGoal || '';
  const genEdDepts = document.getElementById(`${prefix}-gened-depts`);
  if (genEdDepts) genEdDepts.value = (prefs.genEdDepts || []).join(', ');
}

function settingsPriorCreditGridHtml(selectedIds = []) {
  if (typeof ONBOARD_PRIOR_CREDIT_PRESETS === 'undefined') return '';
  const selected = new Set(selectedIds || []);
  return ONBOARD_PRIOR_CREDIT_PRESETS.map(preset => `
    ${typeof onboardPriorChipHtml === 'function'
      ? onboardPriorChipHtml(preset, { checked: selected.has(preset.id), extraClass: 'settings-prior-chip' })
      : `<label class="onboard-prior-chip settings-prior-chip ${selected.has(preset.id) ? 'selected' : ''}">
          <input type="checkbox" data-prior-id="${settingsHtml(preset.id)}" ${selected.has(preset.id) ? 'checked' : ''}>
          <span>
            <strong>${settingsHtml(preset.label)}</strong>
            <small>${settingsHtml(preset.detail)}</small>
          </span>
        </label>`}
  `).join('');
}

function settingsPriorSelectedIds() {
  return [...document.querySelectorAll('#set-prior-grid input[type="checkbox"]:checked')]
    .map(input => input.dataset.priorId)
    .filter(Boolean);
}

function settingsPriorResolved() {
  if (typeof onboardResolvePriorCredits !== 'function') return { courses: [], totalCredits: 0, presets: [] };
  return onboardResolvePriorCredits(
    document.getElementById('set-prior-codes')?.value || '',
    settingsPriorSelectedIds(),
  );
}

function settingsRefreshPriorCreditSummary() {
  const summary = document.getElementById('set-prior-summary');
  if (!summary) return;
  const resolved = settingsPriorResolved();
  summary.textContent = typeof onboardPriorSummaryText === 'function'
    ? onboardPriorSummaryText(resolved)
    : `${(resolved.courses || []).length} course(s) selected`;
  if (typeof onboardRenderPriorReview === 'function') {
    onboardRenderPriorReview('set-prior-review', resolved, {
      startYear: typeof onboardInferPlanStartYear === 'function' ? onboardInferPlanStartYear() : new Date().getFullYear(),
      context: 'settings',
    });
  }
  document.querySelectorAll('.settings-prior-chip').forEach(chip => {
    const input = chip.querySelector('input[type="checkbox"]');
    chip.classList.toggle('selected', !!input?.checked);
  });
}

function renderSettingsPriorCreditControls() {
  const grid = document.getElementById('set-prior-grid');
  if (!grid) return;
  grid.innerHTML = settingsPriorCreditGridHtml();
  grid.querySelectorAll('input[type="checkbox"]').forEach(input => {
    input.addEventListener('change', settingsRefreshPriorCreditSummary);
  });
  if (typeof onboardBindPriorDetailControls === 'function') {
    onboardBindPriorDetailControls(grid, 'set-prior-detail');
  }
  const raw = document.getElementById('set-prior-codes');
  if (raw) {
    raw.value = '';
    if (!raw.dataset.settingsPriorBound) {
      raw.dataset.settingsPriorBound = '1';
      raw.addEventListener('input', settingsRefreshPriorCreditSummary);
    }
  }
  const recovery = document.getElementById('set-prior-recovery-note');
  if (recovery) {
    recovery.hidden = true;
    recovery.innerHTML = '';
  }
  const status = document.getElementById('set-prior-status');
  if (status) {
    status.textContent = '';
    status.style.color = 'var(--slate)';
  }
  if (typeof onboardRenderPriorSourceNotice === 'function') {
    onboardRenderPriorSourceNotice('set-prior-source-note');
  }
  settingsRefreshPriorCreditSummary();
}

async function applySettingsPriorCredits() {
  const status = document.getElementById('set-prior-status');
  const resolved = settingsPriorResolved();
  if (!(resolved.courses || []).length) {
    if (status) {
      status.style.color = 'var(--amber)';
      status.textContent = 'Select a preset or enter course codes first.';
    }
    return;
  }
  if (typeof onboardApplyPriorCredits !== 'function') {
    if (status) {
      status.style.color = 'var(--red)';
      status.textContent = 'Prior-credit tools are still loading. Reopen Settings in a moment.';
    }
    return;
  }
  if (status) {
    status.style.color = 'var(--slate)';
    status.textContent = 'Applying prior credits...';
  }
  try {
    const applied = await onboardApplyPriorCredits({
      transferRaw: document.getElementById('set-prior-codes')?.value || '',
      priorCreditIds: settingsPriorSelectedIds(),
      source: 'settings',
    });
    saveState();
    render();
    renderSettingsPriorCreditControls();
    const message = `Applied ${applied.applied.length} prior-credit course${applied.applied.length === 1 ? '' : 's'}${applied.added.length ? ` · ${applied.added.length} added outside plan` : ''}.`;
    if (status) {
      status.style.color = 'var(--green)';
      status.textContent = message;
    }
    if (typeof toastSuccess === 'function') toastSuccess(message);
  } catch (error) {
    if (status) {
      status.style.color = 'var(--red)';
      status.textContent = 'Could not apply prior credits: ' + (error.message || error);
    }
    if (typeof toastError === 'function') toastError('Could not apply prior credits: ' + (error.message || error));
  }
}

function openSettings() {
  const s = getSettings();
  const profile = getProfilePrefs();
  populateMajorSelect();
  document.getElementById('set-program').value = s.programName || '';
  document.getElementById('set-eyebrow').value = s.eyebrow || '';
  document.getElementById('set-total-credits').value = s.totalCredits || 125;
  document.getElementById('set-goals').value = (s.goalCourses || []).join(', ');
  document.getElementById('set-footer').value = s.footerNote || '';
  writeProfileForm('set', profile);
  const status = document.getElementById('set-major-status');
  if (status) status.textContent = '';
  renderSettingsPriorCreditControls();
  document.getElementById('settings-modal').classList.add('open');
  bindProfileReviewUpdates();
  renderAutoPlanReview(document.getElementById('set-major')?.value);
}

async function applyMajorFromSettings() {
  const sel = document.getElementById('set-major');
  const status = document.getElementById('set-major-status');
  const id = sel.value;
  const tpl = getMajorTemplate(id);
  if (!tpl) return;
  // Skip confirmation when applying CE default (no destructive change vs default)
  // or when user has no progress / customizations yet.
  const hasProgress = Object.keys(state.courses || {}).length > 0
    || (state.customCourses || []).length > 0
    || (state.customSemesters || []).length > 0;
  if (hasProgress && !confirm(`Apply ${tpl.name}? Your current schedule structure will be replaced. Course progress (passed/transfer marks) is preserved.`)) return;

  status.style.color = 'var(--slate)';
  status.textContent = isMajorFullyBaked(tpl) ? 'Applying curated schedule…' : 'Generating schedule from API…';
  try {
    await applyMajorTemplate(id, {});
    const courseCount = (state.activeSchedule || []).reduce((a, sem) => a + (sem.courses || []).length, 0);
    const baked = isMajorFullyBaked(tpl);
    status.style.color = 'var(--green)';
    status.textContent = `Applied ${tpl.name} · ${courseCount} courses across ${(state.activeSchedule || []).length || 8} semesters.`;
    toastSuccess(`${baked ? '★' : '✱'} ${tpl.name} applied (${courseCount} courses).${baked ? '' : ' Auto-generated full draft with editable placeholders.'}`);
    // Refresh the visible settings inputs to reflect new program metadata
    const s = getSettings();
    document.getElementById('set-program').value = s.programName || '';
    document.getElementById('set-eyebrow').value = s.eyebrow || '';
    document.getElementById('set-total-credits').value = s.totalCredits || 125;
    document.getElementById('set-goals').value = (s.goalCourses || []).join(', ');
  } catch (e) {
    status.style.color = 'var(--red)';
    status.textContent = 'Error: ' + e.message;
    toastError('Could not apply major: ' + e.message);
  }
}
function closeSettings() {
  document.getElementById('settings-modal').classList.remove('open');
}
function saveSettings() {
  const programName = document.getElementById('set-program').value.trim() || 'Computer Engineering';
  const eyebrow     = document.getElementById('set-eyebrow').value.trim() || `UMD · ${programName}`;
  const totalCredits = parseInt(document.getElementById('set-total-credits').value) || 125;
  const goalCourses = document.getElementById('set-goals').value
    .split(',').map(s => s.trim()).filter(Boolean);
  const footerNote = document.getElementById('set-footer').value.trim();
  state.settings = { ...DEFAULT_SETTINGS, ...state.settings, programName, eyebrow, totalCredits, goalCourses, footerNote };
  state.profilePrefs = readProfileForm('set');
  saveState();
  applySettings();
  closeSettings();
  render();
}
function resetAllData() {
  if (!confirm('This will erase all course progress, custom courses, custom semesters, snapshots, custom majors, and settings. Continue?')) return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(PT_CACHE_KEY);
  if (typeof UMDIO_CACHE_KEY !== 'undefined') localStorage.removeItem(UMDIO_CACHE_KEY);
  state = loadState();
  applyTheme();
  applySettings();
  closeSettings();
  render();
  // Re-trigger onboarding for a clean start
  if (typeof startOnboarding === 'function') startOnboarding();
}
function applySettings() {
  const s = getSettings();
  const eyebrow = document.getElementById('hero-eyebrow');
  if (eyebrow) eyebrow.textContent = s.eyebrow || `UMD · ${s.programName}`;
  const footer = document.getElementById('footer-text');
  if (footer) {
    const note = s.footerNote ? ` · ${s.footerNote}` : '';
    footer.innerHTML = `<em>Terp Track</em> · ${s.programName || 'Degree'} planner${note} · Saves locally to your browser`;
  }
  // Populate semester filter dropdown in table view
  const semSel = document.getElementById('table-filter-sem');
  if (semSel) {
    const cur = semSel.value;
    semSel.innerHTML = '<option value="">All Semesters</option>';
    getAllSemesters().forEach(sem => {
      const opt = document.createElement('option');
      opt.value = sem.id;
      opt.textContent = sem.name;
      semSel.appendChild(opt);
    });
    semSel.value = cur;
  }
}

function bindSettingsButton() {
  const btn = document.getElementById('settings-btn');
  if (!btn || btn.dataset.settingsBound) return;
  btn.dataset.settingsBound = '1';
  btn.addEventListener('click', () => {
    try {
      openSettings();
    } catch (error) {
      console.error('Could not open settings', error);
      if (typeof toastError === 'function') toastError('Could not open Settings. Try reloading TerpTrack.');
    }
  });
}

if (typeof window !== 'undefined') {
  Object.assign(window, {
    openSettings,
    closeSettings,
    saveSettings,
    resetAllData,
    applySettings,
    applyMajorFromSettings,
    applySettingsPriorCredits,
  });
}

bindSettingsButton();
