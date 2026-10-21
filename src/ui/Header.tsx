// THE TOP BAR — the wordmark, the key (Sa), the session timer, and Tips.
import { useEffect, useState } from 'react';
import { KEYS, type Key } from '../data/keys.ts';
import { endSession, onSession, startSession, type SessionState } from '../audio/session.ts';

interface Props {
  keyNow: Key;
  setKey: (k: Key) => void;
  sa: () => number;
  openTips: () => void;
}

const LENGTHS = [5, 10, 20, 30];
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export function Header({ keyNow, setKey, sa, openTips }: Props) {
  const [session, setSession] = useState<SessionState>({ running: false, total: 0, elapsed: 0 });
  const [picking, setPicking] = useState(false);
  useEffect(() => onSession(setSession), []);

  return (
    <header className="topbar">
      <div className="wordmark">
        <svg className="mark" viewBox="0 0 48 48" aria-hidden="true">
          <circle cx="24" cy="24" r="4" /><circle cx="24" cy="24" r="11" /><circle cx="24" cy="24" r="18" />
        </svg>
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
      </div>
    </header>
  );
}
