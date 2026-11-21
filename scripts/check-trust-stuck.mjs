import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

const details = await page.evaluate(() => {
  const trust = document.querySelector('.trust');
  const journal = document.querySelector('.journal');
  const parallax = document.querySelector('.parallax-showcase');
  
  return {
    trust: trust ? {
      top: trust.getBoundingClientRect().top + window.scrollY,
      height: trust.offsetHeight,
      classes: trust.className,
      style: trust.getAttribute('style'),
    } : null,
    journal: journal ? {
      top: journal.getBoundingClientRect().top + window.scrollY,
      height: journal.offsetHeight,
      classes: journal.className,
      style: journal.getAttribute('style'),
    } : null,
    parallax: parallax ? {
      top: parallax.getBoundingClientRect().top + window.scrollY,
      height: parallax.offsetHeight,
    } : null,
  };
});

console.log(JSON.stringify(details, null, 2));

// Check scroll triggers
const triggers = await page.evaluate(() => {
  return window.ScrollTrigger ? window.ScrollTrigger.getAll().map(t => ({
    trigger: t.trigger?.className,
    start: t.start,
    end: t.end,
    vars: t.vars,
  })) : [];
});

console.log('ScrollTriggers count:', triggers.length);
console.log('Triggers around trust/journal:', triggers.filter(t => t.trigger?.includes('trust') || t.trigger?.includes('journal')));

await browser.close();
