import { useState, useEffect } from 'react';

interface Decoration {
  id: number;
  x: number;
  y: number;
  emoji: string;
  rotation: number;
  scale: number;
  velocity: { x: number; y: number };
  opacity: number;
  life: number; // Lifespan in frames
}

export type DecorationType = 'unicorn' | 'rainbow' | 'icecream' | 'stars' | 'hearts';

const decorationEmojis: Record<DecorationType, string[]> = {
  unicorn: ['🦄'],
  rainbow: ['🌈'],
  icecream: ['🍦', '🍨', '🧁'],
  stars: ['⭐', '✨', '💫', '🌟'],
  hearts: ['💕', '💖', '💗', '💓', '💝'],
};

export const useHollandDecorations = () => {
  const [decorations, setDecorations] = useState<Decoration[]>([]);
  const [nextId, setNextId] = useState(0);

  const spawnDecorations = (type: DecorationType, count: number = 8) => {
    const emojis = decorationEmojis[type];
    const newDecorations: Decoration[] = [];
    const baseId = nextId;

    for (let i = 0; i < count; i++) {
      newDecorations.push({
        id: baseId + i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        rotation: Math.random() * 360,
        scale: 0.8 + Math.random() * 0.4, // Random size between 0.8x and 1.2x
        velocity: {
          x: (Math.random() - 0.5) * 0.5, // Slow horizontal drift
          y: -0.3 - Math.random() * 0.3, // Gentle upward float
        },
        opacity: 1,
        life: 180, // 3 seconds at 60fps
      });
    }

    setNextId((prev) => prev + count);
    setDecorations((prev) => [...prev, ...newDecorations]);
  };

  useEffect(() => {
    if (decorations.length === 0) return;

    const interval = setInterval(() => {
      setDecorations((prev) => {
        const updated = prev
          .map((d) => ({
            ...d,
            x: d.x + d.velocity.x,
            y: d.y + d.velocity.y,
            rotation: d.rotation + 1,
            life: d.life - 1,
            opacity: Math.min(1, d.life / 60), // Fade out in last second
          }))
          .filter((d) => d.life > 0); // Remove when life expires

        return updated;
      });
    }, 1000 / 60);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- We intentionally use decorations.length > 0 to only restart when transitioning between 0 and non-zero decorations
  }, [decorations.length > 0]);

  const DecorationsRender = () => (
    <>
      {decorations.map((d) => (
        <div
          key={d.id}
          className="holland-decoration"
          style={{
            left: `${d.x}px`,
            top: `${d.y}px`,
            transform: `rotate(${d.rotation}deg) scale(${d.scale})`,
            opacity: d.opacity,
          }}
        >
          {d.emoji}
        </div>
      ))}
    </>
  );

  return {
    spawnUnicorns: () => spawnDecorations('unicorn', 5),
    spawnRainbows: () => spawnDecorations('rainbow', 6),
    spawnIceCream: () => spawnDecorations('icecream', 8),
    spawnStars: () => spawnDecorations('stars', 12),
    spawnHearts: () => spawnDecorations('hearts', 10),
    DecorationsRender,
  };
};
