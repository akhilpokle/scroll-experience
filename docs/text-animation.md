# Text Animation

## SplitType — How Text Gets Split

File: `src/app/effects/textSplitter.ts`

`TextSplitter` wraps the `split-type` library. It takes an `HTMLElement` and splits its text content into individual `<span>` elements per character (and/or word/line).

```ts
new TextSplitter(el, { splitTypeTypes: 'words, chars' });
splitter.getChars(); // → HTMLElement[] of .char spans
```

GSAP then animates `filter` on each char span individually, enabling the staggered blur effect.

**ResizeObserver:** If a `resizeCallback` is provided, `TextSplitter` re-splits on element width change (debounced 100ms). This is used in `BlurScrollEffect` so line breaks stay correct after viewport resize. It is **not** used in `StageTransition` — the intro stage is fixed full-viewport, so reflow isn't a concern there.

---

## The Blur-Filter Pattern

All text transitions use CSS `filter` rather than `opacity` or `transform`. This gives a "characters materializing from darkness" feel:

```
Start (invisible): filter: blur(10px) brightness(0%)
End   (visible):   filter: blur(0px)  brightness(100%)
```

`willChange: 'filter'` is set on every animated char to promote it to its own compositor layer, preventing repaints on surrounding content.

Stagger value is `0.04` for intro chars, `0.05` for standalone scroll effects — small enough to read as a wave, large enough to feel sequential.

---

## Effect Classes

### `BlurScrollEffect` — chars blur IN on scroll
Used on body text in later sections. Chars start invisible; a ScrollTrigger on the element fires as it enters the viewport.

### `BlurOutEffect` — chars blur OUT on scroll
Used when a section exits. Chars start visible; a pinned ScrollTrigger blurs them away as the user scrolls past.

### `StageTransition` — orchestrates both for the intro
Manages S1→S2→S3 crossfade directly in a single GSAP timeline. Does not use the above two classes.

---

## Critical: Do Not Split the Counter Element

The Stage 3 text is:
```html
<p class="stage-3-text">That's <span class="counter">1</span> day with DBS</p>
```

**Never pass `.stage-3-text` or `.counter` to `TextSplitter`.**

Reason: `counter.textContent` is updated on every scroll frame by the GSAP onUpdate callback. SplitType wraps text in `<span>` nodes at split-time. If the counter span is split, GSAP animates stale char spans while `textContent` keeps mutating the live DOM — the visual counter and the animated spans diverge immediately.

The fix in place: `.stage-3-text` is blurred/unblurred as a **whole element** (no split), only `filter` is animated on it:
```ts
tl.to(stage3Txt, { filter: 'blur(0px) brightness(100%)', duration: 1 }, 4.3);
```

---

## Cleanup After SplitType

On React unmount, char/word spans must be reverted to plain text:
```ts
document.querySelectorAll('.char, .word').forEach((el) => {
  const parent = el.parentElement;
  if (parent) parent.replaceChild(document.createTextNode(el.textContent || ''), el);
});
```
This prevents stale span nodes from persisting across HMR reloads.
