'use strict';
/* ============================================================
   AUDIT VIEW
   ============================================================ */
function renderAudit() {
  const all = flatCourses();
  const totalRequired = Number(getSettings().totalCredits) || 125;
  let earnedCredits = 0;
  all.forEach(c => {
    const s = getCourseState(c.code);
    if (s.status === "passed" || s.status === "transfer") earnedCredits += c.cr;
  });
  const pct = Math.min(100, Math.round((earnedCredits / totalRequired) * 100));
  document.getElementById('audit-percent').textContent = pct + '%';
  const headline = document.getElementById('audit-headline');
  const tag = document.getElementById('audit-tagline');
  if (pct === 0) { headline.textContent = "Building Your Degree"; tag.textContent = `Mark courses to track progress against your ${totalRequired}-credit requirement.`; }
  else if (pct < 25) { headline.textContent = "Strong start."; tag.textContent = "Foundation courses are the highest-leverage time investment of your degree."; }
  else if (pct < 50) { headline.textContent = "Hitting your stride."; tag.textContent = "Mid-program courses gate the rest. Keep grades up in critical-prereq courses."; }
  else if (pct < 75) { headline.textContent = "The pivot year."; tag.textContent = "By end of this stretch, every prereq for your goal courses should be done. Submit permission requests on time."; }
  else if (pct < 100) { headline.textContent = "Final stretch."; tag.textContent = "Capstone and depth electives. Your portfolio matters more than your GPA from here."; }
  else { headline.textContent = "Degree complete."; tag.textContent = "Apply for graduation, confirm audit with advisor 60 days before commencement."; }

  // Dynamic core-card title
  const coreTitleEl = document.getElementById('audit-core-title');
  if (coreTitleEl) coreTitleEl.textContent = `${getSettings().programName || 'Major'} Core`;

  // Core — accept CE's 'ce-core' and the auto-gen 'major-core'/'major-support'/'major-upper' buckets
  const coreEl = document.getElementById('audit-core');
  const coreCard = document.getElementById('audit-core-card');
  coreEl.innerHTML = '';
  const coreCourses = all.filter(c =>
    c.category === 'ce-core' ||
    c.category === 'major-core' ||
    c.category === 'major-support' ||
    c.category === 'major-upper'
  );
  coreCourses.forEach(c => coreEl.appendChild(auditLine(c)));
  if (coreCard) coreCard.style.display = coreCourses.length ? '' : 'none';

  // GenEd
  const genEdEl = document.getElementById('audit-gened');
  genEdEl.innerHTML = '';
  const baseGenEdDefs = (typeof GENED_DEFS !== 'undefined' ? GENED_DEFS : [
    { id: 'FSAW', name: 'Academic Writing', need: 1 },
    { id: 'FSPW', name: 'Professional Writing', need: 1 },
    { id: 'FSOC', name: 'Oral Communication', need: 1 },
    { id: 'FSMA', name: 'Math Foundation', need: 1 },
    { id: 'FSAR', name: 'Analytic Reasoning', need: 1 },
    { id: 'DSHS', name: 'History/Social Sciences', need: 2 },
    { id: 'DSHU', name: 'Humanities', need: 2 },
    { id: 'DSNS', name: 'Natural Sciences', need: 1 },
    { id: 'DSNL', name: 'Natural Sciences w/ Lab', need: 1 },
    { id: 'DSSP', name: 'Scholarship in Practice', need: 2 },
    { id: 'SCIS', name: 'I-Series', need: 1 },
  ]).filter(d => d.id !== 'DVUP' && d.id !== 'DVCC');
  const countForTag = (tag) => all.filter(c => {
    if (typeof courseGenEdTags === 'function') return courseGenEdTags(c).includes(tag);
    return c.category === `gened-${tag.toLowerCase()}`;
  });
  const renderGenEdAuditLine = ({ label, need, matched, doneOverride = null }) => {
    const done = doneOverride === null
      ? matched.filter(c => {
          const s = getCourseState(c.code);
          return s.status === "passed" || s.status === "transfer";
        }).length
      : doneOverride;
    const planned = matched.length;
    const el = document.createElement('div');
    const dCls = done >= need ? 'done' : (planned >= need ? 'partial' : '');
    el.className = 'audit-line ' + dCls;
    el.innerHTML = `
      <div class="check">${done >= need ? '✓' : (planned >= need ? '◐' : '○')}</div>
      <div class="name">${label} <span style="color:var(--slate);font-size:.78rem">${matched.map(c => c.code).join(', ') || 'none planned'}</span></div>
      <div class="status">${done}/${need}</div>
    `;
    genEdEl.appendChild(el);
  };

  baseGenEdDefs.forEach(d => {
    renderGenEdAuditLine({
      label: `${d.id} · ${d.name}`,
      need: d.need,
      matched: countForTag(d.id),
    });
  });

  const dvupMatches = countForTag('DVUP');
  const dvccMatches = countForTag('DVCC');
  const diversityMatches = [...dvupMatches, ...dvccMatches.filter(c => !dvupMatches.some(u => u.code === c.code))];
  const diversityDone = diversityMatches.filter(c => {
    const s = getCourseState(c.code);
    return s.status === "passed" || s.status === "transfer";
  }).length;
  renderGenEdAuditLine({ label: 'DVUP · Understanding Plural Societies', need: 1, matched: dvupMatches });
  renderGenEdAuditLine({ label: 'Diversity #2 · DVUP or DVCC', need: 2, matched: diversityMatches, doneOverride: diversityDone });


  // Tech Electives
  const techEl = document.getElementById('audit-tech');
  techEl.innerHTML = '';
  const techCats = [
    { id: 'tech-a', label: 'Cat A · Math/Basic Sci (min 6 cr; ≥3 cr must be 400-level)', need: 6, type: 'cr', subCheck: () => {
      // At least 3 credits of Cat A must be 400-level
      const catACourses = all.filter(c => c.category === 'tech-a');
      const lvl400 = catACourses.filter(c => {
        const match = c.code.match(/\d+/);
        return match && parseInt(match[0]) >= 400;
      });
      const done400 = lvl400.filter(c => {
        const s = getCourseState(c.code);
        return s.status === 'passed' || s.status === 'transfer';
      }).reduce((a, c) => a + c.cr, 0);
      return done400 >= 3 ? '' : ` ⚠ ${done400}/3 cr at 400-level`;
    }},
    { id: 'tech-b', label: 'Cat B · CS Theory & Apps', need: 3, type: 'cr' },
    { id: 'tech-c', label: 'Cat C · EE Theory & Apps', need: 6, type: 'cr' },
    { id: 'tech-d', label: 'Cat D · Advanced Lab', need: 2, type: 'cr' },
    { id: 'tech-e', label: 'Cat E · Capstone Design', need: 3, type: 'cr' },
    { id: 'tech-f', label: 'Cat F · General Tech Elective', need: 3, type: 'cr' },
  ];
  let techTotalDone = 0, techTotalPlanned = 0;
  techCats.forEach(cat => {
    const matched = all.filter(c => c.category === cat.id);
    const done = matched.filter(c => {
      const s = getCourseState(c.code);
      return s.status === "passed" || s.status === "transfer";
    }).reduce((a, c) => a + c.cr, 0);
    const totalPlanned = matched.reduce((a, c) => a + c.cr, 0);
    techTotalDone += done;
    techTotalPlanned += totalPlanned;
    const dCls = done >= cat.need ? 'done' : (done > 0 ? 'partial' : '');
    const subNote = cat.subCheck ? cat.subCheck() : '';
    const el = document.createElement('div');
    el.className = 'audit-line ' + dCls;
    el.innerHTML = `
      <div class="check">${done >= cat.need ? '✓' : (done > 0 ? '◐' : '○')}</div>
      <div class="name">${cat.label}${subNote ? `<span style="color:var(--amber);font-size:.78rem"> ${subNote}</span>` : ''} <span style="color:var(--slate);font-size:.78rem">(${matched.map(c=>c.code).join(', ') || 'none'})</span></div>
      <div class="status">${done}/${cat.need} cr</div>
    `;
    techEl.appendChild(el);
  });
  // Total tech electives row
  const totalNeeded = 26;
  const totalDoneEl = document.createElement('div');
  const tCls = techTotalDone >= totalNeeded ? 'done' : (techTotalDone > 0 ? 'partial' : '');
  totalDoneEl.className = 'audit-line ' + tCls;
  totalDoneEl.style.cssText = 'border-top:1px solid var(--line);margin-top:8px;padding-top:8px;font-weight:600';
  totalDoneEl.innerHTML = `
    <div class="check">${techTotalDone >= totalNeeded ? '✓' : (techTotalDone > 0 ? '◐' : '○')}</div>
    <div class="name">Total Tech Electives (minimum 26 credits required)</div>
    <div class="status">${techTotalDone}/${totalNeeded} cr</div>
  `;
  techEl.appendChild(totalDoneEl);

  // Tech card visibility
  const techCard = document.getElementById('audit-tech-card');
  if (techCard) {
    const anyTech = all.some(c => c.category && c.category.startsWith('tech-'));
    techCard.style.display = anyTech ? '' : 'none';
  }
  // GenEd card visibility
  const genEdCard = document.getElementById('audit-gened-card');
  if (genEdCard) {
    const anyGenEd = all.some(c => c.category && c.category.startsWith('gened'));
    genEdCard.style.display = anyGenEd ? '' : 'none';
  }

  // Goals
  const goalsEl = document.getElementById('audit-goals');
  goalsEl.innerHTML = '';
  const goalCodes = getGoalCodes();
  goalCodes.forEach(code => {
    const c = all.find(x => x.code === code);
    if (c) goalsEl.appendChild(auditLine(c));
    else {
      const el = document.createElement('div');
      el.className = 'audit-line';
      el.innerHTML = `<div class="check">○</div><div class="name">${code}</div><div class="status">not in plan</div>`;
      goalsEl.appendChild(el);
    }
  });
  if (goalCodes.length === 0) {
    goalsEl.innerHTML = '<p style="color:var(--slate);font-size:.85rem;font-style:italic;margin:0">No goal courses configured.</p>';
  }
}

function auditLine(course) {
  const s = getCourseState(course.code);
  const done = s.status === "passed" || s.status === "transfer";
  const partial = s.status === "in-progress";
  const dCls = done ? 'done' : (partial ? 'partial' : '');
  const el = document.createElement('div');
  el.className = 'audit-line ' + dCls;
  const status = done ? (s.grade || (s.status === "transfer" ? "transfer" : "passed")) : (partial ? "in progress" : `${course.cr} cr`);
  el.innerHTML = `
    <div class="check">${done ? '✓' : (partial ? '◐' : '○')}</div>
    <div class="name">${course.code} · ${course.title}</div>
    <div class="status">${status}</div>
  `;
  return el;
}

