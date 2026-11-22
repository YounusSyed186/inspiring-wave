'use client';
import React from 'react';
import Lenis from '@studio-freight/lenis';
import { ZoomParallax, Image } from '@/components/ui/zoom-parallax';
import { AnimatedMarqueeHero } from '@/components/ui/hero-3';

export const DEMO_IMAGES = [
	'/assets/dimensions/dim-01-core.jpg',
	'/assets/dimensions/dim-02-spatial.jpg',
	'/assets/dimensions/dim-03-kinetic.jpg',
	'/assets/dimensions/dim-04-system.jpg',
	'/assets/dimensions/dim-05-texture.jpg',
	'/assets/dimensions/dim-06-horizon.jpg',
	'/assets/dimensions/dim-07-perspective.jpg',
	'/assets/process/process-sculpture.webp',
];

export const AnimatedHeroDemo = () => {
	return (
		<AnimatedMarqueeHero
			tagline="03 / SELECTED WORK — CONCEPT & CAPABILITY STUDIES"
			title={
				<>
					Selected <em className="font-serif italic font-normal text-[#5676ff] lowercase">work.</em>
				</>
			}
			description="Digital products, brand identities, and high-performance web platforms crafted for clarity, cultural momentum, and measurable business impact."
			ctaText="View All Work"
			ctaHref="/work"
			images={DEMO_IMAGES}
		/>
	);
};

export const zoomParallaxImages: Image[] = [
	{
		src: '/assets/dimensions/dim-01-core.jpg',
		alt: 'Sculptural liquid obsidian wave with electric cobalt glass ribbons and acid-lime light filaments',
		code: 'LAYER 01 // CORE FOCUS',
		tag: 'IMPACT IN MOTION',
	},
	{
		src: '/assets/dimensions/dim-02-spatial.jpg',
		alt: 'Brutalist concrete and translucent cobalt-blue acrylic pavilions over reflective water',
		code: 'LAYER 02 // SPATIAL',
		tag: 'DIGITAL ARCHITECTURE',
	},
	{
		src: '/assets/dimensions/dim-03-kinetic.jpg',
		alt: 'Tactile darkroom flat-lay of torn ivory risograph prints, acid-lime stickers, and chrome sculpture',
		code: 'LAYER 03 // KINETIC',
		tag: 'PRINT & TYPOGRAPHY',
	},
	{
		src: '/assets/dimensions/dim-04-system.jpg',
		alt: 'Zero-gravity kinetic sculpture of matte carbon rings, cobalt optical fibers, and ivory spheres',
		code: 'LAYER 04 // SYSTEM',
		tag: 'SYSTEMS IN MOTION',
	},
	{
		src: '/assets/dimensions/dim-05-texture.jpg',
		alt: 'Billowing metallic cobalt-blue and studio-ivory silk folds with acid-lime highlights',
		code: 'LAYER 05 // TEXTURE',
		tag: 'SURFACE RHYTHM',
	},
	{
		src: '/assets/dimensions/dim-06-horizon.jpg',
		alt: 'Moonlit volcanic coastline with a bioluminescent cobalt wave and geometric light portal',
		code: 'LAYER 06 // HORIZON',
		tag: 'ATMOSPHERIC DEPTH',
	},
	{
		src: '/assets/dimensions/dim-07-perspective.jpg',
		alt: 'Symmetrical architectural light-tunnel of ivory concrete and cobalt glass frames',
		code: 'LAYER 07 // PERSPECTIVE',
		tag: 'SPATIAL CLARITY',
	},
];

export default function DefaultDemo() {
	React.useEffect(() => {
		const lenis = new Lenis();

		function raf(time: number) {
			lenis.raf(time);
			requestAnimationFrame(raf);
		}

		const animId = requestAnimationFrame(raf);
		return () => {
			cancelAnimationFrame(animId);
			lenis.destroy();
		};
	}, []);

	return (
		<main className="min-h-screen w-full">
			<AnimatedHeroDemo />
			<ZoomParallax images={zoomParallaxImages} />
		</main>
	);
}
