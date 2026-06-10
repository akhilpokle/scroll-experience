# Interactive Scroll Experience

Scroll-driven anniversary narrative experience for DBS Bank. A cinematic sequence of scenes (greeting → thank-you → day counter + galaxy → peer cards → medal → letter prompt) driven entirely by GSAP ScrollTrigger scrubbed to Lenis smooth scroll. No timers, no auto-play.

## Source file

**`src/index.html`** — single-file vanilla JS implementation. This is the sole source of truth. All scroll logic, animations, and markup live here. GSAP, Lenis, and SplitType are loaded via CDN.

Assets are served from **`src/assets/`** at root-relative paths (`/glare.png`, `/medal.svg`, etc.).

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
pnpm dev       # builds to dist/ (watch mode) + serves at localhost:4173
pnpm build     # one-off production build to dist/
```

## Critical Rules

Read [docs/gotchas.md](docs/gotchas.md) before making changes. The five most dangerous:

1. **Never mix CSS transforms with GSAP-animated elements.** Use `gsap.set()` for initial positioning — never CSS `transform`/`translate` on elements GSAP also animates.
2. **One pin per section.** Never add a second `ScrollTrigger` with `pin: true` to `.intro-stage`. New intro animations must join the existing `tl` timeline in `initScrollExperience()`.
3. **Never SplitType the counter.** `.stage-3-text` contains a live-updating counter span. Blur it as a whole element only — splitting it causes GSAP to animate stale DOM nodes.
4. **`initSmoothScrolling()` runs first.** Lenis must be initialized before any ScrollTrigger is created or all scroll offsets will be wrong.
5. **Keep `val: 1825` and the star sprite count in sync.** Both represent the milestone day count. Mismatching them breaks camera zoom timing.

## Coding Guidelines

Behavioral guidelines to reduce common LLM coding mistakes ([source](https://github.com/forrestchang/andrej-karpathy-skills)). Read and follow these before planning or generating any code.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
