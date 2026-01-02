import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SecretMenu } from '../../components/SecretMenu';

describe('SecretMenu', () => {
  const mockItems = [
    {
      id: 'test-1',
      label: 'Test Action 1',
      emoji: '🎉',
      action: vi.fn(),
    },
    {
      id: 'test-2',
      label: 'Test Action 2',
      emoji: '🌈',
      action: vi.fn(),
    },
  ];

  it('should not render menu by default', () => {
    render(<SecretMenu items={mockItems} />);
    expect(screen.queryByText('Secret Menu')).not.toBeInTheDocument();
  });

  it('should open menu when Cmd+K is pressed', async () => {
    const user = userEvent.setup();
    render(<SecretMenu items={mockItems} />);

    await user.keyboard('{Meta>}k{/Meta}');

    expect(screen.getByText('Secret Menu')).toBeInTheDocument();
    expect(screen.getByText('Test Action 1')).toBeInTheDocument();
    expect(screen.getByText('Test Action 2')).toBeInTheDocument();
  });

  it('should open menu when Ctrl+K is pressed', async () => {
    const user = userEvent.setup();
    render(<SecretMenu items={mockItems} />);

    await user.keyboard('{Control>}k{/Control}');

    expect(screen.getByText('Secret Menu')).toBeInTheDocument();
  });

  it('should close menu when Escape is pressed', async () => {
    const user = userEvent.setup();
    render(<SecretMenu items={mockItems} />);

    // Open menu
    await user.keyboard('{Meta>}k{/Meta}');
    expect(screen.getByText('Secret Menu')).toBeInTheDocument();

    // Close menu
    await user.keyboard('{Escape}');
    expect(screen.queryByText('Secret Menu')).not.toBeInTheDocument();
  });

  it('should close menu when overlay is clicked', async () => {
    const user = userEvent.setup();
    render(<SecretMenu items={mockItems} />);

    // Open menu
    await user.keyboard('{Meta>}k{/Meta}');
    expect(screen.getByText('Secret Menu')).toBeInTheDocument();

    // Click overlay
    const overlay = screen.getByText('Secret Menu').closest('.secret-menu-overlay');
    await user.click(overlay!);

    expect(screen.queryByText('Secret Menu')).not.toBeInTheDocument();
  });

  it('should render all menu items with emojis', async () => {
    const user = userEvent.setup();
    render(<SecretMenu items={mockItems} />);

    await user.keyboard('{Meta>}k{/Meta}');

    expect(screen.getByText('🎉')).toBeInTheDocument();
    expect(screen.getByText('🌈')).toBeInTheDocument();
  });

  it('should call action when menu item is clicked', async () => {
    const user = userEvent.setup();
    render(<SecretMenu items={mockItems} />);

    await user.keyboard('{Meta>}k{/Meta}');

    const button = screen.getByText('Test Action 1');
    await user.click(button);

    expect(mockItems[0].action).toHaveBeenCalledTimes(1);
  });

  it('should keep menu open after action is executed', async () => {
    const user = userEvent.setup();
    render(<SecretMenu items={mockItems} />);

    await user.keyboard('{Meta>}k{/Meta}');

    const button = screen.getByText('Test Action 1');
    await user.click(button);

    // Menu should stay open to allow multiple actions
    expect(screen.getByText('Secret Menu')).toBeInTheDocument();
  });

  it('should toggle menu when Cmd+K is pressed multiple times', async () => {
    const user = userEvent.setup();
    render(<SecretMenu items={mockItems} />);

    // Open
    await user.keyboard('{Meta>}k{/Meta}');
    expect(screen.getByText('Secret Menu')).toBeInTheDocument();

    // Close
    await user.keyboard('{Meta>}k{/Meta}');
    expect(screen.queryByText('Secret Menu')).not.toBeInTheDocument();

    // Open again
    await user.keyboard('{Meta>}k{/Meta}');
    expect(screen.getByText('Secret Menu')).toBeInTheDocument();
  });

  it('should display hint text', async () => {
    const user = userEvent.setup();
    render(<SecretMenu items={mockItems} />);

    await user.keyboard('{Meta>}k{/Meta}');

    expect(screen.getByText(/Press Cmd\+K or tap ✨ to toggle/)).toBeInTheDocument();
  });
});
