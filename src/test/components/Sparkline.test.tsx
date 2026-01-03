import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Sparkline } from '../../components/Sparkline';

describe('Sparkline', () => {
  const sampleData = [10, 30, 20, 50, 40, 70, 60, 90];

  it('should render an SVG element', () => {
    const { container } = render(<Sparkline data={sampleData} />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('sparkline');
  });

  it('should have aria-hidden for accessibility', () => {
    const { container } = render(<Sparkline data={sampleData} />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('should render path elements for the line', () => {
    const { container } = render(<Sparkline data={sampleData} />);

    const paths = container.querySelectorAll('path');
    // Main line + glow effect
    expect(paths.length).toBeGreaterThanOrEqual(1);
  });

  it('should apply custom color', () => {
    const { container } = render(<Sparkline data={sampleData} color="#ff0000" />);

    const path = container.querySelector('path');
    expect(path).toHaveAttribute('stroke', '#ff0000');
  });

  it('should handle different data lengths', () => {
    const shortData = [10, 50, 90];
    const { container } = render(<Sparkline data={shortData} />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
