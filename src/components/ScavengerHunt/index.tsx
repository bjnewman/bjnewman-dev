import { useCallback, useSyncExternalStore, useState, useEffect } from 'react';
import type { ScavengerHuntState, AchievementId, CollectibleId, ClueId } from './types';
import { initialScavengerHuntState } from './types';
import { achievements, collectibles, clues } from './achievements';

const STORAGE_KEY = 'bjnewman-scavenger-hunt';

// External store for scavenger hunt state
let currentState: ScavengerHuntState = initialScavengerHuntState;
let isInitialized = false;
const listeners = new Set<() => void>();

const initializeStore = () => {
  if (isInitialized || typeof window === 'undefined') return;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) currentState = { ...initialScavengerHuntState, ...JSON.parse(saved) };
  } catch (e) {
    console.warn('Failed to parse scavenger hunt state:', e);
  }
  isInitialized = true;
};

const subscribe = (cb: () => void) => (listeners.add(cb), () => listeners.delete(cb));
const getSnapshot = () => (initializeStore(), currentState);
// Server snapshot returns initial state without side effects
const getServerSnapshot = () => initialScavengerHuntState;

const updateState = (updater: (prev: ScavengerHuntState) => ScavengerHuntState) => {
  const newState = updater(currentState);
  if (newState !== currentState) {
    currentState = newState;
    if (typeof window !== 'undefined')
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
    listeners.forEach((l) => l());
  }
};

// Helper to unlock achievement when threshold met, otherwise update progress
const withAchievement = (
  prev: ScavengerHuntState,
  id: AchievementId,
  value: number,
  threshold: number
): Pick<ScavengerHuntState, 'achievements' | 'totalPoints'> => {
  if (prev.achievements[id].unlocked)
    return { achievements: prev.achievements, totalPoints: prev.totalPoints };
  const shouldUnlock = value >= threshold;
  const points = shouldUnlock ? achievements.find((a) => a.id === id)?.points || 0 : 0;
  return {
    achievements: {
      ...prev.achievements,
      [id]: shouldUnlock
        ? { unlocked: true, unlockedAt: Date.now() }
        : { ...prev.achievements[id], progress: value },
    },
    totalPoints: prev.totalPoints + points,
  };
};

// Helper to maybe add a clue
const maybeAddClue = (prev: ScavengerHuntState, clueId: ClueId, condition = true): ClueId[] =>
  condition && !prev.unlockedClues.includes(clueId)
    ? [...prev.unlockedClues, clueId]
    : prev.unlockedClues;

// eslint-disable-next-line react-refresh/only-export-components
export const useScavengerHunt = () => {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // Track mounted state to avoid hydration mismatch
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const collectItem = useCallback((id: CollectibleId) => {
    updateState((prev) => {
      if (prev.collectibles[id]) return prev;
      const newCollectibles = { ...prev.collectibles, [id]: true };
      const count = Object.values(newCollectibles).filter(Boolean).length;
      return {
        ...prev,
        collectibles: newCollectibles,
        ...withAchievement(prev, 'easter_egg_hunter', count, 3),
        unlockedClues: maybeAddClue(prev, 'clue_2', count === 1),
      };
    });
  }, []);

  const trackSecretMenuOpened = useCallback(() => {
    updateState((prev) => {
      if (prev.secretMenuOpened) return prev;
      return {
        ...prev,
        secretMenuOpened: true,
        ...withAchievement(prev, 'first_secret', 1, 1),
        unlockedClues: maybeAddClue(prev, 'clue_1'),
      };
    });
  }, []);

  const trackConfettiFired = useCallback(() => {
    updateState((prev) => ({
      ...prev,
      confettiCount: prev.confettiCount + 1,
      ...withAchievement(prev, 'confetti_king', prev.confettiCount + 1, 10),
    }));
  }, []);

  const trackThemeExplored = useCallback((themeId: string) => {
    updateState((prev) => {
      if (prev.themesExplored.includes(themeId)) return prev;
      const newThemes = [...prev.themesExplored, themeId];
      const result = withAchievement(prev, 'theme_explorer', newThemes.length, 5);
      return {
        ...prev,
        themesExplored: newThemes,
        ...result,
        unlockedClues: maybeAddClue(prev, 'clue_3', result.totalPoints > prev.totalPoints),
      };
    });
  }, []);

  const trackMusicListenTime = useCallback((seconds: number) => {
    updateState((prev) => ({
      ...prev,
      musicListenTime: prev.musicListenTime + seconds,
      ...withAchievement(prev, 'music_lover', Math.floor(prev.musicListenTime + seconds), 30),
    }));
  }, []);

  const trackHollandVisited = useCallback(() => {
    updateState((prev) => {
      if (prev.achievements.holland_friend.unlocked) return prev;
      const collectCount = Object.values(prev.collectibles).filter(Boolean).length;
      return {
        ...prev,
        ...withAchievement(prev, 'holland_friend', 1, 1),
        unlockedClues: maybeAddClue(
          prev,
          'clue_4',
          collectCount >= 3 && prev.achievements.music_lover.unlocked
        ),
      };
    });
  }, []);

  const checkCompletionist = useCallback(() => {
    updateState((prev) => {
      if (prev.achievements.completionist.unlocked) return prev;
      const othersDone = Object.entries(prev.achievements)
        .filter(([id]) => id !== 'completionist')
        .every(([, s]) => s.unlocked);
      const allCollected = Object.values(prev.collectibles).every(Boolean);
      if (!othersDone || !allCollected) return prev;
      return { ...prev, ...withAchievement(prev, 'completionist', 1, 1) };
    });
  }, []);

  const getProgress = useCallback(
    () => ({
      achievements: Object.values(state.achievements).filter((a) => a.unlocked).length,
      totalAchievements: achievements.length,
      collectibles: Object.values(state.collectibles).filter(Boolean).length,
      totalCollectibles: collectibles.length,
      points: state.totalPoints,
      maxPoints: achievements.reduce((sum, a) => sum + a.points, 0),
    }),
    [state]
  );

  const getLatestClue = useCallback(() => {
    const id = state.unlockedClues.at(-1);
    return id ? clues.find((c) => c.id === id) || null : null;
  }, [state.unlockedClues]);

  const resetProgress = useCallback(() => {
    updateState(() => initialScavengerHuntState);
    if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    state,
    isLoaded: isMounted && isInitialized,
    collectItem,
    trackSecretMenuOpened,
    trackConfettiFired,
    trackThemeExplored,
    trackMusicListenTime,
    trackHollandVisited,
    checkCompletionist,
    getProgress,
    getLatestClue,
    resetProgress,
  };
};

// Re-export types and data
export type {
  AchievementId,
  CollectibleId,
  ClueId,
  Achievement,
  Collectible,
  Clue,
  AchievementState,
  ScavengerHuntState,
} from './types';
// eslint-disable-next-line react-refresh/only-export-components
export { initialScavengerHuntState } from './types';
// eslint-disable-next-line react-refresh/only-export-components
export { achievements, collectibles, clues } from './achievements';

// Re-export UI components
export { AchievementBadge } from './AchievementBadge';
export { AchievementPanel } from './AchievementPanel';
export { CollectibleItem } from './CollectibleItem';
export { PageCollectible } from './PageCollectible';
export { ProgressIndicator } from './ProgressIndicator';
