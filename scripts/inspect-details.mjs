import sharp from 'sharp';
import fs from 'node:fs';

if (!fs.existsSync('local')) fs.mkdirSync('local');

const ref = sharp('C:/Users/DELL/.gemini/antigravity/brain/f09d1b1d-8c74-4aef-bb56-608807ec6d67/.user_uploaded/media_1795391858213_0294b7cc.jpg');
await ref.clone().extract({ left: 0, top: 300, width: 450, height: 276 }).toFile('local/ref-wave-detail.png');
await ref.clone().extract({ left: 170, top: 40, width: 360, height: 300 }).toFile('local/ref-worktable-detail.png');
console.log('Details extracted for inspection');
