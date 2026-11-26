import { MutableRefObject, useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  INSTALLATION_MOTION,
  INSTALLATION_ORDER,
  InstallationSlug,
  lerp,
  segment,
  smoothstep,
} from './services-motion';
import { adaptiveQuality } from '@/lib/performance/AdaptiveQuality';
import { sceneMetricsRegistry } from '@/lib/performance/SceneMetricsRegistry';

export interface SceneMetrics {
  camera: [number, number, number];
  rendering: boolean;
  errors: string[];
  drawCalls: number;
  triangles: number;
}

export interface ServicesRuntime {
  progress: number;
  manual: boolean;
  applyScene?: (progress: number) => void;
  metrics: SceneMetrics;
}

interface SceneGroup {
  root: THREE.Group;
  backing: THREE.Group;
  sculpture: THREE.Group;
  details: THREE.Group;
  initialQuaternion: THREE.Quaternion;
  finalQuaternion: THREE.Quaternion;
}

function material(color: number, opacity = 1, metalness = 0.05) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.72,
    metalness,
    transparent: opacity < 1,
    opacity,
  });
}

function addBacking(group: THREE.Group, color: number) {
  const slab = new THREE.Mesh(new THREE.BoxGeometry(2.75, 2.12, 0.16), material(color, 0.2));
  slab.receiveShadow = true;
  group.add(slab);
}

function addStrategy(group: THREE.Group) {
  const globe = new THREE.Mesh(new THREE.SphereGeometry(0.65, 24, 16), material(0x102046, 0.28, 0.15));
  globe.castShadow = true;
  group.add(globe);
  const ringMaterial = material(0xd6d2c7, 0.42, 0.5);
  [0.88, 1.05].forEach((radius, index) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.035, 8, 48), ringMaterial);
    ring.rotation.set(Math.PI * (0.36 + index * 0.12), index ? -0.3 : 0.25, index ? 0.6 : -0.25);
    group.add(ring);
  });
}

function addPortal(group: THREE.Group) {
  const portalMaterial = material(0xf1eee5, 0.3, 0.15);
  for (let index = 0; index < 4; index++) {
    const frame = new THREE.Group();
    const width = 1.7 - index * 0.25;
    const height = 1.65 - index * 0.22;
    const thickness = 0.08;
    const depth = index * -0.2;
    const top = new THREE.Mesh(new THREE.BoxGeometry(width, thickness, 0.1), portalMaterial);
    const left = new THREE.Mesh(new THREE.BoxGeometry(thickness, height, 0.1), portalMaterial);
    const right = left.clone();
    top.position.y = height / 2;
    left.position.x = -width / 2;
    right.position.x = width / 2;
    frame.add(top, left, right);
    frame.position.z = depth;
    frame.userData.offset = index;
    group.add(frame);
  }
}

function addInterface(group: THREE.Group) {
  [0, 1, 2].forEach((index) => {
    const sheet = new THREE.Mesh(
      new THREE.BoxGeometry(1.45, 1.05, 0.035),
      material(index === 1 ? 0x2041f5 : 0xf8f1df, index === 1 ? 0.2 : 0.24),
    );
    sheet.position.set(index * 0.18 - 0.18, index * 0.12 - 0.12, index * 0.22);
    sheet.rotation.z = (index - 1) * 0.08;
    sheet.userData.offset = index;
    group.add(sheet);
  });
}

function addSocial(group: THREE.Group) {
  [0, 1, 2].forEach((index) => {
    const print = new THREE.Mesh(new THREE.BoxGeometry(0.62, 1.05, 0.04), material(0xf1eee5, 0.28));
    print.position.set((index - 1) * 0.52, index * 0.08, index * 0.1);
    print.rotation.z = (index - 1) * 0.16;
    print.userData.offset = index;
    group.add(print);
  });
}

function addMobile(group: THREE.Group) {
  const phone = new THREE.Mesh(new THREE.BoxGeometry(0.76, 1.55, 0.16), material(0x2041f5, 0.3, 0.25));
  phone.castShadow = true;
  phone.userData.phone = true;
  group.add(phone);
  const ribbon = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.055, 8, 56), material(0xa7b1d0, 0.5, 0.7));
  ribbon.rotation.x = Math.PI * 0.58;
  group.add(ribbon);
}

