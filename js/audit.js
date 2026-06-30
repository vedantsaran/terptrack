'use strict';
/* ============================================================
   AUDIT VIEW
   ============================================================ */
let auditIssueKey = '';

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

  const issuesEl = document.getElementById('audit-issues');
  if (issuesEl) issuesEl.innerHTML = auditIssuesHtml();
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

function auditEscape(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[ch]));
}

function auditCourseNorm(code) {
  return typeof normalizeCode === 'function'
    ? normalizeCode(code)
    : String(code || '').toUpperCase().replace(/\s+/g, '');
}

function auditIsCatalogCourseCode(code) {
  return /^[A-Z]{3,4}\s*\d{3}[A-Z]?$/i.test(String(code || '').trim());
}

function auditCourseGenEdTags(course) {
  if (typeof courseGenEdTags === 'function') return courseGenEdTags(course);
  const tags = new Set();
  if (course?.category && String(course.category).startsWith('gened-')) {
    tags.add(String(course.category).replace('gened-', '').toUpperCase());
  }
  (Array.isArray(course?.categories) ? course.categories : [])
    .filter(cat => String(cat || '').startsWith('gened-'))
    .forEach(cat => tags.add(String(cat).replace('gened-', '').toUpperCase()));
  return Array.from(tags).filter(Boolean);
}

function auditInferPlaceholderTags(course) {
  if (typeof inferPlaceholderTags === 'function') return inferPlaceholderTags(course);
  const tags = new Set(auditCourseGenEdTags(course));
  const hay = [course?.code, course?.title, course?.note, course?.category].join(' ').toUpperCase();
  ['FSAW','FSPW','FSOC','FSMA','FSAR','DSHS','DSHU','DSNS','DSNL','DSSP','DVUP','DVCC','SCIS']
    .forEach(tag => { if (hay.includes(tag)) tags.add(tag); });
  if (hay.includes('HUMANITIES')) tags.add('DSHU');
  if (hay.includes('HISTORY') || hay.includes('SOCIAL')) tags.add('DSHS');
  if (hay.includes('SCHOLARSHIP')) tags.add('DSSP');
  return Array.from(tags).filter(Boolean);
}

function auditSlotText(course) {
  return [
    course?.code,
    course?.title,
    course?.note,
    course?.category,
    course?.kind,
    ...(Array.isArray(course?.categories) ? course.categories : []),
  ].join(' ').toUpperCase();
}

function auditIsSlotPlaceholder(course) {
  if (!course || auditIsCatalogCourseCode(course.code)) return false;
  if (typeof browseIsSlotPlaceholder === 'function') return browseIsSlotPlaceholder(course);
  const hay = auditSlotText(course);
  return /^GENED\s/i.test(course.code || '')
    || /^FREE ELECTIVE/i.test(course.code || '')
    || /\bELECTIVE\b/.test(hay)
    || hay.includes('FOREIGN LANGUAGE')
    || hay.includes('LANGUAGE SEQUENCE')
    || hay.includes('SPECIALIZATION')
    || hay.includes('SUPPORT')
    || hay.includes('PLACEHOLDER')
    || hay.includes('AUTO-GENERATED')
    || hay.includes('3XX')
    || hay.includes('4XX')
    || String(course.category || '').startsWith('gened-')
    || ['major-upper', 'major-support'].includes(String(course.category || ''));
}

function auditSlotRequiredDept(course) {
  if (typeof browseSlotRequiredDept === 'function') return browseSlotRequiredDept(course);
  const text = auditSlotText(course);
  const codeMatch = String(course?.code || '').toUpperCase().match(/\b([A-Z]{3,4})\s*(?:[1-4]XX|ELECTIVE|SPECIALIZATION|SUPPORT|TECH)/);
  if (codeMatch) return codeMatch[1];
  const titleMatch = String(course?.title || '').toUpperCase().match(/\b([A-Z]{3,4})\s+(?:UPPER|SPECIALIZATION|ELECTIVE|SUPPORTING|SUPPORT|TECH)/);
  if (titleMatch) return titleMatch[1];
  return '';
}

