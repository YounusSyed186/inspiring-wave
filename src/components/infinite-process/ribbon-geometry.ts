import * as THREE from 'three';

export interface RibbonFrame {
  position: THREE.Vector3;
  tangent: THREE.Vector3;
  width: THREE.Vector3;
  normal: THREE.Vector3;
}

export interface RibbonGeometryResult {
  geometry: THREE.BufferGeometry;
  frames: RibbonFrame[];
  basePositions: Float32Array;
  deformation: Float32Array;
  halfWidth: number;
  halfThickness: number;
  loopLength: number;
  pointAt: (distance: number) => THREE.Vector3;
  frameAt: (distance: number) => RibbonFrame;
  surfacePointAt: (distance: number, across?: number, lift?: number) => THREE.Vector3;
  outerRimPoints: (uStart: number, uEnd: number, samples: number, side: 'top' | 'bottom') => THREE.Vector3[];
}

const TAU = Math.PI * 2;

const centerPoint = (parameter: number, target = new THREE.Vector3()) => {
  const angle = parameter * TAU;
  // A deliberately broad, low figure-eight. Keeping the two lobes wider than
  // they are tall makes the five process stations read as one editorial object.
  const x = -5.18 * Math.cos(angle);
  const y = 1.78 * Math.sin(angle * 2);
  // The crossing is real 3D geometry, but shallow enough that the rear band
  // never disappears into a knot from the default camera.
  const z = 0.58 * Math.sin(angle) - 0.2 * Math.sin(angle * 2);
  return target.set(x, y, z);
};

function createArcLookup(samples = 1600) {
  const parameters = new Float32Array(samples + 1);
  const lengths = new Float32Array(samples + 1);
  const previous = centerPoint(0);
  const current = new THREE.Vector3();
  let total = 0;
  for (let i = 1; i <= samples; i += 1) {
    const parameter = i / samples;
    centerPoint(parameter, current);
    total += current.distanceTo(previous);
    parameters[i] = parameter;
    lengths[i] = total;
    previous.copy(current);
  }
  for (let i = 0; i <= samples; i += 1) lengths[i] /= total;
  const parameterAtDistance = (distance: number) => {
    const wrapped = ((distance % 1) + 1) % 1;
    const target = THREE.MathUtils.clamp(wrapped, 0, 1);
    let low = 0;
    let high = samples;
    while (low < high) {
      const middle = (low + high) >> 1;
      if (lengths[middle] < target) low = middle + 1;
      else high = middle;
    }
    const upper = Math.max(1, low);
    const lower = upper - 1;
    const span = Math.max(0.000001, lengths[upper] - lengths[lower]);
    return THREE.MathUtils.lerp(parameters[lower], parameters[upper], (target - lengths[lower]) / span);
  };
  return { parameterAtDistance, totalLength: total };
}

function computePeriodicFrame(parameter: number): RibbonFrame {
  const epsilon = 1 / 8000;
  const position = centerPoint(parameter);
  const nextPoint = centerPoint((parameter + epsilon) % 1);
  const previousPoint = centerPoint((parameter - epsilon + 1) % 1);
  const tangent = new THREE.Vector3().subVectors(nextPoint, previousPoint).normalize();

  const angle = parameter * TAU;
  const refNormal = new THREE.Vector3(
    -0.2 * Math.cos(angle),
    0.22 * Math.sin(angle * 2),
    1.0,
  ).normalize();

  const normal = refNormal.clone().addScaledVector(tangent, -refNormal.dot(tangent)).normalize();
  const width = new THREE.Vector3().crossVectors(normal, tangent).normalize();

  return { position, tangent, width, normal };
}

