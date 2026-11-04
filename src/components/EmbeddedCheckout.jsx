import React, { useEffect, useRef, useState } from 'react';
import { CreditCard, Landmark, MessageCircle, Lock, Copy, Check } from 'lucide-react';
import { TRANSFERENCIA } from '../site.config';
import { fmtClp, fmtUsd, CLP_PER_USD } from '../data/tienda';
import { resolveCoupon, applyCoupon } from '../../api/_coupons.js';

// Inline checkout. Prices always come from the server catalog (/api/checkout).
//   Mercado Pago: tarjetas, Webpay y cuotas → Mercado Pago's page → back to #gracias; the webhook records the purchase.
//   PayPal / tarjeta en USD: PayPal JS SDK buttons on this page (VITE_PAYPAL_CLIENT_ID = public client id).
//   Transferencia: the bank details are shown here; the order stays pending until the receipt is checked.
// On payment → sessionStorage 'aee-last-purchase' → #gracias (congrats + create account).
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;
const WHATSAPP = '56976694606';
const usdAmount = clp => (Math.ceil(clp / CLP_PER_USD) - 0.01).toFixed(2);

function loadPaypal() {
  if (window.paypal) return Promise.resolve(window.paypal);
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&intent=capture&components=buttons,card-fields&enable-funding=card&locale=es_CL&disable-funding=p24,sofort,giropay,bancontact,blik,eps,ideal,mybank,sepa,paylater`;
    s.onload = () => resolve(window.paypal);
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

const METHODS = [
  { id: 'mercadopago', label: 'Mercado Pago', icon: CreditCard, note: 'Tarjeta, Webpay o cuotas' },
  { id: 'paypal', label: 'PayPal', icon: CreditCard, note: 'PayPal o tarjeta, en USD' },
  { id: 'transfer', label: 'Transferencia', icon: Landmark, note: 'Cuenta RUT BancoEstado' },
];
const TRANSFER_ROWS = [
  ['Banco', TRANSFERENCIA.banco], ['Tipo de cuenta', TRANSFERENCIA.tipo], ['N° de cuenta', TRANSFERENCIA.numero],
  ['Titular', TRANSFERENCIA.titular], ['RUT', TRANSFERENCIA.rut],
];

const post = body => fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  .then(async r => { const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || 'Error'); return j; });

// compact: inside a store card (no summary row, payment methods as chips). Only name + email are asked.
export default function EmbeddedCheckout({ item, items: list, compact = false }) {
  // One product ({ sku, name, price }) or several (the cart).
  const items = list || [item];
  const listPrice = items.reduce((n, i) => n + i.price, 0);
  // Código de descuento: viene en el link (?code=SHORTS20, guardado en main.jsx) o se escribe aquí
  const [codeInput, setCodeInput] = useState(() => sessionStorage.getItem('aee-code') || '');
  const coupon = resolveCoupon(codeInput);
  item = { sku: items.map(i => i.sku).join('+'), name: items.map(i => i.name).join(' + '), price: applyCoupon(listPrice, coupon?.code) };
  const formRef = useRef(null);
  const [method, setMethod] = useState('mercadopago');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [copied, setCopied] = useState('');
  const [sentOrder, setSentOrder] = useState(null); // transfer: order saved, waiting for the receipt
  const [form, setForm] = useState({ name: '', email: '' });
  const [ppError, setPpError] = useState('');
  const ppRef = useRef(null);
  const ready = form.name.trim() && /\S+@\S+\.\S+/.test(form.email);
  formRef.current = form;

  // Render PayPal buttons + card fields for the selected item.
  useEffect(() => {
    if (method !== 'paypal' || !PAYPAL_CLIENT_ID || !ppRef.current) return;
    let cancelled = false;
    ppRef.current.innerHTML = '';
    loadPaypal().then(paypal => {
      if (cancelled || !ppRef.current) return;
      const f = () => formRef.current;
      const order = () => post({ action: 'paypal-create', skus: items.map(i => i.sku), code: coupon?.code, email: f().email, name: f().name }).then(r => r.paypalOrderId);
      const approve = data => post({ action: 'paypal-capture', paypalOrderId: data.orderID }).then(r => {
        sessionStorage.setItem('aee-last-purchase', JSON.stringify({ email: r.email, name: f().name, skus: r.skus, names: r.names }));
        window.location.hash = '#gracias';
        window.scrollTo({ top: 0 });
      }).catch(e => setPpError(e.message));
      paypal.Buttons({ style: { layout: 'vertical', shape: 'pill', label: 'pay' }, createOrder: order, onApprove: approve, onError: () => setPpError('No se pudo completar el pago. Prueba de nuevo o elige otro medio.') })
        .render(ppRef.current);
    }).catch(() => setPpError('No se pudo cargar PayPal. Elige otro medio de pago.'));
    return () => { cancelled = true; };
  }, [method, item.sku, item.price]);

  const lastPurchase = () => sessionStorage.setItem('aee-last-purchase', JSON.stringify({ email: form.email, name: form.name, skus: items.map(i => i.sku), names: items.map(i => i.name) }));

  // Mercado Pago: create the order + preference on the server, then go to Mercado Pago to pay.
  const payMercadoPago = async () => {
    setBusy(true); setErr('');
    try {
      const r = await post({ action: 'mp-create', skus: items.map(i => i.sku), code: coupon?.code, email: form.email, name: form.name });
      lastPurchase();
      window.location.href = r.init_point;
    } catch (e) { setErr(e.message || 'No se pudo iniciar el pago'); setBusy(false); }
  };

  // Transfer: save the pending order; the buyer sends the receipt (WhatsApp) with the order number.
  const saveTransfer = async () => {
    setBusy(true); setErr('');
    const ref = await post({ action: 'manual', method: 'transfer', skus: items.map(i => i.sku), code: coupon?.code, email: form.email, name: form.name }).then(r => r.orderId).catch(() => null);
    setSentOrder(ref || 'sin-numero'); setBusy(false);
  };
  const receipt = () => {
    const text = [`Hola, transferí ${fmtClp(item.price)} por *${item.name}*`, sentOrder && sentOrder !== 'sin-numero' && `Orden: ${sentOrder.slice(0, 8)}`, `Nombre: ${form.name}`, `Email: ${form.email}`, 'Adjunto el comprobante.'].filter(Boolean).join('\n');
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, '_blank');
  };
  const copy = (label, value) => { navigator.clipboard?.writeText(value); setCopied(label); setTimeout(() => setCopied(''), 1500); };

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className={`ck ${compact ? 'ck--compact' : ''}`}>
      {!compact && <div className="ck-sum">
        <span>{item.name}</span>
        <b>{coupon && <s style={{ fontWeight: 600, fontSize: '0.8em', opacity: 0.55, marginRight: 6 }}>{fmtClp(listPrice)}</s>}{fmtClp(item.price)}</b>
      </div>}
      <div className="ck-code">
        <input placeholder="Código de descuento" value={codeInput} onChange={e => { setCodeInput(e.target.value); sessionStorage.setItem('aee-code', e.target.value.trim()); }} autoCapitalize="characters" aria-label="Código de descuento" />
        {coupon ? <span className="ok">✓ -{coupon.percent}% aplicado</span> : codeInput.trim() && <span className="no">Código no válido</span>}
      </div>
      {!compact && <div className="ck-usd">{fmtUsd(item.price)} · pago único</div>}

      <div className="ck-fields">
        <input placeholder="Nombre completo" value={form.name} onChange={set('name')} autoComplete="name" />
        <input placeholder="Correo electrónico" type="email" value={form.email} onChange={set('email')} autoComplete="email" />
      </div>

      <div className="ck-methods" role="radiogroup" aria-label="Medio de pago">
        {METHODS.map(m => (
          <button key={m.id} role="radio" aria-checked={method === m.id} className={method === m.id ? 'on' : ''} onClick={() => setMethod(m.id)}>
            <m.icon size={16} /><span><b>{m.label}</b>{!compact && <small>{m.note}</small>}</span>
          </button>
        ))}
      </div>

      {method === 'mercadopago' && (
        <button className="st-add ck-pay ck-pay--mp" disabled={!ready || busy} onClick={payMercadoPago}>
          {busy ? 'Abriendo Mercado Pago…' : <>Pagar {fmtClp(item.price)} con Mercado Pago</>}
        </button>
      )}

      {method === 'paypal' && (
        PAYPAL_CLIENT_ID ? (
          <div>
            {!ready && <p className="ck-hint">Completa tu nombre y correo para pagar.</p>}
            <div ref={ppRef} style={{ opacity: ready ? 1 : 0.35, pointerEvents: ready ? 'auto' : 'none', minHeight: 50 }} />
            {ppError && <p className="ck-err">{ppError}</p>}
          </div>
        ) : <p className="ck-err">PayPal no está disponible en este momento. Elige Mercado Pago o transferencia.</p>
      )}

      {method === 'transfer' && (
        <div className="ck-transfer">
          <div className="ck-transfer__amount">Transfiere <b>{fmtClp(item.price)}</b> a:</div>
          <dl>
            {TRANSFER_ROWS.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}{(k === 'N° de cuenta' || k === 'RUT') && (
                  <button type="button" onClick={() => copy(k, v.replace(/\./g, ''))} aria-label={`Copiar ${k}`}>{copied === k ? <Check size={14} /> : <Copy size={14} />}</button>
                )}</dd>
              </div>
            ))}
          </dl>
          {!sentOrder ? (
            <button className="st-add ck-pay" disabled={!ready || busy} onClick={saveTransfer}>{busy ? 'Guardando…' : 'Ya transferí'}</button>
          ) : (
            <>
              <p className="ck-hint">¡Gracias! Envíanos el comprobante y activamos tu acceso en {form.email}.</p>
              <button className="st-add ck-pay ck-pay--wa" onClick={receipt}><MessageCircle size={18} /> Enviar comprobante por WhatsApp</button>
            </>
          )}
        </div>
      )}

      {err && <p className="ck-err">{err}</p>}
      {!ready && method !== 'paypal' && <p className="ck-hint">Completa tu nombre y correo para continuar.</p>}
      <div className="ck-safe"><Lock size={13} /> {method === 'mercadopago' ? 'Pago seguro en Mercado Pago. Tu acceso se activa apenas se aprueba.' : method === 'paypal' ? 'Pago procesado por PayPal. No guardamos datos de tu tarjeta.' : 'Tu acceso se activa al confirmar la transferencia.'}</div>
    </div>
  );
}
