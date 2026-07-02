'use strict';
/* ============================================================
   TIMELINE VIEW + FUTURE-SEMESTER PLANNER
   ============================================================ */

const PLANNER_MIN_CREDITS = 12;
const PLANNER_TARGET_CREDITS = 15;
const PLANNER_MAX_CREDITS = 18;
const PLANNER_AVAILABILITY_LIMIT = 10;
const PLANNER_AVAILABILITY_HISTORY = 3;
let plannerAvailabilitySeq = 0;

function timelineEscape(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

function plannerCourseState(course) {
  return getCourseState(course.code);
}

function plannerIsUmdCode(code) {
  return /^[A-Z]{3,4}\s*\d{3}[A-Z]?$/i.test(String(code || '').trim());
}

function plannerInferTermCode(sem) {
  if (typeof scheduleInferTermCode === 'function') return scheduleInferTermCode(sem);
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

function plannerTermLabel(term) {
  return typeof scheduleTermLabel === 'function' ? scheduleTermLabel(term) : String(term || '');
}

function plannerTermSuffix(term) {
  return String(term || '').slice(4);
}

function plannerSeasonName(suffix) {
  return ({ '01': 'Spring', '05': 'Summer', '08': 'Fall', '12': 'Winter' })[String(suffix || '')] || 'that season';
}

function plannerIsComplete(course) {
  const status = plannerCourseState(course).status;
  return status === 'passed' || status === 'transfer';
}

function plannerSemCourseItems() {
  const sems = getAllSemesters();
  const items = [];
  sems.forEach((sem, semIndex) => {
    (sem.courses || []).forEach((course, courseIndex) => {
      items.push({ course, sem, semIndex, courseIndex, source: 'base' });
    });
    (state.customCourses || [])
      .filter(course => course.semId === sem.id)
      .forEach((course, courseIndex) => {
        items.push({ course, sem, semIndex, courseIndex, source: 'custom' });
      });
  });
  return items;
}

function plannerCredits(items) {
  return items
    .filter(item => !plannerIsComplete(item.course))
    .reduce((sum, item) => sum + (Number(item.course.cr) || 0), 0);
}

function plannerStatusCounts(items) {
  return items.reduce((acc, item) => {
    if (plannerIsComplete(item.course)) acc.done++;
    else if (prereqsMet(item.course).met) acc.ready++;
    else acc.locked++;
    return acc;
  }, { done: 0, ready: 0, locked: 0 });
}

function plannerFirstOpenSemIndex(sems, itemsBySem) {
  const idx = sems.findIndex(sem => (itemsBySem[sem.id] || []).some(item => !plannerIsComplete(item.course)));
  return idx === -1 ? 0 : idx;
}

function plannerIndexByCode(items) {
  const out = {};
  items.forEach(item => {
    const norm = normalizeCode(item.course.code);
    if (!out[norm] || item.semIndex < out[norm].semIndex) out[norm] = item;
  });
  return out;
}

function plannerPassedCode(code) {
  const norm = normalizeCode(code);
  const display = displayCode(norm);
  const direct = getCourseState(code);
  const normalized = getCourseState(display);
  return direct.status === 'passed' || direct.status === 'transfer'
    || normalized.status === 'passed' || normalized.status === 'transfer';
}

function plannerPrereqGroups(course) {
  return Array.isArray(course.prereqGroups) && course.prereqGroups.length
    ? course.prereqGroups
    : (course.prereqs || []).map(code => [code]);
}

function plannerGroupReadyBefore(group, semIndex, indexByCode) {
  return group.some(code => {
    const norm = normalizeCode(code);
    if (plannerPassedCode(code)) return true;
    return indexByCode[norm] && indexByCode[norm].semIndex < semIndex;
  });
}

function plannerCourseReadyBySem(course, semIndex, indexByCode) {
  return plannerPrereqGroups(course).every(group => plannerGroupReadyBefore(group, semIndex, indexByCode));
}

function plannerPrereqIssues(items, indexByCode) {
  const issues = [];
  items.forEach(item => {
    if (plannerIsComplete(item.course)) return;
    plannerPrereqGroups(item.course).forEach(group => {
      if (plannerGroupReadyBefore(group, item.semIndex, indexByCode)) return;
      const planned = group
        .map(code => indexByCode[normalizeCode(code)])
        .filter(Boolean)
        .sort((a, b) => a.semIndex - b.semIndex)[0] || null;
      issues.push({
        item,
        group,
        prereqItem: planned,
        missing: group.map(displayCode).join(' or '),
      });
    });
  });
  return issues;
}

function plannerDependentsCount(course, allItems) {
  const norm = normalizeCode(course.code);
  return allItems.filter(item => {
    if (normalizeCode(item.course.code) === norm) return false;
    return plannerPrereqGroups(item.course).some(group => group.some(code => normalizeCode(code) === norm));
  }).length;
}

function plannerMoveScore(item, allItems) {
  const course = item.course;
  const category = String(course.category || '');
  let score = 0;
  if (course.kind === 'gened' || category.startsWith('gened-')) score += 120;
  if (category === 'elective' || course.kind === 'tech') score += 50;
  if (isGoalCourse(course)) score -= 140;
  if (course.kind === 'critical' || category.includes('major')) score -= 45;
  score -= plannerDependentsCount(course, allItems) * 35;
  score += item.courseIndex * 4;
  return score;
}

function plannerFindDestinationAfter(item, sems, itemsBySem, indexByCode, loads) {
  for (let i = item.semIndex + 1; i < sems.length; i++) {
    const load = loads[sems[i].id] || 0;
    if (load + (Number(item.course.cr) || 0) > PLANNER_MAX_CREDITS) continue;
    if (!plannerCourseReadyBySem(item.course, i, indexByCode)) continue;
    return sems[i];
  }
  return null;
}

function plannerFindPullForwardCourse(targetSem, sems, itemsBySem, indexByCode, loads, firstOpenIndex) {
  const targetIndex = sems.findIndex(sem => sem.id === targetSem.id);
  const candidates = [];
  for (let i = targetIndex + 1; i < sems.length; i++) {
    (itemsBySem[sems[i].id] || []).forEach(item => {
      if (plannerIsComplete(item.course)) return;
      const cr = Number(item.course.cr) || 0;
      if ((loads[targetSem.id] || 0) + cr > PLANNER_MAX_CREDITS) return;
      if (!plannerCourseReadyBySem(item.course, targetIndex, indexByCode)) return;
      if (i < firstOpenIndex) return;
      candidates.push(item);
    });
  }
  return candidates.sort((a, b) => plannerMoveScore(b, candidates) - plannerMoveScore(a, candidates))[0] || null;
}

function plannerActionCard(action, idx) {
  const level = action.level || 'info';
  const button = action.button
    ? `<button class="btn small ${action.primary ? 'primary' : ''}" type="button" ${action.button.attrs}>${timelineEscape(action.button.label)}</button>`
    : '';
  return `
    <div class="planner-action ${level}">
      <div class="planner-action-rank">${idx + 1}</div>
      <div>
        <strong>${timelineEscape(action.title)}</strong>
        <p>${timelineEscape(action.body)}</p>
        ${action.meta ? `<span>${timelineEscape(action.meta)}</span>` : ''}
      </div>
      ${button}
    </div>
  `;
}

function plannerRegistrationSelectedItems(semId, items = []) {
  const sem = (typeof getAllSemesters === 'function' ? getAllSemesters() : []).find(item => item.id === semId) || null;
  const term = typeof scheduleTermForSemId === 'function'
    ? scheduleTermForSemId(semId)
    : ((state.schedulePrefs || {})[semId]?.term || (sem && plannerInferTermCode(sem)) || '');
  const bucket = (state.selectedSections || {})[semId] || {};
  return items
    .filter(item => !plannerIsComplete(item.course))
    .map(item => {
      const section = typeof getSelectedSectionForTerm === 'function'
        ? getSelectedSectionForTerm(semId, item.course.code, term)
        : bucket[normalizeCode(item.course.code)];
      if (section?.semester && term && String(section.semester) !== String(term)) return null;
      return section ? { course: item.course, section } : null;
    })
    .filter(Boolean);
}

function plannerRegistrationReadinessContext(sem, items = []) {
  if (!sem || typeof scheduleRegistrationReadiness !== 'function') return null;
  const courseItems = (items || [])
    .filter(item => !plannerIsComplete(item.course) && plannerIsUmdCode(item.course?.code));
  const courses = courseItems.map(item => item.course);
  const selectedItems = plannerRegistrationSelectedItems(sem.id, courseItems);
  const prefs = typeof getSchedulePrefs === 'function' ? getSchedulePrefs(sem.id) : {};
  const conflictResult = typeof detectScheduleConflicts === 'function'
    ? detectScheduleConflicts(selectedItems)
    : { conflicts: [] };
  const conflicts = Array.isArray(conflictResult?.conflicts) ? conflictResult.conflicts : [];
  const warnings = typeof selectedScheduleWarnings === 'function'
    ? selectedScheduleWarnings(selectedItems, prefs)
    : [];
  const selectedCodes = new Set(selectedItems.map(item => normalizeCode(item.course?.code || item.section?.course || '')));
  const unscheduled = courses.filter(course => !selectedCodes.has(normalizeCode(course.code)));
  const readiness = scheduleRegistrationReadiness(courses, selectedItems, conflicts, warnings, prefs, unscheduled, sem.id);

  return { courses, selectedItems, prefs, conflicts, warnings, unscheduled, readiness };
}

function plannerReadinessHasCourses(context) {
  return !!(context && context.courses && context.courses.length && context.readiness);
}

function plannerReadinessGateSummary(readiness, limit = 4) {
  const gates = (readiness?.gates || []).filter(gate => gate.level === 'danger' || gate.level === 'warn');
  if (!gates.length) return 'All registration gates clear';
  const shown = gates.slice(0, limit).map(gate => `${gate.label} ${gate.level}`);
  const extra = gates.length > limit ? ` +${gates.length - limit} more` : '';
  return `${shown.join(' · ')}${extra}`;
}

function plannerReadinessBody(readiness) {
  if (!readiness) return '';
  const firstFix = (readiness.fixes || [])[0];
  return firstFix ? `${readiness.detail} ${firstFix}` : readiness.detail;
}

function plannerReadinessMeta(readiness) {
  if (!readiness) return '';
  const parts = [plannerReadinessGateSummary(readiness)];
  if (readiness.dangerCount) parts.push(`${readiness.dangerCount} blocker${readiness.dangerCount === 1 ? '' : 's'}`);
  if (readiness.warnCount) parts.push(`${readiness.warnCount} review`);
  return parts.filter(Boolean).join(' · ');
}

function plannerSelectedSeatRiskItems(selectedItems) {
  if (typeof sectionSeatRisk !== 'function') return [];
  return (selectedItems || [])
    .map(item => {
      const risk = sectionSeatRisk(item.section);
      if (!risk || !['closed', 'risk', 'watch'].includes(risk.level)) return null;
      const label = typeof scheduleSectionShortLabel === 'function'
        ? scheduleSectionShortLabel(item.section)
        : (item.section?.number || item.section?.section_id || 'section');
      return {
        item,
        risk,
        code: item.course?.code || displayCode(item.section?.course || ''),
        label,
        level: risk.level === 'closed' || risk.level === 'risk' ? 'danger' : 'warn',
      };
    })
    .filter(Boolean);
}

function plannerSeatRiskBackupBody(entry) {
  if (!entry) return '';
  const action = typeof sectionSeatBackupAction === 'function'
    ? sectionSeatBackupAction(entry.risk)
    : 'Keep a backup section ready before registration.';
  return `${entry.risk.detail}. ${action}`;
}

function plannerChecklistItem(level, title, body, meta = '', button = null) {
  return { level: level || 'info', title, body, meta, button };
}

function plannerRegistrationChecklist(advisor) {
  const items = [];
  const nextSem = advisor.visibleSems.find(sem => (advisor.itemsBySem[sem.id] || []).some(item => !plannerIsComplete(item.course)))
    || advisor.visibleSems[0] || null;
  if (!nextSem) {
    return [plannerChecklistItem('ok', 'No upcoming registration tasks', 'Every visible term is already complete or empty.', 'Refresh after editing your plan.')];
  }
  const semItems = advisor.itemsBySem[nextSem.id] || [];
  const load = advisor.loads[nextSem.id] || 0;
  const counts = plannerStatusCounts(semItems);
  const semIssues = advisor.issues.filter(issue => issue.item.sem.id === nextSem.id);
  const scheduleButton = {
    label: 'Open Schedule',
    attrs: `data-planner-schedule="${timelineEscape(nextSem.id)}"`,
  };
  const catalogWarning = typeof catalogYearAdvisingWarning === 'function' ? catalogYearAdvisingWarning() : null;
  if (catalogWarning) {
    items.push(plannerChecklistItem(
      'warn',
      catalogWarning.title,
      catalogWarning.body,
      catalogWarning.meta,
    ));
  }

  if (load > PLANNER_MAX_CREDITS) {
    items.push(plannerChecklistItem(
      'danger',
      `Balance ${nextSem.name} before registration`,
      `${nextSem.name} has ${load} remaining credits. Move a flexible course before picking sections.`,
      `Target ${PLANNER_TARGET_CREDITS}-${PLANNER_MAX_CREDITS} credits`,
    ));
  } else if (load > 0 && load < PLANNER_MIN_CREDITS) {
    items.push(plannerChecklistItem(
      'warn',
      `Fill ${nextSem.name} to full-time range`,
      `${nextSem.name} has ${load} remaining credits. Pull a ready course forward or confirm part-time intent.`,
      `Minimum ${PLANNER_MIN_CREDITS} credits`,
    ));
  } else if (load > 0) {
    items.push(plannerChecklistItem('ok', `${nextSem.name} credit load is workable`, `${load} remaining credits are planned for the next registration term.`, `${counts.ready} ready · ${counts.locked} locked`));
  }

  if (semIssues.length) {
    const issue = semIssues[0];
    items.push(plannerChecklistItem(
      'danger',
      `Resolve ${issue.item.course.code} prerequisite order`,
      issue.prereqItem
        ? `${issue.item.course.code} is planned before ${issue.missing} is complete. Move it after ${issue.prereqItem.course.code}.`
        : `${issue.item.course.code} needs ${issue.missing}, which is not planned before ${nextSem.name}.`,
      semIssues.length === 1 ? '1 locked next-term course' : `${semIssues.length} locked next-term courses`,
    ));
  } else if (counts.locked) {
    items.push(plannerChecklistItem('warn', 'Confirm locked courses with an advisor', `${counts.locked} course${counts.locked === 1 ? '' : 's'} in ${nextSem.name} still show unmet prerequisites.`, 'Review degree audit before registration'));
  } else if (counts.ready) {
    items.push(plannerChecklistItem('ok', 'Prerequisites look ready', `${counts.ready} next-term course${counts.ready === 1 ? '' : 's'} can be attempted based on the current plan.`, 'Still confirm official restrictions'));
  }

  const readinessContext = plannerRegistrationReadinessContext(nextSem, semItems);
  const selectedItems = readinessContext?.selectedItems || plannerRegistrationSelectedItems(nextSem.id, semItems);
  if (plannerReadinessHasCourses(readinessContext)) {
    const readiness = readinessContext.readiness;
    items.push(plannerChecklistItem(
      readiness.level,
      `${nextSem.name} registration readiness: ${readiness.label}`,
      plannerReadinessBody(readiness),
      plannerReadinessMeta(readiness),
      scheduleButton,
    ));
  }
  if (selectedItems.length && typeof scheduleTimingFit === 'function' && typeof detectScheduleConflicts === 'function') {
    const prefs = typeof getSchedulePrefs === 'function' ? getSchedulePrefs(nextSem.id) : {};
    const { conflicts } = detectScheduleConflicts(selectedItems);
    const fit = scheduleTimingFit(selectedItems, prefs, conflicts);
    const level = conflicts.length || fit.score < 61 ? 'danger' : fit.score < 76 ? 'warn' : 'ok';
    items.push(plannerChecklistItem(
      level,
      `${nextSem.name} timing fit: ${fit.score}/100`,
      fit.insights[0] || 'No timing notes detected for picked sections.',
      `${selectedItems.length}/${semItems.filter(item => !plannerIsComplete(item.course)).length} sections picked`,
      scheduleButton,
    ));
  } else if (load > 0) {
    items.push(plannerChecklistItem(
      'warn',
      `Pick posted sections for ${nextSem.name}`,
      'Use the Schedule tab to choose lecture, discussion, lab, and recitation sections before seats move.',
      `${semItems.filter(item => !plannerIsComplete(item.course)).length} courses need section choices`,
      scheduleButton,
    ));
  }
  plannerSelectedSeatRiskItems(selectedItems).slice(0, 2).forEach(entry => {
    items.push(plannerChecklistItem(
      entry.level,
      `Keep a backup for ${entry.code} ${entry.label}`,
      plannerSeatRiskBackupBody(entry),
      'Seat risk',
      scheduleButton,
    ));
  });

  (advisor.genedGaps || []).slice(0, 2).forEach(gap => {
    const tag = gap.id === 'DIVERSITY-2' ? 'DVUP' : gap.id;
    items.push(plannerChecklistItem(
      'info',
      `Find remaining ${gap.label || gap.id}`,
      `You have ${gap.have}/${gap.need} planned. Pick a course that covers ${gap.id} before the plan fills with electives.`,
      'GenEd requirement',
      { label: 'Find GenEd', attrs: `data-planner-gened="${timelineEscape(tag)}"` },
    ));
  });

  if (!items.length) {
    items.push(plannerChecklistItem('ok', 'Registration checklist is clear', 'Credit load, prerequisites, GenEds, registration readiness, and picked-section timing look ready from the current plan.', `${nextSem.name} reviewed`));
  }
  return items.slice(0, 8);
}

function plannerChecklistCard(item, idx) {
  const button = item.button
    ? `<button class="btn small ${item.level === 'danger' ? 'primary' : ''}" type="button" ${item.button.attrs}>${timelineEscape(item.button.label)}</button>`
    : '';
  return `
    <div class="planner-check ${timelineEscape(item.level)}">
      <b>${idx + 1}</b>
      <div>
        <strong>${timelineEscape(item.title)}</strong>
        <p>${timelineEscape(item.body)}</p>
        ${item.meta ? `<span>${timelineEscape(item.meta)}</span>` : ''}
      </div>
      ${button}
    </div>
  `;
}

function plannerRegistrationChecklistText(items) {
  const lines = ['Registration checklist'];
  (items || []).forEach((item, idx) => {
    lines.push(`${idx + 1}. ${item.title}`);
    if (item.body) lines.push(`   ${item.body}`);
    if (item.meta) lines.push(`   ${item.meta}`);
  });
  return lines.join('\n');
}

function plannerChecklistHtml(items) {
  return `
    <div class="planner-checklist">
      <div class="planner-checklist-head">
        <div>
          <h3>Registration Checklist</h3>
          <span>${items.length} next actions from readiness, load, prerequisites, GenEds, and picked sections</span>
        </div>
        <button class="btn small" type="button" data-planner-copy-checklist>Select checklist</button>
      </div>
      <div class="planner-checklist-grid">
        ${items.map(plannerChecklistCard).join('')}
      </div>
      <textarea id="planner-checklist-text" class="planner-checklist-text" readonly hidden>${timelineEscape(plannerRegistrationChecklistText(items))}</textarea>
    </div>
  `;
}

function plannerAdvisorQuestion(level, title, question, why = '', meta = '', button = null) {
  return { level: level || 'info', title, question, why, meta, button };
}

function plannerAdvisorQuestions(advisor, checklist = []) {
  const questions = [];
  const nextSem = advisor.visibleSems.find(sem => (advisor.itemsBySem[sem.id] || []).some(item => !plannerIsComplete(item.course)))
    || advisor.visibleSems[0] || null;
  if (!nextSem) {
    return [plannerAdvisorQuestion(
      'ok',
      'Confirm graduation readiness',
      'Does my official audit show every remaining requirement as satisfied or in progress?',
      'TerpTrack does not replace the official UMD degree audit.',
      'Bring official audit',
    )];
  }

  const semItems = advisor.itemsBySem[nextSem.id] || [];
  const load = advisor.loads[nextSem.id] || 0;
  const remainingItems = semItems.filter(item => !plannerIsComplete(item.course));
  const semIssues = advisor.issues.filter(issue => issue.item.sem.id === nextSem.id);
  const scheduleButton = {
    label: 'Open Schedule',
    attrs: `data-planner-schedule="${timelineEscape(nextSem.id)}"`,
  };
  const catalogWarning = typeof catalogYearAdvisingWarning === 'function' ? catalogYearAdvisingWarning() : null;
  if (catalogWarning) {
    questions.push(plannerAdvisorQuestion(
      'warn',
      'Catalog-year confirmation',
      `Does my official audit or advisor worksheet confirm I should follow the ${catalogWarning.targetYear} catalog requirements?`,
      catalogWarning.body,
      catalogWarning.meta,
    ));
  }

  if (load > PLANNER_MAX_CREDITS) {
    questions.push(plannerAdvisorQuestion(
      'danger',
      `${nextSem.name} load`,
      `Which course should I move out of ${nextSem.name} so I can register for a realistic ${PLANNER_TARGET_CREDITS}-${PLANNER_MAX_CREDITS} credit term?`,
      `${nextSem.name} currently has ${load} remaining planned credits.`,
      'Ask before registration',
    ));
  } else if (load > 0 && load < PLANNER_MIN_CREDITS) {
    questions.push(plannerAdvisorQuestion(
      'warn',
      `${nextSem.name} full-time status`,
      `Should I add another ready course to ${nextSem.name}, or is there a reason this term should stay below ${PLANNER_MIN_CREDITS} credits?`,
      `${nextSem.name} currently has ${load} remaining planned credits.`,
      'Financial aid and progress check',
    ));
  } else if (load > 0) {
    questions.push(plannerAdvisorQuestion(
      'ok',
      `${nextSem.name} credit check`,
      `Does this ${load}-credit ${nextSem.name} plan match my official major map and graduation timeline?`,
      'Credit load looks workable in TerpTrack, but requirements should be confirmed officially.',
      `${remainingItems.length} planned course${remainingItems.length === 1 ? '' : 's'}`,
    ));
  }

  semIssues.slice(0, 3).forEach(issue => {
    const prereqText = issue.missing || 'the listed prerequisite';
    questions.push(plannerAdvisorQuestion(
      'danger',
      `${issue.item.course.code} prerequisite`,
      issue.prereqItem
        ? `Can I take ${issue.item.course.code} in ${issue.item.sem.name} if ${prereqText} is planned in ${issue.prereqItem.sem.name}, or should ${issue.item.course.code} move later?`
        : `What course, placement, or exception can satisfy ${issue.item.course.code}'s ${prereqText} prerequisite before I register?`,
      issue.prereqItem
        ? `${issue.item.course.code} is currently before ${issue.prereqItem.course.code}.`
        : `${issue.item.course.code} has a prerequisite group that is not planned earlier.`,
      'Prerequisite override/order',
    ));
  });

  if (!semIssues.length && advisor.issues.length) {
    const issue = advisor.issues[0];
    questions.push(plannerAdvisorQuestion(
      'warn',
      'Future prerequisite order',
      `Does my later plan order need to change because ${issue.item.course.code} depends on ${issue.missing}?`,
      `${issue.item.course.code} is currently planned in ${issue.item.sem.name}.`,
      'Future-term audit',
    ));
  }

  const readinessContext = plannerRegistrationReadinessContext(nextSem, semItems);
  const selectedItems = readinessContext?.selectedItems || plannerRegistrationSelectedItems(nextSem.id, semItems);
  if (plannerReadinessHasCourses(readinessContext) && readinessContext.readiness.level !== 'ok') {
    const readiness = readinessContext.readiness;
    const gates = plannerReadinessGateSummary(readiness, 3).replace(/ · /g, ', ');
    questions.push(plannerAdvisorQuestion(
      readiness.level,
      `${nextSem.name} registration readiness`,
      `Which ${nextSem.name} registration issue should I resolve first before my appointment: ${gates}?`,
      plannerReadinessBody(readiness),
      plannerReadinessMeta(readiness),
      scheduleButton,
    ));
  }
  if (selectedItems.length && typeof scheduleTimingFit === 'function' && typeof detectScheduleConflicts === 'function') {
    const prefs = typeof getSchedulePrefs === 'function' ? getSchedulePrefs(nextSem.id) : {};
    const { conflicts } = detectScheduleConflicts(selectedItems);
    const fit = scheduleTimingFit(selectedItems, prefs, conflicts);
    if (conflicts.length || fit.score < 76) {
      questions.push(plannerAdvisorQuestion(
        conflicts.length || fit.score < 61 ? 'danger' : 'warn',
        `${nextSem.name} timing`,
        `Should I switch any ${nextSem.name} sections to make this schedule realistic for commute, work, labs, or back-to-back travel?`,
        conflicts.length
          ? `${conflicts.length} picked-section conflict${conflicts.length === 1 ? '' : 's'} detected.`
          : (fit.insights[0] || `Timing fit is ${fit.score}/100.`),
        `${selectedItems.length}/${remainingItems.length} sections picked`,
        scheduleButton,
      ));
    }
  } else if (remainingItems.length) {
    questions.push(plannerAdvisorQuestion(
      'info',
      `${nextSem.name} section strategy`,
      `Which ${nextSem.name} lectures, labs, discussions, or backups should I prioritize when registration opens?`,
      'No picked sections are saved for the next registration term yet.',
      `${remainingItems.length} course${remainingItems.length === 1 ? '' : 's'} need sections`,
      scheduleButton,
    ));
  }
  plannerSelectedSeatRiskItems(selectedItems).slice(0, 2).forEach(entry => {
    const fallback = entry.risk.level === 'closed' ? 'is still closed when I register' : 'fills before I register';
    questions.push(plannerAdvisorQuestion(
      entry.level,
      `${nextSem.name} seat backup`,
      `What backup section or alternate course should I use if ${entry.code} ${entry.label} ${fallback}?`,
      plannerSeatRiskBackupBody(entry),
      'Seat risk',
      scheduleButton,
    ));
  });

  (advisor.genedGaps || []).slice(0, 2).forEach(gap => {
    const tag = gap.id === 'DIVERSITY-2' ? 'DVUP' : gap.id;
    questions.push(plannerAdvisorQuestion(
      'info',
      `${gap.label || gap.id} GenEd`,
      `Which course should I use for ${gap.id} so it fits my major path, interests, and graduation timing?`,
      `TerpTrack shows ${gap.have}/${gap.need} planned for ${gap.label || gap.id}.`,
      'GenEd planning',
      { label: 'Find GenEd', attrs: `data-planner-gened="${timelineEscape(tag)}"` },
    ));
  });

  const riskyChecklist = (checklist || []).filter(item => item.level === 'danger' || item.level === 'warn');
  if (!questions.some(item => item.level === 'danger' || item.level === 'warn') && riskyChecklist.length) {
    const item = riskyChecklist[0];
    questions.push(plannerAdvisorQuestion(
      item.level,
      'Registration risk',
      `What should I change first to resolve this TerpTrack warning: ${item.title}?`,
      item.body || 'The registration checklist flagged this as a follow-up item.',
      item.meta || 'Checklist follow-up',
      item.button || null,
    ));
  }

  if (!questions.length) {
    questions.push(plannerAdvisorQuestion(
      'ok',
      'Advisor confirmation',
      'Does this plan satisfy my official audit, major benchmarks, and any college-specific policies I should know before registration?',
      'TerpTrack checks common planning risks, but official policy decisions live with UMD advising.',
      `${nextSem.name} reviewed`,
    ));
  }

  return questions.slice(0, 8);
}

function plannerAdvisorQuestionCard(item, idx) {
  const button = item.button
    ? `<button class="btn small ${item.level === 'danger' ? 'primary' : ''}" type="button" ${item.button.attrs}>${timelineEscape(item.button.label)}</button>`
    : '';
  return `
    <div class="planner-question ${timelineEscape(item.level)}">
      <b>Q${idx + 1}</b>
      <div>
        <strong>${timelineEscape(item.title)}</strong>
        <p>${timelineEscape(item.question)}</p>
        ${item.why ? `<span>${timelineEscape(item.why)}</span>` : ''}
        ${item.meta ? `<em>${timelineEscape(item.meta)}</em>` : ''}
      </div>
      ${button}
    </div>
  `;
}

function plannerAdvisorQuestionsText(items) {
  const lines = ['Advisor questions'];
  (items || []).forEach((item, idx) => {
    lines.push(`${idx + 1}. ${item.question}`);
    if (item.why) lines.push(`   Why: ${item.why}`);
    if (item.meta) lines.push(`   Context: ${item.meta}`);
  });
  return lines.join('\n');
}

function plannerAdvisorQuestionsHtml(items) {
  return `
    <div class="planner-questions">
      <div class="planner-questions-head">
        <div>
          <h3>Advisor Questions</h3>
          <span>${items.length} questions generated from readiness, checklist risks, requirements, and picked sections</span>
        </div>
        <button class="btn small" type="button" data-planner-copy-questions>Select questions</button>
      </div>
      <div class="planner-question-grid">
        ${items.map(plannerAdvisorQuestionCard).join('')}
      </div>
      <textarea id="planner-questions-text" class="planner-questions-text" readonly hidden>${timelineEscape(plannerAdvisorQuestionsText(items))}</textarea>
    </div>
  `;
}

function plannerBuildAdvisor() {
  const sems = getAllSemesters();
  const allItems = plannerSemCourseItems();
  const itemsBySem = {};
  sems.forEach(sem => { itemsBySem[sem.id] = allItems.filter(item => item.sem.id === sem.id); });
  const firstOpenIndex = plannerFirstOpenSemIndex(sems, itemsBySem);
  const indexByCode = plannerIndexByCode(allItems);
  const loads = {};
  sems.forEach(sem => { loads[sem.id] = plannerCredits(itemsBySem[sem.id] || []); });
  const visibleSems = sems.slice(firstOpenIndex);
  const issues = plannerPrereqIssues(allItems.filter(item => item.semIndex >= firstOpenIndex), indexByCode);
  const genedGaps = typeof recoGenEdGaps === 'function' ? recoGenEdGaps() : [];
  const actions = [];

  visibleSems.forEach(sem => {
    const load = loads[sem.id] || 0;
    if (load <= PLANNER_MAX_CREDITS) return;
    const candidates = (itemsBySem[sem.id] || [])
      .filter(item => !plannerIsComplete(item.course))
      .sort((a, b) => plannerMoveScore(b, allItems) - plannerMoveScore(a, allItems));
    const movable = candidates.find(item => plannerFindDestinationAfter(item, sems, itemsBySem, indexByCode, loads));
    const dest = movable ? plannerFindDestinationAfter(movable, sems, itemsBySem, indexByCode, loads) : null;
    actions.push({
      level: 'warn',
      title: `${sem.name} is overloaded`,
      body: dest && movable
        ? `Move ${movable.course.code} to ${dest.name} to bring this term closer to ${PLANNER_TARGET_CREDITS} credits.`
        : `This term has ${load} remaining credits. Move a flexible elective or GenEd later before registration.`,
      meta: `${load} credits now · target ${PLANNER_TARGET_CREDITS}-${PLANNER_MAX_CREDITS}`,
      button: dest && movable ? {
        label: 'Apply move',
        attrs: `data-planner-move="${timelineEscape(movable.course.code)}" data-from-sem="${timelineEscape(sem.id)}" data-to-sem="${timelineEscape(dest.id)}"`,
      } : null,
      primary: true,
    });
  });

  visibleSems.forEach(sem => {
    const load = loads[sem.id] || 0;
    if (load === 0 || load >= PLANNER_MIN_CREDITS) return;
    const pull = plannerFindPullForwardCourse(sem, sems, itemsBySem, indexByCode, loads, firstOpenIndex);
    if (!pull) return;
    actions.push({
      level: 'info',
      title: `${sem.name} has room`,
      body: `Pull ${pull.course.code} forward from ${pull.sem.name}; its prerequisites are satisfied by then and it keeps momentum.`
        + (pull.course.title ? ` ${pull.course.title}` : ''),
      meta: `${load} credits now · ${Number(pull.course.cr) || 0} credits available to pull`,
      button: {
        label: 'Apply move',
        attrs: `data-planner-move="${timelineEscape(pull.course.code)}" data-from-sem="${timelineEscape(pull.sem.id)}" data-to-sem="${timelineEscape(sem.id)}"`,
      },
    });
  });

  issues.slice(0, 5).forEach(issue => {
    const destIndex = issue.prereqItem ? Math.min(sems.length - 1, issue.prereqItem.semIndex + 1) : -1;
    const dest = destIndex >= 0 ? sems[destIndex] : null;
    actions.push({
      level: 'danger',
      title: `${issue.item.course.code} is too early`,
      body: issue.prereqItem
        ? `${issue.item.course.code} is in ${issue.item.sem.name}, but ${issue.missing} is not planned before it. Move it after ${issue.prereqItem.course.code}.`
        : `${issue.item.course.code} needs ${issue.missing}, which is not planned before that term.`,
      meta: issue.prereqItem ? `${issue.prereqItem.course.code} currently in ${issue.prereqItem.sem.name}` : 'Prerequisite missing from plan',
      button: dest && dest.id !== issue.item.sem.id ? {
        label: 'Move later',
        attrs: `data-planner-move="${timelineEscape(issue.item.course.code)}" data-from-sem="${timelineEscape(issue.item.sem.id)}" data-to-sem="${timelineEscape(dest.id)}"`,
      } : null,
      primary: true,
    });
  });

  genedGaps.slice(0, 3).forEach(gap => {
    const tag = gap.id === 'DIVERSITY-2' ? 'DVUP' : gap.id;
    actions.push({
      level: 'info',
      title: `${gap.label || gap.id} still needs coverage`,
      body: `Find a course for ${gap.id}; the planner can replace a GenEd placeholder once you pick a candidate.`,
      meta: `${gap.have}/${gap.need} planned`,
      button: {
        label: 'Find GenEd',
        attrs: `data-planner-gened="${timelineEscape(tag)}"`,
      },
    });
  });

  if (!actions.length) {
    actions.push({
      level: 'ok',
      title: 'Plan order looks healthy',
      body: 'Credit loads and prerequisite order look workable from this point forward. Keep checking seats before registration.',
      meta: `${visibleSems.length} future terms reviewed`,
    });
  }

  const overloaded = visibleSems.filter(sem => (loads[sem.id] || 0) > PLANNER_MAX_CREDITS).length;
  const underloaded = visibleSems.filter(sem => {
    const load = loads[sem.id] || 0;
    return load > 0 && load < PLANNER_MIN_CREDITS;
  }).length;
  const remainingCredits = visibleSems.reduce((sum, sem) => sum + (loads[sem.id] || 0), 0);
  const readyNow = allItems.filter(item => item.semIndex >= firstOpenIndex && !plannerIsComplete(item.course) && prereqsMet(item.course).met).length;
  return { sems, visibleSems, itemsBySem, indexByCode, loads, actions, issues, genedGaps, overloaded, underloaded, remainingCredits, readyNow };
}

function plannerAvailabilityCandidates(advisor) {
  const out = [];
  advisor.visibleSems.forEach(sem => {
    (advisor.itemsBySem[sem.id] || []).forEach(item => {
      if (out.length >= PLANNER_AVAILABILITY_LIMIT) return;
      if (plannerIsComplete(item.course)) return;
      if (!plannerIsUmdCode(item.course.code)) return;
      out.push({ ...item, plannedTerm: plannerInferTermCode(sem) });
    });
  });
  return out;
}

function plannerRecentTermsForSeason(terms, plannedTerm) {
  const suffix = plannerTermSuffix(plannedTerm);
  return terms
    .filter(term => plannerTermSuffix(term) === suffix && term !== String(plannedTerm))
    .sort((a, b) => Number(b) - Number(a))
    .slice(0, PLANNER_AVAILABILITY_HISTORY);
}

async function plannerFetchSections(code, term) {
  if (typeof umdioFetchSections !== 'function') return null;
  try {
    const sections = await umdioFetchSections(code, term);
    return Array.isArray(sections) ? sections : [];
  } catch {
    return null;
  }
}

async function plannerSectionCount(code, term) {
  const sections = await plannerFetchSections(code, term);
  return Array.isArray(sections) ? sections.length : null;
}

function plannerSeatNumber(value) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

function plannerAvailabilitySeatProfile(sections = []) {
  const list = Array.isArray(sections) ? sections : [];
  if (!list.length) return null;
  const risks = list.map(section => typeof sectionSeatRisk === 'function'
    ? sectionSeatRisk(section)
    : {
      level: plannerSeatNumber(section?.open_seats) > 0 ? 'ok' : 'unknown',
      open: plannerSeatNumber(section?.open_seats),
      wait: plannerSeatNumber(section?.waitlist),
    });
  const known = risks.filter(risk => risk.open !== null);
  const totalOpen = risks.reduce((sum, risk) => sum + (risk.open !== null && risk.open > 0 ? risk.open : 0), 0);
  const waitlistTotal = risks.reduce((sum, risk) => sum + (risk.wait !== null && risk.wait > 0 ? risk.wait : 0), 0);
  const openSections = risks.filter(risk => risk.open !== null && risk.open > 0).length;
  const closedSections = risks.filter(risk => risk.level === 'closed' || (risk.open !== null && risk.open <= 0)).length;
  const tightSections = risks.filter(risk => risk.level === 'risk' || risk.level === 'watch').length;
  const unknownSections = risks.filter(risk => risk.open === null).length;
  const bestOpen = risks.reduce((max, risk) => risk.open !== null ? Math.max(max, risk.open) : max, 0);
  const openText = `${totalOpen} open seat${totalOpen === 1 ? '' : 's'}`;
  const sectionText = `${openSections} open section${openSections === 1 ? '' : 's'}`;
  const parts = known.length ? [`${openText} across ${sectionText}`] : ['seat counts TBA'];
  if (waitlistTotal) parts.push(`${waitlistTotal} waitlisted`);
  if (closedSections) parts.push(`${closedSections} closed`);
  if (tightSections) parts.push(`${tightSections} filling`);
  if (unknownSections) parts.push(`${unknownSections} TBA`);

  let level = 'ok';
  if (known.length && openSections === 0) level = 'danger';
  else if (unknownSections || bestOpen <= 3 || totalOpen <= Math.max(3, list.length) || waitlistTotal || tightSections) level = 'warn';

  return {
    level,
    totalSections: list.length,
    totalOpen,
    waitlistTotal,
    openSections,
    closedSections,
    tightSections,
    unknownSections,
    bestOpen,
    shortLabel: known.length ? `${openText}${waitlistTotal ? `, ${waitlistTotal} waitlisted` : ''}` : 'seat counts TBA',
    detail: `Seat snapshot: ${parts.join('; ')}.`,
  };
}

function plannerAvailabilityScore(exactPosted, exactCount, offeredHistory, historyCounts, seatProfile = null) {
  if (exactPosted && Number(exactCount) > 0) {
    if (seatProfile?.level === 'danger') return 35 + Math.min(10, Number(exactCount));
    if (seatProfile?.level === 'warn') return 78 + Math.min(12, Number(exactCount)) + Math.min(10, Number(seatProfile.totalOpen) || 0);
    return 100 + Math.min(60, Number(exactCount));
  }
  const positiveCounts = (historyCounts || []).filter(count => Number(count) > 0);
  const avg = positiveCounts.length
    ? positiveCounts.reduce((sum, count) => sum + Number(count), 0) / positiveCounts.length
    : 0;
  return offeredHistory * 22 + Math.min(28, avg);
}

function plannerAvailabilityDestinationCandidates(item, advisor) {
  const seenSuffixes = new Set();
  const cr = Number(item.course.cr) || 0;
  const out = [];
  advisor.visibleSems
    .filter(sem => {
      const idx = advisor.sems.findIndex(s => s.id === sem.id);
      return idx > item.semIndex;
    })
    .forEach(sem => {
      const idx = advisor.sems.findIndex(s => s.id === sem.id);
      const term = plannerInferTermCode(sem);
      const suffix = plannerTermSuffix(term);
      if (!suffix || seenSuffixes.has(suffix)) return;
      const loadAfter = (advisor.loads[sem.id] || 0) + cr;
      if (loadAfter > PLANNER_MAX_CREDITS + 4) return;
      if (!plannerCourseReadyBySem(item.course, idx, advisor.indexByCode || {})) return;
      seenSuffixes.add(suffix);
      out.push({ sem, term, suffix, loadAfter, needsBalancing: loadAfter > PLANNER_MAX_CREDITS });
    });
  return out;
}

async function plannerFindAvailabilityDestination(item, advisor, terms, currentScore, profileCache) {
  const posted = new Set(terms);
  const candidates = plannerAvailabilityDestinationCandidates(item, advisor);
  let best = null;
  for (const candidate of candidates) {
    const key = `${normalizeCode(item.course.code)}:${candidate.term}:${candidate.suffix}`;
    let profile = profileCache[key];
    if (!profile) {
      const exactPosted = posted.has(candidate.term);
      const exactSections = exactPosted ? await plannerFetchSections(item.course.code, candidate.term) : null;
      const exactCount = Array.isArray(exactSections) ? exactSections.length : null;
      const seatProfile = Array.isArray(exactSections) && exactSections.length
        ? plannerAvailabilitySeatProfile(exactSections)
        : null;
      const historyTerms = plannerRecentTermsForSeason(terms, candidate.term);
      const historyCounts = await Promise.all(historyTerms.map(term => plannerSectionCount(item.course.code, term)));
      const offeredHistory = historyCounts.filter(count => Number(count) > 0).length;
      profile = {
        exactPosted,
        exactCount,
        seatProfile,
        historyTerms,
        historyCounts,
        offeredHistory,
        score: plannerAvailabilityScore(exactPosted, exactCount, offeredHistory, historyCounts, seatProfile),
      };
      profileCache[key] = profile;
    }
    if (profile.score <= currentScore + 8) continue;
    const availabilityReason = profile.exactPosted && Number(profile.exactCount) > 0
      ? `${profile.exactCount} posted section${Number(profile.exactCount) === 1 ? '' : 's'} in ${plannerTermLabel(candidate.term)}${profile.seatProfile ? `; ${profile.seatProfile.shortLabel}` : ''}`
      : `${profile.offeredHistory}/${profile.historyTerms.length || PLANNER_AVAILABILITY_HISTORY} recent ${plannerSeasonName(candidate.suffix)} terms had sections`;
    const balanceNote = candidate.needsBalancing ? ` · would make ${candidate.sem.name} ${candidate.loadAfter} cr` : '';
    const option = {
      sem: candidate.sem,
      term: candidate.term,
      reason: `${availabilityReason}${balanceNote}`,
      score: profile.score - (candidate.needsBalancing ? 12 : 0),
    };
    if (!best || option.score > best.score) best = option;
  }
  return best;
}

async function plannerAnalyzeAvailability(advisor) {
  if (typeof umdioFetchSemesters !== 'function' || typeof umdioFetchSections !== 'function') {
    return { rows: [], stats: { checked: 0, ok: 0, watch: 0, risk: 0 }, unavailable: true };
  }
  const terms = (await umdioFetchSemesters()).map(String).sort((a, b) => Number(b) - Number(a));
  const posted = new Set(terms);
  const candidates = plannerAvailabilityCandidates(advisor);
  const profileCache = {};
  const rows = await Promise.all(candidates.map(async item => {
    const code = displayCode(item.course.code);
    const plannedTerm = String(item.plannedTerm || '');
    const exactPosted = posted.has(plannedTerm);
    const exactSections = exactPosted ? await plannerFetchSections(item.course.code, plannedTerm) : null;
    const exactCount = Array.isArray(exactSections) ? exactSections.length : null;
    const seatProfile = Array.isArray(exactSections) && exactSections.length
      ? plannerAvailabilitySeatProfile(exactSections)
      : null;
    const historyTerms = plannerRecentTermsForSeason(terms, plannedTerm);
    const historyCounts = await Promise.all(historyTerms.map(term => plannerSectionCount(item.course.code, term)));
    const offeredHistory = historyCounts.filter(count => Number(count) > 0).length;
    const checkedHistory = historyCounts.filter(count => count !== null).length;
    const currentScore = plannerAvailabilityScore(exactPosted, exactCount, offeredHistory, historyCounts, seatProfile);
    let level = 'ok';
    let title = `${code} looks available`;
    let detail = '';

    if (exactPosted && exactCount > 0) {
      if (seatProfile?.level === 'danger') {
        level = 'danger';
        title = `${code} has posted sections but no open seats`;
      } else if (seatProfile?.level === 'warn') {
        level = 'warn';
        title = `${code} seats are tight for ${plannerTermLabel(plannedTerm)}`;
      }
      detail = `${exactCount} posted section${exactCount === 1 ? '' : 's'} for ${plannerTermLabel(plannedTerm)}. ${seatProfile ? seatProfile.detail : ''}`.trim();
    } else if (exactPosted && exactCount === 0 && offeredHistory > 0) {
      level = 'warn';
      title = `${code} is not posted for ${plannerTermLabel(plannedTerm)}`;
      detail = `Recent ${plannerTermLabel(plannedTerm).split(' ')[0]} history shows ${offeredHistory}/${checkedHistory || historyTerms.length} term${offeredHistory === 1 ? '' : 's'} with sections.`;
    } else if (exactPosted && exactCount === 0) {
      level = 'danger';
      title = `${code} has no posted sections`;
      detail = `No sections found for ${plannerTermLabel(plannedTerm)} or recent matching terms checked.`;
    } else if (!exactPosted && offeredHistory > 1) {
      detail = `${plannerTermLabel(plannedTerm)} is not posted yet; ${offeredHistory}/${checkedHistory || historyTerms.length} recent matching terms had sections.`;
    } else if (!exactPosted && offeredHistory === 1) {
      level = 'warn';
      title = `${code} has thin ${plannerTermLabel(plannedTerm).split(' ')[0]} history`;
      detail = `Only 1 recent matching term had sections. Keep a backup semester or alternate course ready.`;
    } else {
      level = 'danger';
      title = `${code} has no recent matching-term sections`;
      detail = `${plannerTermLabel(plannedTerm)} is not posted yet and recent matching terms did not show sections.`;
    }

    const suggestion = level === 'ok'
      ? null
      : await plannerFindAvailabilityDestination(item, advisor, terms, currentScore, profileCache);

    return {
      code,
      title,
      detail,
      level,
      semName: item.sem.name,
      fromSemId: item.sem.id,
      plannedTerm,
      seatProfile,
      historyTerms,
      suggestion,
    };
  }));
  const stats = rows.reduce((acc, row) => {
    acc.checked += 1;
    if (row.level === 'danger') acc.risk += 1;
    else if (row.level === 'warn') acc.watch += 1;
    else acc.ok += 1;
    return acc;
  }, { checked: 0, ok: 0, watch: 0, risk: 0 });
  return { rows, stats, unavailable: false };
}

function plannerAvailabilityRow(row) {
  return `
    <div class="planner-availability-row ${timelineEscape(row.level)}">
      <div>
        <strong>${timelineEscape(row.title)}</strong>
        <span>${timelineEscape(row.semName)} · planned as ${timelineEscape(plannerTermLabel(row.plannedTerm))}</span>
      </div>
      <p>${timelineEscape(row.detail)}</p>
      ${row.suggestion ? `<div class="planner-availability-action">
        <span>Better fit: ${timelineEscape(row.suggestion.sem.name)} · ${timelineEscape(row.suggestion.reason)}</span>
        <button class="btn small" type="button" data-planner-move="${timelineEscape(row.code)}" data-from-sem="${timelineEscape(row.fromSemId)}" data-to-sem="${timelineEscape(row.suggestion.sem.id)}">Move there</button>
      </div>` : ''}
    </div>
  `;
}

async function renderPlannerAvailability(advisor) {
  const root = document.getElementById('planner-availability');
  if (!root) return;
  const seq = ++plannerAvailabilitySeq;
  root.innerHTML = `
    <div class="planner-availability-head">
      <h3>Term Availability</h3>
      <span>Checking posted UMD sections...</span>
    </div>
  `;
  const result = await plannerAnalyzeAvailability(advisor);
  if (seq !== plannerAvailabilitySeq) return;
  if (result.unavailable) {
    root.innerHTML = '<div class="planner-availability-empty">Availability checks need the UMD section API.</div>';
    return;
  }
  root.innerHTML = `
    <div class="planner-availability-head">
      <h3>Term Availability</h3>
      <span>${result.stats.checked} checked · ${result.stats.ok} likely · ${result.stats.watch} watch · ${result.stats.risk} risk</span>
    </div>
    <div class="planner-availability-grid">
      ${result.rows.length ? result.rows.map(plannerAvailabilityRow).join('') : '<div class="planner-availability-empty">No upcoming UMD-coded courses to check.</div>'}
    </div>
  `;
}

function renderPlannerAdvisor() {
  const root = document.getElementById('timeline-plan-advisor');
  if (!root) return;
  const advisor = plannerBuildAdvisor();
  const checklist = plannerRegistrationChecklist(advisor);
  const questions = plannerAdvisorQuestions(advisor, checklist);
  const semRows = advisor.visibleSems.slice(0, 8).map(sem => {
    const load = advisor.loads[sem.id] || 0;
    const counts = plannerStatusCounts(advisor.itemsBySem[sem.id] || []);
    const level = load > PLANNER_MAX_CREDITS ? 'danger' : load && load < PLANNER_MIN_CREDITS ? 'warn' : 'ok';
    return `
      <div class="planner-term ${level}">
        <strong>${timelineEscape(sem.name)}</strong>
        <span>${load} cr · ${counts.ready} ready · ${counts.locked} locked</span>
      </div>
    `;
  }).join('');

  root.innerHTML = `
    <div class="planner-head">
      <div>
        <h2>Automatic Planning Advisor</h2>
        <p>Checks future semesters for credit load, prerequisite order, GenEd gaps, and movable courses.</p>
      </div>
      <button class="btn" type="button" data-planner-refresh>Refresh</button>
    </div>
    <div class="planner-stats">
      <div class="planner-stat"><strong>${advisor.remainingCredits}</strong><span>remaining planned credits</span></div>
      <div class="planner-stat ${advisor.overloaded ? 'danger' : 'ok'}"><strong>${advisor.overloaded}</strong><span>overloaded terms</span></div>
      <div class="planner-stat ${advisor.issues.length ? 'danger' : 'ok'}"><strong>${advisor.issues.length}</strong><span>prereq order issues</span></div>
      <div class="planner-stat ${advisor.genedGaps.length ? 'warn' : 'ok'}"><strong>${advisor.genedGaps.length}</strong><span>GenEd gaps</span></div>
    </div>
    ${plannerChecklistHtml(checklist)}
    ${plannerAdvisorQuestionsHtml(questions)}
    <div class="planner-body">
      <div>
        <h3>Recommended Moves</h3>
        <div class="planner-actions">${advisor.actions.slice(0, 8).map(plannerActionCard).join('')}</div>
      </div>
      <div>
        <h3>Future Load Map</h3>
        <div class="planner-terms">${semRows || '<p class="reco-empty">No future terms with remaining courses.</p>'}</div>
      </div>
    </div>
    <div id="planner-availability" class="planner-availability"></div>
  `;
  renderPlannerAvailability(advisor);
}

function renderTimeline() {
  renderPlannerAdvisor();
  renderPlanChangeHistory();
  const rail = document.getElementById('timeline-rail');
  if (!rail) return;
  rail.innerHTML = '';
  DEFAULT_TIMELINE_EVENTS.forEach(ev => {
    const el = document.createElement('div');
    el.className = 'timeline-event ' + (ev.phase || '');
    el.innerHTML = `
      <div class="timeline-card">
        <div class="timeline-date">${timelineEscape(ev.date)}</div>
        <div class="timeline-title">${timelineEscape(ev.title)}</div>
        <div class="timeline-desc">${timelineEscape(ev.desc)}</div>
      </div>
    `;
    rail.appendChild(el);
  });
}

function plannerChangeIcon(type) {
  if (type === 'term-move') return '↔';
  if (type === 'term-move-undo') return '↶';
  if (type === 'section-swap') return '▦';
  if (type === 'auto-pick') return '✓';
  if (type === 'section-pick') return '◉';
  if (type === 'section-pick-undo') return '↶';
  if (type === 'placeholder-section-replacement' || type === 'placeholder-replacement') return '↺';
  if (type === 'placeholder-undo') return '↶';
  if (type === 'prior-credit') return 'T';
  if (type === 'prior-credit-undo') return '↶';
  if (type === 'clear') return '×';
  return '•';
}

function plannerChangeTime(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function plannerChangeCanUndo(change) {
  return plannerChangeUndoAvailability(change).can;
}

function plannerClonePlain(value) {
  if (value == null) return value;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return Array.isArray(value) ? value.slice() : { ...value };
  }
}

function plannerHasOwn(value, key) {
  return !!value && Object.prototype.hasOwnProperty.call(value, key);
}

function plannerComparableValue(value) {
  if (Array.isArray(value)) return value.map(plannerComparableValue);
  if (value && typeof value === 'object') {
    return Object.keys(value).sort().reduce((acc, key) => {
      if (key === 'updatedAt') return acc;
      acc[key] = plannerComparableValue(value[key]);
      return acc;
    }, {});
  }
  return value == null ? null : value;
}

function plannerValuesEqual(actual, expected) {
  return JSON.stringify(plannerComparableValue(actual)) === JSON.stringify(plannerComparableValue(expected));
}

function plannerFormatCodes(codes) {
  const clean = (codes || []).map(code => String(code || '').trim()).filter(Boolean);
  if (!clean.length) return 'That course';
  return clean.slice(0, 3).join(', ') + (clean.length > 3 ? ` +${clean.length - 3} more` : '');
}

function plannerCourseStateSnapshot(code, preferredKey = '') {
  const key = String(preferredKey || (typeof courseStateKey === 'function' ? courseStateKey(code) : code) || '');
  const courses = state.courses || {};
  const had = !!key && plannerHasOwn(courses, key);
  return { had, value: had ? plannerClonePlain(courses[key]) : null };
}

function plannerSelectedSectionSnapshot(semId, code) {
  const bucket = (state.selectedSections || {})[semId] || {};
  const key = normalizeCode(code || '');
  const had = !!key && plannerHasOwn(bucket, key);
  return { had, value: had ? plannerClonePlain(bucket[key]) : null };
}

function plannerUndoSemester(location) {
  const loc = location || {};
  const semId = String(loc.semId || '');
  if (!semId) return null;
  const active = mutableSchedule().find(sem => sem.id === semId);
  const custom = (state.customSemesters || []).find(sem => sem.id === semId);
  if (loc.collection === 'custom-semester') return custom || active || null;
  return active || custom || null;
}

function plannerUndoCourseSlot(undo) {
  const loc = undo?.location || {};
  const replacementNorm = normalizeCode(undo.replacementCode || '');
  const originalNorm = normalizeCode(undo.originalCode || '');
  if (loc.type === 'custom-course') {
    const list = state.customCourses || [];
    const preferred = Number.isInteger(loc.index) ? loc.index : -1;
    if (preferred >= 0 && list[preferred] && normalizeCode(list[preferred].code) === replacementNorm) {
      return { list, index: preferred, custom: true };
    }
    const index = list.findIndex(course =>
      (!loc.semId || course.semId === loc.semId)
      && [replacementNorm, originalNorm].includes(normalizeCode(course.code))
    );
    return index >= 0 ? { list, index, custom: true } : null;
  }
  const sem = plannerUndoSemester(loc);
  const list = sem?.courses || [];
  const preferred = Number.isInteger(loc.index) ? loc.index : -1;
  if (preferred >= 0 && list[preferred] && normalizeCode(list[preferred].code) === replacementNorm) {
    return { list, index: preferred, sem };
  }
  const index = list.findIndex(course => [replacementNorm, originalNorm].includes(normalizeCode(course.code)));
  return index >= 0 ? { list, index, sem } : null;
}

function plannerRestoreCourseStatus(code, hadValue, value, preferredKey = '') {
  const key = String(preferredKey || (typeof courseStateKey === 'function' ? courseStateKey(code) : code) || '');
  if (!key) return;
  state.courses = state.courses || {};
  if (hadValue) state.courses[key] = plannerClonePlain(value);
  else delete state.courses[key];
}

function plannerRestoreSelectedSection(semId, code, hadValue, value) {
  const term = String(semId || '');
  const key = normalizeCode(code || '');
  if (!term || !key) return;
  state.selectedSections = state.selectedSections || {};
  state.selectedSections[term] = state.selectedSections[term] || {};
  if (hadValue) state.selectedSections[term][key] = plannerClonePlain(value);
  else delete state.selectedSections[term][key];
  if (!Object.keys(state.selectedSections[term]).length) delete state.selectedSections[term];
}

function plannerPlaceholderUndoAvailability(change) {
  const undo = change?.undo;
  if (undo?.kind !== 'placeholder-replacement' || undo.appliedAt) return { can: false, reason: '' };
  const slot = plannerUndoCourseSlot(undo);
  if (!slot || slot.index < 0) {
    return { can: false, reason: 'Undo unavailable: the replacement course was moved or removed.' };
  }
  const replacementCode = undo.replacementCode || 'the replacement course';
  const replacementNorm = normalizeCode(undo.replacementCode || '');
  if (replacementNorm && normalizeCode(slot.list[slot.index]?.code) !== replacementNorm) {
    return { can: false, reason: `Undo unavailable: ${replacementCode} changed after this replacement.` };
  }
  if (plannerHasOwn(undo, 'expectedReplacementSelectedSection')) {
    const expectedHad = !!undo.hadExpectedReplacementSelectedSection;
    const expectedValue = expectedHad ? undo.expectedReplacementSelectedSection : null;
    const current = plannerSelectedSectionSnapshot(undo.semId, undo.replacementCode);
    if (current.had !== expectedHad || !plannerValuesEqual(current.value, expectedValue)) {
      return { can: false, reason: `Undo unavailable: ${replacementCode}'s section pick changed after this replacement.` };
    }
  }
  return { can: true, reason: '' };
}

function plannerPriorCreditUndoAvailability(change) {
  const undo = change?.undo;
  if (undo?.kind !== 'prior-credit' || undo.appliedAt) return { can: false, reason: '' };
  if (!Array.isArray(undo.entries) || !undo.entries.length) {
    return { can: false, reason: 'Undo unavailable: this prior-credit change has no restore data.' };
  }
  const changed = plannerPriorCreditChangedCodes(change);
  if (changed.length) {
    return {
      can: false,
      reason: `Undo unavailable: ${plannerFormatCodes(changed)} ${changed.length === 1 ? 'was' : 'were'} changed after these credits were applied.`,
    };
  }
  return { can: true, reason: '' };
}

function plannerTermMoveSelectedSectionMismatch(undo) {
  if (undo?.kind !== 'term-move') return null;
  const code = String(undo.code || '').trim();
  if (!code) return null;
  if (plannerHasOwn(undo, 'expectedFromSelectedSection')) {
    const expectedHad = !!undo.hadExpectedFromSelectedSection;
    const expectedValue = expectedHad ? undo.expectedFromSelectedSection : null;
    const current = plannerSelectedSectionSnapshot(undo.fromSemId, code);
    if (current.had !== expectedHad || !plannerValuesEqual(current.value, expectedValue)) {
      return {
        side: 'source',
        semId: String(undo.fromSemId || ''),
        code,
        label: 'source-term section pick',
      };
    }
  }
  if (plannerHasOwn(undo, 'expectedToSelectedSection')) {
    const expectedHad = !!undo.hadExpectedToSelectedSection;
    const expectedValue = expectedHad ? undo.expectedToSelectedSection : null;
    const current = plannerSelectedSectionSnapshot(undo.toSemId, code);
    if (current.had !== expectedHad || !plannerValuesEqual(current.value, expectedValue)) {
      return {
        side: 'target',
        semId: String(undo.toSemId || ''),
        code,
        label: 'target-term section pick',
      };
    }
  }
  return null;
}

function plannerRecommendationSectionPickMismatch(undo) {
  if (undo?.kind !== 'recommendation-section-pick') return null;
  const code = String(undo.code || '').trim();
  if (!code) return null;
  if (plannerHasOwn(undo, 'expectedTargetSelectedSection')) {
    const expectedHad = !!undo.hadExpectedTargetSelectedSection;
    const expectedValue = expectedHad ? undo.expectedTargetSelectedSection : null;
    const current = plannerSelectedSectionSnapshot(undo.targetSemId, code);
    if (current.had !== expectedHad || !plannerValuesEqual(current.value, expectedValue)) {
      return {
        side: 'target',
        semId: String(undo.targetSemId || ''),
        code,
        label: 'picked section',
      };
    }
  }
  if (plannerHasOwn(undo, 'expectedSourceSelectedSection') && undo.sourceSemId) {
    const expectedHad = !!undo.hadExpectedSourceSelectedSection;
    const expectedValue = expectedHad ? undo.expectedSourceSelectedSection : null;
    const current = plannerSelectedSectionSnapshot(undo.sourceSemId, code);
    if (current.had !== expectedHad || !plannerValuesEqual(current.value, expectedValue)) {
      return {
        side: 'source',
        semId: String(undo.sourceSemId || ''),
        code,
        label: 'source-term section pick',
      };
    }
  }
  return null;
}

function plannerRecommendationSectionPickUndoAvailability(change) {
  const undo = change?.undo;
  if (undo?.kind !== 'recommendation-section-pick' || undo.appliedAt) return { can: false, reason: '' };
  const code = String(undo.code || '').trim();
  const norm = normalizeCode(code);
  const target = String(undo.targetSemId || '');
  const source = String(undo.sourceSemId || '');
  if (!norm || !target) {
    return { can: false, reason: 'Undo unavailable: this Smart next pick has incomplete restore data.' };
  }
  const sems = getAllSemesters();
  const targetSem = sems.find(sem => sem.id === target);
  if (!targetSem) {
    return { can: false, reason: `Undo unavailable: ${code}'s picked term is no longer in the plan.` };
  }
  const mismatch = plannerRecommendationSectionPickMismatch(undo);
  if (mismatch) {
    const reason = mismatch.side === 'source'
      ? `${code}'s source-term section pick changed after Smart next picks moved it.`
      : `${code}'s picked section changed after Smart next picks saved it.`;
    return { can: false, reason: `Undo unavailable: ${reason}` };
  }

  if (undo.moved) {
    if (undo.custom) {
      const current = (state.customCourses || []).find(course => course.semId === target && normalizeCode(course.code) === norm);
      if (!current) return { can: false, reason: `Undo unavailable: ${code} was moved or removed after this Smart next pick.` };
      if (source && (state.customCourses || []).some(course => course.semId === source && normalizeCode(course.code) === norm)) {
        return { can: false, reason: `Undo unavailable: ${code} is already back in ${undo.sourceName || 'the original term'}.` };
      }
      return { can: true, reason: '' };
    }
    const sourceSem = sems.find(sem => sem.id === source);
    if (!sourceSem) {
      return { can: false, reason: `Undo unavailable: ${code}'s original term is no longer in the plan.` };
    }
    if (!(targetSem.courses || []).some(course => normalizeCode(course.code) === norm)) {
      return { can: false, reason: `Undo unavailable: ${code} was moved or removed after this Smart next pick.` };
    }
    if ((sourceSem.courses || []).some(course => normalizeCode(course.code) === norm)) {
      return { can: false, reason: `Undo unavailable: ${code} is already back in ${sourceSem.name || 'the original term'}.` };
    }
    return { can: true, reason: '' };
  }

  if (undo.custom) {
    const current = (state.customCourses || []).find(course => course.semId === target && normalizeCode(course.code) === norm);
    if (!current) return { can: false, reason: `Undo unavailable: ${code} was moved or removed after this Smart next pick.` };
  } else if (!(targetSem.courses || []).some(course => normalizeCode(course.code) === norm)) {
    return { can: false, reason: `Undo unavailable: ${code} was moved or removed after this Smart next pick.` };
  }
  return { can: true, reason: '' };
}

function plannerTermMoveUndoAvailability(change) {
  const undo = change?.undo;
  if (undo?.kind !== 'term-move' || undo.appliedAt) return { can: false, reason: '' };
  const code = String(undo.code || '').trim();
  const norm = normalizeCode(code);
  const from = String(undo.fromSemId || '');
  const to = String(undo.toSemId || '');
  if (!norm || !from || !to) {
    return { can: false, reason: 'Undo unavailable: this term move has incomplete restore data.' };
  }
  const sems = getAllSemesters();
  const fromSem = sems.find(sem => sem.id === from);
  const toSem = sems.find(sem => sem.id === to);
  if (!fromSem || !toSem) {
    return { can: false, reason: `Undo unavailable: ${code} moved between terms that are no longer in the plan.` };
  }
  const sectionMismatch = plannerTermMoveSelectedSectionMismatch(undo);
  if (sectionMismatch) {
    return { can: false, reason: `Undo unavailable: ${code}'s ${sectionMismatch.label} changed after this term move.` };
  }

  if (undo.custom) {
    const current = (state.customCourses || []).find(course => course.semId === to && normalizeCode(course.code) === norm);
    if (!current) {
      return { can: false, reason: `Undo unavailable: ${code} was moved or removed after this term move.` };
    }
    const duplicate = (state.customCourses || []).some(course => course.semId === from && normalizeCode(course.code) === norm);
    if (duplicate) {
      return { can: false, reason: `Undo unavailable: ${code} is already back in ${fromSem.name || 'the original term'}.` };
    }
    return { can: true, reason: '' };
  }

  const currentIdx = (toSem.courses || []).findIndex(course => normalizeCode(course.code) === norm);
  if (currentIdx < 0) {
    return { can: false, reason: `Undo unavailable: ${code} was moved or removed after this term move.` };
  }
  if ((fromSem.courses || []).some(course => normalizeCode(course.code) === norm)) {
    return { can: false, reason: `Undo unavailable: ${code} is already back in ${fromSem.name || 'the original term'}.` };
  }
  return { can: true, reason: '' };
}

function plannerChangeUndoAvailability(change) {
  if (change?.undo?.kind === 'placeholder-replacement') return plannerPlaceholderUndoAvailability(change);
  if (change?.undo?.kind === 'prior-credit') return plannerPriorCreditUndoAvailability(change);
  if (change?.undo?.kind === 'term-move') return plannerTermMoveUndoAvailability(change);
  if (change?.undo?.kind === 'recommendation-section-pick') return plannerRecommendationSectionPickUndoAvailability(change);
  return { can: false, reason: '' };
}

function plannerPriorCreditChangedCodes(change) {
  const undo = change?.undo;
  if (undo?.kind !== 'prior-credit' || !Array.isArray(undo.entries)) return [];
  const changed = [];
  undo.entries.forEach(entry => {
    const expected = plannerHasOwn(entry, 'appliedCourseState')
      ? entry.appliedCourseState
      : { status: 'transfer', grade: '' };
    const current = plannerCourseStateSnapshot(entry.code, entry.stateKey);
    if (!current.had || !plannerValuesEqual(current.value, expected)) changed.push(entry.code);
  });
  return changed;
}

function plannerFindVisiblePlanCourse(code) {
  const norm = normalizeCode(code || '');
  if (!norm) return null;
  return flatCourses().find(course => normalizeCode(course.code) === norm) || null;
}

function plannerPriorCreditChangeGroups(change) {
  const changed = plannerPriorCreditChangedCodes(change);
  const visible = [];
  const missing = [];
  changed.forEach(code => {
    const course = plannerFindVisiblePlanCourse(code);
    if (course) visible.push({ code, course });
    else missing.push(code);
  });
  return { changed, visible, missing };
}

function plannerChangeReviewTarget(change) {
  const undo = change?.undo;
  if (undo?.kind === 'placeholder-replacement' && !undo.appliedAt) {
    const course = plannerFindVisiblePlanCourse(undo.replacementCode);
    if (!course) return null;
    return {
      code: course.code,
      label: 'Show edited course',
    };
  }
  if (undo?.kind === 'prior-credit' && !undo.appliedAt) {
    const groups = plannerPriorCreditChangeGroups(change);
    const target = groups.visible[0];
    if (!target) return null;
    const hasMissing = groups.missing.length > 0;
    return {
      code: target.course?.code || target.code,
      label: hasMissing
        ? (groups.visible.length > 1 ? 'Show first Plan edit' : 'Show Plan edit')
        : (groups.changed.length > 1 ? 'Show first edited course' : 'Show edited course'),
    };
  }
  if (undo?.kind === 'term-move' && !undo.appliedAt) {
    const code = undo.code || '';
    const course = plannerFindVisiblePlanCourse(code);
    if (!course) return null;
    return {
      code: course.code,
      label: 'Show moved course',
    };
  }
  if (undo?.kind === 'recommendation-section-pick' && !undo.appliedAt) {
    const course = plannerFindVisiblePlanCourse(undo.code);
    if (!course) return null;
    return {
      code: course.code,
      label: 'Show picked course',
    };
  }
  return null;
}

function plannerChangePriorCreditTarget(change) {
  const undo = change?.undo;
  if (undo?.kind !== 'prior-credit' || undo.appliedAt) return null;
  const groups = plannerPriorCreditChangeGroups(change);
  if (!groups.missing.length) return null;
  const removedLabel = groups.missing.length === 1 ? 'Review removed credit' : `Review ${groups.missing.length} removed credits`;
  return {
    codes: groups.missing.slice(),
    label: removedLabel,
  };
}

function plannerPriorCreditRecoveryHtml(codes = []) {
  const cleanCodes = Array.from(new Set((codes || [])
    .map(code => String(code || '').trim())
    .filter(Boolean)));
  if (!cleanCodes.length) return '';
  const count = cleanCodes.length;
  const label = count === 1 ? 'removed prior-credit entry' : 'removed prior-credit entries';
  return `
    <div class="prior-recovery-card">
      <strong>${timelineEscape(count)} ${timelineEscape(label)} need review</strong>
      <p>${timelineEscape(plannerFormatCodes(cleanCodes))} ${count === 1 ? 'is' : 'are'} no longer in your plan. Re-add the matching AP/IB preset or paste exact UMD course codes after checking official sources.</p>
    </div>
  `;
}

function plannerRenderPriorCreditRecovery(codes = []) {
  const root = document.getElementById('set-prior-recovery-note');
  if (!root) return false;
  const html = plannerPriorCreditRecoveryHtml(codes);
  root.innerHTML = html;
  root.hidden = !html;
  return !!html;
}

function plannerChangeScheduleTarget(change) {
  const undo = change?.undo;
  if (undo?.kind === 'recommendation-section-pick' && !undo.appliedAt) {
    const mismatch = plannerRecommendationSectionPickMismatch(undo);
    if (!mismatch || mismatch.side !== 'target') return null;
    if (!mismatch.semId || !getAllSemesters().some(item => item.id === mismatch.semId)) return null;
    return {
      semId: mismatch.semId,
      code: mismatch.code,
      label: 'Show picked schedule',
    };
  }
  if (undo?.kind === 'term-move' && !undo.appliedAt) {
    const mismatch = plannerTermMoveSelectedSectionMismatch(undo);
    if (!mismatch || mismatch.side !== 'target') return null;
    if (!mismatch.semId || !getAllSemesters().some(item => item.id === mismatch.semId)) return null;
    return {
      semId: mismatch.semId,
      code: mismatch.code,
      label: 'Show target schedule',
    };
  }
  if (undo?.kind !== 'placeholder-replacement' || undo.appliedAt) return null;
  if (!undo.semId || !plannerHasOwn(undo, 'expectedReplacementSelectedSection')) return null;
  const expectedHad = !!undo.hadExpectedReplacementSelectedSection;
  const expectedValue = expectedHad ? undo.expectedReplacementSelectedSection : null;
  const current = plannerSelectedSectionSnapshot(undo.semId, undo.replacementCode);
  if (current.had === expectedHad && plannerValuesEqual(current.value, expectedValue)) return null;
  const sem = getAllSemesters().find(item => item.id === undo.semId);
  if (!sem) return null;
  return {
    semId: undo.semId,
    code: undo.replacementCode || '',
    label: 'Show schedule term',
  };
}

function plannerChangeTermTarget(change) {
  const undo = change?.undo;
  if (undo?.kind === 'recommendation-section-pick' && !undo.appliedAt) {
    const mismatch = plannerRecommendationSectionPickMismatch(undo);
    if (mismatch?.side !== 'source') return null;
    const semId = String(mismatch.semId || '');
    if (!semId || !getAllSemesters().some(sem => sem.id === semId)) return null;
    return {
      semId,
      label: 'Show source term',
    };
  }
  if (undo?.kind === 'term-move' && !undo.appliedAt) {
    const mismatch = plannerTermMoveSelectedSectionMismatch(undo);
    const semId = String(mismatch?.semId || undo.toSemId || undo.fromSemId || '');
    if (!semId || !getAllSemesters().some(sem => sem.id === semId)) return null;
    const label = mismatch?.side === 'source'
      ? 'Show source term'
      : (mismatch?.side === 'target' ? 'Show target term' : 'Show move term');
    return {
      semId,
      label,
    };
  }
  if (undo?.kind !== 'placeholder-replacement' || undo.appliedAt) return null;
  const semId = String(undo.location?.semId || undo.semId || '');
  if (!semId || !getAllSemesters().some(sem => sem.id === semId)) return null;
  const slot = plannerUndoCourseSlot(undo);
  const replacementNorm = normalizeCode(undo.replacementCode || '');
  const replacementStillInSlot = slot && slot.index >= 0
    && (!replacementNorm || normalizeCode(slot.list[slot.index]?.code) === replacementNorm);
  if (replacementStillInSlot) return null;
  return {
    semId,
    label: 'Show original term',
  };
}

function plannerResetPlanFilters() {
  currentFilter = 'all';
  searchQuery = '';
  const input = document.getElementById('search-input');
  if (input) input.value = '';
  document.querySelectorAll('.filter-chip[data-filter]').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.filter === 'all');
  });
}

