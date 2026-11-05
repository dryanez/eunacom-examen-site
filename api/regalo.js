// /api/regalo — libro gratis de los reels «Comenta PALABRA» (página /regalo/<slug> de este sitio).
// Puente al sistema de regalos de eunacomapp.cl (api/_regalos.js de ese repo), que ya tiene todo lo necesario:
// token del DM de ManyChat (REGALO_SECRET), leads en Turso (regalo_leads: nombre, correo, UTM), PDF desde el bucket
// PRIVADO de R2 con link firmado de 1 hora y correo con el link. Así no hay un segundo secreto ni otra base de leads.
//   GET  ?action=check&slug=&t=&u=   → { ok }      ¿el link del DM es válido?
//   GET  ?action=link&slug=&k=       → { url }     volver a descargar (token del navegador o del correo)
//   POST { slug, t, u, nombre, email, utm } → { url, token, emailed }
// REGALO_API cambia el destino (en local: el dev server de eunacom-app-v2, p. ej. http://localhost:5196).
import { bad, readBody } from './_lib.js';

const API = () => `${(process.env.REGALO_API || 'https://www.eunacomapp.cl').replace(/\/$/, '')}/api/user-profiles`;
const ACTIONS = { check: 'regalo_check', link: 'regalo_link' };

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const q = req.query || {};
      const action = ACTIONS[q.action];
      if (!action) return bad(res, 400, 'Acción no válida');
      const params = new URLSearchParams({ action });
      for (const k of ['slug', 't', 'u', 'k']) if (q[k]) params.set(k, String(q[k]).slice(0, 120));
      const r = await fetch(`${API()}?${params}`);
      return res.status(r.status).json(await r.json().catch(() => ({})));
    }
    if (req.method !== 'POST') return bad(res, 405, 'Method not allowed');
    const b = await readBody(req);
    const body = {
      slug: String(b.slug || '').slice(0, 80), t: b.t, u: b.u,
      nombre: String(b.nombre || '').slice(0, 80), email: String(b.email || '').slice(0, 160),
      utm: { source: b.utm?.source || 'instagram', medium: b.utm?.medium || 'dm', campaign: b.utm?.campaign || b.slug },
    };
    const r = await fetch(`${API()}?action=regalo_lead`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    // el correo con el link lo manda eunacomapp; el link de «volver a descargar» apunta a este sitio
    return res.status(r.status).json(j);
  } catch (e) {
    console.error('regalo', e);
    return bad(res, 502, 'No pudimos preparar tu descarga. Intenta de nuevo en un minuto.');
  }
}
