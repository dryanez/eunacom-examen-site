import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { PRODUCTS } from '../data/tienda';

// The examen site's own Supabase project (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env.local).
// Without them the site still works as a shop window; account features show a "coming soon" state.
const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = URL && KEY ? createClient(URL, KEY) : null;

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

const Ctx = createContext(null);

export function AccountProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [owned, setOwned] = useState({ skus: [], items: new Set() });
  const [ready, setReady] = useState(!supabase);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      // Back from an email link (?next=bienvenida): clean the URL and go to that page.
      const next = new URLSearchParams(window.location.search).get('next');
      if (s && next && /^[a-z-]+$/.test(next)) {
        history.replaceState(null, '', window.location.pathname);
        window.location.hash = `#${next}`;
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const refresh = useCallback(async () => {
    if (!supabase || !session?.user) { setProfile(null); setOwned({ skus: [], items: new Set() }); return; }
    const [{ data: p }, { data: rows }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', session.user.id).single(),
      supabase.from('purchases').select('sku').eq('status', 'paid'),
    ]);
    setProfile(p || null);
    const skus = [...new Set((rows || []).map(r => r.sku))];
    const items = new Set(skus.flatMap(s => PRODUCTS[s]?.includes || [s]));
    // The full course unlocks what Pack Total unlocks.
    if (skus.some(s => s.startsWith('curso-'))) PRODUCTS['pack-total'].includes.forEach(i => items.add(i));
    setOwned({ skus, items });
  }, [session?.user?.id]);

  useEffect(() => { refresh(); }, [refresh]);

  const value = {
    enabled: !!supabase, ready, session, user: session?.user || null, profile, owned, refresh,
    signOut: () => supabase?.auth.signOut(),
    authHeader: () => ({ Authorization: `Bearer ${session?.access_token || ''}` }),
    awardXp: async (kind, ref, points) => {
      if (!supabase || !session) return;
      const { data } = await supabase.rpc('award_xp', { p_kind: kind, p_ref: ref, p_points: points });
      if (typeof data === 'number') setProfile(p => p && { ...p, xp: data });
    },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAccount = () => useContext(Ctx);
