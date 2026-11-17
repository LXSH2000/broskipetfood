import React, { useEffect, useRef, useState } from 'react';
import './intro.css';

// Decide once, at load, whether the intro plays: once per browser session,
// never on mobile (<768px) or with reduced motion. Add ?intro=1 to the URL to force a replay.
const KEY = 'broski-intro-seen';
function decide() {
  if (typeof window === 'undefined') return false;
  try {
    if (new URLSearchParams(location.search).has('intro')) return true;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    if (window.innerWidth < 768) return false;
    if (sessionStorage.getItem(KEY)) return false;
  } catch { /* storage blocked: still play */ }
  return true;
}
const SHOULD_PLAY = decide();
if (SHOULD_PLAY) document.documentElement.classList.add('broski-intro-active');

const Paw = ({ x, y, r }) => (
  <g className="bintro-paw" transform={`translate(${x} ${y}) rotate(${r})`}>
    <g>
      <ellipse cx="0" cy="6" rx="9" ry="7.5" />
      <ellipse cx="-11" cy="-5" rx="3.6" ry="5" transform="rotate(-25 -11 -5)" />
      <ellipse cx="-4" cy="-11" rx="3.6" ry="5" />
      <ellipse cx="5" cy="-11" rx="3.6" ry="5" />
      <ellipse cx="12" cy="-4" rx="3.6" ry="5" transform="rotate(25 12 -4)" />
    </g>
  </g>
);

