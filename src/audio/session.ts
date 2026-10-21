// A SESSION — a bell, the soundscape underneath, a bell.
//
// Carried over from Becoming's session timer (lib/session.tsx there), which
// came from Archive's "wellness-studio" idea. A session is a length of time
// given to a practice: one bell to open, the soundscape rising beneath it,
// the soundscape falling away over the last half-minute, and three bells to
// close.
//
// THE BELL is a singing bowl, synthesised and tuned to the room's Sa: a
// handful of inharmonic partials, each dying away at its own rate (the upper
// ones faster), with a slightly detuned twin of the fundamental for the slow
// beating a real bowl has.
//
// The bell goes into the soundscape bus, so a session bell is recorded into
// the soundscape track like any other layer.
//
// TIME is kept against the clock, not by counting ticks, so a phone that
// slows background timers still ends on time.
import { getEngine, glide } from './engine.ts';

/** One strike of the bowl at `when` (audio clock), pitched two octaves above Sa. */
export function strike(sa: number, when: number, strength = 1): void {
  const { ctx, bed, air } = getEngine();
  const partials: [ratio: number, gain: number, decay: number][] = [
    [1, 0.5, 9], [1.004, 0.28, 8.5], [2.72, 0.24, 5.5], [5.18, 0.1, 3.2], [8.46, 0.045, 1.8], [2, 0.08, 6],
  ];
  for (const [ratio, gain, decay] of partials) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = sa * 2 * ratio;
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(gain * 0.32 * strength, when + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, when + decay);
    o.connect(g);
    g.connect(bed);
    g.connect(air);
    o.start(when);
    o.stop(when + decay + 0.1);
  }
}

export interface SessionState {
  running: boolean;
  /** Length in seconds. */
  total: number;
  /** Seconds gone. */
  elapsed: number;
}

let state: SessionState = { running: false, total: 0, elapsed: 0 };
let startedAt = 0;
let fadingOut = false;
let timer: number | null = null;
let getSa: () => number = () => 130.81;
const listeners = new Set<(s: SessionState) => void>();

const tell = () => listeners.forEach((fn) => fn({ ...state }));

export function onSession(fn: (s: SessionState) => void): () => void {
  listeners.add(fn);
  fn({ ...state });
  return () => { listeners.delete(fn); };
}

/** Begin a session of `minutes`. `sa` is read at each bell, so the bell follows key changes. */
export function startSession(minutes: number, sa: () => number): void {
  if (state.running) return;
  getSa = sa;
  const { ctx, fade } = getEngine();
  const t = ctx.currentTime;
  strike(getSa(), t + 0.2);
  // The soundscape rises beneath the ringing bell.
  fade.gain.cancelScheduledValues(t);
  fade.gain.setValueAtTime(0, t);
  fade.gain.setValueAtTime(0, t + 2.5);
  fade.gain.linearRampToValueAtTime(1, t + 14);
  startedAt = performance.now();
  fadingOut = false;
  state = { running: true, total: minutes * 60, elapsed: 0 };
  timer = window.setInterval(tickSession, 500);
  tell();
}

function tickSession() {
  state.elapsed = (performance.now() - startedAt) / 1000;
  const left = state.total - state.elapsed;
  if (!fadingOut && left <= 30) {
    fadingOut = true;
    glide(getEngine().fade.gain, 0, Math.max(left, 1));
  }
  if (left <= 0) endSession(false);
  else tell();
}

/** End the session: three bells (or one, if ended early) and the soundscape returns. */
export function endSession(early: boolean): void {
  if (!state.running) return;
  if (timer) clearInterval(timer);
  timer = null;
  const { ctx, fade } = getEngine();
  const t = ctx.currentTime;
  const strikes = early ? 1 : 3;
  for (let i = 0; i < strikes; i++) strike(getSa(), t + 0.4 + i * 4.5, i === strikes - 1 ? 1 : 0.85);
  // Leave the room quiet while the bells ring, then let the soundscape back.
  fade.gain.cancelScheduledValues(t);
  fade.gain.setValueAtTime(fade.gain.value, t);
  fade.gain.linearRampToValueAtTime(0, t + 2);
  fade.gain.setValueAtTime(0, t + strikes * 4.5 + 6);
  fade.gain.linearRampToValueAtTime(1, t + strikes * 4.5 + 12);
  state = { running: false, total: state.total, elapsed: state.elapsed };
  tell();
}
