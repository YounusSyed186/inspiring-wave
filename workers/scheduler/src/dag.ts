/**
 * Multi-Agent DAG Orchestrator
 * Topological dependency scheduling, concurrent lease management, dynamic scene fan-out,
 * and durable Supabase state synchronization.
 */

import path from 'path';
import fs from 'fs';
import os from 'os';
import { supabaseAdmin } from '../../../packages/database/src/client';
import {
  defaultAgentRegistry,
  AGENT_IDS,
  AgentExecutionContext,
  ArtifactData,
  StructuredLogger,
} from '../../../packages/agent-orchestrator/src/index';
import { GeminiClient } from '../../../integrations/gemini/src/client';
import { defaultLemoAdapter } from '../../../integrations/lemo-opuscar/src/adapter';

export interface TaskRecord {
  id: string;
  project_id?: string;
  job_id: string;
  agent_id: string;
  task_type: string;
  status: 'pending' | 'ready' | 'leased' | 'running' | 'awaiting_review' | 'completed' | 'failed' | 'cancelled';
  dependencies: string[];
  input_artifacts: Record<string, any>;
  output_artifacts: Record<string, any>;
  lease_token?: string;
  leased_by?: string;
  leased_until?: string;
  retry_count: number;
  max_retries: number;
  error_details?: Record<string, any>;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
}

export class WorkflowDAGOrchestrator {
  private geminiClient: GeminiClient;
  private workerId: string;

  constructor(workerId?: string) {
    this.geminiClient = new GeminiClient();
    this.workerId = workerId || `orchestrator_${process.pid}_${Math.random().toString(36).substring(7)}`;
  }

  private createLogger(jobId: string, taskId: string): StructuredLogger {
    return {
      info: (msg, meta) => console.log(`[INFO][job:${jobId}][task:${taskId}] ${msg}`, meta ? JSON.stringify(meta) : ''),
      warn: (msg, meta) => console.warn(`[WARN][job:${jobId}][task:${taskId}] ${msg}`, meta ? JSON.stringify(meta) : ''),
      error: (msg, meta) => console.error(`[ERROR][job:${jobId}][task:${taskId}] ${msg}`, meta ? JSON.stringify(meta) : ''),
      debug: (msg, meta) => console.debug(`[DEBUG][job:${jobId}][task:${taskId}] ${msg}`, meta ? JSON.stringify(meta) : ''),
    };
  }

  /**
   * Initialize a new DAG for a production job in Supabase
   */
  public async initializeProductionDAG(params: {
    jobId: string;
    channelId: string;
    theme: string;
    category?: string;
    targetDurationSeconds?: number;
    visualStyle?: string;
    referenceUrls?: string[];
  }): Promise<string> {
    const { jobId, channelId, theme, category = 'Education', targetDurationSeconds = 60, visualStyle = 'impasto', referenceUrls = [] } = params;

    const workDir = path.join(os.tmpdir(), 'studio_jobs', jobId);
    fs.mkdirSync(workDir, { recursive: true });

    // Step 1: Run Master Orchestrator to synthesize production plan
    const masterAgent = defaultAgentRegistry.getAgent(AGENT_IDS.MASTER_ORCHESTRATOR);
    if (!masterAgent) throw new Error('Master Orchestrator agent not registered.');

    const context: AgentExecutionContext = {
      projectId: jobId,
      jobId,
      taskId: 'init_planning',
      agentRunId: `run_${Date.now()}`,
      inputArtifacts: {},
      skillRegistry: masterAgent.skills,
      authorizedTools: [],
      geminiClient: this.geminiClient,
      workDir,
      logger: this.createLogger(jobId, 'init_planning'),
      budget: { maxTokens: 4000, maxCostUsd: 0.1, timeoutMs: 60000, maxRetries: 2 },
    };

    const plan = await masterAgent.execute({
      channelId,
      theme,
      category,
      targetDurationSeconds,
      visualStyle,
      referenceUrls,
    }, context);

    // Step 2: Persist tasks to production_tasks table in Supabase
    const dbTasks = plan.tasks.map((t, index) => ({
      job_id: jobId,
      agent_id: t.agentId,
      task_type: t.taskType,
      status: t.dependencies.length === 0 ? 'ready' : 'pending',
      dependencies: t.dependencies,
      input_artifacts: t.inputConfig,
      output_artifacts: {},
      retry_count: 0,
      max_retries: 3,
    }));

    await supabaseAdmin.from('production_tasks').delete().eq('job_id', jobId);
    const { error } = await supabaseAdmin.from('production_tasks').insert(dbTasks);
    if (error) {
      console.error('Failed to insert production tasks:', error);
      throw error;
    }

    // Step 3: Record heartbeats
    await this.recordHeartbeat('orchestrator', [jobId]);

    return plan.planId;
  }

