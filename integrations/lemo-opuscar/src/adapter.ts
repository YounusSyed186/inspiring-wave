/**
 * Lemo-Opuscar Procedural Filmmaking Integration Adapter
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

export interface LemoStyleInfo {
  slug: string;
  name: string;
  description: string;
  hasPrompt: boolean;
}

export interface LemoRenderOptions {
  sceneDir: string;
  outputMp4Path: string;
  fps?: number;
  width?: number;
  height?: number;
  workers?: number;
}

export class LemoOpuscarAdapter {
  private libPath: string;

  constructor(customLibPath?: string) {
    this.libPath = customLibPath || path.join(os.homedir(), 'lemo-opuscar');
  }

  public getLibPath(): string {
    return this.libPath;
  }

  public isAvailable(): boolean {
    return fs.existsSync(this.libPath) && fs.existsSync(path.join(this.libPath, 'core', 'render', 'video.mjs'));
  }

  /**
   * Discover all available styles from the cloned library
   */
  public listStyles(): LemoStyleInfo[] {
    const stylesDir = path.join(this.libPath, 'styles');
    if (!fs.existsSync(stylesDir)) return [];

    const entries = fs.readdirSync(stylesDir, { withFileTypes: true });
    const styles: LemoStyleInfo[] = [];

    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('_')) {
        const styleMd = path.join(stylesDir, entry.name, 'STYLE.md');
        let description = '';
        if (fs.existsSync(styleMd)) {
          const content = fs.readFileSync(styleMd, 'utf8');
          const firstLine = content.split('\n').find((l) => l.trim().length > 0) || '';
          description = firstLine.replace(/^#*\s*/, '');
        }

        styles.push({
          slug: entry.name,
          name: entry.name.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          description: description || `Lemo Opuscar ${entry.name} procedural style`,
          hasPrompt: fs.existsSync(path.join(stylesDir, entry.name, 'PROMPT.md'))
        });
      }
    }

    return styles;
  }

  /**
   * Render a procedural scene or film directory to MP4
   */
  public async renderVideo(options: LemoRenderOptions): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error(`Lemo Opuscar library not found at: ${this.libPath}`);
    }

    const {
      sceneDir,
      outputMp4Path,
      fps = 30,
      width = 1920,
      height = 1080,
      workers = 2
    } = options;

    fs.mkdirSync(path.dirname(outputMp4Path), { recursive: true });

    const videoScript = path.join(this.libPath, 'core', 'render', 'video.mjs');
    const args = [
      videoScript,
      sceneDir,
      '--fps',
      String(fps),
      '--workers',
      String(workers),
      '--size',
      `${width}x${height}`,
      '--out',
      outputMp4Path
    ];

    const gyanBin = 'C:\\Users\\DELL\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.1-full_build\\bin';
    const envPath = `${gyanBin};${process.env.PATH || ''};${process.env.Path || ''}`;

    return new Promise((resolve, reject) => {
      const child = spawn(process.execPath, args, {
        cwd: this.libPath,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
          ...process.env,
          PATH: envPath,
          Path: envPath,
          NODE_PATH: path.join(this.libPath, 'node_modules')
        }
      });

      let stderr = '';
      let stdout = '';

      child.stdout.on('data', (d) => { stdout += d.toString(); });
      child.stderr.on('data', (d) => { stderr += d.toString(); });

      child.on('close', (code) => {
        if (code === 0 && fs.existsSync(outputMp4Path)) {
          resolve(outputMp4Path);
        } else {
          reject(new Error(`Lemo render failed with code ${code}.\nLogs: ${stdout}\nErrors: ${stderr}`));
        }
      });

      child.on('error', (err) => {
        reject(new Error(`Failed to launch Lemo render process: ${err.message}`));
      });
    });
  }

  /**
   * Render a still image preview from a scene at a given timestamp
   */
  public async renderStill(sceneDir: string, timestampSeconds: number, outputJpgPath: string): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error(`Lemo Opuscar library not found at: ${this.libPath}`);
    }

    fs.mkdirSync(path.dirname(outputJpgPath), { recursive: true });
    const stillScript = path.join(this.libPath, 'core', 'render', 'still.mjs');
    const args = [
      stillScript,
      sceneDir,
      String(timestampSeconds),
      '--out',
      outputJpgPath
    ];

    return new Promise((resolve, reject) => {
      const child = spawn(process.execPath, args, {
        cwd: this.libPath,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let stderr = '';
      child.stderr.on('data', (d) => { stderr += d.toString(); });

      child.on('close', (code) => {
        if (code === 0 && fs.existsSync(outputJpgPath)) {
          resolve(outputJpgPath);
        } else {
          reject(new Error(`Lemo still render failed with code ${code}: ${stderr}`));
        }
      });

      child.on('error', (err) => reject(err));
    });
  }
}

export const defaultLemoAdapter = new LemoOpuscarAdapter();
