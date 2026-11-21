import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

const sections = await page.$$eval('section', els =>
  els.map((el, i) => ({
    index: i,
    className: el.className,
    top: el.getBoundingClientRect().top + window.scrollY,
    height: el.getBoundingClientRect().height,
    marker: el.querySelector('.marker')?.innerText?.trim() || '',
    heading: el.querySelector('h1, h2')?.innerText?.trim()?.replace(/\n/g, ' ') || '',
  }))
);

console.log('SECTIONS ON PAGE:');
console.table(sections);
await browser.close();
