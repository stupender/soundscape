// FOLLOWING A PITCH, STEADILY — what the Tune row shows (ui/TuneRow.tsx; the same as
// Soundscape Live's tuner), from the
// readings audio/pitchFind.ts makes about forty times a second. A raw reading
// jumps (a pluck's attack, a breath, a stray octave); this keeps the line
// continuous and calm, the way a good tuner's needle is:
//
//   glide      each reading moves the pitch only part of the way there:
//              quickly while it's moving (tuning a peg), slowly once it's
//              settled within a few cents, so it holds still when you're close
//   a new note a jump of more than 60 cents is a new note only once two
//              readings agree (a stray one is ignored)
//   octaves    a jump of an octave is usually the finder slipping on a strong
//              overtone: ignored, unless it persists
//   hold       when the readings stop (the string fades), the last pitch is
//              held for 0.7 s before it lets go
import { findPitch } from './pitchFind.ts';

const cents = (a: number, b: number) => 1200 * Math.log2(a / b);
const HOLD = 700;
const EVERY = 25;

/** Follow the pitch in `analyser`; `onPitch` gets the steady pitch (Hz), or null, each time it's read. Returns stop. */
export function trackPitch(analyser: AnalyserNode, rate: number, onPitch: (hz: number | null) => void, lo = 50, hi = 1600): () => void {
  // The last 2048 samples are enough for a low E (three periods) and quicker to search.
  const whole = new Float32Array(analyser.fftSize);
  const n = Math.min(2048, analyser.fftSize);
  let cur: number | null = null;
  let cand: number | null = null;
  let agree = 0;
  let octaves = 0;
  let seen = 0;
  let raf = 0, last = 0;

  const tick = (t: number) => {
    raf = requestAnimationFrame(tick);
    if (t - last < EVERY) return;
    last = t;
    analyser.getFloatTimeDomainData(whole);
    const f = findPitch(whole.subarray(whole.length - n), rate, lo, hi)?.hz ?? null;
    if (f === null) {
      if (cur !== null && t - seen > HOLD) { cur = null; cand = null; agree = 0; }
      onPitch(cur);
      return;
    }
    seen = t;
    if (cur === null) {
      // A first note: wait for two readings that agree.
      if (cand !== null && Math.abs(cents(f, cand)) < 50) agree++; else { cand = f; agree = 1; }
      if (agree >= 2) { cur = f; octaves = 0; }
      onPitch(cur);
      return;
    }
    const d = cents(f, cur);
    if (Math.abs(d) < 60) {
      // Glide: a quarter of the way while it moves, a tenth once it's settled.
      const k = Math.abs(d) > 12 ? 0.3 : 0.12;
      cur = cur * Math.pow(2, (d * k) / 1200);
      cand = null; agree = 0; octaves = 0;
    } else if (Math.abs(Math.abs(d) - 1200) < 45 && ++octaves < 6) {
      // An octave slip: hold where it was.
    } else {
      // A new note, once two readings agree.
      if (cand !== null && Math.abs(cents(f, cand)) < 50) agree++; else { cand = f; agree = 1; }
      if (agree >= 2) { cur = f; cand = null; agree = 0; octaves = 0; }
    }
    onPitch(cur);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}
