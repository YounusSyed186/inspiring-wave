/** Living Capabilities – station configs, camera paths and marker placements */

import type { StationConfig, CameraKeyframe } from './types';

export const SCROLL_HEIGHT_VH = 480;
export const DESKTOP_MIN = 1024;

/**
 * Six service stations matching the editorial 3D collage reference layout.
 */
export const STATIONS: StationConfig[] = [
  {
    index: 0,
    slug: 'digital-strategy',
    title: 'Digital Strategy',
    tagline: 'FROM COMPLEXITY TO CLARITY.',
    summary: 'Clarify the opportunity, connect business goals to human needs, and shape a focused digital roadmap.',
    deliverables: ['Research & discovery', 'Product strategy', 'Digital roadmaps'],
    position: [-2.6, 1.8, 0.4],
    lookAt: [-2.2, 1.6, 0.2],
    cameraPos: [-1.4, 1.4, 4.8],
    scrollRange: [0.10, 0.22],
    markerScreenPos: [35, 16],
    accent: '#1945f5',
  },
  {
    index: 1,
    slug: 'web-development',
    title: 'Web Development',
    tagline: 'DIGITAL EXPERIENCES, ENGINEERED.',
    summary: 'Fast, expressive websites and platforms engineered for clarity, reliability and measurable growth.',
    deliverables: ['Creative development', 'Commerce & platforms', 'Performance engineering'],
    position: [2.0, 2.2, 0.2],
    lookAt: [1.8, 1.9, 0.1],
    cameraPos: [1.4, 1.8, 4.5],
    scrollRange: [0.22, 0.34],
    markerScreenPos: [62, 14],
    accent: '#2855ff',
  },
  {
    index: 2,
    slug: 'ui-ux-design',
    title: 'UI/UX Design',
    tagline: 'EVERY DETAIL HAS A PURPOSE.',
    summary: 'Digital products that turn complexity into intuitive, distinctive experiences people want to return to.',
    deliverables: ['Experience design', 'Interface systems', 'Prototyping & testing'],
    position: [4.4, 0.5, 0.8],
    lookAt: [3.8, 0.5, 0.6],
    cameraPos: [3.0, 0.6, 4.6],
    scrollRange: [0.34, 0.46],
    markerScreenPos: [93, 31],
    accent: '#4477ff',
  },
  {
    index: 3,
    slug: 'social-media',
    title: 'Social Media',
    tagline: 'IDEAS MADE TO TRAVEL.',
    summary: 'Strategy and creative that give brands a coherent voice and the momentum to travel across culture.',
    deliverables: ['Content strategy', 'Campaign creative', 'Channel management'],
    position: [-3.8, -0.6, 1.0],
    lookAt: [-3.2, -0.5, 0.8],
    cameraPos: [-2.6, -0.4, 4.5],
    scrollRange: [0.46, 0.58],
    markerScreenPos: [24, 51],
    accent: '#1945f5',
  },
  {
    index: 4,
    slug: 'mobile-app-development',
    title: 'Mobile App Development',
    tagline: 'BIG EXPERIENCES. SMALL SCREENS.',
    summary: 'Purposeful mobile experiences built around the way people move, decide and interact.',
    deliverables: ['iOS & Android', 'Cross-platform apps', 'API integration'],
    position: [-1.4, -1.8, 1.6],
    lookAt: [-1.1, -1.4, 1.2],
    cameraPos: [-0.9, -1.2, 4.2],
    scrollRange: [0.58, 0.70],
    markerScreenPos: [32, 70],
    accent: '#2855ff',
  },
  {
    index: 5,
    slug: 'software-development',
    title: 'Software Development',
    tagline: 'COMPLEX SYSTEMS. SIMPLE EXPERIENCES.',
    summary: 'Custom systems that connect operations, simplify workflows and scale with the organisation.',
    deliverables: ['Custom software', 'ERP & CRM integration', 'Quality assurance'],
    position: [3.4, -1.5, 1.4],
    lookAt: [2.9, -1.3, 1.1],
    cameraPos: [2.2, -1.1, 4.5],
    scrollRange: [0.70, 0.84],
    markerScreenPos: [85, 63],
    accent: '#4477ff',
  },
];

/**
 * Camera keyframes:
 * Editorial wide establishing view -> subtle cinematic focus per station -> wide unified finale.
 */
export const CAMERA_PATH: CameraKeyframe[] = [
  // Wide establishing shot: full editorial collage view matching reference
  { position: [0.6, 0.1, 7.8], lookAt: [0.6, 0.1, 0], progress: 0 },
  // Settled overview (0.05)
  { position: [0.6, 0.1, 7.8], lookAt: [0.6, 0.1, 0], progress: 0.08 },
  // Station 1: Digital Strategy
  { position: [-1.4, 1.4, 4.8], lookAt: [-2.2, 1.6, 0.2], progress: 0.16 },
  // Station 2: Web Development
  { position: [1.4, 1.8, 4.5], lookAt: [1.8, 1.9, 0.1], progress: 0.28 },
  // Station 3: UI/UX Design
  { position: [3.0, 0.6, 4.6], lookAt: [3.8, 0.5, 0.6], progress: 0.40 },
  // Station 4: Social Media
  { position: [-2.6, -0.4, 4.5], lookAt: [-3.2, -0.5, 0.8], progress: 0.52 },
  // Station 5: Mobile App Development
  { position: [-0.9, -1.2, 4.2], lookAt: [-1.1, -1.4, 1.2], progress: 0.64 },
  // Station 6: Software Development
  { position: [2.2, -1.1, 4.5], lookAt: [2.9, -1.3, 1.1], progress: 0.77 },
  // Station 7: Finale - wide unified composition in full motion
  { position: [0.6, 0.1, 7.8], lookAt: [0.6, 0.1, 0], progress: 0.90 },
  { position: [0.6, 0.1, 7.8], lookAt: [0.6, 0.1, 0], progress: 1.0 },
];
