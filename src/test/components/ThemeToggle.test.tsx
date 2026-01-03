import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '../../components/ThemeToggle';

// Mock the useThemeSwitcher hook
const mockToggleDarkMode = vi.fn();
let mockIsDarkMode = false;

vi.mock('../../components/ThemeSwitcher', () => ({
  useThemeSwitcher: () => ({
    isDarkMode: mockIsDarkMode,
    toggleDarkMode: mockToggleDarkMode,
  }),
}));

describe('ThemeToggle', () => {
  beforeEach(() => {
    mockIsDarkMode = false;
    mockToggleDarkMode.mockClear();
  });

  it('should render the toggle button', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should have correct aria-label for light mode', () => {
    mockIsDarkMode = false;
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
  });

  it('should have correct aria-label for dark mode', () => {
    mockIsDarkMode = true;
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
  });

  it('should call toggleDarkMode when clicked', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(mockToggleDarkMode).toHaveBeenCalledTimes(1);
  });

  it('should have theme-toggle class', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('theme-toggle');
  });

  it('should show moon icon as visible in light mode', () => {
    mockIsDarkMode = false;
    const { container } = render(<ThemeToggle />);
    const icons = container.querySelectorAll('.theme-toggle-icon');
    expect(icons[0]).toHaveClass('visible'); // Moon icon visible
    expect(icons[1]).toHaveClass('hidden'); // Sun icon hidden
  });

  it('should show sun icon as visible in dark mode', () => {
    mockIsDarkMode = true;
    const { container } = render(<ThemeToggle />);
    const icons = container.querySelectorAll('.theme-toggle-icon');
    expect(icons[0]).toHaveClass('hidden'); // Moon icon hidden
    expect(icons[1]).toHaveClass('visible'); // Sun icon visible
  });

  it('should render SVG icons', () => {
    const { container } = render(<ThemeToggle />);
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(2); // Sun and Moon icons
  });

  it('should have accessible title attribute', () => {
    mockIsDarkMode = false;
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Switch to dark mode');
  });
});
