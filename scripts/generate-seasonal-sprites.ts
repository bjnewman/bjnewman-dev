/**
 * Seasonal sprite sheet generator.
 * Reads base overworld assets and produces seasonal variants:
 *   - Trees: fall (orange/red), winter (icy/snowy)
 *   - Buildings: fall (warm tint), winter (snow/icicles)
 *
 * Usage: bun run scripts/generate-seasonal-sprites.ts
 */

import { createCanvas, loadImage, type SKRSContext2D } from '@napi-rs/canvas';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dir, '../public/assets/overworld');

// ============================================================================
// Color utilities
// ============================================================================

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h * 360, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

/** Seeded pseudo-random for deterministic output */
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(42);

// ============================================================================
// Image I/O helpers
// ============================================================================

async function loadAsCanvas(filePath: string) {
  const img = await loadImage(filePath);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  return { canvas, ctx, width: img.width, height: img.height };
}

async function saveCanvas(canvas: ReturnType<typeof createCanvas>, outPath: string) {
  await mkdir(path.dirname(outPath), { recursive: true });
  const buffer = canvas.toBuffer('image/png');
  await writeFile(outPath, buffer);
  console.log(`  wrote ${path.relative(ROOT, outPath)}`);
}


// ============================================================================
// Tree transforms
// ============================================================================

function transformTreeFall(ctx: SKRSContext2D, width: number, height: number) {
  const data = ctx.getImageData(0, 0, width, height);
  const px = data.data;
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] < 20) continue;
    const [h, s, l] = rgbToHsl(px[i], px[i + 1], px[i + 2]);
    // Target green foliage (hue 60-180)
    if (h >= 60 && h <= 180 && s > 0.15) {
      // Shift to autumn range (0-50) with per-pixel variation
      const newH = rng() * 50;
      const newS = Math.min(1, s + 0.1);
      const [r, g, b] = hslToRgb(newH, newS, l);
      px[i] = r; px[i + 1] = g; px[i + 2] = b;
    }
  }
  ctx.putImageData(data, 0, 0);
}

function transformTreeWinter(ctx: SKRSContext2D, width: number, height: number) {
  const data = ctx.getImageData(0, 0, width, height);
  const px = data.data;

  // Pass 1: Desaturate and lighten green pixels
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] < 20) continue;
    const [h, s, l] = rgbToHsl(px[i], px[i + 1], px[i + 2]);
    if (h >= 60 && h <= 180 && s > 0.15) {
      const newS = s * 0.15;
      const newL = Math.min(0.95, l + 0.25);
      const newH = 200 + rng() * 20; // slight blue-icy tint
      const [r, g, b] = hslToRgb(newH, newS, newL);
      px[i] = r; px[i + 1] = g; px[i + 2] = b;
    }
  }
  ctx.putImageData(data, 0, 0);

  // Pass 2: Snow on top edges — for each column, find topmost opaque pixel and add snow
  const data2 = ctx.getImageData(0, 0, width, height);
  const px2 = data2.data;
  for (let x = 0; x < width; x++) {
    let topY = -1;
    for (let y = 0; y < height; y++) {
      const idx = (y * width + x) * 4;
      if (px2[idx + 3] > 20) { topY = y; break; }
    }
    if (topY < 0) continue;
    // Add 2-4 pixels of white snow
    const snowDepth = 2 + Math.floor(rng() * 3);
    for (let dy = 0; dy < snowDepth && topY + dy < height; dy++) {
      const idx = ((topY + dy) * width + x) * 4;
      if (px2[idx + 3] > 20) {
        const bright = 230 + Math.floor(rng() * 25);
        px2[idx] = bright;
        px2[idx + 1] = bright;
        px2[idx + 2] = Math.min(255, bright + 10); // slight blue
        px2[idx + 3] = 255;
      }
    }
  }
  ctx.putImageData(data2, 0, 0);
}

// ============================================================================
// Building transforms
// ============================================================================

function transformBuildingFall(ctx: SKRSContext2D, width: number, height: number) {
  const data = ctx.getImageData(0, 0, width, height);
  const px = data.data;
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] < 20) continue;
    const [h, s, l] = rgbToHsl(px[i], px[i + 1], px[i + 2]);
    // Warm shift: nudge hue toward amber, boost saturation slightly
    const newH = h > 180 ? h - 10 : h + 8;
    const newS = Math.min(1, s + 0.05);
    const newL = Math.min(1, l + 0.02);
    const [r, g, b] = hslToRgb(newH, newS, newL);
    px[i] = r; px[i + 1] = g; px[i + 2] = b;
  }
  ctx.putImageData(data, 0, 0);
}

