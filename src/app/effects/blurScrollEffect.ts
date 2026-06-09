// Import the TextSplitter class for handling text splitting.
// To use in Liferay: Remove type annotations and save as .js file
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextSplitter } from './textSplitter';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Defines a class to create scroll-triggered animation effects on text.
export class BlurScrollEffect {
  textElement: HTMLElement;
  splitter: TextSplitter;

  constructor(textElement: HTMLElement) {
    // Check if the provided element is valid.
    if (!textElement || !(textElement instanceof HTMLElement)) {
      throw new Error('Invalid text element provided.');
    }

    this.textElement = textElement;

    // Set up the effect for the provided text element.
    this.initializeEffect();
  }

  // Sets up the initial text effect on the provided element.
  initializeEffect() {
    // Callback to re-trigger animations on resize.
    const textResizeCallback = () => this.scroll();

    // Split text for animation and store the reference.
    this.splitter = new TextSplitter(this.textElement, {
      resizeCallback: textResizeCallback,
      splitTypeTypes: 'words, chars'
    });

    // Trigger the initial scroll effect.
    this.scroll();
  }

  // Animates text based on the scroll position.
  scroll() {
    if (!this.textElement.isConnected) return;
    const chars = this.splitter.getChars();
    if (!chars || chars.length === 0) return;
    const pinned = this.textElement.classList.contains('blur-text-pinned');
    const section = this.textElement.closest('section');

    const trigger = pinned && section
      ? {
          trigger: section,
          start: 'top top',
          end: '+=60%',
          pin: section,
          pinSpacing: true,
          scrub: true,
        }
      : {
          trigger: this.textElement,
          start: 'top bottom-=15%',
          end: 'bottom center+=15%',
          scrub: true,
        };

    gsap.fromTo(chars, {
      filter: 'blur(10px) brightness(0%)',
      willChange: 'filter'
    }, {
        ease: 'none',
        filter: 'blur(0px) brightness(100%)',
        stagger: 0.05,
        scrollTrigger: trigger,
    });
  }
}
