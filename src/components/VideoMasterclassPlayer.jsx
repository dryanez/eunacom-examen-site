import React, { useEffect, useState } from 'react';
import { Play, Sparkles, BookOpen, Clock, CheckCircle2, ArrowRight } from 'lucide-react';

// Free sample classes shown on the landing, in order (all are within the Aula's free lessons per specialty).
const SAMPLE_IDS = ['cardio-01', 'gastro-01', 'resp-01', 'ped-01', 'ob-01', 'cirugia-01'];

const fmt = (min) => (min ? `${min} min` : '');

export default function VideoMasterclassPlayer() {
  const [samples, setSamples] = useState([]);
  const [totals, setTotals] = useState(null);
  const [active, setActive] = useState(null);

  useEffect(() => {
    fetch('/aula/catalog.json').then(r => r.json()).then(catalog => {
      const all = catalog.modules.flatMap(m => m.specialties.flatMap(s => s.lessons.map(l => ({ ...l, specialty: s.name, accent: s.accent }))));
      const picked = SAMPLE_IDS.map(id => all.find(l => l.id === id && l.video)).filter(Boolean);
      setSamples(picked);
      setActive(picked[0] || null);
      setTotals({
        classes: all.filter(l => l.video).length,
        hours: Math.round(all.reduce((n, l) => n + (l.minutes || 0), 0) / 60),
        specialties: catalog.modules.reduce((n, m) => n + m.specialties.length, 0),
      });
    }).catch(() => {});
  }, []);

  const goToAula = (id) => {
    window.location.hash = id ? `#aula/${id}` : '#aula';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const videoSchema = active && {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": `${active.specialty}: ${active.title}`,
    "description": `Clase gratuita del Curso Teórico EUNACOM (Perfil V3): ${active.title}.`,
    "thumbnailUrl": "https://eunacom-examen.cl/og-image.jpg",
    "uploadDate": "2026-10-19T08:00:00-03:00",
    "duration": `PT${active.minutes || 10}M`,
    "contentUrl": active.video,
    "embedUrl": `https://eunacom-examen.cl/#aula/${active.id}`,
  };

  return (
    <section id="clase-magistral" style={{ padding: '80px 0', backgroundColor: '#08365f', color: '#ffffff' }}>
      <div id="masterclass" style={{ position: 'relative', top: '-80px' }} />
      {videoSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }} />
      )}

      <div className="container">

        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 48px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.12)', color: '#a9d3f5',
            padding: '6px 16px', borderRadius: '3px', fontSize: '0.85rem', fontWeight: '700',
            marginBottom: '14px', border: '1px solid rgba(169, 211, 245, 0.3)'
          }}>
            <Sparkles size={16} />
            <span>CLASES DE MUESTRA GRATIS · SIN REGISTRO</span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.9rem, 3.2vw, 2.7rem)', fontWeight: '800',
            color: '#ffffff', lineHeight: '1.2', marginBottom: '16px'
          }}>
            Clase magistral: <span style={{ color: '#a9d3f5' }}>mira una clase real</span> del curso
          </h2>

          <p style={{ fontSize: '1.05rem', color: '#eef5fb', lineHeight: '1.6' }}>
            {totals
              ? `Estas son clases completas del Aula virtual: ${totals.classes} clases en video, ${totals.hours} horas y ${totals.specialties} especialidades del Perfil EUNACOM V3, con casos clínicos tipo examen.`
              : 'Clases completas del Aula virtual, alineadas al Perfil EUNACOM V3, con casos clínicos tipo examen.'}
          </p>
        </div>

        {/* Player + playlist */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr', gap: '32px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1.5px solid rgba(169, 211, 245, 0.25)',
          borderRadius: '5px', padding: '28px'
        }} className="player-grid">

          <div>
            <div style={{
              position: 'relative', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#000',
              aspectRatio: '16/9', boxShadow: '0 18px 44px rgba(8,54,95,.22)', border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              {active ? (
                <video
                  key={active.id}
                  src={active.video}
                  controls
                  preload="metadata"
                  playsInline
                  controlsList="nodownload"
                  style={{ width: '100%', height: '100%', display: 'block' }}
                />
              ) : (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a9d3f5' }}>
                  Cargando clase…
                </div>
              )}
            </div>

            {active && (
              <div style={{
                marginTop: '24px', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px',
                padding: '20px', border: '1px solid rgba(169, 211, 245, 0.2)'
              }}>
                <div style={{ fontSize: '0.78rem', fontWeight: '800', letterSpacing: '.05em', textTransform: 'uppercase', color: '#a9d3f5' }}>
                  {active.specialty} {active.num && `· Clase ${active.num}`}
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#ffffff', margin: '6px 0 12px' }}>{active.title}</div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#a9d3f5', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={16} /> <span>En esta clase</span>
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {active.chapters.map(c => (
                    <div key={c} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.85rem', color: '#eef5fb', lineHeight: '1.45' }}>
                      <CheckCircle2 size={16} color="#a9d3f5" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Playlist */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px',
                borderBottom: '1px solid rgba(169, 211, 245, 0.2)', paddingBottom: '12px'
              }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff', margin: 0 }}>Clases de muestra</h4>
                <span style={{ fontSize: '0.75rem', color: '#a9d3f5', fontWeight: '700' }}>{samples.length} clases gratis</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {samples.map((l) => {
                  const isSelected = active?.id === l.id;
                  return (
                    <button
                      key={l.id}
                      onClick={() => setActive(l)}
                      style={{
                        padding: '12px 16px', borderRadius: '4px',
                        backgroundColor: isSelected ? '#0b5ea8' : 'rgba(255, 255, 255, 0.08)',
                        border: isSelected ? '1.5px solid #a9d3f5' : '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#ffffff', textAlign: 'left', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <Play size={14} fill={isSelected ? '#ffffff' : 'none'} color="#a9d3f5" style={{ flexShrink: 0, marginTop: '3px' }} />
                        <span style={{ fontSize: '0.85rem', lineHeight: 1.4 }}>
                          <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#a9d3f5', textTransform: 'uppercase', letterSpacing: '.04em' }}>{l.specialty}</span>
                          <span style={{ fontWeight: isSelected ? '700' : '500' }}>{l.title}</span>
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#a9d3f5', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                        <Clock size={12} /> {fmt(l.minutes)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CTA Box */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.12)', borderRadius: '4px', padding: '20px',
              border: '1px solid rgba(169, 211, 245, 0.3)'
            }}>
              <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#ffffff', marginBottom: '6px' }}>
                {totals ? `¿Quieres ver las ${totals.classes} clases del temario?` : '¿Quieres ver todas las clases del temario?'}
              </div>
              <p style={{ fontSize: '0.82rem', color: '#eef5fb', margin: '0 0 14px 0', lineHeight: '1.4' }}>
                Entra al Aula virtual: el curso completo ordenado por módulo y especialidad, con tu avance guardado.
              </p>
              <button
                onClick={() => goToAula(active?.id)}
                className="btn"
                style={{
                  backgroundColor: '#ffffff', color: '#08365f', fontWeight: '700', fontSize: '0.88rem',
                  padding: '10px 16px', width: '100%', justifyContent: 'center', border: 'none', cursor: 'pointer'
                }}
              >
                <span>Ir al Aula virtual</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @media (min-width: 950px) {
          .player-grid {
            grid-template-columns: 1.35fr 0.9fr !important;
          }
        }
      `}</style>
    </section>
  );
}
