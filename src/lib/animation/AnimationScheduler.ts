import { adaptiveQuality } from '../performance/AdaptiveQuality';

export interface ScheduledTask {
  id: string;
  priority?: number;
  update: (nowMs: number, dtSeconds: number) => void;
}

/**
 * Frame-rate-independent exponential damping helper.
 */
export function damp(
  current: number,
  target: number,
  smoothing: number,
  deltaTimeSeconds: number
): number {
  return current + (target - current) * (1 - Math.exp(-smoothing * deltaTimeSeconds));
}

/**
 * Centralized animation scheduler that coordinates active RAF callbacks,
 * clamps delta time, pauses on hidden browser tabs, and feeds AdaptiveQuality.
 */
class AnimationSchedulerImpl {
  private tasks = new Map<string, ScheduledTask>();
  private orderedTasks: ScheduledTask[] = [];
  private rafId = 0;
  private lastNow = 0;
  private active = false;
  private visibilityBound = false;

  private ensureVisibilityListener() {
    if (this.visibilityBound || typeof document === 'undefined') return;
    this.visibilityBound = true;
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.lastNow = 0;
        if (this.rafId) {
          cancelAnimationFrame(this.rafId);
          this.rafId = 0;
        }
      } else {
        this.lastNow = performance.now();
        adaptiveQuality.resetWarmup(1000);
        if (this.tasks.size > 0 && !this.rafId) {
          this.rafId = requestAnimationFrame(this.loop);
        }
      }
    });
  }

  register(task: ScheduledTask): () => void {
    this.ensureVisibilityListener();
    this.tasks.set(task.id, task);
    this.rebuildOrder();
    if (!this.active && typeof requestAnimationFrame !== 'undefined') {
      this.active = true;
      this.lastNow = performance.now();
      if (!document.hidden) {
        this.rafId = requestAnimationFrame(this.loop);
      }
    }
    return () => this.unregister(task.id);
  }

  unregister(id: string) {
    if (!this.tasks.delete(id)) return;
    this.rebuildOrder();
    if (this.tasks.size === 0) {
      this.active = false;
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = 0;
      }
    }
  }

  getActiveIds(): string[] {
    return this.orderedTasks.map((t) => t.id);
  }

  private rebuildOrder() {
    this.orderedTasks = Array.from(this.tasks.values()).sort(
      (a, b) => (a.priority ?? 0) - (b.priority ?? 0)
    );
  }

  private loop = (now: number) => {
    this.rafId = 0;
    if (!this.active || (typeof document !== 'undefined' && document.hidden)) return;

    const rawDt = this.lastNow ? (now - this.lastNow) * 0.001 : 1 / 60;
    this.lastNow = now;
    // Clamp delta time to prevent huge jumps after GC pauses or tab switches
    const dt = Math.min(0.05, Math.max(0.001, rawDt));

    adaptiveQuality.recordFrame(now);

    for (let i = 0; i < this.orderedTasks.length; i++) {
      this.orderedTasks[i].update(now, dt);
    }

    if (this.active && this.tasks.size > 0) {
      this.rafId = requestAnimationFrame(this.loop);
    }
  };
}

export const animationScheduler = new AnimationSchedulerImpl();
