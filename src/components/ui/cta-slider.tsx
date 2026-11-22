"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, Sparkles, Compass, Cpu, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function scissorCutClip(seed: number, amp = 4): string {
  const r = mulberry32(seed * 9973 + 23);
  const j = () => Math.round(r() * amp * 10) / 10;
  const pts = [
    [j(), j()],
    [32 + r() * 34, j() * 0.5],
    [100 - j(), j()],
    [100 - j() * 0.5, 38 + r() * 24],
    [100 - j(), 100 - j()],
    [32 + r() * 34, 100 - j() * 0.5],
    [j(), 100 - j()],
    [j() * 0.5, 38 + r() * 24],
  ];
  return `polygon(${pts
    .map((p) => `${Math.round(p[0] * 10) / 10}% ${Math.round(p[1] * 10) / 10}%`)
    .join(", ")})`;
}

export type CtaTrack = {
  id: string | number;
  number: string;
  lead: string;
  accent: string;
  title: string;
  subtitle: string;
  timeline: string;
  quote: string;
  description: string;
  deliverables: string[];
  imageSrc: string;
  stamp: string;
  actionLabel: string;
  actionLink: string;
  accentColor: string;
};

export const defaultCtaTracks: CtaTrack[] = [
  {
    id: "track-1",
    number: "01",
    lead: "BRAND SYSTEMS &",
    accent: "Direction in Motion.",
    title: "Brand Systems & Direction in Motion",
    subtitle: "HIGH-IMPACT DIGITAL IDENTITY",
    timeline: "4 - 6 WEEKS",
    quote:
      "Crafting unified digital identities with bespoke motion choreography, kinetic typography, and undeniable atmospheric presence.",
    description:
      "For visionary teams ready to set the benchmark. We align strategy, design systems, and interaction physics to create a lasting brand signature.",
    deliverables: [
      "Brand Choreography",
      "Design Systems & Tokens",
      "Interactive Prototypes",
      "Editorial Art Direction",
    ],
    imageSrc: "/assets/dimensions/dim-03-kinetic.jpg",
    stamp: "IDENTITY // 01",
    actionLabel: "INITIATE BRAND DIRECTION",
    actionLink: "/contact",
    accentColor: "#d8f03c",
  },
  {
    id: "track-2",
    number: "02",
    lead: "HIGH-PERFORMANCE",
    accent: "Web Platforms.",
    title: "High-Performance Web Platforms",
    subtitle: "SUB-SECOND FLUID EXPERIENCES",
    timeline: "6 - 8 WEEKS",
    quote:
      "Engineered for sub-second speed, fluid scroll mechanics, and frictionless conversion with zero performance compromise.",
    description:
      "Built on ultra-modern frontends with React, Vite, and Framer Motion physics—delivering cinematic immersion, 60fps responsiveness, and accessible semantic markup.",
    deliverables: [
      "React / Vite / Next.js",
      "Framer Motion Physics",
      "Accessible Semantic Core",
      "Sub-second LCP & SEO 100",
    ],
    imageSrc: "/assets/dimensions/dim-02-spatial.jpg",
    stamp: "FLAGSHIP // 02",
    actionLabel: "BUILD FLAGSHIP PLATFORM",
    actionLink: "/contact",
    accentColor: "#1945f5",
  },
  {
    id: "track-3",
    number: "03",
    lead: "CREATIVE TECH &",
    accent: "Spatial Visuals.",
    title: "Creative Technology & Spatial Visuals",
    subtitle: "EXPERIMENTAL IMMERSION",
    timeline: "8 - 12 WEEKS",
    quote:
      "From generative wave simulations to interactive spatial visualizers, turning visionary ideas into tangible digital realities.",
    description:
      "Pushing digital boundaries with WebGL shaders, 3D product visualizers, and intelligent AI interface interactions that command attention.",
    deliverables: [
      "Generative Shaders & Canvas",
      "3D Spatial Experiences",
      "AI Interface Integration",
      "Micro-Interactions Lab",
    ],
    imageSrc: "/assets/dimensions/dim-01-core.jpg",
    stamp: "SPATIAL LAB // 03",
    actionLabel: "EXPLORE THE LAB",
    actionLink: "/contact",
    accentColor: "#ff4f5e",
  },
];

