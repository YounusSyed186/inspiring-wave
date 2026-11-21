import { createContext, FormEvent, Fragment, useCallback, useContext, useEffect, useRef, useState } from 'react';
import TypeRemixPreloader, { RemixThemesInput } from '@/components/ui/type-remix-preloader';
import { Link, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { processSteps, services, testimonials } from './data';
import { ZoomParallax } from '@/components/ui/zoom-parallax';
import { zoomParallaxImages } from '@/components/ui/demo';
import { TestimonialSlider, Review } from '@/components/ui/testimonial-slider-1';
import { CtaSlider } from '@/components/ui/cta-slider';
import {
  MotionProvider,
  ScrollTrigger,
  useGSAP,
  useHomepageMotion,
  usePageMotion,
  AnimatedSection,
  AnimatedWords,
  AnimatedLines,
  AnimatedCharacters,
  Reveal,
  EASINGS,
} from './motion';

const Mono = ({ children }: { children: React.ReactNode }) => <span className="mono">{children}</span>;

const IntroActive = createContext(false);

function shouldShowIntro() {
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const preloaderThemes: RemixThemesInput = {
  sticker: { bg: '#080a0b', ink: '#f1efe7', accent: '#1945f5' },
  felt: { bg: '#1945f5', ink: '#f1efe7', accent: '#07111a', pop: ['#f1efe7', '#8fb9d9', '#080a0b', '#f1efe7'] },
  bubble: { bg: '#07111a', ink: '#f1efe7', accent: '#8fb9d9', pop: ['#1945f5', '#f1efe7', '#8fb9d9'] },
  script: { bg: '#1945f5', ink: '#080a0b', accent: '#f1efe7' },
  stretch: { bg: '#f1efe7', ink: '#080a0b', accent: '#1945f5' },
  vector: { bg: '#07111a', ink: '#f1efe7', accent: '#1945f5' },
  cutout: { bg: '#080a0b', ink: '#080a0b', accent: '#f1efe7' },
};

function Header({ menu, setMenu }: { menu: boolean; setMenu: (v: boolean) => void }) {
  const loc = useLocation();
  useEffect(() => { setMenu(false); }, [loc.pathname]);
  useEffect(() => {
    if (!menu) return;
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false);
    document.body.classList.add('menu-open'); document.addEventListener('keydown', key);
    return () => { document.body.classList.remove('menu-open'); document.removeEventListener('keydown', key); };
  }, [menu]);
  return <>
    <header className="header">
      <Link className="wordmark" to="/" aria-label="Inspiring Wave home"><i />INSPIRING WAVE</Link>
      <nav className="desktop-nav" aria-label="Primary"><Link to="/work">WORK</Link><Link to="/services">SERVICES</Link><Link to="/about">STUDIO</Link></nav>
      <div className="header-end"><Link to="/contact">LET'S TALK <span>↗</span></Link><button className="menu-button" onClick={() => setMenu(!menu)} aria-expanded={menu} aria-controls="main-menu">{menu ? 'CLOSE' : 'MENU'}<b>{menu ? '×' : '≡'}</b></button></div>
    </header>
    <div id="main-menu" className={`menu-overlay ${menu ? 'is-open' : ''}`} aria-hidden={!menu}>
      <div className="menu-grid">
        <Mono>MOVE WITH PURPOSE</Mono>
        <nav aria-label="Full-screen navigation">
          {[['01','HOME','/'],['02','WORK','/work'],['03','SERVICES','/services'],['04','STUDIO','/about'],['05','JOURNAL','/journal'],['06','CONTACT','/contact']].map(([n,t,u]) => <Link key={u} to={u}><small>{n}</small>{t}</Link>)}
        </nav>
        <div className="menu-contact"><a href="mailto:info@inspiringwave.in">info@inspiringwave.in</a><a href="tel:+917893801806">+91 78938 01806</a><span>HYDERABAD · INDIA</span></div>
      </div>
    </div>
  </>;
}

function Marker({ n, children, light=false }: { n: string; children: React.ReactNode; light?: boolean }) {
  return <div className={`marker ${light ? 'marker-light' : ''}`}><Mono>{n} /<br />{children}</Mono><i /></div>;
}


function Hero() {
  const introActive = useContext(IntroActive);
  return <AnimatedSection className="hero" aria-labelledby="hero-title" animation="none">
    <Marker n="01" light>INTRO</Marker>
    <p className="hero-studio-label">A creative studio</p>
    <div className="hero-halo" />
    <Fragment key={String(introActive)}>
    <h1 id="hero-title">
      <AnimatedCharacters text="INSPIRING WAVE" delay={0.18} stagger={0.03} />
    </h1>
    <div className="hero-media"><img src="/assets/hero/hero-wave-v2.png" fetchPriority="high" alt="A restrained moonlit barrel wave curls behind dark volcanic rock" /></div>
    <div className="hero-media hero-wave-foreground" aria-hidden="true"><img src="/assets/hero/hero-wave-foreground.png" alt="" /></div>
    <div className="hero-foam" />
    <motion.div
      className="hero-serif"
      initial={{ opacity: 0, x: -36 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.9, delay: 0.42, ease: EASINGS.power4Out }}
    >
      in motion.
    </motion.div>
    <p className="hero-copy">
      <AnimatedWords text="Strategy, design & technology" delay={0.52} stagger={0.035} />
      <br />
      <AnimatedWords text="for a world in motion." delay={0.65} stagger={0.035} />
    </p>
    <motion.div
      className="scroll-cue"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.75, ease: EASINGS.power4Out }}
    >
      <Mono>SCROLL<br />TO EXPLORE</Mono><span>↓</span>
    </motion.div>
    </Fragment>
  </AnimatedSection>;
}

