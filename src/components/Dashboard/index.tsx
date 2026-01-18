import { CarlosStation } from './CarlosStation';
import { HollandTimeline } from './HollandTimeline';
import { ChicagoSportsIndex } from './ChicagoSportsIndex';

/**
 * Personal Dashboard - A collection of metrics, timelines, and indices
 * that matter to me.
 */
export function Dashboard() {
  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <h1 className="dashboard__title">Dashboard</h1>
        <p className="dashboard__intro">
          A data visualization playground featuring the metrics that matter most.
        </p>
      </header>

      <div className="dashboard__grid">
        <div className="dashboard__row dashboard__row--personal">
          <CarlosStation />
          <HollandTimeline />
        </div>

        <div className="dashboard__row dashboard__row--sports">
          <ChicagoSportsIndex />
        </div>
      </div>
    </div>
  );
}

// Export individual components for potential standalone use
export { CarlosStation } from './CarlosStation';
export { HollandTimeline } from './HollandTimeline';
export { ChicagoSportsIndex } from './ChicagoSportsIndex';
export { Gauge } from './charts/Gauge';
export { Counter } from './charts/Counter';
export { Timeline } from './charts/Timeline';