function plannerJumpToPlanCourse(code) {
  const norm = normalizeCode(code || '');
  if (!norm) return false;
  plannerResetPlanFilters();
  if (typeof switchTab === 'function') switchTab('plan');
  renderSemesters();
  requestAnimationFrame(() => {
    const row = Array.from(document.querySelectorAll('#semesters-container .course'))
      .find(el => normalizeCode(el.dataset.code) === norm);
    if (!row) {
      if (typeof toastInfo === 'function') toastInfo('That course is not visible in the current Plan.');
      return;
    }
    row.scrollIntoView({ block: 'center', behavior: 'smooth' });
    row.classList.add('roadmap-plan-focus');
    clearTimeout(plannerJumpToPlanCourse._t);
    plannerJumpToPlanCourse._t = setTimeout(() => row.classList.remove('roadmap-plan-focus'), 1800);
  });
  return true;
}

function plannerJumpToPlanSemester(semId) {
  const targetId = String(semId || '');
  if (!targetId) return false;
  plannerResetPlanFilters();
  if (typeof switchTab === 'function') switchTab('plan');
  renderSemesters();
  requestAnimationFrame(() => {
    const row = Array.from(document.querySelectorAll('#semesters-container .semester[data-sem-id]'))
      .find(el => el.dataset.semId === targetId);
    if (!row) {
      if (typeof toastInfo === 'function') toastInfo('That original term is not visible in the current Plan.');
      return;
    }
    row.scrollIntoView({ block: 'center', behavior: 'smooth' });
    row.classList.add('timeline-plan-term-focus');
    clearTimeout(plannerJumpToPlanSemester._t);
    plannerJumpToPlanSemester._t = setTimeout(() => row.classList.remove('timeline-plan-term-focus'), 1800);
  });
  return true;
}

