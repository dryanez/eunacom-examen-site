import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize, Sparkles, BookOpen, Clock, CheckCircle2, ArrowRight } from 'lucide-react';

const CHAPTERS = [
  { id: 1, time: 0, title: "00:00 - Introducción al Perfil ASOFAMECH & EUNACOM", duration: "04:30" },
  { id: 2, time: 270, title: "04:30 - Síndromes Coronarios Agudos (SDST vs SSDST) & GES", duration: "07:45" },
  { id: 3, time: 735, title: "12:15 - Insuficiencia Cardíaca: Los 4 Pilares de Tratamiento", duration: "09:25" },
  { id: 4, time: 1300, title: "21:40 - Fibrilación Auricular: Escala CHA2DS2-VASc & DOACs", duration: "10:30" },
  { id: 5, time: 1930, title: "32:10 - Urgencias y Emergencias Hipertensivas en APS", duration: "09:50" },
  { id: 6, time: 2520, title: "42:00 - Resolución en Vivo de 5 Casos Clínicos EUNACOM", duration: "15:00" }
];

const CLINICAL_PEARLS = [
  "En IAM con SDST, el tiempo puerta-balón debe ser < 90 min (o fibrinólisis < 30 min si el traslado supera 120 min) bajo protocolo GES.",
  "La terapia cuádruple de IC con FEVIr comprende: iSGLT2 (Dapa/Empa), ARNI (Sacubitril/Valsartán) o IECA/ARAII, Beta-bloqueador y ARM (Espironolactona).",
  "En Fibrilación Auricular, la indicación de anticoagulación oral en hombres es CHA2DS2-VASc ≥ 2 y en mujeres ≥ 3.",
  "Una PA > 180/120 mmHg sin daño de órgano blanco es Urgencia Hipertensiva: manejo oral ambulatorio (Captopril/Amlodipino), NUNCA nifedipino sublingual de liberación rápida."
];

