import { useEffect, useState } from 'react';

interface SparklineProps {
  /** Data points (0-100 scale) */
  data: number[];
  /** Color of the line */
  color?: string;
  /** Whether to animate the line drawing */
  animate?: boolean;
  /** Change this to restart animation */
  restartKey?: number;
}

export function Sparkline({
  data,
  color = 'currentColor',
  animate = true,
  restartKey = 0,
}: SparklineProps) {
  const [isVisible, setIsVisible] = useState(!animate);

  useEffect(() => {
    if (animate) {
      setIsVisible(false);
      // Small delay before starting animation
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [animate, restartKey]);

  // Generate SVG path from data points
  const width = 100;
  const height = 40;
  const padding = 2;

  const xStep = (width - padding * 2) / (data.length - 1);
  const yScale = (height - padding * 2) / 100;

  const pathData = data
    .map((value, index) => {
      const x = padding + index * xStep;
      const y = height - padding - value * yScale;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  // Calculate path length for animation
  const pathLength = data.length * 20; // Approximate

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="sparkline"
      aria-hidden="true"
    >
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: pathLength,
          strokeDashoffset: isVisible ? 0 : pathLength,
          transition: isVisible ? 'stroke-dashoffset 1.5s ease-out' : 'none',
        }}
      />
      {/* Glow effect */}
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.2"
        style={{
          strokeDasharray: pathLength,
          strokeDashoffset: isVisible ? 0 : pathLength,
          transition: isVisible ? 'stroke-dashoffset 1.5s ease-out' : 'none',
        }}
      />
    </svg>
  );
}
