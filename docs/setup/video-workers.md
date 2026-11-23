# Video Workers & Media Engine Setup

## Overview
The Studio employs a decoupled worker architecture that handles heavy CPU/GPU rendering, Whisper transcription, and AI video synthesis without blocking the Next.js web application.

---

## 1. System Architecture
```
+-----------------------------------------------------------+
|                      Supabase DB                          |
|             (production_jobs / job_queue)                |
+-----------------------------------------------------------+
                              |
                     Lease-based Polling
                              v
+-----------------------------------------------------------+
|               Unified Studio Job Worker                   |
|              (workers/scheduler/src/worker.ts)            |
+-----------------------------------------------------------+
        |                     |                     |
        v                     v                     v
+---------------+     +---------------+     +---------------+
| Generation &  |     | Audio & Voice |     | Clipping &    |
| Procedural    |     | (Whisper C++, |     | Reframing     |
| (Lemo Opuscar)|     | Kokoro, FFmpeg|     | (PySceneDetect|
|               |     | Mastering)    |     | OpenCV / FFm) |
+---------------+     +---------------+     +---------------+
```

---

## 2. Prerequisites & Paths
The worker automatically resolves the following system binaries:
1. **FFmpeg / FFprobe**:
   - Windows path: `C:\Users\DELL\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.1-full_build\bin`
   - Added to System PATH.
2. **Python Environment**:
   - `C:\Users\DELL\video-tools\Scripts\python.exe`
   - Contains PyTorch, Demucs, Kokoro-onnx, Librosa, and OpenCV.
3. **Whisper C++**:
   - Binary: `C:\Users\DELL\whisper.cpp\Release\whisper-cli.exe`
   - Model: `C:\Users\DELL\whisper.cpp\models\ggml-large-v3.bin`
4. **Lemo Opuscar**:
   - Library root: `C:\Users\DELL\lemo-opuscar`
   - Procedural three.js renderers in `core/render/`

---

## 3. Running Workers

### Running Locally
To run the background processor locally:
```bash
npm run worker
```
Or run individual sub-pipelines:
```bash
# Generation worker
node workers/generation/src/research.js
# Clipping pipeline test
node tests/e2e/studio_test.mjs
```

### Running with Docker Compose
```bash
docker-compose -f infra/docker/docker-compose.yml up -d
```
This spins up:
- `studio-web`: Next.js web application on port `3000`.
- `studio-worker`: Node.js / Python / FFmpeg worker polling the Supabase queue.

---

## 4. Lease Management & Crash Recovery
- Workers acquire jobs by atomically leasing records in `job_queue` using PostgreSQL `FOR UPDATE SKIP LOCKED`.
- Heartbeats are written to `production_jobs.updated_at` every 15 seconds.
- If a worker crashes, the lease expires after 5 minutes and is automatically reclaimed by another worker.
- Maximum retry count: 3 attempts with failure snapshots captured in `job_failures`.
