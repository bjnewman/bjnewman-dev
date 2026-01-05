import { describe, it, expect } from 'vitest';

describe('jsfxr ESM compatibility', () => {
  it('imports jsfxr without errors', async () => {
    // This test runs in the browser via Vitest browser mode
    // It will fail if the ESM import doesn't work
    const jsfxr = await import('jsfxr');
    expect(jsfxr).toBeDefined();
  });

  it('has sfxr object with generate and play methods', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jsfxr: any = await import('jsfxr');
    // Check various ways the module might export sfxr
    const sfxr = jsfxr.sfxr || jsfxr.default?.sfxr || jsfxr.default;

    expect(sfxr).toBeDefined();
    expect(typeof sfxr.generate).toBe('function');
    expect(typeof sfxr.play).toBe('function');
  });

  it('can generate a sound', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jsfxr: any = await import('jsfxr');
    const sfxr = jsfxr.sfxr || jsfxr.default?.sfxr || jsfxr.default;

    // Generate a sound - this should not throw
    const sound = sfxr.generate('blipSelect');
    expect(sound).toBeDefined();
  });
});
