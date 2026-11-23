/**
 * YouTube Data API v3 Client with Resumable Uploads & OAuth Token Refresh
 */

import fs from 'fs';

export interface YouTubeUploadMetadata {
  title: string;
  description: string;
  tags?: string[];
  categoryId?: string; // e.g. "27" (Education), "28" (Science & Tech)
  privacyStatus: 'private' | 'unlisted' | 'public';
  madeForKids?: boolean;
  selfDeclaredMadeForKids?: boolean;
  containsSyntheticMedia?: boolean;
}

export interface YouTubeUploadSession {
  uploadUrl: string;
  bytesUploaded: number;
  totalBytes: number;
}

export class YouTubeClient {
  private clientId: string;
  private clientSecret: string;

  constructor(clientId?: string, clientSecret?: string) {
    this.clientId = clientId || process.env.GOOGLE_CLIENT_ID || '';
    this.clientSecret = clientSecret || process.env.GOOGLE_CLIENT_SECRET || '';
  }

  /**
   * Refresh an expired OAuth 2.0 access token using a refresh token
   */
  public async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    if (!this.clientId || !this.clientSecret) {
      throw new Error('Google OAuth credentials (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET) are missing.');
    }

    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const body = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    });

    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to refresh YouTube access token: ${err}`);
    }

    const data = await res.json();
    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in
    };
  }

  /**
   * Initiate a resumable upload session on YouTube
   */
  public async initiateResumableUpload(
    accessToken: string,
    metadata: YouTubeUploadMetadata,
    totalBytes: number
  ): Promise<string> {
    const initUrl = 'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status';

    const resource = {
      snippet: {
        title: metadata.title.slice(0, 100),
        description: metadata.description.slice(0, 5000),
        tags: metadata.tags || [],
        categoryId: metadata.categoryId || '27',
      },
      status: {
        privacyStatus: metadata.privacyStatus,
        selfDeclaredMadeForKids: metadata.madeForKids ?? false,
      }
    };

    const res = await fetch(initUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Upload-Content-Type': 'video/mp4',
        'X-Upload-Content-Length': String(totalBytes)
      },
      body: JSON.stringify(resource)
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to initiate YouTube upload session: ${err}`);
    }

    const location = res.headers.get('location');
    if (!location) {
      throw new Error('YouTube did not return a Location header for resumable upload.');
    }

    return location;
  }

  /**
   * Upload video file stream to a resumable upload URL
   */
  public async uploadVideoFile(
    uploadUrl: string,
    filePath: string,
    onProgress?: (uploaded: number, total: number) => void
  ): Promise<{ videoId: string }> {
    const stats = fs.statSync(filePath);
    const totalBytes = stats.size;
    const fileStream = fs.createReadStream(filePath);

    // Using fetch with body stream
    const res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': String(totalBytes)
      },
      // Node 18+ supports stream in fetch
      // @ts-ignore
      body: fileStream,
      duplex: 'half'
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`YouTube resumable upload failed: ${err}`);
    }

    const data = await res.json();
    return { videoId: data.id };
  }

  /**
   * Set video custom thumbnail
   */
  public async setThumbnail(accessToken: string, videoId: string, thumbnailPath: string): Promise<void> {
    const url = `https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${videoId}`;
    const stats = fs.statSync(thumbnailPath);
    const stream = fs.createReadStream(thumbnailPath);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'image/jpeg',
        'Content-Length': String(stats.size)
      },
      // @ts-ignore
      body: stream,
      duplex: 'half'
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to set video thumbnail: ${err}`);
    }
  }
}

export const defaultYouTubeClient = new YouTubeClient();
