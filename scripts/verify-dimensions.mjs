import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  const dim = page.locator('#dimensions');
  await dim.scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);

  const headingText = await dim.locator('h2').innerText();
  const layerCount = await dim.locator('img').count();
  const videoCount = await dim.locator('video').count();

  await page.screenshot({ path: 'qa/screenshots/dimensions-fixed.png' });
  console.log({
    headingText: headingText.replace(/\s+/g, ' ').trim(),
    layerCount,
    videoCount,
    errors,
  });
  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
