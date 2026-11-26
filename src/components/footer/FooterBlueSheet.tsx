import * as React from 'react';
import { Link } from 'react-router-dom';

export interface FooterBlueSheetProps {
  uid: string;
  onSubscribe?: (email: string) => Promise<void> | void;
}

/**
 * Hydration-safe live digital clock in Asia/Kolkata (IST) matching Reference A's pill badge.
 * Updates every 15 seconds without per-frame React renders.
 */
function HyderabadClock() {
  const [timeStr, setTimeStr] = React.useState<string>('--:-- --');

  React.useEffect(() => {
    let formatter: Intl.DateTimeFormat;
    try {
      formatter = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata',
      });
    } catch {
      formatter = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }
    const update = () => setTimeStr(formatter.format(new Date()).toUpperCase());
    update();
    const intervalId = window.setInterval(update, 15000);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className="iwf-top-meta" data-iwf-assemble>
      <span className="iwf-top-loc">HYDERABAD / IST</span>
      <span className="iwf-top-dot" aria-hidden="true" />
      <span className="iwf-clock-pill" title="Live time in Hyderabad, India (Asia/Kolkata)">
        <svg viewBox="0 0 16 16" className="iwf-clock-ico" aria-hidden="true">
          <circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path
            d="M8 4.5V8l2.4 1.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
        <time className="iwf-clock-text">{timeStr}</time>
      </span>
    </div>
  );
}

