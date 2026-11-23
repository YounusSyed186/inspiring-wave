---
name: short-form-editing
description: Assembles vertical video crops, dynamic subtitles, audio normalization, and optional sound accents into polished YouTube Shorts.
---

# Short Form Editing

Assembles vertical video crops, dynamic subtitles, audio normalization, and optional sound accents into polished YouTube Shorts.

## Inputs
- Production job context and configuration snapshot
- Channel identity profile and content parameters
- Input media, scripts, or operational state

## Workflow
1. Cut source video at candidate start/end timestamps.
2. Apply 9:16 smart reframing filter.
3. Burn-in synchronized ASS animated captions.
4. Apply quick audio fade-in (50ms) and fade-out (100ms) to prevent audio clicks.
5. Render finalized vertical MP4.

## Output
Returns validated artifacts or state updates conforming to the studio workflow contract.

## Failure Policy
Never silently swallow errors or fabricate outputs. Log explicit root-cause diagnostic information and update job status to recoverable failure.
