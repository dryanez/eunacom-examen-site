import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, ChevronRight, Circle, Clock, Lock, PlayCircle, Search } from 'lucide-react';
import { COURSES } from '../data/coursesData';

// Classes open without enrolling in each specialty (0 = none; the landing's clase magistral has the samples).
const FREE_PER_SPECIALTY = 0;
const STORAGE_KEY = 'aee-aula-progress';

const loadProgress = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
};

const idFromHash = () => {
  const m = window.location.hash.match(/^#aula\/(.+)$/);
  return m ? decodeURIComponent(m[1]) : null;
};

export default function AulaPage({ onNavigateHome, onEnroll }) {
  const [catalog, setCatalog] = useState(null);
  const [error, setError] = useState(false);
  const [progress, setProgress] = useState(loadProgress);
  const [currentId, setCurrentId] = useState(idFromHash);
  const [openSpecialty, setOpenSpecialty] = useState(null);
  const [query, setQuery] = useState('');
  const videoRef = useRef(null);

  useEffect(() => {
    fetch('/aula/catalog.json').then(r => r.json()).then(setCatalog).catch(() => setError(true));
  }, []);

  useEffect(() => {
    const onHash = () => setCurrentId(idFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); }, [progress]);

  // Flat ordered list with the context each lesson needs (specialty, module, free/locked).
  const lessons = useMemo(() => {
    if (!catalog) return [];
    return catalog.modules.flatMap(m => m.specialties.flatMap(s => s.lessons.map((l, i) => ({
      ...l, specialty: s.name, accent: s.accent, module: m.name, locked: i >= FREE_PER_SPECIALTY,
    }))));
  }, [catalog]);

  const current = lessons.find(l => l.id === currentId) || lessons[0];
  const index = current ? lessons.indexOf(current) : -1;
  const doneCount = lessons.filter(l => progress[l.id]?.done).length;

  useEffect(() => { if (current) setOpenSpecialty(current.specialty); }, [current?.specialty]);

  const goTo = (lesson) => {
    if (!lesson) return;
    window.location.hash = `#aula/${lesson.id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const markDone = (id, done = true) => setProgress(p => ({ ...p, [id]: { ...p[id], done } }));

  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !current || !v.duration) return;
    const pos = Math.floor(v.currentTime);
    if (pos % 5 === 0) setProgress(p => ({ ...p, [current.id]: { ...p[current.id], pos } }));
    if (v.currentTime / v.duration > 0.9 && !progress[current.id]?.done) markDone(current.id);
  };

  const onLoaded = () => {
    const pos = progress[current?.id]?.pos;
    if (videoRef.current && pos && !progress[current.id]?.done) videoRef.current.currentTime = pos;
  };

  if (error) return <div className="container" style={{ padding: '80px 36px' }}>No se pudo cargar el catálogo de clases.</div>;
  if (!catalog || !current) return <div className="container" style={{ padding: '80px 36px', color: 'var(--slate-muted)' }}>Cargando aula…</div>;

  const q = query.trim().toLowerCase();
  const matches = l => !q || l.title.toLowerCase().includes(q) || l.specialty.toLowerCase().includes(q);
  const pct = Math.round((doneCount / lessons.length) * 100);

  return (
    <div style={{ background: 'var(--blue-soft)', minHeight: '80vh' }}>
      {/* Course header */}
      <div style={{ background: 'var(--navy-deep)', color: '#fff', padding: '22px 0' }}>
        <div className="container" style={{ padding: '0 36px', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <button onClick={() => onNavigateHome('')} style={backBtn}><ArrowLeft size={14} /> Inicio</button>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(20px,2.4vw,28px)', fontWeight: 800, marginTop: 10, color: '#fff' }}>
              Aula Virtual · Curso Teórico EUNACOM
            </h1>
            <p style={{ color: 'var(--on-navy)', fontSize: 14, marginTop: 4 }}>
              {lessons.length} clases en video · {Math.round(lessons.reduce((n, l) => n + (l.minutes || 0), 0) / 60)} horas · 4 módulos · {catalog.modules.reduce((n, m) => n + m.specialties.length, 0)} especialidades
            </p>
          </div>
          <div style={{ minWidth: 240 }}>
            <div style={{ fontSize: 13, color: 'var(--on-navy)', marginBottom: 6 }}>Tu avance: {doneCount}/{lessons.length} clases ({pct}%)</div>
            <div style={{ height: 8, background: 'rgba(255,255,255,.15)', borderRadius: 4 }}>
              <div style={{ width: `${pct}%`, height: '100%', background: '#0bd9e7', borderRadius: 4 }} />
            </div>
          </div>
        </div>
      </div>

      <div className="container aula-layout" style={{ padding: '24px 36px 60px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 360px', gap: 24, alignItems: 'start' }}>
        {/* Player + lesson info */}
        <section>
          <div style={{ background: '#000', borderRadius: 'var(--radius-lg)', overflow: 'hidden', aspectRatio: '16/9', position: 'relative' }}>
            {current.locked ? (
              <LockedPanel lesson={current} onEnroll={() => onEnroll(COURSES[0])} />
            ) : current.video ? (
              <video
                key={current.id}
                ref={videoRef}
                src={current.video}
                controls
                preload="metadata"
                playsInline
                controlsList="nodownload"
                onTimeUpdate={onTimeUpdate}
                onLoadedMetadata={onLoaded}
                onEnded={() => markDone(current.id)}
                style={{ width: '100%', height: '100%', display: 'block' }}
              />
            ) : (
              <div style={centerPanel}>Video en preparación. Vuelve pronto.</div>
            )}
          </div>

          <div style={{ background: '#fff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: 22, marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: current.accent || 'var(--blue-royal)', fontFamily: 'var(--font-heading)' }}>
              {current.module} · {current.specialty} {current.num && `· Clase ${current.num}`}
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(18px,2vw,24px)', fontWeight: 800, color: 'var(--navy-deep)', margin: '8px 0 6px' }}>{current.title}</h2>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: 'var(--slate-muted)' }}>
              {current.minutes && <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><Clock size={14} /> {current.minutes} min</span>}
              {current.code && <span>{current.code}</span>}
            </div>

            {current.chapters.length > 0 && (
              <>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 700, color: 'var(--navy-deep)', margin: '18px 0 8px' }}>En esta clase</h3>
                <ol style={{ paddingLeft: 20, color: 'var(--slate-text)', fontSize: 14, lineHeight: 1.8 }}>
                  {current.chapters.map(c => <li key={c}>{c}</li>)}
                </ol>
              </>
            )}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20, alignItems: 'center' }}>
              <button className="btn btn-secondary" disabled={index <= 0} onClick={() => goTo(lessons[index - 1])} style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                <ArrowLeft size={16} /> Anterior
              </button>
              {!current.locked && (
                <button className="btn btn-secondary" onClick={() => markDone(current.id, !progress[current.id]?.done)} style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                  <CheckCircle2 size={16} color={progress[current.id]?.done ? 'var(--accent-green)' : undefined} />
                  {progress[current.id]?.done ? 'Completada' : 'Marcar como completada'}
                </button>
              )}
              <button className="btn btn-primary" disabled={index >= lessons.length - 1} onClick={() => goTo(lessons[index + 1])} style={{ display: 'inline-flex', gap: 6, alignItems: 'center', marginLeft: 'auto' }}>
                Siguiente clase <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* Syllabus */}
        <aside className="aula-syllabus" style={{ background: '#fff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', position: 'sticky', top: 90, maxHeight: 'calc(100vh - 110px)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 14, borderBottom: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--border-blue)', borderRadius: 'var(--radius-sm)', padding: '8px 10px' }}>
              <Search size={15} color="var(--slate-subtle)" />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar clase o especialidad" style={{ border: 'none', outline: 'none', flex: 1, fontSize: 14, fontFamily: 'var(--font-body)' }} />
            </div>
          </div>
          <div style={{ overflowY: 'auto' }}>
            {catalog.modules.map(m => (
              <div key={m.id}>
                <div style={{ padding: '12px 14px 6px', fontFamily: 'var(--font-heading)', fontSize: 11, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--slate-subtle)' }}>{m.name}</div>
                {m.specialties.map(s => {
                  const items = lessons.filter(l => l.specialty === s.name && matches(l));
                  if (!items.length) return null;
                  const done = items.filter(l => progress[l.id]?.done).length;
                  const open = q || openSpecialty === s.name;
                  return (
                    <div key={s.name} style={{ borderTop: '1px solid var(--border-light)' }}>
                      <button onClick={() => setOpenSpecialty(open && !q ? null : s.name)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        <span style={{ width: 4, alignSelf: 'stretch', background: s.accent, borderRadius: 2 }} />
                        <span style={{ flex: 1, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, color: 'var(--navy-deep)' }}>{s.name}</span>
                        <span style={{ fontSize: 12, color: 'var(--slate-muted)' }}>{done}/{items.length}</span>
                      </button>
                      {open && items.map(l => {
                        const active = l.id === current.id;
                        return (
                          <button key={l.id} onClick={() => goTo(l)} style={{ width: '100%', display: 'flex', gap: 10, alignItems: 'flex-start', padding: '9px 14px 9px 38px', background: active ? 'var(--blue-ice)' : 'none', border: 'none', borderLeft: active ? `3px solid ${s.accent}` : '3px solid transparent', cursor: 'pointer', textAlign: 'left' }}>
                            <span style={{ marginTop: 2, flex: 'none' }}>
                              {progress[l.id]?.done ? <CheckCircle2 size={15} color="var(--accent-green)" />
                                : l.locked ? <Lock size={15} color="var(--slate-subtle)" />
                                : active ? <PlayCircle size={15} color={s.accent} /> : <Circle size={15} color="var(--slate-subtle)" />}
                            </span>
                            <span style={{ flex: 1, fontSize: 13, lineHeight: 1.4, color: 'var(--slate-dark)', fontWeight: active ? 700 : 400 }}>
                              {l.num && <span style={{ color: 'var(--slate-subtle)' }}>{l.num} · </span>}{l.title}
                            </span>
                            {l.minutes && <span style={{ fontSize: 11, color: 'var(--slate-subtle)', flex: 'none' }}>{l.minutes}′</span>}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </aside>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .aula-layout { grid-template-columns: 1fr !important; padding: 16px !important; }
          .aula-syllabus { position: static !important; max-height: 70vh !important; }
        }
      `}</style>
    </div>
  );
}

function LockedPanel({ lesson, onEnroll }) {
  return (
    <div style={{ ...centerPanel, flexDirection: 'column', gap: 14, background: 'var(--navy-deep)', padding: 24, textAlign: 'center' }}>
      <Lock size={32} color="#0bd9e7" />
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18 }}>Clase incluida en el Curso Teórico</div>
      <div style={{ color: 'var(--on-navy)', fontSize: 14, maxWidth: 420 }}>
        Inscríbete para ver las 468 clases del curso completo, ordenadas por módulo y especialidad.
      </div>
      <button className="btn btn-primary" onClick={onEnroll}>Inscribirme</button>
    </div>
  );
}

const centerPanel = { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 15 };
const backBtn = { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.25)', color: '#fff', padding: '5px 12px', borderRadius: 3, fontSize: 13, fontWeight: 600, cursor: 'pointer' };
