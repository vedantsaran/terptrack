'use strict';
/* ============================================================
   RENDER — PLAN VIEW
   ============================================================ */
function render() {
  renderSemesters();
  renderStats();
  renderNextUp();
  renderGoals();
  renderAlerts();
  if (typeof renderRecommendations === 'function') renderRecommendations();
  if (typeof attachDndHandlers === 'function') attachDndHandlers();
  if (currentTab === 'audit') renderAudit();
  if (currentTab === 'roadmap') renderRoadmap();
  if (currentTab === 'table') renderTable();
  // welcome card visibility
  const welcome = document.getElementById('welcome-card');
  const hasAnyCourseMarked = Object.keys(state.courses).length > 0;
  welcome.style.display = (state.welcomeDismissed || hasAnyCourseMarked) ? 'none' : 'block';
}

function shouldShowCourse(course) {
  // search filter
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    const hay = [course.code, course.title, course.note || '', course.semId || ''].join(' ').toLowerCase();
    if (!hay.includes(q)) return false;
  }
  // status filter
  const cs = getCourseState(course.code);
  const isLocked = !prereqsMet(course).met && cs.status === "not-started";
  if (currentFilter === 'goal' && !isGoalCourse(course)) return false;
  if (currentFilter === 'available' && (isLocked || cs.status !== 'not-started')) return false;
  if (currentFilter === 'locked' && !isLocked) return false;
  if (currentFilter === 'passed' && cs.status !== 'passed' && cs.status !== 'transfer') return false;
  return true;
}

function renderSemesters() {
  const container = document.getElementById('semesters-container');
  container.innerHTML = '';
  getAllSemesters().forEach((sem) => {
    const baseCourses = sem.courses || [];
    const visibleCourses = baseCourses.filter(shouldShowCourse);
    const semCustom = (state.customCourses || []).filter(c => c.semId === sem.id);
    const visibleCustom = semCustom.filter(shouldShowCourse);
    if (visibleCourses.length === 0 && visibleCustom.length === 0 && currentFilter !== 'all') return;

    const allCourses = [...baseCourses, ...semCustom];
    const totalCr = allCourses.reduce((a, c) => a + c.cr, 0);
    const passedCr = allCourses.reduce((a, c) => {
      const s = getCourseState(c.code);
      return (s.status === "passed" || s.status === "transfer") ? a + c.cr : a;
    }, 0);
    const pct = totalCr ? (passedCr / totalCr) * 100 : 0;

    const isCustomSem = (state.customSemesters || []).some(cs => cs.id === sem.id);

    const card = document.createElement('div');
    card.className = 'semester';
    card.dataset.semId = sem.id;
    card.innerHTML = `
      <div class="sem-header">
        <div class="sem-title">${sem.year ? `<span class="yr">${sem.year}</span>` : ''}${sem.name}</div>
        <div class="sem-meta">
          <div class="sem-progress"><div class="sem-progress-fill" style="width:${pct}%"></div></div>
          <span><strong>${passedCr}</strong>/${totalCr} cr</span>
          <button class="add-course-btn" data-sem="${sem.id}">+ Add Course</button>
          <button class="add-course-btn sem-bulk-btn" data-bulk-sem="${sem.id}" title="Bulk-mark all courses in this semester">⋯</button>
          ${isCustomSem ? `<button class="add-course-btn" data-remove-sem="${sem.id}" title="Remove this custom semester" style="color:var(--red)">×</button>` : ''}
        </div>
      </div>
      <div class="courses"></div>
    `;
    const cList = card.querySelector('.courses');
    visibleCourses.forEach(c => cList.appendChild(renderCourse(c, sem.id)));
    visibleCustom.forEach(c => cList.appendChild(renderCourse(c, sem.id, true)));

    card.querySelector('.add-course-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      openAddCourse(sem.id);
    });
    const bulkBtn = card.querySelector('[data-bulk-sem]');
    if (bulkBtn) {
      bulkBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showBulkMenu(bulkBtn, sem.id);
      });
    }
    const rm = card.querySelector('[data-remove-sem]');
    if (rm) {
      rm.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!confirm(`Remove semester ${sem.name}? Custom courses inside it will also be removed.`)) return;
        state.customSemesters = (state.customSemesters || []).filter(s => s.id !== sem.id);
        state.customCourses = (state.customCourses || []).filter(c => c.semId !== sem.id);
        saveState();
        render();
      });
    }
    container.appendChild(card);
  });

  // Custom courses without a semester (shouldn't happen but defensive)
  const orphans = state.customCourses.filter(c => !c.semId && shouldShowCourse(c));
  if (orphans.length) {
    const card = document.createElement('div');
    card.className = 'semester';
    card.innerHTML = `<div class="sem-header"><div class="sem-title">Transfer / Outside Plan</div></div><div class="courses"></div>`;
    orphans.forEach(c => card.querySelector('.courses').appendChild(renderCourse(c, null, true)));
    container.appendChild(card);
  }
}

