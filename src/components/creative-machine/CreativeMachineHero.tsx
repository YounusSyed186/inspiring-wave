import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { CreativeMachineCanvas } from './CreativeMachineCanvas'
import { layoutFor, win, type Layout } from './motion'
import './creative-machine.css'

gsap.registerPlugin(ScrollTrigger, useGSAP)

function CreativeMachineFallback() {
  return (
    <div className="cm-fallback" aria-hidden="true">
      <div className="cm-fallback-card">
        <img src="/assets/architecture.webp" alt="" />
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
  const cueRef = useRef<HTMLButtonElement>(null)

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
      if (!el || reducedMotion) {
        progressRef.current = 0
        return
      }

      const distanceMultiplier =
        layout === 'desktop' ? 3.8 : layout === 'tablet' ? 2.8 : 2.0

      const applyDomProgress = (p: number) => {
        // Stage 01 (0-20%): scroll cue fades out
        if (cueRef.current) {
          const cueAlpha = 1 - win(p, 0.04, 0.18)
          cueRef.current.style.opacity = String(cueAlpha)
          cueRef.current.style.transform = `translate3d(0, ${(1 - cueAlpha) * 14}px, 0)`
          cueRef.current.style.pointerEvents = cueAlpha > 0.1 ? 'auto' : 'none'
        }

        // Stage 02 (20-45%): supporting copy, CTAs, kicker, and studio note exit
        const metaFade = 1 - win(p, 0.2, 0.36)
        if (kickerRef.current) {
          kickerRef.current.style.opacity = String(metaFade)
        }
        if (noteRef.current) {
          noteRef.current.style.opacity = String(metaFade)
          noteRef.current.style.transform = `rotate(3.2deg) translate3d(0, ${-16 * (1 - metaFade)}px, 0)`
        }

        const copyFade = 1 - win(p, 0.22, 0.4)
        if (copyRef.current) {
          copyRef.current.style.opacity = String(copyFade)
          copyRef.current.style.transform = `translate3d(0, ${-14 * (1 - copyFade)}px, 0)`
        }
        if (ctasRef.current) {
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

        // Stage 05-06 (75-100%): canvas fades out cleanly onto the real #manifesto underneath
        if (canvasWrapRef.current) {
          const fadeOut = win(p, 0.85, 0.985)
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
      }
    },
    { scope: heroRef, dependencies: [layout, reducedMotion] },
  )

  const handleDiscoverClick = useCallback(() => {
    const step = Math.round(window.innerHeight * 0.95)
    window.scrollBy({ top: step, behavior: reducedMotion ? 'auto' : 'smooth' })
  }, [reducedMotion])

  const handleContextLost = useCallback(() => {
    setWebglFailed(true)
  }, [])

  return (
    <section
      ref={heroRef}
      className="creative-machine-hero cm-hero"
      aria-labelledby="hero-title"
    >
      <div ref={canvasWrapRef} className="cm-canvas-wrap">
        {webglFailed ? (
          <CreativeMachineFallback />
        ) : (
          <CreativeMachineCanvas
            progressRef={progressRef}
            layout={layout}
            reducedMotion={reducedMotion}
            isVisible={isVisible}
            onContextLost={handleContextLost}
          />
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

        <button
          ref={cueRef}
          type="button"
          className="cm-scroll-cue"
          onClick={handleDiscoverClick}
          aria-label="Scroll to discover the Creative Machine"
        >
          <span className="cm-scroll-ring">
            <span className="cm-scroll-dot" aria-hidden="true">
              ↓
            </span>
          </span>
          <span className="cm-scroll-label">SCROLL TO DISCOVER</span>
        </button>
      </div>
    </section>
  )
}
