import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowUpRight, BookOpen, Clock, Calendar, Sparkles } from 'lucide-react';

export function PerspectivesSection() {
  const sectionRef = useRef<HTMLElement>(null);

  // 3D Scroll Reveal Physics (Awwwards-style gyroscopic orbital folio entrance)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'start 25%'],
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 24,
    restDelta: 0.001,
  });

  const articleRotateX = useTransform(smooth, [0, 1], [14, 0]);
  const articleRotateY = useTransform(smooth, [0, 1], [-8, 0]);
  const articleZ = useTransform(smooth, [0, 1], [-60, 15]);
  const articleY = useTransform(smooth, [0, 1], [65, 0]);
  const articleScale = useTransform(smooth, [0, 1], [0.93, 1]);
  const articleOpacity = useTransform(smooth, [0, 0.35, 1], [0.35, 0.85, 1]);

  const orbitRotateX = useTransform(smooth, [0, 1], [18, 0]);
  const orbitRotateY = useTransform(smooth, [0, 1], [10, 0]);
  const orbitZ = useTransform(smooth, [0, 1], [-50, 20]);
  const orbitY = useTransform(smooth, [0, 1], [80, 0]);
  const orbitScale = useTransform(smooth, [0, 1], [0.92, 1]);

  return (
    <section
      ref={sectionRef}
      id="journal"
      className="perspectives-redesign relative bg-[#080a0b] text-[#f1efe7] pt-24 pb-24 sm:pt-32 sm:pb-32 md:pt-40 md:pb-40 px-6 sm:px-10 md:px-14 overflow-hidden border-t border-white/10 scroll-mt-20 [perspective:1400px] [perspective-origin:50%_35%]"
      aria-label="Studio Perspectives and Editorial Insights"
    >
      {/* Blueprint grid background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(241,239,231,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(241,239,231,0.2) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="max-w-[1380px] mx-auto [transform-style:preserve-3d]">
        {/* Section Header */}
        <div className="mb-14 md:mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-3.5 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-[#d8f03c] mb-6">
            <BookOpen className="w-3.5 h-3.5" />
            <span>09 // PERSPECTIVES — THOUGHTS IN MOTION</span>
          </div>

          <h2 className="m-0 font-display font-black uppercase text-5xl sm:text-7xl md:text-8xl lg:text-[5.75rem] leading-[0.88] tracking-[-0.04em] text-[#f1efe7]">
            THOUGHTS IN
            <br />
            <em className="font-serif italic font-normal lowercase text-[#5676ff] text-5xl sm:text-7xl md:text-8xl tracking-[-0.02em] block mt-1">
              motion.
            </em>
          </h2>
        </div>

        {/* Editorial Broadsheet Layout with 3D Spatial Presence */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-stretch [transform-style:preserve-3d]">
          {/* Main Editorial Article Feature with 3D Folio Angle */}
          <motion.div
            style={{
              rotateX: articleRotateX,
              rotateY: articleRotateY,
              z: articleZ,
              y: articleY,
              scale: articleScale,
              opacity: articleOpacity,
              transformStyle: 'preserve-3d',
            }}
            className="lg:col-span-7 bg-[#11161d] border border-white/10 rounded-3xl p-8 sm:p-12 md:p-14 flex flex-col justify-between relative group hover:border-[#1945f5]/60 transition-colors duration-500 shadow-2xl"
          >
            {/* Corner bracket accents */}
            <i className="pointer-events-none absolute top-3 left-3 w-2.5 h-2.5 border-t border-l border-white/30" />
            <i className="pointer-events-none absolute top-3 right-3 w-2.5 h-2.5 border-t border-r border-white/30" />
            <i className="pointer-events-none absolute bottom-3 left-3 w-2.5 h-2.5 border-b border-l border-white/30" />
            <i className="pointer-events-none absolute bottom-3 right-3 w-2.5 h-2.5 border-b border-r border-white/30" />

            <div>
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#d8f03c] uppercase tracking-[0.2em] mb-6">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> 17.03.2026
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> 4 MIN READ
                </span>
                <span>·</span>
                <span className="bg-[#1945f5] text-white px-2 py-0.5 rounded text-[10px] font-bold">
                  ESSAY // 04
                </span>
              </div>

              <h3 className="m-0 font-display font-black text-3xl sm:text-5xl md:text-6xl uppercase tracking-[-0.03em] text-[#f1efe7] leading-[0.95] group-hover:text-[#8faaff] transition-colors duration-300">
                Transforming Ideas into Digital Success
              </h3>

              <p className="mt-6 font-sans text-base sm:text-lg text-[#f1efe7]/75 leading-relaxed max-w-xl">
                Why an online presence is only the beginning—and how strategic intentionality, emotive interaction design, and rigorous engineering turn essential ideas into compounding business impact.
              </p>
            </div>

            <div className="mt-10 pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <span className="font-mono text-xs text-white/50 tracking-[0.16em]">
                TOPICS: DIGITAL STRATEGY · PRODUCT ARCHITECTURE
              </span>
              <a
                href="https://inspiringwave.in/digital_success/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] bg-[#1945f5] hover:bg-white hover:text-[#080a0b] text-white px-5 py-2.5 rounded-full transition-all duration-300 font-semibold shadow-md"
              >
                <span>READ ESSAY</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>

          {/* Right Column: Generative Idea Momentum & Kinetic 3D Gyroscopic Orbit Graphic */}
          <motion.div
            style={{
              rotateX: orbitRotateX,
              rotateY: orbitRotateY,
              z: orbitZ,
              y: orbitY,
              scale: orbitScale,
              transformStyle: 'preserve-3d',
            }}
            className="lg:col-span-5 bg-[#1945f5] text-white rounded-3xl p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden shadow-2xl"
          >
            {/* Background Wave Rings */}
            <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center">
              <div className="w-[120%] aspect-square rounded-full border border-white" />
              <div className="absolute w-[80%] aspect-square rounded-full border border-white" />
              <div className="absolute w-[45%] aspect-square rounded-full border border-white" />
            </div>

            <div className="relative z-10">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#d8f03c] font-bold block mb-2">
                VELOCITY INDEX // CONTINUOUS SIGNAL
              </span>
              <div className="font-display font-black text-2xl uppercase tracking-[-0.02em]">
                Ideas Gaining Energy
              </div>
            </div>

            {/* Kinetic Orbital Graphic with 3D Gimbal Depth */}
            <div
              className="relative z-10 py-10 flex items-center justify-center"
              style={{ perspective: '800px' }}
            >
              <div
                className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full border border-white/30 flex items-center justify-center transition-transform duration-700"
                style={{ transform: 'rotateX(52deg) rotateY(12deg)', transformStyle: 'preserve-3d' }}
              >
                {/* Outer pulsing ring */}
                <div
                  className="absolute inset-2 rounded-full border border-white/50"
                  style={{ transform: 'translateZ(15px)' }}
                />
                {/* Center Core */}
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#f1efe7] shadow-2xl flex items-center justify-center"
                  style={{ transform: 'translateZ(30px)' }}
                >
                  <div className="w-6 h-6 rounded-full bg-[#1945f5]" />
                </div>
                {/* Orbiting Satellite Node */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div
                    className="w-4 h-4 rounded-full bg-[#d8f03c] shadow-lg absolute -top-2 left-1/2 -translate-x-1/2"
                    style={{ transform: 'translateZ(25px)' }}
                  />
                </motion.div>
                {/* Second Satellite */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-4"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div
                    className="w-3 h-3 rounded-full bg-white shadow-lg absolute top-1/2 -right-1.5 -translate-y-1/2"
                    style={{ transform: 'translateZ(20px)' }}
                  />
                </motion.div>
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-white/20">
              <p className="font-sans text-xs sm:text-sm text-white/85 leading-snug m-0">
                "Movement is the difference between a static portfolio and an experience that commands market authority."
              </p>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#d8f03c] block mt-2">
                HYDERABAD STUDIO ARCHIVE
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
