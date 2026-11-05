import React from 'react';
import { Check } from 'lucide-react';
import { BANK } from '../data/tienda';

const n = x => x.toLocaleString('es-CL');

// Partner banner: the bank's size and full access to EUNACOMapp, with its logo.
export default function PartnerBanner({ style }) {
  return (
    <div className="pb" style={style}>
      <a className="pb-brand" href="https://www.eunacomapp.cl" target="_blank" rel="noopener noreferrer">
        <img src="/eunacomapp-logo.png" alt="EUNACOMapp.cl" />
        <span><small>En alianza con</small><b>EUNACOMapp.cl</b></span>
      </a>
      <div className="pb-main">
        <div className="pb-big"><b>{n(BANK.total)}</b> preguntas con explicación</div>
        <ul>
          <li><Check size={14} /> {n(BANK.examQuestions)} de {BANK.exams} EUNACOM reales</li>
          <li><Check size={14} /> 1.890 de los Libros Gordos</li>
          <li><Check size={14} /> 21 especialidades, por código del Perfil V3</li>
          <li><Check size={14} /> <b>Acceso total a la plataforma EUNACOMapp</b></li>
        </ul>
      </div>
    </div>
  );
}
