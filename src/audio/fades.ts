// FADES — how sound comes in and goes into silence.
//
// Ears hear loudness in decibels, so a fade drawn as a straight line in
// volume sounds like a slow fade that suddenly drops away at the end (the
// last tenth of its time covers everything from −20 dB to silence). Here
// every fade is drawn in decibels, evenly, down to −60 dB (where it's gone
// to the ear) and only then to nothing: silence arrives without a step.
//
// And every change starts from exactly where the sound is now. Without that,
// moving a slider while a layer is still fading in made the volume drop to
// nothing for a moment before rising to the new level.

/** Seconds a layer takes to come in, and to go into silence. */
export const FADE_IN = 2.5;
export const FADE_OUT = 4;

/** Below this a fade is silence to the ear; the curve goes to nothing from here. */
const FLOOR_DB = -60;
const toDb = (g: number) => (g <= 0 ? FLOOR_DB : Math.max(FLOOR_DB, 20 * Math.log10(g)));

/** The gain at `p` (0–1) of the way through a fade from `from` to `to`. */
function gainAt(from: number, to: number, p: number): number {
  if (p >= 1) return to;
  if (p <= 0) return from;
  const db = toDb(from) + (toDb(to) - toDb(from)) * p;
  return Math.pow(10, db / 20);
}

/** The fade from `from` to `to` as a list of gains, for setValueCurveAtTime. */
function curveOf(from: number, to: number, seconds: number): Float32Array<ArrayBuffer> {
  const n = Math.max(32, Math.min(2048, Math.round(seconds * 120)));
  const c = new Float32Array(n);
  for (let i = 0; i < n; i++) c[i] = gainAt(from, to, i / (n - 1));
  c[0] = from;
  c[n - 1] = to;
  return c;
}

/** Hold `param` exactly where it is now, cancelling anything scheduled after. */
export function holdNow(param: AudioParam, t: number): void {
  const p = param as AudioParam & { cancelAndHoldAtTime?: (t: number) => AudioParam };
  if (p.cancelAndHoldAtTime) p.cancelAndHoldAtTime(t);
  else { const v = param.value; param.cancelScheduledValues(t); param.setValueAtTime(v, t); }
}

/** Fade `param` from wherever it is (or from `from`) to `to` over `seconds`. */
export function fadeTo(ctx: BaseAudioContext, param: AudioParam, to: number, seconds: number, from?: number): void {
  const t = ctx.currentTime;
  holdNow(param, t);
  const start = from ?? param.value;
  if (seconds < 0.03 || Math.abs(start - to) < 1e-5) { param.setTargetAtTime(to, t, 0.01); return; }
  // A curve can't begin at the very instant of the hold: start a hair later.
  param.setValueCurveAtTime(curveOf(start, to, seconds), t + 0.002, seconds);
}

/** Schedule a fade from `from` to `to` starting at time `at` (nothing is held or cancelled). */
export function fadeAt(param: AudioParam, from: number, to: number, at: number, seconds: number): void {
  param.setValueCurveAtTime(curveOf(from, to, seconds), at, seconds);
}
