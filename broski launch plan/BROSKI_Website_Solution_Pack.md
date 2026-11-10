# BROSKI website – solution pack (10 Nov 2026)

**How to use:** paste this whole file into your coding AI together with the project folder. Nothing here has been changed on the site. Part 1 is for Lakshay to decide; Parts 2–5 are instructions for the AI.

Based on a read of the code at commit `92f56e6`: `src/broski/BroskiHome.jsx`, `public/billing/index.html`, `src/config.js`, `public/config.js`, `index.html`, `src/main.jsx`, `src/broski/BroskiCheckoutGateway.jsx` and all CSS files. Your message started at Task 2, so there is no Task 1 here.

---

## Part 1 – Decisions for Lakshay (defaults are used unless you change them)

| # | Question | Default used below |
|---|---|---|
| D1 | Is **80760 45934** a new business number, or your personal one? It is on the live site (footer, shop button, WhatsApp links) and you asked for it as the UPI default. | Treated as **not confirmed**: UPI field starts empty and is remembered in your browser only; phone number is read from config, not typed into page text. |
| D2 | Do you sell a **Peanut Butter** flavour? Your products are Bro Bites (Non-Veg) and Bro Mix. | Preset is added as you asked, name kept in one constant so it is a one-word change. |
| D3 | **Free delivery on ₹299+ for all of Delhi by courier?** The site today says free only within 5 km of Nangloi, otherwise ₹20. A courier parcel can cost more than your margin on one combo. | Local pincodes: your text as written. Other Delhi: "delivery charge confirmed on WhatsApp". |
| D4 | **Billing portal is public** (linked in the footer, anyone can open it and print a BROSKI bill with a UPI QR). | Unlinked from the public site, `noindex`, sample shop data removed. |
| D5 | **GSTIN is not issued yet.** A Bill of Supply as a composition dealer needs your GSTIN on it. | GSTIN field added; without it the page prints "ESTIMATE / CASH MEMO" instead of "BILL OF SUPPLY". |

I am not a lawyer or CA. The GST points below follow the CGST Rules as I understand them; confirm with a GST practitioner before issuing documents.

---

## Part 2 – Fix before launch (found in the code review)

**F1. Unverified nutrition and ingredient claims – remove now.**

- `src/broski/BroskiHome.jsx`, the "bk-transparency-card" block: "Guaranteed Nutrition ≥ 20% Crude Protein / ≥ 8% fat / ≤ 4% fibre / ≤ 10% moisture", "Wholesome poultry lipids", "Easy digestion profile", "No sawdust fillers", "Double-baked in Shalimar Bagh", and a biscuits-per-day feeding guide by breed.
- `src/config.js`: `ingredients`, `analysis`, `feedingGuide` for both products.
- Also check `public/llms.txt`, `public/llms-full.txt`, `public/r/index.html`, `public/preview/index.html`, `public/404.html`, `src/Experience.jsx`, `src/Intro.jsx`, `src/TreatScene.jsx`, `src/main.jsx` for the same wording.
- Why: BROSKI has no written ingredient list, lab analysis or feeding guide from Scoobee yet. Printing invented numbers as "guaranteed" is a misleading claim.
- Do: delete the Nutrition and Feeding tabs. Keep one honest block with three items: "Clear window pouch – you see the biscuits", "Packed in Nangloi, West Delhi", "A treat, not a meal – keep fresh water nearby". Add the real ingredients and analysis only when Scoobee gives them in writing.

**F2. Billing portal exposed (D4).** In `public/billing/index.html`: add `<meta name="robots" content="noindex,nofollow">`; clear the default buyer (name "Pet Zone (Paschim Vihar)", address, phone, GSTIN `07AABCP9876Q1Z2`) to empty fields with placeholders; remove or blank the invented shop presets (`selectShop` pills) unless these are real customers. Remove the two public links to `/billing/` in `BroskiHome.jsx` (PartnerSection button and footer nav). Add `Disallow: /billing/` to `public/robots.txt`. The seller block prints the full home address – correct on a bill, which is one more reason the page must not be public.

**F3. Phone number (D1).** Remove the typed number from `BroskiHome.jsx` ("WhatsApp us for shop rates (+91 80760 45934)", footer "WhatsApp: +91 80760 45934") and the hard-coded fallback `'918076045934'` in `waLink` and `BroskiCheckoutGateway.jsx`. Read only from `window.BROSKI_CONFIG.WHATSAPP_NUMBER`; if it is empty, hide the WhatsApp buttons.

