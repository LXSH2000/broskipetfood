/**
 * BROSKI Customer Portal & Orders Shared Utility
 * Follows strict privacy & design rules:
 * - Public address: "Nangloi, West Delhi – 110041"
 * - No personal data (phone, name, code) sent to GA4
 * - Safe device UUID in localStorage
 * - WhatsApp or email fallback
 */

(function () {
  window.BroskiPortal = {
    // 1. Light database helper (~2 KB) instead of full 211 KB Supabase library
    client: null,
    getClient: function () {
      if (this.client) return this.client;
      const cfg = window.BROSKI_CONFIG || {};
      const url = cfg.SUPABASE_URL, key = cfg.SUPABASE_ANON_KEY;
      this.client = {
        rpc: async (fn, args) => {
          try {
            const r = await fetch(`${url}/rest/v1/rpc/${fn}`, {
              method: 'POST',
              headers: {
                apikey: key,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(args || {})
            });
            const body = await r.json().catch(() => null);
            if (!r.ok) {
              console.warn('[BROSKI rpc]', fn, r.status, body);
              return { data: null, error: body || { message: r.statusText } };
            }
            return { data: body, error: null };
          } catch (e) {
            console.warn('[BROSKI rpc]', fn, 'network_error', e.message);
            return { data: null, error: { message: e.message } };
          }
        }
      };
      return this.client;
    },

    // 2. Safe random UUID stored in localStorage for device tracking
    getDeviceId: function () {
      const KEY = 'broski_device_id';
      let id = null;
      try {
        id = localStorage.getItem(KEY);
        if (!id) {
          if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
            id = crypto.randomUUID();
          } else {
            id = 'dev-' + Math.random().toString(36).substring(2, 15) + '-' + Date.now().toString(36);
          }
          localStorage.setItem(KEY, id);
        }
      } catch (e) {
        // Fallback for sandboxed / cookies disabled
        id = 'sess-' + Math.random().toString(36).substring(2, 10);
      }
      return id;
    },

    // 3. Traffic source tracking (UTM or ?src=)
    getSource: function () {
      try {
        const params = new URLSearchParams(window.location.search);
        const src = params.get('src') || params.get('utm_source');
        const camp = params.get('utm_campaign');
        if (src && camp) return `${src}_${camp}`.slice(0, 80);
        if (src) return src.slice(0, 80);
        if (document.referrer) {
          try {
            const refHost = new URL(document.referrer).hostname;
            if (refHost && !refHost.includes('broskipetfood.com')) {
              return ('ref_' + refHost).slice(0, 80);
            }
          } catch (_) {}
        }
      } catch (e) {}
      return 'direct';
    },

    // 4. Safe GA4 & optional Meta Pixel tracking: STRICTLY NO PHONE, NO NAME, NO CODE
    _metaInitDone: false,
    initMetaPixel: function () {
      try {
        if (this._metaInitDone) return;
        const p = (window.location && window.location.pathname) || '';
        if (/^\/(admin|doc|preview)(\/|$)/i.test(p)) return;
        // Skip re-init if the official <head> Meta Pixel snippet is already active
        if (typeof window.fbq === 'function') {
          this._metaInitDone = true;
          return;
        }
        const pid = ((window.BROSKI_CONFIG && window.BROSKI_CONFIG.META_PIXEL_ID) || '').toString().trim();
        if (!/^\d{10,20}$/.test(pid)) return;
        this._metaInitDone = true;
        !function (f, b, e, v, n, t, s) {
          if (f.fbq) return; n = f.fbq = function () {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
          };
          if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
          n.queue = []; t = b.createElement(e); t.async = !0; t.src = v;
          s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
        }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
        window.fbq('init', pid);
        window.fbq('track', 'PageView');
      } catch (_) {}
    },
    trackMeta: function (eventName, params) {
      try {
        this.initMetaPixel();
        if (typeof window.fbq !== 'function') return;
        const std = ['PageView', 'ViewContent', 'Lead', 'InitiateCheckout', 'AddPaymentInfo', 'Purchase'];
        window.fbq(std.includes(eventName) ? 'track' : 'trackCustom', eventName, params || {});
      } catch (_) {}
    },
    trackGA: function (eventName, params) {
      try {
        // Whitelist safe parameters only (strictly zero PII)
        const safeParams = {
          source: (params && params.source) || this.getSource(),
          page_location: window.location.href,
          page_path: window.location.pathname
        };
        if (params && params.flavour) safeParams.flavour = String(params.flavour).slice(0, 40);
        if (params && params.channel) safeParams.channel = String(params.channel).slice(0, 40);
        if (params && params.payment_type) safeParams.payment_type = String(params.payment_type).slice(0, 30);
        if (params && params.transaction_id) safeParams.transaction_id = String(params.transaction_id).slice(0, 40);
        if (params && typeof params.rating === 'number') safeParams.rating = params.rating;
        if (params && typeof params.items_count === 'number') safeParams.items_count = params.items_count;
        const numVal = (params && typeof params.value === 'number')
          ? params.value
          : (params && typeof params.total === 'number' ? params.total : null);
        if (numVal !== null) {
          safeParams.value = numVal;
          safeParams.total = numVal;
          safeParams.currency = (params && params.currency) || 'INR';
        }
        if (params && Array.isArray(params.items)) {
          safeParams.items = params.items.slice(0, 10).map((it) => ({
            item_id: String(it.item_id || '').slice(0, 40),
            item_name: String(it.item_name || '').slice(0, 80),
            price: Number(it.price || 0),
            quantity: Number(it.quantity || 1)
          }));
        }

        if (typeof window.gtag === 'function') {
          window.gtag('event', eventName, safeParams);
        }

        // Mirror commerce & lead signals to Meta Pixel when configured
        if (eventName === 'begin_checkout') {
          this.trackMeta('InitiateCheckout', {
            value: numVal || 0,
            currency: 'INR',
            num_items: safeParams.items_count || 1
          });
        } else if (eventName === 'add_payment_info') {
          this.trackMeta('AddPaymentInfo', {
            value: numVal || 0,
            currency: 'INR'
          });
        } else if (eventName === 'purchase') {
          this.trackMeta('Purchase', {
            value: numVal || 0,
            currency: 'INR',
            num_items: safeParams.items_count || 1,
            order_id: safeParams.transaction_id || undefined
          });
        } else if (eventName === 'sample_claim_success') {
          this.trackMeta('Lead', { content_name: safeParams.flavour || '50g-sample' });
        } else if (eventName === 'feedback_submit') {
          this.trackMeta('FeedbackSubmit', { rating: safeParams.rating });
        }
      } catch (err) {
        // Analytics failure should never break UI
      }
    },

    // 5. Clean 10-digit Indian mobile number with +91 prefix (must start with 6-9)
    normalizePhone: function (raw) {
      if (!raw) return '';
      const digits = raw.toString().replace(/\D/g, '');
      const last10 = digits.slice(-10);
      return (last10.length === 10 && /^[6-9][0-9]{9}$/.test(last10)) ? `+91${last10}` : '';
    },

    // Validate 6-digit Indian pincode
    validatePincode: function (raw) {
      if (!raw) return false;
      const digits = raw.toString().replace(/\D/g, '');
      return digits.length === 6 && /^[1-9][0-9]{5}$/.test(digits);
    },

    // 6. WhatsApp or email fallback helper
    getContactAction: function (messageText, subject) {
      const cfg = window.BROSKI_CONFIG || {};
      const num = (cfg.WHATSAPP_NUMBER || '').toString().replace(/\D/g, '');
      const email = cfg.EMAIL || 'support@broskipetfood.com';

      if (num && num.length >= 10) {
        return {
          type: 'whatsapp',
          url: `https://wa.me/${num}?text=${encodeURIComponent(messageText)}`,
          label: 'Send on WhatsApp'
        };
      } else {
        const sub = encodeURIComponent(subject || 'BROSKI Customer Request');
        const body = encodeURIComponent(messageText);
        return {
          type: 'email',
          url: `mailto:${email}?subject=${sub}&body=${body}`,
          label: 'Send via Email'
        };
      }
    }
  };

  // Subpage mobile menu toggler (idempotent)
  function initNav() {
    var btn = document.querySelector('.bk-menu-btn');
    var nav = document.querySelector('.bk-nav');
    if (!btn || !nav || btn.dataset.bound) return;
    btn.dataset.bound = 'true';

    function closeNav() {
      nav.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    }

    function toggleNav(e) {
      if (e) e.stopPropagation();
      var isOpen = nav.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }

    btn.addEventListener('click', toggleNav);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        closeNav();
        btn.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (nav.classList.contains('is-open') && !nav.contains(e.target) && !btn.contains(e.target)) {
        closeNav();
      }
    });

    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeNav);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initNav();
      window.BroskiPortal?.initMetaPixel();
    });
  } else {
    initNav();
    window.BroskiPortal?.initMetaPixel();
  }
})();
