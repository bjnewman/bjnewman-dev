import type { Building } from './types';

type Props = {
  building: Building;
  onConfirm: () => void;
  onCancel: () => void;
};

export function BuildingDialog({ building, onConfirm, onCancel }: Props) {
  return (
    <div
      className="building-dialog"
      role="dialog"
      aria-label={`${building.name} — ${building.description}`}
      aria-modal="true"
    >
      <h2 className="building-dialog__name">{building.name}</h2>
      <p className="building-dialog__description">{building.description}</p>
      <div className="building-dialog__actions">
        <button
          className="building-dialog__btn building-dialog__btn--cancel"
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>
        <button
          className="building-dialog__btn building-dialog__btn--enter"
          onClick={onConfirm}
          type="button"
        >
          Enter
        </button>
      </div>
    </div>
  );
}
