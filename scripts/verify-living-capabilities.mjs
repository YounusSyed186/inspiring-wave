import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.resolve('qa/screenshots');
fs.mkdirSync(OUT_DIR, { recursive: true });

const URL = 'http://localhost:5173/';

async function waitPastPreloader(page) {
  await page.waitForSelector('#services', { timeout: 15000 });
  await page.waitForFunction(
    () => !document.querySelector('.site-preloader'),
    null,
    { timeout: 12000 },
  ).catch(() => {});
  await page.waitForTimeout(400);
}

async function run() {
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl'],
  });

  const results = [];

  // 1. Desktop 1440x900
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(e.message));

    await page.goto(URL, { waitUntil: 'networkidle' });
    await waitPastPreloader(page);

    // Scroll directly to #services section
    const servicesLoc = page.locator('#services');
    await servicesLoc.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const initialMetrics = await page.evaluate(() => {
      const el = document.getElementById('services');
      const rect = el.getBoundingClientRect();
      const title = el.querySelector('.lca-main-title');
      return {
        top: Math.round(rect.top),
        titleText: title ? title.textContent.trim() : null,
        activeService: el.querySelector('.lca-service-title')?.textContent.trim(),
        overflowX: document.documentElement.scrollWidth > window.innerWidth,
      };
    });

    // Check each service milestone
    const progressTargets = [
      { name: '01-strategy', scrollOffset: 300 },
      { name: '02-web', scrollOffset: 1200 },
      { name: '03-uiux', scrollOffset: 2000 },
      { name: '04-social', scrollOffset: 2800 },
      { name: '05-mobile', scrollOffset: 3600 },
      { name: '06-software', scrollOffset: 4400 },
      { name: '07-final', scrollOffset: 4900 },
    ];

    const milestones = [];
    const baseScroll = await page.evaluate(() => window.scrollY);

    for (const target of progressTargets) {
      await page.evaluate((y) => window.scrollTo(0, y), baseScroll + target.scrollOffset);
      await page.waitForTimeout(400);

      const state = await page.evaluate(() => {
        const activeNav = document.querySelector('.lca-nav-btn.is-active');
        const activeTitle = document.querySelector('.lca-service-title');
        const activeDot = document.querySelector('.lca-timeline-node.is-active');
        return {
          navText: activeNav ? activeNav.textContent.trim() : null,
          titleText: activeTitle ? activeTitle.textContent.trim() : null,
          activeNode: activeDot ? activeDot.textContent.trim() : null,
        };
      });

      milestones.push({ ...target, ...state });
      await page.screenshot({ path: path.join(OUT_DIR, `lca-1440-${target.name}.png`) });
    }

    // Test clicking navigation rail item (e.g. 02 Web Development)
    await page.evaluate(() => {
      const btn = document.querySelector('.lca-nav-btn:nth-child(2)') || document.querySelectorAll('.lca-nav-btn')[1];
      if (btn) btn.click();
    });
    await page.waitForTimeout(600);
    const navClickState = await page.evaluate(() => ({
      activeTitle: document.querySelector('.lca-service-title')?.textContent.trim(),
    }));

    results.push({ viewport: '1440x900', initialMetrics, milestones, navClickState, errors });
    await page.close();
  }

  // 2. Mobile 390x844
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(e.message));

    await page.goto(URL, { waitUntil: 'networkidle' });
    await waitPastPreloader(page);

    const servicesLoc = page.locator('#services');
    await servicesLoc.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const mobileMetrics = await page.evaluate(() => {
      const el = document.getElementById('services');
      return {
        activeService: el.querySelector('.lca-service-title')?.textContent.trim(),
        overflowX: document.documentElement.scrollWidth > window.innerWidth,
      };
    });

    await page.screenshot({ path: path.join(OUT_DIR, 'lca-mobile-390.png') });
    results.push({ viewport: '390x844', mobileMetrics, errors });
    await page.close();
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
