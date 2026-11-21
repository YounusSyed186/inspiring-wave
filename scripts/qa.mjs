import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' });
const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(`console: ${msg.text()}`); });
page.on('pageerror', error => errors.push(`page: ${error.message}`));
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2300);
await page.locator('.work').scrollIntoViewIfNeeded();
await page.waitForTimeout(700);
const rail = page.locator('.work-viewport');
const railBeforeOutsideWheel = await rail.evaluate(el => el.scrollLeft);
await page.mouse.move(10, 10);
await page.mouse.wheel(0, 260);
await page.waitForTimeout(250);
const railAfterOutsideWheel = await rail.evaluate(el => el.scrollLeft);
await rail.hover();
const pageYBeforeRailWheel = await page.evaluate(() => scrollY);
await page.mouse.wheel(0, 420);
await page.waitForTimeout(250);
const pageYAfterRailWheel = await page.evaluate(() => scrollY);
const railAfterInsideWheel = await rail.evaluate(el => el.scrollLeft);
for (const [name, selector] of [['manifesto','.manifesto'],['work','.work'],['services','.capabilities'],['method','.method'],['studio','.studio'],['trust','.trust'],['journal','.journal'],['finale','.finale']]) {
  await page.locator(selector).scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  if (['manifesto','services','finale'].includes(name)) await page.screenshot({ path: `qa/screenshots/${name}-desktop.png` });
}
await page.evaluate(() => scrollTo(0, 0));
await page.waitForTimeout(1400);
await page.locator('.menu-button').click();
await page.waitForTimeout(750);
const menuOpen = await page.locator('.menu-overlay').evaluate(el => el.classList.contains('is-open'));
await page.screenshot({ path: 'qa/screenshots/menu-desktop.png' });
await page.keyboard.press('Escape');
await page.goto('http://localhost:5173/services/web-development', { waitUntil: 'networkidle' });
const routeTitle = (await page.locator('h1').first().innerText()).trim();
await page.locator('.detail-media').first().scrollIntoViewIfNeeded();
await page.waitForTimeout(500);
await page.screenshot({ path: 'qa/screenshots/detail-desktop.png' });
await page.goto('http://localhost:5173/contact', { waitUntil: 'networkidle' });
await page.locator('form button[type=submit]').click();
const validationVisible = await page.locator('.form-error').isVisible();
await page.screenshot({ path: 'qa/screenshots/contact-desktop.png' });

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
mobile.on('pageerror', error => errors.push(`mobile page: ${error.message}`));
await mobile.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await mobile.waitForTimeout(2300);
await mobile.locator('.capabilities').scrollIntoViewIfNeeded();
await mobile.waitForTimeout(450);
await mobile.locator('.service-row').nth(1).locator('button').click();
const serviceExpanded = await mobile.locator('.service-row').nth(1).locator('button').getAttribute('aria-expanded');
await mobile.screenshot({ path: 'qa/screenshots/services-mobile.png' });
const reduced = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
reduced.on('pageerror', error => errors.push(`reduced page: ${error.message}`));
await reduced.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await reduced.waitForTimeout(2300);
const reducedUsesLenis = await reduced.locator('html').evaluate(el => el.classList.contains('lenis-active'));
const reducedRevealVisible = await reduced.locator('.manifesto-copy').evaluate(el => getComputedStyle(el).opacity === '1');
await fs.writeFile('qa/results.json', JSON.stringify({
  menuOpen,
  routeTitle,
  validationVisible,
  serviceExpanded,
  railOnlyMovesWhenHovered: Math.abs(railAfterOutsideWheel - railBeforeOutsideWheel) < 2 && Math.abs(railAfterInsideWheel - railAfterOutsideWheel) > 100,
  railWheelKeepsPageInPlace: Math.abs(pageYAfterRailWheel - pageYBeforeRailWheel) < 4,
  reducedUsesLenis,
  reducedRevealVisible,
  errors,
}, null, 2));
await browser.close();
