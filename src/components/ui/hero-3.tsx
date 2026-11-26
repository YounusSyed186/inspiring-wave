"use client";

import React, { useState, useRef, useMemo, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useVelocity,
  useSpring,
  useTransform,
  useAnimationFrame,
  useMotionValue,
} from "framer-motion";
import { ArrowUpRight, MousePointerClick } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface MarqueeWorkItem {
  id?: string;
  number: string;
  title: string;
  category: string;
  image: string;
  href: string;
  accent?: string;
  stamp?: string;
}

export interface AnimatedMarqueeHeroProps {
  tagline: string;
  title: React.ReactNode;
  description: string;
  ctaText: string;
  images: string[];
  items?: MarqueeWorkItem[];
  className?: string;
  ctaHref?: string;
  headingId?: string;
}

// ---------------------------------------------------------------------------
// Deterministic PRNG & Paper Geometry Helpers (inspired by TigerTear & Preloader)
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

/** Scissor-cut polygon clip-path for paper collage swatches. */
function scissorCutClip(seed: number, amp = 4.5): string {
  const r = mulberry32(seed * 9973 + 19);
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

/** Procedural torn-paper SVG path across the top edge (0..1440). */
function buildTornTopPaths(seed = 42) {
  const r = mulberry32(seed);
  const step = 18;
  const topPts: [number, number][] = [];
  const fibrePts: [number, number][] = [];

  for (let x = 0; x <= 1440; x += step) {
    const wander = Math.sin(x * 0.012 + seed) * 11 + Math.cos(x * 0.037) * 5;
    const tooth = r() < 0.14 ? (r() - 0.5) * 24 : (r() - 0.5) * 7;
    const y = Math.max(8, Math.min(74, 36 + wander + tooth));
    topPts.push([x, y]);
    const fibreWidth = 5 + r() * 9;
    fibrePts.push([x, y + fibreWidth]);
  }

  const ivorySheet =
    `M0 0 L1440 0 L1440 ${topPts[topPts.length - 1][1].toFixed(1)} ` +
    topPts
      .slice()
      .reverse()
      .map(([x, y]) => `L${x} ${y.toFixed(1)}`)
      .join(" ") +
    " Z";

  const paperFibre =
    `M0 0 L1440 0 L1440 ${fibrePts[fibrePts.length - 1][1].toFixed(1)} ` +
    fibrePts
      .slice()
      .reverse()
      .map(([x, y]) => `L${x} ${y.toFixed(1)}`)
      .join(" ") +
    " Z";

  return { ivorySheet, paperFibre };
}

// ---------------------------------------------------------------------------
// Custom SVG Die-Cut Studio Stickers
// ---------------------------------------------------------------------------

type StickerKind = "seal" | "starburst" | "stamp" | "bezier" | "ransom" | "wave";

interface SlappedSticker {
  id: number;
  kind: StickerKind;
  x: number; // percentage 6..94
  y: number; // percentage 12..84
  rot: number;
  scale: number;
  depth: number;
}

const STICKER_KINDS: StickerKind[] = [
  "starburst",
  "stamp",
  "bezier",
  "ransom",
  "wave",
  "seal",
];

const INITIAL_STICKERS: SlappedSticker[] = [
  { id: 1, kind: "seal", x: 11, y: 20, rot: -11, scale: 1, depth: 1.3 },
  { id: 2, kind: "starburst", x: 88, y: 18, rot: 14, scale: 0.96, depth: -1.1 },
  { id: 3, kind: "bezier", x: 14, y: 52, rot: -7, scale: 0.92, depth: 0.85 },
  { id: 4, kind: "stamp", x: 86, y: 49, rot: 9, scale: 0.95, depth: -1.25 },
];

function DieCutStickerSVG({ kind }: { kind: StickerKind }) {
  switch (kind) {
    case "seal":
      return (
        <svg viewBox="0 0 120 120" className="w-24 h-24 md:w-28 md:h-28 drop-shadow-[0_10px_22px_rgba(0,0,0,0.65)]">
          <defs>
            <path
              id="iw-work-seal-circle"
              d="M 60,60 m -42,0 a 42,42 0 1,1 84,0 a 42,42 0 1,1 -84,0"
            />
          </defs>
          <circle cx="60" cy="60" r="56" fill="#f1efe7" />
          <circle cx="60" cy="60" r="52" fill="#1945f5" stroke="#080c12" strokeWidth="2.5" />
          <g className="origin-center animate-[spin_18s_linear_infinite]">
            <text
              fill="#f1efe7"
              fontSize="8.3"
              fontWeight="700"
              fontFamily="'IBM Plex Mono', monospace"
              letterSpacing="2.1"
            >
              <textPath href="#iw-work-seal-circle">
                INSPIRING WAVE • SELECTED WORK • 2026 •
              </textPath>
            </text>
          </g>
          <circle cx="60" cy="60" r="22" fill="#d8f03c" stroke="#080c12" strokeWidth="2.5" />
          <path
            d="M49 60 Q54.5 51 60 60 T71 60"
            fill="none"
            stroke="#080c12"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        </svg>
      );

    case "starburst": {
      const points: string[] = [];
      const spikes = 16;
      for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? 54 : 41;
        const a = (i * Math.PI) / spikes;
        points.push(`${(60 + Math.cos(a) * r).toFixed(1)},${(60 + Math.sin(a) * r).toFixed(1)}`);
      }
      return (
        <svg viewBox="0 0 120 120" className="w-24 h-24 md:w-28 md:h-28 drop-shadow-[0_10px_22px_rgba(0,0,0,0.65)]">
          <polygon
            points={points.join(" ")}
            fill="#d8f03c"
            stroke="#f1efe7"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <polygon
            points={points.join(" ")}
            fill="#d8f03c"
            stroke="#080c12"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <text
            x="60"
            y="55"
            textAnchor="middle"
            fill="#080c12"
            fontFamily="'Barlow Condensed', sans-serif"
            fontWeight="900"
            fontSize="20"
            letterSpacing="-0.5"
          >
            100%
          </text>
          <text
            x="60"
            y="73"
            textAnchor="middle"
            fill="#080c12"
            fontFamily="'IBM Plex Mono', monospace"
            fontWeight="700"
            fontSize="10"
            letterSpacing="1"
          >
            CRAFT
          </text>
        </svg>
      );
    }

    case "stamp":
      return (
        <svg viewBox="0 0 148 64" className="w-32 h-14 md:w-36 md:h-16 drop-shadow-[0_10px_22px_rgba(0,0,0,0.65)]">
          <rect
            x="3"
            y="3"
            width="142"
            height="58"
            rx="12"
            fill="#f1efe7"
          />
          <rect
            x="7"
            y="7"
            width="134"
            height="50"
            rx="8"
            fill="#ff4f5e"
            stroke="#080c12"
            strokeWidth="2.5"
          />
          <text
            x="74"
            y="38"
            textAnchor="middle"
            fill="#f1efe7"
            fontFamily="'Barlow Condensed', sans-serif"
            fontWeight="900"
            fontSize="24"
            letterSpacing="1"
          >
            SHIP IT ↗
          </text>
        </svg>
      );

    case "bezier":
      return (
        <svg viewBox="0 0 144 68" className="w-32 h-16 md:w-36 md:h-16 drop-shadow-[0_10px_22px_rgba(0,0,0,0.65)]">
          <rect x="4" y="4" width="136" height="60" rx="30" fill="#f1efe7" />
          <rect
            x="8"
            y="8"
            width="128"
            height="52"
            rx="26"
            fill="#080c12"
            stroke="#1945f5"
            strokeWidth="2.5"
          />
          <line x1="26" y1="44" x2="54" y2="20" stroke="#d8f03c" strokeWidth="1.8" />
          <circle cx="54" cy="20" r="3.5" fill="#d8f03c" />
          <rect x="22" y="40" width="7" height="7" fill="#f1efe7" stroke="#1945f5" strokeWidth="1.8" />
          <text
            x="86"
            y="39"
            textAnchor="middle"
            fill="#f1efe7"
            fontFamily="'IBM Plex Mono', monospace"
            fontWeight="700"
            fontSize="11"
            letterSpacing="1"
          >
            BÉZIER 60FPS
          </text>
        </svg>
      );

    case "ransom":
      return (
        <svg viewBox="0 0 150 64" className="w-32 h-14 md:w-36 md:h-16 drop-shadow-[0_10px_22px_rgba(0,0,0,0.65)]">
          <polygon
            points="4,8 144,3 147,57 7,61"
            fill="#f1efe7"
            stroke="#080c12"
            strokeWidth="2.5"
          />
          <rect x="14" y="13" width="38" height="38" fill="#1945f5" transform="rotate(-4 33 32)" />
          <text
            x="33"
            y="40"
            textAnchor="middle"
            fill="#f1efe7"
            fontFamily="'Barlow Condensed', sans-serif"
            fontWeight="900"
            fontSize="24"
          >
            MW
          </text>
          <text
            x="96"
            y="39"
            textAnchor="middle"
            fill="#080c12"
            fontFamily="'Instrument Serif', Georgia, serif"
            fontStyle="italic"
            fontSize="24"
          >
            waves.
          </text>
        </svg>
      );

    case "wave":
    default:
      return (
        <svg viewBox="0 0 144 64" className="w-32 h-14 md:w-36 md:h-16 drop-shadow-[0_10px_22px_rgba(0,0,0,0.65)]">
          <rect x="3" y="3" width="138" height="58" rx="14" fill="#f1efe7" />
          <rect
            x="7"
            y="7"
            width="130"
            height="50"
            rx="10"
            fill="#1945f5"
            stroke="#080c12"
            strokeWidth="2"
          />
          <text
            x="72"
            y="37"
            textAnchor="middle"
            fill="#d8f03c"
            fontFamily="'IBM Plex Mono', monospace"
            fontWeight="700"
            fontSize="11.5"
            letterSpacing="1.4"
          >
            HYD → GLOBAL
          </text>
        </svg>
      );
  }
}

