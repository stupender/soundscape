// THE TOP BAR — the wordmark, the key (Sa), the session timer, and Tips.
import { useEffect, useState } from 'react';
import { KEYS, type Key } from '../data/keys.ts';
import { endSession, onSession, startSession, type SessionState } from '../audio/session.ts';
import { ThemeSwitch } from './ThemeSwitch.tsx';

interface Props {
  keyNow: Key;
  setKey: (k: Key) => void;
  sa: () => number;
  openTips: () => void;
  /** Is any soundscape layer sounding? (The mark's orbs move while it is.) */
  playing: boolean;
}

const LENGTHS = [5, 10, 20, 30];
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export function Header({ keyNow, setKey, sa, openTips, playing }: Props) {
  const [session, setSession] = useState<SessionState>({ running: false, total: 0, elapsed: 0 });
  const [picking, setPicking] = useState(false);
  useEffect(() => onSession(setSession), []);

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
          <h1>Soundscape</h1>
          <span className="subtitle">Being Sound Studio</span>
        </div>
      </div>

      <div className="topbar-controls">
        <label className="key-pick" title="Sa: the shruti box, tanpura, bell and Soundscape in 12 Keys all follow it">
          <span className="label">Sa</span>
          <select value={keyNow.name} onChange={(e) => setKey(KEYS.find((k) => k.name === e.target.value)!)}>
            {KEYS.map((k) => <option key={k.name} value={k.name}>{k.name}</option>)}
          </select>
        </label>

        {session.running ? (
          <button className="chip chip--on" onClick={() => endSession(true)} title="End the session early">
            <span className="led led--on" /> {clock(Math.max(session.total - session.elapsed, 0))} · end
          </button>
        ) : picking ? (
          <span className="session-pick" role="group" aria-label="Session length">
            {LENGTHS.map((m) => (
              <button key={m} className="chip" onClick={() => { setPicking(false); startSession(m, sa); }}>{m}′</button>
            ))}
            <button className="text-btn" onClick={() => setPicking(false)}>×</button>
          </span>
        ) : (
          <button className="chip" onClick={() => setPicking(true)} title="A bell to open, the soundscape beneath, three bells to close">
            Session
          </button>
        )}

        <button className="chip" onClick={openTips}>Tips</button>
        <ThemeSwitch />
      </div>
    </header>
  );
}
