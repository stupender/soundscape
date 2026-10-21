// SESSION — a timed sit, chosen from a dropdown in the top bar.
//
// Pick 5, 10, 20 or 30 minutes and it begins: a bell, the soundscape rising
// beneath it, and three bells to close (audio/session.ts). "Custom…" opens a
// small field for any length from 1 to 180 minutes; the last custom length is
// remembered. While a session runs, the dropdown becomes the time left, and
// pressing it ends the session early with a single bell.
import { useEffect, useState } from 'react';
import { endSession, onSession, startSession, type SessionState } from '../audio/session.ts';
import { readPref, writePref } from '../store/prefs.ts';

const LENGTHS = [5, 10, 20, 30];
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export function SessionPicker({ sa }: { sa: () => number }) {
  const [session, setSession] = useState<SessionState>({ running: false, total: 0, elapsed: 0 });
  const [custom, setCustom] = useState(false);
  const [minutes, setMinutes] = useState(() => String(readPref('session.custom', 15)));
  useEffect(() => onSession(setSession), []);

  function begin(m: number) {
    setCustom(false);
    startSession(m, sa);
  }

  function beginCustom(e: React.FormEvent) {
    e.preventDefault();
    const m = Math.round(Number(minutes));
    if (!Number.isFinite(m) || m < 1 || m > 180) return;
    writePref('session.custom', m);
    begin(m);
  }

  if (session.running) {
    return (
      <button className="chip chip--on" onClick={() => endSession(true)} title="End the session early">
        <span className="led led--on" /> {clock(Math.max(session.total - session.elapsed, 0))} · end
      </button>
    );
  }

  if (custom) {
    return (
      <form className="session-custom" onSubmit={beginCustom}>
        <span className="label">Session</span>
        <input
          className="num-field"
          type="number" inputMode="numeric" min={1} max={180} step={1}
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          aria-label="Session length in minutes"
          autoFocus
        />
        <span className="label">min</span>
        <button className="btn btn--primary btn--small" type="submit">Start</button>
        <button className="text-btn" type="button" onClick={() => setCustom(false)} aria-label="Cancel">×</button>
      </form>
    );
  }

  return (
    <label className="session-pick" title="A bell to open, the soundscape beneath, three bells to close">
      <span className="label">Session</span>
      <select
        value=""
        onChange={(e) => {
          if (e.target.value === 'custom') setCustom(true);
          else if (e.target.value) begin(Number(e.target.value));
        }}
      >
        <option value="" disabled>Off</option>
        {LENGTHS.map((m) => <option key={m} value={m}>{m} min</option>)}
        <option value="custom">Custom…</option>
      </select>
    </label>
  );
}
