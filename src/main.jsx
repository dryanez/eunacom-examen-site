import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Código de descuento en el link (p. ej. eunacom-examen.cl/?code=SHORTS20 desde la bio de Instagram):
// queda guardado para el checkout aunque la persona navegue por el sitio.
const urlCode = new URLSearchParams(window.location.search).get('code');
if (urlCode) sessionStorage.setItem('aee-code', urlCode.trim().toUpperCase());

// Back from Mercado Pago (?pago=ok|pendiente|error&payment_id=…) or PayPal (?paypal=return|cancel&token=…):
// the thank-you page confirms the payment; a cancelled or failed payment goes back to the store.
const back = new URLSearchParams(window.location.search);
if (back.get('pago') === 'error' || back.get('paypal') === 'cancel') window.location.hash = '#tienda';
else if (back.get('pago') || back.get('paypal') === 'return') window.location.hash = '#gracias';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
