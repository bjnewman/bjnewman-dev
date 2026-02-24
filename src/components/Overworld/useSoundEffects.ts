import { useState, useEffect, useRef, useCallback } from 'react';

const STORAGE_KEY = 'overworld-audio-muted';

// Peon voice lines from Warcraft III (via peon-ping)
const SOUND_PATHS = {
  dialogOpen: '/assets/overworld/sounds/PeonWhat4.wav',   // "Something need doing?"
  confirm: '/assets/overworld/sounds/PeonYes3.wav',       // "Work, work."
  cancel: '/assets/overworld/sounds/PeonAngry1.wav',      // "Whaaat?"
  transition: '/assets/overworld/sounds/PeonYes1.wav',    // "I can do that."
} as const;

type SoundName = keyof typeof SOUND_PATHS;

export function useSoundEffects() {
  const [muted, setMuted] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved !== 'false'; // muted by default
  });
  const audioCtxRef = useRef<AudioContext | null>(null);
  const bufferCache = useRef<Map<string, AudioBuffer>>(new Map());

  // Lazily create AudioContext (must be triggered by user gesture)
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Preload sounds after first user interaction
  useEffect(() => {
    let cancelled = false;

    const preload = async () => {
      try {
        const ctx = getAudioContext();
        for (const path of Object.values(SOUND_PATHS)) {
          if (bufferCache.current.has(path)) continue;
          const response = await fetch(path);
          const arrayBuffer = await response.arrayBuffer();
          if (cancelled) return;
          const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
          bufferCache.current.set(path, audioBuffer);
        }
      } catch {
        // Audio not available — silent fallback
      }
    };

    // Defer preload slightly to avoid blocking initial render
    const timer = setTimeout(preload, 1000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [getAudioContext]);

  // Persist mute state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, muted.toString());
  }, [muted]);

  const playSound = useCallback(
    async (name: SoundName) => {
      if (muted) return;
      try {
        const ctx = getAudioContext();
        const path = SOUND_PATHS[name];
        let buffer = bufferCache.current.get(path);

        if (!buffer) {
          const response = await fetch(path);
          const arrayBuffer = await response.arrayBuffer();
          buffer = await ctx.decodeAudioData(arrayBuffer);
          bufferCache.current.set(path, buffer);
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
      } catch {
        // Silently fail
      }
    },
    [muted, getAudioContext]
  );

  const toggleMute = useCallback(() => {
    setMuted((prev) => !prev);
  }, []);

  const playDialogOpen = useCallback(() => playSound('dialogOpen'), [playSound]);
  const playConfirm = useCallback(() => playSound('confirm'), [playSound]);
  const playCancel = useCallback(() => playSound('cancel'), [playSound]);
  const playTransition = useCallback(() => playSound('transition'), [playSound]);

  return {
    muted,
    toggleMute,
    playDialogOpen,
    playConfirm,
    playCancel,
    playTransition,
  };
}
