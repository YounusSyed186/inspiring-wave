import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4173';
const outDir = path.resolve('qa/infinite-process');
const checkpoints = [0, .05, .1, .18, .25, .33, .42, .5, .59, .67, .76, .84, .9, .95, 1];
const boundaries = [.249, .25, .419, .42, .589, .59, .759, .76, .919, .92];
const phases = ['discover', 'define', 'design', 'develop', 'deliver'];
const phaseTargets = [.18, .33, .5, .67, .84];
await fs.mkdir(outDir, { recursive: true });

const expectedPhase = (p) => p < .25 ? 'discover' : p < .42 ? 'define' : p < .59 ? 'design' : p < .76 ? 'develop' : 'deliver';
const expectedStage = (p) => p < .1 ? /entrance/i : p < .25 ? /discover/i : p < .42 ? /define/i : p < .59 ? /design/i : p < .76 ? /develop/i : p < .92 ? /deliver/i : /(handoff|continuation|exit)/i;
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const vector = (value) => {
  const parsed = String(value || '').split(',').map(Number);
  return parsed.length === 3 && parsed.every(Number.isFinite) ? parsed : null;
};
const distance = (a, b) => a && b ? Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) : Infinity;
const percentile = (values, fraction) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * fraction))] || 0;
};
const shotName = (p) => `${String(Math.round(p * 100)).padStart(3, '0')}-percent.png`;

async function geometry(page) {
  return page.evaluate(() => {
    const track = document.querySelector('[data-process-track]');
    const stage = document.querySelector('[data-process-stage]');
    if (!(track instanceof HTMLElement) || !(stage instanceof HTMLElement)) throw new Error('Process track/stage missing');
    return {
      top: track.getBoundingClientRect().top + scrollY,
      trackHeight: track.offsetHeight,
      stageHeight: stage.offsetHeight,
      distance: track.offsetHeight - stage.offsetHeight,
      viewportHeight: innerHeight,
      ratio: track.offsetHeight / stage.offsetHeight,
    };
  });
}

async function seek(page, progress, settle = 450) {
  const g = await geometry(page);
  await page.evaluate(({ top, distance, progress }) => scrollTo(0, Math.round(top + distance * progress)), { ...g, progress });
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  if (settle) await page.waitForTimeout(settle);
}

async function state(page) {
  return page.evaluate(() => {
    const stage = document.querySelector('[data-process-stage]');
    const track = document.querySelector('[data-process-track]');
    const canvas = document.querySelector('[data-process-canvas]');
    const active = document.querySelector('[data-phase-nav] [aria-current="step"]');
    const sr = stage?.getBoundingClientRect();
    const tr = track?.getBoundingClientRect();
    return {
      progress: Number(stage?.dataset.progress),
      visualProgress: Number(stage?.dataset.visualProgress),
      phase: stage?.dataset.activePhase,
      timelineStage: stage?.dataset.timelineStage,
      pinned: stage?.dataset.pinned,
      panelPhase: document.querySelector('[data-phase]')?.getAttribute('data-phase') || '',
      activeLabel: active?.textContent?.replace(/\s+/g, ' ').trim() || '',
      stageErrors: stage?.dataset.rendererErrors || '',
      canvasCount: document.querySelectorAll('[data-process-canvas]').length,
      overflow: document.documentElement.scrollWidth - innerWidth,
      stageTop: sr?.top,
      stageBottom: sr?.bottom,
      trackTop: tr?.top,
      trackBottom: tr?.bottom,
      canvas: canvas instanceof HTMLCanvasElement ? {
        progress: Number(canvas.dataset.progress),
        rendering: canvas.dataset.rendering,
        camera: canvas.dataset.camera,
        target: canvas.dataset.cameraTarget,
        rotation: canvas.dataset.ribbonRotation,
        deformation: Number(canvas.dataset.deformation),
        signal: Number(canvas.dataset.signal),
        drawCalls: Number(canvas.dataset.drawCalls),
        triangles: Number(canvas.dataset.triangles),
        quality: canvas.dataset.quality,
        assetStatus: canvas.dataset.assetStatus,
        errors: canvas.dataset.rendererErrors || '',
        css: [canvas.clientWidth, canvas.clientHeight],
        buffer: [canvas.width, canvas.height],
      } : null,
    };
  });
}

