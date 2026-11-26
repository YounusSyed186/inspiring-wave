import {
  computeEffectiveDpr,
  detectDeviceCapabilities,
  QUALITY_PROFILES,
  type QualityProfile,
  type QualityTier,
} from './DeviceCapabilities';

export interface PerformanceSnapshot {
  fps: number;
  avgFps: number;
  medianFrameMs: number;
  p95FrameMs: number;
  longFrames: number;
  tier: QualityTier;
  effectiveDpr: number;
  frozenDpr: boolean;
  forcedTier: QualityTier | null;
}

type QualityListener = (profile: QualityProfile) => void;

const TIER_ORDER: QualityTier[] = ['low', 'balanced', 'high', 'ultra'];

class AdaptiveQualityEngine {
  private capabilities = detectDeviceCapabilities();
  private currentTier: QualityTier = this.capabilities.initialTier;
  private forcedTier: QualityTier | null = null;
  private freezeDpr = false;
  private listeners = new Set<QualityListener>();

  private frameWindow: number[] = [];
  private readonly maxSamples = 90;
  private longFrames = 0;
  private lastSampleTime = 0;
  private lastAdjustmentTime = 0;
  private warmupUntil = 0;

  constructor() {
    if (typeof performance !== 'undefined') {
      this.warmupUntil = performance.now() + 2500;
    }
  }

  getProfile(): QualityProfile {
    return QUALITY_PROFILES[this.forcedTier ?? this.currentTier];
  }

  getTier(): QualityTier {
    return this.forcedTier ?? this.currentTier;
  }

  getEffectiveDpr(width: number, height: number): number {
    return computeEffectiveDpr(width, height, this.getProfile());
  }

  setForcedTier(tier: QualityTier | null) {
    this.forcedTier = tier;
    this.notify();
  }

  setFreezeDpr(freeze: boolean) {
    this.freezeDpr = freeze;
  }

  resetWarmup(ms = 1800) {
    if (typeof performance !== 'undefined') {
      this.warmupUntil = Math.max(this.warmupUntil, performance.now() + ms);
    }
  }

  recordFrame(nowMs: number) {
    if (typeof document !== 'undefined' && document.hidden) {
      this.lastSampleTime = 0;
      return;
    }
    if (!this.lastSampleTime) {
      this.lastSampleTime = nowMs;
      return;
    }
    const dt = nowMs - this.lastSampleTime;
    this.lastSampleTime = nowMs;

    // Ignore background-tab return spikes or zero-delta calls
    if (dt <= 1 || dt > 120) return;

    this.frameWindow.push(dt);
    if (this.frameWindow.length > this.maxSamples) {
      this.frameWindow.shift();
    }
    if (dt > 50) {
      this.longFrames++;
    }

    if (this.forcedTier || this.freezeDpr || nowMs < this.warmupUntil) return;
    if (this.frameWindow.length < 45 || nowMs - this.lastAdjustmentTime < 3500) return;

    const avgDt = this.frameWindow.reduce((a, b) => a + b, 0) / this.frameWindow.length;
    const idx = TIER_ORDER.indexOf(this.currentTier);

    // Step down if sustained average frame time exceeds ~28ms (< ~35fps)
    if (avgDt > 28.5 && idx > 0) {
      this.currentTier = TIER_ORDER[idx - 1];
      this.lastAdjustmentTime = nowMs;
      this.frameWindow.length = 0;
      this.notify();
    } else if (avgDt < 17.5 && idx < TIER_ORDER.length - 1 && nowMs - this.lastAdjustmentTime > 8000) {
      // Recover upward slowly only after sustained ~58+ FPS
      this.currentTier = TIER_ORDER[idx + 1];
      this.lastAdjustmentTime = nowMs;
      this.frameWindow.length = 0;
      this.notify();
    }
  }

  getSnapshot(width = 390, height = 844): PerformanceSnapshot {
    const samples = this.frameWindow;
    const lastDt = samples.length ? samples[samples.length - 1] : 16.67;
    const avgDt = samples.length
      ? samples.reduce((a, b) => a + b, 0) / samples.length
      : 16.67;
    const sorted = [...samples].sort((a, b) => a - b);
    const median = sorted.length ? sorted[Math.floor(sorted.length * 0.5)] : 16.67;
    const p95 = sorted.length ? sorted[Math.floor(sorted.length * 0.95)] : 16.67;
    const profile = this.getProfile();

    return {
      fps: Math.round(1000 / Math.max(1, lastDt)),
      avgFps: +(1000 / Math.max(1, avgDt)).toFixed(1),
      medianFrameMs: +median.toFixed(2),
      p95FrameMs: +p95.toFixed(2),
      longFrames: this.longFrames,
      tier: profile.tier,
      effectiveDpr: +computeEffectiveDpr(width, height, profile).toFixed(2),
      frozenDpr: this.freezeDpr,
      forcedTier: this.forcedTier,
    };
  }

  subscribe(listener: QualityListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const profile = this.getProfile();
    this.listeners.forEach((fn) => fn(profile));
  }
}

export const adaptiveQuality = new AdaptiveQualityEngine();
