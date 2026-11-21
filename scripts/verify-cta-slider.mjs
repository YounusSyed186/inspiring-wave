import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  const ctaSlider = page.locator('.cta-slider-card');
  await ctaSlider.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  
  await ctaSlider.screenshot({ path: 'qa/screenshots/cta-slider-typography.png' });
  console.log('Saved qa/screenshots/cta-slider-typography.png');
  
  // Inspect computed styles
  const computed = await page.evaluate(() => {
    const lead = document.querySelector('.cta-slider-card h3 span:first-child');
    const accent = document.querySelector('.cta-slider-card h3 span:last-child');
    const quote = document.querySelector('.cta-slider-card blockquote');
    return {
      leadFont: lead ? window.getComputedStyle(lead).fontFamily : null,
      accentFont: accent ? window.getComputedStyle(accent).fontFamily : null,
      accentStyle: accent ? window.getComputedStyle(accent).fontStyle : null,
      quoteFont: quote ? window.getComputedStyle(quote).fontFamily : null,
      quoteStyle: quote ? window.getComputedStyle(quote).fontStyle : null,
    };
  });
  console.log('Computed styles:', computed);

  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
