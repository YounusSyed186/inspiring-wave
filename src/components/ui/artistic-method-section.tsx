import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { ScrollTrigger, useGSAP } from '@/motion';
import { PROCESS_PHASES } from '@/components/infinite-process/process.data';
import { phaseIndexAt, phaseProgressTarget, segment, timelineStageAt } from '@/components/infinite-process/process-motion';
import type { ProcessSceneMetrics, ProcessSceneRuntime } from '@/components/infinite-process/ProcessThreeScene';
import '@/components/infinite-process/infinite-process.css';

const ProcessThreeScene = lazy(() => import('@/components/infinite-process/ProcessThreeScene').then((module) => ({ default: module.ProcessThreeScene })));
const inspectMotion = import.meta.env.DEV && new URLSearchParams(location.search).has('process-debug');
const EMPTY_METRICS: ProcessSceneMetrics = { rendering: false, camera: '—', target: '—', rotation: '—', deformation: 0, signal: 0, drawCalls: 0, triangles: 0, quality: 'fallback', assetStatus: 'idle', error: '' };

function tornEdge(depth: number) {
  const points = Array.from({ length: 481 }, (_, index) => {
    const x = index * 3;
    const fibers = Math.sin(index * 2.23) * 1.7 + Math.sin(index * .47) * 2;
    const fold = 45 + Math.sin(x / 94) * 9 + Math.sin(x / 49) * 4 - 38 * (x / 1440) ** 4;
    return `L${x} ${(fold + depth + fibers).toFixed(1)}`;
  });
  return `M0 84 ${points.join(' ')} L1440 84Z`;
}
const tearPaths = [tornEdge(0), tornEdge(7)];

function InfinityFallback() {
  return <picture className="ip-reference-picture"><source media="(min-width: 960px)" srcSet="/assets/process/ribbon-reference.webp" /><img src="/assets/process/ribbon-mobile.webp" alt="" width="1860" height="846" loading="lazy" decoding="async" className="ip-rendered-ribbon" /></picture>;
}

function MotionInspector({ progress, manual, metrics, setManualProgress, resume }: { progress: number; manual: boolean; metrics: ProcessSceneMetrics; setManualProgress: (value: number) => void; resume: () => void }) {
  return <aside className="ip-inspector" aria-label="Infinite Process animation inspector">
    <div><b>PROCESS MOTION</b><span>{manual ? 'MANUAL' : 'SCROLL'}</span></div>
    <dl><dt>raw scroll</dt><dd>{(ScrollTrigger.getById('infinite-process-master')?.progress ?? 0).toFixed(4)}</dd><dt>pinned</dt><dd>{ScrollTrigger.getById('infinite-process-master')?.isActive ? 'yes' : 'no'}</dd></dl>
    <dl><dt>progress</dt><dd>{progress.toFixed(4)}</dd><dt>stage</dt><dd>{timelineStageAt(progress)}</dd><dt>phase</dt><dd>{PROCESS_PHASES[phaseIndexAt(progress)].title}</dd><dt>camera</dt><dd>{metrics.camera}</dd><dt>target</dt><dd>{metrics.target}</dd><dt>rotation</dt><dd>{metrics.rotation}</dd><dt>deform</dt><dd>{metrics.deformation.toFixed(3)}</dd><dt>signal</dt><dd>{metrics.signal.toFixed(3)}</dd><dt>render</dt><dd>{metrics.rendering ? 'yes' : 'no'} · {metrics.drawCalls} calls · {metrics.triangles} tris</dd><dt>quality</dt><dd>{metrics.quality} · {metrics.assetStatus}</dd></dl>
    <input aria-label="Manual animation progress" type="range" min="0" max="100" step="0.1" value={progress * 100} onChange={(event) => setManualProgress(Number(event.target.value) / 100)} />
    <div className="ip-inspector-jumps">{[0, ...PROCESS_PHASES.map((item) => item.progress), 1].map((value, index) => <button key={`${value}-${index}`} onClick={() => setManualProgress(value)}>{index === 0 ? 'IN' : index === 6 ? 'OUT' : PROCESS_PHASES[index - 1].number}</button>)}</div>
    <button className="ip-inspector-resume" onClick={resume}>{manual ? 'Restore live scroll' : 'Scroll active'}</button>
    {metrics.error && <p>{metrics.error}</p>}
  </aside>;
}

