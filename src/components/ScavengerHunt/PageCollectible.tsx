import { useScavengerHunt } from './index';
import { CollectibleItem } from './CollectibleItem';
import type { CollectibleId } from './types';

interface PageCollectibleProps {
  id: CollectibleId;
  className?: string;
}

export const PageCollectible = ({ id, className = '' }: PageCollectibleProps) => {
  const { state, isLoaded, collectItem } = useScavengerHunt();

  if (!isLoaded) return null;

  const isCollected = state.collectibles[id];

  return (
    <CollectibleItem
      id={id}
      isCollected={isCollected}
      onCollect={collectItem}
      className={className}
    />
  );
};
