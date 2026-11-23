# Technology Decisions Record — Autonomous Multi-Channel AI Video Studio

## Architectural Context
The studio must be a self-hostable, production-ready, free-first autonomous multi-channel AI video generation and clipping studio.

Per the **Mandatory Technology Stack Override**, the system utilizes a modern, unified Next.js + TypeScript + Supabase architecture rather than a separate Python FastAPI backend for application features.

## Core Decisions

### 1. Primary Application Stack: Next.js (App Router) + TypeScript
- **Frontend & Server APIs**: Next.js 14/15 App Router providing SSR, React Server Components, Route Handlers (`/api/...`), and server actions.
- **Client State & Cache**: TanStack React Query + Zustand for responsive timeline and channel state.
- **UI Components**: Tailwind CSS, Radix UI primitives, Lucide icons, Framer Motion for micro-interactions.
- **Portability**: Web application can be deployed to Vercel or run containerized.

### 2. Persistence & Realtime: Supabase (PostgreSQL + Auth + Storage + Realtime + Queues)
- **Database**: PostgreSQL with normalized tables, foreign keys, row-level security (RLS), and JSONB schema-versioned job snapshots.
- **Authentication**: Supabase Auth (or JWT-based session management with role-based access).
- **Object Storage**: S3-compatible Supabase Storage buckets for raw source footage, audio stems, proxies, rendered outputs, and thumbnails, with a local filesystem fallback for development.
- **Job Orchestration**: Durable PostgreSQL-backed job queue (`pgmq` / lease-based job queue with visibility timeouts, heartbeats, exponential backoff, and idempotency keys) eliminating the need for Redis/Celery.
- **Realtime Updates**: Supabase Realtime (PostgreSQL CDC / broadcast) streaming job progress, render ticks, and approval states to the web dashboard.

### 3. AI Intelligence: Google Gemini API
- **Models**: `gemini-2.5-flash` / `gemini-2.5-pro` via `@google/genai` official SDK.
- **Tasks**:
  - Autonomous content research & topic idea generation.
  - Scriptwriting with per-channel narrative styles (History, Tech, Motivation, Business).
  - Storyboard scene generation and timing alignment.
  - Semantic understanding of long-form transcripts for clipping.
  - Multi-factor highlight scoring & virality heuristics.
  - SEO metadata (titles, descriptions, tags) and thumbnail concept drafting.
- **Cost & Safety Guard**: Free-first mode enforcement; strict token budgeting, rate-limiting, and error handling.

### 4. Video Generation & Procedural Filmmaking
- **Lemo Opuscar Adapter**: Integrates the 80+ procedural code filmmaking styles from `lemomo-ai/lemo-opuscar` (Three.js, Canvas, HTML5/CSS animations) driven by headless rendering into high-fidelity video sequences.
- **Remotion Integration**: React-based programmatic video composition for typography, lower thirds, dynamic infographics, kinetic text, and templated layouts.
- **FFmpeg & FFprobe (v9.1+)**: Media encoding, hardware acceleration (NVENC/VAAPI/CPU), audio normalization (EBU R128), video concatenation, and format conversion.

### 5. Media & ML Workers (Specialized)
- **Node.js Render Worker**: Handles Remotion compositions, Lemo Opuscar procedural renders, timeline assembly, and FFmpeg encoding.
- **Python ML Worker**: Handles specialized audio & visual ML tasks without duplicating the backend:
  - `faster-whisper` (CTranslate2) for high-performance timestamped transcription.
  - `whisper.cpp` (CLI) with `ggml-large-v3` as an ultra-fast local C++ alternative.
  - `PySceneDetect` for shot boundary and visual transition analysis.
  - `MediaPipe` / `OpenCV` for face tracking, speaker detection, and intelligent 9:16 smart cropping.
  - `demucs` for music/vocal source separation when cleaning background audio.
  - `kokoro-onnx` / `piper` for local neural TTS voice synthesis.

### 6. YouTube Integration & Multi-Channel Publishing
- **OAuth 2.0**: Direct Google OAuth with offline refresh token persistence (encrypted at rest).
- **YouTube Data API v3**: Resumable video upload protocol with chunked retry, thumbnail upload, playlist assignment, and synthetic content disclosure compliance.
- **Multi-Channel Isolation**: Strict tenant/channel separation ensuring no cross-contamination of assets, credentials, schedules, or content themes.
