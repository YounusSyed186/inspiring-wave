/**
 * Agent 15: Publishing Agent
 * Generates SEO metadata, chapter timestamps, and manages YouTube publishing pipelines.
 */

import { z } from 'zod';
import { ProductionAgent, AgentExecutionContext, ValidationResult, AGENT_IDS } from '../types';

export const PublishingInputSchema = z.object({
  channelId: z.string(),
  title: z.string(),
  research: z.record(z.unknown()),
  scenes: z.array(z.object({
    title: z.string(),
    durationSeconds: z.number(),
  })),
  masterVideoPath: z.string(),
  thumbnailPath: z.string().optional(),
});

export type PublishingInput = z.infer<typeof PublishingInputSchema>;

export const PublishingOutputSchema = z.object({
  seoTitle: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  chapters: z.array(z.object({
    timestamp: z.string(),
    title: z.string(),
  })),
  readyForUpload: z.boolean(),
  status: z.enum(['prepared', 'published', 'scheduled']),
});

export type PublishingOutput = z.infer<typeof PublishingOutputSchema>;

export class PublishingAgent implements ProductionAgent<PublishingInput, PublishingOutput> {
  public id = AGENT_IDS.PUBLISHING;
  public name = 'Publishing Specialist';
  public role = 'YouTube SEO, Chapter Timestamps & Distribution Director';
  public workerType = 'ai-worker' as const;
  public skills = ['23-youtube-metadata', '24-youtube-publishing'];
  public modelConfig = { model: 'gemini-2.5-flash', temperature: 0.3 };
  public inputSchema = PublishingInputSchema;
  public outputSchema = PublishingOutputSchema;

  public async execute(input: PublishingInput, context: AgentExecutionContext): Promise<PublishingOutput> {
    context.logger.info(`Synthesizing YouTube metadata and chapters for: ${input.title}`);

    let currentSec = 0;
    const chapters = input.scenes.map((s) => {
      const mins = Math.floor(currentSec / 60);
      const secs = Math.floor(currentSec % 60);
      const timestamp = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      currentSec += s.durationSeconds;
      return { timestamp, title: s.title };
    });

    const description = `${input.title} — Discover the profound scientific, mathematical, and optical revolutions born in the Golden Age of Islamic civilization.

Timestamps:
${chapters.map(c => `${c.timestamp} - ${c.title}`).join('\n')}

#IslamicHistory #HouseOfWisdom #ScienceHistory #Mathematics #Optics #Documentary`;

    return {
      seoTitle: `${input.title} | The Forgotten Scientific Empire (Documentary)`,
      description,
      tags: ['Islamic History', 'House of Wisdom', 'Bayt al-Hikma', 'Al-Khwarizmi', 'Ibn al-Haytham', 'Algebra', 'Optics', 'Documentary'],
      chapters,
      readyForUpload: true,
      status: 'prepared',
    };
  }

  public async validate(output: PublishingOutput): Promise<ValidationResult> {
    return {
      valid: output.seoTitle.length > 10 && output.chapters.length > 0,
      score: 1.0,
      issues: [],
    };
  }
}
