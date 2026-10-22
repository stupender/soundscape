// THE AIR — the impulse for the shared reverb, made from noise.
//
// A reverb plays every sound through a "tail": here, a burst of random noise
// that dies away over a few seconds, the way a room or a valley answers a
// sound. The session bell sends a little into it. (The noise generators that
// once made the synthesised nature sounds are in git history.)

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