function plannerOpenChangeReviewTarget(changeId) {
  const change = recentPlanChanges().find(item => item.id === String(changeId || ''));
  const target = plannerChangeReviewTarget(change);
  if (!target?.code) {
    if (typeof toastInfo === 'function') toastInfo('That edited course is no longer in the Plan.');
    return false;
  }
  return plannerJumpToPlanCourse(target.code);
}

function plannerFocusScheduleCourse(code, attempt = 0) {
  const norm = normalizeCode(code || '');
  if (!norm) return false;
  const row = Array.from(document.querySelectorAll('#schedule-section-list .section-pick[data-code]'))
    .find(el => normalizeCode(el.dataset.code) === norm);
  if (!row) {
    if (attempt < 24) {
      setTimeout(() => plannerFocusScheduleCourse(code, attempt + 1), 120);
      return true;
    }
    if (typeof toastInfo === 'function') toastInfo('That course is not visible in this Schedule term.');
    return false;
  }
  row.scrollIntoView({ block: 'center', behavior: 'smooth' });
  row.classList.add('timeline-schedule-focus');
  clearTimeout(plannerFocusScheduleCourse._t);
  plannerFocusScheduleCourse._t = setTimeout(() => row.classList.remove('timeline-schedule-focus'), 1800);
  return true;
}

