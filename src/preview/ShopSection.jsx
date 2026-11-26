import React from 'react';
import { PincodeChecker, waLink } from '../broski/BroskiHome.jsx';

const CARD_META = {
  'bro-bites': {
    tileColor: '#E3A92B',
    cutImg: '/broski-bites-cut.webp',
    cutAlt: 'BROSKI Bro Bites – Classic Crunch 400 g pouch cut-out'
  },
  'bro-mix': {
    tileColor: '#A9CF9F',
    cutImg: '/broski-mix-cut.webp',
    cutAlt: 'BROSKI Bro Mix – Happy Mix 400 g pouch cut-out'
  },
  combo: {
    tileColor: '#E58A68',
    cutImg: '/broski-mix-cut.webp',
    cutImg2: '/broski-bites-cut.webp',
    cutAlt: 'BROSKI Bro Combo: Bro Mix and Bro Bites 400 g pouches'
  }
};

export default function ShopSection({ onOpenGateway }) {
  const cfg = (typeof window !== 'undefined' && window.BROSKI_CONFIG) || {};
  const { PRODUCTS = [], UNIT_PRICE_LINE, MSG = {}, SHOPS = [] } = cfg;

  return (
    <section id="shop" className="pv-shop" aria-labelledby="pv-shop-heading">
      <div className="pv-shop-inner">
        <div className="pv-shop-head">
          <div>
            <span className="pv-shop-eyebrow">ORDER DIRECT · NANGLOI 110041</span>
            <h2 id="pv-shop-heading" className="pv-shop-title">
              PICK YOUR BRO&apos;S <span className="pv-shop-title-accent">CRUNCH</span>
            </h2>
          </div>
          <button
            type="button"
            className="pv-shop-combo-pill"
            onClick={() => onOpenGateway({ product: 'combo', step: 1 })}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            Order the combo
          </button>
        </div>

        {/* Pincode check directly under Shop title per homepage polish workflow */}
        <div className="pv-pin-wrap">
          <PincodeChecker onOpenOrder={onOpenGateway} />
        </div>

        {/* 3 Coloured Rounded 28px Tiles with Floating Cut-out Pouches */}
        <div className="pv-shop-grid">
          {PRODUCTS.map((p) => {
            const meta = CARD_META[p.id] || CARD_META['bro-bites'];
            const isCombo = p.id === 'combo';
            return (
              <article
                key={p.id}
                className={`pv-tile ${isCombo ? 'pv-tile--combo' : ''}`}
                style={{ '--tile-bg': meta.tileColor }}
              >
                <div className="pv-tile-stage">
                  {p.badge && (
                    <span className="pv-tile-badge">{p.badge}</span>
                  )}
                  <div className={`pv-tile-pouches ${meta.cutImg2 ? 'is-combo' : ''}`}>
                    <img
                      src={meta.cutImg}
                      alt={meta.cutAlt}
                      className="pv-tile-pouch"
                      loading="lazy"
                      decoding="async"
                    />
                    {meta.cutImg2 && (
                      <img
                        src={meta.cutImg2}
                        alt=""
                        aria-hidden="true"
                        className="pv-tile-pouch pv-tile-pouch--second"
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                  </div>
                </div>

                <div className="pv-tile-body">
                  <h3>{p.title}</h3>
                  <p className="pv-tile-note">{p.note} · {p.size}</p>

                  {p.ingredients && (
                    <details
                      className="pv-tile-inside"
                      onToggle={(e) => {
                        if (e.currentTarget.open) {
                          try { window.BroskiAnalytics?.trackEvent('ingredients_open', { product: p.id }); } catch {}
                        }
                      }}
                    >
                      <summary>What&apos;s inside <span aria-hidden="true">+</span></summary>
                      <p>{p.ingredients}</p>
                      <p><strong>{p.allergens}</strong> A treat, not a meal – follow the guide on the pack.</p>
                    </details>
                  )}

                  <p className="pv-tile-price">
                    <strong>₹{p.price}</strong>
                    <span>MRP incl. of all taxes</span>
                  </p>

                  <div className="pv-tile-actions">
                    <button
                      type="button"
                      className="pv-tile-order-btn"
                      onClick={() => onOpenGateway({ product: p.id, step: 1 })}
                    >
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" aria-hidden="true">
                        <path d="M5 7h14l1 14H4L5 7Z" />
                        <path d="M8 8V6a4 4 0 0 1 8 0v2" />
                      </svg>
                      Order now
                    </button>
                    <a
                      className="pv-tile-wa-link"
                      href={waLink(p.msg)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Questions? WhatsApp us
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Taste pack strip & unit price right under the cards */}
        <div className="pv-taste-strip">
          {UNIT_PRICE_LINE && <p className="pv-unit-line">{UNIT_PRICE_LINE}</p>}
          <div className="pv-taste-strip-cta">
            <span>Not sure which one your bro prefers?</span>
            <a
              href="/sample/?utm_source=site&utm_medium=shop_strip"
              className="pv-taste-strip-btn"
              onClick={() => { try { window.BroskiAnalytics?.trackEvent('sample_cta_click', { place: 'shop' }); } catch {} }}
            >
              🎁 Get a free 50 g taste pack →
            </a>
          </div>
        </div>

        {/* Statutory Product Details collapsible block under shop cards */}
        <details className="pv-details-card">
          <summary className="pv-details-summary">
            <span>Product Details · Manufacturer, Net Qty, MRP &amp; Support</span>
            <span className="pv-details-plus" aria-hidden="true">+</span>
          </summary>
          <dl className="pv-details-dl">
            <div className="pv-details-row">
              <dt>Packed &amp; marketed by:</dt>
              <dd>BROSKI, Nangloi, West Delhi – 110041</dd>
            </div>
            <div className="pv-details-row">
              <dt>Manufactured by:</dt>
              <dd>Scoobee Pet Foods Pvt. Ltd., HSIIDC Industrial Estate, Rai – 131029, Sonepat, Haryana</dd>
            </div>
            <div className="pv-details-row">
              <dt>Net quantity / MRP:</dt>
              <dd>400 g · MRP incl. of all taxes · Best before: 12 months from packing (see pack)</dd>
            </div>
            <div className="pv-details-row">
              <dt>Country of origin:</dt>
              <dd>India</dd>
            </div>
            <div className="pv-details-row">
              <dt>Customer support:</dt>
              <dd>
                <a href={waLink(MSG.hello)} target="_blank" rel="noopener noreferrer">WhatsApp us</a>
                {' '}· <a href="mailto:support@broskipetfood.com">support@broskipetfood.com</a> · Mon–Sat, 10 am – 7 pm
              </dd>
            </div>
          </dl>
        </details>

        {/* Shops trust block (shown only when populated) */}
        {SHOPS && SHOPS.length > 0 && (
          <div className="pv-shops-card">
            <h3>Find us at</h3>
            <div className="pv-shops-grid">
              {SHOPS.map((s, idx) => (
                <div key={idx} className="pv-shop-row">
                  <span><strong>{s.name}</strong> · {s.area}</span>
                  {s.map && (
                    <a href={s.map} target="_blank" rel="noopener noreferrer">Map →</a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