function Manifesto() {
  return <AnimatedSection className="manifesto section" id="manifesto" animation="fade-up">
    <Marker n="02">MANIFESTO</Marker>
    <Reveal className="manifesto-copy">
      <h2>
        <AnimatedLines
          lines={["THE WORLD", "DOESN'T", "STAND STILL."]}
          dataAttribute="data-manifesto-line"
          stagger={0.12}
          as="span"
        />
      </h2>
      <motion.em
        data-motion-line
        initial={{ opacity: 0, x: -28 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.85, delay: 0.36, ease: EASINGS.power4Out }}
      >
        Neither do we.
      </motion.em>
    </Reveal>
    <div className="brush" aria-hidden="true"><svg viewBox="0 0 500 185"><path d="M5 172 C125 41 312 -69 250 58 S196 186 281 143 S363 87 355 135 S403 163 497 141"/></svg></div>
    <Reveal className="manifesto-side" delay={0.18}>
      <i className="cross">+</i>
      <p>
        <AnimatedWords
          text="A creative technology studio that brings strategy, design and engineering together to build meaningful digital experiences."
          delay={0.12}
          stagger={0.025}
        />
      </p>
    </Reveal>
    <div className="marquee"><span>STRATEGY · DESIGN · ENGINEERING · STRATEGY · DESIGN · ENGINEERING · </span></div>
  </AnimatedSection>;
}

const studies = [
  { n:'01', title:'Digital Architecture', tags:'STRATEGY / DESIGN / DEVELOPMENT', image:'/assets/architecture.webp', className:'work-a' },
  { n:'02', title:'Systems in Motion', tags:'PRODUCT / EXPERIENCE / ENGINEERING', image:'/assets/process/process-sculpture.webp', className:'work-b' },
  { n:'03', title:'Culture, Amplified', tags:'CAMPAIGN / CONTENT / SOCIAL', image:'/assets/fabric.webp', className:'work-c' }
];

