// THE KEY — one key for the whole room.
//
// On screen it's called the Key, in Western terms. In the code its root note
// is still called `sa` (the Raga Practice Library's word for it), since the
// shruti box and the bell are tuned to it the way a drone is tuned to Sa.
//
// The shruti box, the bell and the Soundscape in 12 Keys all
// follow this one choice, so everything you turn on is already in tune with
// everything else. Pick the key your voice wants and the room retunes around it.
//
// Same idea as the Raga Practice Library's "your Sa": the drones sit in the
// octave below middle C (C3 = 130.81 Hz), comfortable under most voices.

export interface Key {
  /** The name shown on screen. */
  name: string;
  /** Semitones above C (0–11). */
  pc: number;
  /** The key's short name in file names: the Soundscape in 12 Keys is
   *  audio/keys/soundscape-<slug>.mp3, the shruti box audio/shruti/shruti-<slug>.mp3. */
  slug: string;
}

export const KEYS: Key[] = [
  { name: 'C', pc: 0, slug: 'C' },
  { name: 'D♭', pc: 1, slug: 'Db' },
  { name: 'D', pc: 2, slug: 'D' },
  { name: 'E♭', pc: 3, slug: 'Eb' },
  { name: 'E', pc: 4, slug: 'E' },
  { name: 'F', pc: 5, slug: 'F' },
  { name: 'G♭', pc: 6, slug: 'Gb' },
  { name: 'G', pc: 7, slug: 'G' },
  { name: 'A♭', pc: 8, slug: 'Ab' },
  { name: 'A', pc: 9, slug: 'A' },
  { name: 'B♭', pc: 10, slug: 'Bb' },
  { name: 'B', pc: 11, slug: 'B' },
];

const C3 = 130.81;

/** Sa's frequency in Hz for a key (in the octave above C3). */
export function saHz(key: Key): number {
  return C3 * Math.pow(2, key.pc / 12);
}
