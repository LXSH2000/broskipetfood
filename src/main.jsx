import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import './redesign.css';
import './broski.css';
import useStoreMotion from './motion.js';
import './launch.css';
import './motion-ui.css';
import LiquidButton from './LiquidButton.jsx';
import BroskiDock from './BroskiDock.jsx';
import Intro from './Intro.jsx';
import './liquid-dock.css';
import { LaunchBanner, ProductCards, SiteFooter, waLink } from './broski/BroskiHome';
import Experience from './Experience.jsx';
import BroskiWordmark from './BroskiWordmark.jsx';
import './broski/broski-home.css';
import './polish.css';
import './polish.js';
import './improve.css';

const C = () => window.BROSKI_CONFIG || {};

function HeroMedia() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return true;
    const isSmall = window.matchMedia('(max-width: 768px)').matches;
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const isSlow = conn && (conn.saveData || conn.effectiveType === '2g' || conn.effectiveType === '3g');
    return Boolean(isSmall || isSlow);
  });
  const [isPlayingMobile, setIsPlayingMobile] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    if (isMobile) return;
    const vid = videoRef.current;
    if (!vid) return;

    vid.muted = true;
    vid.defaultMuted = true;

    const playVideo = () => {
      const p = vid.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          setAutoplayBlocked(true);
        });
      }
    };

    if (!('IntersectionObserver' in window)) {
      playVideo();
      return;
    }

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        playVideo();
      } else {
        vid.pause();
      }
    }, { threshold: 0.1 });

    io.observe(vid);
    return () => io.disconnect();
  }, [isMobile]);

  const handleManualPlay = () => {
    setAutoplayBlocked(false);
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  };

  const toggleSound = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  return (
    <div className="cinema-frame">
      <div className={`cinema-window ${isPlayingMobile ? 'is-playing' : ''}`}>
        {isMobile ? (
          isPlayingMobile ? (
            <video
              ref={videoRef}
              className="cinema-image cinema-video"
              src="/broski-product-motion-ad-720.mp4"
              poster="/broski-hero-mobile-poster.webp"
              autoPlay
              playsInline
              controls
              data-user-playing="true"
              aria-label="Official BROSKI product motion ad showcasing 400g trial pouches"
            />
          ) : (
            <>
              <img
                src="/broski-hero-mobile-poster.webp"
                alt="Official BROSKI product motion ad showcasing 400g trial pouches"
                className="cinema-image"
                width="720"
                height="720"
                fetchPriority="high"
              />
              <button
                type="button"
                className="cinema-play-badge"
                aria-label="Watch Launch Ad"
                onClick={() => setIsPlayingMobile(true)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>Watch Launch Ad</span>
              </button>
            </>
          )
        ) : (
          <>
            <video
              ref={videoRef}
              className="cinema-image cinema-video"
              poster="/broski-hero-desktop-poster.webp"
              autoPlay
              muted
              playsInline
              loop
              preload="metadata"
              aria-label="Official BROSKI product motion ad showcasing 400g trial pouches"
            >
              <source src="/broski-product-motion-ad-720.mp4" type="video/mp4" />
            </video>
            {autoplayBlocked ? (
              <button
                type="button"
                className="cinema-play-badge"
                aria-label="Watch Launch Ad"
                onClick={handleManualPlay}
                style={{ zIndex: 10 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>Watch Launch Ad</span>
              </button>
            ) : (
              <button
                type="button"
                className="cinema-sound-btn"
                onClick={toggleSound}
                aria-label={isMuted ? "Turn sound on" : "Mute sound"}
              >
                <span>{isMuted ? "Sound On 🔊" : "Mute 🔇"}</span>
              </button>
            )}
          </>
        )}
        {!isPlayingMobile && (
          <>
            <div className="video-live-pill" aria-label="Moments in motion">
              <span className="live-dot" />
              <span>Moments in Motion</span>
            </div>
            <div className="cinema-caption">
              <span>AUTHENTIC TRIAL PACKS</span>
              <p>Sealed for your<br /><em>best bro.</em></p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Icon({ type, ...props }) {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {type === 'arrow' ? (
        <><path d="M4 12h16M14 6l6 6-6 6" /></>
      ) : type === 'close' ? (
        <path d="m6 6 12 12M6 18 18 6" />
      ) : type === 'search' ? (
        <><circle cx="10" cy="10" r="6" /><path d="m15 15 5 5" /></>
      ) : type === 'paw' ? (
        <><ellipse cx="12" cy="16" rx="5" ry="4" /><ellipse cx="5" cy="10" rx="2" ry="3" transform="rotate(-25 5 10)" /><ellipse cx="10" cy="6" rx="2" ry="3" /><ellipse cx="16" cy="6" rx="2" ry="3" /><ellipse cx="20" cy="11" rx="2" ry="3" transform="rotate(25 20 11)" /></>
      ) : (
        <><path d="M4 7h16M4 12h16M4 17h16" /></>
      )}
    </svg>
  );
}

function Bone({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 100 48" fill="currentColor" aria-hidden="true">
      <path d="M27 10C15-9-7 9 7 23-7 40 17 57 28 37h43c12 20 35 2 22-14C108 8 84-9 73 10Z" />
    </svg>
  );
}

function App() {
  useStoreMotion();
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const playMedia = () => {
      document.querySelectorAll('video').forEach(v => {
        if (v.controls || v.dataset.userPlaying === 'true') return;
        v.muted = true;
        v.defaultMuted = true;
        v.playsInline = true;
        v.setAttribute('playsinline', '');
        v.setAttribute('muted', '');
        v.play().catch(() => {});
      });
    };
    playMedia();
    window.addEventListener('touchstart', playMedia, { once: true, passive: true });
    window.addEventListener('click', playMedia, { once: true, passive: true });
    return () => {
      window.removeEventListener('touchstart', playMedia);
      window.removeEventListener('click', playMedia);
    };
  }, []);

  useEffect(() => {
    if (!menu) return;
    const close = e => {
      if (e.key === 'Escape') {
        setMenu(false);
        document.querySelector('.mobile-menu')?.focus();
      }
    };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [menu]);

  return (
    <>
      <Intro />
      <a href="#main" className="skip">Skip to content</a>
      <LaunchBanner />
      <header>
        <a href="/" className="logo" aria-label="Broski home">
          <BroskiWordmark height={26} />
        </a>
        <span className="concept-watermark">Est. 2026 · West Delhi</span>
        <nav className={menu ? 'open' : ''} id="main-navigation" aria-label="Main navigation">
          <a href="#shop" onClick={() => setMenu(false)} style={{ '--i': 0 }}>Shop</a>
          <a href="/sample/" onClick={() => setMenu(false)} style={{ '--i': 1 }}>Free sample</a>
          <a href="/offers/" onClick={() => setMenu(false)} style={{ '--i': 2 }}>Bro Perks</a>
          <a href="/r/" onClick={() => setMenu(false)} style={{ '--i': 3 }}>Feedback</a>
          <a href="/points/" onClick={() => setMenu(false)} style={{ '--i': 4 }}>My points</a>
          <a href="#story" onClick={() => setMenu(false)} style={{ '--i': 5 }}>Our story</a>
          <a href="#faq" onClick={() => setMenu(false)} style={{ '--i': 6 }}>Good to know</a>
          <a href="/?intro=1" onClick={() => { try { sessionStorage.removeItem('broski-intro-seen'); } catch {} }} style={{ '--i': 7 }}>Watch intro ↺</a>
        </nav>
        <div className="nav-actions">
          <button
            className="mobile-menu icon-btn"
            aria-label={menu ? 'Close navigation' : 'Open navigation'}
            aria-controls="main-navigation"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            <Icon type={menu ? 'close' : 'menu'} />
          </button>
        </div>
      </header>

      <main id="main">
        <section className="hero hero-v2">
          <div className="hero-copy" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="eyebrow" style={{ justifyContent: 'center', textAlign: 'center', marginInline: 'auto' }}>
              FOR YOUR FAVOURITE KIND OF COMPANY
            </div>
            <h1 className="hero-title" aria-label="Broski — Crunchy dog biscuits packed in West Delhi" style={{ textAlign: 'center', marginInline: 'auto' }}>
              {Array.from('Broski').map((c, i) => (
                <span aria-hidden="true" key={i} style={{ '--letter': i }}>{c === ' ' ? ' ' : c}</span>
              ))}
            </h1>
            <div className="hero-intro" style={{ textAlign: 'center', marginInline: 'auto', maxWidth: '440px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <p className="hero-manifesto" style={{ textAlign: 'center', marginInline: 'auto' }}>
                Treats for your<br /><em>best bro.</em>
              </p>
              <div className="hero-price-chip">
                <span>400 g pouch</span>
                <span className="chip-dot" aria-hidden="true">·</span>
                <span>Bro Bites ₹149 · Bro Mix ₹179</span>
              </div>
              <p className="hero-description" style={{ textAlign: 'center', marginInline: 'auto' }}>
                For the muddy paws. The happy hellos.<br />And the friend who makes every day better.
              </p>
              <div className="hero-cta" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', width: '100%', marginInline: 'auto' }}>
                <LiquidButton href="#shop" icon={<Icon type="arrow" />}>Shop the treats</LiquidButton>
                <a
                  className="button light"
                  href={waLink('Hi BROSKI! I have a question about your dog treats')}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  aria-label="Questions? WhatsApp us"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#25d366" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.886 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  <span>Questions? WhatsApp us</span>
                </a>
              </div>
              <a
                className="text-link bk-sample-link"
                href="/sample/?utm_source=site&utm_medium=hero"
                style={{ marginTop: '14px', fontSize: '14px', minHeight: '44px', display: 'inline-flex', alignItems: 'center', color: 'var(--bk-rust)' }}
                onClick={() => { try { window.BroskiAnalytics?.trackEvent('sample_cta_click', { place: 'hero' }); } catch {} }}
              >
                🎁 New here? Get a free 50 g taste pack →
              </a>
            </div>
          </div>
          <HeroMedia />
          <div className="hero-end">
            <span>TREATS FOR YOUR BEST BRO</span>
            <a href="#shop">Explore our launch treats ↓</a>
            <span>SCROLL TO EXPLORE</span>
          </div>
        </section>

        <div className="ticker" role="img" aria-label="For happy dogs and everyday adventures">
          <span aria-hidden="true">SMALL BITES</span><Bone aria-hidden="true" /><span aria-hidden="true">BIG FEELINGS</span><Bone aria-hidden="true" /><span aria-hidden="true">HAPPY TAILS</span><Bone aria-hidden="true" /><span aria-hidden="true">EVERYDAY ADVENTURES</span><Bone aria-hidden="true" /><span aria-hidden="true">SMALL BITES</span>
        </div>

        <ProductCards />

        <section id="story" className="story section">
          <div className="story-photo">
            <img
              src="/broski-hero-duo-studio.webp"
              alt="Broski dog biscuits authentic trial packaging studio duo"
              loading="lazy"
              onError={e => { e.currentTarget.src = '/broski-hero-duo-studio.jpg'; }}
            />
            <div className="photo-note">the best part of<br /><em>every day.</em><Icon type="paw" /></div>
          </div>
          <div className="story-copy">
            <div className="eyebrow">BEST FRIENDS. BETTER RITUALS.</div>
            <h2>They make life<br />better. Let's return<br /><span className="serif">the favour.</span></h2>
            <p>The morning walk. The welcome-home dance. That hopeful look when a cupboard opens. We’re here for the little rituals that make a life with dogs so good.</p>
            <p>Broski is for the friend who is always up for a walk, always happy to see you, and always convinced the next biscuit is theirs. Treats for your best bro. It’s that simple.</p>
            {C().FOUNDER_NOTE && (
              <p className="bk-founder">
                {C().FOUNDER_PHOTO && (
                  <img
                    src={C().FOUNDER_PHOTO}
                    alt="Lakshay"
                    className="bk-founder__img"
                    width="56"
                    height="56"
                    style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', display: 'inline-block', verticalAlign: 'middle', marginRight: '12px' }}
                  />
                )}
                <span>"{C().FOUNDER_NOTE}"</span>
                <span className="bk-founder__sign">— Lakshay, founder · Nangloi</span>
              </p>
            )}
            <a className="button light" href="#shop">A treat for your best friend <Icon type="arrow" /></a>
          </div>
        </section>

        <section className="ritual section">
          <div className="eyebrow">THERE’S ALWAYS A REASON</div>
          <h2>Good moments.<br /><span className="serif">Great company.</span></h2>
          <div className="ritual-grid">
            <article>
              <span className="ritual-icon">01 <Bone /></span>
              <h3>The little victories</h3>
              <p>For learning a new trick, taking a brave step, or finally getting that “stay”.</p>
              <a className="text-link" href="#shop">Explore Bro Mix – Happy Mix ↗</a>
            </article>
            <article>
              <span className="ritual-icon">02 <Icon type="paw" /></span>
              <h3>The everyday adventures</h3>
              <p>A pocket-sized companion for familiar paths and brand-new sniffing spots.</p>
              <a className="text-link" href="#shop">Pack a little happy ↗</a>
            </article>
            <article>
              <span className="ritual-icon">03 <span>♡</span></span>
              <h3>The just-because days</h3>
              <p>No tricks required. Sometimes being your favourite dog is more than enough.</p>
              <a className="text-link" href="#shop">Explore Bro Bites – Classic Crunch ↗</a>
            </article>
          </div>
        </section>

        {C().REVIEWS && C().REVIEWS.length > 0 ? (
          <section className="ritual section reviews-section">
            <div className="eyebrow">FROM REAL BROS</div>
            <h2>Happy tails,<br /><span className="serif">in their words.</span></h2>
            <div className="ritual-grid">
              {C().REVIEWS.slice(0, 3).map((rev, idx) => (
                <article key={idx}>
                  <p>"{rev.text}"</p>
                  <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--bk-brown-2)' }}>
                    — {rev.name}, {rev.area} · {rev.dog}
                  </div>
                </article>
              ))}
            </div>
            <p style={{ marginTop: '16px', fontSize: '13px', color: 'var(--bk-brown-2)', textAlign: 'center' }}>
              Shared with permission · <a className="text-link" href="/r/" style={{ display: 'inline', padding: 0, minHeight: 'auto' }}>Share your review →</a>
            </p>
          </section>
        ) : (
          <section className="ritual section reviews-section" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="eyebrow" style={{ justifyContent: 'center' }}>FROM REAL BROS · FIRST BATCH IN NANGLOI</div>
            <h2>Honest reviews,<br /><span className="serif">straight from real dogs.</span></h2>
            <p style={{ maxWidth: '620px', color: 'var(--bk-brown-2)', lineHeight: 1.65, marginInline: 'auto' }}>
              We only publish real reviews with permission — zero paid or made-up testimonials. Tried Broski from a pack or sample? Tell us honestly how your bro liked it and get a complimentary 50 g taste pack on your next order.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', marginTop: '20px', alignItems: 'center' }}>
              <a className="button primary" href="/r/">Share Honest Review →</a>
              {C().INSTAGRAM_URL ? (
                <a className="button light" href={C().INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                  Follow @broskipetfood ↗
                </a>
              ) : null}
            </div>
          </section>
        )}

        <section id="faq" className="faq section">
          <div>
            <div className="eyebrow">GOOD TO KNOW</div>
            <h2>A few things<br /><span className="serif">to chew on.</span></h2>
            <p>Little questions, straight answers.</p>
          </div>
          <div className="questions">
            {[
              ['When can I buy Broski?', "Available now in Nangloi (110041) – tap Order now on any pack for free delivery today or tomorrow. Pay online via Cashfree (UPI, Cards & NetBanking) or Cash/UPI on delivery."],
              ['How do I order?', 'Tap "Order now" on any pack to checkout online. Enter your delivery details in Nangloi (110041) and pay online via Cashfree (UPI, Cards & NetBanking) or Cash/UPI at your door.'],
              ["What's in the treats?", 'Every ingredient is printed transparently on our back label: Bro Bites (Classic Crunch) contains Real Chicken, Egg Powder, Whole Wheat Flour, Rice Flour, Corn Flour, Fish Oil, Vegetable Oil, Sodium Bicarbonate, Flavours, and Permitted Colours. Bro Mix (Happy Mix) contains Chicken Powder, Egg Powder, Whole Wheat Flour, Rice Flour, Corn Flour, Fish Oil, Vegetable Oil, Sodium Bicarbonate, Flavours, and Colour. Both contain chicken and egg. Complementary pet treat – break into pieces for smaller dogs and always keep fresh water nearby.'],
              ['How does delivery work?', 'We deliver via Nangloi Express (110041). Free delivery on all orders, arriving today or tomorrow in your selected slot (11 am – 2 pm or 4 pm – 8 pm). Other areas can join our waitlist.'],
              ['How do I contact customer support?', 'Message us on WhatsApp (tap the WhatsApp button) or email support@broskipetfood.com (Mon–Sat, 10 am – 7 pm).'],
              ['I run a pet shop – can I stock Broski?', "WhatsApp us or email at support@broskipetfood.com; we'll share trade terms and drop off complimentary tasting packs."]
            ].map(([q, a]) => (
              <details key={q}>
                <summary>{q}<span>+</span></summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>

        <Experience onShop={() => document.querySelector('#shop')?.scrollIntoView({ behavior: 'smooth' })} />

        <section className="newsletter section">
          <div>
            <span className="eyebrow">LET’S STAY IN THE LOOP</span>
            <h2>Get offers on WhatsApp</h2>
            <p>New flavours and Bro Perks, straight to your chat. No spam.</p>
          </div>
          <div style={{ marginTop: '20px' }}>
            <a
              className="button"
              href={waLink('Hi BROSKI! Please add me to offers.')}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}
            >
              <span>Get offers on WhatsApp</span>
              <Icon type="arrow" />
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />

      <BroskiDock />

      <a href={waLink('Hi BROSKI!')} target="_blank" rel="noopener noreferrer" className="whatsapp-float" aria-label="Chat on WhatsApp">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.886 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
        <span>Chat on WhatsApp</span>
      </a>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
