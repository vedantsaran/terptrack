'use strict';
/* ============================================================
   SMART IMPORT + AUTO-SCHEDULE GENERATOR
   ============================================================ */

// Generate semester labels: "Fall 2026", "Spring 2027", "Fall 2027", ...
function generateSemesterLabels(startTerm, startYear, count) {
  const out = [];
  let term = startTerm; // "Fall" or "Spring"
  let year = startYear;
  for (let i = 0; i < count; i++) {
    const id = (term === 'Fall' ? 'F' : 'S') + String(year).slice(-2);
    out.push({
      id, name: `${term} ${year}`,
      year: `Year ${Math.floor(i / 2) + 1}`,
    });
    if (term === 'Fall') term = 'Spring', year = year + 1;
    else term = 'Fall';
  }
  return out;
}

function relabelScheduleTerms(schedule, startTerm = 'Fall', startYear = 2026) {
  const labels = generateSemesterLabels(startTerm, startYear, (schedule || []).length);
  return JSON.parse(JSON.stringify(schedule || [])).map((sem, index) => ({
    ...sem,
    ...(labels[index] || {}),
  }));
}

function majorEyebrowForStart(tpl, opts = {}) {
  if (!opts.startYear) return tpl.eyebrow || `UMD · ${tpl.programName || tpl.name}`;
  const count = opts.numSemesters || 8;
  const labels = generateSemesterLabels(opts.startTerm || 'Fall', opts.startYear, count);
  const lastName = labels[labels.length - 1]?.name || String(opts.startYear);
  const yearMatch = lastName.match(/\b(20\d{2})\b/);
  const endYear = yearMatch ? yearMatch[1] : String(Number(opts.startYear) + Math.floor(count / 2));
  return `UMD · ${tpl.programName || tpl.name} · ${opts.startYear}–${endYear}`;
}

const AUTO_PLAN_GENED_REQUIREMENTS = [
  { id: 'FSAW', label: 'Academic Writing', need: 1, preferred: 0 },
  { id: 'FSOC', label: 'Oral Communication', need: 1, preferred: 0 },
  { id: 'FSMA', label: 'Mathematics', need: 1, preferred: 0 },
  { id: 'FSAR', label: 'Analytic Reasoning', need: 1, preferred: 1 },
  { id: 'DSHS', label: 'History/Social Sciences', need: 2, preferred: 1 },
  { id: 'DSHU', label: 'Humanities', need: 2, preferred: 1 },
  { id: 'DSNS', label: 'Natural Sciences', need: 1, preferred: 2 },
  { id: 'DSNL', label: 'Natural Sciences with Lab', need: 1, preferred: 3, credits: 4 },
  { id: 'DSSP', label: 'Scholarship in Practice', need: 2, preferred: 4 },
  { id: 'DVUP', label: 'Understanding Plural Societies', need: 1, preferred: 4 },
  { id: 'DVCC', label: 'Cultural Competence', need: 1, preferred: 5 },
  { id: 'SCIS', label: 'I-Series Signature Course', need: 1, preferred: 2 },
  { id: 'FSPW', label: 'Professional Writing', need: 1, preferred: 4 },
];

const AUTO_PLAN_KNOWN_GENED_BY_CODE = {
  ENGL101: ['FSAW'],
  ENGL393: ['FSPW'],
  COMM107: ['FSOC'],
  COMM200: ['FSOC'],
  MATH113: ['FSMA'],
  MATH120: ['FSMA'],
  MATH130: ['FSMA'],
  MATH136: ['FSMA'],
  MATH140: ['FSMA'],
  MATH220: ['FSMA'],
  CMSC250: ['FSAR'],
  MATH240: ['FSAR'],
  STAT100: ['FSAR'],
  STAT400: ['FSAR'],
  BSCI105: ['DSNS'],
  BSCI106: ['DSNL'],
  BIOL106: ['DSNL'],
  CHEM131: ['DSNS'],
  CHEM132: ['DSNL'],
  PHYS121: ['DSNS'],
  PHYS122: ['DSNL'],
  PHYS161: ['DSNS'],
  PHYS260: ['DSNL'],
  PHYS261: ['DSNL'],
};

function autoPlanCredits(course) {
  const cr = Number(course && course.cr);
  return Number.isFinite(cr) && cr > 0 ? cr : 3;
}

function autoPlanTotalCredits(semesters) {
  return (semesters || []).reduce((sum, sem) => (
    sum + (sem.courses || []).reduce((s, c) => s + autoPlanCredits(c), 0)
  ), 0);
}

function autoPlanCourseTags(course) {
  const tags = new Set();
  if (!course) return tags;
  if (Array.isArray(course.gen_ed)) {
    course.gen_ed.flat().filter(Boolean).forEach(t => tags.add(String(t).toUpperCase()));
  }
  if (Array.isArray(course.categories)) {
    course.categories
      .filter(cat => cat && String(cat).startsWith('gened-'))
      .forEach(cat => tags.add(String(cat).replace('gened-', '').toUpperCase()));
  }
  if (course.category && String(course.category).startsWith('gened-')) {
    tags.add(String(course.category).replace('gened-', '').toUpperCase());
  }
  const known = AUTO_PLAN_KNOWN_GENED_BY_CODE[normalizeCode(course.code)] || [];
  known.forEach(tag => tags.add(tag));
  const hay = [course.code, course.title, course.note].join(' ').toUpperCase();
  AUTO_PLAN_GENED_REQUIREMENTS.forEach(req => {
    if (hay.includes(req.id)) tags.add(req.id);
  });
  return tags;
}

