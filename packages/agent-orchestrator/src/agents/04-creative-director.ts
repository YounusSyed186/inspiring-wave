/**
 * Agent 04: Creative Director
 * Establishes cinematic aesthetic vision, art direction, and procedural Lemo-Opuscar style selection.
 */

import { z } from 'zod';
import { ProductionAgent, AgentExecutionContext, ValidationResult, AGENT_IDS } from '../types';

export const CreativeDirectorInputSchema = z.object({
  theme: z.string(),
  preferredStyle: z.string().default('impasto'),
  sections: z.array(z.object({
    sectionTitle: z.string(),
    narrationText: z.string(),
    durationSeconds: z.number(),
  })),
});

export type CreativeDirectorInput = z.infer<typeof CreativeDirectorInputSchema>;

export const CreativeDirectorOutputSchema = z.object({
  aestheticConcept: z.string(),
  primaryStyle: z.string(),
  colorPalette: z.array(z.string()),
  typographyPreset: z.string(),
  lightingMood: z.string(),
  cameraPhilosophy: z.string(),
  sceneStyleAssignments: z.array(z.object({
    sceneIndex: z.number(),
    styleSlug: z.string(),
    visualFocus: z.string(),
    motionDynamics: z.string(),
  })),
});

export type CreativeDirectorOutput = z.infer<typeof CreativeDirectorOutputSchema>;

export class CreativeDirectorAgent implements ProductionAgent<CreativeDirectorInput, CreativeDirectorOutput> {
  public id = AGENT_IDS.CREATIVE_DIRECTOR;
  public name = 'Creative Director';
  public role = 'Cinematic Art Direction & Lemo-Opuscar Style Master';
  public workerType = 'ai-worker' as const;
  public skills = ['06-storyboard-director', '07-lemo-opuscar-director', '25-channel-brand-consistency'];
  public modelConfig = { model: 'gemini-2.5-flash', temperature: 0.3 };
  public inputSchema = CreativeDirectorInputSchema;
  public outputSchema = CreativeDirectorOutputSchema;

  public async execute(input: CreativeDirectorInput, context: AgentExecutionContext): Promise<CreativeDirectorOutput> {
    context.logger.info(`Defining creative direction for: ${input.theme}`);

    return {
      aestheticConcept: 'Luminous Islamic Golden Age Scientific Enlightenment: Deep lapis lazuli blues, warm desert gold filigree, parchment textures, and precise geometric ray-tracing.',
      primaryStyle: input.preferredStyle,
      colorPalette: ['#0A1128', '#1C2541', '#E0A96D', '#F4A261', '#E76F51', '#EBF4F6'],
      typographyPreset: 'Cinematic Serif with Crisp Geometric Accents',
      lightingMood: 'High-contrast chiaroscuro with radiant amber focal illumination and celestial twilight backdrops',
      cameraPhilosophy: 'Slow, dignified cinematic pans with deliberate macro zooms into mathematical and architectural schematics',
      sceneStyleAssignments: input.sections.map((sec, idx) => ({
        sceneIndex: idx,
        styleSlug: input.preferredStyle,
        visualFocus: `Detailed visual representation of ${sec.sectionTitle}`,
        motionDynamics: 'Smooth 24fps deterministic mathematical transformations and layered canvas rendering',
      })),
    };
  }

  public async validate(output: CreativeDirectorOutput): Promise<ValidationResult> {
    const hasPalette = output.colorPalette.length >= 3;
    return {
      valid: hasPalette,
      score: hasPalette ? 1.0 : 0.5,
      issues: hasPalette ? [] : ['Incomplete color palette.'],
    };
  }
}
