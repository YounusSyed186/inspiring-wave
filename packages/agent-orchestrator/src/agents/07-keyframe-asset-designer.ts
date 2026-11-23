/**
 * Agent 07: Keyframe & Asset Designer
 * Plans, stages and specifies 2D/3D visual assets, vector SVG coordinates, and procedural color schemes for each scene.
 */

import { z } from 'zod';
import { ProductionAgent, AgentExecutionContext, ValidationResult, AGENT_IDS } from '../types';

export const KeyframeAssetInputSchema = z.object({
  sceneIndex: z.number(),
  visualConcept: z.string(),
  styleSlug: z.string(),
  motionLayers: z.array(z.string()),
});

export type KeyframeAssetInput = z.infer<typeof KeyframeAssetInputSchema>;

export const KeyframeAssetOutputSchema = z.object({
  sceneIndex: z.number(),
  vectorAssets: z.array(z.object({
    name: string(),
    type: z.enum(['svg_path', 'canvas_primitive', 'procedural_shader', 'webgl_mesh']),
    spec: z.string(),
  })),
  colorTokens: z.record(z.string()),
  layoutBounds: z.object({
    width: z.number(),
    height: z.number(),
    safeZoneMargin: z.number(),
  }),
});

export type KeyframeAssetOutput = z.infer<typeof KeyframeAssetOutputSchema>;

function string() {
  return z.string();
}

export class KeyframeAssetDesignerAgent implements ProductionAgent<KeyframeAssetInput, KeyframeAssetOutput> {
  public id = AGENT_IDS.KEYFRAME_ASSET_DESIGNER;
  public name = 'Keyframe & Asset Designer';
  public role = 'Asset Schematics & Vector Composition';
  public workerType = 'ai-worker' as const;
  public skills = ['08-motion-graphics-design', '10-scene-asset-planning'];
  public modelConfig = { model: 'gemini-2.5-flash', temperature: 0.2 };
  public inputSchema = KeyframeAssetInputSchema;
  public outputSchema = KeyframeAssetOutputSchema;

  public async execute(input: KeyframeAssetInput, context: AgentExecutionContext): Promise<KeyframeAssetOutput> {
    context.logger.info(`Designing assets for Scene #${input.sceneIndex}`);

    return {
      sceneIndex: input.sceneIndex,
      vectorAssets: [
        {
          name: 'background_canvas',
          type: 'canvas_primitive',
          spec: 'radial_gradient(#111936, #070B19)'
        },
        {
          name: 'primary_geometric_subject',
          type: 'canvas_primitive',
          spec: 'procedural_vector_paths'
        },
        {
          name: 'typography_hud',
          type: 'canvas_primitive',
          spec: 'crisp_serif_centered'
        }
      ],
      colorTokens: {
        bgDeep: '#070B19',
        bgMid: '#111936',
        goldAccent: '#E0A96D',
        goldLight: '#FCE38A',
        cyanGlow: '#00F0FF',
        textWhite: '#FFFFFF',
        textMuted: '#94A3B8'
      },
      layoutBounds: {
        width: 1920,
        height: 1080,
        safeZoneMargin: 96
      }
    };
  }

  public async validate(output: KeyframeAssetOutput): Promise<ValidationResult> {
    return {
      valid: output.vectorAssets.length > 0,
      score: 1.0,
      issues: [],
    };
  }
}
