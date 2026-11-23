/**
 * Content Research Agent
 * Formulates original, factual, and non-repetitive topic proposals based on channel theme
 */

import { GeminiClient, defaultGeminiClient } from '../../../integrations/gemini/src/client';
import { RESEARCH_PROMPTS } from '../../../packages/prompts/src/index';
import { ContentIdea } from '../../../packages/shared-types/src/index';

export interface ResearchRequest {
  channelId: string;
  theme: string;
  category: string;
  excludedTopics?: string[];
  historicalTopics?: string[];
}

export class ContentResearchAgent {
  private gemini: GeminiClient;

  constructor(geminiClient?: GeminiClient) {
    this.gemini = geminiClient || defaultGeminiClient;
  }

  public async researchTopics(request: ResearchRequest): Promise<ContentIdea[]> {
    const { channelId, theme, category, excludedTopics = [], historicalTopics = [] } = request;

    const allExclusions = [...new Set([...excludedTopics, ...historicalTopics])];
    const prompt = RESEARCH_PROMPTS.TOPIC_IDEATION(theme, category, allExclusions);

    const { data: rawProposals, usage } = await this.gemini.generateStructured<any[]>(prompt);

    const proposals: ContentIdea[] = (rawProposals || []).map((p, idx) => ({
      id: `idea_${Date.now()}_${idx}`,
      channel_id: channelId,
      topic: p.topic || 'Untitled Topic',
      audience: p.audience || 'General YouTube Audience',
      content_angle: p.content_angle || '',
      hook_options: Array.isArray(p.hook_options) ? p.hook_options : [],
      factual_claims: Array.isArray(p.factual_claims) ? p.factual_claims : [],
      uniqueness_score: typeof p.uniqueness_score === 'number' ? p.uniqueness_score : 0.85,
      channel_relevance_score: typeof p.channel_relevance_score === 'number' ? p.channel_relevance_score : 0.90,
      production_complexity: p.production_complexity || 'MEDIUM',
      status: 'proposed'
    }));

    // Filter out low relevance or duplicate proposals
    return proposals.filter((p) => p.uniqueness_score >= 0.70 && p.channel_relevance_score >= 0.75);
  }
}
