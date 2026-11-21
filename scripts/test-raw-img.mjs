import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  await page.goto('http://localhost:5173/assets/architecture.webp');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'qa/screenshots/raw-architecture.png' });
  console.log('Saved raw architecture screenshot');
  await browser.close();
}

run();
