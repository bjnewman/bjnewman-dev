import React, { useState, useEffect } from 'react';

interface Hook {
  id: string;
  label: string;
  emoji: string;
  action: () => void;
}

interface SecretMenuProps {
  hooks: Hook[];
}

export const SecretMenu: React.FC<SecretMenuProps> = ({ hooks }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open menu
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      // Escape to close
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="secret-menu-overlay" onClick={() => setIsOpen(false)}>
      <div className="secret-menu" onClick={(e) => e.stopPropagation()}>
        <div className="secret-menu-header">
          <h3>Secret Menu</h3>
          <p className="secret-menu-hint">Press Cmd+K to toggle</p>
        </div>
        <div className="secret-menu-items">
          {hooks.map(hook => (
            <button
              key={hook.id}
              className="secret-menu-item"
              onClick={() => {
                hook.action();
                setIsOpen(false);
              }}
            >
              <span className="secret-menu-emoji">{hook.emoji}</span>
              <span className="secret-menu-label">{hook.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
