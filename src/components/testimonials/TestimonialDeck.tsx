import * as React from 'react';
import gsap from 'gsap';
import { getInitials, type InspiringWaveTestimonial } from './data/testimonials';
import type { TransitionDirection } from './hooks/useTestimonialSelection';

interface CardSheetContentProps {
  item: InspiringWaveTestimonial;
  isGhost?: boolean;
}

function quoteSizeClass(quote: string): string {
  const len = quote.length;
  if (len <= 78) return 'tw-quote--xl';
  if (len <= 115) return 'tw-quote--lg';
  return 'tw-quote--md';
}

function VerifiedRatingStars({ rating }: { rating: number }) {
  const clamped = Math.max(0, Math.min(5, rating));
  return (
    <div className="tw-rating-block" aria-label={`Rated ${clamped.toFixed(1)} out of 5`}>
      <div className="tw-stars-row" aria-hidden="true">
        {Array.from({ length: 5 }, (_, idx) => {
          const fillPct = Math.max(0, Math.min(1, clamped - idx));
          return (
            <svg key={idx} viewBox="0 0 24 24" className="tw-star-ico">
              <path
                d="M12 2.2l2.92 6.08 6.68.92-4.86 4.68 1.18 6.64L12 17.34l-5.92 3.18 1.18-6.64L2.4 9.2l6.68-.92L12 2.2z"
                fill={fillPct >= 0.5 ? '#173CFF' : 'rgba(23, 60, 255, 0.2)'}
              />
            </svg>
          );
        })}
      </div>
      <span className="tw-rating-caption">{clamped.toFixed(1)} / CLIENT REVIEW</span>
    </div>
  );
}

