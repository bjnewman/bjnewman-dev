import { useState, useEffect } from 'react';
import type { CollectibleId, Collectible } from './types';
import { collectibles } from './achievements';

interface CollectibleItemProps {
  id: CollectibleId;
  isCollected: boolean;
  onCollect: (id: CollectibleId) => void;
  className?: string;
}

export const CollectibleItem = ({
  id,
  isCollected,
  onCollect,
  className = '',
}: CollectibleItemProps) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const collectible = collectibles.find(c => c.id === id) as Collectible;

  const handleClick = () => {
    if (isCollected) return;

    onCollect(id);
    setShowCelebration(true);
  };

  useEffect(() => {
    if (showCelebration) {
      const timer = setTimeout(() => setShowCelebration(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showCelebration]);

  if (isCollected && !showCelebration) {
    // Already collected, show nothing
    return null;
  }

  return (
    <button
      className={`collectible-item ${className} ${showCelebration ? 'collectible-item--celebrating' : ''}`}
      onClick={handleClick}
      aria-label={`Discover ${collectible.name}`}
      disabled={isCollected}
    >
      {showCelebration ? (
        <span className="collectible-item__celebration">
          <span className="collectible-item__emoji">{collectible.emoji}</span>
          <span className="collectible-item__found">Found: {collectible.name}!</span>
        </span>
      ) : (
        <span className="collectible-item__shimmer" aria-hidden="true">
          {collectible.emoji}
        </span>
      )}
    </button>
  );
};
