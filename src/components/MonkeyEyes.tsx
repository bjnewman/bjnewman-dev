import { useState, useEffect, useRef } from 'react';

export const MonkeyEyes: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const eyeLeftRef = useRef<HTMLDivElement>(null);
  const eyeRightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const calculatePupilPosition = (eyeRef: React.RefObject<HTMLDivElement>) => {
    if (!eyeRef.current) return { x: 0, y: 0 };

    const eyeRect = eyeRef.current.getBoundingClientRect();
    const eyeCenterX = eyeRect.left + eyeRect.width / 2;
    const eyeCenterY = eyeRect.top + eyeRect.height / 2;

    // Calculate angle from eye center to mouse
    const angle = Math.atan2(
      mousePosition.y - eyeCenterY,
      mousePosition.x - eyeCenterX
    );

    // Calculate distance, but constrain it to stay within the eye
    const distance = Math.min(
      Math.hypot(mousePosition.x - eyeCenterX, mousePosition.y - eyeCenterY),
      eyeRect.width * 0.25 // Pupils can move 25% of eye width from center
    );

    // Convert polar coordinates (angle, distance) to cartesian (x, y)
    const pupilX = Math.cos(angle) * distance;
    const pupilY = Math.sin(angle) * distance;

    return { x: pupilX, y: pupilY };
  };

  const leftPupilPos = calculatePupilPosition(eyeLeftRef);
  const rightPupilPos = calculatePupilPosition(eyeRightRef);

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '40px',
        zIndex: 9997,
        pointerEvents: 'none',
      }}
    >
      {/* Left Eye */}
      <div
        ref={eyeLeftRef}
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: 'white',
          border: '4px solid var(--pastel-pink, #ffc0cb)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            backgroundColor: '#333',
            transform: `translate(${leftPupilPos.x}px, ${leftPupilPos.y}px)`,
            transition: 'transform 0.1s ease-out',
            position: 'relative',
          }}
        >
          {/* Highlight */}
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: 'white',
              position: 'absolute',
              top: '5px',
              left: '5px',
            }}
          />
        </div>
      </div>

      {/* Right Eye */}
      <div
        ref={eyeRightRef}
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: 'white',
          border: '4px solid var(--pastel-blue, #b0e0e6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            backgroundColor: '#333',
            transform: `translate(${rightPupilPos.x}px, ${rightPupilPos.y}px)`,
            transition: 'transform 0.1s ease-out',
            position: 'relative',
          }}
        >
          {/* Highlight */}
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: 'white',
              position: 'absolute',
              top: '5px',
              left: '5px',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default MonkeyEyes;
