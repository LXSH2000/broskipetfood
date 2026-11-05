import React, { useEffect, useRef, useState } from 'react';
import './experience.css';

function Bone() {
  return <svg viewBox="0 0 160 95" fill="none" aria-hidden="true"><path d="M44 28C27 0 3 14 15 36C-3 55 23 78 43 59L116 59C137 79 162 55 145 36C158 15 133 0 115 28Z" fill="currentColor"/><path d="M44 35L113 35M48 51L109 51" stroke="#754326" strokeWidth="2" opacity=".25" strokeLinecap="round"/><circle cx="55" cy="43" r="2" fill="#754326" opacity=".35"/><circle cx="78" cy="45" r="2" fill="#754326" opacity=".35"/><circle cx="101" cy="42" r="2" fill="#754326" opacity=".35"/></svg>;
}

export default function Experience({ onShop }) {
  const section = useRef(null), pieces = useRef([]), engine = useRef(null);
  const [seen, setSeen] = useState(false), [tossed, setTossed] = useState(0);
  useEffect(() => {
    const el = section.current, media = matchMedia('(prefers-reduced-motion: reduce)');
    let raf = 0, index = 0, previous = { x: -1000, y: -1000 }, lastSpawn = 0, visible = true;
    const active = new Map();
    const stop = () => { cancelAnimationFrame(raf); raf = 0; active.forEach((_, node) => { node.style.opacity = '0'; }); active.clear(); };
    const visibility = () => { if(document.hidden)stop(); };
    const tick = now => {
      if(!visible || document.hidden || media.matches){stop();return;}
      active.forEach((p, node) => {
        const progress = Math.min((now - p.start) / 1350, 1);
        const opacity = progress > .64 ? (1 - progress) / .36 : 1;
        const scale = Math.min(1, .55 + progress * 5);
        const drift = media.matches ? 0 : progress * progress * 105;
        node.style.transform = `translate3d(${p.x}px, ${p.y + drift}px, 0) translate(-50%, -50%) rotate(${p.angle + (media.matches ? 0 : progress * p.spin)}deg) scale(${media.matches ? 1 : scale})`;
        node.style.opacity = opacity;
        if (progress === 1) { node.style.opacity = '0'; active.delete(node); }
      });
      raf = active.size ? requestAnimationFrame(tick) : 0;
    };
    const emit = (x, y) => {
      if(media.matches || !visible || document.hidden)return;
      const node = pieces.current[index % 8]; if (!node) return;
      active.set(node, { x, y, start: performance.now(), angle: (index * 41) % 50 - 25, spin: index % 2 ? 24 : -24 });
      index++; if (!raf) raf = requestAnimationFrame(tick);
    };
    engine.current = emit;
    const move = e => {
      if (e.pointerType === 'touch' || media.matches || e.target.closest('button,a')) return;
      const now = performance.now(); if(now-lastSpawn<=85)return;
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      if (now - lastSpawn > 85 && Math.hypot(x - previous.x, y - previous.y) > 65) {
        emit(x, y); previous = { x, y }; lastSpawn = now;
      }
    };
    // Touch scrolling never spawns effects; the explicit Toss button works on every input type.
    el.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('visibilitychange',visibility);media.addEventListener('change',stop);
    let observer;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(([entry]) => { visible=entry.isIntersecting; if (visible) setSeen(true); else stop(); }, { threshold: .01 });
      observer.observe(el);
    } else { setSeen(true); }
    return () => { stop(); observer?.disconnect(); el.removeEventListener('pointermove', move);document.removeEventListener('visibilitychange',visibility);media.removeEventListener('change',stop);engine.current = null; };
  }, []);
  const toss = () => {
    const el = section.current; if (!el) return;
    const x = el.clientWidth * .5, y = el.clientHeight * .39;
    engine.current?.(x - Math.min(145, el.clientWidth * .25), y);
    engine.current?.(x + Math.min(145, el.clientWidth * .25), y + 45);
    engine.current?.(x, y - 70); setTossed(n => n + 1);
  };
  return <section id="play" className={`bc-experience ${seen ? 'is-seen' : ''}`} ref={section} aria-labelledby="experience-title">
    <div className="bc-experience-top"><span>A LITTLE PLAY GOES A LONG WAY</span><span>NO BORING BITES, EVER.</span></div>
    <div className="bc-experience-copy">
      <p className="bc-experience-hint"><span className="bc-pointer-hint">Move your cursor. Make a little mischief.</span><span className="bc-touch-hint">Tap “Toss a treat”. Make a little mischief.</span> <span aria-hidden="true">↙</span></p>
      <h2 id="experience-title">What makes<br/><span>that tail wag?</span></h2>
      <p className="bc-experience-sub">A good walk. Your favorite human.<br/>And a really, really good biscuit.</p>
      <div className="bc-experience-actions"><button type="button" className="bc-experience-shop" onClick={onShop}>Find their favorite <span aria-hidden="true">↗</span></button><button type="button" className="bc-experience-toss" onClick={toss}>Toss a treat <span aria-hidden="true">✳</span></button></div>
    </div>
    <div className="bc-experience-decoration bc-experience-decoration-left" aria-hidden="true"><Bone/></div>
    <div className="bc-experience-decoration bc-experience-decoration-right" aria-hidden="true"><span>100%</span><small>GOOD DOG<br/>ENERGY</small></div>
    <div className="bc-experience-trails" aria-hidden="true">{Array.from({ length: 8 }, (_, i) => <div key={i} ref={node => { pieces.current[i] = node; }} className={`bc-trail-piece bc-trail-kind-${i % 3}`}>{i % 3 === 1 ? <div className="bc-trail-pack"><small>FOR YOUR BEST BRO</small><strong>BROSKI</strong><Bone/><span>NON-VEG</span></div> : i % 3 === 2 ? <div className="bc-trail-stamp"><span>good</span><strong>DOG!</strong><small>VERY GOOD TREATS</small></div> : <Bone/>}</div>)}</div>
    <span className="bc-experience-sr" role="status">{tossed ? `Treats tossed ${tossed} ${tossed === 1 ? 'time' : 'times'}. Good dog energy!` : ''}</span>
    <div className="bc-experience-bottom"><span>FOR THE LOVE OF DOGS</span><span aria-hidden="true">✳</span><span>AND THE JOY OF TREATS</span></div>
  </section>;
}