function auditSlotRequiredLevel(course) {
  if (typeof browseSlotRequiredLevel === 'function') return browseSlotRequiredLevel(course);
  const text = auditSlotText(course);
  if (/\b4XX\b|400-LEVEL|400 LEVEL/.test(text)) return 400;
  if (/\b3XX\b|300-LEVEL|300 LEVEL|UPPER-DIVISION|UPPER DIVISION|ADVANCED/.test(text)) return 300;
  if (/\b2XX\b|200-LEVEL|200 LEVEL/.test(text)) return 200;
  if (/\b1XX\b|100-LEVEL|100 LEVEL/.test(text)) return 100;
  return 0;
}

function auditSlotKind(course) {
  if (typeof browseSlotKind === 'function') return browseSlotKind(course);
  const text = auditSlotText(course);
  const tags = auditInferPlaceholderTags(course);
  if (tags.length) return 'gened';
  if (/^FREE ELECTIVE/i.test(course?.code || '') || String(course?.category || '') === 'elective') return 'free-elective';
  if (text.includes('FOREIGN LANGUAGE') || text.includes('LANGUAGE SEQUENCE')) return 'language';
  if (text.includes('TECH ELECTIVE') || text.includes('TECHNICAL ELECTIVE') || String(course?.category || '').startsWith('tech-')) return 'technical-elective';
  if (String(course?.category || '') === 'major-support' || text.includes('SUPPORT')) return 'major-support';
  if (String(course?.category || '') === 'major-upper' || text.includes('UPPER-DIVISION') || text.includes('UPPER DIVISION') || text.includes('SPECIALIZATION') || text.includes('4XX') || text.includes('3XX')) return 'major-elective';
  return 'placeholder';
}

function auditSlotKindLabel(kind) {
  if (typeof browseSlotKindLabel === 'function') return browseSlotKindLabel(kind);
  return {
    gened: 'GenEd slot',
    'free-elective': 'Free elective',
    language: 'Language sequence',
    'technical-elective': 'Technical elective',
    'major-elective': 'Major elective',
    'major-support': 'Supporting course',
    placeholder: 'Placeholder',
  }[kind] || 'Placeholder';
}

function auditRequirementDefs() {
  const defs = (typeof GENED_DEFS !== 'undefined' ? GENED_DEFS : [
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
    { id: 'DVUP', name: 'Understanding Plural Societies', need: 1 },
  ]).filter(def => def.id !== 'DVCC');
  return [
    ...defs.map(def => ({ ...def, composite: false })),
    { id: 'DIVERSITY-2', name: 'Second Diversity (DVUP or DVCC)', need: 2, composite: true, tags: ['DVUP', 'DVCC'] },
  ];
}

function auditGenEdLabel(id) {
  if (id === 'DIVERSITY-2') return 'Second Diversity (DVUP or DVCC)';
  if (typeof genEdLabel === 'function') return genEdLabel(id);
  const def = auditRequirementDefs().find(item => item.id === id);
  return def ? `${def.id} · ${def.name}` : id;
}

function auditGenEdCounts(all = flatCourses()) {
  const counts = {};
  all.forEach(course => {
    auditCourseGenEdTags(course).forEach(tag => {
      counts[tag] = counts[tag] || [];
      counts[tag].push(course);
    });
  });
  return counts;
}

function auditGenEdGapIssues(all = flatCourses()) {
  const counts = auditGenEdCounts(all);
  return auditRequirementDefs()
    .map(def => {
      const matched = def.composite
        ? [
            ...(counts.DVUP || []),
            ...(counts.DVCC || []).filter(course => !(counts.DVUP || []).some(item => auditCourseNorm(item.code) === auditCourseNorm(course.code))),
          ]
        : (counts[def.id] || []);
      const have = matched.length;
      if (have >= def.need) return null;
      const tags = def.tags || [def.id];
      const label = auditGenEdLabel(def.id);
      return {
        key: `gened-${def.id}`,
        type: 'gened',
        level: 'warn',
        title: `${label} gap`,
        eyebrow: 'GenEd requirement',
        status: `${have}/${def.need} planned`,
        summary: `This requirement still needs ${def.need - have} course${def.need - have === 1 ? '' : 's'} in the plan.`,
        detail: def.composite
          ? 'UMD diversity coverage needs two diversity-tagged courses, with at least one DVUP course. A second DVUP or a DVCC course can satisfy this slot.'
          : `Add or replace a planned course with a real UMD course carrying the ${def.id} GenEd tag.`,
        satisfies: tags.map(tag => auditGenEdLabel(tag)).join(' or '),
        actionLabel: 'Find Courses',
        actionType: 'browse',
        browse: {
          dept: auditPreferredBrowseDept(),
          genEd: tags.length === 1 ? tags[0] : (typeof BROWSE_ALL_GENEDS_VALUE !== 'undefined' ? BROWSE_ALL_GENEDS_VALUE : ''),
          search: '',
          label: `Audit: ${label}`,
        },
        tags,
      };
    })
    .filter(Boolean);
}

