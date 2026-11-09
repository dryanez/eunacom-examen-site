import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CursoTeoricoPage from './components/CursoTeoricoPage';
import CursoPracticoPage from './components/CursoPracticoPage';
import AulaPage from './components/AulaPage';
import TiendaPage from './components/TiendaPage';
import BancoPage from './components/BancoPage';
import { CartProvider, CartDrawer } from './components/Cart';
import { AccountProvider } from './lib/account';
import GraciasPage from './components/account/GraciasPage';
import OnboardingPage from './components/account/OnboardingPage';
import CuentaPage from './components/account/CuentaPage';
import CheckoutPage from './components/account/CheckoutPage';
import './styles/store.css';
import './styles/account.css';

// Account pages, one hash each (#entrar is the sign-in screen of #mi-cuenta).
const ACCOUNT_VIEWS = { '#gracias': 'gracias', '#bienvenida': 'bienvenida', '#mi-cuenta': 'mi-cuenta', '#entrar': 'mi-cuenta', '#activar': 'mi-cuenta', '#checkout': 'checkout' };
import CourseDetailModal from './components/CourseDetailModal';
import EnrollmentModal from './components/EnrollmentModal';
import FreeMockExamsSection from './components/FreeMockExamsSection';
import PrerequisitesMatrix from './components/PrerequisitesMatrix';
import VideoMasterclassPlayer from './components/VideoMasterclassPlayer';
import BlogSection from './components/BlogSection';
import BlogArticleModalOrPage from './components/BlogArticleModalOrPage';
import BlogTopicProposer from './components/BlogTopicProposer';
import FaqSection from './components/FaqSection';
import DoctorMentorshipModal from './components/DoctorMentorshipModal';
import Footer from './components/Footer';
import { ArrowLeft, BookOpen, Home, FileCheck2 } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash === '#blog' || hash === '#guias') return 'blog';
      if (hash === '#revalidacion') return 'revalidacion';
      if (hash === '#curso-teorico') return 'curso-teorico';
      if (hash === '#curso-practico') return 'curso-practico';
      if (hash.startsWith('#aula')) return 'aula';
      if (hash === '#faq' || hash === '#preguntas') return 'faq';
      if (hash === '#banco') return 'banco';
      if (hash === '#tienda' || hash.startsWith('#tienda/')) return 'tienda'; // #tienda/<especialidad>
      if (ACCOUNT_VIEWS[hash]) return ACCOUNT_VIEWS[hash];
    }
    return 'home';
  });

  const [selectedCourseForDetail, setSelectedCourseForDetail] = useState(null);
  const [selectedCourseForEnrollment, setSelectedCourseForEnrollment] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isMentorshipOpen, setIsMentorshipOpen] = useState(false);
  const [isSEOStudioOpen, setIsSEOStudioOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#blog' || hash === '#guias') {
        setCurrentView('blog');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#revalidacion') {
        setCurrentView('revalidacion');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#curso-teorico') {
        setCurrentView('curso-teorico');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#curso-practico') {
        setCurrentView('curso-practico');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash.startsWith('#aula')) {
        setCurrentView('aula');
      } else if (hash === '#banco') {
        setCurrentView('banco');
        window.scrollTo({ top: 0 });
      } else if (hash === '#faq' || hash === '#preguntas') {
        setCurrentView('faq');
        window.scrollTo({ top: 0 });
      } else if (hash === '#tienda' || hash.startsWith('#tienda/')) {
        setCurrentView('tienda');
      } else if (ACCOUNT_VIEWS[hash.split('&')[0]]) {
        setCurrentView(ACCOUNT_VIEWS[hash.split('&')[0]]);
        window.scrollTo({ top: 0 });
      } else if (hash === '#manuales' || hash === '#bienvenido') {
        setCurrentView('home');
        setTimeout(() => {
          const el = document.querySelector('#manuales');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else if (hash === '#cursos' || hash === '#diagnostico' || hash === '#clase-magistral' || hash === '') {
        setCurrentView('home');
      }
    };

    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('promo');
      const hash = window.location.hash;
      if (p || hash === '#manuales' || hash === '#bienvenido') {
        setTimeout(() => {
          const el = document.querySelector('#manuales');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 200);
      }
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigateBlog = () => {
    setCurrentView('blog');
    window.location.hash = '#blog';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateRevalidacion = () => {
    setCurrentView('revalidacion');
    window.location.hash = '#revalidacion';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateCursoTeorico = () => {
    setCurrentView('curso-teorico');
    window.location.hash = '#curso-teorico';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateCursoPractico = () => {
    setCurrentView('curso-practico');
    window.location.hash = '#curso-practico';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateHome = (targetHash = '') => {
    setCurrentView('home');
    if (targetHash) {
      window.location.hash = targetHash;
      setTimeout(() => {
        const el = document.querySelector(targetHash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      window.location.hash = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Organization/WebSite JSON-LD lives in index.html (static, readable without JS).

  const handleStartDiagnostic = () => {
    if (currentView !== 'home') setCurrentView('home');
    setTimeout(() => {
      const el = document.getElementById('diagnostico');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  return (
    <AccountProvider>
    <CartProvider>
    <div className="site-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Navbar */}
      <Navbar
        currentView={currentView}
        onOpenMentorship={() => setIsMentorshipOpen(true)}
        onNavigateHome={handleNavigateHome}
        onNavigateBlog={handleNavigateBlog}
        onNavigateRevalidacion={handleNavigateRevalidacion}
        onNavigateCursoTeorico={handleNavigateCursoTeorico}
        onNavigateCursoPractico={handleNavigateCursoPractico}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {currentView === 'home' && (
          <>
            {/* 1. Hero Section */}
            <Hero
              onOpenMentorship={() => setIsMentorshipOpen(true)}
              onStartDiagnostic={handleStartDiagnostic}
            />

            {/* 2. Video Masterclass Player (Cardiología EUNACOM de Alto Rendimiento) */}
            <VideoMasterclassPlayer
              onOpenMentorship={() => setIsMentorshipOpen(true)}
              onSelectCourse={(c) => setSelectedCourseForEnrollment(c)}
            />

            {/* 3. Tienda: elige especialidad y formato, igual que en #tienda */}
            <TiendaPage compact />

            {/* 5. Free Diagnostic 5-Question Mock Exam */}
            <FreeMockExamsSection
              onOpenMentorship={() => setIsMentorshipOpen(true)}
              onSelectCourse={(c) => setSelectedCourseForEnrollment(c)}
            />
          </>
        )}

        {/* Dedicated Full Page: Preguntas frecuentes */}
        {currentView === 'banco' && <BancoPage />}

        {currentView === 'faq' && (
          <FaqSection onOpenMentorship={() => setIsMentorshipOpen(true)} />
        )}

        {/* Dedicated Full Page: Curso Teórico */}
        {currentView === 'curso-teorico' && (
          <CursoTeoricoPage
            onNavigateHome={handleNavigateHome}
            onEnroll={(c) => setSelectedCourseForEnrollment(c)}
          />
        )}

        {/* Dedicated Full Page: Curso Práctico (ECOE - Próximamente) */}
        {currentView === 'curso-practico' && (
          <CursoPracticoPage
            onNavigateHome={handleNavigateHome}
            onOpenMentorship={() => setIsMentorshipOpen(true)}
          />
        )}

        {currentView === 'tienda' && <TiendaPage />}
        {currentView === 'gracias' && <GraciasPage />}
        {currentView === 'bienvenida' && <OnboardingPage />}
        {currentView === 'mi-cuenta' && <CuentaPage />}
        {currentView === 'checkout' && <CheckoutPage />}

        {/* Aula Virtual: all V3 video classes as a course (module → specialty → lesson) */}
        {currentView === 'aula' && (
          <AulaPage onNavigateHome={handleNavigateHome} />
        )}

        {/* Dedicated Revalidación View */}
        {currentView === 'revalidacion' && (
          <div>
            <div style={{ backgroundColor: '#08365f', color: '#ffffff', padding: '18px 0' }}>
              <div className="container" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px'
              }}>
                <button
                  onClick={() => handleNavigateHome('')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    color: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    fontSize: '0.88rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  <ArrowLeft size={16} />
                  <span>Volver a la página principal</span>
                </button>

                <div style={{ fontSize: '0.85rem', color: '#b9d3ea', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Home size={14} />
                  <span>Inicio</span>
                  <span>/</span>
                  <FileCheck2 size={14} />
                  <span style={{ color: '#ffffff', fontWeight: '700' }}>Para Médicos Extranjeros · Guía Normativa y Revalidación</span>
                </div>
              </div>
            </div>

            <PrerequisitesMatrix
              onOpenMentorship={() => setIsMentorshipOpen(true)}
            />
          </div>
        )}

        {/* Dedicated Blog View */}
        {currentView === 'blog' && (
          <div>
            <div style={{ backgroundColor: '#08365f', color: '#ffffff', padding: '18px 0' }}>
              <div className="container" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px'
              }}>
                <button
                  onClick={() => handleNavigateHome('')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    color: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    fontSize: '0.88rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  <ArrowLeft size={16} />
                  <span>Volver a la página principal</span>
                </button>

                <div style={{ fontSize: '0.85rem', color: '#b9d3ea', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Home size={14} />
                  <span>Inicio</span>
                  <span>/</span>
                  <BookOpen size={14} />
                  <span style={{ color: '#ffffff', fontWeight: '700' }}>Centro de Inteligencia Médica y Blog</span>
                </div>
              </div>
            </div>

            <BlogSection
              onSelectArticle={(art) => setSelectedArticle(art)}
              onOpenTopicProposer={() => setIsSEOStudioOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenMentorship={() => setIsMentorshipOpen(true)}
        onOpenSEOStudio={() => setIsSEOStudioOpen(true)}
        onNavigateHome={handleNavigateHome}
        onNavigateBlog={handleNavigateBlog}
        onNavigateRevalidacion={handleNavigateRevalidacion}
        onNavigateCursoTeorico={handleNavigateCursoTeorico}
        onNavigateCursoPractico={handleNavigateCursoPractico}
      />

      {/* Modals */}
      {selectedCourseForDetail && (
        <CourseDetailModal
          course={selectedCourseForDetail}
          onClose={() => setSelectedCourseForDetail(null)}
          onEnroll={(c) => {
            setSelectedCourseForDetail(null);
            setSelectedCourseForEnrollment(c);
          }}
        />
      )}

      {selectedCourseForEnrollment && (
        <EnrollmentModal
          course={selectedCourseForEnrollment}
          onClose={() => setSelectedCourseForEnrollment(null)}
        />
      )}

      {selectedArticle && (
        <BlogArticleModalOrPage
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onSelectCourse={(c) => setSelectedCourseForEnrollment(c)}
          onOpenMentorship={() => {
            setSelectedArticle(null);
            setIsMentorshipOpen(true);
          }}
        />
      )}

      {isMentorshipOpen && (
        <DoctorMentorshipModal
          onClose={() => setIsMentorshipOpen(false)}
        />
      )}

      {isSEOStudioOpen && (
        <BlogTopicProposer
          onClose={() => setIsSEOStudioOpen(false)}
        />
      )}

      <CartDrawer hideBar={currentView === 'tienda' || currentView === 'checkout'} onCheckout={() => { window.location.hash = '#checkout'; }} />
    </div>
    </CartProvider>
    </AccountProvider>
  );
}
