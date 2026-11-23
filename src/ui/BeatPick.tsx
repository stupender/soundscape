// THE BINAURAL TILE'S BEAT — how far apart the two ears' tones are.
//
//   [ Theta · 6 Hz ▾ ]        the choice: five beats, by name and hertz
//   L 293.7 · R 299.7 Hz      the two tones now (the left is the Key's note)
//
// It sits on the tile above the on/off face, like the slider. Choosing a beat
// is remembered on this device; if the tones are sounding, the right ear
// glides to the new beat (audio/binaural.ts).
import { useState } from 'react';
import { BANDS, beatNow, leftHz, setBeat } from '../audio/binaural.ts';
import type { Key } from '../data/keys.ts';

export function BeatPick({ keyNow }: { keyNow: Key }) {
  const [beat, setBeatHere] = useState(beatNow);
  const left = leftHz(keyNow);

  function choose(next: number) {
    setBeatHere(next);
    setBeat(next);
  }

  return (
    <span className="tile-beat">
      <select
        value={beat}
        onChange={(e) => choose(Number(e.target.value))}
        aria-label="Beat: how far apart the two tones are"
        title="Two tones a few hertz apart, one in each ear, heard as a slow pulse. Use headphones."
      >
        {BANDS.map((b) => <option key={b.hz} value={b.hz}>{b.name} · {b.hz} Hz</option>)}
      </select>
      <span className="tile-tones">L {left.toFixed(1)} · R {(left + beat).toFixed(1)} Hz</span>
    </span>
  );
}
