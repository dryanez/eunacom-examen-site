import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ShoppingCart, X, Trash2 } from 'lucide-react';
import { PRODUCTS, PACKS, fmtClp, fmtUsd } from '../data/tienda';
import '../styles/tienda.css';
import { useCoupon } from '../data/useCoupon';

const CartContext = createContext(null);
const STORAGE_KEY = 'aee-cart-v2';

export function CartProvider({ children }) {
  const [skus, setSkus] = useState(() => {
    try { return (JSON.parse(localStorage.getItem(STORAGE_KEY)) || []).filter(s => PRODUCTS[s]); } catch { return []; }
  });
  const [open, setOpen] = useState(false);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(skus)); }, [skus]);

  const covered = useMemo(() => new Set(skus.flatMap(s => PRODUCTS[s].includes)), [skus]);

  // 'in' = this exact product is in the cart; 'pack' = a pack in the cart already contains it.
  const state = sku => skus.includes(sku) ? 'in' : PRODUCTS[sku].includes.every(i => covered.has(i)) ? 'pack' : null;

  const toggle = sku => setSkus(prev => {
    if (prev.includes(sku)) return prev.filter(s => s !== sku);
    if (PRODUCTS[sku].includes.every(i => prev.some(p => PRODUCTS[p].includes.includes(i)))) return prev;
    const inc = new Set(PRODUCTS[sku].includes);
    return [...prev.filter(s => !PRODUCTS[s].includes.every(i => inc.has(i))), sku]; // a pack replaces what it contains
  });

  const value = {
    skus, open, setOpen, state, toggle,
    remove: sku => setSkus(xs => xs.filter(s => s !== sku)),
    total: skus.reduce((n, s) => n + PRODUCTS[s].price, 0),
  };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);

export function CartButton({ sku, label = 'Agregar al carrito', className = 't-btn' }) {
  const cart = useCart();
  const st = cart.state(sku);
  return (
    <button className={`${className} ${st ? 'added' : ''}`} onClick={() => st === 'pack' ? cart.setOpen(true) : cart.toggle(sku)}>
      {st === 'in' ? '✓ En el carrito' : st === 'pack' ? '✓ En tu pack' : label}
    </button>
  );
}

// Bottom bar + side drawer. Checkout hands the order to the enrollment modal (WhatsApp confirmation).
export function CartDrawer({ onCheckout, hideBar = false }) {
  const { coupon, price: withCode } = useCoupon();
  const cart = useCart();
  const count = cart.skus.length;

  // Nudge toward the cheaper pack when the cart is already worth more than it.
  const cheaper = PACKS.slice().reverse().find(p => cart.total > p.price && !cart.skus.includes(p.sku) && cart.skus.every(s => PRODUCTS[s].includes.every(i => p.includes.includes(i))));

  const checkout = () => {
    cart.setOpen(false);
    onCheckout({
      slug: 'carrito',
      nombre: cart.skus.map(s => PRODUCTS[s].name).join(' + '),
      precioClp: fmtClp(cart.total),
      precioUsd: fmtUsd(cart.total),
      precioPromoClp: fmtClp(cart.total / 2),
      precioPromoUsd: fmtUsd(cart.total / 2),
      precioNota: 'Mercado Pago (cuotas), PayPal o transferencia.',
    });
  };

  return (
    <>
      {count > 0 && !cart.open && !hideBar && (
        <div className="tienda-cart">
          {cheaper && (
            <div className="hint">
              Llevas {fmtClp(cart.total)}. {cheaper.name} cuesta {fmtClp(cheaper.price)} y trae todo eso y más.{' '}
              <button onClick={() => cart.toggle(cheaper.sku)}>Cambiar al pack →</button>
            </div>
          )}
          <div className="row">
            <button className="items" onClick={() => cart.setOpen(true)} style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}>
              <ShoppingCart size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />
              {count} {count === 1 ? 'producto' : 'productos'}: {cart.skus.map(s => PRODUCTS[s].name).join(', ')}
            </button>
            <span className="tot">{fmtClp(withCode(cart.total))}</span>
            <button className="pay" onClick={checkout}>Comprar</button>
          </div>
        </div>
      )}

      {cart.open && (
        <div onClick={() => cart.setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(8,54,95,.35)', zIndex: 2000 }}>
          <aside onClick={e => e.stopPropagation()} style={{
            position: 'absolute', right: 0, top: 0, bottom: 0, width: 'min(400px, 100vw)', background: '#fff',
            display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-xl)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid var(--border-light)' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--navy-deep)', fontSize: 18, display: 'flex', gap: 8, alignItems: 'center' }}>
                <ShoppingCart size={20} /> Tu carrito
              </h3>
              <button onClick={() => cart.setOpen(false)} aria-label="Cerrar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-muted)' }}><X size={20} /></button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px' }}>
              {count === 0 && <p style={{ color: 'var(--slate-muted)', padding: '24px 0' }}>Tu carrito está vacío.</p>}
              {cart.skus.map(s => {
                const p = PRODUCTS[s];
                return (
                  <div key={s} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
                    {p.cover && <img src={p.cover} alt="" style={{ width: 44, height: 62, objectFit: 'cover', borderRadius: 2, flex: 'none' }} />}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--slate-dark)' }}>{p.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--slate-muted)' }}>
                        {fmtClp(withCode(p.price))}{p.includes.length > 1 && ` · pack, todo incluido`}
                      </div>
                    </div>
                    <button onClick={() => cart.remove(s)} aria-label="Quitar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-subtle)' }}><Trash2 size={16} /></button>
                  </div>
                );
              })}
            </div>

            {count > 0 && (
              <div style={{ padding: 20, borderTop: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--navy-deep)', fontSize: 18, marginBottom: 4 }}>
                  <span>Total</span><span>{coupon && <s style={{ fontWeight: 600, opacity: .5, marginRight: 6, fontSize: 14 }}>{fmtClp(cart.total)}</s>}{fmtClp(withCode(cart.total))}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--slate-muted)', marginBottom: 14 }}>{coupon ? `Código ${coupon.code} aplicado · ` : ''}Mercado Pago, PayPal o transferencia</div>
                <button className="btn btn-primary" onClick={checkout} style={{ width: '100%' }}>Finalizar compra</button>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
