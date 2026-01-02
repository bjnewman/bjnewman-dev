import { useState, useRef, useEffect } from 'react';

export const useMusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element with elevator music
    audioRef.current = new Audio('/assets/elevator-music.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((err) => {
        console.error('Failed to play audio:', err);
        console.error('Audio file not found. Add elevator-music.mp3 to /public/assets/');
      });
      setIsPlaying(true);
    }
  };

  const MusicIndicator = () => {
    if (!isPlaying) return null;

    return (
      <div className="music-indicator" onClick={toggleMusic}>
        <span className="music-note">🎵</span>
        <span className="music-text">Elevator Music Mode</span>
      </div>
    );
  };

  return { toggleMusic, isPlaying, MusicIndicator };
};
