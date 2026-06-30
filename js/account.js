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
        return `
          <div class="account-friend-row">
            <div class="account-friend-info">
              <strong>${accountEscape(plan.name || 'Friend plan')}</strong>
              <span>${accountEscape(owner)}</span>
              <small>Updated ${accountEscape(accountTime(plan.updated_at))}</small>
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
      </div>
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
