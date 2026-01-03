import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FunFormFields, FunModeToggle } from '../../components/FunFormFields';

describe('FunModeToggle', () => {
  beforeEach(() => {
    cleanup();
  });

  it('renders with inactive state', () => {
    const onToggle = () => {};
    render(<FunModeToggle isActive={false} onToggle={onToggle} />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Boring Form?');
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('renders with active state', () => {
    const onToggle = () => {};
    render(<FunModeToggle isActive={true} onToggle={onToggle} />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Fun Mode: ON');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onToggle when clicked', async () => {
    const user = userEvent.setup();
    let toggleCount = 0;
    const onToggle = () => {
      toggleCount++;
    };

    render(<FunModeToggle isActive={false} onToggle={onToggle} />);

    await user.click(screen.getByRole('button'));
    expect(toggleCount).toBe(1);
  });
});

describe('FunFormFields', () => {
  beforeEach(() => {
    cleanup();
  });

  it('does not render when not visible', () => {
    render(<FunFormFields isVisible={false} />);

    expect(screen.queryByText('Fun Mode')).not.toBeInTheDocument();
  });

  it('renders when visible', () => {
    render(<FunFormFields isVisible={true} />);

    expect(screen.getByText('Fun Mode')).toBeInTheDocument();
    expect(screen.getByText(/These don't do anything/)).toBeInTheDocument();
  });

  it('renders urgency slider', () => {
    render(<FunFormFields isVisible={true} />);

    expect(screen.getByLabelText(/Rate Your Urgency/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Rate Your Urgency/)).toHaveAttribute('type', 'range');
  });

  it('updates urgency description when slider changes', () => {
    render(<FunFormFields isVisible={true} />);

    const slider = screen.getByLabelText(/Rate Your Urgency/);

    // Initial description at value 1
    expect(screen.getByText(/Whenever you get around to it/)).toBeInTheDocument();

    // Change to high urgency using fireEvent
    fireEvent.change(slider, { target: { value: '100' } });

    // Check for high urgency description
    expect(screen.getByText(/THE BUILDING IS ON FIRE/)).toBeInTheDocument();
  });

  it('renders contact method options', () => {
    render(<FunFormFields isVisible={true} />);

    expect(screen.getByText('Preferred Contact Method')).toBeInTheDocument();
    expect(screen.getByText(/Carrier Pigeon/)).toBeInTheDocument();
    expect(screen.getByText(/Smoke Signals/)).toBeInTheDocument();
    expect(screen.getByText(/Telepathy/)).toBeInTheDocument();
  });

  it('allows selecting contact method', async () => {
    const user = userEvent.setup();
    render(<FunFormFields isVisible={true} />);

    const pigeonButton = screen.getByRole('button', { name: /Carrier Pigeon/ });
    await user.click(pigeonButton);

    expect(pigeonButton).toHaveClass('contact-method--selected');
  });

  it('renders slot machine phone input', () => {
    render(<FunFormFields isVisible={true} />);

    expect(screen.getByText(/World's Worst Phone Input/)).toBeInTheDocument();
    // Default is (555) 555-5555
    expect(screen.getByText('(555) 555-5555')).toBeInTheDocument();
    // Should have 10 slot digit displays
    const digitDisplays = screen.getAllByRole('button', { name: /Spin digit/ });
    expect(digitDisplays).toHaveLength(10);
  });

  it('renders slot machine with spin hint', () => {
    render(<FunFormFields isVisible={true} />);

    expect(screen.getByText(/Click digits to spin individually/)).toBeInTheDocument();
  });

  it('renders Spin All button', () => {
    render(<FunFormFields isVisible={true} />);

    expect(screen.getByRole('button', { name: /Spin All/ })).toBeInTheDocument();
  });
});
