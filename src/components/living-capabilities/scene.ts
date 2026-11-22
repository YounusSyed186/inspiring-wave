/**
 * Living Capabilities – Architectural Scene Builder
 *
 * Implements the futuristic, bright cream architectural landscape:
 * - Terraced cream stone & brushed metallic podiums
 * - Reflective water pools with blue illumination
 * - 6 sculptural signature installations
 * - Organic foliage & architectural monolith backdrops
 * - Inset illuminated cobalt ribbon pathway
 */
import * as THREE from 'three';
import { STATIONS } from './config';
import { COLORS } from './types';

/* ── Material Helpers ────────────────────────────────────────────── */

function stoneMat(color = '#eae6dc', roughness = 0.55, metalness = 0.05) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
  });
}

function chromeMat(color = '#d0d8e4', roughness = 0.12, metalness = 0.88) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
  });
}

function cobaltMat(color = '#1945f5', roughness = 0.25, metalness = 0.4) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
    emissive: new THREE.Color('#0a2090'),
    emissiveIntensity: 0.35,
  });
}

function frostedGlassMat(color = '#3878ff', opacity = 0.42) {
  return new THREE.MeshPhysicalMaterial({
    color,
    transparent: true,
    opacity,
    roughness: 0.08,
    metalness: 0.1,
    transmission: 0.75,
    thickness: 0.6,
    ior: 1.48,
    side: THREE.DoubleSide,
  });
}

function neonMat(color = '#2563eb', intensity = 2.6) {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: new THREE.Color(color),
    emissiveIntensity: intensity,
    transparent: true,
    opacity: 0.95,
  });
}

/* ── Environment, Ground & Water Basin ────────────────────────────── */

function buildGroundAndWater(scene: THREE.Scene) {
  // Architectural terrace base
  const groundGeo = new THREE.PlaneGeometry(120, 120);
  const ground = new THREE.Mesh(groundGeo, stoneMat('#f1ece2', 0.7, 0.02));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.05;
  ground.receiveShadow = true;
  scene.add(ground);

  // Large reflective water basin
  const waterGeo = new THREE.PlaneGeometry(100, 100);
  const waterMaterial = new THREE.MeshStandardMaterial({
    color: '#081f5c',
    roughness: 0.04,
    metalness: 0.75,
    transparent: true,
    opacity: 0.88,
  });
  const water = new THREE.Mesh(waterGeo, waterMaterial);
  water.rotation.x = -Math.PI / 2;
  water.position.y = -0.45;
  water.receiveShadow = true;
  scene.add(water);

  // Basin border rim
  const basinRimGeo = new THREE.BoxGeometry(60, 0.6, 1.2);
  const basinRim = new THREE.Mesh(basinRimGeo, stoneMat('#ded8cb', 0.5));
  basinRim.position.set(0, -0.15, 12);
  basinRim.receiveShadow = true;
  scene.add(basinRim);
}

function buildLighting(scene: THREE.Scene) {
  // Warm ambient light matching bright cream mood
  const ambient = new THREE.AmbientLight(0xfff6ea, 0.75);
  scene.add(ambient);

  // Key architectural sunlight
  const sun = new THREE.DirectionalLight(0xfffaf0, 1.85);
  sun.position.set(16, 26, 18);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 80;
  sun.shadow.camera.left = -35;
  sun.shadow.camera.right = 35;
  sun.shadow.camera.top = 35;
  sun.shadow.camera.bottom = -35;
  sun.shadow.bias = -0.0004;
  scene.add(sun);

  // Cool sky fill from opposite side
  const fill = new THREE.DirectionalLight(0x8cb8ff, 0.65);
  fill.position.set(-18, 15, -12);
  scene.add(fill);

  // Ground bounce light
  const bounce = new THREE.DirectionalLight(0x2855ff, 0.35);
  bounce.position.set(0, -6, 4);
  scene.add(bounce);

  // Soft hemisphere
  const hemi = new THREE.HemisphereLight(0xfff8ee, 0xb8b0a2, 0.5);
  scene.add(hemi);
}

/* ── Terraced Podiums ─────────────────────────────────────────────── */

