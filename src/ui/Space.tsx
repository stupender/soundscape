// SPACE FOR THE VOICE — where the soundscape sits, and where you sit.
//
// A small spectrum: low pitches on the left, high on the right. The soundscape
// is the soft grey hill; your voice is the coral line. Bernie Krause noticed
// that in a healthy habitat each creature finds its own band, or its own
// moment, leaving room for the others (his "niche hypothesis": partly
// supported, still debated). The same goes for a voice over a
// soundscape: if the grey piles up exactly where your coral is, turn down the
// layers that crowd you. A first step toward the spectrograph in ROADMAP.md.
import { useEffect, useRef } from 'react';
import { peekEngine } from '../audio/engine.ts';

const LOW = 60;
const HIGH = 12000;

export function Space({ active }: { active: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const engine = peekEngine();
    const c = canvas.current;
    if (!active || !engine || !c) return;
    const g = c.getContext('2d')!;
    const bedData = new Float32Array(engine.bedAnalyser.frequencyBinCount);
    const voiceData = new Float32Array(engine.voiceAnalyser.frequencyBinCount);
    const rate = engine.ctx.sampleRate;
    const style = getComputedStyle(c);
    const bedColour = style.getPropertyValue('--space-bed').trim() || '#888';
    const voiceColour = style.getPropertyValue('--accent').trim() || 'coral';
    let raf = 0;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = c.clientWidth;
      const h = c.clientHeight;
      if (c.width !== w * dpr) { c.width = w * dpr; c.height = h * dpr; }
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);
      engine.bedAnalyser.getFloatFrequencyData(bedData);
      engine.voiceAnalyser.getFloatFrequencyData(voiceData);

      // x position (0..w) → frequency on a log scale → nearest analyser bin.
      const yAt = (data: Float32Array, x: number) => {
        const f = LOW * Math.pow(HIGH / LOW, x / w);
        const bin = Math.min(data.length - 1, Math.round((f / (rate / 2)) * data.length));
        const db = data[bin];
        const norm = Math.max(0, Math.min(1, (db + 100) / 70));
        return h - norm * h;
      };

      g.beginPath();
      g.moveTo(0, h);
      for (let x = 0; x <= w; x += 2) g.lineTo(x, yAt(bedData, x));
      g.lineTo(w, h);
      g.closePath();
      g.fillStyle = bedColour;
      g.fill();

      g.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const y = yAt(voiceData, x);
        if (x === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.strokeStyle = voiceColour;
      g.lineWidth = 1.5;
      g.stroke();
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  return (
    <figure className="space">
      <canvas ref={canvas} className="space-canvas" aria-label="Soundscape and voice spectrum" />
      <figcaption className="space-caption">
        <span><i className="swatch swatch--bed" /> soundscape</span>
        <span><i className="swatch swatch--voice" /> your voice</span>
        <span className="space-axis">low ··· high</span>
      </figcaption>
    </figure>
  );
}
