import React, { useState } from 'react';
import { BLOG_ARTICLES } from '../data/blogArticlesData';
import { BookOpen, Search, Clock, ArrowRight, User, Sparkles, Filter, ShieldCheck, Flame } from 'lucide-react';

export default function BlogSection({ onSelectArticle, onOpenTopicProposer }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Todas las Guías' },
    ...[...new Set(BLOG_ARTICLES.map(article => article.cat))].map(cat => ({ id: cat, label: cat }))
  ];

  const filteredArticles = BLOG_ARTICLES.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.cat === selectedCategory;
    const term = searchTerm.toLowerCase();
    const matchesSearch = article.title.toLowerCase().includes(term) ||
      article.excerpt.toLowerCase().includes(term) ||
      article.cat.toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="blog" style={{ padding: '80px 0', backgroundColor: '#ffffff' }}>
      <div className="container">

        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 40px' }}>
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
            <BookOpen size={16} color="#0b5ea8" />
            <span>CENTRO DE INTELIGENCIA MÉDICA & GUÍAS OFICIALES</span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.9rem, 3.2vw, 2.7rem)',
            fontWeight: '800',
            color: '#08365f',
            lineHeight: '1.2',
            marginBottom: '16px'
          }}>
            Guías Clínicas, Fechas y Normativa <span style={{ color: '#0b5ea8' }}>EUNACOM</span>
          </h2>

          <p style={{
            fontSize: '1.05rem',
            color: '#41556b',
            lineHeight: '1.6'
          }}>
            Artículos y guías sobre el EUNACOM teórico (180 preguntas) y sobre cómo funciona el examen práctico. Redactados y revisados por el equipo académico de Academia Examen EUNACOM.
          </p>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          marginBottom: '40px',
          backgroundColor: '#f6fafd',
          padding: '20px 24px',
          borderRadius: '5px',
          border: '1px solid #dae8f4'
        }}>
          {/* Search Box & Topic Proposer Button */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px'
          }}>
            <div style={{
              position: 'relative',
              flex: '1 1 320px',
              maxWidth: '480px'
            }}>
              <Search size={18} color="#5f6b76" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Buscar por tema (GES, fechas, sueldos, práctico, cardiología)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 16px 11px 40px',
                  borderRadius: '4px',
                  border: '1px solid #cfdeeb',
                  fontSize: '0.9rem',
                  outline: 'none',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>

            {/* In-App SEO Studio Button */}
            <button
              onClick={onOpenTopicProposer}
              className="btn btn-secondary"
              style={{
                fontSize: '0.85rem',
                padding: '9px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#ffffff',
                border: '1.5px solid #0b5ea8',
                color: '#08365f'
              }}
            >
              <Sparkles size={16} color="#0b5ea8" />
              <span>Laboratorio SEO & Nuevos Temas</span>
            </button>
          </div>

          {/* Categories Pills */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '3px',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: isSelected ? '#08365f' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#41556b',
                    boxShadow: isSelected ? 'none' : 'none',
                    border: isSelected ? 'none' : '1px solid #dae8f4'
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Blog Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
          gap: '26px'
        }}>
          {filteredArticles.map((article) => (
            <div
              key={article.slug}
              className="card"
              onClick={() => onSelectArticle(article)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '28px',
                borderRadius: '5px',
                border: '1px solid #dae8f4',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
            >
              <div>
                {/* Category & Time */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '14px',
                  gap: '8px'
                }}>
                  <span style={{
                    backgroundColor: '#eef5fb',
                    color: '#0b5ea8',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    padding: '4px 10px',
                    borderRadius: '3px'
                  }}>
                    {article.cat}
                  </span>
                  <span style={{
                    fontSize: '0.78rem',
                    color: '#5f6b76',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Clock size={13} />
                    {article.readTime}
                  </span>
                </div>

                {/* Title */}
                <h3 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.2rem',
                  fontWeight: '800',
                  color: '#08365f',
                  lineHeight: '1.3',
                  marginBottom: '10px'
                }}>
                  {article.title}
                </h3>

                {/* Description */}
                <p style={{
                  fontSize: '0.88rem',
                  color: '#41556b',
                  lineHeight: '1.55',
                  marginBottom: '20px'
                }}>
                  {article.excerpt}
                </p>
              </div>

              {/* Card Footer */}
              <div style={{
                borderTop: '1px solid #eef5fb',
                paddingTop: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#0b5ea8',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                    fontWeight: '800'
                  }}>
                    FY
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#5f6b76', fontWeight: '600' }}>
                    Academia Examen EUNACOM
                  </span>
                </div>

                <span style={{
                  fontSize: '0.82rem',
                  color: '#0b5ea8',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span>Leer Guía</span>
                  <ArrowRight size={15} />
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#5f6b76' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>No se encontraron artículos para tu búsqueda.</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem' }}
            >
              Restablecer Filtros
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
