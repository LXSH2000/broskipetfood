import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './intro.css';

// Decide once, at load, whether the intro plays: once per browser session,
// never with reduced motion. Add ?intro=1 to the URL to force a replay.
const KEY = 'broski-intro-seen';
function decide() {
  if (typeof window === 'undefined') return false;
  try {
    if (new URLSearchParams(location.search).has('intro')) return true;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
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

    const q = s => el.querySelectorAll(s);
    const ctx = gsap.context(() => {
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
        // the biscuit drops, squashes, hops once and settles
        .addLabel('drop', 1.6)
        .set(q('.bintro-biscuit'), { autoAlpha: 1 }, 'drop')
        .to(q('.bintro-biscuit'), { y: 0, rotation: -8, duration: .42, ease: 'power2.in' }, 'drop')
        .to(q('.bintro-biscuit'), { scaleX: 1.32, scaleY: .66, duration: .08, ease: 'power1.out' })
        .to(q('.bintro-biscuit'), { y: -78, scaleX: .9, scaleY: 1.12, rotation: 14, duration: .28, ease: 'power2.out' })
        .to(q('.bintro-biscuit'), { y: 0, scaleX: 1, scaleY: 1, rotation: -14, duration: .24, ease: 'power2.in' })
        .to(q('.bintro-biscuit'), { scaleX: 1.14, scaleY: .86, duration: .07 })
        .to(q('.bintro-biscuit'), { scaleX: 1, scaleY: 1, rotation: -18, duration: .5, ease: 'elastic.out(1, .45)' })
        // the logo wags at the impact
        .to(q('.bintro-word'), { rotation: -2.5, duration: .1, transformOrigin: '50% 90%', ease: 'power1.out' }, 'drop+=.44')
        .to(q('.bintro-word'), { rotation: 2, duration: .14, ease: 'sine.inOut', yoyo: true, repeat: 2 }, '>')
        .to(q('.bintro-word'), { rotation: 0, duration: .25, ease: 'back.out(3)' }, '>')
        // paw prints trot across
        .to(q('.bintro-paw > g'), { scale: 1, opacity: 1, duration: .32, ease: 'back.out(3)', stagger: .12 }, 'drop+=.55')
        .to(q('.bintro-paw > g'), { opacity: 0, duration: .5, stagger: .12 }, 'drop+=1.5')
        // tagline rises word by word
        .to(q('.bintro-tag span'), { yPercent: 0, duration: .7, ease: 'power4.out', stagger: .07 }, 'drop+=.6')
        .fromTo(q('.bintro-skip'), { opacity: 0 }, { opacity: 1, duration: .4 }, .6)
        // exit: content lifts, cream wipes up over a rust band, site appears
        .addLabel('exit', '+=.25')
        .to(q('.bintro-stage'), { y: -46, opacity: 0, duration: .5, ease: 'power3.in' }, 'exit')
        .to(q('.bintro-skip'), { opacity: 0, duration: .25 }, 'exit')
        .to(q('.bintro-bg'), { clipPath: 'inset(0% 0% 100% 0%)', duration: .9, ease: 'expo.inOut' }, 'exit+=.3')
        .to(q('.bintro-sweep'), { clipPath: 'inset(0% 0% 100% 0%)', duration: .9, ease: 'expo.inOut' }, 'exit+=.44');
    }, el);

    // Wait briefly for the handwriting font so the stroke draws the real letters.
    const fontReady = document.fonts?.load ? document.fonts.load('700 120px Gaegu').catch(() => {}) : Promise.resolve();
    const timeout = new Promise(r => setTimeout(r, 350));
    Promise.race([fontReady, timeout]).then(() => { if (!killed) tlRef.current?.play(); });

    const skip = () => {
      const tl = tlRef.current;
      if (!tl) return finish();
      if (tl.time() < tl.labels.exit) tl.seek('exit').play();
    };
    const onKey = e => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') skip(); };
    el.addEventListener('click', skip);
    window.addEventListener('keydown', onKey);
    const failsafe = setTimeout(finish, 6000);

    return () => {
      clearTimeout(failsafe);
      el.removeEventListener('click', skip);
      window.removeEventListener('keydown', onKey);
      ctx.revert();
      html.classList.remove('broski-intro-active');
    };
  }, [show]);

  if (!show) return null;
  return (
    <div className="bintro" ref={root} role="region" aria-label="Broski intro">
      <div className="bintro-sweep" aria-hidden="true" />
      <div className="bintro-bg" aria-hidden="true">
        <div className="bintro-glow" />
        <div className="bintro-grain" />
        <div className="bintro-stage">
          <p className="bintro-eyebrow">For your favourite kind of company</p>
          <svg className="bintro-logo" viewBox="0 0 720 300" role="presentation">
            <g className="bintro-word">
              <text className="bintro-word-text" x="320" y="182" textAnchor="middle">Broski</text>
            </g>
            <path className="bintro-swoosh" pathLength="1" d="M150 214 C 260 238, 420 232, 530 202" />
            <g transform="translate(628 182)">
              <g className="bintro-biscuit">
                <path d="M27 10C15-9-7 9 7 23-7 40 17 57 28 37h43c12 20 35 2 22-14C108 8 84-9 73 10Z" transform="translate(-50 -48)" />
                <circle cx="-22" cy="-26" r="2.4" /><circle cx="-2" cy="-20" r="2.4" /><circle cx="18" cy="-27" r="2.4" />
              </g>
            </g>
            <Paw x={170} y={272} r={70} />
            <Paw x={250} y={256} r={80} />
            <Paw x={330} y={274} r={70} />
            <Paw x={410} y={258} r={80} />
            <Paw x={490} y={276} r={70} />
          </svg>
          <p className="bintro-tag">
            <span>Treats</span> <span>for</span> <span>your</span> <span className="bintro-em">best</span> <span className="bintro-em">bro.</span>
          </p>
        </div>
      </div>
      <button type="button" className="bintro-skip" onClick={e => { e.stopPropagation(); const tl = tlRef.current; if (tl && tl.time() < tl.labels.exit) tl.seek('exit').play(); }}>
        Skip intro <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