function addSoftware(group: THREE.Group) {
  const geometry = new THREE.BoxGeometry(0.32, 0.32, 0.32);
  const cubes = new THREE.InstancedMesh(geometry, material(0x2041f5, 0.26), 9);
  const dummy = new THREE.Object3D();
  for (let index = 0; index < 9; index++) {
    dummy.position.set((index % 3 - 1) * 0.45, (Math.floor(index / 3) - 1) * 0.45, (index % 2) * 0.16);
    dummy.updateMatrix();
    cubes.setMatrixAt(index, dummy.matrix);
  }
  cubes.instanceMatrix.needsUpdate = true;
  group.add(cubes);
}

function makeInstallation(slug: InstallationSlug) {
  const root = new THREE.Group();
  const backing = new THREE.Group();
  const sculpture = new THREE.Group();
  const details = new THREE.Group();
  addBacking(backing, slug === 'web-development' ? 0x2041f5 : slug === 'software-development' ? 0x102046 : 0xf1eee5);
  if (slug === 'digital-strategy') addStrategy(sculpture);
  else if (slug === 'web-development') addPortal(sculpture);
  else if (slug === 'ui-ux-design') addInterface(sculpture);
  else if (slug === 'social-media') addSocial(sculpture);
  else if (slug === 'mobile-app-development') addMobile(sculpture);
  else addSoftware(sculpture);
  root.add(backing, sculpture, details);
  const motion = INSTALLATION_MOTION[slug];
  return {
    root,
    backing,
    sculpture,
    details,
    initialQuaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler(...motion.initial.rotation)),
    finalQuaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler(...motion.final.rotation)),
  } satisfies SceneGroup;
}

