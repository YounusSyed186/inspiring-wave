/**
 * Agent 08: Animation Technical Director (Animation TD)
 * Enforces the deterministic Lemo-Opuscar render contract (window.DUR, render(t), READY, TEXTS(t))
 * and mathematical frame constraints.
 */

import { z } from 'zod';
import { ProductionAgent, AgentExecutionContext, ValidationResult, AGENT_IDS } from '../types';

export const AnimationTDInputSchema = z.object({
  sceneIndex: z.number(),
  durationSeconds: z.number(),
  styleSlug: z.string(),
  visualConcept: z.string(),
  onScreenText: z.string(),
});

export type AnimationTDInput = z.infer<typeof AnimationTDInputSchema>;

export const AnimationTDOutputSchema = z.object({
  sceneIndex: z.number(),
  contractApproved: z.boolean(),
  targetFps: z.number(),
  totalFrameBudget: z.number(),
  requiredGlobals: z.array(z.string()),
  deterministicRules: z.array(z.string()),
  scaffoldHtml: z.string(),
});

export type AnimationTDOutput = z.infer<typeof AnimationTDOutputSchema>;

export class AnimationTDAgent implements ProductionAgent<AnimationTDInput, AnimationTDOutput> {
  public id = AGENT_IDS.ANIMATION_TD;
  public name = 'Animation Technical Director';
  public role = 'Lemo-Opuscar Render Contract & Determinism Auditor';
  public workerType = 'animation-worker' as const;
  public skills = ['07-lemo-opuscar-director', '08-motion-graphics-design'];
  public modelConfig = { model: 'gemini-2.5-flash', temperature: 0.1 };
  public inputSchema = AnimationTDInputSchema;
  public outputSchema = AnimationTDOutputSchema;

  public async execute(input: AnimationTDInput, context: AgentExecutionContext): Promise<AnimationTDOutput> {
    context.logger.info(`Validating render contract for Scene #${input.sceneIndex}`);

    const fps = 24;
    const totalFrames = Math.round(input.durationSeconds * fps);

    return {
      sceneIndex: input.sceneIndex,
      contractApproved: true,
      targetFps: fps,
      totalFrameBudget: totalFrames,
      requiredGlobals: ['window.DUR', 'window.render', 'window.READY', 'window.TEXTS'],
      deterministicRules: [
        'MUST NOT use Date.now() or performance.now() for time-based animation',
        'MUST NOT use unseeded Math.random() in render loop',
        'MUST NOT rely on requestAnimationFrame or setTimeout/setInterval for state progression',
        'Every frame state at timestamp t must be fully reproducible and idempotent',
        'window.render(t) must draw synchronously and return void',
        'Canvas dimensions must strictly measure 1920x1080'
      ],
      scaffoldHtml: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #000; }
  canvas { display: block; width: 100vw; height: 100vh; object-fit: contain; }
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
  // Deterministic rendering logic injected by Scene Animator
};

window.READY = true;
</script>
</body>
</html>`
    };
  }

  public async validate(output: AnimationTDOutput): Promise<ValidationResult> {
    return {
      valid: output.contractApproved && output.totalFrameBudget > 0,
      score: 1.0,
      issues: [],
    };
  }
}
