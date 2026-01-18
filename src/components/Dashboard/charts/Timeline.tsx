import { useState, useRef, useCallback } from 'react';
import type { HollandActivity } from '../data/hollandData';

export interface TimelineProps {
  /** Array of activities for each day */
  activities: HollandActivity[];
  /** The currently highlighted day index (0 = Sunday, 6 = Saturday) */
  currentDayIndex: number;
  /** Title for the timeline */
  title: string;
}

/**
 * Accessible horizontal timeline with keyboard navigation.
 * Days can be navigated with arrow keys.
 */
export function Timeline({ activities, currentDayIndex, title }: TimelineProps) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Reorder activities to start with Sunday (index 0)
  const orderedDays: HollandActivity['day'][] = [
    'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
  ];

  const orderedActivities = orderedDays.map(
    day => activities.find(a => a.day === day)!
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, index: number) => {
      let newIndex: number | null = null;

      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault();
          newIndex = (index + 1) % orderedActivities.length;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          newIndex = (index - 1 + orderedActivities.length) % orderedActivities.length;
          break;
        case 'Home':
          event.preventDefault();
          newIndex = 0;
          break;
        case 'End':
          event.preventDefault();
          newIndex = orderedActivities.length - 1;
          break;
      }

      if (newIndex !== null) {
        setFocusedIndex(newIndex);
        itemRefs.current[newIndex]?.focus();
      }
    },
    [orderedActivities.length]
  );

  return (
    <div className="timeline">
      <h3 className="timeline__title">{title}</h3>

      <div
        className="timeline__track"
        role="list"
        aria-label={`${title} - use arrow keys to navigate`}
      >
        {orderedActivities.map((activity, index) => {
          const isToday = index === currentDayIndex;
          const isFocused = focusedIndex === index;

          return (
            <button
              key={activity.id}
              ref={el => { itemRefs.current[index] = el; }}
              role="listitem"
              className={`timeline__item ${isToday ? 'timeline__item--today' : ''} ${isFocused ? 'timeline__item--focused' : ''}`}
              tabIndex={isFocused || (focusedIndex === null && isToday) ? 0 : -1}
              onKeyDown={e => handleKeyDown(e, index)}
              onFocus={() => setFocusedIndex(index)}
              aria-current={isToday ? 'date' : undefined}
              aria-label={`${activity.day}: ${activity.activity}. ${activity.description}`}
            >
              <span className="timeline__day-label">
                {activity.day.slice(0, 3).toUpperCase()}
              </span>
              <span className="timeline__emoji" aria-hidden="true">
                {activity.emoji}
              </span>
              <span className="timeline__activity-name">
                {activity.activity}
              </span>
            </button>
          );
        })}
      </div>

      {/* Expanded details for focused/today item */}
      {(focusedIndex !== null || currentDayIndex !== null) && (
        <div
          className="timeline__details"
          aria-live="polite"
          aria-atomic="true"
        >
          {(() => {
            const activity = orderedActivities[focusedIndex ?? currentDayIndex];
            const isToday = (focusedIndex ?? currentDayIndex) === currentDayIndex;
            return (
              <>
                <span className="timeline__details-emoji" aria-hidden="true">
                  {activity.emoji}
                </span>
                <div className="timeline__details-text">
                  <strong>
                    {isToday && focusedIndex === null ? "Today's Activity: " : `${activity.day.charAt(0).toUpperCase() + activity.day.slice(1)}: `}
                    {activity.activity}
                  </strong>
                  <p>{activity.description}</p>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