**F4. GST wording (D5).** Footer says "GST: Composition Scheme (07)". Until the GSTIN is issued change to "Udyam: UDYAM-DL-11-0177908" only. Add `GSTIN: ''` to `public/config.js` and show "GSTIN: …" in the footer only when it is filled.

**F5. Two config files disagree.** `src/config.js` has Mix at `14900` (₹149) and legacy ids `peanut` / `pumpkin`; `public/config.js` has Mix at ₹179. Make `public/config.js` the single source for names and prices (Bro Bites ₹149, Bro Mix ₹179, Bro Combo ₹299) and make `src/config.js` read from it or delete the duplicate product data.

**F6. Fake online payment option.** `BroskiCheckoutGateway.jsx` offers "Online Payment Gateway (Simulated / Instant QR)". Remove that option until a real gateway exists; keep "Cash / UPI on Delivery". Orders are only saved in the visitor's `localStorage`, so the confirmation step must always open WhatsApp with the order – make that the primary button.

**F7. Placeholders live in production.** `GA_MEASUREMENT_ID: 'G-BROSKI2026'` is not a real ID (the GA script loads with it on every visit); `google-site-verification` and the Bing tag are placeholders; `FORM_ACCESS_KEY` is empty. Load GA only when the ID matches `/^G-[A-Z0-9]{8,}$/` and is not the placeholder; remove the two verification tags until real codes exist.

---

## Part 3 – Tasks 2 to 5 (exact changes)

### Task 2 – Dynamic UPI ID + item preset (`public/billing/index.html`)

**2a. Sidebar input** – add inside the "Bill Parameters" `panel-section`, after the second `grid-2`:

```html
<div class="field-group">
  <label for="upiIdInput">Your UPI ID for QR Code</label>
  <input type="text" id="upiIdInput" class="input" value="" placeholder="yourname@bank"
         autocomplete="off" spellcheck="false" inputmode="email"
         oninput="saveUpiId(); renderInvoice()">
  <small id="upiHint" style="font-size:11px;color:var(--text-muted)"></small>
</div>
```

If Lakshay confirms D1 as a business number, set `value="8076045934@paytm"`.

**2b. Script** – add near the top of the `<script>` block, after the `items` array:

```js
const UPI_RE = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9]{1,63}$/;
function getUpiId() {
  const el = document.getElementById('upiIdInput');
  const v = (el.value || '').trim();
  const ok = UPI_RE.test(v);
  document.getElementById('upiHint').textContent =
    v && !ok ? 'Check the UPI ID (example: name@bank). QR is hidden until it is valid.' : '';
  return ok ? v : '';
}
function saveUpiId() {
  try { localStorage.setItem('broski-upi-id', document.getElementById('upiIdInput').value.trim()); } catch (e) {}
}
(function restoreUpiId() {
  try {
    const saved = localStorage.getItem('broski-upi-id');
    if (saved) document.getElementById('upiIdInput').value = saved;
  } catch (e) {}
})();
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
```

**2c. In `renderInvoice()`** replace the two lines that build `upiLink` and `qrUrl` (currently using `9999000000@paytm`):

```js
const upiId = getUpiId();
const showQr = Boolean(upiId) && docMode === 'bill' && Number(grandTotal) > 0;
const upiLink = showQr
  ? `upi://pay?pa=${upiId}&pn=BROSKI&am=${Number(grandTotal).toFixed(2)}&cu=INR&tn=${encodeURIComponent('Bill-' + billNo)}`
  : '';
const qrUrl = showQr
  ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiLink)}`
  : '';
```

Wrap the existing `<div class="upi-scan-card">…</div>` in the template with `${showQr ? `…` : ''}` and change its last line to:

```html
<div style="font-family:var(--font-mono); font-size:10px; margin-top:3px; color:var(--text-muted);">UPI ID: ${esc(upiId)}</div>
```

Also pass every user-typed value in the template (`buyerName`, `buyerAddress`, `buyerPhone`, `buyerGstin`, `billNotes`, item `desc`, `batch`, `scheme`) through `esc()` – today they are inserted as raw HTML.

Note: the QR image is made by a third-party site (`api.qrserver.com`), so your UPI ID and bill amount are sent to it. Better: add a small local QR library file to `public/billing/` and draw the QR in the page.

