import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { services } from '../../data';
import { TornPaperSeam } from '@/components/ui/TornPaperSeam';
import type { ServicesRuntime } from './ServicesThreeScene';
import {
  clamp01,
  INSTALLATION_MOTION,
  INSTALLATION_ORDER,
  InstallationSlug,
  lerp,
  segment,
  smoothstep,
  stageForProgress,
} from './services-motion';
import './services.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const ServicesThreeScene = lazy(() =>
  import('./ServicesThreeScene').then((module) => ({ default: module.ServicesThreeScene }))
);

const meta: Record<InstallationSlug, { number: string; title: string[]; tone: string; concept: string }> = {
  'digital-strategy': { number: '01', title: ['Digital', 'Strategy'], tone: 'paper', concept: 'The world in perspective' },
  'web-development': { number: '02', title: ['Web', 'Development'], tone: 'cobalt', concept: 'Digital architecture' },
  'ui-ux-design': { number: '03', title: ['Branding'], tone: 'paper', concept: 'The art of order' },
  'social-media': { number: '04', title: ['Digital', 'Marketing'], tone: 'cobalt', concept: 'The ripple effect' },
  'mobile-app-development': { number: '05', title: ['Mobile App', 'Development'], tone: 'paper', concept: 'Interaction in motion' },
  'software-development': { number: '06', title: ['Software', 'Development'], tone: 'navy', concept: 'Systems that scale' },
};

function Artwork({ slug }: { slug: InstallationSlug }) {
  if (slug === 'digital-strategy')
    return (
      <div className="iw-art iw-art-strategy" aria-hidden="true">
        <div className="iw-arch-ring" />
        <img src="/images/services/strategy-globe-v2.webp" alt="" width="1536" height="1024" loading="lazy" />
        <i className="iw-orbit iw-orbit-a" />
        <i className="iw-orbit iw-orbit-b" />
      </div>
    );
  if (slug === 'web-development')
    return (
      <div className="iw-art iw-art-web" aria-hidden="true">
        <span className="iw-blueprint-lines" />
        <img src="/images/services/web-portal-v2.webp" alt="" width="1312" height="1199" loading="lazy" />
      </div>
    );
  if (slug === 'ui-ux-design')
    return (
      <div className="iw-art iw-art-ui" aria-hidden="true">
        <span className="iw-grid-field" />
        <div className="iw-interface iw-interface-back">
          <b />
          <b />
          <i />
          <i />
        </div>
        <div className="iw-interface iw-interface-mid">
          <span />
          <span />
          <span />
        </div>
        <div className="iw-interface iw-interface-front">
          <b />
          <i />
          <i />
          <em />
        </div>
      </div>
    );
  if (slug === 'social-media')
    return (
      <div className="iw-art iw-art-social" aria-hidden="true">
        <div className="iw-ripple-field">
          <i />
          <i />
          <i />
          <i />
        </div>
        <figure className="iw-print iw-print-a">
          <img src="/assets/dimensions/dim-06-horizon.jpg" alt="" />
        </figure>
        <figure className="iw-print iw-print-b">
          <img src="/assets/dimensions/dim-02-spatial.jpg" alt="" />
        </figure>
        <figure className="iw-print iw-print-c">
          <img src="/assets/dimensions/dim-04-system.jpg" alt="" />
        </figure>
      </div>
    );
  if (slug === 'mobile-app-development')
    return (
      <div className="iw-art iw-art-mobile" aria-hidden="true">
        <div className="iw-phone">
          <span className="iw-phone-island" />
          <div className="iw-phone-screen">
            <i />
            <i />
            <i />
          </div>
        </div>
        <svg className="iw-mobile-ribbon" viewBox="0 0 460 240" fill="none">
          <path d="M22 143C93 51 222 40 334 79C421 109 432 170 359 199C273 233 145 193 98 136C65 97 111 66 184 66" />
          <path className="iw-ribbon-highlight" d="M22 143C93 51 222 40 334 79C421 109 432 170 359 199" />
        </svg>
      </div>
    );
  return (
    <div className="iw-art iw-art-software" aria-hidden="true">
      <span className="iw-structure-grid" />
      {Array.from({ length: 9 }, (_, index) => (
        <i key={index} className={`iw-module iw-module-${index + 1}`} />
      ))}
      <b className="iw-core-module" />
    </div>
  );
}

