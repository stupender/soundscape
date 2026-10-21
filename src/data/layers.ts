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
// To swap a sketched sound for a real field recording later, change `make`
// to `fileSound('audio/ocean.mp3')` and drop the file into public/audio/.
import { birds, crickets } from '../audio/creatures.ts';
import { shrutiBox, tanpura } from '../audio/drones.ts';
import { keysSound } from '../audio/loop.ts';
import { ocean, rain, river, wind } from '../audio/nature.ts';
import type { SoundMaker } from '../audio/sound.ts';

export type IconId =
  | 'birds' | 'crickets' | 'ocean' | 'river' | 'rain' | 'wind'
  | 'shruti' | 'tanpura' | 'keys' | 'upload';

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
  { id: 'keys', name: 'Soundscape', note: 'in 12 keys · Point Reyes', icon: 'keys', tint: 'var(--night)', make: keysSound, gain: 1, pitched: true, image: 'images/point-reyes.jpg' },
  { id: 'shruti', name: 'Shruti box', note: 'Sa · Pa · Sa', icon: 'shruti', tint: 'var(--clay)', make: shrutiBox, gain: 0.9, pitched: true },
  { id: 'tanpura', name: 'Tanpura', note: 'Pa · Sa · Sa · Sa', icon: 'tanpura', tint: 'var(--timber)', make: tanpura, gain: 1.2, pitched: true },
  { id: 'birds', name: 'Birds', note: 'morning', icon: 'birds', tint: 'var(--sage)', make: birds, gain: 0.9 },
  { id: 'crickets', name: 'Crickets', note: 'evening', icon: 'crickets', tint: 'var(--lav)', make: crickets, gain: 1 },
  { id: 'ocean', name: 'Ocean', note: 'waves arriving', icon: 'ocean', tint: 'var(--slate)', make: ocean, gain: 0.8 },
  { id: 'river', name: 'River', note: 'over stones', icon: 'river', tint: 'var(--riso-blue)', make: river, gain: 0.5 },
  { id: 'rain', name: 'Rain', note: 'on leaves', icon: 'rain', tint: 'var(--slate)', make: rain, gain: 0.6 },
  { id: 'wind', name: 'Wind', note: 'in the open', icon: 'wind', tint: 'var(--muted-tint)', make: wind, gain: 0.7 },
];

/** A preset turns on a few layers at chosen levels (0–1). */
export interface Preset {
  name: string;
  layers: Record<string, number>;
}

export const PRESETS: Preset[] = [
  { name: 'Dawn', layers: { birds: 0.7, river: 0.45, shruti: 0.45 } },
  { name: 'Dusk', layers: { crickets: 0.7, tanpura: 0.6, wind: 0.25 } },
  { name: 'Shore', layers: { ocean: 0.75, keys: 0.6 } },
  { name: 'Rain room', layers: { rain: 0.65, shruti: 0.5 } },
  { name: 'Practice', layers: { tanpura: 0.8, shruti: 0.35 } },
];
