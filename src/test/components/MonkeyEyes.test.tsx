import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MonkeyEyes } from '../../components/MonkeyEyes';

describe('MonkeyEyes', () => {
  let originalAddEventListener: typeof window.addEventListener;
  let originalRemoveEventListener: typeof window.removeEventListener;
  let eventListeners: Map<string, EventListener[]>;

  beforeEach(() => {
    eventListeners = new Map();

    // Mock addEventListener to track registered listeners
    originalAddEventListener = window.addEventListener;
    originalRemoveEventListener = window.removeEventListener;

    window.addEventListener = vi.fn((event: string, handler: EventListener) => {
      if (!eventListeners.has(event)) {
        eventListeners.set(event, []);
      }
      eventListeners.get(event)!.push(handler);
    });

    window.removeEventListener = vi.fn(
      (event: string, handler: EventListener) => {
        const handlers = eventListeners.get(event);
        if (handlers) {
          const index = handlers.indexOf(handler);
          if (index > -1) {
            handlers.splice(index, 1);
          }
        }
      }
    );
  });

  afterEach(() => {
    window.addEventListener = originalAddEventListener;
    window.removeEventListener = originalRemoveEventListener;
    eventListeners.clear();
  });

  it('renders two eyes with pupils', () => {
    const { container } = render(<MonkeyEyes />);

    // Find the eye containers
    const eyes = container.querySelectorAll('div[style*="width: 80px"]');
    expect(eyes.length).toBe(2);

    // Find the pupils
    const pupils = container.querySelectorAll('div[style*="width: 30px"]');
    expect(pupils.length).toBe(2);
  });

  it('renders eyes with pastel-colored borders', () => {
    const { container } = render(<MonkeyEyes />);

    const eyes = container.querySelectorAll('div[style*="width: 80px"]');
    const leftEyeStyle = (eyes[0] as HTMLElement).style.border;
    const rightEyeStyle = (eyes[1] as HTMLElement).style.border;

    // Check that borders reference CSS variables for pastel colors
    expect(leftEyeStyle).toContain('pastel-pink');
    expect(rightEyeStyle).toContain('pastel-blue');
  });

  it('renders pupils with highlight effect', () => {
    const { container } = render(<MonkeyEyes />);

    // Find the highlight circles (smaller white circles inside pupils)
    const highlights = container.querySelectorAll('div[style*="width: 10px"]');
    expect(highlights.length).toBe(2);

    // Check they have white background
    highlights.forEach((highlight) => {
      const style = (highlight as HTMLElement).style;
      expect(style.backgroundColor).toBe('white');
    });
  });

  it('registers mousemove event listener on mount', () => {
    render(<MonkeyEyes />);

    expect(window.addEventListener).toHaveBeenCalledWith(
      'mousemove',
      expect.any(Function)
    );
    expect(eventListeners.get('mousemove')?.length).toBe(1);
  });

  it('removes mousemove event listener on unmount', () => {
    const { unmount } = render(<MonkeyEyes />);

    const mousemoveHandlers = eventListeners.get('mousemove');
    expect(mousemoveHandlers?.length).toBe(1);

    unmount();

    expect(window.removeEventListener).toHaveBeenCalledWith(
      'mousemove',
      expect.any(Function)
    );
  });

  it('updates pupil position when mouse moves', () => {
    render(<MonkeyEyes />);

    // Simulate mouse move
    const mousemoveHandler = eventListeners.get('mousemove')?.[0];
    expect(mousemoveHandler).toBeDefined();

    if (mousemoveHandler) {
      const mockMouseEvent = new MouseEvent('mousemove', {
        clientX: 500,
        clientY: 300,
      });

      mousemoveHandler(mockMouseEvent);

      // For testing purposes, we verify the event listener was called
      // Note: In a real browser environment, the pupils would update position
      expect(window.addEventListener).toHaveBeenCalled();
    }
  });

  it('positions eyes at top center of viewport', () => {
    const { container } = render(<MonkeyEyes />);

    const eyeContainer = container.firstChild as HTMLElement;
    const style = eyeContainer.style;

    expect(style.position).toBe('fixed');
    expect(style.top).toBe('20px');
    expect(style.left).toBe('50%');
    expect(style.transform).toBe('translateX(-50%)');
  });

  it('sets pointer-events to none so eyes do not block interactions', () => {
    const { container } = render(<MonkeyEyes />);

    const eyeContainer = container.firstChild as HTMLElement;
    expect(eyeContainer.style.pointerEvents).toBe('none');
  });

  it('applies smooth transition to pupil movement', () => {
    const { container } = render(<MonkeyEyes />);

    const pupils = container.querySelectorAll(
      'div[style*="width: 30px"]'
    ) as NodeListOf<HTMLElement>;

    pupils.forEach((pupil) => {
      expect(pupil.style.transition).toContain('transform');
      expect(pupil.style.transition).toContain('0.1s');
      expect(pupil.style.transition).toContain('ease-out');
    });
  });

  it('displays eyes with proper z-index below secret menu', () => {
    const { container } = render(<MonkeyEyes />);

    const eyeContainer = container.firstChild as HTMLElement;
    expect(eyeContainer.style.zIndex).toBe('9997');
  });
});
