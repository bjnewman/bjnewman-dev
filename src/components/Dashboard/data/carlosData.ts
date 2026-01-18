/**
 * Carlos the dog's vital statistics.
 * All values are real-time* calculations.
 * *Real-time accuracy not guaranteed. Carlos disputes these findings.
 */

export interface CarlosMetrics {
  hungerLevel: number;
  sleepiness: number;
  minutesSinceLastWalk: number;
  bellyRubSuccessRate: number;
  treatRequestsToday: number;
}

/**
 * Get Carlos's current hunger level.
 * Spoiler: It's always critical.
 */
export function getHungerLevel(): number {
  // Carlos has informed us this is always an emergency
  return 100;
}

/**
 * Calculate sleepiness based on time of day.
 * Dogs sleep 12-14 hours a day, peaking after meals and in early afternoon.
 */
export function getSleepiness(): number {
  const hour = new Date().getHours();

  // Sleep curve: high in early morning, dips for breakfast excitement,
  // peaks after breakfast, dips for walk time, peaks in afternoon,
  // dips for dinner excitement, settles for evening
  const sleepCurve: Record<number, number> = {
    0: 95, 1: 98, 2: 99, 3: 99, 4: 98, 5: 90,  // Deep night sleep
    6: 70, 7: 40, 8: 30,                        // Waking up, breakfast excitement!
    9: 60, 10: 75, 11: 80,                      // Post-breakfast nap
    12: 85, 13: 90, 14: 88,                     // Peak afternoon sleepiness
    15: 70, 16: 55, 17: 40,                     // Afternoon activity, dinner anticipation
    18: 35, 19: 50, 20: 65,                     // Dinner time, settling down
    21: 75, 22: 85, 23: 92,                     // Evening wind-down
  };

  return sleepCurve[hour] ?? 50;
}

/**
 * Minutes since Carlos's last walk.
 * Resets at typical walk times, otherwise keeps counting.
 */
export function getMinutesSinceLastWalk(): number {
  const now = new Date();
  const hour = now.getHours();
  const minutes = now.getMinutes();

  // Typical walk times: 7am, 12pm, 5pm, 9pm
  const walkTimes = [7, 12, 17, 21];

  // Find the most recent walk time
  let lastWalkHour = walkTimes[0];
  for (const walkHour of walkTimes) {
    if (hour >= walkHour) {
      lastWalkHour = walkHour;
    }
  }

  // If we're before the first walk, last walk was yesterday's last walk
  if (hour < walkTimes[0]) {
    const yesterdayLastWalk = walkTimes[walkTimes.length - 1];
    return (24 - yesterdayLastWalk + hour) * 60 + minutes;
  }

  return (hour - lastWalkHour) * 60 + minutes;
}

/**
 * Belly rub success rate.
 * Carlos has never been denied.
 */
export function getBellyRubSuccessRate(): number {
  return 100;
}

/**
 * Treat requests today.
 * Calculated based on waking hours and Carlos's persistence.
 */
export function getTreatRequestsToday(): number {
  const hour = new Date().getHours();
  // Carlos averages about 3 treat requests per waking hour
  // He's been awake since 6am
  const wakingHours = Math.max(0, hour - 6);
  return wakingHours * 3 + Math.floor(Math.random() * 3);
}

/**
 * Get all current Carlos metrics.
 */
export function getCarlosMetrics(): CarlosMetrics {
  return {
    hungerLevel: getHungerLevel(),
    sleepiness: getSleepiness(),
    minutesSinceLastWalk: getMinutesSinceLastWalk(),
    bellyRubSuccessRate: getBellyRubSuccessRate(),
    treatRequestsToday: getTreatRequestsToday(),
  };
}
