# BROSKI Order System v2 – complete plan + prompt (for 23 Nov 2026)
Website team (Aarav, Nisha). Built from a full check of the live site (22 Nov, 03:05 release) with a simulated order on phone and desktop.
Goal: by tomorrow, every order, sample, bill and customer is recorded properly, with no dependence on WhatsApp.
Layout, fonts and theme stay the same. DRAFT. Nothing goes live without Lakshay's yes.

---

## Part A – Problems found (live site, 22 Nov night)
| # | Area | Problem |
|---|---|---|
| 1 | Order = "request" only | The sheet saves only items, total and phone. There's **no address, no delivery charge, no payment record, no bill**. The success screen says "This is an order request, not a direct bill… admin confirms the final amount on WhatsApp", and it **auto-opens a WhatsApp tab** (a blank error tab on desktop). That's not a real order system. |
| 2 | Order sheet layout (phone) | The **"Place order" button sits off-screen** (at 1003 px on an 844 px screen) inside an inner scroll area, with no visible total while you scroll. The success screen's main button is also cut off at the bottom. On desktop the text is very small (11–12 px). |
| 3 | No bill | No Bill of Supply is generated, and there's no bill number series. Required as a GST composition dealer. |
| 4 | Records | The `orders` table has no pincode, address, payment method/status, delivery fee or status steps. Admin has only 4 tabs: no today's summary, packing list, bill printing, sales report or full export. |
| 5 | Free sample | A code is created, but there's **no way to actually receive the sample**. Nothing records when or how it was given, and it isn't linked to any order. |
| 6 | Delivery | 9 pincodes are all treated the same. No zones, no arrival time, no delivery slot. Other pincodes hit a dead end. |
| 7 | Customer side | No order tracking page, no bill download, no "order again". |
| 8 | You | Nothing tells you when a new order arrives. |
| 9 | Points | Only manual; never added automatically. |
| 10 | Other | The Instagram link is still empty (no handle yet). Pack photos are still renders. *OK: the phone headers are fixed, and there are no console errors, broken links or missing files on any page.* |

---

## Part B – The new system in simple words

### 1. Delivery zones
| Zone | Pincodes (editable in admin) | What the customer sees | Charge |
|---|---|---|---|
| **A – Nangloi Express** (our own delivery) | **110041** to start | "✅ Delivering to 110041 – arrives today or tomorrow." Picks a slot (11 am–2 pm / 4–8 pm). | **Free from ₹295**, otherwise **₹30** (editable) |
| **B – Porter Express** (nearby West Delhi) | 110087, 110063, 110081, 110086, 110043, 110059, 110056, 110058, 110027, 110015, 110026, 110034 | "🚚 Arriving soon in your area. Want it today? We'll send it by **Porter** – you pay Porter's exact fare at delivery (usually ₹60–120)." Can order now with "Porter Express" or join the waitlist. | Porter fare paid by the customer at the door, shown before booking |
| **C – Everyone else** | All other pincodes | "🐾 Arriving soon in {pincode}! **{n} neighbours are waiting.** We unlock an area at 25 sign-ups." → **Join the waitlist** (name + phone). | – |

**Area unlock meter.** The waitlist turns curiosity into data: /admin shows which pincodes want BROSKI most, so you know exactly where to expand, run Porter batches or find a shop. It also gives people a reason to share ("help unlock 110059").

### 2. Ordering (from tomorrow, no payment gateway needed)
1. **Packs:** steppers, with the total always visible in a sticky bar at the bottom.
2. **Delivery:** enter the pincode **first** to see the zone, charge and arrival time straight away.
3. **Details:** name, WhatsApp number, full address (house/flat, street, landmark), delivery slot, and the consent tick (unticked to start).
4. **Payment:**
   - **Cash/UPI on delivery** (COD), or
   - **Pay now by UPI**: a button opens any UPI app with the exact amount and order number already filled in (a QR code on desktop). The customer can type the UPI reference number (UTR).
   - Your **business UPI ID** (Axis current account) is needed for this. **Never your personal UPI.**
