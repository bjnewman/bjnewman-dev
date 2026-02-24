import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InteractiveObject } from '../../../components/Interior/InteractiveObject';

describe('InteractiveObject', () => {
  it('should render as a button with aria-label', () => {
    render(
      <InteractiveObject
        id="bookshelf"
        label="Browse the bookshelf"
        x="30%" y="40%" width="10%" height="15%"
        onClick={() => {}}
      />
    );
    expect(screen.getByRole('button', { name: 'Browse the bookshelf' })).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <InteractiveObject
        id="bookshelf"
        label="Browse"
        x="30%" y="40%" width="10%" height="15%"
        onClick={onClick}
      />
    );
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('should show tooltip text', () => {
    render(
      <InteractiveObject
        id="bookshelf"
        label="Browse the bookshelf"
        x="30%" y="40%" width="10%" height="15%"
        onClick={() => {}}
      />
    );
    expect(screen.getByText('Browse the bookshelf')).toBeInTheDocument();
  });
});
