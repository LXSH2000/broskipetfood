import React, { useEffect, useState } from 'react';
import { LaunchBanner, SiteFooter, waLink } from '../broski/BroskiHome.jsx';
import BroskiCheckoutGateway from '../broski/BroskiCheckoutGateway.jsx';
import HeroSlider from './HeroSlider.jsx';
import ShopSection from './ShopSection.jsx';
import WhatsInsideFlip from './WhatsInsideFlip.jsx';
import LaunchAdModal from './LaunchAdModal.jsx';

const C = () => (typeof window !== 'undefined' && window.BROSKI_CONFIG) || {};

function BoneIcon() {
  return (
    <svg width="24" height="12" viewBox="0 0 100 48" fill="currentColor" aria-hidden="true">
      <path d="M27 10C15-9-7 9 7 23-7 40 17 57 28 37h43c12 20 35 2 22-14C108 8 84-9 73 10Z" />
    </svg>
  );
}

function PawIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <ellipse cx="12" cy="16" rx="5" ry="4" />
      <ellipse cx="5" cy="10" rx="2" ry="3" transform="rotate(-25 5 10)" />
      <ellipse cx="10" cy="6" rx="2" ry="3" />
      <ellipse cx="16" cy="6" rx="2" ry="3" />
      <ellipse cx="20" cy="11" rx="2" ry="3" transform="rotate(25 20 11)" />
    </svg>
  );
}

const FAQ_ITEMS = [
  [
    'When can I buy Broski?',
    'Available now in Nangloi (110041) – tap Order now on any pack for free delivery today or tomorrow. Pay online via Cashfree (UPI, Cards & NetBanking) or Cash/UPI on delivery.'
  ],
  [
    'How do I order?',
    'Tap "Order now" on any pack to checkout online. Enter your delivery details in Nangloi (110041) and pay online via Cashfree (UPI, Cards & NetBanking) or Cash/UPI at your door.'
  ],
  [
    "What's in the treats?",
    'Every ingredient is printed transparently on our back label: Bro Bites (Classic Crunch) contains Real Chicken, Egg Powder, Whole Wheat Flour, Rice Flour, Corn Flour, Fish Oil, Vegetable Oil, Sodium Bicarbonate, Flavours, and Permitted Colours. Bro Mix (Happy Mix) contains Chicken Powder, Egg Powder, Whole Wheat Flour, Rice Flour, Corn Flour, Fish Oil, Vegetable Oil, Sodium Bicarbonate, Flavours, and Colour. Both contain chicken and egg. Complementary pet treat – break into pieces for smaller dogs and always keep fresh water nearby.'
  ],
  [
    'How does delivery work?',
    'We deliver via Nangloi Express (110041). Free delivery on all orders, arriving today or tomorrow in your selected slot (11 am – 2 pm or 4 pm – 8 pm). Other areas can join our waitlist.'
  ],
  [
    'How do I contact customer support?',
    'Message us on WhatsApp (tap the WhatsApp button) or email support@broskipetfood.com (Mon–Sat, 10 am – 7 pm).'
  ],
  [
    'I run a pet shop – can I stock Broski?',
    "WhatsApp us or email at support@broskipetfood.com; we'll share trade terms and drop off complimentary tasting packs."
  ]
];

function PreviewMobileDock() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const hero = document.querySelector('.pv-hero');
      const footer = document.querySelector('footer');
      const pastHero = hero
        ? hero.getBoundingClientRect().bottom < window.innerHeight - 100
        : window.scrollY > 420;
      const nearFooter = footer
        ? footer.getBoundingClientRect().top < window.innerHeight - 24
        : false;
      setVisible(pastHero && !nearFooter);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="pv-mobile-dock-wrap">
      <nav className="pv-mobile-dock" aria-label="Quick navigation">
        <a href="#shop" className="pv-dock-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M5 7h14l1 14H4L5 7Z" />
            <path d="M8 8V6a4 4 0 0 1 8 0v2" />
          </svg>
          <span>Shop</span>
        </a>
        <a href="/sample/" className="pv-dock-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
          </svg>
          <span>Sample</span>
        </a>
        <a href="/points/" className="pv-dock-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v8M8 12h8" />
          </svg>
          <span>Points</span>
        </a>
        <a href="#story" className="pv-dock-link">
          <PawIcon />
          <span>Story</span>
        </a>
        <a href="#faq" className="pv-dock-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <path d="M12 17h.01" />
          </svg>
          <span>FAQ</span>
        </a>
      </nav>
    </div>
  );
}

