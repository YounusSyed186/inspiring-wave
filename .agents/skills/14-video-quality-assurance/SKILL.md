---
name: video-quality-assurance
description: Performs automated technical, audio, visual, and platform compliance checks on rendered media files.
---

# Video Quality Assurance

Performs automated technical, audio, visual, and platform compliance checks on rendered media files.

## Inputs
- Production job context and configuration snapshot
- Channel identity profile and content parameters
- Input media, scripts, or operational state

## Workflow
1. Verify video container integrity, duration, resolution, aspect ratio, and frame rate.
2. Probe audio stream for clipping, out-of-spec loudness, or unintended silence.
3. Scan for black frame anomalies or frozen video render errors.
4. Verify subtitle readability and safe-zone compliance (no cutoffs by platform UI).
5. Output QA approval report or trigger automatic production recovery.

## Output
Returns validated artifacts or state updates conforming to the studio workflow contract.

## Failure Policy
Never silently swallow errors or fabricate outputs. Log explicit root-cause diagnostic information and update job status to recoverable failure.
