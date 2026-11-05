import React, { useEffect, useMemo, useState } from 'react';
import { Check, X, ArrowRight, ArrowLeft, Lightbulb, Lock, ShoppingCart, BookOpen, FileCheck2 } from 'lucide-react';
import { SPECIALTIES, BANK, PRODUCTS, fmtClp } from '../data/tienda';
import { useCart } from './Cart';
import PartnerBanner from './PartnerBanner';
import '../styles/quiz.css';

const LETTERS = 'ABCDE';
const SOURCES = [
  { key: 'all', label: 'Todas' },
  { key: 'real', label: 'EUNACOM reales' },
  { key: 'gordo', label: 'Libro Gordo' },
];

// #banco: free preview of the question bank (public/banco/muestra.json, built by scripts/export-bank-sample.mjs).
export default function BancoPage() {
  const cart = useCart();
  const [sample, setSample] = useState(null);
  const [spec, setSpec] = useState('pediatria');
  const [source, setSource] = useState('all');
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});

  useEffect(() => { fetch('/banco/muestra.json').then(r => r.json()).then(setSample).catch(() => setSample({})); }, []);

  const s = SPECIALTIES.find(x => x.key === spec);
  const bank = BANK.specialties.find(b => b.key === spec);
  const questions = useMemo(() => (sample?.[spec] || []).filter(q => source === 'all' || q.source === source), [sample, spec, source]);
  const atLock = idx >= questions.length;
  const q = questions[idx];
  const key = `${spec}-${source}-${idx}`;
  const picked = answers[key];
  const answered = picked !== undefined;

  const choose = (k, src = source) => { setSpec(k); setSource(src); setIdx(0); };
  const add = sku => (cart.state(sku) ? cart.setOpen(true) : cart.toggle(sku));
  const skuBtn = (sku, label) => {
    const st = cart.state(sku);
    return (
      <button className={sku === 'banco-completo' ? 'qz-next' : 'qz-back'} onClick={() => add(sku)}>
        <ShoppingCart size={16} /> {st ? 'En tu carrito' : `${label} · ${fmtClp(PRODUCTS[sku].price)}`}
      </button>
    );
  };

  return (
    <section className="qz" style={{ minHeight: '80vh' }}>
      <div className="container">
        <header className="qz-head">
          <span className="qz-kicker"><BookOpen size={14} /> Banco de preguntas · prueba gratis</span>
          <h2>Más de <span>{BANK.total.toLocaleString('es-CL')}</span> preguntas con explicación</h2>
          <p>Preguntas de los {BANK.exams} EUNACOM reconstruidos, de los Libros Gordos y del banco de EUNACOMapp, ordenadas por especialidad. Prueba unas cuantas de cada una.</p>
          <PartnerBanner style={{ marginTop: 22 }} />
        </header>

        <div className="bk-specs" role="tablist" aria-label="Especialidades">
          {SPECIALTIES.map(x => (
            <button key={x.key} role="tab" aria-selected={x.key === spec} className={x.key === spec ? 'on' : ''} style={{ '--c': x.color }} onClick={() => choose(x.key)}>
              {x.title}
            </button>
          ))}
        </div>

        <div className="qz-card">
          <div className="bk-sources">
            {SOURCES.map(x => (
              <button key={x.key} className={x.key === source ? 'on' : ''} onClick={() => choose(spec, x.key)}>{x.label}</button>
            ))}
            {bank && <span className="bk-total">{s.title}: más de {bank.total.toLocaleString('es-CL')} preguntas</span>}
          </div>

          {!sample ? <p className="qz-hint">Cargando preguntas…</p> : atLock ? (
            <div className="bk-lock">
              <span className="bk-lock__ic"><Lock size={26} /></span>
              <h3>Eso fue una muestra</h3>
              <p>
                Viste {questions.length} de más de {bank.total.toLocaleString('es-CL')} preguntas de {s.title}, {bank.real} de ellas de EUNACOM reales.
                Desbloquea el banco y practica todas, con explicación y código del Perfil V3.
              </p>
              <div className="qz-cta" style={{ justifyContent: 'center' }}>
                {skuBtn('banco-completo', 'Banco completo')}
                {skuBtn(`banco-${spec}`, `Solo ${s.title}`)}
              </div>
              <button className="bk-link" onClick={() => setIdx(0)}>Volver a la primera pregunta</button>
            </div>
          ) : (
            <>
              <div className="qz-top">
                <span className={`bk-src ${q.source}`}>
                  {q.source === 'real' ? <><FileCheck2 size={13} /> {q.exam} · pregunta real</> : <><BookOpen size={13} /> Libro Gordo · código {q.code}</>}
                </span>
                <span className="qz-count">{idx + 1}<small>/{questions.length}</small></span>
              </div>
              <div className="qz-bar" style={{ gridTemplateColumns: `repeat(${questions.length}, 1fr)` }}>
                {questions.map((x, i) => {
                  const a = answers[`${spec}-${source}-${i}`];
                  return <i key={i} className={a === undefined ? (i === idx ? 'cur' : '') : a === x.correct ? 'ok' : 'bad'} />;
                })}
              </div>
              {q.topic && <div className="bk-topic">{q.topic}</div>}
              <p className="qz-stem">{q.stem}</p>

              <div className="qz-opts">
                {q.options.map((opt, i) => {
                  const st = !answered ? '' : i === q.correct ? 'ok' : i === picked ? 'bad' : 'dim';
                  return (
                    <button key={i} className={`qz-opt ${st}`} disabled={answered} onClick={() => setAnswers({ ...answers, [key]: i })}>
                      <span className="l">{st === 'ok' ? <Check size={16} /> : st === 'bad' ? <X size={16} /> : LETTERS[i]}</span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {answered && (
                <div className={`qz-expl ${picked === q.correct ? 'ok' : 'bad'}`}>
                  <b className="qz-expl__h">{picked === q.correct ? '¡Correcto!' : `Incorrecto · la respuesta es ${LETTERS[q.correct]}`}</b>
                  <p>{q.why}</p>
                  {q.source === 'real' && <div className="qz-pearl"><Lightbulb size={16} /><span><b>Pregunta real</b>Salió en el {q.exam}. En el banco tienes las {BANK.examQuestions.toLocaleString('es-CL')} de los {BANK.exams} exámenes.</span></div>}
                </div>
              )}

              <div className="qz-nav">
                <button className="qz-back" onClick={() => setIdx(idx - 1)} disabled={idx === 0}><ArrowLeft size={16} /> Anterior</button>
                {answered
                  ? <button className="qz-next" onClick={() => setIdx(idx + 1)}>Siguiente <ArrowRight size={16} /></button>
                  : <span className="qz-hint">Elige una alternativa</span>}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .bk-specs { display: flex; gap: 8px; overflow-x: auto; padding: 4px 4px 14px; margin: 0 auto 18px; max-width: 1000px; scrollbar-width: thin; }
        .bk-specs button { flex: none; padding: 8px 14px; border-radius: 999px; border: 1.5px solid #dbe4f0; background: #fff; color: #334155; font: 700 13px var(--font-heading); cursor: pointer; transition: all .15s; }
        .bk-specs button:hover { border-color: var(--c, #2563eb); }
        .bk-specs button.on { background: var(--c, #2563eb); border-color: var(--c, #2563eb); color: #fff; }
        .bk-sources { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-bottom: 18px; padding-bottom: 16px; border-bottom: 1px solid #eef2f7; }
        .bk-sources button { padding: 7px 13px; border-radius: 10px; border: 0; background: #f1f5f9; color: #475569; font: 700 13px var(--font-heading); cursor: pointer; }
        .bk-sources button.on { background: #0f172a; color: #fff; }
        .bk-total { margin-left: auto; font-size: 13px; color: #64748b; font-weight: 600; }
        .bk-src { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 999px; font: 700 12.5px var(--font-heading); }
        .bk-src.real { background: #fef3c7; color: #92400e; }
        .bk-src.gordo { background: #eff6ff; color: #1d4ed8; }
        .bk-topic { font-size: 12.5px; color: #64748b; font-weight: 600; margin: -10px 0 8px; }
        .bk-lock { text-align: center; padding: 18px 6px 6px; }
        .bk-lock__ic { display: inline-grid; place-items: center; width: 60px; height: 60px; border-radius: 18px; background: #eff6ff; color: #2563eb; margin-bottom: 12px; }
        .bk-lock h3 { font: 800 24px var(--font-heading); color: #0f172a; margin: 0 0 8px; }
        .bk-lock p { color: #475569; line-height: 1.6; max-width: 520px; margin: 0 auto 18px; }
        .bk-link { margin-top: 14px; background: none; border: 0; color: #2563eb; font-weight: 700; cursor: pointer; }
        @media (max-width: 640px) { .bk-total { margin-left: 0; width: 100%; } }
      `}</style>
    </section>
  );
}
