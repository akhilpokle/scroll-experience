// Import debounce utility function.
// To use in Liferay: Remove type annotations and save as .js file
import SplitType from 'split-type';
import { debounce } from './common';

// Defines a class to split text into lines, words and characters for animation.
export class TextSplitter {
  textElement: HTMLElement;
  onResize: (() => void) | null;
  splitText: any;
  previousContainerWidth: number | null;

  // Constructor for TextScrollEffect which sets up the text animation.
  // Parameters:
  //   textElement: HTMLElement - The DOM element that contains the text to be animated.
  //   options: Object (optional) - Configuration options for the text splitting and callbacks.
  //     options.resizeCallback: Function - A function to call on window resize events.
  //     options.splitTypeTypes: String - Specifies the types of splits to perform on the text.
  //         Possible values are based on SplitType's configuration, such as 'lines', 'words', 'chars'.
  //         See SplitType documentation for more details: https://github.com/lukePeavey/SplitType
  constructor(textElement: HTMLElement, options: any = {}) {
    // Ensure the textElement is a valid HTMLElement.
    if (!textElement || !(textElement instanceof HTMLElement)) {
      throw new Error('Invalid text element provided.');
    }

    const { resizeCallback, splitTypeTypes } = options;

    this.textElement = textElement;
    // Assign the resize callback if provided and is a function, otherwise null.
    this.onResize = typeof resizeCallback === 'function' ? resizeCallback : null;

    // Set options for SplitType based on provided splitTypeTypes or default to SplitType's default behavior.
    const splitOptions = splitTypeTypes ? { types: splitTypeTypes } : {};
    this.splitText = new SplitType(this.textElement, splitOptions);

    // Initialize ResizeObserver to re-split text on resize events, if a resize callback is provided.
    if (this.onResize) {
      this.initResizeObserver();
    }

    this.previousContainerWidth = null;
  }

  // Sets up ResizeObserver to re-split text on element resize.
  initResizeObserver() {
    this.previousContainerWidth = null;

    let resizeObserver = new ResizeObserver(
      debounce((entries: any) => this.handleResize(entries), 100)
    );
    resizeObserver.observe(this.textElement);
  }

  // Handles element resize, re-splitting text if width changes.
  handleResize(entries: any) {
    const [{ contentRect }] = entries;
    const width = Math.floor(contentRect.width);
    // If element width changed, re-split text and call resize callback.
    if ( this.previousContainerWidth && this.previousContainerWidth !== width ) {
      this.splitText.split();
      if (this.onResize) {
        this.onResize();
      }
    }
    this.previousContainerWidth = width;
  }

  // Returns the lines created by splitting the text element.
  getLines() {
    return this.splitText.lines;
  }

  // Returns the words created by splitting the text element.
  getWords() {
    return this.splitText.words;
  }

  // Returns the chars created by splitting the text element.
  getChars() {
    return this.splitText.chars;
  }
}