function renderCourse(course, semId, isCustom = false) {
  const cs = getCourseState(course.code);
  const prereqStatus = prereqsMet(course);
  const isLocked = !prereqStatus.met && cs.status === "not-started";
  const goal = isGoalCourse(course);

  const div = document.createElement('div');
  let cls = 'course';
  if (goal) cls += ' goal';
  if (isLocked) cls += ' locked';
  else if (cs.status === "passed") cls += ' passed';
  else if (cs.status === "transfer") cls += ' transfer';
  else if (cs.status === "in-progress") cls += ' in-progress';
  else if (cs.status === "failed") cls += ' failed';
  else cls += ' available';
  div.className = cls;
  div.dataset.code = course.code;
  div.dataset.semId = semId || '';
  if (isCustom) div.dataset.custom = '1';

  // tags
  const tags = [];
  if (course.kind === "critical") tags.push('<span class="tag crit">PREREQ-CRIT</span>');
  if (goal) tags.push('<span class="tag goal">GOAL</span>');
  if (course.kind === "tech") tags.push('<span class="tag tech">TECH ELEC</span>');
  if (course.kind === "gened") tags.push('<span class="tag gened">GENED</span>');
  if (cs.status === "transfer") tags.push('<span class="tag" style="background:rgba(46,92,139,.15);color:var(--blue)">TRANSFER</span>');

  // PlanetTerp avg-GPA badge if we've cached it
  const ptInfo = ptCacheGet(course.code);
  if (ptInfo && typeof ptInfo.average_gpa === 'number') {
    const gpa = ptInfo.average_gpa.toFixed(2);
    const color = ptInfo.average_gpa >= 3.3 ? 'var(--green)' : ptInfo.average_gpa >= 2.7 ? 'var(--amber)' : 'var(--red)';
    tags.push(`<span class="tag" style="background:transparent;color:${color};border:1px solid ${color}" title="PlanetTerp average GPA">avg GPA ${gpa}</span>`);
  }

  const metaItems = [
    ...tags,
    course.prereqs.length ? `<span>Prereqs: ${course.prereqs.join(', ')}</span>` : '',
    course.note || ''
  ].filter(Boolean);

  // grade dropdown
  const gradeOptions = GRADE_OPTIONS.map(g => `<option value="${g}" ${cs.grade === g ? 'selected' : ''}>${g || '—'}</option>`).join('');

  const ptSlug = normalizeCode(course.code);
  // PlanetTerp covers any UMD course code (4-letter dept + number)
  const ptLink = /^[A-Z]{3,4}\d{3}[A-Z]?$/.test(ptSlug)
    ? `<a class="pt-link" href="https://planetterp.com/course/${ptSlug}" target="_blank" rel="noopener" title="PlanetTerp — grades &amp; reviews">PT ↗</a>`
    : '';

  div.innerHTML = `
    <div class="code">${course.code}</div>
    <div class="title-block">
      <div class="title">${course.title}${ptLink}</div>
      <div class="meta">${metaItems.join(' · ')}</div>
    </div>
    <div class="credits">${course.cr}<span class="credits-label">cr</span></div>
    <div class="status-controls">
      <button class="status-btn ${cs.status === 'in-progress' ? 'active' : ''}" data-status="in-progress" title="In progress (1)">⋯</button>
      <button class="status-btn ${cs.status === 'passed' ? 'passed-active' : ''}" data-status="passed" title="Passed (2)">✓</button>
      <button class="status-btn ${cs.status === 'failed' ? 'failed-active' : ''}" data-status="failed" title="Failed (3)">✗</button>
      <button class="status-btn ${cs.status === 'transfer' ? 'transfer-active' : ''}" data-status="transfer" title="Transfer credit (4)">T</button>
      <select class="grade-select" title="Grade">${gradeOptions}</select>
      ${isCustom ? `<button class="course-action" title="Remove" data-remove="${course.code}">×</button>` : ''}
    </div>
    ${isLocked ? `<div class="why-locked">🔒 Need to pass <strong>${prereqStatus.missing}</strong> first</div>` : ''}
  `;

  div.querySelectorAll('.status-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const newStatus = btn.dataset.status;
      const current = getCourseState(course.code).status;
      if (current === newStatus) {
        setCourseState(course.code, { status: "not-started", grade: "" });
      } else {
        setCourseState(course.code, { status: newStatus });
      }
    });
  });

  const gs = div.querySelector('.grade-select');
  gs.addEventListener('change', (e) => {
    const val = e.target.value;
    const update = { grade: val };
    // Auto-set status based on grade entry
    const current = getCourseState(course.code).status;
    if (val && current === "not-started") update.status = "passed";
    if (val === "F" && current !== "failed") update.status = "failed";
    setCourseState(course.code, update);
  });
  gs.addEventListener('click', (e) => e.stopPropagation());

  const remove = div.querySelector('[data-remove]');
  if (remove) {
    remove.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm(`Remove ${course.code}?`)) {
        state.customCourses = state.customCourses.filter(c => c.code !== course.code);
        delete state.courses[course.code];
        saveState();
        render();
      }
    });
  }

  return div;
}

