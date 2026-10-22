// THE SHRUTI BOX — tuned to the room's key (its root is `sa` in the code).
//
// SHRUTI BOX: a little harmonium with no keys — reeds held open while the
// bellows breathe. Each note is two reeds (sawtooth waves) a few cents apart,
// so they beat slowly against each other the way real reeds do. A slow swell
// on the volume is the bellows; a breath of noise rides with it.
// Notes: low Sa, Sa, Pa, and upper Sa.
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
