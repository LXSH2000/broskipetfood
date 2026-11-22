# BROSKI – FINAL build instructions (23 Nov 2026)
Read together with:
1. `BROSKI_Order_System_v2_2026-11-23.md` (Part C = base plan)
2. `BROSKI_Admin_Billing_Addendum_2026-11-23.md` (admin Billing)

**Where this file disagrees with those two, THIS FILE WINS.**

## 1. Scope for this build
**Payment**
- Only "Cash/UPI on delivery" (`payment_method 'cod'`).
- Hide everything about "Pay now by UPI", UPI links, QR at checkout, `attach_utr` and Razorpay. Keep the DB columns for later.

**Delivery**
- Pincode in `ZONE_A_PINS` (110041): "✅ We deliver here – arrives today or tomorrow". `delivery_fee` = 0. Keep the slot picker.
- Any other pincode: "🐾 Arriving soon in {pin}! {n} neighbours waiting" + waitlist form (`join_waitlist`). No order allowed there yet.
- Hide the zone B / Porter UI and delivery charges. Keep them in settings for later.

**Order Confirmation (not a bill) for EVERY website order**
- Done screen title: "Order Confirmed ✅ {public_no}".
- On `/order/` (the track page): an "Order Confirmation" block plus a "Download Order Confirmation (PDF)" button (`window.print`, A4 portrait, only the slip visible).
- The slip shows:
  - BROSKI logo, "ORDER CONFIRMATION", order number, date and time
  - customer name, phone masked to the last 4 digits, address, pincode, slot
  - items (qty, price, amount), the free sample line if added, total
  - "Payment: Cash/UPI on delivery", current status, support@broskipetfood.com
  - footer: "This is an order confirmation, not a tax invoice. GST bill available on request."
- Admin "Print packing slip" uses the same slip, with the full phone number and "Collect ₹{total}" in large text.

**Remove**
- All text saying "order request", "not a direct bill" or "admin confirms the final amount".
- Every automatic `window.open` to WhatsApp.
- Site-wide "Order on WhatsApp" becomes "Order now". WhatsApp stays only as an optional "Questions? WhatsApp us" link.

## 2. GST bill rules (online and offline)
1. Every order and offline sale is always saved as a sales record.
2. **Online orders with total ≥ ₹200:** auto-issue a Bill of Supply number `BRK/<FY>/0001` when the order becomes paid or delivered, and keep it on record. Don't show it on the done screen. On `/order/`, show it only after the customer taps "Need a GST bill?".
3. **Online orders with total < ₹200:** no individual bill by default.
   - Add column `bill_requested boolean default false`.
   - If the customer taps "Need a GST bill?" (public RPC `request_bill(p_no, p_token)`) or the admin presses "Issue bill", issue an individual bill from the same `BRK/` series.
4. **Daily consolidated bill:** `issue_daily_consolidated(p_date)` creates one document of type `daily` (`BRK/<FY>/D-0001` series) covering all paid or delivered online orders under ₹200 from that day that have no individual bill. It stores the date, order count, total and the list of order numbers.
   - Runs from the admin Billing/Bills "Close day" button.
   - Also runs automatically when Today is opened, for any past day not yet closed.
5. **All bills** (online, offline, daily) are stored in the `documents` table from the billing addendum, one place, one `BRK/` series.
6. **Admin "Bills" view** (inside the Billing tab):
   - filters by month and type
   - print or download each bill
   - CSV export
   - monthly summary for CMP-08: total sales (online + offline, excluding quotations, challans and cancelled), number of bills

## 3. Admin Billing (offline sales)
Exactly as in the addendum: Quotation `QT/`, Estimate/Cash memo `EST/` (temporary bill, "Not a tax invoice"), Bill of Supply `BRK/`, Delivery Challan `DC/`, daily `D-`.
- Numbers only from the database (`next_doc_no` with row lock).
- Parties (walk-in or shop), editable rates, free quantity, discount.
- Cash / UPI / Credit with Dues.
- Convert and cancel.
- Share link `/doc/`.
- Offline sales count in reports.
- No personal UPI or personal phone anywhere. No buyback or 11+1 text by default.
- Delete `tools/billing/` after the tests pass. Don't touch `invoice-builder/`.

## 4. Keep from the Order System v2 plan (Part C)
- Full order records with address, landmark, slot.
- Server-side prices and totals from `settings`.
- Track page `/order/`, /points orders + "Order again", /sample reserve → **auto-added to the first order** (phone + address check), route-drop for 110041.
- **Admin tabs:**
  - Today (new-order beep + browser notification, KPIs, claim expiry)
  - Orders (drawer, status Confirm → Out for delivery → Delivered, Mark paid cash/UPI, Cancel with reason, print slip)
  - Packing list, Samples, Customers, Waitlist
  - Billing (incl. Bills and Dues)
  - Reports, CSV exports, Settings
- Points added automatically on Delivered (1 per ₹10).
- Optional Telegram alert (`pg_net`, `secrets` table).
- /terms and /privacy updated for this scope (110041 only, cash/UPI on delivery, cancellation until out for delivery, 3-day replacement, GST bill on request, address data).

## 5. Rules
- Keep layout, fonts and theme colours (`--bk-*`, `--pz-ease`). Reduce-motion safe.
- No health claims, fake reviews or star ratings.
- Public address only "Nangloi, West Delhi – 110041". The bill address appears only on GST bills.
- Fill GSTIN, bill address and business UPI from settings. If empty, the Bill of Supply shows "GSTIN: [set in Settings]" and admin shows a warning; never invent values.

## 6. Tests
Run the C8 tests from the Order System v2 plan (skip the UPI-at-checkout and Porter ones) and the billing addendum tests, plus:
- An order at 110041 places fine. An order at 110092 shows the waitlist only.
- Order Confirmation PDF shows only the slip, with the "not a tax invoice" line.
- A ₹149 order delivered → no bill shown, and it's included in "Close day" (`D-` bill).
- A ₹149 order + "Need a GST bill?" → an individual bill that can be downloaded.
- A ₹295 order delivered → bill number issued, visible only after tapping "Need a GST bill?".
- The offline Estimate → Bill conversion keeps one sale. Numbers never repeat or skip. Cancel keeps the number.
- Grep the build and the repo: no personal UPI, no personal phone, no "Buyback".
- At 390 px: the checkout's Place-order button and total are always visible, and the done screen fits.

## 7. Hand back
- Changed files, the full SQL file (`supabase/order_system_v2.sql`), test results.
- Screenshots at 390 px of:
  - every checkout step, the done screen, the order confirmation PDF preview
  - the track page with "Need a GST bill?"
  - /sample after a claim
  - every admin tab, including Billing → New document and a printed Estimate, Bill of Supply and Challan
- Commit on branch `feat/order-system-v2`. **Do NOT deploy.** Stop and wait for Lakshay's yes.
