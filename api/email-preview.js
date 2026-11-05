// Local dev only: see every email the site sends, filled with sample data.
//   /api/email-preview            → index        /api/email-preview?e=<name> → that email
import { purchaseEmail, verifyEmail, resetEmail } from './_emails.js';

const SITE = () => (process.env.SITE_URL || 'https://eunacom-examen.cl').replace(/\/$/, '');
const SAMPLES = {
  'compra-cardiologia-sin-cuenta': () => purchaseEmail({ order: { skus: ['clases-cardiologia'], amount_clp: 24990, buyer_name: 'Camila Rojas', provider: 'mercadopago' }, hasAccount: false, activateLink: `${SITE()}/?activar=EJEMPLO#activar` }),
  'compra-varios-sin-cuenta': () => purchaseEmail({ order: { skus: ['esp-pediatria', 'tomo-cardiologia', 'banco-completo'], amount_clp: 189970, buyer_name: 'Diego Fuentes', provider: 'paypal' }, hasAccount: false, activateLink: `${SITE()}/?activar=EJEMPLO#activar` }),
  'compra-pack-total-con-cuenta': () => purchaseEmail({ order: { skus: ['pack-total'], amount_clp: 299990, buyer_name: 'Valentina Muñoz', provider: 'transfer' }, hasAccount: true }),
  'compra-curso': () => purchaseEmail({ order: { skus: ['curso-online-intensivo'], amount_clp: 359000, buyer_name: 'Matías Soto', provider: 'webpay' }, hasAccount: false, activateLink: `${SITE()}/?activar=EJEMPLO#activar` }),
  'confirmar-cuenta': () => verifyEmail({ name: 'Camila Rojas', link: `${SITE()}/?verify=EJEMPLO` }),
  'contrasena-nueva': () => resetEmail({ name: 'Camila Rojas', link: `${SITE()}/?reset=EJEMPLO#entrar` }),
};

export default function handler(req, res) {
  if (process.env.AEE_DEV_DB !== '1') { res.statusCode = 404; return res.end(); }
  const e = req.query?.e;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  if (SAMPLES[e]) return res.end(SAMPLES[e]().html.replace('cid:aee-header', '/email/header.png'));
  res.end(`<!doctype html><meta charset="utf-8"><title>Correos AEE</title><body style="font-family:Arial;padding:24px">
    <h2>Correos de Academia Examen EUNACOM</h2><ul style="line-height:2">${Object.keys(SAMPLES).map(k => `<li><a href="?e=${k}">${k}</a> — <i>${SAMPLES[k]().subject}</i></li>`).join('')}</ul></body>`);
}
