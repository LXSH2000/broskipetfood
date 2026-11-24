import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

const C = () => window.BROSKI_CONFIG || {};

export default function BroskiCheckoutGateway({ initialProduct, initialStep = 1, initialPincode = '110041', onClose }) {
  const cfg = C();
  const products = cfg.PRODUCTS || [];

  // Product prices from config
  const bitesPrice = products.find(p => p.id === 'bro-bites')?.price || 149;
  const mixPrice = products.find(p => p.id === 'bro-mix')?.price || 179;
  const comboPrice = products.find(p => p.id === 'combo' || p.id === 'bro-combo')?.price || 295;

  // Stepper state: 1 = Packs, 2 = Pincode, 3 = Details, 4 = Review, 5 = Done
  const [step, setStep] = useState(initialStep);

  // Cart quantities
  const [quantities, setQuantities] = useState(() => {
    const q = { bites: 0, mix: 0, combo: 0 };
    if (initialProduct === 'bro-bites' || initialProduct === 'bites') q.bites = 1;
    else if (initialProduct === 'bro-mix' || initialProduct === 'mix') q.mix = 1;
    else q.combo = 1;
    return q;
  });

  // Delivery & Customer inputs
  const [pincode, setPincode] = useState(initialPincode || '110041');
  const [pincodeStatus, setPincodeStatus] = useState({ checked: false, deliverable: true, waitlistCount: 0, checking: false });
  const [waitlistJoined, setWaitlistJoined] = useState(false);
  const [waitlistLoading, setWaitlistLoading] = useState(false);

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [slot, setSlot] = useState('11 am – 2 pm');
  const [consent, setConsent] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' | 'cod'

  // Quote state from database RPC
  const [quoteData, setQuoteData] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  // Submission state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [orderConfirmed, setOrderConfirmed] = useState(null);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [paymentFailedOrClosed, setPaymentFailedOrClosed] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Prevent background scroll
  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = orig;
    };
  }, []);

  // Check pincode automatically on initial load or step change
  useEffect(() => {
    if (pincode.length === 6) {
      checkDeliveryPincode(pincode);
    }
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      if (step === 5) {
        setPlacedOrder(null);
      }
      onClose();
    }, 240);
  };

  const bQty = quantities.bites || 0;
  const mQty = quantities.mix || 0;
  const cQty = quantities.combo || 0;
  const totalItems = bQty + mQty + cQty;

  // Local estimate of subtotal
  const estimatedSubtotal = (bQty * bitesPrice) + (mQty * mixPrice) + (cQty * comboPrice);

  const updateQty = (key, delta) => {
    setQuoteData(null);
    setQuantities(prev => ({
      ...prev,
      [key]: Math.max(0, (prev[key] || 0) + delta)
    }));
  };

  // Check pincode with DB RPC
  const checkDeliveryPincode = async (pin) => {
    if (pin.length !== 6) return;
    setPincodeStatus(prev => ({ ...prev, checking: true }));
    setErrorMsg('');
    try {
      const portalClient = window.BroskiPortal ? window.BroskiPortal.getClient() : null;
      if (portalClient) {
        const { data, error } = await portalClient.rpc('check_pincode', { p_pincode: pin });
        if (error) throw error;
        setPincodeStatus({
          checked: true,
          deliverable: data?.deliverable || false,
          waitlistCount: data?.waitlist_count || 0,
          checking: false
        });
      } else {
        // Fallback check
        const isZoneA = pin === '110041';
        setPincodeStatus({
          checked: true,
          deliverable: isZoneA,
          waitlistCount: 0,
          checking: false
        });
      }
    } catch (e) {
      setPincodeStatus({
        checked: true,
        deliverable: pin === '110041',
        waitlistCount: 0,
        checking: false
      });
    }
  };

  // Handle Waitlist submission
  const handleJoinWaitlist = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanPhoneDigits = phone.replace(/\D/g, '');
    if (cleanPhoneDigits.length !== 10 || !/^[6-9][0-9]{9}$/.test(cleanPhoneDigits)) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!customerName.trim() || customerName.trim().length < 2) {
      setErrorMsg('Please enter your name.');
      return;
    }
    setWaitlistLoading(true);
    try {
      const portalClient = window.BroskiPortal ? window.BroskiPortal.getClient() : null;
      if (portalClient) {
        const { data, error } = await portalClient.rpc('join_waitlist', {
          p_phone: `+91${cleanPhoneDigits}`,
          p_name: customerName.trim(),
          p_pincode: pincode.trim(),
          p_consent: true
        });
        if (error) throw error;
        setWaitlistJoined(true);
        setPincodeStatus(prev => ({ ...prev, waitlistCount: data?.waitlist_count || (prev.waitlistCount + 1) }));
        window.BroskiPortal.trackGA('join_waitlist', { pincode });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Could not join waitlist. Please try again.');
    } finally {
      setWaitlistLoading(false);
    }
  };

  // Transition to step 4 Review (calls quote_order)
  const proceedToReview = async () => {
    setErrorMsg('');
    if (!customerName.trim() || customerName.trim().length < 2) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    const cleanPhoneDigits = phone.replace(/\D/g, '');
    if (cleanPhoneDigits.length !== 10 || !/^[6-9][0-9]{9}$/.test(cleanPhoneDigits)) {
      setErrorMsg('Please enter a valid 10-digit mobile number (e.g. 85XXXXXXXX).');
      return;
    }
    if (address.trim().length < 10) {
      setErrorMsg('Please enter your complete address (at least 10 characters).');
      return;
    }
    if (!consent) {
      setErrorMsg('Please agree to receive order and delivery updates.');
      return;
    }

    setQuoteLoading(true);
    try {
      const portalClient = window.BroskiPortal ? window.BroskiPortal.getClient() : null;
      if (portalClient) {
        const { data, error } = await portalClient.rpc('quote_order', {
          p_phone: `+91${cleanPhoneDigits}`,
          p_pincode: pincode.trim(),
          p_items: { bites: bQty, mix: mQty, combo: cQty }
        });
        if (error) throw error;
        setQuoteData(data);
        if (window.BroskiPortal) {
          window.BroskiPortal.trackGA('add_shipping_info', { total: data.total });
        }
      } else {
        setQuoteData({
          subtotal: estimatedSubtotal,
          delivery_fee: 0,
          total: estimatedSubtotal,
          sample_available: false
        });
      }
      setStep(4);
    } catch (err) {
      console.warn('[quote_order failed]', err);
      setQuoteData({
        subtotal: estimatedSubtotal,
        delivery_fee: 0,
        total: estimatedSubtotal,
        sample_available: false
      });
      setStep(4);
    } finally {
      setQuoteLoading(false);
    }
  };

  // Launch or retry Cashfree session for an existing order
  const launchCashfree = async (orderToPay) => {
    setErrorMsg('');
    setLoading(true);
    setPaymentFailedOrClosed(false);

    try {
      const portalClient = window.BroskiPortal ? window.BroskiPortal.getClient() : null;
      if (!portalClient) throw new Error('Database connection not available.');

      const cfRes = await portalClient.rpc('create_cashfree_session', {
        p_public_no: orderToPay.publicNo,
        p_token: orderToPay.token
      });

      if (cfRes.error || !cfRes.data || cfRes.data.status !== 'ok' || !cfRes.data.payment_session_id) {
        console.warn('[Cashfree create session error]', cfRes);
        const msg = (cfRes.data && cfRes.data.message) || 'Could not initiate online payment. Please try again or choose Cash / UPI on delivery.';
        setErrorMsg(msg);
        setPaymentFailedOrClosed(true);
        setLoading(false);
        return;
      }

      const sessionId = cfRes.data.payment_session_id;

      if (!window.Cashfree) {
        throw new Error('Payment gateway SDK is still loading. Please try again in 5 seconds.');
      }

      const cf = window.Cashfree({ mode: 'production' });

      const onModalClosed = async () => {
        // Cashfree window closed - verify payment on Supabase backend
        let verifyData = null;
        try {
          const vRes = await portalClient.rpc('verify_cashfree_payment', {
            p_public_no: orderToPay.publicNo,
            p_token: orderToPay.token
          });
          verifyData = vRes.data;
        } catch (vErr) {
          console.warn('[verify_cashfree_payment error]', vErr);
        }

        if (verifyData && verifyData.payment_status === 'paid') {
          // Confirmed paid
          setOrderConfirmed({
            ...orderToPay,
            paidOnline: true,
            paymentStatus: 'paid'
          });
          setStep(5);
          setLoading(false);
        } else {
          // Not confirmed paid
          setLoading(false);
          setPaymentFailedOrClosed(true);
          setErrorMsg('');
        }
      };

      cf.checkout({
        paymentSessionId: sessionId,
        redirectTarget: '_modal'
      }).then(onModalClosed).catch(onModalClosed);
    } catch (err) {
      console.error('[launchCashfree error]', err);
      setErrorMsg(err.message || 'Payment initiation failed.');
      setPaymentFailedOrClosed(true);
      setLoading(false);
    }
  };

  // Switch an already placed order to pay at door without calling place_order again
  const handlePayAtDoorInstead = () => {
    if (!placedOrder) return;
    setErrorMsg('');
    setPaymentFailedOrClosed(false);
    setOrderConfirmed({
      ...placedOrder,
      paidOnline: false,
      paymentStatus: 'unpaid'
    });
    setStep(5);
  };

  // Submit Order (never calls place_order again if placedOrder exists)
  const handlePlaceOrder = async () => {
    setErrorMsg('');
    setLoading(true);

    // If order was already placed, never call place_order again
    if (placedOrder) {
      if (paymentMethod === 'online') {
        await launchCashfree(placedOrder);
      } else {
        handlePayAtDoorInstead();
      }
      return;
    }

    const cleanPhoneDigits = phone.replace(/\D/g, '');
    const cleanPhone = `+91${cleanPhoneDigits}`;

    try {
      const portalClient = window.BroskiPortal ? window.BroskiPortal.getClient() : null;
      let data = null, error = null;

      if (portalClient) {
        const res = await portalClient.rpc('place_order', {
          p_phone: cleanPhone,
          p_name: customerName.trim(),
          p_pincode: pincode.trim(),
          p_address: address.trim(),
          p_landmark: landmark.trim(),
          p_slot: slot,
          p_items: { bites: bQty, mix: mQty, combo: cQty },
          p_consent: true
        });
        data = res.data;
        error = res.error;
      }

      if (error) throw error;
      if (data && data.status !== 'ok') {
        throw new Error(data.message || 'Could not place order. Please try again.');
      }

      const publicNo = data?.public_no || 'BRK-ORDER';
      const token = data?.token || '';
      const orderTotal = data?.total || estimatedSubtotal;
      const customerCode = data?.customer_code || '';

      // Save to localStorage recent orders
      try {
        const stored = JSON.parse(localStorage.getItem('broski_recent_orders') || '[]');
        stored.unshift({ no: publicNo, t: token, total: orderTotal, date: new Date().toISOString() });
        localStorage.setItem('broski_recent_orders', JSON.stringify(stored.slice(0, 10)));
      } catch (_) {}

      // GA4 Purchase Event (strictly no PII)
      try {
        if (window.BroskiPortal) {
          window.BroskiPortal.trackGA('purchase', {
            total: orderTotal,
            items_count: totalItems
          });
        }
      } catch (_) {}

      // WhatsApp fallback message for optional button
      const waMsg = `Hi BROSKI! I placed order ${publicNo} for ₹${orderTotal}. Delivery to Nangloi (${slot}).`;
      const waNum = (cfg.WHATSAPP_NUMBER || '').toString().replace(/\D/g, '');
      const waUrl = waNum ? `https://wa.me/${waNum}?text=${encodeURIComponent(waMsg)}` : '#';

      const newOrder = {
        publicNo,
        token,
        customerCode,
        total: orderTotal,
        subtotal: data?.subtotal || estimatedSubtotal,
        sampleAdded: data?.sample_added || false,
        slot,
        address: address.trim(),
        pincode: pincode.trim(),
        waUrl
      };

      setPlacedOrder(newOrder);

      if (paymentMethod === 'online') {
        await launchCashfree(newOrder);
      } else {
        setOrderConfirmed({
          ...newOrder,
          paidOnline: false,
          paymentStatus: 'unpaid'
        });
        setStep(5); // Done screen
        setLoading(false);
      }
    } catch (err) {
      console.error('[place_order failed]', err);
      setErrorMsg(err.message || "Couldn't save your order. Please try again or WhatsApp us.");
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (orderConfirmed?.customerCode) {
      try {
        navigator.clipboard.writeText(orderConfirmed.customerCode).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }).catch(() => {});
      } catch (_) {}
    }
  };

  return (
    <div
      className={`bk-gateway-overlay ${isClosing ? 'bk-gateway-closing' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget && step !== 5) handleClose();
      }}
    >
      <div className="bk-gateway-modal" role="dialog" aria-modal="true" aria-labelledby="bk-checkout-title">
        {/* Header */}
        <div className="bk-gateway-header">
          <div>
            <span className="bk-gateway-badge">BROSKI · NANGLOI</span>
            <h2 id="bk-checkout-title">
              {step === 5 ? 'Order Confirmed ✅' : "Order your Bro's crunch"}
            </h2>
          </div>
          <button
            type="button"
            className="bk-gateway-close"
            onClick={handleClose}
            aria-label="Close checkout"
          >
            ✕
          </button>
        </div>

        {/* Stepper Progress Bar (Steps 1 to 4) */}
        {step < 5 && (
          <div className="bk-stepper">
            <div className={`bk-step-node ${step >= 1 ? 'active' : ''}`}>1. Packs</div>
            <div className="bk-step-line" />
            <div className={`bk-step-node ${step >= 2 ? 'active' : ''}`}>2. Pincode</div>
            <div className="bk-step-line" />
            <div className={`bk-step-node ${step >= 3 ? 'active' : ''}`}>3. Details</div>
            <div className="bk-step-line" />
            <div className={`bk-step-node ${step >= 4 ? 'active' : ''}`}>4. Review</div>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="bk-gateway-body">
          {errorMsg && (
            <div className="bk-gateway-alert" role="alert">
              {errorMsg}
            </div>
          )}

          {/* STEP 1: PACKS */}
          {step === 1 && (
            <div className="bk-gateway-step">
              <p className="bk-gateway-step-desc">
                Choose your crunchy dog biscuits. Free delivery across Nangloi (110041).
              </p>

              <div className="bk-pack-selector">
                {/* Bro Bites */}
                <div className="bk-pack-row">
                  <div className="bk-pack-info">
                    <strong>Bro Bites – Classic Crunch</strong>
                    <span className="bk-pack-sub">Yellow 400 g · ₹{bitesPrice}</span>
                  </div>
                  <div className="bk-stepper-ctrl">
                    <button
                      type="button"
                      onClick={() => updateQty('bites', -1)}
                      disabled={bQty <= 0}
                      aria-label="Decrease Bro Bites"
                    >−</button>
                    <span>{bQty}</span>
                    <button
                      type="button"
                      onClick={() => updateQty('bites', 1)}
                      disabled={bQty >= 20}
                      aria-label="Increase Bro Bites"
                    >+</button>
                  </div>
                </div>

                {/* Bro Mix */}
                <div className="bk-pack-row">
                  <div className="bk-pack-info">
                    <strong>Bro Mix – Happy Mix</strong>
                    <span className="bk-pack-sub">White 400 g · ₹{mixPrice}</span>
                  </div>
                  <div className="bk-stepper-ctrl">
                    <button
                      type="button"
                      onClick={() => updateQty('mix', -1)}
                      disabled={mQty <= 0}
                      aria-label="Decrease Bro Mix"
                    >−</button>
                    <span>{mQty}</span>
                    <button
                      type="button"
                      onClick={() => updateQty('mix', 1)}
                      disabled={mQty >= 20}
                      aria-label="Increase Bro Mix"
                    >+</button>
                  </div>
                </div>

                {/* Bro Combo */}
                <div className="bk-pack-row bk-pack-row--highlight">
                  <div className="bk-pack-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong>Bro Combo</strong>
                      <span className="bk-save-badge">10% off</span>
                    </div>
                    <span className="bk-pack-sub">1 Bites + 1 Mix (800 g) · ₹{comboPrice}</span>
                  </div>
                  <div className="bk-stepper-ctrl">
                    <button
                      type="button"
                      onClick={() => updateQty('combo', -1)}
                      disabled={cQty <= 0}
                      aria-label="Decrease Combo"
                    >−</button>
                    <span>{cQty}</span>
                    <button
                      type="button"
                      onClick={() => updateQty('combo', 1)}
                      disabled={cQty >= 20}
                      aria-label="Increase Combo"
                    >+</button>
                  </div>
                </div>
              </div>

              <div className="bk-notice-card">
                🐶 <strong>Nangloi Express Delivery:</strong> Free delivery — pay Online via Cashfree (UPI, Cards & NetBanking) or Cash/UPI at your door.
              </div>
            </div>
          )}

          {/* STEP 2: PINCODE CHECK */}
          {step === 2 && (
            <div className="bk-gateway-step">
              <label className="bk-input-label" htmlFor="chkPincode">
                Enter your 6-digit Delhi Pincode
              </label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                <input
                  id="chkPincode"
                  type="text"
                  className="bk-input"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setPincode(val);
                    setQuoteData(null);
                    if (val.length === 6) {
                      checkDeliveryPincode(val);
                    } else {
                      setPincodeStatus({ checked: false, deliverable: false, waitlistCount: 0, checking: false });
                    }
                  }}
                  placeholder="110041"
                />
                <button
                  type="button"
                  className="bk-btn-secondary"
                  onClick={() => checkDeliveryPincode(pincode)}
                  disabled={pincode.length !== 6 || pincodeStatus.checking}
                >
                  {pincodeStatus.checking ? 'Checking…' : 'Check'}
                </button>
              </div>

              {pincodeStatus.checked && (
                pincodeStatus.deliverable ? (
                  <div className="bk-deliverable-alert">
                    <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>
                      ✅ We deliver here!
                    </div>
                    <p style={{ margin: 0, fontSize: '13.5px' }}>
                      Nangloi Express delivery · Arrives today or tomorrow · Delivery Fee: <strong>FREE</strong>
                    </p>
                  </div>
                ) : (
                  <div className="bk-waitlist-box">
                    <div style={{ fontWeight: '700', fontSize: '15px', color: '#b8452b', marginBottom: '6px' }}>
                      🐾 Arriving soon in {pincode}!
                    </div>
                    <p style={{ fontSize: '13.5px', margin: '0 0 12px' }}>
                      {pincodeStatus.waitlistCount > 0
                        ? `${pincodeStatus.waitlistCount} neighbours are waiting. We unlock an area at 25 sign-ups.`
                        : 'Be the first to request BROSKI in your area. We unlock delivery at 25 sign-ups.'}
                    </p>

                    {waitlistJoined ? (
                      <div className="bk-waitlist-success">
                        🎉 <strong>You're on the waitlist!</strong> We will message you on WhatsApp the moment delivery opens in {pincode}.
                      </div>
                    ) : (
                      <form onSubmit={handleJoinWaitlist} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input
                          type="text"
                          className="bk-input"
                          placeholder="Your Name"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          required
                        />
                        <div className="bk-phone-group">
                          <span className="bk-phone-prefix">+91</span>
                          <input
                            type="tel"
                            className="bk-input"
                            placeholder="WhatsApp Number (10 digits)"
                            maxLength={10}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          className="bk-btn-primary"
                          disabled={waitlistLoading}
                        >
                          {waitlistLoading ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                              <LoadingSpinner size={16} /> Joining…
                            </span>
                          ) : (
                            `Join ${pincode} Waitlist`
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                )
              )}
            </div>
          )}

          {/* STEP 3: DETAILS */}
          {step === 3 && (
            <div className="bk-gateway-step">
              <div className="bk-form-field">
                <label className="bk-input-label" htmlFor="custName">Full Name *</label>
                <input
                  id="custName"
                  type="text"
                  className="bk-input"
                  placeholder="e.g. Rahul / Priya Sharma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>

              <div className="bk-form-field">
                <label className="bk-input-label" htmlFor="custPhone">WhatsApp Number *</label>
                <div className="bk-phone-group">
                  <span className="bk-phone-prefix">+91</span>
                  <input
                    id="custPhone"
                    type="tel"
                    className="bk-input"
                    placeholder="85XXXXXXXX"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    required
                  />
                </div>
              </div>

              <div className="bk-form-field">
                <label className="bk-input-label" htmlFor="custAddress">
                  Complete Address in Nangloi (110041) *
                </label>
                <textarea
                  id="custAddress"
                  className="bk-input"
                  rows={3}
                  placeholder="House / Flat No., Building, Street / Gali, Nangloi"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
                <span className="bk-field-hint">Between 10 and 300 characters</span>
              </div>

              <div className="bk-form-field">
                <label className="bk-input-label" htmlFor="custLandmark">Landmark (Optional)</label>
                <input
                  id="custLandmark"
                  type="text"
                  className="bk-input"
                  placeholder="Near Metro Station / Shiv Mandir / Park"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                />
              </div>

              <div className="bk-form-field">
                <label className="bk-input-label">Preferred Delivery Slot</label>
                <div className="bk-slot-group">
                  <label className={`bk-slot-chip ${slot === '11 am – 2 pm' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="slot"
                      value="11 am – 2 pm"
                      checked={slot === '11 am – 2 pm'}
                      onChange={() => setSlot('11 am – 2 pm')}
                    />
                    <span>☀️ 11 am – 2 pm</span>
                  </label>
                  <label className={`bk-slot-chip ${slot === '4 pm – 8 pm' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="slot"
                      value="4 pm – 8 pm"
                      checked={slot === '4 pm – 8 pm'}
                      onChange={() => setSlot('4 pm – 8 pm')}
                    />
                    <span>🌙 4 pm – 8 pm</span>
                  </label>
                </div>
              </div>

              <div className="bk-form-field">
                <label className="bk-input-label">Payment Option</label>
                <div className="bk-payment-options-group">
                  <label className={`bk-payment-card ${paymentMethod === 'online' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={() => setPaymentMethod('online')}
                    />
                    <div className="bk-payment-card-body">
                      <div className="bk-payment-card-title">
                        <span>⚡ Pay Online</span>
                        <span className="bk-payment-card-badge">Instant & Free</span>
                      </div>
                      <div className="bk-payment-card-desc">
                        UPI (PhonePe, Google Pay, Paytm), Debit/Credit Cards & NetBanking via Cashfree.
                      </div>
                      <div className="bk-online-icons">
                        <span className="bk-online-pill">PhonePe</span>
                        <span className="bk-online-pill">GPay</span>
                        <span className="bk-online-pill">Paytm</span>
                        <span className="bk-online-pill">Cards</span>
                      </div>
                    </div>
                  </label>

                  <label className={`bk-payment-card ${paymentMethod === 'cod' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                    />
                    <div className="bk-payment-card-body">
                      <div className="bk-payment-card-title">
                        <span>💵 Cash / UPI on Delivery</span>
                      </div>
                      <div className="bk-payment-card-desc">
                        Pay our delivery bro at your doorstep in Nangloi via Cash or scan any UPI QR.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <label className="bk-consent-label">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                <span>I agree that BROSKI saves my name, phone and address to deliver my order and send updates. I can ask for deletion at support@broskipetfood.com.</span>
              </label>
            </div>
          )}

          {/* STEP 4: REVIEW */}
          {step === 4 && (
            <div className="bk-gateway-step">
              {paymentFailedOrClosed && placedOrder && (
                <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px', color: '#92400e', fontSize: '13px', lineHeight: '1.45' }}>
                  <div>Payment not confirmed yet. If money was taken, it will show in a few minutes on your order page. If not, you can pay cash / UPI at the door.</div>
                  <div style={{ marginTop: '8px' }}>
                    <a
                      href={`/order/?no=${encodeURIComponent(placedOrder.publicNo)}&t=${encodeURIComponent(placedOrder.token)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#92400e', fontWeight: '700', textDecoration: 'underline' }}
                    >
                      Track order #{placedOrder.publicNo} ↗
                    </a>
                  </div>
                </div>
              )}
              <div className="bk-review-receipt">
                <div className="bk-review-header">Order Summary</div>
                {bQty > 0 && (
                  <div className="bk-review-row">
                    <span>Bro Bites (Classic Crunch) × {bQty}</span>
                    <span>₹{bQty * bitesPrice}</span>
                  </div>
                )}
                {mQty > 0 && (
                  <div className="bk-review-row">
                    <span>Bro Mix (Happy Mix) × {mQty}</span>
                    <span>₹{mQty * mixPrice}</span>
                  </div>
                )}
                {cQty > 0 && (
                  <div className="bk-review-row">
                    <span>Bro Combo (2 × 400 g) × {cQty}</span>
                    <span>₹{cQty * comboPrice}</span>
                  </div>
                )}

                {/* Free Sample line if available */}
                {quoteData?.sample_available && (
                  <div className="bk-review-row bk-sample-line">
                    <span>🎁 Free 50 g Taste Pack ({quoteData.sample_flavour === 'mix' ? 'Bro Mix' : 'Bro Bites'})</span>
                    <strong style={{ color: '#166534' }}>FREE</strong>
                  </div>
                )}

                <div className="bk-review-divider" />

                <div className="bk-review-row">
                  <span>Subtotal</span>
                  <span>₹{quoteData?.subtotal || estimatedSubtotal}</span>
                </div>
                <div className="bk-review-row">
                  <span>Delivery to {pincode}</span>
                  <span style={{ color: '#166534', fontWeight: '700' }}>FREE</span>
                </div>

                <div className="bk-review-total">
                  <span>Total Amount</span>
                  <span>₹{quoteData?.total || estimatedSubtotal}</span>
                </div>

                <div className="bk-review-details-box">
                  <div><strong>Deliver to:</strong> {customerName} · +91 {phone}</div>
                  <div><strong>Address:</strong> {address}{landmark ? `, Near ${landmark}` : ''}, {pincode === '110041' ? 'Nangloi' : 'West Delhi'} – {pincode}</div>
                  <div><strong>Slot:</strong> {slot}</div>
                  <div><strong>Payment:</strong> {paymentMethod === 'online' ? '⚡ Pay Online (Instant UPI / Cards via Cashfree)' : '💵 Cash / UPI on delivery'}</div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: DONE SCREEN */}
          {step === 5 && orderConfirmed && (
            <div className="bk-gateway-step bk-done-step">
              <div className="bk-done-icon">✅</div>
              <h3 className="bk-done-title">Order Confirmed!</h3>
              <div className="bk-order-num-pill">{orderConfirmed.publicNo}</div>

              {orderConfirmed.customerCode && (
                <div className="bk-customer-code-box">
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#886248' }}>
                    Your BROSKI Code (Save this for tracking & points)
                  </span>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <code className="bk-code-display">{orderConfirmed.customerCode}</code>
                    <button type="button" className="bk-copy-btn" onClick={handleCopyCode}>
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}

              {orderConfirmed.sampleAdded && (
                <div className="bk-sample-reward-banner">
                  🎁 <strong>Your free 50 g taste pack</strong> has been added to this delivery!
                </div>
              )}

              <div className="bk-done-summary">
                <p>We are packing your order in Nangloi. It will arrive during your selected slot: <strong>{orderConfirmed.slot}</strong>.</p>
                {orderConfirmed.paidOnline && orderConfirmed.paymentStatus === 'paid' ? (
                  <p style={{ color: '#166534', fontWeight: '600' }}>
                    ✅ Payment of ₹{orderConfirmed.total} received online.
                  </p>
                ) : orderConfirmed.paidOnline && orderConfirmed.paymentStatus !== 'paid' ? (
                  <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', padding: '10px 14px', margin: '10px 0', color: '#92400e', fontSize: '13px', lineHeight: '1.45' }}>
                    Payment not confirmed yet. If money was taken, it will show in a few minutes on your order page. If not, you can pay cash / UPI at the door.
                  </div>
                ) : (
                  <p>Payment of <strong>₹{orderConfirmed.total}</strong> is payable on delivery via Cash or UPI.</p>
                )}
              </div>

              <div className="bk-done-cta-group">
                <a
                  href={`/order/?no=${encodeURIComponent(orderConfirmed.publicNo)}&t=${encodeURIComponent(orderConfirmed.token)}`}
                  className="bk-btn-primary"
                  style={{ textDecoration: 'none', textAlign: 'center' }}
                >
                  Track Order / Get Confirmation Slip →
                </a>
                {orderConfirmed.waUrl && orderConfirmed.waUrl !== '#' && (
                  <a
                    href={orderConfirmed.waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bk-btn-secondary"
                    style={{ textDecoration: 'none', textAlign: 'center' }}
                  >
                    Questions? Message us on WhatsApp
                  </a>
                )}
                <button
                  type="button"
                  className="bk-btn-ghost"
                  onClick={handleClose}
                >
                  Back to Shop
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Bottom Action Bar (Steps 1 to 4) */}
        {step < 5 && (
          <div className="bk-gateway-footer">
            <div className="bk-footer-total">
              <span className="bk-total-label">Total ({totalItems} {totalItems === 1 ? 'pack' : 'packs'})</span>
              <span className="bk-total-amount">₹{quoteData?.total || estimatedSubtotal}</span>
            </div>

            {step === 1 && (
              <button
                type="button"
                className="bk-btn-primary"
                disabled={totalItems === 0}
                onClick={() => {
                  if (window.BroskiPortal) {
                    window.BroskiPortal.trackGA('begin_checkout', { total: estimatedSubtotal, items_count: totalItems });
                  }
                  setStep(2);
                }}
              >
                Continue to Pincode →
              </button>
            )}

            {step === 2 && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="bk-btn-back" onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button
                  type="button"
                  className="bk-btn-primary"
                  disabled={!pincodeStatus.checked || !pincodeStatus.deliverable}
                  onClick={() => setStep(3)}
                >
                  Continue to Details →
                </button>
              </div>
            )}

            {step === 3 && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="bk-btn-back" onClick={() => setStep(2)}>
                  ← Back
                </button>
                <button
                  type="button"
                  className="bk-btn-primary"
                  disabled={quoteLoading}
                  onClick={proceedToReview}
                >
                  {quoteLoading ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <LoadingSpinner size={16} /> Verifying…
                    </span>
                  ) : (
                    'Review Order →'
                  )}
                </button>
              </div>
            )}

            {step === 4 && (
              <div style={{ width: '100%' }}>
                {paymentFailedOrClosed && placedOrder ? (
                  <div style={{ display: 'flex', gap: '10px', width: '100%', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="bk-btn-secondary"
                      style={{ flex: 1, minWidth: '160px', padding: '12px 14px', fontSize: '13px' }}
                      onClick={handlePayAtDoorInstead}
                    >
                      Pay cash / UPI at door instead
                    </button>
                    <button
                      type="button"
                      className="bk-btn-primary bk-btn-place"
                      style={{ flex: 1, minWidth: '160px', padding: '12px 14px', fontSize: '13px' }}
                      disabled={loading}
                      onClick={() => launchCashfree(placedOrder)}
                    >
                      {loading ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <LoadingSpinner size={16} /> Opening…
                        </span>
                      ) : (
                        'Try paying again →'
                      )}
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="button" className="bk-btn-back" onClick={() => setStep(3)}>
                      ← Back
                    </button>
                    <button
                      type="button"
                      className="bk-btn-primary bk-btn-place"
                      disabled={loading}
                      onClick={handlePlaceOrder}
                    >
                      {loading ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <LoadingSpinner size={18} /> {paymentMethod === 'online' ? 'Opening Payment…' : 'Placing Order…'}
                        </span>
                      ) : (
                        paymentMethod === 'online'
                          ? `Pay Online Now (₹${quoteData?.total || estimatedSubtotal}) →`
                          : `Place Order (₹${quoteData?.total || estimatedSubtotal})`
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