function buildTerracedPlatform(
  scene: THREE.Scene,
  pos: [number, number, number],
  radius = 2.7,
  height = 0.45,
  hasStairs = true
) {
  // Lower base tier
  const baseGeo = new THREE.CylinderGeometry(radius * 1.15, radius * 1.2, height * 0.7, 48);
  const baseMesh = new THREE.Mesh(baseGeo, stoneMat('#e6e1d6', 0.6));
  baseMesh.position.set(pos[0], pos[1] + (height * 0.7) / 2, pos[2]);
  baseMesh.receiveShadow = true;
  baseMesh.castShadow = true;
  scene.add(baseMesh);

  // Upper polished tier
  const topGeo = new THREE.CylinderGeometry(radius, radius, height * 0.5, 48);
  const topMesh = new THREE.Mesh(topGeo, stoneMat('#f3efe6', 0.4, 0.1));
  topMesh.position.set(pos[0], pos[1] + height * 0.7 + (height * 0.5) / 2, pos[2]);
  topMesh.receiveShadow = true;
  topMesh.castShadow = true;
  scene.add(topMesh);

  // Glowing blue neon edge ring
  const neonRingGeo = new THREE.TorusGeometry(radius, 0.035, 12, 64);
  const neonRing = new THREE.Mesh(neonRingGeo, neonMat('#1945f5', 2.8));
  neonRing.rotation.x = Math.PI / 2;
  neonRing.position.set(pos[0], pos[1] + height * 1.2 + 0.015, pos[2]);
  scene.add(neonRing);

  // Silver beveled trim
  const trimGeo = new THREE.TorusGeometry(radius * 1.15, 0.045, 12, 64);
  const trimMesh = new THREE.Mesh(trimGeo, chromeMat());
  trimMesh.rotation.x = Math.PI / 2;
  trimMesh.position.set(pos[0], pos[1] + height * 0.7, pos[2]);
  scene.add(trimMesh);

  // Optional curved architectural steps
  if (hasStairs) {
    for (let i = 0; i < 4; i++) {
      const stepRadius = radius + 0.55 + i * 0.32;
      const stepGeo = new THREE.CylinderGeometry(stepRadius, stepRadius, 0.09, 32, 1, false, 0, Math.PI * 0.45);
      const step = new THREE.Mesh(stepGeo, stoneMat('#dcd6c8'));
      step.rotation.y = -Math.PI * 0.22;
      step.position.set(pos[0], pos[1] + (i + 1) * 0.08, pos[2]);
      step.receiveShadow = true;
      step.castShadow = true;
      scene.add(step);
    }
  }

  return pos[1] + height * 1.2;
}

/* ── Winding Path Ribbon ──────────────────────────────────────────── */

function buildConnectingPathway(scene: THREE.Scene) {
  const pts = STATIONS.map((s) => new THREE.Vector3(s.position[0], s.position[1] + 0.08, s.position[2]));
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal', 0.5);

  // Concrete pathway ribbon
  const shape = new THREE.Shape();
  shape.moveTo(-0.55, 0);
  shape.lineTo(0.55, 0);
  const extrudeGeo = new THREE.ExtrudeGeometry(shape, {
    steps: 140,
    extrudePath: curve,
    bevelEnabled: false,
  });
  const pathMesh = new THREE.Mesh(extrudeGeo, stoneMat('#ded8cc', 0.65));
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
    const discGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.04, 24);
    const disc = new THREE.Mesh(discGeo, neonMat('#1945f5', 3.2));
    disc.position.set(s.position[0], s.position[1] + 0.12, s.position[2]);
    scene.add(disc);
  });
}

/* ── Station 01: Digital Strategy – Luminous Network Sphere ──────── */

