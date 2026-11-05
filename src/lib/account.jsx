import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

// The site's own accounts (api/auth.js), separate from the EUNACOM app's users. The browser only keeps the session
// token; everything else (profile, purchases, XP) comes from the site's server.

// XP levels (EUNACOM career ladder).
export const LEVELS = [
  { min: 0, name: 'Estudiante' }, { min: 500, name: 'Interno' }, { min: 2000, name: 'Médico general' },
  { min: 5000, name: 'Becado' }, { min: 10000, name: 'Especialista' }, { min: 20000, name: 'Leyenda EUNACOM' },
];
export const levelFor = xp => {
  const i = LEVELS.findLastIndex(l => xp >= l.min);
  const next = LEVELS[i + 1];
  return { ...LEVELS[i], index: i + 1, next, progress: next ? (xp - LEVELS[i].min) / (next.min - LEVELS[i].min) : 1 };
};

const TOKEN_KEY = 'aee-session';
const readToken = () => (typeof localStorage === 'undefined' ? null : localStorage.getItem(TOKEN_KEY));

// POST /api/auth; rejects with the server's Spanish error message.
async function auth(body, token) {
  const r = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || 'No se pudo completar. Inténtalo de nuevo.');
  return j;
}

const Ctx = createContext(null);

export function AccountProvider({ children }) {
  const [token, setToken] = useState(readToken);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [owned, setOwned] = useState({ skus: [], items: new Set() });
  const [ready, setReady] = useState(!readToken());

  const startSession = useCallback(r => {
    localStorage.setItem(TOKEN_KEY, r.token);
    setToken(r.token); setUser(r.user); setProfile(r.profile);
  }, []);
  const endSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null); setUser(null); setProfile(null); setOwned({ skus: [], items: new Set() });
  }, []);

  const authHeader = useCallback(() => ({
    Authorization: `Bearer ${token || ''}`,
    // solo en vite dev sin Supabase: localStorage 'aee-dev-email' entra como ese correo (ver api/_lib.js userFrom)
    ...(import.meta.env.DEV && localStorage.getItem('aee-dev-email') ? { 'x-dev-email': localStorage.getItem('aee-dev-email') } : {}),
  }), [token]);

  // Who is signed in + what they own (/api/library: the same check that guards books and classes).
  const refresh = useCallback(async () => {
    if (!token) { setReady(true); return; }
    const headers = { Authorization: `Bearer ${token}` };
    const me = await fetch('/api/auth', { headers }).catch(() => null);
    if (me?.status === 401) { endSession(); setReady(true); return; }
    if (me?.ok) { const j = await me.json(); setUser(j.user); setProfile(j.profile); }
    const lib = await fetch('/api/library', { headers }).then(r => (r.ok ? r.json() : null)).catch(() => null);
    setOwned({ skus: lib?.skus || [], items: new Set(lib?.items || []) });
    setReady(true);
  }, [token, endSession]);

  useEffect(() => { refresh(); }, [refresh]);
  // A purchase finished in another tab (or the thank-you page) shows up without reloading.
  useEffect(() => {
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refresh]);

  // Links that land on the site: ?verify= (confirmation email), ?login= (back from Google / Apple),
  // ?auth_error= (Google / Apple said no). ?activar= and ?reset= are read by AuthCard.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const [action, tok] = q.get('verify') ? ['verify', q.get('verify')] : q.get('login') ? ['login', q.get('login')] : [];
    const err = q.get('auth_error');
    if (!tok && !err) return;
    history.replaceState(null, '', window.location.pathname + window.location.hash);
    if (err) { sessionStorage.setItem('aee-auth-msg', err); window.dispatchEvent(new Event('hashchange')); return; }
    const goTo = window.location.hash;
    auth({ action, token: tok })
      .then(r => { startSession(r); window.location.hash = action === 'login' ? goTo : (r.profile?.onboarded ? '#mi-cuenta' : '#bienvenida'); })
      .catch(e => { sessionStorage.setItem('aee-auth-msg', e.message); window.location.hash = '#entrar'; });
  }, [startSession]);

  // Which quick sign-ins (Google / Apple) the server has keys for.
  const [providers, setProviders] = useState({ google: false, apple: false });
  useEffect(() => { fetch('/api/auth?providers').then(r => (r.ok ? r.json() : null)).then(p => p && setProviders(p)).catch(() => {}); }, []);

  const value = {
    enabled: true, ready, user, profile, owned, refresh, authHeader, providers,
    activateInfo: t => auth({ action: 'activate-info', token: t }),
    activate: async (t, password, name) => startSession(await auth({ action: 'activate', token: t, password, name })),
    signUp: (email, password, name) => auth({ action: 'signup', email, password, name }),
    signIn: async (email, password) => startSession(await auth({ action: 'signin', email, password })),
    requestReset: email => auth({ action: 'reset-request', email }),
    resetPassword: async (resetToken, password) => startSession(await auth({ action: 'reset', token: resetToken, password })),
    signOut: async () => { await auth({ action: 'signout' }, token).catch(() => {}); endSession(); },
    updateProfile: async fields => { const r = await auth({ action: 'profile', ...fields }, token); setProfile(r.profile); },
    awardXp: async (kind, ref, points) => {
      if (!token) return;
      const r = await auth({ action: 'xp', kind, ref, points }, token).catch(() => null);
      if (typeof r?.xp === 'number') setProfile(p => p && { ...p, xp: r.xp });
    },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAccount = () => useContext(Ctx);
