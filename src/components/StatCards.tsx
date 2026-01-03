import { useState } from 'react';
import { Sparkline } from './Sparkline';
import { CrowdIcon } from './CrowdIcon';
import { ClockIcon } from './ClockIcon';

export function StatCards() {
  const [restartKeys, setRestartKeys] = useState({
    transactions: 0,
    users: 0,
    years: 0,
  });

  const restartAnimation = (key: keyof typeof restartKeys) => {
    setRestartKeys((prev) => ({ ...prev, [key]: prev[key] + 1 }));
  };

  const handleKeyDown = (key: keyof typeof restartKeys) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      restartAnimation(key);
    }
  };

  return (
    <div className="stat-cards" role="list" aria-label="Key statistics">
      {/* Transactions - Sparkline */}
      <div
        className="stat-card stat-card-clickable"
        role="listitem"
        tabIndex={0}
        onClick={() => restartAnimation('transactions')}
        onKeyDown={handleKeyDown('transactions')}
        title="Click to replay animation"
      >
        <div className="stat-sparkline">
          <Sparkline
            data={[15, 25, 22, 35, 42, 38, 55, 62, 58, 75, 82, 95]}
            color="#10b981"
            restartKey={restartKeys.transactions}
          />
        </div>
        <div className="stat-value">10M+</div>
        <div className="stat-label">transactions/day</div>
      </div>

      {/* Users - Crowd */}
      <div
        className="stat-card stat-card-clickable"
        role="listitem"
        tabIndex={0}
        onClick={() => restartAnimation('users')}
        onKeyDown={handleKeyDown('users')}
        title="Click to replay animation"
      >
        <div className="stat-sparkline">
          <CrowdIcon restartKey={restartKeys.users} />
        </div>
        <div className="stat-value">100k+</div>
        <div className="stat-label">daily users</div>
      </div>

      {/* Years - Clock */}
      <div
        className="stat-card stat-card-clickable"
        role="listitem"
        tabIndex={0}
        onClick={() => restartAnimation('years')}
        onKeyDown={handleKeyDown('years')}
        title="Click to replay animation"
      >
        <div className="stat-sparkline">
          <ClockIcon restartKey={restartKeys.years} />
        </div>
        <div className="stat-value">7+</div>
        <div className="stat-label">years experience</div>
      </div>
    </div>
  );
}
