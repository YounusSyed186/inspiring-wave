import { useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import './trust.css';

interface ClientProof {
  id: number;
  name: string;
  role: string;
  company: string;
  quote: string;
  verifiedTag: string;
}

const CLIENT_TESTIMONIALS: ClientProof[] = [
  {
    id: 1,
    name: 'Yeshashwini Kadiri',
    role: 'Principal Architect',
    company: 'Y&M ARCHIPLANNERS',
    quote: 'Their dedication has truly impressed me and I will continue to use Inspiring Wave as my choice.',
    verifiedTag: 'CLIENT COLLABORATION // VERIFIED ARCHITECTURAL SYSTEM',
  },
  {
    id: 2,
    name: 'Aruna V',
    role: 'Director',
    company: 'SIRGRACE TECHNOLOGIES',
    quote: 'The way the team handled the issues and executed the work is impressive.',
    verifiedTag: 'ENGINEERING & DEPLOYMENT // VERIFIED PLATFORM',
  },
  {
    id: 3,
    name: 'Sandeep Koneri',
    role: 'Director',
    company: 'CREATIVE EYE',
    quote: 'They made a clean, smart and effective website and work closely with us on digital marketing.',
    verifiedTag: 'WEB PLATFORM & STRATEGY // VERIFIED GROWTH',
  },
  {
    id: 4,
    name: 'Ratna Kalluri',
    role: 'Founder',
    company: 'RAD STUDIO',
    quote: 'A strong team who deliver services with utmost dedication.',
    verifiedTag: 'CREATIVE BRANDING // VERIFIED IDENTITY',
  },
  {
    id: 5,
    name: 'Aruna V',
    role: 'Managing Partner',
    company: 'JAGANNATHA PACKAGING',
    quote: 'From the design to the menus and features, they have done an excellent job.',
    verifiedTag: 'DIGITAL CATALOG // VERIFIED DESIGN SYSTEM',
  },
];

export function TrustSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const client = CLIENT_TESTIMONIALS[activeIdx];
  const move = (step: number) => setActiveIdx(index => (index + step + CLIENT_TESTIMONIALS.length) % CLIENT_TESTIMONIALS.length);
  return <section id="trust" className="client-voices" aria-labelledby="voices-title">
    <div className="voices-top"><span>05 / CLIENT VOICES</span><span>INSPIRING WAVE®</span></div>
    <h2 id="voices-title">WORDS THAT <span>STAY.</span></h2>
    <div className="voices-composition">
      <div className="voices-world">
        <img src="/images/services/strategy-globe-v2.webp" alt="Sculptural globe with ivory continents and a lime orbit" loading="lazy" />
        <div className="voices-pin"><i />BENGALURU, IN</div>
        <div className="voices-stats" aria-label="Client statistics">
          <p><strong>50+</strong><span>CLIENTS</span></p><i />
          <p><strong>12</strong><span>COUNTRIES</span></p><i />
          <p><strong>98%</strong><span>REPEAT RATE</span></p>
        </div>
      </div>
      <div className="voices-deck">
        <div className="voices-layer voices-layer-wave" aria-hidden="true" />
        <div className="voices-layer voices-layer-lime" aria-hidden="true" />
        <div className="voices-layer voices-layer-cloud" aria-hidden="true" />
        <article className="voices-card" aria-live="polite" aria-atomic="true">
          <span className="voices-quote" aria-hidden="true">“</span>
          <blockquote>{client.quote}</blockquote>
          <div className="voices-author">
            <span className="voices-monogram" aria-hidden="true">{client.name.split(' ').map(part => part[0]).join('')}</span>
            <div><strong>{client.name}</strong><p>{client.role}</p><span>{client.company}</span></div>
            <div className="voices-rating"><b>★★★★★</b><span>5.0 / CLIENT REVIEW</span></div>
          </div>
        </article>
        <div className="voices-controls">
          <span>0{activeIdx + 1} / 0{CLIENT_TESTIMONIALS.length}</span>
          <button onClick={() => move(-1)} aria-label="Previous testimonial"><ArrowLeft /></button>
          <button onClick={() => move(1)} aria-label="Next testimonial"><ArrowRight /></button>
          <button className="voices-more" onClick={() => move(1)}>EXPLORE MORE VOICES <ArrowUpRight /></button>
        </div>
      </div>
    </div>
    <div className="voices-tear" aria-hidden="true" />
  </section>;
}
