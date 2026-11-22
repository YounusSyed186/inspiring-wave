import React from 'react'

/**
 * Top and bottom jagged paper tear curtains for the Stage 05 transformation.
 * Renders procedural deckle edges with white paper core and shadow,
 * pulling apart to reveal the ivory manifesto poster underneath.
 */

// Precomputed organic tear line path across 1440px wide viewport
const TOP_TEAR_PATH =
  'M0,0 L1440,0 L1440,188 L1380,182 L1320,196 L1260,178 L1200,192 L1140,175 L1080,198 L1020,180 L960,195 L900,172 L840,190 L780,184 L720,202 L660,176 L600,194 L540,178 L480,196 L420,174 L360,192 L300,180 L240,198 L180,176 L120,194 L60,182 L0,195 Z'

const BOTTOM_TEAR_PATH =
  'M0,900 L1440,900 L1440,712 L1380,724 L1320,706 L1260,728 L1200,710 L1140,732 L1080,708 L1020,726 L960,712 L900,734 L840,715 L780,728 L720,705 L660,730 L600,714 L540,732 L480,712 L420,736 L360,716 L300,730 L240,710 L180,732 L120,714 L60,728 L0,715 Z'

const TOP_CORE_FIBERS =
  'M0,195 L60,182 L120,194 L180,176 L240,198 L300,180 L360,192 L420,174 L480,196 L540,178 L600,194 L660,176 L720,202 L780,184 L840,190 L900,172 L960,195 L1020,180 L1080,198 L1140,175 L1200,192 L1260,178 L1320,196 L1380,182 L1440,188'

const BOTTOM_CORE_FIBERS =
  'M0,715 L60,728 L120,714 L180,732 L240,710 L300,730 L360,716 L420,736 L480,712 L540,732 L600,714 L660,730 L720,705 L780,728 L840,715 L900,734 L960,712 L1020,726 L1080,708 L1140,732 L1200,710 L1260,728 L1320,706 L1380,724 L1440,712'

export interface PaperTearCurtainProps {
  stageRef?: React.RefObject<HTMLDivElement | null>
  topFlapRef: React.RefObject<HTMLDivElement | null>
  bottomFlapRef: React.RefObject<HTMLDivElement | null>
}

export function PaperTearCurtain({ stageRef, topFlapRef, bottomFlapRef }: PaperTearCurtainProps) {
  return (
    <div ref={stageRef} className="cm-tear-stage" aria-hidden="true" style={{ opacity: 0, display: 'none' }}>
      {/* Top Deckle Curtain Flap */}
      <div ref={topFlapRef} className="cm-tear-flap cm-tear-flap--top">
        <svg
          viewBox="0 0 1440 380"
          preserveAspectRatio="none"
          className="w-full h-full block"
        >
          <defs>
            <filter id="cm-tear-shadow-top" x="-5%" y="-5%" width="110%" height="130%">
              <feDropShadow dx="0" dy="18" stdDeviation="16" floodColor="#04070d" floodOpacity="0.85" />
            </filter>
            <linearGradient id="cm-dark-grad-top" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#080d17" />
              <stop offset="75%" stopColor="#080d17" />
              <stop offset="100%" stopColor="#111c30" />
            </linearGradient>
          </defs>

          {/* Main Dark Body */}
          <path
            d={TOP_TEAR_PATH}
            fill="url(#cm-dark-grad-top)"
            filter="url(#cm-tear-shadow-top)"
          />

          {/* Exposed White Deckle Core */}
          <path
            d={TOP_CORE_FIBERS}
            fill="none"
            stroke="#ffffff"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.95"
          />

          {/* Subtle Secondary Cobalt Accent Stripe along the tear */}
          <path
            d={TOP_CORE_FIBERS}
            fill="none"
            stroke="#2045ff"
            strokeWidth="2"
            strokeDasharray="18 12"
            opacity="0.75"
          />
        </svg>
      </div>

      {/* Bottom Deckle Curtain Flap */}
      <div ref={bottomFlapRef} className="cm-tear-flap cm-tear-flap--bottom">
        <svg
          viewBox="0 0 1440 380"
          preserveAspectRatio="none"
          className="w-full h-full block"
        >
          <defs>
            <filter id="cm-tear-shadow-bottom" x="-5%" y="-30%" width="110%" height="140%">
              <feDropShadow dx="0" dy="-18" stdDeviation="16" floodColor="#04070d" floodOpacity="0.85" />
            </filter>
            <linearGradient id="cm-dark-grad-bottom" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#080d17" />
              <stop offset="75%" stopColor="#080d17" />
              <stop offset="100%" stopColor="#111c30" />
            </linearGradient>
          </defs>

          {/* Main Dark Body */}
          <path
            d={BOTTOM_TEAR_PATH}
            transform="translate(0, -520)"
            fill="url(#cm-dark-grad-bottom)"
            filter="url(#cm-tear-shadow-bottom)"
          />

          {/* Exposed White Deckle Core */}
          <path
            d={BOTTOM_CORE_FIBERS}
            transform="translate(0, -520)"
            fill="none"
            stroke="#ffffff"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.95"
          />

          {/* Subtle Secondary Cobalt Accent Stripe along the tear */}
          <path
            d={BOTTOM_CORE_FIBERS}
            transform="translate(0, -520)"
            fill="none"
            stroke="#2045ff"
            strokeWidth="2"
            strokeDasharray="24 16"
            opacity="0.75"
          />
        </svg>
      </div>
    </div>
  )
}
