import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCards } from '../../components/StatCards';

describe('StatCards', () => {
  it('should render all three stat cards', () => {
    render(<StatCards />);

    expect(screen.getByText('10M+')).toBeInTheDocument();
    expect(screen.getByText('100k+')).toBeInTheDocument();
    expect(screen.getByText('7+')).toBeInTheDocument();
  });

  it('should render stat labels', () => {
    render(<StatCards />);

    expect(screen.getByText('transactions/day')).toBeInTheDocument();
    expect(screen.getByText('daily users')).toBeInTheDocument();
    expect(screen.getByText('years experience')).toBeInTheDocument();
  });

  it('should have accessible list structure', () => {
    render(<StatCards />);

    const list = screen.getByRole('list', { name: 'Key statistics' });
    expect(list).toBeInTheDocument();

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
  });

  it('should apply correct CSS classes', () => {
    const { container } = render(<StatCards />);

    expect(container.querySelector('.stat-cards')).toBeInTheDocument();
    expect(container.querySelectorAll('.stat-card')).toHaveLength(3);
    expect(container.querySelectorAll('.stat-value')).toHaveLength(3);
    expect(container.querySelectorAll('.stat-label')).toHaveLength(3);
  });

  it('should render sparklines for each stat', () => {
    const { container } = render(<StatCards />);

    const sparklines = container.querySelectorAll('.stat-sparkline');
    expect(sparklines).toHaveLength(3);

    // Each sparkline should contain an SVG
    sparklines.forEach((sparkline) => {
      expect(sparkline.querySelector('svg')).toBeInTheDocument();
    });
  });
});
