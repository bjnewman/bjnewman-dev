import { SecretMenu } from './components/SecretMenu';
import { useConfetti } from './components/ConfettiCannon';
import { useMusicPlayer } from './components/MusicPlayer';
import { useThemeSwitcher, themes } from './components/ThemeSwitcher';
import { useHollandDecorations } from './components/HollandDecorations';
import { useState, useEffect } from 'react';

function SecretFeatures() {
  const { fireConfetti, ConfettiRender } = useConfetti();
  const { toggleMusic, MusicIndicator } = useMusicPlayer();
  const { currentTheme, switchTheme } = useThemeSwitcher();
  const { spawnUnicorns, spawnRainbows, spawnIceCream, spawnStars, spawnHearts, DecorationsRender } = useHollandDecorations();
  const [menuDiscovered, setMenuDiscovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Check if user has discovered the menu before
    const discovered = localStorage.getItem('secret-menu-discovered') === 'true';
    setMenuDiscovered(discovered);
  }, []);

  const handleMenuToggle = (open: boolean) => {
    setIsMenuOpen(open);
    if (open && !menuDiscovered) {
      localStorage.setItem('secret-menu-discovered', 'true');
      setMenuDiscovered(true);
    }
  };

  // Create theme menu items
  const themeItems = themes.map(theme => ({
    id: `theme-${theme.id}`,
    label: theme.name,
    emoji: theme.emoji,
    action: () => switchTheme(theme.id),
  }));

  const menuItems = [
    {
      id: 'confetti',
      label: 'Party Mode (Confetti!)',
      emoji: '🎉',
      action: fireConfetti,
    },
    {
      id: 'music',
      label: 'Elevator Music',
      emoji: '🎵',
      action: toggleMusic,
    },
    {
      id: 'themes-divider',
      label: '— Themes —',
      emoji: '🎨',
      action: () => {}, // Divider, no action
    },
    ...themeItems,
    {
      id: 'holland-divider',
      label: "— Holland's Magic —",
      emoji: '✨',
      action: () => {}, // Divider
    },
    {
      id: 'holland-unicorns',
      label: 'Spawn Unicorns',
      emoji: '🦄',
      action: spawnUnicorns,
    },
    {
      id: 'holland-rainbows',
      label: 'Spawn Rainbows',
      emoji: '🌈',
      action: spawnRainbows,
    },
    {
      id: 'holland-icecream',
      label: 'Spawn Ice Cream',
      emoji: '🍦',
      action: spawnIceCream,
    },
    {
      id: 'holland-stars',
      label: 'Spawn Stars',
      emoji: '⭐',
      action: spawnStars,
    },
    {
      id: 'holland-hearts',
      label: 'Spawn Hearts',
      emoji: '💕',
      action: spawnHearts,
    },
    {
      id: 'holland-page-divider',
      label: '—',
      emoji: '',
      action: () => {}, // Divider
    },
    {
      id: 'holland',
      label: "Holland's Secret Page",
      emoji: '🚪',
      action: () => {
        window.location.href = '/holland/';
      },
    },
  ];

  return (
    <>
      <SecretMenu items={menuItems} onToggle={handleMenuToggle} />
      <MusicIndicator />
      <ConfettiRender />
      <DecorationsRender />

      {/* Mobile trigger button */}
      <button
        className="secret-menu-trigger"
        onClick={() => handleMenuToggle(!isMenuOpen)}
        aria-label="Toggle secret menu"
      >
        ✨
      </button>

      {/* Floating hint - only show after discovery */}
      {menuDiscovered && (
        <div className="secret-menu-floating-hint">
          <span>💡 Press Cmd+K for secret menu • Current theme: {currentTheme.emoji} {currentTheme.name}</span>
        </div>
      )}
    </>
  );
}

export default SecretFeatures;
