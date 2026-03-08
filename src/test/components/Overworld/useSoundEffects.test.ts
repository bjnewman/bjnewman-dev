import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSoundEffects } from '../../../components/Overworld/useSoundEffects';

describe('useSoundEffects', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with sounds muted', () => {
    const { result } = renderHook(() => useSoundEffects());
    expect(result.current.muted).toBe(true);
  });

  it('should toggle mute state', () => {
    const { result } = renderHook(() => useSoundEffects());

    act(() => {
      result.current.toggleMute();
    });

    expect(result.current.muted).toBe(false);
  });

  it('should persist mute state to localStorage', () => {
    const { result } = renderHook(() => useSoundEffects());

    act(() => {
      result.current.toggleMute();
    });

    expect(localStorage.getItem('overworld-audio-muted')).toBe('false');
  });

  it('should restore mute state from localStorage', () => {
    localStorage.setItem('overworld-audio-muted', 'false');

    const { result } = renderHook(() => useSoundEffects());
    expect(result.current.muted).toBe(false);
  });

  it('should expose play functions for each sound type', () => {
    const { result } = renderHook(() => useSoundEffects());
    expect(typeof result.current.playDialogOpen).toBe('function');
    expect(typeof result.current.playConfirm).toBe('function');
    expect(typeof result.current.playCancel).toBe('function');
    expect(typeof result.current.playTransition).toBe('function');
  });
});

describe('useSoundEffects — centralized playSound', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should expose a generic playSound function', () => {
    const { result } = renderHook(() => useSoundEffects());
    expect(typeof result.current.playSound).toBe('function');
  });

  it('should not throw when playing a synthesized sound while muted', () => {
    const { result } = renderHook(() => useSoundEffects());
    // Should be muted by default, calling playSound should be a no-op
    expect(() => result.current.playSound('quack')).not.toThrow();
  });

  it('should register and play custom synthesized sounds', () => {
    const { result } = renderHook(() => useSoundEffects());
    // Unmute first
    act(() => {
      result.current.toggleMute();
    });
    // Playing a synthesized sound should not throw
    expect(() => result.current.playSound('quack')).not.toThrow();
  });
});
