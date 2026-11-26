export type ProcessPhaseId = 'discover' | 'define' | 'design' | 'develop' | 'deliver';

export interface ProcessPhase {
  id: ProcessPhaseId;
  number: string;
  title: string;
  summary: string;
  detail: string;
  deliverables: string[];
  cue: string;
  progress: number;
}

export const PROCESS_PHASES: ProcessPhase[] = [
  { id: 'discover', number: '01', title: 'Discover', summary: 'Understand the business, audience and opportunity.', detail: "We interrogate assumptions, map audience tension points, and uncover the sharpest commercial and cultural leverage before drawing a single frame.", deliverables: ["Stakeholder Synthesis", "Audience Signals", "Opportunity Audit", "Success Metrics"], cue: 'Exploration and observation', progress: 0 },
  { id: 'define', number: '02', title: 'Define', summary: 'Establish a strategy and creative direction.', detail: "We lock the strategic spine, narrative voice, and visual thesis—creating an unmistakable blueprint where business logic and bold art direction align.", deliverables: ["Positioning Spine", "Art Direction Thesis", "System Blueprint", "Experience Roadmap"], cue: 'Structure and direction', progress: 0.33 },
  { id: 'design', number: '03', title: 'Design', summary: 'Translate the strategy into a distinctive experience.', detail: "Every interaction, typographic lockup, and motion curve is prototyped with tactile precision—turning complex systems into intuitive, magnetic interfaces.", deliverables: ["Interactive Prototypes", "Design Systems & Tokens", "Kinetic Typography", "Motion Physics"], cue: 'Creative transformation', progress: 0.5 },
  { id: 'develop', number: '04', title: 'Develop', summary: 'Engineer the experience into a reliable product.', detail: "Clean, resilient architecture built on modern stacks. We engineer sub-second load speeds, fluid scroll mechanics, and accessible semantic markup.", deliverables: ["React / Next.js Core", "WebGL & Shader Pipeline", "API & Cloud Systems", "WCAG AAA Rigor"], cue: 'Precision and engineering', progress: 0.67 },
  { id: 'deliver', number: '05', title: 'Deliver', summary: 'Launch, evaluate and continuously improve.', detail: "Release is the opening wave. We deploy with zero-downtime precision, instrument real-world analytics, and iterate to compound measurable growth.", deliverables: ["Production Launch", "Performance Telemetry", "Growth Iteration", "Continuous Evolution"], cue: 'Completion and continuation', progress: 0.86 },
];