function auditSemesterName(semId) {
  const sem = (typeof getAllSemesters === 'function' ? getAllSemesters() : []).find(item => item.id === semId);
  return sem?.name || semId || 'Unassigned';
}

function auditPlaceholderIssues(all = flatCourses()) {
  return all
    .filter(course => auditIsSlotPlaceholder(course))
    .map((course, index) => {
      const tags = auditInferPlaceholderTags(course);
      const kind = auditSlotKind(course);
      const dept = auditSlotRequiredDept(course);
      const level = auditSlotRequiredLevel(course);
      const semName = auditSemesterName(course.semId);
      const key = `slot-${course.semId || 'none'}-${index}-${auditCourseNorm(course.code)}`.replace(/[^A-Za-z0-9_-]/g, '-');
      const browse = auditPlaceholderBrowseConfig(course, { tags, kind, dept, level });
      return {
        key,
        type: 'placeholder',
        level: kind === 'free-elective' ? 'info' : 'warn',
        title: course.code || auditSlotKindLabel(kind),
        eyebrow: auditSlotKindLabel(kind),
        status: semName,
        summary: auditPlaceholderSummary(course, { tags, kind, dept, level }),
        detail: auditPlaceholderDetail(course, { tags, kind, dept, level }),
        satisfies: auditPlaceholderSatisfies(course, { tags, kind, dept, level }),
        actionLabel: tags.length || kind !== 'free-elective' ? 'Choose Replacement' : 'Find Courses',
        actionType: 'placeholder',
        browse,
        tags,
        courseCode: course.code,
        semId: course.semId || '',
      };
    });
}

function auditPlaceholderSummary(course, info) {
  if (info.tags.length) return `This ${course.cr || 3}-credit slot is still a category placeholder, not a real registered course.`;
  if (info.kind === 'free-elective') return 'This open elective is still unassigned and can be personalized around a minor, certificate, career interest, or credit balance.';
  if (info.kind === 'major-elective') return 'This major elective slot needs a real upper-level course that your department accepts.';
  if (info.kind === 'technical-elective') return 'This technical elective slot needs a real approved technical course.';
  if (info.kind === 'language') return 'This language sequence slot needs a real language course at the right level.';
  if (info.kind === 'major-support') return 'This supporting-course slot needs a concrete department-approved course.';
  return 'This generated slot still needs a real UMD course before registration planning is complete.';
}

function auditPlaceholderDetail(course, info) {
  if (info.tags.length) {
    return `Search for real courses tagged ${info.tags.join(' or ')} and replace this placeholder before building a final schedule.`;
  }
  if (info.kind === 'free-elective') {
    const depts = typeof profilePreferredDepartments === 'function' ? profilePreferredDepartments().slice(0, 5) : [];
    return depts.length
      ? `Your profile points to ${depts.join(', ')} first. Browse those departments, then use the slot picker to place the course into this elective.`
      : 'Browse any department, minor, certificate, or interest area, then use the slot picker to place the course into this elective.';
  }
  if (info.kind === 'major-elective') return 'Confirm the course family with your department rules, then replace the placeholder with a real catalog course.';
  if (info.kind === 'technical-elective') return 'Use the course family and level shown here to narrow Browse before confirming the course counts toward your program.';
  if (info.kind === 'language') return 'Pick the next course in the intended language sequence and verify placement rules.';
  if (info.kind === 'major-support') return 'Use the required department or support-course family as the starting filter.';
  return 'Use Browse to find a real course that matches the slot, then replace it from the placeholder search or Browse slot picker.';
}

