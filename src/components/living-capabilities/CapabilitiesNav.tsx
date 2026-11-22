/**
 * Living Capabilities – Station Navigation
 *
 * Side navigation with station numbers and abbreviated titles.
 * Clicking a station scrolls to its position in the timeline.
 */
import { STATIONS } from './config';

interface Props {
  activeStation: number;
  onNavigate: (index: number) => void;
  visible: boolean;
}

export function CapabilitiesNav({ activeStation, onNavigate, visible }: Props) {
  if (!visible) return null;

  return (
    <nav className="lc-nav" aria-label="Service stations">
      {STATIONS.map((station, i) => (
        <button
          key={station.slug}
          className={`lc-nav-item ${i === activeStation ? 'active' : ''}`}
          onClick={() => onNavigate(i)}
          aria-current={i === activeStation ? 'step' : undefined}
        >
          <span className="lc-nav-num">{String(i + 1).padStart(2, '0')}</span>
          <span className="lc-nav-label">{station.title.split(' ')[0]}</span>
        </button>
      ))}
    </nav>
  );
}

export default CapabilitiesNav;
