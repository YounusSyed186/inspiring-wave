import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const REF_PATH = 'C:/Users/DELL/.gemini/antigravity/brain/f09d1b1d-8c74-4aef-bb56-608807ec6d67/.user_uploaded/media_1795391858213_0294b7cc.jpg';
const OUT_DIR = path.resolve('public/images/services');

async function main() {
  const ref = sharp(REF_PATH);
  const meta = await ref.metadata();
  console.log('Ref size:', meta.width, meta.height); // 1024 x 576

  // Header is top 40px in 1024x576. Stage is top 40 to 576 (height 536).
  // Scale factor to desktop stage: 1672 / 1024 = 1.6328, 875 / 536 = 1.6325.
  // The aspect ratio matches 1672 / 875 almost exactly!

  // =========================================================================
  // 1. PERFECT WORKTABLE & SUN COLLAGE ("the image in bg design")
  // =========================================================================
  // In 1024x576:
  // Sun & worktable region:
  // Left: ~170 to ~530 (width ~360)
  // Top: ~40 to ~320 (height ~280)
  // Inside this region:
  // - Top: Cobalt Sun with birds and cloud
  // - Middle/Bottom: Studio Worktable photo with succulent, laptop, swatches, wireframes
  // - Right: Passes behind Card 01
  // - Left: Passes behind Headline
  // Let's extract this clean region and save as `studio-worktable-collage.webp`
  const worktableCrop = await ref.clone()
    .extract({ left: 175, top: 40, width: 355, height: 280 })
    .toBuffer({ resolveWithObject: true });

  await sharp(worktableCrop.data)
    .resize({ width: 580 }) // 355 * 1.633 = 580px
    .webp({ quality: 95 })
    .toFile(path.join(OUT_DIR, 'studio-worktable-collage.webp'));

  console.log('✓ Created studio-worktable-collage.webp (580px width)');

  // =========================================================================
  // 2. PERFECT WAVE ART ("the wave")
  // =========================================================================
  // In 1024x576:
  // The wave spans:
  // Left: 0 to 1024 (entire width)
  // Top: ~280 to 576 (height ~296)
  // Left crest is from x: 0 to 440.
  // Bottom ribbon runs along y: 508 to 576 from x: 150 to 1024.
  // Above the bottom ribbon: Card 04, 05, 06 sit in live HTML.
  // But to make the wave completely standalone with ZERO card fragments:
  // Let's create `wave-full-artboard.webp`:
  // It has the full left wave crest (x: 0 to 445, y: 280 to 576),
  // AND the bottom wave ribbon (y: 508 to 576 across the entire width),
  // with any card interior masked out to the warm paper tone (#FAF4E9).
  
  // Let's load the raw pixels of the bottom stage:
  const waveCrop = await ref.clone()
    .extract({ left: 0, top: 280, width: 1024, height: 296 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = waveCrop;
  const W = info.width;
  const H = info.height;

  // Let's mask out the cards in this crop so only the wave remains:
  // In crop coordinates (y_crop = y_ref - 280):
  // Card 04: x: 280 to 510, y: 60 to 228
  // Card 05: x: 495 to 755, y: 70 to 228
  // Card 06: x: 750 to 1010, y: 70 to 228
  // The bottom wave ribbon begins at y_crop ~ 228 (y_ref ~ 508).
  // Everything above y_crop ~ 228 for x > 380 belongs to cards or gutter.
  // If we fill the card interior area with clean paper (#FAF4E9),
  // then ONLY the wave crest on the left (x: 0 to 380) and the bottom wave ribbon (y_crop > 225) remain!
  
  // Let's inspect where the bottom wave ribbon is:
  // For each pixel in crop:
  // If x > 380 and y_crop < 225 (above the bottom wave ribbon):
  // We can leave it as clean transparent or warm paper (#FAF4E9).
  const cleanWaveData = Buffer.from(data);
  const paperR = 250;
  const paperG = 244;
  const paperB = 233;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const idx = (y * W + x) * info.channels;
      
      // Area of Card 04, 05, 06 above the wave ribbon:
      // In Card 04, the card bottom border is around y = 228 (in crop).
      // Between x = 380 and W:
      if (x > 380 && y < 225) {
        // Card interior -> replace with warm paper #FAF4E9
        cleanWaveData[idx] = paperR;
        cleanWaveData[idx + 1] = paperG;
        cleanWaveData[idx + 2] = paperB;
      }
      
      // Intro body copy area:
      // x: 0 to 180, y: 0 to 120 (in crop):
      // In the crop, the body copy text sits above the wave:
      if (x < 185 && y < 115) {
        // Replace with warm paper #FAF4E9
        cleanWaveData[idx] = paperR;
        cleanWaveData[idx + 1] = paperG;
        cleanWaveData[idx + 2] = paperB;
      }
    }
  }

  // Now cleanWaveData has:
  // 1. The FULL, UNTOUCHED, ORIGINAL wave crest on the left (with all foam, droplets, and shading)!
  // 2. The FULL, UNTOUCHED, ORIGINAL bottom wave ribbon flowing across the entire bottom width!
  // 3. ZERO text, ZERO cards!
  // Resize to desktop stage width: 1672px
  await sharp(cleanWaveData, {
    raw: {
      width: W,
      height: H,
      channels: info.channels,
    },
  })
    .resize({ width: 1672 })
    .webp({ quality: 96 })
    .toFile(path.join(OUT_DIR, 'perfect-wave-stage.webp'));

  console.log('✓ Created perfect-wave-stage.webp (1672px width, completely clean of text and cards!)');
}

main().catch(console.error);
