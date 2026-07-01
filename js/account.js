'use strict';
/* ============================================================
   ACCOUNT + CLOUD SYNC READINESS
   ============================================================ */

const ACCOUNT_CONFIG_STORAGE = 'terp-track-supabase-config';
const ACCOUNT_SDK_URL = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
const ACCOUNT_SCHEMA_REQUIREMENTS = [
  { id: 'profiles', label: 'profiles', detail: 'student profile, major, profile preferences' },
  { id: 'plans', label: 'plans', detail: 'private cloud save/load payloads' },
  { id: 'friend_requests', label: 'friend_requests', detail: 'invites, accepted friends, recipient links' },
  { id: 'shared_plans', label: 'shared_plans', detail: 'readable plans for accepted friends' },
  { id: 'rls', label: 'RLS policies', detail: 'owner-only plans and accepted-friend visibility' },
  { id: 'updated_at', label: 'updated_at triggers', detail: 'fresh timestamps after edits and publishes' },
];
let accountConfigPromise = null;
let accountClient = null;
let accountSession = null;
let accountAuthListenerReady = false;
let accountConfig = { source: 'none', supabaseUrl: '', supabaseAnonKey: '' };
let accountFriendPlans = [];
let accountFriendProfiles = {};

function accountEscape(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

function accountDefaultPrefs() {
  if (typeof defaultAccountPrefs === 'function') return defaultAccountPrefs();
  return {
    planName: 'Primary TerpTrack plan',
    displayName: '',
    friendInviteEmail: '',
    friendInviteNote: '',
    friendInvites: [],
    lastCloudSaveAt: '',
    lastCloudLoadAt: '',
    lastFriendSyncAt: '',
    lastFriendPlanPublishAt: '',
    lastFriendPlanLoadAt: '',
  };
}

function getAccountPrefs() {
  const merged = { ...accountDefaultPrefs(), ...(state.accountPrefs || {}) };
  state.accountPrefs = typeof normalizeAccountPrefs === 'function' ? normalizeAccountPrefs(merged) : merged;
  return state.accountPrefs;
}

function accountNormalizeEmail(value) {
  if (typeof normalizeAccountEmail === 'function') return normalizeAccountEmail(value);
  const email = String(value || '').trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
}

function accountCurrentMajorInfo() {
  const id = state.majorId || 'CE';
  const tpl = typeof getMajorTemplate === 'function' ? getMajorTemplate(id) : null;
  return {
    id,
    name: tpl?.name || tpl?.programName || id || 'Undeclared',
  };
}

function accountDisplayNameInput() {
  return String(document.getElementById('account-display-name')?.value || getAccountPrefs().displayName || '').trim().slice(0, 80);
}

function accountProfilePayload() {
  const major = accountCurrentMajorInfo();
  return {
    display_name: accountDisplayNameInput(),
    major_id: major.id,
    major_name: major.name,
    profile_prefs: typeof getProfilePrefs === 'function' ? getProfilePrefs() : (state.profilePrefs || {}),
  };
}

function accountShortId(value) {
  return String(value || '').slice(0, 8);
}

function accountProfileLabel(userId, fallbackEmail = 'friend') {
  const profile = accountFriendProfiles[userId] || null;
  const name = String(profile?.display_name || '').trim();
  const major = String(profile?.major_name || profile?.major_id || '').trim();
  if (name && major) return `${name} · ${major}`;
  if (name) return name;
  if (major && fallbackEmail) return `${fallbackEmail} · ${major}`;
  return fallbackEmail || (userId ? `friend ${accountShortId(userId)}` : 'friend');
}

async function accountLoadProfilesForUsers(client, userIds) {
  const ids = Array.from(new Set((userIds || []).map(id => String(id || '').trim()).filter(Boolean)));
  if (!client || !ids.length) return;
  try {
    const { data, error } = await client.from('profiles')
      .select('user_id,email,display_name,major_id,major_name,updated_at')
      .in('user_id', ids);
    if (error) throw error;
    const next = { ...accountFriendProfiles };
    (data || []).forEach(profile => {
      next[profile.user_id] = profile;
    });
    accountFriendProfiles = next;
  } catch {
    // Profiles are a helpful enhancement; friend requests still work without them.
  }
}

function accountReadManualConfig() {
  try {
    const parsed = JSON.parse(localStorage.getItem(ACCOUNT_CONFIG_STORAGE) || '{}');
    return accountNormalizeConfig(parsed, 'manual');
  } catch {
    return null;
  }
}

function accountNormalizeConfig(value, source) {
  const supabaseUrl = String(value?.supabaseUrl || value?.url || '').trim();
  const supabaseAnonKey = String(value?.supabaseAnonKey || value?.anonKey || '').trim();
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return { source, supabaseUrl, supabaseAnonKey };
}

async function accountLoadConfig() {
  if (accountConfigPromise) return accountConfigPromise;
  accountConfigPromise = (async () => {
    const globalConfig = accountNormalizeConfig({
      supabaseUrl: window.TERPTRACK_SUPABASE_URL,
      supabaseAnonKey: window.TERPTRACK_SUPABASE_ANON_KEY,
    }, 'window');
    if (globalConfig) return globalConfig;

    try {
      const res = await fetch('/api/config', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const apiConfig = accountNormalizeConfig(data, 'vercel');
        if (apiConfig) return apiConfig;
      }
    } catch {}

    return accountReadManualConfig() || { source: 'none', supabaseUrl: '', supabaseAnonKey: '' };
  })();
  accountConfig = await accountConfigPromise;
  return accountConfig;
}

function accountResetConfigCache() {
  accountConfigPromise = null;
  accountClient = null;
  accountSession = null;
  accountAuthListenerReady = false;
}

function accountConfigLabel(source) {
  if (source === 'vercel') return 'Vercel env';
  if (source === 'window') return 'Runtime config';
  if (source === 'manual') return 'Manual config';
  return 'Local only';
}

function accountConfigQuality(config) {
  const supabaseUrl = String(config?.supabaseUrl || '').trim();
  const supabaseAnonKey = String(config?.supabaseAnonKey || '').trim();
  const hasUrl = !!supabaseUrl;
  const hasKey = !!supabaseAnonKey;
  const urlLooksValid = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(supabaseUrl);
  const keyLooksValid = supabaseAnonKey.length >= 40 && /^[A-Za-z0-9._-]+$/.test(supabaseAnonKey);
  return { hasUrl, hasKey, urlLooksValid, keyLooksValid };
}

function accountCloudSetupChecks(config, clientReady = false, origin = '') {
  const source = config?.source || 'none';
  const quality = accountConfigQuality(config);
  const currentOrigin = origin || (typeof location !== 'undefined' ? location.origin : '');
  const configured = quality.hasUrl && quality.hasKey;
  return [
    {
      id: 'deployment',
      status: source === 'vercel' || source === 'window' ? 'ok' : source === 'manual' ? 'warn' : 'missing',
      label: 'Deployment config',
      detail: source === 'vercel'
        ? 'Vercel env vars are serving /api/config.'
        : source === 'window'
          ? 'Runtime window config is present.'
          : source === 'manual'
            ? 'Manual browser config works for local testing; add Vercel env vars before launch.'
            : 'Add SUPABASE_URL and SUPABASE_ANON_KEY in Vercel.',
    },
    {
      id: 'credentials',
      status: configured && quality.urlLooksValid && quality.keyLooksValid ? 'ok' : configured ? 'warn' : 'missing',
      label: 'Supabase credentials',
      detail: !configured
        ? 'Project URL and public anon key are required.'
        : quality.urlLooksValid && quality.keyLooksValid
          ? 'URL and anon key shape look ready.'
          : 'Check the project URL and anon key formatting.',
    },
    {
      id: 'client',
      status: clientReady ? 'ok' : configured ? 'warn' : 'missing',
      label: 'Client connection',
      detail: clientReady
        ? 'Supabase client initialized.'
        : configured
          ? 'Credentials are present; client still needs to initialize.'
          : 'Client will stay disabled until credentials exist.',
    },
    {
      id: 'schema',
      status: configured ? 'warn' : 'missing',
      label: 'Database schema',
      detail: configured
        ? 'Confirm supabase/schema.sql is applied in the Supabase SQL editor.'
        : 'Apply supabase/schema.sql after creating the Supabase project.',
    },
    {
      id: 'redirect',
      status: currentOrigin && configured ? 'warn' : 'missing',
      label: 'Magic-link redirect',
      detail: currentOrigin && configured
        ? `Confirm ${currentOrigin} is allowed in Supabase Auth URL settings.`
        : 'Add the deployed app URL to Supabase Auth URL settings.',
    },
  ];
}

function accountCloudSetupHtml(config, clientReady) {
  const checks = accountCloudSetupChecks(config, clientReady);
  const okCount = checks.filter(check => check.status === 'ok').length;
  return `
    <div class="account-checklist">
      <div class="account-checklist-head">
        <strong>Cloud setup</strong>
        <span>${okCount}/${checks.length} ready</span>
      </div>
      ${checks.map(check => `
        <div class="account-check ${accountEscape(check.status)}">
          <b>${accountEscape(check.status === 'ok' ? 'Ready' : check.status === 'warn' ? 'Check' : 'Missing')}</b>
          <div>
            <strong>${accountEscape(check.label)}</strong>
            <span>${accountEscape(check.detail)}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function accountSchemaChecklistItems() {
  return ACCOUNT_SCHEMA_REQUIREMENTS.slice();
}

function accountSchemaChecklistHtml() {
  return `
    <div class="account-schema-checklist">
      <div class="account-schema-head">
        <strong>Schema objects</strong>
        <span>Required before accounts, friends, and shared plans are dependable.</span>
      </div>
      <div class="account-schema-grid">
        ${accountSchemaChecklistItems().map(item => `
          <div class="account-schema-item">
            <strong>${accountEscape(item.label)}</strong>
            <span>${accountEscape(item.detail)}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

async function accountCopySchemaSql() {
  try {
    const response = await fetch('supabase/schema.sql', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const sql = await response.text();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(sql);
      accountSetStatus('Schema SQL copied. Paste it into the Supabase SQL editor.', 'ok');
    } else {
      prompt('Copy this Supabase schema SQL:', sql);
      accountSetStatus('Schema SQL ready to paste into Supabase.', 'ok');
    }
  } catch (err) {
    accountSetStatus(`Could not copy schema SQL automatically. Open supabase/schema.sql from the repo. ${err.message || ''}`.trim(), 'warn');
  }
}

function accountTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Never';
  return date.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function accountMask(value) {
  const raw = String(value || '');
  if (raw.length <= 12) return raw ? 'configured' : 'not set';
  return `${raw.slice(0, 8)}…${raw.slice(-4)}`;
}

function accountSetStatus(message, kind = '') {
  const status = document.getElementById('account-status');
  if (!status) return;
  status.textContent = message || '';
  status.className = `account-status ${kind}`.trim();
}

function accountSetTopbar(mode) {
  const dot = document.getElementById('account-status-dot');
  const btn = document.getElementById('account-btn');
  if (dot) dot.className = `account-status-dot ${mode || 'local'}`;
  if (btn) {
    const label = mode === 'signed' ? 'Signed in' : mode === 'ready' ? 'Cloud ready' : 'Local mode';
    btn.title = `Account and cloud sync · ${label}`;
  }
}

function accountLoadSdk() {
  if (window.supabase?.createClient) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${ACCOUNT_SDK_URL}"]`);
    if (existing) {
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = ACCOUNT_SDK_URL;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Could not load Supabase client.'));
    document.head.appendChild(script);
  });
}

async function accountEnsureClient() {
  const config = await accountLoadConfig();
  if (!config.supabaseUrl || !config.supabaseAnonKey) return null;
  if (!accountClient) {
    await accountLoadSdk();
    accountClient = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  const { data } = await accountClient.auth.getSession();
  accountSession = data?.session || null;
  if (!accountAuthListenerReady) {
    accountAuthListenerReady = true;
    accountClient.auth.onAuthStateChange((_event, session) => {
      accountSession = session || null;
      accountRenderTopbar();
      if (document.getElementById('account-modal')?.classList.contains('open')) renderAccountModal();
    });
  }
  return accountClient;
}

function accountCloudPayload() {
  const clean = JSON.parse(JSON.stringify(state || {}));
  return { version: 1, savedAt: new Date().toISOString(), state: clean };
}

function accountNormalizeLoadedState(cloudState) {
  return {
    ...state,
    ...cloudState,
    settings: typeof normalizeSettings === 'function' ? normalizeSettings({ ...DEFAULT_SETTINGS, ...(cloudState.settings || {}) }) : { ...DEFAULT_SETTINGS, ...(cloudState.settings || {}) },
    customCourses: cloudState.customCourses || [],
    customSemesters: cloudState.customSemesters || [],
    customMajors: cloudState.customMajors || [],
    selectedSections: cloudState.selectedSections || {},
    schedulePrefs: cloudState.schedulePrefs || {},
    scheduleAdvisorFilter: ['all', 'remaining', 'gened', 'blockers'].includes(cloudState.scheduleAdvisorFilter) ? cloudState.scheduleAdvisorFilter : 'all',
    scheduleOutputPreset: ['personal', 'advisor', 'registrar', 'custom'].includes(cloudState.scheduleOutputPreset) ? cloudState.scheduleOutputPreset : 'personal',
    scheduleOutputOptions: { preferences: true, warnings: true, unscheduled: true, recentChanges: true, auditIssues: true, ...(cloudState.scheduleOutputOptions || {}) },
    roadmapPrefs: { filter: 'all', query: '', selectedCode: '', ...(cloudState.roadmapPrefs || {}) },
    browseSavedSearches: typeof normalizeBrowseSavedSearches === 'function' ? normalizeBrowseSavedSearches(cloudState.browseSavedSearches) : (cloudState.browseSavedSearches || []),
    recentChanges: Array.isArray(cloudState.recentChanges) ? cloudState.recentChanges.slice(0, 12) : [],
    accountPrefs: typeof normalizeAccountPrefs === 'function'
      ? normalizeAccountPrefs({ ...getAccountPrefs(), ...(cloudState.accountPrefs || {}) })
      : { ...getAccountPrefs(), ...(cloudState.accountPrefs || {}) },
    profilePrefs: typeof normalizeProfilePrefs === 'function' ? normalizeProfilePrefs(cloudState.profilePrefs || {}) : (cloudState.profilePrefs || {}),
  };
}

async function accountSendMagicLink() {
  const email = document.getElementById('account-email')?.value.trim();
  if (!email) {
    accountSetStatus('Enter your email.', 'warn');
    return;
  }
  try {
    const client = await accountEnsureClient();
    if (!client) {
      accountSetStatus('Cloud config is missing.', 'warn');
      return;
    }
    const { error } = await client.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}${location.pathname}` },
    });
    if (error) throw error;
    accountSetStatus('Sign-in link sent.', 'ok');
  } catch (err) {
    accountSetStatus(err.message || 'Could not send sign-in link.', 'warn');
  }
}

async function accountSignOut() {
  try {
    const client = await accountEnsureClient();
    if (client) await client.auth.signOut();
    accountSession = null;
    accountSetStatus('Signed out.', 'ok');
    renderAccountModal();
  } catch (err) {
    accountSetStatus(err.message || 'Could not sign out.', 'warn');
  }
}

async function accountSaveCloudPlan() {
  try {
    const client = await accountEnsureClient();
    if (!client || !accountSession?.user) {
      accountSetStatus('Sign in first.', 'warn');
      return;
    }
    const prefs = getAccountPrefs();
    const planName = document.getElementById('account-plan-name')?.value.trim() || prefs.planName || 'Primary TerpTrack plan';
    const now = new Date().toISOString();
    const profileResult = await client.from('profiles').upsert({
      user_id: accountSession.user.id,
      email: accountSession.user.email || '',
      ...accountProfilePayload(),
      updated_at: now,
    }, { onConflict: 'user_id' });
    if (profileResult.error) throw profileResult.error;
    const { error } = await client.from('plans').upsert({
      user_id: accountSession.user.id,
      slug: 'primary',
      name: planName,
      payload: accountCloudPayload(),
      updated_at: now,
    }, { onConflict: 'user_id,slug' });
    if (error) throw error;
    state.accountPrefs = { ...prefs, planName, lastCloudSaveAt: now };
    saveState();
    accountSetStatus('Plan saved to cloud.', 'ok');
    renderAccountModal();
  } catch (err) {
    accountSetStatus(err.message || 'Could not save plan.', 'warn');
  }
}

async function accountLoadCloudPlan() {
  try {
    const client = await accountEnsureClient();
    if (!client || !accountSession?.user) {
      accountSetStatus('Sign in first.', 'warn');
      return;
    }
    const { data, error } = await client
      .from('plans')
      .select('name,payload,updated_at')
      .eq('slug', 'primary')
      .limit(1);
    if (error) throw error;
    const row = data && data[0];
    if (!row?.payload) {
      accountSetStatus('No cloud plan yet.', 'warn');
      return;
    }
    const cloudState = row.payload.state || row.payload;
    state = accountNormalizeLoadedState(cloudState);
    state.accountPrefs = {
      ...getAccountPrefs(),
      planName: row.name || getAccountPrefs().planName,
      lastCloudLoadAt: new Date().toISOString(),
    };
    saveState();
    applyTheme();
    applySettings();
    render();
    accountSetStatus('Cloud plan loaded.', 'ok');
    renderAccountModal();
  } catch (err) {
    accountSetStatus(err.message || 'Could not load cloud plan.', 'warn');
  }
}

async function accountSaveProfile() {
  const prefs = getAccountPrefs();
  const now = new Date().toISOString();
  const payload = accountProfilePayload();
  state.accountPrefs = { ...prefs, displayName: accountDisplayNameInput() };
  saveState();
  if (accountSession?.user?.id) {
    accountFriendProfiles = {
      ...accountFriendProfiles,
      [accountSession.user.id]: {
        user_id: accountSession.user.id,
        email: accountSession.user.email || '',
        ...payload,
        updated_at: now,
      },
    };
  }
  try {
    const client = await accountEnsureClient();
    if (!client || !accountSession?.user) {
      accountSetStatus('Profile saved locally.', 'ok');
      renderAccountModal();
      return;
    }
    const { error } = await client.from('profiles').upsert({
      user_id: accountSession.user.id,
      email: accountSession.user.email || '',
      ...payload,
      updated_at: now,
    }, { onConflict: 'user_id' });
    if (error) throw error;
    accountSetStatus('Profile saved to cloud.', 'ok');
    renderAccountModal();
  } catch (err) {
    accountSetStatus(err.message || 'Profile saved locally, but cloud sync failed.', 'warn');
    renderAccountModal();
  }
}

function accountMergeFriendInvite(invite) {
  const prefs = getAccountPrefs();
  const normalized = typeof normalizeAccountFriendInvite === 'function'
    ? normalizeAccountFriendInvite(invite, prefs.friendInvites.length)
    : invite;
  if (!normalized?.email) return null;
  const next = [...(prefs.friendInvites || [])];
  const idx = next.findIndex(existing => (
    (normalized.cloudId && existing.cloudId === normalized.cloudId)
    || (normalized.id && existing.id === normalized.id)
    || (normalized.direction === existing.direction && normalized.email === existing.email)
  ));
  if (idx >= 0) next[idx] = { ...next[idx], ...normalized };
  else next.unshift(normalized);
  state.accountPrefs = { ...prefs, friendInvites: next.slice(0, 30) };
  return normalized;
}

async function accountCreateFriendInvite() {
  const email = accountNormalizeEmail(document.getElementById('account-friend-email')?.value);
  const note = String(document.getElementById('account-friend-note')?.value || '').trim().slice(0, 180);
  const ownEmail = accountNormalizeEmail(accountSession?.user?.email);
  if (!email) {
    accountSetStatus('Enter a valid friend email.', 'warn');
    return;
  }
  if (ownEmail && email === ownEmail) {
    accountSetStatus('Use a different email than your account.', 'warn');
    return;
  }

  const now = new Date().toISOString();
  accountMergeFriendInvite({
    id: `friend-${Date.now()}`,
    email,
    note,
    status: 'pending',
    direction: 'sent',
    source: 'local',
    createdAt: now,
    updatedAt: now,
  });
  state.accountPrefs = {
    ...getAccountPrefs(),
    friendInviteEmail: email,
    friendInviteNote: note,
  };
  saveState();

  try {
    const client = await accountEnsureClient();
    if (!client || !accountSession?.user) {
      accountSetStatus('Friend invite saved locally.', 'ok');
      renderAccountModal();
      return;
    }
    const { data, error } = await client.from('friend_requests')
      .upsert({
        requester_id: accountSession.user.id,
        requester_email: accountSession.user.email || '',
        recipient_email: email,
        note,
        status: 'pending',
        updated_at: now,
      }, { onConflict: 'requester_id,recipient_email' })
      .select('id,status,created_at,updated_at')
      .single();
    if (error) throw error;
    accountMergeFriendInvite({
      id: data?.id || `friend-${Date.now()}`,
      cloudId: data?.id || '',
      email,
      note,
      status: data?.status || 'pending',
      direction: 'sent',
      source: 'cloud',
      createdAt: data?.created_at || now,
      updatedAt: data?.updated_at || now,
    });
    saveState();
    accountSetStatus('Friend invite saved to cloud.', 'ok');
    renderAccountModal();
  } catch (err) {
    accountSetStatus(`Invite saved locally. Cloud sync failed: ${err.message || 'unknown error'}`, 'warn');
    renderAccountModal();
  }
}

async function accountRemoveFriendInvite(id) {
  const prefs = getAccountPrefs();
  const invite = (prefs.friendInvites || []).find(item => item.id === id || item.cloudId === id);
  try {
    if (invite?.cloudId && accountSession?.user) {
      const client = await accountEnsureClient();
      if (client) {
        const { error } = await client.from('friend_requests').delete().eq('id', invite.cloudId);
        if (error) throw error;
      }
    }
    state.accountPrefs = {
      ...prefs,
      friendInvites: (prefs.friendInvites || []).filter(item => item.id !== id && item.cloudId !== id),
    };
    saveState();
    accountSetStatus('Friend invite removed.', 'ok');
    renderAccountModal();
  } catch (err) {
    accountSetStatus(err.message || 'Could not remove friend invite.', 'warn');
  }
}

async function accountSyncFriends() {
  try {
    const client = await accountEnsureClient();
    if (!client || !accountSession?.user) {
      accountSetStatus('Sign in first.', 'warn');
      return;
    }
    const userId = accountSession.user.id;
    const email = accountNormalizeEmail(accountSession.user.email);
    const [sentResult, receivedResult] = await Promise.all([
      client.from('friend_requests')
        .select('id,requester_id,requester_email,recipient_email,recipient_id,note,status,created_at,updated_at')
        .eq('requester_id', userId)
        .order('updated_at', { ascending: false }),
      email
        ? client.from('friend_requests')
          .select('id,requester_id,requester_email,recipient_email,recipient_id,note,status,created_at,updated_at')
          .ilike('recipient_email', email)
          .order('updated_at', { ascending: false })
        : Promise.resolve({ data: [], error: null }),
    ]);
    if (sentResult.error) throw sentResult.error;
    if (receivedResult.error) throw receivedResult.error;
    const cloudInvites = [
      ...(sentResult.data || []).map(row => ({
        id: row.id,
        cloudId: row.id,
        userId: row.recipient_id || '',
        email: row.recipient_email,
        note: row.note,
        status: row.status,
        direction: 'sent',
        source: 'cloud',
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
      ...(receivedResult.data || [])
        .filter(row => row.requester_id !== userId)
        .map(row => ({
          id: row.id,
          cloudId: row.id,
          userId: row.requester_id,
          email: row.requester_email,
          note: row.note,
          status: row.status,
          direction: 'received',
          source: 'cloud',
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        })),
    ].map((invite, index) => normalizeAccountFriendInvite(invite, index)).filter(Boolean);
    await accountLoadProfilesForUsers(client, cloudInvites.map(invite => invite.userId));
    const localOnly = (getAccountPrefs().friendInvites || []).filter(invite => invite.source !== 'cloud');
    state.accountPrefs = {
      ...getAccountPrefs(),
      friendInvites: [...cloudInvites, ...localOnly].slice(0, 30),
      lastFriendSyncAt: new Date().toISOString(),
    };
    saveState();
    accountSetStatus('Friend requests synced.', 'ok');
    renderAccountModal();
  } catch (err) {
    accountSetStatus(err.message || 'Could not sync friend requests.', 'warn');
  }
}

async function accountRespondToFriendInvite(id, status) {
  const nextStatus = status === 'accepted' ? 'accepted' : 'declined';
  try {
    const prefs = getAccountPrefs();
    const invite = (prefs.friendInvites || []).find(item => item.id === id || item.cloudId === id);
    if (!invite?.cloudId) {
      accountSetStatus('Sync friend requests first.', 'warn');
      return;
    }
    const client = await accountEnsureClient();
    if (!client || !accountSession?.user) {
      accountSetStatus('Sign in first.', 'warn');
      return;
    }
    const now = new Date().toISOString();
    const { error } = await client.from('friend_requests')
      .update({ status: nextStatus, recipient_id: accountSession.user.id, updated_at: now })
      .eq('id', invite.cloudId);
    if (error) throw error;
    accountSetStatus(nextStatus === 'accepted' ? 'Friend request accepted.' : 'Friend request declined.', 'ok');
    await accountSyncFriends();
  } catch (err) {
    accountSetStatus(err.message || 'Could not update friend request.', 'warn');
  }
}

function accountFriendPlanPayload() {
  return {
    version: 1,
    savedAt: new Date().toISOString(),
    state: typeof _planSharePayload === 'function' ? _planSharePayload() : accountCloudPayload().state,
  };
}

async function accountPublishFriendPlan() {
  try {
    const client = await accountEnsureClient();
    if (!client || !accountSession?.user) {
      accountSetStatus('Sign in first.', 'warn');
      return;
    }
    const prefs = getAccountPrefs();
    const planName = document.getElementById('account-plan-name')?.value.trim() || prefs.planName || 'Primary TerpTrack plan';
    const now = new Date().toISOString();
    const { error } = await client.from('shared_plans').upsert({
      owner_id: accountSession.user.id,
      slug: 'primary',
      name: planName,
      payload: accountFriendPlanPayload(),
      updated_at: now,
    }, { onConflict: 'owner_id,slug' });
    if (error) throw error;
    state.accountPrefs = { ...prefs, planName, lastFriendPlanPublishAt: now };
    saveState();
    accountSetStatus('Plan published to accepted friends.', 'ok');
    renderAccountModal();
  } catch (err) {
    accountSetStatus(err.message || 'Could not publish friend plan.', 'warn');
  }
}

async function accountLoadFriendPlans() {
  try {
    const client = await accountEnsureClient();
    if (!client || !accountSession?.user) {
      accountSetStatus('Sign in first.', 'warn');
      return;
    }
    const { data, error } = await client.from('shared_plans')
      .select('id,owner_id,name,payload,updated_at')
      .order('updated_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    accountFriendPlans = (data || []).filter(row => row.owner_id !== accountSession.user.id);
    await accountLoadProfilesForUsers(client, accountFriendPlans.map(row => row.owner_id));
    state.accountPrefs = { ...getAccountPrefs(), lastFriendPlanLoadAt: new Date().toISOString() };
    saveState();
    accountSetStatus(accountFriendPlans.length ? 'Friend plans loaded.' : 'No friend plans available yet.', accountFriendPlans.length ? 'ok' : 'warn');
    renderAccountModal();
  } catch (err) {
    accountSetStatus(err.message || 'Could not load friend plans.', 'warn');
  }
}

function accountOpenFriendPlan(id) {
  const row = accountFriendPlans.find(plan => plan.id === id);
  if (!row) {
    accountSetStatus('Friend plan not found.', 'warn');
    return;
  }
  try {
    const applied = applySharedPlanData(row.payload?.state || row.payload, { sourceLabel: row.name || 'friend plan' });
    if (!applied) return;
    closeAccountModal();
    toastSuccess(`Loaded "${row.name || 'friend plan'}".`);
  } catch (err) {
    accountSetStatus(err.message || 'Could not open friend plan.', 'warn');
  }
}

function accountSaveManualConfig() {
  const supabaseUrl = document.getElementById('account-config-url')?.value.trim();
  const supabaseAnonKey = document.getElementById('account-config-key')?.value.trim();
  if (!supabaseUrl || !supabaseAnonKey) {
    accountSetStatus('URL and anon key are required.', 'warn');
    return;
  }
  localStorage.setItem(ACCOUNT_CONFIG_STORAGE, JSON.stringify({ supabaseUrl, supabaseAnonKey }));
  accountResetConfigCache();
  accountSetStatus('Cloud config saved.', 'ok');
  renderAccountModal();
}

function accountClearManualConfig() {
  localStorage.removeItem(ACCOUNT_CONFIG_STORAGE);
  accountResetConfigCache();
  accountSetStatus('Manual config cleared.', 'ok');
  renderAccountModal();
}

function accountStatsHtml() {
  const sems = getAllSemesters();
  const courseCount = sems.reduce((sum, sem) => sum + ((sem.courses || []).length), 0) + (state.customCourses || []).length;
  const prefs = getAccountPrefs();
  return `
    <div class="account-stats">
      <div><strong>${accountEscape(sems.length)}</strong><span>terms</span></div>
      <div><strong>${accountEscape(courseCount)}</strong><span>courses</span></div>
      <div><strong>${accountEscape((state.snapshots || []).length)}</strong><span>snapshots</span></div>
      <div><strong>${accountEscape(accountTime(prefs.lastCloudSaveAt))}</strong><span>last cloud save</span></div>
    </div>
  `;
}

function accountPlanPayload(source) {
  return source?.payload?.state || source?.payload || source?.state || source || {};
}

function accountPlanCourseCodes(payload) {
  const plan = accountPlanPayload(payload);
  const seen = new Set();
  const add = code => {
    const norm = typeof normalizeCode === 'function' ? normalizeCode(code) : String(code || '').toUpperCase().replace(/\s+/g, '');
    if (norm) seen.add(norm);
  };
  Object.keys(plan.courses || {}).forEach(add);
  (plan.customCourses || []).forEach(course => add(course.code));
  [...(plan.activeSchedule || []), ...(plan.customSemesters || [])]
    .forEach(sem => (sem.courses || []).forEach(course => add(course.code)));
  return Array.from(seen);
}

function accountSelectedSectionItems(selectedSections) {
  const items = [];
  const push = (semId, codeKey, rawSection) => {
    if (!rawSection) return;
    const section = typeof rawSection === 'string'
      ? { number: rawSection, section_id: rawSection, meetings: [] }
      : rawSection;
    const code = displayCode(section.course || codeKey || '');
    if (!normalizeCode(code)) return;
    items.push({
      semId: semId || String(section.semester || ''),
      code,
      course: { code, title: code },
      section,
    });
  };
  Object.entries(selectedSections || {}).forEach(([semOrCode, value]) => {
    if (!value) return;
    if (typeof value === 'string' || value.section_id || value.number || value.course || Array.isArray(value.meetings)) {
      push('', semOrCode, value);
      return;
    }
    Object.entries(value || {}).forEach(([code, section]) => push(semOrCode, code, section));
  });
  return items;
}

function accountCurrentPlanPayload() {
  return typeof _planSharePayload === 'function' ? _planSharePayload() : accountCloudPayload().state;
}

function accountMeetingOverlapSummary(friendItems, currentItems) {
  if (typeof sectionBlocks !== 'function' || typeof blocksConflict !== 'function') return { count: 0, samples: [] };
  const friendBlocks = [];
  const currentBlocks = [];
  friendItems.forEach(item => sectionBlocks(item.section, item.course).forEach(block => friendBlocks.push({ ...block, code: item.code })));
  currentItems.forEach(item => sectionBlocks(item.section, item.course).forEach(block => currentBlocks.push({ ...block, code: item.code })));
  const samples = [];
  let count = 0;
  friendBlocks.forEach(friendBlock => {
    currentBlocks.forEach(currentBlock => {
      if (!blocksConflict(friendBlock, currentBlock)) return;
      count += 1;
      if (samples.length < 3) {
        const time = typeof formatMeetingTime === 'function'
          ? `${formatMeetingTime(Math.max(friendBlock.start, currentBlock.start))}-${formatMeetingTime(Math.min(friendBlock.end, currentBlock.end))}`
          : friendBlock.day;
        samples.push(`${friendBlock.code} with your ${currentBlock.code} ${friendBlock.day} ${time}`);
      }
    });
  });
  return { count, samples };
}

function accountSharedFreeWindows(friendItems, currentItems, options = {}) {
  if (typeof sectionBlocks !== 'function' || typeof formatMeetingTime !== 'function') return [];
  if (!friendItems.length || !currentItems.length) return [];
  const startDay = options.start || 8 * 60;
  const endDay = options.end || 20 * 60;
  const minDuration = options.minDuration || 60;
  const limit = Number.isFinite(options.limit) ? Math.max(0, Math.floor(options.limit)) : 4;
  const days = typeof SCHEDULE_DAY_DEFS !== 'undefined'
    ? SCHEDULE_DAY_DEFS
    : [
      { key: 'M', label: 'Mon' },
      { key: 'Tu', label: 'Tue' },
      { key: 'W', label: 'Wed' },
      { key: 'Th', label: 'Thu' },
      { key: 'F', label: 'Fri' },
    ];
  const byDay = Object.fromEntries(days.map(day => [day.key, []]));
  const daySources = Object.fromEntries(days.map(day => [day.key, { friend: 0, current: 0 }]));
  const collectBlocks = (items, source) => {
    (items || []).forEach(item => {
      sectionBlocks(item.section, item.course).forEach(block => {
        if (!byDay[block.day]) return;
        const start = Math.max(startDay, block.start);
        const end = Math.min(endDay, block.end);
        if (end > start) byDay[block.day].push({ start, end });
        if (daySources[block.day]) daySources[block.day][source] += 1;
      });
    });
  };
  collectBlocks(friendItems, 'friend');
  collectBlocks(currentItems, 'current');
  const windows = [];
  days.forEach(day => {
    const blocks = (byDay[day.key] || []).sort((a, b) => a.start - b.start || a.end - b.end);
    const merged = [];
    blocks.forEach(block => {
      const last = merged[merged.length - 1];
      if (last && block.start <= last.end) last.end = Math.max(last.end, block.end);
      else merged.push({ ...block });
    });
    let cursor = startDay;
    merged.forEach(block => {
      if (block.start - cursor >= minDuration) {
        const sources = daySources[day.key] || {};
        windows.push({ day: day.key, label: day.label, start: cursor, end: block.start, campusAligned: Boolean(sources.friend && sources.current) });
      }
      cursor = Math.max(cursor, block.end);
    });
    if (endDay - cursor >= minDuration) {
      const sources = daySources[day.key] || {};
      windows.push({ day: day.key, label: day.label, start: cursor, end: endDay, campusAligned: Boolean(sources.friend && sources.current) });
    }
  });
  return (limit ? windows.slice(0, limit) : windows).map(window => ({
    ...window,
    duration: window.end - window.start,
    text: `${window.label} ${formatMeetingTime(window.start)}-${formatMeetingTime(window.end)}`,
  }));
}

function accountMeetingDurationText(minutes) {
  const total = Math.max(0, Math.round(Number(minutes) || 0));
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (hours && mins) return `${hours}h ${mins}m`;
  if (hours) return `${hours}h`;
  return `${mins}m`;
}

function accountClampMeetingTime(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function accountSuggestedMeetingSlot(window, options = {}) {
  if (!window || typeof formatMeetingTime !== 'function') return null;
  const available = Math.max(0, window.end - window.start);
  if (available < 45) return null;
  const preferredDuration = options.duration || 75;
  const duration = Math.min(preferredDuration, available);
  const latestStart = Math.max(window.start, window.end - duration);
  const preferredStarts = options.preferredStarts || [12 * 60, 13 * 60 + 30, 10 * 60, 15 * 60 + 30, 17 * 60];
  let bestStart = window.start;
  let bestDistance = Infinity;
  preferredStarts.forEach(preferred => {
    const clamped = accountClampMeetingTime(preferred, window.start, latestStart);
    const snapped = accountClampMeetingTime(Math.round(clamped / 15) * 15, window.start, latestStart);
    const distance = Math.abs(snapped - preferred);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestStart = snapped;
    }
  });
  const suggestedEnd = bestStart + duration;
  return {
    ...window,
    duration,
    availableDuration: available,
    suggestedStart: bestStart,
    suggestedEnd,
    suggestedText: `${window.label} ${formatMeetingTime(bestStart)}-${formatMeetingTime(suggestedEnd)}`,
    availableText: window.text || `${window.label} ${formatMeetingTime(window.start)}-${formatMeetingTime(window.end)}`,
    durationText: accountMeetingDurationText(duration),
    availableDurationText: accountMeetingDurationText(available),
  };
}

function accountMeetingSlotScore(slot) {
  if (!slot) return -Infinity;
  const center = (slot.suggestedStart + slot.suggestedEnd) / 2;
  const centerFit = 4 - Math.abs(center - 13 * 60) / 120;
  const durationFit = Math.min(slot.duration, 90) / 30;
  const edgePenalty = slot.suggestedStart < 9 * 60 || slot.suggestedEnd > 18 * 60 ? 1.5 : 0;
  const campusFit = slot.campusAligned ? 2 : -1;
  return centerFit + durationFit + campusFit - edgePenalty;
}

function accountRecommendedMeetingWindows(windows, limit = 3) {
  return (windows || [])
    .map(window => accountSuggestedMeetingSlot(window))
    .filter(Boolean)
    .sort((a, b) => (
      accountMeetingSlotScore(b) - accountMeetingSlotScore(a)
      || b.availableDuration - a.availableDuration
      || a.start - b.start
    ))
    .slice(0, limit);
}

function accountFriendPlanSummary(plan) {
  const payload = accountPlanPayload(plan);
  const current = accountCurrentPlanPayload();
  const friendCodes = accountPlanCourseCodes(payload);
  const currentCodes = new Set(accountPlanCourseCodes(current));
  const friendItems = accountSelectedSectionItems(payload.selectedSections || {});
  const currentItems = accountSelectedSectionItems(current.selectedSections || {});
  const overlaps = accountMeetingOverlapSummary(friendItems, currentItems);
  const sharedFreeWindows = accountSharedFreeWindows(friendItems, currentItems, { limit: 8 });
  const recommendedMeetingWindows = accountRecommendedMeetingWindows(sharedFreeWindows);
  return {
    majorName: payload.settings?.programName || payload.settings?.majorName || payload.majorId || 'Shared plan',
    courseCount: friendCodes.length,
    selectedCount: friendItems.length,
    sharedCourseCount: friendCodes.filter(code => currentCodes.has(code)).length,
    meetingOverlapCount: overlaps.count,
    meetingOverlapSamples: overlaps.samples,
    sharedFreeWindows,
    recommendedMeetingWindows,
  };
}

function accountFriendMeetingPlanText(plan, summary) {
  const owner = accountProfileLabel(plan?.owner_id, plan?.owner_id ? `friend ${accountShortId(plan.owner_id)}` : 'friend');
  const title = plan?.name || 'Friend plan';
  const picks = summary?.recommendedMeetingWindows || [];
  const conflict = summary?.meetingOverlapCount
    ? `${summary.meetingOverlapCount} picked-section overlap${summary.meetingOverlapCount === 1 ? '' : 's'} to review first.`
    : 'No picked-section overlaps.';
  if (!picks.length) {
    return `TerpTrack meeting plan for ${title} (${owner}): pick sections in both plans to find shared meeting windows. ${conflict}`;
  }
  const [best, ...backups] = picks;
  const backupText = backups.length ? ` Backups: ${backups.map(slot => slot.suggestedText).join('; ')}.` : '';
  return `TerpTrack meeting plan for ${title} (${owner}): best shared slot ${best.suggestedText} (${best.durationText}, inside ${best.availableText}).${backupText} ${conflict}`;
}

function accountFriendMeetingPlanHtml(summary, plan = null) {
  const picks = summary.recommendedMeetingWindows || [];
  if (!picks.length) {
    const empty = summary.selectedCount
      ? 'No meeting slot is available from picked sections. Try different sections or expand the day window.'
      : 'Pick sections in both plans to generate meeting suggestions.';
    return `
      <div class="account-meeting-plan empty">
        <div class="account-meeting-head">
          <strong>Meeting planner</strong>
          <span>Needs picked sections</span>
        </div>
        <p>${accountEscape(empty)}</p>
      </div>
    `;
  }
  const best = picks[0];
  const planId = String(plan?.id || '');
  return `
    <div class="account-meeting-plan">
      <div class="account-meeting-head">
        <strong>Meeting planner</strong>
        <span>${accountEscape(summary.meetingOverlapCount ? 'Review overlaps' : 'Ready to coordinate')}</span>
      </div>
      <div class="account-meeting-best">
        <b>${accountEscape(best.suggestedText)}</b>
        <span>${accountEscape(`${best.durationText} inside ${best.availableText}`)}</span>
      </div>
      <div class="account-meeting-options" aria-label="Backup meeting windows">
        ${picks.slice(1).map(slot => `<span>${accountEscape(slot.suggestedText)}</span>`).join('') || '<span>No backup needed</span>'}
      </div>
      ${planId ? `<button class="btn small account-meeting-copy" type="button" onclick="accountCopyFriendMeetingNote('${accountEscape(planId)}')">Copy meeting note</button>` : ''}
    </div>
  `;
}

function accountFriendPlanSummaryHtml(summary, plan = null) {
  const overlapText = summary.meetingOverlapSamples.length
    ? summary.meetingOverlapSamples.join(' · ')
    : (summary.selectedCount ? 'No picked-section overlaps with your current plan.' : 'Friend plan has no picked sections yet.');
  const freeText = (summary.sharedFreeWindows || []).length
    ? summary.sharedFreeWindows.map(window => window.text).join(' · ')
    : (summary.selectedCount ? 'No shared free windows found from picked sections.' : 'Pick sections in both plans to compare free time.');
  return `
    <div class="account-friend-compare">
      <span><strong>${accountEscape(summary.courseCount)}</strong> courses</span>
      <span><strong>${accountEscape(summary.selectedCount)}</strong> picked sections</span>
      <span><strong>${accountEscape(summary.sharedCourseCount)}</strong> shared courses</span>
      <span><strong>${accountEscape(summary.meetingOverlapCount)}</strong> meeting overlaps</span>
    </div>
    <em class="account-friend-overlaps">${accountEscape(overlapText)}</em>
    <em class="account-friend-free"><strong>Shared free windows</strong>${accountEscape(freeText)}</em>
    ${accountFriendMeetingPlanHtml(summary, plan)}
  `;
}

async function accountCopyFriendMeetingNote(id) {
  const plan = accountFriendPlans.find(item => String(item.id) === String(id));
  if (!plan) {
    accountSetStatus('Friend plan not found.', 'warn');
    return;
  }
  const summary = accountFriendPlanSummary(plan);
  const note = accountFriendMeetingPlanText(plan, summary);
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(note);
    const first = summary.recommendedMeetingWindows?.[0]?.suggestedText;
    accountSetStatus(first ? `Meeting note copied. Best slot: ${first}.` : 'Meeting note copied.', 'ok');
  } catch {
    accountSetStatus(`Meeting note ready: ${note}`, 'ok');
  }
}

function accountFriendStatusText(invite) {
  const direction = invite.direction === 'received' ? 'from' : 'to';
  const source = invite.source === 'cloud' ? 'cloud' : 'local';
  const person = accountProfileLabel(invite.userId, invite.email);
  return `${direction} ${person} · ${invite.status} · ${source}`;
}

function accountFriendInvitesHtml() {
  const invites = getAccountPrefs().friendInvites || [];
  if (!invites.length) {
    return '<p class="account-empty">No friend invites yet.</p>';
  }
  return `
    <div class="account-friend-list">
      ${invites.map(invite => {
        const canRespond = invite.direction === 'received' && invite.status === 'pending' && invite.cloudId;
        const stamp = accountTime(invite.updatedAt || invite.createdAt);
        return `
          <div class="account-friend-row">
            <div class="account-friend-info">
              <strong>${accountEscape(invite.direction === 'received' ? 'Incoming request' : 'Friend invite')}</strong>
              <span>${accountEscape(accountFriendStatusText(invite))}</span>
              ${invite.note ? `<em>${accountEscape(invite.note)}</em>` : ''}
              <small>${accountEscape(stamp)}</small>
            </div>
            <div class="account-friend-actions">
              ${canRespond ? `
                <button class="btn small" type="button" onclick="accountRespondToFriendInvite('${accountEscape(invite.cloudId)}','accepted')">Accept</button>
                <button class="btn small" type="button" onclick="accountRespondToFriendInvite('${accountEscape(invite.cloudId)}','declined')">Decline</button>
              ` : ''}
              <button class="btn small" type="button" onclick="accountRemoveFriendInvite('${accountEscape(invite.cloudId || invite.id)}')">Remove</button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function accountFriendPlansHtml() {
  if (!accountFriendPlans.length) {
    return '<p class="account-empty">No loaded friend plans.</p>';
  }
  return `
    <div class="account-friend-list">
      ${accountFriendPlans.map(plan => {
        const owner = accountProfileLabel(plan.owner_id, plan.owner_id ? `friend ${accountShortId(plan.owner_id)}` : 'friend');
        const summary = accountFriendPlanSummary(plan);
        return `
          <div class="account-friend-row">
            <div class="account-friend-info">
              <strong>${accountEscape(plan.name || 'Friend plan')}</strong>
              <span>${accountEscape(owner)} · ${accountEscape(summary.majorName)}</span>
              <small>Updated ${accountEscape(accountTime(plan.updated_at))}</small>
              ${accountFriendPlanSummaryHtml(summary, plan)}
            </div>
            <div class="account-friend-actions">
              <button class="btn small" type="button" onclick="accountOpenFriendPlan('${accountEscape(plan.id)}')">Open</button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

async function renderAccountModal() {
  const body = document.getElementById('account-body');
  if (!body) return;
  body.innerHTML = '<div class="account-loading">Checking account state...</div>';
  const config = await accountLoadConfig();
  const client = config.supabaseUrl ? await accountEnsureClient().catch(() => null) : null;
  const mode = accountSession?.user ? 'signed' : config.supabaseUrl ? 'ready' : 'local';
  accountSetTopbar(mode);

  const subtitle = document.getElementById('account-subtitle');
  if (subtitle) subtitle.textContent = mode === 'signed'
    ? accountSession.user.email || 'Signed in'
    : mode === 'ready' ? 'Cloud ready' : 'Local mode';
  const pill = document.getElementById('account-mode-pill');
  if (pill) {
    pill.textContent = mode === 'signed' ? 'Signed in' : mode === 'ready' ? 'Cloud ready' : 'Local';
    pill.className = `account-mode-pill ${mode}`;
  }

  const prefs = getAccountPrefs();
  const major = accountCurrentMajorInfo();
  const configHtml = `
    <div class="account-card">
      <div class="account-card-head">
        <strong>Cloud config</strong>
        <span>${accountEscape(accountConfigLabel(config.source))}</span>
      </div>
      <div class="account-kv">
        <span>Project</span><strong>${accountEscape(config.supabaseUrl || 'Not configured')}</strong>
        <span>Anon key</span><strong>${accountEscape(accountMask(config.supabaseAnonKey))}</strong>
      </div>
      <div class="account-config-grid">
        <label>Supabase URL<input type="url" id="account-config-url" value="${accountEscape(config.supabaseUrl)}" placeholder="https://project.supabase.co"></label>
        <label>Anon key<input type="password" id="account-config-key" value="${accountEscape(config.source === 'manual' ? config.supabaseAnonKey : '')}" placeholder="public anon key"></label>
      </div>
      <div class="account-actions">
        <button class="btn small" type="button" onclick="accountSaveManualConfig()">Save dev config</button>
        <button class="btn small" type="button" onclick="accountClearManualConfig()">Clear dev config</button>
        <button class="btn small" type="button" onclick="accountCopySchemaSql()">Copy schema SQL</button>
      </div>
      ${accountCloudSetupHtml(config, !!client)}
      ${accountSchemaChecklistHtml()}
    </div>
  `;

  const profileHtml = `
    <div class="account-card">
      <div class="account-card-head">
        <strong>Student profile</strong>
        <span>${accountEscape(major.name)}</span>
      </div>
      <label>Display name<input type="text" id="account-display-name" value="${accountEscape(prefs.displayName)}" placeholder="Name shown to friends"></label>
      <div class="account-kv compact">
        <span>Major</span><strong>${accountEscape(major.name)}</strong>
        <span>Profile</span><strong>${accountEscape((getProfilePrefs().interests || []).length ? getProfilePrefs().interests.join(', ') : 'Not personalized')}</strong>
      </div>
      <div class="account-actions">
        <button class="btn small" type="button" onclick="accountSaveProfile()">Save profile</button>
      </div>
    </div>
  `;

  const authHtml = accountSession?.user ? `
    <div class="account-card">
      <div class="account-card-head">
        <strong>Cloud plan</strong>
        <span>${accountEscape(accountSession.user.email || '')}</span>
      </div>
      <label>Plan name<input type="text" id="account-plan-name" value="${accountEscape(prefs.planName)}"></label>
      <div class="account-actions">
        <button class="btn primary" type="button" onclick="accountSaveCloudPlan()">Save current plan</button>
        <button class="btn" type="button" onclick="accountLoadCloudPlan()">Load cloud plan</button>
        <button class="btn" type="button" onclick="accountSignOut()">Sign out</button>
      </div>
      <div class="account-kv compact">
        <span>Last save</span><strong>${accountEscape(accountTime(prefs.lastCloudSaveAt))}</strong>
        <span>Last load</span><strong>${accountEscape(accountTime(prefs.lastCloudLoadAt))}</strong>
      </div>
    </div>
  ` : `
    <div class="account-card ${client ? '' : 'muted'}">
      <div class="account-card-head">
        <strong>Sign in</strong>
        <span>${client ? 'Magic link' : 'Needs config'}</span>
      </div>
      <label>Email<input type="email" id="account-email" placeholder="you@umd.edu" ${client ? '' : 'disabled'}></label>
      <div class="account-actions">
        <button class="btn primary" type="button" onclick="accountSendMagicLink()" ${client ? '' : 'disabled'}>Send sign-in link</button>
      </div>
    </div>
  `;

  const friendsHtml = `
    <div class="account-card">
      <div class="account-card-head">
        <strong>Friends & shared plans</strong>
        <span>${accountSession?.user ? 'Cloud friends' : 'Local invites'}</span>
      </div>
      <div class="account-config-grid">
        <label>Friend email<input type="email" id="account-friend-email" value="${accountEscape(prefs.friendInviteEmail)}" placeholder="friend@umd.edu"></label>
        <label>Note<input type="text" id="account-friend-note" value="${accountEscape(prefs.friendInviteNote)}" placeholder="optional"></label>
      </div>
      <div class="account-actions">
        <button class="btn small" type="button" onclick="accountCreateFriendInvite()">Add invite</button>
        <button class="btn small" type="button" onclick="copyShareUrl()">Copy link</button>
        <button class="btn small" type="button" onclick="accountSyncFriends()" ${accountSession?.user ? '' : 'disabled'}>Sync requests</button>
        <button class="btn small" type="button" onclick="accountPublishFriendPlan()" ${accountSession?.user ? '' : 'disabled'}>Publish to friends</button>
        <button class="btn small" type="button" onclick="accountLoadFriendPlans()" ${accountSession?.user ? '' : 'disabled'}>Load friend plans</button>
      </div>
      <div class="account-kv compact">
        <span>Last sync</span><strong>${accountEscape(accountTime(prefs.lastFriendSyncAt))}</strong>
        <span>Published</span><strong>${accountEscape(accountTime(prefs.lastFriendPlanPublishAt))}</strong>
      </div>
      <div class="account-subsection">
        <strong>Requests</strong>
        ${accountFriendInvitesHtml()}
      </div>
      <div class="account-subsection">
        <strong>Friend plans</strong>
        ${accountFriendPlansHtml()}
      </div>
    </div>
  `;

  body.innerHTML = `${accountStatsHtml()}${configHtml}${profileHtml}${authHtml}${friendsHtml}`;
}

function openAccountModal() {
  const modal = document.getElementById('account-modal');
  if (!modal) return;
  modal.classList.add('open');
  accountSetStatus('');
  renderAccountModal();
}

function closeAccountModal() {
  document.getElementById('account-modal')?.classList.remove('open');
}

function accountRenderTopbar() {
  accountLoadConfig().then(config => {
    const mode = accountSession?.user ? 'signed' : config.supabaseUrl ? 'ready' : 'local';
    accountSetTopbar(mode);
  });
}

function initAccount() {
  const btn = document.getElementById('account-btn');
  if (btn && !btn.dataset.ready) {
    btn.dataset.ready = 'true';
    btn.addEventListener('click', openAccountModal);
  }
  const modal = document.getElementById('account-modal');
  if (modal && !modal.dataset.ready) {
    modal.dataset.ready = 'true';
    modal.addEventListener('click', e => {
      if (e.target.id === 'account-modal') closeAccountModal();
    });
  }
  getAccountPrefs();
  accountLoadConfig()
    .then(config => (config.supabaseUrl ? accountEnsureClient() : null))
    .catch(() => null)
    .finally(accountRenderTopbar);
}