export function createInfinityRibbonGeometry(longitudinalSegments = 360, widthSegments = 14): RibbonGeometryResult {
  const { parameterAtDistance, totalLength } = createArcLookup();
  const frames: RibbonFrame[] = [];

  for (let i = 0; i <= longitudinalSegments; i += 1) {
    const distance = i / longitudinalSegments;
    const parameter = i === longitudinalSegments ? 0 : parameterAtDistance(distance);
    frames.push(computePeriodicFrame(parameter));
  }
  frames[longitudinalSegments] = {
    position: frames[0].position.clone(),
    tangent: frames[0].tangent.clone(),
    width: frames[0].width.clone(),
    normal: frames[0].normal.clone(),
  };

  const sectionVertexCount = (widthSegments + 1) * 2;
  const vertexCount = (longitudinalSegments + 1) * sectionVertexCount;
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const deformation = new Float32Array(vertexCount * 3);
  const halfWidth = 0.84;
  const halfThickness = 0.045;

  const writeVertex = (vertex: number, frame: RibbonFrame, across: number, side: number, distance: number) => {
    const widthOffset = THREE.MathUtils.lerp(-halfWidth, halfWidth, across);
    const camber = Math.sin(across * Math.PI) * 0.065;
    const point = frame.position.clone()
      .addScaledVector(frame.width, widthOffset)
      .addScaledVector(frame.normal, halfThickness * side + camber);
    positions.set(point.toArray(), vertex * 3);

    const edgeTilt = (across - 0.5) * -0.26;
    const vertexNormal = frame.normal.clone()
      .multiplyScalar(side)
      .addScaledVector(frame.width, edgeTilt * side)
      .normalize();
    normals.set(vertexNormal.toArray(), vertex * 3);

    uvs.set([distance, across], vertex * 2);

    const designDistance = Math.abs(distance - 0.5) / 0.18;
    const designWeight = designDistance < 1 ? Math.pow(1 - designDistance, 2) : 0;
    const acrossWeight = Math.sin(across * Math.PI);
    const vector = frame.normal.clone().multiplyScalar(designWeight * acrossWeight * 0.22)
      .addScaledVector(frame.width, Math.sin(distance * TAU * 2) * designWeight * 0.05);
    deformation.set(vector.toArray(), vertex * 3);
  };

  for (let i = 0; i <= longitudinalSegments; i += 1) {
    for (let j = 0; j <= widthSegments; j += 1) {
      const across = j / widthSegments;
      const base = i * sectionVertexCount + j * 2;
      writeVertex(base, frames[i], across, 1, i / longitudinalSegments);
      writeVertex(base + 1, frames[i], across, -1, i / longitudinalSegments);
    }
  }

  const indices: number[] = [];
  const geometry = new THREE.BufferGeometry();
  for (let i = 0; i < longitudinalSegments; i += 1) {
    for (let j = 0; j < widthSegments; j += 1) {
      const a = i * sectionVertexCount + j * 2;
      const b = (i + 1) * sectionVertexCount + j * 2;
      const c = b + 2;
      const d = a + 2;
      indices.push(a, b, d, b, c, d);
      indices.push(a + 1, d + 1, b + 1, b + 1, d + 1, c + 1);
    }
    const leftA = i * sectionVertexCount;
    const leftB = (i + 1) * sectionVertexCount;
    const rightA = leftA + widthSegments * 2;
    const rightB = leftB + widthSegments * 2;
    indices.push(leftA, leftA + 1, leftB, leftB, leftA + 1, leftB + 1);
    indices.push(rightA, rightB, rightA + 1, rightB, rightB + 1, rightA + 1);
  }

  geometry.setIndex(indices);
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.computeBoundingSphere();

  const frameAt = (distance: number): RibbonFrame => {
    const wrapped = ((distance % 1) + 1) % 1;
    const scaled = wrapped * longitudinalSegments;
    const idx0 = Math.floor(scaled) % longitudinalSegments;
    const idx1 = (idx0 + 1) % longitudinalSegments;
    const t = scaled - Math.floor(scaled);
    const f0 = frames[idx0];
    const f1 = frames[idx1];
    return {
      position: f0.position.clone().lerp(f1.position, t),
      tangent: f0.tangent.clone().lerp(f1.tangent, t).normalize(),
      width: f0.width.clone().lerp(f1.width, t).normalize(),
      normal: f0.normal.clone().lerp(f1.normal, t).normalize(),
    };
  };

  const outerRimPoints = (uStart: number, uEnd: number, samples: number, side: 'top' | 'bottom') => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= samples; i += 1) {
      const u = THREE.MathUtils.lerp(uStart, uEnd, i / samples);
      const f = frameAt(u);
      const sign = side === 'bottom' ? (f.width.y <= 0 ? 1 : -1) : (f.width.y >= 0 ? 1 : -1);
      pts.push(
        f.position.clone()
          .addScaledVector(f.width, halfWidth * 1.015 * sign)
          .addScaledVector(f.normal, 0.025),
      );
    }
    return pts;
  };

  const surfacePointAt = (distance: number, across = 0.5, lift = 0) => {
    const frame = frameAt(distance);
    const clampedAcross = THREE.MathUtils.clamp(across, 0, 1);
    const widthOffset = THREE.MathUtils.lerp(-halfWidth, halfWidth, clampedAcross);
    const camber = Math.sin(clampedAcross * Math.PI) * 0.065;
    return frame.position.clone()
      .addScaledVector(frame.width, widthOffset)
      .addScaledVector(frame.normal, halfThickness + camber + lift);
  };

  return {
    geometry,
    frames,
    basePositions: positions.slice(),
    deformation,
    halfWidth,
    halfThickness,
    loopLength: totalLength,
    pointAt: (distance: number) => centerPoint(parameterAtDistance(((distance % 1) + 1) % 1)),
    frameAt,
    surfacePointAt,
    outerRimPoints,
  };
}

