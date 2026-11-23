import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowUpRight, Sparkles, Compass, Cpu, Layers, Mail, Phone, MapPin } from 'lucide-react';

interface EngagementTrack {
  number: string;
  badge: string;
  title: string;
  duration: string;
  description: string;
  deliverables: string[];
  ctaLabel: string;
  accent: string;
}

const ENGAGEMENT_TRACKS: EngagementTrack[] = [
  {
    number: '01',
    badge: 'TRACK 01 // DIRECTION & IDENTITY',
    title: 'Brand Systems & Direction in Motion',
    duration: '4 – 6 WEEKS',
    description:
      'For visionary teams ready to set the benchmark. We align positioning strategy, bespoke kinetic design systems, and responsive interaction physics to build a memorable brand signature.',
    deliverables: ['Brand Choreography', 'Design Systems & Tokens', 'Interactive Prototypes', 'Editorial Art Direction'],
    ctaLabel: 'INITIATE BRAND DIRECTION',
    accent: '#d8f03c',
  },
  {
    number: '02',
    badge: 'TRACK 02 // SPEED & ARCHITECTURE',
    title: 'High-Performance Web Platforms',
    duration: '6 – 8 WEEKS',
    description:
      'Engineered for sub-second speed, fluid scroll mechanics, and zero conversion friction. Built on modern React & Vite stacks with 60fps animations and accessible semantic markup.',
    deliverables: ['Modern React / Next.js Core', 'Framer Motion Physics', 'Accessible Semantic Core', 'Sub-second LCP & SEO 100'],
    ctaLabel: 'COMMISSION PLATFORM',
    accent: '#1945f5',
  },
  {
    number: '03',
    badge: 'TRACK 03 // FULL SPECTRUM INNOVATION',
    title: 'Creative Tech & Spatial Visuals',
    duration: '8 – 12 WEEKS',
    description:
      'Bespoke visual computing, WebGL shaders, and high-touch interactive storytelling engineered to launch category-defining campaigns and products.',
    deliverables: ['Custom WebGL & Three.js', 'Procedural Motion Pipelines', 'Campaign Storyboards', 'Multi-Platform Systems'],
    ctaLabel: 'EXPLORE SPATIAL SYSTEMS',
    accent: '#5676ff',
  },
];

