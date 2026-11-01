import React, { useEffect, useRef } from 'react';
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
  const last = JSON.parse(sessionStorage.getItem('aee-last-purchase') || 'null');
  const skus = last?.skus || [];
  const covers = skus.map(s => PRODUCTS[s]?.cover).filter(Boolean).slice(0, 5);

  return (
    <div className="st ac-page">
      <Confetti />
      <div className="st-wrap ac-grid">
        <div className="ac-hero">
          <div className="ac-badge"><PartyPopper size={18} /> Pago confirmado</div>
          <h1>¡Felicidades{last?.name ? `, ${last.name.split(' ')[0]}` : ''}!</h1>
          <p className="st-lead">Compraste {skus.length > 1 ? 'estos productos' : 'esto'}:</p>
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
              subtitle="Tus libros, clases y preguntas quedan en tu cuenta. Se leen en línea, desde cualquier dispositivo."
            />
          )}
        </div>
      </div>
    </div>
  );
}