**2d. Preset pill** – add above `<div id="itemsContainer">`:

```html
<div class="preset-pills" style="margin-bottom:8px">
  <button type="button" class="preset-pill" onclick="addPresetItem('pb400')">+ Peanut Butter (400g)</button>
</div>
```

```js
const ITEM_PRESETS = {
  pb400: { desc: 'Broski Peanut Butter Dog Biscuits (400g Pouch)', hsn: '2309 10 00', batch: '',
           qty: 1, freeQty: 0, mrp: 179, rate: 114.86, scheme: '' }
};
function addPresetItem(key) {
  const p = ITEM_PRESETS[key];
  if (!p) return;
  items.push({ ...p });
  renderFormItems();
  renderInvoice();
}
```

### Task 3 – Delivery Challan mode, Rule 55 (`public/billing/index.html`)

**3a. Sidebar toggle** – add as the first `panel-section` after the panel header:

```html
<div class="panel-section">
  <div class="section-label">Document Type</div>
  <div class="mode-toggle" role="radiogroup" aria-label="Document type">
    <button type="button" id="modeBill" class="mode-btn active" role="radio" aria-checked="true"
            onclick="setDocMode('bill')">Bill of Supply</button>
    <button type="button" id="modeChallan" class="mode-btn" role="radio" aria-checked="false"
            onclick="setDocMode('challan')">Delivery Challan</button>
  </div>
  <div class="field-group" id="purposeGroup" hidden style="margin-top:10px">
    <label for="dispatchPurpose">Purpose of Dispatch</label>
    <select id="dispatchPurpose" class="input" onchange="renderInvoice()">
      <option>Free Samples for Taste Test</option>
      <option>Supply of Goods on Approval / Consignment</option>
      <option>Display Jar and Counter Material (Returnable)</option>
    </select>
  </div>
  <div class="field-group" style="margin-top:10px">
    <label for="sellerGstin">Your GSTIN (leave empty until issued)</label>
    <input type="text" id="sellerGstin" class="input" value="" maxlength="15" oninput="renderInvoice()">
  </div>
</div>
```

Give the bill-number label an id: `<label id="billNoLabel" for="billNo">Bill of Supply No.</label>`.

**3b. CSS:**

```css
.mode-toggle { display:grid; grid-template-columns:1fr 1fr; gap:4px; padding:4px;
  background:rgba(0,0,0,.06); border-radius:10px; }
.mode-btn { min-height:44px; border:0; border-radius:8px; background:transparent; font:inherit;
  font-weight:600; cursor:pointer; transition:background-color .2s ease, color .2s ease; }
.mode-btn.active { background:#352016; color:#fff8ed; }
.mode-btn:focus-visible { outline:2px solid #c0562b; outline-offset:2px; }
```

**3c. Script** (declare `docMode` near the top of the script, before the first `renderInvoice()` call):

```js
let docMode = 'bill';
function setDocMode(mode) {
  docMode = mode === 'challan' ? 'challan' : 'bill';
  const isChallan = docMode === 'challan';
  document.getElementById('modeBill').classList.toggle('active', !isChallan);
  document.getElementById('modeChallan').classList.toggle('active', isChallan);
  document.getElementById('modeBill').setAttribute('aria-checked', String(!isChallan));
  document.getElementById('modeChallan').setAttribute('aria-checked', String(isChallan));
  document.getElementById('purposeGroup').hidden = !isChallan;
  document.getElementById('billNoLabel').textContent = isChallan ? 'Delivery Challan No.' : 'Bill of Supply No.';
  const no = document.getElementById('billNo');
  if (isChallan && no.value.startsWith('BRS/')) no.value = no.value.replace(/^BRS\//, 'DC/');
  if (!isChallan && no.value.startsWith('DC/')) no.value = no.value.replace(/^DC\//, 'BRS/');
  renderInvoice();
}
```

**3d. In `renderInvoice()`** add:

```js
const isChallan = docMode === 'challan';
const sellerGstin = (document.getElementById('sellerGstin').value || '').trim().toUpperCase();
const purpose = document.getElementById('dispatchPurpose').value;
const docTitle = isChallan ? 'DELIVERY CHALLAN' : (sellerGstin ? 'BILL OF SUPPLY' : 'ESTIMATE / CASH MEMO');
document.title = `BROSKI | ${docTitle} ${billNo}`;
```

