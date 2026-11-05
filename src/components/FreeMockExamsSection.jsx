import React, { useMemo, useState } from 'react';
import { DIAGNOSTIC_QUESTIONS } from '../data/mockExamsData';
import { Check, X, ArrowRight, ArrowLeft, RotateCcw, Lightbulb, Sparkles, Trophy, Stethoscope } from 'lucide-react';
import PartnerBanner from './PartnerBanner';
import '../styles/quiz.css';

// The data lists the right answer first; each question gets its own fixed order so it isn't always A.
const ORDERS = [[1, 0, 2, 3], [3, 1, 0, 2], [0, 2, 3, 1], [2, 3, 1, 0], [1, 3, 0, 2]];
const LETTERS = 'ABCD';

export default function FreeMockExamsSection({ onOpenMentorship }) {
  const questions = useMemo(() => DIAGNOSTIC_QUESTIONS.map((q, i) => {
    const order = ORDERS[i % ORDERS.length];
    return { ...q, options: order.map(k => q.options[k]), correctIndex: order.indexOf(q.correctIndex) };
  }), []);

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);

  const q = questions[idx];
  const picked = answers[idx];
  const answered = picked !== undefined;
  const total = questions.length;
  const correct = questions.filter((x, i) => answers[i] === x.correctIndex).length;
  const pct = Math.round((correct / total) * 100);

  const next = () => (idx < total - 1 ? setIdx(idx + 1) : setDone(true));
  const restart = () => { setIdx(0); setAnswers({}); setDone(false); };

  const verdict = pct >= 80
    ? { t: 'Excelente base', d: 'Dominas los temas de alta frecuencia. Ahora toca afinar distractores con el banco completo y los EUNACOM reconstruidos.' }
    : pct >= 60
      ? { t: 'Sobre el corte, por poco', d: 'Pasas el 51 %, pero el examen real castiga los vacíos en GES y en los algoritmos chilenos. Un banco comentado lo corrige rápido.' }
      : { t: 'Bajo el corte', d: 'Necesitas una ruta ordenada: clases por tema, preguntas comentadas y simulacros cronometrados.' };

  return (
    <section id="diagnostico" className="qz">
      <div className="container">
        <header className="qz-head">
          <span className="qz-kicker"><Stethoscope size={14} /> Diagnóstico gratis · 5 preguntas</span>
          <h2>¿Cómo estás para el <span>EUNACOM</span>?</h2>
          <p>Cinco preguntas de alta frecuencia del Perfil V3. Respondes y ves al tiro la explicación.</p>
          <PartnerBanner style={{ marginTop: 22 }} />
        </header>

        <div className="qz-card">
          {!done ? (
            <>
              <div className="qz-top">
                <span className="qz-area">{q.area}</span>
                <span className="qz-count">{idx + 1}<small>/{total}</small></span>
              </div>
              <div className="qz-bar">
                {questions.map((x, i) => (
                  <i key={i} className={answers[i] === undefined ? (i === idx ? 'cur' : '') : answers[i] === x.correctIndex ? 'ok' : 'bad'} />
                ))}
              </div>

              <div className="qz-case">Caso clínico</div>
              <p className="qz-stem">{q.question}</p>

              <div className="qz-opts">
                {q.options.map((opt, i) => {
                  const state = !answered ? '' : i === q.correctIndex ? 'ok' : i === picked ? 'bad' : 'dim';
                  return (
                    <button key={i} className={`qz-opt ${state}`} disabled={answered} onClick={() => setAnswers({ ...answers, [idx]: i })}>
                      <span className="l">{state === 'ok' ? <Check size={16} /> : state === 'bad' ? <X size={16} /> : LETTERS[i]}</span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {answered && (
                <div className={`qz-expl ${picked === q.correctIndex ? 'ok' : 'bad'}`}>
                  <b className="qz-expl__h">
                    {picked === q.correctIndex ? '¡Correcto!' : `Incorrecto · la respuesta es ${LETTERS[q.correctIndex]}`}
                  </b>
                  <p>{q.explanation}</p>
                  {q.pearl && <div className="qz-pearl"><Lightbulb size={16} /><span><b>Perla EUNACOM</b>{q.pearl}</span></div>}
                </div>
              )}

              <div className="qz-nav">
                <button className="qz-back" onClick={() => setIdx(idx - 1)} disabled={idx === 0}><ArrowLeft size={16} /> Anterior</button>
                {answered
                  ? <button className="qz-next" onClick={next}>{idx < total - 1 ? 'Siguiente' : 'Ver mi resultado'} <ArrowRight size={16} /></button>
                  : <span className="qz-hint">Elige una alternativa</span>}
              </div>
            </>
          ) : (
            <div className="qz-result">
              <div className="qz-ring" style={{ '--p': pct, '--c': pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444' }}>
                <div><b>{correct}/{total}</b><small>{pct}%</small></div>
              </div>
              <div className="qz-result__txt">
                <span className="qz-kicker light"><Trophy size={14} /> Tu resultado</span>
                <h3>{verdict.t}</h3>
                <p>{verdict.d}</p>
                <div className="qz-review">
                  {questions.map((x, i) => (
                    <button key={i} className={answers[i] === x.correctIndex ? 'ok' : 'bad'} onClick={() => { setDone(false); setIdx(i); }}>
                      {answers[i] === x.correctIndex ? <Check size={14} /> : <X size={14} />} {x.area}
                    </button>
                  ))}
                </div>
                <div className="qz-cta">
                  <a href="#banco" className="qz-next"><Sparkles size={16} /> Ver el banco de preguntas</a>
                  <button className="qz-back" onClick={onOpenMentorship}>Revisar mi resultado con la academia</button>
                  <button className="qz-back" onClick={restart}><RotateCcw size={15} /> Repetir</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

    </section>
  );
}
