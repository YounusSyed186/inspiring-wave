/**
 * Core Multi-Agent Orchestrator Types, Contracts and Schemas
 */

import { z } from 'zod';
import { GeminiClient } from '../../../integrations/gemini/src/client';

export type WorkerRoleType =
  | 'ai-worker'
  | 'animation-worker'
  | 'render-worker'
  | 'audio-worker'
  | 'quality-worker';

export interface ExecutionBudget {
  maxTokens: number;
  maxCostUsd: number;
  timeoutMs: number;
  maxRetries: number;
}

export interface StructuredLogger {
  info(msg: string, meta?: Record<string, unknown>): void;
  warn(msg: string, meta?: Record<string, unknown>): void;
  error(msg: string, meta?: Record<string, unknown>): void;
  debug(msg: string, meta?: Record<string, unknown>): void;
}

export interface ArtifactData<T = unknown> {
  id: string;
  projectId?: string;
  jobId: string;
  taskId?: string;
  artifactType: string;
  version: number;
  schemaVersion: string;
  content: T;
  uri?: string;
  checksumSha256?: string;
  fileSizeBytes?: number;
  mimeType?: string;
  createdAt: string;
}

export interface AgentExecutionContext {
  projectId: string;
  jobId: string;
  taskId: string;
  agentRunId: string;
  abortSignal?: AbortSignal;
  inputArtifacts: Record<string, ArtifactData<unknown>>;
  skillRegistry: string[];
  authorizedTools: string[];
  geminiClient: GeminiClient;
  workDir: string;
  logger: StructuredLogger;
  budget: ExecutionBudget;
}

export interface ValidationResult {
  valid: boolean;
  score: number;
  issues: string[];
  feedback?: string;
}

export interface ProductionAgent<Input, Output> {
  id: string;
  name: string;
  role: string;
  workerType: WorkerRoleType;
  skills: string[];
  modelConfig: {
    model: string;
    temperature?: number;
    maxTokens?: number;
  };
  inputSchema: z.ZodType<Input>;
  outputSchema: z.ZodType<Output>;

  execute(input: Input, context: AgentExecutionContext): Promise<Output>;
  validate(output: Output, context?: AgentExecutionContext): Promise<ValidationResult>;
}

// Global Agent IDs
export const AGENT_IDS = {
  MASTER_ORCHESTRATOR: 'agent_01_master_orchestrator',
  RESEARCH: 'agent_02_research',
  SCRIPTWRITER: 'agent_03_scriptwriter',
  CREATIVE_DIRECTOR: 'agent_04_creative_director',
  REFERENCE_ANALYSIS: 'agent_05_reference_analysis',
  STORYBOARD_DIRECTOR: 'agent_06_storyboard_director',
  KEYFRAME_ASSET_DESIGNER: 'agent_07_keyframe_asset_designer',
  ANIMATION_TD: 'agent_08_animation_td',
  SCENE_ANIMATOR: 'agent_09_scene_animator',
  AUDIO_DIRECTOR: 'agent_10_audio_director',
  THUMBNAIL_DIRECTOR: 'agent_11_thumbnail_director',
  VISUAL_QA_CRITIC: 'agent_12_visual_qa_critic',
  TECHNICAL_QA: 'agent_13_technical_qa',
  VIDEO_COMPOSITOR: 'agent_14_video_compositor',
  PUBLISHING: 'agent_15_publishing',
} as const;

export type AgentId = (typeof AGENT_IDS)[keyof typeof AGENT_IDS];
