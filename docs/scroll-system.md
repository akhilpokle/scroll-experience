# Scroll System

## Overview

Smooth scrolling and all animations are driven by **Lenis + GSAP ScrollTrigger** working in lockstep. Getting this wiring wrong causes animations to fire at wrong scroll positions or jitter.

## Lenis + GSAP Ticker Sync

File: `src/app/effects/smoothScroll.ts`

```ts
const lenis = new Lenis({ lerp: 0.2 });      // 20% catch-up per frame
lenis.on('scroll', ScrollTrigger.update);     // keep ST in sync with Lenis
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);                  // prevent GSAP fighting Lenis
```

**Order matters:** `initSmoothScrolling()` must be called **before** any `ScrollTrigger` is created. In `App.tsx` this is enforced by wrapping everything in `requestAnimationFrame`. Do not move Lenis init after `new StageTransition(...)`.

## Scrub Mode

All scroll triggers use `scrub: true` (or `scrub: 1` in vanilla). This means:
- Scroll position **directly drives** animation progress
- Scrolling backward reverses animations
- There is no "play then detach" — the timeline is permanently coupled to scroll

Do not use `scrub: false` on any animation that needs to coordinate with other scroll-driven animations — they will fall out of sync.

## The Single-Pin Rule

**Each section gets exactly one `ScrollTrigger` with `pin: true`.**

GSAP cannot correctly nest pinned elements. The rules are:

1. `.intro-stage` is pinned by `StageTransition` with `end: '+=500%'` (React) / `end: '+=1250%'` (vanilla). All S1/S2/S3 animations join **this single timeline** — they do not create their own ScrollTriggers.
2. `.section-4`, `.section-6`, `.section-7` each have their own independent pinned ScrollTrigger.
3. Never add a `pin: true` ScrollTrigger to a child of an already-pinned element.
4. Never add a second ScrollTrigger to `.intro-stage` — join the existing `tl` timeline instead.

## Pin Spacing

All pins use `pinSpacing: true`. This inserts a spacer div after the pinned element so subsequent sections start below it. Do not remove `pinSpacing` — subsequent sections will overlap the pinned stage.

## Liferay Scroller Override

The vanilla version supports a custom scroll container via `LIFERAY_SCROLLER` (a CSS selector string at the top of the script). When set, it is passed as `scroller` to ScrollTrigger config. The React version assumes `window` as the scroller and does not need this.

## Cleanup

In the React `useEffect` cleanup:
```ts
ScrollTrigger.getAll().forEach((t) => t.kill());
```
This is required on unmount. SplitType char spans are also manually reverted. If you add new ScrollTriggers, ensure they are killed in cleanup or they will leak across HMR reloads.
