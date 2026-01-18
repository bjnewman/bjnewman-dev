import { useState, useEffect } from 'react';
import { Gauge } from './charts/Gauge';
import { Counter } from './charts/Counter';
import { getCarlosMetrics, type CarlosMetrics } from './data/carlosData';

/**
 * Carlos Status Board - Real-time* monitoring of the goodest boy.
 * *Real-time accuracy not guaranteed.
 */
export function CarlosStation() {
  const [metrics, setMetrics] = useState<CarlosMetrics>(getCarlosMetrics);

  // Update metrics periodically (every minute)
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(getCarlosMetrics());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="dashboard-section carlos-station" aria-labelledby="carlos-title">
      <header className="dashboard-section__header">
        <h2 id="carlos-title" className="dashboard-section__title">
          <span aria-hidden="true">🐕</span> Carlos Status Board
        </h2>
        <p className="dashboard-section__subtitle">
          Real-time monitoring of the goodest boy
        </p>
      </header>

      <div className="carlos-station__grid">
        {/* Hunger Level - Always Critical */}
        <div className="carlos-station__metric">
          <Gauge
            value={metrics.hungerLevel}
            label="Hunger Level"
            description={`Carlos's hunger level is at ${metrics.hungerLevel}%. Carlos has informed us this is always an emergency.`}
            thresholds={{ low: 25, medium: 50, high: 75 }}
            showValue={true}
            unit="%"
            size={120}
          />
          <p className="carlos-station__note">
            Carlos has informed us this is an emergency.
          </p>
        </div>

        {/* Sleepiness */}
        <div className="carlos-station__metric">
          <Gauge
            value={metrics.sleepiness}
            label="Sleepiness"
            description={`Carlos's sleepiness level is at ${metrics.sleepiness}%. This varies throughout the day based on meal times and nap schedules.`}
            thresholds={{ low: 30, medium: 60, high: 85 }}
            colors={{
              low: '#22c55e',      // Alert and active
              medium: '#f59e0b',   // Getting drowsy
              high: '#6366f1',     // Very sleepy (good for a dog!)
              critical: '#8b5cf6', // Maximum cozy
              background: '#e5e7eb',
            }}
            showValue={true}
            unit="%"
            size={120}
          />
          <p className="carlos-station__note">
            Professional napper with years of experience.
          </p>
        </div>

        {/* Walk Timer */}
        <div className="carlos-station__metric">
          <Counter
            value={metrics.minutesSinceLastWalk}
            label="Minutes Since Walk"
            unit="min"
            description={`It has been ${metrics.minutesSinceLastWalk} minutes since Carlos's last walk.`}
            variant={metrics.minutesSinceLastWalk > 180 ? 'warning' : 'default'}
            size="medium"
            subtext={metrics.minutesSinceLastWalk > 180 ? 'Walk overdue!' : 'Doing okay'}
          />
        </div>

        {/* Belly Rub Success Rate */}
        <div className="carlos-station__metric">
          <Counter
            value={metrics.bellyRubSuccessRate}
            label="Belly Rub Success"
            unit="%"
            description={`Carlos has a ${metrics.bellyRubSuccessRate}% success rate at getting belly rubs.`}
            variant="celebration"
            size="medium"
            subtext="Never been denied"
          />
        </div>

        {/* Treat Requests */}
        <div className="carlos-station__metric">
          <Counter
            value={metrics.treatRequestsToday}
            label="Treat Requests Today"
            description={`Carlos has made ${metrics.treatRequestsToday} treat requests today.`}
            variant="default"
            size="medium"
            subtext="And counting..."
          />
        </div>
      </div>
    </section>
  );
}
