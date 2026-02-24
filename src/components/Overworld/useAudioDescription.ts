import { useCallback } from 'react';
import { buildings } from './mapData';

export function useAudioDescription() {
  const describeScene = useCallback(() => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const buildingList = buildings
      .map((b) => `${b.name}, which leads to ${b.description}`)
      .join('. ');

    const text = `You are in a pixel art village. There are seven buildings to explore. ${buildingList}. Use arrow keys or WASD to move your character. Press E near a building to interact.`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }, []);

  return { describeScene };
}