export default function Intro() {
  const [show, setShow] = useState(SHOULD_PLAY);
  const root = useRef(null);
  const tlRef = useRef(null);

  useEffect(() => {
    if (!show || !root.current) return;
    const el = root.current;
    const html = document.documentElement;
    let killed = false;

    const finish = () => {
      if (killed) return;
      killed = true;
      try { sessionStorage.setItem(KEY, '1'); } catch {}
      html.classList.remove('broski-intro-active');
      window.dispatchEvent(new Event('broski:intro-done'));
      setShow(false);
    };

    let ctx = null;
    let failsafe = null;
    const skip = () => {
      const tl = tlRef.current;
      if (!tl) return finish();
      if (tl.time() < tl.labels.exit) tl.seek('exit').play();
    };
    const onKey = e => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') skip(); };

    import('gsap').then(({ default: gsap }) => {
      if (killed || !root.current) return;
      const q = s => el.querySelectorAll(s);

      ctx = gsap.context(() => {
        const tl = gsap.timeline({ paused: true, onComplete: finish });
        tl.timeScale(1.35);
        tlRef.current = tl;

        gsap.set(q('.bintro-word-text'), { strokeDasharray: 1600, strokeDashoffset: 1600, fillOpacity: 0 });
        gsap.set(q('.bintro-swoosh'), { strokeDasharray: 1, strokeDashoffset: 1 });
        gsap.set(q('.bintro-biscuit'), { y: -560, rotation: -40, autoAlpha: 0, transformOrigin: '50% 100%' });
        gsap.set(q('.bintro-paw > g'), { scale: 0, opacity: 0, transformOrigin: '50% 50%' });
        gsap.set(q('.bintro-tag span'), { yPercent: 110 });

        tl.addLabel('start')
          .fromTo(q('.bintro-eyebrow'), { opacity: 0, letterSpacing: '0.7em' }, { opacity: 1, letterSpacing: '0.3em', duration: 1.1, ease: 'power3.out' }, 0)
          .fromTo(q('.bintro-glow'), { scale: .6, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.8, ease: 'power2.out' }, 0)
          .to(q('.bintro-word-text'), { strokeDashoffset: 0, duration: 1.45, ease: 'power2.inOut' }, .2)
          .to(q('.bintro-word-text'), { fillOpacity: 1, duration: .55, ease: 'power1.out' }, 1.25)
          .to(q('.bintro-word-text'), { strokeOpacity: 0, duration: .4 }, 1.6)
          .to(q('.bintro-swoosh'), { strokeDashoffset: 0, duration: .6, ease: 'power3.inOut' }, 1.35)
          .addLabel('drop', 1.6)
          .set(q('.bintro-biscuit'), { autoAlpha: 1 }, 'drop')
          .to(q('.bintro-biscuit'), { y: 0, rotation: -8, duration: .42, ease: 'power2.in' }, 'drop')
          .to(q('.bintro-biscuit'), { scaleX: 1.32, scaleY: .66, duration: .08, ease: 'power1.out' })
          .to(q('.bintro-biscuit'), { y: -78, scaleX: .9, scaleY: 1.12, rotation: 14, duration: .28, ease: 'power2.out' })
          .to(q('.bintro-biscuit'), { y: 0, scaleX: 1, scaleY: 1, rotation: -14, duration: .24, ease: 'power2.in' })
          .to(q('.bintro-biscuit'), { scaleX: 1.14, scaleY: .86, duration: .07 })
          .to(q('.bintro-biscuit'), { scaleX: 1, scaleY: 1, rotation: -18, duration: .5, ease: 'elastic.out(1, .45)' })
          .to(q('.bintro-word'), { rotation: -2.5, duration: .1, transformOrigin: '50% 90%', ease: 'power1.out' }, 'drop+=.44')
          .to(q('.bintro-word'), { rotation: 2, duration: .14, ease: 'sine.inOut', yoyo: true, repeat: 2 }, '>')
          .to(q('.bintro-word'), { rotation: 0, duration: .25, ease: 'back.out(3)' }, '>')
          .to(q('.bintro-paw > g'), { scale: 1, opacity: 1, duration: .32, ease: 'back.out(3)', stagger: .12 }, 'drop+=.55')
          .to(q('.bintro-paw > g'), { opacity: 0, duration: .5, stagger: .12 }, 'drop+=1.5')
          .to(q('.bintro-tag span'), { yPercent: 0, duration: .7, ease: 'power4.out', stagger: .07 }, 'drop+=.6')
          .fromTo(q('.bintro-skip'), { opacity: 0 }, { opacity: 1, duration: .4 }, .6)
          .addLabel('exit', '+=.25')
          .to(q('.bintro-stage'), { y: -46, opacity: 0, duration: .5, ease: 'power3.in' }, 'exit')
          .to(q('.bintro-skip'), { opacity: 0, duration: .25 }, 'exit')
          .to(q('.bintro-bg'), { clipPath: 'inset(0% 0% 100% 0%)', duration: .9, ease: 'expo.inOut' }, 'exit+=.3')
          .to(q('.bintro-sweep'), { clipPath: 'inset(0% 0% 100% 0%)', duration: .9, ease: 'expo.inOut' }, 'exit+=.44');
      }, el);

      const fontReady = document.fonts?.load ? document.fonts.load('700 120px Gaegu').catch(() => {}) : Promise.resolve();
      const timeout = new Promise(r => setTimeout(r, 350));
      Promise.race([fontReady, timeout]).then(() => { if (!killed) tlRef.current?.play(); });

      el.addEventListener('click', skip);
      window.addEventListener('keydown', onKey);
      failsafe = setTimeout(finish, 6000);
    }).catch(finish);

    return () => {
      killed = true;
      if (failsafe) clearTimeout(failsafe);
      el.removeEventListener('click', skip);
      window.removeEventListener('keydown', onKey);
      if (ctx) ctx.revert();
      html.classList.remove('broski-intro-active');
    };
  }, [show]);

  if (!show) return null;
  return (
    <div className="bintro" ref={root} role="region" aria-label="Broski intro">
      <div className="bintro-sweep" aria-hidden="true" />
      <div className="bintro-bg" aria-hidden="true" />
      <div className="bintro-stage">
        <span className="bintro-eyebrow">WEST DELHI &bull; BATCH 01</span>
        <div className="bintro-mark-wrap">
          <div className="bintro-glow" aria-hidden="true" />
          <svg className="bintro-svg" viewBox="0 0 980 440" fill="none">
            <Paw x="110" y="340" r="-18" />
            <Paw x="220" y="270" r="14" />
            <Paw x="760" y="270" r="-12" />
            <Paw x="870" y="340" r="22" />
            <g className="bintro-biscuit">
              <path d="M-64 -32 C-80 -44 -86 -66 -72 -80 C-58 -94 -36 -88 -24 -72 L24 -72 C36 -88 58 -94 72 -80 C86 -66 80 -44 64 -32 C80 -20 86 2 72 16 C58 30 36 24 24 8 L-24 8 C-36 24 -58 30 -72 16 C-86 2 -80 -20 -64 -32 Z" fill="#b8452b" />
              <circle cx="-32" cy="-32" r="3.5" fill="#fdfaf3" opacity=".9" />
              <circle cx="0" cy="-32" r="3.5" fill="#fdfaf3" opacity=".9" />
              <circle cx="32" cy="-32" r="3.5" fill="#fdfaf3" opacity=".9" />
            </g>
            <path className="bintro-swoosh" d="M 160 380 Q 490 430 820 380" stroke="#b8452b" strokeWidth="6" strokeLinecap="round" />
            <g className="bintro-word">
              <text className="bintro-word-text" x="490" y="290" textAnchor="middle">BROSKI</text>
            </g>
          </svg>
        </div>
        <p className="bintro-tag" aria-label="Crunchy dog treats for your best bro.">
          <span>CRUNCHY</span> <span>DOG</span> <span>TREATS</span> <span>FOR</span> <span>YOUR</span> <span>BEST</span> <span>BRO.</span>
        </p>
      </div>
      <button type="button" className="bintro-skip" onClick={() => {
        try { sessionStorage.setItem(KEY, '1'); } catch {}
        document.documentElement.classList.remove('broski-intro-active');
        setShow(false);
      }}>Skip &rarr;</button>
    </div>
  );
}
