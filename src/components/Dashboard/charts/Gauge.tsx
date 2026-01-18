import { useId, useMemo } from 'react';
import { Arc } from '@visx/shape';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { Text } from '@visx/text';

export interface GaugeProps {
  /** Current value (0-100) */
  value: number;
  /** Label displayed below the gauge */
  label: string;
  /** Description for screen readers */
  description: string;
  /** Optional thresholds for color changes */
  thresholds?: {
    low: number;
    medium: number;
    high: number;
  };
  /** Optional custom colors */
  colors?: {
    low: string;
    medium: string;
    high: string;
    critical: string;
    background: string;
  };
  /** Show the numeric value in the center */
  showValue?: boolean;
  /** Unit to display after value (e.g., '%', 'days') */
  unit?: string;
  /** Size of the gauge in pixels */
  size?: number;
  /** Whether this is a "celebration" gauge (inverts the color logic) */
  celebration?: boolean;
}

const defaultThresholds = {
  low: 25,
  medium: 50,
  high: 75,
};

const defaultColors = {
  low: '#22c55e',      // Green - good
  medium: '#f59e0b',   // Amber - warning
  high: '#ef4444',     // Red - danger
  critical: '#dc2626', // Dark red - critical
  background: '#e5e7eb', // Light gray
};

const celebrationColors = {
  low: '#22c55e',      // Still good
  medium: '#22c55e',   // Also good!
  high: '#22c55e',     // Everything is good!
  critical: '#22c55e', // CELEBRATION MODE
  background: '#e5e7eb',
};

/**
 * Accessible radial gauge component.
 * Uses SVG arc from Visx with proper ARIA attributes.
 */
export function Gauge({
  value,
  label,
  description,
  thresholds = defaultThresholds,
  colors,
  showValue = true,
  unit = '',
  size = 120,
  celebration = false,
}: GaugeProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const descId = `${id}-desc`;

  // Use celebration colors if in celebration mode
  const colorScheme = colors ?? (celebration ? celebrationColors : defaultColors);

  // Clamp value between 0 and 100
  const clampedValue = Math.max(0, Math.min(100, value));

  // Calculate the arc angles (gauge goes from -135° to 135°, 270° total)
  const startAngle = -135 * (Math.PI / 180);
  const endAngle = 135 * (Math.PI / 180);

  // Scale for converting value to angle
  const angleScale = useMemo(
    () => scaleLinear({ domain: [0, 100], range: [startAngle, endAngle] }),
    [startAngle, endAngle]
  );

  const valueAngle = angleScale(clampedValue);

  // Dimensions
  const centerX = size / 2;
  const centerY = size / 2;
  const outerRadius = (size / 2) - 8;
  const innerRadius = outerRadius - 12;

  // Determine color based on value and thresholds
  const getColor = () => {
    if (clampedValue >= thresholds.high) return colorScheme.critical;
    if (clampedValue >= thresholds.medium) return colorScheme.high;
    if (clampedValue >= thresholds.low) return colorScheme.medium;
    return colorScheme.low;
  };

  const valueColor = getColor();

  // Format display value
  const displayValue = Math.round(clampedValue);

  return (
    <div className="gauge-container">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="meter"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-labelledby={labelId}
        aria-describedby={descId}
      >
        <title id={labelId}>{label}</title>
        <desc id={descId}>{description}</desc>

        <Group top={centerY} left={centerX}>
          {/* Background arc */}
          <Arc
            startAngle={startAngle}
            endAngle={endAngle}
            outerRadius={outerRadius}
            innerRadius={innerRadius}
            fill={colorScheme.background}
          />

          {/* Value arc */}
          <Arc
            startAngle={startAngle}
            endAngle={valueAngle}
            outerRadius={outerRadius}
            innerRadius={innerRadius}
            fill={valueColor}
            className="gauge-value-arc"
          />

          {/* Center value text */}
          {showValue && (
            <>
              <Text
                textAnchor="middle"
                verticalAnchor="middle"
                dy={unit ? -4 : 0}
                fontSize={size * 0.22}
                fontWeight={600}
                fill="var(--text-primary)"
                className="gauge-value-text"
              >
                {displayValue}
              </Text>
              {unit && (
                <Text
                  textAnchor="middle"
                  verticalAnchor="middle"
                  dy={size * 0.12}
                  fontSize={size * 0.1}
                  fill="var(--text-secondary)"
                >
                  {unit}
                </Text>
              )}
            </>
          )}
        </Group>
      </svg>

      {/* Label below gauge (visible, not just for SR) */}
      <p className="gauge-label">{label}</p>

      {/* Hidden description for screen readers */}
      <p className="visually-hidden">{description}</p>
    </div>
  );
}
