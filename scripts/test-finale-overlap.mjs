import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

// Scroll down to finale
await page.locator('.finale').scrollIntoViewIfNeeded();
await page.waitForTimeout(1000);

const info = await page.evaluate(() => {
  const cap = document.querySelector('.capabilities');
  const fin = document.querySelector('.finale');
  const journal = document.querySelector('.journal');
  const footer = document.querySelector('footer');
  
  return {
    cap: cap ? { zIndex: getComputedStyle(cap).zIndex, position: getComputedStyle(cap).position, rect: cap.getBoundingClientRect() } : null,
    fin: fin ? { zIndex: getComputedStyle(fin).zIndex, position: getComputedStyle(fin).position, rect: fin.getBoundingClientRect() } : null,
    journal: journal ? { zIndex: getComputedStyle(journal).zIndex, position: getComputedStyle(journal).position, rect: journal.getBoundingClientRect() } : null,
    footer: footer ? { zIndex: getComputedStyle(footer).zIndex, position: getComputedStyle(footer).position, rect: footer.getBoundingClientRect() } : null,
    elementFromPoint: document.elementFromPoint(700, 300)?.className,
  };
});

console.log('Inspection at Finale:', JSON.stringify(info, null, 2));
await page.screenshot({ path: 'qa/screenshots/finale-overlap-check.png' });
await browser.close();
