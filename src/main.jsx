import React, { useState, useEffect } from 'react';
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
import { LaunchBanner, ProductCards, PartnerSection, SiteFooter, waLink } from './broski/BroskiHome';
import './broski/broski-home.css';

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
  const [email, setEmail] = useState('');
  const [newsletterMsg, setNewsletterMsg] = useState('');

  useEffect(() => {
    const playMedia = () => {
      document.querySelectorAll('video').forEach(v => {
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

  function newsletter(e) {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setNewsletterMsg('Please enter a valid email address.');
      return;
    }
    const subject = encodeURIComponent('Notify me when Broski launches');
    const body = encodeURIComponent(`Please notify me when Broski launches in West Delhi.\n\nEmail: ${email.trim()}`);
    window.location.href = `mailto:support@broskipetfood.com?subject=${subject}&body=${body}`;
    setNewsletterMsg('Your email app opened. Press send to join our launch list.');
    setEmail('');
  }

  return (
    <>
      <Intro />
      <a href="#main" className="skip">Skip to content</a>
      <LaunchBanner />
      <header>
        <a href="/" className="logo" aria-label="Broski home">
          <Icon type="paw" />
          <span>Broski<span className="registered"></span></span>
        </a>
        <span className="concept-watermark">Est. 2026 · West Delhi</span>
        <nav className={menu ? 'open' : ''} id="main-navigation" aria-label="Main navigation">
          <a href="#shop" onClick={() => setMenu(false)}>Shop</a>
          <a href="/offers/" onClick={() => setMenu(false)}>Bro Perks</a>
          <a href="/r/" onClick={() => setMenu(false)}>Feedback</a>
          <a href="#story" onClick={() => setMenu(false)}>Our story</a>
          <a href="#faq" onClick={() => setMenu(false)}>Good to know</a>
          <a href="/?intro=1" onClick={() => { try { sessionStorage.removeItem('broski-intro-seen'); } catch {} }}>Watch intro ↺</a>
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
              <div className="hero-price-chip" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#352016', color: '#fff8ed', padding: '5px 13px', borderRadius: '20px', fontSize: '11.5px', fontWeight: '600', margin: '0 auto 14px auto', letterSpacing: '.3px' }}>
                <span>400 g Pouch</span><span>·</span><span>Non-Veg ₹149 · Mix ₹179</span>
              </div>
              <p className="hero-description" style={{ textAlign: 'center', marginInline: 'auto' }}>
                For the muddy paws. The happy hellos.<br />And the friend who makes every day better.
              </p>
              <div className="hero-cta" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', width: '100%', marginInline: 'auto' }}>
                <LiquidButton href="#shop" icon={<Icon type="arrow" />}>Shop the treats</LiquidButton>
                <a
                  className="button light"
                  href={waLink('Hi BROSKI! I want to order treats for my bro')}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  aria-label="Order on WhatsApp"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#25d366" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.886 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  <span>Order on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
          <div className="cinema-frame">
            <div className="cinema-window">
              <video
                className="cinema-image cinema-video"
                src="/broski-hero-desktop-720.mp4"
                poster="/broski-hero-desktop-poster.jpg"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                aria-label="A golden retriever enjoying crunchy Broski treats alongside the authentic 400g trial pouches"
              >
                <source src="/broski-hero-desktop-720.mp4" type="video/mp4" />
                <source src="/broski-hero-desktop.mp4" type="video/mp4" />
              </video>
              <div className="video-live-pill" aria-label="Moments in motion">
                <span className="live-dot" />
                <span>Moments in Motion</span>
              </div>
              <div className="cinema-caption">
                <span>AUTHENTIC TRIAL PACKS</span>
                <p>Sealed for your<br /><em>best bro.</em></p>
              </div>
            </div>
          </div>
          <div className="hero-end">
            <span>TREATS FOR YOUR BEST BRO</span>
            <a href="#shop">Explore our launch treats ↓</a>
            <span>SCROLL TO EXPLORE</span>
          </div>
        </section>

        <div className="ticker" aria-label="For happy dogs and everyday adventures">
          <span>SMALL BITES</span><Bone /><span>BIG FEELINGS</span><Bone /><span>HAPPY TAILS</span><Bone /><span>EVERYDAY ADVENTURES</span><Bone /><span>SMALL BITES</span>
        </div>

        <ProductCards />

        <section id="story" className="story section">
          <div className="story-photo">
            <img
              src="/broski-hero-duo-studio.jpg"
              alt="Broski dog biscuits authentic trial packaging studio duo"
              loading="lazy"
              onError={e => { e.currentTarget.src = '/broski-hero-desktop-poster.jpg'; }}
            />
            <div className="photo-note">the best part of<br /><em>every day.</em><Icon type="paw" /></div>
          </div>
          <div className="story-copy">
            <div className="eyebrow">BEST FRIENDS. BETTER RITUALS.</div>
            <h2>They make life<br />better. Let’s return<br /><span className="serif">the favour.</span></h2>
            <p>The morning walk. The welcome-home dance. That hopeful look when a cupboard opens. We’re here for the little rituals that make a life with dogs so good.</p>
            <p>Broski is for the friend who is always up for a walk, always happy to see you, and always convinced the next biscuit is theirs. Treats for your best bro. It’s that simple.</p>
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
              <a className="text-link" href="#shop">Explore Mix biscuits ↗</a>
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
              <a className="text-link" href="#shop">Explore Non-Veg biscuits ↗</a>
            </article>
          </div>
        </section>

        <section className="everyday-editorial">
          <video
            className="everyday-video"
            src="/broski-commercial-ad-720.mp4"
            poster="/broski-hero-desktop-poster.jpg"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            aria-label="Official Broski commercial ad featuring authentic 400g Yellow Non-Veg and White Mix pouches"
          >
            <source src="/broski-commercial-ad-720.mp4" type="video/mp4" />
            <source src="/Broski_Hero_Ad_16x9_1080p.mp4" type="video/mp4" />
          </video>
          <div>
            <span className="video-pill-badge"><Icon type="paw" /> Official Commercial</span>
            <span className="eyebrow">SEALED FOR MY BRO</span>
            <h2>Life tastes<br /><em>better together.</em></h2>
            <p>Real crunchy bone biscuits.<br />Packed by hand in Nangloi, West Delhi.</p>
            <div className="video-story-actions">
              <a className="button light" href="#shop">Explore our treats <Icon type="arrow" /></a>
              <button
                type="button"
                className="video-toggle-btn"
                onClick={() => {
                  const v = document.querySelector('.everyday-video');
                  if (v) { v.paused ? v.play() : v.pause(); }
                }}
              >
                Pause / Play Ⅱ
              </button>
              <button
                type="button"
                className="video-toggle-btn"
                onClick={e => {
                  const v = document.querySelector('.everyday-video');
                  if (v) {
                    v.muted = !v.muted;
                    e.currentTarget.textContent = v.muted ? 'Sound On 🔊' : 'Mute 🔇';
                  }
                }}
              >
                Sound On 🔊
              </button>
            </div>
          </div>
        </section>

        <section id="faq" className="faq section">
          <div>
            <div className="eyebrow">GOOD TO KNOW</div>
            <h2>A few things<br /><span className="serif">to chew on.</span></h2>
            <p>Little questions, straight answers.</p>
          </div>
          <div className="questions">
            {[
              ['When can I buy Broski?', 'Available now in West Delhi via WhatsApp, with delivery from 15 Nov.'],
              ['How do I order?', 'Tap Order on WhatsApp on any pack – we confirm delivery and payment in the chat.'],
              ["What's in the treats?", 'Full ingredient list coming soon – it will be printed on every pack and posted here, word for word, before we sell.'],
              ['How does delivery work?', 'We deliver in West Delhi to start. Delivery day and any charge are confirmed by WhatsApp or email before you pay.'],
              ['I run a pet shop – can I stock Broski?', "WhatsApp us or email at support@broskipetfood.com; we'll share our 11+1 wholesale offer and drop off complimentary tasting packs."]
            ].map(([q, a]) => (
              <details key={q}>
                <summary>{q}<span>+</span></summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="newsletter section">
          <div>
            <span className="eyebrow">LET’S STAY IN THE LOOP</span>
            <h2>Good things.<br />Straight to your inbox.</h2>
            <p>New treats, little stories, and plenty of dog energy.</p>
          </div>
          <form onSubmit={newsletter}>
            <label htmlFor="newsletter">Your email address</label>
            <div className="email-field">
              <input id="newsletter" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
              <button aria-label="Subscribe to launch updates" type="submit"><Icon type="arrow" /></button>
            </div>
            <small>We'll write once, on launch day. No spam.</small>
            <p className="form-message" role="status">{newsletterMsg}</p>
          </form>
        </section>

        <PartnerSection />
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
