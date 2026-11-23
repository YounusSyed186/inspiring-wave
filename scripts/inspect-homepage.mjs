import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:5173/?nopreload=true', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

const sections = await page.evaluate(() => {
  const list = [];
  const mainChildren = Array.from(document.querySelectorAll('main#main > *'));
  mainChildren.forEach((el, i) => {
    const rect = el.getBoundingClientRect();
    const heading = el.querySelector('h1, h2, h3, [role=heading]')?.innerText?.replace(/\n+/g, ' ') || '';
    const marker = el.querySelector('.marker, [class*=marker]')?.innerText?.replace(/\n+/g, ' ') || '';
    list.push({
      index: i,
      tagName: el.tagName,
      id: el.id,
      className: typeof el.className === 'string' ? el.className.slice(0, 50) : '',
      heading: heading.slice(0, 80),
      marker: marker.slice(0, 50),
      top: Math.round(rect.top + window.scrollY),
      height: Math.round(rect.height),
    });
  });
  const footer = document.querySelector('footer');
  if (footer) {
    const rect = footer.getBoundingClientRect();
    list.push({
      index: list.length,
      tagName: 'FOOTER',
      id: footer.id,
      className: typeof footer.className === 'string' ? footer.className.slice(0, 50) : '',
      heading: 'Footer',
      marker: '',
      top: Math.round(rect.top + window.scrollY),
      height: Math.round(rect.height),
    });
  }
  return list;
});

console.log('Homepage Sections on http://localhost:5173:');
console.table(sections);

await browser.close();
