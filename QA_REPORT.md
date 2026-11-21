# QA Report

## Automated checks

- `npm run typecheck` — passes as part of the production build.
- `npm run build` — passes; output generated in `dist/`.
- `node scripts/qa.mjs` — passes interaction and runtime checks in Microsoft Edge/Chromium.
- Runtime console/page errors — **0**.
- Dependency audit — **0 vulnerabilities**.

## Browser checks

Validated at 1440×1000 and 390×844:

- Preloader timeout and transition.
- Hero typography/media layering.
- All major section entry states.
- Full-screen menu open and Escape close.
- `/services/web-development` direct route and heading.
- Mobile expandable service behavior.
- Contact invalid-state messaging.

Screenshots are in `qa/screenshots/`, including hero desktop/mobile, manifesto, services desktop/mobile, menu, finale and contact.

## Performance snapshot

- Complete `dist/` output: **869,430 bytes** across 10 files.
- Application JS: 281.55 KB raw / 89.02 KB gzip.
- CSS: 25.72 KB raw / 6.61 KB gzip.
- All production raster assets: ~560 KB combined.
- Fonts load from Google Fonts and remain the only production third-party visual request.

No laboratory LCP/INP claim is made; those require testing on the final production host and network profile.

## Accessibility

- Semantic headings and landmarks, skip link, visible focus behavior, labels, validation alert and keyboard-operable controls.
- Menu supports Escape and restores scrolling.
- Motion is simplified through `prefers-reduced-motion`.
- Content remains DOM text; imagery is decorative or has meaningful alternatives.

Recommended final deployment check: run Lighthouse and a keyboard/screen-reader pass on the production URL after hosting, caching and the final domain are configured.
