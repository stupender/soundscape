// THE AUDIO ENGINE — one AudioContext, and the buses everything plugs into.
//
//   layers ─┐
//   pads  ──┼─► bed ─► fade ─► level ─► duck ─► limiter ─┬─► your headphones
//   bell  ──┘     ▲                              └─► recorder (soundscape track)
//   air (reverb) ─┘
//
//   mic ─► voice ─┬─► recorder (voice track)
//                 ├─► meter + "space" picture
//                 └─► monitor (off unless you ask) ─► your headphones
//
// Why two tracks: the voice and the soundscape are kept apart all the way to
// the saved files, so after a take you can still rebalance them, clean the
// voice, or put the voice over a different soundscape later.
//
// `fade` belongs to the session timer (it rises and falls with the bells);
// `level` belongs to you (the soundscape slider). Keeping them as two nodes
// means neither ever fights the other.
//
// Browsers only allow sound after a tap, so the engine is made on first use,
// from inside a click.
import { airImpulse } from './noise.ts';

export interface Engine {
  ctx: AudioContext;
  /** Where every soundscape sound, pad and bell goes. */
  bed: GainNode;
  /** A shared reverb: sounds that want distance send a little here. */
  air: ConvolverNode;
  /** The session timer's fade. */
  fade: GainNode;
  /** Your soundscape level. */
  level: GainNode;
  /** Quiets the live soundscape while a take plays back. */
  duck: GainNode;
  /** The end of the soundscape chain: this is what's heard and recorded. */
  bedOut: DynamicsCompressorNode;
  /** The live microphone, after the channel pick and trim. */
  voice: GainNode;
  /** Hear yourself in the headphones (zero by default — see Voice.tsx). */
  monitor: GainNode;
  bedAnalyser: AnalyserNode;
  voiceAnalyser: AnalyserNode;
}

let engine: Engine | null = null;
let workletReady: Promise<void> | null = null;

/** The one engine, made on first use. Call it from a click or key press. */
export function getEngine(): Engine {
  if (engine) {
    if (engine.ctx.state === 'suspended') void engine.ctx.resume();
    return engine;
  }
  const ctx = new AudioContext({ latencyHint: 'interactive' });

  const bed = ctx.createGain();
  const air = ctx.createConvolver();
  air.buffer = airImpulse(ctx, 3.2);
  const airLevel = ctx.createGain();
  airLevel.gain.value = 0.5;
  air.connect(airLevel).connect(bed);

  const fade = ctx.createGain();
  const level = ctx.createGain();
  level.gain.value = 0.8;
  // A gentle limiter so ten layers at once never clip.
  const bedOut = ctx.createDynamicsCompressor();
  bedOut.threshold.value = -10;
  bedOut.knee.value = 8;
  bedOut.ratio.value = 12;
  bedOut.attack.value = 0.005;
  bedOut.release.value = 0.3;
  // `duck` quiets the live soundscape while you listen back to a take.
  const duck = ctx.createGain();
  bed.connect(fade).connect(level).connect(duck).connect(bedOut).connect(ctx.destination);

  const voice = ctx.createGain();
  const monitor = ctx.createGain();
  monitor.gain.value = 0;
  voice.connect(monitor).connect(ctx.destination);

  const bedAnalyser = ctx.createAnalyser();
  bedAnalyser.fftSize = 4096;
  bedAnalyser.smoothingTimeConstant = 0.85;
  bedOut.connect(bedAnalyser);
  const voiceAnalyser = ctx.createAnalyser();
  voiceAnalyser.fftSize = 4096;
  voiceAnalyser.smoothingTimeConstant = 0.6;
  voice.connect(voiceAnalyser);

  engine = { ctx, bed, air, fade, level, duck, bedOut, voice, monitor, bedAnalyser, voiceAnalyser };
  return engine;
}

/** The engine if it has been made already, without making it. */
export function peekEngine(): Engine | null {
  return engine;
}

/**
 * Load the recorder's worklet (public/recorder-worklet.js) once.
 * A worklet is a small script that runs on the audio thread itself, so it
 * sees every sample, on time — see LEARNED.md.
 */
export function ensureWorklet(): Promise<void> {
  const { ctx } = getEngine();
  if (!workletReady) {
    workletReady = ctx.audioWorklet.addModule(`${import.meta.env.BASE_URL}recorder-worklet.js`);
  }
  return workletReady;
}

/** Glide a gain to a value over `seconds`, from wherever it is now. */
export function glide(param: AudioParam, value: number, seconds: number): void {
  const ctx = getEngine().ctx;
  const t = ctx.currentTime;
  param.cancelScheduledValues(t);
  param.setValueAtTime(param.value, t);
  param.linearRampToValueAtTime(value, t + Math.max(seconds, 0.01));
}

/** Can this browser choose which output (headphones) to play through? */
export function canPickOutput(): boolean {
  return typeof (AudioContext.prototype as unknown as { setSinkId?: unknown }).setSinkId === 'function';
}

/** Send everything to a chosen output device ('' = the system default). */
export async function setOutputDevice(deviceId: string): Promise<void> {
  const ctx = getEngine().ctx as AudioContext & { setSinkId?: (id: string) => Promise<void> };
  if (ctx.setSinkId) await ctx.setSinkId(deviceId);
}

/**
 * How late the voice arrives compared with the soundscape you were hearing,
 * in seconds: the time for the soundscape to reach your ears (output) plus the
 * time for your voice to reach the app (input). The recorder pulls the voice
 * earlier by this much so the two tracks line up.
 */
export function roundTripLatency(inputLatency: number): number {
  const ctx = getEngine().ctx;
  return (ctx.baseLatency || 0) + (ctx.outputLatency || 0) + (inputLatency || 0);
}
