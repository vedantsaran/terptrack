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
    'js/settings.js',
    'js/share.js',
    'js/account.js',
    'js/schedule.js',
    'js/timeline.js',
    'js/browse.js',
    'js/gened.js',
    'js/placeholder-search.js',
    'js/onboarding.js',
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
      browseSavedSearches: [],
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
      browseSavedSearches: [
        { id: 'friend-search', dept: '__PROFILE_DEPTS__', genEd: 'DSHU', search: 'ethics' },
        { id: 'invalid-search', dept: 'TOOLONG', genEd: '', search: '' }
      ],
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
      browseSearchCount: state.browseSavedSearches.length,
      browseSearchDept: state.browseSavedSearches[0]?.dept,
      browseSearchQuery: state.browseSavedSearches[0]?.search,
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
  assert(result.browseSearchCount === 1, 'shared plan: invalid saved browse searches should be removed');
  assert(result.browseSearchDept === '__PROFILE_DEPTS__', 'shared plan: saved browse profile department preset should persist');
  assert(result.browseSearchQuery === 'ethics', 'shared plan: saved browse search keyword should persist');
  assert(result.outputPreset === 'advisor', 'shared plan: output preset should persist');

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
      const templateHtml = autoPlanDiagnosticsHtml(template) + autoPlanSourceSamplesHtml(template);
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
      const mixedHtml = autoPlanDiagnosticsHtml(mixed) + autoPlanSourceSamplesHtml(mixed);

      return {
        templateCoverage: template.metadataCoverage,
        templateTitles: templateDiagnostics.map(item => item.title),
        templateHtml,
        templatePlaceholderSamples: template.placeholderSamples.map(item => item.code),
        placeholderAction,
        replacementBrowse,
        mixedCoverage: mixed.metadataCoverage,
        mixedTitles: mixedDiagnostics.map(item => item.title),
        mixedHtml,
      };
    })()
  `, context));

  assert(result.templateCoverage.coveragePct === 0, 'auto plan diagnostics: template-only preview should show 0% live coverage');
  assert(result.templateCoverage.missingCodes.length > 0, 'auto plan diagnostics: template-only preview should list fallback codes');
  assert(result.templateTitles.includes('Template-only preview'), 'auto plan diagnostics: should flag template-only source');
  assert(result.templateTitles.includes('Replacement work'), 'auto plan diagnostics: should flag placeholder replacement work');
  assert(/Template fallback/.test(result.templateHtml), 'auto plan diagnostics: source samples should include template fallback row');
  assert(/Placeholders to replace/.test(result.templateHtml), 'auto plan diagnostics: source samples should include placeholder row');
  assert(/data-auto-plan-browse-placeholder/.test(result.templateHtml), 'auto plan diagnostics: placeholder source samples should include browse actions');
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
  assert(/Live metadata/.test(result.mixedHtml) && /Template fallback/.test(result.mixedHtml), 'auto plan diagnostics: mixed source samples should compare live and fallback rows');

  return {
    id: 'AUTO-PLAN-DIAGNOSTICS',
    templateMissing: result.templateCoverage.missing,
    mixedCoverage: `${result.mixedCoverage.found}/${result.mixedCoverage.total}`,
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

function testPlannerAdvisorQuestions(context) {
  const result = clone(vm.runInContext(`
    (() => {
      recoGenEdGaps = () => [{ id: 'DSHU', label: 'Humanities', have: 0, need: 1 }];
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
        text,
        hasCopyButton: /data-planner-copy-questions/.test(html),
        hasScheduleButton: /data-planner-schedule/.test(html),
        hasGenEdButton: /data-planner-gened/.test(html),
      };
    })()
  `, context));

  assert(result.titles.some(title => /credit|load|full-time/i.test(title)), 'planner questions: should include credit-load advisor question');
  assert(result.titles.some(title => /CMSC 216 prerequisite/i.test(title)), 'planner questions: should include prerequisite advisor question');
  assert(/switch any Pass 41 Fall sections|timing|schedule/i.test(result.questions), 'planner questions: should include picked-section timing question');
  assert(/DSHU|Humanities|GenEd/i.test(result.questions + result.whys), 'planner questions: should include GenEd advisor question');
  assert(result.levels.includes('danger') || result.levels.includes('warn'), 'planner questions: should preserve risk levels');
  assert(/Advisor questions/.test(result.text) && /CMSC 216/.test(result.text), 'planner questions: export text should include question details');
  assert(result.hasCopyButton, 'planner questions: should render select questions action');
  assert(result.hasScheduleButton, 'planner questions: should render an open Schedule action');
  assert(result.hasGenEdButton, 'planner questions: should render a GenEd search action');

  return {
    id: 'PLANNER-QUESTIONS',
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
      return {
        defaultDept,
        scope: defaultScope.depts.slice(0, 4),
        genEdCodes: genEdRows.map(row => row.course_id).sort(),
        deptCodes: deptRows.map(row => row.course_id).sort(),
        callCount: calls.length,
        calls,
        savedCount: saved.length,
        savedLabel: saved[0]?.label || '',
        restored,
        afterDelete: state.browseSavedSearches.length,
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
  assert(result.savedCount === 1, 'browse saved search: should save one preset');
  assert(/Profile departments/.test(result.savedLabel) && /DSHS/.test(result.savedLabel), 'browse saved search: label should summarize filters');
  assert(result.restored.dept === '__PROFILE_DEPTS__' && result.restored.genEd === 'DSHS' && result.restored.search === 'policy', 'browse saved search: apply should restore filters');
  assert(result.afterDelete === 0, 'browse saved search: delete should remove preset');

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
  const diagnostics = await testAutoPlanDiagnostics(context);
  const account = testAccountAndShareState(context);
  const accountSetup = testAccountCloudSetup(context);
  const timing = testScheduleTimingFit(context);
  const planner = testPlannerRegistrationChecklist(context);
  const questions = testPlannerAdvisorQuestions(context);
  const browse = await testBrowseProfileDepartments(context);
  const browseSections = await testBrowseResultSections(context);
  const browseWhy = await testBrowseExplanationPanel(context);
  const browseImpact = await testBrowseImpactPreview(context);
  const browseReplacement = await testBrowsePlaceholderReplacement(context);
  const browseSlot = await testBrowseSlotSelection(context);
  const onboarding = await testOnboardingPersonalizedSetup(context);

  console.table(rows);
  console.log(`Prerequisite fixture ${prereq.id}: terms ${prereq.terms}; loads ${prereq.loads}`);
  console.log(`Auto-plan diagnostics fixture ${diagnostics.id}: template missing ${diagnostics.templateMissing}; mixed ${diagnostics.mixedCoverage}.`);
  console.log(`Account/share fixture ${account.id}: ${account.normalizedInvite}; ${account.importedCourse}; ${account.outputPreset}.`);
  console.log(`Account setup fixture ${accountSetup.id}: missing ${accountSetup.missing}; Vercel ${accountSetup.vercel}.`);
  console.log(`Schedule timing fixture ${timing.id}: compact ${timing.compactScore}, idle ${timing.idleScore}, tight transitions ${timing.tightTransitions}, comparison +${timing.comparisonTimingDelta}.`);
  console.log(`Planner checklist fixture ${planner.id}: ${planner.count} items; levels ${planner.levels}.`);
  console.log(`Planner questions fixture ${questions.id}: ${questions.count} questions; levels ${questions.levels}.`);
  console.log(`Browse profile fixture ${browse.id}: ${browse.scope}; ${browse.genEdCount} GenEd rows; ${browse.deptCount} dept rows; saved ${browse.saved}.`);
  console.log(`Browse sections fixture ${browseSections.id}: first ${browseSections.first}; availability ${browseSections.availability}; ${browseSections.sections}.`);
  console.log(`Browse explanation fixture ${browseWhy.id}: score ${browseWhy.score}; reasons ${browseWhy.reasons}.`);
  console.log(`Browse impact fixture ${browseImpact.id}: ${browseImpact.mode}; load ${browseImpact.load}.`);
  console.log(`Browse replacement fixture ${browseReplacement.id}: ${browseReplacement.search}; replaced ${browseReplacement.replaced}.`);
  console.log(`Browse slot fixture ${browseSlot.id}: first ${browseSlot.firstSlot}; replaced ${browseSlot.replaced}.`);
  console.log(`Onboarding fixture ${onboarding.id}: terms ${onboarding.terms}; start ${onboarding.start}; prefs ${onboarding.prefs}.`);
  console.log(`Generated-plan regression fixtures passed (${rows.length} majors + prerequisite chain + auto-plan diagnostics + account/share state + account setup + schedule timing + planner checklist + planner questions + browse profile saved searches + browse sections + browse explanations + browse impact preview + browse replacement + browse slot selection + personalized onboarding).`);
}

main().catch(error => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
