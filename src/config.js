// Broski Storefront Central Configuration
// Synchronized with public/config.js

export const CONFIG = {
  BRAND_NAME: 'Broski',
  TAGLINE: 'Treats for your best bro.',
  SUPPORT_EMAIL: 'support@broskipetfood.com',
  GA_MEASUREMENT_ID: '', // Set when verified GA4 ID is available
  WHATSAPP_NUMBER: '918076045934',
  FORM_ENDPOINT: 'https://api.web3forms.com/submit',
  FORM_ACCESS_KEY: '',
  LAUNCH_STATUS: 'coming',
  LAUNCH_DATE: 'November 2026',
  LAUNCH_LOCATION: 'West Delhi (Nangloi)',
  UDYAM_REGISTRATION: 'UDYAM-DL-11-0177908',
  GSTIN: '',

  // West Delhi delivery coverage
  WEST_DELHI_PINCODES: ['110041', '110087', '110063', '110027', '110058', '110015', '110026', '110034', '110056'],

  PRODUCTS: [
    {
      id: 'non-veg',
      name: 'Bro Bites (Non-Veg)',
      price: 14900,
      weight: '400g',
      category: 'biscuits',
      pouchColor: 'yellow',
      image: '/broski-pouch-nonveg.jpg',
      tag: '400g Stand-up Pouch · ₹149',
      shortDesc: 'Crunchy bone-shaped biscuits in our yellow zip pouch with transparent window.'
    },
    {
      id: 'mix',
      name: 'Bro Mix',
      price: 17900,
      weight: '400g',
      category: 'biscuits',
      pouchColor: 'white',
      image: '/broski-pouch-mix.jpg',
      tag: '400g Stand-up Pouch · ₹179',
      shortDesc: 'A crunchy blend in our white zip pouch with transparent window.'
    }
  ]
};

// WhatsApp Order Helper
export function getWhatsAppOrderLink(items = [], extra = '') {
  const phone = CONFIG.WHATSAPP_NUMBER ? CONFIG.WHATSAPP_NUMBER.replace(/\D/g, '') : '';
  if (!phone) return '';
  if (!items.length) {
    const text = 'Hi Broski! I would like to enquire about your crunchy dog biscuits.';
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  }
  const lines = items.map(i => `• ${i.product ? i.product.name : i.name} (400g) × ${i.quantity} = ₹${(((i.product ? i.product.price : i.price) || 14900) / 100) * i.quantity}`);
  const total = items.reduce((s, i) => s + (((i.product ? i.product.price : i.price) || 14900) / 100) * i.quantity, 0);
  const text = `Hi Broski! I would like to place an order request:\n\n${lines.join('\n')}\n\nEstimated Total: ₹${total}\n${extra ? extra + '\n' : ''}\nPlease confirm delivery in West Delhi. Thank you!`.trim();
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
