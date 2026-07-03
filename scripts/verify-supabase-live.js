#!/usr/bin/env node
'use strict';

const TABLES = [
  { id: 'profiles', select: 'user_id,email,display_name,major_id,major_name,updated_at' },
  { id: 'plans', select: 'id,user_id,slug,name,updated_at' },
  { id: 'friend_requests', select: 'id,requester_id,requester_email,recipient_email,recipient_id,status,updated_at' },
  { id: 'shared_plans', select: 'id,owner_id,slug,name,updated_at' },
];

const URL_ENV_NAMES = [
  'SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'VITE_SUPABASE_URL',
];

const PUBLIC_KEY_ENV_NAMES = [
  'SUPABASE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'VITE_SUPABASE_ANON_KEY',
];

const EMAIL_ENV_NAMES = [
  'TERPTRACK_SUPABASE_TEST_EMAIL',
  'SUPABASE_TEST_EMAIL',
];

const PASSWORD_ENV_NAMES = [
  'TERPTRACK_SUPABASE_TEST_PASSWORD',
  'SUPABASE_TEST_PASSWORD',
];

function fail(message) {
  throw new Error(message);
}

function firstEnv(env, names) {
  for (const name of names) {
    const value = String(env[name] || '').trim();
    if (value) return { name, value };
  }
  return { name: '', value: '' };
}

function normalizeSupabaseUrl(value) {
  const raw = String(value || '').trim().replace(/\/+$/, '');
  if (!raw) return '';
  let parsed = null;
  try {
    parsed = new URL(raw);
  } catch {
    return '';
  }
  const localHosts = new Set(['localhost', '127.0.0.1', '[::1]']);
  const isHttpLocal = parsed.protocol === 'http:' && localHosts.has(parsed.hostname);
  if (parsed.protocol !== 'https:' && !isHttpLocal) return '';
  return parsed.origin;
}

