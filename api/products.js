export const products = [
  { id: 'bro-bites', name: 'Bro Bites – Classic Crunch', price: 14900, weight: '400g', category: 'biscuits' },
  { id: 'bro-mix', name: 'Bro Mix – Happy Mix', price: 17900, weight: '400g', category: 'biscuits' },
  { id: 'combo', name: 'Bro Combo', price: 29500, weight: '2x400g', category: 'biscuits' }
];

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.status(200).json({ products });
}
