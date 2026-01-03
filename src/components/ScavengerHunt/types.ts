// Achievement IDs
export type AchievementId =
  | 'first_secret' // Find Cmd+K menu
  | 'theme_explorer' // Try 5 themes
  | 'confetti_king' // Fire confetti 10x
  | 'easter_egg_hunter' // Find 3 collectibles
  | 'music_lover' // Listen 30 seconds
  | 'holland_friend' // Visit Holland's page
  | 'completionist'; // Find everything

// Collectible IDs
export type CollectibleId =
  | 'golden_paw' // About page - near Carlos mention
  | 'secret_star' // Projects page - GitHub link area
  | 'hidden_key' // Blog page - blogroll sidebar
  | 'magic_crystal' // Footer - scroll to bottom
  | 'rare_gem'; // Resume page - skills section

// Clue IDs
export type ClueId =
  | 'clue_1' // After discovering Cmd+K
  | 'clue_2' // After first collectible
  | 'clue_3' // After trying 5 themes
  | 'clue_4'; // After 3 collectibles + music

export interface Achievement {
  id: AchievementId;
  name: string;
  description: string;
  emoji: string;
  points: number;
  trigger: string; // Human-readable description of how to unlock
}

export interface Collectible {
  id: CollectibleId;
  name: string;
  emoji: string;
  page: string;
  hint: string;
}

export interface Clue {
  id: ClueId;
  text: string;
}

export interface AchievementState {
  unlocked: boolean;
  unlockedAt?: number; // timestamp
  progress?: number; // for progressive achievements
}

export interface ScavengerHuntState {
  achievements: Record<AchievementId, AchievementState>;
  collectibles: Record<CollectibleId, boolean>;
  unlockedClues: ClueId[];
  totalPoints: number;
  confettiCount: number; // Track confetti fires
  themesExplored: string[]; // Track unique themes used
  musicListenTime: number; // Track music listen time in seconds
  secretMenuOpened: boolean; // Track if Cmd+K was opened
}

// Initial state for a new user
export const initialScavengerHuntState: ScavengerHuntState = {
  achievements: {
    first_secret: { unlocked: false },
    theme_explorer: { unlocked: false, progress: 0 },
    confetti_king: { unlocked: false, progress: 0 },
    easter_egg_hunter: { unlocked: false, progress: 0 },
    music_lover: { unlocked: false, progress: 0 },
    holland_friend: { unlocked: false },
    completionist: { unlocked: false },
  },
  collectibles: {
    golden_paw: false,
    secret_star: false,
    hidden_key: false,
    magic_crystal: false,
    rare_gem: false,
  },
  unlockedClues: [],
  totalPoints: 0,
  confettiCount: 0,
  themesExplored: [],
  musicListenTime: 0,
  secretMenuOpened: false,
};
