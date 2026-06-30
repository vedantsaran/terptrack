#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

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
    'js/api.js',
    'js/import.js',
    'js/share.js',
    'js/account.js',
    'js/schedule.js',
    'js/timeline.js',
    'js/browse.js',
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

function assertProfileElectives(courses, majorId) {
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
  assert(review.genEdPlaceholders >= fixture.minGenEdPlaceholders, `${fixture.id}: expected at least ${fixture.minGenEdPlaceholders} GenEd placeholders`);
  assert(review.freeElectives >= fixture.minFreeElectives, `${fixture.id}: expected at least ${fixture.minFreeElectives} free electives`);
  assertNoDuplicateCodes(courses, fixture.id);
  assertProfileElectives(courses, fixture.id);

  return {
    id: fixture.id,
    category: fixture.category,
    credits: `${review.totalCredits}/${review.targetCredits}`,
    loads: review.termLoads.map(term => term.credits).join(','),
    genEd: `${review.genEdCompleteCount}/${review.genEdRequirementCount}`,
    genEdPlaceholders: review.genEdPlaceholders,
    freeElectives: review.freeElectives,
    requirements: review.requirementCourseCount,
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
      activeSchedule: null,
      selectedSections: {},
      schedulePrefs: {},
      profilePrefs: defaultProfilePrefs(),
      settings: { ...DEFAULT_SETTINGS }
    };
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
      recentChanges: [{ id: 'change-1' }],
      profilePrefs: { interests: ['business'], careerGoal: 'finance analytics', genEdDepts: ['ECON'] },
      settings: { theme: 'light' }
    }, { confirm: false, sourceLabel: 'friend plan' });
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
      selectedSection: state.selectedSections['MATH 140'],
      profileInterest: state.profilePrefs.interests[0],
      roadmapFilter: state.roadmapPrefs.filter,
      outputPreset: state.scheduleOutputPreset,
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
  assert(result.selectedSection === '0101', 'shared plan: selected section should persist');
  assert(result.profileInterest === 'business', 'shared plan: profile prefs should normalize');
  assert(result.roadmapFilter === 'gened', 'shared plan: roadmap prefs should persist');
  assert(result.outputPreset === 'advisor', 'shared plan: output preset should persist');

  return {
    id: 'ACCOUNT-FRIENDS',
    normalizedInvite: result.inviteEmail,
    importedCourse: 'MATH 140',
    outputPreset: result.outputPreset,
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
      };
    })()
  `, context));

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

function testAccountCloudSetup(context) {
  const result = clone(vm.runInContext(`
    (() => {
      const missing = accountCloudSetupChecks({ source: 'none', supabaseUrl: '', supabaseAnonKey: '' }, false, 'https://terptrack.vercel.app');
      const manual = accountCloudSetupChecks({ source: 'manual', supabaseUrl: 'https://demo.supabase.co', supabaseAnonKey: 'a'.repeat(80) }, true, 'http://127.0.0.1:5174');
      const vercel = accountCloudSetupChecks({ source: 'vercel', supabaseUrl: 'https://demo.supabase.co', supabaseAnonKey: 'b'.repeat(80) }, true, 'https://terptrack.vercel.app');
      const html = accountCloudSetupHtml({ source: 'vercel', supabaseUrl: 'https://demo.supabase.co', supabaseAnonKey: 'b'.repeat(80) }, true);
      return {
        missingStatuses: missing.map(check => check.status).join(','),
        manualDeployment: manual.find(check => check.id === 'deployment')?.status || '',
        manualClient: manual.find(check => check.id === 'client')?.status || '',
        vercelDeployment: vercel.find(check => check.id === 'deployment')?.status || '',
        vercelCredentials: vercel.find(check => check.id === 'credentials')?.status || '',
        vercelClient: vercel.find(check => check.id === 'client')?.status || '',
        html,
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

  return {
    id: 'ACCOUNT-CLOUD-SETUP',
    missing: result.missingStatuses,
    vercel: [result.vercelDeployment, result.vercelCredentials, result.vercelClient].join('/'),
  };
}

function testPlannerRegistrationChecklist(context) {
  const result = clone(vm.runInContext(`
    (() => {
      recoGenEdGaps = () => [{ id: 'DSHU', label: 'Humanities', have: 0, need: 1 }];
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
        text,
        hasScheduleButton: /data-planner-schedule/.test(html),
        hasGenEdButton: /data-planner-gened/.test(html),
      };
    })()
  `, context));

  assert(result.titles.some(title => /full-time|credit load|credits/i.test(title)), 'planner checklist: should include next-term credit-load status');
  assert(result.titles.some(title => /prerequisite/i.test(title)), 'planner checklist: should include prerequisite order risk');
  assert(result.titles.some(title => /timing fit/i.test(title)), 'planner checklist: should include picked-section timing fit');
  assert(result.titles.some(title => /Humanities|DSHU/i.test(title)), 'planner checklist: should include GenEd gap action');
  assert(result.levels.includes('danger') || result.levels.includes('warn'), 'planner checklist: should flag registration risks');
  assert(/Registration checklist/.test(result.text) && /CMSC 216/.test(result.text), 'planner checklist: export text should include checklist details');
  assert(result.hasScheduleButton, 'planner checklist: should render an open Schedule action');
  assert(result.hasGenEdButton, 'planner checklist: should render a GenEd search action');

  return {
    id: 'PLANNER-CHECKLIST',
    count: result.titles.length,
    levels: result.levels.join(','),
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
      browseGenEd = '';
      const deptRows = await browseListCoursesForCurrentScope();
      return {
        defaultDept,
        scope: defaultScope.depts.slice(0, 4),
        genEdCodes: genEdRows.map(row => row.course_id).sort(),
        deptCodes: deptRows.map(row => row.course_id).sort(),
        callCount: calls.length,
        calls,
      };
    })()
  `, context));

  assert(result.defaultDept === '__PROFILE_DEPTS__', 'browse profile: should default to profile department mode');
  assert(result.scope.includes('INST') && result.scope.includes('PSYC') && result.scope.includes('GVPT'), 'browse profile: expected preferred departments in scope');
  assert(result.genEdCodes.includes('INST150') && result.genEdCodes.includes('PSYC150'), 'browse profile: GenEd search should fan out across profile departments');
  assert(result.deptCodes.includes('INST101') && result.deptCodes.includes('PSYC101'), 'browse profile: department search should fan out across profile departments');
  assert(result.genEdCodes.filter(code => code === 'INST201').length === 1, 'browse profile: GenEd rows should dedupe shared courses');
  assert(result.deptCodes.filter(code => code === 'INST201').length === 1, 'browse profile: department rows should dedupe shared courses');
  assert(result.callCount >= 6, 'browse profile: expected multiple department calls');

  return {
    id: 'BROWSE-PROFILE',
    scope: result.scope.join(','),
    genEdCount: result.genEdCodes.length,
    deptCount: result.deptCodes.length,
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
  const account = testAccountAndShareState(context);
  const accountSetup = testAccountCloudSetup(context);
  const timing = testScheduleTimingFit(context);
  const planner = testPlannerRegistrationChecklist(context);
  const browse = await testBrowseProfileDepartments(context);

  console.table(rows);
  console.log(`Prerequisite fixture ${prereq.id}: terms ${prereq.terms}; loads ${prereq.loads}`);
  console.log(`Account/share fixture ${account.id}: ${account.normalizedInvite}; ${account.importedCourse}; ${account.outputPreset}.`);
  console.log(`Account setup fixture ${accountSetup.id}: missing ${accountSetup.missing}; Vercel ${accountSetup.vercel}.`);
  console.log(`Schedule timing fixture ${timing.id}: compact ${timing.compactScore}, idle ${timing.idleScore}, tight transitions ${timing.tightTransitions}, comparison +${timing.comparisonTimingDelta}.`);
  console.log(`Planner checklist fixture ${planner.id}: ${planner.count} items; levels ${planner.levels}.`);
  console.log(`Browse profile fixture ${browse.id}: ${browse.scope}; ${browse.genEdCount} GenEd rows; ${browse.deptCount} dept rows.`);
  console.log(`Generated-plan regression fixtures passed (${rows.length} majors + prerequisite chain + account/share state + account setup + schedule timing + planner checklist + browse profile).`);
}

main().catch(error => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
