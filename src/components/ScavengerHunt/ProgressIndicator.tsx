import { useState } from 'react';
import type { ScavengerHuntState } from './types';
import { achievements } from './achievements';
import { AchievementPanel } from './AchievementPanel';

interface ProgressIndicatorProps {
  state: ScavengerHuntState;
  isLoaded: boolean;
}

export const ProgressIndicator = ({ state, isLoaded }: ProgressIndicatorProps) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showHintTooltip, setShowHintTooltip] = useState(false);

  if (!isLoaded) return null;

  const unlockedCount = Object.values(state.achievements).filter(a => a.unlocked).length;
  const totalAchievements = achievements.length;

  // Show subtle hint when no achievements unlocked yet
  if (unlockedCount === 0) {
    return (
      <button
        className="discovery-hint"
        onMouseEnter={() => setShowHintTooltip(true)}
        onMouseLeave={() => setShowHintTooltip(false)}
        onClick={() => setIsPanelOpen(true)}
        aria-label="Discover secrets hidden on this site"
      >
        <span aria-hidden="true">✨</span>
        {showHintTooltip && (
          <span className="discovery-hint__tooltip">
            Secrets await...
          </span>
        )}
        <AchievementPanel
          state={state}
          isOpen={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
        />
      </button>
    );
  }

  return (
    <>
      <button
        className={`progress-indicator ${isExpanded ? 'progress-indicator--expanded' : ''}`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        onClick={() => setIsPanelOpen(true)}
        aria-label={`${unlockedCount} of ${totalAchievements} secrets found. Click to view details.`}
      >
        {isExpanded ? (
          <span className="progress-indicator__text">
            {unlockedCount}/{totalAchievements} secrets
          </span>
        ) : (
          <span className="progress-indicator__dot" aria-hidden="true">
            {unlockedCount}
          </span>
        )}
      </button>

      <AchievementPanel
        state={state}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </>
  );
};
