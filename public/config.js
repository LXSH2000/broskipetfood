/* BROSKI site config: the ONLY place to change numbers, links and offer dates. */
window.BROSKI_CONFIG = {
  WHATSAPP_NUMBER: '919821563468',     // 91XXXXXXXXXX: country code, no +, no spaces
  EMAIL: 'support@broskipetfood.com',
  GA_MEASUREMENT_ID: 'G-YJ89P0X3QH',   // Live verified GA4 ID
  GSTIN: '',                           // Empty if not issued

  // Supabase Portal Config (Only public anon/publishable key in frontend, never service_role)
  SUPABASE_URL: window.__BROSKI_SUPABASE_URL__ || 'https://gnunhiqahhnrkroqtxib.supabase.co',
  SUPABASE_ANON_KEY: window.__BROSKI_SUPABASE_ANON_KEY__ || 'sb_publishable_RM2Nr1mk-KjUeVt9SPQmzA_ZWFyYNGG',

  OFFERS_ENABLED: ['combo', 'free-delivery-299', 'feedback-taste-pack'],
  DELIVERY_PINCODES: ['110041', '110087', '110063', '110027', '110058', '110015', '110026', '110034', '110056'],

  // Launch banner: empty text hides the banner completely
  BANNER_TEXT: '',
  BANNER_HIDE_FROM: '2026-11-23T00:00:00+05:30',

  PRODUCTS: [
    {
      id: 'bro-bites',
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
      id: 'bro-mix',
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
      img: '/broski-combo-duo.webp',
      alt: 'BROSKI Bro Combo 2 pack (Classic Crunch + Happy Mix)',
      button: 'Order the Combo',
      msg: 'Hi BROSKI! I want the Bro Combo (₹299)'
    }
  ],
  UNIT_PRICE_LINE: 'Unit price: Bro Bites – Classic Crunch ₹0.37/g · Bro Mix – Happy Mix ₹0.45/g · Combo ₹0.37/g. Free delivery within 5 km of Nangloi on orders from ₹299, otherwise ₹20.',

  MSG: {
    combo: 'Hi BROSKI! I want the Bro Combo (₹299)',
    referral: 'Hi BROSKI! My friend [name] referred me.',
    video: "Hi BROSKI! Here's my Bro's video 🎥 Batch no: ____ Bro word: ____",
    shop: 'Hi BROSKI! I run a pet shop and want to know about trade terms. Shop name: ____ Area: ____',
    hello: 'Hi BROSKI!'
  }
};
