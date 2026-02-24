import { describe, it, expect } from 'vitest';
import { sceneConfigs } from '../../../components/Interior/sceneConfigs';

describe('sceneConfigs', () => {
  const expectedBuildings = [
    'town-hall', 'workshop', 'library',
    'courthouse', 'observatory', 'dog-house', 'fairy-treehouse',
  ];

  it('should have a config for each building', () => {
    for (const id of expectedBuildings) {
      expect(sceneConfigs[id]).toBeDefined();
    }
  });

  it('should have wallTilePattern and floorTilePattern for each config', () => {
    for (const id of expectedBuildings) {
      const config = sceneConfigs[id];
      expect(config.wallTilePattern).toBeTruthy();
      expect(config.floorTilePattern).toBeTruthy();
    }
  });

  it('should have character position for each config', () => {
    for (const id of expectedBuildings) {
      const config = sceneConfigs[id];
      expect(config.characterX).toBeTruthy();
      expect(config.characterY).toBeTruthy();
      expect(['down', 'left', 'right', 'up']).toContain(config.characterDirection);
    }
  });
});
