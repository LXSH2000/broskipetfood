/* BROSKI site config: the ONLY place to change numbers, links and offer dates. */
window.BROSKI_CONFIG = {
  WHATSAPP_NUMBER: '919821563468',     // 91XXXXXXXXXX: country code, no +, no spaces
  TALLY_FORM_URL: 'https://tally.so/r/mB0pEq',       // feedback form link
  EMAIL: 'support@broskipetfood.com',
  GA_MEASUREMENT_ID: '',               // Empty until verified GA4 ID is issued (e.g. G-XXXXXXXXXX)
  GSTIN: '',                           // Empty until GSTIN is issued

  DELIVERY_PINCODES: ['110041', '110087', '110063', '110027', '110058', '110015', '110026', '110034', '110056'],

  // Launch banner: shown until this moment (India time), then hidden automatically
  BANNER_TEXT: '🐾 Launch week: free 50 g taste pack + free delivery in West Delhi for the first 50 orders – till 22 Nov',
  BANNER_HIDE_FROM: '2026-11-23T00:00:00+05:30',

  PRODUCTS: [
    {
      id: 'non-veg',
      title: 'Bro Bites – Classic Crunch',
      note: 'Yellow pack',
      size: '400 g',
      price: 149,
      img: '/broski-pouch-nonveg.webp',
      alt: 'BROSKI Bro Bites – Classic Crunch dog biscuits, yellow 400 g pack',
      button: 'Order on WhatsApp',
      msg: 'Hi BROSKI! I want to order Bro Bites – Classic Crunch 400 g ×1'
    },
    {
      id: 'mix',
      title: 'Bro Mix – Happy Mix',
      note: 'White pack',
      size: '400 g',
      price: 179,
      img: '/broski-pouch-mix.webp',
      alt: 'BROSKI Bro Mix – Happy Mix dog biscuits, white 400 g pack',
      button: 'Order on WhatsApp',
      msg: 'Hi BROSKI! I want to order Bro Mix – Happy Mix 400 g ×1'
    },
    {
      id: 'combo',
      title: 'Bro Combo',
      note: '1 Classic Crunch + 1 Happy Mix',
      size: '2 × 400 g',
      price: 299,
      save: 29,
      img: null,
      alt: 'BROSKI Bro Combo 2 pack',
      button: 'Order the Combo',
      msg: 'Hi BROSKI! I want the Bro Combo (₹299)'
    }
  ],
  UNIT_PRICE_LINE: 'Unit price: Bro Bites – Classic Crunch ₹0.37/g · Bro Mix – Happy Mix ₹0.45/g · Combo ₹0.37/g. Free delivery within 5 km of Nangloi on orders from ₹299, otherwise ₹20.',

  MSG: {
    combo: 'Hi BROSKI! I want the Bro Combo (₹299)',
    referral: 'Hi BROSKI! My friend [name] referred me.',
    video: "Hi BROSKI! Here's my Bro's video 🎥 Batch no: ____ Bro word: ____",
    shop: 'Hi BROSKI! I run a pet shop and want to know about the Launch Partner offer. Shop name: ____ Area: ____',
    hello: 'Hi BROSKI!'
  }
};
