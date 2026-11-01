import React, { useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, Clock, Users, MonitorPlay, Check, Sparkles } from 'lucide-react';
import { COURSES } from '../data/coursesData';
import { SPECIALTIES, MODULES, MODULE_PACKS, PRODUCTS, TYPES, fmtClp, looseValue } from '../data/tienda';
import EmbeddedCheckout from './EmbeddedCheckout';
import '../styles/store.css';

const COURSE_PRICE = 359000;
const cov = (key, type) => SPECIALTIES.find(s => s.key === key).items.find(i => i.type === type)?.cover;

// What the full course includes, each with a picture of the real material.
const INCLUDES = [
  { n: '468', t: 'Clases en video', d: '96 horas, una clase por tema, con animaciones y casos tipo examen.', img: cov('cardiologia', 'clases'), wide: true },
  { n: '21', t: 'Manuales', d: 'La teoría completa de cada especialidad, alineada al Perfil V3.', imgs: ['cardiologia', 'pediatria', 'neurologia'].map(k => cov(k, 'tomo')) },
  { n: '1.890', t: 'Preguntas tipo examen', d: '21 Libros Gordos de 90 preguntas, con clave y explicación.', imgs: ['cardiologia', 'gastroenterologia', 'obstetricia'].map(k => cov(k, 'gordo')) },
  { n: '16', t: 'EUNACOM reconstruidos', d: 'Exámenes reales 2013–2025, para hacerlos cronometrados.', imgs: ['/covers/q_recons.jpg'] },
  { n: '21', t: 'Repaso Final', d: 'Un tema por página para la última semana.', imgs: ['cardiologia', 'pediatria'].map(k => cov(k, 'repaso')) },
  { n: '19', t: 'Atlas de imágenes', d: 'ECG, radiografías y fotos clínicas, con lo que tienes que ver.', imgs: ['cardiologia', 'dermatologia'].map(k => cov(k, 'atlas')) },
  { n: '21', t: 'Mazos Anki', d: 'Repetición espaciada con los códigos del Perfil V3.', imgs: ['/covers/anki.jpg'] },
  { n: '1.569', t: 'Códigos del Perfil V3', d: 'Cada código explicado: qué exige el examen y dónde estudiarlo.', imgs: ['cardiologia', 'pediatria'].map(k => cov(k, 'perfil')) },
];

