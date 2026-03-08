import { useCallback, useState } from 'react';
import { buildings } from './mapData';

export function useAudioDescription() {
  const [speaking, setSpeaking] = useState(false);

  const describeScene = useCallback(() => {
    if (!('speechSynthesis' in window)) return;

    // If already speaking, stop and return
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    const buildingList = buildings
      .map((b) => `${b.name}, which leads to ${b.description}`)
      .join('. ');

    const text = `You are in a pixel art village. There are seven buildings to explore. ${buildingList}. Use arrow keys or WASD to move your character. Press E near a building to interact.`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }, []);

  return { describeScene, speaking };
}
