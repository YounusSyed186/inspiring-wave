import * as React from 'react';

export function TestimonialsHeading() {
  return (
    <>
      {/* Top Bar: Left Eyebrow + Right Brand Mark */}
      <div className="tw-top-bar">
        <p className="tw-eyebrow" data-tw-eyebrow>
          <span className="tw-eyebrow-muted">05 / CLIENT</span>{' '}
          <span className="tw-eyebrow-bright">VOICES</span>
        </p>
        <span className="tw-brand-stamp" data-tw-eyebrow aria-hidden="true">
          INSPIRING WAVE<sup>®</sup>
        </span>
      </div>

      {/* Zone A: WORDS THAT STAY. + Hand-drawn Neon-Lime Ellipse + Cream Motion Marks */}
      <div className="tw-heading-zone">
        {/* Hand-drawn neon-lime elliptical marker stroke */}
        <svg
          viewBox="0 0 760 220"
          className="tw-lime-ellipse"
          fill="none"
          aria-hidden="true"
        >
          <path
            data-tw-lime-stroke
            d="M 52 178 C 8 164, 18 118, 126 78 C 248 33, 474 4, 594 22 C 668 33, 666 76, 566 116 C 472 154, 354 176, 304 188 C 362 164, 444 138, 492 126"
            stroke="#D7FF00"
            strokeWidth="3.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <h2 id="testimonials-heading" className="tw-headline">
          <span className="tw-words-row">
            <span className="tw-word-mask">
              <span className="tw-word-inner" data-tw-word="1">
                WORDS
              </span>
            </span>
            <span className="tw-word-mask">
              <span className="tw-word-inner" data-tw-word="2">
                THAT
              </span>
            </span>
          </span>

          <span className="tw-stay-banner-wrap">
            <span className="tw-stay-banner" data-tw-stay-bg aria-hidden="true" />
            <span className="tw-stay-mask">
              <span className="tw-stay-inner" data-tw-stay-text>
                STAY.
              </span>
            </span>

            {/* Three hand-drawn cream motion marks off upper-right of STAY. */}
            <svg
              viewBox="0 0 68 62"
              className="tw-cream-sparks"
              fill="none"
              aria-hidden="true"
            >
              <path
                data-tw-cream-mark
                d="M10 38 L24 8"
                stroke="#F8F0E4"
                strokeWidth="4.6"
                strokeLinecap="round"
              />
              <path
                data-tw-cream-mark
                d="M23 45 L49 20"
                stroke="#F8F0E4"
                strokeWidth="4.6"
                strokeLinecap="round"
              />
              <path
                data-tw-cream-mark
                d="M31 55 L58 44"
                stroke="#F8F0E4"
                strokeWidth="4.6"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </h2>
      </div>
    </>
  );
}
