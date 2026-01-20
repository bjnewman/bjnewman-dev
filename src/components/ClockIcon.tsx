import { useEffect, useState } from 'react';

interface ClockIconProps {
  /** Change this to restart animation */
  restartKey?: number;
}

export function ClockIcon({ restartKey = 0 }: ClockIconProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(false);
    const timer = setTimeout(setIsAnimating, 100, true);
    return () => clearTimeout(timer);
  }, [restartKey]);

  return (
    <svg viewBox="0 0 100 100" className="clock-icon" aria-hidden="true">
      {/* Clock face */}
      <circle cx="50" cy="50" r="45" fill="none" stroke="#8b5cf6" strokeWidth="3" opacity="0.3" />

      {/* Hour markers */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
        <line
          key={angle}
          x1="50"
          y1="10"
          x2="50"
          y2="15"
          stroke="#8b5cf6"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.5"
          transform={`rotate(${angle} 50 50)`}
        />
      ))}

      {/* Hour hand */}
      <line
        x1="50"
        y1="50"
        x2="50"
        y2="25"
        stroke="#8b5cf6"
        strokeWidth="4"
        strokeLinecap="round"
        style={{
          transformOrigin: '50px 50px',
          transform: isAnimating ? 'rotate(150deg)' : 'rotate(0deg)',
          transition: isAnimating ? 'transform 1.5s ease-out' : 'none',
        }}
      />

      {/* Minute hand */}
      <line
        x1="50"
        y1="50"
        x2="50"
        y2="18"
        stroke="#8b5cf6"
        strokeWidth="2.5"
        strokeLinecap="round"
        style={{
          transformOrigin: '50px 50px',
          transform: isAnimating ? 'rotate(450deg)' : 'rotate(0deg)',
          transition: isAnimating ? 'transform 1.5s ease-out' : 'none',
        }}
      />

      {/* Center dot */}
      <circle cx="50" cy="50" r="4" fill="#8b5cf6" />
    </svg>
  );
}
