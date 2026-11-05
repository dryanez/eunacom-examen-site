// Dry test: every store product, paid every way (transfer, PayPal, Mercado Pago return + webhook), must unlock exactly
// the right things — e.g. "Clases · Cardiología" opens only the Cardiología classes in the Aula, a book opens no classes.
// Runs the real api/checkout.js + api/library.js against the local dev DB (a temp file) with PayPal/MP faked; no money moves.
//   node scripts/dry-test-purchases.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DB_FILE = path.join(os.tmpdir(), `aee-dry-test-${process.pid}.json`);
Object.assign(process.env, {
  AEE_DEV_DB: '1', AEE_DEV_DB_FILE: DB_FILE, SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '',
  PAYPAL_CLIENT_ID: 'fake', PAYPAL_CLIENT_SECRET: 'fake', MP_ACCESS_TOKEN: 'fake', SITE_URL: 'http://localhost:5195', SES_SMTP_USER: '', SES_SMTP_PASS: '', AEE_MAIL_SILENT: '1',
});

// ── Fake PayPal + Mercado Pago (they confirm whatever order is in flight) ────
const fake = { paypal: {}, mp: {} };
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
globalThis.fetch = async (url, opts = {}) => {
  const u = String(url); const body = opts.body && !String(opts.body).startsWith('grant') ? JSON.parse(opts.body) : null;
  if (u.endsWith('/v1/oauth2/token')) return json({ access_token: 't' });
  if (u.endsWith('/v2/checkout/orders')) {
    const id = `PP-${Object.keys(fake.paypal).length + 1}`;
    fake.paypal[id] = body.purchase_units[0];
    return json({ id, links: [{ rel: 'approve', href: 'https://paypal.test/approve' }] });
  }
  const cap = u.match(/\/v2\/checkout\/orders\/([^/]+)\/capture$/);
  if (cap) {
    const unit = fake.paypal[decodeURIComponent(cap[1])];
    return json({ status: 'COMPLETED', payer: { email_address: 'payer@paypal.test' }, purchase_units: [{ payments: { captures: [{ id: `CAP-${cap[1]}`, custom_id: unit.custom_id, amount: unit.amount }] } }] });
  }
  if (u.endsWith('/checkout/preferences')) { fake.mp.last = body; return json({ id: 'PREF', init_point: 'https://mp.test/pay' }); }
  const pay = u.match(/\/v1\/payments\/(.+)$/);
  if (pay) return json({ id: pay[1], status: 'approved', currency_id: 'CLP', transaction_amount: fake.mp.last.items[0].unit_price, external_reference: fake.mp.last.external_reference, payer: { email: 'payer@mp.test' } });
  throw new Error(`unexpected fetch ${u}`);
};

const { default: checkout } = await import(path.join(ROOT, 'api/checkout.js'));
const { default: library } = await import(path.join(ROOT, 'api/library.js'));
const CATALOG = JSON.parse(fs.readFileSync(path.join(ROOT, 'api/_catalog.json'), 'utf8'));
const AULA = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/aula/catalog.json'), 'utf8'));

// Call a Vercel-style handler in-process.
async function call(handler, { body, query = {}, headers = {} }) {
  let status = 200, out;
  const res = { status(c) { status = c; return res; }, json(o) { out = o; return res; } };
  await handler({ method: body ? 'POST' : 'GET', body, query, headers, url: `/api/x?${new URLSearchParams(query)}` }, res);
  return { http: status, ...out };
}

// The 4 ways money comes in. Each returns once the purchase is recorded.
const PAYMENTS = {
  transfer: async (sku, email) => {
    const o = await call(checkout, { body: { action: 'manual', skus: [sku], email, name: 'Test', method: 'transfer' } });
    return call(checkout, { body: { action: 'dev-mark-paid', orderId: o.orderId } });
  },
  paypal: async (sku, email) => {
    const o = await call(checkout, { body: { action: 'paypal-create', skus: [sku], email, name: 'Test' } });
    return call(checkout, { body: { action: 'paypal-capture', paypalOrderId: o.paypalOrderId } });
  },
  'mercadopago (vuelta)': async (sku, email) => {
    const o = await call(checkout, { body: { action: 'mp-create', skus: [sku], email, name: 'Test' } });
    return call(checkout, { body: { action: 'mp-confirm', orderId: o.orderId, paymentId: `MP-${o.orderId}` } });
  },
  'mercadopago (webhook)': async (sku, email) => {
    const o = await call(checkout, { body: { action: 'mp-create', skus: [sku], email, name: 'Test' } });
    await call(checkout, { body: { type: 'payment', data: { id: `MPW-${o.orderId}` } }, query: { mp: 'webhook' } });
    return call(checkout, { body: { action: 'mp-confirm', orderId: o.orderId } });
  },
};

