#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ARTIFACT_SCHEMA = 'terptrack-curated-catalog-sweep/v1';
const DIFF_SCHEMA = 'terptrack-curated-catalog-artifact-diff/v1';
const DEFAULT_LIMIT = 40;

function fail(message) {
  throw new Error(message);
}

function normalizeCode(code) {
  return String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function displayCode(code) {
  const id = normalizeCode(code);
  const match = id.match(/^([A-Z]{2,5})(\d{3}[A-Z]?)$/);
  return match ? `${match[1]} ${match[2]}` : id;
}

function relativePath(file) {
  const resolved = path.isAbsolute(file) ? file : path.join(ROOT, file);
  return path.relative(ROOT, resolved) || '.';
}

function readArtifact(file) {
  const absolute = path.isAbsolute(file) ? file : path.join(ROOT, file);
  let data;
  try {
    data = JSON.parse(fs.readFileSync(absolute, 'utf8'));
  } catch (error) {
    fail(`Could not read curated catalog artifact ${file}: ${error.message || error}`);
  }
  if (data?.schema !== ARTIFACT_SCHEMA) {
    fail(`Unsupported curated catalog artifact schema for ${file}: ${data?.schema || 'missing'}`);
  }
  if (!Array.isArray(data.courses)) {
    fail(`Curated catalog artifact ${file} is missing courses[].`);
  }
  return {
    file,
    relativePath: relativePath(file),
    data,
  };
}

function compact(value) {
  if (Array.isArray(value)) return value.map(compact);
  if (value && typeof value === 'object') {
    return Object.keys(value).sort().reduce((out, key) => {
      const item = compact(value[key]);
      if (item !== undefined) out[key] = item;
      return out;
    }, {});
  }
  if (value === undefined) return null;
  return value;
}

function stableString(value) {
  return JSON.stringify(compact(value));
}

function valuesEqual(a, b) {
  return stableString(a) === stableString(b);
}

function indexCourses(artifact) {
  const out = new Map();
  artifact.data.courses.forEach(course => {
    const code = normalizeCode(course.normalizedCode || course.code);
    if (code) out.set(code, course);
  });
  return out;
}

function sourceFields(source, fields) {
  const row = {};
  fields.forEach(field => { row[field] = source?.[field] ?? null; });
  return row;
}

function rowSnapshot(course) {
  return {
    code: course?.code || '',
    normalizedCode: normalizeCode(course?.normalizedCode || course?.code),
    majors: course?.majors || [],
    rowCount: course?.rowCount || 0,
    curatedCredits: course?.curatedCredits || [],
    curatedTitles: course?.curatedTitles || [],
    official: sourceFields(course?.official, ['ok', 'matchedCode', 'mode', 'title', 'credits', 'url', 'detail']),
    planetTerp: sourceFields(course?.planetTerp, ['ok', 'code', 'title', 'credits', 'detail']),
    failures: course?.failures || [],
    warnings: course?.warnings || [],
    creditWarnings: course?.creditWarnings || [],
    titleWarnings: course?.titleWarnings || [],
    acknowledgedCreditLags: course?.acknowledgedCreditLags || [],
  };
}

function pushChange(list, code, before, after) {
  list.push({
    code: after?.code || before?.code || displayCode(code),
    normalizedCode: code,
    before,
    after,
  });
}

function summaryChanges(baseSummary = {}, headSummary = {}) {
  const keys = Array.from(new Set([
    ...Object.keys(baseSummary || {}),
    ...Object.keys(headSummary || {}),
  ])).sort();
  return keys
    .filter(key => !valuesEqual(baseSummary?.[key], headSummary?.[key]))
    .map(key => ({ field: key, before: baseSummary?.[key] ?? null, after: headSummary?.[key] ?? null }));
}

function compareArtifacts(baseArtifact, headArtifact) {
  const base = baseArtifact.data ? baseArtifact : { data: baseArtifact, relativePath: '' };
  const head = headArtifact.data ? headArtifact : { data: headArtifact, relativePath: '' };
  const baseCourses = indexCourses(base);
  const headCourses = indexCourses(head);
  const codes = Array.from(new Set([...baseCourses.keys(), ...headCourses.keys()])).sort();
  const diff = {
    schema: DIFF_SCHEMA,
    base: {
      path: base.relativePath || '',
      generatedAt: base.data.generatedAt || '',
      seed: base.data.options?.seed || base.data.summary?.seed || '',
      courses: base.data.courses.length,
    },
    head: {
      path: head.relativePath || '',
      generatedAt: head.data.generatedAt || '',
      seed: head.data.options?.seed || head.data.summary?.seed || '',
      courses: head.data.courses.length,
    },
    summaryChanges: summaryChanges(base.data.summary || {}, head.data.summary || {}),
    addedCourses: [],
    removedCourses: [],
    curatedChanges: [],
    officialChanges: [],
    planetTerpChanges: [],
    warningChanges: [],
  };
  codes.forEach(code => {
    const before = baseCourses.get(code);
    const after = headCourses.get(code);
    if (!before && after) {
      diff.addedCourses.push(rowSnapshot(after));
      return;
    }
    if (before && !after) {
      diff.removedCourses.push(rowSnapshot(before));
      return;
    }
    const beforeRow = rowSnapshot(before);
    const afterRow = rowSnapshot(after);
    const beforeCurated = {
      majors: beforeRow.majors,
      rowCount: beforeRow.rowCount,
      curatedCredits: beforeRow.curatedCredits,
      curatedTitles: beforeRow.curatedTitles,
    };
    const afterCurated = {
      majors: afterRow.majors,
      rowCount: afterRow.rowCount,
      curatedCredits: afterRow.curatedCredits,
      curatedTitles: afterRow.curatedTitles,
    };
    if (!valuesEqual(beforeCurated, afterCurated)) pushChange(diff.curatedChanges, code, beforeCurated, afterCurated);
    if (!valuesEqual(beforeRow.official, afterRow.official)) pushChange(diff.officialChanges, code, beforeRow.official, afterRow.official);
    if (!valuesEqual(beforeRow.planetTerp, afterRow.planetTerp)) pushChange(diff.planetTerpChanges, code, beforeRow.planetTerp, afterRow.planetTerp);
    const beforeWarnings = {
      failures: beforeRow.failures,
      warnings: beforeRow.warnings,
      creditWarnings: beforeRow.creditWarnings,
      titleWarnings: beforeRow.titleWarnings,
      acknowledgedCreditLags: beforeRow.acknowledgedCreditLags,
    };
    const afterWarnings = {
      failures: afterRow.failures,
      warnings: afterRow.warnings,
      creditWarnings: afterRow.creditWarnings,
      titleWarnings: afterRow.titleWarnings,
      acknowledgedCreditLags: afterRow.acknowledgedCreditLags,
    };
    if (!valuesEqual(beforeWarnings, afterWarnings)) pushChange(diff.warningChanges, code, beforeWarnings, afterWarnings);
  });
  diff.counts = {
    summaryChanges: diff.summaryChanges.length,
    addedCourses: diff.addedCourses.length,
    removedCourses: diff.removedCourses.length,
    curatedChanges: diff.curatedChanges.length,
    officialChanges: diff.officialChanges.length,
    planetTerpChanges: diff.planetTerpChanges.length,
    warningChanges: diff.warningChanges.length,
  };
  diff.changed = Object.values(diff.counts).some(count => count > 0);
  return diff;
}

function parseArgs(argv) {
  const opts = {
    json: false,
    failOnDrift: false,
    limit: DEFAULT_LIMIT,
    base: '',
    head: '',
  };
  const positional = [];
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--json') {
      opts.json = true;
    } else if (arg === '--fail-on-drift') {
      opts.failOnDrift = true;
    } else if (arg === '--limit') {
      opts.limit = Number(argv[++i] || opts.limit);
    } else if (arg.startsWith('--limit=')) {
      opts.limit = Number(arg.slice('--limit='.length) || opts.limit);
    } else if (arg === '--help' || arg === '-h') {
      opts.help = true;
    } else if (arg.startsWith('-')) {
      fail(`Unknown argument: ${arg}`);
    } else {
      positional.push(arg);
    }
  }
  opts.limit = Number.isFinite(opts.limit) && opts.limit >= 0 ? Math.floor(opts.limit) : DEFAULT_LIMIT;
  opts.base = positional[0] || '';
  opts.head = positional[1] || '';
  return opts;
}

