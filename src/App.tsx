// THE APP — holds the shared state and lays out the four panels.
//
//   01 Soundscape — what plays under you (left column on a wide screen)
//   02 Voice      — the mic and the record button (right column)
//   03 Takes      — what you've recorded: mix, export, share (right)
//   04 Pads       — Terry's number pad (left, under the soundscape;
//                   hidden for now, see SHOW_PADS)
//
// On a phone they stack: soundscape, voice, takes (then pads).
//
// Shared state here: the key, every layer's on/off and level, your uploads,
// the soundscape level, whether the mic is on, and the list of takes.
import { useCallback, useEffect, useState } from 'react';
import { KEYS, saHz, type Key } from './data/keys.ts';
import type { LayerDef } from './data/layers.ts';
import { retuneLayers } from './audio/layers.ts';
import { listTakes, type Take } from './store/db.ts';
import { readPref, writePref } from './store/prefs.ts';
import { Header } from './ui/Header.tsx';
import { Pads } from './ui/Pads.tsx';
import { Soundscape, type LayerState } from './ui/Soundscape.tsx';
import { Takes } from './ui/Takes.tsx';
import { Tips, guessSection } from './ui/Tips.tsx';
import { Voice } from './ui/Voice.tsx';

// Terry's number pads are built (ui/Pads.tsx, audio/pads.ts) but set aside
// for now to keep V1 simple. Set this to true to bring them back.
const SHOW_PADS = false;

export default function App() {
  const [key, setKeyState] = useState<Key>(() => KEYS.find((k) => k.name === readPref('key', 'D')) ?? KEYS[2]);
  // Levels are remembered; whether a layer is on is not (browsers won't play
  // sound until you tap, so everything starts quiet).
  const [layers, setLayers] = useState<Record<string, LayerState>>(() => {
    const saved = readPref<Record<string, number>>('levels', {});
    return Object.fromEntries(Object.entries(saved).map(([id, level]) => [id, { on: false, level }]));
  });
  const [uploads, setUploads] = useState<LayerDef[]>([]);
  const [master, setMaster] = useState(() => readPref('master', 0.85));
  const [micOn, setMicOn] = useState(false);
  const [takes, setTakes] = useState<Take[]>([]);
  const [openTake, setOpenTake] = useState<string | null>(null);
  const [tips, setTips] = useState<string | null>(null);

  useEffect(() => { listTakes().then(setTakes).catch(() => setTakes([])); }, []);

  useEffect(() => {
    writePref('levels', Object.fromEntries(Object.entries(layers).map(([id, s]) => [id, s.level])));
  }, [layers]);
  useEffect(() => writePref('master', master), [master]);

  function setKey(k: Key) {
    setKeyState(k);
    writePref('key', k.name);
    retuneLayers(k);
  }

  const sa = useCallback(() => saHz(key), [key]);

  function addTake(take: Take) {
    setTakes((p) => [take, ...p]);
    setOpenTake(take.id);
  }

  return (
    <div className="app">
      <Header
        keyNow={key}
        setKey={setKey}
        sa={sa}
        openTips={() => setTips(guessSection())}
        playing={Object.values(layers).some((l) => l.on)}
      />
      <main className="grid">
        <div className="col">
          <Soundscape
            keyNow={key}
            layers={layers}
            setLayers={setLayers}
            uploads={uploads}
            setUploads={setUploads}
            master={master}
            setMaster={setMaster}
          />
          {SHOW_PADS && <Pads micOn={micOn} />}
        </div>
        <div className="col">
          <Voice keyName={key.name} onTake={addTake} onMic={setMicOn} openTips={(s) => setTips(s)} />
          <Takes
            takes={takes}
            openId={openTake}
            setOpenId={setOpenTake}
            onDeleted={(id) => setTakes((p) => p.filter((t) => t.id !== id))}
          />
        </div>
      </main>
      <footer className="foot">
        <div className="foot-line">
          <span>Takes stay on this device. Nothing is uploaded.</span>
          <a href="https://beingsound.studio">beingsound.studio</a>
        </div>
      </footer>
      {tips && <Tips section={tips} setSection={setTips} onClose={() => setTips(null)} />}
    </div>
  );
}