function plannerOpenChangeScheduleTarget(changeId) {
  const change = recentPlanChanges().find(item => item.id === String(changeId || ''));
  const target = plannerChangeScheduleTarget(change);
  if (!target?.semId) {
    if (typeof toastInfo === 'function') toastInfo('That Schedule term is no longer available.');
    return false;
  }
  plannerOpenSchedule(target.semId);
  if (target.code) plannerFocusScheduleCourse(target.code);
  return true;
}

function plannerOpenChangeTermTarget(changeId) {
  const change = recentPlanChanges().find(item => item.id === String(changeId || ''));
  const target = plannerChangeTermTarget(change);
  if (!target?.semId) {
    if (typeof toastInfo === 'function') toastInfo('That original term is no longer in the Plan.');
    return false;
  }
  return plannerJumpToPlanSemester(target.semId);
}

function plannerFocusSettingsPriorCredit(attempt = 0) {
  const section = document.getElementById('settings-prior-credit-section');
  if (!section) {
    if (attempt < 8) {
      setTimeout(() => plannerFocusSettingsPriorCredit(attempt + 1), 80);
      return true;
    }
    return false;
  }
  section.scrollIntoView({ block: 'center', behavior: 'smooth' });
  section.classList.add('timeline-settings-focus');
  const raw = document.getElementById('set-prior-codes');
  if (raw && typeof raw.focus === 'function') {
    try {
      raw.focus({ preventScroll: true });
    } catch {
      raw.focus();
    }
  }
  clearTimeout(plannerFocusSettingsPriorCredit._t);
  plannerFocusSettingsPriorCredit._t = setTimeout(() => section.classList.remove('timeline-settings-focus'), 1800);
  return true;
}

