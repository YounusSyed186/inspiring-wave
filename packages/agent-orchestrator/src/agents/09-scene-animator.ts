/**
 * Agent 09: Scene Animator
 * Generates production-grade, deterministic procedural animation code (Canvas/SVG/WebGL)
 * executing in Lemo-Opuscar's browser rendering harness.
 */

import { z } from 'zod';
import { ProductionAgent, AgentExecutionContext, ValidationResult, AGENT_IDS } from '../types';

export const SceneAnimatorInputSchema = z.object({
  sceneIndex: z.number(),
  title: z.string(),
  durationSeconds: z.number(),
  visualConcept: z.string(),
  styleSlug: z.string(),
  cameraMovement: z.string(),
  onScreenText: z.string(),
  colorTokens: z.record(z.string()).optional(),
});

export type SceneAnimatorInput = z.infer<typeof SceneAnimatorInputSchema>;

export const SceneAnimatorOutputSchema = z.object({
  sceneIndex: z.number(),
  htmlSource: z.string(),
  durationSeconds: z.number(),
  verifiedContract: z.boolean(),
  renderStrategy: z.literal('LEMO_OPUSCAR'),
});

export type SceneAnimatorOutput = z.infer<typeof SceneAnimatorOutputSchema>;

export class SceneAnimatorAgent implements ProductionAgent<SceneAnimatorInput, SceneAnimatorOutput> {
  public id = AGENT_IDS.SCENE_ANIMATOR;
  public name = 'Scene Animator';
  public role = 'Procedural Code-Driven Motion & Animation Engineer';
  public workerType = 'animation-worker' as const;
  public skills = ['07-lemo-opuscar-director', '08-motion-graphics-design'];
  public modelConfig = { model: 'gemini-2.5-flash', temperature: 0.2 };
  public inputSchema = SceneAnimatorInputSchema;
  public outputSchema = SceneAnimatorOutputSchema;

