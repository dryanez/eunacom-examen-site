import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { BRAND, CONTACTO } from '../site.config';

const NAV_LINKS = [
  { href: '#clase-magistral', label: 'Clase magistral' },
  { href: '#cursos', label: 'Cursos' },
  { href: '#diagnostico', label: 'Pruebas gratis' },
  { href: '#revalidacion', label: 'Para médicos extranjeros' },
  { href: '#blog', label: 'Blog' },
  { href: '#faq', label: 'Preguntas' },
];

const linkStyle = {
  background: 'none',
  border: 'none',
  padding: '6px 0',
  cursor: 'pointer',
  color: '#41556b',
  fontSize: '13px',
  fontWeight: '600',
  whiteSpace: 'nowrap',
  textDecoration: 'none',
};

export default function Navbar({ onOpenMentorship, currentView, onNavigateHome, onNavigateBlog, onNavigateRevalidacion }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = (href, e) => {
    if (e) e.preventDefault();
    setMobileMenuOpen(false);
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

  const handleLogoClick = (e) => {
    if (e) e.preventDefault();
    setMobileMenuOpen(false);
    if (onNavigateHome) onNavigateHome('');
    else {
      window.location.hash = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Utility bar */}
      <div style={{ background: '#08365f', color: '#b9d3ea' }}>
        <div className="container" style={{
          padding: '8px 36px',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '18px',
          flexWrap: 'wrap',
          fontSize: '13px',
        }}>
          <span style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <span>{CONTACTO.telefono}</span>
            <span>{CONTACTO.correo}</span>
          </span>
          <span style={{ display: 'flex', gap: '14px' }}>
            <span>Instagram</span>
            <span>Facebook</span>
          </span>
        </div>
      </div>

      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: '#ffffff',
        borderBottom: '1px solid #e3ebf3',
        boxShadow: '0 2px 10px rgba(8,54,95,.06)',
      }}>
        <div className="container" style={{
          padding: '14px 36px',
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(10px,1.5vw,24px)',
        }}>
          <a
            href="#"
            onClick={handleLogoClick}
            style={{ display: 'flex', alignItems: 'center', gap: '11px', flex: 'none', textDecoration: 'none' }}
          >
            <span style={{
              width: '44px',
              height: '44px',
              background: '#eef5fb',
              border: '1px solid #a9c7e4',
              borderRadius: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-heading)',
              fontSize: '13px',
              fontWeight: '800',
              letterSpacing: '.04em',
              color: '#0b5ea8',
              flex: 'none',
            }}>
              {BRAND.sigla}
            </span>
            <span style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: '800',
                fontSize: '17px',
                color: '#08365f',
                letterSpacing: '-.01em',
              }}>
                {BRAND.nombre}
              </span>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '9.5px',
                fontWeight: '600',
                letterSpacing: '.11em',
                textTransform: 'uppercase',
                color: '#8ba4bd',
              }}>
                Prueba para el ejercicio<br />de la Medicina en Chile
              </span>
            </span>
          </a>

          <nav className="site-nav" style={{
            display: 'flex',
            gap: 'clamp(6px,1vw,18px)',
            flex: '1',
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
            alignItems: 'center',
            fontFamily: 'var(--font-heading)',
          }}>
            {NAV_LINKS.map((link) => {
              const isActive = 
                (link.href === '#blog' && currentView === 'blog') || 
                (link.href === '#revalidacion' && currentView === 'revalidacion') ||
                (link.href === '#cursos' && (currentView === 'curso-teorico' || currentView === 'curso-practico'));
              return (
                <button
                  key={link.href}
                  onClick={(e) => handleLinkClick(link.href, e)}
                  style={{
                    ...linkStyle,
                    color: isActive ? '#0b5ea8' : '#41556b',
                    fontWeight: isActive ? '700' : '600',
                    borderBottom: isActive ? '2px solid #0b5ea8' : 'none',
                    paddingBottom: isActive ? '4px' : '6px'
                  }}
                  className="nav-link"
                >
                  {link.label}
                </button>
              );
            })}
            <button onClick={onOpenMentorship} style={linkStyle} className="nav-link">
              Contacto
            </button>
          </nav>

          <button
            className="site-nav-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menú"
            style={{
              display: 'none',
              background: 'none',
              border: '1px solid #cfdeeb',
              borderRadius: '3px',
              padding: '8px',
              cursor: 'pointer',
              color: '#08365f',
            }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="site-nav-mobile" style={{
            borderTop: '1px solid #e3ebf3',
            background: '#ffffff',
            padding: '14px 36px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            fontFamily: 'var(--font-heading)',
          }}>
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={(e) => handleLinkClick(link.href, e)}
                style={{ ...linkStyle, fontSize: '14px', textAlign: 'left' }}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenMentorship(); }}
              className="btn btn-secondary"
              style={{ width: '100%' }}
            >
              Contacto
            </button>
          </div>
        )}
      </header>
    </>
  );
}
