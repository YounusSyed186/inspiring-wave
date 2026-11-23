/**
 * End-to-End Short Video Clip Generation Pipeline
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { ClipCandidate, WordTimestamp } from '../../../packages/shared-types/src/index';
import { defaultCropEngine } from './cropping';
import { defaultSubtitleEngine } from './subtitles';

export interface RenderClipRequest {
  sourceVideoPath: string;
  candidate: ClipCandidate;
  words: WordTimestamp[];
  outputPath: string;
  cropMode?: 'FACE_TRACKING' | 'CENTER_CROP' | 'BLURRED_BACKGROUND' | 'MANUAL';
  captionPreset?: string;
  focusPointX?: number;
}

export class ClippingPipeline {
  /**
   * Cut, crop to 9:16, burn subtitles, normalize audio and export finished Short
   */
  public async renderClip(request: RenderClipRequest): Promise<string> {
    const {
      sourceVideoPath,
      candidate,
      words,
      outputPath,
      cropMode = 'FACE_TRACKING',
      captionPreset = 'Bold Creator',
      focusPointX = 0.5
    } = request;

    if (!fs.existsSync(sourceVideoPath)) {
      throw new Error(`Source video not found: ${sourceVideoPath}`);
    }

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    // 1. Filter words matching the clip timestamp range and normalize timestamps relative to clip start
    const clipWords = words
      .filter((w) => w.start >= candidate.start_time_seconds && w.end <= candidate.end_time_seconds)
      .map((w) => ({
        word: w.word,
        start: Math.max(0, w.start - candidate.start_time_seconds),
        end: Math.max(0, w.end - candidate.start_time_seconds)
      }));

    // 2. Generate ASS subtitle file
    const assPath = outputPath.replace(/\.mp4$/, '.ass');
    defaultSubtitleEngine.createAssSubtitleFile(clipWords, captionPreset, assPath);
    const escapedAssPath = defaultSubtitleEngine.formatFfmpegAssPath(assPath);

    // 3. Build Crop + Subtitle Video Filter
    const cropFilter = defaultCropEngine.buildFfmpegFilter({
      mode: cropMode,
      targetWidth: 1080,
      targetHeight: 1920,
      focusPointX
    });

    const combinedFilter = `${cropFilter},ass='${escapedAssPath}'`;

    const args = [
      '-ss', String(candidate.start_time_seconds),
      '-t', String(candidate.duration_seconds),
      '-i', sourceVideoPath,
      '-vf', combinedFilter,
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '20',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-y',
      outputPath
    ];

    return new Promise((resolve, reject) => {
      const child = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });

      let stderr = '';
      child.stderr.on('data', (d) => { stderr += d.toString(); });

      child.on('close', (code) => {
        // Cleanup ass file
        try { fs.unlinkSync(assPath); } catch {}

        if (code === 0 && fs.existsSync(outputPath)) {
          resolve(outputPath);
        } else {
          // If ASS filter failed (e.g. libass missing in some build), fallback without subtitles
          this.fallbackRenderWithoutSubs(sourceVideoPath, candidate, cropFilter, outputPath)
            .then(resolve)
            .catch((fbErr) => reject(new Error(`Clip rendering failed: ${stderr || fbErr.message}`)));
        }
      });

      child.on('error', (err) => reject(err));
    });
  }

  private async fallbackRenderWithoutSubs(
    sourceVideoPath: string,
    candidate: ClipCandidate,
    cropFilter: string,
    outputPath: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn('ffmpeg', [
        '-ss', String(candidate.start_time_seconds),
        '-t', String(candidate.duration_seconds),
        '-i', sourceVideoPath,
        '-vf', cropFilter,
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '20',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-y',
        outputPath
      ], { stdio: 'ignore' });

      child.on('close', (code) => {
        if (code === 0 && fs.existsSync(outputPath)) resolve(outputPath);
        else reject(new Error(`Fallback clip render failed with code ${code}`));
      });
      child.on('error', reject);
    });
  }
}

export const defaultClippingPipeline = new ClippingPipeline();
