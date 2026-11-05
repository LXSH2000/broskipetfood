# Restored Broski: design and accessibility council review

6 October 2026. Read-only source review using agency-accessibility-auditor and the previously loaded frontend skill. No website source was changed. Preserve the restored warm palette, handwritten typography, dog imagery, existing two-column mobile collection and playful brand personality. Do not reapply the rejected advanced.css redesign.

## Scope and limits

Inspected main.jsx, Modal.jsx, motion.js, Experience.jsx, TreatScene.jsx and the current CSS cascade. Browser/local access was previously blocked; no Playwright or alternative access workaround was attempted. Actual rendering, contrast over images, touch hit-testing, zoom, screen-reader behaviour and real-device performance remain unverified. This is not a WCAG conformance certification. CSS files contain long compressed lines; references below identify both line and selector.

## Ranked recommendations

**P0 — none established for this demo by source inspection.** This does not approve real commerce: the site explicitly uses sample recipes, prices, endorsements and demo checkout.

### P1: Bound product loading and expose recovery

Evidence: `src/main.jsx:21` fetches `/api/products` without an AbortController or timeout. The skeleton in `main.jsx:33` remains while `loading` is true; `launch.css:4` animates `.product-skeleton` indefinitely. A request that never settles leaves the shop unavailable and offers no Retry control. Recommended: bounded request with helpful timeout/retry state, retaining the current skeleton appearance. Test stalled request, offline, successful retry and a late earlier response. WCAG 4.1.3 status-message treatment is relevant; an actual failure is not asserted for a normally responding server.

### P1: Make the visible pause control cover persistent decorative movement

Evidence: `src/redesign.css:2` gives `.floating-treat` `gentle-float 7s ease-in-out infinite`; keyframes are on line 3. `main.jsx:32` passes `paused` only to TreatScene. Thus pausing the 3D pouch does not pause the independently floating linked card. Reduced-motion CSS helps users who set an OS preference, but is not the same as an on-page pause mechanism for everyone. Stop the decorative float after a short entrance, or extend a clearly labelled motion toggle to it. Preserve the graphic and its placement. Relevant criterion: WCAG 2.2.2 Pause, Stop, Hide; verify actual simultaneous visibility and control behaviour in browser before making a final conformance finding.

### P2: Increase essential small-screen text without changing the layout

Evidence: `src/launch.css:6` sets mobile `.product-tag` to 8px, `.product-meta` to 9px, `.product-bottom p` and `.add-button` to 11px. Metadata contains pack weight and product type, not merely decoration. Proposal: target 12–14px for essential metadata and button labels, keep the existing two-column structure initially, allow comfortable wraps, and verify at 320/360/390/768px plus 200% text zoom. Small type alone is not a WCAG violation; the concern is readability and potential reflow/spacing failure (1.4.4, 1.4.10, 1.4.12). Do not assume overflow without rendering evidence.

### P2: Refresh feedback for every Add action

Evidence: `main.jsx:22` starts the 3.5-second dismissal timer only when `toast` changes; `main.jsx:24` repeatedly sets the same “Added to your treat bag.” string. A second add during the visible toast does not change that state, restart the timer or reliably trigger a new live-region announcement. Recommend an event identifier or separate expiry timer, preferably a product-specific message; preserve the visual toast. Test three repeated adds, count updates, keyboard activation and screen-reader announcements. Relevant criterion: 4.1.3 Status Messages. Existing bag-count changes are helpful but not equivalent to guaranteed announcement.

### P2: Reduce optional browsing friction while keeping the playful section

Evidence: `main.jsx:32–33` places the hero, interactive Experience section and ticker before products. Hero “Shop the treats” and mobile dock already offer shortcuts; retain these. Hypothesis to test: a first-time mobile buyer may benefit from a shorter or initially collapsed optional play section, or a clearly visible “See the treats” anchor within it. Do not remove or reorder whole sections merely on this source review. Measure first product reach and task completion with five users before deciding; actual screen heights and scroll effort are unverified.

## Secondary maintenance items

- `main.jsx:30`: newsletter request lacks a timeout and pending-submit lock. A stalled request can leave “Checking…” indefinitely and permit repeated submissions. Low impact in this demo because no real subscription is created; use the same bounded-request pattern when touched.
- `main.jsx:20`: stored cart is checked per row but is not deduplicated or capped across all rows. Corrupt/legacy local storage can yield duplicate product keys or a server-rejected cart. Normalise unique IDs and total quantity during hydration; this is resilience work, not evidence of a normal shopper exploit.
- `main.jsx:39`: the interactive “View bag” toast sits outside the modal and is correctly made inert while a modal is active. In product detail, adding a product can therefore show a visible but inactive toast action. Consider an in-modal bag link or a status-only toast while the dialog is open; verify actual stacking before prioritising. Do not weaken modal inertness to make an outside action clickable.

## Existing safeguards worth preserving

Modal.jsx isolates siblings with inert, traps focus, handles Escape, restores focus and locks dismissal while checkout is pending. Checkout has a timeout and duplicate-submit ref. TreatScene has keyboard rotation/reset, reduced-motion handling, intersection/document-visibility suspension and cleanup. Experience uses bounded particles, passive pointer input, no touch-scroll interception, offscreen/hidden cancellation and reduced-motion guards. Motion reveals begin when entering rather than permanently hiding the whole document. Buttons and controls already have many explicit 44px minimum targets. Product prices and demo-only restrictions are exposed in text, and sample reviews are labelled as illustrative.

These safeguards are source evidence, not substitutes for assistive-technology testing. Verify modal transitions, focus return after removing a cart row, expanded FAQ navigation and dynamic status announcements when browser access is legitimately available.

## Council decision proposed

First implement only the loading recovery and persistent-motion fix, then feedback and small-type adjustments. Keep appearance and two-column collection intact; treat optional section changes as a user-test decision. No claim of higher conversion is justified without measurement. Release check: mobile menu → filter → detail → add twice → bag → coupon → demo checkout → error/retry → success, keyboard and touch, with reduced motion enabled and disabled. No recommendation authorises deployment, real checkout, invented reviews or health claims.
