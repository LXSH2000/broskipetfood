# Broski owner handoff

This folder is the Broski website copy. The launch helper uses **http://127.0.0.1:4174**. Start with `README.md`.

## Current boundary

This is a storefront preview with demo checkout. It is not connected to a payment gateway or dispatch service. A demo order confirmation does not mean money was collected or a parcel will be sent. Do not collect real customer orders through the preview.

This handoff documents the intended setup and the inspected startup interface; it does not certify that every page, animation, device or commerce flow has passed testing. Record final integration evidence after the implementation has settled.

## Owner inputs before selling

- Confirm the legal business name and rights to use **Broski**. Brand, trademark, domain and social-handle availability have **not** been checked.
- Supply actual recipes, ingredients, allergens, pack weights, pricing, shelf life, storage and feeding guidance. Review any nutritional or health statements with appropriate expertise. Replace all illustrative product details with verified information.
- Supply a working contact email/phone, business details, delivery regions, shipping charges and service times.
- Approve accurate privacy, purchase, cancellation, return/refund and shipping terms appropriate to the business and location.
- Select and connect the payment and fulfilment providers. Implement and verify payment confirmation, failed-payment handling, refunds, order status and customer communications.
- Arrange public hosting, domain, HTTPS, secure persistent order storage, access control, backups and operational support. Keep provider secrets on the server.
- Approve the generated visuals as brand illustrations or replace them with actual product photographs. Do not present generated dogs as customer testimonials or generated biscuits as verified product photos.

## Release evidence to record

September 30 polish: applied requested Claude Design Skillstack workflows; GSAP hero/scroll/dialog motion, optimized offscreen WebGL rendering, mobile shopping dock, larger touch controls, responsive modal layouts, shopping ritual filters, checkout summary and delivery progress. Added generated everyday lifestyle image and explicitly labeled sample-review diary cards. Fixed hidden-toast keyboard focus and aligned front-end 100-pack cart cap with backend. Final build and server tests passed; homepage and new image returned HTTP 200. Browser/device visual verification remains unavailable due the previously reported browser-tool restriction. Business/contact/payment/hosting setup explicitly deferred by owner. Launch helper now always rebuilds current source.

Current delivery checks: production build passed; server test suite passed (pricing integrity, coupon/shipping rules, validation, persistence and privacy); HTTP 200 confirmed for homepage, product API and both Broski generated images at port 4174. Independent source review found an IntersectionObserver fallback gap, which was fixed. Image outputs were visually inspected. New browser interaction/layout testing was not performed because the browser tool previously blocked local-page access. Three.js emits a bundle-size advisory (~502 kB uncompressed); it is lazy loaded. This is a completed branded local preview, not a live-commerce deployment.

Record the date, tested build and result for: production build; server tests; desktop and narrow-screen layout; keyboard navigation; reduced-motion behavior; product selection; cart quantity/remove behavior; checkout validation and demo confirmation; page reload; missing/failed API responses. For actual commerce, add provider sandbox tests and a verified end-to-end fulfilment procedure.

Keep test data separate from customer records. Do not commit `data/orders.json` or publish it as a static asset. The local server's existence does not establish production security or reliability.

## Launch helper verification

The helper changes directory using its own path, including paths with spaces. It calls npm through `call` so control returns to the batch script, stops on install/build failures, sets `PORT=4174`, and does not open a browser automatically. It rebuilds on each start to avoid stale previews.

## 2 October 2026 advanced site pass
Section specialists delivered advanced.css and a three-moment editorial Experience selector. Root added hero-stage entrance, magnetic desktop CTAs, page progress, reusable quickTo + rAF product tilt, and scene-specific error boundary/static fallback. Peer review fixed persistent live announcements, queued-pointer cancellation and progress refresh ownership. Build passed and backend test passed; HTTP 200 for homepage/products/editorial asset at http://127.0.0.1:4174. Preview server is running in exec session 54672; open-in-Codex requested. Actual browser/mobile/screens-reader interaction remains unverified due the existing browser access restriction; no Playwright workaround attempted. Demo checkout remains without payments or fulfilment. Saved project remains in this folder.

## 2 October restoration requested by owner
Restored previous appearance: removed advanced.css active import, added occasion editorial section/styles, reading progress, hero-stage entrance and magnetic CTA motion. Previous 5-degree product tilt retained using bounded quickTo implementation; scene error boundary remains as invisible resilience. Build passed. Latest advanced version source preserved in backups/before-restore-2026-10-02. Preview remains at http://127.0.0.1:4174; browser visual validation not run.

## 6 October 2026 review-only council
Design and technical specialists reviewed restored source and exchanged decisions; implementation unchanged. Build and backend test suite passed; root restarted preview session 77570 at port 4174 and HTTP checks passed. Browser/device/assistive-technology acceptance not run under existing restriction. Council recommends API recovery, image optimization, decorative-motion stop path, repeated-add feedback and targeted mobile readability. Detailed review/decisions files saved in this folder. Regional sourcing report and contacts CSV saved in broski launch plan; no supplier contacts or purchases executed.

## 12 October 2026 opening animation
Added src/Intro.jsx + src/intro.css: a ~4.5 s GSAP intro (handwritten Broski stroke-draw, rust underline, biscuit drop with squash-and-bounce, logo wag, paw prints, tagline rise, cream-over-rust wipe). Plays once per browser session, never with reduced motion; click, Escape/Enter/Space or "Skip intro" skips; ?intro=1 forces a replay. motion.js now holds the hero entrance until the intro ends. Previous main.jsx/motion.js saved in backups/before-intro-2026-10-12. Built in a separate Linux copy and copied into dist; START-WEBSITE.cmd rebuilds from source on next start.
