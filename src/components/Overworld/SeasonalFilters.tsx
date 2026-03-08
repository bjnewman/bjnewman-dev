import { useMemo } from 'react';
import { ColorMatrixFilter } from 'pixi.js';
import type { Season } from '../Atmosphere/types';

export function useSeasonalFilter(season: Season): ColorMatrixFilter {
  return useMemo(() => {
    const filter = new ColorMatrixFilter();
    switch (season) {
      case 'spring':
        filter.saturate(0.1, true);
        break;
      case 'summer':
        filter.saturate(0.2, true);
        break;
      case 'fall':
        filter.hue(25, true);
        filter.saturate(-0.1, true);
        break;
      case 'winter':
        filter.desaturate();
        filter.saturate(-0.3, true);
        break;
    }
    return filter;
  }, [season]);
}
