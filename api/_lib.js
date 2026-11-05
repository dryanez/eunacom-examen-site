// Shared server helpers for the /api functions (Vercel). Secrets only come from env vars:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY      — the examen site's own Supabase project
//   PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_ENV ('live' | 'sandbox', default live)
//   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BOOKS_BUCKET — PRIVATE bucket with libros/<path>
import { createRequire } from 'node:module';
import { createClient } from '@supabase/supabase-js';
import { devDb } from './_devdb.js';

const require = createRequire(import.meta.url);
export const CATALOG = require('./_catalog.json');

export const CLP_PER_USD = 920;
export const usdFor = clp => (Math.max(0.99, Math.ceil(clp / CLP_PER_USD) - 0.01)).toFixed(2);

let admin;
export function db() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return process.env.AEE_DEV_DB === '1' ? devDb : null;
  admin ||= createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  return admin;
}

// The signed-in user from "Authorization: Bearer <supabase access token>" (null when missing/invalid).
export async function userFrom(req) {
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token || !db()) return null;
  const { data } = await db().auth.getUser(token);
  return data?.user || null;
}

// Every single item a list of purchased SKUs unlocks (packs expanded).
export function expand(skus) {
  const out = new Set();
  for (const s of skus) for (const i of CATALOG.products[s]?.includes || [s]) out.add(i);
  return out;
}

export async function ownedItems(email) {
  const { data } = await db().from('aee_purchases').select('sku').eq('status', 'paid').ilike('email', email);
  const skus = [...new Set((data || []).map(r => r.sku))];
  return { skus, items: expand(skus) };
}

// ── PayPal ──────────────────────────────────────────────────────────────────
const PAYPAL_API = process.env.PAYPAL_ENV === 'sandbox' ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';
export async function paypal(pathname, body) {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
  const t = await fetch(`${PAYPAL_API}/v1/oauth2/token`, { method: 'POST', headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=client_credentials' });
  if (!t.ok) throw new Error(`paypal auth ${t.status}`);
  const { access_token } = await t.json();
  const r = await fetch(`${PAYPAL_API}${pathname}`, { method: 'POST', headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const json = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(`paypal ${r.status}`), { details: json });
  return json;
}

export function bad(res, status, error) { res.status(status).json({ error }); }

export async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = []; for await (const c of req) chunks.push(c);
  try { return JSON.parse(Buffer.concat(chunks).toString() || '{}'); } catch { return {}; }
}
