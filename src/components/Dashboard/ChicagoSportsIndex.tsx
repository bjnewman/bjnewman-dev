import { useMemo } from 'react';
import { Counter } from './charts/Counter';
import { CubsTimeline } from './charts/CubsTimeline';
import { BullsModels } from './charts/BullsModels';
import { getChicagoSportsIndex } from './data/sportsData';

/**
 * Chicago Sports Fan Index - Tracking the emotional state of Chicago fandom.
 * Features custom visualizations for each team's unique situation.
 */
export function ChicagoSportsIndex() {
  const sportsIndex = useMemo(() => getChicagoSportsIndex(), []);

  return (
    <section className="dashboard-section chicago-sports" aria-labelledby="sports-title">
      <header className="dashboard-section__header">
        <h2 id="sports-title" className="dashboard-section__title">
          <span aria-hidden="true">🏆</span> Chicago Sports Fan Index
        </h2>
        <p className="dashboard-section__subtitle">
          Tracking the emotional state of Chicago fandom
        </p>
      </header>

      <div className="chicago-sports__grid">
        {/* Cubs - Historical Timeline (full width) */}
        <article className="team-card team-card--cautious" aria-labelledby="cubs-title">
          <header className="team-card__header">
            <span className="team-card__emoji" aria-hidden="true">🐻</span>
            <h3 id="cubs-title" className="team-card__name">Chicago Cubs</h3>
          </header>
          <div className="team-card__metric">
            <CubsTimeline />
          </div>
        </article>

        {/* Bulls - Probability Models (full width) */}
        <article className="team-card team-card--misery" aria-labelledby="bulls-title">
          <header className="team-card__header">
            <span className="team-card__emoji" aria-hidden="true">🐂</span>
            <h3 id="bulls-title" className="team-card__name">Chicago Bulls</h3>
          </header>
          <div className="team-card__metric">
            <BullsModels />
          </div>
        </article>

        {/* Bears - Celebration Mode! (full width) */}
        <article className="team-card team-card--celebration" aria-labelledby="bears-title">
          <header className="team-card__header">
            <span className="team-card__emoji" aria-hidden="true">🐻</span>
            <h3 id="bears-title" className="team-card__name">Chicago Bears</h3>
            <span className="team-card__badge" aria-label="Celebration mode">🎉</span>
          </header>
          <div className="team-card__metric team-card__metric--celebration">
            <div className="bears-celebration">
              <div className="bears-celebration__trophy">🏆</div>
              <Counter
                value={sportsIndex.bears.metric.value}
                label="Days of Glory"
                unit="days"
                description={sportsIndex.bears.metric.description}
                variant="celebration"
                size="large"
              />
              <p className="bears-celebration__subtitle">
                Since beating the Packers in the Wild Card
              </p>
            </div>
          </div>
          <p className="team-card__fun-fact">{sportsIndex.bears.funFact}</p>
        </article>
      </div>

      <footer className="chicago-sports__mood">
        <div className="chicago-sports__mood-indicator">
          <strong>Overall Fan Mood:</strong>
          <span className="mood-badge mood-badge--hopeful">
            {sportsIndex.overallMood.mood}
          </span>
        </div>
        <p className="chicago-sports__mood-description">
          {sportsIndex.overallMood.description}
        </p>
      </footer>
    </section>
  );
}
