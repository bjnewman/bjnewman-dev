/**
 * Monkey Eyes Component
 *
 * Based on CSS Monkey by Suzanne Aitchison
 * Original: https://codepen.io/aitchiss/pen/mdPVKew
 * Licensed under MIT License
 * Modified to add mouse-tracking functionality
 */

import { useState, useEffect, useRef } from 'react';

interface MonkeyEyesProps {
  visible?: boolean;
  position?: 'top' | 'bottom' | 'center';
}

export const MonkeyEyes: React.FC<MonkeyEyesProps> = ({ visible = true, position = 'center' }) => {
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

  const calculateEyePosition = (eyeRef: React.RefObject<HTMLDivElement>) => {
    if (!eyeRef.current) return { x: 0, y: 0 };

    const eyeRect = eyeRef.current.getBoundingClientRect();
    const eyeCenterX = eyeRect.left + eyeRect.width / 2;
    const eyeCenterY = eyeRect.top + eyeRect.height / 2;

    // Calculate angle from eye center to mouse
    const angle = Math.atan2(mousePosition.y - eyeCenterY, mousePosition.x - eyeCenterX);

    // Calculate distance, constrained to 2vmin radius
    const maxDistance = 8; // Constrained movement in pixels
    const distance = Math.min(
      Math.hypot(mousePosition.x - eyeCenterX, mousePosition.y - eyeCenterY) / 40,
      maxDistance
    );

    // Convert polar coordinates to cartesian
    const eyeX = Math.cos(angle) * distance;
    const eyeY = Math.sin(angle) * distance;

    return { x: eyeX, y: eyeY };
  };

  const leftEyePos = calculateEyePosition(eyeLeftRef);
  const rightEyePos = calculateEyePosition(eyeRightRef);

  // Position mapping
  const positionStyles = {
    top: { top: '20px', bottom: 'auto' },
    bottom: { bottom: '20px', top: 'auto' },
    center: { top: '50%', bottom: 'auto' },
  };

  if (!visible) return null;

  // CSS variables matching Suzanne Aitchison's design
  const brown = '#9E5936';
  const brownLight = '#EABE7F';
  const vmin = Math.min(window.innerWidth, window.innerHeight) / 100;

  return (
    <div
      style={{
        position: 'fixed',
        left: '50%',
        ...positionStyles[position],
        transform: position === 'center' ? 'translate(-50%, -50%)' : 'translateX(-50%)',
        width: `${35 * vmin}px`,
        height: `${21 * vmin}px`,
        zIndex: 9997,
        pointerEvents: 'none',
      }}
    >
      {/* Head wrapper */}
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* Left Ear */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            transform: 'translateY(-70%)',
            background: brownLight,
            width: `${5 * vmin}px`,
            height: `${5 * vmin}px`,
            borderRadius: '50%',
            border: `${3 * vmin}px solid ${brown}`,
          }}
        />

        {/* Right Ear */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            right: 0,
            transform: 'translateY(-70%)',
            background: brownLight,
            width: `${5 * vmin}px`,
            height: `${5 * vmin}px`,
            borderRadius: '50%',
            border: `${3 * vmin}px solid ${brown}`,
          }}
        />

        {/* Head */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            width: `${25 * vmin}px`,
            height: `${20 * vmin}px`,
            background: brown,
            borderRadius: '50%',
            border: `${0.5 * vmin}px solid #9B512D`,
          }}
        >
          {/* Face Mask - Left */}
          <div
            style={{
              position: 'absolute',
              width: `${10 * vmin}px`,
              height: `${7 * vmin}px`,
              borderRadius: '50%',
              background: brownLight,
              left: `${3 * vmin}px`,
              top: `${5 * vmin}px`,
            }}
          />

          {/* Face Mask - Right */}
          <div
            style={{
              position: 'absolute',
              width: `${10 * vmin}px`,
              height: `${7 * vmin}px`,
              borderRadius: '50%',
              background: brownLight,
              left: `${12 * vmin}px`,
              top: `${5 * vmin}px`,
            }}
          />

          {/* Face Mask - Bottom */}
          <div
            style={{
              position: 'absolute',
              width: `${15 * vmin}px`,
              height: `${7 * vmin}px`,
              borderRadius: '50%',
              background: brownLight,
              bottom: 0,
              left: `${5 * vmin}px`,
            }}
          />

          {/* Left Eye */}
          <div
            ref={eyeLeftRef}
            style={{
              position: 'absolute',
              background: 'black',
              borderRadius: '50%',
              border: `${1 * vmin}px solid white`,
              width: `${2 * vmin}px`,
              height: `${2 * vmin}px`,
              top: `${7 * vmin}px`,
              left: `${6 * vmin}px`,
              transform: `translate(${leftEyePos.x}px, ${leftEyePos.y}px)`,
              transition: 'transform 0.1s ease-out',
            }}
          >
            {/* Eye highlight */}
            <div
              style={{
                position: 'absolute',
                width: `${1 * vmin}px`,
                height: `${1 * vmin}px`,
                background: 'white',
                borderRadius: '50%',
                right: 0,
              }}
            />
          </div>

          {/* Right Eye */}
          <div
            ref={eyeRightRef}
            style={{
              position: 'absolute',
              background: 'black',
              borderRadius: '50%',
              border: `${1 * vmin}px solid white`,
              width: `${2 * vmin}px`,
              height: `${2 * vmin}px`,
              top: `${7 * vmin}px`,
              right: `${6 * vmin}px`,
              transform: `translate(${rightEyePos.x}px, ${rightEyePos.y}px)`,
              transition: 'transform 0.1s ease-out',
            }}
          >
            {/* Eye highlight */}
            <div
              style={{
                position: 'absolute',
                width: `${1 * vmin}px`,
                height: `${1 * vmin}px`,
                background: 'white',
                borderRadius: '50%',
                right: 0,
              }}
            />
          </div>

          {/* Mouth */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              bottom: `${5 * vmin}px`,
              width: `${10 * vmin}px`,
              height: `${3 * vmin}px`,
              borderRadius: '50%',
              boxShadow: `0 ${1 * vmin}px 0 black`,
            }}
          >
            {/* Nose left */}
            <div
              style={{
                position: 'absolute',
                width: `${1.5 * vmin}px`,
                height: `${1.5 * vmin}px`,
                background: 'black',
                left: `${3 * vmin}px`,
                top: `${-0.5 * vmin}px`,
                borderRadius: '20% 50%',
              }}
            />

            {/* Nose right */}
            <div
              style={{
                position: 'absolute',
                width: `${1.5 * vmin}px`,
                height: `${1.5 * vmin}px`,
                background: 'black',
                right: `${3 * vmin}px`,
                top: `${-0.5 * vmin}px`,
                borderRadius: '50% 20%',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonkeyEyes;
