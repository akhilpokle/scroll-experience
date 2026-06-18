# Session Handoff

Quick-start context for a fresh Claude session. Read `CLAUDE.md` and `documentation/`
first for architecture and the critical "don't break" rules — this file only covers
the **current state and conventions** that aren't obvious from the code.

_Last updated: 2026-06-18 (commit `173ff11`)._

## Where things stand

All work lands on `main`. **GitHub Pages serves from `main` → `docs/`**, so committing
to `main` *is* the deploy. There is no PR workflow here — commit directly to `main`
and push when the user asks.

- Repo: https://github.com/akhilpokle/scroll-experience
- Single source of truth: `src/index.html` (all HTML + CSS + inline JS).
- `pnpm build` → outputs to `docs/` (Vite, `base: './'`, `root: 'src'`, `publicDir: 'assets'`,
  `emptyOutDir: true`). **Always rebuild `docs/` after editing `src/` and commit both.**
- `pnpm dev` → `vite build --watch` + `vite preview`.

## Build & commit ritual (every change)

1. Edit `src/index.html` (and/or `src/assets/`).
2. `pnpm build` (regenerates `docs/`).
3. Commit **both** `src/index.html` and `docs/index.html` (plus any asset changes).
4. Push to `main` only when the user says so. End commit messages with the
   `Co-Authored-By` trailer.

Note: `base: './'` (relative) is intentional — makes assets resolve both when opening
`docs/index.html` via `file://` and when served from the Pages sub-path.

## Section 4 (testimonial card fly-through) — current data model

The `messages` array in `initSection4()` is **dev placeholder data**. In production the
feed comes from a **per-user backend API** (arbitrary length, arbitrary long/short mix).
**Do not hardcode counts or assume specific data.** Each tuple is:

```js
[ message, "~ Author Name", stampImage, photoFilename | null ]
```

- **Stamp** (3rd) maps from the source JSON's `value` (the DBS value):
  `Relationship-Led → realtionship-led.png`, `Purpose-Driven → purpose-driven.png`,
  `You're Great! → great.png`. `badge` overrides: `RED → red.png`, `Teach Back → teach.png`.
  `null`/none → `card-stamp.png` placeholder. (Note the asset is spelled
  `realtionship-led.png` — matches the file on disk.)
- **Avatar** (4th): a photo filename matched by person (`jesslyn.jpg`, etc.), or `null`
  → renders initials on a black circle. Initials rule (confirmed by user):
  **first letter of first word + first letter of last word** (e.g. "Yuki Shi Ting WONG" → YW).
- Author `"~"` alone renders "Anonymous"; give a real name as `"~ Name"`.

### Card grouping / layout (runtime, data-agnostic — keep it that way)

Cards are classified long vs short by **measured rendered height** (median-based threshold,
no hardcoding), grouped into two lanes (left/right), and dollied toward the camera in waves.

**Invariant (do not regress):** every wave spans **both** lanes — never all cards on one
side — and **no card is ever dropped**. Achieved by:
- N-card centered stack-layout per lane (clamped to viewport).
- A parity guard before wave assembly: a trailing short-pair **splits** across both lanes;
  a trailing single card **folds** into the previous wave's lighter lane.
- Verified two-sided + zero-drop across all 0..8 × 0..8 long/short feeds. If you touch the
  grouping, re-run that kind of synthetic replay before claiming it works.

Other tuning constants: `GAP = 90` (cards tilt ±10°, ~31px corner overhang), `STEP = 1.2`
(depth spacing between waves), `X_BASE = 450` (lane offset).

## Section 7 (postcard "message to future self")

- Postcard: fixed `height: 400px`, **60/40** left/right split, 14px text (`var(--font-quote)`),
  stamp sized by `height: 120px`. No "To" label on the left. Built from `stamp.png`.
- Entrance: title + subtitle blur in first, **then** the postcard fades + slides up
  (`y:40→0`, set via `gsap.set` — never CSS transform on GSAP elements). Initial hidden
  state and tween live in `initSection7()`.
- A galaxy color-dodge overlay (`gal4.jpg`, `.s7-overlay`) sits over the heading text,
  same treatment as `#s12-overlay` / `.medal-text-overlay`.

## Naming

Recipient throughout is **Eddy Jian Huai TAN** (greeting, medal back, postcard address).
There is no "Thank you Tim!" / "Timothy Tan" text anymore — if you see it, it's stale.

## Assets

Live in `src/assets/`, served at root paths (`/glare.jpg`). Referenced files **and**
`PRELOAD_ASSETS` must stay in sync. Glare uses `glare.jpg` (old huge `glare.png` deleted).
The envelope component was removed (replaced by the postcard) — its 4 PNGs are gone.
`card-avatar.png` is unused (every card now gets a photo or initials) but still on disk.

## Verification caveat

The preview tool here is headless/backgrounded — GSAP's rAF tick and the rAF-wrapped boot
sequence don't fire unless the tab is foregrounded. For animation logic, prefer pure-logic
replay (Node) or calling `initSectionN()` directly via `preview_eval`; for the live
fly-through, ask the user to check in their own browser.
