import { randomUUID } from 'node:crypto';

export const products = [
  { id: 'peanut', name: 'Non-Veg Dog Biscuits', price: 14900, weight: '400g', category: 'biscuits' },
  { id: 'pumpkin', name: 'Mix Dog Biscuits', price: 14900, weight: '400g', category: 'training' }
];

const fail = (message, status = 400) => Object.assign(new Error(message), { status });
const emailValid = value => typeof value === 'string' && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export function calculateOrder(input) {
  if (!Array.isArray(input.items) || !input.items.length || input.items.length > products.length) {
    throw fail('Choose at least one valid item.');
  }
  const seen = new Set();
  const items = input.items.map(item => {
    const product = products.find(p => p.id === item?.id);
    if (!product) throw fail('Unknown product.');
    if (seen.has(product.id)) throw fail('Duplicate product IDs are not allowed.');
    seen.add(product.id);
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20) {
      throw fail('Quantity must be between 1 and 20.');
    }
    return { ...product, quantity: item.quantity, lineTotal: product.price * item.quantity };
  });

  if (items.reduce((sum, item) => sum + item.quantity, 0) > 100) {
    throw fail('Cart limit is 100 items.');
  }

  const customer = input.customer;
  if (!customer || typeof customer !== 'object') throw fail('Customer details are required.');
  for (const field of ['name', 'address', 'city']) {
    if (typeof customer[field] !== 'string' || !customer[field].trim() || customer[field].length > (field === 'address' ? 500 : 100)) {
      throw fail(`Enter a valid ${field}.`);
    }
  }
  if (!emailValid(customer.email)) throw fail('Enter a valid email address.');
  if (typeof customer.phone !== 'string' || !/^[6-9]\d{9}$/.test(customer.phone)) {
    throw fail('Enter a valid 10-digit Indian mobile number.');
  }
  if (typeof customer.pincode !== 'string' || !/^[1-9]\d{5}$/.test(customer.pincode)) {
    throw fail('Enter a valid 6-digit pincode.');
  }

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const code = randomUUID().slice(0, 4).toUpperCase();
  return {
    id: `BR-${dateStr}-${code}`,
    subtotal,
    discount: 0,
    shipping: 0,
    total: subtotal,
    status: 'order_request',
    items,
    date: now.toISOString()
  };
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const order = calculateOrder(body);
    return res.status(201).json(order);
  } catch (err) {
    return res.status(err.status || 400).json({ error: err.message || 'Invalid order data.' });
  }
}
