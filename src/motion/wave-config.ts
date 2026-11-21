export type WaveConfig = {
  enabled: boolean;
  maxAmplitude: number;
  velocityScale: number;
  velocityAttack: number;
  velocityRelease: number;
  waveAttack: number;
  waveRelease: number;
  curvePower: number;
  edgeFade: number;
  directionMultiplier: number;
  mobileMultiplier: number;
  maxDevicePixelRatio: number;
};

export const waveConfig: WaveConfig = {
  enabled: true,
  maxAmplitude: 60,
  velocityScale: 2000,
  velocityAttack: 18,
  velocityRelease: 8,
  waveAttack: 24,
  waveRelease: 7.5,
  curvePower: 1,
  edgeFade: 90,
  directionMultiplier: 1,
  mobileMultiplier: 0.35,
  maxDevicePixelRatio: 1.5,
};
