import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { layoutFor, win, type Layout } from './motion'
import { PaperTearCurtain } from './PaperTearCurtain'
import { ManifestoRevealCard } from './ManifestoRevealCard'
import './creative-machine.css'

const CreativeMachineCanvas = lazy(() => import('./CreativeMachineCanvas').then(module => ({ default: module.CreativeMachineCanvas })))

gsap.registerPlugin(ScrollTrigger, useGSAP)

function CreativeMachineFallback() {
  return (
    <div className="cm-fallback" aria-hidden="true">
      <div className="cm-fallback-card">
        <img src="/assets/hero/machine-poster.webp" alt="" />
      </div>
    </div>
  )
}

export function CreativeMachineHero() {
  const heroRef = useRef<HTMLElement>(null)
  const canvasWrapRef = useRef<HTMLDivElement>(null)
  const kickerRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLDivElement>(null)
  const copyRef = useRef<HTMLParagraphElement>(null)
  const ctasRef = useRef<HTMLDivElement>(null)
  const noteRef = useRef<HTMLDivElement>(null)
  const curtainStageRef = useRef<HTMLDivElement>(null)
  const topFlapRef = useRef<HTMLDivElement>(null)
  const bottomFlapRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const progressRef = useRef(0)
  const [layout, setLayout] = useState<Layout>(() =>
    typeof window !== 'undefined' ? layoutFor(window.innerWidth) : 'desktop',
  )
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  )
  const [webglFailed, setWebglFailed] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  // Responsive layout + reduced motion listeners
  useEffect(() => {
    const onResize = () => setLayout(layoutFor(window.innerWidth))
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMotion = () => setReducedMotion(mq.matches)
    window.addEventListener('resize', onResize, { passive: true })
    mq.addEventListener('change', onMotion)
    return () => {
      window.removeEventListener('resize', onResize)
      mq.removeEventListener('change', onMotion)
    }
  }, [])

  // Pause 3D render loop when hero is scrolled completely offscreen
  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // ScrollTrigger master timeline (single deterministic progress 0 -> 1)
  useGSAP(
    () => {
      const el = heroRef.current
      if (!el || reducedMotion || webglFailed) {
        progressRef.current = 0
        return
      }

      const distanceMultiplier =
        layout === 'desktop' ? 3.8 : layout === 'tablet' ? 2.8 : 2.0

      const applyDomProgress = (p: number) => {
        el.style.setProperty('--tear-opacity', String(1 - win(p, 0.2, 0.4)))

        // Stage 02 (20-45%): supporting copy, CTAs, kicker, and studio note exit
        const metaFade = 1 - win(p, 0.2, 0.36)
        if (kickerRef.current) {
          kickerRef.current.style.opacity = String(metaFade)
        }
        if (noteRef.current) {
          noteRef.current.style.opacity = String(metaFade)
          noteRef.current.style.transform = `rotate(-10deg) translate3d(0, ${-16 * (1 - metaFade)}px, 0)`
        }

        const copyFade = 1 - win(p, 0.22, 0.4)
        if (copyRef.current) {
          copyRef.current.style.opacity = String(copyFade)
          copyRef.current.style.transform = `translate3d(0, ${-14 * (1 - copyFade)}px, 0)`
        }
        if (ctasRef.current) {
          ctasRef.current.inert = copyFade < 0.05
          ctasRef.current.style.opacity = String(copyFade)
          ctasRef.current.style.transform = `translate3d(0, ${-10 * (1 - copyFade)}px, 0)`
        }

        // Headline stays legible during Stage 02, then exits cleanly in Stage 03-04
        if (headlineRef.current) {
          const depthShift = win(p, 0.2, 0.45)
          const exit = win(p, 0.42, 0.62)
          const opacity = Math.max(0, 1 - exit * 1.1)
          const tx = -18 * depthShift - 64 * exit
          const sc = 1 - 0.04 * depthShift - 0.06 * exit
          headlineRef.current.style.opacity = String(opacity)
          headlineRef.current.style.transform = `translate3d(${tx.toFixed(1)}px, 0, 0) scale(${sc.toFixed(4)})`
        }

        // Stage 05 (65-92%): Paper Tear Reveal Curtain & Manifesto Reveal Card
        const cardAlpha = win(p, 0.66, 0.76) * (1 - win(p, 0.94, 0.99))
        if (cardRef.current) {
          cardRef.current.style.opacity = String(cardAlpha)
          const scale = 0.94 + 0.06 * win(p, 0.66, 0.84)
          cardRef.current.style.transform = `scale(${scale.toFixed(4)})`
          cardRef.current.style.pointerEvents = p >= 0.88 ? 'auto' : 'none'
        }

        const curtainAlpha = win(p, 0.62, 0.68) * (1 - win(p, 0.92, 0.98))
        if (curtainStageRef.current) {
          if (curtainAlpha > 0.01) {
            curtainStageRef.current.style.display = 'block'
            curtainStageRef.current.style.opacity = String(Math.min(1, curtainAlpha * 1.6))
          } else {
            curtainStageRef.current.style.display = 'none'
          }
        }

        const tearProgress = win(p, 0.68, 0.90)
        if (topFlapRef.current) {
          const ty = -108 * tearProgress
          const rot = -3.5 * tearProgress
          topFlapRef.current.style.transform = `translate3d(0, ${ty.toFixed(1)}%, 0) rotate(${rot.toFixed(2)}deg)`
        }
        if (bottomFlapRef.current) {
          const ty = 108 * tearProgress
          const rot = 2.8 * tearProgress
          bottomFlapRef.current.style.transform = `translate3d(0, ${ty.toFixed(1)}%, 0) rotate(${rot.toFixed(2)}deg)`
        }

        // Canvas fades out smoothly as the paper tear opens
        if (canvasWrapRef.current) {
          const fadeOut = win(p, 0.76, 0.92)
          canvasWrapRef.current.style.opacity = String(1 - fadeOut)
        }

        el.classList.toggle('cm-hero--inactive', p >= 0.92)
      }

      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: () => `+=${Math.round(window.innerHeight * distanceMultiplier)}`,
        pin: true,
        pinSpacing: true,
        scrub: 0.9,
        invalidateOnRefresh: true,
        onToggle: self => el.classList.toggle("cm-pinned", self.isActive),
        onUpdate: (self) => {
          progressRef.current = self.progress
          applyDomProgress(self.progress)
        },
        onRefresh: (self) => {
          progressRef.current = self.progress
          applyDomProgress(self.progress)
        },
      })

      return () => {
        st.kill()
        if (ctasRef.current) ctasRef.current.inert = false
        for (const node of [
          kickerRef,
          noteRef,
          copyRef,
          ctasRef,
          headlineRef,
          canvasWrapRef,
          cardRef,
          curtainStageRef,
          topFlapRef,
          bottomFlapRef,
        ]) node.current?.removeAttribute('style')
        el.style.removeProperty('--tear-opacity')
        el.classList.remove('cm-hero--inactive', 'cm-pinned')
      }
    },
    { scope: heroRef, revertOnUpdate: true, dependencies: [layout, reducedMotion, webglFailed] },
  )

  const handleContextLost = useCallback(() => {
    setWebglFailed(true)
  }, [])

  return (
    <section
      ref={heroRef}
      className={`creative-machine-hero cm-hero${webglFailed ? " cm-static" : ""}`}
      aria-labelledby="hero-title"
    >
      <div ref={canvasWrapRef} className="cm-canvas-wrap">
        {webglFailed || reducedMotion ? (
          <CreativeMachineFallback />
        ) : (
          <Suspense fallback={<CreativeMachineFallback />}><CreativeMachineCanvas
            progressRef={progressRef}
            layout={layout}
            reducedMotion={reducedMotion}
            isVisible={isVisible}
            onContextLost={handleContextLost}
          /></Suspense>
        )}
      </div>

      <div className="cm-ui">
        <div className="cm-content">
          <div ref={kickerRef} className="cm-kicker">
            <span>01 / INTRO</span>
            <i aria-hidden="true" />
          </div>

          <div ref={headlineRef} className="cm-headline-wrap">
            <svg
              className="cm-headline-orbit"
              viewBox="0 0 600 220"
              fill="none"
              aria-hidden="true"
            >
              <ellipse
                cx="290"
                cy="110"
                rx="275"
                ry="82"
                transform="rotate(-8 290 110)"
                stroke="#dfff00"
                strokeWidth="2.5"
                strokeDasharray="420 120"
              />
            </svg>
            <h1 id="hero-title" className="cm-title">
              <span className="cm-title-top">INSPIRING</span>
              <span className="cm-title-wave">WAVE</span>
            </h1>
          </div>

          <p ref={copyRef} className="cm-copy">
            Strategy, design &amp; technology
            <br />
            for a world in motion.
          </p>

          <div ref={ctasRef} className="cm-ctas">
            <Link to="/contact" className="cm-cta-primary">
              <span>START A PROJECT</span>
              <span aria-hidden="true">↗</span>
            </Link>
            <Link to="/work" className="cm-cta-secondary">
              <span>OUR WORK</span>
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>

        <div ref={noteRef} className="cm-studio-note" aria-hidden="true">
          A CREATIVE
          <br />
          DIGITAL
          <br />
          STUDIO
        </div>
      </div>

      {/* Stage 05 Authentic Manifesto Reveal Card */}
      <ManifestoRevealCard cardRef={cardRef} />

      {/* Stage 05 Jagged Paper Tear Curtains */}
      <PaperTearCurtain
        stageRef={curtainStageRef}
        topFlapRef={topFlapRef}
        bottomFlapRef={bottomFlapRef}
      />
    </section>
  )
}