5. **Done screen:** "Order placed ✅ BRK-2611-0042", items, delivery charge, total, payment method, arrival slot, "Your BROSKI code" (for a new customer), plus buttons **Track order**, **Download bill** (when issued) and **Message us on WhatsApp** (optional, never automatic).
- The total is always worked out **in the database** from the prices in admin, so nobody can change it in the browser.
- Razorpay comes later (when KYC is done). It plugs into the same system as a third payment option.

### 3. Bill (Bill of Supply – composition dealer)
- A bill number series per financial year, numbered one after another: **BRK/26-27/0001** (under 16 characters, never reused).
- The bill number is issued automatically when the order is marked **Paid** or **Delivered**, so spam or cancelled orders don't waste numbers.
- **The bill shows:**
  - BROSKI, the **address for bills** (from settings), GSTIN, State: Delhi (07)
  - bill number and date
  - customer name, address and pincode
  - item, HSN 2309, quantity, rate, amount, delivery charge, total
  - total in words
  - "Composition taxable person, not eligible to collect tax on supplies"
  - payment method and reference
  - "Authorised signatory – BROSKI"
- The customer opens it from the order page and taps **Download PDF**, which uses the phone's "Save as PDF". You can print it from /admin.

### 4. Free sample – how it really works now
- **Claim:** on /sample, the customer enters name, phone, pincode and flavour. It's saved as **"Reserved – ships with first order"**. One per phone number.
- **Get it:** **no code to type.** When that phone places its **first order**, checkout shows "🎁 Your free 50 g Bro Mix taste pack is added to this order", and it's added automatically.
  - The database checks: an open claim for this phone + **no earlier order** + the **same address not already used for a sample**.
  - Then it marks the claim **Added to BRK-…**, and **Given** when the order is delivered.
- **Zone A extra:** customers in 110041 can also ask for "drop my sample on your next delivery run" (no order needed). You see these in admin as "Sample-only drops" for the route.
- **Shops later:** the customer shows their BROSKI code at a partner shop. The shop sends it to you, and you mark it **Given at shop** in admin.
- **Admin Samples tab:** Reserved / Added to order / Given / Expired (auto after 60 days).

### 5. Records and admin (/admin)
| Tab | What you see / do |
|---|---|
| **Today** | Orders today, sales ₹, to pack, to deliver, unpaid COD, samples to add, new waitlist sign-ups. **A beep and a browser notification for each new order.** |
| **Orders** | Filter by status, zone, date or payment. Each order shows address, landmark, slot, **Call** and **WhatsApp** buttons, items + free sample. Buttons: **Confirm → Out for delivery → Delivered**, **Mark paid** (cash/UPI + UTR), **Cancel** (with a reason), **Print bill**, **Print packing slip**. |
| **Packing list** | All confirmed orders for today grouped by zone and pincode: how many Bites, Mix and samples to pack. |
| **Samples** | All claims with status and the linked order. |
| **Customers** | Search by phone: all orders, total spent, points, sample, feedback. |
| **Waitlist** | Sign-ups by pincode (highest first), with names and phones to message when the area opens. |
| **Feedback** | As today, plus a link to the order. |
| **Reports** | Sales by day and by product, average order value, repeat customers. **Export CSV for every table**, so you always have all your records. |
| **Settings** | Prices, zones and pincodes, delivery fee, free-delivery minimum, slots, UPI ID, GSTIN, bill address, points rule. Changing them needs **no code change**. |
- **Telegram alert (optional, free, 10 min setup):** every new order pings your phone instantly on Telegram.
- **Points:** added automatically when an order is marked **Delivered** (default 1 point per ₹10).

### 6. Customer extras
- **Track order** page `/order/?no=BRK-…&t=…` (a secret link): status timeline Placed → Confirmed → Out for delivery → Delivered, the bill, and a help button.
- **/points** shows past orders with **Order again**.
- /terms and /privacy are updated for zones, Porter, COD/UPI, cancellation before dispatch, the 3-day replacement, and address data.

---

## Part C – Prompt for your coding AI (copy everything below this line)

