// Códigos de descuento del sitio AEE (servidor y cliente importan este archivo). Aplican a cualquier curso o pack.
// El servidor (api/checkout.js) recalcula el precio con el código: el navegador solo lo muestra.
export const COUPONS = {
  SHORTS20: { percent: 20, label: 'Código de redes SHORTS20' },
};
export function resolveCoupon(code) {
  const key = String(code || '').trim().toUpperCase();
  return COUPONS[key] ? { code: key, ...COUPONS[key] } : null;
}
export const applyCoupon = (clp, code) => {
  const c = resolveCoupon(code);
  return c ? Math.round(clp * (1 - c.percent / 100)) : clp;
};
