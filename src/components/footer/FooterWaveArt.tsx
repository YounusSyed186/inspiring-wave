import * as React from 'react';

/**
 * Custom layered vector illustrations printed onto the underlying cream backing sheet:
 * - Bottom-left graphic cobalt & cream wave crest + halftone stipple
 * - Bottom-right sweeping Hokusai-inspired wave curl + dark halftone stipple
 * - Hand-drawn cobalt double underline beneath INSPIRING WAVE
 * - Two restrained black bird silhouettes in the right negative space
 */
export function FooterWaveArt({ uid }: { uid: string }) {
  return (
    <div className="iwf-wave-art" aria-hidden="true">
      {/* Shared halftone stipple patterns */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <pattern id={uid + '-dots-blue'} width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="2.5" cy="2.5" r="1.35" fill="#0C183D" opacity="0.55" />
          </pattern>
          <pattern id={uid + '-dots-ink'} width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.35" fill="#091348" opacity="0.62" />
          </pattern>
        </defs>
      </svg>

      {/* Left Corner Halftone Stipple + Graphic Ocean Wave */}
      <svg
        viewBox="0 0 430 220"
        className="iwf-wave-left"
        data-iwf-wave="left"
        preserveAspectRatio="xMinYMax meet"
      >
        {/* Subtle halftone wedge rising along the left edge */}
        <path
          d="M 0 18 Q 52 55 82 132 L 0 165 Z"
          fill={`url(#${uid}-dots-blue)`}
          opacity="0.7"
        />

        {/* Cream foam outer crest */}
        <path
          d="M -12 142 C 26 92, 98 86, 132 118 C 154 139, 134 166, 114 164 C 145 144, 178 148, 194 172 C 218 164, 244 174, 256 194 C 282 192, 315 202, 344 214 L -12 214 Z"
          fill="#FFF9F0"
          stroke="#111111"
          strokeWidth="4.2"
          strokeLinejoin="round"
        />

        {/* Cobalt blue wave body */}
        <path
          d="M -12 165 C 24 126, 78 122, 102 146 C 84 152, 74 168, 84 182 C 110 164, 148 166, 168 188 C 188 182, 212 189, 224 205 L -12 214 Z"
          fill="#0C183D"
          stroke="#111111"
          strokeWidth="3.8"
          strokeLinejoin="round"
        />

        {/* Inner dark contour ribs */}
        <path
          d="M 6 186 C 36 160, 68 160, 86 178 M 112 194 C 136 180, 162 184, 178 202"
          fill="none"
          stroke="#111111"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>

      {/* Hand-drawn Cobalt Double Underline beneath INSPIRING WAVE */}
      <svg
        viewBox="0 0 540 58"
        className="iwf-wordmark-underline"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          data-iwf-blue-stroke
          d="M 14 44 C 152 6, 338 4, 444 17"
          stroke="#0C183D"
          strokeWidth="7.5"
          strokeLinecap="round"
        />
        <path
          data-iwf-blue-stroke
          d="M 188 47 C 316 20, 458 18, 520 31 C 528 33, 522 41, 508 43"
          stroke="#0C183D"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>

      {/* Two Small Restrained Black Bird Silhouettes */}
      <svg viewBox="0 0 120 48" className="iwf-birds" data-iwf-birds fill="none">
        <path
          d="M 8 34 Q 21 20 32 31 Q 44 19 57 29"
          stroke="#111111"
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 68 19 Q 79 9 88 18 Q 98 8 109 16"
          stroke="#111111"
          strokeWidth="3.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Right Corner Sweeping Graphic Ocean Wave + Halftone Curl */}
      <svg
        viewBox="0 0 540 275"
        className="iwf-wave-right"
        data-iwf-wave="right"
        preserveAspectRatio="xMaxYMax meet"
      >
        {/* Outer sweeping cream crest */}
        <path
          d="M 552 98 C 492 36, 378 36, 326 98 C 302 126, 314 156, 338 152 C 326 118, 362 94, 394 114 C 414 128, 404 174, 362 204 C 322 178, 256 184, 210 218 C 172 245, 135 262, 92 272 L 552 272 Z"
          fill="#FFF9F0"
          stroke="#111111"
          strokeWidth="4.4"
          strokeLinejoin="round"
        />

        {/* Main cobalt-blue wave body */}
        <path
          d="M 552 172 C 514 166, 486 142, 492 114 C 462 124, 444 148, 452 172 C 428 168, 416 146, 426 122 C 398 92, 356 96, 344 124 C 378 114, 398 144, 382 182 C 362 224, 304 252, 232 268 L 552 272 Z"
          fill="#0C183D"
          stroke="#111111"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* Lower inner cobalt swell */}
        <path
          d="M 168 272 C 214 218, 286 204, 338 232 C 296 254, 248 268, 168 272 Z"
          fill="#0C183D"
          stroke="#111111"
          strokeWidth="3.8"
          strokeLinejoin="round"
        />

        {/* Restrained halftone shadow stipple in lower-right swell */}
        <path
          d="M 382 272 C 418 222, 474 184, 552 182 L 552 272 Z"
          fill={`url(#${uid}-dots-ink)`}
        />

        {/* Graphic ink flow contours */}
        <path
          d="M 386 72 C 436 58, 492 70, 526 106 M 242 232 C 276 216, 308 218, 330 232 M 412 246 C 452 214, 498 202, 542 206"
          fill="none"
          stroke="#111111"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
