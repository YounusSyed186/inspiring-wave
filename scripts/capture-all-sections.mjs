import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const browser = await chromium.launch({ channel: 'msedge', headless: true });

async function captureViewport(width, height, prefix) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto('http://localhost:5173/?nopreload=true', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // 1. Boundary between Section 3 (Work) and Section 4 (Services)
  await page.evaluate(() => {
    const el = document.querySelector('#services, .editorial-services-section');
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top - 320);
    }
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `qa/screenshots/${prefix}-03-boundary-work-services.png` });

  // 2. Section 4: Services
  const servicesEl = page.locator('#services, .editorial-services-section');
  if (await servicesEl.count() > 0) {
    await servicesEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `qa/screenshots/${prefix}-04-services.png` });
  }

  // 3. Section 5: Method
  const methodEl = page.locator('.method');
  if (await methodEl.count() > 0) {
    await methodEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `qa/screenshots/${prefix}-05-method.png` });
  }

  // 4. Section 6: Studio
  const studioEl = page.locator('#studio, .studio-redesign');
  if (await studioEl.count() > 0) {
    await studioEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `qa/screenshots/${prefix}-06-studio.png` });
  }

  // 5. Section 7: Dimensions
  const dimensionsEl = page.locator('#dimensions, .parallax-showcase');
  if (await dimensionsEl.count() > 0) {
    await dimensionsEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `qa/screenshots/${prefix}-07-dimensions.png` });
  }

  // 6. Section 8: Trust
  const trustEl = page.locator('#trust, .trust-redesign');
  if (await trustEl.count() > 0) {
    await trustEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `qa/screenshots/${prefix}-08-trust.png` });
  }

  // 7. Section 9: Perspectives
  const journalEl = page.locator('#journal, .perspectives-redesign');
  if (await journalEl.count() > 0) {
    await journalEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `qa/screenshots/${prefix}-09-perspectives.png` });
  }

  // 8. Section 10: Finale
  const finaleEl = page.locator('#contact-cta, .finale-redesign');
  if (await finaleEl.count() > 0) {
    await finaleEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `qa/screenshots/${prefix}-10-finale.png` });
  }

  // 9. Section 11: Footer
  const footerEl = page.locator('footer');
  if (await footerEl.count() > 0) {
    await footerEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `qa/screenshots/${prefix}-11-footer.png` });
  }

  await page.close();
}

console.log('Capturing Desktop 1440px...');
await captureViewport(1440, 900, 'desktop');

console.log('Capturing Tablet 768px...');
await captureViewport(768, 1024, 'tablet');

console.log('Capturing Mobile 390px...');
await captureViewport(390, 844, 'mobile-390');

console.log('Capturing Narrow Mobile 360px...');
await captureViewport(360, 780, 'mobile-360');

await browser.close();
console.log('All responsive screenshots captured successfully!');
