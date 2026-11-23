import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowLeft, ArrowRight, Quote, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ClientProof {
  id: number;
  name: string;
  role: string;
  company: string;
  quote: string;
  verifiedTag: string;
}

const CLIENT_TESTIMONIALS: ClientProof[] = [
  {
    id: 1,
    name: 'Yeshashwini Kadiri',
    role: 'Principal Architect',
    company: 'Y&M ARCHIPLANNERS',
    quote: 'Their dedication has truly impressed me and I will continue to use Inspiring Wave as my choice.',
    verifiedTag: 'CLIENT COLLABORATION // VERIFIED ARCHITECTURAL SYSTEM',
  },
  {
    id: 2,
    name: 'Aruna V',
    role: 'Director',
    company: 'SIRGRACE TECHNOLOGIES',
    quote: 'The way the team handled the issues and executed the work is impressive.',
    verifiedTag: 'ENGINEERING & DEPLOYMENT // VERIFIED PLATFORM',
  },
  {
    id: 3,
    name: 'Sandeep Koneri',
    role: 'Director',
    company: 'CREATIVE EYE',
    quote: 'They made a clean, smart and effective website and work closely with us on digital marketing.',
    verifiedTag: 'WEB PLATFORM & STRATEGY // VERIFIED GROWTH',
  },
  {
    id: 4,
    name: 'Ratna Kalluri',
    role: 'Founder',
    company: 'RAD STUDIO',
    quote: 'A strong team who deliver services with utmost dedication.',
    verifiedTag: 'CREATIVE BRANDING // VERIFIED IDENTITY',
  },
  {
    id: 5,
    name: 'Aruna V',
    role: 'Managing Partner',
    company: 'JAGANNATHA PACKAGING',
    quote: 'From the design to the menus and features, they have done an excellent job.',
    verifiedTag: 'DIGITAL CATALOG // VERIFIED DESIGN SYSTEM',
  },
];

