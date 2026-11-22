import sharp from 'sharp';
import fs from 'fs';

async function createRibbonTexture() {
  const width = 2048;
  const height = 128;

  const svg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f2efe6" />
    
    <!-- Chevrons at start -->
    <path d="M20 20 L55 64 L20 108 L40 108 L75 64 L40 20 Z" fill="#1945f5" />
    <path d="M50 20 L85 64 L50 108 L70 108 L105 64 L70 20 Z" fill="#1945f5" />
    <path d="M80 20 L115 64 L80 108 L100 108 L135 64 L100 20 Z" fill="#1945f5" />

    <!-- Typography -->
    <text x="170" y="82" font-family="'Barlow Condensed', 'Arial Black', sans-serif" font-size="44" font-weight="900" letter-spacing="8" fill="#080a0b">
      STRATEGY  /  DESIGN  /  TECHNOLOGY  /  IN MOTION  —  INSPIRING WAVE
    </text>

    <!-- Chevrons in middle -->
    <path d="M1360 20 L1395 64 L1360 108 L1380 108 L1415 64 L1380 20 Z" fill="#1945f5" />
    <path d="M1390 20 L1425 64 L1390 108 L1410 108 L1445 64 L1410 20 Z" fill="#1945f5" />
    <path d="M1420 20 L1455 64 L1420 108 L1440 108 L1475 64 L1440 20 Z" fill="#1945f5" />

    <text x="1510" y="82" font-family="'Barlow Condensed', 'Arial Black', sans-serif" font-size="44" font-weight="900" letter-spacing="8" fill="#080a0b">
      STRATEGY  /  DESIGN  /  TECH
    </text>
  </svg>
  `;

  if (!fs.existsSync('public/assets/services')) {
    fs.mkdirSync('public/assets/services', { recursive: true });
  }

  await sharp(Buffer.from(svg))
    .png()
    .toFile('public/assets/services/ribbon-texture.png');

  console.log('Created public/assets/services/ribbon-texture.png successfully!');
}

createRibbonTexture().catch(console.error);
