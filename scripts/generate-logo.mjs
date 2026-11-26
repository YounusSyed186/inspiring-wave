import fs from 'fs';
import path from 'path';

// Read uploaded logo PNG
const srcPath = 'C:/Users/DELL/.gemini/antigravity/brain/f09d1b1d-8c74-4aef-bb56-608807ec6d67/.user_uploaded/media_1795532534437_e1d7978d.png';
const pngBuffer = fs.readFileSync(srcPath);

// Ensure public/assets directory exists
fs.mkdirSync('public/assets', { recursive: true });

// 1. Write the PNG to public/assets/inspiring-wave-logo.png
fs.writeFileSync('public/assets/inspiring-wave-logo.png', pngBuffer);
console.log('Saved public/assets/inspiring-wave-logo.png');

// 2. Create an SVG wrapper that embeds the PNG with mask support
const base64Png = pngBuffer.toString('base64');
const dataUri = `data:image/png;base64,${base64Png}`;

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 568 103" width="568" height="103" aria-label="Inspiring Wave">
  <defs>
    <mask id="iw-logo-mask">
      <image href="${dataUri}" width="568" height="103" preserveAspectRatio="xMidYMid meet" />
    </mask>
  </defs>
  <!-- Renders in currentColor on any surface -->
  <rect width="568" height="103" mask="url(#iw-logo-mask)" fill="currentColor" />
</svg>`;

fs.writeFileSync('public/assets/inspiring-wave-logo.svg', svgContent);
console.log('Saved public/assets/inspiring-wave-logo.svg');
