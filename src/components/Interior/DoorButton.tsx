import { useState, useCallback } from 'react';

type Props = {
  buildingId: string;
};

export function DoorButton({ buildingId }: Props) {
  const [fading, setFading] = useState(false);

  const handleClick = useCallback(() => {
    localStorage.setItem('overworld-spawn', buildingId);
    setFading(true);
    setTimeout(() => {
      window.location.href = '/';
    }, 300);
  }, [buildingId]);

  return (
    <>
      <button
        type="button"
        className="door-button"
        onClick={handleClick}
        aria-label="Return to village"
      >
        <span className="door-button__icon">{'\u{1F6AA}'}</span>
        <span>Village</span>
      </button>
      <div className={`interior-scene__fade ${fading ? 'interior-scene__fade--active' : ''}`} />
    </>
  );
}
