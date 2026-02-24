import type { RPGPanelVariant } from './types';

type Props = {
  variant?: RPGPanelVariant;
  children: React.ReactNode;
  className?: string;
};

export function RPGPanel({ variant = 'paper', children, className = '' }: Props) {
  return (
    <div className={`rpg-panel rpg-panel--${variant} ${className}`.trim()}>
      {children}
    </div>
  );
}
