import * as React from 'react';

export function ContactBluePoster() {
  return (
    <div className="iwc-blue-poster">
      {/* Editorial Top Marker: 06 / GET IN TOUCH */}
      <div className="iwc-poster-kicker" data-iwc-assemble>
        <span className="iwc-kicker-line" aria-hidden="true" />
        <div className="iwc-kicker-text">
          <span className="iwc-kicker-num">06 /</span>
          <span className="iwc-kicker-label">GET IN TOUCH</span>
          <svg viewBox="0 0 120 12" className="iwc-kicker-underline" fill="none" aria-hidden="true">
            <path
              data-iwc-lime-stroke
              d="M2 7 C 32 4, 86 3, 118 6"
              stroke="#D9FF00"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Main Headline Lockup */}
      <div className="iwc-poster-headline-zone">
        {/* Hand-drawn neon-lime elliptical accent looping around the headline */}
        <svg viewBox="0 0 680 340" className="iwc-lime-ellipse" fill="none" aria-hidden="true">
          <path
            data-iwc-lime-stroke
            d="M 412 52 C 554 34, 650 68, 622 146 C 594 226, 444 294, 232 308 C 72 318, 12 262, 42 192 C 74 118, 224 68, 342 62"
            stroke="#D9FF00"
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <p className="iwc-poster-eyebrow" data-iwc-assemble>
          HAVE A PROJECT IN MIND?
        </p>

        <h2 id="contact-cta-heading" className="iwc-poster-headline">
          <span className="iwc-line-mask">
            <span className="iwc-line-inner" data-iwc-headline-line="1">
              LET’S MAKE
            </span>
          </span>
          <span className="iwc-it-real-wrap">
            <span className="iwc-it-real-bg" data-iwc-banner aria-hidden="true" />
            <span className="iwc-line-mask">
              <span className="iwc-line-inner iwc-it-real-text" data-iwc-headline-line="2">
                IT REAL.
              </span>
            </span>
          </span>
        </h2>

        <p className="iwc-poster-subline" data-iwc-assemble>
          Strategy, design &amp; technology for ideas in motion.
        </p>
      </div>
    </div>
  );
}
