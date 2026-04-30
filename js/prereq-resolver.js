'use strict';
/* ============================================================
   PREREQ RESOLVER — recursively pull in all prereqs for a
   course, show a confirmation modal, then slot everything into
   the schedule in topological order.
   ============================================================ */

let _resolverState = null; // { resolved: [course], rootCode, skipSet: Set<code> }

// Returns true if the course is already in the plan or marked passed/transfer.
function _alreadyHave(code) {
  const display = displayCode(code);
  const cs = state.courses[display];
  if (cs && (cs.status === 'passed' || cs.status === 'transfer')) return true;
  return !!findCourse(display);
}

// BFS over prereqs, returning a flat list { course, depth, alreadyHave }
async function gatherPrereqChain(rootCode, onProgress) {
  const visited = new Set();
  const out = [];
  const queue = [{ code: normalizeCode(rootCode), depth: 0 }];
  let fetched = 0;
  while (queue.length) {
    const { code, depth } = queue.shift();
    if (visited.has(code)) continue;
    visited.add(code);
    const have = _alreadyHave(code);
    let course;
    if (have) {
      // Use whatever's already in plan for display purposes
      const c = findCourse(displayCode(code));
      course = c ? { code: c.code, title: c.title, cr: c.cr, prereqs: c.prereqs || [], coreqs: c.coreqs || [] } : null;
    } else {
      course = await fetchCourseFull(code).catch(() => null);
      fetched++;
      if (onProgress) onProgress(fetched);
    }
    if (!course) continue;
    out.push({ course, depth, alreadyHave: have });
    if (depth < 6) {
      // Use prereqGroups when available so we only pull ONE prereq per
      // OR-group (the first already-passed alternative if any, else first).
      // Falls back to the flat prereqs list when groups aren't parsed.
      const groups = Array.isArray(course.prereqGroups) && course.prereqGroups.length
        ? course.prereqGroups
        : (course.prereqs || []).map(p => [p]);
      groups.forEach(group => {
        if (!group.length) return;
        const passed = group.find(_isPassed);
        const pick = passed || group[0];
        const n = normalizeCode(pick);
        if (!visited.has(n)) queue.push({ code: n, depth: depth + 1 });
      });
    }
  }
  return out;
}

// Topo-sort the resolved set so prereqs come before dependents.
function _topoOrder(items) {
  const byCode = {};
  items.forEach(it => { byCode[normalizeCode(it.course.code)] = it; });
  const sorted = [];
  const visiting = new Set();
  const done = new Set();
  function visit(code) {
    if (done.has(code)) return;
    if (visiting.has(code)) return; // cycle guard
    visiting.add(code);
    const it = byCode[code];
    if (it) {
      (it.course.prereqs || []).forEach(p => visit(normalizeCode(p)));
      sorted.push(it);
    }
    visiting.delete(code);
    done.add(code);
  }
  items.forEach(it => visit(normalizeCode(it.course.code)));
  return sorted;
}

// Slot a list of courses (in topo order) into the active schedule,
// respecting prereq ordering and a credit cap.
function _slotCourses(items, opts) {
  const cap = (opts && opts.cap) || 18;
  const sched = mutableSchedule();
  const placedSemIdx = {}; // code -> sem index
  // Pre-populate with already-in-plan courses' semester indices
  sched.forEach((sem, i) => (sem.courses || []).forEach(c => {
    placedSemIdx[normalizeCode(c.code)] = i;
  }));
  (state.customCourses || []).forEach(c => {
    if (c.semId) {
      const idx = sched.findIndex(s => s.id === c.semId);
      if (idx >= 0) placedSemIdx[normalizeCode(c.code)] = idx;
    }
  });

  for (const it of items) {
    const norm = normalizeCode(it.course.code);
    if (placedSemIdx[norm] !== undefined) continue; // already in plan
    if (it.alreadyHave) continue;
    // Earliest semester = max(prereq semester index) + 1
    const earliest = (it.course.prereqs || []).reduce((max, p) => {
      const idx = placedSemIdx[normalizeCode(p)];
      return idx === undefined ? max : Math.max(max, idx + 1);
    }, 0);
    let target = -1;
    for (let i = earliest; i < sched.length; i++) {
      const cur = (sched[i].courses || []).reduce((a, x) => a + (x.cr || 0), 0);
      if (cur + (it.course.cr || 3) <= cap) { target = i; break; }
    }
    if (target === -1) target = sched.length - 1;
    sched[target].courses = sched[target].courses || [];
    sched[target].courses.push({
      code: it.course.code,
      title: it.course.title,
      cr: it.course.cr,
      prereqs: it.course.prereqs,
      prereqGroups: it.course.prereqGroups,
      coreqs: it.course.coreqs,
      kind: 'core',
      category: 'major-core',
    });
    placedSemIdx[norm] = target;
  }
}

