import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

// Check body children before scroll
const initialBodyChildren = await page.$$eval('body > *', els => els.map(e => ({ tag: e.tagName, id: e.id, cls: e.className })));
console.log('Initial body children:', initialBodyChildren);

// Scroll down incrementally and inspect
let foundAfter9 = false;
for (let y = 0; y <= 18000; y += 1000) {
  await page.evaluate(y => scrollTo(0, y), y);
  await page.waitForTimeout(100);
}

await page.waitForTimeout(1000);

// Check body children after full scroll
const finalBodyChildren = await page.$$eval('body > *', els => els.map(e => ({ tag: e.tagName, id: e.id, cls: e.className })));
console.log('Final body children:', finalBodyChildren);

// Check if any element containing 'WEB DEVELOPMENT' is located after section 9 (.journal / .finale)
const positions = await page.evaluate(() => {
  const allServices = Array.from(document.querySelectorAll('*')).filter(el => el.textContent?.includes('WEB DEVELOPMENT') && el.tagName === 'SECTION');
  const journal = document.querySelector('.journal');
  const finale = document.querySelector('.finale');
  return {
    serviceCount: allServices.length,
    serviceTops: allServices.map(s => s.getBoundingClientRect().top + window.scrollY),
    journalTop: journal ? journal.getBoundingClientRect().top + window.scrollY : 0,
    finaleTop: finale ? finale.getBoundingClientRect().top + window.scrollY : 0,
    bodyAppended: Array.from(document.body.children).filter(c => c.id !== 'root' && c.tagName !== 'SCRIPT').map(c => c.className),
  };
});

console.log('Positions analysis:', positions);

// Also take a screenshot at y = 14000, 15000, 16000
await page.evaluate(() => scrollTo(0, 14000));
await page.screenshot({ path: 'qa/screenshots/scroll-14000.png' });
await page.evaluate(() => scrollTo(0, 15500));
await page.screenshot({ path: 'qa/screenshots/scroll-15500.png' });
await page.evaluate(() => scrollTo(0, 17000));
await page.screenshot({ path: 'qa/screenshots/scroll-17000.png' });

await browser.close();
