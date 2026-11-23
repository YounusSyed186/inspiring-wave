import fs from 'node:fs';
import sharp from 'sharp';

async function checkScreenshots() {
  const files = [
    'qa/screenshots/desktop-03-work.png',
    'qa/screenshots/desktop-04-services.png',
    'qa/screenshots/desktop-05-method.png',
    'qa/screenshots/desktop-06-studio.png',
    'qa/screenshots/desktop-07-dimensions.png',
    'qa/screenshots/desktop-08-trust.png',
    'qa/screenshots/desktop-09-perspectives.png',
    'qa/screenshots/desktop-10-finale.png',
    'qa/screenshots/desktop-11-footer.png'
  ];

  for (const f of files) {
    if (fs.existsSync(f)) {
      const meta = await sharp(f).metadata();
      const stats = await sharp(f).stats();
      console.log(`${f}: ${meta.width}x${meta.height}, dominant channels: R=${Math.round(stats.channels[0].mean)}, G=${Math.round(stats.channels[1].mean)}, B=${Math.round(stats.channels[2].mean)}`);
    }
  }
}

checkScreenshots();
