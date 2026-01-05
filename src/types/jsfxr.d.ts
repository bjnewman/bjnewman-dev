declare module 'jsfxr' {
  interface SfxrSound {
    // Internal representation
  }

  interface Sfxr {
    generate(preset: string): SfxrSound;
    play(sound: SfxrSound): void;
  }

  interface Jsfxr {
    sfxr: Sfxr;
  }

  const jsfxr: Jsfxr;
  export default jsfxr;
}
