import React, { useMemo, useState } from 'react';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { supabase, useAccount } from '../../lib/account';
import { CHILEAN_UNIVERSITIES, COUNTRIES } from '../../data/universities';

const EXAMS = ['Diciembre 2026', 'Julio 2027', 'Diciembre 2027', 'Todavía no sé'];
const HEARD = ['Instagram', 'TikTok', 'YouTube', 'Google', 'Un amigo o colega', 'EUNACOM App', 'Otro'];

// Four short steps after sign-up: where you studied, university, when you sit the exam, contact.
export default function OnboardingPage() {
  const { user, profile, refresh, awardXp } = useAccount();
  const [step, setStep] = useState(0);
  const [f, setF] = useState({ country: '', university: '', exam_date: '', phone: '', heard_from: '' });
  const [q, setQ] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setF(x => ({ ...x, [k]: v }));

  const unis = useMemo(() => {
    const list = f.country === 'CL' ? CHILEAN_UNIVERSITIES : [];
    const n = q.trim().toLowerCase();
    return n ? list.filter(u => u.name.toLowerCase().includes(n) || u.shortName?.toLowerCase().includes(n)) : list;
  }, [f.country, q]);

  if (!user) return <div className="st ac-page"><div className="st-wrap"><p className="st-lead" style={{ padding: '80px 0' }}>Confirma tu correo e inicia sesión para continuar. <a href="#entrar">Entrar</a></p></div></div>;

  const finish = async () => {
    setSaving(true);
    await supabase.from('profiles').update({ ...f, onboarded: true }).eq('id', user.id);
    await awardXp('onboarding', 'profile', 50);
    await refresh();
    window.location.hash = '#mi-cuenta';
  };

  const steps = [
    {
      title: '¿Dónde estudiaste medicina?',
      body: (
        <div className="ob-countries">
          <button className={`ob-opt big ${f.country === 'CL' ? 'on' : ''}`} onClick={() => { set('country', 'CL'); setStep(1); }}>🇨🇱 <b>En Chile</b></button>
          <div className="ob-label">En el extranjero</div>
          <div className="ob-flags">
            {COUNTRIES.filter(c => c.code !== 'CL').map(c => (
              <button key={c.code} className={`ob-opt ${f.country === c.code ? 'on' : ''}`} onClick={() => { set('country', c.code); setStep(1); }}>{c.flag} {c.name}</button>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: f.country === 'CL' ? '¿En qué universidad?' : '¿En qué universidad?',
      body: f.country === 'CL' ? (
        <>
          <input className="ob-search" placeholder="Busca tu universidad" value={q} onChange={e => setQ(e.target.value)} />
          <div className="ob-unis">
            {unis.map(u => (
              <button key={u.id} className={`ob-uni ${f.university === u.id ? 'on' : ''}`} onClick={() => { set('university', u.id); setStep(2); }}>
                <img src={u.logo} alt="" loading="lazy" /><span><b>{u.shortName}</b><small>{u.name}</small></span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <input className="ob-search" placeholder="Nombre de tu universidad" value={f.university} onChange={e => set('university', e.target.value)} />
          <button className="st-add" disabled={!f.university.trim()} onClick={() => setStep(2)} style={{ marginTop: 14 }}>Seguir <ArrowRight size={18} /></button>
        </>
      ),
    },
    {
      title: '¿Cuándo das el EUNACOM?',
      body: <div className="ob-row">{EXAMS.map(e => <button key={e} className={`ob-opt big ${f.exam_date === e ? 'on' : ''}`} onClick={() => { set('exam_date', e); setStep(3); }}>{e}</button>)}</div>,
    },
    {
      title: 'Último paso',
      body: (
        <>
          <label className="ob-field">Tu WhatsApp (para avisarte de clases nuevas y resolver dudas)
            <input className="ob-search" placeholder="+56 9 …" value={f.phone} onChange={e => set('phone', e.target.value)} autoComplete="tel" />
          </label>
          <div className="ob-label">¿Cómo nos conociste?</div>
          <div className="ob-row">{HEARD.map(h => <button key={h} className={`ob-opt ${f.heard_from === h ? 'on' : ''}`} onClick={() => set('heard_from', h)}>{h}</button>)}</div>
          <button className="st-add" onClick={finish} disabled={saving} style={{ marginTop: 18 }}>{saving ? 'Guardando…' : 'Listo, ver mi biblioteca'} <Check size={18} /></button>
        </>
      ),
    },
  ];

  return (
    <div className="st ac-page">
      <div className="st-wrap ob">
        <div className="ob-progress"><i style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
        <div className="ob-head">
          {step > 0 && <button className="ac-link" onClick={() => setStep(step - 1)}><ArrowLeft size={16} /> Atrás</button>}
          <span>Paso {step + 1} de {steps.length} · +50 XP al terminar</span>
        </div>
        <h1 key={step} className="ob-title">{profile?.full_name ? `${profile.full_name.split(' ')[0]}, ` : ''}{steps[step].title.charAt(0).toLowerCase() + steps[step].title.slice(1)}</h1>
        <div key={`b${step}`} className="ob-body">{steps[step].body}</div>
      </div>
    </div>
  );
}
