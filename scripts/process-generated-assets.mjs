import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const brainDir = 'C:\\Users\\DELL\\.gemini\\antigravity\\brain\\f09d1b1d-8c74-4aef-bb56-608807ec6d67';
const outDir = path.resolve('public/images/services');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const assets = [
  { name: 'studio-worktable', file: 'studio_worktable_1795392188132.jpg', preserveIvory: true },
  { name: 'wave-crest', file: 'wave_crest_v3_1795392287699.jpg', preserveIvory: true },
  { name: 'strategy-target', file: 'strategy_target_1795392285477.jpg', preserveIvory: true },
  { name: 'web-laptop', file: 'web_laptop_refined_1795392269529.jpg', preserveIvory: true },
  { name: 'ux-tablet', file: 'ux_tablet_1795392299050.jpg', preserveIvory: true },
  { name: 'social-campaign', file: 'social_campaign_1795392249807.jpg', preserveIvory: true },
  { name: 'mobile-phone', file: 'mobile_phone_v2_1795392268261.jpg', preserveIvory: true },
];

async function inspectAndProcess() {
  console.log('Inspecting generated assets...');

  for (const item of assets) {
    const inputPath = path.join(brainDir, item.file);
    if (!fs.existsSync(inputPath)) {
      console.log(`❌ Not found: ${inputPath}`);
      continue;
    }

    const img = sharp(inputPath);
    const meta = await img.metadata();
    console.log(`\nAsset: ${item.name} (${meta.width}x${meta.height})`);

    const raw = await img.raw().toBuffer();
    const channels = meta.channels || 3;

    // Sample corners to find background color
    const corners = [
      [2, 2],
      [meta.width - 3, 2],
      [2, meta.height - 3],
      [meta.width - 3, meta.height - 3],
      [Math.floor(meta.width / 2), 2],
    ];

    let bgR = 0, bgG = 0, bgB = 0;
    for (const [cx, cy] of corners) {
      const idx = (cy * meta.width + cx) * channels;
      bgR += raw[idx];
      bgG += raw[idx + 1];
      bgB += raw[idx + 2];
    }
    bgR = Math.round(bgR / corners.length);
    bgG = Math.round(bgG / corners.length);
    bgB = Math.round(bgB / corners.length);
    console.log(`Background estimate: rgb(${bgR}, ${bgG}, ${bgB})`);

    // Let's create an RGBA buffer with background removal
    // We do flood fill from the borders or distance check from background color
    // Since background is uniform light gray, flood fill from outer border ensures
    // we don't accidentally remove ivory or white elements inside the subject!
    const w = meta.width;
    const h = meta.height;
    const isBg = new Uint8Array(w * h); // 0 = unknown, 1 = background, 2 = subject

    // Color distance function
    function colorDist(r, g, b, targetR, targetG, targetB) {
      const dr = r - targetR;
      const dg = g - targetG;
      const db = b - targetB;
      return Math.sqrt(dr * dr + dg * dg + db * db);
    }

    // Flood fill from all outer borders
    const queue = [];
    const threshold = 28; // color distance threshold for uniform background

    for (let x = 0; x < w; x++) {
      queue.push(x, 0);
      queue.push(x, h - 1);
    }
    for (let y = 0; y < h; y++) {
      queue.push(0, y);
      queue.push(w - 1, y);
    }

    let head = 0;
    while (head < queue.length) {
      const x = queue[head++];
      const y = queue[head++];
      const pIdx = y * w + x;
      if (isBg[pIdx] !== 0) continue;

      const bIdx = pIdx * channels;
      const r = raw[bIdx];
      const g = raw[bIdx + 1];
      const b = raw[bIdx + 2];

      const dist = colorDist(r, g, b, bgR, bgG, bgB);
      if (dist <= threshold) {
        isBg[pIdx] = 1; // It is background
        // check neighbors
        if (x > 0 && isBg[pIdx - 1] === 0) queue.push(x - 1, y);
        if (x < w - 1 && isBg[pIdx + 1] === 0) queue.push(x + 1, y);
        if (y > 0 && isBg[pIdx - w] === 0) queue.push(x, y - 1);
        if (y < h - 1 && isBg[pIdx + w] === 0) queue.push(x, y + 1);
      } else {
        isBg[pIdx] = 2; // Hit edge/subject
      }
    }

    // Now build RGBA output buffer
    const rgba = Buffer.alloc(w * h * 4);
    let minX = w, maxX = 0, minY = h, maxY = 0;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const pIdx = y * w + x;
        const bIdx = pIdx * channels;
        const outIdx = pIdx * 4;

        const r = raw[bIdx];
        const g = raw[bIdx + 1];
        const b = raw[bIdx + 2];

        rgba[outIdx] = r;
        rgba[outIdx + 1] = g;
        rgba[outIdx + 2] = b;

        if (isBg[pIdx] === 1) {
          rgba[outIdx + 3] = 0; // transparent
        } else {
          // Check distance to nearest background pixel for smooth antialiasing
          let nearBg = false;
          if (
            (x > 0 && isBg[pIdx - 1] === 1) ||
            (x < w - 1 && isBg[pIdx + 1] === 1) ||
            (y > 0 && isBg[pIdx - w] === 1) ||
            (y < h - 1 && isBg[pIdx + w] === 1)
          ) {
            nearBg = true;
          }

          if (nearBg) {
            const dist = colorDist(r, g, b, bgR, bgG, bgB);
            // Feather edge
            const alpha = Math.min(255, Math.max(0, Math.round(((dist - 10) / (threshold + 15)) * 255)));
            rgba[outIdx + 3] = alpha;
          } else {
            rgba[outIdx + 3] = 255;
          }

          if (rgba[outIdx + 3] > 10) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
    }

    console.log(`Subject bounds: [${minX}, ${minY}] to [${maxX}, ${maxY}]`);
    
    // Crop margin if subject was found
    let processedSharp = sharp(rgba, {
      raw: { width: w, height: h, channels: 4 }
    });

    if (minX < maxX && minY < maxY) {
      const padding = 10;
      const cropX = Math.max(0, minX - padding);
      const cropY = Math.max(0, minY - padding);
      const cropW = Math.min(w - cropX, (maxX - minX) + padding * 2);
      const cropH = Math.min(h - cropY, (maxY - minY) + padding * 2);

      processedSharp = processedSharp.extract({
        left: cropX,
        top: cropY,
        width: cropW,
        height: cropH,
      });
    }

    const outPngPath = path.join(outDir, `${item.name}.png`);
    const outWebpPath = path.join(outDir, `${item.name}.webp`);

    await processedSharp.png().toFile(outPngPath);
    await processedSharp.webp({ quality: 92, alphaQuality: 100 }).toFile(outWebpPath);
    console.log(`✓ Saved: ${outWebpPath} and ${outPngPath}`);
  }

  // Also copy/optimize software-laptop
  const existingSoftware = path.resolve('public/assets/services/software-laptop.webp');
  if (fs.existsSync(existingSoftware)) {
    await sharp(existingSoftware).webp({ quality: 92 }).toFile(path.join(outDir, 'software-laptop.webp'));
    console.log('✓ Copied software-laptop.webp to public/images/services/software-laptop.webp');
  }
}

inspectAndProcess().catch(err => {
  console.error('Error processing assets:', err);
  process.exit(1);
});
