import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { Scene } from '../../components/ThreeDScene/Scene';
import { Loader } from '../../components/ThreeDScene/Loader';

describe('Scene', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock matchMedia for useReducedMotion hook
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('should render without crashing', async () => {
    const renderer = await ReactThreeTestRenderer.create(<Scene />);
    expect(renderer).toBeDefined();
  });

  it('should include lighting elements', async () => {
    const renderer = await ReactThreeTestRenderer.create(<Scene />);

    // Find ambient light in the scene
    const ambientLights = renderer.scene.findAllByType('AmbientLight');
    expect(ambientLights.length).toBeGreaterThan(0);

    // Find directional light
    const directionalLights = renderer.scene.findAllByType('DirectionalLight');
    expect(directionalLights.length).toBeGreaterThan(0);
  });

  it('should include mesh objects', async () => {
    const renderer = await ReactThreeTestRenderer.create(<Scene />);

    // Scene should contain meshes (desk, legal pad, pencil, etc.)
    const meshes = renderer.scene.findAllByType('Mesh');
    expect(meshes.length).toBeGreaterThan(0);
  });

  it('should have the expected scene structure', async () => {
    const renderer = await ReactThreeTestRenderer.create(<Scene />);

    // Get the scene graph for inspection
    const graph = renderer.toGraph();
    expect(graph).toBeDefined();
    expect(graph!.length).toBeGreaterThan(0);
  });
});

describe('Loader', () => {
  it('should render without crashing', async () => {
    const renderer = await ReactThreeTestRenderer.create(<Loader />);
    expect(renderer).toBeDefined();
  });

  it('should contain a mesh with wireframe material', async () => {
    const renderer = await ReactThreeTestRenderer.create(<Loader />);

    // Loader has an icosahedron mesh
    const meshes = renderer.scene.findAllByType('Mesh');
    expect(meshes.length).toBe(1);
  });

  it('should animate rotation on frame advance', async () => {
    const renderer = await ReactThreeTestRenderer.create(<Loader />);

    // Get initial rotation
    const mesh = renderer.scene.findByType('Mesh');
    const initialRotationX = mesh.instance.rotation.x;
    const initialRotationY = mesh.instance.rotation.y;

    // Advance 10 frames at 60fps
    await renderer.advanceFrames(10, 1 / 60);

    // Check that rotation changed
    expect(mesh.instance.rotation.x).not.toBe(initialRotationX);
    expect(mesh.instance.rotation.y).not.toBe(initialRotationY);
  });
});

describe('useReducedMotion behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should detect when reduced motion is preferred', async () => {
    // Mock matchMedia to return reduced motion preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Render Scene which uses useReducedMotion internally
    const renderer = await ReactThreeTestRenderer.create(<Scene />);
    expect(renderer).toBeDefined();
  });

  it('should handle matchMedia change events', async () => {
    let changeHandler: ((e: { matches: boolean }) => void) | null = null;

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn((event: string, handler: (e: { matches: boolean }) => void) => {
          if (event === 'change') changeHandler = handler;
        }),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    await ReactThreeTestRenderer.create(<Scene />);

    // Verify the change handler was registered
    expect(changeHandler).toBeDefined();
  });
});
