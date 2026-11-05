# Prompt for the website builder – BROSKI schemes, QR feedback & video feedback
(Copy everything below the line into your site-builder / coding tool, together with the current website project folder.)

---

You are updating the existing website **broskipetfood.com** for **BROSKI**, a new dog-biscuit brand from Nangloi, West Delhi, India. It is a static site hosted on **GitHub Pages** (repo LXSH2000/broskipetfood). There is **no backend**: no database, no payment gateway, no login. Orders happen on **WhatsApp**.

## 0. Golden rules (do not break)
1. **Keep the current design**: same layout, colours (cream / brown / rust / mustard), fonts and tone ("Treats for your best bro"). Only add and fix content.
2. **Mobile first**: test at 360–390 px width. Body text ≥ 16 px, nothing under 13 px. Tap targets ≥ 44 px. No sideways scrolling.
3. **Light pages**: no autoplay videos, no new heavy libraries. Images WebP ≤ 150 KB. Each new page < 300 KB total.
4. **Honest content only**:
   - No fake or "sample" reviews, no AI images shown as real products, no "demo" labels.
   - No health claims: never write "healthy", "vet approved", "high protein", "no sugar", "real chicken", "calming", "handmade", "fresh-baked". "Hand-packed in Nangloi" is allowed.
   - No home address (show only "Nangloi, Delhi 110041") and no personal phone number.
5. Use these placeholders exactly, so they can be replaced later in one place (put them in a single `config.js` or at the top of each file):
   - `[WHATSAPP_NUMBER]` – business WhatsApp number in international format without + (e.g. 91XXXXXXXXXX)
   - `[TALLY_FORM_URL]` – feedback form link
   - `[EMAIL]` – hello@broskipetfood.com
6. Every WhatsApp button uses `https://wa.me/[WHATSAPP_NUMBER]?text=<URL-encoded message>` and opens in a new tab.

## 1. Products (home page shop section)
Show exactly three cards. Remove any other products, coupons, cart/bag and checkout.

| Card | Title | Size | Price | Button text | WhatsApp message |
|---|---|---|---|---|---|
| 1 | Non-Veg Dog Biscuits (yellow pack) | 400 g | ₹149 (MRP incl. of all taxes) | Order on WhatsApp | "Hi BROSKI! I want to order Non-Veg 400 g ×1" |
| 2 | Mix Dog Biscuits (white pack) | 400 g | ₹179 (MRP incl. of all taxes) | Order on WhatsApp | "Hi BROSKI! I want to order Mix 400 g ×1" |
| 3 | **Bro Combo** – 1 Non-Veg + 1 Mix | 2 × 400 g | **₹299** (save ₹29) | Order the Combo | "Hi BROSKI! I want the Bro Combo (₹299)" |

Under the cards, small text: "Unit price: Non-Veg ₹0.37/g · Mix ₹0.45/g · Combo ₹0.37/g. Free delivery within 5 km of Nangloi on orders from ₹299, otherwise ₹20."

## 2. Launch banner (top of every page)
Thin mustard bar, one line, close button (×):
"🐾 Launch week: free 50 g taste pack + free delivery in West Delhi for the first 50 orders – till 22 Nov"
Hide it automatically after **23 Nov 2026** (date check in JavaScript).

## 3. New page: /offers/ ("Bro Perks")
Title: **Bro Perks**. One card per scheme, each with a one-line "Terms" under it:
1. **Scan, tell, get a free taste** – Scan the QR on your pack, tell us honestly how your Bro liked it, and get a free 50 g taste pack of our other flavour with your next order. *Terms: any rating counts · one per WhatsApp number per month · use within 60 days.* Button → /r/
2. **Send a video, win more** – Send a 10–20 second video of your dog eating BROSKI on WhatsApp. You get the free taste pack and an entry to Bro of the Month. *Terms: see "How to send your video" on /r/.* Button → /r/#video
3. **Bro Combo ₹299** – One Non-Veg + one Mix, save ₹29. Button → WhatsApp (combo message).
4. **Free delivery from ₹299** – within 5 km of Nangloi; below ₹299 delivery is ₹20.
5. **Bro Card** – Buy 5 packs, the 6th is free. We keep count on WhatsApp and stamp your card in the bag. *Terms: packs from BROSKI direct orders; one card per number.*
6. **Bring a Bro** – Refer a friend; when they order, you both get a free 50 g taste pack. Button → WhatsApp: "Hi BROSKI! My friend [name] referred me."
7. **Bro of the Month** – Free to enter: send a photo or video of your dog with a BROSKI pack. A 3-person panel picks the most fun one each month; the winner gets 1 kg of BROSKI and a feature on our Instagram. *Terms: no purchase needed to enter; winner announced on Instagram and WhatsApp Status in the first week of the next month.*
Footer line on the page: "Offers may change. Questions? WhatsApp us."

