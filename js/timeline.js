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

async function plannerSectionCount(code, term) {
  if (typeof umdioFetchSections !== 'function') return null;
  try {
    const sections = await umdioFetchSections(code, term);
    return Array.isArray(sections) ? sections.length : 0;
  } catch {
    return null;
  }
}

function plannerAvailabilityScore(exactPosted, exactCount, offeredHistory, historyCounts) {
  if (exactPosted && Number(exactCount) > 0) return 100 + Math.min(60, Number(exactCount));
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
      const exactCount = exactPosted ? await plannerSectionCount(item.course.code, candidate.term) : null;
      const historyTerms = plannerRecentTermsForSeason(terms, candidate.term);
      const historyCounts = await Promise.all(historyTerms.map(term => plannerSectionCount(item.course.code, term)));
      const offeredHistory = historyCounts.filter(count => Number(count) > 0).length;
      profile = {
        exactPosted,
        exactCount,
        historyTerms,
        historyCounts,
        offeredHistory,
        score: plannerAvailabilityScore(exactPosted, exactCount, offeredHistory, historyCounts),
      };
      profileCache[key] = profile;
    }
    if (profile.score <= currentScore + 8) continue;
    const availabilityReason = profile.exactPosted && Number(profile.exactCount) > 0
      ? `${profile.exactCount} posted section${Number(profile.exactCount) === 1 ? '' : 's'} in ${plannerTermLabel(candidate.term)}`
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
    const exactCount = exactPosted ? await plannerSectionCount(item.course.code, plannedTerm) : null;
    const historyTerms = plannerRecentTermsForSeason(terms, plannedTerm);
    const historyCounts = await Promise.all(historyTerms.map(term => plannerSectionCount(item.course.code, term)));
    const offeredHistory = historyCounts.filter(count => Number(count) > 0).length;
    const checkedHistory = historyCounts.filter(count => count !== null).length;
    const currentScore = plannerAvailabilityScore(exactPosted, exactCount, offeredHistory, historyCounts);
    let level = 'ok';
    let title = `${code} looks available`;
    let detail = '';

    if (exactPosted && exactCount > 0) {
      detail = `${exactCount} posted section${exactCount === 1 ? '' : 's'} for ${plannerTermLabel(plannedTerm)}.`;
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
  if (type === 'section-swap') return '▦';
  if (type === 'auto-pick') return '✓';
  if (type === 'section-pick') return '◉';
  if (type === 'clear') return '×';
  return '•';
}

function plannerChangeTime(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
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
        ${changes.slice(0, 8).map(change => `
          <div class="change-history-row">
            <span class="change-history-icon">${timelineEscape(plannerChangeIcon(change.type))}</span>
            <div>
              <strong>${timelineEscape(change.title)}</strong>
              ${change.detail ? `<p>${timelineEscape(change.detail)}</p>` : ''}
              <span>${timelineEscape([change.meta, plannerChangeTime(change.at)].filter(Boolean).join(' · '))}</span>
            </div>
          </div>
        `).join('')}
      </div>
    ` : '<p class="change-history-empty">No changes logged yet. Apply a move or schedule edit and it will appear here.</p>'}
  `;
}

function plannerClearMovedSelections(code, fromSemId, toSemId) {
  const norm = normalizeCode(code);
  [fromSemId, toSemId].forEach(semId => {
    const bucket = state.selectedSections && state.selectedSections[semId];
    if (bucket && bucket[norm]) delete bucket[norm];
  });
}

function plannerApplyMove(code, fromSemId, toSemId) {
  const from = String(fromSemId || '');
  const to = String(toSemId || '');
  if (!code || !from || !to || from === to) return false;
  const norm = normalizeCode(code);
  const custom = (state.customCourses || []).find(course => course.semId === from && normalizeCode(course.code) === norm);
  if (custom) {
    const toName = getAllSemesters().find(sem => sem.id === to)?.name || to;
    custom.semId = to;
    plannerClearMovedSelections(code, from, to);
    recordPlanChange({
      type: 'term-move',
      source: 'Timeline',
      title: `Moved ${code}`,
      detail: `${code} moved from ${getAllSemesters().find(sem => sem.id === from)?.name || from} to ${toName}.`,
      meta: 'Timeline recommendation',
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
  const [course] = fromSem.courses.splice(idx, 1);
  toSem.courses = toSem.courses || [];
  toSem.courses.push(course);
  plannerClearMovedSelections(course.code, from, to);
  recordPlanChange({
    type: 'term-move',
    source: 'Timeline',
    title: `Moved ${course.code}`,
    detail: `${course.code} moved from ${fromSem.name} to ${toSem.name}.`,
    meta: 'Timeline recommendation',
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

document.addEventListener('click', e => {
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
  if (e.target.closest('[data-planner-refresh]')) {
    renderTimeline();
  }
});
