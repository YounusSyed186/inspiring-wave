import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.resolve('qa/screenshots');
fs.mkdirSync(OUT_DIR, { recursive: true });

const URL = 'http://localhost:5173/';

async function waitPastPreloader(page) {
  await page.waitForSelector('#hero-title', { timeout: 15000 });
  // Wait for TypeRemixPreloader (7s) or skip if reduced motion
  await page.waitForFunction(
    () => !document.querySelector('.site-preloader'),
    null,
    { timeout: 12000 },
  ).catch(() => {});
  await page.waitForTimeout(350);
}

async function run() {
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl'],
  });

  const results = [];

  // 1. Desktop 1440x900: capture all 7 checkpoints (0, 20, 45, 60, 75, 90, 100%)
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(e.message));

    await page.goto(URL, { waitUntil: 'networkidle' });
    await waitPastPreloader(page);

    const metrics = await page.evaluate(() => {
      const hero = document.querySelector('.creative-machine-hero');
      const spacer = hero?.parentElement;
      const canvas = document.querySelector('.cm-canvas');
      const title = document.querySelector('#hero-title');
      return {
        pinDistance: spacer ? spacer.getBoundingClientRect().height - window.innerHeight : 0,
        canvasW: canvas?.width || 0,
        canvasH: canvas?.height || 0,
        hasTitle: !!title,
        overflowX: document.documentElement.scrollWidth > window.innerWidth,
      };
    });

    const checkpoints = [0, 0.2, 0.45, 0.6, 0.75, 0.9, 1.0];
    const stageStats = [];
    for (const p of checkpoints) {
      const targetY = Math.round(metrics.pinDistance * p);
      await page.evaluate((y) => window.scrollTo(0, y), targetY);
      await page.waitForTimeout(450);
      const stat = await page.evaluate(() => {
        const hl = document.querySelector('.cm-headline-wrap');
        const cw = document.querySelector('.cm-canvas-wrap');
        const man = document.querySelector('#manifesto');
        return {
          headlineOpacity: hl ? getComputedStyle(hl).opacity : null,
          canvasOpacity: cw ? getComputedStyle(cw).opacity : null,
          manifestoTop: man ? Math.round(man.getBoundingClientRect().top) : null,
        };
      });
      stageStats.push({ p, ...stat });
      await page.screenshot({ path: path.join(OUT_DIR, `cm-1440-p${Math.round(p * 100)}.png`) });
    }

    // Reverse scroll back to 0%
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(550);
    const reversed = await page.evaluate(() => ({
      headlineOpacity: getComputedStyle(document.querySelector('.cm-headline-wrap')).opacity,
      canvasOpacity: getComputedStyle(document.querySelector('.cm-canvas-wrap')).opacity,
    }));

    // Continue scrolling past 100% into #manifesto and #work
    await page.evaluate((d) => window.scrollTo(0, d + 700), metrics.pinDistance);
    await page.waitForTimeout(450);
    const pastManifesto = await page.evaluate(() => ({
      scrollY: window.scrollY,
      manifestoTop: Math.round(document.querySelector('#manifesto').getBoundingClientRect().top),
    }));

    results.push({ viewport: '1440x900', metrics, stageStats, reversed, pastManifesto, errors });
    await page.close();
  }

  // 2. Other required viewports
  const viewports = [
    [1920, 1080],
    [1366, 768],
    [768, 1024],
    [390, 844],
    [375, 667],
  ];

  for (const [width, height] of viewports) {
    const page = await browser.newPage({ viewport: { width, height } });
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(e.message));

    await page.goto(URL, { waitUntil: 'networkidle' });
    await waitPastPreloader(page);

    const check = await page.evaluate(() => {
      const hero = document.querySelector('.creative-machine-hero');
      const title = document.querySelector('#hero-title');
      const cta = document.querySelector('.cm-cta-primary');
      return {
        overflowX: document.documentElement.scrollWidth > window.innerWidth,
        titleRect: title ? title.getBoundingClientRect().toJSON() : null,
        ctaRect: cta ? cta.getBoundingClientRect().toJSON() : null,
        heroH: hero ? Math.round(hero.getBoundingClientRect().height) : 0,
      };
    });
    await page.screenshot({ path: path.join(OUT_DIR, `cm-${width}x${height}-p0.png`) });
    results.push({ viewport: `${width}x${height}`, check, errors });
    await page.close();
  }

  // 3. Reduced motion test
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(e.message));

    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    const reduced = await page.evaluate(() => {
      const hero = document.querySelector('.creative-machine-hero');
      const man = document.querySelector('#manifesto');
      return {
        pinned: hero?.parentElement?.classList.contains('pin-spacer') || false,
        manifestoTop: man ? Math.round(man.getBoundingClientRect().top) : null,
      };
    });
    results.push({ viewport: '1440x900-reduced-motion', reduced, errors });
    await context.close();
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
