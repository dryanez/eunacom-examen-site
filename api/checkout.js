// POST /api/checkout
//   { action: 'paypal-create', skus, email, name, phone }  → { paypalOrderId }   (price from api/_catalog.json)
//   { action: 'paypal-capture', paypalOrderId }             → { email, skus, names }  (records the purchase)
//   { action: 'manual', skus, email, name, phone, method }   → { orderId }  (Mercado Pago / Webpay / transfer over
//                                                              WhatsApp; becomes a purchase when the team marks it paid)
import { CATALOG, db, paypal, usdFor, bad, readBody } from './_lib.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function priceOf(skus) {
  const clean = [...new Set((skus || []).filter(s => CATALOG.products[s]))];
  if (!clean.length || clean.length !== new Set(skus).size) return null;
  return { skus: clean, clp: clean.reduce((n, s) => n + CATALOG.products[s].price, 0), title: clean.map(s => CATALOG.products[s].name).join(' + ') };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return bad(res, 405, 'POST only');
  if (!db()) return bad(res, 503, 'La tienda aún no está conectada a la base de datos.');
  const b = await readBody(req);

  if (b.action === 'paypal-create' || b.action === 'manual') {
    const email = String(b.email || '').trim().toLowerCase();
    if (!EMAIL.test(email)) return bad(res, 400, 'Correo inválido');
    const p = priceOf(b.skus);
    if (!p) return bad(res, 400, 'Producto no disponible');
    const usd = usdFor(p.clp);
    const { data: order, error } = await db().from('orders').insert({
      email, buyer_name: String(b.name || '').slice(0, 120), phone: String(b.phone || '').slice(0, 40),
      skus: p.skus, amount_clp: p.clp, amount_usd: usd, provider: b.action === 'manual' ? String(b.method || 'manual') : 'paypal',
    }).select('id').single();
    if (error) return bad(res, 500, 'No se pudo crear la orden');
    if (b.action === 'manual') return res.json({ orderId: order.id });

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
