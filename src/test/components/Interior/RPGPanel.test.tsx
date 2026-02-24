import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RPGPanel } from '../../../components/Interior/RPGPanel';

describe('RPGPanel', () => {
  it('should render children', () => {
    render(<RPGPanel>Hello World</RPGPanel>);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('should apply paper variant by default', () => {
    const { container } = render(<RPGPanel>Content</RPGPanel>);
    expect(container.firstChild).toHaveClass('rpg-panel--paper');
  });

  it('should apply wood variant when specified', () => {
    const { container } = render(<RPGPanel variant="wood">Content</RPGPanel>);
    expect(container.firstChild).toHaveClass('rpg-panel--wood');
  });

  it('should have the base rpg-panel class', () => {
    const { container } = render(<RPGPanel>Content</RPGPanel>);
    expect(container.firstChild).toHaveClass('rpg-panel');
  });
});
