import React, { useEffect, useRef } from 'react';

export default function LaunchAdModal({ isOpen, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="pv-ad-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pv-ad-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="pv-ad-modal">
        <div className="pv-ad-head">
          <div>
            <span className="pv-ad-kicker">OFFICIAL LAUNCH FILM</span>
            <h2 id="pv-ad-title">BROSKI 400 g Trial Pouches</h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="pv-ad-close"
            onClick={onClose}
            aria-label="Close launch ad video"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="pv-ad-video-wrap">
          <video
            src="/broski-product-motion-ad-720.mp4"
            poster="/broski-hero-desktop-poster.webp"
            controls
            autoPlay
            playsInline
            aria-label="BROSKI product motion launch video"
          />
        </div>
      </div>
    </div>
  );
}
