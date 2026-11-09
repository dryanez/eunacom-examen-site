import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Shield, CreditCard, Landmark, Globe, ArrowRight, Lock, PhoneCall, Tag, ShoppingBag } from 'lucide-react';

export default function EnrollmentModal({ course, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    documentId: '',
    email: '',
    phone: '',
    paymentMethod: 'mercadopago'
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [promoInput, setPromoInput] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('promo');
      if (p) return p.toUpperCase();
    }
    return '';
  });
  const [isPromoApplied, setIsPromoApplied] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('promo');
      if (p && (p.toUpperCase() === 'MANUAL50' || p.toUpperCase() === 'DOCTOR50')) return true;
    }
    return false;
  });
  const [promoError, setPromoError] = useState('');

  if (!course) return null;

  const handleApplyPromo = (e) => {
    if (e) e.preventDefault();
    const clean = promoInput.trim().toUpperCase();
    if (clean === 'MANUAL50' || clean === 'DOCTOR50') {
      setIsPromoApplied(true);
      setPromoError('');
    } else {
      setIsPromoApplied(false);
      setPromoError('Cupón inválido. Prueba con MANUAL50.');
    }
  };

  const activeClp = isPromoApplied ? (course.precioPromoClp || '$179.500') : course.precioClp;
  const activeUsd = isPromoApplied ? (course.precioPromoUsd || '≈ US$ 195') : course.precioUsd;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSuccess(true);
  };

  const handleWhatsAppConfirm = () => {
    const methodNames = {
      mercadopago: 'Mercado Pago (Cuotas mensuales)',
      webpay: 'Webpay Plus / Cuotas',
      paypal: 'PayPal (Pago Internacional USD)',
      transfer: 'Transferencia Bancaria'
    };
    const text = `¡Hola! Acabo de registrarme para el curso:%0A%0A` +
      `*Curso:* ${course.nombre}%0A` +
      `*Valor:* ${activeClp} (${activeUsd})${isPromoApplied ? ' (Cupón MANUAL50 aplicado - 50% OFF)' : ''}%0A` +
      `*Nombre:* ${formData.name}%0A` +
      `*RUT/Doc:* ${formData.documentId}%0A` +
      `*Email:* ${formData.email}%0A` +
      `*Teléfono:* ${formData.phone}%0A` +
      `*Método:* ${methodNames[formData.paymentMethod] || formData.paymentMethod}`;

    window.open(`https://wa.me/19293603799?text=${text}`, '_blank');
    onClose();
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
        backgroundColor: '#ffffff',
        borderRadius: '5px',
        width: '100%',
        maxWidth: '680px',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 18px 44px rgba(8,54,95,.22)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#08365f',
          color: '#ffffff',
          padding: '22px 30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div>
            <span style={{
              backgroundColor: '#0b5ea8',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: '700',
              padding: '3px 10px',
              borderRadius: '3px',
              display: 'inline-block',
              marginBottom: '4px'
            }}>
              {course.badge}
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>
              Inscripción: {course.nombre}
            </h3>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '28px 30px', overflowY: 'auto', flex: 1 }}>
          {!isSuccess ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Pricing summary */}
              <div style={{
                backgroundColor: isPromoApplied ? '#f0fdf4' : '#eef5fb',
                border: isPromoApplied ? '1.5px solid #86efac' : '1px solid #cfdeeb',
                padding: '16px 20px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: isPromoApplied ? '#166534' : '#5f6b76', fontWeight: '700' }}>
                    {isPromoApplied ? '🎁 Inversión con 50% OFF Aplicado' : 'Inversión Oficial'}
                  </div>
                  <div style={{ fontSize: '1.45rem', fontWeight: '800', color: isPromoApplied ? '#15803d' : '#08365f' }}>
                    {activeClp} <span style={{ fontSize: '0.9rem', color: '#5f6b76', fontWeight: '600' }}>/ {activeUsd}</span>
                  </div>
                  {isPromoApplied && (
                    <div style={{ fontSize: '0.78rem', color: '#64748b', textDecoration: 'line-through' }}>
                      Valor regular: {course.precioClp} ({course.precioUsd})
                    </div>
                  )}
                </div>
                <div style={{
                  backgroundColor: isPromoApplied ? '#dcfce7' : '#eef5fb',
                  color: isPromoApplied ? '#166534' : '#0b5ea8',
                  padding: '6px 12px',
                  borderRadius: '3px',
                  fontSize: '0.8rem',
                  fontWeight: '700'
                }}>
                  {isPromoApplied ? '🎟️ Cupón MANUAL50 Activo (-50%)' : (course.precioNota || 'Cuotas mensuales y pagos protegidos')}
                </div>
              </div>

              {/* Promo code field */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#f8fafc',
                padding: '10px 14px',
                borderRadius: '4px',
                border: '1px dashed #cbd5e1',
                flexWrap: 'wrap'
              }}>
                <Tag size={16} color="#08365f" />
                <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#08365f' }}>¿Tienes un cupón?</span>
                <input
                  type="text"
                  placeholder="Ej. MANUAL50"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  style={{
                    padding: '5px 8px',
                    borderRadius: '3px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: '700',
                    width: '120px'
                  }}
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  style={{
                    backgroundColor: isPromoApplied ? '#16a34a' : '#08365f',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '3px',
                    padding: '6px 12px',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {isPromoApplied ? 'Aplicado ✓' : 'Aplicar'}
                </button>
                {promoError && <span style={{ fontSize: '0.78rem', color: '#dc2626' }}>{promoError}</span>}
              </div>

              {/* Personal data */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#08365f', marginBottom: '6px' }}>
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ej. Dr. Sebastián Morales"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '3px',
                      border: '1px solid #cfdeeb',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#08365f', marginBottom: '6px' }}>
                    RUT o Pasaporte *
                  </label>
                  <input
                    type="text"
                    name="documentId"
                    required
                    value={formData.documentId}
                    onChange={handleChange}
                    placeholder="12.345.678-9 / Pasaporte"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '3px',
                      border: '1px solid #cfdeeb',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#08365f', marginBottom: '6px' }}>
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="doctor@ejemplo.com"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '3px',
                      border: '1px solid #cfdeeb',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#08365f', marginBottom: '6px' }}>
                    Teléfono WhatsApp *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+56 9 1234 5678"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '3px',
                      border: '1px solid #cfdeeb',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#08365f', marginBottom: '8px' }}>
                  Selecciona tu Medio de Pago Preferido
                </label>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '3px',
                    border: formData.paymentMethod === 'mercadopago' ? '2px solid #009ee3' : '1px solid #cfdeeb',
                    backgroundColor: formData.paymentMethod === 'mercadopago' ? '#f0f9ff' : '#ffffff',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="mercadopago"
                      checked={formData.paymentMethod === 'mercadopago'}
                      onChange={handleChange}
                    />
                    <ShoppingBag size={18} color="#009ee3" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#08365f' }}>
                        Mercado Pago (Cuotas Mensuales con Tarjetas o Saldo Mercado Libre)
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#5f6b76' }}>
                        Paga en cómodas cuotas con tus tarjetas de crédito, débito o dinero en cuenta.
                      </div>
                    </div>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '3px',
                    border: formData.paymentMethod === 'webpay' ? '2px solid #0b5ea8' : '1px solid #cfdeeb',
                    backgroundColor: formData.paymentMethod === 'webpay' ? '#eef5fb' : '#ffffff',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="webpay"
                      checked={formData.paymentMethod === 'webpay'}
                      onChange={handleChange}
                    />
                    <CreditCard size={18} color="#0b5ea8" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#08365f' }}>
                        Webpay Plus (Tarjetas de Crédito / Débito en Cuotas)
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#5f6b76' }}>
                        Hasta 12 cuotas sin interés con bancos nacionales chilenos.
                      </div>
                    </div>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '3px',
                    border: formData.paymentMethod === 'paypal' ? '2px solid #003087' : '1px solid #cfdeeb',
                    backgroundColor: formData.paymentMethod === 'paypal' ? '#f0f4fb' : '#ffffff',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={formData.paymentMethod === 'paypal'}
                      onChange={handleChange}
                    />
                    <Globe size={18} color="#003087" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#08365f' }}>
                        PayPal (Pago Internacional en USD)
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#5f6b76' }}>
                        Procesamiento seguro para médicos fuera de Chile con saldo PayPal o tarjetas internacionales.
                      </div>
                    </div>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '3px',
                    border: formData.paymentMethod === 'transfer' ? '2px solid #0b5ea8' : '1px solid #cfdeeb',
                    backgroundColor: formData.paymentMethod === 'transfer' ? '#eef5fb' : '#ffffff',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="transfer"
                      checked={formData.paymentMethod === 'transfer'}
                      onChange={handleChange}
                    />
                    <Landmark size={18} color="#0b5ea8" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#08365f' }}>
                        Transferencia Electrónica Directa (Pesos Chilenos - CLP)
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#5f6b76' }}>
                        Cuenta Corriente Banco Santander / Chile con activación inmediata.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Security info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#5f6b76' }}>
                <Lock size={14} color="#41556b" />
                <span>Transacción encriptada con certificado SSL de 256 bits.</span>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '13px 20px',
                  fontSize: '1rem',
                  fontWeight: '700',
                  marginTop: '6px'
                }}
              >
                <span>Confirmar Pre-Inscripción y Continuar al Pago</span>
                <ArrowRight size={18} />
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#eef5fb',
                color: '#41556b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <CheckCircle2 size={36} />
              </div>

              <h4 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#08365f', marginBottom: '8px' }}>
                ¡Pre-Inscripción Registrada Exitosamente!
              </h4>

              <p style={{ fontSize: '0.92rem', color: '#41556b', lineHeight: '1.5', maxWidth: '480px', margin: '0 auto 20px' }}>
                Hemos guardado tu cupo para <strong>{course.nombre}</strong>. Para coordinar los datos de transferencia o link de Webpay en cuotas, puedes confirmar directamente con Academia Examen EUNACOM por WhatsApp:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '380px', margin: '0 auto' }}>
                <button
                  onClick={handleWhatsAppConfirm}
                  className="btn btn-whatsapp"
                  style={{ padding: '12px 20px', fontSize: '0.95rem' }}
                >
                  <PhoneCall size={18} />
                  <span>Confirmar Cupo por WhatsApp Directo</span>
                </button>

                <button
                  onClick={onClose}
                  className="btn btn-secondary"
                  style={{ padding: '10px 18px', fontSize: '0.88rem' }}
                >
                  Cerrar Ventana
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
