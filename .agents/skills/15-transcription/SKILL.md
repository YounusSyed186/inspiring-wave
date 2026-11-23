---
name: transcription
description: Extracts ultra-accurate text and word-level timestamps from long-form audio/video using whisper.cpp and faster-whisper.
---

# Transcription

Extracts ultra-accurate text and word-level timestamps from long-form audio/video using whisper.cpp and faster-whisper.

## Inputs
- Production job context and configuration snapshot
- Channel identity profile and content parameters
- Input media, scripts, or operational state

## Workflow
1. Extract 16kHz mono audio stream from source media.
2. Run local Whisper model (ggml-large-v3) with word timestamp extraction.
3. Detect spoken language and segment boundaries.
4. Filter non-speech vocalizations and handle background music interference.
5. Format structured transcript segments with millisecond accuracy.

## Output
Returns validated artifacts or state updates conforming to the studio workflow contract.

## Failure Policy
Never silently swallow errors or fabricate outputs. Log explicit root-cause diagnostic information and update job status to recoverable failure.
