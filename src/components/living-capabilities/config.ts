/** Living Capabilities – station configs and camera path */

import type { StationConfig, CameraKeyframe } from './types';

/**
 * Six service stations arranged in an architectural landscape.
 * Terraced layout matching the reference artwork.
 */
export const STATIONS: StationConfig[] = [
  {
    index: 0,
    slug: 'digital-strategy',
    title: 'Digital Strategy',
    summary: 'Clarify the opportunity, connect business goals to human needs, and shape a focused digital roadmap.',
    deliverables: ['Research & discovery', 'Product strategy', 'Digital roadmaps'],
    position: [-7, 0.5, 4],
    lookAt: [-7, 2.2, 4],
    cameraPos: [-11, 4.8, 11],
    scrollRange: [0.02, 0.18],
    accent: '#1945f5',
  },
  {
    index: 1,
    slug: 'web-development',
    title: 'Web Development',
    summary: 'Fast, expressive websites and platforms engineered for clarity, reliability and measurable growth.',
    deliverables: ['Creative development', 'Commerce & platforms', 'Performance engineering'],
    position: [0.5, 1.2, 0],
    lookAt: [0.5, 2.8, 0],
    cameraPos: [-3.5, 5.2, 7],
    scrollRange: [0.18, 0.35],
    accent: '#2855ff',
  },
  {
    index: 2,
    slug: 'ui-ux-design',
    title: 'UI/UX Design',
    summary: 'Digital products that turn complexity into intuitive, distinctive experiences people want to return to.',
    deliverables: ['Experience design', 'Interface systems', 'Prototyping & testing'],
    position: [8.5, 1.8, -1.5],
    lookAt: [8.5, 3.2, -1.5],
    cameraPos: [4.5, 5.8, 5],
    scrollRange: [0.35, 0.52],
    accent: '#4477ff',
  },
  {
    index: 3,
    slug: 'social-media',
    title: 'Social Media',
    summary: 'Strategy and creative that give brands a coherent voice and the momentum to travel across culture.',
    deliverables: ['Content strategy', 'Campaign creative', 'Channel management'],
    position: [-6.5, 0.2, -8.5],
    lookAt: [-6.5, 2.0, -8.5],
    cameraPos: [-2.5, 4.8, -3.5],
    scrollRange: [0.52, 0.68],
    accent: '#1945f5',
  },
  {
    index: 4,
    slug: 'mobile-app-development',
    title: 'Mobile App Development',
    summary: 'Purposeful mobile experiences built around the way people move, decide and interact.',
    deliverables: ['iOS & Android', 'Cross-platform apps', 'API integration'],
    position: [2.5, 0.6, -11.5],
    lookAt: [2.5, 2.6, -11.5],
    cameraPos: [-1.5, 5.0, -6.5],
    scrollRange: [0.68, 0.84],
    accent: '#2855ff',
  },
  {
    index: 5,
    slug: 'software-development',
    title: 'Software Development',
    summary: 'Custom systems that connect operations, simplify workflows and scale with the organisation.',
    deliverables: ['Custom software', 'ERP & CRM integration', 'Quality assurance'],
    position: [11.5, 0.8, -14.5],
    lookAt: [11.5, 2.4, -14.5],
    cameraPos: [7.5, 4.8, -9.5],
    scrollRange: [0.84, 0.98],
    accent: '#4477ff',
  },
];

/**
 * Camera keyframes for the cinematic journey.
 * Elevates the camera for sweeping, editorial perspective.
 */
export const CAMERA_PATH: CameraKeyframe[] = [
  // Wide establishing shot: sweeping overview of the entire exhibition
  { position: [-13, 10, 18], lookAt: [1, 1.5, -4], progress: 0 },
  // Station 1: Digital Strategy
  { position: [-11, 4.8, 11], lookAt: [-7, 2.2, 4], progress: 0.1 },
  // Smooth transition 1→2
  { position: [-6.5, 6.2, 9], lookAt: [-2.5, 2.0, 2], progress: 0.18 },
  // Station 2: Web Development
  { position: [-3.5, 5.2, 7], lookAt: [0.5, 2.8, 0], progress: 0.26 },
  // Smooth transition 2→3
  { position: [1.5, 6.5, 6], lookAt: [5.5, 2.5, -0.5], progress: 0.35 },
  // Station 3: UI/UX Design
  { position: [4.5, 5.8, 5], lookAt: [8.5, 3.2, -1.5], progress: 0.44 },
  // Smooth transition 3→4
  { position: [3, 6.8, 1], lookAt: [-2, 2.2, -5], progress: 0.52 },
  // Station 4: Social Media
  { position: [-2.5, 4.8, -3.5], lookAt: [-6.5, 2.0, -8.5], progress: 0.6 },
  // Smooth transition 4→5
  { position: [-0.5, 6.2, -5], lookAt: [1, 2.2, -9.5], progress: 0.68 },
  // Station 5: Mobile App
  { position: [-1.5, 5.0, -6.5], lookAt: [2.5, 2.6, -11.5], progress: 0.76 },
  // Smooth transition 5→6
  { position: [4.5, 6.5, -8.5], lookAt: [8.5, 2.2, -13], progress: 0.84 },
  // Station 6: Software Development
  { position: [7.5, 4.8, -9.5], lookAt: [11.5, 2.4, -14.5], progress: 0.92 },
  // Final pullback
  { position: [11, 9.5, -5], lookAt: [2, 1.2, -8], progress: 1 },
];

/** Total scroll height for the pinned section (in vh units) */
export const SCROLL_HEIGHT_VH = 450;

/** Minimum screen width for full 3D experience */
export const DESKTOP_MIN = 901;
