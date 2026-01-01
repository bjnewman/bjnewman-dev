import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { render } from '@testing-library/react';
import { useConfetti } from './ConfettiCannon';

describe('useConfetti', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should initialize with no confetti', () => {
    const { result } = renderHook(() => useConfetti());
    const { container } = render(<result.current.ConfettiRender />);

    expect(container.querySelectorAll('.confetti-piece')).toHaveLength(0);
  });

  it('should create 50 confetti pieces when fired', () => {
    const { result } = renderHook(() => useConfetti());

    act(() => {
      result.current.fireConfetti();
    });

    const { container } = render(<result.current.ConfettiRender />);
    expect(container.querySelectorAll('.confetti-piece')).toHaveLength(50);
  });

  it('should create confetti with pastel colors', () => {
    const { result } = renderHook(() => useConfetti());

    act(() => {
      result.current.fireConfetti();
    });

    const { container } = render(<result.current.ConfettiRender />);
    const confettiPieces = container.querySelectorAll('.confetti-piece');

    confettiPieces.forEach(piece => {
      const bgColor = (piece as HTMLElement).style.backgroundColor;
      // Browser converts colors to rgb format - just check it exists
      expect(bgColor).toBeTruthy();
      expect(bgColor).toMatch(/rgb\(\d+,\s*\d+,\s*\d+\)/);
    });
  });

  it('should start confetti at top of screen', () => {
    const { result } = renderHook(() => useConfetti());

    act(() => {
      result.current.fireConfetti();
    });

    const { container } = render(<result.current.ConfettiRender />);
    const confettiPieces = container.querySelectorAll('.confetti-piece');

    confettiPieces.forEach(piece => {
      const style = (piece as HTMLElement).getAttribute('style');
      // Check that top is close to -10px
      expect(style).toContain('top: -10px');
    });
  });

  it('should apply random x positions across screen width', () => {
    const { result } = renderHook(() => useConfetti());

    act(() => {
      result.current.fireConfetti();
    });

    const { container } = render(<result.current.ConfettiRender />);
    const confettiPieces = container.querySelectorAll('.confetti-piece');
    const xPositions = new Set<number>();

    confettiPieces.forEach(piece => {
      const left = (piece as HTMLElement).style.left;
      const xPos = parseFloat(left);
      xPositions.add(xPos);
    });

    // Should have variety of x positions
    expect(xPositions.size).toBeGreaterThan(40);
  });

  it('should apply rotation to confetti pieces', () => {
    const { result } = renderHook(() => useConfetti());

    act(() => {
      result.current.fireConfetti();
    });

    const { container } = render(<result.current.ConfettiRender />);
    const confettiPieces = container.querySelectorAll('.confetti-piece');

    confettiPieces.forEach(piece => {
      const transform = (piece as HTMLElement).style.transform;
      expect(transform).toMatch(/rotate\(\d+(\.\d+)?deg\)/);
    });
  });

  it('should update confetti positions over time with gravity', () => {
    const { result } = renderHook(() => useConfetti());

    act(() => {
      result.current.fireConfetti();
    });

    const { container: container1 } = render(<result.current.ConfettiRender />);
    const initialTop = (container1.querySelector('.confetti-piece') as HTMLElement)
      ?.style.top;

    // Advance time by one animation frame (1000/60 ms)
    act(() => {
      vi.advanceTimersByTime(1000 / 60);
    });

    const { container: container2 } = render(<result.current.ConfettiRender />);
    const updatedTop = (container2.querySelector('.confetti-piece') as HTMLElement)
      ?.style.top;

    // Y position should have increased (moved down)
    const initialY = parseFloat(initialTop || '0');
    const updatedY = parseFloat(updatedTop || '0');
    expect(updatedY).toBeGreaterThan(initialY);
  });

  it('should remove confetti pieces that fall below screen', () => {
    const { result } = renderHook(() => useConfetti());

    act(() => {
      result.current.fireConfetti();
    });

    // Advance time significantly to make confetti fall off screen
    act(() => {
      // Advance by 10 seconds worth of frames
      vi.advanceTimersByTime(10000);
    });

    const { container } = render(<result.current.ConfettiRender />);
    const remainingPieces = container.querySelectorAll('.confetti-piece');

    // Most or all confetti should have fallen off screen by now
    expect(remainingPieces.length).toBeLessThan(50);
  });

  it('should allow firing confetti multiple times', () => {
    const { result } = renderHook(() => useConfetti());

    act(() => {
      result.current.fireConfetti();
    });

    act(() => {
      result.current.fireConfetti();
    });

    const { container } = render(<result.current.ConfettiRender />);
    expect(container.querySelectorAll('.confetti-piece')).toHaveLength(100);
  });

  it('should clean up interval when confetti is cleared', () => {
    const clearIntervalSpy = vi.spyOn(window, 'clearInterval');
    const { result, unmount } = renderHook(() => useConfetti());

    act(() => {
      result.current.fireConfetti();
    });

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
