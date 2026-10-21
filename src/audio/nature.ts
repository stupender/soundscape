// WATER AND AIR — ocean, river, rain and wind, made from noise.
//
// These are sketches, not field recordings: each one is noise, filtered and
// moved in the way the real thing moves. They're here so the app works with
// nothing downloaded. Real recordings can replace any of them later — a layer
// in data/layers.ts can point at an audio file instead (see `src`).
import { loopNoise, noiseBuffer } from './noise.ts';
import { rand, shell, type SoundMaker } from './sound.ts';

/**
 * OCEAN — waves arriving. Low noise whose loudness and brightness swell and
 * fall, a wave every 6–11 seconds; left and right keep their own rhythm so the
 * shore feels wide.
 */
export const ocean: SoundMaker = (ctx, env) => {
  const s = shell(ctx);
  for (const pan of [-0.6, 0.6]) {
    const src = s.keep(loopNoise(ctx, 'pink'));
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.Q.value = 0.4;
    lp.frequency.value = 350;
    const g = ctx.createGain();
    g.gain.value = 0.15;
    const p = ctx.createStereoPanner();
    p.pan.value = pan;
    src.connect(lp).connect(g).connect(p).connect(s.out);
    let next = ctx.currentTime + rand(0, 3);
    s.tick(() => {
      while (next < ctx.currentTime + 1.5) {
        const d = rand(6, 11);
        const crest = next + d * rand(0.35, 0.5);
        g.gain.setValueAtTime(g.gain.value, next);
        g.gain.linearRampToValueAtTime(rand(0.7, 1), crest);
        g.gain.linearRampToValueAtTime(0.12, next + d);
        lp.frequency.setValueAtTime(lp.frequency.value, next);
        lp.frequency.exponentialRampToValueAtTime(rand(1200, 2200), crest);
        lp.frequency.exponentialRampToValueAtTime(320, next + d);
        next += d;
      }
    });
  }
  const send = ctx.createGain();
  send.gain.value = 0.15;
  s.out.connect(send).connect(env.air);
  return s;
};

/**
 * RIVER — a steady rush with bubbling on top. The rush is band-passed noise;
 * the bubbling is four narrow filters whose pitches jump around many times a
 * second, which is roughly what water tumbling over stones does.
 */
export const river: SoundMaker = (ctx) => {
  const s = shell(ctx);
  const rush = s.keep(loopNoise(ctx, 'pink'));
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 900;
  bp.Q.value = 0.6;
  const rushGain = ctx.createGain();
  rushGain.gain.value = 0.55;
  rush.connect(bp).connect(rushGain).connect(s.out);

  const babbleSrc = s.keep(loopNoise(ctx, 'white'));
  const bubbles: { f: BiquadFilterNode; g: GainNode }[] = [];
  [-0.5, -0.15, 0.2, 0.55].forEach((pan) => {
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = 14;
    f.frequency.value = rand(500, 2400);
    const g = ctx.createGain();
    g.gain.value = 0.3;
    const p = ctx.createStereoPanner();
    p.pan.value = pan;
    babbleSrc.connect(f).connect(g).connect(p).connect(s.out);
    bubbles.push({ f, g });
  });
  let next = ctx.currentTime;
  s.tick(() => {
    while (next < ctx.currentTime + 1) {
      for (const { f, g } of bubbles) {
        const t = next + rand(0, 0.08);
        f.frequency.setTargetAtTime(rand(450, 2600), t, 0.02);
        g.gain.setTargetAtTime(rand(0.1, 0.9), t, 0.03);
      }
      next += rand(0.06, 0.16);
    }
  });
  return s;
};

/**
 * RAIN — a soft hiss, plus single drops: very short clicks of noise, each
 * tuned and placed at random, about twenty a second.
 */
export const rain: SoundMaker = (ctx, env) => {
  const s = shell(ctx);
  const hiss = s.keep(loopNoise(ctx, 'pink'));
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 700;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 7000;
  const hissGain = ctx.createGain();
  hissGain.gain.value = 0.35;
  hiss.connect(hp).connect(lp).connect(hissGain).connect(s.out);

  const white = noiseBuffer(ctx, 'white');
  const drops = ctx.createGain();
  drops.gain.value = 1;
  drops.connect(s.out);
  const send = ctx.createGain();
  send.gain.value = 0.25;
  drops.connect(send).connect(env.air);
  let next = ctx.currentTime;
  s.tick(() => {
    while (next < ctx.currentTime + 1) {
      const src = ctx.createBufferSource();
      src.buffer = white;
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = rand(1800, 7000);
      f.Q.value = rand(2, 8);
      const g = ctx.createGain();
      const amp = Math.pow(Math.random(), 2) * 0.9 + 0.05;
      g.gain.setValueAtTime(amp, next);
      g.gain.exponentialRampToValueAtTime(0.0001, next + rand(0.01, 0.04));
      const p = ctx.createStereoPanner();
      p.pan.value = rand(-0.9, 0.9);
      src.connect(f).connect(g).connect(p).connect(drops);
      src.start(next, rand(0, 7), 0.06);
      next += rand(0.01, 0.09);
    }
  });
  return s;
};

/**
 * WIND — noise through a wide filter whose pitch and loudness wander in slow
 * gusts, with a faint whistle riding on top.
 */
export const wind: SoundMaker = (ctx) => {
  const s = shell(ctx);
  const parts: { f: BiquadFilterNode; g: GainNode; lo: number; hi: number }[] = [];
  for (const [pan, q, lo, hi, colour] of [
    [-0.5, 1.2, 250, 900, 'pink'],
    [0.5, 1.2, 250, 900, 'pink'],
    [0, 22, 900, 1700, 'white'],
  ] as const) {
    const src = s.keep(loopNoise(ctx, colour));
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = q;
    f.frequency.value = (lo + hi) / 2;
    const g = ctx.createGain();
    g.gain.value = 0.2;
    const p = ctx.createStereoPanner();
    p.pan.value = pan;
    src.connect(f).connect(g).connect(p).connect(s.out);
    parts.push({ f, g, lo, hi });
  }
  let next = ctx.currentTime;
  s.tick(() => {
    while (next < ctx.currentTime + 1.5) {
      parts.forEach(({ f, g, lo, hi }, i) => {
        const t = next + rand(0, 0.8);
        f.frequency.setTargetAtTime(rand(lo, hi), t, 1.4);
        g.gain.setTargetAtTime(i === 2 ? rand(0, 0.12) : rand(0.15, 0.9), t, 1.6);
      });
      next += rand(1.8, 4.5);
    }
  });
  return s;
};
