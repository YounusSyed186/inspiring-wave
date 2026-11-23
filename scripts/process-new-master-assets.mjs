import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const OUT_DIR = path.resolve('public/images/services');

// Flood fill background removal from neutral gray
function floodFillAlpha(width, height, rawData, channels, targetBg, tolerance) {
  const totalPixels = width * height;
  const isBg = new Uint8Array(totalPixels);
  const queue = new Int32Array(totalPixels);
  let qHead = 0;
  let qTail = 0;

  function colorDistSq(idx) {
    const r = rawData[idx];
    const g = rawData[idx + 1];
    const b = rawData[idx + 2];
    const dr = r - targetBg[0];
    const dg = g - targetBg[1];
    const db = b - targetBg[2];
    return dr * dr + dg * dg + db * db;
  }

  const tolSq = tolerance * tolerance;

  // Initialize borders
  function pushBorder(x, y) {
    const pIdx = y * width + x;
    if (isBg[pIdx] === 0) {
      const bIdx = pIdx * 4;
      if (colorDistSq(bIdx) <= tolSq) {
        isBg[pIdx] = 1;
        queue[qTail++] = pIdx;
      }
    }
  }

  for (let x = 0; x < width; x++) {
    pushBorder(x, 0);
    pushBorder(x, height - 1);
  }
  for (let y = 1; y < height - 1; y++) {
    pushBorder(0, y);
    pushBorder(width - 1, y);
  }

  // 4-way flood fill
  while (qHead < qTail) {
    const pIdx = queue[qHead++];
    const x = pIdx % width;
    const y = Math.floor(pIdx / width);

    const neighbors = [
      x > 0 ? pIdx - 1 : -1,
      x < width - 1 ? pIdx + 1 : -1,
      y > 0 ? pIdx - width : -1,
      y < height - 1 ? pIdx + width : -1,
    ];

    for (const n of neighbors) {
      if (n >= 0 && isBg[n] === 0) {
        const bIdx = n * 4;
        if (colorDistSq(bIdx) <= tolSq) {
          isBg[n] = 1;
          queue[qTail++] = n;
        }
      }
    }
  }

  // Create alpha channel
  const softened = new Uint8Array(rawData);
  for (let i = 0; i < totalPixels; i++) {
    const bIdx = i * 4;
    if (isBg[i] === 1) {
      softened[bIdx + 3] = 0;
    } else {
      softened[bIdx + 3] = 255;
    }
  }

  // Boundary feathering
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const pIdx = y * width + x;
      if (isBg[pIdx] === 0) {
        let bgNeighbors = 0;
        if (isBg[pIdx - 1]) bgNeighbors++;
        if (isBg[pIdx + 1]) bgNeighbors++;
        if (isBg[pIdx - width]) bgNeighbors++;
        if (isBg[pIdx + width]) bgNeighbors++;

        if (bgNeighbors > 0) {
          const bIdx = pIdx * 4;
          softened[bIdx + 3] = Math.max(70, 255 - bgNeighbors * 45);
        }
      }
    }
  }

  return softened;
}

async function processAsset(srcPath, outKey, tolerance = 35, resizeWidth = 1400) {
  console.log(`Processing ${outKey} from ${srcPath}...`);
  const inputBuffer = fs.readFileSync(srcPath);
  const { data: rawRgb, info } = await sharp(inputBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Sample top-left corner for bg color
  const targetBg = [rawRgb[0], rawRgb[1], rawRgb[2]];
  console.log(`Sampled bg color:`, targetBg);

  const processedData = floodFillAlpha(info.width, info.height, rawRgb, info.channels, targetBg, tolerance);

  const trimmed = await sharp(processedData, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .trim({ threshold: 10 })
    .toBuffer({ resolveWithObject: true });

  const webpPath = path.join(OUT_DIR, `${outKey}.webp`);
  const pngPath = path.join(OUT_DIR, `${outKey}.png`);

  await sharp(trimmed.data, {
    raw: {
      width: trimmed.info.width,
      height: trimmed.info.height,
      channels: 4,
    },
  })
    .resize({ width: resizeWidth, withoutEnlargement: true })
    .webp({ quality: 95 })
    .toFile(webpPath);

  await sharp(trimmed.data, {
    raw: {
      width: trimmed.info.width,
      height: trimmed.info.height,
      channels: 4,
    },
  })
    .resize({ width: resizeWidth, withoutEnlargement: true })
    .png({ quality: 95 })
    .toFile(pngPath);

  console.log(`✓ Saved ${outKey}: ${trimmed.info.width}x${trimmed.info.height} -> ${resizeWidth}px`);
}

async function main() {
  const wavePath = 'C:/Users/DELL/.gemini/antigravity/brain/f09d1b1d-8c74-4aef-bb56-608807ec6d67/inspiring_wave_editorial_illustration_1795433857355.jpg';
  const worktablePath = 'C:/Users/DELL/.gemini/antigravity/brain/f09d1b1d-8c74-4aef-bb56-608807ec6d67/studio_worktable_collage_1795433867382.jpg';

  await processAsset(wavePath, 'wave-crest', 40, 1400);
  await processAsset(worktablePath, 'studio-worktable', 45, 1200);

  console.log('Both master assets processed successfully!');
}

main().catch(console.error);
