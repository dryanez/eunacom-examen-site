import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Código de descuento en el link (p. ej. eunacom-examen.cl/?code=SHORTS20 desde la bio de Instagram):
// queda guardado para el checkout aunque la persona navegue por el sitio.
const urlCode = new URLSearchParams(window.location.search).get('code');
if (urlCode) sessionStorage.setItem('aee-code', urlCode.trim().toUpperCase());

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
