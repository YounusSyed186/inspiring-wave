import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:5173/?nopreload ...');
  await page.goto('http://localhost:5173/?nopreload', { waitUntil: 'networkidle' });

  // Wait for preloader if active
  await page.waitForTimeout(2000);

  // Check sections in view
  const sections = [
    { name: '03-work', selector: '#work' },
    { name: '04-services', selector: '#services' },
    { name: '05-method', selector: '#method' },
    { name: '06-studio', selector: '#studio' },
    { name: '07-dimensions', selector: '#dimensions' },
    { name: '08-trust', selector: '#trust' },
    { name: '09-perspectives', selector: '#journal' },
    { name: '10-finale', selector: '#contact-cta' },
    { name: '11-footer', selector: 'footer' }
  ];

  for (const s of sections) {
    const el = await page.$(s.selector);
    if (el) {
      console.log(`Scrolling to ${s.name} (${s.selector})...`);
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(800); // let spring animation settle
      await page.screenshot({
        path: `verify-${s.name}.png`,
        fullPage: false
      });
      console.log(`Captured verify-${s.name}.png`);
    } else {
      console.log(`Selector ${s.selector} not found!`);
    }
  }

  // Also verify mobile viewport
  console.log('Testing mobile viewport 390x844...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1000);

  for (const s of [sections[1], sections[2], sections[7], sections[8]]) {
    const el = await page.$(s.selector);
    if (el) {
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);
      await page.screenshot({
        path: `verify-mobile-${s.name}.png`,
        fullPage: false
      });
      console.log(`Captured verify-mobile-${s.name}.png`);
    }
  }

  await browser.close();
  console.log('Verification run finished successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
