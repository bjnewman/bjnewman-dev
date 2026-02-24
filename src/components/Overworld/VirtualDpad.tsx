import { useCallback } from 'react';

type DpadDirection = 'up' | 'down' | 'left' | 'right';

type Props = {
  onDirection: (direction: DpadDirection, pressed: boolean) => void;
  onInteract: () => void;
};

export function VirtualDpad({ onDirection, onInteract }: Props) {
  const makeHandlers = useCallback((dir: DpadDirection) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      onDirection(dir, true);
    },
    onPointerUp: () => onDirection(dir, false),
    onPointerLeave: () => onDirection(dir, false),
    onPointerCancel: () => onDirection(dir, false),
  }), [onDirection]);

  return (
    <div className="virtual-dpad" role="group" aria-label="Movement controls">
      <button
        className="virtual-dpad__btn virtual-dpad__btn--up"
        {...makeHandlers('up')}
        aria-label="Move up"
        type="button"
      >
        ▲
      </button>
      <button
        className="virtual-dpad__btn virtual-dpad__btn--left"
        {...makeHandlers('left')}
        aria-label="Move left"
        type="button"
      >
        ◄
      </button>
      <button
        className="virtual-dpad__btn virtual-dpad__btn--right"
        {...makeHandlers('right')}
        aria-label="Move right"
        type="button"
      >
        ►
      </button>
      <button
        className="virtual-dpad__btn virtual-dpad__btn--down"
        {...makeHandlers('down')}
        aria-label="Move down"
        type="button"
      >
        ▼
      </button>
      <button
        className="virtual-dpad__btn virtual-dpad__btn--interact"
        onPointerDown={(e) => {
          e.preventDefault();
          onInteract();
        }}
        aria-label="Interact"
        type="button"
      >
        E
      </button>
    </div>
  );
}
