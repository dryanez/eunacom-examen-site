// "Continuar con Google / Apple" for the site's OWN accounts (aee_users), without Supabase Auth.
//   GET /api/auth?oauth=google[&activar=<token>]   → redirect to Google
//   GET /api/google-callback                        ← Google; finds or creates the account, then
//                                                     redirects to /?login=<5-min token>#mi-cuenta (or #bienvenida)
//   Apple is the same with oauth=apple / apple-callback (Apple answers with a POST form).
// Env: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
//      APPLE_SERVICE_ID, APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY (the .p8 contents, \n allowed)
// Redirect URIs to register: <SITE_URL>/api/google-callback and <SITE_URL>/api/apple-callback (Google won't take a ?query)
//
// With an `activar` link (from the purchase email) the account is created with the PURCHASE email, whatever the
// Google / Apple email is, so the purchase always shows up.
import { randomBytes, createSign } from 'node:crypto';
import { db } from './_lib.js';
import { issueToken, useToken } from './_auth.js';

const SITE = () => (process.env.SITE_URL || 'https://eunacom-examen.cl').replace(/\/$/, '');
const callback = p => `${SITE()}/api/${p}-callback`;
export const providers = () => ({
  google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  apple: !!(process.env.APPLE_SERVICE_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID && process.env.APPLE_PRIVATE_KEY),
});

const redirect = (res, url) => { res.statusCode = 302; res.setHeader('Location', url); res.end(); };
const fail = (res, msg) => redirect(res, `${SITE()}/?auth_error=${encodeURIComponent(msg)}#entrar`);
const cookies = req => Object.fromEntries(String(req.headers.cookie || '').split(/;\s*/).filter(Boolean).map(c => { const i = c.indexOf('='); return [c.slice(0, i), decodeURIComponent(c.slice(i + 1))]; }));
// Apple posts back cross-site, so its cookie needs SameSite=None (and Secure, which localhost http tolerates).
const setState = (res, provider, val) => res.setHeader('Set-Cookie', `aee_oauth=${encodeURIComponent(val)}; Path=/api; Max-Age=600; HttpOnly; ${provider === 'apple' ? 'SameSite=None; Secure' : 'SameSite=Lax'}${SITE().startsWith('https') ? '; Secure' : ''}`);
const jwtPayload = jwt => JSON.parse(Buffer.from(String(jwt).split('.')[1] || '', 'base64url').toString() || '{}');

export function oauthStart(req, res) {
  const provider = req.query.oauth;
  if (!providers()[provider]) return fail(res, 'Ese método de acceso aún no está disponible.');
  const state = randomBytes(16).toString('base64url');
  setState(res, provider, JSON.stringify({ state, activar: String(req.query.activar || '') }));
  if (provider === 'google') {
    return redirect(res, `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID, redirect_uri: callback('google'), response_type: 'code',
      scope: 'openid email profile', state, prompt: 'select_account',
    })}`);
  }
  return redirect(res, `https://appleid.apple.com/auth/authorize?${new URLSearchParams({
    client_id: process.env.APPLE_SERVICE_ID, redirect_uri: callback('apple'), response_type: 'code',
    scope: 'name email', response_mode: 'form_post', state,
  })}`);
}

// Apple's client_secret is a short JWT signed with the team's key (ES256).
function appleSecret() {
  const now = Math.floor(Date.now() / 1000);
  const enc = o => Buffer.from(JSON.stringify(o)).toString('base64url');
  const head = enc({ alg: 'ES256', kid: process.env.APPLE_KEY_ID });
  const body = enc({ iss: process.env.APPLE_TEAM_ID, iat: now, exp: now + 300, aud: 'https://appleid.apple.com', sub: process.env.APPLE_SERVICE_ID });
  const sig = createSign('SHA256').update(`${head}.${body}`).sign({ key: process.env.APPLE_PRIVATE_KEY.replace(/\\n/g, '\n'), dsaEncoding: 'ieee-p1363' });
  return `${head}.${body}.${sig.toString('base64url')}`;
}

async function readForm(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = []; for await (const c of req) chunks.push(c);
  return Object.fromEntries(new URLSearchParams(Buffer.concat(chunks).toString()));
}

