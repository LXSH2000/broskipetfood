import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { startServer } from './server.mjs';
import { checkPincode, UPI_RE, esc } from './src/helpers.js';

const customer = { name: 'Test Person', email: 'test@example.com', phone: '9876543210', address: '123 Test Street', city: 'Delhi', pincode: '110001' };

test('helpers: checkPincode validates local, Delhi, outside and invalid formats', () => {
  const local = checkPincode('110041');
  assert.equal(local.kind, 'local');
  assert.ok(local.text.includes('Fast local delivery'));

  const delhi = checkPincode('110001');
  assert.equal(delhi.kind, 'delhi');
  assert.ok(delhi.text.includes('local courier'));

  const outside = checkPincode('400001');
  assert.equal(outside.kind, 'outside');
  assert.ok(outside.text.includes('only in Delhi'));

  const bad = checkPincode('12');
  assert.equal(bad.kind, 'error');
  assert.ok(bad.text.includes('6-digit'));
});

test('helpers: UPI_RE and esc sanitize billing inputs safely', () => {
  assert.equal(UPI_RE.test('8076045934@paytm'), true);
  assert.equal(UPI_RE.test('lakshay.dtu@okaxis'), true);
  assert.equal(UPI_RE.test('invalid-upi'), false);
  assert.equal(UPI_RE.test(''), false);

  assert.equal(esc('<script>alert("xss")</script>'), '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  assert.equal(esc('Pet Zone & Co.'), 'Pet Zone &amp; Co.');
  assert.equal(esc(null), '');
});

test('order API protects order totals, validation and customer privacy', async t => {
  const dir = await mkdtemp(path.join(tmpdir(), 'biscuit-test-'));
  const distDir = path.join(dir, 'dist');
  await mkdir(distDir);
  await writeFile(path.join(distDir, 'index.html'), '<html>demo</html>');
  const server = await startServer({ port: 0, dataDir: dir, distDir });
  t.after(async () => { await new Promise(resolve => server.close(resolve)); await rm(dir, { recursive: true, force: true }); });
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = (route, data) => fetch(base + route, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  const order = (items, extras = {}) => post('/api/orders', { customer, items, ...extras });

  assert.equal((await (await fetch(base + '/api/health')).json()).brand, 'Broski');
  const products = (await (await fetch(base + '/api/products')).json()).products;
  assert.equal(products.length, 3);
  assert.equal(products[0].name, 'Bro Bites (Non-Veg)');
  assert.equal(products[0].price, 14900);
  assert.equal(products[1].name, 'Bro Mix');
  assert.equal(products[1].price, 17900);
  assert.equal(products[2].name, 'Peanut Butter Dog Biscuits');
  assert.equal(products[2].price, 17900);

  const response = await order([{ id: 'non-veg', quantity: 2 }]);
  assert.equal(response.status, 201);
  const result = await response.json();
  assert.match(result.id, /^BR-\d{8}-[A-Z0-9]{4}/);
  assert.deepEqual([result.subtotal, result.discount, result.shipping, result.total], [29800, 0, 0, 29800]);

  for (const items of [[], [{ id: 'unknown', quantity: 1 }], [{ id: 'non-veg', quantity: 0 }], [{ id: 'non-veg', quantity: 21 }], [{ id: 'non-veg', quantity: 1.5 }], [{ id: 'non-veg', quantity: 1 }, { id: 'non-veg', quantity: 2 }]]) {
    assert.equal((await order(items)).status, 400);
  }
  for (const change of [{ email: 'invalid' }, { phone: '123' }, { pincode: '0' }, { address: '' }]) {
    assert.equal((await order([{ id: 'non-veg', quantity: 1 }], { customer: { ...customer, ...change } })).status, 400);
  }

  const concurrent = await Promise.all([order([{ id: 'non-veg', quantity: 1 }]), order([{ id: 'mix', quantity: 1 }])]);
  assert.ok(concurrent.every(r => r.status === 201));
  const saved = await readFile(path.join(dir, 'orders.json'), 'utf8');
  assert.equal(JSON.parse(saved).length, 3);
  for (const value of Object.values(customer)) assert.equal(saved.includes(value), false);
  assert.equal(saved.includes('customer'), false);
  assert.equal((await post('/api/newsletter', { email: 'bad' })).status, 400);
  assert.equal((await (await post('/api/newsletter', { email: customer.email })).json()).status, 'received');

  // Test Invoices API persistence
  const invGetEmpty = await (await fetch(base + '/api/invoices')).json();
  assert.deepEqual(invGetEmpty, { invoices: [] });
  const testInv = {
    id: 'BRS-TEST-001',
    billNo: 'BRS/26-27/001',
    billDate: '2026-11-15',
    docMode: 'bill',
    buyerName: 'Paws & Tails West Delhi',
    buyerPhone: '9876543210',
    grandTotal: 1100,
    paymentStatus: 'PAID',
    items: [{ desc: 'Bro Bites', qty: 11, freeQty: 1, rate: 100 }]
  };
  const invPost = await post('/api/invoices', testInv);
  assert.equal(invPost.status, 200);
  const invSaved = await (await fetch(base + '/api/invoices')).json();
  assert.equal(invSaved.invoices.length, 1);
  assert.equal(invSaved.invoices[0].buyerName, 'Paws & Tails West Delhi');

  const page = await fetch(base + '/checkout');
  assert.equal(page.status, 200);
  assert.equal(page.headers.get('cache-control'), 'no-cache');
  assert.equal(page.headers.get('x-frame-options'), 'DENY');
  assert.equal(page.headers.get('x-content-type-options'), 'nosniff');
  await writeFile(path.join(distDir, 'sitemap.xml'), '<urlset><url><loc>https://broskipetfood.com/</loc></url></urlset>');
  await writeFile(path.join(distDir, 'robots.txt'), 'User-agent: *\nAllow: /');
  await writeFile(path.join(distDir, 'llms.txt'), '# BROSKI Pet Food');

  const sitemapRes = await fetch(base + '/sitemap.xml');
  assert.equal(sitemapRes.status, 200);
  assert.equal(sitemapRes.headers.get('content-type'), 'application/xml; charset=utf-8');

  const robotsRes = await fetch(base + '/robots.txt');
  assert.equal(robotsRes.status, 200);
  assert.equal(robotsRes.headers.get('content-type'), 'text/plain; charset=utf-8');

  const llmsRes = await fetch(base + '/llms.txt');
  assert.equal(llmsRes.status, 200);
  assert.equal(llmsRes.headers.get('content-type'), 'text/plain; charset=utf-8');

  assert.equal((await fetch(base + '/assets/missing.js')).status, 404);
  assert.equal((await fetch(base + '/api/unknown')).status, 404);
  assert.equal((await post('/api/orders', { payload: 'x'.repeat(17000) })).status, 413);
});
