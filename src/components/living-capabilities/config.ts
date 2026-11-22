/** Living Capabilities – station configs, camera paths and marker placements */

import type { StationConfig, CameraKeyframe } from './types';

/**
 * Six service stations matching the architectural reference layout.
 */
export const STATIONS: StationConfig[] = [
  {
    index: 0,
    slug: 'digital-strategy',
    title: 'Digital Strategy',
    summary: 'Clarify the opportunity, connect business goals to human needs, and shape a focused digital roadmap.',
    deliverables: ['Research & discovery', 'Product strategy', 'Digital roadmaps'],
    position: [-6.8, 0.4, 3.8],
    lookAt: [-6.8, 2.3, 3.8],
    cameraPos: [-10.5, 4.6, 10.5],
    scrollRange: [0.02, 0.18],
    markerScreenPos: [37, 24],
    accent: '#1945f5',
  },
  {
    index: 1,
    slug: 'web-development',
    title: 'Web Development',
    summary: 'Fast, expressive websites and platforms engineered for clarity, reliability and measurable growth.',
    deliverables: ['Creative development', 'Commerce & platforms', 'Performance engineering'],
    position: [0.2, 1.1, -0.2],
    lookAt: [0.2, 2.7, -0.2],
    cameraPos: [-3.2, 5.0, 6.8],
    scrollRange: [0.18, 0.35],
    markerScreenPos: [66, 18],
    accent: '#2855ff',
  },
  {
    index: 2,
    slug: 'ui-ux-design',
    title: 'UI/UX Design',
    summary: 'Digital products that turn complexity into intuitive, distinctive experiences people want to return to.',
    deliverables: ['Experience design', 'Interface systems', 'Prototyping & testing'],
    position: [8.2, 1.7, -1.8],
    lookAt: [8.2, 3.1, -1.8],
    cameraPos: [4.4, 5.6, 4.8],
    scrollRange: [0.35, 0.52],
    markerScreenPos: [91, 24],
    accent: '#4477ff',
  },
  {
    index: 3,
    slug: 'social-media',
    title: 'Social Media',
    summary: 'Strategy and creative that give brands a coherent voice and the momentum to travel across culture.',
    deliverables: ['Content strategy', 'Campaign creative', 'Channel management'],
    position: [-6.2, 0.1, -8.2],
    lookAt: [-6.2, 2.0, -8.2],
    cameraPos: [-2.4, 4.7, -3.2],
    scrollRange: [0.52, 0.68],
    markerScreenPos: [14, 62],
    accent: '#1945f5',
  },
  {
    index: 4,
    slug: 'mobile-app-development',
    title: 'Mobile App Development',
    summary: 'Purposeful mobile experiences built around the way people move, decide and interact.',
    deliverables: ['iOS & Android', 'Cross-platform apps', 'API integration'],
    position: [2.2, 0.5, -11.2],
    lookAt: [2.2, 2.5, -11.2],
    cameraPos: [-1.4, 4.9, -6.2],
    scrollRange: [0.68, 0.84],
    markerScreenPos: [56, 61],
    accent: '#2855ff',
  },
  {
    index: 5,
    slug: 'software-development',
    title: 'Software Development',
    summary: 'Custom systems that connect operations, simplify workflows and scale with the organisation.',
    deliverables: ['Custom software', 'ERP & CRM integration', 'Quality assurance'],
    position: [11.2, 0.7, -14.2],
    lookAt: [11.2, 2.3, -14.2],
    cameraPos: [7.2, 4.7, -9.2],
    scrollRange: [0.84, 0.98],
    markerScreenPos: [88, 65],
    accent: '#4477ff',
  },
];

/**
 * Camera keyframes:
 * Smooth, sweeping CatmullRom spline through the exhibition landscape.
 */
export const CAMERA_PATH: CameraKeyframe[] = [
  // Wide establishing shot: full isometric exhibition view matching reference
  { position: [-12.5, 9.8, 17.5], lookAt: [1.2, 1.4, -3.8], progress: 0 },
  // Station 1: Digital Strategy
  { position: [-10.5, 4.6, 10.5], lookAt: [-6.8, 2.3, 3.8], progress: 0.1 },
  // Transition 1→2
  { position: [-6.2, 5.8, 8.8], lookAt: [-2.2, 1.9, 2.2], progress: 0.18 },
  // Station 2: Web Development
  { position: [-3.2, 5.0, 6.8], lookAt: [0.2, 2.7, -0.2], progress: 0.26 },
  // Transition 2→3
  { position: [1.2, 6.2, 5.8], lookAt: [5.2, 2.4, -0.6], progress: 0.35 },
  // Station 3: UI/UX Design
  { position: [4.4, 5.6, 4.8], lookAt: [8.2, 3.1, -1.8], progress: 0.44 },
  // Transition 3→4
  { position: [2.8, 6.5, 0.8], lookAt: [-1.8, 2.1, -4.8], progress: 0.52 },
  // Station 4: Social Media
  { position: [-2.4, 4.7, -3.2], lookAt: [-6.2, 2.0, -8.2], progress: 0.6 },
  // Transition 4→5
  { position: [-0.4, 6.0, -4.8], lookAt: [1.2, 2.1, -9.2], progress: 0.68 },
  // Station 5: Mobile App
  { position: [-1.4, 4.9, -6.2], lookAt: [2.2, 2.5, -11.2], progress: 0.76 },
  // Transition 5→6
  { position: [4.2, 6.2, -8.2], lookAt: [8.2, 2.1, -12.8], progress: 0.84 },
  // Station 6: Software Development
  { position: [7.2, 4.7, -9.2], lookAt: [11.2, 2.3, -14.2], progress: 0.92 },
  // Final pullback: majestic view of completed world
  { position: [10.5, 9.2, -4.8], lookAt: [2.2, 1.2, -7.8], progress: 1 },
];

export const SCROLL_HEIGHT_VH = 450;
export const DESKTOP_MIN = 901;
