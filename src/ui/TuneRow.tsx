// TUNE — a simple tuner in the Record panel (Voice.tsx), a ruled row under
// Input and Output, always there. Switched on (with the mic on), it shows the note you're singing or
// playing in the soundscape's key (Sa, Re, Ga… for the key's own notes,
// the plain note names beside them), how many cents sharp or flat, and a
// needle that settles in the middle. "Hear Sa" sounds the Key's Sa as a
// clean tone, to find your note before you begin. (Soundscape Live has the
// fuller tuner, and the overtone fork.)
//
// It follows the pitch steadily (audio/pitchTrack.ts: it glides, ignores
// stray readings and octave slips, and holds a fading note a moment). The
// needle eases there every frame; the words change ten times a second.
// Within five cents, the note and the needle turn green.
import { useEffect, useRef, useState } from 'react';
import { getEngine } from '../audio/engine.ts';
import { trackPitch } from '../audio/pitchTrack.ts';
import { KEYS, saHz } from '../data/keys.ts';
import { readPref, writePref } from '../store/prefs.ts';

const NOTES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
/** The twelve places above Sa (lowercase: komal; Ma♯: tivra). */
const SARGAM = ['Sa', 're', 'Re', 'ga', 'Ga', 'Ma', 'Ma♯', 'Pa', 'dha', 'Dha', 'ni', 'Ni'];

/** A short, clean tone (a sine, fading), for "Hear Sa". */
function hearTone(hz: number) {
  const { ctx, bed } = getEngine();
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.frequency.value = hz;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.2, t + 0.05);
  g.gain.exponentialRampToValueAtTime(0.001, t + 2.5);
  o.connect(g).connect(bed);
  o.start(t);
  o.stop(t + 2.6);
}

export function TuneRow({ keyName, micOn }: { keyName: string; micOn: boolean }) {
  const [on, setOnState] = useState<boolean>(() => readPref('tune.on', false));
  const setOn = (v: boolean) => { setOnState(v); writePref('tune.on', v); };
  const [hz, setHz] = useState<number | null>(null);
  const live = useRef<number | null>(null);
  const needle = useRef<HTMLElement>(null);
  const key = KEYS.find((k) => k.name === keyName) ?? KEYS[0];

  // Follow the pitch while it's on and the mic is open.
  useEffect(() => {
    if (!on || !micOn) { live.current = null; setHz(null); return; }
    const { ctx, voiceAnalyser } = getEngine();
    let shownAt = 0, had = false;
    return trackPitch(voiceAnalyser, ctx.sampleRate, (f) => {
      live.current = f;
      const t = performance.now();
      if (t - shownAt > 100 || (f !== null) !== had) { shownAt = t; had = f !== null; setHz(f); }
    }, 60, 1400);
  }, [on, micOn]);

  // The needle eases toward where you are, every frame.
  useEffect(() => {
    if (!on) return;
    let raf = 0, at = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const el = needle.current, f = live.current;
      if (!el) return;
      if (f === null) { el.style.opacity = '0'; return; }
      const m = 69 + 12 * Math.log2(f / 440);
      const c = Math.max(-50, Math.min(50, (m - Math.round(m)) * 100));
      at += (c - at) * 0.25;
      el.style.opacity = '1';
      el.style.left = `${50 + at}%`;
      el.classList.toggle('tune-needle--ok', Math.abs(c) <= 5);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [on]);

  // The nearest note (A = 440), its place above the Key's Sa, and the cents off.
  const midi = hz ? 69 + 12 * Math.log2(hz / 440) : 0;
  const near = Math.round(midi);
  const cents = hz ? Math.round((midi - near) * 100) : 0;
  const pc = ((near % 12) + 12) % 12;
  const degree = SARGAM[(pc - key.pc + 12) % 12];
  const inTune = hz !== null && Math.abs(cents) <= 5;

  return (
    <div className="tune-row">
      <div className="io-row">
        <span className="label">Tune</span>
        <span className="tune-switch">
          <button className={`btn btn--small ${on ? 'btn--on' : ''}`} onClick={() => setOn(!on)} aria-pressed={on}>{on ? 'On' : 'Off'}</button>
          <span className="io-hint">Sa = {key.name}</span>
        </span>
        <span className="io-end"><button className="text-btn" onClick={() => hearTone(saHz(key))}>Hear Sa</button></span>
      </div>
      {on && (
        <div className="tune-read" aria-live="polite">
          <div className={`tune-note ${inTune ? 'tune-note--ok' : ''}`}>
            <b>{hz ? degree : '—'}</b>
            <span>{hz ? `${NOTES[pc]}${Math.floor(near / 12) - 1} · ${cents > 0 ? '+' : cents < 0 ? '−' : ''}${Math.abs(cents)} ¢` : micOn ? 'sing or play a note' : 'turn the mic on (Input, above)'}</span>
            {inTune && <span className="led led--tune" aria-label="In tune" />}
          </div>
          <div className="tune-bar" aria-hidden="true">
            <i className="tune-mid" />
            <i ref={needle} className="tune-needle" style={{ opacity: 0 }} />
          </div>
          <div className="tune-ends"><span>flat</span><span>in tune</span><span>sharp</span></div>
        </div>
      )}
    </div>
  );
}
