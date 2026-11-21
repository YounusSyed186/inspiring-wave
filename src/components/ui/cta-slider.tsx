"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, Sparkles, Waves } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
  videoSrc: string;
  fallbackImage: string;
  actionLabel: string;
  actionLink: string;
  accentColor?: string;
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
    quote: "Crafting unified digital identities with bespoke motion choreography, kinetic typography, and undeniable atmospheric presence.",
    description: "For visionary teams ready to set the benchmark. We align strategy, design systems, and interaction physics to create a lasting brand signature.",
    deliverables: [
      "Brand Choreography",
      "Design Systems & Tokens",
      "Interactive Prototypes",
      "Editorial Art Direction",
    ],
    videoSrc: "/assets/hero/wave-motion.webm",
    fallbackImage: "/assets/hero/barrel.webp",
    actionLabel: "INITIATE BRAND DIRECTION",
    actionLink: "/contact",
    accentColor: "rgba(25, 69, 245, 0.4)",
  },
  {
    id: "track-2",
    number: "02",
    lead: "HIGH-PERFORMANCE",
    accent: "Web Platforms.",
    title: "High-Performance Web Platforms",
    subtitle: "SUB-SECOND FLUID EXPERIENCES",
    timeline: "6 - 8 WEEKS",
    quote: "Engineered for sub-second speed, fluid scroll mechanics, and frictionless conversion with zero performance compromise.",
    description: "Built on ultra-modern frontends with React, Vite, and Framer Motion physics—delivering cinematic immersion, 60fps responsiveness, and accessible semantic markup.",
    deliverables: [
      "React / Vite / Next.js",
      "Framer Motion Physics",
      "Accessible Semantic Core",
      "Sub-second LCP & SEO 100",
    ],
    videoSrc: "/assets/hero/oceans.mp4",
    fallbackImage: "/assets/process/process-sculpture.webp",
    actionLabel: "BUILD FLAGSHIP PLATFORM",
    actionLink: "/contact",
    accentColor: "rgba(12, 66, 106, 0.5)",
  },
  {
    id: "track-3",
    number: "03",
    lead: "CREATIVE TECH &",
    accent: "Spatial Visuals.",
    title: "Creative Technology & Spatial Visuals",
    subtitle: "EXPERIMENTAL IMMERSION",
    timeline: "8 - 12 WEEKS",
    quote: "From generative wave simulations to interactive spatial visualizers, turning visionary ideas into tangible digital realities.",
    description: "Pushing digital boundaries with WebGL shaders, 3D product visualizers, and intelligent AI interface interactions that command attention.",
    deliverables: [
      "Generative Shaders & Canvas",
      "3D Spatial Experiences",
      "AI Interface Integration",
      "Micro-Interactions Lab",
    ],
    videoSrc: "/assets/hero/wave-motion.webm",
    fallbackImage: "/assets/studio/studio-collaboration.webp",
    actionLabel: "EXPLORE THE LAB",
    actionLink: "/contact",
    accentColor: "rgba(25, 69, 245, 0.4)",
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
  const videoRef = useRef<HTMLVideoElement>(null);

  const activeTrack = tracks[currentIndex];

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

  // Video playback sync
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [currentIndex]);

  const visualVariants = {
    enter: (direction: "left" | "right") => ({
      y: direction === "right" ? "100%" : "-100%",
      opacity: 0,
      scale: 0.94,
    }),
    center: {
      y: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: "left" | "right") => ({
      y: direction === "right" ? "-100%" : "100%",
      opacity: 0,
      scale: 0.94,
    }),
  };

  const textVariants = {
    enter: (direction: "left" | "right") => ({
      x: direction === "right" ? 40 : -40,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction: "left" | "right") => ({
      x: direction === "right" ? -40 : 40,
      opacity: 0,
    }),
  };

  return (
    <div
      className={cn(
        "cta-slider-card relative w-full min-h-[700px] overflow-hidden rounded-3xl border border-white/10 bg-[#07090b] text-[#f1efe7] p-6 sm:p-10 md:p-14 shadow-2xl backdrop-blur-xl",
        className
      )}
    >
      {/* Background ambient glow pulse matching active track */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full blur-[140px] opacity-30 transition-all duration-700"
        style={{
          background: activeTrack.accentColor || "rgba(25, 69, 245, 0.4)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-[160px] opacity-25 transition-all duration-700"
        style={{
          background: activeTrack.accentColor || "rgba(25, 69, 245, 0.4)",
        }}
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* === Left Column: Track Navigation, Thumbnails & Meta === */}
        <div className="lg:col-span-3 flex flex-col justify-between space-y-6 order-2 lg:order-1">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <span className="font-mono text-xs tracking-[0.16em] text-[#1945f5] uppercase font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> ENGAGEMENT TRACKS
              </span>
              <span className="text-white/20">|</span>
              <span className="font-mono text-xs text-white/50 tracking-wider">
                {String(currentIndex + 1).padStart(2, "0")} / {String(tracks.length).padStart(2, "0")}
              </span>
            </div>

            {/* Vertical Track Selector List */}
            <div className="flex flex-col space-y-3">
              {tracks.map((track, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={track.id}
                    onClick={() => handleSelectTrack(idx)}
                    className={cn(
                      "group text-left p-3.5 rounded-xl border transition-all duration-300 flex items-start space-x-3 relative overflow-hidden",
                      isActive
                        ? "border-[#1945f5] bg-white/[0.08] shadow-[0_0_24px_rgba(25,69,245,0.2)]"
                        : "border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                    )}
                  >
                    <span
                      className={cn(
                        "font-mono text-xs font-bold transition-colors pt-1",
                        isActive ? "text-[#1945f5]" : "text-white/40 group-hover:text-white/70"
                      )}
                    >
                      {track.number}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "font-display text-base font-bold tracking-tight uppercase truncate transition-colors leading-tight",
                          isActive ? "text-white" : "text-white/70 group-hover:text-white"
                        )}
                      >
                        {track.lead}
                      </p>
                      <p
                        className={cn(
                          "font-serif italic text-sm normal-case truncate transition-colors leading-tight mt-0.5",
                          isActive ? "text-[#f1efe7]/95" : "text-white/40 group-hover:text-white/70"
                        )}
                      >
                        {track.accent}
                      </p>
                      <span className="text-[10px] font-mono tracking-widest text-white/35 block mt-1.5 uppercase">
                        {track.timeline}
                      </span>
                    </div>
                    {isActive && (
                      <motion.div
                        layoutId="active-track-indicator"
                        className="w-1.5 h-full absolute right-0 top-0 bg-[#1945f5]"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Direct agency location line */}
          <div className="pt-4 border-t border-white/10 hidden lg:block">
            <span className="text-[11px] font-mono tracking-[0.18em] text-white/40 uppercase block">
              LOCATION
            </span>
            <p className="text-xs text-white/70 mt-1 font-mono tracking-wide">
              Hyderabad, India • Global Delivery
            </p>
          </div>
        </div>

        {/* === Center Column: Cinematic Video & Kinetic Animation Showcase === */}
        <div className="lg:col-span-5 relative order-1 lg:order-2">
          <div className="relative aspect-[4/5] sm:aspect-[4/4] lg:aspect-[3/4] w-full max-h-[520px] rounded-2xl overflow-hidden border border-white/15 bg-black/60 shadow-[0_20px_60px_rgba(0,0,0,0.8)] group">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={visualVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.65, ease: [0.33, 1, 0.68, 1] }}
                className="absolute inset-0 w-full h-full"
              >
                {/* Visual Video Stream */}
                <video
                  ref={videoRef}
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster={activeTrack.fallbackImage}
                  className="w-full h-full object-cover brightness-90 contrast-110 saturate-110 group-hover:scale-105 transition-transform duration-700"
                >
                  <source src={activeTrack.videoSrc} type="video/webm" />
                  <source src="/assets/hero/oceans.mp4" type="video/mp4" />
                </video>

                {/* Dark Vignette & Gradient Overlays for optimal readability and mood */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#07090b] via-transparent to-black/30 pointer-events-none" />
                <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/60 pointer-events-none" />

                {/* Animated Generative Wave Overlay Indicator */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
                  <div className="flex items-center space-x-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-[#1945f5] animate-pulse" />
                    <span className="font-mono text-[10px] tracking-wider text-white/80 uppercase">
                      MOTION STREAM // ACTIVE
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-white/70">
                    <Waves className="w-4 h-4 text-[#1945f5]" />
                  </div>
                </div>

                {/* Top Corner Branding Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="inline-block font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded bg-black/70 backdrop-blur-md border border-white/10 text-white/90">
                    INSPIRING WAVE // {activeTrack.number}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* === Right Column: Content Pitch, Deliverables & Call-to-Action === */}
        <div className="lg:col-span-4 flex flex-col justify-between h-full order-3 lg:order-3 space-y-6">
          <div className="relative overflow-hidden min-h-[320px]">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={textVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.55, ease: [0.33, 1, 0.68, 1] }}
                className="space-y-4"
              >
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1945f5] animate-pulse" />
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#1945f5] font-semibold">
                      {activeTrack.subtitle}
                    </span>
                  </div>
                  
                  {/* Signature Headline: Barlow Condensed Lead + Instrument Serif Italic Accent */}
                  <h3 className="mt-2 space-y-0.5">
                    <span className="block font-display text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold uppercase tracking-tight text-white leading-[0.88]">
                      {activeTrack.lead}
                    </span>
                    <span className="block font-serif italic font-normal normal-case text-3xl sm:text-4xl lg:text-5xl text-[#f1efe7] tracking-tight leading-[1.04]">
                      {activeTrack.accent}
                    </span>
                  </h3>
                </div>

                {/* Editorial Vision Quote */}
                <blockquote className="my-3 font-serif italic text-base sm:text-lg lg:text-xl text-[#f1efe7]/90 leading-snug pl-3.5 border-l-2 border-[#1945f5] bg-white/[0.02] py-1 rounded-r-lg">
                  "{activeTrack.quote}"
                </blockquote>

                {/* Contextual description */}
                <p className="font-sans text-white/70 text-xs sm:text-sm leading-relaxed">
                  {activeTrack.description}
                </p>

                {/* Scope Deliverables Tags */}
                <div className="pt-2">
                  <span className="text-[11px] font-mono tracking-[0.18em] text-white/40 uppercase block mb-2 font-medium">
                    SCOPE DELIVERABLES
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeTrack.deliverables.map((item) => (
                      <span
                        key={item}
                        className="px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/10 text-white/80 font-mono text-[11px] tracking-wide"
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
                <Button
                  className="w-full bg-[#1945f5] hover:bg-[#1945f5]/90 text-white font-mono text-xs tracking-[0.14em] uppercase h-12 px-6 rounded-xl flex items-center justify-between group shadow-[0_0_24px_rgba(25,69,245,0.45)] transition-all duration-300"
                >
                  <span className="font-semibold">{activeTrack.actionLabel}</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Button>
              </Link>

              {/* Prev / Next Buttons */}
              <div className="flex items-center justify-end space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl w-12 h-12 border-white/20 bg-white/[0.03] text-white hover:bg-white/10 hover:text-white"
                  onClick={handlePrev}
                  aria-label="Previous track"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl w-12 h-12 border-white/20 bg-white/[0.03] text-white hover:bg-white/10 hover:text-white"
                  onClick={handleNext}
                  aria-label="Next track"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Direct inquiry shortcut */}
            <div className="flex items-center justify-between text-[11px] font-mono text-white/40 pt-1">
              <a
                href="mailto:info@inspiringwave.in"
                className="hover:text-white transition-colors underline-offset-4 hover:underline tracking-wider"
              >
                info@inspiringwave.in
              </a>
              <a
                href="tel:+917893801806"
                className="hover:text-white transition-colors tracking-wider"
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
