// POST /api/checkout
//   { action: 'paypal-create', skus, email, name, phone }  → { paypalOrderId }   (price from api/_catalog.json)
//   { action: 'paypal-capture', paypalOrderId }             → { email, skus, names }  (records the purchase)
//   { action: 'mp-create', skus, email, name, code }       → { init_point }  (Mercado Pago Checkout: tarjetas, Webpay,
//                                                              cuotas; MP_ACCESS_TOKEN, the same as the EUNACOM app)
//   POST /api/checkout?mp=webhook                            ← Mercado Pago notification: approved → purchase recorded
//   { action: 'manual', skus, email, name, method }          → { orderId }  (transfer; becomes a purchase when the team
//                                                              marks it paid after seeing the receipt)
import { CATALOG, db, paypal, usdFor, bad, readBody } from './_lib.js';
import { applyCoupon, resolveCoupon } from './_coupons.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function priceOf(skus, code) {
  const clean = [...new Set((skus || []).filter(s => CATALOG.products[s]))];
  if (!clean.length || clean.length !== new Set(skus).size) return null;
  const list = clean.reduce((n, s) => n + CATALOG.products[s].price, 0);
  const coupon = resolveCoupon(code);
  const title = clean.map(s => CATALOG.products[s].name).join(' + ') + (coupon ? ` (${coupon.code} -${coupon.percent}%)` : '');
  return { skus: clean, clp: applyCoupon(list, code), title };
}

