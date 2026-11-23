---
name: audio-mixing
description: Blends voiceover narration, background music, and sound effects with dynamic sidechain ducking and broadcast loudness normalization.
---

# Audio Mixing

Blends voiceover narration, background music, and sound effects with dynamic sidechain ducking and broadcast loudness normalization.

## Inputs
- Production job context and configuration snapshot
- Channel identity profile and content parameters
- Input media, scripts, or operational state

## Workflow
1. Ingest voiceover stem, background music track, and sound effect cues.
2. Align sound effects to visual action timestamps.
3. Apply sidechain ducking (lower music by -14dB to -18dB while speech is active).
4. Apply gentle fades at start and conclusion of music track.
5. Normalize final mixed audio to -14.0 LUFS (-1.0 dB True Peak) for YouTube standard.

## Output
Returns validated artifacts or state updates conforming to the studio workflow contract.

## Failure Policy
Never silently swallow errors or fabricate outputs. Log explicit root-cause diagnostic information and update job status to recoverable failure.
