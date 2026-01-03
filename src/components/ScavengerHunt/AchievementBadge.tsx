import type { Achievement, AchievementState } from './types';

interface AchievementBadgeProps {
  achievement: Achievement;
  state: AchievementState;
  size?: 'small' | 'medium' | 'large';
}

export const AchievementBadge = ({
  achievement,
  state,
  size = 'medium',
}: AchievementBadgeProps) => {
  const isUnlocked = state.unlocked;
  const progress = state.progress;

  const sizeClasses = {
    small: 'achievement-badge--small',
    medium: 'achievement-badge--medium',
    large: 'achievement-badge--large',
  };

  return (
    <div
      className={`achievement-badge ${sizeClasses[size]} ${isUnlocked ? 'achievement-badge--unlocked' : 'achievement-badge--locked'}`}
      title={isUnlocked ? achievement.description : achievement.trigger}
    >
      <div className="achievement-badge__icon">{isUnlocked ? achievement.emoji : '?'}</div>
      <div className="achievement-badge__info">
        <div className="achievement-badge__name">{isUnlocked ? achievement.name : '???'}</div>
        {isUnlocked ? (
          <div className="achievement-badge__points">+{achievement.points} pts</div>
        ) : progress !== undefined ? (
          <div className="achievement-badge__progress">Progress: {progress}</div>
        ) : null}
      </div>
    </div>
  );
};
