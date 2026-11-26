import * as THREE from 'three';
import { PROCESS_PHASES, ProcessPhaseId } from './process.data';

export interface ProcessPrintRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const PROCESS_PRINT_REGIONS: Record<ProcessPhaseId, ProcessPrintRegion> = {
  discover: { x: 0, y: 0, width: 1 / 3, height: 1 / 2 },
  define: { x: 1 / 3, y: 0, width: 1 / 3, height: 1 / 2 },
  design: { x: 2 / 3, y: 0, width: 1 / 3, height: 1 / 2 },
  develop: { x: 0, y: 1 / 2, width: 1 / 3, height: 1 / 2 },
  deliver: { x: 1 / 3, y: 1 / 2, width: 1 / 3, height: 1 / 2 },
};

const ATLAS_WIDTH = 2048;
const ATLAS_HEIGHT = 1024;
const TAU = Math.PI * 2;
const COBALT_PHASES = new Set<ProcessPhaseId>(['define', 'develop']);

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function trackedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  spacing: number,
) {
  let cursor = x;
  for (const character of text) {
    ctx.fillText(character, cursor, y);
    cursor += ctx.measureText(character).width + spacing;
  }
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 2);
}

function registrationMarks(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
) {
  const l = 13;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.25;
  const marks: Array<[number, number, number, number]> = [
    [x, y, 1, 1], [x + width, y, -1, 1],
    [x, y + height, 1, -1], [x + width, y + height, -1, -1],
  ];
  marks.forEach(([mx, my, dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(mx, my + dy * l);
    ctx.lineTo(mx, my);
    ctx.lineTo(mx + dx * l, my);
    ctx.stroke();
  });
  ctx.restore();
}

function discoverEngraving(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
) {
  const cx = x + width * 0.78;
  const cy = y + height * 0.57;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;
  for (let ring = 1; ring <= 7; ring += 1) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, ring * 14, ring * 8.4, -0.15, 0, TAU);
    ctx.stroke();
  }
  for (let line = 0; line < 13; line += 1) {
    ctx.beginPath();
    for (let step = 0; step <= 48; step += 1) {
      const px = x + (step / 48) * width;
      const py = y + height * (0.72 + line * 0.014) + Math.sin(step * 0.25 + line) * 5;
      if (step === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function defineEngraving(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  const gx = x + width * 0.63;
  const gy = y + height * 0.12;
  const gw = width * 0.32;
  const gh = height * 0.74;
  for (let col = 0; col <= 6; col += 1) {
    const px = gx + (col / 6) * gw;
    ctx.beginPath(); ctx.moveTo(px, gy); ctx.lineTo(px, gy + gh); ctx.stroke();
  }
  for (let row = 0; row <= 8; row += 1) {
    const py = gy + (row / 8) * gh;
    ctx.beginPath(); ctx.moveTo(gx, py); ctx.lineTo(gx + gw, py); ctx.stroke();
  }
  ctx.lineWidth = 2;
  ctx.strokeRect(gx + 8, gy + 8, gw - 16, gh - 16);
  ctx.beginPath();
  ctx.moveTo(gx + 8, gy + gh - 8);
  ctx.bezierCurveTo(gx + 12, gy + 38, gx + gw - 28, gy + 18, gx + gw - 8, gy + gh * 0.42);
  ctx.stroke();
  ctx.restore();
}

function designEngraving(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.15;
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();
  for (let curve = -5; curve <= 8; curve += 1) {
    const offset = curve * 10;
    ctx.beginPath();
    ctx.moveTo(x - 30, y + height * 0.72 + offset);
    ctx.bezierCurveTo(
      x + width * 0.18,
      y + height * 0.06 + offset,
      x + width * 0.66,
      y + height * 0.95 - offset * 0.25,
      x + width + 30,
      y + height * 0.2 + offset,
    );
    ctx.stroke();
  }
  ctx.fillStyle = color;
  [[0.68, 0.25], [0.79, 0.48], [0.7, 0.72], [0.9, 0.61]].forEach(([nx, ny]) => {
    ctx.fillRect(x + nx * width - 3, y + ny * height - 3, 6, 6);
  });
  ctx.restore();
}

function developEngraving(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
) {
  const rand = seededRandom(404);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.15;
  for (let lane = 0; lane < 9; lane += 1) {
    const baseY = y + height * (0.12 + lane * 0.09);
    ctx.beginPath(); ctx.moveTo(x + width * 0.58, baseY);
    for (let node = 1; node <= 4; node += 1) {
      const px = x + width * (0.58 + node * 0.085);
      const py = baseY + (rand() - 0.5) * 20;
      ctx.lineTo(px - 8, baseY); ctx.lineTo(px, py); ctx.lineTo(px + 8, py);
    }
    ctx.stroke();
  }
  for (let index = 0; index < 18; index += 1) {
    const px = x + width * (0.6 + rand() * 0.34);
    const py = y + height * (0.12 + rand() * 0.76);
    ctx.beginPath(); ctx.arc(px, py, 2.2 + rand() * 2.4, 0, TAU); ctx.fill();
  }
  ctx.strokeRect(x + width * 0.68, y + height * 0.3, width * 0.2, height * 0.4);
  ctx.restore();
}

function deliverEngraving(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
) {
  const cx = x + width * 0.8;
  const cy = y + height * 0.54;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.3;
  for (let ring = 1; ring <= 7; ring += 1) {
    const rx = ring * 14;
    const ry = ring * 8;
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0.12, -2.5, 2.2); ctx.stroke();
    const ax = cx + Math.cos(2.2) * rx;
    const ay = cy + Math.sin(2.2) * ry;
    ctx.beginPath(); ctx.moveTo(ax - 8, ay - 1); ctx.lineTo(ax, ay); ctx.lineTo(ax - 2, ay - 7); ctx.stroke();
  }
  [0.62, 0.72, 0.82, 0.9].forEach((fraction, index) => {
    const px = x + width * fraction;
    const py = y + height * (index % 2 ? 0.75 : 0.25);
    ctx.beginPath(); ctx.arc(px, py, index === 3 ? 6 : 3, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(cx, cy); ctx.stroke();
  });
  ctx.restore();
}

const engravers: Record<
  ProcessPhaseId,
  (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string) => void
> = {
  discover: discoverEngraving,
  define: defineEngraving,
  design: designEngraving,
  develop: developEngraving,
  deliver: deliverEngraving,
};

function drawFrieze(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  onCobalt: boolean,
) {
  const bandHeight = height * 0.13;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, width, bandHeight);
  ctx.rect(x, y + height - bandHeight, width, bandHeight);
  ctx.clip('evenodd');
  ctx.globalCompositeOperation = onCobalt ? 'screen' : 'multiply';
  ctx.globalAlpha = onCobalt ? 0.105 : 0.2;
  const sourceRatio = image.naturalWidth / Math.max(1, image.naturalHeight);
  const targetHeight = Math.max(bandHeight * 2.5, width / sourceRatio);
  ctx.filter = onCobalt ? 'grayscale(100%) contrast(115%)' : 'grayscale(100%) contrast(135%)';
  ctx.drawImage(image, x, y - targetHeight * 0.36, width, targetHeight);
  ctx.drawImage(image, x, y + height - targetHeight * 0.64, width, targetHeight);
  ctx.restore();
}

function drawPhaseCell(
  ctx: CanvasRenderingContext2D,
  phaseId: ProcessPhaseId,
  cell: { x: number; y: number; width: number; height: number },
  frieze: HTMLImageElement | null,
) {
  const phase = PROCESS_PHASES.find((entry) => entry.id === phaseId);
  if (!phase) return;
  const onCobalt = COBALT_PHASES.has(phaseId);
  const ink = onCobalt ? '#f5ecd7' : '#0a0f18';
  const muted = onCobalt ? 'rgba(245,236,215,0.7)' : 'rgba(10,15,24,0.58)';
  const engraving = onCobalt ? 'rgba(182,204,255,0.24)' : 'rgba(11,19,34,0.18)';
  const accent = onCobalt ? '#dfff32' : '#2041f5';
  const padX = cell.width * 0.075;
  const padY = cell.height * 0.08;
  const x = cell.x + padX;
  const y = cell.y + padY;
  const width = cell.width - padX * 2;
  const height = cell.height - padY * 2;

  ctx.save();
  ctx.beginPath(); ctx.rect(cell.x + 3, cell.y + 3, cell.width - 6, cell.height - 6); ctx.clip();
  if (frieze) drawFrieze(ctx, frieze, cell.x, cell.y, cell.width, cell.height, onCobalt);
  engravers[phaseId](ctx, x, y, width, height, engraving);
  registrationMarks(ctx, x, y, width, height, muted);

  ctx.fillStyle = accent;
  ctx.fillRect(x, y + height * 0.16, width * 0.075, 7);

  ctx.fillStyle = muted;
  ctx.font = '600 17px "IBM Plex Mono", monospace';
  ctx.textBaseline = 'alphabetic';
  trackedText(ctx, `${phase.number} / 05`, x, y + height * 0.11, 2.1);
  ctx.textAlign = 'right';
  ctx.fillText(phase.cue.toUpperCase(), x + width, y + height * 0.11);
  ctx.textAlign = 'left';

  // The decal geometry supplies the curve; broad lettering and protected
  // negative space keep the print readable at glancing camera angles.
  ctx.fillStyle = ink;
  const fontSize = phase.title.length > 7 ? 104 : 122;
  ctx.font = `italic 900 ${fontSize}px "Barlow Condensed", Impact, sans-serif`;
  ctx.fillText(phase.title.toUpperCase(), x + 4, y + height * 0.52);

  ctx.strokeStyle = accent;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x + 5, y + height * 0.59);
  ctx.quadraticCurveTo(x + width * 0.21, y + height * 0.55, x + width * 0.4, y + height * 0.6);
  ctx.stroke();

  ctx.fillStyle = muted;
  ctx.font = '500 22px Inter, Arial, sans-serif';
  const lines = wrapText(ctx, phase.summary, width * 0.68);
  lines.forEach((line, index) => ctx.fillText(line, x + 5, y + height * (0.73 + index * 0.075)));

  ctx.font = '600 13px "IBM Plex Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`IW / ${phase.id.toUpperCase()} / CONTINUOUS`, x + width, y + height * 0.94);
  ctx.restore();
}

/**
 * Builds a transparent 2x3 print atlas. Each occupied cell includes phase
 * typography and phase-specific engraving; callers map PROCESS_PRINT_REGIONS
 * onto curved ribbon patches so the print follows the sculpture's surface.
 */
export function createProcessPrintAtlas(maxAnisotropy = 16): {
  texture: THREE.CanvasTexture;
  width: number;
  height: number;
} {
  if (typeof document === 'undefined') throw new Error('Process print atlas requires a browser document');
  const canvas = document.createElement('canvas');
  canvas.width = ATLAS_WIDTH;
  canvas.height = ATLAS_HEIGHT;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) throw new Error('2D canvas unavailable for process print atlas');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = Math.max(1, Math.min(16, Math.floor(maxAnisotropy || 1)));
  texture.premultiplyAlpha = false;

  let frieze: HTMLImageElement | null = null;
  const paint = () => {
    ctx.clearRect(0, 0, ATLAS_WIDTH, ATLAS_HEIGHT);
    (Object.keys(PROCESS_PRINT_REGIONS) as ProcessPhaseId[]).forEach((id) => {
      const region = PROCESS_PRINT_REGIONS[id];
      drawPhaseCell(ctx, id, {
        x: region.x * ATLAS_WIDTH,
        y: region.y * ATLAS_HEIGHT,
        width: region.width * ATLAS_WIDTH,
        height: region.height * ATLAS_HEIGHT,
      }, frieze);
    });
    texture.needsUpdate = true;
  };

  paint();
  document.fonts?.ready.then(paint).catch(() => undefined);

  const image = new Image();
  image.decoding = 'async';
  image.onload = () => {
    frieze = image;
    paint();
  };
  image.onerror = () => undefined;
  image.src = '/assets/process/ribbon-engraving.webp';

  return { texture, width: ATLAS_WIDTH, height: ATLAS_HEIGHT };
}