function buildStation01(scene: THREE.Scene, group: THREE.Group) {
  const pos = STATIONS[0].position;
  const platformY = buildTerracedPlatform(scene, pos, 2.6, 0.5);

  const localY = platformY + 1.6;

  // Multi-tier metallic pedestal
  const pedGeo = new THREE.CylinderGeometry(1.4, 1.65, 0.35, 36);
  const ped = new THREE.Mesh(pedGeo, chromeMat('#e8ecf4', 0.15, 0.85));
  ped.position.set(pos[0], platformY + 0.18, pos[2]);
  ped.castShadow = true;
  group.add(ped);

  // Luminous inner glowing core sphere
  const coreGeo = new THREE.SphereGeometry(1.05, 32, 32);
  const coreMat = new THREE.MeshStandardMaterial({
    color: '#0055ff',
    emissive: new THREE.Color('#1044ff'),
    emissiveIntensity: 1.4,
    roughness: 0.2,
    metalness: 0.3,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.position.set(pos[0], localY, pos[2]);
  core.name = 'st01-core';
  group.add(core);

  // Outer geodesic network sphere
  const icoGeo = new THREE.IcosahedronGeometry(1.65, 2);
  const wireMat = new THREE.MeshBasicMaterial({
    color: '#88b4ff',
    wireframe: true,
    transparent: true,
    opacity: 0.75,
  });
  const wireSphere = new THREE.Mesh(icoGeo, wireMat);
  wireSphere.position.set(pos[0], localY, pos[2]);
  wireSphere.name = 'st01-sphere';
  group.add(wireSphere);

  // Luminous vertex beacon nodes
  const nodeGeo = new THREE.SphereGeometry(0.065, 12, 12);
  const nodeMat = neonMat('#ffffff', 3.8);
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

function buildStation02(scene: THREE.Scene, group: THREE.Group) {
  const pos = STATIONS[1].position;
  const platformY = buildTerracedPlatform(scene, pos, 3.2, 0.45);

  const frameCount = 4;
  const frameWidth = 2.6;
  const frameHeight = 3.2;
  const spacing = 0.85;

  for (let i = 0; i < frameCount; i++) {
    const scale = 1 - i * 0.12;
    const depthOffset = i * spacing;
    const w = frameWidth * scale;
    const h = frameHeight * scale;
    const t = 0.18; // thickness

    const frameGroup = new THREE.Group();
    frameGroup.position.set(pos[0], platformY + h / 2, pos[2] - depthOffset);

    // Frame material: front frame is matte architectural concrete; inner frames have glass/blue accents
    const fMat = i === 0 ? stoneMat('#f4f0e6', 0.45) : chromeMat('#cfd7e6', 0.25, 0.7);

    // Top beam
    const top = new THREE.Mesh(new THREE.BoxGeometry(w, t, 0.22), fMat);
    top.position.y = h / 2 - t / 2;
    top.castShadow = true;
    frameGroup.add(top);

    // Left pillar
    const left = new THREE.Mesh(new THREE.BoxGeometry(t, h - t, 0.22), fMat);
    left.position.set(-w / 2 + t / 2, -t / 2, 0);
    left.castShadow = true;
    frameGroup.add(left);

    // Right pillar
    const right = left.clone();
    right.position.x = w / 2 - t / 2;
    frameGroup.add(right);

    // Inner glowing electric blue LED light strip along arch
    const neonTop = new THREE.Mesh(new THREE.BoxGeometry(w - t * 2, 0.04, 0.12), neonMat('#1945f5', 3.0));
    neonTop.position.y = h / 2 - t - 0.02;
    frameGroup.add(neonTop);

    const neonLeft = new THREE.Mesh(new THREE.BoxGeometry(0.04, h - t * 2, 0.12), neonMat('#1945f5', 2.5));
    neonLeft.position.x = -w / 2 + t + 0.02;
    frameGroup.add(neonLeft);

    const neonRight = neonLeft.clone();
    neonRight.position.x = w / 2 - t - 0.02;
    frameGroup.add(neonRight);

    // Browser dots on outermost frame
    if (i === 0) {
      const dotColors = ['#ff5f56', '#ffbd2e', '#27c93f'];
      dotColors.forEach((color, dIdx) => {
        const dot = new THREE.Mesh(new THREE.CircleGeometry(0.05, 16), neonMat(color, 1.8));
        dot.position.set(-w / 2 + 0.35 + dIdx * 0.14, h / 2 - t / 2, 0.12);
        frameGroup.add(dot);
      });
    }

    group.add(frameGroup);
  }

  // Backlit screen deep inside gateway
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(1.6, 2.2),
    new THREE.MeshStandardMaterial({
      color: '#081836',
      emissive: new THREE.Color('#1044bb'),
      emissiveIntensity: 0.85,
    })
  );
  screen.position.set(pos[0], platformY + 1.6, pos[2] - 3.4);
  screen.name = 'st02-screen';
  group.add(screen);
}

/* ── Station 03: UI/UX Design – Frosted Glass Layer Stack ────────── */

function buildStation03(scene: THREE.Scene, group: THREE.Group) {
  const pos = STATIONS[2].position;
  const platformY = buildTerracedPlatform(scene, pos, 3.0, 0.45);

  const layerConfigs = [
    { w: 2.8, h: 1.8, z: 0.6, rx: 0.05, ry: -0.15, col: '#2563eb', op: 0.45 },
    { w: 2.5, h: 1.6, z: 0.0, rx: 0.02, ry: -0.08, col: '#3b82f6', op: 0.5 },
    { w: 2.2, h: 1.4, z: -0.6, rx: -0.02, ry: 0.05, col: '#1d4ed8', op: 0.55 },
    { w: 1.9, h: 1.2, z: -1.2, rx: -0.05, ry: 0.12, col: '#1e40af', op: 0.6 },
  ];

  layerConfigs.forEach((cfg, idx) => {
    const layer = new THREE.Mesh(
      new THREE.BoxGeometry(cfg.w, cfg.h, 0.05),
      frostedGlassMat(cfg.col, cfg.op)
    );
    layer.position.set(pos[0] + (idx - 1.5) * 0.25, platformY + 1.8 + idx * 0.25, pos[2] + cfg.z);
    layer.rotation.set(cfg.rx, cfg.ry, 0);
    layer.castShadow = true;
    layer.name = `st03-layer-${idx}`;
    group.add(layer);

    // Polished beveled glass border
    const border = new THREE.LineSegments(
      new THREE.EdgesGeometry(layer.geometry),
      new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.7 })
    );
    layer.add(border);

    // UI elements on top layer (toggle switch + search bar wireframe)
    if (idx === 0) {
      // Toggle capsule
      const toggle = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.14, 0.04), neonMat('#d8f03c', 2.0));
      toggle.position.set(0.65, 0.5, 0.04);
      layer.add(toggle);

      // UI wireframe lines
      const card = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.6), frostedGlassMat('#ffffff', 0.25));
      card.position.set(-0.5, -0.2, 0.04);
      layer.add(card);
    }
  });

  // Glossy 3D pointer cursor
  const cursorShape = new THREE.Shape();
  cursorShape.moveTo(0, 0);
  cursorShape.lineTo(0, -0.6);
  cursorShape.lineTo(0.18, -0.45);
  cursorShape.lineTo(0.35, -0.72);
  cursorShape.lineTo(0.48, -0.65);
  cursorShape.lineTo(0.3, -0.38);
  cursorShape.lineTo(0.52, -0.35);
  cursorShape.closePath();

  const cursorGeo = new THREE.ExtrudeGeometry(cursorShape, { depth: 0.06, bevelEnabled: false });
  const cursor = new THREE.Mesh(
    cursorGeo,
    new THREE.MeshStandardMaterial({
      color: '#ffffff',
      roughness: 0.1,
      metalness: 0.3,
      emissive: new THREE.Color('#ffffff'),
      emissiveIntensity: 0.6,
    })
  );
  cursor.position.set(pos[0] + 1.4, platformY + 2.8, pos[2] + 0.9);
  cursor.name = 'st03-cursor';
  group.add(cursor);
}

