import React from 'react';
import { Trash2 } from 'lucide-react';
import { useCart } from '../Cart';
import { PRODUCTS, fmtClp } from '../../data/tienda';
import EmbeddedCheckout from '../EmbeddedCheckout';
import { useCoupon } from '../../data/useCoupon';

// Cart checkout on its own page: summary on the left, the same inline checkout as the course page on the right.
export default function CheckoutPage() {
  const { price: withCode } = useCoupon();
  const cart = useCart();
  const items = cart.skus.map(sku => ({ sku, name: PRODUCTS[sku].name, price: PRODUCTS[sku].price, cover: PRODUCTS[sku].cover }));

  return (
    <div className="st ac-page">
      <div className="st-wrap ck-wrap" style={{ paddingTop: 48 }}>
        <div>
          <h1 style={{ font: '800 36px var(--font-heading)', margin: '0 0 16px' }}>Tu compra</h1>
          {items.length === 0 ? (
            <div className="ac-empty"><p>Tu carrito está vacío.</p><a className="st-mini" href="#tienda" style={{ textDecoration: 'none' }}>Ver la tienda →</a></div>
          ) : (
            <div className="lib-banks">
              {items.map(i => (
                <div key={i.sku} className="bank-row">
                  {i.cover && <img src={i.cover} alt="" />}
                  <span><b>{i.name}</b><small>{PRODUCTS[i.sku].includes.length > 1 ? 'Pack, todo incluido' : 'Producto individual'}</small></span>
                  <b style={{ font: '800 15px var(--font-heading)', color: 'var(--ink)' }}>{fmtClp(withCode(i.price))}</b>
                  <button className="ac-link" onClick={() => cart.remove(i.sku)} aria-label="Quitar"><Trash2 size={16} /></button>
                </div>
              ))}
              <a className="ac-link" href="#tienda" style={{ marginTop: 6 }}>← Seguir comprando</a>
            </div>
          )}
        </div>
        {items.length > 0 && <EmbeddedCheckout items={items} />}
      </div>
    </div>
  );
}
