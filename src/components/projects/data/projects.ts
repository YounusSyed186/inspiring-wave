export type ProjectCardTheme = 'ivory' | 'black' | 'blue' | 'editorial';

export interface PortfolioProject {
  id: string;
  number: string;
  title: string;
  category: string;
  subtitle?: string;
  description: string;
  services: string[];
  year?: string;
  industry?: string;
  coverImage: string;
  supportingImages?: string[];
  cardTheme: ProjectCardTheme;
  caseStudyUrl?: string;
  websiteUrl?: string;
  featured?: boolean;
}

/** Ten live client websites designed and developed by Inspiring Wave. */
export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: 'jagannath-packaging', number: '01', title: 'Jagannath Packaging', category: 'INDUSTRIAL WEBSITE',
    subtitle: 'STRATEGY · UI/UX · DEVELOPMENT',
    description: 'A product-led digital presence presenting flexible packaging capabilities, manufacturing expertise, and sector-specific solutions.',
    services: ['Strategy', 'UI/UX', 'Web Development'], industry: 'Flexible Packaging',
    coverImage: '/assets/projects/live/jagannath-packaging.webp', cardTheme: 'ivory',
    websiteUrl: 'https://jagannathpackaging.com/', featured: true,
  },
  {
    id: 'saura-shakti-energies', number: '02', title: 'Saura Shakti Energies', category: 'ENERGY PLATFORM',
    subtitle: 'POSITIONING · UI/UX · DEVELOPMENT',
    description: 'A clear renewable-energy platform connecting solar solutions, engineering capability, and the company’s net-zero mission.',
    services: ['Digital Strategy', 'UI/UX', 'Web Development'], industry: 'Renewable Energy',
    coverImage: '/assets/projects/live/saura-shakti-energies.webp', cardTheme: 'blue',
    websiteUrl: 'https://saurashaktienergies.com/',
  },
  {
    id: 'dwaraka-global', number: '03', title: 'Dwaraka Global', category: 'CORPORATE EXPERIENCE',
    subtitle: 'CONTENT · UI/UX · DEVELOPMENT',
    description: 'A corporate website unifying a diversified group’s construction, hospitality, healthcare, and infrastructure portfolio.',
    services: ['Content Strategy', 'UI/UX', 'Web Development'], industry: 'Infrastructure',
    coverImage: '/assets/projects/live/dwaraka-global.webp', cardTheme: 'black',
    websiteUrl: 'https://dwarakaglobal.com/',
  },
  {
    id: 'bites-of-india', number: '04', title: 'Bites of India', category: 'HOSPITALITY WEBSITE',
    subtitle: 'BRAND STORY · UI/UX · DEVELOPMENT',
    description: 'A warm restaurant experience introducing authentic Indian flavours, location information, menus, and reservations.',
    services: ['Brand Story', 'UI/UX', 'Web Development'], industry: 'Food & Hospitality',
    coverImage: '/assets/projects/live/bites-of-india.webp', cardTheme: 'ivory',
    websiteUrl: 'https://bitesofindiaevan.com/',
  },
  {
    id: 'xeno-craft', number: '05', title: 'Xeno Craft', category: 'E-COMMERCE',
    subtitle: 'COMMERCE · UI/UX · DEVELOPMENT',
    description: 'A conversion-focused storefront for custom merchandise, wedding cards, apparel, and creator-led product collections.',
    services: ['E-commerce', 'UI/UX', 'Web Development'], industry: 'Custom Merchandise',
    coverImage: '/assets/projects/live/xeno-craft.webp', cardTheme: 'black',
    websiteUrl: 'https://xenocraft.in/',
  },
  {
    id: 'ksr-granites', number: '06', title: 'KSR Granites', category: 'PRODUCT CATALOGUE',
    subtitle: 'ART DIRECTION · UI/UX · DEVELOPMENT',
    description: 'A material-first catalogue built around premium granite, precision production, and a direct path to product enquiries.',
    services: ['Art Direction', 'UI/UX', 'Web Development'], industry: 'Natural Stone',
    coverImage: '/assets/projects/live/ksr-granites.webp', cardTheme: 'blue',
    websiteUrl: 'https://ksrgranites.in/',
  },
  {
    id: 'infracon-services', number: '07', title: 'Infracon Services', category: 'CONSULTING WEBSITE',
    subtitle: 'INFORMATION DESIGN · UI/UX · DEVELOPMENT',
    description: 'A structured consulting platform presenting infrastructure support, government projects, corporate services, and enquiries.',
    services: ['Information Design', 'UI/UX', 'Web Development'], industry: 'Infrastructure Consulting',
    coverImage: '/assets/projects/live/infracon-services.webp', cardTheme: 'ivory',
    websiteUrl: 'https://infraconservices.com/',
  },
  {
    id: 'rr-destination-moments', number: '08', title: 'RR Destination Moments', category: 'DESTINATION EXPERIENCE',
    subtitle: 'EDITORIAL · UI/UX · DEVELOPMENT',
    description: 'A cinematic destination-wedding website showcasing venues, celebrations, planning services, and aspirational travel imagery.',
    services: ['Editorial Design', 'UI/UX', 'Web Development'], industry: 'Destination Events',
    coverImage: '/assets/projects/live/rr-destination-moments.webp', cardTheme: 'black',
    websiteUrl: 'https://rrdestinationmoments.com/',
  },
  {
    id: 'stratalign-advisors', number: '09', title: 'StratAlign Advisors', category: 'ADVISORY PLATFORM',
    subtitle: 'POSITIONING · UI/UX · DEVELOPMENT',
    description: 'A focused advisory platform translating strategic infrastructure expertise into a credible, direct business experience.',
    services: ['Positioning', 'UI/UX', 'Web Development'], industry: 'Infrastructure Advisory',
    coverImage: '/assets/projects/live/stratalign-advisors.webp', cardTheme: 'blue',
    websiteUrl: 'https://saprojects.in/',
  },
  {
    id: 'wedmanthra', number: '10', title: 'Wedmanthra', category: 'WEDDING PLATFORM',
    subtitle: 'SERVICE DESIGN · UI/UX · DEVELOPMENT',
    description: 'A discovery-led wedding platform bringing destinations, planning services, and celebration inspiration into one clear journey.',
    services: ['Service Design', 'UI/UX', 'Web Development'], industry: 'Wedding & Travel',
    coverImage: '/assets/projects/live/wedmanthra.webp', cardTheme: 'editorial',
    websiteUrl: 'https://wedmanthra.com/',
  },
];
