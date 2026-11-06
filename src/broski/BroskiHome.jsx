/* BROSKI home-page pieces for the existing React app.
   Reads window.BROSKI_CONFIG (load /config.js in index.html before the app bundle).
*/
import React, { useEffect, useState } from 'react';
import BroskiCheckoutGateway from './BroskiCheckoutGateway';
import './broski-checkout.css';

const C = () => window.BROSKI_CONFIG || {};
export const waLink = (text) =>
  `https://wa.me/${C().WHATSAPP_NUMBER}?text=${encodeURIComponent(text || '')}`;

function WaButton({ text, children }) {
  return (
    <a className="bk-h-btn bk-h-btn--wa" href={waLink(text)} target="_blank" rel="noopener">
      {children}
    </a>
  );
}

/* 2. Launch banner: auto-hides after BANNER_HIDE_FROM, closable, remembers close */
export function LaunchBanner() {
  const cfg = C();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!cfg.BANNER_TEXT || Date.now() >= new Date(cfg.BANNER_HIDE_FROM).getTime()) return;
    let closed = false;
    try { closed = localStorage.getItem('broski-banner-closed') === cfg.BANNER_HIDE_FROM; } catch {}
    if (!closed) setOpen(true);
  }, []);
  if (!open) return null;
  return (
    <div className="bk-banner" role="region" aria-label="Launch offer">
      <p>{cfg.BANNER_TEXT}</p>
      <button type="button" className="bk-banner__close" aria-label="Close offer banner"
        onClick={() => { setOpen(false); try { localStorage.setItem('broski-banner-closed', cfg.BANNER_HIDE_FROM); } catch {} }}>
        ×
      </button>
    </div>
  );
}

