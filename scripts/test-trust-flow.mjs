import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

// Jump to Trust section
console.log('Jumping to y = 12500 (Trust)...');
await page.evaluate(() => scrollTo(0, 12500));
await page.waitForTimeout(500);

const trace = [];
for (let i = 0; i < 25; i++) {
  // Wheel at x=100, y=500
  await page.mouse.move(100, 500);
  await page.mouse.wheel(0, 200);
  await page.waitForTimeout(100);
  const curY = await page.evaluate(() => window.scrollY);
  trace.push({ step: i, y: curY });
}

console.table(trace);
await browser.close();
