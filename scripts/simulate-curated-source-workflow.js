#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const {
  compareArtifacts,
  readArtifact,
  summarizeDiff,
  summarizeDiffMarkdown,
} = require('./compare-curated-catalog-artifacts.js');

const ROOT = path.resolve(__dirname, '..');
const NODE = process.execPath;
const WORKFLOW_PATH = path.join(ROOT, '.github/workflows/curated-source-evidence.yml');
const BASELINE_PATH = path.join(ROOT, 'artifacts/curated-catalog-sweep/latest.json');

function fail(message) {
  throw new Error(message);
}

function parseArgs(argv) {
  const opts = {
    mode: 'all',
    execute: false,
    json: false,
    seed: 'local-curated-source-workflow',
    artifactDate: new Date().toISOString(),
    sampleLimit: 80,
    artifactDir: '',
  };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--execute') opts.execute = true;
    else if (arg === '--dry-run') opts.execute = false;
    else if (arg === '--json') opts.json = true;
    else if (arg === '--mode') opts.mode = String(argv[++i] || '');
    else if (arg.startsWith('--mode=')) opts.mode = arg.slice('--mode='.length);
    else if (arg === '--seed') opts.seed = String(argv[++i] || '');
    else if (arg.startsWith('--seed=')) opts.seed = arg.slice('--seed='.length);
    else if (arg === '--artifact-date') opts.artifactDate = String(argv[++i] || '');
    else if (arg.startsWith('--artifact-date=')) opts.artifactDate = arg.slice('--artifact-date='.length);
    else if (arg === '--sample-limit') opts.sampleLimit = Number(argv[++i]);
    else if (arg.startsWith('--sample-limit=')) opts.sampleLimit = Number(arg.slice('--sample-limit='.length));
    else if (arg === '--artifact-dir') opts.artifactDir = String(argv[++i] || '');
    else if (arg.startsWith('--artifact-dir=')) opts.artifactDir = arg.slice('--artifact-dir='.length);
    else if (arg === '--help' || arg === '-h') opts.help = true;
    else fail(`Unknown argument: ${arg}`);
  }
  if (!['sample', 'full', 'all'].includes(opts.mode)) fail('--mode must be sample, full, or all.');
  if (!opts.seed.trim()) fail('--seed cannot be empty.');
  if (!opts.artifactDate.trim()) fail('--artifact-date cannot be empty.');
  if (!Number.isInteger(opts.sampleLimit) || opts.sampleLimit < 1) fail('--sample-limit must be a positive integer.');
  return opts;
}

function usage() {
  return [
    'Usage: node scripts/simulate-curated-source-workflow.js [options]',
    '',
    'Options:',
    '  --mode=sample|full|all   Workflow mode to simulate (default: all)',
    '  --dry-run                Validate and print commands without network calls (default)',
    '  --execute                Run strict live checks into a temporary artifact directory',
    '  --seed=VALUE             Stable live-sweep seed prefix',
    '  --artifact-date=VALUE    generatedAt label for simulated artifacts',
    '  --sample-limit=N         Sample-mode course count (default: 80)',
    '  --artifact-dir=PATH      Keep outputs in this directory instead of a new temp directory',
    '  --json                   Emit a machine-readable simulation report',
  ].join('\n');
}

function validateWorkflow(source) {
  const requirements = [
    ['daily schedule', "cron: '17 10 * * *'"],
    ['sample mode', "env.MODE == 'sample'"],
    ['full mode', "env.MODE == 'full'"],
    ['strict title checks', '--live-curated-catalog-strict-titles'],
    ['strict credit-source checks', '--live-curated-catalog-strict-credit-source'],
    ['machine-readable diff', 'artifacts/curated-catalog-sweep/diff.json'],
    ['Markdown summary', 'artifacts/curated-catalog-sweep/summary.md'],
    ['step summary', 'GITHUB_STEP_SUMMARY'],
    ['drift output', 'steps.drift.outputs.changed'],
    ['failure-resilient comparison', "if: always() && env.MODE == 'full'"],
    ['issue permission', 'issues: write'],
    ['drift issue action', 'actions/github-script@v9'],
    ['uploaded evidence', 'actions/upload-artifact@v4'],
  ];
  const missing = requirements.filter(([, token]) => !source.includes(token)).map(([label]) => label);
  if (missing.length) fail(`Curated source workflow is missing: ${missing.join(', ')}.`);
  return requirements.map(([label]) => label);
}

function modeArgs(mode, opts, outputDir) {
  const common = [
    'scripts/run-release-checks.js',
    '--live-curated-catalog-sweep',
    '--live-curated-catalog-strict-titles',
    '--live-curated-catalog-strict-credit-source',
  ];
  if (mode === 'sample') {
    return [
      ...common,
      '--skip-syntax',
      '--skip-proxy',
      '--skip-generated',
      '--skip-curated',
      '--skip-rendered',
      '--skip-workflows',
      `--live-curated-catalog-limit=${opts.sampleLimit}`,
      `--live-curated-catalog-artifact=${path.join(outputDir, 'sample.json')}`,
      `--live-curated-catalog-artifact-date=${opts.artifactDate}`,
      `--live-seed=${opts.seed}-sample`,
    ];
  }
  return [
    ...common,
    '--skip-rendered',
    '--skip-workflows',
    `--live-curated-catalog-artifact=${path.join(outputDir, 'latest.json')}`,
    `--live-curated-catalog-artifact-date=${opts.artifactDate}`,
    `--live-seed=${opts.seed}-full`,
  ];
}