Then in the template:

- Heading: `<div class="bill-heading">${docTitle}</div>`
- Statutory pill:

```js
${isChallan
  ? `<strong>DELIVERY CHALLAN FOR GOODS SENT ON APPROVAL / SAMPLE DISTRIBUTION</strong><br>
     (NOT A TAX INVOICE - ISSUED UNDER RULE 55 OF CGST RULES, 2017)`
  : sellerGstin
    ? `<strong>COMPOSITION TAXABLE PERSON</strong><br>NOT ELIGIBLE TO COLLECT TAX ON SUPPLIES<br>
       <span style="font-size:9px; color:#6f6259;">(Issued under Section 10 &amp; Rule 49 of CGST Rules, 2017)</span>`
    : `<strong>GST REGISTRATION APPLIED FOR</strong><br>No GST charged on this document`}
```

- Seller block: add `${sellerGstin ? ` | GSTIN: <strong>${esc(sellerGstin)}</strong>` : ''}` after the Udyam number.
- In challan mode add a row in the meta grid: `Purpose of Dispatch: <strong>${esc(purpose)}</strong>`, hide Payment Mode / Payment Status, hide the UPI card (already handled by `showQr`), and show the total as "Declared value of goods (no payment due on this challan)".
- Terms list, first item:

```js
${isChallan
  ? `<li>Goods sent for the purpose stated above. This is not a sale and not a tax invoice.</li>
     <li>Goods sent on approval will be billed when accepted, or returned to BROSKI.</li>`
  : `<li>Composition taxable person; no GST is charged or collected on this supply as per Section 10 of CGST Act.</li>`}
```

- Challan footer: add "Received the above goods in good condition – Name, Signature, Date, Shop stamp" and a small line "Original for consignee · Duplicate for transporter · Triplicate for consignor" (Rule 55(2): challans are made in triplicate).
- `copyWhatsAppSummary()`: use `docTitle` in the header line, and in challan mode drop the payment line.
- `resetForm()`: call `setDocMode('bill')`.

Rule 55 points to keep: a separate running serial number for challans (max 16 characters, one series per financial year), consignor and consignee name/address/GSTIN, HSN and description, quantity, value, signature. Goods sent on approval must be billed when the shop accepts them, and at the latest within six months of dispatch.

### Task 4 – Pincode checker (`src/broski/BroskiHome.jsx`)

Add to `public/config.js`:

```js
DELIVERY_PINCODES: ['110041','110087','110063','110027','110058','110015','110026','110034','110056'],
```

Add this component above `ProductCards`:

```jsx
const LOCAL_PINS = ['110041', '110087', '110063', '110027', '110058', '110015', '110026', '110034', '110056'];

export function checkPincode(pin, localPins = LOCAL_PINS) {
  const p = String(pin || '').trim();
  if (!/^\d{6}$/.test(p)) return { kind: 'error', text: 'Please enter a 6-digit pincode.' };
  if (localPins.includes(p)) {
    return { kind: 'local', text: '✅ Fast local delivery available! Dispatched fresh from Nangloi within 24 hours. Free delivery on orders ₹299+.' };
  }
  if (p.startsWith('110')) {
    return { kind: 'delhi', text: '🐾 Dispatched via local Delhi courier (24–48 hours). Free delivery on orders ₹299+.' };
  }
  return { kind: 'outside', text: 'We deliver only in Delhi right now. WhatsApp us and we will tell you when we reach your area.' };
}

export function PincodeChecker() {
  const [pin, setPin] = useState('');
  const [result, setResult] = useState(null);
  const onSubmit = (e) => {
    e.preventDefault();
    const r = checkPincode(pin, C().DELIVERY_PINCODES || LOCAL_PINS);
    setResult(r);
    try { window.BroskiAnalytics?.trackEvent('pincode_check', { result: r.kind }); } catch {}
  };
  return (
    <form className="bk-pin" onSubmit={onSubmit} aria-labelledby="pin-h" noValidate>
      <h3 id="pin-h" className="bk-pin__title">Check Delivery in Your Area</h3>
      <div className="bk-pin__row">
        <label htmlFor="bk-pin-input" className="bk-sr-only">6-digit pincode</label>
        <input
          id="bk-pin-input" className="bk-pin__input" type="text" inputMode="numeric"
          autoComplete="postal-code" maxLength={6} placeholder="Enter pincode" value={pin}
          onChange={(e) => { setPin(e.target.value.replace(/\D/g, '').slice(0, 6)); setResult(null); }}
        />
        <button type="submit" className="bk-h-btn bk-pin__btn">Check</button>
      </div>
      <p className={`bk-pin__msg ${result ? `bk-pin__msg--${result.kind} is-shown` : ''}`} role="status" aria-live="polite">
        {result ? result.text : ''}
      </p>
    </form>
  );
}
```

