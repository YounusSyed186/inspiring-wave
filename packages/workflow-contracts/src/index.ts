/**
 * Workflow Job Contracts and State Machine Transitions
 */

import { JobType, JobStatus, JobStage } from '../../shared-types/src/index';

export interface WorkflowJobRequest {
  channelId: string;
  jobType: JobType;
  inputReferences: Record<string, unknown>;
  configSnapshot: Record<string, unknown>;
  idempotencyKey?: string;
}

export function generateIdempotencyKey(
  channelId: string,
  jobType: string,
  occurrenceTimestamp: string | number
): string {
  return `${channelId}:${jobType}:${occurrenceTimestamp}`;
}

export const VALID_JOB_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  queued: ['leased', 'cancelled', 'failed'],
  leased: ['running', 'queued', 'failed', 'cancelled'],
  running: ['completed', 'failed', 'cancelled'],
  completed: [],
  failed: ['queued'], // retry
  cancelled: [],
};

export function canTransition(current: JobStatus, next: JobStatus): boolean {
  return VALID_JOB_TRANSITIONS[current]?.includes(next) ?? false;
}

export interface JobLease {
  jobId: string;
  leaseToken: string;
  leasedUntil: Date;
}
