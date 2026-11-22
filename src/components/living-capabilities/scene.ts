/**
 * Living Capabilities – Architectural Scene Builder
 *
 * Cinema-grade 3D architectural landscape with studio lighting,
 * dynamic environment reflections, water caustics, and 6 high-fidelity
 * sculptural service installations matching the reference artwork.
 */
import * as THREE from 'three';
import { STATIONS } from './config';
import { THEMES, type CapabilitiesTheme } from './types';

/* ── Environment Map Generator ───────────────────────────────────── */

export function createStudioEnvironment(renderer: THREE.WebGLRenderer, theme: CapabilitiesTheme): THREE.Texture {
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();

  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(theme === 'dark' ? '#04070b' : '#eae5da');

  // Overhead studio softbox
  const topLight = new THREE.Mesh(
    new THREE.PlaneGeometry(35, 35),
    new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
  );
  topLight.position.set(0, 20, 0);
  topLight.rotation.x = Math.PI / 2;
  envScene.add(topLight);

  // Cobalt blue key accent light
  const sideLight = new THREE.Mesh(
    new THREE.PlaneGeometry(25, 25),
    new THREE.MeshBasicMaterial({ color: 0x1945f5, side: THREE.DoubleSide })
  );
  sideLight.position.set(-18, 10, -5);
  sideLight.rotation.y = Math.PI / 2;
  envScene.add(sideLight);

  // Warm rim light
  const rimLight = new THREE.Mesh(
    new THREE.PlaneGeometry(25, 25),
    new THREE.MeshBasicMaterial({ color: theme === 'dark' ? 0xffea9f : 0xfffaea, side: THREE.DoubleSide })
  );
  rimLight.position.set(18, 12, 10);
  rimLight.rotation.y = -Math.PI / 2;
  envScene.add(rimLight);

  const envTexture = pmrem.fromScene(envScene, 0.04).texture;
  pmrem.dispose();
  return envTexture;
}

/* ── Material Helpers ────────────────────────────────────────────── */

function createMaterials(theme: CapabilitiesTheme) {
  const t = THEMES[theme];

  return {
    ground: new THREE.MeshStandardMaterial({
      color: t.ground,
      roughness: 0.65,
      metalness: 0.05,
    }),
    platformBase: new THREE.MeshStandardMaterial({
      color: t.platformBase,
      roughness: 0.5,
      metalness: 0.15,
    }),
    platformTop: new THREE.MeshStandardMaterial({
      color: t.platformTop,
      roughness: 0.35,
      metalness: 0.2,
    }),
    water: new THREE.MeshStandardMaterial({
      color: t.water,
      roughness: 0.05,
      metalness: 0.85,
      transparent: true,
      opacity: 0.9,
    }),
    chrome: new THREE.MeshStandardMaterial({
      color: t.chrome,
      roughness: 0.06,
      metalness: 0.94,
    }),
    cobalt: new THREE.MeshStandardMaterial({
      color: t.cobalt,
      roughness: 0.18,
      metalness: 0.55,
      emissive: new THREE.Color(t.cobalt),
      emissiveIntensity: 0.25,
    }),
    frostedGlass: new THREE.MeshPhysicalMaterial({
      color: theme === 'dark' ? '#3b82f6' : '#2563eb',
      transparent: true,
      opacity: theme === 'dark' ? 0.65 : 0.45,
      roughness: 0.08,
      metalness: 0.15,
      transmission: 0.82,
      thickness: 0.75,
      ior: 1.52,
      side: THREE.DoubleSide,
    }),
    crystalGlass: new THREE.MeshPhysicalMaterial({
      color: '#60a5fa',
      transparent: true,
      opacity: 0.5,
      roughness: 0.04,
      metalness: 0.05,
      transmission: 0.92,
      thickness: 0.5,
      ior: 1.55,
      side: THREE.DoubleSide,
    }),
    neonBlue: new THREE.MeshStandardMaterial({
      color: t.neonBlue,
      emissive: new THREE.Color(t.neonBlue),
      emissiveIntensity: 3.2,
      transparent: true,
      opacity: 0.95,
    }),
    neonYellow: new THREE.MeshStandardMaterial({
      color: t.neonYellow,
      emissive: new THREE.Color(t.neonYellow),
      emissiveIntensity: 2.8,
    }),
    monolith: new THREE.MeshStandardMaterial({
      color: t.stone,
      roughness: 0.7,
      metalness: 0.05,
    }),
    foliage: new THREE.MeshStandardMaterial({
      color: theme === 'dark' ? '#1c3a1c' : '#2d5e2d',
      roughness: 0.9,
    }),
  };
}

