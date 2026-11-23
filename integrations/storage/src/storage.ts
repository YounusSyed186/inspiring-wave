/**
 * Storage Abstraction with Local Filesystem and S3/Supabase Storage Support
 */

import fs from 'fs';
import path from 'path';

export interface StorageAdapter {
  putObject(key: string, data: Buffer | string | fs.ReadStream, contentType?: string): Promise<string>;
  getObject(key: string): Promise<Buffer>;
  getPublicUrl(key: string): string;
  exists(key: string): Promise<boolean>;
  deleteObject(key: string): Promise<void>;
}

export class LocalStorageAdapter implements StorageAdapter {
  private baseDir: string;
  private baseUrl: string;

  constructor(baseDir?: string, baseUrl?: string) {
    this.baseDir = baseDir || path.resolve(process.cwd(), 'local_storage');
    this.baseUrl = baseUrl || '/storage';
    fs.mkdirSync(this.baseDir, { recursive: true });
  }

  private resolvePath(key: string): string {
    const safeKey = key.replace(/\.\./g, '').replace(/^[/\\]+/, '');
    return path.join(this.baseDir, safeKey);
  }

  public async putObject(key: string, data: Buffer | string | fs.ReadStream): Promise<string> {
    const dest = this.resolvePath(key);
    fs.mkdirSync(path.dirname(dest), { recursive: true });

    if (typeof data === 'string' || Buffer.isBuffer(data)) {
      fs.writeFileSync(dest, data);
    } else {
      await new Promise<void>((resolve, reject) => {
        const out = fs.createWriteStream(dest);
        data.pipe(out);
        out.on('finish', resolve);
        out.on('error', reject);
      });
    }

    return this.getPublicUrl(key);
  }

  public async getObject(key: string): Promise<Buffer> {
    const dest = this.resolvePath(key);
    if (!fs.existsSync(dest)) {
      throw new Error(`File not found: ${key}`);
    }
    return fs.readFileSync(dest);
  }

  public getPublicUrl(key: string): string {
    const safeKey = key.replace(/\\/g, '/');
    return `${this.baseUrl}/${safeKey}`;
  }

  public async exists(key: string): Promise<boolean> {
    return fs.existsSync(this.resolvePath(key));
  }

  public async deleteObject(key: string): Promise<void> {
    const dest = this.resolvePath(key);
    if (fs.existsSync(dest)) {
      fs.unlinkSync(dest);
    }
  }

  public getLocalFilePath(key: string): string {
    return this.resolvePath(key);
  }
}

export const defaultStorage = new LocalStorageAdapter();
