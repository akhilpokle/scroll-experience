# Architecture

## Project Overview

A scroll-driven anniversary narrative experience for DBS Bank employees. The experience plays out as a cinematic sequence of scenes triggered entirely by scroll position — no timers, no auto-play.

## Source File

**`index.html`** is the single source of truth. It contains all markup, inline CSS, and inline JavaScript in one file. There is no build step for the runtime — GSAP, Lenis, and SplitType are loaded via CDN:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.20/dist/lenis.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/split-type@0.3.4/umd/index.min.js"></script>
```

Vite is used only as a local dev server (to serve `public/` assets at root-relative paths). There is no bundling or transpilation.

## File Structure

```
index.html          # All markup + CSS + JS — the entire experience
public/             # Static assets served at root URL by Vite
  BG_galaxy.png     # Galaxy background layer
  Far.png           # Galaxy far star layer
  Mid.png           # Galaxy mid star layer
  Near.png          # Galaxy near star layer
  gal3.jpg          # Galaxy texture (S1/S2 overlay)
  gal4.jpg          # Galaxy texture (medal section)
  glare.png         # Glare highlight PNG
  medal.svg         # Medal front face
  medal-edge.svg    # Medal edge/side face
  back.png          # Medal back face
  shimmer.png       # Shimmer mask for cards
  card-avatar.png   # Peer card avatar placeholder
  card-stamp.png    # Peer card stamp graphic
  card-texture.svg  # Peer card holographic texture
  card-sparks-mask.svg  # Card sparks effect mask
  1–4.png           # Peer avatar images
docs/               # Implementation reference documentation
guidelines/         # Design guidelines
CLAUDE.md           # Project orchestrator for Claude sessions
```

## Tech Stack

| Library | Version | How loaded |
|---------|---------|-----------|
| GSAP + ScrollTrigger | 3.12.5 | CDN (cdnjs) |
| Lenis | 1.1.20 | CDN (jsdelivr) |
| SplitType | 0.3.4 | CDN (jsdelivr) |
| Vite | 6.3.5 | npm devDependency (dev server only) |

## Sections at a Glance

| Section | Element class | Content |
|---------|--------------|---------|
| Intro (S1→S3) | `.intro-stage` | Greeting → "Thank you 5 years" → day counter + galaxy |
| Section 4 | `.section-4` | Perspective card fly-through + peer testimonials |
| Section 6 | `.section-6` | 3D medal reveal + spin |
| Section 7 | `.section-7` | "Write a letter" prompt |

## Liferay Deployment

The `index.html` file is the direct Liferay CMS deployment target. Set the `LIFERAY_SCROLLER` constant at the top of the script block to the CSS selector of Liferay's scroll container if needed:

```js
const LIFERAY_SCROLLER = ''; // e.g. '.page-wrapper' — leave empty for window scroll
```
