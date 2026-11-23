/**
 * Video Ingestion Module
 * Validates video streams, extracts audio for Whisper, and generates low-res proxy
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export interface IngestedVideoInfo {
  durationSeconds: number;
  width: number;
  height: number;
  fps: number;
  codec: string;
  audioCodec?: string;
  fileSizeBytes: number;
  extractedAudioPath: string;
  proxyVideoPath?: string;
}

export class VideoIngestionModule {
  public async ingestVideo(sourceVideoPath: string, workDir: string): Promise<IngestedVideoInfo> {
    if (!fs.existsSync(sourceVideoPath)) {
      throw new Error(`Source video not found: ${sourceVideoPath}`);
    }

    fs.mkdirSync(workDir, { recursive: true });
    const stats = fs.statSync(sourceVideoPath);

    // 1. Probe video streams with ffprobe
    const metadata = await this.probeMetadata(sourceVideoPath);

    // 2. Extract 16kHz mono audio for Whisper transcription
    const audioPath = path.join(workDir, 'extracted_audio.wav');
    await this.extractAudio(sourceVideoPath, audioPath);

    // 3. Generate low-resolution 720p proxy for fast review
    const proxyPath = path.join(workDir, 'proxy_720p.mp4');
    await this.generateProxy(sourceVideoPath, proxyPath);

    return {
      durationSeconds: metadata.duration,
      width: metadata.width,
      height: metadata.height,
      fps: metadata.fps,
      codec: metadata.codec,
      audioCodec: metadata.audioCodec,
      fileSizeBytes: stats.size,
      extractedAudioPath: audioPath,
      proxyVideoPath: proxyPath
    };
  }

  private async probeMetadata(filePath: string): Promise<{
    duration: number;
    width: number;
    height: number;
    fps: number;
    codec: string;
    audioCodec?: string;
  }> {
    return new Promise((resolve, reject) => {
      const child = spawn('ffprobe', [
        '-v', 'error',
        '-show_entries', 'stream=width,height,codec_name,r_frame_rate,codec_type',
        '-show_entries', 'format=duration',
        '-of', 'json',
        filePath
      ]);

      let stdout = '';
      child.stdout.on('data', (d) => { stdout += d.toString(); });
      child.on('close', (code) => {
        if (code === 0 && stdout) {
          try {
            const data = JSON.parse(stdout);
            const vStream = (data.streams || []).find((s: any) => s.codec_type === 'video') || {};
            const aStream = (data.streams || []).find((s: any) => s.codec_type === 'audio');

            let fps = 30;
            if (vStream.r_frame_rate) {
              const [num, den] = vStream.r_frame_rate.split('/').map(Number);
              if (den > 0) fps = Math.round((num / den) * 100) / 100;
            }

            resolve({
              duration: parseFloat(data.format?.duration || '0'),
              width: vStream.width || 1920,
              height: vStream.height || 1080,
              fps,
              codec: vStream.codec_name || 'h264',
              audioCodec: aStream?.codec_name
            });
          } catch (e) {
            reject(new Error(`Failed to parse ffprobe metadata: ${e}`));
          }
        } else {
          reject(new Error(`ffprobe failed with code ${code}`));
        }
      });
      child.on('error', reject);
    });
  }

  private async extractAudio(videoPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = spawn('ffmpeg', [
        '-i', videoPath,
        '-vn',
        '-acodec', 'pcm_s16le',
        '-ar', '16000',
        '-ac', '1',
        '-y',
        outputPath
      ], { stdio: 'ignore' });

      child.on('close', (code) => {
        if (code === 0 && fs.existsSync(outputPath)) resolve();
        else reject(new Error(`Audio extraction failed with code ${code}`));
      });
      child.on('error', reject);
    });
  }

  private async generateProxy(videoPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve) => {
      const child = spawn('ffmpeg', [
        '-i', videoPath,
        '-vf', 'scale=-2:720',
        '-c:v', 'libx264',
        '-crf', '28',
        '-preset', 'veryfast',
        '-c:a', 'aac',
        '-b:a', '96k',
        '-y',
        outputPath
      ], { stdio: 'ignore' });

      child.on('close', () => resolve());
      child.on('error', () => resolve());
    });
  }
}

export const defaultIngestionModule = new VideoIngestionModule();