function plannerOpenPriorCreditReview(changeId) {
  const change = recentPlanChanges().find(item => item.id === String(changeId || ''));
  const target = plannerChangePriorCreditTarget(change);
  if (!target) {
    if (typeof toastInfo === 'function') toastInfo('That prior-credit review is no longer needed.');
    return false;
  }
  if (typeof openSettings !== 'function') {
    if (typeof toastInfo === 'function') toastInfo('Settings are not available yet.');
    return false;
  }
  openSettings();
  plannerRenderPriorCreditRecovery(target.codes);
  plannerFocusSettingsPriorCredit();
  return true;
}

function plannerApplyPlaceholderUndo(change) {
  const undo = change?.undo;
  const availability = plannerPlaceholderUndoAvailability(change);
  if (!availability.can) {
    if (typeof toastError === 'function') toastError(availability.reason || 'That change cannot be undone here.');
    return false;
  }
  const slot = plannerUndoCourseSlot(undo);
  if (!slot || slot.index < 0) {
    if (typeof toastError === 'function') toastError('Could not find the replacement course to undo.');
    return false;
  }
  const replacementNorm = normalizeCode(undo.replacementCode || '');
  if (replacementNorm && normalizeCode(slot.list[slot.index]?.code) !== replacementNorm) {
    if (typeof toastError === 'function') toastError('That replacement changed after it was made, so undo is not available.');
    return false;
  }
  const restoredCourse = plannerClonePlain(undo.originalCourse || {});
  if (slot.custom) {
    slot.list[slot.index] = {
      ...restoredCourse,
      isCustom: true,
      semId: undo.semId || restoredCourse.semId || undo.location?.semId || '',
    };
  } else {
    slot.list[slot.index] = restoredCourse;
  }
  plannerRestoreCourseStatus(undo.originalCode, undo.hadOriginalCourseState, undo.originalCourseState);
  plannerRestoreCourseStatus(undo.replacementCode, undo.hadReplacementCourseState, undo.replacementCourseState);
  plannerRestoreSelectedSection(undo.semId, undo.originalCode, undo.hadOriginalSelectedSection, undo.originalSelectedSection);
  plannerRestoreSelectedSection(undo.semId, undo.replacementCode, undo.hadReplacementSelectedSection, undo.replacementSelectedSection);
  undo.appliedAt = new Date().toISOString();
  recordPlanChange({
    type: 'placeholder-undo',
    source: 'Timeline',
    title: `Restored ${undo.originalCode || 'placeholder'}`,
    detail: `${undo.replacementCode || 'Replacement course'} was reverted to ${undo.originalCode || 'the original placeholder'}.`,
    meta: 'Undo placeholder replacement',
  }, { save: false });
  saveState();
  render();
  if (currentTab === 'timeline') renderTimeline();
  if (typeof toastSuccess === 'function') toastSuccess(`Restored ${undo.originalCode || 'placeholder'}.`);
  return true;
}

