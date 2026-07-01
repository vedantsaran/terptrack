#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const NODE = process.execPath;
const DEFAULT_LIVE_MAJORS = ['PHYS', 'ARTT', 'PLSC', 'KNES', 'ENAE', 'ENCE'];

function fail(message) {
  throw new Error(message);
}

function parseArgs(argv) {
  const opts = {
    syntax: true,
    proxy: true,
    generated: true,
    rendered: true,
    workflows: true,
    renderedTimeoutMs: Number(process.env.TERPTRACK_RENDER_TIMEOUT_MS || 120000),
    workflowsTimeoutMs: Number(process.env.TERPTRACK_WORKFLOW_TIMEOUT_MS || process.env.TERPTRACK_RENDER_TIMEOUT_MS || 120000),
    renderedMajors: [],
    renderedViewports: [],
    live: false,
    liveAll: false,
    liveMajors: DEFAULT_LIVE_MAJORS.slice(),
    liveCount: null,
    liveSeed: process.env.TERPTRACK_RELEASE_LIVE_SEED || 'release-check-live',
  };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') {
      opts.help = true;
    } else if (arg === '--skip-syntax') {
      opts.syntax = false;
    } else if (arg === '--skip-proxy') {
      opts.proxy = false;
    } else if (arg === '--skip-generated') {
      opts.generated = false;
    } else if (arg === '--skip-rendered') {
      opts.rendered = false;
    } else if (arg === '--skip-workflows') {
      opts.workflows = false;
    } else if (arg === '--rendered-timeout-ms') {
      opts.renderedTimeoutMs = Number(argv[++i] || opts.renderedTimeoutMs);
    } else if (arg.startsWith('--rendered-timeout-ms=')) {
      opts.renderedTimeoutMs = Number(arg.slice('--rendered-timeout-ms='.length) || opts.renderedTimeoutMs);
    } else if (arg === '--workflows-timeout-ms') {
      opts.workflowsTimeoutMs = Number(argv[++i] || opts.workflowsTimeoutMs);
    } else if (arg.startsWith('--workflows-timeout-ms=')) {
      opts.workflowsTimeoutMs = Number(arg.slice('--workflows-timeout-ms='.length) || opts.workflowsTimeoutMs);
    } else if (arg === '--rendered-majors') {
      opts.renderedMajors.push(...String(argv[++i] || '').split(','));
    } else if (arg.startsWith('--rendered-majors=')) {
      opts.renderedMajors.push(...arg.slice('--rendered-majors='.length).split(','));
    } else if (arg === '--rendered-viewports') {
      opts.renderedViewports.push(...String(argv[++i] || '').split(','));
    } else if (arg.startsWith('--rendered-viewports=')) {
      opts.renderedViewports.push(...arg.slice('--rendered-viewports='.length).split(','));
    } else if (arg === '--live') {
      opts.live = true;
    } else if (arg === '--live-all') {
      opts.live = true;
      opts.liveAll = true;
    } else if (arg === '--live-majors') {
      opts.live = true;
      opts.liveMajors = String(argv[++i] || '').split(',');
    } else if (arg.startsWith('--live-majors=')) {
      opts.live = true;
      opts.liveMajors = arg.slice('--live-majors='.length).split(',');
    } else if (arg === '--live-seed') {
      opts.liveSeed = argv[++i] || opts.liveSeed;
    } else if (arg.startsWith('--live-seed=')) {
      opts.liveSeed = arg.slice('--live-seed='.length) || opts.liveSeed;
    } else if (arg === '--live-count') {
      opts.live = true;
      opts.liveCount = Number(argv[++i] || 0);
      opts.liveMajors = [];
    } else if (arg.startsWith('--live-count=')) {
      opts.live = true;
      opts.liveCount = Number(arg.slice('--live-count='.length) || 0);
      opts.liveMajors = [];
    } else {
      fail(`Unknown argument: ${arg}`);
    }
  }
  opts.renderedMajors = uniqueClean(opts.renderedMajors, item => item.toUpperCase());
  opts.renderedViewports = uniqueClean(opts.renderedViewports, item => item.toLowerCase());
  opts.liveMajors = uniqueClean(opts.liveMajors, item => item.toUpperCase());
  opts.renderedTimeoutMs = Number.isFinite(opts.renderedTimeoutMs) && opts.renderedTimeoutMs > 0 ? Math.floor(opts.renderedTimeoutMs) : 120000;
  opts.workflowsTimeoutMs = Number.isFinite(opts.workflowsTimeoutMs) && opts.workflowsTimeoutMs > 0 ? Math.floor(opts.workflowsTimeoutMs) : 120000;
  opts.liveCount = Number.isFinite(opts.liveCount) && opts.liveCount > 0 ? Math.floor(opts.liveCount) : null;
  return opts;
}

