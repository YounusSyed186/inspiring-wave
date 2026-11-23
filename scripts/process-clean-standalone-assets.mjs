import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SOURCES = [
  {
    key: 'studio-worktable',
    src: 'C:/Users/DELL/.gemini/antigravity/brain/f09d1b1d-8c74-4aef-bb56-608807ec6d67/studio_worktable_1795392188132.jpg',
    bgType: 'gray',
    targetBg: [205, 207, 210],
    tolerance: 32,
    feather: 2,
    maxWidth: 1000,
  },
  {
    key: 'wave-crest',
    src: 'C:/Users/DELL/.gemini/antigravity/brain/f09d1b1d-8c74-4aef-bb56-608807ec6d67/wave_crest_v3_1795392287699.jpg',
    bgType: 'gray',
    targetBg: [206, 210, 216],
    tolerance: 34,
    feather: 2,
    maxWidth: 1200,
  },
  {
    key: 'strategy-target',
    src: 'C:/Users/DELL/.gemini/antigravity/brain/f09d1b1d-8c74-4aef-bb56-608807ec6d67/strategy_target_1795392285477.jpg',
    bgType: 'gray',
    targetBg: [200, 203, 207],
    tolerance: 32,
    feather: 2,
    maxWidth: 800,
  },
  {
    key: 'web-laptop',
    src: 'C:/Users/DELL/.gemini/antigravity/brain/f09d1b1d-8c74-4aef-bb56-608807ec6d67/web_laptop_refined_1795392269529.jpg',
    bgType: 'gray',
    targetBg: [201, 205, 210],
    tolerance: 32,
    feather: 2,
    maxWidth: 900,
  },
  {
    key: 'ux-tablet',
    src: 'C:/Users/DELL/.gemini/antigravity/brain/f09d1b1d-8c74-4aef-bb56-608807ec6d67/ux_tablet_1795392299050.jpg',
    bgType: 'gray',
    targetBg: [202, 206, 210],
    tolerance: 32,
    feather: 2,
    maxWidth: 1100,
  },
  {
    key: 'social-campaign',
    src: 'C:/Users/DELL/.gemini/antigravity/brain/f09d1b1d-8c74-4aef-bb56-608807ec6d67/social_campaign_1795392249807.jpg',
    bgType: 'gray',
    targetBg: [202, 206, 210],
    tolerance: 32,
    feather: 2,
    maxWidth: 800,
  },
  {
    key: 'mobile-phone',
    src: 'C:/Users/DELL/.gemini/antigravity/brain/f09d1b1d-8c74-4aef-bb56-608807ec6d67/mobile_phone_v2_1795392268261.jpg',
    bgType: 'gray',
    targetBg: [201, 205, 211],
    tolerance: 32,
    feather: 2,
    maxWidth: 700,
  },
  {
    key: 'software-laptop',
    src: 'C:/Users/DELL/.gemini/antigravity/brain/16b9f33b-c77e-4473-b9b8-3e13f215278c/service_06_laptop_whitebg_1795371979966.jpg',
    bgType: 'white',
    targetBg: [250, 250, 250],
    tolerance: 28,
    feather: 2,
    maxWidth: 850,
  },
];

const OUT_DIR = path.resolve('public/images/services');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function floodFillAlpha(width, height, rawData, channels, targetBg, tolerance) {
  // rawData is an RGBA buffer of length width * height * 4
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

    // Neighbors
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
  for (let i = 0; i < totalPixels; i++) {
    const bIdx = i * 4;
    if (isBg[i] === 1) {
      rawData[bIdx + 3] = 0; // Transparent
    } else {
      rawData[bIdx + 3] = 255; // Opaque
    }
  }

  // Gentle boundary feathering (1-2 px soft edge)
  const softened = new Uint8Array(rawData);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const pIdx = y * width + x;
      if (isBg[pIdx] === 0) {
        // Count background neighbors
        let bgNeighbors = 0;
        if (isBg[pIdx - 1]) bgNeighbors++;
        if (isBg[pIdx + 1]) bgNeighbors++;
        if (isBg[pIdx - width]) bgNeighbors++;
        if (isBg[pIdx + width]) bgNeighbors++;

        if (bgNeighbors > 0) {
          const bIdx = pIdx * 4;
          // Soften edge slightly to prevent hard aliased stepping
          softened[bIdx + 3] = Math.max(80, 255 - bgNeighbors * 40);
        }
      }
    }
  }

  return softened;
}

async function processAsset(cfg) {
  console.log(`Processing ${cfg.key}...`);
  const inputBuffer = fs.readFileSync(cfg.src);

  // Convert to RGBA raw
  const { data: rawRgb, info } = await sharp(inputBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const processedData = floodFillAlpha(
    info.width,
    info.height,
    rawRgb,
    info.channels,
    cfg.targetBg,
    cfg.tolerance
  );

  // Load into Sharp, trim empty transparent border with slight padding, resize
  const trimmed = await sharp(processedData, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .trim({ threshold: 5 })
    .toBuffer({ resolveWithObject: true });

  // Resize to maxWidth if larger
  let pipeline = sharp(trimmed.data, {
    raw: {
      width: trimmed.info.width,
      height: trimmed.info.height,
      channels: 4,
    },
  });
  if (trimmed.info.width > cfg.maxWidth) {
    pipeline = pipeline.resize({ width: cfg.maxWidth });
  }

  const pngPath = path.join(OUT_DIR, `${cfg.key}.png`);
  const webpPath = path.join(OUT_DIR, `${cfg.key}.webp`);

  await pipeline.clone().png({ quality: 95, compressionLevel: 8 }).toFile(pngPath);
  await pipeline.clone().webp({ quality: 92, effort: 5 }).toFile(webpPath);

  const finalMeta = await sharp(webpPath).metadata();
  console.log(`✓ Saved ${cfg.key}: ${finalMeta.width}x${finalMeta.height} (${(fs.statSync(webpPath).size / 1024).toFixed(1)} KB)`);
}

async function main() {
  for (const item of SOURCES) {
    try {
      await processAsset(item);
    } catch (e) {
      console.error(`Failed to process ${item.key}:`, e);
    }
  }
  console.log('All standalone assets processed successfully!');
}

main();
