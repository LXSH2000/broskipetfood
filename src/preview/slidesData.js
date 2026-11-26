export const SLIDES = [
  {
    id: 'bites',
    tab: 'Bro Bites',
    word: 'BITES',
    backdrop: '#E3A92B',
    lightLabel: '#FCEFC9',
    pouch: '/broski-bites-cut.webp',
    pouchAlt: 'BROSKI Bro Bites – Classic Crunch 400 g pouch cut-out',
    flipPouch: '/broski-bites-cut.webp',
    flipTitle: 'BRO BITES · CLASSIC CRUNCH',
    flipWeight: '400 G',
    productKey: 'bro-bites',
    priceLine: '₹149 · Classic Crunch · 400 g',
    bigPrice: '₹149',
    orderTarget: 'bro-bites',
    num: '01',
    bones: ['#5A321D', '#7E4B2D', '#4A2816', '#915C3B', '#6B3D24', '#865233']
  },
  {
    id: 'mix',
    tab: 'Bro Mix',
    word: 'MIX',
    backdrop: '#8DBF83',
    lightLabel: '#E4F2DE',
    pouch: '/broski-mix-cut.webp',
    pouchAlt: 'BROSKI Bro Mix – Happy Mix 400 g pouch cut-out',
    flipPouch: '/broski-mix-cut.webp',
    flipTitle: 'BRO MIX · HAPPY MIX',
    flipWeight: '400 G',
    productKey: 'bro-mix',
    priceLine: '₹179 · Happy Mix · 400 g',
    bigPrice: '₹179',
    orderTarget: 'bro-mix',
    num: '02',
    bones: ['#F2C94C', '#7CB342', '#6B3E26', '#FFF5DF', '#E67E22', '#F2C94C']
  },
  {
    id: 'combo',
    tab: 'Combo',
    word: 'COMBO',
    backdrop: '#D9694A',
    lightLabel: '#FADFD5',
    pouch: '/broski-mix-cut.webp',
    pouch2: '/broski-bites-cut.webp',
    pouchAlt: 'BROSKI Bro Combo: Bro Mix and Bro Bites 400 g pouches side by side',
    flipPouch: '/broski-bites-cut.webp',
    flipTitle: 'BRO BITES · CLASSIC CRUNCH',
    flipWeight: '400 G',
    productKey: 'bro-bites',
    priceLine: '₹295 · 1 Bites + 1 Mix · 10% off',
    bigPrice: '₹295',
    orderTarget: 'combo',
    num: '03',
    bones: ['#F2C94C', '#7CB342', '#5A321D', '#FFF5DF', '#E67E22', '#865233']
  },
  {
    id: 'taste',
    tab: 'Taste pack',
    word: 'TASTE',
    backdrop: '#B98D63',
    lightLabel: '#EFE0CE',
    pouch: '/broski-sample-cut.webp',
    pouchAlt: 'BROSKI complimentary 50 g taste pack pouch cut-out',
    flipPouch: '/broski-sample-cut.webp',
    flipTitle: '50 G TASTE PACK',
    flipWeight: '50 G',
    productKey: 'sample',
    priceLine: 'FREE with your first order',
    bigPrice: 'FREE',
    orderTarget: 'sample',
    num: '04',
    bones: ['#6B4426', '#8C623E', '#54331B', '#9D734F', '#774E2E', '#623D20']
  }
];

export const FLIP_STEPS = [
  {
    num: '01',
    shortLabel: 'Real crunch',
    heading: 'REAL FOOD, REAL CRUNCH',
    copy: 'Crunchy bone biscuits your bro will beg for. Every ingredient is printed on the back – nothing hidden.',
    deg: 0
  },
  {
    num: '02',
    shortLabel: "What's inside",
    heading: "WHAT'S INSIDE",
    copy: 'Flip it over: the full ingredient list, net weight and best-before, right on the pack.',
    deg: 180
  },
  {
    num: '03',
    shortLabel: 'Clear window',
    heading: 'SEE EVERY BISCUIT',
    copy: 'A clear window pouch, so you see exactly what you are buying before you open it.',
    deg: 360
  },
  {
    num: '04',
    shortLabel: 'From Nangloi',
    heading: 'FROM NANGLOI, TO YOUR DOOR',
    copy: 'Packed in Nangloi, West Delhi. Free delivery in 110041 – today or tomorrow, in your slot.',
    deg: 720
  }
];

export const BONE_SLOTS = [
  { className: 'pv-bone pv-bone--tl', dur: '4.6s', delay: '-1.1s', blurred: true },
  { className: 'pv-bone pv-bone--tr', dur: '3.6s', delay: '-0.4s', blurred: false },
  { className: 'pv-bone pv-bone--ml', dur: '3.3s', delay: '-2.2s', blurred: false },
  { className: 'pv-bone pv-bone--mr', dur: '4.2s', delay: '-1.7s', blurred: false },
  { className: 'pv-bone pv-bone--bl', dur: '3.9s', delay: '-0.7s', blurred: false },
  { className: 'pv-bone pv-bone--br', dur: '4.9s', delay: '-2.8s', blurred: true }
];

export function getFlipIngredients(productKey, products = []) {
  const bites = products.find((p) => p.id === 'bro-bites');
  const mix = products.find((p) => p.id === 'bro-mix');
  const bitesText = bites?.ingredients || 'Real Chicken, Egg Powder, Whole Wheat Flour, Rice Flour, Corn Flour, Fish Oil, Vegetable Oil, Sodium Bicarbonate, Flavours, Permitted Colours.';
  const mixText = mix?.ingredients || 'Chicken Powder, Egg Powder, Whole Wheat Flour, Rice Flour, Corn Flour, Fish Oil, Vegetable Oil, Sodium Bicarbonate, Flavours, Colour.';
  if (productKey === 'bro-mix') return mixText;
  if (productKey === 'sample') {
    return `Choice of Bro Bites (${bitesText}) or Bro Mix (${mixText})`;
  }
  return bitesText;
}