function autoPlanRequirementCounts(semesters) {
  const counts = {};
  AUTO_PLAN_GENED_REQUIREMENTS.forEach(req => { counts[req.id] = 0; });
  (semesters || []).forEach(sem => (sem.courses || []).forEach(course => {
    autoPlanCourseTags(course).forEach(tag => {
      if (counts[tag] !== undefined) counts[tag]++;
    });
  }));
  return counts;
}

function autoPlanPlaceholderCode(prefix, index) {
  return index > 1 ? `${prefix} #${index}` : prefix;
}

function makeAutoPlanGenEdPlaceholder(req, index) {
  const category = `gened-${req.id.toLowerCase()}`;
  const suffix = req.need > 1 ? ` #${index}` : '';
  return {
    code: autoPlanPlaceholderCode(`GenEd ${req.id}`, index),
    title: `${req.label}${suffix}`,
    cr: req.credits || 3,
    prereqs: [],
    coreqs: [],
    kind: 'gened',
    category,
    categories: [category],
    note: `Auto-generated ${req.id} placeholder. Click to search and replace with a real UMD course.`,
  };
}

function makeAutoPlanFreeElective(index, prefsOverride) {
  const prefs = prefsOverride || (typeof getProfilePrefs === 'function' ? getProfilePrefs() : null);
  const personalizedTitle = typeof profileElectiveLabel === 'function' ? profileElectiveLabel(index, prefs) : `Free Elective ${index}`;
  const personalizedNote = typeof profileElectiveNote === 'function'
    ? profileElectiveNote(index, prefs)
    : 'Auto-generated credit placeholder. Replace with a minor, certificate, interest, or open elective course.';
  return {
    code: `Free Elective #${index}`,
    title: personalizedTitle,
    cr: 3,
    prereqs: [],
    coreqs: [],
    kind: 'tech',
    category: 'elective',
    note: personalizedNote,
  };
}

function autoPlanProfileActive(prefs) {
  return !!(prefs && ((prefs.interests || []).length || prefs.careerGoal || (prefs.genEdDepts || []).length));
}

function autoPlanFreeElectivePreferredIndex(index, termCount, prefs) {
  const total = Math.max(1, Number(termCount) || 8);
  if (total <= 2) return total - 1;
  const activeProfile = autoPlanProfileActive(prefs);
  const profilePattern = [2, 3, 4, 5, 6, 7, 1];
  const neutralPattern = [1, 2, 3, 4, 5, 6, 7, 0];
  const pattern = activeProfile ? profilePattern : neutralPattern;
  const target = pattern[(Math.max(1, index) - 1) % pattern.length];
  return Math.min(total - 1, Math.max(0, target));
}

function autoPlanElectivePlacementStage(semIndex, termCount) {
  const index = Math.max(0, Number(semIndex) || 0);
  const total = Math.max(1, Number(termCount) || 8);
  if (index <= 1) return 'explore';
  if (index >= Math.max(0, total - 2)) return 'specialize';
  return 'build';
}

function autoPlanElectivePlacementSummary(semesters) {
  const rows = [];
  const totalTerms = Math.max(1, (semesters || []).length || 8);
  (semesters || []).forEach((sem, semIndex) => {
    (sem.courses || []).forEach(course => {
      if (!/^Free Elective/i.test(course.code || '')) return;
      rows.push({
        code: course.code,
        title: course.title || course.code,
        note: course.note || '',
        cr: autoPlanCredits(course),
        semIndex,
        term: sem.name || `Term ${semIndex + 1}`,
        year: sem.year || '',
        stage: autoPlanElectivePlacementStage(semIndex, totalTerms),
      });
    });
  });
  const count = stage => rows.filter(row => row.stage === stage).length;
  return {
    total: rows.length,
    credits: rows.reduce((sum, row) => sum + row.cr, 0),
    exploreCount: count('explore'),
    buildCount: count('build'),
    specializeCount: count('specialize'),
    firstTerm: rows[0]?.term || '',
    lastTerm: rows[rows.length - 1]?.term || '',
    samples: rows.slice(0, 5),
  };
}

function autoPlanHardCreditCap(creditCap) {
  return Math.max(18, creditCap || 17);
}

