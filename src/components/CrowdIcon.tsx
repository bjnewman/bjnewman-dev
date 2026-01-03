import { useEffect, useState } from 'react';

// Positions for crowd formation (like a triangle/group)
const crowdPositions = [
  { x: 50, y: 20 }, // Leader
  { x: 35, y: 35 }, // Row 2
  { x: 65, y: 35 },
  { x: 20, y: 50 }, // Row 3
  { x: 50, y: 50 },
  { x: 80, y: 50 },
  { x: 12, y: 65 }, // Row 4
  { x: 36, y: 65 },
  { x: 64, y: 65 },
  { x: 88, y: 65 },
  { x: 5, y: 80 }, // Row 5
  { x: 26, y: 80 },
  { x: 50, y: 80 },
  { x: 74, y: 80 },
  { x: 95, y: 80 },
];

interface CrowdIconProps {
  /** Change this to restart animation */
  restartKey?: number;
}

export function CrowdIcon({ restartKey = 0 }: CrowdIconProps) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    setVisibleCount(0);

    const interval = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= crowdPositions.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [restartKey]);

  return (
    <svg viewBox="0 0 100 100" className="crowd-icon" aria-hidden="true">
      {crowdPositions.map((pos, index) => (
        <g
          key={index}
          style={{
            opacity: index < visibleCount ? 1 : 0,
            transform: index < visibleCount ? 'scale(1)' : 'scale(0)',
            transformOrigin: `${pos.x}px ${pos.y}px`,
            transition: 'opacity 0.2s ease-out, transform 0.3s ease-out',
          }}
        >
          {/* Head */}
          <circle cx={pos.x} cy={pos.y - 5} r="5" fill="#3b82f6" />
          {/* Body */}
          <ellipse cx={pos.x} cy={pos.y + 6} rx="6" ry="8" fill="#3b82f6" opacity="0.7" />
        </g>
      ))}
    </svg>
  );
}
