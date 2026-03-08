import { useCallback, useRef } from 'react';
import { setIrisCenter } from '../transitions';

type Props = {
  buildingId: string;
};

export function DoorButton({ buildingId }: Props) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = useCallback(() => {
    localStorage.setItem('overworld-spawn', buildingId);

    // Compute iris center from button position
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setIrisCenter(rect.left + rect.width / 2, rect.top + rect.height / 2, 'exit');
    }

    // Navigate using Astro's client-side router
    import('astro:transitions/client')
      .then(({ navigate }) => navigate('/'))
      .catch(() => { window.location.href = '/'; });
  }, [buildingId]);

  return (
    <button
      ref={buttonRef}
      type="button"
      className="door-button"
      onClick={handleClick}
      aria-label="Return to village"
    >
      <span className="door-button__icon">{'\u{1F6AA}'}</span>
      <span>Village</span>
    </button>
  );
}
