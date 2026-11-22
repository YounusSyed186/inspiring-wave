/** Living Capabilities – shared types */

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
  /** Label color accent */
  accent: string;
}

export interface CameraKeyframe {
  position: [number, number, number];
  lookAt: [number, number, number];
  progress: number;
}

export const COLORS = {
  ivory: '#f1efe7',
  paper: '#f7f5ef',
  blue: '#1945f5',
  cobalt: '#2855ff',
  black: '#080a0b',
  deep: '#030506',
  yellow: '#d8f03c',
  concrete: '#c8c4ba',
  glass: '#4477ff',
  water: '#1a3dcc',
  platform: '#d4d0c6',
  stair: '#b8b4a8',
} as const;
