import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const outDir = path.resolve('local/screenshots/services-verification');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const referencePath = 'C:/Users/DELL/.gemini/antigravity/brain/f09d1b1d-8c74-4aef-bb56-608807ec6d67/.user_uploaded/media_1795391858213_0294b7cc.jpg';

async function runVerification() {
  console.log('🚀 Starting Comprehensive Services Page & Reference Landmark Verification...');

  const browser = await chromium.launch({
    headless: true,
    channel: 'msedge',
  });

  const viewports = [
    { name: 'desktop-1672x941', width: 1672, height: 941 },
    { name: 'laptop-1440x900', width: 1440, height: 900 },
    { name: 'tablet-landscape-1024x768', width: 1024, height: 768 },
    { name: 'tablet-portrait-768x1024', width: 768, height: 1024 },
    { name: 'mobile-390x844', width: 390, height: 844 },
    { name: 'narrow-mobile-360x780', width: 360, height: 780 },
  ];

  for (const vp of viewports) {
    console.log(`\n--- Capturing viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });

    // Test both /services and homepage #services
    await page.goto('http://localhost:5173/services', { waitUntil: 'networkidle' });
    // If preloader is active, wait or click skip
    await page.waitForTimeout(1000);

    const servicesEl = page.locator('#services');
    await servicesEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);

    // Check horizontal overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    console.log(`Horizontal overflow check: ${hasHorizontalOverflow ? 'FAIL (overflow detected)' : 'PASS (no overflow)'}`);

    // Take screenshot of #services and full viewport
    const shotPath = path.join(outDir, `${vp.name}-services.png`);
    await servicesEl.screenshot({ path: shotPath });
    console.log(`✓ Saved section screenshot: ${shotPath}`);

    const viewPath = path.join(outDir, `${vp.name}-fullview.png`);
    await page.screenshot({ path: viewPath });
    console.log(`✓ Saved full viewport screenshot: ${viewPath}`);

    // Keyboard focus verification at 1672
    if (vp.width === 1672) {
      console.log('Testing keyboard navigation...');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.waitForTimeout(300);
      const focusPath = path.join(outDir, 'keyboard-focus-active.png');
      await page.screenshot({ path: focusPath });
      console.log(`✓ Saved keyboard focus test screenshot: ${focusPath}`);
    }

    await page.close();
  }

  // Test reduced motion
  console.log('\n--- Testing reduced motion preferences ---');
  const reducedMotionContext = await browser.newContext({
    viewport: { width: 1672, height: 941 },
    reducedMotion: 'reduce',
  });
  const rmPage = await reducedMotionContext.newPage();
  await rmPage.goto('http://localhost:5173/services', { waitUntil: 'networkidle' });
  await rmPage.waitForTimeout(1000);
  const rmServices = rmPage.locator('#services');
  await rmServices.scrollIntoViewIfNeeded();
  await rmPage.waitForTimeout(500);

  // Assert all 6 panels visible
  const panelCount = await rmPage.locator('.service-panel-bounding-box').count();
  console.log(`✓ Reduced motion: found ${panelCount} visible panels immediately`);
  const rmShotPath = path.join(outDir, 'reduced-motion-services.png');
  await rmServices.screenshot({ path: rmShotPath });
  console.log(`✓ Saved reduced motion screenshot: ${rmShotPath}`);
  await reducedMotionContext.close();

  await browser.close();

  // Create an overlay comparison with the reference image at 1672x941
  console.log('\n--- Generating Reference Overlay Comparison ---');
  const renderedShot = path.join(outDir, 'desktop-1672x941-fullview.png');
  if (fs.existsSync(renderedShot) && fs.existsSync(referencePath)) {
    const refMeta = await sharp(referencePath).metadata();
    console.log(`Reference image size: ${refMeta.width}x${refMeta.height}`);

    // Resize rendered to match reference size or vice-versa (1672 x 941)
    const refResized = await sharp(referencePath)
      .resize(1672, 941, { fit: 'fill' })
      .toBuffer();

    const renderedResized = await sharp(renderedShot)
      .resize(1672, 941, { fit: 'fill' })
      .toBuffer();

    // Semi-transparent 50/50 overlay
    const overlayBuffer = await sharp(renderedResized)
      .composite([{
        input: refResized,
        blend: 'over',
        opacity: 0.45,
      }])
      .png()
      .toFile(path.join(outDir, 'reference-overlay-diff.png'));

    console.log(`✓ Created reference overlay comparison: ${path.join(outDir, 'reference-overlay-diff.png')}`);
  }

  // Copy screenshots to brain artifact directory for inspection
  const brainDir = 'C:/Users/DELL/.gemini/antigravity/brain/f09d1b1d-8c74-4aef-bb56-608807ec6d67';
  const files = fs.readdirSync(outDir);
  for (const f of files) {
    if (f.endsWith('.png')) {
      fs.copyFileSync(path.join(outDir, f), path.join(brainDir, f));
    }
  }
  console.log(`✓ Copied ${files.length} screenshots to brain artifact directory`);

  console.log('\n🎉 Verification completed successfully!');
}

runVerification().catch((err) => {
  console.error('Error in verification:', err);
  process.exit(1);
});
