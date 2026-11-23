// BINAURAL — two steady tones, one in each ear, a few hertz apart.
//
// Ported from Soundscape Live's binaural pair (its audio/binaural.ts):
//
//   left ear   the Key's note, in the octave nearest 256 Hz (D: 293.7 Hz)
//   right ear  the left tone plus the beat (6 Hz: 299.7 Hz)
//
// When the Key moves, both tones glide to their new pitches together, so the
// difference between the ears (the beat) stays exactly the same.
//
// Live plays John Beaulieu's sine-tone files. Those aren't ours to put on a
// public website, so here the two tones are made by the browser itself: one
// OscillatorNode per ear, a pure sine, the same sound those files hold.
//
// The choice is five beats under their usual names, Delta, Theta, Alpha, Beta
// and Gamma, each at the hertz Live starts that band on. The names are only
// names for frequencies: nothing on screen says what they do (RESEARCH.md,
// "Claims the app must not make"). It needs headphones: on a speaker the two
// ears mix.
import type { Key } from '../data/keys.ts';
import { readPref, writePref } from '../store/prefs.ts';
import type { Sound, SoundMaker } from './sound.ts';

/** The beats you can choose: a name and its beat in hertz. */
export const BANDS = [
  { name: 'Delta', hz: 2 },
  { name: 'Theta', hz: 6 },
  { name: 'Alpha', hz: 10 },
  { name: 'Beta', hz: 14 },
  { name: 'Gamma', hz: 40 },
];
const BEATS = BANDS.map((b) => b.hz);

/** The beat a first visit starts on. */
const FIRST_BEAT = 6;

/** How loud each ear's tone is (a pure tone is piercing, so quieter than the recordings). */
const TONE_LEVEL = 0.1;

/** The left tone for a key: its note in the octave nearest 256 Hz. */
export function leftHz(key: Key): number {
  const c = 261.63 * Math.pow(2, key.pc / 12); // the note above middle C
  return c / 256 > Math.SQRT2 ? c / 2 : c;
}

// ── The beat you chose, remembered on this device ─────────────────────
let beat: number = readPref('binauralBeat', FIRST_BEAT);
if (!BEATS.includes(beat)) beat = FIRST_BEAT;

/** The beat now. */
export const beatNow = () => beat;

/** What's sounding, if the tile is on: so a new beat can reach it. */
let playing: { setBeat(next: number): void } | null = null;

/** Choose a beat. If the tones are sounding, the right ear glides to it. */
export function setBeat(next: number): void {
  if (!BEATS.includes(next)) return;
  beat = next;
  writePref('binauralBeat', next);
  playing?.setBeat(next);
}

// ── The sound ─────────────────────────────────────────────────────────
/** The two tones: left following the Key, right the beat above it. */
export function binauralSound(): SoundMaker {
  return (ctx, env) => {
    let key = env.key;
    const out = ctx.createGain();
    out.gain.value = TONE_LEVEL;
    // A merger has one input per channel: input 0 is the left ear, 1 the right.
    const merge = ctx.createChannelMerger(2);
    merge.connect(out);

    const ear = (channel: 0 | 1, hz: number) => {
      const osc = ctx.createOscillator(); // a sine, unless told otherwise
      osc.frequency.value = hz;
      osc.connect(merge, 0, channel);
      osc.start();
      return osc;
    };
    const left = ear(0, leftHz(key));
    const right = ear(1, leftHz(key) + beat);

    // Glide both ears with the same time constant from the same moment, so
    // the difference between them is the beat all the way through the glide.
    const glideTo = (seconds: number) => {
      const t = ctx.currentTime;
      left.frequency.setTargetAtTime(leftHz(key), t, seconds);
      right.frequency.setTargetAtTime(leftHz(key) + beat, t, seconds);
    };

    const me = { setBeat: () => glideTo(0.4) };
    playing = me;

    const sound: Sound = {
      out,
      // The Key moved: both ears glide to their new pitches; the beat stays.
      retune(_sa, k) {
        key = k;
        glideTo(0.3);
      },
      stop() {
        // (A tile turned off and quickly on again: the new tones are already
        // `playing` by the time the old ones finish fading, so leave them be.)
        if (playing === me) playing = null;
        for (const osc of [left, right]) {
          try { osc.stop(); } catch { /* already stopped */ }
          osc.disconnect();
        }
        merge.disconnect();
        out.disconnect();
      },
    };
    return sound;
  };
}
