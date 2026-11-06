import React, { useState } from 'react';

const C = () => window.BROSKI_CONFIG || {};

export default function BroskiCheckoutGateway({ initialProduct, onClose }) {
  const cfg = C();
  const products = cfg.PRODUCTS || [];
  
  // Cart state: quantities of each product
  const [quantities, setQuantities] = useState(() => {
    const q = { 'non-veg': 0, 'mix': 0, 'combo': 0 };
    if (initialProduct && q.hasOwnProperty(initialProduct)) {
      q[initialProduct] = 1;
    } else {
      q['combo'] = 1; // default to the popular combo
    }
    return q;
  });

  // Customer & Delivery Form State
  const [dogName, setDogName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [locality, setLocality] = useState('');
  const [pincode, setPincode] = useState('110041');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [orderConfirmed, setOrderConfirmed] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Calculations
  const getProduct = (id) => products.find(p => p.id === id) || { price: 0, title: id };
  const nvQty = quantities['non-veg'] || 0;
  const mxQty = quantities['mix'] || 0;
  const cbQty = quantities['combo'] || 0;

  const subtotal = 
    nvQty * (getProduct('non-veg').price || 149) +
    mxQty * (getProduct('mix').price || 179) +
    cbQty * (getProduct('combo').price || 299);

  const totalItems = nvQty + mxQty + cbQty;
  const savings = cbQty * 29;
  const shippingFee = subtotal >= 299 || totalItems >= 2 ? 0 : (subtotal > 0 ? 20 : 0);
  const totalPayable = subtotal + shippingFee;

  const updateQty = (id, delta) => {
    setQuantities(prev => {
      const next = Math.max(0, (prev[id] || 0) + delta);
      return { ...prev, [id]: next };
    });
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (totalItems === 0) {
      setErrorMsg('Please select at least 1 pack to proceed.');
      return;
    }

    if (!customerName.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!address.trim()) {
      setErrorMsg('Please enter your delivery address.');
      return;
    }

    // Generate official Order ID
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const orderId = `BR-ORD-2611-${randomHex}`;

    const newOrder = {
      id: orderId,
      date: new Date().toISOString(),
      dogName: dogName.trim() || 'My Bro',
      customerName: customerName.trim(),
      phone: cleanPhone,
      address: `${address.trim()}, ${locality.trim() ? locality.trim() + ', ' : ''}PIN ${pincode.trim() || '110041'}`,
      pincode: pincode.trim(),
      items: [
        nvQty > 0 && { id: 'non-veg', name: 'Non-Veg 400g', qty: nvQty, price: 149 },
        mxQty > 0 && { id: 'mix', name: 'Mix 400g', qty: mxQty, price: 179 },
        cbQty > 0 && { id: 'combo', name: 'Bro Combo (2×400g)', qty: cbQty, price: 299 },
      ].filter(Boolean),
      subtotal,
      savings,
      shippingFee,
      totalPayable,
      paymentMethod: paymentMethod === 'cod' ? 'Cash / UPI on Delivery' : 'Online Payment Gateway (Simulated / Instant QR)',
      status: 'Confirmed'
    };

    // Save to local storage
    try {
      const existing = JSON.parse(localStorage.getItem('broski_customer_orders') || '[]');
      existing.unshift(newOrder);
      localStorage.setItem('broski_customer_orders', JSON.stringify(existing));
    } catch (err) {
      console.warn('LocalStorage save error:', err);
    }

    setOrderConfirmed(newOrder);
  };

  const getWhatsAppReceiptLink = () => {
    if (!orderConfirmed) return '#';
    const itemsText = orderConfirmed.items.map(i => `• ${i.name} × ${i.qty} (₹${i.price * i.qty})`).join('\n');
    const msg = `🐾 *BROSKI Order Confirmation*\n` +
      `*Order ID:* ${orderConfirmed.id}\n` +
      `*Bro's Name:* ${orderConfirmed.dogName}\n` +
      `*Customer:* ${orderConfirmed.customerName} (${orderConfirmed.phone})\n` +
      `*Address:* ${orderConfirmed.address}\n\n` +
      `*Items:*\n${itemsText}\n\n` +
      `*Total Payable:* ₹${orderConfirmed.totalPayable} (${orderConfirmed.paymentMethod})\n` +
      `*Delivery Window:* Dispatch from 15 Nov in West Delhi.\n\nPlease confirm my order dispatch!`;
    return `https://wa.me/${cfg.WHATSAPP_NUMBER || '918076045934'}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="bk-gateway-overlay" role="dialog" aria-modal="true" aria-labelledby="gw-title">
      <div className="bk-gateway-modal">
        {/* Header */}
        <div className="bk-gateway-header">
          <div>
            <span className="bk-gateway-badge">D2C DIRECT CHECKOUT</span>
            <h2 id="gw-title">
              {orderConfirmed ? 'Order Confirmed! 🐾' : 'Complete Your Bro\'s Order'}
            </h2>
          </div>
          <button type="button" className="bk-gateway-close" onClick={onClose} aria-label="Close checkout">
            ✕
          </button>
        </div>

        {/* Content */}
        {!orderConfirmed ? (
          <form className="bk-gateway-body" onSubmit={handlePlaceOrder}>
            {/* Step 1: Pack Selection */}
            <div className="bk-gateway-section">
              <h3 className="bk-sec-title">
                <span>1</span> Select Pack & Quantities
              </h3>
              
              <div className="bk-pack-cards">
                {/* Non-Veg */}
                <div className={`bk-pack-row ${nvQty > 0 ? 'selected' : ''}`}>
                  <div className="bk-pack-info">
                    <span className="bk-pack-tag nv">NON-VEG</span>
                    <strong>Non-Veg Dog Biscuits (400g)</strong>
                    <span className="bk-pack-meta">₹149 · ₹0.37/g · Yellow Pouch</span>
                  </div>
                  <div className="bk-qty-stepper">
                    <button type="button" onClick={() => updateQty('non-veg', -1)} aria-label="Decrease Non-Veg">−</button>
                    <span>{nvQty}</span>
                    <button type="button" onClick={() => updateQty('non-veg', 1)} aria-label="Increase Non-Veg">+</button>
                  </div>
                </div>

                {/* Mix */}
                <div className={`bk-pack-row ${mxQty > 0 ? 'selected' : ''}`}>
                  <div className="bk-pack-info">
                    <span className="bk-pack-tag mx">MIX CRUNCH</span>
                    <strong>Mix Dog Biscuits (400g)</strong>
                    <span className="bk-pack-meta">₹179 · ₹0.45/g · White Pouch</span>
                  </div>
                  <div className="bk-qty-stepper">
                    <button type="button" onClick={() => updateQty('mix', -1)} aria-label="Decrease Mix">−</button>
                    <span>{mxQty}</span>
                    <button type="button" onClick={() => updateQty('mix', 1)} aria-label="Increase Mix">+</button>
                  </div>
                </div>

                {/* Bro Combo */}
                <div className={`bk-pack-row combo ${cbQty > 0 ? 'selected' : ''}`}>
                  <div className="bk-pack-info">
                    <div className="bk-pack-combo-tags">
                      <span className="bk-pack-tag cb">POPULAR COMBO</span>
                      <span className="bk-save-tag">SAVE ₹29</span>
                    </div>
                    <strong>Bro Combo (1 Non-Veg + 1 Mix)</strong>
                    <span className="bk-pack-meta">₹299 for 800g (2 × 400g pouches)</span>
                  </div>
                  <div className="bk-qty-stepper">
                    <button type="button" onClick={() => updateQty('combo', -1)} aria-label="Decrease Combo">−</button>
                    <span>{cbQty}</span>
                    <button type="button" onClick={() => updateQty('combo', 1)} aria-label="Increase Combo">+</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Pet & Delivery Details */}
            <div className="bk-gateway-section">
              <h3 className="bk-sec-title">
                <span>2</span> Dog & Delivery Details
              </h3>
              
              <div className="bk-form-grid">
                <div className="bk-field">
                  <label htmlFor="bk-dog-name">Your Bro's Name (Dog)</label>
                  <input
                    id="bk-dog-name"
                    type="text"
                    placeholder="e.g. Rocky, Bruno, Simba"
                    value={dogName}
                    onChange={(e) => setDogName(e.target.value)}
                  />
                </div>
                
                <div className="bk-field">
                  <label htmlFor="bk-cust-name">Your Full Name *</label>
                  <input
                    id="bk-cust-name"
                    type="text"
                    required
                    placeholder="Pet parent name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>

                <div className="bk-field full">
                  <label htmlFor="bk-phone">Mobile Phone (for delivery & order status) *</label>
                  <div className="bk-phone-input">
                    <span className="bk-country-code">+91</span>
                    <input
                      id="bk-phone"
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="bk-field full">
                  <label htmlFor="bk-address">Delivery Address (House/Flat No., Street, Landmark) *</label>
                  <textarea
                    id="bk-address"
                    rows={2}
                    required
                    placeholder="e.g. H-34, Dharam Colony, near Summer Singh Clinic"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div className="bk-field">
                  <label htmlFor="bk-locality">Area / Locality</label>
                  <input
                    id="bk-locality"
                    type="text"
                    placeholder="e.g. Nangloi, Paschim Vihar, Janakpuri"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                  />
                </div>

                <div className="bk-field">
                  <label htmlFor="bk-pincode">PIN Code</label>
                  <input
                    id="bk-pincode"
                    type="text"
                    maxLength={6}
                    placeholder="110041"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Payment Gateway Selector */}
            <div className="bk-gateway-section">
              <h3 className="bk-sec-title">
                <span>3</span> Payment Preference
              </h3>
              
              <div className="bk-payment-options">
                <label className={`bk-pay-opt ${paymentMethod === 'cod' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  <div className="bk-pay-text">
                    <strong>Cash / UPI on Delivery (Recommended)</strong>
                    <span>Pay at your doorstep via cash or Google Pay / PhonePe when treats arrive.</span>
                  </div>
                  <span className="bk-pay-badge">ZERO RISK</span>
                </label>

                <label className={`bk-pay-opt ${paymentMethod === 'online' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymethod"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={() => setPaymentMethod('online')}
                  />
                  <div className="bk-pay-text">
                    <strong>Online Payment Gateway (UPI / QR / Cards)</strong>
                    <span>Instant UPI QR code & merchant payment gateway (Connecting for live launch).</span>
                  </div>
                  <span className="bk-pay-badge live">INSTANT UPI</span>
                </label>
              </div>
            </div>

            {/* Summary & Place Order */}
            <div className="bk-gateway-footer">
              {errorMsg && <div className="bk-gateway-error">{errorMsg}</div>}

              <div className="bk-summary-box">
                <div className="bk-sum-row">
                  <span>Selected Treats ({totalItems} packs):</span>
                  <span>₹{subtotal}</span>
                </div>
                {savings > 0 && (
                  <div className="bk-sum-row save">
                    <span>Combo Savings:</span>
                    <span>−₹{savings}</span>
                  </div>
                )}
                <div className="bk-sum-row">
                  <span>West Delhi Delivery:</span>
                  <span>{shippingFee === 0 ? <strong style={{color:'#1f8f4e'}}>FREE</strong> : `₹${shippingFee}`}</span>
                </div>
                <div className="bk-sum-total">
                  <span>Total Amount:</span>
                  <strong>₹{totalPayable}</strong>
                </div>
              </div>

              <button
                type="submit"
                disabled={totalItems === 0}
                className="bk-place-order-btn"
              >
                Place Order for ₹{totalPayable}
              </button>
              
              <p className="bk-gateway-guarantee">
                🔒 Official BROSKI D2C Order · Freshly baked & packed in Nangloi · Dispatches from 15 Nov
              </p>
            </div>
          </form>
        ) : (
          /* Confirmation Screen */
          <div className="bk-gateway-confirmed">
            <div className="bk-conf-paw">🐾</div>
            <h3>Your Bro's Stash is Confirmed!</h3>
            <p className="bk-conf-id">
              Order Reference: <strong>{orderConfirmed.id}</strong>
            </p>
            <p className="bk-conf-meta">
              We received your order for <strong>{orderConfirmed.dogName}</strong> ({orderConfirmed.customerName}).
            </p>

            <div className="bk-conf-receipt">
              <div className="bk-conf-receipt-header">Order Summary</div>
              {orderConfirmed.items.map(item => (
                <div key={item.id} className="bk-conf-item">
                  <span>{item.name} × {item.qty}</span>
                  <strong>₹{item.price * item.qty}</strong>
                </div>
              ))}
              <div className="bk-conf-total">
                <span>Total Amount ({orderConfirmed.paymentMethod}):</span>
                <strong>₹{orderConfirmed.totalPayable}</strong>
              </div>
              <div className="bk-conf-addr">
                <strong>Delivery Address:</strong> {orderConfirmed.address}
              </div>
            </div>

            <div className="bk-dispatch-pill">
              🚚 <strong>Dispatch Schedule:</strong> Fresh batch baking at Scoobee · West Delhi deliveries begin <strong>Sunday, 15 Nov 2026</strong>.
            </div>

            <div className="bk-conf-actions">
              <a
                href={getWhatsAppReceiptLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="bk-conf-wa-btn"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.886 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Send Copy to WhatsApp
              </a>
              <button type="button" className="bk-conf-done-btn" onClick={onClose}>
                Back to Site
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