function placeAutoPlanCourse(semesters, course, preferredIndex, creditCap, hardCreditCap) {
  const start = Math.min(Math.max(preferredIndex || 0, 0), Math.max(semesters.length - 1, 0));
  const credits = autoPlanCredits(course);
  const hardCap = hardCreditCap || autoPlanHardCreditCap(creditCap);
  let target = -1;
  let bestLoad = Infinity;
  for (let i = start; i < semesters.length; i++) {
    if (semesters[i]._credits + credits <= creditCap && semesters[i]._credits < bestLoad) {
      target = i;
      bestLoad = semesters[i]._credits;
    }
  }
  if (target === -1) {
    for (let i = 0; i < semesters.length; i++) {
      if (semesters[i]._credits + credits <= creditCap && semesters[i]._credits < bestLoad) {
        target = i;
        bestLoad = semesters[i]._credits;
      }
    }
  }
  if (target === -1) {
    for (let i = start; i < semesters.length; i++) {
      if (semesters[i]._credits + credits <= hardCap && semesters[i]._credits < bestLoad) {
        target = i;
        bestLoad = semesters[i]._credits;
      }
    }
  }
  if (target === -1) {
    for (let i = 0; i < semesters.length; i++) {
      if (semesters[i]._credits + credits <= hardCap && semesters[i]._credits < bestLoad) {
        target = i;
        bestLoad = semesters[i]._credits;
      }
    }
  }
  if (target === -1) {
    target = semesters.reduce((best, sem, i) => sem._credits < semesters[best]._credits ? i : best, 0);
  }
  semesters[target].courses.push(course);
  semesters[target]._credits += credits;
  return target;
}

function completeAutoGeneratedPlan(semesters, opts) {
  const creditCap = opts.creditCap || 17;
  const hardCreditCap = autoPlanHardCreditCap(creditCap);
  const targetCredits = opts.targetCredits || 120;
  const profilePrefs = opts.profilePrefs || null;
  const counts = autoPlanRequirementCounts(semesters);

  AUTO_PLAN_GENED_REQUIREMENTS.forEach(req => {
    const have = counts[req.id] || 0;
    for (let i = have + 1; i <= req.need; i++) {
      const placeholder = makeAutoPlanGenEdPlaceholder(req, i);
      placeAutoPlanCourse(semesters, placeholder, req.preferred, creditCap, hardCreditCap);
      counts[req.id] = (counts[req.id] || 0) + 1;
    }
  });

  let total = autoPlanTotalCredits(semesters);
  let freeIndex = 1;
  while (total < targetCredits) {
    const preferred = autoPlanFreeElectivePreferredIndex(freeIndex, semesters.length, profilePrefs);
    const course = makeAutoPlanFreeElective(freeIndex++, profilePrefs);
    placeAutoPlanCourse(semesters, course, preferred, creditCap, hardCreditCap);
    total += autoPlanCredits(course);
  }
  return semesters;
}

function autoPlanTemplateCourseObject(item, fetchedCourse) {
  if (fetchedCourse) {
    return {
      code: fetchedCourse.code,
      title: fetchedCourse.title,
      cr: fetchedCourse.cr,
      prereqs: fetchedCourse.prereqs,
      prereqGroups: fetchedCourse.prereqGroups,
      coreqs: fetchedCourse.coreqs,
      kind: item.kind,
      category: item.category,
      categories: Array.isArray(fetchedCourse.categories) ? fetchedCourse.categories : [],
      gen_ed: fetchedCourse.gen_ed,
      avg_gpa: fetchedCourse.avg_gpa,
    };
  }
  return {
    code: typeof displayCode === 'function' ? displayCode(item.code) : item.code,
    title: item.code,
    cr: 3,
    prereqs: [],
    coreqs: [],
    kind: item.kind,
    category: item.category,
  };
}

function autoPlanObjectsFromTemplate(tplCatalog, fetched) {
  return (tplCatalog || []).map(item => {
    const norm = normalizeCode(item.code);
    return autoPlanTemplateCourseObject(item, fetched && fetched[norm]);
  });
}

function autoPlanTermLoads(semesters) {
  return (semesters || []).map((sem, index) => {
    const credits = (sem.courses || []).reduce((sum, course) => sum + autoPlanCredits(course), 0);
    return {
      index,
      id: sem.id,
      name: sem.name || `Term ${index + 1}`,
      credits,
      courseCount: (sem.courses || []).length,
      heavy: credits >= 18,
      full: credits >= 17,
    };
  });
}

function autoPlanFlatCourses(semesters) {
  const out = [];
  (semesters || []).forEach((sem, semIndex) => {
    (sem.courses || []).forEach(course => out.push({ ...course, semIndex, semName: sem.name }));
  });
  return out;
}

function autoPlanCourseNumber(courseOrCode) {
  const raw = typeof courseOrCode === 'string' ? courseOrCode : (courseOrCode && courseOrCode.code);
  const normalized = typeof normalizeCode === 'function'
    ? normalizeCode(raw || '')
    : String(raw || '').toUpperCase().replace(/\s+/g, '');
  const match = normalized.match(/^[A-Z]{2,4}(\d{3})[A-Z]?$/);
  return match ? Number(match[1]) : 0;
}

function autoPlanCourseLevelBand(courseOrCode) {
  const number = autoPlanCourseNumber(courseOrCode);
  return number ? Math.floor(number / 100) * 100 : 0;
}

