import { Group } from '@visx/group';
import { Line } from '@visx/shape';
import { Text } from '@visx/text';
import { ParentSize } from '@visx/responsive';

interface TimelineEvent {
  year: number;
  label: string;
  type: 'championship' | 'current';
  position: number; // 0-1 position along the timeline (not linear by year)
  labelOffset?: number; // vertical offset for label to prevent overlap
}

// Positioned for visual clarity, not linear time scale
const TIMELINE_EVENTS: TimelineEvent[] = [
  { year: 1907, label: 'World Series', type: 'championship', position: 0.06, labelOffset: -15 },
  { year: 1908, label: 'World Series', type: 'championship', position: 0.10, labelOffset: 15 },
  { year: 2016, label: 'World Series', type: 'championship', position: 0.75 },
  { year: 2026, label: 'You are here', type: 'current', position: 0.92 },
];

interface CubsTimelineChartProps {
  width: number;
}

/**
 * Inner chart component that receives width from ParentSize.
 */
function CubsTimelineChart({ width }: CubsTimelineChartProps) {
  const height = 120;
  const margin = { top: 20, right: 20, bottom: 30, left: 20 };
  const innerWidth = Math.max(width - margin.left - margin.right, 100);
  const innerHeight = height - margin.top - margin.bottom;

  // Convert position (0-1) to x coordinate
  const toX = (position: number) => position * innerWidth;

  const currentYear = new Date().getFullYear();
  const yearsSince2016 = currentYear - 2016;

  // Get positions for drought lines
  const pos1908 = TIMELINE_EVENTS.find(e => e.year === 1908)!.position;
  const pos2016 = TIMELINE_EVENTS.find(e => e.year === 2016)!.position;
  const posCurrent = TIMELINE_EVENTS.find(e => e.type === 'current')!.position;

  return (
    <div className="cubs-timeline">
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Cubs World Series timeline: Back-to-back wins in 1907-1908 with Tinker to Evers to Chance, won again in 2016 after 108-year drought, currently ${yearsSince2016} years into new drought`}
      >
        <Group left={margin.left} top={margin.top}>
          {/* Timeline base line */}
          <Line
            from={{ x: 0, y: innerHeight / 2 }}
            to={{ x: innerWidth, y: innerHeight / 2 }}
            stroke="var(--text-muted)"
            strokeWidth={2}
          />

          {/* Drought period 1: 1908-2016 (108 years) */}
          <Line
            from={{ x: toX(pos1908), y: innerHeight / 2 }}
            to={{ x: toX(pos2016), y: innerHeight / 2 }}
            stroke="#ef4444"
            strokeWidth={6}
            strokeLinecap="round"
            opacity={0.6}
          />

          {/* Current drought: 2016-now */}
          <Line
            from={{ x: toX(pos2016), y: innerHeight / 2 }}
            to={{ x: toX(posCurrent), y: innerHeight / 2 }}
            stroke="#f59e0b"
            strokeWidth={6}
            strokeLinecap="round"
          />

          {/* Championship markers */}
          {TIMELINE_EVENTS.map((event) => {
            const x = toX(event.position);
            const isChampionship = event.type === 'championship';
            const isCurrent = event.type === 'current';

            return (
              <Group key={event.year}>
                {/* Marker circle */}
                <circle
                  cx={x}
                  cy={innerHeight / 2}
                  r={isChampionship ? 10 : 8}
                  fill={
                    isChampionship
                      ? '#0e3386' // Cubs blue
                      : isCurrent
                      ? '#f59e0b'
                      : 'var(--text-muted)'
                  }
                  stroke="white"
                  strokeWidth={2}
                />

                {/* Trophy icon for championships */}
                {isChampionship && (
                  <Text
                    x={x}
                    y={innerHeight / 2 - 20}
                    textAnchor="middle"
                    fontSize={14}
                  >
                    🏆
                  </Text>
                )}

                {/* Year label */}
                <Text
                  x={x + (event.labelOffset ?? 0)}
                  y={innerHeight / 2 + 25}
                  textAnchor="middle"
                  fontSize={11}
                  fill="var(--text-primary)"
                  fontWeight={isChampionship || isCurrent ? 600 : 400}
                >
                  {`${event.year}`}
                </Text>

                {/* Event label */}
                {isCurrent && (
                  <Text
                    x={x}
                    y={innerHeight / 2 - 18}
                    textAnchor="middle"
                    fontSize={9}
                    fill="var(--text-secondary)"
                  >
                    📍 Now
                  </Text>
                )}
              </Group>
            );
          })}

          {/* Drought length annotations */}
          <Text
            x={toX((pos1908 + pos2016) / 2)}
            y={innerHeight / 2 - 8}
            textAnchor="middle"
            fontSize={10}
            fill="#ef4444"
            fontWeight={500}
          >
            108 years
          </Text>

          <Text
            x={toX((pos2016 + posCurrent) / 2)}
            y={innerHeight / 2 - 8}
            textAnchor="middle"
            fontSize={10}
            fill="#f59e0b"
            fontWeight={500}
          >
            {`${yearsSince2016}y`}
          </Text>
        </Group>
      </svg>

      <p className="cubs-timeline__caption">
        Back-to-back champs in '07-'08 (Tinker → Evers → Chance). Then 108 years of pain until 2016. Now {yearsSince2016} years into the new drought.
      </p>
    </div>
  );
}

/**
 * Cubs World Series timeline showing the historic droughts.
 * 108 years between 1908 and 2016. Currently in year 10 of the new drought.
 */
export function CubsTimeline() {
  return (
    <ParentSize>
      {({ width }) => <CubsTimelineChart width={width || 320} />}
    </ParentSize>
  );
}
