import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(`Console Error: ${msg.text()}`); });
page.on('pageerror', err => errors.push(`Page Error: ${err.message}`));

console.log('Testing 1: Approved opening and first load...');
await page.goto('http://localhost:5173/?nopreload=true', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);

// Check hero, manifesto, work
const hero = await page.locator('.hero, .creative-machine-section, #manifesto').first().isVisible();
console.log('Hero / Manifesto visible:', hero);

console.log('Testing 2: Boundary between section 3 and 4...');
const work = await page.locator('#work').isVisible();
const services = await page.locator('#services').isVisible();
console.log('Work visible:', work, 'Services visible:', services);

console.log('Testing 3: Lower sections presence...');
const method = await page.locator('#method').isVisible();
const studio = await page.locator('#studio').isVisible();
const dimensions = await page.locator('#dimensions').isVisible();
const trust = await page.locator('#trust').isVisible();
const journal = await page.locator('#journal').isVisible();
const finale = await page.locator('#contact-cta').isVisible();
const footer = await page.locator('footer').isVisible();

console.log({ method, studio, dimensions, trust, journal, finale, footer });

console.log('Testing 4: Interaction on Trust section (switching testimonials)...');
const trustBtns = page.locator('#trust button');
const btnCount = await trustBtns.count();
console.log('Trust buttons count:', btnCount);
if (btnCount > 1) {
  await trustBtns.nth(1).click();
  await page.waitForTimeout(300);
}

console.log('Testing 5: Interaction on Finale tracks...');
const trackBtns = page.locator('#contact-cta button');
const trackCount = await trackBtns.count();
console.log('Finale track buttons:', trackCount);
if (trackCount > 1) {
  await trackBtns.nth(1).click();
  await page.waitForTimeout(300);
}

console.log('Testing 6: Navigation links verification...');
const studioLink = await page.locator('a[href="/about"]').first().isVisible();
const contactLink = await page.locator('a[href="/contact"]').first().isVisible();
console.log('Studio link:', studioLink, 'Contact link:', contactLink);

console.log('Errors caught during full page run:', errors);

await browser.close();
console.log('Verification script completed!');
