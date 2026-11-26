import React, { useEffect, useRef, useState } from 'react';
import { FLIP_STEPS, SLIDES, getFlipIngredients } from './slidesData.js';

export default function WhatsInsideFlip({ activeIdx }) {
  const sectionRef = useRef(null);
  const [stepIndex, setStepIndex] = useState(0);

  const cfg = (typeof window !== 'undefined' && window.BROSKI_CONFIG) || {};
  const products = cfg.PRODUCTS || [];
  const slide = SLIDES[activeIdx] || SLIDES[0];
  const stepData = FLIP_STEPS[stepIndex] || FLIP_STEPS[0];
  const ingredientsText = getFlipIngredients(slide.productKey, products);

  useEffect(() => {
    let raf = 0;
    const computeStep = () => {
      raf = 0;
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const denom = el.offsetHeight - window.innerHeight;
      if (denom <= 0) return;
      const rawP = -rect.top / denom;
      const clamped = Math.max(0, Math.min(0.9999, rawP));
      const nextStep = Math.floor(clamped * 4);
      setStepIndex((prev) => (prev === nextStep ? prev : nextStep));
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(computeStep);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    computeStep();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const scrollToStep = (idx) => {
    const el = sectionRef.current;
    if (!el) return;
    const docTop = el.getBoundingClientRect().top + window.scrollY;
    const denom = el.offsetHeight - window.innerHeight;
    if (denom <= 0) return;
    const targetP = (idx + 0.12) / 4;
    window.scrollTo({
      top: Math.round(docTop + targetP * denom),
      behavior: 'smooth'
    });
  };

  return (
    <section
      ref={sectionRef}
      id="whats-inside"
      className="pv-flip-section"
      aria-label="What is inside BROSKI pouches"
      style={{ '--flip-accent': slide.backdrop }}
    >
      <div className="pv-flip-sticky">
        <div className="pv-flip-overlay" aria-hidden="true" />
        <div className="pv-flip-grid">
          {/* Left column: step label, headline & paragraph */}
          <div className="pv-flip-copy" key={`copy-${stepIndex}`}>
            <span className="pv-flip-eyebrow">
              What&apos;s inside · {stepData.num} / 04
            </span>
            <h2 className="pv-flip-title">{stepData.heading}</h2>
            <p className="pv-flip-desc">{stepData.copy}</p>
            <span className="pv-flip-showing">
              Showing pack: <strong>{slide.tab}</strong>
            </span>
          </div>

          {/* Center column: giant outline step number + 3D tilt-and-flip card */}
          <div className="pv-flip-center">
            <div className="pv-flip-bg-num" aria-hidden="true">
              {stepData.num}
            </div>
            <div className="pv-flip-perspective">
              <div className="pv-flip-tilt">
                <div
                  className="pv-flip-card"
                  style={{ transform: `rotateY(${stepData.deg}deg)` }}
                >
                  {/* Card Front */}
                  <div
                    className="pv-flip-face pv-flip-front"
                    style={{ '--card-tint': slide.backdrop }}
                  >
                    <div className="pv-flip-front-badge">{slide.flipWeight}</div>
                    <img
                      src={slide.flipPouch}
                      alt={slide.pouchAlt}
                      className="pv-flip-pouch"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="pv-flip-front-foot">
                      <strong>BROSKI</strong>
                      <span>{slide.flipTitle}</span>
                    </div>
                  </div>

                  {/* Card Back */}
                  <div
                    className="pv-flip-face pv-flip-back"
                    style={{ background: slide.lightLabel }}
                  >
                    <div className="pv-label-brand">BROSKI</div>
                    <div className="pv-label-sub">
                      {slide.flipTitle} · {slide.flipWeight}
                    </div>
                    <div className="pv-label-ingredients">
                      <span className="pv-label-ing-head">INGREDIENTS</span>
                      <p>{ingredientsText}</p>
                    </div>
                    <p className="pv-label-note">
                      Complementary pet treat. Keep fresh water nearby. Best before 12 months from packing.
                    </p>
                    <div className="pv-label-origin">
                      PACKED IN NANGLOI · WEST DELHI 110041
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: 4 round step markers (hidden on phone) */}
          <div className="pv-flip-markers" role="tablist" aria-label="Flip story steps">
            {FLIP_STEPS.map((st, idx) => (
              <button
                key={st.num}
                type="button"
                className={`pv-flip-marker ${idx === stepIndex ? 'is-active' : ''}`}
                onClick={() => scrollToStep(idx)}
                aria-label={`Jump to step ${st.num}: ${st.heading}`}
                aria-current={idx === stepIndex ? 'step' : undefined}
              >
                <span className="pv-flip-marker-dot" aria-hidden="true" />
                <span className="pv-flip-marker-text">
                  <small>{st.num}</small>
                  <strong>{st.shortLabel}</strong>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
