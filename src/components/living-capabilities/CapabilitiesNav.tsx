import React from 'react'
import { CapabilityService } from './types'

export interface CapabilitiesNavProps {
  services: CapabilityService[]
  activeIdx: number
  onSelect: (pTarget: number) => void
}

export const CapabilitiesNav: React.FC<CapabilitiesNavProps> = ({
  services,
  activeIdx,
  onSelect,
}) => {
  return (
    <nav className="lca-nav-rail" aria-label="Capabilities index">
      <ul className="lca-nav-list" role="tablist">
        {services.map((s, i) => {
          const isActive = i === activeIdx
          return (
            <li key={s.id} className="lca-nav-item" role="presentation">
              <button
                type="button"
                role="tab"
                id={`lca-tab-${s.num}`}
                aria-selected={isActive}
                aria-controls={`lca-panel-${s.num}`}
                className={`lca-nav-btn ${isActive ? 'is-active' : ''}`}
                onClick={() => onSelect(s.pCenter)}
              >
                <span className="lca-nav-num">{s.num}</span>
                <span className="lca-nav-title">{s.title}</span>
                {isActive && (
                  <span className="lca-nav-brush" aria-hidden="true" />
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
