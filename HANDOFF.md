# BROSKI Master Project Handoff

**Current Status:** PRODUCTION ACTIVE & SPRINT READY  
**Date:** 6 November 2026 · **Owner:** Lakshay · **CEO:** Rex  
**Live Production URL:** [https://broskipetfood.com/](https://broskipetfood.com/)  
**Live Billing Portal URL:** [https://broskipetfood.com/billing/](https://broskipetfood.com/billing/)  
**Target Commercial Launch Date:** Sunday, 15 November 2026 (T-9 Days)  
**Pilot Gate (15 Nov – 15 Dec 2026):** 150 Packs Sold + 30% Pet Shop Reorder Rate  

---

## 1. Digital Platform & Website Architecture

- **Hosting & Infrastructure:** Vite + React single-page application hosted on GitHub Pages (`LXSH2000/broskipetfood`). Branch `main` holds full source code; branch `gh-pages` serves static production bundles from `dist/`.
- **Zero-Downtime Deployment:** Built with `emptyOutDir: false` preserving hashed asset chunks and preventing 404 errors for cached visitors.
- **On-Site D2C Checkout Gateway:** Replaced pure WhatsApp redirect with an interactive on-site checkout modal (`BroskiCheckoutGateway.jsx`). Visitors select packs (Non-Veg ₹149, Mix ₹179, Bro Combo ₹299), enter pet details, street address, and payment method (Cash on Delivery or Instant UPI QR), generating a tracking Order ID.
- **Official GST Bill of Supply Generator (`/billing/`):**
  - Standalone, production-grade billing application compliant with GST Composition Scheme (Rule 49 of CGST Rules, 2017) for HSN 2309 10 00.
  - Generates official Bills of Supply for Pet Shops and Direct Consumers with automated number-to-words, trade schemes (11+1 box, 20-pack wholesale, D2C combo), dynamic UPI QR code generator for instant on-the-spot payment via PhonePe/GPay, and pixel-perfect A4 print styling.
- **Dedicated Sub-pages (Served from `public/`):**
  - `/billing/` — Official GST Bill of Supply & Retail Invoicing Generator.
  - `/offers/` — Bro Perks launch deals, bundle discounts, and repeat customer rewards.
  - `/r/` — Honest customer feedback & review capture form.
  - `/privacy/` — Privacy policy and data handling statement.
- **Mobile UX Refinement:** Liquid proximity bottom dock anchored to `left: 50%` with `transform: translate(-50%, 0)` on `width: max-content`, guaranteeing full centering across all viewport sizes.

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
- **Counter Tasting Jar Conversion Tool:** Each launch partner shop receives a complimentary clear acrylic counter jar pre-loaded with 20 fresh bone biscuits and a table-top tent card: *"Free Taste Test for Your Bro!"*. Dogs crunch on the spot; owners purchase immediately.
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
| **7–8 Nov 2026** | Call Scoobee bakery to lock 110 kg order (55 kg Non-Veg + 55 kg Mix) for pickup on 11/12 Nov; chase OLI for TM-A; get business SIM. | Lakshay & Arjun (Sales) |
| **9–10 Nov 2026** | Print front/back labels with Nangloi local printer; procure stand-up zipper pouches (275 pcs). | Lakshay & Rohan (Packaging) |
| **11–12 Nov 2026** | Pick up 110 kg bulk biscuits from Scoobee (Shalimar Bagh); arrival QA inspection. | Lakshay & Kavya (QA) |
| **12–14 Nov 2026** | Home packing run (275 packs) at 12A/3 Dharam Colony on stamped scale; box 12-pack cartons. | Lakshay & Sahil (Ops) |
| **15 Nov 2026** | **COMMERCIAL LAUNCH DAY:** First store drops (Route 1) + WhatsApp broadcast to dog parents. | Lakshay, Rex & Dev (E-com) |
| **15 Dec 2026** | **PILOT GATE REVIEW:** 150 packs sold + 30% shop reorder rate. Data-driven decision to scale. | Rex & Lakshay |
