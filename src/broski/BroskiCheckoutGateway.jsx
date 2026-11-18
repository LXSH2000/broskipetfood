import React, { useState } from 'react';

const C = () => window.BROSKI_CONFIG || {};

export default function BroskiCheckoutGateway({ initialProduct, onClose }) {
  const cfg = C();
  const products = cfg.PRODUCTS || [];

  // Product prices directly from public/config.js
  const bitesPrice = products.find(p => p.id === 'bro-bites')?.price || 149;
  const mixPrice = products.find(p => p.id === 'bro-mix')?.price || 179;
  const comboPrice = products.find(p => p.id === 'combo' || p.id === 'bro-combo')?.price || 299;

  // Cart quantities
  const [quantities, setQuantities] = useState(() => {
    const q = { bites: 0, mix: 0, combo: 0 };
    if (initialProduct === 'bro-bites' || initialProduct === 'bites') q.bites = 1;
    else if (initialProduct === 'bro-mix' || initialProduct === 'mix') q.mix = 1;
    else q.combo = 1;
    return q;
  });

  // Customer details
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [pincode, setPincode] = useState('110041');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [orderConfirmed, setOrderConfirmed] = useState(null);

  const bQty = quantities.bites || 0;
  const mQty = quantities.mix || 0;
  const cQty = quantities.combo || 0;
  const totalItems = bQty + mQty + cQty;

  // Compute total strictly from config prices
  const total = (bQty * bitesPrice) + (mQty * mixPrice) + (cQty * comboPrice);

  const updateQty = (key, delta) => {
    setQuantities(prev => ({
      ...prev,
      [key]: Math.max(0, (prev[key] || 0) + delta)
    }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (totalItems === 0) {
      setErrorMsg('Please select at least 1 pack to proceed.');
      return;
    }

    if (!customerName.trim() || customerName.trim().length < 2) {
      setErrorMsg('Please enter your name.');
      return;
    }

    const cleanPhoneDigits = phone.replace(/\D/g, '');
    if (cleanPhoneDigits.length !== 10 || !/^[6-9][0-9]{9}$/.test(cleanPhoneDigits)) {
      setErrorMsg('Please enter a valid 10-digit mobile number (e.g. 85XXXXXXXX).');
      return;
    }
    const cleanPhone = `+91${cleanPhoneDigits}`;

    const cleanPinDigits = pincode.replace(/\D/g, '');
    if (cleanPinDigits.length !== 6 || !/^[1-9][0-9]{5}$/.test(cleanPinDigits)) {
      setErrorMsg('Please enter a valid 6-digit Delhi pincode (e.g. 110041).');
      return;
    }

    if (!consent) {
      setErrorMsg('Please accept the consent terms to place your order request.');
      return;
    }

    setLoading(true);

    try {
      // Dynamic import of Supabase so initial page load remains ultra-light
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

      const itemsPayload = { bites: bQty, mix: mQty, combo: cQty };

      const { data, error } = await supabase.rpc('create_order_request', {
        p_phone: cleanPhone,
        p_name: customerName.trim(),
        p_pincode: pincode.trim(),
        p_items: itemsPayload,
        p_total: total,
        p_consent: true
      });

      if (error) throw error;

      const orderId = (data && data.order_id) || 'DIRECT';
      const customerCode = (data && data.customer_code) || '';

      // Safe GA4 event: STRICTLY NO PHONE, NO NAME, NO CODE
      try {
        if (typeof window.gtag === 'function') {
          const src = (window.BroskiPortal && window.BroskiPortal.getSource()) || 'direct';
          window.gtag('event', 'order_request', {
            source: src,
            total: total,
            items_count: totalItems
          });
        }
      } catch (_) {}

      // Build items summary for WhatsApp: "Bro Bites ×n, Bro Mix ×n, Combo ×n"
      const summaryParts = [];
      if (bQty > 0) summaryParts.push(`Bro Bites ×${bQty}`);
      if (mQty > 0) summaryParts.push(`Bro Mix ×${mQty}`);
      if (cQty > 0) summaryParts.push(`Combo ×${cQty}`);
      const summary = summaryParts.join(', ');

      const waMsg = orderId !== 'DIRECT'
        ? `Hi BROSKI! Order ${orderId}: ${summary} = ₹${total}. Pincode: ${cleanPinDigits}`
        : `Hi BROSKI! ${summary} = ₹${total}. Pincode: ${cleanPinDigits}`;

      // Contact action: WhatsApp or mailto
      let contactUrl = '#';
      const waNum = (cfg.WHATSAPP_NUMBER || '').toString().replace(/\D/g, '');
      if (waNum && waNum.length >= 10) {
        contactUrl = `https://wa.me/${waNum}?text=${encodeURIComponent(waMsg)}`;
      } else {
        const sub = encodeURIComponent(orderId !== 'DIRECT' ? `BROSKI Order Request #${orderId}` : 'BROSKI Order Request');
        const body = encodeURIComponent(waMsg);
        contactUrl = `mailto:${cfg.EMAIL || 'support@broskipetfood.com'}?subject=${sub}&body=${body}`;
      }

      setOrderConfirmed({
        id: orderId,
        customerCode,
        itemsText: summary,
        total,
        contactUrl,
        customerName: customerName.trim(),
        pincode: cleanPinDigits
      });

      // Automatically open WhatsApp / mailto link
      window.open(contactUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('[OrderRequest] RPC failed or offline:', err);
      // Fallback: If RPC fails, still open WhatsApp without the order id
      const summaryParts = [];
      if (bQty > 0) summaryParts.push(`Bro Bites ×${bQty}`);
      if (mQty > 0) summaryParts.push(`Bro Mix ×${mQty}`);
      if (cQty > 0) summaryParts.push(`Combo ×${cQty}`);
      const summary = summaryParts.join(', ');

      const waMsg = `Hi BROSKI! ${summary} = ₹${total}. Pincode: ${cleanPinDigits}`;
      const waNum = (cfg.WHATSAPP_NUMBER || '').toString().replace(/\D/g, '');
      const contactUrl = waNum
        ? `https://wa.me/${waNum}?text=${encodeURIComponent(waMsg)}`
        : `mailto:${cfg.EMAIL || 'support@broskipetfood.com'}?subject=BROSKI Order&body=${encodeURIComponent(waMsg)}`;

      setOrderConfirmed({
        id: 'DIRECT',
        itemsText: summary,
        total,
        contactUrl,
        customerName: customerName.trim(),
        pincode: cleanPinDigits
      });
      window.open(contactUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bk-gateway-overlay" role="dialog" aria-modal="true" aria-labelledby="gw-title">
      <div className="bk-gateway-modal" style={{ maxWidth: '500px' }}>
        {/* Header */}
        <div className="bk-gateway-header">
          <div>
            <span className="bk-gateway-badge">ORDER ON WHATSAPP</span>
            <h2 id="gw-title" style={{ fontSize: '22px' }}>
              {orderConfirmed ? 'Order Request Sent! 🐾' : 'Order Direct from Nangloi'}
            </h2>
          </div>
          <button type="button" className="bk-gateway-close" onClick={onClose} aria-label="Close order form">
            ✕
          </button>
        </div>

        {/* Content */}
        {!orderConfirmed ? (
          <form className="bk-gateway-body" onSubmit={handlePlaceOrder}>
            {/* Step 1: Quantities */}
            <div className="bk-gateway-section">
              <h3 className="bk-sec-title">
                <span>1</span> Select Packs
              </h3>

              <div className="bk-pack-cards">
                {/* Bites */}
                <div className={`bk-pack-row ${bQty > 0 ? 'selected' : ''}`}>
                  <div className="bk-pack-info">
                    <span className="bk-pack-tag nv">YELLOW PACK</span>
                    <strong>Bro Bites – Classic Crunch</strong>
                    <span className="bk-pack-meta">₹{bitesPrice} · 400 g</span>
                  </div>
                  <div className="bk-qty-stepper">
                    <button type="button" onClick={() => updateQty('bites', -1)} aria-label="Decrease Bites">−</button>
                    <span>{bQty}</span>
                    <button type="button" onClick={() => updateQty('bites', 1)} aria-label="Increase Bites">+</button>
                  </div>
                </div>

                {/* Mix */}
                <div className={`bk-pack-row ${mQty > 0 ? 'selected' : ''}`}>
                  <div className="bk-pack-info">
                    <span className="bk-pack-tag mx">WHITE PACK</span>
                    <strong>Bro Mix – Happy Mix</strong>
                    <span className="bk-pack-meta">₹{mixPrice} · 400 g</span>
                  </div>
                  <div className="bk-qty-stepper">
                    <button type="button" onClick={() => updateQty('mix', -1)} aria-label="Decrease Mix">−</button>
                    <span>{mQty}</span>
                    <button type="button" onClick={() => updateQty('mix', 1)} aria-label="Increase Mix">+</button>
                  </div>
                </div>

                {/* Combo */}
                <div className={`bk-pack-row combo ${cQty > 0 ? 'selected' : ''}`}>
                  <div className="bk-pack-info">
                    <div className="bk-pack-combo-tags">
                      <span className="bk-pack-tag cb">POPULAR COMBO</span>
                      <span className="bk-save-tag">SAVE ₹29</span>
                    </div>
                    <strong>Bro Combo (1 Bites + 1 Mix)</strong>
                    <span className="bk-pack-meta">₹{comboPrice} · 2 × 400 g</span>
                  </div>
                  <div className="bk-qty-stepper">
                    <button type="button" onClick={() => updateQty('combo', -1)} aria-label="Decrease Combo">−</button>
                    <span>{cQty}</span>
                    <button type="button" onClick={() => updateQty('combo', 1)} aria-label="Increase Combo">+</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Contact Details */}
            <div className="bk-gateway-section">
              <h3 className="bk-sec-title">
                <span>2</span> Your Details
              </h3>

              <div className="bk-form-grid">
                <div className="bk-field">
                  <label htmlFor="ord-name">Your Name</label>
                  <input
                    id="ord-name"
                    type="text"
                    placeholder="e.g. Rahul / Priya"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>

                <div className="bk-field">
                  <label htmlFor="ord-phone">WhatsApp Number (10 Digits)</label>
                  <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1.5px solid var(--border)', borderRadius: '12px' }}>
                    <span style={{ padding: '0 10px', fontWeight: '700', color: '#555', fontSize: '14px' }}>+91</span>
                    <input
                      id="ord-phone"
                      type="tel"
                      placeholder="85XXXXXXXX"
                      inputMode="numeric"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      style={{ border: 0, paddingLeft: 0, width: '100%' }}
                      required
                    />
                  </div>
                </div>

                <div className="bk-field">
                  <label htmlFor="ord-pin">Delhi Pincode (6 Digits)</label>
                  <input
                    id="ord-pin"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="110041"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                  />
                </div>

                <div className="bk-field" style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', cursor: 'pointer', minHeight: '44px', padding: '6px 0' }}>
                    <input
                      id="ord-consent"
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#b8452b' }}
                      required
                    />
                    <span>I agree that BROSKI saves my name, phone and pincode to process my order and track my points. I can ask for deletion at <a href="mailto:support@broskipetfood.com" style={{ color: 'inherit' }}>support@broskipetfood.com</a>.</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer & Submit */}
            <div className="bk-gateway-footer">
              {errorMsg && <div className="bk-gateway-error">{errorMsg}</div>}

              <div className="bk-summary-box">
                <div className="bk-sum-row">
                  <span>Selected items ({totalItems} packs):</span>
                  <span>₹{total}</span>
                </div>
                <div className="bk-sum-total">
                  <span>Estimated Total:</span>
                  <strong>₹{total}</strong>
                </div>
                <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#777', lineHeight: '1.4' }}>
                  The admin confirms the final amount on WhatsApp. This is an order request, not a direct bill.
                </p>
              </div>

              <button
                type="submit"
                disabled={totalItems === 0 || loading}
                className="bk-place-order-btn"
                style={{ minHeight: '50px', fontSize: '16px' }}
              >
                {loading ? 'Creating Order Request...' : `Order on WhatsApp (₹${total})`}
              </button>

              <p className="bk-gateway-guarantee" style={{ fontSize: '12px' }}>
                Nangloi, West Delhi – 110041 · No online payment required
              </p>
            </div>
          </form>
        ) : (
          /* Confirmation Screen */
          <div className="bk-gateway-confirmed" style={{ textAlign: 'center', padding: '24px 16px' }}>
            <div className="bk-conf-paw" style={{ fontSize: '40px', marginBottom: '8px' }}>🐾</div>
            <h3 style={{ fontSize: '22px', margin: '0 0 6px' }}>Order Request Saved!</h3>
            <p className="bk-conf-id" style={{ fontSize: '15px', margin: '4px 0' }}>
              Order Reference: <strong>#{orderConfirmed.id}</strong>
            </p>
            {orderConfirmed.customerCode ? (
              <p style={{ fontSize: '13.5px', color: '#974324', margin: '6px 0' }}>
                Your customer code: <strong style={{ fontFamily: 'monospace', letterSpacing: '1px', background: '#fdf3ed', padding: '2px 6px', borderRadius: '4px' }}>{orderConfirmed.customerCode}</strong> – save it to check points at <a href="/points/" style={{ color: 'inherit', textDecoration: 'underline' }}>broskipetfood.com/points</a>
              </p>
            ) : (
              <p style={{ fontSize: '13px', color: '#776754', margin: '6px 0' }}>
                Check your points at <a href="/points/" style={{ color: 'inherit', textDecoration: 'underline' }}>broskipetfood.com/points</a> with your customer code.
              </p>
            )}
            <p style={{ fontSize: '13.5px', color: '#666', margin: '8px 0 16px' }}>
              We saved your request. Click below to send your details directly on WhatsApp to confirm delivery!
            </p>

            <div className="bk-conf-receipt" style={{ textAlign: 'left', background: '#fff', border: '1px solid #e6dccb', borderRadius: '12px', padding: '14px', margin: '14px 0' }}>
              <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '8px' }}>Order Request Summary</div>
              <pre style={{ margin: 0, fontFamily: 'inherit', fontSize: '13px', whiteSpace: 'pre-wrap', color: '#444' }}>
                {orderConfirmed.itemsText}
              </pre>
              <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed #e6dccb', fontWeight: '700', display: 'flex', justifyContent: 'space-between' }}>
                <span>Estimated Total:</span>
                <span>₹{orderConfirmed.total}</span>
              </div>
            </div>

            <p style={{ fontSize: '12.5px', color: '#777', margin: '10px 0 18px' }}>
              The admin confirms the final amount on WhatsApp. This is an order request, not a direct bill.
            </p>

            <a
              href={orderConfirmed.contactUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bk-conf-wa-btn"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', minHeight: '50px', background: '#1f8f4e', color: '#fff', textDecoration: 'none', borderRadius: '999px', fontWeight: '700', fontSize: '16px' }}
            >
              Open WhatsApp to Confirm Order →
            </a>

            <button
              type="button"
              className="bk-conf-done-btn"
              onClick={onClose}
              style={{ marginTop: '12px', background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', padding: '10px', fontSize: '14px' }}
            >
              Close and back to site
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
