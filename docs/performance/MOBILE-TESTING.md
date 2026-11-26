# Mobile Testing & Real-Device Verification Guide

## 1. Automated Emulation Coverage (Verified)
- **Mobile Emulation:** Playwright Chromium `390×844`, `deviceScaleFactor: 3`, `isMobile: true`, `hasTouch: true`, `4x` CDP CPU throttling against production `vite preview`.
- **Desktop Emulation:** `1440×900`, `deviceScaleFactor: 1`.
- **Viewports Tested Previously:** `1920`, `1440`, `1024`, `768`, `390`, `360` with `0` horizontal overflow and `0` console/page errors.

## 2. Collecting Physical Device Traces (Required for Hardware GPU Validation)
Browser emulation uses SwiftShader/ANGLE software WebGL and cannot measure real mobile GPU thermal throttling or iOS Safari Metal compositing. To validate on physical hardware:

1. **Android Chrome (USB Remote Debugging):**
   - Enable USB Debugging, open `chrome://inspect` on desktop, and forward `http://<local-ip>:4174/?debugPerformance=1`.
   - Record a Performance trace in DevTools while scrolling Hero → Manifesto → Services → Work → Testimonials → Contact → Footer, then dragging the globe and project deck.
2. **iOS Safari (Web Inspector):**
   - Connect iPhone via USB, enable **Settings → Safari → Advanced → Web Inspector**, open `http://<local-ip>:4174/?debugPerformance=1`, and inspect Timelines + Graphics in macOS Safari Develop menu.
