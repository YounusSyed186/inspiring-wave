import * as React from 'react';
import { services } from '@/data';

export interface ContactFormValues {
  name: string;
  email: string;
  company: string;
  projectType: string;
  message: string;
}

export interface ContactFormErrors {
  name?: string;
  email?: string;
  projectType?: string;
  message?: string;
}

const INITIAL_VALUES: ContactFormValues = {
  name: '',
  email: '',
  company: '',
  projectType: '',
  message: '',
};

const PROJECT_OPTIONS = [...services.map((s) => s.title), 'Something Else'];

function validate(values: ContactFormValues): ContactFormErrors {
  const errors: ContactFormErrors = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const message = values.message.trim();

  if (!name) {
    errors.name = 'Please enter your name.';
  } else if (name.length > 100) {
    errors.name = 'Name must be 100 characters or fewer.';
  }

  if (!email) {
    errors.email = 'Please enter your email address.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 160) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!values.projectType) {
    errors.projectType = 'Please select what you are looking to build.';
  }

  if (!message) {
    errors.message = 'Please tell us a little about your idea.';
  } else if (message.length < 15) {
    errors.message = 'Please share at least 15 characters about your project.';
  } else if (message.length > 2500) {
    errors.message = 'Message must be 2,500 characters or fewer.';
  }

  return errors;
}

export interface ContactFormProps {
  uid: string;
  grainUrl: string;
  onBusyChange?: (busy: boolean) => void;
}

