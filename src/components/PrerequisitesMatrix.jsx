import React, { useState } from 'react';
import { CONVALIDATION_PATHWAYS, DOCUMENT_CHECKLIST } from '../data/convalidationData';
import { FileCheck2, CheckCircle2, AlertTriangle, Globe, BookOpen, ShieldCheck, Check, PhoneCall, ChevronRight } from 'lucide-react';

export default function PrerequisitesMatrix({ onOpenMentorship }) {
  const [activePathwayId, setActivePathwayId] = useState('asofamech');
  const [checkedDocs, setCheckedDocs] = useState({});

  const activePathway = CONVALIDATION_PATHWAYS.find(p => p.id === activePathwayId) || CONVALIDATION_PATHWAYS[0];

  const handleToggleDoc = (docId) => {
    setCheckedDocs(prev => ({
      ...prev,
      [docId]: !prev[docId]
    }));
  };

  const totalMandatory = DOCUMENT_CHECKLIST.filter(d => d.mandatory).length;
  const completedMandatory = DOCUMENT_CHECKLIST.filter(d => d.mandatory && checkedDocs[d.id]).length;

  return (
    <section id="revalidacion" style={{ padding: '80px 0', backgroundColor: '#f6fafd' }}>
      <div className="container">

        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 48px' }}>
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
            <FileCheck2 size={16} color="#0b5ea8" />
            <span>GUÍA NORMATIVA Y HABILITACIÓN PROFESIONAL</span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.9rem, 3.2vw, 2.7rem)',
            fontWeight: '800',
            color: '#08365f',
            lineHeight: '1.2',
            marginBottom: '16px'
          }}>
            Las 4 Vías de <span style={{ color: '#0b5ea8' }}>Revalidación Médica</span> en Chile
          </h2>

          <p style={{
            fontSize: '1.05rem',
            color: '#41556b',
            lineHeight: '1.6'
          }}>
            Conoce la normativa legal chilena (Ley Nº 20.261 y Ley Nº 20.985) y selecciona la vía correspondiente a tu formación y país de origen.
          </p>
        </div>

        {/* Pathway Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
          marginBottom: '32px'
        }}>
          {CONVALIDATION_PATHWAYS.map((pathway) => {
            const isActive = pathway.id === activePathwayId;
            return (
              <button
                key={pathway.id}
                onClick={() => setActivePathwayId(pathway.id)}
                style={{
                  padding: '16px 20px',
                  borderRadius: '4px',
                  border: isActive ? '2px solid #0b5ea8' : '1px solid #dae8f4',
                  backgroundColor: isActive ? '#08365f' : '#ffffff',
                  color: isActive ? '#ffffff' : '#08365f',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: isActive ? '0 10px 25px rgba(8, 54, 95, 0.15)' : '0 2px 8px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: isActive ? '#a9d3f5' : '#0b5ea8',
                  textTransform: 'uppercase',
                  marginBottom: '4px'
                }}>
                  Vía #{pathway.number}
                </div>
                <div style={{
                  fontSize: '1rem',
                  fontWeight: '800',
                  lineHeight: '1.25'
                }}>
                  {pathway.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Pathway Detail Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '5px',
          border: '1.5px solid #dae8f4',
          padding: '36px',
          boxShadow: '0 3px 14px rgba(8,54,95,.06)',
          marginBottom: '48px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{
              backgroundColor: '#0b5ea8',
              color: '#ffffff',
              padding: '4px 12px',
              borderRadius: '3px',
              fontSize: '0.8rem',
              fontWeight: '700'
            }}>
              Vía #{activePathway.number} Oficial
            </span>
            <span style={{ fontSize: '0.95rem', color: '#5f6b76', fontWeight: '600' }}>
              {activePathway.subtitle}
            </span>
          </div>

          <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#08365f', marginBottom: '14px' }}>
            {activePathway.title}
          </h3>

          <p style={{ fontSize: '1rem', color: '#41556b', lineHeight: '1.6', marginBottom: '24px' }}>
            {activePathway.description}
          </p>

          {/* Pros / Cons / Clarification */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            marginBottom: '28px'
          }}>
            {activePathway.pros && (
              <div style={{
                backgroundColor: '#f6fafd',
                border: '1px solid #cfdeeb',
                borderRadius: '4px',
                padding: '16px 20px',
                color: '#41556b',
                fontSize: '0.9rem',
                lineHeight: '1.5'
              }}>
                <strong>Alcance y Beneficio:</strong> {activePathway.pros}
              </div>
            )}

            {activePathway.cons && (
              <div style={{
                backgroundColor: '#eef5fb',
                border: '1px solid #cfdeeb',
                borderRadius: '4px',
                padding: '16px 20px',
                color: '#41556b',
                fontSize: '0.9rem',
                lineHeight: '1.5'
              }}>
                <strong>Consideración Importante:</strong> {activePathway.cons}
              </div>
            )}
          </div>

          {/* Countries in Treaties */}
          {activePathway.countries && (
            <div style={{
              backgroundColor: '#eef5fb',
              borderRadius: '4px',
              padding: '20px',
              marginBottom: '28px'
            }}>
              <div style={{
                fontSize: '0.9rem',
                fontWeight: '800',
                color: '#08365f',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Globe size={18} color="#0b5ea8" />
                <span>Países con Tratados Bilaterales Vigentes con Chile:</span>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '10px'
              }}>
                {activePathway.countries.map((country, cIdx) => (
                  <div key={cIdx} style={{
                    backgroundColor: '#ffffff',
                    padding: '10px 14px',
                    borderRadius: '3px',
                    border: '1px solid #cfdeeb',
                    fontSize: '0.85rem'
                  }}>
                    <div style={{ fontWeight: '700', color: '#08365f' }}>{country.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#5f6b76' }}>{country.treaty}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Steps List */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ fontSize: '1rem', fontWeight: '800', color: '#08365f', marginBottom: '14px' }}>
              Etapas del Proceso Paso a Paso:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {activePathway.steps.map((step, sIdx) => (
                <div key={sIdx} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  fontSize: '0.92rem',
                  color: '#2f3e4d',
                  lineHeight: '1.5'
                }}>
                  <span style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#0b5ea8',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    {sIdx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Exemptions if any */}
          {activePathway.exemptions && (
            <div style={{
              fontSize: '0.85rem',
              color: '#5f6b76',
              fontStyle: 'italic',
              borderTop: '1px solid #dae8f4',
              paddingTop: '14px'
            }}>
              <strong>Nota:</strong> {activePathway.exemptions}
            </div>
          )}
        </div>

        {/* Document Checklist Sub-Section */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '5px',
          border: '1.5px solid #dae8f4',
          padding: '36px',
          boxShadow: '0 3px 14px rgba(8,54,95,.06)'
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            gap: '16px'
          }}>
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#08365f', marginBottom: '4px' }}>
                Checklist de Documentos de Postulación (Apostilla / Legalización)
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#5f6b76', margin: 0 }}>
                Marca los documentos que ya tienes listos para verificar tu estado de postulación:
              </p>
            </div>

            <div style={{
              backgroundColor: completedMandatory === totalMandatory ? '#eef5fb' : '#eef5fb',
              color: completedMandatory === totalMandatory ? '#41556b' : '#08365f',
              padding: '8px 18px',
              borderRadius: '3px',
              fontWeight: '700',
              fontSize: '0.88rem'
            }}>
              Obligatorios: {completedMandatory} / {totalMandatory}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
            {DOCUMENT_CHECKLIST.map((doc) => {
              const isChecked = !!checkedDocs[doc.id];
              return (
                <div
                  key={doc.id}
                  onClick={() => handleToggleDoc(doc.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    padding: '14px 18px',
                    borderRadius: '4px',
                    backgroundColor: isChecked ? '#f6fafd' : '#f6fafd',
                    border: isChecked ? '1.5px solid #0b5ea8' : '1px solid #cfdeeb',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '3px',
                    border: isChecked ? '2px solid #0b5ea8' : '2px solid #8195a7',
                    backgroundColor: isChecked ? '#0b5ea8' : '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    {isChecked && <Check size={16} strokeWidth={3} />}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <span style={{
                        fontSize: '0.95rem',
                        fontWeight: '700',
                        color: isChecked ? '#41556b' : '#08365f'
                      }}>
                        {doc.title}
                      </span>
                      {doc.mandatory ? (
                        <span style={{
                          backgroundColor: '#eef5fb',
                          color: '#41556b',
                          fontSize: '0.7rem',
                          fontWeight: '700',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          Obligatorio
                        </span>
                      ) : (
                        <span style={{
                          backgroundColor: '#eef5fb',
                          color: '#5f6b76',
                          fontSize: '0.7rem',
                          fontWeight: '600',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          Opcional
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#41556b', lineHeight: '1.4' }}>
                      {doc.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#eef5fb',
            padding: '18px 24px',
            borderRadius: '4px',
            gap: '16px'
          }}>
            <div>
              <div style={{ fontWeight: '800', color: '#08365f', fontSize: '0.95rem' }}>
                ¿Dudas sobre cómo apostillar o legalizar tus documentos?
              </div>
              <div style={{ fontSize: '0.85rem', color: '#41556b' }}>
                Revisamos tus antecedentes académicos y te guiamos en la inscripción ASOFAMECH.
              </div>
            </div>

            <button
              onClick={onOpenMentorship}
              className="btn btn-whatsapp"
              style={{ padding: '10px 20px', fontSize: '0.88rem' }}
            >
              <PhoneCall size={16} />
              <span>Consultar por WhatsApp</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
