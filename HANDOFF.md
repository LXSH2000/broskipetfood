# BROSKI Master Project Handoff

**Current Status:** PRODUCTION ACTIVE & SPRINT READY  
**Date:** 6 November 2026 · **Owner:** Lakshay · **CEO:** Rex  
**Live Production URL:** [https://broskipetfood.com/](https://broskipetfood.com/)  
**Target Commercial Launch Date:** Sunday, 15 November 2026 (T-9 Days)  
**Pilot Gate (15 Nov – 15 Dec 2026):** 150 Packs Sold + 30% Pet Shop Reorder Rate

---

## 1. Digital Platform & Website Architecture

- **Hosting & Infrastructure:** Vite + React single-page application hosted on GitHub Pages (`LXSH2000/broskipetfood`). Branch `main` holds full source code; branch `gh-pages` serves static production bundles from `dist/`.
- **Zero-Downtime Deployment:** Built with `emptyOutDir: false` so prior hashed asset chunks are preserved, preventing 404 errors for cached mobile visitors.
- **Direct WhatsApp Ordering:** The complex shopping cart and checkout drawer were replaced with instant 1-tap WhatsApp order routing to the business phone line (`918076045934`). Pre-filled WhatsApp messages specify product variant and pricing.
- **Dedicated Sub-pages (Served from `public/`):**
  - `/offers/` — Bro Perks launch deals, bundle discounts, and repeat customer rewards.
  - `/r/` — Honest customer feedback & review capture form.
  - `/privacy/` — Privacy policy and data handling statement.
- **Mobile UX Refinement:** Liquid proximity bottom dock was re-anchored to `left: 50%` with `transform: translate(-50%, 0)` on `width: max-content`, guaranteeing that the Broski paw home icon, Shop, Perks, Feedback, Story, and FAQ buttons are centered with zero clipping across 360px–428px screens.

---

## 2. Core Launch Blueprints (Generated & Committed in `/broski launch plan/`)

1. **`BROSKI_West_Delhi_Retail_Launch_Map.md`:** 15 mapped pet shops and veterinary clinics across Nangloi, Paschim Vihar, Punjabi Bagh, and Janakpuri; 60-second Hinglish pitch script; 30% retail margin model; 11+1 free launch carton trial terms.
2. **`BROSKI_Legal_Metrology_Sticker_Checklist.md`:** Complete statutory packaging compliance audit under Legal Metrology Rules, 2011 Rule 6; 4.0 mm net weight font height; Scoobee manufacturer vs. BROSKI packer addresses; batch coding; zero unverified health claims.
3. **`BROSKI_Home_Packing_and_Batch_SOP.md`:** Home packing protocol for 12A/3 Dharam Colony; scale calibration tare procedure (target 402g–404g; legal minimum 388g); heat-sealing quality check; batch codes `BR-NV-2611-01` and `BR-MX-2611-01`.
4. **`BROSKI_150_Pack_Pilot_Financial_Runway.md`:** Landed cost locked at ₹44.20/pack; wholesale realization ₹95.60 (Non-Veg) and ₹114.86 (Mix); ₹9,154 net profit on 150 packs (58% gross margin); break-even achieved at 20 packs sold.

---

## 3. Skill Library & AI Operating System Upgrade

- **Curated Skills Active (220 Skills):** Pruned the bloated 1,824-skill catalog down to 220 active, high-leverage skills directly mapped across BROSKI's 11 departments.
- **Archived (1,604 Skills):** Safely moved unrelated AI/GPU/genomics/game-engine skills to `C:\Users\lxshl\.gemini\skills_archive\` with a full manifest and instant 1-click restore script (`restore_all_skills.cjs`).
- **Operating Framework:** Workspace governance updated in `AGENTS.md`, `TEAM_ROSTER.md`, `TEAM_OPERATING_MANUAL.md`, and `BROSKI_MASTER_PROMPTS.md` under Rex (CEO) and Lakshay (Founder/Owner).

---

## 4. Statutory & Legal Status

- **GST Registration (Composition Scheme):** Query notice REG-03 (Ref: `ZA071126019608J`) issued on 4 Nov 2026 by Supdt. Vikram Pal (CBIC Delhi West, Mundka, Range-114). Reply due **13 Nov 2026**.
  - All 4 documents ready: BSES bill (CA No. 154640543), Geeta's signed ₹100 stamp paper NOC, Geeta's self-attested Aadhaar + PAN, and Geotagged signboard photo. Ready for submission under Form REG-04.
- **Trademark (Class 31 Word Mark "BROSKI"):** Filed through Online Legal India (Reg ID `OLI67177929353919`, Invoice `FILS-U-2611-258`). Chasing OLI for draft TM-A preview and official application number.
- **Udyam MSME Certificate:** `UDYAM-DL-11-0177908` (Micro, Manufacturing, NIC 10803).

---

## 5. Critical Launch Milestones

| Date | Milestone / Event | Responsible |
|---|---|---|
| **6–7 Nov 2026** | Submit GST REG-04 clarification on gst.gov.in; chase OLI for TM-A; get dedicated business SIM. | Lakshay |
| **7–8 Nov 2026** | Call Scoobee bakery to lock 110 kg order (55 kg Non-Veg + 55 kg Mix) for pickup on 11/12 Nov. | Lakshay & Arjun |
| **9–10 Nov 2026** | Print front/back labels with Nangloi local printer; procure stand-up zipper pouches (275 pcs). | Lakshay & Rohan |
| **11–12 Nov 2026** | Pick up 110 kg bulk biscuits from Scoobee (Shalimar Bagh); arrival QA inspection. | Lakshay & Kavya |
| **12–14 Nov 2026** | Home packing run (275 packs) at 12A/3 Dharam Colony on stamped scale; box 12-pack cartons. | Lakshay & Sahil |
| **15 Nov 2026** | **COMMERCIAL LAUNCH DAY:** First store drops (Route 1) + WhatsApp broadcast to dog parents. | Lakshay & Dev |
| **15 Dec 2026** | **PILOT GATE REVIEW:** 150 packs sold + 30% shop reorder rate. Data-driven decision to scale. | Rex & Lakshay |
