#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildContext() {
  const storage = new Map();
  const context = {
    console,
    setTimeout,
    clearTimeout,
    localStorage: {
      getItem: key => storage.has(key) ? storage.get(key) : null,
      setItem: (key, value) => storage.set(key, String(value)),
      removeItem: key => storage.delete(key),
    },
    document: {
      getElementById: id => (id === 'save-indicator' ? {
        classList: { add() {}, remove() {} },
      } : null),
      addEventListener() {},
    },
    confirm: () => true,
    applyTheme() {},
    applySettings() {},
    render() {},
    toastError(message) { throw new Error(message); },
    toastSuccess() {},
    window: {},
  };
  vm.createContext(context);
  [
    'js/data.js',
    'js/major-schedules.js',
    'js/majors.js',
    'js/state.js',
    'js/planetterp.js',
    'js/api.js',
    'js/import.js',
    'js/settings.js',
    'js/share.js',
    'js/snapshots.js',
    'js/account.js',
    'js/schedule.js',
    'js/courses.js',
    'js/timeline.js',
    'js/browse.js',
    'js/gened.js',
    'js/recommendations.js',
    'js/prereq-resolver.js',
    'js/placeholder-search.js',
    'js/audit.js',
    'js/onboarding.js',
    'js/dnd.js',
    'js/bulk.js',
  ].forEach(file => vm.runInContext(read(file), context, { filename: file }));
  vm.runInContext(`
    state = loadState();
    state.profilePrefs = normalizeProfilePrefs({
      interests: ['ai-data', 'policy-society'],
      careerGoal: 'machine learning for public policy',
      genEdDepts: 'INST, PSYC, GVPT'
    });
  `, context);
  return context;
}

function flatCourses(semesters) {
  const out = [];
  (semesters || []).forEach((sem, semIndex) => {
    (sem.courses || []).forEach(course => out.push({ ...course, semIndex, semName: sem.name }));
  });
  return out;
}

function assertNoDuplicateCodes(courses, majorId) {
  const seen = new Set();
  courses.forEach(course => {
    const key = String(course.code || '').trim();
    assert(key, `${majorId}: generated course without a code`);
    assert(!seen.has(key), `${majorId}: duplicate generated course code ${key}`);
    seen.add(key);
  });
}

function assertProfileElectives(courses, review, majorId) {
  const electives = courses.filter(course => /^Free Elective/i.test(course.code || ''));
  if (!electives.length) return;
  assert(
    electives.some(course => /^AI \+ data Elective/.test(course.title || '')),
    `${majorId}: expected at least one profile-labeled free elective`,
  );
  assert(
    electives.some(course => /INST|PSYC|GVPT|machine learning for public policy/i.test(course.note || '')),
    `${majorId}: expected profile department or career-goal hints in free elective notes`,
  );
  assert(review.electivePlacement?.total === electives.length, `${majorId}: elective placement summary should count free electives`);
  assert(
    (review.electivePlacement.buildCount || 0) + (review.electivePlacement.specializeCount || 0) > 0,
    `${majorId}: expected at least one profile elective outside first-year exploration terms`,
  );
  if (electives.length >= 3) {
    assert(review.electivePlacement.specializeCount > 0, `${majorId}: expected larger elective sets to include senior-year placement`);
  }
}

async function buildPreview(context, majorId) {
  return clone(await vm.runInContext(
    `buildAutoPlanPreview(${JSON.stringify(majorId)}, { noFetch: true, profilePrefs: getProfilePrefs() })`,
    context,
  ));
}

async function testMajorFixture(context, fixture) {
  const review = await buildPreview(context, fixture.id);
  const courses = flatCourses(review.semesters);
  const maxCredits = Math.max(...review.termLoads.map(term => term.credits));
  const overTarget = review.totalCredits - review.targetCredits;

  assert(review.kind === 'generated', `${fixture.id}: expected generated preview, saw ${review.kind}`);
  assert(review.termLoads.length === 8, `${fixture.id}: expected 8 terms, saw ${review.termLoads.length}`);
  assert(review.totalCredits >= review.targetCredits, `${fixture.id}: ${review.totalCredits}/${review.targetCredits} credits`);
  assert(overTarget <= 4, `${fixture.id}: generated ${overTarget} credits over target`);
  assert(maxCredits <= 18, `${fixture.id}: term load exceeds 18 credits (${maxCredits})`);
  assert(review.genEdSummary.every(req => req.complete), `${fixture.id}: incomplete GenEd coverage`);
  assert(review.metadataCoverage.found === 0, `${fixture.id}: noFetch preview should not report live metadata`);
  assert(review.metadataCoverage.total === review.requirementCourseCount, `${fixture.id}: metadata coverage should match requirement count`);
  assert(review.requirementCourseCount >= fixture.minRequirementCourses, `${fixture.id}: expected at least ${fixture.minRequirementCourses} requirements`);
  assert((review.requirementGroupSummary || []).length >= 2, `${fixture.id}: expected requirement group summary`);
  assert(
    review.requirementGroupSummary.every(group => group.complete),
    `${fixture.id}: incomplete requirement groups ${review.requirementGroupSummary.filter(group => !group.complete).map(group => group.label).join(', ')}`,
  );
  assert(
    review.requirementGroupSummary.reduce((sum, group) => sum + group.total, 0) === review.requirementCourseCount,
    `${fixture.id}: requirement groups should sum to requirement count`,
  );
  assert(review.levelProgression?.hasEarlyIntro, `${fixture.id}: expected early 100/200-level real requirements`);
  assert(review.levelProgression?.hasLateAdvanced, `${fixture.id}: expected later 300/400-level real requirements`);
  assert(review.levelProgression?.hasUpper400, `${fixture.id}: expected 400-level senior options`);
  assert(review.genEdPlaceholders >= fixture.minGenEdPlaceholders, `${fixture.id}: expected at least ${fixture.minGenEdPlaceholders} GenEd placeholders`);
  assert(review.freeElectives >= fixture.minFreeElectives, `${fixture.id}: expected at least ${fixture.minFreeElectives} free electives`);
  assertNoDuplicateCodes(courses, fixture.id);
  assertProfileElectives(courses, review, fixture.id);

  return {
    id: fixture.id,
    category: fixture.category,
    credits: `${review.totalCredits}/${review.targetCredits}`,
    loads: review.termLoads.map(term => term.credits).join(','),
    genEd: `${review.genEdCompleteCount}/${review.genEdRequirementCount}`,
    genEdPlaceholders: review.genEdPlaceholders,
    freeElectives: review.freeElectives,
    requirements: review.requirementCourseCount,
    requirementGroups: review.requirementGroupSummary.map(group => `${group.label}:${group.scheduled}/${group.total}`).join(' | '),
    levels: `${review.levelProgression.earlyIntroCount} early lower/${review.levelProgression.lateAdvancedCount} later upper/${review.levelProgression.upper400Count} 400-level`,
    electives: review.electivePlacement ? `${review.electivePlacement.exploreCount}/${review.electivePlacement.buildCount}/${review.electivePlacement.specializeCount}` : '',
  };
}

function findCourseTerm(semesters, code) {
  const normalized = String(code || '').toUpperCase().replace(/\s+/g, '');
  for (let semIndex = 0; semIndex < semesters.length; semIndex++) {
    const found = (semesters[semIndex].courses || []).find(course => (
      String(course.code || '').toUpperCase().replace(/\s+/g, '') === normalized
    ));
    if (found) return semIndex;
  }
  return -1;
}

function testSyntheticPrerequisites(context) {
  const schedule = clone(vm.runInContext(`
    autoSchedule([
      { code: 'CMSC 131', title: 'Object-Oriented Programming I', cr: 3, prereqs: [], coreqs: [], kind: 'core', category: 'major-core' },
      { code: 'CMSC 132', title: 'Object-Oriented Programming II', cr: 3, prereqs: ['CMSC 131'], coreqs: [], kind: 'core', category: 'major-core' },
      { code: 'CMSC 216', title: 'Introduction to Computer Systems', cr: 3, prereqs: ['CMSC 132'], coreqs: [], kind: 'core', category: 'major-core' },
      { code: 'CMSC 330', title: 'Organization of Programming Languages', cr: 3, prereqs: ['CMSC 216'], coreqs: [], kind: 'core', category: 'major-core' }
    ], {
      numSemesters: 8,
      creditCap: 17,
      targetCredits: 60,
      profilePrefs: getProfilePrefs()
    })
  `, context));
  const cmsc131 = findCourseTerm(schedule, 'CMSC 131');
  const cmsc132 = findCourseTerm(schedule, 'CMSC 132');
  const cmsc216 = findCourseTerm(schedule, 'CMSC 216');
  const cmsc330 = findCourseTerm(schedule, 'CMSC 330');
  [cmsc131, cmsc132, cmsc216, cmsc330].forEach((term, index) => {
    assert(term >= 0, `synthetic prereq fixture: missing course at chain index ${index}`);
  });
  assert(cmsc131 < cmsc132, 'synthetic prereq fixture: CMSC 131 should precede CMSC 132');
  assert(cmsc132 < cmsc216, 'synthetic prereq fixture: CMSC 132 should precede CMSC 216');
  assert(cmsc216 < cmsc330, 'synthetic prereq fixture: CMSC 216 should precede CMSC 330');
  const loads = clone(vm.runInContext(`autoPlanTermLoads(${JSON.stringify(schedule)})`, context));
  assert(Math.max(...loads.map(term => term.credits)) <= 18, 'synthetic prereq fixture: term load exceeds 18 credits');
  return {
    id: 'SYNTH-PREREQ',
    category: 'prerequisite chain',
    terms: [cmsc131, cmsc132, cmsc216, cmsc330].join(' -> '),
    loads: loads.map(term => term.credits).join(','),
  };
}

function testPrereqResolverNormalizedState(context) {
  const result = clone(vm.runInContext(`
    (() => {
      const previousState = JSON.parse(JSON.stringify(state));
      try {
        state.activeSchedule = [{
          id: 'F26',
          name: 'Fall 2026',
          courses: [
            { code: 'ENGL101', title: 'Academic Writing', cr: 3, prereqs: [], coreqs: [] }
          ]
        }];
        state.customCourses = [];
        state.customSemesters = [];
        state.courses = {
          CMSC131: { status: 'passed', grade: 'A' },
          MATH140: { status: 'transfer', grade: '' }
        };
        return {
          displayPassed: _alreadyHave('CMSC 131'),
          compactPassed: _alreadyHave('CMSC131'),
          displayTransfer: _alreadyHave('MATH 140'),
          compactTransfer: _alreadyHave('MATH140'),
          plannedNoState: _alreadyHave('ENGL 101'),
          missing: _alreadyHave('CMSC 132'),
        };
      } finally {
        state = previousState;
      }
    })()
  `, context));

  assert(result.displayPassed && result.compactPassed, 'prereq resolver: no-space passed state should satisfy display and compact course checks');
  assert(result.displayTransfer && result.compactTransfer, 'prereq resolver: no-space transfer state should satisfy display and compact course checks');
  assert(result.plannedNoState, 'prereq resolver: planned no-space course rows should still count as already in plan');
  assert(!result.missing, 'prereq resolver: missing courses should not count as already complete');

  return {
    id: 'PREREQ-RESOLVER-STATE',
    completed: `${Number(result.displayPassed)}/${Number(result.displayTransfer)}`,
    planned: Number(result.plannedNoState),
    missing: Number(result.missing),
  };
}

function testBulkCourseStateNormalization(context) {
  const result = clone(vm.runInContext(`
    (() => {
      const previousState = JSON.parse(JSON.stringify(state));
      try {
        state.activeSchedule = [{
          id: 'BULK-STATE',
          name: 'Fall 2026',
          courses: [
            { code: 'MATH 140', title: 'Calculus I', cr: 4 },
            { code: 'CMSC 131', title: 'Object-Oriented Programming I', cr: 4 }
          ]
        }];
        state.customSemesters = [];
        state.customCourses = [];
        state.courses = {
          MATH140: { status: 'passed', grade: 'A' },
          CMSC131: { status: 'passed', grade: 'B' }
        };

        bulkApply(['MATH 140', 'CMSC 131'], 'transfer');
        const afterTransfer = {
          mathCompact: state.courses.MATH140 || null,
          mathDisplay: state.courses['MATH 140'] || null,
          cmscCompact: state.courses.CMSC131 || null,
          cmscDisplay: state.courses['CMSC 131'] || null,
          mathVisible: getCourseState('MATH 140'),
          cmscVisible: getCourseState('CMSC 131')
        };

        bulkApply(['MATH 140'], 'reset');
        const afterMathReset = {
          mathCompact: state.courses.MATH140 || null,
          mathDisplay: state.courses['MATH 140'] || null,
          mathVisible: getCourseState('MATH 140'),
          cmscVisible: getCourseState('CMSC 131')
        };

        bulkApply(['CMSC 131'], 'in-progress');
        const afterCmscProgress = {
          cmscCompact: state.courses.CMSC131 || null,
          cmscDisplay: state.courses['CMSC 131'] || null,
          cmscVisible: getCourseState('CMSC 131')
        };

        return { afterTransfer, afterMathReset, afterCmscProgress };
      } finally {
        state = previousState;
      }
    })()
  `, context));

  assert(result.afterTransfer.mathCompact.status === 'transfer', 'bulk state: spaced MATH 140 should update existing no-space state key');
  assert(result.afterTransfer.cmscCompact.status === 'transfer', 'bulk state: spaced CMSC 131 should update existing no-space state key');
  assert(!result.afterTransfer.mathDisplay && !result.afterTransfer.cmscDisplay, 'bulk state: mark should not create display-key duplicates');
  assert(result.afterTransfer.mathVisible.status === 'transfer' && result.afterTransfer.cmscVisible.status === 'transfer', 'bulk state: visible statuses should reflect normalized transfer marks');
  assert(!result.afterMathReset.mathCompact && !result.afterMathReset.mathDisplay, 'bulk state: reset should remove the normalized state key without leaving a duplicate');
  assert(result.afterMathReset.mathVisible.status === 'not-started', 'bulk state: reset should clear visible normalized status');
  assert(result.afterMathReset.cmscVisible.status === 'transfer', 'bulk state: resetting one course should preserve sibling bulk status');
  assert(result.afterCmscProgress.cmscCompact.status === 'in-progress', 'bulk state: later marks should keep using the normalized existing key');
  assert(!result.afterCmscProgress.cmscDisplay, 'bulk state: later marks should not create a display-key duplicate');

  return {
    id: 'BULK-STATE-NORMALIZED',
    transfer: `${result.afterTransfer.mathVisible.status}/${result.afterTransfer.cmscVisible.status}`,
    reset: result.afterMathReset.mathVisible.status,
    progress: result.afterCmscProgress.cmscVisible.status,
  };
}

function testAccountAndShareState(context) {
  const result = clone(vm.runInContext(`
    const prefs = normalizeAccountPrefs({
      planName: '  Friends plan  ',
      displayName: ' Test Student ',
      friendInviteEmail: 'Friend@UMD.edu ',
      friendInviteNote: ' compare schedules ',
      friendInvites: [
        { email: 'Pal@umd.edu', userId: 'user-pal-1', note: 'bioe track', status: 'accepted', direction: 'received', source: 'cloud', id: 'abc', cloudId: 'abc' },
        { email: 'not-an-email', note: 'bad' }
      ],
      lastFriendSyncAt: '2026-06-30T10:00:00.000Z'
    });
    state = {
      ...state,
      courses: { 'CMSC 131': { status: 'passed' } },
      customCourses: [],
      customSemesters: [],
      activeSchedule: [{
        id: 'F26',
        name: 'Fall 2026',
        courses: [
          { code: 'MATH 140', title: 'Calculus I', cr: 4 },
          { code: 'CMSC 131', title: 'Object-Oriented Programming I', cr: 4 }
        ]
      }],
      selectedSections: {
        F26: {
          MATH140: {
            course: 'MATH 140',
            section_id: 'MATH140-0101',
            number: '0101',
            semester: '202608',
            meetings: [{ days: 'M', start_time: '10:00am', end_time: '10:50am', building: 'IRB', room: '1101' }]
          }
        }
      },
      schedulePrefs: {},
      browseSavedSearches: [],
      profilePrefs: defaultProfilePrefs(),
      settings: { ...DEFAULT_SETTINGS }
    };
    accountFriendProfiles = {
      'user-pal-1': { user_id: 'user-pal-1', display_name: 'Pal', major_name: 'Mathematics' }
    };
    accountFriendPlans = [{
      id: 'shared-pal',
      owner_id: 'user-pal-1',
      name: 'Pal STEM plan',
      updated_at: '2026-07-01T12:00:00.000Z',
      payload: {
        state: {
          v: 1,
          activeSchedule: [{
            id: 'F26',
            name: 'Fall 2026',
            courses: [
              { code: 'MATH 140', title: 'Calculus I', cr: 4 },
              { code: 'ENGL 101', title: 'Academic Writing', cr: 3 }
            ]
          }, {
            id: 'S27',
            name: 'Spring 2027',
            courses: [
              { code: 'HIST 201', title: 'History of Modern Science', cr: 3 }
            ]
          }],
          customCourses: [],
          customSemesters: [],
          selectedSections: {
            F26: {
              MATH140: {
                course: 'MATH 140',
                section_id: 'MATH140-0201',
                number: '0201',
                semester: '202608',
                meetings: [{ days: 'M', start_time: '10:30am', end_time: '11:20am', building: 'IRB', room: '1201' }]
              },
              ENGL101: {
                course: 'ENGL 101',
                section_id: 'ENGL101-0101',
                number: '0101',
                semester: '202608',
                meetings: [{ days: 'Tu', start_time: '9:30am', end_time: '10:45am', building: 'TWS', room: '0201' }]
              }
            },
            S27: {
              HIST201: {
                course: 'HIST 201',
                section_id: 'HIST201-0101',
                number: '0101',
                semester: '202701',
                meetings: [
                  { days: 'M', start_time: '10:10am', end_time: '10:40am', building: 'TWS', room: '1101' },
                  { days: 'M', start_time: '12:00pm', end_time: '1:15pm', building: 'TWS', room: '1101' }
                ]
              }
            }
          },
          settings: { ...DEFAULT_SETTINGS, programName: 'Mathematics' },
          profilePrefs: defaultProfilePrefs()
        }
      }
    }];
    const friendSummary = accountFriendPlanSummary(accountFriendPlans[0]);
    const friendPlansHtml = accountFriendPlansHtml();
    const meetingNote = accountFriendMeetingPlanText(accountFriendPlans[0], friendSummary);
    const springOnlyPlan = {
      id: 'spring-only-pal',
      owner_id: 'user-pal-1',
      name: 'Pal spring-only plan',
      payload: {
        state: {
          v: 1,
          activeSchedule: [{
            id: 'S27',
            name: 'Spring 2027',
            courses: [{ code: 'HIST 201', title: 'History of Modern Science', cr: 3 }]
          }],
          customCourses: [],
          customSemesters: [],
          selectedSections: {
            S27: {
              HIST201: {
                course: 'HIST 201',
                section_id: 'HIST201-0101',
                number: '0101',
                semester: '202701',
                meetings: [{ days: 'M', start_time: '12:00pm', end_time: '1:15pm', building: 'TWS', room: '1101' }]
              }
            }
          },
          settings: { ...DEFAULT_SETTINGS, programName: 'Mathematics' },
          profilePrefs: defaultProfilePrefs()
        }
      }
    };
    const springOnlySummary = accountFriendPlanSummary(springOnlyPlan);
    const springOnlyHtml = accountFriendMeetingPlanHtml(springOnlySummary, springOnlyPlan);
    const springOnlyNote = accountFriendMeetingPlanText(springOnlyPlan, springOnlySummary);
    const aliasNoSemesterPlan = {
      id: 'alias-fall-pal',
      owner_id: 'user-pal-1',
      name: 'Pal imported fall plan',
      payload: {
        state: {
          v: 1,
          activeSchedule: [{
            id: 'PAL-FALL-ID',
            name: 'Imported Fall Bucket',
            courses: [{ code: 'ENGL 101', title: 'Academic Writing', cr: 3 }]
          }],
          customCourses: [],
          customSemesters: [],
          schedulePrefs: { 'PAL-FALL-ID': { term: '202608' } },
          selectedSections: {
            'PAL-FALL-ID': {
              ENGL101: {
                course: 'ENGL 101',
                section_id: 'ENGL101-0999',
                number: '0999',
                meetings: [{ days: 'Tu', start_time: '1:00pm', end_time: '2:15pm', building: 'TWS', room: '1200' }]
              }
            }
          },
          settings: { ...DEFAULT_SETTINGS, programName: 'Mathematics' },
          profilePrefs: defaultProfilePrefs()
        }
      }
    };
    const aliasNoSemesterSummary = accountFriendPlanSummary(aliasNoSemesterPlan);
    const aliasNoSemesterNote = accountFriendMeetingPlanText(aliasNoSemesterPlan, aliasNoSemesterSummary);
    const explicitMismatchPlan = {
      id: 'explicit-mismatch-pal',
      owner_id: 'user-pal-1',
      name: 'Pal stale fall plan',
      payload: {
        state: {
          v: 1,
          activeSchedule: [{
            id: 'PAL-FALL-ID',
            name: 'Imported Fall Bucket',
            courses: [{ code: 'ENGL 101', title: 'Academic Writing', cr: 3 }]
          }],
          customCourses: [],
          customSemesters: [],
          schedulePrefs: { 'PAL-FALL-ID': { term: '202608' } },
          selectedSections: {
            'PAL-FALL-ID': {
              ENGL101: {
                course: 'ENGL 101',
                section_id: 'ENGL101-0999',
                number: '0999',
                semester: '202701',
                meetings: [{ days: 'Tu', start_time: '1:00pm', end_time: '2:15pm', building: 'TWS', room: '1200' }]
              }
            }
          },
          settings: { ...DEFAULT_SETTINGS, programName: 'Mathematics' },
          profilePrefs: defaultProfilePrefs()
        }
      }
    };
    const explicitMismatchSummary = accountFriendPlanSummary(explicitMismatchPlan);
    const inferredImportSections = normalizeSharedSelectedSections({
      'MATH 140': {
        course: 'MATH 140',
        section_id: 'MATH140-0201',
        number: '0201',
        semester: '202701',
        meetings: [{ days: 'MW', start_time: '11:00am', end_time: '12:15pm', building: 'MTH', room: '0301' }]
      }
    }, {
      activeSchedule: [{
        id: 'share-fall',
        name: 'Fall 2026',
        courses: [{ code: 'MATH 140', title: 'Calculus I', cr: 4 }]
      }, {
        id: 'share-spring',
        name: 'Spring 2027',
        courses: [{ code: 'MATH 140', title: 'Calculus I', cr: 4 }]
      }],
      customCourses: [],
      customSemesters: [],
      schedulePrefs: {},
    });
    const nestedInferredImportSections = normalizeSharedSelectedSections({
      'legacy-fall-id': {
        MATH140: {
          course: 'MATH 140',
          section_id: 'MATH140-0301',
          number: '0301',
          semester: '202701',
          meetings: [{ days: 'TuTh', start_time: '9:30am', end_time: '10:45am', building: 'MTH', room: '0401' }]
        }
      }
    }, {
      activeSchedule: [{
        id: 'share-fall',
        name: 'Fall 2026',
        courses: [{ code: 'MATH 140', title: 'Calculus I', cr: 4 }]
      }, {
        id: 'share-spring',
        name: 'Spring 2027',
        courses: [{ code: 'MATH 140', title: 'Calculus I', cr: 4 }]
      }],
      customCourses: [],
      customSemesters: [],
      schedulePrefs: {},
    });
    const restoredImportSections = normalizeRestoredSelectedSections({
      'legacy-fall-id': {
        MATH140: {
          course: 'MATH 140',
          section_id: 'MATH140-0401',
          number: '0401',
          semester: '202701',
          meetings: [{ days: 'F', start_time: '1:00pm', end_time: '1:50pm', building: 'MTH', room: '0501' }]
        }
      }
    }, {
      activeSchedule: [{
        id: 'restore-fall',
        name: 'Fall 2026',
        courses: [{ code: 'MATH 140', title: 'Calculus I', cr: 4 }]
      }, {
        id: 'restore-spring',
        name: 'Spring 2027',
        courses: [{ code: 'MATH 140', title: 'Calculus I', cr: 4 }]
      }],
      customCourses: [],
      customSemesters: [],
      schedulePrefs: {},
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      activeSchedule: [{
        id: 'local-fall',
        name: 'Fall 2026',
        courses: [{ code: 'MATH 140', title: 'Calculus I', cr: 4 }]
      }, {
        id: 'local-spring',
        name: 'Spring 2027',
        courses: [{ code: 'MATH 140', title: 'Calculus I', cr: 4 }]
      }],
      customCourses: [],
      customSemesters: [],
      customMajors: [],
      selectedSections: {
        'legacy-local-fall': {
          MATH140: {
            course: 'MATH 140',
            section_id: 'MATH140-0701',
            number: '0701',
            semester: '202701',
            meetings: [{ days: 'W', start_time: '11:00am', end_time: '11:50am', building: 'MTH', room: '0801' }]
          }
        }
      },
      schedulePrefs: {},
      scheduleAdvisorFilter: 'all',
      scheduleOutputPreset: 'personal',
      scheduleOutputOptions: {},
      roadmapPrefs: {},
      browseSavedSearches: [],
      recentChanges: [],
      profilePrefs: defaultProfilePrefs(),
      settings: { ...DEFAULT_SETTINGS, programName: 'Local Math' },
    }));
    const localStartupState = loadState();
    localStorage.removeItem(STORAGE_KEY);
    const applied = applySharedPlanData({
      v: 1,
      courses: { 'MATH 140': { status: 'passed' } },
      customCourses: [],
      customSemesters: [],
      selectedSections: { 'MATH 140': '0101' },
      schedulePrefs: { earliestHour: 10 },
      scheduleAdvisorFilter: 'remaining',
      scheduleOutputPreset: 'advisor',
      scheduleOutputOptions: { warnings: false },
      roadmapPrefs: { filter: 'gened', query: 'math', selectedCode: 'MATH 140' },
      browseSavedSearches: [
        { id: 'friend-search', dept: '__PROFILE_DEPTS__', genEd: 'DSHU', search: 'ethics' },
        { id: 'invalid-search', dept: 'TOOLONG', genEd: '', search: '' }
      ],
      recentChanges: [{ id: 'change-1' }],
      profilePrefs: { interests: ['business'], careerGoal: 'finance analytics', genEdDepts: ['ECON'] },
      settings: { theme: 'light' }
    }, { confirm: false, sourceLabel: 'friend plan' });
    const importedSelected = getSelectedSection('F26', 'MATH 140');
    const advisorImportHash = scheduleAdvisorPlanImportHash();
    const advisorImportUrl = scheduleAdvisorPlanImportUrl();
    ({
      applied,
      planName: prefs.planName,
      displayName: prefs.displayName,
      inviteEmail: prefs.friendInviteEmail,
      inviteNote: prefs.friendInviteNote,
      inviteCount: prefs.friendInvites.length,
      inviteDirection: prefs.friendInvites[0].direction,
      inviteStatus: prefs.friendInvites[0].status,
      inviteUserId: prefs.friendInvites[0].userId,
      stateHasMath: Boolean(state.courses['MATH 140']),
      selectedSection: importedSelected,
      selectedSectionSemIds: Object.keys(state.selectedSections || {}),
      legacySelectedSection: state.selectedSections['MATH 140'] || null,
      profileInterest: state.profilePrefs.interests[0],
      roadmapFilter: state.roadmapPrefs.filter,
      browseSearchCount: state.browseSavedSearches.length,
      browseSearchDept: state.browseSavedSearches[0]?.dept,
      browseSearchQuery: state.browseSavedSearches[0]?.search,
      outputPreset: state.scheduleOutputPreset,
      advisorImportHash,
      advisorImportUrl,
      friendSummary,
      friendPlansHtml,
      meetingNote,
      sharedFreeWindows: friendSummary.sharedFreeWindows.map(window => window.text),
      recommendedMeetingWindows: friendSummary.recommendedMeetingWindows.map(window => ({
        suggestedText: window.suggestedText,
        availableText: window.availableText,
        campusAligned: window.campusAligned,
      })),
      springOnly: {
        termKey: springOnlySummary.meetingTermKey,
        sharedTermCount: springOnlySummary.sharedMeetingTermCount,
        sharedFreeWindowCount: springOnlySummary.sharedFreeWindows.length,
        recommendedMeetingWindowCount: springOnlySummary.recommendedMeetingWindows.length,
        html: springOnlyHtml,
        note: springOnlyNote,
      },
      aliasNoSemester: {
        termKey: aliasNoSemesterSummary.meetingTermKey,
        termLabel: aliasNoSemesterSummary.meetingTermLabel,
        sharedTermCount: aliasNoSemesterSummary.sharedMeetingTermCount,
        meetingFriendSelectedCount: aliasNoSemesterSummary.meetingFriendSelectedCount,
        meetingCurrentSelectedCount: aliasNoSemesterSummary.meetingCurrentSelectedCount,
        sharedFreeWindowCount: aliasNoSemesterSummary.sharedFreeWindows.length,
        note: aliasNoSemesterNote,
      },
      explicitMismatch: {
        termKey: explicitMismatchSummary.meetingTermKey,
        sharedTermCount: explicitMismatchSummary.sharedMeetingTermCount,
        sharedFreeWindowCount: explicitMismatchSummary.sharedFreeWindows.length,
      },
      inferredImport: {
        semIds: Object.keys(inferredImportSections),
        springSection: inferredImportSections['share-spring']?.MATH140 || null,
        fallSection: inferredImportSections['share-fall']?.MATH140 || null,
      },
      nestedInferredImport: {
        semIds: Object.keys(nestedInferredImportSections),
        springSection: nestedInferredImportSections['share-spring']?.MATH140 || null,
        legacySection: nestedInferredImportSections['legacy-fall-id']?.MATH140 || null,
      },
      restoredImport: {
        semIds: Object.keys(restoredImportSections),
        springSection: restoredImportSections['restore-spring']?.MATH140 || null,
        legacySection: restoredImportSections['legacy-fall-id']?.MATH140 || null,
      },
      localStartupRestore: {
        activeIds: (localStartupState.activeSchedule || []).map(sem => sem.id),
        semIds: Object.keys(localStartupState.selectedSections || {}),
        springSection: localStartupState.selectedSections['local-spring']?.MATH140 || null,
        legacySection: localStartupState.selectedSections['legacy-local-fall']?.MATH140 || null,
      },
      snapshotRestore: (() => {
        state.snapshots = [{
          id: 'restore-snap',
          name: 'Restored spring scenario',
          payload: {
            courses: { 'MATH 140': { status: 'planned' } },
            customCourses: [],
            customSemesters: [],
            activeSchedule: [{
              id: 'snap-fall',
              name: 'Fall 2026',
              courses: [{ code: 'MATH 140', title: 'Calculus I', cr: 4 }]
            }, {
              id: 'snap-spring',
              name: 'Spring 2027',
              courses: [{ code: 'MATH 140', title: 'Calculus I', cr: 4 }]
            }],
            selectedSections: {
              'old-fall-snap': {
                MATH140: {
                  course: 'MATH 140',
                  section_id: 'MATH140-0501',
                  number: '0501',
                  semester: '202701',
                  meetings: [{ days: 'M', start_time: '3:00pm', end_time: '3:50pm', building: 'MTH', room: '0601' }]
                }
              }
            },
            schedulePrefs: {},
            scheduleAdvisorFilter: 'all',
            scheduleOutputPreset: 'personal',
            scheduleOutputOptions: {},
            roadmapPrefs: {},
            browseSavedSearches: [],
            recentChanges: [],
            profilePrefs: defaultProfilePrefs(),
            settings: { ...DEFAULT_SETTINGS, programName: 'Snapshot Math' },
          }
        }];
        loadSnapshot('restore-snap');
        return {
          activeIds: (state.activeSchedule || []).map(sem => sem.id),
          springSection: state.selectedSections['snap-spring']?.MATH140 || null,
          legacySection: state.selectedSections['old-fall-snap']?.MATH140 || null,
        };
      })(),
    })
  `, context));

  assert(result.planName === 'Friends plan', 'account prefs: plan name should trim');
  assert(result.displayName === 'Test Student', 'account prefs: display name should trim');
  assert(result.inviteEmail === 'friend@umd.edu', 'account prefs: friend invite email should normalize');
  assert(result.inviteNote === 'compare schedules', 'account prefs: invite note should trim');
  assert(result.inviteCount === 1, 'account prefs: invalid friend invite should be removed');
  assert(result.inviteDirection === 'received', 'account prefs: invite direction should persist');
  assert(result.inviteStatus === 'accepted', 'account prefs: invite status should persist');
  assert(result.inviteUserId === 'user-pal-1', 'account prefs: invite user id should persist');
  assert(result.applied, 'shared plan: friend plan payload should apply');
  assert(result.stateHasMath, 'shared plan: course state should be replaced');
  assert(result.selectedSection?.number === '0101' && result.selectedSection?.section_id === 'MATH140-0101', 'shared plan: legacy selected section should normalize into the matching semester');
  assert(result.selectedSectionSemIds.includes('F26') && !result.legacySelectedSection, 'shared plan: legacy flat section picks should not remain orphaned at top level');
  assert(result.profileInterest === 'business', 'shared plan: profile prefs should normalize');
  assert(result.roadmapFilter === 'gened', 'shared plan: roadmap prefs should persist');
  assert(result.browseSearchCount === 1, 'shared plan: invalid saved browse searches should be removed');
  assert(result.browseSearchDept === '__PROFILE_DEPTS__', 'shared plan: saved browse profile department preset should persist');
  assert(result.browseSearchQuery === 'ethics', 'shared plan: saved browse search keyword should persist');
  assert(result.outputPreset === 'advisor', 'shared plan: output preset should persist');
  assert(/^#plan=/.test(result.advisorImportHash) && result.advisorImportUrl === result.advisorImportHash, 'advisor packet import: should create a same-format shared-plan hash without a browser origin');
  assert(result.friendSummary.courseCount === 3, 'friend compare: should count friend plan courses');
  assert(result.friendSummary.selectedCount === 3, 'friend compare: should count picked friend sections');
  assert(result.friendSummary.sharedCourseCount === 1, 'friend compare: should count courses shared with current plan');
  assert(result.friendSummary.meetingTermLabel === 'Fall 2026', 'friend compare: should choose the shared UMD term for meeting analysis');
  assert(result.friendSummary.sharedMeetingTermCount === 1, 'friend compare: should count only terms with picked sections in both plans');
  assert(result.friendSummary.meetingFriendSelectedCount === 2, 'friend compare: should compare only friend sections in the shared UMD term');
  assert(result.friendSummary.meetingCurrentSelectedCount === 1, 'friend compare: should compare only current sections in the shared UMD term');
  assert(result.friendSummary.meetingOverlapCount === 1, 'friend compare: should count timed overlaps with current plan');
  assert(result.friendSummary.meetingOverlapSamples.every(sample => !/HIST 201/.test(sample)), 'friend compare: should ignore picked sections from other UMD terms');
  assert(result.friendSummary.sharedFreeWindows.length >= 3, 'friend compare: should compute shared free windows');
  assert(result.sharedFreeWindows[0] === 'Mon 8:00am-10:00am', 'friend compare: first shared free window should precede both Monday meetings');
  assert(result.friendSummary.recommendedMeetingWindows.length >= 3, 'friend meeting planner: should rank suggested meeting slots');
  assert(result.recommendedMeetingWindows[0].suggestedText === 'Mon 12:00pm-1:15pm', 'friend meeting planner: should prefer a campus-aligned Monday lunch slot');
  assert(result.recommendedMeetingWindows[0].campusAligned, 'friend meeting planner: best slot should be marked campus aligned');
  assert(/Pal STEM plan/.test(result.friendPlansHtml) && /Mathematics/.test(result.friendPlansHtml), 'friend compare: should render friend plan identity');
  assert(/3<\/strong> courses/.test(result.friendPlansHtml) && /3<\/strong> picked sections/.test(result.friendPlansHtml), 'friend compare: should render course and section counts');
  assert(/1<\/strong> shared courses/.test(result.friendPlansHtml) && /1<\/strong> meeting overlaps/.test(result.friendPlansHtml), 'friend compare: should render shared and overlap counts');
  assert(/Fall 2026<\/strong> meeting term/.test(result.friendPlansHtml), 'friend compare: should render the meeting term scope');
  assert(/MATH 140 with your MATH 140 M 10:30am-10:50am/.test(result.friendPlansHtml), 'friend compare: should render overlap sample');
  assert(!/HIST 201 with your/.test(result.friendPlansHtml), 'friend compare: should not render cross-term overlap samples');
  assert(/Shared free windows/.test(result.friendPlansHtml) && /Mon 8:00am-10:00am/.test(result.friendPlansHtml), 'friend compare: should render shared free windows');
  assert(/Meeting planner/.test(result.friendPlansHtml) && /Mon 12:00pm-1:15pm/.test(result.friendPlansHtml), 'friend meeting planner: should render best meeting slot');
  assert(/Copy meeting note/.test(result.friendPlansHtml), 'friend meeting planner: should render copy note action');
  assert(/best shared slot in Fall 2026 Mon 12:00pm-1:15pm/.test(result.meetingNote) && /1 picked-section overlap in Fall 2026/.test(result.meetingNote), 'friend meeting planner: should generate a concrete term-scoped copy note');
  assert(result.springOnly.termKey === '' && result.springOnly.sharedTermCount === 0, 'friend meeting planner: should not compare picked sections from unmatched terms');
  assert(result.springOnly.sharedFreeWindowCount === 0 && result.springOnly.recommendedMeetingWindowCount === 0, 'friend meeting planner: should not create windows for unmatched terms');
  assert(/same UMD term/.test(result.springOnly.html) && /same UMD term/.test(result.springOnly.note), 'friend meeting planner: should guide users to pick matching terms');
  assert(result.aliasNoSemester.termKey === '202608' && result.aliasNoSemester.termLabel === 'Fall 2026', 'friend meeting planner: should infer UMD term for no-semester imported picks');
  assert(result.aliasNoSemester.sharedTermCount === 1, 'friend meeting planner: no-semester imported picks should share the matched UMD term');
  assert(result.aliasNoSemester.meetingFriendSelectedCount === 1 && result.aliasNoSemester.meetingCurrentSelectedCount === 1, 'friend meeting planner: inferred-term picks should participate in meeting comparisons');
  assert(result.aliasNoSemester.sharedFreeWindowCount > 0, 'friend meeting planner: inferred-term picks should produce shared free windows');
  assert(/best shared slot in Fall 2026/.test(result.aliasNoSemester.note), 'friend meeting planner: inferred-term copy note should name the UMD term');
  assert(result.explicitMismatch.termKey === '' && result.explicitMismatch.sharedTermCount === 0, 'friend meeting planner: explicit section semester should override schedulePrefs term');
  assert(result.explicitMismatch.sharedFreeWindowCount === 0, 'friend meeting planner: explicit wrong-term picks should not create free windows');
  assert(result.inferredImport.semIds.includes('share-spring') && !result.inferredImport.fallSection, 'shared plan import: flat picked section should route to inferred matching UMD term when a course appears twice');
  assert(result.inferredImport.springSection?.section_id === 'MATH140-0201' && result.inferredImport.springSection?.semester === '202701', 'shared plan import: routed section should preserve the posted UMD term');
  assert(result.nestedInferredImport.semIds.includes('share-spring') && !result.nestedInferredImport.legacySection, 'shared plan import: stale nested section buckets should reroute to the inferred matching UMD term');
  assert(result.nestedInferredImport.springSection?.section_id === 'MATH140-0301' && result.nestedInferredImport.springSection?.semester === '202701', 'shared plan import: nested rerouted section should preserve the posted UMD term');
  assert(result.restoredImport.semIds.includes('restore-spring') && !result.restoredImport.legacySection, 'JSON import restore: stale nested section buckets should use shared selected-section normalization');
  assert(result.restoredImport.springSection?.section_id === 'MATH140-0401' && result.restoredImport.springSection?.semester === '202701', 'JSON import restore: rerouted section should preserve the posted UMD term');
  assert(result.localStartupRestore.activeIds.includes('local-spring') && result.localStartupRestore.semIds.includes('local-spring') && !result.localStartupRestore.legacySection, 'local startup restore: persisted stale selected-section buckets should normalize when loading browser state');
  assert(result.localStartupRestore.springSection?.section_id === 'MATH140-0701' && result.localStartupRestore.springSection?.semester === '202701', 'local startup restore: rerouted section should preserve the posted UMD term');
  assert(result.snapshotRestore.activeIds.includes('snap-spring') && !result.snapshotRestore.legacySection, 'snapshot restore: stale selected-section buckets should normalize when loading a saved scenario');
  assert(result.snapshotRestore.springSection?.section_id === 'MATH140-0501' && result.snapshotRestore.springSection?.semester === '202701', 'snapshot restore: rerouted section should preserve the posted UMD term');

  return {
    id: 'ACCOUNT-FRIENDS',
    normalizedInvite: result.inviteEmail,
    importedCourse: 'MATH 140',
    outputPreset: result.outputPreset,
  };
}

async function testAutoPlanDiagnostics(context) {
  const result = clone(await vm.runInContext(`
    (async () => {
      state.profilePrefs = normalizeProfilePrefs({
        interests: ['ai-data'],
        careerGoal: 'machine learning for public policy',
        genEdDepts: 'INST, PSYC, GVPT'
      });
      const template = await buildAutoPlanPreview('STAT', {
        noFetch: true,
        force: true,
        profilePrefs: getProfilePrefs()
      });
      const templateDiagnostics = autoPlanDiagnostics(template);
      const templateReality = autoPlanRealitySummary(template);
      const templateHtml = autoPlanReviewHtml(template);
      const templateFreshnessSummary = generatedTemplateFreshnessSummary(template);
      const templateFreshnessHtml = generatedTemplateFreshnessHtml(template);
      const samplePlaceholder = template.placeholderSamples.find(course => /^GenEd/i.test(course.code)) || template.placeholderSamples[0];
      const placeholderAction = autoPlanPlaceholderBrowseConfig(samplePlaceholder, template);
      state.browseSavedSearches = [];
      switchTab = tab => { currentTab = tab; };
      autoPlanOpenBrowseReplacement({
        dataset: {
          browseDept: placeholderAction.dept,
          browseGened: placeholderAction.genEd,
          browseSearch: placeholderAction.search,
          browseLabel: placeholderAction.label
        }
      });
      const replacementBrowse = {
        currentTab,
        browseDept,
        browseGenEd,
        browseSearch,
        savedCount: state.browseSavedSearches.length,
        savedLabel: state.browseSavedSearches[0]?.label || '',
      };

      fetchCoursesBatch = async (codes, onProgress) => {
        const out = {};
        codes.slice(0, 3).forEach((code, index) => {
          out[normalizeCode(code)] = {
            code: displayCode(code),
            title: displayCode(code) + ' Live Course',
            cr: index === 0 ? 4 : 3,
            prereqs: [],
            prereqGroups: [],
            coreqs: [],
            categories: [],
            gen_ed: [],
            avg_gpa: 3.1
          };
        });
        if (onProgress) onProgress(3, codes.length);
        return out;
      };
      const mixed = await buildAutoPlanPreview('STAT', {
        force: true,
        profilePrefs: getProfilePrefs()
      });
      const mixedDiagnostics = autoPlanDiagnostics(mixed);
      const mixedReality = autoPlanRealitySummary(mixed);
      const mixedHtml = autoPlanReviewHtml(mixed);
      const mixedFreshnessHtml = generatedTemplateFreshnessHtml(mixed);
      const builtInSourceMissing = listMajors()
        .filter(major => major && !major.isCustom)
        .filter(major => !majorOfficialSources(major, { includeGeneral: false }).length)
        .map(major => major.id);

      return {
        templateCoverage: template.metadataCoverage,
        templateProgression: template.levelProgression,
        templateGroups: template.requirementGroupSummary,
        templateOfficialSources: template.officialSources,
        templateTitles: templateDiagnostics.map(item => item.title),
        templateReality,
        templateHtml,
        templateFreshnessSummary,
        templateFreshnessHtml,
        templatePlaceholderSamples: template.placeholderSamples.map(item => item.code),
        placeholderAction,
        replacementBrowse,
        mixedCoverage: mixed.metadataCoverage,
        mixedProgression: mixed.levelProgression,
        mixedGroups: mixed.requirementGroupSummary,
        mixedTitles: mixedDiagnostics.map(item => item.title),
        mixedReality,
        mixedHtml,
        mixedFreshnessHtml,
        builtInSourceMissing,
      };
    })()
  `, context));

  assert(result.templateCoverage.coveragePct === 0, 'auto plan diagnostics: template-only preview should show 0% live coverage');
  assert(result.templateCoverage.missingCodes.length > 0, 'auto plan diagnostics: template-only preview should list fallback codes');
  assert(result.templateTitles.includes('Template-only preview'), 'auto plan diagnostics: should flag template-only source');
  assert(result.templateTitles.includes('Intro-to-400 path'), 'auto plan diagnostics: should flag course-level progression');
  assert(result.templateReality.level === 'warn' && result.templateReality.title === 'Draft needs live replacements', 'auto plan reality: template-only preview should warn that live replacements are needed');
  assert(result.templateReality.metrics.some(metric => metric.label === 'Live-backed requirements' && metric.value === `0/${result.templateCoverage.total}`), 'auto plan reality: should show live-backed requirement count');
  assert(result.templateReality.metrics.some(metric => metric.label === 'Placeholder credits' && metric.level === 'warn'), 'auto plan reality: should flag placeholder credits');
  assert(result.templateReality.metrics.some(metric => metric.label === 'Elective placement' && /senior/.test(metric.detail)), 'auto plan reality: should show elective placement distribution');
  assert(result.templateReality.metrics.some(metric => metric.label === 'Elective placement' && metric.level === 'ok'), 'auto plan reality: elective placement should be ready when electives are spread beyond year one');
  assert(result.templateReality.nextActions.some(action => /Replace \d+ placeholder credits/.test(action)), 'auto plan reality: should include replacement action text');
  assert(result.templateGroups.every(group => group.complete), 'auto plan diagnostics: requirement groups should be complete');
  assert(result.templateProgression.realCount === result.templateCoverage.total, 'auto plan diagnostics: level progression should count real template requirements');
  assert(result.templateProgression.hasEarlyIntro, 'auto plan diagnostics: level progression should include early lower-level requirements');
  assert(result.templateProgression.hasLateAdvanced, 'auto plan diagnostics: level progression should include later upper-level requirements');
  assert(result.templateProgression.hasUpper400, 'auto plan diagnostics: level progression should include 400-level requirements');
  assert(result.templateTitles.includes('Replacement work'), 'auto plan diagnostics: should flag placeholder replacement work');
  assert(/Template fallback/.test(result.templateHtml), 'auto plan diagnostics: source samples should include template fallback row');
  assert(/Intro-to-400 path/.test(result.templateHtml) && /100\/200-level/.test(result.templateHtml) && /400-level/.test(result.templateHtml), 'auto plan diagnostics: review should render course-level progression');
  assert(/Major Requirement Groups/.test(result.templateHtml) && /Core Requirements/.test(result.templateHtml) && /Upper-Level Choices/.test(result.templateHtml), 'auto plan diagnostics: review should render requirement groups');
  assert(/Plan Reality/.test(result.templateHtml) && /Live-backed requirements/.test(result.templateHtml) && /Placeholder credits/.test(result.templateHtml), 'auto plan reality: review should render reality metrics');
  assert(/Elective placement/.test(result.templateHtml) && /senior/.test(result.templateHtml), 'auto plan reality: review should render elective placement metric');
  assert(/Elective Roadmap/.test(result.templateHtml) && /profile\/elective slots/.test(result.templateHtml), 'auto plan elective roadmap: review should render roadmap summary');
  assert(/Senior focus/.test(result.templateHtml) && /Find profile fits/.test(result.templateHtml), 'auto plan elective roadmap: should show senior-stage elective rows with Browse actions');
  assert(/Next replacement actions/.test(result.templateHtml) && /data-auto-plan-browse-placeholder/.test(result.templateHtml), 'auto plan reality: review should render actionable replacement buttons');
  assert(/Placeholders to replace/.test(result.templateHtml), 'auto plan diagnostics: source samples should include placeholder row');
  assert(/Requirement source/.test(result.templateHtml) && /Mathematics Major/.test(result.templateHtml), 'auto plan diagnostics: source samples should include selected official requirement source');
  assert(/data-auto-plan-browse-placeholder/.test(result.templateHtml), 'auto plan diagnostics: placeholder source samples should include browse actions');
  assert(result.templateFreshnessSummary.generatedCount === 50, 'auto plan diagnostics: freshness report should count generated templates');
  assert(result.templateFreshnessSummary.requirementRows === 843, 'auto plan diagnostics: freshness report should count generated requirement rows');
  assert(/Generated Catalog Freshness/.test(result.templateFreshnessHtml), 'auto plan diagnostics: freshness report should render a title');
  assert(/50\/50/.test(result.templateFreshnessHtml), 'auto plan diagnostics: freshness report should show the passing catalog audit');
  assert(/PlanetTerp/.test(result.templateFreshnessHtml), 'auto plan diagnostics: freshness report should name the live source');
  assert(/pass87-all/.test(result.templateFreshnessHtml), 'auto plan diagnostics: freshness report should show the audit seed');
  assert(/Official sources/.test(result.templateFreshnessHtml), 'auto plan diagnostics: freshness report should render official source links');
  assert(result.templateFreshnessHtml.includes('academiccatalog.umd.edu/undergraduate/programs/'), 'auto plan diagnostics: freshness report should link the UMD catalog program index');
  assert(result.templateFreshnessHtml.includes('academiccatalog.umd.edu/undergraduate/approved-courses/'), 'auto plan diagnostics: freshness report should link the UMD course catalog');
  assert(/Catalog year 2026-2027/.test(result.templateFreshnessHtml) && /checked June 30, 2026/.test(result.templateFreshnessHtml), 'auto plan diagnostics: freshness report should show source year metadata');
  assert(/Audit history/.test(result.templateFreshnessHtml), 'auto plan diagnostics: freshness report should render audit history');
  assert(/pass86-all/.test(result.templateFreshnessHtml) && /pass85-all-final/.test(result.templateFreshnessHtml), 'auto plan diagnostics: audit history should show prior verification seeds');
  assert(result.templateOfficialSources.some(link => /Mathematics Major/.test(link.label) && /academiccatalog\.umd\.edu/.test(link.url)), 'auto plan diagnostics: preview should carry selected official catalog source');
  assert(result.templateOfficialSources.some(link => link.year === '2026-2027' && link.checkedAt === 'June 30, 2026'), 'auto plan diagnostics: preview should carry official source year metadata');
  assert(result.builtInSourceMissing.length === 0, `auto plan diagnostics: missing official catalog sources for ${result.builtInSourceMissing.join(', ')}`);
  assert(result.templatePlaceholderSamples.length > 0, 'auto plan diagnostics: should include placeholder samples');
  assert(result.placeholderAction.genEd, 'auto plan diagnostics: placeholder action should infer a GenEd filter');
  assert(result.placeholderAction.dept === '__PROFILE_DEPTS__', 'auto plan diagnostics: placeholder action should use profile departments when profile is active');
  assert(result.replacementBrowse.currentTab === 'browse', 'auto plan diagnostics: replacement action should switch to Browse');
  assert(result.replacementBrowse.browseGenEd === result.placeholderAction.genEd, 'auto plan diagnostics: replacement action should set Browse GenEd filter');
  assert(result.replacementBrowse.savedCount === 1, 'auto plan diagnostics: replacement action should save the Browse search');
  assert(/Replace/.test(result.replacementBrowse.savedLabel), 'auto plan diagnostics: saved replacement search should have a replacement label');

  assert(result.mixedCoverage.found === 3, 'auto plan diagnostics: mixed preview should count live records');
  assert(result.mixedCoverage.missing > 0, 'auto plan diagnostics: mixed preview should preserve fallback count');
  assert(result.mixedCoverage.coveragePct > 0 && result.mixedCoverage.coveragePct < 100, 'auto plan diagnostics: mixed preview should show partial coverage percent');
  assert(result.mixedCoverage.liveCodes.length === 3, 'auto plan diagnostics: mixed preview should include live code samples');
  assert(result.mixedTitles.includes('Mixed metadata sources'), 'auto plan diagnostics: should flag mixed metadata sources');
  assert(result.mixedReality.metrics.some(metric => metric.label === 'Live-backed requirements' && metric.value === `${result.mixedCoverage.found}/${result.mixedCoverage.total}`), 'auto plan reality: mixed preview should carry partial live coverage');
  assert(result.mixedReality.nextActions.some(action => /template fallback/.test(action)), 'auto plan reality: mixed preview should ask for fallback review');
  assert(result.mixedProgression.hasLateAdvanced && result.mixedProgression.hasUpper400, 'auto plan diagnostics: mixed preview should preserve later upper-level progression');
  assert(result.mixedGroups.every(group => group.complete), 'auto plan diagnostics: mixed preview should preserve complete requirement groups');
  assert(/Live metadata/.test(result.mixedHtml) && /Template fallback/.test(result.mixedHtml), 'auto plan diagnostics: mixed source samples should compare live and fallback rows');
  assert(
    result.mixedFreshnessHtml.includes(`${result.mixedCoverage.found}/${result.mixedCoverage.total}`),
    'auto plan diagnostics: freshness report should show selected preview live coverage',
  );

  return {
    id: 'AUTO-PLAN-DIAGNOSTICS',
    templateMissing: result.templateCoverage.missing,
    mixedCoverage: `${result.mixedCoverage.found}/${result.mixedCoverage.total}`,
  };
}

async function testAllGeneratedRequirementGroups(context) {
  const rows = clone(await vm.runInContext(`
    (async () => {
      const majors = listMajors()
        .filter(major => major && !major.isCustom && !isMajorFullyBaked(major) && majorAllCodes(major).length)
        .sort((a, b) => a.id.localeCompare(b.id));
      const out = [];
      for (const major of majors) {
        const review = await buildAutoPlanPreview(major.id, {
          noFetch: true,
          force: true,
          profilePrefs: getProfilePrefs()
        });
        out.push({
          id: major.id,
          requirementCourseCount: review.requirementCourseCount,
          groups: review.requirementGroupSummary || []
        });
      }
      return out;
    })()
  `, context));
  assert(rows.length >= 50, `all generated requirement groups: expected at least 50 generated majors, saw ${rows.length}`);
  rows.forEach(row => {
    const groupTotal = row.groups.reduce((sum, group) => sum + group.total, 0);
    const groupScheduled = row.groups.reduce((sum, group) => sum + group.scheduled, 0);
    assert(groupTotal === row.requirementCourseCount, `${row.id}: requirement groups should sum to ${row.requirementCourseCount}, saw ${groupTotal}`);
    assert(groupScheduled === row.requirementCourseCount, `${row.id}: requirement groups should schedule every requirement, saw ${groupScheduled}/${row.requirementCourseCount}`);
    assert(row.groups.some(group => group.id === 'major-core'), `${row.id}: missing core requirement group`);
    assert(row.groups.some(group => group.id === 'major-upper'), `${row.id}: missing upper requirement group`);
  });
  return {
    id: 'ALL-GENERATED-REQ-GROUPS',
    majors: rows.length,
    requirements: rows.reduce((sum, row) => sum + row.requirementCourseCount, 0),
  };
}

async function testCatalogYearTargeting(context) {
  const result = clone(await vm.runInContext(`
    (async () => {
      state.settings = normalizeSettings({ ...DEFAULT_SETTINGS, catalogYear: '2024' });
      state.majorId = 'CS';
      const normalized = getSettings().catalogYear;
      const options = catalogYearOptions(normalized);
      const links = majorOfficialSources('CS', { includeGeneral: true, catalogYear: normalized });
      const sourceHtml = autoPlanOfficialSourceLinksHtml({ majorId: 'CS', catalogYear: normalized }, { includeGeneral: true });
      const releaseHtml = releaseChecklistHtml({ source: 'none', supabaseUrl: '', supabaseAnonKey: '' }, false);
      const preview = await buildAutoPlanPreview('STAT', {
        noFetch: true,
        force: true,
        catalogYear: normalized
      });
      const reviewHtml = autoPlanReviewHtml(preview, { actions: false });
      const warning = catalogYearAdvisingWarning();
      const sem = getAllSemesters()[0];
      const advisorText = scheduleAdvisorText(
        sem,
        '202608',
        sem.courses || [],
        [],
        [],
        [],
        {},
        'Schedule summary',
        'all',
        [],
        { preferences: false, warnings: false, unscheduled: false, recentChanges: false, auditIssues: false }
      );
      const advisorHtml = scheduleAdvisorPacketHtml(
        sem,
        '202608',
        sem.courses || [],
        [],
        [],
        [],
        {},
        [],
        0,
        'all',
        [],
        { preferences: false, warnings: false, unscheduled: false, recentChanges: false, auditIssues: false }
      );
      return {
        normalized,
        current: currentCatalogYear(),
        enDash: normalizeCatalogYear('2023–2024'),
        invalid: normalizeCatalogYear('not a year'),
        options,
        firstLink: links[0],
        sourceHtml,
        releaseHtml,
        previewCatalogYear: preview.catalogYear,
        previewSource: preview.officialSources[0],
        reviewHtml,
        warning,
        advisorText,
        advisorHtml,
      };
    })()
  `, context));

  assert(result.normalized === '2024-2025', 'catalog year: single-year input should normalize to an academic year span');
  assert(result.enDash === '2023-2024', 'catalog year: en dash input should normalize');
  assert(result.invalid === result.current, 'catalog year: invalid input should fall back to current catalog year');
  assert(result.options.includes(result.current) && result.options.includes('2024-2025'), 'catalog year: selector options should include current and selected years');
  assert(result.firstLink.targetYear === '2024-2025', 'catalog year: source links should carry student target year');
  assert(result.firstLink.sourceYear === result.current && result.firstLink.year === result.current, 'catalog year: source links should preserve checked source year');
  assert(result.firstLink.isCurrentCatalog === false, 'catalog year: older target should be marked non-current');
  assert(/Catalog target 2024-2025/.test(result.sourceHtml) && /linked source 2026-2027/.test(result.sourceHtml), 'catalog year: source HTML should compare target and linked source years');
  assert(/Catalog target 2024-2025/.test(result.releaseHtml), 'catalog year: release checklist should show selected target year');
  assert(result.previewCatalogYear === '2024-2025', 'catalog year: auto-plan preview should preserve target year');
  assert(result.previewSource.targetYear === '2024-2025', 'catalog year: preview official source should carry target year');
  assert(/Catalog target 2024-2025/.test(result.reviewHtml) && /linked source 2026-2027/.test(result.reviewHtml), 'catalog year: auto-plan review should render target/source metadata');
  assert(result.warning?.targetYear === '2024-2025' && result.warning?.sourceYear === '2026-2027', 'catalog year: advising warning should expose target and source years');
  assert(/official UMD audit|advisor worksheet/.test(result.warning?.body || ''), 'catalog year: advising warning should tell students what evidence to bring');
  assert(/Catalog year: 2024-2025/.test(result.advisorText), 'catalog year: advisor text should include target catalog year');
  assert(/Catalog-year verification/.test(result.advisorText) && /Confirm 2024-2025 catalog requirements/.test(result.advisorText), 'catalog year: advisor text should include catalog-year verification warning');
  assert(/Catalog 2024-2025/.test(result.advisorHtml), 'catalog year: advisor HTML should include target catalog year');
  assert(/schedule-advisor-catalog-warning/.test(result.advisorHtml) && /Confirm 2024-2025 catalog requirements/.test(result.advisorHtml), 'catalog year: advisor HTML should include warning block');

  return {
    id: 'CATALOG-YEAR',
    target: result.normalized,
    source: result.firstLink.sourceYear,
  };
}

function testScheduleTimingFit(context) {
  const result = clone(vm.runInContext(`
    (() => {
      const timingPrefs = { ...DEFAULT_SCHEDULE_PREFS, mode: 'compact', minBreak: 15 };
      const compactItems = [
        {
          course: { code: 'CMSC 131', title: 'Programming I' },
          section: { section_id: 'CMSC131-0101', number: '0101', meetings: [{ days: 'MW', start_time: '9:00am', end_time: '10:15am', building: 'IRB', room: '1101' }] }
        },
        {
          course: { code: 'MATH 140', title: 'Calculus I' },
          section: { section_id: 'MATH140-0101', number: '0101', meetings: [{ days: 'MW', start_time: '10:30am', end_time: '11:45am', building: 'CSI', room: '2110' }] }
        }
      ];
      const idleItems = [
        {
          course: { code: 'CMSC 131', title: 'Programming I' },
          section: { section_id: 'CMSC131-0201', number: '0201', meetings: [{ days: 'MW', start_time: '8:00am', end_time: '9:15am', building: 'IRB', room: '1101' }] }
        },
        {
          course: { code: 'MATH 140', title: 'Calculus I' },
          section: { section_id: 'MATH140-0201', number: '0201', meetings: [{ days: 'MW', start_time: '2:00pm', end_time: '3:15pm', building: 'CSI', room: '2110' }] }
        }
      ];
      const tightItems = [
        {
          course: { code: 'CMSC 131', title: 'Programming I' },
          section: { section_id: 'CMSC131-0301', number: '0301', meetings: [{ days: 'M', start_time: '9:00am', end_time: '10:00am', building: 'IRB', room: '1101' }] }
        },
        {
          course: { code: 'ENGL 101', title: 'Academic Writing' },
          section: { section_id: 'ENGL101-0301', number: '0301', meetings: [{ days: 'M', start_time: '10:05am', end_time: '10:55am', building: 'VMH', room: '1200' }] }
        }
      ];
      const compact = scheduleTimingFit(compactItems, timingPrefs, []);
      const idle = scheduleTimingFit(idleItems, timingPrefs, []);
      const tight = scheduleTimingFit(tightItems, timingPrefs, []);
      const comparison = scheduleAlternativeComparison(
        { items: compactItems, conflicts: [], warnings: [], openSeats: 22, timing: compact, locationIssues: 0 },
        { items: idleItems, conflicts: [], warnings: ['Long idle gap'], openSeats: 12, timing: idle, locationIssues: 0 },
        timingPrefs
      );
      const altChange = recordPlanChange({
        type: 'auto-pick',
        source: 'Schedule',
        title: 'Applied alternate schedule 1',
        detail: '2 sections applied with 0 conflicts, 0 warnings, and 100/100 timing fit.',
        meta: '22 open seats across picked sections',
        highlights: comparison.lines,
      }, { save: false });
      const changeDigestHtml = scheduleChangeDigestHtml([altChange], 'Advisor context');
      const changeDigestText = scheduleRecentChangesText([altChange]).join(' | ');
      const advisorDiagnosticHtml = scheduleAdvisorTimingDiagnosticsHtml(idle);
      const advisorDiagnosticText = scheduleAdvisorTimingDiagnosticsText(idle).join(' | ');
      const thursdaySection = {
        section_id: 'TEST101-0101',
        number: '0101',
        course: 'TEST101',
        meetings: [{ days: 'TH', start_time: '11:00am', end_time: '12:15pm', building: 'ESJ', room: '1201' }],
      };
      const thursdayBlocks = sectionBlocks(thursdaySection, { code: 'TEST 101', title: 'Thursday Lab' });
      const thursdayCalendar = buildScheduleCalendarIcs(
        { id: 'PASS155F', name: 'Fall 2026' },
        '202608',
        [{ course: { code: 'TEST 101', title: 'Thursday Lab' }, section: thursdaySection }],
        { ...DEFAULT_SCHEDULE_PREFS, calendarStart: '2026-09-02', calendarEnd: '2026-12-14' }
      ).replace(/\\r?\\n /g, '');
      const dayVariants = {
        uppercaseTh: parseMeetingDays('TH').join(','),
        registrarR: parseMeetingDays('R').join(','),
        compactTTh: parseMeetingDays('TTh').join(','),
        verbose: parseMeetingDays('Tuesday Thursday').join(','),
        slashed: parseMeetingDays('Mon/Wed/Fri').join(','),
        tbaCount: parseMeetingDays('TBA').length,
      };
      return {
        compactScore: compact.score,
        idleScore: idle.score,
        compactIdle: compact.metrics.totalIdle,
        idleTotal: idle.metrics.totalIdle,
        idleInsight: idle.insights.join(' | '),
        tightTransitions: tight.metrics.tightTransitions,
        tightInsight: tight.insights.join(' | '),
        comparisonLines: comparison.lines.join(' | '),
        comparisonTimingDelta: comparison.timingDelta,
        comparisonWarningDelta: comparison.warningDelta,
        comparisonOpenSeatDelta: comparison.openSeatDelta,
        changeHighlightCount: altChange.highlights.length,
        changeDigestHtml,
        changeDigestText,
        advisorDiagnosticHtml,
        advisorDiagnosticText,
        dayVariants,
        thursdayBlocks,
        thursdayCalendar,
      };
    })()
  `, context));

  assert(result.dayVariants.uppercaseTh === 'Th', 'meeting days: uppercase TH should parse as Thursday');
  assert(result.dayVariants.registrarR === 'Th', 'meeting days: registrar R shorthand should parse as Thursday');
  assert(result.dayVariants.compactTTh === 'Tu,Th', 'meeting days: compact TTh should parse as Tuesday and Thursday');
  assert(result.dayVariants.verbose === 'Tu,Th', 'meeting days: verbose Tuesday Thursday should parse both days');
  assert(result.dayVariants.slashed === 'M,W,F', 'meeting days: slashed weekdays should parse in order');
  assert(result.dayVariants.tbaCount === 0, 'meeting days: TBA should stay untimed');
  assert(result.thursdayBlocks.length === 1 && result.thursdayBlocks[0].day === 'Th', 'section blocks: uppercase TH should create one Thursday block');
  assert(/DTSTART;TZID=America\/New_York:20260903T110000/.test(result.thursdayCalendar), 'schedule calendar: uppercase TH should start on the first Thursday in range');
  assert(/RRULE:FREQ=WEEKLY;BYDAY=TH;UNTIL=20261214T235900/.test(result.thursdayCalendar), 'schedule calendar: uppercase TH should recur on Thursday');
  assert(result.compactScore > result.idleScore, 'schedule timing: compact schedule should score above idle schedule');
  assert(result.idleTotal > result.compactIdle, 'schedule timing: idle schedule should report more idle time');
  assert(/idle gap|idle time/i.test(result.idleInsight), 'schedule timing: idle insight should mention idle time');
  assert(result.tightTransitions >= 1, 'schedule timing: tight cross-campus transition should be counted');
  assert(/estimated walk|between CMSC 131 and ENGL 101/i.test(result.tightInsight), 'schedule timing: tight insight should explain transition');
  assert(result.comparisonTimingDelta > 0, 'schedule alternatives: comparison should report timing improvement');
  assert(result.comparisonWarningDelta < 0, 'schedule alternatives: comparison should report warning reduction');
  assert(result.comparisonOpenSeatDelta > 0, 'schedule alternatives: comparison should report open-seat gain');
  assert(/Improves timing fit|Saves|open seats/i.test(result.comparisonLines), 'schedule alternatives: comparison should explain why option is better');
  assert(result.changeHighlightCount >= 2, 'schedule alternatives: applied alternate change should retain comparison highlights');
  assert(/schedule-change-highlights/.test(result.changeDigestHtml), 'schedule alternatives: advisor change digest should render highlight bullets');
  assert(/Improves timing fit|open seats/i.test(result.changeDigestHtml), 'schedule alternatives: advisor change digest should include comparison details');
  assert(/Improves timing fit|open seats/i.test(result.changeDigestText), 'schedule alternatives: recent-change text should include comparison details');
  assert(/Timing Diagnostics/.test(result.advisorDiagnosticHtml), 'schedule advisor diagnostics: HTML should include a timing diagnostics section');
  assert(/Active days/.test(result.advisorDiagnosticHtml) && /Advisor follow-up/.test(result.advisorDiagnosticHtml), 'schedule advisor diagnostics: HTML should include metrics and follow-up');
  assert(/idle gap|tighter lecture/i.test(result.advisorDiagnosticHtml), 'schedule advisor diagnostics: HTML should explain idle-time review');
  assert(/Timing diagnostics/.test(result.advisorDiagnosticText) && /Follow-up/i.test(result.advisorDiagnosticText), 'schedule advisor diagnostics: text should include timing follow-up');

  return {
    id: 'SCHEDULE-TIMING',
    compactScore: result.compactScore,
    idleScore: result.idleScore,
    tightTransitions: result.tightTransitions,
    comparisonTimingDelta: result.comparisonTimingDelta,
  };
}

function testScheduleRegistrationReadiness(context) {
  const result = clone(vm.runInContext(`
    (() => {
      recoGenEdGaps = () => [];
      state.settings = normalizeSettings({ ...DEFAULT_SETTINGS, catalogYear: '2026-2027', programName: 'Readiness Plan', totalCredits: 120 });
      const courses = [
        { code: 'CMSC 131', title: 'Object-Oriented Programming I', cr: 4, kind: 'core', category: 'major-core', coreqs: ['CMSC 100'] },
        { code: 'MATH 140', title: 'Calculus I', cr: 4, kind: 'core', category: 'gened-fsma', prereqs: ['MATH 115'] },
        { code: 'ENGL 101', title: 'Academic Writing', cr: 3, kind: 'gened', category: 'gened-fspw' },
      ];
      const cmscSection = {
        course: 'CMSC131',
        section_id: 'CMSC131-0101',
        semester: '202608',
        number: '0101',
        instructors: ['Ada Lovelace'],
        meetings: [{ days: 'MW', start_time: '9:00am', end_time: '10:15am', building: 'IRB', room: '1101' }],
        open_seats: '16',
        seats: '30',
        waitlist: '0',
        restrictions: ['Restricted to Computer Science majors or permission of department.'],
      };
      const mathSection = {
        course: 'MATH140',
        section_id: 'MATH140-0201',
        semester: '202608',
        number: '0201',
	        instructors: ['Emmy Noether'],
	        meetings: [{ days: 'M', start_time: '9:30am', end_time: '10:45am', building: 'MTH', room: '0101' }],
	        open_seats: '0',
	        seats: '30',
	        waitlist: '4',
      };
      const mathBackup = {
        course: 'MATH140',
        section_id: 'MATH140-0301',
        semester: '202608',
        number: '0301',
        instructors: ['Sofya Kovalevskaya'],
        meetings: [{ days: 'TuTh', start_time: '11:00am', end_time: '12:15pm', building: 'MTH', room: '0102' }],
        open_seats: '18',
        seats: '30',
        waitlist: '0',
      };
      state.activeSchedule = [{
        id: 'PASS112F',
        name: 'Fall 2026',
        year: 'Year 1',
        courses
      }, {
        id: 'PASS112S',
        name: 'Spring 2027',
        year: 'Year 1',
        courses: [
          { code: 'CMSC 132', title: 'Object-Oriented Programming II', cr: 4, kind: 'core', category: 'major-core', prereqs: ['CMSC 131'] },
          { code: 'MATH 141', title: 'Calculus II', cr: 4, kind: 'core', category: 'major-core', prereqs: ['MATH 140'] },
        ],
      }];
      state.customCourses = [];
      state.courses = {};
      state.selectedSections = {};
      state.schedulePrefs = { PASS112F: { ...DEFAULT_SCHEDULE_PREFS, term: '202608', minBreak: 15, mode: 'balanced', calendarStart: '2026-09-02', calendarEnd: '2026-12-14', registrationDate: '2099-08-25', registrationTime: '09:30' } };
      state.scheduleOutputOptions = { preferences: true, warnings: true, unscheduled: true, recentChanges: false, auditIssues: true };
      state.scheduleAdvisorFilter = 'all';
      state.scheduleOutputPreset = 'personal';
      setSelectedSection('PASS112F', 'CMSC 131', cmscSection);
      setSelectedSection('PASS112F', 'MATH 140', mathSection);
      const prefs = getSchedulePrefs('PASS112F');
      const selectedItems = [
        { course: courses[0], section: cmscSection },
        { course: courses[1], section: mathSection },
      ];
      const { conflicts } = detectScheduleConflicts(selectedItems);
      const warnings = selectedScheduleWarnings(selectedItems, prefs);
      const readiness = scheduleRegistrationReadiness(courses, selectedItems, conflicts, warnings, prefs, null, 'PASS112F');
      const gateMap = Object.fromEntries(readiness.gates.map(gate => [gate.id, gate]));
      const html = scheduleRegistrationReadinessHtml(readiness);
      const text = scheduleRegistrationReadinessText(readiness).join('\\n');
      const sectionsByCode = {
        CMSC131: [cmscSection],
        MATH140: [mathSection, mathBackup],
        ENGL101: [],
      };
      const now = Date.now();
      scheduleSectionsMeta[scheduleSectionCacheKey('PASS112F', '202608', 'CMSC 131')] = { fetchedAt: new Date(now - (4 * 60 * 1000)).toISOString(), source: 'fixture', count: 1 };
      scheduleSectionsMeta[scheduleSectionCacheKey('PASS112F', '202608', 'MATH 140')] = { fetchedAt: new Date(now - (90 * 60 * 1000)).toISOString(), source: 'fixture', count: 2 };
      scheduleSectionsMeta[scheduleSectionCacheKey('PASS112F', '202608', 'ENGL 101')] = { fetchedAt: new Date(now - (8 * 60 * 1000)).toISOString(), source: 'fixture', count: 0 };
      const output = buildScheduleOutput('PASS112F', '202608', courses, selectedItems, conflicts, warnings, prefs, sectionsByCode);
      const mapRows = scheduleReadinessMapRows('PASS112F', '202608', courses, selectedItems, conflicts, warnings, sectionsByCode);
      const mapFall = mapRows.find(row => row.sem.id === 'PASS112F');
      const mapSpring = mapRows.find(row => row.sem.id === 'PASS112S');
      const mapTargets = scheduleReadinessMapLoadTargets('PASS112F');
      scheduleSectionsCache[scheduleSectionCacheKey('PASS112S', '202701', 'CMSC 132')] = [{
        course: 'CMSC132',
        section_id: 'CMSC132-0101',
        semester: '202701',
        number: '0101',
        meetings: [{ days: 'TuTh', start_time: '10:00am', end_time: '11:15am', building: 'IRB', room: '1207' }],
        open_seats: '16',
        seats: '32',
        waitlist: '0',
      }];
      scheduleSectionsCache[scheduleSectionCacheKey('PASS112S', '202701', 'MATH 141')] = [{
        course: 'MATH141',
        section_id: 'MATH141-0201',
        semester: '202701',
        number: '0201',
        meetings: [{ days: 'MWF', start_time: '11:00am', end_time: '11:50am', building: 'MTH', room: '0101' }],
        open_seats: '14',
        seats: '30',
        waitlist: '0',
      }];
      const pickTargets = scheduleReadinessMapPickTargets('PASS112F');
      return {
        level: readiness.level,
        label: readiness.label,
        detail: readiness.detail,
        fixes: readiness.fixes,
        actions: readiness.actions.map(action => action.id),
        gateLevels: Object.fromEntries(readiness.gates.map(gate => [gate.id, gate.level])),
        sectionsDetail: gateMap.sections.detail,
        creditsDetail: gateMap.credits.detail,
        prereqsDetail: gateMap.prereqs.detail,
        coreqsDetail: gateMap.coreqs.detail,
        conflictsDetail: gateMap.conflicts.detail,
        seatsDetail: gateMap.seats.detail,
        eligibilityDetail: gateMap.eligibility.detail,
        timingDetail: gateMap.timing.detail,
        html,
        text,
        outputHtml: output.html,
        outputText: output.text,
	        outputRegistrationAppointment: output.registrationAppointment,
	        outputSeatFreshness: output.seatFreshness,
	        outputWaitlistStrategy: output.waitlistStrategy,
	        outputRegistrationHandoff: output.registrationHandoff,
        outputRegistrationOrder: output.registrationOrder,
        outputRegistrationBackupPlan: output.registrationBackupPlan,
        outputFinalChecklist: output.finalChecklist,
        outputWorkloadBalance: output.workloadBalance,
        outputRegistrationText: output.registrationText,
        outputRegistrationFilename: output.registrationFilename,
        outputCalendar: output.calendar,
        outputCalendarUnfolded: output.calendar.replace(/\\r?\\n /g, ''),
        outputCalendarFilename: output.calendarFilename,
        outputCalendarEventCount: output.calendarEventCount,
        outputCalendarSummary: output.calendarSummary,
        advisorHtml: output.advisorHtml,
        advisorText: output.advisorText,
        advisorDocument: output.advisorDocument,
        map: {
          count: mapRows.length,
          fallLevel: mapFall?.readiness?.level,
          fallStatus: mapFall?.status?.label,
          fallPicked: (mapFall?.selectedItems?.length || 0) + '/' + (mapFall?.courses?.length || 0),
          fallLoaded: (mapFall?.loadedCount || 0) + '/' + (mapFall?.courses?.length || 0),
          fallPostedCount: mapFall?.postedCount,
          springLevel: mapSpring?.readiness?.level,
          springStatus: mapSpring?.status?.label,
          springPicked: (mapSpring?.selectedItems?.length || 0) + '/' + (mapSpring?.courses?.length || 0),
          springLoaded: (mapSpring?.loadedCount || 0) + '/' + (mapSpring?.courses?.length || 0),
          loadTargets: mapTargets.map(row => row.sem.id + ':' + row.loadedCount + '/' + row.courses.length).join(','),
          pickTargets: pickTargets.map(row => row.sem.id + ':' + row.selectedItems.length + '/' + row.courses.length).join(','),
        },
      };
    })()
  `, context));

  assert(result.level === 'danger' && result.label === 'Fix before registration', 'registration readiness: blocker scenario should require fixes');
  assert(result.gateLevels.sections === 'danger', 'registration readiness: unpicked current-term course should block registration');
  assert(result.gateLevels.credits === 'warn', 'registration readiness: below-full-time load should warn on credit gate');
  assert(result.gateLevels.prereqs === 'danger', 'registration readiness: missing prerequisite should block registration');
  assert(result.gateLevels.coreqs === 'danger', 'registration readiness: missing corequisite should block registration');
  assert(result.gateLevels.conflicts === 'danger', 'registration readiness: picked-section conflict should block registration');
  assert(result.gateLevels.seats === 'danger', 'registration readiness: low-seat section should block registration');
  assert(result.gateLevels.eligibility === 'danger', 'registration readiness: restricted picked section should block eligibility gate');
  assert(/ENGL 101/.test(result.sectionsDetail), 'registration readiness: sections gate should name the unpicked course');
  assert(/8\/11 credits/.test(result.creditsDetail) && /12-credit/.test(result.creditsDetail), 'registration readiness: credit gate should explain below-full-time load');
  assert(/MATH 140/.test(result.prereqsDetail) && /MATH 115/.test(result.prereqsDetail), 'registration readiness: prereq gate should name the missing prerequisite');
  assert(/CMSC 131/.test(result.coreqsDetail) && /CMSC 100/.test(result.coreqsDetail), 'registration readiness: coreq gate should name the missing corequisite');
  assert(/1 overlap/.test(result.conflictsDetail), 'registration readiness: conflicts gate should summarize overlap count');
  assert(/MATH 140 0201: 0 open.*4 waitlisted/.test(result.seatsDetail), 'registration readiness: seats gate should name the waitlisted section');
  assert(/CMSC 131 0101/.test(result.eligibilityDetail) && /Computer Science majors/.test(result.eligibilityDetail), 'registration readiness: eligibility gate should name the restricted section');
  assert(result.fixes.length >= 3, 'registration readiness: blocker scenario should produce multiple recommended fixes');
  assert(result.fixes.some(fix => /Pick sections for ENGL 101/.test(fix)), 'registration readiness: fixes should include missing section action');
  assert(result.fixes.some(fix => /full-time status|reduced-load/.test(fix)), 'registration readiness: fixes should include credit-load review action');
  assert(result.fixes.some(fix => /missing prerequisites/.test(fix)), 'registration readiness: fixes should include prerequisite action');
  assert(result.fixes.some(fix => /required corequisites/.test(fix)), 'registration readiness: fixes should include corequisite action');
  assert(result.fixes.some(fix => /overlapping section|0 conflicts/.test(fix)), 'registration readiness: fixes should include conflict action');
  assert(result.fixes.some(fix => /backup section|higher-seat/.test(fix)), 'registration readiness: fixes should include seat-risk action');
  assert(result.fixes.some(fix => /Confirm Testudo eligibility/.test(fix)), 'registration readiness: fixes should include eligibility confirmation action');
  assert(result.actions.includes('auto-pick'), 'registration readiness: actions should include auto-pick for missing sections');
  assert(result.actions.includes('alternatives'), 'registration readiness: actions should include alternatives for conflicts/timing');
  assert(result.actions.includes('review-sections'), 'registration readiness: actions should include section review for picks and backups');
  assert(/Registration Readiness/.test(result.html) && /Fix before registration/.test(result.html), 'registration readiness: HTML should render overall status');
  assert(/Recommended fixes/.test(result.html) && /Pick sections for ENGL 101/.test(result.html), 'registration readiness: HTML should render recommended fixes');
  assert(/Quick actions/.test(result.html) && /data-readiness-action="auto-pick"/.test(result.html), 'registration readiness: HTML should render quick actions');
  assert(/Registration readiness/.test(result.text) && result.text.includes('Sections: 2/3'), 'registration readiness: text should include gate lines');
  assert(/Credits: 8\/11 cr/.test(result.text) && /12-credit/.test(result.text), 'registration readiness: text should include credit-load gate line');
  assert(/Prereqs: 2\/3/.test(result.text) && /MATH 115/.test(result.text), 'registration readiness: text should include prereq gate line');
  assert(/Coreqs: 2\/3/.test(result.text) && /CMSC 100/.test(result.text), 'registration readiness: text should include coreq gate line');
  assert(/Eligibility: 1\/2/.test(result.text) && /Computer Science majors/.test(result.text), 'registration readiness: text should include eligibility gate line');
  assert(/Fix: Pick sections for ENGL 101/.test(result.text), 'registration readiness: text should include recommended fixes');
  assert(/Registration Readiness/.test(result.outputHtml) && /Seat risk/.test(result.outputHtml), 'registration readiness: schedule output HTML should include readiness gates');
  assert(/Recommended fixes/.test(result.outputHtml) && /Generate alternatives/.test(result.outputHtml), 'registration readiness: schedule output HTML should include fix guidance');
  assert(/Quick actions/.test(result.outputHtml) && /data-readiness-action="alternatives"/.test(result.outputHtml), 'registration readiness: schedule output HTML should include action buttons');
  assert(result.outputFinalChecklist?.label === 'Fix before Testudo' && result.outputFinalChecklist?.readyCount === 1 && result.outputFinalChecklist?.total === 8, 'final checklist: should summarize launch checks and blocker status');
  assert(result.outputFinalChecklist.items.some(item => item.id === 'credits' && item.level === 'warn' && /12-credit/.test(item.detail)), 'final checklist: should include credit-load warning');
  assert(result.outputFinalChecklist.items.some(item => item.id === 'backups' && item.level === 'warn' && /ready backup/.test(item.detail)), 'final checklist: should include ready backup warning');
  assert(result.outputFinalChecklist.items.some(item => item.id === 'waitlist' && item.level === 'warn' && /waitlist strategy/i.test(item.detail)), 'final checklist: should include waitlist strategy warning');
  assert(/Final Registration Checklist/.test(result.outputHtml) && /1\/8/.test(result.outputHtml) && /launch checks ready/.test(result.outputHtml), 'final checklist: schedule output HTML should include launch readiness score');
  assert(/Final registration checklist:[\s\S]*Overall: Fix before Testudo[\s\S]*Credit load: WARN[\s\S]*Seat freshness: DANGER[\s\S]*Waitlist strategy: WARN/.test(result.outputText), 'final checklist: schedule text should include final checklist rows');
  assert(result.outputWorkloadBalance?.label === 'Review workload' && result.outputWorkloadBalance?.pickedCredits === 8 && result.outputWorkloadBalance?.totalCredits === 11 && result.outputWorkloadBalance?.weeklyMinutes === 225 && result.outputWorkloadBalance?.missingCount === 1, 'workload balance: should summarize picked credits, weekly class time, and missing section evidence');
  assert(/Workload Balance/.test(result.outputHtml) && /8\/11/.test(result.outputHtml) && /3 hr 45 min/.test(result.outputHtml), 'workload balance: schedule output HTML should include workload card metrics');
  assert(/Workload balance:[\s\S]*Overall: Review workload[\s\S]*8\/11 credits[\s\S]*Mon: 2 hr 30 min/.test(result.outputText), 'workload balance: schedule text should include workload rows');
  assert(/Prereqs: MATH 140: missing MATH 115/.test(result.outputText), 'registration prereqs: schedule text should include missing prerequisite notes');
  assert(/Coreqs: CMSC 131:[^\n]*CMSC 100/.test(result.outputText), 'registration coreqs: schedule text should include missing corequisite notes');
  assert(/Eligibility: Restricted to Computer Science majors/.test(result.outputText), 'registration eligibility: schedule text should include section restriction notes');
  assert(result.outputRegistrationAppointment?.label === 'Scheduled' && /Aug 25, 2099 at 9:30am/.test(result.outputRegistrationAppointment.when), 'registration appointment: should summarize saved Testudo time');
  assert(/Registration Appointment/.test(result.outputHtml) && /Aug 25, 2099 at 9:30am/.test(result.outputHtml), 'registration appointment: schedule output HTML should include saved appointment');
  assert(/Registration appointment:[\s\S]*Scheduled: Aug 25, 2099 at 9:30am/.test(result.outputText), 'registration appointment: schedule text should include appointment checklist');
  assert(result.outputSeatFreshness?.level === 'danger' && result.outputSeatFreshness.rows.some(row => row.code === 'MATH 140' && row.level === 'danger'), 'seat freshness: stale section data should require refresh');
  assert(/Seat Data Freshness/.test(result.outputHtml) && /MATH 140/.test(result.outputHtml) && /Stale/.test(result.outputHtml), 'seat freshness: schedule output HTML should include stale course refresh status');
  assert(/data-seat-freshness-action="refresh"/.test(result.outputHtml) && /Refresh sections now/.test(result.outputHtml), 'seat freshness: schedule output HTML should include refresh action');
  assert(/Seat data freshness:[\s\S]*Overall: Refresh seats/.test(result.outputText), 'seat freshness: schedule text should include refresh warning');
  assert(/Action: Refresh sections in Terp Track shortly before opening Testudo/.test(result.outputText), 'seat freshness: schedule text should include refresh action guidance');
  assert(result.outputWaitlistStrategy?.level === 'warn' && result.outputWaitlistStrategy.rows.some(row => row.courseCode === 'MATH 140' && row.waitlistCount === 4 && row.backupId === 'MATH140-0301'), 'waitlist strategy: should keep waitlisted picks tied to ready backups');
  assert(/Waitlist Strategy/.test(result.outputHtml) && /MATH 140 0201/.test(result.outputHtml) && /4 waitlisted/.test(result.outputHtml) && /Backup 0301/.test(result.outputHtml), 'waitlist strategy: schedule output HTML should include waitlist and backup evidence');
  assert(/Waitlist strategy:[\s\S]*MATH 140 0201: 0 open.*4 waitlisted[\s\S]*Backup ID MATH140-0301/.test(result.outputText), 'waitlist strategy: schedule text should include waitlist backup handoff');
  assert(result.outputRegistrationHandoff[0]?.courseCode === 'MATH 140' && result.outputRegistrationHandoff[0]?.sectionId === 'MATH140-0201', 'testudo queue: should order exact section IDs by registration priority');
  assert(/MATH 115/.test(result.outputRegistrationHandoff[0]?.prereqDetail || ''), 'testudo queue: should include missing prerequisite detail');
  assert(result.outputRegistrationHandoff.some(row => row.courseCode === 'CMSC 131' && /CMSC 100/.test(row.coreqDetail || '')), 'testudo queue: should include missing corequisite detail');
  assert(/Testudo Entry Queue/.test(result.outputHtml) && /Section ID MATH140-0201/.test(result.outputHtml), 'testudo queue: schedule output HTML should include exact section IDs');
  assert(/Prereqs:[\s\S]*MATH 115/.test(result.outputHtml), 'registration prereqs: schedule output HTML should include prerequisite notes');
  assert(/Coreqs:[\s\S]*CMSC 100/.test(result.outputHtml), 'registration coreqs: schedule output HTML should include corequisite notes');
  assert(/Eligibility:[\s\S]*Computer Science majors/.test(result.outputHtml), 'registration eligibility: schedule output HTML should include eligibility notes');
  assert(/Testudo entry queue:[\s\S]*1\. MATH 140 0201 \| Section ID: MATH140-0201/.test(result.outputText), 'testudo queue: schedule text should include ordered section IDs');
  assert(result.outputRegistrationHandoff.some(row => row.courseCode === 'CMSC 131' && row.status === 'blocked' && /Computer Science majors/.test(row.eligibilityDetail || '')), 'testudo queue: restricted section should be blocked until eligibility is confirmed');
  assert(result.outputRegistrationOrder[0]?.courseCode === 'MATH 140' && result.outputRegistrationOrder[0]?.label === 'Resolve first', 'registration order: low-seat conflicting section should be first');
  assert(result.outputRegistrationOrder.some(row => row.courseCode === 'CMSC 131' && row.unlockCount === 1), 'registration order: should count later prerequisite unlocks');
  assert(/Enrollment Order/.test(result.outputHtml) && /MATH 140 0201/.test(result.outputHtml), 'registration order: schedule output HTML should include ranked section rows');
  assert(/Suggested enrollment order:[\s\S]*1\. MATH 140 0201/.test(result.outputText), 'registration order: schedule text should include ordered registration handoff');
  assert(/Why: [^\n]*unlocks 1 later course/.test(result.outputText), 'registration order: schedule text should explain prerequisite unlocks');
  assert(result.outputRegistrationBackupPlan[0]?.courseCode === 'MATH 140' && result.outputRegistrationBackupPlan[0]?.backupId === 'MATH140-0301', 'backup plan: should choose conflict-safe higher-seat backup section');
  assert(/Backup Plan/.test(result.outputHtml) && /Backup 0301/.test(result.outputHtml) && /18 seats open/.test(result.outputHtml), 'backup plan: schedule output HTML should include backup section and seats');
  assert(/data-backup-action="apply-ready"/.test(result.outputHtml) && /Apply ready backups/.test(result.outputHtml), 'backup plan: schedule output HTML should include ready-backup apply action');
  assert(/Backup sections:[\s\S]*MATH 140 primary 0201:[\s\S]*Backup: 0301; Section ID MATH140-0301/.test(result.outputText), 'backup plan: schedule text should include backup handoff');
  assert(/^terp-track-registration-.*fall-2026\.txt$/.test(result.outputRegistrationFilename), 'registration list: filename should be a term-specific .txt export');
  assert(/Terp Track Registration List/.test(result.outputRegistrationText) && /Testudo checklist/.test(result.outputRegistrationText), 'registration list: text should identify itself as a Testudo checklist');
  assert(/Posted UMD term: Fall 2026 \(202608\)/.test(result.outputRegistrationText), 'registration list: text should include posted UMD term code');
  assert(/Registration appointment: Scheduled - Aug 25, 2099 at 9:30am/.test(result.outputRegistrationText), 'registration list: text should include appointment summary');
  assert(/Seat data freshness:[\s\S]*MATH 140: 1 hr 30 min ago/.test(result.outputRegistrationText), 'registration list: text should include seat data freshness');
  assert(/Action: Refresh sections in Terp Track shortly before opening Testudo/.test(result.outputRegistrationText), 'registration list: text should include seat refresh action guidance');
  assert(/Waitlist strategy:[\s\S]*MATH 140 0201: 0 open.*4 waitlisted[\s\S]*Backup ID MATH140-0301/.test(result.outputRegistrationText), 'registration list: text should include waitlist strategy handoff');
  assert(/Plan readiness map:[\s\S]*Fall 2026 \(Fall 2026\): Needs sections[\s\S]*Spring 2027 \(Spring 2027\): Needs sections/.test(result.outputRegistrationText), 'registration list: text should include plan-wide readiness map rows');
  assert(/Testudo entry queue:[\s\S]*1\. MATH 140 0201 \| Section ID: MATH140-0201/.test(result.outputRegistrationText), 'registration list: text should include Testudo entry queue');
  assert(/CMSC 131 \| Section 0101 \| Section ID CMSC131-0101/.test(result.outputRegistrationText), 'registration list: text should include course section and section ID');
  assert(/Prereqs: MATH 140: missing MATH 115/.test(result.outputRegistrationText), 'registration list: text should include prerequisite notes');
  assert(/Coreqs: CMSC 131:[^\n]*CMSC 100/.test(result.outputRegistrationText), 'registration list: text should include corequisite notes');
  assert(/Eligibility: Restricted to Computer Science majors/.test(result.outputRegistrationText), 'registration list: text should include eligibility notes');
  assert(/Missing section picks:[\s\S]*ENGL 101/.test(result.outputRegistrationText), 'registration list: text should include missing section picks');
  assert(/Conflicts to resolve before registration:[\s\S]*CMSC 131 overlaps MATH 140/.test(result.outputRegistrationText), 'registration list: text should include conflict handoff');
  assert(/MATH 140 0201: 0 open.*4 waitlisted/.test(result.outputRegistrationText), 'registration list: text should include waitlist warning');
  assert(/Suggested enrollment order:[\s\S]*1\. MATH 140 0201/.test(result.outputRegistrationText), 'registration list: text should include the enrollment order');
  assert(/Final registration checklist:[\s\S]*1\/8 launch checks ready[\s\S]*Credit load: WARN[\s\S]*Testudo entry queue: DANGER/.test(result.outputRegistrationText), 'registration list: text should include final launch checklist');
  assert(/Workload balance:[\s\S]*3 hr 45 min weekly class time[\s\S]*1 course still needs picked sections/.test(result.outputRegistrationText), 'registration list: text should include workload balance evidence');
  assert(/Backup sections:[\s\S]*MATH 140 primary 0201:[\s\S]*Backup: 0301; Section ID MATH140-0301/.test(result.outputRegistrationText), 'registration list: text should include backup section handoff');
  assert(/Have 1 backup section ready in Testudo/.test(result.outputRegistrationText), 'registration appointment: should reference backup readiness');
  assert(/Backup ID: MATH140-0301/.test(result.outputRegistrationText), 'testudo queue: registration list should include backup ID');
  assert(/Before submitting in Testudo:[\s\S]*Confirm credit load, open seats/.test(result.outputRegistrationText), 'registration list: text should include final Testudo checks');
  assert(/^terp-track-calendar-.*fall-2026\.ics$/.test(result.outputCalendarFilename), 'schedule calendar: filename should be an .ics calendar export');
  assert(result.outputCalendarEventCount === 3, 'schedule calendar: two CMSC meetings and one MATH meeting should produce three VEVENTs');
  assert(result.outputCalendarSummary?.label === 'Calendar incomplete' && result.outputCalendarSummary.eventCount === 3, 'calendar export readiness: summary should report incomplete calendar event count');
  assert(result.outputCalendarSummary?.windowLabel === 'Sep 2, 2026 to Dec 14, 2026', 'calendar export readiness: summary should expose custom calendar range');
  assert(result.outputCalendarSummary?.timedCourseCount === 2 && result.outputCalendarSummary?.courseCount === 3 && result.outputCalendarSummary?.missingCount === 1 && result.outputCalendarSummary?.omittedCount === 1, 'calendar export readiness: summary should count timed and omitted planned courses');
  assert(/Calendar Export[\s\S]*Sep 2, 2026 to Dec 14, 2026[\s\S]*calendar events[\s\S]*data-calendar-export-action="auto-fill-omissions"[\s\S]*data-calendar-export-action="review-omissions"/.test(result.outputHtml), 'calendar export readiness: schedule output HTML should include event count, range, and omission actions');
  assert(/Calendar export:[\s\S]*Calendar incomplete: 3 weekly events across 2\/3 planned courses; 1 course still needs a section/.test(result.outputText), 'calendar export readiness: schedule text should include event count and omitted planned course');
  assert(/Action: Pick sections or replace TBA meetings for omitted courses before relying on the calendar export/.test(result.outputText), 'calendar export readiness: schedule text should include omission action guidance');
  assert(/Calendar export:[\s\S]*Range: Sep 2, 2026 to Dec 14, 2026/.test(result.outputRegistrationText), 'calendar export readiness: registration list should include calendar range');
  assert(/Calendar export:[\s\S]*ENGL 101 Missing section: omitted from calendar until a section is picked/.test(result.outputRegistrationText), 'calendar export readiness: registration list should include missing-section omission');
  assert(/BEGIN:VCALENDAR/.test(result.outputCalendarUnfolded) && /BEGIN:VEVENT/.test(result.outputCalendarUnfolded), 'schedule calendar: ICS should include calendar and event records');
  assert(/SUMMARY:CMSC 131 0101/.test(result.outputCalendarUnfolded), 'schedule calendar: ICS should include course and section summary');
  assert(/DTSTART;TZID=America\/New_York:20260902T090000/.test(result.outputCalendarUnfolded), 'schedule calendar: custom Fall 2026 range should start Wednesday classes on the configured start date');
  assert(/RRULE:FREQ=WEEKLY;BYDAY=WE;UNTIL=20261214T235900/.test(result.outputCalendarUnfolded), 'schedule calendar: ICS should recur weekly through the configured custom range');
  assert(/LOCATION:IRB 1101/.test(result.outputCalendarUnfolded), 'schedule calendar: ICS should include classroom location');
  assert(/Calendar range set in Terp Track: 2026-09-02 to 2026-12-14/.test(result.outputCalendarUnfolded), 'schedule calendar: ICS should record custom calendar range');
  assert(/Confirm exact academic-calendar dates with UMD/i.test(result.outputCalendarUnfolded), 'schedule calendar: ICS should warn that term dates need official UMD confirmation');
  assert(/Registration readiness/.test(result.outputText) && /Conflicts: 1/.test(result.outputText), 'registration readiness: schedule text should include readiness gates');
  assert(/Fix: Apply a backup section/.test(result.outputText), 'registration readiness: schedule text should include fix guidance');
  assert(/Registration Readiness/.test(result.advisorHtml) && /Fix before registration/.test(result.advisorHtml), 'registration readiness: advisor HTML should include readiness gates');
  assert(/Prereqs:[\s\S]*MATH 115/.test(result.advisorHtml), 'registration prereqs: advisor HTML should include prerequisite notes');
  assert(/Coreqs:[\s\S]*CMSC 100/.test(result.advisorHtml), 'registration coreqs: advisor HTML should include corequisite notes');
  assert(/Eligibility:[\s\S]*Computer Science majors/.test(result.advisorHtml), 'registration eligibility: advisor HTML should include eligibility notes');
		  assert(/schedule-advisor-readiness-map/.test(result.advisorHtml) && /Plan Readiness Map/.test(result.advisorHtml) && /Spring 2027/.test(result.advisorHtml), 'readiness map export: advisor HTML should include plan-wide readiness map');
  assert(/Final Registration Checklist/.test(result.advisorHtml) && /Fix before Testudo/.test(result.advisorHtml), 'final checklist: advisor HTML should include final checklist');
  assert(/Workload Balance/.test(result.advisorHtml) && /Review workload/.test(result.advisorHtml) && /3 hr 45 min/.test(result.advisorHtml), 'workload balance: advisor HTML should include workload card');
		  assert(/Registration Appointment/.test(result.advisorHtml) && /Aug 25, 2099 at 9:30am/.test(result.advisorHtml), 'registration appointment: advisor HTML should include saved appointment');
  assert(/Seat Data Freshness/.test(result.advisorHtml) && /Refresh seats/.test(result.advisorHtml), 'seat freshness: advisor HTML should include freshness card');
  assert(/Waitlist Strategy/.test(result.advisorHtml) && /MATH 140 0201/.test(result.advisorHtml) && /Backup 0301/.test(result.advisorHtml), 'waitlist strategy: advisor HTML should include waitlist backup card');
  assert(/Calendar Export/.test(result.advisorHtml) && /Calendar incomplete/.test(result.advisorHtml) && /Auto-fill timed sections/.test(result.advisorHtml) && /Review omitted courses/.test(result.advisorHtml), 'calendar export readiness: advisor HTML should include calendar omission actions');
  assert(/data-seat-freshness-action="refresh"/.test(result.advisorHtml), 'seat freshness: advisor HTML should include refresh action');
  assert(/Testudo Entry Queue/.test(result.advisorHtml) && /Section ID MATH140-0201/.test(result.advisorHtml), 'testudo queue: advisor HTML should include exact section IDs');
  assert(/Quick actions/.test(result.advisorHtml) && /Review section picks/.test(result.advisorHtml), 'registration readiness: advisor HTML should include readiness quick actions');
  assert(/Registration readiness/.test(result.advisorText) && result.advisorText.includes('Sections: 2/3'), 'registration readiness: advisor text should include readiness gates');
  assert(/Prereqs: 2\/3[\s\S]*MATH 115/.test(result.advisorText), 'registration prereqs: advisor text should include prerequisite gate');
  assert(/Coreqs: 2\/3[\s\S]*CMSC 100/.test(result.advisorText), 'registration coreqs: advisor text should include corequisite gate');
  assert(/Eligibility: 1\/2[\s\S]*Computer Science majors/.test(result.advisorText), 'registration eligibility: advisor text should include eligibility gate');
	  assert(/Plan readiness map:[\s\S]*Summary: 0\/2 terms registration-ready/.test(result.advisorText), 'readiness map export: advisor text should include plan-wide readiness summary');
	  assert(/Registration appointment:[\s\S]*Use the registration list to submit exact section IDs/.test(result.advisorText), 'registration appointment: advisor text should include appointment checklist');
  assert(/Seat data freshness:[\s\S]*MATH 140: 1 hr 30 min ago/.test(result.advisorText), 'seat freshness: advisor text should include stale course refresh status');
  assert(/Waitlist strategy:[\s\S]*MATH 140 0201: 0 open.*4 waitlisted/.test(result.advisorText), 'waitlist strategy: advisor text should include waitlist handoff');
  assert(/Calendar export:[\s\S]*CMSC 131 0101: 2 calendar events/.test(result.advisorText), 'calendar export readiness: advisor text should include course event rows');
  assert(/Calendar export:[\s\S]*ENGL 101 Missing section: omitted from calendar until a section is picked/.test(result.advisorText), 'calendar export readiness: advisor text should include missing-section omission');
  assert(/Final registration checklist:[\s\S]*Credit load: WARN[\s\S]*Waitlist strategy: WARN[\s\S]*Calendar export: WARN/.test(result.advisorText), 'final checklist: advisor text should include calendar launch warning');
  assert(/Workload balance:[\s\S]*Metrics: 8\/11 credits; 3 hr 45 min weekly class time/.test(result.advisorText), 'workload balance: advisor text should include workload metrics');
  assert(/Action: Refresh sections in Terp Track shortly before opening Testudo/.test(result.advisorText), 'seat freshness: advisor text should include refresh action guidance');
  assert(/Testudo entry queue:[\s\S]*Section ID: MATH140-0201/.test(result.advisorText), 'testudo queue: advisor text should include exact section IDs');
  assert(/Fix: Pick sections for ENGL 101/.test(result.advisorText), 'registration readiness: advisor text should include recommended fixes');
  assert(/schedule-readiness/.test(result.advisorDocument) && /Recommended fixes/.test(result.advisorDocument), 'registration readiness: exported advisor document should include readiness markup and fixes');
  assert(/Prereqs:[\s\S]*MATH 115/.test(result.advisorDocument), 'registration prereqs: exported advisor document should include prerequisite notes');
  assert(/Coreqs:[\s\S]*CMSC 100/.test(result.advisorDocument), 'registration coreqs: exported advisor document should include corequisite notes');
  assert(/Eligibility:[\s\S]*Computer Science majors/.test(result.advisorDocument), 'registration eligibility: exported advisor document should include eligibility notes');
		  assert(/schedule-advisor-readiness-map/.test(result.advisorDocument) && /Plan Readiness Map/.test(result.advisorDocument), 'readiness map export: exported advisor document should include plan-wide readiness markup');
  assert(/schedule-final-checklist/.test(result.advisorDocument) && /Final Registration Checklist/.test(result.advisorDocument), 'final checklist: exported advisor document should include final checklist markup');
  assert(/schedule-workload-card/.test(result.advisorDocument) && /Workload Balance/.test(result.advisorDocument), 'workload balance: exported advisor document should include workload markup');
		  assert(/schedule-registration-appointment/.test(result.advisorDocument), 'registration appointment: exported advisor document should include appointment markup');
  assert(/schedule-seat-freshness/.test(result.advisorDocument), 'seat freshness: exported advisor document should include freshness markup');
  assert(/schedule-waitlist-strategy/.test(result.advisorDocument) && /Waitlist Strategy/.test(result.advisorDocument), 'waitlist strategy: exported advisor document should include waitlist markup');
  assert(/schedule-calendar-export/.test(result.advisorDocument) && /Calendar Export/.test(result.advisorDocument) && /data-calendar-export-action="auto-fill-omissions"/.test(result.advisorDocument) && /data-calendar-export-action="review-omissions"/.test(result.advisorDocument), 'calendar export readiness: exported advisor document should include calendar action markup');
  assert(/schedule-registration-backups/.test(result.advisorDocument) && /data-backup-action="apply-ready"/.test(result.advisorDocument), 'backup plan: exported advisor document should include ready-backup action markup');
  assert(/schedule-registration-handoff/.test(result.advisorDocument), 'testudo queue: exported advisor document should include queue markup');
  assert(/schedule-readiness-actions/.test(result.advisorDocument) && /data-readiness-action="review-sections"/.test(result.advisorDocument), 'registration readiness: exported advisor document should include quick-action markup');
  assert(result.map.count === 2, 'readiness map: should include every plan term');
  assert(result.map.fallLevel === 'danger' && result.map.fallStatus === 'Needs sections', 'readiness map: current term should expose missing section blocker');
  assert(result.map.fallPicked === '2/3' && result.map.fallLoaded === '3/3' && result.map.fallPostedCount === 3, 'readiness map: current term should summarize picked, loaded, and posted sections');
  assert(result.map.springLevel === 'danger' && result.map.springStatus === 'Needs sections', 'readiness map: future term should expose missing section work');
  assert(result.map.springPicked === '0/2' && result.map.springLoaded === '0/2', 'readiness map: future term should show no saved section evidence yet');
  assert(result.map.loadTargets === 'PASS112S:0/2', 'readiness map: loader should target only terms missing section evidence');
  assert(result.map.pickTargets === 'PASS112S:0/2', 'readiness map: auto-pick should target loaded non-active terms with missing picks');

  return {
    id: 'SCHEDULE-READINESS',
    label: result.label,
    gates: Object.entries(result.gateLevels).map(([key, level]) => `${key}:${level}`).join(','),
  };
}

function testScheduleReadinessMapUndo(context) {
  const result = clone(vm.runInContext(`
    (() => {
      const undoRoot = { innerHTML: '' };
      const originalGetElementById = document.getElementById;
      const originalRenderSchedule = renderSchedule;
      const originalRenderSemesters = typeof renderSemesters === 'function' ? renderSemesters : null;
      const originalToastInfo = typeof toastInfo === 'function' ? toastInfo : null;
      document.getElementById = id => {
        if (id === 'schedule-undo') return undoRoot;
        if (id === 'save-indicator') return { classList: { add() {}, remove() {} } };
        return null;
      };
      renderSchedule = () => renderScheduleUndo();
      renderSemesters = () => {};
      toastInfo = message => { window.__readinessUndoToast = message; };
      try {
        state.activeSchedule = [{
          id: 'UNDOF',
          name: 'Fall 2026',
          courses: [{ code: 'CMSC 131', title: 'Object-Oriented Programming I', cr: 4 }],
        }, {
          id: 'UNDOS',
          name: 'Spring 2027',
          courses: [
            { code: 'CMSC 132', title: 'Object-Oriented Programming II', cr: 4 },
            { code: 'MATH 141', title: 'Calculus II', cr: 4 },
          ],
        }];
        scheduleCurrentSemId = 'UNDOF';
        state.selectedSections = {};
        const cmscNext = {
          course: 'CMSC132',
          section_id: 'CMSC132-0101',
          semester: '202701',
          number: '0101',
          meetings: [{ days: 'TuTh', start_time: '10:00am', end_time: '11:15am', building: 'IRB', room: '1207' }],
          open_seats: '16',
          seats: '32',
          waitlist: '0',
        };
        const mathPrevious = {
          course: 'MATH141',
          section_id: 'MATH141-OLD',
          semester: '202608',
          number: 'OLD',
          meetings: [{ days: 'M', start_time: '8:00am', end_time: '8:50am', building: 'MTH', room: '0101' }],
          open_seats: '3',
          seats: '30',
          waitlist: '0',
        };
        const mathNext = {
          course: 'MATH141',
          section_id: 'MATH141-0201',
          semester: '202701',
          number: '0201',
          meetings: [{ days: 'MWF', start_time: '11:00am', end_time: '11:50am', building: 'MTH', room: '0101' }],
          open_seats: '14',
          seats: '30',
          waitlist: '0',
        };
        restoreSelectedSection('UNDOS', 'MATH 141', mathPrevious, true);
        setSelectedSection('UNDOS', 'CMSC 132', cmscNext);
        setSelectedSection('UNDOS', 'MATH 141', mathNext);
        registerScheduleUndo({
          type: 'readiness-map-auto-pick',
          title: 'Auto-picked 2 Readiness Map sections',
          detail: 'Undo restores previous picks across 1 loaded term.',
          termCount: 1,
          changes: [
            { semId: 'UNDOS', code: 'CMSC 132', previousSection: null, previousPinned: false, nextSection: cmscNext },
            { semId: 'UNDOS', code: 'MATH 141', previousSection: mathPrevious, previousPinned: true, nextSection: mathNext },
          ],
        });
        const banner = undoRoot.innerHTML;
        undoScheduleSectionChange();
        const cmscAfter = getSelectedSection('UNDOS', 'CMSC 132');
        const mathAfter = getSelectedSection('UNDOS', 'MATH 141');
        const change = (state.recentChanges || [])[0] || {};
        return {
          banner,
          cmscRestoredEmpty: !cmscAfter,
          mathRestored: mathAfter?.section_id || '',
          mathPinned: !!mathAfter?.pinned,
          cleared: undoRoot.innerHTML === '',
          changeTitle: change.title || '',
          toast: window.__readinessUndoToast || '',
        };
      } finally {
        document.getElementById = originalGetElementById;
        renderSchedule = originalRenderSchedule;
        if (originalRenderSemesters) renderSemesters = originalRenderSemesters;
        else delete globalThis.renderSemesters;
        if (originalToastInfo) toastInfo = originalToastInfo;
        else delete globalThis.toastInfo;
        delete window.__readinessUndoToast;
      }
    })()
  `, context));

  assert(/Auto-picked 2 Readiness Map sections/.test(result.banner), 'readiness map undo: banner should describe the bulk map action');
  assert(/Undo restores previous picks/.test(result.banner), 'readiness map undo: banner should explain the restore scope');
  assert(result.cmscRestoredEmpty, 'readiness map undo: auto-filled empty course should be cleared');
  assert(result.mathRestored === 'MATH141-OLD' && result.mathPinned, 'readiness map undo: previous pinned pick should be restored');
  assert(result.cleared, 'readiness map undo: undo banner should clear after restore');
  assert(/Undid Readiness Map auto-pick/.test(result.changeTitle), 'readiness map undo: should record an undo change');
  assert(/Restored 2 Readiness Map section picks/.test(result.toast), 'readiness map undo: should announce restored picks');

  return {
    id: 'SCHEDULE-MAP-UNDO',
    restored: `${result.cmscRestoredEmpty ? 'empty' : 'kept'}/${result.mathRestored}`,
  };
}

async function testScheduleActionUndo(context) {
  const result = clone(await vm.runInContext(`
    (async () => {
      const undoRoot = { innerHTML: '' };
      const originalGetElementById = document.getElementById;
      const originalRenderSchedule = renderSchedule;
      const originalRenderSemesters = typeof renderSemesters === 'function' ? renderSemesters : null;
      const originalToastInfo = typeof toastInfo === 'function' ? toastInfo : null;
      const originalToastSuccess = typeof toastSuccess === 'function' ? toastSuccess : null;
      const originalFetchSections = scheduleFetchSectionsFor;
      document.getElementById = id => {
        if (id === 'schedule-undo') return undoRoot;
        if (id === 'save-indicator') return { classList: { add() {}, remove() {} } };
        return null;
      };
      renderSchedule = async () => renderScheduleUndo();
      renderSemesters = () => {};
      toastInfo = message => { window.__scheduleActionToasts = [...(window.__scheduleActionToasts || []), message]; };
      toastSuccess = message => { window.__scheduleActionToasts = [...(window.__scheduleActionToasts || []), message]; };
      try {
        const cmscOld = {
          course: 'CMSC131',
          section_id: 'CMSC131-0001',
          semester: '202608',
          number: '0001',
          meetings: [{ days: 'MWF', start_time: '8:00am', end_time: '8:50am', building: 'IRB', room: '1100' }],
          open_seats: '1',
          seats: '30',
          waitlist: '0',
        };
        const cmscNew = {
          course: 'CMSC131',
          section_id: 'CMSC131-0101',
          semester: '202608',
          number: '0101',
          meetings: [{ days: 'MWF', start_time: '10:00am', end_time: '10:50am', building: 'IRB', room: '1201' }],
          open_seats: '18',
          seats: '30',
          waitlist: '0',
        };
        const mathOld = {
          course: 'MATH140',
          section_id: 'MATH140-0201',
          semester: '202608',
          number: '0201',
          meetings: [{ days: 'TuTh', start_time: '11:00am', end_time: '12:15pm', building: 'MTH', room: '0101' }],
          open_seats: '12',
          seats: '30',
          waitlist: '0',
        };
        const englOld = {
          course: 'ENGL101',
          section_id: 'ENGL101-0301',
          semester: '202608',
          number: '0301',
          meetings: [{ days: 'F', start_time: '2:00pm', end_time: '2:50pm', building: 'TWS', room: '1200' }],
          open_seats: '9',
          seats: '20',
          waitlist: '0',
        };
        state.activeSchedule = [{
          id: 'BULKF',
          name: 'Fall 2026',
          courses: [
            { code: 'CMSC 131', title: 'Object-Oriented Programming I', cr: 4 },
            { code: 'MATH 140', title: 'Calculus I', cr: 4 },
            { code: 'ENGL 101', title: 'Academic Writing', cr: 3 },
          ],
        }];
        scheduleCurrentSemId = 'BULKF';
        state.schedulePrefs = { BULKF: { ...DEFAULT_SCHEDULE_PREFS, term: '202608', earliest: '08:00', latest: '17:00' } };
        state.recentChanges = [];

        state.selectedSections = { BULKF: { CMSC131: { ...cmscOld, pinned: true }, MATH140: mathOld } };
        clearScheduleSelections();
        const clearBanner = undoRoot.innerHTML;
        const afterClear = {
          cmsc: !!getSelectedSection('BULKF', 'CMSC 131'),
          math: !!getSelectedSection('BULKF', 'MATH 140'),
        };
        undoScheduleSectionChange();
        const afterClearUndo = {
          cmsc: getSelectedSection('BULKF', 'CMSC 131')?.section_id || '',
          cmscPinned: !!getSelectedSection('BULKF', 'CMSC 131')?.pinned,
          math: getSelectedSection('BULKF', 'MATH 140')?.section_id || '',
          title: (state.recentChanges || [])[0]?.title || '',
        };

        state.selectedSections = { BULKF: { CMSC131: cmscOld } };
        scheduleFetchSectionsFor = async () => ({
          CMSC131: [cmscNew],
          MATH140: [mathOld],
          ENGL101: [],
        });
        await autoPickScheduleSections();
        const autoBanner = undoRoot.innerHTML;
        const afterAuto = {
          cmsc: getSelectedSection('BULKF', 'CMSC 131')?.section_id || '',
          math: getSelectedSection('BULKF', 'MATH 140')?.section_id || '',
        };
        undoScheduleSectionChange();
        const afterAutoUndo = {
          cmsc: getSelectedSection('BULKF', 'CMSC 131')?.section_id || '',
          math: !!getSelectedSection('BULKF', 'MATH 140'),
          title: (state.recentChanges || [])[0]?.title || '',
        };

        state.selectedSections = { BULKF: { CMSC131: cmscOld, ENGL101: englOld } };
        scheduleAlternatives = [{
          items: [
            { course: state.activeSchedule[0].courses[0], section: cmscNew },
            { course: state.activeSchedule[0].courses[1], section: mathOld },
          ],
          conflicts: [],
          warnings: [],
          openSeats: 30,
          score: 100,
          signature: 'bulk-undo-alt',
          timing: { score: 95, tone: 'ok', scoreAdjustment: 0, metrics: { totalIdle: 0, activeDays: 3 } },
          locationIssues: 0,
          compareTo: {
            items: [],
            conflicts: [],
            warnings: [],
            openSeats: 0,
            timing: { score: 70, tone: 'warn', scoreAdjustment: 0, metrics: { totalIdle: 90, activeDays: 2 } },
            locationIssues: 0,
          },
        }];
        applyScheduleAlternative(0);
        const altBanner = undoRoot.innerHTML;
        const afterAlt = {
          cmsc: getSelectedSection('BULKF', 'CMSC 131')?.section_id || '',
          math: getSelectedSection('BULKF', 'MATH 140')?.section_id || '',
          engl: !!getSelectedSection('BULKF', 'ENGL 101'),
        };
        undoScheduleSectionChange();
        const afterAltUndo = {
          cmsc: getSelectedSection('BULKF', 'CMSC 131')?.section_id || '',
          math: !!getSelectedSection('BULKF', 'MATH 140'),
          engl: getSelectedSection('BULKF', 'ENGL 101')?.section_id || '',
          title: (state.recentChanges || [])[0]?.title || '',
        };

        return { clearBanner, afterClear, afterClearUndo, autoBanner, afterAuto, afterAutoUndo, altBanner, afterAlt, afterAltUndo };
      } finally {
        scheduleFetchSectionsFor = originalFetchSections;
        document.getElementById = originalGetElementById;
        renderSchedule = originalRenderSchedule;
        if (originalRenderSemesters) renderSemesters = originalRenderSemesters;
        else delete globalThis.renderSemesters;
        if (originalToastInfo) toastInfo = originalToastInfo;
        else delete globalThis.toastInfo;
        if (originalToastSuccess) toastSuccess = originalToastSuccess;
        else delete globalThis.toastSuccess;
        delete window.__scheduleActionToasts;
      }
    })()
  `, context));

  assert(/Cleared 2 section picks/.test(result.clearBanner), 'schedule action undo: clear banner should describe cleared picks');
  assert(!result.afterClear.cmsc && !result.afterClear.math, 'schedule action undo: clear should remove saved picks');
  assert(result.afterClearUndo.cmsc === 'CMSC131-0001' && result.afterClearUndo.cmscPinned, 'schedule action undo: clear undo should restore pinned CMSC pick');
  assert(result.afterClearUndo.math === 'MATH140-0201', 'schedule action undo: clear undo should restore MATH pick');
  assert(/Undid clear section picks/.test(result.afterClearUndo.title), 'schedule action undo: clear undo should record a change');
  assert(/Auto-picked 2 sections/.test(result.autoBanner), 'schedule action undo: auto-pick banner should describe changed picks');
  assert(result.afterAuto.cmsc === 'CMSC131-0101' && result.afterAuto.math === 'MATH140-0201', 'schedule action undo: auto-pick should replace and fill picks');
  assert(result.afterAutoUndo.cmsc === 'CMSC131-0001' && !result.afterAutoUndo.math, 'schedule action undo: auto-pick undo should restore previous state');
  assert(/Undid section auto-pick/.test(result.afterAutoUndo.title), 'schedule action undo: auto-pick undo should record a change');
  assert(/Applied alternate schedule 1/.test(result.altBanner), 'schedule action undo: alternate banner should describe applied option');
  assert(result.afterAlt.cmsc === 'CMSC131-0101' && result.afterAlt.math === 'MATH140-0201' && !result.afterAlt.engl, 'schedule action undo: alternate should apply and remove non-option picks');
  assert(result.afterAltUndo.cmsc === 'CMSC131-0001' && !result.afterAltUndo.math && result.afterAltUndo.engl === 'ENGL101-0301', 'schedule action undo: alternate undo should restore previous picks');
  assert(/Undid alternate schedule 1/.test(result.afterAltUndo.title), 'schedule action undo: alternate undo should record a change');

  return {
    id: 'SCHEDULE-ACTION-UNDO',
    clear: result.afterClearUndo.math,
    auto: result.afterAutoUndo.cmsc,
    alternate: result.afterAltUndo.engl,
  };
}

function testScheduleCourseChip(context) {
  const result = clone(vm.runInContext(`
    (() => {
      state.activeSchedule = [{ id: 'PASS102F', name: 'Fall 2026', courses: [] }];
      state.schedulePrefs = { PASS102F: { term: '202608' } };
      state.selectedSections = {};
      setSelectedSection('PASS102F', 'CMSC 132', {
        course: 'CMSC132',
        section_id: 'CMSC132-0101',
        semester: '202608',
        number: '0101',
        instructors: ['Grace Hopper'],
        meetings: [{ days: 'MW', start_time: '10:30am', end_time: '11:45am', building: 'IRB', room: '1201' }],
        open_seats: '2',
        seats: '30',
        waitlist: '3',
      });
      setSelectedSection('PASS102F', 'MATH 140', {
        course: 'MATH140',
        section_id: 'MATH140-0201',
        semester: '202608',
        number: '0201',
        instructors: ['Emmy Noether'],
        meetings: [{ days: 'TuTh', start_time: '9:30am', end_time: '10:45am', building: 'MTH', room: '0101' }],
        open_seats: '0',
        seats: '35',
        waitlist: '7',
      });
      setSelectedSection('PASS102F', 'ENGL 101', {
        course: 'ENGL101',
        section_id: 'ENGL101-0301',
        semester: '202608',
        number: '0301',
        instructors: ['Toni Morrison'],
        meetings: [{ days: 'F', start_time: '1:00pm', end_time: '1:50pm', building: 'TWS', room: '1200' }],
        open_seats: '18',
        seats: '24',
        waitlist: '0',
      });
      return {
        risk: scheduleCourseSummary('PASS102F', 'CMSC 132'),
        closed: scheduleCourseSummary('PASS102F', 'MATH 140'),
        ok: scheduleCourseSummary('PASS102F', 'ENGL 101'),
      };
    })()
  `, context));

  assert(/schedule-chip seat-risk-risk/.test(result.risk), 'schedule chip: low-seat pick should use risk styling');
  assert(/0101/.test(result.risk) && /2 left/.test(result.risk), 'schedule chip: low-seat pick should show section and remaining seats');
  assert(/title="[^"]*2 seats open/.test(result.risk), 'schedule chip: low-seat pick should expose seat detail in title');
  assert(/schedule-chip seat-risk-closed/.test(result.closed) && /7 waitlisted/.test(result.closed), 'schedule chip: closed pick should show waitlist status');
  assert(/schedule-chip seat-risk-ok/.test(result.ok) && /18 open/.test(result.ok), 'schedule chip: open pick should show open-seat status');

  return {
    id: 'SCHEDULE-CHIP',
    risk: '2 left',
    closed: '7 waitlisted',
    ok: '18 open',
  };
}

async function testScheduleTermMismatchGuards(context) {
  const result = clone(await vm.runInContext(`
    (async () => {
      const undoRoot = { innerHTML: '' };
      const originalGetElementById = document.getElementById;
      const originalRenderSchedule = renderSchedule;
      const originalRenderSemesters = typeof renderSemesters === 'function' ? renderSemesters : null;
      const originalFetchSections = scheduleFetchSectionsFor;
      const originalToastInfo = typeof toastInfo === 'function' ? toastInfo : null;
      const originalToastSuccess = typeof toastSuccess === 'function' ? toastSuccess : null;
      document.getElementById = id => {
        if (id === 'schedule-undo') return undoRoot;
        if (id === 'save-indicator') return { classList: { add() {}, remove() {} } };
        return null;
      };
      renderSchedule = async () => renderScheduleUndo();
      renderSemesters = () => {};
      toastInfo = message => { window.__termMismatchToasts = [...(window.__termMismatchToasts || []), message]; };
      toastSuccess = message => { window.__termMismatchToasts = [...(window.__termMismatchToasts || []), message]; };
      try {
        const course = { code: 'GVPT 200', title: 'International Political Relations', cr: 3, kind: 'gened', category: 'gened-dsbs' };
        const springSection = {
          course: 'GVPT200',
          section_id: 'GVPT200-0999',
          semester: '202701',
          number: '0999',
          meetings: [{ days: 'MW', start_time: '1:00pm', end_time: '2:15pm', building: 'TYD', room: '1101' }],
          open_seats: '12',
          waitlist: '0',
          seats: '30',
        };
        const fallSection = {
          course: 'GVPT200',
          section_id: 'GVPT200-0101',
          semester: '202608',
          number: '0101',
          meetings: [{ days: 'TuTh', start_time: '10:00am', end_time: '11:15am', building: 'TYD', room: '1101' }],
          open_seats: '18',
          waitlist: '0',
          seats: '30',
        };
        state.activeSchedule = [{ id: 'TERMF', name: 'Fall 2026', courses: [course] }];
        scheduleCurrentSemId = 'TERMF';
        state.customCourses = [];
        state.courses = {};
        state.schedulePrefs = { TERMF: { ...DEFAULT_SCHEDULE_PREFS, term: '202608', minBreak: 15 } };
        state.selectedSections = { TERMF: { GVPT200: springSection } };
        state.recentChanges = [];
        const chipBefore = scheduleCourseSummary('TERMF', 'GVPT 200');
        const guardedSelected = getSelectedSectionForTerm('TERMF', 'GVPT 200', '202608');
        const selectedItems = scheduleSelectedItemsFor('TERMF', '202608', [course], { GVPT200: [fallSection] });
        const advisorHtml = scheduleAdvisorPlanHtml('TERMF', selectedItems, {
          filter: 'all',
          currentSemId: 'TERMF',
          currentSemName: 'Fall 2026',
          unscheduledCodes: new Set(['GVPT200']),
          conflictCodes: new Set(),
          warningCodes: new Set(),
        }).html;
        const advisorText = scheduleAdvisorText(
          state.activeSchedule[0],
          '202608',
          [course],
          selectedItems,
          [],
          [],
          getSchedulePrefs('TERMF'),
          'Schedule summary',
          'all',
          [course],
          { preferences: false, warnings: true, unscheduled: true, recentChanges: false, auditIssues: false }
        );
        scheduleFetchSectionsFor = async () => ({ GVPT200: [fallSection] });
        await autoFillScheduleCalendarOmissions();
        const afterAutoFill = getSelectedSection('TERMF', 'GVPT 200');
        return {
          chipBefore,
          guardedEmpty: !guardedSelected,
          selectedItemsCount: selectedItems.length,
          advisorHtml,
          advisorText,
          afterAutoFill,
          banner: undoRoot.innerHTML,
          toasts: (window.__termMismatchToasts || []).join(' | '),
        };
      } finally {
        scheduleFetchSectionsFor = originalFetchSections;
        document.getElementById = originalGetElementById;
        renderSchedule = originalRenderSchedule;
        if (originalRenderSemesters) renderSemesters = originalRenderSemesters;
        else delete globalThis.renderSemesters;
        if (originalToastInfo) toastInfo = originalToastInfo;
        else delete globalThis.toastInfo;
        if (originalToastSuccess) toastSuccess = originalToastSuccess;
        else delete globalThis.toastSuccess;
        delete window.__termMismatchToasts;
      }
    })()
  `, context));

  assert(/section-term-stale/.test(result.chipBefore) && /wrong term/.test(result.chipBefore), 'schedule term guards: Plan chip should flag wrong-term saved picks');
  assert(/Spring 2027/.test(result.chipBefore) && /Fall 2026/.test(result.chipBefore), 'schedule term guards: wrong-term chip should name saved and target terms');
  assert(result.guardedEmpty && result.selectedItemsCount === 0, 'schedule term guards: mismatched saved pick should not count as a current-term selected item');
  assert(/Saved 0999 belongs to Spring 2027, not Fall 2026/.test(result.advisorHtml), 'schedule term guards: advisor HTML should explain stale section evidence');
  assert(!/section 0999/.test(result.advisorText), 'schedule term guards: advisor text should not list the stale section as a current pick');
  assert(/stale pick: Saved 0999 belongs to Spring 2027, not Fall 2026/.test(result.advisorText), 'schedule term guards: advisor text should carry stale-pick guidance');
  assert(result.afterAutoFill?.section_id === 'GVPT200-0101' && result.afterAutoFill?.semester === '202608', 'schedule term guards: calendar auto-fill should replace wrong-term picks with current-term timed sections');
  assert(/Auto-filled 1 calendar section/.test(result.banner), 'schedule term guards: calendar auto-fill should register undo for replaced wrong-term pick');
  assert(/Filled 1 omitted calendar section/.test(result.toasts), 'schedule term guards: calendar auto-fill should announce the term-correct replacement');

  return {
    id: 'SCHEDULE-TERM-GUARDS',
    replaced: result.afterAutoFill?.section_id || '',
    stale: 'wrong term flagged',
  };
}

function testScheduleSeatRiskBackups(context) {
  const result = clone(vm.runInContext(`
    (() => {
      recoGenEdGaps = () => [];
      state.settings = normalizeSettings({ ...DEFAULT_SETTINGS, catalogYear: '2026-2027', totalCredits: 120 });
      state.activeSchedule = [{
        id: 'pass103-fall',
        name: 'Pass 103 Fall',
        courses: [
          { code: 'CMSC 132', title: 'Object-Oriented Programming II', cr: 4, prereqs: [], kind: 'core', category: 'major-core' },
          { code: 'MATH 140', title: 'Calculus I', cr: 4, prereqs: [], kind: 'core', category: 'gened-fsma' }
        ]
      }];
      state.customCourses = [];
      state.courses = {};
      state.selectedSections = {
        'pass103-fall': {
          CMSC132: {
            section_id: 'CMSC132-0101',
            semester: '202608',
            number: '0101',
            open_seats: '0',
            seats: '30',
            waitlist: '5',
            meetings: [{ days: 'MW', start_time: '9:00am', end_time: '10:15am', building: 'IRB', room: '1201' }]
          },
          MATH140: {
            section_id: 'MATH140-0201',
            semester: '202608',
            number: '0201',
            open_seats: '2',
            seats: '32',
            waitlist: '0',
            meetings: [{ days: 'MW', start_time: '10:30am', end_time: '11:45am', building: 'MTH', room: '0101' }]
          }
        }
      };
      state.schedulePrefs = {
        'pass103-fall': { ...DEFAULT_SCHEDULE_PREFS, term: '202608', mode: 'balanced', minBreak: 15 }
      };
      const advisor = plannerBuildAdvisor();
      const selectedItems = plannerRegistrationSelectedItems('pass103-fall', advisor.itemsBySem['pass103-fall'] || []);
      const prefs = getSchedulePrefs('pass103-fall');
      const cmscCourse = state.activeSchedule[0].courses[0];
      const mathCourse = state.activeSchedule[0].courses[1];
      const cmscPicked = state.selectedSections['pass103-fall'].CMSC132;
      const mathPicked = state.selectedSections['pass103-fall'].MATH140;
      const cmscBackup = {
        section_id: 'CMSC132-0201',
        semester: '202608',
        number: '0201',
        open_seats: '18',
        seats: '30',
        waitlist: '0',
        meetings: [{ days: 'MW', start_time: '12:00pm', end_time: '1:15pm', building: 'IRB', room: '1201' }]
      };
      const mathBackup = {
        section_id: 'MATH140-0301',
        semester: '202608',
        number: '0301',
        open_seats: '14',
        seats: '32',
        waitlist: '0',
        meetings: [{ days: 'TuTh', start_time: '1:00pm', end_time: '2:15pm', building: 'MTH', room: '0101' }]
      };
      const warnings = selectedScheduleWarnings(selectedItems, getSchedulePrefs('pass103-fall'));
      const checklist = plannerRegistrationChecklist(advisor);
      const questions = plannerAdvisorQuestions(advisor, checklist);
      const cmscBackupPick = sectionBackupCandidate([cmscPicked, cmscBackup], cmscPicked, prefs, cmscCourse, selectedItems);
      const mathBackupPick = sectionBackupCandidate([mathPicked, mathBackup], mathPicked, prefs, mathCourse, selectedItems);
      const cmscDecisionHtml = renderSectionDecision([cmscPicked, cmscBackup], cmscPicked, prefs, cmscCourse, selectedItems);
      const mathDecisionHtml = renderSectionDecision([mathPicked, mathBackup], mathPicked, prefs, mathCourse, selectedItems);
      return {
        warnings,
        checklistText: plannerRegistrationChecklistText(checklist),
        questionText: plannerAdvisorQuestionsText(questions),
        checklistLevels: checklist.map(item => item.level),
        questionLevels: questions.map(item => item.level),
        checklistHtml: plannerChecklistHtml(checklist),
        questionHtml: plannerAdvisorQuestionsHtml(questions),
        cmscBackupId: cmscBackupPick && cmscBackupPick.section.section_id,
        mathBackupId: mathBackupPick && mathBackupPick.section.section_id,
        cmscDecisionHtml,
        mathDecisionHtml,
      };
    })()
  `, context));

  assert(result.warnings.some(warning => /CMSC 132 0101: 0 open.*5 waitlisted.*backup section/i.test(warning)), 'schedule seat risk: closed picked section should warn with a backup prompt');
  assert(result.warnings.some(warning => /MATH 140 0201: 2 seats open.*backup section/i.test(warning)), 'schedule seat risk: low-seat picked section should warn with a backup prompt');
  assert(/Keep a backup for CMSC 132 0101/.test(result.checklistText), 'planner checklist: should add a backup item for closed picked sections');
  assert(/Keep a backup for MATH 140 0201/.test(result.checklistText), 'planner checklist: should add a backup item for low-seat picked sections');
  assert(/What backup section or alternate course should I use if CMSC 132 0101 is still closed/i.test(result.questionText), 'planner questions: should ask an advisor about a closed-section backup');
  assert(/What backup section or alternate course should I use if MATH 140 0201 fills before I register/i.test(result.questionText), 'planner questions: should ask an advisor about a low-seat backup');
  assert(result.checklistLevels.includes('danger') && result.questionLevels.includes('danger'), 'schedule seat risk: backup items should preserve urgent risk levels');
  assert(/data-planner-schedule/.test(result.checklistHtml) && /data-planner-schedule/.test(result.questionHtml), 'schedule seat risk: backup items should keep Open Schedule actions');
  assert(result.cmscBackupId === 'CMSC132-0201', 'schedule seat risk: closed picked section should find a conflict-free backup candidate');
  assert(result.mathBackupId === 'MATH140-0301', 'schedule seat risk: low-seat picked section should find a conflict-free backup candidate');
  assert(/Backup option:/.test(result.cmscDecisionHtml) && /0201/.test(result.cmscDecisionHtml) && /Apply backup/.test(result.cmscDecisionHtml), 'schedule seat risk: closed picked section should render an apply-backup action');
  assert(/Backup option:/.test(result.mathDecisionHtml) && /0301/.test(result.mathDecisionHtml) && /data-section-action="backup"/.test(result.mathDecisionHtml), 'schedule seat risk: low-seat picked section should render a backup action marker');

  return {
    id: 'SCHEDULE-SEAT-RISK',
    warnings: result.warnings.length,
    checklist: 'backup prompts',
    questions: 'advisor backups',
  };
}

async function testScheduleReadyBackupBulkAction(context) {
  const result = clone(await vm.runInContext(`
    (async () => {
      const undoRoot = { innerHTML: '' };
      const originalGetElementById = document.getElementById;
      const originalRenderSchedule = renderSchedule;
      const originalRenderSemesters = typeof renderSemesters === 'function' ? renderSemesters : null;
      const originalFetchSections = scheduleFetchSectionsFor;
      const originalToastInfo = typeof toastInfo === 'function' ? toastInfo : null;
      const originalToastSuccess = typeof toastSuccess === 'function' ? toastSuccess : null;
      document.getElementById = id => {
        if (id === 'schedule-undo') return undoRoot;
        if (id === 'save-indicator') return { classList: { add() {}, remove() {} } };
        return null;
      };
      renderSchedule = async () => renderScheduleUndo();
      renderSemesters = () => {};
      toastInfo = message => { window.__backupToasts = [...(window.__backupToasts || []), message]; };
      toastSuccess = message => { window.__backupToasts = [...(window.__backupToasts || []), message]; };
      try {
        const cmscPicked = {
          course: 'CMSC132',
          section_id: 'CMSC132-0101',
          semester: '202608',
          number: '0101',
          meetings: [{ days: 'MWF', start_time: '9:00am', end_time: '9:50am', building: 'IRB', room: '1100' }],
          open_seats: '0',
          waitlist: '8',
          seats: '30',
        };
        const cmscBackup = {
          course: 'CMSC132',
          section_id: 'CMSC132-0201',
          semester: '202608',
          number: '0201',
          meetings: [{ days: 'MWF', start_time: '10:00am', end_time: '10:50am', building: 'IRB', room: '1201' }],
          open_seats: '14',
          waitlist: '0',
          seats: '30',
        };
        const mathPicked = {
          course: 'MATH140',
          section_id: 'MATH140-0101',
          semester: '202608',
          number: '0101',
          meetings: [{ days: 'TuTh', start_time: '11:00am', end_time: '12:15pm', building: 'MTH', room: '0101' }],
          open_seats: '2',
          waitlist: '0',
          seats: '30',
        };
        const mathBackup = {
          course: 'MATH140',
          section_id: 'MATH140-0301',
          semester: '202608',
          number: '0301',
          meetings: [{ days: 'TuTh', start_time: '1:00pm', end_time: '2:15pm', building: 'CSI', room: '2110' }],
          open_seats: '18',
          waitlist: '0',
          seats: '30',
        };
        state.activeSchedule = [{
          id: 'BACKF',
          name: 'Fall 2026',
          courses: [
            { code: 'CMSC 132', title: 'Object-Oriented Programming II', cr: 4 },
            { code: 'MATH 140', title: 'Calculus I', cr: 4 },
          ],
        }];
        scheduleCurrentSemId = 'BACKF';
        state.schedulePrefs = { BACKF: { ...DEFAULT_SCHEDULE_PREFS, term: '202608', earliest: '08:00', latest: '17:00' } };
        state.selectedSections = { BACKF: { CMSC132: cmscPicked, MATH140: { ...mathPicked, pinned: true } } };
        state.recentChanges = [];
        scheduleFetchSectionsFor = async () => ({
          CMSC132: [cmscPicked, cmscBackup],
          MATH140: [mathPicked, mathBackup],
        });
        await applyScheduleReadyBackups();
        const afterApply = {
          cmsc: getSelectedSection('BACKF', 'CMSC 132')?.section_id || '',
          math: getSelectedSection('BACKF', 'MATH 140')?.section_id || '',
          mathPinned: !!getSelectedSection('BACKF', 'MATH 140')?.pinned,
          banner: undoRoot.innerHTML,
          changeTitle: (state.recentChanges || [])[0]?.title || '',
          toast: (window.__backupToasts || []).join(' | '),
        };
        undoScheduleSectionChange();
        const afterUndo = {
          cmsc: getSelectedSection('BACKF', 'CMSC 132')?.section_id || '',
          math: getSelectedSection('BACKF', 'MATH 140')?.section_id || '',
          mathPinned: !!getSelectedSection('BACKF', 'MATH 140')?.pinned,
          changeTitle: (state.recentChanges || [])[0]?.title || '',
        };
        return { afterApply, afterUndo };
      } finally {
        scheduleFetchSectionsFor = originalFetchSections;
        document.getElementById = originalGetElementById;
        renderSchedule = originalRenderSchedule;
        if (originalRenderSemesters) renderSemesters = originalRenderSemesters;
        else delete globalThis.renderSemesters;
        if (originalToastInfo) toastInfo = originalToastInfo;
        else delete globalThis.toastInfo;
        if (originalToastSuccess) toastSuccess = originalToastSuccess;
        else delete globalThis.toastSuccess;
        delete window.__backupToasts;
      }
    })()
  `, context));

  assert(result.afterApply.cmsc === 'CMSC132-0201' && result.afterApply.math === 'MATH140-0301', 'ready backup action: should apply all ready backup sections');
  assert(result.afterApply.mathPinned, 'ready backup action: should preserve pinned state when swapping to backup');
  assert(/Applied 2 ready backups/.test(result.afterApply.banner), 'ready backup action: should register a bulk undo banner');
  assert(/Applied 2 ready backup sections/.test(result.afterApply.changeTitle), 'ready backup action: should record a bulk backup change');
  assert(/Applied 2 ready backup sections/.test(result.afterApply.toast), 'ready backup action: should announce applied backups');
  assert(result.afterUndo.cmsc === 'CMSC132-0101' && result.afterUndo.math === 'MATH140-0101', 'ready backup action: undo should restore previous risky picks');
  assert(result.afterUndo.mathPinned, 'ready backup action: undo should restore previous pinned state');
  assert(/Undid ready backup apply/.test(result.afterUndo.changeTitle), 'ready backup action: undo should record a restore change');

  return {
    id: 'SCHEDULE-READY-BACKUPS',
    applied: `${result.afterApply.cmsc}/${result.afterApply.math}`,
    restored: `${result.afterUndo.cmsc}/${result.afterUndo.math}`,
  };
}

function testDragDropSelectionCleanup(context) {
  const result = clone(vm.runInContext(`
    (() => {
      state.activeSchedule = [{
        id: 'DND-F',
        name: 'Fall 2026',
        courses: [
          { code: 'CMSC 131', title: 'Object-Oriented Programming I', cr: 4 },
          { code: 'ENGL 101', title: 'Academic Writing', cr: 3 }
        ]
      }, {
        id: 'DND-S',
        name: 'Spring 2027',
        courses: [{ code: 'CMSC 132', title: 'Object-Oriented Programming II', cr: 4 }]
      }];
      state.customSemesters = [];
      state.customCourses = [{ code: 'INST 201', title: 'Introduction to Information Science', cr: 3, semId: 'DND-F' }];
      state.schedulePrefs = {
        'DND-F': { term: '202608' },
        'DND-S': { term: '202701' }
      };
      state.selectedSections = {
        'DND-F': {
          CMSC132: { course: 'CMSC 132', section_id: 'CMSC132-OLD-FALL', number: 'OLD-FALL', semester: '202608', meetings: [] },
          INST201: { course: 'INST 201', section_id: 'INST201-0101', number: '0101', semester: '202608', meetings: [] },
          ENGL101: { course: 'ENGL 101', section_id: 'ENGL101-0101', number: '0101', semester: '202608', meetings: [] }
        },
        'DND-S': {
          CMSC132: { course: 'CMSC 132', section_id: 'CMSC132-0201', number: '0201', semester: '202701', meetings: [] },
          INST201: { course: 'INST 201', section_id: 'INST201-0201', number: '0201', semester: '202701', meetings: [] }
        }
      };

      moveCourseToSemester('CMSC 132', 'DND-S', 'DND-F', false, 1);
      const afterRequiredMove = JSON.parse(JSON.stringify(state.selectedSections || {}));
      moveCourseToSemester('INST 201', 'DND-F', 'DND-S', true, 0);

      return {
        fallCodes: state.activeSchedule[0].courses.map(course => course.code),
        springCodes: state.activeSchedule[1].courses.map(course => course.code),
        requiredSourcePick: afterRequiredMove['DND-S']?.CMSC132 || null,
        requiredTargetPick: afterRequiredMove['DND-F']?.CMSC132 || null,
        preservedFallPick: afterRequiredMove['DND-F']?.ENGL101?.section_id || '',
        customSemId: state.customCourses.find(course => course.code === 'INST 201')?.semId || '',
        customSourcePick: state.selectedSections['DND-F']?.INST201 || null,
        customTargetPick: state.selectedSections['DND-S']?.INST201 || null,
        preservedAfterCustom: state.selectedSections['DND-F']?.ENGL101?.section_id || '',
        buckets: Object.keys(state.selectedSections || {}).sort(),
      };
    })()
  `, context));

  assert(result.fallCodes.join(',') === 'CMSC 131,CMSC 132,ENGL 101', 'drag/drop cleanup: moved required course should land in the requested target order');
  assert(!result.springCodes.includes('CMSC 132'), 'drag/drop cleanup: moved required course should leave the source semester');
  assert(!result.requiredSourcePick && !result.requiredTargetPick, 'drag/drop cleanup: moving a required course across semesters should clear stale source and target section picks');
  assert(result.preservedFallPick === 'ENGL101-0101', 'drag/drop cleanup: unrelated section picks in the target semester should remain');
  assert(result.customSemId === 'DND-S', 'drag/drop cleanup: custom course should move to the target semester');
  assert(!result.customSourcePick && !result.customTargetPick, 'drag/drop cleanup: moving a custom course across semesters should clear stale source and target section picks');
  assert(result.preservedAfterCustom === 'ENGL101-0101' && result.buckets.length === 1 && result.buckets[0] === 'DND-F', 'drag/drop cleanup: empty selection buckets should be removed while unrelated picks remain');

  return {
    id: 'DND-SELECTION-CLEANUP',
    required: result.fallCodes.join(' > '),
    custom: result.customSemId,
  };
}

function testCustomDeleteSelectionCleanup(context) {
  const result = clone(vm.runInContext(`
    (() => {
      state.activeSchedule = [{
        id: 'DEL-F',
        name: 'Fall 2026',
        courses: [{ code: 'ENGL 101', title: 'Academic Writing', cr: 3 }]
      }];
      state.customSemesters = [{ id: 'DEL-SUM', name: 'Summer 2027', year: 'Year 1', courses: [] }];
      state.customCourses = [
        { code: 'INST 201', title: 'Introduction to Information Science', cr: 3, semId: 'DEL-SUM' },
        { code: 'PLCY 201', title: 'Public Leaders and Active Citizens', cr: 3, semId: 'DEL-F' }
      ];
      state.courses = {
        INST201: { status: 'in-progress', grade: '' },
        PLCY201: { status: 'passed', grade: 'A' },
        'ENGL 101': { status: 'not-started', grade: '' }
      };
      state.schedulePrefs = {
        'DEL-SUM': { term: '202705', mode: 'compact' },
        'DEL-F': { term: '202608', mode: 'balanced' }
      };
      state.selectedSections = {
        'DEL-SUM': {
          INST201: { course: 'INST 201', section_id: 'INST201-0101', number: '0101', semester: '202705', meetings: [] }
        },
        'DEL-F': {
          INST201: { course: 'INST 201', section_id: 'INST201-0999', number: '0999', semester: '202608', meetings: [] },
          PLCY201: { course: 'PLCY 201', section_id: 'PLCY201-0201', number: '0201', semester: '202608', meetings: [] },
          ENGL101: { course: 'ENGL 101', section_id: 'ENGL101-0101', number: '0101', semester: '202608', meetings: [] }
        }
      };

      const semesterRemoval = removeCustomSemesterFromPlan('DEL-SUM');
      const afterSemester = {
        customSemesters: state.customSemesters.map(sem => sem.id),
        customCourses: state.customCourses.map(course => course.code),
        hasSummerPrefs: !!state.schedulePrefs['DEL-SUM'],
        hasFallPrefs: !!state.schedulePrefs['DEL-F'],
        summerBucket: state.selectedSections['DEL-SUM'] || null,
        staleInstInFall: state.selectedSections['DEL-F']?.INST201 || null,
        preservedFallPick: state.selectedSections['DEL-F']?.ENGL101?.section_id || '',
        instProgressCompact: state.courses.INST201 || null,
        instProgressDisplay: state.courses['INST 201'] || null,
        instVisibleState: getCourseState('INST 201'),
        semesterRemoval,
      };

      const courseRemoval = removeCustomCourseFromPlan('PLCY 201');
      return {
        afterSemester,
        remainingCustomCourses: state.customCourses.map(course => course.code),
        plcyProgressCompact: state.courses.PLCY201 || null,
        plcyProgressDisplay: state.courses['PLCY 201'] || null,
        plcyVisibleState: getCourseState('PLCY 201'),
        plcyPick: state.selectedSections['DEL-F']?.PLCY201 || null,
        preservedAfterCourse: state.selectedSections['DEL-F']?.ENGL101?.section_id || '',
        fallPrefs: state.schedulePrefs['DEL-F'] || null,
        remainingBuckets: Object.keys(state.selectedSections || {}),
        courseRemoval,
      };
    })()
  `, context));

  assert(result.afterSemester.semesterRemoval.removedSemester === true && result.afterSemester.semesterRemoval.removedCourses === 1, 'custom delete cleanup: custom semester removal should report removed semester and contained course');
  assert(!result.afterSemester.customSemesters.includes('DEL-SUM'), 'custom delete cleanup: removed custom semester should leave customSemesters');
  assert(!result.afterSemester.customCourses.includes('INST 201'), 'custom delete cleanup: courses inside removed custom semester should be removed');
  assert(!result.afterSemester.hasSummerPrefs && result.afterSemester.hasFallPrefs, 'custom delete cleanup: removed semester prefs should be cleared while active term prefs remain');
  assert(!result.afterSemester.summerBucket && !result.afterSemester.staleInstInFall, 'custom delete cleanup: removed semester course picks should clear from removed and stale buckets');
  assert(result.afterSemester.preservedFallPick === 'ENGL101-0101', 'custom delete cleanup: unrelated active term picks should remain after semester removal');
  assert(!result.afterSemester.instProgressCompact && !result.afterSemester.instProgressDisplay, 'custom delete cleanup: removed custom semester course compact/display progress should be removed');
  assert(result.afterSemester.instVisibleState.status === 'not-started', 'custom delete cleanup: removed custom semester course should not leave visible normalized progress');
  assert(result.courseRemoval.removed === 1, 'custom delete cleanup: standalone custom course removal should report one removed row');
  assert(!result.remainingCustomCourses.includes('PLCY 201') && !result.plcyProgressCompact && !result.plcyProgressDisplay && !result.plcyPick, 'custom delete cleanup: standalone custom course should clear row, compact/display progress, and picked section');
  assert(result.plcyVisibleState.status === 'not-started', 'custom delete cleanup: standalone custom course should not leave visible normalized progress');
  assert(result.preservedAfterCourse === 'ENGL101-0101' && result.fallPrefs?.term === '202608', 'custom delete cleanup: unrelated pick and surviving term prefs should remain after course removal');
  assert(result.remainingBuckets.length === 1 && result.remainingBuckets[0] === 'DEL-F', 'custom delete cleanup: empty removed buckets should not remain');

  return {
    id: 'CUSTOM-DELETE-CLEANUP',
    semesterRemoved: result.afterSemester.semesterRemoval.removedCourses,
    courseRemoved: result.courseRemoval.removed,
  };
}

async function testCourseEditSelectionCleanup(context) {
  const result = clone(await vm.runInContext(`
    (async () => {
      const originalGetElementById = document.getElementById;
      const originalRender = render;
      const originalToastSuccess = typeof toastSuccess === 'function' ? toastSuccess : null;
      const originalToastError = typeof toastError === 'function' ? toastError : null;
      const calls = [];
      const fields = {};
      const elementFor = id => fields[id] || { value: '', checked: false, textContent: '', style: {}, classList: { add() {}, remove() {} } };
      document.getElementById = id => {
        if (id === 'save-indicator' || id === 'add-course-modal') return { classList: { add() {}, remove() {} } };
        return elementFor(id);
      };
      render = () => { calls.push('render'); };
      toastSuccess = message => { calls.push(message); };
      toastError = message => { throw new Error(message); };

      const setEditFields = ({ code, title, semester, category = 'gened-dshs', credits = '3', note = '', prereqs = '', goal = false }) => {
        Object.assign(fields, {
          'ac-code': { value: code },
          'ac-title': { value: title },
          'ac-credits': { value: credits },
          'ac-note': { value: note },
          'ac-semester': { value: semester },
          'ac-category': { value: category },
          'ac-goal': { checked: goal },
          'ac-prereqs': { value: prereqs },
          'ac-auto-prereqs': { checked: false },
        });
      };

      try {
        state.activeSchedule = [{
          id: 'EDIT-F',
          name: 'Fall 2026',
          courses: [
            { code: 'CMSC131', title: 'Object-Oriented Programming I', cr: 4 },
            { code: 'MATH 140', title: 'Calculus I', cr: 4 },
            { code: 'ENGL 101', title: 'Academic Writing', cr: 3 }
          ]
        }, {
          id: 'EDIT-S',
          name: 'Spring 2027',
          courses: []
        }];
        state.customSemesters = [];
        state.customCourses = [{ code: 'GenEd DSHS', title: 'Social science placeholder', cr: 3, semId: 'EDIT-F' }];
        state.courses = {
          'GenEd DSHS': { status: 'in-progress', grade: '' },
          CMSC131: { status: 'not-started', grade: '' },
          MATH140: { status: 'passed', grade: 'A' },
        };
        state.selectedSections = {
          'EDIT-F': {
            GENEDDSHS: { course: 'GenEd DSHS', section_id: 'GENEDDSHS-OLD', number: 'OLD', semester: '202608', meetings: [] },
            CMSC131: { course: 'CMSC 131', section_id: 'CMSC131-0101', number: '0101', semester: '202608', meetings: [] },
            MATH140: { course: 'MATH 140', section_id: 'MATH140-0101', number: '0101', semester: '202608', meetings: [] },
            ENGL101: { course: 'ENGL 101', section_id: 'ENGL101-0101', number: '0101', semester: '202608', meetings: [] }
          },
          'EDIT-S': {
            GENEDDSHS: { course: 'GenEd DSHS', section_id: 'GENEDDSHS-SPRING', number: 'SPRING', semester: '202701', meetings: [] }
          },
          'GenEd DSHS': '0101'
        };
        state.schedulePrefs = { 'EDIT-F': { term: '202608' }, 'EDIT-S': { term: '202701' } };

        editingCourseCode = 'GenEd DSHS';
        setEditFields({ code: 'TEST 299', title: 'Synthetic Planning Seminar', semester: 'EDIT-F' });
        await saveCustomCourse();
        const afterSemanticEdit = {
          customCourse: ((course) => course ? { ...course } : null)((state.customCourses || []).find(course => course.code === 'TEST 299')),
          oldProgress: state.courses['GenEd DSHS'] || null,
          newProgress: state.courses['TEST 299'] || null,
          oldFallPick: state.selectedSections['EDIT-F']?.GENEDDSHS || null,
          oldSpringPick: state.selectedSections['EDIT-S']?.GENEDDSHS || null,
          flatOldPick: state.selectedSections['GenEd DSHS'] || null,
          preservedCmsc: state.selectedSections['EDIT-F']?.CMSC131?.section_id || '',
          preservedEngl: state.selectedSections['EDIT-F']?.ENGL101?.section_id || '',
        };

        state.selectedSections['EDIT-F'].TEST299 = { course: 'TEST 299', section_id: 'TEST299-0101', number: '0101', semester: '202608', meetings: [] };
        state.selectedSections['EDIT-S'] = {
          TEST299: { course: 'TEST 299', section_id: 'TEST299-0201', number: '0201', semester: '202701', meetings: [] }
        };
        editingCourseCode = 'TEST 299';
        setEditFields({ code: 'TEST 299', title: 'Synthetic Planning Seminar', semester: 'EDIT-S' });
        await saveCustomCourse();
        const afterCustomMove = {
          customSemId: (state.customCourses || []).find(course => course.code === 'TEST 299')?.semId || '',
          fallPick: state.selectedSections['EDIT-F']?.TEST299 || null,
          springPick: state.selectedSections['EDIT-S']?.TEST299 || null,
          preservedCmsc: state.selectedSections['EDIT-F']?.CMSC131?.section_id || '',
          preservedEngl: state.selectedSections['EDIT-F']?.ENGL101?.section_id || '',
        };

        editingCourseCode = 'CMSC131';
        setEditFields({ code: 'CMSC 131', title: 'Object-Oriented Programming I', semester: 'EDIT-F', category: 'major-core', credits: '4' });
        await saveCustomCourse();
        const afterFormatEdit = {
          fallCodes: state.activeSchedule[0].courses.map(course => course.code),
          cmscPick: state.selectedSections['EDIT-F']?.CMSC131 || null,
          oldProgress: state.courses.CMSC131 || null,
          newProgress: state.courses['CMSC 131'] || null,
        };

        state.selectedSections['EDIT-S'] = {
          CMSC131: { course: 'CMSC 131', section_id: 'CMSC131-0201', number: '0201', semester: '202701', meetings: [] }
        };
        editingCourseCode = 'CMSC 131';
        setEditFields({ code: 'CMSC 131', title: 'Object-Oriented Programming I', semester: 'EDIT-S', category: 'major-core', credits: '4' });
        await saveCustomCourse();
        const afterScheduledMove = {
          fallCodes: state.activeSchedule[0].courses.map(course => course.code),
          springCodes: state.activeSchedule[1].courses.map(course => course.code),
          fallPick: state.selectedSections['EDIT-F']?.CMSC131 || null,
          springPick: state.selectedSections['EDIT-S']?.CMSC131 || null,
          preservedEngl: state.selectedSections['EDIT-F']?.ENGL101?.section_id || '',
        };

        editingCourseCode = 'MATH 140';
        setEditFields({ code: 'MATH 141', title: 'Calculus II', semester: 'EDIT-F', category: 'major-support', credits: '4' });
        await saveCustomCourse();
        const afterNormalizedStateEdit = {
          fallCodes: state.activeSchedule[0].courses.map(course => course.code),
          oldCompactProgress: state.courses.MATH140 || null,
          oldDisplayProgress: state.courses['MATH 140'] || null,
          newProgress: state.courses['MATH 141'] || null,
          visibleNewState: getCourseState('MATH 141'),
          oldPick: state.selectedSections['EDIT-F']?.MATH140 || null,
          preservedEngl: state.selectedSections['EDIT-F']?.ENGL101?.section_id || '',
        };

        return { afterSemanticEdit, afterCustomMove, afterFormatEdit, afterScheduledMove, afterNormalizedStateEdit, calls };
      } finally {
        document.getElementById = originalGetElementById;
        render = originalRender;
        if (originalToastSuccess) toastSuccess = originalToastSuccess;
        else delete globalThis.toastSuccess;
        if (originalToastError) toastError = originalToastError;
        else delete globalThis.toastError;
        editingCourseCode = null;
      }
    })()
  `, context));

  assert(result.afterSemanticEdit.customCourse?.semId === 'EDIT-F', 'course edit cleanup: semantic code change should update the custom course row');
  assert(!result.afterSemanticEdit.oldProgress && result.afterSemanticEdit.newProgress?.status === 'in-progress', 'course edit cleanup: semantic code change should migrate course progress to the new code');
  assert(!result.afterSemanticEdit.oldFallPick && !result.afterSemanticEdit.oldSpringPick && !result.afterSemanticEdit.flatOldPick, 'course edit cleanup: semantic code change should clear old picked sections in nested and flat storage');
  assert(result.afterSemanticEdit.preservedCmsc === 'CMSC131-0101' && result.afterSemanticEdit.preservedEngl === 'ENGL101-0101', 'course edit cleanup: semantic code change should preserve unrelated picked sections');
  assert(result.afterCustomMove.customSemId === 'EDIT-S' && !result.afterCustomMove.fallPick && !result.afterCustomMove.springPick, 'course edit cleanup: moving a custom course in the edit modal should clear source and target picked sections');
  assert(result.afterCustomMove.preservedCmsc === 'CMSC131-0101' && result.afterCustomMove.preservedEngl === 'ENGL101-0101', 'course edit cleanup: moving a custom course should preserve unrelated picked sections');
  assert(result.afterFormatEdit.fallCodes.includes('CMSC 131'), 'course edit cleanup: formatting-only code edit should update the plan row');
  assert(result.afterFormatEdit.cmscPick?.section_id === 'CMSC131-0101', 'course edit cleanup: formatting-only code edit should preserve the normalized section pick');
  assert(!result.afterFormatEdit.oldProgress && result.afterFormatEdit.newProgress?.status === 'not-started', 'course edit cleanup: formatting-only code edit should migrate progress without clearing section data');
  assert(!result.afterScheduledMove.fallCodes.includes('CMSC 131') && result.afterScheduledMove.springCodes.includes('CMSC 131'), 'course edit cleanup: moving a scheduled course in the edit modal should move the plan row');
  assert(!result.afterScheduledMove.fallPick && !result.afterScheduledMove.springPick, 'course edit cleanup: moving a scheduled course in the edit modal should clear source and target picked sections');
  assert(result.afterScheduledMove.preservedEngl === 'ENGL101-0101', 'course edit cleanup: moving a scheduled course should preserve unrelated picked sections');
  assert(result.afterNormalizedStateEdit.fallCodes.includes('MATH 141'), 'course edit cleanup: semantic edit with compact state should update the plan row');
  assert(!result.afterNormalizedStateEdit.oldCompactProgress && !result.afterNormalizedStateEdit.oldDisplayProgress, 'course edit cleanup: semantic edit should remove old compact/display progress keys');
  assert(result.afterNormalizedStateEdit.newProgress?.status === 'passed' && result.afterNormalizedStateEdit.newProgress?.grade === 'A', 'course edit cleanup: semantic edit should migrate compact progress to the new display code');
  assert(result.afterNormalizedStateEdit.visibleNewState.status === 'passed', 'course edit cleanup: migrated semantic edit progress should be visible through normalized lookup');
  assert(!result.afterNormalizedStateEdit.oldPick && result.afterNormalizedStateEdit.preservedEngl === 'ENGL101-0101', 'course edit cleanup: semantic edit should clear old section pick and preserve unrelated picks');

  return {
    id: 'COURSE-EDIT-CLEANUP',
    semantic: result.afterSemanticEdit.customCourse?.code || '',
    formatted: result.afterFormatEdit.fallCodes.includes('CMSC 131') ? 'CMSC 131' : '',
    moved: result.afterScheduledMove.springCodes.includes('CMSC 131') ? 'EDIT-S' : '',
    normalizedState: result.afterNormalizedStateEdit.newProgress?.status || '',
  };
}

async function testCourseCodeCollisionGuard(context) {
  const result = clone(await vm.runInContext(`
    (async () => {
      const originalGetElementById = document.getElementById;
      const originalRender = render;
      const originalToastSuccess = typeof toastSuccess === 'function' ? toastSuccess : null;
      const originalToastError = typeof toastError === 'function' ? toastError : null;
      const errors = [];
      const successes = [];
      const renders = [];
      const fields = {};
      const elementFor = id => fields[id] || { value: '', checked: false, textContent: '', style: {}, classList: { add() {}, remove() {} } };
      document.getElementById = id => {
        if (id === 'save-indicator' || id === 'add-course-modal') return { classList: { add() {}, remove() {} } };
        return elementFor(id);
      };
      render = () => { renders.push('render'); };
      toastSuccess = message => { successes.push(message); };
      toastError = message => { errors.push(message); };

      const setFields = ({ code, title, semester, category = 'major-core', credits = '4', note = '', prereqs = '', goal = false }) => {
        Object.assign(fields, {
          'ac-code': { value: code },
          'ac-title': { value: title },
          'ac-credits': { value: credits },
          'ac-note': { value: note },
          'ac-semester': { value: semester },
          'ac-category': { value: category },
          'ac-goal': { checked: goal },
          'ac-prereqs': { value: prereqs },
          'ac-auto-prereqs': { checked: false },
        });
      };
      const take = () => {
        const output = { errors: [...errors], successes: [...successes], renders: renders.length };
        errors.length = 0;
        successes.length = 0;
        renders.length = 0;
        return output;
      };

      try {
        state.activeSchedule = [{
          id: 'COLL-F',
          name: 'Fall 2026',
          courses: [
            { code: 'CMSC131', title: 'Object-Oriented Programming I', cr: 4 },
            { code: 'ENGL 101', title: 'Academic Writing', cr: 3 }
          ]
        }, {
          id: 'COLL-S',
          name: 'Spring 2027',
          courses: []
        }];
        state.customSemesters = [];
        state.customCourses = [{ code: 'GenEd DSHS', title: 'Social science placeholder', cr: 3, semId: 'COLL-F' }];
        state.courses = {
          CMSC131: { status: 'not-started', grade: '' },
          'GenEd DSHS': { status: 'not-started', grade: '' },
        };
        state.selectedSections = {
          'COLL-F': {
            CMSC131: { course: 'CMSC 131', section_id: 'CMSC131-0101', number: '0101', semester: '202608', meetings: [] },
            GENEDDSHS: { course: 'GenEd DSHS', section_id: 'GENEDDSHS-0101', number: '0101', semester: '202608', meetings: [] }
          }
        };
        state.schedulePrefs = { 'COLL-F': { term: '202608' } };

        editingCourseCode = null;
        addCourseSemId = 'COLL-F';
        setFields({ code: 'CMSC 131', title: 'Duplicate CMSC', semester: 'COLL-F' });
        await saveCustomCourse();
        const afterAddCollision = {
          ...take(),
          customCodes: (state.customCourses || []).map(course => course.code),
          fallCodes: state.activeSchedule[0].courses.map(course => course.code),
        };

        editingCourseCode = 'GenEd DSHS';
        setFields({ code: 'CMSC 131', title: 'Duplicate replacement', semester: 'COLL-F' });
        await saveCustomCourse();
        const afterEditCollision = {
          ...take(),
          customCodes: (state.customCourses || []).map(course => course.code),
          placeholderSemId: (state.customCourses || []).find(course => course.code === 'GenEd DSHS')?.semId || '',
          placeholderPick: state.selectedSections['COLL-F']?.GENEDDSHS?.section_id || '',
        };

        editingCourseCode = 'CMSC131';
        setFields({ code: 'CMSC 131', title: 'Object-Oriented Programming I', semester: 'COLL-F' });
        await saveCustomCourse();
        const afterSelfFormat = {
          ...take(),
          fallCodes: state.activeSchedule[0].courses.map(course => course.code),
          customCodes: (state.customCourses || []).map(course => course.code),
          cmscPick: state.selectedSections['COLL-F']?.CMSC131?.section_id || '',
          oldProgress: state.courses.CMSC131 || null,
          newProgress: state.courses['CMSC 131'] || null,
        };

        return { afterAddCollision, afterEditCollision, afterSelfFormat };
      } finally {
        document.getElementById = originalGetElementById;
        render = originalRender;
        if (originalToastSuccess) toastSuccess = originalToastSuccess;
        else delete globalThis.toastSuccess;
        if (originalToastError) toastError = originalToastError;
        else delete globalThis.toastError;
        editingCourseCode = null;
        addCourseSemId = null;
      }
    })()
  `, context));

  assert(/already exists as "CMSC131"/.test(result.afterAddCollision.errors[0] || ''), 'course code collision: add path should reject normalized duplicates with the existing code');
  assert(!result.afterAddCollision.customCodes.includes('CMSC 131') && result.afterAddCollision.customCodes.includes('GenEd DSHS'), 'course code collision: rejected add should not create a duplicate custom course');
  assert(/already exists as "CMSC131"/.test(result.afterEditCollision.errors[0] || ''), 'course code collision: edit path should reject normalized duplicate replacement codes');
  assert(result.afterEditCollision.customCodes.includes('GenEd DSHS') && result.afterEditCollision.placeholderSemId === 'COLL-F', 'course code collision: rejected edit should leave the placeholder row in place');
  assert(result.afterEditCollision.placeholderPick === 'GENEDDSHS-0101', 'course code collision: rejected edit should not clear existing placeholder section picks');
  assert(result.afterSelfFormat.errors.length === 0 && result.afterSelfFormat.fallCodes.includes('CMSC 131'), 'course code collision: formatting-only self edit should remain allowed');
  assert(!result.afterSelfFormat.fallCodes.includes('CMSC131') && result.afterSelfFormat.cmscPick === 'CMSC131-0101', 'course code collision: formatting-only self edit should preserve the normalized section pick');
  assert(!result.afterSelfFormat.oldProgress && result.afterSelfFormat.newProgress?.status === 'not-started', 'course code collision: formatting-only self edit should migrate progress to the display code');

  return {
    id: 'COURSE-CODE-COLLISION',
    blocked: result.afterAddCollision.errors.length + result.afterEditCollision.errors.length,
    formatted: result.afterSelfFormat.fallCodes.includes('CMSC 131') ? 'CMSC 131' : '',
  };
}

function testRecommendationMoveAction(context) {
  const result = clone(vm.runInContext(`
    (() => {
      let renderCalls = 0;
      const originalRender = render;
      render = () => { renderCalls += 1; };
      currentTab = 'plan';
      state.activeSchedule = [{
        id: 'PASS100F',
        name: 'Pass 100 Fall',
        year: 'Year 1',
        courses: [{
          code: 'CMSC 131',
          title: 'Object-Oriented Programming I',
          cr: 4,
          prereqs: [],
          kind: 'core',
          category: 'major-core'
        }]
      }, {
        id: 'PASS100S',
        name: 'Pass 100 Spring',
        year: 'Year 1',
        courses: [{
          code: 'CMSC 132',
          title: 'Object-Oriented Programming II',
          cr: 4,
          prereqs: ['CMSC 131'],
          kind: 'core',
          category: 'major-core'
        }, {
          code: 'MATH 140',
          title: 'Calculus I',
          cr: 4,
          prereqs: [],
          kind: 'core',
          category: 'gened-fsma'
        }]
      }];
      state.customSemesters = [];
      state.customCourses = [];
      state.courses = { 'CMSC 131': { status: 'passed', grade: 'A' } };
      state.schedulePrefs = { PASS100F: { term: '202608' } };
      state.selectedSections = {
        PASS100S: {
          CMSC132: {
            course: 'CMSC132',
            section_id: 'CMSC132-0999',
            semester: '202609',
            number: '0999',
            meetings: [],
            pinned: true,
          }
        },
        PASS100F: {
          CMSC132: {
            course: 'CMSC132',
            section_id: 'CMSC132-STALE',
            semester: '202608',
            number: 'STALE',
            meetings: [],
          }
        }
      };
      state.recentChanges = [];
      const ctx = { semId: 'PASS100F', term: '202608', termLabel: 'Fall 2026' };
      const candidate = recoBaseCandidates().find(item => normalizeCode(item.course.code) === 'CMSC132');
      const htmlBefore = candidate ? recoRenderPick(candidate, 0, ctx) : '';
      const moved = recoMoveToSemester('CMSC 132', 'PASS100F');
      const freshCandidate = recoBaseCandidates().find(item => normalizeCode(item.course.code) === 'CMSC132');
      const htmlAfter = freshCandidate ? recoRenderPick(freshCandidate, 0, ctx) : '';
      const change = state.recentChanges[0] || null;
      const canUndoBefore = plannerChangeCanUndo(change);
      const afterMoveFallCodes = state.activeSchedule[0].courses.map(course => course.code);
      const afterMoveSpringCodes = state.activeSchedule[1].courses.map(course => course.code);
      const afterMoveSourceSelected = (state.selectedSections.PASS100S || {}).CMSC132 || null;
      const afterMoveTargetSelected = (state.selectedSections.PASS100F || {}).CMSC132 || null;
      const afterMoveSelectedSections = JSON.parse(JSON.stringify(state.selectedSections || {}));
      state.selectedSections = {
        PASS100F: {
          CMSC132: {
            course: 'CMSC132',
            section_id: 'CMSC132-NEW',
            semester: '202608',
            number: 'NEW',
            meetings: [],
          }
        }
      };
      const staleCanUndo = plannerChangeCanUndo(change);
      const staleScheduleTarget = plannerChangeScheduleTarget(change);
      const staleTermTarget = plannerChangeTermTarget(change);
      state.selectedSections = JSON.parse(JSON.stringify(afterMoveSelectedSections));
      const undoApplied = undoPlanChange(change.id);
      const undoChange = state.recentChanges[0] || null;
      const originalChangeAfterUndo = state.recentChanges.find(item => item.id === change.id) || null;
      const afterUndoSourceSelected = (state.selectedSections.PASS100S || {}).CMSC132 || null;
      const afterUndoTargetSelected = (state.selectedSections.PASS100F || {}).CMSC132 || null;
      render = originalRender;
      return {
        candidateCode: candidate?.course?.code || '',
        candidateTerm: candidate?.course?.semId || '',
        moved,
        fallCodes: afterMoveFallCodes,
        springCodes: afterMoveSpringCodes,
        htmlBefore,
        htmlAfter,
        afterMoveSourceSelected,
        afterMoveTargetSelected,
        change,
        canUndoBefore,
        staleCanUndo,
        staleScheduleTarget,
        staleTermTarget,
        undoApplied,
        afterUndoFallCodes: state.activeSchedule[0].courses.map(course => course.code),
        afterUndoSpringCodes: state.activeSchedule[1].courses.map(course => course.code),
        afterUndoSourceSelected,
        afterUndoTargetSelected,
        undoChange,
        originalChangeAfterUndo,
        renderCalls,
      };
    })()
  `, context));

  assert(result.candidateCode === 'CMSC 132' && result.candidateTerm === 'PASS100S', 'recommendation move: should find future ready course candidate');
  assert(/Move here/.test(result.htmlBefore) && /Schedule/.test(result.htmlBefore), 'recommendation move: ready future pick should render move and schedule actions');
  assert(result.moved === true, 'recommendation move: action should report successful move');
  assert(result.fallCodes.includes('CMSC 132') && !result.springCodes.includes('CMSC 132'), 'recommendation move: course should move from future term to current term');
  assert(/In this term/.test(result.htmlAfter), 'recommendation move: moved pick should render as already in current term');
  assert(result.change?.type === 'recommendation-move' && /Moved CMSC 132/.test(result.change.title || ''), 'recommendation move: should record a recent plan change');
  assert(result.change?.undo?.kind === 'term-move' && result.canUndoBefore === true, 'recommendation move: should record an undoable term-move payload');
  assert((result.change?.highlights || []).some(item => /posted section/i.test(item)), 'recommendation move: change should nudge student to choose a real section');
  assert(!result.afterMoveSourceSelected && !result.afterMoveTargetSelected, 'recommendation move: moving here should clear stale source and target section picks');
  assert(result.staleCanUndo === false && result.staleScheduleTarget?.semId === 'PASS100F' && result.staleScheduleTarget?.code === 'CMSC 132', 'recommendation move: edited target section should block undo and offer Schedule recovery');
  assert(result.staleTermTarget?.semId === 'PASS100F' && result.staleTermTarget?.label === 'Show target term', 'recommendation move: stale target section should label the target Plan recovery');
  assert(result.undoApplied === true, 'recommendation move: undo should apply when move state is unchanged');
  assert(!result.afterUndoFallCodes.includes('CMSC 132') && result.afterUndoSpringCodes[0] === 'CMSC 132', 'recommendation move: undo should restore the course to its source term and original index');
  assert(result.afterUndoSourceSelected?.section_id === 'CMSC132-0999' && result.afterUndoSourceSelected?.pinned === true, 'recommendation move: undo should restore the source pinned section');
  assert(!result.afterUndoTargetSelected, 'recommendation move: undo should leave target term free of stale course picks');
  assert(result.undoChange?.type === 'term-move-undo' && result.originalChangeAfterUndo?.undo?.appliedAt, 'recommendation move: undo should record a restore change and mark the original applied');
  assert(result.renderCalls === 2, 'recommendation move: should rerender after moving and undoing');

  return {
    id: 'RECO-MOVE',
    moved: result.fallCodes.includes('CMSC 132') ? 'CMSC 132' : '',
    from: result.candidateTerm,
  };
}

function testRecommendationBestSectionAction(context) {
  const result = clone(vm.runInContext(`
    (() => {
      let renderCalls = 0;
      const originalRender = render;
      render = () => { renderCalls += 1; };
      currentTab = 'plan';
      state.activeSchedule = [{
        id: 'PASS101F',
        name: 'Pass 101 Fall',
        year: 'Year 1',
        courses: [{
          code: 'CMSC 131',
          title: 'Object-Oriented Programming I',
          cr: 4,
          prereqs: [],
          kind: 'core',
          category: 'major-core'
        }, {
          code: 'ENGL 101',
          title: 'Academic Writing',
          cr: 3,
          prereqs: [],
          kind: 'gened',
          category: 'gened-fspw'
        }]
      }, {
        id: 'PASS101S',
        name: 'Pass 101 Spring',
        year: 'Year 1',
        courses: [{
          code: 'CMSC 132',
          title: 'Object-Oriented Programming II',
          cr: 4,
          prereqs: ['CMSC 131'],
          kind: 'core',
          category: 'major-core'
        }]
      }];
      state.customSemesters = [];
      state.customCourses = [];
      state.courses = { 'CMSC 131': { status: 'passed', grade: 'A' } };
      state.schedulePrefs = { PASS101F: { term: '202608', minBreak: 15, mode: 'balanced', avoidDays: [] } };
      state.selectedSections = {
        PASS101F: {
          ENGL101: {
            course: 'ENGL 101',
            section_id: 'ENGL101-0101',
            number: '0101',
            meetings: [{ days: 'TuTh', start_time: '9:30am', end_time: '10:45am', building: 'TWS', room: '1200' }],
            open_seats: '18',
            seats: '24',
            waitlist: '0',
          },
          HIST201: {
            course: 'HIST 201',
            section_id: 'HIST201-0101',
            semester: '202701',
            number: '0101',
            meetings: [{ days: 'F', start_time: '12:00pm', end_time: '12:50pm', building: 'TWS', room: '1101' }],
            open_seats: '6',
            seats: '30',
            waitlist: '0',
          }
        },
        PASS101S: {
          CMSC132: {
            course: 'CMSC132',
            section_id: 'CMSC132-0999',
            semester: '202609',
            number: '0999',
            meetings: [],
            pinned: true,
          }
        }
      };
      state.recentChanges = [];
      scheduleSectionsCache['PASS101F:202608:CMSC132'] = [{
        section_id: 'CMSC132-0101',
        semester: '202608',
        number: '0101',
        instructors: ['Grace Hopper'],
        meetings: [{ days: 'MW', start_time: '10:30am', end_time: '11:45am', building: 'IRB', room: '1201' }],
        open_seats: '12',
        seats: '30',
        waitlist: '0',
      }, {
        section_id: 'CMSC132-0201',
        semester: '202608',
        number: '0201',
        instructors: ['Katherine Johnson'],
        meetings: [{ days: 'TuTh', start_time: '5:00pm', end_time: '6:15pm', building: 'CSI', room: '1115' }],
        open_seats: '2',
        seats: '30',
        waitlist: '4',
      }];
      const ctx = { semId: 'PASS101F', term: '202608', termLabel: 'Fall 2026' };
      const candidate = recoBaseCandidates().find(item => normalizeCode(item.course.code) === 'CMSC132');
      candidate.sections = scheduleSectionsCache['PASS101F:202608:CMSC132'];
      candidate.bestSection = candidate.sections[0];
      candidate.bestSectionSafe = true;
      candidate.seatRisk = sectionSeatRisk(candidate.bestSection);
      const selectedItemsForCtx = recoSelectedItemsForContext(ctx);
      candidate.readinessImpact = recoCandidateReadinessImpact(candidate, ctx, selectedItemsForCtx, getSchedulePrefs(ctx.semId));
      const htmlBefore = recoRenderPick(candidate, 0, ctx);
      const picked = recoPickBestSection('CMSC 132', 'PASS101F', '202608', 'CMSC132-0101');
      const selected = getSelectedSection('PASS101F', 'CMSC 132');
      const sourceSelected = (state.selectedSections.PASS101S || {}).CMSC132 || null;
      const change = state.recentChanges[0] || null;
      const canUndoBefore = plannerChangeCanUndo(change);
      const afterPickFallCodes = state.activeSchedule[0].courses.map(course => course.code);
      const afterPickSpringCodes = state.activeSchedule[1].courses.map(course => course.code);
      const afterPickSelectedSections = JSON.parse(JSON.stringify(state.selectedSections || {}));
      state.selectedSections.PASS101F.CMSC132 = {
        course: 'CMSC132',
        section_id: 'CMSC132-0201',
        semester: '202608',
        number: '0201',
        meetings: [{ days: 'TuTh', start_time: '5:00pm', end_time: '6:15pm', building: 'CSI', room: '1115' }],
        open_seats: '2',
        seats: '30',
        waitlist: '4',
      };
      const staleCanUndo = plannerChangeCanUndo(change);
      const staleScheduleTarget = plannerChangeScheduleTarget(change);
      state.selectedSections = JSON.parse(JSON.stringify(afterPickSelectedSections));
      const undoApplied = undoPlanChange(change.id);
      const undoChange = state.recentChanges[0] || null;
      const originalChangeAfterUndo = state.recentChanges.find(item => item.id === change.id) || null;
      const afterUndoTargetSelected = getSelectedSection('PASS101F', 'CMSC 132');
      const afterUndoSourceSelected = getSelectedSection('PASS101S', 'CMSC 132');
      render = originalRender;
      return {
        candidateCode: candidate?.course?.code || '',
        picked,
        fallCodes: afterPickFallCodes,
        springCodes: afterPickSpringCodes,
        htmlBefore,
        selected,
        sourceSelected,
        change,
        canUndoBefore,
        staleCanUndo,
        staleScheduleTarget,
        undoApplied,
        afterUndoFallCodes: state.activeSchedule[0].courses.map(course => course.code),
        afterUndoSpringCodes: state.activeSchedule[1].courses.map(course => course.code),
        afterUndoTargetSelected,
        afterUndoSourceSelected,
        undoChange,
        originalChangeAfterUndo,
        readinessImpact: candidate.readinessImpact,
        selectedItemsForCtxCodes: selectedItemsForCtx.map(item => item.course.code),
        selectedItemsForCtxSectionIds: selectedItemsForCtx.map(item => item.section.section_id),
        renderCalls,
      };
    })()
  `, context));

  assert(result.candidateCode === 'CMSC 132', 'recommendation section: should find ready course candidate');
  assert(/Pick best/.test(result.htmlBefore) && /Schedule/.test(result.htmlBefore), 'recommendation section: live best pick should render pick and schedule actions');
  assert(/Term impact/.test(result.htmlBefore) && /Registration ready/.test(result.htmlBefore), 'recommendation section: live best pick should render registration-readiness impact');
  assert(!/Move here/.test(result.htmlBefore), 'recommendation section: best section action should replace move-only action');
  assert(result.selectedItemsForCtxCodes.includes('ENGL 101'), 'recommendation section: legacy no-term target pick should count toward readiness');
  assert(!result.selectedItemsForCtxSectionIds.includes('HIST201-0101'), 'recommendation section: explicit wrong-term target pick should not count toward readiness');
  assert(result.readinessImpact?.level === 'ok' && result.readinessImpact?.label === 'Registration ready', 'recommendation section: readiness impact should classify a complete safe pick as ready');
  assert(result.picked === true, 'recommendation section: action should report successful pick');
  assert(result.fallCodes.includes('CMSC 132') && !result.springCodes.includes('CMSC 132'), 'recommendation section: course should move into target term');
  assert(result.selected?.section_id === 'CMSC132-0101' && result.selected?.semester === '202608', 'recommendation section: target term should save selected posted section');
  assert(!result.sourceSelected, 'recommendation section: stale source-term section pick should be cleared');
  assert(result.change?.type === 'section-pick' && result.change?.source === 'Smart next picks', 'recommendation section: should record a single Smart next picks section change');
  assert(result.change?.undo?.kind === 'recommendation-section-pick' && result.canUndoBefore === true, 'recommendation section: Smart next pick should include an undoable restore payload');
  assert(/Picked CMSC 132/.test(result.change.title || ''), 'recommendation section: change title should name picked course');
  assert((result.change?.highlights || []).some(item => /weekly grid/i.test(item)), 'recommendation section: change should direct student to review the Schedule grid');
  assert(result.staleCanUndo === false && result.staleScheduleTarget?.semId === 'PASS101F' && result.staleScheduleTarget?.code === 'CMSC 132', 'recommendation section: edited picked section should block undo and offer Schedule recovery');
  assert(result.undoApplied === true, 'recommendation section: undo should apply when picked section is unchanged');
  assert(!result.afterUndoFallCodes.includes('CMSC 132') && result.afterUndoSpringCodes.includes('CMSC 132'), 'recommendation section: undo should move the course back to its source term');
  assert(!result.afterUndoTargetSelected, 'recommendation section: undo should restore the target term to no previous section pick');
  assert(result.afterUndoSourceSelected?.section_id === 'CMSC132-0999' && result.afterUndoSourceSelected?.pinned === true, 'recommendation section: undo should restore the source-term pinned section pick');
  assert(result.undoChange?.type === 'section-pick-undo' && result.originalChangeAfterUndo?.undo?.appliedAt, 'recommendation section: undo should record a restore change and mark the original applied');
  assert(result.renderCalls === 2, 'recommendation section: should rerender after picking and undoing');

  return {
    id: 'RECO-SECTION',
    picked: result.selected?.section_id || '',
    moved: result.fallCodes.includes('CMSC 132') ? 'CMSC 132' : '',
  };
}

function testAccountCloudSetup(context) {
  const result = clone(vm.runInContext(`
    (() => {
      const missing = accountCloudSetupChecks({ source: 'none', supabaseUrl: '', supabaseAnonKey: '' }, false, 'https://terptrack.vercel.app');
      const manual = accountCloudSetupChecks({ source: 'manual', supabaseUrl: 'https://demo.supabase.co', supabaseAnonKey: 'a'.repeat(80) }, true, 'http://127.0.0.1:5174');
      const vercel = accountCloudSetupChecks({ source: 'vercel', supabaseUrl: 'https://demo.supabase.co', supabaseAnonKey: 'b'.repeat(80) }, true, 'https://terptrack.vercel.app');
      const html = accountCloudSetupHtml({ source: 'vercel', supabaseUrl: 'https://demo.supabase.co', supabaseAnonKey: 'b'.repeat(80) }, true);
      const schemaItems = accountSchemaChecklistItems();
      const schemaHtml = accountSchemaChecklistHtml();
      const normalizedCloudState = accountNormalizeLoadedState({
        activeSchedule: [{
          id: 'cloud-fall',
          name: 'Fall 2026',
          courses: [{ code: 'MATH 140', title: 'Calculus I', cr: 4 }]
        }, {
          id: 'cloud-spring',
          name: 'Spring 2027',
          courses: [{ code: 'MATH 140', title: 'Calculus I', cr: 4 }]
        }],
        customCourses: [],
        customSemesters: [],
        customMajors: [],
        selectedSections: {
          'legacy-cloud-fall': {
            MATH140: {
              course: 'MATH 140',
              section_id: 'MATH140-0601',
              number: '0601',
              semester: '202701',
              meetings: [{ days: 'TuTh', start_time: '2:00pm', end_time: '3:15pm', building: 'MTH', room: '0701' }]
            }
          }
        },
        schedulePrefs: {},
        scheduleAdvisorFilter: 'all',
        scheduleOutputPreset: 'personal',
        scheduleOutputOptions: {},
        roadmapPrefs: {},
        browseSavedSearches: [],
        recentChanges: [],
        profilePrefs: defaultProfilePrefs(),
        settings: { ...DEFAULT_SETTINGS, programName: 'Cloud Math' },
      });
      return {
        missingStatuses: missing.map(check => check.status).join(','),
        manualDeployment: manual.find(check => check.id === 'deployment')?.status || '',
        manualClient: manual.find(check => check.id === 'client')?.status || '',
        vercelDeployment: vercel.find(check => check.id === 'deployment')?.status || '',
        vercelCredentials: vercel.find(check => check.id === 'credentials')?.status || '',
        vercelClient: vercel.find(check => check.id === 'client')?.status || '',
        html,
        schemaIds: schemaItems.map(item => item.id).join(','),
        schemaHtml,
        cloudRestore: {
          activeIds: (normalizedCloudState.activeSchedule || []).map(sem => sem.id),
          semIds: Object.keys(normalizedCloudState.selectedSections || {}),
          springSection: normalizedCloudState.selectedSections?.['cloud-spring']?.MATH140 || null,
          legacySection: normalizedCloudState.selectedSections?.['legacy-cloud-fall']?.MATH140 || null,
        },
      };
    })()
  `, context));

  assert(result.missingStatuses.split(',').every(status => status === 'missing'), 'account setup: missing config should mark every setup check missing');
  assert(result.manualDeployment === 'warn', 'account setup: manual config should warn for deployment');
  assert(result.manualClient === 'ok', 'account setup: initialized manual client should be ready');
  assert(result.vercelDeployment === 'ok', 'account setup: Vercel config should be deployment-ready');
  assert(result.vercelCredentials === 'ok', 'account setup: valid Supabase credentials should be ready');
  assert(result.vercelClient === 'ok', 'account setup: initialized Vercel client should be ready');
  assert(/Cloud setup/.test(result.html) && /Vercel env vars are serving/.test(result.html), 'account setup: readiness HTML should explain Vercel config');
  assert(result.schemaIds === 'profiles,plans,friend_requests,shared_plans,rls,updated_at', 'account setup: schema checklist should include every required object group');
  assert(/Schema objects/.test(result.schemaHtml) && /friend_requests/.test(result.schemaHtml) && /shared_plans/.test(result.schemaHtml) && /RLS policies/.test(result.schemaHtml), 'account setup: schema checklist HTML should render required Supabase objects');
  assert(result.cloudRestore.activeIds.includes('cloud-spring') && result.cloudRestore.semIds.includes('cloud-spring') && !result.cloudRestore.legacySection, 'account cloud restore: stale selected-section buckets should normalize to the active schedule term');
  assert(result.cloudRestore.springSection?.section_id === 'MATH140-0601' && result.cloudRestore.springSection?.semester === '202701', 'account cloud restore: rerouted section should preserve the posted UMD term');

  return {
    id: 'ACCOUNT-CLOUD-SETUP',
    missing: result.missingStatuses,
    vercel: [result.vercelDeployment, result.vercelCredentials, result.vercelClient].join('/'),
  };
}

function testReleaseJsonReport() {
  const stdout = execFileSync(process.execPath, [
    'scripts/run-release-checks.js',
    '--json',
    '--skip-syntax',
    '--skip-generated',
    '--skip-rendered',
    '--skip-workflows',
  ], {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const report = JSON.parse(stdout);
  const stageStatus = Object.fromEntries((report.stages || []).map(stage => [stage.id, stage.status]));
  assert(report.schema === 'terptrack-release-report/v1', 'release report: should include schema version');
  assert(report.status === 'passed', 'release report: JSON-mode run should pass');
  assert(report.options?.syntax === false && report.options?.generated === false, 'release report: options should reflect skipped gates');
  assert(stageStatus.syntax === 'skipped', 'release report: syntax stage should be represented as skipped');
  assert(stageStatus.proxy === 'passed', 'release report: proxy stage should pass when run under JSON mode');
  assert(stageStatus.generated === 'skipped', 'release report: generated stage should be represented as skipped');
  assert(stageStatus.rendered === 'skipped', 'release report: rendered stage should be represented as skipped');
  assert(stageStatus.workflows === 'skipped', 'release report: workflows stage should be represented as skipped');
  assert(stageStatus.live === 'skipped', 'release report: live stage should be represented as skipped when not requested');
  const proxyStage = (report.stages || []).find(stage => stage.id === 'proxy');
  assert(proxyStage?.commands?.[0]?.status === 'passed', 'release report: proxy command should be represented as passed');
  assert(/UMD proxy offline fixtures passed/.test(proxyStage?.commands?.[0]?.stdout || ''), 'release report: proxy stdout should be captured in JSON mode');
  assert(Number.isFinite(report.durationMs), 'release report: duration should be numeric');
  assert(!stdout.trim().startsWith('[release]'), 'release report: stdout should be clean JSON without console preamble');
  return {
    id: 'RELEASE-JSON',
    status: report.status,
    stages: Object.keys(stageStatus).join(','),
  };
}

function testCanonicalCourseTitles(context) {
  const result = clone(vm.runInContext(`
    ({
      amst205: UMDIO_CANONICAL_TITLES.AMST205,
      phys260: UMDIO_CANONICAL_TITLES.PHYS260,
    })
  `, context));
  assert(result.amst205 === 'American Material Culture: The Study of People, Places, and Things', 'canonical titles: AMST 205 should use the current live catalog title');
  assert(/Electricity/.test(result.phys260), 'canonical titles: existing PHYS override should remain present');
  return {
    id: 'COURSE-CANONICAL-TITLES',
    amst205: result.amst205,
  };
}

function testPlannerRegistrationChecklist(context) {
  const result = clone(vm.runInContext(`
    (() => {
      recoGenEdGaps = () => [{ id: 'DSHU', label: 'Humanities', have: 0, need: 1 }];
      state.settings = normalizeSettings({ ...DEFAULT_SETTINGS, catalogYear: '2024-2025' });
      state.activeSchedule = [
        {
          id: 'pass40-fall',
          name: 'Pass 40 Fall',
          courses: [
            { code: 'CMSC 216', title: 'Computer Systems', cr: 4, prereqs: ['CMSC 132'], kind: 'core', category: 'major-core' },
            { code: 'ENGL 101', title: 'Academic Writing', cr: 3, prereqs: [], kind: 'gened', category: 'gened-fspw' }
          ]
        },
        {
          id: 'pass40-spring',
          name: 'Pass 40 Spring',
          courses: [
            { code: 'CMSC 132', title: 'Object-Oriented Programming II', cr: 4, prereqs: ['CMSC 131'], kind: 'core', category: 'major-core' }
          ]
        }
      ];
      state.customCourses = [];
      state.selectedSections = {
        'pass40-fall': {
          CMSC216: {
            section_id: 'CMSC216-0101',
            semester: '202608',
            number: '0101',
            open_seats: '4',
            meetings: [{ days: 'MW', start_time: '8:00am', end_time: '9:15am', building: 'IRB', room: '1101' }]
          },
          ENGL101: {
            section_id: 'ENGL101-0101',
            semester: '202608',
            number: '0101',
            open_seats: '8',
            meetings: [{ days: 'MW', start_time: '2:00pm', end_time: '3:15pm', building: 'TWS', room: '1200' }]
          }
        }
      };
      state.schedulePrefs = { 'pass40-fall': { mode: 'compact', minBreak: 15, term: '202608' } };
      state.courses = {};
      const advisor = plannerBuildAdvisor();
      const checklist = plannerRegistrationChecklist(advisor);
      const html = plannerChecklistHtml(checklist);
      const text = plannerRegistrationChecklistText(checklist);
      return {
        titles: checklist.map(item => item.title),
        levels: checklist.map(item => item.level),
        bodies: checklist.map(item => item.body).join(' | '),
        meta: checklist.map(item => item.meta).join(' | '),
        text,
        hasScheduleButton: /data-planner-schedule/.test(html),
        hasGenEdButton: /data-planner-gened/.test(html),
      };
    })()
  `, context));

  assert(result.titles.some(title => /full-time|credit load|credits/i.test(title)), 'planner checklist: should include next-term credit-load status');
  assert(result.titles.some(title => /Confirm 2024-2025 catalog requirements/.test(title)), 'planner checklist: should include catalog-year confirmation when target differs from source');
  assert(result.titles.some(title => /prerequisite/i.test(title)), 'planner checklist: should include prerequisite order risk');
  assert(result.titles.some(title => /registration readiness/i.test(title)), 'planner checklist: should include full registration-readiness status');
  assert(/Fix before registration|Review before registration/i.test(result.bodies + result.text), 'planner checklist: readiness card should include schedule readiness detail');
  assert(/Credits warn|Prereqs danger|Seats warn/i.test(result.meta + result.text), 'planner checklist: readiness card should summarize flagged readiness gates');
  assert(result.titles.some(title => /timing fit/i.test(title)), 'planner checklist: should include picked-section timing fit');
  assert(result.titles.some(title => /Humanities|DSHU/i.test(title)), 'planner checklist: should include GenEd gap action');
  assert(result.levels.includes('danger') || result.levels.includes('warn'), 'planner checklist: should flag registration risks');
  assert(/Registration checklist/.test(result.text) && /CMSC 216/.test(result.text), 'planner checklist: export text should include checklist details');
  assert(/Target 2024-2025/.test(result.text) && /linked source 2026-2027/.test(result.text), 'planner checklist: export text should include catalog target/source metadata');
  assert(result.hasScheduleButton, 'planner checklist: should render an open Schedule action');
  assert(result.hasGenEdButton, 'planner checklist: should render a GenEd search action');

  return {
    id: 'PLANNER-CHECKLIST',
    count: result.titles.length,
    levels: result.levels.join(','),
  };
}

function testPlannerAdvisorQuestions(context) {
  const result = clone(vm.runInContext(`
    (() => {
      recoGenEdGaps = () => [{ id: 'DSHU', label: 'Humanities', have: 0, need: 1 }];
      state.settings = normalizeSettings({ ...DEFAULT_SETTINGS, catalogYear: '2024-2025' });
      state.activeSchedule = [
        {
          id: 'pass41-fall',
          name: 'Pass 41 Fall',
          courses: [
            { code: 'CMSC 216', title: 'Computer Systems', cr: 4, prereqs: ['CMSC 132'], kind: 'core', category: 'major-core' },
            { code: 'ENGL 101', title: 'Academic Writing', cr: 3, prereqs: [], kind: 'gened', category: 'gened-fspw' }
          ]
        },
        {
          id: 'pass41-spring',
          name: 'Pass 41 Spring',
          courses: [
            { code: 'CMSC 132', title: 'Object-Oriented Programming II', cr: 4, prereqs: ['CMSC 131'], kind: 'core', category: 'major-core' }
          ]
        }
      ];
      state.customCourses = [];
      state.selectedSections = {
        'pass41-fall': {
          CMSC216: {
            section_id: 'CMSC216-0101',
            semester: '202608',
            number: '0101',
            open_seats: '4',
            meetings: [{ days: 'MW', start_time: '8:00am', end_time: '9:15am', building: 'IRB', room: '1101' }]
          },
          ENGL101: {
            section_id: 'ENGL101-0101',
            semester: '202608',
            number: '0101',
            open_seats: '8',
            meetings: [{ days: 'MW', start_time: '2:00pm', end_time: '3:15pm', building: 'TWS', room: '1200' }]
          }
        }
      };
      state.schedulePrefs = { 'pass41-fall': { mode: 'compact', minBreak: 15, term: '202608' } };
      state.courses = {};
      const advisor = plannerBuildAdvisor();
      const checklist = plannerRegistrationChecklist(advisor);
      const questions = plannerAdvisorQuestions(advisor, checklist);
      const html = plannerAdvisorQuestionsHtml(questions);
      const text = plannerAdvisorQuestionsText(questions);
      return {
        titles: questions.map(item => item.title),
        levels: questions.map(item => item.level),
        questions: questions.map(item => item.question).join(' | '),
        whys: questions.map(item => item.why).join(' | '),
        meta: questions.map(item => item.meta).join(' | '),
        text,
        hasCopyButton: /data-planner-copy-questions/.test(html),
        hasScheduleButton: /data-planner-schedule/.test(html),
        hasGenEdButton: /data-planner-gened/.test(html),
      };
    })()
  `, context));

  assert(result.titles.some(title => /credit|load|full-time/i.test(title)), 'planner questions: should include credit-load advisor question');
  assert(result.titles.some(title => /Catalog-year confirmation/.test(title)), 'planner questions: should include catalog-year advisor question');
  assert(result.titles.some(title => /CMSC 216 prerequisite/i.test(title)), 'planner questions: should include prerequisite advisor question');
  assert(result.titles.some(title => /registration readiness/i.test(title)), 'planner questions: should include full registration-readiness advisor question');
  assert(/registration issue should I resolve first/i.test(result.questions), 'planner questions: readiness question should ask which registration blocker to resolve first');
  assert(/Credits warn|Prereqs danger|Seats warn/i.test(result.meta + result.text), 'planner questions: readiness question should summarize flagged readiness gates');
  assert(/switch any Pass 41 Fall sections|timing|schedule/i.test(result.questions), 'planner questions: should include picked-section timing question');
  assert(/DSHU|Humanities|GenEd/i.test(result.questions + result.whys), 'planner questions: should include GenEd advisor question');
  assert(result.levels.includes('danger') || result.levels.includes('warn'), 'planner questions: should preserve risk levels');
  assert(/Advisor questions/.test(result.text) && /CMSC 216/.test(result.text), 'planner questions: export text should include question details');
  assert(/2024-2025 catalog requirements/.test(result.text) && /official UMD audit/.test(result.text), 'planner questions: export text should include catalog-year evidence question');
  assert(result.hasCopyButton, 'planner questions: should render select questions action');
  assert(result.hasScheduleButton, 'planner questions: should render an open Schedule action');
  assert(result.hasGenEdButton, 'planner questions: should render a GenEd search action');

  return {
    id: 'PLANNER-QUESTIONS',
    count: result.titles.length,
    levels: result.levels.join(','),
  };
}

function testPlannerSectionTermGuards(context) {
  const result = clone(vm.runInContext(`
    (() => {
      recoGenEdGaps = () => [];
      state.settings = normalizeSettings({ ...DEFAULT_SETTINGS, catalogYear: '2026-2027' });
      const cmscWrongTerm = {
        section_id: 'CMSC131-0999',
        semester: '202701',
        number: '0999',
        open_seats: '14',
        waitlist: '0',
        seats: '30',
        meetings: [{ days: 'MW', start_time: '10:00am', end_time: '11:15am', building: 'IRB', room: '1101' }]
      };
      const englCurrentTerm = {
        section_id: 'ENGL101-0101',
        semester: '202608',
        number: '0101',
        open_seats: '8',
        waitlist: '0',
        seats: '24',
        meetings: [{ days: 'TuTh', start_time: '11:00am', end_time: '12:15pm', building: 'TWS', room: '1200' }]
      };
      state.activeSchedule = [{
        id: 'pass158-fall',
        name: 'Pass 158 Fall',
        courses: [
          { code: 'CMSC 131', title: 'Object-Oriented Programming I', cr: 4, prereqs: [], kind: 'core', category: 'major-core' },
          { code: 'ENGL 101', title: 'Academic Writing', cr: 3, prereqs: [], kind: 'gened', category: 'gened-fspw' }
        ]
      }];
      state.customCourses = [];
      state.courses = {};
      state.schedulePrefs = { 'pass158-fall': { ...DEFAULT_SCHEDULE_PREFS, term: '202608', minBreak: 15, mode: 'balanced' } };
      state.selectedSections = {
        'pass158-fall': {
          CMSC131: cmscWrongTerm,
          ENGL101: englCurrentTerm
        }
      };
      const advisor = plannerBuildAdvisor();
      const sem = state.activeSchedule[0];
      const semItems = advisor.itemsBySem['pass158-fall'] || [];
      const selectedItems = plannerRegistrationSelectedItems('pass158-fall', semItems);
      const readinessContext = plannerRegistrationReadinessContext(sem, semItems);
      const checklist = plannerRegistrationChecklist(advisor);
      const questions = plannerAdvisorQuestions(advisor, checklist);
      const checklistText = plannerRegistrationChecklistText(checklist);
      const questionsText = plannerAdvisorQuestionsText(questions);
      return {
        selectedCodes: selectedItems.map(item => item.course.code),
        unscheduled: readinessContext.unscheduled.map(course => course.code),
        gateLevels: Object.fromEntries(readinessContext.readiness.gates.map(gate => [gate.id, gate.level])),
        readinessLabel: readinessContext.readiness.label,
        readinessDetail: readinessContext.readiness.detail,
        readinessFixes: readinessContext.readiness.fixes,
        checklistText,
        questionsText,
        checklistMeta: checklist.map(item => item.meta || '').join(' | '),
        questionMeta: questions.map(item => item.meta || '').join(' | '),
        hasScheduleButton: /data-planner-schedule="pass158-fall"/.test(plannerChecklistHtml(checklist) + plannerAdvisorQuestionsHtml(questions)),
      };
    })()
  `, context));

  assert(result.selectedCodes.length === 1 && result.selectedCodes[0] === 'ENGL 101', 'planner term guards: wrong-term sections should not count as selected next-term items');
  assert(result.unscheduled.includes('CMSC 131') && !result.unscheduled.includes('ENGL 101'), 'planner term guards: wrong-term pick should stay unscheduled while current-term pick counts');
  assert(result.gateLevels.sections === 'danger', 'planner term guards: readiness sections gate should block wrong-term picks');
  assert(/Fix before registration/.test(result.readinessLabel), 'planner term guards: readiness should require fixes');
  assert(result.readinessFixes.some(fix => /Pick sections for CMSC 131/.test(fix)), 'planner term guards: fixes should name the course needing a current-term section');
  assert(/Sections danger/.test(result.checklistMeta + result.checklistText), 'planner term guards: checklist should summarize the section blocker');
  assert(/CMSC 131/.test(result.checklistText) && !/0999/.test(result.checklistText), 'planner term guards: checklist should name the course without treating the stale section as picked');
  assert(/registration issue should I resolve first/i.test(result.questionsText), 'planner term guards: advisor questions should ask about the readiness blocker');
  assert(/Sections danger/.test(result.questionMeta + result.questionsText), 'planner term guards: advisor question should summarize the section blocker');
  assert(result.hasScheduleButton, 'planner term guards: checklist/questions should keep the Schedule recovery action');

  return {
    id: 'PLANNER-TERM-SECTIONS',
    selected: result.selectedCodes.join(','),
    unscheduled: result.unscheduled.join(','),
  };
}

async function testPlannerAvailabilitySeatPressure(context) {
  const result = clone(await vm.runInContext(`
    (async () => {
      const originalFetchSemesters = umdioFetchSemesters;
      const originalFetchSections = umdioFetchSections;
      try {
        state.activeSchedule = [
          {
            id: 'pass148-fall',
            name: 'Fall 2026',
            courses: [
              { code: 'CMSC 132', title: 'Object-Oriented Programming II', cr: 4, prereqs: [], kind: 'core', category: 'major-core' }
            ]
          },
          {
            id: 'pass148-spring',
            name: 'Spring 2027',
            courses: []
          }
        ];
        state.customCourses = [];
        state.courses = {};
        state.selectedSections = {};
        state.schedulePrefs = {};
        umdioFetchSemesters = async () => ['202701', '202608', '202508', '202408'];
        umdioFetchSections = async (code, term) => {
          const norm = normalizeCode(code);
          const cleanTerm = String(term || '');
          if (norm === 'CMSC132' && cleanTerm === '202608') {
            return [
              { section_id: 'CMSC132-0101', semester: cleanTerm, number: '0101', open_seats: '0', waitlist: '12', seats: '30' },
              { section_id: 'CMSC132-0201', semester: cleanTerm, number: '0201', open_seats: '0', waitlist: '3', seats: '30' }
            ];
          }
          if (norm === 'CMSC132' && cleanTerm === '202701') {
            return [
              { section_id: 'CMSC132-0301', semester: cleanTerm, number: '0301', open_seats: '24', waitlist: '0', seats: '30' }
            ];
          }
          if (norm === 'CMSC132' && (cleanTerm === '202508' || cleanTerm === '202408')) {
            return [
              { section_id: 'CMSC132-HIST', semester: cleanTerm, number: '0101', open_seats: '6', waitlist: '0', seats: '30' }
            ];
          }
          return [];
        };
        const advisor = plannerBuildAdvisor();
        const analysis = await plannerAnalyzeAvailability(advisor);
        const row = analysis.rows.find(item => item.code === 'CMSC 132');
        const html = plannerAvailabilityRow(row);
        return {
          stats: analysis.stats,
          level: row && row.level,
          title: row && row.title,
          detail: row && row.detail,
          seatLevel: row && row.seatProfile && row.seatProfile.level,
          seatLabel: row && row.seatProfile && row.seatProfile.shortLabel,
          suggestionSem: row && row.suggestion && row.suggestion.sem && row.suggestion.sem.id,
          suggestionReason: row && row.suggestion && row.suggestion.reason,
          html,
        };
      } finally {
        umdioFetchSemesters = originalFetchSemesters;
        umdioFetchSections = originalFetchSections;
      }
    })()
  `, context));

  assert(result.level === 'danger', 'planner availability: posted but closed sections should be urgent');
  assert(/posted sections but no open seats/i.test(result.title), 'planner availability: title should name closed posted sections');
  assert(/0 open seats.*15 waitlisted/i.test(result.detail), 'planner availability: detail should include total open seats and waitlist pressure');
  assert(result.seatLevel === 'danger' && /0 open seats, 15 waitlisted/.test(result.seatLabel), 'planner availability: seat profile should summarize closed/waitlisted sections');
  assert(result.stats.risk === 1 && result.stats.checked === 1, 'planner availability: stats should count the closed-seat row as risk');
  assert(result.suggestionSem === 'pass148-spring', 'planner availability: should suggest the future term with open seats');
  assert(/24 open seats/.test(result.suggestionReason) && /Move there/.test(result.html), 'planner availability: rendered row should show open-seat suggestion and move action');

  return {
    id: 'PLANNER-AVAILABILITY-SEATS',
    level: result.level,
    suggestion: result.suggestionSem,
  };
}

function testPlannerTermMoveUndo(context) {
  const result = clone(vm.runInContext(`
    (() => {
      state.activeSchedule = [
        {
          id: 'pass149-fall',
          name: 'Pass 149 Fall',
          courses: [
            { code: 'CMSC 132', title: 'Object-Oriented Programming II', cr: 4, prereqs: [], kind: 'core', category: 'major-core' },
            { code: 'ENGL 101', title: 'Academic Writing', cr: 3, prereqs: [], kind: 'gened', category: 'gened-fspw' }
          ]
        },
        {
          id: 'pass149-spring',
          name: 'Pass 149 Spring',
          courses: []
        }
      ];
      state.customCourses = [];
      state.selectedSections = {
        'pass149-fall': {
          CMSC132: { section_id: 'CMSC132-0101', semester: '202608', number: '0101', open_seats: '0', waitlist: '8' }
        },
        'pass149-spring': {
          CMSC132: { section_id: 'CMSC132-0999', semester: '202701', number: '0999', open_seats: '2', waitlist: '0' }
        }
      };
      state.recentChanges = [];
      const oldRender = render;
      const oldToastSuccess = toastSuccess;
      const oldGetElementById = document.getElementById;
      let renderCalls = 0;
      const successMessages = [];
      const historyRoot = { innerHTML: '' };
      render = () => { renderCalls += 1; };
      toastSuccess = message => { successMessages.push(message); };
      document.getElementById = id => id === 'plan-change-history' ? historyRoot : oldGetElementById(id);
      try {
        const moved = plannerApplyMove('CMSC 132', 'pass149-fall', 'pass149-spring');
        const change = state.recentChanges[0] || null;
        renderPlanChangeHistory();
        const historyHtml = historyRoot.innerHTML;
        const canUndoBefore = plannerChangeCanUndo(change);
        const afterMoveSchedule = JSON.parse(JSON.stringify(state.activeSchedule));
        const afterMoveSpringBeforeUndo = afterMoveSchedule[1].courses.map(course => course.code);
        const afterMoveSelectedSections = JSON.parse(JSON.stringify(state.selectedSections || {}));
        const afterMoveSelectedFall = afterMoveSelectedSections['pass149-fall'] || null;
        const afterMoveSelectedSpring = afterMoveSelectedSections['pass149-spring'] || null;
        state.activeSchedule[1].courses = [];
        renderPlanChangeHistory();
        const staleHistoryHtml = historyRoot.innerHTML;
        const staleCanUndo = plannerChangeCanUndo(change);
        const staleTermTarget = plannerChangeTermTarget(change);
        state.activeSchedule = afterMoveSchedule;
        state.selectedSections = {
          'pass149-spring': {
            CMSC132: { section_id: 'CMSC132-NEW', semester: '202701', number: 'NEW', open_seats: '6', waitlist: '0' }
          }
        };
        renderPlanChangeHistory();
        const staleSectionHistoryHtml = historyRoot.innerHTML;
        const staleSectionCanUndo = plannerChangeCanUndo(change);
        const staleSectionReviewTarget = plannerChangeReviewTarget(change);
        const staleSectionScheduleTarget = plannerChangeScheduleTarget(change);
        const staleSectionTermTarget = plannerChangeTermTarget(change);
        state.selectedSections = {
          'pass149-fall': {
            CMSC132: { section_id: 'CMSC132-SOURCE-NEW', semester: '202608', number: 'SRC', open_seats: '4', waitlist: '0' }
          }
        };
        renderPlanChangeHistory();
        const staleSourceSectionHistoryHtml = historyRoot.innerHTML;
        const staleSourceSectionCanUndo = plannerChangeCanUndo(change);
        const staleSourceSectionScheduleTarget = plannerChangeScheduleTarget(change);
        const staleSourceSectionTermTarget = plannerChangeTermTarget(change);
        state.selectedSections = JSON.parse(JSON.stringify(afterMoveSelectedSections));
        const undoApplied = undoPlanChange(change.id);
        const undoChange = state.recentChanges[0] || null;
        const originalChangeAfterUndo = state.recentChanges.find(item => item.id === change.id) || null;
        const afterUndoSourceSelected = state.selectedSections['pass149-fall']?.CMSC132 || null;
        const afterUndoTargetSelected = state.selectedSections['pass149-spring']?.CMSC132 || null;

        state.customCourses = [{ code: 'INST 201', title: 'Information Science', cr: 3, semId: 'pass149-fall', isCustom: true }];
        const customMoved = plannerApplyMove('INST 201', 'pass149-fall', 'pass149-spring');
        const customChange = state.recentChanges[0] || null;
        const customAfterMove = (state.customCourses || []).find(item => normalizeCode(item.code) === 'INST201')?.semId || '';
        const customUndoApplied = undoPlanChange(customChange.id);
        const customAfterUndo = (state.customCourses || []).find(item => normalizeCode(item.code) === 'INST201')?.semId || '';

        return {
          moved,
          afterMoveFall: state.activeSchedule[0].courses.map(course => course.code),
          afterMoveSpringBeforeUndo,
          afterMoveSelectedFall,
          afterMoveSelectedSpring,
          undoKind: change && change.undo && change.undo.kind,
          undoFrom: change && change.undo && change.undo.fromSemId,
          undoTo: change && change.undo && change.undo.toSemId,
          historyHtml,
          canUndoBefore,
          staleHistoryHtml,
          staleCanUndo,
          staleTermTarget,
          staleSectionHistoryHtml,
          staleSectionCanUndo,
          staleSectionReviewTarget,
          staleSectionScheduleTarget,
          staleSectionTermTarget,
          staleSourceSectionHistoryHtml,
          staleSourceSectionCanUndo,
          staleSourceSectionScheduleTarget,
          staleSourceSectionTermTarget,
          undoApplied,
          afterUndoFall: state.activeSchedule[0].courses.map(course => course.code),
          afterUndoSpring: state.activeSchedule[1].courses.map(course => course.code),
          afterUndoSourceSelected,
          afterUndoTargetSelected,
          undoChange,
          originalChangeAfterUndo,
          customMoved,
          customAfterMove,
          customUndoApplied,
          customAfterUndo,
          renderCalls,
          successMessages,
        };
      } finally {
        render = oldRender;
        toastSuccess = oldToastSuccess;
        document.getElementById = oldGetElementById;
      }
    })()
  `, context));

  assert(result.moved === true, 'planner term move undo: initial move should apply');
  const afterMoveSpringNorm = result.afterMoveSpringBeforeUndo.map(code => String(code || '').replace(/\s+/g, '').toUpperCase());
  assert(!afterMoveSpringNorm.includes('ENGL101') && afterMoveSpringNorm.includes('CMSC132'), 'planner term move undo: moved course should land in target term before undo');
  assert(!result.afterMoveSelectedFall && !result.afterMoveSelectedSpring, 'planner term move undo: moving a course should clear stale selected sections in source and target terms');
  assert(result.undoKind === 'term-move' && result.undoFrom === 'pass149-fall' && result.undoTo === 'pass149-spring', 'planner term move undo: recent change should include term-move undo payload');
  assert(/data-change-undo/.test(result.historyHtml) && result.canUndoBefore === true, 'planner term move undo: recent history should render undo while safe');
  assert(result.staleCanUndo === false && /moved or removed/.test(result.staleHistoryHtml), 'planner term move undo: stale target changes should disable undo with explanation');
  assert(/data-change-term/.test(result.staleHistoryHtml) && result.staleTermTarget?.semId === 'pass149-spring', 'planner term move undo: stale row should still offer a move-term recovery jump');
  assert(result.staleSectionCanUndo === false && /target-term section pick changed/.test(result.staleSectionHistoryHtml), 'planner term move undo: new target section picks should disable undo');
  assert(result.staleSectionReviewTarget?.code === 'CMSC 132', 'planner term move undo: stale section row should offer the moved-course recovery jump');
  assert(/data-change-schedule/.test(result.staleSectionHistoryHtml) && result.staleSectionScheduleTarget?.semId === 'pass149-spring' && result.staleSectionScheduleTarget?.code === 'CMSC 132', 'planner term move undo: stale target section row should offer a target Schedule jump');
  assert(result.staleSectionTermTarget?.semId === 'pass149-spring' && result.staleSectionTermTarget?.label === 'Show target term', 'planner term move undo: stale target section row should label the target term jump');
  assert(result.staleSourceSectionCanUndo === false && /source-term section pick changed/.test(result.staleSourceSectionHistoryHtml), 'planner term move undo: new source section picks should disable undo');
  assert(!result.staleSourceSectionScheduleTarget && !/data-change-schedule/.test(result.staleSourceSectionHistoryHtml), 'planner term move undo: stale source-only section row should not offer a Schedule jump to a missing course row');
  assert(result.staleSourceSectionTermTarget?.semId === 'pass149-fall' && result.staleSourceSectionTermTarget?.label === 'Show source term', 'planner term move undo: stale source section row should point to the source term');
  assert(result.undoApplied === true, 'planner term move undo: undo should apply');
  assert(result.afterUndoFall[0] === 'CMSC 132' && result.afterUndoFall.includes('ENGL 101'), 'planner term move undo: undo should restore original term and position');
  assert(!result.afterUndoSpring.includes('CMSC 132'), 'planner term move undo: undo should remove course from target term');
  assert(result.afterUndoSourceSelected?.section_id === 'CMSC132-0101', 'planner term move undo: undo should restore the source-term section pick cleared by the move');
  assert(!result.afterUndoTargetSelected, 'planner term move undo: undo should leave the target term free of stale moved-course picks');
  assert(result.undoChange?.type === 'term-move-undo', 'planner term move undo: undo should record a restore change');
  assert(result.originalChangeAfterUndo?.undo?.appliedAt, 'planner term move undo: original move should be marked applied');
  assert(result.customMoved === true && result.customAfterMove === 'pass149-spring', 'planner term move undo: custom course move should apply');
  assert(result.customUndoApplied === true && result.customAfterUndo === 'pass149-fall', 'planner term move undo: custom course undo should restore the original term');

  return {
    id: 'PLANNER-TERM-MOVE-UNDO',
    restored: result.afterUndoFall[0],
    custom: result.customAfterUndo,
  };
}

async function testBrowseProfileDepartments(context) {
  const result = clone(await vm.runInContext(`
    (async () => {
      const calls = [];
      umdioListCoursesByDept = async dept => {
        calls.push('dept:' + dept);
        return [
          { course_id: dept + '101', name: dept + ' profile course', description: 'profile fit', gen_ed: [] },
          { course_id: 'INST201', name: 'Shared profile course', description: 'shared', gen_ed: [] }
        ];
      };
      umdioListCoursesByGenEd = async (tag, opts = {}) => {
        const dept = String(opts.dept || '');
        calls.push('gened:' + tag + ':' + dept);
        if (!dept) {
          return [
            { course_id: 'HIST150', name: 'Global ' + tag + ' GenEd', description: 'all department fit', gen_ed: [tag] },
            { course_id: 'INST201', name: 'Shared Global GenEd', description: 'shared', gen_ed: [tag] }
          ];
        }
        return [
          { course_id: dept + '150', name: dept + ' GenEd', description: 'gened profile fit', gen_ed: [tag] },
          { course_id: 'INST201', name: 'Shared GenEd', description: 'shared', gen_ed: [tag] }
        ];
      };
      state.profilePrefs = normalizeProfilePrefs({
        interests: ['ai-data', 'policy-society'],
        careerGoal: 'machine learning for public policy',
        genEdDepts: 'INST, PSYC, GVPT'
      });
      browseDept = '';
      browseSearch = '';
      browseGenEd = '';
      browseCache = [];
      browseCacheKey = '';
      browseProfileDefaultsApplied = false;
      applyBrowseProfileDefaults();
      const defaultDept = browseDept;
      const defaultScope = browseDepartmentScope();
      browseGenEd = 'DSHS';
      const genEdRows = await browseListCoursesForCurrentScope();
      browseDept = BROWSE_ALL_DEPTS_VALUE;
      browseGenEd = 'DSHU';
      const allDeptScope = browseDepartmentScope();
      const allDeptRows = await browseListCoursesForCurrentScope();
      const allDeptLabel = browseSearchLabel({ dept: BROWSE_ALL_DEPTS_VALUE, genEd: 'DSHU', search: '' });
      browseDept = BROWSE_PROFILE_DEPTS_VALUE;
      browseGenEd = '';
      const deptRows = await browseListCoursesForCurrentScope();
      state.browseSavedSearches = [];
      browseDept = BROWSE_PROFILE_DEPTS_VALUE;
      browseGenEd = 'DSHS';
      browseSearch = 'policy';
      browseSaveCurrentSearch();
      const saved = browseSavedSearches();
      browseDept = 'CMSC';
      browseGenEd = '';
      browseSearch = '';
      browseApplySavedSearch(saved[0].id);
      const restored = { dept: browseDept, genEd: browseGenEd, search: browseSearch };
      browseDeleteSavedSearch(saved[0].id);
      browseDept = BROWSE_ALL_DEPTS_VALUE;
      browseGenEd = 'DSHU';
      browseSearch = 'global';
      browseSaveCurrentSearch();
      const allDeptSaved = browseSavedSearches()[0] || {};
      browseDept = 'CMSC';
      browseGenEd = '';
      browseSearch = '';
      browseApplySavedSearch(allDeptSaved.id);
      const restoredAllDept = { dept: browseDept, genEd: browseGenEd, search: browseSearch };
      return {
        defaultDept,
        scope: defaultScope.depts.slice(0, 4),
        genEdCodes: genEdRows.map(row => row.course_id).sort(),
        allDeptScopeCount: allDeptScope.depts.length,
        allDeptCodes: allDeptRows.map(row => row.course_id).sort(),
        allDeptLabel,
        deptCodes: deptRows.map(row => row.course_id).sort(),
        callCount: calls.length,
        calls,
        savedCount: saved.length,
        savedLabel: saved[0]?.label || '',
        restored,
        allDeptSavedLabel: allDeptSaved.label || '',
        restoredAllDept,
        afterDelete: state.browseSavedSearches.length,
      };
    })()
  `, context));

  assert(result.defaultDept === '__PROFILE_DEPTS__', 'browse profile: should default to profile department mode');
  assert(result.scope.includes('INST') && result.scope.includes('PSYC') && result.scope.includes('GVPT'), 'browse profile: expected preferred departments in scope');
  assert(result.genEdCodes.includes('INST150') && result.genEdCodes.includes('PSYC150'), 'browse profile: GenEd search should fan out across profile departments');
  assert(result.allDeptScopeCount >= 100, 'browse all departments: should expose the full common department scope');
  assert(result.allDeptCodes.includes('HIST150'), 'browse all departments: GenEd search should use the global all-department path');
  assert(result.calls.includes('gened:DSHU:'), 'browse all departments: expected a global GenEd API call without a department');
  assert(!result.calls.includes('gened:DSHU:INST'), 'browse all departments: should not stay limited to profile departments');
  assert(/All departments/.test(result.allDeptLabel) && /DSHU/.test(result.allDeptLabel), 'browse all departments: search label should identify the broad scope');
  assert(result.deptCodes.includes('INST101') && result.deptCodes.includes('PSYC101'), 'browse profile: department search should fan out across profile departments');
  assert(result.genEdCodes.filter(code => code === 'INST201').length === 1, 'browse profile: GenEd rows should dedupe shared courses');
  assert(result.deptCodes.filter(code => code === 'INST201').length === 1, 'browse profile: department rows should dedupe shared courses');
  assert(result.callCount >= 6, 'browse profile: expected multiple department calls');
  assert(result.savedCount === 1, 'browse saved search: should save one preset');
  assert(/Profile departments/.test(result.savedLabel) && /DSHS/.test(result.savedLabel), 'browse saved search: label should summarize filters');
  assert(result.restored.dept === '__PROFILE_DEPTS__' && result.restored.genEd === 'DSHS' && result.restored.search === 'policy', 'browse saved search: apply should restore filters');
  assert(/All departments/.test(result.allDeptSavedLabel) && /DSHU/.test(result.allDeptSavedLabel), 'browse saved search: all-department preset should label broad GenEd search');
  assert(result.restoredAllDept.dept === '__ALL_DEPTS__' && result.restoredAllDept.genEd === 'DSHU' && result.restoredAllDept.search === 'global', 'browse saved search: apply should restore all-department filters');
  assert(result.afterDelete === 1, 'browse saved search: delete should remove only the first preset');

  return {
    id: 'BROWSE-PROFILE-SAVED',
    scope: result.scope.join(','),
    genEdCount: result.genEdCodes.length,
    deptCount: result.deptCodes.length,
    saved: result.savedLabel,
  };
}

async function testBrowseResultSections(context) {
  const result = clone(await vm.runInContext(`
    (() => {
      state.profilePrefs = normalizeProfilePrefs({
        interests: ['ai-data', 'policy-society'],
        careerGoal: 'machine learning for public policy',
        genEdDepts: 'INST, PSYC, GVPT'
      });
      recoGenEdGaps = () => [{ id: 'DSHS', label: 'History and Social Sciences', have: 0, need: 1 }];
      const nextTerm = { term: '202608', termLabel: 'Fall 2026' };
      const availability = {};
      availability[browseAvailabilityKey(nextTerm.term, 'INST150')] = {
        term: nextTerm.term,
        termLabel: nextTerm.termLabel,
        sectionCount: 3,
        openSeats: 18
      };
      availability[browseAvailabilityKey(nextTerm.term, 'GVPT200')] = {
        term: nextTerm.term,
        termLabel: nextTerm.termLabel,
        sectionCount: 0,
        openSeats: 0
      };
      const rows = [
        {
          course_id: 'INST150',
          name: 'Data, Policy, and Society',
          description: 'Data analytics and public policy for civic technology.',
          credits: '3',
          gen_ed: ['DSHS']
        },
        {
          course_id: 'PSYC200',
          name: 'Development and Decision Making',
          description: 'Psychology, public health, and learning communities.',
          credits: '3',
          gen_ed: ['DSHU']
        },
        {
          course_id: 'GVPT200',
          name: 'Public Policy Process',
          description: 'Government institutions, equity, and policy design.',
          credits: '3',
          gen_ed: ['DSSP']
        },
        {
          course_id: 'MATH140',
          name: 'Calculus I',
          description: 'Differential and integral calculus.',
          credits: '4',
          gen_ed: []
        }
      ];
      const plannedMap = new Map([['MATH140', { course: { code: 'MATH140' }, semName: 'Fall 2026' }]]);
      const decorated = browseDecorateRows(rows, { availability, nextTerm, plannedMap }).sort(browseCompareRows);
      const sections = browseBuildResultSections(decorated, nextTerm);
      const html = browseHighlightsHtml(sections);
      const byId = Object.fromEntries(sections.map(section => [section.id, section.items.map(item => item.code)]));
      return {
        titles: sections.map(section => section.title),
        byId,
        html,
        firstCode: decorated[0].code,
        planned: decorated.find(item => item.code === 'MATH140'),
        available: decorated.find(item => item.code === 'INST150').availability,
      };
    })()
  `, context));

  assert(result.firstCode === 'INST150', 'browse sections: gap + profile + posted sections should rank first');
  assert(result.byId.best.includes('INST150'), 'browse sections: best section should include top fit');
  assert(result.byId.gaps.includes('INST150'), 'browse sections: GenEd gap section should include DSHS match');
  assert(result.byId.available.includes('INST150'), 'browse sections: available section should include posted-section match');
  assert(result.planned.inPlan, 'browse sections: should tag courses already in plan');
  assert(result.available.sectionCount === 3 && result.available.openSeats === 18, 'browse sections: should carry posted section counts and seats');
  assert(/Browse highlights/.test(result.html), 'browse sections: should render highlight wrapper');
  assert(/Best for your plan/.test(result.html), 'browse sections: should render best-fit section');
  assert(/Fills missing GenEds/.test(result.html), 'browse sections: should render GenEd gap section');
  assert(/Available in Fall 2026/.test(result.html), 'browse sections: should render next-term availability section');
  assert(/3 posted/.test(result.html) && /18 open/.test(result.html), 'browse sections: should render posted-section badge');
  assert(/Profile fit/.test(result.html), 'browse sections: should render profile-fit tags');

  return {
    id: 'BROWSE-SECTIONS',
    first: result.firstCode,
    sections: result.titles.join(' | '),
    availability: `${result.available.sectionCount}/${result.available.openSeats}`,
  };
}

async function testBrowseExplanationPanel(context) {
  const result = clone(await vm.runInContext(`
    (() => {
      state.profilePrefs = normalizeProfilePrefs({
        interests: ['ai-data', 'policy-society'],
        careerGoal: 'machine learning for public policy',
        genEdDepts: 'INST, PSYC, GVPT'
      });
      recoGenEdGaps = () => [{ id: 'DSHS', label: 'History and Social Sciences', have: 0, need: 1 }];
      const nextTerm = { term: '202608', termLabel: 'Fall 2026' };
      const availability = {};
      availability[browseAvailabilityKey(nextTerm.term, 'INST150')] = {
        term: nextTerm.term,
        termLabel: nextTerm.termLabel,
        sectionCount: 3,
        openSeats: 18
      };
      const rows = [{
        course_id: 'INST150',
        name: 'Data, Policy, and Society',
        description: 'Data analytics and public policy for civic technology.',
        credits: '3',
        gen_ed: ['DSHS'],
        average_gpa: 3.42,
        relationships: {
          prereqs: 'Minimum grade of C- in STAT100 or MATH115.'
        }
      }];
      const item = browseDecorateRows(rows, {
        availability,
        nextTerm,
        plannedMap: new Map()
      }).sort(browseCompareRows)[0];
      const reasons = browseExplanationItems(item, nextTerm);
      browseWhyCode = '';
      const closedHtml = browseCourseCardHtml(item, { nextTerm });
      browseToggleWhy('INST150');
      const openedCode = browseWhyCode;
      const openHtml = browseCourseCardHtml(item, { nextTerm });
      browseToggleWhy('INST150');
      const closedCode = browseWhyCode;
      return {
        titles: reasons.map(reason => reason.title),
        detailText: reasons.map(reason => reason.detail).join(' | '),
        score: item.score,
        closedHtml,
        openHtml,
        openedCode,
        closedCode
      };
    })()
  `, context));

  assert(result.openedCode === 'INST150', 'browse why: toggle should open selected course explanation');
  assert(result.closedCode === '', 'browse why: second toggle should close selected course explanation');
  assert(!/browse-why-panel/.test(result.closedHtml), 'browse why: closed card should not render explanation panel');
  assert(/browse-why-panel/.test(result.openHtml), 'browse why: open card should render explanation panel');
  assert(/Why this course/.test(result.openHtml) && /Rank score/.test(result.openHtml), 'browse why: panel should show score header');
  assert(result.titles.includes('Ranking'), 'browse why: should include ranking explanation');
  assert(result.titles.includes('GenEd gap'), 'browse why: should include GenEd gap explanation');
  assert(result.titles.includes('Profile fit'), 'browse why: should include profile explanation');
  assert(result.titles.includes('Sections'), 'browse why: should include section availability explanation');
  assert(result.titles.includes('Prereqs'), 'browse why: should include prerequisite explanation');
  assert(result.titles.includes('GPA signal'), 'browse why: should include GPA explanation');
  assert(/DSHS/.test(result.detailText), 'browse why: GenEd detail should name the matched gap');
  assert(/profile fit/i.test(result.detailText), 'browse why: ranking detail should include profile contribution');
  assert(/3 posted sections/.test(result.detailText) && /18 open seats/.test(result.detailText), 'browse why: section detail should include posted sections and seats');
  assert(/STAT 100/.test(result.detailText) && /MATH 115/.test(result.detailText), 'browse why: prerequisite detail should extract course codes');
  assert(/Average GPA 3.42/.test(result.detailText), 'browse why: GPA detail should show average GPA');

  return {
    id: 'BROWSE-WHY',
    score: result.score,
    reasons: result.titles.join(','),
  };
}

async function testBrowseImpactPreview(context) {
  const result = clone(await vm.runInContext(`
    (() => {
      state.activeSchedule = [{
        id: 'PASS50A',
        name: 'Pass 50 Fall 2026',
        year: 'Year 1',
        courses: [{
          code: 'GenEd DSHS',
          title: 'History and Social Sciences placeholder',
          cr: 3,
          kind: 'gened',
          category: 'gened-dshs',
          categories: ['gened-dshs'],
          note: 'Auto-generated DSHS placeholder'
        }, {
          code: 'ENGL 101',
          title: 'Academic Writing',
          cr: 3,
          kind: 'gened',
          category: 'gened-fsaw',
          categories: ['gened-fsaw']
        }]
      }];
      state.customCourses = [];
      state.courses = {
        'STAT 100': { status: 'passed', grade: 'A' }
      };
      state.profilePrefs = normalizeProfilePrefs({
        interests: ['policy-society'],
        careerGoal: 'public policy',
        genEdDepts: 'GVPT'
      });
      recoGenEdGaps = () => [{ id: 'DSHS', label: 'History and Social Sciences', have: 0, need: 1 }];
      placeholderSearchTarget = null;
      placeholderSearchSelectedTags = [];
      browseImpactKey = '';
      browseWhyKey = '';
      browseWhyCode = '';
      browseSlotKey = '';
      const nextTerm = { semId: 'PASS50A', semName: 'Pass 50 Fall 2026', term: '202608', termLabel: 'Fall 2026' };
      const availability = {};
      availability[browseAvailabilityKey(nextTerm.term, 'GVPT200')] = {
        term: nextTerm.term,
        termLabel: nextTerm.termLabel,
        sectionCount: 2,
        openSeats: 12
      };
      const rows = [{
        course_id: 'GVPT200',
        name: 'International Political Relations',
        credits: '3',
        description: 'A public policy and international relations course.',
        gen_ed: ['DSHS', 'DVUP'],
        relationships: {
          prereqs: 'Prerequisite: STAT100 and MATH115.'
        }
      }];
      const item = browseDecorateRows(rows, {
        availability,
        nextTerm,
        plannedMap: new Map()
      }).sort(browseCompareRows)[0];
      const slotCandidates = browseSlotCandidatesFor(item);
      const preview = browseImpactItems(item, { nextTerm, slotCandidates });
      const closedHtml = browseCourseCardHtml(item, { nextTerm, whyScope: 'full' });
      browseToggleImpact('GVPT200', 'full:impact:GVPT200');
      const openedKey = browseImpactKey;
      const openHtml = browseCourseCardHtml(item, { nextTerm, whyScope: 'full' });
      browseToggleSlotPicker('GVPT200', 'full:slot:GVPT200');
      const impactAfterSlot = browseImpactKey;
      const slotAfterImpact = browseSlotKey;
      browseToggleImpact('GVPT200', 'full:impact:GVPT200');
      browseToggleWhy('GVPT200', 'full:GVPT200');
      const impactAfterWhy = browseImpactKey;
      const whyAfterImpact = browseWhyKey;
      return {
        context: preview.context,
        titles: preview.items.map(item => item.title),
        levels: preview.items.map(item => item.level),
        detailText: preview.items.map(item => item.detail).join(' | '),
        closedHtml,
        openHtml,
        openedKey,
        impactAfterSlot,
        slotAfterImpact,
        impactAfterWhy,
        whyAfterImpact
      };
    })()
  `, context));

  assert(result.context.mode === 'slot', 'browse impact: should preview best matching placeholder slot');
  assert(result.context.currentCredits === 6 && result.context.afterCredits === 6, 'browse impact: replacement slot should keep term load stable');
  assert(result.titles.includes('Term load'), 'browse impact: should include term load');
  assert(result.titles.includes('Duplicate check'), 'browse impact: should include duplicate check');
  assert(result.titles.includes('GenEd impact'), 'browse impact: should include GenEd impact');
  assert(result.titles.includes('Prereqs'), 'browse impact: should include prereq status');
  assert(result.titles.includes('Sections'), 'browse impact: should include sections status');
  assert(/Replacing GenEd DSHS/.test(result.detailText) && /6 -> 6 credits/.test(result.detailText), 'browse impact: load detail should name replacement and credit change');
  assert(/Covers current gap/.test(result.detailText) && /DSHS/.test(result.detailText), 'browse impact: GenEd detail should name gap');
  assert(/Potentially missing MATH 115/.test(result.detailText), 'browse impact: prereq detail should identify unsatisfied prereq group');
  assert(/2 posted sections/.test(result.detailText) && /12 open seats/.test(result.detailText), 'browse impact: section detail should include posted sections and seats');
  assert(/Preview/.test(result.closedHtml), 'browse impact: closed card should render preview action');
  assert(!/browse-impact-panel/.test(result.closedHtml), 'browse impact: closed card should not render panel');
  assert(/browse-impact-panel/.test(result.openHtml), 'browse impact: open card should render panel');
  assert(/Schedule impact/.test(result.openHtml) && /Best slot preview/.test(result.openHtml), 'browse impact: panel should show header and mode');
  assert(result.openedKey === 'full:impact:GVPT200', 'browse impact: toggle should open scoped impact key');
  assert(result.impactAfterSlot === '', 'browse impact: opening slot picker should close impact preview');
  assert(result.slotAfterImpact === 'full:slot:GVPT200', 'browse impact: slot picker should open after closing impact preview');
  assert(result.impactAfterWhy === '', 'browse impact: opening why should close impact preview');
  assert(result.whyAfterImpact === 'full:GVPT200', 'browse impact: why should open after closing impact preview');

  return {
    id: 'BROWSE-IMPACT',
    mode: result.context.mode,
    load: `${result.context.currentCredits}->${result.context.afterCredits}`,
  };
}

async function testPlaceholderSectionPreview(context) {
  const result = clone(await vm.runInContext(`
    (async () => {
      state.activeSchedule = [{
        id: 'PASS55',
        name: 'Pass 55 Fall 2026',
        year: 'Year 1',
        courses: [{
          code: 'GenEd DSHS',
          title: 'History and Social Sciences placeholder',
          cr: 3,
          kind: 'gened',
          category: 'gened-dshs',
          categories: ['gened-dshs'],
          note: 'Auto-generated DSHS placeholder'
        }, {
          code: 'ENGL 101',
          title: 'Academic Writing',
          cr: 3,
          kind: 'gened',
          category: 'gened-fsaw',
          categories: ['gened-fsaw']
        }]
      }];
      state.customCourses = [];
      state.courses = { GENEDDSHS: { status: 'in-progress', grade: 'P' } };
      state.selectedSections = {
        PASS55: {
          GENEDDSHS: {
            section_id: 'PLACEHOLDER-OLD',
            semester: '202608',
            number: 'OLD',
            pinned: true,
            meetings: []
          },
          ENGL101: {
            section_id: 'ENGL101-0101',
            semester: '202608',
            number: '0101',
            open_seats: '8',
            meetings: [{ days: 'M', start_time: '10:00am', end_time: '11:00am', building: 'TWS', room: '1200' }]
          }
        }
      };
      state.schedulePrefs = { PASS55: { mode: 'compact', minBreak: 15, term: '202608' } };
      placeholderSearchTarget = { ...state.activeSchedule[0].courses[0], semId: 'PASS55' };
      placeholderSearchSelectedTags = ['DSHS'];
      const row = {
        course_id: 'GVPT200',
        name: 'International Political Relations',
        credits: '3',
        description: 'A public policy and international relations course.',
        gen_ed: ['DSHS', 'DVUP']
      };
      const sections = [{
        section_id: 'GVPT200-0101',
        semester: '202608',
        number: '0101',
        open_seats: '3',
        waitlist: '0',
        seats: '30',
        meetings: [{ days: 'M', start_time: '10:30am', end_time: '11:45am', building: 'TYD', room: '1101' }]
      }, {
        section_id: 'GVPT200-0201',
        semester: '202608',
        number: '0201',
        open_seats: '18',
        waitlist: '0',
        seats: '35',
        meetings: [{ days: 'TuTh', start_time: '2:00pm', end_time: '3:15pm', building: 'TYD', room: '2101' }]
      }];
      const context = placeholderScheduleContext(row);
      const preview = placeholderBuildSectionPreview(row, sections, context);
      placeholderSectionPreviewCache[placeholderSectionPreviewCacheKey(row.course_id, context)] = { status: 'ready', context, sections };
      const html = placeholderSectionPreviewHtml(row, { status: 'ready', context, sections });
      const emptyHtml = placeholderSectionPreviewHtml(row, { status: 'ready', context, sections: [] });
      const loadingHtml = placeholderSectionPreviewHtml(row, { status: 'loading', context, sections: [] });
      const conflict = preview.samples.find(item => item.section.number === '0101');
      const clear = preview.samples.find(item => item.section.number === '0201');
      placeholderSearchResults = [row];
      await replacePlaceholderWithCourse('GVPT200', {
        code: 'GVPT 200',
        course_id: 'GVPT200',
        title: 'International Political Relations',
        name: 'International Political Relations',
        cr: 3,
        credits: '3',
        kind: 'gened',
        category: 'gened-dshs',
        categories: ['gened-dshs', 'gened-dvup'],
        gen_ed: ['DSHS', 'DVUP'],
        description: 'A public policy and international relations course.',
        prereqs: [],
        prereqGroups: [],
        coreqs: []
      }, { sectionId: 'GVPT200-0201', pin: true });
      const selected = state.selectedSections.PASS55?.GVPT200 || null;
      const staleSelected = state.selectedSections.PASS55?.GENEDDSHS || null;
      const oldProgress = state.courses.GENEDDSHS || null;
      const newProgress = state.courses['GVPT 200'] || null;
      const visibleProgress = getCourseState('GVPT 200');
      const replaced = state.activeSchedule[0].courses[0];
      const recentChange = state.recentChanges[0] || null;
      const oldGetElementById = document.getElementById;
      const historyRoot = { innerHTML: '' };
      document.getElementById = id => {
        if (id === 'plan-change-history') return historyRoot;
        return oldGetElementById(id);
      };
      const expectedReplacementSelected = JSON.parse(JSON.stringify(state.selectedSections.PASS55?.GVPT200 || null));
      renderPlanChangeHistory();
      const historyHtml = historyRoot.innerHTML;
      const canUndoBefore = plannerChangeCanUndo(recentChange);
      const originalActiveSchedule = JSON.parse(JSON.stringify(state.activeSchedule));
      const movedCourse = state.activeSchedule[0].courses.shift();
      state.activeSchedule.push({
        id: 'PASS55B',
        name: 'Pass 55 Later',
        courses: [movedCourse]
      });
      renderPlanChangeHistory();
      const movedHistoryHtml = historyRoot.innerHTML;
      const movedCanUndo = plannerChangeCanUndo(recentChange);
      const movedReviewTarget = plannerChangeReviewTarget(recentChange);
      const movedTermTarget = plannerChangeTermTarget(recentChange);
      state.activeSchedule = JSON.parse(JSON.stringify(originalActiveSchedule));
      state.activeSchedule[0].courses = state.activeSchedule[0].courses.filter(course => normalizeCode(course.code) !== 'GVPT200');
      renderPlanChangeHistory();
      const removedHistoryHtml = historyRoot.innerHTML;
      const removedCanUndo = plannerChangeCanUndo(recentChange);
      const removedReviewTarget = plannerChangeReviewTarget(recentChange);
      const removedTermTarget = plannerChangeTermTarget(recentChange);
      state.activeSchedule = originalActiveSchedule;
      state.selectedSections.PASS55.GVPT200 = {
        ...expectedReplacementSelected,
        section_id: 'GVPT200-0999',
        number: '0999',
        updatedAt: '2026-06-30T23:59:00.000Z'
      };
      renderPlanChangeHistory();
      const staleHistoryHtml = historyRoot.innerHTML;
      const canUndoAfterSectionEdit = plannerChangeCanUndo(recentChange);
      const staleReviewTarget = plannerChangeReviewTarget(recentChange);
      const staleScheduleTarget = plannerChangeScheduleTarget(recentChange);
      let staleUndoApplied = null;
      let staleUndoMessage = '';
      const oldToastError = toastError;
      toastError = message => { staleUndoMessage = message; };
      staleUndoApplied = undoPlanChange(recentChange.id);
      toastError = oldToastError;
      state.selectedSections.PASS55.GVPT200 = expectedReplacementSelected;
      const undoApplied = undoPlanChange(recentChange.id);
      document.getElementById = oldGetElementById;
      const restored = state.activeSchedule[0].courses[0];
      const restoredOldSection = state.selectedSections.PASS55?.GENEDDSHS || null;
      const clearedReplacementSection = state.selectedSections.PASS55?.GVPT200 || null;
      const restoredProgress = getCourseState('GenEd DSHS');
      const replacementProgressAfterUndo = state.courses['GVPT 200'] || state.courses.GVPT200 || null;
      const undoChange = state.recentChanges[0] || null;
      const originalChangeAfterUndo = state.recentChanges.find(change => change.id === recentChange.id) || null;
      return {
        context: preview.context,
        firstNumber: preview.samples[0]?.section.number || '',
        firstConflictCount: preview.samples[0]?.conflictCodes.length || 0,
        clear,
        conflict,
        currentItems: preview.currentItems.map(item => item.course.code),
        html,
        emptyHtml,
        loadingHtml,
        selected,
        staleSelected,
        oldProgress,
        newProgress,
        visibleProgress,
        replaced,
        targetAfterReplace: placeholderSearchTarget,
        recentChange,
        historyHtml,
        canUndoBefore,
        movedHistoryHtml,
        movedCanUndo,
        movedReviewTarget,
        movedTermTarget,
        removedHistoryHtml,
        removedCanUndo,
        removedReviewTarget,
        removedTermTarget,
        staleHistoryHtml,
        canUndoAfterSectionEdit,
        staleReviewTarget,
        staleScheduleTarget,
        staleUndoApplied,
        staleUndoMessage,
        undoApplied,
        restored,
        restoredOldSection,
        clearedReplacementSection,
        restoredProgress,
        replacementProgressAfterUndo,
        undoChange,
        originalChangeAfterUndo,
      };
    })()
  `, context));

  assert(result.context.semId === 'PASS55', 'placeholder section preview: should use the target placeholder semester');
  assert(result.context.term === '202608' && result.context.termLabel === 'Fall 2026', 'placeholder section preview: should infer the target UMD term');
  assert(result.context.currentCredits === 6 && result.context.afterCredits === 6, 'placeholder section preview: replacement should keep term load stable');
  assert(result.currentItems.includes('ENGL 101'), 'placeholder section preview: should compare against already picked sections');
  assert(result.firstNumber === '0201' && result.firstConflictCount === 0, 'placeholder section preview: non-conflicting section should rank first');
  assert(result.clear.openSeats === 18 && result.clear.timed, 'placeholder section preview: should expose open seats and timed meetings for clear option');
  assert(result.conflict.conflictCodes.includes('ENGL 101'), 'placeholder section preview: should flag conflicts with selected sections');
  assert(/Meeting preview/.test(result.html) && /Pass 55 Fall 2026/.test(result.html), 'placeholder section preview: html should render header and semester');
  assert(/6 -&gt; 6 credits|6 -> 6 credits/.test(result.html), 'placeholder section preview: html should render credit change');
  assert(/0201/.test(result.html) && /TuTh 2:00pm-3:15pm/.test(result.html), 'placeholder section preview: html should render section meeting times');
  assert(/No conflicts with picked sections/.test(result.html), 'placeholder section preview: html should render clear conflict status');
  assert(/Conflicts with ENGL 101/.test(result.html), 'placeholder section preview: html should render conflict status');
  assert(/2 posted sections checked/.test(result.html), 'placeholder section preview: html should render checked-section count');
  assert(/Use \+ pin/.test(result.html), 'placeholder section preview: html should render one-click section pinning');
  assert(/No posted sections found/.test(result.emptyHtml), 'placeholder section preview: empty state should explain missing sections');
  assert(/Loading posted sections/.test(result.loadingHtml), 'placeholder section preview: loading state should render');
  assert(result.replaced.code === 'GVPT 200', 'placeholder section preview: section action should replace the placeholder');
  assert(result.selected && result.selected.section_id === 'GVPT200-0201', 'placeholder section preview: section action should persist selected section under the replacement course');
  assert(result.selected.pinned === true, 'placeholder section preview: section action should pin the selected section');
  assert(result.selected.semester === '202608', 'placeholder section preview: selected section should keep the target term');
  assert(!result.staleSelected, 'placeholder section preview: stale placeholder section picks should be cleared');
  assert(!result.oldProgress && result.newProgress?.status === 'in-progress' && result.newProgress?.grade === 'P', 'placeholder section preview: replacement should migrate normalized placeholder progress to the replacement course');
  assert(result.visibleProgress.status === 'in-progress', 'placeholder section preview: migrated replacement progress should be visible through normalized lookup');
  assert(result.targetAfterReplace === null, 'placeholder section preview: target should clear after replacement');
  assert(result.recentChange?.type === 'placeholder-section-replacement', 'placeholder section preview: replacement with section should record a recent change');
  assert(result.recentChange?.undo?.kind === 'placeholder-replacement', 'placeholder section preview: recent change should include undo payload');
  assert(/data-change-undo/.test(result.historyHtml) && /Undo/.test(result.historyHtml), 'placeholder section preview: recent changes should render undo action');
  assert(result.canUndoBefore === true, 'placeholder section preview: change should be undoable before applying undo');
  assert(result.movedCanUndo === false && /moved or removed/.test(result.movedHistoryHtml), 'placeholder section preview: moved replacement should disable undo with moved/removed reason');
  assert(/data-change-review/.test(result.movedHistoryHtml) && /Show edited course/.test(result.movedHistoryHtml), 'placeholder section preview: moved replacement should still offer edited-course jump');
  assert(/data-change-term/.test(result.movedHistoryHtml) && /Show original term/.test(result.movedHistoryHtml), 'placeholder section preview: moved replacement should offer original-term jump');
  assert(result.movedReviewTarget?.code === 'GVPT 200' && result.movedTermTarget?.semId === 'PASS55', 'placeholder section preview: moved replacement targets should resolve edited course and original term');
  assert(result.removedCanUndo === false && /moved or removed/.test(result.removedHistoryHtml), 'placeholder section preview: removed replacement should disable undo with moved/removed reason');
  assert(!/data-change-review/.test(result.removedHistoryHtml), 'placeholder section preview: removed replacement should not offer edited-course jump');
  assert(/data-change-term/.test(result.removedHistoryHtml) && /Show original term/.test(result.removedHistoryHtml), 'placeholder section preview: removed replacement should still offer original-term jump');
  assert(!result.removedReviewTarget && result.removedTermTarget?.semId === 'PASS55', 'placeholder section preview: removed replacement should resolve only original-term target');
  assert(result.canUndoAfterSectionEdit === false, 'placeholder section preview: changed replacement section should disable undo');
  assert(/Undo unavailable/.test(result.staleHistoryHtml) && /section pick changed/.test(result.staleHistoryHtml), 'placeholder section preview: stale undo should explain changed section pick');
  assert(!/data-change-undo/.test(result.staleHistoryHtml), 'placeholder section preview: stale undo should hide undo button');
  assert(/data-change-review/.test(result.staleHistoryHtml) && /Show edited course/.test(result.staleHistoryHtml), 'placeholder section preview: stale undo should offer a recovery jump');
  assert(result.staleReviewTarget?.code === 'GVPT 200', 'placeholder section preview: recovery jump should target the edited replacement course');
  assert(/data-change-schedule/.test(result.staleHistoryHtml) && /Show schedule term/.test(result.staleHistoryHtml), 'placeholder section preview: stale section undo should offer a schedule-term jump');
  assert(result.staleScheduleTarget?.semId === 'PASS55' && result.staleScheduleTarget?.code === 'GVPT 200', 'placeholder section preview: schedule jump should target the edited replacement term and course');
  assert(result.staleUndoApplied === false && /section pick changed/.test(result.staleUndoMessage), 'placeholder section preview: stale undo click should report changed section pick');
  assert(result.undoApplied === true, 'placeholder section preview: undo should apply successfully');
  assert(result.restored.code === 'GenEd DSHS', 'placeholder section preview: undo should restore the placeholder course');
  assert(result.restoredOldSection?.section_id === 'PLACEHOLDER-OLD' && result.restoredOldSection.pinned === true, 'placeholder section preview: undo should restore the prior placeholder section state');
  assert(!result.clearedReplacementSection, 'placeholder section preview: undo should clear replacement section state');
  assert(result.restoredProgress.status === 'in-progress' && result.restoredProgress.grade === 'P', 'placeholder section preview: undo should restore migrated placeholder progress');
  assert(!result.replacementProgressAfterUndo, 'placeholder section preview: undo should remove replacement progress state');
  assert(result.undoChange?.type === 'placeholder-undo', 'placeholder section preview: undo should record a restore change');
  assert(result.originalChangeAfterUndo?.undo?.appliedAt, 'placeholder section preview: original undo action should be marked applied');

  return {
    id: 'PLACEHOLDER-SECTIONS',
    first: result.firstNumber,
    pinned: result.selected?.number || '',
    undo: result.restored?.code || '',
    load: `${result.context.currentCredits}->${result.context.afterCredits}`,
    progress: result.newProgress?.status || '',
  };
}

async function testBrowsePlaceholderReplacement(context) {
  const result = clone(await vm.runInContext(`
    (async () => {
      state.activeSchedule = [{
        id: 'PASS47',
        name: 'Pass 47 Fall',
        year: 'Year 1',
        courses: [{
          code: 'GenEd DSHS',
          title: 'History and Social Sciences placeholder',
          cr: 3,
          kind: 'gened',
          category: 'gened-dshs',
          note: 'Auto-generated DSHS placeholder'
        }]
      }];
      state.customCourses = [];
      state.courses = {};
      state.recentChanges = [];
      state.browseSavedSearches = [];
      state.profilePrefs = normalizeProfilePrefs({
        interests: ['policy-society'],
        careerGoal: 'public policy',
        genEdDepts: 'GVPT'
      });
      placeholderSearchTarget = { ...state.activeSchedule[0].courses[0], semId: 'PASS47' };
      placeholderSearchSelectedTags = ['DSHS'];
      placeholderSearchMode = 'all';
      currentTab = 'plan';
      switchTab = tab => { currentTab = tab; };
      const config = placeholderBrowseConfig(placeholderSearchTarget);
      openPlaceholderBrowseSearch();
      const targetAfterOpen = placeholderSearchTarget ? placeholderSearchTarget.code : '';
      browseCache = [{
        course_id: 'GVPT200',
        name: 'International Political Relations',
        credits: '3',
        description: 'A public policy and international relations course.',
        gen_ed: ['DSHS', 'DVUP']
      }];
      const decorated = browseDecorateRows(browseCache, {
        nextTerm: { term: '202608', termLabel: 'Fall 2026' }
      }).sort(browseCompareRows);
      const cardHtml = browseCourseCardHtml(decorated[0]);
      const bannerHtml = browseReplacementBannerHtml();
      await browseReplacePlaceholder('GVPT200');
      const replaced = state.activeSchedule[0].courses[0];
      return {
        config,
        currentTab,
        targetAfterOpen,
        savedLabel: state.browseSavedSearches[0]?.label || '',
        cardHtml,
        bannerHtml,
        replaced,
        targetAfterReplace: placeholderSearchTarget,
        courseStateKeys: Object.keys(state.courses),
      };
    })()
  `, context));

  assert(result.config.dept === '__PROFILE_DEPTS__', 'browse placeholder replacement: handoff should use profile departments');
  assert(result.config.genEd === 'DSHS', 'browse placeholder replacement: handoff should keep selected GenEd tag');
  assert(result.currentTab === 'browse', 'browse placeholder replacement: handoff should switch to Browse');
  assert(result.targetAfterOpen === 'GenEd DSHS', 'browse placeholder replacement: Browse handoff should preserve selected target');
  assert(/Replace GenEd DSHS/.test(result.savedLabel), 'browse placeholder replacement: handoff should save replacement search');
  assert(/Replacing GenEd DSHS/.test(result.bannerHtml), 'browse placeholder replacement: Browse should render replacement banner');
  assert(/Replace GenEd DSHS/.test(result.cardHtml), 'browse placeholder replacement: card should render replacement action');
  assert(/Add separately/.test(result.cardHtml), 'browse placeholder replacement: card should keep separate add option');
  assert(result.replaced.code === 'GVPT 200', 'browse placeholder replacement: should replace placeholder with selected course');
  assert(result.replaced.category === 'gened-dshs', 'browse placeholder replacement: should preserve matching GenEd category');
  assert(result.replaced.kind === 'gened', 'browse placeholder replacement: replacement should stay GenEd kind');
  assert(/Replaced GenEd DSHS/.test(result.replaced.note || ''), 'browse placeholder replacement: replacement note should mention original placeholder');
  assert(result.targetAfterReplace === null, 'browse placeholder replacement: target should clear after successful replacement');

  return {
    id: 'BROWSE-PLACEHOLDER-REPLACE',
    search: `${result.config.dept}/${result.config.genEd}`,
    replaced: result.replaced.code,
  };
}

async function testBrowseSlotSelection(context) {
  const result = clone(await vm.runInContext(`
    (async () => {
      state.activeSchedule = [{
        id: 'PASS49A',
        name: 'Pass 49 Fall',
        year: 'Year 1',
        courses: [
          {
            code: 'GenEd DSHS',
            title: 'History and Social Sciences placeholder',
            cr: 3,
            kind: 'gened',
            category: 'gened-dshs',
            categories: ['gened-dshs'],
            note: 'Auto-generated DSHS placeholder'
          },
          {
            code: 'GenEd DSHU',
            title: 'Humanities placeholder',
            cr: 3,
            kind: 'gened',
            category: 'gened-dshu',
            categories: ['gened-dshu'],
            note: 'Auto-generated DSHU placeholder'
          }
        ]
      }, {
        id: 'PASS49B',
        name: 'Pass 49 Spring',
        year: 'Year 1',
        courses: [{
          code: 'Free Elective #1',
          title: 'Free Elective 1',
          cr: 3,
          kind: 'tech',
          category: 'elective',
          note: 'Auto-generated credit placeholder'
        }]
      }];
      state.customCourses = [];
      state.courses = {};
      state.profilePrefs = normalizeProfilePrefs({
        interests: ['policy-society'],
        careerGoal: 'public policy',
        genEdDepts: 'GVPT'
      });
      placeholderSearchTarget = null;
      placeholderSearchSelectedTags = [];
      placeholderSearchMode = 'all';
      browseSlotKey = '';
      browseWhyCode = '';
      browseWhyKey = '';
      currentTab = 'browse';
      browseCache = [{
        course_id: 'GVPT200',
        name: 'International Political Relations',
        credits: '3',
        description: 'A public policy and international relations course.',
        gen_ed: ['DSHS', 'DVUP']
      }];
      const item = browseDecorateRows(browseCache, {
        nextTerm: { term: '202608', termLabel: 'Fall 2026' }
      }).sort(browseCompareRows)[0];
      const slots = browseSlotCandidatesFor(item);
      const closedHtml = browseCourseCardHtml(item, { nextTerm: { term: '202608', termLabel: 'Fall 2026' }, whyScope: 'full' });
      browseToggleSlotPicker('GVPT200', 'full:slot:GVPT200');
      const openedKey = browseSlotKey;
      const openHtml = browseCourseCardHtml(item, { nextTerm: { term: '202608', termLabel: 'Fall 2026' }, whyScope: 'full' });
      browseToggleWhy('GVPT200', 'full:GVPT200');
      const keyAfterWhy = browseSlotKey;
      const whyAfterSlot = browseWhyKey;
      await browseReplaceIntoSlot('GVPT200', slots[0].key);
      const replaced = state.activeSchedule[0].courses[0];
      const untouched = state.activeSchedule[0].courses[1];
      const elective = state.activeSchedule[1].courses[0];
      return {
        slotCodes: slots.map(slot => slot.course.code),
        slotLabels: slots.map(slot => slot.label),
        closedHtml,
        openHtml,
        openedKey,
        keyAfterWhy,
        whyAfterSlot,
        replaced,
        untouched,
        elective,
        targetAfterReplace: placeholderSearchTarget
      };
    })()
  `, context));

  assert(result.slotCodes[0] === 'GenEd DSHS', 'browse slot selection: matching GenEd placeholder should rank first');
  assert(result.slotCodes.includes('Free Elective #1'), 'browse slot selection: open elective slot should be available as fallback');
  assert(/Choose slot/.test(result.closedHtml), 'browse slot selection: card should render slot picker action');
  assert(!/browse-slot-panel/.test(result.closedHtml), 'browse slot selection: closed card should not render slot panel');
  assert(/browse-slot-panel/.test(result.openHtml), 'browse slot selection: open card should render slot panel');
  assert(/GenEd DSHS/.test(result.openHtml) && /DSHS match/.test(result.openHtml), 'browse slot selection: slot panel should show matching placeholder');
  assert(result.openedKey === 'full:slot:GVPT200', 'browse slot selection: toggle should open scoped slot key');
  assert(result.keyAfterWhy === '', 'browse slot selection: opening why should close the slot picker');
  assert(result.whyAfterSlot === 'full:GVPT200', 'browse slot selection: why panel should open after closing slot picker');
  assert(result.replaced.code === 'GVPT 200', 'browse slot selection: should replace selected placeholder with Browse course');
  assert(result.replaced.category === 'gened-dshs', 'browse slot selection: replacement should preserve selected GenEd category');
  assert(result.untouched.code === 'GenEd DSHU', 'browse slot selection: nonmatching placeholder should remain untouched');
  assert(result.elective.code === 'Free Elective #1', 'browse slot selection: elective fallback should not be used when DSHS slot is selected');
  assert(result.targetAfterReplace === null, 'browse slot selection: replacement target should clear after replacement');

  return {
    id: 'BROWSE-SLOT-SELECT',
    firstSlot: result.slotCodes[0],
    replaced: result.replaced.code,
  };
}

async function testBrowseTypedSlotMatching(context) {
  const result = clone(await vm.runInContext(`
    (() => {
      state.activeSchedule = [{
        id: 'PASS51A',
        name: 'Pass 51 Fall',
        year: 'Year 1',
        courses: [{
          code: 'GVPT 3xx Elective A',
          title: 'Upper-Division GVPT Elective',
          cr: 3,
          category: 'major-upper'
        }, {
          code: 'Foreign Language 101',
          title: 'Foreign Language Sequence I',
          cr: 4,
          category: 'major-support',
          note: 'BA req'
        }, {
          code: 'PSYC 2xx Support A',
          title: 'PSYC Supporting Course',
          cr: 3,
          category: 'major-support'
        }, {
          code: 'Free Elective #1',
          title: 'Free Elective 1',
          cr: 3,
          kind: 'tech',
          category: 'elective',
          note: 'Auto-generated credit placeholder'
        }]
      }];
      state.customCourses = [];
      state.courses = {};
      state.profilePrefs = normalizeProfilePrefs({
        interests: ['policy-society'],
        careerGoal: 'public policy',
        genEdDepts: 'GVPT'
      });
      placeholderSearchTarget = null;
      browseSlotKey = '';
      const gvptRows = [{
        course_id: 'GVPT356',
        name: 'Politics of the Developing World',
        credits: '3',
        description: 'Comparative politics and policy.',
        gen_ed: []
      }];
      const spanRows = [{
        course_id: 'SPAN101',
        name: 'Elementary Spanish I',
        credits: '4',
        description: 'Introductory Spanish language sequence.',
        gen_ed: []
      }];
      const supportRows = [{
        course_id: 'PSYC221',
        name: 'Social Psychology',
        credits: '3',
        description: 'Social behavior and psychological support methods.',
        gen_ed: []
      }];
      const gvptItem = browseDecorateRows(gvptRows, {
        nextTerm: { term: '202608', termLabel: 'Fall 2026' },
        plannedMap: new Map()
      }).sort(browseCompareRows)[0];
      const spanItem = browseDecorateRows(spanRows, {
        nextTerm: { term: '202608', termLabel: 'Fall 2026' },
        plannedMap: new Map()
      }).sort(browseCompareRows)[0];
      const supportItem = browseDecorateRows(supportRows, {
        nextTerm: { term: '202608', termLabel: 'Fall 2026' },
        plannedMap: new Map()
      }).sort(browseCompareRows)[0];
      const gvptSlots = browseSlotCandidatesFor(gvptItem);
      const spanSlots = browseSlotCandidatesFor(spanItem);
      const supportSlots = browseSlotCandidatesFor(supportItem);
      browseToggleSlotPicker('GVPT356', 'full:slot:GVPT356');
      const gvptHtml = browseCourseCardHtml(gvptItem, {
        nextTerm: { term: '202608', termLabel: 'Fall 2026' },
        whyScope: 'full'
      });
      return {
        gvptSlots: gvptSlots.map(slot => ({ code: slot.course.code, kind: slot.kind, label: slot.label })),
        spanSlots: spanSlots.map(slot => ({ code: slot.course.code, kind: slot.kind, label: slot.label })),
        supportSlots: supportSlots.map(slot => ({ code: slot.course.code, kind: slot.kind, label: slot.label })),
        gvptHtml
      };
    })()
  `, context));

  assert(result.gvptSlots[0].code === 'GVPT 3xx Elective A', 'browse typed slots: GVPT upper elective should rank first for GVPT 300-level course');
  assert(result.gvptSlots[0].kind === 'major-elective', 'browse typed slots: GVPT slot should be typed as major elective');
  assert(/GVPT upper elective/.test(result.gvptSlots[0].label), 'browse typed slots: GVPT label should explain upper elective fit');
  assert(result.gvptSlots.some(slot => slot.code === 'Free Elective #1'), 'browse typed slots: free elective should remain fallback');
  assert(!result.gvptSlots.some(slot => slot.code === 'Foreign Language 101'), 'browse typed slots: GVPT course should not match language slot');
  assert(result.spanSlots[0].code === 'Foreign Language 101', 'browse typed slots: SPAN course should rank language slot first');
  assert(result.spanSlots[0].kind === 'language', 'browse typed slots: language slot should be typed as language');
  assert(/Language sequence candidate/.test(result.spanSlots[0].label), 'browse typed slots: language label should explain sequence fit');
  assert(!result.spanSlots.some(slot => slot.code === 'GVPT 3xx Elective A'), 'browse typed slots: SPAN course should not match GVPT upper elective');
  assert(result.supportSlots[0].code === 'PSYC 2xx Support A', 'browse typed slots: PSYC course should rank support slot first');
  assert(result.supportSlots[0].kind === 'major-support', 'browse typed slots: support slot should be typed as major support');
  assert(/PSYC course fit/.test(result.supportSlots[0].label), 'browse typed slots: support label should explain department fit');
  assert(/Major elective/.test(result.gvptHtml) && /GVPT upper elective/.test(result.gvptHtml), 'browse typed slots: slot panel should render typed slot label');

  return {
    id: 'BROWSE-TYPED-SLOTS',
    gvpt: `${result.gvptSlots[0].kind}/${result.gvptSlots[0].code}`,
    language: `${result.spanSlots[0].kind}/${result.spanSlots[0].code}`,
    support: `${result.supportSlots[0].kind}/${result.supportSlots[0].code}`,
  };
}

function testAuditIssueDrawer(context) {
  const result = clone(vm.runInContext(`
    (() => {
      state.activeSchedule = [{
        id: 'PASS54',
        name: 'Pass 54 Fall',
        year: 'Year 1',
        courses: [{
          code: 'GenEd DSHU',
          title: 'Humanities placeholder',
          cr: 3,
          kind: 'gened',
          category: 'gened-dshu',
          categories: ['gened-dshu'],
          note: 'Auto-generated DSHU placeholder'
        }, {
          code: 'GVPT 3xx Elective A',
          title: 'Upper-Division GVPT Elective',
          cr: 3,
          category: 'major-upper'
        }, {
          code: 'Free Elective #1',
          title: 'Free Elective 1',
          cr: 3,
          kind: 'tech',
          category: 'elective',
          note: 'Auto-generated credit placeholder'
        }]
      }];
      state.customCourses = [];
      state.courses = {};
      state.settings = normalizeSettings({ ...DEFAULT_SETTINGS, catalogYear: '2024-2025' });
      state.recentChanges = [{
        id: 'prior-conflict-1',
        type: 'prior-credit',
        source: 'settings',
        title: 'Applied 2 prior-credit courses',
        detail: 'MATH 140, CMSC 131',
        at: '2026-06-30T12:00:00.000Z',
        undo: {
          kind: 'prior-credit',
          source: 'settings',
          entries: [{
            code: 'MATH 140',
            hadCourseState: true,
            courseState: { status: 'passed', grade: 'A' },
            appliedCourseState: { status: 'transfer', grade: '' },
            addedCustomCourse: false,
            customCourse: null
          }],
          review: {
            overlaps: [{ code: 'MATH 140', sources: ['AP Calc BC 4+', 'Manual entry'] }],
            existingAttempts: [{ code: 'MATH 140', status: 'passed', grade: 'A' }]
          }
        }
      }];
      state.browseSavedSearches = [];
      state.profilePrefs = normalizeProfilePrefs({
        interests: ['policy-society'],
        careerGoal: 'public policy',
        genEdDepts: 'GVPT'
      });
      currentTab = 'audit';
      switchTab = tab => { currentTab = tab; };
      let openedPlaceholder = null;
      openPlaceholderSearch = (code, semId) => { openedPlaceholder = { code, semId }; };
      let priorCreditSettingsOpened = 0;
      let priorCreditFocused = 0;
      const originalOpenSettings = openSettings;
      const originalPlannerFocusSettingsPriorCredit = plannerFocusSettingsPriorCredit;
      openSettings = () => { priorCreditSettingsOpened += 1; };
      plannerFocusSettingsPriorCredit = () => {
        priorCreditFocused += 1;
        return true;
      };

      const issues = auditDegreeIssues();
      const priorCreditIssue = issues.find(issue => issue.type === 'prior-credit');
      const dshuSlot = issues.find(issue => issue.courseCode === 'GenEd DSHU');
      const gvptSlot = issues.find(issue => issue.courseCode === 'GVPT 3xx Elective A');
      const freeSlot = issues.find(issue => issue.courseCode === 'Free Elective #1');
      const genedGap = issues.find(issue => issue.key === 'gened-DSHU');
      auditIssueKey = dshuSlot.key;
      const html = auditIssuesHtml();
      auditIssueKey = priorCreditIssue.key;
      const priorCreditHtml = auditIssuesHtml();
      auditOpenIssuePrimary(priorCreditIssue.key);
      const priorCreditPrimaryOpened = priorCreditSettingsOpened;
      const priorCreditPrimaryFocused = priorCreditFocused;
      auditOpenIssueBrowse(priorCreditIssue.key);
      const priorCreditBrowseOpened = priorCreditSettingsOpened - priorCreditPrimaryOpened;
      const priorCreditBrowseFocused = priorCreditFocused - priorCreditPrimaryFocused;
      const advisorIssues = scheduleAdvisorAuditIssues(20);
      const advisorPriorCredit = advisorIssues.find(issue => issue.type === 'prior-credit');
      const advisorDshuSlot = advisorIssues.find(issue => issue.courseCode === 'GenEd DSHU');
      const advisorDshuGap = advisorIssues.find(issue => issue.key === 'gened-DSHU');
      state.scheduleOutputOptions = { preferences: true, warnings: true, unscheduled: true, recentChanges: true, auditIssues: true };
      state.scheduleAdvisorFilter = 'blockers';
      const advisorOutput = buildScheduleOutput('PASS54', '202608', state.activeSchedule[0].courses, [], [], [], { ...DEFAULT_SCHEDULE_PREFS });
      state.scheduleOutputOptions = { preferences: true, warnings: true, unscheduled: true, recentChanges: true, auditIssues: false };
      const advisorOutputNoAudit = buildScheduleOutput('PASS54', '202608', state.activeSchedule[0].courses, [], [], [], { ...DEFAULT_SCHEDULE_PREFS });
      const priorCreditReviewed = auditMarkPriorCreditReviewed(priorCreditIssue.key);
      const reviewedChange = state.recentChanges.find(change => change.id === 'prior-conflict-1') || null;
      const reviewedIssues = auditDegreeIssues();
      const reviewedAdvisorIssues = scheduleAdvisorAuditIssues(20);
      const reviewedAdvisorPriorCredit = reviewedAdvisorIssues.find(issue => issue.type === 'prior-credit') || null;
      const reviewedAuditHtml = auditIssuesHtml();
      auditOpenIssuePrimary(dshuSlot.key);
      const directOpenedPlaceholder = openedPlaceholder ? { ...openedPlaceholder } : null;
      auditOpenIssueBrowse(genedGap.key);
      const directBrowse = {
        currentTab,
        browseDept,
        browseGenEd,
        savedLabel: state.browseSavedSearches[0]?.label || '',
      };
      openedPlaceholder = null;
      currentTab = 'audit';
      browseDept = '';
      browseGenEd = '';
      browseSearch = '';
      state.browseSavedSearches = [];
      const primaryHash = scheduleAdvisorDeepLinkHash('primary', advisorDshuSlot.key);
      const browseHash = scheduleAdvisorDeepLinkHash('browse', advisorDshuGap.key);
      const handledPrimaryHash = scheduleHandleAdvisorActionHash(primaryHash, { clear: false });
      const openedPlaceholderFromHash = openedPlaceholder ? { ...openedPlaceholder } : null;
      openedPlaceholder = null;
      currentTab = 'audit';
      browseDept = '';
      browseGenEd = '';
      browseSearch = '';
      state.browseSavedSearches = [];
      const handledBrowseHash = scheduleHandleAdvisorActionHash(browseHash, { clear: false });
      const browseFromHash = {
        currentTab,
        browseDept,
        browseGenEd,
        savedLabel: state.browseSavedSearches[0]?.label || '',
      };
      openSettings = originalOpenSettings;
      plannerFocusSettingsPriorCredit = originalPlannerFocusSettingsPriorCredit;
      return {
        count: issues.length,
        titles: issues.map(issue => issue.title),
        priorCreditIssue,
        priorCreditHtml,
        advisorPriorCredit,
        priorCreditPrimaryOpened,
        priorCreditPrimaryFocused,
        priorCreditBrowseOpened,
        priorCreditBrowseFocused,
        priorCreditReviewed,
        reviewedChange,
        reviewedCount: reviewedIssues.length,
        reviewedAdvisorPriorCredit,
        reviewedAuditHtml,
        dshuSlot,
        gvptSlot,
        freeSlot,
        genedGap,
        html,
        advisorHtml: advisorOutput.advisorHtml,
        advisorText: advisorOutput.advisorText,
        advisorDocument: advisorOutput.advisorDocument,
        advisorHtmlNoAudit: advisorOutputNoAudit.advisorHtml,
        advisorOptions: advisorOutput.outputOptions,
        advisorDshuSlot,
        advisorDshuGap,
        primaryHash,
        browseHash,
        directOpenedPlaceholder,
        directBrowse,
        handledPrimaryHash,
        openedPlaceholderFromHash,
        handledBrowseHash,
        browseFromHash,
      };
    })()
  `, context));

  assert(result.count >= 4, 'audit issues: should include gaps and placeholder rows');
  assert(result.dshuSlot && result.dshuSlot.actionType === 'placeholder', 'audit issues: should create a replace action for GenEd placeholders');
  assert(/Humanities|DSHU/.test(result.dshuSlot.satisfies), 'audit issues: GenEd placeholder should explain acceptable GenEd tags');
  assert(result.gvptSlot && /GVPT/.test(result.gvptSlot.satisfies) && /300/.test(result.gvptSlot.satisfies), 'audit issues: typed major elective should expose department and level requirements');
  assert(result.freeSlot && /elective|personal/i.test(result.freeSlot.summary + result.freeSlot.detail), 'audit issues: free elective should explain personalization');
  assert(result.genedGap && result.genedGap.type === 'gened', 'audit issues: should include a DSHU requirement gap');
  assert(/Degree|open item|Why it remains|What can satisfy it|Choose Replacement|Open Browse/.test(result.html), 'audit issues: expanded drawer should render explanatory copy and actions');
  assert(result.priorCreditIssue?.actionType === 'prior-credit', 'audit issues: should create a prior-credit review action from saved conflict evidence');
  assert(/MATH 140 via AP Calc BC 4\+/.test(result.priorCreditIssue.summary) && /already marked passed/.test(result.priorCreditIssue.summary + result.priorCreditIssue.detail), 'audit issues: prior-credit item should summarize overlaps and existing attempts');
  assert(/Review prior credits/.test(result.priorCreditHtml) && /Mark Reviewed/.test(result.priorCreditHtml) && /Duplicate-credit/.test(result.priorCreditHtml), 'audit issues: prior-credit drawer should render Settings review actions and rules');
  assert(result.priorCreditPrimaryOpened === 1 && result.priorCreditPrimaryFocused === 1, 'audit issues: prior-credit primary action should open and focus Settings');
  assert(result.priorCreditBrowseOpened === 1 && result.priorCreditBrowseFocused === 1, 'audit issues: prior-credit Browse action should reuse the Settings review path');
  assert(result.priorCreditReviewed === true, 'audit issues: prior-credit review should be markable as reviewed');
  assert(result.reviewedChange?.undo?.review?.resolvedAt && /MATH 140 via AP Calc BC 4\+/.test(result.reviewedChange.undo.review.resolvedSummary || ''), 'audit issues: reviewed prior-credit change should persist resolved timestamp and summary');
  assert((result.reviewedChange?.highlights || []).includes('Prior-credit conflicts marked reviewed.'), 'audit issues: reviewed prior-credit change should add a recent-change highlight');
  assert(result.reviewedCount === result.count - 1 && !/Prior credit conflicts need review/.test(result.reviewedAuditHtml), 'audit issues: reviewed prior-credit item should disappear from Degree Audit');
  assert(result.advisorOptions.auditIssues === true, 'advisor audit export: audit issues should default into schedule output options');
  assert(result.advisorPriorCredit?.actionSummary === 'Review prior-credit conflicts in Settings', 'advisor audit export: prior-credit item should describe the Settings review action');
  assert(result.advisorPriorCredit?.browseTarget === 'Settings · AP / IB / Transfer Credit', 'advisor audit export: prior-credit item should target Settings instead of Browse');
  assert(!result.reviewedAdvisorPriorCredit, 'advisor audit export: reviewed prior-credit item should disappear from advisor audit snapshots');
  assert(/Replace GenEd DSHU in Pass 54 Fall/.test(result.advisorDshuSlot?.actionSummary || ''), 'advisor audit export: placeholder issue should include replacement quick-link action text');
  assert(/Profile departments/.test(result.advisorDshuGap?.browseTarget || '') && /DSHU/.test(result.advisorDshuGap?.browseTarget || ''), 'advisor audit export: GenEd issue should include Browse target quick-link context');
  assert(/Degree Audit Snapshot/.test(result.advisorHtml), 'advisor audit export: advisor HTML should include audit snapshot section');
  assert(/Audit issues/.test(result.advisorHtml) && /17 open items/.test(result.advisorHtml) && /1 prior-credit review/.test(result.advisorHtml) && /showing top 6/.test(result.advisorHtml), 'advisor audit export: advisor HTML should include full audit issue counts and compact top list');
  assert(/Prior credit conflicts need review/.test(result.advisorHtml) && /Settings · AP \/ IB \/ Transfer Credit/.test(result.advisorHtml), 'advisor audit export: advisor HTML should include prior-credit conflict action context');
  assert(/GenEd DSHU|GVPT 3xx Elective A|Free Elective/.test(result.advisorHtml), 'advisor audit export: advisor HTML should include top audit issue titles');
  assert(/Next action|Browse target|data-schedule-audit-primary|data-schedule-audit-browse/.test(result.advisorHtml), 'advisor audit export: advisor HTML should include quick-link actions and targets');
  assert(/href="[^"]*#advisor-action=primary&amp;issue=/.test(result.advisorHtml) && /href="[^"]*#advisor-action=browse&amp;issue=/.test(result.advisorHtml), 'advisor audit export: advisor HTML should include live-app deep links');
  assert(/Live TerpTrack links/.test(result.advisorHtml) && /same browser profile\/local plan state/.test(result.advisorHtml), 'advisor audit export: advisor HTML should explain live-link browser-state requirements');
  assert(/schedule-advisor-catalog-warning/.test(result.advisorHtml) && /Confirm 2024-2025 catalog requirements/.test(result.advisorHtml), 'advisor audit export: advisor HTML should include catalog-year warning');
  assert(/open\/import the matching plan/.test(result.advisorHtml) && /Next action and Browse target/.test(result.advisorHtml), 'advisor audit export: live-link notice should explain fallback review steps');
  assert(/Open\/import matching plan/.test(result.advisorHtml) && /href="#plan=/.test(result.advisorHtml), 'advisor audit export: advisor HTML should include an embedded shared-plan import link');
  assert(/Degree audit snapshot/.test(result.advisorText) && /Satisfies:/.test(result.advisorText), 'advisor audit export: advisor text should include audit snapshot details');
  assert(/Next action:|Browse target:/.test(result.advisorText), 'advisor audit export: advisor text should include quick-link action details');
  assert(/Live TerpTrack links/.test(result.advisorText) && /same browser profile\/local plan state/.test(result.advisorText), 'advisor audit export: advisor text should include live-link browser-state guidance');
  assert(/Catalog-year verification/.test(result.advisorText) && /Confirm 2024-2025 catalog requirements/.test(result.advisorText), 'advisor audit export: advisor text should include catalog-year warning');
  assert(/Open\/import matching plan: #plan=/.test(result.advisorText), 'advisor audit export: advisor text should include the shared-plan import hash');
  assert(/schedule-advisor-audit-link/.test(result.advisorDocument), 'advisor audit export: standalone advisor document should include audit quick-link CSS/markup');
  assert(/#advisor-action=primary&amp;issue=/.test(result.advisorDocument) && /#advisor-action=browse&amp;issue=/.test(result.advisorDocument), 'advisor audit export: standalone advisor document should include live-app deep links');
  assert(/schedule-advisor-live-note/.test(result.advisorDocument) && /same browser profile\/local plan state/.test(result.advisorDocument), 'advisor audit export: standalone advisor document should include live-link guidance CSS/markup');
  assert(/schedule-advisor-catalog-warning/.test(result.advisorDocument) && /Target 2024-2025/.test(result.advisorDocument), 'advisor audit export: standalone advisor document should include catalog-year warning CSS/markup');
  assert(/schedule-advisor-import-link/.test(result.advisorDocument) && /href="#plan=/.test(result.advisorDocument), 'advisor audit export: standalone advisor document should include the shared-plan import link');
  assert(!/Degree Audit Snapshot/.test(result.advisorHtmlNoAudit), 'advisor audit export: audit snapshot should hide when auditIssues option is off');
  assert(!/Live TerpTrack links/.test(result.advisorHtmlNoAudit), 'advisor audit export: live-link notice should hide when audit actions are off');
  assert(result.directOpenedPlaceholder.code === 'GenEd DSHU' && result.directOpenedPlaceholder.semId === 'PASS54', 'audit issues: primary placeholder action should open the replacement modal for the exact slot');
  assert(result.directBrowse.currentTab === 'browse', 'audit issues: Browse handoff should switch to Browse');
  assert(result.directBrowse.browseDept === '__PROFILE_DEPTS__', 'audit issues: Browse handoff should use profile departments');
  assert(result.directBrowse.browseGenEd === 'DSHU', 'audit issues: Browse handoff should preserve the GenEd tag');
  assert(/Audit:/.test(result.directBrowse.savedLabel) && /DSHU|Humanities/.test(result.directBrowse.savedLabel), 'audit issues: Browse handoff should save an audit-labeled search');
  assert(result.handledPrimaryHash === true && /advisor-action=primary/.test(result.primaryHash), 'advisor audit deep link: primary hash should be recognized');
  assert(result.openedPlaceholderFromHash?.code === 'GenEd DSHU' && result.openedPlaceholderFromHash?.semId === 'PASS54', 'advisor audit deep link: primary hash should reopen placeholder replacement');
  assert(result.handledBrowseHash === true && /advisor-action=browse/.test(result.browseHash), 'advisor audit deep link: browse hash should be recognized');
  assert(result.browseFromHash.currentTab === 'browse' && result.browseFromHash.browseDept === '__PROFILE_DEPTS__' && result.browseFromHash.browseGenEd === 'DSHU', 'advisor audit deep link: browse hash should reopen the saved audit Browse target');
  assert(/Audit:/.test(result.browseFromHash.savedLabel) && /DSHU|Humanities/.test(result.browseFromHash.savedLabel), 'advisor audit deep link: browse hash should save the audit search label');

  return {
    id: 'AUDIT-ISSUES',
    count: result.count,
    opened: result.directOpenedPlaceholder.code,
    browse: `${result.directBrowse.browseDept}/${result.directBrowse.browseGenEd}`,
  };
}

async function testOnboardingPersonalizedSetup(context) {
  const result = clone(await vm.runInContext(`
    (async () => {
      state.profilePrefs = normalizeProfilePrefs({
        interests: ['ai-data'],
        careerGoal: 'data science for civic technology',
        genEdDepts: 'INST, GVPT'
      });
      const standardTerms = onboardTargetSemesterCount(2026, 'Spring', 2030);
      const fastTerms = onboardTargetSemesterCount(2026, 'Fall', 2029);
      const minimumTerms = onboardTargetSemesterCount(2026, 'Spring', 2026);
      const prefs = onboardNormalizeSchedulePrefs({
        earliest: '10:00',
        latest: '17:00',
        minBreak: '30',
        mode: 'compact',
        avoidDays: ['F', 'X', 'M', 'F']
      });
      const preview = await buildAutoPlanPreview('STAT', {
        noFetch: true,
        force: true,
        startYear: 2027,
        numSemesters: 6,
        creditCap: 16,
        profilePrefs: getProfilePrefs()
      });
      const curatedPreview = await buildAutoPlanPreview('CE', {
        noFetch: true,
        force: true,
        startYear: 2028,
        profilePrefs: getProfilePrefs()
      });
      await applyMajorTemplate('CE', { startTerm: 'Fall', startYear: 2028 });
      onboardApplySchedulePrefs(prefs);
      const sems = getAllSemesters();
      const first = sems[0];
      const firstPrefs = state.schedulePrefs[first.id];
      return {
        standardTerms,
        fastTerms,
        minimumTerms,
        normalizedPrefs: prefs,
        previewTerms: preview.termLoads.length,
        previewFirstTerm: preview.termLoads[0].id,
        previewProfileActive: preview.profile.active,
        curatedPreviewFirstId: curatedPreview.termLoads[0].id,
        curatedPreviewFirstName: curatedPreview.termLoads[0].name,
        curatedFirstId: first.id,
        curatedFirstName: first.name,
        curatedEyebrow: state.settings.eyebrow,
        firstPrefs,
      };
    })()
  `, context));

  assert(result.standardTerms === 8, 'onboarding: standard Fall-to-Spring timeline should produce 8 terms');
  assert(result.fastTerms === 7, 'onboarding: Fall target graduation should produce a 7-term fast path');
  assert(result.minimumTerms === 2, 'onboarding: target term count should keep a 2-term minimum');
  assert(result.normalizedPrefs.earliest === '10:00' && result.normalizedPrefs.latest === '17:00', 'onboarding: schedule time preferences should normalize');
  assert(result.normalizedPrefs.minBreak === 30 && result.normalizedPrefs.mode === 'compact', 'onboarding: schedule mode and break preferences should normalize');
  assert(result.normalizedPrefs.avoidDays.length === 2 && result.normalizedPrefs.avoidDays.includes('F') && result.normalizedPrefs.avoidDays.includes('M'), 'onboarding: invalid and duplicate avoided days should be removed');
  assert(result.previewTerms === 6, 'onboarding: generated preview should honor target term count');
  assert(result.previewFirstTerm === 'F27', 'onboarding: generated preview should honor start year');
  assert(result.previewProfileActive, 'onboarding: generated preview should use profile preferences');
  assert(result.curatedPreviewFirstId === 'F28' && result.curatedPreviewFirstName === 'Fall 2028', 'onboarding: curated preview should relabel to chosen start year');
  assert(result.curatedFirstId === 'F28' && result.curatedFirstName === 'Fall 2028', 'onboarding: curated schedule should relabel to chosen start year');
  assert(/2028.*2032/.test(result.curatedEyebrow), 'onboarding: program eyebrow should reflect chosen start/end years');
  assert(result.firstPrefs.earliest === '10:00' && result.firstPrefs.latest === '17:00', 'onboarding: applied schedule prefs should persist on semesters');
  assert(result.firstPrefs.minBreak === 30 && result.firstPrefs.mode === 'compact', 'onboarding: applied schedule prefs should include mode and breaks');
  assert(result.firstPrefs.term === '202808', 'onboarding: applied schedule prefs should include inferred UMD term');

  return {
    id: 'ONBOARDING-PERSONALIZED',
    terms: `${result.fastTerms}/${result.standardTerms}`,
    start: result.curatedFirstName,
    prefs: `${result.firstPrefs.earliest}-${result.firstPrefs.latest} ${result.firstPrefs.mode}`,
  };
}

async function testOnboardingPriorCredit(context) {
  const result = clone(await vm.runInContext(`
    (async () => {
      state.activeSchedule = [{
        id: 'F26',
        name: 'Fall 2026',
        year: 'Year 1',
        courses: [{
          code: 'MATH140',
          title: 'Calculus I',
          cr: 4,
          category: 'gened-fsma',
          kind: 'core'
        }, {
          code: 'ENGL 101',
          title: 'Academic Writing',
          cr: 3,
          category: 'gened-fsaw',
          kind: 'gened'
        }, {
          code: 'CMSC131',
          title: 'Object-Oriented Programming I',
          cr: 4,
          category: 'major-support',
          kind: 'core'
        }]
      }];
      state.customSemesters = [];
      state.customCourses = [];
      state.courses = { MATH140: { status: 'passed', grade: 'A' } };
      state.recentChanges = [];
      fetchCourseFull = async code => {
        const id = normalizeCode(code);
        if (id === 'CMSC131') {
          return {
            code: 'CMSC 131',
            title: 'Object-Oriented Programming I',
            cr: 4,
            prereqs: [],
            coreqs: [],
            kind: 'core',
            category: 'major-support',
            categories: ['major-support']
          };
        }
        return null;
      };
      const resolved = onboardResolvePriorCredits('MATH140 CMSC131', [
        'ap-calc-bc-4',
        'ap-english-lang-4',
        'ib-econ-hl-5'
      ]);
      const reviewHtml = onboardPriorReviewChecklistHtml(resolved, { startYear: 2026 });
      const futureReviewHtml = onboardPriorReviewChecklistHtml(resolved, { startYear: 2028 });
      const applied = await onboardApplyPriorCredits({
        transferRaw: 'MATH140 CMSC131',
        priorCreditIds: ['ap-calc-bc-4', 'ap-english-lang-4', 'ib-econ-hl-5']
      });
      const customCodes = state.customCourses.map(course => course.code);
      const byCode = Object.fromEntries(state.customCourses.map(course => [course.code, course]));
      const sourceNotice = onboardPriorSourceNoticeHtml();
      const calcPreset = onboardPriorPresetById('ap-calc-bc-4');
      const econPreset = onboardPriorPresetById('ib-econ-hl-5');
      const calcDetailHtml = onboardPriorDetailHtml(calcPreset);
      const calcDetailLinks = onboardPriorPresetLinks(calcPreset).map(link => link.label);
      const recentChangeBeforeUndo = state.recentChanges[0] || null;
      const undoEntryKeys = (recentChangeBeforeUndo?.undo?.entries || []).map(entry => String(entry.code || '') + ':' + String(entry.stateKey || ''));
      const mathStateBeforeUndo = getCourseState('MATH140');
      const englishCreditStateBeforeUndo = state.courses['AP FSAW Credit'];
      const cmscStateBeforeUndo = getCourseState('CMSC131');
      const econStateBeforeUndo = state.courses['ECON 200'];
      const undoApplied = undoPlanChange(recentChangeBeforeUndo?.id || '');
      const afterUndoMathState = getCourseState('MATH140');
      const afterUndoCmscState = state.courses.CMSC131 || null;
      const afterUndoTransferKeys = Object.entries(state.courses || {}).filter(([, value]) => value.status === 'transfer').map(([key]) => key).sort();
      const customCodesAfterUndo = state.customCourses.map(course => course.code).sort();
      return {
        presetCount: ONBOARD_PRIOR_CREDIT_PRESETS.length,
        sourceNoteCount: ONBOARD_PRIOR_CREDIT_PRESETS.filter(preset => /chart 2023-2026/.test(onboardPriorPresetSourceNote(preset))).length,
        calcSourceNote: onboardPriorPresetSourceNote(calcPreset),
        econSourceNote: onboardPriorPresetSourceNote(econPreset),
        calcChipHtml: onboardPriorChipHtml(calcPreset),
        calcDetailHtml,
        calcDetailLinks,
        reviewHtml,
        futureReviewHtml,
        overlaps: resolved.overlaps,
        resolvedCodes: resolved.courses.map(course => course.code),
        resolvedCredits: resolved.totalCredits,
        summary: onboardPriorSummaryText(resolved),
        applied,
        customCodes,
        byCode,
        mathPlanMatch: findCourse('MATH 140')?.code || '',
        cmscPlanMatch: findCourse('CMSC 131')?.code || '',
        mathState: mathStateBeforeUndo,
        englishCreditState: englishCreditStateBeforeUndo,
        cmscState: cmscStateBeforeUndo,
        econState: econStateBeforeUndo,
        recentChange: recentChangeBeforeUndo,
        undoEntryKeys,
        undoApplied,
        afterUndoMathState,
        afterUndoCmscState,
        afterUndoTransferKeys,
        customCodesAfterUndo,
        sourceNotice,
      };
    })()
  `, context));

  assert(result.presetCount >= 18, 'onboarding prior credit: should expose a broad AP/IB preset list');
  assert(result.sourceNoteCount === result.presetCount, 'onboarding prior credit: every preset should expose chart source metadata');
  assert(/AP chart 2023-2026/.test(result.calcSourceNote) && /2 UMD courses/.test(result.calcSourceNote), 'onboarding prior credit: AP presets should name the AP chart and course count');
  assert(/IB chart 2023-2026/.test(result.econSourceNote) && /verify by exam date/.test(result.econSourceNote), 'onboarding prior credit: IB presets should name the IB chart and exam-date caveat');
  assert(/prior-chip-source/.test(result.calcChipHtml) && /verify by exam year/.test(result.calcChipHtml), 'onboarding prior credit: preset chips should render source notes');
  assert(/data-prior-detail="ap-calc-bc-4"/.test(result.calcChipHtml) && /Details/.test(result.calcChipHtml), 'onboarding prior credit: preset chips should expose a verification drawer trigger');
  assert(/Verification drawer/.test(result.calcDetailHtml) && /MATH 141/.test(result.calcDetailHtml) && /Before relying on it/.test(result.calcDetailHtml), 'onboarding prior credit: detail drawer should render equivalent courses and verification caveats');
  assert(/AP Chart 2023-2026/.test(result.calcDetailHtml) && /June 30, 2026/.test(result.calcDetailHtml), 'onboarding prior credit: detail drawer should include source and checked date');
  assert(result.calcDetailLinks.includes('AP Chart 2023-2026') && !result.calcDetailLinks.includes('IB Chart 2023-2026'), 'onboarding prior credit: AP detail drawer should link AP chart without IB chart');
  assert(/Prior Credit Review/.test(result.reviewHtml) && /Chart year check/.test(result.reviewHtml), 'onboarding prior credit: review checklist should render chart-year checks');
  assert(/Fall 2026/.test(result.reviewHtml) && /AP exam year|IB exam date/.test(result.reviewHtml), 'onboarding prior credit: review checklist should compare start year to AP/IB verification');
  assert(/Manual course lookup/.test(result.reviewHtml) && /Transfer Course Database/.test(result.reviewHtml), 'onboarding prior credit: review checklist should flag typed course lookup');
  assert(result.overlaps.some(overlap => overlap.code === 'MATH 140' && overlap.sources.includes('AP Calc BC 4+') && overlap.sources.includes('Manual entry')), 'onboarding prior credit: resolver should expose duplicate source overlaps');
  assert(/Selected-credit overlap/.test(result.reviewHtml) && /MATH 140 via AP Calc BC 4\+/.test(result.reviewHtml) && /Manual entry/.test(result.reviewHtml), 'onboarding prior credit: review checklist should flag overlapping AP/manual credit sources');
  assert(/Existing attempt conflict/.test(result.reviewHtml) && /MATH 140 is already marked passed/.test(result.reviewHtml), 'onboarding prior credit: review checklist should flag prior credits that overwrite existing UMD attempt states on no-space planned rows');
  assert(/Plan placement/.test(result.reviewHtml) && /outside-plan/.test(result.reviewHtml), 'onboarding prior credit: review checklist should distinguish plan matches from outside-plan credits');
  assert(/Duplicate-credit review/.test(result.reviewHtml), 'onboarding prior credit: review checklist should include duplicate-credit review');
  assert(/Fall 2028/.test(result.futureReviewHtml) && /current Registrar chart/.test(result.futureReviewHtml), 'onboarding prior credit: review checklist should warn when start year is outside checked chart window');
  assert(result.resolvedCodes.filter(code => code === 'MATH 140').length === 1, 'onboarding prior credit: should dedupe preset and raw MATH 140');
  assert(result.resolvedCodes.includes('MATH 141'), 'onboarding prior credit: AP Calc BC should include MATH 141');
  assert(result.resolvedCodes.includes('AP FSAW Credit'), 'onboarding prior credit: AP English should map to FSAW prior credit');
  assert(result.resolvedCodes.includes('ECON 200') && result.resolvedCodes.includes('ECON 201'), 'onboarding prior credit: IB economics should map both ECON courses');
  assert(result.resolvedCodes.includes('CMSC 131'), 'onboarding prior credit: raw codes should normalize display codes');
  assert(/course/.test(result.summary) && /credit/.test(result.summary), 'onboarding prior credit: summary should include course and credit counts');
  assert(result.mathPlanMatch === 'MATH140' && result.cmscPlanMatch === 'CMSC131', `onboarding prior credit: normalized course lookup should match planned no-space course rows (got ${result.mathPlanMatch || 'none'} / ${result.cmscPlanMatch || 'none'})`);
  assert(result.mathState.status === 'transfer', 'onboarding prior credit: existing planned MATH140 should be marked transfer through normalized prior-credit input');
  assert(!result.customCodes.includes('MATH 140'), 'onboarding prior credit: planned MATH140 should not be duplicated as custom MATH 140');
  assert(result.customCodes.includes('MATH 141'), 'onboarding prior credit: unplanned MATH 141 should be added outside the plan');
  assert(result.byCode['AP FSAW Credit'].category === 'gened-fsaw', 'onboarding prior credit: AP FSAW pseudo-course should satisfy FSAW category');
  assert(result.englishCreditState.status === 'transfer', 'onboarding prior credit: AP FSAW pseudo-course should be marked transfer');
  assert(!result.customCodes.includes('CMSC 131'), 'onboarding prior credit: planned CMSC131 should not be duplicated as custom CMSC 131');
  assert(result.cmscState.status === 'transfer' && result.econState.status === 'transfer', 'onboarding prior credit: added raw and preset courses should be marked transfer');
  assert(result.applied.applied.length === result.resolvedCodes.length, 'onboarding prior credit: applied count should match resolved deduped courses');
  assert(/prior-credit/.test(result.recentChange.type), 'onboarding prior credit: should record a recent change entry');
  assert(result.undoEntryKeys.includes('MATH 140:MATH140') && result.undoEntryKeys.includes('CMSC 131:CMSC131'), 'onboarding prior credit: undo entries should store normalized planned-row state keys');
  assert(result.undoApplied === true, 'onboarding prior credit: no-space planned-row prior credits should be undoable');
  assert(result.afterUndoMathState.status === 'passed' && result.afterUndoMathState.grade === 'A', 'onboarding prior credit: undo should restore the original no-space planned-row status');
  assert(!result.afterUndoCmscState, 'onboarding prior credit: undo should remove transfer state from planned CMSC131 when it had no prior status');
  assert(!result.afterUndoTransferKeys.includes('MATH140') && !result.afterUndoTransferKeys.includes('CMSC131'), 'onboarding prior credit: undo should clear transfer status from no-space planned-row keys');
  assert(result.customCodesAfterUndo.length === 0, 'onboarding prior credit: undo should remove all outside-plan prior-credit custom rows');
  assert(/Official source check/.test(result.sourceNotice) && /June 30, 2026/.test(result.sourceNotice), 'onboarding prior credit: source notice should include checked date');
  assert(/AP Chart 2023-2026/.test(result.sourceNotice) && /IB Chart 2023-2026/.test(result.sourceNotice), 'onboarding prior credit: source notice should link AP and IB chart sources');
  assert(result.sourceNotice.includes('registrar.umd.edu/transfer-credit/prior-learning-credit'), 'onboarding prior credit: source notice should link UMD prior learning credit');
  assert(result.sourceNotice.includes('app.transfercredit.umd.edu'), 'onboarding prior credit: source notice should link transfer database search');

  return {
    id: 'ONBOARDING-PRIOR-CREDIT',
    count: `${result.applied.applied.length}/${result.resolvedCredits}`,
    samples: result.resolvedCodes.slice(0, 4).join(','),
  };
}

async function testSettingsPriorCreditEditor(context) {
  const result = clone(await vm.runInContext(`
    (async () => {
      state.activeSchedule = [{
        id: 'F26',
        name: 'Fall 2026',
        year: 'Year 1',
        courses: [{
          code: 'MATH 140',
          title: 'Calculus I',
          cr: 4,
          category: 'gened-fsma',
          kind: 'core'
        }, {
          code: 'CMSC 131',
          title: 'Object-Oriented Programming I',
          cr: 4,
          category: 'major-support',
          kind: 'core'
        }]
      }];
      state.customCourses = [];
      state.courses = { 'MATH 140': { status: 'passed', grade: 'A' } };
      state.recentChanges = [];
      fetchCourseFull = async code => {
        const id = normalizeCode(code);
        if (id === 'CMSC131') {
          return {
            code: 'CMSC 131',
            title: 'Object-Oriented Programming I',
            cr: 4,
            prereqs: [],
            coreqs: [],
            kind: 'core',
            category: 'major-support',
            categories: ['major-support']
          };
        }
        return null;
      };
      const selectedInputs = [
        { dataset: { priorId: 'ap-calc-bc-4' }, checked: true, addEventListener() {} },
        { dataset: { priorId: 'ap-english-lang-4' }, checked: true, addEventListener() {} },
        { dataset: { priorId: 'ib-econ-hl-5' }, checked: true, addEventListener() {} },
      ];
      const chips = selectedInputs.map(input => ({
        selected: false,
        querySelector() { return input; },
        classList: { toggle(name, value) { if (name === 'selected') this.owner.selected = !!value; }, owner: null }
      }));
      chips.forEach(chip => { chip.classList.owner = chip; });
      const elements = {
        'settings-prior-credit-section': {
          classList: { add() {}, remove() {} },
          scrollIntoView() {},
        },
        'set-prior-codes': { value: 'CMSC131 MATH140', dataset: {}, addEventListener() {}, focus() {} },
        'set-prior-summary': { textContent: '' },
        'set-prior-review': { innerHTML: '', hidden: true },
        'set-prior-recovery-note': { innerHTML: '', hidden: true },
        'set-prior-status': { textContent: '', style: {} },
        'set-prior-source-note': { innerHTML: '' },
        'set-prior-detail': { innerHTML: '', hidden: true, dataset: {}, addEventListener() {}, scrollIntoView() {} },
        'plan-change-history': { innerHTML: '' },
        'set-prior-grid': {
          innerHTML: '',
          querySelectorAll(selector) {
            return selector === 'input[type="checkbox"]' ? selectedInputs : [];
          }
        }
      };
      const originalGet = document.getElementById.bind(document);
      const originalQuery = document.querySelectorAll ? document.querySelectorAll.bind(document) : () => [];
      document.getElementById = id => elements[id] || originalGet(id);
      document.querySelectorAll = selector => {
        if (selector === '#set-prior-grid input[type="checkbox"]:checked') return selectedInputs.filter(input => input.checked);
        if (selector === '#set-prior-grid input[type="checkbox"]') return selectedInputs;
        if (selector === '.settings-prior-chip') return chips;
        return originalQuery(selector);
      };
      const gridHtml = settingsPriorCreditGridHtml(['ap-calc-bc-4']);
      const detailOpened = onboardShowPriorPresetDetail('ap-calc-bc-4', 'set-prior-detail');
      const settingsDetailHtml = elements['set-prior-detail'].innerHTML;
      const settingsDetailHidden = elements['set-prior-detail'].hidden;
      onboardRenderPriorSourceNotice('set-prior-source-note');
      const sourceNoticeHtml = elements['set-prior-source-note'].innerHTML;
      settingsRefreshPriorCreditSummary();
      const summaryBefore = elements['set-prior-summary'].textContent;
      const settingsReviewHtml = elements['set-prior-review'].innerHTML;
      const settingsReviewHidden = elements['set-prior-review'].hidden;
      await applySettingsPriorCredits();
      const statusAfterApply = elements['set-prior-status'].textContent;
      const statusColorAfterApply = elements['set-prior-status'].style.color;
      const changeAfterApply = state.recentChanges[0] || null;
      const transferKeysAfterApply = Object.entries(state.courses || {}).filter(([, value]) => value.status === 'transfer').map(([key]) => key).sort();
      const customCodesAfterApply = state.customCourses.map(course => course.code).sort();
      renderPlanChangeHistory();
      const historyHtml = elements['plan-change-history'].innerHTML;
      const canUndoBefore = plannerChangeCanUndo(changeAfterApply);
      const coursesAfterApplySnapshot = JSON.parse(JSON.stringify(state.courses || {}));
      const customCoursesAfterApplySnapshot = JSON.parse(JSON.stringify(state.customCourses || []));
      state.customCourses = (state.customCourses || []).filter(course => normalizeCode(course.code) !== 'APFSAWCREDIT');
      delete state.courses['AP FSAW Credit'];
      renderPlanChangeHistory();
      const removedPriorHistoryHtml = elements['plan-change-history'].innerHTML;
      const canUndoAfterRemovedPrior = plannerChangeCanUndo(changeAfterApply);
      const removedPriorReviewTarget = plannerChangeReviewTarget(changeAfterApply);
      const removedPriorCreditTarget = plannerChangePriorCreditTarget(changeAfterApply);
      state.courses = JSON.parse(JSON.stringify(coursesAfterApplySnapshot));
      state.customCourses = JSON.parse(JSON.stringify(customCoursesAfterApplySnapshot));
      ['AP FSAW Credit', 'ECON 200', 'ECON 201'].forEach(code => { delete state.courses[code]; });
      const missingPriorNorms = new Set(['APFSAWCREDIT', 'ECON200', 'ECON201']);
      state.customCourses = (state.customCourses || []).filter(course => !missingPriorNorms.has(normalizeCode(course.code)));
      renderPlanChangeHistory();
      const multiRemovedPriorHistoryHtml = elements['plan-change-history'].innerHTML;
      const multiRemovedPriorCreditTarget = plannerChangePriorCreditTarget(changeAfterApply);
      const multiRemovedRecoveryHtml = plannerPriorCreditRecoveryHtml(multiRemovedPriorCreditTarget?.codes || []);
      const multiRemovedRecoveryRendered = plannerRenderPriorCreditRecovery(multiRemovedPriorCreditTarget?.codes || []);
      const multiRemovedRecoveryNoteHtml = elements['set-prior-recovery-note'].innerHTML;
      const multiRemovedRecoveryNoteHidden = elements['set-prior-recovery-note'].hidden;
      let multiRemovedSettingsOpened = false;
      const originalOpenSettings = openSettings;
      const originalFocusSettingsPriorCredit = plannerFocusSettingsPriorCredit;
      openSettings = () => {
        multiRemovedSettingsOpened = true;
        renderSettingsPriorCreditControls();
      };
      plannerFocusSettingsPriorCredit = () => true;
      const multiRemovedOpenResult = plannerOpenPriorCreditReview(changeAfterApply.id);
      openSettings = originalOpenSettings;
      plannerFocusSettingsPriorCredit = originalFocusSettingsPriorCredit;
      const multiRemovedOpenRecoveryNoteHtml = elements['set-prior-recovery-note'].innerHTML;
      const multiRemovedOpenRecoveryNoteHidden = elements['set-prior-recovery-note'].hidden;
      state.courses = JSON.parse(JSON.stringify(coursesAfterApplySnapshot));
      state.customCourses = JSON.parse(JSON.stringify(customCoursesAfterApplySnapshot));
      state.courses['MATH 140'] = { status: 'passed', grade: 'A' };
      state.customCourses = (state.customCourses || []).filter(course => normalizeCode(course.code) !== 'APFSAWCREDIT');
      delete state.courses['AP FSAW Credit'];
      renderPlanChangeHistory();
      const mixedPriorHistoryHtml = elements['plan-change-history'].innerHTML;
      const canUndoAfterMixedPrior = plannerChangeCanUndo(changeAfterApply);
      const mixedPriorReviewTarget = plannerChangeReviewTarget(changeAfterApply);
      const mixedPriorCreditTarget = plannerChangePriorCreditTarget(changeAfterApply);
      state.courses = JSON.parse(JSON.stringify(coursesAfterApplySnapshot));
      state.customCourses = JSON.parse(JSON.stringify(customCoursesAfterApplySnapshot));
      state.courses['MATH 140'] = { status: 'passed', grade: 'A' };
      renderPlanChangeHistory();
      const staleHistoryHtml = elements['plan-change-history'].innerHTML;
      const canUndoAfterStatusEdit = plannerChangeCanUndo(changeAfterApply);
      const staleReviewTarget = plannerChangeReviewTarget(changeAfterApply);
      const stalePriorCreditTarget = plannerChangePriorCreditTarget(changeAfterApply);
      let staleUndoApplied = null;
      let staleUndoMessage = '';
      const oldToastError = toastError;
      toastError = message => { staleUndoMessage = message; };
      staleUndoApplied = undoPlanChange(changeAfterApply.id);
      toastError = oldToastError;
      state.courses['MATH 140'] = { status: 'transfer', grade: '' };
      const undoApplied = undoPlanChange(changeAfterApply.id);
      const transferKeysAfterUndo = Object.entries(state.courses || {}).filter(([, value]) => value.status === 'transfer').map(([key]) => key).sort();
      const customCodesAfterUndo = state.customCourses.map(course => course.code).sort();
      const undoChange = state.recentChanges[0] || null;
      const originalChangeAfterUndo = state.recentChanges.find(change => change.id === changeAfterApply.id) || null;
      return {
        gridHasPreset: /ap-calc-bc-4/.test(gridHtml) && /settings-prior-chip/.test(gridHtml),
        gridHasSourceNote: /prior-chip-source/.test(gridHtml) && /AP chart 2023-2026/.test(gridHtml) && /verify by exam year/.test(gridHtml),
        gridHasDetailButton: /data-prior-detail="ap-calc-bc-4"/.test(gridHtml),
        detailOpened,
        settingsDetailHtml,
        settingsDetailHidden,
        sourceNoticeHtml,
        summaryBefore,
        settingsReviewHtml,
        settingsReviewHidden,
        statusAfter: statusAfterApply,
        statusColor: statusColorAfterApply,
        transferKeys: transferKeysAfterApply,
        customCodes: customCodesAfterApply,
        recentChange: changeAfterApply,
        historyHtml,
        canUndoBefore,
        removedPriorHistoryHtml,
        canUndoAfterRemovedPrior,
        removedPriorReviewTarget,
        removedPriorCreditTarget,
        multiRemovedPriorHistoryHtml,
        multiRemovedPriorCreditTarget,
        multiRemovedRecoveryHtml,
        multiRemovedRecoveryRendered,
        multiRemovedRecoveryNoteHtml,
        multiRemovedRecoveryNoteHidden,
        multiRemovedSettingsOpened,
        multiRemovedOpenResult,
        multiRemovedOpenRecoveryNoteHtml,
        multiRemovedOpenRecoveryNoteHidden,
        mixedPriorHistoryHtml,
        canUndoAfterMixedPrior,
        mixedPriorReviewTarget,
        mixedPriorCreditTarget,
        staleHistoryHtml,
        canUndoAfterStatusEdit,
        staleReviewTarget,
        stalePriorCreditTarget,
        staleUndoApplied,
        staleUndoMessage,
        undoApplied,
        transferKeysAfterUndo,
        customCodesAfterUndo,
        undoChange,
        originalChangeAfterUndo,
      };
    })()
  `, context));

  assert(result.gridHasPreset, 'settings prior credit: grid should render AP/IB preset chips');
  assert(result.gridHasSourceNote, 'settings prior credit: grid should render per-preset source notes');
  assert(result.gridHasDetailButton, 'settings prior credit: grid should expose detail buttons');
  assert(result.detailOpened === true && result.settingsDetailHidden === false, 'settings prior credit: detail drawer should open into settings panel');
  assert(/AP Calc BC 4\+/.test(result.settingsDetailHtml) && /MATH 141/.test(result.settingsDetailHtml) && /AP Chart 2023-2026/.test(result.settingsDetailHtml), 'settings prior credit: detail drawer should show selected preset source and equivalents');
  assert(/Official source check/.test(result.sourceNoticeHtml) && /Transfer Course Database/.test(result.sourceNoticeHtml), 'settings prior credit: source notice should render official links');
  assert(/AP Chart 2023-2026/.test(result.sourceNoticeHtml) && /IB Chart 2023-2026/.test(result.sourceNoticeHtml), 'settings prior credit: source notice should include AP/IB chart links');
  assert(/June 30, 2026/.test(result.sourceNoticeHtml) && result.sourceNoticeHtml.includes('app.transfercredit.umd.edu'), 'settings prior credit: source notice should include checked date and database search link');
  assert(/6 courses/.test(result.summaryBefore) && /20 credits/.test(result.summaryBefore), 'settings prior credit: live summary should count deduped preset and raw credits');
  assert(result.settingsReviewHidden === false && /Prior Credit Review/.test(result.settingsReviewHtml), 'settings prior credit: review checklist should render when credits are selected');
  assert(/Chart year check/.test(result.settingsReviewHtml) && /Fall 2026/.test(result.settingsReviewHtml), 'settings prior credit: review checklist should infer plan start year');
  assert(/Plan placement/.test(result.settingsReviewHtml) && /Manual course lookup/.test(result.settingsReviewHtml), 'settings prior credit: review checklist should include placement and manual lookup checks');
  assert(/Applied 6 prior-credit courses/.test(result.statusAfter), 'settings prior credit: status should report applied credits');
  assert(result.statusColor === 'var(--green)', 'settings prior credit: successful apply should show green status');
  assert(result.transferKeys.includes('MATH 140') && result.transferKeys.includes('CMSC 131'), 'settings prior credit: planned courses should be marked transfer');
  assert(result.transferKeys.includes('AP FSAW Credit') && result.transferKeys.includes('ECON 200') && result.transferKeys.includes('ECON 201'), 'settings prior credit: preset courses should be marked transfer');
  assert(!result.customCodes.includes('MATH 140') && !result.customCodes.includes('CMSC 131'), 'settings prior credit: planned courses should not be duplicated as custom courses');
  assert(result.customCodes.includes('MATH 141') && result.customCodes.includes('AP FSAW Credit'), 'settings prior credit: unplanned equivalents should be added outside plan');
  assert(result.recentChange.source === 'settings', 'settings prior credit: recent change should record settings source');
  assert(result.recentChange.undo?.kind === 'prior-credit', 'settings prior credit: recent change should include undo payload');
  assert(result.recentChange.undo?.review?.overlaps?.some(item => item.code === 'MATH 140' && item.sources.includes('AP Calc BC 4+') && item.sources.includes('Manual entry')), 'settings prior credit: recent change should preserve selected-credit overlap evidence');
  assert(result.recentChange.undo?.review?.existingAttempts?.some(item => item.code === 'MATH 140' && item.status === 'passed' && item.grade === 'A'), 'settings prior credit: recent change should preserve existing-attempt conflict evidence');
  assert(/data-change-undo/.test(result.historyHtml) && /Undo/.test(result.historyHtml), 'settings prior credit: recent changes should render undo action');
  assert(result.canUndoBefore === true, 'settings prior credit: change should be undoable before applying undo');
  assert(result.canUndoAfterRemovedPrior === false, 'settings prior credit: removed prior-credit course should disable undo');
  assert(/Undo unavailable/.test(result.removedPriorHistoryHtml) && /AP FSAW Credit was changed/.test(result.removedPriorHistoryHtml), 'settings prior credit: removed prior-credit course should explain stale undo');
  assert(!/data-change-undo/.test(result.removedPriorHistoryHtml), 'settings prior credit: removed prior-credit course should hide undo button');
  assert(!/data-change-review/.test(result.removedPriorHistoryHtml), 'settings prior credit: removed prior-credit course should not offer a missing plan-row jump');
  assert(/data-change-prior-credit/.test(result.removedPriorHistoryHtml) && /Review removed credit/.test(result.removedPriorHistoryHtml), 'settings prior credit: removed prior-credit course should offer settings recovery');
  assert(!result.removedPriorReviewTarget && result.removedPriorCreditTarget?.label === 'Review removed credit', 'settings prior credit: removed prior-credit target should open prior-credit review');
  assert(/AP FSAW Credit, ECON 200, ECON 201 were changed/.test(result.multiRemovedPriorHistoryHtml), 'settings prior credit: multiple removed prior credits should explain all changed entries');
  assert(/Review 3 removed credits/.test(result.multiRemovedPriorHistoryHtml), 'settings prior credit: multiple removed credits should render a plural recovery label');
  assert(result.multiRemovedPriorCreditTarget?.codes?.length === 3 && result.multiRemovedPriorCreditTarget?.label === 'Review 3 removed credits', 'settings prior credit: multiple removed target should carry all removed codes');
  assert(/3 removed prior-credit entries need review/.test(result.multiRemovedRecoveryHtml), 'settings prior credit: recovery note should pluralize removed prior-credit entries');
  assert(/AP FSAW Credit, ECON 200, ECON 201/.test(result.multiRemovedRecoveryHtml) && /official sources/.test(result.multiRemovedRecoveryHtml), 'settings prior credit: recovery note should list removed credits and official-source guidance');
  assert(result.multiRemovedRecoveryRendered === true && result.multiRemovedRecoveryNoteHidden === false, 'settings prior credit: recovery note renderer should reveal the Settings notice');
  assert(result.multiRemovedSettingsOpened === true && result.multiRemovedOpenResult === true, 'settings prior credit: Timeline recovery should open Settings');
  assert(result.multiRemovedOpenRecoveryNoteHidden === false && /3 removed prior-credit entries/.test(result.multiRemovedOpenRecoveryNoteHtml), 'settings prior credit: Timeline recovery should restore the Settings notice after opening Settings');
  assert(result.canUndoAfterMixedPrior === false, 'settings prior credit: mixed stale row should disable unsafe undo');
  assert(/MATH 140, AP FSAW Credit were changed/.test(result.mixedPriorHistoryHtml), 'settings prior credit: mixed stale row should explain visible and removed changes');
  assert(!/data-change-undo/.test(result.mixedPriorHistoryHtml), 'settings prior credit: mixed stale row should hide undo button');
  assert(/data-change-review/.test(result.mixedPriorHistoryHtml) && /Show Plan edit/.test(result.mixedPriorHistoryHtml), 'settings prior credit: mixed stale row should offer visible Plan recovery');
  assert(/data-change-prior-credit/.test(result.mixedPriorHistoryHtml) && /Review removed credit/.test(result.mixedPriorHistoryHtml), 'settings prior credit: mixed stale row should offer removed-credit settings recovery');
  assert(result.mixedPriorReviewTarget?.code === 'MATH 140', 'settings prior credit: mixed Plan recovery should target visible edited course');
  assert(result.mixedPriorCreditTarget?.codes?.includes('AP FSAW Credit') && result.mixedPriorCreditTarget?.label === 'Review removed credit', 'settings prior credit: mixed removed recovery should target missing course');
  assert(result.canUndoAfterStatusEdit === false, 'settings prior credit: edited course status should disable undo');
  assert(/Undo unavailable/.test(result.staleHistoryHtml) && /MATH 140 was changed/.test(result.staleHistoryHtml), 'settings prior credit: stale undo should explain edited course status');
  assert(!/data-change-undo/.test(result.staleHistoryHtml), 'settings prior credit: stale undo should hide undo button');
  assert(/data-change-review/.test(result.staleHistoryHtml) && /Show edited course/.test(result.staleHistoryHtml), 'settings prior credit: stale undo should offer a recovery jump');
  assert(result.staleReviewTarget?.code === 'MATH 140', 'settings prior credit: recovery jump should target the edited course');
  assert(!result.stalePriorCreditTarget, 'settings prior credit: visible edited course should not show settings recovery');
  assert(!/data-change-schedule/.test(result.staleHistoryHtml), 'settings prior credit: stale undo should not show a section schedule jump');
  assert(result.staleUndoApplied === false && /MATH 140 was changed/.test(result.staleUndoMessage), 'settings prior credit: stale undo click should report edited course status');
  assert(result.undoApplied === true, 'settings prior credit: undo should apply successfully');
  assert(!result.transferKeysAfterUndo.includes('MATH 140') && !result.transferKeysAfterUndo.includes('CMSC 131'), 'settings prior credit: undo should restore planned-course statuses');
  assert(result.customCodesAfterUndo.length === 0, 'settings prior credit: undo should remove added outside-plan prior-credit courses');
  assert(result.undoChange.type === 'prior-credit-undo', 'settings prior credit: undo should record a restore change');
  assert(result.originalChangeAfterUndo.undo?.appliedAt, 'settings prior credit: original undo action should be marked applied');

  return {
    id: 'SETTINGS-PRIOR-CREDIT',
    transfers: result.transferKeys.length,
    added: result.customCodes.length,
    undo: result.customCodesAfterUndo.length,
  };
}

async function main() {
  const context = buildContext();
  const fixtures = [
    { id: 'ENAE', category: 'high-credit engineering', minRequirementCourses: 30, minGenEdPlaceholders: 10, minFreeElectives: 0 },
    { id: 'BIOE', category: 'high-credit life science engineering', minRequirementCourses: 28, minGenEdPlaceholders: 10, minFreeElectives: 1 },
    { id: 'AAST', category: 'low-requirement BA', minRequirementCourses: 10, minGenEdPlaceholders: 12, minFreeElectives: 10 },
    { id: 'SPAN', category: 'BA language and culture', minRequirementCourses: 10, minGenEdPlaceholders: 12, minFreeElectives: 12 },
    { id: 'AOSC', category: 'STEM science', minRequirementCourses: 18, minGenEdPlaceholders: 10, minFreeElectives: 8 },
    { id: 'STAT', category: 'STEM data/math', minRequirementCourses: 15, minGenEdPlaceholders: 10, minFreeElectives: 8 },
  ];

  const rows = [];
  for (const fixture of fixtures) {
    rows.push(await testMajorFixture(context, fixture));
  }
  const prereq = testSyntheticPrerequisites(context);
  const prereqResolver = testPrereqResolverNormalizedState(context);
  const bulkState = testBulkCourseStateNormalization(context);
  const diagnostics = await testAutoPlanDiagnostics(context);
  const allGroups = await testAllGeneratedRequirementGroups(context);
  const catalogYear = await testCatalogYearTargeting(context);
  const account = testAccountAndShareState(context);
  const accountSetup = testAccountCloudSetup(context);
  const releaseJson = testReleaseJsonReport();
  const canonicalTitles = testCanonicalCourseTitles(context);
  const timing = testScheduleTimingFit(context);
  const readiness = testScheduleRegistrationReadiness(context);
  const mapUndo = testScheduleReadinessMapUndo(context);
  const actionUndo = await testScheduleActionUndo(context);
  const chip = testScheduleCourseChip(context);
  const termGuards = await testScheduleTermMismatchGuards(context);
  const seatRisk = testScheduleSeatRiskBackups(context);
  const readyBackups = await testScheduleReadyBackupBulkAction(context);
  const dndCleanup = testDragDropSelectionCleanup(context);
  const customDeleteCleanup = testCustomDeleteSelectionCleanup(context);
  const courseEditCleanup = await testCourseEditSelectionCleanup(context);
  const courseCodeCollision = await testCourseCodeCollisionGuard(context);
  const recoMove = testRecommendationMoveAction(context);
  const recoSection = testRecommendationBestSectionAction(context);
  const planner = testPlannerRegistrationChecklist(context);
  const questions = testPlannerAdvisorQuestions(context);
  const plannerTermSections = testPlannerSectionTermGuards(context);
  const plannerAvailability = await testPlannerAvailabilitySeatPressure(context);
  const plannerMoveUndo = testPlannerTermMoveUndo(context);
  const browse = await testBrowseProfileDepartments(context);
  const browseSections = await testBrowseResultSections(context);
  const browseWhy = await testBrowseExplanationPanel(context);
  const browseImpact = await testBrowseImpactPreview(context);
  const placeholderSections = await testPlaceholderSectionPreview(context);
  const browseReplacement = await testBrowsePlaceholderReplacement(context);
  const browseSlot = await testBrowseSlotSelection(context);
  const browseTypedSlots = await testBrowseTypedSlotMatching(context);
  const auditIssues = testAuditIssueDrawer(context);
  const priorCredit = await testOnboardingPriorCredit(context);
  const settingsPrior = await testSettingsPriorCreditEditor(context);
  const onboarding = await testOnboardingPersonalizedSetup(context);

  console.table(rows);
  console.log(`Prerequisite fixture ${prereq.id}: terms ${prereq.terms}; loads ${prereq.loads}`);
  console.log(`Prerequisite resolver fixture ${prereqResolver.id}: completed ${prereqResolver.completed}; planned ${prereqResolver.planned}; missing ${prereqResolver.missing}.`);
  console.log(`Bulk state fixture ${bulkState.id}: transfer ${bulkState.transfer}; reset ${bulkState.reset}; progress ${bulkState.progress}.`);
  console.log(`Auto-plan diagnostics fixture ${diagnostics.id}: template missing ${diagnostics.templateMissing}; mixed ${diagnostics.mixedCoverage}.`);
  console.log(`All generated requirement groups fixture ${allGroups.id}: ${allGroups.majors} majors; ${allGroups.requirements} grouped requirements.`);
  console.log(`Catalog year fixture ${catalogYear.id}: target ${catalogYear.target}; source ${catalogYear.source}.`);
  console.log(`Account/share fixture ${account.id}: ${account.normalizedInvite}; ${account.importedCourse}; ${account.outputPreset}.`);
  console.log(`Account setup fixture ${accountSetup.id}: missing ${accountSetup.missing}; Vercel ${accountSetup.vercel}.`);
  console.log(`Release report fixture ${releaseJson.id}: ${releaseJson.status}; stages ${releaseJson.stages}.`);
  console.log(`Canonical title fixture ${canonicalTitles.id}: AMST 205 -> ${canonicalTitles.amst205}.`);
  console.log(`Schedule timing fixture ${timing.id}: compact ${timing.compactScore}, idle ${timing.idleScore}, tight transitions ${timing.tightTransitions}, comparison +${timing.comparisonTimingDelta}.`);
  console.log(`Schedule readiness fixture ${readiness.id}: ${readiness.label}; gates ${readiness.gates}.`);
  console.log(`Schedule map undo fixture ${mapUndo.id}: restored ${mapUndo.restored}.`);
  console.log(`Schedule action undo fixture ${actionUndo.id}: clear ${actionUndo.clear}, auto ${actionUndo.auto}, alternate ${actionUndo.alternate}.`);
  console.log(`Schedule chip fixture ${chip.id}: ${chip.risk}, ${chip.closed}, ${chip.ok}.`);
  console.log(`Schedule term guards fixture ${termGuards.id}: replaced ${termGuards.replaced}; ${termGuards.stale}.`);
  console.log(`Schedule seat-risk fixture ${seatRisk.id}: ${seatRisk.warnings} warnings with ${seatRisk.checklist} and ${seatRisk.questions}.`);
  console.log(`Schedule ready backups fixture ${readyBackups.id}: applied ${readyBackups.applied}; restored ${readyBackups.restored}.`);
  console.log(`Drag/drop cleanup fixture ${dndCleanup.id}: required ${dndCleanup.required}; custom ${dndCleanup.custom}.`);
  console.log(`Custom delete cleanup fixture ${customDeleteCleanup.id}: semester courses ${customDeleteCleanup.semesterRemoved}; course rows ${customDeleteCleanup.courseRemoved}.`);
  console.log(`Course edit cleanup fixture ${courseEditCleanup.id}: semantic ${courseEditCleanup.semantic}; formatting ${courseEditCleanup.formatted}; moved ${courseEditCleanup.moved}; normalized ${courseEditCleanup.normalizedState}.`);
  console.log(`Course code collision fixture ${courseCodeCollision.id}: blocked ${courseCodeCollision.blocked}; formatted ${courseCodeCollision.formatted}.`);
  console.log(`Recommendation move fixture ${recoMove.id}: moved ${recoMove.moved} from ${recoMove.from}.`);
  console.log(`Recommendation section fixture ${recoSection.id}: picked ${recoSection.picked} for ${recoSection.moved}.`);
  console.log(`Planner checklist fixture ${planner.id}: ${planner.count} items; levels ${planner.levels}.`);
  console.log(`Planner questions fixture ${questions.id}: ${questions.count} questions; levels ${questions.levels}.`);
  console.log(`Planner term-section fixture ${plannerTermSections.id}: selected ${plannerTermSections.selected}; unscheduled ${plannerTermSections.unscheduled}.`);
  console.log(`Planner availability fixture ${plannerAvailability.id}: ${plannerAvailability.level}; suggested ${plannerAvailability.suggestion}.`);
  console.log(`Planner term-move undo fixture ${plannerMoveUndo.id}: restored ${plannerMoveUndo.restored}; custom ${plannerMoveUndo.custom}.`);
  console.log(`Browse profile fixture ${browse.id}: ${browse.scope}; ${browse.genEdCount} GenEd rows; ${browse.deptCount} dept rows; saved ${browse.saved}.`);
  console.log(`Browse sections fixture ${browseSections.id}: first ${browseSections.first}; availability ${browseSections.availability}; ${browseSections.sections}.`);
  console.log(`Browse explanation fixture ${browseWhy.id}: score ${browseWhy.score}; reasons ${browseWhy.reasons}.`);
  console.log(`Browse impact fixture ${browseImpact.id}: ${browseImpact.mode}; load ${browseImpact.load}.`);
  console.log(`Placeholder sections fixture ${placeholderSections.id}: first ${placeholderSections.first}; pinned ${placeholderSections.pinned}; undo ${placeholderSections.undo}; load ${placeholderSections.load}; progress ${placeholderSections.progress}.`);
  console.log(`Browse replacement fixture ${browseReplacement.id}: ${browseReplacement.search}; replaced ${browseReplacement.replaced}.`);
  console.log(`Browse slot fixture ${browseSlot.id}: first ${browseSlot.firstSlot}; replaced ${browseSlot.replaced}.`);
  console.log(`Browse typed slots fixture ${browseTypedSlots.id}: ${browseTypedSlots.gvpt}; ${browseTypedSlots.language}; ${browseTypedSlots.support}.`);
  console.log(`Audit issue fixture ${auditIssues.id}: ${auditIssues.count} issues; opened ${auditIssues.opened}; browse ${auditIssues.browse}.`);
  console.log(`Onboarding prior credit fixture ${priorCredit.id}: ${priorCredit.count}; ${priorCredit.samples}.`);
  console.log(`Settings prior credit fixture ${settingsPrior.id}: ${settingsPrior.transfers} transfers; ${settingsPrior.added} outside-plan courses; undo leaves ${settingsPrior.undo}.`);
  console.log(`Onboarding fixture ${onboarding.id}: terms ${onboarding.terms}; start ${onboarding.start}; prefs ${onboarding.prefs}.`);
  console.log(`Generated-plan regression fixtures passed (${rows.length} majors + prerequisite chain + prerequisite resolver state + normalized bulk state + auto-plan diagnostics + all generated requirement groups + catalog-year targeting + account/share state + account setup + release JSON report + canonical titles + schedule timing + registration readiness + calendar export readiness + readiness map undo + schedule action undo + schedule course chips + schedule term guards + schedule ready backups + drag/drop section cleanup + custom delete cleanup + course edit cleanup + course code collision guard + recommendation move action + recommendation section pick + planner checklist + planner questions + planner term-section guards + planner availability seat pressure + planner term-move undo + browse profile saved searches + browse sections + browse explanations + browse impact preview + placeholder section preview + browse replacement + browse slot selection + browse typed slot matching + audit issues + onboarding prior credit + settings prior credit + personalized onboarding).`);
}

main().catch(error => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
