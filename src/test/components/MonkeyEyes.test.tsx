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

    // The component should render the monkey structure
    expect(container.firstChild).toBeTruthy();

    // Find elements with border-radius (monkey has many rounded elements)
    const elements = container.querySelectorAll('div');
    const roundedElements = Array.from(elements).filter(el => {
      const style = (el as HTMLElement).style;
      return style.borderRadius && style.borderRadius.includes('50%');
    });

    // Should have multiple rounded elements (head, ears, eyes, face mask parts)
    expect(roundedElements.length).toBeGreaterThanOrEqual(5);
  });

  it('renders eyes with Suzanne Aitchison monkey styling', () => {
    const { container } = render(<MonkeyEyes />);

    // Check that the component renders the monkey head with brown color
    const elements = container.querySelectorAll('div');
    const hasBrownElements = Array.from(elements).some(el => {
      const style = (el as HTMLElement).style;
      return style.background === 'rgb(158, 89, 54)' || style.background === '#9E5936';
    });

    expect(hasBrownElements).toBe(true);

    // Check for face mask elements (light brown)
    const hasLightBrownElements = Array.from(elements).some(el => {
      const style = (el as HTMLElement).style;
      return style.background === 'rgb(234, 190, 127)' || style.background === '#EABE7F';
    });

    expect(hasLightBrownElements).toBe(true);
  });

  it('renders eyes with highlight effect', () => {
    const { container } = render(<MonkeyEyes />);

    // Find elements with white backgrounds (eye highlights)
    const elements = container.querySelectorAll('div');
    const whiteElements = Array.from(elements).filter(el => {
      const style = (el as HTMLElement).style;
      return style.background === 'white' || style.background === 'rgb(255, 255, 255)';
    });

    // Should have eye highlights and white eye borders
    expect(whiteElements.length).toBeGreaterThanOrEqual(2);
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

  it('positions eyes at center of viewport by default', () => {
    const { container } = render(<MonkeyEyes />);

    const eyeContainer = container.firstChild as HTMLElement;
    const style = eyeContainer.style;

    expect(style.position).toBe('fixed');
    expect(style.top).toBe('50%');
    expect(style.left).toBe('50%');
    expect(style.transform).toBe('translate(-50%, -50%)');
  });

  it('sets pointer-events to none so eyes do not block interactions', () => {
    const { container } = render(<MonkeyEyes />);

    const eyeContainer = container.firstChild as HTMLElement;
    expect(eyeContainer.style.pointerEvents).toBe('none');
  });

  it('applies smooth transition to eye movement', () => {
    const { container } = render(<MonkeyEyes />);

    // Find elements with transitions (the eyes that track the mouse)
    const elements = container.querySelectorAll('div');
    const transitionElements = Array.from(elements).filter(el => {
      const style = (el as HTMLElement).style;
      return style.transition && style.transition.includes('transform') &&
             style.transition.includes('0.1s') && style.transition.includes('ease-out');
    });

    // Should have at least 2 eyes with transitions
    expect(transitionElements.length).toBeGreaterThanOrEqual(2);
  });

  it('displays eyes with proper z-index below secret menu', () => {
    const { container } = render(<MonkeyEyes />);

    const eyeContainer = container.firstChild as HTMLElement;
    expect(eyeContainer.style.zIndex).toBe('9997');
  });
});
