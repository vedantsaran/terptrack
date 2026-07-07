#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const NODE = process.execPath;
const DEFAULT_LIVE_MAJORS = ['GEOL', 'AOSC', 'ASTR', 'BCHM', 'NEUR', 'ARCH'];

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
    renderedTimeoutMs: Number(process.env.TERPTRACK_RENDER_TIMEOUT_MS || 240000),
    workflowsTimeoutMs: Number(process.env.TERPTRACK_WORKFLOW_TIMEOUT_MS || process.env.TERPTRACK_RENDER_TIMEOUT_MS || 120000),
    renderedMajors: [],
    renderedViewports: [],
    live: false,
    liveAll: false,
    liveCatalogSweep: false,
    liveCatalogLimit: null,
    liveCatalogTestudoTerms: String(process.env.TERPTRACK_RELEASE_TESTUDO_TERMS || '').split(','),
    liveCatalogSkipTestudoTitleCheck: false,
    liveCatalogWriteSettingsSnapshot: false,
    liveCatalogNoBumpSettingsAsset: false,
    liveCatalogSnapshotDate: process.env.TERPTRACK_RELEASE_SNAPSHOT_DATE || '',
    liveCloud: false,
    liveCloudRequireAuth: false,
    liveCloudWriteSmoke: false,
    liveCloudTimeoutMs: Number(process.env.TERPTRACK_SUPABASE_TIMEOUT_MS || 15000),
    liveMajors: DEFAULT_LIVE_MAJORS.slice(),
    liveCount: null,
    liveSeed: process.env.TERPTRACK_RELEASE_LIVE_SEED || 'release-check-live',
    json: false,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') {
      opts.help = true;
    } else if (arg === '--json') {
      opts.json = true;
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
    } else if (arg === '--live-catalog-sweep') {
      opts.liveCatalogSweep = true;
    } else if (arg === '--live-catalog-limit') {
      opts.liveCatalogLimit = Number(argv[++i] || 0);
    } else if (arg.startsWith('--live-catalog-limit=')) {
      opts.liveCatalogLimit = Number(arg.slice('--live-catalog-limit='.length) || 0);
    } else if (arg === '--live-catalog-testudo-terms') {
      opts.liveCatalogSweep = true;
      opts.liveCatalogTestudoTerms.push(...String(argv[++i] || '').split(','));
    } else if (arg.startsWith('--live-catalog-testudo-terms=')) {
      opts.liveCatalogSweep = true;
      opts.liveCatalogTestudoTerms.push(...arg.slice('--live-catalog-testudo-terms='.length).split(','));
    } else if (arg === '--live-catalog-skip-testudo-title-check') {
      opts.liveCatalogSweep = true;
      opts.liveCatalogSkipTestudoTitleCheck = true;
    } else if (arg === '--live-catalog-write-settings-snapshot') {
      opts.liveCatalogSweep = true;
      opts.liveCatalogWriteSettingsSnapshot = true;
    } else if (arg === '--live-catalog-no-bump-settings-asset') {
      opts.liveCatalogSweep = true;
      opts.liveCatalogNoBumpSettingsAsset = true;
    } else if (arg === '--live-catalog-snapshot-date') {
      opts.liveCatalogSweep = true;
      opts.liveCatalogSnapshotDate = argv[++i] || opts.liveCatalogSnapshotDate;
    } else if (arg.startsWith('--live-catalog-snapshot-date=')) {
      opts.liveCatalogSweep = true;
      opts.liveCatalogSnapshotDate = arg.slice('--live-catalog-snapshot-date='.length) || opts.liveCatalogSnapshotDate;
    } else if (arg === '--live-cloud' || arg === '--live-supabase') {
      opts.liveCloud = true;
    } else if (arg === '--live-cloud-require-auth' || arg === '--live-supabase-require-auth') {
      opts.liveCloud = true;
      opts.liveCloudRequireAuth = true;
    } else if (arg === '--live-cloud-write-smoke' || arg === '--live-supabase-write-smoke') {
      opts.liveCloud = true;
      opts.liveCloudRequireAuth = true;
      opts.liveCloudWriteSmoke = true;
    } else if (arg === '--live-cloud-timeout-ms' || arg === '--live-supabase-timeout-ms') {
      opts.liveCloudTimeoutMs = Number(argv[++i] || opts.liveCloudTimeoutMs);
    } else if (arg.startsWith('--live-cloud-timeout-ms=')) {
      opts.liveCloudTimeoutMs = Number(arg.slice('--live-cloud-timeout-ms='.length) || opts.liveCloudTimeoutMs);
    } else if (arg.startsWith('--live-supabase-timeout-ms=')) {
      opts.liveCloudTimeoutMs = Number(arg.slice('--live-supabase-timeout-ms='.length) || opts.liveCloudTimeoutMs);
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
  opts.renderedTimeoutMs = Number.isFinite(opts.renderedTimeoutMs) && opts.renderedTimeoutMs > 0 ? Math.floor(opts.renderedTimeoutMs) : 240000;
  opts.workflowsTimeoutMs = Number.isFinite(opts.workflowsTimeoutMs) && opts.workflowsTimeoutMs > 0 ? Math.floor(opts.workflowsTimeoutMs) : 120000;
  opts.liveCount = Number.isFinite(opts.liveCount) && opts.liveCount > 0 ? Math.floor(opts.liveCount) : null;
  opts.liveCatalogLimit = Number.isFinite(opts.liveCatalogLimit) && opts.liveCatalogLimit > 0 ? Math.floor(opts.liveCatalogLimit) : null;
  opts.liveCatalogTestudoTerms = uniqueClean(opts.liveCatalogTestudoTerms);
  opts.liveCatalogSnapshotDate = String(opts.liveCatalogSnapshotDate || '').trim();
  opts.liveCloudTimeoutMs = Number.isFinite(opts.liveCloudTimeoutMs) && opts.liveCloudTimeoutMs > 0 ? Math.floor(opts.liveCloudTimeoutMs) : 15000;
  if (opts.liveCatalogWriteSettingsSnapshot && opts.liveCatalogLimit) {
    fail('Refusing --live-catalog-write-settings-snapshot with --live-catalog-limit. Snapshot refresh requires a full catalog sweep.');
  }
  if (opts.liveCatalogWriteSettingsSnapshot && opts.liveCatalogSkipTestudoTitleCheck) {
    fail('Refusing --live-catalog-write-settings-snapshot with --live-catalog-skip-testudo-title-check. Snapshot refresh requires full Testudo title evidence.');
  }
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
    '  --live-catalog-sweep           Live-check every unique generated required course once',
    '  --live-catalog-limit N         Limit catalog sweep to N seeded unique courses',
    '  --live-catalog-testudo-terms A,B  Testudo term codes for term-specific title checks',
    '  --live-catalog-skip-testudo-title-check  Skip Testudo title confirmation',
    '  --live-catalog-write-settings-snapshot  Refresh Settings evidence after full catalog sweep',
    '  --live-catalog-snapshot-date DATE  Date label for refreshed Settings evidence',
    '  --live-catalog-no-bump-settings-asset  Do not bump settings.js asset tag after snapshot write',
    '  --live-cloud                   Verify configured Supabase project table access and RLS',
    '  --live-cloud-require-auth      Require Supabase test-user credentials for authenticated checks',
    '  --live-cloud-write-smoke       Upsert/delete Supabase verifier rows after authenticated checks',
    '  --live-cloud-timeout-ms N      Supabase verifier per-request timeout',
    '  --live-majors A,B,C            Live-verify selected generated majors',
    '  --live-count N                 Live-verify N random generated majors',
    '  --live-seed SEED               Seed for live verification',
    '  --rendered-majors A,B,C        Rendered verifier major subset',
    '  --rendered-viewports A,B       Rendered verifier viewport subset',
    '  --rendered-timeout-ms N        Rendered verifier timeout',
    '  --workflows-timeout-ms N       Rendered workflow verifier timeout',
    '  --json                         Emit a machine-readable release report to stdout',
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

function commandString(args) {
  return `${path.basename(NODE)} ${args.map(arg => /\s/.test(arg) ? JSON.stringify(arg) : arg).join(' ')}`;
}

function outputTail(value, max = 6000) {
  const text = String(value || '');
  if (text.length <= max) return text;
  return `${text.slice(0, 1200)}\n...[truncated ${text.length - max} chars]...\n${text.slice(-(max - 1200))}`;
}

function publicOptions(opts) {
  return {
    syntax: opts.syntax,
    proxy: opts.proxy,
    generated: opts.generated,
    rendered: opts.rendered,
    workflows: opts.workflows,
    renderedTimeoutMs: opts.renderedTimeoutMs,
    workflowsTimeoutMs: opts.workflowsTimeoutMs,
    renderedMajors: opts.renderedMajors,
    renderedViewports: opts.renderedViewports,
    live: opts.live,
    liveAll: opts.liveAll,
    liveCatalogSweep: opts.liveCatalogSweep,
    liveCatalogLimit: opts.liveCatalogLimit,
    liveCatalogTestudoTerms: opts.liveCatalogTestudoTerms,
    liveCatalogSkipTestudoTitleCheck: opts.liveCatalogSkipTestudoTitleCheck,
    liveCatalogWriteSettingsSnapshot: opts.liveCatalogWriteSettingsSnapshot,
    liveCatalogNoBumpSettingsAsset: opts.liveCatalogNoBumpSettingsAsset,
    liveCatalogSnapshotDate: opts.liveCatalogSnapshotDate,
    liveCloud: opts.liveCloud,
    liveCloudRequireAuth: opts.liveCloudRequireAuth,
    liveCloudWriteSmoke: opts.liveCloudWriteSmoke,
    liveCloudTimeoutMs: opts.liveCloudTimeoutMs,
    liveMajors: opts.liveMajors,
    liveCount: opts.liveCount,
    liveSeed: opts.liveSeed,
  };
}

function buildLiveCatalogArgs(opts) {
  const args = ['scripts/verify-random-schedules.js', '--catalog-sweep', `--seed=${opts.liveSeed}`];
  if (opts.liveCatalogLimit) args.push(`--catalog-limit=${opts.liveCatalogLimit}`);
  if (opts.liveCatalogTestudoTerms.length) args.push(`--testudo-terms=${opts.liveCatalogTestudoTerms.join(',')}`);
  if (opts.liveCatalogSkipTestudoTitleCheck) args.push('--skip-testudo-title-check');
  if (opts.liveCatalogWriteSettingsSnapshot) args.push('--write-settings-snapshot');
  if (opts.liveCatalogNoBumpSettingsAsset) args.push('--no-bump-settings-asset');
  if (opts.liveCatalogSnapshotDate) args.push(`--snapshot-date=${opts.liveCatalogSnapshotDate}`);
  return args;
}

function createReport(opts) {
  return {
    schema: 'terptrack-release-report/v1',
    status: 'running',
    startedAt: new Date().toISOString(),
    finishedAt: '',
    durationMs: 0,
    cwd: ROOT,
    node: process.version,
    options: publicOptions(opts),
    stages: [],
  };
}

function reportLog(report, message = '') {
  if (!report.json) console.log(message);
}

function startStage(report, id, label) {
  const stage = {
    id,
    label,
    status: 'running',
    startedAt: new Date().toISOString(),
    finishedAt: '',
    durationMs: 0,
    commands: [],
  };
  stage._started = Date.now();
  report.stages.push(stage);
  return stage;
}

function finishStage(stage, status, extra = {}) {
  stage.status = status;
  stage.finishedAt = new Date().toISOString();
  stage.durationMs = Date.now() - stage._started;
  delete stage._started;
  Object.assign(stage, extra);
}

function skipStage(report, id, label, reason) {
  const stage = startStage(report, id, label);
  finishStage(stage, 'skipped', { reason });
}

async function runStage(report, id, label, callback) {
  const stage = startStage(report, id, label);
  try {
    await callback(stage);
    finishStage(stage, 'passed');
  } catch (error) {
    finishStage(stage, 'failed', {
      error: error && error.message ? error.message : String(error),
    });
    throw error;
  }
}

function runCommand(stage, label, args, report) {
  return new Promise((resolve, reject) => {
    const command = commandString(args);
    const record = {
      label,
      command,
      args,
      status: 'running',
      startedAt: new Date().toISOString(),
      finishedAt: '',
      durationMs: 0,
      exitCode: null,
    };
    const started = Date.now();
    let stdout = '';
    let stderr = '';
    stage.commands.push(record);
    reportLog(report, `\n[release] ${label}`);
    reportLog(report, `$ ${command}`);
    const child = spawn(NODE, args, { cwd: ROOT, stdio: report.json ? ['ignore', 'pipe', 'pipe'] : 'inherit' });
    if (report.json) {
      child.stdout.on('data', chunk => { stdout += chunk; });
      child.stderr.on('data', chunk => { stderr += chunk; });
    }
    child.on('error', error => {
      record.status = 'failed';
      record.finishedAt = new Date().toISOString();
      record.durationMs = Date.now() - started;
      record.error = error.message || String(error);
      reject(error);
    });
    child.on('close', code => {
      record.finishedAt = new Date().toISOString();
      record.durationMs = Date.now() - started;
      record.exitCode = code;
      if (report.json) {
        if (stdout) record.stdout = outputTail(stdout);
        if (stderr) record.stderr = outputTail(stderr);
      }
      if (code === 0) {
        record.status = 'passed';
        resolve();
      } else {
        record.status = 'failed';
        record.error = `${label} failed with exit code ${code}`;
        reject(new Error(record.error));
      }
    });
  });
}

async function runSyntaxChecks(report) {
  const files = collectJsFiles();
  await runStage(report, 'syntax', `JS syntax checks (${files.length} files)`, async stage => {
    reportLog(report, `\n[release] JS syntax checks (${files.length} files)`);
    for (const file of files) {
      await runCommand(stage, `node --check ${file}`, ['--check', file], report);
    }
  });
}

async function runReleaseChecks(opts, report) {
  if (opts.syntax) await runSyntaxChecks(report);
  else skipStage(report, 'syntax', 'JS syntax checks', '--skip-syntax');
  if (opts.proxy) {
    await runStage(report, 'proxy', 'offline umd.io proxy fixture', stage => runCommand(stage, 'offline umd.io proxy fixture', ['scripts/test-umd-proxy.js'], report));
  } else {
    skipStage(report, 'proxy', 'offline umd.io proxy fixture', '--skip-proxy');
  }
  if (opts.generated) {
    await runStage(report, 'generated', 'generated-plan fixtures', stage => runCommand(stage, 'generated-plan fixtures', ['scripts/test-generated-plans.js'], report));
  } else {
    skipStage(report, 'generated', 'generated-plan fixtures', '--skip-generated');
  }
  if (opts.rendered) {
    await runStage(report, 'rendered', 'rendered generated-plan verifier', async stage => {
      const baseArgs = ['scripts/verify-rendered-generated-plans.js', `--timeout-ms=${opts.renderedTimeoutMs}`];
      if (opts.renderedMajors.length) baseArgs.push(`--majors=${opts.renderedMajors.join(',')}`);
      if (opts.renderedViewports.length) {
        await runCommand(stage, 'rendered generated-plan verifier', [...baseArgs, `--viewports=${opts.renderedViewports.join(',')}`], report);
        return;
      }
      for (const viewport of ['desktop', 'mobile']) {
        await runCommand(stage, `rendered generated-plan verifier (${viewport})`, [...baseArgs, `--viewports=${viewport}`], report);
      }
    });
  } else {
    skipStage(report, 'rendered', 'rendered generated-plan verifier', '--skip-rendered');
  }
  if (opts.workflows) {
    await runStage(report, 'workflows', 'rendered mobile workflow verifier', stage => runCommand(stage, 'rendered mobile workflow verifier', ['scripts/verify-rendered-workflows.js', `--timeout-ms=${opts.workflowsTimeoutMs}`], report));
  } else {
    skipStage(report, 'workflows', 'rendered mobile workflow verifier', '--skip-workflows');
  }
  if (opts.live) {
    const args = ['scripts/verify-random-schedules.js', '--keep-going', `--seed=${opts.liveSeed}`];
    if (opts.liveAll) args.push('--all');
    else if (opts.liveMajors.length) args.push(`--majors=${opts.liveMajors.join(',')}`);
    else if (opts.liveCount) args.push(`--count=${opts.liveCount}`);
    await runStage(report, 'live', 'live PlanetTerp generated schedule verifier', stage => runCommand(stage, 'live PlanetTerp generated schedule verifier', args, report));
  } else {
    skipStage(report, 'live', 'live PlanetTerp generated schedule verifier', 'Pass --live, --live-majors, --live-count, or --live-all to include it.');
    reportLog(report, '\n[release] Live PlanetTerp verifier skipped. Pass --live, --live-majors, --live-count, or --live-all to include it.');
  }
  if (opts.liveCatalogSweep) {
    const args = buildLiveCatalogArgs(opts);
    await runStage(report, 'live-catalog', 'live generated required-course catalog sweep', stage => runCommand(stage, 'live generated required-course catalog sweep', args, report));
  } else {
    skipStage(report, 'live-catalog', 'live generated required-course catalog sweep', 'Pass --live-catalog-sweep to include it.');
    reportLog(report, '\n[release] Live generated course catalog sweep skipped. Pass --live-catalog-sweep to include it.');
  }
  if (opts.liveCloud) {
    const args = ['scripts/verify-supabase-live.js', `--timeout-ms=${opts.liveCloudTimeoutMs}`];
    if (opts.liveCloudRequireAuth) args.push('--require-auth');
    if (opts.liveCloudWriteSmoke) args.push('--write-smoke');
    await runStage(report, 'live-cloud', 'live Supabase account verifier', stage => runCommand(stage, 'live Supabase account verifier', args, report));
  } else {
    skipStage(report, 'live-cloud', 'live Supabase account verifier', 'Pass --live-cloud to include it.');
    reportLog(report, '\n[release] Live Supabase account verifier skipped. Pass --live-cloud to include it.');
  }
}

async function main() {
  const opts = parseArgs(process.argv);
  if (opts.help) {
    if (opts.json) console.log(JSON.stringify({ usage: usage().split('\n') }, null, 2));
    else console.log(usage());
    return;
  }
  const report = createReport(opts);
  report.json = opts.json;
  try {
    await runReleaseChecks(opts, report);
    report.status = 'passed';
    report.finishedAt = new Date().toISOString();
    report.durationMs = Date.now() - Date.parse(report.startedAt);
    delete report.json;
    if (opts.json) console.log(JSON.stringify(report, null, 2));
    else console.log('\nTerpTrack release checks passed.');
  } catch (error) {
    report.status = 'failed';
    report.finishedAt = new Date().toISOString();
    report.durationMs = Date.now() - Date.parse(report.startedAt);
    report.error = error && error.message ? error.message : String(error);
    delete report.json;
    if (opts.json) console.log(JSON.stringify(report, null, 2));
    throw error;
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error(error && error.stack ? error.stack : error);
    process.exit(1);
  });
} else {
  module.exports = {
    buildLiveCatalogArgs,
    parseArgs,
    publicOptions,
    usage,
  };
}
