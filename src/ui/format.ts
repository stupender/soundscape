// Small formatting helpers shared by the panels.

/**
 * A level in decibels, as the faders show it: a real minus sign, a plus for
 * boosts, and a fixed number of decimals so the text never changes width
 * while you drag (which made the row jump).
 */
export function dbText(db: number, decimals = 0): string {
  const n = Math.abs(db).toFixed(decimals);
  const zero = Number(n) === 0;
  return `${zero ? '' : db > 0 ? '+' : '−'}${n} dB`;
}