/* ── Station 04: Social Media – Dynamic Chrome Orbital Rings ─────── */

function buildStation04(scene: THREE.Scene, group: THREE.Group) {
  const pos = STATIONS[3].position;
  const platformY = buildTerracedPlatform(scene, pos, 2.8, 0.45);

  const localY = platformY + 1.8;

  // Concentric tilted chrome rings
  const ringParams = [
    { r: 2.1, tube: 0.09, rx: 0.75, rz: 0.25, mat: chromeMat('#f0f4f8', 0.08, 0.92) },
    { r: 1.6, tube: 0.08, rx: -0.55, rz: -0.4, mat: chromeMat('#c0d2f0', 0.1, 0.9) },
    { r: 1.1, tube: 0.07, rx: 0.35, rz: 0.8, mat: cobaltMat('#2563eb', 0.2, 0.7) },
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
    { type: 'heart', angle: 0, rad: 2.2, col: '#ff3b5c' },
    { type: 'play', angle: 1.6, rad: 1.8, col: '#2563eb' },
    { type: 'signal', angle: 3.2, rad: 2.3, col: '#ffffff' },
    { type: 'chat', angle: 4.8, rad: 1.9, col: '#d8f03c' },
  ];

  icons.forEach((ic, i) => {
    const badge = new THREE.Group();
    badge.position.set(
      pos[0] + Math.cos(ic.angle) * ic.rad,
      localY + Math.sin(ic.angle * 2) * 0.4,
      pos[2] + Math.sin(ic.angle) * ic.rad
    );

    // Pill badge container
    const bg = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.38, 0.08),
      chromeMat('#ffffff', 0.15, 0.2)
    );
    bg.castShadow = true;
    badge.add(bg);

    // Icon glyph inside badge
    const glyph = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 16, 16),
      neonMat(ic.col, 1.8)
    );
    glyph.position.z = 0.06;
    badge.add(glyph);

    badge.name = `st04-icon-${i}`;
    group.add(badge);
  });
}

