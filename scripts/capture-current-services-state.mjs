import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const outDir = path.resolve('local/screenshots/services-test');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  
  // 1. Desktop 1672x941 on /services
  const page1 = await browser.newPage({ viewport: { width: 1672, height: 941 } });
  await page1.goto('http://localhost:5173/services', { waitUntil: 'networkidle' });
  await page1.waitForTimeout(1000);
  const shot1 = path.join(outDir, 'desktop-1672-services.png');
  await page1.screenshot({ path: shot1 });
  console.log('✓ Captured desktop /services:', shot1);
  await page1.close();

  // 2. Mobile 390x844 on /services
  const page2 = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page2.goto('http://localhost:5173/services', { waitUntil: 'networkidle' });
  await page2.waitForTimeout(1000);
  const shot2 = path.join(outDir, 'mobile-390-services.png');
  await page2.screenshot({ path: shot2, fullPage: true });
  console.log('✓ Captured mobile /services:', shot2);
  await page2.close();

  await browser.close();
}

run().catch(console.error);
