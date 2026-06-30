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
    'js/audit.js',
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
      state.courses = {};
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
  assert(result.undoChange?.type === 'placeholder-undo', 'placeholder section preview: undo should record a restore change');
  assert(result.originalChangeAfterUndo?.undo?.appliedAt, 'placeholder section preview: original undo action should be marked applied');

  return {
    id: 'PLACEHOLDER-SECTIONS',
    first: result.firstNumber,
    pinned: result.selected?.number || '',
    undo: result.restored?.code || '',
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

      const issues = auditDegreeIssues();
      const dshuSlot = issues.find(issue => issue.courseCode === 'GenEd DSHU');
      const gvptSlot = issues.find(issue => issue.courseCode === 'GVPT 3xx Elective A');
      const freeSlot = issues.find(issue => issue.courseCode === 'Free Elective #1');
      const genedGap = issues.find(issue => issue.key === 'gened-DSHU');
      auditIssueKey = dshuSlot.key;
      const html = auditIssuesHtml();
      const advisorIssues = scheduleAdvisorAuditIssues(20);
      const advisorDshuSlot = advisorIssues.find(issue => issue.courseCode === 'GenEd DSHU');
      const advisorDshuGap = advisorIssues.find(issue => issue.key === 'gened-DSHU');
      state.scheduleOutputOptions = { preferences: true, warnings: true, unscheduled: true, recentChanges: true, auditIssues: true };
      state.scheduleAdvisorFilter = 'blockers';
      const advisorOutput = buildScheduleOutput('PASS54', '202608', state.activeSchedule[0].courses, [], [], [], { ...DEFAULT_SCHEDULE_PREFS });
      state.scheduleOutputOptions = { preferences: true, warnings: true, unscheduled: true, recentChanges: true, auditIssues: false };
      const advisorOutputNoAudit = buildScheduleOutput('PASS54', '202608', state.activeSchedule[0].courses, [], [], [], { ...DEFAULT_SCHEDULE_PREFS });
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
      return {
        count: issues.length,
        titles: issues.map(issue => issue.title),
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
  assert(result.advisorOptions.auditIssues === true, 'advisor audit export: audit issues should default into schedule output options');
  assert(/Replace GenEd DSHU in Pass 54 Fall/.test(result.advisorDshuSlot?.actionSummary || ''), 'advisor audit export: placeholder issue should include replacement quick-link action text');
  assert(/Profile departments/.test(result.advisorDshuGap?.browseTarget || '') && /DSHU/.test(result.advisorDshuGap?.browseTarget || ''), 'advisor audit export: GenEd issue should include Browse target quick-link context');
  assert(/Degree Audit Snapshot/.test(result.advisorHtml), 'advisor audit export: advisor HTML should include audit snapshot section');
  assert(/Audit issues/.test(result.advisorHtml) && /16 open items/.test(result.advisorHtml) && /showing top 6/.test(result.advisorHtml), 'advisor audit export: advisor HTML should include full audit issue counts and compact top list');
  assert(/GenEd DSHU|GVPT 3xx Elective A|Free Elective/.test(result.advisorHtml), 'advisor audit export: advisor HTML should include top audit issue titles');
  assert(/Next action|Browse target|data-schedule-audit-primary|data-schedule-audit-browse/.test(result.advisorHtml), 'advisor audit export: advisor HTML should include quick-link actions and targets');
  assert(/href="[^"]*#advisor-action=primary&amp;issue=/.test(result.advisorHtml) && /href="[^"]*#advisor-action=browse&amp;issue=/.test(result.advisorHtml), 'advisor audit export: advisor HTML should include live-app deep links');
  assert(/Live TerpTrack links/.test(result.advisorHtml) && /same browser profile\/local plan state/.test(result.advisorHtml), 'advisor audit export: advisor HTML should explain live-link browser-state requirements');
  assert(/open\/import the matching plan/.test(result.advisorHtml) && /Next action and Browse target/.test(result.advisorHtml), 'advisor audit export: live-link notice should explain fallback review steps');
  assert(/Degree audit snapshot/.test(result.advisorText) && /Satisfies:/.test(result.advisorText), 'advisor audit export: advisor text should include audit snapshot details');
  assert(/Next action:|Browse target:/.test(result.advisorText), 'advisor audit export: advisor text should include quick-link action details');
  assert(/Live TerpTrack links/.test(result.advisorText) && /same browser profile\/local plan state/.test(result.advisorText), 'advisor audit export: advisor text should include live-link browser-state guidance');
  assert(/schedule-advisor-audit-link/.test(result.advisorDocument), 'advisor audit export: standalone advisor document should include audit quick-link CSS/markup');
  assert(/#advisor-action=primary&amp;issue=/.test(result.advisorDocument) && /#advisor-action=browse&amp;issue=/.test(result.advisorDocument), 'advisor audit export: standalone advisor document should include live-app deep links');
  assert(/schedule-advisor-live-note/.test(result.advisorDocument) && /same browser profile\/local plan state/.test(result.advisorDocument), 'advisor audit export: standalone advisor document should include live-link guidance CSS/markup');
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
          code: 'MATH 140',
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
        }]
      }];
      state.customCourses = [];
      state.courses = {};
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
      const reviewHtml = onboardPriorReviewChecklistHtml(resolved, { startYear: 2026 });
      const futureReviewHtml = onboardPriorReviewChecklistHtml(resolved, { startYear: 2028 });
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
        resolvedCodes: resolved.courses.map(course => course.code),
        resolvedCredits: resolved.totalCredits,
        summary: onboardPriorSummaryText(resolved),
        applied,
        customCodes,
        byCode,
        mathState: state.courses['MATH 140'],
        englishCreditState: state.courses['AP FSAW Credit'],
        cmscState: state.courses['CMSC 131'],
        econState: state.courses['ECON 200'],
        recentChange: state.recentChanges[0],
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
  assert(/Plan placement/.test(result.reviewHtml) && /outside-plan/.test(result.reviewHtml), 'onboarding prior credit: review checklist should distinguish plan matches from outside-plan credits');
  assert(/Duplicate-credit review/.test(result.reviewHtml), 'onboarding prior credit: review checklist should include duplicate-credit review');
  assert(/Fall 2028/.test(result.futureReviewHtml) && /current Registrar chart/.test(result.futureReviewHtml), 'onboarding prior credit: review checklist should warn when start year is outside checked chart window');
  assert(result.resolvedCodes.filter(code => code === 'MATH 140').length === 1, 'onboarding prior credit: should dedupe preset and raw MATH 140');
  assert(result.resolvedCodes.includes('MATH 141'), 'onboarding prior credit: AP Calc BC should include MATH 141');
  assert(result.resolvedCodes.includes('AP FSAW Credit'), 'onboarding prior credit: AP English should map to FSAW prior credit');
  assert(result.resolvedCodes.includes('ECON 200') && result.resolvedCodes.includes('ECON 201'), 'onboarding prior credit: IB economics should map both ECON courses');
  assert(result.resolvedCodes.includes('CMSC 131'), 'onboarding prior credit: raw codes should normalize display codes');
  assert(/course/.test(result.summary) && /credit/.test(result.summary), 'onboarding prior credit: summary should include course and credit counts');
  assert(result.mathState.status === 'transfer', 'onboarding prior credit: existing planned MATH 140 should be marked transfer');
  assert(!result.customCodes.includes('MATH 140'), 'onboarding prior credit: planned MATH 140 should not be duplicated as custom');
  assert(result.customCodes.includes('MATH 141'), 'onboarding prior credit: unplanned MATH 141 should be added outside the plan');
  assert(result.byCode['AP FSAW Credit'].category === 'gened-fsaw', 'onboarding prior credit: AP FSAW pseudo-course should satisfy FSAW category');
  assert(result.englishCreditState.status === 'transfer', 'onboarding prior credit: AP FSAW pseudo-course should be marked transfer');
  assert(result.byCode['CMSC 131'].title === 'Object-Oriented Programming I', 'onboarding prior credit: raw code should use fetched metadata when available');
  assert(result.cmscState.status === 'transfer' && result.econState.status === 'transfer', 'onboarding prior credit: added raw and preset courses should be marked transfer');
  assert(result.applied.applied.length === result.resolvedCodes.length, 'onboarding prior credit: applied count should match resolved deduped courses');
  assert(/prior-credit/.test(result.recentChange.type), 'onboarding prior credit: should record a recent change entry');
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
      state.courses = {};
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
  console.log(`Placeholder sections fixture ${placeholderSections.id}: first ${placeholderSections.first}; pinned ${placeholderSections.pinned}; undo ${placeholderSections.undo}; load ${placeholderSections.load}.`);
  console.log(`Browse replacement fixture ${browseReplacement.id}: ${browseReplacement.search}; replaced ${browseReplacement.replaced}.`);
  console.log(`Browse slot fixture ${browseSlot.id}: first ${browseSlot.firstSlot}; replaced ${browseSlot.replaced}.`);
  console.log(`Browse typed slots fixture ${browseTypedSlots.id}: ${browseTypedSlots.gvpt}; ${browseTypedSlots.language}; ${browseTypedSlots.support}.`);
  console.log(`Audit issue fixture ${auditIssues.id}: ${auditIssues.count} issues; opened ${auditIssues.opened}; browse ${auditIssues.browse}.`);
  console.log(`Onboarding prior credit fixture ${priorCredit.id}: ${priorCredit.count}; ${priorCredit.samples}.`);
  console.log(`Settings prior credit fixture ${settingsPrior.id}: ${settingsPrior.transfers} transfers; ${settingsPrior.added} outside-plan courses; undo leaves ${settingsPrior.undo}.`);
  console.log(`Onboarding fixture ${onboarding.id}: terms ${onboarding.terms}; start ${onboarding.start}; prefs ${onboarding.prefs}.`);
  console.log(`Generated-plan regression fixtures passed (${rows.length} majors + prerequisite chain + auto-plan diagnostics + account/share state + account setup + schedule timing + planner checklist + planner questions + browse profile saved searches + browse sections + browse explanations + browse impact preview + placeholder section preview + browse replacement + browse slot selection + browse typed slot matching + audit issues + onboarding prior credit + settings prior credit + personalized onboarding).`);
}

main().catch(error => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
