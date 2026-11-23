---
name: analytics-analysis
description: Pulls YouTube Analytics performance data to extract retention trends and actionable optimization recommendations.
---

# Analytics Analysis

Pulls YouTube Analytics performance data to extract retention trends and actionable optimization recommendations.

## Inputs
- Production job context and configuration snapshot
- Channel identity profile and content parameters
- Input media, scripts, or operational state

## Workflow
1. Ingest YouTube Analytics API metrics (views, retention curve, CTR, watch time).
2. Identify drop-off points in video retention graphs.
3. Correlate high-performing hooks and visual styles with subscriber gain.
4. Generate weekly channel performance intelligence report.
5. Feed learnings back into the Content Research Agent for future topic ideation.

## Output
Returns validated artifacts or state updates conforming to the studio workflow contract.

## Failure Policy
Never silently swallow errors or fabricate outputs. Log explicit root-cause diagnostic information and update job status to recoverable failure.
