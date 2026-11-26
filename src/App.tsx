import { createContext, FormEvent, Fragment, useEffect, useRef, useState } from 'react';
import { Link, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { processSteps, services, testimonials } from './data';
import { ProjectsSection } from '@/components/projects/ProjectsSection';
import { PORTFOLIO_PROJECTS } from '@/components/projects/data/projects';
// import { ArtisticMethodSection } from '@/components/ui/artistic-method-section';
import { CreativeMachineHero } from '@/components/creative-machine/CreativeMachineHero';
import { CustomScrollbar } from '@/components/ui/custom-scrollbar';
import { TornPaperSeam } from '@/components/ui/TornPaperSeam';
import { ServicesSection } from '@/components/services/ServicesSection';
import { TestimonialsSection } from '@/components/testimonials/TestimonialsSection';
import { FinaleSection } from '@/components/sections/FinaleSection';
import InspiringWaveFooter from '@/components/footer/InspiringWaveFooter';
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
  const isServices = loc.pathname === '/services' || loc.pathname.startsWith('/services/');
  const isWork = loc.pathname === '/work' || loc.pathname.startsWith('/work/');
  const isAbout = loc.pathname === '/about' || loc.pathname.startsWith('/about/');
  useEffect(() => { setMenu(false); }, [loc.pathname]);
  useEffect(() => {
    if (!menu) return;
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false);
    document.body.classList.add('menu-open'); document.addEventListener('keydown', key);
    return () => { document.body.classList.remove('menu-open'); document.removeEventListener('keydown', key); };
  }, [menu]);
  return <>
    <header className="header">
      <Link className="wordmark header-wordmark" to="/" aria-label="Inspiring Wave home">
        <img
          src="/assets/inspiring-wave-logo.png"
          alt="INSPIRING WAVE"
          className="header-logo-img transition-transform duration-300 hover:scale-[1.03]"
        />
      </Link>
      <nav className="desktop-nav" aria-label="Primary">
        <Link to="/work" className={isWork ? 'active-nav-link' : ''}>WORK</Link>
        <Link to="/services" className={isServices ? 'active-nav-link' : ''}>SERVICES</Link>
        <Link to="/about" className={isAbout ? 'active-nav-link' : ''}>STUDIO</Link>
      </nav>
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

function Hero() {
  return <CreativeMachineHero />;
}

function Manifesto() {
  return <section id="manifesto" className="manifesto-section cm-manifesto-overlap bg-[#f1efe7] text-[#080c12]" aria-label="Our manifesto">
    <TigerTearReveal
      word="NEITHER DO WE."
      tagline="THE WORLD DOESN’T STAND STILL."
      ink="#1945f5"
      paper="#f1efe7"
      taglineColor="#080c12"
      furColor="#1945f5"
      eyeColor="#d8f03c"
    />
    <div className="manifesto-statement-wrap bg-[#f1efe7] px-6 py-14 sm:py-20 border-t border-[#1945f5]/15">
      <div className="max-w-4xl mx-auto text-center">
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

const studies = PORTFOLIO_PROJECTS.map((p) => ({
  n: p.number,
  title: p.title,
  tags: `${p.category} · ${p.services.join(' / ')}`,
  image: p.coverImage,
  description: p.description,
  slug: p.caseStudyUrl?.replace('/work/', '') || p.title.toLowerCase().replaceAll(' ', '-'),
}));

function Work() {
  return <ProjectsSection />;
}

function Capabilities() {
  return <ServicesSection />;
}

/*
function Method() {
  return <ArtisticMethodSection />;
}
*/

function Trust() {
  return <TestimonialsSection />;
}

function Finale() {
  return <FinaleSection />;
}

function Footer() {
  return (
    <InspiringWaveFooter
      copyright={`© ${new Date().getFullYear()} Inspiring Wave Digitech Pvt. Ltd.`}
    />
  );
}

function Home() {
  const main = useRef<HTMLElement>(null);
  useHomepageMotion(main);
  return <main ref={main} id="main" className="home-cinematic"><Hero /><Manifesto /><Capabilities /><Work /><Trust /><Finale /></main>;
}

function DetailPage({ type }: { type: 'service' | 'work' }) {
  const { slug } = useParams(); const navigate = useNavigate(); const item = services.find(s => s.slug === slug); const title = item?.title || slug?.replaceAll('-', ' ') || type;
  const main = useRef<HTMLElement>(null);
  usePageMotion(main);
  const study = studies.find(entry => entry.slug === slug || entry.title.toLowerCase().replaceAll(' ', '-') === slug);
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

function ServicesPage() {
  const main = useRef<HTMLElement>(null);
  usePageMotion(main);
  return (
    <main ref={main} id="main" className="services-page-wrap bg-[#040814] pt-[66px]">
      <ServicesSection />
    </main>
  );
}

function App() {
  const [menu, setMenu] = useState(false);
  return <MotionProvider>
      <CustomScrollbar />
      <Header menu={menu} setMenu={setMenu} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/work" element={<Listing kind="work" />} />
        <Route path="/work/:slug" element={<DetailPage type="work" />} />
        <Route path="/services" element={<ServicesPage />} />
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
