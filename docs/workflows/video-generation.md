# Autonomous Video Generation Workflow

## Overview
The AI Video Generation workflow autonomously researches a topic, drafts a calibrated script, creates a multi-scene storyboard, renders procedural visual assets via Lemo Opuscar, synthesizes narration, masters the audio (-14 LUFS), and composes the final video.

```
Research -> Scriptwriting -> Storyboarding -> Visual Rendering -> Audio & Voice -> Mastering -> Packaging
```

---

## Step-by-Step Workflow

### 1. Topic & Research Phase (`workers/generation/src/research.ts`)
- **Input**: Channel profile, content pillars, excluded topics, and optional user seed prompt.
- **Execution**:
  - Gemini scans themes and extracts 3-5 high-performing content angles.
  - Generates hook proposals, target retention curve predictions, and bibliography/fact assertions.
- **Output**: Record in `content_ideas` and `research_sources`.

### 2. Scriptwriting Phase (`workers/generation/src/scriptwriter.ts`)
- **Input**: Selected content idea, target video duration (e.g. 180s for landscape, 60s for Shorts), reading speed (typically 145-155 WPM).
- **Execution**:
  - Generates structured acts: Hook (0-5s), Setup, Conflict/Deep Dive, Payoff/Twist, and Call to Action.
  - Computes word count budgets per segment.
- **Output**: Record in `scripts` and `script_versions`.

### 3. Storyboarding Phase (`workers/generation/src/storyboard.ts`)
- **Input**: Approved script.
- **Execution**:
  - Breaks script into 3-8 second scenes.
  - Determines visual camera directions, transitions (Cut, Dissolve, Wipe, Whip Pan), and scene descriptions.
  - Selects matching procedural visual style from Lemo Opuscar (e.g., `abstract-flow`, `cyber-grid`, `kinetic-typography`).
- **Output**: Records in `storyboards` and `scenes`.

### 4. Procedural Visual Rendering (`workers/rendering/src/engine.ts`)
- **Input**: Storyboard scenes and style configs.
- **Execution**:
  - Invokes Lemo Opuscar headless Playwright renderers at 1920x1080 (landscape) or 1080x1920 (portrait) at 30/60 FPS.
  - Renders raw lossless video fragments and still frames for each scene.
- **Output**: Artifact paths stored in `scene_assets` and local cache.

### 5. Narration & Voice Synthesis (`workers/generation/src/voiceover.ts`)
- **Input**: Scene dialogue segments and channel voice preset.
- **Execution**:
  - Synthesizes speech using local Kokoro-onnx TTS engine.
  - Exports broadcast-quality 48kHz WAV audio per scene.
- **Output**: Records in `voiceover_assets`.

### 6. Audio Mastering & Container Assembly
- **Input**: Voiceover audio tracks, ambient background music, rendered scene visuals.
- **Execution**:
  - Background music is dynamically ducked (-16dB) during active voiceover segments.
  - Audio chain applies EBU R128 loudness normalization to **-14.0 LUFS** (true peak: -1.0 dBFS).
  - FFmpeg concatenates scene video segments, multiplexes the mastered audio, and encodes using H.264 (libx264) + AAC (aac).
  - Automatically extracts a high-contrast thumbnail at the optimal frame.
- **Output**: Complete master MP4 recorded in `render_outputs`.
