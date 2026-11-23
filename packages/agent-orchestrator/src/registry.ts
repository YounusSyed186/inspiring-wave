/**
 * Central Agent Registry
 * Manages the fleet of 15 specialized production agents
 */

import { ProductionAgent, AGENT_IDS, AgentId } from './types';
import { MasterOrchestratorAgent } from './agents/01-master-orchestrator';
import { ResearchAgent } from './agents/02-research-agent';
import { ScriptwritingAgent } from './agents/03-scriptwriting-agent';
import { CreativeDirectorAgent } from './agents/04-creative-director';
import { ReferenceAnalysisAgent } from './agents/05-reference-analysis';
import { StoryboardDirectorAgent } from './agents/06-storyboard-director';
import { KeyframeAssetDesignerAgent } from './agents/07-keyframe-asset-designer';
import { AnimationTDAgent } from './agents/08-animation-td';
import { SceneAnimatorAgent } from './agents/09-scene-animator';
import { AudioDirectorAgent } from './agents/10-audio-director';
import { ThumbnailDirectorAgent } from './agents/11-thumbnail-director';
import { VisualQACriticAgent } from './agents/12-visual-qa-critic';
import { TechnicalQAAgent } from './agents/13-technical-qa';
import { VideoCompositorAgent } from './agents/14-video-compositor';
import { PublishingAgent } from './agents/15-publishing-agent';

export class AgentRegistry {
  private static instance: AgentRegistry;
  private agents: Map<string, ProductionAgent<any, any>> = new Map();

  private constructor() {
    this.registerDefaults();
  }

  public static getInstance(): AgentRegistry {
    if (!AgentRegistry.instance) {
      AgentRegistry.instance = new AgentRegistry();
    }
    return AgentRegistry.instance;
  }

  private registerDefaults(): void {
    this.register(new MasterOrchestratorAgent());
    this.register(new ResearchAgent());
    this.register(new ScriptwritingAgent());
    this.register(new CreativeDirectorAgent());
    this.register(new ReferenceAnalysisAgent());
    this.register(new StoryboardDirectorAgent());
    this.register(new KeyframeAssetDesignerAgent());
    this.register(new AnimationTDAgent());
    this.register(new SceneAnimatorAgent());
    this.register(new AudioDirectorAgent());
    this.register(new ThumbnailDirectorAgent());
    this.register(new VisualQACriticAgent());
    this.register(new TechnicalQAAgent());
    this.register(new VideoCompositorAgent());
    this.register(new PublishingAgent());
  }

  public register(agent: ProductionAgent<any, any>): void {
    this.agents.set(agent.id, agent);
  }

  public getAgent<Input, Output>(id: AgentId | string): ProductionAgent<Input, Output> | undefined {
    return this.agents.get(id);
  }

  public listAgents(): ProductionAgent<any, any>[] {
    return Array.from(this.agents.values());
  }
}

export const defaultAgentRegistry = AgentRegistry.getInstance();
