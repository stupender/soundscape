// RECORDINGS AS LAYERS — the Soundscape in 12 Keys, and your own uploads.
//
// A recording loops forever under you. A plain loop would click or jump where
// the end meets the beginning, so each pass fades in while the last one is
// still fading out: an equal-power CROSSFADE of several seconds, so the seam
// can't be heard (see LEARNED.md).
//
// Very long files (an hour-long soundscape is 1.3 GB once decoded) are not
// decoded at all: they stream from an <audio> element instead, which loops on
// its own. Anything over 40 MB takes that path.
//
// The 12-keys layer swaps recordings when the key changes, crossfading from
// the old key to the new one.
import { KEYS, type Key } from '../data/keys.ts';
import { shell, type Sound, type SoundMaker } from './sound.ts';

const decoded = new Map<string, Promise<AudioBuffer>>();

/** Fetch and decode an audio file once; later calls share the same result. */
export function loadBuffer(ctx: AudioContext, url: string): Promise<AudioBuffer> {
  let p = decoded.get(url);
  if (!p) {
    p = fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`Couldn't load ${url} (${r.status})`);
        return r.arrayBuffer();
      })
      .then((data) => ctx.decodeAudioData(data));
    p.catch(() => decoded.delete(url));
    decoded.set(url, p);
  }
  return p;
}

/** Loop a decoded buffer forever, crossfading each pass into the next. */
export function crossfadeLoop(ctx: AudioContext, buffer: AudioBuffer, dest: AudioNode): () => void {
  const xf = Math.min(8, buffer.duration / 4);
  const pass = buffer.duration - xf;
  const live: AudioBufferSourceNode[] = [];
  let next = ctx.currentTime + 0.05;
  let first = true;

  const book = () => {
    while (next < ctx.currentTime + 2) {
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const g = ctx.createGain();
      // Equal-power curves: sine in, cosine out, so the loudness holds steady.
      const steps = 32;
      const fadeIn = new Float32Array(steps);
      const fadeOut = new Float32Array(steps);
      for (let i = 0; i < steps; i++) {
        const x = i / (steps - 1);
        fadeIn[i] = Math.sin((x * Math.PI) / 2);
        fadeOut[i] = Math.cos((x * Math.PI) / 2);
      }
      if (first) g.gain.setValueAtTime(1, next);
      else g.gain.setValueCurveAtTime(fadeIn, next, xf);
      g.gain.setValueCurveAtTime(fadeOut, next + pass, xf);
      src.connect(g).connect(dest);
      src.start(next);
      src.stop(next + buffer.duration + 0.05);
      src.onended = () => {
        const i = live.indexOf(src);
        if (i >= 0) live.splice(i, 1);
      };
      live.push(src);
      first = false;
      next += pass;
    }
  };
  book();
  const timer = window.setInterval(book, 500);
  return () => {
    clearInterval(timer);
    live.forEach((s) => {
      try { s.stop(); } catch { /* done already */ }
    });
  };
}

/** Stream a long file through an <audio> element that loops on its own. */
function streamLoop(ctx: AudioContext, url: string, dest: AudioNode): () => void {
  const el = new Audio(url);
  el.loop = true;
  el.crossOrigin = 'anonymous';
  ctx.createMediaElementSource(el).connect(dest);
  void el.play();
  return () => {
    el.pause();
    el.removeAttribute('src');
  };
}

const LARGE = 40 * 1024 * 1024;

/** A layer made from a file you chose (kept as a Blob in memory). */
export function uploadSound(blob: Blob): SoundMaker {
  return async (ctx) => {
    const s = shell(ctx);
    const url = URL.createObjectURL(blob);
    let stop: () => void;
    if (blob.size > LARGE) {
      stop = streamLoop(ctx, url, s.out);
    } else {
      const buffer = await loadBuffer(ctx, url);
      stop = crossfadeLoop(ctx, buffer, s.out);
    }
    return { out: s.out, stop: () => { stop(); s.stop(); } };
  };
}

/** A layer made from a file shipped with the app (public/audio/…). */
export function fileSound(path: string): SoundMaker {
  return async (ctx) => {
    const s = shell(ctx);
    const buffer = await loadBuffer(ctx, `${import.meta.env.BASE_URL}${path}`);
    const stop = crossfadeLoop(ctx, buffer, s.out);
    return { out: s.out, stop: () => { stop(); s.stop(); } };
  };
}

const keyUrl = (key: Key) => `${import.meta.env.BASE_URL}audio/keys/${key.file}`;

/**
 * THE SOUNDSCAPE IN 12 KEYS — Stu's own soundscape, one recording per key.
 * Changing the key crossfades over four seconds into that key's recording.
 */
export const keysSound: SoundMaker = async (ctx, env) => {
  const out = ctx.createGain();
  let current = { gain: ctx.createGain(), stop: () => {} };
  current.gain.connect(out);
  current.stop = crossfadeLoop(ctx, await loadBuffer(ctx, keyUrl(env.key)), current.gain);
  let wanted = env.key.name;

  const sound: Sound = {
    out,
    stop() {
      current.stop();
      out.disconnect();
    },
    async retune(_sa, key) {
      wanted = key.name;
      const buffer = await loadBuffer(ctx, keyUrl(key));
      if (wanted !== key.name) return; // the key changed again while loading
      const old = current;
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.connect(out);
      current = { gain, stop: crossfadeLoop(ctx, buffer, gain) };
      const t = ctx.currentTime;
      gain.gain.linearRampToValueAtTime(1, t + 4);
      old.gain.gain.setValueAtTime(old.gain.gain.value, t);
      old.gain.gain.linearRampToValueAtTime(0, t + 4);
      window.setTimeout(() => { old.stop(); old.gain.disconnect(); }, 4500);
    },
  };
  return sound;
};

/** Warm the cache for a key's recording, so switching to it is quick. */
export function preloadKey(ctx: AudioContext, name: string): void {
  const key = KEYS.find((k) => k.name === name);
  if (key) void loadBuffer(ctx, keyUrl(key));
}
