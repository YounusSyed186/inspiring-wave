/**
 * Agent 01: Master Orchestrator
 * Analyzes video request, constructs production DAG with dependencies, and plans execution.
 */

import { z } from 'zod';
import { ProductionAgent, AgentExecutionContext, ValidationResult, AGENT_IDS } from '../types';

export const MasterOrchestratorInputSchema = z.object({
  channelId: z.string(),
  theme: z.string(),
  category: z.string().default('Education'),
  targetDurationSeconds: z.number().default(60),
  visualStyle: z.string().default('impasto'),
  referenceUrls: z.array(z.string()).default([]),
});

export type MasterOrchestratorInput = z.infer<typeof MasterOrchestratorInputSchema>;

export interface DAGTaskPlan {
  taskId: string;
  agentId: string;
  taskType: string;
  workerType: 'ai-worker' | 'animation-worker' | 'render-worker' | 'audio-worker' | 'quality-worker';
  dependencies: string[];
  inputConfig: Record<string, unknown>;
}

export const MasterOrchestratorOutputSchema = z.object({
  planId: z.string(),
  channelId: z.string(),
  theme: z.string(),
  estimatedDurationSeconds: z.number(),
  tasks: z.array(z.object({
    taskId: z.string(),
    agentId: z.string(),
    taskType: z.string(),
    workerType: z.enum(['ai-worker', 'animation-worker', 'render-worker', 'audio-worker', 'quality-worker']),
    dependencies: z.array(z.string()),
    inputConfig: z.record(z.unknown()),
  })),
});

export type MasterOrchestratorOutput = z.infer<typeof MasterOrchestratorOutputSchema>;

export class MasterOrchestratorAgent implements ProductionAgent<MasterOrchestratorInput, MasterOrchestratorOutput> {
  public id = AGENT_IDS.MASTER_ORCHESTRATOR;
  public name = 'Master Orchestrator';
  public role = 'Production Workflow Graph Architect';
  public workerType = 'ai-worker' as const;
  public skills = ['02-topic-planning', '26-multi-channel-scheduling', '30-production-recovery'];
  public modelConfig = { model: 'gemini-2.5-flash', temperature: 0.2 };
  public inputSchema = MasterOrchestratorInputSchema;
  public outputSchema = MasterOrchestratorOutputSchema;

  public async execute(input: MasterOrchestratorInput, context: AgentExecutionContext): Promise<MasterOrchestratorOutput> {
    context.logger.info(`Constructing DAG production graph for: ${input.theme}`);

    const tasks: DAGTaskPlan[] = [
      {
        taskId: 'task_01_research',
        agentId: AGENT_IDS.RESEARCH,
        taskType: 'RESEARCH',
        workerType: 'ai-worker',
        dependencies: [],
        inputConfig: {
          channelId: input.channelId,
          theme: input.theme,
          category: input.category,
        },
      },
      {
        taskId: 'task_02_script',
        agentId: AGENT_IDS.SCRIPTWRITER,
        taskType: 'SCRIPTWRITING',
        workerType: 'ai-worker',
        dependencies: ['task_01_research'],
        inputConfig: {
          channelId: input.channelId,
          targetDurationSeconds: input.targetDurationSeconds,
        },
      },
      {
        taskId: 'task_03_creative_direction',
        agentId: AGENT_IDS.CREATIVE_DIRECTOR,
        taskType: 'CREATIVE_DIRECTION',
        workerType: 'ai-worker',
        dependencies: ['task_02_script'],
        inputConfig: {
          preferredStyle: input.visualStyle,
          theme: input.theme,
        },
      },
      {
        taskId: 'task_04_reference_analysis',
        agentId: AGENT_IDS.REFERENCE_ANALYSIS,
        taskType: 'REFERENCE_ANALYSIS',
        workerType: 'ai-worker',
        dependencies: ['task_03_creative_direction'],
        inputConfig: {
          referenceUrls: input.referenceUrls,
          channelId: input.channelId,
        },
      },
      {
        taskId: 'task_05_storyboard',
        agentId: AGENT_IDS.STORYBOARD_DIRECTOR,
        taskType: 'STORYBOARDING',
        workerType: 'ai-worker',
        dependencies: ['task_03_creative_direction', 'task_04_reference_analysis'],
        inputConfig: {
          targetDurationSeconds: input.targetDurationSeconds,
        },
      },
      {
        taskId: 'task_06_audio_director',
        agentId: AGENT_IDS.AUDIO_DIRECTOR,
        taskType: 'AUDIO_PRODUCTION',
        workerType: 'audio-worker',
        dependencies: ['task_02_script'],
        inputConfig: {
          voicePreset: 'documentary-clear',
          targetLufs: -14.0,
        },
      },
      {
        taskId: 'task_07_thumbnail_director',
        agentId: AGENT_IDS.THUMBNAIL_DIRECTOR,
        taskType: 'THUMBNAIL_GENERATION',
        workerType: 'ai-worker',
        dependencies: ['task_02_script', 'task_03_creative_direction'],
        inputConfig: {
          conceptCount: 3,
        },
      },
    ];

    return {
      planId: `dag_${Date.now()}`,
      channelId: input.channelId,
      theme: input.theme,
      estimatedDurationSeconds: input.targetDurationSeconds,
      tasks,
    };
  }

  public async validate(output: MasterOrchestratorOutput): Promise<ValidationResult> {
    const valid = output.tasks.length >= 7;
    return {
      valid,
      score: valid ? 1.0 : 0.4,
      issues: valid ? [] : ['Plan contains insufficient dependency nodes.'],
    };
  }
}
