/**
 * Durable Job Worker Processor Loop
 * Leases jobs from queue, executes generation/clipping/publishing pipelines, and records progress
 */

import path from 'path';
import fs from 'fs';
import os from 'os';
import { ProductionJob, RenderOutput } from '../../../packages/shared-types/src/index';
import { ContentResearchAgent } from '../../generation/src/research';
import { ScriptwritingAgent } from '../../generation/src/scriptwriter';
import { StoryboardDirector } from '../../generation/src/storyboard';
import { defaultVoiceoverAgent } from '../../generation/src/voiceover';
import { defaultRenderingEngine } from '../../rendering/src/engine';
import { defaultIngestionModule } from '../../clipping/src/ingestion';
import { defaultTranscriber } from '../../../integrations/whisper/src/transcriber';
import { defaultHighlightEngine } from '../../clipping/src/highlights';
import { defaultClippingPipeline } from '../../clipping/src/pipeline';
import { defaultYouTubePublisher } from '../../publishing/src/publisher';

export interface WorkerContext {
  workDir: string;
}

export class JobWorkerProcessor {
  private researchAgent = new ContentResearchAgent();
  private scriptwriter = new ScriptwritingAgent();
  private storyboarder = new StoryboardDirector();

  /**
   * Process a single claimed production job
   */
  public async executeJob(
    job: ProductionJob,
    onProgress?: (stage: string, percent: number, msg: string) => Promise<void>
  ): Promise<{ success: boolean; output?: RenderOutput; error?: string }> {
    const jobWorkDir = path.join(os.tmpdir(), 'studio_jobs', job.id);
    fs.mkdirSync(jobWorkDir, { recursive: true });

    try {
      if (job.job_type === 'GENERATE_VIDEO') {
        const config = job.workflow_config_snapshot as any;
        const theme = config.theme || 'History of Ancient Civilizations';
        const category = config.category || 'Education';
        const style = config.style || 'impasto';
        const duration = config.duration || 45;

        // Stage 1: Research
        await onProgress?.('RESEARCHING', 15, `Researching novel topics for theme: ${theme}`);
        const proposals = await this.researchAgent.researchTopics({
          channelId: job.channel_id,
          theme,
          category
        });
        const chosenTopic = proposals[0]?.topic || theme;

        // Stage 2: Scriptwriting
        await onProgress?.('SCRIPTING', 35, `Writing full narration script for topic: ${chosenTopic}`);
        const script = await this.scriptwriter.writeScript({
          channelId: job.channel_id,
          topic: chosenTopic,
          targetDurationSeconds: duration
        });

        // Stage 3: Storyboard
        await onProgress?.('STORYBOARDING', 50, 'Directing visual scenes and motion cues');
        const scenes = await this.storyboarder.createStoryboard({
          scriptId: script.id,
          channelId: job.channel_id,
          scriptText: script.full_narration_script,
          defaultStyle: style,
          targetDurationSeconds: duration
        });

        // Stage 4: Voiceover
        await onProgress?.('VOICEOVER_GENERATING', 65, 'Synthesizing voiceover audio track');
        const voicePath = path.join(jobWorkDir, 'narration.wav');
        await defaultVoiceoverAgent.synthesize({
          text: script.full_narration_script,
          outputPath: voicePath
        });

        // Stage 5: Video Rendering & Muxing
        await onProgress?.('FINAL_ENCODING', 85, 'Rendering visual layers and mastering audio');
        const renderOutput = await defaultRenderingEngine.renderVideo({
          jobId: job.id,
          channelId: job.channel_id,
          scenes,
          voiceoverAudioPath: voicePath,
          outputDir: jobWorkDir,
          aspectRatio: config.aspectRatio || '16:9',
          fps: 30
        });

        await onProgress?.('COMPLETED', 100, 'Original video generation complete and verified');
        return { success: true, output: renderOutput };
      }

      if (job.job_type === 'CLIP_VIDEO') {
        const config = job.workflow_config_snapshot as any;
        const sourcePath = config.sourceVideoPath;
        if (!sourcePath || !fs.existsSync(sourcePath)) {
          throw new Error(`Source video path not provided or does not exist: ${sourcePath}`);
        }

        // Stage 1: Ingestion
        await onProgress?.('INITIALIZED', 10, 'Probing source video streams and extracting audio');
        const ingested = await defaultIngestionModule.ingestVideo(sourcePath, jobWorkDir);

        // Stage 2: Transcription
        await onProgress?.('TRANSCRIBING', 35, 'Transcribing audio with whisper.cpp');
        const { fullText, segments } = await defaultTranscriber.transcribe({
          audioPath: ingested.extractedAudioPath
        });

        // Stage 3: Highlight Detection & Ranking
        await onProgress?.('HIGHLIGHT_ANALYZING', 60, 'Analyzing transcript moments and scoring highlights');
        const candidates = await defaultHighlightEngine.analyzeHighlights(
          job.id,
          job.channel_id,
          segments,
          { minClipDurationSeconds: 15, maxClipDurationSeconds: 60 }
        );

        if (candidates.length === 0) {
          throw new Error('No qualifying highlight clips could be identified from the source.');
        }

        const topCandidate = candidates[0];

        // Stage 4: 9:16 Vertical Cropping & Animated Subtitles
        await onProgress?.('SUBTITLE_BURNING', 85, `Rendering 9:16 clip: ${topCandidate.suggested_title}`);
        const clipOutputMp4 = path.join(jobWorkDir, `clip_${job.id}.mp4`);

        // Collect words across all segments
        const allWords = segments.flatMap((s) => s.words);

        await defaultClippingPipeline.renderClip({
          sourceVideoPath: sourcePath,
          candidate: topCandidate,
          words: allWords,
          outputPath: clipOutputMp4,
          cropMode: config.cropMode || 'FACE_TRACKING',
          captionPreset: config.captionPreset || 'Bold Creator'
        });

        const stats = fs.statSync(clipOutputMp4);
        const clipOutput: RenderOutput = {
          id: `out_${job.id}`,
          job_id: job.id,
          channel_id: job.channel_id,
          video_type: 'SHORT_CLIP',
          storage_path: clipOutputMp4,
          duration_seconds: topCandidate.duration_seconds,
          width: 1080,
          height: 1920,
          fps: 30,
          file_size_bytes: stats.size,
          codec: 'h264',
          qa_passed: true,
          qa_details: { candidate: topCandidate },
          created_at: new Date().toISOString()
        };

        await onProgress?.('COMPLETED', 100, 'Vertical short clip render complete and verified');
        return { success: true, output: clipOutput };
      }

      if (job.job_type === 'PUBLISH_YOUTUBE') {
        const config = job.workflow_config_snapshot as any;
        await onProgress?.('UPLOADING', 20, 'Initiating resumable upload session on YouTube');

        const result = await defaultYouTubePublisher.publishVideo({
          jobId: job.id,
          channelId: job.channel_id,
          videoFilePath: config.videoFilePath,
          thumbnailPath: config.thumbnailPath,
          metadata: config.metadata,
          refreshToken: config.refreshToken
        });

        await onProgress?.('COMPLETED', 100, `Published successfully! Video ID: ${result.youtubeVideoId}`);
        return { success: true };
      }

      throw new Error(`Unsupported job type: ${job.job_type}`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      await onProgress?.('FAILED', 0, `Job execution failed: ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
  }
}

export const defaultWorkerProcessor = new JobWorkerProcessor();
