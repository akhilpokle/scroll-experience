// Blur out effect - splits all <p> text in a section and blurs char-by-char on scroll
// To use in Liferay: Remove type annotations and save as .js file
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextSplitter } from './textSplitter';

gsap.registerPlugin(ScrollTrigger);

export class BlurOutEffect {
  sectionElement: HTMLElement;
  splitters: TextSplitter[] = [];

  constructor(sectionElement: HTMLElement) {
    if (!sectionElement || !(sectionElement instanceof HTMLElement)) {
      throw new Error('Invalid section element provided.');
    }
    this.sectionElement = sectionElement;
    this.initializeEffect();
  }

  initializeEffect() {
    const textNodes = this.sectionElement.querySelectorAll('p');
    textNodes.forEach((node) => {
      this.splitters.push(
        new TextSplitter(node as HTMLElement, {
          splitTypeTypes: 'words, chars',
        })
      );
    });
    this.scroll();
  }

  scroll() {
    const chars: HTMLElement[] = [];
    this.splitters.forEach((s) => {
      const c = s.getChars();
      if (c) chars.push(...c);
    });
    if (chars.length === 0) return;

    gsap.fromTo(
      chars,
      {
        filter: 'blur(0px) brightness(100%)',
        willChange: 'filter',
      },
      {
        ease: 'none',
        filter: 'blur(10px) brightness(0%)',
        stagger: 0.05,
        scrollTrigger: {
          trigger: this.sectionElement,
          start: 'top top',
          end: '+=60%',
          pin: this.sectionElement,
          pinSpacing: true,
          scrub: true,
        },
      }
    );
  }
}