function autoPlanPreferredTermIndex(course, numSemesters) {
  const terms = Math.max(1, numSemesters || 8);
  const level = autoPlanCourseLevelBand(course);
  const category = String(course && course.category || '');
  if (category === 'major-upper') return Math.min(terms - 1, Math.max(4, Math.floor(terms * 0.62)));
  if (level >= 400) return Math.min(terms - 1, Math.max(4, Math.floor(terms * 0.55)));
  if (level >= 300) return Math.min(terms - 1, Math.max(3, Math.floor(terms * 0.42)));
  if (level >= 200) return Math.min(terms - 1, Math.max(1, Math.floor(terms * 0.18)));
  return 0;
}

function autoPlanLevelProgression(semesters) {
  const terms = semesters || [];
  const termCount = Math.max(terms.length, 1);
  const earlyTermLimit = Math.min(2, termCount);
  const laterTermStart = Math.min(termCount - 1, Math.max(0, Math.floor(termCount / 2)));
  const courses = [];
  terms.forEach((sem, semIndex) => {
    (sem.courses || []).forEach(course => {
      const number = autoPlanCourseNumber(course);
      if (!number) return;
      const level = autoPlanCourseLevelBand(course);
      courses.push({
        code: typeof displayCode === 'function' ? displayCode(course.code) : String(course.code || ''),
        title: course.title || '',
        semIndex,
        semName: sem.name || `Term ${semIndex + 1}`,
        number,
        level,
        category: course.category || '',
      });
    });
  });
  const intro = courses.filter(course => course.level > 0 && course.level < 300);
  const advanced = courses.filter(course => course.level >= 300);
  const upper400 = courses.filter(course => course.level >= 400);
  const earlyIntro = intro.filter(course => course.semIndex < earlyTermLimit);
  const lateAdvanced = advanced.filter(course => course.semIndex >= laterTermStart);
  const earlyAdvanced = advanced.filter(course => course.semIndex < earlyTermLimit);
  const firstBy = list => list.reduce((best, course) => (
    !best || course.semIndex < best.semIndex ? course : best
  ), null);
  const lastBy = list => list.reduce((best, course) => (
    !best || course.semIndex > best.semIndex ? course : best
  ), null);
  const samples = list => list.slice(0, 5).map(course => course.code);
  return {
    realCount: courses.length,
    introCount: intro.length,
    advancedCount: advanced.length,
    upper400Count: upper400.length,
    earlyIntroCount: earlyIntro.length,
    lateAdvancedCount: lateAdvanced.length,
    earlyAdvancedCount: earlyAdvanced.length,
    hasEarlyIntro: earlyIntro.length > 0,
    hasLateAdvanced: lateAdvanced.length > 0,
    hasUpper400: upper400.length > 0,
    laterTermStart,
    firstIntroTerm: firstBy(intro)?.semName || '',
    firstAdvancedTerm: firstBy(advanced)?.semName || '',
    firstUpper400Term: firstBy(upper400)?.semName || '',
    lastUpper400Term: lastBy(upper400)?.semName || '',
    earlyIntroSamples: samples(earlyIntro),
    lateAdvancedSamples: samples(lateAdvanced),
    upper400Samples: samples(upper400),
  };
}

function autoPlanRequirementGroupSummary(semesters, requirementCatalog) {
  const requirements = Array.isArray(requirementCatalog) ? requirementCatalog : [];
  if (!requirements.length) return [];
  const scheduled = new Set(autoPlanFlatCourses(semesters)
    .map(course => normalizeCode(course.code))
    .filter(Boolean));
  const groupDefs = [
    { id: 'major-core', label: 'Core Requirements' },
    { id: 'major-support', label: 'Supporting Courses' },
    { id: 'major-upper', label: 'Upper-Level Choices' },
  ];
  const byGroup = {};
  groupDefs.forEach(def => {
    byGroup[def.id] = {
      ...def,
      total: 0,
      scheduled: 0,
      sampleCodes: [],
      missingCodes: [],
    };
  });
  byGroup.other = {
    id: 'other',
    label: 'Other Requirements',
    total: 0,
    scheduled: 0,
    sampleCodes: [],
    missingCodes: [],
  };
  requirements.forEach(item => {
    const category = byGroup[item.category] ? item.category : 'other';
    const group = byGroup[category];
    const code = normalizeCode(item.code);
    const display = typeof displayCode === 'function' ? displayCode(item.code) : String(item.code || '');
    const isScheduled = scheduled.has(code);
    group.total += 1;
    if (isScheduled) group.scheduled += 1;
    if (isScheduled && group.sampleCodes.length < 6) group.sampleCodes.push(display);
    if (!isScheduled && group.missingCodes.length < 6) group.missingCodes.push(display);
  });
  return [...groupDefs.map(def => byGroup[def.id]), byGroup.other]
    .filter(group => group.total > 0)
    .map(group => ({
      ...group,
      complete: group.scheduled >= group.total,
    }));
}

