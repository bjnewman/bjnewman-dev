---
title: "Building Accessible Data Visualizations with Visx"
date: "2026-01-18"
description: "Why I chose Visx for my dashboard charts, and how to make SVG visualizations accessible without sacrificing flexibility."
layout: ../../layouts/BlogPost.astro
---

Data visualization libraries fall into two camps: high-level charting libraries that make common charts easy, and low-level primitives that give you control. For my personal dashboard, I needed something in between.

## The Problem with Chart Libraries

Most charting libraries (Chart.js, Recharts, Victory) optimize for the common case. Need a bar chart? Here's a component. Line chart? Another component. But the moment you want something custom—a timeline with non-linear spacing, a horizontal bar chart comparing prediction models—you're fighting the abstraction.

I wanted to build:
- A **Cubs World Series timeline** showing 1907, 1908, 2016, and now—with visual spacing for clarity, not chronological accuracy
- A **Bulls probability chart** comparing ESPN, FiveThirtyEight, and our "Internal Model" that's always 100%
- **Radial gauges** for Carlos's hunger and sleepiness levels

These aren't standard charts. They're custom visualizations with specific visual requirements.

## Why Visx

[Visx](https://airbnb.io/visx/) (from Airbnb) sits at the perfect abstraction level. It provides:

- **Low-level SVG primitives** - `<Bar>`, `<Line>`, `<Arc>`, `<Text>` components that map directly to SVG
- **Scale utilities** - d3-scale wrappers for mapping data to pixels
- **Responsive containers** - `<ParentSize>` for charts that adapt to their container
- **React-first design** - No imperative DOM manipulation, just declarative components

Most importantly: **no opinions about what your chart should look like**.

## Accessibility First

SVG visualizations are notoriously inaccessible. Screen readers can't interpret a path's `d` attribute. Here's how we made our charts usable:

### ARIA Roles and Labels

Every chart gets proper semantic markup:

```tsx
<svg
  role="img"
  aria-label="Cubs World Series timeline: Back-to-back wins in 1907-1908,
              won again in 2016 after 108-year drought"
>
```

For gauges, we use the `meter` role with value attributes:

```tsx
<svg
  role="meter"
  aria-valuenow={75}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-labelledby={labelId}
>
  <title id={labelId}>Hunger Level</title>
```

### Hidden Descriptions

Complex visualizations need context that isn't visible:

```tsx
<desc id={descId}>
  Current hunger level at 75%. Threshold for "hangry" is 80%.
</desc>
```

### Text Alternatives

The Cubs timeline includes a caption that provides the same information visually and textually:

```tsx
<p className="cubs-timeline__caption">
  Back-to-back champs in '07-'08 (Tinker → Evers → Chance).
  Then 108 years of pain until 2016. Now 10 years into the new drought.
</p>
```

## Non-Linear Timelines

The Cubs timeline presented an interesting challenge. Showing 1907 and 1908 on a linear scale from 1900-2030 would make them overlap. But a timeline doesn't *need* to be linear.

I used position-based placement instead of a time scale:

```tsx
const TIMELINE_EVENTS = [
  { year: 1907, position: 0.06, labelOffset: -15 },
  { year: 1908, position: 0.10, labelOffset: 15 },
  { year: 2016, position: 0.75 },
  { year: 2026, position: 0.92 },
];

// Convert position (0-1) to x coordinate
const toX = (position: number) => position * innerWidth;
```

The `labelOffset` prevents year labels from overlapping—1907's label shifts left, 1908's shifts right.

## Responsive Charts

Visx's `<ParentSize>` component solves responsive SVG sizing:

```tsx
export function CubsTimeline() {
  return (
    <ParentSize>
      {({ width }) => <CubsTimelineChart width={width || 320} />}
    </ParentSize>
  );
}
```

The chart recalculates all positions when the container resizes. Combined with `width="100%"` and a `viewBox`, the SVG scales smoothly:

```tsx
<svg
  width="100%"
  height={height}
  viewBox={`0 0 ${width} ${height}`}
>
```

## The Internal Model

The Bulls probability chart compares prediction models. External models (ESPN, FiveThirtyEight, Vegas) show real-ish numbers. Our "Internal Model" is always 100% and has "never been wrong."

```tsx
const PREDICTION_MODELS = [
  { name: 'ESPN BPI', probability: 67, isInternal: false },
  { name: 'FiveThirtyEight', probability: 72, isInternal: false },
  { name: 'Vegas', probability: 58, isInternal: false },
  { name: 'NBA.com', probability: 61, isInternal: false },
  { name: 'Internal Model™', probability: 100, isInternal: true },
];
```

The internal model bar gets a distinct color and a subtle glow:

```css
.bulls-models__bar--internal {
  filter: drop-shadow(0 0 4px rgba(206, 17, 65, 0.4));
}
```

## Testing SVG Components

Testing SVG content with Testing Library requires some care. SVG text elements aren't always found by `getByText`. We use container queries and ARIA attributes instead:

```tsx
it('should have accessible role and label', () => {
  const { container } = render(<CubsTimeline />);

  const svg = container.querySelector('svg');
  expect(svg).toHaveAttribute('role', 'img');
  expect(svg).toHaveAttribute(
    'aria-label',
    expect.stringContaining('Cubs World Series timeline')
  );
});
```

For gauges, we verify the `aria-valuenow` attribute:

```tsx
it('should clamp value to max (100)', () => {
  const { container } = render(
    <Gauge value={150} label="Over Max" description="Value above maximum" />
  );

  const svg = container.querySelector('svg');
  expect(svg).toHaveAttribute('aria-valuenow', '100');
});
```

## Reduced Motion

Animated elements respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  .gauge-value-arc {
    transition: none;
  }
  .bears-celebration__trophy {
    animation: none;
  }
}
```

## Lessons Learned

1. **Pick the right abstraction level** - High-level chart libraries are great until they're not. Visx gives you escape hatches without abandoning React's mental model.

2. **Accessibility isn't optional** - Screen readers, keyboard navigation, and motion preferences need to be designed in from the start.

3. **Non-linear scales are fine** - If chronological accuracy isn't the point, optimize for visual clarity.

4. **Test what matters** - Don't fight SVG text rendering in tests. Verify ARIA attributes and semantic structure instead.

The dashboard is live at [/dashboard](/dashboard). The Cubs timeline, Bulls probability chart, and Bears celebration mode are all built with Visx and fully accessible.

---

*Built with [Visx](https://airbnb.io/visx/) and [Claude Code](https://claude.ai/claude-code).*
