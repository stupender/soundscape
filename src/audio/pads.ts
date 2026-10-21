// THE NUMBER PADS — after Uncle Terry's Max/MSP patch.
//
// Ten pads, laid out like a keyboard's number pad (7 8 9 / 4 5 6 / 1 2 3 / 0).
// An empty pad is a record button: HOLD it (the key, or your finger) and sing;
// let go and the sound is kept. Press it again and it plays back. That's the
// whole idea — the simple magic of recorded sound, and hearing it back.
//
// Pads play into the soundscape bus, so anything you trigger during a take is
// recorded into the soundscape track, not the voice track.
//
// Erasing: Shift + the number, or the Erase switch then a tap.
import { alignVoice, Capture } from './recorder.ts';
import { getEngine } from './engine.ts';

export interface Pad {
  buffer: AudioBuffer | null;
  recording: boolean;
  playing: boolean;
  /** When the current playback started (audio clock), for the progress ring. */
  startedAt: number;
}

export const PAD_ORDER = [7, 8, 9, 4, 5, 6, 1, 2, 3, 0];

const pads: Pad[] = Array.from({ length: 10 }, () => ({ buffer: null, recording: false, playing: false, startedAt: 0 }));
const sources: (AudioBufferSourceNode | null)[] = Array(10).fill(null);
let capture: Capture | null = null;
let recordingPad: number | null = null;
let inputLatency = 0;
const listeners = new Set<() => void>();

const tell = () => listeners.forEach((fn) => fn());

/** Watch the pads for changes (the UI redraws). */
export function onPads(fn: () => void): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

export function getPads(): readonly Pad[] {
  return pads;
}

/** The mic's own latency, so pad recordings start where you started. */
export function setPadInputLatency(seconds: number): void {
  inputLatency = seconds;
}

/** Plug the pads' recorder into the voice (once, after the mic opens). */
export async function readyPads(): Promise<void> {
  if (capture) return;
  capture = await Capture.create();
  getEngine().voice.connect(capture.node, 0, 0);
}

/** A pad was pressed. Empty → start recording. Full → play it from the top. */
export function pressPad(n: number): void {
  const pad = pads[n];
  if (pad.buffer) {
    playPad(n);
    return;
  }
  if (!capture || recordingPad !== null) return;
  recordingPad = n;
  pad.recording = true;
  capture.start();
  tell();
}

/** A pad was let go. If it was recording, keep what it heard. */
export async function releasePad(n: number): Promise<void> {
  if (recordingPad !== n || !capture) return;
  recordingPad = null;
  const got = await capture.stop();
  const pad = pads[n];
  pad.recording = false;
  const { ctx } = getEngine();
  // Trim the mic's own delay so the sound starts where you started.
  // Shorter than a fifth of a second is a slip of the finger, not a recording.
  const voice = alignVoice(got.voice, inputLatency, got.sampleRate);
  if (voice.length > got.sampleRate * 0.2) {
    const buffer = ctx.createBuffer(1, voice.length, got.sampleRate);
    buffer.copyToChannel(fadeEdges(voice, got.sampleRate), 0);
    pad.buffer = buffer;
  }
  tell();
}

/** A tiny fade at each end so a pad never clicks on or off. */
function fadeEdges(s: Float32Array, rate: number): Float32Array<ArrayBuffer> {
  const out = new Float32Array(s);
  const n = Math.min(Math.floor(rate * 0.008), Math.floor(out.length / 2));
  for (let i = 0; i < n; i++) {
    out[i] *= i / n;
    out[out.length - 1 - i] *= i / n;
  }
  return out;
}

function playPad(n: number): void {
  const pad = pads[n];
  if (!pad.buffer) return;
  sources[n]?.stop();
  const { ctx, bed } = getEngine();
  const src = ctx.createBufferSource();
  src.buffer = pad.buffer;
  src.connect(bed);
  src.start();
  sources[n] = src;
  pad.playing = true;
  pad.startedAt = ctx.currentTime;
  src.onended = () => {
    if (sources[n] !== src) return;
    sources[n] = null;
    pad.playing = false;
    tell();
  };
  tell();
}

/** Empty a pad so it can record again. */
export function erasePad(n: number): void {
  sources[n]?.stop();
  sources[n] = null;
  pads[n] = { buffer: null, recording: false, playing: false, startedAt: 0 };
  tell();
}

export function eraseAllPads(): void {
  for (let i = 0; i < 10; i++) erasePad(i);
}
