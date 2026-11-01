import React, { useMemo, useState } from 'react';
import { BookOpen, ListChecks, PlayCircle, Flame, Star, LogOut, Lock } from 'lucide-react';
import { useAccount, levelFor } from '../../lib/account';
import { SPECIALTIES, TYPES, BANK } from '../../data/tienda';
import TOMOS_DATA from '../../data/tomosCatalog.json';
import { CHILEAN_UNIVERSITIES } from '../../data/universities';
import AuthCard from './AuthCard';
import BookReader from './BookReader';

const BOOK_TYPES = ['tomo', 'gordo', 'repaso', 'atlas', 'perfil', 'anki'];
const EXTRAS = [
  { sku: 'gran-gordo', title: 'El Gran Libro Gordo', cover: TOMOS_DATA.extras['gran-libro-gordo'].cover },
  { sku: 'gran-recons', title: 'Reconstrucciones 2013–2025', cover: '/covers/q_recons.jpg' },
  { sku: 'perfil-completo', title: 'Perfil V3 completo', cover: TOMOS_DATA.extras['perfil-v3-completo'].cover },
];

export default function CuentaPage() {
  const { enabled, ready, user, profile, owned, signOut, authHeader } = useAccount();
  // Anki decks are files by nature: owners get a 10-minute download link.
  const downloadAnki = async sku => {
    const r = await fetch(`/api/library?item=${encodeURIComponent(sku)}`, { headers: authHeader() });
    if (r.ok) window.location.href = (await r.json()).url;
  };
  const [tab, setTab] = useState('biblioteca');
  const [reading, setReading] = useState(null);

  const books = useMemo(() => [
    ...SPECIALTIES.flatMap(s => s.items.filter(i => BOOK_TYPES.includes(i.type) && owned.items.has(i.sku)).map(i => ({ sku: i.sku, title: `${TYPES[i.type].name} · ${s.title}`, cover: i.cover, anki: i.type === 'anki' }))),
    ...EXTRAS.filter(x => owned.items.has(x.sku)),
  ], [owned]);
  const banks = BANK.specialties.filter(b => owned.items.has(b.sku));
  const classes = SPECIALTIES.filter(s => owned.items.has(`clases-${s.key}`));

  if (!enabled) return <div className="st ac-page"><div className="st-wrap"><p className="st-lead" style={{ padding: '80px 0' }}>Las cuentas se activan muy pronto. Si ya compraste, tu compra quedó registrada con tu correo.</p></div></div>;
  if (!ready) return <div className="st ac-page"><div className="st-wrap"><p className="st-lead" style={{ padding: '80px 0' }}>Cargando…</p></div></div>;
  if (!user) {
    return (
      <div className="st ac-page"><div className="st-wrap ac-grid">
        <div className="ac-hero"><h1>Tu cuenta AEE</h1><p className="st-lead">Entra para ver tus libros, tus clases y tu banco de preguntas. Si compraste sin cuenta, créala con el mismo correo de la compra.</p></div>
        <div className="ac-side"><AuthCard initialMode="signin" /></div>
      </div></div>
    );
  }

  const xp = profile?.xp || 0;
  const lv = levelFor(xp);
  const uni = CHILEAN_UNIVERSITIES.find(u => u.id === profile?.university);

  return (
    <div className="st ac-page">
      <div className="xp-bar">
        <div className="st-wrap xp-in">
          <div className="xp-who">
            {uni ? <img src={uni.logo} alt="" /> : <span className="xp-av">{(profile?.full_name || user.email)[0].toUpperCase()}</span>}
            <span><b>{profile?.full_name || user.email}</b><small>{lv.name}{uni ? ` · ${uni.shortName}` : ''}</small></span>
          </div>
          <div className="xp-level">
            <span><Star size={15} /> Nivel {lv.index} · {xp.toLocaleString('es-CL')} XP</span>
            <div className="xp-track"><i style={{ width: `${Math.round(lv.progress * 100)}%` }} /></div>
            <small>{lv.next ? `${(lv.next.min - xp).toLocaleString('es-CL')} XP para ${lv.next.name}` : 'Nivel máximo'}</small>
          </div>
          <div className="xp-streak"><Flame size={18} /> {profile?.streak_days || 0} días</div>
          <button className="ac-link" onClick={signOut}><LogOut size={15} /> Salir</button>
        </div>
      </div>

      <div className="st-wrap">
        {profile && !profile.onboarded && <a className="ac-nudge" href="#bienvenida">Completa tu perfil en 30 segundos y gana +50 XP →</a>}
        <div className="ac-tabs big">
          <button className={tab === 'biblioteca' ? 'on' : ''} onClick={() => setTab('biblioteca')}><BookOpen size={16} /> Mi Biblioteca ({books.length})</button>
          <button className={tab === 'banco' ? 'on' : ''} onClick={() => setTab('banco')}><ListChecks size={16} /> Banco de preguntas</button>
          <button className={tab === 'clases' ? 'on' : ''} onClick={() => setTab('clases')}><PlayCircle size={16} /> Clases</button>
        </div>

        {tab === 'biblioteca' && (books.length ? (
          <div className="lib-grid">
            {books.map(b => (
              <button key={b.sku} className="lib-item" onClick={() => b.anki ? downloadAnki(b.sku) : setReading(b)} title={b.anki ? 'Descargar para importar en Anki' : 'Leer'}>
                <img className="st-book" src={b.cover} alt="" loading="lazy" />
                <b>{b.title}</b>
                <small>{b.anki ? 'Descargar para Anki' : 'Leer en línea'}</small>
              </button>
            ))}
          </div>
        ) : <Empty text="Aún no tienes libros." />)}

        {tab === 'banco' && (banks.length ? (
          <div className="lib-banks">
            {banks.map(b => (
              <div key={b.key} className="bank-row" style={{ '--c': b.color }}>
                <img src={b.cover} alt="" /><span><b>{b.title}</b><small>Más de {b.total.toLocaleString('es-CL')} preguntas · {b.real} de EUNACOM reales</small></span>
                <span className="soon"><Lock size={13} /> Abre pronto</span>
              </div>
            ))}
          </div>
        ) : <Empty text="El banco de preguntas viene con el Pack Total, el Curso Teórico o por especialidad." cta />)}

        {tab === 'clases' && (classes.length ? (
          <div className="lib-banks">
            {classes.map(s => (
              <a key={s.key} className="bank-row" href={`#aula`} style={{ '--c': s.color, textDecoration: 'none' }}>
                <img src={s.items.find(i => i.type === 'clases')?.cover} alt="" style={{ aspectRatio: '16/9', width: 72, height: 'auto' }} />
                <span><b>{s.title}</b><small>{s.items.find(i => i.type === 'clases')?.label}</small></span>
                <span className="soon">Ver →</span>
              </a>
            ))}
          </div>
        ) : <Empty text="Las clases vienen con el Pack Total, el Curso Teórico, cada módulo o por especialidad." cta />)}
      </div>

      {reading && <BookReader item={reading.sku} title={reading.title} onClose={() => setReading(null)} />}
    </div>
  );
}

function Empty({ text, cta }) {
  return (
    <div className="ac-empty">
      <p>{text}</p>
      {cta !== false && <a className="st-mini" href="#tienda" style={{ textDecoration: 'none' }}>Ver la tienda →</a>}
    </div>
  );
}
