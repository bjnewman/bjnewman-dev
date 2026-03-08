import { SecretMenu } from './components/SecretMenu';
import { useConfetti } from './components/ConfettiCannon';
import { useMusicPlayer } from './components/MusicPlayer';
import { useThemeSwitcher } from './components/ThemeSwitcher';
import { useNavStyleSwitcher, navStyles } from './components/NavStyleSwitcher';
import { useHollandDecorations } from './components/HollandDecorations';
import { useHollandSounds } from './components/HollandSounds';
import { MonkeyEyes } from './components/MonkeyEyes';
import { useScavengerHunt, ProgressIndicator } from './components/ScavengerHunt';
import { useState, useEffect, useRef } from 'react';

function SecretFeatures() {
  const { fireConfetti, ConfettiRender } = useConfetti();
  const { toggleMusic, isPlaying, MusicIndicator, preloadAudio } = useMusicPlayer();
  const { currentSeason, setSeasonOverride, seasons, isDarkMode, toggleDarkMode } = useThemeSwitcher();
  const {
    currentNavStyle,
    switchNavStyle,
    resetToThemeDefault,
    isOverridden,
  } = useNavStyleSwitcher();
  const {
    spawnUnicorns,
    spawnRainbows,
    spawnIceCream,
    spawnStars,
    spawnHearts,
    DecorationsRender,
  } = useHollandDecorations();
  const { playSound, toggleSounds, soundsEnabled, isSupported: soundsSupported } = useHollandSounds();

  // Wrap decoration spawners with sound effects
  const handleSpawnUnicorns = () => {
    spawnUnicorns();
    playSound('unicorn');
  };
  const handleSpawnRainbows = () => {
    spawnRainbows();
    playSound('rainbow');
  };
  const handleSpawnIceCream = () => {
    spawnIceCream();
    playSound('icecream');
  };
  const handleSpawnStars = () => {
    spawnStars();
    playSound('stars');
  };
  const handleSpawnHearts = () => {
    spawnHearts();
    playSound('hearts');
  };
  const {
    state: huntState,
    isLoaded: huntLoaded,
    trackSecretMenuOpened,
    trackConfettiFired,
    trackThemeExplored,
    trackMusicListenTime,
  } = useScavengerHunt();

  const [menuDiscovered, setMenuDiscovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [monkeyEyesVisible, setMonkeyEyesVisible] = useState(false);
  const musicTimeRef = useRef<number>(0);
  const musicIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Check if user has discovered the menu before
    const discovered = localStorage.getItem('secret-menu-discovered') === 'true';
    setMenuDiscovered(discovered);
  }, []);

  // Track music listen time
  useEffect(() => {
    if (isPlaying) {
      musicIntervalRef.current = setInterval(() => {
        musicTimeRef.current += 1;
        // Update every 5 seconds to avoid too many updates
        if (musicTimeRef.current % 5 === 0) {
          trackMusicListenTime(5);
        }
      }, 1000);
    } else {
      if (musicIntervalRef.current) {
        clearInterval(musicIntervalRef.current);
        musicIntervalRef.current = null;
      }
    }
    return () => {
      if (musicIntervalRef.current) {
        clearInterval(musicIntervalRef.current);
      }
    };
  }, [isPlaying, trackMusicListenTime]);

  const handleMenuToggle = (open: boolean) => {
    setIsMenuOpen(open);
    if (open) {
      // Preload music when menu opens (lazy load)
      preloadAudio();
      // Always call - the hook handles deduplication
      trackSecretMenuOpened();
      if (!menuDiscovered) {
        localStorage.setItem('secret-menu-discovered', 'true');
        setMenuDiscovered(true);
      }
    }
  };

  const handleConfetti = () => {
    fireConfetti();
    trackConfettiFired();
  };

  const handleSwitchSeason = (seasonId: string) => {
    setSeasonOverride(seasonId as import('./components/Atmosphere/types').Season);
    trackThemeExplored(seasonId);
  };

  // Season emojis for the menu
  const seasonEmojis: Record<string, string> = {
    spring: '🌸',
    summer: '☀️',
    fall: '🍂',
    winter: '❄️',
  };

  // Create season menu items (replaces old theme items)
  const seasonItems = seasons.map((s) => ({
    id: `season-${s.id}`,
    label: `${s.name}${currentSeason === s.id ? ' \u2713' : ''}`,
    emoji: seasonEmojis[s.id] || '🎨',
    action: () => handleSwitchSeason(s.id),
  }));

  // Create nav style menu items
  const navStyleItems = navStyles.map((style) => ({
    id: `nav-${style.id}`,
    label: `${style.name}${currentNavStyle.id === style.id ? ' ✓' : ''}`,
    emoji: style.emoji,
    action: () => switchNavStyle(style.id),
  }));

  const menuItems = [
    {
      id: 'confetti',
      label: 'Party Mode (Confetti!)',
      emoji: '🎉',
      action: handleConfetti,
    },
    {
      id: 'music',
      label: 'Elevator Music',
      emoji: '🎵',
      action: toggleMusic,
    },
    {
      id: 'dark-mode',
      label: isDarkMode ? 'Light Mode' : 'Dark Mode',
      emoji: isDarkMode ? '☀️' : '🌙',
      action: toggleDarkMode,
    },
    {
      id: 'seasons-divider',
      label: '— Seasons —',
      emoji: '🎨',
      action: () => {}, // Divider, no action
    },
    ...seasonItems,
    {
      id: 'nav-styles-divider',
      label: '— Navigation Style —',
      emoji: '📑',
      action: () => {}, // Divider
    },
    ...navStyleItems,
    ...(isOverridden
      ? [
          {
            id: 'nav-reset',
            label: 'Reset to Theme Default',
            emoji: '↩️',
            action: () => resetToThemeDefault(currentSeason),
          },
        ]
      : []),
    {
      id: 'holland-divider',
      label: "— Holland's Magic —",
      emoji: '✨',
      action: () => {}, // Divider
    },
    ...(soundsSupported
      ? [
          {
            id: 'holland-sounds',
            label: soundsEnabled ? 'Silly Sounds: ON' : 'Silly Sounds: OFF',
            emoji: soundsEnabled ? '🔊' : '🔇',
            action: toggleSounds,
          },
        ]
      : []),
    {
      id: 'holland-unicorns',
      label: 'Spawn Unicorns',
      emoji: '🦄',
      action: handleSpawnUnicorns,
    },
    {
      id: 'holland-rainbows',
      label: 'Spawn Rainbows',
      emoji: '🌈',
      action: handleSpawnRainbows,
    },
    {
      id: 'holland-icecream',
      label: 'Spawn Ice Cream',
      emoji: '🍦',
      action: handleSpawnIceCream,
    },
    {
      id: 'holland-stars',
      label: 'Spawn Stars',
      emoji: '⭐',
      action: handleSpawnStars,
    },
    {
      id: 'holland-hearts',
      label: 'Spawn Hearts',
      emoji: '💕',
      action: handleSpawnHearts,
    },
    {
      id: 'holland-monkey-eyes',
      label: 'Toggle Monkey Eyes',
      emoji: '🙈',
      action: () => setMonkeyEyesVisible(!monkeyEyesVisible),
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
      <SecretMenu items={menuItems} isOpen={isMenuOpen} onToggle={handleMenuToggle} />
      <MusicIndicator />
      <ConfettiRender />
      <DecorationsRender />
      <MonkeyEyes visible={monkeyEyesVisible} position="bottom" />
      <ProgressIndicator state={huntState} isLoaded={huntLoaded} />

      {/* Mobile trigger button */}
      <button
        className="secret-menu-trigger"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle secret menu"
      >
        ✨
      </button>

      {/* Floating hint - only show after discovery */}
      {menuDiscovered && (
        <div className="secret-menu-floating-hint">
          <span>
            💡 Press Cmd+K for secret menu • {seasonEmojis[currentSeason]} {currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1)} • {currentNavStyle.emoji} {currentNavStyle.name}
          </span>
        </div>
      )}
    </>
  );
}

export default SecretFeatures;