For D3, the `delhi` text becomes: `'🐾 We deliver across Delhi by local courier (24–48 hours). Delivery charge is confirmed on WhatsApp before you pay.'`

Place it in `ProductCards` directly after the unit-price line:

```jsx
{UNIT_PRICE_LINE && <p className="bk-shop__unit">{UNIT_PRICE_LINE}</p>}
<PincodeChecker />
```

CSS for `src/broski/broski-home.css`:

```css
.bk-sr-only { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; }
.bk-pin { max-width:520px; margin:24px auto 0; padding:18px; border:1px solid rgba(53,32,22,.15);
  border-radius:16px; background:#fff8ed; text-align:center; }
.bk-pin__title { margin:0 0 12px; font-size:18px; }
.bk-pin__row { display:flex; gap:8px; }
.bk-pin__input { flex:1; min-width:0; min-height:48px; padding:0 14px; font-size:16px;
  border:1px solid rgba(53,32,22,.3); border-radius:12px; background:#fff; }
.bk-pin__input:focus-visible, .bk-pin__btn:focus-visible { outline:2px solid #c0562b; outline-offset:2px; }
.bk-pin__btn { min-height:48px; padding:0 22px; }
.bk-pin__msg { min-height:24px; margin:12px 0 0; font-size:15px; opacity:0; transform:translateY(4px);
  transition:opacity .25s ease, transform .25s ease; }
.bk-pin__msg.is-shown { opacity:1; transform:none; }
.bk-pin__msg--local { color:#1d6b3a; font-weight:600; }
.bk-pin__msg--delhi, .bk-pin__msg--outside { color:#352016; }
.bk-pin__msg--error { color:#a4281d; }
@media (prefers-reduced-motion: reduce) { .bk-pin__msg { transition:none; transform:none; } }
```

Font size 16px on the input stops iPhone zoom on focus.

### Task 5 – 11+1 retail partner card (`src/broski/BroskiHome.jsx`)

A `PartnerSection` already exists. Replace it (do not add a second pet-shop block):

```jsx
export function PartnerSection() {
  const { MSG = {} } = C();
  return (
    <section className="bk-partner" aria-labelledby="partner-h">
      <h2 id="partner-h">Run a Pet Shop or Grooming Salon in West Delhi?</h2>
      <p className="bk-partner__offer">
        Get our Introductory 11+1 Free Launch Box (12 packs of 400g) for ₹1,100 investment.
        Earn ₹688 profit (38.5% margin) with our 15-day 100% cash buyback guarantee.
      </p>
      <ul>
        <li>Free sample display jar</li>
        <li>Counter cards</li>
        <li>5 complimentary 50g taste packs</li>
      </ul>
      <WaButton text={MSG.shop}>WhatsApp us for the Launch Box</WaButton>
      <p className="bk-partner__small">
        Profit shown at MRP ₹149 per pack. Buyback covers unopened packs returned within 15 days. First 20 shops only.
      </p>
    </section>
  );
}
```

Add `.bk-partner__offer { max-width:560px; margin:0 auto 14px; font-size:17px; line-height:1.5; }` to `broski-home.css`.

Maths check: 12 × ₹149 = ₹1,788 at MRP; ₹1,788 − ₹1,100 = ₹688; ₹688 ÷ ₹1,788 = 38.5%. This holds only for ₹149 packs, so the small line says so. The cash buyback is a promise you must be able to pay, so the limits are stated.

---

## Part 4 – Whole-site improvements (transitions, speed, accessibility)

**Transitions and motion**

