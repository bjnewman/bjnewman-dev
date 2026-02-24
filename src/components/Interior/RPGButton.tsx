type Props = {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  className?: string;
};

export function RPGButton({ children, onClick, active = false, className = '' }: Props) {
  return (
    <button
      type="button"
      className={`rpg-button ${active ? 'rpg-button--active' : ''} ${className}`.trim()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
