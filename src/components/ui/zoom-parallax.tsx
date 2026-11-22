'use client';

import React, { useRef, useMemo } from 'react';
import { useScroll, useTransform, useSpring, motion } from 'framer-motion';
import { Sparkles, Maximize2 } from 'lucide-react';

export interface Image {
	src: string;
	alt?: string;
	video?: boolean;
	tag?: string;
	code?: string;
}

export interface ZoomParallaxProps {
	/** Array of images to be displayed in the parallax effect max 7 images */
	images: Image[];
}

const LAYER_META = [
	{ code: 'LAYER 01 // CORE FOCUS', tag: 'IMPACT IN MOTION', accent: '#d8f03c' },
	{ code: 'LAYER 02 // SPATIAL', tag: 'DIGITAL ARCHITECTURE', accent: '#1945f5' },
	{ code: 'LAYER 03 // KINETIC', tag: 'OCEAN DYNAMICS', accent: '#ff4f5e' },
	{ code: 'LAYER 04 // SYSTEM', tag: 'MONOLITHIC FORM', accent: '#5676ff' },
	{ code: 'LAYER 05 // TEXTURE', tag: 'SURFACE RHYTHM', accent: '#d8f03c' },
	{ code: 'LAYER 06 // HORIZON', tag: 'ATMOSPHERIC DEPTH', accent: '#1945f5' },
	{ code: 'LAYER 07 // STUDIO', tag: 'LIGHT & CRAFT', accent: '#ff4f5e' },
];

const LAYER_POSITIONS = [
	// 0: Center Hero Frame (expands 1x -> 4x to fill viewport)
	'z-20 [&>div]:!h-[28vh] [&>div]:!w-[28vw] max-sm:[&>div]:!h-[26vh] max-sm:[&>div]:!w-[54vw]',
	// 1: Top-Center-Right
	'z-10 [&>div]:!-top-[30vh] [&>div]:!left-[6vw] [&>div]:!h-[28vh] [&>div]:!w-[32vw] max-sm:[&>div]:!-top-[28vh] max-sm:[&>div]:!left-[14vw] max-sm:[&>div]:!h-[20vh] max-sm:[&>div]:!w-[44vw]',
	// 2: Left Tall Portrait
	'z-10 [&>div]:!-top-[8vh] [&>div]:!-left-[26vw] [&>div]:!h-[42vh] [&>div]:!w-[20vw] max-sm:[&>div]:!-top-[10vh] max-sm:[&>div]:!-left-[28vw] max-sm:[&>div]:!h-[28vh] max-sm:[&>div]:!w-[34vw]',
	// 3: Right Landscape
	'z-10 [&>div]:!-top-[2vh] [&>div]:!left-[28vw] [&>div]:!h-[25vh] [&>div]:!w-[24vw] max-sm:[&>div]:!left-[28vw] max-sm:[&>div]:!h-[20vh] max-sm:[&>div]:!w-[36vw]',
	// 4: Bottom Center-Right
	'z-10 [&>div]:!top-[28vh] [&>div]:!left-[6vw] [&>div]:!h-[24vh] [&>div]:!w-[20vw] max-sm:[&>div]:!top-[26vh] max-sm:[&>div]:!left-[12vw] max-sm:[&>div]:!h-[18vh] max-sm:[&>div]:!w-[36vw]',
	// 5: Bottom Left Wide
	'z-10 [&>div]:!top-[28vh] [&>div]:!-left-[23vw] [&>div]:!h-[24vh] [&>div]:!w-[28vw] max-sm:[&>div]:!top-[25vh] max-sm:[&>div]:!-left-[24vw] max-sm:[&>div]:!h-[18vh] max-sm:[&>div]:!w-[42vw]',
	// 6: Bottom Far Right Compact
	'z-10 [&>div]:!top-[24vh] [&>div]:!left-[26vw] [&>div]:!h-[16vh] [&>div]:!w-[16vw] max-sm:[&>div]:!top-[22vh] max-sm:[&>div]:!left-[28vw] max-sm:[&>div]:!h-[14vh] max-sm:[&>div]:!w-[28vw]',
];