function renderStats() {
  const all = flatCourses();
  const goalCodes = new Set(getGoalCodes());
  const totalRequired = Number(getSettings().totalCredits) || 125;

  let earnedCredits = 0, gpaPoints = 0, gpaCredits = 0;
  let goalsDone = 0;

  all.forEach(c => {
    const s = getCourseState(c.code);
    if (s.status === "passed" || s.status === "transfer") {
      earnedCredits += c.cr;
      if (s.status === "passed" && s.grade && GRADE_POINTS[s.grade] !== undefined) {
        gpaPoints += GRADE_POINTS[s.grade] * c.cr;
        gpaCredits += c.cr;
      }
      if (goalCodes.has(c.code)) goalsDone++;
    }
  });

  const semesters = getAllSemesters();
  let semestersDone = 0;
  semesters.forEach(sem => {
    const semBase = sem.courses || [];
    const semCustoms = (state.customCourses || []).filter(c => c.semId === sem.id);
    const all = [...semBase, ...semCustoms];
    if (all.length === 0) return;
    const done = all.every(c => {
      const s = getCourseState(c.code);
      return s.status === "passed" || s.status === "transfer";
    });
    if (done) semestersDone++;
  });

  document.getElementById('stat-credits').textContent = earnedCredits;
  document.getElementById('stat-credits-detail').textContent = `of ${totalRequired} total`;

  const gpaEl = document.getElementById('stat-gpa');
  if (gpaCredits > 0) {
    gpaEl.textContent = (gpaPoints / gpaCredits).toFixed(2);
    document.getElementById('stat-gpa-detail').textContent = `across ${gpaCredits} graded credits`;
  } else {
    gpaEl.textContent = '—';
    document.getElementById('stat-gpa-detail').textContent = 'add grades to calculate';
  }

  const goalTotal = goalCodes.size;
  document.getElementById('stat-goals').textContent = `${goalsDone}/${goalTotal}`;
  const goalLabels = Array.from(goalCodes).slice(0, 3).join(' · ');
  document.getElementById('stat-goals-detail').textContent = goalTotal === 0
    ? 'configure in Settings'
    : (goalLabels.length > 36 ? goalLabels.slice(0, 36) + '…' : goalLabels);

  document.getElementById('stat-sems').textContent = `${semestersDone}/${semesters.length}`;
  const firstSem = semesters[0]?.id || '';
  const lastSem = semesters[semesters.length - 1]?.id || '';
  document.getElementById('stat-sems-detail').textContent = firstSem && lastSem ? `${firstSem} → ${lastSem}` : 'term by term';

  const progressEl = document.getElementById('overall-progress');
  if (progressEl) progressEl.style.width = `${Math.min(100, (earnedCredits / totalRequired) * 100)}%`;
}

function renderNextUp() {
  const list = document.getElementById('next-list');
  list.innerHTML = '';
  const eligible = flatCourses().filter(c => {
    const s = getCourseState(c.code);
    return s.status === "not-started" && prereqsMet(c).met;
  });
  if (eligible.length === 0) {
    list.innerHTML = '<li class="empty">Mark courses as you complete them to see what unlocks</li>';
    return;
  }
  eligible.slice(0, 10).forEach(c => {
    const li = document.createElement('li');
    const titleShort = c.title.length > 26 ? c.title.slice(0, 26) + '…' : c.title;
    li.innerHTML = `<span><strong>${c.code}</strong> ${titleShort}</span><span class="credits-mini">${c.cr} cr</span>`;
    list.appendChild(li);
  });
}

