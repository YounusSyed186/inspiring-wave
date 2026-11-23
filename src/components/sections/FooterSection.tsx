import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, ArrowUpRight, Mail, Phone, MapPin, Sparkles } from 'lucide-react';

export function FooterSection() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const columns = [
    {
      title: 'Explore',
      links: [
        { label: 'Selected work', href: '/work' },
        { label: 'Services overview', href: '/services' },
        { label: 'Studio archive', href: '/about' },
      ],
    },
    {
      title: 'Thinking',
      links: [
        { label: 'Journal essays', href: '/journal' },
        { label: 'Our 5-step method', href: '/about' },
        { label: 'Capabilities index', href: '/services' },
      ],
    },
    {
      title: 'Connect',
      links: [
        { label: 'Start a project', href: '/contact' },
        { label: 'info@inspiringwave.in', href: 'mailto:info@inspiringwave.in' },
        { label: '+91 78938 01806', href: 'tel:+917893801806' },
      ],
    },
    {
      title: 'Location',
      links: [
        { label: 'LinkedIn', href: 'https://www.linkedin.com/company/inspiringwave/' },
        { label: 'Hyderabad, India' },
        { label: '17.3850° N, 78.4867° E' },
      ],
    },
  ];

  return (
    <footer
      className="site-footer-redesign relative bg-[#05070a] text-[#f1efe7] pt-32 pb-12 sm:pt-28 px-6 sm:px-10 md:px-14 border-t border-white/10 overflow-hidden scroll-mt-20"
      aria-label="Site Footer"
    >
      {/* Background grain */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(#f1efe7 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="max-w-[1380px] mx-auto relative z-10">
        {/* Top Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          {/* Brand Column */}
          <div className="md:col-span-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-[#1945f5] text-white flex items-center justify-center font-display font-black text-base shadow-sm">
                  IW
                </div>
                <span className="font-mono text-sm uppercase tracking-[0.18em] font-bold text-white">
                  INSPIRING WAVE
                </span>
              </div>
              <p className="font-sans text-sm sm:text-base text-white/70 leading-relaxed max-w-sm">
                Strategy, design, and technology for a world in motion. We build expressive, high-performance digital experiences from Hyderabad to everywhere.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] bg-[#1945f5] hover:bg-white hover:text-[#080a0b] text-white px-5 py-2.5 rounded-full transition-all duration-300 font-semibold"
              >
                <span>START A PROJECT</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <a
                href="mailto:info@inspiringwave.in"
                className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] border border-white/20 hover:border-white text-white/80 hover:text-white px-5 py-2.5 rounded-full transition-all duration-300"
              >
                <span>WRITE TO US</span>
              </a>
            </div>
          </div>

          {/* Navigation Links Columns */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {columns.map((col) => (
              <div key={col.title}>
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#d8f03c] font-bold mb-4">
                  {col.title}
                </div>
                <ul className="list-none p-0 m-0 space-y-2.5">
                  {col.links.map((link) => {
                    const isExternal = link.href?.startsWith('http') || link.href?.startsWith('mailto') || link.href?.startsWith('tel');
                    return (
                      <li key={link.label}>
                        {link.href ? (
                          isExternal ? (
                            <a
                              href={link.href}
                              target={link.href.startsWith('http') ? '_blank' : undefined}
                              rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
                              className="font-sans text-xs sm:text-sm text-white/65 hover:text-white transition-colors duration-200 inline-flex items-center gap-1 group"
                            >
                              <span>{link.label}</span>
                              {isExternal && !link.href.startsWith('mailto') && !link.href.startsWith('tel') && (
                                <ArrowUpRight className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                              )}
                            </a>
                          ) : (
                            <Link
                              to={link.href}
                              className="font-sans text-xs sm:text-sm text-white/65 hover:text-white transition-colors duration-200"
                            >
                              {link.label}
                            </Link>
                          )
                        ) : (
                          <span className="font-sans text-xs sm:text-sm text-white/40">
                            {link.label}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Giant Bespoke Responsive Wordmark Banner with Doodles */}
        <div className="py-12 sm:py-16 relative overflow-hidden select-none">
          {/* Interactive Crew Character Stickers perched above the letters */}
          <div className="relative w-full flex items-center justify-between text-[#1945f5] mb-2 px-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
              INDEPENDENT MINDS · MOVING TOGETHER
            </span>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#d8f03c] animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#d8f03c]">
                CRAFTED IN HYDERABAD
              </span>
            </div>
          </div>

          <div className="w-full overflow-hidden text-center">
            <h2 className="m-0 font-display font-black uppercase text-[15vw] sm:text-[14vw] lg:text-[13vw] leading-[0.8] tracking-[-0.05em] text-[#111822] hover:text-[#1945f5]/30 transition-colors duration-500 whitespace-nowrap">
              INSPIRING WAVE
            </h2>
          </div>
        </div>

        {/* Bottom Legal & Meta Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-white/50">
          <div>
            © {new Date().getFullYear()} Inspiring Wave Digitech Pvt. Ltd. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://inspiringwave.in/terms/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
            >
              Terms & Policies
            </a>
            <a
              href="https://www.linkedin.com/company/inspiringwave/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
            >
              LinkedIn
            </a>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-2 text-white hover:text-[#d8f03c] transition-colors cursor-pointer group"
              aria-label="Scroll back to top"
            >
              <span>Back to top</span>
              <ArrowUp className="w-4 h-4 transition-transform group-hover:-translate-y-1" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