function Work() {
  const viewport = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const group = element.querySelector<HTMLElement>('.work-group');
    const groupWidth = () => group?.getBoundingClientRect().width ?? 0;
    const centerRail = () => { element.scrollLeft = groupWidth(); };
    const wrapRail = () => {
      const width = groupWidth();
      if (!width) return;
      if (element.scrollLeft < width * .25) element.scrollLeft += width;
      if (element.scrollLeft > width * 1.75) element.scrollLeft -= width;
    };
    const wheelRail = (event: WheelEvent) => {
      event.preventDefault();
      const movement = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      element.scrollLeft += movement;
      wrapRail();
    };
    const settlePage = () => window.dispatchEvent(new Event('iw:rail-enter'));
    const updateArtwork = () => {
      wrapRail();
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      for (const card of element.querySelectorAll<HTMLElement>('.work-item')) {
        const bounds = card.getBoundingClientRect();
        const offset = (innerWidth / 2 - bounds.left - bounds.width / 2) / innerWidth;
        card.style.setProperty('--art-offset', Math.max(-3, Math.min(3, offset * 6)) + '%');
      }
    };
    const resize = new ResizeObserver(centerRail);
    resize.observe(element);
    element.addEventListener('wheel', wheelRail, { passive: false });
    element.addEventListener('pointerenter', settlePage, { passive: true });
    element.addEventListener('scroll', updateArtwork, { passive: true });
    requestAnimationFrame(centerRail);
    return () => {
      resize.disconnect();
      element.removeEventListener('wheel', wheelRail);
      element.removeEventListener('pointerenter', settlePage);
      element.removeEventListener('scroll', updateArtwork);
    };
  }, []);

  return <AnimatedSection className="work section dark" id="work" animation="fade-up">
    <Marker n="03" light>WORK</Marker>
    <Reveal className="section-title">
      <h2>
        <AnimatedWords text="Selected" /> <em><AnimatedWords text="work." delay={0.08} /></em>
      </h2>
      <Link to="/work">VIEW ALL WORK ↗</Link>
    </Reveal>
    <Reveal delay={0.12}>
      <p className="concept-note"><Mono>CAPABILITY STUDIES — illustrative art direction, not client case studies</Mono></p>
    </Reveal>
    <div className="work-viewport" ref={viewport} data-lenis-prevent-wheel aria-label="Selected work. Scroll while hovering to move horizontally.">
      <div className="work-track">
        {[0, 1, 2].map(group => <div className="work-group" aria-hidden={group !== 1} key={group}>{studies.map(s => <Link tabIndex={group !== 1 ? -1 : undefined} to={`/work/${s.title.toLowerCase().replaceAll(' ','-')}`} className="work-item" key={`${group}-${s.n}`}>
          <div className="work-media"><img src={s.image} alt="" /><span>VIEW PROJECT</span></div><div className="work-meta"><Mono>{s.n} — CONCEPT STUDY</Mono><h3>{s.title}</h3><Mono>{s.tags}</Mono></div>
        </Link>)}</div>)}
      </div>
    </div>
  </AnimatedSection>;
}

const serviceImages = [
  '/assets/process/process-sculpture.webp',
  '/assets/architecture.webp',
  '/assets/studio/studio-collaboration.webp',
  '/assets/fabric.webp',
  '/assets/architecture.webp',
  '/assets/process/process-sculpture.webp',
];

