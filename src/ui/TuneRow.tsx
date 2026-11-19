// TUNE — a simple tuner in the Record panel (Voice.tsx), under the trim,
// while the mic is on. Switched on, it shows the note you're singing or
// playing in the soundscape's key (Sa, Re, Ga… for the key's own notes,
// the plain note names beside them), how many cents sharp or flat, and a
// needle that settles in the middle. "Hear Sa" sounds the Key's Sa as a
// clean tone, to find your note before you begin. (Soundscape Live has the
// fuller tuner, and the overtone fork.)
//
// It reads the mic's analyser about twenty times a second and finds the
// pitch (audio/pitchFind.ts), keeping the middle of the last five readings.
import { useEffect, useRef, useState } from 'react';
import { getEngine } from '../audio/engine.ts';
import { findPitch } from '../audio/pitchFind.ts';
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

export function TuneRow({ keyName }: { keyName: string }) {
  const [on, setOnState] = useState<boolean>(() => readPref('tune.on', false));
  const setOn = (v: boolean) => { setOnState(v); writePref('tune.on', v); };
  const [hz, setHz] = useState<number | null>(null);
  const recent = useRef<number[]>([]);
  const key = KEYS.find((k) => k.name === keyName) ?? KEYS[0];

  useEffect(() => {
    if (!on) { setHz(null); return; }
    const { ctx, voiceAnalyser } = getEngine();
    const buf = new Float32Array(voiceAnalyser.fftSize);
    let raf = 0, last = 0;
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (t - last < 50) return;
      last = t;
      voiceAnalyser.getFloatTimeDomainData(buf);
      const f = findPitch(buf, ctx.sampleRate, 60, 1400);
      if (!f) { if (recent.current.length) { recent.current = []; setHz(null); } return; }
      recent.current = [...recent.current.slice(-4), f.hz];
      const s = [...recent.current].sort((a, b) => a - b);
      setHz(s[Math.floor(s.length / 2)]);
    };
    raf = requestAnimationFrame(tick);
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
          <div className="tune-note">
            <b>{hz ? degree : '—'}</b>
            <span>{hz ? `${NOTES[pc]}${Math.floor(near / 12) - 1} · ${cents > 0 ? '+' : cents < 0 ? '−' : ''}${Math.abs(cents)} ¢` : 'sing or play a note'}</span>
            {inTune && <span className="led led--on" aria-label="In tune" />}
          </div>
          <div className="tune-bar" aria-hidden="true">
            <i className="tune-mid" />
            {hz !== null && <i className={`tune-needle ${inTune ? 'tune-needle--ok' : ''}`} style={{ left: `${50 + Math.max(-50, Math.min(50, cents))}%` }} />}
          </div>
          <div className="tune-ends"><span>flat</span><span>in tune</span><span>sharp</span></div>
        </div>
      )}
    </div>
  );
}
