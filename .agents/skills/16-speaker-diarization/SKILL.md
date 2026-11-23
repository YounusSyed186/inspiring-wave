---
name: speaker-diarization
description: Differentiates and labels individual speaker voices across conversational and interview videos.
---

# Speaker Diarization

Differentiates and labels individual speaker voices across conversational and interview videos.

## Inputs
- Production job context and configuration snapshot
- Channel identity profile and content parameters
- Input media, scripts, or operational state

## Workflow
1. Process audio stream through voice activity detection (VAD).
2. Extract speaker voice embeddings across active dialogue chunks.
3. Cluster embeddings to assign persistent speaker labels (SPEAKER_00, SPEAKER_01).
4. Map speaker boundaries onto timestamped transcript segments.
5. Support speaker-specific subtitle coloring and smart crop tracking.

## Output
Returns validated artifacts or state updates conforming to the studio workflow contract.

## Failure Policy
Never silently swallow errors or fabricate outputs. Log explicit root-cause diagnostic information and update job status to recoverable failure.
