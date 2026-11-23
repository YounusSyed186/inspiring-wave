/**
 * Semantic Highlight Analyzer & Highlight Ranking Engine
 */

import { GeminiClient, defaultGeminiClient } from '../../../integrations/gemini/src/client';
import { CLIPPING_PROMPTS } from '../../../packages/prompts/src/index';
import { TranscriptSegment, ClipCandidate, ClipScore } from '../../../packages/shared-types/src/index';

export class HighlightRankingEngine {
  private gemini: GeminiClient;

  constructor(geminiClient?: GeminiClient) {
    this.gemini = geminiClient || defaultGeminiClient;
  }

  public async analyzeHighlights(
    sourceVideoId: string,
    channelId: string,
    segments: TranscriptSegment[],
    options: {
      minClipDurationSeconds?: number;
      maxClipDurationSeconds?: number;
      maxCandidates?: number;
    } = {}
  ): Promise<ClipCandidate[]> {
    const {
      minClipDurationSeconds = 15,
      maxClipDurationSeconds = 60,
      maxCandidates = 5
    } = options;

    if (segments.length === 0) {
      return [];
    }

    // Format concise transcript summary with timestamps for Gemini
    const summary = segments
      .map((s) => `[${s.start_time_seconds.toFixed(1)}s - ${s.end_time_seconds.toFixed(1)}s]: ${s.text}`)
      .join('\n')
      .slice(0, 15000); // Guard token window

    const prompt = CLIPPING_PROMPTS.ANALYZE_HIGHLIGHTS(summary, `${minClipDurationSeconds}-${maxClipDurationSeconds} seconds`);

    const { data: rawCandidates } = await this.gemini.generateStructured<any[]>(prompt);

    const candidates: ClipCandidate[] = [];

    for (const raw of rawCandidates || []) {
      const start = Math.max(0, parseFloat(raw.start_time_seconds) || 0);
      const end = parseFloat(raw.end_time_seconds) || (start + 30);
      const duration = end - start;

      if (duration < minClipDurationSeconds || duration > maxClipDurationSeconds + 10) {
        continue;
      }

      // Editorial heuristic scoring formula
      const hookStrength = Math.min(1.0, Math.max(0.0, raw.hook_strength ?? 0.8));
      const contentValue = Math.min(1.0, Math.max(0.0, raw.content_value ?? 0.8));
      const completeness = Math.min(1.0, Math.max(0.0, raw.narrative_completeness ?? 0.8));
      const audienceRelevance = Math.min(1.0, Math.max(0.0, raw.audience_relevance ?? 0.8));
      const clarity = Math.min(1.0, Math.max(0.0, raw.clarity ?? 0.8));
      const visualSuitability = Math.min(1.0, Math.max(0.0, raw.visual_suitability ?? 0.8));
      const novelty = Math.min(1.0, Math.max(0.0, raw.novelty ?? 0.7));

      // Weighted composite score
      const compositeScore =
        hookStrength * 0.20 +
        contentValue * 0.20 +
        completeness * 0.20 +
        audienceRelevance * 0.15 +
        clarity * 0.10 +
        visualSuitability * 0.10 +
        novelty * 0.05;

      const score: ClipScore = {
        hook_strength: hookStrength,
        content_value: contentValue,
        narrative_completeness: completeness,
        audience_relevance: audienceRelevance,
        clarity,
        visual_suitability: visualSuitability,
        novelty,
        composite_score: Math.round(compositeScore * 1000) / 1000,
        scoring_rationale: raw.scoring_rationale || ''
      };

      candidates.push({
        id: `cand_${sourceVideoId}_${Math.round(start)}`,
        source_video_id: sourceVideoId,
        channel_id: channelId,
        start_time_seconds: start,
        end_time_seconds: end,
        duration_seconds: duration,
        topic: raw.topic || 'Highlight Moment',
        opening_hook: raw.opening_hook || '',
        summary: raw.summary || '',
        suggested_title: raw.suggested_title || 'Compelling Clip',
        suitability_assessment: raw.scoring_rationale,
        score
      });
    }

    // Deduplicate overlapping candidate segments (>60% time overlap)
    const sorted = candidates.sort((a, b) => (b.score?.composite_score || 0) - (a.score?.composite_score || 0));
    const nonOverlapping: ClipCandidate[] = [];

    for (const cand of sorted) {
      const overlaps = nonOverlapping.some((chosen) => {
        const overlapStart = Math.max(cand.start_time_seconds, chosen.start_time_seconds);
        const overlapEnd = Math.min(cand.end_time_seconds, chosen.end_time_seconds);
        const overlapDuration = Math.max(0, overlapEnd - overlapStart);
        return overlapDuration > Math.min(cand.duration_seconds, chosen.duration_seconds) * 0.5;
      });

      if (!overlaps) {
        nonOverlapping.push(cand);
        if (nonOverlapping.length >= maxCandidates) break;
      }
    }

    return nonOverlapping;
  }
}

export const defaultHighlightEngine = new HighlightRankingEngine();
