import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.resolve('qa/screenshots');
fs.mkdirSync(OUT_DIR, { recursive: true });

async function run() {
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl'],
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForSelector('#hero-title', { timeout: 15000 });
  // Wait for preloader to clear
  await page.waitForFunction(() => !document.querySelector('.site-preloader'), null, { timeout: 12000 }).catch(() => {});
  await page.waitForTimeout(400);

  const metrics = await page.evaluate(() => {
    const hero = document.querySelector('.creative-machine-hero');
    const spacer = hero?.parentElement;
    return {
      pinDistance: spacer ? spacer.getBoundingClientRect().height - window.innerHeight : 3420,
    };
  });

  const stages = [0.65, 0.75, 0.82, 0.88, 0.95, 1.0];
  const results = [];

  for (const p of stages) {
    const targetY = Math.round(metrics.pinDistance * p);
    await page.evaluate((y) => window.scrollTo(0, y), targetY);
    await page.waitForTimeout(400);

    const stat = await page.evaluate(() => {
      const card = document.querySelector('.cm-manifesto-card');
      const curtain = document.querySelector('.cm-tear-stage');
      const topFlap = document.querySelector('.cm-tear-flap--top');
      const bottomFlap = document.querySelector('.cm-tear-flap--bottom');
      const man = document.querySelector('#manifesto');
      return {
        cardOpacity: card ? getComputedStyle(card).opacity : null,
        curtainDisplay: curtain ? getComputedStyle(curtain).display : null,
        curtainOpacity: curtain ? getComputedStyle(curtain).opacity : null,
        topFlapTransform: topFlap ? topFlap.style.transform : null,
        bottomFlapTransform: bottomFlap ? bottomFlap.style.transform : null,
        manifestoTop: man ? Math.round(man.getBoundingClientRect().top) : null,
      };
    });

    results.push({ p, ...stat });
    const filename = `paper-tear-p${Math.round(p * 100)}.png`;
    await page.screenshot({ path: path.join(OUT_DIR, filename) });
  }

  // Scroll forward past hero into manifesto
  await page.evaluate((d) => window.scrollTo(0, d + 600), metrics.pinDistance);
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT_DIR, 'manifesto-live-section.png') });

  await browser.close();
  console.log(JSON.stringify({ results, errors }, null, 2));
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
