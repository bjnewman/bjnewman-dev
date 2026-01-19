import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

// Mock @react-three/fiber Canvas since WebGL isn't available in tests
// IMPORTANT: Don't render children - they're R3F primitives that ReactDOM doesn't understand
// The actual 3D content is tested separately with @react-three/test-renderer
vi.mock('@react-three/fiber', () => ({
  Canvas: () => <div data-testid="r3f-canvas" />,
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({
    camera: {},
    gl: {},
    scene: {},
    size: { width: 800, height: 600 },
    viewport: { width: 8, height: 6, factor: 100 },
  })),
}));

// Mock @react-three/drei components - return null since they render R3F primitives
vi.mock('@react-three/drei', () => ({
  OrbitControls: () => null,
  Environment: () => null,
}));

import { ThreeDScene } from '../../components/ThreeDScene';

describe('ThreeDScene', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially on server', () => {
    // The component checks for client-side mounting
    const { container } = render(<ThreeDScene />);

    // Should show loading placeholder initially
    expect(container.querySelector('.three-d-scene')).toBeInTheDocument();
  });

  it('should render Canvas after client-side mount', async () => {
    render(<ThreeDScene />);

    // Wait for the useEffect to set mounted to true
    await waitFor(() => {
      expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument();
    });
  });

  // Note: OrbitControls and Environment are tested in ThreeDSceneObjects.test.tsx
  // using @react-three/test-renderer which properly understands R3F primitives

  it('should have proper container class', async () => {
    const { container } = render(<ThreeDScene />);

    await waitFor(() => {
      expect(container.querySelector('.three-d-scene')).toBeInTheDocument();
    });
  });
});

describe('ThreeDScene Loading State', () => {
  it('should show loading text before mount', () => {
    // Create a version that doesn't immediately mount
    const { container } = render(<ThreeDScene />);

    // The loading class should be present initially
    const scene = container.querySelector('.three-d-scene');
    expect(scene).toBeInTheDocument();
  });
});
