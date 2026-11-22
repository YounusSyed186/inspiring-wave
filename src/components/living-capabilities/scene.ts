/**
 * Living Capabilities – Multidimensional Editorial 3D Collage Scene Builder
 *
 * Implements the approved art-directed 3D composition matching media_1795368079976_6c362555.jpg:
 * - Technical grid backdrop with glowing fluorescent lime halo and wireframe geodesic sphere
 * - Central surreal monochrome sculpture portrait with sliced cumulus cloud planes
 * - Dynamic electric cobalt blue satin and liquid silver ribbons
 * - 6 unique 3D capability installations (Wave, Browser, Glass UI, Social Globe, Smartphone, Software Cubes)
 * - Sweeping cream typography ribbon: STRATEGY / DESIGN / TECHNOLOGY / IN MOTION
 */
import * as THREE from 'three';
import { STATIONS } from './config';
import { THEMES, type CapabilitiesTheme } from './types';

export interface SceneResult {
  scene: THREE.Scene;
  stationGroup: THREE.Group[];
  ribbonMesh: THREE.Mesh;
  headGroup: THREE.Group;
  bgGroup: THREE.Group;
  cursorMesh: THREE.Mesh;
  socialGroup: THREE.Group;
  phoneGroup: THREE.Group;
  cubesGroup: THREE.Group;
  dispose: () => void;
}

/* ── Texture Loader Helper ───────────────────────────────────────── */
const textureLoader = new THREE.TextureLoader();

function loadSafeTexture(url: string, onLoad?: (t: THREE.Texture) => void): THREE.Texture {
  return textureLoader.load(
    url,
    (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      if (onLoad) onLoad(t);
    },
    undefined,
    () => {
      // Fallback if loading fails
    }
  );
}

/* ── Studio Environment Map ──────────────────────────────────────── */
export function createStudioEnvironment(renderer: THREE.WebGLRenderer, theme: CapabilitiesTheme): THREE.Texture {
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();

  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(theme === 'dark' ? '#06080d' : '#f5f2ea');

  // Overhead softbox
  const topLight = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
  );
  topLight.position.set(0, 15, 0);
  topLight.rotation.x = Math.PI / 2;
  envScene.add(topLight);

  // Cobalt blue key accent light
  const sideLight = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshBasicMaterial({ color: 0x1945f5, side: THREE.DoubleSide })
  );
  sideLight.position.set(-15, 6, -2);
  sideLight.rotation.y = Math.PI / 2;
  envScene.add(sideLight);

  // Fluorescent lime kicker light
  const limeLight = new THREE.Mesh(
    new THREE.PlaneGeometry(15, 15),
    new THREE.MeshBasicMaterial({ color: 0xd8f03c, side: THREE.DoubleSide })
  );
  limeLight.position.set(15, 8, 5);
  limeLight.rotation.y = -Math.PI / 2;
  envScene.add(limeLight);

  const envTexture = pmrem.fromScene(envScene, 0.04).texture;
  pmrem.dispose();
  return envTexture;
}

