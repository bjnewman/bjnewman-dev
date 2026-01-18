/**
 * Holland's weekly activities.
 * A fictional but plausible schedule for a creative kid.
 */

export interface HollandActivity {
  id: string;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  activity: string;
  emoji: string;
  description: string;
}

export const hollandActivities: HollandActivity[] = [
  {
    id: 'monday',
    day: 'monday',
    activity: 'Drawing Unicorns',
    emoji: '🦄',
    description: 'Creating magical creatures with rainbow manes',
  },
  {
    id: 'tuesday',
    day: 'tuesday',
    activity: 'Piano Practice',
    emoji: '🎹',
    description: 'Working on that tricky part in the middle',
  },
  {
    id: 'wednesday',
    day: 'wednesday',
    activity: 'Science Experiments',
    emoji: '🧪',
    description: 'Making volcanoes and slime (supervised)',
  },
  {
    id: 'thursday',
    day: 'thursday',
    activity: 'Reading Adventures',
    emoji: '📚',
    description: 'Currently on chapter books about dragons',
  },
  {
    id: 'friday',
    day: 'friday',
    activity: 'Dance Party',
    emoji: '💃',
    description: 'Living room concert performances',
  },
  {
    id: 'saturday',
    day: 'saturday',
    activity: 'Outdoor Exploration',
    emoji: '🌲',
    description: 'Bug catching, rock collecting, tree climbing',
  },
  {
    id: 'sunday',
    day: 'sunday',
    activity: 'Family Game Day',
    emoji: '🎲',
    description: 'Board games and building blanket forts',
  },
];

/**
 * Get today's activity based on current day.
 */
export function getTodaysActivity(): HollandActivity {
  const days: HollandActivity['day'][] = [
    'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
  ];
  const today = days[new Date().getDay()];
  return hollandActivities.find(a => a.day === today) ?? hollandActivities[0];
}

/**
 * Get the day index (0-6, Sunday-Saturday).
 */
export function getCurrentDayIndex(): number {
  return new Date().getDay();
}
