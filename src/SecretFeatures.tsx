import { SecretMenu } from './components/SecretMenu';
import { useConfetti } from './components/ConfettiCannon';
import { useMusicPlayer } from './components/MusicPlayer';
import { useThemeSwitcher, themes } from './components/ThemeSwitcher';
import { useEffect } from 'react';

function SecretFeatures() {
  const { fireConfetti, ConfettiRender } = useConfetti();
  const { toggleMusic, MusicIndicator } = useMusicPlayer();
  const { currentTheme, switchTheme } = useThemeSwitcher();

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
      label: '—',
      emoji: '',
      action: () => {}, // Divider
    },
    {
      id: 'holland',
      label: "Holland's Secret Page",
      emoji: '🦄',
      action: () => {
        window.location.href = '/holland/';
      },
    },
  ];

  useEffect(() => {
    // SecretFeatures component mounted
  }, []);

  return (
    <>
      <SecretMenu items={menuItems} />
      <MusicIndicator />
      <ConfettiRender />
      <div className="secret-menu-floating-hint">
        <span>💡 Press Cmd+K for secret menu • Current theme: {currentTheme.emoji} {currentTheme.name}</span>
      </div>
    </>
  );
}

export default SecretFeatures;
