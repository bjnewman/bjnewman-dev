import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import { useMusicPlayer } from '../../components/MusicPlayer';

describe('useMusicPlayer', () => {
  beforeEach(() => {
    // Mock Audio constructor with play() returning a Promise
    const mockAudio = {
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      loop: false,
      volume: 1,
    };
    window.Audio = vi.fn(() => mockAudio) as unknown as typeof Audio;
  });

  it('should initialize with isPlaying false', () => {
    const { result } = renderHook(() => useMusicPlayer());
    expect(result.current.isPlaying).toBe(false);
  });

  it('should create audio element on mount', () => {
    renderHook(() => useMusicPlayer());
    expect(window.Audio).toHaveBeenCalled();
  });

  it('should toggle isPlaying to true when toggleMusic is called', () => {
    const { result } = renderHook(() => useMusicPlayer());

    act(() => {
      result.current.toggleMusic();
    });

    expect(result.current.isPlaying).toBe(true);
  });

  it('should toggle isPlaying back to false when called again', () => {
    const { result } = renderHook(() => useMusicPlayer());

    act(() => {
      result.current.toggleMusic();
    });
    expect(result.current.isPlaying).toBe(true);

    act(() => {
      result.current.toggleMusic();
    });
    expect(result.current.isPlaying).toBe(false);
  });

  it('should not render MusicIndicator when not playing', () => {
    const { result } = renderHook(() => useMusicPlayer());
    const { container } = render(<result.current.MusicIndicator />);

    expect(container.querySelector('.music-indicator')).not.toBeInTheDocument();
  });

  it('should render MusicIndicator when playing', () => {
    const { result } = renderHook(() => useMusicPlayer());

    act(() => {
      result.current.toggleMusic();
    });

    render(<result.current.MusicIndicator />);

    expect(screen.getByText('🎵')).toBeInTheDocument();
    expect(screen.getByText('Elevator Music Mode')).toBeInTheDocument();
  });

  it('should hide MusicIndicator when music is stopped', () => {
    const { result } = renderHook(() => useMusicPlayer());

    // Start playing
    act(() => {
      result.current.toggleMusic();
    });

    const { rerender } = render(<result.current.MusicIndicator />);
    expect(screen.getByText('Elevator Music Mode')).toBeInTheDocument();

    // Stop playing
    act(() => {
      result.current.toggleMusic();
    });

    rerender(<result.current.MusicIndicator />);
    expect(screen.queryByText('Elevator Music Mode')).not.toBeInTheDocument();
  });

  it('should return toggleMusic, isPlaying, and MusicIndicator from hook', () => {
    const { result } = renderHook(() => useMusicPlayer());

    expect(result.current).toHaveProperty('toggleMusic');
    expect(result.current).toHaveProperty('isPlaying');
    expect(result.current).toHaveProperty('MusicIndicator');
    expect(typeof result.current.toggleMusic).toBe('function');
    expect(typeof result.current.isPlaying).toBe('boolean');
    expect(typeof result.current.MusicIndicator).toBe('function');
  });

  it('should cleanup audio element on unmount', () => {
    const pauseMock = vi.fn();
    const mockAudio = {
      play: vi.fn().mockResolvedValue(undefined),
      pause: pauseMock,
      loop: false,
      volume: 1,
    };
    window.Audio = vi.fn(() => mockAudio) as unknown as typeof Audio;

    const { unmount } = renderHook(() => useMusicPlayer());
    unmount();

    expect(pauseMock).toHaveBeenCalled();
  });
});
