// Dev only (vite dev server, no Supabase keys): a tiny JSON-file stand-in for the Supabase tables the checkout uses
// (orders, purchases), so payments can be tried locally. Never used on Vercel: _lib.js only loads it when AEE_DEV_DB=1.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const FILE = process.env.AEE_DEV_DB_FILE || path.join(os.tmpdir(), 'aee-dev-db.json');
// Column defaults Supabase would fill in (supabase/schema.sql).
const DEFAULTS = { aee_orders: { status: 'pending' }, aee_purchases: { status: 'paid' } };
const load = () => { try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch { return {}; } };
const save = d => fs.writeFileSync(FILE, JSON.stringify(d, null, 2));

function query(table) {
  let op = 'select', payload = null, opts = {}, filters = [], one = false;
  const rows = d => (d[table] ||= []);
  const match = r => filters.every(([c, v, ci]) => ci ? String(r[c]).toLowerCase() === String(v).toLowerCase() : String(r[c]) === String(v));
  const run = () => {
    const d = load(); const t = rows(d); let out;
    if (op === 'insert') {
      out = [].concat(payload).map(r => ({ id: randomUUID(), ...DEFAULTS[table], created_at: new Date().toISOString(), ...r }));
      t.push(...out);
    } else if (op === 'update') {
      out = t.filter(match); out.forEach(r => Object.assign(r, payload));
    } else if (op === 'upsert') {
      const keys = String(opts.onConflict || 'id').split(',');
      out = [];
      for (const r of [].concat(payload)) {
        if (t.some(x => keys.every(k => String(x[k]) === String(r[k])))) continue;
        const row = { id: randomUUID(), ...DEFAULTS[table], created_at: new Date().toISOString(), ...r }; t.push(row); out.push(row);
      }
    } else if (op === 'delete') {
      out = t.filter(match); d[table] = t.filter(r => !match(r));
    } else out = t.filter(match);
    save(d);
    return { data: one ? out[0] || null : out, error: one && !out[0] ? { message: 'not found' } : null };
  };
  const b = {
    insert: r => { op = 'insert'; payload = r; return b; },
    update: r => { op = 'update'; payload = r; return b; },
    delete: () => { op = 'delete'; return b; },
    match: o => { Object.entries(o).forEach(([c, v]) => filters.push([c, v])); return b; },
    upsert: (r, o) => { op = 'upsert'; payload = r; opts = o || {}; return b; },
    select: () => b,
    eq: (c, v) => { filters.push([c, v]); return b; },
    ilike: (c, v) => { filters.push([c, v, true]); return b; },
    order: () => b, limit: () => b, in: () => b,
    single: () => { one = true; return Promise.resolve(run()); },
    maybeSingle: () => { one = true; return Promise.resolve(run()); },
    then: (ok, ko) => Promise.resolve(run()).then(ok, ko),
  };
  return b;
}

export const devDb = { from: query, file: FILE };
