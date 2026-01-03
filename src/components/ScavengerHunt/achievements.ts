import type { Achievement, Collectible, Clue } from './types';

export const achievements: Achievement[] = [
  {
    id: 'first_secret',
    name: 'Secret Keeper',
    description: 'Discovered the hidden menu',
    emoji: '🔐',
    points: 10,
    trigger: 'Open the secret menu with Cmd+K (or Ctrl+K)',
  },
  {
    id: 'theme_explorer',
    name: 'Chromatic Explorer',
    description: 'Tried 5 different themes',
    emoji: '🎨',
    points: 20,
    trigger: 'Switch between 5 different themes',
  },
  {
    id: 'confetti_king',
    name: 'Party Animal',
    description: 'Fired the confetti cannon 10 times',
    emoji: '🎉',
    points: 15,
    trigger: 'Fire confetti 10 times',
  },
  {
    id: 'easter_egg_hunter',
    name: 'Easter Egg Hunter',
    description: 'Found 3 hidden collectibles',
    emoji: '🥚',
    points: 30,
    trigger: 'Discover 3 hidden collectibles around the site',
  },
  {
    id: 'music_lover',
    name: 'Elevator Enthusiast',
    description: 'Listened to elevator music for 30 seconds',
    emoji: '🎵',
    points: 15,
    trigger: 'Let the elevator music play for 30 seconds',
  },
  {
    id: 'holland_friend',
    name: "Holland's Friend",
    description: "Found Holland's secret page",
    emoji: '🐕',
    points: 25,
    trigger: "Visit Holland's special page",
  },
  {
    id: 'completionist',
    name: 'Completionist',
    description: 'Found every secret on the site',
    emoji: '🏆',
    points: 100,
    trigger: 'Unlock all other achievements and find all collectibles',
  },
];

export const collectibles: Collectible[] = [
  {
    id: 'golden_paw',
    name: 'Golden Paw',
    emoji: '🐾',
    page: 'About',
    hint: 'Near a furry friend',
  },
  {
    id: 'secret_star',
    name: 'Secret Star',
    emoji: '⭐',
    page: 'Projects',
    hint: 'Where code lives online',
  },
  {
    id: 'hidden_key',
    name: 'Hidden Key',
    emoji: '🔑',
    page: 'Blog',
    hint: 'Where the blogs roll',
  },
  {
    id: 'magic_crystal',
    name: 'Magic Crystal',
    emoji: '💎',
    page: 'Footer',
    hint: 'At the very bottom',
  },
  {
    id: 'rare_gem',
    name: 'Rare Gem',
    emoji: '💠',
    page: 'Resume',
    hint: 'Among the skills',
  },
];

export const clues: Clue[] = [
  {
    id: 'clue_1',
    text: 'Look carefully at every page... some treasures hide in plain sight.',
  },
  {
    id: 'clue_2',
    text: 'Colors tell stories. Have you tried them all?',
  },
  {
    id: 'clue_3',
    text: 'Do you hear that? Sometimes music reveals secrets.',
  },
  {
    id: 'clue_4',
    text: "Her name starts with H... she's Ben's best friend.",
  },
];

export const getAchievementById = (id: string): Achievement | undefined => {
  return achievements.find((a) => a.id === id);
};

export const getCollectibleById = (id: string): Collectible | undefined => {
  return collectibles.find((c) => c.id === id);
};

export const getClueById = (id: string): Clue | undefined => {
  return clues.find((c) => c.id === id);
};
