import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

await page.locator('.capabilities').scrollIntoViewIfNeeded();
await page.waitForTimeout(1000);
await page.screenshot({ path: 'qa/screenshots/capabilities-check.png' });

await browser.close();
console.log('Saved capabilities-check.png');
