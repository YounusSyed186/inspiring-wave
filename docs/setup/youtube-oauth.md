# YouTube OAuth 2.0 Integration & Setup

## Overview
The Studio implements genuine Google OAuth 2.0 with offline access (`refresh_token`) to manage multiple YouTube channels independently. Each channel has an isolated credential entry in `youtube_connections` with token encryption at rest.

---

## 1. Google Cloud Console Setup
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., `ai-video-studio`).
3. Navigate to **APIs & Services** > **Library**.
4. Search for **YouTube Data API v3** and click **Enable**.
5. Navigate to **APIs & Services** > **OAuth consent screen**:
   - User Type: **External** (or Internal for Google Workspace).
   - App Name: `AI Video Studio`.
   - User support email & Developer contact info: your email.
   - Scopes to add:
     - `https://www.googleapis.com/auth/youtube.upload`
     - `https://www.googleapis.com/auth/youtube.readonly`
     - `https://www.googleapis.com/auth/youtubepartner`
   - In Test Users: Add your Google email address associated with your YouTube channels.
6. Navigate to **Credentials** > **Create Credentials** > **OAuth client ID**:
   - Application type: **Web application**.
   - Name: `AI Studio Web Client`.
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/youtube/callback`
     - `https://your-production-domain.com/api/auth/youtube/callback`
7. Copy the **Client ID** and **Client Secret**.

---

## 2. Configure Environment Variables
Update your `.env` or `.env.local`:
```bash
YOUTUBE_CLIENT_ID=your_client_id.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=your_client_secret
YOUTUBE_REDIRECT_URI=http://localhost:3000/api/auth/youtube/callback
TOKEN_ENCRYPTION_SECRET=your_32_byte_aes_hex_key_here
```

---

## 3. Multi-Channel Connection Flow
1. Open the Studio web dashboard (`http://localhost:3000/channels`).
2. Click **"Connect Channel"**.
3. Choose the Google account and specific brand YouTube channel you wish to link.
4. Authorize the upload permissions.
5. Upon redirect:
   - The authorization code is exchanged for an `access_token` and `refresh_token`.
   - Tokens are encrypted with AES-256-GCM using `TOKEN_ENCRYPTION_SECRET`.
   - Stored in the `youtube_connections` table mapped directly to the `channel_id`.

---

## 4. Resumable Upload Architecture
The publishing worker (`workers/publishing/src/publisher.ts`) implements YouTube's chunked resumable upload protocol:
- Videos are uploaded in 8MB chunks with checkpoint persistence.
- Network interruptions resume from the last byte offset rather than restarting.
- Tags, category IDs, custom thumbnails, and privacy status (`private`, `unlisted`, `public`) are set atomically upon completion.
