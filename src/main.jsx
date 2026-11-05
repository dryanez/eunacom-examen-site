import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import RegaloPage from './components/RegaloPage';
import { AccountProvider } from './lib/account';
import { CartProvider } from './components/Cart';
import './index.css';
import REGALOS from './data/regalos.json';

// Links cortos para descripciones de YouTube/TikTok (no se pueden hipervincular): ?yt=<slug> / ?tt=<slug>
// = ?regalo=<slug>&utm_source=youtube|tiktok&utm_medium=shorts (modo público, sin token). Un valor que no es
// un regalo (p. ej. ?yt=clases) abre el sitio normal con la misma UTM. Se reescribe la URL antes de renderizar.
{
  const q = new URLSearchParams(window.location.search);
  const key = q.has('yt') ? 'yt' : q.has('tt') ? 'tt' : null;
  if (key) {
    const val = (q.get(key) || '').trim().toLowerCase();
    q.delete(key);
    q.set('utm_source', key === 'yt' ? 'youtube' : 'tiktok');
    if (!q.has('utm_medium')) q.set('utm_medium', 'shorts');
    if (!q.has('utm_campaign')) q.set('utm_campaign', val || 'link');
    if (val && /^[\w-]+$/.test(val) && REGALOS[val]) q.set('regalo', val);
    window.history.replaceState(null, '', `${window.location.pathname}?${q}${window.location.hash}`);
  }
}

// Código de descuento en el link (p. ej. eunacom-examen.cl/?code=SHORTS20 desde la bio de Instagram):
// queda guardado para el checkout aunque la persona navegue por el sitio.
const urlCode = new URLSearchParams(window.location.search).get('code');
if (urlCode) sessionStorage.setItem('aee-code', urlCode.trim().toUpperCase());

// Back from Mercado Pago (?pago=ok|pendiente|error&payment_id=…) or PayPal (?paypal=return|cancel&token=…):
// the thank-you page confirms the payment; a cancelled or failed payment goes back to the store.
const back = new URLSearchParams(window.location.search);
if (back.get('pago') === 'error' || back.get('paypal') === 'cancel') window.location.hash = '#tienda';
else if (back.get('pago') || back.get('paypal') === 'return') window.location.hash = '#gracias';

// Libro gratis de los reels, página sola (sin menú) con la oferta y el pago: eunacom-examen.cl/?regalo=<slug>
// (también /regalo/<slug> donde el hosting sirva rutas; en Vercel hoy solo responde la raíz)
const regaloSlug = new URLSearchParams(window.location.search).get('regalo') || (window.location.pathname.match(/^\/regalo\/([\w-]+)/) || [])[1];
const regalo = regaloSlug && /^[\w-]+$/.test(regaloSlug) ? [null, regaloSlug] : null;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {regalo
      ? <AccountProvider><CartProvider><RegaloPage slug={regalo[1]} /></CartProvider></AccountProvider>
      : <App />}
  </React.StrictMode>
);