function transformBuildingWinter(ctx: SKRSContext2D, width: number, height: number) {
  const data = ctx.getImageData(0, 0, width, height);
  const px = data.data;

  // Pass 1: Slight blue/cold tint
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] < 20) continue;
    const y = Math.floor((i / 4) / width);
    // Top half gets stronger cold tint (roof area)
    const roofFactor = y < height * 0.4 ? 0.08 : 0.03;
    px[i] = Math.max(0, Math.round(px[i] * (1 - roofFactor)));
    px[i + 1] = Math.max(0, Math.round(px[i + 1] * (1 - roofFactor * 0.5)));
    px[i + 2] = Math.min(255, Math.round(px[i + 2] * (1 + roofFactor)));
  }

  // Pass 2: Snow on top edges
  for (let x = 0; x < width; x++) {
    let topY = -1;
    for (let y = 0; y < height; y++) {
      const idx = (y * width + x) * 4;
      if (px[idx + 3] > 20) { topY = y; break; }
    }
    if (topY < 0) continue;
    const snowDepth = 3 + Math.floor(rng() * 4);
    for (let dy = 0; dy < snowDepth && topY + dy < height; dy++) {
      const idx = ((topY + dy) * width + x) * 4;
      if (px[idx + 3] > 20) {
        const bright = 225 + Math.floor(rng() * 30);
        px[idx] = bright;
        px[idx + 1] = bright;
        px[idx + 2] = Math.min(255, bright + 8);
        px[idx + 3] = 255;
      }
    }
  }

  // Pass 3: Icicles — scan for horizontal edges and hang icicles down
  // Find horizontal edge transitions: opaque above, transparent below
  for (let x = 2; x < width - 2; x++) {
    for (let y = 1; y < height - 8; y++) {
      const above = (y * width + x) * 4;
      const below = ((y + 1) * width + x) * 4;
      if (px[above + 3] > 20 && px[below + 3] < 20) {
        // This is a bottom edge — maybe hang an icicle
        if (rng() < 0.12) {
          const icicleLen = 3 + Math.floor(rng() * 6);
          for (let dy = 1; dy <= icicleLen && y + dy < height; dy++) {
            const idx = ((y + dy) * width + x) * 4;
            if (px[idx + 3] > 20) break; // hit another sprite part
            const fade = 1 - dy / (icicleLen + 1);
            px[idx] = 200 + Math.floor(rng() * 40);
            px[idx + 1] = 210 + Math.floor(rng() * 30);
            px[idx + 2] = 240 + Math.floor(rng() * 15);
            px[idx + 3] = Math.round(200 * fade);
          }
        }
      }
    }
  }

  ctx.putImageData(data, 0, 0);
}

// ============================================================================
// Main
// ============================================================================

type Season = 'fall' | 'winter';
const SEASONS: Season[] = ['fall', 'winter'];

async function processTree(name: string) {
  console.log(`\nProcessing ${name}...`);
  const src = path.join(ROOT, `decorations/${name}.png`);

  for (const season of SEASONS) {
    const { ctx, canvas, width, height } = await loadAsCanvas(src);
    if (season === 'fall') transformTreeFall(ctx, width, height);
    else if (season === 'winter') transformTreeWinter(ctx, width, height);
    await saveCanvas(canvas, path.join(ROOT, `decorations/${name}-${season}.png`));
  }
}

async function processBuilding(spriteAsset: string) {
  const name = path.basename(spriteAsset, '.png');
  console.log(`\nProcessing building ${name}...`);
  const src = path.join(ROOT, spriteAsset);

  for (const season of SEASONS) {
    const { ctx, canvas, width, height } = await loadAsCanvas(src);
    if (season === 'fall') transformBuildingFall(ctx, width, height);
    else if (season === 'winter') transformBuildingWinter(ctx, width, height);
    await saveCanvas(canvas, path.join(ROOT, `${spriteAsset.replace('.png', '')}-${season}.png`));
  }
}

// Building sprite assets (from mapData.ts)
const BUILDING_ASSETS = [
  'buildings/monastery.png',
  'buildings/barracks.png',
  'buildings/yellow-castle.png',
  'buildings/castle.png',
  'buildings/tower.png',
  'buildings/house3.png',
  'buildings/fairy-treehouse.png',
];

async function main() {
  console.log('Generating seasonal sprite variants...\n');

  // Trees
  await processTree('tree1');
  await processTree('tree2');

  // Buildings
  for (const asset of BUILDING_ASSETS) {
    await processBuilding(asset);
  }

  console.log('\nDone! Generated all seasonal sprite variants.');
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
