---
name: multi-channel-scheduling
description: Coordinates morning generation and evening clipping workflows across multiple independent channel schedules.
---

# Multi Channel Scheduling

Coordinates morning generation and evening clipping workflows across multiple independent channel schedules.

## Inputs
- Production job context and configuration snapshot
- Channel identity profile and content parameters
- Input media, scripts, or operational state

## Workflow
1. Evaluate active channel schedules against current local timezone times.
2. Trigger morning original video generation jobs when scheduled slot opens.
3. Trigger evening clipping jobs on pending source videos.
4. Enforce channel daily publishing limits and concurrency caps.
5. Dispatch jobs to durable queue with unique idempotency keys.

## Output
Returns validated artifacts or state updates conforming to the studio workflow contract.

## Failure Policy
Never silently swallow errors or fabricate outputs. Log explicit root-cause diagnostic information and update job status to recoverable failure.
