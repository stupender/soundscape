// AFTER THE TAKE — balance, tidy, mix down, export, share.
//
// A take is two tracks: your voice and the soundscape. Here they get:
//
//   AUTO-BALANCE — measures how loud your voice is while you're actually
//     singing (silences don't count), and how loud the soundscape is, then
//     sets the voice to a healthy level and the soundscape a set distance
//     below it. A starting point; the faders are still yours.
//
//   TIDY — a low-cut filter at 80 Hz on the voice: it removes the rumble of
//     traffic, handling noise and wind without touching the voice itself.
//     (The deeper clean-up — de-noise, de-reverb, de-click, as iZotope does —
//     is on the roadmap.)
//
//   MIXDOWN — both tracks rendered through the same filters and levels you
//     hear, faster than real time (OfflineAudioContext), into one stereo file.
//
//   EXPORT — WAV (lossless, 24-bit) or MP3 (small, for sending).
//
//   SHARE — the device's own share sheet: on a phone that's Google Drive,
//     Files, AirDrop, Messages, Mail… whichever apps you have.
import { encodeWav } from './wav.ts';

export interface MixSettings {
  /** Voice level in dB (0 = as recorded). */
  voiceDb: number;
  /** Soundscape level in dB. */
  bedDb: number;
  tidy: boolean;
}

export const dbToGain = (db: number) => Math.pow(10, db / 20);
const gainToDb = (g: number) => 20 * Math.log10(Math.max(g, 1e-9));

/** The voice's level while singing: RMS of the 50 ms windows that aren't silence. */
function singingLevel(samples: Float32Array, sampleRate: number): number {
  const win = Math.floor(sampleRate * 0.05);
  const levels: number[] = [];
  for (let i = 0; i + win <= samples.length; i += win) {
    let sum = 0;
    for (let j = i; j < i + win; j++) sum += samples[j] * samples[j];
    levels.push(Math.sqrt(sum / win));
  }
  if (!levels.length) return 0;
  // "Singing" = within 30 dB of the loudest moments.
  const loud = [...levels].sort((a, b) => b - a)[Math.floor(levels.length * 0.05)] ?? 0;
  const singing = levels.filter((l) => l > loud * 0.03);
  const power = singing.reduce((n, l) => n + l * l, 0) / Math.max(singing.length, 1);
  return Math.sqrt(power);
}

/** Overall RMS of a buffer (all channels). */
function overallLevel(buffer: AudioBuffer): number {
  let sum = 0;
  let n = 0;
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const d = buffer.getChannelData(c);
    for (let i = 0; i < d.length; i += 4) { sum += d[i] * d[i]; n++; }
  }
  return Math.sqrt(sum / Math.max(n, 1));
}

/** Where the voice should sit (RMS while singing), and how far below it the soundscape goes. */
const VOICE_TARGET_DB = -18;
const BED_BELOW_DB = 9;

/** Suggest levels for a take, as dB values for the two faders. */
export function autoBalance(voice: AudioBuffer, bed: AudioBuffer): { voiceDb: number; bedDb: number } {
  const v = singingLevel(voice.getChannelData(0), voice.sampleRate);
  const b = overallLevel(bed);
  const voiceDb = v > 0 ? VOICE_TARGET_DB - gainToDb(v) : 0;
  const bedDb = b > 0 ? VOICE_TARGET_DB - BED_BELOW_DB - gainToDb(b) : 0;
  const clamp = (x: number) => Math.round(Math.max(-30, Math.min(18, x)));
  return { voiceDb: clamp(voiceDb), bedDb: clamp(bedDb) };
}

