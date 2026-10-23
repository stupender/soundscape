// PRESETS — a few layers at chosen levels, turned on together. Yours to edit.
//
//   Tap a preset      → its layers come in at its levels (others fade out).
//   +                 → save what's playing now as a new preset, with a name.
//   Edit              → each preset can be renamed, updated to what's playing
//                       now, or deleted (two taps, so nothing goes by accident).
//                       "Reset" brings back the starting set.
//
// Presets are kept on this device (localStorage, via store/prefs.ts), starting
// from the ones in data/layers.ts. Your own uploaded sounds aren't saved in a
// preset, because they aren't kept between visits.
import { useState } from 'react';
import { PRESETS, type Preset } from '../data/layers.ts';
import { readPref, writePref } from '../store/prefs.ts';

interface Props {
  /** What's playing now: layer id → level (built-in layers only). */
  current: () => Record<string, number>;
  apply: (layers: Record<string, number>) => void;
}

export function Presets({ current, apply }: Props) {
  const [presets, setPresetsState] = useState<Preset[]>(() => readPref('presets', PRESETS));
  const [editing, setEditing] = useState(false);
  const [naming, setNaming] = useState<string | null>(null); // the new preset's name, while typing
  const [confirming, setConfirming] = useState<number | null>(null); // which one asked "delete?"

  function save(next: Preset[]) {
    setPresetsState(next);
    writePref('presets', next);
  }

  const nothingPlaying = () => Object.keys(current()).length === 0;

  function addPreset(e: React.FormEvent) {
    e.preventDefault();
    const name = (naming ?? '').trim();
    if (!name || nothingPlaying()) return;
    save([...presets, { name, layers: current() }]);
    setNaming(null);
  }

  function rename(i: number, name: string) {
    save(presets.map((p, j) => (j === i ? { ...p, name } : p)));
  }

  function update(i: number) {
    if (nothingPlaying()) return;
    save(presets.map((p, j) => (j === i ? { ...p, layers: current() } : p)));
  }

  function remove(i: number) {
    if (confirming !== i) { setConfirming(i); return; }
    save(presets.filter((_, j) => j !== i));
    setConfirming(null);
  }

  if (editing) {
    return (
      <div className="presets presets--editing" role="group" aria-label="Edit presets">
        {presets.map((p, i) => (
          <div key={i} className="preset-edit">
            <input
              className="line-field"
              value={p.name}
              onChange={(e) => rename(i, e.target.value)}
              aria-label={`Name of preset ${i + 1}`}
            />
            <span className="preset-edit-actions">
              <button className="text-btn" onClick={() => update(i)} title="Replace this preset with what's playing now">
                Update
              </button>
              <button className={`text-btn ${confirming === i ? 'text-btn--danger' : ''}`} onClick={() => remove(i)} onBlur={() => setConfirming(null)}>
                {confirming === i ? 'Delete?' : '×'}
              </button>
            </span>
          </div>
        ))}
        <div className="preset-edit-foot">
          <button className="text-btn" onClick={() => save(PRESETS)}>Reset to the starting set</button>
          <button className="btn btn--primary btn--small" onClick={() => { setEditing(false); setConfirming(null); }}>Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="presets" role="group" aria-label="Presets">
      {presets.map((p, i) => (
        <button key={i} className="chip" onClick={() => apply(p.layers)}>{p.name}</button>
      ))}
      {naming !== null ? (
        <form className="preset-new" onSubmit={addPreset}>
          <input
            className="line-field"
            value={naming}
            onChange={(e) => setNaming(e.target.value)}
            placeholder="Name it"
            aria-label="New preset name"
            autoFocus
          />
          <button className="btn btn--primary btn--small" type="submit" disabled={!naming.trim()}>Save</button>
          <button className="text-btn" type="button" onClick={() => setNaming(null)} aria-label="Cancel">×</button>
        </form>
      ) : (
        <button
          className="chip chip--add"
          onClick={() => setNaming('')}
          disabled={nothingPlaying()}
          title={nothingPlaying() ? 'Turn some layers on first, then save them as a preset' : 'Save what’s playing now as a preset'}
          aria-label="Save what's playing as a preset"
        >
          +
        </button>
      )}
      <button className="text-btn presets-edit" onClick={() => setEditing(true)}>Edit</button>
    </div>
  );
}