## 4. New page: /r/ (the QR on every pack opens this)
Keep it very simple and fast; `<meta name="robots" content="noindex">`.
- Heading: **"Tell us what your Bro thinks"**
- Line: "Good or bad – both help us. Takes about a minute."
- Big button: **"Give feedback (1 min)"** → `[TALLY_FORM_URL]` (open in the same tab).
- Reward box: "🎁 Every completed feedback = a FREE 50 g taste pack of our other flavour on your next order. Just WhatsApp us **FREE TASTE** when you order."
- Section with id `video`: **"Want to send a video instead? (bigger reward)"**
  - "Send a 10–20 second video on WhatsApp of your dog eating BROSKI. You get the free taste pack **and** an entry to Bro of the Month."
  - **"How to send your video"** (numbered):
    1. Show your BROSKI pack with the **batch number / baked-on date** on the back sticker.
    2. Ordered from us directly? Say your **Bro word** (it's in your order confirmation message).
    3. One take, no filters or edits – a real dog, a real reaction (even a sniff-and-walk-away counts).
    4. Please keep children's faces out of the video.
  - Button: **"Send video on WhatsApp"** → wa.me with text "Hi BROSKI! Here's my Bro's video 🎥 Batch no: ____ Bro word: ____"
  - Small text: "We'll only post your video if you reply 'Yes, BROSKI can post my video'. Posted videos say 'got a free taste pack for sharing'."
- Fallback line: "Form not opening? Email us at [EMAIL]."

## 5. Home page: "For pet shops" section (new, before the footer)
Heading: **"Become a BROSKI Launch Partner"**
Bullets: "11 + 1 free on your first order" · "Free sample jar + counter card" · "5 free taste packs for your customers" · "Delivery from 15 Nov in West Delhi"
Button: **"WhatsApp us for shop rates"** → wa.me text "Hi BROSKI! I run a pet shop and want to know about the Launch Partner offer. Shop name: ____ Area: ____"
Small text: "First 20 shops only."

## 6. Footer (all pages)
"BROSKI · Nangloi, Delhi 110041 · [EMAIL] · WhatsApp · Udyam: UDYAM-DL-11-0177908 · GSTIN: (coming soon)"
Links: Home · Bro Perks · Feedback (/r/) · Privacy.
Simple privacy note page /privacy/: "We only use your number and feedback to reply, send rewards and improve BROSKI. We never sell your data. To delete your data, message us on WhatsApp."

## 7. SEO and sharing
- Real `<title>` and meta description on each page: "BROSKI – crunchy dog biscuits from Nangloi, Delhi. Non-Veg ₹149 and Mix ₹179, 400 g. Order on WhatsApp."
- Open Graph tags + a 1200×630 share image (BROSKI wordmark on cream, no product photo).
- Add the new pages to sitemap.xml (except /r/, which is noindex).

## 8. Check before you finish (report each as pass/fail)
- [ ] Only 3 product cards; no cart, coupon, "demo", "sample", "Gemini" or fake reviews anywhere (search the code).
- [ ] All WhatsApp links use `[WHATSAPP_NUMBER]` and open the right pre-filled message.
- [ ] /r/ loads in under 2 s on a slow 4G test and works at 360 px.
- [ ] Banner hides after 23 Nov 2026.
- [ ] No forbidden words from rule 4 (search the code).
- [ ] No full address and no personal phone number.
- [ ] Text ≥ 13 px, buttons ≥ 44 px, no horizontal scroll.
- [ ] Give me a list of every file you changed or added.
