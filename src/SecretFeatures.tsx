import { SecretMenu } from './components/SecretMenu';
import { useConfetti } from './components/ConfettiCannon';
import { useGradientSwitcher } from './components/GradientSwitcher';
import { useMusicPlayer } from './components/MusicPlayer';
import { useEffect } from 'react';

function SecretFeatures() {
  const { fireConfetti, ConfettiRender } = useConfetti();
  const { cycleGradient, resetGradient } = useGradientSwitcher();
  const { toggleMusic, MusicIndicator } = useMusicPlayer();

  const menuItems = [
    {
      id: 'confetti',
      label: 'Party Mode (Confetti!)',
      emoji: '🎉',
      action: fireConfetti,
    },
    {
      id: 'gradient',
      label: 'Cycle Background',
      emoji: '🌈',
      action: cycleGradient,
    },
    {
      id: 'reset-gradient',
      label: 'Reset Colors',
      emoji: '🔄',
      action: resetGradient,
    },
    {
      id: 'music',
      label: 'Elevator Music',
      emoji: '🎵',
      action: toggleMusic,
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
        <span>💡 Press Cmd+K for secret menu</span>
      </div>
    </>
  );
}

export default SecretFeatures;
