import React, { useMemo } from 'react'
import { win } from './types'

export interface CapabilitiesCanvasProps {
  progress: number
  activeIdx: number
}

export const CapabilitiesCanvas: React.FC<CapabilitiesCanvasProps> = ({ progress, activeIdx }) => {
  const p = progress

  // Transition weights between stages
  const wIntro = win(p, 0.0, 0.08)
  const wStratBuild = win(p, 0.08, 0.16)
  const wStratResolve = win(p, 0.16, 0.22)
  const wStratToWeb = win(p, 0.22, 0.28)
  const wWebBuild = win(p, 0.28, 0.34)
  const wWebComplete = win(p, 0.34, 0.40)
  const wWebToUI = win(p, 0.40, 0.46)
  const wUIBuild = win(p, 0.46, 0.54)
  const wUIToSocial = win(p, 0.54, 0.60)
  const wSocialBuild = win(p, 0.60, 0.67)
  const wSocialAmplify = win(p, 0.67, 0.73)
  const wSocialToMobile = win(p, 0.73, 0.79)
  const wMobileBuild = win(p, 0.79, 0.86)
  const wMobileToSoft = win(p, 0.86, 0.90)
  const wSoftBuild = win(p, 0.90, 0.96)
  const wFinal = win(p, 0.96, 1.0)

  // 1. Digital Strategy nodes (12 coordinate points morphing from scattered to golden cluster to grid)
  const nodes = useMemo(() => [
    { id: 'n1', label: 'IDEAS', sx: 60, sy: 70, cx: 180, cy: 150, gx: 80, gy: 80 },
    { id: 'n2', label: 'INSIGHTS', sx: 240, sy: 40, cx: 280, cy: 90, gx: 220, gy: 80 },
    { id: 'n3', label: 'DATA', sx: 420, sy: 80, cx: 360, cy: 140, gx: 360, gy: 80 },
    { id: 'n4', label: 'OPPORTUNITIES', sx: 500, sy: 160, cx: 410, cy: 220, gx: 500, gy: 80 },
    { id: 'n5', label: 'SIGNALS', sx: 110, sy: 190, cx: 160, cy: 240, gx: 80, gy: 200 },
    { id: 'n6', label: 'CORE', sx: 290, sy: 210, cx: 290, cy: 210, gx: 220, gy: 200 }, // lime hub
    { id: 'n7', label: 'VISION', sx: 440, sy: 260, cx: 380, cy: 270, gx: 360, gy: 200 },
    { id: 'n8', label: 'CHANNELS', sx: 530, sy: 310, cx: 460, cy: 300, gx: 500, gy: 200 },
    { id: 'n9', label: 'METRICS', sx: 90, sy: 340, cx: 150, cy: 330, gx: 80, gy: 320 },
    { id: 'n10', label: 'ROADMAP', sx: 230, sy: 360, cx: 240, cy: 320, gx: 220, gy: 320 },
    { id: 'n11', label: 'VALUE', sx: 370, sy: 380, cx: 340, cy: 340, gx: 360, gy: 320 },
    { id: 'n12', label: 'SCALE', sx: 490, sy: 410, cx: 450, cy: 380, gx: 500, gy: 320 },
  ], [])

  return (
    <div className="lca-canvas-container" aria-hidden="true">
      {/* Blueprint Grid Coordinates & Technical Crosshairs */}
      <div className="lca-blueprint-grid">
        <span className="lca-cross lca-cross-tl">+</span>
        <span className="lca-cross lca-cross-tr">+</span>
        <span className="lca-cross lca-cross-bl">+</span>
        <span className="lca-cross lca-cross-br">+</span>
        <div className="lca-grid-hlines" />
        <div className="lca-grid-vlines" />
        <div className="lca-meta-stamp">
          <span>GRID 12-COL // RATIO 1:1.618</span>
          <span>LAT 17.3850° N, 78.4867° E</span>
        </div>
      </div>

      {/* STAGE 01: DIGITAL STRATEGY (Network & Golden Ratio Cluster) */}
      <div
        className="lca-layer lca-layer-strategy"
        style={{
          opacity: (wStratBuild > 0.02 && wStratToWeb < 0.98) ? Math.min(wStratBuild, 1 - wStratToWeb) : 0,
          transform: `scale(${0.92 + 0.08 * wStratResolve}) translate3d(${(1 - wStratResolve) * 20}px, 0, 0)`,
        }}
      >
        <svg viewBox="0 0 600 450" className="lca-strategy-svg">
          {/* Connection Lines */}
          <g stroke="#2045FF" strokeWidth="1.5" strokeOpacity={0.45 + 0.35 * wStratResolve}>
            {nodes.map((node, i) => {
              if (i >= nodes.length - 1) return null
              const next = nodes[(i * 3 + 1) % nodes.length]
              // Morph position: scattered (sx) -> clustered (cx) -> grid (gx)
              const curX = wStratToWeb > 0 ? (node.cx + (node.gx - node.cx) * wStratToWeb) : (node.sx + (node.cx - node.sx) * wStratResolve)
              const curY = wStratToWeb > 0 ? (node.cy + (node.gy - node.cy) * wStratToWeb) : (node.sy + (node.cy - node.sy) * wStratResolve)
              const nextX = wStratToWeb > 0 ? (next.cx + (next.gx - next.cx) * wStratToWeb) : (next.sx + (next.cx - next.sx) * wStratResolve)
              const nextY = wStratToWeb > 0 ? (next.cy + (next.gy - next.cy) * wStratToWeb) : (next.sy + (next.cy - next.sy) * wStratResolve)
              return (
                <line
                  key={`line-${i}`}
                  x1={curX}
                  y1={curY}
                  x2={nextX}
                  y2={nextY}
                  strokeDasharray={wStratResolve > 0.6 ? 'none' : '4 4'}
                />
              )
            })}
          </g>

          {/* Central polygon & golden spiral lines in resolve phase */}
          {wStratResolve > 0.1 && (
            <g stroke="#DFFF00" strokeWidth="1.8" fill="rgba(32, 69, 255, 0.08)">
              <polygon
                points="290,210 360,140 410,220 380,270 240,320 160,240"
                opacity={wStratResolve * (1 - wStratToWeb)}
              />
              <circle cx="290" cy="210" r="48" stroke="#2045FF" strokeWidth="1" strokeDasharray="3 3" fill="none" opacity={wStratResolve} />
            </g>
          )}

          {/* Nodes */}
          {nodes.map((node) => {
            const curX = wStratToWeb > 0 ? (node.cx + (node.gx - node.cx) * wStratToWeb) : (node.sx + (node.cx - node.sx) * wStratResolve)
            const curY = wStratToWeb > 0 ? (node.cy + (node.gy - node.cy) * wStratToWeb) : (node.sy + (node.cy - node.sy) * wStratResolve)
            const isCenter = node.id === 'n6'
            return (
              <g key={node.id} transform={`translate(${curX}, ${curY})`}>
                <circle
                  r={isCenter ? 8 : 4.5}
                  fill={isCenter ? '#DFFF00' : '#080A0E'}
                  stroke={isCenter ? '#2045FF' : '#F2F0E8'}
                  strokeWidth={isCenter ? 2.5 : 1.5}
                />
                {wStratToWeb < 0.6 && (
                  <text
                    x={8}
                    y={-6}
                    fill="#080A0E"
                    fontFamily="var(--mono)"
                    fontSize="9"
                    fontWeight="600"
                    letterSpacing="0.1em"
                    opacity={wStratResolve}
                  >
                    {node.label}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* STAGE 02: WEB DEVELOPMENT (3D Perspective Browser & Living Codebase) */}
      <div
        className="lca-layer lca-layer-web"
        style={{
          opacity: (wStratToWeb > 0.1 && wWebToUI < 0.95) ? Math.min(wStratToWeb, 1 - wWebToUI) : 0,
          transform: `perspective(1200px) rotateY(${-12 + 6 * wWebComplete}deg) rotateX(${6 - 3 * wWebComplete}deg) translate3d(0, 0, 0)`,
        }}
      >
        <div className="lca-browser-stage">
          {/* Halftone eye texture slice in bottom left corner */}
          <div className="lca-halftone-slice" style={{ opacity: 0.65 + 0.35 * wWebComplete }}>
            <img src="/assets/hero/machine-eye-cobalt.webp" alt="" />
          </div>

          {/* Blueprint Torn Paper Badge "02" */}
          <div className="lca-torn-badge">
            <span className="lca-badge-num">02</span>
            <span className="lca-badge-tag">ENGINEERED // VERIFIED</span>
          </div>

          {/* Wireframe Globe Accent */}
          <div className="lca-wireframe-globe">
            <svg viewBox="0 0 120 120" className="w-full h-full">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#2045FF" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
              <ellipse cx="60" cy="60" rx="48" ry="18" fill="none" stroke="#2045FF" strokeWidth="1" />
              <ellipse cx="60" cy="60" rx="18" ry="48" fill="none" stroke="#2045FF" strokeWidth="1" />
            </svg>
          </div>

          {/* Main 3D Browser Window Frame */}
          <div className="lca-browser-window">
            <div className="lca-browser-header">
              <div className="lca-browser-dots">
                <span className="lca-dot" />
                <span className="lca-dot" />
                <span className="lca-dot" />
              </div>
              <span className="lca-browser-title">INSPIRING WAVE // WORK SERVICES STUDIO</span>
              <span className="lca-browser-status">HTTP 200 OK</span>
            </div>

            <div className="lca-browser-body">
              {/* Glowing Waveform Mesh Landscape */}
              <div className="lca-waveform-screen">
                <svg viewBox="0 0 400 200" preserveAspectRatio="none" className="lca-wave-svg">
                  <path
                    d="M 0 140 Q 50 60, 100 120 T 200 80 T 300 110 T 400 60 L 400 200 L 0 200 Z"
                    fill="url(#waveGrad)"
                  />
                  <path
                    d="M 0 140 Q 50 60, 100 120 T 200 80 T 300 110 T 400 60"
                    fill="none"
                    stroke="#DFFF00"
                    strokeWidth="2.5"
                  />
                  <defs>
                    <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2045FF" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#080D17" stopOpacity="0.95" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="lca-screen-cross">+</div>
              </div>

              {/* Floating Code Editor Card */}
              <div className="lca-code-card">
                <div className="lca-code-bar">
                  <span className="lca-code-tab">App.tsx</span>
                </div>
                <pre className="lca-code-body">
                  <code>
                    <span className="lca-c-num">01 </span><span className="lca-c-kw">const </span><span className="lca-c-fn">experience </span>= () =&gt; &#123;{'\n'}
                    <span className="lca-c-num">02 </span>  <span className="lca-c-kw">return </span>({'\n'}
                    <span className="lca-c-num">03 </span>    <span className="lca-c-tag">&lt;WebApp /&gt;</span>{'\n'}
                    <span className="lca-c-num">04 </span>  ){'\n'}
                    <span className="lca-c-num">05 </span>&#125;
                  </code>
                </pre>
              </div>

              {/* Electric Blue Tag Badge */}
              <div className="lca-tag-badge">
                <span>&lt;/&gt;</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STAGE 03: UI/UX DESIGN (Living Design System & Exploded Component Grid) */}
      <div
        className="lca-layer lca-layer-uiux"
        style={{
          opacity: (wWebToUI > 0.05 && wUIToSocial < 0.95) ? Math.min(wWebToUI, 1 - wUIToSocial) : 0,
          transform: `scale(${0.94 + 0.06 * wUIBuild}) translate3d(0, ${(1 - wUIBuild) * 15}px, 0)`,
        }}
      >
        <div className="lca-uiux-stage">
          {/* Selection Outlines & Dimension Badges */}
          <div className="lca-dimension-box lca-dim-primary">
            <span className="lca-dim-label">FRAME // COMPONENT_SET</span>
            <span className="lca-dim-measure">W: 420px  H: 280px</span>

            <div className="lca-component-grid">
              {/* Component 1: Typography Sample */}
              <div className="lca-token-card lca-token-type">
                <span className="lca-token-title">DISPLAY SPECIMEN</span>
                <span className="lca-token-hero">Aa</span>
                <span className="lca-token-meta">Barlow Condensed / 900 Italic</span>
              </div>

              {/* Component 2: Interactive Tactile Switch & Slider */}
              <div className="lca-token-card lca-token-controls">
                <span className="lca-token-title">MICRO-INTERACTIONS</span>
                <div className="lca-switch-wrap">
                  <div className={`lca-switch ${p > 0.48 ? 'is-active' : ''}`}>
                    <div className="lca-switch-handle" />
                  </div>
                  <span className="lca-switch-state">{p > 0.48 ? 'ACTIVE' : 'IDLE'}</span>
                </div>
                <div className="lca-slider-track">
                  <div className="lca-slider-fill" style={{ width: `${Math.min(100, Math.max(20, (p - 0.44) * 500))}%` }} />
                  <div className="lca-slider-thumb" style={{ left: `${Math.min(100, Math.max(20, (p - 0.44) * 500))}%` }} />
                </div>
              </div>

              {/* Component 3: Button States */}
              <div className="lca-token-card lca-token-buttons">
                <button type="button" className="lca-spec-btn lca-spec-btn-solid">
                  PRIMARY ACTION ↗
                </button>
                <button type="button" className="lca-spec-btn lca-spec-btn-outline">
                  SYSTEM TOKENS
                </button>
              </div>

              {/* Component 4: Color Swatches */}
              <div className="lca-token-card lca-token-swatches">
                <div className="lca-swatch lca-sw-blue"><span>#2045FF</span></div>
                <div className="lca-swatch lca-sw-cream"><span>#F2F0E8</span></div>
                <div className="lca-swatch lca-sw-lime"><span>#DFFF00</span></div>
                <div className="lca-swatch lca-sw-dark"><span>#080A0E</span></div>
              </div>
            </div>
          </div>

          {/* Designer Pointer Cursor */}
          <div className="lca-designer-cursor" style={{ transform: `translate3d(${280 + Math.sin(p * 30) * 40}px, ${140 + Math.cos(p * 25) * 25}px, 0)` }}>
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path d="M4 2 L20 10 L12 13 L8 21 Z" fill="#080A0E" stroke="#F2F0E8" strokeWidth="1.5" />
            </svg>
            <span className="lca-cursor-tag">FOCUS_STATE</span>
          </div>
        </div>
      </div>

      {/* STAGE 04: SOCIAL MEDIA (Kinetic Typography Campaign & Halftone Poster Slits) */}
      <div
        className="lca-layer lca-layer-social"
        style={{
          opacity: (wUIToSocial > 0.05 && wSocialToMobile < 0.95) ? Math.min(wUIToSocial, 1 - wSocialToMobile) : 0,
        }}
      >
        <div className="lca-social-stage">
          {/* Halftone Eye peering through angled poster slits */}
          <div className="lca-social-eye-back" style={{ transform: `scale(${1 + 0.15 * wSocialAmplify})` }}>
            <img src="/assets/hero/machine-eye.webp" alt="" />
          </div>

          {/* Angled Kinetic Banners */}
          <div
            className="lca-poster-banner lca-banner-1"
            style={{ transform: `rotate(-4deg) translate3d(${-20 * (1 - wSocialBuild)}px, 0, 0)` }}
          >
            <span>IDEAS</span>
          </div>

          <div
            className="lca-poster-banner lca-banner-2"
            style={{ transform: `rotate(3deg) translate3d(${30 * (1 - wSocialBuild)}px, 0, 0)` }}
          >
            <span>SPREAD</span>
          </div>

          {/* Multiplied Amplification Waves */}
          {wSocialAmplify > 0.05 && (
            <div className="lca-amplify-stack" style={{ opacity: wSocialAmplify }}>
              <div className="lca-amp-line lca-amp-blue">SPREAD</div>
              <div className="lca-amp-line lca-amp-cream">SPREAD</div>
              <div className="lca-amp-line lca-amp-dark">SPREAD</div>
            </div>
          )}
        </div>
      </div>

      {/* STAGE 05: MOBILE APP DEVELOPMENT (Sculptural Smartphone Device UI) */}
      <div
        className="lca-layer lca-layer-mobile"
        style={{
          opacity: (wSocialToMobile > 0.05 && wMobileToSoft < 0.95) ? Math.min(wSocialToMobile, 1 - wMobileToSoft) : 0,
          transform: `scale(${0.92 + 0.08 * wMobileBuild}) perspective(1000px) rotateY(${-8 + 8 * wMobileBuild}deg)`,
        }}
      >
        <div className="lca-phone-device">
          <div className="lca-phone-chassis">
            <div className="lca-phone-island" />
            <div className="lca-phone-screen">
              {/* App Header */}
              <div className="lca-app-header">
                <span className="lca-app-clock">09:41</span>
                <span className="lca-app-pill">5G // LIVE</span>
              </div>

              {/* App Interactive Waveform Visual */}
              <div className="lca-app-hero-art">
                <svg viewBox="0 0 200 120" preserveAspectRatio="none" className="w-full h-full">
                  <path d="M 0 60 Q 50 10, 100 70 T 200 40 L 200 120 L 0 120 Z" fill="#2045FF" />
                  <path d="M 0 60 Q 50 10, 100 70 T 200 40" fill="none" stroke="#DFFF00" strokeWidth="2" />
                </svg>
                <div className="lca-app-play">▶</div>
              </div>

              {/* App Content Card Deck */}
              <div className="lca-app-card-deck">
                <div className="lca-app-card">
                  <span className="lca-ac-badge">FEATURED</span>
                  <h4>Real-time Adaptive Logic</h4>
                </div>
                <div className="lca-app-card lca-card-sec">
                  <span className="lca-ac-badge">LATENCY</span>
                  <h4>Sub-16ms Frametime</h4>
                </div>
              </div>

              {/* Bottom App Tab Navigation */}
              <div className="lca-app-tabs">
                <span className="lca-tab is-active">◉</span>
                <span className="lca-tab">▤</span>
                <span className="lca-tab">▧</span>
                <span className="lca-tab">⚙</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STAGE 06: SOFTWARE DEVELOPMENT (Interconnected Systems & Scalable Architecture) */}
      <div
        className="lca-layer lca-layer-software"
        style={{
          opacity: (wMobileToSoft > 0.05 && wFinal < 0.92) ? Math.min(wMobileToSoft, 1 - wFinal) : 0,
          transform: `scale(${0.94 + 0.06 * wSoftBuild})`,
        }}
      >
        <div className="lca-software-stage">
          <svg viewBox="0 0 600 400" className="lca-soft-svg">
            {/* Connection Bus Lines */}
            <g stroke="#2045FF" strokeWidth="2" strokeDasharray="5 5">
              <line x1="300" y1="200" x2="160" y2="120" />
              <line x1="300" y1="200" x2="440" y2="120" />
              <line x1="300" y1="200" x2="160" y2="280" />
              <line x1="300" y1="200" x2="440" y2="280" />
            </g>
          </svg>

          {/* Central 3D Isometric Core Node */}
          <div className="lca-soft-node lca-core-cube">
            <div className="lca-cube-face lca-cube-top">API GATEWAY</div>
            <div className="lca-cube-face lca-cube-left">CORE ENGINE</div>
            <div className="lca-cube-face lca-cube-right">SCALABLE ARCH</div>
          </div>

          {/* Node 1: Cloud Orchestration */}
          <div className="lca-soft-module lca-mod-cloud">
            <div className="lca-mod-icon">☁</div>
            <div className="lca-mod-text">
              <strong>CLOUD INFRA</strong>
              <small>Multi-Region / Edge</small>
            </div>
          </div>

          {/* Node 2: Database Storage */}
          <div className="lca-soft-module lca-mod-db">
            <div className="lca-mod-icon">⛁</div>
            <div className="lca-mod-text">
              <strong>DISTRIBUTED DB</strong>
              <small>Zero-Loss Replication</small>
            </div>
          </div>

          {/* Node 3: Microservices / Code */}
          <div className="lca-soft-module lca-mod-code">
            <div className="lca-mod-icon">&lt;/&gt;</div>
            <div className="lca-mod-text">
              <strong>MICROSERVICES</strong>
              <small>gRPC / GraphQL</small>
            </div>
          </div>

          {/* Node 4: Terminal Telemetry */}
          <div className="lca-soft-module lca-mod-terminal">
            <div className="lca-mod-icon">$_</div>
            <div className="lca-mod-text">
              <strong>HEALTH: 99.99%</strong>
              <small>42,800 req/sec</small>
            </div>
          </div>
        </div>
      </div>

      {/* STAGE 16: FINAL UNIFIED REVEAL (Six Capabilities in Angled Editorial Fan) */}
      <div
        className="lca-layer lca-layer-final"
        style={{
          opacity: wFinal,
          transform: `scale(${0.9 + 0.1 * wFinal})`,
        }}
      >
        <div className="lca-final-fan">
          <div className="lca-final-card lca-fc-1" style={{ transform: 'rotate(-16deg) translate3d(-180px, 40px, 0)' }}>
            <span className="lca-fc-num">01</span>
            <h4>STRATEGY</h4>
          </div>
          <div className="lca-final-card lca-fc-2" style={{ transform: 'rotate(-8deg) translate3d(-100px, 15px, 0)' }}>
            <span className="lca-fc-num">02</span>
            <h4>WEB</h4>
          </div>
          <div className="lca-final-card lca-fc-3" style={{ transform: 'rotate(-2deg) translate3d(-20px, 0px, 0)' }}>
            <span className="lca-fc-num">03</span>
            <h4>UI/UX</h4>
          </div>
          <div className="lca-final-card lca-fc-4" style={{ transform: 'rotate(5deg) translate3d(60px, 10px, 0)' }}>
            <span className="lca-fc-num">04</span>
            <h4>SOCIAL</h4>
          </div>
          <div className="lca-final-card lca-fc-5" style={{ transform: 'rotate(12deg) translate3d(140px, 30px, 0)' }}>
            <span className="lca-fc-num">05</span>
            <h4>MOBILE</h4>
          </div>
          <div className="lca-final-card lca-fc-6" style={{ transform: 'rotate(18deg) translate3d(220px, 55px, 0)' }}>
            <span className="lca-fc-num">06</span>
            <h4>SOFTWARE</h4>
          </div>

          <div className="lca-final-banner">
            <span className="lca-fb-kicker">SIX DISCIPLINES // ONE ENGINE</span>
            <h3 className="lca-fb-title">SIX DISCIPLINES. ONE CREATIVE FORCE.</h3>
          </div>
        </div>
      </div>
    </div>
  )
}
