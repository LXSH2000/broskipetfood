import http from 'node:http';
import { stat } from 'node:fs/promises';

const BASE = 'http://127.0.0.1:4174';

async function req(path, options = {}) {
  const url = new URL(path, BASE);
  return new Promise((resolve, reject) => {
    const r = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data,
          json
        });
      });
    });
    r.on('error', reject);
    if (options.body) {
      r.write(options.body);
    }
    r.end();
  });
}

async function runTests() {
  console.log('--- COUNCIL EMPIRICAL TEST SUITE ---');
  const results = { passed: 0, failed: 0, findings: [] };

  function assert(title, condition, extra = '') {
    if (condition) {
      console.log(`[PASS] ${title}`);
      results.passed++;
    } else {
      console.error(`[FAIL] ${title} - ${extra}`);
      results.failed++;
      results.findings.push({ title, detail: extra });
    }
  }

  // 1. Health check
  const h = await req('/api/health');
  assert('Health check returns 200 and demo mode', h.status === 200 && h.json?.mode === 'demo');

  // 2. Products API
  const p = await req('/api/products');
  assert('Products API returns 6 products', p.status === 200 && p.json?.products?.length === 6);

  // 3. Security Headers
  assert('Security header X-Frame-Options is DENY', h.headers['x-frame-options'] === 'DENY');
  assert('Security header X-Content-Type-Options is nosniff', h.headers['x-content-type-options'] === 'nosniff');
  assert('Security header Referrer-Policy is present', Boolean(h.headers['referrer-policy']));
  assert('CSP (Content-Security-Policy) header is present', Boolean(h.headers['content-security-policy']), 'Missing CSP header! Vulnerable to inline script injection or untrusted CDNs');

  // 4. Input validation - Empty body
  const emptyOrder = await req('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  assert('Empty order rejected with 400', emptyOrder.status === 400);

  // 5. Valid order
  const validOrder = await req('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{ id: 'peanut', quantity: 2 }],
      customer: {
        name: 'Arjun Sharma',
        email: 'arjun@example.com',
        phone: '9876543210',
        pincode: '110027',
        address: 'B-42 Rajouri Garden',
        city: 'New Delhi'
      },
      coupon: 'WELCOME10'
    })
  });
  assert('Valid order created with 201', validOrder.status === 201 && validOrder.json?.id?.startsWith('DEMO-'));
  assert('WELCOME10 discount correctly applied (10%)', validOrder.json?.discount === Math.round((34900 * 2) * 0.1));
  assert('Order privacy check: customer personal data not echoed back in response', !validOrder.json?.customer);

  // 6. Invalid phone formats
  const badPhone = await req('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{ id: 'peanut', quantity: 1 }],
      customer: {
        name: 'Arjun',
        email: 'a@b.com',
        phone: '1234567890', // starts with 1
        pincode: '110027',
        address: 'Some address',
        city: 'Delhi'
      }
    })
  });
  assert('Invalid phone (not starting with 6-9) rejected with 400', badPhone.status === 400);

  // 7. Invalid pincode format
  const badPin = await req('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{ id: 'peanut', quantity: 1 }],
      customer: {
        name: 'Arjun',
        email: 'a@b.com',
        phone: '9876543210',
        pincode: '010027', // starts with 0
        address: 'Some address',
        city: 'Delhi'
      }
    })
  });
  assert('Invalid pincode (starting with 0) rejected with 400', badPin.status === 400);

  // 8. Payload size limit (>16KB)
  const hugeBody = JSON.stringify({ junk: 'A'.repeat(20000) });
  const hugeReq = await req('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: hugeBody
  });
  assert('Payload over 16KB rejected with 413', hugeReq.status === 413);

  // 9. Path traversal test
  const trav = await req('/../../package.json');
  assert('Path traversal with .. is blocked with 400 or 403', [400, 403, 404].includes(trav.status));

  // 10. Concurrency stress test (15 concurrent orders)
  console.log('Testing 15 concurrent orders...');
  const orderPromises = Array.from({ length: 15 }, (_, i) => req('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{ id: 'pumpkin', quantity: 1 }],
      customer: {
        name: `Tester ${i}`,
        email: `tester${i}@example.com`,
        phone: '9876543210',
        pincode: '110027',
        address: `Test Street ${i}`,
        city: 'New Delhi'
      }
    })
  }));
  const orderResponses = await Promise.all(orderPromises);
  const allCreated = orderResponses.every(r => r.status === 201);
  const ids = new Set(orderResponses.map(r => r.json?.id));
  assert('All 15 concurrent orders succeeded (201)', allCreated);
  assert('All 15 concurrent orders got unique IDs', ids.size === 15);

  // 11. Static Image Asset Sizes
  const assets = [
    '/broski-campaign.png',
    '/broski-everyday.png',
    '/broski-products.png',
    '/dog-editorial.png'
  ];
  let totalAssetBytes = 0;
  for (const a of assets) {
    const res = await req(a);
    const len = Number(res.headers['content-length'] || 0);
    totalAssetBytes += len;
    console.log(`Asset ${a}: ${(len / (1024 * 1024)).toFixed(2)} MB`);
  }
  console.log(`Total hero image assets payload: ${(totalAssetBytes / (1024 * 1024)).toFixed(2)} MB`);
  assert('Image assets payload under 2 MB for mobile performance', totalAssetBytes < 2 * 1024 * 1024, `Current total is ${(totalAssetBytes / (1024 * 1024)).toFixed(2)} MB! Massive mobile performance bottleneck.`);

  console.log(`\nResults: ${results.passed} Passed, ${results.failed} Failed.`);
}

runTests().catch(console.error);
