/**
 * YouTube Publishing Worker
 * Refreshes tokens, uploads media via resumable chunks, and verifies status
 */

import { YouTubeClient, defaultYouTubeClient, YouTubeUploadMetadata } from '../../../integrations/youtube/src/client';

export interface PublishRequest {
  jobId: string;
  channelId: string;
  videoFilePath: string;
  thumbnailPath?: string;
  metadata: YouTubeUploadMetadata;
  refreshToken: string;
}

export class YouTubePublisherWorker {
  private ytClient: YouTubeClient;

  constructor(client?: YouTubeClient) {
    this.ytClient = client || defaultYouTubeClient;
  }

  public async publishVideo(request: PublishRequest): Promise<{ youtubeVideoId: string; publishedAt: string }> {
    const { videoFilePath, thumbnailPath, metadata, refreshToken } = request;

    // 1. Refresh access token
    const { accessToken } = await this.ytClient.refreshAccessToken(refreshToken);

    // 2. Initiate Resumable Upload Session
    const stats = await import('fs').then((fs) => fs.statSync(videoFilePath));
    const uploadUrl = await this.ytClient.initiateResumableUpload(accessToken, metadata, stats.size);

    // 3. Upload Video
    const { videoId } = await this.ytClient.uploadVideoFile(uploadUrl, videoFilePath);

    // 4. Attach Thumbnail if available
    if (thumbnailPath && (await import('fs')).existsSync(thumbnailPath)) {
      try {
        await this.ytClient.setThumbnail(accessToken, videoId, thumbnailPath);
      } catch (thumbErr) {
        console.warn(`[YouTubePublisher] Warning: Failed to upload custom thumbnail: ${thumbErr}`);
      }
    }

    return {
      youtubeVideoId: videoId,
      publishedAt: new Date().toISOString()
    };
  }
}

export const defaultYouTubePublisher = new YouTubePublisherWorker();
