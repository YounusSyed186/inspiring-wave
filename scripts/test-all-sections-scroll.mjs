import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

console.log('Testing continuous wheel scrolling from top to bottom...');

let prevY = 0;
let stuckCount = 0;
const stalledPoints = [];

for (let i = 0; i < 40; i++) {
  await page.mouse.move(720, 500);
  await page.mouse.wheel(0, 450);
  await page.waitForTimeout(150);
  const curY = await page.evaluate(() => window.scrollY);
  if (curY <= prevY && curY < 15500) {
    stuckCount++;
    stalledPoints.push({ step: i, y: curY });
  }
  prevY = curY;
}

console.log('Final scrollY:', prevY);
console.log('Stalled points:', stalledPoints);

// Take screenshots of Method, Trust, Journal, Finale
await page.evaluate(() => {
  const trust = document.querySelector('.trust');
  if (trust) trust.scrollIntoView();
});
await page.waitForTimeout(500);
await page.screenshot({ path: 'qa/screenshots/verified-trust-scroll.png' });

await page.evaluate(() => {
  const journal = document.querySelector('.journal');
  if (journal) journal.scrollIntoView();
});
await page.waitForTimeout(500);
await page.screenshot({ path: 'qa/screenshots/verified-journal-scroll.png' });

await browser.close();
console.log('Full scroll verification complete.');
