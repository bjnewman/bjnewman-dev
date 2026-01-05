import { describe, it, expect } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SkillsGrid } from '../../components/SkillsGrid';

describe('SkillsGrid', () => {
  it('should render all skill categories', () => {
    render(<SkillsGrid />);

    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Backend')).toBeInTheDocument();
    expect(screen.getByText('Cloud & DevOps')).toBeInTheDocument();
    expect(screen.getByText('Architecture')).toBeInTheDocument();
    expect(screen.getByText('Leadership')).toBeInTheDocument();
  });

  it('should show preview tags when category is collapsed', () => {
    render(<SkillsGrid />);

    // Frontend should show first 3 skills as preview tags
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
  });

  it('should expand category when clicked and show skill bars', async () => {
    const user = userEvent.setup();
    render(<SkillsGrid />);

    // Click Frontend header to expand
    const frontendButton = screen.getByRole('button', { name: /Frontend/ });
    await user.click(frontendButton);

    // Should show skill bars with level labels (React is level 5)
    expect(screen.getByText("Send help, I'm the expert now")).toBeInTheDocument();
    // Should show React skill name in the expanded content
    const frontendCategory = frontendButton.closest('.skills-category') as HTMLElement;
    expect(within(frontendCategory).getByText('React')).toBeInTheDocument();
  });

  it('should collapse expanded category when clicked again', async () => {
    const user = userEvent.setup();
    render(<SkillsGrid />);

    const frontendButton = screen.getByRole('button', { name: /Frontend/ });

    // Expand
    await user.click(frontendButton);
    expect(screen.getByText("Send help, I'm the expert now")).toBeInTheDocument();

    // Collapse
    await user.click(frontendButton);
    expect(screen.queryByText("Send help, I'm the expert now")).not.toBeInTheDocument();
  });

  it('should move category to top when expanded', async () => {
    const user = userEvent.setup();
    render(<SkillsGrid />);

    const frontendButton = screen.getByRole('button', { name: /Frontend/ });
    const archButton = screen.getByRole('button', { name: /Architecture/ });

    // Get initial positions
    const frontendRect = frontendButton.getBoundingClientRect();
    const archRect = archButton.getBoundingClientRect();
    expect(frontendRect.top).toBeLessThan(archRect.top); // Frontend starts above Architecture

    // Expand Architecture
    await user.click(archButton);

    // Wait for animation to complete and Architecture to move to top
    await waitFor(
      () => {
        const archRectAfter = archButton.getBoundingClientRect();
        expect(archRectAfter.top).toBeLessThanOrEqual(frontendRect.top);
      },
      { timeout: 1000 }
    );
  });

  it('should close expanded category when content area is clicked', async () => {
    const user = userEvent.setup();
    render(<SkillsGrid />);

    const frontendButton = screen.getByRole('button', { name: /Frontend/ });
    await user.click(frontendButton);

    // Category is expanded
    expect(screen.getByText("Send help, I'm the expert now")).toBeInTheDocument();

    // Click the content area (the button wrapping the skill bars)
    const closeButton = screen.getByRole('button', { name: /Close Frontend details/ });
    await user.click(closeButton);

    // Category should be collapsed
    expect(screen.queryByText("Send help, I'm the expert now")).not.toBeInTheDocument();
  });

  it('should collapse previous category when new one is expanded', async () => {
    const user = userEvent.setup();
    render(<SkillsGrid />);

    // Expand Frontend
    const frontendButton = screen.getByRole('button', { name: /Frontend/ });
    await user.click(frontendButton);
    expect(screen.getByText("Send help, I'm the expert now")).toBeInTheDocument();

    // Expand Backend
    const backendButton = screen.getByRole('button', { name: /Backend/ });
    await user.click(backendButton);

    // Frontend should be collapsed (no level 5 label visible)
    expect(screen.queryByText("Send help, I'm the expert now")).not.toBeInTheDocument();
    // Backend should be expanded - check for Node.js skill name
    const backendCategory = backendButton.closest('.skills-category') as HTMLElement;
    expect(within(backendCategory).getByText('Node.js')).toBeInTheDocument();
  });

  it('should have proper aria-expanded attributes', async () => {
    const user = userEvent.setup();
    render(<SkillsGrid />);

    const frontendButton = screen.getByRole('button', { name: /Frontend/ });
    expect(frontendButton).toHaveAttribute('aria-expanded', 'false');

    await user.click(frontendButton);
    expect(frontendButton).toHaveAttribute('aria-expanded', 'true');

    await user.click(frontendButton);
    expect(frontendButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('should show + toggle for collapsed and - for expanded', async () => {
    const user = userEvent.setup();
    render(<SkillsGrid />);

    const frontendButton = screen.getByRole('button', { name: /Frontend/ });

    // Initially shows +
    expect(within(frontendButton).getByText('+')).toBeInTheDocument();

    await user.click(frontendButton);

    // After expansion shows −
    expect(within(frontendButton).getByText('−')).toBeInTheDocument();
  });
});
