// A SOUND — the shape every soundscape layer shares.
//
// A field recording, the shruti box: each one is a `Sound`. It has an
// `out` (where its audio leaves), it can `stop`, and if it is pitched it can
// `retune` when the key changes. The layer manager (layers.ts) doesn't need to
// know which kind it is holding.
//
// `shell()` does the housekeeping every generator needs: a place to keep the
// running sources and timers, so that `stop()` really stops everything.
import type { Key } from '../data/keys.ts';

export interface SoundEnv {
  /** Sa in Hz for the current key. */
  sa: number;
  key: Key;
  /** The shared reverb, for sounds that want distance. */
  air: AudioNode;
}

export interface Sound {
  out: GainNode;
  stop(): void;
  retune?(sa: number, key: Key): void;
}

export type SoundMaker = (ctx: AudioContext, env: SoundEnv) => Sound | Promise<Sound>;

export interface Shell {
  out: GainNode;
  /** Remember a source so stop() can end it. */
  keep<T extends AudioScheduledSourceNode>(src: T): T;
  /**
   * Run `fn` four times a second. Generators use it as a "look-ahead"
   * scheduler: each tick books any events due in the next second or so on the
   * audio clock, which keeps perfect time even though timers themselves wobble.
   */
  tick(fn: () => void): void;
  stop(): void;
}

export function shell(ctx: AudioContext): Shell {
  const out = ctx.createGain();
  const sources: AudioScheduledSourceNode[] = [];
  const timers: number[] = [];
  return {
    out,
    keep(src) {
      sources.push(src);
      return src;
    },
    tick(fn) {
      fn();
      timers.push(window.setInterval(fn, 250));
    },
    stop() {
      timers.forEach((t) => clearInterval(t));
      sources.forEach((s) => {
        try { s.stop(); } catch { /* already stopped */ }
      });
      out.disconnect();
    },
  };
}