/* ── Ground, Water Basin & Lighting ──────────────────────────────── */

function buildGroundAndWater(scene: THREE.Scene, mats: ReturnType<typeof createMaterials>) {
  // Main ground terrace
  const groundGeo = new THREE.PlaneGeometry(140, 140);
  const ground = new THREE.Mesh(groundGeo, mats.ground);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.05;
  ground.receiveShadow = true;
  scene.add(ground);

  // Large reflective water pool in foreground/channels
  const waterGeo = new THREE.PlaneGeometry(110, 110, 32, 32);
  const water = new THREE.Mesh(waterGeo, mats.water);
  water.rotation.x = -Math.PI / 2;
  water.position.y = -0.38;
  water.receiveShadow = true;
  water.name = 'water-surface';
  scene.add(water);

  // Basin border coping
  const rimGeo = new THREE.BoxGeometry(65, 0.5, 1.4);
  const rim = new THREE.Mesh(rimGeo, mats.platformBase);
  rim.position.set(0, -0.15, 12);
  rim.receiveShadow = true;
  scene.add(rim);
}

function buildLighting(scene: THREE.Scene, theme: CapabilitiesTheme) {
  const isDark = theme === 'dark';

  // Warm ambient fill
  const ambient = new THREE.AmbientLight(isDark ? 0x141e2e : 0xfff6ec, isDark ? 0.9 : 0.8);
  scene.add(ambient);

  // Key architectural sunlight
  const sun = new THREE.DirectionalLight(0xfffdf5, isDark ? 2.2 : 1.9);
  sun.position.set(16, 28, 20);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 90;
  sun.shadow.camera.left = -38;
  sun.shadow.camera.right = 38;
  sun.shadow.camera.top = 38;
  sun.shadow.camera.bottom = -38;
  sun.shadow.bias = -0.0003;
  scene.add(sun);

  // Sky blue side fill
  const fill = new THREE.DirectionalLight(0x3b82f6, isDark ? 1.1 : 0.65);
  fill.position.set(-20, 16, -14);
  scene.add(fill);

  // Vibrant under-glow from neon paths and water
  const bounce = new THREE.DirectionalLight(0x1945f5, isDark ? 0.75 : 0.4);
  bounce.position.set(0, -8, 6);
  scene.add(bounce);

  // Subtle hemisphere
  const hemi = new THREE.HemisphereLight(
    isDark ? 0x203048 : 0xfff8ee,
    isDark ? 0x05080f : 0xb8b0a2,
    0.6
  );
  scene.add(hemi);
}

/* ── Terraced Podiums ─────────────────────────────────────────────── */

function buildTerracedPlatform(
  scene: THREE.Scene,
  mats: ReturnType<typeof createMaterials>,
  pos: [number, number, number],
  radius = 2.7,
  height = 0.48,
  hasStairs = true
) {
  // Lower pedestal ring
  const baseGeo = new THREE.CylinderGeometry(radius * 1.14, radius * 1.2, height * 0.7, 48);
  const baseMesh = new THREE.Mesh(baseGeo, mats.platformBase);
  baseMesh.position.set(pos[0], pos[1] + (height * 0.7) / 2, pos[2]);
  baseMesh.receiveShadow = true;
  baseMesh.castShadow = true;
  scene.add(baseMesh);

  // Upper polished dais
  const topGeo = new THREE.CylinderGeometry(radius, radius, height * 0.5, 48);
  const topMesh = new THREE.Mesh(topGeo, mats.platformTop);
  topMesh.position.set(pos[0], pos[1] + height * 0.7 + (height * 0.5) / 2, pos[2]);
  topMesh.receiveShadow = true;
  topMesh.castShadow = true;
  scene.add(topMesh);

  // Glowing neon edge ring
  const neonRingGeo = new THREE.TorusGeometry(radius, 0.04, 12, 64);
  const neonRing = new THREE.Mesh(neonRingGeo, mats.neonBlue);
  neonRing.rotation.x = Math.PI / 2;
  neonRing.position.set(pos[0], pos[1] + height * 1.2 + 0.015, pos[2]);
  scene.add(neonRing);

  // Brushed chrome beveled rim
  const trimGeo = new THREE.TorusGeometry(radius * 1.14, 0.05, 12, 64);
  const trimMesh = new THREE.Mesh(trimGeo, mats.chrome);
  trimMesh.rotation.x = Math.PI / 2;
  trimMesh.position.set(pos[0], pos[1] + height * 0.7, pos[2]);
  scene.add(trimMesh);

  // Curved architectural steps
  if (hasStairs) {
    for (let i = 0; i < 4; i++) {
      const stepRadius = radius + 0.55 + i * 0.32;
      const stepGeo = new THREE.CylinderGeometry(stepRadius, stepRadius, 0.09, 32, 1, false, 0, Math.PI * 0.45);
      const step = new THREE.Mesh(stepGeo, mats.platformBase);
      step.rotation.y = -Math.PI * 0.22;
      step.position.set(pos[0], pos[1] + (i + 1) * 0.08, pos[2]);
      step.receiveShadow = true;
      step.castShadow = true;
      scene.add(step);
    }
  }

  return pos[1] + height * 1.2;
}

