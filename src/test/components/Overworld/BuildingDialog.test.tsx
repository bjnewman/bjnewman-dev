import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BuildingDialog } from '../../../components/Overworld/BuildingDialog';
import { buildings } from '../../../components/Overworld/mapData';

describe('BuildingDialog', () => {
  const building = buildings[0]; // Town Hall
  const onConfirm = vi.fn();
  const onCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render building name and description', () => {
    render(<BuildingDialog building={building} onConfirm={onConfirm} onCancel={onCancel} />);

    expect(screen.getByText(building.name)).toBeInTheDocument();
    expect(screen.getByText(building.description)).toBeInTheDocument();
  });

  it('should have Enter and Cancel buttons', () => {
    render(<BuildingDialog building={building} onConfirm={onConfirm} onCancel={onCancel} />);

    expect(screen.getByRole('button', { name: /enter/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should call onConfirm when Enter is clicked', async () => {
    const user = userEvent.setup();
    render(<BuildingDialog building={building} onConfirm={onConfirm} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: /enter/i }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('should call onCancel when Cancel is clicked (mouse only)', async () => {
    const user = userEvent.setup();
    render(<BuildingDialog building={building} onConfirm={onConfirm} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('should automatically focus the Enter button on mount', () => {
    render(<BuildingDialog building={building} onConfirm={onConfirm} onCancel={onCancel} />);

    const enterBtn = screen.getByRole('button', { name: /enter/i });
    expect(enterBtn).toHaveFocus();
  });

  it('should call onConfirm when Enter is pressed (keyboard only interaction)', async () => {
    const user = userEvent.setup();
    render(<BuildingDialog building={building} onConfirm={onConfirm} onCancel={onCancel} />);

    // The Enter button is focused on mount, so pressing Enter on keyboard should trigger it
    await user.keyboard('{Enter}');
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('should call onCancel when Tab is pressed to change focus, then Enter is pressed (mixed keyboard)', async () => {
    const user = userEvent.setup();
    render(<BuildingDialog building={building} onConfirm={onConfirm} onCancel={onCancel} />);

    // Enter button is focused initially. Shift+Tab to focus the Cancel button.
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    expect(cancelBtn).toHaveFocus();

    // Press Enter while Cancel button is focused
    await user.keyboard('{Enter}');
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('should have role=dialog and aria-label', () => {
    render(<BuildingDialog building={building} onConfirm={onConfirm} onCancel={onCancel} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-label', expect.stringContaining(building.name));
  });
});
