// 04 PADS — Uncle Terry's number pad.
//
// Hold an empty pad (or its number key) to record; let go to keep it.
// Press a full pad to hear it back. Shift + number, or Erase then a tap, to
// empty one. Works with the number row and with a keyboard's number pad.
//
// Touch: pointer events, so a finger held on a pad records until it lifts,
// even if it slides off the edge a little.
import { useEffect, useReducer, useState } from 'react';
import { PAD_ORDER, erasePad, eraseAllPads, getPads, onPads, pressPad, releasePad } from '../audio/pads.ts';

export function Pads({ micOn }: { micOn: boolean }) {
  const [, redraw] = useReducer((n: number) => n + 1, 0);
  const [erasing, setErasing] = useState(false);
  useEffect(() => onPads(redraw), []);
  const pads = getPads();
  const anyFull = pads.some((p) => p.buffer);

  // Keys 0–9 (top row or number pad). Holding a key repeats keydown; ignore repeats.
  useEffect(() => {
    const digit = (e: KeyboardEvent) => {
      const m = /^(?:Digit|Numpad)(\d)$/.exec(e.code);
      return m ? Number(m[1]) : null;
    };
    const down = (e: KeyboardEvent) => {
      const n = digit(e);
      if (n === null || e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target instanceof Element && e.target.closest('input[type=text], textarea, select, [contenteditable]')) return;
      e.preventDefault();
      if (e.shiftKey) erasePad(n);
      else pressPad(n);
    };
    const up = (e: KeyboardEvent) => {
      const n = digit(e);
      if (n !== null) void releasePad(n);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  function down(n: number, e: React.PointerEvent) {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    if (erasing) { erasePad(n); return; }
    pressPad(n);
  }

  return (
    <section className="panel" aria-labelledby="pads-h">
      <header className="panel-head">
        <span className="panel-num">04</span>
        <h2 id="pads-h">Pads</h2>
        <span className="panel-credit">after Terry's patch</span>
        <button className={`text-btn ${erasing ? 'text-btn--on' : ''}`} onClick={() => setErasing(!erasing)} disabled={!anyFull && !erasing} aria-pressed={erasing}>
          Erase
        </button>
        <button className="text-btn" onClick={eraseAllPads} disabled={!anyFull}>Clear all</button>
      </header>

      <div className={`pads ${micOn ? '' : 'pads--off'} ${erasing ? 'pads--erasing' : ''}`}>
        {PAD_ORDER.map((n) => {
          const p = pads[n];
          const state = p.recording ? 'rec' : p.playing ? 'play' : p.buffer ? 'full' : 'empty';
          return (
            <button
              key={n}
              className={`pad pad--${state} ${n === 0 ? 'pad--zero' : ''}`}
              onPointerDown={(e) => down(n, e)}
              onPointerUp={() => void releasePad(n)}
              onPointerCancel={() => void releasePad(n)}
              onContextMenu={(e) => e.preventDefault()}
              disabled={!micOn && !p.buffer}
              aria-label={`Pad ${n}: ${state === 'empty' ? 'hold to record' : state === 'rec' ? 'recording' : 'press to play'}`}
            >
              <span className="pad-num">{n}</span>
              {p.buffer && <span className="pad-len">{p.buffer.duration.toFixed(1)}s</span>}
            </button>
          );
        })}
      </div>
      <p className="quiet pads-help">
        {micOn
          ? erasing ? 'Tap a pad to empty it.' : 'Hold an empty pad (or its number key) to record. Press it again to play. Shift + number empties it.'
          : 'Turn on the mic to record into the pads.'}
      </p>
    </section>
  );
}
