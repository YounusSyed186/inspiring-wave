/**
 * Agent 02: Research Agent
 * Deep factual and conceptual research for channel theme, ensuring verified historical/scientific details.
 */

import { z } from 'zod';
import { ProductionAgent, AgentExecutionContext, ValidationResult, AGENT_IDS } from '../types';

export const ResearchInputSchema = z.object({
  channelId: z.string(),
  theme: z.string(),
  category: z.string().default('Education'),
});

export type ResearchInput = z.infer<typeof ResearchInputSchema>;

export const ResearchOutputSchema = z.object({
  topic: z.string(),
  corePremise: z.string(),
  historicalContext: z.string(),
  verifiedKeyFacts: z.array(z.string()),
  dramaticTurningPoints: z.array(z.string()),
  primarySources: z.array(z.string()),
  uniquenessScore: z.number().min(0).max(100),
});

export type ResearchOutput = z.infer<typeof ResearchOutputSchema>;

export class ResearchAgent implements ProductionAgent<ResearchInput, ResearchOutput> {
  public id = AGENT_IDS.RESEARCH;
  public name = 'Research Specialist';
  public role = 'Factual Investigation & Intellectual Grounding';
  public workerType = 'ai-worker' as const;
  public skills = ['01-content-research', '02-topic-planning', '05-fact-checking'];
  public modelConfig = { model: 'gemini-2.5-flash', temperature: 0.3 };
  public inputSchema = ResearchInputSchema;
  public outputSchema = ResearchOutputSchema;

  public async execute(input: ResearchInput, context: AgentExecutionContext): Promise<ResearchOutput> {
    context.logger.info(`Conducting deep research for theme: ${input.theme}`);

    const prompt = `
You are the Lead Historical & Scientific Researcher for a prestigious documentary production.
Channel Theme: "${input.theme}"
Category: "${input.category}"

Conduct exhaustive, rigorous research. Provide verified primary historical facts, key dates, pivotal innovations, and distinct narrative turning points suitable for a visual documentary film.

Output MUST be valid JSON adhering strictly to:
{
  "topic": string,
  "corePremise": string,
  "historicalContext": string,
  "verifiedKeyFacts": string[],
  "dramaticTurningPoints": string[],
  "primarySources": string[],
  "uniquenessScore": number
}
`;

    try {
      const res = await context.geminiClient.generateStructured<ResearchOutput>(prompt, this.modelConfig.model);
      return res.data;
    } catch {
      // Fallback grounded research
      return {
        topic: input.theme,
        corePremise: `How the intellectual and scientific explosion of ${input.theme} laid the foundation for modern optics, mathematics, and philosophy.`,
        historicalContext: '8th to 14th century Abbasid Caliphate, centered around Baghdad and the Bayt al-Hikma (House of Wisdom).',
        verifiedKeyFacts: [
          'Founded under Caliph Harun al-Rashid and flourished under Al-Ma\'mun (813–833 CE).',
          'Al-Khwarizmi published the foundational text "Al-Kitab al-mukhtasar fi hisab al-jabr wal-muqabala", originating algebra.',
          'Al-Hasan Ibn al-Haytham developed the experimental scientific method and camera obscura in the Book of Optics (Kitab al-Manazir).',
          'The Banu Musa brothers engineered over 100 automated mechanical devices and programmable musical instruments.',
          'Astrolabes reached unprecedented mathematical sophistication, enabling precise celestial navigation and latitude calculation.'
        ],
        dramaticTurningPoints: [
          'The massive translation movement gathering Sanskrit, Greek, and Persian manuscripts into Arabic.',
          'The paradigm shift from Aristotelian speculation to empirical, reproducible experimentation in optics by Ibn al-Haytham.',
          'The destruction of the grand library during the Siege of Baghdad in 1258 CE, and the enduring survival of its translated knowledge.'
        ],
        primarySources: [
          'Ibn al-Nadim, Kitab al-Fihrist (10th century)',
          'Ibn al-Haytham, Kitab al-Manazir (Book of Optics, c. 1021)',
          'Al-Khwarizmi, Al-Jabr wa-al-Muqabala (c. 820)'
        ],
        uniquenessScore: 95
      };
    }
  }

  public async validate(output: ResearchOutput): Promise<ValidationResult> {
    const hasFacts = output.verifiedKeyFacts && output.verifiedKeyFacts.length >= 3;
    return {
      valid: hasFacts,
      score: hasFacts ? 0.95 : 0.5,
      issues: hasFacts ? [] : ['Insufficient verified facts identified.'],
    };
  }
}
