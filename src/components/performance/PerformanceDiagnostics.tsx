import { useEffect, useState } from 'react';
import { adaptiveQuality, type PerformanceSnapshot } from '@/lib/performance/AdaptiveQuality';
import type { QualityTier } from '@/lib/performance/DeviceCapabilities';
import { sceneMetricsRegistry, type SceneDebugMetrics } from '@/lib/performance/SceneMetricsRegistry';
import { scrollMotion } from '@/motion/scroll-engine';

const TIERS: Array<QualityTier | 'auto'> = ['auto', 'ultra', 'high', 'balanced', 'low'];

export function PerformanceDiagnostics() {
  const [enabled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('debugPerformance') === '1';
  });

  const [snapshot, setSnapshot] = useState<PerformanceSnapshot>(() => adaptiveQuality.getSnapshot());
  const [scenes, setScenes] = useState<SceneDebugMetrics[]>([]);
  const [scrollState, setScrollState] = useState({ progress: 0, velocity: 0 });
  const [frozen, setFrozen] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const timer = window.setInterval(() => {
      setSnapshot(adaptiveQuality.getSnapshot(window.innerWidth, window.innerHeight));
      setScenes(sceneMetricsRegistry.getAll());
      setScrollState({
        progress: +scrollMotion.state.scrollProgress.toFixed(3),
        velocity: Math.round(scrollMotion.state.smoothedVelocity),
      });
    }, 300);
    return () => window.clearInterval(timer);
  }, [enabled]);

  if (!enabled) return null;

  const totals = sceneMetricsRegistry.getTotals();

  return (
    <aside
      aria-label="Performance diagnostics"
      style={{
        position: 'fixed',
        bottom: 12,
        left: 12,
        zIndex: 99999,
        width: 310,
        padding: '10px 12px',
        background: 'rgba(7, 11, 22, 0.92)',
        color: '#f8f0e4',
        border: '1px solid rgba(217, 255, 0, 0.45)',
        borderRadius: 6,
        fontFamily: 'IBM Plex Mono, monospace',
        fontSize: 11,
        lineHeight: 1.45,
        backdropFilter: 'blur(8px)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, color: '#D9FF00', fontWeight: 700 }}>
        <span>IW PERF DIAGNOSTICS</span>
        <span>{snapshot.tier.toUpperCase()}</span>
      </div>
      <div>FPS: <b>{snapshot.fps}</b> (avg {snapshot.avgFps}) | Med: {snapshot.medianFrameMs}ms | P95: {snapshot.p95FrameMs}ms</div>
      <div>DPR: {snapshot.effectiveDpr} | Long frames: {snapshot.longFrames}</div>
      <div>Scroll: {(scrollState.progress * 100).toFixed(1)}% | Vel: {scrollState.velocity} px/s</div>
      <div>Active WebGL: {totals.activeRenderers} | Draws: {totals.drawCalls} | Tris: {totals.triangles}</div>
      <div>Geos: {totals.geometries} | Tex: {totals.textures}</div>

      <div style={{ marginTop: 6, borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 6 }}>
        {scenes.map((s) => (
          <div key={s.id} style={{ opacity: s.active ? 1 : 0.55 }}>
            {s.id}: {s.active ? 'ON' : 'IDLE'} {s.width}x{s.height} ({s.drawCalls}dc / {s.triangles}t)
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
        {TIERS.map((tier) => {
          const active = (tier === 'auto' && !snapshot.forcedTier) || snapshot.forcedTier === tier;
          return (
            <button
              key={tier}
              type="button"
              onClick={() => adaptiveQuality.setForcedTier(tier === 'auto' ? null : tier)}
              style={{
                padding: '2px 6px',
                borderRadius: 3,
                border: '1px solid rgba(255,255,255,0.25)',
                background: active ? '#D9FF00' : 'transparent',
                color: active ? '#070B16' : '#f8f0e4',
                cursor: 'pointer',
                fontSize: 10,
              }}
            >
              {tier}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => {
            const next = !frozen;
            setFrozen(next);
            adaptiveQuality.setFreezeDpr(next);
          }}
          style={{
            padding: '2px 6px',
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.25)',
            background: frozen ? '#173CFF' : 'transparent',
            color: '#f8f0e4',
            cursor: 'pointer',
            fontSize: 10,
          }}
        >
          {frozen ? 'DPR Frozen' : 'Freeze DPR'}
        </button>
      </div>
    </aside>
  );
}
