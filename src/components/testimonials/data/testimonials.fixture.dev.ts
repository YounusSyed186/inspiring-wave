import type { InspiringWaveTestimonial } from './testimonials';

/**
 * DEVELOPMENT-ONLY PREVIEW FIXTURES (Section 31)
 * Marked explicitly as demonstration data for multi-continent globe testing in dev harnesses.
 * NEVER imported or displayed as genuine client feedback on the production website.
 */
export const DEV_ONLY_PREVIEW_FIXTURES: InspiringWaveTestimonial[] = [
  {
    id: 'dev-preview-01',
    quote: '[DEV PREVIEW] A partnership that turned ambitious ideas into meaningful digital experiences.',
    name: 'Preview Fixture A',
    role: 'Product Lead',
    company: 'Demo Studio Preview',
    city: 'Bengaluru',
    country: 'IN',
    locationLabel: 'BENGALURU, IN',
    lat: 12.9716,
    lng: 77.5946,
    rating: 5.0,
    verifiedScope: 'DEVELOPMENT LAYOUT FIXTURE',
  },
];