export function FinaleSection() {
  const [activeTrack, setActiveTrack] = useState(0);
  const track = ENGAGEMENT_TRACKS[activeTrack];
  const sectionRef = useRef<HTMLElement>(null);

  // 3D Scroll Reveal Physics (Awwwards-style spatial portal fan-out)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'start 25%'],
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 24,
    restDelta: 0.001,
  });

  const headerRotateX = useTransform(smooth, [0, 1], [16, 0]);
  const headerY = useTransform(smooth, [0, 1], [50, 0]);
  const headerOpacity = useTransform(smooth, [0, 0.35, 1], [0.35, 0.85, 1]);

  const leftColRotateY = useTransform(smooth, [0, 1], [12, 0]);
  const leftColRotateX = useTransform(smooth, [0, 1], [10, 0]);
  const leftColZ = useTransform(smooth, [0, 1], [-45, 0]);
  const leftColY = useTransform(smooth, [0, 1], [65, 0]);

  const rightColRotateY = useTransform(smooth, [0, 1], [-12, 0]);
  const rightColRotateX = useTransform(smooth, [0, 1], [10, 0]);
  const rightColZ = useTransform(smooth, [0, 1], [-45, 20]);
  const rightColScale = useTransform(smooth, [0, 1], [0.93, 1]);
  const rightColY = useTransform(smooth, [0, 1], [65, 0]);

  return (
    <section
      ref={sectionRef}
      id="contact-cta"
      className="finale-redesign relative bg-[#030506] text-[#f1efe7] pt-28 pb-28 sm:pt-36 sm:pb-36 md:pt-40 md:pb-40 px-6 sm:px-10 md:px-14 overflow-hidden border-t border-white/10 scroll-mt-20 [perspective:1400px] [perspective-origin:50%_30%]"
      aria-label="Initiate Collaboration"
    >
      {/* Dynamic ambient radial glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: `radial-gradient(ellipse at 50% 20%, rgba(25,69,245,0.25), transparent 60%), radial-gradient(circle at 85% 80%, rgba(216,240,60,0.12), transparent 50%)`,
        }}
      />

      <div className="max-w-[1380px] mx-auto relative z-10 [transform-style:preserve-3d]">
        {/* Section Tagline */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-3.5 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-[#d8f03c] mb-8">
          <Sparkles className="w-3.5 h-3.5" />
          <span>10 // MAKE WAVES — INITIATE COLLABORATION</span>
        </div>

        {/* Headline with 3D Spatial Tilt */}
        <motion.div
          style={{
            rotateX: headerRotateX,
            y: headerY,
            opacity: headerOpacity,
            transformStyle: 'preserve-3d',
          }}
          className="mb-12 md:mb-16"
        >
          <h2 className="m-0 font-display font-black uppercase text-5xl sm:text-7xl md:text-8xl lg:text-[6rem] leading-[0.88] tracking-[-0.04em] text-[#f1efe7]">
            LET'S MAKE
            <br />
            <em className="font-serif italic font-normal lowercase text-[#1945f5] text-5xl sm:text-7xl md:text-8xl tracking-[-0.02em] block mt-1">
              waves{"\u00A0"}together.
            </em>
          </h2>

          <p className="mt-6 font-sans text-base sm:text-xl text-[#f1efe7]/80 leading-relaxed max-w-2xl">
            Select an engagement track below. Every transformational digital presence begins with a focused, honest conversation.
          </p>
        </motion.div>

        {/* Engagement Tracks Interactive Deck with 3D Winged Fan */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch [transform-style:preserve-3d]">
          {/* Left Wing: Track Selection Buttons */}
          <motion.div
            style={{
              rotateY: leftColRotateY,
              rotateX: leftColRotateX,
              z: leftColZ,
              y: leftColY,
              transformStyle: 'preserve-3d',
            }}
            className="lg:col-span-5 flex flex-col gap-3"
          >
            {ENGAGEMENT_TRACKS.map((t, idx) => {
              const isActive = idx === activeTrack;
              return (
                <button
                  key={t.number}
                  onClick={() => setActiveTrack(idx)}
                  className={`text-left p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${
                    isActive
                      ? 'bg-[#11161d] border-[#1945f5] shadow-lg'
                      : 'bg-white/[0.03] border-white/10 hover:border-white/30 hover:bg-white/[0.06]'
                  }`}
                  aria-pressed={isActive}
                >
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#d8f03c]">
                      {t.number} // {t.duration}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full transition-transform ${
                        isActive ? 'bg-[#1945f5] scale-125' : 'bg-white/30'
                      }`}
                    />
                  </div>
                  <div className="font-display font-bold text-xl sm:text-2xl uppercase tracking-[-0.02em] text-[#f1efe7] group-hover:text-white">
                    {t.title}
                  </div>
                </button>
              );
            })}

            {/* Quick Contact Info Strip */}
            <div className="mt-4 p-6 rounded-2xl bg-[#080c12] border border-white/10 flex flex-col gap-3 font-mono text-xs">
              <a
                href="mailto:info@inspiringwave.in"
                className="flex items-center gap-3 text-white/80 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4 text-[#1945f5]" />
                <span>info@inspiringwave.in</span>
              </a>
              <a
                href="tel:+917893801806"
                className="flex items-center gap-3 text-white/80 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4 text-[#d8f03c]" />
                <span>+91 78938 01806</span>
              </a>
              <div className="flex items-center gap-3 text-white/50">
                <MapPin className="w-4 h-4 text-white/40" />
                <span>HYDERABAD, INDIA · GLOBAL DELIVERY</span>
              </div>
            </div>
          </motion.div>

          {/* Right Wing: Active Track Detail Card with 3D Spatial Presence */}
          <motion.div
            style={{
              rotateY: rightColRotateY,
              rotateX: rightColRotateX,
              z: rightColZ,
              scale: rightColScale,
              y: rightColY,
              transformStyle: 'preserve-3d',
            }}
            className="lg:col-span-7 bg-[#0b1017] border border-white/15 rounded-3xl p-8 sm:p-12 flex flex-col justify-between shadow-2xl relative"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={track.number}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5 mb-6">
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#d8f03c]">
                    {track.badge}
                  </span>
                  <span className="font-mono text-xs bg-white/10 text-white px-3 py-1 rounded-full">
                    TYPICAL TIMELINE: {track.duration}
                  </span>
                </div>

                <h3 className="m-0 font-display font-black text-3xl sm:text-4xl md:text-5xl uppercase tracking-[-0.03em] text-[#f1efe7] leading-[0.95]">
                  {track.title}
                </h3>

                <p className="mt-5 font-sans text-base sm:text-lg text-[#f1efe7]/80 leading-relaxed">
                  {track.description}
                </p>

                {/* Deliverables Tags */}
                <div className="mt-8">
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/50 block mb-3">
                    CORE DELIVERABLES:
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {track.deliverables.map((d) => (
                      <span
                        key={d}
                        className="font-mono text-xs uppercase tracking-[0.12em] bg-white/[0.08] text-white/90 px-3.5 py-1.5 rounded-full border border-white/10"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action CTA Button */}
                <div className="mt-10 pt-8 border-t border-white/10">
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-3 font-mono text-xs sm:text-sm uppercase tracking-[0.18em] bg-[#1945f5] hover:bg-white hover:text-[#080a0b] text-white px-8 py-4 rounded-full transition-all duration-300 font-bold shadow-lg group"
                  >
                    <span>{track.ctaLabel}</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Preloader Returning Signature Waveform across the bottom base */}
        <div className="mt-20 pt-8 border-t border-white/10 flex flex-col items-center justify-center relative">
          <svg
            className="w-full max-w-4xl h-14 overflow-visible opacity-45"
            viewBox="0 0 1000 60"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M0 30 Q125 5, 250 30 T500 30 T750 30 T1000 30"
              stroke="#1945f5"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M0 30 Q125 55, 250 30 T500 30 T750 30 T1000 30"
              stroke="#d8f03c"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeDasharray="4 6"
            />
          </svg>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 mt-2">
            INSPIRING WAVE // IMPACT IN MOTION · HYDERABAD
          </span>
        </div>
      </div>
    </section>
  );
}
