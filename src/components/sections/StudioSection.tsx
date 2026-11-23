import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowUpRight, Compass, Sparkles, MapPin, Users } from 'lucide-react';

export function StudioSection() {
  const sectionRef = useRef<HTMLElement>(null);

  // 3D Scroll Reveal Physics (Awwwards-style tactile studio board reveal)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'start 25%'],
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 24,
    restDelta: 0.001,
  });

  const textRotateX = useTransform(smooth, [0, 1], [16, 0]);
  const textTranslateY = useTransform(smooth, [0, 1], [50, 0]);
  const textOpacity = useTransform(smooth, [0, 0.4, 1], [0.35, 0.85, 1]);

  const cardRotateY = useTransform(smooth, [0, 1], [-16, 1.2]);
  const cardRotateX = useTransform(smooth, [0, 1], [14, 0]);
  const cardScale = useTransform(smooth, [0, 1], [0.91, 1]);
  const cardZ = useTransform(smooth, [0, 1], [-70, 20]);
  const cardTranslateY = useTransform(smooth, [0, 1], [60, 0]);

  return (
    <section
      ref={sectionRef}
      id="studio"
      className="studio-redesign relative bg-[#f1efe7] text-[#080c12] pt-24 pb-24 sm:pt-32 sm:pb-32 md:pt-40 md:pb-40 px-6 sm:px-10 md:px-14 overflow-hidden border-t border-[#1945f5]/15 scroll-mt-20 [perspective:1400px] [perspective-origin:50%_30%]"
      aria-label="Behind the Wave Studio"
    >
      {/* Subtle tactile paper texture & background grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(#080c12 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Decorative top-left coordinate stamp */}
      <div className="max-w-[1380px] mx-auto mb-10 md:mb-14 flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#080c12] text-[#f1efe7] px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em]">
          <span className="w-2 h-2 rounded-full bg-[#1945f5] animate-pulse" />
          <span>06 // STUDIO — BEHIND THE WAVE</span>
        </div>

        <div className="font-mono text-xs uppercase tracking-[0.16em] text-[#080c12]/60 flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-[#1945f5]" />
          <span>HYDERABAD, INDIA · 17.3850° N, 78.4867° E</span>
        </div>
      </div>

      <div className="max-w-[1380px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start [transform-style:preserve-3d]">
        {/* Left Column: Massive Editorial Typographic Anchor with 3D extrusion */}
        <motion.div
          style={{
            rotateX: textRotateX,
            y: textTranslateY,
            opacity: textOpacity,
            transformStyle: 'preserve-3d',
          }}
          className="lg:col-span-7 flex flex-col justify-between"
        >
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.22em] text-[#1945f5] font-semibold mb-3 block">
              COLLABORATIVE PHILOSOPHY
            </span>

            <h2 className="m-0 font-display font-black uppercase text-5xl sm:text-7xl md:text-8xl lg:text-[5.75rem] leading-[0.88] tracking-[-0.04em] text-[#080c12]">
              GOOD PEOPLE.
              <br />
              <span className="text-[#080c12]">BIG IDEAS.</span>
              <br />
              <em className="font-serif italic font-normal lowercase text-[#1945f5] text-5xl sm:text-7xl md:text-8xl tracking-[-0.02em] block mt-1">
                No ordinary work.
              </em>
            </h2>

            <div className="mt-8 md:mt-12 max-w-xl">
              <p className="font-sans text-lg sm:text-xl text-[#080c12]/80 leading-relaxed font-normal">
                We listen before we create. Then we combine creative thinking with engineering rigor and data to turn ambitious ideas into useful, memorable digital experiences.
              </p>
            </div>
          </div>

          {/* 3 Core Studio Tenets */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-[#080c12]/15">
            <div>
              <span className="font-mono text-xs uppercase text-[#1945f5] font-bold block mb-1">01 / LISTEN FIRST</span>
              <p className="font-sans text-sm text-[#080c12]/75 leading-snug">
                Deep inquiry into your business model and audience before drawing a pixel.
              </p>
            </div>
            <div>
              <span className="font-mono text-xs uppercase text-[#1945f5] font-bold block mb-1">02 / MOVE TOGETHER</span>
              <p className="font-sans text-sm text-[#080c12]/75 leading-snug">
                Strategy, brand design, and engineering collaborating in real-time sprints.
              </p>
            </div>
            <div>
              <span className="font-mono text-xs uppercase text-[#1945f5] font-bold block mb-1">03 / REAL IMPACT</span>
              <p className="font-sans text-sm text-[#080c12]/75 leading-snug">
                Expressive motion backed by sub-second performance and lasting clarity.
              </p>
            </div>
          </div>

          {/* CTA Link to About Page */}
          <div className="mt-10">
            <Link
              to="/about"
              className="inline-flex items-center gap-3 font-mono text-xs sm:text-sm uppercase tracking-[0.16em] bg-[#1945f5] hover:bg-[#080c12] text-[#f1efe7] px-7 py-3.5 rounded-full transition-all duration-300 shadow-md group"
            >
              <span>EXPLORE THE STUDIO ARCHIVE</span>
              <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </motion.div>

        {/* Right Column: Tactile Worktable Collage & Workshop Badge with 3D Spatial Tilt */}
        <motion.div
          style={{
            rotateY: cardRotateY,
            rotateX: cardRotateX,
            scale: cardScale,
            z: cardZ,
            y: cardTranslateY,
            transformStyle: 'preserve-3d',
          }}
          className="lg:col-span-5 relative"
        >
          <div className="relative p-3 bg-white rounded-2xl shadow-[0_24px_60px_rgba(8,12,18,0.16)] border border-[#080c12]/10 transition-transform hover:scale-[1.01] duration-500">
            {/* Scissor-cut corner pins */}
            <div className="absolute -top-2.5 -left-2.5 w-5 h-5 rounded-full bg-[#1945f5] border-2 border-white shadow-sm z-20 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d8f03c]" />
            </div>
            <div className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-[#1945f5] border-2 border-white shadow-sm z-20 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d8f03c]" />
            </div>

            {/* Collage Image */}
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#080c12]">
              <img
                src="/assets/studio/studio-collaboration.webp"
                alt="Inspiring Wave studio team reviewing typography, wireframes, and design blueprints"
                className="w-full h-full object-cover object-center filter contrast-[1.05]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* Lower caption overlay */}
              <div className="absolute bottom-3 left-3 right-3 text-white z-10 flex items-end justify-between">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#d8f03c] block">
                    LIVE WORKSHOP SESSIONS
                  </span>
                  <span className="font-sans text-xs font-medium text-white/90">
                    Hand-drawn systems & bespoke digital craft
                  </span>
                </div>
                <span className="font-mono text-[10px] bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-white/70">
                  HYD STUDIO
                </span>
              </div>
            </div>

            {/* Floating Paper Sticker with elevated Z-axis */}
            <div
              className="mt-4 p-4 rounded-xl bg-[#f7f5ef] border border-[#080c12]/10 flex items-center justify-between gap-4 shadow-sm"
              style={{ transform: 'translateZ(25px)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1945f5]/10 text-[#1945f5] flex items-center justify-center font-display font-black text-xl">
                  IW
                </div>
                <div>
                  <div className="font-mono text-xs uppercase font-bold text-[#080c12]">
                    INDEPENDENT MINDS
                  </div>
                  <div className="font-sans text-xs text-[#080c12]/70">
                    Moving together to build work with real momentum.
                  </div>
                </div>
              </div>
              <Sparkles className="w-5 h-5 text-[#1945f5] shrink-0" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