/* ----------------------------------------------------------
   Public entry: open the resolver modal for a course code.
   ---------------------------------------------------------- */
async function resolveAndAddCourse(rootCode) {
  // If course is in plan and prereqs are met, nothing to do.
  // If in plan but locked, fall through and resolve missing prereqs.
  const rootCourse = findCourse(displayCode(rootCode));
  if (rootCourse) {
    const status = prereqsMet(rootCourse);
    if (status.met) {
      toastInfo(`${displayCode(rootCode)} is already in your plan and unlocked.`);
      return;
    }
  }

  const modal = document.getElementById('resolver-modal');
  modal.classList.add('open');
  const status = document.getElementById('rs-status');
  const list = document.getElementById('rs-list');
  status.style.color = 'var(--slate)';
  status.textContent = 'Resolving prereq chain…';
  list.innerHTML = '';

  const chain = await gatherPrereqChain(rootCode, (n) => {
    status.textContent = `Resolving prereq chain… (${n} fetched)`;
  });

  // Topological order so display matches add order
  const ordered = _topoOrder(chain);
  _resolverState = {
    rootCode: normalizeCode(rootCode),
    resolved: ordered,
    skipSet: new Set(),
  };

  const newOnes = ordered.filter(it => !it.alreadyHave);
  const haveOnes = ordered.filter(it => it.alreadyHave);

  if (!newOnes.length) {
    status.style.color = 'var(--green)';
    status.textContent = `All prereqs are already in your plan or completed. Nothing to add.`;
    list.innerHTML = '';
    return;
  }

  status.style.color = 'var(--ink)';
  status.innerHTML = `Adding <strong>${displayCode(rootCode)}</strong> will also pull in <strong>${newOnes.length - 1}</strong> prereq(s).${haveOnes.length ? ` ${haveOnes.length} already in plan or completed.` : ''}`;

  list.innerHTML = ordered.map((it, i) => {
    const norm = normalizeCode(it.course.code);
    const isRoot = norm === _resolverState.rootCode;
    const indent = it.depth * 14;
    const badge = it.alreadyHave
      ? '<span class="rs-badge rs-have">✓ already in plan</span>'
      : (isRoot ? '<span class="rs-badge rs-root">target</span>' : '<span class="rs-badge rs-new">+ new</span>');
    const checked = !it.alreadyHave ? 'checked' : '';
    const disabled = it.alreadyHave || isRoot ? 'disabled' : '';
    return `
      <label class="rs-row" style="padding-left:${indent}px">
        <input type="checkbox" class="rs-check" data-code="${it.course.code}" ${checked} ${disabled}>
        <span class="rs-code">${it.course.code}</span>
        <span class="rs-title">${it.course.title || ''}</span>
        <span class="rs-cr">${it.course.cr || 3} cr</span>
        ${badge}
      </label>
    `;
  }).join('');

  // Hook checkboxes
  list.querySelectorAll('.rs-check').forEach(cb => {
    cb.addEventListener('change', () => {
      const code = normalizeCode(cb.dataset.code);
      if (cb.checked) _resolverState.skipSet.delete(code);
      else _resolverState.skipSet.add(code);
    });
  });
}

function closeResolver() {
  document.getElementById('resolver-modal').classList.remove('open');
  _resolverState = null;
}

function commitResolver() {
  if (!_resolverState) { closeResolver(); return; }
  const items = _resolverState.resolved.filter(it => {
    if (it.alreadyHave) return false;
    if (_resolverState.skipSet.has(normalizeCode(it.course.code))) return false;
    return true;
  });
  if (!items.length) { closeResolver(); return; }
  _slotCourses(items, { cap: 18 });
  saveState();
  render();
  closeResolver();
}
