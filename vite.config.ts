import { defineConfig } from 'vite'

// src/ is the Vite root — index.html and assets/ live there.
// assets/ is served at the root URL so /glare.png etc. resolve correctly.
// Build outputs to docs/ which doubles as the GitHub Pages deployment folder.
// pnpm dev: vite build --watch (rebuilds docs/) + vite preview (localhost:4173)
// pnpm build: one-off production build to docs/
export default defineConfig({
  root: 'src',
  publicDir: 'assets',
  build: {
    outDir: '../docs',
    emptyOutDir: true,
  },
})
