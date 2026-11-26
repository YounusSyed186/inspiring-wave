import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4173';
const checkpoints = [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1];
await fs.mkdir('qa/services-scroll', { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
await page.goto(`${baseURL}/?nopreload`, { waitUntil: 'networkidle' });

const geometry = await page.evaluate(() => {
  const track = document.querySelector('.iw-services-scroll-track');
  const stage = document.querySelector('.iw-services-scene');
  if (!(track instanceof HTMLElement) || !(stage instanceof HTMLElement)) throw new Error('Services track or stage missing');
  const top = track.getBoundingClientRect().top + window.scrollY;
  return { top, trackHeight: track.offsetHeight, stageHeight: stage.offsetHeight, distance: track.offsetHeight - stage.offsetHeight };
});
if (geometry.distance <= 0 || geometry.trackHeight < geometry.stageHeight * 4.4) throw new Error(`Invalid sticky geometry: ${JSON.stringify(geometry)}`);

async function seek(progress, settle = 1100) {
  await page.evaluate(({ top, distance, progress }) => window.scrollTo(0, top + distance * progress), { top: geometry.top, distance: geometry.distance, progress });
  await page.waitForTimeout(settle);
}

const states = [];
for (const checkpoint of checkpoints) {
  await seek(checkpoint);
  const state = await page.evaluate(() => {
    const stage = document.querySelector('.iw-services-scene');
    const canvas = document.querySelector('.iw-three-canvas');
    const installs = [...document.querySelectorAll('.iw-installation')];
    return {
      progress: Number(stage?.getAttribute('data-progress')),
      animationStage: stage?.getAttribute('data-animation-stage'),
      visible: installs.filter((node) => Number(getComputedStyle(node).opacity) > 0.08).length,
      transforms: installs.map((node) => getComputedStyle(node).transform),
      canvas: canvas instanceof HTMLCanvasElement ? { rendering: canvas.dataset.rendering, progress: Number(canvas.dataset.progress), camera: canvas.dataset.camera, drawCalls: Number(canvas.dataset.drawCalls), triangles: Number(canvas.dataset.triangles) } : null,
    };
  });
  if (Math.abs(state.progress - checkpoint) > 0.035) throw new Error(`Progress mismatch at ${checkpoint}: ${state.progress}`);
  if (!state.canvas || state.canvas.rendering !== 'true') throw new Error(`WebGL did not render at ${checkpoint}`);
  states.push(state);
  await page.screenshot({ path: `qa/services-scroll/${String(Math.round(checkpoint * 100)).padStart(3, '0')}.png` });
}

await seek(0);
const reverseStart = await page.locator('.iw-installation').first().evaluate((node) => getComputedStyle(node).transform);
await seek(1, 80);
await seek(0.3, 80);
await seek(0, 450);
const reverseEnd = await page.locator('.iw-installation').first().evaluate((node) => getComputedStyle(node).transform);
if (reverseStart !== reverseEnd) throw new Error('Reverse scrolling did not reconstruct the initial transform');

await page.setViewportSize({ width: 1280, height: 800 });
await page.waitForTimeout(500);
const resizedDistance = await page.locator('.iw-services-scroll-track').evaluate((track) => track.offsetHeight - document.querySelector('.iw-services-scene').offsetHeight);
if (resizedDistance <= 0) throw new Error('Scroll distance collapsed after resize');

const firstHref = await page.locator('#services .iw-installation').first().getAttribute('href');
await page.goto(`${baseURL}${firstHref}`, { waitUntil: 'networkidle' });
if (new URL(page.url()).pathname !== firstHref) throw new Error('Service navigation failed');
await page.goBack({ waitUntil: 'networkidle' });

for (const config of [
  { name: 'mobile', viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' },
  { name: 'reduced', viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' },
]) {
  const fallback = await browser.newContext({ viewport: config.viewport, reducedMotion: config.reducedMotion });
  const fallbackPage = await fallback.newPage();
  await fallbackPage.goto(`${baseURL}/?nopreload`, { waitUntil: 'networkidle' });
  const result = await fallbackPage.evaluate(() => ({
    trackHeight: document.querySelector('.iw-services-scroll-track')?.getBoundingClientRect().height,
    stageHeight: document.querySelector('.iw-services-scene')?.getBoundingClientRect().height,
    canvasDisplay: (() => {
      const canvas = document.querySelector('.iw-three-canvas');
      return canvas instanceof HTMLCanvasElement ? getComputedStyle(canvas).display : 'not-mounted';
    })(),
    links: document.querySelectorAll('#services .iw-installation').length,
  }));
  if (result.links !== 6 || !['none', 'not-mounted'].includes(result.canvasDisplay) || Math.abs(result.trackHeight - result.stageHeight) > 2) throw new Error(`${config.name} fallback invalid: ${JSON.stringify(result)}`);
  await fallback.close();
}

await browser.close();
console.log(JSON.stringify({ geometry, checkpoints: states.map(({ transforms, ...state }) => state), reverseDeterministic: reverseStart === reverseEnd, resizedDistance, errors }, null, 2));
if (errors.length) process.exitCode = 1;
