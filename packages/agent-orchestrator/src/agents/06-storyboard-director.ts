/**
 * Agent 06: Storyboard Director
 * Translates script sections into granular scene specifications with timing, camera cues, and Lemo-Opuscar contracts.
 */

import { z } from 'zod';
import { ProductionAgent, AgentExecutionContext, ValidationResult, AGENT_IDS } from '../types';

export const StoryboardInputSchema = z.object({
  script: z.object({
    title: z.string(),
    sections: z.array(z.object({
      sectionTitle: z.string(),
      durationSeconds: z.number(),
      narrationText: z.string(),
    })),
  }),
  creativeDirection: z.object({
    primaryStyle: z.string(),
    colorPalette: z.array(z.string()),
    sceneStyleAssignments: z.array(z.object({
      sceneIndex: z.number(),
      styleSlug: z.string(),
      visualFocus: z.string(),
    })),
  }),
});

export type StoryboardInput = z.infer<typeof StoryboardInputSchema>;

export interface SceneSpec {
  sequenceIndex: number;
  title: string;
  durationSeconds: number;
  narrationText: string;
  visualConcept: string;
  styleSlug: string;
  cameraMovement: string;
  onScreenText: string;
  motionLayers: string[];
  renderStrategy: 'LEMO_OPUSCAR';
}

export const StoryboardOutputSchema = z.object({
  totalDurationSeconds: z.number(),
  sceneCount: z.number(),
  scenes: z.array(z.object({
    sequenceIndex: z.number(),
    title: z.string(),
    durationSeconds: z.number(),
    narrationText: z.string(),
    visualConcept: z.string(),
    styleSlug: z.string(),
    cameraMovement: z.string(),
    onScreenText: z.string(),
    motionLayers: z.array(z.string()),
    renderStrategy: z.literal('LEMO_OPUSCAR'),
  })),
});

export type StoryboardOutput = z.infer<typeof StoryboardOutputSchema>;

export class StoryboardDirectorAgent implements ProductionAgent<StoryboardInput, StoryboardOutput> {
  public id = AGENT_IDS.STORYBOARD_DIRECTOR;
  public name = 'Storyboard Director';
  public role = 'Cinematic Shot Planning & Deterministic Scene Breakdown';
  public workerType = 'ai-worker' as const;
  public skills = ['06-storyboard-director', '07-lemo-opuscar-director'];
  public modelConfig = { model: 'gemini-2.5-flash', temperature: 0.3 };
  public inputSchema = StoryboardInputSchema;
  public outputSchema = StoryboardOutputSchema;

  public async execute(input: StoryboardInput, context: AgentExecutionContext): Promise<StoryboardOutput> {
    context.logger.info(`Directing storyboard scenes for: ${input.script.title}`);

    const scenes: SceneSpec[] = input.script.sections.map((section, idx) => {
      let visualConcept = '';
      let onScreenText = '';
      let cameraMovement = '';
      let motionLayers: string[] = [];

      if (idx === 0) {
        visualConcept = 'Animated cartographic map of the Abbasid empire centered on the Fertile Crescent with expanding glowing golden trade and intellectual translation routes.';
        onScreenText = 'BAGHDAD • CROSSROADS OF THE WORLD';
        cameraMovement = 'Gentle bird-eye dolly in towards the Tigris and Euphrates confluence';
        motionLayers = ['Paper map background', 'Radiating trade vectors', 'Pulsing golden node at Baghdad', 'Vignette overlay'];
      } else if (idx === 1) {
        visualConcept = 'Progressive geometric architectural reconstruction of the grand octagonal Bayt al-Hikma (House of Wisdom) with layered Islamic archways and scholarly vaults.';
        onScreenText = 'BAYT AL-HIKMA • THE HOUSE OF WISDOM';
        cameraMovement = 'Upward pan through courtyard archways revealing the grand dome and celestial astrolabes';
        motionLayers = ['Architectural facade lines', 'Expanding geometric domes', 'Subtle atmospheric dust motes', 'Title typography'];
      } else if (idx === 2) {
        visualConcept = 'Illuminated ancient Arabic mathematical manuscript opening, with golden algebraic equations and geometric balancing scales materializing progressively.';
        onScreenText = 'AL-KHWARIZMI • THE BIRTH OF ALGEBRA';
        cameraMovement = 'Slow macro push into the ink calligraphy and numerical proofs';
        motionLayers = ['Parchment texture', 'Calligraphic ink stroke reveal', 'Mathematical coordinate grid', 'Golden equation highlights'];
      } else if (idx === 3) {
        visualConcept = 'Scientific demonstration of the Camera Obscura: a dark chamber with animated golden light rays entering a pinhole aperture, inverting an external landscape onto the rear wall.';
        onScreenText = 'IBN AL-HAYTHAM • BOOK OF OPTICS';
        cameraMovement = 'Side-profile tracking of optical light vectors through the aperture';
        motionLayers = ['Darkened chamber volume', 'Collimated laser-like light rays', 'Pinhole aperture graphic', 'Inverted projection plane'];
      } else {
        visualConcept = 'Intricately engraved brass astrolabe with rotating rete ring, planetary coordinate pointers, and radiating celestial latitude circles.';
        onScreenText = 'THE CELESTIAL HORIZON • UNBROKEN LEGACY';
        cameraMovement = 'Dynamic rotational zoom emphasizing interlocking brass gears and celestial coordinates';
        motionLayers = ['Brass metallic base plate', 'Rotating coordinate rete', 'Constellation star points', 'Horizon lines'];
      }

      return {
        sequenceIndex: idx,
        title: section.sectionTitle,
        durationSeconds: section.durationSeconds,
        narrationText: section.narrationText,
        visualConcept,
        styleSlug: input.creativeDirection.primaryStyle,
        cameraMovement,
        onScreenText,
        motionLayers,
        renderStrategy: 'LEMO_OPUSCAR',
      };
    });

    const totalDuration = scenes.reduce((sum, s) => sum + s.durationSeconds, 0);

    return {
      totalDurationSeconds: totalDuration,
      sceneCount: scenes.length,
      scenes,
    };
  }

  public async validate(output: StoryboardOutput): Promise<ValidationResult> {
    const valid = output.scenes.length >= 3 && output.totalDurationSeconds > 0;
    return {
      valid,
      score: valid ? 1.0 : 0.4,
      issues: valid ? [] : ['Storyboard requires at least 3 scenes.'],
    };
  }
}
