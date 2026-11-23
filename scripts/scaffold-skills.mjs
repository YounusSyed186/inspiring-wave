import fs from 'fs';
import path from 'path';

const skillsBaseDir = path.resolve(process.cwd(), '.agents', 'skills');

const skillsData = [
  {
    dir: '01-content-research',
    name: 'content-research',
    description: 'Autonomous research agent that surveys channel themes, uncovers compelling factual insights, validates sources, and proposes novel YouTube video concepts.',
    procedure: `## Workflow
1. Load channel primary and supporting themes, content pillars, and exclusions.
2. Query verified knowledge bases, archival registries, or historical records for novel angles.
3. Identify 5-10 distinct topic candidates with high audience curiosity and educational value.
4. Filter out any concepts matching previous 30-day channel publications.
5. Score each topic on uniqueness, channel relevance, and production feasibility.
6. Return structured research candidates with verified claims.`
  },
  {
    dir: '02-topic-planning',
    name: 'topic-planning',
    description: 'Evaluates content research proposals against channel strategy, target audience retention goals, and seasonal publishing calendars.',
    procedure: `## Workflow
1. Ingest proposed content ideas from the research phase.
2. Evaluate audience retention potential and competitor white spaces.
3. Align topic proposals with the active channel schedule and monthly content pillars.
4. Verify diversity across consecutive video releases (avoiding repeated themes).
5. Output approved topic brief with target runtime and designated narrative angle.`
  },
  {
    dir: '03-viral-hook-writing',
    name: 'viral-hook-writing',
    description: 'Crafts high-converting, curiosity-driven opening hooks that capture viewer attention in the first 5-8 seconds without cheap clickbait.',
    procedure: `## Workflow
1. Analyze the core tension, surprise, or central question of the topic.
2. Draft 5 distinct hook archetypes: Question, Contrarian, High-Stakes Story, Data Shock, and Visual Enigma.
3. Keep word count under 25 words (maximum 8 seconds spoken).
4. Verify the hook makes a promise the video narrative actually delivers.
5. Select the strongest hook for script integration.`
  },
  {
    dir: '04-scriptwriting',
    name: 'scriptwriting',
    description: 'Generates full narrative YouTube voiceover scripts with multi-act storytelling, pacing directions, and tone matched to channel identity.',
    procedure: `## Workflow
1. Select narrative structure based on channel persona: Chronological (History), Problem-Solution (Tech), Emotional-Journey (Motivation), or Case Study (Business).
2. Integrate the approved opening hook smoothly into Act 1 context.
3. Build progressive reveals and tension across Act 2 (avoiding narrative plateaus).
4. Craft a concise, memorable takeaway and non-intrusive call to action in Act 3.
5. Validate word count against target runtime (~150 WPM).`
  },
  {
    dir: '05-fact-checking',
    name: 'fact-checking',
    description: 'Audits video scripts for factual accuracy, unverifiable claims, historical discrepancies, and copyright/trademark compliance.',
    procedure: `## Workflow
1. Extract all factual statements, historical dates, statistics, and proper names from the script.
2. Verify each statement against authoritative primary and secondary references.
3. Flag any speculative claims or hallucinated details.
4. Provide verified replacement phrasing for any disputed claims.
5. Issue a verification certificate with confidence score.`
  },
  {
    dir: '06-storyboard-director',
    name: 'storyboard-director',
    description: 'Directs the visual storyboard, mapping each sentence of narration to scene concepts, camera movements, and transition timings.',
    procedure: `## Workflow
1. Split narration script into logical 4-8 second visual segments.
2. Assign each scene an explicit visual concept, lighting mood, and composition.
3. Define camera trajectories (push-in, slow pan, orbital, tilt, top-down).
4. Specify on-screen kinetic text keywords and visual accents.
5. Allocate rendering strategy (Lemo Opuscar, Remotion, Canvas, or Motion Graphics).`
  },
  {
    dir: '07-lemo-opuscar-director',
    name: 'lemo-opuscar-director',
    description: 'Interfaces with the Lemo-Opuscar procedural filmmaking engine to direct 80+ code-driven visual styles for cinematic scene generation.',
    procedure: `## Workflow
1. Query available Lemo Opuscar styles (impasto, ukiyoe, watercolor, satellite-briefing, teardown, etc.).
2. Select style matching the channel brand profile and scene narrative mood.
3. Configure scene parameters (Three.js shaders, lighting, colors, camera speed).
4. Execute procedural render via the Lemo CLI adapter.
5. Validate generated frame sequence and video stream output.`
  },
  {
    dir: '08-motion-graphics-design',
    name: 'motion-graphics-design',
    description: 'Designs dynamic 2D/3D motion graphics, lower thirds, HUD overlays, diagrams, and kinetic typography.',
    procedure: `## Workflow
1. Ingest key statistics, names, and concepts requiring visual emphasis.
2. Generate SVG / Canvas / WebGL motion graphic templates.
3. Apply channel brand color palette and typography rules.
4. Synchronize motion in/out animations with audio cue timestamps.
5. Export alpha-transparent overlays or integrated scene components.`
  },
  {
    dir: '09-remotion-composition',
    name: 'remotion-composition',
    description: 'Authors and compiles React-based video compositions using Remotion for programmatic video layouts and infographics.',
    procedure: `## Workflow
1. Define React video composition components with strict width/height/FPS properties.
2. Map scene timeline state to spring animations and interpolations.
3. Inject dynamic props (titles, captions, charts, user assets).
4. Preview composition frames at key timestamps.
5. Bundle and render composition to high-bitrate MP4/ProRes.`
  },
  {
    dir: '10-scene-asset-planning',
    name: 'scene-asset-planning',
    description: 'Plans, catalogs, and stages all visual and audio assets required for complete multi-scene video production.',
    procedure: `## Workflow
1. Ingest approved storyboard scene requirements.
2. Catalog necessary textures, 3D models, vector icons, and background footage.
3. Check rights and licensing for every external media item.
4. Preload and stage assets into local cache or object storage.
5. Produce asset manifest for the rendering worker.`
  },
  {
    dir: '11-voiceover-production',
    name: 'voiceover-production',
    description: 'Orchestrates neural text-to-speech synthesis, speech pacing, silence trimming, and word-level phoneme alignment.',
    procedure: `## Workflow
1. Select voice model based on channel profile (Kokoro, Piper, or Gemini TTS).
2. Apply phonetic corrections and pronunciation overrides for technical/foreign words.
3. Synthesize speech audio at 24kHz / 48kHz uncompressed WAV.
4. Trim leading/trailing dead air and excessive inter-sentence gaps (>0.6s).
5. Extract exact word-level timestamp boundaries.`
  },
  {
    dir: '12-audio-mixing',
    name: 'audio-mixing',
    description: 'Blends voiceover narration, background music, and sound effects with dynamic sidechain ducking and broadcast loudness normalization.',
    procedure: `## Workflow
1. Ingest voiceover stem, background music track, and sound effect cues.
2. Align sound effects to visual action timestamps.
3. Apply sidechain ducking (lower music by -14dB to -18dB while speech is active).
4. Apply gentle fades at start and conclusion of music track.
5. Normalize final mixed audio to -14.0 LUFS (-1.0 dB True Peak) for YouTube standard.`
  },
  {
    dir: '13-video-rendering',
    name: 'video-rendering',
    description: 'Coordinates final video encoding, multi-pass compression, container muxing, and resolution optimization.',
    procedure: `## Workflow
1. Assemble all rendered video segments, overlays, and mixed audio stream.
2. Select target export preset (1080p landscape 16:9 or vertical 9:16).
3. Encode via FFmpeg using H.264/AAC with CRF 18-20 for high perceptual quality.
4. Ensure faststart moov atom is moved to beginning of file for instant web playback.
5. Save final video artifact to object storage.`
  },
  {
    dir: '14-video-quality-assurance',
    name: 'video-quality-assurance',
    description: 'Performs automated technical, audio, visual, and platform compliance checks on rendered media files.',
    procedure: `## Workflow
1. Verify video container integrity, duration, resolution, aspect ratio, and frame rate.
2. Probe audio stream for clipping, out-of-spec loudness, or unintended silence.
3. Scan for black frame anomalies or frozen video render errors.
4. Verify subtitle readability and safe-zone compliance (no cutoffs by platform UI).
5. Output QA approval report or trigger automatic production recovery.`
  },
  {
    dir: '15-transcription',
    name: 'transcription',
    description: 'Extracts ultra-accurate text and word-level timestamps from long-form audio/video using whisper.cpp and faster-whisper.',
    procedure: `## Workflow
1. Extract 16kHz mono audio stream from source media.
2. Run local Whisper model (ggml-large-v3) with word timestamp extraction.
3. Detect spoken language and segment boundaries.
4. Filter non-speech vocalizations and handle background music interference.
5. Format structured transcript segments with millisecond accuracy.`
  },
  {
    dir: '16-speaker-diarization',
    name: 'speaker-diarization',
    description: 'Differentiates and labels individual speaker voices across conversational and interview videos.',
    procedure: `## Workflow
1. Process audio stream through voice activity detection (VAD).
2. Extract speaker voice embeddings across active dialogue chunks.
3. Cluster embeddings to assign persistent speaker labels (SPEAKER_00, SPEAKER_01).
4. Map speaker boundaries onto timestamped transcript segments.
5. Support speaker-specific subtitle coloring and smart crop tracking.`
  },
  {
    dir: '17-highlight-detection',
    name: 'highlight-detection',
    description: 'Analyzes long-form transcripts and scene cuts to identify high-value, self-contained moments for short-form clips.',
    procedure: `## Workflow
1. Scan transcript segments for strong topic shifts and conversational peaks.
2. Identify standalone insights, surprising facts, heated debates, or punchlines.
3. Establish clean in/out points that do not cut off sentences or essential context.
4. Verify candidate duration conforms to YouTube Shorts limits (15-60 seconds).
5. Produce candidate list with topic summary and editorial rationale.`
  },
  {
    dir: '18-virality-ranking',
    name: 'virality-ranking',
    description: 'Scores clip candidates using a multi-factor editorial heuristic model to prioritize high-engagement Short candidates.',
    procedure: `## Workflow
1. Ingest candidate segments from highlight detection.
2. Score hook strength (20%), content value (20%), and narrative completeness (20%).
3. Score audience relevance (15%), clarity (10%), visual suitability (10%), and novelty (5%).
4. Compute weighted composite score.
5. Deduplicate overlapping selections and rank top candidates for rendering.`
  },
  {
    dir: '19-smart-reframing',
    name: 'smart-reframing',
    description: 'Dynamically crops 16:9 landscape videos into 9:16 vertical video with speaker tracking and safe zone preservation.',
    procedure: `## Workflow
1. Detect speaker face and torso positions across the clip duration.
2. Calculate smooth camera tracking window (avoiding jittery rapid movements).
3. Switch crop mode to split-screen or blurred-background if multi-speaker/slides present.
4. Keep focal subject within vertical mobile safe margins.
5. Generate FFmpeg crop filter parameters.`
  },
  {
    dir: '20-dynamic-captioning',
    name: 'dynamic-captioning',
    description: 'Creates animated, word-highlighted karaoke-style captions formatted for maximum readability on mobile screens.',
    procedure: `## Workflow
1. Ingest word-level timestamps corresponding to the selected clip.
2. Group words into 3-5 word readable phrases per screen.
3. Apply channel caption preset (Bold Creator, Minimal, Karaoke, Documentary).
4. Apply dynamic active-word color highlighting.
5. Compile ASS subtitle file and verify positioning outside TikTok/Shorts UI overlays.`
  },
  {
    dir: '21-short-form-editing',
    name: 'short-form-editing',
    description: 'Assembles vertical video crops, dynamic subtitles, audio normalization, and optional sound accents into polished YouTube Shorts.',
    procedure: `## Workflow
1. Cut source video at candidate start/end timestamps.
2. Apply 9:16 smart reframing filter.
3. Burn-in synchronized ASS animated captions.
4. Apply quick audio fade-in (50ms) and fade-out (100ms) to prevent audio clicks.
5. Render finalized vertical MP4.`
  },
  {
    dir: '22-thumbnail-design',
    name: 'thumbnail-design',
    description: 'Generates high-CTR thumbnail concepts, layout compositions, and extracted hero frames with brand typography.',
    procedure: `## Workflow
1. Extract top 3 candidate expressive freeze-frames from rendered video.
2. Enhance contrast, saturation, and subject separation.
3. Add 3-5 word bold headline text using channel brand font and colors.
4. Verify mobile thumbnail readability at 150px preview scale.
5. Export final 1280x720 JPEG thumbnail (<2MB).`
  },
  {
    dir: '23-youtube-metadata',
    name: 'youtube-metadata',
    description: 'Produces optimized YouTube titles, detailed descriptions, chapter timestamps, and search tags tailored to YouTube SEO.',
    procedure: `## Workflow
1. Analyze final script and topic key insights.
2. Generate 3 high-CTR title variations (emotional, curiosity, data-driven).
3. Draft keyword-rich description with summary, key takeaways, and relevant links.
4. Insert accurate video chapter timestamps.
5. Include AI synthetic content disclosure tags where required.`
  },
  {
    dir: '24-youtube-publishing',
    name: 'youtube-publishing',
    description: 'Manages Google OAuth tokens and executes resumable chunked video uploads to authorized YouTube channels.',
    procedure: `## Workflow
1. Retrieve channel YouTube connection and refresh expired access tokens.
2. Validate video file and thumbnail readiness.
3. Initiate resumable upload session with YouTube Data API v3.
4. Stream video chunks with progress tracking and automatic resume on network drops.
5. Attach custom thumbnail and verify video processing status in YouTube Studio.`
  },
  {
    dir: '25-channel-brand-consistency',
    name: 'channel-brand-consistency',
    description: 'Enforces visual and editorial brand guidelines across all generated content and multi-channel pipelines.',
    procedure: `## Workflow
1. Inspect channel brand profile (colors, fonts, tone, default intro/outro, logo).
2. Validate script matches channel persona and audience reading level.
3. Verify visual elements adhere strictly to designated color hex codes.
4. Ensure no cross-contamination of branding from other managed channels.
5. Pass or reject production job based on brand alignment.`
  },
  {
    dir: '26-multi-channel-scheduling',
    name: 'multi-channel-scheduling',
    description: 'Coordinates morning generation and evening clipping workflows across multiple independent channel schedules.',
    procedure: `## Workflow
1. Evaluate active channel schedules against current local timezone times.
2. Trigger morning original video generation jobs when scheduled slot opens.
3. Trigger evening clipping jobs on pending source videos.
4. Enforce channel daily publishing limits and concurrency caps.
5. Dispatch jobs to durable queue with unique idempotency keys.`
  },
  {
    dir: '27-content-deduplication',
    name: 'content-deduplication',
    description: 'Prevents repeated topics, identical footage reuse, or cross-channel duplicate uploads.',
    procedure: `## Workflow
1. Ingest candidate topic or video fingerprint.
2. Compare semantic similarity against past 60-day publication history.
3. Flag any candidate with >80% conceptual overlap with existing videos.
4. Prevent publishing duplicate clips across sister channels unless explicit user consent.
5. Provide actionable pivot suggestions for flagged topics.`
  },
  {
    dir: '28-copyright-license-checking',
    name: 'copyright-license-checking',
    description: 'Audits media assets, source footage, and background music for verified commercial usage rights and attribution compliance.',
    procedure: `## Workflow
1. Inspect license metadata for every audio track, image, and video clip used.
2. Verify asset is licensed for commercial YouTube monetization.
3. Record required attribution statements and append to video description.
4. Block any unregistered third-party copyrighted tracks.
5. Store immutable license records with the production job.`
  },
  {
    dir: '29-analytics-analysis',
    name: 'analytics-analysis',
    description: 'Pulls YouTube Analytics performance data to extract retention trends and actionable optimization recommendations.',
    procedure: `## Workflow
1. Ingest YouTube Analytics API metrics (views, retention curve, CTR, watch time).
2. Identify drop-off points in video retention graphs.
3. Correlate high-performing hooks and visual styles with subscriber gain.
4. Generate weekly channel performance intelligence report.
5. Feed learnings back into the Content Research Agent for future topic ideation.`
  },
  {
    dir: '30-production-recovery',
    name: 'production-recovery',
    description: 'Detects worker crashes, stalled renders, or expired API sessions, recovering jobs gracefully without duplicating work.',
    procedure: `## Workflow
1. Scan for jobs in 'leased' or 'running' state past their lease timeout threshold.
2. Inspect last recorded job event and artifact checkpoint.
3. Reconcile whether render output was partially written or completed.
4. Resume job from last valid stage rather than restarting from zero.
5. Escalate to dead-letter state with actionable alert if max retries exceeded.`
  }
];

for (const skill of skillsData) {
  const dirPath = path.join(skillsBaseDir, skill.dir);
  fs.mkdirSync(dirPath, { recursive: true });

  const content = `---
name: ${skill.name}
description: ${skill.description}
---

# ${skill.name.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}

${skill.description}

## Inputs
- Production job context and configuration snapshot
- Channel identity profile and content parameters
- Input media, scripts, or operational state

${skill.procedure}

## Output
Returns validated artifacts or state updates conforming to the studio workflow contract.

## Failure Policy
Never silently swallow errors or fabricate outputs. Log explicit root-cause diagnostic information and update job status to recoverable failure.
`;

  fs.writeFileSync(path.join(dirPath, 'SKILL.md'), content, 'utf8');
}

console.log('Successfully created all 30 Antigravity Skills in .agents/skills/');