function autoPlanAnalyzeSchedule(semesters, opts = {}) {
  const targetCredits = opts.targetCredits || 120;
  const prefs = opts.profilePrefs || null;
  const courses = autoPlanFlatCourses(semesters);
  const termLoads = autoPlanTermLoads(semesters);
  const levelProgression = autoPlanLevelProgression(semesters);
  const electivePlacement = autoPlanElectivePlacementSummary(semesters);
  const requirementGroupSummary = autoPlanRequirementGroupSummary(semesters, opts.requirementCatalog || []);
  const genEdCounts = autoPlanRequirementCounts(semesters);
  const genEdSummary = AUTO_PLAN_GENED_REQUIREMENTS.map(req => {
    const have = genEdCounts[req.id] || 0;
    return {
      id: req.id,
      label: req.label,
      need: req.need,
      have,
      complete: have >= req.need,
    };
  });
  const genEdPlaceholders = courses.filter(course => /^GenEd\s/i.test(course.code || ''));
  const freeElectives = courses.filter(course => /^Free Elective/i.test(course.code || ''));
  const placeholderCourses = [...genEdPlaceholders, ...freeElectives];
  const selectedInterests = typeof profileSelectedInterestDefs === 'function'
    ? profileSelectedInterestDefs(prefs || undefined).map(def => def.label)
    : [];
  const preferredDepartments = typeof profilePreferredDepartments === 'function'
    ? profilePreferredDepartments(prefs || undefined)
    : [];
  const activeProfile = !!(prefs && ((prefs.interests || []).length || prefs.careerGoal || (prefs.genEdDepts || []).length));
  return {
    semesters,
    termLoads,
    levelProgression,
    electivePlacement,
    requirementGroupSummary,
    totalCredits: autoPlanTotalCredits(semesters),
    targetCredits,
    courseCount: courses.length,
    requirementCourseCount: opts.requirementCourseCount || 0,
    genEdSummary,
    genEdCompleteCount: genEdSummary.filter(req => req.complete).length,
    genEdRequirementCount: genEdSummary.length,
    genEdPlaceholders: genEdPlaceholders.length,
    freeElectives: freeElectives.length,
    freeElectiveSamples: freeElectives.slice(0, 3).map(course => ({
      code: course.code,
      title: course.title,
      note: course.note,
    })),
    placeholderSamples: placeholderCourses.slice(0, 5).map(course => ({
      code: course.code,
      title: course.title,
      cr: autoPlanCredits(course),
      note: course.note,
    })),
    placeholderCredits: placeholderCourses.reduce((sum, course) => sum + autoPlanCredits(course), 0),
    heavyTerms: termLoads.filter(term => term.heavy),
    fullTerms: termLoads.filter(term => term.full),
    profile: {
      active: activeProfile,
      interests: selectedInterests,
      careerGoal: prefs && prefs.careerGoal || '',
      preferredDepartments,
    },
  };
}

const AUTO_PLAN_PREVIEW_CACHE = {};

async function buildAutoPlanPreview(majorId, opts = {}) {
  const tpl = getMajorTemplate(majorId);
  if (!tpl) return null;
  const profilePrefs = opts.profilePrefs
    ? normalizeProfilePrefs(opts.profilePrefs)
    : (typeof getProfilePrefs === 'function' ? getProfilePrefs() : defaultProfilePrefs());
  const catalogYear = typeof normalizeCatalogYear === 'function'
    ? normalizeCatalogYear(opts.catalogYear || (typeof getSettings === 'function' ? getSettings().catalogYear : ''))
    : (opts.catalogYear || '');
  const targetCredits = tpl.totalCredits || 120;
  const cacheKey = JSON.stringify({
    majorId,
    targetCredits,
    catalogYear,
    startTerm: opts.startTerm || 'Fall',
    startYear: opts.startYear || 2026,
    creditCap: opts.creditCap || 17,
    profilePrefs,
    noFetch: !!opts.noFetch,
  });
  if (!opts.force && AUTO_PLAN_PREVIEW_CACHE[cacheKey]) return AUTO_PLAN_PREVIEW_CACHE[cacheKey];

  const previewPromise = (async () => {
    const base = {
      majorId,
      majorName: tpl.name,
      programName: tpl.programName || tpl.name,
      targetCredits,
      catalogYear,
      notes: tpl.notes || '',
      officialSources: typeof majorOfficialSources === 'function'
        ? majorOfficialSources(tpl, { includeGeneral: false, catalogYear })
        : [],
    };
    const curatedSchedule = tpl.useDefaultSchedule && typeof SCHEDULE !== 'undefined'
      ? SCHEDULE
      : (Array.isArray(tpl.fixedSchedule) && tpl.fixedSchedule.length ? tpl.fixedSchedule : null);
    if (isMajorFullyBaked(tpl)) {
      const previewSchedule = curatedSchedule && (opts.startYear || opts.startTerm)
        ? relabelScheduleTerms(curatedSchedule, opts.startTerm || 'Fall', opts.startYear || 2026)
        : curatedSchedule;
      const analysis = previewSchedule
        ? autoPlanAnalyzeSchedule(previewSchedule, { targetCredits, profilePrefs, requirementCourseCount: 0, requirementCatalog: [] })
        : {};
      return {
        ...base,
        ...analysis,
        kind: 'curated',
        metadataMode: 'curated',
        metadataCoverage: null,
      };
    }

    const tplCatalog = majorAllCodes(tpl);
    const codes = tplCatalog.map(item => item.code);
    let fetched = {};
    let fetchedCount = 0;
    if (!opts.noFetch && typeof fetchCoursesBatch === 'function') {
      try {
        fetched = await fetchCoursesBatch(codes, opts.onProgress);
        fetchedCount = Object.values(fetched).filter(Boolean).length;
      } catch (e) {
        fetched = {};
        fetchedCount = 0;
      }
    }

    const courseObjs = autoPlanObjectsFromTemplate(tplCatalog, fetched);
    const schedule = autoSchedule(courseObjs, {
      numSemesters: opts.numSemesters || 8,
      creditCap: opts.creditCap || 17,
      targetCredits,
      startTerm: opts.startTerm || 'Fall',
      startYear: opts.startYear || 2026,
      profilePrefs,
    });
    const analysis = autoPlanAnalyzeSchedule(schedule, {
      targetCredits,
      profilePrefs,
      requirementCourseCount: tplCatalog.length,
      requirementCatalog: tplCatalog,
    });
    const liveCodes = tplCatalog
      .filter(item => fetched && fetched[normalizeCode(item.code)])
      .map(item => displayCode(item.code));
    const missingCodes = tplCatalog
      .filter(item => !(fetched && fetched[normalizeCode(item.code)]))
      .map(item => displayCode(item.code));
    return {
      ...base,
      ...analysis,
      kind: 'generated',
      metadataMode: fetchedCount ? 'live' : 'template',
      metadataCoverage: {
        found: fetchedCount,
        total: codes.length,
        missing: Math.max(0, codes.length - fetchedCount),
        coveragePct: codes.length ? Math.round((fetchedCount / codes.length) * 100) : 100,
        liveCodes: liveCodes.slice(0, 10),
        missingCodes: missingCodes.slice(0, 14),
      },
    };
  })();
  AUTO_PLAN_PREVIEW_CACHE[cacheKey] = previewPromise;
  return previewPromise;
}

