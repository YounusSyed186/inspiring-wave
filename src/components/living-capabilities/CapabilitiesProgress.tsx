import React from 'react'
import { CapabilityService } from './types'

export interface CapabilitiesProgressProps {
  services: CapabilityService[]
  activeIdx: number
  progress: number
  onSelect: (pTarget: number) => void
  onAdvance: () => void
}

export const CapabilitiesProgress: React.FC<CapabilitiesProgressProps> = ({
  services,
  activeIdx,
  progress,
  onSelect,
  onAdvance,
}) => {
  const nextService = activeIdx < services.length - 1 ? services[activeIdx + 1] : null

  return (
    <footer className="lca-progress-bar" aria-label="Capabilities timeline">
      {/* Left: Scroll Cue */}
      <button
        type="button"
        className="lca-scroll-explore"
        onClick={onAdvance}
        aria-label="Scroll to explore next capability"
      >
        <span className="lca-explore-circle">
          <span className="lca-explore-arrow">↓</span>
        </span>
        <span className="lca-explore-text">
          SCROLL<br />TO EXPLORE SERVICES
        </span>
      </button>

      {/* Center: Six-Stage Progress Timeline */}
      <div className="lca-timeline-track" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
        <div className="lca-timeline-line" />
        <div
          className="lca-timeline-fill"
          style={{ width: `${Math.min(100, Math.max(0, (progress - 0.09) / 0.88 * 100))}%` }}
        />
        <div className="lca-timeline-nodes">
          {services.map((s, i) => {
            const isActive = i === activeIdx
            const isPassed = i < activeIdx
            return (
              <button
                key={s.id}
                type="button"
                className={`lca-timeline-node ${isActive ? 'is-active' : isPassed ? 'is-passed' : ''}`}
                onClick={() => onSelect(s.pCenter)}
                aria-label={`Jump to 0${i + 1} ${s.title}`}
              >
                <span>{s.num}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Right: Next Service Anchor */}
      <div className="lca-next-anchor">
        {nextService ? (
          <button
            type="button"
            className="lca-next-btn"
            onClick={() => onSelect(nextService.pCenter)}
          >
            <span className="lca-next-prefix">NEXT :</span>
            <span className="lca-next-name">{nextService.title}</span>
            <span className="lca-next-arrow">↗</span>
          </button>
        ) : (
          <button
            type="button"
            className="lca-next-btn"
            onClick={onAdvance}
          >
            <span className="lca-next-prefix">NEXT :</span>
            <span className="lca-next-name">05 // METHOD</span>
            <span className="lca-next-arrow">↗</span>
          </button>
        )}
      </div>
    </footer>
  )
}
