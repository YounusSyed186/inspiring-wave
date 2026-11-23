import React, { useId, useMemo, useState } from 'react';
import { PanelLayout, computePanelGeometry } from './panelGeometry';

interface ServicePanelProps {
  layout: PanelLayout;
  onClick?: () => void;
  isDesktop?: boolean;
}

export const ServicePanel: React.FC<ServicePanelProps> = ({
  layout,
  onClick,
  isDesktop = true,
}) => {
  const rawId = useId();
  const clipId = `panel-clip-${layout.id}-${rawId.replace(/:/g, '')}`;
  const [isHovered, setIsHovered] = useState(false);

  // Compute the mathematically rounded quadrilateral path
  const { normalizedPath } = useMemo(() => {
    return computePanelGeometry(layout.corners, layout.width, layout.height, 24);
  }, [layout]);

  // Color schemes
  const isCream = layout.theme === 'cream';
  const isInk = layout.theme === 'ink';
  const isCobalt = layout.theme === 'cobalt';

  const strokeColor = isCream ? '#111110' : isInk ? '#111110' : '#1738FF';
  const fillColor = isCream ? '#FAF4E9' : isInk ? '#111110' : '#1738FF';
  const textColor = isCream ? '#111110' : '#FFFDF5';
  const metaColor = isCream ? '#111110' : isInk ? '#8FAAFF' : '#E0E7FF';

  return (
    <div
      className={`service-panel-bounding-box panel-${layout.id} group relative outline-none`}
      style={
        isDesktop
          ? {
            position: 'absolute',
            left: `${(layout.left / 1672) * 100}%`,
            top: `${(layout.top / 875) * 100}%`,
            width: `${(layout.width / 1672) * 100}%`,
            height: `${(layout.height / 875) * 100}%`,
            zIndex: layout.id === 'strategy' ? 10 : layout.id === 'uiux' ? 12 : 8,
          }
          : {
            position: 'relative',
            width: '100%',
            aspectRatio: `${layout.width} / ${layout.height}`,
          }
      }
    >
      {/* Layer 1: SVG Defs for ObjectBoundingBox Clip Path */}
      <svg
        className="absolute pointer-events-none w-0 h-0 overflow-hidden"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d={normalizedPath} />
          </clipPath>
        </defs>
      </svg>

      {/* Accessible Interactive Anchor Wrapper */}
      <a
        href={`/services/${layout.slug}`}
        onClick={(e) => {
          if (onClick) {
            e.preventDefault();
            onClick();
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        aria-label={`${layout.number} ${layout.title.join(' ')} service details`}
        className="service-panel-hitbox block w-full h-full relative cursor-pointer select-none rounded-[22px] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#1738FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF4E9]"
      >
        {/* Layer 2: Clipped Artwork Surface (Background, Textures, Photos) */}
        <div
          className="service-panel-surface absolute inset-0 transition-transform duration-300 ease-out pointer-events-none"
          style={{
            clipPath: `url(#${clipId})`,
            backgroundColor: fillColor,
          }}
        >
          {/* Subtle noise/halftone grain for tactile editorial print look */}
          <div
            className="panel-grain-overlay absolute inset-0 opacity-[0.045] pointer-events-none mix-blend-multiply"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, #000 1px, transparent 1px)`,
              backgroundSize: '4px 4px',
            }}
          />

          {/* Individual Artwork Assets & Graphic Embellishments */}
          {layout.id === 'strategy' && (
            <div className="strategy-art-wrapper absolute inset-0 overflow-hidden pointer-events-none">
              {/* Three ink energy marks radiating from target */}
              <svg className="absolute right-[36%] top-[14%] w-8 h-8 text-[#111110] overflow-visible pointer-events-none" viewBox="0 0 30 30" fill="none" aria-hidden="true">
                <line x1="20" y1="20" x2="28" y2="8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                <line x1="15" y1="20" x2="15" y2="6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                <line x1="10" y1="20" x2="2" y2="8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
              <img
                src="/images/services/strategy-target.webp"
                alt=""
                aria-hidden="true"
                className="absolute right-[2%] bottom-[-1%] w-[48%] h-auto max-h-[96%] object-contain object-bottom-right transition-transform duration-500 ease-out"
                style={{
                  transform: isHovered
                    ? 'translate3d(3px, -2px, 0) scale(1.02)'
                    : 'translate3d(0, 0, 0)',
                }}
              />
            </div>
          )}

          {layout.id === 'web' && (
            <div className="web-art-wrapper absolute inset-0 overflow-hidden pointer-events-none">
              <img
                src="/images/services/web-laptop.webp"
                alt=""
                aria-hidden="true"
                className="absolute right-[-2%] bottom-[-2%] w-[60%] h-auto max-h-[96%] object-contain object-bottom-right transition-transform duration-500 ease-out"
                style={{
                  transform: isHovered
                    ? 'translate3d(3px, -3px, 0) rotate(0.8deg)'
                    : 'translate3d(0, 0, 0)',
                }}
              />
            </div>
          )}

          {layout.id === 'uiux' && (
            <div className="uiux-art-wrapper absolute inset-0 overflow-hidden pointer-events-none">
              {/* Halftone dot pattern on right edge of cobalt banner */}
              <div
                className="absolute right-0 top-0 w-1/3 h-full opacity-25 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(circle at 50% 50%, #FAF4E9 1.5px, transparent 1.5px)`,
                  backgroundSize: '8px 8px',
                }}
              />
              <img
                src="/images/services/ux-tablet.webp"
                alt=""
                aria-hidden="true"
                className="absolute right-[1%] bottom-0 w-[40%] h-auto max-h-[98%] object-contain object-bottom-right transition-transform duration-500 ease-out"
                style={{
                  transform: isHovered
                    ? 'translate3d(4px, -3px, 0) rotate(-0.5deg)'
                    : 'translate3d(0, 0, 0)',
                }}
              />
            </div>
          )}

          {layout.id === 'social' && (
            <div className="social-art-wrapper absolute inset-0 overflow-hidden pointer-events-none">
              <img
                src="/images/services/social-campaign.webp"
                alt=""
                aria-hidden="true"
                className="absolute right-[0%] bottom-[0%] w-[54%] h-auto max-h-[92%] object-contain object-bottom-right transition-transform duration-500 ease-out"
                style={{
                  transform: isHovered
                    ? 'translate3d(2px, -3px, 0) rotate(0.8deg)'
                    : 'translate3d(0, 0, 0)',
                }}
              />
            </div>
          )}

          {layout.id === 'mobile' && (
            <div className="mobile-art-wrapper absolute inset-0 overflow-hidden pointer-events-none">
              <img
                src="/images/services/mobile-phone.webp"
                alt=""
                aria-hidden="true"
                className="absolute right-[1%] bottom-[-2%] w-[40%] h-auto max-h-[105%] object-contain object-bottom-right transition-transform duration-500 ease-out"
                style={{
                  transform: isHovered
                    ? 'translate3d(3px, -2px, 0) rotate(1deg)'
                    : 'translate3d(0, 0, 0)',
                }}
              />
            </div>
          )}

          {layout.id === 'software' && (
            <div className="software-art-wrapper absolute inset-0 overflow-hidden pointer-events-none">
              <img
                src="/images/services/software-laptop.webp"
                alt=""
                aria-hidden="true"
                className="absolute right-[1%] bottom-[0%] w-[46%] h-auto max-h-[85%] object-contain object-bottom-right transition-transform duration-500 ease-out"
                style={{
                  transform: isHovered
                    ? 'translate3d(3px, -2px, 0) rotate(-0.8deg)'
                    : 'translate3d(0, 0, 0)',
                }}
              />
            </div>
          )}
        </div>

        {/* Decorative Vector Outline Layer (Smooth non-scaling-stroke vector) */}
        <svg
          className="service-panel-border absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
          viewBox="0 0 1 1"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d={normalizedPath}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
          />
        </svg>

        {/* Layer 3: Live Accessible Content Layer */}
        <div
          className={`service-panel-content relative z-20 w-full h-full pointer-events-none ${layout.id === 'uiux'
            ? 'px-[5.5%] pt-[4.2%] pb-[3.5%]'
            : layout.id === 'strategy'
              ? 'px-[11%] pt-[11%] pb-[8%]'
              : layout.id === 'social'
                ? 'px-[11%] pt-[10%] pb-[8%]'
                : layout.id === 'software'
                  ? 'px-[9%] pt-[9%] pb-[8%]'
                  : 'px-[8%] pt-[8%] pb-[8%]'
            } flex flex-col justify-between`}
          style={{ color: textColor }}
        >
          {/* Eyebrow Label & Specific Card Vector Accents */}
          <div>
            <div className="flex items-center justify-between">
              <span
                className="panel-eyebrow font-mono text-[clamp(11px,0.92cqi,15px)] font-medium tracking-[0.16em] uppercase block mb-1"
                style={{ color: metaColor }}
              >
                {layout.number} / {layout.category}
              </span>

              {/* Card 02 Blue Code Accent */}
              {layout.id === 'web' && (
                <div
                  className="font-mono text-xl sm:text-2xl font-black text-[#1738FF] tracking-tight mr-[45%]"
                  aria-hidden="true"
                >
                  <span>&lt;/&gt;</span>
                </div>
              )}

              {/* Card 05 White Spark Rays */}
              {layout.id === 'mobile' && (
                <div className="flex flex-col gap-1 items-end mr-[44%]" aria-hidden="true">
                  <svg className="w-6 h-6 text-[#FFFDF5] overflow-visible" viewBox="0 0 30 30" fill="none">
                    <line x1="15" y1="2" x2="15" y2="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="6" y1="6" x2="12" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="24" y1="6" x2="18" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
              )}

              {/* Card 06 Cobalt Gears Accent */}
              {layout.id === 'software' && (
                <div className="flex items-center gap-1.5 mr-[6%]" aria-hidden="true">
                  <svg
                    className="w-9 h-9 text-[#1738FF] overflow-visible"
                    viewBox="0 0 44 44"
                    fill="currentColor"
                  >
                    <circle cx="16" cy="16" r="10" fill="none" stroke="#1738FF" strokeWidth="3" />
                    <circle cx="16" cy="16" r="4" fill="#1738FF" />
                    <path d="M16 2 L16 6 M16 26 L16 30 M2 16 L6 16 M26 16 L30 16 M6 6 L9 9 M23 23 L26 26 M6 26 L9 23 M23 9 L26 6" stroke="#1738FF" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="32" cy="30" r="7" fill="none" stroke="#1738FF" strokeWidth="2.5" />
                    <circle cx="32" cy="30" r="2.5" fill="#1738FF" />
                    <path d="M32 21 L32 24 M32 36 L32 39 M23 30 L26 30 M38 30 L41 30" stroke="#1738FF" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
              )}
            </div>

            {/* Service Title */}
            <h3
              className={`panel-title font-display font-black uppercase italic leading-[0.88] tracking-[-0.035em] mt-0.5 ${layout.id === 'uiux'
                ? 'text-[clamp(32px,5.4cqi,92px)] flex items-center gap-4'
                : layout.id === 'strategy' || layout.id === 'web'
                  ? 'text-[clamp(22px,3.6cqi,58px)] max-w-[50%]'
                  : layout.id === 'mobile'
                    ? 'text-[clamp(14px,1.9cqi,30px)] max-w-[50%]'
                    : layout.id === 'software'
                      ? 'text-[clamp(15px,2.05cqi,32px)] max-w-[50%]'
                      : 'text-[clamp(19px,2.8cqi,44px)] max-w-[46%]'
                }`}
            >
              {layout.id === 'uiux' ? (
                <div className="relative inline-flex items-center gap-3">
                  <span>UI/UX&nbsp;</span>
                  <span className="relative inline-block px-1">
                    <span>DESIGN</span>
                    {/* Imperfect hand-drawn ivory oval around DESIGN */}
                    <svg
                      className="absolute -inset-x-5 -inset-y-2.5 w-[calc(100%+40px)] h-[calc(100%+20px)] pointer-events-none overflow-visible"
                      viewBox="0 0 190 70"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M10 36 C8 14, 50 6, 100 6 C155 6, 185 16, 180 38 C175 58, 130 65, 85 63 C40 61, 12 54, 10 36"
                        stroke="#FFFDF5"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  </span>

                  {/* Dotted Type Selection Box with [T] + Cursor right beside title */}
                  <div className="hidden lg:flex items-center gap-2 ml-4" aria-hidden="true">
                    <div className="w-8 h-8 border-2 border-dashed border-white/90 bg-white/10 flex items-center justify-center font-mono text-sm font-bold text-white relative">
                      <span>T</span>
                      <div className="absolute -top-1 -left-1 w-2 h-2 bg-white" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-white" />
                      <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white" />
                      <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white" />
                    </div>
                    <svg
                      className="w-5 h-5 text-white filter drop-shadow-md"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M4 2 L18 12 L11 14 L14 21 L11 22 L8 15 L3 19 Z" />
                    </svg>
                  </div>
                </div>
              ) : (
                layout.title.map((line, idx) => (
                  <span key={idx} className="block whitespace-nowrap">
                    {line}
                  </span>
                ))
              )}
            </h3>

            {/* Card 01 Cobalt Underline Scribble */}
            {layout.id === 'strategy' && (
              <svg
                className="mt-1.5 w-24 h-3.5 text-[#1738FF] overflow-visible"
                viewBox="0 0 100 12"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 6 Q30 1, 60 7 T98 4"
                  stroke="#1738FF"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>

          {/* Lower Zone: Circular Arrow Link Indicator */}
          <div className={`panel-footer-zone ${layout.id === 'strategy' ? 'mt-auto mb-[15%]' : 'mt-auto'}`}>
            <div
              className={`panel-arrow-button w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 ease-out ${isCream ? 'bg-[#111110] text-[#FFFDF5]' : 'border-2 border-[#FFFDF5] text-[#FFFDF5] bg-transparent'
                }`}
              style={{
                transform: isHovered ? 'scale(1.08) translate3d(3px, 0, 0)' : 'scale(1)',
              }}
              aria-hidden="true"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-current"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </div>
        </div>
      </a>
    </div>
  );
};
