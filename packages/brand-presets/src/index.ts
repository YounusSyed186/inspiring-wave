/**
 * Brand Presets and Styling Configurations
 */

export interface BrandPreset {
  id: string;
  name: string;
  personality: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  headingFont: string;
  bodyFont: string;
  captionPreset: string;
}

export const DEFAULT_BRAND_PRESETS: Record<string, BrandPreset> = {
  cinematic_history: {
    id: 'cinematic_history',
    name: 'Cinematic History',
    personality: 'Gravitas, grand scale, authoritative and immersive',
    primaryColor: '#D97706',
    secondaryColor: '#B45309',
    accentColor: '#F59E0B',
    backgroundColor: '#0F172A',
    textColor: '#F8FAFC',
    headingFont: 'Cinzel',
    bodyFont: 'Merriweather',
    captionPreset: 'Documentary'
  },
  modern_tech: {
    id: 'modern_tech',
    name: 'Modern Tech & Science',
    personality: 'Precise, minimalist, high-contrast, innovative',
    primaryColor: '#3B82F6',
    secondaryColor: '#6366F1',
    accentColor: '#10B981',
    backgroundColor: '#020617',
    textColor: '#F1F5F9',
    headingFont: 'Inter',
    bodyFont: 'JetBrains Mono',
    captionPreset: 'Clean Minimal'
  },
  bold_creator: {
    id: 'bold_creator',
    name: 'Bold High-Energy Creator',
    personality: 'Dynamic, punchy, bold outlines, fast tempo',
    primaryColor: '#EF4444',
    secondaryColor: '#FBBF24',
    accentColor: '#3B82F6',
    backgroundColor: '#000000',
    textColor: '#FFFFFF',
    headingFont: 'Montserrat Black',
    bodyFont: 'Inter',
    captionPreset: 'Bold Creator'
  },
  deep_business: {
    id: 'deep_business',
    name: 'Executive Business Case Studies',
    personality: 'Strategic, analytical, structured, sophisticated',
    primaryColor: '#0F766E',
    secondaryColor: '#0E7490',
    accentColor: '#EAB308',
    backgroundColor: '#0B0F19',
    textColor: '#E2E8F0',
    headingFont: 'Plus Jakarta Sans',
    bodyFont: 'Inter',
    captionPreset: 'Corporate'
  }
};
