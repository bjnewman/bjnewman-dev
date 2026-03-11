/**
 * Records a demo video of the overworld cycling through seasons.
 * Takes screenshots at ~15fps and compiles with ffmpeg.
 *
 * Usage: bun run scripts/record-demo.ts
 * Requires: ffmpeg, Chrome
 */

import puppeteer from 'puppeteer-core';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import path from 'node:path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SITE_URL = 'https://bjnewman.dev';
const OUTPUT_PATH = path.resolve(import.meta.dir, '../demo.mp4');
const FRAMES_DIR = path.resolve(import.meta.dir, '../.demo-frames');

const VIEWPORT = { width: 1024, height: 768 };
const FPS = 15;
const FRAME_INTERVAL = 1000 / FPS;

// Season sequence with hold times
const SEASON_SEQUENCE: Array<{ season: string; holdMs: number }> = [
  { season: 'summer', holdMs: 5000 },
  { season: 'fall', holdMs: 5000 },
  { season: 'winter', holdMs: 5000 },
  { season: 'spring', holdMs: 5000 },
];

async function openSettingsPanel(page: any) {
  const isOpen = await page.evaluate(() => !!document.querySelector('.ow-settings__overlay'));
  if (!isOpen) {
    await page.evaluate(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'k', metaKey: true, bubbles: true,
      }));
    });
    await new Promise((r) => setTimeout(r, 400));
  }
}

async function closeSettingsPanel(page: any) {
  await page.evaluate(() => {
    const overlay = document.querySelector('.ow-settings__overlay');
    if (overlay) (overlay as HTMLElement).click();
  });
  await new Promise((r) => setTimeout(r, 400));
}

async function setSeason(page: any, season: string) {
  await openSettingsPanel(page);
  await page.evaluate((s: string) => {
    const map: Record<string, string> = {
      spring: 'Spring', summer: 'Summer', fall: 'Fall', winter: 'Winter',
    };
    for (const btn of document.querySelectorAll('.ow-settings__season-btn')) {
      if (btn.textContent?.trim() === map[s]) {
        (btn as HTMLButtonElement).click();
        break;
      }
    }
  }, season);
  await new Promise((r) => setTimeout(r, 200));
  await closeSettingsPanel(page);
}

async function setTimeOfDay(page: any, progress: number) {
  await openSettingsPanel(page);
  await page.evaluate((p: number) => {
    const slider = document.querySelector('#ow-day-progress') as HTMLInputElement;
    if (slider) {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      setter?.call(slider, String(p));
      slider.dispatchEvent(new Event('input', { bubbles: true }));
      slider.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, progress);
  await new Promise((r) => setTimeout(r, 200));
  await closeSettingsPanel(page);
}

/** Capture frames for a duration at target FPS */
async function captureFrames(page: any, durationMs: number, frameOffset: number): Promise<number> {
  const numFrames = Math.ceil(durationMs / FRAME_INTERVAL);
  for (let i = 0; i < numFrames; i++) {
    const frameNum = frameOffset + i;
    const framePath = path.join(FRAMES_DIR, `frame-${String(frameNum).padStart(6, '0')}.png`);
    await page.screenshot({ path: framePath, type: 'png' });
    // Wait remainder of frame interval (minus screenshot time)
    const elapsed = performance.now();
    await new Promise((r) => setTimeout(r, Math.max(0, FRAME_INTERVAL - 10)));
  }
  return frameOffset + numFrames;
}

async function main() {
  // Clean up old frames
  await rm(FRAMES_DIR, { recursive: true, force: true });
  await mkdir(FRAMES_DIR, { recursive: true });

  console.log('Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: false,
    args: [
      `--window-size=${VIEWPORT.width},${VIEWPORT.height}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-webgl',
      '--use-gl=angle',
      '--use-angle=metal',
      '--ignore-gpu-blocklist',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  console.log('Navigating to overworld...');
  await page.goto(SITE_URL, { waitUntil: 'networkidle0', timeout: 30000 });

  // Dismiss welcome modal
  try {
    await page.waitForSelector('.welcome-modal__btn--play', { timeout: 10000 });
    await page.click('.welcome-modal__btn--play');
    console.log('Dismissed welcome modal');
  } catch {
    console.log('No welcome modal found, continuing...');
  }
  await new Promise((r) => setTimeout(r, 2000));

  // Wait for canvas
  await page.waitForSelector('canvas', { timeout: 30000 });
  await new Promise((r) => setTimeout(r, 3000));
  console.log('Overworld loaded');

  // Set golden hour
  await setTimeOfDay(page, 0.62);
  console.log('Set time to golden hour');
  await new Promise((r) => setTimeout(r, 1000));

  // Capture frames through season cycle
  let frameOffset = 0;

  for (const { season, holdMs } of SEASON_SEQUENCE) {
    await setSeason(page, season);
    console.log(`  Capturing ${season} (${holdMs / 1000}s, ~${Math.ceil(holdMs / FRAME_INTERVAL)} frames)...`);
    await new Promise((r) => setTimeout(r, 500)); // let particles settle
    frameOffset = await captureFrames(page, holdMs, frameOffset);
  }

  // Settings panel flash
  console.log('  Capturing settings panel...');
  await openSettingsPanel(page);
  frameOffset = await captureFrames(page, 3000, frameOffset);

  console.log(`\nCaptured ${frameOffset} frames total`);
  await browser.close();

  // Compile with ffmpeg
  console.log('Compiling video with ffmpeg...');
  const ffmpegCmd = [
    'ffmpeg', '-y',
    '-framerate', String(FPS),
    '-i', path.join(FRAMES_DIR, 'frame-%06d.png'),
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-crf', '23',
    '-preset', 'medium',
    OUTPUT_PATH,
  ].join(' ');

  execSync(ffmpegCmd, { stdio: 'inherit' });

  // Clean up frames
  await rm(FRAMES_DIR, { recursive: true, force: true });
  console.log(`\nDone! Video saved to ${OUTPUT_PATH}`);
}

main().catch(async (err) => {
  console.error('Recording failed:', err);
  await rm(FRAMES_DIR, { recursive: true, force: true }).catch(() => {});
  process.exit(1);
});
