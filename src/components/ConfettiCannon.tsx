import { useState, useEffect } from 'react';

interface Confetti {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  velocity: { x: number; y: number };
}

export const useConfetti = () => {
  const [confetti, setConfetti] = useState<Confetti[]>([]);

  const fireConfetti = () => {
    const colors = ['#FFD1DC', '#BFDFFF', '#FFFFD1', '#CCFFCC', '#E6D1FF'];
    const newConfetti: Confetti[] = [];

    for (let i = 0; i < 50; i++) {
      newConfetti.push({
        id: Date.now() + i,
        x: Math.random() * window.innerWidth,
        y: -10,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        velocity: {
          x: (Math.random() - 0.5) * 4,
          y: Math.random() * 3 + 2,
        },
      });
    }

    setConfetti(prev => [...prev, ...newConfetti]);
  };

  useEffect(() => {
    if (confetti.length === 0) return;

    const interval = setInterval(() => {
      setConfetti(prev => {
        const updated = prev
          .map(c => ({
            ...c,
            x: c.x + c.velocity.x,
            y: c.y + c.velocity.y,
            rotation: c.rotation + 5,
            velocity: {
              x: c.velocity.x * 0.99,
              y: c.velocity.y + 0.1, // gravity
            },
          }))
          .filter(c => c.y < window.innerHeight + 10);

        return updated;
      });
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [confetti.length > 0]);

  const ConfettiRender = () => (
    <>
      {confetti.map(c => (
        <div
          key={c.id}
          className="confetti-piece"
          style={{
            left: `${c.x}px`,
            top: `${c.y}px`,
            backgroundColor: c.color,
            transform: `rotate(${c.rotation}deg)`,
          }}
        />
      ))}
    </>
  );

  return { fireConfetti, ConfettiRender };
};
