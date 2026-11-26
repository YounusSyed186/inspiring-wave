import { PROCESS_PHASES } from './process.data';

export const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
export const smoothstep = (value: number) => { const x = clamp01(value); return x * x * (3 - 2 * x); };
export const segment = (progress: number, start: number, end: number) => smoothstep((progress - start) / (end - start));
export function phaseIndexAt(progress: number) {
  const p = clamp01(progress);
  if (p < 0.165 || p >= 0.97) return 0;
  if (p < 0.42) return 1;
  if (p < 0.59) return 2;
  if (p < 0.76) return 3;
  return 4;
}

export function timelineStageAt(progress: number) {
  if (progress >= 0.97) return 'Discover / cycle returns';
  if (progress < 0.165) return 'Discover / observation';
  if (progress < 0.42) return 'Define / alignment';
  if (progress < 0.59) return 'Design / transformation';
  if (progress < 0.76) return 'Develop / structural reveal';
  if (progress < 0.92) return 'Deliver / continuation';
  return 'Infinite handoff';
}

export function phaseProgressTarget(index: number) {
  return PROCESS_PHASES[Math.max(0, Math.min(PROCESS_PHASES.length - 1, index))].progress;
}

