import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.resolve('qa/screenshots');
fs.mkdirSync(OUT_DIR, { recursive: true });

const URL = 'http://localhost:5173/?skip-preloader=1';

async function waitPastPreloader(page) {
  await page.waitForSelector('#services', { timeout: 15000 });
  await page.waitForTimeout(600);
}

async function scrollToPosition(page, targetY) {
  await page.evaluate((y) => {
    const lenis = window.__lenis;
    if (lenis) {
      lenis.scrollTo(y, { immediate: true });
    } else {
      window.scrollTo(0, y);
    }
  }, targetY);
  await page.waitForTimeout(450);
}

async function run() {
  console.log('🚀 Starting Living Capabilities verification...');
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--no-sandbox'],
  });

  const summary = {
    desktopStations: [],
    navClickTest: false,
    mobileOk: false,
    errors: [],
  };

  try {
    // 1. Desktop test (1440x900)
    console.log('Testing Desktop 1440x900...');
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.on('console', (m) => {
      if (m.type() === 'error') {
        console.error('Browser error:', m.text());
        summary.errors.push(m.text());
      }
    });
    page.on('pageerror', (e) => {
      console.error('Page error:', e.message);
      summary.errors.push(e.message);
    });

    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    await waitPastPreloader(page);

    // Check trigger bounds directly from ScrollTrigger
    const triggerInfo = await page.evaluate(() => {
      const st = window.ScrollTrigger ? window.ScrollTrigger.getById('lc-trigger') : null;
      const el = document.querySelector('#services');
      const canvas = document.querySelector('.lc-canvas');
      const rect = el?.getBoundingClientRect();
      return {
        hasTrigger: !!st,
        start: st ? st.start : (rect ? rect.top + window.scrollY : 7000),
        end: st ? st.end : (rect ? rect.top + window.scrollY + 4050 : 11050),
        hasCanvas: !!canvas,
        canvasWidth: canvas?.width,
        canvasHeight: canvas?.height,
      };
    });
    console.log('Trigger info:', triggerInfo);

    const startY = triggerInfo.start;
    const totalDistance = triggerInfo.end - triggerInfo.start;

    // Checkpoints for the 6 stations
    const checkpoints = [
      { name: '01-strategy', p: 0.1, expectedTitle: 'Digital Strategy' },
      { name: '02-web', p: 0.26, expectedTitle: 'Web Development' },
      { name: '03-uiux', p: 0.44, expectedTitle: 'UI/UX Design' },
      { name: '04-social', p: 0.6, expectedTitle: 'Social Media' },
      { name: '05-mobile', p: 0.76, expectedTitle: 'Mobile App Development' },
      { name: '06-software', p: 0.92, expectedTitle: 'Software Development' },
    ];

    for (const cp of checkpoints) {
      const targetY = Math.round(startY + totalDistance * cp.p);
      await scrollToPosition(page, targetY);

      const state = await page.evaluate(() => {
        const titleEl = document.querySelector('.lc-station-title');
        const numEl = document.querySelector('.lc-station-num');
        const infoEl = document.querySelector('.lc-station-info');
        const activeNav = document.querySelector('.lc-nav-item.active .lc-nav-num');
        return {
          title: titleEl?.textContent?.trim(),
          num: numEl?.textContent?.trim(),
          infoVisible: infoEl?.classList.contains('visible'),
          activeNavNum: activeNav?.textContent?.trim(),
        };
      });

      console.log(`Station ${cp.name} (targetY=${targetY}):`, state);
      summary.desktopStations.push({ ...cp, ...state, matched: state.title === cp.expectedTitle });

      const shotPath = path.join(OUT_DIR, `lca-1440-${cp.name}.png`);
      await page.screenshot({ path: shotPath });
    }

    // Test clicking navigation (click station 4: Social Media)
    console.log('Testing station navigation click...');
    const navItems = await page.$$('.lc-nav-item');
    if (navItems.length >= 4) {
      await navItems[3].click();
      await page.waitForTimeout(1600); // smooth scroll duration
      const clickedStationTitle = await page.$eval('.lc-station-title', (el) => el.textContent?.trim());
      console.log('Navigated via click to:', clickedStationTitle);
      summary.navClickTest = (clickedStationTitle === 'Social Media');
    }

    // Capture final wide view
    const finalY = Math.round(startY + totalDistance * 0.98);
    await scrollToPosition(page, finalY);
    await page.screenshot({ path: path.join(OUT_DIR, 'lca-1440-07-final.png') });
    await page.close();

    // 2. Mobile Viewport test (390x844)
    console.log('Testing Mobile 390x844...');
    const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await mobilePage.goto(URL, { waitUntil: 'domcontentloaded' });
    await waitPastPreloader(mobilePage);

    const mobileServices = await mobilePage.$('#services');
    if (mobileServices) {
      await mobileServices.scrollIntoViewIfNeeded();
      await mobilePage.waitForTimeout(600);
      const mobileCards = await mobilePage.$$('.lc-mobile-card');
      summary.mobileOk = mobileCards.length === 6;
      console.log(`Mobile cards count: ${mobileCards.length}`);
      await mobilePage.screenshot({ path: path.join(OUT_DIR, 'lca-mobile-390.png') });
    }
    await mobilePage.close();

  } finally {
    await browser.close();
  }

  console.log('\n=== VERIFICATION SUMMARY ===');
  console.log(JSON.stringify(summary, null, 2));

  if (summary.errors.length > 0) {
    console.error('Errors encountered during test:', summary.errors);
  }
}

run().catch((err) => {
  console.error('Fatal verification failure:', err);
  process.exit(1);
});
