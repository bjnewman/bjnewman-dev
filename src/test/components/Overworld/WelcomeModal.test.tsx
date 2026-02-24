import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WelcomeModal } from '../../../components/Overworld/WelcomeModal';

describe('WelcomeModal', () => {
  const onPlay = vi.fn();
  const onSkip = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('should render the modal if not seen before', () => {
    render(<WelcomeModal onPlay={onPlay} onSkip={onSkip} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Hi, I'm Ben Newman!/)).toBeInTheDocument();
  });

  it('should automatically focus the Explore Village button on mount', () => {
    render(<WelcomeModal onPlay={onPlay} onSkip={onSkip} />);
    const playBtn = screen.getByRole('button', { name: /Explore Village/i });
    expect(playBtn).toHaveFocus();
  });

  it('should call onPlay when Enter is pressed (keyboard only interaction)', async () => {
    const user = userEvent.setup();
    render(<WelcomeModal onPlay={onPlay} onSkip={onSkip} />);
    
    // The play button is automatically focused, so pressing Enter should trigger it
    await user.keyboard('{Enter}');
    expect(onPlay).toHaveBeenCalledOnce();
    expect(sessionStorage.getItem('welcome-seen')).toBe('true');
  });

  it('should call onSkip when Tab is pressed to change focus, then Enter is pressed (mixed keyboard)', async () => {
    const user = userEvent.setup();
    render(<WelcomeModal onPlay={onPlay} onSkip={onSkip} />);
    
    // Play button is focused initially. Shift+Tab to focus the skip button.
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    const skipBtn = screen.getByRole('button', { name: /View as text/i });
    expect(skipBtn).toHaveFocus();
    
    // Press Enter while skip button is focused
    await user.keyboard('{Enter}');
    expect(onSkip).toHaveBeenCalledOnce();
    expect(sessionStorage.getItem('welcome-seen')).toBe('true');
  });

  it('should call onPlay when Explore Village is clicked (mouse only)', async () => {
    const user = userEvent.setup();
    render(<WelcomeModal onPlay={onPlay} onSkip={onSkip} />);
    
    const playBtn = screen.getByRole('button', { name: /Explore Village/i });
    await user.click(playBtn);
    expect(onPlay).toHaveBeenCalledOnce();
  });

  it('should call onSkip when View as text is clicked (mouse only)', async () => {
    const user = userEvent.setup();
    render(<WelcomeModal onPlay={onPlay} onSkip={onSkip} />);
    
    const skipBtn = screen.getByRole('button', { name: /View as text/i });
    await user.click(skipBtn);
    expect(onSkip).toHaveBeenCalledOnce();
  });

  it('should not render if already seen', () => {
    sessionStorage.setItem('welcome-seen', 'true');
    render(<WelcomeModal onPlay={onPlay} onSkip={onSkip} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
