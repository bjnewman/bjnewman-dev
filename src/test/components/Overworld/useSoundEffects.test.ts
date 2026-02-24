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
