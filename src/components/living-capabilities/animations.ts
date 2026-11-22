/**
 * Living Capabilities – Dynamic Animation System
 *
 * Handles per-frame animation and camera tracking:
 * - CatmullRom camera spline evaluation on scroll progress
 * - Continuous organic rotations, floating bobs, and glow pulses
 */
import * as THREE from 'three';
import { CAMERA_PATH, STATIONS } from './config';

/* ── Camera Spline ───────────────────────────────────────────────── */

const posPoints = CAMERA_PATH.map((k) => new THREE.Vector3(...k.position));
const lookPoints = CAMERA_PATH.map((k) => new THREE.Vector3(...k.lookAt));
const progressValues = CAMERA_PATH.map((k) => k.progress);

const posSpline = new THREE.CatmullRomCurve3(posPoints, false, 'centripetal', 0.4);
const lookSpline = new THREE.CatmullRomCurve3(lookPoints, false, 'centripetal', 0.4);

function progressToSplineT(progress: number): number {
  if (progress <= progressValues[0]) return 0;
  if (progress >= progressValues[progressValues.length - 1]) return 1;

  for (let i = 1; i < progressValues.length; i++) {
    if (progress <= progressValues[i]) {
      const segP = (progress - progressValues[i - 1]) / (progressValues[i] - progressValues[i - 1]);
      const tStart = (i - 1) / (progressValues.length - 1);
      const tEnd = i / (progressValues.length - 1);
      return tStart + segP * (tEnd - tStart);
    }
  }
  return 1;
}

const _cameraPos = new THREE.Vector3();
const _lookAt = new THREE.Vector3();

export function updateCamera(camera: THREE.PerspectiveCamera, progress: number) {
  const t = progressToSplineT(progress);
  posSpline.getPoint(t, _cameraPos);
  lookSpline.getPoint(t, _lookAt);
  camera.position.copy(_cameraPos);
  camera.lookAt(_lookAt);
}

/* ── Active Station ──────────────────────────────────────────────── */

export function getActiveStation(progress: number): number {
  for (let i = STATIONS.length - 1; i >= 0; i--) {
    if (progress >= STATIONS[i].scrollRange[0]) return i;
  }
  return 0;
}

/* ── Per-Frame Sculptural Animations ─────────────────────────────── */

export function animateStations(group: THREE.Group, time: number, _progress: number) {
  // Station 01: Network sphere spins and core pulses
  const sphere = group.getObjectByName('st01-sphere');
  if (sphere) {
    sphere.rotation.y = time * 0.18;
    sphere.rotation.x = Math.sin(time * 0.12) * 0.08;
  }
  const core = group.getObjectByName('st01-core');
  if (core && core instanceof THREE.Mesh) {
    core.rotation.y = -time * 0.14;
    const m = core.material as THREE.MeshStandardMaterial;
    m.emissiveIntensity = 1.2 + Math.sin(time * 2.5) * 0.35;
  }

  // Station 02: Screen glow pulse
  const s2Screen = group.getObjectByName('st02-screen');
  if (s2Screen && s2Screen instanceof THREE.Mesh) {
    const m = s2Screen.material as THREE.MeshStandardMaterial;
    m.emissiveIntensity = 0.7 + Math.sin(time * 2.0) * 0.3;
  }

  // Station 03: Floating frosted UI layers
  for (let i = 0; i < 4; i++) {
    const layer = group.getObjectByName(`st03-layer-${i}`);
    if (layer) {
      layer.position.y += Math.sin(time * 0.8 + i * 1.1) * 0.0015;
      layer.rotation.z = Math.sin(time * 0.5 + i) * 0.015;
    }
  }
  const cursor = group.getObjectByName('st03-cursor');
  if (cursor) {
    cursor.position.y += Math.sin(time * 1.4) * 0.002;
    cursor.position.x += Math.cos(time * 0.9) * 0.0018;
  }

  // Station 04: Orbital rings rotate dynamically
  for (let i = 0; i < 3; i++) {
    const ring = group.getObjectByName(`st04-ring-${i}`);
    if (ring) {
      ring.rotation.y = time * (0.18 + i * 0.08);
      ring.rotation.z = Math.sin(time * 0.15 + i) * 0.25;
    }
  }
  for (let i = 0; i < 4; i++) {
    const icon = group.getObjectByName(`st04-icon-${i}`);
    if (icon) {
      const baseAngle = i * (Math.PI / 2) + time * 0.28;
      const r = 2.0 + Math.sin(time * 0.4 + i) * 0.2;
      icon.position.x = STATIONS[3].position[0] + Math.cos(baseAngle) * r;
      icon.position.z = STATIONS[3].position[2] + Math.sin(baseAngle) * r;
      icon.position.y = STATIONS[3].position[1] + 2.0 + Math.sin(baseAngle * 2) * 0.35;
      icon.rotation.y = time * 0.5;
    }
  }

  // Station 05: Phone floats gently, particle cloud drifts
  const phone = group.getObjectByName('st05-phone');
  if (phone) {
    phone.position.y += Math.sin(time * 1.1) * 0.0015;
    phone.rotation.y = Math.sin(time * 0.4) * 0.035;
  }
  const s5Screen = group.getObjectByName('st05-screen');
  if (s5Screen && s5Screen instanceof THREE.Mesh) {
    const m = s5Screen.material as THREE.MeshStandardMaterial;
    m.emissiveIntensity = 0.75 + Math.sin(time * 2.2) * 0.25;
  }
  const particles = group.getObjectByName('st05-particles');
  if (particles && particles instanceof THREE.Points) {
    const attr = particles.geometry.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < attr.count; i++) {
      let y = attr.getY(i);
      y += 0.004;
      if (y > STATIONS[4].position[1] + 4.0) y = STATIONS[4].position[1] + 0.5;
      attr.setY(i, y);
    }
    attr.needsUpdate = true;
  }

  // Station 06: Geometric cubes breathe
  for (let i = 0; i < 7; i++) {
    const cube = group.getObjectByName(`st06-cube-${i}`);
    if (cube) {
      cube.position.y += Math.sin(time * 0.7 + i * 0.8) * 0.0012;
    }
  }
}
