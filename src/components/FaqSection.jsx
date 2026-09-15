import React, { useState } from 'react';
import { GENERAL_FAQS } from '../data/faqsData';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles, PhoneCall } from 'lucide-react';

export default function FaqSection({ onOpenMentorship }) {
  const [activeFaq, setActiveFaq] = useState(0);

  const toggleFaq = (idx) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": GENERAL_FAQS.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  return (
    <section id="faq" style={{ padding: '80px 0', backgroundColor: '#f6fafd' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="container">

        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 48px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#eef5fb',
            color: '#08365f',
            padding: '6px 16px',
            borderRadius: '3px',
            fontSize: '0.85rem',
            fontWeight: '700',
            marginBottom: '14px',
            border: '1px solid rgba(11, 94, 168, 0.2)'
          }}>
            <HelpCircle size={16} color="#0b5ea8" />
            <span>RESPUESTAS OFICIALES Y NORMATIVA</span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.9rem, 3.2vw, 2.7rem)',
            fontWeight: '800',
            color: '#08365f',
            lineHeight: '1.2',
            marginBottom: '16px'
          }}>
            Preguntas Frecuentes sobre el <span style={{ color: '#0b5ea8' }}>EUNACOM</span>
          </h2>

          <p style={{
            fontSize: '1.05rem',
            color: '#41556b',
            lineHeight: '1.6'
          }}>
            Todo lo que necesitas saber sobre el puntaje de corte (51%), las fechas de inscripción, el temario ASOFAMECH y nuestras facilidades de pago.
          </p>
        </div>

        {/* FAQs Accordion */}
        <div style={{
          maxWidth: '820px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          {GENERAL_FAQS.map((faq, idx) => {
            const isOpen = activeFaq === idx;

            return (
              <div
                key={idx}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '4px',
                  border: isOpen ? '1.5px solid #0b5ea8' : '1px solid #dae8f4',
                  overflow: 'hidden',
                  transition: 'all 0.2s',
                  boxShadow: isOpen ? '0 8px 24px rgba(8, 54, 95, 0.08)' : '0 2px 6px rgba(0,0,0,0.02)'
                }}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#08365f',
                    fontWeight: '800',
                    fontSize: '1.05rem',
                    lineHeight: '1.4'
                  }}
                >
                  <span style={{ paddingRight: '16px' }}>{faq.q}</span>
                  {isOpen ? <ChevronUp size={22} color="#0b5ea8" style={{ flexShrink: 0 }} /> : <ChevronDown size={22} color="#8195a7" style={{ flexShrink: 0 }} />}
                </button>

                {isOpen && (
                  <div style={{
                    padding: '0 24px 22px',
                    color: '#41556b',
                    fontSize: '0.95rem',
                    lineHeight: '1.65',
                    borderTop: '1px solid #eef5fb',
                    paddingTop: '16px'
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Mentorship Box */}
        <div style={{
          maxWidth: '820px',
          margin: '40px auto 0',
          backgroundColor: '#eef5fb',
          borderRadius: '4px',
          padding: '24px 32px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px'
        }}>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#08365f', marginBottom: '4px' }}>
              ¿Tienes una duda no listada aquí?
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#41556b', margin: 0 }}>
              Habla directamente con nuestro equipo académico para una respuesta personalizada.
            </p>
          </div>

          <button
            onClick={onOpenMentorship}
            className="btn btn-whatsapp"
            style={{ padding: '10px 20px', fontSize: '0.9rem' }}
          >
            <PhoneCall size={16} />
            <span>Consultar por WhatsApp</span>
          </button>
        </div>

      </div>
    </section>
  );
}
