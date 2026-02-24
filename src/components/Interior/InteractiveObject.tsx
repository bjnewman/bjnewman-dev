type Props = {
  id: string;
  label: string;
  x: string;
  y: string;
  width: string;
  height: string;
  onClick: () => void;
};

export function InteractiveObject({ id, label, x, y, width, height, onClick }: Props) {
  return (
    <button
      type="button"
      className="interactive-object"
      aria-label={label}
      onClick={onClick}
      data-object-id={id}
      style={{
        left: x,
        top: y,
        width,
        height,
      }}
    >
      <span className="interactive-object__tooltip">{label}</span>
    </button>
  );
}
