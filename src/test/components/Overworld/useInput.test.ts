import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInput } from '../../../components/Overworld/useInput';

describe('useInput', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with no keys pressed', () => {
    const { result } = renderHook(() => useInput());
    expect(result.current.keys.up).toBe(false);
    expect(result.current.keys.down).toBe(false);
    expect(result.current.keys.left).toBe(false);
    expect(result.current.keys.right).toBe(false);
    expect(result.current.keys.interact).toBe(false);
  });

  it('should detect arrow key presses', () => {
    const { result } = renderHook(() => useInput());

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    });

    expect(result.current.keys.up).toBe(true);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowUp' }));
    });

    expect(result.current.keys.up).toBe(false);
  });

  it('should detect WASD key presses', () => {
    const { result } = renderHook(() => useInput());

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
    });

    expect(result.current.keys.up).toBe(true);
  });

  it('should detect E key as interact', () => {
    const { result } = renderHook(() => useInput());

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }));
    });

    expect(result.current.keys.interact).toBe(true);
  });

  it('should detect Space key as interact', () => {
    const { result } = renderHook(() => useInput());

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    });

    expect(result.current.keys.interact).toBe(true);
  });

  it('should not map Enter key to interact', () => {
    const { result } = renderHook(() => useInput());

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    });

    // Enter is intentionally not mapped — it should reach focused dialog buttons
    expect(result.current.keys.interact).toBe(false);
  });

  it('should detect Escape key', () => {
    const { result } = renderHook(() => useInput());

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(result.current.keys.escape).toBe(true);
  });

  it('should track click target position', () => {
    const { result } = renderHook(() => useInput());

    expect(result.current.clickTarget).toBeNull();
  });

  it('should clean up listeners on unmount', () => {
    const removeEventSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useInput());

    unmount();

    expect(removeEventSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(removeEventSpy).toHaveBeenCalledWith('keyup', expect.any(Function));
  });

  it('should set direction key via setDirectionKey', () => {
    const { result } = renderHook(() => useInput());

    act(() => {
      result.current.setDirectionKey('up', true);
    });

    expect(result.current.keys.up).toBe(true);

    act(() => {
      result.current.setDirectionKey('up', false);
    });

    expect(result.current.keys.up).toBe(false);
  });
});
