import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollMotion, ScrollMotionState } from './scroll-engine';
import { waveConfig } from './wave-config';
import { adaptiveQuality } from '@/lib/performance/AdaptiveQuality';
import { sceneMetricsRegistry } from '@/lib/performance/SceneMetricsRegistry';

const MEDIA_SELECTOR = [
  '.work-media img',
  '.service-stage img',
  '.method-object img',
  '.studio-layout figure img',
  '.detail-media img',
  '.listing-work img',
  '.listing-editorial img',
].join(',');

const PLANE_VERTEX = `#version 300 es
uniform vec2 uResolution;
uniform vec4 uRect;
out vec2 vUv;
void main() {
  vec2 corner = vec2(float(gl_VertexID & 1), float((gl_VertexID >> 1) & 1));
  vUv = corner;
  vec2 pixel = uRect.xy + corner * uRect.zw;
  gl_Position = vec4(pixel.x / uResolution.x * 2.0 - 1.0, 1.0 - pixel.y / uResolution.y * 2.0, 0.0, 1.0);
}`;

const PLANE_FRAGMENT = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uTexture;
uniform vec4 uUv;
uniform float uAlpha;
out vec4 outColor;
void main() {
  vec4 color = texture(uTexture, uUv.xy + vUv * uUv.zw);
  outColor = vec4(color.rgb, color.a * uAlpha);
}`;

const BOW_VERTEX = `#version 300 es
out vec2 vUv;
void main() {
  vec2 point = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  vUv = point;
  gl_Position = vec4(point * 2.0 - 1.0, 0.0, 1.0);
}`;

const BOW_FRAGMENT = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uScene;
uniform vec2 uResolution;
uniform float uCurve;
uniform float uCurvePower;
uniform float uCurveEdge;
out vec4 outColor;
void main() {
  vec2 screenPoint = vec2(vUv.x * uResolution.x, (1.0 - vUv.y) * uResolution.y);
  float across = max(sin(3.14159265 * screenPoint.x / uResolution.x), 0.0);
  float edge = smoothstep(0.0, uCurveEdge, screenPoint.y)
    * smoothstep(0.0, uCurveEdge, uResolution.y - screenPoint.y);
  float bowY = uCurve * pow(across, uCurvePower) * edge;
  vec2 source = screenPoint - vec2(0.0, bowY);
  vec2 sourceUv = vec2(source.x / uResolution.x, 1.0 - source.y / uResolution.y);
  vec4 color = texture(uScene, sourceUv);
  if (color.a < 0.01) discard;
  outColor = color;
}`;

type Uniforms = Record<string, WebGLUniformLocation>;
type MediaPlane = {
  image: HTMLImageElement;
  texture: WebGLTexture;
  active: boolean;
  createdAt: number;
};

function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Unable to create wave shader.');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) || 'Unknown shader compile error.';
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext, vertex: string, fragment: string) {
  const program = gl.createProgram();
  if (!program) throw new Error('Unable to create wave program.');
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertex);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragment);
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) || 'Unknown shader link error.';
    gl.deleteProgram(program);
    throw new Error(message);
  }
  return program;
}

function uniforms(gl: WebGL2RenderingContext, program: WebGLProgram, names: string[]) {
  return Object.fromEntries(names.map(name => {
    const location = gl.getUniformLocation(program, name);
    if (!location) throw new Error(`Missing wave uniform ${name}.`);
    return [name, location];
  })) as Uniforms;
}

function coverUv(image: HTMLImageElement, rect: DOMRect) {
  const imageAspect = image.naturalWidth / image.naturalHeight;
  const rectAspect = rect.width / rect.height;
  const position = getComputedStyle(image).objectPosition.split(' ');
  const positionX = Number.parseFloat(position[0]) / 100 || 0.5;
  const positionY = Number.parseFloat(position[1] ?? position[0]) / 100 || 0.5;
  if (imageAspect > rectAspect) {
    const width = rectAspect / imageAspect;
    return [(1 - width) * positionX, 0, width, 1] as const;
  }
  const height = imageAspect / rectAspect;
  return [0, (1 - height) * positionY, 1, height] as const;
}

