# Broski technical council review — 6 October 2026

## Decision

**PASS for build and supplied local-demo API checks. NEEDS WORK for browser/device acceptance. NOT READY for live commerce.** No implementation was changed during this review. Preserve the restored visual direction; the recommendations below are targeted reliability, accessibility and performance work.

Reviewed current main.jsx, Modal.jsx, motion.js, TreatScene.jsx, Experience.jsx, SceneBoundary.jsx, active CSS, server.mjs, server.test.mjs, package.json, README, HANDOFF and START-WEBSITE.cmd. Applied the previously loaded frontend-developer workflow, rediscovered through the skill index. The council workflow placeholder is broken; this review used actual peer discussion with the design reviewer instead.

## Evidence

- `npm test`: PASS, one integrated Node test, zero failures. Assertions cover server-owned prices, coupon/shipping thresholds, invalid/duplicate items, quantity limits, customer validation, concurrent persistence, absence of customer details in stored records, demo newsletter responses, selected security headers, missing assets/routes and oversized request bodies. This is not UI coverage or a comprehensive penetration test.
- `npm run build`: PASS, Vite 7.3.6, 43 modules. Three chunk approximately 505.11 kB raw / 128.17 kB gzip triggers a size advisory; main approximately 384.64 kB raw / 129.60 kB gzip. A successful build does not establish runtime frame rate or layout quality.
- Browser/device interaction was not tested: local-page access was previously blocked by browser tooling. No alternate browser or Playwright workaround was attempted. No Lighthouse, contrast measurement, screen-reader certification or visual acceptance is claimed.
- Launch helper source check: resolves its own directory, checks Node/npm, installs if Vite is missing, always builds, aborts on failures, sets PORT=4174 and starts the localhost server. The batch helper itself was not executed because it would start a persistent interactive process.

## Five priorities, in order

1. **Bound loading and submission waits.** `src/main.jsx:21` fetches products without cancellation or timeout; a stalled request leaves loading skeletons indefinitely and never exposes retry. `src/main.jsx:30` newsletter handling similarly lacks a timeout and in-flight guard. Add bounded waits, cleanup and explicit retry feedback; retain the existing appearance. Validate offline, stalled response, malformed data and recovery. Checkout already has a 20-second timeout and duplicate-click guard.
2. **Reduce transferred imagery, then measure real mobile behavior.** The four supplied PNGs total 8,909,050 bytes (about 8.5 MiB). Produce appropriately sized modern-format variants and responsive image selection while preserving originals and art direction. Lazy scene import still begins when its initial hero renders; consider deliberate mobile/visibility loading only after measurement. Validate image quality, network transfer, loading shifts and frame rate on an actual narrow-screen device. Chunk size alone is not evidence of poor frame rate.
3. **Give continuous decorative motion an explicit stop path.** `src/redesign.css:2` runs the floating treat animation indefinitely. Reduced-motion CSS disables it, but the hero's pause button only controls the Three scene. Prefer a finite entrance/settle or a clearly scoped page-motion control; do not silently change a button labeled “Pause 3D motion” into an unrelated control. Keep interactive tossing and the preferred visual styling. Verify both OS reduced-motion and keyboard controls in browser.
4. **Verify mobile legibility and navigation without redesigning.** The design reviewer identified 8–11px metadata in mobile CSS. Increase essential reading text selectively while preserving the preferred product grid; confirm no clipping at 320px, 390px and 200% zoom, visible focus, cart/modal scroll and touch scrolling across the scene. Source contains 44px minimum controls and `touch-action: pan-y`; neither establishes actual device acceptance. Moving/collapsing the playful section is optional product testing, not a required technical fix.
5. **Refresh repeated action feedback and correct launch documentation.** `src/main.jsx:22–24` uses the same toast string for consecutive adds, so a later add does not restart its 3.5-second timer or reliably produce a new live announcement. Use an event counter or timer ref while keeping the existing toast. `README.md:21` says the helper reuses a build, contradicting the actual always-build helper and README introduction. Correct this one sentence.

## What appears sound by source

- Modal traps keyboard focus, supports Escape when unlocked, makes background siblings inert, observes changes, restores body scrolling and restores focus on cleanup. Pending checkout locks dismissal; selected errors retain the cart.
- Motion scopes GSAP context and trigger ownership, avoids global cleanup, honors reduced motion, and limits hover tilt to fine-pointer desktop. Pointer work is coalesced and listeners/frames are cleaned up.
- Three scene suspends offscreen and when the document is hidden; caps mobile DPR, offers keyboard rotation, preserves vertical touch scrolling, has observer fallbacks and disposes resources. Error boundary/static fallback protects access to the shop if the decorative scene fails.
- Experience trails avoid touch hover, stop offscreen/hidden/reduced-motion, use a bounded pool and clean up their frame/listener work.
- Server binds to 127.0.0.1. Order totals are recomputed server-side; body size and customer fields are validated; queued atomic writes avoid overlapping updates within one process. Saved demo orders omit submitted customer contact/address information. Newsletter does not create a subscription. These are local-demo protections, not production infrastructure.

## Live-commerce release blockers

Real owner-approved products, ingredients/feeding/allergen information, inventory, contact details and legal/policy content remain necessary. Current six-product demo prices and shipping must not be confused with the separate one-SKU business plan. Before public selling, implement and test payment provider sandbox flow, server-side payment verification, idempotency, order status/fulfilment, refunds, authenticated administration, persistent transactional storage/backups, abuse controls and an actual personal-data handling policy. The present demo deliberately neither takes money nor dispatches goods.

## Council outcome

Design peer and technical reviewer agreed: no demonstrated fatal local-demo defect; preserve the restored design. Prioritize bounded API waits, motion control, small-screen readability and repeat-action feedback. Technical review additionally prioritizes the measured image payload before changing page order. Actual browser/device verification remains the main evidence gap. No external communications, purchases, deployment or source fixes were performed.
