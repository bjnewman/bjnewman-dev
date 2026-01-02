import { describe, it, expect } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { CrowdIcon } from '../../components/CrowdIcon';

describe('CrowdIcon', () => {
  it('should render an SVG element', () => {
    const { container } = render(<CrowdIcon />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('crowd-icon');
  });

  it('should have aria-hidden for accessibility', () => {
    const { container } = render(<CrowdIcon />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('should render person shapes (circles and ellipses)', () => {
    const { container } = render(<CrowdIcon />);

    // Each person has a head (circle) and body (ellipse)
    const circles = container.querySelectorAll('circle');
    const ellipses = container.querySelectorAll('ellipse');

    expect(circles.length).toBeGreaterThan(0);
    expect(ellipses.length).toBeGreaterThan(0);
  });

  it('should have 15 people in the crowd', () => {
    const { container } = render(<CrowdIcon />);

    // 15 groups (g elements) for 15 people
    const groups = container.querySelectorAll('g');
    expect(groups).toHaveLength(15);
  });

  it('should animate people appearing over time', async () => {
    const { container } = render(<CrowdIcon />);

    // Initially some should be hidden (opacity 0)
    const groups = container.querySelectorAll('g');
    const initialVisible = Array.from(groups).filter(
      (g) => g.style.opacity === '1'
    ).length;

    // Wait for animation to progress
    await waitFor(
      () => {
        const visibleNow = Array.from(groups).filter(
          (g) => g.style.opacity === '1'
        ).length;
        expect(visibleNow).toBeGreaterThan(initialVisible);
      },
      { timeout: 500 }
    );
  });

  it('should use blue color theme', () => {
    const { container } = render(<CrowdIcon />);

    const circle = container.querySelector('circle');
    expect(circle).toHaveAttribute('fill', '#3b82f6');
  });
});
