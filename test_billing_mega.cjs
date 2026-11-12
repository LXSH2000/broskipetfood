const { chromium } = require('./openinbox/node_modules/playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const fileUrl = 'file:///' + path.resolve(__dirname, 'dist/billing/index.html').replace(/\\/g, '/');
  console.log('Navigating to:', fileUrl);
  await page.goto(fileUrl, { waitUntil: 'networkidle' });

  // 1. Verify Title & Header
  const title = await page.title();
  console.log('Page Title:', title);
  if (!title.includes('BROSKI')) throw new Error('Missing BROSKI in title');

  // 2. Verify Retailer Margin Calculator Box
  const marginText = await page.locator('#marginMetricsBox').innerText();
  console.log('Initial Margin Box Text:\n', marginText);
  if (!marginText.includes('₹688') || !marginText.includes('38.5%')) {
    throw new Error('Margin calculator missing expected 11+1 profit of ₹688 (38.5%)');
  }

  // 3. Test Scheme Presets
  console.log('Testing 20-Pack Wholesale Carton preset...');
  await page.locator('button.preset-pill:has-text("20-Pack Master Carton")').click();
  await page.waitForTimeout(200);
  const wholesaleMargin = await page.locator('#marginMetricsBox').innerText();
  console.log('Wholesale Margin Text:\n', wholesaleMargin);

  console.log('Testing 11+1 Retail Box preset...');
  await page.locator('button.preset-pill:has-text("11+1 Retail Box")').click();
  await page.waitForTimeout(200);

  // Fill in Buyer Details
  await page.locator('#buyerName').fill('Pawsome Pet Shoppe (Paschim Vihar)');
  await page.locator('#buyerPhone').fill('9811122334');
  await page.locator('#buyerAddress').fill('Shop 4, A-Block Market, Paschim Vihar, West Delhi');

  // 4. Test Save Record
  console.log('Clicking Save Record...');
  await page.locator('button:has-text("Save Record")').click();
  await page.waitForTimeout(500);

  // Verify badge count is 1
  const badgeVal = await page.locator('#recordCountBadge').innerText();
  console.log('Record Count Badge:', badgeVal);
  if (badgeVal !== '1') throw new Error('Badge count expected 1, got ' + badgeVal);

  // 5. Open Records Modal
  console.log('Opening Records Modal...');
  await page.locator('button:has-text("Records")').first().click();
  await page.waitForTimeout(400);

  const modalVisible = await page.locator('#recordsModal').isVisible();
  console.log('Modal visible:', modalVisible);
  if (!modalVisible) throw new Error('Records modal failed to open');

  const tableText = await page.locator('#recordsTable').innerText();
  console.log('Records Table Text:\n', tableText);
  if (!tableText.includes('Pawsome Pet Shoppe') || !tableText.includes('₹1100.00')) {
    throw new Error('Records table does not contain saved invoice details');
  }

  // 6. Test cycling status
  console.log('Testing status cycle...');
  await page.locator('.status-pill').first().click();
  await page.waitForTimeout(300);
  const updatedStatus = await page.locator('.status-pill').first().innerText();
  console.log('Updated Status Label:', updatedStatus);

  // Take screenshot of Records Modal
  await page.screenshot({ path: 'qa_screenshots/billing_records_modal.png' });
  console.log('Screenshot saved: qa_screenshots/billing_records_modal.png');

  // Close modal
  await page.locator('.btn-close-modal').click();
  await page.waitForTimeout(300);

  // Take screenshot of Canvas with 11+1 and dynamic calculations
  await page.screenshot({ path: 'qa_screenshots/billing_canvas_11plus1.png' });
  console.log('Screenshot saved: qa_screenshots/billing_canvas_11plus1.png');

  // 7. Test Mobile Viewport (390x844)
  console.log('Testing mobile viewport 390x844...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  console.log('Mobile scrollWidth:', scrollWidth);
  if (scrollWidth > 390) {
    console.warn('Warning: Mobile view has horizontal scroll of', scrollWidth);
  }
  await page.screenshot({ path: 'qa_screenshots/billing_mobile_view.png' });
  console.log('Screenshot saved: qa_screenshots/billing_mobile_view.png');

  await browser.close();
  console.log('ALL BILLING MEGA TESTS PASSED CLEANLY! ✅');
})();
