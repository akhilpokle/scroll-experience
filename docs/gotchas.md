# Gotchas — Critical Rules

Things that will silently break the experience if ignored.

---

## 1. Never mix CSS transforms with GSAP-animated elements

GSAP writes `transform` inline on elements it animates. Adding CSS `transform`, `translate`, `left`, or `top` to the same element creates a conflict — GSAP overwrites CSS on each tick, producing jitter or wrong positioning.

**Affected elements:** glare PNG, spark SVG, galaxy layers (`.gal-bg/far/mid/near`), star field canvas, counter text, all stage divs.

**Rule:** Use `gsap.set()` for initial positioning of any element that GSAP will later animate. Never add `transform` or `position offset` in CSS for these elements.

---

## 2. Only one pin per section — never add a second ScrollTrigger to `.intro-stage`

Adding any ScrollTrigger with `pin: true` inside or alongside the existing `.intro-stage` pin will corrupt scroll offset calculations for all subsequent sections.

If you need a new animation inside the intro, add it to the **existing `tl` timeline** in `StageTransition` at the appropriate position. Do not create a new `ScrollTrigger`.

---

## 3. Never SplitType the counter element

`.stage-3-text` contains a live `<span class="counter">` whose `textContent` is updated every scroll frame. Passing this element (or any ancestor of it) to `TextSplitter` will split the counter span into individual char spans. GSAP then animates stale spans while the live counter continues mutating the DOM — the two will immediately diverge visually.

Blur `.stage-3-text` as a **whole element** only.

---

## 4. `initSmoothScrolling()` must run before any ScrollTrigger is created

Lenis intercepts scroll events and feeds corrected positions to GSAP. If any `ScrollTrigger` is instantiated before Lenis is running, it reads native scroll positions — all trigger start/end offsets will be wrong.

In `App.tsx` this is enforced via `requestAnimationFrame`. Do not restructure this initialization order.

---

## 5. The star PRNG seed is intentional — do not change it

`mulberry32(20260513)` in `StarField.tsx` produces the specific validated star layout. Changing the seed or reordering `rand()` calls generates a completely different arrangement.

---

## 6. `TOTAL_STARS`, `COUNTER_TO`, and the milestone duration must stay in sync

These three values all represent the same number (1825 days = 5 years):
- `TOTAL_STARS = 1825` in `StarField.tsx`
- `COUNTER_TO = 1825` in `App.tsx`
- `val: 1825` in `vanilla.html`

If you change the anniversary milestone, update all three. The star field renders exactly `TOTAL_STARS` stars; the counter runs to `COUNTER_TO`; the camera zoom is keyed to `(count - 1) / (TOTAL_STARS - 1)`. A mismatch means the camera hits full zoom before or after the counter finishes.

---

## 7. Galaxy layers use `scale` for zoom — never animate `width`/`height`

Galaxy image layers are sized to `minSize × minSize` (largest viewport dimension) at rest and zoomed via GSAP `scale`. Animating `width` or `height` instead triggers layout + paint on every frame, causing severe jank on large images.

The wrapper elements (`.gal-far-wrap` etc.) use `opacity` for flicker — again to avoid triggering `filter: brightness` repaint on the large underlying image.

---

## 8. Both `src/` and `vanilla.html` must stay in sync

There is no shared code between them. Any change to timeline positions, text content, section structure, or animation logic in one must be manually applied to the other. The vanilla file is the Liferay production target; the `src/` version is used for local dev and Figma Make.
