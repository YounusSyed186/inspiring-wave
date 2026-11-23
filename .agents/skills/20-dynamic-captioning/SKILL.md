---
name: dynamic-captioning
description: Creates animated, word-highlighted karaoke-style captions formatted for maximum readability on mobile screens.
---

# Dynamic Captioning

Creates animated, word-highlighted karaoke-style captions formatted for maximum readability on mobile screens.

## Inputs
- Production job context and configuration snapshot
- Channel identity profile and content parameters
- Input media, scripts, or operational state

## Workflow
1. Ingest word-level timestamps corresponding to the selected clip.
2. Group words into 3-5 word readable phrases per screen.
3. Apply channel caption preset (Bold Creator, Minimal, Karaoke, Documentary).
4. Apply dynamic active-word color highlighting.
5. Compile ASS subtitle file and verify positioning outside TikTok/Shorts UI overlays.

## Output
Returns validated artifacts or state updates conforming to the studio workflow contract.

## Failure Policy
Never silently swallow errors or fabricate outputs. Log explicit root-cause diagnostic information and update job status to recoverable failure.
