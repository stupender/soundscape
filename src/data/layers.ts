// THE LAYERS — what you can turn on under your voice. This file is DATA.
//
// Adding a layer is adding an entry here. Each one names:
//   id       — a short stable name (saved in your settings and in each take)
//   name     — what the tile says
//   icon     — which drawing in ui/Icons.tsx
//   tint     — the tile's colour when it's on (a CSS colour token)
//   make     — what makes the sound: a generator in audio/, or a recording
//   gain     — how loud it is at full slider, so every layer sits at about
//              the same level when you first turn it on
//   pitched  — true if it follows the key
//
// THE SHRUTI BOX is Alex Xander Jacobs's "Shruti Box Drone All 12 Tones"
// (musicforspiritualpractice.bandcamp.com), used with his permission and
// credited on the card itself (its `note`): one 2½-minute excerpt per key,
// levelled to −18 LUFS, so it follows the Key like the Soundscape in 12 Keys.
// For now: Stu will replace it with his own shruti box recordings (same file
// names in public/audio/shruti/, nothing else changes).
//
// THE FIELD RECORDINGS are Stu's own (Sound Collection/Field Recordings),
// cut to a few minutes each and levelled to the same loudness (−18 LUFS) so
// they sit together; they loop with a crossfade. How they were cut is in
// MAINTENANCE.md. To add another: drop an MP3 into public/audio/field/ and
// add an entry with `make: fileSound('audio/field/name.mp3')`.
import { fileSound, keyedSound } from '../audio/loop.ts';
import type { SoundMaker } from '../audio/sound.ts';

export type IconId =
  | 'birds' | 'crickets' | 'ocean' | 'river' | 'storm'
  | 'shruti' | 'keys' | 'upload';

export interface LayerDef {
  id: string;
  name: string;
  /** One line under the name. */
  note: string;
  icon: IconId;
  tint: string;
  make: SoundMaker;
  gain: number;
  pitched?: boolean;
  /** A picture for the tile instead of a tint (in public/images/). */
  image?: string;
}

export const LAYERS: LayerDef[] = [
  { id: 'keys', name: 'Soundscape', note: 'in 12 keys · Point Reyes', icon: 'keys', tint: 'var(--night)', make: keyedSound((k) => `audio/keys/soundscape-${k.slug}.mp3`), gain: 1, pitched: true, image: 'images/point-reyes.jpg' },
  { id: 'shruti', name: 'Shruti box', note: 'Alex Xander Jacobs', icon: 'shruti', tint: 'var(--clay)', make: keyedSound((k) => `audio/shruti/shruti-${k.slug}.mp3`), gain: 1, pitched: true },
  { id: 'birds', name: 'Morning birds', note: 'Pennsylvania', icon: 'birds', tint: 'var(--sage)', make: fileSound('audio/field/birds-pennsylvania.mp3'), gain: 1 },
  { id: 'crickets', name: 'Evening crickets', note: 'Serenity Ridge, Virginia', icon: 'crickets', tint: 'var(--lav)', make: fileSound('audio/field/crickets-virginia.mp3'), gain: 1 },
  { id: 'ocean', name: 'Pacific Ocean', note: 'Monterey coast, Carmel', icon: 'ocean', tint: 'var(--slate)', make: fileSound('audio/field/ocean-monterey.mp3'), gain: 1 },
  { id: 'river', name: 'River', note: 'stone waterfall, Virginia', icon: 'river', tint: 'var(--riso-blue)', make: fileSound('audio/field/waterfall-virginia.mp3'), gain: 1 },
  { id: 'storm', name: 'Thunderstorm', note: 'Illinois', icon: 'storm', tint: 'var(--night)', make: fileSound('audio/field/thunderstorm-illinois.mp3'), gain: 1.25 },
];

/** A preset turns on a few layers at chosen levels (0–1). */
export interface Preset {
  name: string;
  layers: Record<string, number>;
}

export const PRESETS: Preset[] = [
  { name: 'Dawn', layers: { birds: 0.7, river: 0.45, shruti: 0.45 } },
  { name: 'Dusk', layers: { crickets: 0.7, keys: 0.4 } },
  { name: 'Shore', layers: { ocean: 0.75, keys: 0.6 } },
  { name: 'Storm', layers: { storm: 0.65, shruti: 0.45 } },
  { name: 'Practice', layers: { shruti: 0.7 } },
];
