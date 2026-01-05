import { useCallback, useState, useEffect, useRef } from 'react';

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SfxrModule = any;

export const useHollandSounds = () => {
  const [enabled, setEnabled] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const sfxrRef = useRef<SfxrModule>(null);

  // Load jsfxr dynamically to handle module resolution
  useEffect(() => {
    const loadJsfxr = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const jsfxr: any = await import('jsfxr');
        // The module exports { sfxr: {...} }
        const sfxr = jsfxr.sfxr;
        if (sfxr?.generate && sfxr?.play) {
          sfxrRef.current = sfxr;
        } else {
          console.warn('[HollandSounds] Could not find sfxr in jsfxr module:', Object.keys(jsfxr));
          setIsSupported(false);
        }
      } catch (err) {
        console.warn('[HollandSounds] Failed to load jsfxr:', err);
        setIsSupported(false);
      }
    };
    loadJsfxr();
  }, []);

  // Load preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('holland-sounds-enabled');
    if (saved === 'true') {
      setEnabled(true);
    }
    // Check if Web Audio is supported
    if (
      typeof window !== 'undefined' &&
      !window.AudioContext &&
      !(window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ) {
      setIsSupported(false);
    }
  }, []);

  // Save preference
  useEffect(() => {
    localStorage.setItem('holland-sounds-enabled', enabled.toString());
  }, [enabled]);

  const playSound = useCallback(
    (type: SoundType) => {
      if (!enabled || !sfxrRef.current) return;

      try {
        const preset = soundPresets[type];
        const sound = sfxrRef.current.generate(preset);
        sfxrRef.current.play(sound);
      } catch {
        // Silently fail if audio doesn't work
      }
    },
    [enabled]
  );

  const toggleSounds = useCallback(() => {
    const newValue = !enabled;
    setEnabled(newValue);
    // Play a test sound when enabling
    if (newValue && sfxrRef.current) {
      try {
        const sound = sfxrRef.current.generate('blipSelect');
        sfxrRef.current.play(sound);
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
