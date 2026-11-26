import { chromium } from 'playwright';
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const projects = [
  ['jagannath-packaging', 'https://jagannathpackaging.com/'],
  ['saura-shakti-energies', 'https://saurashaktienergies.com/'],
  ['dwaraka-global', 'https://dwarakaglobal.com/'],
  ['bites-of-india', 'https://bitesofindiaevan.com/'],
  ['xeno-craft', 'https://xenocraft.in/'],
  ['ksr-granites', 'https://ksrgranites.in/'],
  ['infracon-services', 'https://infraconservices.com/'],
  ['rr-destination-moments', 'https://rrdestinationmoments.com/'],
  ['stratalign-advisors', 'https://saprojects.in/'],
  ['wedmanthra', 'https://wedmanthra.com/'],
];

const output = 'public/assets/projects/live';
await mkdir(output, { recursive: true });
const browser = await chromium.launch();

try {
  for (const [slug, url] of projects) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2800);
    await page.keyboard.press('Escape');
    await page.addStyleTag({
      content: '*,*::before,*::after{animation-play-state:paused!important;scroll-behavior:auto!important}html{scrollbar-width:none!important}',
    }).catch(() => {});
    await page.evaluate(() => window.scrollTo(0, 0));
    const capture = await page.screenshot({ type: 'png', animations: 'disabled' });
    await sharp(capture)
      .resize(1200, 750, { fit: 'cover', position: 'top' })
      .webp({ quality: 86, smartSubsample: true })
      .toFile(`${output}/${slug}.webp`);
    console.log(`${slug}: ${page.url()}`);
    await page.close();
  }
} finally {
  await browser.close();
}
