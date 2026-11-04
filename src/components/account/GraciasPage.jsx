import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, PartyPopper } from 'lucide-react';
import { PRODUCTS } from '../../data/tienda';
import { useAccount } from '../../lib/account';
import AuthCard from './AuthCard';

// Confetti on a canvas: ~180 pieces fall and spin for ~4 s, in the site's colors.
function Confetti() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; const ctx = c.getContext('2d');
    const resize = () => { c.width = innerWidth; c.height = innerHeight; };
    resize(); addEventListener('resize', resize);
    const colors = ['#0bd9e7', '#08365f', '#ea580c', '#22c55e', '#f59e0b', '#7c3aed'];
    const bits = Array.from({ length: 180 }, () => ({
      x: innerWidth / 2 + (Math.random() - .5) * 200, y: innerHeight * .35, vx: (Math.random() - .5) * 16, vy: -Math.random() * 16 - 6,
      r: Math.random() * Math.PI, vr: (Math.random() - .5) * .3, w: 6 + Math.random() * 6, h: 10 + Math.random() * 8, c: colors[Math.floor(Math.random() * colors.length)],
    }));
    let raf; const t0 = performance.now();
    const tick = now => {
      ctx.clearRect(0, 0, c.width, c.height);
      const fade = Math.max(0, 1 - (now - t0 - 2600) / 1400);
      bits.forEach(b => {
        b.vy += .35; b.vx *= .99; b.x += b.vx; b.y += b.vy; b.r += b.vr;
        ctx.save(); ctx.globalAlpha = fade; ctx.translate(b.x, b.y); ctx.rotate(b.r); ctx.fillStyle = b.c; ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h); ctx.restore();
      });
      if (fade > 0) raf = requestAnimationFrame(tick);
    };
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 3000 }} />;
}

export default function GraciasPage() {
  const { user } = useAccount();
  const [last, setLast] = useState(() => JSON.parse(sessionStorage.getItem('aee-last-purchase') || 'null'));
  // Coming back from Mercado Pago / PayPal: confirm the payment with the server before celebrating.
  const q = new URLSearchParams(window.location.search);
  const mpOrder = q.get('external_reference'), mpPayment = q.get('payment_id') || q.get('collection_id');
  const ppToken = q.get('paypal') === 'return' && q.get('token');
  const [state, setState] = useState(mpOrder || ppToken ? 'checking' : 'paid'); // checking | paid | pending | failed
  useEffect(() => {
    if (state !== 'checking') return;
    const body = ppToken ? { action: 'paypal-capture', paypalOrderId: ppToken } : { action: 'mp-confirm', orderId: mpOrder, paymentId: mpPayment };
    fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(r => r.json().then(j => (r.ok ? j : Promise.reject(j))))
      .then(r => {
        const info = { ...(last || {}), email: r.email || last?.email, skus: r.skus || last?.skus, names: r.names || last?.names };
        sessionStorage.setItem('aee-last-purchase', JSON.stringify(info));
        setLast(info);
        setState(ppToken || r.status === 'paid' ? 'paid' : 'pending');
      })
      .catch(() => setState('failed'));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const skus = last?.skus || [];
  const covers = skus.map(s => PRODUCTS[s]?.cover).filter(Boolean).slice(0, 5);
  const pending = state === 'pending' || state === 'checking';

  if (state === 'failed') {
    return (
      <div className="st ac-page"><div className="st-wrap" style={{ textAlign: 'center', padding: '60px 0' }}>
        <h1>El pago no se completó</h1>
        <p className="st-lead">No se te cobró nada. Puedes intentarlo de nuevo o elegir otro medio de pago.</p>
        <a className="st-add" href="#tienda" style={{ textDecoration: 'none', display: 'inline-flex' }}>Volver a la tienda</a>
      </div></div>
    );
  }

  return (
    <div className="st ac-page">
      {!pending && <Confetti />}
      <div className="st-wrap ac-grid">
        <div className="ac-hero">
          <div className="ac-badge"><PartyPopper size={18} /> {state === 'checking' ? 'Confirmando tu pago…' : pending ? 'Pago en proceso' : 'Pago confirmado'}</div>
          <h1>¡Felicidades{last?.name ? `, ${last.name.split(' ')[0]}` : ''}!</h1>
          <p className="st-lead">{state === 'checking' ? 'Un momento, estamos confirmando tu pago:' : pending ? 'Mercado Pago está procesando tu pago. Apenas se apruebe, se activa en tu cuenta:' : `Compraste ${skus.length > 1 ? 'estos productos' : 'esto'}:`}</p>
          <ul className="ac-bought">
            {(last?.names || ['Tu compra']).map(n => <li key={n}>{n}</li>)}
          </ul>
          {covers.length > 0 && (
            <div className="ac-fan">{covers.map((c, i) => <img key={c} className="st-book" src={c} alt="" style={{ '--i': i, '--n': covers.length }} />)}</div>
          )}
        </div>

        <div className="ac-side">
          {user ? (
            <div className="ac-card">
              <h3>Ya está en tu cuenta</h3>
              <p className="ac-sub">Tu compra quedó en {user.email}.</p>
              <a className="st-add" href="#mi-cuenta" style={{ textDecoration: 'none' }}>Ir a Mi Biblioteca <ArrowRight size={18} /></a>
            </div>
          ) : (
            <AuthCard
              email={last?.email || ''}
              title="Crea tu cuenta para ver tu compra"
              subtitle={`Tus libros, clases y preguntas quedan en tu cuenta${last?.email ? ` (${last.email}, el correo con que pagaste)` : ''}. Se leen en línea, desde cualquier dispositivo.`}
            />
          )}
        </div>
      </div>
    </div>
  );
}
