import React, { useCallback, useEffect, useRef, useState } from 'react';
import BroskiWordmark from '../BroskiWordmark.jsx';
import { BONE_SLOTS, SLIDES } from './slidesData.js';

function BoneSvg({ color, className, style, blurred }) {
  return (
    <svg
      className={`${className}${blurred ? ' pv-bone--blur' : ''}`}
      style={{ color, ...style }}
      viewBox="0 0 100 48"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M27 10C15-9-7 9 7 23-7 40 17 57 28 37h43c12 20 35 2 22-14C108 8 84-9 73 10Z" />
    </svg>
  );
}

export default function HeroSlider({
  activeIdx,
  onChangeSlide,
  onOrderSlide,
  onOpenWatchAd,
  modalOpen
}) {
  const heroRef = useRef(null);
  const tabsWrapRef = useRef(null);
  const tabBtnRefs = useRef([]);
  const [prevIdx, setPrevIdx] = useState(null);
  const [inView, setInView] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [underline, setUnderline] = useState({ x: 0, w: 68 });
  const pauseUntilRef = useRef(0);
  const touchRef = useRef({ x: 0, y: 0, active: false });
  const transitionTimerRef = useRef(null);

  const reducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const triggerSlide = useCallback((nextIdx, manual = true) => {
    const normalized = ((nextIdx % SLIDES.length) + SLIDES.length) % SLIDES.length;
    if (normalized === activeIdx) return;

    if (manual) {
      pauseUntilRef.current = Date.now() + 6000;
    }

    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);

    if (reducedMotion) {
      setPrevIdx(null);
      onChangeSlide(normalized);
      return;
    }

    setPrevIdx(activeIdx);
    onChangeSlide(normalized);
    transitionTimerRef.current = setTimeout(() => {
      setPrevIdx(null);
    }, 1420);
  }, [activeIdx, onChangeSlide, reducedMotion]);

  // Measure active tab underline with compositor transform only
  const syncUnderline = useCallback(() => {
    const wrap = tabsWrapRef.current;
    const activeBtn = tabBtnRefs.current[activeIdx];
    if (!wrap || !activeBtn) return;
    const wr = wrap.getBoundingClientRect();
    const br = activeBtn.getBoundingClientRect();
    setUnderline({
      x: br.left - wr.left,
      w: br.width
    });
  }, [activeIdx]);

  useEffect(() => {
    syncUnderline();
    window.addEventListener('resize', syncUnderline, { passive: true });
    return () => window.removeEventListener('resize', syncUnderline);
  }, [syncUnderline]);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, []);

  // Track hero visibility for autoplay + arrow-key guard
  useEffect(() => {
    const el = heroRef.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting && entry.intersectionRatio >= 0.2),
      { threshold: [0, 0.2, 0.5] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Arrow keys only when hero is in view and no modal open
  useEffect(() => {
    const onKeyDown = (e) => {
      if (!inView || modalOpen) return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        triggerSlide(activeIdx + 1, true);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        triggerSlide(activeIdx - 1, true);
      } else if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIdx, inView, modalOpen, menuOpen, triggerSlide]);

  // Autoplay every 3.4s when visible, tab active, not reduced motion, no modal open
  useEffect(() => {
    if (reducedMotion || !inView || modalOpen || menuOpen) return;
    const tick = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() < pauseUntilRef.current) return;
      triggerSlide(activeIdx + 1, false);
    }, 3400);
    return () => clearInterval(tick);
  }, [activeIdx, inView, modalOpen, menuOpen, reducedMotion, triggerSlide]);

  const onTouchStart = (e) => {
    if (!e.touches || e.touches.length !== 1) return;
    touchRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      active: true
    };
  };

  const onTouchEnd = (e) => {
    if (!touchRef.current.active || !e.changedTouches?.[0]) return;
    const dx = e.changedTouches[0].clientX - touchRef.current.x;
    const dy = e.changedTouches[0].clientY - touchRef.current.y;
    touchRef.current.active = false;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
      triggerSlide(dx < 0 ? activeIdx + 1 : activeIdx - 1, true);
    }
  };

  const currentSlide = SLIDES[activeIdx];

  return (
    <section
      ref={heroRef}
      className="pv-hero"
      aria-label="BROSKI featured treats slider"
      aria-roledescription="carousel"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Header overlaid cleanly on hero */}
      <header className="pv-header">
        <a href="/preview/" className="pv-logo" aria-label="BROSKI home preview">
          <BroskiWordmark height={26} />
        </a>

        <div className="pv-tabs-shell">
          <div
            ref={tabsWrapRef}
            className="pv-tabs"
            role="tablist"
            aria-label="Select treat flavour"
          >
            {SLIDES.map((s, idx) => (
              <button
                key={s.id}
                ref={(el) => { tabBtnRefs.current[idx] = el; }}
                type="button"
                role="tab"
                aria-selected={idx === activeIdx}
                className={`pv-tab ${idx === activeIdx ? 'is-active' : ''}`}
                onClick={() => triggerSlide(idx, true)}
              >
                {s.tab}
              </button>
            ))}
            <span
              className="pv-tab-underline"
              aria-hidden="true"
              style={{
                transform: `translateX(${underline.x}px) scaleX(${underline.w / 100})`
              }}
            />
          </div>
        </div>

        <div className="pv-header-right">
          {currentSlide.orderTarget === 'sample' ? (
            <a
              href="/sample/?utm_source=site&utm_medium=hero_header"
              className="pv-order-pill"
              aria-label="Claim free 50 g taste pack"
            >
              Order now
            </a>
          ) : (
            <button
              type="button"
              className="pv-order-pill"
              onClick={() => onOrderSlide(currentSlide.orderTarget)}
              aria-label={`Order ${currentSlide.tab} now`}
            >
              Order now
            </button>
          )}

          <button
            type="button"
            className="pv-mobile-menu-btn"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="pv-mobile-nav"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {menuOpen
                ? <path d="m6 6 12 12M6 18 18 6" />
                : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <nav id="pv-mobile-nav" className="pv-mobile-drawer" aria-label="Mobile navigation">
            <a href="#shop" onClick={() => setMenuOpen(false)}>Shop</a>
            <a href="/sample/" onClick={() => setMenuOpen(false)}>Free sample</a>
            <a href="/points/" onClick={() => setMenuOpen(false)}>Track order / My points</a>
            <a href="#story" onClick={() => setMenuOpen(false)}>Our story</a>
            <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
          </nav>
        )}
      </header>

      {/* Stacked slides */}
      <div className="pv-slides">
        {SLIDES.map((s, idx) => {
          const isCurrent = idx === activeIdx;
          const isLeaving = idx === prevIdx;
          const isEntering = isCurrent && prevIdx !== null;
          if (!isCurrent && !isLeaving) return null;

          const stateClass = isLeaving
            ? 'is-leaving'
            : isEntering
              ? 'is-current is-entering'
              : 'is-current';

          return (
            <div
              key={s.id}
              className={`pv-slide ${stateClass}`}
              style={{ '--slide-bg': s.backdrop }}
              aria-hidden={!isCurrent}
            >
              <div className="pv-slide-bg" />

              {/* Layer 1: Giant white word behind pouch */}
              <div className="pv-layer pv-layer-word" aria-hidden="true">
                <span className="pv-giant-word">{s.word}</span>
              </div>

              {/* Layer 2: Soft oval floor shadow */}
              <div className="pv-layer pv-layer-shadow" aria-hidden="true">
                <div className="pv-floor-shadow" />
              </div>

              {/* Layer 3: Cut-out pouch */}
              <div className="pv-layer pv-layer-pouch">
                <div className={`pv-pouch-stage ${s.pouch2 ? 'is-combo' : ''}`}>
                  <img
                    src={s.pouch}
                    alt={s.pouch2 ? 'BROSKI Bro Mix 400 g cut-out pouch' : s.pouchAlt}
                    className="pv-pouch-img"
                    decoding="async"
                    fetchPriority={idx === 0 ? 'high' : 'auto'}
                  />
                  {s.pouch2 && (
                    <img
                      src={s.pouch2}
                      alt="BROSKI Bro Bites 400 g cut-out pouch"
                      className="pv-pouch-img pv-pouch-img--second"
                      decoding="async"
                    />
                  )}
                </div>
              </div>

              {/* Layer 4: Six inline SVG bone biscuits */}
              <div className="pv-layer pv-layer-biscuits" aria-hidden="true">
                {BONE_SLOTS.map((slot, bIdx) => (
                  <BoneSvg
                    key={bIdx}
                    color={s.bones[bIdx]}
                    className={slot.className}
                    blurred={slot.blurred}
                    style={{
                      '--bob-dur': slot.dur,
                      '--bob-delay': slot.delay
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Overlays */}
      <div className="pv-hero-overlays">
        {/* Right side outline slide number 01-04 (desktop/tablet) */}
        <div className="pv-outline-num" aria-hidden="true">
          {currentSlide.num}
        </div>

        {/* Bottom-left info stack: Price chip + Sample CTA + Watch ad */}
        <div className="pv-hero-bl">
          <div className="pv-price-chip" aria-label={`Selected product: ${currentSlide.tab}, ${currentSlide.priceLine}`}>
            <span className="pv-price-line">{currentSlide.priceLine}</span>
            <div className="pv-price-row">
              <strong className="pv-price-big">{currentSlide.bigPrice}</strong>
              <span className="pv-delivery-note">Free delivery in Nangloi · 110041</span>
            </div>
          </div>

          <div className="pv-hero-micro-actions">
            <a
              className="pv-chip-link"
              href="/sample/?utm_source=site&utm_medium=hero"
              aria-label="New here? Get a free 50 g taste pack"
              onClick={() => { try { window.BroskiAnalytics?.trackEvent('sample_cta_click', { place: 'hero' }); } catch {} }}
            >
              🎁 New here? Get a free 50 g taste pack →
            </a>
            <button
              type="button"
              className="pv-chip-btn"
              onClick={onOpenWatchAd}
              aria-label="Watch BROSKI launch ad video"
            >
              ▶ Watch launch ad
            </button>
          </div>
        </div>

        {/* Bottom controls bar: round arrows + SHOP THE CRUNCH */}
        <div className="pv-hero-bottom-bar">
          <button
            type="button"
            className="pv-arrow-btn"
            onClick={() => triggerSlide(activeIdx - 1, true)}
            aria-label="Previous flavour"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>

          <a
            href="#shop"
            className="pv-shop-jump"
            aria-label="Shop the crunch section"
          >
            SHOP THE CRUNCH ↓
          </a>

          <button
            type="button"
            className="pv-arrow-btn"
            onClick={() => triggerSlide(activeIdx + 1, true)}
            aria-label="Next flavour"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
