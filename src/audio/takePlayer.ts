// LISTENING BACK — plays one take's two tracks together, live, so the faders,
// the tidy switch and auto-balance can be heard as you move them.
//
// While a take plays, the live soundscape is ducked (faded down) so you only
// hear what you recorded. Only one take plays at a time.
import type { Take } from '../store/db.ts';
import { getEngine, glide } from './engine.ts';
import { dbToGain, wireTake, type MixSettings } from './mixdown.ts';

export interface Decoded {
  voice: AudioBuffer;
  bed: AudioBuffer;
}

const decodedTakes = new Map<string, Promise<Decoded>>();

/** Decode a take's two WAVs once. */
export function decodeTake(take: Take): Promise<Decoded> {
  let p = decodedTakes.get(take.id);
  if (!p) {
    const { ctx } = getEngine();
    p = Promise.all([
      take.voice.arrayBuffer().then((b) => ctx.decodeAudioData(b)),
      take.bed.arrayBuffer().then((b) => ctx.decodeAudioData(b)),
    ]).then(([voice, bed]) => ({ voice, bed }));
    decodedTakes.set(take.id, p);
  }
  return p;
}

interface Playing {
  id: string;
  wired: ReturnType<typeof wireTake>;
  startedAt: number;
  offset: number;
  duration: number;
}

let playing: Playing | null = null;
let onEnd: (() => void) | null = null;

/** Play a take from `offset` seconds, with these levels. */
export async function playTake(take: Take, mix: MixSettings, offset = 0, ended?: () => void): Promise<void> {
  stopTake();
  const { ctx, duck } = getEngine();
  const { voice, bed } = await decodeTake(take);
  const wired = wireTake(ctx, voice, bed, mix, ctx.destination);
  const t = ctx.currentTime + 0.05;
  wired.voiceSrc.start(t, offset);
  wired.bedSrc.start(t, offset);
  const me: Playing = { id: take.id, wired, startedAt: t, offset, duration: bed.duration };
  playing = me;
  onEnd = ended ?? null;
  wired.bedSrc.onended = () => {
    if (playing === me) finish();
  };
  glide(duck.gain, 0.08, 0.6);
}

function finish() {
  playing = null;
  glide(getEngine().duck.gain, 1, 1.2);
  const cb = onEnd;
  onEnd = null;
  cb?.();
}

export function stopTake(): void {
  if (!playing) return;
  const p = playing;
  playing = null;
  try { p.wired.voiceSrc.stop(); p.wired.bedSrc.stop(); } catch { /* done */ }
  glide(getEngine().duck.gain, 1, 1.2);
  onEnd = null;
}

/** Move the faders / tidy switch while it plays. */
export function updateMix(mix: MixSettings): void {
  if (!playing) return;
  const t = getEngine().ctx.currentTime;
  playing.wired.voiceGain.gain.setTargetAtTime(dbToGain(mix.voiceDb), t, 0.05);
  playing.wired.bedGain.gain.setTargetAtTime(dbToGain(mix.bedDb), t, 0.05);
  playing.wired.lowCut.frequency.setTargetAtTime(mix.tidy ? 80 : 10, t, 0.05);
}

/** Where playback is, in seconds, for the take with this id (null if it isn't playing). */
export function positionOf(id: string): number | null {
  if (!playing || playing.id !== id) return null;
  const at = playing.offset + getEngine().ctx.currentTime - playing.startedAt;
  return Math.min(Math.max(at, 0), playing.duration);
}
