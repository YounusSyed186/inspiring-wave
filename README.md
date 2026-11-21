# Inspiring Wave — Impact in Motion

An immersive editorial rebuild of the Inspiring Wave website. The implementation uses React, TypeScript and Vite with a cinematic image-composited hero, route-aware portfolio/service architecture, responsive editorial layouts, accessible navigation and a validated enquiry handoff.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Production

```bash
npm run typecheck
npm run build
npm run preview
```

The deployable static output is written to `dist/`. `public/_redirects` provides SPA route fallback on compatible static hosts.

## Contact delivery

There was no existing repository or approved email service configuration. The form validates input and prepares a real addressed email in the visitor's email client. It does not show a fake success message or silently discard submissions. Replace this handoff with a server endpoint only after an approved delivery service and credentials are available.

## Content integrity

- Company services, phone, email, city, testimonials and article references were verified from the live Inspiring Wave website.
- Work imagery is explicitly labeled “Concept Study” and does not claim fictional client relationships.
- The studio image is explicitly labeled conceptual/non-identifying.

See [IMPLEMENTATION_REPORT.md](IMPLEMENTATION_REPORT.md), [ASSET_MANIFEST.md](ASSET_MANIFEST.md), and [QA_REPORT.md](QA_REPORT.md) for the complete handoff.
