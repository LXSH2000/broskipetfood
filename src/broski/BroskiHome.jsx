/* BROSKI home-page pieces for the existing React app.
   Reads window.BROSKI_CONFIG (load /config.js in index.html before the app bundle).
*/
import React, { useEffect, useState } from 'react';
import BroskiWordmark from '../BroskiWordmark.jsx';
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
          placeholder="e.g. 110041"
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
  const nv = PRODUCTS.find((p) => p.id === 'bro-bites');
  const mx = PRODUCTS.find((p) => p.id === 'bro-mix');
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
                  Order on WhatsApp
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

      {/* Product Details Section (Legal Metrology & E-Commerce Rules) */}
      <div className="bk-product-details-card" style={{
        margin: '24px auto 0',
        padding: '20px',
        background: '#fff',
        border: '1.5px solid var(--border)',
        borderRadius: '16px',
        maxWidth: '860px',
        textAlign: 'left',
        fontSize: '13px',
        lineHeight: '1.6',
        color: 'var(--text)'
      }}>
        <h4 style={{ margin: '0 0 10px', fontSize: '15px', fontWeight: '800', color: 'var(--brown)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
          Product Details
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
          <div>
            <strong>Manufactured by:</strong> Scoobee Pet Foods Pvt. Ltd., HSIIDC Industrial Estate, Rai – 131029, Sonepat, Haryana
          </div>
          <div>
            <strong>Packed & marketed by:</strong> BROSKI, Nangloi, West Delhi – 110041
          </div>
          <div>
            <strong>Net quantity:</strong> 400 g · <strong>MRP:</strong> incl. of all taxes · <strong>Best before:</strong> 12 months from packing (see pack)
          </div>
          <div>
            <strong>Country of origin:</strong> India · <strong>Consumer care:</strong> <a href="mailto:support@broskipetfood.com" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '600' }}>support@broskipetfood.com</a>
          </div>
        </div>
      </div>

      <PincodeChecker />

      {/* Honest 3-point transparency (F1) */}
      <div className="bk-transparency-card">
        <div className="bk-quality-grid">
          <div className="bk-quality-item">
            <span className="bk-quality-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </span>
            <strong>Clear window pouch – you see the biscuits</strong>
            <p>Every bone biscuit is visible before you buy. Nothing hidden inside foil.</p>
          </div>
          <div className="bk-quality-item">
            <span className="bk-quality-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </span>
            <strong>Packed in Nangloi, West Delhi</strong>
            <p>Packed and sealed in Nangloi, West Delhi – 110041.</p>
          </div>
          <div className="bk-quality-item">
            <span className="bk-quality-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </span>
            <strong>A treat, not a meal – keep fresh water nearby</strong>
            <p>Crunchy reward biscuits for training and treat time. A treat, not a meal – always keep fresh water nearby.</p>
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
        Trade terms for pet shops – WhatsApp us and we'll share the current wholesale price and launch offer.
      </p>
      <ul>
        <li>Counter marketing cards</li>
        <li>Complimentary 50g taste packs with QR review cards</li>
      </ul>
      <WaButton text={MSG.shop || 'Hi BROSKI! We run a pet shop in West Delhi and want to know trade terms.'}>WhatsApp us</WaButton>
    </section>
  );
}

/* 6. Footer (initial authentic design) */
export function SiteFooter() {
  const { EMAIL, GSTIN, MSG = {} } = C();
  return (
    <footer style={{ paddingBottom: '88px' }}>
      <div className="footer-top">
        <a className="logo" href="/" style={{ color: '#fcf7ee', textDecoration: 'none', display: 'flex', alignItems: 'center' }} aria-label="Broski home">
          <BroskiWordmark height={26} style={{ color: '#fcf7ee' }} />
        </a>
        <p>Crunchy dog biscuits packed in Nangloi, West Delhi – 110041.<br />Treats for your best bro.</p>
        <div>
          <a href="/#shop">Shop treats</a>
          <a href="/#story">Our story</a>
          <a href="/#faq">FAQs</a>
          <a href="/offers/">Bro Perks</a>
        </div>
        <div>
          <a href="/partner/">Retail & Pet Shops</a>
          <a href="/r/">Feedback</a>
          <a href="/terms/">Terms</a>
          <a href="/privacy/">Privacy</a>
          <a href={waLink(MSG.hello)} target="_blank" rel="noopener noreferrer">WhatsApp</a>
        </div>
      </div>
      <div className="footer-word">
        best bro ever.
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <ellipse cx="12" cy="16" rx="5" ry="4" /><ellipse cx="5" cy="10" rx="2" ry="3" transform="rotate(-25 5 10)" /><ellipse cx="10" cy="6" rx="2" ry="3" /><ellipse cx="16" cy="6" rx="2" ry="3" /><ellipse cx="20" cy="11" rx="2" ry="3" transform="rotate(25 20 11)" />
        </svg>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Broski · Nangloi, West Delhi – 110041 · <a href={`mailto:${EMAIL}`} style={{ color: 'inherit' }}>{EMAIL}</a> · Udyam UDYAM-DL-11-0177908{GSTIN ? ` · GSTIN: ${GSTIN}` : ''}</span>
        <span>Made for the ones with paws. ♡</span>
        <span>IN / INR ₹</span>
      </div>
    </footer>
  );
}
