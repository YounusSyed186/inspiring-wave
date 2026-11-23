---
name: virality-ranking
description: Scores clip candidates using a multi-factor editorial heuristic model to prioritize high-engagement Short candidates.
---

# Virality Ranking

Scores clip candidates using a multi-factor editorial heuristic model to prioritize high-engagement Short candidates.

## Inputs
- Production job context and configuration snapshot
- Channel identity profile and content parameters
- Input media, scripts, or operational state

## Workflow
1. Ingest candidate segments from highlight detection.
2. Score hook strength (20%), content value (20%), and narrative completeness (20%).
3. Score audience relevance (15%), clarity (10%), visual suitability (10%), and novelty (5%).
4. Compute weighted composite score.
5. Deduplicate overlapping selections and rank top candidates for rendering.

## Output
Returns validated artifacts or state updates conforming to the studio workflow contract.

## Failure Policy
Never silently swallow errors or fabricate outputs. Log explicit root-cause diagnostic information and update job status to recoverable failure.
