export interface ServiceItem {
  id: string;
  number: string;
  category: string;
  title: string;
  headline: string;
  tagline: string;
  description: string;
  capabilities: string[];
  theme: 'ivory' | 'black' | 'blue';
  image: string;
  imageAlt: string;
  accentIcon: 'target' | 'code' | 'text-tool' | 'social' | 'mobile' | 'gears';
  slug: string;
}

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'digital-strategy',
    number: '01',
    category: 'STRATEGY',
    title: 'DIGITAL STRATEGY',
    headline: 'DIGITAL\nSTRATEGY',
    tagline: 'Connect business goals to human needs with focused roadmap clarity.',
    description: 'We turn ambitious ideas into purposeful digital direction. By analyzing market signals, user friction, and scalable technology foundations, we lock the strategic spine before creative execution begins.',
    capabilities: [
      'Digital Consulting & Audits',
      'Product Vision & Positioning',
      'Experience Planning & Personas',
      'Technology Feasibility & Roadmaps',
    ],
    theme: 'ivory',
    image: '/assets/services/strategy-mountain.webp',
    imageAlt: 'High-contrast monochrome mountain ridge representing strategic height',
    accentIcon: 'target',
    slug: 'digital-strategy',
  },
  {
    id: 'web-development',
    number: '02',
    category: 'DEVELOPMENT',
    title: 'WEB DEVELOPMENT',
    headline: 'WEB\nDEVELOPMENT',
    tagline: 'Fast, expressive websites and platforms engineered for lasting growth.',
    description: 'Powerful digital experiences engineered for performance, accessibility, and scale. We build clean, modern frontends paired with robust server architectures that turn complex systems into fluid, magnetic web platforms.',
    capabilities: [
      'Modern High-Performance Websites',
      'Web Applications & Portals',
      'Next.js, Vite & React Architecture',
      'Headless CMS & Commerce Integration',
    ],
    theme: 'black',
    image: '/assets/services/web-laptop.webp',
    imageAlt: 'Modern laptop displaying minimal scalable web product interface',
    accentIcon: 'code',
    slug: 'web-development',
  },
  {
    id: 'ui-ux-design',
    number: '03',
    category: 'IDENTITY',
    title: 'BRANDING',
    headline: 'BRANDING',
    tagline: 'Distinctive brand identities where strategic clarity meets expressive visual craft.',
    description: 'Brand systems that turn positioning into unmistakable, cohesive identities people remember. We craft visual languages, typographic hierarchies, and comprehensive brand guidelines built to scale across every touchpoint.',
    capabilities: [
      'Brand Identity & Logo Systems',
      'Visual Direction & Art Systems',
      'Typography & Editorial Craft',
      'Comprehensive Brand Guidelines',
    ],
    theme: 'blue',
    image: '/assets/services/uiux-tablet.webp',
    imageAlt: 'Designer hands drafting wireframes on digital tablet with stylus',
    accentIcon: 'text-tool',
    slug: 'ui-ux-design',
  },
  {
    id: 'social-media',
    number: '04',
    category: 'GROWTH',
    title: 'DIGITAL MARKETING',
    headline: 'DIGITAL\nMARKETING',
    tagline: 'Data-informed campaigns and storytelling that give brands measurable momentum.',
    description: 'Creative storytelling and performance strategy that make brands recognizable, engaging, and culturally resonant. We build multi-format content engines and digital campaigns that capture attention and drive action.',
    capabilities: [
      'Digital Growth & Performance Strategy',
      'Multi-Format Content Production',
      'Creative Campaign Direction',
      'Social & Channel Momentum',
    ],
    theme: 'ivory',
    image: '/assets/services/social-woman.webp',
    imageAlt: 'Monochrome editorial portrait of stylish creative with sunglasses',
    accentIcon: 'social',
    slug: 'social-media',
  },
  {
    id: 'mobile-app-development',
    number: '05',
    category: 'MOBILE',
    title: 'MOBILE APP DEVELOPMENT',
    headline: 'MOBILE APP\nDEVELOPMENT',
    tagline: 'Beautiful, purposeful mobile experiences built around how people live and interact.',
    description: 'Native and cross-platform mobile applications engineered for tactile precision, speed, and reliability. From initial gesture ergonomics to backend sync, we craft apps that feel instantaneous in human hands.',
    capabilities: [
      'iOS & Android Native Apps',
      'Cross-Platform React Native & Flutter',
      'Mobile UX & Touch Ergonomics',
      'Real-time API & Cloud Synchronization',
    ],
    theme: 'black',
    image: '/assets/services/mobile-phone.webp',
    imageAlt: 'Hand holding modern smartphone displaying mobile wave interface',
    accentIcon: 'mobile',
    slug: 'mobile-app-development',
  },
  {
    id: 'software-development',
    number: '06',
    category: 'ENGINEERING',
    title: 'SOFTWARE DEVELOPMENT',
    headline: 'SOFTWARE\nDEVELOPMENT',
    tagline: 'Custom software and scalable systems that turn complex challenges into solutions.',
    description: 'Custom software, microservices, and enterprise-grade cloud integrations designed to connect operations, automate bottlenecks, and scale smoothly as your organization expands.',
    capabilities: [
      'Custom Full-Stack Applications',
      'Scalable Backend Architecture & APIs',
      'ERP, CRM & Data Connectors',
      'Security, DevOps & Automated CI/CD',
    ],
    theme: 'ivory',
    image: '/assets/services/software-laptop.webp',
    imageAlt: 'Laptop displaying dark code terminal and software development environment',
    accentIcon: 'gears',
    slug: 'software-development',
  },
];
