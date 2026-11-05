// The site's own accounts (see api/_auth.js). The browser keeps the session token and sends it as
// "Authorization: Bearer <token>".
//   GET  /api/auth                                   → { user, profile }  (401 when signed out)
//   POST { action: 'signup', email, password, name } → { verify: true }    (confirmation email sent)
//   POST { action: 'verify', token }                 → { token, user, profile }
//   POST { action: 'signin', email, password }       → { token, user, profile }
//   POST { action: 'reset-request', email }          → { ok: true }        (always, so emails can't be probed)
//   POST { action: 'reset', token, password }        → { token, user, profile }
//   POST { action: 'signout' }                       → { ok: true }
//   POST { action: 'profile', ...fields }            → { profile }
//   POST { action: 'xp', kind, ref, points }         → { xp }
//   GET  /api/auth?providers                         → { google, apple }   (which quick sign-ins are configured)
//   POST { action: 'activate-info', token }          → { email, hasAccount }  (link from the purchase email)
//   POST { action: 'activate', token, password, name } → { token, user, profile }  (no confirmation step: the link
//                                                       came to their inbox)
//   POST { action: 'login', token }                  → { token, user, profile }  (hand-off after Google / Apple)
//   Google / Apple: api/_oauth.js
import { db, bad, readBody, userFrom } from './_lib.js';
import { hashPassword, checkPassword, issueToken, useToken, dropToken } from './_auth.js';
import { sendMail, verifyEmail, resetEmail } from './_emails.js';
import { oauthStart, providers } from './_oauth.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SITE = (process.env.SITE_URL || 'https://eunacom-examen.cl').replace(/\/$/, '');
const PROFILE_FIELDS = ['full_name', 'phone', 'country', 'city', 'university', 'exam_date', 'heard_from', 'onboarded'];
const bearer = req => String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');

async function profileOf(id) {
  const { data } = await db().from('aee_profiles').select('*').eq('id', id).maybeSingle();
  return data || null;
}
async function signedIn(res, user) {
  const token = await issueToken(db(), user.id, 'session');
  await db().from('aee_users').update({ last_sign_in_at: new Date().toISOString() }).eq('id', user.id);
  return res.json({ token, user: { id: user.id, email: user.email }, profile: await profileOf(user.id) });
}
async function sendVerify(user, name) {
  const link = `${SITE}/?verify=${await issueToken(db(), user.id, 'verify')}`;
  await sendMail({ to: user.email, ...verifyEmail({ name: name ?? (await profileOf(user.id))?.full_name, link }), link });
}

