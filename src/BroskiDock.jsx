import React, { useEffect, useRef, useState } from 'react';

export default function BroskiDock() {
  const dockRef = useRef(null);
  const [activeItem, setActiveItem] = useState('shop');
  const [specState, setSpecState] = useState({ angle: '2.4rad', bright: 0 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 280);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const dock = dockRef.current;
    if (!dock) return;
    const media = window.matchMedia('(hover:hover) and (pointer:fine)');
    if (!media.matches) return;

    const items = Array.from(dock.querySelectorAll('[data-dock]'));
    let aimX = 0, aimY = 0;

    const onMove = e => {
      aimX = e.clientX;
      aimY = e.clientY;
      const r = dock.getBoundingClientRect();
      const inCatch = aimX > r.left - 50 && aimX < r.right + 50 && aimY > r.top - 40 && aimY < r.bottom + 80;

      if (inCatch) {
        items.forEach(el => {
          const br = el.getBoundingClientRect();
          const cx = br.left + br.width * 0.5;
          const dist = Math.abs(aimX - cx);
          const prox = Math.max(0, 1 - dist / 110);
          const eased = prox * prox * (3 - 2 * prox);
          el.style.transform = `scale(${1 + eased * 0.18}) translateY(${-eased * 4}px)`;
          el.dataset.near = eased > 0.1 ? 'true' : 'false';
        });

        const cx = r.left + r.width * 0.5;
        const cy = r.top + r.height * 0.5;
        const ang = Math.atan2(cy - aimY, aimX - cx);
        setSpecState({
          angle: `${ang.toFixed(3)}rad`,
          bright: 0.85
        });
      } else {
        items.forEach(el => {
          el.style.transform = '';
          el.dataset.near = 'false';
        });
        setSpecState(prev => ({ ...prev, bright: 0 }));
      }
    };

    const onLeave = () => {
      items.forEach(el => {
        el.style.transform = '';
        el.dataset.near = 'false';
      });
      setSpecState(prev => ({ ...prev, bright: 0 }));
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  const scrollTo = (id, itemName) => {
    setActiveItem(itemName);
    const target = document.querySelector(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`broski-dock-wrap ${visible ? 'visible' : ''}`}>
      <nav
        ref={dockRef}
        className="broski-dock"
        aria-label="Interactive Broski Dock"
        style={{
          '--spec-angle': specState.angle,
          '--spec-bright': specState.bright
        }}
      >
        <button
          type="button"
          data-dock
          className="dock-item dock-mark"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Broski home top"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <ellipse cx="12" cy="16" rx="5" ry="4" />
            <ellipse cx="5" cy="10" rx="2" ry="3" transform="rotate(-25 5 10)" />
            <ellipse cx="10" cy="6" rx="2" ry="3" />
            <ellipse cx="16" cy="6" rx="2" ry="3" />
            <ellipse cx="20" cy="11" rx="2" ry="3" transform="rotate(25 20 11)" />
          </svg>
        </button>

        <a
          href="#shop"
          data-dock
          className={`dock-item ${activeItem === 'shop' ? 'is-active' : ''}`}
          onClick={(e) => { e.preventDefault(); scrollTo('#shop', 'shop'); }}
        >
          <span className="glyph" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M5 7h14l1 14H4L5 7Z" />
              <path d="M8 8V6a4 4 0 0 1 8 0v2" />
            </svg>
          </span>
          <span>Shop</span>
        </a>

        <a
          href="/offers/"
          data-dock
          className="dock-item"
        >
          <span className="glyph" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M20 12v10H4V12" />
              <path d="M2 7h20v5H2z" />
              <path d="M12 22V7" />
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
            </svg>
          </span>
          <span className="dock-txt-desk">Bro Perks</span>
          <span className="dock-txt-mob">Perks</span>
        </a>

        <a
          href="/r/"
          data-dock
          className="dock-item"
        >
          <span className="glyph" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </span>
          <span>Feedback</span>
        </a>

        <a
          href="#story"
          data-dock
          className={`dock-item ${activeItem === 'story' ? 'is-active' : ''}`}
          onClick={(e) => { e.preventDefault(); scrollTo('#story', 'story'); }}
        >
          <span className="glyph" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
              <path d="M6 6h10M6 10h10" />
            </svg>
          </span>
          <span className="dock-txt-desk">Our story</span>
          <span className="dock-txt-mob">Story</span>
        </a>

        <a
          href="#faq"
          data-dock
          className={`dock-item ${activeItem === 'faq' ? 'is-active' : ''}`}
          onClick={(e) => { e.preventDefault(); scrollTo('#faq', 'faq'); }}
        >
          <span className="glyph" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
            </svg>
          </span>
          <span className="dock-txt-desk">Good to know</span>
          <span className="dock-txt-mob">FAQ</span>
        </a>
      </nav>
    </div>
  );
}
