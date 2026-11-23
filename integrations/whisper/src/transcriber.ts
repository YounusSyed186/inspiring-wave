/**
 * Transcription Integration using local whisper.cpp and faster-whisper
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { TranscriptSegment, WordTimestamp } from '../../shared-types/src/index';

export interface TranscribeOptions {
  audioPath: string;
  modelPath?: string;
  language?: string;
  threads?: number;
}

export class WhisperTranscriber {
  private whisperCliPath: string;
  private defaultModelPath: string;

  constructor(customCliPath?: string, customModelPath?: string) {
    this.whisperCliPath = customCliPath || process.env.HYPERFRAMES_WHISPER_PATH || path.join(os.homedir(), 'whisper.cpp', 'Release', 'whisper-cli.exe');
    this.defaultModelPath = customModelPath || path.join(os.homedir(), 'whisper.cpp', 'models', 'ggml-large-v3.bin');
  }

  public isAvailable(): boolean {
    return fs.existsSync(this.whisperCliPath) && fs.existsSync(this.defaultModelPath);
  }

  /**
   * Transcribe an audio file and return structured segments
   */
  public async transcribe(options: TranscribeOptions): Promise<{ fullText: string; segments: TranscriptSegment[] }> {
    const {
      audioPath,
      modelPath = this.defaultModelPath,
      language = 'en',
      threads = 4
    } = options;

    if (!fs.existsSync(audioPath)) {
      throw new Error(`Audio file not found at: ${audioPath}`);
    }

    if (!fs.existsSync(modelPath)) {
      throw new Error(`Whisper model not found at: ${modelPath}`);
    }

    const outputJsonBase = path.join(os.tmpdir(), `transcription_${Date.now()}`);
    const expectedJsonFile = `${outputJsonBase}.json`;

    const args = [
      '-m', modelPath,
      '-f', audioPath,
      '-l', language,
      '-t', String(threads),
      '-ojf', // output json full
      '-of', outputJsonBase
    ];

    return new Promise((resolve, reject) => {
      const child = spawn(this.whisperCliPath, args, {
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let stderr = '';
      child.stderr.on('data', (d) => { stderr += d.toString(); });

      child.on('close', (code) => {
        if (code === 0 && fs.existsSync(expectedJsonFile)) {
          try {
            const rawContent = fs.readFileSync(expectedJsonFile, 'utf8');
            const parsed = JSON.parse(rawContent);

            const transcription = parsed.transcription || [];
            let fullText = '';
            const segments: TranscriptSegment[] = [];

            transcription.forEach((item: any, idx: number) => {
              const text = (item.text || '').trim();
              if (!text) return;

              fullText += (fullText ? ' ' : '') + text;

              const words: WordTimestamp[] = (item.tokens || [])
                .filter((t: any) => t.text && !t.text.startsWith('[_'))
                .map((t: any) => ({
                  word: t.text.trim(),
                  start: (t.timestamps?.from || item.offsets?.from || 0) / 1000,
                  end: (t.timestamps?.to || item.offsets?.to || 0) / 1000,
                  probability: t.p || 1.0
                }));

              segments.push({
                id: `seg_${idx}`,
                transcript_id: '',
                sequence_index: idx,
                start_time_seconds: (item.offsets?.from || 0) / 1000,
                end_time_seconds: (item.offsets?.to || 0) / 1000,
                text,
                words,
                speaker_id: 'SPEAKER_00',
                confidence: 0.95
              });
            });

            // Cleanup temp json
            try { fs.unlinkSync(expectedJsonFile); } catch {}

            resolve({ fullText, segments });
          } catch (parseErr) {
            reject(new Error(`Failed to parse whisper output JSON: ${parseErr}`));
          }
        } else {
          // Fallback: check if we can read stdout
          reject(new Error(`Whisper-cli exited with code ${code}. Error: ${stderr}`));
        }
      });

      child.on('error', (err) => reject(new Error(`Failed to launch whisper-cli: ${err.message}`)));
    });
  }
}

export const defaultTranscriber = new WhisperTranscriber();
