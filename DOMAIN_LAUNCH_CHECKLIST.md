# BROSKI Domain & Pre-Launch Infrastructure Blueprint
**Domain:** `broskipetfood.com`  
**Brand / Legal:** BROSKI (Sole Proprietorship · Nangloi, New Delhi · Lakshay)  
**Executive Lead:** Rex (CEO, AI Executive Team)  
**Status:** Pre-Launch Verified & Production Ready  

---

## 1. Analytics & Traffic Attribution (GA4 + UTM Engine)

### Live Implementation in Codebase:
- **Google Analytics 4 Loader:** Added to [`index.html`](file:///d:/BROSKI%20ANTIGRAVITY/index.html) (configurable via `GA_MEASUREMENT_ID` in `config.js`).
- **Zero-Cookie UTM Tracker:** Implemented in [`public/analytics.js`](file:///d:/BROSKI%20ANTIGRAVITY/public/analytics.js).
  - Automatically captures `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`.
  - Persists source attribution across sessions.
  - Automatically appends attribution to incoming WhatsApp orders:  
    *Example:* `Hi BROSKI! I want to order Non-Veg 400g [Ref: instagram / delhi_launch]` or `[Ref: pouch_qr / sampler_review]`.
  - Detects device type (`mobile`, `tablet`, `desktop`), screen resolution, and time zone.

### Recommended Campaign UTM URL Templates:
- **Pouch Packaging QR Code (50g & 400g):**  
  `https://broskipetfood.com/r/?utm_source=pouch_qr&utm_medium=packaging&utm_campaign=taste_sampler`
- **Instagram Reels / Bio:**  
  `https://broskipetfood.com/?utm_source=instagram&utm_medium=social_bio&utm_campaign=delhi_launch`
- **WhatsApp B2B Retailer Outreach:**  
  `https://broskipetfood.com/?utm_source=whatsapp&utm_medium=direct_outreach&utm_campaign=petshop_partner`

---

## 2. Main Domain vs. Subdomain Architecture

To prevent heavy app code or admin tools from slowing down marketing SEO, BROSKI separates concerns:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      broskipetfood.com (ROOT)                          │
│  Fast, static D2C landing page: Hero, Biscuit Showcase, Reviews, WA    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┼───────────────────────────────┐
    ▼                               ▼                               ▼
mail.broskipetfood.com    admin.broskipetfood.com         api.broskipetfood.com
[OpenInbox Webmail]       [Invoice Builder & Wholesale]   [n8n Automation & Webhooks]
• Zero per-seat fee       • B2B Delhi Shop Invoices       • Instant WhatsApp alerts
• Receives hello@         • Preloaded with 400g & 50g     • Review sync
```

---

## 3. Email Domains & Reputation Isolation (Crucial!)

Never send marketing blasts from your main or transactional domain. If a promotional newsletter gets flagged as spam, your order confirmations and wholesale invoices will land in spam too.

### The 3-Tier Domain Architecture:

| Email Category | Domain / Subdomain | Purpose | Provider | Daily Cap (Free) |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Business** | `@broskipetfood.com` | 1-on-1 human emails with shop owners, distributors & banks (`hello@`, `lakshay@`) | OpenInbox / Cloudflare Email Routing | Unlimited |
| **Transactional** | `@notify.broskipetfood.com` (or `@mail.`) | Automated order receipts, Invoice Builder PDFs, OTPs, delivery alerts | Resend Transactional API | 100/day (3,000/mo) |
| **Marketing & Promos** | `@news.broskipetfood.com` | Dog care tips, launch announcements, festival discounts, re-order reminders | Brevo / Mailjet Marketing | 300/day (9,000/mo) |

### Copy-Paste DNS Records for Email Deliverability (OVH / Cloudflare):

#### A. Inbound Email (Cloudflare Email Routing on Root)
- **MX:** `route1.mx.cloudflare.net` (Priority 13)
- **MX:** `route2.mx.cloudflare.net` (Priority 45)
- **MX:** `route3.mx.cloudflare.net` (Priority 87)

#### B. Root Domain SPF & DMARC
- **TXT (Root `@`):**  
  `v=spf1 include:_spf.mx.cloudflare.net include:resend.com ~all`
- **TXT (`_dmarc.broskipetfood.com`):**  
  `v=DMARC1; p=reject; rua=mailto:dmarc-reports@broskipetfood.com; pct=100; sp=reject`

#### C. Transactional Subdomain (`notify.broskipetfood.com`)
- **TXT (`notify`):**  
  `v=spf1 include:resend.com ~all`
- **CNAME (`resend._domainkey.notify`):** Provided by Resend during setup.

#### D. Marketing Subdomain (`news.broskipetfood.com`)
- **TXT (`news`):**  
  `v=spf1 include:spf.brevo.com ~all`
- **TXT (`mail._domainkey.news`):** Provided by Brevo during setup.

---

## 4. Robots.txt, Security & DNS Leaks Check

### Updated & Verified [`public/robots.txt`](file:///d:/BROSKI%20ANTIGRAVITY/public/robots.txt):
```txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /app/
Disallow: /invoices/
Disallow: /private/
Disallow: /*.json$

# Canonical XML Sitemap for Google Search Console
Sitemap: https://broskipetfood.com/sitemap.xml
```

### Security & Privacy Protections:
- `index.html` includes: `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">`
- Sensitive internal folders (`/admin/`, `/invoices/`, `/api/`, `*.json`) are explicitly blocked from Google crawlers.
- SSL/TLS is set to **Full (Strict)** with automatic HTTPS redirection.

---

## 5. Google Search Console & Sitemap Submission Guide

### Step 1: Claim Ownership in Google Search Console
1. Go to: [search.google.com/search-console](https://search.google.com/search-console)
2. Choose **URL prefix** and enter: `https://broskipetfood.com`
3. Verification options:
   - **Method A (Easiest - HTML Tag):**  
     In [`index.html`](file:///d:/BROSKI%20ANTIGRAVITY/index.html), replace `GSC_VERIFICATION_TOKEN_HERE` with your token from Google:  
     `<meta name="google-site-verification" content="YOUR_ACTUAL_CODE">`  
     Deploy site and click **Verify**.
   - **Method B (DNS TXT in OVH / Cloudflare):**  
     Add the TXT record Google gives you:  
     `google-site-verification=YOUR_ACTUAL_CODE`

### Step 2: Submit XML Sitemap
1. Inside Google Search Console, click **Sitemaps** on the left menu.
2. In the "Add a new sitemap" box, type:  
   **`sitemap.xml`**
3. Click **Submit**.
4. Status will change to **Success**, indexing:
   - `https://broskipetfood.com/` (Priority 1.0)
   - `https://broskipetfood.com/r/` (Review & 50g Free Sampler QR portal - Priority 0.9)
   - `https://broskipetfood.com/offers/` (Priority 0.8)
   - `https://broskipetfood.com/privacy/` (Priority 0.3)