function Capabilities() {
  const [active, setActive] = useState(0);

  return <AnimatedSection className="capabilities section" id="services" animation="fade-up">
    <Marker n="04">SERVICES</Marker>
    <Reveal className="cap-intro">
      <h2>
        <AnimatedWords text="WHAT WE" /> <em><AnimatedWords text="move." delay={0.08} /></em>
      </h2>
      <p>
        <AnimatedWords text="Six connected disciplines. One focused studio." delay={0.12} />
      </p>
    </Reveal>
    <div className="service-layout">
      <div className="service-list">
        {services.map((s, i) => {
          const isActive = active === i;
          return (
            <article
              className={`service-row ${isActive ? 'active' : ''}`}
              key={s.slug}
            >
              <button
                type="button"
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                aria-expanded={isActive}
              >
                <b>{String(i + 1).padStart(2, '0')}</b>
                <h3>{s.title}</h3>
                <motion.span
                  animate={{ rotate: isActive ? 45 : 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  ↗
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isActive && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="service-expand"
                  >
                    <p>{s.summary}</p>
                    <Link to={`/services/${s.slug}`}>EXPLORE SERVICE →</Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </article>
          );
        })}
      </div>

      <div className="service-stage" aria-hidden="true">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.01 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={serviceImages[active] || serviceImages[0]}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="stage-number">0{active + 1}</div>
            <div className="stage-grid" />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  </AnimatedSection>;
}

function Method() {
  const [active,setActive] = useState(0);
  const section = useRef<HTMLElement>(null);
  useGSAP(() => {
    if (!section.current || !matchMedia('(min-width:901px) and (prefers-reduced-motion:no-preference)').matches) return;
    const rows = Array.from(section.current.querySelectorAll('li'));
    const triggers = rows.map((row, index) => ScrollTrigger.create({
      trigger: row,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => setActive(index),
      onEnterBack: () => setActive(index),
    }));
    return () => triggers.forEach(trigger => trigger.kill());
  }, { scope: section });

  return <AnimatedSection ref={section} className="method section dark" animation="fade-up" style={{'--stage':active} as React.CSSProperties}>
    <Marker n="05" light>METHOD</Marker>
    <Reveal className="section-title method-title">
      <h2>
        <AnimatedLines lines={["GOOD IDEAS."]} as="span" />
        <br />
        <em><AnimatedWords text="Great execution." delay={0.1} /></em>
      </h2>
    </Reveal>
    <div className="method-layout"><div className="method-object"><img src="/assets/process/process-sculpture.webp" alt="Abstract engineered sculpture evolving from particles to a finished form" /><span style={{width:`${(active+1)*20}%`}} /></div>
    <ol>{processSteps.map(([name,copy],i)=><li className={active===i?'active':''} key={name}><button onClick={()=>setActive(i)}><b>0{i+1}</b><span><strong>{name}</strong><small>{copy}</small></span></button></li>)}</ol></div>
  </AnimatedSection>;
}

function Studio() {
  return <AnimatedSection className="studio section" animation="fade-up">
    <Marker n="06">STUDIO</Marker>
    <Reveal className="studio-title">
      <h2>
        <AnimatedLines lines={["GOOD PEOPLE.", "BIG IDEAS."]} dataAttribute="data-studio-line" as="span" />
        <em data-studio-line>
          <AnimatedWords text="No ordinary work." delay={0.2} />
        </em>
      </h2>
    </Reveal>
    <div className="studio-layout">
      <figure>
        <img src="/assets/studio/studio-collaboration.webp" alt="Conceptual studio scene showing a creative team collaborating around a table" />
        <figcaption><Mono>CONCEPTUAL STUDIO IMAGE / NON-IDENTIFYING</Mono></figcaption>
      </figure>
      <Reveal className="studio-copy" delay={0.16}>
        <Mono>BEHIND THE WAVE</Mono>
        <p>
          <AnimatedWords
            text="We listen before we create. Then we combine creative thinking with technology and data to turn ambitious ideas into useful, memorable experiences."
            delay={0.12}
            stagger={0.025}
          />
        </p>
        <Link to="/about">ABOUT THE STUDIO ↗</Link>
      </Reveal>
    </div>
  </AnimatedSection>;
}

function ParallaxShowcase() {
  return (
    <section className="parallax-showcase section dark" id="dimensions">
      <Marker n="07" light>DIMENSIONS</Marker>
      <div className="parallax-intro">
        <Mono>VISUAL DYNAMICS / IMMERSIVE EXPANSION</Mono>
        <Reveal className="section-title">
          <h2>
            <AnimatedLines lines={["IMPACT IN"]} as="span" />
            <br />
            <em><AnimatedWords text="perspective." delay={0.12} /></em>
          </h2>
        </Reveal>
        <p className="parallax-hint">
          <Mono>SCROLL DOWN TO EXPAND THE VISUAL LAYERS ↓</Mono>
        </p>
      </div>
      <ZoomParallax images={zoomParallaxImages} />
    </section>
  );
}

const clientReviews: Review[] = [
  {
    id: 1,
    name: 'Yeshashwini Kadiri',
    affiliation: 'Principal Architect, Y&M Archiplanners',
    quote: 'Their dedication has truly impressed me and I will continue to use Inspiring Wave as my choice.',
    imageSrc: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=80',
    thumbnailSrc: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 2,
    name: 'Aruna V',
    affiliation: 'Director, Sirgrace Technologies Pvt. Ltd.',
    quote: 'The way the team handled the issues and executed the work is impressive.',
    imageSrc: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=900&q=80',
    thumbnailSrc: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 3,
    name: 'Sandeep Koneri',
    affiliation: 'Director, Creative Eye',
    quote: 'They made a clean, smart and effective website and work closely with us on digital marketing.',
    imageSrc: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80',
    thumbnailSrc: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 4,
    name: 'Ratna Kalluri',
    affiliation: 'Founder, Rad Studio',
    quote: 'A strong team who deliver services with utmost dedication.',
    imageSrc: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80',
    thumbnailSrc: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 5,
    name: 'Aruna V',
    affiliation: 'Managing Partner, Jagannatha Packaging',
    quote: 'From the design to the menus and features, they have done an excellent job.',
    imageSrc: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=900&q=80',
    thumbnailSrc: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=300&q=80',
  },
];

function Trust() {
  return <AnimatedSection className="trust section" animation="fade-up">
    <Marker n="08">TRUST</Marker>
    <Reveal className="trust-title">
      <h2>
        <AnimatedLines lines={["GREAT WORK"]} as="span" />
        <br />
        <em><AnimatedWords text="begins with trust." delay={0.1} /></em>
      </h2>
    </Reveal>
    <div className="client-line">
      {['Y&M ARCHIPLANNERS', 'SIRGRACE TECHNOLOGIES', 'CREATIVE EYE', 'RAD STUDIO', 'JAGANNATHA PACKAGING'].map((client, idx) => (
        <motion.span
          key={client}
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65, delay: idx * 0.08, ease: EASINGS.power4Out }}
        >
          {client}
        </motion.span>
      ))}
    </div>
    <div className="trust-slider-wrap mt-8 md:mt-14">
      <TestimonialSlider
        reviews={clientReviews}
        className="rounded-2xl border border-black/10 dark:border-white/10 shadow-sm bg-transparent"
      />
    </div>
  </AnimatedSection>;
}

