import React, { useEffect, useState } from 'react';
import { Play, Sparkles, BookOpen, Clock, CheckCircle2, ArrowRight } from 'lucide-react';

// Free sample classes shown on the landing, in order (all are within the Aula's free lessons per specialty).
const SAMPLE_IDS = ['cardio-01', 'gastro-01', 'resp-01', 'ped-01', 'ob-01', 'cirugia-01'];

const fmt = (min) => (min ? `${min} min` : '');

export default function VideoMasterclassPlayer() {
  const [samples, setSamples] = useState([]);
  const [totals, setTotals] = useState(null);
  const [active, setActive] = useState(null);

  useEffect(() => {
    fetch('/aula/catalog.json').then(r => r.json()).then(catalog => {
      const all = catalog.modules.flatMap(m => m.specialties.flatMap(s => s.lessons.map(l => ({ ...l, specialty: s.name, accent: s.accent }))));
      const picked = SAMPLE_IDS.map(id => all.find(l => l.id === id && l.video)).filter(Boolean);
      setSamples(picked);
      setActive(picked[0] || null);
      setTotals({
        classes: all.filter(l => l.video).length,
        hours: Math.round(all.reduce((n, l) => n + (l.minutes || 0), 0) / 60),
        specialties: catalog.modules.reduce((n, m) => n + m.specialties.length, 0),
      });
    }).catch(() => {});
  }, []);

  const goToAula = (id) => {
    window.location.hash = id ? `#aula/${id}` : '#aula';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const videoSchema = active && {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": `${active.specialty}: ${active.title}`,
    "description": `Clase gratuita del Curso Teórico EUNACOM (Perfil V3): ${active.title}.`,
    "thumbnailUrl": `https://eunacom-examen.cl/aula/posters/${active.id}.jpg`,
    "uploadDate": "2026-10-19T08:00:00-03:00",
    "duration": `PT${active.minutes || 10}M`,
    "contentUrl": active.video,
    "embedUrl": `https://eunacom-examen.cl/#aula/${active.id}`,
  };

  const poster = l => `/aula/posters/${l.id}.jpg`;

  return (
    <section id="clase-magistral" className="mc">
      <div id="masterclass" style={{ position: 'relative', top: '-80px' }} />
      {videoSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }} />
      )}

      <div className="container">
        <header className="mc-head">
          <span className="mc-kicker"><Sparkles size={14} /> Clases gratis · sin registro</span>
          <h2>Mira una clase <span>real</span> del curso</h2>
          {totals && (
            <div className="mc-stats">
              <span><b>{totals.classes}</b> clases</span>
              <span><b>{totals.hours}</b> horas</span>
              <span><b>{totals.specialties}</b> especialidades</span>
            </div>
          )}
        </header>

        <div className="mc-grid">
          <div>
            <div className="mc-video">
              {active ? (
                <video
                  key={active.id}
                  src={active.video}
                  poster={poster(active)}
                  controls
                  preload="none"
                  playsInline
                  controlsList="nodownload"
                />
              ) : (
                <div className="mc-loading">Cargando clase…</div>
              )}
            </div>

            {active && (
              <div className="mc-now">
                <div className="mc-now__meta">{active.specialty} · <Clock size={12} /> {fmt(active.minutes)}</div>
                <div className="mc-now__title">{active.title}</div>
                {active.chapters?.length > 0 && (
                  <details className="mc-now__chapters">
                    <summary><BookOpen size={14} /> Qué verás ({active.chapters.length} temas)</summary>
                    <ul>
                      {active.chapters.map(c => <li key={c}><CheckCircle2 size={14} /> <span>{c}</span></li>)}
                    </ul>
                  </details>
                )}
              </div>
            )}
          </div>

          <div className="mc-side">
            <div className="mc-list__head">
              <b>Más clases de muestra</b>
              <span>{samples.length} gratis · desliza →</span>
            </div>
            <div className="mc-list" role="list">
              {samples.map(l => (
                <button key={l.id} role="listitem" className={`mc-card ${active?.id === l.id ? 'on' : ''}`} onClick={() => setActive(l)}>
                  <span className="mc-card__thumb">
                    <img src={poster(l)} alt="" loading="lazy" width="480" height="270" />
                    <Play size={18} fill="#fff" color="#fff" />
                    <em>{fmt(l.minutes)}</em>
                  </span>
                  <span className="mc-card__text">
                    <small>{l.specialty}</small>
                    <span>{l.title}</span>
                  </span>
                </button>
              ))}
            </div>

            <div className="mc-cta">
              <button onClick={() => goToAula(active?.id)} className="mc-btn mc-btn--light">
                {totals ? `Ver las ${totals.classes} clases` : 'Ver todas las clases'} <ArrowRight size={16} />
              </button>
              <a href="#tienda" className="mc-btn mc-btn--ghost">Comprar libros y clases <ArrowRight size={16} /></a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .mc { padding: 72px 0; background: #08365f; color: #fff; }
        .mc-head { text-align: center; max-width: 760px; margin: 0 auto 28px; }
        .mc-kicker { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 999px; background: rgba(255,255,255,.12); color: #a9d3f5; font-size: .75rem; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; margin-bottom: 12px; }
        .mc-head h2 { font-family: var(--font-heading); font-size: clamp(1.6rem, 3.2vw, 2.6rem); font-weight: 800; line-height: 1.15; margin: 0 0 14px; color: #fff; }
        .mc-head h2 span { color: #a9d3f5; }
        .mc-stats { display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; }
        .mc-stats span { padding: 6px 12px; border-radius: 999px; border: 1px solid rgba(169,211,245,.3); font-size: .82rem; color: #eef5fb; }
        .mc-stats b { color: #fff; font-weight: 800; }
        .mc-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 22px; }
        .mc-grid > * { min-width: 0; }
        .mc-video { position: relative; aspect-ratio: 16/9; border-radius: 10px; overflow: hidden; background: #0b1120; box-shadow: 0 18px 44px rgba(0,0,0,.35); }
        .mc-video video { width: 100%; height: 100%; display: block; object-fit: cover; background: #0b1120; }
        .mc-loading { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: #a9d3f5; }
        .mc-now { margin-top: 12px; }
        .mc-now__meta { display: flex; align-items: center; gap: 5px; font-size: .72rem; font-weight: 800; text-transform: uppercase; letter-spacing: .05em; color: #a9d3f5; }
        .mc-now__title { font-size: 1.05rem; font-weight: 800; line-height: 1.3; margin-top: 4px; }
        .mc-now__chapters { margin-top: 10px; font-size: .85rem; color: #eef5fb; }
        .mc-now__chapters summary { cursor: pointer; display: inline-flex; align-items: center; gap: 6px; color: #a9d3f5; font-weight: 700; list-style: none; }
        .mc-now__chapters summary::-webkit-details-marker { display: none; }
        .mc-now__chapters ul { list-style: none; padding: 8px 0 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
        .mc-now__chapters li { display: flex; gap: 8px; align-items: flex-start; line-height: 1.4; }
        .mc-now__chapters li svg { flex-shrink: 0; margin-top: 2px; color: #a9d3f5; }
        .mc-list__head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; }
        .mc-list__head b { font-size: 1rem; }
        .mc-list__head span { font-size: .72rem; color: #a9d3f5; font-weight: 700; }
        .mc-list { display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory; padding-bottom: 6px; margin: 0 -20px; padding-left: 20px; padding-right: 20px; scrollbar-width: none; }
        .mc-list::-webkit-scrollbar { display: none; }
        .mc-card { flex: 0 0 62%; scroll-snap-align: start; display: flex; flex-direction: column; gap: 6px; padding: 0; border: 0; background: none; color: #fff; text-align: left; cursor: pointer; font: inherit; }
        .mc-card__thumb { position: relative; display: block; aspect-ratio: 16/9; border-radius: 8px; overflow: hidden; outline: 2px solid transparent; outline-offset: 0; }
        .mc-card.on .mc-card__thumb { outline-color: #0bd9e7; }
        .mc-card__thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .mc-card__thumb svg { position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%); width: 38px; height: 38px; padding: 10px; border-radius: 50%; background: rgba(11,94,168,.85); }
        .mc-card__thumb em { position: absolute; right: 6px; bottom: 6px; padding: 1px 6px; border-radius: 4px; background: rgba(0,0,0,.7); font-style: normal; font-size: .7rem; font-weight: 700; }
        .mc-card__text small { display: block; font-size: .66rem; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; color: #a9d3f5; }
        .mc-card__text span { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: .82rem; line-height: 1.35; }
        .mc-cta { display: flex; flex-direction: column; gap: 10px; margin-top: 18px; }
        .mc-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 13px 16px; border-radius: 10px; font-weight: 800; font-size: .92rem; text-decoration: none; cursor: pointer; font-family: inherit; box-sizing: border-box; }
        .mc-btn--light { background: #fff; color: #08365f; border: 0; }
        .mc-btn--ghost { background: transparent; color: #fff; border: 1.5px solid rgba(169,211,245,.5); }
        @media (max-width: 600px) { .mc { padding: 48px 0; } }
        @media (min-width: 950px) {
          .mc-grid { grid-template-columns: minmax(0, 1.4fr) minmax(0, .9fr); gap: 32px; }
          .mc-list { flex-direction: column; overflow: visible; margin: 0; padding: 0; gap: 10px; }
          .mc-card { flex: none; flex-direction: row; align-items: center; gap: 12px; }
          .mc-card__thumb { flex: 0 0 132px; }
          .mc-list__head span { visibility: hidden; }
        }
      `}</style>
    </section>
  );
}
