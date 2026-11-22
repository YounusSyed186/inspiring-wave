import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  const finale = page.locator('.finale-cta-section');
  await finale.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);

  const headingText = await finale.locator('h2').innerText();
  const imgCount = await finale.locator('.cta-slider-card img').count();
  const videoCount = await finale.locator('.cta-slider-card video').count();

  // Switch to Track 02
  await finale.locator('button:has-text("02")').first().click();
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'qa/screenshots/finale-fixed.png' });
  console.log({
    headingText: headingText.replace(/\s+/g, ' ').trim(),
    imgCount,
    videoCount,
    errors,
  });
  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
