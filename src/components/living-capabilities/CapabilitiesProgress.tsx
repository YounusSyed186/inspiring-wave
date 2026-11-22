/**
 * Living Capabilities – Progress Indicator
 *
 * Thin progress bar at the bottom of the viewport showing scroll position.
 */

interface Props {
  progress: number;
  visible: boolean;
}

export function CapabilitiesProgress({ progress, visible }: Props) {
  if (!visible) return null;

  return (
    <div className="lc-progress" aria-hidden="true">
      <div className="lc-progress-fill" style={{ transform: `scaleX(${progress})` }} />
    </div>
  );
}

export default CapabilitiesProgress;