function commandText(args) {
  return [NODE, ...args].map(value => /\s/.test(value) ? JSON.stringify(value) : value).join(' ');
}

function simulateComparator(baseData) {
  const metadataOnly = JSON.parse(JSON.stringify(baseData));
  metadataOnly.generatedAt = 'workflow-simulation-new-date';
  if (metadataOnly.options) metadataOnly.options.seed = 'workflow-simulation-new-seed';
  if (metadataOnly.summary) metadataOnly.summary.seed = 'workflow-simulation-new-seed';
  const metadataDiff = compareArtifacts(baseData, metadataOnly);
  if (metadataDiff.changed) fail('Artifact seed/date metadata was incorrectly classified as source drift.');

  const drifted = JSON.parse(JSON.stringify(metadataOnly));
  const sourceCourse = drifted.courses.find(course => course?.official?.title) || drifted.courses[0];
  if (!sourceCourse) fail('Baseline artifact has no course rows for drift simulation.');
  sourceCourse.official = { ...(sourceCourse.official || {}), title: `${sourceCourse.official?.title || sourceCourse.code} [drift simulation]` };
  const sourceDiff = compareArtifacts(baseData, drifted);
  if (!sourceDiff.changed || sourceDiff.counts.officialChanges < 1) {
    fail('Synthetic official catalog drift was not detected.');
  }
  return {
    metadataIgnored: !metadataDiff.changed,
    sourceDriftDetected: sourceDiff.changed,
    sourceDriftCounts: sourceDiff.counts,
    markdownPreview: summarizeDiffMarkdown(sourceDiff, 5),
  };
}

function runCommand(args, opts) {
  const result = spawnSync(NODE, args, {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: opts.json ? ['ignore', 'pipe', 'pipe'] : 'inherit',
  });
  if (result.status !== 0) {
    const detail = opts.json ? `${result.stdout || ''}\n${result.stderr || ''}`.trim() : '';
    fail(`Workflow command failed with exit ${result.status}.${detail ? `\n${detail}` : ''}`);
  }
}

function runMode(mode, opts, outputDir) {
  const args = modeArgs(mode, opts, outputDir);
  const result = { mode, command: commandText(args), executed: opts.execute };
  if (!opts.execute) return result;
  runCommand(args, opts);
  if (mode === 'sample') {
    const sample = readArtifact(path.join(outputDir, 'sample.json')).data;
    result.artifact = path.join(outputDir, 'sample.json');
    result.checkedCourses = sample.summary?.checkedCourses || sample.courses.length;
    return result;
  }
  const baseline = readArtifact(path.join(outputDir, 'baseline.json'));
  const latest = readArtifact(path.join(outputDir, 'latest.json'));
  const diff = compareArtifacts(baseline, latest);
  fs.writeFileSync(path.join(outputDir, 'diff.json'), `${JSON.stringify(diff, null, 2)}\n`);
  fs.writeFileSync(path.join(outputDir, 'summary.md'), `${summarizeDiffMarkdown(diff)}\n`);
  result.artifact = path.join(outputDir, 'latest.json');
  result.diff = path.join(outputDir, 'diff.json');
  result.summary = path.join(outputDir, 'summary.md');
  result.changed = diff.changed;
  result.humanSummary = summarizeDiff(diff, 10);
  return result;
}

function main() {
  const opts = parseArgs(process.argv);
  if (opts.help) {
    console.log(usage());
    return;
  }
  const source = fs.readFileSync(WORKFLOW_PATH, 'utf8');
  const workflowChecks = validateWorkflow(source);
  const baseline = readArtifact(BASELINE_PATH).data;
  const comparator = simulateComparator(baseline);
  const outputDir = opts.artifactDir
    ? path.resolve(ROOT, opts.artifactDir)
    : fs.mkdtempSync(path.join(os.tmpdir(), 'terptrack-curated-source-'));
  fs.mkdirSync(outputDir, { recursive: true });
  fs.copyFileSync(BASELINE_PATH, path.join(outputDir, 'baseline.json'));
  const modes = opts.mode === 'all' ? ['sample', 'full'] : [opts.mode];
  const report = {
    schema: 'terptrack-curated-source-workflow-simulation/v1',
    status: 'passed',
    execute: opts.execute,
    outputDir,
    workflowChecks,
    comparator,
    modes: modes.map(mode => runMode(mode, opts, outputDir)),
  };
  if (opts.json) console.log(JSON.stringify(report, null, 2));
  else {
    console.log(`Curated source workflow simulation passed (${opts.execute ? 'live execution' : 'dry run'}).`);
    report.modes.forEach(mode => console.log(`${mode.mode}: ${mode.command}`));
    console.log(`Artifacts: ${outputDir}`);
  }
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
    modeArgs,
    parseArgs,
    simulateComparator,
    validateWorkflow,
  };
}
