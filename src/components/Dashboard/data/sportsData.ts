/**
 * Chicago Sports Fan Index data.
 * Tracking the emotional state of a long-suffering (but recently rewarded!) fan.
 */

export type Sentiment = 'misery' | 'cautious' | 'hopeful' | 'celebration';

export interface TeamStatus {
  team: 'cubs' | 'bulls' | 'bears';
  name: string;
  emoji: string;
  metric: {
    label: string;
    value: number;
    unit: string;
    description: string;
  };
  sentiment: Sentiment;
  funFact: string;
  color: string;
}

/**
 * Calculate days since a specific date.
 */
function daysSince(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get Cubs status - Days since last World Series win.
 */
export function getCubsStatus(): TeamStatus {
  const worldSeriesDate = '2016-11-02'; // Game 7
  const daysSinceWin = daysSince(worldSeriesDate);

  return {
    team: 'cubs',
    name: 'Chicago Cubs',
    emoji: '🐻',
    metric: {
      label: 'Days Since World Series',
      value: daysSinceWin,
      unit: 'days',
      description: `It's been ${daysSinceWin.toLocaleString()} days since the Cubs won the World Series`,
    },
    sentiment: 'cautious',
    funFact: "But we'll always have 2016. The drought before was 108 years.",
    color: '#0e3386', // Cubs blue
  };
}

/**
 * Get Bulls status - Play-in tournament probability.
 * The model is infallible.
 */
export function getBullsStatus(): TeamStatus {
  return {
    team: 'bulls',
    name: 'Chicago Bulls',
    emoji: '🐂',
    metric: {
      label: 'Play-in Probability',
      value: 100,
      unit: '%',
      description: 'Statistical models cannot account for organizational decisions',
    },
    sentiment: 'misery',
    funFact: 'The model has never been wrong. Every year: play-in bound.',
    color: '#ce1141', // Bulls red
  };
}

/**
 * Get Bears status - Cautiously optimistic after playoff heartbreak.
 * Beat the Packers in Wild Card, lost to Rams in OT in Divisional.
 */
export function getBearsStatus(): TeamStatus {
  const calebEraStart = '2024-04-25'; // Draft day
  const daysSinceDraft = daysSince(calebEraStart);
  const yearsSinceDraft = Math.floor(daysSinceDraft / 365);

  return {
    team: 'bears',
    name: 'Chicago Bears',
    emoji: '🐻',
    metric: {
      label: 'Years of Caleb',
      value: yearsSinceDraft,
      unit: yearsSinceDraft === 1 ? 'year' : 'years',
      description: `${yearsSinceDraft} year${yearsSinceDraft === 1 ? '' : 's'} into the Caleb Williams era`,
    },
    sentiment: 'cautious',
    funFact: 'Beat the Packers in Wild Card! Lost to Rams in OT after another Caleb comeback. The future is bright.',
    color: '#0b162a', // Bears navy
  };
}

/**
 * Calculate overall Chicago sports fan mood.
 */
export function calculateChicagoMood(
  cubs: TeamStatus,
  bulls: TeamStatus,
  bears: TeamStatus
): { mood: string; description: string } {
  // If Bears are cautious (playoff run, bright future), mood is hopeful
  if (bears.sentiment === 'cautious') {
    return {
      mood: 'Cautiously Optimistic',
      description: 'The Caleb Williams era has arrived. Playoff heartbreak hurts, but the future is bright.',
    };
  }

  // If all teams are in misery, full Chicago mode
  if (
    cubs.sentiment === 'misery' &&
    bulls.sentiment === 'misery' &&
    bears.sentiment === 'misery'
  ) {
    return {
      mood: 'Peak Chicago',
      description: "There's always next year.",
    };
  }

  // Default cautious state
  return {
    mood: 'Cautiously Pessimistic',
    description: 'Standard Chicago sports fan operating mode.',
  };
}

/**
 * Get all team statuses and overall mood.
 */
export function getChicagoSportsIndex() {
  const cubs = getCubsStatus();
  const bulls = getBullsStatus();
  const bears = getBearsStatus();
  const overallMood = calculateChicagoMood(cubs, bulls, bears);

  return {
    cubs,
    bulls,
    bears,
    overallMood,
  };
}