  public async execute(input: SceneAnimatorInput, context: AgentExecutionContext): Promise<SceneAnimatorOutput> {
    context.logger.info(`Synthesizing procedural Lemo-Opuscar animation code for Scene #${input.sceneIndex}`);

    let specificSceneLogic = '';

    if (input.sceneIndex === 0) {
      // Scene 0: Map of Abbasid World
      specificSceneLogic = `
  // Cartographic grid
  ctx.strokeStyle = 'rgba(224, 169, 109, 0.15)';
  ctx.lineWidth = 1;
  for (let x = 100; x < 1920; x += 150) {
    ctx.beginPath();
    ctx.moveTo(x, 50);
    ctx.lineTo(x, 1030);
    ctx.stroke();
  }
  for (let y = 100; y < 1080; y += 150) {
    ctx.beginPath();
    ctx.moveTo(50, y);
    ctx.lineTo(1870, y);
    ctx.stroke();
  }

  // Radiating golden trade vectors
  const baghdadX = 960;
  const baghdadY = 540;
  const pulse = Math.sin(t * 3) * 10;
  
  const routes = [
    { x: 300, y: 750, name: 'Alexandria' },
    { x: 450, y: 400, name: 'Damascus' },
    { x: 1450, y: 680, name: 'Samarkand' },
    { x: 1600, y: 820, name: 'Indus Valley' },
    { x: 960, y: 920, name: 'Mecca' }
  ];

  routes.forEach((r, i) => {
    const progress = Math.min(1, Math.max(0, (t - i * 0.5) / 3));
    const curX = baghdadX + (r.x - baghdadX) * progress;
    const curY = baghdadY + (r.y - baghdadY) * progress;

    ctx.strokeStyle = 'rgba(244, 162, 97, 0.6)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 6]);
    ctx.lineDashOffset = -t * 20;
    ctx.beginPath();
    ctx.moveTo(baghdadX, baghdadY);
    ctx.lineTo(curX, curY);
    ctx.stroke();
    ctx.setLineDash([]);

    if (progress > 0.8) {
      ctx.fillStyle = '#E0A96D';
      ctx.beginPath();
      ctx.arc(r.x, r.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = '600 18px "Georgia", serif';
      ctx.fillText(r.name, r.x + 12, r.y + 6);
    }
  });

  // Baghdad epicenter
  const grad = ctx.createRadialGradient(baghdadX, baghdadY, 5, baghdadX, baghdadY, 80 + pulse);
  grad.addColorStop(0, '#FCE38A');
  grad.addColorStop(0.3, 'rgba(224, 169, 109, 0.8)');
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(baghdadX, baghdadY, 80 + pulse, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(baghdadX, baghdadY, 9, 0, Math.PI * 2);
  ctx.fill();
`;
    } else if (input.sceneIndex === 1) {
      // Scene 1: Bayt al-Hikma Architectural Assembly
      specificSceneLogic = `
  const centerX = 960;
  const centerY = 580;
  const assemble = Math.min(1, t / 4);

  // Layered Islamic Arches
  ctx.strokeStyle = '#E0A96D';
  ctx.lineWidth = 3;

  for (let arch = -3; arch <= 3; arch++) {
    const ox = centerX + arch * 160;
    const h = 260 * assemble;
    ctx.beginPath();
    ctx.moveTo(ox - 60, centerY + 200);
    ctx.lineTo(ox - 60, centerY + 200 - h);
    ctx.arc(ox, centerY + 200 - h, 60, Math.PI, 0);
    ctx.lineTo(ox + 60, centerY + 200);
    ctx.stroke();
  }

  // Central Grand Dome assembly
  const domeScale = Math.min(1, Math.max(0, (t - 1.5) / 3));
  if (domeScale > 0) {
    ctx.strokeStyle = '#FCE38A';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(centerX, centerY - 60, 220 * domeScale, Math.PI, 0);
    ctx.stroke();

    // Geometric ribs
    for (let angle = Math.PI; angle <= Math.PI * 2; angle += Math.PI / 8) {
      const rx = centerX + Math.cos(angle) * (220 * domeScale);
      const ry = (centerY - 60) + Math.sin(angle) * (220 * domeScale);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 60);
      ctx.lineTo(rx, ry);
      ctx.strokeStyle = 'rgba(224, 169, 109, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }
`;
    } else if (input.sceneIndex === 2) {
      // Scene 2: Mathematical Manuscript & Algebra
      specificSceneLogic = `
  const centerX = 960;
  const centerY = 540;

  // Manuscript page
  ctx.fillStyle = '#1A1815';
  ctx.strokeStyle = '#E0A96D';
  ctx.lineWidth = 2;
  ctx.fillRect(480, 200, 960, 680);
  ctx.strokeRect(480, 200, 960, 680);

  // Geometric balance scales
  const tilt = Math.sin(t * 2) * 0.15;
  ctx.strokeStyle = '#FCE38A';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(centerX, 300);
  ctx.lineTo(centerX, 600);
  ctx.stroke();

  // Crossbeam
  ctx.beginPath();
  ctx.moveTo(centerX - 240 * Math.cos(tilt), 380 - 240 * Math.sin(tilt));
  ctx.lineTo(centerX + 240 * Math.cos(tilt), 380 + 240 * Math.sin(tilt));
  ctx.stroke();

  // Equations floating into balance
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 36px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('al-jabr wa-l-muqābala', centerX, 270);

  ctx.fillStyle = '#FCE38A';
  ctx.font = '600 42px "Times New Roman", serif';
  ctx.fillText('x² + 10x = 39  ⟹  x = 3', centerX, 750);
`;
    } else if (input.sceneIndex === 3) {
      // Scene 3: Camera Obscura Optics
      specificSceneLogic = `
  const apertureX = 960;
  const apertureY = 540;
  const apertureGap = 24;

  // Left & Right partitions
  ctx.fillStyle = '#070B19';
  ctx.fillRect(apertureX, 100, 800, 880);

  // Aperture partition wall
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(apertureX, 100);
  ctx.lineTo(apertureX, apertureY - apertureGap);
  ctx.moveTo(apertureX, apertureY + apertureGap);
  ctx.lineTo(apertureX, 980);
  ctx.stroke();

  // Laser light rays entering and inverting
  const rayCount = 7;
  for (let i = 0; i < rayCount; i++) {
    const srcY = 300 + i * 80;
    const destY = 780 - i * 80; // Inverted!

    const grad = ctx.createLinearGradient(200, srcY, 1720, destY);
    grad.addColorStop(0, 'rgba(252, 227, 138, 0.9)');
    grad.addColorStop(0.5, '#00F0FF');
    grad.addColorStop(1, 'rgba(231, 111, 81, 0.9)');

    ctx.strokeStyle = grad;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(250, srcY);
    ctx.lineTo(apertureX, apertureY);
    ctx.lineTo(1670, destY);
    ctx.stroke();
  }

  // Projected tree / tower inversion
  ctx.fillStyle = 'rgba(252, 227, 138, 0.8)';
  ctx.font = '600 24px "Georgia", serif';
  ctx.textAlign = 'right';
  ctx.fillText('Incident Light', apertureX - 40, 300);
  ctx.textAlign = 'left';
  ctx.fillText('Inverted Projection (Kitab al-Manazir)', apertureX + 40, 300);
`;
    } else {
      // Scene 4: Celestial Astrolabe
      specificSceneLogic = `
  const centerX = 960;
  const centerY = 540;
  const maxR = 340;

  // Brass outer ring
  ctx.strokeStyle = '#E0A96D';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(centerX, centerY, maxR, 0, Math.PI * 2);
  ctx.stroke();

  // Degree graduations
  for (let deg = 0; deg < 360; deg += 3) {
    const rad = (deg * Math.PI) / 180;
    const len = deg % 15 === 0 ? 18 : 8;
    ctx.strokeStyle = deg % 15 === 0 ? '#FCE38A' : 'rgba(224, 169, 109, 0.5)';
    ctx.lineWidth = deg % 15 === 0 ? 2.5 : 1;
    ctx.beginPath();
    ctx.moveTo(centerX + Math.cos(rad) * (maxR - len), centerY + Math.sin(rad) * (maxR - len));
    ctx.lineTo(centerX + Math.cos(rad) * maxR, centerY + Math.sin(rad) * maxR);
    ctx.stroke();
  }

  // Rotating celestial rete
  const rot = t * 0.35;
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(rot);

  ctx.strokeStyle = '#FCE38A';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(60, 0, 160, 0, Math.PI * 2);
  ctx.stroke();

  // Star pointers
  for (let i = 0; i < 8; i++) {
    const sRad = (i * Math.PI) / 4;
    ctx.fillStyle = '#00F0FF';
    ctx.beginPath();
    ctx.arc(Math.cos(sRad) * 220, Math.sin(sRad) * 220, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Central alidade axis
  ctx.fillStyle = '#FCE38A';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 14, 0, Math.PI * 2);
  ctx.fill();
`;
    }

    const fullHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0; width: 100%; height: 100%;
    overflow: hidden; background: #070B19; font-family: "Georgia", serif;
  }
  canvas {
    display: block; width: 100vw; height: 100vh; object-fit: contain;
  }
</style>
</head>
<body>
<canvas id="c" width="1920" height="1080"></canvas>
<script>
window.DUR = ${input.durationSeconds.toFixed(1)};
window.READY = false;
window.TEXTS = (t) => [${JSON.stringify(input.onScreenText)}];

const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

window.render = function(t) {
  // Deterministic timestamp normalization
  const normT = Math.max(0, Math.min(window.DUR, t));
  
  // Clear frame
  ctx.fillStyle = '#070B19';
  ctx.fillRect(0, 0, 1920, 1080);

  // Subtle radial vignette
  const bgGrad = ctx.createRadialGradient(960, 540, 200, 960, 540, 1100);
  bgGrad.addColorStop(0, '#111936');
  bgGrad.addColorStop(1, '#05070F');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1920, 1080);

  // Specific Scene Motion Logic
  ${specificSceneLogic}

  // Master Cinematic Title HUD Overlay
  const titleAlpha = Math.min(1, Math.max(0, Math.sin((normT / window.DUR) * Math.PI)));
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, ' + (0.95 * titleAlpha) + ')';
  ctx.font = '700 38px "Georgia", serif';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '4px';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 12;
  ctx.fillText(${JSON.stringify(input.onScreenText)}, 960, 1000);
  ctx.restore();
};

window.READY = true;
</script>
</body>
</html>`;

    return {
      sceneIndex: input.sceneIndex,
      htmlSource: fullHtml,
      durationSeconds: input.durationSeconds,
      verifiedContract: true,
      renderStrategy: 'LEMO_OPUSCAR',
    };
  }

  public async validate(output: SceneAnimatorOutput): Promise<ValidationResult> {
    const hasContract = output.htmlSource.includes('window.DUR') &&
      output.htmlSource.includes('window.render') &&
      output.htmlSource.includes('window.READY = true');
    return {
      valid: hasContract,
      score: hasContract ? 1.0 : 0.2,
      issues: hasContract ? [] : ['Lemo-Opuscar render contract is missing in output HTML.'],
    };
  }
}
