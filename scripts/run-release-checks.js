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
    renderedTimeoutMs: Number(process.env.TERPTRACK_RENDER_TIMEOUT_MS || 240000),
    workflowsTimeoutMs: Number(process.env.TERPTRACK_WORKFLOW_TIMEOUT_MS || process.env.TERPTRACK_RENDER_TIMEOUT_MS || 120000),
    renderedMajors: [],
    renderedViewports: [],
    live: false,
    liveAll: false,
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
    liveMajors: opts.liveMajors,
    liveCount: opts.liveCount,
    liveSeed: opts.liveSeed,
  };
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

main().catch(error => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
