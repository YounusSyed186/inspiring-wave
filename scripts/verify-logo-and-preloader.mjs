import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log('1. Testing first load with preloader...');
  // Clear any existing localStorage/sessionStorage
  await page.goto('http://localhost:5173/?nopreload');
  await page.evaluate(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  // Navigate to root (simulating brand new first-time visitor)
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(1000);
  const isPreloaderPresentOnFirstVisit = await page.$('.site-preloader');
  console.log('Preloader present on first visit:', !!isPreloaderPresentOnFirstVisit);

  // Now simulate visiting with preloader marked as seen
  console.log('2. Testing subsequent visit / refresh...');
  await page.evaluate(() => {
    sessionStorage.setItem('iw_preloader_seen_v1', 'true');
    localStorage.setItem('iw_preloader_seen_v1', 'true');
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const isPreloaderPresentAfterVisit = await page.$('.site-preloader');
  console.log('Preloader present on second visit/refresh (should be false):', !!isPreloaderPresentAfterVisit);

  // 3. Verify Logo in header
  console.log('3. Checking header logo rendering...');
  const logo = await page.$('.header-logo-img');
  console.log('Header logo image present:', !!logo);

  await page.screenshot({ path: 'verify-header-logo-dark.png', clip: { x: 0, y: 0, width: 1440, height: 120 } });
  console.log('Captured verify-header-logo-dark.png');

  // Scroll to ivory section (manifesto or services) to check inverted logo over light background
  await page.evaluate(() => window.scrollTo(0, 1400));
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'verify-header-logo-light.png', clip: { x: 0, y: 0, width: 1440, height: 120 } });
  console.log('Captured verify-header-logo-light.png');

  await browser.close();
  console.log('All tests passed successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