export function ServicesThreeScene({
  runtimeRef,
  onMetrics,
}: {
  runtimeRef: MutableRefObject<ServicesRuntime>;
  onMetrics?: (metrics: SceneMetrics) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const profile = adaptiveQuality.getProfile();
    const isSmall = window.innerWidth < 960;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: profile.antialias,
        stencil: false,
        precision: profile.precision,
        powerPreference: isSmall ? 'default' : 'high-performance',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      runtimeRef.current.metrics.errors.push(message);
      onMetrics?.({ ...runtimeRef.current.metrics });
      return;
    }
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = profile.shadowsEnabled;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(isSmall ? 46 : 42, 1, 0.1, 80);
    camera.position.set(isSmall ? 0.25 : 0.6, 0.2, isSmall ? 16.5 : 14.2);
    const ambient = new THREE.HemisphereLight(0xfff8e9, 0x102046, 1.35);
    const sun = new THREE.DirectionalLight(0xffffff, 3.2);
    sun.position.set(-4, 7, 8);
    sun.castShadow = profile.shadowsEnabled;
    sun.shadow.mapSize.set(profile.shadowMapSize, profile.shadowMapSize);
    scene.add(ambient, sun);

    const groups = new Map<InstallationSlug, SceneGroup>();
    INSTALLATION_ORDER.forEach((slug) => {
      const installation = makeInstallation(slug);
      groups.set(slug, installation);
      scene.add(installation.root);
    });

    let currentW = 1;
    let currentH = 1;
    let currentDpr = 1;
    let resizeRaf = 0;
    const isDebug =
      typeof window !== 'undefined' &&
      (new URLSearchParams(window.location.search).get('debugPerformance') === '1' ||
        new URLSearchParams(window.location.search).has('services-debug'));

    const resize = (force = false) => {
      const width = Math.max(1, canvas.clientWidth || window.innerWidth);
      const height = Math.max(1, canvas.clientHeight || window.innerHeight);
      if (!force && Math.abs(width - currentW) <= 2 && Math.abs(height - currentH) < 120) {
        return;
      }
      currentW = width;
      currentH = height;
      currentDpr = adaptiveQuality.getEffectiveDpr(width, height);
      renderer.setPixelRatio(currentDpr);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.fov = width < 960 ? 46 : 42;
      camera.updateProjectionMatrix();
      runtimeRef.current.applyScene?.(runtimeRef.current.progress);
    };
    const scheduleResize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => resize(false));
    };

    if (typeof renderer.compileAsync === 'function') {
      void renderer.compileAsync(scene, camera).catch(() => {});
    }

    const render = (progress: number) => {
      INSTALLATION_ORDER.forEach((slug) => {
        const motion = INSTALLATION_MOTION[slug];
        const group = groups.get(slug)!;
        const rootT = smoothstep(segment(progress, motion.start, motion.end));
        const sculptureT = smoothstep(segment(progress, motion.sculptureStart, motion.sculptureEnd));
        group.root.position.set(
          lerp(motion.initial.position[0], motion.final.position[0], rootT),
          lerp(motion.initial.position[1], motion.final.position[1], rootT),
          lerp(motion.initial.position[2], motion.final.position[2], rootT),
        );
        group.root.scale.setScalar(lerp(motion.initial.scale, motion.final.scale, rootT));
        group.root.quaternion.slerpQuaternions(group.initialQuaternion, group.finalQuaternion, rootT);
        group.backing.scale.set(lerp(0.58, 1, rootT), lerp(0.12, 1, rootT), 1);
        group.sculpture.position.z = lerp(-1.8, 0.42, sculptureT);
        group.sculpture.rotation.y = lerp(-0.55, 0, sculptureT);
        group.sculpture.scale.setScalar(lerp(0.55, 1, sculptureT));
        group.sculpture.children.forEach((child, index) => {
          if (slug === 'web-development') child.position.z = lerp(-0.08, -index * 0.2, sculptureT);
          if (slug === 'social-media') child.position.y = lerp(-1.3, index * 0.08, sculptureT);
          if (slug === 'mobile-app-development' && child.userData.phone) child.rotation.y = lerp(0.9, 0.08, sculptureT);
        });
      });
      const assembly = smoothstep(segment(progress, 0.08, 0.7));
      const exit = smoothstep(segment(progress, 0.84, 1));
      const zBase = currentW < 960 ? 16.5 : 14.2;
      const zEnd = currentW < 960 ? 14.0 : 11.8;
      camera.position.set(lerp(0.6, 0.15, assembly), lerp(0.25, -0.15, exit), lerp(zBase, zEnd, assembly) - exit * 2.1);
      camera.lookAt(currentW < 960 ? 0.25 : 0.65, lerp(0, -1.2, exit), 0);
      renderer.render(scene, camera);
      if (isDebug) {
        canvas.dataset.rendering = 'true';
        canvas.dataset.progress = progress.toFixed(4);
        canvas.dataset.camera = [camera.position.x, camera.position.y, camera.position.z].map((value) => value.toFixed(3)).join(',');
        canvas.dataset.drawCalls = String(renderer.info.render.calls);
        canvas.dataset.triangles = String(renderer.info.render.triangles);
      }
      sceneMetricsRegistry.update({
        id: 'services-3d',
        active: true,
        drawCalls: renderer.info.render.calls,
        triangles: renderer.info.render.triangles,
        geometries: renderer.info.memory.geometries,
        textures: renderer.info.memory.textures,
        width: canvas.width,
        height: canvas.height,
        dpr: currentDpr,
      });
      if (onMetrics) {
        runtimeRef.current.metrics = {
          camera: [camera.position.x, camera.position.y, camera.position.z],
          rendering: true,
          errors: runtimeRef.current.metrics.errors,
          drawCalls: renderer.info.render.calls,
          triangles: renderer.info.render.triangles,
        };
        onMetrics({ ...runtimeRef.current.metrics });
      }
    };
    runtimeRef.current.applyScene = render;
    resize(true);
    const ro = new ResizeObserver(scheduleResize);
    ro.observe(canvas);
    const unsubQuality = adaptiveQuality.subscribe((nextProfile) => {
      renderer.shadowMap.enabled = nextProfile.shadowsEnabled;
      sun.castShadow = nextProfile.shadowsEnabled;
      resize(true);
    });

    return () => {
      cancelAnimationFrame(resizeRaf);
      unsubQuality();
      ro.disconnect();
      sceneMetricsRegistry.remove('services-3d');
      delete runtimeRef.current.applyScene;
      delete canvas.dataset.rendering;
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        mesh.geometry?.dispose();
        const materials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
        materials.forEach((item) => item.dispose());
      });
      renderer.dispose();
    };
  }, [onMetrics, runtimeRef]);

  return <canvas ref={canvasRef} className="iw-three-canvas" aria-hidden="true" />;
}
