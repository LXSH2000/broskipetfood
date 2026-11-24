/* BROSKI home-page pieces for the existing React app.
   Reads window.BROSKI_CONFIG (load /config.js in index.html before the app bundle).
*/
import React, { useEffect, useState } from 'react';
import BroskiWordmark from '../BroskiWordmark.jsx';
import BroskiCheckoutGateway from './BroskiCheckoutGateway';
import { checkPincode } from '../helpers';
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

/* Pincode Checker Component */
export function PincodeChecker({ onOpenOrder }) {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const r = await checkPincode(pin);
    setResult(r);
    setLoading(false);
    try {
      window.BroskiAnalytics?.trackEvent('pincode_check', {
        deliverable: r.deliverable,
        pin: r.pin
      });
    } catch {}
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
        <button type="submit" className="bk-h-btn bk-pin__btn" disabled={loading}>
          {loading ? 'Checking…' : 'Check'}
        </button>
      </div>

      {result && (
        <div className="bk-pin__msg is-shown" role="status" aria-live="polite">
          {result.error ? (
            <div className="bk-pin__result bk-pin__result--error">
              <p className="bk-pin__text">{result.error}</p>
            </div>
          ) : result.deliverable ? (
            <div className="bk-pin__result bk-pin__result--deliverable">
              <p className="bk-pin__text">
                ✅ We deliver to {result.pin} – free delivery, today or tomorrow.
              </p>
              <button
                type="button"
                className="bk-pin-action-btn bk-pin-action-btn--order"
                onClick={() => onOpenOrder?.({ product: 'combo', pincode: result.pin, step: 1 })}
              >
                Order now
              </button>
            </div>
          ) : (
            <div className="bk-pin__result bk-pin__result--waitlist">
              <p className="bk-pin__text">
                🐾 Arriving soon in {result.pin} – {result.waitlist_count} neighbours waiting.
              </p>
              <button
                type="button"
                className="bk-pin-action-btn bk-pin-action-btn--waitlist"
                onClick={() => onOpenOrder?.({ product: 'combo', pincode: result.pin, step: 2 })}
              >
                Join the waitlist
              </button>
            </div>
          )}
        </div>
      )}
    </form>
  );
}

