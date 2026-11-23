import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto('http://localhost:5173/?nopreload=true', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// Scroll to boundary between work and services
const work = page.locator('#work');
const services = page.locator('#services, .editorial-services-section');

const workBox = await work.boundingBox();
const servicesBox = await services.boundingBox();

console.log('Work box:', workBox);
console.log('Services box:', servicesBox);

// Position so the bottom of work and top of services are in view
await page.evaluate(() => {
  const el = document.querySelector('#services, .editorial-services-section');
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top - 350);
  }
});

await page.waitForTimeout(600);
await page.screenshot({ path: 'qa/screenshots/boundary-03-work-to-services.png' });

await page.evaluate(() => {
  const el = document.querySelector('.method');
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top - 350);
  }
});

await page.waitForTimeout(600);
await page.screenshot({ path: 'qa/screenshots/boundary-04-services-to-method.png' });


await browser.close();
