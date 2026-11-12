import http from 'node:http';
import { readFile, writeFile, mkdir, rename, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const root = path.dirname(fileURLToPath(import.meta.url));
export const products = [
  ['non-veg', 'Bro Bites (Non-Veg)', 14900, '400g', 'biscuits'],
  ['mix', 'Bro Mix', 17900, '400g', 'biscuits'],
  ['peanut-butter', 'Peanut Butter Dog Biscuits', 17900, '400g', 'biscuits'],
].map(([id, name, price, weight, category]) => Object.freeze({ id, name, price, weight, category }));
const fail = (message, status = 400) => Object.assign(new Error(message), { status });
const emailValid = value => typeof value === 'string' && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

async function body(req) {
  if (!(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) throw fail('Send application/json.', 415);
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 16384) throw fail('Request body is too large.', 413);
    chunks.push(chunk);
  }
  let result;
  try { result = JSON.parse(Buffer.concat(chunks).toString()); } catch { throw fail('Invalid JSON.'); }
  if (!result || typeof result !== 'object' || Array.isArray(result)) throw fail('Expected a JSON object.');
  return result;
}

export function calculateOrder(input) {
  if (!Array.isArray(input.items) || !input.items.length || input.items.length > products.length) throw fail('Choose at least one valid item.');
  const seen = new Set();
  const items = input.items.map(item => {
    const product = products.find(p => p.id === item?.id);
    if (!product) throw fail('Unknown product.');
    if (seen.has(product.id)) throw fail('Duplicate product IDs are not allowed.');
    seen.add(product.id);
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20) throw fail('Quantity must be between 1 and 20.');
    return { ...product, quantity: item.quantity, lineTotal: product.price * item.quantity };
  });
  if (items.reduce((sum, item) => sum + item.quantity, 0) > 100) throw fail('Cart limit is 100 items.');
  const customer = input.customer;
  if (!customer || typeof customer !== 'object') throw fail('Customer details are required.');
  for (const field of ['name', 'address', 'city']) {
    if (typeof customer[field] !== 'string' || !customer[field].trim() || customer[field].length > (field === 'address' ? 500 : 100)) throw fail(`Enter a valid ${field}.`);
  }
  if (!emailValid(customer.email)) throw fail('Enter a valid email address.');
  if (typeof customer.phone !== 'string' || !/^[6-9]\d{9}$/.test(customer.phone)) throw fail('Enter a valid 10-digit Indian mobile number.');
  if (typeof customer.pincode !== 'string' || !/^[1-9]\d{5}$/.test(customer.pincode)) throw fail('Enter a valid 6-digit pincode.');
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const code = randomUUID().slice(0, 4).toUpperCase();
  return { id: `BR-${dateStr}-${code}`, subtotal, discount: 0, shipping: 0, total: subtotal, status: 'order_request', items, date: now.toISOString() };
}

