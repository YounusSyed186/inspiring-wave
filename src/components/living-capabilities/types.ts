export interface CapabilityService {
  id: string
  num: string
  title: string
  subhead: string
  summary: string
  deliverables: string[]
  slug: string
  pRange: [number, number]
  pCenter: number
}

export const CAPABILITY_SERVICES: CapabilityService[] = [
  {
    id: 'strategy',
    num: '01',
    title: 'DIGITAL STRATEGY',
    subhead: 'From complexity to clarity.',
    summary: 'Clarify the opportunity, connect business goals to human needs, and shape a focused digital roadmap.',
    deliverables: ['Research & discovery', 'Product strategy', 'Digital roadmaps'],
    slug: 'digital-strategy',
    pRange: [0.09, 0.25],
    pCenter: 0.17,
  },
  {
    id: 'web',
    num: '02',
    title: 'WEB DEVELOPMENT',
    subhead: 'From structure to experience.',
    summary: 'High-performance websites and web applications built for real impact, speed and scalability.',
    deliverables: ['Creative development', 'Commerce & platforms', 'Performance engineering'],
    slug: 'web-development',
    pRange: [0.25, 0.42],
    pCenter: 0.35,
  },
  {
    id: 'uiux',
    num: '03',
    title: 'UI/UX DESIGN',
    subhead: 'From interaction to intuition.',
    summary: 'Digital products that turn complexity into intuitive, distinctive interfaces people love returning to.',
    deliverables: ['Experience design', 'Interface systems', 'Prototyping & testing'],
    slug: 'ui-ux-design',
    pRange: [0.42, 0.58],
    pCenter: 0.48,
  },
  {
    id: 'social',
    num: '04',
    title: 'SOCIAL MEDIA',
    subhead: 'From ideas to culture.',
    summary: 'Strategy and kinetic creative that give brands an unmistakable voice and cultural momentum.',
    deliverables: ['Content strategy', 'Campaign creative', 'Channel management'],
    slug: 'social-media',
    pRange: [0.58, 0.73],
    pCenter: 0.65,
  },
  {
    id: 'mobile',
    num: '05',
    title: 'MOBILE APP DEVELOPMENT',
    subhead: 'From screens to experiences.',
    summary: 'Purposeful mobile applications built around the intuitive way people move, decide and interact.',
    deliverables: ['iOS & Android', 'Cross-platform apps', 'API integration'],
    slug: 'mobile-app-development',
    pRange: [0.73, 0.88],
    pCenter: 0.80,
  },
  {
    id: 'software',
    num: '06',
    title: 'SOFTWARE DEVELOPMENT',
    subhead: 'From systems to scale.',
    summary: 'Custom scalable systems that connect operations, simplify complex workflows and empower teams.',
    deliverables: ['Custom software', 'ERP & CRM integration', 'Quality assurance'],
    slug: 'software-development',
    pRange: [0.88, 0.97],
    pCenter: 0.92,
  },
]

export const clamp01 = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x)
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const range = (p: number, a: number, b: number) => clamp01((p - a) / (b - a))
export const smooth = (t: number) => t * t * (3 - 2 * t)
export const win = (p: number, a: number, b: number) => smooth(range(p, a, b))

export function getActiveServiceIndex(p: number): number {
  if (p < 0.25) return 0
  if (p < 0.42) return 1
  if (p < 0.58) return 2
  if (p < 0.73) return 3
  if (p < 0.88) return 4
  return 5
}
