// THE MICROPHONE — whichever one you have: the phone's own, the laptop's,
// a USB mic, or an audio interface.
//
// By default every "phone call" process is switched OFF — echo cancellation,
// noise suppression, automatic gain. Those are made for video calls; on a
// singing voice they pump, warble and cut off quiet endings. They can be
// turned back on (the "call cleanup" switch) if you're somewhere noisy.
//
// Audio interfaces often send two channels (input 1 and input 2). If yours
// does, you can choose which one your mic is plugged into.
import { getEngine } from './engine.ts';

export interface MicInfo {
  label: string;
  deviceId: string;
  channels: number;
  /** The input's own delay in seconds, when the browser reports it. */
  latency: number;
}

export interface MicOptions {
  deviceId: string;
  cleanup: boolean;
  /** Which input channel to use (0 = input 1, 1 = input 2). */
  channel: number;
  /** Trim in gain (1 = unchanged). */
  trim: number;
}

let stream: MediaStream | null = null;
let source: MediaStreamAudioSourceNode | null = null;
let picker: GainNode | null = null;
let splitter: ChannelSplitterNode | null = null;
let trimNode: GainNode | null = null;

/** Open (or re-open) the mic with these options and plug it into the engine. */
export async function openMic(opts: MicOptions): Promise<MicInfo> {
  closeMic();
  const { ctx, voice } = getEngine();
  // On iPhone and iPad, tell Safari we're both playing and recording, so the
  // soundscape keeps playing at full quality while the mic is open.
  const nav = navigator as Navigator & { audioSession?: { type: string } };
  if (nav.audioSession) nav.audioSession.type = 'play-and-record';

  stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      deviceId: opts.deviceId ? { exact: opts.deviceId } : undefined,
      echoCancellation: opts.cleanup,
      noiseSuppression: opts.cleanup,
      autoGainControl: opts.cleanup,
      channelCount: { ideal: 2 },
    },
  });
  const track = stream.getAudioTracks()[0];
  const settings = track.getSettings() as MediaTrackSettings & { latency?: number };

  source = ctx.createMediaStreamSource(stream);
  splitter = ctx.createChannelSplitter(2);
  picker = ctx.createGain();
  trimNode = ctx.createGain();
  trimNode.gain.value = opts.trim;
  source.connect(splitter);
  const channels = settings.channelCount ?? 1;
  splitter.connect(picker, channels > 1 ? opts.channel : 0);
  picker.connect(trimNode).connect(voice);

  return {
    label: track.label || 'Microphone',
    deviceId: settings.deviceId ?? opts.deviceId,
    channels,
    latency: settings.latency ?? 0,
  };
}

/** Turn the mic off and release it (the browser's mic light goes out). */
export function closeMic(): void {
  stream?.getTracks().forEach((t) => t.stop());
  source?.disconnect();
  splitter?.disconnect();
  picker?.disconnect();
  trimNode?.disconnect();
  stream = null;
  source = splitter = null;
  picker = trimNode = null;
}

export function micIsOpen(): boolean {
  return stream !== null;
}

/** Change the trim while the mic is open. */
export function setTrim(value: number): void {
  if (trimNode) trimNode.gain.setTargetAtTime(value, getEngine().ctx.currentTime, 0.05);
}

/** The inputs and outputs this device has. Names appear only after the mic is allowed. */
export async function listDevices(): Promise<{ inputs: MediaDeviceInfo[]; outputs: MediaDeviceInfo[] }> {
  const all = await navigator.mediaDevices.enumerateDevices();
  return {
    inputs: all.filter((d) => d.kind === 'audioinput'),
    outputs: all.filter((d) => d.kind === 'audiooutput'),
  };
}
