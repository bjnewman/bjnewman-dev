import { useMemo } from 'react';
import { scaleLinear, scaleBand } from '@visx/scale';
import { Group } from '@visx/group';
import { Bar } from '@visx/shape';
import { Text } from '@visx/text';
import { ParentSize } from '@visx/responsive';

interface PredictionModel {
  name: string;
  probability: number;
  isInternal: boolean;
  note?: string;
}

/**
 * Mock external model predictions (these would vary year to year).
 * Our internal model is always 100% and has "never been wrong".
 */
const PREDICTION_MODELS: PredictionModel[] = [
  { name: 'ESPN BPI', probability: 67, isInternal: false },
  { name: 'FiveThirtyEight', probability: 72, isInternal: false },
  { name: 'Vegas', probability: 58, isInternal: false },
  { name: 'NBA.com', probability: 61, isInternal: false },
  {
    name: 'Internal Model™',
    probability: 100,
    isInternal: true,
    note: 'Never been wrong',
  },
];

interface BullsModelsChartProps {
  width: number;
}

/**
 * Inner chart component that receives width from ParentSize.
 */
function BullsModelsChart({ width }: BullsModelsChartProps) {
  const height = 200;
  const margin = { top: 20, right: 40, bottom: 30, left: 90 };
  const innerWidth = Math.max(width - margin.left - margin.right, 100);
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = useMemo(
    () =>
      scaleLinear({
        domain: [0, 100],
        range: [0, innerWidth],
      }),
    [innerWidth]
  );

  const yScale = useMemo(
    () =>
      scaleBand({
        domain: PREDICTION_MODELS.map((m) => m.name),
        range: [0, innerHeight],
        padding: 0.3,
      }),
    [innerHeight]
  );

  return (
    <div className="bulls-models">
      <h4 className="bulls-models__title">Play-in Tournament Probability</h4>

      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Bulls play-in probability by model: External models range 58-72%, Internal Model at 100%"
      >
        <Group left={margin.left} top={margin.top}>
          {/* Grid lines */}
          {[25, 50, 75, 100].map((tick) => (
            <line
              key={tick}
              x1={xScale(tick)}
              x2={xScale(tick)}
              y1={0}
              y2={innerHeight}
              stroke="var(--bg-tertiary)"
              strokeDasharray="2,2"
            />
          ))}

          {/* Bars */}
          {PREDICTION_MODELS.map((model) => {
            const barWidth = xScale(model.probability);
            const barY = yScale(model.name) ?? 0;
            const barHeight = yScale.bandwidth();

            return (
              <Group key={model.name}>
                {/* Bar */}
                <Bar
                  x={0}
                  y={barY}
                  width={barWidth}
                  height={barHeight}
                  fill={model.isInternal ? '#ce1141' : 'var(--text-muted)'}
                  rx={4}
                  className={model.isInternal ? 'bulls-models__bar--internal' : ''}
                />

                {/* Model name label */}
                <Text
                  x={-8}
                  y={barY + barHeight / 2}
                  textAnchor="end"
                  verticalAnchor="middle"
                  fontSize={10}
                  fill={model.isInternal ? '#ce1141' : 'var(--text-secondary)'}
                  fontWeight={model.isInternal ? 700 : 400}
                >
                  {model.name}
                </Text>

                {/* Percentage label */}
                <Text
                  x={barWidth + 4}
                  y={barY + barHeight / 2}
                  textAnchor="start"
                  verticalAnchor="middle"
                  fontSize={11}
                  fill={model.isInternal ? '#ce1141' : 'var(--text-primary)'}
                  fontWeight={model.isInternal ? 700 : 500}
                >
                  {`${model.probability}%`}
                </Text>
              </Group>
            );
          })}

          {/* X-axis labels */}
          {[0, 50, 100].map((tick) => (
            <Text
              key={tick}
              x={xScale(tick)}
              y={innerHeight + 15}
              textAnchor="middle"
              fontSize={9}
              fill="var(--text-muted)"
            >
              {`${tick}%`}
            </Text>
          ))}
        </Group>
      </svg>

      <p className="bulls-models__note">
        <span className="bulls-models__badge">Internal Model™</span> has correctly
        predicted play-in every season since 2021.
      </p>
    </div>
  );
}

/**
 * Bulls Play-in Probability comparison chart.
 * Shows external models vs our infallible internal prediction.
 */
export function BullsModels() {
  return (
    <ParentSize>
      {({ width }) => <BullsModelsChart width={width || 300} />}
    </ParentSize>
  );
}
