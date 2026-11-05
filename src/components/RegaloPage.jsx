import React, { useEffect, useState } from 'react';
import { Check, Download, AtSign, BookOpen } from 'lucide-react';
import REGALOS from '../data/regalos.json';
import { SPECIALTIES, PRODUCTS, TYPES, fmtClp } from '../data/tienda';
import { useCoupon } from '../data/useCoupon';
import EmbeddedCheckout from './EmbeddedCheckout';
import '../styles/regalo.css';

// Libro gratis de los reels «Comenta PALABRA»: eunacom-examen.cl/?regalo=<slug>&t=… (link del DM de ManyChat).
// 1) nombre + correo → el PDF se descarga ahí mismo (api/regalo.js). 2) Segunda pantalla: UNA oferta, el Manual de la
// especialidad con SHORTS20, pagable en la misma página. Sin el link del DM: «síguenos y comenta la palabra».
const IG_USER = 'academiaeunacom';
const IG_URL = `https://www.instagram.com/${IG_USER}/`;
const AEE_KEY = { respiratorio: 'neumologia', otorrinolaringologia: 'otorrino' };
const keyOf = specialty => { const k = specialty.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); return AEE_KEY[k] || k; };

function track(event, props) {
  try { window.posthog?.capture?.(event, props); } catch { /* sin analytics */ }
}
// El link firmado viene con Content-Disposition: attachment, así que se baja sin salir de la página
function startDownload(url) {
  const a = document.createElement('a');
  a.href = url; a.rel = 'noopener';
  document.body.appendChild(a); a.click(); a.remove();
}

