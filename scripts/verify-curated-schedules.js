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
  return context;
}

function main() {
  const context = buildContext();
  const rows = vm.runInContext(`(() => {
    const realCode = code => /^[A-Z]{2,5}\\s?\\d{3}[A-Z]?$/i.test(String(code || '').trim());
    const upperCode = code => /^[A-Z]{2,5}\\s?4\\d{2}[A-Z]?$/i.test(String(code || '').trim());
    const hasMajorUpperCategory = course => course.category === 'major-upper'
      || (Array.isArray(course.categories) && course.categories.includes('major-upper'));
    const genericUpperPlaceholder = course => {
      if (!hasMajorUpperCategory(course)) return false;
      const text = [course.code, course.title].map(value => String(value || '').toUpperCase()).join(' ');
      if (/^AREA EMPHASIS ELECTIVE\\b/.test(text)) return false;
      return /\\b[A-Z]{2,5}\\s?4XX\\b/.test(text)
        || /\\bUPPER-DIVISION\\s+[A-Z]{2,5}\\s+(ELECTIVE|LAB)\\b/.test(text)
        || /\\b[A-Z]{2,5}\\s+SPECIALIZATION ELECTIVE\\b/.test(text)
        || /\\bSENIOR CAPSTONE ELECTIVE\\b/.test(text);
    };
    const clone = value => JSON.parse(JSON.stringify(value));
    const scheduleFor = major => major.useDefaultSchedule ? SCHEDULE : major.fixedSchedule;
    return Object.values(MAJOR_TEMPLATES).filter(isMajorFullyBaked).map(major => {
      state.activeSchedule = clone(scheduleFor(major));
      state.customSemesters = [];
      state.customCourses = [];
      state.courses = {};
      const semesters = getAllSemesters();
      const courses = flatCourses();
      const credits = courses.reduce((sum, course) => sum + Number(course.cr || 0), 0);
      const loads = semesters.map(semester => ({
        id: semester.id,
        credits: (semester.courses || []).reduce((sum, course) => sum + Number(course.cr || 0), 0),
      }));
      const coverage = computeGenEdCoverage();
      const missing = GENED_DEFS
        .filter(def => (coverage.planned[def.id] || []).length < def.need)
        .map(def => def.id);
      return {
        id: major.id,
        name: major.name,
        termCount: semesters.length,
        targetCredits: major.totalCredits,
        credits,
        maxLoad: Math.max(...loads.map(load => load.credits)),
        heavyLoads: loads.filter(load => load.credits > 18),
        missingGenEds: missing,
        realCourseCount: courses.filter(course => realCode(course.code)).length,
        upper400Count: courses.filter(course => upperCode(course.code)).length,
        genericUpperPlaceholders: courses
          .filter(genericUpperPlaceholder)
          .map(course => String(course.code || '') + ' (' + String(course.title || '') + ')'),
        hasCatalogSource: Boolean(MAJOR_CATALOG_SOURCES[major.id]),
      };
    });
  })()`, context);

  const failures = [];
  rows.forEach(row => {
    if (row.termCount !== 8) failures.push(`${row.id}: expected 8 terms, saw ${row.termCount}`);
    if (row.credits !== row.targetCredits) failures.push(`${row.id}: credits ${row.credits}/${row.targetCredits}`);
    if (row.maxLoad > 18) failures.push(`${row.id}: max term load ${row.maxLoad}; heavy terms ${JSON.stringify(row.heavyLoads)}`);
    if (row.missingGenEds.length) failures.push(`${row.id}: missing GenEds ${row.missingGenEds.join(', ')}`);
    if (row.realCourseCount < 10) failures.push(`${row.id}: only ${row.realCourseCount} real catalog course rows`);
    if (row.upper400Count < 1) failures.push(`${row.id}: no real 400-level senior course rows`);
    if (row.genericUpperPlaceholders.length) failures.push(`${row.id}: generic upper placeholders ${row.genericUpperPlaceholders.join(', ')}`);
    if (!row.hasCatalogSource) failures.push(`${row.id}: missing catalog source metadata`);
  });

  assert(failures.length === 0, `Curated schedule verifier failed:\n${failures.join('\n')}`);
  const minReal = rows.reduce((min, row) => Math.min(min, row.realCourseCount), Infinity);
  const minUpper = rows.reduce((min, row) => Math.min(min, row.upper400Count), Infinity);
  console.log(`Curated schedule verifier passed: ${rows.length} fully baked schedules; min real courses ${minReal}; min 400-level rows ${minUpper}.`);
}

if (require.main === module) {
  main();
}