function Perspectives() {
  return <AnimatedSection className="journal section dark" animation="fade-up">
    <Marker n="09" light>PERSPECTIVES</Marker>
    <Reveal className="section-title">
      <h2>
        <AnimatedLines lines={["THOUGHTS IN"]} as="span" />
        <br />
        <em><AnimatedWords text="motion." delay={0.1} /></em>
      </h2>
    </Reveal>
    <div className="journal-grid">
      <Reveal className="featured" delay={0.14}>
        <Mono>INSIGHT / 17.03.2026</Mono>
        <h3>
          <AnimatedWords text="Transforming Ideas into Digital Success" delay={0.08} />
        </h3>
        <p>Why an online presence is only the beginning—and how creativity, technology and strategy turn ideas into business impact.</p>
        <a href="https://inspiringwave.in/digital_success/" target="_blank" rel="noreferrer">READ ON THE JOURNAL ↗</a>
      </Reveal>
      <div className="journal-visual"><div className="orbit"><i/><i/><i/></div><Mono>ONE IDEA / GAINING ENERGY</Mono></div>
    </div>
  </AnimatedSection>;
}

function Finale() {
  return <AnimatedSection className="finale finale-cta-section section dark" animation="fade-up">
    <div className="finale-ambient-glow" aria-hidden="true" />
    <Marker n="10" light>MAKE WAVES</Marker>
    <div className="finale-container">
      <Reveal className="finale-head">
        <h2>
          <AnimatedLines lines={["LET'S MAKE"]} as="span" />
          <br />
          <em><AnimatedWords text="waves together." delay={0.12} /></em>
        </h2>
        <p>
          <AnimatedWords text="Select an engagement track below. Every transformational digital presence begins with a focused conversation." delay={0.18} />
        </p>
      </Reveal>
      <div className="finale-slider-wrap mt-8 md:mt-12">
        <CtaSlider />
      </div>
    </div>
  </AnimatedSection>;
}

