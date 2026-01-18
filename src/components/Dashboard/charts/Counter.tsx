import { useId } from 'react';

export interface CounterProps {
  /** The numeric value to display */
  value: number;
  /** Label for the counter */
  label: string;
  /** Unit to display (e.g., 'days', 'hours') */
  unit?: string;
  /** Description for screen readers */
  description: string;
  /** Visual style variant */
  variant?: 'default' | 'celebration' | 'warning' | 'muted';
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Optional subtext below the counter */
  subtext?: string;
}

/**
 * Large numeric counter display with accessibility support.
 */
export function Counter({
  value,
  label,
  unit,
  description,
  variant = 'default',
  size = 'medium',
  subtext,
}: CounterProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const descId = `${id}-desc`;

  // Format large numbers with commas
  const formattedValue = value.toLocaleString();

  return (
    <div
      className={`counter counter--${variant} counter--${size}`}
      role="status"
      aria-labelledby={labelId}
      aria-describedby={descId}
    >
      <p id={labelId} className="counter__label">{label}</p>

      <div className="counter__value-container">
        <span className="counter__value">{formattedValue}</span>
        {unit && <span className="counter__unit">{unit}</span>}
      </div>

      {subtext && <p className="counter__subtext">{subtext}</p>}

      {/* Screen reader description */}
      <p id={descId} className="visually-hidden">{description}</p>
    </div>
  );
}
