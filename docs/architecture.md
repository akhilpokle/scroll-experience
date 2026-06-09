# Architecture

## Project Overview

A scroll-driven anniversary narrative experience for DBS Bank employees. The experience plays out as a cinematic sequence of scenes triggered entirely by scroll position — no timers, no auto-play.

## Two-File Duality

The project ships as **two parallel implementations** that must be kept in sync manually:

| Path | Purpose | Runtime |
|------|---------|---------|
| `src/` | React + TypeScript, Vite dev server | Local dev / Figma Make |
| `vanilla.html` | Single-file vanilla JS + inline CSS | Liferay CMS deployment |

**Rule:** Any change to scroll timing, text content, section structure, or animation logic in one file must be mirrored in the other. There is no shared module between them.

## React Source Structure

```
src/
  main.tsx                        # Entry point
  app/
    App.tsx                       # Root component; wires Lenis + StageTransition
    components/
      StarField.tsx               # Canvas star renderer (imperative handle)
      figma/ImageWithFallback.tsx
      ui/                         # shadcn/ui primitives (largely unused)
    effects/
      smoothScroll.ts             # Lenis init + GSAP ticker sync
      stageTransition.ts          # Multi-step pinned intro timeline
      blurScrollEffect.ts         # Blur-in effect (chars start dark)
      blurOutEffect.ts            # Blur-out effect (chars start visible)
      textSplitter.ts             # SplitType wrapper with ResizeObserver
      common.ts                   # Shared utilities (debounce etc.)
  imports/
    Frame2087328479/              # Figma-exported Stage 1 component
    Group1272628*/                # Figma-exported star sprite SVGs (5 variants + hero)
  styles/
    fonts.css / theme.css / globals.css / scroll-effects.css / tailwind.css
```

## Tech Stack

| Library | Version | Role |
|---------|---------|------|
| React 18 | 18.3.1 | UI rendering |
| Vite | 6.3.5 | Build + dev server |
| GSAP | ^3.15 | All animation + ScrollTrigger |
| @studio-freight/lenis | ^1.0.42 | Smooth scroll inertia |
| split-type | ^0.3.4 | DOM text → per-char spans |
| motion (Framer Motion) | 12.23 | Sections 4–7 animations |
| canvas-confetti | 1.9.4 | Medal reveal confetti |
| Tailwind CSS v4 | 4.1.12 | Utility styles |
| shadcn/ui + Radix UI | various | UI primitives (minimal use) |

## Sections at a Glance

| Section | Element class | Content |
|---------|--------------|---------|
| Intro (S1→S3) | `.intro-stage` | Greeting → "Thank you 5 years" → day counter + stars |
| Section 4 | `.section-4` | Perspective card fly-through + peer testimonials |
| Section 6 | `.section-6` | 3D medal reveal + spin |
| Section 7 | `.section-7` | "Write a letter" prompt |
