// The site's own accounts (aee_users), separate from the EUNACOM app's Supabase Auth users.
// Passwords: scrypt. Sessions and one-time links: random tokens; only their SHA-256 is stored (aee_tokens).
// Emails: api/_emails.js (Amazon SES).
import { randomBytes, scrypt as scryptCb, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCb);
export const SESSION_DAYS = 60;
const TTL = { session: SESSION_DAYS * 864e5, verify: 3 * 864e5, reset: 2 * 36e5, activate: 7 * 864e5, login: 5 * 6e4 };

export async function hashPassword(pw) {
  const salt = randomBytes(16);
  const key = await scrypt(pw, salt, 64);
  return `scrypt$${salt.toString('base64')}$${key.toString('base64')}`;
}
export async function checkPassword(pw, stored) {
  if (!stored) return false; // Google / Apple-only account
  const [alg, salt, key] = String(stored || '').split('$');
  if (alg !== 'scrypt' || !salt || !key) return false;
  const want = Buffer.from(key, 'base64');
  const got = await scrypt(pw, Buffer.from(salt, 'base64'), want.length);
  return timingSafeEqual(want, got);
}

const sha = t => createHash('sha256').update(t).digest('hex');

// owner: a user id, or { email } for links sent before the account exists ('activate').
export async function issueToken(db, owner, kind) {
  const token = randomBytes(32).toString('base64url');
  const who = typeof owner === 'string' ? { user_id: owner } : { email: owner.email.toLowerCase() };
  if (!['session', 'activate'].includes(kind)) await db.from('aee_tokens').delete().match({ ...who, kind }); // one live link per kind (each purchase email keeps its own)
  const { error } = await db.from('aee_tokens').insert({ token_hash: sha(token), ...who, kind, expires_at: new Date(Date.now() + TTL[kind]).toISOString() });
  if (error) throw new Error(`token: ${error.message}`);
  return token;
}

// → the user row (or { email } for an 'activate' link with no account yet), or null. One-time links are consumed.
export async function useToken(db, token, kind, { keep = false } = {}) {
  if (!token) return null;
  const { data: t } = await db.from('aee_tokens').select('user_id, email, expires_at').eq('token_hash', sha(token)).eq('kind', kind).maybeSingle();
  if (!t || new Date(t.expires_at) < new Date()) return null;
  if (kind !== 'session' && !keep) await db.from('aee_tokens').delete().eq('token_hash', sha(token));
  if (!t.user_id) return { email: t.email };
  const { data: u } = await db.from('aee_users').select('id, email, email_verified_at').eq('id', t.user_id).maybeSingle();
  return u || null;
}
export const dropToken = (db, token) => db.from('aee_tokens').delete().eq('token_hash', sha(token));