function SocialSvg({ kind }: { kind: 'linkedin' | 'youtube' | 'instagram' | 'x' }) {
  switch (kind) {
    case 'linkedin':
      return (
        <svg viewBox="0 0 24 24" className="iwf-social-svg" aria-hidden="true" fill="currentColor">
          <path d="M6.94 8.5H4.1V19h2.84V8.5zM5.52 4.1a1.68 1.68 0 1 0 0 3.36 1.68 1.68 0 0 0 0-3.36zM19.9 12.88c0-2.88-1.54-4.22-3.6-4.22-1.66 0-2.4.91-2.82 1.55V8.5h-2.84c.04.88 0 10.5 0 10.5h2.84v-5.86c0-.31.02-.62.11-.85.25-.62.82-1.27 1.78-1.27 1.26 0 1.76.96 1.76 2.37V19h2.77v-6.12z" />
        </svg>
      );
    case 'youtube':
      return (
        <svg viewBox="0 0 24 24" className="iwf-social-svg" aria-hidden="true" fill="currentColor">
          <path d="M20.6 7.6a2.5 2.5 0 0 0-1.76-1.77C17.28 5.4 12 5.4 12 5.4s-5.28 0-6.84.43A2.5 2.5 0 0 0 3.4 7.6C3 9.17 3 12 3 12s0 2.83.4 4.4a2.5 2.5 0 0 0 1.76 1.77c1.56.43 6.84.43 6.84.43s5.28 0 6.84-.43a2.5 2.5 0 0 0 1.76-1.77c.4-1.57.4-4.4.4-4.4s0-2.83-.4-4.4zM10.2 14.85v-5.7L15.15 12l-4.95 2.85z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg
          viewBox="0 0 24 24"
          className="iwf-social-svg"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.85"
        >
          <rect x="4" y="4" width="16" height="16" rx="4.6" />
          <circle cx="12" cy="12" r="3.7" />
          <circle cx="16.9" cy="7.1" r="0.9" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'x':
      return (
        <svg viewBox="0 0 24 24" className="iwf-social-svg" aria-hidden="true" fill="currentColor">
          <path d="M17.53 4.5h2.64l-5.77 6.6L21.2 19.5h-5.32l-4.16-5.44-4.76 5.44H4.32l6.17-7.06L3.98 4.5h5.45l3.76 4.97 4.34-4.97zm-.93 13.42h1.46L8.62 6.01H7.05l9.55 11.91z" />
        </svg>
      );
  }
}

export function FooterBlueSheet({ uid, onSubscribe }: FooterBlueSheetProps) {
  const [email, setEmail] = React.useState('');
  const [subState, setSubState] = React.useState<'idle' | 'loading' | 'pending' | 'subscribed' | 'error'>('idle');
  const [feedback, setFeedback] = React.useState('');
  const [submittedEmails, setSubmittedEmails] = React.useState<Set<string>>(() => new Set());
  const [toast, setToast] = React.useState('');
  const toastTimerRef = React.useRef<number>(0);

  React.useEffect(() => {
    return () => window.clearTimeout(toastTimerRef.current);
  }, []);

  const showToast = (msg: string) => {
    window.clearTimeout(toastTimerRef.current);
    setToast(msg);
    toastTimerRef.current = window.setTimeout(() => setToast(''), 2800);
  };

  const handleCopyEmail = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (navigator.clipboard?.writeText) {
      e.preventDefault();
      navigator.clipboard.writeText('info@inspiringwave.in').then(
        () => showToast('Copied info@inspiringwave.in to clipboard'),
        () => {
          window.location.href = 'mailto:info@inspiringwave.in';
        }
      );
    }
  };

  const handleUnconfiguredSocial = (platform: string) => {
    showToast(`${platform} profile link pending — connect with us on LinkedIn`);
  };

  const handleNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (subState === 'loading') return;

    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
      setSubState('error');
      setFeedback('Please enter a valid email address.');
      return;
    }

    if (submittedEmails.has(trimmed)) {
      setSubState('error');
      setFeedback('This email was already prepared in this session.');
      return;
    }

    if (onSubscribe) {
      try {
        setSubState('loading');
        setFeedback('Submitting...');
        await onSubscribe(trimmed);
        setSubmittedEmails((prev) => new Set(prev).add(trimmed));
        setSubState('subscribed');
        setFeedback('Subscribed for studio updates.');
      } catch {
        setSubState('error');
        setFeedback('Could not subscribe right now. Please try again.');
      }
      return;
    }

    // Honest fallback when no newsletter backend endpoint is configured:
    // Prepare a real mailto request to Inspiring Wave without claiming a fake DB subscription.
    setSubmittedEmails((prev) => new Set(prev).add(trimmed));
    setSubState('pending');
    setFeedback('Newsletter API pending — email enquiry opened for info@inspiringwave.in.');
    const subject = encodeURIComponent('Inspiring Wave — Insights & Updates Request');
    const body = encodeURIComponent(
      `Hello Inspiring Wave,\n\nPlease include ${trimmed} when your insights, work & updates dispatches go live.\n`
    );
    window.location.href = `mailto:info@inspiringwave.in?subject=${subject}&body=${body}`;
  };

  return (
    <div className="iwf-blue-content">
      {/* Top Bar: INSPIRING WAVE® on left, HYDERABAD / IST + live clock pill on right */}
      <div className="iwf-top-bar">
        <Link to="/" className="iwf-brand-mark" data-iwf-assemble aria-label="Inspiring Wave home">
          INSPIRING WAVE<sup aria-hidden="true">®</sup>
        </Link>
        <HyderabadClock />
      </div>

      {/* Main Editorial Upper Grid */}
      <div className="iwf-poster-grid">
        {/* Dominant Left Headline */}
        <div className="iwf-headline-block">
          <p className="iwf-eyebrow" data-iwf-assemble>
            HAVE A PROJECT?
          </p>

          <div className="iwf-display-wrap">
            {/* Restrained white hand-drawn motion burst marks at upper-right of LET'S MAKE */}
            <svg
              viewBox="0 0 68 54"
              className="iwf-headline-sparks"
              aria-hidden="true"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="3.6"
              strokeLinecap="round"
            >
              <path data-iwf-stroke d="M12 34 L19 19" />
              <path data-iwf-stroke d="M27 32 L40 6" />
              <path data-iwf-stroke d="M43 39 L63 22" />
            </svg>

            <h2 className="iwf-headline">
              <span className="iwf-line-mask">
                <span className="iwf-line-inner" data-iwf-headline-line="1">
                  LET’S MAKE
                </span>
              </span>
              <span className="iwf-line-mask iwf-line-indent">
                <span className="iwf-line-inner" data-iwf-headline-line="2">
                  IT MOVE.
                </span>
              </span>
            </h2>

            {/* Hand-drawn white double swoosh underline beneath IT MOVE. */}
            <svg
              viewBox="0 0 420 34"
              className="iwf-headline-underline"
              aria-hidden="true"
              fill="none"
              stroke="#FFFFFF"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path
                data-iwf-stroke
                d="M 16 25 Q 198 3 366 8 Q 272 17 196 24 Q 296 20 398 18"
                strokeWidth="3.8"
              />
            </svg>
          </div>
        </div>

        {/* Right Editorial Navigation Columns + Newsletter Bar */}
        <div className="iwf-right-panel">
          <div className="iwf-nav-columns">
            <nav className="iwf-nav-col" aria-label="Explore" data-iwf-nav-col>
              <h3 className="iwf-col-heading">EXPLORE</h3>
              <ul className="iwf-col-list">
                <li>
                  <Link to="/work" className="iwf-nav-link">
                    <span>Selected Work</span>
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="iwf-nav-link">
                    <span>Services</span>
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="iwf-nav-link">
                    <span>Studio</span>
                  </Link>
                </li>
              </ul>
            </nav>

            <nav className="iwf-nav-col" aria-label="Thinking" data-iwf-nav-col>
              <h3 className="iwf-col-heading">THINKING</h3>
              <ul className="iwf-col-list">
                <li>
                  <Link to="/journal" className="iwf-nav-link">
                    <span>Journal</span>
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="iwf-nav-link">
                    <span>Our Approach</span>
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="iwf-nav-link">
                    <span>Capabilities</span>
                  </Link>
                </li>
              </ul>
            </nav>

            <nav className="iwf-nav-col iwf-nav-connect" aria-label="Connect" data-iwf-nav-col>
              <h3 className="iwf-col-heading">CONNECT</h3>
              <ul className="iwf-col-list">
                <li>
                  <Link to="/contact" className="iwf-nav-link iwf-cta-inline">
                    <span>Start a Project</span>
                    <span className="iwf-diag-arrow" aria-hidden="true">
                      ↗
                    </span>
                  </Link>
                </li>
                <li>
                  <a
                    href="mailto:info@inspiringwave.in"
                    onClick={handleCopyEmail}
                    className="iwf-nav-link"
                    title="Click to copy info@inspiringwave.in"
                  >
                    <span>info@inspiringwave.in</span>
                  </a>
                </li>
                <li>
                  <a href="tel:+917893801806" className="iwf-nav-link">
                    <span>+91 78938 01806</span>
                  </a>
                </li>
              </ul>
            </nav>

            <div className="iwf-nav-col iwf-follow-col" data-iwf-nav-col>
              <h3 className="iwf-col-heading">FOLLOW</h3>
              <div className="iwf-social-row" role="group" aria-label="Social media channels">
                <a
                  href="https://www.linkedin.com/company/inspiringwave/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="iwf-social-btn"
                  aria-label="Inspiring Wave on LinkedIn"
                  title="LinkedIn"
                >
                  <SocialSvg kind="linkedin" />
                </a>
                <button
                  type="button"
                  className="iwf-social-btn"
                  onClick={() => handleUnconfiguredSocial('YouTube')}
                  aria-label="YouTube channel (coming soon)"
                  title="YouTube"
                >
                  <SocialSvg kind="youtube" />
                </button>
                <button
                  type="button"
                  className="iwf-social-btn"
                  onClick={() => handleUnconfiguredSocial('Instagram')}
                  aria-label="Instagram profile (coming soon)"
                  title="Instagram"
                >
                  <SocialSvg kind="instagram" />
                </button>
                <button
                  type="button"
                  className="iwf-social-btn"
                  onClick={() => handleUnconfiguredSocial('X')}
                  aria-label="X profile (coming soon)"
                  title="X"
                >
                  <SocialSvg kind="x" />
                </button>
              </div>
            </div>
          </div>

          {/* Horizontal Newsletter Subscription Bar */}
          <div className="iwf-newsletter-area" data-iwf-assemble>
            <form className="iwf-newsletter-form" onSubmit={handleNewsletterSubmit} noValidate>
              <label htmlFor={uid + '-newsletter-email'} className="iwf-sr-only">
                Email address for insights, work and updates
              </label>
              <span className="iwf-mail-icon" aria-hidden="true">
                <svg viewBox="0 0 22 18" fill="currentColor">
                  <path d="M2.5 1.5h17A1.5 1.5 0 0 1 21 3v12a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 1 15V3a1.5 1.5 0 0 1 1.5-1.5zm.9 2.2L11 9.15l7.6-5.45H3.4zM19 14.5V5.6l-7.53 5.4a.8.8 0 0 1-.94 0L3 5.6v8.9h16z" />
                </svg>
              </span>
              <input
                id={uid + '-newsletter-email'}
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Get insights, work & updates"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (subState === 'error') {
                    setSubState('idle');
                    setFeedback('');
                  }
                }}
                aria-invalid={subState === 'error'}
                aria-describedby={feedback ? uid + '-newsletter-status' : undefined}
                className="iwf-newsletter-input"
              />
              <button
                type="submit"
                className="iwf-newsletter-submit"
                disabled={subState === 'loading'}
              >
                <span>{subState === 'loading' ? 'Sending' : 'Subscribe'}</span>
                <span className="iwf-submit-arrow" aria-hidden="true">
                  ↗
                </span>
              </button>

              {/* Three white spark lines at top-right of the newsletter capsule (Reference A) */}
              <svg
                viewBox="0 0 36 36"
                className="iwf-news-sparks"
                aria-hidden="true"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2.8"
                strokeLinecap="round"
              >
                <path d="M4 17 L13 5" />
                <path d="M10 24 L25 14" />
                <path d="M14 31 L27 27" />
              </svg>
            </form>

            {(feedback || toast) && (
              <p
                id={uid + '-newsletter-status'}
                className={`iwf-status-msg ${subState === 'error' ? 'is-error' : ''}`}
                role="status"
                aria-live="polite"
              >
                {toast || feedback}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
