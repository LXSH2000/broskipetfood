# Broski council decisions and release checklist

6 October 2026. Operating base: West Delhi. Scope: review the restored site and research sourcing; no redesign or live-commerce deployment was requested or performed in this pass.

## Council conclusion

Preserve the restored visual design. Prioritize reliability, useful feedback and mobile readability before adding more animation. The source review found no established P0 defect in the local demo; this is not a declaration that every browser, device or assistive technology passes.

The design and technical specialists exchanged findings. ATLAS integrates the result; sourcing is a separate specialist lane. The local council skill is a broken pointer, so this is direct peer discussion rather than a loaded council workflow. Roles operate during this task, not as permanent background processes.

## Ranked changes to propose

| Priority | Change | Why / acceptance evidence |
|---|---|---|
| P1 | Bound product loading with timeout, retry and stale-request handling | A never-settling fetch currently leaves the skeleton indefinitely. Test stalled, offline, retry and late old response. |
| P1 | Stop the floating decorative card after an entrance, or extend a clear motion toggle | The 3D pause does not cover its separate infinite CSS float. Verify reduced motion and the visible pause state without moving the artwork. |
| P1 performance | Optimize large image delivery and measure mobile load | Four PNGs total about 8.9 MB according to technical inspection. Generate suitable responsive formats/sizes, preserve originals and measure before claiming speed improvements. |
| P2 | Refresh feedback on repeated Add actions | Identical toast text does not restart the dismissal timer or guarantee a fresh announcement. Use an event ID/product-specific status and test rapid repeated adds. |
| P2 | Raise essential mobile text carefully | Some product metadata and controls use 8–11px text. Target readable sizes and verify wraps at 320/360/390/768px and 200% text zoom; retain the preferred collection layout. |
| P2 | Bound newsletter requests and prevent duplicate pending submissions | Current preview can remain at Checking indefinitely. No real subscription currently occurs. |
| P2 resilience | Normalize stored cart and reconcile startup documentation | Deduplicate IDs/cap total quantities after hydration; align README with the launch helper's actual rebuild behavior. |

Do not reapply advanced.css, turn the collection into a different layout, add more automatic movement, remove existing sections or change products/prices merely because a reviewer prefers it. Optional play-section shortening is a hypothesis to test with shoppers, not a mandated redesign.

## Verification performed and outstanding

Production build and the existing backend test suite passed in the technical review. Homepage, product API and generated product asset returned HTTP 200 after ATLAS restarted the local server at http://127.0.0.1:4174/. Backend tests use isolated test data; successful tests do not certify production security.

Browser/local-page automation had an existing access restriction; no alternate browser/Playwright workaround was used. Rendered mobile layout, actual keyboard/touch interactions, screen-reader announcements, measured contrast over photos and real-device performance remain unverified. Source checks are useful evidence but cannot replace those tests.

## Practical test matrix for the next permitted browser session

| Area | Actions and expected outcome |
|---|---|
| Navigation | Menu at narrow widths; Escape closes; shop/story/FAQ links land visibly without the dock hiding essential controls. |
| Catalog | All filters, search, sorting, no-results state, stalled API and retry; counts and visible products agree. |
| Product | Open/close details, repeat Add, quantity limit; keyboard focus remains visible and returns appropriately. |
| Bag | Change quantity, remove the focused row, empty bag, coupon valid/invalid, shipping threshold; API total agrees. |
| Demo order | Invalid fields, success, timeout, double submit, server failure, retained cart; no real money or dispatch claim. |
| Accessibility | Tab/Shift+Tab, Escape, inert background, focus restoration, FAQ summaries, live statuses, text zoom, touch target testing. |
| Motion | Pause, keyboard 3D controls, reduced motion on/off, touch scrolling, offscreen/document-hidden behavior and load fallback. |
| Recovery | Reload cart, corrupt/legacy local storage, failed lazy scene chunk, unavailable image and offline API. |
| Responsive | 320, 360, 390, 768 and 1440px; portrait/landscape; inspect overflow, long product names and modal scrolling. |

## Before commercial release

Actual released product, ingredients, pricing, pack details and supported feeding/storage guidance; actual seller/contact/policies and serviceable PINs; secure payment confirmation and order storage; shipping/refund reconciliation; real photographs and genuine consented customer feedback. Sample reviews and generated packaging remain concepts. The demo's intentional non-retention of fulfilment contacts prevents dispatching real orders.

## Ownership and subsequent changes

ATLAS coordinates the accepted scope, integrates evidence and records decisions. Frontend specialist implements accepted reliability changes; design/accessibility reviewer checks the same restored appearance and mobile flows; technical reviewer checks tests, errors and lifecycle behavior. Sourcing specialist checks each written supplier quote against product, label, safety and cash requirements.

Run this checklist after meaningful changes. This saved governance record does not create autonomous monitoring, recurring reviews or a live deployment. No supplier contacted, sample purchased or ad launched during the review.
