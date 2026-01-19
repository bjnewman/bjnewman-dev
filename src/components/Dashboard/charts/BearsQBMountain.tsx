import { useMemo } from 'react';
import { scaleLinear, scaleBand } from '@visx/scale';
import { Group } from '@visx/group';
import { Text } from '@visx/text';
import { ParentSize } from '@visx/responsive';
import { LinearGradient } from '@visx/gradient';

interface QBPeak {
  year: number;
  name: string;
  effectiveness: number;
  label: string;
}

/**
 * Notable Bears QB peaks - the ones worth showing as mountains.
 * Scale: 0 = replacement level, 100 = Mount Everest (Caleb 2025)
 */
const QB_PEAKS: QBPeak[] = [
  { year: 1985, name: 'McMahon', effectiveness: 45, label: "'85" },
  { year: 1995, name: 'Kramer', effectiveness: 35, label: "'95" },
  { year: 2010, name: 'Cutler', effectiveness: 28, label: "'10" },
  { year: 2021, name: 'Fields', effectiveness: 25, label: "'21" },
  { year: 2025, name: 'Caleb', effectiveness: 100, label: "'25" },
];

/**
 * Rocky mountain silhouette - smooth slopes with jagged peak.
 * Centered at origin, base width ~100, main peak at top.
 */
const MOUNTAIN_PATH = `
  M -50 0
  L -15 -70
  L -8 -65
  L -3 -85
  L 0 -100
  L 5 -80
  L 10 -88
  L 18 -65
  L 50 0
  Z
`;

/**
 * Snow cap path for icy peaks - covers the jagged summit.
 */
const SNOW_CAP_PATH = `
  M -15 -70
  L -8 -65
  L -3 -85
  L 0 -100
  L 5 -80
  L 10 -88
  L 18 -65
  L 12 -72
  L 5 -68
  L 0 -82
  L -5 -70
  L -10 -74
  Z
`;

interface BearsQBMountainChartProps {
  width: number;
}

function BearsQBMountainChart({ width }: BearsQBMountainChartProps) {
  const height = 180;
  const margin = { top: 20, right: 15, bottom: 40, left: 15 };
  const innerWidth = Math.max(width - margin.left - margin.right, 100);
  const innerHeight = height - margin.top - margin.bottom;

  // X scale - position mountains evenly
  const xScale = useMemo(
    () =>
      scaleBand({
        domain: QB_PEAKS.map((d) => d.year),
        range: [0, innerWidth],
        padding: 0.2,
      }),
    [innerWidth]
  );

  // Scale factor for mountains (effectiveness → scale multiplier)
  const scaleMultiplier = useMemo(
    () =>
      scaleLinear({
        domain: [0, 100],
        range: [0.2, 1.0], // 20% to 100% scale
      }),
    []
  );

  // Max mountain height in pixels
  const maxMountainHeight = innerHeight * 0.85;

  return (
    <div className="bears-qb-mountain">
      <h4 className="bears-qb-mountain__title">QB Effectiveness Mountain Range</h4>

      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Bears quarterback effectiveness shown as mountains: McMahon and Kramer as small peaks, Cutler and Fields as foothills, and Caleb Williams as a towering icy mountain"
      >
        <defs>
          {/* Rocky mountain gradient - warm brown/tan like real mountains */}
          <LinearGradient id="rock-gradient" from="#a8896c" to="#5c4033" vertical>
            <stop offset="0%" stopColor="#c4a77d" />
            <stop offset="30%" stopColor="#a8896c" />
            <stop offset="70%" stopColor="#7a5c45" />
            <stop offset="100%" stopColor="#5c4033" />
          </LinearGradient>

          {/* Icy mountain gradient for Caleb */}
          <LinearGradient id="ice-gradient" from="#bfdbfe" to="#1e40af" vertical>
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="20%" stopColor="#bfdbfe" />
            <stop offset="50%" stopColor="#60a5fa" />
            <stop offset="80%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1e40af" />
          </LinearGradient>

          {/* Snow cap white */}
          <LinearGradient id="snow-gradient" from="#ffffff" to="#e0f2fe" vertical>
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e0f2fe" />
          </LinearGradient>

          {/* Subtle shadow for depth on rock mountains */}
          <LinearGradient id="rock-shadow" from="#5c4033" to="#3d2817" vertical>
            <stop offset="0%" stopColor="#5c4033" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3d2817" stopOpacity="0.6" />
          </LinearGradient>

          {/* Glow filter for ice mountain */}
          <filter id="ice-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feFlood floodColor="#60a5fa" floodOpacity="0.4" />
            <feComposite in2="blur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <Group left={margin.left} top={margin.top}>
          {/* Ground line */}
          <line
            x1={0}
            x2={innerWidth}
            y1={innerHeight}
            y2={innerHeight}
            stroke="var(--bg-tertiary)"
            strokeWidth={2}
          />

          {/* Render mountains - sorted by effectiveness so smaller ones render first (back) */}
          {[...QB_PEAKS]
            .sort((a, b) => a.effectiveness - b.effectiveness)
            .map((peak) => {
              const x = (xScale(peak.year) ?? 0) + xScale.bandwidth() / 2;
              const scale = scaleMultiplier(peak.effectiveness);
              const mountainHeight = maxMountainHeight * scale;
              const isCaleb = peak.name === 'Caleb';

              return (
                <Group
                  key={peak.year}
                  transform={`translate(${x}, ${innerHeight})`}
                >
                  {/* Mountain shape */}
                  <path
                    d={MOUNTAIN_PATH}
                    transform={`scale(${scale * 0.8}, ${scale})`}
                    fill={isCaleb ? 'url(#ice-gradient)' : 'url(#rock-gradient)'}
                    filter={isCaleb ? 'url(#ice-glow)' : undefined}
                    opacity={isCaleb ? 1 : 0.85}
                  />

                  {/* Snow cap for Caleb's peak */}
                  {isCaleb && (
                    <path
                      d={SNOW_CAP_PATH}
                      transform={`scale(${scale * 0.8}, ${scale})`}
                      fill="url(#snow-gradient)"
                    />
                  )}

                  {/* QB name label */}
                  <Text
                    x={0}
                    y={-mountainHeight - 8}
                    textAnchor="middle"
                    fontSize={isCaleb ? 11 : 9}
                    fontWeight={isCaleb ? 700 : 500}
                    fill={isCaleb ? '#1e40af' : 'var(--text-secondary)'}
                  >
                    {peak.name}
                  </Text>

                  {/* Year label below */}
                  <Text
                    x={0}
                    y={16}
                    textAnchor="middle"
                    fontSize={8}
                    fill="var(--text-muted)"
                  >
                    {peak.label}
                  </Text>
                </Group>
              );
            })}

          {/* Baseline label */}
          <Text
            x={0}
            y={innerHeight + 32}
            textAnchor="start"
            fontSize={7}
            fill="var(--text-muted)"
            fontStyle="italic"
          >
            40 years of QB peaks
          </Text>
        </Group>
      </svg>
    </div>
  );
}

/**
 * Bears QB Mountain - A "scientific" visualization of Bears QB effectiveness.
 * Each QB is represented as a mountain scaled to their effectiveness rating.
 */
export function BearsQBMountain() {
  return (
    <ParentSize>
      {({ width }) => <BearsQBMountainChart width={width || 300} />}
    </ParentSize>
  );
}
