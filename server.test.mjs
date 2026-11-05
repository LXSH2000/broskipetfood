import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { startServer } from './server.mjs';

const customer = { name: 'Test Person', email: 'test@example.com', phone: '9876543210', address: '123 Test Street', city: 'Delhi', pincode: '110001' };
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
  assert.equal(products.length, 2);
  assert.equal(products[0].name, 'Non-Veg Dog Biscuits');
  assert.equal(products[0].price, 14900);
  assert.equal(products[1].name, 'Mix Dog Biscuits');
  assert.equal(products[1].price, 14900);

  const response = await order([{ id: 'peanut', quantity: 2 }]);
  assert.equal(response.status, 201);
  const result = await response.json();
  assert.match(result.id, /^BR-\d{8}-[A-Z0-9]{4}/);
  assert.deepEqual([result.subtotal, result.discount, result.shipping, result.total], [29800, 0, 0, 29800]);

  for (const items of [[], [{ id: 'unknown', quantity: 1 }], [{ id: 'peanut', quantity: 0 }], [{ id: 'peanut', quantity: 21 }], [{ id: 'peanut', quantity: 1.5 }], [{ id: 'peanut', quantity: 1 }, { id: 'peanut', quantity: 2 }]]) {
    assert.equal((await order(items)).status, 400);
  }
  for (const change of [{ email: 'invalid' }, { phone: '123' }, { pincode: '0' }, { address: '' }]) {
    assert.equal((await order([{ id: 'peanut', quantity: 1 }], { customer: { ...customer, ...change } })).status, 400);
  }

  const concurrent = await Promise.all([order([{ id: 'peanut', quantity: 1 }]), order([{ id: 'pumpkin', quantity: 1 }])]);
  assert.ok(concurrent.every(r => r.status === 201));
  const saved = await readFile(path.join(dir, 'orders.json'), 'utf8');
  assert.equal(JSON.parse(saved).length, 3);
  for (const value of Object.values(customer)) assert.equal(saved.includes(value), false);
  assert.equal(saved.includes('customer'), false);
  assert.equal((await post('/api/newsletter', { email: 'bad' })).status, 400);
  assert.equal((await (await post('/api/newsletter', { email: customer.email })).json()).status, 'received');
  const page = await fetch(base + '/checkout');
  assert.equal(page.status, 200);
  assert.equal(page.headers.get('cache-control'), 'no-cache');
  assert.equal(page.headers.get('x-frame-options'), 'DENY');
  assert.equal(page.headers.get('x-content-type-options'), 'nosniff');
  assert.equal((await fetch(base + '/assets/missing.js')).status, 404);
  assert.equal((await fetch(base + '/api/unknown')).status, 404);
  assert.equal((await post('/api/orders', { payload: 'x'.repeat(17000) })).status, 413);
});