function Footer() {
  return <footer>
    <div className="footer-top"><Mono>INSPIRING WAVE DIGITECH PVT. LTD.</Mono><div><a href="mailto:info@inspiringwave.in">info@inspiringwave.in</a><a href="tel:+917893801806">+91 78938 01806</a><span>Hyderabad, India</span></div><nav><Link to="/work">Work</Link><Link to="/services">Services</Link><Link to="/about">Studio</Link><Link to="/journal">Journal</Link><Link to="/contact">Contact</Link></nav></div>
    <button className="back-top" onClick={()=>scrollTo({top:0,behavior:'smooth'})}>BACK TO TOP ↑</button>
    <div className="footer-word">INSPIRING<br/>WAVE</div>
    <div className="footer-base"><span>© {new Date().getFullYear()} INSPIRING WAVE</span><a href="https://inspiringwave.in/terms/">TERMS</a><a href="https://www.linkedin.com/company/inspiringwave/">LINKEDIN</a></div>
  </footer>;
}

function Home() {
  const main = useRef<HTMLElement>(null);
  useHomepageMotion(main);
  return <main ref={main} id="main" className="home-cinematic"><Hero/><Manifesto/><Work/><Capabilities/><Method/><Studio/><ParallaxShowcase/><Trust/><Perspectives/><Finale/></main>;
}

function DetailPage({ type }: { type: 'service'|'work' }) {
  const { slug }=useParams(); const navigate=useNavigate(); const item=services.find(s=>s.slug===slug); const title=item?.title || slug?.replaceAll('-',' ') || type;
  const main = useRef<HTMLElement>(null);
  usePageMotion(main);
  const study = studies.find(entry => entry.title.toLowerCase().replaceAll(' ','-') === slug);
  const primary = study?.image ?? '/assets/process/process-sculpture.webp';
  const secondary = type==='service'?'/assets/studio/studio-collaboration.webp':'/assets/fabric.webp';
  return <main ref={main} id="main" className="detail-page">
    <AnimatedSection className="detail-hero" animation="fade-up">
      <Mono>{type==='service'?'CAPABILITY':'CONCEPT STUDY'} / INSPIRING WAVE</Mono>
      <h1><AnimatedWords text={title} delay={0.1} /></h1>
      <em><AnimatedWords text="Impact, in motion." delay={0.22} /></em>
    </AnimatedSection>
    <AnimatedSection className="detail-body" animation="fade-up">
      <div>
        <Mono>THE BRIEF</Mono>
        <h2>{item ? item.summary : 'An editorial capability study exploring how strategy, design and engineering move together.'}</h2>
      </div>
      <div>
        <Mono>HOW WE MOVE</Mono>
        <p>We begin with the business and the audience. Every decision—from the shape of an interaction to the structure beneath it—is made to create clarity, momentum and lasting value.</p>
        {item && <ul>{item.deliverables.map(x=><li key={x}>{x}</li>)}</ul>}
        <Link to="/contact">START A CONVERSATION ↗</Link>
      </div>
    </AnimatedSection>
    <AnimatedSection className="detail-chapters" animation="fade-up">
      <article className="detail-media" data-chapter-color="#f1efe7">
        <img src={primary} alt=""/>
        <div className="detail-media-copy">
          <Mono>01 / DIRECTION</Mono>
          <h2><AnimatedWords text="Clarity creates momentum." /></h2>
          <p>Every frame has a job: reveal the idea, guide attention, and make the next action feel inevitable.</p>
        </div>
      </article>
      <article className="detail-media reverse" data-chapter-color="#dfe5ff">
        <img src={secondary} alt=""/>
        <div className="detail-media-copy">
          <Mono>02 / EXPERIENCE</Mono>
          <h2><AnimatedWords text="Built to keep moving." /></h2>
          <p>A flexible visual and technical system carries the experience from first impression through lasting impact.</p>
        </div>
      </article>
    </AnimatedSection>
    <AnimatedSection className="detail-next" data-chapter-color="#071011" animation="fade-up">
      <Mono>NEXT MOVE / START A PROJECT</Mono>
      <h2>
        <AnimatedLines lines={["Have an idea"]} as="span" />
        <br/>
        <em><AnimatedWords text="worth moving?" delay={0.12} /></em>
      </h2>
      <Link to="/contact">MAKE WAVES <span>↗</span></Link>
    </AnimatedSection>
    <button className="return-link" onClick={()=>navigate(-1)}>← RETURN</button>
  </main>;
}