/* ── Station 05: Mobile App – Titanium Smartphone Monolith ───────── */

function buildStation05(scene: THREE.Scene, group: THREE.Group) {
  const pos = STATIONS[4].position;
  const platformY = buildTerracedPlatform(scene, pos, 3.2, 0.5, true);

  const phoneW = 1.35;
  const phoneH = 2.75;
  const phoneD = 0.14;
  const localY = platformY + phoneH / 2 + 0.3;

  // Phone body with rounded chassis
  const bodyGeo = new THREE.BoxGeometry(phoneW, phoneH, phoneD);
  const bodyMat = chromeMat('#d2b88a', 0.18, 0.88); // Titanium gold finish
  const phone = new THREE.Mesh(bodyGeo, bodyMat);
  phone.position.set(pos[0], localY, pos[2]);
  phone.castShadow = true;
  phone.name = 'st05-phone';
  group.add(phone);

  // Black bezel + AMOLED screen
  const screenGeo = new THREE.PlaneGeometry(phoneW - 0.1, phoneH - 0.14);
  const screenMat = new THREE.MeshStandardMaterial({
    color: '#060f22',
    emissive: new THREE.Color('#1044cc'),
    emissiveIntensity: 0.85,
    roughness: 0.1,
  });
  const screen = new THREE.Mesh(screenGeo, screenMat);
  screen.position.set(pos[0], localY, pos[2] + phoneD / 2 + 0.005);
  screen.name = 'st05-screen';
  group.add(screen);

  // Camera Dynamic Island at top
  const island = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.075, 0.02),
    new THREE.MeshBasicMaterial({ color: '#000000' })
  );
  island.position.set(pos[0], localY + phoneH / 2 - 0.18, pos[2] + phoneD / 2 + 0.01);
  group.add(island);

  // Floating particle cloud radiating from screen
  const pGeo = new THREE.BufferGeometry();
  const count = 75;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = pos[0] + (Math.random() - 0.5) * 1.8;
    positions[i * 3 + 1] = localY + (Math.random() - 0.5) * 2.2;
    positions[i * 3 + 2] = pos[2] + phoneD + Math.random() * 0.9;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const pMat = new THREE.PointsMaterial({
    color: '#70a4ff',
    size: 0.055,
    transparent: true,
    opacity: 0.85,
  });
  const particles = new THREE.Points(pGeo, pMat);
  particles.name = 'st05-particles';
  group.add(particles);
}

/* ── Station 06: Software Development – Geometric Modular Cubes ──── */

