export interface CardPose {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  opacity: number;
  zIndex: number;
}

/**
 * Signed wrapped circular offset in [-count / 2, count / 2].
 * Negative offset => approaching from the upper-left arc.
 * Zero offset     => active foreground card at center-left.
 * Positive offset => departing along the lower-left arc.
 */
export function getWrappedOffset(index: number, position: number, count: number): number {
  const raw = index - position;
  return raw - Math.round(raw / count) * count;
}

/**
 * True vertical Ferris-wheel ellipse positioned partially outside the left edge:
 * - Upper cards (offset < 0) enter from upper-left (`cos(a) < 1`, `sin(a) < 0`)
 * - Active card (offset = 0) reaches rightmost apex at center-left (`cos(0) = 1`, `sin(0) = 0`)
 * - Lower cards (offset > 0) curve back and exit through bottom-left (`cos(a) < 1`, `sin(a) > 0`)
 * - Rear-arc cards (`|angle| > ~1.8 rad`) sit offscreen to the left with `opacity: 0` so wrapping is invisible.
 */
export function calculateDesktopOrbitPose(
  offset: number,
  viewportWidth: number,
  viewportHeight: number
): CardPose {
  const stepAngle = (Math.PI * 2) / 10; // 36° per slot around the 10-project circle
  const angle = offset * stepAngle;

  // Large vertical ellipse whose center sits left of the active anchor
  const radiusX = Math.max(210, Math.min(340, viewportWidth * 0.44));
  const radiusY = Math.max(360, Math.min(540, viewportHeight * 0.64));

  // Relative to the active anchor (where angle = 0 => dx = 0, dy = 0):
  // As |angle| increases, cos(angle) - 1 < 0 pulls cards back toward the left edge!
  const x = radiusX * (Math.cos(angle) - 1);
  const y = radiusY * Math.sin(angle);

  // Path-following tilt: incoming upper cards tilt down-right (-deg), outgoing lower cards tilt up-right (+deg)
  const rotation = Math.sin(angle) * 14.5;

  // Smooth Gaussian emphasis curve (active = 1.00, neighbors ~0.85–0.94, distant smaller)
  const emphasis = Math.exp(-offset * offset * 0.34);
  const scale = 0.68 + emphasis * 0.32;

  // Cosine depth score keeps stacking deterministic and hides the rear modulo seam offscreen
  const cosA = Math.cos(angle);
  const opacity = cosA <= -0.05 ? 0 : Math.min(1, Math.max(0, (cosA - 0.02) * 1.45));
  const zIndex = Math.round(100 + cosA * 60 - Math.abs(offset) * 2);

  return { x, y, rotation, scale, opacity, zIndex };
}

/**
 * Mobile portrait vertical pitch-deck arc (<= 767px).
 * Cards enter from top-left, sweep through center, and exit toward bottom-left.
 */
export function calculateMobileOrbitPose(
  offset: number,
  viewportWidth: number,
  viewportHeight: number
): CardPose {
  const stepAngle = (Math.PI * 2) / 10;
  const angle = offset * stepAngle;

  const radiusX = Math.min(95, viewportWidth * 0.24);
  const radiusY = Math.max(290, Math.min(410, viewportHeight * 0.62));

  const x = radiusX * (Math.cos(angle) - 1);
  const y = radiusY * Math.sin(angle);
  const rotation = Math.sin(angle) * 13.5;

  const emphasis = Math.exp(-offset * offset * 0.38);
  const scale = 0.72 + emphasis * 0.28;

  const cosA = Math.cos(angle);
  const opacity = cosA <= -0.05 ? 0 : Math.min(1, Math.max(0, (cosA - 0.02) * 1.45));
  const zIndex = Math.round(100 + cosA * 60 - Math.abs(offset) * 2);

  return { x, y, rotation, scale, opacity, zIndex };
}