export function ArtisticMethodSection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const runtimeRef = useRef<ProcessSceneRuntime | null>(null);
  const progressRef = useRef(0);
  const activeRef = useRef(0);
  const manualRef = useRef(false);
  const scrubRef = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState(0);
  const [sceneReady, setSceneReady] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [sceneError, setSceneError] = useState('');
  const [desktop, setDesktop] = useState(() => matchMedia('(min-width: 960px) and (min-height: 560px) and (prefers-reduced-motion: no-preference)').matches);
  useEffect(() => {
    const query = matchMedia('(min-width: 960px) and (min-height: 560px) and (prefers-reduced-motion: no-preference)');
    const change = () => { setDesktop(query.matches); setCanvasReady(false); };
    query.addEventListener('change', change);
    return () => query.removeEventListener('change', change);
  }, []);
  const [inspectorProgress, setInspectorProgress] = useState(0);
  const [manual, setManual] = useState(false);
  const [metrics, setMetrics] = useState(EMPTY_METRICS);
  const phase = PROCESS_PHASES[active];

  const present = useCallback((progress: number) => {
    if (scrubRef.current) scrubRef.current.value = String(progress);
    const stage = stageRef.current;
    if (stage) {
      stage.dataset.progress = progressRef.current.toFixed(4);
      stage.dataset.visualProgress = progress.toFixed(4);
      stage.dataset.activePhase = PROCESS_PHASES[phaseIndexAt(progress)].id;
      stage.dataset.timelineStage = timelineStageAt(progress);
      stage.dataset.pinned = progress > 0.001 && progress < 0.999 ? 'true' : 'false';
      stage.style.setProperty('--ip-progress', progress.toFixed(4));
      stage.style.setProperty('--ip-entrance', segment(progress, 0, 0.1).toFixed(4));
    }
    const nextActive = phaseIndexAt(progress);
    if (nextActive !== activeRef.current) { activeRef.current = nextActive; setActive(nextActive); }
    if (inspectMotion) setInspectorProgress(progress);
  }, []);

  const applyProgress = useCallback((raw: number, source: 'scroll' | 'manual' = 'scroll') => {
    if (source === 'scroll' && manualRef.current) return;
    progressRef.current=Math.max(0,Math.min(1,raw));
    if(runtimeRef.current)runtimeRef.current.applyProgress(progressRef.current);
    else present(progressRef.current);
  },[present]);

  useGSAP(() => {
    const track = trackRef.current;
    if (!track || !desktop || sceneError) return;
    const trigger = ScrollTrigger.create({ id: 'infinite-process-master', trigger: track, start: 'top top', end: 'bottom bottom', invalidateOnRefresh: true, onUpdate: (self) => applyProgress(self.progress), onRefresh: (self) => applyProgress(self.progress) });
    applyProgress(trigger.progress);
    return () => trigger.kill();
  }, { scope: trackRef, dependencies: [applyProgress, desktop, sceneError], revertOnUpdate: true });

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !desktop) return;
    const observer = new IntersectionObserver((entries) => { if (entries.some((entry) => entry.isIntersecting)) { setSceneReady(true); observer.disconnect(); } }, { rootMargin: '1200px 0px' });
    observer.observe(track);
    return () => observer.disconnect();
  }, [desktop]);

  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    document.fonts.ready.then(refresh);
    return () => ScrollTrigger.getById('infinite-process-master')?.kill();
  }, []);

  useEffect(() => {
    let timer = 0;
    let preserved = progressRef.current;
    const preserveNormalizedProgress = () => {
      if (!window.matchMedia('(min-width: 960px) and (prefers-reduced-motion: no-preference)').matches) return;
      if (!timer) preserved = progressRef.current;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        timer = 0;
        if (preserved <= 0.001 || preserved >= 0.999) return;
        const track = trackRef.current; const stage = stageRef.current;
        if (!track || !stage) return;
        ScrollTrigger.refresh();
        const top = track.getBoundingClientRect().top + window.scrollY;
        window.scrollTo(0, top + (track.offsetHeight - stage.offsetHeight) * preserved);
        requestAnimationFrame(() => applyProgress(preserved));
      }, 260);
    };
    window.addEventListener('resize', preserveNormalizedProgress);
    return () => { window.removeEventListener('resize', preserveNormalizedProgress); window.clearTimeout(timer); };
  }, [applyProgress]);

  const onSceneReady = useCallback(() => { setCanvasReady(true); runtimeRef.current?.applyProgress(progressRef.current); }, []);
  const onSceneFailure = useCallback((message: string) => { setCanvasReady(false); setSceneError(message); if (stageRef.current) { stageRef.current.dataset.rendererErrors = message; stageRef.current.dataset.assetStatus = 'error'; } setMetrics((current) => ({ ...current, error: message, assetStatus: 'error' })); }, []);
  const onMetrics = useCallback((next: ProcessSceneMetrics) => setMetrics(next), []);

  const seekPhase = (index: number) => {
    const track = trackRef.current; const stage = stageRef.current;
    if (!track || !stage) return;
    if (!desktop || sceneError) {
      activeRef.current = index;
      setActive(index);
      document.getElementById('process-' + PROCESS_PHASES[index].id)?.focus({ preventScroll: true });
      document.getElementById('process-' + PROCESS_PHASES[index].id)?.scrollIntoView({ block: 'center', behavior: 'instant' });
      return;
    }
    const top = track.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + Math.max(0, track.offsetHeight - stage.offsetHeight) * phaseProgressTarget(index), behavior: 'smooth' });
  };
  const setManualProgress = (progress: number) => { manualRef.current = true; setManual(true); applyProgress(progress, 'manual'); };
  const resume = () => { manualRef.current = false; setManual(false); applyProgress(ScrollTrigger.getById('infinite-process-master')?.progress ?? progressRef.current); };

  return <section id="method" className="method infinite-process" data-static={!desktop || !!sceneError} aria-labelledby="infinite-process-heading">
    <div ref={trackRef} className="ip-scroll-track" data-process-track>
    <div ref={stageRef} className={`ip-stage ${canvasReady ? 'is-canvas-ready' : ''}`} data-process-stage data-progress="0.0000" data-visual-progress="0.0000" data-active-phase="discover" data-timeline-stage="Entrance / unfolding" data-pinned="false"
      onPointerMove={(event) => { if (event.pointerType === 'touch') return; const rect = event.currentTarget.getBoundingClientRect(); runtimeRef.current?.applyPointer(((event.clientX - rect.left) / rect.width) * 2 - 1, -(((event.clientY - rect.top) / rect.height) * 2 - 1)); }}
      onPointerLeave={() => runtimeRef.current?.applyPointer(0, 0)}>
      <div className="ip-background" aria-hidden="true"><span /><i /><b /><em className="ip-cross-bl" /><em className="ip-cross-br" /></div>
      <div className="ip-fallback"><InfinityFallback /></div>
      {desktop && sceneReady && !sceneError && <Suspense fallback={null}><ProcessThreeScene runtimeRef={runtimeRef} onVisualProgress={present} onReady={onSceneReady} onFailure={onSceneFailure} onMetrics={inspectMotion ? onMetrics : undefined} /></Suspense>}
      <header className="ip-editorial">
        <p className="ip-kicker"><span>OUR PROCESS</span><span>/</span><span>001 — 005</span></p>
        <h2 id="infinite-process-heading"><span>THE</span><span>CREATIVE</span><span>PROCESS.</span></h2>
        <strong>INSPIRING WAVE</strong>
        <p className="ip-intro">A continuous cycle of strategy, design and technology that turns ideas into real impact.</p>
        <button type="button" className="ip-cycle-btn" aria-label="Advance to next creative process phase" onClick={() => seekPhase((active + 1) % PROCESS_PHASES.length)}>
          <span aria-hidden="true">→</span>
        </button>
      </header>
      <div className="ip-phase-panel" key={phase.id} data-phase={phase.id}><p>CURRENT PHASE <span>{phase.cue}</span></p><div><b>{phase.number} / {phase.title}</b><i /></div><p>{phase.summary}</p></div>
      <nav className="ip-progress" aria-label="Creative process phases" data-phase-nav><span className="ip-progress-line"><i style={{ width: `${active * 25}%` }} /></span>{PROCESS_PHASES.map((item, index) => <button key={item.id} type="button" aria-current={index === active ? 'step' : undefined} onClick={() => seekPhase(index)}><i /><b>{item.number}</b><span>{item.title}</span></button>)}</nav>
      {desktop && !sceneError && <input className="ip-scrubber" ref={scrubRef} type="range" aria-label="Scrub the creative process" min="0" max="1" step=".001" defaultValue="0"
        onChange={event => {
          const trigger = ScrollTrigger.getById('infinite-process-master');
          if (trigger) window.scrollTo({top: trigger.start + Number(event.currentTarget.value) * (trigger.end - trigger.start), behavior:'instant'});
        }} />}
      <div className="ip-bottom-tear" aria-hidden="true"><svg viewBox="0 0 1440 84" preserveAspectRatio="none"><path d={tearPaths[0]} fill="#f4ebd7"/><path d={tearPaths[1]} fill="#143df2"/></svg></div>
      {inspectMotion && <MotionInspector progress={inspectorProgress} manual={manual} metrics={{ ...metrics, error: sceneError }} setManualProgress={setManualProgress} resume={resume} />}
    </div></div>
    <ol className="ip-semantic-phases">{PROCESS_PHASES.map((item) => <li key={item.id} tabIndex={-1} id={`process-${item.id}`}><span>{item.number}</span><div><h3>{item.title}</h3><p>{item.summary}</p><p>{item.detail}</p></div></li>)}</ol>
  </section>;
}