/* 1. Product cards with Online Checkout Gateway */
export function ProductCards() {
  const { PRODUCTS = [], UNIT_PRICE_LINE } = C();
  const nv = PRODUCTS.find((p) => p.id === 'bro-bites');
  const mx = PRODUCTS.find((p) => p.id === 'bro-mix');
  const [gatewayConfig, setGatewayConfig] = useState(null);

  const openGateway = (opts = {}) => {
    const config = typeof opts === 'string'
      ? { product: opts, step: 1, pincode: '110041' }
      : { product: 'combo', step: 1, pincode: '110041', ...opts };
    setGatewayConfig(config);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const orderParam = params.get('order');
      if (orderParam) {
        const valid = ['combo', 'bro-combo', 'bro-bites', 'bites', 'bro-mix', 'mix'];
        const p = valid.includes(orderParam) ? (orderParam.includes('bites') ? 'bro-bites' : orderParam.includes('mix') ? 'bro-mix' : 'combo') : 'combo';
        openGateway({ product: p, step: 1 });
      }
    }
  }, []);

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
          onClick={() => openGateway({ product: 'combo', step: 1 })}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          Order the combo
        </button>
      </div>

      <div className="bk-shop__grid">
        {PRODUCTS.map((p) => (
          <article key={p.id} className={`bk-pcard ${p.id === 'combo' ? 'bk-pcard--combo' : ''}`}>
            <div className="bk-pcard__img">
              {p.img ? (
                <img
                  src={p.img}
                  srcSet={`${p.img400 || p.img} 400w, ${p.img} 764w`}
                  sizes="(max-width: 700px) 90vw, 360px"
                  alt={p.alt}
                  width="600"
                  height="600"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="bk-pcard__duo" aria-hidden="true">
                  {nv && <img src={nv.img} alt="" width="300" height="300" loading="lazy" decoding="async" />}
                  {mx && <img src={mx.img} alt="" width="300" height="300" loading="lazy" decoding="async" />}
                </div>
              )}
              {p.badge ? <span className="bk-pcard__save">{p.badge}</span> : null}
            </div>
            <div className="bk-pcard__body">
              <h3>{p.title}</h3>
              <p className="bk-pcard__note">{p.note} · {p.size}</p>
              {p.ingredients && (
                <details className="bk-inside" onToggle={(e) => { if (e.currentTarget.open) try { window.BroskiAnalytics?.trackEvent('ingredients_open', { product: p.id }); } catch {} }}>
                  <summary>What's inside <span aria-hidden="true">+</span></summary>
                  <p>{p.ingredients}</p>
                  <p><strong>{p.allergens}</strong> A treat, not a meal – follow the guide on the pack.</p>
                </details>
              )}
              <p className="bk-pcard__price">
                <strong>₹{p.price}</strong> <span>MRP incl. of all taxes</span>
              </p>

              <div className="bk-card-cta-group">
                <button
                  type="button"
                  className="bk-h-btn bk-h-btn--order"
                  onClick={() => openGateway({ product: p.id, step: 1 })}
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
                  <span>Questions? WhatsApp us</span>
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
      {UNIT_PRICE_LINE && <p className="bk-shop__unit">{UNIT_PRICE_LINE}</p>}
      <p style={{ textAlign: 'center', margin: '8px auto 0', fontSize: '14px', color: 'var(--bk-brown-2)' }}>
        Not sure which one? <a className="text-link" href="/sample/?utm_source=site&utm_medium=shop" onClick={() => { try { window.BroskiAnalytics?.trackEvent('sample_cta_click', { place: 'shop' }); } catch {} }}>Try a free taste pack first →</a>
      </p>

      {/* Product Details Section (Legal Metrology & E-Commerce Rules) */}
      {/* Product details (statutory legal metrology & consumer care) */}
      <div className="bk-details-card">
        <h4 className="bk-details-title">Product Details</h4>
        <dl className="bk-details">
          <div className="bk-details-row">
            <dt>Packed & marketed by:</dt>
            <dd>BROSKI, Nangloi, West Delhi – 110041</dd>
          </div>
          <div className="bk-details-row">
            <dt>Manufactured by:</dt>
            <dd>Scoobee Pet Foods Pvt. Ltd., HSIIDC Industrial Estate, Rai – 131029, Sonepat, Haryana</dd>
          </div>
          <div className="bk-details-row">
            <dt>Net quantity / MRP:</dt>
            <dd>400 g · MRP incl. of all taxes · Best before: 12 months from packing (see pack)</dd>
          </div>
          <div className="bk-details-row">
            <dt>Country of origin:</dt>
            <dd>India</dd>
          </div>
          <div className="bk-details-row">
            <dt>Consumer care:</dt>
            <dd>
              <a href="tel:+919821563468" style={{ color: 'inherit', textDecoration: 'none', marginRight: '6px' }}>+91 9821563468</a>
              · <a href="mailto:support@broskipetfood.com" className="bk-details-email">support@broskipetfood.com</a>
            </dd>
          </div>
        </dl>
      </div>

      <PincodeChecker onOpenOrder={openGateway} />

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

      {/* Shops trust block (shown only if SHOPS is populated) */}
      {C().SHOPS && C().SHOPS.length > 0 && (
        <div className="bk-product-details-card bk-shops-card" style={{
          margin: '24px auto 0',
          padding: '20px',
          background: '#fff',
          border: '1.5px solid var(--border)',
          borderRadius: '16px',
          maxWidth: '860px',
          textAlign: 'left'
        }}>
          <h4 style={{ margin: '0 0 10px', fontSize: '15px', fontWeight: '800', color: 'var(--brown)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
            Find us at
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            {C().SHOPS.map((s, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span><strong>{s.name}</strong> · {s.area}</span>
                {s.map && <a href={s.map} target="_blank" rel="noopener noreferrer" className="text-link">Map →</a>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* The D2C Direct Checkout Gateway */}
      {gatewayConfig && (
        <BroskiCheckoutGateway
          initialProduct={gatewayConfig.product || 'combo'}
          initialStep={gatewayConfig.step || 1}
          initialPincode={gatewayConfig.pincode || '110041'}
          onClose={() => setGatewayConfig(null)}
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
          <a href="/sample/">Free sample</a>
          <a href="/points/">My points</a>
          <a href="/#story">Our story</a>
          <a href="/#faq">FAQs</a>
          <a href="/offers/">Bro Perks</a>
        </div>
        <div>
          <a href="/partner/">Retail & Pet Shops</a>
          <a href="/r/">Feedback</a>
          <a href="/terms/">Terms</a>
          <a href="/privacy/">Privacy</a>
          {C().INSTAGRAM_URL ? (
            <a href={C().INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">Instagram</a>
          ) : null}
          <a href={waLink(MSG.hello)} target="_blank" rel="noopener noreferrer">WhatsApp (+91 9821563468)</a>
          <a href="tel:+919821563468">Call: +91 9821563468</a>
        </div>
      </div>
      <div className="footer-word">
        best bro ever.
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <ellipse cx="12" cy="16" rx="5" ry="4" /><ellipse cx="5" cy="10" rx="2" ry="3" transform="rotate(-25 5 10)" /><ellipse cx="10" cy="6" rx="2" ry="3" /><ellipse cx="16" cy="6" rx="2" ry="3" /><ellipse cx="20" cy="11" rx="2" ry="3" transform="rotate(25 20 11)" />
        </svg>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Broski · Nangloi, West Delhi – 110041 · Phone: <a href="tel:+919821563468" style={{ color: 'inherit' }}>+91 9821563468</a> · <a href={`mailto:${EMAIL}`} style={{ color: 'inherit' }}>{EMAIL}</a> · Udyam: UDYAM-DL-11-0177908{GSTIN ? ` · GSTIN: ${GSTIN}` : ''}</span>
        <span>Made for the ones with paws. ♡</span>
        <span>IN / INR ₹</span>
      </div>
    </footer>
  );
}
