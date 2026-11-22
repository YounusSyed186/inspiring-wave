import { createContext, FormEvent, Fragment, useEffect, useRef, useState } from 'react';
import { Link, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { processSteps, services, testimonials } from './data';
import { ZoomParallax } from '@/components/ui/zoom-parallax';
import { zoomParallaxImages } from '@/components/ui/demo';
import { AnimatedMarqueeHero } from '@/components/ui/hero-3';
import { ArtisticMethodSection } from '@/components/ui/artistic-method-section';
import { CreativeMachineHero } from '@/components/creative-machine/CreativeMachineHero';
import { TestimonialSlider, Review } from '@/components/ui/testimonial-slider-1';
import { CtaSlider } from '@/components/ui/cta-slider';
import DoodleCrewFooter from '@/components/ui/doodle-crew-footer';
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

export const IntroActive = createContext(false);

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
          {[['01', 'HOME', '/'], ['02', 'WORK', '/work'], ['03', 'SERVICES', '/services'], ['04', 'STUDIO', '/about'], ['05', 'JOURNAL', '/journal'], ['06', 'CONTACT', '/contact']].map(([n, t, u]) => <Link key={u} to={u}><small>{n}</small>{t}</Link>)}
        </nav>
        <div className="menu-contact"><a href="mailto:info@inspiringwave.in">info@inspiringwave.in</a><a href="tel:+917893801806">+91 78938 01806</a><span>HYDERABAD · INDIA</span></div>
      </div>
    </div>
  </>;
}

function Marker({ n, children, light = false }: { n: string; children: React.ReactNode; light?: boolean }) {
  return <div className={`marker ${light ? 'marker-light' : ''}`}><Mono>{n} /<br />{children}</Mono><i /></div>;
}


function Hero() {
  return <CreativeMachineHero />;
}

function Manifesto() {
  return <section id="manifesto" className="manifesto-section cm-manifesto-overlap bg-[#f1efe7] text-[#080c12]" aria-label="Our manifesto">
    <TigerTearReveal
      word="NEITHER DO WE."
      tagline="02 / MANIFESTO — THE WORLD DOESN’T STAND STILL."
      ink="#1945f5"
      paper="#f1efe7"
      taglineColor="#080c12"
      furColor="#1945f5"
      eyeColor="#d8f03c"
    />
    <div className="manifesto-statement-wrap bg-[#f1efe7] px-6 py-14 sm:py-20 border-t border-[#1945f5]/15">
      <div className="max-w-4xl mx-auto text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#080c12] text-[#f1efe7] px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] mb-6">
          <span className="w-2 h-2 rounded-full bg-[#d8f03c]" />
          <span>02 // OUR MANIFESTO</span>
        </span>
        <p className="manifesto-statement !p-0 !bg-transparent text-[#080c12]">
          A creative technology studio that brings strategy, design and engineering together to build{" "}
          <span className="inline-block -rotate-1 px-3 py-0.5 bg-[#1945f5] text-[#f1efe7] italic shadow-sm">
            meaningful digital experiences.
          </span>
        </p>
      </div>
    </div>
  </section>;
}

const studies = [
  { n: '01', title: 'Digital Architecture', tags: 'STRATEGY / DESIGN / DEVELOPMENT', image: '/assets/architecture.webp', className: 'work-a' },
  { n: '02', title: 'Systems in Motion', tags: 'PRODUCT / EXPERIENCE / ENGINEERING', image: '/assets/process/process-sculpture.webp', className: 'work-b' },
  { n: '03', title: 'Culture, Amplified', tags: 'CAMPAIGN / CONTENT / SOCIAL', image: '/assets/fabric.webp', className: 'work-c' }
];

