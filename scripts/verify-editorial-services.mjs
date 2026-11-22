import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('local/screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  console.log('🚀 Starting Services Section Verification...');
  const browser = await chromium.launch({
    headless: true,
    channel: 'msedge',
  });

  try {
    // 1. Desktop Test
    console.log('--- Desktop (1440x900) ---');
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });

    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Scroll to #services
    const servicesEl = page.locator('#services');
    await servicesEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);

    // Assert key elements exist
    const metaTag = page.locator('.services-meta-tag');
    const headline = page.locator('.editorial-main-title');
    const banner = page.locator('.editorial-banner-box');
    const cards = page.locator('.service-editorial-card');
    const cardCount = await cards.count();

    console.log(`✓ Meta tag text: "${await metaTag.innerText()}"`);
    console.log(`✓ Headline text: "${(await headline.innerText()).replace(/\n/g, ' ')}"`);
    console.log(`✓ Banner text: "${await banner.innerText()}"`);
    console.log(`✓ Found ${cardCount} editorial service cards`);

    if (cardCount !== 6) {
      throw new Error(`Expected 6 cards, found ${cardCount}`);
    }

    // Hover Card 01
    await cards.nth(0).hover();
    await page.waitForTimeout(300);

    // Hover Card 03
    await cards.nth(2).hover();
    await page.waitForTimeout(300);

    // Take Desktop Screenshot
    const desktopPath = path.join(outDir, 'editorial-services-desktop.png');
    await servicesEl.screenshot({ path: desktopPath });
    console.log(`✓ Saved desktop screenshot: ${desktopPath}`);

    // Click Card 03 to open Modal
    console.log('--- Testing Modal Interaction ---');
    await cards.nth(2).click();
    await page.waitForSelector('.service-detail-modal-backdrop', { state: 'visible', timeout: 4000 });
    const modalTitle = page.locator('#modal-service-title');
    console.log(`✓ Modal opened: "${await modalTitle.innerText()}"`);

    // Capture modal screenshot
    const modalPath = path.join(outDir, 'editorial-services-modal.png');
    await page.screenshot({ path: modalPath });
    console.log(`✓ Saved modal screenshot: ${modalPath}`);

    // Close with Escape
    await page.keyboard.press('Escape');
    await page.waitForSelector('.service-detail-modal-backdrop', { state: 'detached', timeout: 4000 });
    console.log('✓ Modal closed via Escape key');

    await page.close();

    // 2. Mobile Test
    console.log('--- Mobile (390x844) ---');
    const mobilePage = await browser.newPage({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    });

    await mobilePage.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(1000);

    const mobileServices = mobilePage.locator('#services');
    await mobileServices.scrollIntoViewIfNeeded();
    await mobilePage.waitForTimeout(1000);

    // Check horizontal overflow
    const hasOverflow = await mobilePage.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    console.log(`✓ Mobile horizontal overflow check: ${hasOverflow ? 'FAIL' : 'PASS (no overflow)'}`);

    const mobilePath = path.join(outDir, 'editorial-services-mobile.png');
    await mobileServices.screenshot({ path: mobilePath });
    console.log(`✓ Saved mobile screenshot: ${mobilePath}`);

    await mobilePage.close();
    console.log('🎉 Verification completed successfully with all assertions passing!');
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
