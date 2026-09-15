import React from 'react';
import { BRAND, CONTACTO } from '../site.config';

const COLUMNS = [
  {
    title: 'Sitio',
    links: [
      { href: '#clase-magistral', label: 'Clase magistral' },
      { href: '#cursos', label: 'Cursos online' },
      { href: '#diagnostico', label: 'Material y pruebas gratis' },
    ],
  },
  {
    title: 'Recursos',
    links: [
      { href: '#revalidacion', label: 'Para médicos extranjeros' },
      { href: '#blog', label: 'Blog y Guías' },
      { href: '#faq', label: 'Preguntas frecuentes' },
    ],
  },
];

const headingStyle = {
  fontFamily: 'var(--font-heading)',
  fontSize: '12px',
  fontWeight: '700',
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  color: '#ffffff',
  marginBottom: '16px',
};

const linkStyle = {
  color: '#a9c6de',
  fontSize: '14px',
  textDecoration: 'none',
  display: 'block',
  padding: '3px 0',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  textAlign: 'left'
};

export default function Footer({ onOpenMentorship, onOpenSEOStudio, onNavigateHome, onNavigateBlog, onNavigateRevalidacion }) {
  const handleLinkClick = (href, e) => {
    if (e) e.preventDefault();
    if (href === '#blog') {
      if (onNavigateBlog) onNavigateBlog();
      else window.location.hash = '#blog';
    } else if (href === '#revalidacion') {
      if (onNavigateRevalidacion) onNavigateRevalidacion();
      else window.location.hash = '#revalidacion';
    } else {
      if (onNavigateHome) onNavigateHome(href);
      else {
        window.location.hash = href;
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer style={{ marginTop: '80px', background: '#08365f', color: '#a9c6de' }}>
      <div className="container" style={{ padding: '54px 36px 36px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '36px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '11px', marginBottom: '16px' }}>
              <span style={{
                width: '44px',
                height: '44px',
                background: 'rgba(255,255,255,.1)',
                border: '1px solid rgba(169,198,222,.4)',
                borderRadius: '3px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-heading)',
                fontSize: '13px',
                fontWeight: '800',
                letterSpacing: '.04em',
                color: '#ffffff',
                flex: 'none',
              }}>
                {BRAND.sigla}
              </span>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: '800',
                fontSize: '17px',
                color: '#ffffff',
              }}>
                {BRAND.nombre}
              </span>
            </div>
            <p style={{ fontSize: '14px', lineHeight: '1.9', margin: 0 }}>
              Prueba para el ejercicio de la Medicina en Chile. Cursos Online Intensivo y Regular para el EUNACOM teórico.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <div style={headingStyle}>{col.title}</div>
              {col.links.map((link) => (
                <button
                  key={link.href}
                  onClick={(e) => handleLinkClick(link.href, e)}
                  style={linkStyle}
                >
                  ▸ {link.label}
                </button>
              ))}
              {col.title === 'Recursos' && (
                <button
                  onClick={onOpenSEOStudio}
                  style={linkStyle}
                >
                  ▸ Laboratorio de temas
                </button>
              )}
            </div>
          ))}

          <div>
            <div style={headingStyle}>Contacto</div>
            <div style={{ fontSize: '14px', lineHeight: '1.9', marginBottom: '18px' }}>
              Correo · {CONTACTO.correo}<br />
              Teléfonos · {CONTACTO.telefono}
            </div>
            <button onClick={onOpenMentorship} className="btn" style={{ background: '#ffffff', color: '#08365f' }}>
              Asegura tu matrícula
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '0 36px 36px' }}>
        <div style={{
          borderTop: '1px solid rgba(169,198,222,.2)',
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '20px',
          flexWrap: 'wrap',
          fontSize: '12.5px',
          color: '#6f93b5',
        }}>
          <span>{BRAND.nombre} © 2026. Todos los derechos reservados.</span>
          <span>Programa independiente, no afiliado a ASOFAMECH.</span>
        </div>
      </div>
    </footer>
  );
}
