/**
 * Subtitle Generator and Video Burner
 */

import fs from 'fs';
import path from 'path';
import { WordTimestamp } from '../../../packages/shared-types/src/index';
import { SUBTITLE_PRESETS, SubtitlePreset, generateAssSubtitles } from '../../../packages/video-templates/src/index';

export class SubtitleEngine {
  /**
   * Create an ASS subtitle file from timestamped words
   */
  public createAssSubtitleFile(
    words: WordTimestamp[],
    presetName: string = 'Bold Creator',
    outputPath: string
  ): string {
    const preset: SubtitlePreset = SUBTITLE_PRESETS[presetName] || SUBTITLE_PRESETS['Bold Creator'];
    const content = generateAssSubtitles(words, preset, 1080, 1920);

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, content, 'utf8');
    return outputPath;
  }

  /**
   * Format ASS filename for FFmpeg filter path (handling Windows backslash escaping)
   */
  public formatFfmpegAssPath(assPath: string): string {
    return assPath.replace(/\\/g, '/').replace(/:/g, '\\:');
  }
}

export const defaultSubtitleEngine = new SubtitleEngine();