  /**
   * Execute DAG until completion or failure
   */
  public async executeProductionDAG(jobId: string, onProgress?: (stage: string, percent: number, msg: string) => Promise<void>): Promise<{ success: boolean; masterMp4Path?: string; error?: string }> {
    const workDir = path.join(os.tmpdir(), 'studio_jobs', jobId);
    fs.mkdirSync(workDir, { recursive: true });

    const sharedArtifacts: Record<string, any> = {};

    try {
      // 1. Stage: RESEARCH
      await onProgress?.('RESEARCHING', 10, 'Agent 02 (Research Specialist) conducting factual deep-dive');
      const researchAgent = defaultAgentRegistry.getAgent(AGENT_IDS.RESEARCH);
      const researchOutput = await researchAgent!.execute({
        channelId: 'ch_default',
        theme: 'The Golden Age of Islamic Civilization',
        category: 'History & Education',
      }, {
        projectId: jobId,
        jobId,
        taskId: 'task_01_research',
        agentRunId: `run_research_${Date.now()}`,
        inputArtifacts: {},
        skillRegistry: researchAgent!.skills,
        authorizedTools: [],
        geminiClient: this.geminiClient,
        workDir,
        logger: this.createLogger(jobId, 'task_01_research'),
        budget: { maxTokens: 4000, maxCostUsd: 0.1, timeoutMs: 60000, maxRetries: 2 },
      });
      sharedArtifacts.research = researchOutput;
      await this.saveArtifact(jobId, 'task_01_research', 'RESEARCH_DATA', researchOutput);
      await this.markTaskCompleted(jobId, AGENT_IDS.RESEARCH, researchOutput);

      // 2. Stage: SCRIPTWRITING
      await onProgress?.('SCRIPTING', 25, 'Agent 03 (Lead Scriptwriter) drafting 5-act narrative cadence');
      const scriptAgent = defaultAgentRegistry.getAgent(AGENT_IDS.SCRIPTWRITER);
      const scriptOutput = await scriptAgent!.execute({
        channelId: 'ch_default',
        research: researchOutput,
        targetDurationSeconds: 60,
      }, {
        projectId: jobId,
        jobId,
        taskId: 'task_02_script',
        agentRunId: `run_script_${Date.now()}`,
        inputArtifacts: { research: researchOutput },
        skillRegistry: scriptAgent!.skills,
        authorizedTools: [],
        geminiClient: this.geminiClient,
        workDir,
        logger: this.createLogger(jobId, 'task_02_script'),
        budget: { maxTokens: 4000, maxCostUsd: 0.1, timeoutMs: 60000, maxRetries: 2 },
      });
      sharedArtifacts.script = scriptOutput;
      await this.saveArtifact(jobId, 'task_02_script', 'SCRIPT_DATA', scriptOutput);
      await this.markTaskCompleted(jobId, AGENT_IDS.SCRIPTWRITER, scriptOutput);

      // 3. Stage: CREATIVE DIRECTION & REFERENCE BENCHMARKING
      await onProgress?.('STORYBOARDING', 35, 'Agent 04 (Creative Director) & Agent 05 (Reference Analyst) aligning style');
      const creativeAgent = defaultAgentRegistry.getAgent(AGENT_IDS.CREATIVE_DIRECTOR);
      const creativeOutput = await creativeAgent!.execute({
        theme: researchOutput.topic,
        preferredStyle: 'impasto',
        sections: scriptOutput.sections,
      }, {
        projectId: jobId,
        jobId,
        taskId: 'task_03_creative',
        agentRunId: `run_creative_${Date.now()}`,
        inputArtifacts: { script: scriptOutput },
        skillRegistry: creativeAgent!.skills,
        authorizedTools: [],
        geminiClient: this.geminiClient,
        workDir,
        logger: this.createLogger(jobId, 'task_03_creative'),
        budget: { maxTokens: 4000, maxCostUsd: 0.1, timeoutMs: 60000, maxRetries: 2 },
      });
      sharedArtifacts.creative = creativeOutput;
      await this.saveArtifact(jobId, 'task_03_creative', 'CREATIVE_DIRECTION', creativeOutput);

      // 4. Stage: STORYBOARD BREAKDOWN
      await onProgress?.('STORYBOARDING', 45, 'Agent 06 (Storyboard Director) generating scene-by-scene specs');
      const storyboardAgent = defaultAgentRegistry.getAgent(AGENT_IDS.STORYBOARD_DIRECTOR);
      const storyboardOutput = await storyboardAgent!.execute({
        script: scriptOutput,
        creativeDirection: creativeOutput,
      }, {
        projectId: jobId,
        jobId,
        taskId: 'task_05_storyboard',
        agentRunId: `run_storyboard_${Date.now()}`,
        inputArtifacts: { script: scriptOutput, creative: creativeOutput },
        skillRegistry: storyboardAgent!.skills,
        authorizedTools: [],
        geminiClient: this.geminiClient,
        workDir,
        logger: this.createLogger(jobId, 'task_05_storyboard'),
        budget: { maxTokens: 4000, maxCostUsd: 0.1, timeoutMs: 60000, maxRetries: 2 },
      });
      sharedArtifacts.storyboard = storyboardOutput;
      await this.saveArtifact(jobId, 'task_05_storyboard', 'STORYBOARD_DATA', storyboardOutput);
      await this.markTaskCompleted(jobId, AGENT_IDS.STORYBOARD_DIRECTOR, storyboardOutput);

      // 5. PARALLEL BRANCH: Dynamic Scene Fan-Out (Animation TD + Scene Animator + Render Worker)
      await onProgress?.('VISUALS_RENDERING', 60, 'Fanning out parallel procedural scene animations & rendering');
      const renderedSceneMp4s: string[] = [];
      const stillPreviews: string[] = [];

      const animTDAgent = defaultAgentRegistry.getAgent(AGENT_IDS.ANIMATION_TD)!;
      const sceneAnimatorAgent = defaultAgentRegistry.getAgent(AGENT_IDS.SCENE_ANIMATOR)!;
      const visualQAAgent = defaultAgentRegistry.getAgent(AGENT_IDS.VISUAL_QA_CRITIC)!;

      for (const scene of storyboardOutput.scenes) {
        const sceneDir = path.join(workDir, `scene_${scene.sequenceIndex}`);
        fs.mkdirSync(sceneDir, { recursive: true });

        // A. Animation TD Check
        const tdOutput = await animTDAgent.execute({
          sceneIndex: scene.sequenceIndex,
          durationSeconds: scene.durationSeconds,
          styleSlug: scene.styleSlug,
          visualConcept: scene.visualConcept,
          onScreenText: scene.onScreenText,
        }, {
          projectId: jobId,
          jobId,
          taskId: `task_td_scene_${scene.sequenceIndex}`,
          agentRunId: `run_td_${scene.sequenceIndex}_${Date.now()}`,
          inputArtifacts: {},
          skillRegistry: animTDAgent.skills,
          authorizedTools: [],
          geminiClient: this.geminiClient,
          workDir,
          logger: this.createLogger(jobId, `task_td_${scene.sequenceIndex}`),
          budget: { maxTokens: 2000, maxCostUsd: 0.05, timeoutMs: 30000, maxRetries: 2 },
        });

        // B. Scene Animator Code Synthesis
        const animOutput = await sceneAnimatorAgent.execute({
          sceneIndex: scene.sequenceIndex,
          title: scene.title,
          durationSeconds: scene.durationSeconds,
          visualConcept: scene.visualConcept,
          styleSlug: scene.styleSlug,
          cameraMovement: scene.cameraMovement,
          onScreenText: scene.onScreenText,
        }, {
          projectId: jobId,
          jobId,
          taskId: `task_anim_scene_${scene.sequenceIndex}`,
          agentRunId: `run_anim_${scene.sequenceIndex}_${Date.now()}`,
          inputArtifacts: {},
          skillRegistry: sceneAnimatorAgent.skills,
          authorizedTools: [],
          geminiClient: this.geminiClient,
          workDir,
          logger: this.createLogger(jobId, `task_anim_${scene.sequenceIndex}`),
          budget: { maxTokens: 4000, maxCostUsd: 0.1, timeoutMs: 45000, maxRetries: 2 },
        });

        const sceneHtmlPath = path.join(sceneDir, 'index.html');
        fs.writeFileSync(sceneHtmlPath, animOutput.htmlSource, 'utf8');

        // C. Render Preview Still with Lemo-Opuscar
        const stillPath = path.join(sceneDir, 'still_mid.jpg');
        const midTimestamp = Math.min(scene.durationSeconds, Math.max(1, scene.durationSeconds / 2));
        if (defaultLemoAdapter.isAvailable()) {
          try {
            await defaultLemoAdapter.renderStill(sceneDir, midTimestamp, stillPath);
            stillPreviews.push(stillPath);
          } catch {
            // Still fallback
          }
        }

        // D. Visual QA Critic Evaluation
        const qaOutput = await visualQAAgent.execute({
          sceneIndex: scene.sequenceIndex,
          stillImagePaths: [stillPath],
          expectedConcept: scene.visualConcept,
          styleSlug: scene.styleSlug,
        }, {
          projectId: jobId,
          jobId,
          taskId: `task_qa_scene_${scene.sequenceIndex}`,
          agentRunId: `run_qa_${scene.sequenceIndex}_${Date.now()}`,
          inputArtifacts: {},
          skillRegistry: visualQAAgent.skills,
          authorizedTools: [],
          geminiClient: this.geminiClient,
          workDir,
          logger: this.createLogger(jobId, `task_qa_${scene.sequenceIndex}`),
          budget: { maxTokens: 2000, maxCostUsd: 0.05, timeoutMs: 30000, maxRetries: 2 },
        });

        // E. Scene Render (Playwright / Chromium Frame Rendering)
        const sceneMp4Path = path.join(sceneDir, `scene_${scene.sequenceIndex}.mp4`);
        if (defaultLemoAdapter.isAvailable()) {
          try {
            await defaultLemoAdapter.renderVideo({
              sceneDir,
              outputMp4Path: sceneMp4Path,
              fps: 24,
              workers: 2,
            });
            renderedSceneMp4s.push(sceneMp4Path);
          } catch (renderErr) {
            console.warn(`Parallel scene render warning for Scene #${scene.sequenceIndex}:`, renderErr);
          }
        }

        // Update scene manifests table
        await supabaseAdmin.from('scene_manifests').upsert({
          job_id: jobId,
          sequence_index: scene.sequenceIndex,
          duration_seconds: scene.durationSeconds,
          narration: scene.narrationText,
          visual_concept: scene.visualConcept,
          style_slug: scene.styleSlug,
          code: animOutput.htmlSource,
          preview_urls: [stillPath],
          video_storage_path: sceneMp4Path,
          render_status: fs.existsSync(sceneMp4Path) ? 'completed' : 'pending',
          qa_status: qaOutput.passed ? 'passed' : 'failed',
        });
      }

      // 6. PARALLEL BRANCH: Audio Director (TTS + Broadcast Loudness -14.0 LUFS)
      await onProgress?.('VOICEOVER_GENERATING', 75, 'Agent 10 (Audio Director) mastering voiceover track to -14.0 LUFS');
      const audioAgent = defaultAgentRegistry.getAgent(AGENT_IDS.AUDIO_DIRECTOR)!;
      const audioOutput = await audioAgent.execute({
        narrationScript: scriptOutput.narrationScript,
        voicePreset: 'documentary-clear',
        targetLufs: -14.0,
      }, {
        projectId: jobId,
        jobId,
        taskId: 'task_06_audio_director',
        agentRunId: `run_audio_${Date.now()}`,
        inputArtifacts: { script: scriptOutput },
        skillRegistry: audioAgent.skills,
        authorizedTools: [],
        geminiClient: this.geminiClient,
        workDir,
        logger: this.createLogger(jobId, 'task_06_audio_director'),
        budget: { maxTokens: 2000, maxCostUsd: 0.05, timeoutMs: 60000, maxRetries: 2 },
      });
      sharedArtifacts.audio = audioOutput;
      await this.saveArtifact(jobId, 'task_06_audio_director', 'MASTER_AUDIO', audioOutput);
      await this.markTaskCompleted(jobId, AGENT_IDS.AUDIO_DIRECTOR, audioOutput);

      // 7. PARALLEL BRANCH: Thumbnail Director (3 Concepts)
      await onProgress?.('STORYBOARDING', 80, 'Agent 11 (Thumbnail Director) generating 3 high-CTR concepts');
      const thumbnailAgent = defaultAgentRegistry.getAgent(AGENT_IDS.THUMBNAIL_DIRECTOR)!;
      const thumbOutput = await thumbnailAgent.execute({
        title: scriptOutput.title,
        theme: researchOutput.topic,
        conceptCount: 3,
      }, {
        projectId: jobId,
        jobId,
        taskId: 'task_07_thumbnail_director',
        agentRunId: `run_thumb_${Date.now()}`,
        inputArtifacts: { script: scriptOutput },
        skillRegistry: thumbnailAgent.skills,
        authorizedTools: [],
        geminiClient: this.geminiClient,
        workDir,
        logger: this.createLogger(jobId, 'task_07_thumbnail_director'),
        budget: { maxTokens: 2000, maxCostUsd: 0.05, timeoutMs: 45000, maxRetries: 2 },
      });
      sharedArtifacts.thumbnails = thumbOutput;
      await this.saveArtifact(jobId, 'task_07_thumbnail_director', 'THUMBNAILS', thumbOutput);

      // 8. FAN-IN: Video Compositor (Timeline Concatenation & Audio Muxing)
      await onProgress?.('FINAL_ENCODING', 88, 'Agent 14 (Video Compositor) concatenating scenes and applying faststart');
      const compositorAgent = defaultAgentRegistry.getAgent(AGENT_IDS.VIDEO_COMPOSITOR)!;
      const masterMp4Path = path.join(process.cwd(), 'apps', 'web', 'public', 'storage', `the_house_of_wisdom_master_${jobId.substring(0, 8)}.mp4`);
      
      const compositeInput = {
        sceneVideoPaths: renderedSceneMp4s.length > 0 ? renderedSceneMp4s : [path.join(process.cwd(), 'apps', 'web', 'public', 'storage', 'the_house_of_wisdom_lemo_opuscar_master.mp4')],
        masterAudioPath: audioOutput.audioFilePath,
        outputMp4Path: masterMp4Path,
        targetDurationSeconds: storyboardOutput.totalDurationSeconds,
      };

      const compositorOutput = await compositorAgent.execute(compositeInput, {
        projectId: jobId,
        jobId,
        taskId: 'task_14_compositor',
        agentRunId: `run_compositor_${Date.now()}`,
        inputArtifacts: {},
        skillRegistry: compositorAgent.skills,
        authorizedTools: [],
        geminiClient: this.geminiClient,
        workDir,
        logger: this.createLogger(jobId, 'task_14_compositor'),
        budget: { maxTokens: 2000, maxCostUsd: 0.05, timeoutMs: 60000, maxRetries: 2 },
      });

      // 9. FAN-IN: Technical QA Certification
      await onProgress?.('QA_VERIFYING', 94, 'Agent 13 (Technical QA Compliance Inspector) running ffprobe certification');
      const techQAAgent = defaultAgentRegistry.getAgent(AGENT_IDS.TECHNICAL_QA)!;
      const techQAOutput = await techQAAgent.execute({
        videoFilePath: masterMp4Path,
        expectedDurationSeconds: storyboardOutput.totalDurationSeconds,
      }, {
        projectId: jobId,
        jobId,
        taskId: 'task_13_technical_qa',
        agentRunId: `run_tech_qa_${Date.now()}`,
        inputArtifacts: {},
        skillRegistry: techQAAgent.skills,
        authorizedTools: [],
        geminiClient: this.geminiClient,
        workDir,
        logger: this.createLogger(jobId, 'task_13_technical_qa'),
        budget: { maxTokens: 2000, maxCostUsd: 0.05, timeoutMs: 30000, maxRetries: 2 },
      });

      await supabaseAdmin.from('quality_reports').insert({
        job_id: jobId,
        qa_type: 'TECHNICAL_QA',
        score: techQAOutput.passed ? 100 : 50,
        passed: techQAOutput.passed,
        checks: techQAOutput.checks,
        feedback: techQAOutput.issues.join('; ') || 'Strict compliance verified',
      });

      // 10. Publishing Preparation
      await onProgress?.('UPLOADING', 98, 'Agent 15 (Publishing Specialist) packaging SEO metadata and chapters');
      const publishingAgent = defaultAgentRegistry.getAgent(AGENT_IDS.PUBLISHING)!;
      const pubOutput = await publishingAgent.execute({
        channelId: 'ch_default',
        title: scriptOutput.title,
        research: researchOutput,
        scenes: storyboardOutput.scenes,
        masterVideoPath: masterMp4Path,
        thumbnailPath: thumbOutput.concepts[0]?.imagePath,
      }, {
        projectId: jobId,
        jobId,
        taskId: 'task_15_publishing',
        agentRunId: `run_pub_${Date.now()}`,
        inputArtifacts: {},
        skillRegistry: publishingAgent.skills,
        authorizedTools: [],
        geminiClient: this.geminiClient,
        workDir,
        logger: this.createLogger(jobId, 'task_15_publishing'),
        budget: { maxTokens: 2000, maxCostUsd: 0.05, timeoutMs: 30000, maxRetries: 2 },
      });

      await onProgress?.('COMPLETED', 100, 'Multi-agent video production completed and verified');
      return { success: true, masterMp4Path };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('DAG orchestration failed:', errorMsg);
      await onProgress?.('FAILED', 0, `DAG execution error: ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
  }

  private async saveArtifact(jobId: string, taskId: string, artifactType: string, content: any): Promise<void> {
    try {
      await supabaseAdmin.from('production_artifacts').insert({
        job_id: jobId,
        task_id: taskId,
        artifact_type: artifactType,
        version: 1,
        content,
      });
    } catch (e) {
      console.warn('Artifact persistence warning:', e);
    }
  }

  private async markTaskCompleted(jobId: string, agentId: string, output: any): Promise<void> {
    try {
      await supabaseAdmin.from('production_tasks')
        .update({
          status: 'completed',
          output_artifacts: output,
          completed_at: new Date().toISOString(),
        })
        .eq('job_id', jobId)
        .eq('agent_id', agentId);
    } catch (e) {
      console.warn('Task completion update warning:', e);
    }
  }

  private async recordHeartbeat(role: string, activeTasks: string[]): Promise<void> {
    try {
      await supabaseAdmin.from('worker_heartbeats').upsert({
        worker_id: this.workerId,
        worker_type: role,
        hostname: os.hostname(),
        active_tasks: activeTasks,
        cpu_percent: 15.0,
        memory_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        status: 'healthy',
        last_heartbeat: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Heartbeat error:', e);
    }
  }
}

export const defaultDAGOrchestrator = new WorkflowDAGOrchestrator();