function buildStation06(scene: THREE.Scene, group: THREE.Group) {
  const pos = STATIONS[5].position;
  const platformY = buildTerracedPlatform(scene, pos, 3.4, 0.45);

  // Cluster of modular cubes at varying heights and material finishes
  const blocks = [
    { size: [1.2, 1.4, 1.2], offset: [-0.6, 0.7, -0.4], mat: frostedGlassMat('#1945f5', 0.6) },
    { size: [1.4, 2.1, 1.1], offset: [0.6, 1.05, 0.1], mat: cobaltMat('#1945f5', 0.2, 0.4) },
    { size: [0.9, 1.1, 1.3], offset: [-0.2, 0.55, 0.8], mat: frostedGlassMat('#3b82f6', 0.45) },
    { size: [1.1, 1.9, 0.9], offset: [1.4, 0.95, -0.6], mat: stoneMat('#f1ece2', 0.35, 0.1) },
    { size: [0.7, 2.6, 0.7], offset: [-1.2, 1.3, 0.2], mat: frostedGlassMat('#60a5fa', 0.5) },
    { size: [1.3, 0.8, 1.1], offset: [0.1, 0.4, -0.9], mat: chromeMat('#dce4f0', 0.15, 0.85) },
    { size: [0.8, 1.5, 0.8], offset: [-0.8, 1.9, 0.4], mat: neonMat('#1945f5', 1.8) },
  ];

  blocks.forEach((b, i) => {
    const geo = new THREE.BoxGeometry(...(b.size as [number, number, number]));
    const mesh = new THREE.Mesh(geo, b.mat);
    mesh.position.set(pos[0] + b.offset[0], platformY + b.offset[1], pos[2] + b.offset[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.name = `st06-cube-${i}`;
    group.add(mesh);

    // Subtle edge highlight lines
    const wire = new THREE.LineSegments(
      new THREE.EdgesGeometry(geo),
      new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.4 })
    );
    mesh.add(wire);
  });
}

/* ── Architectural Monoliths & Natural Foliage ───────────────────── */

function buildEnvironmentDetails(scene: THREE.Scene) {
  // Sculptural architectural walls & portal cutouts
  const monoliths: [number, number, number, number, number][] = [
    [-3.5, 0.5, -4.5, 5.5, 4.2],
    [13.5, 0.8, -3.5, 4.0, 5.2],
    [-9.5, 0.2, -12, 4.5, 3.8],
    [8.0, 0.6, -18.5, 5.5, 4.5],
  ];

  monoliths.forEach(([x, y, z, w, h]) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.38), stoneMat('#ded7ca', 0.7));
    wall.position.set(x, y + h / 2, z);
    wall.receiveShadow = true;
    wall.castShadow = true;
    scene.add(wall);

    // Deep blue architectural window cutout
    const win = new THREE.Mesh(new THREE.BoxGeometry(w * 0.42, h * 0.55, 0.42), neonMat('#1945f5', 0.85));
    win.position.set(x, y + h * 0.55, z);
    scene.add(win);
  });

  // Foliage clusters (dense bushes along platform perimeters)
  const foliageCenters: [number, number, number][] = [
    [-10, 0.2, 5],
    [-4, 0.6, 2],
    [5, 1.2, 2],
    [12, 1.5, 1],
    [-2, 0.3, -8],
    [7, 0.5, -9],
    [15, 0.7, -13],
  ];

  const leafMat = stoneMat('#2e5e2e', 0.85, 0.0);
  foliageCenters.forEach(([fx, fy, fz]) => {
    for (let i = 0; i < 4; i++) {
      const r = 0.25 + Math.random() * 0.22;
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 8), leafMat);
      sphere.position.set(
        fx + (Math.random() - 0.5) * 0.7,
        fy + r * 0.8,
        fz + (Math.random() - 0.5) * 0.7
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
  dispose: () => void;
}

export function buildCapabilitiesScene(): SceneResult {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#f5f2ea');
  scene.fog = new THREE.FogExp2('#f5f2ea', 0.011);

  buildGroundAndWater(scene);
  buildLighting(scene);
  buildConnectingPathway(scene);
  buildEnvironmentDetails(scene);

  const stationGroup = new THREE.Group();
  stationGroup.name = 'stations';
  scene.add(stationGroup);

  buildStation01(scene, stationGroup);
  buildStation02(scene, stationGroup);
  buildStation03(scene, stationGroup);
  buildStation04(scene, stationGroup);
  buildStation05(scene, stationGroup);
  buildStation06(scene, stationGroup);

  return {
    scene,
    stationGroup,
    dispose: () => {
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