// Topo-distribute courses into N semesters with a credit cap.
// Input: array of course objects with .code, .cr, .prereqs (codes already display-formatted)
// Returns: array of { id, name, year, courses: [...] }
function autoSchedule(courses, opts) {
  opts = opts || {};
  const numSemesters = opts.numSemesters || 8;
  const creditCap    = opts.creditCap    || 17;
  const startTerm    = opts.startTerm    || 'Fall';
  const startYear    = opts.startYear    || 2026;
  const targetCredits = opts.targetCredits || 120;

  const labels = generateSemesterLabels(startTerm, startYear, numSemesters);
  const codeSet = new Set(courses.map(c => normalizeCode(c.code)));

  // Build prereq map (only counting prereqs that are also in the input set)
  const prereqMap = {};
  courses.forEach(c => {
    const norm = normalizeCode(c.code);
    prereqMap[norm] = (c.prereqs || [])
      .map(normalizeCode)
      .filter(p => codeSet.has(p) && p !== norm);
  });

  // Compute depth (longest prereq chain) for each course
  const depth = {};
  function computeDepth(code, visiting) {
    if (depth[code] !== undefined) return depth[code];
    if (visiting.has(code)) return 0; // cycle guard
    visiting.add(code);
    const preds = prereqMap[code] || [];
    let d = 0;
    preds.forEach(p => { d = Math.max(d, 1 + computeDepth(p, visiting)); });
    visiting.delete(code);
    depth[code] = d;
    return d;
  }
  courses.forEach(c => computeDepth(normalizeCode(c.code), new Set()));

  // Sort courses by depth ascending, then by code
  const sorted = [...courses].sort((a, b) => {
    const da = depth[normalizeCode(a.code)] || 0;
    const db = depth[normalizeCode(b.code)] || 0;
    if (da !== db) return da - db;
    const pa = autoPlanPreferredTermIndex(a, numSemesters);
    const pb = autoPlanPreferredTermIndex(b, numSemesters);
    if (pa !== pb) return pa - pb;
    return a.code.localeCompare(b.code);
  });

  // Greedy place: walk semesters, place a course if all its prereqs are in
  // earlier semesters AND the credit cap isn't exceeded.
  const placed = {};   // code -> semester index
  const semesters = labels.map(l => ({ ...l, courses: [], _credits: 0 }));
  const unplaced = [];

  for (const c of sorted) {
    const norm = normalizeCode(c.code);
    const preds = prereqMap[norm] || [];
    const earliest = preds.reduce((max, p) => {
      const idx = placed[p];
      return idx === undefined ? max : Math.max(max, idx + 1);
    }, 0);
    const preferred = Math.max(earliest, autoPlanPreferredTermIndex(c, numSemesters));
    let target = -1;
    for (let i = preferred; i < numSemesters; i++) {
      if (semesters[i]._credits + autoPlanCredits(c) <= creditCap) { target = i; break; }
    }
    if (target === -1 && preferred > earliest) {
      for (let i = earliest; i < preferred; i++) {
        if (semesters[i]._credits + autoPlanCredits(c) <= creditCap) { target = i; break; }
      }
    }
    if (target === -1) { unplaced.push(c); continue; }
    semesters[target].courses.push({
      ...c,
      prereqs: c.prereqs || [],
      coreqs: c.coreqs || [],
    });
    semesters[target]._credits += autoPlanCredits(c);
    placed[norm] = target;
  }

  // Append unplaced as overflow in last semester (rare)
  if (unplaced.length) {
    semesters[numSemesters - 1].courses.push(...unplaced);
    semesters[numSemesters - 1]._credits += unplaced.reduce((sum, c) => sum + autoPlanCredits(c), 0);
  }

  completeAutoGeneratedPlan(semesters, { creditCap, targetCredits, profilePrefs: opts.profilePrefs || null });

  return semesters.map(s => {
    const { _credits, ...rest } = s;
    return rest;
  });
}

