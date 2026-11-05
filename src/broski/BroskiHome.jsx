/* BROSKI home-page pieces for the existing React app.
   Reads window.BROSKI_CONFIG (load /config.js in index.html before the app bundle).
   Usage in App.jsx:
     import { LaunchBanner, ProductCards, PartnerSection, SiteFooter } from './broski/BroskiHome';
     import './broski/broski-home.css';
     <LaunchBanner />            // very top, above the header
     <ProductCards />            // replaces the old shop grid and order flow
     <PartnerSection />          // just before the footer
     <SiteFooter />              // replaces the old footer
*/
import { useEffect, useState } from 'react';

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

/* 1. Exactly three product cards, WhatsApp ordering only */
export function ProductCards() {
  const { PRODUCTS = [], UNIT_PRICE_LINE } = C();
  const nv = PRODUCTS.find((p) => p.id === 'non-veg');
  const mx = PRODUCTS.find((p) => p.id === 'mix');
  return (
    <section id="shop" className="bk-shop" aria-labelledby="shop-h">
      <h2 id="shop-h" className="bk-shop__title">Pick your Bro's crunch</h2>
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
              <WaButton text={p.msg}>{p.button}</WaButton>
            </div>
          </article>
        ))}
      </div>
      {UNIT_PRICE_LINE && <p className="bk-shop__unit">{UNIT_PRICE_LINE}</p>}
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
        <li>11 + 1 free on your first order</li>
        <li>Free sample jar + counter card</li>
        <li>5 free taste packs for your customers</li>
        <li>Delivery from 15 Nov in West Delhi</li>
      </ul>
      <WaButton text={MSG.shop}>WhatsApp us for shop rates</WaButton>
      <p className="bk-partner__small">First 20 shops only.</p>
    </section>
  );
}

/* 6. Footer (all pages) */
export function SiteFooter() {
  const { EMAIL, MSG = {} } = C();
  return (
    <footer className="bk-h-foot">
      <nav aria-label="Footer">
        <a href="/">Home</a><a href="/offers/">Bro Perks</a><a href="/r/">Feedback</a><a href="/privacy/">Privacy</a>
      </nav>
      <p>
        BROSKI · Nangloi, Delhi 110041 · <a href={`mailto:${EMAIL}`}>{EMAIL}</a> ·{' '}
        <a href={waLink(MSG.hello)} target="_blank" rel="noopener">WhatsApp</a> · Udyam: UDYAM-DL-11-0177908 · GSTIN: (coming soon)
      </p>
    </footer>
  );
}
