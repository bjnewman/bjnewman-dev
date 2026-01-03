import { useEffect, useRef } from 'react';
import type { ScavengerHuntState, Clue } from './types';
import { achievements, collectibles, clues } from './achievements';
import { AchievementBadge } from './AchievementBadge';

interface AchievementPanelProps {
  state: ScavengerHuntState;
  isOpen: boolean;
  onClose: () => void;
}

export const AchievementPanel = ({
  state,
  isOpen,
  onClose,
}: AchievementPanelProps) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      // Delay adding listener to avoid immediate close
      setTimeout(() => {
        window.addEventListener('click', handleClickOutside);
      }, 100);
    }
    return () => window.removeEventListener('click', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unlockedAchievements = Object.values(state.achievements).filter(a => a.unlocked).length;
  const collectedItems = Object.values(state.collectibles).filter(Boolean).length;
  const latestClue = getLatestClue(state.unlockedClues);

  return (
    <div className="achievement-panel-overlay">
      <div className="achievement-panel" ref={panelRef} role="dialog" aria-modal="true">
        <button
          className="achievement-panel__close"
          onClick={onClose}
          aria-label="Close achievements panel"
        >
          &times;
        </button>

        <div className="achievement-panel__header">
          <h2>Secret Discoveries</h2>
          <div className="achievement-panel__stats">
            <span className="achievement-panel__points">{state.totalPoints} pts</span>
            <span className="achievement-panel__progress">
              {unlockedAchievements}/{achievements.length} achievements
            </span>
          </div>
        </div>

        {latestClue && (
          <div className="achievement-panel__clue">
            <div className="achievement-panel__clue-label">Latest Clue:</div>
            <div className="achievement-panel__clue-text">{latestClue.text}</div>
          </div>
        )}

        <div className="achievement-panel__section">
          <h3>Achievements</h3>
          <div className="achievement-panel__grid">
            {achievements.map(achievement => (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                state={state.achievements[achievement.id]}
                size="medium"
              />
            ))}
          </div>
        </div>

        <div className="achievement-panel__section">
          <h3>Collectibles ({collectedItems}/{collectibles.length})</h3>
          <div className="achievement-panel__collectibles">
            {collectibles.map(collectible => {
              const isCollected = state.collectibles[collectible.id];
              return (
                <div
                  key={collectible.id}
                  className={`achievement-panel__collectible ${isCollected ? 'collected' : 'missing'}`}
                  title={isCollected ? collectible.name : `Hidden on ${collectible.page} page`}
                >
                  <span className="collectible-emoji">
                    {isCollected ? collectible.emoji : '?'}
                  </span>
                  <span className="collectible-name">
                    {isCollected ? collectible.name : '???'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

function getLatestClue(unlockedClues: string[]): Clue | null {
  if (unlockedClues.length === 0) return null;
  const latestClueId = unlockedClues[unlockedClues.length - 1];
  return clues.find(c => c.id === latestClueId) || null;
}
