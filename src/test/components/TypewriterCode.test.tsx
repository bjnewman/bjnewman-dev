import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TypewriterCode } from '../../components/TypewriterCode';

describe('TypewriterCode', () => {
  beforeEach(() => {
    // Default: no reduced motion preference
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it('should render the typewriter container', () => {
    render(<TypewriterCode />);

    const container = screen.getByRole('img');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('typewriter-container');
  });

  it('should have accessible aria-label describing the content', () => {
    render(<TypewriterCode />);

    const container = screen.getByRole('img');
    expect(container).toHaveAttribute('aria-label');
    expect(container.getAttribute('aria-label')).toContain('Tech Lead');
  });

  it('should show cursor during typing', () => {
    const { container } = render(<TypewriterCode />);

    const cursor = container.querySelector('.typewriter-cursor');
    expect(cursor).toBeInTheDocument();
  });

  it('should start typing and show characters', async () => {
    const { container } = render(<TypewriterCode />);

    // Wait for some typing to occur
    await waitFor(
      () => {
        const codeElement = container.querySelector('.typewriter-code');
        const text = codeElement?.textContent || '';
        // Should have typed at least the first few characters
        expect(text.length).toBeGreaterThan(5);
      },
      { timeout: 1000 }
    );
  });

  it('should apply syntax highlighting class to comment', async () => {
    const { container } = render(<TypewriterCode />);

    // Wait for the comment to be typed (first token)
    await waitFor(
      () => {
        const comment = container.querySelector('.code-comment');
        expect(comment).toBeInTheDocument();
      },
      { timeout: 500 }
    );
  });

  it('should show full text immediately when prefers-reduced-motion is enabled', () => {
    // Mock reduced motion preference
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { container } = render(<TypewriterCode />);
    const codeElement = container.querySelector('.typewriter-code');

    // Should show full text immediately - check for content near the end
    expect(codeElement?.textContent).toContain('Tech Lead');
    expect(codeElement?.textContent).toContain('complexProblems');
  });

  it('should not show cursor when prefers-reduced-motion is enabled', () => {
    // Mock reduced motion preference
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { container } = render(<TypewriterCode />);

    const cursor = container.querySelector('.typewriter-cursor');
    expect(cursor).not.toBeInTheDocument();
  });

  it('should have all syntax highlighting classes when reduced motion is enabled', () => {
    // Mock reduced motion preference to see full code immediately
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { container } = render(<TypewriterCode />);

    expect(container.querySelector('.code-comment')).toBeInTheDocument();
    expect(container.querySelector('.code-keyword')).toBeInTheDocument();
    expect(container.querySelector('.code-string')).toBeInTheDocument();
    expect(container.querySelector('.code-property')).toBeInTheDocument();
    expect(container.querySelector('.code-function')).toBeInTheDocument();
  });
});
