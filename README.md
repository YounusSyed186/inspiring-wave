# Autonomous Multi-Channel AI Video Studio

A self-hostable, production-ready AI Video Automation Studio designed for multi-channel YouTube automation, procedural video generation, and intelligent short-form clipping.

Built with a **free-first, local-first architecture**:
- **Application Stack**: Next.js App Router (TypeScript) + Supabase (PostgreSQL, Storage, Realtime, Queues).
- **AI Intelligence**: Google Gemini API for topic research, scriptwriting, and semantic highlight analysis.
- **Procedural Filmmaking**: Native integration with [Lemo-Opuscar](https://github.com/lemomo-ai/lemo-opuscar) (80+ code-driven visual styles).
- **Speech & Audio**: Local [whisper.cpp](https://github.com/ggml-org/whisper.cpp) (`ggml-large-v3`), neural TTS (Kokoro/Piper), and EBU R128 audio mastering (-14.0 LUFS).
- **Intelligent Clipping**: Automatic shot boundary detection, semantic highlight ranking, smart 9:16 vertical reframing, and animated karaoke-style subtitles.
- **Publishing**: Official Google OAuth 2.0 + YouTube Data API v3 resumable chunked upload protocol.
- **Extensibility**: 30 project-specific Antigravity Agent Skills in `.agents/skills/`.

---

## Architecture Overview

```
                                      +-----------------------------+
                                      |    Next.js Studio Web UI    |
                                      | (Channels / Studio / Queue) |
                                      +--------------+--------------+
                                                     |
                                            REST / Server Actions
                                                     |
                                                     v
+--------------------------+          +--------------+--------------+
|   Google Gemini API      |<-------->|     Supabase PostgreSQL     |
| (Research/Scripts/Score) |          | (Jobs / Queues / Tenancy)   |
+--------------------------+          +--------------+--------------+
                                                     |
                                              Durable Leasing
                                                     |
                                                     v
+----------------------------------------------------+----------------------------------------------------+
|                                    Independent Processing Workers                                      |
+------------------------------------+------------------------------------+-------------------------------+
|     Lemo Opuscar & Remotion        |       Local whisper-cli            |       YouTube Publisher       |
|    (80+ Procedural Code Styles)    |      (ggml-large-v3 C++)           |     (Resumable OAuth Upload)  |
+------------------------------------+------------------------------------+-------------------------------+
```

---

## Core Capabilities

### 1. Autonomous AI Video Generation
1. **Topic Research**: Explores designated channel themes, validates factual claims, checks past 30-day publications for deduplication, and scores concepts.
2. **Scriptwriting**: Multi-act script structure matched to the channel narrative style (Chronological History, Problem-Solution Tech, Emotional Story, Business Analysis).
3. **Storyboard Direction**: Maps narration sentences to visual concepts, camera movement, and kinetic typography.
4. **Procedural Rendering**: Generates scenes using code (Three.js shaders, Canvas, WebGL) via Lemo Opuscar.
5. **Master Audio**: Neural voiceover synthesis, sidechain background music ducking (-16dB), and normalization to -14.0 LUFS.

### 2. Intelligent Video Clipping Engine
1. **Source Ingestion**: FFprobe stream validation, 16kHz audio extraction, and 720p proxy generation.
2. **Transcription**: Word-level timestamp extraction via `whisper-cli` and `ggml-large-v3`.
3. **Highlight Ranking**: Multi-factor heuristic scoring (Hook 20%, Content 20%, Completeness 20%, Relevance 15%, Clarity 10%, Visuals 10%, Novelty 5%).
4. **Smart 9:16 Cropping**: Face tracking, center crop, and blurred background letterbox modes.
5. **Dynamic Subtitles**: Animated karaoke-style active word highlighting burned via ASS subtitle filters.

### 3. Multi-Channel Independence
- Strict tenant separation: each channel owns independent themes, visual styles, voice presets, upload visibility, and schedules.
- Morning generation slots (e.g. 09:00 local time) and evening clipping slots (e.g. 18:00 local time).
- Idempotent job execution prevents duplicate runs.

---

## Quick Start (Local Development)

### 1. Clone & Install
```bash
git clone https://github.com/lemomo-ai/lemo-opuscar.git ~/lemo-opuscar
cd c:\Projects\InspriingWave\i4
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Add your `GEMINI_API_KEY`.

### 3. Start Next.js Studio
```bash
npm run dev --prefix apps/web
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run End-to-End Verification Tests
```bash
node tests/e2e/studio_test.mjs
```

---

## Docker Deployment

To launch the complete containerized stack (Next.js web, worker, and PostgreSQL):
```bash
docker compose -f infra/docker/docker-compose.yml up --build -d
```

---

## Antigravity Agent Skills

The studio includes 30 specialized Antigravity Agent Skills in [.\.agents\skills](file:///c:/Projects/InspriingWave/i4/.agents/skills):

| ID | Skill Name | Primary Responsibility |
|:---|:---|:---|
| `01` | `content-research` | Theme exploration, fact discovery, and proposal ranking |
| `02` | `topic-planning` | Calendar alignment and audience retention evaluation |
| `03` | `viral-hook-writing` | Curiosity-driven opening hooks (<8s spoken) |
| `04` | `scriptwriting` | Multi-act narrative script generation |
| `05` | `fact-checking` | Factual verification and claim auditing |
| `06` | `storyboard-director` | Scene breakdown, camera moves, and visual direction |
| `07` | `lemo-opuscar-director` | Lemo procedural filmmaking style invocation |
| `08` | `motion-graphics-design` | Kinetic typography, HUDs, and animated diagrams |
| `09` | `remotion-composition` | Programmatic React-based video layouts |
| `10` | `scene-asset-planning` | Asset staging, licensing, and manifests |
| `11` | `voiceover-production` | Neural TTS speech synthesis and silence trimming |
| `12` | `audio-mixing` | Music sidechain ducking (-16dB) and loudness normalization (-14 LUFS) |
| `13` | `video-rendering` | FFmpeg video assembly and multi-pass encoding |
| `14` | `video-quality-assurance` | Technical, audio, and platform compliance QA |
| `15` | `transcription` | Word-level speech-to-text via whisper.cpp (`ggml-large-v3`) |
| `16` | `speaker-diarization` | Speaker clustering and voice separation |
| `17` | `highlight-detection` | Standalone insight discovery from long-form content |
| `18` | `virality-ranking` | Weighted heuristic scoring and deduplication |
| `19` | `smart-reframing` | 9:16 vertical reframing with face tracking |
| `20` | `dynamic-captioning` | Animated ASS karaoke word highlighting |
| `21` | `short-form-editing` | YouTube Shorts rendering and pacing |
| `22` | `thumbnail-design` | Hero frame extraction and high-CTR headline typography |
| `23` | `youtube-metadata` | SEO titles, descriptions, and chapter timestamps |
| `24` | `youtube-publishing` | Google OAuth token management and resumable upload |
| `25` | `channel-brand-consistency` | Visual palette and voice consistency auditing |
| `26` | `multi-channel-scheduling` | Independent channel workflow coordination |
| `27` | `content-deduplication` | Semantic similarity auditing against historical uploads |
| `28` | `copyright-license-checking` | Audio and asset licensing verification |
| `29` | `analytics-analysis` | YouTube Analytics retention curve diagnostics |
| `30` | `production-recovery` | Stalled render recovery and checkpoint resumption |

---

## License & Compliance
All local media processing components run on MIT, Apache 2.0, or BSD permissive open-source software. No paid third-party generative video APIs are called without explicit user configuration.
