import { useEffect } from 'react';
import { SEASONS } from '../Atmosphere/useAtmosphere';
import type { UseAtmosphereReturn } from '../Atmosphere/useAtmosphere';
import type { Season } from '../Atmosphere/types';

const SEASON_LABELS: Record<Season, string> = {
  spring: 'Spring',
  summer: 'Summer',
  fall: 'Fall',
  winter: 'Winter',
};

const TIME_LABELS: Record<string, string> = {
  dawn: 'Dawn',
  morning: 'Morning',
  midday: 'Midday',
  afternoon: 'Afternoon',
  goldenHour: 'Golden Hour',
  dusk: 'Dusk',
  night: 'Night',
  lateNight: 'Late Night',
};

function formatDuration(ms: number): string {
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return remaining > 0 ? `${minutes}m ${remaining}s` : `${minutes}m`;
}

type Props = {
  atmosphere: UseAtmosphereReturn;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
};

export function OverworldSettingsPanel({ atmosphere, isOpen, onToggle }: Props) {
  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onToggle(!isOpen);
      }
      if (e.key === 'Escape' && isOpen) {
        onToggle(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onToggle]);

  if (!isOpen) return null;

  const {
    season,
    timeOfDay,
    dayProgress,
    override,
    setOverride,
    seasonDuration,
    dayDuration,
    setSeasonDuration,
    setDayDuration,
    setDayProgress,
    weatherEnabled,
    setWeatherEnabled,
    weatherOverrides,
    setWeatherOverrides,
    resetToDefaults,
  } = atmosphere;

  return (
    <div
      className="ow-settings__overlay"
      onClick={() => onToggle(false)}
      onKeyDown={(e) => { if (e.key === 'Escape') onToggle(false); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ow-settings-title"
    >
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- stopPropagation only */}
      <div className="ow-settings" onClick={(e) => e.stopPropagation()}>
        <div className="ow-settings__header">
          <h3 id="ow-settings-title">Village Settings</h3>
          <p className="ow-settings__hint">Cmd+K to toggle</p>
        </div>

        {/* Current status */}
        <div className="ow-settings__status">
          {SEASON_LABELS[season]} &middot; {TIME_LABELS[timeOfDay] ?? timeOfDay}
        </div>

        {/* Season picker */}
        <div className="ow-settings__section" role="group" aria-label="Season">
          <span className="ow-settings__label">Season</span>
          <div className="ow-settings__season-grid">
            <button
              className={`ow-settings__season-btn ${override === null ? 'ow-settings__season-btn--active' : ''}`}
              onClick={() => setOverride(null)}
              type="button"
            >
              Auto
            </button>
            {SEASONS.map((s) => (
              <button
                key={s}
                className={`ow-settings__season-btn ${override === s ? 'ow-settings__season-btn--active' : ''}`}
                onClick={() => setOverride(s)}
                type="button"
              >
                {SEASON_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Time of day slider */}
        <div className="ow-settings__section">
          <label className="ow-settings__label" htmlFor="ow-day-progress">
            Time of Day
            <span className="ow-settings__value">{TIME_LABELS[timeOfDay] ?? timeOfDay}</span>
          </label>
          <input
            id="ow-day-progress"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={dayProgress}
            onChange={(e) => setDayProgress(Number(e.target.value))}
            className="ow-settings__slider"
          />
          <div className="ow-settings__slider-labels">
            <span>Dawn</span>
            <span>Night</span>
          </div>
        </div>

        {/* Day cycle speed */}
        <div className="ow-settings__section">
          <label className="ow-settings__label" htmlFor="ow-day-duration">
            Day Cycle Length
            <span className="ow-settings__value">{formatDuration(dayDuration)}</span>
          </label>
          <input
            id="ow-day-duration"
            type="range"
            min="60000"
            max="1800000"
            step="30000"
            value={dayDuration}
            onChange={(e) => setDayDuration(Number(e.target.value))}
            className="ow-settings__slider"
          />
          <div className="ow-settings__slider-labels">
            <span>1m</span>
            <span>30m</span>
          </div>
        </div>

        {/* Season cycle speed */}
        <div className="ow-settings__section">
          <label className="ow-settings__label" htmlFor="ow-season-duration">
            Season Cycle Length
            <span className="ow-settings__value">{formatDuration(seasonDuration)}</span>
          </label>
          <input
            id="ow-season-duration"
            type="range"
            min="30000"
            max="600000"
            step="15000"
            value={seasonDuration}
            onChange={(e) => setSeasonDuration(Number(e.target.value))}
            className="ow-settings__slider"
          />
          <div className="ow-settings__slider-labels">
            <span>30s</span>
            <span>10m</span>
          </div>
        </div>

        {/* Weather toggle */}
        <div className="ow-settings__section ow-settings__section--row">
          <label className="ow-settings__label" htmlFor="ow-weather">Weather Effects</label>
          <button
            id="ow-weather"
            className={`ow-settings__toggle ${weatherEnabled ? 'ow-settings__toggle--on' : ''}`}
            onClick={() => setWeatherEnabled(!weatherEnabled)}
            type="button"
            aria-pressed={weatherEnabled}
          >
            {weatherEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Weather tuning — only visible when weather is enabled */}
        {weatherEnabled && (
          <>
            <div className="ow-settings__section">
              <label className="ow-settings__label" htmlFor="ow-weather-density">
                Density
                <span className="ow-settings__value">{((weatherOverrides.count ?? 1) * 100).toFixed(0)}%</span>
              </label>
              <input
                id="ow-weather-density"
                type="range"
                min="0.25"
                max="4"
                step="0.25"
                value={weatherOverrides.count ?? 1}
                onChange={(e) => setWeatherOverrides({ ...weatherOverrides, count: Number(e.target.value) })}
                className="ow-settings__slider"
              />
              <div className="ow-settings__slider-labels">
                <span>25%</span>
                <span>400%</span>
              </div>
            </div>

            <div className="ow-settings__section">
              <label className="ow-settings__label" htmlFor="ow-weather-speed">
                Speed
                <span className="ow-settings__value">{((weatherOverrides.speed ?? 1) * 100).toFixed(0)}%</span>
              </label>
              <input
                id="ow-weather-speed"
                type="range"
                min="0.25"
                max="4"
                step="0.25"
                value={weatherOverrides.speed ?? 1}
                onChange={(e) => setWeatherOverrides({ ...weatherOverrides, speed: Number(e.target.value) })}
                className="ow-settings__slider"
              />
              <div className="ow-settings__slider-labels">
                <span>25%</span>
                <span>400%</span>
              </div>
            </div>

            <div className="ow-settings__section">
              <label className="ow-settings__label" htmlFor="ow-weather-wind">
                Wind
                <span className="ow-settings__value">{((weatherOverrides.wind ?? 1) * 100).toFixed(0)}%</span>
              </label>
              <input
                id="ow-weather-wind"
                type="range"
                min="-2"
                max="2"
                step="0.25"
                value={weatherOverrides.wind ?? 1}
                onChange={(e) => setWeatherOverrides({ ...weatherOverrides, wind: Number(e.target.value) })}
                className="ow-settings__slider"
              />
              <div className="ow-settings__slider-labels">
                <span>-200%</span>
                <span>200%</span>
              </div>
            </div>

            <div className="ow-settings__section">
              <label className="ow-settings__label" htmlFor="ow-weather-size">
                Size
                <span className="ow-settings__value">{((weatherOverrides.size ?? 1) * 100).toFixed(0)}%</span>
              </label>
              <input
                id="ow-weather-size"
                type="range"
                min="0.25"
                max="4"
                step="0.25"
                value={weatherOverrides.size ?? 1}
                onChange={(e) => setWeatherOverrides({ ...weatherOverrides, size: Number(e.target.value) })}
                className="ow-settings__slider"
              />
              <div className="ow-settings__slider-labels">
                <span>25%</span>
                <span>400%</span>
              </div>
            </div>
          </>
        )}

        {/* Reset */}
        <button
          className="ow-settings__reset"
          onClick={resetToDefaults}
          type="button"
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}
