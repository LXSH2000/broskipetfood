/**
 * BROSKI Analytics & UTM Attribution Engine
 * Tracks visitor origins, campaign parameters (UTM), devices, and WhatsApp order conversions.
 * Automatically synchronizes with Google Analytics (GA4) and appends attribution to WhatsApp clicks.
 */
(function () {
  'use strict';

  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

  // 1. Parse UTM Parameters from URL
  function parseUrlParams() {
    var params = {};
    try {
      var search = window.location.search.substring(1);
      if (search) {
        var pairs = search.split('&');
        for (var i = 0; i < pairs.length; i++) {
          var pair = pairs[i].split('=');
          if (pair[0]) {
            params[decodeURIComponent(pair[0]).toLowerCase()] = decodeURIComponent(pair[1] || '');
          }
        }
      }
    } catch (e) {
      console.warn('[BroskiAnalytics] URL parse error:', e);
    }
    return params;
  }

  // 2. Detect Device & Environment
  function getDeviceInfo() {
    var ua = navigator.userAgent || '';
    var isMobile = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    var isTablet = /iPad|Tablet/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    var device = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';
    var tz = '';
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) {}

    return {
      device: device,
      screen: window.screen ? window.screen.width + 'x' + window.screen.height : 'unknown',
      timezone: tz,
      language: navigator.language || 'en'
    };
  }

  // 3. Store and Persist Attribution
  var urlParams = parseUrlParams();
  var capturedUtm = {};
  var hasUtm = false;

  for (var k = 0; k < UTM_KEYS.length; k++) {
    var key = UTM_KEYS[k];
    if (urlParams[key]) {
      capturedUtm[key] = urlParams[key];
      hasUtm = true;
      try {
        sessionStorage.setItem('bk_' + key, urlParams[key]);
      } catch (e) {}
    } else {
      try {
        var stored = sessionStorage.getItem('bk_' + key);
        if (stored) capturedUtm[key] = stored;
      } catch (e) {}
    }
  }

  // Capture referrer if no direct UTM
  var ref = document.referrer || '';
  if (!capturedUtm.utm_source && ref) {
    try {
      var refHost = new URL(ref).hostname;
      if (refHost && refHost !== window.location.hostname) {
        capturedUtm.utm_source = refHost;
        capturedUtm.utm_medium = 'referral';
        sessionStorage.setItem('bk_utm_source', refHost);
        sessionStorage.setItem('bk_utm_medium', 'referral');
      }
    } catch (e) {}
  }

  // First-touch persistence in localStorage
  try {
    if (!localStorage.getItem('bk_first_touch') && (hasUtm || ref)) {
      localStorage.setItem('bk_first_touch', JSON.stringify({
        utm: capturedUtm,
        referrer: ref,
        landing_page: window.location.pathname,
        timestamp: new Date().toISOString()
      }));
    }
  } catch (e) {}

  // 4. Global Analytics API
  window.BroskiAnalytics = {
    getUtmTags: function () {
      return Object.assign({}, capturedUtm);
    },
    getDeviceInfo: getDeviceInfo,
    getAttributionSummary: function () {
      var dev = getDeviceInfo();
      var src = capturedUtm.utm_source || 'direct';
      var camp = capturedUtm.utm_campaign ? ' / ' + capturedUtm.utm_campaign : '';
      return src + camp + ' (' + dev.device + ')';
    },
    trackEvent: function (eventName, eventParams) {
      var payload = Object.assign({}, capturedUtm, getDeviceInfo(), eventParams || {}, {
        page_path: window.location.pathname,
        page_title: document.title
      });

      // Dispatch to GA4 if initialized
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, payload);
      }

      // Log in dev / console
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('[BroskiAnalytics Event]', eventName, payload);
      }
    }
  };

  // Auto-track initial page view
  window.addEventListener('DOMContentLoaded', function () {
    window.BroskiAnalytics.trackEvent('page_view_custom', {
      landing_page: window.location.pathname
    });
  });

})();