export interface CtaSliderProps {
  tracks?: CtaTrack[];
  className?: string;
  onSelectTrack?: (track: CtaTrack) => void;
}

export const CtaSlider = ({
  tracks = defaultCtaTracks,
  className,
  onSelectTrack,
}: CtaSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");

  const activeTrack = tracks[currentIndex];
  const accentCutout = useMemo(() => scissorCutClip(currentIndex + 9, 4), [currentIndex]);

  const handleNext = () => {
    setDirection("right");
    setCurrentIndex((prev) => (prev + 1) % tracks.length);
  };

  const handlePrev = () => {
    setDirection("left");
    setCurrentIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
  };

  const handleSelectTrack = (index: number) => {
    setDirection(index > currentIndex ? "right" : "left");
    setCurrentIndex(index);
    if (onSelectTrack) onSelectTrack(tracks[index]);
  };

  const visualVariants = {
    enter: (dir: "left" | "right") => ({
      y: dir === "right" ? 36 : -36,
      opacity: 0,
      scale: 0.95,
      rotate: dir === "right" ? 2 : -2,
    }),
    center: {
      y: 0,
      opacity: 1,
      scale: 1,
      rotate: -1,
    },
    exit: (dir: "left" | "right") => ({
      y: dir === "right" ? -36 : 36,
      opacity: 0,
      scale: 0.95,
      rotate: dir === "right" ? -2 : 2,
    }),
  };

  const textVariants = {
    enter: (dir: "left" | "right") => ({
      x: dir === "right" ? 36 : -36,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: "left" | "right") => ({
      x: dir === "right" ? -36 : 36,
      opacity: 0,
    }),
  };

  const TRACK_ICONS = [Compass, Cpu, Layers];

  return (
    <div
      className={cn(
        "cta-slider-card relative w-full overflow-hidden rounded-3xl border-2 border-white/15 bg-[#07090d] text-[#f1efe7] p-6 sm:p-10 md:p-12 shadow-[0_35px_90px_rgba(0,0,0,0.85)]",
        className
      )}
    >
      {/* Blueprint Vector Grid Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(86,118,255,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(86,118,255,0.22) 1px, transparent 1px)",
          backgroundSize: "52px 52px",
        }}
      />

      {/* Ambient Track Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-36 -left-36 w-96 h-96 rounded-full blur-[140px] opacity-25 transition-colors duration-700"
        style={{ backgroundColor: activeTrack.accentColor }}
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        {/* === Left Column: Tactile Track Selector Dossiers === */}
        <div className="lg:col-span-3 flex flex-col justify-between space-y-6 order-2 lg:order-1">
          <div>
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
              <span className="font-mono text-xs tracking-[0.18em] text-[#d8f03c] uppercase font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> ENGAGEMENT TRACKS
              </span>
              <span className="font-mono text-xs text-white/50 tracking-wider">
                {String(currentIndex + 1).padStart(2, "0")} / {String(tracks.length).padStart(2, "0")}
              </span>
            </div>

            {/* Vertical Track Selector List */}
            <div className="flex flex-col space-y-3.5">
              {tracks.map((track, idx) => {
                const isActive = idx === currentIndex;
                const Icon = TRACK_ICONS[idx % TRACK_ICONS.length];
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => handleSelectTrack(idx)}
                    className={cn(
                      "group text-left p-4 rounded-2xl border-2 transition-all duration-300 flex items-start gap-3.5 relative overflow-hidden cursor-pointer",
                      isActive
                        ? "border-[#d8f03c] bg-[#f1efe7] text-[#080a0b] shadow-[0_16px_36px_rgba(0,0,0,0.65)] -rotate-1"
                        : "border-white/10 bg-white/[0.03] text-[#f1efe7] hover:border-white/25 hover:bg-white/[0.06]"
                    )}
                  >
                    <span
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold flex-shrink-0 mt-0.5",
                        isActive
                          ? "bg-[#080a0b] text-[#d8f03c]"
                          : "bg-white/[0.06] text-white/60 group-hover:text-white"
                      )}
                    >
                      {track.number}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "font-display text-lg font-black tracking-tight uppercase truncate leading-none m-0",
                          isActive ? "text-[#080a0b]" : "text-white/80 group-hover:text-white"
                        )}
                      >
                        {track.lead}
                      </p>
                      <p
                        className={cn(
                          "font-serif italic text-base normal-case truncate leading-tight mt-0.5 m-0",
                          isActive ? "text-[#1945f5]" : "text-white/50 group-hover:text-white/75"
                        )}
                      >
                        {track.accent}
                      </p>
                      <span
                        className={cn(
                          "text-[10px] font-mono tracking-widest block mt-2 uppercase font-bold",
                          isActive ? "text-[#080a0b]/60" : "text-white/35"
                        )}
                      >
                        <Icon className="w-3 h-3 inline mr-1 -mt-0.5" />
                        {track.timeline}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Direct agency location line */}
          <div className="pt-4 border-t border-white/10 hidden lg:block">
            <span className="text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase block">
              STUDIO BASE // DISPATCH
            </span>
            <p className="text-xs text-white/75 mt-1 font-mono tracking-wide m-0">
              Hyderabad, India • Global Delivery
            </p>
          </div>
        </div>

        {/* === Center Column: Tactile Studio Proof Frame (Instant High-Res Imagery, Zero Video Blackout) === */}
        <div className="lg:col-span-5 relative order-1 lg:order-2 py-2">
          <div className="relative aspect-[4/4] sm:aspect-[4/4] lg:aspect-[5/5] w-full max-h-[500px] mx-auto">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={visualVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
                className="relative w-full h-full rounded-2xl bg-[#f1efe7] text-[#080a0b] p-3.5 pb-5 shadow-[0_30px_70px_rgba(0,0,0,0.85)] border-2 border-[#f1efe7] flex flex-col"
              >
                {/* Masking Tape Strip at Top Center */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 z-30 w-28 h-5 bg-[#d8f03c]/90 rotate-2 shadow-sm"
                />

                {/* Proof Header Bar */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#080a0b]/15 font-mono text-[10px] tracking-[0.18em] uppercase text-[#080a0b]/70">
                  <span className="font-bold text-[#080a0b]">
                    INSPIRING WAVE // TRACK {activeTrack.number}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#080a0b] text-[#d8f03c] font-bold">
                    {activeTrack.timeline}
                  </span>
                </div>

                {/* High-Resolution Artwork Canvas */}
                <div className="relative flex-1 w-full overflow-hidden rounded-xl bg-[#080c12]">
                  <img
                    src={activeTrack.imageSrc}
                    alt={activeTrack.title}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080c12]/80 via-transparent to-black/20 pointer-events-none" />

                  {/* Scissor-Cut Stamp inside Artwork */}
                  <span
                    className="absolute top-3 left-3 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-[#080a0b] shadow-md"
                    style={{
                      backgroundColor:
                        activeTrack.accentColor === "#1945f5" ? "#d8f03c" : activeTrack.accentColor,
                      clipPath: accentCutout,
                    }}
                  >
                    {activeTrack.stamp}
                  </span>

                  {/* Bottom Live Status Pill */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-2 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
                      <span className="w-2 h-2 rounded-full bg-[#d8f03c] animate-pulse" />
                      <span className="font-mono text-[10px] tracking-wider text-[#f1efe7] uppercase">
                        ENGAGEMENT READY // 2026
                      </span>
                    </div>
                  </div>
                </div>

                {/* Proof Footer Caption */}
                <div className="mt-3 flex items-baseline justify-between px-1 text-left">
                  <span className="font-display text-2xl font-black uppercase tracking-tight text-[#080a0b] leading-none">
                    {activeTrack.lead} {activeTrack.accent}
                  </span>
                  <span className="font-mono text-xs font-bold text-[#1945f5]">
                    +{activeTrack.number}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* === Right Column: Mixed-Media Pitch, Scissor-Cut Deliverables & Call-to-Action === */}
        <div className="lg:col-span-4 flex flex-col justify-between h-full order-3 lg:order-3 space-y-6">
          <div className="relative overflow-hidden min-h-[330px]">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={textVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-4 text-left"
              >
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#d8f03c]" />
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#d8f03c] font-bold">
                      {activeTrack.subtitle}
                    </span>
                  </div>

                  {/* Signature Headline: Barlow Condensed Lead + Scissor-Cut Instrument Serif Italic Accent */}
                  <div role="heading" aria-level={3} className="mt-2 space-y-1.5">
                    <span className="block font-display text-4xl sm:text-5xl lg:text-[3.35rem] font-black uppercase tracking-tight text-[#f1efe7] leading-[0.88]">
                      {activeTrack.lead}
                    </span>
                    <span
                      className="inline-block -rotate-1 px-4 py-1 bg-[#f1efe7] text-[#1945f5] font-serif italic font-normal normal-case text-3xl sm:text-4xl lg:text-[2.75rem] tracking-tight leading-[1.02] shadow-md"
                      style={{ clipPath: accentCutout }}
                    >
                      {activeTrack.accent}
                    </span>
                  </div>
                </div>

                {/* Editorial Vision Quote */}
                <blockquote className="my-3 font-serif italic text-lg sm:text-xl text-[#f1efe7]/90 leading-snug pl-4 border-l-2 border-[#d8f03c] bg-white/[0.03] py-1.5 rounded-r-lg m-0">
                  "{activeTrack.quote}"
                </blockquote>

                {/* Contextual description */}
                <p className="font-sans text-[#f1efe7]/70 text-xs sm:text-sm leading-relaxed m-0">
                  {activeTrack.description}
                </p>

                {/* Scope Deliverables Scissor-Cut Tags */}
                <div className="pt-2">
                  <span className="text-[10px] font-mono tracking-[0.2em] text-white/45 uppercase block mb-2.5 font-bold">
                    SCOPE DELIVERABLES // INCLUDED
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeTrack.deliverables.map((item, idx) => (
                      <span
                        key={item}
                        className="px-3 py-1 bg-[#f1efe7] text-[#080a0b] font-mono text-[11px] font-bold tracking-wide shadow-sm"
                        style={{
                          clipPath: scissorCutClip(currentIndex * 7 + idx + 3, 3.5),
                        }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Action Row & Navigation */}
          <div className="pt-4 border-t border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link to={activeTrack.actionLink} className="flex-1">
                <Button className="w-full bg-[#1945f5] hover:bg-[#2349cd] text-[#f1efe7] border-2 border-[#f1efe7] font-mono text-xs tracking-[0.15em] uppercase h-12 px-6 rounded-full flex items-center justify-between group shadow-[0_12px_32px_rgba(25,69,245,0.45)] transition-all duration-300 cursor-pointer">
                  <span className="font-bold">{activeTrack.actionLabel}</span>
                  <span className="grid place-items-center w-6 h-6 rounded-full bg-[#d8f03c] text-[#080a0b]">
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </Button>
              </Link>

              {/* Prev / Next Buttons */}
              <div className="flex items-center justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="rounded-full w-12 h-12 border-white/25 bg-white/[0.04] text-[#f1efe7] hover:bg-[#d8f03c] hover:text-[#080a0b] hover:border-[#d8f03c] cursor-pointer transition-colors"
                  onClick={handlePrev}
                  aria-label="Previous track"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="rounded-full w-12 h-12 border-white/25 bg-white/[0.04] text-[#f1efe7] hover:bg-[#d8f03c] hover:text-[#080a0b] hover:border-[#d8f03c] cursor-pointer transition-colors"
                  onClick={handleNext}
                  aria-label="Next track"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Direct inquiry shortcut */}
            <div className="flex items-center justify-between text-[11px] font-mono text-white/50 pt-1">
              <a
                href="mailto:info@inspiringwave.in"
                className="hover:text-[#d8f03c] transition-colors underline-offset-4 hover:underline tracking-wider"
              >
                info@inspiringwave.in
              </a>
              <a
                href="tel:+917893801806"
                className="hover:text-[#d8f03c] transition-colors tracking-wider"
              >
                +91 78938 01806
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