const SITE = (process.env.SITE_URL || 'https://eunacom-examen.cl').replace(/\/$/, '');
const MP = '/v1/payments';
async function mp(pathname, body) {
  const r = await fetch(`https://api.mercadopago.com${pathname}`, {
    method: body ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(`mercadopago ${r.status}`), { details: json });
  return json;
}

// Mercado Pago tells us about a payment: look it up (never trust the notification itself) and record it once.
async function mpWebhook(req, res) {
  const b = await readBody(req);
  const topic = req.query.topic || req.query.type || b.type || b.topic;
  const id = b.data?.id || req.query['data.id'] || (topic === 'payment' ? req.query.id : null);
  if (!id || (topic && topic !== 'payment') || !process.env.MP_ACCESS_TOKEN || !db()) return res.status(200).json({ ok: true });
  try {
    const pay = await mp(`${MP}/${encodeURIComponent(id)}`);
    if (pay.status !== 'approved') return res.status(200).json({ ok: true, status: pay.status });
    const { data: order } = await db().from('orders').select('*').eq('id', pay.external_reference).single();
    if (!order || order.status === 'paid') return res.status(200).json({ ok: true });
    if (Number(pay.transaction_amount) + 0.5 < Number(order.amount_clp) || pay.currency_id !== 'CLP') {
      console.error('[MP] monto distinto', id, pay.transaction_amount, order.amount_clp);
      return res.status(200).json({ ok: false });
    }
    await db().from('orders').update({ status: 'paid', paid_at: new Date().toISOString(), provider_ref: String(pay.id), payer_email: pay.payer?.email?.toLowerCase() || null }).eq('id', order.id);
    await db().from('purchases').upsert(order.skus.map(sku => ({
      email: order.email, sku, amount_clp: CATALOG.products[sku]?.price, provider: 'mercadopago', provider_ref: String(pay.id), buyer_name: order.buyer_name,
    })), { onConflict: 'provider,provider_ref,sku', ignoreDuplicates: true });
    return res.status(200).json({ ok: true, paid: true });
  } catch (e) {
    console.error('[MP webhook]', e.message, e.details);
    return res.status(500).json({ ok: false }); // Mercado Pago retries
  }
}

export default async function handler(req, res) {
  if (req.query?.mp === 'webhook') return mpWebhook(req, res);
  if (req.method !== 'POST') return bad(res, 405, 'POST only');
  if (!db()) return bad(res, 503, 'La tienda aún no está conectada a la base de datos.');
  const b = await readBody(req);

  if (b.action === 'paypal-create' || b.action === 'manual' || b.action === 'mp-create') {
    const email = String(b.email || '').trim().toLowerCase();
    if (!EMAIL.test(email)) return bad(res, 400, 'Correo inválido');
    const p = priceOf(b.skus, b.code);
    if (!p) return bad(res, 400, 'Producto no disponible');
    const usd = usdFor(p.clp);
    const { data: order, error } = await db().from('orders').insert({
      email, buyer_name: String(b.name || '').slice(0, 120), phone: String(b.phone || '').slice(0, 40),
      skus: p.skus, amount_clp: p.clp, amount_usd: usd,
      provider: b.action === 'manual' ? String(b.method || 'manual') : b.action === 'mp-create' ? 'mercadopago' : 'paypal',
    }).select('id').single();
    if (error) return bad(res, 500, 'No se pudo crear la orden');
    if (b.action === 'manual') return res.json({ orderId: order.id });

    if (b.action === 'mp-create') {
      if (!process.env.MP_ACCESS_TOKEN) return bad(res, 503, 'Mercado Pago no está configurado');
      try {
        const pref = await mp('/checkout/preferences', {
          items: [{ id: p.skus.join('+').slice(0, 250), title: p.title.slice(0, 250), quantity: 1, unit_price: p.clp, currency_id: 'CLP' }],
          payer: { email, name: String(b.name || '').slice(0, 120) },
          external_reference: order.id,
          back_urls: { success: `${SITE}/?pago=ok#gracias`, pending: `${SITE}/?pago=pendiente#gracias`, failure: `${SITE}/?pago=error#checkout` },
          ...(SITE.startsWith('https://') ? { auto_return: 'approved' } : {}), // MP rejects auto_return on http (local dev)
          notification_url: `${SITE}/api/checkout?mp=webhook`,
          statement_descriptor: 'AEE EUNACOM',
        });
        await db().from('orders').update({ provider_ref: pref.id }).eq('id', order.id);
        return res.json({ init_point: pref.init_point, orderId: order.id });
      } catch (e) {
        console.error(e.message, e.details);
        return bad(res, 502, 'No se pudo iniciar el pago con Mercado Pago');
      }
    }

    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) return bad(res, 503, 'PayPal no está configurado');
    try {
      const pp = await paypal('/v2/checkout/orders', {
        intent: 'CAPTURE',
        purchase_units: [{ custom_id: order.id, description: p.title.slice(0, 120), amount: { currency_code: 'USD', value: usd } }],
        application_context: { brand_name: 'Academia Examen EUNACOM', shipping_preference: 'NO_SHIPPING', user_action: 'PAY_NOW' },
      });
      await db().from('orders').update({ provider_ref: pp.id }).eq('id', order.id);
      return res.json({ paypalOrderId: pp.id });
    } catch (e) {
      console.error(e.message, e.details);
      return bad(res, 502, 'No se pudo iniciar el pago con PayPal');
    }
  }

  if (b.action === 'paypal-capture') {
    const id = String(b.paypalOrderId || '');
    if (!id) return bad(res, 400, 'Falta la orden');
    let cap;
    try { cap = await paypal(`/v2/checkout/orders/${encodeURIComponent(id)}/capture`); }
    catch (e) { console.error(e.message, e.details); return bad(res, 402, 'El pago no se completó'); }
    const unit = cap.purchase_units?.[0];
    const capture = unit?.payments?.captures?.[0];
    if (cap.status !== 'COMPLETED' || !capture) return bad(res, 402, 'El pago no se completó');

    const orderId = capture.custom_id || unit?.custom_id;
    const { data: order } = await db().from('orders').select('*').eq('id', orderId).single();
    if (!order) return bad(res, 404, 'Orden no encontrada');
    if (Number(capture.amount?.value) + 0.001 < Number(order.amount_usd)) return bad(res, 402, 'Monto pagado incorrecto');

    const payerEmail = cap.payer?.email_address?.toLowerCase() || null;
    if (order.status !== 'paid') {
      await db().from('orders').update({ status: 'paid', paid_at: new Date().toISOString(), payer_email: payerEmail }).eq('id', order.id);
      await db().from('purchases').upsert(order.skus.map(sku => ({
        email: order.email, sku, amount_clp: CATALOG.products[sku]?.price, provider: 'paypal', provider_ref: capture.id, buyer_name: order.buyer_name,
      })), { onConflict: 'provider,provider_ref,sku', ignoreDuplicates: true });
    }
    return res.json({ email: order.email, payerEmail, skus: order.skus, names: order.skus.map(s => CATALOG.products[s]?.name) });
  }

  return bad(res, 400, 'Acción desconocida');
}
