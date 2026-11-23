---
name: voiceover-production
description: Orchestrates neural text-to-speech synthesis, speech pacing, silence trimming, and word-level phoneme alignment.
---

# Voiceover Production

Orchestrates neural text-to-speech synthesis, speech pacing, silence trimming, and word-level phoneme alignment.

## Inputs
- Production job context and configuration snapshot
- Channel identity profile and content parameters
- Input media, scripts, or operational state

## Workflow
1. Select voice model based on channel profile (Kokoro, Piper, or Gemini TTS).
2. Apply phonetic corrections and pronunciation overrides for technical/foreign words.
3. Synthesize speech audio at 24kHz / 48kHz uncompressed WAV.
4. Trim leading/trailing dead air and excessive inter-sentence gaps (>0.6s).
5. Extract exact word-level timestamp boundaries.

## Output
Returns validated artifacts or state updates conforming to the studio workflow contract.

## Failure Policy
Never silently swallow errors or fabricate outputs. Log explicit root-cause diagnostic information and update job status to recoverable failure.