function auditPlaceholderSatisfies(course, info) {
  if (info.tags.length) return info.tags.map(tag => auditGenEdLabel(tag)).join(' or ');
  const parts = [];
  if (info.dept) parts.push(`${info.dept} course`);
  if (info.level) parts.push(`${info.level}-level or higher`);
  if (info.kind === 'free-elective') parts.push('any degree-applicable elective');
  if (info.kind === 'language') parts.push('approved language sequence course');
  if (!parts.length) parts.push(course.title || auditSlotKindLabel(info.kind));
  return parts.join(' · ');
}

function auditPreferredBrowseDept() {
  if (typeof browseProfileDepartments === 'function' && browseProfileDepartments().length && typeof BROWSE_PROFILE_DEPTS_VALUE !== 'undefined') {
    return BROWSE_PROFILE_DEPTS_VALUE;
  }
  if (typeof profilePreferredDepartments === 'function') {
    const first = profilePreferredDepartments()[0];
    if (first) return first;
  }
  return '';
}

function auditPlaceholderBrowseConfig(course, info) {
  if (typeof placeholderBrowseConfig === 'function') {
    const previousTarget = typeof placeholderSearchTarget !== 'undefined' ? placeholderSearchTarget : null;
    const previousTags = typeof placeholderSearchSelectedTags !== 'undefined' ? placeholderSearchSelectedTags.slice() : [];
    try {
      if (typeof placeholderSearchTarget !== 'undefined') placeholderSearchTarget = { ...course, semId: course.semId || '' };
      if (typeof placeholderSearchSelectedTags !== 'undefined') placeholderSearchSelectedTags = info.tags.slice();
      const config = placeholderBrowseConfig({ ...course, semId: course.semId || '' });
      if (config) return { ...config, label: `Audit: replace ${course.code || 'placeholder'}` };
    } finally {
      if (typeof placeholderSearchTarget !== 'undefined') placeholderSearchTarget = previousTarget;
      if (typeof placeholderSearchSelectedTags !== 'undefined') placeholderSearchSelectedTags = previousTags;
    }
  }
  return {
    dept: info.dept || auditPreferredBrowseDept(),
    genEd: info.tags.length === 1 ? info.tags[0] : '',
    search: '',
    label: `Audit: replace ${course.code || 'placeholder'}`,
  };
}

function auditFormatList(values = [], limit = 4) {
  const clean = values.map(value => String(value || '').trim()).filter(Boolean);
  if (!clean.length) return '';
  return clean.slice(0, limit).join(', ') + (clean.length > limit ? ` +${clean.length - limit} more` : '');
}

function auditRecentPriorCreditChanges(limit = 5) {
  const appState = typeof state !== 'undefined' ? state : {};
  const changes = typeof recentPlanChanges === 'function'
    ? recentPlanChanges()
    : (Array.isArray(appState.recentChanges) ? appState.recentChanges : []);
  return (changes || [])
    .filter(change => change?.undo?.kind === 'prior-credit' && !change.undo.appliedAt)
    .slice(0, limit);
}

function auditPriorCreditEvidence(change) {
  const review = change?.undo?.review || {};
  const overlaps = (Array.isArray(review.overlaps) ? review.overlaps : [])
    .map(overlap => ({
      code: String(overlap?.code || '').trim(),
      sources: Array.from(new Set(overlap?.sources || [])).map(source => String(source || '').trim()).filter(Boolean),
    }))
    .filter(overlap => overlap.code && overlap.sources.length);
  const existingAttempts = (Array.isArray(review.existingAttempts) ? review.existingAttempts : [])
    .map(item => ({
      code: String(item?.code || '').trim(),
      status: String(item?.status || '').trim(),
      grade: String(item?.grade || '').trim(),
    }))
    .filter(item => item.code && item.status);
  return { overlaps, existingAttempts };
}

function auditPriorCreditAttemptLabel(item) {
  const status = String(item?.status || '').replace('-', ' ');
  const grade = item?.grade ? ` (${item.grade})` : '';
  return `${item.code} was already marked ${status}${grade}`;
}

function auditPriorCreditOverlapLabel(overlap) {
  const sources = auditFormatList(overlap.sources || [], 3);
  return sources ? `${overlap.code} via ${sources}` : overlap.code;
}

function auditPriorCreditIssueSummary(evidence) {
  const parts = [];
  if (evidence.overlaps.length) {
    parts.push(auditFormatList(evidence.overlaps.map(auditPriorCreditOverlapLabel), 2));
  }
  if (evidence.existingAttempts.length) {
    parts.push(auditFormatList(evidence.existingAttempts.map(auditPriorCreditAttemptLabel), 2));
  }
  return parts.filter(Boolean).join(' · ') || 'Prior-credit conflicts need advisor review before these credits are final.';
}