export default async function handler(req, res) {
  if (!db()) return bad(res, 503, 'Las cuentas aún no están conectadas.');

  const q = req.query || {};
  if (q.oauth) return oauthStart(req, res);
  if (req.method === 'GET' && 'providers' in q) return res.json(providers());

  if (req.method === 'GET') {
    const user = await userFrom(req);
    if (!user?.id) return bad(res, 401, 'Inicia sesión');
    return res.json({ user: { id: user.id, email: user.email }, profile: await profileOf(user.id) });
  }
  if (req.method !== 'POST') return bad(res, 405, 'GET o POST');
  const b = await readBody(req);
  const email = String(b.email || '').trim().toLowerCase();
  const password = String(b.password || '');

  try {
    if (b.action === 'signup') {
      if (!EMAIL.test(email)) return bad(res, 400, 'Correo inválido');
      if (password.length < 8) return bad(res, 400, 'La contraseña debe tener al menos 8 caracteres');
      const { data: existing } = await db().from('aee_users').select('id, email, email_verified_at').ilike('email', email).maybeSingle();
      if (existing?.email_verified_at) return bad(res, 409, 'Ese correo ya tiene cuenta. Inicia sesión.');
      let user = existing;
      if (existing) { // signed up before but never confirmed: take the new password, send a fresh link
        await db().from('aee_users').update({ password_hash: await hashPassword(password) }).eq('id', existing.id);
      } else {
        const { data, error } = await db().from('aee_users').insert({ email, password_hash: await hashPassword(password) }).select('id, email').single();
        if (error) return bad(res, 409, 'Ese correo ya tiene cuenta. Inicia sesión.');
        user = data;
        await db().from('aee_profiles').insert({ id: user.id, email, full_name: String(b.name || '').slice(0, 120) });
      }
      await sendVerify(user, String(b.name || ''));
      return res.json({ verify: true });
    }

    if (b.action === 'verify') {
      const user = await useToken(db(), String(b.token || ''), 'verify');
      if (!user) return bad(res, 400, 'El link expiró o ya se usó. Inicia sesión para recibir uno nuevo.');
      if (!user.email_verified_at) await db().from('aee_users').update({ email_verified_at: new Date().toISOString() }).eq('id', user.id);
      return signedIn(res, user);
    }

    if (b.action === 'signin') {
      const { data: user } = await db().from('aee_users').select('id, email, password_hash, email_verified_at').ilike('email', email).maybeSingle();
      if (!user || !(await checkPassword(password, user.password_hash))) return bad(res, 401, 'Correo o contraseña incorrectos.');
      if (!user.email_verified_at) { await sendVerify(user); return bad(res, 403, 'Confirma tu correo primero: te enviamos un link nuevo.'); }
      return signedIn(res, user);
    }

    if (b.action === 'reset-request') {
      const { data: user } = await db().from('aee_users').select('id, email').ilike('email', email).maybeSingle();
      if (user) {
        const link = `${SITE}/?reset=${await issueToken(db(), user.id, 'reset')}#entrar`;
        await sendMail({ to: user.email, ...resetEmail({ name: (await profileOf(user.id))?.full_name, link }), link });
      }
      return res.json({ ok: true });
    }

    if (b.action === 'reset') {
      if (password.length < 8) return bad(res, 400, 'La contraseña debe tener al menos 8 caracteres');
      const user = await useToken(db(), String(b.token || ''), 'reset');
      if (!user) return bad(res, 400, 'El link expiró o ya se usó. Pide uno nuevo.');
      // The link came to their inbox, so the email is confirmed too. Old sessions end.
      await db().from('aee_users').update({ password_hash: await hashPassword(password), email_verified_at: user.email_verified_at || new Date().toISOString() }).eq('id', user.id);
      await db().from('aee_tokens').delete().eq('user_id', user.id).eq('kind', 'session');
      return signedIn(res, user);
    }

    if (b.action === 'activate-info') {
      const t = await useToken(db(), String(b.token || ''), 'activate', { keep: true });
      if (!t) return bad(res, 400, 'El link expiró. Crea tu cuenta con el correo de tu compra.');
      const { data: u } = await db().from('aee_users').select('email_verified_at').ilike('email', t.email).maybeSingle();
      return res.json({ email: t.email, hasAccount: !!u?.email_verified_at });
    }

    if (b.action === 'activate') {
      if (password.length < 8) return bad(res, 400, 'La contraseña debe tener al menos 8 caracteres');
      const t = await useToken(db(), String(b.token || ''), 'activate', { keep: true });
      if (!t) return bad(res, 400, 'El link expiró. Crea tu cuenta con el correo de tu compra.');
      const { data: existing } = await db().from('aee_users').select('id, email, email_verified_at').ilike('email', t.email).maybeSingle();
      if (existing?.email_verified_at) return bad(res, 409, 'Ese correo ya tiene cuenta. Inicia sesión.');
      await useToken(db(), String(b.token), 'activate'); // consume it now
      const now = new Date().toISOString();
      let user = existing;
      if (existing) await db().from('aee_users').update({ password_hash: await hashPassword(password), email_verified_at: now }).eq('id', existing.id);
      else {
        const { data, error } = await db().from('aee_users').insert({ email: t.email, password_hash: await hashPassword(password), email_verified_at: now }).select('id, email').single();
        if (error) return bad(res, 409, 'Ese correo ya tiene cuenta. Inicia sesión.');
        user = data;
        await db().from('aee_profiles').insert({ id: user.id, email: t.email, full_name: String(b.name || '').slice(0, 120) });
      }
      return signedIn(res, user);
    }

    if (b.action === 'login') {
      const user = await useToken(db(), String(b.token || ''), 'login');
      if (!user?.id) return bad(res, 400, 'No se pudo entrar. Inténtalo de nuevo.');
      return signedIn(res, user);
    }

    if (b.action === 'signout') {
      if (bearer(req)) await dropToken(db(), bearer(req));
      return res.json({ ok: true });
    }

    const user = await userFrom(req);
    if (!user?.id) return bad(res, 401, 'Inicia sesión');

    if (b.action === 'profile') {
      const patch = Object.fromEntries(PROFILE_FIELDS.filter(k => k in b).map(k => [k, k === 'onboarded' ? !!b[k] : String(b[k] ?? '').slice(0, 200)]));
      const { data } = await db().from('aee_profiles').update(patch).eq('id', user.id).select().single();
      return res.json({ profile: data });
    }

    if (b.action === 'xp') {
      const points = Math.round(Number(b.points));
      if (!(points >= 0 && points <= 200)) return bad(res, 400, 'Puntos inválidos');
      // Onboarding XP only once.
      if (b.kind === 'onboarding') {
        const { data: prev } = await db().from('aee_xp_events').select('id').eq('user_id', user.id).eq('kind', 'onboarding').limit(1);
        if (prev?.length) return res.json({ xp: (await profileOf(user.id))?.xp ?? 0 });
      }
      const { data, error } = await db().rpc('aee_award_xp', { p_user: user.id, p_kind: String(b.kind || '').slice(0, 40), p_ref: String(b.ref || '').slice(0, 120), p_points: points });
      if (error) throw new Error(error.message);
      return res.json({ xp: data });
    }
  } catch (e) {
    console.error('[auth]', e.message);
    return bad(res, 500, 'No se pudo completar. Inténtalo de nuevo.');
  }
  return bad(res, 400, 'Acción desconocida');
}
