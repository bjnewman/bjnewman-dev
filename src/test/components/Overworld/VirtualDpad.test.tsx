import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VirtualDpad } from '../../../components/Overworld/VirtualDpad';

describe('VirtualDpad', () => {
  const onDirection = vi.fn();
  const onInteract = vi.fn();

  it('should render all direction buttons with aria-labels', () => {
    render(<VirtualDpad onDirection={onDirection} onInteract={onInteract} />);

    expect(screen.getByRole('button', { name: 'Move up' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Move down' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Move left' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Move right' })).toBeInTheDocument();
  });

  it('should render interact button', () => {
    render(<VirtualDpad onDirection={onDirection} onInteract={onInteract} />);

    expect(screen.getByRole('button', { name: 'Interact' })).toBeInTheDocument();
  });

  it('should have movement controls group', () => {
    render(<VirtualDpad onDirection={onDirection} onInteract={onInteract} />);

    expect(screen.getByRole('group', { name: 'Movement controls' })).toBeInTheDocument();
  });

  it('should render 5 buttons total', () => {
    render(<VirtualDpad onDirection={onDirection} onInteract={onInteract} />);

    expect(screen.getAllByRole('button')).toHaveLength(5);
  });
});
