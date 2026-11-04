import React, { useEffect, useMemo, useRef, useState } from 'react';
import EmbeddedCheckout from './EmbeddedCheckout';
import { useCoupon } from '../data/useCoupon';
import { ShoppingCart, ShieldCheck, CreditCard, Sparkles, Check, ChevronDown, Lightbulb } from 'lucide-react';
import { PACKS, COLLECTIONS, SPECIALTIES, RECONS, TYPES, PRODUCTS, BANK, booksByModule, GRAN_LIBRO_GORDO_PAGINAS, fmtClp, looseValue } from '../data/tienda';
import { useCart } from './Cart';
import '../styles/store.css';

// Real question from the Libro Gordo de Cardiología (Q-CARDIOLOGIA-08), shown as the "explained answer" demo.
const DEMO_Q = {
  topic: 'Cardiología · Fibrilación auricular · Código 1.01.1.013',
  stem: 'Hombre de 60 años portador de una prótesis valvular mecánica mitral consulta por fibrilación auricular. ¿Cuál es el tratamiento anticoagulante de elección?',
  options: [
    ['A', 'Acenocumarol o warfarina con meta de INR entre 2,5 y 3,5'],
    ['B', 'Apixabán 5 mg cada 12 horas'],
    ['C', 'Rivaroxabán 20 mg al día'],
    ['D', 'Dabigatrán 150 mg cada 12 horas'],
  ],
  correct: 'A',
  why: 'Las prótesis mecánicas contraindican los anticoagulantes directos (más trombosis y sangrado). Solo los antagonistas de vitamina K, con INR 2,5–3,5 en posición mitral.',
};

const MARQUEE = ['Alineado al Perfil EUNACOM V3', 'Paga en cuotas con Mercado Pago', 'PayPal y transferencia', 'Explicación en cada pregunta', 'Libros distintos para cada etapa', '468 clases en video'];

// Adds .is-in when the element scrolls into view (once).
function useInView(threshold = 0.25) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function Reveal({ children, className = '', ...rest }) {
  const [ref, inView] = useInView(0.15);
  const [seen, setSeen] = useState(false);
  useEffect(() => { if (inView) setSeen(true); }, [inView]);
  return <div ref={ref} className={`st-reveal ${seen ? 'is-in' : ''} ${className}`} {...rest}>{children}</div>;
}