// ---------------------------------------------------------------------------
// Action Button
// ---------------------------------------------------------------------------

const ActionButton = ({
  children,
  href,
}: {
  children: React.ReactNode;
  href?: string;
}) => {
  const inner = (
    <motion.span
      whileHover={{ scale: 1.05, rotate: -1.5 }}
      whileTap={{ scale: 0.96 }}
      className="relative inline-flex items-center gap-3.5 px-8 py-4 rounded-full bg-[#1945f5] text-[#f1efe7] font-mono text-xs uppercase tracking-[0.18em] font-semibold shadow-[0_14px_38px_rgba(25,69,245,0.48)] border-2 border-[#f1efe7] transition-colors hover:bg-[#2349cd] cursor-pointer select-none"
    >
      <span>{children}</span>
      <span className="grid place-items-center w-6 h-6 rounded-full bg-[#d8f03c] text-[#080c12]">
        <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2.6} />
      </span>
    </motion.span>
  );

  if (href) {
    return (
      <Link to={href} data-no-sticker className="inline-block focus:outline-none">
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      data-no-sticker
      className="bg-transparent border-0 p-0 focus:outline-none"
    >
      {inner}
    </button>
  );
};

// ---------------------------------------------------------------------------
// Default Project Metadata Enrichment
// ---------------------------------------------------------------------------

