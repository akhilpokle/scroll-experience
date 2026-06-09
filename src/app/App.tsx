import { useEffect, useRef } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { StageTransition } from './effects/stageTransition';
import { initSmoothScrolling } from './effects/smoothScroll';
import { StarField, type StarFieldHandle } from './components/StarField';
import Frame2087328479 from '../imports/Frame2087328479/Frame2087328479';
import '../styles/fonts.css';
import '../styles/scroll-effects.css';

const HERO_RADIUS = 220;
const TINY_RADIUS = 1.2;
const COUNTER_FROM = 1;
const COUNTER_TO = 1825;

export default function App() {
  const starsRef = useRef<StarFieldHandle | null>(null);

  useEffect(() => {
    let cancelled = false;
    const raf = requestAnimationFrame(() => {
      if (cancelled) return;
      initSmoothScrolling();

      const stage = document.querySelector('.intro-stage') as HTMLElement | null;
      const step3 = document.querySelector('.stage-step-3') as HTMLElement | null;
      const counter = document.querySelector('.counter') as HTMLElement | null;
      if (!stage || !step3 || !counter) return;

      const step1Roots = Array.from(stage.querySelectorAll('.stage-out p')) as HTMLElement[];
      const step2Roots = Array.from(stage.querySelectorAll('.stage-in .blur-text-line')) as HTMLElement[];

      new StageTransition(stage, step1Roots, step2Roots, {
        step3Element: step3,
        counterElement: counter,
        counterFrom: COUNTER_FROM,
        counterTo: COUNTER_TO,
        heroRadius: HERO_RADIUS,
        tinyRadius: TINY_RADIUS,
        drawStars: (count, radius) => starsRef.current?.draw(count, radius),
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ScrollTrigger.getAll().forEach((t) => t.kill());
      document.querySelectorAll('.char, .word').forEach((el) => {
        const parent = el.parentElement;
        if (parent) parent.replaceChild(document.createTextNode(el.textContent || ''), el);
      });
    };
  }, []);

  return (
    <div className="flex justify-center min-h-screen" style={{ backgroundColor: '#000' }}>
      <div className="scroll-container">
        <section
          className="intro-stage"
          style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden' }}
        >
          {/* Step 1 */}
          <div className="stage-out" style={{ position: 'absolute', inset: 0 }}>
            <Frame2087328479 />
          </div>

          {/* Step 2 */}
          <div
            className="stage-in"
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ textAlign: 'center', lineHeight: '1.2' }}>
              <div className="blur-text-line" style={{ fontSize: '48px', marginBottom: '0.5rem' }}>
                Thank you! for
              </div>
              <div className="blur-text-line" style={{ fontSize: '64px', marginBottom: '0.5rem' }}>
                5 years
              </div>
              <div className="blur-text-line" style={{ fontSize: '48px' }}>
                With DBS
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div
            className="stage-step-3"
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <StarField ref={starsRef} />

            {/* Vignette overlay for edge blur */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(ellipse at center, transparent 30%, rgba(22, 20, 25, 0.4) 70%, rgba(22, 20, 25, 0.9) 100%)',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />

            {/* Text glow layer (blurred background) */}
            <div
              className="counter-glow"
              style={{
                position: 'absolute',
                zIndex: 2,
                fontSize: '56px',
                letterSpacing: '-0.02em',
                textAlign: 'center',
                filter: 'blur(20px)',
                opacity: 0.8,
              }}
            >
              That's{' '}
              <span
                className="counter-glow-value"
                style={{
                  display: 'inline-block',
                  minWidth: '4ch',
                  textAlign: 'right',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                1
              </span>{' '}
              days with us.
            </div>

            {/* Text sharp layer (foreground) */}
            <div
              style={{
                position: 'relative',
                zIndex: 3,
                fontSize: '56px',
                letterSpacing: '-0.02em',
                textAlign: 'center',
              }}
            >
              That's{' '}
              <span
                className="counter"
                style={{
                  display: 'inline-block',
                  minWidth: '4ch',
                  textAlign: 'right',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                1
              </span>{' '}
              days with us.
            </div>
          </div>
        </section>

        {/* Tail spacer so Lenis has room after the pin releases */}
        <div style={{ height: '50vh' }} />
      </div>
    </div>
  );
}
