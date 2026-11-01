import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { BRAND, CONTACTO } from '../site.config';
import { useAccount } from '../lib/account';

const NAV_LINKS = [
  { href: '#cursos', label: 'Cursos' },
  { href: '#aula', label: 'Aula virtual' },
  { href: '#tienda', label: 'Tienda' },
  { href: '#clase-magistral', label: 'Clase magistral' },
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
  const account = useAccount();
  const accountLabel = account?.user ? 'Mi cuenta' : 'Entrar';

  const handleLinkClick = (href, e) => {
    if (e) e.preventDefault();
    setMobileMenuOpen(false);
    if (href === '#blog') {
      if (onNavigateBlog) onNavigateBlog();
      else window.location.hash = '#blog';
    } else if (href === '#aula' || href === '#tienda') {
      window.location.hash = href;
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
            style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 'none', textDecoration: 'none' }}
          >
            <span style={{
              width: '68px',
              height: '38px',
              boxSizing: 'border-box',
              background: '#08365f',
              border: '2px solid #0bd9e7',
              clipPath: 'polygon(0 0, 100% 0, 100% 66%, 82% 100%, 0 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-heading)',
              fontSize: '16px',
              fontWeight: '800',
              letterSpacing: '-0.02em',
              lineHeight: 1,
              flex: 'none',
              userSelect: 'none',
            }}>
              <span style={{ color: '#ffffff' }}>A</span>
              <span style={{ color: '#0bd9e7' }}>E</span>
              <span style={{ color: '#ffffff' }}>E</span>
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
                fontWeight: '700',
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                color: '#0b5ea8',
              }}>
                {BRAND.bajada}
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
                (link.href === '#aula' && currentView === 'aula') ||
                (link.href === '#tienda' && currentView === 'tienda') ||
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
            <a href={account?.user ? '#mi-cuenta' : '#entrar'} className="nav-account">{accountLabel}</a>
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
            <a href={account?.user ? '#mi-cuenta' : '#entrar'} className="nav-account" onClick={() => setMobileMenuOpen(false)} style={{ textAlign: 'center' }}>{accountLabel}</a>
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