export function ZoomParallax({ images }: ZoomParallaxProps) {
	const container = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({
		target: container,
		offset: ['start start', 'end end'],
	});

	// Smooth spring-damped progress eliminates wheel-step jitter and runs at locked 60fps
	const smoothProgress = useSpring(scrollYProgress, {
		stiffness: 140,
		damping: 28,
		mass: 0.25,
	});

	const scale4 = useTransform(smoothProgress, [0, 1], [1, 4]);
	const scale5 = useTransform(smoothProgress, [0, 1], [1, 5]);
	const scale6 = useTransform(smoothProgress, [0, 1], [1, 6]);
	const scale8 = useTransform(smoothProgress, [0, 1], [1, 8]);
	const scale9 = useTransform(smoothProgress, [0, 1], [1, 9]);

	const hudOpacity = useTransform(smoothProgress, [0, 0.72, 0.95], [1, 0.85, 0]);
	const zoomReadout = useTransform(smoothProgress, (v) => `${(1 + v * 3).toFixed(2)}x`);
	const progressBarWidth = useTransform(smoothProgress, (v) => `${Math.round(v * 100)}%`);

	const scales = useMemo(
		() => [scale4, scale5, scale6, scale5, scale6, scale8, scale9],
		[scale4, scale5, scale6, scale8, scale9]
	);

	return (
		<div ref={container} className="relative h-[260vh] w-full select-none">
			<div className="sticky top-0 h-screen w-full overflow-hidden bg-[#030506]">
				{/* Blueprint perspective grid & radial vignette */}
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 opacity-[0.14]"
					style={{
						backgroundImage:
							'linear-gradient(to right, rgba(86,118,255,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(86,118,255,0.22) 1px, transparent 1px)',
						backgroundSize: '64px 64px',
					}}
				/>
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(25,69,245,0.16),transparent_65%)]"
				/>

				{/* Top Spatial Telemetry HUD Bar */}
				<motion.div
					style={{ opacity: hudOpacity }}
					aria-hidden="true"
					className="pointer-events-none absolute top-20 left-6 right-6 sm:left-12 sm:right-12 z-30 flex items-center justify-between font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-[#f1efe7]/70"
				>
					<div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-black/65 backdrop-blur-md border border-white/15">
						<span className="w-2 h-2 rounded-full bg-[#d8f03c] animate-pulse" />
						<span>OPTICAL RIG // 07 DIMENSIONS</span>
					</div>
					<div className="hidden md:flex items-center gap-4 px-3.5 py-1.5 rounded-full bg-black/65 backdrop-blur-md border border-white/15">
						<span>7-LAYER PARALLAX FIELD</span>
						<span className="text-white/25">|</span>
						<span className="text-[#d8f03c] font-bold flex items-center gap-1.5">
							<Maximize2 className="w-3 h-3" />
							<span>ZOOM: </span>
							<motion.span>{zoomReadout}</motion.span>
						</span>
					</div>
				</motion.div>

				{/* 7 Zoom Parallax Layers */}
				{images.slice(0, 7).map(({ src, alt, tag, code }, index) => {
					const scale = scales[index % scales.length];
					const meta = LAYER_META[index % LAYER_META.length];
					const posClass = LAYER_POSITIONS[index % LAYER_POSITIONS.length];
					const isCenter = index === 0;

					return (
						<motion.div
							key={index}
							style={{ scale }}
							className={`absolute top-0 left-0 flex h-full w-full items-center justify-center will-change-transform ${posClass}`}
						>
							<div
								className={`relative h-[25vh] w-[25vw] overflow-hidden rounded-xl shadow-[0_24px_60px_rgba(0,0,0,0.85)] ${
									isCenter
										? 'border-2 border-[#d8f03c]/85 ring-4 ring-[#1945f5]/25'
										: 'border border-white/20'
								} bg-[#080c12]`}
							>
								<img
									src={src || '/assets/hero/barrel.webp'}
									alt={alt || `Parallax layer ${index + 1}`}
									loading={index < 3 ? 'eager' : 'lazy'}
									decoding="async"
									className="h-full w-full object-cover"
								/>

								{/* Subtle dark gradient for badge legibility */}
								<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

								{/* Top-left layer index tag */}
								<motion.div
									style={{ opacity: hudOpacity }}
									className="pointer-events-none absolute top-2 left-2 right-2 flex items-center justify-between gap-1 font-mono text-[8px] sm:text-[9px] uppercase tracking-wider"
								>
									<span
										className="px-1.5 py-0.5 rounded font-bold text-[#080a0b] truncate"
										style={{ backgroundColor: meta.accent }}
									>
										{code || meta.code}
									</span>
									{isCenter && (
										<span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/75 text-[#f1efe7] border border-white/15">
											<Sparkles className="w-2.5 h-2.5 text-[#d8f03c]" />
											<span>PRIMARY</span>
										</span>
									)}
								</motion.div>

								{/* Bottom caption inside each card */}
								<motion.div
									style={{ opacity: hudOpacity }}
									className="pointer-events-none absolute bottom-2 left-2.5 right-2.5 flex items-end justify-between text-left"
								>
									<span className="font-display text-xs sm:text-sm font-bold uppercase tracking-tight text-[#f1efe7] drop-shadow truncate">
										{tag || meta.tag}
									</span>
									<span className="font-mono text-[8px] text-white/60">
										0{index + 1}
									</span>
								</motion.div>
							</div>
						</motion.div>
					);
				})}

				{/* Bottom Progress Rail */}
				<motion.div
					style={{ opacity: hudOpacity }}
					aria-hidden="true"
					className="pointer-events-none absolute bottom-7 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 w-64 sm:w-80"
				>
					<div className="w-full flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-[#f1efe7]/70">
						<span>DEPTH EXPANSION</span>
						<motion.span className="text-[#d8f03c] font-bold">{zoomReadout}</motion.span>
					</div>
					<div className="w-full h-1 rounded-full bg-white/15 overflow-hidden">
						<motion.span
							style={{ width: progressBarWidth }}
							className="block h-full bg-[#d8f03c] rounded-full"
						/>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
