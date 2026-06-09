# Interactive Scroll Experience

Scroll-driven anniversary narrative experience for DBS Bank. A cinematic sequence of scenes (greeting → thank-you → day counter + galaxy → peer cards → medal → letter prompt) driven entirely by GSAP ScrollTrigger scrubbed to Lenis smooth scroll. No timers, no auto-play.

## Documentation

| Doc | What it covers |
|-----|---------------|
| [docs/architecture.md](docs/architecture.md) | Project structure, two-file duality, tech stack, section map |
| [docs/scroll-system.md](docs/scroll-system.md) | Lenis + GSAP wiring, single-pin rule, scrub mechanics, cleanup |
| [docs/timeline.md](docs/timeline.md) | Full timeline coordinate map for every section, editing rules |
| [docs/text-animation.md](docs/text-animation.md) | SplitType strategy, blur-filter pattern, counter constraint |
| [docs/star-field.md](docs/star-field.md) | Canvas camera-zoom model, PRNG, sprite rasterization, perf notes |
| [docs/gotchas.md](docs/gotchas.md) | All critical "don't break" rules in one place |

## Development

```bash
pnpm install
pnpm dev        # Vite dev server at localhost:5173
```

The React app (`src/`) and `vanilla.html` are two separate implementations. Changes to one must be manually mirrored to the other. `vanilla.html` is the Liferay CMS deployment target.

## Critical Rules

Read [docs/gotchas.md](docs/gotchas.md) before making changes. The five most dangerous:

1. **Never mix CSS transforms with GSAP-animated elements.** Use `gsap.set()` for initial positioning — never CSS `transform`/`translate` on elements GSAP also animates.
2. **One pin per section.** Never add a second `ScrollTrigger` with `pin: true` to `.intro-stage`. New intro animations must join the existing `tl` timeline in `StageTransition`.
3. **Never SplitType the counter.** `.stage-3-text` contains a live-updating counter span. Blur it as a whole element only — splitting it causes GSAP to animate stale DOM nodes.
4. **`initSmoothScrolling()` runs first.** Lenis must be initialized before any ScrollTrigger is created or all scroll offsets will be wrong.
5. **Keep `TOTAL_STARS`, `COUNTER_TO`, and `val: 1825` in sync.** All three represent the milestone day count. Mismatching them breaks camera zoom timing.
