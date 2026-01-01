import { useState, useRef, useEffect } from 'react';

export const useMusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element with a royalty-free elevator music URL
    // Using a placeholder - you'll need to add your own music file
    audioRef.current = new Audio();
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
      // For now, we'll just track state without actual audio
      // You can add a music file later
      setIsPlaying(true);
      console.log('🎵 Elevator music would be playing here!');
      console.log('Add an MP3 file to /public/music/ to enable audio');
    }
  };

  const MusicIndicator = () => {
    if (!isPlaying) return null;

    return (
      <div className="music-indicator">
        <span className="music-note">🎵</span>
        <span className="music-text">Elevator Music Mode</span>
      </div>
    );
  };

  return { toggleMusic, isPlaying, MusicIndicator };
};
