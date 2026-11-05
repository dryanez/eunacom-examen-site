import React from 'react';

// Question bank partner badge: shown wherever the Pack Total or the banco de preguntas appears.
import { BANK } from '../data/tienda';

export default function PoweredBy({ size = 'sm', style, count = false }) {
  const big = size === 'lg';
  return (
    <a
      href="https://www.eunacomapp.cl"
      target="_blank"
      rel="noopener noreferrer"
      onClick={e => e.stopPropagation()}
      className="pw-by"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: big ? 10 : 6,
        padding: big ? '8px 14px' : '3px 9px 3px 4px', borderRadius: 999,
        background: '#eef5ff', border: '1px solid #cfe0fb', color: '#1e3a8a',
        font: `600 ${big ? 13 : 11}px var(--font-heading)`, textDecoration: 'none', lineHeight: 1.2,
        ...style,
      }}
    >
      <img src="/eunacomapp-logo.png" alt="EUNACOMapp.cl" style={{ height: big ? 22 : 15, width: 'auto' }} />
      <span>{count ? <><b>{BANK.total.toLocaleString('es-CL')} preguntas</b> · </> : 'Banco de preguntas '}powered by <b>EUNACOMapp.cl</b> · Partner</span>
    </a>
  );
}