function auditPriorCreditIssueDetail(evidence) {
  const detail = [];
  if (evidence.overlaps.length) {
    detail.push(`Overlapping selected sources: ${auditFormatList(evidence.overlaps.map(auditPriorCreditOverlapLabel), 4)}.`);
  }
  if (evidence.existingAttempts.length) {
    detail.push(`Existing UMD attempts: ${auditFormatList(evidence.existingAttempts.map(auditPriorCreditAttemptLabel), 4)}.`);
  }
  detail.push('Confirm the official source that should count before treating these AP, IB, transfer, or repeated-course credits as final.');
  return detail.join(' ');
}

function auditPriorCreditConflictIssues() {
  return auditRecentPriorCreditChanges()
    .map(change => {
      const evidence = auditPriorCreditEvidence(change);
      if (!evidence.overlaps.length && !evidence.existingAttempts.length) return null;
      const affectedCodes = Array.from(new Set([
        ...evidence.overlaps.map(item => item.code),
        ...evidence.existingAttempts.map(item => item.code),
      ].filter(Boolean)));
      const changedId = String(change.id || affectedCodes.join('-') || 'latest').replace(/[^A-Za-z0-9_-]/g, '-');
      return {
        key: `prior-credit-${changedId}`,
        type: 'prior-credit',
        level: 'warn',
        title: 'Prior credit conflicts need review',
        eyebrow: 'Prior credit review',
        status: `${affectedCodes.length || 1} course${affectedCodes.length === 1 ? '' : 's'}`,
        summary: auditPriorCreditIssueSummary(evidence),
        detail: auditPriorCreditIssueDetail(evidence),
        satisfies: 'Duplicate-credit, transfer-credit, AP/IB, and repeat-attempt rules',
        actionLabel: 'Review prior credits',
        actionType: 'prior-credit',
        courseCode: affectedCodes[0] || 'Prior credit',
        changeId: change.id || '',
        tags: ['Prior credit', 'Duplicate credit'],
      };
    })
    .filter(Boolean);
}

function auditDegreeIssues() {
  const all = flatCourses();
  const issues = [
    ...auditPriorCreditConflictIssues(),
    ...auditGenEdGapIssues(all),
    ...auditPlaceholderIssues(all),
  ];
  return issues.sort((a, b) => {
    const order = { danger: 0, warn: 1, info: 2 };
    const typeOrder = { 'prior-credit': 0, placeholder: 1, gened: 2 };
    return (order[a.level] ?? 9) - (order[b.level] ?? 9)
      || (typeOrder[a.type] ?? 9) - (typeOrder[b.type] ?? 9)
      || String(a.type).localeCompare(String(b.type))
      || String(a.title).localeCompare(String(b.title));
  });
}

function auditIssuesHtml() {
  const issues = auditDegreeIssues();
  if (!issues.some(issue => issue.key === auditIssueKey)) auditIssueKey = '';
  if (!issues.length) {
    return `
      <div class="audit-issue-empty">
        <strong>No open degree issues.</strong>
        <span>All planned requirements are represented by real courses or completed requirement rows.</span>
      </div>
    `;
  }
  const counts = issues.reduce((acc, issue) => {
    acc[issue.type] = (acc[issue.type] || 0) + 1;
    return acc;
  }, {});
  const priorCount = counts['prior-credit'] || 0;
  const placeholderCount = counts.placeholder || 0;
  const genedCount = counts.gened || 0;
  return `
    <div class="audit-issue-toolbar">
      <div>
        <strong>${issues.length} open item${issues.length === 1 ? '' : 's'}</strong>
        <span>${priorCount} prior-credit review${priorCount === 1 ? '' : 's'} · ${placeholderCount} placeholder${placeholderCount === 1 ? '' : 's'} · ${genedCount} GenEd gap${genedCount === 1 ? '' : 's'}</span>
      </div>
      <button type="button" class="btn small" onclick="auditOpenNextIssueBrowse()">Start With Top Item</button>
    </div>
    <div class="audit-issue-list">
      ${issues.map(issue => auditIssueCardHtml(issue)).join('')}
    </div>
  `;
}

