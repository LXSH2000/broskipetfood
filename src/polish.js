// BROSKI polish.js – scroll reveals, marquee, progress line, WhatsApp bubble manners.
// No libraries. Import once at the end of src/main.jsx:  import './polish.js';
(function () {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
  const html = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Desktop already reveals these with GSAP (src/motion.js) – don't animate them twice.
  const gsapDesktop = !reduce && matchMedia('(min-width: 800px) and (hover: hover) and (pointer: fine)').matches;
  const GSAP_OWNED = '.story-copy, .ritual-grid article, .faq, .newsletter, .everyday-editorial > div';

  const REVEAL = [
    '.bk-shop-head', '.bk-pcard', '.bk-shop__unit', '.bk-pin', '.bk-fresh-item', '.bk-partner', '.bk-h-foot',
    '.ritual > .eyebrow', '.ritual > h2', '.photo-note', '.hero-end',
    GSAP_OWNED,
  ].join(',');
  const IMAGES = '.bk-pcard__img, .story-photo';

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('pz-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

  const seen = new WeakSet();
  function tag(root) {
    root.querySelectorAll(REVEAL).forEach((el) => {
      if (seen.has(el)) return;
      seen.add(el);
      if (gsapDesktop && el.matches(GSAP_OWNED)) return;
      // stagger siblings of the same kind (cards in a row, the three info tiles…)
      const sibs = el.parentElement ? [...el.parentElement.children].filter((c) => c.className === el.className) : [el];
      el.style.setProperty('--pz-i', Math.min(sibs.indexOf(el), 4));
      el.setAttribute('data-pz', '');
      io.observe(el);
    });
    root.querySelectorAll(IMAGES).forEach((el) => {
      if (seen.has(el)) return;
      seen.add(el);
      el.setAttribute('data-pz-img', '');
      io.observe(el);
    });
  }

  function marquee() {
    const t = document.querySelector('.ticker');
    if (!t || t.classList.contains('pz-marquee') || reduce) return;
    const track = document.createElement('div');
    track.className = 'pz-track';
    [...t.childNodes].forEach((n) => track.appendChild(n));
    const copy = track.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    const copy2 = copy.cloneNode(true);
    t.append(track, copy, copy2);
    t.classList.add('pz-marquee');
  }

  function progress() {
    if (reduce || document.querySelector('.pz-progress')) return;
    const bar = document.createElement('div');
    bar.className = 'pz-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
  }

  // Elements the WhatsApp bubble must never sit on top of
  const KEEP_CLEAR = '.bk-pin__btn, .bk-partner .bk-h-btn, .email-field button, .hero-cta a, .bk-h-btn--order, .video-story-actions > *, .bk-h-foot a';
  let frame = 0;
  function onScroll() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const max = html.scrollHeight - innerHeight;
      html.style.setProperty('--pz-p', max > 0 ? (scrollY / max).toFixed(4) : 0);
      const wa = document.querySelector('.whatsapp-float');
      if (!wa) return;
      const w = wa.getBoundingClientRect();
      const pad = 8;
      let hit = false;
      document.querySelectorAll(KEEP_CLEAR).forEach((el) => {
        if (hit) return;
        const r = el.getBoundingClientRect();
        if (r.width && r.right > w.left - pad && r.left < w.right + pad && r.bottom > w.top - pad && r.top < w.bottom + pad) hit = true;
      });
      wa.classList.toggle('pz-away', hit);
    });
  }

  function start() {
    const root = document.getElementById('root') || document.body;
    html.classList.add('pz-on');
    tag(root);
    marquee();
    progress();
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll, { passive: true });
    // React may render sections a moment later – pick those up as well
    let t = 0;
    new MutationObserver(() => { clearTimeout(t); t = setTimeout(() => { tag(root); marquee(); }, 80); })
      .observe(root, { childList: true, subtree: true });
    // Safety net: if anything is still hidden after 6 s on screen, show it
    setTimeout(() => document.querySelectorAll('[data-pz]:not(.pz-in), [data-pz-img]:not(.pz-in)').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) el.classList.add('pz-in');
    }), 6000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => requestAnimationFrame(start));
  else requestAnimationFrame(start);
})();
