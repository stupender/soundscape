// FINDING A PITCH — what note the mic hears, for the Tune row (ui/TuneRow.tsx;
// the same as Soundscape Live's tuner).
// The McLeod method (Philip McLeod, 2005), a standard and small one:
//
//   1. compare the sound with itself shifted by each lag (a "normalised
//      square difference": 1 where it repeats exactly, −1 where it's upside
//      down)
//   2. the first peak that comes near the highest one is the period: the
//      fundamental (later peaks are its multiples; taking the first, with a
//      little room, avoids jumping an octave down)
//   3. a parabola through that peak and its neighbours finds it between
//      samples, so the answer is good to a cent or so
//
// `clarity` (0–1) says how clearly it repeats: a plucked string near 0.95, a
// breath or a room near nothing. Too quiet, or not clear: null.
export interface Found { hz: number; clarity: number }

/** The pitch in `buf` (one channel, at `rate` samples a second), between `lo` and `hi` Hz. */
export function findPitch(buf: Float32Array, rate: number, lo = 50, hi = 1600): Found | null {
  const n = buf.length;
  let power = 0;
  for (let i = 0; i < n; i++) power += buf[i] * buf[i];
  if (Math.sqrt(power / n) < 0.004) return null; // silence
  const minLag = Math.max(2, Math.floor(rate / hi));
  const maxLag = Math.min(n - 2, Math.ceil(rate / lo));
  const nsdf = new Float32Array(maxLag + 2);
  for (let lag = 0; lag <= maxLag + 1; lag++) {
    let acf = 0, m = 0;
    for (let i = 0; i < n - lag; i++) { acf += buf[i] * buf[i + lag]; m += buf[i] * buf[i] + buf[i + lag] * buf[i + lag]; }
    nsdf[lag] = m > 0 ? (2 * acf) / m : 0;
  }
  // The peaks: the highest point of each stretch where the curve is above zero.
  const peaks: number[] = [];
  let lag = minLag;
  while (lag < maxLag && nsdf[lag] > 0) lag++; // past the first hump (lag 0)
  while (lag < maxLag) {
    while (lag < maxLag && nsdf[lag] <= 0) lag++;
    let best = lag;
    while (lag < maxLag && nsdf[lag] > 0) { if (nsdf[lag] > nsdf[best]) best = lag; lag++; }
    if (best < maxLag && nsdf[best] > 0) peaks.push(best);
  }
  if (!peaks.length) return null;
  const top = Math.max(...peaks.map((p) => nsdf[p]));
  const at = peaks.find((p) => nsdf[p] >= 0.9 * top)!;
  // Between samples: the top of a parabola through the peak and its neighbours.
  const a = nsdf[at - 1], b = nsdf[at], c = nsdf[at + 1];
  const shift = (a - c) / (2 * (a - 2 * b + c) || 1);
  const period = at + (Number.isFinite(shift) ? Math.max(-1, Math.min(1, shift)) : 0);
  return b < 0.6 ? null : { hz: rate / period, clarity: b };
}
