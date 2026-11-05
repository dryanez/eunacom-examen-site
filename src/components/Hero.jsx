import React, { useEffect, useState } from 'react';
import { CheckCircle2, ArrowRight, Play } from 'lucide-react';

const CHECKLIST = [
  'Más de 460 clases en video del temario oficial',
  'Más de 10.800 preguntas con explicación',
  '16 exámenes reales reconstruidos (2013-2025)',
  'Seguimiento semanal con devolución escrita',
];

const METRICS = [
  { value: '10.800+', label: 'Preguntas comentadas' },
  { value: '468', label: 'Clases en video' },
  { value: '16', label: 'Exámenes reales reconstruidos' },
  { value: '12 meses', label: 'Acompañamiento continuo' },
];

// Mix of every book type so visitors see manuales, atlas, reconstrucciones, Perfil V3, Libro Gordo, repasos.
const TOMOS = [
  'tomo_pediatria', 'tomo_cardiologia', 'atlas_dermatologia', 'reconstrucciones', 'perfil_neurologia',
  'gordo_cirugia', 'repaso_ginecologia', 'atlas_cardiologia', 'tomo_neurologia', 'perfil-v3-completo',
  'gordo_obstetricia', 'atlas_traumatologia', 'repaso_infectologia', 'gran-libro-gordo', 'tomo_cirugia',
  'perfil_pediatria', 'atlas_oftalmologia', 'repaso_cardiologia', 'gordo_psiquiatria', 'atlas_neumologia',
].map(k => `/covers/${k}.jpg`);

// Slot by position relative to the current index: 0 left, 1 front, 2 right; the rest hidden.
const SLOTS = {
  left: { transform: 'translate(-38%, 6%) rotate(-8deg) scale(.9)', zIndex: 1, opacity: 1, filter: 'brightness(.8)' },
  front: { transform: 'translate(0, 0) rotate(0deg) scale(1)', zIndex: 3, opacity: 1, filter: 'brightness(1)' },
  right: { transform: 'translate(38%, 6%) rotate(8deg) scale(.9)', zIndex: 2, opacity: 1, filter: 'brightness(.8)' },
  outLeft: { transform: 'translate(-70%, 10%) rotate(-16deg) scale(.78)', zIndex: 0, opacity: 0, filter: 'brightness(.6)' },
  inRight: { transform: 'translate(70%, 10%) rotate(16deg) scale(.78)', zIndex: 0, opacity: 0, filter: 'brightness(.6)' },
};

function HeroBooks() {
  const n = TOMOS.length;
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setIdx(i => (i + 1) % n), 3200);
    return () => clearInterval(t);
  }, [paused, n]);

  const slotFor = pos => ['left', 'front', 'right', 'inRight'][pos] || (pos === n - 1 ? 'outLeft' : null);

  return (
    <a
      href="#manuales"
      aria-label="Ver manuales, atlas y reconstrucciones"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ display: 'flex', justifyContent: 'center' }}
    >
      <div style={{ position: 'relative', width: '100%', maxWidth: '400px', aspectRatio: '4/4.2' }}>
        {TOMOS.map((src, i) => {
          const slot = slotFor((i - idx + n) % n);
          if (!slot) return null;
          return (
            <img key={src} src={src} alt="Portada de manual EUNACOM" style={{
              position: 'absolute', left: '21%', top: 0, width: '58%', aspectRatio: '210/297', objectFit: 'cover',
              borderRadius: '3px', boxShadow: '0 18px 40px rgba(0,0,0,.35)',
              transition: 'transform .9s cubic-bezier(.65,0,.25,1), opacity .9s ease, filter .9s ease',
              ...SLOTS[slot],
            }} />
          );
        })}
      </div>
    </a>
  );
}

export default function Hero({ onOpenMentorship, onStartDiagnostic }) {
  return (
    <section style={{ background: '#0b5ea8', color: '#ffffff', padding: '64px 0 72px' }}>
      <div className="container">
        <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px', alignItems: 'center' }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '12px',
              fontWeight: '700',
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              color: '#bcdcf7',
              marginBottom: '16px',
            }}>
              Preparación EUNACOM · Santiago de Chile
            </div>

            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(30px, 3.8vw, 46px)',
              fontWeight: '800',
              lineHeight: '1.15',
              color: '#ffffff',
              marginBottom: '18px',
              letterSpacing: '-.01em',
            }}>
              Aprueba el EUNACOM con un método que ordena tu tiempo
            </h1>

            <p style={{
              fontSize: '16px',
              color: '#e8f0f7',
              lineHeight: '1.8',
              marginBottom: '30px',
              maxWidth: '620px',
            }}>
              Preparación para médicos nacionales y extranjeros: clases grabadas por cada tema del temario
              oficial, manuales clínicos en PDF, banco de preguntas comentadas, reconstrucciones de pruebas
              anteriores y simulacros cronometrados.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '36px' }}>
              <a href="#tienda" className="btn" style={{ backgroundColor: '#ffffff', color: '#08365f' }}>
                <span>Ver cursos online</span>
                <ArrowRight size={16} />
              </a>
              <button
                onClick={onStartDiagnostic}
                className="btn"
                style={{ backgroundColor: 'transparent', color: '#ffffff', border: '1px solid rgba(255,255,255,.5)' }}
              >
                <Play size={15} />
                <span>Pruebas gratis</span>
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: '10px',
              fontSize: '14.5px',
              color: '#e8f0f7',
            }}>
              {CHECKLIST.map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={17} color="#bcdcf7" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Real tomo covers, fanned and rotating */}
          <HeroBooks />
        </div>

        <div style={{
          marginTop: '52px',
          paddingTop: '32px',
          borderTop: '1px solid rgba(188, 220, 247, .25)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px',
        }}>
          {METRICS.map((m) => (
            <div key={m.label}>
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '32px',
                fontWeight: '800',
                color: '#ffffff',
                lineHeight: '1.2',
              }}>
                {m.value}
              </div>
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '11.5px',
                fontWeight: '600',
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                color: '#bcdcf7',
              }}>
                {m.label}
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button onClick={onOpenMentorship} className="btn" style={{ backgroundColor: '#08365f', color: '#ffffff' }}>
              Hablar con la academia
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .hero-grid { grid-template-columns: 1.3fr 0.7fr !important; }
        }
      `}</style>
    </section>
  );
}
