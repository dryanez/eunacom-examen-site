import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, User, ArrowLeft, ArrowRight, Share2, BookOpen, CheckCircle2, HelpCircle, ChevronDown, ChevronUp, Stethoscope, PhoneCall } from 'lucide-react';

export default function BlogArticleModalOrPage({ article, onClose, onSelectCourse, onOpenMentorship }) {
  const [activeFaq, setActiveFaq] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  if (!article) return null;

  const toggleFaq = (idx) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  // Structured Data Schema for BlogPosting and FAQPage
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "headline": article.title,
    "description": article.excerpt,
    "image": `https://eunacom-examen.cl/og-image.jpg`,
    "datePublished": "2026-08-15T09:00:00-04:00",
    "dateModified": "2026-08-31T12:00:00-04:00",
    "author": {
      "@type": "Physician",
      "name": article.author || "Equipo académico AEE",
      "areaServed": "Chile",
      "jobTitle": "Equipo académico"
    },
    "publisher": {
      "@type": "EducationalOrganization",
      "name": "EUNACOM Examen Chile",
      "url": "https://eunacom-examen.cl"
    },
    "mainEntityOfPage": `https://eunacom-examen.cl/blog/${article.slug}`
  };

  const faqSchema = article.faqs && article.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": article.faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.a
      }
    }))
  } : null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(8, 54, 95, 0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '5px',
        width: '100%',
        maxWidth: '880px',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 18px 44px rgba(8,54,95,.22)',
        overflow: 'hidden'
      }}>

        {/* Modal Top Bar */}
        <div style={{
          backgroundColor: '#08365f',
          color: '#ffffff',
          padding: '18px 26px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              backgroundColor: '#0b5ea8',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: '700',
              padding: '3px 10px',
              borderRadius: '3px'
            }}>
              {article.cat}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#a9d3f5', fontWeight: '500' }}>
              Guía Oficial EUNACOM 2026 - 2027
            </span>
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

        {/* Article Scrollable Body */}
        <div style={{ padding: '32px 36px', overflowY: 'auto', flex: 1 }}>

          {/* Title & Metadata */}
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.7rem, 2.5vw, 2.2rem)',
            fontWeight: '800',
            color: '#08365f',
            lineHeight: '1.25',
            marginBottom: '16px'
          }}>
            {article.title}
          </h1>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '18px',
            color: '#5f6b76',
            fontSize: '0.85rem',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '1px solid #dae8f4'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={15} color="#0b5ea8" />
              <span><strong>{article.author}</strong> ({article.authorRole})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={15} />
              <span>Lectura: {article.readTime}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={15} />
              <span>Publicado: {article.date}</span>
            </div>
          </div>

          {/* Intro Description */}
          <p style={{
            fontSize: '1.1rem',
            color: '#41556b',
            lineHeight: '1.65',
            marginBottom: '28px',
            fontWeight: '500'
          }}>
            {article.excerpt}
          </p>

          {/* Key Takeaways Box */}
          {article.keyTakeaways && article.keyTakeaways.length > 0 && (
            <div style={{
              backgroundColor: '#eef5fb',
              border: '1.5px solid rgba(11, 94, 168, 0.3)',
              borderRadius: '4px',
              padding: '24px',
              marginBottom: '32px'
            }}>
              <div style={{
                fontSize: '1rem',
                fontWeight: '800',
                color: '#08365f',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle2 size={20} color="#0b5ea8" />
                <span>Puntos Clave de esta Guía Médica:</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {article.keyTakeaways.map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.92rem', color: '#2f3e4d', lineHeight: '1.5' }}>
                    <span style={{ color: '#0b5ea8', fontWeight: '800' }}>✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Markdown-style Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', marginBottom: '36px' }}>
            {article.sections && article.sections.map((sec, sIdx) => (
              <div key={sIdx}>
                <h2 style={{
                  fontSize: '1.35rem',
                  fontWeight: '800',
                  color: '#08365f',
                  marginBottom: '12px',
                  borderLeft: '4px solid #0b5ea8',
                  paddingLeft: '12px'
                }}>
                  {sec.h}
                </h2>
                {(sec.p || []).map((paragraph, pIdx) => (
                  <p
                    key={pIdx}
                    style={{
                      fontSize: '0.96rem',
                      color: '#41556b',
                      lineHeight: '1.65',
                      marginBottom: '12px'
                    }}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}
          </div>

          {/* FAQs Accordion */}
          {article.faqs && article.faqs.length > 0 && (
            <div style={{
              marginTop: '40px',
              paddingTop: '28px',
              borderTop: '1px solid #dae8f4'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#08365f', marginBottom: '18px' }}>
                Preguntas Frecuentes sobre este Tema:
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {article.faqs.map((faq, fIdx) => (
                  <div
                    key={fIdx}
                    style={{
                      border: '1px solid #dae8f4',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <button
                      onClick={() => toggleFaq(fIdx)}
                      style={{
                        width: '100%',
                        padding: '14px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '700',
                        fontSize: '0.95rem',
                        color: '#08365f'
                      }}
                    >
                      <span>{faq.q}</span>
                      {activeFaq === fIdx ? <ChevronUp size={18} color="#0b5ea8" /> : <ChevronDown size={18} color="#5f6b76" />}
                    </button>

                    {activeFaq === fIdx && (
                      <div style={{
                        padding: '14px 18px',
                        borderTop: '1px solid #eef5fb',
                        backgroundColor: '#f6fafd',
                        fontSize: '0.9rem',
                        color: '#41556b',
                        lineHeight: '1.6'
                      }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Author Bio Box */}
          <div style={{
            marginTop: '40px',
            backgroundColor: '#f6fafd',
            border: '1px solid #cfdeeb',
            borderRadius: '4px',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#08365f',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '1.3rem',
              flexShrink: 0,
              border: '2px solid #0b5ea8'
            }}>
              FY
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#08365f' }}>
                {article.author}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#0b5ea8', fontWeight: '700' }}>
                {article.authorRole}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#5f6b76', marginTop: '4px', lineHeight: '1.4' }}>
                Preparación para la habilitación médica de médicos nacionales y extranjeros en Chile.
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer CTAs */}
        <div style={{
          padding: '18px 30px',
          borderTop: '1px solid #dae8f4',
          backgroundColor: '#f6fafd',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '10px 18px', fontSize: '0.88rem' }}
          >
            Volver al Blog
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => {
                onClose();
                onOpenMentorship();
              }}
              className="btn btn-whatsapp"
              style={{ padding: '10px 18px', fontSize: '0.88rem' }}
            >
              <PhoneCall size={16} />
              <span>Consultar con el Autor</span>
            </button>

            <a
              href="#cursos"
              onClick={onClose}
              className="btn btn-primary"
              style={{ padding: '10px 20px', fontSize: '0.88rem' }}
            >
              <span>Ver Cursos 2026 - 2027</span>
              <ArrowRight size={16} />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