export async function startServer({ port = Number(process.env.PORT || 4174), dataDir = process.env.DATA_DIR || path.join(root, 'data'), distDir = path.join(root, 'dist') } = {}) {
  let writes = Promise.resolve();
  async function persist(order) {
    const next = writes.then(async () => {
      await mkdir(dataDir, { recursive: true });
      const filename = path.join(dataDir, 'orders.json');
      let orders = [];
      try { orders = JSON.parse(await readFile(filename, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
      if (!Array.isArray(orders)) throw new Error('Invalid order store.');
      orders.push(order);
      const temp = `${filename}.${randomUUID()}.tmp`;
      await writeFile(temp, JSON.stringify(orders, null, 2), { mode: 0o600 });
      await rename(temp, filename);
    });
    writes = next.catch(() => {});
    await next;
  }

  let invoiceWrites = Promise.resolve();
  async function persistInvoice(inv) {
    const next = invoiceWrites.then(async () => {
      await mkdir(dataDir, { recursive: true });
      const filename = path.join(dataDir, 'invoices.json');
      let invoices = [];
      try { invoices = JSON.parse(await readFile(filename, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
      if (!Array.isArray(invoices)) throw new Error('Invalid invoice store.');
      const idx = invoices.findIndex(i => (i.id && i.id === inv.id) || (i.billNo && i.billNo === inv.billNo));
      const record = { ...inv, updatedAt: new Date().toISOString() };
      if (idx >= 0) {
        invoices[idx] = { ...invoices[idx], ...record };
      } else {
        record.createdAt = record.createdAt || new Date().toISOString();
        invoices.unshift(record);
      }
      const temp = `${filename}.${randomUUID()}.tmp`;
      await writeFile(temp, JSON.stringify(invoices, null, 2), { mode: 0o600 });
      await rename(temp, filename);
    });
    invoiceWrites = next.catch(() => {});
    await next;
  }
  const server = http.createServer(async (req, res) => {
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    const json = (status, value) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }); res.end(JSON.stringify(value)); };
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      if (req.method === 'GET' && pathname === '/api/health') return json(200, { status: 'ok', brand: 'Broski' });
      if (req.method === 'GET' && pathname === '/api/products') return json(200, { products });
      if (req.method === 'POST' && pathname === '/api/orders') {
        const order = calculateOrder(await body(req));
        await persist(order);
        return json(201, order);
      }
      if (req.method === 'POST' && pathname === '/api/newsletter') {
        const input = await body(req);
        if (!emailValid(input.email)) throw fail('Enter a valid email address.');
        return json(200, { status: 'received', message: 'Notification signup recorded.' });
      }
      if (req.method === 'GET' && pathname === '/api/invoices') {
        const filename = path.join(dataDir, 'invoices.json');
        try {
          const invoices = JSON.parse(await readFile(filename, 'utf8'));
          return json(200, { invoices: Array.isArray(invoices) ? invoices : [] });
        } catch (error) {
          if (error.code === 'ENOENT') return json(200, { invoices: [] });
          throw error;
        }
      }
      if (req.method === 'POST' && pathname === '/api/invoices') {
        const inv = await body(req);
        if (!inv || typeof inv !== 'object' || !inv.billNo) throw fail('Valid invoice data with billNo is required.');
        if (!inv.id) inv.id = inv.billNo;
        await persistInvoice(inv);
        return json(200, { status: 'saved', invoice: inv });
      }
      if (pathname.startsWith('/api/')) return json(404, { error: 'API endpoint not found.' });
      if (!['GET', 'HEAD'].includes(req.method)) return json(405, { error: 'Method not allowed.' });
      if (pathname.includes('\\') || pathname.includes('\0') || pathname.split('/').includes('..')) return json(400, { error: 'Invalid path.' });
      const base = path.resolve(distDir);
      let filename = path.resolve(base, `.${pathname}`);
      if (filename !== base && !filename.startsWith(base + path.sep)) return json(403, { error: 'Forbidden.' });
      if (pathname.endsWith('/')) filename = path.join(filename, 'index.html');
      let content;
      try {
        const resolved = await realpath(filename);
        const realBase = await realpath(base);
        if (!resolved.startsWith(realBase + path.sep)) return json(403, { error: 'Forbidden.' });
        content = await readFile(resolved);
      } catch (error) {
        if (!['ENOENT', 'ENOTDIR'].includes(error.code)) throw error;
        if (path.extname(pathname) || pathname.startsWith('/assets/')) return json(404, { error: 'Asset not found.' });
        filename = path.join(base, 'index.html');
        try { content = await readFile(filename); } catch { return json(404, { error: 'Build the frontend first.' }); }
      }
      const mime = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.webp': 'image/webp',
        '.ico': 'image/x-icon',
        '.woff2': 'font/woff2',
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.xml': 'application/xml; charset=utf-8',
        '.txt': 'text/plain; charset=utf-8'
      };
      const cache = pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache';
      const ext = path.extname(filename);
      const contentType = mime[ext] || 'application/octet-stream';
      const range = req.headers.range;
      if (range && (ext === '.mp4' || ext === '.webm')) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10) || 0;
        const end = parts[1] ? parseInt(parts[1], 10) : content.length - 1;
        const chunk = content.subarray(start, end + 1);
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${content.length}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunk.length,
          'Content-Type': contentType,
          'Cache-Control': cache
        });
        return res.end(req.method === 'HEAD' ? undefined : chunk);
      }
      res.writeHead(200, { 'Content-Type': contentType, 'Accept-Ranges': 'bytes', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': cache });
      res.end(req.method === 'HEAD' ? undefined : content);
    } catch (error) { json(error.status || (error instanceof URIError ? 400 : 500), { error: error.status ? error.message : 'Unable to complete this request.' }); }
  });
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  return server;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  startServer().then(server => console.log(`BROSKI preview: http://127.0.0.1:${server.address().port} — no payment or dispatch`)).catch(error => { console.error(error.message); process.exitCode = 1; });
}