function plannerRemovePriorCustomCourse(entry) {
  if (!entry?.addedCustomCourse) return false;
  const norm = normalizeCode(entry.code || '');
  const before = (state.customCourses || []).length;
  state.customCourses = (state.customCourses || []).filter(course => {
    if (normalizeCode(course.code) !== norm) return true;
    if (course.isPriorCredit || entry.customCourse?.isPriorCredit) return false;
    return true;
  });
  return state.customCourses.length !== before;
}

function plannerApplyPriorCreditUndo(change) {
  const undo = change?.undo;
  const availability = plannerPriorCreditUndoAvailability(change);
  if (!availability.can || !Array.isArray(undo.entries)) {
    if (typeof toastError === 'function') toastError(availability.reason || 'That change cannot be undone here.');
    return false;
  }
  const restored = [];
  const removed = [];
  undo.entries.forEach(entry => {
    plannerRestoreCourseStatus(entry.code, entry.hadCourseState, entry.courseState, entry.stateKey);
    if (plannerRemovePriorCustomCourse(entry)) removed.push(entry.code);
    restored.push(entry.code);
  });
  undo.appliedAt = new Date().toISOString();
  recordPlanChange({
    type: 'prior-credit-undo',
    source: 'Timeline',
    title: `Undid ${restored.length} prior-credit course${restored.length === 1 ? '' : 's'}`,
    detail: restored.slice(0, 8).join(', ') + (restored.length > 8 ? ` +${restored.length - 8} more` : ''),
    meta: removed.length ? `${removed.length} outside-plan course${removed.length === 1 ? '' : 's'} removed` : 'Restored previous course statuses',
  }, { save: false });
  saveState();
  render();
  if (currentTab === 'timeline') renderTimeline();
  if (typeof toastSuccess === 'function') toastSuccess(`Undid ${restored.length} prior-credit course${restored.length === 1 ? '' : 's'}.`);
  return true;
}