/** Wire one take's two tracks through levels + tidy into `dest`. Shared by playback and mixdown. */
export function wireTake(
  ctx: BaseAudioContext,
  voice: AudioBuffer,
  bed: AudioBuffer,
  mix: MixSettings,
  dest: AudioNode,
) {
  const voiceSrc = ctx.createBufferSource();
  voiceSrc.buffer = voice;
  const bedSrc = ctx.createBufferSource();
  bedSrc.buffer = bed;
  const lowCut = ctx.createBiquadFilter();
  lowCut.type = 'highpass';
  lowCut.frequency.value = mix.tidy ? 80 : 10;
  lowCut.Q.value = 0.7;
  const voiceGain = ctx.createGain();
  voiceGain.gain.value = dbToGain(mix.voiceDb);
  const bedGain = ctx.createGain();
  bedGain.gain.value = dbToGain(mix.bedDb);
  voiceSrc.connect(lowCut).connect(voiceGain).connect(dest);
  bedSrc.connect(bedGain).connect(dest);
  return { voiceSrc, bedSrc, lowCut, voiceGain, bedGain };
}

/** Render the stereo mix faster than real time. Turned down if it would clip. */
export async function renderMix(voice: AudioBuffer, bed: AudioBuffer, mix: MixSettings): Promise<Float32Array[]> {
  const length = Math.max(voice.length, bed.length);
  const off = new OfflineAudioContext(2, length, bed.sampleRate);
  const { voiceSrc, bedSrc } = wireTake(off, voice, bed, mix, off.destination);
  voiceSrc.start();
  bedSrc.start();
  const out = await off.startRendering();
  const left = out.getChannelData(0);
  const right = out.getChannelData(1);
  let peak = 0;
  for (let i = 0; i < length; i++) peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
  if (peak > 0.98) {
    const g = 0.98 / peak;
    for (let i = 0; i < length; i++) { left[i] *= g; right[i] *= g; }
  }
  return [left, right];
}

/**
 * Encode samples (mono or stereo) as an MP3 at 192 kbps. The encoder (LAME,
 * in JavaScript) is loaded only the first time you export an MP3, so the app
 * itself opens quickly on a phone.
 */
export async function encodeMp3(channels: Float32Array[], sampleRate: number): Promise<Blob> {
  const { Mp3Encoder } = await import('@breezystack/lamejs');
  const toInt16 = (f: Float32Array) => {
    const out = new Int16Array(f.length);
    for (let i = 0; i < f.length; i++) {
      const s = Math.max(-1, Math.min(1, f[i]));
      out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return out;
  };
  const enc = new Mp3Encoder(channels.length, sampleRate, 192);
  const left = toInt16(channels[0]);
  const right = channels[1] ? toInt16(channels[1]) : undefined;
  const parts: Uint8Array[] = [];
  const block = 1152 * 20;
  for (let i = 0; i < left.length; i += block) {
    const chunk = enc.encodeBuffer(left.subarray(i, i + block), right?.subarray(i, i + block));
    if (chunk.length) parts.push(new Uint8Array(chunk));
  }
  const end = enc.flush();
  if (end.length) parts.push(new Uint8Array(end));
  return new Blob(parts as BlobPart[], { type: 'audio/mpeg' });
}

export type Format = 'wav' | 'mp3';

/** The finished mix as a file. */
export async function mixFile(voice: AudioBuffer, bed: AudioBuffer, mix: MixSettings, format: Format): Promise<Blob> {
  const channels = await renderMix(voice, bed, mix);
  return format === 'mp3' ? encodeMp3(channels, bed.sampleRate) : encodeWav(channels, bed.sampleRate);
}

/** Can this device share files through its share sheet? */
export function canShareFiles(): boolean {
  if (!navigator.canShare) return false;
  const probe = new File([new Blob(['x'], { type: 'audio/mpeg' })], 'probe.mp3', { type: 'audio/mpeg' });
  return navigator.canShare({ files: [probe] });
}

/** Open the share sheet with one file. Resolves false if the person closed it. */
export async function shareFile(blob: Blob, filename: string, title: string): Promise<boolean> {
  const file = new File([blob], filename, { type: blob.type });
  try {
    await navigator.share({ files: [file], title });
    return true;
  } catch {
    return false;
  }
}
