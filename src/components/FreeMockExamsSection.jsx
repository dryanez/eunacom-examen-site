import React, { useState } from 'react';
import { DIAGNOSTIC_QUESTIONS } from '../data/mockExamsData';
import { Award, CheckCircle2, XCircle, ArrowRight, RotateCcw, Stethoscope, Sparkles, BookOpen, AlertCircle, PhoneCall } from 'lucide-react';

export default function FreeMockExamsSection({ onOpenMentorship, onSelectCourse }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = DIAGNOSTIC_QUESTIONS[currentIdx];
  const isAnswered = selectedAnswers[currentIdx] !== undefined;

  const handleSelectOption = (optIdx) => {
    if (showExplanation) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [currentIdx]: optIdx
    });
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentIdx < DIAGNOSTIC_QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setShowExplanation(selectedAnswers[currentIdx + 1] !== undefined);
    } else {
      setIsFinished(true);
    }
  };

  const handlePrevious = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      setShowExplanation(selectedAnswers[currentIdx - 1] !== undefined);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedAnswers({});
    setShowExplanation(false);
    setIsFinished(false);
  };

  // Calculate score
  const correctCount = DIAGNOSTIC_QUESTIONS.reduce((acc, q, idx) => {
    return selectedAnswers[idx] === q.correctIndex ? acc + 1 : acc;
  }, 0);
  const scorePercent = Math.round((correctCount / DIAGNOSTIC_QUESTIONS.length) * 100);

  return (
    <section id="diagnostico" style={{ padding: '80px 0', backgroundColor: '#ffffff' }}>
      <div className="container">

        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 40px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#eef5fb',
            color: '#08365f',
            padding: '6px 16px',
            borderRadius: '3px',
            fontSize: '0.85rem',
            fontWeight: '700',
            marginBottom: '14px',
            border: '1px solid rgba(11, 94, 168, 0.2)'
          }}>
            <Stethoscope size={16} color="#0b5ea8" />
            <span>SIMULADOR DIAGNÓSTICO GRATUITO</span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.9rem, 3.2vw, 2.7rem)',
            fontWeight: '800',
            color: '#08365f',
            lineHeight: '1.2',
            marginBottom: '16px'
          }}>
            Evalúa tu Nivel Actual para el <span style={{ color: '#0b5ea8' }}>EUNACOM-ST</span>
          </h2>

          <p style={{
            fontSize: '1.05rem',
            color: '#41556b',
            lineHeight: '1.6'
          }}>
            Responde estas 5 preguntas clínicas de alta frecuencia del perfil ASOFAMECH. Conoce de inmediato la justificación oficial, el análisis de distractores y tu diagnóstico de rendimiento.
          </p>
        </div>

        {/* Diagnostic Card Container */}
        <div style={{
          maxWidth: '820px',
          margin: '0 auto',
          backgroundColor: '#f6fafd',
          border: '1.5px solid #dae8f4',
          borderRadius: '5px',
          padding: '36px',
          boxShadow: '0 12px 30px rgba(8, 54, 95, 0.06)'
        }}>

          {!isFinished ? (
            <div>
              {/* Progress and Area Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
                borderBottom: '1px solid #dae8f4',
                paddingBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    backgroundColor: '#08365f',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    padding: '4px 12px',
                    borderRadius: '3px'
                  }}>
                    Pregunta {currentIdx + 1} de {DIAGNOSTIC_QUESTIONS.length}
                  </span>
                  <span style={{
                    backgroundColor: '#eef5fb',
                    color: '#0b5ea8',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    padding: '4px 12px',
                    borderRadius: '3px'
                  }}>
                    Área: {currentQ.area}
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#5f6b76', fontWeight: '600' }}>
                  Aciertos: {correctCount} / {Object.keys(selectedAnswers).length}
                </div>
              </div>

              {/* Question Text */}
              <p style={{
                fontSize: '1.15rem',
                fontWeight: '600',
                color: '#08365f',
                lineHeight: '1.6',
                marginBottom: '24px'
              }}>
                {currentQ.question}
              </p>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                {currentQ.options.map((option, optIdx) => {
                  const isSelected = selectedAnswers[currentIdx] === optIdx;
                  const isCorrect = currentQ.correctIndex === optIdx;

                  let optBg = '#ffffff';
                  let optBorder = '1px solid #cfdeeb';
                  let optColor = '#2f3e4d';

                  if (showExplanation) {
                    if (isCorrect) {
                      optBg = '#f1f8f4';
                      optBorder = '2px solid #1f7a4d';
                      optColor = '#1f7a4d';
                    } else if (isSelected && !isCorrect) {
                      optBg = '#fbf4f3';
                      optBorder = '2px solid #b3352c';
                      optColor = '#8f2a23';
                    }
                  } else if (isSelected) {
                    optBg = '#eef5fb';
                    optBorder = '2px solid #0b5ea8';
                    optColor = '#08365f';
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      disabled={showExplanation}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 18px',
                        borderRadius: '4px',
                        backgroundColor: optBg,
                        border: optBorder,
                        color: optColor,
                        textAlign: 'left',
                        cursor: showExplanation ? 'default' : 'pointer',
                        transition: 'all 0.2s',
                        fontSize: '0.98rem',
                        fontWeight: isSelected || (showExplanation && isCorrect) ? '600' : '400'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          backgroundColor: isSelected || (showExplanation && isCorrect) ? (isCorrect ? '#1f7a4d' : (isSelected ? '#b3352c' : '#08365f')) : '#dae8f4',
                          color: isSelected || (showExplanation && isCorrect) ? '#ffffff' : '#41556b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          flexShrink: 0
                        }}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{option}</span>
                      </div>

                      {showExplanation && (
                        <div>
                          {isCorrect && <CheckCircle2 size={20} color="#1f7a4d" />}
                          {isSelected && !isCorrect && <XCircle size={20} color="#b3352c" />}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Clinical Pearl Box */}
              {showExplanation && (
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #0b5ea8',
                  borderRadius: '4px',
                  padding: '20px',
                  marginBottom: '28px',
                  animation: 'fadeIn 0.3s ease'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: '800',
                    fontSize: '1rem',
                    color: selectedAnswers[currentIdx] === currentQ.correctIndex ? '#1f7a4d' : '#8f2a23',
                    marginBottom: '10px'
                  }}>
                    {selectedAnswers[currentIdx] === currentQ.correctIndex ? (
                      <>
                        <CheckCircle2 size={20} />
                        <span>¡Respuesta Correcta!</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle size={20} />
                        <span>Respuesta Incorrecta (Opción Correcta: {String.fromCharCode(65 + currentQ.correctIndex)})</span>
                      </>
                    )}
                  </div>

                  <p style={{ fontSize: '0.92rem', color: '#41556b', lineHeight: '1.6', marginBottom: '12px' }}>
                    <strong>Justificación Clínica:</strong> {currentQ.explanation}
                  </p>

                  <div style={{
                    backgroundColor: '#eef5fb',
                    borderLeft: '4px solid #0b5ea8',
                    padding: '10px 14px',
                    borderRadius: '0 8px 8px 0',
                    fontSize: '0.88rem',
                    color: '#08365f'
                  }}>
                    <strong>Perla EUNACOM:</strong> {currentQ.clinicalPearl}
                  </div>
                </div>
              )}

              {/* Quiz Navigation */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={handlePrevious}
                  disabled={currentIdx === 0}
                  className="btn btn-secondary"
                  style={{
                    padding: '10px 18px',
                    fontSize: '0.88rem',
                    opacity: currentIdx === 0 ? 0.4 : 1,
                    cursor: currentIdx === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Anterior
                </button>

                {showExplanation ? (
                  <button
                    onClick={handleNext}
                    className="btn btn-primary"
                    style={{ padding: '10px 24px', fontSize: '0.92rem' }}
                  >
                    <span>{currentIdx < DIAGNOSTIC_QUESTIONS.length - 1 ? 'Siguiente Pregunta' : 'Ver Diagnóstico Final'}</span>
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <span style={{ fontSize: '0.85rem', color: '#5f6b76', fontStyle: 'italic' }}>
                    Selecciona una alternativa para ver la justificación clínica.
                  </span>
                )}
              </div>
            </div>
          ) : (
            /* Results Screen */
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{
                width: '76px',
                height: '76px',
                borderRadius: '50%',
                backgroundColor: scorePercent >= 60 ? '#e6f2ea' : '#f6e7e5',
                color: scorePercent >= 60 ? '#1f7a4d' : '#8f2a23',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '2rem',
                fontWeight: '800'
              }}>
                <Award size={40} />
              </div>

              <h3 style={{ fontSize: '1.7rem', fontWeight: '800', color: '#08365f', marginBottom: '8px' }}>
                Diagnóstico de Rendimiento EUNACOM
              </h3>

              <div style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                color: scorePercent >= 60 ? '#1f7a4d' : '#0b5ea8',
                marginBottom: '8px'
              }}>
                {correctCount} / {DIAGNOSTIC_QUESTIONS.length} ({scorePercent}%)
              </div>

              <p style={{
                fontSize: '1rem',
                color: '#41556b',
                maxWidth: '560px',
                margin: '0 auto 24px',
                lineHeight: '1.6'
              }}>
                {scorePercent >= 80 ? (
                  '¡Excelente dominio! Tienes una base sólida en el perfil ASOFAMECH. Para asegurar tu percentil en la postulación a becas de especialidad, te recomendamos afinar el entrenamiento en distractores complejos.'
                ) : scorePercent >= 60 ? (
                  'Aprobado en el límite. Cumples con el umbral mínimo (51%), pero el EUNACOM real castiga vacíos en áreas como Salud Pública GES y algoritmos terapéuticos específicos de Chile.'
                ) : (
                  'Rendimiento bajo el corte. Necesitas una metodología estructurada que cubra las 86 clases del temario oficial y un banco de preguntas comentado para consolidar la toma de decisiones clínicas.'
                )}
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'center' }}>
                <button
                  onClick={onOpenMentorship}
                  className="btn btn-whatsapp"
                  style={{ padding: '12px 24px', fontSize: '0.95rem' }}
                >
                  <PhoneCall size={18} />
                  <span>Revisar mi Resultado con la Academia Examen EUNACOM</span>
                </button>

                <a
                  href="#cursos"
                  className="btn btn-primary"
                  style={{ padding: '12px 24px', fontSize: '0.95rem' }}
                >
                  <span>Ver Planes de Preparación 2026 - 2027</span>
                  <ArrowRight size={18} />
                </a>

                <button
                  onClick={handleRestart}
                  className="btn btn-secondary"
                  style={{ padding: '12px 18px', fontSize: '0.9rem' }}
                >
                  <RotateCcw size={16} />
                  <span>Repetir Simulador</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