function CardSheetContent({ item, isGhost = false }: CardSheetContentProps) {
  const initials = getInitials(item.name);

  return (
    <article
      className="tw-paper-sheet"
      aria-hidden={isGhost ? 'true' : undefined}
    >
      {/* Subtle physical paper texture overlay */}
      <div className="tw-paper-grain" aria-hidden="true" />

      <div className="tw-paper-inner">
        {/* Curved Editorial Opening Double Quotation Mark matching Reference A */}
        <svg viewBox="0 0 88 64" className="tw-quote-mark" aria-hidden="true" data-tw-quote-el>
          <path
            d="M36.5 6.5c-11.2 4.2-18.8 12.8-20.4 23.4 2.2-.8 4.4-1.2 6.8-1.2 8.8 0 15.6 6.4 15.6 14.9 0 8.8-7 15.4-16.2 15.4-10.2 0-17.8-7.8-17.8-20.4C4.5 20.6 15.6 7.8 32.8 2.2l3.7 4.3zm45 0c-11.2 4.2-18.8 12.8-20.4 23.4 2.2-.8 4.4-1.2 6.8-1.2 8.8 0 15.6 6.4 15.6 14.9 0 8.8-7 15.4-16.2 15.4-10.2 0-17.8-7.8-17.8-20.4C49.5 20.6 60.6 7.8 77.8 2.2l3.7 4.3z"
            fill="#173CFF"
          />
        </svg>

        {/* Primary Editorial Quotation */}
        <blockquote
          className={`tw-quote-text ${quoteSizeClass(item.quote)}`}
          data-tw-quote-el
        >
          “{item.quote}”
        </blockquote>

        {/* Client Identity, Verified Attribution & Scope / Optional Rating */}
        <div className="tw-card-footer" data-tw-meta-el>
          <div className="tw-author-cluster">
            <div className="tw-portrait-frame">
              {item.image ? (
                <img
                  src={item.image}
                  alt={`Portrait of ${item.name}`}
                  className="tw-portrait-img"
                  loading="lazy"
                />
              ) : (
                <div className="tw-portrait-monogram" aria-hidden="true">
                  <span className="tw-monogram-grid" />
                  <span className="tw-monogram-letters">{initials}</span>
                  <span className="tw-monogram-tag">CLIENT</span>
                </div>
              )}
            </div>

            <div className="tw-author-meta">
              <cite className="tw-author-name">{item.name}</cite>
              {item.role && <span className="tw-author-role">{item.role}</span>}
              {item.company && <span className="tw-author-company">{item.company}</span>}
              <span className="tw-location-pill">
                <svg viewBox="0 0 14 18" className="tw-loc-pin-ico" aria-hidden="true">
                  <path
                    d="M7 1C3.9 1 1.4 3.5 1.4 6.6c0 4.1 5.6 10 5.6 10s5.6-5.9 5.6-10C12.6 3.5 10.1 1 7 1zm0 7.7a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2z"
                    fill="currentColor"
                  />
                </svg>
                <span>
                  {item.city}
                  {item.country ? `, ${item.country}` : ''}
                </span>
              </span>
            </div>
          </div>

          <div className="tw-footer-divider" aria-hidden="true" />

          <div className="tw-proof-cluster">
            {typeof item.rating === 'number' ? (
              <VerifiedRatingStars rating={item.rating} />
            ) : (
              <div className="tw-verified-scope">
                <div className="tw-verified-seal-row">
                  <span className="tw-verified-dot" aria-hidden="true" />
                  <span className="tw-verified-badge-label">VERIFIED PARTNER</span>
                </div>
                <span className="tw-verified-scope-text">{item.verifiedScope}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export interface TestimonialDeckProps {
  activeItem: InspiringWaveTestimonial;
  direction: TransitionDirection;
  transitionRevision: number;
  reducedMotion: boolean;
  onPauseChange: (paused: boolean) => void;
}

export function TestimonialDeck({
  activeItem,
  direction,
  transitionRevision,
  reducedMotion,
  onPauseChange,
}: TestimonialDeckProps) {
  const deckRef = React.useRef<HTMLDivElement>(null);
  const incomingWrapRef = React.useRef<HTMLDivElement>(null);
  const outgoingWrapRef = React.useRef<HTMLDivElement>(null);
  const bluePanelRef = React.useRef<HTMLDivElement>(null);
  const cloudPanelRef = React.useRef<HTMLDivElement>(null);
  const silkPanelRef = React.useRef<HTMLDivElement>(null);
  const limePanelRef = React.useRef<HTMLDivElement>(null);

  const [displayedItem, setDisplayedItem] = React.useState<InspiringWaveTestimonial>(activeItem);
  const [outgoingItem, setOutgoingItem] = React.useState<InspiringWaveTestimonial | null>(null);
  const prevIdRef = React.useRef(activeItem.id);
  const swapTlRef = React.useRef<gsap.core.Timeline | null>(null);

  // Layered physical editorial sheet swap (useLayoutEffect avoids any 1-frame flash before paint)
  React.useLayoutEffect(() => {
    if (activeItem.id === prevIdRef.current) return;
    const previous = displayedItem;
    prevIdRef.current = activeItem.id;

    swapTlRef.current?.kill();

    if (reducedMotion) {
      setOutgoingItem(null);
      setDisplayedItem(activeItem);
      return;
    }

    setOutgoingItem(previous);
    setDisplayedItem(activeItem);
  }, [activeItem, displayedItem, reducedMotion, transitionRevision]);

  React.useLayoutEffect(() => {
    if (!outgoingItem || reducedMotion) return;
    const outEl = outgoingWrapRef.current;
    const inEl = incomingWrapRef.current;
    if (!inEl) return;

    swapTlRef.current?.kill();

    const sign = direction >= 0 ? 1 : -1;
    const tl = gsap.timeline({
      onComplete: () => {
        setOutgoingItem(null);
      },
    });
    swapTlRef.current = tl;

    // Incoming sheet waits cleanly right underneath the outgoing top sheet and rises smoothly into focus
    gsap.set(inEl, {
      x: sign * 18,
      y: 10,
      rotation: sign * 1.1,
      scale: 0.982,
      opacity: 1,
      zIndex: 5,
    });

    if (outEl) {
      gsap.set(outEl, { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, zIndex: 10 });
      tl.to(
        outEl,
        {
          y: -14,
          x: -sign * 88,
          rotation: -sign * 3.8,
          scale: 0.97,
          opacity: 0,
          duration: 0.46,
          ease: 'power3.inOut',
        },
        0
      );
    }

    tl.to(
      inEl,
      {
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        duration: 0.52,
        ease: 'power3.out',
        clearProps: 'zIndex',
      },
      0.06
    );

    const bgPanels = [bluePanelRef.current, cloudPanelRef.current, silkPanelRef.current, limePanelRef.current].filter(Boolean);
    if (bgPanels.length) {
      tl.to(
        bgPanels,
        {
          x: sign * 7,
          y: -3,
          duration: 0.22,
          stagger: 0.025,
          yoyo: true,
          repeat: 1,
          ease: 'power2.out',
        },
        0
      );
    }

    return () => {
      tl.kill();
    };
  }, [outgoingItem, direction, reducedMotion]);

  // Restrained pointer parallax on secondary editorial panels (Section 26: 3px–7px max)
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || e.pointerType === 'touch') return;
    const el = deckRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const nx = (e.clientX - r.left) / Math.max(1, r.width) - 0.5;
    const ny = (e.clientY - r.top) / Math.max(1, r.height) - 0.5;

    bluePanelRef.current?.style.setProperty('--tw-px', `${(nx * 8).toFixed(2)}px`);
    bluePanelRef.current?.style.setProperty('--tw-py', `${(ny * 8).toFixed(2)}px`);
    cloudPanelRef.current?.style.setProperty('--tw-px', `${(nx * 14).toFixed(2)}px`);
    cloudPanelRef.current?.style.setProperty('--tw-py', `${(ny * 10).toFixed(2)}px`);
    silkPanelRef.current?.style.setProperty('--tw-px', `${(nx * 10).toFixed(2)}px`);
    silkPanelRef.current?.style.setProperty('--tw-py', `${(ny * 8).toFixed(2)}px`);
    limePanelRef.current?.style.setProperty('--tw-px', `${(nx * 6).toFixed(2)}px`);
    limePanelRef.current?.style.setProperty('--tw-py', `${(ny * 6).toFixed(2)}px`);
  };

  const handlePointerLeave = () => {
    onPauseChange(false);
    [bluePanelRef, cloudPanelRef, silkPanelRef, limePanelRef].forEach((ref) => {
      ref.current?.style.setProperty('--tw-px', '0px');
      ref.current?.style.setProperty('--tw-py', '0px');
    });
  };

  return (
    <div
      ref={deckRef}
      className="tw-deck-zone"
      onMouseEnter={() => onPauseChange(true)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onFocusCapture={() => onPauseChange(true)}
      onBlurCapture={() => onPauseChange(false)}
    >
      {/* Entrance wrapper (owned solely by scroll entrance GSAP timeline) */}
      <div className="tw-deck-entrance">
        {/* Layer 5: Neon-Lime Accent Tab */}
        <div className="tw-bg-panel-wrap tw-panel-lime-pos" data-tw-bg-panel="4" aria-hidden="true">
          <div ref={limePanelRef} className="tw-bg-panel tw-panel-lime" />
        </div>

        {/* Layer 4: Dark Cobalt & Ivory Silk Material Panel */}
        <div className="tw-bg-panel-wrap tw-panel-silk-pos" data-tw-bg-panel="3" aria-hidden="true">
          <div ref={silkPanelRef} className="tw-bg-panel tw-panel-silk">
            <img src="/assets/fabric.webp" alt="" loading="lazy" />
          </div>
        </div>

        {/* Layer 3: Atmospheric Cumulus Cloud Editorial Panel */}
        <div className="tw-bg-panel-wrap tw-panel-cloud-pos" data-tw-bg-panel="2" aria-hidden="true">
          <div ref={cloudPanelRef} className="tw-bg-panel tw-panel-cloud">
            <img src="/assets/hero/machine-cloud.webp" alt="" loading="lazy" />
          </div>
        </div>

        {/* Layer 2: Electric Cobalt Offset Backing Panel */}
        <div className="tw-bg-panel-wrap tw-panel-blue-pos" data-tw-bg-panel="1" aria-hidden="true">
          <div ref={bluePanelRef} className="tw-bg-panel tw-panel-blue" />
        </div>

        {/* Layer 1: Active Cream Editorial Quotation Card */}
        <div className="tw-main-card-entrance" data-tw-main-card>
          <div className="tw-card-swap-stage">
            {outgoingItem && (
              <div ref={outgoingWrapRef} className="tw-card-transition-layer is-outgoing">
                <CardSheetContent item={outgoingItem} isGhost />
              </div>
            )}
            <div
              ref={incomingWrapRef}
              className="tw-card-transition-layer is-active"
              aria-live="polite"
              aria-atomic="true"
            >
              <CardSheetContent item={displayedItem} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
