'use client';
import React from 'react';
import { cn } from '@/lib/utils';
import Lenis from '@studio-freight/lenis';
import { ZoomParallax, Image } from '@/components/ui/zoom-parallax';

export const zoomParallaxImages: Image[] = [
	{
		src: '/assets/hero/oceans.mp4',
		alt: 'Cinematic rolling barrel wave in fluid motion',
		video: true,
	},
	{
		src: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
		alt: 'Minimalist geometric architecture',
	},
	{
		src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
		alt: 'Ocean waves and coastal energy',
	},
	{
		src: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
		alt: 'Urban monolithic glass reflection',
	},
	{
		src: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
		alt: 'Minimalist desert ripples in motion',
	},
	{
		src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
		alt: 'Atmospheric natural horizon',
	},
	{
		src: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
		alt: 'Curated studio light and form',
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
			<div className="relative flex h-[50vh] items-center justify-center">
				{/* Radial spotlight */}
				<div
					aria-hidden="true"
					className={cn(
						'pointer-events-none absolute -top-1/2 left-1/2 h-[120vmin] w-[120vmin] -translate-x-1/2 rounded-full',
						'bg-[radial-gradient(ellipse_at_center,rgba(25,69,245,0.2),transparent_50%)]',
						'blur-[30px]',
					)}
				/>
				<h1 className="text-center text-4xl font-bold">
					Scroll Down for Zoom Parallax
				</h1>
			</div>
			<ZoomParallax images={zoomParallaxImages} />
			<div className="h-[50vh]" />
		</main>
	);
}