const DEFAULT_WORK_CATALOG: Omit<MarqueeWorkItem, "image">[] = [
  {
    number: "01",
    title: "Digital Architecture",
    category: "STRATEGY / DESIGN / DEV",
    href: "/work/digital-architecture",
    accent: "#1945f5",
    stamp: "CONCEPT STUDY 01",
  },
  {
    number: "02",
    title: "Systems in Motion",
    category: "PRODUCT / EXPERIENCE",
    href: "/work/systems-in-motion",
    accent: "#d8f03c",
    stamp: "CONCEPT STUDY 02",
  },
  {
    number: "03",
    title: "Culture, Amplified",
    category: "CAMPAIGN / CONTENT",
    href: "/work/culture,-amplified",
    accent: "#ff4f5e",
    stamp: "CONCEPT STUDY 03",
  },
  {
    number: "04",
    title: "Spatial Design Lab",
    category: "UI/UX / PROTOTYPING",
    href: "/services/ui-ux-design",
    accent: "#5676ff",
    stamp: "INTERFACE SYSTEM",
  },
  {
    number: "05",
    title: "Kinetic Commerce",
    category: "WEB PLATFORM / 60FPS",
    href: "/services/web-development",
    accent: "#1945f5",
    stamp: "FLAGSHIP BUILD",
  },
  {
    number: "06",
    title: "Brand Choreography",
    category: "IDENTITY / DIRECTION",
    href: "/services/digital-strategy",
    accent: "#d8f03c",
    stamp: "DESIGN DIRECTION",
  },
  {
    number: "07",
    title: "Fluid Mobile Core",
    category: "IOS & ANDROID / APPS",
    href: "/services/mobile-app-development",
    accent: "#ff4f5e",
    stamp: "PRODUCT RELEASE",
  },
  {
    number: "08",
    title: "Enterprise Cloud",
    category: "CUSTOM SOFTWARE / AI",
    href: "/services/software-development",
    accent: "#5676ff",
    stamp: "SYSTEM ARCHITECTURE",
  },
];

