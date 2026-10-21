// THE RECORDER — the page's side of public/recorder-worklet.js.
//
// `Capture` wraps one worklet node. Start it, stop it, and you get back the
// voice (mono) and the soundscape (left + right) as plain arrays of samples.
// The main recorder feeds it both; the number pads use their own Capture fed
// only the voice.
import { ensureWorklet, getEngine } from './engine.ts';

export interface Captured {
  voice: Float32Array;
  left: Float32Array;
  right: Float32Array;
  sampleRate: number;
}

export class Capture {
  node: AudioWorkletNode;
  private chunks: { voice: Float32Array; left: Float32Array; right: Float32Array }[] = [];
  private finish: ((c: Captured) => void) | null = null;

  private constructor(node: AudioWorkletNode) {
    this.node = node;
    node.port.onmessage = (e) => {
      if (e.data.done) {
        this.finish?.(this.join());
        this.finish = null;
      } else {
        this.chunks.push(e.data);
      }
    };
  }

  /** Make a capture node. Its inputs: 0 = voice, 1 = soundscape. */
  static async create(): Promise<Capture> {
    await ensureWorklet();
    const { ctx } = getEngine();
    const node = new AudioWorkletNode(ctx, 'recorder', {
      numberOfInputs: 2,
      numberOfOutputs: 1,
      outputChannelCount: [1],
      channelCount: 2,
      channelCountMode: 'explicit',
    });
    // A worklet only runs while it's connected onward, so connect it to the
    // speakers through a silent gain.
    const silent = ctx.createGain();
    silent.gain.value = 0;
    node.connect(silent).connect(ctx.destination);
    return new Capture(node);
  }

  start(): void {
    this.chunks = [];
    this.node.port.postMessage('start');
  }

  stop(): Promise<Captured> {
    return new Promise((resolve) => {
      this.finish = resolve;
      this.node.port.postMessage('stop');
    });
  }

  /** Join the chunks into one long array per track. */
  private join(): Captured {
    const length = this.chunks.reduce((n, c) => n + c.voice.length, 0);
    const voice = new Float32Array(length);
    const left = new Float32Array(length);
    const right = new Float32Array(length);
    let at = 0;
    for (const c of this.chunks) {
      voice.set(c.voice, at);
      left.set(c.left, at);
      right.set(c.right, at);
      at += c.voice.length;
    }
    this.chunks = [];
    return { voice, left, right, sampleRate: getEngine().ctx.sampleRate };
  }
}

/**
 * Pull the voice earlier by `seconds` so it lines up with the soundscape you
 * were hearing (see roundTripLatency in engine.ts). The end is padded with
 * silence so both tracks stay the same length.
 */
export function alignVoice(voice: Float32Array, seconds: number, sampleRate: number): Float32Array {
  const shift = Math.min(Math.round(seconds * sampleRate), voice.length);
  if (shift <= 0) return voice;
  const out = new Float32Array(voice.length);
  out.set(voice.subarray(shift));
  return out;
}
