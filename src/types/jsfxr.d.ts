declare module 'jsfxr' {
  interface SfxrSound {
    // Internal representation
  }

  interface Sfxr {
    generate(preset: string): SfxrSound;
    play(sound: SfxrSound): void;
  }

  export const sfxr: Sfxr;
}