export async function oauthCallback(req, res, provider) {
  if (!providers()[provider]) return fail(res, 'Ese método de acceso aún no está disponible.');
  const p = provider === 'apple' ? await readForm(req) : req.query;
  let saved = {};
  try { saved = JSON.parse(cookies(req).aee_oauth || '{}'); } catch { /* none */ }
  res.setHeader('Set-Cookie', 'aee_oauth=; Path=/api; Max-Age=0');
  if (!p.code || !saved.state || p.state !== saved.state) return fail(res, 'No se pudo entrar. Inténtalo de nuevo.');

  // Exchange the code straight with Google / Apple (TLS), so the id_token in the answer can be trusted as is.
  const r = await fetch(provider === 'google' ? 'https://oauth2.googleapis.com/token' : 'https://appleid.apple.com/auth/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code: p.code, grant_type: 'authorization_code', redirect_uri: callback(provider),
      client_id: provider === 'google' ? process.env.GOOGLE_CLIENT_ID : process.env.APPLE_SERVICE_ID,
      client_secret: provider === 'google' ? process.env.GOOGLE_CLIENT_SECRET : appleSecret(),
    }),
  });
  const tok = await r.json().catch(() => ({}));
  if (!r.ok || !tok.id_token) { console.error('[oauth]', provider, r.status, tok.error); return fail(res, 'No se pudo entrar. Inténtalo de nuevo.'); }
  const id = jwtPayload(tok.id_token);
  const verified = id.email_verified === true || id.email_verified === 'true';
  if (!id.sub || !id.email || !verified) return fail(res, 'Tu cuenta no tiene un correo confirmado.');
  let name = id.name || '';
  if (provider === 'apple' && p.user) { try { const u = JSON.parse(p.user).name || {}; name = [u.firstName, u.lastName].filter(Boolean).join(' '); } catch { /* first sign-in only */ } }

  try {
    const user = await findOrCreate({ provider, sub: id.sub, email: id.email.toLowerCase(), name, activar: saved.activar });
    const { data: prof } = await db().from('aee_profiles').select('onboarded').eq('id', user.id).maybeSingle();
    const login = await issueToken(db(), user.id, 'login');
    return redirect(res, `${SITE()}/?login=${login}#${prof?.onboarded ? 'mi-cuenta' : 'bienvenida'}`);
  } catch (e) {
    console.error('[oauth]', e.message);
    return fail(res, 'No se pudo entrar. Inténtalo de nuevo.');
  }
}

async function findOrCreate({ provider, sub, email, name, activar }) {
  const col = `${provider}_sub`;
  const now = new Date().toISOString();
  // From the purchase email: the account uses the purchase email (proved by the link).
  const act = activar ? await useToken(db(), activar, 'activate') : null;
  const accountEmail = act?.email || email;

  const { data: bySub } = await db().from('aee_users').select('id, email').eq(col, sub).maybeSingle();
  if (bySub && !act) return bySub;
  if (act) {
    // Paid with another email (PayPal / Mercado Pago) that has no account, but this Google / Apple login already has
    // one: move the purchase into that account instead of making a second one.
    const { data: purchaseAcct } = await db().from('aee_users').select('id').ilike('email', act.email).maybeSingle();
    const mine = bySub || (await db().from('aee_users').select('id, email').ilike('email', email).maybeSingle()).data;
    if (!purchaseAcct && mine) {
      await db().from('aee_purchases').update({ email: mine.email }).ilike('email', act.email);
      if (!bySub) await db().from('aee_users').update({ [col]: sub, email_verified_at: now }).eq('id', mine.id);
      return mine;
    }
  }
  const { data: byEmail } = await db().from('aee_users').select('id, email, email_verified_at').ilike('email', accountEmail).maybeSingle();
  if (byEmail) {
    // The provider (or the purchase link) proves this inbox: confirm it and remember the provider.
    await db().from('aee_users').update({ email_verified_at: byEmail.email_verified_at || now, ...(bySub ? {} : { [col]: sub }) }).eq('id', byEmail.id);
    return byEmail;
  }
  const { data: user, error } = await db().from('aee_users').insert({ email: accountEmail, email_verified_at: now, ...(bySub ? {} : { [col]: sub }) }).select('id, email').single();
  if (error) throw new Error(error.message);
  await db().from('aee_profiles').insert({ id: user.id, email: accountEmail, full_name: name.slice(0, 120) });
  return user;
}
