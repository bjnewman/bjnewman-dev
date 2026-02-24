import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAudioDescription } from '../../../components/Overworld/useAudioDescription';

describe('useAudioDescription', () => {
  it('should provide a describe function', () => {
    const { result } = renderHook(() => useAudioDescription());
    expect(typeof result.current.describeScene).toBe('function');
  });

  it('should call speechSynthesis when describing scene', () => {
    const mockSpeak = vi.fn();
    Object.defineProperty(window, 'speechSynthesis', {
      value: { speak: mockSpeak, cancel: vi.fn() },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useAudioDescription());

    act(() => {
      result.current.describeScene();
    });

    expect(mockSpeak).toHaveBeenCalledOnce();
  });
});
