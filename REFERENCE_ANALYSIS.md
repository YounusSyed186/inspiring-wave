# AUGE Maison AUGE scroll analysis

Reference inspected at `https://auge-xp.com/works/maison-auge` in headless Edge at 1440 × 900. Cookie consent was dismissed and the page was allowed to finish its entrance transition before testing.

## Observed visual behavior

- Native-looking vertical content movement is softened by inertia. A wheel gesture continues moving the page after input ends, with a long but controlled deceleration.
- The characteristic wave is a single vertical bow applied across the rendered media surface. Displacement is zero at the left and right viewport edges and strongest near the horizontal center.
- The curve affects imagery and decorative media rendered in a fixed WebGL canvas. DOM headings, paragraphs, navigation, links, and footer controls remain sharp and retain stable hit areas.
- There is no idle water texture, noise field, autonomous ripple, chromatic split, or continuous oscillation.

## Scroll response and timing

- Slow 120 px wheel input produced a measured peak `uCurve` near 9.6 px and returned below 1 px after about 0.87 s.
- Moderate 500 px input produced a peak near 40.1 px and returned below 1 px after about 1.22 s.
- Fast 1400 px input saturated near 59.8 px and continued decaying beyond the 1.4 s observation window.
- A -900 px reverse gesture produced a signed peak near -58.1 px. The curve passed through zero and reversed without a visual snap.
- Repeated short gestures restarted the response cleanly and peaked around 9–11 px each time.
- Measured scrolling continued after the wheel event. A 650 px gesture settled at roughly 650 px of travel over about 0.8 s, confirming controlled inertia rather than direct one-frame input mapping.

## Technical evidence

- The page uses one fixed 1440 × 900 WebGL2 canvas with a transparent DOM image fallback. GSAP signatures are present in the loaded application chunks.
- Captured shader source shows a two-pass renderer. Media planes are composed into a framebuffer, followed by a screen-space fragment pass.
- The post-process computes `across = sin(PI * screenX / resolutionX)`, applies edge fades, raises the profile to `uCurvePower`, and offsets the source sample vertically by signed `uCurve`.
- Captured runtime uniforms used `uCurvePower = 1`, `uCurveEdge = 90`, `uCurveX = 0`, and a velocity-dependent signed `uCurve` that saturated near 60 px.
- The same shader contains pointer and pulse fields, but their strength and amplitude were zero during scroll tests. They do not produce the observed scroll wave.

## Most likely implementation approach

Use the existing Lenis controller for inertia, calculate frame-time-correct signed velocity in one shared motion engine, render selected DOM media into a single fixed WebGL2 canvas, and apply an AUGE-style framebuffer bow pass. Keep interactive DOM text and controls outside WebGL. Use a lighter amplitude on mobile and retain native touch momentum.

## Unverified items

- Physical trackpad input was not available. Playwright wheel gestures were used at slow, moderate, fast, reverse, and repeated-short-input levels.
- Safari and physical iOS Safari were unavailable in the local environment.
- The original JavaScript motion equations were not recovered. Shader source and live uniform values were captured directly, while the scroll-physics response is inferred from measured frame behavior.

## JJettas stacked-section inspection

The live `https://jjettas.com/` homepage was inspected in Edge at 1440 x 900 and at a 390 x 844 mobile viewport on 2026-11-21.

- Desktop uses long relative scroll tracks with viewport-sized sticky panes (`top: 0`) and separately fixed background/tone layers. Later experiences occupy higher stacking layers while the current pane remains visually anchored.
- The strongest transitions are structural bottom-up covers, not one-time reveal animations. Reversing scroll directly reverses the cover because geometry is tied to scroll position.
- Foreground imagery and fixed background fields move independently inside several pinned sequences. Outgoing scenes receive restrained tone/depth changes rather than large skew or rotation.
- Long narrative passages are not forced into a single viewport. Their outer tracks retain substantial document height while only the cinematic pane remains sticky.
- Mobile reduces the number of pinned systems substantially: the inspected page retained one primary 100svh sticky presentation pane and otherwise used a much shorter, more natural document flow.

Local evidence is stored in `qa/jjettas-inspection.json`, `qa/jjettas-*.png`, and `qa/jjettas-mobile.png`.
