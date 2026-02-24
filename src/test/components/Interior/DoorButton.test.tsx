import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DoorButton } from '../../../components/Interior/DoorButton';

describe('DoorButton', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render with aria-label', () => {
    render(<DoorButton buildingId="library" />);
    expect(screen.getByRole('button', { name: /return to village/i })).toBeInTheDocument();
  });

  it('should set localStorage spawn point on click', async () => {
    const user = userEvent.setup();
    render(<DoorButton buildingId="library" />);
    await user.click(screen.getByRole('button'));
    expect(localStorage.getItem('overworld-spawn')).toBe('library');
  });

  it('should display door icon', () => {
    render(<DoorButton buildingId="library" />);
    expect(screen.getByText('\u{1F6AA}')).toBeInTheDocument();
  });
});
