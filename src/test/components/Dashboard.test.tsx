import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Counter } from '../../components/Dashboard/charts/Counter';
import { Gauge } from '../../components/Dashboard/charts/Gauge';
import { CubsTimeline } from '../../components/Dashboard/charts/CubsTimeline';
import { BullsModels } from '../../components/Dashboard/charts/BullsModels';
import { ChicagoSportsIndex } from '../../components/Dashboard/ChicagoSportsIndex';

describe('Counter', () => {
  it('should render the value', () => {
    render(<Counter value={42} label="Test Label" description="Test description" />);

    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('should render the label', () => {
    render(<Counter value={100} label="Days Remaining" description="Count of days" />);

    expect(screen.getByText('Days Remaining')).toBeInTheDocument();
  });

  it('should render unit when provided', () => {
    render(<Counter value={5} label="Duration" unit="hours" description="Duration in hours" />);

    expect(screen.getByText('hours')).toBeInTheDocument();
  });

  it('should render description for screen readers', () => {
    render(
      <Counter value={10} label="Count" description="Additional context for accessibility" />
    );

    // Description is visually hidden but present in the DOM
    expect(screen.getByText('Additional context for accessibility')).toBeInTheDocument();
  });

  it('should apply celebration variant class', () => {
    const { container } = render(
      <Counter value={1} label="Victory" description="Celebrating" variant="celebration" />
    );

    const counter = container.querySelector('.counter');
    expect(counter).toHaveClass('counter--celebration');
  });

  it('should apply large size class', () => {
    const { container } = render(
      <Counter value={99} label="Big Number" description="A large number" size="large" />
    );

    const counter = container.querySelector('.counter');
    expect(counter).toHaveClass('counter--large');
  });

  it('should apply small size class', () => {
    const { container } = render(
      <Counter value={7} label="Small Number" description="A small number" size="small" />
    );

    const counter = container.querySelector('.counter');
    expect(counter).toHaveClass('counter--small');
  });
});

describe('Gauge', () => {
  it('should render an SVG element', () => {
    const { container } = render(
      <Gauge value={50} label="Test Gauge" description="A test gauge" />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should render the label', () => {
    const { container } = render(
      <Gauge value={75} label="Hunger Level" description="Current hunger level" />
    );

    // Label appears in both <title> for accessibility and as visible text
    const labelElement = container.querySelector('.gauge-label');
    expect(labelElement).toHaveTextContent('Hunger Level');
  });

  it('should have accessible meter role', () => {
    const { container } = render(
      <Gauge value={30} label="Progress" description="Progress indicator" />
    );

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('role', 'meter');
  });

  it('should have aria-valuenow attribute', () => {
    const { container } = render(
      <Gauge value={60} label="Completion" description="Completion percentage" />
    );

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-valuenow', '60');
  });

  it('should have correct aria-valuenow for displayed value', () => {
    const { container } = render(
      <Gauge value={85} label="Score" description="Current score" />
    );

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-valuenow', '85');
  });

  it('should clamp value to max (100)', () => {
    const { container } = render(
      <Gauge value={150} label="Over Max" description="Value above maximum" />
    );

    // Value should be clamped to 100
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-valuenow', '100');
  });

  it('should clamp value to min (0)', () => {
    const { container } = render(
      <Gauge value={-10} label="Under Min" description="Value below minimum" />
    );

    // Value should be clamped to 0
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-valuenow', '0');
  });
});

describe('CubsTimeline', () => {
  beforeEach(() => {
    // Mock date to January 18, 2026 for consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-18'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render an SVG element', () => {
    const { container } = render(<CubsTimeline />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should have accessible role and label', () => {
    const { container } = render(<CubsTimeline />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('role', 'img');
    expect(svg).toHaveAttribute(
      'aria-label',
      expect.stringContaining('Cubs World Series timeline')
    );
  });

  it('should have aria-label mentioning back-to-back wins', () => {
    const { container } = render(<CubsTimeline />);

    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('aria-label')).toContain('Back-to-back wins');
    expect(svg?.getAttribute('aria-label')).toContain('Tinker to Evers to Chance');
  });

  it('should render caption with Tinker to Evers to Chance reference', () => {
    const { container } = render(<CubsTimeline />);

    const caption = container.querySelector('.cubs-timeline__caption');
    expect(caption).toBeInTheDocument();
    expect(caption?.textContent).toContain('Tinker');
    expect(caption?.textContent).toContain('Evers');
    expect(caption?.textContent).toContain('Chance');
  });

  it('should render caption with current drought info', () => {
    const { container } = render(<CubsTimeline />);

    const caption = container.querySelector('.cubs-timeline__caption');
    // Should mention the current drought (10 years since 2016)
    expect(caption?.textContent).toContain('10 years');
  });
});

describe('BullsModels', () => {
  it('should render an SVG element', () => {
    const { container } = render(<BullsModels />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should have accessible role and label', () => {
    const { container } = render(<BullsModels />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('role', 'img');
    expect(svg).toHaveAttribute(
      'aria-label',
      expect.stringContaining('Bulls play-in probability')
    );
  });

  it('should render the title', () => {
    render(<BullsModels />);

    expect(
      screen.getByText('Play-in Tournament Probability')
    ).toBeInTheDocument();
  });

  it('should show the Internal Model reference', () => {
    const { container } = render(<BullsModels />);

    // Check for Internal Model badge in the note
    expect(container.querySelector('.bulls-models__badge')).toHaveTextContent(
      'Internal Model™'
    );
  });

  it('should render the note about internal model accuracy', () => {
    render(<BullsModels />);

    expect(
      screen.getByText(/has correctly predicted play-in every season/)
    ).toBeInTheDocument();
  });
});

describe('ChicagoSportsIndex', () => {
  beforeEach(() => {
    // Mock date to January 18, 2026 for consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-18'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render the section title', () => {
    render(<ChicagoSportsIndex />);

    expect(screen.getByText('Chicago Sports Fan Index')).toBeInTheDocument();
  });

  it('should render all three team cards', () => {
    render(<ChicagoSportsIndex />);

    expect(screen.getByText('Chicago Cubs')).toBeInTheDocument();
    expect(screen.getByText('Chicago Bulls')).toBeInTheDocument();
    expect(screen.getByText('Chicago Bears')).toBeInTheDocument();
  });

  it('should render the overall fan mood section', () => {
    render(<ChicagoSportsIndex />);

    expect(screen.getByText('Overall Fan Mood:')).toBeInTheDocument();
  });

  it('should render Bears celebration content', () => {
    render(<ChicagoSportsIndex />);

    expect(screen.getByText('Days of Glory')).toBeInTheDocument();
    expect(
      screen.getByText('Since beating the Packers in the Wild Card')
    ).toBeInTheDocument();
  });

  it('should have proper accessibility landmarks', () => {
    render(<ChicagoSportsIndex />);

    // Should have articles for each team
    const articles = screen.getAllByRole('article');
    expect(articles.length).toBe(3);
  });

  it('should have proper heading hierarchy', () => {
    render(<ChicagoSportsIndex />);

    // Main section heading
    const mainHeading = screen.getByRole('heading', {
      name: /Chicago Sports Fan Index/,
    });
    expect(mainHeading).toBeInTheDocument();

    // Team headings
    expect(
      screen.getByRole('heading', { name: 'Chicago Cubs' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Chicago Bulls' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Chicago Bears' })
    ).toBeInTheDocument();
  });
});
