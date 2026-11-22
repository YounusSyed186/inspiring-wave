import { useCallback, useEffect, useRef, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import TypeRemixPreloader, { RemixThemesInput } from '@/components/ui/type-remix-preloader';
import App, { IntroActive } from './App';

// These values live for the lifetime of the loaded JavaScript document. A full
// refresh evaluates this module again, while client-side routing does not.
let preloaderStartedForDocument = false;
let preloaderCompletedForDocument = false;

const preloaderThemes: RemixThemesInput = {
  sticker: { bg: '#080a0b', ink: '#f1efe7', accent: '#1945f5' },
  felt: { bg: '#1945f5', ink: '#f1efe7', accent: '#07111a', pop: ['#f1efe7', '#8fb9d9', '#080a0b', '#f1efe7'] },
  bubble: { bg: '#07111a', ink: '#f1efe7', accent: '#8fb9d9', pop: ['#1945f5', '#f1efe7', '#8fb9d9'] },
  script: { bg: '#1945f5', ink: '#080a0b', accent: '#f1efe7' },
  stretch: { bg: '#f1efe7', ink: '#080a0b', accent: '#1945f5' },
  vector: { bg: '#07111a', ink: '#f1efe7', accent: '#1945f5' },
  cutout: { bg: '#080a0b', ink: '#080a0b', accent: '#f1efe7' },
};

export default function AppRoot() {
  const [loading, setLoading] = useState(
    () => !preloaderStartedForDocument && !preloaderCompletedForDocument &&
      !(typeof window !== 'undefined' && window.location.search.includes('skip-preloader')),
  );
  const completionHandled = useRef(false);

  useEffect(() => {
    if (loading) preloaderStartedForDocument = true;
  }, [loading]);

  const finishIntro = useCallback(() => {
    if (completionHandled.current) return;
    completionHandled.current = true;
    preloaderCompletedForDocument = true;
    setLoading(false);
  }, []);

  return <>
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
    <IntroActive.Provider value={loading}>
      <div inert={loading}>
        <BrowserRouter><App /></BrowserRouter>
      </div>
    </IntroActive.Provider>
  </>;
}
