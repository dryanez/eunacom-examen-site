// Emails of the site (Amazon SES, same account as the EUNACOM app). Each one is built from the real data of the
// person: their name, exactly what they bought and what it opens, and the button that fits (activate the account
// if they don't have one yet, or go straight to their library).
// Preview them all: GET /api/email-preview (local dev only).
import nodemailer from 'nodemailer';
import { CATALOG } from './_lib.js';

const SITE = () => (process.env.SITE_URL || 'https://eunacom-examen.cl').replace(/\/$/, '');
const FROM = () => process.env.AEE_MAIL_FROM || 'Academia Examen EUNACOM <equipo@eunacomapp.cl>';
const REPLY_TO = 'contacto@eunacomapp.cl';

let transport;
export async function sendMail({ to, subject, html, link }) {
  const { SES_SMTP_USER, SES_SMTP_PASS, SES_SMTP_HOST } = process.env;
  if (!SES_SMTP_USER || !SES_SMTP_PASS) {
    (globalThis.__aeeMails ||= []).push({ to, subject, link }); // scripts/dry-test-purchases.mjs counts these
    if (!process.env.AEE_MAIL_SILENT) console.log(`\n[AEE mail → ${to}] ${subject}\n  ${link || ''}\n`);
    return { logged: true };
  }
  transport ||= nodemailer.createTransport({ host: SES_SMTP_HOST || 'email-smtp.sa-east-1.amazonaws.com', port: 587, secure: false, auth: { user: SES_SMTP_USER, pass: SES_SMTP_PASS } });
  // The header travels inside the email (cid), so it shows even before the site has a public domain.
  const header = new URL('./_email-header.png', import.meta.url); // next to the function so Vercel bundles it
  return transport.sendMail({ from: FROM(), to, replyTo: REPLY_TO, subject, html, attachments: [{ filename: 'aee.png', path: header.pathname, cid: 'aee-header' }] });
}

// ── What a SKU opens, in words ───────────────────────────────────────────────
const AULA_CLASSES = { cardiologia: 38, gastroenterologia: 26, neumologia: 25, nefrologia: 22, diabetes: 25, endocrinologia: 25, hematologia: 24, infectologia: 25, reumatologia: 24, neurologia: 26, cirugia: 21, traumatologia: 15, urologia: 16, otorrino: 20, oftalmologia: 18, dermatologia: 18, psiquiatria: 20, pediatria: 28, obstetricia: 21, ginecologia: 16, saludpublica: 15 };
export function opens(sku) {
  const items = CATALOG.products[sku]?.includes || [sku];
  const classes = items.filter(i => i.startsWith('clases-')).map(i => i.slice(7));
  const books = items.filter(i => /^(tomo|gordo|repaso|atlas|perfil|anki|gran)-/.test(i)).length;
  const recons = items.filter(i => i.startsWith('rec-')).length;
  const banks = items.filter(i => i.startsWith('banco-')).length;
  const out = [];
  if (classes.length) {
    const n = classes.reduce((s, k) => s + (AULA_CLASSES[k] || 0), 0);
    out.push(classes.length === 1 ? `${n} clases en video en el Aula` : `${n} clases en video de ${classes.length} especialidades`);
  }
  if (books) out.push(books === 1 ? '1 libro en Mi Biblioteca' : `${books} libros en Mi Biblioteca`);
  if (recons) out.push(recons === 1 ? '1 EUNACOM real reconstruido' : `${recons} EUNACOM reales reconstruidos`);
  if (banks) out.push(banks === 1 ? 'su banco de preguntas' : `${banks} bancos de preguntas`);
  if (sku.startsWith('curso-')) out.push('tutorías del curso (te escribimos por WhatsApp)');
  return out.join(' · ');
}

const clp = n => `$${Math.round(n).toLocaleString('es-CL')}`;
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const first = name => esc(String(name || '').trim().split(/\s+/)[0] || '');