export default function CursoTeoricoPage({ onNavigateHome }) {
  const [courseSlug, setCourseSlug] = useState(COURSES[0].slug);
  const course = COURSES.find(c => c.slug === courseSlug);
  const checkoutRef = useRef(null);

  // Options in the checkout: the full course, or one module (videos + every book of its specialties).
  const options = useMemo(() => [
    { sku: `curso-${course.slug}`, name: course.nombre, price: COURSE_PRICE, desc: 'Todo el temario + seguimiento de estudio', tag: 'Curso completo' },
    ...MODULE_PACKS.map(m => ({ sku: m.sku, name: m.name, price: m.price, desc: `${m.specs.length} especialidades · ${m.clases} clases + todos sus libros`, was: looseValue(m.sku) })),
    { sku: 'esp-saludpublica', name: 'Módulo 4 entero · Salud Pública', price: PRODUCTS['esp-saludpublica'].price, desc: '15 clases + todos sus libros', was: looseValue('esp-saludpublica') },
  ], [course]);
  const [sel, setSel] = useState(null);
  const item = options.find(o => o.sku === sel) || options[0];
  const totalLoose = looseValue('pack-total');

  const goCheckout = sku => {
    if (sku) setSel(sku);
    checkoutRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const goTienda = () => { window.location.hash = '#tienda'; window.scrollTo({ top: 0 }); };

  return (
    <div className="st">
      <div className="st-wrap">
        <button onClick={() => onNavigateHome('')} className="st-mini" style={{ margin: '18px 0 0', display: 'inline-flex', alignItems: 'center', gap: 6 }}><ArrowLeft size={14} /> Inicio</button>

        {/* Hero */}
        <div className="st-product" style={{ paddingTop: 18 }}>
          <div className="st-gallery" style={{ position: 'static' }}>
            <div className="st-stage" style={{ aspectRatio: '4/3.4' }}>
              <div className="st-slide on" style={{ flexDirection: 'column', gap: 14 }}>
                <img className="st-book wide" src={cov('cardiologia', 'clases')} alt="Clase en video" style={{ width: '88%', aspectRatio: '16/9', borderRadius: 10 }} />
                <div style={{ display: 'flex', gap: 10, width: '88%' }}>
                  {['tomo', 'gordo', 'repaso', 'atlas', 'perfil'].map(t => <img key={t} className="st-book" src={cov('cardiologia', t)} alt="" style={{ flex: 1, minWidth: 0, aspectRatio: '210/297' }} />)}
                </div>
                <span className="cap">Todo esto, para las 21 especialidades</span>
              </div>
            </div>
          </div>

          <div className="st-info">
            <div className="st-kicker">Curso teórico · {course.estado}</div>
            <h1>{course.headerTitulo}</h1>
            <p className="st-lead">468 clases en video, 21 manuales, 1.890 preguntas, 16 exámenes reconstruidos y seguimiento de tu estudio hasta el día del examen.</p>

            <div className="st-step-head small"><span className="n">1</span><div><b>Elige tu modalidad</b><small>Mismo contenido, distinto ritmo</small></div></div>
            <div className="st-variants">
              {COURSES.map(c => (
                <button key={c.slug} className={`st-var ${c.slug === courseSlug ? 'on' : ''}`} onClick={() => { setCourseSlug(c.slug); setSel(null); }} style={{ gridTemplateColumns: '1fr auto' }}>
                  {c.badge && <span className="tag">{c.badge}</span>}
                  <span>
                    <div className="nm">{c.kicker.replace('Curso teórico · ', 'Online ')}</div>
                    <div className="ds">{c.duracion} · inicio {c.inicio} · examen {c.examen}</div>
                  </span>
                  <span className="pr"><b>{fmtClp(COURSE_PRICE)}</b><s>{fmtClp(totalLoose)}</s></span>
                </button>
              ))}
            </div>

            <ul className="st-perks">
              <li><MonitorPlay size={18} /> {course.modalidad}</li>
              <li><CalendarDays size={18} /> Examen: {course.examen}</li>
              <li><Users size={18} /> {course.cupos}</li>
            </ul>
            <button className="st-add" onClick={() => goCheckout(`curso-${course.slug}`)}>Inscribirme · {fmtClp(COURSE_PRICE)} <ArrowRight size={18} /></button>
            <div className="st-pay"><span>Mercado Pago en cuotas</span><span>Webpay</span><span>PayPal</span><span>Transferencia</span></div>
          </div>
        </div>
      </div>

      {/* Everything included, with pictures */}
      <section className="st-sec" style={{ background: 'var(--soft)' }}>
        <div className="st-wrap">
          <h2>Todo lo que recibes</h2>
          <p className="sub">Por separado, todo este material cuesta {fmtClp(totalLoose)}. En el curso completo pagas {fmtClp(COURSE_PRICE)} y sumas el seguimiento.</p>
          <div className="inc-grid">
            {INCLUDES.map(x => (
              <div key={x.t} className="inc">
                <div className="inc-img">
                  {x.wide ? <img className="st-book wide" src={x.img} alt="" style={{ width: '100%', aspectRatio: '16/9', borderRadius: 8 }} />
                    : <div className="fan">{x.imgs.map((s, i) => <img key={i} className="st-book" src={s} alt="" />)}</div>}
                </div>
                <div className="inc-n">{x.n}</div>
                <b>{x.t}</b>
                <p>{x.d}</p>
              </div>
            ))}
            <div className="inc inc-dark">
              <Sparkles size={26} color="#0bd9e7" />
              <div className="inc-n" style={{ color: '#fff' }}>+</div>
              <b style={{ color: '#fff' }}>Seguimiento de estudio</b>
              <p style={{ color: '#a9c6de' }}>Solo en el curso: plan semanal, control de avance y simulacros con feedback.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Syllabus by module, real numbers */}
      <section className="st-sec">
        <div className="st-wrap">
          <h2>El temario, módulo por módulo</h2>
          <p className="sub">21 especialidades del Perfil EUNACOM V3. Toca una para ver sus libros en la tienda.</p>
          <div className="mods">
            {MODULES.map(m => {
              const specs = SPECIALTIES.filter(s => s.module === m.id);
              const clases = specs.reduce((n, s) => n + Number((s.items.find(i => i.type === 'clases')?.label || '0').split(' ')[0]), 0);
              return (
                <div key={m.id} className="mod">
                  <div className="mod-h"><span>Módulo {m.id}</span><b>{m.name}</b><small>{specs.length} especialidades · {clases} clases</small></div>
                  <div className="mod-specs">
                    {specs.map(s => (
                      <a key={s.key} href="#tienda" onClick={goTienda} style={{ '--c': s.color }}>
                        <img src={s.cover} alt="" />{s.title}
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Checkout */}
      <section className="st-sec" ref={checkoutRef} style={{ background: 'var(--soft)', scrollMarginTop: 80 }}>
        <div className="st-wrap ck-wrap">
          <div>
            <h2 style={{ textAlign: 'left' }}>Inscríbete</h2>
            <p className="sub" style={{ textAlign: 'left', margin: '0 0 18px' }}>Elige el curso completo o solo el módulo que te falta. Pagas aquí mismo.</p>
            <div className="st-variants">
              {options.map(o => (
                <button key={o.sku} className={`st-var ${o.sku === item.sku ? 'on' : ''}`} onClick={() => setSel(o.sku)} style={{ gridTemplateColumns: '1fr auto' }}>
                  {o.tag && <span className="tag">{o.tag}</span>}
                  <span><div className="nm">{o.name}</div><div className="ds">{o.desc}</div></span>
                  <span className="pr"><b>{fmtClp(o.price)}</b>{o.was > o.price && <s>{fmtClp(o.was)}</s>}</span>
                </button>
              ))}
            </div>
            <button className="st-mini" onClick={goTienda} style={{ marginTop: 14, width: '100%', padding: 12 }}>
              ¿Solo una especialidad o un libro? Ver la tienda →
            </button>
          </div>
          <EmbeddedCheckout item={item} />
        </div>
      </section>
    </div>
  );
}
