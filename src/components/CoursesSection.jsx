import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CoursesSection({
  onNavigateCursoTeorico,
  onNavigateCursoPractico,
  onOpenMentorship
}) {
  const handleOpenTeorico = () => {
    if (onNavigateCursoTeorico) {
      onNavigateCursoTeorico();
    } else {
      window.location.hash = '#curso-teorico';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenPractico = () => {
    if (onNavigateCursoPractico) {
      onNavigateCursoPractico();
    } else {
      window.location.hash = '#curso-practico';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <section id="cursos" style={{ padding: '72px 0 88px', backgroundColor: '#f4f8fb' }}>
      <div className="container" style={{ maxWidth: '1080px', padding: '0 24px' }}>

        {/* Section Heading matching screenshot */}
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 3.5vw, 2.6rem)',
            fontWeight: '700',
            color: '#08365f',
            margin: '0 0 12px 0',
            letterSpacing: '-0.01em'
          }}>
            Cursos y precios
          </h2>
          <p style={{
            fontSize: '1.05rem',
            color: '#475569',
            maxWidth: '650px',
            margin: '0 auto',
            lineHeight: '1.5'
          }}>
            Programas oficiales de preparación médica para las dos etapas de revalidación del EUNACOM en Chile.
          </p>
        </div>

        {/* Two-Column Split Grid matching media_1788732078596.png */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '28px',
          alignItems: 'stretch'
        }}>

          {/* CARD 1: CURSO TEÓRICO (TEAL) */}
          <div
            style={{
              backgroundColor: '#1fa2b1',
              borderRadius: '12px',
              padding: '40px 32px 32px',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 10px 30px rgba(31, 162, 177, 0.22)',
              position: 'relative',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
          >
            <div>
              {/* Header Title & Subtitle */}
              <h3 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(1.7rem, 2.5vw, 2.1rem)',
                fontWeight: '700',
                color: '#ffffff',
                margin: '0 0 6px 0',
                textAlign: 'center'
              }}>
                Curso teórico
              </h3>

              <p style={{
                fontSize: '1.05rem',
                color: '#e0f6f9',
                margin: '0 0 36px 0',
                textAlign: 'center',
                fontWeight: '500'
              }}>
                En tres modalidades
              </p>

              {/* 3 Modalities Icons Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                textAlign: 'center',
                alignItems: 'flex-start',
                marginBottom: '40px',
                padding: '0 4px'
              }}>

                {/* Modality 1: Online Intensivo */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                    {/* Laptop SVG */}
                    <svg width="44" height="38" viewBox="0 0 44 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="5" y="3" width="34" height="24" rx="2.5" stroke="#ffffff" strokeWidth="2.5" fill="none" />
                      <line x1="5" y1="21" x2="39" y2="21" stroke="#ffffff" strokeWidth="1.5" />
                      <path d="M2 29C2 27.8954 2.89543 27 4 27H40C41.1046 27 42 27.8954 42 29V31C42 32.6569 40.6569 34 39 34H5C3.34315 34 2 32.6569 2 31V29Z" fill="#ffffff" />
                      <line x1="18" y1="29" x2="26" y2="29" stroke="#1fa2b1" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span style={{
                    fontSize: '0.88rem',
                    color: '#ffffff',
                    fontWeight: '600',
                    lineHeight: '1.25'
                  }}>
                    online intensivo
                  </span>
                </div>

                {/* Modality 2: Online Regular */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                    {/* Desktop Monitor SVG */}
                    <svg width="44" height="38" viewBox="0 0 44 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="4" y="2" width="36" height="25" rx="2.5" stroke="#ffffff" strokeWidth="2.5" fill="none" />
                      <line x1="4" y1="20" x2="40" y2="20" stroke="#ffffff" strokeWidth="1.5" />
                      <path d="M18 28H26L28 35H16L18 28Z" fill="#ffffff" />
                      <rect x="13" y="34" width="18" height="2.5" rx="1" fill="#ffffff" />
                      {/* Document lines on monitor */}
                      <line x1="10" y1="8" x2="22" y2="8" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
                      <line x1="10" y1="12" x2="34" y2="12" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
                      <line x1="10" y1="16" x2="28" y2="16" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span style={{
                    fontSize: '0.88rem',
                    color: '#ffffff',
                    fontWeight: '600',
                    lineHeight: '1.25'
                  }}>
                    online regular
                  </span>
                </div>

                {/* Modality 3: Semipresencial */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                    {/* 3 People / Team SVG */}
                    <svg width="44" height="38" viewBox="0 0 44 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Center Person */}
                      <circle cx="22" cy="11" r="5" stroke="#ffffff" strokeWidth="2.2" fill="none" />
                      <path d="M14 27C14 22.8 17.5 20 22 20C26.5 20 30 22.8 30 27" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
                      {/* Left Person */}
                      <circle cx="11" cy="14" r="3.8" stroke="#ffffff" strokeWidth="1.8" fill="none" />
                      <path d="M5 28C5 25 7.5 22.5 11 22.5" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
                      {/* Right Person */}
                      <circle cx="33" cy="14" r="3.8" stroke="#ffffff" strokeWidth="1.8" fill="none" />
                      <path d="M33 22.5C36.5 22.5 39 25 39 28" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span style={{
                    fontSize: '0.88rem',
                    color: '#ffffff',
                    fontWeight: '600',
                    lineHeight: '1.25'
                  }}>
                    semipresencial
                  </span>
                </div>

              </div>
            </div>

            {/* Ver Detalles Button */}
            <button
              onClick={handleOpenTeorico}
              style={{
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                color: '#167683',
                border: 'none',
                borderRadius: '6px',
                padding: '14px 20px',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>Ver detalles</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* CARD 2: CURSO PRÁCTICO (BLUE) */}
          <div
            style={{
              backgroundColor: '#2b7cb6',
              borderRadius: '12px',
              padding: '40px 32px 32px',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 10px 30px rgba(43, 124, 182, 0.22)',
              position: 'relative',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
          >
            <div>
              {/* Header Title & Subtitle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
                <h3 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(1.7rem, 2.5vw, 2.1rem)',
                  fontWeight: '700',
                  color: '#ffffff',
                  margin: 0,
                  textAlign: 'center'
                }}>
                  Curso práctico
                </h3>
              </div>

              <p style={{
                fontSize: '1rem',
                color: '#e0effa',
                margin: '0 0 24px 0',
                textAlign: 'center',
                fontWeight: '500',
                lineHeight: '1.4'
              }}>
                Simulaciones del Eunacom práctico, en la modalidad ECOE.
              </p>

              {/* Center Graphic: Monitor with Gauge & Próximamente Badge */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '32px'
              }}>
                {/* Monitor with Gauge SVG */}
                <div style={{ marginBottom: '12px' }}>
                  <svg width="68" height="58" viewBox="0 0 68 58" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Monitor Outer */}
                    <rect x="4" y="3" width="60" height="38" rx="3.5" stroke="#ffffff" strokeWidth="2.5" fill="#1b5a88" />
                    <line x1="4" y1="32" x2="64" y2="32" stroke="#ffffff" strokeWidth="1.5" />
                    {/* Stand & Base */}
                    <path d="M28 41H40L42 50H26L28 41Z" fill="#ffffff" />
                    <rect x="20" y="50" width="28" height="3" rx="1.5" fill="#ffffff" />
                    {/* Speedometer Gauge Dial */}
                    <path d="M22 25 A 12 12 0 0 1 46 25" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                    <circle cx="34" cy="25" r="2.2" fill="#7dd3fc" />
                    <line x1="34" y1="25" x2="42" y2="17" stroke="#7dd3fc" strokeWidth="2.2" strokeLinecap="round" />
                    {/* Dial ticks */}
                    <line x1="24" y1="25" x2="25.5" y2="25" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="27" y1="18" x2="28.5" y2="19.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="34" y1="15" x2="34" y2="17" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="41" y1="18" x2="39.5" y2="19.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="44" y1="25" x2="42.5" y2="25" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>

                {/* Coming Soon Pill Badge */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.22)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  padding: '4px 14px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: '#ffffff'
                }}>
                  <Sparkles size={12} />
                  <span>Próximamente / Coming Soon</span>
                </div>
              </div>
            </div>

            {/* Ver Detalles Button */}
            <button
              onClick={handleOpenPractico}
              style={{
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                color: '#1e5f8f',
                border: 'none',
                borderRadius: '6px',
                padding: '14px 20px',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>Ver detalles</span>
              <ArrowRight size={16} />
            </button>
          </div>

        </div>

        {/* Small reassurance note below */}
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
            ¿Tienes dudas sobre qué examen debes rendir primero o tu vía de revalidación?{' '}
            <button
              onClick={onOpenMentorship}
              style={{
                background: 'none',
                border: 'none',
                color: '#0b5ea8',
                fontWeight: '700',
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: 0,
                fontSize: '0.9rem'
              }}
            >
              Habla con un asesor médico aquí.
            </button>
          </p>
        </div>

      </div>
    </section>
  );
}
