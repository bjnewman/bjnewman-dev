import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AccessibleNav } from '../../../components/Overworld/AccessibleNav';

describe('AccessibleNav', () => {
  it('should render links for all 7 buildings', () => {
    render(<AccessibleNav />);
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThanOrEqual(7);
  });

  it('should include links to all site pages', () => {
    render(<AccessibleNav />);
    const links = screen.getAllByRole('link');
    const hrefs = links.map((link) => link.getAttribute('href'));
    expect(hrefs).toContain('/about');
    expect(hrefs).toContain('/projects');
    expect(hrefs).toContain('/blog');
    expect(hrefs).toContain('/resume');
    expect(hrefs).toContain('/dashboard');
    expect(hrefs).toContain('/carlos');
    expect(hrefs).toContain('/holland');
  });

  it('should have a heading', () => {
    render(<AccessibleNav />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });

  it('should have navigation landmark', () => {
    render(<AccessibleNav />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
