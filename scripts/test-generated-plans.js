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
    document: { getElementById: () => null },
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

  console.table(rows);
  console.log(`Prerequisite fixture ${prereq.id}: terms ${prereq.terms}; loads ${prereq.loads}`);
  console.log(`Generated-plan regression fixtures passed (${rows.length} majors + prerequisite chain).`);
}

main().catch(error => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
