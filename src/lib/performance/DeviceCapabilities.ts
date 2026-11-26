export type QualityTier = 'ultra' | 'high' | 'balanced' | 'low';

export interface QualityProfile {
  tier: QualityTier;
  maxDpr: number;
  /** Maximum drawing buffer pixels (width * height) to cap high-DPR mobile fill rate. */
  maxPixels: number;
  antialias: boolean;
  shadowsEnabled: boolean;
  shadowMapSize: number;
  particleScale: number;
  geometryScale: number;
  textureMaxSize: number;
  precision: 'highp' | 'mediump';
}

export const QUALITY_PROFILES: Record<QualityTier, QualityProfile> = {
  ultra: {
    tier: 'ultra',
    maxDpr: 2.0,
    maxPixels: 4_500_000,
    antialias: true,
    shadowsEnabled: true,
    shadowMapSize: 1024,
    particleScale: 1.0,
    geometryScale: 1.0,
    textureMaxSize: 2048,
    precision: 'highp',
  },
  high: {
    tier: 'high',
    maxDpr: 1.5,
    maxPixels: 2_800_000,
    antialias: true,
    shadowsEnabled: true,
    shadowMapSize: 512,
    particleScale: 0.75,
    geometryScale: 0.85,
    textureMaxSize: 1536,
    precision: 'highp',
  },
  balanced: {
    tier: 'balanced',
    maxDpr: 1.25,
    maxPixels: 1_800_000,
    antialias: false,
    shadowsEnabled: false,
    shadowMapSize: 512,
    particleScale: 0.55,
    geometryScale: 0.65,
    textureMaxSize: 1024,
    precision: 'mediump',
  },
  low: {
    tier: 'low',
    maxDpr: 1.0,
    maxPixels: 1_100_000,
    antialias: false,
    shadowsEnabled: false,
    shadowMapSize: 256,
    particleScale: 0.35,
    geometryScale: 0.45,
    textureMaxSize: 512,
    precision: 'mediump',
  },
};

export interface DeviceCapabilitiesInfo {
  isTouch: boolean;
  isSmallViewport: boolean;
  dpr: number;
  hardwareConcurrency: number;
  deviceMemoryGB: number | null;
  reducedMotion: boolean;
  initialTier: QualityTier;
}

export function detectDeviceCapabilities(): DeviceCapabilitiesInfo {
  if (typeof window === 'undefined') {
    return {
      isTouch: false,
      isSmallViewport: false,
      dpr: 1,
      hardwareConcurrency: 4,
      deviceMemoryGB: null,
      reducedMotion: false,
      initialTier: 'high',
    };
  }

  const isTouch =
    window.matchMedia?.('(pointer: coarse)').matches ||
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0;
  const isSmallViewport = window.innerWidth < 900;
  const dpr = window.devicePixelRatio || 1;
  const hardwareConcurrency = navigator.hardwareConcurrency || 4;
  const deviceMemoryGB =
    typeof (navigator as Navigator & { deviceMemory?: number }).deviceMemory === 'number'
      ? (navigator as Navigator & { deviceMemory?: number }).deviceMemory!
      : null;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

  let initialTier: QualityTier = 'high';
  if (isSmallViewport || isTouch) {
    if ((deviceMemoryGB !== null && deviceMemoryGB <= 3) || hardwareConcurrency <= 4) {
      initialTier = 'balanced';
    } else {
      initialTier = 'high';
    }
  } else if (hardwareConcurrency >= 8 && (deviceMemoryGB === null || deviceMemoryGB >= 8)) {
    initialTier = 'ultra';
  }

  return {
    isTouch,
    isSmallViewport,
    dpr,
    hardwareConcurrency,
    deviceMemoryGB,
    reducedMotion,
    initialTier,
  };
}

export function computeEffectiveDpr(
  width: number,
  height: number,
  profile: QualityProfile
): number {
  const nativeDpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  const area = Math.max(1, width * height);
  const pixelCapDpr = Math.sqrt(profile.maxPixels / area);
  return Math.max(1, Math.min(nativeDpr, profile.maxDpr, pixelCapDpr));
}