function uniqueClean(values, mapFn = item => item) {
  return Array.from(new Set(values
    .map(item => String(item || '').trim())
    .filter(Boolean)
    .map(mapFn)));
}

function usage() {
  return [
    'Usage: node scripts/run-release-checks.js [options]',
    '',
    'Default checks:',
    '  syntax, offline /api/umd proxy fixture, generated-plan fixtures, rendered browser verifiers',
    '',
    'Options:',
    '  --live                         Also run focused live PlanetTerp verification',
    '  --live-all                     Run live verification for every generated major',
    '  --live-majors A,B,C            Live-verify selected generated majors',
    '  --live-count N                 Live-verify N random generated majors',
    '  --live-seed SEED               Seed for live verification',
    '  --rendered-majors A,B,C        Rendered verifier major subset',
    '  --rendered-viewports A,B       Rendered verifier viewport subset',
    '  --rendered-timeout-ms N        Rendered verifier timeout',
    '  --workflows-timeout-ms N       Rendered workflow verifier timeout',
    '  --skip-syntax                  Skip JS syntax checks',
    '  --skip-proxy                   Skip offline proxy fixture',
    '  --skip-generated               Skip generated-plan fixtures',
    '  --skip-rendered                Skip rendered browser verifier',
    '  --skip-workflows               Skip rendered onboarding/Browse workflow verifier',
  ].join('\n');
}

function collectJsFiles() {
  const roots = ['js', 'scripts', 'api'];
  const out = [];
  const visit = dir => {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) visit(full);
      else if (entry.isFile() && entry.name.endsWith('.js')) out.push(path.relative(ROOT, full));
    });
  };
  roots.forEach(root => visit(path.join(ROOT, root)));
  return out.sort();
}

function runCommand(label, args) {
  return new Promise((resolve, reject) => {
    console.log(`\n[release] ${label}`);
    console.log(`$ ${path.basename(NODE)} ${args.map(arg => /\s/.test(arg) ? JSON.stringify(arg) : arg).join(' ')}`);
    const child = spawn(NODE, args, { cwd: ROOT, stdio: 'inherit' });
    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`${label} failed with exit code ${code}`));
    });
  });
}

async function runSyntaxChecks() {
  const files = collectJsFiles();
  console.log(`\n[release] JS syntax checks (${files.length} files)`);
  for (const file of files) {
    await runCommand(`node --check ${file}`, ['--check', file]);
  }
}

async function runReleaseChecks(opts) {
  if (opts.syntax) await runSyntaxChecks();
  if (opts.proxy) await runCommand('offline umd.io proxy fixture', ['scripts/test-umd-proxy.js']);
  if (opts.generated) await runCommand('generated-plan fixtures', ['scripts/test-generated-plans.js']);
  if (opts.rendered) {
    const args = ['scripts/verify-rendered-generated-plans.js', `--timeout-ms=${opts.renderedTimeoutMs}`];
    if (opts.renderedMajors.length) args.push(`--majors=${opts.renderedMajors.join(',')}`);
    if (opts.renderedViewports.length) args.push(`--viewports=${opts.renderedViewports.join(',')}`);
    await runCommand('rendered generated-plan verifier', args);
  }
  if (opts.workflows) {
    await runCommand('rendered onboarding and Browse workflow verifier', ['scripts/verify-rendered-workflows.js', `--timeout-ms=${opts.workflowsTimeoutMs}`]);
  }
  if (opts.live) {
    const args = ['scripts/verify-random-schedules.js', '--keep-going', `--seed=${opts.liveSeed}`];
    if (opts.liveAll) args.push('--all');
    else if (opts.liveMajors.length) args.push(`--majors=${opts.liveMajors.join(',')}`);
    else if (opts.liveCount) args.push(`--count=${opts.liveCount}`);
    await runCommand('live PlanetTerp generated schedule verifier', args);
  } else {
    console.log('\n[release] Live PlanetTerp verifier skipped. Pass --live, --live-majors, --live-count, or --live-all to include it.');
  }
  console.log('\nTerpTrack release checks passed.');
}

async function main() {
  const opts = parseArgs(process.argv);
  if (opts.help) {
    console.log(usage());
    return;
  }
  await runReleaseChecks(opts);
}

main().catch(error => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
