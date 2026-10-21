// DRONES — the shruti box and the tanpura, both tuned to the room's Sa.
//
// SHRUTI BOX: a little harmonium with no keys — reeds held open while the
// bellows breathe. Each note is two reeds (sawtooth waves) a few cents apart,
// so they beat slowly against each other the way real reeds do. A slow swell
// on the volume is the bellows; a breath of noise rides with it.
// Notes: low Sa, Sa, Pa, and upper Sa.
//
// TANPURA: carried over from the Raga Practice Library (lib/audio.ts there).
// Four strings — Pa, Sa, Sa, low Sa — plucked in turn, round and round. Each
// pluck is a bright buzz (the jawari) that mellows as it rings.
import { above } from '../data/keys.ts';
import { loopNoise } from './noise.ts';
import { shell, type SoundMaker } from './sound.ts';

/** Shruti box notes, as [semitones from Sa, loudness]. */
const SHRUTI_NOTES: [number, number][] = [[-12, 0.8], [0, 1], [7, 0.75], [12, 0.45]];

export const shrutiBox: SoundMaker = (ctx, env) => {
  const s = shell(ctx);
  const bellows = ctx.createGain();
  bellows.gain.value = 0.8;
  // The bellows: a very slow swell, about one breath every eight seconds.
  const lfo = s.keep(ctx.createOscillator());
  lfo.frequency.value = 0.12;
  const depth = ctx.createGain();
  depth.gain.value = 0.18;
  lfo.connect(depth).connect(bellows.gain);
  lfo.start();

  const tone = ctx.createBiquadFilter();
  tone.type = 'lowpass';
  tone.frequency.value = 1500;
  tone.Q.value = 0.7;
  const body = ctx.createBiquadFilter();
  body.type = 'peaking';
  body.frequency.value = 700;
  body.gain.value = 4;
  tone.connect(body).connect(bellows).connect(s.out);

  const reeds: { osc: OscillatorNode; semis: number }[] = [];
  for (const [semis, loud] of SHRUTI_NOTES) {
    const g = ctx.createGain();
    g.gain.value = loud * 0.05;
    g.connect(tone);
    for (const detune of [-4, 5]) {
      const osc = s.keep(ctx.createOscillator());
      osc.type = 'sawtooth';
      osc.frequency.value = above(env.sa, semis);
      osc.detune.value = detune;
      osc.connect(g);
      osc.start();
      reeds.push({ osc, semis });
    }
  }

  // The breath of air through the reeds.
  const breath = s.keep(loopNoise(ctx, 'pink'));
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 2200;
  const breathGain = ctx.createGain();
  breathGain.gain.value = 0.02;
  breath.connect(hp).connect(breathGain).connect(bellows);

  return {
    ...s,
    retune(sa) {
      const t = ctx.currentTime;
      for (const r of reeds) r.osc.frequency.setTargetAtTime(above(sa, r.semis), t, 0.4);
    },
  };
};

/** One tanpura string: a bright, buzzing attack that mellows as it rings. */
function pluck(ctx: AudioContext, dest: AudioNode, hz: number, when: number) {
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.Q.value = 2.5;
  filter.frequency.setValueAtTime(3200, when);
  filter.frequency.exponentialRampToValueAtTime(700, when + 2.6);
  // The jawari: a resonance high up that gives the tanpura its shimmer.
  const shimmer = ctx.createBiquadFilter();
  shimmer.type = 'peaking';
  shimmer.frequency.value = 1800;
  shimmer.Q.value = 3;
  shimmer.gain.value = 7;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(0.09, when + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.035, when + 1.6);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + 5.2);
  filter.connect(shimmer).connect(gain).connect(dest);
  for (const detune of [-3, 4]) {
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = hz;
    o.detune.value = detune;
    o.connect(filter);
    o.start(when);
    o.stop(when + 5.3);
  }
}

/** The four strings, as semitones from Sa: mandra Pa, Sa, Sa, low Sa. */
const TANPURA_STRINGS = [-5, 0, 0, -12];
const PLUCK_GAP = 1.15; // seconds between strings
const CYCLE = 5.0; // seconds for the whole round

export const tanpura: SoundMaker = (ctx, env) => {
  const s = shell(ctx);
  let sa = env.sa;
  let next = ctx.currentTime + 0.1;
  let string = 0;
  s.tick(() => {
    while (next < ctx.currentTime + 1.5) {
      pluck(ctx, s.out, above(sa, TANPURA_STRINGS[string]), next);
      string = (string + 1) % TANPURA_STRINGS.length;
      next += string === 0 ? CYCLE - PLUCK_GAP * (TANPURA_STRINGS.length - 1) : PLUCK_GAP;
    }
  });
  return {
    ...s,
    retune(newSa) {
      sa = newSa;
    },
  };
};
