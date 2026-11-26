import * as React from 'react';
import { FooterWaveArt } from './FooterWaveArt';

export interface FooterPaperRevealProps {
  uid: string;
  grainUrl: string;
  copyright?: string;
  onBackToTop: () => void;
}

/**
 * Underlying Warm Ivory Backing Sheet + Giant INSPIRING WAVE Wordmark +
 * Corner Ocean Wave Illustrations + Bottom Legal & Back-to-Top Bar.
 */
export function FooterPaperReveal({
  uid,
  grainUrl,
  copyright = '© 2026 Inspiring Wave Digitech Pvt. Ltd.',
  onBackToTop,
}: FooterPaperRevealProps) {
  return (
    <>
      {/* Layer 0: Cream backing paper + whisper-soft warm paper grain */}
      <div className="iwf-cream-backing" aria-hidden="true">
        {grainUrl && (
          <span
            className="iwf-cream-grain"
            style={{ backgroundImage: `url(${grainUrl})` }}
          />
        )}
      </div>

      {/* Layer 1: Underlying printed brand wordmark & ocean wave illustrations */}
      <div className="iwf-paper-print">
        <div className="iwf-wordmark-stage">
          <div className="iwf-wordmark-mask">
            <div className="iwf-wordmark-text" data-iwf-wordmark aria-label="Inspiring Wave">
              INSPIRING WAVE
            </div>
          </div>
        </div>

        <FooterWaveArt uid={uid} />
      </div>

      {/* Layer 4 (bottom strip): Thin divider, real company copyright, legal links & back-to-top */}
      <div className="iwf-legal-bar" data-iwf-legal>
        <div className="iwf-legal-inner">
          <p className="iwf-copyright">{copyright}</p>

          <nav className="iwf-legal-links" aria-label="Legal policies">
            <a
              href="https://inspiringwave.in/terms/"
              target="_blank"
              rel="noopener noreferrer"
              className="iwf-legal-link"
            >
              Privacy
            </a>
            <a
              href="https://inspiringwave.in/terms/"
              target="_blank"
              rel="noopener noreferrer"
              className="iwf-legal-link"
            >
              Terms
            </a>
            <a
              href="https://inspiringwave.in/terms/"
              target="_blank"
              rel="noopener noreferrer"
              className="iwf-legal-link"
            >
              Cookies
            </a>
          </nav>

          <div className="iwf-legal-right">
            <span className="iwf-motto">Independent minds. Real momentum.</span>
            <button
              type="button"
              className="iwf-back-top"
              onClick={onBackToTop}
              aria-label="Scroll back to top"
              title="Back to top"
            >
              <span className="iwf-back-top-arrow" aria-hidden="true">
                ↗
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
