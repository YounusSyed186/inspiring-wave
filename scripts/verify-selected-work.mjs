import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  const work = page.locator('#work');
  await work.scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);

  const headingText = await page.locator('#work-heading').innerText();
  const initialStickerHud = await work.locator('text=/CLICK ANYWHERE TO SLAP A STICKER/').innerText();

  // Click on the stage background to slap a sticker
  const box = await work.boundingBox();
  if (box) {
    await page.mouse.click(box.x + 220, box.y + 240);
    await page.waitForTimeout(400);
  }

  const afterClickStickerHud = await work.locator('text=/CLICK ANYWHERE TO SLAP A STICKER/').innerText();
  const proofCards = await work.locator('text=/PROOF \\/\\//').count();

  await page.screenshot({ path: 'qa/screenshots/selected-work-artistic.png' });
  console.log({
    headingText: headingText.replace(/\s+/g, ' ').trim(),
    initialStickerHud,
    afterClickStickerHud,
    proofCards,
    errors,
  });
  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
