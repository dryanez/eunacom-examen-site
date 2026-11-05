// Códigos de descuento del sitio AEE (servidor y cliente importan este archivo). Aplican a cualquier curso o pack.
// El servidor (api/checkout.js) recalcula el precio con el código: el navegador solo lo muestra.
// only: el código vale solo si TODO lo que se compra empieza con ese prefijo (si no, no aplica).
export const COUPONS = {
  SHORTS20: { percent: 20, label: 'Código de redes SHORTS20' },
  // Precio de regalo del libro gratis de Instagram (/?regalo=…): el Manual de $19.990 queda en $9.990
  REGALO: { percent: 50, label: 'Precio de regalo', only: 'tomo-', floor10: true },
};
export function resolveCoupon(code) {
  const key = String(code || '').trim().toUpperCase();
  return COUPONS[key] ? { code: key, ...COUPONS[key] } : null;
}
// ¿El código aplica a estos SKU? (sin lista de SKU, el cliente solo muestra el precio de lo que tiene en pantalla)
export const couponFits = (c, skus) => !!c && (!c.only || !skus || (skus.length > 0 && skus.every(s => String(s).startsWith(c.only))));
export const applyCoupon = (clp, code, skus) => {
  const c = resolveCoupon(code);
  if (!couponFits(c, skus)) return clp;
  const v = clp * (1 - c.percent / 100);
  return c.floor10 ? Math.floor(v / 10) * 10 : Math.round(v); // floor10: $19.990 → $9.990
};
