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
  isActual?: boolean;
  note?: string;
}

/**
 * Preseason predictions vs actual result.
 * Every model was wrong. Our model was the most wrong.
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
    note: 'Wrong for the first time',
  },
  {
    name: 'Actual Result',
    probability: 0,
    isInternal: false,
    isActual: true,
  },
];

interface BullsModelsChartProps {
  width: number;
}

/**
 * Inner chart component that receives width from ParentSize.
 */
function BullsModelsChart({ width }: BullsModelsChartProps) {
  const height = 230;
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
      <h4 className="bulls-models__title">Play-in Probability vs Reality</h4>

      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Bulls play-in probability postmortem: all models predicted 58-100%, actual result was 0%"
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
            const barWidth = Math.max(xScale(model.probability), 0);
            const barY = yScale(model.name) ?? 0;
            const barHeight = yScale.bandwidth();

            const fill = model.isActual
              ? 'var(--text-muted)'
              : model.isInternal
                ? '#ce1141'
                : 'var(--text-muted)';

            return (
              <Group key={model.name}>
                {/* Bar — actual result is 0%, show a thin line */}
                {model.isActual ? (
                  <line
                    x1={0}
                    x2={0}
                    y1={barY}
                    y2={barY + barHeight}
                    stroke="var(--text-muted)"
                    strokeWidth={3}
                  />
                ) : (
                  <Bar
                    x={0}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    fill={fill}
                    rx={4}
                    opacity={model.isInternal ? 1 : 0.5}
                    className={model.isInternal ? 'bulls-models__bar--internal' : ''}
                  />
                )}

                {/* Model name label */}
                <Text
                  x={-8}
                  y={barY + barHeight / 2}
                  textAnchor="end"
                  verticalAnchor="middle"
                  fontSize={10}
                  fill={
                    model.isActual
                      ? 'var(--text-primary)'
                      : model.isInternal
                        ? '#ce1141'
                        : 'var(--text-secondary)'
                  }
                  fontWeight={model.isInternal || model.isActual ? 700 : 400}
                >
                  {model.name}
                </Text>

                {/* Percentage label */}
                <Text
                  x={model.isActual ? 8 : barWidth + 4}
                  y={barY + barHeight / 2}
                  textAnchor="start"
                  verticalAnchor="middle"
                  fontSize={11}
                  fill={
                    model.isActual
                      ? 'var(--text-primary)'
                      : model.isInternal
                        ? '#ce1141'
                        : 'var(--text-primary)'
                  }
                  fontWeight={model.isInternal || model.isActual ? 700 : 500}
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
        <span className="bulls-models__badge">Internal Model™</span> was wrong
        for the first time since 2021. We are recalibrating.
      </p>
    </div>
  );
}

/**
 * Bulls Play-in Probability postmortem chart.
 * Shows preseason predictions vs the grim reality.
 */
export function BullsModels() {
  return (
    <ParentSize>
      {({ width }) => <BullsModelsChart width={width || 300} />}
    </ParentSize>
  );
}
