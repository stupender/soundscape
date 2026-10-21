// AUTO LEVEL — sets the trim from how loud you actually sing.
//
// You press Auto, then sing your loudest phrase for a few seconds. We watch
// the voice's peaks the whole time, ignore the odd click (we take the 97th
// percentile of the peaks, not the single highest), and work out the trim
// that would put your loudest moments at about −10 dBFS: inside the coral
// sweet spot, with room above so a surprise forte doesn't clip.
//
// It sets the trim once and then leaves it alone. It is deliberately NOT an
// automatic gain that keeps adjusting while you sing; that would flatten the
// quiet and loud of a voice, which is the music.
import { getEngine } from './engine.ts';

/** Where the loudest moments should land (dBFS). */
export const TARGET_DB = -10;
/** The trim slider's range, as gain: −12 dB … +18 dB. */
export const TRIM_MIN = 0.25;
export const TRIM_MAX = 8;
/** Quieter than this and we assume nobody sang. */
const SILENCE_DB = -55;

export interface LevelResult {
  /** The trim to use (a gain). */
  trim: number;
  /** What happened, in words for the screen. */
  note: string;
  /** Whether it hit a limit of the slider (too quiet, or too loud). */
  limited: boolean;
}

const toDb = (g: number) => 20 * Math.log10(Math.max(g, 1e-9));

/**
 * Listen for `seconds`, then suggest a trim. `currentTrim` is the trim in use
 * while listening (the meter reads after it), so we divide it back out.
 * `onTick` gets the seconds left, for a countdown.
 */
export function measureTrim(seconds: number, currentTrim: number, onTick: (left: number) => void): Promise<LevelResult> {
  const { voiceAnalyser } = getEngine();
  const data = new Float32Array(voiceAnalyser.fftSize);
  const peaks: number[] = [];
  const start = performance.now();

  return new Promise((resolve) => {
    const step = () => {
      voiceAnalyser.getFloatTimeDomainData(data);
      let peak = 0;
      for (let i = 0; i < data.length; i++) peak = Math.max(peak, Math.abs(data[i]));
      peaks.push(peak);
      const gone = (performance.now() - start) / 1000;
      if (gone < seconds) {
        onTick(Math.ceil(seconds - gone));
        // A timer rather than requestAnimationFrame, so it still runs if the
        // phone dims the screen while you sing.
        window.setTimeout(step, 40);
        return;
      }
      resolve(suggest(peaks, currentTrim));
    };
    step();
  });
}

function suggest(peaks: number[], currentTrim: number): LevelResult {
  const sorted = [...peaks].sort((a, b) => a - b);
  const loud = sorted[Math.floor(sorted.length * 0.97)] ?? 0;
  // The level the mic gives before any trim.
  const rawDb = toDb(loud / currentTrim);
  if (toDb(loud) < SILENCE_DB) {
    return { trim: currentTrim, note: 'Didn’t hear you. Is the right mic chosen under Input?', limited: true };
  }
  const wanted = Math.pow(10, (TARGET_DB - rawDb) / 20);
  const trim = Math.min(TRIM_MAX, Math.max(TRIM_MIN, wanted));
  const dB = Math.round(toDb(trim));
  const set = `Trim set to ${dB > 0 ? '+' : ''}${dB} dB.`;
  if (wanted > TRIM_MAX) {
    return { trim, note: `${set} Still quiet: move closer, or turn up the gain on your mic or interface.`, limited: true };
  }
  if (wanted < TRIM_MIN) {
    return { trim, note: `${set} Still very loud: move back a little, or turn down the gain on your interface.`, limited: true };
  }
  return { trim, note: `${set} Your loudest phrase now peaks around ${TARGET_DB} dB.`, limited: false };
}
