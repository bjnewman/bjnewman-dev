import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';

/**
 * Loading indicator displayed while 3D assets load
 * Shows a simple rotating wireframe sphere
 */
export function Loader() {
  const meshRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.7;
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1, 1]} />
      <meshBasicMaterial color="#6366f1" wireframe />
    </mesh>
  );
}