export function TrustSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const activeItem = CLIENT_TESTIMONIALS[activeIdx];
  const sectionRef = useRef<HTMLElement>(null);

  // 3D Scroll Reveal Physics (Awwwards-style architectural platen rise)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'start 25%'],
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 24,
    restDelta: 0.001,
  });

  const platenRotateX = useTransform(smooth, [0, 1], [18, 0]);
  const platenY = useTransform(smooth, [0, 1], [70, 0]);
  const platenZ = useTransform(smooth, [0, 1], [-80, 0]);
  const platenScale = useTransform(smooth, [0, 1], [0.93, 1]);
  const platenOpacity = useTransform(smooth, [0, 0.35, 1], [0.35, 0.85, 1]);

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % CLIENT_TESTIMONIALS.length);
  };

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + CLIENT_TESTIMONIALS.length) % CLIENT_TESTIMONIALS.length);
  };

  return (
    <section
      ref={sectionRef}
      id="trust"
      className="trust-redesign relative bg-[#f7f5ef] text-[#080c12] pt-24 pb-24 sm:pt-32 sm:pb-32 md:pt-40 md:pb-40 px-6 sm:px-10 md:px-14 overflow-hidden border-t border-[#1945f5]/15 scroll-mt-20 [perspective:1400px] [perspective-origin:50%_35%]"
      aria-label="Client Trust and Testimonials"
    >
      {/* Background grain and watermarks */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(#080c12 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }}
      />

      <div className="max-w-[1380px] mx-auto [transform-style:preserve-3d]">
        {/* Section Header */}
        <div className="mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#080c12] text-[#f1efe7] px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] mb-6">
            <ShieldCheck className="w-3.5 h-3.5 text-[#d8f03c]" />
            <span>08 // TRUST — VERIFIED PARTNERSHIPS</span>
          </div>

          <h2 className="m-0 font-display font-black uppercase text-5xl sm:text-7xl md:text-8xl lg:text-[5.75rem] leading-[0.88] tracking-[-0.04em] text-[#080c12]">
            GREAT WORK
            <br />
            <em className="font-serif italic font-normal lowercase text-[#1945f5] text-5xl sm:text-7xl md:text-8xl tracking-[-0.02em] block mt-1">
              begins with trust.
            </em>
          </h2>
        </div>

        {/* Client Logotype / Name Filter Bar */}
        <div className="border-y border-[#080c12]/15 py-4 mb-12 sm:mb-16 overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-between gap-3 min-w-max">
            {CLIENT_TESTIMONIALS.map((client, idx) => {
              const isSelected = idx === activeIdx;
              return (
                <button
                  key={client.company}
                  onClick={() => setActiveIdx(idx)}
                  className={`px-5 py-2.5 rounded-full font-mono text-xs uppercase tracking-[0.18em] transition-all duration-300 flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[#1945f5] text-white shadow-md font-bold'
                      : 'bg-white/60 hover:bg-white text-[#080c12]/70 hover:text-[#080c12] border border-[#080c12]/10'
                  }`}
                  aria-pressed={isSelected}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#d8f03c]' : 'bg-[#080c12]/30'}`} />
                  <span>{client.company}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Central Testimonial 3D Architectural Platen Card */}
        <motion.div
          style={{
            rotateX: platenRotateX,
            y: platenY,
            z: platenZ,
            scale: platenScale,
            opacity: platenOpacity,
            transformStyle: 'preserve-3d',
          }}
          className="relative bg-white rounded-3xl p-8 sm:p-14 md:p-16 border border-[#080c12]/10 shadow-[0_28px_70px_rgba(8,12,18,0.12)]"
        >
          {/* Giant background quotation mark floating on higher Z-plane */}
          <div
            aria-hidden="true"
            className="absolute top-6 right-8 sm:top-10 sm:right-14 font-serif text-[120px] sm:text-[180px] leading-none text-[#1945f5]/10 select-none pointer-events-none"
            style={{ transform: 'translateZ(50px)' }}
          >
            “
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeItem.id}
              initial={{ opacity: 0, rotateY: 8, z: -25, y: 14 }}
              animate={{ opacity: 1, rotateY: 0, z: 0, y: 0 }}
              exit={{ opacity: 0, rotateY: -8, z: -25, y: -10 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformStyle: 'preserve-3d' }}
              className="relative z-10"
            >
              <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#1945f5] mb-6">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{activeItem.verifiedTag}</span>
              </div>

              {/* Verified Quote in Instrument Serif */}
              <blockquote className="m-0 font-serif italic text-2xl sm:text-4xl md:text-5xl text-[#080c12] leading-[1.2] max-w-4xl tracking-[-0.01em]">
                "{activeItem.quote}"
              </blockquote>

              {/* Attribution */}
              <div className="mt-10 sm:mt-14 pt-8 border-t border-[#080c12]/10 flex flex-wrap items-end justify-between gap-6">
                <div>
                  <div className="font-display font-black text-2xl sm:text-3xl uppercase tracking-[-0.02em] text-[#080c12]">
                    {activeItem.name}
                  </div>
                  <div className="font-mono text-xs uppercase tracking-[0.16em] text-[#080c12]/60 mt-1">
                    {activeItem.role} · <strong className="text-[#1945f5]">{activeItem.company}</strong>
                  </div>
                </div>

                {/* Slider Controls */}
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs text-[#080c12]/50 tracking-[0.2em]">
                    0{activeIdx + 1} / 0{CLIENT_TESTIMONIALS.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrev}
                      className="w-11 h-11 rounded-full border border-[#080c12]/20 hover:border-[#1945f5] bg-white hover:bg-[#1945f5] hover:text-white flex items-center justify-center transition-all duration-200"
                      aria-label="Previous testimonial"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="w-11 h-11 rounded-full border border-[#080c12]/20 hover:border-[#1945f5] bg-white hover:bg-[#1945f5] hover:text-white flex items-center justify-center transition-all duration-200"
                      aria-label="Next testimonial"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