/* 1. Exactly three product cards with Professional Online Checkout Gateway */
export function ProductCards() {
  const { PRODUCTS = [], UNIT_PRICE_LINE } = C();
  const nv = PRODUCTS.find((p) => p.id === 'non-veg');
  const mx = PRODUCTS.find((p) => p.id === 'mix');
  const [activeGatewayProduct, setActiveGatewayProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('nutrition');

  return (
    <section id="shop" className="bk-shop" aria-labelledby="shop-h">
      <div className="bk-shop-head">
        <div>
          <span className="bk-shop-eyebrow">D2C DIRECT STORE</span>
          <h2 id="shop-h" className="bk-shop__title">Pick your Bro's crunch</h2>
        </div>
        <button
          type="button"
          className="bk-gateway-trigger-btn"
          onClick={() => setActiveGatewayProduct('combo')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          Direct Order Gateway
        </button>
      </div>

      <div className="bk-shop__grid">
        {PRODUCTS.map((p) => (
          <article key={p.id} className={`bk-pcard ${p.id === 'combo' ? 'bk-pcard--combo' : ''}`}>
            <div className="bk-pcard__img">
              {p.img ? (
                <img src={p.img} alt={p.alt} width="600" height="600" loading="lazy" decoding="async" />
              ) : (
                <div className="bk-pcard__duo" aria-hidden="true">
                  {nv && <img src={nv.img} alt="" width="300" height="300" loading="lazy" decoding="async" />}
                  {mx && <img src={mx.img} alt="" width="300" height="300" loading="lazy" decoding="async" />}
                </div>
              )}
              {p.save ? <span className="bk-pcard__save">Save ₹{p.save}</span> : null}
            </div>
            <div className="bk-pcard__body">
              <h3>{p.title}</h3>
              <p className="bk-pcard__note">{p.note} · {p.size}</p>
              <p className="bk-pcard__price">
                <strong>₹{p.price}</strong> <span>MRP incl. of all taxes</span>
              </p>

              <div className="bk-card-cta-group">
                <button
                  type="button"
                  className="bk-h-btn bk-h-btn--order"
                  onClick={() => setActiveGatewayProduct(p.id)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '6px'}}>
                    <path d="M5 7h14l1 14H4L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/>
                  </svg>
                  Order Online (₹{p.price})
                </button>
                <a
                  className="bk-card-wa-link"
                  href={waLink(p.msg)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Or order via WhatsApp →</span>
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
      {UNIT_PRICE_LINE && <p className="bk-shop__unit">{UNIT_PRICE_LINE}</p>}

      {/* Pro Pet Industry Standard: Nutrition, Feeding Guide & Freshness Transparency */}
      <div className="bk-transparency-card">
        <div className="bk-transparency-tabs">
          <button
            type="button"
            className={activeTab === 'nutrition' ? 'active' : ''}
            onClick={() => setActiveTab('nutrition')}
          >
            Guaranteed Nutrition
          </button>
          <button
            type="button"
            className={activeTab === 'feeding' ? 'active' : ''}
            onClick={() => setActiveTab('feeding')}
          >
            Daily Feeding Guide
          </button>
          <button
            type="button"
            className={activeTab === 'freshness' ? 'active' : ''}
            onClick={() => setActiveTab('freshness')}
          >
            Freshness Standards
          </button>
        </div>

        <div className="bk-transparency-content">
          {activeTab === 'nutrition' && (
            <div className="bk-nutrition-grid">
              <div className="bk-nutri-box">
                <span className="bk-nutri-val">≥ 20%</span>
                <span className="bk-nutri-lbl">Crude Protein (Non-Veg)</span>
                <small>≥ 18% in Mix pack</small>
              </div>
              <div className="bk-nutri-box">
                <span className="bk-nutri-val">≥ 8%</span>
                <span className="bk-nutri-lbl">Crude Fat</span>
                <small>Wholesome poultry lipids</small>
              </div>
              <div className="bk-nutri-box">
                <span className="bk-nutri-val">≤ 4%</span>
                <span className="bk-nutri-lbl">Crude Fibre</span>
                <small>Easy digestion profile</small>
              </div>
              <div className="bk-nutri-box">
                <span className="bk-nutri-val">≤ 10%</span>
                <span className="bk-nutri-lbl">Moisture</span>
                <small>Crisp oven baked texture</small>
              </div>
            </div>
          )}

          {activeTab === 'feeding' && (
            <div className="bk-feeding-list">
              <div className="bk-feeding-item">
                <strong>Small Dogs (&lt; 10 kg)</strong>
                <span>Pug, Shih Tzu, Pomeranian, Indie Pups: <strong>2 – 4 biscuits / day</strong></span>
              </div>
              <div className="bk-feeding-item">
                <strong>Medium Dogs (10 – 25 kg)</strong>
                <span>Beagle, Cocker Spaniel, Indie Adult: <strong>4 – 8 biscuits / day</strong></span>
              </div>
              <div className="bk-feeding-item">
                <strong>Large Dogs (&gt; 25 kg)</strong>
                <span>Labrador, Golden Retriever, German Shepherd: <strong>8 – 12 biscuits / day</strong></span>
              </div>
            </div>
          )}

          {activeTab === 'freshness' && (
            <div className="bk-freshness-grid">
              <div className="bk-fresh-item">
                <span className="bk-fresh-icon">🌾</span>
                <strong>Whole Wheat Base</strong>
                <p>Pure cereal flour base with wholesome minerals. No sawdust fillers.</p>
              </div>
              <div className="bk-fresh-item">
                <span className="bk-fresh-icon">🔥</span>
                <strong>Oven-Baked Crisp</strong>
                <p>Double-baked in Shalimar Bagh for that loud, satisfying bone crunch.</p>
              </div>
              <div className="bk-fresh-item">
                <span className="bk-fresh-icon">🔍</span>
                <strong>Clear Window Pouch</strong>
                <p>You see the biscuits before you buy. Nothing hidden inside foil.</p>
              </div>
              <div className="bk-fresh-item">
                <span className="bk-fresh-icon">📍</span>
                <strong>Nangloi Local Dispatch</strong>
                <p>Dispatched direct from West Delhi. No 6-month distributor warehouse dust.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* The D2C Direct Checkout Gateway */}
      {activeGatewayProduct && (
        <BroskiCheckoutGateway
          initialProduct={activeGatewayProduct}
          onClose={() => setActiveGatewayProduct(null)}
        />
      )}
    </section>
  );
}

/* 5. For pet shops */
export function PartnerSection() {
  const { MSG = {} } = C();
  return (
    <section className="bk-partner" aria-labelledby="partner-h">
      <h2 id="partner-h">Become a BROSKI Launch Partner</h2>
      <ul>
        <li>11 + 1 free on your first order (The Bro Counter Box)</li>
        <li>Free sample jar + counter card</li>
        <li>5 free taste packs for your customers</li>
        <li>15-day 100% buyback guarantee if unsold</li>
        <li>Delivery from 15 Nov in West Delhi</li>
      </ul>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
        <WaButton text={MSG.shop}>WhatsApp us for shop rates</WaButton>
        <a className="bk-h-btn" href="/billing/" style={{ background: '#352016', color: '#fff8ed', border: '1px solid #fff8ed' }}>
          Official GST Bill Portal →
        </a>
      </div>
      <p className="bk-partner__small">First 20 shops only · 38.5% effective retailer margin.</p>
    </section>
  );
}

/* 6. Footer (all pages) */
export function SiteFooter() {
  const { EMAIL, MSG = {} } = C();
  return (
    <footer className="bk-h-foot">
      <nav aria-label="Footer">
        <a href="/">Home</a><a href="/offers/">Bro Perks</a><a href="/r/">Feedback</a><a href="/billing/">Billing Portal</a><a href="/privacy/">Privacy</a>
      </nav>
      <p>
        BROSKI · Nangloi, Delhi 110041 · <a href={`mailto:${EMAIL}`}>{EMAIL}</a> ·{' '}
        <a href={waLink(MSG.hello)} target="_blank" rel="noopener">WhatsApp</a> · Udyam: UDYAM-DL-11-0177908 · GST: Composition Scheme (07)
      </p>
    </footer>
  );
}