function Installation({ slug }: { slug: InstallationSlug }) {
  const service = services.find((item) => item.slug === slug)!;
  const item = meta[slug];
  return (
    <Link
      to={`/services/${service.slug}`}
      className={`iw-installation iw-installation-${item.number} iw-tone-${item.tone}`}
      data-service={service.slug}
      aria-label={`${item.number}. ${service.title}: ${service.summary}`}
    >
      <span className="iw-installation-depth" aria-hidden="true" />
      <div className="iw-installation-copy">
        <span className="iw-service-index">{item.number} /</span>
        <h3>
          {item.title.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h3>
        <p>{item.concept}</p>
      </div>
      <Artwork slug={slug} />
      <span className="iw-service-action" aria-hidden="true">
        View service <i>↗</i>
      </span>
    </Link>
  );
}

export function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const runtimeRef = useRef<ServicesRuntime>({
    progress: 0.72,
    manual: false,
    metrics: { camera: [0.15, 0.25, 11.8], rendering: false, errors: [], drawCalls: 0, triangles: 0 },
  });
  const [sceneReady, setSceneReady] = useState(false);
  const embedded = useLocation().pathname === '/';

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !window.matchMedia('(prefers-reduced-motion: no-preference)').matches) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setSceneReady(true);
        observer.disconnect();
      },
      { rootMargin: '900px 0px' }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const stage = stageRef.current;
      if (!section || !stage) return;

      const installations = INSTALLATION_ORDER.map(
        (slug) => stage.querySelector<HTMLElement>(`[data-service="${slug}"]`)!
      ).filter(Boolean);
      const editorial = stage.querySelector<HTMLElement>('.iw-editorial-copy');
      const field = stage.querySelector<HTMLElement>('.iw-landscape-field');
      const bgVisual = stage.querySelector<HTMLElement>('.iw-services-bg-img');
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const desktop = window.matchMedia('(min-width: 960px)').matches;

      // Maps assembly progress [0 .. 0.72] to the resting 6-card 3D collage without requiring scroll scrubbing
      const applyAssembly = (rawAssembly: number) => {
        const progress = clamp01(rawAssembly) * 0.72;
        runtimeRef.current.progress = progress;
        stage.dataset.progress = progress.toFixed(4);
        stage.dataset.animationStage = stageForProgress(progress);

        if (reduced) {
          installations.forEach((installation) => {
            installation.style.removeProperty('transform');
            installation.style.removeProperty('opacity');
            installation.style.removeProperty('pointer-events');
            installation.removeAttribute('tabindex');
          });
          runtimeRef.current.applyScene?.(0.72);
          return;
        }

        const offsetScale = desktop ? 0.55 : 0.16;
        const rotScale = desktop ? 1 : 0.45;
        INSTALLATION_ORDER.forEach((slug, index) => {
          const installation = installations[index];
          const motion = INSTALLATION_MOTION[slug];
          const rootT = smoothstep(segment(progress, motion.start, motion.end));
          const sculptureT = smoothstep(segment(progress, motion.sculptureStart, motion.sculptureEnd));
          const x = lerp(motion.domOffset[0] * offsetScale, 0, rootT);
          const y = lerp(motion.domOffset[1] * offsetScale, 0, rootT);
          const z = lerp(motion.domOffset[2] * offsetScale, 0, rootT);
          const rotateX = lerp(motion.initial.rotation[0] * 22 * rotScale, 0, rootT);
          const rotateY = lerp(motion.initial.rotation[1] * 24 * rotScale, 0, rootT);
          const scale = lerp(desktop ? 0.78 : 0.88, 1, rootT);

          installation.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,${z.toFixed(2)}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
          installation.style.opacity = String(rootT);
          installation.style.pointerEvents = rootT > 0.25 ? 'auto' : 'none';
          installation.tabIndex = 0;

          const backing = installation.querySelector<HTMLElement>('.iw-installation-depth');
          const art = installation.querySelector<HTMLElement>('.iw-art');
          if (backing) {
            backing.style.transform = `translate3d(${lerp(28, 14, rootT)}px,${lerp(32, 16, rootT)}px,${lerp(-80, -24, rootT)}px) scaleY(${lerp(0.4, 1, rootT)})`;
          }
          if (art) {
            art.style.transform = `translate3d(0,${lerp(desktop ? 30 : 14, 0, sculptureT)}px,${lerp(-110, 18, sculptureT)}px) rotateY(${lerp(-24 * rotScale, 0, sculptureT)}deg) scale(${lerp(0.74, 1, sculptureT)})`;
            art.style.opacity = String(sculptureT);
            art.style.setProperty('--iw-local-progress', sculptureT.toFixed(4));
          }
        });

        if (field) {
          const settle = smoothstep(rawAssembly);
          field.style.transform = desktop
            ? `translate3d(0,${lerp(18, -6, settle)}px,${lerp(-50, 0, settle)}px)`
            : `translate3d(0,${lerp(12, 0, settle)}px,0)`;
        }
        runtimeRef.current.applyScene?.(progress);
      };

      if (reduced) {
        applyAssembly(1);
        return;
      }

      const proxy = { t: 0 };
      applyAssembly(0);

      const tl = gsap.timeline({ paused: true });
      if (bgVisual) {
        tl.fromTo(
          bgVisual,
          { scale: 1.09, opacity: 0.35 },
          { scale: 1.02, opacity: 1, duration: 1.35, ease: 'power3.out' },
          0
        );
      }
      if (editorial) {
        tl.fromTo(
          editorial,
          { y: 32, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.78, ease: 'power3.out' },
          0.04
        );
      }
      tl.to(
        proxy,
        {
          t: 1,
          duration: 1.18,
          ease: 'power3.out',
          onUpdate: () => applyAssembly(proxy.t),
        },
        0.06
      );

      const revealTrigger = ScrollTrigger.create({
        id: 'services-auto-reveal',
        trigger: section,
        start: 'top 78%',
        onEnter: () => tl.play(),
      });

      const resetTrigger = ScrollTrigger.create({
        id: 'services-auto-reset',
        trigger: section,
        start: 'top 102%',
        onLeaveBack: () => {
          tl.pause(0);
          proxy.t = 0;
          applyAssembly(0);
        },
      });

      return () => {
        revealTrigger.kill();
        resetTrigger.kill();
      };
    },
    { scope: sectionRef, dependencies: [] }
  );

  return (
    <section
      ref={sectionRef}
      id="services"
      className={`iw-services ${embedded ? 'iw-services-embedded' : 'iw-services-standalone'}`}
      aria-labelledby="services-heading"
    >
      <div ref={stageRef} className="iw-services-scene">
        <div className="iw-services-bg" aria-hidden="true" />
        <div className="iw-paper-grain" aria-hidden="true" />
        {sceneReady && (
          <Suspense fallback={null}>
            <ServicesThreeScene runtimeRef={runtimeRef} />
          </Suspense>
        )}
        <header className="iw-editorial-copy">
          <span className="iw-section-index">Services / 001—006</span>
          <h2 id="services-heading">
            <span>Our</span>
            <span>Services.</span>
          </h2>
          <strong>At Inspiring Wave</strong>
          <p>Strategy, design and technology for a world in motion.</p>
          <Link to="/services" className="iw-explore-link">
            Explore all services <span aria-hidden="true">↗</span>
          </Link>
        </header>
        <div className="iw-landscape-field" aria-label="Six service installations">
          {INSTALLATION_ORDER.map((slug) => (
            <Installation key={slug} slug={slug} />
          ))}
        </div>
      </div>
    </section>
  );
}
