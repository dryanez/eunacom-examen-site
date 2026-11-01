import React, { useEffect, useRef, useState } from 'react';
import { CreditCard, Landmark, MessageCircle, Lock } from 'lucide-react';
import { fmtClp, fmtUsd, CLP_PER_USD } from '../data/tienda';

// Inline checkout (no pop-up). PayPal / card: PayPal JS SDK buttons rendered on the page; the order is created
// and captured by /api/checkout with the price from the server catalog (VITE_PAYPAL_CLIENT_ID = public client id).
// Mercado Pago, Webpay and transfer: a pending order is saved and confirmed over WhatsApp.
// On payment → sessionStorage 'aee-last-purchase' → #gracias (congrats + create account).
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;
const WHATSAPP = '56976694606';
const usdAmount = clp => (Math.ceil(clp / CLP_PER_USD) - 0.01).toFixed(2);

function loadPaypal() {
  if (window.paypal) return Promise.resolve(window.paypal);
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&intent=capture&components=buttons,card-fields&enable-funding=card`;
    s.onload = () => resolve(window.paypal);
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

const METHODS = [
  { id: 'paypal', label: 'Tarjeta o PayPal', icon: CreditCard, note: 'Pago en USD, en esta misma página' },
  { id: 'mercadopago', label: 'Mercado Pago', icon: CreditCard, note: 'Cuotas con tarjetas chilenas' },
  { id: 'webpay', label: 'Webpay', icon: CreditCard, note: 'Débito o crédito, en cuotas' },
  { id: 'transfer', label: 'Transferencia', icon: Landmark, note: 'Te enviamos los datos por WhatsApp' },
];

const post = body => fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  .then(async r => { const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || 'Error'); return j; });

export default function EmbeddedCheckout({ item, items: list }) {
  // One product ({ sku, name, price }) or several (the cart).
  const items = list || [item];
  item = { sku: items.map(i => i.sku).join('+'), name: items.map(i => i.name).join(' + '), price: items.reduce((n, i) => n + i.price, 0) };
  const formRef = useRef(null);
  const [method, setMethod] = useState(PAYPAL_CLIENT_ID ? 'paypal' : 'mercadopago');
  const [form, setForm] = useState({ name: '', email: '', phone: '', doc: '' });
  const [ppError, setPpError] = useState('');
  const ppRef = useRef(null);
  const ready = form.name.trim() && /\S+@\S+\.\S+/.test(form.email) && form.phone.trim();
  formRef.current = form;

  // Render PayPal buttons + card fields for the selected item.
  useEffect(() => {
    if (method !== 'paypal' || !PAYPAL_CLIENT_ID || !ppRef.current) return;
    let cancelled = false;
    ppRef.current.innerHTML = '';
    loadPaypal().then(paypal => {
      if (cancelled || !ppRef.current) return;
      const f = () => formRef.current;
      const order = () => post({ action: 'paypal-create', skus: items.map(i => i.sku), email: f().email, name: f().name, phone: f().phone }).then(r => r.paypalOrderId);
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

  const whatsapp = async () => {
    const m = METHODS.find(x => x.id === method);
    const tab = window.open('', '_blank');  // open now (user gesture) so the browser doesn't block it
    // Save a pending order so the team can mark it paid (then it appears in the buyer's account).
    const ref = await post({ action: 'manual', method, skus: items.map(i => i.sku), email: form.email, name: form.name, phone: form.phone }).then(r => r.orderId).catch(() => null);
    const text = [
      `Hola, quiero inscribirme: *${item.name}*`,
      ref && `Orden: ${ref.slice(0, 8)}`,
      `Valor: ${fmtClp(item.price)} (${fmtUsd(item.price)})`,
      `Medio de pago: ${m.label}`,
      `Nombre: ${form.name}`, `Email: ${form.email}`, `Teléfono: ${form.phone}`, form.doc && `RUT/Doc: ${form.doc}`,
    ].filter(Boolean).join('\n');
    const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
    if (tab) tab.location.href = url; else window.location.href = url;
  };

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="ck">
      <div className="ck-sum">
        <span>{item.name}</span>
        <b>{fmtClp(item.price)}</b>
      </div>
      <div className="ck-usd">{fmtUsd(item.price)} · pago único</div>

      <div className="ck-fields">
        <input placeholder="Nombre completo" value={form.name} onChange={set('name')} autoComplete="name" />
        <input placeholder="Correo electrónico" type="email" value={form.email} onChange={set('email')} autoComplete="email" />
        <input placeholder="WhatsApp (+56 9 …)" value={form.phone} onChange={set('phone')} autoComplete="tel" />
        <input placeholder="RUT o pasaporte (opcional)" value={form.doc} onChange={set('doc')} />
      </div>

      <div className="ck-methods" role="radiogroup" aria-label="Medio de pago">
        {METHODS.filter(m => m.id !== 'paypal' || PAYPAL_CLIENT_ID).map(m => (
          <button key={m.id} role="radio" aria-checked={method === m.id} className={method === m.id ? 'on' : ''} onClick={() => setMethod(m.id)}>
            <m.icon size={16} /><span><b>{m.label}</b><small>{m.note}</small></span>
          </button>
        ))}
      </div>

      {method === 'paypal' ? (
        <div>
          {!ready && <p className="ck-hint">Completa nombre, correo y WhatsApp para pagar.</p>}
          <div ref={ppRef} style={{ opacity: ready ? 1 : 0.35, pointerEvents: ready ? 'auto' : 'none', minHeight: 50 }} />
          {ppError && <p className="ck-err">{ppError}</p>}
        </div>
      ) : (
        <button className="st-add" disabled={!ready} onClick={whatsapp} style={{ opacity: ready ? 1 : 0.5 }}>
          <MessageCircle size={18} /> Confirmar inscripción · {fmtClp(item.price)}
        </button>
      )}
      <div className="ck-safe"><Lock size={13} /> {method === 'paypal' ? 'Pago procesado por PayPal. No guardamos datos de tu tarjeta.' : 'Te respondemos por WhatsApp con el link de pago y el acceso.'}</div>
    </div>
  );
}
