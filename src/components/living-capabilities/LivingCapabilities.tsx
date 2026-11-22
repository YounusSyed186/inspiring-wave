import React, { useRef, useState, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { CAPABILITY_SERVICES, getActiveServiceIndex } from './types'
import { CapabilitiesNav } from './CapabilitiesNav'
import { CapabilitiesCanvas } from './CapabilitiesCanvas'
import { CapabilitiesProgress } from './CapabilitiesProgress'
import './living-capabilities.css'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export const LivingCapabilities: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const stRef = useRef<ScrollTrigger | null>(null)

  const [progress, setProgress] = useState(0)
  const [activeIdx, setActiveIdx] = useState(0)
  const [isReduced, setIsReduced] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMotionChange = () => setIsReduced(mq.matches)
    mq.addEventListener('change', onMotionChange)
    return () => mq.removeEventListener('change', onMotionChange)
  }, [])

  // Master GSAP ScrollTrigger
  useGSAP(
    () => {
      const section = sectionRef.current
      const stage = stageRef.current
      if (!section || !stage || isReduced) return

      const isMobile = window.innerWidth < 768
      const isTablet = window.innerWidth < 1200
      const scrollMultiplier = isMobile ? 2.8 : isTablet ? 4.2 : 5.5

      const st = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => `+=${Math.round(window.innerHeight * scrollMultiplier)}`,
        pin: stage,
        pinSpacing: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress
          setProgress(p)
          const idx = getActiveServiceIndex(p)
          setActiveIdx(idx)
        },
      })

      stRef.current = st

      return () => {
        st.kill()
        stRef.current = null
      }
    },
    { scope: sectionRef, dependencies: [isReduced] },
  )

  // Direct scene navigation (clicking nav rail or timeline dot)
  const handleSelectService = useCallback(
    (pTarget: number) => {
      if (isReduced) {
        const idx = getActiveServiceIndex(pTarget)
        setActiveIdx(idx)
        setProgress(pTarget)
        return
      }

      const st = stRef.current
      if (!st) return

      const targetY = st.start + pTarget * (st.end - st.start)
      window.scrollTo({
        top: Math.round(targetY),
        behavior: 'smooth',
      })
    },
    [isReduced],
  )

  // Advance to next stage or next section
  const handleAdvance = useCallback(() => {
    if (activeIdx < CAPABILITY_SERVICES.length - 1) {
      handleSelectService(CAPABILITY_SERVICES[activeIdx + 1].pCenter)
    } else {
      const nextEl = document.getElementById('method') || document.querySelector('.method')
      if (nextEl) {
        nextEl.scrollIntoView({ behavior: 'smooth' })
      } else {
        window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })
      }
    }
  }, [activeIdx, handleSelectService])

  const activeService = CAPABILITY_SERVICES[activeIdx]

  return (
    <section
      ref={sectionRef}
      id="services"
      className="lca-section capabilities section"
      aria-label="Capabilities — What We Build"
    >
      <div ref={stageRef} className="lca-stage-pinned">
        {/* TOP ROW: Section Identifier + Oversized Headline + Statement */}
        <header className="lca-header-row">
          <div className="lca-index-marker">
            <span>04 /</span>
            <span>SERVICES</span>
          </div>

          <div className="lca-main-title-wrap">
            <h2 className="lca-main-title">
              <span className="lca-title-black">WHAT WE</span>
              <span className="lca-title-blue">BUILD</span>
            </h2>
            <div className="lca-tape-pill">
              <span>FOR A DIGITAL WORLD IN MOTION.</span>
            </div>
          </div>

          <aside className="lca-statement-box">
            <p>
              End-to-end digital capabilities that turn ideas into scalable, impactful experiences.
            </p>
          </aside>
        </header>

        {/* CENTER ROW: 6-Item Rail + Active Service Card + Living Canvas */}
        <main className="lca-center-grid">
          {/* Left: 6-Item Service Navigation Rail */}
          <CapabilitiesNav
            services={CAPABILITY_SERVICES}
            activeIdx={activeIdx}
            onSelect={handleSelectService}
          />

          {/* Center: Active Service Editorial Focus Card */}
          <article
            className="lca-active-content"
            id={`lca-panel-${activeService.num}`}
            role="tabpanel"
            aria-labelledby={`lca-tab-${activeService.num}`}
          >
            <div className="lca-service-kicker">
              <span className="lca-service-bullet" />
              <span>{activeService.num} // SERVICE</span>
            </div>

            <div className="lca-service-title-lockup">
              <h3 className="lca-service-title">{activeService.title}</h3>
              <div className="lca-lime-brush" />
            </div>

            <p className="lca-service-desc">{activeService.summary}</p>

            <Link
              to={`/services/${activeService.slug}`}
              className="lca-explore-cta"
            >
              <span>EXPLORE SERVICE</span>
              <span aria-hidden="true">↗</span>
            </Link>
          </article>

          {/* Right: The Living Graphical Canvas */}
          <CapabilitiesCanvas
            progress={progress}
            activeIdx={activeIdx}
          />
        </main>

        {/* BOTTOM ROW: Timeline Progress Bar + Scroll Explorer */}
        <CapabilitiesProgress
          services={CAPABILITY_SERVICES}
          activeIdx={activeIdx}
          progress={progress}
          onSelect={handleSelectService}
          onAdvance={handleAdvance}
        />
      </div>
    </section>
  )
}
export default LivingCapabilities