function validate(s, requested, canvasRequired = true) {
  assert(Number.isFinite(s.progress) && Math.abs(s.progress - requested) <= .0125, `Raw progress mismatch at ${requested}: ${s.progress}`);
  assert(Number.isFinite(s.visualProgress) && Math.abs(s.visualProgress - requested) <= .025, `Visual progress mismatch at ${requested}: ${s.visualProgress}`);
  assert(s.phase === expectedPhase(s.progress), `Phase mismatch at ${requested}: ${s.phase}`);
  assert(expectedStage(s.progress).test(s.timelineStage || ''), `Timeline stage mismatch at ${requested}: ${s.timelineStage}`);
  assert(s.panelPhase === s.phase, `Phase panel mismatch at ${requested}: ${s.panelPhase}/${s.phase}`);
  assert(s.overflow <= 2 && !s.stageErrors, `Layout/renderer error at ${requested}: overflow=${s.overflow}, error=${s.stageErrors}`);
  if (requested > .001 && requested < .999) {
    assert(s.pinned === 'true', `Stage not reported pinned at ${requested}`);
    assert(Math.abs(s.stageTop || 0) <= 3, `Sticky stage drifted ${s.stageTop}px at ${requested}`);
  }
  if (!canvasRequired) return;
  assert(s.canvasCount === 1 && s.canvas?.rendering === 'true', `Canvas unavailable/duplicated at ${requested}`);
  assert(Math.abs(s.canvas.progress - s.visualProgress) <= .025, `Canvas/DOM progress diverged at ${requested}`);
  assert(s.canvas.drawCalls >= 1 && s.canvas.drawCalls <= 70, `Draw calls out of budget at ${requested}: ${s.canvas.drawCalls}`);
  assert(s.canvas.triangles > 0 && s.canvas.triangles <= 150000, `Triangles out of budget at ${requested}: ${s.canvas.triangles}`);
  assert(vector(s.canvas.camera) && vector(s.canvas.target) && vector(s.canvas.rotation), `Invalid scene vectors at ${requested}`);
  assert(Number.isFinite(s.canvas.deformation) && Number.isFinite(s.canvas.signal), `Invalid scene scalar at ${requested}`);
  assert(!s.canvas.errors && (!s.canvas.assetStatus || s.canvas.assetStatus === 'ready'), `Canvas error/assets at ${requested}: ${s.canvas.errors}/${s.canvas.assetStatus}`);
  const dpr = [s.canvas.buffer[0] / Math.max(1, s.canvas.css[0]), s.canvas.buffer[1] / Math.max(1, s.canvas.css[1])];
  assert(dpr.every((value) => value <= 1.55), `Canvas DPR exceeds cap at ${requested}: ${dpr.map((v) => v.toFixed(2)).join('x')}`);
}

async function measureFrames(page, duration = 2600) {
  return page.evaluate(async ({ duration }) => {
    const track = document.querySelector('[data-process-track]');
    const stage = document.querySelector('[data-process-stage]');
    if (!(track instanceof HTMLElement) || !(stage instanceof HTMLElement)) throw new Error('Frame-test geometry missing');
    const top = track.getBoundingClientRect().top + scrollY;
    const travel = track.offsetHeight - stage.offsetHeight;
    const samples = [];
    let last = performance.now();
    const started = last;
    await new Promise((resolve) => {
      const tick = (now) => {
        samples.push(now - last);
        last = now;
        const p = Math.min(1, (now - started) / duration);
        scrollTo(0, Math.round(top + travel * p));
        p < 1 ? requestAnimationFrame(tick) : resolve();
      };
      requestAnimationFrame(tick);
    });
    return samples.filter((sample) => sample > 0 && sample < 1000);
  }, { duration });
}

