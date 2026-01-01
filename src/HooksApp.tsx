import { SecretMenu } from './components/SecretMenu';
import { useConfetti } from './components/ConfettiCannon';
import { useGradientSwitcher } from './components/GradientSwitcher';
import { useMusicPlayer } from './components/MusicPlayer';
import './styles/theme.css';
import './styles/components.css';
import './styles/hooks.css';

function HooksApp() {
  const { fireConfetti, ConfettiRender } = useConfetti();
  const { cycleGradient, resetGradient } = useGradientSwitcher();
  const { toggleMusic, MusicIndicator } = useMusicPlayer();

  const hooks = [
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

  return (
    <>
      <SecretMenu hooks={hooks} />
      <MusicIndicator />
      <ConfettiRender />
      <div className="hooks-hint">
        <span>💡 Press Cmd+K for secret menu</span>
      </div>
    </>
  );
}

export default HooksApp;