function plannerApplyTermMoveUndo(change) {
  const undo = change?.undo;
  const availability = plannerTermMoveUndoAvailability(change);
  if (!availability.can) {
    if (typeof toastError === 'function') toastError(availability.reason || 'That term move cannot be undone here.');
    return false;
  }
  const code = String(undo.code || '').trim();
  const norm = normalizeCode(code);
  const from = String(undo.fromSemId || '');
  const to = String(undo.toSemId || '');
  const sems = getAllSemesters();
  const fromSem = sems.find(sem => sem.id === from);
  const toSem = sems.find(sem => sem.id === to);
  if (!fromSem || !toSem) return false;

  if (undo.custom) {
    const custom = (state.customCourses || []).find(course => course.semId === to && normalizeCode(course.code) === norm);
    if (!custom) return false;
    custom.semId = from;
  } else {
    const toList = toSem.courses || [];
    const idx = toList.findIndex(course => normalizeCode(course.code) === norm);
    if (idx < 0) return false;
    const [course] = toList.splice(idx, 1);
    fromSem.courses = fromSem.courses || [];
    const insertAt = Number.isInteger(undo.fromIndex)
      ? Math.max(0, Math.min(undo.fromIndex, fromSem.courses.length))
      : fromSem.courses.length;
    fromSem.courses.splice(insertAt, 0, course);
  }
  if (plannerHasOwn(undo, 'hadFromSelectedSection')) {
    plannerRestoreSelectedSection(from, code, !!undo.hadFromSelectedSection, undo.fromSelectedSection || null);
  }
  if (plannerHasOwn(undo, 'expectedToSelectedSection')) {
    plannerRestoreSelectedSection(to, code, false, null);
  }

  undo.appliedAt = new Date().toISOString();
  recordPlanChange({
    type: 'term-move-undo',
    source: 'Timeline',
    title: `Restored ${code}`,
    detail: `${code} moved back from ${toSem.name || undo.toName || to} to ${fromSem.name || undo.fromName || from}.`,
    meta: 'Undo term move',
  }, { save: false });
  saveState();
  render();
  if (currentTab === 'timeline') renderTimeline();
  if (typeof toastSuccess === 'function') toastSuccess(`Restored ${code} to ${fromSem.name || 'the original term'}.`);
  return true;
}