// ---------------------------------------------------------------------------
// Main Component: AnimatedMarqueeHero
// ---------------------------------------------------------------------------

export const AnimatedMarqueeHero: React.FC<AnimatedMarqueeHeroProps> = ({
  tagline: _tagline,
  title,
  description,
  ctaText,
  images,
  items,
  className,
  ctaHref = "/work",
  headingId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Torn top edge SVG paths (deterministic)
  const tornPaths = useMemo(() => buildTornTopPaths(42), []);
  // Scissor-cut paper swatch clip path for "work."
  const paperCutoutClip = useMemo(() => scissorCutClip(7, 4.2), []);

  // Pointer coordinates for parallax & live vector HUD
  const [pointer, setPointer] = useState({ x: 0, y: 0, px: 512, py: 284 });
  // Interactive click-to-slap stickers
  const [stickers, setStickers] = useState<SlappedSticker[]>(INITIAL_STICKERS);
  const nextStickerId = useRef(10);
  // Hovered card index in marquee
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1..1
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2; // -1..1
    setPointer({
      x: nx,
      y: ny,
      px: Math.round(e.clientX - rect.left),
      py: Math.round(e.clientY - rect.top),
    });
  }, []);

  const handleStageClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("a, button, [data-no-sticker]")) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = Math.max(7, Math.min(93, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(12, Math.min(86, ((e.clientY - rect.top) / rect.height) * 100));
    const id = nextStickerId.current++;
    const kind = STICKER_KINDS[id % STICKER_KINDS.length];
    const rot = Math.round((Math.random() - 0.5) * 32);
    const depth = (Math.random() > 0.5 ? 1 : -1) * (0.7 + Math.random() * 0.8);

    setStickers((prev) => [
      ...prev.slice(-11),
      { id, kind, x: xPct, y: yPct, rot, scale: 0.92 + Math.random() * 0.18, depth },
    ]);
  }, []);

  // Build enriched work items from `items` or `images`
  const workCards: MarqueeWorkItem[] = useMemo(() => {
    if (items && items.length > 0) return items;
    return images.map((src, idx) => {
      const meta = DEFAULT_WORK_CATALOG[idx % DEFAULT_WORK_CATALOG.length];
      return {
        id: `work-card-${idx}`,
        number: String(idx + 1).padStart(2, "0"),
        title: meta.title,
        category: meta.category,
        image: src,
        href: meta.href,
        accent: meta.accent,
        stamp: meta.stamp,
      };
    });
  }, [images, items]);

  const duplicatedCards = useMemo(
    () => [...workCards, ...workCards],
    [workCards]
  );

  // Scroll-velocity-coupled marquee drive
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 45,
    stiffness: 360,
  });
  const velocityFactor = useTransform(smoothVelocity, [-1800, 0, 1800], [-3.2, 0, 3.2]);
  const marqueeSkew = useTransform(smoothVelocity, [-1800, 0, 1800], [5, 0, -5]);

  // 3D Scroll Reveal Physics (Awwwards-style cylindrical contact-sheet unroll)
  const { scrollYProgress: enterProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "start 25%"],
  });
  const smoothEnter = useSpring(enterProgress, {
    stiffness: 85,
    damping: 24,
    restDelta: 0.001,
  });
  const sectionRotateX = useTransform(smoothEnter, [0, 1], [14, 0]);
  const sectionZ = useTransform(smoothEnter, [0, 1], [-60, 0]);
  const sectionScale = useTransform(smoothEnter, [0, 1], [0.94, 1]);
  const sectionOpacity = useTransform(smoothEnter, [0, 0.35, 1], [0.4, 0.85, 1]);

  const baseX = useMotionValue(0);
  useAnimationFrame((_t, delta) => {
    const dt = Math.min(delta, 64) / 1000;
    const hoverSlowdown = hoveredCard !== null ? 0.18 : 1;
    const vBoost = 1 + Math.min(3.5, Math.abs(velocityFactor.get()));
    // Move 2.2% of single-set width per second
    const next = baseX.get() - dt * 2.15 * hoverSlowdown * vBoost;
    baseX.set(next <= -50 ? next + 50 : next);
  });
  const marqueeX = useTransform(baseX, (v) => `${v}%`);

  const FADE_UP_SPRING = {
    hidden: { opacity: 0, y: 24, scale: 0.96 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 120, damping: 18 },
    },
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onClick={handleStageClick}
      className={cn(
        "relative w-full min-h-[105svh] overflow-hidden bg-[#080c12] text-[#f1efe7] flex flex-col items-center justify-between text-center px-4 pt-28 pb-16 md:pt-36 md:pb-24 select-none cursor-crosshair [perspective:1400px]",
        className
      )}
    >
      {/* 1. Procedural Torn-Paper Top Edge (seamless rip from ivory Manifesto above) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 right-0 w-full overflow-hidden leading-none z-20"
      >
        <svg
          viewBox="0 0 1440 84"
          preserveAspectRatio="none"
          className="w-full h-10 sm:h-14 md:h-20 block drop-shadow-[0_12px_18px_rgba(0,0,0,0.65)]"
        >
          <path d={tornPaths.paperFibre} fill="#ffffff" opacity="0.88" />
          <path d={tornPaths.ivorySheet} fill="#f1efe7" />
        </svg>
      </div>

      {/* 3D Cylindrical Contact-Sheet Unroll Canvas */}
      <motion.div
        style={{
          rotateX: sectionRotateX,
          z: sectionZ,
          scale: sectionScale,
          opacity: sectionOpacity,
          transformStyle: "preserve-3d",
        }}
        className="relative w-full flex flex-col items-center flex-1"
      >
        {/* 2. Blueprint Vector Grid & Ambient Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(86,118,255,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(86,118,255,0.22) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[28rem] rounded-full bg-[#1945f5]/18 blur-[140px]"
      />

      {/* 3. Top Corner Studio HUD Readouts (inspired by TypeRemixPreloader) */}
      <div
        aria-hidden="true"
        className="pointer-events-none relative z-20 w-full max-w-[1400px] mx-auto flex items-center justify-between px-2 sm:px-6 text-[11px] font-mono uppercase tracking-[0.2em] text-[#f1efe7]/50 mb-4"
      >
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#d8f03c] animate-pulse" />
          <span>ARCHIVE // REMIX BOARD 03</span>
        </span>
        <span className="hidden md:inline-flex items-center gap-2 text-[#f1efe7]/45">
          <MousePointerClick className="w-3.5 h-3.5 text-[#d8f03c]" />
          <span>CLICK ANYWHERE TO SLAP A STICKER ({stickers.length})</span>
        </span>
        <span className="tabular-nums">
          X:{String(pointer.px).padStart(4, "0")} · Y:{String(pointer.py).padStart(4, "0")}
        </span>
      </div>

      {/* 4. Interactive Click-to-Slap Die-Cut Stickers Layer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden z-10"
      >
        <AnimatePresence>
          {stickers.map((s) => {
            const dx = pointer.x * 18 * s.depth;
            const dy = pointer.y * 14 * s.depth;
            return (
              <motion.div
                key={s.id}
                initial={{ scale: 0, rotate: s.rot - 25, opacity: 0 }}
                animate={{
                  scale: s.scale,
                  rotate: s.rot,
                  opacity: 1,
                  x: dx,
                  y: dy,
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 340,
                  damping: 18,
                }}
                style={{
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 hidden sm:block"
              >
                <DieCutStickerSVG kind={s.kind} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* 5. Center Mixed-Media Typographic Stage */}
      <div className="relative z-20 flex flex-col items-center max-w-5xl mx-auto my-auto pt-4">
        {/* Mixed-Media Remix Headline: Vector Box ("SELECTED") + Scissor-Cut Swatch ("work.") */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } },
          }}
          className="relative px-4 py-3 sm:px-8 sm:py-5"
        >
          {/* Vector Tool Bounding Box & Bézier Control Handles */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 border border-[#5676ff]/70 bg-[#1945f5]/[0.04]"
          >
            {/* 4 Corner Anchor Nodes */}
            <span className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#f1efe7] border-2 border-[#1945f5]" />
            <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#f1efe7] border-2 border-[#1945f5]" />
            <span className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-[#f1efe7] border-2 border-[#1945f5]" />
            <span className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#f1efe7] border-2 border-[#1945f5]" />
            {/* Midpoint Anchor Nodes */}
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#d8f03c]" />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#d8f03c]" />

            {/* Top-left & Top-right Bézier Handles that flex with pointer */}
            <svg
              viewBox="0 0 600 180"
              className="absolute -top-10 left-0 w-full h-12 overflow-visible hidden md:block"
            >
              <line
                x1="10"
                y1="40"
                x2={70 + pointer.x * 22}
                y2={8 + pointer.y * 12}
                stroke="#d8f03c"
                strokeWidth="1.5"
              />
              <circle
                cx={70 + pointer.x * 22}
                cy={8 + pointer.y * 12}
                r="4.5"
                fill="#d8f03c"
              />
              <line
                x1="590"
                y1="40"
                x2={530 - pointer.x * 22}
                y2={10 - pointer.y * 12}
                stroke="#d8f03c"
                strokeWidth="1.5"
              />
              <circle
                cx={530 - pointer.x * 22}
                cy={10 - pointer.y * 12}
                r="4.5"
                fill="#d8f03c"
              />
            </svg>

            {/* Vector Dimension Label */}
            <span className="absolute -top-6 left-3 px-1.5 py-0.5 bg-[#1945f5] text-[#f1efe7] font-mono text-[10px] tracking-widest uppercase">
              PATH // SELECTED_WORK.SVG
            </span>

            {/* Floating Vector Pen Nib Cursor */}
            <motion.div
              animate={{
                x: pointer.x * 24,
                y: pointer.y * 16,
              }}
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
              className="absolute -bottom-6 -right-6 hidden sm:flex items-center gap-1.5 bg-[#d8f03c] text-[#080c12] px-2 py-0.5 rounded font-mono text-[10px] font-bold shadow-md"
            >
              <svg viewBox="0 0 16 16" className="w-3 h-3 fill-current">
                <path d="M2 1 L14 7 L8 9 L6 15 Z" />
              </svg>
              <span>PEN TOOL</span>
            </motion.div>
          </div>

          {/* Accessible Heading */}
          <h2
            id={headingId}
            className="relative z-10 flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-2 m-0 leading-none"
          >
            {/* Interactive Per-Letter Stretched Display Word ("SELECTED") */}
            <span className="inline-flex items-baseline font-display text-6xl sm:text-8xl md:text-9xl lg:text-[8.5rem] font-black uppercase tracking-[-0.04em] text-[#f1efe7]">
              {"SELECTED".split("").map((ch, idx) => (
                <motion.span
                  key={idx}
                  variants={FADE_UP_SPRING}
                  whileHover={{
                    y: -10,
                    rotate: idx % 2 === 0 ? -5 : 5,
                    color: "#d8f03c",
                  }}
                  transition={{ type: "spring", stiffness: 420, damping: 14 }}
                  className="inline-block cursor-pointer"
                >
                  {ch}
                </motion.span>
              ))}
            </span>

            {/* Scissor-Cut Paper Collage Swatch ("work.") */}
            <motion.span
              variants={FADE_UP_SPRING}
              whileHover={{ rotate: 2, scale: 1.04 }}
              className="relative inline-block -rotate-3 px-5 sm:px-7 py-1 sm:py-2 bg-[#f1efe7] text-[#080c12] shadow-[0_18px_40px_rgba(0,0,0,0.65)]"
              style={{ clipPath: paperCutoutClip }}
            >
              {/* Masking Tape Corner Strip */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-2.5 left-1/2 -translate-x-1/2 w-16 h-4 bg-[#d8f03c]/85 rotate-2 shadow-sm"
              />
              <em className="font-serif italic font-normal lowercase text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] text-[#1945f5] tracking-[-0.03em] leading-none block">
                work.
              </em>
            </motion.span>
          </h2>

          {/* Keep hidden prop reference if custom string title passed */}
          {typeof title === "string" && <span className="sr-only">{title}</span>}
        </motion.div>

        {/* Description */}
        <motion.p
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={FADE_UP_SPRING}
          className="mt-7 max-w-2xl font-sans text-base sm:text-lg text-[#f1efe7]/75 leading-relaxed"
        >
          {description}
        </motion.p>

        {/* Call to Action Button & Interactive Hint */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={FADE_UP_SPRING}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <ActionButton href={ctaHref}>{ctaText}</ActionButton>
        </motion.div>
      </div>

      {/* 6. Velocity-Coupled 3D Art-Director Contact-Sheet Marquee */}
      <div
        data-no-sticker
        className="relative z-20 mt-14 md:mt-20 w-full pt-6 pb-8 [mask-image:linear-gradient(to_right,transparent,black_7%,black_93%,transparent)]"
      >
        <motion.div
          style={{ x: marqueeX, skewX: marqueeSkew }}
          className="flex items-center gap-7 sm:gap-9 w-max px-6"
        >
          {duplicatedCards.map((card, index) => {
            const baseTilt = index % 3 === 0 ? -3.2 : index % 3 === 1 ? 2.8 : -1.6;
            const isHovered = hoveredCard === index;

            return (
              <motion.article
                key={`${card.id || card.number}-${index}`}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                animate={{
                  rotate: isHovered ? 0 : baseTilt,
                  y: isHovered ? -18 : index % 2 === 0 ? -4 : 6,
                  scale: isHovered ? 1.06 : 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 320,
                  damping: 22,
                }}
                className="relative w-64 sm:w-72 md:w-80 flex-shrink-0 group cursor-pointer"
              >
                <Link
                  to={card.href}
                  aria-label={`${card.title} — ${card.category}`}
                  className="block focus:outline-none"
                >
                  {/* Translucent Masking Tape Strip at Top of Proof Card */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 z-30 w-24 h-5 bg-[#f1efe7]/75 rotate-[-2deg] shadow-sm border-x border-dashed border-[#080c12]/30"
                  />

                  {/* Tactile Proof Dossier Frame */}
                  <div
                    className={cn(
                      "relative rounded-2xl bg-[#f1efe7] text-[#080c12] p-3 pb-4 shadow-[0_28px_60px_rgba(0,0,0,0.75)] border-2 transition-colors duration-300",
                      isHovered ? "border-[#d8f03c]" : "border-[#f1efe7]"
                    )}
                  >
                    {/* Proof Header Bar */}
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#080c12]/15 font-mono text-[10px] tracking-[0.16em] uppercase text-[#080c12]/70">
                      <span className="font-bold text-[#080c12]">
                        PROOF // {card.number}
                      </span>
                      <span>{card.stamp}</span>
                    </div>

                    {/* Artwork Frame */}
                    <div className="relative aspect-[4/4] w-full overflow-hidden rounded-xl bg-[#080c12]">
                      <img
                        src={card.image}
                        alt={card.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#080c12]/80 via-transparent to-transparent" />

                      {/* Scissor-Cut Category Sticker inside Image */}
                      <span
                        className="absolute top-2.5 left-2.5 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#080c12] shadow-md"
                        style={{
                          backgroundColor: card.accent || "#d8f03c",
                          clipPath: scissorCutClip(index + 3, 4),
                        }}
                      >
                        {card.category}
                      </span>

                      {/* Pop-out Die-Cut "OPEN STUDY ↗" Sticker on Hover */}
                      <motion.div
                        initial={false}
                        animate={{
                          scale: isHovered ? 1 : 0.75,
                          opacity: isHovered ? 1 : 0,
                          rotate: isHovered ? -6 : 12,
                        }}
                        transition={{ type: "spring", stiffness: 380, damping: 20 }}
                        className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-[#d8f03c] text-[#080c12] border-2 border-[#080c12] font-mono text-[10px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1"
                      >
                        <span>OPEN STUDY</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </motion.div>
                    </div>

                    {/* Proof Footer Title & Index */}
                    <div className="mt-3 flex items-baseline justify-between gap-2 text-left px-1">
                      <div>
                        <div
                          role="heading"
                          aria-level={3}
                          className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#080c12] leading-none m-0"
                        >
                          {card.title}
                        </div>
                        <span className="font-serif italic text-base text-[#1945f5] block mt-0.5 leading-tight">
                          Inspiring Wave · Case Study
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#080c12]/45">
                        +{card.number}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </motion.div>
  </div>
);
};
