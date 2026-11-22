import React from 'react'

export interface ManifestoRevealCardProps {
  cardRef: React.RefObject<HTMLDivElement | null>
}

export function ManifestoRevealCard({ cardRef }: ManifestoRevealCardProps) {
  return (
    <div ref={cardRef} className="cm-manifesto-card" aria-hidden="true">
      {/* Editorial poster background with technical ticks */}
      <div className="cm-manifesto-card-inner">
        {/* Registration crosshairs */}
        <div className="cm-card-cross cm-card-cross--tl">+</div>
        <div className="cm-card-cross cm-card-cross--tr">+</div>
        <div className="cm-card-cross cm-card-cross--bl">+</div>
        <div className="cm-card-cross cm-card-cross--br">+</div>

        {/* Top 02 // MANIFESTO capsule badge */}
        <div className="cm-card-badge">
          <span className="cm-card-badge-dot" />
          <span className="cm-card-badge-text">02 // MANIFESTO</span>
        </div>

        {/* Monumental Headline */}
        <div className="cm-card-headline">
          <span className="cm-card-line">THE WORLD</span>
          <span className="cm-card-line">DOESN’T</span>
          <span className="cm-card-line cm-card-line--last">
            STAND STILL.
            {/* Dynamic lime brush stroke accent */}
            <svg
              className="cm-card-brush"
              viewBox="0 0 240 24"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M4,14 C48,6 120,4 236,16 C180,19 80,18 8,22 Z"
                fill="#d8f03c"
                opacity="0.95"
              />
            </svg>
          </span>
        </div>
      </div>
    </div>
  )
}