/**
 * Builds a curved 3D surface-conforming decal patch centered at `uCenter` on the ribbon,
 * oriented at a clean editorial tilt angle `tiltAngle` (in radians) so that even on the
 * far-right turn (`03 / DESIGN`), the typography reads horizontally left-to-right while
 * curving smoothly over the 3D cambered surface of the ribbon.
 */
export function createCurvedPhaseDecal(
  ribbon: RibbonGeometryResult,
  uCenter: number,
  worldWidth = 2.05,
  worldHeight = 1.02,
  tiltAngle = 0,
  segsU = 24,
  segsV = 10,
  normalOffset = 0.052,
) {
  const vertexCount = (segsU + 1) * (segsV + 1);
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const indices: number[] = [];

  for (let iu = 0; iu < segsU; iu += 1) {
    for (let iv = 0; iv < segsV; iv += 1) {
      const a = iu * (segsV + 1) + iv;
      const b = (iu + 1) * (segsV + 1) + iv;
      const c = b + 1;
      const d = a + 1;
      indices.push(a, b, d, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(indices);
  const posAttr = new THREE.BufferAttribute(positions, 3);
  const normAttr = new THREE.BufferAttribute(normals, 3);
  const uvAttr = new THREE.BufferAttribute(uvs, 2);
  geometry.setAttribute('position', posAttr);
  geometry.setAttribute('normal', normAttr);
  geometry.setAttribute('uv', uvAttr);

  // UVs describe the print patch and never change when the patch is reshaped.
  // Keeping them immutable lets the scene remap them into a shared atlas once.
  for (let iu = 0; iu <= segsU; iu += 1) {
    for (let iv = 0; iv <= segsV; iv += 1) {
      const idx = iu * (segsV + 1) + iv;
      uvAttr.setXY(idx, iu / segsU, iv / segsV);
    }
  }
  uvAttr.needsUpdate = true;

  const updateAt = (centerU: number, deformAmount = 0, waveTime = 0) => {
    const centerFrame = ribbon.frameAt(centerU);
    // Orient every label left-to-right and upright in screen space while still
    // sampling the actual ribbon surface. This avoids floating billboard text
    // and prevents labels on the return half of the loop from reading upside-down.
    const alongSign = centerFrame.tangent.x >= 0 ? 1 : -1;
    const acrossSign = centerFrame.width.y >= 0 ? 1 : -1;
    const cosTilt = Math.cos(tiltAngle);
    const sinTilt = Math.sin(tiltAngle);

    for (let iu = 0; iu <= segsU; iu += 1) {
      const fracU = iu / segsU;
      const localX = (fracU - 0.5) * worldWidth;

      for (let iv = 0; iv <= segsV; iv += 1) {
        const fracV = iv / segsV;
        const localY = (fracV - 0.5) * worldHeight;

        const along = localX * alongSign * cosTilt - localY * acrossSign * sinTilt;
        const cross = localX * alongSign * sinTilt + localY * acrossSign * cosTilt;
        const deltaU = along / ribbon.loopLength;
        const uSample = ((centerU + deltaU) % 1 + 1) % 1;
        const sampleFrame = ribbon.frameAt(uSample);
        const across = THREE.MathUtils.clamp(0.5 + cross / (ribbon.halfWidth * 2), 0.035, 0.965);
        const camber = Math.sin(across * Math.PI) * 0.065;

        const designDistance = Math.abs(uSample - 0.5) / 0.18;
        const designWeight = designDistance < 1 ? Math.pow(1 - designDistance, 2) : 0;
        const acrossWeight = Math.sin(across * Math.PI);
        const waveLift = Math.sin(uSample * TAU * 2 - waveTime * 1.65) * 0.018;
        const surfacePoint = sampleFrame.position.clone()
          .addScaledVector(sampleFrame.width, THREE.MathUtils.lerp(-ribbon.halfWidth, ribbon.halfWidth, across))
          .addScaledVector(
            sampleFrame.normal,
            ribbon.halfThickness + camber + normalOffset + designWeight * acrossWeight * 0.22 * deformAmount + waveLift,
          );

        const idx = iu * (segsV + 1) + iv;
        posAttr.setXYZ(idx, surfacePoint.x, surfacePoint.y, surfacePoint.z);
        normAttr.setXYZ(idx, sampleFrame.normal.x, sampleFrame.normal.y, sampleFrame.normal.z);
      }
    }
    posAttr.needsUpdate = true;
    normAttr.needsUpdate = true;
    geometry.computeBoundingSphere();
  };

  updateAt(uCenter, 0, 0);
  return { geometry, updateAt };
}

/**
 * Builds the 3D vaulted inner-arch panel tucked directly beneath the upper-left (`01 / DISCOVER`)
 * or upper-right (`02 / DEFINE`) arch, oriented so artwork (like the Halftone Engraved Eye
 * or Monochrome Wave Engraving) sits upright and curves naturally into the loop cavity.
 */
export function createInnerArchPanel(
  centerX: number,
  centerY: number,
  centerZ: number,
  width: number,
  height: number,
  archTilt: number,
  segsU = 28,
  segsV = 14,
) {
  const vertexCount = (segsU + 1) * (segsV + 1);
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const indices: number[] = [];

  for (let iu = 0; iu <= segsU; iu += 1) {
    const u = iu / segsU;
    const lx = (u - 0.5) * width;
    for (let iv = 0; iv <= segsV; iv += 1) {
      const v = iv / segsV;
      const ly = (v - 0.5) * height;
      // Arch curve following the underside of the loop + recessed Z vault depth
      const curveY = Math.cos((u - 0.5) * Math.PI * 0.85) * 0.36 - 0.18;
      const curveZ = -Math.pow(u - 0.5, 2) * 0.85 - (1 - v) * 0.35;

      const cosT = Math.cos(archTilt);
      const sinT = Math.sin(archTilt);
      const rx = lx * cosT - (ly + curveY) * sinT;
      const ry = lx * sinT + (ly + curveY) * cosT;

      const idx = iu * (segsV + 1) + iv;
      positions.set([centerX + rx, centerY + ry, centerZ + curveZ], idx * 3);
      normals.set([-(u - 0.5) * 0.25, -0.15, 0.96], idx * 3);
      uvs.set([u, v], idx * 2);
    }
  }

  for (let iu = 0; iu < segsU; iu += 1) {
    for (let iv = 0; iv < segsV; iv += 1) {
      const a = iu * (segsV + 1) + iv;
      const b = (iu + 1) * (segsV + 1) + iv;
      const c = b + 1;
      const d = a + 1;
      indices.push(a, b, d, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(indices);
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.computeBoundingSphere();
  return geometry;
}
