// THE LAYER MANAGER — turns soundscape layers on and off, and sets how loud.
//
// Every running layer is its Sound plus one GainNode (its slider) feeding the
// engine's `bed`. Turning a layer on fades it in over two seconds; turning it
// off fades it out and then stops it, so nothing ever starts or ends with a
// click. The UI only ever calls the four functions at the bottom.
import { saHz, type Key } from '../data/keys.ts';
import type { LayerDef } from '../data/layers.ts';
import { getEngine } from './engine.ts';
import type { Sound } from './sound.ts';

interface Running {
  def: LayerDef;
  sound: Sound | null; // null while a recording is still loading
  gain: GainNode;
  stopped: boolean;
}

const running = new Map<string, Running>();

/** A slider's 0–1 position, as a gain. Squared, because ears hear loudness that way. */
const curve = (def: LayerDef, level: number) => level * level * def.gain;

/** Turn a layer on. Resolves once it's sounding (a recording may take a moment). */
export async function startLayer(def: LayerDef, level: number, key: Key): Promise<void> {
  if (running.has(def.id)) return;
  const { ctx, bed, air } = getEngine();
  const gain = ctx.createGain();
  gain.gain.value = 0;
  gain.connect(bed);
  const r: Running = { def, sound: null, gain, stopped: false };
  running.set(def.id, r);
  try {
    const sound = await def.make(ctx, { sa: saHz(key), key, air });
    if (r.stopped) { sound.stop(); return; }
    r.sound = sound;
    sound.out.connect(gain);
    const t = ctx.currentTime;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(curve(def, level), t + 2);
  } catch (err) {
    running.delete(def.id);
    gain.disconnect();
    throw err;
  }
}

/** Turn a layer off: fade out, then stop it. */
export function stopLayer(id: string): void {
  const r = running.get(id);
  if (!r) return;
  running.delete(id);
  r.stopped = true;
  const { ctx } = getEngine();
  const t = ctx.currentTime;
  r.gain.gain.cancelScheduledValues(t);
  r.gain.gain.setValueAtTime(r.gain.gain.value, t);
  r.gain.gain.linearRampToValueAtTime(0, t + 1.5);
  window.setTimeout(() => {
    r.sound?.stop();
    r.gain.disconnect();
  }, 1700);
}

/** Move a layer's slider. */
export function setLayerLevel(id: string, level: number): void {
  const r = running.get(id);
  if (!r) return;
  const { ctx } = getEngine();
  r.gain.gain.setTargetAtTime(curve(r.def, level), ctx.currentTime, 0.08);
}

/** The key changed: retune every pitched layer that's playing. */
export function retuneLayers(key: Key): void {
  for (const r of running.values()) r.sound?.retune?.(saHz(key), key);
}

/** Which layers are sounding now (for a take's label). */
export function runningIds(): string[] {
  return [...running.keys()];
}
