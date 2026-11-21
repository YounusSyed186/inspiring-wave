import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));
  
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  const cap = page.locator('.capabilities');
  await cap.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  
  // Click on service 05 (Mobile App Development, index 4)
  const rows = page.locator('.service-row');
  console.log('Total service rows:', await rows.count());
  
  // Click 03 UI/UX Design (index 2)
  await rows.nth(2).locator('button').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'qa/screenshots/capabilities-service-03.png' });
  console.log('Saved qa/screenshots/capabilities-service-03.png');
  
  // Click 05 Mobile App Development (index 4)
  await rows.nth(4).locator('button').click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'qa/screenshots/capabilities-service-05.png' });
  console.log('Saved qa/screenshots/capabilities-service-05.png');
  
  // Check that video or media is rendered inside .service-stage
  const stage = page.locator('.service-stage');
  const hasVideo = await stage.locator('video').count();
  const hasImg = await stage.locator('img').count();
  console.log('Stage video count:', hasVideo);
  console.log('Stage img count:', hasImg);

  console.log('Console / page errors:', errors);
  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
