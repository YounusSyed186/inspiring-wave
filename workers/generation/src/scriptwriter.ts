/**
 * Scriptwriting Agent
 * Crafts engaging, multi-act YouTube narration scripts tailored to channel narrative style
 */

import { GeminiClient, defaultGeminiClient } from '../../../integrations/gemini/src/client';
import { SCRIPT_PROMPTS } from '../../../packages/prompts/src/index';
import { Script } from '../../../packages/shared-types/src/index';

export interface ScriptRequest {
  channelId: string;
  topic: string;
  narrativeStyle?: 'chronological' | 'problem-solution' | 'story-driven' | 'analytical';
  targetDurationSeconds?: number;
  writingTone?: string;
  ideaId?: string;
}

export class ScriptwritingAgent {
  private gemini: GeminiClient;

  constructor(geminiClient?: GeminiClient) {
    this.gemini = geminiClient || defaultGeminiClient;
  }

  public async writeScript(request: ScriptRequest): Promise<Script> {
    const {
      channelId,
      topic,
      narrativeStyle = 'chronological',
      targetDurationSeconds = 60,
      writingTone = 'Informative, engaging, and authoritative',
      ideaId
    } = request;

    const prompt = SCRIPT_PROMPTS.WRITE_SCRIPT(topic, narrativeStyle, targetDurationSeconds, writingTone);

    const { data: rawScript } = await this.gemini.generateStructured<any>(prompt);

    const script: Script = {
      id: `script_${Date.now()}`,
      channel_id: channelId,
      idea_id: ideaId,
      title: rawScript.title || topic,
      title_options: Array.isArray(rawScript.title_options) ? rawScript.title_options : [rawScript.title || topic],
      hook: rawScript.hook || '',
      introduction: rawScript.introduction || '',
      narrative_outline: Array.isArray(rawScript.narrative_outline) ? rawScript.narrative_outline : [],
      full_narration_script: rawScript.full_narration_script || '',
      conclusion: rawScript.conclusion || '',
      call_to_action: rawScript.call_to_action || '',
      target_duration_seconds: targetDurationSeconds,
      current_version: 1,
      status: 'draft'
    };

    if (!script.full_narration_script.trim()) {
      throw new Error('Script generation returned an empty narration body.');
    }

    return script;
  }
}