export default function RegaloPage({ slug }) {
  const r = REGALOS[slug];
  const params = new URLSearchParams(window.location.search);
  const t = params.get('t'), u = params.get('u');
  const utm = { source: params.get('utm_source') || 'instagram', medium: params.get('utm_medium') || 'dm', campaign: params.get('utm_campaign') || slug };
  const storeKey = `aee_regalo_${slug}`;
  const [gate, setGate] = useState(t ? 'checking' : 'no'); // checking | ok | no
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState({ status: 'idle' }); // idle | sending | ready | error
  const { setCode, price } = useCoupon();

  const spec = r && SPECIALTIES.find(s => s.key === keyOf(r.specialty));
  const manualSku = spec && `tomo-${spec.key}`;
  const manual = manualSku && PRODUCTS[manualSku];
  const manualItem = manual && spec.items.find(i => i.sku === manualSku);

  useEffect(() => {
    if (!r) return;
    document.title = `${r.title} gratis | Academia Examen EUNACOM`;
    const robots = document.createElement('meta'); robots.name = 'robots'; robots.content = 'noindex';
    document.head.appendChild(robots);
    setCode('SHORTS20'); // el descuento de redes ya aplicado en la oferta y en la tienda
    track('regalo_view', { slug, ...utm });
    if (t) {
      fetch(`/api/regalo?action=check&slug=${encodeURIComponent(slug)}&t=${encodeURIComponent(t)}${u ? `&u=${encodeURIComponent(u)}` : ''}`)
        .then(x => x.json()).then(d => setGate(d.ok ? 'ok' : 'no')).catch(() => setGate('no'));
    }
    // ya lo pidió antes (link del correo ?k= o este navegador): link nuevo directo
    const k = params.get('k') || localStorage.getItem(storeKey);
    if (k) {
      fetch(`/api/regalo?action=link&slug=${encodeURIComponent(slug)}&k=${encodeURIComponent(k)}`)
        .then(x => x.json()).then(d => { if (d.url) { localStorage.setItem(storeKey, k); setState({ status: 'ready', url: d.url }); } })
        .catch(() => {});
    }
    return () => robots.remove();
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit(e) {
    e.preventDefault();
    setState({ status: 'sending' });
    try {
      const res = await fetch('/api/regalo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, t, u, nombre, email, utm }) });
      const d = await res.json();
      if (!res.ok || !d.url) throw new Error(d.error || 'No pudimos preparar tu descarga');
      localStorage.setItem(storeKey, d.token);
      track('regalo_lead', { slug, ...utm });
      startDownload(d.url);
      setState({ status: 'ready', url: d.url, emailed: d.emailed, fresh: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setState({ status: 'error', error: err.message });
    }
  }

  if (!r) {
    return (
      <div className="st rg"><div className="rg-wrap">
        <a href="/" className="rg-logo"><img src="/logo.svg" alt="Academia Examen EUNACOM" /></a>
        <h1>Este regalo ya no está disponible</h1>
        <p className="rg-lead">Mira todo lo que tenemos para preparar el EUNACOM.</p>
        <a className="rg-btn" href="/#tienda">Ver la tienda →</a>
      </div></div>
    );
  }

  const cover = `/regalo/${slug}.jpg`;

  // ── Segunda pantalla: la descarga ya partió; una sola oferta ──
  if (state.status === 'ready') {
    return (
      <div className="st rg"><div className="rg-wrap">
        <a href="/" className="rg-logo"><img src="/logo.svg" alt="Academia Examen EUNACOM" /></a>
        <div className="rg-done">
          <div className="rg-mini rg-float"><img src={cover} alt="" /><span className="rg-ok"><Check size={18} strokeWidth={3} /></span></div>
          <div>
            <h1>{state.fresh ? 'Tu guía se está descargando' : 'Tu guía está lista'}</h1>
            <p className="rg-lead">{r.title} · PDF · {r.pages} páginas{state.emailed ? ' · también te la mandamos a tu correo' : ''}</p>
            <a className="rg-link" href={state.url} rel="noopener" onClick={() => track('regalo_download', { slug, cta: 'pantalla2' })}>
              <Download size={15} /> {state.fresh ? '¿No empezó? Descárgala aquí' : 'Descargar la guía'}
            </a>
          </div>
        </div>

        {manual && (
          <section className="rg-offer">
            <span className="rg-kicker">¿Te sirvió? Sigue con esto</span>
            <h2>Manual de {spec.title} completo</h2>
            <div className="rg-offer-body">
              <img className="st-book rg-float rg-manual" src={manualItem?.cover || spec.cover} alt={`Portada: Manual de ${spec.title}`} />
              <ul>
                <li>{spec.pagesBy?.tomo || spec.pages} páginas: toda la teoría de {spec.title} del Perfil V3</li>
                {TYPES.tomo.bullets.slice(1).map(b => <li key={b}>{b}</li>)}
                <li>Lo descargas al tiro, en PDF</li>
              </ul>
            </div>
            <div className="rg-price"><s>{fmtClp(manual.price)}</s> <b>{fmtClp(price(manual.price))}</b> <span>−20 % SHORTS20</span></div>
            <EmbeddedCheckout compact item={{ sku: manualSku, name: `Manual · ${spec.title}`, price: manual.price, cover: manualItem?.cover }} />
          </section>
        )}

        <div className="rg-more">
          <a href={`/#tienda/${spec?.key || ''}`} onClick={() => track('regalo_tienda', { slug, cta: 'ver-todo' })}><BookOpen size={15} /> Ver todos los libros de {r.specialty}</a>
          <a href={IG_URL} target="_blank" rel="noopener noreferrer"><AtSign size={15} /> Síguenos: cada semana una guía gratis nueva</a>
        </div>
      </div></div>
    );
  }

  // ── Primera pantalla: portada + nombre y correo ──
  return (
    <div className="st rg"><div className="rg-wrap">
      <a href="/" className="rg-logo"><img src="/logo.svg" alt="Academia Examen EUNACOM" /></a>
      <span className="rg-chip">🎁 Regalo de Instagram</span>
      <h1>{r.title}</h1>
      <p className="rg-lead">{r.blurb}</p>
      <div className="rg-cover rg-float"><img className="st-book" src={cover} alt={`Portada: ${r.title}`} /></div>
      <p className="rg-meta">PDF · {r.pages} páginas · gratis</p>

      {gate === 'checking' ? (
        <div className="rg-card"><p className="rg-note">Revisando tu link…</p></div>
      ) : gate === 'no' ? (
        <div className="rg-card">
          <h3>¿Cómo lo recibo?</h3>
          <ol className="rg-steps">
            <li><b>Síguenos</b> en Instagram <a className="rg-ig" href={IG_URL} target="_blank" rel="noopener noreferrer" onClick={() => track('regalo_follow', { slug })}><AtSign size={15} /> @{IG_USER}</a></li>
            <li><b>Comenta la palabra</b> del reel (por ejemplo <b>ECG</b>).</li>
            <li>Te llega <b>por DM</b> el link para descargarlo gratis.</li>
          </ol>
        </div>
      ) : (
        <form className="rg-card" onSubmit={submit}>
          <h3>Déjanos tu nombre y correo, y se descarga al tiro</h3>
          <input className="rg-input" type="text" autoComplete="name" required minLength={2} placeholder="Tu nombre" value={nombre} onChange={e => setNombre(e.target.value)} />
          <input className="rg-input" type="email" inputMode="email" autoComplete="email" required placeholder="tucorreo@gmail.com" value={email} onChange={e => setEmail(e.target.value)} />
          <button className="rg-btn" type="submit" disabled={state.status === 'sending'}>
            <Download size={18} /> {state.status === 'sending' ? 'Preparando tu descarga…' : 'Descargar gratis'}
          </button>
          {state.status === 'error' && <p className="rg-error">{state.error}</p>}
          <p className="rg-note">Te escribiremos de vez en cuando con material para el EUNACOM; puedes darte de baja cuando quieras.</p>
        </form>
      )}
    </div></div>
  );
}
