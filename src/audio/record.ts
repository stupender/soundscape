// RECORDING A TAKE — the two-track recorder.
//
// One Capture node hears the voice on input 0 and the finished soundscape
// (everything you hear, after the levels and limiter) on input 1. Press stop
// and the voice is lined up with the soundscape (latency, see engine.ts),
// both are written as WAV files, and the take is saved on this device.
import { KEYS } from '../data/keys.ts';
import { LAYERS } from '../data/layers.ts';
import { saveTake, type Take } from '../store/db.ts';
import { getEngine, roundTripLatency } from './engine.ts';
import { runningIds } from './layers.ts';
import { alignVoice, Capture } from './recorder.ts';
import { encodeWav } from './wav.ts';

let capture: Capture | null = null;
let startedAt = 0;
let layersAtStart: string[] = [];

/** Get the recorder ready (loads the worklet and wires it). */
async function ready(): Promise<Capture> {
  if (capture) return capture;
  const c = await Capture.create();
  const { voice, bedOut } = getEngine();
  voice.connect(c.node, 0, 0);
  bedOut.connect(c.node, 0, 1);
  capture = c;
  return c;
}

export async function startRecording(): Promise<void> {
  const c = await ready();
  layersAtStart = runningIds();
  startedAt = performance.now();
  c.start();
}

/** Seconds since recording started. */
export function recordingSeconds(): number {
  return (performance.now() - startedAt) / 1000;
}

/** A name like "Shruti box + Ocean · D" from what was playing. */
function nameFor(layerIds: string[], keyName: string): string {
  const names = layerIds
    .map((id) => LAYERS.find((l) => l.id === id)?.name ?? 'Your sound')
    .slice(0, 3);
  const pitched = layerIds.some((id) => LAYERS.find((l) => l.id === id)?.pitched);
  const what = names.length ? names.join(' + ') : 'Voice alone';
  return pitched ? `${what} · ${keyName}` : what;
}

/** Stop, line up, save. Returns the saved take (or null if it was too short). */
export async function stopRecording(keyName: string, inputLatency: number): Promise<Take | null> {
  if (!capture) return null;
  const got = await capture.stop();
  if (got.voice.length < got.sampleRate * 0.5) return null;
  const voice = alignVoice(got.voice, roundTripLatency(inputLatency), got.sampleRate);
  const layers = [...new Set([...layersAtStart, ...runningIds()])];
  const key = KEYS.find((k) => k.name === keyName)?.name ?? keyName;
  const take: Take = {
    id: crypto.randomUUID(),
    name: nameFor(layers, key),
    createdAt: Date.now(),
    seconds: got.voice.length / got.sampleRate,
    key,
    layers,
    voice: encodeWav([voice], got.sampleRate),
    bed: encodeWav([got.left, got.right], got.sampleRate),
  };
  await saveTake(take);
  return take;
}
