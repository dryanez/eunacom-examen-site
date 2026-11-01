import React, { useState } from 'react';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { PACKS, SPECIALTIES, PRODUCTS, fmtClp, looseValue } from '../data/tienda';
import { useCart } from './Cart';
import '../styles/store.css';

// Landing teaser for the Tienda: the books' real covers and the three big packs, then a link to #tienda.
export default function ManualesShowcaseSection() {
  const cart = useCart();
  const [sku, setSku] = useState(PACKS[0].sku);
  const cardio = SPECIALTIES[0];
  const covers = [cardio.cover, '/covers/q_repaso.jpg', '/covers/q_atlas.jpg', '/covers/q_gordo.jpg', '/covers/q_recons.jpg', '/covers/q_perfil.jpg'];
  const st = cart.state(sku);
  const price = PRODUCTS[sku].price;
  const goTienda = () => { window.location.hash = '#tienda'; window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <section id="manuales" className="st" style={{ padding: '70px 0', borderTop: '1px solid #e2e8f0' }}>
      <div className="st-wrap">
        <div className="st-product" style={{ padding: 0 }}>
          <div className="st-gallery" style={{ position: 'static' }}>
            <div className="st-stage">
              <div className="st-slide on">
                <div className="st-grid6">{covers.map(c => <img key={c} className="st-book" src={c} alt="" loading="lazy" />)}</div>
                <span className="cap">Cada material es un libro distinto</span>
              </div>
            </div>
          </div>

          <div className="st-info">
            <div className="st-kicker">Tienda AEE · 21 especialidades</div>
            <h1>Los 21 Manuales, y todo lo demás</h1>
            <p className="st-lead">Manuales, 468 clases en video, Repaso Final, atlas de imágenes, mazos Anki, 1.890 preguntas tipo examen y 16 EUNACOM reconstruidos. Por separado o todo junto.</p>

            <div className="st-label">Llévate todo junto</div>
            <div className="st-variants">
              {PACKS.map(p => {
                const w = looseValue(p.sku);
                return (
                  <button key={p.sku} className={`st-var ${p.sku === sku ? 'on' : ''}`} onClick={() => setSku(p.sku)}>
                    {(p.star || p.best) && <span className={`tag ${p.best ? 'green' : ''}`}>{p.star ? 'Todo incluido' : 'Solo libros'} · -{Math.round((1 - p.price / w) * 100)}%</span>}
                    <span className="th"><img src={p.covers[0]} alt="" /></span>
                    <span>
                      <div className="nm">{p.name}</div>
                      <div className="ds">{p.features.slice(0, 3).join(' · ')}</div>
                    </span>
                    <span className="pr"><b>{fmtClp(p.price)}</b><s>{fmtClp(w)}</s></span>
                  </button>
                );
              })}
            </div>

            <button className={`st-add ${st ? 'added' : ''}`} style={{ marginTop: 18 }} onClick={() => st ? cart.setOpen(true) : cart.toggle(sku)}>
              <ShoppingCart size={18} /> {st ? 'En tu carrito · Ver carrito' : `Agregar al carrito · ${fmtClp(price)}`}
            </button>
            <button className="st-mini" onClick={goTienda} style={{ width: '100%', marginTop: 10, padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              Ver cada especialidad por separado en la tienda <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