1. One set of motion tokens in `src/styles.css`: `--t-fast:150ms; --t-base:250ms; --t-slow:400ms; --ease:cubic-bezier(.2,.8,.2,1);` and use them everywhere.
2. Replace every `transition: all` (9 places: `liquid-dock.css` 2, `styles.css` 1, `broski-checkout.css` 3, `broski-home.css` 3) with named properties – only `transform`, `opacity`, `background-color`, `border-color`, `box-shadow`.
3. Add a `@media (prefers-reduced-motion: reduce)` block to `liquid-dock.css`, `broski-checkout.css` and `broski-home.css` (they have none) that removes transitions and animations.
4. Product cards: hover lift only on devices with a mouse – `@media (hover:hover) { .bk-pcard:hover { transform:translateY(-4px); } }`; buttons press to `scale(.98)` on `:active`.
5. Checkout modal: fade the overlay and slide the panel up 16px over 250ms on open and close; lock body scroll while open; keep focus inside; Escape closes; return focus to the button that opened it.
6. Tabs / info block: cross-fade content over 200ms instead of an instant swap.
7. Scroll reveal: one `IntersectionObserver` that adds a class once (opacity 0→1, translateY 12px→0, 400ms); nothing above the fold is hidden.
8. Page-to-page transitions for `/`, `/offers/`, `/r/`, `/privacy/`: add `@view-transition { navigation: auto; }` to the shared CSS; browsers without support ignore it.
9. `backdrop-filter` is used 14 times; keep it only on the dock and modal, with a solid colour fallback inside `@supports not (backdrop-filter: blur(1px))`. It is slow on low-cost Android phones.

**Speed**

10. JS bundle is about 405 KB (`three`, `p5`, `p5.brush`, `gsap`). Load `TreatScene`, `Experience` and `Intro` with `React.lazy` + `Suspense`, and only on wide screens with motion allowed; split vendors with `build.rollupOptions.output.manualChunks`; remove any package no longer imported.
11. `public/` carries about 77 MB of video, including a 24.5 MB 1080p file and two 10 MB originals. Keep only the 720p files that the page uses; delete the rest from `public/` (keep originals outside the repo).
12. Two videos autoplay on the home page. Hero: keep `preload="metadata"` + poster. Second video: `preload="none"`, start it with an `IntersectionObserver` when 25% visible, pause when off screen, and do not autoplay when the visitor has data-saver or reduced motion on.
13. Fonts: four families and 15 weights are requested from Google Fonts. Keep Outfit + DM Sans and one handwritten face; request only the weights used.
14. Product images: serve WebP at 600 px with `width`/`height` set (already present) and `fetchpriority="high"` on the hero poster only.

**Accessibility**

15. Add `:focus-visible` styles to `broski-checkout.css`, `intro.css`, `motion-ui.css`, `redesign.css` (none today).
16. Tabs: `role="tablist"`, `role="tab"` with `aria-selected`, `role="tabpanel"`, and left/right arrow keys.
17. Decorative emoji get `aria-hidden="true"`; every tap target at least 44 × 44 px; check brown-on-cream and white-on-mustard text for 4.5:1 contrast.

**Content and consistency**

18. Use the names Bro Bites / Bro Mix / Bro Combo everywhere (config, product cards, schema JSON-LD, `llms.txt`, WhatsApp messages). Remove leftover "peanut" / "pumpkin" ids and text.
19. Replace the eyebrow "D2C DIRECT STORE" with "Order direct"; rename "Direct Order Gateway" to "Order now".
20. Privacy page: say that an order draft is stored in the visitor's browser and how to clear it.

**Tests**

21. `server.test.mjs` has one test. Add unit tests for `checkPincode()` (local, other Delhi, outside, bad input) and for the billing helpers `UPI_RE` and `esc()` by moving them into a small module that both the page and the tests import.

---

## Part 5 – Verification the AI must report

1. `node --test server.test.mjs` – all pass (include the new pincode tests).
2. `npm run build` – clean Vite build into `dist/`; report the main JS size before and after.
3. Search the code and report zero hits for: `9999000000`, `Guaranteed Nutrition`, `Shalimar`, `sawdust`, `Simulated`, `G-BROSKI2026`, `YOUR_GOOGLE_SEARCH_CONSOLE_CODE`, `transition: all`.
4. Billing page checks: empty UPI → no QR; invalid UPI → hint, no QR; valid UPI → QR and the same ID printed; Challan mode → heading, Rule 55 wording, purpose shown, no QR, number prefix `DC/`; print preview fits one A4 page in both modes.
5. Home page at 360 px width: pincode box and partner card have no sideways scroll; `110041` → green message, `110001` → Delhi message, `400001` → outside message, `12` → error.
6. List every file changed. Do not deploy or push; Lakshay reviews first.