function plannerApplyRecommendationSectionPickUndo(change) {
  const undo = change?.undo;
  const availability = plannerRecommendationSectionPickUndoAvailability(change);
  if (!availability.can) {
    if (typeof toastError === 'function') toastError(availability.reason || 'That Smart next pick cannot be undone here.');
    return false;
  }
  const code = String(undo.code || '').trim();
  const norm = normalizeCode(code);
  const target = String(undo.targetSemId || '');
  const source = String(undo.sourceSemId || '');
  const sems = getAllSemesters();
  const targetSem = sems.find(sem => sem.id === target);
  const sourceSem = source ? sems.find(sem => sem.id === source) : null;
  if (!targetSem) return false;

  if (undo.moved) {
    if (undo.custom) {
      const custom = (state.customCourses || []).find(course => course.semId === target && normalizeCode(course.code) === norm);
      if (!custom) return false;
      custom.semId = source;
    } else {
      if (!sourceSem) return false;
      const targetList = targetSem.courses || [];
      const idx = targetList.findIndex(course => normalizeCode(course.code) === norm);
      if (idx < 0) return false;
      const [course] = targetList.splice(idx, 1);
      sourceSem.courses = sourceSem.courses || [];
      const insertAt = Number.isInteger(undo.sourceIndex)
        ? Math.max(0, Math.min(undo.sourceIndex, sourceSem.courses.length))
        : sourceSem.courses.length;
      sourceSem.courses.splice(insertAt, 0, course);
    }
  }

  if (plannerHasOwn(undo, 'hadTargetSelectedSection')) {
    plannerRestoreSelectedSection(target, code, !!undo.hadTargetSelectedSection, undo.targetSelectedSection || null);
  }
  if (source && plannerHasOwn(undo, 'hadSourceSelectedSection')) {
    plannerRestoreSelectedSection(source, code, !!undo.hadSourceSelectedSection, undo.sourceSelectedSection || null);
  }

  undo.appliedAt = new Date().toISOString();
  recordPlanChange({
    type: 'section-pick-undo',
    source: 'Timeline',
    title: `Undid ${code} Smart pick`,
    detail: undo.moved
      ? `${code} moved back from ${targetSem.name || undo.targetName || target} to ${sourceSem?.name || undo.sourceName || source || 'the original place'}, and section choices were restored.`
      : `${code}'s previous section choice was restored.`,
    meta: 'Undo Smart next pick',
  }, { save: false });
  saveState();
  render();
  if (currentTab === 'timeline') renderTimeline();
  if (typeof toastSuccess === 'function') toastSuccess(`Undid ${code} Smart next pick.`);
  return true;
}

function undoPlanChange(changeId) {
  const id = String(changeId || '');
  const change = recentPlanChanges().find(item => item.id === id);
  if (!change) {
    if (typeof toastError === 'function') toastError('Could not find that recent change.');
    return false;
  }
  if (change.undo?.kind === 'placeholder-replacement') return plannerApplyPlaceholderUndo(change);
  if (change.undo?.kind === 'prior-credit') return plannerApplyPriorCreditUndo(change);
  if (change.undo?.kind === 'term-move') return plannerApplyTermMoveUndo(change);
  if (change.undo?.kind === 'recommendation-section-pick') return plannerApplyRecommendationSectionPickUndo(change);
  if (typeof toastError === 'function') toastError('That change cannot be undone here.');
  return false;
}

function renderPlanChangeHistory() {
  const root = document.getElementById('plan-change-history');
  if (!root) return;
  const changes = recentPlanChanges();
  root.innerHTML = `
    <div class="change-history-head">
      <div>
        <h3>Recent Changes</h3>
        <p>Automatic moves, section picks, and schedule edits you made recently.</p>
      </div>
      ${changes.length ? '<button class="btn small" type="button" data-clear-change-history>Clear</button>' : ''}
    </div>
    ${changes.length ? `
      <div class="change-history-list">
        ${changes.slice(0, 8).map(change => {
          const undoStatus = plannerChangeUndoAvailability(change);
          const reviewTarget = !undoStatus.can && undoStatus.reason ? plannerChangeReviewTarget(change) : null;
          const scheduleTarget = !undoStatus.can && undoStatus.reason ? plannerChangeScheduleTarget(change) : null;
          const termTarget = !undoStatus.can && undoStatus.reason ? plannerChangeTermTarget(change) : null;
          const priorCreditTarget = !undoStatus.can && undoStatus.reason ? plannerChangePriorCreditTarget(change) : null;
          return `
          <div class="change-history-row">
            <span class="change-history-icon">${timelineEscape(plannerChangeIcon(change.type))}</span>
            <div class="change-history-body">
              <strong>${timelineEscape(change.title)}</strong>
              ${change.detail ? `<p>${timelineEscape(change.detail)}</p>` : ''}
              <span class="change-history-meta">${timelineEscape([change.meta, plannerChangeTime(change.at)].filter(Boolean).join(' · '))}</span>
              ${undoStatus.can ? `
                <div class="change-history-actions">
                  <button class="btn small" type="button" data-change-undo="${timelineEscape(change.id)}">Undo</button>
                </div>
              ` : undoStatus.reason ? `
                <div class="change-history-unavailable">${timelineEscape(undoStatus.reason)}</div>
                ${reviewTarget || scheduleTarget || termTarget || priorCreditTarget ? `
                  <div class="change-history-actions change-history-recovery">
                    ${reviewTarget ? `<button class="btn small" type="button" data-change-review="${timelineEscape(change.id)}">${timelineEscape(reviewTarget.label)}</button>` : ''}
                    ${scheduleTarget ? `<button class="btn small" type="button" data-change-schedule="${timelineEscape(change.id)}">${timelineEscape(scheduleTarget.label)}</button>` : ''}
                    ${termTarget ? `<button class="btn small" type="button" data-change-term="${timelineEscape(change.id)}">${timelineEscape(termTarget.label)}</button>` : ''}
                    ${priorCreditTarget ? `<button class="btn small" type="button" data-change-prior-credit="${timelineEscape(change.id)}">${timelineEscape(priorCreditTarget.label)}</button>` : ''}
                  </div>
                ` : ''}
              ` : ''}
            </div>
          </div>
        `;
        }).join('')}
      </div>
    ` : '<p class="change-history-empty">No changes logged yet. Apply a move or schedule edit and it will appear here.</p>'}
  `;
}

function plannerClearMovedSelections(code, fromSemId, toSemId) {
  const norm = normalizeCode(code);
  [fromSemId, toSemId].forEach(semId => {
    const bucket = state.selectedSections && state.selectedSections[semId];
    if (bucket && bucket[norm]) {
      delete bucket[norm];
      if (!Object.keys(bucket).length) delete state.selectedSections[semId];
    }
  });
}

function plannerApplyMove(code, fromSemId, toSemId) {
  const from = String(fromSemId || '');
  const to = String(toSemId || '');
  if (!code || !from || !to || from === to) return false;
  const norm = normalizeCode(code);
  const custom = (state.customCourses || []).find(course => course.semId === from && normalizeCode(course.code) === norm);
  if (custom) {
    const fromName = getAllSemesters().find(sem => sem.id === from)?.name || from;
    const toName = getAllSemesters().find(sem => sem.id === to)?.name || to;
    const fromSection = plannerSelectedSectionSnapshot(from, custom.code || code);
    custom.semId = to;
    plannerClearMovedSelections(code, from, to);
    const expectedFromSection = plannerSelectedSectionSnapshot(from, custom.code || code);
    const expectedToSection = plannerSelectedSectionSnapshot(to, custom.code || code);
    recordPlanChange({
      type: 'term-move',
      source: 'Timeline',
      title: `Moved ${code}`,
      detail: `${code} moved from ${fromName} to ${toName}.`,
      meta: 'Timeline recommendation',
      undo: {
        kind: 'term-move',
        custom: true,
        code: custom.code || code,
        fromSemId: from,
        toSemId: to,
        fromName,
        toName,
        hadFromSelectedSection: fromSection.had,
        fromSelectedSection: fromSection.value,
        hadExpectedFromSelectedSection: expectedFromSection.had,
        expectedFromSelectedSection: expectedFromSection.value,
        hadExpectedToSelectedSection: expectedToSection.had,
        expectedToSelectedSection: expectedToSection.value,
      },
    }, { save: false });
    saveState();
    render();
    if (currentTab === 'timeline') renderTimeline();
    toastSuccess(`Moved ${code} to ${toName}.`);
    return true;
  }

  const sched = mutableSchedule();
  const fromSem = sched.find(sem => sem.id === from);
  const toSem = sched.find(sem => sem.id === to);
  if (!fromSem || !toSem) return false;
  const idx = (fromSem.courses || []).findIndex(course => normalizeCode(course.code) === norm);
  if (idx === -1) return false;
  const fromSection = plannerSelectedSectionSnapshot(from, code);
  const [course] = fromSem.courses.splice(idx, 1);
  toSem.courses = toSem.courses || [];
  toSem.courses.push(course);
  plannerClearMovedSelections(course.code, from, to);
  const expectedFromSection = plannerSelectedSectionSnapshot(from, course.code);
  const expectedToSection = plannerSelectedSectionSnapshot(to, course.code);
  recordPlanChange({
    type: 'term-move',
    source: 'Timeline',
    title: `Moved ${course.code}`,
    detail: `${course.code} moved from ${fromSem.name} to ${toSem.name}.`,
    meta: 'Timeline recommendation',
    undo: {
      kind: 'term-move',
      code: course.code,
      fromSemId: from,
      toSemId: to,
      fromName: fromSem.name,
      toName: toSem.name,
      fromIndex: idx,
      toIndex: toSem.courses.length - 1,
      hadFromSelectedSection: fromSection.had,
      fromSelectedSection: fromSection.value,
      hadExpectedFromSelectedSection: expectedFromSection.had,
      expectedFromSelectedSection: expectedFromSection.value,
      hadExpectedToSelectedSection: expectedToSection.had,
      expectedToSelectedSection: expectedToSection.value,
    },
  }, { save: false });
  saveState();
  render();
  if (currentTab === 'timeline') renderTimeline();
  toastSuccess(`Moved ${course.code} to ${toSem.name}.`);
  return true;
}

function plannerOpenGenEd(tag) {
  if (typeof genEdJumpToBrowse === 'function') genEdJumpToBrowse(tag);
}

function plannerOpenSchedule(semId) {
  if (semId && typeof scheduleCurrentSemId !== 'undefined') scheduleCurrentSemId = semId;
  if (typeof switchTab === 'function') switchTab('schedule');
}

function plannerSelectChecklistText() {
  const textArea = document.getElementById('planner-checklist-text');
  if (!textArea) return;
  textArea.hidden = false;
  textArea.focus();
  textArea.select();
  if (typeof toastInfo === 'function') toastInfo('Registration checklist selected.');
}

function plannerSelectAdvisorQuestionsText() {
  const textArea = document.getElementById('planner-questions-text');
  if (!textArea) return;
  textArea.hidden = false;
  textArea.focus();
  textArea.select();
  if (typeof toastInfo === 'function') toastInfo('Advisor questions selected.');
}

document.addEventListener('click', e => {
  const undoChange = e.target.closest('[data-change-undo]');
  if (undoChange) {
    undoPlanChange(undoChange.dataset.changeUndo);
    return;
  }
  const reviewChange = e.target.closest('[data-change-review]');
  if (reviewChange) {
    plannerOpenChangeReviewTarget(reviewChange.dataset.changeReview);
    return;
  }
  const scheduleChange = e.target.closest('[data-change-schedule]');
  if (scheduleChange) {
    plannerOpenChangeScheduleTarget(scheduleChange.dataset.changeSchedule);
    return;
  }
  const termChange = e.target.closest('[data-change-term]');
  if (termChange) {
    plannerOpenChangeTermTarget(termChange.dataset.changeTerm);
    return;
  }
  const priorCreditChange = e.target.closest('[data-change-prior-credit]');
  if (priorCreditChange) {
    plannerOpenPriorCreditReview(priorCreditChange.dataset.changePriorCredit);
    return;
  }
  const move = e.target.closest('[data-planner-move]');
  if (move) {
    plannerApplyMove(move.dataset.plannerMove, move.dataset.fromSem, move.dataset.toSem);
    return;
  }
  if (e.target.closest('[data-clear-change-history]')) {
    clearPlanChanges();
    return;
  }
  const gened = e.target.closest('[data-planner-gened]');
  if (gened) {
    plannerOpenGenEd(gened.dataset.plannerGened);
    return;
  }
  const schedule = e.target.closest('[data-planner-schedule]');
  if (schedule) {
    plannerOpenSchedule(schedule.dataset.plannerSchedule);
    return;
  }
  if (e.target.closest('[data-planner-copy-checklist]')) {
    plannerSelectChecklistText();
    return;
  }
  if (e.target.closest('[data-planner-copy-questions]')) {
    plannerSelectAdvisorQuestionsText();
    return;
  }
  if (e.target.closest('[data-planner-refresh]')) {
    renderTimeline();
  }
});