export function ContactForm({ uid, grainUrl, onBusyChange }: ContactFormProps) {
  const [values, setValues] = React.useState<ContactFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = React.useState<ContactFormErrors>({});
  const [status, setStatus] = React.useState<'idle' | 'submitting' | 'sent' | 'error'>('idle');
  const [submitNote, setSubmitNote] = React.useState('');

  const artHalftoneRef = React.useRef<SVGSVGElement>(null);
  const artTriangleRef = React.useRef<SVGSVGElement>(null);
  const artFabricRef = React.useRef<HTMLImageElement>(null);

  const handleFieldChange = (field: keyof ContactFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof ContactFormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === 'submitting') return;

    const nextErrors = validate(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStatus('error');
      setSubmitNote('Please check the highlighted fields above.');
      return;
    }

    setErrors({});
    setStatus('submitting');
    onBusyChange?.(true);

    try {
      const subject = encodeURIComponent(
        `[${values.projectType}] Project enquiry from ${values.name.trim()}`
      );
      const body = encodeURIComponent(
        [
          `Name: ${values.name.trim()}`,
          `Email: ${values.email.trim()}`,
          `Company: ${values.company.trim() || '—'}`,
          `Project Type: ${values.projectType}`,
          '',
          values.message.trim(),
        ].join('\n')
      );

      // Static Vite SPA: open pre-filled email client reliably without silently discarding input
      window.location.href = `mailto:info@inspiringwave.in?subject=${subject}&body=${body}`;
      setStatus('sent');
      setSubmitNote('');
    } catch {
      setStatus('error');
      setSubmitNote('Could not launch your email client. Please email info@inspiringwave.in directly.');
    } finally {
      onBusyChange?.(false);
    }
  };

  const handleReset = () => {
    setValues(INITIAL_VALUES);
    setErrors({});
    setStatus('idle');
    setSubmitNote('');
  };

  // Restrained background art pointer parallax (never moves form fields)
  const handleArtPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / Math.max(1, rect.width) - 0.5;
    const ny = (e.clientY - rect.top) / Math.max(1, rect.height) - 0.5;

    if (artHalftoneRef.current) {
      artHalftoneRef.current.style.transform = `translate3d(${(nx * 10).toFixed(1)}px, ${(ny * 8).toFixed(1)}px, 0)`;
    }
    if (artTriangleRef.current) {
      artTriangleRef.current.style.transform = `translate3d(${(nx * 5).toFixed(1)}px, ${(ny * 5).toFixed(1)}px, 0)`;
    }
    if (artFabricRef.current) {
      artFabricRef.current.style.transform = `translate3d(${(nx * 14).toFixed(1)}px, ${(ny * 10).toFixed(1)}px, 0) rotate(-6deg)`;
    }
  };

  return (
    <div className="iwc-cream-stage" onPointerMove={handleArtPointerMove}>
      {/* Warm textured cream paper surface */}
      {grainUrl && (
        <div
          className="iwc-cream-grain"
          style={{ backgroundImage: `url(${grainUrl})` }}
          aria-hidden="true"
        />
      )}

      {/* Decorative Background Art Inside the Form (Halftone Wave + Lime Arrow + Cobalt Fabric) */}
      <div className="iwc-form-bg-art" aria-hidden="true">
        <svg ref={artHalftoneRef} viewBox="0 0 260 190" className="iwc-halftone-wave">
          <defs>
            <pattern id={`${uid}c-dots`} width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="3" r="1.75" fill="#173BE8" />
            </pattern>
          </defs>
          <path
            d="M18 118 C 58 46, 122 24, 186 58 C 228 80, 246 42, 254 18 L 258 174 C 192 162, 134 114, 74 146 C 42 162, 18 144, 18 118 Z"
            fill={`url(#${uid}c-dots)`}
            opacity="0.28"
          />
        </svg>

        <svg ref={artTriangleRef} viewBox="0 0 36 36" className="iwc-lime-triangle">
          <polygon points="4,28 30,16 14,4" fill="#D9FF00" />
        </svg>

        <img
          ref={artFabricRef}
          src="/assets/fabric.webp"
          alt=""
          className="iwc-fabric-accent"
          loading="lazy"
        />
      </div>

      {/* Interactive HTML Contact Form */}
      <div className="iwc-form-shell">
        <header className="iwc-form-header" data-iwc-form-reveal>
          <h3 className="iwc-form-heading">
            TELL US ABOUT
            <br />
            YOUR IDEA.
          </h3>
          <svg viewBox="0 0 240 16" className="iwc-form-underline" fill="none" aria-hidden="true">
            <path
              data-iwc-form-stroke
              d="M3 10 C 66 5, 168 4, 236 9"
              stroke="#D9FF00"
              strokeWidth="4.2"
              strokeLinecap="round"
            />
          </svg>
        </header>

        {status === 'sent' ? (
          <div className="iwc-success-panel" role="status" aria-live="polite">
            <div className="iwc-success-badge" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="iwc-check-ico">
                <path
                  d="M5 12.5l4.5 4.5L19 7.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h4 className="iwc-success-title">MESSAGE READY.</h4>
            <p className="iwc-success-copy">
              Your email client has been opened with your project details for{' '}
              <strong>info@inspiringwave.in</strong>. Thanks for reaching out — we&apos;ll be in touch.
            </p>
            <button type="button" className="iwc-reset-btn" onClick={handleReset}>
              SEND ANOTHER MESSAGE ↗
            </button>
          </div>
        ) : (
          <form className="iwc-form" onSubmit={handleSubmit} noValidate>
            {/* Row 1: Two-column Name & Email */}
            <div className="iwc-row-2" data-iwc-form-reveal>
              <div className={`iwc-field ${errors.name ? 'has-error' : ''}`}>
                <label htmlFor={`${uid}-name`} className="iwc-label">
                  YOUR NAME <span aria-hidden="true">*</span>
                </label>
                <div className="iwc-input-wrap">
                  <svg viewBox="0 0 20 20" className="iwc-field-ico" aria-hidden="true">
                    <circle cx="10" cy="6.5" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
                    <path
                      d="M4 16.5c.8-2.9 3.1-4.3 6-4.3s5.2 1.4 6 4.3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                  <input
                    id={`${uid}-name`}
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Alex Morgan"
                    value={values.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? `${uid}-name-err` : undefined}
                    className="iwc-input"
                    required
                  />
                </div>
                {errors.name && (
                  <p id={`${uid}-name-err`} className="iwc-error-msg" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className={`iwc-field ${errors.email ? 'has-error' : ''}`}>
                <label htmlFor={`${uid}-email`} className="iwc-label">
                  YOUR EMAIL <span aria-hidden="true">*</span>
                </label>
                <div className="iwc-input-wrap">
                  <svg viewBox="0 0 20 20" className="iwc-field-ico" aria-hidden="true">
                    <rect x="2.5" y="4.5" width="15" height="11" rx="1.6" fill="none" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M3.2 5.4L10 10.6l6.8-5.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                  <input
                    id={`${uid}-email`}
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="alex@company.com"
                    value={values.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? `${uid}-email-err` : undefined}
                    className="iwc-input"
                    required
                  />
                </div>
                {errors.email && (
                  <p id={`${uid}-email-err`} className="iwc-error-msg" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Row 2: Company (optional) */}
            <div className="iwc-field" data-iwc-form-reveal>
              <label htmlFor={`${uid}-company`} className="iwc-label">
                COMPANY
              </label>
              <div className="iwc-input-wrap">
                <svg viewBox="0 0 20 20" className="iwc-field-ico" aria-hidden="true">
                  <path
                    d="M3.5 16.5V5.2L10 3v13.5M10 7.2l6.5 2v7.3M2 16.5h16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  id={`${uid}-company`}
                  name="company"
                  type="text"
                  autoComplete="organization"
                  placeholder="Studio or organisation"
                  value={values.company}
                  onChange={(e) => handleFieldChange('company', e.target.value)}
                  className="iwc-input"
                />
              </div>
            </div>

            {/* Row 3: Project Type Select */}
            <div className={`iwc-field ${errors.projectType ? 'has-error' : ''}`} data-iwc-form-reveal>
              <label htmlFor={`${uid}-project`} className="iwc-label">
                WHAT ARE YOU LOOKING TO BUILD? <span aria-hidden="true">*</span>
              </label>
              <div className="iwc-input-wrap iwc-select-wrap">
                <svg viewBox="0 0 20 20" className="iwc-field-ico" aria-hidden="true">
                  <path
                    d="M10 3L3 6.8 10 10.6l7-3.8L10 3zM3 10.2l7 3.8 7-3.8M3 13.6l7 3.8 7-3.8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <select
                  id={`${uid}-project`}
                  name="projectType"
                  value={values.projectType}
                  onChange={(e) => handleFieldChange('projectType', e.target.value)}
                  aria-invalid={Boolean(errors.projectType)}
                  aria-describedby={errors.projectType ? `${uid}-project-err` : undefined}
                  className={`iwc-input iwc-select ${!values.projectType ? 'is-placeholder' : ''}`}
                  required
                >
                  <option value="" disabled>
                    Select a service or direction
                  </option>
                  {PROJECT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <svg viewBox="0 0 16 16" className="iwc-select-chevron" aria-hidden="true">
                  <path
                    d="M4 6l4 4 4-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              {errors.projectType && (
                <p id={`${uid}-project-err`} className="iwc-error-msg" role="alert">
                  {errors.projectType}
                </p>
              )}
            </div>

            {/* Row 4: Message Textarea */}
            <div className={`iwc-field ${errors.message ? 'has-error' : ''}`} data-iwc-form-reveal>
              <label htmlFor={`${uid}-message`} className="iwc-label">
                TELL US MORE ABOUT YOUR IDEA <span aria-hidden="true">*</span>
              </label>
              <div className="iwc-input-wrap iwc-textarea-wrap">
                <svg viewBox="0 0 20 20" className="iwc-field-ico iwc-field-ico--top" aria-hidden="true">
                  <path
                    d="M13.8 3.6l2.6 2.6-9.4 9.4-3.4.8.8-3.4 9.4-9.4z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                </svg>
                <textarea
                  id={`${uid}-message`}
                  name="message"
                  rows={3}
                  placeholder="Share goals, timeline, or anything helpful..."
                  value={values.message}
                  onChange={(e) => handleFieldChange('message', e.target.value)}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? `${uid}-message-err` : undefined}
                  className="iwc-input iwc-textarea"
                  required
                />
              </div>
              {errors.message && (
                <p id={`${uid}-message-err`} className="iwc-error-msg" role="alert">
                  {errors.message}
                </p>
              )}
            </div>

            {submitNote && status === 'error' && (
              <p className="iwc-form-alert" role="alert">
                {submitNote}
              </p>
            )}

            {/* Submit Button with Neon-Lime Offset Shadow + Shield Reassurance */}
            <div className="iwc-submit-row" data-iwc-form-reveal>
              <div className="iwc-submit-stack">
                <span className="iwc-submit-lime-offset" aria-hidden="true" />
                <button
                  type="submit"
                  className="iwc-submit-btn"
                  disabled={status === 'submitting'}
                >
                  <span>{status === 'submitting' ? 'PREPARING...' : 'SEND MESSAGE'}</span>
                  <span className="iwc-submit-arrow" aria-hidden="true">
                    ↗
                  </span>
                </button>
              </div>

              <p className="iwc-reassurance">
                <svg viewBox="0 0 18 20" className="iwc-shield-ico" aria-hidden="true">
                  <path
                    d="M9 1.8L2.5 4.4v5.2c0 4.1 2.8 7.5 6.5 8.6 3.7-1.1 6.5-4.5 6.5-8.6V4.4L9 1.8z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M6.4 9.8l1.8 1.8 3.6-3.8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Every idea starts with a conversation.</span>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
