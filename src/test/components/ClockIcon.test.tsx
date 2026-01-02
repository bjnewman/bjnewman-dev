import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ClockIcon } from '../../components/ClockIcon';

describe('ClockIcon', () => {
  it('should render an SVG element', () => {
    const { container } = render(<ClockIcon />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('clock-icon');
  });

  it('should have aria-hidden for accessibility', () => {
    const { container } = render(<ClockIcon />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('should render clock face circle', () => {
    const { container } = render(<ClockIcon />);

    const circles = container.querySelectorAll('circle');
    // Clock face + center dot
    expect(circles.length).toBeGreaterThanOrEqual(2);
  });

  it('should render hour markers', () => {
    const { container } = render(<ClockIcon />);

    // 12 hour markers
    const lines = container.querySelectorAll('line');
    expect(lines.length).toBeGreaterThanOrEqual(12);
  });

  it('should render hour and minute hands', () => {
    const { container } = render(<ClockIcon />);

    // Hour markers (12) + hour hand + minute hand = at least 14 lines
    const lines = container.querySelectorAll('line');
    expect(lines.length).toBe(14);
  });

  it('should use purple color theme', () => {
    const { container } = render(<ClockIcon />);

    const circle = container.querySelector('circle');
    expect(circle).toHaveAttribute('stroke', '#8b5cf6');
  });
});
