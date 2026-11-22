/**
 * Living Capabilities – Multidimensional Animation Engine
 *
 * Drives camera keyframes along the scroll journey and animates all 6
 * capability installations, background atmosphere, and foreground ribbon.
 */
import * as THREE from 'three';
import { CAMERA_PATH, STATIONS } from './config';
import type { SceneResult } from './scene';

/* ── Camera Interpolation ────────────────────────────────────────── */
const posPoints = CAMERA_PATH.map((k) => new THREE.Vector3(...k.position));
const lookPoints = CAMERA_PATH.map((k) => new THREE.Vector3(...k.lookAt));
const progressValues = CAMERA_PATH.map((k) => k.progress);

const posSpline = new THREE.CatmullRomCurve3(posPoints, false, 'centripetal', 0.3);
const lookSpline = new THREE.CatmullRomCurve3(lookPoints, false, 'centripetal', 0.3);

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

/* ── Active Station Detection ────────────────────────────────────── */
export function getActiveStation(progress: number): number {
  for (let i = 0; i < STATIONS.length; i++) {
    const [start, end] = STATIONS[i].scrollRange;
    if (progress >= start && progress < end) return i;
  }
  if (progress >= STATIONS[STATIONS.length - 1].scrollRange[1]) {
    return STATIONS.length - 1;
  }
  return 0;
}

/* ── Collage Animation Loop ──────────────────────────────────────── */
export function animateCollage(sceneResult: SceneResult, time: number, progress: number) {
  const { stationGroup, ribbonMesh, headGroup, bgGroup, cursorMesh, socialGroup, phoneGroup, cubesGroup } = sceneResult;

  // 1. Background Atmosphere & Geodesic Wireframe
  if (bgGroup.children[2]) {
    bgGroup.children[2].rotation.y = time * 0.12;
    bgGroup.children[2].rotation.x = time * 0.06;
  }

  // 2. Central Head & Floating Clouds
  headGroup.position.y = Math.sin(time * 0.8) * 0.04;
  headGroup.rotation.y = Math.sin(time * 0.5) * 0.02;

  // 3. Ribbon Floating Wave
  if (ribbonMesh) {
    ribbonMesh.position.y = Math.sin(time * 1.2) * 0.03;
    ribbonMesh.rotation.z = Math.sin(time * 0.6) * 0.008;
  }

  // 4. Station 0: Digital Strategy (Tilted Wave + Target Rings)
  const st0 = stationGroup[0];
  if (st0) {
    const isSt0Active = progress >= 0.10 && progress <= 0.22;
    st0.position.y = STATIONS[0].position[1] + (isSt0Active ? 0.2 : 0) + Math.sin(time * 1.4) * 0.03;
    st0.rotation.y = (isSt0Active ? 0.05 : 0) + Math.sin(time * 0.7) * 0.02;

    // Spin Target Rings
    if (st0.children[1]) st0.children[1].rotation.z = time * 0.6;
    if (st0.children[2]) st0.children[2].rotation.z = -time * 0.9;
  }

  // 5. Station 1: Web Development (Browser Frame)
  const st1 = stationGroup[1];
  if (st1) {
    const isSt1Active = progress >= 0.22 && progress <= 0.34;
    st1.position.z = STATIONS[1].position[2] + (isSt1Active ? 0.35 : 0) + Math.sin(time * 1.1) * 0.025;
    st1.rotation.y = -0.15 + (isSt1Active ? 0.08 : 0) + Math.cos(time * 0.9) * 0.015;
  }

  // 6. Station 2: UI/UX Design (Layered Glass + Cursor + Toggle)
  const st2 = stationGroup[2];
  if (st2) {
    const isSt2Active = progress >= 0.34 && progress <= 0.46;
    st2.position.z = STATIONS[2].position[2] + (isSt2Active ? 0.4 : 0) + Math.sin(time * 1.3) * 0.03;

    // Rear glass separation
    if (st2.children[0]) {
      st2.children[0].position.z = isSt2Active ? -0.45 : -0.18;
    }

    // Cursor click motion
    if (cursorMesh) {
      cursorMesh.position.x = 0.15 + Math.sin(time * 1.8) * 0.08;
      cursorMesh.position.y = -0.15 + Math.cos(time * 1.5) * 0.06;
    }

    // Toggle knob slide
    if (st2.children[3]) {
      st2.children[3].position.x = -0.24 + Math.sin(time * 2.2) * 0.06;
    }
  }

  // 7. Station 3: Social Media (Globe + Rings + Floating Badges)
  if (socialGroup) {
    const isSt3Active = progress >= 0.46 && progress <= 0.58;
    socialGroup.position.y = STATIONS[3].position[1] + (isSt3Active ? 0.25 : 0) + Math.sin(time * 1.0) * 0.03;

    // Globe spin
    if (socialGroup.children[0]) {
      socialGroup.children[0].rotation.y = time * 0.25;
    }
    // Orbital ring rotate
    if (socialGroup.children[1]) {
      socialGroup.children[1].rotation.z = time * 0.35;
    }
    // Orbiting badges
    if (socialGroup.children[2]) {
      socialGroup.children[2].position.x = 0.9 + Math.cos(time * 1.4) * 0.25;
      socialGroup.children[2].position.y = 0.9 + Math.sin(time * 1.4) * 0.15;
    }
    if (socialGroup.children[3]) {
      socialGroup.children[3].position.x = 1.2 + Math.cos(time * 1.1 + 1) * 0.2;
      socialGroup.children[3].position.y = -0.2 + Math.sin(time * 1.1 + 1) * 0.15;
    }
    if (socialGroup.children[4]) {
      socialGroup.children[4].position.x = -0.8 + Math.cos(time * 1.3 + 2) * 0.2;
      socialGroup.children[4].position.y = -0.6 + Math.sin(time * 1.3 + 2) * 0.15;
    }
  }

  // 8. Station 4: Mobile App Development (Smartphone + Fan Slices)
  if (phoneGroup) {
    const isSt4Active = progress >= 0.58 && progress <= 0.70;
    phoneGroup.position.z = STATIONS[4].position[2] + (isSt4Active ? 0.5 : 0) + Math.sin(time * 1.2) * 0.03;
    phoneGroup.rotation.y = 0.22 + (isSt4Active ? -0.1 : 0) + Math.sin(time * 0.8) * 0.03;
  }

  // 9. Station 5: Software Development (Modular Cubes Explode/Assemble)
  if (cubesGroup) {
    const isSt5Active = progress >= 0.70 && progress <= 0.84;
    cubesGroup.position.z = STATIONS[5].position[2] + (isSt5Active ? 0.35 : 0) + Math.sin(time * 1.0) * 0.025;
    cubesGroup.rotation.y = Math.sin(time * 0.6) * 0.04;

    // Slight explode effect on cubes when active
    const explodeFactor = isSt5Active ? 1.25 : 1.0;
    for (let i = 0; i < 8; i++) {
      const c = cubesGroup.children[i];
      if (c) {
        c.scale.setScalar(explodeFactor);
      }
    }
  }
}