const results = { baseURL, geometry: null, checkpoints: [], boundaries: [], reverse: [], rapidScroll: null, resize: null, navigation: [], fallbacks: [], frames: null, accessibility: null, screenshots: [], errors: [] };
const browser = await chromium.launch({ headless: true });

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('pageerror', (error) => results.errors.push(`page: ${error.message}`));
  page.on('console', (message) => message.type() === 'error' && results.errors.push(`console: ${message.text()}`));
  page.on('requestfailed', (request) => results.errors.push(`request: ${request.url()} ${request.failure()?.errorText || ''}`));
  await page.goto(`${baseURL}/?nopreload`, { waitUntil: 'networkidle' });

  results.geometry = await geometry(page);
  assert(results.geometry.distance > 0, `Invalid process travel: ${JSON.stringify(results.geometry)}`);
  assert(Math.abs(results.geometry.ratio - 5) <= .2, `Expected 500vh total track; ratio=${results.geometry.ratio.toFixed(3)}`);
  assert(Math.abs(results.geometry.distance - results.geometry.viewportHeight * 4) <= results.geometry.viewportHeight * .2, `Expected 400vh travel; got ${results.geometry.distance}px`);

  await seek(page, 0);
  await page.waitForSelector('[data-process-canvas][data-rendering="true"]', { timeout: 15000 });
  for (const point of checkpoints) {
    await seek(page, point);
    const current = await state(page);
    validate(current, point);
    const screenshot = path.join(outDir, shotName(point));
    await page.screenshot({ path: screenshot });
    results.screenshots.push(path.relative(process.cwd(), screenshot));
    results.checkpoints.push({ requested: point, ...current });
  }

  for (const point of boundaries) {
    await seek(page, point, 250);
    const current = await state(page);
    validate(current, point);
    results.boundaries.push({ requested: point, actual: current.progress, phase: current.phase, timelineStage: current.timelineStage });
  }

  const forward = new Map();
  for (const point of [.18, .33, .5, .67, .9]) {
    await seek(page, point, 300);
    forward.set(point, await state(page));
  }
  await seek(page, .99, 150);
  for (const point of [.9, .67, .5, .33, .18]) {
    await seek(page, point, 350);
    const current = await state(page);
    const reference = forward.get(point);
    assert(current.phase === reference.phase, `Reverse phase mismatch at ${point}`);
    assert(distance(vector(current.canvas?.camera), vector(reference.canvas?.camera)) <= .06, `Reverse camera mismatch at ${point}`);
    assert(distance(vector(current.canvas?.rotation), vector(reference.canvas?.rotation)) <= .04, `Reverse rotation mismatch at ${point}`);
    assert(Math.abs(current.canvas.deformation - reference.canvas.deformation) <= .02 && Math.abs(current.canvas.signal - reference.canvas.signal) <= .02, `Reverse scene mismatch at ${point}`);
    results.reverse.push({ point, phase: current.phase, camera: current.canvas.camera, rotation: current.canvas.rotation });
  }

  await seek(page, 0, 40); await seek(page, .9, 40); await seek(page, .2, 40); await seek(page, 1, 500);
  results.rapidScroll = await state(page);
  assert(results.rapidScroll.phase === 'deliver' && results.rapidScroll.progress >= .985, `Rapid scroll stale state: ${JSON.stringify(results.rapidScroll)}`);

  await seek(page, .5, 350);
  const before = await state(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.waitForTimeout(850);
  const after = await state(page);
  const resizedGeometry = await geometry(page);
  assert(Math.abs(before.progress - after.progress) <= .035, `Resize changed progress: ${before.progress} -> ${after.progress}`);
  assert(after.canvasCount === 1 && Math.abs(resizedGeometry.ratio - 5) <= .2, `Resize canvas/geometry invalid`);
  results.resize = { before, after, geometry: resizedGeometry };

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(600);
  for (let index = 0; index < phases.length; index++) {
    await page.locator('[data-phase-nav] button').nth(index).click();
    await page.waitForTimeout(1300);
    const current = await state(page);
    assert(current.phase === phases[index] && Math.abs(current.progress - phaseTargets[index]) <= .045, `Desktop nav failed for ${phases[index]} at ${current.progress}`);
    results.navigation.push({ mode: 'desktop', phase: current.phase, progress: current.progress });
  }

  results.accessibility = await page.evaluate(() => ({
    heading: document.querySelector('#infinite-process-heading')?.textContent?.replace(/\s+/g, ' ').trim(),
    phases: document.querySelectorAll('.ip-semantic-phases li').length,
    buttons: document.querySelectorAll('[data-phase-nav] button').length,
    canvasHidden: document.querySelector('[data-process-canvas]')?.getAttribute('aria-hidden'),
    canvasTabIndex: document.querySelector('[data-process-canvas]')?.getAttribute('tabindex'),
    oldCards: document.querySelectorAll('.artistic-method-stage,[aria-expanded]').length,
  }));
  assert(results.accessibility.heading && results.accessibility.phases === 5 && results.accessibility.buttons === 5, `Accessibility structure invalid`);
  assert(results.accessibility.canvasHidden === 'true' && results.accessibility.canvasTabIndex !== '0' && results.accessibility.oldCards === 0, `Accessibility exposure/legacy UI invalid`);

  const samples = await measureFrames(page);
  results.frames = {
    count: samples.length,
    p50Ms: +percentile(samples, .5).toFixed(2),
    p95Ms: +percentile(samples, .95).toFixed(2),
    maxMs: +Math.max(...samples).toFixed(2),
    over33Ms: samples.filter((value) => value > 33.34).length,
    over50Ms: samples.filter((value) => value > 50).length,
  };
  assert(samples.length >= 30 && results.frames.p95Ms <= 50, `Frame timing failed: ${JSON.stringify(results.frames)}`);
  await context.close();

  for (const config of [
    { name: 'mobile', viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' },
    { name: 'reduced', viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' },
  ]) {
    const fallbackContext = await browser.newContext({ viewport: config.viewport, reducedMotion: config.reducedMotion, isMobile: config.name === 'mobile', hasTouch: config.name === 'mobile' });
    const fallbackPage = await fallbackContext.newPage();
    const fallbackErrors = [];
    fallbackPage.on('pageerror', (error) => fallbackErrors.push(error.message));
    await fallbackPage.goto(`${baseURL}/?nopreload`, { waitUntil: 'networkidle' });
    const initial = await fallbackPage.evaluate(() => {
      const track = document.querySelector('[data-process-track]');
      const stage = document.querySelector('[data-process-stage]');
      const fallback = document.querySelector('.ip-fallback');
      return {
        trackHeight: track?.getBoundingClientRect().height || 0,
        stageHeight: stage?.getBoundingClientRect().height || 0,
        canvases: document.querySelectorAll('[data-process-canvas]').length,
        phases: document.querySelectorAll('.ip-semantic-phases li').length,
        fallbackDisplay: fallback ? getComputedStyle(fallback).display : 'missing',
        overflow: document.documentElement.scrollWidth - innerWidth,
      };
    });
    assert(initial.canvases === 0 && initial.phases === 5 && initial.fallbackDisplay !== 'none' && initial.overflow <= 2 && initial.trackHeight >= initial.stageHeight, `${config.name} fallback invalid: ${JSON.stringify(initial)}`);
    const navigation = [];
    for (let index = 0; index < phases.length; index++) {
      await fallbackPage.locator('[data-phase-nav] button').nth(index).click();
      await fallbackPage.waitForTimeout(config.name === 'reduced' ? 150 : 500);
      const nav = await fallbackPage.evaluate((phaseId) => {
        const current = document.querySelector('[data-phase-nav] [aria-current="step"]');
        const target = document.querySelector(`#process-${phaseId}`);
        const rect = target?.getBoundingClientRect();
        return {
          current: current?.textContent?.replace(/\s+/g, ' ').trim().toLowerCase() || '',
          panel: document.querySelector('[data-phase]')?.getAttribute('data-phase') || '',
          targetVisible: !!rect && rect.bottom > 0 && rect.top < innerHeight,
        };
      }, phases[index]);
      assert(nav.current.includes(phases[index]) || nav.panel === phases[index] || nav.targetVisible, `${config.name} fallback nav failed for ${phases[index]}`);
      navigation.push({ phase: phases[index], ...nav });
    }
    const screenshot = path.join(outDir, `${config.name}-fallback.png`);
    await fallbackPage.screenshot({ path: screenshot, fullPage: true });
    results.screenshots.push(path.relative(process.cwd(), screenshot));
    results.fallbacks.push({ name: config.name, initial, navigation, errors: fallbackErrors });
    assert(!fallbackErrors.length, `${config.name} errors: ${fallbackErrors.join('; ')}`);
    await fallbackContext.close();
  }
  assert(!results.errors.length, `Browser errors: ${results.errors.join('; ')}`);
} catch (error) {
  results.failure = { message: error instanceof Error ? error.message : String(error), stack: error instanceof Error ? error.stack : '' };
  process.exitCode = 1;
} finally {
  await browser.close();
  await fs.writeFile(path.join(outDir, 'results.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
}