function auditIssueCardHtml(issue) {
  const open = auditIssueKey === issue.key;
  const tags = (issue.tags || []).map(tag => `<span>${auditEscape(tag)}</span>`).join('');
  const secondaryLabel = issue.actionType === 'prior-credit' ? 'Open Settings' : 'Open Browse';
  return `
    <div class="audit-issue ${auditEscape(issue.level)} ${open ? 'open' : ''}">
      <button type="button" class="audit-issue-main" onclick="auditToggleIssue('${auditEscape(issue.key)}')" aria-expanded="${open ? 'true' : 'false'}">
        <span class="audit-issue-severity" aria-hidden="true"></span>
        <span class="audit-issue-copy">
          <span class="audit-issue-eyebrow">${auditEscape(issue.eyebrow || issue.type)}</span>
          <strong>${auditEscape(issue.title)}</strong>
          <small>${auditEscape(issue.summary)}</small>
        </span>
        <span class="audit-issue-status">${auditEscape(issue.status || '')}</span>
      </button>
      ${open ? `
        <div class="audit-issue-drawer">
          <div>
            <span>Why it remains</span>
            <p>${auditEscape(issue.detail)}</p>
          </div>
          <div>
            <span>What can satisfy it</span>
            <p>${auditEscape(issue.satisfies || 'A real approved UMD course for this slot.')}</p>
            ${tags ? `<div class="audit-issue-tags">${tags}</div>` : ''}
          </div>
          <div class="audit-issue-actions">
            <button type="button" class="btn small primary" onclick="auditOpenIssuePrimary('${auditEscape(issue.key)}')">${auditEscape(issue.actionLabel || 'Open')}</button>
            <button type="button" class="btn small" onclick="auditOpenIssueBrowse('${auditEscape(issue.key)}')">${auditEscape(secondaryLabel)}</button>
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function auditFindIssue(key) {
  return auditDegreeIssues().find(issue => issue.key === key) || null;
}

function auditToggleIssue(key) {
  auditIssueKey = auditIssueKey === key ? '' : key;
  renderAudit();
}

function auditOpenIssuePrimary(key) {
  const issue = auditFindIssue(key);
  if (!issue) return;
  if (issue.actionType === 'prior-credit') {
    auditOpenPriorCreditReview(issue);
    return;
  }
  if (issue.actionType === 'placeholder' && typeof openPlaceholderSearch === 'function') {
    openPlaceholderSearch(issue.courseCode, issue.semId || '');
    return;
  }
  auditOpenIssueBrowse(key);
}

function auditOpenNextIssueBrowse() {
  const issues = auditDegreeIssues();
  if (!issues.length) return;
  auditIssueKey = issues[0].key;
  auditOpenIssuePrimary(issues[0].key);
  renderAudit();
}

function auditOpenIssueBrowse(key) {
  const issue = auditFindIssue(key);
  if (!issue) return;
  if (issue.actionType === 'prior-credit') {
    auditOpenPriorCreditReview(issue);
    return;
  }
  if (typeof browseOpenSearch !== 'function') {
    toastError('Browse is still loading. Try again in a moment.');
    return;
  }
  const config = issue.browse || { dept: '', genEd: '', search: '', label: `Audit: ${issue.title}` };
  browseOpenSearch({ ...config, save: true });
  if (typeof toastSuccess === 'function') toastSuccess(`Opened Browse for ${issue.title}.`);
}

function auditOpenPriorCreditReview(issue) {
  if (typeof openSettings !== 'function') {
    if (typeof toastError === 'function') toastError('Settings are still loading. Try again in a moment.');
    return false;
  }
  openSettings();
  const doc = typeof document !== 'undefined' ? document : null;
  const status = doc?.getElementById ? doc.getElementById('set-prior-status') : null;
  if (status) {
    status.style.color = 'var(--amber)';
    status.textContent = issue?.summary || 'Review prior-credit conflicts before treating these credits as final.';
  }
  if (typeof plannerFocusSettingsPriorCredit === 'function') {
    plannerFocusSettingsPriorCredit();
  } else {
    const section = doc?.getElementById ? doc.getElementById('settings-prior-credit-section') : null;
    if (section?.scrollIntoView) section.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
  if (typeof toastInfo === 'function') toastInfo('Opened Settings prior-credit review.');
  return true;
}