You are working on the BROSKI website in `D:\BROSKI ANTIGRAVITY` (React 19 + Vite on GitHub Pages; static pages `public/*/index.html`; home `src/main.jsx` + `src/broski/*`; config `public/config.js`; database Supabase, accessed with the light `rpc()` helper in `public/portal-shared.js`, sending only the `apikey` + `Content-Type` headers).
Create branch `feat/order-system-v2` from `main`. **Do NOT deploy.**

**Rules:**
- Keep layout, fonts and theme colours (`--bk-*`, `--pz-ease`). Reduce-motion safe.
- No health claims, no fake reviews, no star ratings. Public address only "Nangloi, West Delhi – 110041" (the bill address is shown only on the customer's own bill). No personal phone number or personal UPI ID anywhere.
- All prices, totals, zones and sample rules are decided **in the database**, never trusted from the browser.

### Lakshay's answers (defaults are used if he hasn't changed them)
```
ZONE_A_PINS        = 110041
ZONE_B_PINS        = 110087,110063,110081,110086,110043,110059,110056,110058,110027,110015,110026,110034
ZONE_A_FEE         = 30          # below free minimum
FREE_MIN           = 295
SLOTS              = 11 am – 2 pm | 4 pm – 8 pm
UNLOCK_TARGET      = 25          # waitlist sign-ups to unlock an area
UPI_VPA            =             # business UPI ID (Axis current a/c). Empty = hide "Pay now by UPI"
GSTIN              =             # Lakshay confirms
BILL_ADDRESS       =             # address for bills (registered address) – Lakshay confirms
POINTS_PER_RUPEES  = 10
```

### C1. SQL – file `supabase/order_system_v2.sql` (Lakshay runs it once in the Supabase SQL Editor)
Write and test this migration (idempotent, safe to run twice):

**1. `settings` table.** Columns: `k text primary key`, `v jsonb`. RLS on; admin full access. Seed these keys from the answers:
- `prices` `{"bites":149,"mix":179,"combo":295}`
- `zones` `{"A":{"name":"Nangloi Express","pins":[…],"fee":30,"free_min":295,"eta":"Today or tomorrow"},"B":{"name":"Porter Express","pins":[…],"eta":"Same day by Porter","note":"Porter fare paid at delivery"}}`
- `slots`, `unlock_target`, `upi` `{"vpa":"","name":"BROSKI"}`, `business` `{"name":"BROSKI","gstin":"","bill_address":"","state":"Delhi (07)","hsn":"2309"}`, `points` `{"per_rupees":10}`

**2. `orders` – add columns:**
- `public_no text unique`, `token text`
- `pincode`, `zone` (`A`/`B`), `address`, `landmark`, `slot`, `delivery_mode` (`own`/`porter`)
- `subtotal int`, `delivery_fee int default 0`, (keep `total`)
- `payment_method` (`cod`/`upi`), `payment_status` (`unpaid`/`paid`/`refunded`, default `unpaid`), `utr`, `paid_at`
- `bill_no text unique`, `bill_date date`
- `sample_claim_id uuid`, `cancel_reason`, `updated_at timestamptz default now()`

Replace the status check with: `requested` (old rows), `placed`, `confirmed`, `out_for_delivery`, `delivered`, `cancelled`.
`items` becomes a snapshot array: `[{id,name,qty,price,amount}]`.

**3. `sample_claims`.**
- Status check: `reserved`, `added`, `given`, `expired`, `rejected` (map old `pending`→`reserved`, `verified`→`reserved`, `handed`→`given`).
- Add `mode` (`with_order`/`route_drop`/`shop`), `order_id uuid`, `address_key text`, `given_at`.

**4. `waitlist` table.** `id`, `phone`, `name`, `pincode`, `created_at`, unique (`phone`, `pincode`). RLS admin-only.

**5. `bill_counters` table.** `fy text primary key`, `n int`.

**6. Public `security definer` RPCs.** Grant execute to anon. All inputs validated, phone normalised with `norm_phone`.
- `get_shop_settings()` → prices, zone names/pins/fees/eta, slots, `upi.vpa` (only if set), `unlock_target`.
- `check_pincode(p_pincode)` → `{zone:'A'|'B'|null, name, fee, free_min, eta, waitlist_count}`.
- `quote_order(p_phone, p_pincode, p_items jsonb)`:
  - items = `{bites,mix,combo}`, integers 0–20, at least 1
  - returns `{subtotal, delivery_fee, total, zone, delivery_mode, sample_available, sample_flavour}`
  - `sample_available` = the phone has a `reserved` claim AND no non-cancelled order
- `place_order(p_phone, p_name, p_pincode, p_address, p_landmark, p_slot, p_items, p_payment_method, p_utr, p_consent, p_delivery_mode)`:
  - Check: consent true, address 10–300 chars, pincode in zone A or B (zone B requires `delivery_mode='porter'`).
  - Rate limit: max 5 orders per phone per hour.
  - Compute subtotal and delivery fee from `settings`; zone B fee = 0 with the Porter note.
  - Upsert the customer and remember whether they're new.
  - **Sample rule:** if eligible AND no other claim with the same `address_key` (lower-case address + pincode with spaces and punctuation removed) is already `added`/`given`, then set the claim to `added` with `order_id` and add `{id:'sample',name:'Free 50 g taste pack ('||flavour||')',qty:1,price:0}` to items.
  - `public_no = 'BRK-' || to_char(now(),'DDMM') || '-' || lpad(n,3,'0')`, where `n` is the daily counter (unique; retry on conflict).
  - `token = encode(gen_random_bytes(12),'hex')`. Status `placed`.
  - Returns `{status:'ok', public_no, token, subtotal, delivery_fee, total, sample_added, customer_code: case when new then code end}`.
- `get_order(p_no, p_token)` → order summary, status timeline, payment and slot. If `bill_no` is set, also the bill block: business name, bill address, GSTIN, state, HSN, `bill_no`, `bill_date`, customer name/address, items, total, total in words. Wrong token → `not_found`.
- `join_waitlist(p_phone, p_name, p_pincode, p_consent)` → `{status, waitlist_count}`. Max 3 per phone per day.
- `claim_sample(…)`, updated:
  - one claim per phone; status `reserved`, mode `with_order`
  - extra `p_mode` = `route_drop` allowed only for zone A pincodes
  - returns `{status:'ok'|'ok_existing'|'already_claimed', customer_code (new only), message}`

**7. Admin RPCs** (each checks `is_admin()`):
- `admin_set_status(p_order_id, p_status, p_reason)`
- `admin_mark_paid(p_order_id, p_method, p_utr)`
- `admin_update_settings(p_key, p_value)`
- `admin_mark_sample(p_claim_id, p_status)`

**8. Triggers:**
- On an order becoming `paid` or `delivered` with `bill_no` null: issue the bill. FY = April–March, e.g. `26-27`; `bill_no = 'BRK/'||fy||'/'||lpad(n,4,'0')` from `bill_counters` with row lock; `bill_date = current_date`.
- On `delivered`: add `floor(total / points.per_rupees)` points (reason `Order BRK-…`, once only), and set the linked sample claim to `given` (`given_at = now()`).
- Keep `updated_at` current.
- Daily cleanup: claims `reserved` for more than 60 days → `expired`. Do it in a function called from the admin Today tab load.

**9. Optional Telegram alert:**
- Enable the `pg_net` extension.
- Private table `secrets(k,v)` (RLS, no policies) with `telegram_bot_token` and `telegram_chat_id`.
- AFTER INSERT trigger on `orders`: `net.http_post` to `https://api.telegram.org/bot<token>/sendMessage` with "🐾 New order BRK-… ₹total · zone · pincode · items · COD/UPI". Skip it if the secrets are empty.

**10. RLS.** All tables stay admin-only. The public uses only the RPCs above.

### C2. Order sheet (`src/broski/BroskiCheckoutGateway.jsx` + CSS) – keep the same look
- **Phone (<700 px):** a full-height bottom sheet with a **sticky footer bar** ("Total ₹xxx · Continue" / "Place order ₹xxx", 52 px, always visible) and a sticky header. Only the middle part scrolls. Respect `env(safe-area-inset-bottom)`.
- **Desktop:** an 560 px wide centred modal, text at least 14 px.
- **Steps (a small stepper at the top):**
  1. Packs.
  2. **Pincode first.** Call `check_pincode`:
     - zone A → "✅ Delivering to {pin} – {eta}"
     - zone B → "🚚 Arriving soon in {pin}. Want it today? Porter Express – you pay Porter's exact fare at delivery", with a choice of [Order with Porter Express] or [Join waitlist]
     - none → "🐾 Arriving soon in {pin}! {n} neighbours waiting – we unlock at {target}", with a waitlist form (name, phone, consent) calling `join_waitlist`
  3. Details: name, phone, address (house/flat + street), landmark, slot (zone A only), consent (unticked).
  4. Payment: radio [Cash/UPI on delivery] and, only if `upi.vpa` is set, [Pay now by UPI].
  5. Review: `quote_order` result (subtotal, delivery, free sample line if `sample_available`, total). Button "Place order ₹total".
- **Pay now by UPI:**
  - After `place_order`, show the button `upi://pay?pa=VPA&pn=BROSKI&am=TOTAL&cu=INR&tn=BRK-xxxx` (phone) and a QR code of the same link (desktop; use the `qrcode` npm package, loaded only when needed).
  - Add a field "UPI reference (UTR), optional". Save it through a new public RPC `attach_utr(p_no, p_token, p_utr)` that only stores the UTR (add it to C1). The payment stays `unpaid` until the admin verifies it in /admin.
- **Done screen:**
  - "Order placed ✅ {public_no}", items, free sample line, delivery, total, payment, slot/eta
  - "Your BROSKI code: XXXXXX" (new customers) with a Copy button
  - Buttons: **Track order** (`/order/?no=…&t=…`; also store `{no,t}` in localStorage, try/catch, so /points can list "My recent orders" on this device), **Message us on WhatsApp** (optional; never auto-open)
  - Bone-toss animation
- **Remove** every automatic `window.open` to WhatsApp. **Remove** the text "order request / not a direct bill / admin confirms the final amount".
- Rename the buttons site-wide from "Order on WhatsApp" to **"Order now"**, including the hero secondary button (it becomes "Order now" and opens the sheet; keep a small "Questions? WhatsApp us" link) and /offers ("Order the combo").
- GA4 events (no personal data): `begin_checkout`, `add_shipping_info` (zone), `add_payment_info` (method), `purchase` (value, items), `join_waitlist` (zone C/B).

### C3. New page `public/order/index.html` – Track order and bill
- Read `no` and `t` from the URL and call `get_order`.
- Status timeline: Placed → Confirmed → Out for delivery → Delivered (or Cancelled with reason). Show the order details and a help link to WhatsApp.
- If a bill exists: render the **Bill of Supply** block (everything from Part B §3) and a **Download PDF** button using `window.print()`. Print CSS: A4 portrait, only the bill visible, black on white, logo on top.
- `noindex`, not in the sitemap, disallowed in robots.

### C4. /sample (`public/sample/index.html`)
- After the claim: "🎁 Your free 50 g {flavour} taste pack is reserved. It ships **free with your first order** – just order with this same number and it's added automatically." Show "Your BROSKI code" (new customers) with Copy.
- If the pincode is in zone A, add an extra checkbox: "Drop my sample on your next delivery run (no order needed)", which sets mode `route_drop`.
- Outside zones A and B: reserve the sample and show the waitlist meter.
- Remove the "Send on WhatsApp to confirm" step.

### C5. /points
- Show orders with status and an **Order again** button (opens the sheet with the same items).
- Show a "My recent orders on this device" list from localStorage links.
- Show sample status in words: Reserved / Added to BRK-… / Given.

### C6. /admin – tabs and features exactly as in Part B §5
- **Today:**
  - KPIs.
  - Poll new orders every 30 s (`orders` where `created_at` is greater than the last seen). On a new one, play a short sound and show a browser `Notification` (ask permission once) plus a badge.
  - Call the claim-expiry function on load.
- **Orders:**
  - Filters. A detail drawer with all fields. `tel:` and `https://wa.me/91…` links (customer's number). Status buttons through the admin RPCs. Mark paid (method + UTR).
  - Print bill (opens `/order/?no=…&t=…&print=1`). Print packing slip (A6: order number, name, address, landmark, slot, items + sample, COD amount to collect).
- **Packing list:** confirmed orders for the chosen date grouped by zone → pincode, with totals per product + samples, printable.
- **Samples:** status filters, linked order, mark given at shop or route.
- **Customers:** search, history, points, sample, feedback.
- **Waitlist:** count by pincode (sorted), list with phones, CSV.
- **Reports:** sales by day (last 30), by product, AOV, repeat rate.
- **Export CSV:** orders (flattened items), customers, samples, waitlist, feedback, points.
- **Settings:** edit every `settings` key with a form, save through `admin_update_settings`.

### C7. Text and legal
- **/terms:**
  - Delivery zones (A own delivery: free from ₹295, otherwise ₹30; B Porter, fare paid at delivery; others: waitlist).
  - Payment (Cash/UPI on delivery, UPI before delivery; verified manually).
  - Cancellation: free until "Out for delivery".
  - 3-day replacement with a photo.
  - Bills issued as Bill of Supply.
- **/privacy:** address and slot collected for delivery; Porter receives name, phone and address only for Porter deliveries; Telegram alert goes only to BROSKI.
- **Home:** the unit-price line and FAQ match the zones ("Delivering in 110041 now; nearby areas by Porter; more areas soon").
- **llms.txt:** update ordering ("order on broskipetfood.com; Cash/UPI on delivery").

### C8. Tests (report pass/fail; use a TEST customer and cancel test orders afterwards)
1. Build passes, no console errors at 390 / 820 / 1440 px on all pages.
2. **Order sheet on a 390 px phone:** the Place-order button and total are always visible, nothing is cut off, and the done screen fits with its buttons visible.
3. **Pincodes:**
   - 110041 → zone A, ₹30 fee under ₹295, free at ₹295+.
   - 110059 → zone B Porter option + waitlist.
   - 110092 → waitlist with a count.
4. Changing a price in DevTools before placing an order doesn't change the saved total.
5. **Sample:**
   - claim → first order with the same phone shows the free sample line, and the claim becomes `added`
   - a 2nd order → no sample
   - another phone with the same address → no sample
6. **Admin:**
   - new order beep + notification
   - Confirm → Out for delivery → Delivered
   - the bill number `BRK/26-27/0001` appears and the customer page shows the bill
   - Download PDF prints only the bill
   - points added once
7. Mark paid with a UTR → `payment_status = paid`, and the bill is issued if it wasn't already.
8. The CSV exports open in Excel.
9. The track page with a wrong token → "not found", with no data shown.
10. GA4 requests contain no phone, name or address.

**Hand back:**
- changed files, the SQL file, test results
- screenshots at 390 px of every checkout step, the done screen, the track page with the bill, the PDF print preview, /sample after a claim, and every /admin tab
- commit on `feat/order-system-v2`, then **stop – do not deploy**

---

## Part D – What Lakshay does
1. **Send me today** (or change them in the answers box):
   - business UPI ID (Axis current account)
   - GSTIN
   - the address to print on bills
   - delivery fee under ₹295 (default ₹30)
   - zone pincodes (defaults above)
   - Instagram handle
2. **Run the SQL** `supabase/order_system_v2.sql` in Supabase after your AI finishes (SQL Editor → Run).
3. **Telegram alert (optional, 10 min):**
   - In Telegram, open @BotFather → /newbot → copy the token.
   - Send any message to your new bot, then open `https://api.telegram.org/bot<token>/getUpdates` and copy your `chat id`.
   - Put both in the `secrets` table in Supabase (Table editor). Never share the token in chat.
4. **Test day:** place 2 test orders (110041 COD, 110041 UPI), claim one sample and order with that phone, mark them delivered in admin, download the bills. Then cancel the test orders. Send me screenshots and I'll do the final check before you deploy.
5. **Later:** Razorpay (when KYC is approved) is added as a third payment option, with automatic "Paid".
