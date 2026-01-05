import { useCallback, useState, useEffect } from 'react';
import jsfxr from 'jsfxr';

const { sfxr } = jsfxr;

// Retro 8-bit sound effects using jsfxr
// Maps each decoration type to an sfxr preset

type SoundType = 'unicorn' | 'rainbow' | 'icecream' | 'stars' | 'hearts' | 'boing';

// Map decoration types to sfxr presets
const soundPresets: Record<SoundType, string> = {
  unicorn: 'powerUp',
  rainbow: 'jump',
  icecream: 'pickupCoin',
  stars: 'blipSelect',
  hearts: 'synth',
  boing: 'jump',
};

export const useHollandSounds = () => {
  const [enabled, setEnabled] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  // Load preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('holland-sounds-enabled');
    if (saved === 'true') {
      setEnabled(true);
    }
    // Check if Web Audio is supported
    if (typeof window !== 'undefined' && !window.AudioContext && !(window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext) {
      setIsSupported(false);
    }
  }, []);

  // Save preference
  useEffect(() => {
    localStorage.setItem('holland-sounds-enabled', enabled.toString());
  }, [enabled]);

  const playSound = useCallback((type: SoundType) => {
    if (!enabled) return;

    try {
      const preset = soundPresets[type];
      const sound = sfxr.generate(preset);
      sfxr.play(sound);
    } catch {
      // Silently fail if audio doesn't work
    }
  }, [enabled]);

  const toggleSounds = useCallback(() => {
    const newValue = !enabled;
    setEnabled(newValue);
    // Play a test sound when enabling
    if (newValue) {
      try {
        const sound = sfxr.generate('blipSelect');
        sfxr.play(sound);
      } catch {
        // Silently fail
      }
    }
  }, [enabled]);

  return {
    playSound,
    toggleSounds,
    soundsEnabled: enabled,
    isSupported,
  };
};
