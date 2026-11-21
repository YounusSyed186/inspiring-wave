import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  
  // Desktop
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  
  const footerWord = page.locator('.footer-word');
  const box = await footerWord.boundingBox();
  console.log('Desktop .footer-word box:', box);
  
  const footer = page.locator('footer');
  await footer.screenshot({ path: 'qa/screenshots/footer-desktop.png' });
  console.log('Saved qa/screenshots/footer-desktop.png');
  
  // Mobile
  const mobilePage = await browser.newPage({ viewport: { width: 480, height: 850 } });
  await mobilePage.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await mobilePage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await mobilePage.waitForTimeout(1000);
  
  const mobileFooter = mobilePage.locator('footer');
  const mobileWord = mobilePage.locator('.footer-word');
  const mobileBox = await mobileWord.boundingBox();
  console.log('Mobile .footer-word box:', mobileBox);
  
  await mobileFooter.screenshot({ path: 'qa/screenshots/footer-mobile.png' });
  console.log('Saved qa/screenshots/footer-mobile.png');

  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