function Listing({ kind }: { kind:'work'|'services'|'journal'|'about' }) {
  const map={work:['Selected work.','Capability studies and a case-study framework for work that creates momentum.'],services:['Our capabilities.','Strategy, design and engineering—connected from first question to final release.'],journal:['Perspectives.','Notes on design, technology and making meaningful digital experiences.'],about:['Behind the wave.','A Hyderabad creative technology studio where ideas, craft and engineering move together.']}; const [title,copy]=map[kind];
  const main = useRef<HTMLElement>(null);
  usePageMotion(main);
  return <main ref={main} id="main" className="listing">
    <AnimatedSection className="listing-hero" animation="fade-up">
      <Mono>INSPIRING WAVE / {kind.toUpperCase()}</Mono>
      <h1><AnimatedWords text={title} delay={0.08} /></h1>
      <p><AnimatedWords text={copy} delay={0.18} /></p>
    </AnimatedSection>
    {kind==='services' ? (
      <AnimatedSection className="listing-list" animation="fade-up">
        {services.map((s,i)=><Link to={`/services/${s.slug}`} key={s.slug}><b>0{i+1}</b><span>{s.title}<small>{s.summary}</small></span><i>↗</i></Link>)}
      </AnimatedSection>
    ) : kind==='work' ? (
      <AnimatedSection className="listing-work" animation="fade-up">
        {studies.map(s=><Link to={`/work/${s.title.toLowerCase().replaceAll(' ','-')}`} key={s.n}><img src={s.image} alt=""/><Mono>{s.n} / CONCEPT STUDY</Mono><h2>{s.title}</h2></Link>)}
      </AnimatedSection>
    ) : (
      <AnimatedSection className="listing-editorial" animation="fade-up">
        <img src="/assets/studio/studio-collaboration.webp" alt="Conceptual studio collaboration"/>
        <div>
          <h2><AnimatedWords text={kind==='about'?'Creative minds. Inspiring work.':'Transforming ideas into digital success.'} delay={0.1} /></h2>
          <p>{kind==='about'?'We solve business problems by blending innovation, creativity and strategy. Based in Hyderabad, working with ambitious teams everywhere.':'Our journal architecture is ready for future publishing. For now, explore the latest verified article from Inspiring Wave.'}</p>
          {kind==='journal'&&<a href="https://inspiringwave.in/digital_success/">READ ARTICLE ↗</a>}
        </div>
      </AnimatedSection>
    )}
  </main>;
}

