/**
 * Storyboard Director
 * Decomposes narration scripts into structured visual scenes and animation instructions
 */

import { GeminiClient, defaultGeminiClient } from '../../../integrations/gemini/src/client';
import { STORYBOARD_PROMPTS } from '../../../packages/prompts/src/index';
import { StoryboardScene } from '../../../packages/shared-types/src/index';

export interface StoryboardRequest {
  scriptId: string;
  channelId: string;
  scriptText: string;
  defaultStyle?: string;
  targetDurationSeconds?: number;
}

export class StoryboardDirector {
  private gemini: GeminiClient;

  constructor(geminiClient?: GeminiClient) {
    this.gemini = geminiClient || defaultGeminiClient;
  }

  public async createStoryboard(request: StoryboardRequest): Promise<StoryboardScene[]> {
    const { scriptId, scriptText, defaultStyle = 'impasto' } = request;

    const prompt = STORYBOARD_PROMPTS.GENERATE_SCENES(scriptText, defaultStyle);
    const { data: rawScenes } = await this.gemini.generateStructured<any[]>(prompt);

    const scenes: StoryboardScene[] = (rawScenes || []).map((s, idx) => ({
      id: `scene_${scriptId}_${idx + 1}`,
      storyboard_id: `sb_${scriptId}`,
      sequence_index: idx + 1,
      duration_seconds: typeof s.duration_seconds === 'number' ? s.duration_seconds : 5.0,
      narration_segment: s.narration_segment || '',
      visual_concept: s.visual_concept || 'Abstract visual background',
      animation_instructions: s.animation_instructions || 'Slow ambient movement',
      camera_movement: s.camera_movement || 'slow push-in',
      transition_in: s.transition_in || 'fade',
      transition_out: s.transition_out || 'fade',
      on_screen_text: s.on_screen_text || '',
      music_cue: s.music_cue || '',
      sound_effect_cue: s.sound_effect_cue || '',
      render_strategy: 'LEMO_OPUSCAR',
      style_slug: s.style_slug || defaultStyle
    }));

    if (scenes.length === 0) {
      throw new Error('Storyboard generation produced zero scenes.');
    }

    return scenes;
  }
}
