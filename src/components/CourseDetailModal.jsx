import React, { useState } from 'react';
import { X, Check, Copy, ExternalLink, Download, ArrowRight, ShieldCheck, CreditCard } from 'lucide-react';

export default function CourseDetailModal({ course, onClose, onEnroll }) {
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!course) return null;

  const bankInfo = {
    banco: 'Banco Santander',
    tipo: 'Cuenta Corriente',
    numero: '82-19402-9',
    titular: 'Academia Examen EUNACOM SpA',
    rut: '77.291.840-5',
    correo: 'contacto@eunacomapp.cl'
  };

  const handleCopyBank = () => {
    const text = `Banco: ${bankInfo.banco}\nTipo: ${bankInfo.tipo}\nNúmero: ${bankInfo.numero}\nTitular: ${bankInfo.titular}\nRUT: ${bankInfo.rut}\nCorreo: ${bankInfo.correo}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadSteps = () => {
    const content = `PASOS DE INSCRIPCIÓN · ACADEMIA EXAMEN EUNACOM
===============================================
Curso: ${course.nombre}
Valor: 359.000 pesos chilenos / 390 USD

PASO 1: Elegir modalidad (Intensivo o Regular).
PASO 2: Realizar el pago mediante Webpay (hasta 12 cuotas) o transferencia electrónica directa a los siguientes datos:
  - Banco: ${bankInfo.banco}
  - Cuenta Corriente: ${bankInfo.numero}
  - Titular: ${bankInfo.titular}
  - RUT: ${bankInfo.rut}
  - Correo para comprobante: ${bankInfo.correo}

PASO 3: Enviar tu comprobante de pago con tu Nombre, RUT y WhatsApp.
Recibirás tus credenciales y acceso inmediato a la plataforma E-Learning con los +300 videos, simulacros y seguimiento de estudio.

Consultas WhatsApp: +56 9 7669 4606
Plataforma: https://eunacom-examen.cl
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Pasos_Inscripcion_${course.slug}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setShowSteps(true);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(8, 54, 95, 0.75)',
      backdropFilter: 'blur(6px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#edf4f7',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '960px',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 50px rgba(8,54,95,.28)',
        overflow: 'hidden',
        position: 'relative',
        border: '1px solid #d0e1ec'
      }}>

        {/* Close Button top-right */}
        <button
          onClick={onClose}
          aria-label="Cerrar"
          style={{
            position: 'absolute',
            top: '18px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid #c7dbe8',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#08365f',
            cursor: 'pointer',
            zIndex: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}
        >
          <X size={20} />
        </button>

        {/* Scrollable Container */}
        <div style={{ overflowY: 'auto', padding: '36px 32px 40px' }}>

          {/* Top Section Header: Laptop Icon + Title + Subtitle */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '18px', marginBottom: '28px', flexWrap: 'wrap' }}>
            {/* Stylized Laptop SVG Icon */}
            <div style={{ flexShrink: 0 }}>
              <svg width="56" height="50" viewBox="0 0 54 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Screen Outline */}
                <rect x="5" y="4" width="44" height="29" rx="3" stroke="#2296a8" strokeWidth="3" fill="#ffffff" />
                <line x1="5" y1="28" x2="49" y2="28" stroke="#2296a8" strokeWidth="2" />
                {/* Laptop Base */}
                <path d="M1 36C1 34.8954 1.89543 34 3 34H51C52.1046 34 53 34.8954 53 36V38C53 39.6569 51.6569 41 50 41H4C2.34315 41 1 39.6569 1 38V36Z" fill="#2296a8" />
                <line x1="22" y1="36" x2="32" y2="36" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>

            <div>
              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(1.5rem, 2.8vw, 2.2rem)',
                fontWeight: '700',
                color: '#2296a8',
                lineHeight: '1.2',
                margin: 0
              }}>
                {course.headerTitulo || `Prepárate para el Eunacom de diciembre 2026`}
              </h2>

              <p style={{
                fontSize: '1.05rem',
                color: '#349aa9',
                fontWeight: '600',
                marginTop: '8px',
                marginBottom: 0
              }}>
                Fecha de inicio del curso: {course.fechaInicioTexto || course.inicio}.
              </p>
            </div>
          </div>

          {/* 3 Main Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
            marginBottom: '40px'
          }}>

            {/* CARD 1: PRECIO */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '30px 20px',
              textAlign: 'center',
              boxShadow: '0 4px 18px rgba(8,54,95,.06)',
              border: '1px solid #e2edf3',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Gold Coin Icon with $ and Ridges */}
              <div style={{ marginBottom: '16px' }}>
                <svg width="76" height="76" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="32" cy="32" r="28" fill="#fde047" stroke="#1e293b" strokeWidth="3" />
                  <circle cx="32" cy="32" r="21" fill="#facc15" stroke="#1e293b" strokeWidth="2" strokeDasharray="3 3" />
                  <text x="32" y="42" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="900" fill="#1e293b" textAnchor="middle">$</text>
                </svg>
              </div>

              <h3 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#2898a9',
                margin: '0 0 14px 0'
              }}>
                Precio
              </h3>

              <p style={{
                fontSize: '1.05rem',
                color: '#1e293b',
                fontWeight: '700',
                lineHeight: '1.4',
                margin: 0
              }}>
                359.000 pesos chilenos / 390 USD.
              </p>
            </div>

            {/* CARD 2: FORMAS DE PAGO */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '26px 20px',
              textAlign: 'center',
              boxShadow: '0 4px 18px rgba(8,54,95,.06)',
              border: '1px solid #e2edf3',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              {/* Hand Holding Credit Card Icon */}
              <div style={{ marginBottom: '12px' }}>
                <svg width="76" height="76" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Credit Card */}
                  <rect x="18" y="10" width="34" height="22" rx="3" fill="#38bdf8" stroke="#1e293b" strokeWidth="2.5" />
                  <rect x="18" y="16" width="34" height="5" fill="#1e293b" />
                  <rect x="23" y="24" width="7" height="4" rx="1" fill="#facc15" stroke="#1e293b" strokeWidth="1" />
                  {/* Hand holding it */}
                  <path d="M12 45L22 34C24 31.8 28 31.8 30.5 34L35 38.5C36.8 40.2 39.5 40.2 41.2 38.5L47 32.5C49.5 30 53.5 32 52.8 35.5L47 46C44 51 38 53 32 51L17 53L12 45Z" fill="#5eead4" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M8 48L17 53" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>

              <h3 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#2898a9',
                margin: '0 0 10px 0'
              }}>
                Formas de pago
              </h3>

              <p style={{
                fontSize: '0.88rem',
                color: '#334155',
                lineHeight: '1.35',
                margin: '0 0 8px 0'
              }}>
                Transferencia, depósito bancario o cheques.
              </p>

              <button
                onClick={() => setShowBankDetails(!showBankDetails)}
                style={{
                  backgroundColor: '#47a2b2',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '9px 18px',
                  fontSize: '0.88rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  width: '100%',
                  maxWidth: '180px',
                  marginBottom: '14px',
                  transition: 'background 0.2s'
                }}
              >
                {showBankDetails ? 'Ocultar datos' : 'Datos bancarios'}
              </button>

              <p style={{
                fontSize: '0.88rem',
                color: '#334155',
                lineHeight: '1.35',
                margin: '0 0 8px 0'
              }}>
                Webpay con acceso a cuotas.
              </p>

              <button
                onClick={() => onEnroll(course)}
                style={{
                  backgroundColor: '#47a2b2',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '9px 18px',
                  fontSize: '0.88rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  width: '100%',
                  maxWidth: '180px',
                  transition: 'background 0.2s'
                }}
              >
                Accede a Webpay
              </button>
            </div>

            {/* CARD 3: PASOS DE INSCRIPCIÓN */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '26px 20px',
              textAlign: 'center',
              boxShadow: '0 4px 18px rgba(8,54,95,.06)',
              border: '1px solid #e2edf3',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              {/* Footsteps Icon */}
              <div style={{ marginBottom: '16px' }}>
                <svg width="76" height="76" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Step 1 */}
                  <ellipse cx="20" cy="46" rx="5" ry="8" transform="rotate(-22 20 46)" fill="#1e293b" />
                  <circle cx="17" cy="35" r="1.5" fill="#1e293b" />
                  <circle cx="21" cy="35.5" r="1.5" fill="#1e293b" />
                  <circle cx="24" cy="37" r="1.5" fill="#1e293b" />
                  {/* Step 2 */}
                  <ellipse cx="36" cy="32" rx="5" ry="8" transform="rotate(-18 36 32)" fill="#1e293b" />
                  <circle cx="34" cy="21" r="1.5" fill="#1e293b" />
                  <circle cx="37" cy="21.5" r="1.5" fill="#1e293b" />
                  <circle cx="41" cy="23" r="1.5" fill="#1e293b" />
                  {/* Step 3 */}
                  <ellipse cx="48" cy="18" rx="5" ry="8" transform="rotate(-18 48 18)" fill="#1e293b" />
                  <circle cx="47" cy="7" r="1.5" fill="#1e293b" />
                  <circle cx="50" cy="7.5" r="1.5" fill="#1e293b" />
                  <circle cx="53" cy="9" r="1.5" fill="#1e293b" />
                </svg>
              </div>

              <h3 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#2898a9',
                margin: '0 0 16px 0'
              }}>
                Pasos de inscripción
              </h3>

              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <button
                  onClick={handleDownloadSteps}
                  style={{
                    backgroundColor: '#47a2b2',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '10px 24px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    width: '100%',
                    maxWidth: '180px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Download size={16} />
                  <span>Descárgalo</span>
                </button>
                <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '8px' }}>
                  Guía paso a paso en formato digital
                </span>
              </div>
            </div>

          </div>

          {/* Collapsible Bank Details Panel */}
          {showBankDetails && (
            <div style={{
              backgroundColor: '#ffffff',
              border: '2px solid #47a2b2',
              borderRadius: '8px',
              padding: '20px 24px',
              marginBottom: '32px',
              boxShadow: '0 6px 20px rgba(0,0,0,0.06)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#08365f', margin: 0 }}>
                  🏦 Datos para Transferencia Bancaria (Pesos Chilenos)
                </h4>
                <button
                  onClick={handleCopyBank}
                  style={{
                    backgroundColor: copied ? '#22c55e' : '#eef5fb',
                    color: copied ? '#ffffff' : '#08365f',
                    border: '1px solid #cfdeeb',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? '¡Copiado!' : 'Copiar datos'}</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '0.88rem', color: '#334155' }}>
                <div><strong>Banco:</strong> {bankInfo.banco}</div>
                <div><strong>Tipo de Cuenta:</strong> {bankInfo.tipo}</div>
                <div><strong>N° de Cuenta:</strong> {bankInfo.numero}</div>
                <div><strong>RUT:</strong> {bankInfo.rut}</div>
                <div><strong>Titular:</strong> {bankInfo.titular}</div>
                <div><strong>Correo:</strong> {bankInfo.correo}</div>
              </div>
            </div>
          )}

          {/* Collapsible Steps Panel */}
          {showSteps && (
            <div style={{
              backgroundColor: '#ffffff',
              border: '2px solid #2898a9',
              borderRadius: '8px',
              padding: '20px 24px',
              marginBottom: '32px',
              boxShadow: '0 6px 20px rgba(0,0,0,0.06)'
            }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#08365f', marginBottom: '14px' }}>
                📋 Pasos para completar tu inscripción en 3 simples pasos:
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: '#334155', lineHeight: '1.5' }}>
                <div><strong>1. Selección:</strong> Elige tu curso ({course.nombre}) e inicia tu proceso mediante Webpay o Transferencia.</div>
                <div><strong>2. Confirmación de Pago:</strong> Realiza el abono de 359 mil pesos chilenos ($359.000 CLP) con tarjetas de débito/crédito en cuotas o transferencia directa.</div>
                <div><strong>3. Acceso Inmediato:</strong> Te habilitamos de inmediato tu usuario en la plataforma E-Learning con los +300 vídeos, exámenes con retroalimentación y seguimiento de estudio.</div>
              </div>
            </div>
          )}

          {/* Text Below the 3 Cards (EXACT MATCH from Screenshot) */}
          <div style={{
            textAlign: 'center',
            maxWidth: '820px',
            margin: '0 auto',
            color: '#1e293b'
          }}>
            <p style={{
              fontSize: '1.05rem',
              lineHeight: '1.6',
              marginBottom: '20px',
              color: '#1e293b'
            }}>
              {course.parrafoObjetivo || 'Este curso está dirigido a médicos que desean prepararse para rendir el Eunacom de diciembre del 2026. Es un curso que abarca todos los temas del Eunacom.'}
            </p>

            <p style={{
              fontSize: '1.02rem',
              lineHeight: '1.6',
              marginBottom: '22px',
              color: '#1e293b'
            }}>
              Se dicta por medio de una plataforma E-Learning, y cuenta con tres recursos principales:
            </p>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              alignItems: 'center',
              marginBottom: '36px'
            }}>
              <div style={{
                fontSize: '1.08rem',
                fontWeight: '600',
                color: '#08365f',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ color: '#2898a9', fontWeight: '800', fontSize: '1.3rem' }}>+</span>
                <span>300 vídeos de todos los temas.</span>
              </div>

              <div style={{
                fontSize: '1.08rem',
                fontWeight: '600',
                color: '#08365f',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ color: '#2898a9', fontWeight: '800', fontSize: '1.3rem' }}>+</span>
                <span>Exámenes tipo Eunacom con puntaje inmediato, y feedback con respuestas correctas.</span>
              </div>

              <div style={{
                fontSize: '1.08rem',
                fontWeight: '600',
                color: '#08365f',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ color: '#2898a9', fontWeight: '800', fontSize: '1.3rem' }}>+</span>
                <span>Seguimiento de estudio.</span>
              </div>
            </div>

            {/* Final CTA Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <button
                onClick={() => onEnroll(course)}
                className="btn btn-primary"
                style={{
                  padding: '14px 32px',
                  fontSize: '1.05rem',
                  fontWeight: '700',
                  backgroundColor: '#08365f',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <span>Inscribirme en este curso ($359.000 CLP)</span>
                <ArrowRight size={18} />
              </button>

              <button
                onClick={onClose}
                className="btn btn-secondary"
                style={{
                  padding: '14px 28px',
                  fontSize: '0.98rem',
                  borderColor: '#94a3b8',
                  color: '#475569'
                }}
              >
                Volver a la página
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
