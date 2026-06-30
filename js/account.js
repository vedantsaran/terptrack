'use strict';
/* ============================================================
   ACCOUNT + CLOUD SYNC READINESS
   ============================================================ */

const ACCOUNT_CONFIG_STORAGE = 'terp-track-supabase-config';
const ACCOUNT_SDK_URL = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
let accountConfigPromise = null;
let accountClient = null;
let accountSession = null;
let accountAuthListenerReady = false;
let accountConfig = { source: 'none', supabaseUrl: '', supabaseAnonKey: '' };

function accountEscape(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

function accountDefaultPrefs() {
  return { planName: 'Primary TerpTrack plan', lastCloudSaveAt: '', lastCloudLoadAt: '' };
}

function getAccountPrefs() {
  state.accountPrefs = { ...accountDefaultPrefs(), ...(state.accountPrefs || {}) };
  return state.accountPrefs;
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
    settings: { ...DEFAULT_SETTINGS, ...(cloudState.settings || {}) },
    customCourses: cloudState.customCourses || [],
    customSemesters: cloudState.customSemesters || [],
    customMajors: cloudState.customMajors || [],
    selectedSections: cloudState.selectedSections || {},
    schedulePrefs: cloudState.schedulePrefs || {},
    scheduleAdvisorFilter: ['all', 'remaining', 'gened', 'blockers'].includes(cloudState.scheduleAdvisorFilter) ? cloudState.scheduleAdvisorFilter : 'all',
    scheduleOutputPreset: ['personal', 'advisor', 'registrar', 'custom'].includes(cloudState.scheduleOutputPreset) ? cloudState.scheduleOutputPreset : 'personal',
    scheduleOutputOptions: { preferences: true, warnings: true, unscheduled: true, recentChanges: true, ...(cloudState.scheduleOutputOptions || {}) },
    roadmapPrefs: { filter: 'all', query: '', selectedCode: '', ...(cloudState.roadmapPrefs || {}) },
    recentChanges: Array.isArray(cloudState.recentChanges) ? cloudState.recentChanges.slice(0, 12) : [],
    accountPrefs: { ...getAccountPrefs(), ...(cloudState.accountPrefs || {}) },
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

  body.innerHTML = `${accountStatsHtml()}${configHtml}${authHtml}`;
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
