# AI Video Clipping Workflow

## Overview
The AI Video Clipping workflow ingests long-form video files (podcasts, tutorials, interviews, keynotes), transcribes dialogue using Whisper C++, detects visual scene boundaries, uses Gemini for semantic highlight scoring, reframes content into 9:16 vertical format, burns animated karaoke subtitles, and outputs YouTube Shorts.

```
Ingestion & Audio Extraction -> Whisper Transcription -> Scene Detection -> Highlight Scoring -> Smart 9:16 Reframing -> Karaoke Subtitles -> Final Short Export
```

---

## Step-by-Step Workflow

### 1. Video Ingestion & Stream Analysis (`workers/clipping/src/ingestion.ts`)
- **Input**: Source video path or uploaded file.
- **Execution**:
  - FFprobe inspects video streams (dimensions, aspect ratio, frame rate, audio sample rate).
  - FFmpeg extracts a clean 16kHz mono audio track (`audio_16k.wav`) optimized for Whisper transcription.
  - Optionally renders a 540p lightweight proxy for rapid processing.
- **Output**: Record in `source_videos`.

### 2. High-Accuracy Transcription (`integrations/whisper/src/transcriber.ts`)
- **Input**: `audio_16k.wav`.
- **Execution**:
  - Whisper C++ (`whisper-cli.exe`) processes the audio with `ggml-large-v3.bin`.
  - Outputs exact millisecond-accurate word-level timestamps (`[start_ms, end_ms, word]`).
- **Output**: Record in `source_transcripts` and granular words in `transcript_segments`.

### 3. Visual Scene Cut Detection
- **Input**: Source video file.
- **Execution**:
  - PySceneDetect / FFmpeg scene change filter (`select='gt(scene,0.3)'`) identifies physical camera switches and angle changes.
  - Ensures clips do not begin or end mid-shot or during awkward frame transitions.

### 4. Highlight Scoring & Candidate Selection (`workers/clipping/src/highlights.ts`)
- **Input**: Transcript sentences with timestamps and scene cut marks.
- **Execution**:
  - Gemini evaluates content for viral potential using multi-factor scoring:
    - **Hook Strength** (0-100)
    - **Narrative Completeness** (0-100)
    - **Information Density** (0-100)
    - **Emotional / Humor Peak** (0-100)
  - Identifies 30s-60s window candidates.
  - Candidate deduplication ensures no overlapping clips from the same segment.
- **Output**: Ranked entries in `clip_candidates` and `clip_scores`.

### 5. Smart 9:16 Vertical Reframing (`workers/clipping/src/cropping.ts`)
- **Strategies**:
  - `FACE_TRACKING`: Automatically centers on the active speaker's face using MediaPipe/OpenCV coordinates.
  - `CENTER_CROP`: Zooms and crops the central 1080x1920 region.
  - `BLURRED_BACKGROUND`: Positions the original 16:9 frame centered over an aesthetically blurred, enlarged 9:16 background layer.
  - `SPLIT_SCREEN`: Vertically stacks two speakers (ideal for remote interviews and podcast dialogues).

### 6. Animated Karaoke Subtitles (`packages/video-templates/src/index.ts`)
- **Execution**:
  - Generates Advanced SubStation Alpha (`.ass`) subtitle files.
  - Highlights the actively spoken word in vibrant brand colors (e.g., `#FFE600` Yellow on `#FFFFFF` text) with subtle font pop animation.
  - Enforces 2-4 words per line to prevent mobile screen clutter.

### 7. Final Short Assembly (`workers/clipping/src/pipeline.ts`)
- **Execution**:
  - FFmpeg cuts the exact timestamp window, applies the reframing filtergraph, burns the `.ass` subtitles, and encodes to H.264 at 1080x1920 60FPS.
  - Generates dynamic YouTube Short titles, descriptions, and `#shorts` hashtags.
- **Output**: Verified production MP4 recorded in `clips`.
