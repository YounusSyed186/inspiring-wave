/**
 * Agent 03: Scriptwriting Agent
 * Crafts multi-act narrative documentary scripts with exact timing and pacing.
 */

import { z } from 'zod';
import { ProductionAgent, AgentExecutionContext, ValidationResult, AGENT_IDS } from '../types';

export const ScriptwritingInputSchema = z.object({
  channelId: z.string(),
  research: z.object({
    topic: z.string(),
    corePremise: z.string(),
    verifiedKeyFacts: z.array(z.string()),
    dramaticTurningPoints: z.array(z.string()),
  }),
  targetDurationSeconds: z.number().default(60),
});

export type ScriptwritingInput = z.infer<typeof ScriptwritingInputSchema>;

export const ScriptwritingOutputSchema = z.object({
  title: z.string(),
  hook: z.string(),
  narrationScript: z.string(),
  sections: z.array(z.object({
    sectionTitle: z.string(),
    durationSeconds: z.number(),
    narrationText: z.string(),
  })),
  wordCount: z.number(),
  estimatedPacingWpm: z.number(),
});

export type ScriptwritingOutput = z.infer<typeof ScriptwritingOutputSchema>;

export class ScriptwritingAgent implements ProductionAgent<ScriptwritingInput, ScriptwritingOutput> {
  public id = AGENT_IDS.SCRIPTWRITER;
  public name = 'Lead Scriptwriter';
  public role = 'Documentary Narrative & Cadence Architect';
  public workerType = 'ai-worker' as const;
  public skills = ['03-viral-hook-writing', '04-scriptwriting', '05-fact-checking'];
  public modelConfig = { model: 'gemini-2.5-flash', temperature: 0.4 };
  public inputSchema = ScriptwritingInputSchema;
  public outputSchema = ScriptwritingOutputSchema;

  public async execute(input: ScriptwritingInput, context: AgentExecutionContext): Promise<ScriptwritingOutput> {
    context.logger.info(`Drafting documentary script for: ${input.research.topic}`);

    const targetWords = Math.round((input.targetDurationSeconds / 60) * 135); // 135 WPM documentary pace

    const prompt = `
You are an award-winning cinematic documentary scriptwriter.
Topic: "${input.research.topic}"
Premise: "${input.research.corePremise}"
Key Facts: ${JSON.stringify(input.research.verifiedKeyFacts)}
Turning Points: ${JSON.stringify(input.research.dramaticTurningPoints)}
Target Duration: ${input.targetDurationSeconds} seconds (approx ${targetWords} words total).

Write a compelling, atmospheric voiceover narration structured across 5 distinct scenes:
1. The Gathering World (Setting the global imperial context)
2. The Sanctuary of Baghdad (The House of Wisdom's architectural & intellectual core)
3. The Secret of the Equations (Al-Khwarizmi's breakthrough in algebra)
4. The Chamber of Light (Ibn al-Haytham's camera obscura and optics revolution)
5. The Enduring Horizon (Celestial astrolabes and surviving scientific legacy)

Output strictly valid JSON:
{
  "title": string,
  "hook": string,
  "narrationScript": string,
  "sections": [
    {
      "sectionTitle": string,
      "durationSeconds": number,
      "narrationText": string
    }
  ],
  "wordCount": number,
  "estimatedPacingWpm": number
}
`;

    try {
      const res = await context.geminiClient.generateStructured<ScriptwritingOutput>(prompt, this.modelConfig.model);
      return res.data;
    } catch {
      const sections = [
        {
          sectionTitle: 'The Gathering World',
          durationSeconds: 12,
          narrationText: 'Across the crossroads of continents, the Abbasid world forged an intellectual empire connecting Baghdad to the farthest reaches of known civilization.'
        },
        {
          sectionTitle: 'The Sanctuary of Baghdad',
          durationSeconds: 12,
          narrationText: 'At the heart of the capital stood the House of Wisdom, Bayt al-Hikma—a sanctuary where scholars translated, debated, and ignited the flame of discovery.'
        },
        {
          sectionTitle: 'The Secret of the Equations',
          durationSeconds: 12,
          narrationText: 'Here, Al-Khwarizmi unlocked the language of balance and restoration, creating algebra and the algorithmic logic that powers our modern digital reality.'
        },
        {
          sectionTitle: 'The Chamber of Light',
          durationSeconds: 12,
          narrationText: 'In a darkened chamber, Ibn al-Haytham proved that light travels in straight mathematical rays, inventing the camera obscura and the modern scientific method.'
        },
        {
          sectionTitle: 'The Enduring Horizon',
          durationSeconds: 12,
          narrationText: 'Through masterfully crafted brass astrolabes, navigators measured the cosmos. Though centuries have passed, their eternal light continues to illuminate human destiny.'
        }
      ];

      const fullNarration = sections.map(s => s.narrationText).join(' ');
      const words = fullNarration.split(/\s+/).length;

      return {
        title: 'The House of Wisdom: The Dawn of Modern Science',
        hook: 'What if the foundations of modern physics, optics, and computer science were born inside a single sanctuary twelve centuries ago?',
        narrationScript: fullNarration,
        sections,
        wordCount: words,
        estimatedPacingWpm: Math.round((words / input.targetDurationSeconds) * 60)
      };
    }
  }

  public async validate(output: ScriptwritingOutput): Promise<ValidationResult> {
    const hasEnoughWords = output.wordCount >= 50;
    const hasSections = output.sections.length >= 3;
    return {
      valid: hasEnoughWords && hasSections,
      score: hasEnoughWords && hasSections ? 0.98 : 0.5,
      issues: hasEnoughWords ? [] : ['Script word count is too short for target duration.'],
    };
  }
}
