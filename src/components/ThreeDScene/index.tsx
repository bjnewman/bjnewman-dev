import { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Scene } from './Scene';
import { Loader } from './Loader';

/**
 * ThreeDScene - Main 3D landing page component
 *
 * Uses React Three Fiber for declarative 3D rendering.
 * Wrapped in client-side check since WebGL requires browser APIs.
 */
export function ThreeDScene() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until client-side (WebGL needs browser)
  if (!mounted) {
    return (
      <div className="three-d-scene three-d-scene--loading">
        <div className="three-d-scene__placeholder">
          Loading 3D scene...
        </div>
      </div>
    );
  }

  return (
    <div className="three-d-scene">
      <Canvas
        shadows
        camera={{ position: [3, 3, 3], fov: 60 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <Suspense fallback={<Loader />}>
          <Scene />
        </Suspense>
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={2}
          maxDistance={15}
          maxPolarAngle={Math.PI / 2.1}
        />
        <Environment preset="apartment" />
      </Canvas>
    </div>
  );
}
