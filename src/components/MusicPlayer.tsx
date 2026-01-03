import { useState, useRef, useEffect, useCallback } from 'react';

export const useMusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Preload audio when called (e.g., when menu opens)
  const preloadAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/assets/elevator-music.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
    }
  }, []);

  const toggleMusic = useCallback(() => {
    // Ensure audio is loaded
    preloadAudio();

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current?.play().catch((err) => {
        console.error('Failed to play audio:', err);
        console.error('Audio file not found. Add elevator-music.mp3 to /public/assets/');
      });
      setIsPlaying(true);
    }
  }, [isPlaying, preloadAudio]);

  const MusicIndicator = () => {
    if (!isPlaying) return null;

    return (
      <button className="music-indicator" onClick={toggleMusic} type="button">
        <span className="music-note">🎵</span>
        <span className="music-text">Elevator Music Mode</span>
      </button>
    );
  };

  return { toggleMusic, isPlaying, MusicIndicator, preloadAudio };
};
