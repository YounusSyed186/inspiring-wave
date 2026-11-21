import { ChangeEvent, useState } from 'react';
import { waveConfig } from './wave-config';

const controls = [
  ['maxAmplitude', 0, 100, 1],
  ['velocityScale', 300, 3000, 25],
  ['velocityAttack', 1, 30, 0.5],
  ['velocityRelease', 1, 12, 0.2],
  ['waveAttack', 1, 30, 0.5],
  ['waveRelease', 1, 12, 0.2],
  ['curvePower', 0.5, 3, 0.05],
] as const;

export function WaveDebugPanel() {
  const [, refresh] = useState(0);
  if (!import.meta.env.DEV || !new URLSearchParams(location.search).has('waveDebug')) return null;

  const update = (key: keyof typeof waveConfig) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    if (typeof waveConfig[key] === 'number') (waveConfig[key] as number) = value;
    refresh(value);
  };

  return <aside className="wave-debug">
    <strong>Wave calibration</strong>
    {controls.map(([key, min, max, step]) => <label key={key}>
      <span>{key} {waveConfig[key]}</span>
      <input type="range" min={min} max={max} step={step} value={waveConfig[key] as number} onChange={update(key)} />
    </label>)}
  </aside>;
}
