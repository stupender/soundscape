// THE TOP BAR — the wordmark, the key, the session timer, and Tips.
import { KEYS, type Key } from '../data/keys.ts';
import { SessionPicker } from './SessionPicker.tsx';
import { ThemeSwitch } from './ThemeSwitch.tsx';

interface Props {
  keyNow: Key;
  setKey: (k: Key) => void;
  sa: () => number;
  openTips: () => void;
  /** Is any soundscape layer sounding? (The mark's orbs move while it is.) */
  playing: boolean;
}

export function Header({ keyNow, setKey, sa, openTips, playing }: Props) {
  return (
    <header className="topbar">
      <div className="wordmark">
        {/* The studio mark, as on beingsound.studio. Its orbs circle while the soundscape sounds. */}
        <span className={`mark ${playing ? 'mark--playing' : ''}`} aria-hidden="true">
          <span className="mark-ink" />
          <svg className="mark-orbits" viewBox="0 0 40 40">
            <circle className="ring" cx="20" cy="20" r="14.5" />
            <circle className="ring" cx="20" cy="20" r="18.6" />
            <g className="orb orb1"><circle cx="20" cy="5.5" r="1.9" /></g>
            <g className="orb orb2"><circle cx="20" cy="1.4" r="1.9" /></g>
          </svg>
        </span>
        <div>
          <h1>Soundscape <span className="beta">Beta</span></h1>
          <span className="subtitle">Being Sound Studio</span>
        </div>
      </div>

      <div className="topbar-controls">
        <label className="key-pick" title="The key: the shruti box, the bell and the Soundscape in 12 Keys all follow it">
          <span className="label">Key</span>
          <select value={keyNow.name} onChange={(e) => setKey(KEYS.find((k) => k.name === e.target.value)!)}>
            {KEYS.map((k) => <option key={k.name} value={k.name}>{k.name}</option>)}
          </select>
        </label>

        <SessionPicker sa={sa} />

        <button className="chip" onClick={openTips}>Tips</button>
        <ThemeSwitch />
      </div>
    </header>
  );
}
