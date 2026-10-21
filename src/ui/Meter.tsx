// THE INPUT METER — how loud the mic is, right now.
//
// Reads the voice analyser about sixty times a second and draws the peak as a
// bar on a decibel scale (−60 to 0 dBFS). The coral zone (−18 to −6) is
// where a voice wants to peak; red means too loud. A peak-hold tick lingers
// for a moment so you can see your loudest phrase.
import { useEffect, useRef } from 'react';
import { peekEngine } from '../audio/engine.ts';

const FLOOR = -60;
const toPct = (db: number) => Math.max(0, Math.min(1, (db - FLOOR) / -FLOOR)) * 100;

export function Meter({ active }: { active: boolean }) {
  const bar = useRef<HTMLDivElement>(null);
  const hold = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!active) return;
    const engine = peekEngine();
    if (!engine) return;
    const data = new Float32Array(engine.voiceAnalyser.fftSize);
    let held = FLOOR;
    let heldAt = 0;
    let raf = 0;
    const draw = () => {
      engine.voiceAnalyser.getFloatTimeDomainData(data);
      let peak = 0;
      for (let i = 0; i < data.length; i++) peak = Math.max(peak, Math.abs(data[i]));
      const db = peak > 0 ? 20 * Math.log10(peak) : FLOOR;
      const now = performance.now();
      if (db > held || now - heldAt > 1500) { held = db; heldAt = now; }
      if (bar.current) {
        bar.current.style.width = `${toPct(db)}%`;
        bar.current.dataset.zone = db > -3 ? 'hot' : db > -18 ? 'sweet' : 'low';
      }
      if (hold.current) hold.current.style.left = `${toPct(held)}%`;
      if (readout.current) readout.current.textContent = held <= FLOOR ? '—' : `${held < 0 ? '−' : ''}${Math.abs(Math.round(held))} dB`;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  return (
    <div className="meter-wrap">
      <div className="meter-head">
        <span className="label">Input level</span>
        <span className="label">Peak <span ref={readout} className="meter-readout">—</span></span>
      </div>
      <div className="meter" role="img" aria-label="Input level">
        <div className="meter-zone" style={{ left: `${toPct(-18)}%`, width: `${toPct(-6) - toPct(-18)}%` }} />
        <div className="meter-zone meter-zone--hot" style={{ left: `${toPct(-3)}%`, right: 0 }} />
        <div ref={bar} className="meter-bar" />
        <div ref={hold} className="meter-hold" />
      </div>
      <div className="meter-scale">
        <span>−60</span><span>−18</span><span>−6</span><span>0</span>
      </div>
    </div>
  );
}
