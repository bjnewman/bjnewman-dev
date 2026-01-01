import React, { useState, useEffect } from 'react';

interface MenuItem {
  id: string;
  label: string;
  emoji: string;
  action: () => void;
}

interface SecretMenuProps {
  items: MenuItem[];
  onToggle?: (isOpen: boolean) => void;
}

export const SecretMenu: React.FC<SecretMenuProps> = ({ items, onToggle }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = (open: boolean) => {
    setIsOpen(open);
    onToggle?.(open);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open menu
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleMenu(!isOpen);
      }
      // Escape to close
      if (e.key === 'Escape') {
        toggleMenu(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="secret-menu-overlay" onClick={() => toggleMenu(false)}>
      <div className="secret-menu" onClick={(e) => e.stopPropagation()}>
        <div className="secret-menu-header">
          <h3>Secret Menu</h3>
          <p className="secret-menu-hint">Press Cmd+K or tap ✨ to toggle</p>
        </div>
        <div className="secret-menu-items">
          {items.map(item => {
            const isDivider = item.id.includes('divider');
            return (
              <button
                key={item.id}
                className={`secret-menu-item ${isDivider ? 'divider' : ''}`}
                onClick={() => {
                  if (!isDivider) {
                    item.action();
                  }
                  // Don't close menu - let user click multiple features
                }}
                disabled={isDivider}
              >
                {item.emoji && <span className="secret-menu-emoji">{item.emoji}</span>}
                <span className="secret-menu-label">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
