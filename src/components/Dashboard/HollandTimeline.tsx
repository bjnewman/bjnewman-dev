import { Timeline } from './charts/Timeline';
import { hollandActivities, getCurrentDayIndex } from './data/hollandData';

/**
 * Holland's Week - A timeline of activities for Uncle Ben's favorite niece.
 */
export function HollandTimeline() {
  const currentDayIndex = getCurrentDayIndex();

  return (
    <section className="dashboard-section holland-timeline" aria-labelledby="holland-title">
      <header className="dashboard-section__header">
        <h2 id="holland-title" className="dashboard-section__title">
          <span aria-hidden="true">🌟</span> Holland's Week
        </h2>
        <p className="dashboard-section__subtitle">
          Adventures in creativity and curiosity
        </p>
      </header>

      <Timeline
        activities={hollandActivities}
        currentDayIndex={currentDayIndex}
        title="Weekly Activities"
      />
    </section>
  );
}