// Shared frame: logo, white card, footer. Inline styles only (email clients).
function frame({ preheader, body }) {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Academia Examen EUNACOM</title></head>
<body style="margin:0;padding:0;background:#eef4fb;font-family:Arial,Helvetica,sans-serif;color:#0f2742">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</span>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef4fb"><tr><td align="center" style="padding:28px 12px">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px">
    <tr><td style="background:#ffffff;border-radius:10px 10px 0 0;border-bottom:4px solid #0bd9e7;padding:26px 28px 22px">
      <img src="cid:aee-header" alt="AEE · Academia Examen EUNACOM" width="420" style="display:block;width:420px;max-width:100%;height:auto;border:0">
    </td></tr>
    <tr><td style="background:#ffffff;padding:28px 28px 30px;border-radius:0 0 10px 10px">${body}</td></tr>
    <tr><td style="padding:18px 8px;text-align:center;font-size:12px;line-height:18px;color:#64748b">
      Academia Examen EUNACOM · Santiago, Chile<br>
      ¿Dudas? Responde este correo o escríbenos a <a href="mailto:${REPLY_TO}" style="color:#08365f">${REPLY_TO}</a>
    </td></tr>
  </table>
</td></tr></table></body></html>`;
}
const button = (href, label) => `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:22px 0 8px"><tr><td style="background:#08365f;border-radius:6px">
  <a href="${href}" style="display:inline-block;padding:14px 26px;color:#ffffff;font-weight:bold;font-size:16px;text-decoration:none">${label}</a></td></tr></table>`;
const h1 = t => `<h1 style="margin:0 0 10px;font-size:24px;line-height:30px;color:#08365f">${t}</h1>`;
const p = t => `<p style="margin:0 0 14px;font-size:15px;line-height:23px;color:#334155">${t}</p>`;
const small = t => `<p style="margin:14px 0 0;font-size:13px;line-height:19px;color:#64748b">${t}</p>`;

// ── 1. Purchase confirmed (every payment method) ─────────────────────────────
// order: { skus, amount_clp, buyer_name, provider }; account: true if this email already has an account;
// activateLink: one-click account creation (the link proves they own the inbox).
export function purchaseEmail({ order, hasAccount, activateLink }) {
  const rows = order.skus.map(sku => {
    const pr = CATALOG.products[sku] || { name: sku };
    return `<tr><td style="padding:12px 0;border-bottom:1px solid #e2e8f0">
      <div style="font-weight:bold;font-size:15px;color:#0f2742">${esc(pr.name)}</div>
      <div style="font-size:13px;color:#0e7490;margin-top:3px">Incluye: ${esc(opens(sku))}</div></td></tr>`;
  }).join('');
  const how = { paypal: 'PayPal', mercadopago: 'Mercado Pago', transfer: 'transferencia', webpay: 'Webpay' }[order.provider] || 'tu medio de pago';
  const name = first(order.buyer_name);
  const subject = `¡Gracias por tu compra${name ? `, ${name}` : ''}! Tu acceso está listo`;
  const body = `
    ${h1(`¡Gracias por tu compra${name ? `, ${name}` : ''}!`)}
    ${p(`Recibimos tu pago por ${how}. Esto es lo que compraste:`)}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:4px 0 6px">${rows}
      <tr><td style="padding:12px 0;text-align:right;font-size:15px;color:#0f2742">Total pagado: <b>${clp(order.amount_clp)}</b></td></tr></table>
    ${hasAccount
      ? `${p('Ya está todo en tu cuenta. Entra y empieza ahora:')}${button(`${SITE()}/#mi-cuenta`, 'Ir a Mi Biblioteca')}`
      : `${p(`<b>Último paso:</b> activa tu cuenta con este correo para ver tus clases y libros. Toma 20 segundos: eliges una contraseña${process.env.GOOGLE_CLIENT_ID ? ' o entras con Google' : ''}.`)}
         ${button(activateLink, 'Activar mi cuenta')}
         ${small('El botón vale por 7 días. Si vence, crea tu cuenta en el sitio con este mismo correo y tu compra aparece sola.')}`}
    ${small('Guarda este correo como comprobante.')}`;
  return { subject, html: frame({ preheader: `Tu compra: ${order.skus.map(s => CATALOG.products[s]?.name).join(', ')}`, body }) };
}

// ── 2. Confirm email (sign-up with password) ─────────────────────────────────
export function verifyEmail({ name, link }) {
  const n = first(name);
  return {
    subject: 'Confirma tu cuenta · Academia Examen EUNACOM',
    html: frame({ preheader: 'Un clic y tu cuenta queda lista.', body: `
      ${h1(`Confirma tu correo${n ? `, ${n}` : ''}`)}
      ${p('Un clic y tu cuenta queda lista. Ahí verás tus clases, libros y banco de preguntas, y todo lo que compres con este correo.')}
      ${button(link, 'Confirmar mi cuenta')}
      ${small('El link vale por 3 días. Si no creaste una cuenta, ignora este correo.')}` }),
  };
}

// ── 3. New password ──────────────────────────────────────────────────────────
export function resetEmail({ name, link }) {
  const n = first(name);
  return {
    subject: 'Crea una contraseña nueva · Academia Examen EUNACOM',
    html: frame({ preheader: 'El link vale por 2 horas.', body: `
      ${h1(`Contraseña nueva${n ? ` para ${n}` : ''}`)}
      ${p('Pediste cambiar la contraseña de tu cuenta. Haz clic para crear una nueva:')}
      ${button(link, 'Crear contraseña nueva')}
      ${small('El link vale por 2 horas. Si no lo pediste, ignora este correo: tu contraseña sigue igual.')}` }),
  };
}