// What a buyer must see, worked out from the SKU itself (not from the catalog the code uses).
const SPECS = Object.values({ ...Object.fromEntries(AULA.modules.flatMap(m => m.specialties.map(s => [s.name, s]))) });
const ALL_KEYS = [...new Set(CATALOG.products['pack-total'].includes.filter(i => i.startsWith('clases-')).map(i => i.slice(7)))];
const MODULE_KEYS = {
  'mod-1': ['cardiologia', 'infectologia', 'gastroenterologia', 'neumologia', 'nefrologia', 'diabetes', 'endocrinologia', 'hematologia', 'reumatologia', 'neurologia'],
  'mod-2': ['cirugia', 'traumatologia', 'urologia', 'otorrino', 'oftalmologia', 'dermatologia', 'psiquiatria'],
  'mod-3': ['pediatria', 'obstetricia', 'ginecologia'],
};
function expectedClasses(sku) {
  if (['pack-total', 'pack-clases'].includes(sku) || sku.startsWith('curso-')) return ALL_KEYS;
  if (MODULE_KEYS[sku]) return MODULE_KEYS[sku];
  const m = sku.match(/^(clases|esp)-(.+)$/);
  return m ? [m[2]] : []; // books, banks, reconstructions, Biblioteca, collections of books: no classes
}

// Aula: which specialties' classes open with these owned items (same rule as src/components/AulaPage.jsx).
const PREFIX = { cardio: 'cardiologia', gastro: 'gastroenterologia', resp: 'neumologia', nefro: 'nefrologia', diab: 'diabetes', endo: 'endocrinologia', hem: 'hematologia', infecto: 'infectologia', reuma: 'reumatologia', neuro: 'neurologia', cirugia: 'cirugia', trauma: 'traumatologia', uro: 'urologia', orl: 'otorrino', oftal: 'oftalmologia', derma: 'dermatologia', psiq: 'psiquiatria', ped: 'pediatria', ob: 'obstetricia', gin: 'ginecologia', sp: 'saludpublica' };
const aulaOpen = items => [...new Set(SPECS.flatMap(s => s.lessons).map(l => PREFIX[l.id.replace(/-\d+$/, '')]).filter(k => items.has(`clases-${k}`)))];
const lessonsOpen = items => SPECS.flatMap(s => s.lessons).filter(l => items.has(`clases-${PREFIX[l.id.replace(/-\d+$/, '')]}`)).length;

const failures = [];
const fail = (where, msg) => failures.push(`${where}: ${msg}`);
const same = (a, b) => a.length === b.length && [...a].sort().join() === [...b].sort().join();

// Every Aula class maps to a specialty that the store sells classes for.
for (const l of SPECS.flatMap(s => s.lessons)) if (!PREFIX[l.id.replace(/-\d+$/, '')]) fail('aula', `clase ${l.id} sin especialidad`);
for (const k of ALL_KEYS) if (!CATALOG.products[`clases-${k}`]) fail('tienda', `falta clases-${k}`);

