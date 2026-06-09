# Star Field

File: `src/app/components/StarField.tsx`

## Overview

The star field is a `<canvas>` element that renders up to 1,825 star sprites using a world-space camera-zoom model. It is driven imperatively via a `ref` handle — the parent (`StageTransition`) calls `draw(count, radius)` on every GSAP onUpdate tick.

```ts
export type StarFieldHandle = { draw: (count: number, baseRadius: number) => void };
```

---

## Camera-Zoom Model

Stars live in world space as a fixed annular ring around the origin. A virtual camera at distance `D` projects them onto the screen. As scroll progresses, `D` grows — stars appear to contract toward the centre and shrink.

Key constants:
```ts
R_MIN = 0.1   // inner edge of the star annulus (world units)
R_MAX = 1.4   // outer edge
D_MIN = 0.05  // camera starts very close (only hero visible)
D_MAX = R_MAX // camera pulls back to reveal outermost stars
D_EXP = 2     // easing exponent: slow start, accelerating pullback
```

Camera distance from scroll progress:
```ts
const progress = (count - 1) / (TOTAL_STARS - 1); // 0 → 1
const eased   = Math.pow(progress, D_EXP);
const D       = D_MIN * Math.pow(D_MAX / D_MIN, eased); // exponential ramp
```

Screen projection (perspective divide):
```ts
sx   = cx + wx * focal * (1/D)   // x on screen
sy   = cy + wy * focal * (1/D)   // y on screen
size = worldSize * dpr * (1/D)   // apparent size shrinks with distance
```

---

## PRNG — Do Not Change the Seed

Star positions are generated with **Mulberry32** seeded at `20260513`:
```ts
const rand = mulberry32(20260513);
```

The seed is fixed so the star layout is **deterministic and reproducible**. Changing the seed, or changing the order of `rand()` calls, produces a completely different layout. This is intentional — the specific arrangement was validated visually.

Star distribution uses `r = sqrt(uniform)` sampling to achieve uniform area density (otherwise stars would cluster at the centre).

Stars are sorted by `r` ascending so the draw loop can early-exit: a star only enters view when `D >= star.r`, so stars beyond the current camera distance are never drawn.

---

## Sprites

Stars are not circles — each is one of 5 SVG variants (Figma-exported) plus one larger "hero" sprite at the centre.

Source SVGs: `src/imports/Group1272628258–63/` (5 small variants) and one reused as the hero at 1024px.

**Rasterization pipeline:** At mount time, each SVG React component is:
1. Rendered off-screen into a detached DOM node via `createRoot`
2. Serialized with `XMLSerializer`
3. Blob URL'd and loaded into an `<img>`
4. Blitted to an `HTMLCanvasElement` (256px for small, 1024px for hero)

This pre-bakes all sprites as bitmaps so per-frame drawing is just `ctx.drawImage()` — no SVG parsing overhead.

**Sprites are async.** The `sprites` state starts `null`. `drawInternal` returns early if sprites aren't loaded yet. The `useImperativeHandle` also depends on `sprites` — the parent calling `draw()` before sprites load is a no-op (safe).

---

## Hero Star

A single large sprite is drawn at the canvas centre, size controlled by `baseRadius` (passed from the scroll timeline):
```ts
const heroSize = baseRadius * 2 * dpr;
ctx.drawImage(sprites.hero, w/2 - heroSize/2, h/2 - heroSize/2, heroSize, heroSize);
```

`baseRadius` travels from `HERO_RADIUS = 220` down to `TINY_RADIUS = 1.2` as the counter counts from 1 to 1825 — the hero star shrinks to a point as the galaxy expands.

---

## Performance Notes

- Canvas is sized at `devicePixelRatio` (capped at 1.5) for sharpness without excess fill cost.
- The draw loop skips stars with apparent `size < 0.4px` and skips those outside canvas bounds (simple AABB check).
- `TOTAL_STARS = 1825` matches `COUNTER_TO` in `App.tsx`. If you change the milestone duration, update **both**.
