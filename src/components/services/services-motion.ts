export type Vec3Tuple = [number, number, number];

export interface TransformState {
  position: Vec3Tuple;
  rotation: Vec3Tuple;
  scale: number;
}

export interface InstallationMotion {
  start: number;
  end: number;
  sculptureStart: number;
  sculptureEnd: number;
  initial: TransformState;
  final: TransformState;
  domOffset: [number, number, number];
}

export const INSTALLATION_ORDER = [
  'digital-strategy',
  'web-development',
  'ui-ux-design',
  'social-media',
  'mobile-app-development',
  'software-development',
] as const;

export type InstallationSlug = (typeof INSTALLATION_ORDER)[number];

export const INSTALLATION_MOTION: Record<InstallationSlug, InstallationMotion> = {
  'digital-strategy': {
    start: 0.1, end: 0.3, sculptureStart: 0.24, sculptureEnd: 0.4,
    initial: { position: [-5.2, 4.8, -8], rotation: [0.25, -1.15, -0.28], scale: 0.62 },
    final: { position: [-1.75, 1.55, 0.15], rotation: [0.02, -0.18, -0.08], scale: 1 },
    domOffset: [-620, -360, -560],
  },
  'web-development': {
    start: 0.13, end: 0.34, sculptureStart: 0.27, sculptureEnd: 0.43,
    initial: { position: [0.7, 4.5, -10], rotation: [-0.18, 1.05, 0.18], scale: 0.58 },
    final: { position: [0.72, 1.6, -0.4], rotation: [0.02, -0.12, -0.05], scale: 1 },
    domOffset: [80, -440, -720],
  },
  'ui-ux-design': {
    start: 0.17, end: 0.38, sculptureStart: 0.3, sculptureEnd: 0.46,
    initial: { position: [7, 3.4, -7], rotation: [0.05, 1.3, 0.22], scale: 0.63 },
    final: { position: [3.12, 1.55, -0.15], rotation: [0.01, -0.16, 0.02], scale: 1 },
    domOffset: [680, -260, -520],
  },
  'social-media': {
    start: 0.36, end: 0.55, sculptureStart: 0.43, sculptureEnd: 0.59,
    initial: { position: [-5.2, -5.4, -6], rotation: [0.92, -0.55, -0.2], scale: 0.64 },
    final: { position: [-2.05, -1.35, 0.72], rotation: [-0.02, -0.1, -0.08], scale: 1 },
    domOffset: [-560, 520, -460],
  },
  'mobile-app-development': {
    start: 0.39, end: 0.59, sculptureStart: 0.46, sculptureEnd: 0.63,
    initial: { position: [0.1, -6.2, -8], rotation: [1.08, 0.62, 0.25], scale: 0.6 },
    final: { position: [0.65, -1.18, 0.85], rotation: [0.01, -0.13, 0.03], scale: 1 },
    domOffset: [20, 610, -640],
  },
  'software-development': {
    start: 0.42, end: 0.63, sculptureStart: 0.49, sculptureEnd: 0.66,
    initial: { position: [7.2, -5.1, -9], rotation: [0.72, 1, 0.3], scale: 0.6 },
    final: { position: [3.1, -1.28, 0.5], rotation: [0.03, -0.15, 0.05], scale: 1 },
    domOffset: [650, 500, -700],
  },
};

export function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function segment(progress: number, start: number, end: number) {
  if (end <= start) return progress >= end ? 1 : 0;
  return clamp01((progress - start) / (end - start));
}

export function smoothstep(value: number) {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

export function lerp(from: number, to: number, progress: number) {
  return from + (to - from) * progress;
}

export function stageForProgress(progress: number) {
  if (progress < 0.1) return 'Editorial canvas';
  if (progress < 0.25) return 'Architectural unfolding';
  if (progress < 0.4) return 'Sculptural emergence';
  if (progress < 0.6) return 'Lower installations';
  if (progress < 0.7) return 'Complete assembly';
  if (progress < 0.84) return 'Exhibition';
  if (progress < 0.95) return 'Wave transition';
  return 'Section handoff';
}

export function activeInstallationCount(progress: number) {
  return INSTALLATION_ORDER.filter((slug) => progress >= INSTALLATION_MOTION[slug].start).length;
}
