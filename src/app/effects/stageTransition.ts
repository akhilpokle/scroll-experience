// Multi-step pinned stage. Crossfades step 1 -> 2 -> 3 via blur, then
// scrubs a counter and a star-field draw across the remaining scroll.
// To use in Liferay: Remove type annotations and save as .js file
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextSplitter } from './textSplitter';

gsap.registerPlugin(ScrollTrigger);

export type Step3Hooks = {
  step3Element: HTMLElement;
  counterElement: HTMLElement;
  counterFrom: number;
  counterTo: number;
  heroRadius: number;
  tinyRadius: number;
  drawStars: (count: number, radius: number) => void;
};

export class StageTransition {
  stage: HTMLElement;
  step1Roots: HTMLElement[];
  step2Roots: HTMLElement[];
  step3: Step3Hooks;
  splitters: TextSplitter[] = [];

  constructor(
    stage: HTMLElement,
    step1Roots: HTMLElement[],
    step2Roots: HTMLElement[],
    step3: Step3Hooks
  ) {
    this.stage = stage;
    this.step1Roots = step1Roots;
    this.step2Roots = step2Roots;
    this.step3 = step3;
    this.init();
  }

  private splitAll(roots: HTMLElement[]): HTMLElement[] {
    const chars: HTMLElement[] = [];
    roots.forEach((el) => {
      const s = new TextSplitter(el, { splitTypeTypes: 'words, chars' });
      this.splitters.push(s);
      const c = s.getChars();
      if (c) chars.push(...c);
    });
    return chars;
  }

  init() {
    const chars1 = this.splitAll(this.step1Roots);
    const chars2 = this.splitAll(this.step2Roots);
    const { step3Element, counterElement, counterFrom, counterTo, heroRadius, tinyRadius, drawStars } = this.step3;

    const counterGlowElement = document.querySelector('.counter-glow-value') as HTMLElement | null;

    // Initial state
    gsap.set(chars1, { filter: 'blur(0px) brightness(100%)', willChange: 'filter' });
    gsap.set(chars2, { filter: 'blur(10px) brightness(0%)', willChange: 'filter' });
    gsap.set(step3Element, {
      filter: 'blur(10px) brightness(0%)',
      autoAlpha: 0,
      willChange: 'filter, opacity',
    });

    counterElement.textContent = String(counterFrom);
    if (counterGlowElement) counterGlowElement.textContent = String(counterFrom);
    drawStars(counterFrom, heroRadius);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: this.stage,
        start: 'top top',
        end: '+=500%',
        pin: this.stage,
        pinSpacing: true,
        scrub: true,
      },
    });

    // S1 -> S2
    if (chars1.length) {
      tl.to(
        chars1,
        { ease: 'none', filter: 'blur(10px) brightness(0%)', stagger: 0.04, duration: 1 },
        0.0
      );
    }
    if (chars2.length) {
      tl.to(
        chars2,
        { ease: 'none', filter: 'blur(0px) brightness(100%)', stagger: 0.04, duration: 1 },
        0.5
      );
    }

    // S2 -> S3 (delayed for ~1/2 screen of dead scroll)
    if (chars2.length) {
      tl.to(
        chars2,
        { ease: 'none', filter: 'blur(10px) brightness(0%)', stagger: 0.04, duration: 1 },
        3.8
      );
    }
    tl.to(
      step3Element,
      { ease: 'none', autoAlpha: 1, filter: 'blur(0px) brightness(100%)', duration: 1 },
      4.3
    );

    // Background color transition
    tl.to(
      this.stage,
      { ease: 'none', backgroundColor: '#161419', duration: 2 },
      4.3
    );

    // Counter + stars
    const state = { n: counterFrom };
    tl.to(
      state,
      {
        n: counterTo,
        ease: 'none',
        duration: 6,
        onUpdate: () => {
          const v = Math.max(counterFrom, Math.round(state.n));
          counterElement.textContent = v.toLocaleString();
          if (counterGlowElement) counterGlowElement.textContent = v.toLocaleString();
          const t = (v - counterFrom) / (counterTo - counterFrom);
          const radius = heroRadius + (tinyRadius - heroRadius) * t;
          drawStars(v, radius);
        },
      },
      5.3
    );
  }
}