const Book = ({ src, className = '', style }) => <img className={`st-book ${className}`} src={src} alt="" loading="lazy" style={style} />;
const AnkiTile = ({ label = 'ANKI' }) => <div className="tile" style={{ background: 'linear-gradient(160deg,#2563eb,#0f172a)' }}>{label}<small>Mazo de tarjetas</small></div>;
const PlayIcon = ({ size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="rgba(255,255,255,.92)" /><path d="M10 8l6 4-6 4z" fill="#08365f" /></svg>
);

// ── Product definitions: the whole collection, or one specialty ───────────────
function buildProduct(key) {
  if (key === 'todo') {
    const c = sku => COLLECTIONS.find(x => x.sku === sku);
    const variants = [
      ...PACKS.map(p => ({ sku: p.sku, name: p.name, desc: p.features.slice(0, 3).join(' · '), tag: p.star ? 'Todo incluido' : p.best ? 'Solo libros' : null, slide: p.sku === 'pack-tomos' ? 1 : 0 })),
      ...COLLECTIONS.map((x, i) => ({ sku: x.sku, name: x.name, desc: x.desc, slide: i + 2, cover: x.cover, video: x.video, anki: !x.cover })),
      { sku: 'banco-completo', name: 'Banco de preguntas completo (online)', desc: `Más de ${BANK.total.toLocaleString('es-CL')} preguntas: banco, Libros Gordos y los ${BANK.exams} EUNACOM reales`, slide: 0, cover: '/covers/q_gordo.jpg' },
    ];
    const slides = [
      { kind: 'grid', cap: 'Todo EUNACOM', items: [SPECIALTIES[0].cover, '/covers/q_repaso.jpg', '/covers/q_atlas.jpg', '/covers/q_gordo.jpg', '/covers/q_recons.jpg', '/covers/q_perfil.jpg'] },
      { kind: 'grid', cap: 'Los 21 manuales', items: [0, 4, 7, 10, 17, 20].map(i => SPECIALTIES[i].cover) },
      ...COLLECTIONS.map(x => x.video
        ? { kind: 'wide', src: SPECIALTIES[0].items.find(i => i.type === 'clases').cover, cap: x.name }
        : x.cover ? { kind: 'single', src: x.cover, cap: x.name } : { kind: 'anki', cap: x.name }),
    ];
    return {
      key, kicker: 'Colección completa · 21 especialidades', title: 'Todo EUNACOM',
      lead: 'Manuales, clases, Repaso Final, atlas, Anki, Libros Gordos y reconstrucciones. Llévate todo junto o elige la colección que te falta.',
      variants, slides, color: '#08365f',
      contents: ['21 manuales (uno por especialidad)', '468 clases en video, 96 horas', '21 libros Repaso Final', '19 atlas de imágenes', '21 mazos Anki', 'Gran Libro Gordo + 21 Libros Gordos (1.890 preguntas)', 'Perfil V3 código por código', '16 EUNACOM reconstruidos (2013–2025)'],
      thumb: SPECIALTIES[0].cover,
    };
  }
  const s = SPECIALTIES.find(x => x.key === key);
  const grid = s.items.filter(i => i.type !== 'perfil').map(i => i.type === 'clases' ? { video: i.cover } : i.cover).slice(0, 6);
  return {
    key, kicker: `Tomo ${s.n} · ${s.items.length} materiales distintos`, title: s.title,
    lead: `${s.sub}. Cada material es un libro distinto con su propia portada: estudia, practica, repasa y mira las imágenes.`,
    color: s.color, thumb: s.cover,
    variants: [
      { sku: s.pack.sku, name: `Pack ${s.title} completo`, desc: s.items.map(i => TYPES[i.type].short).join(' + '), tag: 'Todo junto', slide: 0, stack: s.items.filter(i => i.cover && i.type !== 'clases').slice(0, 3).map(i => i.cover) },
      ...s.items.map((i, n) => ({ sku: i.sku, name: TYPES[i.type].name, desc: i.label, slide: n + 1, cover: i.cover, video: i.type === 'clases' })),
      (b => ({ sku: b.sku, name: 'Banco de preguntas online', desc: `Más de ${b.total} preguntas · todos los códigos · ${b.real} de EUNACOM reales`, slide: 0, cover: s.items.find(i => i.type === 'gordo')?.cover }))(BANK.specialties.find(b => b.key === s.key)),
    ],
    slides: [
      { kind: 'grid', cap: `${s.title}: ${s.items.length} materiales`, items: grid },
      ...s.items.map(i => i.type === 'clases' ? { kind: 'wide', src: i.cover, cap: TYPES.clases.name } : { kind: 'single', src: i.cover, cap: TYPES[i.type].name }),
    ],
    contents: s.items.map(i => `${TYPES[i.type].name}: ${i.label}`),
  };
}

// Collections whose panel lists every book by module, with real pages.
const BREAKDOWN = {
  'pack-tomos': { type: 'tomo', noun: ['manual', 'manuales'], extra: ['Algoritmos, tablas y perlas EUNACOM', 'Alineados al Perfil V3 · actualizados 2026'] },
  'pack-repasos': { type: 'repaso', noun: ['libro Repaso Final', 'libros Repaso Final'], extra: ['Un tema por página, lo que más se pregunta', 'Plan de repaso de 7 días'] },
  'pack-atlas': { type: 'atlas', noun: ['atlas', 'atlas'], extra: ['1.144 imágenes comentadas: ECG, radiografías, fondo de ojo, piel', 'Hallazgos marcados y qué hacer después'] },
  'pack-gordos': { type: 'gordo', noun: ['Libro Gordo', 'Libros Gordos'], top: `Gran Libro Gordo: las 1.890 preguntas juntas (${GRAN_LIBRO_GORDO_PAGINAS} págs.)`, extra: ['90 preguntas por especialidad, con clave y explicación', 'Código del Perfil V3 en cada pregunta'] },
};
const nfmt = n => n.toLocaleString('es-CL');
function ModuleBreakdown({ type, noun, top, extra }) {
  const mods = booksByModule(type);
  const count = mods.reduce((n, m) => n + m.specs.length, 0);
  const pages = mods.reduce((n, m) => n + m.pages, 0);
  return (
    <div className="st-mods">
      <div className="st-mods__total"><b>{mods.length}</b> módulos · <b>{count}</b> {noun[1]} · <b>{nfmt(pages)}</b> páginas</div>
      {top && <ul><li><Check size={15} /> {top}</li></ul>}
      {mods.map(m => (
        <div key={m.id} className="st-mod">
          <div className="st-mod__h"><span>Módulo {m.id} · {m.name}</span><small>{m.specs.length} {m.specs.length === 1 ? noun[0] : noun[1]} · {nfmt(m.pages)} págs.</small></div>
          <div className="st-mod__specs">{m.specs.map(sp => <span key={sp.title}>{sp.title} <em>{sp.pages}</em></span>)}</div>
        </div>
      ))}
      <ul>{extra.map(t => <li key={t}><Check size={15} /> {t}</li>)}</ul>
    </div>
  );
}

// What a format brings, shown in the panel that opens under it.
function variantInfo(x, product) {
  const pack = PACKS.find(p => p.sku === x.sku);
  if (pack) return pack.features;
  const coll = COLLECTIONS.find(c => c.sku === x.sku);
  if (coll) {
    const type = PRODUCTS[coll.sku]?.includes?.[0]?.split('-')[0];
    return [coll.desc, ...(TYPES[type]?.bullets || [])];
  }
  if (x.sku.startsWith('esp-')) return product.contents;
  const type = x.sku.split('-')[0];
  return [x.desc, ...(TYPES[type]?.bullets || [])].filter(Boolean);
}

function Slide({ s, on }) {
  return (
    <div className={`st-slide ${on ? 'on' : ''}`}>
      {s.kind === 'grid' && (
        <div className="st-grid6">
          {s.items.map((it, i) => it?.anki ? <AnkiTile key={i} /> : it?.video
            ? <div key={i} className="st-video-tile"><img src={it.video} alt="" style={{ objectPosition: 'left' }} /><PlayIcon /></div>
            : <Book key={i} src={it} />)}
        </div>
      )}
      {s.kind === 'single' && <Book src={s.src} className="single" />}
      {s.kind === 'wide' && <div className="st-video-tile" style={{ width: '92%' }}><img src={s.src} alt="" className="st-book wide" style={{ aspectRatio: '16/9', borderRadius: 10 }} /><PlayIcon size={64} /></div>}
      {s.kind === 'anki' && <div className="st-grid6" style={{ width: '40%', gridTemplateColumns: '1fr' }}><AnkiTile /></div>}
      <span className="cap">{s.cap}</span>
    </div>
  );
}

function VariantThumb({ v }) {
  if (v.stack) return <div className="stack">{v.stack.map((c, i) => <img key={i} src={c} alt="" style={{ left: i * 7, zIndex: 3 - i }} />)}</div>;
  if (v.anki) return <div className="mini">ANKI</div>;
  if (v.video) return <div style={{ position: 'relative' }}><img src={v.cover && !v.cover.includes('tomo_') ? v.cover : SPECIALTIES[0].items.find(i => i.type === 'clases').cover} alt="" style={{ width: 48, height: 34, objectFit: 'cover', borderRadius: 4 }} /></div>;
  return <img src={v.cover || PRODUCTS[v.sku].cover} alt="" />;
}

export default function TiendaPage() {
  const cart = useCart();
  // #tienda/<especialidad> (p. ej. desde el libro gratis de Instagram) abre esa especialidad
  const hashKey = () => {
    const k = window.location.hash.split('?')[0].split('/')[1];
    return SPECIALTIES.some(s => s.key === k) ? k : null;
  };
  const [productKey, setProductKey] = useState(() => hashKey() || 'todo');
  const product = useMemo(() => buildProduct(productKey), [productKey]);
  const [variant, setVariant] = useState(product.variants[0].sku);
  // Long format lists (Todo EUNACOM has 11) show the first 3 on screen; the rest open with «Ver más».
  const [showAll, setShowAll] = useState(false);
  const [openSku, setOpenSku] = useState(null); // format whose «qué trae + pagar» panel is open
  const [slide, setSlide] = useState(0);
  const [bump, setBump] = useState(false);
  const userTouched = useRef(0);
  const pickerRef = useRef(null);
  const productRef = useRef(null);
  // Choosing a specialty scrolls down to its product so it's obvious something happened.
  const pick = key => {
    setProductKey(key);
    setTimeout(() => productRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  };

  useEffect(() => { setVariant(product.variants[0].sku); setSlide(0); setShowAll(false); setOpenSku(null); }, [product]);
  useEffect(() => {
    if (hashKey()) setTimeout(() => productRef.current?.scrollIntoView({ block: 'start' }), 300);
    const onHash = () => { const k = hashKey(); if (k) pick(k); };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Gallery autoplay, paused for 10 s after any manual choice.
  useEffect(() => {
    const t = setInterval(() => {
      if (Date.now() - userTouched.current > 10000) setSlide(i => (i + 1) % product.slides.length);
    }, 4000);
    return () => clearInterval(t);
  }, [product]);

  const v = product.variants.find(x => x.sku === variant) || product.variants[0];
  const { coupon, price: withCode } = useCoupon(); // SHORTS20 etc.: every price on the page shows the discount
  const price = PRODUCTS[v.sku].price;
  const was = looseValue(v.sku);
  const off = was > price ? Math.round((1 - price / was) * 100) : 0;
  const st = cart.state(v.sku);

  const choose = (x) => {
    userTouched.current = Date.now(); setVariant(x.sku); setSlide(x.slide);
    const opening = openSku !== x.sku;
    setOpenSku(opening ? x.sku : null);
    if (opening) setTimeout(() => document.getElementById(`var-${x.sku}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 380);
  };
  const add = () => {
    if (st) return cart.setOpen(true);
    cart.toggle(v.sku); setBump(true); setTimeout(() => setBump(false), 450);
  };

  // Sticky bar when the main button is off-screen.
  const [addRef, addVisible] = useInView(0);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 500);
    window.addEventListener('scroll', on, { passive: true }); on();
    return () => window.removeEventListener('scroll', on);
  }, []);

  // Path animation: the active step walks 0→3 while the band is in view.
  const [pathRef, pathIn] = useInView(0.35);
  const [step, setStep] = useState(-1);
  useEffect(() => {
    if (!pathIn) { setStep(-1); return; }
    setStep(0);
    const t = setInterval(() => setStep(s => (s + 1) % 5), 1500);
    return () => clearInterval(t);
  }, [pathIn]);
  const shownStep = Math.min(step, 3);

  // Quiz animation: pick → correct glow → explanation, looping while visible.
  const [quizRef, quizIn] = useInView(0.4);
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!quizIn) { setPhase(0); return; }
    let alive = true; const timers = [];
    const run = () => {
      if (!alive) return;
      setPhase(0);
      timers.push(setTimeout(() => setPhase(1), 1200), setTimeout(() => setPhase(2), 1900), setTimeout(() => setPhase(3), 2600), setTimeout(run, 9000));
    };
    run();
    return () => { alive = false; timers.forEach(clearTimeout); };
  }, [quizIn]);

  const [badgesRef, badgesIn] = useInView(0.3);
  const [badgesSeen, setBadgesSeen] = useState(false);
  useEffect(() => { if (badgesIn) setBadgesSeen(true); }, [badgesIn]);

  // Auto-scrolling rail of material types, paused on hover/touch.
  const railRef = useRef(null);
  const railPaused = useRef(false);
  useEffect(() => {
    let raf; let last = performance.now();
    const tick = now => {
      const el = railRef.current;
      if (el && !railPaused.current) {
        el.scrollLeft += (now - last) * 0.035;
        if (el.scrollLeft >= el.scrollWidth / 2) el.scrollLeft -= el.scrollWidth / 2;
      }
      last = now; raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const railSpec = productKey === 'todo' ? SPECIALTIES[0] : SPECIALTIES.find(s => s.key === productKey);
  const railItems = railSpec.items;
  const cardio = SPECIALTIES[0];
  const coverOf = type => cardio.items.find(i => i.type === type)?.cover;

  return (
    <div className="st">
      <div className="st-marquee" aria-hidden="true">
        <div className="st-marquee-track">
          {[...MARQUEE, ...MARQUEE].map((m, i) => <span key={i}><Sparkles size={13} /> {m}</span>)}
        </div>
      </div>

      <div className="st-wrap">
        {/* Step 1: pick a specialty (or everything) */}
        <div className="st-step-head">
          <span className="n">1</span>
          <div><b>Elige tu especialidad</b><small>Toca una tarjeta para ver todos sus libros y clases</small></div>
          <div className="st-arrows">
            <button aria-label="Anterior" onClick={() => pickerRef.current?.scrollBy({ left: -480, behavior: 'smooth' })}>‹</button>
            <button aria-label="Siguiente" onClick={() => pickerRef.current?.scrollBy({ left: 480, behavior: 'smooth' })}>›</button>
          </div>
        </div>
        <div className="st-pick" ref={pickerRef} role="tablist" aria-label="Especialidades">
          <button role="tab" aria-selected={productKey === 'todo'} className={`st-pc all ${productKey === 'todo' ? 'on' : ''}`} onClick={() => pick('todo')}>
            <span className="covers">{['/covers/q_repaso.jpg', SPECIALTIES[0].cover, '/covers/q_gordo.jpg'].map(c => <img key={c} src={c} alt="" />)}</span>
            <b>Todo EUNACOM</b><small>21 especialidades · 468 clases</small><em>Ver packs →</em>
          </button>
          {SPECIALTIES.map(s => {
            const cl = s.items.find(i => i.type === 'clases');
            return (
              <button key={s.key} role="tab" aria-selected={productKey === s.key} className={`st-pc ${productKey === s.key ? 'on' : ''}`} style={{ '--c': s.color }} onClick={() => pick(s.key)}>
                <span className="covers">{['gordo', 'tomo', 'repaso'].map(t => s.items.find(i => i.type === t)?.cover).filter(Boolean).map(c => <img key={c} src={c} alt="" />)}</span>
                <b>{s.title}</b><small>{s.items.length} materiales{cl ? ` · ${cl.label.split(' ')[0]} clases` : ''}</small><em>Ver →</em>
              </button>
            );
          })}
        </div>

        {/* Product block */}
        <div className="st-product" ref={productRef} style={{ scrollMarginTop: 90 }}>
          <div className="st-gallery">
            <div className="st-stage">
              {product.slides.map((s, i) => <Slide key={`${product.key}-${i}`} s={s} on={i === slide} />)}
            </div>
            <div className="st-dots">
              {product.slides.map((_, i) => <button key={i} className={i === slide ? 'on' : ''} aria-label={`Imagen ${i + 1}`} onClick={() => { userTouched.current = Date.now(); setSlide(i); }} />)}
            </div>
          </div>

          <div className="st-info">
            <div className="st-kicker">{product.kicker}</div>
            <h1>{product.title}</h1>
            <p className="st-lead">{product.lead}</p>
            <div className="st-price">
              <b>{fmtClp(withCode(price))}</b>
              {coupon ? <s>{fmtClp(price)}</s> : off > 0 && <s>{fmtClp(was)}</s>}
              {coupon ? <span className="st-pill st-pill--code">-{coupon.percent}% {coupon.code}</span> : off > 0 && <span className="st-pill">-{off}%</span>}
            </div>
            {coupon && <div className="st-codebar">🎟️ Código <b>{coupon.code}</b>: {coupon.percent} % de descuento en todo, ya aplicado</div>}

            <div className="st-step-head small"><span className="n">2</span><div><b>Elige tu formato</b><small>Todo junto sale más barato</small></div></div>
            <div className="st-variants">
              {(showAll || product.variants.length <= 4 ? product.variants : product.variants.filter((x, i) => i < 3 || x.sku === variant)).map(x => {
                const p = PRODUCTS[x.sku].price; const w = looseValue(x.sku);
                const xs = cart.state(x.sku);
                return (
                  <React.Fragment key={x.sku}>
                    <button className={`st-var ${x.sku === variant ? 'on' : ''} ${openSku === x.sku ? 'open' : ''}`} onClick={() => choose(x)} aria-expanded={openSku === x.sku}>
                      {x.tag && <span className={`tag ${x.tag === 'Solo libros' ? 'green' : ''}`}>{x.tag}{w > p ? ` · -${Math.round((1 - p / w) * 100)}%` : ''}</span>}
                      <span className="th"><VariantThumb v={x} /></span>
                      <span>
                        <div className="nm">{x.name}</div>
                        <div className="ds">{x.desc}</div>
                        {xs && <div className="owned">{xs === 'in' ? '✓ En tu carrito' : '✓ Incluido en tu pack'}</div>}
                      </span>
                      <span className="pr">
                        <b>{fmtClp(withCode(p))}</b>
                        {coupon ? <s>{fmtClp(p)}</s> : w > p && <s>{fmtClp(w)}</s>}
                      </span>
                    </button>
                    {openSku === x.sku && (
                      <div className="st-panel" id={`var-${x.sku}`}>
                        <div className="st-panel__in">
                          <b className="st-panel__h">Qué trae</b>
                          {BREAKDOWN[x.sku] ? (
                            <ModuleBreakdown {...BREAKDOWN[x.sku]} />                          ) : (
                            <ul>{variantInfo(x, product).map(t => <li key={t}><Check size={15} /> {t}</li>)}</ul>
                          )}
                          {xs ? (
                            <button className="st-add added" onClick={() => cart.setOpen(true)}><ShoppingCart size={18} /> {xs === 'in' ? 'Ya está en tu carrito · Ver carrito' : 'Ya viene en tu pack · Ver carrito'}</button>
                          ) : (
                            <>
                              <b className="st-panel__h">Cómpralo ahora</b>
                              <EmbeddedCheckout compact item={{ sku: x.sku, name: x.name, price: p }} />
                              <button className="st-panel__cart" onClick={() => cart.toggle(x.sku)}>o agrégalo al carrito</button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
              {product.variants.length > 4 && (
                <button className="st-more" onClick={() => setShowAll(v => !v)} aria-expanded={showAll}>
                  {showAll ? 'Ver menos' : `Ver ${product.variants.length - 3} formatos más`} <ChevronDown size={16} style={{ transform: showAll ? 'rotate(180deg)' : 'none' }} />
                </button>
              )}
            </div>

            <ul className="st-perks">
              <li><CreditCard size={18} /> Mercado Pago en cuotas, Webpay, PayPal o transferencia</li>
              <li><ShieldCheck size={18} /> Alineado al Perfil EUNACOM V3 (2026)</li>
              <li><Lightbulb size={18} /> Explicación en cada pregunta</li>
            </ul>

            <div ref={addRef}>
              <button className={`st-add ${st ? 'added' : ''} ${bump ? 'bump' : ''}`} onClick={add}>
                <ShoppingCart size={18} /> {st === 'in' ? 'En tu carrito · Ver carrito' : st === 'pack' ? 'Ya está en tu pack' : `Agregar al carrito · ${fmtClp(withCode(price))}`}
              </button>
            </div>
            <div className="st-pay"><span>Mercado Pago</span><span>Webpay</span><span>PayPal</span><span>Transferencia</span></div>

            <details className="st-acc">
              <summary>Qué incluye <ChevronDown size={18} /></summary>
              <ul>{product.contents.map(c => <li key={c}>{c}</li>)}</ul>
            </details>
          </div>
        </div>
      </div>

      {/* Standards */}
      <section className="st-sec" style={{ background: 'var(--soft)' }}>
        <div className="st-wrap">
          <Reveal><h2>Basado en el examen real</h2><p className="sub">Cada libro sigue el Perfil de Conocimientos EUNACOM V3 y las preguntas de los exámenes anteriores.</p></Reveal>
          <div ref={badgesRef} className={`st-badges ${badgesSeen ? 'is-in' : ''}`}>
            <div className="st-badge"><b>Perfil V3</b><span>1.569 códigos ASOFAMECh</span></div>
            <div className="st-badge"><b>GES / MINSAL</b><span>Guías clínicas chilenas</span></div>
            <div className="st-badge"><b>2013–2025</b><span>16 exámenes reconstruidos</span></div>
            <div className="st-badge"><b>21</b><span>especialidades</span></div>
          </div>
        </div>
      </section>

      {/* Different books */}
      <section className="st-sec">
        <div className="st-wrap">
          <Reveal>
            <h2>Mismo tema, libros distintos</h2>
            <p className="sub">{railSpec.title} tiene {railItems.length} materiales. Cada uno cumple una función diferente en tu preparación.</p>
          </Reveal>
        </div>
        <div className="st-rail" ref={railRef}
          onMouseEnter={() => { railPaused.current = true; }} onMouseLeave={() => { railPaused.current = false; }}
          onTouchStart={() => { railPaused.current = true; }} onTouchEnd={() => { setTimeout(() => { railPaused.current = false; }, 4000); }}>
          <div className="st-rail-track">
            {[...railItems, ...railItems].map((i, n) => {
              const t = TYPES[i.type]; const is = cart.state(i.sku);
              return (
                <div key={`${i.sku}-${n}`} className="st-card">
                  <div className="cv">
                    {i.type === 'clases' ? <img src={i.cover} alt="" className="st-book wide" />
                      : <Book src={i.cover} />}
                  </div>
                  <h3>{t.name}</h3>
                  <p>{t.blurb}</p>
                  <ul>{t.bullets.map(b => <li key={b}>{b}</li>)}</ul>
                  <div className="row">
                    <b>{fmtClp(withCode(i.price))}</b>
                    <button className={`st-mini ${is ? 'added' : ''}`} onClick={() => is ? cart.setOpen(true) : cart.toggle(i.sku)}>{is ? '✓ Agregado' : '+ Agregar'}</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Path */}
      <section className="st-sec st-dark" ref={pathRef}>
        <div className="st-wrap">
          <h2>Tu camino al EUNACOM</h2>
          <p className="sub">Cuatro etapas, un libro para cada una.</p>
          <div className="st-path">
            <div className="st-path-line">
              <div className="st-path-fill" style={{ width: `${Math.max(0, shownStep) / 3 * 100}%` }} />
              {shownStep >= 0 && <div className="st-path-dot" style={{ left: `${shownStep / 3 * 100}%` }} />}
            </div>
            {[
              { t: 'Estudia', d: 'Manual y clases en video de cada tema.', books: [<Book key="a" src={coverOf('tomo')} />, <img key="b" className="st-book wide" src={coverOf('clases')} alt="" />] },
              { t: 'Practica', d: '90 preguntas por especialidad, con explicación.', books: [<Book key="a" src={coverOf('gordo')} />, <Book key="b" src="/covers/q_gordo.jpg" />] },
              { t: 'Repasa', d: 'Repaso Final, atlas de imágenes y Anki.', books: [<Book key="a" src={coverOf('repaso')} />, <Book key="b" src={coverOf('atlas')} />] },
              { t: 'Simula', d: '16 EUNACOM reales, cronometrados.', books: [<Book key="a" src="/covers/q_recons.jpg" />] },
            ].map((x, i) => (
              <div key={x.t} className={`st-step ${i <= shownStep ? 'on' : ''}`}>
                <div className="num">{i + 1}</div>
                <div className="books">{x.books}</div>
                <b>{x.t}</b>
                <span>{x.d}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Explained question */}
      <section className="st-sec" style={{ paddingBottom: 150 }}>
        <div className="st-wrap">
          <Reveal><h2>Cada pregunta, explicada</h2><p className="sub">Así se ve una pregunta del Libro Gordo de Cardiología.</p></Reveal>
          <div className="st-quiz" ref={quizRef}>
            <div className="st-qcard">
              <span className="tagq">PREGUNTA</span>
              <div style={{ fontSize: 12, color: 'var(--mute)', marginTop: 8 }}>{DEMO_Q.topic}</div>
              <div className="stem">{DEMO_Q.stem}</div>
              {DEMO_Q.options.map(([l, t]) => (
                <div key={l} className={`st-opt ${l === DEMO_Q.correct && phase === 1 ? 'pick' : ''} ${l === DEMO_Q.correct && phase >= 2 ? 'ok' : ''}`}>
                  <span className="l">{l}</span>{t}
                </div>
              ))}
            </div>
            <div className={`st-expl ${phase >= 3 ? 'on' : ''}`}>
              <span className="ic"><Check size={15} /></span>
              <div><b>Explicación</b>{DEMO_Q.why}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Video band */}
      <section className="st-sec" style={{ background: 'var(--soft)' }}>
        <div className="st-wrap st-videoband">
          <Reveal>
            <a href="#aula" className="st-player" style={{ display: 'block' }}>
              <img src={coverOf('clases')} alt="Clase de Cardiología" />
              <span className="st-play"><svg width="26" height="26" viewBox="0 0 24 24"><path d="M8 5l12 7-12 7z" fill="#08365f" /></svg></span>
            </a>
          </Reveal>
          <Reveal>
            <div className="st-kicker">Clases en video</div>
            <div className="st-big">468 clases</div>
            <div className="st-eq" aria-hidden="true">
              {Array.from({ length: 16 }, (_, i) => <i key={i} style={{ animationDelay: `${(i % 5) * 0.13}s`, animationDuration: `${1 + (i % 4) * 0.12}s` }} />)}
            </div>
            <p className="st-lead">96 horas, una clase por tema, ordenadas por módulo y especialidad en el Aula virtual. Cada especialidad se vende sola o dentro del Pack Total.</p>
            <a href="#aula" className="st-mini" style={{ display: 'inline-block', textDecoration: 'none' }}>Ver el Aula virtual →</a>
          </Reveal>
        </div>
      </section>

      {/* Reconstructions */}
      <section className="st-sec">
        <div className="st-wrap">
          <Reveal><h2>Reconstrucciones por examen</h2><p className="sub">Cada EUNACOM reconstruido, 180 preguntas con explicación. Hazlo cronometrado como simulacro.</p></Reveal>
          <div className="st-recs">
            {RECONS.map(r => {
              const rs = cart.state(r.sku);
              return (
                <div key={r.sku} className="st-rec">
                  <small>EUNACOM {r.month}</small>
                  <b>{r.year}</b>
                  <span style={{ fontSize: 12, color: 'var(--mute)' }}>{r.questions} preguntas</span>
                  <div className="row">
                    <span>{fmtClp(withCode(r.price))}</span>
                    <button className={`st-mini ${rs ? 'added' : ''}`} onClick={() => rs ? cart.setOpen(true) : cart.toggle(r.sku)}>{rs ? '✓' : '+'}</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {scrolled && !addVisible && !openSku && (
        <div className="st-sticky">
          <img src={product.thumb} alt="" />
          <div className="t">{product.title} · {v.name}<small>{fmtClp(withCode(price))}{coupon ? ` · ${coupon.code} -${coupon.percent}%` : off > 0 ? ` · -${off}%` : ''}</small></div>
          {cart.skus.length > 0 && <button className="cart" onClick={() => cart.setOpen(true)}><ShoppingCart size={15} style={{ verticalAlign: '-3px' }} /> {cart.skus.length}</button>}
          <button className="go" onClick={add}>{st ? 'Ver carrito' : 'Agregar al carrito'}</button>
        </div>
      )}
    </div>
  );
}
