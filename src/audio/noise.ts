// NOISE — the raw material of water, wind and rain.
//
// Most nature sounds here start as noise (every frequency at once, at random)
// and are then filtered and shaped. Three colours:
//   white — equal energy at every frequency: hiss.
//   pink  — less energy as pitch rises: rain on a roof, a waterfall.
//   brown — much less energy up high: surf, distant rumble.
// Each buffer is a few seconds of stereo noise with the two sides different,
// so it sounds wide rather than coming from one point. Made once and reused.

export type NoiseColour = 'white' | 'pink' | 'brown';

const cache = new Map<string, AudioBuffer>();

/** A stereo buffer of coloured noise, `seconds` long, made once per colour. */
export function noiseBuffer(ctx: BaseAudioContext, colour: NoiseColour, seconds = 8): AudioBuffer {
  const id = `${colour}:${seconds}:${ctx.sampleRate}`;
  const hit = cache.get(id);
  if (hit) return hit;
  const length = Math.floor(seconds * ctx.sampleRate);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    if (colour === 'white') {
      for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    } else if (colour === 'pink') {
      // Paul Kellet's pink-noise filter: a few leaky averages of white noise.
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < length; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + w * 0.0555179;
        b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.969 * b2 + w * 0.153852;
        b3 = 0.8665 * b3 + w * 0.3104856;
        b4 = 0.55 * b4 + w * 0.5329522;
        b5 = -0.7616 * b5 - w * 0.016898;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
        b6 = w * 0.115926;
      }
    } else {
      // Brown noise: each sample is a small random step from the last one.
      let last = 0;
      for (let i = 0; i < length; i++) {
        last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
        data[i] = last * 3.5;
      }
    }
  }
  cache.set(id, buffer);
  return buffer;
}

/** Start a looping noise source (not yet connected anywhere). */
export function loopNoise(ctx: AudioContext, colour: NoiseColour): AudioBufferSourceNode {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, colour);
  src.loop = true;
  // Start each copy at a random point so two layers never line up.
  src.start(ctx.currentTime, Math.random() * 7);
  return src;
}

/**
 * The impulse for the shared "air" reverb: noise that dies away. A reverb
 * plays every sound through this tail, which is what a room or a valley
 * does to a sound — see LEARNED.md (convolution).
 */
export function airImpulse(ctx: BaseAudioContext, seconds: number): AudioBuffer {
  const length = Math.floor(seconds * ctx.sampleRate);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      const t = i / length;
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 3.2);
    }
  }
  return buffer;
}
