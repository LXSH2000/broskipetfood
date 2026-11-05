# Advanced animation review

Review started 2 October 2026. Independent read-only review of site implementation; this file is the only reviewer-owned artifact. Frontend-developer workflow previously read in this task applied. Review covers source behavior and backend verification, not visual browser approval.

## Evidence

- `npm test` passed: one integrated server suite, covering server-owned totals, coupons/free-delivery boundaries, validation, concurrent persistence, customer-data omission and newsletter demo behavior.
- Inspected main.jsx, Modal.jsx, motion.js, TreatScene.jsx and server.mjs.
- Modal has inert background isolation, dynamic focus containment, Escape handling, restoration and locked pending-checkout behavior.
- Three scene already caps mobile DPR, suspends frames offscreen/hidden, offers arrow/Home rotation, responds to reduced motion and has observer fallbacks.
- No browser workaround was used. Prior local-page policy block means rendered mobile, touch and visual correctness remain unverified.

## Findings sent to coordinator

1. Motion hook creates a new GSAP tween inside its tracked context on every pointermove. GSAP retains each tween in context.data until context teardown; overwrite stops active work but does not bound this retained history. Use reusable quickTo controllers per live target instead of per-event tween creation. Relevant installed GSAP source confirms context.data.push for created animations.
2. Lazy TreatScene has Suspense but no scene-specific error boundary in the reviewed main.jsx. A rejected chunk fetch can take down the storefront. Add a contained static scene fallback, preserving shopping functions.

## Integration status

Experience and advanced CSS edits were still in progress at initial review. Final source recheck and coordinator build result must be added after integration. This document does not claim public deployment or live payment readiness; checkout remains explicitly a local demonstration.

## Integration recheck

Source rechecked after both workers integrated: advanced.css uses scoped rules, coarse/mobile layouts and reduced-motion overrides; Experience adds native pressed-state moment buttons without an autoplay loop. Its initially keyed live region was moved to a persistent wrapper after review so screen-reader announcements can observe content changes. No manual assistive-technology result is claimed.

Coordinator resolved both principal findings: motion now uses reusable quickTo controllers and rAF-coalesced pointer input; a dedicated SceneBoundary catches lazy scene errors and retains the shop. Two final minor observations were sent: cancel stale queued pointer frames on leave/blur; register the reading-progress trigger in the owned refresh set so dynamic content updates its endpoint. These await coordinator confirmation at time of this note.

Council correspondence: CSS worker confirmed no new animation loops and 44px-or-larger key controls; Experience worker confirmed offscreen/hidden cleanup, touch scrolling preservation, reduced-motion overrides and JSX compilation. Independent source inspection supports those implementation descriptions, not a visual viewport certification. The coordinator owns the final production build and preview tool outcome.

Final integration: root fixed queued-pointer cancellation and tracked progress trigger in refresh set, with explicit connected root trigger. Final production build and isolated backend test passed; HTTP checks passed at port 4174. Source checks are complete; rendered visual/real-device and assistive-technology tests remain not run under the existing browser restriction.