function renderGoals() {
  const all = flatCourses();
  const goalCodes = getGoalCodes();
  const tracker = document.getElementById('goal-tracker');
  tracker.innerHTML = '';
  const note = document.getElementById('goal-tracker-note');
  if (note) note.textContent = '';

  if (goalCodes.length === 0) {
    tracker.innerHTML = '<p style="color:var(--slate);font-size:.85rem;font-style:italic">No goal courses set. Open <strong>Settings</strong> to add some.</p>';
    return;
  }

  goalCodes.forEach(code => {
    const g = all.find(c => c.code === code);
    const s = getCourseState(code);
    let icon = '○', iconCls = '', statusText = '', statusCls = '';
    if (!g) {
      statusText = 'Not in plan yet — add it via "+ Add Course"';
    } else {
      const pre = prereqsMet(g);
      if (s.status === "passed" || s.status === "transfer") {
        icon = '✓'; iconCls = 'done'; statusText = 'Done · ' + (s.grade || (s.status === "transfer" ? 'transfer' : 'no grade')); statusCls = 'done';
      } else if (s.status === "in-progress") {
        icon = '◐'; iconCls = 'in-prog'; statusText = 'In progress'; statusCls = 'in-prog';
      } else if (pre.met) {
        icon = '◯'; iconCls = 'ready'; statusText = 'Ready to register'; statusCls = 'ready';
      } else {
        const missing = (g.prereqs || []).filter(p => {
          const ps = getCourseState(p);
          return ps.status !== "passed" && ps.status !== "transfer";
        });
        statusText = `Need: ${missing.join(', ')}`;
      }
    }
    const row = document.createElement('div');
    row.className = 'goal-row';
    row.innerHTML = `
      <div class="goal-icon ${iconCls}">${icon}</div>
      <div class="goal-info">
        <div class="goal-name">${code}${g ? ` · ${g.title}` : ''}</div>
        <div class="goal-status ${statusCls}">${statusText}</div>
      </div>
    `;
    tracker.appendChild(row);
  });
}

function renderAlerts() {
  const cont = document.getElementById('alerts-container');
  cont.innerHTML = '';
  const alerts = [];

  const all = flatCourses();
  const failed = all.filter(c => getCourseState(c.code).status === "failed");
  failed.forEach(c => {
    alerts.push({ type: 'danger', text: `<strong>${c.code} failed.</strong> Every course downstream is blocked. Plan a retake.` });
  });

  const cMinus = all.filter(c => {
    const s = getCourseState(c.code);
    return s.status === "passed" && s.grade === "C-";
  });
  if (cMinus.length > 0) {
    alerts.push({ type: 'warn', text: `<strong>C- in ${cMinus.map(c=>c.code).join(', ')}.</strong> You met the minimum, but the next course will be tighter. Consider office hours.` });
  }

  // GPA dip
  let gp = 0, gc = 0;
  all.forEach(c => {
    const s = getCourseState(c.code);
    if (s.status === "passed" && GRADE_POINTS[s.grade] !== undefined) {
      gp += GRADE_POINTS[s.grade] * c.cr;
      gc += c.cr;
    }
  });
  if (gc >= 12 && gp / gc < 3.0) {
    alerts.push({ type: 'warn', text: `<strong>GPA below 3.0.</strong> CS-permission for goal courses gets harder under 3.0. Talk to your CE advisor.` });
  }

  // Goal-course readiness — generic across whatever goals are configured
  getGoalCodes().forEach(code => {
    const g = all.find(c => c.code === code);
    if (!g) return;
    const s = getCourseState(code);
    if (s.status !== "not-started") return;
    if (prereqsMet(g).met) {
      alerts.push({ type: 'success', text: `<strong>${code} is unlocked.</strong> All prereqs cleared — register or request permission.` });
    }
  });

  // Semester load warnings
  getAllSemesters().forEach(sem => {
    const semCourses = [...(sem.courses || []), ...(state.customCourses || []).filter(c => c.semId === sem.id)];
    const inProgress = semCourses.filter(c => getCourseState(c.code).status === "in-progress");
    const totalCr = inProgress.reduce((a, c) => a + c.cr, 0);
    if (totalCr >= 19) {
      alerts.push({ type: 'warn', text: `<strong>${sem.name}:</strong> ${totalCr} credits in progress is heavy. Consider moving one course to a different term.` });
    }
  });

  if (alerts.length === 0) {
    alerts.push({ type: 'info', text: `Nothing flagged — you're tracking on plan. Keep marking courses as you go.` });
  }

  alerts.slice(0, 5).forEach(a => {
    const el = document.createElement('div');
    el.className = 'alert' + (a.type === 'danger' ? ' danger' : a.type === 'success' ? ' success' : a.type === 'info' ? ' info' : '');
    el.innerHTML = a.text;
    cont.appendChild(el);
  });
}