function Work() {
  return <section id="work" className="studio-projects" aria-labelledby="work-heading">
    <AnimatedMarqueeHero
      headingId="work-heading"
      tagline="03 / SELECTED WORK — CONCEPT & CAPABILITY STUDIES"
      title={
        <>
          Selected <em className="text-[#5676ff]">work.</em>
        </>
      }
      description="Digital products, brand identities, and high-performance web platforms engineered for clarity, cultural momentum, and measurable business impact."
      ctaText="View All Work"
      ctaHref="/work"
      images={studies.map(study => study.image)}
      items={studies.map(study => ({ number: study.n, title: study.title, category: study.tags, image: study.image, href: "/work/" + study.title.toLowerCase().replaceAll(" ", "-") }))}
    />
  </section>;
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
  return <ArtisticMethodSection />;
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
    <section className="parallax-showcase dark relative bg-[#030506] text-[#f1efe7] pt-28 md:pt-36" id="dimensions">
      {/* Torn-Paper Top Edge from ivory 06 / STUDIO above */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 right-0 w-full overflow-hidden leading-none z-20"
      >
        <svg
          viewBox="0 0 1440 72"
          preserveAspectRatio="none"
          className="w-full h-10 sm:h-14 md:h-16 block drop-shadow-[0_12px_18px_rgba(0,0,0,0.65)]"
        >
          <path
            d="M0 0 L1440 0 L1440 44 L1320 32 L1200 50 L1080 28 L960 48 L840 26 L720 46 L600 30 L480 52 L360 28 L240 46 L120 32 L0 44 Z"
            fill="#ffffff"
            opacity="0.88"
          />
          <path
            d="M0 0 L1440 0 L1440 36 L1320 24 L1200 42 L1080 20 L960 40 L840 18 L720 38 L600 22 L480 44 L360 20 L240 38 L120 24 L0 36 Z"
            fill="#f1efe7"
          />
        </svg>
      </div>

      <Marker n="07" light>DIMENSIONS</Marker>

      <div className="dimensions-intro relative z-20 max-w-[1380px] mx-auto px-6 sm:px-12 md:pl-[12vw] pb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-3.5 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-[#d8f03c] mb-5">
          <span>VISUAL DYNAMICS // IMMERSIVE EXPANSION</span>
        </div>

        <Reveal className="section-title !m-0 !border-0 !p-0">
          <h2 className="m-0 flex flex-wrap items-baseline gap-x-5 gap-y-2 leading-none">
            <span className="relative inline-block px-3 py-1 border border-[#5676ff]/60 bg-[#1945f5]/[0.06] font-display font-black uppercase tracking-[-0.04em] text-6xl sm:text-8xl md:text-9xl text-[#f1efe7] leading-[0.86]">
              <i className="pointer-events-none absolute -top-1.5 -left-1.5 w-2.5 h-2.5 bg-[#f1efe7] border border-[#1945f5]" />
              <i className="pointer-events-none absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-[#f1efe7] border border-[#1945f5]" />
              <i className="pointer-events-none absolute -bottom-1.5 -left-1.5 w-2.5 h-2.5 bg-[#f1efe7] border border-[#1945f5]" />
              <i className="pointer-events-none absolute -bottom-1.5 -right-1.5 w-2.5 h-2.5 bg-[#f1efe7] border border-[#1945f5]" />
              IMPACT IN
            </span>
            <span
              className="relative inline-block -rotate-2 px-6 py-2 bg-[#f1efe7] text-[#080a0b] shadow-[0_18px_40px_rgba(0,0,0,0.75)]"
              style={{
                clipPath:
                  'polygon(1.8% 3.2%, 48% 1.2%, 98.4% 2.8%, 99.1% 52%, 97.8% 97.4%, 51% 98.8%, 1.4% 96.8%, 0.8% 49%)',
              }}
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-2.5 left-1/2 -translate-x-1/2 w-16 h-4 bg-[#d8f03c]/90 rotate-2 shadow-sm"
              />
              <em className="font-serif italic font-normal lowercase text-5xl sm:text-7xl md:text-8xl text-[#1945f5] tracking-[-0.02em] leading-none block">
                perspective.
              </em>
            </span>
          </h2>
        </Reveal>

        <p className="parallax-hint mt-5 font-mono text-xs uppercase tracking-[0.18em] text-[#f1efe7]/65">
          SCROLL DOWN TO EXPAND THE 7-LAYER VISUAL FIELD ↓
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
      <div className="journal-visual"><div className="orbit"><i /><i /><i /></div><Mono>ONE IDEA / GAINING ENERGY</Mono></div>
    </div>
  </AnimatedSection>;
}

function Finale() {
  return <AnimatedSection className="finale finale-cta-section section dark" animation="fade-up">
    <div className="finale-ambient-glow" aria-hidden="true" />
    <Marker n="10" light>MAKE WAVES</Marker>
    <div className="finale-container md:pl-[10vw]">
      <Reveal className="finale-id-head mb-10 md:mb-14">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-3.5 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-[#d8f03c] mb-5">
          <span>10 // INITIATE COLLABORATION</span>
        </div>
        <h2 className="m-0 flex flex-wrap items-baseline gap-x-5 gap-y-3 leading-none">
          <span className="relative inline-block px-3.5 py-1.5 border border-[#5676ff]/65 bg-[#1945f5]/[0.06] font-display font-black uppercase tracking-[-0.04em] text-6xl sm:text-8xl md:text-9xl text-[#f1efe7] leading-[0.86]">
            <i className="pointer-events-none absolute -top-1.5 -left-1.5 w-2.5 h-2.5 bg-[#f1efe7] border border-[#1945f5]" />
            <i className="pointer-events-none absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-[#f1efe7] border border-[#1945f5]" />
            <i className="pointer-events-none absolute -bottom-1.5 -left-1.5 w-2.5 h-2.5 bg-[#f1efe7] border border-[#1945f5]" />
            <i className="pointer-events-none absolute -bottom-1.5 -right-1.5 w-2.5 h-2.5 bg-[#f1efe7] border border-[#1945f5]" />
            LET'S MAKE
          </span>
          <span
            className="relative inline-block -rotate-2 px-6 py-2 bg-[#f1efe7] text-[#080a0b] shadow-[0_18px_40px_rgba(0,0,0,0.75)]"
            style={{
              clipPath:
                'polygon(1.6% 2.8%, 49% 1.1%, 98.6% 3.1%, 99.2% 51%, 98.1% 97.6%, 52% 98.9%, 1.5% 97.1%, 0.9% 48%)',
            }}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-2.5 left-1/2 -translate-x-1/2 w-16 h-4 bg-[#d8f03c]/90 rotate-2 shadow-sm"
            />
            <em className="font-serif italic font-normal lowercase text-5xl sm:text-7xl md:text-8xl text-[#1945f5] tracking-[-0.02em] leading-none block">
              waves{"\u00A0"}together.
            </em>
          </span>
        </h2>
        <p className="mt-6 max-w-2xl font-sans text-base sm:text-lg text-[#f1efe7]/75 leading-relaxed">
          <AnimatedWords text="Select an engagement track below. Every transformational digital presence begins with a focused conversation." delay={0.12} />
        </p>
      </Reveal>
      <div className="finale-slider-wrap mt-8 md:mt-10">
        <CtaSlider />
      </div>
    </div>
  </AnimatedSection>;
}

function Footer() {
  return <DoodleCrewFooter
    wordmark="INSPIRING"
    brand="Inspiring Wave"
    blurb="Strategy, design and technology for a world in motion. We build expressive digital experiences from Hyderabad to everywhere."
    tagline="Independent minds, moving together to make work with real momentum."
    columns={[
      { title: 'Explore', links: [{ label: 'Selected work', href: '/work' }, { label: 'Services', href: '/services' }, { label: 'Studio', href: '/about' }] },
      { title: 'Thinking', links: [{ label: 'Journal', href: '/journal' }, { label: 'Our approach', href: '/about' }, { label: 'Capabilities', href: '/services' }] },
      { title: 'Connect', links: [{ label: 'Start a project', href: '/contact' }, { label: 'info@inspiringwave.in', href: 'mailto:info@inspiringwave.in' }, { label: '+91 78938 01806', href: 'tel:+917893801806' }] },
      { title: 'Social', links: [{ label: 'LinkedIn', href: 'https://www.linkedin.com/company/inspiringwave/' }, { label: 'Hyderabad, India' }] },
    ]}
    actions={[
      { label: 'Write to us', href: 'mailto:info@inspiringwave.in', icon: 'plane', variant: 'outline' },
      { label: 'Start a project', href: '/contact', icon: 'sparkle', variant: 'solid' },
    ]}
    copyright={`© ${new Date().getFullYear()} Inspiring Wave Digitech Pvt. Ltd.`}
    legal={[{ label: 'Terms', href: 'https://inspiringwave.in/terms/' }]}
    socials={[{ label: 'LinkedIn', href: 'https://www.linkedin.com/company/inspiringwave/' }]}
  />;
}

function Home() {
  const main = useRef<HTMLElement>(null);
  useHomepageMotion(main);
  return <main ref={main} id="main" className="home-cinematic"><Hero /><Manifesto /><Work /><Capabilities /><Method /><Studio /><ParallaxShowcase /><Trust /><Perspectives /><Finale /></main>;
}

function DetailPage({ type }: { type: 'service' | 'work' }) {
  const { slug } = useParams(); const navigate = useNavigate(); const item = services.find(s => s.slug === slug); const title = item?.title || slug?.replaceAll('-', ' ') || type;
  const main = useRef<HTMLElement>(null);
  usePageMotion(main);
  const study = studies.find(entry => entry.title.toLowerCase().replaceAll(' ', '-') === slug);
  const primary = study?.image ?? '/assets/process/process-sculpture.webp';
  const secondary = type === 'service' ? '/assets/studio/studio-collaboration.webp' : '/assets/fabric.webp';
  return <main ref={main} id="main" className="detail-page">
    <AnimatedSection className="detail-hero" animation="fade-up">
      <Mono>{type === 'service' ? 'CAPABILITY' : 'CONCEPT STUDY'} / INSPIRING WAVE</Mono>
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
        {item && <ul>{item.deliverables.map(x => <li key={x}>{x}</li>)}</ul>}
        <Link to="/contact">START A CONVERSATION ↗</Link>
      </div>
    </AnimatedSection>
    <AnimatedSection className="detail-chapters" animation="fade-up">
      <article className="detail-media" data-chapter-color="#f1efe7">
        <img src={primary} alt="" />
        <div className="detail-media-copy">
          <Mono>01 / DIRECTION</Mono>
          <h2><AnimatedWords text="Clarity creates momentum." /></h2>
          <p>Every frame has a job: reveal the idea, guide attention, and make the next action feel inevitable.</p>
        </div>
      </article>
      <article className="detail-media reverse" data-chapter-color="#dfe5ff">
        <img src={secondary} alt="" />
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
        <br />
        <em><AnimatedWords text="worth moving?" delay={0.12} /></em>
      </h2>
      <Link to="/contact">MAKE WAVES <span>↗</span></Link>
    </AnimatedSection>
    <button className="return-link" onClick={() => navigate(-1)}>← RETURN</button>
  </main>;
}

function Listing({ kind }: { kind: 'work' | 'services' | 'journal' | 'about' }) {
  const map = { work: ['Selected work.', 'Capability studies and a case-study framework for work that creates momentum.'], services: ['Our capabilities.', 'Strategy, design and engineering—connected from first question to final release.'], journal: ['Perspectives.', 'Notes on design, technology and making meaningful digital experiences.'], about: ['Behind the wave.', 'A Hyderabad creative technology studio where ideas, craft and engineering move together.'] }; const [title, copy] = map[kind];
  const main = useRef<HTMLElement>(null);
  usePageMotion(main);
  return <main ref={main} id="main" className="listing">
    <AnimatedSection className="listing-hero" animation="fade-up">
      <Mono>INSPIRING WAVE / {kind.toUpperCase()}</Mono>
      <h1><AnimatedWords text={title} delay={0.08} /></h1>
      <p><AnimatedWords text={copy} delay={0.18} /></p>
    </AnimatedSection>
    {kind === 'services' ? (
      <AnimatedSection className="listing-list" animation="fade-up">
        {services.map((s, i) => <Link to={`/services/${s.slug}`} key={s.slug}><b>0{i + 1}</b><span>{s.title}<small>{s.summary}</small></span><i>↗</i></Link>)}
      </AnimatedSection>
    ) : kind === 'work' ? (
      <AnimatedSection className="listing-work" animation="fade-up">
        {studies.map(s => <Link to={`/work/${s.title.toLowerCase().replaceAll(' ', '-')}`} key={s.n}><img src={s.image} alt="" /><Mono>{s.n} / CONCEPT STUDY</Mono><h2>{s.title}</h2></Link>)}
      </AnimatedSection>
    ) : (
      <AnimatedSection className="listing-editorial" animation="fade-up">
        <img src="/assets/studio/studio-collaboration.webp" alt="Conceptual studio collaboration" />
        <div>
          <h2><AnimatedWords text={kind === 'about' ? 'Creative minds. Inspiring work.' : 'Transforming ideas into digital success.'} delay={0.1} /></h2>
          <p>{kind === 'about' ? 'We solve business problems by blending innovation, creativity and strategy. Based in Hyderabad, working with ambitious teams everywhere.' : 'Our journal architecture is ready for future publishing. For now, explore the latest verified article from Inspiring Wave.'}</p>
          {kind === 'journal' && <a href="https://inspiringwave.in/digital_success/">READ ARTICLE ↗</a>}
        </div>
      </AnimatedSection>
    )}
  </main>;
}

function Contact() {
  const [error, setError] = useState('');
  const submit = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const f = new FormData(e.currentTarget); const name = String(f.get('name') || '').trim(), email = String(f.get('email') || '').trim(), message = String(f.get('message') || '').trim(); if (!name || !email.includes('@') || message.length < 20) { setError('Please add your name, a valid email, and at least 20 characters about the project.'); return; } const subject = encodeURIComponent(`Project enquiry from ${name}`); const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nCompany: ${f.get('company')}\nServices: ${f.get('services')}\nBudget: ${f.get('budget')}\nTimeline: ${f.get('timeline')}\n\n${message}`); window.location.href = `mailto:info@inspiringwave.in?subject=${subject}&body=${body}`; };
  return <main id="main" className="contact-page">
    <AnimatedSection animation="fade-up">
      <Mono>09 / START A PROJECT</Mono>
      <h1>
        <AnimatedLines lines={["MAKE"]} as="span" />
        <br />
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
      <label>INTERESTED SERVICES<select name="services"><option>Digital Strategy</option>{services.slice(1).map(s => <option key={s.slug}>{s.title}</option>)}</select></label>
      <label>PROJECT DESCRIPTION *<textarea name="message" rows={4} /></label>
      <div className="form-split">
        <label>APPROX. BUDGET<input name="budget" /></label>
        <label>EXPECTED TIMELINE<input name="timeline" /></label>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button type="submit">PREPARE EMAIL <span>↗</span></button>
      <small>Submitting opens your email client with the enquiry prepared. No message is silently stored or discarded.</small>
    </form>
  </main>;
}

function App() {
  const [menu, setMenu] = useState(false);
  return <MotionProvider>
      <Header menu={menu} setMenu={setMenu} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/work" element={<Listing kind="work" />} />
        <Route path="/work/:slug" element={<DetailPage type="work" />} />
        <Route path="/services" element={<Listing kind="services" />} />
        <Route path="/services/:slug" element={<DetailPage type="service" />} />
        <Route path="/about" element={<Listing kind="about" />} />
        <Route path="/journal" element={<Listing kind="journal" />} />
        <Route path="/journal/:slug" element={<Listing kind="journal" />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <Footer />
  </MotionProvider>;
}

export default App;
import TigerTearReveal from '@/components/ui/tiger-tear-reveal';
