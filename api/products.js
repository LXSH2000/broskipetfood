export const products = [
  { id: 'peanut', name: 'Non-Veg Dog Biscuits', price: 14900, weight: '400g', category: 'biscuits' },
  { id: 'pumpkin', name: 'Mix Dog Biscuits', price: 14900, weight: '400g', category: 'training' }
];

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.status(200).json({ products });
}