function usage() {
  return [
    'Usage: node scripts/compare-curated-catalog-artifacts.js BASE.json HEAD.json [options]',
    '',
    'Options:',
    '  --json              Emit machine-readable diff JSON',
    '  --fail-on-drift     Exit 1 when any source drift is found',
    '  --limit N           Limit human-readable examples per change category',
  ].join('\n');
}

function sampleCodes(rows, limit) {
  if (!rows.length || limit === 0) return '';
  const sample = rows.slice(0, limit).map(row => row.code || row.normalizedCode).join(', ');
  return `${sample}${rows.length > limit ? `, +${rows.length - limit} more` : ''}`;
}

function summarizeDiff(diff, limit = DEFAULT_LIMIT) {
  const lines = [
    `Curated catalog artifact comparison: ${diff.base.path || diff.base.seed || 'base'} -> ${diff.head.path || diff.head.seed || 'head'}`,
    `Courses: ${diff.base.courses} -> ${diff.head.courses}`,
    `Changes: ${diff.counts.summaryChanges} summary, ${diff.counts.addedCourses} added, ${diff.counts.removedCourses} removed, ${diff.counts.curatedChanges} curated, ${diff.counts.officialChanges} official, ${diff.counts.planetTerpChanges} PlanetTerp, ${diff.counts.warningChanges} warning.`,
  ];
  if (!diff.changed) {
    lines.push('No curated catalog source drift detected.');
    return lines.join('\n');
  }
  [
    ['Added courses', diff.addedCourses],
    ['Removed courses', diff.removedCourses],
    ['Curated row changes', diff.curatedChanges],
    ['Official source changes', diff.officialChanges],
    ['PlanetTerp source changes', diff.planetTerpChanges],
    ['Warning changes', diff.warningChanges],
  ].forEach(([label, rows]) => {
    const sample = sampleCodes(rows, limit);
    if (sample) lines.push(`${label}: ${sample}`);
  });
  if (diff.summaryChanges.length && limit !== 0) {
    const sample = diff.summaryChanges.slice(0, limit).map(change => `${change.field}: ${JSON.stringify(change.before)} -> ${JSON.stringify(change.after)}`).join('; ');
    lines.push(`Summary changes: ${sample}${diff.summaryChanges.length > limit ? `; +${diff.summaryChanges.length - limit} more` : ''}`);
  }
  return lines.join('\n');
}

function main() {
  const opts = parseArgs(process.argv);
  if (opts.help) {
    console.log(usage());
    return;
  }
  if (!opts.base || !opts.head) fail('BASE.json and HEAD.json are required.');
  const diff = compareArtifacts(readArtifact(opts.base), readArtifact(opts.head));
  if (opts.json) console.log(JSON.stringify(diff, null, 2));
  else console.log(summarizeDiff(diff, opts.limit));
  if (opts.failOnDrift && diff.changed) process.exitCode = 1;
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.stack || error.message || String(error));
    process.exit(1);
  }
} else {
  module.exports = {
    compareArtifacts,
    DIFF_SCHEMA,
    parseArgs,
    readArtifact,
    summarizeDiff,
  };
}
