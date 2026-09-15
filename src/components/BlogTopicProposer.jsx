import React, { useState } from 'react';
import { X, Sparkles, TrendingUp, Search, Copy, Check, BookOpen, Layers, Lightbulb, ArrowRight, Download } from 'lucide-react';

const STRIKING_DISTANCE_KEYWORDS = [
  { keyword: "eunacom sp fechas", impressions: 3420, position: 4.8, opportunity: "Muy Alta", intent: "Transaccional" },
  { keyword: "reconstrucciones eunacom 2026", impressions: 2850, position: 5.2, opportunity: "Muy Alta", intent: "Informacional" },
  { keyword: "guia ges eunacom pdf", impressions: 2100, position: 6.1, opportunity: "Alta", intent: "Informacional" },
  { keyword: "ecoe eunacom estaciones ejemplos", impressions: 1940, position: 5.9, opportunity: "Alta", intent: "Transaccional" },
  { keyword: "sueldo medico cesfam chile recien egresado", impressions: 1680, position: 4.2, opportunity: "Media", intent: "Informacional" },
  { keyword: "conacem vs eunacom diferencias", impressions: 1450, position: 6.8, opportunity: "Alta", intent: "Comparativa" }
];

export default function BlogTopicProposer({ onClose, onProposeTopic }) {
  const [selectedKw, setSelectedKw] = useState(STRIKING_DISTANCE_KEYWORDS[0]);
  const [customKeyword, setCustomKeyword] = useState('');
  const [generatedOutline, setGeneratedOutline] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateProposal = (kwObj) => {
    const kw = kwObj ? kwObj.keyword : customKeyword;
    if (!kw) return;

    const title = `Guía Médica Completa: ${kw.charAt(0).toUpperCase() + kw.slice(1)} (Actualizado 2026-2027)`;
    const slug = kw.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const outline = {
      title,
      slug,
      targetKeyword: kw,
      searchIntent: kwObj ? kwObj.intent : 'Informacional y Preparación',
      category: kw.includes('ecoe') || kw.includes('sp') ? 'Examen Práctico' : (kw.includes('ges') || kw.includes('sueldo') ? 'Salud Pública y Normativa' : 'Estrategia y Metodología'),
      schemaTypes: ['MedicalWebPage', 'FAQPage', 'BreadcrumbList'],
      h2Sections: [
        `1. Introducción y Contexto Oficial de "${kw}" en Chile`,
        `2. Criterios Clínicos y Marco Normativo ASOFAMECH / MINSAL`,
        `3. Algoritmo Paso a Paso para Médicos Generales y Especialistas`,
        `4. Los 5 Errores Más Frecuentes y Cómo Prevenirlos en el Examen`,
        `5. Preguntas Frecuentes (FAQ) y Casos Clínicos Comentados`
      ],
      keyTakeaways: [
        `Dominio del perfil epidemiológico específico para "${kw}".`,
        `Manejo de tiempos y criterios de derivación según guías GES.`,
        `Entrenamiento de distractores para maximizar puntaje teórico.`
      ],
      recommendedCTA: "Simulacro Diagnóstico Gratuito y Evaluación de perfil"
    };

    setGeneratedOutline(outline);
  };

  const handleCopyMarkdown = () => {
    if (!generatedOutline) return;
    const md = `---
title: "${generatedOutline.title}"
slug: "${generatedOutline.slug}"
target_keyword: "${generatedOutline.targetKeyword}"
intent: "${generatedOutline.searchIntent}"
category: "${generatedOutline.category}"
author: "Equipo académico AEE"
date: "2026-08-31"
---

# ${generatedOutline.title}

## Puntos Clave
${generatedOutline.keyTakeaways.map(t => `- ${t}`).join('\n')}

${generatedOutline.h2Sections.map(h => `## ${h}\n\n[Contenido clínico revisado por el equipo académico de Academia Examen EUNACOM]\n`).join('\n')}

## Preguntas Frecuentes (FAQ Schema)
- **Q:** ¿Cuál es el impacto de este tema en el puntaje de corte?
  - **A:** Representa preguntas de alta discriminación en el perfil oficial ASOFAMECH.
`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

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
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '5px',
        width: '100%',
        maxWidth: '840px',
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
          padding: '20px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={20} color="#a9d3f5" />
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>
                Laboratorio de Inteligencia SEO & Propuestas de Blog
              </h3>
              <div style={{ fontSize: '0.78rem', color: '#a9d3f5' }}>
                Oportunidades de Palabras Clave a Distancia de Golpe (Striking Distance)
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

          {/* Keywords Table */}
          <div style={{ marginBottom: '28px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#08365f', marginBottom: '12px' }}>
              Keywords con Mayor Potencial de Tráfico Orgánico:
            </h4>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '12px'
            }}>
              {STRIKING_DISTANCE_KEYWORDS.map((kw, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedKw(kw);
                    handleGenerateProposal(kw);
                  }}
                  style={{
                    backgroundColor: selectedKw.keyword === kw.keyword ? '#eef5fb' : '#ffffff',
                    border: selectedKw.keyword === kw.keyword ? '2px solid #0b5ea8' : '1px solid #cfdeeb',
                    borderRadius: '4px',
                    padding: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#08365f', marginBottom: '6px' }}>
                    "{kw.keyword}"
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#5f6b76' }}>
                    <span>Pos: #{kw.position}</span>
                    <span>Impr: {kw.impressions}</span>
                    <span style={{ color: '#0b5ea8', fontWeight: '700' }}>{kw.opportunity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Generated Proposal Box */}
          {generatedOutline && (
            <div style={{
              backgroundColor: '#f6fafd',
              border: '1.5px solid #0b5ea8',
              borderRadius: '4px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span style={{
                  backgroundColor: '#0b5ea8',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  padding: '3px 10px',
                  borderRadius: '3px'
                }}>
                  Estructura de Contenido Generada
                </span>
                <span style={{ fontSize: '0.8rem', color: '#5f6b76', fontWeight: '600' }}>
                  Intención: {generatedOutline.searchIntent}
                </span>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#08365f', marginBottom: '12px' }}>
                {generatedOutline.title}
              </h3>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#08365f', marginBottom: '6px' }}>
                  Estructura de Secciones (H2 / H3):
                </div>
                <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '0.88rem', color: '#41556b' }}>
                  {generatedOutline.h2Sections.map((h, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>{h}</li>
                  ))}
                </ul>
              </div>

              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#08365f', marginBottom: '6px' }}>
                  Esquemas Estructurados (Schema.org):
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {generatedOutline.schemaTypes.map((st, i) => (
                    <span key={i} style={{
                      backgroundColor: '#dae8f4',
                      color: '#08365f',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      {st}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{
          padding: '18px 30px',
          borderTop: '1px solid #dae8f4',
          backgroundColor: '#f6fafd',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '10px 18px', fontSize: '0.88rem' }}
          >
            Cerrar
          </button>

          {generatedOutline && (
            <button
              onClick={handleCopyMarkdown}
              className="btn btn-primary"
              style={{
                padding: '10px 20px',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? '¡Copiado al Portapapeles!' : 'Copiar Plantilla Markdown para Obsidian'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
