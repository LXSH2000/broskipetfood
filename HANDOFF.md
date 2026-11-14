# BROSKI Master Project Handoff

**Current Status:** GSTIN ISSUED (07BONPL7742A1ZW), SITE POLISHED & PACKAGING V18 ALIGNED  
**Date:** 14 November 2026 · **Owner:** Lakshay · **CEO:** Rex  
**Live Production URL:** [https://broskipetfood.com/](https://broskipetfood.com/)  
**Live Billing & Scheme Hub:** [https://broskipetfood.com/billing/](https://broskipetfood.com/billing/)  
**Active Support / WhatsApp Number:** `+91-9821563468`  
**Target Commercial Launch Date:** Sunday, 15 November 2026 (T-1 Day)  
**Pilot Gate (15 Nov – 15 Dec 2026):** 150 Packs Sold + 30% Pet Shop Reorder Rate  

---

## 1. Digital Platform & Website Architecture

- **Hosting & Infrastructure:** Vite + React single-page application hosted on GitHub Pages (`LXSH2000/broskipetfood`). Branch `main` holds full source code; branch `gh-pages` serves static production bundles from `dist/`.
- **Site Polish & Animation Optimization (14 Nov 2026):**
  - Integrated `polish.css` and `polish.js` with view transitions `@view-transition { navigation: auto; }`.
  - WhatsApp phone number synchronized to `9821563468` (`919821563468`) across `public/config.js`, `src/config.js`, and `public/r/index.html`.
  - Converted heavy pouch imagery to ultra-light WebP format (`broski-pouch-nonveg.webp`, `broski-pouch-mix.webp`, `broski-hero-duo-studio.webp` — over 94% compression savings!).
  - Purged 100MB+ of unused large video duplicates (`Broski_Hero_Ad_16x9_1080p.mp4`, `broski-hero-mobile.mp4`, `broski-hero-desktop.mp4`, `broski-story-video-1.mp4`, `broski-story-video-2.mp4`) and 21 stale build hashes from `dist/assets/`.
  - Product card action buttons renamed to clean `"Order now"`.
  - Real Scoobee back-label ingredients incorporated into the public FAQ ("What's in the treats?").
  - Packshot imagery updated to reflect the new v18 die-cut bone sticker (`BROSKI - Good Boy Snacks -`) and side pill labels.
- **Batch 1 Product Reality (Peanut Butter Completely Removed):**
  - Active products:
    1. **Bro Bites – Classic Crunch 400g** (MRP ₹149 / Wholesale ₹100)
    2. **Bro Mix – Happy Mix 400g** (MRP ₹179 / Wholesale ₹120)
    3. **Bro Combo 800g** (MRP ₹299 / Wholesale ₹220)
- **Apple-Grade Billing & Scheme Studio (`/billing/`):**
  - **Authentic Brand Mark:** Features the official dark chocolate (`#352016`) rounded square emblem with the golden biscuit bone silhouette (`#f5e8cf`) matching packaging and `favicon.svg`. Bold Outfit 800 wordmark with tight optical letter-spacing and registered MSME/Bakery FSSAI credentials.
  - **Editorial Minimalism:** Parchment background (`#f7f4ee`), hairline borders (`#e8dfd3`), soft ambient elevation, and segmented toggle controls (Bill of Supply vs Rule 55 Delivery Challan).
  - **Monospace Typography:** `JetBrains Mono` for all financial figures, quantities, and HSN codes.
  - **Dynamic Trade Margin & Scheme Engine:**
    * **11+1 Retail Launch Box:** ₹1,100 outlay, ₹1,788 retail sales, **₹688 shopkeeper profit (38.5% margin!)** vs Pedigree 18% (~₹328).
    * **20-Pack Master Carton:** 10 Non-Veg + 10 Mix @ ₹2,149 outlay, ₹3,280 retail sales, ₹1,131 profit (34.5% margin).
    * **D2C Bro Combo:** 2-pack bundle @ ₹299.
    * **10 Sampler Drop:** Complimentary 50g pouches + tasting jar on 15-day 100% cash buyback guarantee.
  - **Live Retailer Profit Snapshot:** Embedded sidebar analytics displaying real-time shop profit and margin comparisons on every keystroke.
  - **Persistent Dual-Layer Storage:** Client-side `IndexedDB` (`broski_billing_db`) with `localStorage` fallback and background cloud sync (`/api/invoices`).
  - **Records Drawer:** Searchable and filterable database drawer allowing instant search by shop name, phone, or invoice number; filters by Paid / Due / Challans; one-click status cycling (`PAID` ↺ `DUE`); one-click invoice loading, re-printing, and WhatsApp sharing.
  - **Data Export & Cloud Backup:** One-click Excel/CSV export (`BROSKI_Invoices_YYYY-MM-DD.csv`), full JSON backup download, and instant JSON restore file picker.
  - **Dynamic UPI QR:** Real-time generation of scan-to-pay QR linking to Lakshay's UPI VPA (`lakshay9643@oksbi`) with dynamic grand total.
- **Dedicated Sub-pages (Served from `public/`):**
  - `/billing/` — Official GST Bill of Supply & Delivery Challan Hub with Persistent Database.
  - `/offers/` — Bro Perks launch deals, bundle discounts, and repeat customer rewards.
  - `/r/` — Interactive Bro Voice & Text Review Portal with 5-Paw rating and instant Free 50g Sample Voucher generation.
  - `/privacy/` — Privacy policy and data handling statement.
- **Mobile QA Verification:** Passed 50/50 automated Playwright browser tests across desktop (1440×900) and mobile (390×844) viewports with 0 layout overflow and 0 console errors.

---

## 2. Marketing Launch Suite & Offline Retail Collateral

Rex and the executive team reviewed Lakshay's marketing requirements and generated production-ready physical and digital assets:

### A. Print-Ready A5 Retail Counter Card (`marketing/BROSKI_A5_Retail_Counter_Card.html`):
- High-contrast table-top card designed for A5 acrylic stands on pet shop billing counters.
- Highlights:
  - 38.5% Gross Margin comparison (BROSKI ₹688 profit vs Pedigree ₹328 profit per 12-pack carton).
  - Clear Window Pouch USP ("Look through the window, real oven-baked golden crunch, zero sawdust mess").
  - 15-Day 100% Cash Buyback Guarantee by Lakshay personally.
  - QR Code linking to `https://broskipetfood.com/` for dog parents to view reviews and feeding guidelines.

### B. West Delhi WhatsApp Broadcast Marketing Pack (`marketing/BROSKI_WhatsApp_Marketing_Pack.md`):
- **Script 1:** Direct-to-Consumer launch announcement for local pet parents (Nangloi, Paschim Vihar, Janakpuri, Punjabi Bagh) offering the ₹299 Bro Combo or Free 50g Sampler.
- **Script 2:** Pet shop wholesale partner pitch detailing the 11+1 scheme, 38.5% margin, and counter tasting jar.
- **Script 3:** Post-visit digital challan delivery and reorder check-in message.
- **Script 4:** West Delhi dog park and community society group announcement.

### C. Retail Sales Diary & 15-Store Pipeline Tracker (`marketing/BROSKI_Retail_Sales_Diary_Tracker.html` & `.md`):
- Printable A4 landscape sales diary and digital pipeline pre-mapped with 15 high-potential West Delhi pet shops across Nangloi, Paschim Vihar, Rajouri Garden, Tilak Nagar, Janakpuri, Vikaspuri, Punjabi Bagh, and Uttam Nagar.
- Tracks store visit date, owner phone, trade scheme placed, pack breakdown, payment mode, Rule 55 challan number, and Day 7 follow-up date.

---

## 2. Omnichannel Launch & "Boom" Strategy (Zero Loss Guarantee)

Rex and the executive team reviewed Lakshay's Excel models and designed the omnichannel launch architecture to guarantee volume without burning cash:

### A. Offline Pet Shop Launch ("The Bro Counter Box"):
- **The 11 + 1 Scheme:** Pet shops order 1 box (12 pouches of 400g). They pay for 11 packs (₹1,100 @ ₹100/pack), and get the 12th pack 100% FREE.
- **Effective Wholesale Rate:** ₹91.67 per pack.
- **Shopkeeper Economics:**
  - Investment: ₹1,100 per carton.
  - Retail Realization: 12 packs × ₹149 MRP = ₹1,788.
  - **Shopkeeper Profit: ₹688 (38.5% margin, 62.5% ROI on capital).**
  - Compare to Pedigree Biscrok (18% margin, ₹328 profit on ₹1,460 investment). BROSKI delivers **MORE THAN DOUBLE** the shopkeeper's profit!
- **Table-top Counter Card:** Compact tent card explaining the 38.5% margin and 100% buyback guarantee (display jars eliminated to save ₹950 outlay).
- **100% 15-Day Buyback Guarantee:** Zero risk for shopkeepers. Any unsold, undamaged packs are bought back in full cash within 15 days.

### B. Online D2C Launch ("The Bro Welcome Crate"):
- **Hero Offer:** The Bro Combo (1 Non-Veg 400g + 1 Mix 400g) for ₹299 + Free Delivery across West Delhi + Free 50g Pocket Bone Sampler.
- **Unit Margin:** Landed cost ₹96.09 + Courier ₹45.00 = ₹141.09 cost. Net cash profit = **₹157.91 per order (52.8% net margin)**.
- **WhatsApp Bro Club Loyalty:** Back sticker QR code registers pet parent on WhatsApp with dog's name and birthday for an automatic birthday treat box on next order, securing high lifetime retention.

---

## 3. Financial Truth & Excel Audit (`Broski_Business_Model_Upgraded.xlsx`)

- **Audit of Lakshay's Original Sheets:**
  - Audited `Broski_Cost_and_Profit_Sheet.xlsx` (24 Oct), `Broski_Financial_Model_FY27.xlsx` (28 Oct), and `Broski_Business_Model.xlsx` (30 Oct) in `C:\Users\lxshl\Downloads\_Office & Docs\`.
  - Identified that assuming ₹9,500/month broad marketing in Month 1 projected an artificial pilot loss of -₹1,727.
  - By shifting Month 1 to community/hyper-local zero-CAC distribution, the pilot batch of 100 kg flips to **+₹4,060 pure net cash profit**.
- **Upgraded Master Excel Generated:**
  - Created and saved `Broski_Business_Model_Upgraded.xlsx` in `C:\Users\lxshl\Downloads\_Office & Docs\` and `broski launch plan/`.
  - Includes: `Executive_Summary`, `Offline_Retail_Strategy`, and `Pilot_100kg_Proof_Of_Profit`.
  - **Proof of No Loss:** Total 100 kg batch cost = ₹13,660. Realization from 150 packs (10 retail cartons + 30 direct packs) = ₹17,720. Net profit = **+₹4,060 cash profit** with 70 packs left on hand worth ₹3,377 in inventory.

---

## 4. Curated Skills & Autonomous Corporate Cadence

- **Active Skill Library:** Curated down to 220 high-value business, marketing, sales, finance, and frontend skills.
- **Autonomous Operations Cadence:**
  - **09:30 IST — Daily Executive Briefing:** Rex delivers the prioritized action list to Lakshay.
  - **10:00–17:00 IST — Autonomous Department Execution:** The 11 departments work autonomously across vendor coordination, packaging design, marketing content, and retail mapping.
  - **18:00 IST — Evening Close & Verification:** Rex evaluates task completion, updates `HANDOFF.md`, and prepares the next day's roadmap.

---

## 5. Critical Launch Milestones

| Date | Milestone / Event | Department / Owner |
|---|---|---|
| **7 Nov 2026** | **GST REG-04 SUBMITTED (DONE):** Clarification & 6-page verified PDF filed on gst.gov.in under ARN AA071026132029K (6 days early). | Lakshay & Maya (Legal) |
| **10 Nov 2026** | **WEBSITE SOLUTION PACK DEPLOYED (DONE):** Single source config, Rule 55 challan, dynamic UPI QR generator, pincode checker, 11+1 launch box, zero-hit audit passed (3/3 unit tests pass), deployed live to production (https://broskipetfood.com/ via commit f7130fe). | Rex & Dev (E-com) |
| **12 Nov 2026** | **STICKERS ORDERED, TM POA READY, BILLING & MARKETING PACK DEPLOYED (DONE):** Stickers ordered from Nangloi printer for ₹2,110 (~150 sets); TM-48 POA prepared for Online Legal India; Invoicing & Scheme Mega Hub upgraded with persistent IndexedDB, search drawer, CSV/JSON export/restore, dynamic 38.5% margin calculator, and server sync; Print-ready A5 Counter Card, WhatsApp Broadcast Pack, and 15-Store Retail Diary completed and verified. | Lakshay, Rex, Arjun & Meera |
| **13 Nov 2026** | **GSTIN ISSUED & BUSINESS SIM ACTIVE (DONE):** GSTIN `07BONPL7742A1ZW` (Regular Registration) granted by Superintendent Vikram Pal (Mundka); Form GST REG-06 certificate downloaded and archived; Business SIM arrived; Billing studio updated with official GSTIN; DP and WhatsApp branding pack delivered. | Lakshay, Rex & Meera (Legal) |
| **14 Nov 2026** | **GOOGLE SEARCH CONSOLE, TAG MANAGER & WORDMARK LIVE (DONE):** Site verified on Google Search Console via HTML verification token; Sitemap `sitemap.xml` submitted and verified with green "Success" (5 discovered pages including `/partner/`); Google Tag Manager container `GTM-WHMRKDWX` installed immediately after `<head>` across all 5 site pages (`/`, `/offers/`, `/partner/`, `/r/`, `/privacy/`) and verified live on CDN; Official packaging BROSKI vector wordmark deployed across header and footer. | Lakshay & Rex |
| **14 Nov 2026** | **BAKERY PICKUP & PACKING RUN:** Pick up 120 kg bulk biscuits from Scoobee (Shalimar Bagh); arrival QA; home packing run (300 packs @ 402g–404g target) at 12A/3 Dharam Colony on stamped scale; box 10 retail cartons (11+1 free); collect stickers from Nangloi printer. | Lakshay, Kavya & Sahil |
| **15 Nov 2026** | **COMMERCIAL LAUNCH DAY:** Route 1 pet shop drops (Nangloi & Paschim Vihar - 5 shops) + WhatsApp D2C broadcast to dog parents. | Lakshay, Rex & Dev (E-com) |
| **15 Dec 2026** | **PILOT GATE REVIEW:** 150 packs sold + 30% shop reorder rate. Data-driven decision to scale. | Rex & Lakshay |
