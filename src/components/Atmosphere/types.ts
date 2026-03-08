export type Season = 'spring' | 'summer' | 'fall' | 'winter';

export type TimeOfDay =
  | 'dawn'
  | 'morning'
  | 'midday'
  | 'afternoon'
  | 'goldenHour'
  | 'dusk'
  | 'night'
  | 'lateNight';

export type AtmosphereState = {
  season: Season;
  timeOfDay: TimeOfDay;
  /** 0-1 progress through current season */
  seasonProgress: number;
  /** 0-1 progress through current day cycle */
  dayProgress: number;
  /** User override, null = auto */
  override: Season | null;
};

export type { WeatherOverrides } from '../Overworld/weatherPresets';

export type SeasonPalette = {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  accentLight: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  bgGradient: string;
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
};
