# Interactive Scroll Experience

Scroll-driven anniversary narrative experience for DBS Bank. A cinematic sequence of scenes (greeting → thank-you → day counter + galaxy → peer cards → medal → letter prompt) driven entirely by GSAP ScrollTrigger scrubbed to Lenis smooth scroll. No timers, no auto-play.

## Source file

**`index.html`** — single-file vanilla JS implementation. This is the sole source of truth. All scroll logic, animations, and markup live here. GSAP, Lenis, and SplitType are loaded via CDN.

Assets are served from **`public/`** at root-relative paths (`/glare.png`, `/medal.svg`, etc.).

## Documentation

| Doc | What it covers |
|-----|---------------|
| [documentation/architecture.md](documentation/architecture.md) | Project structure, tech stack, section map |
| [documentation/scroll-system.md](documentation/scroll-system.md) | Lenis + GSAP wiring, single-pin rule, scrub mechanics, cleanup |
| [documentation/timeline.md](documentation/timeline.md) | Full timeline coordinate map for every section, editing rules |
| [documentation/text-animation.md](documentation/text-animation.md) | SplitType strategy, blur-filter pattern, counter constraint |
| [documentation/star-field.md](documentation/star-field.md) | Canvas camera-zoom model, PRNG, sprite rasterization, perf notes |
| [documentation/gotchas.md](documentation/gotchas.md) | All critical "don't break" rules in one place |

> `docs/` is reserved for GitHub Pages deployment (serves the live experience). Do not put documentation files there.

## Development

```bash
pnpm install   # installs vite (dev server only — no runtime deps)
pnpm dev       # serves at localhost:5173
```

## Critical Rules

Read [docs/gotchas.md](docs/gotchas.md) before making changes. The five most dangerous:

1. **Never mix CSS transforms with GSAP-animated elements.** Use `gsap.set()` for initial positioning — never CSS `transform`/`translate` on elements GSAP also animates.
2. **One pin per section.** Never add a second `ScrollTrigger` with `pin: true` to `.intro-stage`. New intro animations must join the existing `tl` timeline in `initScrollExperience()`.
3. **Never SplitType the counter.** `.stage-3-text` contains a live-updating counter span. Blur it as a whole element only — splitting it causes GSAP to animate stale DOM nodes.
4. **`initSmoothScrolling()` runs first.** Lenis must be initialized before any ScrollTrigger is created or all scroll offsets will be wrong.
5. **Keep `val: 1825` and the star sprite count in sync.** Both represent the milestone day count. Mismatching them breaks camera zoom timing.