export function WaveMediaRenderer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    if (!canvas || matchMedia('(prefers-reduced-motion: reduce)').matches || !waveConfig.enabled) return;
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: false,
      depth: false,
      premultipliedAlpha: true,
      powerPreference: 'high-performance',
    }) as WebGL2RenderingContext;
    if (!gl) return;

    let planeProgram: WebGLProgram;
    let bowProgram: WebGLProgram;
    try {
      planeProgram = createProgram(gl, PLANE_VERTEX, PLANE_FRAGMENT);
      bowProgram = createProgram(gl, BOW_VERTEX, BOW_FRAGMENT);
    } catch (error) {
      console.warn('Wave renderer disabled:', error);
      return;
    }

    const planeUniforms = uniforms(gl, planeProgram, ['uResolution', 'uRect', 'uTexture', 'uUv', 'uAlpha']);
    const bowUniforms = uniforms(gl, bowProgram, ['uScene', 'uResolution', 'uCurve', 'uCurvePower', 'uCurveEdge']);
    const sceneTexture = gl.createTexture();
    const framebuffer = gl.createFramebuffer();
    if (!sceneTexture || !framebuffer) return;
    const media = new Map<HTMLImageElement, MediaPlane>();
    let disposed = false;
    let dpr = 1;
    let dirty = true;
    let animateUntil = 0;
    let bufferWidth = 0;
    let bufferHeight = 0;
    let previousScroll = -1;
    let previousCurve = Number.NaN;
    let lastWinW = innerWidth;
    let lastWinH = innerHeight;
    let resizeRaf = 0;
    const isDebug =
      new URLSearchParams(window.location.search).get('debugPerformance') === '1' ||
      new URLSearchParams(window.location.search).has('wave-debug');

    function resize() {
      if (disposed) return;
      dpr = Math.min(waveConfig.maxDevicePixelRatio, adaptiveQuality.getEffectiveDpr(innerWidth, innerHeight));
      const width = Math.round(innerWidth * dpr);
      const height = Math.round(innerHeight * dpr);
      if (bufferWidth === width && bufferHeight === height) return;
      bufferWidth = width;
      bufferHeight = height;
      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;
      const allocateTarget = (texture: WebGLTexture, target: WebGLFramebuffer) => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status !== gl.FRAMEBUFFER_COMPLETE) console.warn('Wave framebuffer incomplete:', status);
      };
      allocateTarget(sceneTexture, framebuffer);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      dirty = true;
    }

    function upload(image: HTMLImageElement) {
      if (disposed || !image.complete || !image.naturalWidth || media.has(image)) return;
      const texture = gl.createTexture();
      if (!texture) return;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      } catch {
        gl.deleteTexture(texture);
        return;
      }
      const plane: MediaPlane = { image, texture, active: false, createdAt: performance.now() };
      media.set(image, plane);
      observer.observe(image);
      animateUntil = Math.max(animateUntil, performance.now() + 600);
      dirty = true;
    }

    function discover() {
      document.querySelectorAll<HTMLImageElement>(MEDIA_SELECTOR).forEach(image => {
        if (image.closest('.stack-scene-clone')) return;
        if (image.complete) upload(image);
        else image.addEventListener('load', () => upload(image), { once: true });
      });
      for (const [image, plane] of media) {
        if (image.isConnected && image.matches(MEDIA_SELECTOR)) continue;
        image.classList.remove('wave-media-source');
        observer.unobserve(image);
        gl.deleteTexture(plane.texture);
        media.delete(image);
      }
    }

    const observer = new IntersectionObserver(entries => {
      if (disposed) return;
      entries.forEach(entry => {
        const plane = media.get(entry.target as HTMLImageElement);
        if (!plane) return;
        plane.active = entry.isIntersecting;
        if (!entry.isIntersecting) plane.image.classList.remove('wave-media-source');
      });
      dirty = true;
    }, { rootMargin: '120px' });
    const mutations = new MutationObserver(() => {
      discover();
      animateUntil = performance.now() + 700;
      dirty = true;
    });
    mutations.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });

    function drawPlane(plane: MediaPlane) {
      if (plane.image.closest('.stack-transition-source-hidden')) return false;
      const rect = plane.image.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1 || rect.bottom < -120 || rect.top > innerHeight + 120) return false;
      const clipElement = plane.image.closest<HTMLElement>('.work-media, .method-object, .service-stage');
      const clip = clipElement?.getBoundingClientRect();
      const scene = plane.image.closest<HTMLElement>('.home-cinematic > section');
      let stackBottom = innerHeight;
      if (scene?.parentElement?.classList.contains('home-cinematic')) {
        let sibling = scene.nextElementSibling;
        while (sibling) {
          if (sibling instanceof HTMLElement && sibling.matches('section')) {
            const siblingRect = sibling.getBoundingClientRect();
            if (siblingRect.bottom > 0 && siblingRect.top < innerHeight) {
              stackBottom = Math.min(stackBottom, Math.max(0, siblingRect.top));
            }
          }
          sibling = sibling.nextElementSibling;
        }
      }
      if (clip || stackBottom < innerHeight) {
        const left = Math.max(0, clip?.left ?? 0);
        const reveal = plane.image.closest('.service-stage')
          ? Math.min(1, (performance.now() - plane.createdAt) / 550)
          : 1;
        const clipBottom = clip?.bottom ?? innerHeight;
        const clipHeight = clip?.height ?? innerHeight;
        const top = Math.max(0, clipBottom - clipHeight * reveal);
        const right = Math.min(innerWidth, clip?.right ?? innerWidth);
        const bottom = Math.min(innerHeight, clipBottom, stackBottom);
        if (bottom <= top || right <= left) return false;
        gl.enable(gl.SCISSOR_TEST);
        gl.scissor(
          Math.round(left * dpr),
          Math.round((innerHeight - bottom) * dpr),
          Math.max(0, Math.round((right - left) * dpr)),
          Math.max(0, Math.round((bottom - top) * dpr)),
        );
      } else {
        gl.disable(gl.SCISSOR_TEST);
      }
      const uv = coverUv(plane.image, rect);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, plane.texture);
      gl.uniform4f(planeUniforms.uRect, rect.x * dpr, rect.y * dpr, rect.width * dpr, rect.height * dpr);
      gl.uniform4f(planeUniforms.uUv, uv[0], uv[1], uv[2], uv[3]);
      const opacity = plane.image.closest('.service-stage')
        ? Number.parseFloat(getComputedStyle(plane.image).opacity)
        : 1;
      gl.uniform1f(planeUniforms.uAlpha, Number.isFinite(opacity) ? opacity : 1);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      return true;
    }

    function render(state: Readonly<ScrollMotionState>, force = false) {
      if (disposed) return;
      const now = performance.now();
      const curveChanged = Math.abs(state.waveIntensity - previousCurve) > 0.005;
      const scrollChanged = state.currentScroll !== previousScroll;
      if (!force && !dirty && !curveChanged && !scrollChanged && now > animateUntil) return;
      resize();
      previousScroll = state.currentScroll;
      previousCurve = state.waveIntensity;
      if (isDebug) {
        canvas.dataset.waveIntensity = state.waveIntensity.toFixed(3);
      }
      dirty = false;

      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(planeProgram);
      gl.uniform2f(planeUniforms.uResolution, canvas.width, canvas.height);
      gl.uniform1i(planeUniforms.uTexture, 0);
      let drewMedia = false;
      media.forEach(plane => {
        if (plane.active && drawPlane(plane)) drewMedia = true;
      });
      gl.disable(gl.SCISSOR_TEST);

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.disable(gl.BLEND);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(bowProgram);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, sceneTexture);
      gl.uniform1i(bowUniforms.uScene, 0);
      gl.uniform2f(bowUniforms.uResolution, canvas.width, canvas.height);
      gl.uniform1f(bowUniforms.uCurve, state.waveIntensity * dpr);
      gl.uniform1f(bowUniforms.uCurvePower, waveConfig.curvePower);
      gl.uniform1f(bowUniforms.uCurveEdge, waveConfig.edgeFade * dpr);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (drewMedia) media.forEach(plane => {
        if (plane.active) plane.image.classList.add('wave-media-source');
      });
      sceneMetricsRegistry.update({
        id: 'wave-media',
        active: drewMedia,
        drawCalls: drewMedia ? media.size + 1 : 0,
        triangles: drewMedia ? media.size * 2 + 1 : 0,
        geometries: 1,
        textures: media.size + 1,
        width: canvas.width,
        height: canvas.height,
        dpr,
      });
    }

    const onResize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        if (Math.abs(innerWidth - lastWinW) <= 2 && Math.abs(innerHeight - lastWinH) < 120) {
          return;
        }
        lastWinW = innerWidth;
        lastWinH = innerHeight;
        dirty = true;
        render(scrollMotion.state, true);
      });
    };
    const unsubQuality = adaptiveQuality.subscribe(() => {
      dirty = true;
      render(scrollMotion.state, true);
    });
    const onPointer = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest('.work-item')) animateUntil = performance.now() + 1300;
    };
    const onNestedScroll = (event: Event) => {
      const target = event.target;
      if (target instanceof Element && target.closest('.work-viewport')) {
        animateUntil = performance.now() + 250;
        dirty = true;
      }
    };
    const onContextLost = (event: Event) => {
      event.preventDefault();
      media.forEach(plane => plane.image.classList.remove('wave-media-source'));
    };
    addEventListener('resize', onResize, { passive: true });
    document.addEventListener('pointerover', onPointer, { passive: true });
    document.addEventListener('pointerout', onPointer, { passive: true });
    document.addEventListener('scroll', onNestedScroll, { passive: true, capture: true });
    canvas.addEventListener('webglcontextlost', onContextLost);
    const unsubscribe = scrollMotion.subscribe(state => render(state));
    discover();
    document.fonts.ready.then(() => {
      if (!disposed) render(scrollMotion.state, true);
    });
    render(scrollMotion.state, true);

    return () => {
      disposed = true;
      unsubQuality();
      unsubscribe();
      sceneMetricsRegistry.remove('wave-media');
      removeEventListener('resize', onResize);
      document.removeEventListener('pointerover', onPointer);
      document.removeEventListener('pointerout', onPointer);
      document.removeEventListener('scroll', onNestedScroll, { capture: true });
      canvas.removeEventListener('webglcontextlost', onContextLost);
      observer.disconnect();
      mutations.disconnect();
      media.forEach(plane => {
        plane.image.classList.remove('wave-media-source');
        gl.deleteTexture(plane.texture);
      });
      gl.deleteTexture(sceneTexture);
      gl.deleteFramebuffer(framebuffer);
      gl.deleteProgram(planeProgram);
      gl.deleteProgram(bowProgram);
    };
  }, [pathname]);

  return <canvas ref={canvasRef} className="wave-media-canvas" aria-hidden="true" />;
}
