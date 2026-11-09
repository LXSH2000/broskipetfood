// Broski Storefront Central Configuration
// Non-developers can safely edit numbers, emails, ingredients, and status here.

export const CONFIG = {
  BRAND_NAME: 'Broski',
  TAGLINE: 'Treats for your best bro.',
  SUPPORT_EMAIL: 'support@broskipetfood.com',
  GA_MEASUREMENT_ID: 'G-BROSKI2026', // Google Analytics 4 Measurement ID
  // Digits only with country code (91 for India). Empty string hides all WhatsApp buttons until new SIM is ready:
  WHATSAPP_NUMBER: '', 
  // Formspree / Web3Forms / Google Apps Script endpoint:
  FORM_ENDPOINT: 'https://api.web3forms.com/submit',
  FORM_ACCESS_KEY: '', // Paste Web3Forms free key here when ready; falls back gracefully
  LAUNCH_STATUS: 'coming', // 'live' or 'coming'
  LAUNCH_DATE: 'November 2026',
  LAUNCH_LOCATION: 'West Delhi (Nangloi)',
  UDYAM_REGISTRATION: 'UDYAM-DL-11-0177908',
  
  // West Delhi delivery coverage
  WEST_DELHI_PINCODES: ['110041', '110087', '110063', '110027', '110058', '110015', '110026', '110034', '110056'],

  PRODUCTS: [
    {
      id: 'non-veg',
      legacyId: 'peanut',
      name: 'Non-Veg Dog Biscuits',
      price: 14900,
      weight: '400g',
      category: 'biscuits',
      pouchColor: 'yellow',
      image: '/broski-pouch-nonveg.jpg',
      tag: '400g Stand-up Pouch · ₹149',
      shortDesc: 'Real crunchy bone biscuits in our yellow zip pouch. Sealed for your best bro.',
      ingredients: 'Whole wheat flour, real poultry & bone meal, wholesome cereals, poultry fat, essential vitamins and minerals. Stamped and sealed by hand in Nangloi.',
      analysis: {
        protein: '≥ 20%',
        fat: '≥ 8%',
        fibre: '≤ 4%',
        moisture: '≤ 10%'
      },
      feedingGuide: 'Small dogs (<10kg): 2–4 biscuits/day · Medium (10–25kg): 4–8 biscuits/day · Large (25kg+): 8–12 biscuits/day'
    },
    {
      id: 'mix',
      legacyId: 'pumpkin',
      name: 'Mix Dog Biscuits',
      price: 14900,
      weight: '400g',
      category: 'biscuits',
      pouchColor: 'white',
      image: '/broski-pouch-mix.jpg',
      tag: '400g Stand-up Pouch · ₹149',
      shortDesc: 'A flavourful crunchy blend in our white zip pouch. Real bone biscuits visible right in the window.',
      ingredients: 'Whole wheat flour, blend of chicken meal & vegetal extracts, poultry fat, natural minerals and vitamins. 100% crunchy baked texture.',
      analysis: {
        protein: '≥ 18%',
        fat: '≥ 7%',
        fibre: '≤ 4%',
        moisture: '≤ 10%'
      },
      feedingGuide: 'Small dogs (<10kg): 2–4 biscuits/day · Medium (10–25kg): 4–8 biscuits/day · Large (25kg+): 8–12 biscuits/day'
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
