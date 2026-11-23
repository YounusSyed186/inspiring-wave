# Dependency License Audit — Autonomous Multi-Channel AI Video Studio

## Overview
This audit inspects the licenses, repository health, and compatibility of all direct software frameworks, libraries, and tools incorporated into the AI Video Studio.

## 1. Video Generation & Composition
| Component | Repository / Provider | License | Health / Status | Commercial Use Allowed | Notes |
|:---|:---|:---|:---|:---|:---|
| **Lemo Opuscar** | `lemomo-ai/lemo-opuscar` | MIT / Custom Permissive | Active v2.0 | Yes | Code-driven procedural filmmaking styles (Three.js/Canvas). Attribute properly. |
| **Remotion** | `remotion-dev/remotion` | Remotion License / Company License | Active | Yes (under developer thresholds / license terms) | React-based video rendering engine. Used for templates and overlays. |
| **FFmpeg** | `ffmpeg.org` | LGPL v2.1+ / GPL v3 (full build) | Active 9.1 | Yes (dynamic linking / CLI invocation) | Universal audio/video transcoding, muxing, filtering, and normalization. |
| **Three.js** | `mrdoob/three.js` | MIT | Active | Yes | 3D WebGL scenes used in procedural rendering styles. |

## 2. Speech, Vision & ML Analysis
| Component | Repository / Provider | License | Health / Status | Commercial Use Allowed | Notes |
|:---|:---|:---|:---|:---|:---|
| **faster-whisper** | `SYSTRAN/faster-whisper` | MIT | Highly Active | Yes | CTranslate2-based Whisper implementation (up to 4x faster than original Whisper). |
| **whisper.cpp** | `ggml-org/whisper.cpp` | MIT | Highly Active (b5907) | Yes | High-performance C/C++ inference with local `ggml-large-v3` model. |
| **PySceneDetect** | `Breakthrough/PySceneDetect` | BSD 3-Clause | Active | Yes | Shot boundary detection and content-aware cut detection. |
| **MediaPipe** | `google-ai-edge/mediapipe` | Apache 2.0 | Active | Yes | Real-time face detection and tracking for automatic vertical 9:16 cropping. |
| **Demucs** | `facebookresearch/demucs` | MIT | Active v4.1 | Yes | Hybrid Demucs for music/voice separation and background noise elimination. |
| **Kokoro / Piper** | `hexgrad/kokoro` / `rhasspy/piper` | Apache 2.0 / MIT | Active | Yes | High quality, ultra-fast local neural TTS voice synthesis. |

## 3. Platform & Services
| Component | Provider | License / Terms | Integration Method | Notes |
|:---|:---|:---|:---|:---|
| **Google Gemini API** | Google AI | Commercial API Terms | `@google/genai` Official SDK | Free tier & API key usage for structured analysis, research, and scripting. |
| **YouTube Data API v3** | Google Developers | YouTube API Terms of Service | Official REST API via OAuth 2.0 | Resumable uploads, metadata management, and channel verification. |
| **Supabase** | Supabase Inc. | Apache 2.0 / Commercial Cloud | `@supabase/supabase-js` | PostgreSQL, Auth, S3 Storage, Realtime, and Cron/Queues. |
| **Next.js** | Vercel | MIT | Next.js 14/15 App Router | Full-stack React framework with edge/node server capabilities. |

## 4. License Compliance Conclusions
- **Zero Proprietary Traps**: All local media workers utilize MIT, Apache 2.0, or BSD 3-Clause permissive open-source libraries.
- **Copyleft Isolation**: FFmpeg is invoked via standard CLI processes, maintaining clean boundary isolation.
- **Safe Commercial Deployment**: The entire autonomous pipeline can be self-hosted without licensing conflicts.