const skus = Object.keys(CATALOG.products);
const rows = [];
let n = 0;
for (const [way, pay] of Object.entries(PAYMENTS)) {
  for (const sku of skus) {
    fs.rmSync(DB_FILE, { force: true });
    const email = `buyer${++n}@test.cl`;
    const anon = await call(library, { headers: { 'x-dev-email': email } });
    if (anon.items.length) fail(`${way} ${sku}`, 'tenía acceso antes de pagar');

    globalThis.__aeeMails = [];
    const r = await pay(sku, email);
    const mails = globalThis.__aeeMails.filter(m => m.to === email);
    if (mails.length !== 1) fail(`${way} ${sku}`, `${mails.length} correos de compra (esperado 1)`);
    else if (!/activar=/.test(mails[0].link)) fail(`${way} ${sku}`, 'el correo no trae el link para activar la cuenta');
    if (r.http !== 200 || (r.status && r.status !== 'paid')) fail(`${way} ${sku}`, `pago no confirmado (${JSON.stringify(r).slice(0, 120)})`);
    const lib = await call(library, { headers: { 'x-dev-email': email.toUpperCase() } }); // email match is case-insensitive
    const items = new Set(lib.items);
    const want = CATALOG.products[sku].includes;
    if (!want.every(i => items.has(i)) || items.size !== new Set(want).size) fail(`${way} ${sku}`, `desbloquea ${items.size} ítems, esperado ${new Set(want).size}`);
    const open = aulaOpen(items);
    if (!same(open, expectedClasses(sku))) fail(`${way} ${sku}`, `Aula abre [${open.join(', ')}], esperado [${expectedClasses(sku).join(', ')}]`);
    // Someone else's email sees nothing.
    const other = await call(library, { headers: { 'x-dev-email': `otro${n}@test.cl` } });
    if (other.items.length) fail(`${way} ${sku}`, 'otro correo ve la compra');
    // A book this buyer did not buy is refused.
    const notOwned = Object.keys(CATALOG.files).find(f => !items.has(f));
    if (notOwned) { const d = await call(library, { headers: { 'x-dev-email': email }, query: { item: notOwned } }); if (d.http !== 403) fail(`${way} ${sku}`, `libro ajeno ${notOwned} → ${d.http}`); }
    if (way === 'transfer') rows.push([sku, CATALOG.products[sku].name, items.size, open.length, lessonsOpen(items)]);
  }
}
// Mercado Pago's return and webhook for the same payment: still one purchase email.
fs.rmSync(DB_FILE, { force: true }); globalThis.__aeeMails = [];
{ const o = await call(checkout, { body: { action: 'mp-create', skus: ['pack-total'], email: 'carrera@test.cl', name: 'Test' } });
  await call(checkout, { body: { type: 'payment', data: { id: `MP-${o.orderId}` } }, query: { mp: 'webhook' } });
  await call(checkout, { body: { action: 'mp-confirm', orderId: o.orderId, paymentId: `MP-${o.orderId}` } });
  if (globalThis.__aeeMails.length !== 1) fail('mp vuelta + webhook', `${globalThis.__aeeMails.length} correos`); }
// A transfer that the team hasn't confirmed yet unlocks nothing.
fs.rmSync(DB_FILE, { force: true });
await call(checkout, { body: { action: 'manual', skus: ['clases-cardiologia'], email: 'pendiente@test.cl', method: 'transfer' } });
if ((await call(library, { headers: { 'x-dev-email': 'pendiente@test.cl' } })).items.length) fail('transfer pendiente', 'abre antes de confirmar');
// Buying two things adds them up.
fs.rmSync(DB_FILE, { force: true });
await PAYMENTS.paypal('clases-cardiologia', 'dos@test.cl'); await PAYMENTS.transfer('clases-pediatria', 'dos@test.cl');
const two = aulaOpen(new Set((await call(library, { headers: { 'x-dev-email': 'dos@test.cl' } })).items));
if (!same(two, ['cardiologia', 'pediatria'])) fail('dos compras', `Aula abre [${two}]`);
fs.rmSync(DB_FILE, { force: true });

// Report
const pick = re => rows.filter(r => re.test(r[0]));
console.log('\nQué abre cada tipo de producto (ejemplos):');
for (const r of [...pick(/^clases-cardiologia$/), ...pick(/^esp-cardiologia$/), ...pick(/^tomo-cardiologia$/), ...pick(/^banco-cardiologia$/), ...pick(/^mod-/), ...pick(/^pack-/), ...pick(/^biblioteca$/), ...pick(/^banco-completo$/), ...pick(/^curso-/)])
  console.log(`  ${r[1].padEnd(48)} ${String(r[2]).padStart(4)} ítems · clases de ${String(r[3]).padStart(2)} especialidades (${r[4]} clases)`);
const checks = skus.length * Object.keys(PAYMENTS).length;
console.log(`\n${skus.length} productos × ${Object.keys(PAYMENTS).length} formas de pago = ${checks} compras de prueba (${Object.keys(PAYMENTS).join(', ')})`);
if (failures.length) { console.log(`\n✗ ${failures.length} fallas:`); failures.slice(0, 40).forEach(f => console.log('  - ' + f)); process.exit(1); }
console.log('✓ Todas pasan: cada compra abre exactamente lo suyo, nada antes de pagar, nada para otro correo.');
