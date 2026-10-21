// 01 SOUNDSCAPE — the tiles. Tap a tile to bring a layer in; its slider sets
// how loud. Presets turn on a few at once. "Add your own" loops any audio file
// from your device as another layer.
//
// The layer state (on/off and level for each) lives in App.tsx; this panel
// shows it and asks the audio side (audio/layers.ts) to follow.
import { useRef, useState } from 'react';
import { LAYERS, PRESETS, type LayerDef } from '../data/layers.ts';
import { getEngine, glide } from '../audio/engine.ts';
import { startLayer, stopLayer, setLayerLevel } from '../audio/layers.ts';
import { uploadSound } from '../audio/loop.ts';
import type { Key } from '../data/keys.ts';
import { LayerIcon } from './Icons.tsx';

export interface LayerState {
  on: boolean;
  level: number;
}

interface Props {
  keyNow: Key;
  layers: Record<string, LayerState>;
  setLayers: (fn: (prev: Record<string, LayerState>) => Record<string, LayerState>) => void;
  uploads: LayerDef[];
  setUploads: (fn: (prev: LayerDef[]) => LayerDef[]) => void;
  master: number;
  setMaster: (v: number) => void;
}

export function Soundscape({ keyNow, layers, setLayers, uploads, setUploads, master, setMaster }: Props) {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const all = [...LAYERS, ...uploads];

  const stateOf = (id: string): LayerState => layers[id] ?? { on: false, level: 0.6 };

  async function turnOn(def: LayerDef, level: number) {
    setError('');
    const engine = getEngine();
    if (!anyOn) engine.level.gain.value = master * master;
    setLayers((p) => ({ ...p, [def.id]: { on: true, level } }));
    setLoading((p) => ({ ...p, [def.id]: true }));
    try {
      await startLayer(def, level, keyNow);
    } catch {
      setError(`Couldn't start ${def.name}.`);
      setLayers((p) => ({ ...p, [def.id]: { ...stateOf(def.id), on: false } }));
    } finally {
      setLoading((p) => ({ ...p, [def.id]: false }));
    }
  }

  function turnOff(id: string) {
    stopLayer(id);
    setLayers((p) => ({ ...p, [id]: { ...stateOf(id), on: false } }));
  }

  function toggle(def: LayerDef) {
    const s = stateOf(def.id);
    if (s.on) turnOff(def.id);
    else void turnOn(def, s.level);
  }

  function setLevel(id: string, level: number) {
    setLayers((p) => ({ ...p, [id]: { ...stateOf(id), level } }));
    setLayerLevel(id, level);
  }

  function applyPreset(layersWanted: Record<string, number>) {
    for (const def of all) {
      const want = layersWanted[def.id];
      if (want === undefined && stateOf(def.id).on) turnOff(def.id);
    }
    for (const def of LAYERS) {
      const want = layersWanted[def.id];
      if (want === undefined) continue;
      if (stateOf(def.id).on) setLevel(def.id, want);
      else void turnOn(def, want);
    }
  }

  function hush() {
    for (const def of all) if (stateOf(def.id).on) turnOff(def.id);
  }

  function addFiles(files: FileList | null) {
    if (!files) return;
    const added: LayerDef[] = [...files].map((f, i) => ({
      id: `upload-${Date.now()}-${i}`,
      name: f.name.replace(/\.[^.]+$/, ''),
      note: 'your sound',
      icon: 'upload',
      tint: 'var(--accent)',
      make: uploadSound(f),
      gain: 1,
    }));
    setUploads((p) => [...p, ...added]);
  }

  function changeMaster(v: number) {
    setMaster(v);
    glide(getEngine().level.gain, v * v, 0.05);
  }

  const anyOn = all.some((d) => stateOf(d.id).on);

  return (
    <section className="panel" aria-labelledby="soundscape-h">
      <header className="panel-head">
        <span className="panel-num">01</span>
        <h2 id="soundscape-h">Soundscape</h2>
        <span className={`led ${anyOn ? 'led--on' : ''}`} aria-hidden="true" />
        <button className="text-btn" onClick={hush} disabled={!anyOn}>All quiet</button>
      </header>

      <div className="presets" role="group" aria-label="Presets">
        {PRESETS.map((p) => (
          <button key={p.name} className="chip" onClick={() => applyPreset(p.layers)}>
            {p.name}
          </button>
        ))}
      </div>

      <div className="tiles">
        {all.map((def) => {
          const s = stateOf(def.id);
          return (
            <div key={def.id} className={`tile ${s.on ? 'tile--on' : ''}`} style={{ '--tint': def.tint } as React.CSSProperties}>
              <button className="tile-face" onClick={() => toggle(def)} aria-pressed={s.on}>
                {def.image && <img className="tile-img" src={`${import.meta.env.BASE_URL}${def.image}`} alt="" />}
                <span className="tile-icon"><LayerIcon id={def.icon} /></span>
                <span className="tile-name">{def.name}</span>
                <span className="tile-note">
                  {loading[def.id] ? 'loading…' : def.pitched ? `${def.note} · ${keyNow.name}` : def.note}
                </span>
                <span className={`led tile-led ${s.on ? 'led--on' : ''}`} aria-hidden="true" />
              </button>
              <input
                type="range" min={0} max={1} step={0.01} value={s.level}
                onChange={(e) => setLevel(def.id, Number(e.target.value))}
                aria-label={`${def.name} level`}
                className="slider tile-slider"
              />
            </div>
          );
        })}
        <button className="tile tile--add" onClick={() => fileInput.current?.click()}>
          <span className="tile-icon"><LayerIcon id="upload" /></span>
          <span className="tile-name">Add your own</span>
          <span className="tile-note">any audio file, looped</span>
        </button>
        <input ref={fileInput} type="file" accept="audio/*" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
      </div>

      {error && <p className="error">{error}</p>}

      <label className="fader-row">
        <span className="label">Soundscape level</span>
        <input type="range" min={0} max={1} step={0.01} value={master} onChange={(e) => changeMaster(Number(e.target.value))} className="slider" />
      </label>
    </section>
  );
}