function Contact() {
  const [error,setError]=useState('');
  const submit=(e:FormEvent<HTMLFormElement>)=>{e.preventDefault(); const f=new FormData(e.currentTarget); const name=String(f.get('name')||'').trim(),email=String(f.get('email')||'').trim(),message=String(f.get('message')||'').trim(); if(!name||!email.includes('@')||message.length<20){setError('Please add your name, a valid email, and at least 20 characters about the project.');return;} const subject=encodeURIComponent(`Project enquiry from ${name}`); const body=encodeURIComponent(`Name: ${name}\nEmail: ${email}\nCompany: ${f.get('company')}\nServices: ${f.get('services')}\nBudget: ${f.get('budget')}\nTimeline: ${f.get('timeline')}\n\n${message}`); window.location.href=`mailto:info@inspiringwave.in?subject=${subject}&body=${body}`;};
  return <main id="main" className="contact-page">
    <AnimatedSection animation="fade-up">
      <Mono>09 / START A PROJECT</Mono>
      <h1>
        <AnimatedLines lines={["MAKE"]} as="span" />
        <br/>
        <em><AnimatedWords text="waves." delay={0.12} /></em>
      </h1>
      <p>
        <AnimatedWords text="Tell us where you want to go. We’ll help shape the momentum." delay={0.18} />
      </p>
      <a href="mailto:info@inspiringwave.in">info@inspiringwave.in</a>
    </AnimatedSection>
    <form onSubmit={submit} noValidate>
      <label>YOUR NAME *<input name="name" autoComplete="name" /></label>
      <label>EMAIL *<input name="email" type="email" autoComplete="email" /></label>
      <label>COMPANY<input name="company" autoComplete="organization" /></label>
      <label>INTERESTED SERVICES<select name="services"><option>Digital Strategy</option>{services.slice(1).map(s=><option key={s.slug}>{s.title}</option>)}</select></label>
      <label>PROJECT DESCRIPTION *<textarea name="message" rows={4} /></label>
      <div className="form-split">
        <label>APPROX. BUDGET<input name="budget" /></label>
        <label>EXPECTED TIMELINE<input name="timeline" /></label>
      </div>
      {error&&<p className="form-error" role="alert">{error}</p>}
      <button type="submit">PREPARE EMAIL <span>↗</span></button>
      <small>Submitting opens your email client with the enquiry prepared. No message is silently stored or discarded.</small>
    </form>
  </main>;
}

function App() {
  const [loading,setLoading]=useState(shouldShowIntro); const [menu,setMenu]=useState(false);
  const finishIntro = useCallback(() => {
    setLoading(false);
  }, []);
  return <MotionProvider>
    {loading && <TypeRemixPreloader
      className="site-preloader"
      word="INSPIRING WAVE"
      name="INSPIRING WAVE"
      discipline="STRATEGY / DESIGN / TECHNOLOGY"
      year="2026"
      period="HYDERABAD — INDIA"
      handle="INSPIRINGWAVE.IN"
      roles={['Digital Strategy', 'Web Development', 'UI/UX Design', 'Creative Technology']}
      kicker="INSPIRING WAVE"
      tagline="INSPIRING WAVE IN MOTION"
      motto="MAKE WAVES"
      durationMs={7000}
      themes={preloaderThemes}
      onComplete={finishIntro}
    />}
    <IntroActive.Provider value={loading}><div inert={loading}>
    <Header menu={menu} setMenu={setMenu}/>
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/work" element={<Listing kind="work"/>}/>
      <Route path="/work/:slug" element={<DetailPage type="work"/>}/>
      <Route path="/services" element={<Listing kind="services"/>}/>
      <Route path="/services/:slug" element={<DetailPage type="service"/>}/>
      <Route path="/about" element={<Listing kind="about"/>}/>
      <Route path="/journal" element={<Listing kind="journal"/>}/>
      <Route path="/journal/:slug" element={<Listing kind="journal"/>}/>
      <Route path="/contact" element={<Contact/>}/>
      <Route path="*" element={<Home/>}/>
    </Routes>
    <Footer/>
    </div></IntroActive.Provider>
  </MotionProvider>;
}

export default App;