export default function VideoMasterclassPlayer({ onSelectCourse, onOpenMentorship }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(3420); // 57 mins sample duration
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [activeChapter, setActiveChapter] = useState(CHAPTERS[0]);

  const handleSelectChapter = (chapter) => {
    setActiveChapter(chapter);
    setCurrentTime(chapter.time);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
  };

  // Structured Data VideoObject
  const videoSchema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": "Masterclass EUNACOM Cardiología de Alto Rendimiento 2026-2027",
    "description": "Clase clínica completa dictada por el equipo académico de Academia Examen EUNACOM sobre el temario oficial ASOFAMECH: SCA, Insuficiencia Cardíaca, Fibrilación Auricular y Crisis Hipertensivas.",
    "thumbnailUrl": "https://eunacom-examen.cl/og-image.jpg",
    "uploadDate": "2026-08-15T08:00:00-04:00",
    "duration": "PT57M",
    "contentUrl": "https://eunacom-examen.cl/#masterclass",
    "embedUrl": "https://eunacom-examen.cl/#masterclass",
    "author": {
      "@type": "Physician",
      "name": "Academia Examen EUNACOM",
      "medicalSpecialty": "General Surgery & Medical Education",
      "areaServed": "Chile"
    }
  };

  return (
    <section id="clase-magistral" style={{ padding: '80px 0', backgroundColor: '#08365f', color: '#ffffff' }}>
      <div id="masterclass" style={{ position: 'relative', top: '-80px' }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
      />

      <div className="container">

        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 48px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            color: '#a9d3f5',
            padding: '6px 16px',
            borderRadius: '3px',
            fontSize: '0.85rem',
            fontWeight: '700',
            marginBottom: '14px',
            border: '1px solid rgba(169, 211, 245, 0.3)'
          }}>
            <Sparkles size={16} />
            <span>CLASE DE MUESTRA COMPLETA (57 MINUTOS)</span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.9rem, 3.2vw, 2.7rem)',
            fontWeight: '800',
            color: '#ffffff',
            lineHeight: '1.2',
            marginBottom: '16px'
          }}>
            Masterclass: <span style={{ color: '#a9d3f5' }}>Cardiología EUNACOM</span> de Alto Rendimiento
          </h2>

          <p style={{
            fontSize: '1.05rem',
            color: '#eef5fb',
            lineHeight: '1.6'
          }}>
            Experimenta la metodología de nuestras 86 clases oficiales: análisis fisiopatológico, correlación con guías clínicas GES/MINSAL y resolución de distractores en tiempo real.
          </p>
        </div>

        {/* Video Player Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '32px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1.5px solid rgba(169, 211, 245, 0.25)',
          borderRadius: '5px',
          padding: '28px',
          backdropFilter: 'blur(10px)'
        }} className="player-grid">

          {/* Video Mockup Screen */}
          <div>
            <div style={{
              position: 'relative',
              borderRadius: '4px',
              overflow: 'hidden',
              backgroundColor: '#08365f',
              aspectRatio: '16/9',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 18px 44px rgba(8,54,95,.22)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>

              {/* Watermark / Teacher Badge */}
              <div style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#08365f 0%, rgba(0,0,0,0) 100%)',
                zIndex: 2
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    backgroundColor: '#0b5ea8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    border: '1.5px solid #a9d3f5'
                  }}>
                    FY
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#ffffff' }}>Academia Examen EUNACOM</div>
                    <div style={{ fontSize: '0.7rem', color: '#a9d3f5' }}>Cardiología & Urgencias Médicas</div>
                  </div>
                </div>

                <div style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.85)',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: '800',
                  padding: '3px 10px',
                  borderRadius: '3px',
                  letterSpacing: '0.04em'
                }}>
                  CLASE 100% OFICIAL
                </div>
              </div>

              {/* Video Center Presentation Content */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '20px',
                zIndex: 1
              }}>
                {!isPlaying ? (
                  <button
                    onClick={togglePlay}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      backgroundColor: '#0b5ea8',
                      border: '3px solid #ffffff',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 6px 20px rgba(8,54,95,.10)',
                      transition: 'transform 0.2s',
                      marginBottom: '16px'
                    }}
                  >
                    <Play size={36} fill="#ffffff" style={{ marginLeft: '4px' }} />
                  </button>
                ) : (
                  <div style={{
                    backgroundColor: 'rgba(8, 54, 95, 0.9)',
                    border: '1.5px solid #a9d3f5',
                    borderRadius: '4px',
                    padding: '24px',
                    maxWidth: '480px',
                    textAlign: 'left'
                  }}>
                    <div style={{ color: '#a9d3f5', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px' }}>
                      REPRODUCIENDO CAPÍTULO ACTIVO:
                    </div>
                    <div style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: '800', marginBottom: '8px' }}>
                      {activeChapter.title}
                    </div>
                    <div style={{ color: '#eef5fb', fontSize: '0.85rem', lineHeight: '1.5' }}>
                      Resolviendo algoritmo de decisiones para el examen de 180 preguntas.
                    </div>
                  </div>
                )}
                <div style={{ fontSize: '0.9rem', color: '#eef5fb', fontWeight: '600' }}>
                  {!isPlaying ? 'Haz clic para reproducir la Masterclass en video HD' : 'Audio & Diapositivas Sincronizadas'}
                </div>
              </div>

              {/* Video Bottom Player Controls */}
              <div style={{
                padding: '12px 20px',
                background: '#08365f 0%, rgba(0,0,0,0) 100%)',
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <button
                    onClick={togglePlay}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {isPlaying ? <Pause size={22} /> : <Play size={22} />}
                  </button>

                  <span style={{ fontSize: '0.8rem', color: '#eef5fb', fontWeight: '600' }}>
                    {activeChapter.duration} / 57:00
                  </span>
                </div>

                {/* Playback Speeds */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {[1, 1.25, 1.5, 2].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => handleSpeedChange(spd)}
                      style={{
                        background: playbackSpeed === spd ? '#0b5ea8' : 'rgba(255, 255, 255, 0.15)',
                        border: 'none',
                        color: '#ffffff',
                        padding: '3px 8px',
                        borderRadius: '3px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Clinical Takeaways Box */}
            <div style={{
              marginTop: '24px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '4px',
              padding: '20px',
              border: '1px solid rgba(169, 211, 245, 0.2)'
            }}>
              <h4 style={{
                fontSize: '1rem',
                fontWeight: '800',
                color: '#a9d3f5',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <BookOpen size={18} />
                <span>Perlas Clínicas EUNACOM de esta Masterclass:</span>
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {CLINICAL_PEARLS.map((pearl, pIdx) => (
                  <div key={pIdx} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    fontSize: '0.85rem',
                    color: '#eef5fb',
                    lineHeight: '1.45'
                  }}>
                    <CheckCircle2 size={16} color="#a9d3f5" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{pearl}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chapter Markers Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                borderBottom: '1px solid rgba(169, 211, 245, 0.2)',
                paddingBottom: '12px'
              }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                  Índice de Capítulos (6 Módulos)
                </h4>
                <span style={{ fontSize: '0.75rem', color: '#a9d3f5', fontWeight: '700' }}>
                  Video HD 1080p
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {CHAPTERS.map((chapter) => {
                  const isSelected = activeChapter.id === chapter.id;
                  return (
                    <button
                      key={chapter.id}
                      onClick={() => handleSelectChapter(chapter)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '4px',
                        backgroundColor: isSelected ? '#0b5ea8' : 'rgba(255, 255, 255, 0.08)',
                        border: isSelected ? '1.5px solid #a9d3f5' : '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#ffffff',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Play size={14} fill={isSelected ? '#ffffff' : 'none'} color="#a9d3f5" />
                        <span style={{ fontSize: '0.85rem', fontWeight: isSelected ? '700' : '500' }}>
                          {chapter.title}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#a9d3f5', fontWeight: '600' }}>
                        {chapter.duration}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CTA Box */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              borderRadius: '4px',
              padding: '20px',
              border: '1px solid rgba(169, 211, 245, 0.3)'
            }}>
              <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#ffffff', marginBottom: '6px' }}>
                ¿Quieres acceder a las 86 clases completas del temario?
              </div>
              <p style={{ fontSize: '0.82rem', color: '#eef5fb', margin: '0 0 14px 0', lineHeight: '1.4' }}>
                Inscríbete en el Curso Anual o 6 Meses y obtén acceso inmediato a todas las especialidades médicas.
              </p>
              <a
                href="#cursos"
                className="btn"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#08365f',
                  fontWeight: '700',
                  fontSize: '0.88rem',
                  padding: '10px 16px',
                  width: '100%',
                  justifyContent: 'center'
                }}
              >
                <span>Ver Cursos Disponibles</span>
                <ArrowRight size={16} />
              </a>
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
