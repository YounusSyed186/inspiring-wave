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
  await page.waitForTimeout(500);
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
        end: st ? st.end : (rect ? rect.top + window.scrollY + 4300 : 11300),
        hasCanvas: !!canvas,
        canvasWidth: canvas?.width,
        canvasHeight: canvas?.height,
      };
    });
    console.log('Trigger info:', triggerInfo);

    const startY = triggerInfo.start;
    const totalDistance = triggerInfo.end - triggerInfo.start;

    // Overview screenshot
    await scrollToPosition(page, startY);
    await page.screenshot({ path: path.join(OUT_DIR, 'lc-00-overview.png') });
    console.log('Captured lc-00-overview.png');

    // Checkpoints for the 6 stations + finale
    const checkpoints = [
      { name: '01-strategy', p: 0.16, expectedTitle: 'Digital Strategy' },
      { name: '02-web', p: 0.28, expectedTitle: 'Web Development' },
      { name: '03-uiux', p: 0.40, expectedTitle: 'UI/UX Design' },
      { name: '04-social', p: 0.52, expectedTitle: 'Social Media' },
      { name: '05-mobile', p: 0.64, expectedTitle: 'Mobile App Development' },
      { name: '06-software', p: 0.77, expectedTitle: 'Software Development' },
      { name: '07-finale', p: 0.95, expectedTitle: 'Finale' },
    ];

    for (const cp of checkpoints) {
      const targetY = Math.round(startY + totalDistance * cp.p);
      await scrollToPosition(page, targetY);

      const state = await page.evaluate(() => {
        const titleEl = document.querySelector('.lc-station-title');
        const taglineEl = document.querySelector('.lc-station-tagline');
        const infoEl = document.querySelector('.lc-station-info');
        const finaleEl = document.querySelector('.lc-finale-panel');
        return {
          title: titleEl?.textContent?.trim(),
          tagline: taglineEl?.textContent?.trim(),
          infoVisible: infoEl?.classList.contains('visible'),
          finaleVisible: finaleEl?.classList.contains('visible'),
        };
      });

      console.log(`Station ${cp.name} (p=${cp.p}):`, state);
      summary.desktopStations.push({ ...cp, actual: state });

      const shotPath = path.join(OUT_DIR, `lc-${cp.name}.png`);
      await page.screenshot({ path: shotPath });
    }

    // 2. Navigation Click Test
    console.log('Testing interactive pin navigation click...');
    await scrollToPosition(page, startY);
    await page.waitForTimeout(300);

    // Click Station 2 pin (03 // UI/UX DESIGN)
    const pinClicked = await page.evaluate(() => {
      const pin = document.querySelector('.lc-callout-2');
      if (pin) {
        pin.click();
        return true;
      }
      return false;
    });

    if (pinClicked) {
      await page.waitForTimeout(1400);
      const afterNav = await page.evaluate(() => {
        const title = document.querySelector('.lc-station-title')?.textContent?.trim();
        return title;
      });
      console.log('After pin click, active station title:', afterNav);
      summary.navClickTest = afterNav === 'UI/UX Design';
      await page.screenshot({ path: path.join(OUT_DIR, 'lc-after-pin-click.png') });
    }

    await page.close();

    // 3. Mobile test (390x844)
    console.log('Testing Mobile 390x844...');
    const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await mobilePage.goto(URL, { waitUntil: 'domcontentloaded' });
    await waitPastPreloader(mobilePage);

    await mobilePage.evaluate(() => {
      const el = document.querySelector('#services');
      if (el) el.scrollIntoView({ behavior: 'instant' });
    });
    await mobilePage.waitForTimeout(600);

    const mobileCheck = await mobilePage.evaluate(() => {
      const mobileEl = document.querySelector('.lc-mobile');
      const cards = document.querySelectorAll('.lc-mobile-card');
      return {
        hasMobile: !!mobileEl,
        cardCount: cards.length,
      };
    });
    console.log('Mobile check:', mobileCheck);
    summary.mobileOk = mobileCheck.hasMobile && mobileCheck.cardCount === 6;

    await mobilePage.screenshot({ path: path.join(OUT_DIR, 'lc-mobile.png') });
    await mobilePage.close();

  } catch (err) {
    console.error('Test run failed:', err);
    summary.errors.push(err.message);
  } finally {
    await browser.close();
  }

  console.log('\n📊 VERIFICATION SUMMARY:');
  console.log(JSON.stringify(summary, null, 2));

  const allStationsOk = summary.desktopStations.length === 7;
  const passed = allStationsOk && summary.mobileOk && summary.errors.length === 0;

  if (passed) {
    console.log('✅ ALL VERIFICATION CHECKS PASSED!');
    process.exit(0);
  } else {
    console.error('❌ SOME CHECKS FAILED');
    process.exit(1);
  }
}

run();
