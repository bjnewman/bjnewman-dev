import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RPGButton } from '../../../components/Interior/RPGButton';

describe('RPGButton', () => {
  it('should render label text', () => {
    render(<RPGButton onClick={() => {}}>Click Me</RPGButton>);
    expect(screen.getByRole('button', { name: 'Click Me' })).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<RPGButton onClick={onClick}>Click</RPGButton>);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('should apply active class when active', () => {
    render(<RPGButton onClick={() => {}} active>Tab</RPGButton>);
    expect(screen.getByRole('button')).toHaveClass('rpg-button--active');
  });
});
