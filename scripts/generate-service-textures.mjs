import sharp from 'sharp';
import fs from 'fs';

async function generateTextures() {
  const dir = 'public/assets/services';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // 1. Technical Grid Backdrop
  const gw = 1024;
  const gh = 1024;
  let gridLines = '';
  const step = 64;
  for (let x = 0; x <= gw; x += step) {
    gridLines += `<line x1="${x}" y1="0" x2="${x}" y2="${gh}" stroke="rgba(25, 69, 245, 0.14)" stroke-width="1" />`;
  }
  for (let y = 0; y <= gh; y += step) {
    gridLines += `<line x1="0" y1="${y}" x2="${gw}" y2="${y}" stroke="rgba(25, 69, 245, 0.14)" stroke-width="1" />`;
  }

  // Crosshairs at intersections
  let crosses = '';
  for (let x = step * 2; x < gw; x += step * 2) {
    for (let y = step * 2; y < gh; y += step * 2) {
      crosses += `
        <line x1="${x - 5}" y1="${y}" x2="${x + 5}" y2="${y}" stroke="rgba(216, 240, 60, 0.45)" stroke-width="1.2" />
        <line x1="${x}" y1="${y - 5}" x2="${x}" y2="${y + 5}" stroke="rgba(216, 240, 60, 0.45)" stroke-width="1.2" />
      `;
    }
  }

  const gridSvg = `
  <svg width="${gw}" height="${gh}" viewBox="0 0 ${gw} ${gh}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#080a0b" />
    ${gridLines}
    ${crosses}
  </svg>
  `;
  await sharp(Buffer.from(gridSvg)).png().toFile(dir + '/grid-backdrop.png');

  // 2. Fluorescent Lime Halo Glow Sprite
  const hw = 512;
  const hh = 512;
  const haloSvg = `
  <svg width="${hw}" height="${hh}" viewBox="0 0 ${hw} ${hh}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="limeGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#d8f03c" stop-opacity="0.95" />
        <stop offset="35%" stop-color="#d8f03c" stop-opacity="0.75" />
        <stop offset="65%" stop-color="#1945f5" stop-opacity="0.3" />
        <stop offset="100%" stop-color="#080a0b" stop-opacity="0" />
      </radialGradient>
    </defs>
    <circle cx="${hw/2}" cy="${hh/2}" r="${hw/2}" fill="url(#limeGlow)" />
  </svg>
  `;
  await sharp(Buffer.from(haloSvg)).png().toFile(dir + '/halo-glow.png');

  // 3. Crisp 3D Pointer Cursor
  const cw = 128;
  const ch = 128;
  const cursorSvg = `
  <svg width="${cw}" height="${ch}" viewBox="0 0 ${cw} ${ch}" xmlns="http://www.w3.org/2000/svg">
    <filter id="shadow" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="3" dy="5" stdDeviation="4" flood-color="#000" flood-opacity="0.6"/>
    </filter>
    <path d="M16 12 L16 92 L38 72 L58 114 L74 106 L54 64 L84 64 Z" fill="#ffffff" stroke="#080a0b" stroke-width="3" filter="url(#shadow)" stroke-linejoin="round"/>
  </svg>
  `;
  await sharp(Buffer.from(cursorSvg)).png().toFile(dir + '/pointer-cursor.png');

  console.log('Generated grid-backdrop.png, halo-glow.png, and pointer-cursor.png!');
}

generateTextures().catch(console.error);
