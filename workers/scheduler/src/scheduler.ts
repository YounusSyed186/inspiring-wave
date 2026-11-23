/**
 * Durable Channel Workflow Scheduler
 * Evaluates channel morning generation, evening clipping, and publishing schedules.
 */

import { Channel, ChannelSchedule, JobType } from '../../../packages/shared-types/src/index';
import { generateIdempotencyKey } from '../../../packages/workflow-contracts/src/index';

export interface SchedulerTickResult {
  triggeredJobs: {
    channelId: string;
    jobType: JobType;
    idempotencyKey: string;
  }[];
  skippedChannels: {
    channelId: string;
    reason: string;
  }[];
}

export class WorkflowScheduler {
  /**
   * Evaluate whether a channel is due for a scheduled morning or evening run
   */
  public evaluateChannel(
    channel: Channel,
    schedule: ChannelSchedule,
    currentTime: Date = new Date(),
    existingKeys: Set<string> = new Set()
  ): { shouldRun: boolean; jobType?: JobType; idempotencyKey?: string; reason?: string } {
    if (!schedule.is_active || channel.status !== 'active') {
      return { shouldRun: false, reason: 'Channel or schedule is inactive' };
    }

    // Check weekday
    const dayOfWeek = currentTime.getUTCDay(); // 0 is Sunday, 1 is Monday...
    if (Array.isArray(schedule.allowed_weekdays) && !schedule.allowed_weekdays.includes(dayOfWeek)) {
      return { shouldRun: false, reason: `Weekday ${dayOfWeek} is not an allowed generation day` };
    }

    const currentHours = currentTime.getUTCHours();
    const currentMinutes = currentTime.getUTCMinutes();
    const dateStr = currentTime.toISOString().split('T')[0];

    // Check Morning Generation Slot
    const [mH, mM] = (schedule.morning_generation_time || '09:00:00').split(':').map(Number);
    if (currentHours === mH && Math.abs(currentMinutes - mM) <= 15) {
      const idempKey = generateIdempotencyKey(channel.id, 'GENERATE_VIDEO', `${dateStr}_morning`);
      if (!existingKeys.has(idempKey)) {
        return {
          shouldRun: true,
          jobType: 'GENERATE_VIDEO',
          idempotencyKey: idempKey
        };
      }
    }

    // Check Evening Clipping Slot
    const [eH, eM] = (schedule.evening_clipping_time || '18:00:00').split(':').map(Number);
    if (currentHours === eH && Math.abs(currentMinutes - eM) <= 15) {
      const idempKey = generateIdempotencyKey(channel.id, 'CLIP_VIDEO', `${dateStr}_evening`);
      if (!existingKeys.has(idempKey)) {
        return {
          shouldRun: true,
          jobType: 'CLIP_VIDEO',
          idempotencyKey: idempKey
        };
      }
    }

    return { shouldRun: false, reason: 'No schedule slot currently open' };
  }
}

export const defaultScheduler = new WorkflowScheduler();
