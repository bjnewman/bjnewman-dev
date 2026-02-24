import { useEffect, useState } from 'react';

type Props = {
  onPlay: () => void;
  onSkip: () => void;
};

export function WelcomeModal({ onPlay, onSkip }: Props) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem('welcome-seen');
    if (!seen) {
      setIsVisible(true);
    }
  }, []);

  const handlePlay = () => {
    sessionStorage.setItem('welcome-seen', 'true');
    setIsVisible(false);
    onPlay();
  };

  const handleSkip = () => {
    sessionStorage.setItem('welcome-seen', 'true');
    setIsVisible(false);
    onSkip();
  };

  if (!isVisible) return null;

  return (
    <div className="welcome-modal__overlay">
      <div
        className="welcome-modal"
        role="dialog"
        aria-labelledby="welcome-title"
        aria-modal="true"
      >
        <h2 id="welcome-title" className="welcome-modal__title">Hi, I'm Ben Newman! 👋</h2>
        <div className="welcome-modal__content">
          <p>
            I'm a former lawyer turned Tech Lead building systems that handle millions of healthcare transactions daily.
          </p>
          <p>
            I recently rebuilt my portfolio as an interactive 2D village. Feel free to wander around and explore my work!
          </p>
          <div className="welcome-modal__controls">
            <p><strong>Navigation:</strong></p>
            <ul>
              <li><strong>Move:</strong> WASD, Arrow Keys, or Click/Tap</li>
              <li><strong>Interact:</strong> 'E' key or Double-Click buildings</li>
            </ul>
          </div>
        </div>
        <div className="welcome-modal__actions">
          <button
            className="welcome-modal__btn welcome-modal__btn--skip"
            onClick={handleSkip}
            type="button"
          >
            View as text (Skip)
          </button>
          <button
            className="welcome-modal__btn welcome-modal__btn--play"
            onClick={handlePlay}
            type="button"
          >
            Explore Village
          </button>
        </div>
      </div>
    </div>
  );
}
