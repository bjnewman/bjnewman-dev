import { useState, useEffect, useCallback, useRef } from 'react';
import type { Point } from './types';

export type InputKeys = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  interact: boolean;
  escape: boolean;
};

const KEY_MAP: Record<string, keyof InputKeys> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  W: 'up',
  a: 'left',
  A: 'left',
  s: 'down',
  S: 'down',
  d: 'right',
  D: 'right',
  e: 'interact',
  E: 'interact',
  Enter: 'interact',
  Escape: 'escape',
};

export function useInput() {
  const [keys, setKeys] = useState<InputKeys>({
    up: false,
    down: false,
    left: false,
    right: false,
    interact: false,
    escape: false,
  });
  const [clickTarget, setClickTarget] = useState<Point | null>(null);
  const keysRef = useRef(keys);
  keysRef.current = keys;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const mapped = KEY_MAP[e.key];
    if (mapped) {
      e.preventDefault();
      setKeys((prev) => ({ ...prev, [mapped]: true }));
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const mapped = KEY_MAP[e.key];
    if (mapped) {
      setKeys((prev) => ({ ...prev, [mapped]: false }));
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const handleCanvasClick = useCallback((worldX: number, worldY: number) => {
    setClickTarget({ x: worldX, y: worldY });
  }, []);

  const clearClickTarget = useCallback(() => {
    setClickTarget(null);
  }, []);

  const clearInteract = useCallback(() => {
    setKeys((prev) => ({ ...prev, interact: false }));
  }, []);

  const clearEscape = useCallback(() => {
    setKeys((prev) => ({ ...prev, escape: false }));
  }, []);

  return { keys, clickTarget, handleCanvasClick, clearClickTarget, clearInteract, clearEscape };
}
