import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

// Scroll to trust section
console.log('Scrolling to Trust section (y = 12500)...');
await page.evaluate(() => scrollTo(0, 12500));
await page.waitForTimeout(500);

const scrollPositions = [];
for (let i = 0; i < 20; i++) {
  // Simulate mouse wheel down
  await page.mouse.move(720, 500);
  await page.mouse.wheel(0, 150);
  await page.waitForTimeout(100);
  const curY = await page.evaluate(() => window.scrollY);
  const elementAtCenter = await page.evaluate(() => document.elementFromPoint(720, 500)?.className);
  scrollPositions.push({ step: i, y: curY, element: elementAtCenter });
}

console.log('Scroll positions during wheeling:');
console.table(scrollPositions);

await page.screenshot({ path: 'qa/screenshots/trust-scroll-test.png' });

await browser.close();
