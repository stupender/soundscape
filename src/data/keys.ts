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
  /** Which recording in public/audio/keys/ belongs to this key. */
  file: string;
}

export const KEYS: Key[] = [
  { name: 'C', pc: 0, file: 'soundscape-C.mp3' },
  { name: 'D♭', pc: 1, file: 'soundscape-Db.mp3' },
  { name: 'D', pc: 2, file: 'soundscape-D.mp3' },
  { name: 'E♭', pc: 3, file: 'soundscape-Eb.mp3' },
  { name: 'E', pc: 4, file: 'soundscape-E.mp3' },
  { name: 'F', pc: 5, file: 'soundscape-F.mp3' },
  { name: 'G♭', pc: 6, file: 'soundscape-Gb.mp3' },
  { name: 'G', pc: 7, file: 'soundscape-G.mp3' },
  { name: 'A♭', pc: 8, file: 'soundscape-Ab.mp3' },
  { name: 'A', pc: 9, file: 'soundscape-A.mp3' },
  { name: 'B♭', pc: 10, file: 'soundscape-Bb.mp3' },
  { name: 'B', pc: 11, file: 'soundscape-B.mp3' },
];

const C3 = 130.81;

/** Sa's frequency in Hz for a key (in the octave above C3). */
export function saHz(key: Key): number {
  return C3 * Math.pow(2, key.pc / 12);
}

/** A frequency a number of semitones above (or below) Sa. */
export function above(sa: number, semitones: number): number {
  return sa * Math.pow(2, semitones / 12);
}
