import { useCallback, useEffect, useRef, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import TypeRemixPreloader, { RemixThemesInput } from '@/components/ui/type-remix-preloader';
import { PerformanceDiagnostics } from '@/components/performance/PerformanceDiagnostics';
import App, { IntroActive } from './App';

const HAS_VISITED_KEY = 'iw_preloader_seen_v1';

function checkHasVisited(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return !!(
      sessionStorage.getItem(HAS_VISITED_KEY) ||
      localStorage.getItem(HAS_VISITED_KEY)
    );
  } catch {
    return false;
  }
}

function markAsVisited(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(HAS_VISITED_KEY, 'true');
    localStorage.setItem(HAS_VISITED_KEY, 'true');
  } catch {
    // Ignore storage restrictions
  }
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

export default function AppRoot() {
  const [loading, setLoading] = useState(() => {
    if (typeof window === 'undefined') return false;

    const searchParams = new URLSearchParams(window.location.search);
    if (
      searchParams.has('nopreload') ||
      window.location.pathname.startsWith('/services')
    ) {
      markAsVisited();
      return false;
    }

    // Force replay when requested via query param
    if (searchParams.has('preload') || searchParams.has('replay')) {
      return true;
    }

    // Run ONLY on first visit: if already visited in this browser, skip
    if (checkHasVisited()) {
      return false;
    }

    return true;
  });
  const completionHandled = useRef(false);

  const finishIntro = useCallback(() => {
    if (completionHandled.current) return;
    completionHandled.current = true;
    markAsVisited();
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
    <PerformanceDiagnostics />
  </>;
}
