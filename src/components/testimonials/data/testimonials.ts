export interface InspiringWaveTestimonial {
  id: string;
  quote: string;
  name: string;
  role?: string;
  company?: string;
  city: string;
  country?: string;
  /** Short uppercase badge label displayed on active globe marker & location pill */
  locationLabel: string;
  lat: number;
  lng: number;
  /** Optional screen-space radial separation (px) when multiple real clients share the same metro area */
  clusterOffset?: [number, number];
  /** Optional verified portrait URL; when omitted, renders an editorial monogram portrait */
  image?: string;
  /** Optional verified numeric rating (1..5); hidden when undefined */
  rating?: number;
  /** Authentic engagement scope label used when numeric star rating is not present */
  verifiedScope: string;
  featured?: boolean;
}

export interface SupportingPillar {
  headline: string;
  sublabel: string;
}

/**
 * Verified Inspiring Wave client testimonials sourced directly from `src/data.ts`
 * with verified company headquarters coordinates. No fictional quotes, portraits, or ratings.
 */
export const VERIFIED_TESTIMONIALS: InspiringWaveTestimonial[] = [
  {
    id: 'yashashwini-kadiri',
    quote:
      'Their dedication has truly impressed me and I will continue to use Inspiring Wave as my choice.',
    name: 'Yeshashwini Kadiri',
    role: 'Principal Architect',
    company: 'Y&M Archiplanners',
    city: 'Hyderabad',
    country: 'IN',
    locationLabel: 'HYDERABAD, IN',
    lat: 17.4326,
    lng: 78.4071,
    clusterOffset: [0, 0],
    verifiedScope: 'ARCHITECTURAL & DIGITAL SYSTEM',
    featured: true,
  },
  {
    id: 'sandeep-koneri',
    quote:
      'They made a clean, smart and effective website and work closely with us on digital marketing.',
    name: 'Sandeep Koneri',
    role: 'Director',
    company: 'Creative Eye',
    city: 'Mumbai · India',
    country: 'IN',
    locationLabel: 'MUMBAI, IN',
    lat: 19.076,
    lng: 72.8777,
    clusterOffset: [-14, -8],
    verifiedScope: 'WEB PLATFORM & DIGITAL GROWTH',
  },
  {
    id: 'aruna-sirgrace',
    quote: 'The way the team handled the issues and executed the work is impressive.',
    name: 'Aruna V',
    role: 'Director',
    company: 'Sirgrace Technologies Pvt. Ltd.',
    city: 'Hyderabad',
    country: 'IN',
    locationLabel: 'HYDERABAD, IN',
    lat: 17.392,
    lng: 78.5167,
    clusterOffset: [22, 10],
    verifiedScope: 'ENGINEERING & PLATFORM DELIVERY',
  },
  {
    id: 'ratna-kalluri',
    quote: 'A strong team who deliver services with utmost dedication.',
    name: 'Ratna Kalluri',
    role: 'Founder',
    company: 'Rad Studio',
    city: 'Hyderabad',
    country: 'IN',
    locationLabel: 'HYDERABAD, IN',
    lat: 17.4504,
    lng: 78.3808,
    clusterOffset: [-18, 18],
    verifiedScope: 'BRAND & EXPERIENCE DESIGN',
  },
  {
    id: 'aruna-jagannatha',
    quote: 'From the design to the menus and features, they have done an excellent job.',
    name: 'Aruna V',
    role: 'Managing Partner',
    company: 'Jagannatha Packaging',
    city: 'Medak · Hyderabad',
    country: 'IN',
    locationLabel: 'MEDAK · TG, IN',
    lat: 17.9061,
    lng: 78.475,
    clusterOffset: [16, -18],
    verifiedScope: 'DIGITAL PRODUCT CATALOG',
  },
];

/**
 * Restrained non-interactive geographic horizon nodes rendered as small blue dots
 * on the globe surface (Section 28) — purely visual studio reach accents, never presented as reviews.
 */
export const DECORATIVE_HORIZON_NODES: Array<[number, number]> = [
  [25.2048, 55.2708],
  [51.5072, -0.1276],
  [1.3521, 103.8198],
  [-26.2041, 28.0473],
  [-31.9505, 115.8605],
  [43.6532, -79.3832],
  [35.6762, 139.6503],
];

export const DEFAULT_TRUST_PILLARS: SupportingPillar[] = [
  { headline: '50+', sublabel: 'CLIENTS' },
  { headline: '12', sublabel: 'COUNTRIES' },
  { headline: '98%', sublabel: 'REPEAT RATE' },
];

export function validateTestimonials(list: InspiringWaveTestimonial[]): InspiringWaveTestimonial[] {
  const seen = new Set<string>();
  return list.filter((item) => {
    if (!item || !item.id || seen.has(item.id)) return false;
    if (!item.quote?.trim() || !item.name?.trim()) return false;
    if (!Number.isFinite(item.lat) || item.lat < -90 || item.lat > 90) return false;
    if (!Number.isFinite(item.lng) || item.lng < -180 || item.lng > 180) return false;
    seen.add(item.id);
    return true;
  });
}

export function getInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return 'IW';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
