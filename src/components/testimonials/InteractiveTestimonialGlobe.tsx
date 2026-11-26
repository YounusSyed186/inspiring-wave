import * as React from 'react';
import createGlobe, { type Globe, type Marker as CobeMarker } from 'cobe';
import type { InspiringWaveTestimonial } from './data/testimonials';
import { DECORATIVE_HORIZON_NODES } from './data/testimonials';
import type { InteractionMode } from './hooks/useTestimonialSelection';
import { animationScheduler } from '@/lib/animation/AnimationScheduler';
import { adaptiveQuality } from '@/lib/performance/AdaptiveQuality';
import { sceneMetricsRegistry } from '@/lib/performance/SceneMetricsRegistry';

const TAU = Math.PI * 2;
const SPHERE_RADIUS = 0.8;

/**
 * Exact `cobe@2.0` longitudinal facing angle so `(lat, lng)` sits horizontally centered
 * on the front hemisphere (`depthZ > 0`).
 */
export function facingPhi(lng: number): number {
  return (1.5 * Math.PI) - (lng * Math.PI) / 180;
}

export function facingTheta(lat: number): number {
  const rad = (lat * Math.PI) / 180;
  return Math.max(-0.18, Math.min(0.42, rad * 0.52));
}

/** Shortest-path angular target from `currentPhi` to `desiredPhi` (no extra 360° spins). */
export function nearestTurn(currentPhi: number, desiredPhi: number): number {
  let diff = (desiredPhi - currentPhi) % TAU;
  if (diff > Math.PI) diff -= TAU;
  if (diff < -Math.PI) diff += TAU;
  return currentPhi + diff;
}

export interface ProjectedPin {
  x: number;
  y: number;
  depth: number;
  visible: boolean;
}

/**
 * Projects `[lat, lng]` using the exact `U` & `O` rotation matrices from `cobe@2.0.1`
 * so HTML pin markers stay glued to geographic coordinates at every rotation angle & size.
 */
export function projectGeoToGlobe(
  lat: number,
  lng: number,
  phi: number,
  theta: number,
  elevation = 0.025
): ProjectedPin {
  const latRad = (lat * Math.PI) / 180;
  const lngShift = (lng * Math.PI) / 180 - Math.PI;
  const cosLat = Math.cos(latRad);
  const r = SPHERE_RADIUS + elevation;

  const px = -cosLat * Math.cos(lngShift) * r;
  const py = Math.sin(latRad) * r;
  const pz = cosLat * Math.sin(lngShift) * r;

  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);
  const cosP = Math.cos(phi);
  const sinP = Math.sin(phi);

  const cx = cosP * px + sinP * pz;
  const cy = sinP * sinT * px + cosT * py - cosP * sinT * pz;
  const cz = -sinP * cosT * px + sinT * py + cosP * cosT * pz;

  return {
    x: (cx + 1) * 0.5,
    y: (-cy + 1) * 0.5,
    depth: cz,
    visible: cz > 0.08,
  };
}

function easeInOutCubic(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/**
 * Projects a 3D spherical point (latDeg, lngDeg) onto the 400x400 SVG graticule
 * matching cobe's exact rotation matrices.
 */
function projectGridPoint(latDeg: number, lngDeg: number, phi: number, theta: number): [number, number, number] {
  const latRad = (latDeg * Math.PI) / 180;
  const lngShift = (lngDeg * Math.PI) / 180 - Math.PI;
  const cosLat = Math.cos(latRad);
  const r = 0.8;

  const px = -cosLat * Math.cos(lngShift) * r;
  const py = Math.sin(latRad) * r;
  const pz = cosLat * Math.sin(lngShift) * r;

  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);
  const cosP = Math.cos(phi);
  const sinP = Math.sin(phi);

  const cx = cosP * px + sinP * pz;
  const cy = sinP * sinT * px + cosT * py - cosP * sinT * pz;
  const cz = -sinP * cosT * px + sinT * py + cosP * cosT * pz;

  return [(cx + 1) * 200, (-cy + 1) * 200, cz];
}

function buildSphericalGraticulePath(phi: number, theta: number): string {
  const parts: string[] = [];

  // 5 latitude parallels (-60, -30, 0, 30, 60)
  for (const lat of [-60, -30, 0, 30, 60]) {
    let penDown = false;
    for (let lng = -180; lng <= 180; lng += 6) {
      const [x, y, z] = projectGridPoint(lat, lng, phi, theta);
      if (z > 0.02) {
        parts.push(`${penDown ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`);
        penDown = true;
      } else {
        penDown = false;
      }
    }
  }

  // 12 longitude meridians every 30°
  for (let lng = -180; lng < 180; lng += 30) {
    let penDown = false;
    for (let lat = -84; lat <= 84; lat += 6) {
      const [x, y, z] = projectGridPoint(lat, lng, phi, theta);
      if (z > 0.02) {
        parts.push(`${penDown ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`);
        penDown = true;
      } else {
        penDown = false;
      }
    }
  }

  return parts.join(' ');
}

