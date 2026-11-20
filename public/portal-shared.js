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
                Authorization: `Bearer ${key}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(args || {})
            });
            const body = await r.json().catch(() => null);
            return r.ok ? { data: body, error: null } : { data: null, error: body || { message: r.statusText } };
          } catch (e) {
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

    // 4. Safe GA4 event tracking: STRICTLY NO PHONE, NO NAME, NO CODE
    trackGA: function (eventName, params) {
      try {
        if (typeof window.gtag === 'function') {
          // Whitelist safe parameters only
          const safeParams = {
            source: (params && params.source) || this.getSource(),
            page_location: window.location.href,
            page_path: window.location.pathname
          };
          if (params && params.flavour) safeParams.flavour = params.flavour;
          if (params && params.channel) safeParams.channel = params.channel;
          if (params && typeof params.total === 'number') safeParams.total = params.total;
          if (params && typeof params.rating === 'number') safeParams.rating = params.rating;
          if (params && typeof params.items_count === 'number') safeParams.items_count = params.items_count;

          window.gtag('event', eventName, safeParams);
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
})();
