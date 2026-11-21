import { waveConfig } from './wave-config';

export type ScrollMotionState = {
  currentScroll: number;
  targetScroll: number;
  previousScroll: number;
  scrollDelta: number;
  rawVelocity: number;
  smoothedVelocity: number;
  scrollDirection: -1 | 0 | 1;
  scrollProgress: number;
  scrollAcceleration: number;
  waveIntensity: number;
  activeTransition: number;
  transitionProgress: number;
  transitionBlend: number;
};

type MotionListener = (state: Readonly<ScrollMotionState>) => void;

const initialState: ScrollMotionState = {
  currentScroll: 0,
  targetScroll: 0,
  previousScroll: 0,
  scrollDelta: 0,
  rawVelocity: 0,
  smoothedVelocity: 0,
  scrollDirection: 0,
  scrollProgress: 0,
  scrollAcceleration: 0,
  waveIntensity: 0,
  activeTransition: 0,
  transitionProgress: 0,
  transitionBlend: 0,
};

class ScrollMotionEngine {
  readonly state = { ...initialState };
  private listeners = new Set<MotionListener>();
  private previousTime = 0;

  sample(timeSeconds: number, currentScroll: number, targetScroll: number) {
    if (!this.previousTime) {
      this.previousTime = timeSeconds;
      this.state.currentScroll = currentScroll;
      this.state.previousScroll = currentScroll;
      this.state.targetScroll = targetScroll;
      return;
    }

    const dt = Math.min(0.05, Math.max(0.001, timeSeconds - this.previousTime));
    this.previousTime = timeSeconds;
    const previousRawVelocity = this.state.rawVelocity;
    const delta = currentScroll - this.state.currentScroll;
    const rawVelocity = delta / dt;
    const velocityRate = Math.abs(rawVelocity) > Math.abs(this.state.smoothedVelocity)
      ? waveConfig.velocityAttack
      : waveConfig.velocityRelease;
    const velocityAlpha = 1 - Math.exp(-velocityRate * dt);
    const smoothedVelocity = this.state.smoothedVelocity
      + (rawVelocity - this.state.smoothedVelocity) * velocityAlpha;
    const maxAmplitude = innerWidth <= 900
      ? waveConfig.maxAmplitude * waveConfig.mobileMultiplier
      : waveConfig.maxAmplitude;
    const transitionDamping = 1 - this.state.transitionBlend * 0.28;
    const targetWave = waveConfig.enabled
      ? Math.tanh(smoothedVelocity / waveConfig.velocityScale)
        * maxAmplitude * waveConfig.directionMultiplier * transitionDamping
      : 0;
    const waveRate = Math.abs(targetWave) > Math.abs(this.state.waveIntensity)
      ? waveConfig.waveAttack
      : waveConfig.waveRelease;
    const waveAlpha = 1 - Math.exp(-waveRate * dt);
    const waveIntensity = this.state.waveIntensity
      + (targetWave - this.state.waveIntensity) * waveAlpha;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight);

    this.state.previousScroll = this.state.currentScroll;
    this.state.currentScroll = currentScroll;
    this.state.targetScroll = targetScroll;
    this.state.scrollDelta = delta;
    this.state.rawVelocity = rawVelocity;
    this.state.smoothedVelocity = Math.abs(smoothedVelocity) < 0.01 ? 0 : smoothedVelocity;
    this.state.scrollDirection = smoothedVelocity > 0.01 ? 1 : smoothedVelocity < -0.01 ? -1 : 0;
    this.state.scrollProgress = Math.min(1, Math.max(0, currentScroll / maxScroll));
    this.state.scrollAcceleration = (rawVelocity - previousRawVelocity) / dt;
    this.state.waveIntensity = Math.abs(waveIntensity) < 0.01 ? 0 : waveIntensity;
    this.listeners.forEach(listener => listener(this.state));
  }

  subscribe(listener: MotionListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  setTransition(index: number, progress: number) {
    const clamped = Math.min(1, Math.max(0, progress));
    this.state.activeTransition = index;
    this.state.transitionProgress = clamped;
    this.state.transitionBlend = Math.sin(clamped * Math.PI);
  }

  reset() {
    Object.assign(this.state, initialState);
    this.previousTime = 0;
  }
}

export const scrollMotion = new ScrollMotionEngine();
