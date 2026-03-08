import { describe, it, expect } from 'vitest';
import {
  getPreset,
  resolvePreset,
  randomizeParticleParams,
} from '../../../components/Overworld/weatherPresets';
import type { Season } from '../../../components/Atmosphere/types';

const SEASONS: Season[] = ['spring', 'summer', 'fall', 'winter'];

describe('weatherPresets', () => {
  describe('getPreset', () => {
    it.each(SEASONS)('returns a preset for %s', (season) => {
      const preset = getPreset(season);
      expect(preset).toBeDefined();
      expect(preset.count).toBeGreaterThan(0);
      expect(preset.colors.length).toBeGreaterThan(0);
      expect(preset.shape).toMatch(/^(rect|circle|ellipse)$/);
    });

    it('returns rect shape for spring rain', () => {
      expect(getPreset('spring').shape).toBe('rect');
    });

    it('returns circle shape for summer fireflies', () => {
      expect(getPreset('summer').shape).toBe('circle');
    });

    it('returns ellipse shape for fall leaves', () => {
      expect(getPreset('fall').shape).toBe('ellipse');
    });

    it('returns circle shape for winter snow', () => {
      expect(getPreset('winter').shape).toBe('circle');
    });
  });

  describe('resolvePreset', () => {
    it('returns base preset when no overrides given', () => {
      const base = getPreset('spring');
      const resolved = resolvePreset('spring');
      expect(resolved).toEqual(base);
    });

    it('applies count multiplier', () => {
      const resolved = resolvePreset('spring', { count: 2 });
      expect(resolved.count).toBe(getPreset('spring').count * 2);
    });

    it('applies speed multiplier to min and max', () => {
      const base = getPreset('winter');
      const resolved = resolvePreset('winter', { speed: 3 });
      expect(resolved.speed.min).toBeCloseTo(base.speed.min * 3);
      expect(resolved.speed.max).toBeCloseTo(base.speed.max * 3);
    });

    it('applies wind multiplier', () => {
      const base = getPreset('fall');
      const resolved = resolvePreset('fall', { wind: 0.5 });
      expect(resolved.wind.min).toBeCloseTo(base.wind.min * 0.5);
      expect(resolved.wind.max).toBeCloseTo(base.wind.max * 0.5);
    });

    it('applies size multiplier', () => {
      const base = getPreset('spring');
      const resolved = resolvePreset('spring', { size: 2 });
      expect(resolved.size.min).toBeCloseTo(base.size.min * 2);
      expect(resolved.size.max).toBeCloseTo(base.size.max * 2);
    });

    it('clamps alpha to max 1', () => {
      const resolved = resolvePreset('winter', { opacity: 10 });
      expect(resolved.alpha.min).toBeLessThanOrEqual(1);
      expect(resolved.alpha.max).toBeLessThanOrEqual(1);
    });

    it('does not mutate base preset', () => {
      const baseBefore = { ...getPreset('spring') };
      resolvePreset('spring', { count: 99, speed: 99 });
      const baseAfter = getPreset('spring');
      expect(baseAfter.count).toBe(baseBefore.count);
      expect(baseAfter.speed).toEqual(baseBefore.speed);
    });
  });

  describe('randomizeParticleParams', () => {
    it('returns values within preset ranges', () => {
      const preset = getPreset('fall');
      for (let i = 0; i < 50; i++) {
        const params = randomizeParticleParams(preset);
        expect(params.vy).toBeGreaterThanOrEqual(preset.speed.min);
        expect(params.vy).toBeLessThanOrEqual(preset.speed.max);
        expect(params.vx).toBeGreaterThanOrEqual(preset.wind.min);
        expect(params.vx).toBeLessThanOrEqual(preset.wind.max);
        expect(params.scale).toBeGreaterThanOrEqual(preset.size.min);
        expect(params.scale).toBeLessThanOrEqual(preset.size.max);
        expect(params.alpha).toBeGreaterThanOrEqual(preset.alpha.min);
        expect(params.alpha).toBeLessThanOrEqual(preset.alpha.max);
        expect(preset.colors).toContain(params.color);
      }
    });

    it('returns a phase between 0 and 2*PI', () => {
      const preset = getPreset('winter');
      for (let i = 0; i < 20; i++) {
        const params = randomizeParticleParams(preset);
        expect(params.phase).toBeGreaterThanOrEqual(0);
        expect(params.phase).toBeLessThan(Math.PI * 2);
      }
    });
  });
});
