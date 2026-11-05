import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import RegaloPage from './components/RegaloPage';
import { AccountProvider } from './lib/account';
import { CartProvider } from './components/Cart';
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

// eunacom-examen.cl/regalo/<slug>: libro gratis de los reels, página sola (sin menú) con la oferta y el pago
const regalo = window.location.pathname.match(/^\/regalo\/([\w-]+)/);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {regalo
      ? <AccountProvider><CartProvider><RegaloPage slug={regalo[1]} /></CartProvider></AccountProvider>
      : <App />}
  </React.StrictMode>
);
