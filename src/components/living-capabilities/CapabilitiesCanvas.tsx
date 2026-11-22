/**
 * Living Capabilities – Three.js Canvas Renderer
 *
 * Sets up WebGLRenderer, PMREM studio environment, camera, scene, and animation loop.
 * Accepts scroll progress and theme from parent and updates camera + animations.
 */
import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { buildCapabilitiesScene, type SceneResult } from './scene';
import { updateCamera, animateCollage } from './animations';
import { DESKTOP_MIN } from './config';
import type { CapabilitiesTheme } from './types';

interface Props {
  progress: number;
  theme: CapabilitiesTheme;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function CapabilitiesCanvas({ progress, theme, containerRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<SceneResult | null>(null);
  const rafRef = useRef<number>(0);
  const progressRef = useRef(progress);
  const clockRef = useRef(new THREE.Clock());

  progressRef.current = progress;

  const resize = useCallback(() => {
    const renderer = rendererRef.current;
    const camera = cameraRef.current;
    const container = containerRef.current;
    if (!renderer || !camera || !container) return;

    const w = container.clientWidth;
    const h = container.clientHeight;
    const dpr = Math.min(window.devicePixelRatio, 2);
    renderer.setSize(w, h);
    renderer.setPixelRatio(dpr);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }, [containerRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const isDesktop = window.innerWidth >= DESKTOP_MIN;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isDesktop || reducedMotion) return;

    // Camera setup - wide angle 42deg for cinematic editorial composition
    const camera = new THREE.PerspectiveCamera(42, container.clientWidth / container.clientHeight, 0.1, 100);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    // Build editorial collage scene
    const sceneResult = buildCapabilitiesScene(renderer, theme);
    sceneRef.current = sceneResult;

    resize();

    // Animation loop
    const clock = clockRef.current;
    clock.start();

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const p = progressRef.current;

      updateCamera(camera, p);
      animateCollage(sceneResult, time, p);
      renderer.render(sceneResult.scene, camera);
    };
    rafRef.current = requestAnimationFrame(animate);

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      sceneResult.dispose();
      renderer.dispose();
    };
  }, [theme, resize, containerRef]);

  return <canvas ref={canvasRef} className="lc-canvas" aria-hidden="true" />;
}
