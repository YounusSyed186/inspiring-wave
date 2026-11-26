import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4173';
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];
const expected = ['digital-strategy', 'web-development', 'ui-ux-design', 'social-media', 'mobile-app-development', 'software-development'];
await fs.mkdir('qa/services', { recursive: true });
const browser = await chromium.launch({ headless: true });
let failures = 0;

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${baseURL}/?nopreload`, { waitUntil: 'networkidle' });
  const section = page.locator('#services');
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  const hrefs = await section.locator('.iw-installation').evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  const expectedHrefs = expected.map((slug) => `/services/${slug}`);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  const titlesVisible = await section.locator('.iw-installation h3').evaluateAll((titles) => titles.every((title) => {
    const rect = title.getBoundingClientRect();
    const style = getComputedStyle(title);
    return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.opacity !== '0';
  }));
  if (JSON.stringify(hrefs) !== JSON.stringify(expectedHrefs) || overflow || !titlesVisible || errors.length) failures++;
  await section.screenshot({ path: `qa/services/${viewport.name}.png` });
  console.log(JSON.stringify({ viewport: viewport.name, links: hrefs.length, routesCorrect: JSON.stringify(hrefs) === JSON.stringify(expectedHrefs), overflow, titlesVisible, errors }));
  await context.close();
}

const reduced = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const reducedPage = await reduced.newPage();
await reducedPage.goto(`${baseURL}/?nopreload`, { waitUntil: 'networkidle' });
const reducedMinHeight = await reducedPage.locator('#services').evaluate((node) => getComputedStyle(node).minHeight);
console.log(JSON.stringify({ reducedMotionMinHeight: reducedMinHeight }));
await reduced.close();
await browser.close();
if (failures) process.exitCode = 1;
