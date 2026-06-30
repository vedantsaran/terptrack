'use strict';
/* ============================================================
   RECOMMENDATIONS PANEL
   ============================================================ */

let recoRenderSeq = 0;

function recoEscape(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

function recoIsDone(code) {
  const direct = getCourseState(code);
  const display = getCourseState(displayCode(code));
  return direct.status === 'passed' || direct.status === 'transfer'
    || display.status === 'passed' || display.status === 'transfer';
}

function recoCourseTags(course) {
  if (typeof courseGenEdTags === 'function') return courseGenEdTags(course);
  const tags = new Set();
  if (Array.isArray(course.gen_ed)) course.gen_ed.flat().filter(Boolean).forEach(t => tags.add(String(t).toUpperCase()));
  if (Array.isArray(course.categories)) {
    course.categories
      .filter(cat => String(cat || '').startsWith('gened-'))
      .forEach(cat => tags.add(String(cat).replace('gened-', '').toUpperCase()));
  }
  if (String(course.category || '').startsWith('gened-')) tags.add(String(course.category).replace('gened-', '').toUpperCase());
  return Array.from(tags);
}

function recoGenEdGaps() {
  if (typeof getGenEdRequirementStatus === 'function') return getGenEdRequirementStatus().missing || [];
  if (typeof computeGenEdCoverage !== 'function' || typeof GENED_DEFS === 'undefined') return [];
  const { planned } = computeGenEdCoverage();
  return GENED_DEFS
    .filter(def => (planned[def.id] || []).length < def.need)
    .map(def => ({ id: def.id, need: def.need, have: (planned[def.id] || []).length, label: `${def.id} · ${def.name}` }));
}

function recoGapTagsForMatch(gap) {
  if (!gap) return [];
  if (gap.id === 'DIVERSITY-2') return ['DVUP', 'DVCC'];
  return [gap.id];
}

function recoDownstreamImpact(course, allCourses) {
  const norm = normalizeCode(course.code);
  let unlocks = 0;
  let goalUnlocks = 0;
  let depends = 0;

  allCourses.forEach(target => {
    if (normalizeCode(target.code) === norm) return;
    const stateForTarget = getCourseState(target.code);
    if (stateForTarget.status === 'passed' || stateForTarget.status === 'transfer') return;
    const groups = Array.isArray(target.prereqGroups) && target.prereqGroups.length
      ? target.prereqGroups
      : (target.prereqs || []).map(code => [code]);
    if (!groups.length) return;
    if (!groups.some(group => group.some(code => normalizeCode(code) === norm))) return;
    depends++;
    const wouldUnlock = groups.every(group => group.some(code => recoIsDone(code) || normalizeCode(code) === norm));
    if (wouldUnlock) {
      unlocks++;
      if (isGoalCourse(target)) goalUnlocks++;
    }
  });

  return { unlocks, goalUnlocks, depends };
}

function recoSemesterContext() {
  const sems = getAllSemesters();
  const semId = typeof scheduleDefaultSemesterId === 'function'
    ? scheduleDefaultSemesterId()
    : (sems.find(sem => (sem.courses || []).some(c => !recoIsDone(c.code))) || sems[0] || {}).id;
  const sem = sems.find(s => s.id === semId) || sems[0] || null;
  const term = sem
    ? ((state.schedulePrefs || {})[sem.id]?.term || (typeof scheduleInferTermCode === 'function' ? scheduleInferTermCode(sem) : ''))
    : '';
  const termLabel = term && typeof scheduleTermLabel === 'function' ? scheduleTermLabel(term) : term;
  return { sem, semId: sem ? sem.id : '', term, termLabel };
}

function recoMissingMajorCourses(planned) {
  const tpl = state.majorId ? getMajorTemplate(state.majorId) : null;
  if (!tpl || tpl.useDefaultSchedule) return [];
  return majorAllCodes(tpl)
    .filter(item => !planned.has(normalizeCode(item.code)))
    .map(item => ({ ...item, display: displayCode(item.code) }));
}

function recoBaseCandidates() {
  const all = flatCourses();
  const sems = getAllSemesters();
  const gaps = recoGenEdGaps();
  const gapTagSet = new Set(gaps.flatMap(recoGapTagsForMatch));
  const seen = new Set();
  const candidates = [];

  all.forEach(course => {
    const norm = normalizeCode(course.code);
    if (!/^[A-Z]{3,4}\d{3}[A-Z]?$/.test(norm) || seen.has(norm)) return;
    seen.add(norm);
    const status = getCourseState(course.code);
    if (status.status !== 'not-started' || !prereqsMet(course).met) return;

    const semIndex = sems.findIndex(sem => sem.id === course.semId);
    const tags = recoCourseTags(course);
    const gapHits = tags.filter(tag => gapTagSet.has(tag));
    const impact = recoDownstreamImpact(course, all);
    const pt = ptCacheGet(course.code) || {};
    const gpa = typeof course.avg_gpa === 'number' ? course.avg_gpa
      : typeof pt.average_gpa === 'number' ? pt.average_gpa
        : null;
    const isGoal = isGoalCourse(course);
    const isCritical = course.kind === 'critical' || String(course.category || '').includes('major');
    const profileMatch = typeof profileCourseMatch === 'function'
      ? profileCourseMatch(course)
      : { score: 0, labels: [] };
    const score = 580
      - Math.max(0, semIndex) * 28
      + (isGoal ? 320 : 0)
      + (isCritical ? 80 : 0)
      + impact.unlocks * 95
      + impact.goalUnlocks * 210
      + gapHits.length * 105
      + profileMatch.score
      + (gpa ? Math.round(gpa * 18) : 0)
      + (Number(course.cr) || 3) * 8;

    candidates.push({
      course,
      tags,
      gapHits,
      impact,
      gpa,
      isGoal,
      isCritical,
      profileLabels: profileMatch.labels || [],
      semIndex,
      score,
      sections: null,
      bestSection: null,
      liveScore: 0,
      liveNote: 'Checking posted sections...',
    });
  });

  return candidates.sort((a, b) => b.score - a.score).slice(0, 10);
}

function recoSelectedItemsForContext(ctx) {
  if (!ctx.semId) return [];
  const selected = (state.selectedSections || {})[ctx.semId] || {};
  const byNorm = {};
  flatCourses().forEach(course => { byNorm[normalizeCode(course.code)] = course; });
  return Object.entries(selected)
    .filter(([, section]) => !ctx.term || String(section.semester || '') === String(ctx.term))
    .map(([norm, section]) => ({ course: byNorm[norm] || { code: displayCode(norm), title: displayCode(norm) }, section }))
    .filter(item => item.section);
}

function recoHydrateLiveData(seq, payload) {
  const root = document.getElementById('reco-container');
  if (!root || !payload.candidates.length || typeof scheduleFetchSectionsFor !== 'function') return;
  (async () => {
    const ctx = payload.ctx;
    if (!ctx.term) return;
    const topCourses = payload.candidates.slice(0, 8).map(item => item.course);
    const sectionsByCode = await scheduleFetchSectionsFor(ctx.semId || 'reco', ctx.term, topCourses);
    if (seq !== recoRenderSeq) return;
    const currentItems = recoSelectedItemsForContext(ctx);
    payload.candidates.forEach(item => {
      const norm = normalizeCode(item.course.code);
      const sections = sectionsByCode[norm] || [];
      item.sections = sections;
      if (!sections.length) {
        item.liveScore = -85;
        item.liveNote = ctx.termLabel ? `No posted ${ctx.termLabel} sections` : 'No posted sections';
        item.seatRisk = null;
        return;
      }
      const viable = sections.filter(section => {
        if (typeof sectionBlocks !== 'function' || typeof blocksConflict !== 'function') return true;
        const candidateBlocks = sectionBlocks(section, item.course);
        const existingBlocks = currentItems
          .filter(existing => normalizeCode(existing.course.code) !== norm)
          .flatMap(existing => sectionBlocks(existing.section, existing.course));
        return !candidateBlocks.some(a => existingBlocks.some(b => blocksConflict(a, b)));
      });
      const pool = viable.length ? viable : sections;
      pool.sort((a, b) => sectionScore(b, getSchedulePrefs(ctx.semId), item.course, currentItems)
        - sectionScore(a, getSchedulePrefs(ctx.semId), item.course, currentItems));
      item.bestSection = pool[0] || null;
      item.seatRisk = typeof sectionSeatRisk === 'function' && item.bestSection ? sectionSeatRisk(item.bestSection) : null;
      const openSeats = sections.reduce((max, section) => {
        const open = parseInt(section.open_seats, 10);
        return Number.isFinite(open) ? Math.max(max, open) : max;
      }, 0);
      const hasFit = viable.length > 0;
      item.liveScore = Math.min(220, sections.length * 8 + openSeats * 3 + (hasFit ? 75 : -180) + (item.seatRisk ? item.seatRisk.score : 0));
      item.liveNote = hasFit
        ? `${sections.length} posted; ${item.seatRisk ? item.seatRisk.detail : `best has ${openSeats} open`}`
        : `${sections.length} posted; conflicts with current picks`;
      item.score += item.liveScore;
    });
    payload.candidates.sort((a, b) => b.score - a.score);
    root.innerHTML = recoRenderPayload(payload, false);
  })();
}

function recoBadges(item) {
  const badges = [];
  badges.push({ label: 'Prereqs clear' });
  if (item.isGoal) badges.push({ label: 'Goal course' });
  if (item.impact.unlocks) badges.push({ label: `Unlocks ${item.impact.unlocks}` });
  if (item.impact.goalUnlocks) badges.push({ label: 'Unlocks a goal' });
  if (item.gapHits.length) badges.push({ label: `Covers ${item.gapHits.join(' + ')}` });
  (item.profileLabels || []).forEach(label => badges.push({ label }));
  if (item.gpa) badges.push({ label: `Avg GPA ${item.gpa.toFixed(2)}` });
  if (item.sections) badges.push({ label: `${item.sections.length} posted` });
  if (item.seatRisk) badges.push({ label: item.seatRisk.label, cls: `seat-risk-${item.seatRisk.level}` });
  return badges.slice(0, 5);
}

function recoReason(item) {
  const reasons = [];
  if (item.impact.unlocks) reasons.push(`opens ${item.impact.unlocks} downstream course${item.impact.unlocks === 1 ? '' : 's'}`);
  if (item.gapHits.length) reasons.push(`fills ${item.gapHits.join(' + ')} GenEd gap${item.gapHits.length === 1 ? '' : 's'}`);
  if (item.profileLabels && item.profileLabels.length) reasons.push(`matches ${item.profileLabels.join(' + ')}`);
  if (item.isCritical) reasons.push('keeps major path moving');
  if (item.bestSection && typeof sectionSummary === 'function') reasons.push(sectionSummary(item.bestSection));
  if (!reasons.length) reasons.push('ready now and fits the current plan order');
  return reasons.join(' · ');
}

function recoRenderPick(item, idx, ctx) {
  const course = item.course;
  return `
    <div class="reco-pick">
      <div class="reco-rank">${idx + 1}</div>
      <div class="reco-pick-main">
        <div class="reco-line">
          <strong>${recoEscape(course.code)}</strong>
          <span class="reco-title">${recoEscape(course.title || '')}</span>
          <span class="reco-score">${Math.max(0, Math.round(item.score / 10))}</span>
        </div>
        <div class="reco-badges">${recoBadges(item).map(badge => `<span class="${badge.cls ? `seat-risk ${badge.cls}` : ''}">${recoEscape(badge.label)}</span>`).join('')}</div>
        <div class="reco-reason">${recoEscape(recoReason(item))}</div>
      </div>
      <button class="btn small" type="button" onclick="recoOpenSchedule('${recoEscape(ctx.semId)}')">Schedule</button>
    </div>
  `;
}

function recoRenderGaps(payload) {
  const major = payload.missingMajor;
  const gened = payload.gaps;
  const parts = [];
  if (major.length) {
    parts.push(`
      <div class="reco-section">
        <h4>Requirement gaps</h4>
        <p class="reco-sub">${major.length} major course${major.length === 1 ? '' : 's'} not planned yet.</p>
        <div class="reco-list">
          ${major.slice(0, 6).map(item => `
            <div class="reco-item">
              <strong>${recoEscape(item.display)}</strong>
              <span class="reco-title">${recoEscape(item.category || 'major requirement')}</span>
              <button class="btn small" type="button" onclick="recoAddCourse('${recoEscape(item.display)}')">Add</button>
            </div>
          `).join('')}
          ${major.length > 6 ? `<div class="reco-more">+ ${major.length - 6} more major requirements</div>` : ''}
        </div>
      </div>
    `);
  }
  if (gened.length) {
    parts.push(`
      <div class="reco-section">
        <h4>GenEd gaps</h4>
        <p class="reco-sub">Missing from the planned degree map.</p>
        <div class="reco-tags">
          ${gened.slice(0, 9).map(gap => {
            const tag = gap.id === 'DIVERSITY-2' ? 'DVUP' : gap.id;
            return `<button class="reco-tag as-button" type="button" onclick="recoFindGenEd('${recoEscape(tag)}')">${recoEscape(gap.label || gap.id)} ${gap.have}/${gap.need}</button>`;
          }).join('')}
        </div>
      </div>
    `);
  }
  return parts.join('');
}

function recoRenderPayload(payload, loadingLive) {
  const ctx = payload.ctx;
  const sections = [];
  if (payload.candidates.length) {
    sections.push(`
      <div class="reco-section">
        <div class="reco-headline">
          <h4>Smart next picks</h4>
          <span>${loadingLive ? 'loading live seats' : (ctx.termLabel || 'live term')}</span>
        </div>
        <p class="reco-sub">Ranked by prerequisites, goal impact, profile fit, GenEd gaps, GPA signals, and posted sections.</p>
        <div class="reco-picks">
          ${payload.candidates.slice(0, 5).map((item, idx) => recoRenderPick(item, idx, ctx)).join('')}
        </div>
      </div>
    `);
  }
  sections.push(recoRenderGaps(payload));
  if (!sections.join('').trim()) {
    return '<p class="reco-empty">Apply a major template or import courses to unlock personalized registration picks.</p>';
  }
  return sections.join('');
}

function renderRecommendations() {
  const root = document.getElementById('reco-container');
  if (!root) return;
  const seq = ++recoRenderSeq;
  const planned = new Set(flatCourses().map(c => normalizeCode(c.code)));
  const payload = {
    ctx: recoSemesterContext(),
    candidates: recoBaseCandidates(),
    missingMajor: recoMissingMajorCourses(planned),
    gaps: recoGenEdGaps(),
  };
  root.innerHTML = recoRenderPayload(payload, true);
  recoHydrateLiveData(seq, payload);
}

async function recoAddCourse(code) {
  await resolveAndAddCourse(code);
}

function recoOpenSchedule(semId) {
  if (semId && typeof scheduleCurrentSemId !== 'undefined') scheduleCurrentSemId = semId;
  switchTab('schedule');
}

function recoFindGenEd(tag) {
  if (typeof genEdJumpToBrowse === 'function') genEdJumpToBrowse(tag);
}

window.renderRecommendations = renderRecommendations;
window.recoAddCourse = recoAddCourse;
window.recoOpenSchedule = recoOpenSchedule;
window.recoFindGenEd = recoFindGenEd;

function recoRenderWhenReady() {
  const root = document.getElementById('reco-container');
  if (!root || root.innerHTML.trim()) return;
  try {
    renderRecommendations();
  } catch (err) {
    root.innerHTML = `<p class="reco-empty">Recommendation engine paused: ${recoEscape(err && err.message ? err.message : err)}</p>`;
    console.error(err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', recoRenderWhenReady, { once: true });
} else {
  setTimeout(recoRenderWhenReady, 0);
}
