import React from 'react';
import { CheckCircle2, ArrowRight, Play } from 'lucide-react';

const CHECKLIST = [
  '86 clases del temario oficial',
  '4.000+ preguntas con justificación',
  'Reconstrucciones de las pruebas desde 2013',
  'Seguimiento semanal con devolución escrita',
];

const METRICS = [
  { value: '4.000+', label: 'Preguntas comentadas' },
  { value: '86', label: 'Clases del temario oficial' },
  { value: '12 meses', label: 'Acompañamiento continuo' },
];

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
              <a href="#cursos" className="btn" style={{ backgroundColor: '#ffffff', color: '#08365f' }}>
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

          {/* Image slot, per the design's hero */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: '100%',
              maxWidth: '380px',
              aspectRatio: '3/4',
              background: 'rgba(255,255,255,.1)',
              border: '1px dashed rgba(255,255,255,.45)',
              borderRadius: '5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              fontFamily: 'var(--font-heading)',
              fontSize: '11px',
              fontWeight: '600',
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              color: '#bcdcf7',
              lineHeight: '2.2',
            }}>
              placeholder<br />imagen
            </div>
          </div>
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
