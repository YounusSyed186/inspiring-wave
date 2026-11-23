import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

async function main() {
  const refPath = 'C:/Users/DELL/.gemini/antigravity/brain/f09d1b1d-8c74-4aef-bb56-608807ec6d67/.user_uploaded/media_1795391858213_0294b7cc.jpg';
  
  // 1. Inspect reference image
  const refImg = sharp(refPath);
  const refMeta = await refImg.metadata();
  console.log('Reference dimensions:', refMeta.width, refMeta.height);

  // In the reference (1024x576):
  // The bottom wave spans the entire width (0 to 1024), from top ~260 to 576.
  // Let's extract the full wave zone:
  const waveCrop = await refImg.clone()
    .extract({ left: 0, top: 260, width: 1024, height: 316 })
    .toBuffer({ resolveWithObject: true });

  console.log('Extracted wave crop:', waveCrop.info.width, waveCrop.info.height);

  // Let's create an alpha mask for this wave crop so that the warm ivory paper background (#FAF4E9)
  // blends seamlessly, or keep the exact paper color.
  // Notice the paper color in the reference is RGB [249, 244, 233] ~ [250, 245, 235] (#FAF4E9).
  // Inside the wave:
  // - Cobalt blue: RGB around [23, 56, 255] or [20, 70, 240]
  // - Dark ink: RGB < 50
  // - Ivory foam: RGB [255, 253, 245]
  
  // But wait! Look at the cards in the reference:
  // Card 04, 05, 06 are on top of the wave ribbon in the reference.
  // Since Card 04, 05, 06 in our website are LIVE HTML cards with opaque backgrounds:
  // Card 04 (cream #FAF4E9), Card 05 (black #111110), Card 06 (cream #FAF4E9)
  // will sit at z-index 8 and naturally cover the area of the cards!
  // BUT what about between the cards?
  // Between Card 04 and Card 05: there is a small paper gutter where the wave ribbon shows!
  // Between Card 05 and Card 06: there is a small paper gutter where the wave ribbon shows!
  // And BELOW all the cards: the bottom wave ribbon flows all the way to the right edge!
  // And TO THE LEFT of Card 04: the entire wave crest with all its foam and droplets is 100% visible!

  // Let's verify what happens if we mask out any text from Card 04, 05, 06 that might peek above the live cards,
  // or clean the wave so it is pure artwork!
  
  // Let's inspect where Card 04, 05, 06 live in this 1024x316 crop:
  // In 1024 width:
  // Card 04 left is ~280px (458 / 1672 * 1024 = 280px).
  // In Card 04: top is 558/875 * 576 = 367 -> in crop y = 367 - 260 = 107px.
  
  // Let's write out a high-res version of the wave crop
  await sharp(waveCrop.data)
    .resize({ width: 1672 }) // Scale to match desktop stage width
    .webp({ quality: 95 })
    .toFile('public/images/services/full-wave-stage.webp');

  console.log('Saved public/images/services/full-wave-stage.webp');
}

main().catch(console.error);
