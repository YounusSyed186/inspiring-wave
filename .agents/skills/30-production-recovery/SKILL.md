---
name: production-recovery
description: Detects worker crashes, stalled renders, or expired API sessions, recovering jobs gracefully without duplicating work.
---

# Production Recovery

Detects worker crashes, stalled renders, or expired API sessions, recovering jobs gracefully without duplicating work.

## Inputs
- Production job context and configuration snapshot
- Channel identity profile and content parameters
- Input media, scripts, or operational state

## Workflow
1. Scan for jobs in 'leased' or 'running' state past their lease timeout threshold.
2. Inspect last recorded job event and artifact checkpoint.
3. Reconcile whether render output was partially written or completed.
4. Resume job from last valid stage rather than restarting from zero.
5. Escalate to dead-letter state with actionable alert if max retries exceeded.

## Output
Returns validated artifacts or state updates conforming to the studio workflow contract.

## Failure Policy
Never silently swallow errors or fabricate outputs. Log explicit root-cause diagnostic information and update job status to recoverable failure.
