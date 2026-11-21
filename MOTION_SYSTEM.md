# Motion System

- **Hero Art Direction:**
  - Pristine, high-contrast moonlit barrel wave compositing (`hero-wave-v2.png` & `hero-wave-foreground.png`) with Framer Motion staggered character reveal on "IMPACT" and smooth serif slide on "in motion."
  - Halo luminescence and atmospheric foam drift without distracting video overlays or buttons.
- **3D Zoom Parallax Video Plane (`oceans.mp4`):**
  - The center plane of the 7-layer Zoom Parallax showcases an active, high-definition rolling wave in fluid motion that scales dynamically from 1x to 4x as the camera dives into the section across `300vh`.
- **Finale Atmosphere Video:**
  - Slow-motion oceanic foam surge behind "LET'S MAKE waves." layered with dark sapphire and charcoal radial gradients.
- **Framer Motion Architecture:**
  - **Section Animations (`AnimatedSection`):** Viewport-driven entrances (`fade-up`, `slide-up`, `scale`, `fade`) with cubic-bezier easing (`[0.22, 1, 0.36, 1]` / `[0.16, 1, 0.3, 1]`), configurable delays, thresholds, and full `prefers-reduced-motion` compliance.
  - **Text Animations (`AnimatedWords`, `AnimatedLines`, `AnimatedCharacters`, `Reveal`):** High-craft editorial typography animations:
    - **Letter/Character Stagger (`AnimatedCharacters`):** Hero headline "IMPACT" splits characters with staggered masked rise and subtle scaling.
    - **Line Mask Reveals (`AnimatedLines`):** Section headlines (Manifesto lines, Studio lines, Method, Trust, Finale, and Chapter headers) animate each line rising from an `overflow: hidden` mask with cubic-bezier deceleration.
    - **Word-by-Word Reveals (`AnimatedWords`):** Titles, italic accents, subtitles, and editorial quotes stagger word-by-word with high-craft masked rise.
    - **Content Reveals (`Reveal`):** Staggered card, button, and metadata entrance reveals.
- **Testimonial Slider System (`TestimonialSlider`):**
  - Directional vertical and horizontal slide transitions in the Trust section powered by Framer Motion and styled with shadcn tokens.
- **Reduced Motion:** Fully integrated with Framer Motion's `useReducedMotion()`, ensuring zero motion or disorientation for users requesting reduced motion.