export interface InteractiveTestimonialGlobeProps {
  items: InspiringWaveTestimonial[];
  activeId: string;
  hoveredMarkerId: string | null;
  inView: boolean;
  reducedMotion: boolean;
  mode: InteractionMode;
  entranceSpinOffset?: number;
  onSelectId: (id: string) => void;
  onHoverMarker: (id: string | null) => void;
  onDragChange: (dragging: boolean) => void;
}

export function InteractiveTestimonialGlobe({
  items,
  activeId,
  hoveredMarkerId,
  inView,
  reducedMotion,
  onSelectId,
  onHoverMarker,
  onDragChange,
}: InteractiveTestimonialGlobeProps) {
  const stageRef = React.useRef<HTMLDivElement>(null);
  const canvasHostRef = React.useRef<HTMLDivElement>(null);
  const pinRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});
  const graticulePathRef = React.useRef<SVGPathElement>(null);
  const [webglFailed, setWebglFailed] = React.useState(false);

  const activeItem = React.useMemo(
    () => items.find((i) => i.id === activeId) ?? items[0],
    [items, activeId]
  );
  const activeIdRef = React.useRef(activeId);
  activeIdRef.current = activeId;

  // Mutable high-frequency physics state — zero React state updates per animation frame
  const g = React.useRef({
    phi: facingPhi(activeItem?.lng ?? 78.4867) - 0.36,
    theta: facingTheta(activeItem?.lat ?? 17.385),
    velPhi: 0,
    dragging: false,
    dragStartX: 0,
    dragStartY: 0,
    dragMoved: false,
    horizontalLock: null as boolean | null,
    lastPointerX: 0,
    turning: false,
    turnStartPhi: 0,
    turnTargetPhi: 0,
    turnStartTheta: 0,
    turnTargetTheta: 0,
    turnStartTime: 0,
    turnDuration: 1080,
    width: 440,
    inView: true,
    reduced: false,
    idlePauseUntil: 0,
    globe: null as Globe | null,
    lastRenderedPhi: Number.NaN,
    lastRenderedTheta: Number.NaN,
    lastGratPhi: Number.NaN,
    lastGratTheta: Number.NaN,
  }).current;

  g.inView = inView;
  g.reduced = reducedMotion;

  const syncDomPins = React.useCallback(() => {
    const w = g.width || 440;
    const scaleFactor = Math.min(1, Math.max(0.55, w / 460));
    const currentActiveId = activeIdRef.current;

    items.forEach((item) => {
      const btn = pinRefs.current[item.id];
      if (!btn) return;
      const proj = projectGeoToGlobe(item.lat, item.lng, g.phi, g.theta, 0.015);
      const [ox, oy] = item.clusterOffset ?? [0, 0];
      const px = proj.x * w + ox * scaleFactor;
      const py = proj.y * w + oy * scaleFactor;

      if (!proj.visible) {
        btn.style.opacity = '0';
        btn.style.pointerEvents = 'none';
        btn.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0) scale(0.5)`;
      } else {
        const edgeFade = Math.min(1, (proj.depth - 0.08) / 0.22);
        btn.style.opacity = edgeFade.toFixed(3);
        btn.style.pointerEvents = edgeFade > 0.35 ? 'auto' : 'none';
        btn.style.zIndex = item.id === currentActiveId ? '18' : String(Math.round(5 + proj.depth * 10));
        btn.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0) scale(1)`;
      }
    });

    // Rebuild spherical graticule only when angular movement exceeds visual threshold
    if (
      graticulePathRef.current &&
      (Number.isNaN(g.lastGratPhi) ||
        Math.abs(g.phi - g.lastGratPhi) > 0.0025 ||
        Math.abs(g.theta - g.lastGratTheta) > 0.0025)
    ) {
      g.lastGratPhi = g.phi;
      g.lastGratTheta = g.theta;
      graticulePathRef.current.setAttribute('d', buildSphericalGraticulePath(g.phi, g.theta));
    }
  }, [g, items]);

  // Smooth shortest-path rotation when active testimonial changes
  React.useEffect(() => {
    if (!activeItem) return;
    const basePhi = facingPhi(activeItem.lng);
    // Add subtle deterministic framing variation so nearby regional cities still glide noticeably
    const idx = items.findIndex((i) => i.id === activeItem.id);
    const subtleOffset = ((idx % 3) - 1) * 0.14;
    const desiredPhi = nearestTurn(g.phi, basePhi + subtleOffset);
    const desiredTheta = facingTheta(activeItem.lat) + (idx % 2 === 0 ? 0.04 : -0.04);

    if (reducedMotion) {
      g.phi = desiredPhi;
      g.theta = desiredTheta;
      g.turning = false;
      g.velPhi = 0;
      g.globe?.update({ phi: g.phi, theta: g.theta });
      syncDomPins();
      return;
    }

    g.turning = true;
    g.velPhi = 0;
    g.turnStartPhi = g.phi;
    g.turnTargetPhi = desiredPhi;
    g.turnStartTheta = g.theta;
    g.turnTargetTheta = desiredTheta;
    g.turnStartTime = performance.now();
    g.turnDuration = 950;
  }, [activeItem, g, items, reducedMotion, syncDomPins]);

  // Build Cobe WebGL markers (subtle cobalt surface dots; active pin rendered via crisp HTML teardrop)
  const cobeMarkers = React.useMemo<CobeMarker[]>(() => {
    const clientDots: CobeMarker[] = items.map((item) => ({
      location: [item.lat, item.lng],
      size: item.id === activeId ? 0.055 : 0.032,
      color: item.id === activeId ? [0.84, 1.0, 0.0] : [0.12, 0.32, 1.0],
    }));
    const horizonDots: CobeMarker[] = DECORATIVE_HORIZON_NODES.map((coords) => ({
      location: coords,
      size: 0.026,
      color: [0.14, 0.34, 1.0],
    }));
    return [...horizonDots, ...clientDots];
  }, [activeId, items]);

  // Initialize Cobe WebGL instance once & drive via centralized AnimationScheduler
  React.useEffect(() => {
    const host = canvasHostRef.current;
    const stage = stageRef.current;
    if (!host || !stage) return;

    // Create fresh canvas inside host so cobe@2.0's internal wrapper div cleans up cleanly in StrictMode
    host.innerHTML = '';
    const canvas = document.createElement('canvas');
    canvas.className = 'tw-globe-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    host.appendChild(canvas);

    const initialSize = Math.max(220, stage.clientWidth || 440);
    g.width = initialSize;
    const isSmallScreen = initialSize < 340;
    const dpr = adaptiveQuality.getEffectiveDpr(initialSize, initialSize);

    let globe: Globe;
    try {
      globe = createGlobe(canvas, {
        devicePixelRatio: dpr,
        width: initialSize,
        height: initialSize,
        phi: g.phi,
        theta: g.theta,
        dark: 0.9,
        diffuse: 1.55,
        mapSamples: isSmallScreen ? 11000 : 24000,
        mapBrightness: 10.8,
        mapBaseBrightness: 0.05,
        baseColor: [0.99, 0.96, 0.9],
        markerColor: [0.09, 0.28, 1.0],
        glowColor: [0.08, 0.24, 0.95],
        markers: cobeMarkers,
        markerElevation: 0.015,
        scale: 1,
      });
      g.globe = globe;
    } catch {
      setWebglFailed(true);
      syncDomPins();
      return;
    }

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglFailed(true);
    };
    canvas.addEventListener('webglcontextlost', onContextLost);

    const ro = new ResizeObserver(() => {
      const nextSize = Math.max(220, stage.clientWidth || 440);
      if (Math.abs(nextSize - g.width) < 1) return;
      g.width = nextSize;
      const nextDpr = adaptiveQuality.getEffectiveDpr(nextSize, nextSize);
      globe.update({ width: nextSize, height: nextSize, devicePixelRatio: nextDpr });
      syncDomPins();
    });
    ro.observe(stage);

    const unsubQuality = adaptiveQuality.subscribe(() => {
      const nextDpr = adaptiveQuality.getEffectiveDpr(g.width, g.width);
      globe.update({ devicePixelRatio: nextDpr });
    });

    const unsubScheduler = animationScheduler.register({
      id: 'testimonial-globe',
      priority: 2,
      update: (now, dt) => {
        if (!g.inView) {
          sceneMetricsRegistry.update({
            id: 'testimonial-globe',
            active: false,
            drawCalls: 0,
            triangles: 0,
            geometries: 1,
            textures: 0,
            width: canvas.width,
            height: canvas.height,
            dpr: adaptiveQuality.getEffectiveDpr(g.width, g.width),
          });
          return;
        }

        if (g.turning && !g.dragging) {
          const p = easeInOutCubic((now - g.turnStartTime) / g.turnDuration);
          g.phi = g.turnStartPhi + (g.turnTargetPhi - g.turnStartPhi) * p;
          g.theta = g.turnStartTheta + (g.turnTargetTheta - g.turnStartTheta) * p;
          if (p >= 1) {
            g.turning = false;
            g.idlePauseUntil = now + 2600;
          }
        } else if (!g.dragging && !g.reduced) {
          if (Math.abs(g.velPhi) > 0.00008) {
            g.phi += g.velPhi * (dt * 60);
            g.velPhi *= Math.pow(0.93, dt * 60);
          } else {
            g.velPhi = 0;
            if (now > g.idlePauseUntil) {
              // Frame-rate-independent gentle breathing oscillation
              g.phi += Math.sin(now * 0.00045) * 0.045 * dt;
            }
          }
        }

        if (
          Math.abs(g.phi - g.lastRenderedPhi) > 1e-5 ||
          Math.abs(g.theta - g.lastRenderedTheta) > 1e-5
        ) {
          g.lastRenderedPhi = g.phi;
          g.lastRenderedTheta = g.theta;
          globe.update({ phi: g.phi, theta: g.theta });
          syncDomPins();
        }

        sceneMetricsRegistry.update({
          id: 'testimonial-globe',
          active: true,
          drawCalls: 1,
          triangles: 2,
          geometries: 1,
          textures: 0,
          width: canvas.width,
          height: canvas.height,
          dpr: adaptiveQuality.getEffectiveDpr(g.width, g.width),
        });
      },
    });

    syncDomPins();

    return () => {
      unsubScheduler();
      unsubQuality();
      ro.disconnect();
      canvas.removeEventListener('webglcontextlost', onContextLost);
      sceneMetricsRegistry.remove('testimonial-globe');
      globe.destroy();
      g.globe = null;
      host.innerHTML = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncDomPins]);

  // Update Cobe surface markers whenever activeId changes without recreating WebGL context
  React.useEffect(() => {
    g.globe?.update({ markers: cobeMarkers });
  }, [cobeMarkers, g]);

  // Pointer drag with horizontal gesture recognition so vertical mobile touch scrolling stays natural
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    g.dragging = true;
    g.turning = false;
    g.dragStartX = e.clientX;
    g.dragStartY = e.clientY;
    g.lastPointerX = e.clientX;
    g.dragMoved = false;
    g.horizontalLock = e.pointerType === 'mouse' ? true : null;
    if (e.pointerType === 'mouse') {
      e.currentTarget.setPointerCapture?.(e.pointerId);
      onDragChange(true);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!g.dragging) return;
    const totalDx = e.clientX - g.dragStartX;
    const totalDy = e.clientY - g.dragStartY;

    if (g.horizontalLock === null) {
      if (Math.hypot(totalDx, totalDy) < 7) return;
      if (Math.abs(totalDx) > Math.abs(totalDy) * 1.15) {
        g.horizontalLock = true;
        e.currentTarget.setPointerCapture?.(e.pointerId);
        onDragChange(true);
      } else {
        g.horizontalLock = false;
        g.dragging = false;
        return;
      }
    }

    if (!g.horizontalLock) return;
    const dx = e.clientX - g.lastPointerX;
    g.lastPointerX = e.clientX;
    if (Math.abs(totalDx) > 4) g.dragMoved = true;

    const sensitivity = 0.0058;
    const deltaPhi = dx * sensitivity;
    g.phi += deltaPhi;
    g.velPhi = Math.max(-0.045, Math.min(0.045, deltaPhi * 0.68));
    g.idlePauseUntil = performance.now() + 3600;

    if (webglFailed || g.reduced) {
      g.globe?.update({ phi: g.phi, theta: g.theta });
      syncDomPins();
    }
  };

  const finishDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!g.dragging) return;
    const wasLocked = g.horizontalLock === true;
    g.dragging = false;
    g.horizontalLock = null;
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (wasLocked) {
      onDragChange(false);
    }
  };

  return (
    <div className="tw-globe-zone" data-tw-globe-reveal>
      <div
        ref={stageRef}
        className={`tw-globe-stage ${webglFailed ? 'is-fallback' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        role="group"
        aria-label="Interactive client locations globe. Drag horizontally to rotate or select a location pin."
      >
        {/* Subtle outer atmosphere & cobalt rim ring */}
        <div className="tw-globe-rim" aria-hidden="true" />

        {/* Cobe WebGL Canvas Host */}
        {!webglFailed ? (
          <div ref={canvasHostRef} className="tw-globe-canvas-host" aria-hidden="true" />
        ) : (
          /* Graceful Graphic Map Fallback when WebGL is unavailable (Section 36) */
          <div className="tw-globe-fallback" aria-hidden="true">
            <svg viewBox="0 0 400 400" className="tw-globe-fallback-svg">
              <defs>
                <radialGradient id="twFallbackSphere" cx="42%" cy="38%" r="60%">
                  <stop offset="0%" stopColor="#132248" />
                  <stop offset="72%" stopColor="#091024" />
                  <stop offset="100%" stopColor="#0e299e" />
                </radialGradient>
              </defs>
              <circle cx="200" cy="200" r="160" fill="url(#twFallbackSphere)" />
              <path
                d="M148 118c26-14 68-12 96 6 22 14 38 42 28 66-10 22-34 26-44 50-8 20-16 36-26 36-11 0-20-26-28-44-14-12-38-20-42-46-4-26 2-58 16-68z"
                fill="#F8F0E4"
                opacity="0.88"
              />
              <path
                d="M92 162c18-8 38 6 44 26 6 22-4 58-18 76-12 14-24 6-28-14-5-24-12-78 2-88zM268 242c18-6 40 6 44 24 4 16-12 32-30 28-16-4-26-46-14-52z"
                fill="#F8F0E4"
                opacity="0.72"
              />
            </svg>
          </div>
        )}

        {/* True 3D-Projected Cobalt Latitude / Longitude Graticule Overlay */}
        <svg viewBox="0 0 400 400" className="tw-globe-graticule" aria-hidden="true">
          <path
            ref={graticulePathRef}
            d=""
            fill="none"
            stroke="rgba(48, 108, 255, 0.44)"
            strokeWidth="0.9"
            strokeLinecap="round"
          />
          <circle
            cx="200"
            cy="200"
            r="159.5"
            fill="none"
            stroke="rgba(56, 114, 255, 0.72)"
            strokeWidth="1.6"
          />
        </svg>

        {/* Geographic Projected Interactive Client Markers */}
        <div className="tw-globe-pins">
          {items.map((item, idx) => {
            const isActive = item.id === activeId;
            const isHovered = item.id === hoveredMarkerId;
            return (
              <button
                key={item.id}
                ref={(el) => {
                  pinRefs.current[item.id] = el;
                }}
                type="button"
                data-tw-marker
                data-active={isActive ? 'true' : 'false'}
                className={`tw-globe-pin ${isActive ? 'is-active' : ''} ${isHovered ? 'is-hovered' : ''}`}
                onClick={() => onSelectId(item.id)}
                onMouseEnter={() => onHoverMarker(item.id)}
                onMouseLeave={() => onHoverMarker(null)}
                onFocus={() => onHoverMarker(item.id)}
                onBlur={() => onHoverMarker(null)}
                aria-label={`Select client voice ${idx + 1}: ${item.name}, ${item.company ?? ''} (${item.locationLabel})`}
                aria-pressed={isActive}
              >
                {isActive ? (
                  <>
                    <span className="tw-pin-pulse" aria-hidden="true" />
                    <svg viewBox="0 0 28 36" className="tw-pin-teardrop" aria-hidden="true">
                      <path
                        d="M14 1.5C7.1 1.5 1.5 7.1 1.5 14c0 8.9 10.6 18.8 11.7 19.8.5.4 1.1.4 1.6 0C15.9 32.8 26.5 22.9 26.5 14 26.5 7.1 20.9 1.5 14 1.5z"
                        fill="#D7FF00"
                        stroke="#080D19"
                        strokeWidth="1.6"
                      />
                      <circle cx="14" cy="13.5" r="4.2" fill="#2A3300" />
                    </svg>
                    <span className="tw-pin-label">{item.locationLabel}</span>
                  </>
                ) : (
                  <span className="tw-pin-dot" aria-hidden="true">
                    <i />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Accessible quick-location fallback strip when WebGL fails */}
      {webglFailed && (
        <div className="tw-globe-fallback-list" role="group" aria-label="Client locations">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectId(item.id)}
              className={`tw-fallback-chip ${item.id === activeId ? 'is-active' : ''}`}
              aria-pressed={item.id === activeId}
            >
              {item.name} · {item.locationLabel}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
