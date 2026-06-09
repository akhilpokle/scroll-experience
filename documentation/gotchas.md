# Gotchas — Critical Rules

Things that will silently break the experience if ignored.

---

## 1. Never mix CSS transforms with GSAP-animated elements

GSAP writes `transform` inline on elements it animates. Adding CSS `transform`, `translate`, `left`, or `top` to the same element creates a conflict — GSAP overwrites CSS on each tick, producing jitter or wrong positioning.

**Affected elements:** glare PNG, spark SVG, galaxy layers (`.gal-bg/far/mid/near`), counter text, all stage divs.

**Rule:** Use `gsap.set()` for initial positioning of any element that GSAP will later animate. Never add `transform` or `position offset` in CSS for these elements.

---

## 2. Only one pin per section — never add a second ScrollTrigger to `.intro-stage`

Adding any ScrollTrigger with `pin: true` inside or alongside the existing `.intro-stage` pin will corrupt scroll offset calculations for all subsequent sections.

If you need a new animation inside the intro, add it to the **existing `tl` timeline** in `initScrollExperience()` at the appropriate position. Do not create a new `ScrollTrigger`.

---

## 3. Never SplitType the counter element

`.stage-3-text` contains a live `<span id="day-count">` whose `textContent` is updated every scroll frame. Passing this element (or any ancestor of it) to `SplitType` will split the counter span into individual char spans. GSAP then animates stale spans while the live counter continues mutating the DOM — the two will immediately diverge visually.

Blur `.stage-3-text` as a **whole element** only.

---

## 4. `initSmoothScrolling()` must run before any ScrollTrigger is created

Lenis intercepts scroll events and feeds corrected positions to GSAP. If any `ScrollTrigger` is instantiated before Lenis is running, it reads native scroll positions — all trigger start/end offsets will be wrong.

In `index.html` this is enforced by calling `initSmoothScrolling()` first inside `window.addEventListener('load', ...)`. Do not restructure this initialization order.

---

## 5. The star canvas PRNG seed is intentional — do not change it

`mulberry32(20260513)` in the star canvas draw code produces the specific validated star layout. Changing the seed or reordering `rand()` calls generates a completely different arrangement.

---

## 6. The milestone day count must stay in sync across the timeline

The value `1825` (5 years = 1825 days) appears in several places in `index.html`:
- `counter.val: 1825` — the GSAP tween end value
- The star field draw loop upper bound
- The camera zoom progress calculation `(count - 1) / (TOTAL_STARS - 1)`

If you change the anniversary milestone, find all occurrences of `1825` in `index.html` and update them together. A mismatch means the camera hits full zoom before or after the counter finishes.

---

## 7. Galaxy layers use `scale` for zoom — never animate `width`/`height`

Galaxy image layers are sized to `minSize × minSize` (largest viewport dimension) at rest and zoomed via GSAP `scale`. Animating `width` or `height` instead triggers layout + paint on every frame, causing severe jank on large images.

The wrapper elements (`.gal-far-wrap` etc.) use `opacity` for flicker — again to avoid triggering `filter: brightness` repaint on the large underlying image.

---

## 8. Assets must live in `src/assets/` — not anywhere else

`src/index.html` references all images with root-relative paths (`/glare.png`, `/medal.svg`, etc.). Vite is configured with `root: 'src'` and `publicDir: 'assets'`, so `src/assets/` is served at the root URL. Placing assets anywhere else will 404 in the dev server and be missing from the build.
