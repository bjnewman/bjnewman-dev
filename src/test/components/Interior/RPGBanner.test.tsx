import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RPGBanner } from '../../../components/Interior/RPGBanner';

describe('RPGBanner', () => {
  it('should render title text', () => {
    render(<RPGBanner>The Library</RPGBanner>);
    expect(screen.getByText('The Library')).toBeInTheDocument();
  });

  it('should render as a heading', () => {
    render(<RPGBanner>Title</RPGBanner>);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});
