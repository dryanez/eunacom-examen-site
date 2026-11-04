import React, { useState } from 'react';
import { CreditCard, Landmark, MessageCircle, Lock, Copy, Check, Wallet } from 'lucide-react';
import { TRANSFERENCIA } from '../site.config';
import { fmtClp } from '../data/tienda';
import { useCoupon } from '../data/useCoupon';
import { useAccount } from '../lib/account';

// Checkout in one tap: no form. Prices always come from the server catalog (/api/checkout).
//   Mercado Pago: tarjetas, Webpay y cuotas → Mercado Pago's page → back (?pago=ok) → mp-confirm records it.
//   PayPal: PayPal's page (PayPal, tarjeta, and Apple Pay / Google Pay where PayPal offers them) → back (?paypal=return) → capture.
//   Transferencia: the bank details are shown here; the order stays pending until the receipt is checked.
// The purchase is saved under the signed-in account's email or, without an account, the email used to pay.
const WHATSAPP = '56976694606';

const METHODS = [
  { id: 'mercadopago', label: 'Mercado Pago', icon: CreditCard },
  { id: 'paypal', label: 'PayPal · Apple Pay · Google Pay', icon: Wallet },
  { id: 'transfer', label: 'Transferencia', icon: Landmark },
];
const TRANSFER_ROWS = [
  ['Banco', TRANSFERENCIA.banco], ['Tipo de cuenta', TRANSFERENCIA.tipo], ['N° de cuenta', TRANSFERENCIA.numero],
  ['Titular', TRANSFERENCIA.titular], ['RUT', TRANSFERENCIA.rut],
];

const post = body => fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  .then(async r => { const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || 'Error'); return j; });

// compact: inside a store card (no summary row).
export default function EmbeddedCheckout({ item, items: list, compact = false }) {
  const items = list || [item];
  const listPrice = items.reduce((n, i) => n + i.price, 0);
  const { coupon, code, setCode, price } = useCoupon();
  const total = price(listPrice);
  const name = items.map(i => i.name).join(' + ');
  const account = useAccount();
  const email = account?.user?.email || '';
  const [method, setMethod] = useState('mercadopago');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [copied, setCopied] = useState('');
  const [sentOrder, setSentOrder] = useState(null);
  const body = extra => ({ skus: items.map(i => i.sku), code: coupon?.code, email, ...extra });

  const remember = orderId => sessionStorage.setItem('aee-last-purchase', JSON.stringify({ orderId, email, skus: items.map(i => i.sku), names: items.map(i => i.name) }));

  const go = async (action, urlKey) => {
    setBusy(true); setErr('');
    try {
      const r = await post(body({ action }));
      if (!r[urlKey]) throw new Error('No se pudo abrir el pago');
      remember(r.orderId || r.paypalOrderId);
      window.location.href = r[urlKey];
    } catch (e) { setErr(e.message || 'No se pudo iniciar el pago'); setBusy(false); }
  };

  const saveTransfer = async () => {
    setBusy(true); setErr('');
    const ref = await post(body({ action: 'manual', method: 'transfer' })).then(r => r.orderId).catch(() => null);
    setSentOrder(ref || 'sin-numero'); setBusy(false);
  };
  const receipt = () => {
    const text = [`Hola, transferí ${fmtClp(total)} por *${name}*`, sentOrder && sentOrder !== 'sin-numero' && `Orden: ${sentOrder.slice(0, 8)}`, email && `Mi cuenta: ${email}`, 'Adjunto el comprobante.'].filter(Boolean).join('\n');
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, '_blank');
  };
  const copy = (label, value) => { navigator.clipboard?.writeText(value); setCopied(label); setTimeout(() => setCopied(''), 1500); };

  return (
    <div className={`ck ${compact ? 'ck--compact' : ''}`}>
      {!compact && (
        <div className="ck-sum">
          <span>{name}</span>
          <b>{coupon && <s style={{ fontWeight: 600, fontSize: '0.8em', opacity: 0.55, marginRight: 6 }}>{fmtClp(listPrice)}</s>}{fmtClp(total)}</b>
        </div>
      )}
      <div className="ck-code">
        <input placeholder="Código de descuento" value={code} onChange={e => setCode(e.target.value)} autoCapitalize="characters" aria-label="Código de descuento" />
        {coupon ? <span className="ok">✓ -{coupon.percent}% aplicado</span> : code.trim() && <span className="no">Código no válido</span>}
      </div>

      <div className="ck-methods" role="radiogroup" aria-label="Medio de pago">
        {METHODS.map(m => (
          <button key={m.id} role="radio" aria-checked={method === m.id} className={method === m.id ? 'on' : ''} onClick={() => { setMethod(m.id); setErr(''); }}>
            <m.icon size={16} /><span><b>{m.label}</b></span>
          </button>
        ))}
      </div>

      {method === 'mercadopago' && (
        <button className="st-add ck-pay ck-pay--mp" disabled={busy} onClick={() => go('mp-create', 'init_point')}>
          {busy ? 'Abriendo Mercado Pago…' : `Pagar ${fmtClp(total)} con Mercado Pago`}
        </button>
      )}
      {method === 'paypal' && (
        <button className="st-add ck-pay ck-pay--pp" disabled={busy} onClick={() => go('paypal-create', 'approve_url')}>
          {busy ? 'Abriendo PayPal…' : `Pagar ${fmtClp(total)} con PayPal`}
        </button>
      )}
      {method === 'transfer' && (
        <div className="ck-transfer">
          <div className="ck-transfer__amount">Transfiere <b>{fmtClp(total)}</b> a:</div>
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
            <button className="st-add ck-pay" disabled={busy} onClick={saveTransfer}>{busy ? 'Guardando…' : 'Ya transferí'}</button>
          ) : (
            <>
              <p className="ck-hint">¡Gracias! Envíanos el comprobante y activamos tu acceso.</p>
              <button className="st-add ck-pay ck-pay--wa" onClick={receipt}><MessageCircle size={18} /> Enviar comprobante por WhatsApp</button>
            </>
          )}
        </div>
      )}

      {err && <p className="ck-err">{err}</p>}
      <div className="ck-safe"><Lock size={13} /> {
        method === 'mercadopago' ? 'Tarjeta de crédito o débito, Webpay o cuotas. Tu acceso se activa apenas se aprueba.'
          : method === 'paypal' ? 'PayPal o tarjeta; en el celular, Apple Pay o Google Pay cuando PayPal los ofrece.'
            : 'Tu acceso se activa al confirmar la transferencia.'
      }</div>
    </div>
  );
}
