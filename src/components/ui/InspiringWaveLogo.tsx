import React from 'react';

export function InspiringWaveLogo({
  className = 'h-6 sm:h-7 w-auto',
  color = 'currentColor',
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 568 103"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Inspiring Wave"
    >
      <image
        href="/assets/inspiring-wave-logo.png"
        width="668"
        height="203"
        preserveAspectRatio="xMidYMid meet"
      />
    </svg>
  );
}

export default InspiringWaveLogo;
