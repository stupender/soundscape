// A SOUND — the shape every soundscape layer shares.
//
// Birds, ocean, shruti box, a recording: each one is a `Sound`. It has an
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

/** A random number between a and b. */
export const rand = (a: number, b: number) => a + Math.random() * (b - a);

/** A one-off pitched blip, used by birds and crickets: a sine that slides. */
export function blip(
  ctx: AudioContext,
  dest: AudioNode,
  when: number,
  opts: { from: number; to: number; dur: number; amp: number; pan?: number; vibrato?: number },
): void {
  const o = ctx.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(opts.from, when);
  o.frequency.exponentialRampToValueAtTime(opts.to, when + opts.dur);
  if (opts.vibrato) {
    const lfo = ctx.createOscillator();
    const depth = ctx.createGain();
    lfo.frequency.value = opts.vibrato;
    depth.gain.value = opts.from * 0.06;
    lfo.connect(depth).connect(o.frequency);
    lfo.start(when);
    lfo.stop(when + opts.dur + 0.05);
  }
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(opts.amp, when + Math.min(0.015, opts.dur / 3));
  g.gain.exponentialRampToValueAtTime(0.0001, when + opts.dur);
  const p = ctx.createStereoPanner();
  p.pan.value = opts.pan ?? 0;
  o.connect(g).connect(p).connect(dest);
  o.start(when);
  o.stop(when + opts.dur + 0.05);
}
