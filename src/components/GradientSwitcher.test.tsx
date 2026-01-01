import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGradientSwitcher, gradients } from './GradientSwitcher';

describe('useGradientSwitcher', () => {
  beforeEach(() => {
    // Reset body styles before each test
    document.body.style.background = '';
    document.body.style.backgroundAttachment = '';
  });

  it('should export gradients array with 7 gradients', () => {
    expect(gradients).toHaveLength(7);
  });

  it('should have gradient objects with name and value', () => {
    gradients.forEach(gradient => {
      expect(gradient).toHaveProperty('name');
      expect(gradient).toHaveProperty('value');
      expect(typeof gradient.name).toBe('string');
      expect(typeof gradient.value).toBe('string');
    });
  });

  it('should set background when switchGradient is called', () => {
    const { result } = renderHook(() => useGradientSwitcher());

    act(() => {
      result.current.switchGradient(gradients[0].value);
    });

    // Browser may normalize colors to rgb format
    expect(document.body.style.background).toContain('linear-gradient');
    expect(document.body.style.backgroundAttachment).toBe('fixed');
  });

  it('should reset to first gradient when resetGradient is called', () => {
    const { result } = renderHook(() => useGradientSwitcher());

    // Set a different gradient first
    act(() => {
      result.current.switchGradient(gradients[3].value);
    });

    const gradientAfterSwitch = document.body.style.background;
    expect(gradientAfterSwitch).toContain('linear-gradient');

    // Reset
    act(() => {
      result.current.resetGradient();
    });

    const gradientAfterReset = document.body.style.background;
    expect(gradientAfterReset).toContain('linear-gradient');
    // Should be different from previous gradient
    expect(gradientAfterReset).not.toBe(gradientAfterSwitch);
  });

  it('should cycle to next gradient when cycleGradient is called', () => {
    const { result } = renderHook(() => useGradientSwitcher());

    // Start with first gradient
    act(() => {
      result.current.resetGradient();
    });

    const firstGradient = document.body.style.background;
    expect(firstGradient).toContain('linear-gradient');

    // Cycle to next
    act(() => {
      result.current.cycleGradient();
    });

    const secondGradient = document.body.style.background;
    expect(secondGradient).toContain('linear-gradient');
    // Should be different from first
    expect(secondGradient).not.toBe(firstGradient);
  });

  it('should wrap around to first gradient after last', () => {
    const { result } = renderHook(() => useGradientSwitcher());

    // Reset to first, then cycle through all to get to last
    act(() => {
      result.current.resetGradient();
    });

    // Cycle through all gradients to reach the last one
    for (let i = 1; i < gradients.length; i++) {
      act(() => {
        result.current.cycleGradient();
      });
    }

    const lastGradient = document.body.style.background;

    // Cycle should wrap to first
    act(() => {
      result.current.cycleGradient();
    });

    const firstGradient = document.body.style.background;
    expect(firstGradient).toContain('linear-gradient');
    // Should be different from last gradient
    expect(firstGradient).not.toBe(lastGradient);
  });

  it('should cycle through all gradients', () => {
    const { result } = renderHook(() => useGradientSwitcher());

    // Start with first gradient
    act(() => {
      result.current.resetGradient();
    });

    const seenGradients = new Set<string>();
    seenGradients.add(document.body.style.background);

    // Cycle through all gradients
    for (let i = 1; i < gradients.length; i++) {
      act(() => {
        result.current.cycleGradient();
      });
      const currentGradient = document.body.style.background;
      expect(currentGradient).toContain('linear-gradient');
      seenGradients.add(currentGradient);
    }

    // Should have seen all different gradients
    expect(seenGradients.size).toBe(gradients.length);
  });

  it('should handle cycling when no gradient is set', () => {
    const { result } = renderHook(() => useGradientSwitcher());

    // Cycle without setting initial gradient
    act(() => {
      result.current.cycleGradient();
    });

    // Should set a gradient
    expect(document.body.style.background).toContain('linear-gradient');
  });

  it('should always set backgroundAttachment to fixed', () => {
    const { result } = renderHook(() => useGradientSwitcher());

    // Test with different gradient operations
    act(() => {
      result.current.switchGradient(gradients[2].value);
    });
    expect(document.body.style.backgroundAttachment).toBe('fixed');

    act(() => {
      result.current.cycleGradient();
    });
    expect(document.body.style.backgroundAttachment).toBe('fixed');

    act(() => {
      result.current.resetGradient();
    });
    expect(document.body.style.backgroundAttachment).toBe('fixed');
  });

  it('should include Pastel Dream as first gradient', () => {
    expect(gradients[0].name).toBe('Pastel Dream');
    expect(gradients[0].value).toContain('#BFDFFF');
    expect(gradients[0].value).toContain('#FFD1DC');
  });

  it('should return all functions and gradients from hook', () => {
    const { result } = renderHook(() => useGradientSwitcher());

    expect(result.current).toHaveProperty('switchGradient');
    expect(result.current).toHaveProperty('cycleGradient');
    expect(result.current).toHaveProperty('resetGradient');
    expect(result.current).toHaveProperty('gradients');
    expect(typeof result.current.switchGradient).toBe('function');
    expect(typeof result.current.cycleGradient).toBe('function');
    expect(typeof result.current.resetGradient).toBe('function');
    expect(Array.isArray(result.current.gradients)).toBe(true);
  });
});
