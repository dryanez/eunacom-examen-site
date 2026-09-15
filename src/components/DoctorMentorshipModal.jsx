import React, { useState } from 'react';
import { X, PhoneCall, Send, ShieldCheck, CheckCircle2, User, Mail, Globe, Calendar, MessageSquare } from 'lucide-react';

export default function DoctorMentorshipModal({ onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: 'Chile',
    targetExam: 'Julio 2027',
    experience: 'Primera vez',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleWhatsAppDirect = (e) => {
    e.preventDefault();
    const text = `¡Hola! Quisiera una asesoría de perfil EUNACOM:%0A%0A` +
      `*Nombre:* ${formData.name || 'Médico Postulante'}%0A` +
      `*País de Grado:* ${formData.country}%0A` +
      `*Convocatoria Objetivo:* ${formData.targetExam}%0A` +
      `*Experiencia Previa:* ${formData.experience}%0A` +
      `*Teléfono/Email:* ${formData.phone} / ${formData.email}%0A` +
      `*Consulta:* ${formData.message || 'Quisiera conocer el plan de estudio recomendado y fechas de inscripción.'}`;

    window.open(`https://wa.me/56976694606?text=${text}`, '_blank');
    setSubmitted(true);
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
          padding: '24px 30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              backgroundColor: '#0b5ea8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: '800',
              fontSize: '1.1rem',
              border: '2px solid #a9d3f5'
            }}>
              FY
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>
                Evaluación de perfil
              </h3>
              <div style={{ fontSize: '0.8rem', color: '#a9d3f5' }}>
                Academia Examen EUNACOM
              </div>
            </div>
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
          {!submitted ? (
            <form onSubmit={handleWhatsAppDirect} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                backgroundColor: '#eef5fb',
                padding: '12px 16px',
                borderRadius: '4px',
                fontSize: '0.88rem',
                color: '#08365f',
                lineHeight: '1.4'
              }}>
                Recibe orientación directa sobre tu plan de estudio, cálculo de percentil y fechas de inscripción ASOFAMECH.
              </div>

              {/* Name & Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#08365f', marginBottom: '6px' }}>
                    Nombre y Apellidos *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ej. Dra. Camila Soto"
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
                    Teléfono / WhatsApp *
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

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#08365f', marginBottom: '6px' }}>
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  name="email"
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

              {/* Country & Target Exam */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#08365f', marginBottom: '6px' }}>
                    País donde te graduaste
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '3px',
                      border: '1px solid #cfdeeb',
                      fontSize: '0.9rem',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="Chile">Chile</option>
                    <option value="Venezuela">Venezuela</option>
                    <option value="Colombia">Colombia</option>
                    <option value="Ecuador">Ecuador</option>
                    <option value="Cuba">Cuba</option>
                    <option value="Bolivia">Bolivia</option>
                    <option value="Perú">Perú</option>
                    <option value="Argentina">Argentina</option>
                    <option value="España">España</option>
                    <option value="Otro País">Otro País</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#08365f', marginBottom: '6px' }}>
                    Convocatoria Objetivo
                  </label>
                  <select
                    name="targetExam"
                    value={formData.targetExam}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '3px',
                      border: '1px solid #cfdeeb',
                      fontSize: '0.9rem',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="Julio 2027">Julio 2027 (Curso Anual / 6 Meses)</option>
                    <option value="Diciembre 2026">Diciembre 2026 (6 Meses Intensivo)</option>
                    <option value="Diciembre 2027">Diciembre 2027</option>
                    <option value="Banco de preguntas">Solo banco de preguntas</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#08365f', marginBottom: '6px' }}>
                  ¿Has rendido el examen anteriormente?
                </label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '3px',
                    border: '1px solid #cfdeeb',
                    fontSize: '0.9rem',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <option value="Primera vez">Primera vez (Postulante Inicial)</option>
                  <option value="Repitiendo Teórico">Repitiendo Sección Teórica</option>
                  <option value="Solo material">Solo me interesa el material de estudio</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#08365f', marginBottom: '6px' }}>
                  ¿Tienes alguna duda específica? (Opcional)
                </label>
                <textarea
                  name="message"
                  rows={3}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Ej. Trabajo en turnos y quiero saber cómo organizar mis 15 horas semanales de estudio..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '3px',
                    border: '1px solid #cfdeeb',
                    fontSize: '0.9rem',
                    resize: 'none'
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-whatsapp"
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  fontSize: '1rem',
                  fontWeight: '700',
                  marginTop: '8px'
                }}
              >
                <PhoneCall size={18} />
                <span>Iniciar Asesoría por WhatsApp Directo</span>
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
              <h4 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#08365f', marginBottom: '8px' }}>
                ¡Solicitud de Asesoría Iniciada!
              </h4>
              <p style={{ fontSize: '0.92rem', color: '#41556b', lineHeight: '1.5', maxWidth: '480px', margin: '0 auto 24px' }}>
                Se ha abierto la ventana de WhatsApp para comunicarte directamente con Academia Examen EUNACOM. Si no se abrió automáticamente, puedes escribirle al +56 9 7669 4606.
              </p>
              <button
                onClick={onClose}
                className="btn btn-primary"
                style={{ padding: '10px 24px', fontSize: '0.9rem' }}
              >
                Entendido
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
