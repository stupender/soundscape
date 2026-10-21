// CREATURES — birds and evening crickets, made from sliding sine tones.
//
// BIRDS: a handful of individual birds, each with its own pitch, place in the
// stereo field and kind of song. One sings; sometimes another answers. The
// songs are simple shapes — a rising whistle, a two-note call, a trill, a run
// of chirps, a warble — but because each bird keeps its own voice they sound
// like a place rather than a sound effect.
//
// CRICKETS: each cricket is a high tone switched on and off very fast (a
// "pulse"), a few pulses to a chirp, a chirp every second or so. Several of
// them, each at its own pitch and pace, make an evening.
import { loopNoise } from './noise.ts';
import { blip, rand, shell, type SoundMaker } from './sound.ts';

type Song = 'whistle' | 'twoNote' | 'trill' | 'chirps' | 'warble';

interface Bird { pitch: number; pan: number; song: Song; amp: number }

function makeFlock(): Bird[] {
  const songs: Song[] = ['whistle', 'twoNote', 'trill', 'chirps', 'warble'];
  return songs.map((song) => ({
    song,
    pitch: rand(2100, 4200),
    pan: rand(-0.85, 0.85),
    amp: rand(0.06, 0.14),
  }));
}

/** Book one bird's song starting at `t`; returns how long it lasts. */
function sing(ctx: AudioContext, dest: AudioNode, b: Bird, t: number): number {
  const base = { amp: b.amp, pan: b.pan };
  switch (b.song) {
    case 'whistle':
      blip(ctx, dest, t, { ...base, from: b.pitch * 0.8, to: b.pitch * 1.35, dur: 0.35 });
      return 0.4;
    case 'twoNote':
      blip(ctx, dest, t, { ...base, from: b.pitch * 1.25, to: b.pitch * 1.22, dur: 0.32 });
      blip(ctx, dest, t + 0.38, { ...base, from: b.pitch, to: b.pitch * 0.97, dur: 0.4 });
      return 0.8;
    case 'trill': {
      const n = Math.floor(rand(8, 15));
      for (let i = 0; i < n; i++) {
        const f = b.pitch * (i % 2 ? 1.08 : 1);
        blip(ctx, dest, t + i * 0.055, { ...base, from: f, to: f * 0.92, dur: 0.045 });
      }
      return n * 0.055;
    }
    case 'chirps': {
      const n = Math.floor(rand(3, 7));
      for (let i = 0; i < n; i++) {
        blip(ctx, dest, t + i * 0.1, { ...base, from: b.pitch * 1.6, to: b.pitch, dur: 0.07 });
      }
      return n * 0.1;
    }
    case 'warble':
      blip(ctx, dest, t, { ...base, from: b.pitch, to: b.pitch * rand(0.8, 1.2), dur: 0.7, vibrato: rand(14, 22) });
      return 0.75;
  }
}

export const birds: SoundMaker = (ctx, env) => {
  const s = shell(ctx);
  const send = ctx.createGain();
  send.gain.value = 0.35;
  s.out.connect(send).connect(env.air);
  const flock = makeFlock();
  let next = ctx.currentTime + 0.3;
  s.tick(() => {
    while (next < ctx.currentTime + 1.5) {
      const bird = flock[Math.floor(Math.random() * flock.length)];
      const length = sing(ctx, s.out, bird, next);
      // Sometimes a second bird answers the first.
      if (Math.random() < 0.4) {
        const other = flock[Math.floor(Math.random() * flock.length)];
        sing(ctx, s.out, other, next + length + rand(0.2, 0.9));
      }
      next += length + rand(0.6, 3.5);
    }
  });
  return s;
};

export const crickets: SoundMaker = (ctx, env) => {
  const s = shell(ctx);
  const send = ctx.createGain();
  send.gain.value = 0.4;
  s.out.connect(send).connect(env.air);

  // A faint low night air under the crickets.
  const night = s.keep(loopNoise(ctx, 'brown'));
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 260;
  const nightGain = ctx.createGain();
  nightGain.gain.value = 0.18;
  night.connect(lp).connect(nightGain).connect(s.out);

  const crowd = Array.from({ length: 5 }, () => ({
    pitch: rand(4100, 5200),
    pan: rand(-0.9, 0.9),
    every: rand(0.55, 1.2),
    pulses: Math.floor(rand(2, 5)),
    rate: rand(0.028, 0.04),
    amp: rand(0.012, 0.035),
    next: ctx.currentTime + rand(0, 1),
  }));
  s.tick(() => {
    for (const c of crowd) {
      while (c.next < ctx.currentTime + 1.2) {
        for (let i = 0; i < c.pulses; i++) {
          blip(ctx, s.out, c.next + i * c.rate, {
            from: c.pitch, to: c.pitch * 0.985, dur: c.rate * 0.7, amp: c.amp, pan: c.pan,
          });
        }
        c.next += c.every * rand(0.9, 1.1);
      }
    }
  });
  return s;
};
