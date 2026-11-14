/* BROSKI home-page pieces for the existing React app.
   Reads window.BROSKI_CONFIG (load /config.js in index.html before the app bundle).
*/
import React, { useEffect, useState } from 'react';
import BroskiCheckoutGateway from './BroskiCheckoutGateway';
import { checkPincode, LOCAL_PINS } from '../helpers';
import './broski-checkout.css';

const C = () => window.BROSKI_CONFIG || {};

export const waLink = (text) => {
  let fullText = text || '';
  try {
    if (typeof window !== 'undefined' && window.BroskiAnalytics) {
      const utm = window.BroskiAnalytics.getUtmTags();
      if (utm && utm.utm_source) {
        fullText += ` [Ref: ${utm.utm_source}${utm.utm_campaign ? ' / ' + utm.utm_campaign : ''}]`;
      }
      window.BroskiAnalytics.trackEvent('click_whatsapp_order', {
        order_intent: text,
        source: (utm && utm.utm_source) || 'direct'
      });
    }
  } catch (e) {}
  const phone = (C().WHATSAPP_NUMBER || '').toString().replace(/\D/g, '');
  return phone ? `https://wa.me/${phone}?text=${encodeURIComponent(fullText)}` : '#';
};

function WaButton({ text, children }) {
  const link = waLink(text);
  if (link === '#') return null;
  return (
    <a className="bk-h-btn bk-h-btn--wa" href={link} target="_blank" rel="noopener noreferrer">
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
      <button
        type="button"
        className="bk-banner__close"
        aria-label="Close offer banner"
        onClick={() => {
          setOpen(false);
          try { localStorage.setItem('broski-banner-closed', cfg.BANNER_HIDE_FROM); } catch {}
        }}
      >
        ×
      </button>
    </div>
  );
}

/* Pincode Checker Component (Task 4) */
export function PincodeChecker() {
  const [pin, setPin] = useState('');
  const [result, setResult] = useState(null);
  const onSubmit = (e) => {
    e.preventDefault();
    const r = checkPincode(pin, C().DELIVERY_PINCODES || LOCAL_PINS);
    setResult(r);
    try { window.BroskiAnalytics?.trackEvent('pincode_check', { result: r.kind }); } catch {}
  };
  return (
    <form className="bk-pin" onSubmit={onSubmit} aria-labelledby="pin-h" noValidate>
      <h3 id="pin-h" className="bk-pin__title">Check Delivery in Your Area</h3>
      <div className="bk-pin__row">
        <label htmlFor="bk-pin-input" className="bk-sr-only">6-digit pincode</label>
        <input
          id="bk-pin-input"
          className="bk-pin__input"
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={6}
          placeholder="Enter pincode"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, '').slice(0, 6));
            setResult(null);
          }}
        />
        <button type="submit" className="bk-h-btn bk-pin__btn">Check</button>
      </div>
      <p className={`bk-pin__msg ${result ? `bk-pin__msg--${result.kind} is-shown` : ''}`} role="status" aria-live="polite">
        {result ? result.text : ''}
      </p>
    </form>
  );
}

/* 1. Product cards with Online Checkout Gateway */
export function ProductCards() {
  const { PRODUCTS = [], UNIT_PRICE_LINE } = C();
  const nv = PRODUCTS.find((p) => p.id === 'non-veg');
  const mx = PRODUCTS.find((p) => p.id === 'mix');
  const [activeGatewayProduct, setActiveGatewayProduct] = useState(null);

  return (
    <section id="shop" className="bk-shop" aria-labelledby="shop-h">
      <div className="bk-shop-head">
        <div>
          <span className="bk-shop-eyebrow">Order direct</span>
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
          Order now
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
                  Order now
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

      <PincodeChecker />

      {/* Honest 3-point freshness transparency (F1) */}
      <div className="bk-transparency-card">
        <div className="bk-freshness-grid">
          <div className="bk-fresh-item">
            <span className="bk-fresh-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </span>
            <strong>Clear window pouch – you see the biscuits</strong>
            <p>Every bone biscuit is visible before you buy. Nothing hidden inside foil.</p>
          </div>
          <div className="bk-fresh-item">
            <span className="bk-fresh-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </span>
            <strong>Packed in Nangloi, West Delhi</strong>
            <p>Sealed and dispatched fresh locally in West Delhi (PIN 110041).</p>
          </div>
          <div className="bk-fresh-item">
            <span className="bk-fresh-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </span>
            <strong>A treat, not a meal – keep fresh water nearby</strong>
            <p>Nutritious reward biscuits for training and treat time. Always keep clean water available.</p>
          </div>
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

/* 5. Retail Partner Section (Task 5) */
export function PartnerSection() {
  const { MSG = {} } = C();
  return (
    <section className="bk-partner" aria-labelledby="partner-h">
      <h2 id="partner-h">Run a Pet Shop or Grooming Salon in West Delhi?</h2>
      <p className="bk-partner__offer">
        We are onboarding our first 11 retail partners across Nangloi, Paschim Vihar, Punjabi Bagh, Janakpuri, and Rajouri Garden. Every partner gets 1 bonus tasting pack for every 11 packs stocked (₹1,100 investment, ₹688 retail profit @ 38.5% margin) with our 15-day 100% cash buyback guarantee.
      </p>
      <ul>
        <li>Counter marketing cards</li>
        <li>Complimentary 50g taste packs with QR review cards</li>
        <li>Zero-risk 15-day 100% cash buyback guarantee</li>
      </ul>
      <WaButton text={MSG.shop}>WhatsApp Lakshay for the Launch Box</WaButton>
      <p className="bk-partner__small">
        Profit shown at MRP ₹149 per pack. Buyback covers unopened, undamaged packs returned within 15 days. First 11 shops only.
      </p>
    </section>
  );
}

/* 6. Footer (all pages) */
export function SiteFooter() {
  const { EMAIL, GSTIN, MSG = {} } = C();
  return (
    <footer className="bk-h-foot">
      <nav aria-label="Footer">
        <a href="/">Home</a>
        <a href="/offers/">Bro Perks</a>
        <a href="/r/">Feedback</a>
        <a href="/partner/">Retail & Pet Shops</a>
        <a href="/privacy/">Privacy</a>
      </nav>
      <div className="footer-word" style={{ fontFamily: "'Gaegu', cursive", fontSize: 'clamp(52px, 11vw, 110px)', textAlign: 'center', color: '#35201625', letterSpacing: '-2px', margin: '30px 0 16px', userSelect: 'none' }}>
        best bro ever. 🐾
      </div>
      <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <span>
          BROSKI · Nangloi, Delhi 110041 · <a href={`mailto:${EMAIL}`}>{EMAIL}</a> ·{' '}
          <a href={waLink(MSG.hello)} target="_blank" rel="noopener noreferrer">WhatsApp</a> · Udyam: UDYAM-DL-11-0177908{GSTIN ? ` · GSTIN: ${GSTIN}` : ''}
        </span>
        <span style={{ fontSize: '13px', opacity: 0.8 }}>Made for the ones with paws. ♡</span>
      </p>
    </footer>
  );
}
