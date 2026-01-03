import { useCallback, useRef, useState, useEffect } from 'react';

// Silly sound generator using Web Audio API
// No audio files needed - we synthesize everything!

type SoundType = 'unicorn' | 'rainbow' | 'icecream' | 'stars' | 'hearts' | 'boing';

export const useHollandSounds = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  // Load preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('holland-sounds-enabled');
    if (saved === 'true') {
      setEnabled(true);
    }
  }, []);

  // Save preference
  useEffect(() => {
    localStorage.setItem('holland-sounds-enabled', enabled.toString());
  }, [enabled]);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      } catch {
        setIsSupported(false);
        return null;
      }
    }
    // Resume if suspended (browser autoplay policy)
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const playSound = useCallback((type: SoundType) => {
    if (!enabled) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    switch (type) {
      case 'unicorn': {
        // Magical sparkle ascending notes
        [0, 0.1, 0.2].forEach((delay, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = 800 + i * 200;
          osc.type = 'sine';
          gain.gain.setValueAtTime(0.15, now + delay);
          gain.gain.setTargetAtTime(0.01, now + delay + 0.1, 0.05);
          osc.start(now + delay);
          osc.stop(now + delay + 0.3);
        });
        break;
      }
      case 'rainbow': {
        // Slide whistle up
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.setTargetAtTime(0.01, now + 0.3, 0.05);
        osc.start(now);
        osc.stop(now + 0.5);
        break;
      }
      case 'icecream': {
        // Plop sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.25);
        break;
      }
      case 'stars': {
        // Twinkle - quick high notes
        [0, 0.08, 0.16, 0.24].forEach((delay) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = 1000 + Math.random() * 500;
          osc.type = 'sine';
          gain.gain.setValueAtTime(0.08, now + delay);
          gain.gain.setTargetAtTime(0.01, now + delay + 0.05, 0.02);
          osc.start(now + delay);
          osc.stop(now + delay + 0.1);
        });
        break;
      }
      case 'hearts': {
        // Soft "aww" - two gentle tones
        [0, 0.15].forEach((delay, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = i === 0 ? 440 : 550;
          osc.type = 'sine';
          gain.gain.setValueAtTime(0.1, now + delay);
          gain.gain.setTargetAtTime(0.01, now + delay + 0.2, 0.1);
          osc.start(now + delay);
          osc.stop(now + delay + 0.4);
        });
        break;
      }
      case 'boing': {
        // Classic cartoon boing
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.2);
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.35);
        break;
      }
    }
  }, [enabled, getAudioContext]);

  const toggleSounds = useCallback(() => {
    const newValue = !enabled;
    setEnabled(newValue);
    // Play a test sound when enabling
    if (newValue) {
      // Need to initialize audio context on user gesture
      const ctx = getAudioContext();
      if (ctx) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.setTargetAtTime(0.01, ctx.currentTime + 0.1, 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    }
  }, [enabled, getAudioContext]);

  return {
    playSound,
    toggleSounds,
    soundsEnabled: enabled,
    isSupported,
  };
};
