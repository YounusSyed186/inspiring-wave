import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

// Scroll down through Method section
console.log('Scrolling through Method...');
await page.evaluate(() => scrollTo(0, 4200));
await page.waitForTimeout(400);

await page.evaluate(() => scrollTo(0, 5200));
await page.waitForTimeout(400);
await page.screenshot({ path: 'qa/screenshots/method-scroll-5200.png' });

await page.evaluate(() => scrollTo(0, 6200));
await page.waitForTimeout(400);
await page.screenshot({ path: 'qa/screenshots/method-scroll-6200.png' });

// Scroll past 04 DEVELOP and 05 DELIVER into Studio
await page.evaluate(() => scrollTo(0, 6700));
await page.waitForTimeout(400);
await page.screenshot({ path: 'qa/screenshots/method-scroll-6700.png' });

await page.evaluate(() => scrollTo(0, 7400));
await page.waitForTimeout(400);
await page.screenshot({ path: 'qa/screenshots/method-scroll-7400-studio.png' });

const bodyClones = await page.$$eval('.stack-scene-clone', els => els.length);
console.log('Number of .stack-scene-clone on page:', bodyClones);

const objPos = await page.evaluate(() => {
  const obj = document.querySelector('.method-object');
  return obj ? getComputedStyle(obj).position : null;
});
console.log('Method object position:', objPos);

await browser.close();
console.log('Test completed successfully.');
