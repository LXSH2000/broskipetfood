/* BROSKI helpers for the static pages (/offers/, /r/, /privacy/, /terms/, etc.). No dependencies, ~2 KB.
   Markup hooks:
     <a data-wa="combo">          -> WhatsApp link with BROSKI_CONFIG.MSG.combo
     <a data-wa-text="Hi ...">    -> WhatsApp link with that exact text
     <span data-gstin>            -> " · GSTIN: <GSTIN>" if present, else empty
     <a data-email> / <span data-email-text> -> email link / text            */
(function () {
  var C = window.BROSKI_CONFIG || {};

  function wa(text) {
    var num = C.WHATSAPP_NUMBER || '';
    if (!num) return 'mailto:' + (C.EMAIL || 'support@broskipetfood.com');
    return 'https://wa.me/' + num + '?text=' + encodeURIComponent(text || '');
  }
  window.broskiWa = wa;

  function hydrate(root) {
    root = root || document;
    root.querySelectorAll('[data-wa],[data-wa-text]').forEach(function (a) {
      var key = a.getAttribute('data-wa');
      var text = a.getAttribute('data-wa-text') || (C.MSG && C.MSG[key]) || '';
      a.href = wa(text);
      a.target = '_blank';
      a.rel = 'noopener';
    });
    root.querySelectorAll('[data-email]').forEach(function (a) { a.href = 'mailto:' + C.EMAIL; if (!a.textContent.trim()) a.textContent = C.EMAIL; });
    root.querySelectorAll('[data-email-text]').forEach(function (s) { s.textContent = C.EMAIL; });
    root.querySelectorAll('[data-gstin]').forEach(function (s) {
      if (C.GSTIN && C.GSTIN.trim()) {
        s.textContent = ' · GSTIN: ' + C.GSTIN.trim();
        s.style.display = '';
      } else {
        s.textContent = '';
        s.style.display = 'none';
      }
    });
  }

  function banner() {
    if (!C.BANNER_TEXT || !C.BANNER_HIDE_FROM) return;
    if (Date.now() >= new Date(C.BANNER_HIDE_FROM).getTime()) return;      // auto-hide after the date
    try { if (localStorage.getItem('broski-banner-closed') === C.BANNER_HIDE_FROM) return; } catch (e) {}
    var bar = document.createElement('div');
    bar.className = 'bk-banner';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Launch offer');
    var p = document.createElement('p');
    p.textContent = C.BANNER_TEXT;
    var x = document.createElement('button');
    x.type = 'button';
    x.className = 'bk-banner__close';
    x.setAttribute('aria-label', 'Close offer banner');
    x.textContent = '×';
    x.onclick = function () {
      bar.remove();
      try { localStorage.setItem('broski-banner-closed', C.BANNER_HIDE_FROM); } catch (e) {}
    };
    bar.appendChild(p); bar.appendChild(x);
    document.body.insertBefore(bar, document.body.firstChild);
  }

  function ready() { banner(); hydrate(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
})();
