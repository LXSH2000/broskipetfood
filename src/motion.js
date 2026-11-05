import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
const REVEAL = '.section-heading, .product-card, .story-copy, .ritual-grid article, .faq, .newsletter, .bro-note, .everyday-editorial > div';

export default function useStoreMotion() {
  useEffect(() => {
    const root = document.querySelector('#root');
    if (!root) return;
    const media = gsap.matchMedia();
    media.add({ motion: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 800px) and (hover: hover) and (pointer: fine)' }, (mediaContext) => {
      if (!mediaContext.conditions.motion) return;
      const desktop = mediaContext.conditions.desktop;
      if (!desktop) {
        // Mobile: pure native 60fps/120fps scrolling without forced layout or ScrollTrigger lag
        return () => {};
      }
      const seen = new WeakSet();
      const triggers = new Set();
      let refreshFrame = 0;
      let hovered = null;
      let moveFrame = 0, latestPointer = null;
      const cardMotion = new Map();
      const context = gsap.context(() => {}, root);
      const scoped = (fn) => (...args) => context.add(() => fn(...args));
      const reveal = scoped((nodes) => {
        gsap.fromTo(nodes, { y: desktop ? 32 : 16, opacity: .35 }, {
          y: 0, opacity: 1, duration: desktop ? .85 : .5, stagger: .07,
          ease: 'power3.out', clearProps: 'transform,opacity',
        });
      });
      const scan = scoped(() => {
        const fresh = [...root.querySelectorAll(REVEAL)].filter(node => !seen.has(node));
        fresh.forEach(node => seen.add(node));
        if (fresh.length) ScrollTrigger.batch(fresh, {
          start: 'top 94%', once: true, interval: .08, batchMax: desktop ? 3 : 1,
          onEnter: reveal,
        }).forEach(trigger => triggers.add(trigger));
        root.querySelectorAll('[role="dialog"]').forEach(node => {
          if (seen.has(node)) return;
          seen.add(node);
          gsap.from(node, { y: desktop ? 24 : 12, opacity: .45, duration: .35, ease: 'power3.out', clearProps: 'transform,opacity' });
        });
        triggers.forEach(trigger => {
          if (!trigger.trigger?.isConnected) { trigger.kill(); triggers.delete(trigger); }
        });
      });
      context.add(() => {
        const title = root.querySelectorAll('.hero-title span');
        const intro = root.querySelectorAll('.hero-intro');
        const timeline = gsap.timeline({ defaults: { ease: 'power3.out', clearProps: 'transform,opacity' } });
        if (title.length) timeline.from(title, { y: desktop ? 55 : 24, rotation: 2, opacity: .1, duration: .7, stagger: .05 });
        if (intro.length) timeline.from(intro, { y: 18, opacity: .4, duration: .5 }, .2);
        if (document.documentElement.classList.contains('broski-intro-active')) {
          timeline.pause();
          const play = () => timeline.play();
          window.addEventListener('broski:intro-done', play, { once: true });
          context.add(() => () => window.removeEventListener('broski:intro-done', play));
        }
        if (desktop) root.querySelectorAll('.cinema-image, .story-photo img').forEach(image => {
          const tween = gsap.fromTo(image, { yPercent: -3 }, { yPercent: 3, ease: 'none', scrollTrigger: {
            trigger: image.parentElement, start: 'top bottom', end: 'bottom top', scrub: .7,
          } });
          triggers.add(tween.scrollTrigger);
        });
      });
      scan();
      const refresh = () => {
        if (refreshFrame) return;
        refreshFrame = requestAnimationFrame(() => { refreshFrame = 0; scan(); triggers.forEach(trigger => trigger.refresh()); });
      };
      const observer = new MutationObserver(refresh);
      observer.observe(root, { childList: true, subtree: true });
      const motionFor = card => {
        if (!cardMotion.has(card)) context.add(() => {
          gsap.set(card, { transformPerspective: 900 });
          cardMotion.set(card, {
            x: gsap.quickTo(card, 'rotationX', { duration: .55, ease: 'power3.out' }),
            y: gsap.quickTo(card, 'rotationY', { duration: .55, ease: 'power3.out' }),
          });
        });
        return cardMotion.get(card);
      };
      const reset = () => {
        cancelAnimationFrame(moveFrame); moveFrame = 0; latestPointer = null;
        if (hovered) { const pair = cardMotion.get(hovered); pair?.x(0); pair?.y(0); }
        hovered = null;
      };
      const paintPointer = () => {
        moveFrame = 0;
        const event = latestPointer;
        if (!event || !desktop || document.hidden) return;
        const card = event.target instanceof Element ? event.target.closest('.product-visual') : null;
        if (card !== hovered) reset();
        if (card) {
          hovered = card;
          const box = card.getBoundingClientRect(), pair = motionFor(card);
          pair.y(((event.clientX-box.left)/box.width-.5)*5);
          pair.x(-((event.clientY-box.top)/box.height-.5)*5);
        }
        cardMotion.forEach((pair,node) => {
          if (!node.isConnected) { pair.x.tween.kill(); pair.y.tween.kill(); cardMotion.delete(node); }
        });
      };
      const move = event => {
        if (!desktop || event.pointerType === 'touch') return;
        latestPointer = event;
        if (!moveFrame) moveFrame = requestAnimationFrame(paintPointer);
      };
      root.addEventListener('pointermove', move, { passive: true });
      root.addEventListener('pointerleave', reset);
      root.addEventListener('load', refresh, true);
      window.addEventListener('blur', reset);
      return () => {
        observer.disconnect(); cancelAnimationFrame(refreshFrame); cancelAnimationFrame(moveFrame);
        cardMotion.clear();
        root.removeEventListener('pointermove', move); root.removeEventListener('pointerleave', reset);
        root.removeEventListener('load', refresh, true); window.removeEventListener('blur', reset);
        context.revert();
      };
    }, root);
    return () => media.revert();
  }, []);
}