/* ── Main Scene Builder ──────────────────────────────────────────── */
export function buildCapabilitiesScene(renderer: THREE.WebGLRenderer, theme: CapabilitiesTheme): SceneResult {
  const scene = new THREE.Scene();
  const t = THEMES[theme];

  scene.background = new THREE.Color(t.bg);
  scene.fog = new THREE.FogExp2(t.bg, 0.018);

  const envMap = createStudioEnvironment(renderer, theme);
  scene.environment = envMap;

  /* ── Lighting ── */
  const ambientLight = new THREE.AmbientLight(theme === 'dark' ? 0x0c1322 : 0xf1efe7, 1.8);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
  keyLight.position.set(-4, 7, 8);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  keyLight.shadow.bias = -0.0005;
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x1945f5, 3.2);
  rimLight.position.set(6, 4, 3);
  scene.add(rimLight);

  const limeFill = new THREE.PointLight(0xd8f03c, 1.6, 12, 1.2);
  limeFill.position.set(1.0, 0.6, 1.5);
  scene.add(limeFill);

  /* ── Shared Materials ── */
  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xe8eef8,
    roughness: 0.06,
    metalness: 0.96,
    envMap,
    envMapIntensity: 1.5,
  });

  const cobaltMat = new THREE.MeshStandardMaterial({
    color: 0x1945f5,
    roughness: 0.22,
    metalness: 0.55,
    emissive: new THREE.Color(0x1030b0),
    emissiveIntensity: 0.4,
  });

  const frostedGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x3b82f6,
    transparent: true,
    opacity: 0.72,
    roughness: 0.08,
    metalness: 0.12,
    transmission: 0.86,
    thickness: 0.6,
    ior: 1.52,
    side: THREE.DoubleSide,
  });

  const neonLimeMat = new THREE.MeshStandardMaterial({
    color: 0xd8f03c,
    emissive: new THREE.Color(0xd8f03c),
    emissiveIntensity: 2.8,
  });

  /* ══════════════════════════════════════════════════════════════════
     LAYER 0 & 1: Technical Grid Backdrop & Glowing Halo
     ══════════════════════════════════════════════════════════════════ */
  const bgGroup = new THREE.Group();
  scene.add(bgGroup);

  // Grid Backdrop Plane
  const gridTex = loadSafeTexture('/assets/services/grid-backdrop.png');
  gridTex.wrapS = THREE.RepeatWrapping;
  gridTex.wrapT = THREE.RepeatWrapping;
  gridTex.repeat.set(2, 2);

  const gridMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(36, 22),
    new THREE.MeshBasicMaterial({
      map: gridTex,
      transparent: true,
      opacity: theme === 'dark' ? 0.95 : 0.35,
    })
  );
  gridMesh.position.set(0, 0, -4.5);
  bgGroup.add(gridMesh);

  // Fluorescent Lime Radiant Halo behind Head
  const haloTex = loadSafeTexture('/assets/services/halo-glow.png');
  const haloMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(7.2, 7.2),
    new THREE.MeshBasicMaterial({
      map: haloTex,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  haloMesh.position.set(1.0, 0.6, -3.2);
  bgGroup.add(haloMesh);

  // Wireframe Geodesic Sphere (upper background)
  const sphereGeo = new THREE.IcosahedronGeometry(1.6, 2);
  const sphereWireMat = new THREE.MeshBasicMaterial({
    color: 0x2563eb,
    wireframe: true,
    transparent: true,
    opacity: 0.38,
  });
  const wireSphere = new THREE.Mesh(sphereGeo, sphereWireMat);
  wireSphere.position.set(-1.4, 3.4, -3.0);
  bgGroup.add(wireSphere);

  /* ══════════════════════════════════════════════════════════════════
     LAYER 2 & 3: Central Sculpture Head & Sliced Cloud Panels
     ══════════════════════════════════════════════════════════════════ */
  const headGroup = new THREE.Group();
  scene.add(headGroup);

  // 1. Sliced Cumulus Clouds Vertical Panels (staggered behind head)
  const cloudTex = loadSafeTexture('/assets/hero/machine-cloud.webp');
  const cloudSliceW = 1.6;
  const cloudSliceH = 4.4;

  [-0.2, 0.4, 1.0].forEach((xOff, i) => {
    const cloudSlice = new THREE.Mesh(
      new THREE.PlaneGeometry(cloudSliceW, cloudSliceH),
      new THREE.MeshStandardMaterial({
        map: cloudTex,
        transparent: true,
        opacity: 0.92,
        roughness: 0.4,
      })
    );
    cloudSlice.position.set(0.6 + xOff, 1.2, -1.2 + i * 0.25);
    cloudSlice.rotation.y = -0.18;
    cloudSlice.rotation.z = 0.04;
    headGroup.add(cloudSlice);
  });

  // 2. Central Sculpture Portrait Plane
  const headTex = loadSafeTexture('/assets/services/center-head-alpha.webp');
  const headMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(3.8, 4.8),
    new THREE.MeshStandardMaterial({
      map: headTex,
      transparent: true,
      roughness: 0.65,
      metalness: 0.08,
      side: THREE.DoubleSide,
    })
  );
  headMesh.position.set(0.6, 0.2, 0.1);
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  // 3. Flowing Cobalt Silk Ribbon (curving 3D tube across neck & behind head)
  const silkCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.2, -0.6, -0.4),
    new THREE.Vector3(-0.8, -0.2, 0.4),
    new THREE.Vector3(0.4, 0.1, 0.6),
    new THREE.Vector3(1.6, 0.6, 0.2),
    new THREE.Vector3(2.4, 1.4, -0.4),
    new THREE.Vector3(1.8, 2.2, -1.0),
  ]);
  const silkGeo = new THREE.TubeGeometry(silkCurve, 48, 0.22, 12, false);
  const silkMesh = new THREE.Mesh(silkGeo, cobaltMat);
  headGroup.add(silkMesh);

  // 4. Complementary Liquid Chrome Ribbon
  const chromeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.8, -1.2, 0.2),
    new THREE.Vector3(-0.6, -0.8, 0.8),
    new THREE.Vector3(0.8, -0.4, 0.7),
    new THREE.Vector3(2.0, 0.0, 0.3),
    new THREE.Vector3(2.8, 0.8, -0.2),
  ]);
  const chromeGeo = new THREE.TubeGeometry(chromeCurve, 40, 0.14, 10, false);
  const chromeRibbon = new THREE.Mesh(chromeGeo, chromeMat);
  headGroup.add(chromeRibbon);

  /* ══════════════════════════════════════════════════════════════════
     LAYER 4: The 6 Capability Installations
     ══════════════════════════════════════════════════════════════════ */
  const stationGroup: THREE.Group[] = [];

  // ────────────────────────────────────────────────────────────────
  // Station 0: Digital Strategy (Tilted Wave Panel + Target Rings)
  // ────────────────────────────────────────────────────────────────
  const waveGroup = new THREE.Group();
  const s0 = STATIONS[0];
  waveGroup.position.set(s0.position[0], s0.position[1], s0.position[2]);

  const waveTex = loadSafeTexture('/assets/services/panel-wave-alpha.webp');
  const wavePanel = new THREE.Mesh(
    new THREE.PlaneGeometry(2.5, 2.0),
    new THREE.MeshStandardMaterial({
      map: waveTex,
      transparent: true,
      roughness: 0.25,
      metalness: 0.15,
      side: THREE.DoubleSide,
    })
  );
  wavePanel.rotation.z = 0.06;
  wavePanel.rotation.y = 0.18;
  waveGroup.add(wavePanel);

  // Wireframe Target Rings
  const targetRingGeo1 = new THREE.RingGeometry(0.75, 0.78, 36);
  const targetRing1 = new THREE.Mesh(targetRingGeo1, neonLimeMat);
  targetRing1.position.set(0.4, 0.2, 0.08);
  targetRing1.rotation.y = 0.18;
  waveGroup.add(targetRing1);

  const targetRingGeo2 = new THREE.RingGeometry(0.4, 0.43, 32);
  const targetRing2 = new THREE.Mesh(targetRingGeo2, cobaltMat);
  targetRing2.position.set(0.4, 0.2, 0.1);
  targetRing2.rotation.y = 0.18;
  waveGroup.add(targetRing2);

  // Target Crosshair
  const crossGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-0.9, 0, 0), new THREE.Vector3(0.9, 0, 0),
    new THREE.Vector3(0, -0.9, 0), new THREE.Vector3(0, 0.9, 0),
  ]);
  const crossMat = new THREE.LineBasicMaterial({ color: 0xd8f03c, transparent: true, opacity: 0.8 });
  const crossLines = new THREE.LineSegments(crossGeo, crossMat);
  crossLines.position.set(0.4, 0.2, 0.12);
  crossLines.rotation.y = 0.18;
  waveGroup.add(crossLines);

  scene.add(waveGroup);
  stationGroup.push(waveGroup);

  // ────────────────────────────────────────────────────────────────
  // Station 1: Web Development (3D Browser Frame + Code Badge)
  // ────────────────────────────────────────────────────────────────
  const browserGroup = new THREE.Group();
  const s1 = STATIONS[1];
  browserGroup.position.set(s1.position[0], s1.position[1], s1.position[2]);

  const browserTex = loadSafeTexture('/assets/services/panel-browser-alpha.webp');
  const browserPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 2.0),
    new THREE.MeshStandardMaterial({
      map: browserTex,
      transparent: true,
      roughness: 0.15,
      metalness: 0.25,
      side: THREE.DoubleSide,
    })
  );
  browserPanel.rotation.y = -0.15;
  browserPanel.rotation.z = -0.04;
  browserGroup.add(browserPanel);

  // 3D Browser Titanium Outer Frame Bevel
  const frameGeo = new THREE.BoxGeometry(2.7, 2.1, 0.08);
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x182438,
    roughness: 0.35,
    metalness: 0.85,
    wireframe: false,
  });
  const browserFrameMesh = new THREE.Mesh(frameGeo, frameMat);
  browserFrameMesh.position.set(0, 0, -0.05);
  browserFrameMesh.rotation.y = -0.15;
  browserFrameMesh.rotation.z = -0.04;
  browserGroup.add(browserFrameMesh);

  // Code bracket badge </>
  const badgeGeo = new THREE.BoxGeometry(0.65, 0.32, 0.08);
  const codeBadge = new THREE.Mesh(badgeGeo, cobaltMat);
  codeBadge.position.set(0.6, 0.75, 0.12);
  codeBadge.rotation.y = -0.15;
  browserGroup.add(codeBadge);

  scene.add(browserGroup);
  stationGroup.push(browserGroup);

  // ────────────────────────────────────────────────────────────────
  // Station 2: UI/UX Design (Layered Glass Sheets + Toggle + Cursor)
  // ────────────────────────────────────────────────────────────────
  const uiuxGroup = new THREE.Group();
  const s2 = STATIONS[2];
  uiuxGroup.position.set(s2.position[0], s2.position[1], s2.position[2]);

  const uiuxTex = loadSafeTexture('/assets/services/panel-uiux-alpha.webp');

  // Rear glass backing sheet
  const glassSheetRear = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.0), frostedGlassMat);
  glassSheetRear.position.set(0, 0, -0.18);
  glassSheetRear.rotation.y = -0.22;
  glassSheetRear.rotation.z = 0.05;
  uiuxGroup.add(glassSheetRear);

  // Middle main panel
  const uiuxPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(2.5, 1.9),
    new THREE.MeshStandardMaterial({
      map: uiuxTex,
      transparent: true,
      roughness: 0.1,
      metalness: 0.2,
      side: THREE.DoubleSide,
    })
  );
  uiuxPanel.rotation.y = -0.22;
  uiuxPanel.rotation.z = 0.05;
  uiuxGroup.add(uiuxPanel);

  // 3D Fluorescent Lime Toggle Switch
  const toggleTrackGeo = new THREE.CapsuleGeometry(0.12, 0.36, 12, 16);
  toggleTrackGeo.rotateZ(Math.PI / 2);
  const toggleTrack = new THREE.Mesh(toggleTrackGeo, neonLimeMat);
  toggleTrack.position.set(-0.35, 0.45, 0.1);
  toggleTrack.rotation.y = -0.22;
  uiuxGroup.add(toggleTrack);

  const toggleKnobGeo = new THREE.SphereGeometry(0.14, 16, 16);
  const toggleKnob = new THREE.Mesh(toggleKnobGeo, chromeMat);
  toggleKnob.position.set(-0.24, 0.45, 0.15);
  toggleKnob.rotation.y = -0.22;
  uiuxGroup.add(toggleKnob);

  // Crisp 3D Pointer Cursor
  const cursorTex = loadSafeTexture('/assets/services/pointer-cursor.png');
  const cursorMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.65, 0.65),
    new THREE.MeshBasicMaterial({
      map: cursorTex,
      transparent: true,
      depthTest: true,
      side: THREE.DoubleSide,
    })
  );
  cursorMesh.position.set(0.15, -0.15, 0.26);
  cursorMesh.rotation.y = -0.15;
  uiuxGroup.add(cursorMesh);

  scene.add(uiuxGroup);
  stationGroup.push(uiuxGroup);

  // ────────────────────────────────────────────────────────────────
  // Station 3: Social Media (Sphere + Orbital Rings + Floating Badges)
  // ────────────────────────────────────────────────────────────────
  const socialGroup = new THREE.Group();
  const s3 = STATIONS[3];
  socialGroup.position.set(s3.position[0], s3.position[1], s3.position[2]);

  // Dark Textured Cratered Sphere
  const socialTex = loadSafeTexture('/assets/services/panel-social-alpha.webp');
  const globeGeo = new THREE.SphereGeometry(1.05, 36, 36);
  const globeMat = new THREE.MeshStandardMaterial({
    color: 0x181e28,
    map: socialTex,
    roughness: 0.45,
    metalness: 0.5,
  });
  const globeMesh = new THREE.Mesh(globeGeo, globeMat);
  socialGroup.add(globeMesh);

  // Glowing Yellow Orbital Ring
  const ringGeo = new THREE.TorusGeometry(1.48, 0.035, 16, 64);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xd8f03c,
    emissive: new THREE.Color(0xd8f03c),
    emissiveIntensity: 2.2,
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.rotation.x = Math.PI / 2.8;
  ringMesh.rotation.y = 0.35;
  socialGroup.add(ringMesh);

  // Floating Social Pill Badges (Play, Heart, Chat)
  const badgePillGeo = new THREE.BoxGeometry(0.48, 0.36, 0.08);
  const badgeWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.15,
    metalness: 0.1,
  });

  const badgePlay = new THREE.Mesh(badgePillGeo, badgeWhiteMat);
  badgePlay.position.set(0.9, 0.9, 0.6);
  socialGroup.add(badgePlay);

  const badgeHeart = new THREE.Mesh(badgePillGeo, badgeWhiteMat);
  badgeHeart.position.set(1.2, -0.2, 0.8);
  socialGroup.add(badgeHeart);

  const badgeChat = new THREE.Mesh(badgePillGeo, badgeWhiteMat);
  badgeChat.position.set(-0.8, -0.6, 0.7);
  socialGroup.add(badgeChat);

  scene.add(socialGroup);
  stationGroup.push(socialGroup);

  // ────────────────────────────────────────────────────────────────
  // Station 4: Mobile App Development (Titanium Phone + Glass Card Fan)
  // ────────────────────────────────────────────────────────────────
  const phoneGroup = new THREE.Group();
  const s4 = STATIONS[4];
  phoneGroup.position.set(s4.position[0], s4.position[1], s4.position[2]);

  // Phone Chassis (rounded box)
  const phoneChassisGeo = new THREE.BoxGeometry(1.35, 2.7, 0.12);
  const phoneChassisMat = new THREE.MeshStandardMaterial({
    color: 0x1b2029,
    roughness: 0.28,
    metalness: 0.88,
    envMap,
    envMapIntensity: 1.4,
  });
  const phoneChassis = new THREE.Mesh(phoneChassisGeo, phoneChassisMat);
  phoneChassis.rotation.y = 0.22;
  phoneChassis.rotation.z = -0.06;
  phoneGroup.add(phoneChassis);

  // Phone Screen
  const mobileTex = loadSafeTexture('/assets/services/panel-mobile-alpha.webp');
  const screenGeo = new THREE.PlaneGeometry(1.22, 2.5);
  const screenMat = new THREE.MeshStandardMaterial({
    map: mobileTex,
    roughness: 0.08,
    metalness: 0.2,
    emissive: new THREE.Color(0x0a2266),
    emissiveIntensity: 0.4,
  });
  const phoneScreen = new THREE.Mesh(screenGeo, screenMat);
  phoneScreen.position.set(0, 0, 0.07);
  phoneScreen.rotation.y = 0.22;
  phoneScreen.rotation.z = -0.06;
  phoneGroup.add(phoneScreen);

  // Fanning Translucent Glass Card Slices
  [-0.6, -0.2, 0.3, 0.7].forEach((xOff, i) => {
    const cardSlice = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.8), frostedGlassMat);
    cardSlice.position.set(xOff + 0.8, -0.1, -0.3 + i * 0.15);
    cardSlice.rotation.y = 0.35 + i * 0.05;
    cardSlice.rotation.z = -0.05;
    phoneGroup.add(cardSlice);
  });

  scene.add(phoneGroup);
  stationGroup.push(phoneGroup);

  // ────────────────────────────────────────────────────────────────
  // Station 5: Software Development (Modular Isometric Cubes + Golden Seams)
  // ────────────────────────────────────────────────────────────────
  const cubesGroup = new THREE.Group();
  const s5 = STATIONS[5];
  cubesGroup.position.set(s5.position[0], s5.position[1], s5.position[2]);

  const softwareTex = loadSafeTexture('/assets/services/panel-software-alpha.webp');
  const cubeGeo = new THREE.BoxGeometry(0.65, 0.65, 0.65);

  const concreteMat = new THREE.MeshStandardMaterial({
    color: 0x222934,
    roughness: 0.75,
    metalness: 0.05,
  });

  const blueAcrylicMat = new THREE.MeshStandardMaterial({
    color: 0x1945f5,
    roughness: 0.15,
    metalness: 0.4,
    emissive: new THREE.Color(0x1945f5),
    emissiveIntensity: 0.65,
    transparent: true,
    opacity: 0.88,
  });

  // 8 Isometric Cubes in structured cluster
  const cubeOffsets: [number, number, number, number][] = [
    [-0.5, 0.4, 0, 0], // blue acrylic
    [0.2, 0.4, 0.2, 1], // glass
    [-0.5, -0.3, 0.3, 2], // concrete
    [0.3, -0.3, 0, 0], // blue acrylic
    [-0.1, 0.1, 0.6, 0], // blue acrylic
    [0.7, 0.1, 0.4, 1], // glass
    [-0.8, 0.1, -0.3, 2], // concrete
    [0.1, 0.8, -0.2, 1], // glass
  ];

  cubeOffsets.forEach(([cx, cy, cz, type]) => {
    const mat = type === 0 ? blueAcrylicMat : type === 1 ? frostedGlassMat : concreteMat;
    const cMesh = new THREE.Mesh(cubeGeo, mat);
    cMesh.position.set(cx, cy, cz);
    cMesh.rotation.x = 0.35;
    cMesh.rotation.y = 0.45;
    cubesGroup.add(cMesh);
  });

  // Central glowing </> code glyph
  const glyphGeo = new THREE.PlaneGeometry(0.8, 0.8);
  const glyphMat = new THREE.MeshBasicMaterial({
    map: softwareTex,
    transparent: true,
    side: THREE.DoubleSide,
  });
  const glyphMesh = new THREE.Mesh(glyphGeo, glyphMat);
  glyphMesh.position.set(0, 0, 0.7);
  cubesGroup.add(glyphMesh);

  scene.add(cubesGroup);
  stationGroup.push(cubesGroup);

  /* ══════════════════════════════════════════════════════════════════
     LAYER 5: Sweeping Cream Foreground Typography Ribbon
     ══════════════════════════════════════════════════════════════════ */
  const ribbonTex = loadSafeTexture('/assets/services/ribbon-texture.png');
  ribbonTex.wrapS = THREE.RepeatWrapping;
  ribbonTex.wrapT = THREE.ClampToEdgeWrapping;
  ribbonTex.repeat.set(1, 1);

  const ribbonCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-6.5, -2.4, 2.5),
    new THREE.Vector3(-4.0, -2.8, 2.8),
    new THREE.Vector3(-1.0, -2.9, 2.6),
    new THREE.Vector3(2.2, -2.5, 2.0),
    new THREE.Vector3(4.8, -1.8, 1.2),
    new THREE.Vector3(6.2, -0.8, 0.2),
    new THREE.Vector3(5.6, 0.4, -0.8),
  ]);

  // Create ribbon as an extruded strip with normal facing camera
  const ribbonPoints = ribbonCurve.getPoints(80);
  const ribbonGeom = new THREE.BufferGeometry();
  const vertices: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const ribbonWidth = 0.48;

  for (let i = 0; i < ribbonPoints.length; i++) {
    const p = ribbonPoints[i];
    const u = i / (ribbonPoints.length - 1);

    // Tangent and normal vectors
    const nextP = ribbonPoints[Math.min(i + 1, ribbonPoints.length - 1)];
    const prevP = ribbonPoints[Math.max(i - 1, 0)];
    const tangent = new THREE.Vector3().subVectors(nextP, prevP).normalize();
    const up = new THREE.Vector3(0, 1, 0.2).normalize();
    const normal = new THREE.Vector3().crossVectors(tangent, up).normalize().multiplyScalar(ribbonWidth);

    vertices.push(p.x - normal.x, p.y - normal.y, p.z - normal.z);
    uvs.push(u, 0);

    vertices.push(p.x + normal.x, p.y + normal.y, p.z + normal.z);
    uvs.push(u, 1);

    if (i < ribbonPoints.length - 1) {
      const idx = i * 2;
      indices.push(idx, idx + 1, idx + 2);
      indices.push(idx + 1, idx + 3, idx + 2);
    }
  }

  ribbonGeom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  ribbonGeom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  ribbonGeom.setIndex(indices);
  ribbonGeom.computeVertexNormals();

  const ribbonMat = new THREE.MeshStandardMaterial({
    map: ribbonTex,
    roughness: 0.4,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });

  const ribbonMesh = new THREE.Mesh(ribbonGeom, ribbonMat);
  scene.add(ribbonMesh);

  /* ── Cleanup Function ── */
  const dispose = () => {
    envMap.dispose();
    scene.clear();
  };

  return {
    scene,
    stationGroup,
    ribbonMesh,
    headGroup,
    bgGroup,
    cursorMesh,
    socialGroup,
    phoneGroup,
    cubesGroup,
    dispose,
  };
}
