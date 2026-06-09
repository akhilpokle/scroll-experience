import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import Group1272628258 from '../../imports/Group1272628258/Group1272628258';
import Group1272628259 from '../../imports/Group1272628259/Group1272628259';
import Group1272628262 from '../../imports/Group1272628262/Group1272628262';
import Group1272628263 from '../../imports/Group1272628263/Group1272628263';
import Group1272628261 from '../../imports/Group1272628261/Group1272628261';
import { createRoot } from 'react-dom/client';

export type StarFieldHandle = {
  draw: (count: number, baseRadius: number) => void;
};

const TOTAL_STARS = 1825;
const SPRITE_SIZE = 256;
const HERO_SIZE = 1024;

// World-space camera-zoom model.
// Field stars live in a fixed annulus around the origin.
// As scroll progresses, camera distance D increases — every star's
// apparent position contracts toward centre and apparent size shrinks.
const R_MIN = 0.1;            // inner edge of star annulus (world units)
const R_MAX = 1.4;            // outer edge
const D_MIN = 0.05;           // close: nothing in view but the hero
const D_MAX = R_MAX;          // far: outermost stars just entered view
const D_EXP = 2;              // >1 => slow start, woosh at end
const WORLD_SIZE_MIN = 8;     // intrinsic star size in world units (px @ D=1)
const WORLD_SIZE_MAX = 28;

type StarData = {
  wx: number;
  wy: number;
  variant: number;
  worldSize: number;
  r: number; // distance from origin — used to sort for early-exit cull
};

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function svgToBitmap(Component: React.ComponentType, size: number): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '200px';
    container.style.height = '200px';
    document.body.appendChild(container);

    const root = createRoot(container);
    root.render(<Component />);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const svg = container.querySelector('svg');
        if (!svg) {
          reject(new Error('SVG not found'));
          return;
        }

        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.onload = () => {
          const off = document.createElement('canvas');
          off.width = size;
          off.height = size;
          const octx = off.getContext('2d');
          if (octx) octx.drawImage(img, 0, 0, size, size);
          URL.revokeObjectURL(url);
          root.unmount();
          document.body.removeChild(container);
          resolve(off);
        };
        img.onerror = reject;
        img.src = url;
      });
    });
  });
}

export const StarField = forwardRef<StarFieldHandle>((_props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const positionsRef = useRef<StarData[]>([]);
  const dprRef = useRef(1);
  const lastDrawRef = useRef<{ count: number; radius: number }>({ count: 1, radius: 220 });
  const [sprites, setSprites] = useState<{ small: HTMLCanvasElement[]; hero: HTMLCanvasElement } | null>(null);

  useEffect(() => {
    Promise.all([
      svgToBitmap(Group1272628258, SPRITE_SIZE),
      svgToBitmap(Group1272628259, SPRITE_SIZE),
      svgToBitmap(Group1272628262, SPRITE_SIZE),
      svgToBitmap(Group1272628263, SPRITE_SIZE),
      svgToBitmap(Group1272628261, SPRITE_SIZE),
      svgToBitmap(Group1272628258, HERO_SIZE),
    ]).then(([s0, s1, s2, s3, s4, hero]) => {
      setSprites({ small: [s0, s1, s2, s3, s4], hero });
    });

    dprRef.current = Math.min(window.devicePixelRatio || 1, 1.5);
    const rand = mulberry32(20260513);

    // Distribute uniformly in the annulus [R_MIN, R_MAX].
    // Sample r from sqrt(uniform) to get area-uniform distribution.
    const stars: StarData[] = new Array(TOTAL_STARS).fill(0).map(() => {
      const u = rand();
      const r = Math.sqrt(R_MIN * R_MIN + u * (R_MAX * R_MAX - R_MIN * R_MIN));
      const theta = rand() * Math.PI * 2;
      return {
        wx: r * Math.cos(theta),
        wy: r * Math.sin(theta),
        r,
        variant: Math.floor(rand() * 5),
        worldSize: WORLD_SIZE_MIN + rand() * (WORLD_SIZE_MAX - WORLD_SIZE_MIN),
      };
    });
    // Sort by radius so we can early-exit the draw loop:
    // a star at radius r is on-screen only when D >= r.
    stars.sort((a, b) => a.r - b.r);
    positionsRef.current = stars;

    const onResize = () => {
      resize();
      const { count, radius } = lastDrawRef.current;
      drawInternal(count, radius);
    };
    window.addEventListener('resize', onResize);
    resize();
    drawInternal(1, 220);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  function resize() {
    const c = canvasRef.current;
    if (!c) return;
    const rect = c.getBoundingClientRect();
    c.width = Math.floor(rect.width * dprRef.current);
    c.height = Math.floor(rect.height * dprRef.current);
  }

  function drawInternal(count: number, baseRadius: number) {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    if (!sprites) return;

    lastDrawRef.current = { count, radius: baseRadius };
    const w = c.width;
    const h = c.height;
    const dpr = dprRef.current;

    ctx.clearRect(0, 0, w, h);

    // Hero — single sprite at centre, scales with baseRadius (driven by scroll).
    const heroSize = baseRadius * 2 * dpr;
    ctx.drawImage(sprites.hero, w / 2 - heroSize / 2, h / 2 - heroSize / 2, heroSize, heroSize);

    // Camera distance from scroll progress, eased so distance grows slowly
    // at first then accelerates ("slow start, woosh at end").
    const progress = Math.max(0, Math.min(1, (count - 1) / (TOTAL_STARS - 1)));
    const eased = Math.pow(progress, D_EXP);
    const D = D_MIN * Math.pow(D_MAX / D_MIN, eased);

    const cx = w / 2;
    const cy = h / 2;
    const focal = Math.max(w, h) / 2; // world unit = half the longest screen dim

    const positions = positionsRef.current;
    const invD = 1 / D;

    // Sorted by r ascending. A star is potentially on-screen when D >= its r;
    // beyond that everything is too far out — break.
    for (let i = 0; i < TOTAL_STARS; i++) {
      const p = positions[i];
      if (p.r > D) break;

      const sx = cx + p.wx * focal * invD;
      const sy = cy + p.wy * focal * invD;
      const size = p.worldSize * dpr * invD;

      if (size < 0.4) continue;
      if (sx + size < 0 || sx - size > w) continue;
      if (sy + size < 0 || sy - size > h) continue;

      ctx.drawImage(
        sprites.small[p.variant],
        sx - size / 2,
        sy - size / 2,
        size,
        size,
      );
    }
  }

  useEffect(() => {
    if (sprites) {
      const { count, radius } = lastDrawRef.current;
      drawInternal(count, radius);
    }
  }, [sprites]);

  useImperativeHandle(ref, () => ({ draw: drawInternal }), [sprites]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
      }}
    />
  );
});
StarField.displayName = 'StarField';
