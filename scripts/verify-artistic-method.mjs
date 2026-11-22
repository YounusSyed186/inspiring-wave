import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

  // Scroll to Phase 02
  const phase2 = page.locator('#method ol > li').nth(1);
  await phase2.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const topAtPhase2 = await page.locator('.artistic-method-sticky-col').evaluate(el => Math.round(el.getBoundingClientRect().top));

  // Scroll to Phase 04 (Develop)
  const phase4 = page.locator('#method ol > li').nth(3);
  await phase4.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const topAtPhase4 = await page.locator('.artistic-method-sticky-col').evaluate(el => Math.round(el.getBoundingClientRect().top));

  await page.screenshot({ path: 'qa/screenshots/method-sticky-verified.png' });
  console.log({
    topAtPhase2,
    topAtPhase4,
    isStickyWorking: topAtPhase4 >= 80 && topAtPhase4 <= 150,
    errors,
  });
  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
