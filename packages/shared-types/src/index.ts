/**
 * Shared Type Definitions for Autonomous Multi-Channel AI Video Studio
 */

export type JobType = 
  | 'GENERATE_VIDEO'
  | 'PROCESS_SOURCE'
  | 'CLIP_VIDEO'
  | 'RENDER_VIDEO'
  | 'PUBLISH_YOUTUBE';

export type JobStatus = 
  | 'queued'
  | 'leased'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type JobStage =
  | 'INITIALIZED'
  | 'RESEARCHING'
  | 'SCRIPTING'
  | 'STORYBOARDING'
  | 'VOICEOVER_GENERATING'
  | 'VISUALS_RENDERING'
  | 'AUDIO_MIXING'
  | 'FINAL_ENCODING'
  | 'TRANSCRIBING'
  | 'SCENE_DETECTING'
  | 'HIGHLIGHT_ANALYZING'
  | 'CROP_CALCULATING'
  | 'SUBTITLE_BURNING'
  | 'QA_VERIFYING'
  | 'UPLOADING'
  | 'COMPLETED';

export type CropMode = 
  | 'FACE_TRACKING'
  | 'MULTI_SPEAKER'
  | 'SLIDE_PRESERVATION'
  | 'CENTER_CROP'
  | 'BLURRED_BACKGROUND'
  | 'MANUAL';

export type RenderStrategy =
  | 'LEMO_OPUSCAR'
  | 'REMOTION'
  | 'IMAGE_ANIMATION'
  | 'OWNED_MEDIA'
  | 'LICENSED_ASSETS'
  | 'AI_VIDEO';

export interface Channel {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description?: string;
  category: string;
  language: string;
  timezone: string;
  target_audience?: string;
  default_visibility: 'public' | 'unlisted' | 'private';
  approval_required: boolean;
  status: 'active' | 'paused' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface ChannelSchedule {
  id: string;
  channel_id: string;
  morning_generation_time: string;
  evening_clipping_time: string;
  publishing_time: string;
  allowed_weekdays: number[];
  daily_publish_limit: number;
  auto_publish_enabled: boolean;
  timezone: string;
  is_active: boolean;
}

export interface ContentIdea {
  id: string;
  channel_id: string;
  topic: string;
  audience?: string;
  content_angle?: string;
  hook_options: string[];
  factual_claims: string[];
  uniqueness_score: number;
  channel_relevance_score: number;
  production_complexity: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'proposed' | 'approved' | 'rejected' | 'in_production' | 'published';
}

export interface Script {
  id: string;
  channel_id: string;
  idea_id?: string;
  title: string;
  title_options: string[];
  hook: string;
  introduction: string;
  narrative_outline: string[];
  full_narration_script: string;
  conclusion: string;
  call_to_action?: string;
  target_duration_seconds: number;
  current_version: number;
  status: 'draft' | 'approved' | 'rejected';
}

export interface StoryboardScene {
  id: string;
  storyboard_id: string;
  sequence_index: number;
  duration_seconds: number;
  narration_segment: string;
  visual_concept: string;
  animation_instructions?: string;
  camera_movement?: string;
  transition_in?: string;
  transition_out?: string;
  on_screen_text?: string;
  music_cue?: string;
  sound_effect_cue?: string;
  render_strategy: RenderStrategy;
  style_slug?: string;
}

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
  probability?: number;
}

export interface TranscriptSegment {
  id: string;
  transcript_id: string;
  sequence_index: number;
  start_time_seconds: number;
  end_time_seconds: number;
  text: string;
  words: WordTimestamp[];
  speaker_id?: string;
  confidence: number;
}

export interface ClipCandidate {
  id: string;
  source_video_id: string;
  channel_id: string;
  start_time_seconds: number;
  end_time_seconds: number;
  duration_seconds: number;
  topic: string;
  opening_hook: string;
  summary: string;
  suggested_title: string;
  suitability_assessment?: string;
  score?: ClipScore;
}

export interface ClipScore {
  hook_strength: number;
  content_value: number;
  narrative_completeness: number;
  audience_relevance: number;
  clarity: number;
  visual_suitability: number;
  novelty: number;
  composite_score: number;
  scoring_rationale?: string;
}

export interface ProductionJob {
  id: string;
  channel_id: string;
  job_type: JobType;
  workflow_config_snapshot: Record<string, unknown>;
  idempotency_key: string;
  status: JobStatus;
  stage: JobStage;
  progress_percentage: number;
  retry_count: number;
  max_retries: number;
  error_details?: Record<string, unknown>;
  estimated_cost_usd?: number;
  actual_cost_usd?: number;
  leased_by?: string;
  leased_until?: string;
  cancellation_flag: boolean;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface RenderOutput {
  id: string;
  job_id: string;
  channel_id: string;
  video_type: 'ORIGINAL_GENERATION' | 'SHORT_CLIP';
  storage_path: string;
  duration_seconds: number;
  width: number;
  height: number;
  fps: number;
  file_size_bytes: number;
  codec: string;
  qa_passed: boolean;
  qa_details: Record<string, unknown>;
  created_at: string;
}