/* ----------------------------------------------------------
   Apply a major template — fetches metadata, builds schedule,
   replaces state.activeSchedule.
   ---------------------------------------------------------- */
async function applyMajorTemplate(majorId, opts) {
  opts = opts || {};
  const tpl = getMajorTemplate(majorId);
  if (!tpl) throw new Error('Unknown major: ' + majorId);
  if (tpl.useDefaultSchedule) {
    const shouldRelabel = opts.startYear || opts.startTerm;
    if (shouldRelabel) {
      state.activeSchedule = relabelScheduleTerms(SCHEDULE, opts.startTerm || 'Fall', opts.startYear || 2026);
    } else {
      state.activeSchedule = null;
    }
    state.selectedSections = {};
    state.schedulePrefs = {};
    state.majorId = majorId;
    state.settings = normalizeSettings({ ...state.settings,
      programName: tpl.programName, eyebrow: majorEyebrowForStart(tpl, opts),
      totalCredits: tpl.totalCredits, goalCourses: tpl.goals || state.settings.goalCourses,
      catalogYear: opts.catalogYear || state.settings.catalogYear,
    });
    saveState(); applySettings(); render();
    return { ok: true, schedule: state.activeSchedule || SCHEDULE };
  }

  // Templates with a hand-curated 4-year layout skip auto-gen.
  // Course metadata (gpa, gen-eds) refines via the background prefetch.
  if (Array.isArray(tpl.fixedSchedule) && tpl.fixedSchedule.length) {
    const cloned = JSON.parse(JSON.stringify(tpl.fixedSchedule));
    // Uniquify duplicate placeholder codes (e.g. "Free Elective" appears
    // 5x in a schedule). Without this, marking one passed marks them all
    // because state.courses is keyed by code.
    const seen = {};
    const goalsFromSchedule = [];
    cloned.forEach(sem => (sem.courses || []).forEach(c => {
      if (seen[c.code]) {
        seen[c.code]++;
        c.code = `${c.code} #${seen[c.code]}`;
      } else {
        seen[c.code] = 1;
      }
      if (c.isGoal) goalsFromSchedule.push(c.code);
    }));
    state.activeSchedule = cloned;
    state.selectedSections = {};
    state.schedulePrefs = {};
    state.majorId = majorId;
    // Union template goals with isGoal-flagged rows in the schedule
    const goalSet = new Set([...(tpl.goals || []), ...goalsFromSchedule]);
    state.settings = normalizeSettings({ ...state.settings,
      programName: tpl.programName, eyebrow: majorEyebrowForStart(tpl, opts),
      totalCredits: tpl.totalCredits, goalCourses: Array.from(goalSet),
      catalogYear: opts.catalogYear || state.settings.catalogYear,
    });
    saveState();
    applySettings();
    render();
    return { ok: true, schedule: state.activeSchedule };
  }

  const codes = majorAllCodes(tpl).map(c => c.code);
  // Try multiple status elements so callers (Smart Import, settings, onboarding)
  // all get visible feedback. opts.statusId can override.
  const statusIds = [opts.statusId, 'import-status', 'set-major-status', 'ob-finish-status'].filter(Boolean);
  const statusEls = statusIds.map(id => document.getElementById(id)).filter(Boolean);
  const setStatus = (text, color) => statusEls.forEach(el => {
    el.textContent = text;
    if (color) el.style.color = color;
  });
  setStatus(`Fetching ${codes.length} courses…`, 'var(--slate)');

  const fetched = await fetchCoursesBatch(codes, (done, total) => {
    setStatus(`Fetching ${done}/${total}…`);
  });

  // Build course objects, falling back to template-only data on miss
  const tplCatalog = majorAllCodes(tpl);
  const courseObjs = autoPlanObjectsFromTemplate(tplCatalog, fetched);

  const schedule = autoSchedule(courseObjs, {
    numSemesters: opts.numSemesters || 8,
    creditCap:    opts.creditCap    || 17,
    targetCredits: tpl.totalCredits || 120,
    startTerm:    opts.startTerm    || 'Fall',
    startYear:    opts.startYear    || 2026,
    profilePrefs: typeof getProfilePrefs === 'function' ? getProfilePrefs() : null,
  });

  state.activeSchedule = schedule;
  state.selectedSections = {};
  state.schedulePrefs = {};
  state.majorId = majorId;
  state.settings = normalizeSettings({ ...state.settings,
    programName: tpl.programName, eyebrow: majorEyebrowForStart(tpl, opts),
    totalCredits: tpl.totalCredits, goalCourses: tpl.goals || [],
    catalogYear: opts.catalogYear || state.settings.catalogYear,
  });
  saveState();
  applySettings();
  render();
  setStatus(`Applied ${tpl.name} (${courseObjs.length} requirements; ${autoPlanTotalCredits(schedule)} planned credits across ${schedule.length} semesters).`, 'var(--green)');
  return { ok: true, schedule };
}

