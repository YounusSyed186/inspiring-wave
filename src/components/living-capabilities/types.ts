/** Living Capabilities – shared types and theme tokens */

export type CapabilitiesTheme = 'dark' | 'cream';

export interface StationConfig {
  index: number;
  slug: string;
  title: string;
  summary: string;
  deliverables: string[];
  /** World-space position for the installation */
  position: [number, number, number];
  /** Camera look-at target */
  lookAt: [number, number, number];
  /** Camera position when viewing this station */
  cameraPos: [number, number, number];
  /** Scroll progress range [start, end] within 0-1 */
  scrollRange: [number, number];
  /** 2D screen coordinate percentage [x%, y%] for editorial callout marker */
  markerScreenPos: [number, number];
  /** Accent color */
  accent: string;
}

export interface CameraKeyframe {
  position: [number, number, number];
  lookAt: [number, number, number];
  progress: number;
}

export const THEMES = {
  dark: {
    bg: '#080a0b',
    deep: '#030506',
    fog: '#080a0b',
    ground: '#0c0f12',
    groundGrid: '#181e26',
    platformBase: '#14181f',
    platformTop: '#1b212b',
    water: '#030a1a',
    waterSpecular: '#1945f5',
    stone: '#202734',
    chrome: '#c8d4e8',
    cobalt: '#1945f5',
    neonBlue: '#2563eb',
    neonYellow: '#d8f03c',
    textPrimary: '#f1efe7',
    textSecondary: 'rgba(241, 239, 231, 0.72)',
    cardBg: 'rgba(12, 16, 22, 0.85)',
    cardBorder: 'rgba(25, 69, 245, 0.3)',
  },
  cream: {
    bg: '#f5f2ea',
    deep: '#ebe6dc',
    fog: '#f5f2ea',
    ground: '#ece7dc',
    groundGrid: '#dfd8ca',
    platformBase: '#e2dccf',
    platformTop: '#f3efe6',
    water: '#0a235c',
    waterSpecular: '#3b82f6',
    stone: '#ded7ca',
    chrome: '#dbe4f2',
    cobalt: '#1945f5',
    neonBlue: '#1945f5',
    neonYellow: '#d8f03c',
    textPrimary: '#080a0b',
    textSecondary: 'rgba(8, 10, 11, 0.75)',
    cardBg: 'rgba(245, 242, 234, 0.88)',
    cardBorder: 'rgba(25, 69, 245, 0.18)',
  },
} as const;
