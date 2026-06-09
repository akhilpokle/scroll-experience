import { defineConfig } from 'vite'

// Serves index.html (vanilla experience) as the root.
// All assets in public/ are available at root-relative paths (e.g. /glare.png).
// GSAP, Lenis, and SplitType are loaded via CDN inside index.html — no npm deps needed at runtime.
export default defineConfig({})
