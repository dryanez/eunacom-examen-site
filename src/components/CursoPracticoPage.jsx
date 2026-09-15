import React, { useState } from 'react';
import { ArrowLeft, Home, Sparkles, CheckCircle2, MessageCircle, Stethoscope, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { CONTACTO } from '../site.config';

export default function CursoPracticoPage({ onNavigateHome, onOpenMentorship }) {
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistSent, setWaitlistSent] = useState(false);

  const handleWaitlistSubmit = (e) => {
    e.preventDefault();
    if (!waitlistEmail) return;
    setWaitlistSent(true);
  };

  const whatsappWaitlistUrl = `https://wa.me/56976694606?text=${encodeURIComponent('Hola Academia EUNACOM, me gustaría inscribirme en la lista de espera prioritaria para el Curso Práctico ECOE.')}`;

  return (
    <div style={{ backgroundColor: '#edf4f7', minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Top Bar / Breadcrumb */}
      <div style={{ backgroundColor: '#08365f', color: '#ffffff', padding: '18px 0' }}>
        <div className="container" style={{
          padding: '0 36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <button
            onClick={() => onNavigateHome('#cursos')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              padding: '8px 16px',
              borderRadius: '4px',
              fontSize: '0.88rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={16} />
            <span>Volver a la página principal</span>
          </button>

          <div style={{ fontSize: '0.85rem', color: '#b9d3ea', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Home size={14} />
            <span>Inicio</span>
            <span>/</span>
            <span>Cursos y precios</span>
            <span>/</span>
            <span style={{ color: '#ffffff', fontWeight: '700' }}>Curso Práctico ECOE</span>
          </div>
        </div>
      </div>

      {/* Main Page Container */}
      <div className="container" style={{ padding: '48px 36px 0', maxWidth: '960px' }}>

        {/* Coming Soon Banner Card */}
        <div style={{
          background: 'linear-gradient(135deg, #1b75bb 0%, #08365f 100%)',
          borderRadius: '16px',
          padding: '48px 36px',
          color: '#ffffff',
          boxShadow: '0 12px 36px rgba(8,54,95,0.18)',
          marginBottom: '40px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle background glow */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            maxWidth: '720px',
            margin: '0 auto'
          }}>
            {/* Monitor + Gauge SVG Icon */}
            <div style={{ marginBottom: '24px' }}>
              <svg width="110" height="95" viewBox="0 0 72 62" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Monitor Frame */}
                <rect x="4" y="3" width="64" height="42" rx="4" stroke="#ffffff" strokeWidth="3" fill="#0f4471" />
                <line x1="4" y1="36" x2="68" y2="36" stroke="#ffffff" strokeWidth="1.5" />
                {/* Stand & Base */}
                <path d="M30 45H42L45 56H27L30 45Z" fill="#ffffff" />
                <rect x="22" y="56" width="28" height="4" rx="2" fill="#ffffff" />
                {/* Speedometer / Gauge in Screen */}
                <path d="M22 27 A 14 14 0 0 1 50 27" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <circle cx="36" cy="27" r="2.5" fill="#38bdf8" />
                <line x1="36" y1="27" x2="45" y2="19" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
                {/* Gauge Tick Marks */}
                <line x1="24" y1="27" x2="26" y2="27" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                <line x1="28" y1="18" x2="29.5" y2="20" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                <line x1="36" y1="15" x2="36" y2="17" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                <line x1="44" y1="18" x2="42.5" y2="20" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                <line x1="48" y1="27" x2="46" y2="27" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            {/* Coming Soon Pill */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#f59e0b',
              color: '#ffffff',
              padding: '6px 18px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: '800',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '18px',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)'
            }}>
              <Sparkles size={14} />
              <span>Próximamente / Coming Soon</span>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2rem, 3.5vw, 2.7rem)',
              fontWeight: '800',
              color: '#ffffff',
              lineHeight: '1.2',
              margin: '0 0 16px 0'
            }}>
              Curso Práctico EUNACOM (ECOE)
            </h1>

            <p style={{
              fontSize: '1.15rem',
              color: '#d4e7f8',
              lineHeight: '1.6',
              margin: '0 0 24px 0',
              maxWidth: '640px'
            }}>
              Simulaciones clínicas avanzadas del <strong>EUNACOM Práctico (SP)</strong> en formato <strong>ECOE</strong> (Examen Clínico Objetivo Estructurado) con estaciones evaluadas según pautas universitarias oficiales.
            </p>

            {/* WhatsApp Waitlist Button */}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <a
                href={whatsappWaitlistUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: '#25D366',
                  color: '#ffffff',
                  padding: '14px 28px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '700',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
                  transition: 'transform 0.2s'
                }}
              >
                <MessageCircle size={20} />
                <span>Anotarme en la lista de espera prioritaria</span>
              </a>

              <button
                onClick={() => onNavigateHome('#cursos')}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#ffffff',
                  padding: '14px 24px',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Volver a cursos
              </button>
            </div>
          </div>
        </div>

        {/* What to expect grid */}
        <div style={{ marginBottom: '44px' }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.65rem',
            fontWeight: '700',
            color: '#08365f',
            textAlign: 'center',
            marginBottom: '28px'
          }}>
            ¿Qué incluirá el Programa Práctico ECOE?
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px'
          }}>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              padding: '24px',
              border: '1px solid #dce8f1',
              boxShadow: '0 2px 10px rgba(8,54,95,0.04)'
            }}>
              <div style={{ color: '#1b75bb', marginBottom: '12px' }}>
                <Stethoscope size={32} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#08365f', margin: '0 0 8px 0' }}>
                4 Áreas Clínicas Obligatorias
              </h3>
              <p style={{ fontSize: '0.92rem', color: '#4b637a', lineHeight: '1.5', margin: 0 }}>
                Estaciones completas para Medicina Interna, Pediatría, Cirugía, y Obstetricia & Ginecología de acuerdo con la pauta de ASOFAMECH.
              </p>
            </div>

            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              padding: '24px',
              border: '1px solid #dce8f1',
              boxShadow: '0 2px 10px rgba(8,54,95,0.04)'
            }}>
              <div style={{ color: '#1b75bb', marginBottom: '12px' }}>
                <CheckCircle2 size={32} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#08365f', margin: '0 0 8px 0' }}>
                Listas de Cotejo Estandarizadas
              </h3>
              <p style={{ fontSize: '0.92rem', color: '#4b637a', lineHeight: '1.5', margin: 0 }}>
                Entrenamiento con los criterios exactos de evaluación: anamnesis dirigida, examen físico, hipótesis diagnóstica y manejo terapéutico.
              </p>
            </div>

            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              padding: '24px',
              border: '1px solid #dce8f1',
              boxShadow: '0 2px 10px rgba(8,54,95,0.04)'
            }}>
              <div style={{ color: '#1b75bb', marginBottom: '12px' }}>
                <Clock size={32} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#08365f', margin: '0 0 8px 0' }}>
                Tiempos Cronometrados
              </h3>
              <p style={{ fontSize: '0.92rem', color: '#4b637a', lineHeight: '1.5', margin: 0 }}>
                Simulaciones reales con estaciones de 10 a 12 minutos para dominar la presión de tiempo y la estructuración de la respuesta clínica.
              </p>
            </div>

            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              padding: '24px',
              border: '1px solid #dce8f1',
              boxShadow: '0 2px 10px rgba(8,54,95,0.04)'
            }}>
              <div style={{ color: '#1b75bb', marginBottom: '12px' }}>
                <ShieldCheck size={32} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#08365f', margin: '0 0 8px 0' }}>
                Feedback Personalizado
              </h3>
              <p style={{ fontSize: '0.92rem', color: '#4b637a', lineHeight: '1.5', margin: 0 }}>
                Retroalimentación individual por médicos especialistas sobre tus fortalezas y puntos críticos que podrían costar la aprobación.
              </p>
            </div>
          </div>
        </div>

        {/* Email Waitlist Box */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '32px 28px',
          textAlign: 'center',
          border: '1px solid #cce1ef',
          boxShadow: '0 4px 20px rgba(8,54,95,0.06)',
          maxWidth: '640px',
          margin: '0 auto 40px'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#08365f', margin: '0 0 10px 0' }}>
            Recibe notificación prioritaria de apertura
          </h3>
          <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.5', margin: '0 0 20px 0' }}>
            Los cupos para las simulaciones ECOE serán limitados para garantizar la atención 1 a 1 de cada alumno. Deja tu correo o escríbenos a WhatsApp para reservar tu prioridad de matrícula.
          </p>

          {waitlistSent ? (
            <div style={{
              backgroundColor: '#ecfdf5',
              border: '1px solid #6ee7b7',
              color: '#065f46',
              padding: '16px',
              borderRadius: '8px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={18} color="#059669" />
              <span>¡Gracias! Te hemos añadido a la lista prioritaria. Te contactaremos apenas se abran las inscripciones.</span>
            </div>
          ) : (
            <form onSubmit={handleWaitlistSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <input
                type="email"
                required
                placeholder="Tu correo electrónico..."
                value={waitlistEmail}
                onChange={(e) => setWaitlistEmail(e.target.value)}
                style={{
                  flex: '1 1 240px',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.95rem'
                }}
              />
              <button
                type="submit"
                style={{
                  backgroundColor: '#1b75bb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '12px 24px',
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Avisarme primero
              </button>
            </form>
          )}
        </div>

        {/* Bottom Back Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => onNavigateHome('#cursos')}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #94a3b8',
              color: '#08365f',
              padding: '12px 28px',
              borderRadius: '6px',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <ArrowLeft size={16} />
            <span>Volver a la página principal</span>
          </button>
        </div>

      </div>
    </div>
  );
}