/* ----------------------------------------------------------
   Smart Import modal — paste codes, recursively pull prereqs,
   add to active schedule (auto-distributed).
   ---------------------------------------------------------- */
function openImportCourses() {
  document.getElementById('import-codes').value = '';
  const status = document.getElementById('import-status');
  if (status) status.textContent = '';
  const preview = document.getElementById('import-preview');
  if (preview) preview.innerHTML = '';
  document.getElementById('import-recurse').checked = true;
  document.getElementById('import-modal').classList.add('open');
  setTimeout(() => document.getElementById('import-codes').focus(), 50);
}
function closeImportCourses() {
  document.getElementById('import-modal').classList.remove('open');
}

async function previewImport() {
  const raw = document.getElementById('import-codes').value;
  const recurse = document.getElementById('import-recurse').checked;
  const status = document.getElementById('import-status');
  const preview = document.getElementById('import-preview');
  preview.innerHTML = '';
  const initial = raw.split(/[\s,;\n]+/).map(s => s.trim()).filter(Boolean);
  if (!initial.length) { status.textContent = 'Paste some course codes first.'; status.style.color = 'var(--red)'; return; }

  status.style.color = 'var(--slate)';
  status.textContent = `Fetching ${initial.length} course(s)…`;

  const visited = new Set();
  const queue = initial.map(normalizeCode);
  const results = [];
  const maxDepth = recurse ? 3 : 1;
  let depth = 0;
  while (queue.length && depth < maxDepth) {
    const layer = queue.splice(0, queue.length);
    const fetched = await fetchCoursesBatch(layer.filter(c => !visited.has(c)), (d, t) => {
      status.textContent = `Layer ${depth + 1}: fetched ${d}/${t}…`;
    });
    layer.forEach(c => visited.add(c));
    for (const code of Object.keys(fetched)) {
      const f = fetched[code];
      if (!f) continue;
      results.push(f);
      if (recurse) {
        f.prereqs.forEach(p => { const n = normalizeCode(p); if (!visited.has(n)) queue.push(n); });
      }
    }
    depth++;
  }

  // De-dup
  const uniq = {};
  results.forEach(r => { uniq[normalizeCode(r.code)] = r; });
  const list = Object.values(uniq);
  window._importPreviewList = list;

  status.style.color = 'var(--green)';
  status.textContent = `Ready to import ${list.length} course(s).`;

  preview.innerHTML = list.map(c => `
    <div class="import-row">
      <strong>${c.code}</strong>
      <span>${c.title}</span>
      <span class="muted">${c.cr} cr${c.avg_gpa ? ` · GPA ${c.avg_gpa.toFixed(2)}` : ''}</span>
      ${c.prereqs.length ? `<span class="muted">prereqs: ${c.prereqs.join(', ')}</span>` : ''}
    </div>
  `).join('');
}

function commitImport() {
  const list = window._importPreviewList || [];
  if (!list.length) { toastInfo('Click Preview first.'); return; }

  // Ensure an active schedule exists (lazily copies SCHEDULE the first time)
  const semesters = mutableSchedule();

  // Dedup against existing courses
  const existingCodes = new Set();
  semesters.forEach(s => (s.courses || []).forEach(c => existingCodes.add(normalizeCode(c.code))));
  (state.customCourses || []).forEach(c => existingCodes.add(normalizeCode(c.code)));
  const toAdd = list.filter(c => !existingCodes.has(normalizeCode(c.code)));

  // Greedy slot: place each into the first semester whose credit total + course doesn't blow past 18.
  const cap = 18;
  for (const c of toAdd) {
    let target = -1;
    for (let i = 0; i < semesters.length; i++) {
      const cur = (semesters[i].courses || []).reduce((a, x) => a + (x.cr || 0), 0);
      if (cur + c.cr <= cap) { target = i; break; }
    }
    if (target === -1) target = semesters.length - 1;
    semesters[target].courses.push({
      code: c.code, title: c.title, cr: c.cr,
      prereqs: c.prereqs, prereqGroups: c.prereqGroups, coreqs: c.coreqs,
      kind: c.kind, category: c.category,
    });
  }

  saveState();
  applySettings();
  render();
  closeImportCourses();
}
