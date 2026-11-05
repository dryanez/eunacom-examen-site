// After any payment is confirmed (PayPal, Mercado Pago return or webhook, transfer marked paid): email the buyer
// what they bought, with "Activar mi cuenta" (one click, no confirmation step) or "Ir a Mi Biblioteca".
// Never fails the payment: a mail error is only logged.
import { db } from './_lib.js';
import { issueToken } from './_auth.js';
import { purchaseEmail, sendMail } from './_emails.js';

const SITE = () => (process.env.SITE_URL || 'https://eunacom-examen.cl').replace(/\/$/, '');

export const activateLinkToken = email => issueToken(db(), { email }, 'activate');
export async function activateLinkFor(email) {
  return `${SITE()}/?activar=${await activateLinkToken(email)}#activar`;
}

export async function afterPaid(order, email) {
  if (!email) return;
  try {
    const { data: user } = await db().from('aee_users').select('id, email_verified_at').ilike('email', email).maybeSingle();
    const hasAccount = !!user?.email_verified_at;
    const activateLink = hasAccount ? null : await activateLinkFor(email);
    const { subject, html } = purchaseEmail({ order, hasAccount, activateLink });
    await sendMail({ to: email, subject, html, link: activateLink || `${SITE()}/#mi-cuenta` });
  } catch (e) {
    console.error('[purchase email]', email, e.message);
  }
}
