"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Compass, Crosshair, Layers, Cpu, Rocket, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Deterministic PRNG & Torn Paper / Cutout Geometry
// ---------------------------------------------------------------------------

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

function scissorCutClip(seed: number, amp = 4.2): string {
  const r = mulberry32(seed * 9973 + 31);
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

function buildTornEdge(seed = 84, invert = false) {
  const r = mulberry32(seed);
  const step = 18;
  const topPts: [number, number][] = [];
  const fibrePts: [number, number][] = [];

  for (let x = 0; x <= 1440; x += step) {
    const wander = Math.sin(x * 0.013 + seed) * 10 + Math.cos(x * 0.039) * 5;
    const tooth = r() < 0.15 ? (r() - 0.5) * 24 : (r() - 0.5) * 7;
    const y = Math.max(8, Math.min(72, 34 + wander + tooth));
    topPts.push([x, y]);
    const fibreWidth = 5 + r() * 8;
    fibrePts.push([x, invert ? y - fibreWidth : y + fibreWidth]);
  }

  if (!invert) {
    const sheet =
      `M0 0 L1440 0 L1440 ${topPts[topPts.length - 1][1].toFixed(1)} ` +
      topPts
        .slice()
        .reverse()
        .map(([x, y]) => `L${x} ${y.toFixed(1)}`)
        .join(" ") +
      " Z";
    const fibre =
      `M0 0 L1440 0 L1440 ${fibrePts[fibrePts.length - 1][1].toFixed(1)} ` +
      fibrePts
        .slice()
        .reverse()
        .map(([x, y]) => `L${x} ${y.toFixed(1)}`)
        .join(" ") +
      " Z";
    return { sheet, fibre };
  } else {
    const sheet =
      `M0 84 L1440 84 L1440 ${topPts[topPts.length - 1][1].toFixed(1)} ` +
      topPts
        .slice()
        .reverse()
        .map(([x, y]) => `L${x} ${y.toFixed(1)}`)
        .join(" ") +
      " Z";
    const fibre =
      `M0 84 L1440 84 L1440 ${fibrePts[fibrePts.length - 1][1].toFixed(1)} ` +
      fibrePts
        .slice()
        .reverse()
        .map(([x, y]) => `L${x} ${y.toFixed(1)}`)
        .join(" ") +
      " Z";
    return { sheet, fibre };
  }
}

// ---------------------------------------------------------------------------
// Enriched 5-Step Studio Method Data
// ---------------------------------------------------------------------------

export interface MethodPhase {
  number: string;
  name: string;
  kicker: string;
  summary: string;
  detail: string;
  deliverables: string[];
  accent: string;
  stamp: string;
  telemetry: string;
  image: string;
  objectPos: string;
}

const METHOD_PHASES: MethodPhase[] = [
  {
    number: "01",
    name: "Discover",
    kicker: "PHASE 01 // SIGNAL & OPPORTUNITY",
    summary: "Understand the business, audience and opportunity.",
    detail:
      "We interrogate assumptions, map audience tension points, and uncover the sharpest commercial and cultural leverage before drawing a single frame.",
    deliverables: ["Stakeholder Synthesis", "Audience Signals", "Opportunity Audit", "Success Metrics"],
    accent: "#d8f03c",
    stamp: "SONAR SCAN // ACTIVE",
    telemetry: "FREQ 42.8 HZ · DEPTH 100%",
    image: "/assets/dimensions/dim-04-system.jpg",
    objectPos: "center center",
  },
  {
    number: "02",
    name: "Define",
    kicker: "PHASE 02 // ARCHITECTURE & DIRECTION",
    summary: "Establish a strategy and creative direction.",
    detail:
      "We lock the strategic spine, narrative voice, and visual thesis—creating an unmistakable blueprint where business logic and bold art direction align.",
    deliverables: ["Positioning Spine", "Art Direction Thesis", "System Blueprint", "Experience Roadmap"],
    accent: "#1945f5",
    stamp: "GOLDEN RATIO // LOCKED",
    telemetry: "GRID 12-COL · RATIO 1:1.618",
    image: "/assets/dimensions/dim-02-spatial.jpg",
    objectPos: "center center",
  },
  {
    number: "03",
    name: "Design",
    kicker: "PHASE 03 // CHOREOGRAPHY & CRAFT",
    summary: "Translate the strategy into a distinctive experience.",
    detail:
      "Every interaction, typographic lockup, and motion curve is prototyped with tactile precision—turning complex systems into intuitive, magnetic interfaces.",
    deliverables: ["Interactive Prototypes", "Design Systems & Tokens", "Kinetic Typography", "Motion Physics"],
    accent: "#ff4f5e",
    stamp: "BÉZIER CRAFT // 60FPS",
    telemetry: "CUBIC(0.16, 1, 0.3, 1)",
    image: "/assets/dimensions/dim-03-kinetic.jpg",
    objectPos: "center center",
  },
  {
    number: "04",
    name: "Develop",
    kicker: "PHASE 04 // FULL-STACK ENGINEERING",
    summary: "Engineer the experience into a reliable product.",
    detail:
      "Clean, resilient architecture built on modern stacks. We engineer sub-second load speeds, fluid scroll mechanics, and accessible semantic markup.",
    deliverables: ["React / Next.js Core", "WebGL & Shader Pipeline", "API & Cloud Systems", "WCAG AAA Rigor"],
    accent: "#5676ff",
    stamp: "MATRIX BUILD // VERIFIED",
    telemetry: "LCP < 0.8S · BUNDLE OPT",
    image: "/assets/dimensions/dim-01-core.jpg",
    objectPos: "center center",
  },
  {
    number: "05",
    name: "Deliver",
    kicker: "PHASE 05 // LAUNCH & MOMENTUM",
    summary: "Launch, evaluate and continuously improve.",
    detail:
      "Release is the opening wave. We deploy with zero-downtime precision, instrument real-world analytics, and iterate to compound measurable growth.",
    deliverables: ["Production Launch", "Performance Telemetry", "Growth Iteration", "Continuous Evolution"],
    accent: "#d8f03c",
    stamp: "SHIPPED & LIVE ↗",
    telemetry: "UPTIME 99.99% · WAVE LIVE",
    image: "/assets/dimensions/dim-07-perspective.jpg",
    objectPos: "center center",
  },
];

// ---------------------------------------------------------------------------
// 5-Stage Procedural SVG Blueprint Overlay (Morphs per Active Phase)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Main Component: ArtisticMethodSection
// ---------------------------------------------------------------------------

export function ArtisticMethodSection() {
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const stageColRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [pinY, setPinY] = useState(0);

  const topTear = useMemo(() => buildTornEdge(84, false), []);
  const bottomTear = useMemo(() => buildTornEdge(99, true), []);
  const paperCutoutClip = useMemo(() => scissorCutClip(19, 4.2), []);

  // Scroll-follower pin & active phase sync on desktop so the image card ALWAYS scrolls smoothly with the steps
  useEffect(() => {
    const updateScrollSync = () => {
      const grid = gridRef.current;
      const stageCol = stageColRef.current;
      if (!grid || !stageCol) return;

      if (!window.matchMedia("(min-width: 1024px)").matches) {
        setPinY(0);
        return;
      }

      const gridRect = grid.getBoundingClientRect();
      const stageHeight = stageCol.offsetHeight;
      const gridHeight = grid.offsetHeight;
      const pinTopOffset = 92; // px from top of viewport when pinned
      const maxTravel = Math.max(0, gridHeight - stageHeight);
      const desiredTravel = -gridRect.top + pinTopOffset;
      const clampedY = Math.max(0, Math.min(maxTravel, desiredTravel));
      setPinY(clampedY);

      // Sync active phase with whichever step card is closest to the viewport reading zone
      const viewportAnchor = window.innerHeight * 0.44;
      let bestIdx = 0;
      let bestDist = Infinity;
      stepRefs.current.forEach((el, idx) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const center = r.top + r.height * 0.45;
        const dist = Math.abs(center - viewportAnchor);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = idx;
        }
      });
      if (gridRect.top < window.innerHeight * 0.5 && gridRect.bottom > window.innerHeight * 0.3) {
        setActive(bestIdx);
      }
    };

    updateScrollSync();
    window.addEventListener("scroll", updateScrollSync, { passive: true });
    window.addEventListener("resize", updateScrollSync);
    return () => {
      window.removeEventListener("scroll", updateScrollSync);
      window.removeEventListener("resize", updateScrollSync);
    };
  }, []);

  const currentPhase = METHOD_PHASES[active] || METHOD_PHASES[0];

  const PHASE_ICONS = [Compass, Crosshair, Layers, Cpu, Rocket];

  return (
    <section
      ref={sectionRef}
      id="method"
      className="method section dark relative bg-[#080a0b] text-[#f1efe7] pt-32 pb-36 md:pt-40 md:pb-44"
      style={{ "--stage": active, overflow: "visible" } as React.CSSProperties}
    >
      {/* Decorative Clipped Background Wrapper (keeps section overflow:visible so sticky works!) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* 1. Torn-Paper Top Edge (rips from ivory 04 / SERVICES above into dark 05 / METHOD) */}
        <div className="absolute top-0 left-0 right-0 w-full overflow-hidden leading-none z-20">
          <svg
            viewBox="0 0 1440 84"
            preserveAspectRatio="none"
            className="w-full h-10 sm:h-14 md:h-20 block drop-shadow-[0_12px_18px_rgba(0,0,0,0.65)]"
          >
            <path d={topTear.fibre} fill="#ffffff" opacity="0.88" />
            <path d={topTear.sheet} fill="#f1efe7" />
          </svg>
        </div>

        {/* 2. Blueprint Grid Background & Dynamic Phase Glow */}
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(241,239,231,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(241,239,231,0.2) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <div
          className="absolute top-1/3 left-1/4 w-[38rem] h-[38rem] rounded-full blur-[160px] opacity-20 transition-colors duration-700"
          style={{ backgroundColor: currentPhase.accent }}
        />
      </div>

      {/* Section Marker */}
      <div className="marker marker-light">
        <span className="mono">
          05 /<br />
          METHOD
        </span>
        <i />
      </div>

      {/* 3. Mixed-Media Headline Lockup ("GOOD IDEAS." + Scissor-Cut "Great execution.") */}
      <div className="relative z-10 max-w-[1380px] mx-auto mb-14 md:mb-20 md:pl-[10vw]">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-3.5 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-[#d8f03c]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>BLUEPRINT // FIVE CONNECTED PHASES</span>
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
            ACTIVE STAGE: {currentPhase.number} / 05 — {currentPhase.name.toUpperCase()}
          </span>
        </div>

        <div className="artistic-method-header relative inline-block">
          <h2 className="m-0 flex flex-col items-start gap-2 sm:gap-3 leading-none">
            {/* Line 1: GOOD IDEAS. inside Vector Dimension Box */}
            <span className="relative inline-flex flex-wrap items-baseline gap-x-4 sm:gap-x-6 px-3 py-1 border border-[#5676ff]/60 bg-[#1945f5]/[0.06]">
              {/* Corner Vector Nodes */}
              <i className="pointer-events-none absolute -top-1.5 -left-1.5 w-2.5 h-2.5 bg-[#f1efe7] border border-[#1945f5]" />
              <i className="pointer-events-none absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-[#f1efe7] border border-[#1945f5]" />
              <i className="pointer-events-none absolute -bottom-1.5 -left-1.5 w-2.5 h-2.5 bg-[#f1efe7] border border-[#1945f5]" />
              <i className="pointer-events-none absolute -bottom-1.5 -right-1.5 w-2.5 h-2.5 bg-[#f1efe7] border border-[#1945f5]" />

              <span className="font-display font-black uppercase tracking-[-0.04em] text-6xl sm:text-8xl md:text-9xl text-[#f1efe7] leading-[0.86]">
                {"GOOD".split("").map((ch, i) => (
                  <motion.span
                    key={`good-${i}`}
                    whileHover={{ y: -8, rotate: i % 2 === 0 ? -4 : 4, color: "#d8f03c" }}
                    transition={{ type: "spring", stiffness: 400, damping: 14 }}
                    className="inline-block cursor-pointer"
                  >
                    {ch}
                  </motion.span>
                ))}
              </span>

              <span className="relative font-display font-black uppercase tracking-[-0.04em] text-6xl sm:text-8xl md:text-9xl text-[#f1efe7] leading-[0.86]">
                {"IDEAS.".split("").map((ch, i) => (
                  <motion.span
                    key={`ideas-${i}`}
                    whileHover={{ y: -8, rotate: i % 2 === 0 ? 5 : -5, color: "#d8f03c" }}
                    transition={{ type: "spring", stiffness: 400, damping: 14 }}
                    className="inline-block cursor-pointer"
                  >
                    {ch}
                  </motion.span>
                ))}
                {/* Hand-drawn SVG highlight loop around IDEAS. */}
                <svg
                  viewBox="0 0 260 90"
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-x-3 -inset-y-2 w-[calc(100%+1.5rem)] h-[calc(100%+1rem)] overflow-visible"
                >
                  <path
                    d="M 14 48 C 12 14, 244 10, 246 44 C 248 78, 22 82, 26 52"
                    fill="none"
                    stroke="#d8f03c"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="6 6"
                  />
                </svg>
              </span>
            </span>

            {/* Line 2: Scissor-Cut Paper Collage Swatch ("Great execution.") with explicit word gap */}
            <motion.span
              whileHover={{ rotate: -1, scale: 1.02 }}
              className="relative inline-flex items-baseline gap-x-3 sm:gap-x-4 -rotate-1 px-6 sm:px-8 py-2 sm:py-3 bg-[#f1efe7] text-[#080a0b] shadow-[0_20px_48px_rgba(0,0,0,0.75)] mt-1"
              style={{ clipPath: paperCutoutClip }}
            >
              {/* Masking Tape Strip */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-2.5 left-12 w-20 h-4 bg-[#d8f03c]/90 -rotate-2 shadow-sm"
              />
              <em className="font-serif italic font-normal normal-case text-5xl sm:text-7xl md:text-8xl text-[#1945f5] tracking-[-0.02em] leading-none">
                Great{"\u00A0"}execution.
              </em>
              <span className="hidden sm:inline-block font-mono text-[10px] font-bold uppercase tracking-[0.18em] px-2.5 py-1 rounded bg-[#080a0b] text-[#d8f03c] self-center">
                5-STEP ENGINE
              </span>
            </motion.span>
          </h2>
        </div>
      </div>

      {/* 4. Two-Column Layout: Massive 7-Col Scroll-Following Image Stage + 5-Col Step Rail */}
      <div
        ref={gridRef}
        className="artistic-method-grid relative z-10 w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start"
      >
        {/* Left Column (7 of 12 cols): Big, Commanding, Uncluttered Scroll-Following Image Stage */}
        <div
          ref={stageColRef}
          className="artistic-method-sticky-col lg:col-span-7 self-start will-change-transform w-full"
          style={{ transform: `translate3d(0, ${pinY}px, 0)` }}
        >
          <div className="artistic-method-stage relative w-full h-[54vh] sm:h-[64vh] lg:h-[76vh] min-h-[520px] max-h-[780px] rounded-2xl overflow-hidden border border-white/15 bg-[#050709] shadow-[0_32px_80px_rgba(0,0,0,0.85)]">
            {/* Clean High-Resolution Phase Photograph (Full Bleed, Unobstructed) */}
            <AnimatePresence mode="wait">
              <motion.img
                key={currentPhase.image}
                src={currentPhase.image}
                alt={`${currentPhase.name} phase visual`}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full object-cover"
                style={{ objectPosition: currentPhase.objectPos }}
              />
            </AnimatePresence>

            {/* Subtle bottom gradient for caption legibility */}
            <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />

            {/* Minimal Editorial Bottom Caption & Thin Progress Hairline */}
            <div className="absolute bottom-0 inset-x-0 z-20 p-6 sm:p-8">
              <div className="flex items-end justify-between gap-4 mb-4">
                <div>
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/65 block">
                    0{active + 1} / 05 — {currentPhase.kicker}
                  </span>
                  <div className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tight text-[#f1efe7] leading-none mt-1">
                    {currentPhase.name}
                  </div>
                </div>
                <span className="font-display text-6xl sm:text-7xl font-black text-white/25 leading-none select-none">
                  {currentPhase.number}
                </span>
              </div>

              {/* Thin 3px Progress Bar */}
              <div className="w-full h-[3px] bg-white/15 overflow-hidden rounded-full">
                <span
                  className="block h-full bg-[#1945f5] transition-all duration-500"
                  style={{ width: `${(active + 1) * 20}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 of 12 cols): 5-Step Tactile Phase Dossier Rail */}
        <ol className="lg:col-span-5 list-none m-0 p-0 space-y-5 relative">
          {METHOD_PHASES.map((phase, i) => {
            const isActive = active === i;
            const Icon = PHASE_ICONS[i] || Compass;

            return (
              <li
                key={phase.name}
                ref={(el) => {
                  stepRefs.current[i] = el;
                }}
                className={cn("relative transition-all", isActive ? "active" : "")}
              >
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 300, damping: 26 }}
                  className={cn(
                    "relative rounded-2xl border-2 transition-colors duration-300 overflow-hidden",
                    isActive
                      ? "bg-[#f1efe7] text-[#080a0b] border-[#d8f03c] shadow-[0_24px_60px_rgba(0,0,0,0.75)]"
                      : "bg-white/[0.03] text-[#f1efe7] border-white/10 hover:border-white/25 hover:bg-white/[0.05]"
                  )}
                >
                  {/* Top Masking Tape Accent when Active */}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -top-2 right-10 w-20 h-4 bg-[#d8f03c] rotate-2 shadow-sm z-20"
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    onMouseEnter={() => setActive(i)}
                    aria-expanded={isActive}
                    className="w-full text-left p-6 sm:p-8 bg-transparent border-0 color-inherit cursor-pointer flex items-start gap-5 sm:gap-7"
                  >
                    {/* Step Number Badge */}
                    <div
                      className={cn(
                        "flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center font-display font-black text-2xl sm:text-3xl border-2 transition-transform duration-300",
                        isActive
                          ? "bg-[#080a0b] text-[#d8f03c] border-[#080a0b] -rotate-3 scale-105"
                          : "bg-white/[0.05] text-white/70 border-white/15"
                      )}
                    >
                      <b>{phase.number}</b>
                    </div>

                    {/* Step Title, Summary & Expandable Dossier */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <span
                          className={cn(
                            "font-mono text-[10px] uppercase tracking-[0.2em] font-bold",
                            isActive ? "text-[#1945f5]" : "text-white/45"
                          )}
                        >
                          {phase.kicker}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full",
                            isActive
                              ? "bg-[#080a0b] text-[#f1efe7]"
                              : "bg-white/[0.06] text-white/50"
                          )}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{phase.stamp}</span>
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between gap-4">
                        <strong
                          className={cn(
                            "font-display text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight leading-[0.9] block",
                            isActive ? "text-[#080a0b]" : "text-[#f1efe7]"
                          )}
                        >
                          {phase.name}
                        </strong>
                      </div>

                      <small
                        className={cn(
                          "block font-serif italic text-xl sm:text-2xl mt-2 leading-snug",
                          isActive ? "text-[#080a0b]/85" : "text-[#f1efe7]/70"
                        )}
                      >
                        {phase.summary}
                      </small>

                      {/* Expanded Tactile Phase Details & Deliverables */}
                      <AnimatePresence initial={false}>
                        {isActive && (
                          <motion.div
                            key="details"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                          >
                            <p className="mt-3 pt-3 border-t border-[#080a0b]/15 font-sans text-sm sm:text-base text-[#080a0b]/75 leading-relaxed mb-4">
                              {phase.detail}
                            </p>

                            {/* Deliverable Scissor-Cut Chips */}
                            <div className="flex flex-wrap gap-2">
                              {phase.deliverables.map((item, idx) => (
                                <span
                                  key={item}
                                  className="px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider bg-[#080a0b] text-[#f1efe7] shadow-sm"
                                  style={{
                                    clipPath: scissorCutClip(i * 10 + idx + 5, 3.5),
                                  }}
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </button>
                </motion.div>
              </li>
            );
          })}

          {/* Bottom Call-to-Action Footer Card inside Rail */}
          <div className="pt-4 flex flex-wrap items-center justify-between gap-4 px-2">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-white/50">
              READY TO MOVE FROM 01 → 05?
            </span>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#d8f03c] text-[#080a0b] font-mono text-xs font-bold uppercase tracking-[0.16em] shadow-lg hover:bg-[#f1efe7] transition-colors"
            >
              <span>START THE PROCESS</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </ol>
      </div>

      {/* 5. Torn-Paper Bottom Edge (rips cleanly into ivory 06 / STUDIO below) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-20"
      >
        <svg
          viewBox="0 0 1440 84"
          preserveAspectRatio="none"
          className="w-full h-10 sm:h-14 md:h-20 block"
        >
          <path d={bottomTear.fibre} fill="#ffffff" opacity="0.85" />
          <path d={bottomTear.sheet} fill="#f1efe7" />
        </svg>
      </div>
    </section>
  );
}
