import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh, Group } from 'three';

/**
 * Custom hook for respecting prefers-reduced-motion
 */
function useReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
}

/**
 * Interactive box that responds to hover and click
 */
function InteractiveBox({
  position,
  color,
  hoverColor,
}: {
  position: [number, number, number];
  color: string;
  hoverColor: string;
}) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useFrame((state, delta) => {
    if (meshRef.current && !prefersReducedMotion) {
      // Gentle floating animation
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.05;

      // Subtle rotation when hovered
      if (hovered) {
        meshRef.current.rotation.y += delta * 0.5;
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={clicked ? 1.2 : hovered ? 1.1 : 1}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => setClicked(!clicked)}
      castShadow
    >
      <boxGeometry args={[0.8, 0.8, 0.8]} />
      <meshStandardMaterial
        color={hovered ? hoverColor : color}
        roughness={0.5}
        metalness={0.1}
      />
    </mesh>
  );
}

/**
 * Simple desk surface
 */
function Desk() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.5, 0]}
      receiveShadow
    >
      <planeGeometry args={[8, 6]} />
      <meshStandardMaterial
        color="#8B5A2B"
        roughness={0.8}
        metalness={0.0}
      />
    </mesh>
  );
}

/**
 * Simple legal pad representation
 */
function LegalPad() {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);

  return (
    <group
      ref={groupRef}
      position={[-0.8, -0.38, 0.3]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Paper stack */}
      <mesh castShadow position={[0, 0, 0]}>
        <boxGeometry args={[1.2, 0.08, 1.6]} />
        <meshStandardMaterial
          color={hovered ? '#FFFF99' : '#FFFFC0'}
          roughness={0.9}
        />
      </mesh>
      {/* Red margin line */}
      <mesh position={[-0.45, 0.041, 0]}>
        <boxGeometry args={[0.02, 0.001, 1.55]} />
        <meshStandardMaterial color="#CC3333" />
      </mesh>
      {/* Blue lines (simplified) */}
      {[-0.5, -0.25, 0, 0.25, 0.5].map((z, i) => (
        <mesh key={i} position={[0.1, 0.041, z]}>
          <boxGeometry args={[0.9, 0.001, 0.015]} />
          <meshStandardMaterial color="#6699CC" />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Simple pencil
 */
function Pencil() {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);

  return (
    <group
      ref={groupRef}
      position={[0.8, -0.35, 0.5]}
      rotation={[0, Math.PI / 6, Math.PI / 2]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.05 : 1}
    >
      {/* Pencil body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.04, 0.04, 1.2, 6]} />
        <meshStandardMaterial color="#FFD700" roughness={0.6} />
      </mesh>
      {/* Pencil tip */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <coneGeometry args={[0.04, 0.1, 6]} />
        <meshStandardMaterial color="#DEB887" roughness={0.8} />
      </mesh>
      {/* Graphite */}
      <mesh position={[0, 0.72, 0]}>
        <coneGeometry args={[0.015, 0.04, 6]} />
        <meshStandardMaterial color="#2F4F4F" roughness={0.3} />
      </mesh>
      {/* Eraser */}
      <mesh position={[0, -0.65, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.045, 0.1, 8]} />
        <meshStandardMaterial color="#FFB6C1" roughness={0.7} />
      </mesh>
      {/* Metal band */}
      <mesh position={[0, -0.55, 0]}>
        <cylinderGeometry args={[0.048, 0.048, 0.08, 8]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

/**
 * Simple coffee mug
 */
function CoffeeMug() {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);

  return (
    <group
      ref={groupRef}
      position={[1.2, -0.25, -0.5]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.05 : 1}
    >
      {/* Mug body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.2, 0.18, 0.4, 32]} />
        <meshStandardMaterial
          color={hovered ? '#FFFFFF' : '#F5F5F5'}
          roughness={0.3}
        />
      </mesh>
      {/* Coffee surface */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.17, 0.17, 0.02, 32]} />
        <meshStandardMaterial color="#3C1414" roughness={0.1} />
      </mesh>
      {/* Handle */}
      <mesh position={[0.25, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <torusGeometry args={[0.1, 0.025, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#F5F5F5" roughness={0.3} />
      </mesh>
    </group>
  );
}

/**
 * Main scene composition
 */
export function Scene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 8, 3]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={20}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
      <pointLight position={[-3, 3, -3]} intensity={0.3} color="#FFF5E6" />

      {/* Scene objects */}
      <Desk />
      <LegalPad />
      <Pencil />
      <CoffeeMug />

      {/* Interactive demo cubes */}
      <InteractiveBox position={[-1.5, 0.1, -1]} color="#6366f1" hoverColor="#818cf8" />
      <InteractiveBox position={[0, 0.1, -1.2]} color="#ec4899" hoverColor="#f472b6" />
      <InteractiveBox position={[1.5, 0.1, -0.8]} color="#10b981" hoverColor="#34d399" />
    </>
  );
}