export default function PreviewApp() {
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [gatewayConfig, setGatewayConfig] = useState(null);
  const [adModalOpen, setAdModalOpen] = useState(false);

  const cfg = C();
  const reviews = Array.isArray(cfg.REVIEWS) ? cfg.REVIEWS.slice(0, 6) : [];
  const dogPhotos = Array.isArray(cfg.DOG_PHOTOS) ? cfg.DOG_PHOTOS : [];

  const openGateway = (opts = {}) => {
    const config = typeof opts === 'string'
      ? { product: opts, step: 1, pincode: '110041' }
      : { product: 'combo', step: 1, pincode: '110041', ...opts };
    setGatewayConfig(config);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const orderParam = params.get('order');
    if (orderParam) {
      const valid = ['combo', 'bro-combo', 'bro-bites', 'bites', 'bro-mix', 'mix'];
      const p = valid.includes(orderParam)
        ? (orderParam.includes('bites') ? 'bro-bites' : orderParam.includes('mix') ? 'bro-mix' : 'combo')
        : 'combo';
      openGateway({ product: p, step: 1 });
    }
  }, []);

  const anyModalOpen = Boolean(gatewayConfig || adModalOpen);

  return (
    <div className="pv-page">
      <a href="#main" className="pv-skip">Skip to content</a>
      <LaunchBanner />

      <main id="main">
        {/* 1. Hero = 4-Flavour Slider + Header */}
        <HeroSlider
          activeIdx={activeSlideIdx}
          onChangeSlide={setActiveSlideIdx}
          onOrderSlide={(target) => {
            if (target === 'sample') {
              window.location.href = '/sample/?utm_source=site&utm_medium=hero';
            } else {
              openGateway({ product: target, step: 1 });
            }
          }}
          onOpenWatchAd={() => setAdModalOpen(true)}
          modalOpen={anyModalOpen}
        />

        {/* 2. Ticker Strip */}
        <div className="pv-ticker" role="img" aria-label="Small bites, big feelings, happy tails, everyday adventures">
          <div className="pv-ticker-track">
            {[0, 1, 2].map((loop) => (
              <div key={loop} className="pv-ticker-group" aria-hidden={loop > 0}>
                <span>SMALL BITES</span><BoneIcon />
                <span>BIG FEELINGS</span><BoneIcon />
                <span>HAPPY TAILS</span><BoneIcon />
                <span>EVERYDAY ADVENTURES</span><BoneIcon />
              </div>
            ))}
          </div>
        </div>

        {/* 3. Shop Section (Dark Cocoa Gradient, Pincode on top, 28px Coloured Tiles, Taste Strip, Collapsible Product Details) */}
        <ShopSection onOpenGateway={openGateway} />

        {/* 4. What's Inside Pinned 320vh 3D Flip Section (Replaces old trust cards) */}
        <WhatsInsideFlip activeIdx={activeSlideIdx} />

        {/* 5. Reviews Section (Ready for real reviews; short empty state when empty) */}
        <section className="pv-reviews" aria-labelledby="pv-reviews-h">
          <div className="pv-section-inner">
            <div className="pv-eyebrow">FROM REAL BROS · FIRST BATCH IN NANGLOI</div>
            {reviews.length > 0 ? (
              <>
                <h2 id="pv-reviews-h" className="pv-heading">
                  Happy tails, <span className="pv-serif">in their words.</span>
                </h2>
                <div className="pv-reviews-grid">
                  {reviews.map((rev, idx) => (
                    <article key={idx} className="pv-review-card">
                      {rev.photo && (
                        <img
                          src={rev.photo}
                          alt={`${rev.dog || 'Dog'} review photo`}
                          className="pv-review-photo"
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                      {rev.rating ? (
                        <div className="pv-review-stars" aria-label={`Rated ${rev.rating} out of 5`}>
                          {'★'.repeat(Math.min(5, Math.max(1, Number(rev.rating))))}
                        </div>
                      ) : null}
                      <p className="pv-review-text">&ldquo;{rev.text}&rdquo;</p>
                      <div className="pv-review-author">
                        — {rev.name}, {rev.area} · {rev.dog}
                      </div>
                    </article>
                  ))}
                </div>
                <p className="pv-review-foot">
                  Shared with permission · <a href="/r/">Share your review →</a>
                </p>
              </>
            ) : (
              <div className="pv-reviews-empty">
                <h2 id="pv-reviews-h" className="pv-heading">
                  Honest reviews, <span className="pv-serif">straight from real dogs.</span>
                </h2>
                <p className="pv-reviews-short">
                  No paid or fake reviews – first reviews from Nangloi coming soon.
                </p>
                <div className="pv-reviews-cta">
                  <a className="pv-btn pv-btn--primary" href="/r/">Share Honest Review →</a>
                  {cfg.INSTAGRAM_URL && (
                    <a
                      className="pv-btn pv-btn--light"
                      href={cfg.INSTAGRAM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Follow @broskipetfood ↗
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 6. Real Bros Gallery (hidden until DOG_PHOTOS has items) */}
        {dogPhotos.length > 0 && (
          <section className="pv-gallery" aria-labelledby="pv-gallery-h">
            <div className="pv-section-inner">
              <div className="pv-eyebrow">COMMUNITY</div>
              <h2 id="pv-gallery-h" className="pv-heading">
                Real bros of <span className="pv-serif">Nangloi 🐾</span>
              </h2>
              <p className="pv-gallery-sub">Photos shared by their humans, with permission.</p>
              <div className="pv-gallery-grid">
                {dogPhotos.map((item, idx) => (
                  <figure key={idx} className="pv-gallery-item">
                    <img
                      src={item.src}
                      alt={item.caption}
                      loading="lazy"
                      decoding="async"
                    />
                    <figcaption>{item.caption}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 7. Short Story Section (ONLY first paragraph kept per polish prompt) */}
        <section id="story" className="pv-story" aria-labelledby="pv-story-h">
          <div className="pv-section-inner pv-story-grid">
            <div className="pv-story-photo">
              <img
                src="/broski-hero-duo-studio.webp"
                alt="Broski dog biscuits authentic trial packaging studio duo"
                loading="lazy"
                decoding="async"
                onError={(e) => { e.currentTarget.src = '/broski-hero-duo-studio.jpg'; }}
              />
              <div className="pv-photo-note">
                the best part of<br /><em>every day.</em> <PawIcon />
              </div>
            </div>
            <div className="pv-story-copy">
              <div className="pv-eyebrow">BEST FRIENDS. BETTER RITUALS.</div>
              <h2 id="pv-story-h" className="pv-heading">
                They make life better. Let&apos;s return <span className="pv-serif">the favour.</span>
              </h2>
              <p>
                The morning walk. The welcome-home dance. That hopeful look when a cupboard opens. We&apos;re here for the little rituals that make a life with dogs so good.
              </p>
              {cfg.FOUNDER_NOTE && (
                <p className="pv-founder">
                  {cfg.FOUNDER_PHOTO && (
                    <img src={cfg.FOUNDER_PHOTO} alt="Lakshay" width="56" height="56" loading="lazy" />
                  )}
                  <span>&ldquo;{cfg.FOUNDER_NOTE}&rdquo;</span>
                  <span className="pv-founder-sign">— Lakshay, founder · Nangloi</span>
                </p>
              )}
              <a className="pv-btn pv-btn--light" href="#shop">
                A treat for your best friend →
              </a>
            </div>
          </div>
        </section>

        {/* 8. FAQ Section */}
        <section id="faq" className="pv-faq" aria-labelledby="pv-faq-h">
          <div className="pv-section-inner pv-faq-grid">
            <div>
              <div className="pv-eyebrow">GOOD TO KNOW</div>
              <h2 id="pv-faq-h" className="pv-heading">
                A few things <span className="pv-serif">to chew on.</span>
              </h2>
              <p className="pv-faq-sub">Little questions, straight answers.</p>
            </div>
            <div className="pv-questions">
              {FAQ_ITEMS.map(([q, a]) => (
                <details key={q}>
                  <summary>{q}<span aria-hidden="true">+</span></summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 9. Get offers on WhatsApp */}
        <section className="pv-newsletter" aria-labelledby="pv-wa-h">
          <div className="pv-section-inner pv-newsletter-grid">
            <div>
              <div className="pv-eyebrow pv-eyebrow--light">LET&apos;S STAY IN THE LOOP</div>
              <h2 id="pv-wa-h" className="pv-newsletter-title">Get offers on WhatsApp</h2>
              <p className="pv-newsletter-copy">New flavours and Bro Perks, straight to your chat. No spam.</p>
            </div>
            <div>
              <a
                className="pv-btn pv-btn--cream"
                href={waLink('Hi BROSKI! Please add me to offers.')}
                target="_blank"
                rel="noopener noreferrer"
              >
                Get offers on WhatsApp →
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* 10. Footer */}
      <SiteFooter />

      {/* Mobile Bottom Dock (hidden on desktop >= 900px) */}
      <PreviewMobileDock />

      {/* Direct Checkout Gateway Modal */}
      {gatewayConfig && (
        <BroskiCheckoutGateway
          initialProduct={gatewayConfig.product || 'combo'}
          initialStep={gatewayConfig.step || 1}
          initialPincode={gatewayConfig.pincode || '110041'}
          onClose={() => setGatewayConfig(null)}
        />
      )}

      {/* Lightweight Lazy Launch Ad Modal */}
      <LaunchAdModal
        isOpen={adModalOpen}
        onClose={() => setAdModalOpen(false)}
      />
    </div>
  );
}