/* ── Winding Pathway ──────────────────────────────────────────────── */

function buildConnectingPathway(scene: THREE.Scene, mats: ReturnType<typeof createMaterials>) {
  const pts = STATIONS.map((s) => new THREE.Vector3(s.position[0], s.position[1] + 0.08, s.position[2]));
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal', 0.5);

  // Concrete pathway ribbon
  const shape = new THREE.Shape();
  shape.moveTo(-0.58, 0);
  shape.lineTo(0.58, 0);
  const extrudeGeo = new THREE.ExtrudeGeometry(shape, {
    steps: 140,
    extrudePath: curve,
    bevelEnabled: false,
  });
  const pathMesh = new THREE.Mesh(extrudeGeo, mats.platformBase);
  pathMesh.receiveShadow = true;
  scene.add(pathMesh);

  // Glowing blue center guideline
  const curvePoints = curve.getPoints(160);
  const lineGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
  const lineMat = new THREE.LineBasicMaterial({
    color: '#1945f5',
    linewidth: 3,
    transparent: true,
    opacity: 0.95,
  });
  const pathLine = new THREE.Line(lineGeo, lineMat);
  pathLine.position.y = 0.04;
  scene.add(pathLine);

  // Waypoint discs at stations
  STATIONS.forEach((s) => {
    const discGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.05, 24);
    const disc = new THREE.Mesh(discGeo, mats.neonBlue);
    disc.position.set(s.position[0], s.position[1] + 0.12, s.position[2]);
    scene.add(disc);
  });
}

/* ── Station 01: Digital Strategy – Luminous Network Sphere ──────── */

