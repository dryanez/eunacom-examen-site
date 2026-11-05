import React, { useState } from 'react';
import { Landmark, MessageCircle, Lock, Copy, Check, ChevronDown } from 'lucide-react';
import PayLogo from './PayLogo';
import WalletPay from './WalletPay';
import { TRANSFERENCIA } from '../site.config';
import { fmtClp } from '../data/tienda';
import { useCoupon } from '../data/useCoupon';
import { useAccount } from '../lib/account';

// Checkout in one tap: no form. Apple Pay / Google Pay: see WalletPay.jsx. Prices always come from the server catalog (/api/checkout).
//   Mercado Pago: tarjetas, Webpay y cuotas → Mercado Pago's page → back (?pago=ok) → mp-confirm records it.
//   PayPal: PayPal's page (PayPal, tarjeta, and Apple Pay / Google Pay where PayPal offers them) → back (?paypal=return) → capture.
//   Transferencia: the bank details are shown here; the order stays pending until the receipt is checked.
// The purchase is saved under the signed-in account's email or, without an account, the email used to pay.
const WHATSAPP = '56976694606';

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
  const [showTransfer, setShowTransfer] = useState(false);
  const [opening, setOpening] = useState(''); // which provider is opening
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [copied, setCopied] = useState('');
  const [sentOrder, setSentOrder] = useState(null);
  const body = extra => ({ skus: items.map(i => i.sku), code: coupon?.code, email, ...extra });

  const remember = (orderId, claim) => {
    sessionStorage.setItem('aee-last-purchase', JSON.stringify({ orderId, email, skus: items.map(i => i.sku), names: items.map(i => i.name) }));
    if (claim) localStorage.setItem('aee-claim', claim); // localStorage: Mercado Pago may come back in another tab
  };

  const go = async (action, urlKey) => {
    setBusy(true); setErr(''); setOpening(action);
    try {
      const r = await post(body({ action }));
      if (!r[urlKey]) throw new Error('No se pudo abrir el pago');
      remember(r.orderId || r.paypalOrderId, r.claim);
      window.location.href = r[urlKey];
    } catch (e) { setErr(e.message || 'No se pudo iniciar el pago'); setBusy(false); setOpening(''); }
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

      {/* One button per method, in each brand's colors (like FaMED's checkout): one tap opens that payment. */}
      <div className="ck-paybtns">
        <WalletPay post={post} body={body} onOrder={remember} onError={setErr} disabled={busy} />
        <button className="ck-brand ck-brand--mp" disabled={busy} onClick={() => go('mp-create', 'init_point')}>
          <PayLogo name="mercadopago" size={30} color="#fff" />
          <span className="ck-brand__txt">
            <b>{opening === 'mp-create' ? 'Abriendo Mercado Pago…' : 'Pagar con Mercado Pago'}</b>
            <small>Tarjeta de crédito o débito, Webpay o cuotas</small>
          </span>
        </button>
        <div className="ck-cards" aria-label="Tarjetas aceptadas">
          <span className="ck-card ck-card--visa"><PayLogo name="visa" size={30} color="#1a1f71" title="Visa" /></span>
          <span className="ck-card"><PayLogo name="mastercard" size={22} color="#eb001b" title="Mastercard" /></span>
          <span className="ck-card"><PayLogo name="americanexpress" size={22} color="#2e77bc" title="American Express" /></span>
          <span className="ck-card ck-card--txt">Webpay</span>
          <span className="ck-card ck-card--txt">Cuotas</span>
        </div>

        <button className="ck-brand ck-brand--pp" disabled={busy} onClick={() => go('paypal-create', 'approve_url')}>
          {opening === 'paypal-create'
            ? <b>Abriendo PayPal…</b>
            : <span className="ck-pp"><span>Pagar con</span> <PayLogo name="paypal" size={20} color="#003087" /><i><span>Pay</span><span>Pal</span></i></span>}
        </button>

        <button className={`ck-brand ck-brand--tr ${showTransfer ? 'on' : ''}`} disabled={busy} onClick={() => { setShowTransfer(v => !v); setErr(''); }} aria-expanded={showTransfer}>
          <Landmark size={20} /><b>Transferencia bancaria</b><ChevronDown size={18} className="ck-brand__chev" />
        </button>
      </div>

      {showTransfer && (
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
      <div className="ck-safe"><Lock size={13} /> {showTransfer
        ? 'Tu acceso se activa al confirmar la transferencia.'
        : 'Pago seguro. Tu acceso se activa apenas se aprueba el pago.'}</div>
    </div>
  );
}