function decodeJwtPayload(value) {
  const parts = String(value || '').split('.');
  if (parts.length < 2) return null;
  try {
    return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

function publicKeyType(value) {
  const key = String(value || '').trim();
  if (!key) return 'missing';
  if (/^sb_secret_/i.test(key)) return 'secret';
  if (/^sb_publishable_/i.test(key)) return 'publishable';
  const jwtPayload = decodeJwtPayload(key);
  if (jwtPayload?.role === 'service_role') return 'service-role';
  if (jwtPayload?.role === 'anon') return 'legacy-anon';
  return 'public';
}

function normalizeSupabaseConfig(input = {}) {
  const supabaseUrl = normalizeSupabaseUrl(input.supabaseUrl || input.url);
  const supabaseAnonKey = String(input.supabaseAnonKey || input.anonKey || input.publishableKey || input.key || '').trim();
  const keyType = publicKeyType(supabaseAnonKey);
  const errors = [];
  if (!supabaseUrl) errors.push('SUPABASE_URL must be an https://<project>.supabase.co URL or a local Supabase URL.');
  if (!supabaseAnonKey) errors.push('A public Supabase key is required.');
  else if (keyType === 'secret' || keyType === 'service-role') errors.push('Use a public publishable or anon key, not a secret/service-role key.');
  else if (supabaseAnonKey.length < 40 || !/^[A-Za-z0-9._-]+$/.test(supabaseAnonKey)) errors.push('The Supabase public key shape is invalid.');
  return {
    supabaseUrl,
    supabaseAnonKey,
    keyType,
    urlSource: input.urlSource || '',
    keySource: input.keySource || '',
    errors,
  };
}

function configFromEnv(env = process.env) {
  const url = firstEnv(env, URL_ENV_NAMES);
  const key = firstEnv(env, PUBLIC_KEY_ENV_NAMES);
  return normalizeSupabaseConfig({
    supabaseUrl: url.value,
    supabaseAnonKey: key.value,
    urlSource: url.name,
    keySource: key.name,
  });
}

function authCredentialsFromEnv(env = process.env) {
  const email = firstEnv(env, EMAIL_ENV_NAMES);
  const password = firstEnv(env, PASSWORD_ENV_NAMES);
  return {
    email: email.value,
    password: password.value,
    emailSource: email.name,
    passwordSource: password.name,
  };
}

function redactKey(value) {
  const raw = String(value || '');
  if (!raw) return 'not set';
  if (raw.length <= 12) return 'configured';
  return `${raw.slice(0, 8)}...${raw.slice(-4)}`;
}

function restUrl(config, table, params = {}) {
  const url = new URL(`${config.supabaseUrl}/rest/v1/${table}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value != null && value !== '') url.searchParams.set(key, String(value));
  });
  return url.toString();
}

function authUrl(config, path) {
  return `${config.supabaseUrl}/auth/v1/${path.replace(/^\/+/, '')}`;
}

function responseMessage(response) {
  const body = response?.body;
  if (body && typeof body === 'object' && !Array.isArray(body)) {
    const message = String(body.message || body.msg || body.error_description || body.error || '');
    if (message) return message;
  }
  return String(response?.text || '');
}

function classifyTableResponse(response) {
  if (response?.ok) return { kind: 'readable', detail: `HTTP ${response.status}` };
  const body = response?.body || {};
  const code = String(body.code || '');
  const message = responseMessage(response);
  if (/invalid api key|missing api key|invalid jwt|jwt malformed|jwserror/i.test(message)) {
    return { kind: 'invalid-key', detail: message || `HTTP ${response.status}` };
  }
  if (/PGRST20[245]|42P01/i.test(code) || /could not find.*table|relation .* does not exist|schema cache/i.test(message)) {
    return { kind: 'missing-table', detail: message || code || `HTTP ${response.status}` };
  }
  if (code === '42501' || /permission denied|row-level security|not authorized|insufficient privilege/i.test(message)) {
    return { kind: 'denied', detail: message || code || `HTTP ${response.status}` };
  }
  return { kind: 'unexpected', detail: message || code || `HTTP ${response?.status || 'unknown'}` };
}

async function requestJson(url, opts = {}) {
  const timeoutMs = opts.timeoutMs || 15000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const headers = {
    apikey: opts.apiKey,
    Authorization: `Bearer ${opts.accessToken || opts.apiKey}`,
    Accept: 'application/json',
    ...(opts.headers || {}),
  };
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  try {
    const response = await fetch(url, {
      method: opts.method || 'GET',
      headers,
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
      signal: controller.signal,
    });
    const text = await response.text();
    let body = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = null;
    }
    return { ok: response.ok, status: response.status, body, text };
  } catch (error) {
    if (error?.name === 'AbortError') fail(`Request timed out after ${timeoutMs}ms: ${url}`);
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function assertConfig(config) {
  if (config.errors.length) {
    fail(`${config.errors.join(' ')} Set ${URL_ENV_NAMES.join('/')} and one of ${PUBLIC_KEY_ENV_NAMES.join('/')}.`);
  }
}

async function verifyAnonymousProtection(config, opts) {
  const rows = [];
  for (const table of TABLES) {
    const response = await requestJson(restUrl(config, table.id, {
      select: table.select,
      limit: 1,
    }), {
      apiKey: config.supabaseAnonKey,
      timeoutMs: opts.timeoutMs,
    });
    const classified = classifyTableResponse(response);
    if (classified.kind === 'invalid-key') fail(`Supabase public key was rejected: ${classified.detail}`);
    if (classified.kind === 'missing-table') fail(`Missing Supabase table ${table.id}: ${classified.detail}`);
    if (classified.kind === 'readable') {
      fail(`Table ${table.id} was readable without a signed-in user. Reapply supabase/schema.sql so anon access is blocked.`);
    }
    if (classified.kind !== 'denied') fail(`Unexpected anonymous ${table.id} response: ${classified.detail}`);
    rows.push({ table: table.id, status: 'blocked', detail: classified.detail });
  }
  return rows;
}

async function signInWithPassword(config, credentials, opts) {
  if (!credentials.email || !credentials.password) return null;
  const response = await requestJson(authUrl(config, 'token?grant_type=password'), {
    method: 'POST',
    apiKey: config.supabaseAnonKey,
    timeoutMs: opts.timeoutMs,
    body: {
      email: credentials.email,
      password: credentials.password,
    },
  });
  if (!response.ok) {
    const message = responseMessage(response) || `HTTP ${response.status}`;
    fail(`Supabase test-user sign-in failed: ${message}`);
  }
  const token = response.body?.access_token || '';
  const user = response.body?.user || null;
  if (!token || !user?.id) fail('Supabase sign-in did not return an access token and user id.');
  return { accessToken: token, user };
}

async function verifyAuthenticatedSelects(config, session, opts) {
  const rows = [];
  for (const table of TABLES) {
    const response = await requestJson(restUrl(config, table.id, {
      select: table.select,
      limit: 0,
    }), {
      apiKey: config.supabaseAnonKey,
      accessToken: session.accessToken,
      timeoutMs: opts.timeoutMs,
    });
    if (!response.ok) {
      const classified = classifyTableResponse(response);
      fail(`Authenticated Data API check failed for ${table.id}: ${classified.detail}`);
    }
    rows.push({ table: table.id, status: 'select-ok' });
  }
  return rows;
}

async function expectOk(label, promise) {
  const response = await promise;
  if (!response.ok) fail(`${label} failed: ${responseMessage(response) || `HTTP ${response.status}`}`);
  return response;
}

async function writeSmokeRows(config, session, opts) {
  const stamp = new Date().toISOString();
  const slug = 'terptrack-live-verify';
  const requesterEmail = String(session.user.email || opts.email || 'terptrack-verifier@example.invalid').toLowerCase();
  const recipientEmail = `terptrack-live-verify+${Date.now()}@example.invalid`;
  let friendRequestId = '';
  let primaryError = null;

  try {
    await expectOk('plans upsert', requestJson(restUrl(config, 'plans', { on_conflict: 'user_id,slug' }), {
      method: 'POST',
      apiKey: config.supabaseAnonKey,
      accessToken: session.accessToken,
      timeoutMs: opts.timeoutMs,
      headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
      body: [{
        user_id: session.user.id,
        slug,
        name: 'TerpTrack live verifier',
        payload: { source: 'terptrack-live-verifier', checkedAt: stamp },
        updated_at: stamp,
      }],
    }));

    await expectOk('shared_plans upsert', requestJson(restUrl(config, 'shared_plans', { on_conflict: 'owner_id,slug' }), {
      method: 'POST',
      apiKey: config.supabaseAnonKey,
      accessToken: session.accessToken,
      timeoutMs: opts.timeoutMs,
      headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
      body: [{
        owner_id: session.user.id,
        slug,
        name: 'TerpTrack live verifier',
        payload: { source: 'terptrack-live-verifier', checkedAt: stamp },
        updated_at: stamp,
      }],
    }));

    const friendResponse = await expectOk('friend_requests insert', requestJson(restUrl(config, 'friend_requests'), {
      method: 'POST',
      apiKey: config.supabaseAnonKey,
      accessToken: session.accessToken,
      timeoutMs: opts.timeoutMs,
      headers: { Prefer: 'return=representation' },
      body: [{
        requester_id: session.user.id,
        requester_email: requesterEmail,
        recipient_email: recipientEmail,
        note: 'TerpTrack live verifier cleanup row',
        status: 'pending',
      }],
    }));
    friendRequestId = Array.isArray(friendResponse.body) ? (friendResponse.body[0]?.id || '') : '';
  } catch (error) {
    primaryError = error;
  } finally {
    const cleanup = [];
    cleanup.push(requestJson(restUrl(config, 'plans', {
      user_id: `eq.${session.user.id}`,
      slug: `eq.${slug}`,
    }), {
      method: 'DELETE',
      apiKey: config.supabaseAnonKey,
      accessToken: session.accessToken,
      timeoutMs: opts.timeoutMs,
      headers: { Prefer: 'return=minimal' },
    }));
    cleanup.push(requestJson(restUrl(config, 'shared_plans', {
      owner_id: `eq.${session.user.id}`,
      slug: `eq.${slug}`,
    }), {
      method: 'DELETE',
      apiKey: config.supabaseAnonKey,
      accessToken: session.accessToken,
      timeoutMs: opts.timeoutMs,
      headers: { Prefer: 'return=minimal' },
    }));
    if (friendRequestId) {
      cleanup.push(requestJson(restUrl(config, 'friend_requests', { id: `eq.${friendRequestId}` }), {
        method: 'DELETE',
        apiKey: config.supabaseAnonKey,
        accessToken: session.accessToken,
        timeoutMs: opts.timeoutMs,
        headers: { Prefer: 'return=minimal' },
      }));
    }
    const results = await Promise.all(cleanup);
    const failed = results.find(response => !response.ok);
    if (failed && !primaryError) fail(`Verifier cleanup failed: ${responseMessage(failed) || `HTTP ${failed.status}`}`);
  }
  if (primaryError) throw primaryError;

  return {
    slug,
    friendRequestInserted: !!friendRequestId,
    cleanedUp: true,
  };
}

function parseArgs(argv) {
  const opts = {
    timeoutMs: Number(process.env.TERPTRACK_SUPABASE_TIMEOUT_MS || 15000),
    json: false,
    requireAuth: false,
    writeSmoke: false,
    help: false,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') opts.help = true;
    else if (arg === '--json') opts.json = true;
    else if (arg === '--require-auth') opts.requireAuth = true;
    else if (arg === '--write-smoke') {
      opts.writeSmoke = true;
      opts.requireAuth = true;
    } else if (arg === '--timeout-ms') {
      opts.timeoutMs = Number(argv[++i] || opts.timeoutMs);
    } else if (arg.startsWith('--timeout-ms=')) {
      opts.timeoutMs = Number(arg.slice('--timeout-ms='.length) || opts.timeoutMs);
    } else {
      fail(`Unknown argument: ${arg}`);
    }
  }
  opts.timeoutMs = Number.isFinite(opts.timeoutMs) && opts.timeoutMs > 0 ? Math.floor(opts.timeoutMs) : 15000;
  return opts;
}

function usage() {
  return [
    'Usage: node scripts/verify-supabase-live.js [options]',
    '',
    'Environment:',
    `  ${URL_ENV_NAMES.join(' or ')}`,
    `  ${PUBLIC_KEY_ENV_NAMES.join(' or ')}`,
    `  ${EMAIL_ENV_NAMES.join(' or ')} and ${PASSWORD_ENV_NAMES.join(' or ')} for authenticated checks`,
    '',
    'Options:',
    '  --require-auth       Fail unless test-user email/password env vars are present',
    '  --write-smoke        Upsert and delete verifier rows for plans, shared_plans, and friend_requests',
    '  --timeout-ms N       Per-request timeout',
    '  --json               Emit a machine-readable report',
  ].join('\n');
}

async function run(opts = parseArgs(process.argv), env = process.env) {
  if (opts.help) {
    if (opts.json) console.log(JSON.stringify({ usage: usage().split('\n') }, null, 2));
    else console.log(usage());
    return { status: 'help' };
  }
  if (typeof fetch !== 'function') fail('Node 18+ with global fetch is required.');
  const config = configFromEnv(env);
  assertConfig(config);
  const report = {
    schema: 'terptrack-supabase-live/v1',
    status: 'running',
    startedAt: new Date().toISOString(),
    finishedAt: '',
    projectUrl: config.supabaseUrl,
    urlSource: config.urlSource,
    keySource: config.keySource,
    keyType: config.keyType,
    key: redactKey(config.supabaseAnonKey),
    anonymousTables: [],
    authenticatedTables: [],
    writeSmoke: null,
    auth: { status: 'skipped' },
  };

  report.anonymousTables = await verifyAnonymousProtection(config, opts);
  const credentials = authCredentialsFromEnv(env);
  const session = await signInWithPassword(config, credentials, opts);
  if (!session) {
    if (opts.requireAuth) fail(`Set ${EMAIL_ENV_NAMES.join('/')} and ${PASSWORD_ENV_NAMES.join('/')} for authenticated live checks.`);
    report.auth = {
      status: 'skipped',
      reason: `Set ${EMAIL_ENV_NAMES[0]} and ${PASSWORD_ENV_NAMES[0]} to verify authenticated Data API access.`,
    };
  } else {
    report.auth = {
      status: 'signed-in',
      userId: String(session.user.id || '').slice(0, 8),
      email: session.user.email || credentials.email,
    };
    report.authenticatedTables = await verifyAuthenticatedSelects(config, session, opts);
    if (opts.writeSmoke) report.writeSmoke = await writeSmokeRows(config, session, { ...opts, email: credentials.email });
  }
  report.status = 'passed';
  report.finishedAt = new Date().toISOString();
  if (opts.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`Supabase live verifier passed for ${config.supabaseUrl} (${config.keyType}, ${config.keySource || 'env'} ${redactKey(config.supabaseAnonKey)}).`);
    console.log(`Anonymous access blocked for ${report.anonymousTables.length}/${TABLES.length} TerpTrack tables.`);
    if (report.auth.status === 'signed-in') {
      console.log(`Authenticated select checks passed for ${report.authenticatedTables.length}/${TABLES.length} tables as ${report.auth.email || 'test user'}.`);
      if (report.writeSmoke) console.log('Write smoke rows inserted and cleaned up.');
    } else {
      console.log(report.auth.reason);
    }
  }
  return report;
}

if (require.main === module) {
  run().catch(error => {
    console.error(error.stack || error.message || String(error));
    process.exit(1);
  });
} else {
  module.exports = {
    TABLES,
    authCredentialsFromEnv,
    classifyTableResponse,
    configFromEnv,
    decodeJwtPayload,
    normalizeSupabaseConfig,
    normalizeSupabaseUrl,
    publicKeyType,
    redactKey,
    restUrl,
  };
}