function buildStation01(scene: THREE.Scene, group: THREE.Group, mats: ReturnType<typeof createMaterials>) {
  const pos = STATIONS[0].position;
  const platformY = buildTerracedPlatform(scene, mats, pos, 2.7, 0.5);
  const localY = platformY + 1.65;

  // Tiered circular metallic plinth
  const pedGeo = new THREE.CylinderGeometry(1.4, 1.7, 0.38, 40);
  const ped = new THREE.Mesh(pedGeo, mats.chrome);
  ped.position.set(pos[0], platformY + 0.19, pos[2]);
  ped.castShadow = true;
  group.add(ped);

  // Inner glowing cyan/blue core sphere
  const coreGeo = new THREE.SphereGeometry(1.08, 36, 36);
  const coreMat = new THREE.MeshStandardMaterial({
    color: '#0052ff',
    emissive: new THREE.Color('#1044ff'),
    emissiveIntensity: 1.6,
    roughness: 0.15,
    metalness: 0.4,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.position.set(pos[0], localY, pos[2]);
  core.name = 'st01-core';
  group.add(core);

  // Outer geodesic network wireframe sphere
  const icoGeo = new THREE.IcosahedronGeometry(1.68, 2);
  const wireMat = new THREE.MeshBasicMaterial({
    color: '#90baff',
    wireframe: true,
    transparent: true,
    opacity: 0.85,
  });
  const wireSphere = new THREE.Mesh(icoGeo, wireMat);
  wireSphere.position.set(pos[0], localY, pos[2]);
  wireSphere.name = 'st01-sphere';
  group.add(wireSphere);

  // Luminous white/gold vertex beacon nodes
  const nodeGeo = new THREE.SphereGeometry(0.068, 14, 14);
  const nodeMat = mats.neonYellow;
  const posAttr = icoGeo.getAttribute('position');
  const seen = new Set<string>();

  for (let i = 0; i < posAttr.count; i++) {
    const x = Math.round(posAttr.getX(i) * 100);
    const y = Math.round(posAttr.getY(i) * 100);
    const z = Math.round(posAttr.getZ(i) * 100);
    const key = `${x},${y},${z}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const node = new THREE.Mesh(nodeGeo, nodeMat);
    node.position.set(
      posAttr.getX(i) + pos[0],
      posAttr.getY(i) + localY,
      posAttr.getZ(i) + pos[2]
    );
    group.add(node);
  }
}

/* ── Station 02: Web Development – Rounded Gateway Portals ───────── */

function buildStation02(scene: THREE.Scene, group: THREE.Group, mats: ReturnType<typeof createMaterials>) {
  const pos = STATIONS[1].position;
  const platformY = buildTerracedPlatform(scene, mats, pos, 3.3, 0.45);

  const frameCount = 5;
  const frameWidth = 2.8;
  const frameHeight = 3.4;
  const spacing = 0.82;

  for (let i = 0; i < frameCount; i++) {
    const scale = 1 - i * 0.11;
    const depthOffset = i * spacing;
    const w = frameWidth * scale;
    const h = frameHeight * scale;
    const t = 0.2;

    const frameGroup = new THREE.Group();
    frameGroup.position.set(pos[0], platformY + h / 2, pos[2] - depthOffset);

    const fMat = i === 0 ? mats.platformTop : mats.chrome;

    // Top beam
    const top = new THREE.Mesh(new THREE.BoxGeometry(w, t, 0.24), fMat);
    top.position.y = h / 2 - t / 2;
    top.castShadow = true;
    frameGroup.add(top);

    // Left pillar
    const left = new THREE.Mesh(new THREE.BoxGeometry(t, h - t, 0.24), fMat);
    left.position.set(-w / 2 + t / 2, -t / 2, 0);
    left.castShadow = true;
    frameGroup.add(left);

    // Right pillar
    const right = left.clone();
    right.position.x = w / 2 - t / 2;
    frameGroup.add(right);

    // Glowing electric blue interior light channels
    const neonTop = new THREE.Mesh(new THREE.BoxGeometry(w - t * 2, 0.045, 0.14), mats.neonBlue);
    neonTop.position.y = h / 2 - t - 0.02;
    frameGroup.add(neonTop);

    const neonLeft = new THREE.Mesh(new THREE.BoxGeometry(0.045, h - t * 2, 0.14), mats.neonBlue);
    neonLeft.position.x = -w / 2 + t + 0.02;
    frameGroup.add(neonLeft);

    const neonRight = neonLeft.clone();
    neonRight.position.x = w / 2 - t - 0.02;
    frameGroup.add(neonRight);

    // macOS browser dots on front portal
    if (i === 0) {
      const dotColors = ['#ff5f56', '#ffbd2e', '#27c93f'];
      dotColors.forEach((color, dIdx) => {
        const dot = new THREE.Mesh(
          new THREE.CircleGeometry(0.055, 16),
          new THREE.MeshBasicMaterial({ color })
        );
        dot.position.set(-w / 2 + 0.38 + dIdx * 0.15, h / 2 - t / 2, 0.13);
        frameGroup.add(dot);
      });
    }

    group.add(frameGroup);
  }

  // Backlit screen deep in portal tunnel
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(1.8, 2.4),
    new THREE.MeshStandardMaterial({
      color: '#06132e',
      emissive: new THREE.Color('#0d3bb5'),
      emissiveIntensity: 0.9,
    })
  );
  screen.position.set(pos[0], platformY + 1.7, pos[2] - 4.1);
  screen.name = 'st02-screen';
  group.add(screen);
}

/* ── Station 03: UI/UX Design – Frosted Glass Layer Stack ────────── */

function buildStation03(scene: THREE.Scene, group: THREE.Group, mats: ReturnType<typeof createMaterials>) {
  const pos = STATIONS[2].position;
  const platformY = buildTerracedPlatform(scene, mats, pos, 3.1, 0.45);

  const layerConfigs = [
    { w: 2.9, h: 1.85, z: 0.65, rx: 0.04, ry: -0.16, mat: mats.frostedGlass },
    { w: 2.6, h: 1.65, z: 0.05, rx: 0.02, ry: -0.09, mat: mats.crystalGlass },
    { w: 2.3, h: 1.45, z: -0.55, rx: -0.02, ry: 0.05, mat: mats.frostedGlass },
    { w: 2.0, h: 1.25, z: -1.15, rx: -0.04, ry: 0.11, mat: mats.crystalGlass },
  ];

  layerConfigs.forEach((cfg, idx) => {
    const layer = new THREE.Mesh(
      new THREE.BoxGeometry(cfg.w, cfg.h, 0.055),
      cfg.mat
    );
    layer.position.set(pos[0] + (idx - 1.5) * 0.28, platformY + 1.8 + idx * 0.26, pos[2] + cfg.z);
    layer.rotation.set(cfg.rx, cfg.ry, 0);
    layer.castShadow = true;
    layer.name = `st03-layer-${idx}`;
    group.add(layer);

    // Subtle beveled perimeter wire
    const border = new THREE.LineSegments(
      new THREE.EdgesGeometry(layer.geometry),
      new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.75 })
    );
    layer.add(border);

    // Front UI controls: neon toggle capsule & card mockup
    if (idx === 0) {
      const toggle = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.16, 0.045), mats.neonYellow);
      toggle.position.set(0.7, 0.52, 0.04);
      layer.add(toggle);

      const card = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.65), mats.crystalGlass);
      card.position.set(-0.55, -0.22, 0.04);
      layer.add(card);
    }
  });

  // Glossy 3D pointer cursor
  const cursorShape = new THREE.Shape();
  cursorShape.moveTo(0, 0);
  cursorShape.lineTo(0, -0.65);
  cursorShape.lineTo(0.2, -0.48);
  cursorShape.lineTo(0.38, -0.76);
  cursorShape.lineTo(0.52, -0.68);
  cursorShape.lineTo(0.33, -0.4);
  cursorShape.lineTo(0.56, -0.37);
  cursorShape.closePath();

  const cursorGeo = new THREE.ExtrudeGeometry(cursorShape, { depth: 0.065, bevelEnabled: false });
  const cursor = new THREE.Mesh(
    cursorGeo,
    new THREE.MeshStandardMaterial({
      color: '#ffffff',
      roughness: 0.08,
      metalness: 0.4,
      emissive: new THREE.Color('#ffffff'),
      emissiveIntensity: 0.65,
    })
  );
  cursor.position.set(pos[0] + 1.45, platformY + 2.9, pos[2] + 0.95);
  cursor.name = 'st03-cursor';
  group.add(cursor);
}

/* ── Station 04: Social Media – Dynamic Chrome Orbital Rings ─────── */

function buildStation04(scene: THREE.Scene, group: THREE.Group, mats: ReturnType<typeof createMaterials>) {
  const pos = STATIONS[3].position;
  const platformY = buildTerracedPlatform(scene, mats, pos, 2.9, 0.45);
  const localY = platformY + 1.85;

  // Interlocking mirror-finish chrome rings
  const ringParams = [
    { r: 2.2, tube: 0.095, rx: 0.72, rz: 0.28, mat: mats.chrome },
    { r: 1.7, tube: 0.085, rx: -0.58, rz: -0.38, mat: mats.chrome },
    { r: 1.2, tube: 0.075, rx: 0.38, rz: 0.82, mat: mats.cobalt },
  ];

  ringParams.forEach((cfg, i) => {
    const ringGeo = new THREE.TorusGeometry(cfg.r, cfg.tube, 16, 72);
    const ring = new THREE.Mesh(ringGeo, cfg.mat);
    ring.position.set(pos[0], localY, pos[2]);
    ring.rotation.set(cfg.rx, 0, cfg.rz);
    ring.castShadow = true;
    ring.name = `st04-ring-${i}`;
    group.add(ring);
  });

  // Floating glossy 3D social badges
  const icons = [
    { type: 'heart', angle: 0, rad: 2.3, col: '#ff3b5c' },
    { type: 'play', angle: 1.6, rad: 1.9, col: '#2563eb' },
    { type: 'signal', angle: 3.2, rad: 2.4, col: '#ffffff' },
    { type: 'chat', angle: 4.8, rad: 2.0, col: '#d8f03c' },
  ];

  icons.forEach((ic, i) => {
    const badge = new THREE.Group();
    badge.position.set(
      pos[0] + Math.cos(ic.angle) * ic.rad,
      localY + Math.sin(ic.angle * 2) * 0.4,
      pos[2] + Math.sin(ic.angle) * ic.rad
    );

    const bg = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.09), mats.chrome);
    bg.castShadow = true;
    badge.add(bg);

    const glyph = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 16, 16),
      new THREE.MeshStandardMaterial({
        color: ic.col,
        emissive: new THREE.Color(ic.col),
        emissiveIntensity: 2.0,
      })
    );
    glyph.position.z = 0.07;
    badge.add(glyph);

    badge.name = `st04-icon-${i}`;
    group.add(badge);
  });
}

/* ── Station 05: Mobile App – Titanium Smartphone Monolith ───────── */

function buildStation05(scene: THREE.Scene, group: THREE.Group, mats: ReturnType<typeof createMaterials>) {
  const pos = STATIONS[4].position;
  const platformY = buildTerracedPlatform(scene, mats, pos, 3.3, 0.5, true);

  const phoneW = 1.4;
  const phoneH = 2.85;
  const phoneD = 0.15;
  const localY = platformY + phoneH / 2 + 0.32;

  // Titanium gold chassis
  const phone = new THREE.Mesh(new THREE.BoxGeometry(phoneW, phoneH, phoneD), mats.chrome);
  phone.position.set(pos[0], localY, pos[2]);
  phone.castShadow = true;
  phone.name = 'st05-phone';
  group.add(phone);

  // Black bezel + vibrant blue screen
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(phoneW - 0.1, phoneH - 0.14),
    new THREE.MeshStandardMaterial({
      color: '#061128',
      emissive: new THREE.Color('#1044cc'),
      emissiveIntensity: 0.95,
      roughness: 0.08,
    })
  );
  screen.position.set(pos[0], localY, pos[2] + phoneD / 2 + 0.005);
  screen.name = 'st05-screen';
  group.add(screen);

  // Camera Dynamic Island pill
  const island = new THREE.Mesh(
    new THREE.BoxGeometry(0.34, 0.08, 0.02),
    new THREE.MeshBasicMaterial({ color: '#000000' })
  );
  island.position.set(pos[0], localY + phoneH / 2 - 0.19, pos[2] + phoneD / 2 + 0.01);
  group.add(island);

  // Floating blue particle field
  const pGeo = new THREE.BufferGeometry();
  const count = 80;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = pos[0] + (Math.random() - 0.5) * 1.9;
    positions[i * 3 + 1] = localY + (Math.random() - 0.5) * 2.3;
    positions[i * 3 + 2] = pos[2] + phoneD + Math.random() * 0.95;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particles = new THREE.Points(
    pGeo,
    new THREE.PointsMaterial({ color: '#7ab0ff', size: 0.06, transparent: true, opacity: 0.88 })
  );
  particles.name = 'st05-particles';
  group.add(particles);
}

/* ── Station 06: Software Development – Geometric Modular Cubes ──── */

function buildStation06(scene: THREE.Scene, group: THREE.Group, mats: ReturnType<typeof createMaterials>) {
  const pos = STATIONS[5].position;
  const platformY = buildTerracedPlatform(scene, mats, pos, 3.5, 0.45);

  const blocks = [
    { size: [1.25, 1.45, 1.25], offset: [-0.65, 0.72, -0.4], mat: mats.frostedGlass },
    { size: [1.45, 2.15, 1.15], offset: [0.65, 1.08, 0.12], mat: mats.cobalt },
    { size: [0.95, 1.15, 1.35], offset: [-0.22, 0.58, 0.85], mat: mats.crystalGlass },
    { size: [1.15, 1.95, 0.95], offset: [1.45, 0.98, -0.65], mat: mats.platformTop },
    { size: [0.75, 2.65, 0.75], offset: [-1.25, 1.32, 0.22], mat: mats.frostedGlass },
    { size: [1.35, 0.85, 1.15], offset: [0.12, 0.42, -0.95], mat: mats.chrome },
    { size: [0.85, 1.55, 0.85], offset: [-0.85, 1.95, 0.42], mat: mats.neonBlue },
  ];

  blocks.forEach((b, i) => {
    const geo = new THREE.BoxGeometry(...(b.size as [number, number, number]));
    const mesh = new THREE.Mesh(geo, b.mat);
    mesh.position.set(pos[0] + b.offset[0], platformY + b.offset[1], pos[2] + b.offset[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.name = `st06-cube-${i}`;
    group.add(mesh);

    const wire = new THREE.LineSegments(
      new THREE.EdgesGeometry(geo),
      new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.45 })
    );
    mesh.add(wire);
  });
}

/* ── Monoliths & Foliage ─────────────────────────────────────────── */

function buildEnvironmentDetails(scene: THREE.Scene, mats: ReturnType<typeof createMaterials>) {
  const monoliths: [number, number, number, number, number][] = [
    [-3.8, 0.4, -4.8, 5.6, 4.4],
    [13.8, 0.7, -3.8, 4.2, 5.4],
    [-9.8, 0.2, -12.4, 4.6, 4.0],
    [8.2, 0.5, -18.8, 5.6, 4.6],
  ];

  monoliths.forEach(([x, y, z, w, h]) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.4), mats.monolith);
    wall.position.set(x, y + h / 2, z);
    wall.receiveShadow = true;
    wall.castShadow = true;
    scene.add(wall);

    const win = new THREE.Mesh(new THREE.BoxGeometry(w * 0.44, h * 0.58, 0.44), mats.neonBlue);
    win.position.set(x, y + h * 0.58, z);
    scene.add(win);
  });

  const foliageCenters: [number, number, number][] = [
    [-10.2, 0.2, 5.2],
    [-4.2, 0.6, 2.2],
    [5.2, 1.2, 2.2],
    [12.2, 1.5, 1.2],
    [-2.2, 0.3, -8.2],
    [7.2, 0.5, -9.2],
    [15.2, 0.7, -13.2],
  ];

  foliageCenters.forEach(([fx, fy, fz]) => {
    for (let i = 0; i < 4; i++) {
      const r = 0.26 + Math.random() * 0.24;
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 8), mats.foliage);
      sphere.position.set(
        fx + (Math.random() - 0.5) * 0.75,
        fy + r * 0.8,
        fz + (Math.random() - 0.5) * 0.75
      );
      sphere.castShadow = true;
      scene.add(sphere);
    }
  });
}

/* ── Public API ──────────────────────────────────────────────────── */

export interface SceneResult {
  scene: THREE.Scene;
  stationGroup: THREE.Group;
  updateTheme: (newTheme: CapabilitiesTheme) => void;
  dispose: () => void;
}

export function buildCapabilitiesScene(renderer: THREE.WebGLRenderer, theme: CapabilitiesTheme = 'dark'): SceneResult {
  const scene = new THREE.Scene();
  const t = THEMES[theme];

  scene.background = new THREE.Color(t.bg);
  scene.fog = new THREE.FogExp2(t.fog, 0.012);

  // Set studio reflections
  const envMap = createStudioEnvironment(renderer, theme);
  scene.environment = envMap;

  let mats = createMaterials(theme);

  buildGroundAndWater(scene, mats);
  buildLighting(scene, theme);
  buildConnectingPathway(scene, mats);
  buildEnvironmentDetails(scene, mats);

  const stationGroup = new THREE.Group();
  stationGroup.name = 'stations';
  scene.add(stationGroup);

  buildStation01(scene, stationGroup, mats);
  buildStation02(scene, stationGroup, mats);
  buildStation03(scene, stationGroup, mats);
  buildStation04(scene, stationGroup, mats);
  buildStation05(scene, stationGroup, mats);
  buildStation06(scene, stationGroup, mats);

  return {
    scene,
    stationGroup,
    updateTheme: (newTheme: CapabilitiesTheme) => {
      const nt = THEMES[newTheme];
      scene.background = new THREE.Color(nt.bg);
      if (scene.fog) scene.fog.color.set(nt.fog);
      envMap.dispose();
      scene.environment = createStudioEnvironment(renderer, newTheme);
    },
    dispose: () => {
      envMap.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
    },
  };
}
