import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  const manifesto = page.locator('#manifesto');
  await manifesto.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);

  // Measure frame times while scrolling through #manifesto tear
  const perf = await page.evaluate(async () => {
    const el = document.querySelector('#manifesto');
    const startY = el.getBoundingClientRect().top + window.scrollY;
    const deltas = [];
    let last = performance.now();
    for (let i = 0; i <= 24; i++) {
      window.scrollTo(0, startY + i * 50);
      await new Promise(r => requestAnimationFrame(now => {
        deltas.push(now - last);
        last = now;
        r();
      }));
    }
    const avgMs = deltas.reduce((a, b) => a + b, 0) / deltas.length;
    const svgFilters = el.querySelectorAll('filter').length;
    return { avgFrameMs: Number(avgMs.toFixed(2)), svgFilters };
  });

  await page.screenshot({ path: 'qa/screenshots/manifesto-fast.png' });
  console.log({ ...perf, errors });
  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
